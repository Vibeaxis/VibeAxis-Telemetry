import { app, ipcMain, screen, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let dashboardWin = null;
let settingsWin = null;
function createDashboardWindow() {
  dashboardWin = new BrowserWindow({
    width: 1280,
    height: 400,
    frame: false,
    resizable: false,
    webPreferences: { preload: path.join(process.env.VITE_PUBLIC, "preload.cjs"), sandbox: false }
  });
  if (VITE_DEV_SERVER_URL) {
    dashboardWin.loadURL(VITE_DEV_SERVER_URL + "/#dashboard");
  } else {
    dashboardWin.loadFile(path.join(RENDERER_DIST, "index.html"), { hash: "dashboard" });
  }
}
function createSettingsWindow() {
  settingsWin = new BrowserWindow({
    width: 600,
    height: 700,
    title: "Panel Configurator",
    autoHideMenuBar: true,
    // Hides the ugly file/edit/view menu
    webPreferences: { preload: path.join(process.env.VITE_PUBLIC, "preload.cjs"), sandbox: false }
  });
  if (VITE_DEV_SERVER_URL) {
    settingsWin.loadURL(VITE_DEV_SERVER_URL + "/#settings");
  } else {
    settingsWin.loadFile(path.join(RENDERER_DIST, "index.html"), { hash: "settings" });
  }
}
app.whenReady().then(() => {
  createDashboardWindow();
  createSettingsWindow();
  import("./index-AZW1Z33K.js").then((n) => n.i).then((si2) => {
    setInterval(async () => {
      try {
        const temp = await si2.cpuTemperature();
        const load = await si2.currentLoad();
        const mem = await si2.mem();
        const graphics = await si2.graphics();
        const gpu = graphics.controllers.find((g) => g.temperatureGpu > 0) || graphics.controllers[0] || {};
        const telemetry = {
          cpuTemp: Math.round(temp.main || 0),
          cpuLoad: Math.round(load.currentLoad || 0),
          ramUsage: Math.round(mem.active / mem.total * 100),
          gpuTemp: Math.round(gpu.temperatureGpu || 0),
          gpuLoad: Math.round(gpu.utilizationGpu || 0)
        };
        if (dashboardWin) dashboardWin.webContents.send("telemetry-update", telemetry);
      } catch (error) {
      }
    }, 2e3);
  });
  ipcMain.on("snap-to-mini", () => {
    if (!dashboardWin) return;
    const displays = screen.getAllDisplays();
    const miniDisplay = displays.find((d) => d.bounds.width === 1280) || displays[displays.length - 1];
    if (miniDisplay) {
      dashboardWin.setBounds({ x: miniDisplay.bounds.x, y: miniDisplay.bounds.y, width: 1280, height: 400 });
      dashboardWin.setFullScreen(true);
    }
  });
  ipcMain.on("open-settings", () => {
    if (!settingsWin || settingsWin.isDestroyed()) {
      createSettingsWindow();
    } else {
      settingsWin.focus();
    }
  });
  ipcMain.on("resize-window", (event, width, height) => {
    if (!dashboardWin) return;
    dashboardWin.setResizable(true);
    dashboardWin.setSize(width, height);
    dashboardWin.setResizable(false);
  });
  ipcMain.on("update-theme", (e, primary, bg) => {
    if (dashboardWin) dashboardWin.webContents.send("apply-theme", { primary, bg });
  });
  ipcMain.on("update-bg", (e, base64Image) => {
    if (dashboardWin) dashboardWin.webContents.send("apply-bg", base64Image);
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
