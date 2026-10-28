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
import { BridleEvent } from "../types";

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
    this.browser.webContents.ipc.on("record-event", (_, event: BridleEvent) =>
      this.recordEvent(event),
    );
    this.browser.webContents.on("did-navigate", (_, url: string) =>
      this.updateLocation(url),
    );
    this.browser.webContents.on("did-navigate-in-page", (_, url: string) =>
      this.updateLocation(url),
    );

    // The main UI sends these events, and we will forward them
    // to the browser window.
    mainContents.ipc.on("set-url", (event, url: string) => {
      if (!url.match(/^https?:\/\//)) {
        url = "http://" + url;
      }
      this.recordEvent({
        action: "open",
        url,
      });
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

  recordEvent(event: BridleEvent) {
    if (event.action === "open") {
      this.webContents.send("step", event);
      return;
    }

    if ("stack" in event && event.stack.length) {
      const step = { action: event.action, locator: { role: "", name: "" } };
      // First, find the element that we should consider interacted with. This is
      // an element with an ARIA role, either explicit or implicit.
      for (const el of event.stack) {
        console.log("examine stack frame", el);
        // Find a stack frame that declares a node in the accessibility tree.
        // That is, an element that has a defined role and an accessibility name.
        // XXX TODO: List all the frames that can be targeted so we can allow the user
        // to disambiguate and/or change the frame being tested.
        const attrs = el.attributes;
        const roleAttr = this.findAttribute(el.attributes, "role");
        const labelAttr = this.findAttribute(el.attributes, "aria-label");
        if (roleAttr) {
          step.locator.role = roleAttr.value;
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "a" && this.findAttribute(attrs, "href")) {
          step.locator.role = "link";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "button") {
          step.locator.role = "button";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "input" || el.tagName === "textarea") {
          step.locator.role = "textbox";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "select") {
          step.locator.role = "listbox";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "ul" || el.tagName === "ol") {
          step.locator.role = "list";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "li") {
          step.locator.role = "listitem";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "td") {
          step.locator.role = "cell";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "article") {
          step.locator.role = "article";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "p") {
          step.locator.role = "paragraph";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "aside") {
          step.locator.role = "complementary";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "nav") {
          step.locator.role = "navigation";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "section") {
          step.locator.role = "region";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "form") {
          step.locator.role = "form";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        } else if (el.tagName === "hr") {
          step.locator.role = "separator";
          step.locator.name = labelAttr?.value || el.text;
          console.log("located", step.locator);
          break;
        }
      }
      this.webContents.send("step", step);
    }
  }

  updateLocation(url: string) {
    this.webContents.send("location", url);
  }
}
