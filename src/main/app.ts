import path from "node:path";
import {
  app,
  BrowserWindow,
  IpcMainInvokeEvent,
  session,
  Session,
  WebContents,
} from "electron";
import Browser from "./browser";

const PATHS = {
  PRELOAD: path.join(__dirname, "../build/preload.cjs"),
  INBROWSER: path.join(__dirname, "../build/inbrowser.cjs"),
};

export default class AppWindow {
  session: Session;
  browser: Browser;
  webContents: WebContents;

  constructor() {
    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      frame: false,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        height: 31,
        color: "#39375b",
        symbolColor: "#ffffff",
      },
      webPreferences: {
        preload: PATHS.PRELOAD,
        sandbox: true,
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        contextIsolation: true,
        webSecurity: false,
      },
    });
    const mainContents = (this.webContents = mainWindow.webContents);
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      );
    }
    if (process.env.SHELL_DEBUG) {
      mainContents.openDevTools({ mode: "detach" });
    }

    this.browser = new Browser(mainWindow);

    // The browser window will send these events and then we
    // will forward them to the main UI renderer.
    this.browser.webContents.ipc.on("record-step", this.recordStep.bind(this));
    this.browser.webContents.ipc.on("navigate", this.navigate.bind(this));

    // The main UI sends these events, and we will forward them
    // to the browser window.
    mainContents.ipc.on("set-url", (event, url) => {
      this.browser.navigate(url);
    });

    this.session = session.defaultSession;

    // Remove Electron and App details to closer emulate Chrome's UA
    const userAgent = this.session
      .getUserAgent()
      .replace(/\sElectron\/\S+/, "")
      .replace(new RegExp(`\\s${app.getName()}/\\S+`), "");
    this.session.setUserAgent(userAgent);
  }

  findAttribute(
    attributes: Array<{ name: string; value: string }>,
    name: string,
  ): { name: string; value: string } | undefined {
    return attributes.find((attr) => attr.name === name);
  }

  recordStep(event: IpcMainInvokeEvent, step: any) {
    // First, find the element that we should consider interacted with. This is
    // an element with an ARIA role, either explicit or implicit.
    for (const el of step.stack) {
      console.log("examine stack frame", el);
      let locator = (step.locator = { role: "", name: "" });
      const attrs = el.attributes;
      const roleAttr = this.findAttribute(el.attributes, "role");
      if (roleAttr) {
        locator.role = roleAttr.value;
        locator.name = el.text;
      }
      if (el.name === "a" && this.findAttribute(attrs, "href")) {
        locator.role = "link";
        locator.name = el.text;
        break;
      }
      if (el.name === "button") {
        locator.role = "button";
        locator.name = this.findAttribute(attrs, "aria-label") || el.text;
        break;
      }
      if (el.name === "input") {
        locator.role = "input";
        locator.name = this.findAttribute(attrs, "aria-label") || el.text;
        break;
      }
    }
    this.webContents.send("step", step);
  }

  navigate(event: IpcMainInvokeEvent, url: any) {
    console.log("got navigation", url);
  }
}
