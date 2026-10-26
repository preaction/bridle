import type { ElectronAPI } from "./renderer/preload.ts";

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export type PlayducerStackFrame = {
  tagName: string;
  role: string;
  ariaName: string;
  href: string;
};

export type PlayducerStep = {
  action: string;
  stack: PlayducerStackFrame[];
};
