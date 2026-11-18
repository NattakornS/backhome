const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

function getConfigPath() {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'config.json');
  }
  return path.join(__dirname, 'config.json');
}

const DEFAULT_CONFIG = {
  wakeTime: '16:00',
  alarmEnabled: true,
  alertMessage: '16:00 Back Home Time! 🏡 เลิกงานแล้ว กลับบ้านกัน!',
  snoozeMinutes: 10,
  visibilityMode: 'both', // 'both' (Always on Taskbar + Alert) | 'alert-only' (Hidden until Wake Time)
  positionPreset: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'custom'
  customX: null,
  customY: null,
  offsetX: 0,
  offsetY: 0,
  patrolWidth: 460,
  scale: 1.0,
  characterSkin: 'thai-kamar', // 'thai-kamar' | 'classic-overalls' | 'modern-rancher' | 'golden-palm'
  characterName: 'Uncle Somchai (ลุงสมชาย)',
  idleBehavior: 'cycle', // 'cycle' | 'tractor' | 'machete' | 'water' | 'plant' | 'palm' | 'fertilizer' | 'fix'
  alertBehavior: 'cycle',
  cycleIntervalSec: 14,
  walkSpeed: 1.0,
  soundEnabled: true,
  dragLocked: false
};

let config = { ...DEFAULT_CONFIG };
let overlayWindow = null;
let settingsWindow = null;
let tray = null;
let schedulerTimer = null;

// Runtime state
let runtimeState = {
  isAlerting: false,
  isSnoozed: false,
  snoozeUntil: null, // timestamp ms
  lastTriggeredKey: null, // "YYYY-MM-DD HH:MM"
  forcedBehavior: null, // temporary override or null
  activeBehavior: 'tractor'
};

function loadConfig() {
  try {
    const cfgPath = getConfigPath();
    if (fs.existsSync(cfgPath)) {
      const raw = fs.readFileSync(cfgPath, 'utf-8');
      const parsed = JSON.parse(raw);
      config = { ...DEFAULT_CONFIG, ...parsed };
    } else {
      saveConfigToFile();
    }
  } catch (err) {
    console.error('Failed to load config.json, using defaults:', err);
    config = { ...DEFAULT_CONFIG };
  }
}

function saveConfigToFile() {
  try {
    const cfgPath = getConfigPath();
    fs.writeFileSync(cfgPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save config.json:', err);
  }
}

// Create a crisp 32x32 PNG farmer hat icon programmatically for Windows System Tray
function createFarmerTrayIcon() {
  const width = 32;
  const height = 32;
  const rawData = Buffer.alloc(height * (1 + width * 4), 0);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const rowOffset = y * (1 + width * 4);
    const pxOffset = rowOffset + 1 + x * 4;
    rawData[pxOffset] = r;
    rawData[pxOffset + 1] = g;
    rawData[pxOffset + 2] = b;
    rawData[pxOffset + 3] = a;
  }

  // Draw rounded green badge background
  for (let y = 2; y < 30; y++) {
    for (let x = 2; x < 30; x++) {
      const dx = x - 15.5;
      const dy = y - 15.5;
      if (dx * dx + dy * dy <= 13.5 * 13.5) {
        setPixel(x, y, 34, 139, 68, 255);
      }
    }
  }

  // Draw farmer face (warm skin circle)
  for (let y = 13; y <= 25; y++) {
    for (let x = 10; x <= 21; x++) {
      const dx = x - 15.5;
      const dy = y - 19;
      if (dx * dx + dy * dy <= 6 * 6) {
        setPixel(x, y, 245, 200, 150, 255);
      }
    }
  }

  // Eyes & smile
  setPixel(13, 18, 40, 30, 20, 255);
  setPixel(13, 19, 40, 30, 20, 255);
  setPixel(18, 18, 40, 30, 20, 255);
  setPixel(18, 19, 40, 30, 20, 255);
  for (let x = 14; x <= 17; x++) {
    setPixel(x, 22, 180, 70, 60, 255);
  }

  // Golden straw hat dome + wide brim
  for (let y = 7; y <= 13; y++) {
    const halfW = y - 4;
    for (let x = 16 - halfW; x <= 15 + halfW; x++) {
      setPixel(x, y, 242, 193, 68, 255);
    }
  }
  // Red hat ribbon
  for (let x = 10; x <= 21; x++) {
    setPixel(x, 12, 214, 65, 55, 255);
  }
  // Wide hat brim
  for (let y = 13; y <= 14; y++) {
    for (let x = 5; x <= 26; x++) {
      setPixel(x, y, 224, 170, 48, 255);
    }
  }

  // Encode valid PNG buffer
  function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
    }
    return (c ^ -1) >>> 0;
  }
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, combined, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(rawData);
  const pngBuffer = Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0))
  ]);

  return nativeImage.createFromBuffer(pngBuffer);
}

function getOverlayDimensions() {
  const scale = Number(config.scale) || 1.0;
  const width = Math.max(320, Math.round((Number(config.patrolWidth) || 460) * Math.max(0.85, Math.min(scale, 1.35))));
  const height = Math.round(310 * Math.max(0.85, Math.min(scale, 1.4)));
  return { width, height };
}

function computeOverlayPosition(width, height) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workArea; // Excludes Windows taskbar!
  const offsetX = Number(config.offsetX) || 0;
  const offsetY = Number(config.offsetY) || 0;

  if (config.positionPreset === 'custom' && config.customX !== null && config.customY !== null) {
    return {
      x: Math.round(config.customX + offsetX),
      y: Math.round(config.customY + offsetY)
    };
  }

  let x = workArea.x + workArea.width - width - 12;
  let y = workArea.y + workArea.height - height;

  switch (config.positionPreset) {
    case 'bottom-left':
      x = workArea.x + 12;
      y = workArea.y + workArea.height - height;
      break;
    case 'bottom-center':
      x = workArea.x + Math.round((workArea.width - width) / 2);
      y = workArea.y + workArea.height - height;
      break;
    case 'top-right':
      x = workArea.x + workArea.width - width - 12;
      y = workArea.y + 12;
      break;
    case 'bottom-right':
    default:
      x = workArea.x + workArea.width - width - 12;
      y = workArea.y + workArea.height - height;
      break;
  }

  return {
    x: Math.round(x + offsetX),
    y: Math.round(y + offsetY)
  };
}

function applyOverlayBounds() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const { width, height } = getOverlayDimensions();
  const { x, y } = computeOverlayPosition(width, height);
  overlayWindow.setBounds({ x, y, width, height });
}

function updateOverlayVisibility() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const shouldShow = runtimeState.isAlerting || config.visibilityMode === 'both';
  if (shouldShow) {
    if (!overlayWindow.isVisible()) {
      overlayWindow.showInactive();
    }
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  } else {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
    }
  }
}

function broadcastConfig() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('config-updated', config);
  }
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send('config-updated', config);
  }
  rebuildTrayMenu();
}

function broadcastState() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('state-updated', runtimeState);
  }
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send('state-updated', runtimeState);
  }
  rebuildTrayMenu();
}

function createOverlayWindow() {
  const { width, height } = getOverlayDimensions();
  const { x, y } = computeOverlayPosition(width, height);

  overlayWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.loadFile(path.join(__dirname, 'src', 'overlay', 'overlay.html'));

  overlayWindow.once('ready-to-show', () => {
    updateOverlayVisibility();
    broadcastConfig();
    broadcastState();
  });
}

function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore();
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 880,
    height: 720,
    minWidth: 760,
    minHeight: 600,
    title: 'Farmer Back-Home Alert (16:00) — Settings & Control Panel',
    icon: createFarmerTrayIcon(),
    autoHideMenuBar: true,
    backgroundColor: '#121915',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'src', 'settings', 'settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function triggerAlert(overrideBehavior = null) {
  runtimeState.isAlerting = true;
  runtimeState.isSnoozed = false;
  runtimeState.snoozeUntil = null;
  if (overrideBehavior) {
    runtimeState.forcedBehavior = overrideBehavior;
  }
  updateOverlayVisibility();
  broadcastState();
}

function dismissAlert() {
  runtimeState.isAlerting = false;
  runtimeState.isSnoozed = false;
  runtimeState.snoozeUntil = null;
  runtimeState.forcedBehavior = null;
  updateOverlayVisibility();
  broadcastState();
}

function snoozeAlert(minutes) {
  const mins = Number(minutes) || Number(config.snoozeMinutes) || 10;
  runtimeState.isAlerting = false;
  runtimeState.isSnoozed = true;
  runtimeState.snoozeUntil = Date.now() + mins * 60 * 1000;
  updateOverlayVisibility();
  broadcastState();
}

function startScheduler() {
  if (schedulerTimer) clearInterval(schedulerTimer);

  schedulerTimer = setInterval(() => {
    const now = new Date();

    // 1. Check if snooze expired
    if (runtimeState.isSnoozed && runtimeState.snoozeUntil && Date.now() >= runtimeState.snoozeUntil) {
      triggerAlert();
      return;
    }

    // 2. Check daily wakeTime (e.g., "16:00")
    if (!config.alarmEnabled) return;

    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentHM = `${hh}:${mm}`;
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${currentHM}`;

    if (currentHM === config.wakeTime && runtimeState.lastTriggeredKey !== dateKey) {
      runtimeState.lastTriggeredKey = dateKey;
      triggerAlert();
    }
  }, 1000);
}

function rebuildTrayMenu() {
  if (!tray) return;

  const behaviors = [
    { id: 'cycle', label: '🔄 Cycle All Behaviors' },
    { id: 'tractor', label: '🚜 Drive a Tractor' },
    { id: 'machete', label: '🔪 Hold / Swing Machete' },
    { id: 'water', label: '🚿 Pouring Water' },
    { id: 'plant', label: '🌱 Plant the Tree' },
    { id: 'palm', label: '🌴 Harvest Oil Palm' },
    { id: 'fertilizer', label: '🌾 Spread Fertilizer' },
    { id: 'fix', label: '🔧 Fix the Things' }
  ];

  const statusText = runtimeState.isAlerting
    ? '🔔 Status: ALERTING (Back Home Time!)'
    : runtimeState.isSnoozed && runtimeState.snoozeUntil
    ? `💤 Snoozed until ${new Date(runtimeState.snoozeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : `⏰ Next Alert: ${config.wakeTime} (${config.alarmEnabled ? 'Enabled' : 'Paused'})`;

  const contextMenu = Menu.buildFromTemplate([
    { label: `👨‍🌾 ${config.characterName}`, enabled: false },
    { label: statusText, enabled: false },
    { type: 'separator' },
    {
      label: '🔔 Trigger 16:00 Alert Now (Test)',
      click: () => triggerAlert()
    },
    {
      label: '💤 Snooze Alert',
      submenu: [
        { label: 'Snooze 5 minutes', click: () => snoozeAlert(5) },
        { label: 'Snooze 10 minutes', click: () => snoozeAlert(10) },
        { label: 'Snooze 15 minutes', click: () => snoozeAlert(15) },
        { label: 'Snooze 30 minutes', click: () => snoozeAlert(30) }
      ]
    },
    {
      label: '✅ Dismiss Alert',
      enabled: runtimeState.isAlerting || runtimeState.isSnoozed,
      click: () => dismissAlert()
    },
    { type: 'separator' },
    {
      label: '🎭 Farmer Behavior',
      submenu: behaviors.map((b) => ({
        label: b.label,
        type: 'radio',
        checked: (runtimeState.forcedBehavior || config.idleBehavior) === b.id,
        click: () => {
          runtimeState.forcedBehavior = b.id === 'cycle' ? null : b.id;
          config.idleBehavior = b.id;
          saveConfigToFile();
          updateOverlayVisibility();
          broadcastConfig();
          broadcastState();
        }
      }))
    },
    {
      label: '📍 Screen Position',
      submenu: [
        {
          label: 'Bottom-Right (Taskbar Corner)',
          type: 'radio',
          checked: config.positionPreset === 'bottom-right',
          click: () => updateConfig({ positionPreset: 'bottom-right', offsetX: 0, offsetY: 0 })
        },
        {
          label: 'Bottom-Center (Taskbar Center)',
          type: 'radio',
          checked: config.positionPreset === 'bottom-center',
          click: () => updateConfig({ positionPreset: 'bottom-center', offsetX: 0, offsetY: 0 })
        },
        {
          label: 'Bottom-Left (Taskbar Left)',
          type: 'radio',
          checked: config.positionPreset === 'bottom-left',
          click: () => updateConfig({ positionPreset: 'bottom-left', offsetX: 0, offsetY: 0 })
        },
        {
          label: 'Top-Right Corner',
          type: 'radio',
          checked: config.positionPreset === 'top-right',
          click: () => updateConfig({ positionPreset: 'top-right', offsetX: 0, offsetY: 0 })
        }
      ]
    },
    {
      label: '👁️ Visibility Mode',
      submenu: [
        {
          label: 'Always on Taskbar (Desktop Pet + 16:00 Alert)',
          type: 'radio',
          checked: config.visibilityMode === 'both',
          click: () => updateConfig({ visibilityMode: 'both' })
        },
        {
          label: 'Alert Only (Hide Until 16:00 Wake Time)',
          type: 'radio',
          checked: config.visibilityMode === 'alert-only',
          click: () => updateConfig({ visibilityMode: 'alert-only' })
        }
      ]
    },
    { type: 'separator' },
    {
      label: '⚙️ Open Settings & Preview...',
      click: () => openSettingsWindow()
    },
    { type: 'separator' },
    {
      label: '❌ Quit Farmer Alert',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip(`Farmer Back-Home Alert (${config.wakeTime}) — ${config.characterName}`);
  tray.setContextMenu(contextMenu);
}

function updateConfig(partial) {
  const prevWakeTime = config.wakeTime;
  config = { ...config, ...partial };
  if (partial.wakeTime && partial.wakeTime !== prevWakeTime) {
    // Reset lastTriggeredKey so a newly set wakeTime for the current minute can fire immediately
    runtimeState.lastTriggeredKey = null;
  }
  saveConfigToFile();
  applyOverlayBounds();
  updateOverlayVisibility();
  broadcastConfig();
}

function setupIPC() {
  ipcMain.handle('get-config', () => config);
  ipcMain.handle('get-state', () => runtimeState);

  ipcMain.handle('save-config', (_event, partial) => {
    updateConfig(partial);
    return config;
  });

  ipcMain.handle('trigger-test-alert', (_event, behavior) => {
    triggerAlert(behavior || null);
    return runtimeState;
  });

  ipcMain.handle('dismiss-alert', () => {
    dismissAlert();
    return runtimeState;
  });

  ipcMain.handle('snooze-alert', (_event, minutes) => {
    snoozeAlert(minutes);
    return runtimeState;
  });

  ipcMain.handle('set-behavior-now', (_event, behavior) => {
    runtimeState.forcedBehavior = behavior === 'cycle' ? null : behavior;
    if (behavior) {
      config.idleBehavior = behavior;
      saveConfigToFile();
    }
    if (!overlayWindow.isVisible()) {
      overlayWindow.showInactive();
    }
    broadcastConfig();
    broadcastState();
    return runtimeState;
  });

  ipcMain.handle('open-settings', () => {
    openSettingsWindow();
    return true;
  });

  ipcMain.on('set-ignore-mouse-events', (_event, ignore) => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    if (ignore) {
      overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      overlayWindow.setIgnoreMouseEvents(false);
    }
  });

  ipcMain.on('move-overlay-by', (_event, { dx, dy }) => {
    if (!overlayWindow || overlayWindow.isDestroyed() || config.dragLocked) return;
    const bounds = overlayWindow.getBounds();
    const newX = Math.round(bounds.x + dx);
    const newY = Math.round(bounds.y + dy);
    overlayWindow.setPosition(newX, newY);
  });

  ipcMain.handle('save-current-overlay-position', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return config;
    const bounds = overlayWindow.getBounds();
    config.positionPreset = 'custom';
    config.customX = bounds.x;
    config.customY = bounds.y;
    config.offsetX = 0;
    config.offsetY = 0;
    saveConfigToFile();
    broadcastConfig();
    return config;
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    openSettingsWindow();
  });

  app.whenReady().then(() => {
    loadConfig();
    setupIPC();

    tray = new Tray(createFarmerTrayIcon());
    tray.on('click', () => openSettingsWindow());
    tray.on('double-click', () => openSettingsWindow());
    rebuildTrayMenu();

    createOverlayWindow();
    startScheduler();

    // Open settings window if --open-settings flag is passed
    if (process.argv.includes('--open-settings')) {
      openSettingsWindow();
    }

    screen.on('display-metrics-changed', () => {
      applyOverlayBounds();
    });
  });
}

app.on('window-all-closed', (e) => {
  // Keep running in system tray
  e.preventDefault();
});
