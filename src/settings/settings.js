const previewCanvas = document.getElementById('previewCanvas');
const statusPill = document.getElementById('statusPill');
const btnTriggerAlertNow = document.getElementById('btnTriggerAlertNow');
const btnDismissNow = document.getElementById('btnDismissNow');
const behaviorButtons = document.querySelectorAll('#behaviorButtons .behavior-chip');

const inputWakeTime = document.getElementById('inputWakeTime');
const selectSnooze = document.getElementById('selectSnooze');
const inputAlertMessage = document.getElementById('inputAlertMessage');
const chkAlarmEnabled = document.getElementById('chkAlarmEnabled');
const chkSoundEnabled = document.getElementById('chkSoundEnabled');

const selectSkin = document.getElementById('selectSkin');
const inputCharacterName = document.getElementById('inputCharacterName');
const rangeScale = document.getElementById('rangeScale');
const valScale = document.getElementById('valScale');
const rangeSpeed = document.getElementById('rangeSpeed');
const valSpeed = document.getElementById('valSpeed');

const selectVisibilityMode = document.getElementById('selectVisibilityMode');
const selectPositionPreset = document.getElementById('selectPositionPreset');
const rangeOffsetX = document.getElementById('rangeOffsetX');
const valOffsetX = document.getElementById('valOffsetX');
const rangeOffsetY = document.getElementById('rangeOffsetY');
const valOffsetY = document.getElementById('valOffsetY');
const toastMsg = document.getElementById('toastMsg');

let toastTimeout = null;
function showToast(text = 'Settings saved!') {
  toastMsg.textContent = text;
  toastMsg.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMsg.classList.remove('show');
  }, 1600);
}

// Start Live Preview Engine
const previewEngine = new FarmerEngine(previewCanvas, {
  isPreview: true
});
previewEngine.start();

let configState = {};
let runtimeState = {};

function syncUIFromConfig(cfg) {
  configState = cfg;

  inputWakeTime.value = cfg.wakeTime || '16:00';
  selectSnooze.value = String(cfg.snoozeMinutes || 10);
  inputAlertMessage.value = cfg.alertMessage || '';
  chkAlarmEnabled.checked = cfg.alarmEnabled !== false;
  chkSoundEnabled.checked = cfg.soundEnabled !== false;

  selectSkin.value = cfg.characterSkin || 'thai-kamar';
  inputCharacterName.value = cfg.characterName || 'Uncle Somchai (ลุงสมชาย)';

  const scale = Number(cfg.scale) || 1.0;
  rangeScale.value = String(scale);
  valScale.textContent = `${scale.toFixed(2)}x`;

  const speed = Number(cfg.walkSpeed) || 1.0;
  rangeSpeed.value = String(speed);
  valSpeed.textContent = `${speed.toFixed(1)}x`;

  selectVisibilityMode.value = cfg.visibilityMode || 'both';
  selectPositionPreset.value = cfg.positionPreset || 'bottom-right';

  const ox = Number(cfg.offsetX) || 0;
  rangeOffsetX.value = String(ox);
  valOffsetX.textContent = `${ox} px`;

  const oy = Number(cfg.offsetY) || 0;
  rangeOffsetY.value = String(oy);
  valOffsetY.textContent = `${oy} px`;

  const activeB = runtimeState.forcedBehavior || cfg.idleBehavior || 'cycle';
  behaviorButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.behavior === activeB);
  });

  previewEngine.setConfig(cfg);
  if (runtimeState.forcedBehavior) {
    previewEngine.setBehaviorMode(runtimeState.forcedBehavior);
  }
}

function syncStatusPill() {
  if (runtimeState.isAlerting) {
    statusPill.textContent = '🔔 ALERTING NOW (Back Home Time!)';
    statusPill.classList.add('alerting');
  } else if (runtimeState.isSnoozed && runtimeState.snoozeUntil) {
    const t = new Date(runtimeState.snoozeUntil).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    statusPill.textContent = `💤 Snoozed until ${t}`;
    statusPill.classList.remove('alerting');
  } else {
    statusPill.textContent = `⏰ Next Alert: ${configState.wakeTime || '16:00'}`;
    statusPill.classList.remove('alerting');
  }
  previewEngine.setAlerting(runtimeState.isAlerting);
}

async function savePartial(partial, toastLabel) {
  const updated = await window.farmerAPI.saveConfig(partial);
  syncUIFromConfig(updated);
  syncStatusPill();
  showToast(toastLabel || 'Saved & applied!');
}

// Initial load
Promise.all([window.farmerAPI.getConfig(), window.farmerAPI.getState()]).then(
  ([cfg, st]) => {
    runtimeState = st;
    syncUIFromConfig(cfg);
    syncStatusPill();
  }
);

window.farmerAPI.onConfigUpdated((cfg) => {
  syncUIFromConfig(cfg);
  syncStatusPill();
});

window.farmerAPI.onStateUpdated((st) => {
  runtimeState = st;
  syncUIFromConfig(configState);
  syncStatusPill();
});

// Behavior selection buttons
behaviorButtons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const b = btn.dataset.behavior;
    previewEngine.setBehaviorMode(b);
    await window.farmerAPI.setBehaviorNow(b);
    showToast(`Switched behavior to: ${btn.textContent.trim()}`);
  });
});

// Test Alert & Dismiss buttons
btnTriggerAlertNow.addEventListener('click', async () => {
  await window.farmerAPI.triggerTestAlert();
  showToast('🔔 Triggered 16:00 Alert on Taskbar!');
});

btnDismissNow.addEventListener('click', async () => {
  await window.farmerAPI.dismissAlert();
  showToast('✅ Alert dismissed');
});

// Form listeners
inputWakeTime.addEventListener('change', () => {
  savePartial({ wakeTime: inputWakeTime.value || '16:00' }, `⏰ Wake time set to ${inputWakeTime.value}`);
});

selectSnooze.addEventListener('change', () => {
  savePartial({ snoozeMinutes: Number(selectSnooze.value) }, `💤 Default snooze: ${selectSnooze.value}m`);
});

inputAlertMessage.addEventListener('change', () => {
  savePartial({ alertMessage: inputAlertMessage.value });
});

chkAlarmEnabled.addEventListener('change', () => {
  savePartial({ alarmEnabled: chkAlarmEnabled.checked });
});

chkSoundEnabled.addEventListener('change', () => {
  savePartial({ soundEnabled: chkSoundEnabled.checked });
});

selectSkin.addEventListener('change', () => {
  const skinMeta = window.FARMER_SKINS[selectSkin.value];
  const partial = { characterSkin: selectSkin.value };
  if (skinMeta && skinMeta.name) {
    partial.characterName = skinMeta.name;
    inputCharacterName.value = skinMeta.name;
  }
  savePartial(partial, `👕 Outfit changed to ${selectSkin.options[selectSkin.selectedIndex].text}`);
});

inputCharacterName.addEventListener('change', () => {
  savePartial({ characterName: inputCharacterName.value });
});

rangeScale.addEventListener('input', () => {
  valScale.textContent = `${Number(rangeScale.value).toFixed(2)}x`;
});
rangeScale.addEventListener('change', () => {
  savePartial({ scale: Number(rangeScale.value) });
});

rangeSpeed.addEventListener('input', () => {
  valSpeed.textContent = `${Number(rangeSpeed.value).toFixed(1)}x`;
  previewEngine.walkSpeed = Number(rangeSpeed.value);
});
rangeSpeed.addEventListener('change', () => {
  savePartial({ walkSpeed: Number(rangeSpeed.value) });
});

selectVisibilityMode.addEventListener('change', () => {
  savePartial({ visibilityMode: selectVisibilityMode.value });
});

selectPositionPreset.addEventListener('change', () => {
  savePartial({
    positionPreset: selectPositionPreset.value,
    offsetX: 0,
    offsetY: 0
  }, `📍 Position moved to ${selectPositionPreset.value}`);
});

rangeOffsetX.addEventListener('input', () => {
  valOffsetX.textContent = `${rangeOffsetX.value} px`;
});
rangeOffsetX.addEventListener('change', () => {
  savePartial({ offsetX: Number(rangeOffsetX.value) });
});

rangeOffsetY.addEventListener('input', () => {
  valOffsetY.textContent = `${rangeOffsetY.value} px`;
});
rangeOffsetY.addEventListener('change', () => {
  savePartial({ offsetY: Number(rangeOffsetY.value) });
});
