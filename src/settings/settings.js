const previewCanvas = document.getElementById('previewCanvas');
const previewThemeBadge = document.getElementById('previewThemeBadge');
const statusPill = document.getElementById('statusPill');
const btnTriggerAlertNow = document.getElementById('btnTriggerAlertNow');
const btnDismissNow = document.getElementById('btnDismissNow');
const behaviorButtons = document.querySelectorAll('#behaviorButtons .behavior-chip');

const selectTheme = document.getElementById('selectTheme');
const farmerOutfitGroup = document.getElementById('farmerOutfitGroup');
const selectSkin = document.getElementById('selectSkin');
const btnOpenThemeBuilder = document.getElementById('btnOpenThemeBuilder');
const btnOpenImportModal = document.getElementById('btnOpenImportModal');
const btnExportTheme = document.getElementById('btnExportTheme');
const btnDeleteCustomTheme = document.getElementById('btnDeleteCustomTheme');
const fileImportInput = document.getElementById('fileImportInput');

const inputWakeTime = document.getElementById('inputWakeTime');
const selectSnooze = document.getElementById('selectSnooze');
const inputAlertMessage = document.getElementById('inputAlertMessage');
const chkAlarmEnabled = document.getElementById('chkAlarmEnabled');
const chkSoundEnabled = document.getElementById('chkSoundEnabled');

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

// Theme Studio Modal elements
const themeModal = document.getElementById('themeModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const tabBtnVisual = document.getElementById('tabBtnVisual');
const tabBtnJson = document.getElementById('tabBtnJson');
const tabPaneVisual = document.getElementById('tabPaneVisual');
const tabPaneJson = document.getElementById('tabPaneJson');

const genThemeName = document.getElementById('genThemeName');
const genCharName = document.getElementById('genCharName');
const genHatStyle = document.getElementById('genHatStyle');
const genVehicleStyle = document.getElementById('genVehicleStyle');
const genColorHat = document.getElementById('genColorHat');
const genColorShirt = document.getElementById('genColorShirt');
const genColorOveralls = document.getElementById('genColorOveralls');
const genColorVehicle = document.getElementById('genColorVehicle');
const genColorGround = document.getElementById('genColorGround');
const genAlertMessage = document.getElementById('genAlertMessage');
const genSpriteUrl = document.getElementById('genSpriteUrl');
const genBTractor = document.getElementById('genBTractor');
const genBMachete = document.getElementById('genBMachete');
const genBWater = document.getElementById('genBWater');
const genBPlant = document.getElementById('genBPlant');
const genBPalm = document.getElementById('genBPalm');
const genBFert = document.getElementById('genBFert');

const jsonThemeEditor = document.getElementById('jsonThemeEditor');
const btnBrowseJsonFile = document.getElementById('btnBrowseJsonFile');
const btnCopyAiPrompt = document.getElementById('btnCopyAiPrompt');
const btnRandomizeTheme = document.getElementById('btnRandomizeTheme');
const btnSaveGeneratedTheme = document.getElementById('btnSaveGeneratedTheme');

let activeModalTab = 'visual'; // 'visual' | 'json'

let toastTimeout = null;
function showToast(text = 'Settings saved!') {
  toastMsg.textContent = text;
  toastMsg.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMsg.classList.remove('show');
  }, 1900);
}

// Start Live Preview Engine
const previewEngine = new FarmerEngine(previewCanvas, {
  isPreview: true
});
previewEngine.start();

let configState = {};
let runtimeState = {};

function rebuildThemeSelector(cfg) {
  const builtin = window.BUILTIN_THEMES || {};
  const custom = cfg.customThemes || {};
  const currentThemeId = cfg.activeTheme || 'farmer';

  selectTheme.innerHTML = '';

  const optGroupBuiltin = document.createElement('optgroup');
  optGroupBuiltin.label = '🌟 Built-in Cartoon Themes';
  Object.values(builtin).forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    optGroupBuiltin.appendChild(opt);
  });
  selectTheme.appendChild(optGroupBuiltin);

  const customList = Object.values(custom);
  if (customList.length > 0) {
    const optGroupCustom = document.createElement('optgroup');
    optGroupCustom.label = '🎨 User Generated & Imported Themes';
    customList.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.name} (Custom)`;
      optGroupCustom.appendChild(opt);
    });
    selectTheme.appendChild(optGroupCustom);
  }

  selectTheme.value = currentThemeId;
  const isCustom = Boolean(custom[currentThemeId] && !builtin[currentThemeId]);
  btnDeleteCustomTheme.style.display = isCustom ? 'inline-block' : 'none';
  farmerOutfitGroup.style.display = currentThemeId === 'farmer' ? 'flex' : 'none';
}

function updateBehaviorChipsLabels() {
  const keys = ['tractor', 'machete', 'water', 'plant', 'palm', 'fertilizer', 'fix'];
  keys.forEach((k) => {
    const el = document.getElementById(`chip-${k}`);
    if (!el) return;
    const meta = previewEngine.getBehaviorMeta(k);
    const shortLabel = (meta.label || k).split('(')[0].trim();
    el.textContent = `${meta.icon || '✨'} ${shortLabel}`;
  });
}

function syncUIFromConfig(cfg) {
  configState = cfg;
  previewEngine.setConfig(cfg);
  if (runtimeState.forcedBehavior) {
    previewEngine.setBehaviorMode(runtimeState.forcedBehavior);
  }

  rebuildThemeSelector(cfg);
  updateBehaviorChipsLabels();

  const activeTheme = previewEngine.getActiveTheme();
  previewThemeBadge.textContent = activeTheme.name || 'Farmer';

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

// Switch Active Theme
selectTheme.addEventListener('change', () => {
  const themeId = selectTheme.value;
  const allThemes = {
    ...(window.BUILTIN_THEMES || {}),
    ...(configState.customThemes || {})
  };
  const chosen = allThemes[themeId];
  const partial = { activeTheme: themeId };
  if (chosen) {
    if (chosen.characterName) partial.characterName = chosen.characterName;
    if (chosen.alertMessage) partial.alertMessage = chosen.alertMessage;
  }
  savePartial(partial, `🎨 Switched theme to ${chosen ? chosen.name : themeId}`);
});

// Delete Custom Theme
btnDeleteCustomTheme.addEventListener('click', async () => {
  const themeId = selectTheme.value;
  if (!themeId || (window.BUILTIN_THEMES && window.BUILTIN_THEMES[themeId])) return;
  const updated = await window.farmerAPI.deleteCustomTheme(themeId);
  syncUIFromConfig(updated);
  showToast('🗑️ Deleted custom theme');
});

// Export Active Theme to .json file
btnExportTheme.addEventListener('click', () => {
  const activeTheme = previewEngine.getActiveTheme();
  const jsonStr = JSON.stringify(activeTheme, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activeTheme.id || 'custom-theme'}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`📤 Exported ${activeTheme.id}.json`);
});

// Parse "Emoji Label" helper
function splitEmojiAndLabel(str, fallbackEmoji) {
  const trimmed = String(str || '').trim();
  const match = trimmed.match(/^(\S+)\s+(.+)$/);
  if (match && match[1].length <= 4) {
    return { icon: match[1], label: match[2] };
  }
  return { icon: fallbackEmoji, label: trimmed || 'Action' };
}

function buildThemeObjectFromVisualForm() {
  const rawName = genThemeName.value.trim() || '✨ Custom Hero';
  const slug = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `custom-${Date.now()}`;

  return {
    id: slug,
    name: rawName,
    characterName: genCharName.value.trim() || rawName,
    alertMessage: genAlertMessage.value.trim() || '16:00 Back Home Time! 🏡 เลิกงานแล้ว กลับบ้านกัน!',
    hatStyle: genHatStyle.value,
    vehicleStyle: genVehicleStyle.value,
    groundColor: genColorGround.value,
    customSpriteUrl: genSpriteUrl.value.trim() || '',
    skin: {
      name: genCharName.value.trim() || rawName,
      skinTone: '#F3C6A0',
      cheek: '#F28B82',
      hatMain: genColorHat.value,
      hatDark: genColorOveralls.value,
      hatBand: genColorVehicle.value,
      shirt: genColorShirt.value,
      shirtSleeve: genColorShirt.value,
      overalls: genColorOveralls.value,
      kamarBelt: false,
      pants: '#1E293B',
      boots: '#3E2723',
      sunglasses: genHatStyle.value === 'samurai-helm',
      mustache: false
    },
    vehicle: {
      bodyColor: genColorVehicle.value,
      trimColor: genColorHat.value,
      wheelColor: '#212121',
      rimColor: genColorGround.value,
      smokeColor: '#E0F7FA'
    },
    behaviors: {
      tractor: splitEmojiAndLabel(genBTractor.value, '🚜'),
      machete: splitEmojiAndLabel(genBMachete.value, '⚔️'),
      water: splitEmojiAndLabel(genBWater.value, '🚿'),
      plant: splitEmojiAndLabel(genBPlant.value, '🌱'),
      palm: splitEmojiAndLabel(genBPalm.value, '🌴'),
      fertilizer: splitEmojiAndLabel(genBFert.value, '✨'),
      fix: { icon: '🔧', label: 'Fixing & Upgrading Gear (ซ่อมอุปกรณ์)' }
    }
  };
}

function openModal(tab = 'visual') {
  themeModal.classList.add('open');
  switchModalTab(tab);
}

function switchModalTab(tab) {
  activeModalTab = tab;
  tabBtnVisual.classList.toggle('active', tab === 'visual');
  tabBtnJson.classList.toggle('active', tab === 'json');
  tabPaneVisual.style.display = tab === 'visual' ? 'block' : 'none';
  tabPaneJson.style.display = tab === 'json' ? 'block' : 'none';

  if (tab === 'json') {
    const obj = buildThemeObjectFromVisualForm();
    jsonThemeEditor.value = JSON.stringify(obj, null, 2);
  }
}

btnOpenThemeBuilder.addEventListener('click', () => openModal('visual'));
btnOpenImportModal.addEventListener('click', () => openModal('json'));
btnCloseModal.addEventListener('click', () => themeModal.classList.remove('open'));
tabBtnVisual.addEventListener('click', () => switchModalTab('visual'));
tabBtnJson.addEventListener('click', () => switchModalTab('json'));

// Randomize Generator Colors & Style
btnRandomizeTheme.addEventListener('click', () => {
  const presets = [
    {
      name: '🏴‍☠️ Pirate King (ราชาโจรสลัด)',
      char: 'Captain Luffy-Som',
      hat: 'crown',
      veh: 'scooter',
      cHat: '#FFD54F',
      cShirt: '#D32F2F',
      cOver: '#212121',
      cVeh: '#6D4C41',
      cGrd: '#26C6DA',
      msg: '16:00 Set Sail Home! 🏴‍☠️ ได้เวลาออกเรือกลับบ้าน!'
    },
    {
      name: '🧙‍♀️ Mystic Witch (แม่มดอวกาศ)',
      char: 'Luna Starweaver',
      hat: 'wizard-hat',
      veh: 'magic-broom',
      cHat: '#6A1B9A',
      cShirt: '#AB47BC',
      cOver: '#283593',
      cVeh: '#8D6E63',
      cGrd: '#CE93D8',
      msg: '16:00 Spell Complete! ✨ เสกคาถากลับบ้าน!'
    },
    {
      name: '🤖 Mecha Pilot (นักบินหุ่นรบ)',
      char: 'Commander Zero',
      hat: 'samurai-helm',
      veh: 'hover-bike',
      cHat: '#263238',
      cShirt: '#00ACC1',
      cOver: '#0F172A',
      cVeh: '#FF007F',
      cGrd: '#00E5FF',
      msg: '16:00 Mission Accomplished! ⚡ ถอนกำลังกลับฐานทัพ!'
    },
    {
      name: '☕ Barista Roaster (บาริสต้าสายชิล)',
      char: 'Barista Non',
      hat: 'cap',
      veh: 'scooter',
      cHat: '#4E342E',
      cShirt: '#D7CCC8',
      cOver: '#5D4037',
      cVeh: '#388E3C',
      cGrd: '#81C784',
      msg: '16:00 Cafe Closed! ☕ ปิดร้านกาแฟ กลับบ้านพักผ่อน!'
    }
  ];
  const pick = presets[Math.floor(Math.random() * presets.length)];
  genThemeName.value = pick.name;
  genCharName.value = pick.char;
  genHatStyle.value = pick.hat;
  genVehicleStyle.value = pick.veh;
  genColorHat.value = pick.cHat;
  genColorShirt.value = pick.cShirt;
  genColorOveralls.value = pick.cOver;
  genColorVehicle.value = pick.cVeh;
  genColorGround.value = pick.cGrd;
  genAlertMessage.value = pick.msg;

  if (activeModalTab === 'json') {
    jsonThemeEditor.value = JSON.stringify(buildThemeObjectFromVisualForm(), null, 2);
  }
  showToast(`🎲 Randomized: ${pick.name}`);
});

// Browse .json file from disk
btnBrowseJsonFile.addEventListener('click', () => {
  fileImportInput.click();
});

fileImportInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    jsonThemeEditor.value = String(reader.result || '');
    showToast(`📂 Loaded ${file.name} — Click Save & Apply!`);
  };
  reader.readAsText(file);
  fileImportInput.value = '';
});

// Copy AI Prompt to Clipboard
btnCopyAiPrompt.addEventListener('click', () => {
  const sample = buildThemeObjectFromVisualForm();
  const promptText = `Generate a custom Cartoon Theme JSON for my Windows Taskbar Companion App.
Create a unique character theme (for example: Ninja, Astronaut, Cat Cafe Barista, Viking, Firefighter, etc.) and return ONLY valid JSON matching this exact structure:

${JSON.stringify(sample, null, 2)}

Allowed "hatStyle" values: "straw-hat", "chef-hat", "wizard-hat", "samurai-helm", "crown", "cap".
Allowed "vehicleStyle" values: "tractor", "scooter", "magic-broom", "hover-bike".`;

  navigator.clipboard.writeText(promptText);
  showToast('📋 Copied AI Theme Prompt to clipboard!');
});

// Save & Apply Custom Theme (from Visual Tab or JSON Tab)
btnSaveGeneratedTheme.addEventListener('click', async () => {
  try {
    let themeObj;
    if (activeModalTab === 'json') {
      themeObj = JSON.parse(jsonThemeEditor.value);
    } else {
      themeObj = buildThemeObjectFromVisualForm();
    }

    if (!themeObj || !themeObj.id || !themeObj.name) {
      showToast('❌ Invalid Theme JSON: Must include "id" and "name"');
      return;
    }

    const updatedCfg = await window.farmerAPI.saveCustomTheme(themeObj);
    syncUIFromConfig(updatedCfg);
    themeModal.classList.remove('open');
    showToast(`🎉 Saved & Activated Theme: ${themeObj.name}`);
  } catch (err) {
    showToast(`❌ JSON Error: ${err.message}`);
  }
});

// Behavior selection buttons
behaviorButtons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const b = btn.dataset.behavior;
    previewEngine.setBehaviorMode(b);
    await window.farmerAPI.setBehaviorNow(b);
    showToast(`Switched action to: ${btn.textContent.trim()}`);
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
  savePartial(
    {
      positionPreset: selectPositionPreset.value,
      offsetX: 0,
      offsetY: 0
    },
    `📍 Position moved to ${selectPositionPreset.value}`
  );
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
