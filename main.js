const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const { UpdateManager } = require('./src/updater/update-manager');

// Suppress Chromium DevTools unsupported Autofill CDP domain console noise
if (app && app.commandLine) {
  app.commandLine.appendSwitch('log-level', '3');
  app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication');
}

function getConfigPath() {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'config.json');
  }
  return path.join(__dirname, 'config.json');
}

function getThemeSetsDir() {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'themes');
  }
  return path.join(__dirname, 'themes');
}

const DEFAULT_POMODORO_CONFIG = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  overflowMode: true,
  strictMode: false
};

const DEFAULT_CONFIG = {
  language: 'th', // 'th' | 'en'
  pomodoro: { ...DEFAULT_POMODORO_CONFIG },
  wakeTime: '16:00',
  alarmEnabled: true,
  alertMessage: '🍅 ครบเวลาโฟกัสแล้ว! พักสายตาสักนิดนะ',
  backHomeMessage: '🏡 16:00 เลิกงานแล้ว กลับบ้านกัน!',
  snoozeMinutes: 5,
  visibilityMode: 'both', // 'both' (Always on Taskbar) | 'alert-only' (Hidden until Alert)
  positionPreset: 'bottom-right',
  customX: null,
  customY: null,
  offsetX: 0,
  offsetY: 0,
  patrolWidth: 460,
  scale: 1.0,
  activeThemeSet: 'farmer',
  customThemeSets: {},
  characterSkin: 'thai-kamar',
  characterName: 'ลุงสมชาย',
  idleBehavior: 'cycle',
  alertBehavior: 'cycle',
  cycleIntervalSec: 14,
  walkSpeed: 1.0,
  soundEnabled: true,
  dragLocked: false,
  updateFeedUrl: './updates',
  autoCheckUpdates: true
};

function t(th, en) {
  return config.language === 'en' ? en : th;
}

let config = { ...DEFAULT_CONFIG };
let overlayWindow = null;
let settingsWindow = null;
let tray = null;
let schedulerTimer = null;
let updateManager = null;

function getCurrentAppVersion() {
  try {
    const relPath = path.join(__dirname, 'releases.json');
    if (fs.existsSync(relPath)) {
      const rel = JSON.parse(fs.readFileSync(relPath, 'utf-8'));
      if (rel && rel.currentVersion) return rel.currentVersion;
    }
  } catch (e) {}
  return app.getVersion() || '1.2.0';
}

function getUpdatesDir() {
  if (app.isPackaged) {
    return path.join(path.dirname(process.execPath), 'updates');
  }
  return path.join(__dirname, 'updates');
}

// Runtime state including Pomodoro Core Timer Engine
let runtimeState = {
  isAlerting: false,
  alertType: null, // 'pomodoro-complete' | 'pomodoro-overtime' | 'back-home' | 'test'
  alertBannerTitle: '',
  alertBannerText: '',
  isSnoozed: false,
  snoozeUntil: null,
  lastTriggeredKey: null,
  forcedBehavior: null,
  pomodoro: {
    phase: 'focus', // 'focus' | 'shortBreak' | 'longBreak'
    status: 'idle', // 'idle' | 'running' | 'paused' | 'completed' | 'overtime'
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    overtimeSeconds: 0,
    currentSession: 1,
    completedFocusCount: 0,
    strictLocked: false
  }
};

function getPhaseDurationSeconds(phase) {
  const pCfg = { ...DEFAULT_POMODORO_CONFIG, ...(config.pomodoro || {}) };
  if (phase === 'shortBreak') return Math.max(1, Number(pCfg.shortBreakMinutes) || 5) * 60;
  if (phase === 'longBreak') return Math.max(1, Number(pCfg.longBreakMinutes) || 15) * 60;
  return Math.max(1, Number(pCfg.focusMinutes) || 25) * 60;
}

function updateStrictLockState() {
  const pCfg = { ...DEFAULT_POMODORO_CONFIG, ...(config.pomodoro || {}) };
  const p = runtimeState.pomodoro;
  p.strictLocked = Boolean(
    pCfg.strictMode &&
      p.phase === 'focus' &&
      p.status === 'running' &&
      p.remainingSeconds > 0
  );
}

function loadThemeSetsFromFolder() {
  const dirs = [path.join(__dirname, 'themes')];
  if (app.isPackaged) {
    dirs.push(getThemeSetsDir());
  }
  const loaded = {};
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id && (parsed.nameTh || parsed.nameEn || parsed.name)) {
          loaded[parsed.id] = normalizeThemeSet(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed reading themes folder:', e);
    }
  }
  return loaded;
}

function normalizeThemeSet(obj) {
  const id = String(obj.id || `theme-${Date.now()}`)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .toLowerCase();
  const nameTh = obj.nameTh || obj.name || id;
  const nameEn = obj.nameEn || obj.name || id;
  const character = {
    skinTone: '#F1C29B',
    cheek: '#E88B78',
    hatStyle: obj.hatStyle || (obj.character && obj.character.hatStyle) || 'straw-hat',
    hatMain: '#E5B95C',
    hatDark: '#C49438',
    hatBand: '#C93B2B',
    shirt: '#284B7A',
    shirtSleeve: '#1E3A61',
    overalls: '#1D3354',
    kamarBelt: false,
    pants: '#34495E',
    boots: '#2C3E28',
    sunglasses: false,
    mustache: false,
    vehicleStyle: obj.vehicleStyle || (obj.character && obj.character.vehicleStyle) || 'tractor',
    vehicleBody: (obj.vehicle && obj.vehicle.bodyColor) || '#D32F2F',
    vehicleTrim: (obj.vehicle && obj.vehicle.trimColor) || '#FFCA28',
    vehicleWheel: (obj.vehicle && obj.vehicle.wheelColor) || '#263238',
    vehicleRim: (obj.vehicle && obj.vehicle.rimColor) || '#FBC02D',
    groundColor: obj.groundColor || '#4CAF50',
    ...(obj.skin || {}),
    ...(obj.character || {})
  };

  let behaviors = [];
  if (Array.isArray(obj.behaviors)) {
    behaviors = obj.behaviors;
  } else if (obj.behaviors && typeof obj.behaviors === 'object') {
    behaviors = Object.entries(obj.behaviors).map(([k, v]) => ({
      id: k,
      icon: v.icon || '✨',
      labelTh: v.labelTh || v.label || k,
      labelEn: v.labelEn || v.label || k,
      movementType: k === 'tractor' ? 'ride' : 'walk',
      toolType: k,
      propType: k,
      particleType: k === 'tractor' ? 'smoke' : k === 'water' ? 'water' : 'spark',
      particleColor: v.particleColor || '#FFD54F'
    }));
  }

  return {
    ...obj,
    id,
    nameTh,
    nameEn,
    character,
    behaviors
  };
}

function loadConfig() {
  try {
    const cfgPath = getConfigPath();
    if (fs.existsSync(cfgPath)) {
      const raw = fs.readFileSync(cfgPath, 'utf-8');
      const parsed = JSON.parse(raw);
      config = {
        ...DEFAULT_CONFIG,
        ...parsed,
        pomodoro: {
          ...DEFAULT_POMODORO_CONFIG,
          ...(parsed.pomodoro || {})
        }
      };
    } else {
      config = { ...DEFAULT_CONFIG };
    }
    if (config.language !== 'en' && config.language !== 'th') {
      config.language = 'th';
    }
    const folderThemes = loadThemeSetsFromFolder();
    config.customThemeSets = {
      ...folderThemes,
      ...(config.customThemeSets || {})
    };
    const initSec = getPhaseDurationSeconds('focus');
    runtimeState.pomodoro.totalSeconds = initSec;
    runtimeState.pomodoro.remainingSeconds = initSec;
    saveConfigToFile();
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

function createCompanionTrayIcon() {
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

  for (let y = 2; y < 30; y++) {
    for (let x = 2; x < 30; x++) {
      const dx = x - 15.5;
      const dy = y - 15.5;
      if (dx * dx + dy * dy <= 13.5 * 13.5) {
        setPixel(x, y, 34, 139, 68, 255);
      }
    }
  }

  for (let y = 13; y <= 25; y++) {
    for (let x = 10; x <= 21; x++) {
      const dx = x - 15.5;
      const dy = y - 19;
      if (dx * dx + dy * dy <= 6 * 6) {
        setPixel(x, y, 245, 200, 150, 255);
      }
    }
  }

  setPixel(13, 18, 40, 30, 20, 255);
  setPixel(13, 19, 40, 30, 20, 255);
  setPixel(18, 18, 40, 30, 20, 255);
  setPixel(18, 19, 40, 30, 20, 255);
  for (let x = 14; x <= 17; x++) {
    setPixel(x, 22, 180, 70, 60, 255);
  }

  for (let y = 7; y <= 13; y++) {
    const halfW = y - 4;
    for (let x = 16 - halfW; x <= 15 + halfW; x++) {
      setPixel(x, y, 242, 193, 68, 255);
    }
  }
  for (let x = 10; x <= 21; x++) {
    setPixel(x, 12, 214, 65, 55, 255);
  }
  for (let y = 13; y <= 14; y++) {
    for (let x = 5; x <= 26; x++) {
      setPixel(x, y, 224, 170, 48, 255);
    }
  }

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
  ihdr[8] = 8;
  ihdr[9] = 6;
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
  const width = Math.max(340, Math.round((Number(config.patrolWidth) || 460) * Math.max(0.85, Math.min(scale, 1.35))));
  const height = Math.round(335 * Math.max(0.85, Math.min(scale, 1.4)));
  return { width, height };
}

function computeOverlayPosition(width, height) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workArea;
  const offsetX = Number(config.offsetX) || 0;
  const offsetY = Number(config.offsetY) || 0;

  let x = workArea.x + workArea.width - width - 80;
  let y = workArea.y + workArea.height - height;

  if (config.positionPreset === 'custom' && config.customX !== null && config.customY !== null) {
    x = config.customX;
    y = config.customY;
  } else {
    switch (config.positionPreset) {
      case 'bottom-left':
        x = workArea.x + 24;
        y = workArea.y + workArea.height - height;
        break;
      case 'bottom-center':
        x = workArea.x + Math.round((workArea.width - width) / 2);
        y = workArea.y + workArea.height - height;
        break;
      case 'top-right':
        x = workArea.x + workArea.width - width - 80;
        y = workArea.y + 16;
        break;
      case 'bottom-right':
      default:
        x = workArea.x + workArea.width - width - 80;
        y = workArea.y + workArea.height - height;
        break;
    }
  }

  const finalX = Math.max(
    workArea.x + 8,
    Math.min(workArea.x + workArea.width - width - 24, Math.round(x + offsetX))
  );
  const finalY = Math.max(
    workArea.y + 8,
    Math.min(workArea.y + workArea.height - height, Math.round(y + offsetY))
  );

  return { x: finalX, y: finalY };
}

function applyOverlayBounds() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const { width, height } = getOverlayDimensions();
  const { x, y } = computeOverlayPosition(width, height);
  overlayWindow.setBounds({ x, y, width, height });
}

function updateOverlayVisibility() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const p = runtimeState.pomodoro;
  const shouldShow =
    runtimeState.isAlerting ||
    p.status === 'overtime' ||
    p.status === 'completed' ||
    config.visibilityMode === 'both';

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
  updateStrictLockState();
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

function openSettingsWindow(initialTab = 'main') {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore();
    settingsWindow.show();
    settingsWindow.focus();
    if (initialTab) {
      settingsWindow.webContents.send('switch-view-tab', initialTab);
    }
    return;
  }

  const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = Math.min(1040, Math.max(380, Math.round(workAreaSize.width * 0.9)));
  const winHeight = Math.min(820, Math.max(520, Math.round(workAreaSize.height * 0.9)));

  settingsWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    minWidth: 360,
    minHeight: 460,
    title: 'Pomodoro Cartoon Companion',
    icon: createCompanionTrayIcon(),
    autoHideMenuBar: true,
    backgroundColor: '#0F1712',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'src', 'settings', 'settings.html'));

  settingsWindow.webContents.once('did-finish-load', () => {
    if (initialTab && initialTab !== 'main') {
      settingsWindow.webContents.send('switch-view-tab', initialTab);
    }
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// ============================================================================
// POMODORO CORE TIMER ENGINE
// ============================================================================

function advancePomodoroPhase(shouldStartRunning) {
  const p = runtimeState.pomodoro;
  const pCfg = { ...DEFAULT_POMODORO_CONFIG, ...(config.pomodoro || {}) };
  const targetSessions = Math.max(1, Number(pCfg.sessionsBeforeLongBreak) || 4);

  if (p.phase === 'focus') {
    p.completedFocusCount += 1;
    if (p.currentSession >= targetSessions) {
      p.phase = 'longBreak';
    } else {
      p.phase = 'shortBreak';
    }
  } else {
    // Returning from shortBreak or longBreak to focus
    if (p.phase === 'longBreak') {
      p.currentSession = 1;
    } else {
      p.currentSession = Math.min(targetSessions, p.currentSession + 1);
    }
    p.phase = 'focus';
  }

  const nextDuration = getPhaseDurationSeconds(p.phase);
  p.totalSeconds = nextDuration;
  p.remainingSeconds = nextDuration;
  p.overtimeSeconds = 0;
  p.status = shouldStartRunning ? 'running' : 'idle';
  runtimeState.isAlerting = false;
  runtimeState.alertType = null;
  updateOverlayVisibility();
  broadcastState();
}

function handlePomodoroIntervalReachedZero() {
  const p = runtimeState.pomodoro;
  const pCfg = { ...DEFAULT_POMODORO_CONFIG, ...(config.pomodoro || {}) };

  const finishedFocus = p.phase === 'focus';
  const bannerTitle = finishedFocus
    ? t('🍅 ครบเวลาโฟกัส!', '🍅 Focus Complete!')
    : t('⚡ หมดเวลาพักแล้ว!', '⚡ Break Finished!');
  const bannerMsg = finishedFocus
    ? config.alertMessage || t('🍅 ครบเวลาโฟกัสแล้ว! พักสายตาสักนิดนะ', '🍅 Focus Complete! Time for a break!')
    : t('⚡ พักผ่อนเติมพลังเรียบร้อย! พร้อมเริ่มโฟกัสรอบถัดไปหรือยัง?', '⚡ Break finished! Ready for the next Focus session?');

  // 1. Check Overflow / Overtime Mode
  if (pCfg.overflowMode) {
    p.status = 'overtime';
    p.overtimeSeconds = 0;
    runtimeState.isAlerting = true;
    runtimeState.alertType = 'pomodoro-overtime';
    runtimeState.alertBannerTitle = t(`🔥 โหมดล่วงเวลา (${bannerTitle})`, `🔥 Flow Overtime (${bannerTitle})`);
    runtimeState.alertBannerText = bannerMsg;
    updateOverlayVisibility();
    broadcastState();
    return;
  }

  // 2. Check Auto-Start Toggles
  const shouldAutoStart = finishedFocus ? Boolean(pCfg.autoStartBreaks) : Boolean(pCfg.autoStartFocus);
  if (shouldAutoStart) {
    advancePomodoroPhase(true);
    runtimeState.isAlerting = true;
    runtimeState.alertType = 'pomodoro-complete';
    runtimeState.alertBannerTitle = bannerTitle;
    runtimeState.alertBannerText = bannerMsg;
    updateOverlayVisibility();
    broadcastState();
    return;
  }

  // 3. Standard Completion Alert (waits for user to start next phase)
  p.status = 'completed';
  runtimeState.isAlerting = true;
  runtimeState.alertType = 'pomodoro-complete';
  runtimeState.alertBannerTitle = bannerTitle;
  runtimeState.alertBannerText = bannerMsg;
  updateOverlayVisibility();
  broadcastState();
}

function pomodoroStartPause() {
  const p = runtimeState.pomodoro;
  updateStrictLockState();

  if (p.status === 'running') {
    if (p.strictLocked) {
      return { blockedByStrictMode: true, state: runtimeState };
    }
    p.status = 'paused';
    broadcastState();
    return { blockedByStrictMode: false, state: runtimeState };
  }

  if (p.status === 'completed' || p.status === 'overtime') {
    advancePomodoroPhase(true);
    return { blockedByStrictMode: false, state: runtimeState };
  }

  // 'idle' or 'paused' -> start running
  p.status = 'running';
  runtimeState.isAlerting = false;
  updateOverlayVisibility();
  broadcastState();
  return { blockedByStrictMode: false, state: runtimeState };
}

function pomodoroSkip(autoStartNext = true) {
  updateStrictLockState();
  if (runtimeState.pomodoro.strictLocked) {
    return { blockedByStrictMode: true, state: runtimeState };
  }
  advancePomodoroPhase(Boolean(autoStartNext));
  return { blockedByStrictMode: false, state: runtimeState };
}

function pomodoroReset(resetCycles = false) {
  updateStrictLockState();
  if (runtimeState.pomodoro.strictLocked) {
    return { blockedByStrictMode: true, state: runtimeState };
  }
  const p = runtimeState.pomodoro;
  if (resetCycles) {
    p.phase = 'focus';
    p.currentSession = 1;
    p.completedFocusCount = 0;
  }
  const dur = getPhaseDurationSeconds(p.phase);
  p.totalSeconds = dur;
  p.remainingSeconds = dur;
  p.overtimeSeconds = 0;
  p.status = 'idle';
  runtimeState.isAlerting = false;
  runtimeState.alertType = null;
  updateOverlayVisibility();
  broadcastState();
  return { blockedByStrictMode: false, state: runtimeState };
}

function pomodoroSetPhase(targetPhase) {
  updateStrictLockState();
  if (runtimeState.pomodoro.strictLocked) {
    return { blockedByStrictMode: true, state: runtimeState };
  }
  if (!['focus', 'shortBreak', 'longBreak'].includes(targetPhase)) {
    return { blockedByStrictMode: false, state: runtimeState };
  }
  const p = runtimeState.pomodoro;
  p.phase = targetPhase;
  const dur = getPhaseDurationSeconds(targetPhase);
  p.totalSeconds = dur;
  p.remainingSeconds = dur;
  p.overtimeSeconds = 0;
  p.status = 'idle';
  runtimeState.isAlerting = false;
  updateOverlayVisibility();
  broadcastState();
  return { blockedByStrictMode: false, state: runtimeState };
}

// ============================================================================
// ALERT & SCHEDULER
// ============================================================================

function triggerAlert(overrideBehavior = null, type = 'test') {
  runtimeState.isAlerting = true;
  runtimeState.alertType = type;
  runtimeState.isSnoozed = false;
  runtimeState.snoozeUntil = null;
  if (type === 'back-home') {
    runtimeState.alertBannerTitle = t(
      `⏰ ${config.wakeTime || '16:00'} เลิกงานกลับบ้าน!`,
      `⏰ ${config.wakeTime || '16:00'} Back Home Time!`
    );
    runtimeState.alertBannerText =
      config.backHomeMessage || t('🏡 16:00 เลิกงานแล้ว กลับบ้านกัน!', '🏡 16:00 Back Home Time!');
  } else {
    runtimeState.alertBannerTitle = t('🍅 แจ้งเตือนโพโมโดโร', '🍅 Pomodoro Alert');
    runtimeState.alertBannerText =
      config.alertMessage || t('🍅 ครบเวลาโฟกัสแล้ว! พักสายตาสักนิดนะ', '🍅 Session Complete! Time for a break!');
  }
  if (overrideBehavior) {
    runtimeState.forcedBehavior = overrideBehavior;
  }
  updateOverlayVisibility();
  broadcastState();
}

function dismissAlert() {
  runtimeState.isAlerting = false;
  runtimeState.alertType = null;
  runtimeState.isSnoozed = false;
  runtimeState.snoozeUntil = null;
  runtimeState.forcedBehavior = null;
  if (runtimeState.pomodoro.status === 'completed' || runtimeState.pomodoro.status === 'overtime') {
    advancePomodoroPhase(false);
  } else {
    updateOverlayVisibility();
    broadcastState();
  }
}

function snoozeAlert(minutes) {
  const mins = Number(minutes) || Number(config.snoozeMinutes) || 5;
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
    const p = runtimeState.pomodoro;
    let shouldBroadcast = false;

    // 1. Tick Pomodoro Timer Engine
    if (p.status === 'running') {
      if (p.remainingSeconds > 0) {
        p.remainingSeconds -= 1;
        shouldBroadcast = true;
      }
      if (p.remainingSeconds <= 0) {
        handlePomodoroIntervalReachedZero();
        return;
      }
    } else if (p.status === 'overtime') {
      p.overtimeSeconds += 1;
      shouldBroadcast = true;
    }

    // 2. Check if snooze expired
    if (runtimeState.isSnoozed && runtimeState.snoozeUntil && Date.now() >= runtimeState.snoozeUntil) {
      triggerAlert(null, 'test');
      return;
    }

    // 3. Check daily 16:00 Back-Home wakeTime
    if (config.alarmEnabled && config.wakeTime) {
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentHM = `${hh}:${mm}`;
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${currentHM}`;

      if (currentHM === config.wakeTime && runtimeState.lastTriggeredKey !== dateKey) {
        runtimeState.lastTriggeredKey = dateKey;
        triggerAlert(null, 'back-home');
        return;
      }
    }

    if (shouldBroadcast) {
      broadcastState();
    }
  }, 1000);
}

function formatMMSS(sec) {
  const abs = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(abs / 60)).padStart(2, '0');
  const s = String(abs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function rebuildTrayMenu() {
  if (!tray) return;

  const p = runtimeState.pomodoro;
  const phaseLabel =
    p.phase === 'focus'
      ? t('🍅 โฟกัส', '🍅 Focus')
      : p.phase === 'shortBreak'
      ? t('☕ พักสั้น', '☕ Short Break')
      : t('🌴 พักยาว', '🌴 Long Break');
  const timeStr =
    p.status === 'overtime'
      ? `+${formatMMSS(p.overtimeSeconds)} (${t('ล่วงเวลา', 'Overtime')})`
      : formatMMSS(p.remainingSeconds);

  const contextMenu = Menu.buildFromTemplate([
    { label: `🍅 Pomodoro Cartoon Companion — ${config.characterName}`, enabled: false },
    { label: `${phaseLabel} — ${timeStr} [${p.status.toUpperCase()}]`, enabled: false },
    { type: 'separator' },
    {
      label:
        p.status === 'running'
          ? p.strictLocked
            ? t('🔒 โหมดเข้มงวดล็อกการหยุดพัก', '🔒 Strict Mode Locked')
            : t('⏸️ หยุดชั่วคราว', '⏸️ Pause Pomodoro')
          : t('▶️ เริ่ม / ทำต่อ', '▶️ Start / Resume Pomodoro'),
      enabled: !p.strictLocked,
      click: () => pomodoroStartPause()
    },
    {
      label: t('⏭️ ข้ามไปช่วงถัดไป', '⏭️ Skip Interval'),
      enabled: !p.strictLocked,
      click: () => pomodoroSkip(true)
    },
    {
      label: t('🔄 รีเซ็ตเวลารอบนี้', '🔄 Reset Current Interval'),
      enabled: !p.strictLocked,
      click: () => pomodoroReset(false)
    },
    { type: 'separator' },
    {
      label: t('🔔 ทดสอบแจ้งเตือนการ์ตูน', '🔔 Test Cartoon Alert'),
      click: () => triggerAlert(null, 'test')
    },
    {
      label: t('💤 เลื่อนแจ้งเตือน', '💤 Snooze'),
      submenu: [
        { label: t('+5 นาที', '+5 Minutes'), click: () => snoozeAlert(5) },
        { label: t('+10 นาที', '+10 Minutes'), click: () => snoozeAlert(10) },
        { label: t('+15 นาที', '+15 Minutes'), click: () => snoozeAlert(15) }
      ]
    },
    {
      label: t('✅ ปิดแจ้งเตือน', '✅ Dismiss Alert'),
      enabled: runtimeState.isAlerting || runtimeState.isSnoozed,
      click: () => dismissAlert()
    },
    { type: 'separator' },
    {
      label: t('📍 ตำแหน่งบนหน้าจอ', '📍 Screen Position'),
      submenu: [
        {
          label: t('มุมขวาล่าง (Taskbar)', 'Bottom-Right (Taskbar)'),
          type: 'radio',
          checked: config.positionPreset === 'bottom-right',
          click: () => updateConfig({ positionPreset: 'bottom-right', offsetX: 0, offsetY: 0 })
        },
        {
          label: t('กึ่งกลางด้านล่าง', 'Bottom-Center'),
          type: 'radio',
          checked: config.positionPreset === 'bottom-center',
          click: () => updateConfig({ positionPreset: 'bottom-center', offsetX: 0, offsetY: 0 })
        },
        {
          label: t('มุมซ้ายล่าง', 'Bottom-Left'),
          type: 'radio',
          checked: config.positionPreset === 'bottom-left',
          click: () => updateConfig({ positionPreset: 'bottom-left', offsetX: 0, offsetY: 0 })
        },
        {
          label: t('มุมขวาบน', 'Top-Right'),
          type: 'radio',
          checked: config.positionPreset === 'top-right',
          click: () => updateConfig({ positionPreset: 'top-right', offsetX: 0, offsetY: 0 })
        }
      ]
    },
    {
      label: t('🌐 ภาษา (Language)', '🌐 Language (TH/EN)'),
      submenu: [
        {
          label: '🇹🇭 ภาษาไทย (TH)',
          type: 'radio',
          checked: config.language !== 'en',
          click: () => updateConfig({ language: 'th' })
        },
        {
          label: '🇬🇧 English (EN)',
          type: 'radio',
          checked: config.language === 'en',
          click: () => updateConfig({ language: 'en' })
        }
      ]
    },
    { type: 'separator' },
    {
      label: t('⚙️ ตั้งค่าโพโมโดโรและชุดธีม...', '⚙️ Open Settings & Theme Studio...'),
      click: () => openSettingsWindow('main')
    },
    {
      label: t('🔄 ตรวจสอบอัปเดตแอป...', '🔄 Check for Updates...'),
      click: () => {
        openSettingsWindow('about');
        if (updateManager) {
          updateManager.checkForUpdates();
        }
      }
    },
    {
      label: t(`ℹ️ เกี่ยวกับ & บันทึกเวอร์ชัน (v${getCurrentAppVersion()})...`, `ℹ️ About & Release Notes (v${getCurrentAppVersion()})...`),
      click: () => openSettingsWindow('about')
    },
    { type: 'separator' },
    {
      label: p.strictLocked
        ? t('🔒 ห้ามปิดแอปขณะโหมดเข้มงวดทำงาน', '🔒 Locked by Strict Mode')
        : t('❌ ออกจากโปรแกรม', '❌ Quit Pomodoro Cartoon Companion'),
      enabled: !p.strictLocked,
      click: () => {
        if (runtimeState.pomodoro.strictLocked) return;
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip(`Pomodoro Cartoon Companion — ${phaseLabel}: ${timeStr}`);
  tray.setContextMenu(contextMenu);
}

function updateConfig(partial) {
  const prevWakeTime = config.wakeTime;
  const prevThemeSet = config.activeThemeSet;
  const mergedPomodoro = partial.pomodoro
    ? { ...config.pomodoro, ...partial.pomodoro }
    : config.pomodoro;

  if (partial.activeThemeSet && partial.activeThemeSet !== prevThemeSet) {
    runtimeState.forcedBehavior = null;
    if (!partial.idleBehavior) {
      partial.idleBehavior = 'cycle';
    }
  }

  config = {
    ...config,
    ...partial,
    pomodoro: mergedPomodoro
  };

  if (partial.wakeTime && partial.wakeTime !== prevWakeTime) {
    runtimeState.lastTriggeredKey = null;
  }

  // If timer is idle, immediately update remainingSeconds to reflect newly edited focus/break minutes
  if (partial.pomodoro && runtimeState.pomodoro.status === 'idle') {
    const newDur = getPhaseDurationSeconds(runtimeState.pomodoro.phase);
    runtimeState.pomodoro.totalSeconds = newDur;
    runtimeState.pomodoro.remainingSeconds = newDur;
  }

  saveConfigToFile();
  applyOverlayBounds();
  updateOverlayVisibility();
  broadcastState();
  broadcastConfig();
}

function setupIPC() {
  ipcMain.handle('get-config', () => config);
  ipcMain.handle('get-state', () => runtimeState);

  ipcMain.handle('get-app-info', () => {
    let releasesData = { appName: 'Pomodoro Cartoon Companion', currentVersion: '1.2.0', releases: [] };
    try {
      const relPath = path.join(__dirname, 'releases.json');
      if (fs.existsSync(relPath)) {
        releasesData = JSON.parse(fs.readFileSync(relPath, 'utf-8'));
      }
    } catch (e) {
      console.warn('Could not read releases.json:', e);
    }
    return {
      ...releasesData,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      configPath: getConfigPath(),
      themesDir: getThemeSetsDir(),
      updatesDir: getUpdatesDir()
    };
  });

  ipcMain.handle('get-update-state', () => {
    return updateManager ? updateManager.getState() : { status: 'idle' };
  });

  ipcMain.handle('check-for-updates', async () => {
    if (!updateManager) return { status: 'error', errorMessage: 'UpdateManager not initialized' };
    return await updateManager.checkForUpdates();
  });

  ipcMain.handle('download-update', async () => {
    if (!updateManager) return { status: 'error', errorMessage: 'UpdateManager not initialized' };
    return await updateManager.downloadAndApplyUpdate(() => {
      // Reload theme sets if new themes were unpacked by update
      const folderThemes = loadThemeSetsFromFolder();
      config.customThemeSets = {
        ...folderThemes,
        ...(config.customThemeSets || {})
      };
      saveConfigToFile();
      broadcastConfig();
    });
  });

  ipcMain.handle('install-update-now', () => {
    if (updateManager) {
      updateManager.quitAndInstall();
    }
    return true;
  });

  ipcMain.handle('open-updates-folder', async () => {
    const dir = updateManager
      ? updateManager.resolveFeedDirectory(config.updateFeedUrl)
      : getUpdatesDir();
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {}
    }
    await shell.openPath(dir);
    return dir;
  });

  ipcMain.handle('save-config', (_event, partial) => {
    updateConfig(partial);
    return config;
  });

  ipcMain.handle('save-custom-theme-set', (_event, rawThemeSet) => {
    if (!rawThemeSet || (!rawThemeSet.nameTh && !rawThemeSet.nameEn && !rawThemeSet.name)) {
      throw new Error('Theme Set must include a name (nameTh, nameEn, or name).');
    }
    const themeSet = normalizeThemeSet(rawThemeSet);

    try {
      const themesDir = getThemeSetsDir();
      if (!fs.existsSync(themesDir)) {
        fs.mkdirSync(themesDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(themesDir, `${themeSet.id}.json`),
        JSON.stringify(themeSet, null, 2),
        'utf-8'
      );
    } catch (e) {
      console.warn('Could not write theme set file:', e);
    }

    const updatedCustomThemeSets = {
      ...(config.customThemeSets || {}),
      [themeSet.id]: themeSet
    };

    updateConfig({
      customThemeSets: updatedCustomThemeSets,
      activeThemeSet: themeSet.id,
      characterName: themeSet.characterName || themeSet.nameTh || themeSet.nameEn,
      alertMessage: themeSet.alertMessageFocusEnd || config.alertMessage
    });
    return config;
  });

  ipcMain.handle('delete-custom-theme-set', (_event, themeSetId) => {
    const updatedCustom = { ...(config.customThemeSets || {}) };
    delete updatedCustom[themeSetId];
    try {
      const file = path.join(getThemeSetsDir(), `${themeSetId}.json`);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch (e) {
      console.warn('Could not delete theme set file:', e);
    }
    const nextTheme = config.activeThemeSet === themeSetId ? 'farmer' : config.activeThemeSet;
    updateConfig({
      customThemeSets: updatedCustom,
      activeThemeSet: nextTheme
    });
    return config;
  });

  ipcMain.handle('import-shared-bundle', (_event, bundleObj) => {
    if (!bundleObj || typeof bundleObj !== 'object') {
      throw new Error('Invalid JSON bundle.');
    }

    // Case 1: Full Settings + Theme Set Share Bundle (`type === 'pomodoro-theme-bundle'` or has `config` + `themeSet`)
    if (bundleObj.themeSet || bundleObj.config) {
      const updates = { ...(bundleObj.config || {}) };
      if (bundleObj.themeSet) {
        const ts = normalizeThemeSet(bundleObj.themeSet);
        try {
          const themesDir = getThemeSetsDir();
          if (!fs.existsSync(themesDir)) fs.mkdirSync(themesDir, { recursive: true });
          fs.writeFileSync(path.join(themesDir, `${ts.id}.json`), JSON.stringify(ts, null, 2), 'utf-8');
        } catch (e) {}
        updates.customThemeSets = {
          ...(config.customThemeSets || {}),
          ...(updates.customThemeSets || {}),
          [ts.id]: ts
        };
        updates.activeThemeSet = ts.id;
        if (ts.characterName) updates.characterName = ts.characterName;
      }
      updateConfig(updates);
      return config;
    }

    // Case 2: Standalone Theme Set JSON
    const ts = normalizeThemeSet(bundleObj);
    try {
      const themesDir = getThemeSetsDir();
      if (!fs.existsSync(themesDir)) fs.mkdirSync(themesDir, { recursive: true });
      fs.writeFileSync(path.join(themesDir, `${ts.id}.json`), JSON.stringify(ts, null, 2), 'utf-8');
    } catch (e) {}

    updateConfig({
      customThemeSets: {
        ...(config.customThemeSets || {}),
        [ts.id]: ts
      },
      activeThemeSet: ts.id,
      characterName: ts.characterName || ts.nameTh || ts.nameEn
    });
    return config;
  });

  // Pomodoro IPC handlers
  ipcMain.handle('pomodoro-start-pause', () => pomodoroStartPause());
  ipcMain.handle('pomodoro-skip', (_event, autoStartNext) => pomodoroSkip(autoStartNext));
  ipcMain.handle('pomodoro-reset', (_event, resetCycles) => pomodoroReset(resetCycles));
  ipcMain.handle('pomodoro-set-phase', (_event, phase) => pomodoroSetPhase(phase));

  ipcMain.handle('trigger-test-alert', (_event, behavior) => {
    triggerAlert(behavior || null, 'test');
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
    broadcastState();
    broadcastConfig();
    return runtimeState;
  });

  ipcMain.handle('open-settings', (_event, tab) => {
    openSettingsWindow(tab || 'main');
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

    updateManager = new UpdateManager({
      rootDir: app.isPackaged ? path.dirname(process.execPath) : __dirname,
      getCurrentVersion: getCurrentAppVersion,
      getFeedSource: () => config.updateFeedUrl || './updates',
      onStatusChange: (updState) => {
        if (settingsWindow && !settingsWindow.isDestroyed()) {
          settingsWindow.webContents.send('update-state-changed', updState);
        }
      }
    });

    setupIPC();

    tray = new Tray(createCompanionTrayIcon());
    tray.on('click', () => openSettingsWindow());
    tray.on('double-click', () => openSettingsWindow());
    rebuildTrayMenu();

    createOverlayWindow();
    startScheduler();

    if (process.argv.includes('--open-settings')) {
      openSettingsWindow();
    }

    if (config.autoCheckUpdates) {
      setTimeout(() => {
        if (updateManager) updateManager.checkForUpdates();
      }, 2500);
    }

    screen.on('display-metrics-changed', () => {
      applyOverlayBounds();
    });
  });
}

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
