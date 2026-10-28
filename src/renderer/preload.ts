import type { BridleEvent } from "../types";

const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electron", {
  loadUrl: (url: string) => ipcRenderer.send("set-url", url),
  onStep: (cb: (step: BridleEvent) => void) => {
    ipcRenderer.on("step", (event, step) => cb(step));
  },
  onLocation: (cb: (url: string) => void) => {
    ipcRenderer.on("location", (event, url) => cb(url));
  },
});
