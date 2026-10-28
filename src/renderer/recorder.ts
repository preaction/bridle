import { ipcRenderer } from "electron/renderer";
import { BridleStackFrame } from "../types";

export default {
  stackize(target: HTMLElement): Array<BridleStackFrame> {
    // Get all the info we can, we'll sort it out later
    const stack: Array<BridleStackFrame> = [];
    while (target) {
      if (target.tagName && target.attributes) {
        // XXX TODO: Need to resolve `aria-labelledby` to get a label
        // Likely should resolve all element references like that
        stack.push({
          tagName: target.tagName.toLowerCase(),
          text: target.innerText,
          attributes: Array.from(target.attributes).map((el) => ({
            name: el.name,
            value: el.value,
          })),
        });
      }
      if (!target.parentNode) {
        break;
      }
      target = target.parentNode;
    }
    return stack;
  },

  recordEvent(
    action: string,
    target: EventTarget,
    value: string | null = null,
  ): void {
    let targetNode: Node;
    if (target instanceof Node) {
      targetNode = target;
    }
    if (!targetNode) return;
    while (!(targetNode instanceof HTMLElement)) {
      targetNode = targetNode.parentNode;
    }
    try {
      ipcRenderer.send("record-event", {
        action,
        stack: this.stackize(targetNode),
        value: value
          ? value
          : target && "value" in target
            ? target.value
            : null,
        checked: "checked" in target ? target.checked : null,
      });
    } catch (e) {
      console.error(e);
    }
  },

  startRecording(body: HTMLBodyElement): void {
    body.addEventListener(
      "click",
      (e) => {
        console.log("record click");
        this.recordEvent("click", e.target);
      },
      { capture: true },
    );
    body.addEventListener(
      "change",
      (e) => {
        console.log("record change");
        this.recordEvent("change", e.target);
      },
      { capture: true },
    );
    body.addEventListener(
      "keypress",
      (e: KeyboardEvent) => {
        console.log("record keypress");
        this.recordEvent("keypress", e.target, e.key);
      },
      { capture: true },
    );
    body.addEventListener(
      "focus",
      (e: FocusEvent) => {
        console.log("record focus");
        this.recordEvent("focus", e.target);
      },
      { capture: true },
    );
    body.addEventListener(
      "blur",
      (e: FocusEvent) => {
        console.log("record blur");
        this.recordEvent("focus", e.target);
      },
      { capture: true },
    );
    body.addEventListener(
      "submit",
      (e: SubmitEvent) => {
        console.log("record submit");
        this.recordEvent("submit", e.target);
      },
      { capture: true },
    );
  },
};
