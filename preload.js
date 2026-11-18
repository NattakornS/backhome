const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('companionAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (partialConfig) => ipcRenderer.invoke('save-config', partialConfig),
  getState: () => ipcRenderer.invoke('get-state'),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Theme Set & Shareable Bundle Import / Export
  saveCustomThemeSet: (themeSetObj) => ipcRenderer.invoke('save-custom-theme-set', themeSetObj),
  deleteCustomThemeSet: (themeSetId) => ipcRenderer.invoke('delete-custom-theme-set', themeSetId),
  importSharedBundle: (bundleObj) => ipcRenderer.invoke('import-shared-bundle', bundleObj),

  // Pomodoro Core Timer Engine Controls
  pomodoroStartPause: () => ipcRenderer.invoke('pomodoro-start-pause'),
  pomodoroSkip: (autoStartNext) => ipcRenderer.invoke('pomodoro-skip', autoStartNext),
  pomodoroReset: (resetCycles) => ipcRenderer.invoke('pomodoro-reset', resetCycles),
  pomodoroSetPhase: (phase) => ipcRenderer.invoke('pomodoro-set-phase', phase),

  // Cartoon Alert & Behavior Controls
  triggerTestAlert: (behavior) => ipcRenderer.invoke('trigger-test-alert', behavior),
  dismissAlert: () => ipcRenderer.invoke('dismiss-alert'),
  snoozeAlert: (minutes) => ipcRenderer.invoke('snooze-alert', minutes),
  setBehaviorNow: (behavior) => ipcRenderer.invoke('set-behavior-now', behavior),
  openSettings: (tab) => ipcRenderer.invoke('open-settings', tab),
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
  },
  onSwitchViewTab: (callback) => {
    const listener = (_event, tab) => callback(tab);
    ipcRenderer.on('switch-view-tab', listener);
    return () => ipcRenderer.removeListener('switch-view-tab', listener);
  }
});
