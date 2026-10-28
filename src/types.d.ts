import { AriaAttributes } from "vue";
import type { ElectronAPI } from "./renderer/preload.ts";

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export type BridleStackFrame = {
  tagName: string;
  attributes: Array<{ name: string; value: string }>;
  text: string;
};

export type BridleLocator = {
  role: ARIAMixin["role"];
  name: string | RegExp;
};

export type BridleEvent =
  | {
      action: "open";
      url: string;
    }
  | {
      action: string;
      stack: BridleStackFrame[];
    };

export type BridleStep =
  | {
      action: "open";
      url: string;
    }
  | {
      action: string;
      locator: BridleLocator;
    };

{
}
