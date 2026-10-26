/**
 * The main process, weirdly, controls the actual underlying browser window.
 * The main process hijacks a portion of the renderer's window to display it.
 */

import { app, Menu, ipcMain } from "electron";
import AppWindow from "./app.ts";

// function setupMenu(browser) {
//   const isMac = process.platform === "darwin";
//
//   const tab = () => browser.getFocusedWindow().getFocusedTab();
//   const tabWc = () => tab().webContents;
//
//   const template = [
//     ...(isMac ? [{ role: "appMenu" }] : []),
//     { role: "fileMenu" },
//     { role: "editMenu" },
//     {
//       label: "View",
//       submenu: [
//         {
//           label: "Reload",
//           accelerator: "CmdOrCtrl+R",
//           nonNativeMacOSRole: true,
//           click: () => tabWc().reload(),
//         },
//         {
//           label: "Force Reload",
//           accelerator: "Shift+CmdOrCtrl+R",
//           nonNativeMacOSRole: true,
//           click: () => tabWc().reloadIgnoringCache(),
//         },
//         {
//           label: "Toggle Developer Tool asdf",
//           accelerator: isMac ? "Alt+Command+I" : "Ctrl+Shift+I",
//           nonNativeMacOSRole: true,
//           click: () => tabWc().toggleDevTools(),
//         },
//         { type: "separator" },
//         { role: "resetZoom" },
//         { role: "zoomIn" },
//         { role: "zoomOut" },
//         { type: "separator" },
//         { role: "togglefullscreen" },
//       ],
//     },
//     { role: "windowMenu" },
//   ];
//
//   const menu = Menu.buildFromTemplate(template);
//   Menu.setApplicationMenu(menu);
// }

async function main() {
  await app.whenReady();
  const windows: AppWindow[] = [];
  windows.push(new AppWindow());

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      //windows[0].destroy();
    }
  });

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    //if (BrowserWindow.getAllWindows().length === 0) createInitialWindow();
  });
}
main();
