import { app, BrowserWindow, ipcMain, screen } from 'electron'
import si from 'systeminformation'
import { fileURLToPath } from 'node:url'
import path from 'node:path'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// --- REPLACE EVERYTHING FROM "let win:" DOWN TO THE BOTTOM WITH THIS ---

let dashboardWin: BrowserWindow | null = null;
let settingsWin: BrowserWindow | null = null;

function createDashboardWindow() {
  dashboardWin = new BrowserWindow({
    width: 1280, height: 400,
    frame: false, resizable: false,
    webPreferences: { preload: path.join(process.env.VITE_PUBLIC, 'preload.cjs'), sandbox: false }
  });

  if (VITE_DEV_SERVER_URL) {
    dashboardWin.loadURL(VITE_DEV_SERVER_URL + '/#dashboard');
  } else {
    dashboardWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'dashboard' });
  }
}

function createSettingsWindow() {
  settingsWin = new BrowserWindow({
    width: 600, height: 700,
    title: "Panel Configurator",
    autoHideMenuBar: true, // Hides the ugly file/edit/view menu
    webPreferences: { preload: path.join(process.env.VITE_PUBLIC, 'preload.cjs'), sandbox: false }
  });

  if (VITE_DEV_SERVER_URL) {
    settingsWin.loadURL(VITE_DEV_SERVER_URL + '/#settings');
  } else {
    settingsWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'settings' });
  }
}

app.whenReady().then(() => {
  createDashboardWindow();
  createSettingsWindow();

  // --- HARDWARE POLLING (NOW WITH GPU!) ---
  import('systeminformation').then(si => {
    setInterval(async () => {
      try {
        const temp = await si.cpuTemperature();
        const load = await si.currentLoad();
        const mem = await si.mem();
        const graphics = await si.graphics();
        
        // Find the dedicated GPU (usually has a temp reading)
        const gpu = graphics.controllers.find(g => g.temperatureGpu > 0) || graphics.controllers[0] || {};

        const telemetry = {
          cpuTemp: Math.round(temp.main || 0),
          cpuLoad: Math.round(load.currentLoad || 0),
          ramUsage: Math.round((mem.active / mem.total) * 100),
          gpuTemp: Math.round(gpu.temperatureGpu || 0),
          gpuLoad: Math.round(gpu.utilizationGpu || 0)
        };

        if (dashboardWin) dashboardWin.webContents.send('telemetry-update', telemetry);
      } catch (error) { }
    }, 2000);
  });

  // --- INTER-WINDOW COMMUNICATION RELAYS ---
  ipcMain.on('snap-to-mini', () => {
    if (!dashboardWin) return;
    const displays = screen.getAllDisplays();
    const miniDisplay = displays.find(d => d.bounds.width === 1280) || displays[displays.length - 1];
    if (miniDisplay) {
      dashboardWin.setBounds({ x: miniDisplay.bounds.x, y: miniDisplay.bounds.y, width: 1280, height: 400 });
      dashboardWin.setFullScreen(true);
    }
  });
// --- ADD THESE TO YOUR IPC LISTENERS ---
  
  // 1. Re-open the settings window from the gear icon
  ipcMain.on('open-settings', () => {
    if (!settingsWin || settingsWin.isDestroyed()) {
      createSettingsWindow(); // Respawn if they closed it
    } else {
      settingsWin.focus();    // Bring to front if it's hiding
    }
  });

  // 2. Explicitly resize the DASHBOARD window (not the settings window)
  ipcMain.on('resize-window', (event, width, height) => {
    if (!dashboardWin) return;
    dashboardWin.setResizable(true);
    dashboardWin.setSize(width, height);
    dashboardWin.setResizable(false);
  });
  // When Settings changes a theme, relay it to the Dashboard
  ipcMain.on('update-theme', (e, primary, bg) => {
    if (dashboardWin) dashboardWin.webContents.send('apply-theme', { primary, bg });
  });

  // When Settings uploads a BG, relay the Base64 image to the Dashboard
  ipcMain.on('update-bg', (e, base64Image) => {
    if (dashboardWin) dashboardWin.webContents.send('apply-bg', base64Image);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});