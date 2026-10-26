/**
 * This file is loaded into every web page and contains the setup to record things happening inside.
 */

import { contextBridge } from "electron/renderer";
import Recorder from "./recorder";

export type ElectronAPI = typeof Recorder;

contextBridge.exposeInMainWorld("electron", Recorder);
