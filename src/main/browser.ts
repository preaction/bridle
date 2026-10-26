import path from "node:path";
import {
  BrowserWindow,
  HeadersReceivedResponse,
  OnHeadersReceivedListenerDetails,
  WebContents,
  WebContentsView,
} from "electron";

// https://www.electronforge.io/config/plugins/webpack#main-process-code
const PATHS = {
  PRELOAD: path.join(__dirname, "../build/preload.cjs"),
  INBROWSER: path.join(__dirname, "../build/inbrowser.cjs"),
};

const toolbarHeight = 64;
const stepbarWidth = 240;

export default class Browser {
  window: BrowserWindow;
  view: WebContentsView;
  webContents: WebContents;
  destroyed: boolean = false;

  constructor(parentWindow: BrowserWindow) {
    this.window = parentWindow;
    this.view = new WebContentsView({
      webPreferences: {
        preload: PATHS.INBROWSER,
        sandbox: true,
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        contextIsolation: true,
        webSecurity: false,
      },
    });
    this.webContents = this.view.webContents;
    this.window.contentView.addChildView(this.view);

    this.webContents.session.webRequest.onHeadersReceived(
      this.onHeadersReceived,
    );
    this.show();
  }

  navigate(url: string) {
    this.webContents.loadURL(url);
  }

  show() {
    this.invalidateLayout();
    this.startListeners();
    this.view.setVisible(true);
    this.view.webContents.toggleDevTools();
  }

  hide() {
    this.stopListeners();
    this.view.setVisible(false);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.hide();

    this.window.contentView.removeChildView(this.view);
    if (!this.webContents.isDestroyed()) {
      if (this.webContents.isDevToolsOpened()) {
        this.webContents.closeDevTools();
      }
    }
  }

  invalidateLayout() {
    const [width, height] = this.window.getSize();
    const padding = 4;
    this.view.setBounds({
      x: padding + stepbarWidth,
      y: toolbarHeight,
      width: width - stepbarWidth - padding * 2,
      height: height - toolbarHeight - padding,
    });
    this.view.setBorderRadius(8);
  }

  startListeners() {
    this.stopListeners();
    this.window.on("resize", this.invalidateLayout.bind(this));
    this.webContents.on("did-navigate", this.onNavigate.bind(this));
    this.webContents.on(
      "did-navigate-in-page",
      this.onNavigateInPage.bind(this),
    );
    this.webContents.on("dom-ready", this.onDomReady.bind(this));
  }

  stopListeners() {
    this.window.off("resize", this.invalidateLayout);
    this.webContents.off("did-navigate", this.onNavigate);
    this.webContents.off("did-navigate-in-page", this.onNavigateInPage);
    this.webContents.off("dom-ready", this.onDomReady);
  }

  onHeadersReceived(
    details: OnHeadersReceivedListenerDetails,
    callback: (res: HeadersReceivedResponse) => void,
  ) {
    const responseHeaders = { ...details.responseHeaders };

    // Delete the CSP headers to bypass restrictions
    delete responseHeaders["content-security-policy"];
    delete responseHeaders["Content-Security-Policy"];

    // Alternatively, you can override it with your own lax policy:
    // responseHeaders['Content-Security-Policy'] = ["script-src 'self' 'unsafe-eval' 'unsafe-inline'"]

    callback({ cancel: false, responseHeaders });
  }

  onNavigate(
    event: any,
    url: string,
    httpResponseCode: number,
    httpStatusText: string,
  ) {
    console.log("navigated to", url);
  }

  onNavigateInPage(event: any, url: string) {
    console.log("navigated (in-page) to", url);
  }

  onDomReady() {
    // electron.startRecording comes from the inbrowser preload.
    this.webContents.executeJavaScript(
      `electron.startRecording(document.body)`,
    );
  }
}
