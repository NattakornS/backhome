const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('farmerAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (partialConfig) => ipcRenderer.invoke('save-config', partialConfig),
  saveCustomTheme: (themeObj) => ipcRenderer.invoke('save-custom-theme', themeObj),
  deleteCustomTheme: (themeId) => ipcRenderer.invoke('delete-custom-theme', themeId),
  getState: () => ipcRenderer.invoke('get-state'),
  triggerTestAlert: (behavior) => ipcRenderer.invoke('trigger-test-alert', behavior),
  dismissAlert: () => ipcRenderer.invoke('dismiss-alert'),
  snoozeAlert: (minutes) => ipcRenderer.invoke('snooze-alert', minutes),
  setBehaviorNow: (behavior) => ipcRenderer.invoke('set-behavior-now', behavior),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  setIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore),
  moveOverlayBy: (dx, dy) => ipcRenderer.send('move-overlay-by', { dx, dy }),
  saveCurrentOverlayPosition: () => ipcRenderer.invoke('save-current-overlay-position'),
  onConfigUpdated: (callback) => {
    const listener = (_event, config) => callback(config);
    ipcRenderer.on('config-updated', listener);
    return () => ipcRenderer.removeListener('config-updated', listener);
  },
  onStateUpdated: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('state-updated', listener);
    return () => ipcRenderer.removeListener('state-updated', listener);
  }
});
