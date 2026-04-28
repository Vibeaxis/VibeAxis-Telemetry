const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  snapWindow: () => ipcRenderer.send('snap-to-mini'),
  onTelemetry: (callback) => ipcRenderer.on('telemetry-update', (_e, data) => callback(data)),
  
  // Send Commands
  sendTheme: (primary, bg) => ipcRenderer.send('update-theme', primary, bg),
  sendBg: (base64) => ipcRenderer.send('update-bg', base64),
  
  // --- ADD THESE TWO LINES ---
  openSettings: () => ipcRenderer.send('open-settings'),
  resizeWindow: (w, h) => ipcRenderer.send('resize-window', w, h),

  // Receive Commands
  onThemeChange: (callback) => ipcRenderer.on('apply-theme', (_e, theme) => callback(theme)),
  onBgChange: (callback) => ipcRenderer.on('apply-bg', (_e, base64) => callback(base64))
});