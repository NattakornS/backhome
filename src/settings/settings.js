const previewCanvas = document.getElementById('previewCanvas');
const previewThemeBadge = document.getElementById('previewThemeBadge');
const selectLanguage = document.getElementById('selectLanguage');
const btnTriggerAlertNow = document.getElementById('btnTriggerAlertNow');
const btnDismissNow = document.getElementById('btnDismissNow');
const behaviorButtonsContainer = document.getElementById('behaviorButtonsContainer');

// Top View Navigation (Settings vs About & Release Notes)
const navBtnMain = document.getElementById('navBtnMain');
const navBtnAbout = document.getElementById('navBtnAbout');
const viewMain = document.getElementById('viewMain');
const viewAbout = document.getElementById('viewAbout');
const hdrVersionPill = document.getElementById('hdrVersionPill');
const aboutVersionBadge = document.getElementById('aboutVersionBadge');
const releaseNotesList = document.getElementById('releaseNotesList');
const valConfigPath = document.getElementById('valConfigPath');
const valThemesDir = document.getElementById('valThemesDir');
const badgeElectronVer = document.getElementById('badgeElectronVer');

// Pomodoro Dashboard elements
const pomoDashboardCard = document.getElementById('pomoDashboardCard');
const tabPhaseFocus = document.getElementById('tabPhaseFocus');
const tabPhaseShort = document.getElementById('tabPhaseShort');
const tabPhaseLong = document.getElementById('tabPhaseLong');
const bigTimerDisplay = document.getElementById('bigTimerDisplay');
const cycleLabelText = document.getElementById('cycleLabelText');
const cycleDotsContainer = document.getElementById('cycleDotsContainer');
const btnPomoStartPause = document.getElementById('btnPomoStartPause');
const btnPomoSkip = document.getElementById('btnPomoSkip');
const btnPomoReset = document.getElementById('btnPomoReset');
const btnPomoResetAll = document.getElementById('btnPomoResetAll');
const strictLockBanner = document.getElementById('strictLockBanner');

// Pomodoro Settings inputs
const inputFocusMin = document.getElementById('inputFocusMin');
const inputShortBreakMin = document.getElementById('inputShortBreakMin');
const inputLongBreakMin = document.getElementById('inputLongBreakMin');
const inputSessionsBeforeLong = document.getElementById('inputSessionsBeforeLong');
const chkAutoStartBreaks = document.getElementById('chkAutoStartBreaks');
const chkAutoStartFocus = document.getElementById('chkAutoStartFocus');
const chkOverflowMode = document.getElementById('chkOverflowMode');
const chkStrictMode = document.getElementById('chkStrictMode');
const inputAlertMessage = document.getElementById('inputAlertMessage');

// Theme Set elements (Consolidated bottom row toolbar)
const selectThemeSet = document.getElementById('selectThemeSet');
const characterOutfitGroup = document.getElementById('characterOutfitGroup');
const selectSkin = document.getElementById('selectSkin');
const btnOpenThemeStudio = document.getElementById('btnOpenThemeStudio');
const btnExportShare = document.getElementById('btnExportShare');
const btnExportThemeSet = document.getElementById('btnExportThemeSet');
const btnExportFullBundle = document.getElementById('btnExportFullBundle');
const btnDeleteCustomTheme = document.getElementById('btnDeleteCustomTheme');
const fileImportInput = document.getElementById('fileImportInput');

const inputCharacterName = document.getElementById('inputCharacterName');
const rangeScale = document.getElementById('rangeScale');
const valScale = document.getElementById('valScale');
const rangeSpeed = document.getElementById('rangeSpeed');
const valSpeed = document.getElementById('valSpeed');

// Position & Daily Alert elements
const selectVisibilityMode = document.getElementById('selectVisibilityMode');
const selectPositionPreset = document.getElementById('selectPositionPreset');
const rangeOffsetX = document.getElementById('rangeOffsetX');
const valOffsetX = document.getElementById('valOffsetX');
const rangeOffsetY = document.getElementById('rangeOffsetY');
const valOffsetY = document.getElementById('valOffsetY');
const chkAlarmEnabled = document.getElementById('chkAlarmEnabled');
const inputWakeTime = document.getElementById('inputWakeTime');
const chkSoundEnabled = document.getElementById('chkSoundEnabled');
const toastMsg = document.getElementById('toastMsg');

// Modal elements
const themeModal = document.getElementById('themeModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const tabBtnJson = document.getElementById('tabBtnJson');
const tabBtnVisual = document.getElementById('tabBtnVisual');
const tabPaneJson = document.getElementById('tabPaneJson');
const tabPaneVisual = document.getElementById('tabPaneVisual');
const jsonThemeEditor = document.getElementById('jsonThemeEditor');
const btnCopyAiPrompt = document.getElementById('btnCopyAiPrompt');
const btnBrowseJsonFile = document.getElementById('btnBrowseJsonFile');
const btnRandomizeTheme = document.getElementById('btnRandomizeTheme');
const btnSaveGeneratedTheme = document.getElementById('btnSaveGeneratedTheme');

const genThemeNameTh = document.getElementById('genThemeNameTh');
const genThemeNameEn = document.getElementById('genThemeNameEn');
const genCharName = document.getElementById('genCharName');
const genAlertMessage = document.getElementById('genAlertMessage');
const genHatStyle = document.getElementById('genHatStyle');
const genVehicleStyle = document.getElementById('genVehicleStyle');
const genColorHat = document.getElementById('genColorHat');
const genColorShirt = document.getElementById('genColorShirt');
const genColorOveralls = document.getElementById('genColorOveralls');
const genColorVehicle = document.getElementById('genColorVehicle');
const genColorGround = document.getElementById('genColorGround');
const genBTractor = document.getElementById('genBTractor');
const genBMachete = document.getElementById('genBMachete');
const genBWater = document.getElementById('genBWater');
const genBPlant = document.getElementById('genBPlant');
const genBPalm = document.getElementById('genBPalm');
const genBFert = document.getElementById('genBFert');

let activeModalTab = 'json';
let configState = { language: 'th' };
let runtimeState = { pomodoro: {} };
let appInfoState = { currentVersion: '1.2.0', releases: [] };

let toastTimeout = null;
function showToast(text) {
  toastMsg.textContent = text;
  toastMsg.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMsg.classList.remove('show');
  }, 2100);
}

// Clean switch between 'th' and 'en'
function tr(th, en) {
  return configState.language === 'en' ? en : th;
}

function formatMMSS(sec) {
  const abs = Math.max(0, Math.floor(sec || 0));
  const m = String(Math.floor(abs / 60)).padStart(2, '0');
  const s = String(abs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

const previewEngine = new CartoonEngine(previewCanvas, {
  isPreview: true
});
previewEngine.start();

// Switch Top-Level View (Main Settings vs About & Release Notes)
function switchTopView(viewName) {
  const isAbout = viewName === 'about';
  navBtnMain.classList.toggle('active', !isAbout);
  navBtnAbout.classList.toggle('active', isAbout);
  viewMain.style.display = isAbout ? 'none' : 'grid';
  viewAbout.style.display = isAbout ? 'block' : 'none';
}

navBtnMain.addEventListener('click', () => switchTopView('main'));
navBtnAbout.addEventListener('click', () => switchTopView('about'));

function renderReleaseNotes() {
  const ver = appInfoState.currentVersion || '1.2.0';
  hdrVersionPill.textContent = `v${ver}`;
  aboutVersionBadge.textContent = `v${ver}`;
  if (appInfoState.electronVersion) {
    badgeElectronVer.textContent = `Electron v${appInfoState.electronVersion} • Node v${appInfoState.nodeVersion || ''}`;
  }
  if (appInfoState.configPath) valConfigPath.textContent = appInfoState.configPath;
  if (appInfoState.themesDir) valThemesDir.textContent = appInfoState.themesDir;

  releaseNotesList.innerHTML = '';
  const releases = Array.isArray(appInfoState.releases) ? appInfoState.releases : [];
  releases.forEach((rel) => {
    const card = document.createElement('div');
    card.className = 'release-card';
    const title = tr(rel.titleTh || rel.titleEn, rel.titleEn || rel.titleTh);
    const items = configState.language === 'en' ? rel.changesEn || rel.changesTh || [] : rel.changesTh || rel.changesEn || [];
    const lis = items.map((c) => `<li>${c}</li>`).join('');
    card.innerHTML = `
      <div class="release-header">
        <div class="release-version">
          <span>v${rel.version}</span>
          ${rel.tag ? `<span class="release-tag">${rel.tag}</span>` : ''}
        </div>
        <span class="release-date">📅 ${rel.date || ''}</span>
      </div>
      <div class="release-title">${title}</div>
      <ul class="release-list">${lis}</ul>
    `;
    releaseNotesList.appendChild(card);
  });
}

function applyLanguageTranslations() {
  document.getElementById('hdrTitle').textContent = '🍅 Pomodoro Cartoon Companion';
  document.getElementById('hdrSubtitle').textContent = tr(
    'จับเวลาโฟกัสงานด้วยตัวละครการ์ตูนบน Taskbar พร้อมสร้าง/นำเข้า/แชร์ชุดธีม (Theme Set) ด้วย Generative AI',
    'Focus timer with animated taskbar cartoon + AI-powered Theme Set (Character + Behavior Set) Studio'
  );
  navBtnMain.textContent = tr('⚙️ ตั้งค่า & โพโมโดโร', '⚙️ Timer & Settings');
  navBtnAbout.textContent = tr('ℹ️ เกี่ยวกับ & เวอร์ชัน', 'ℹ️ About & Release Notes');

  btnTriggerAlertNow.textContent = tr('🔔 ทดสอบแจ้งเตือน', '🔔 Test Alert');
  btnDismissNow.textContent = tr('✅ ปิดแจ้งเตือน', '✅ Dismiss');

  tabPhaseFocus.textContent = tr('🍅 โฟกัส', '🍅 Focus');
  tabPhaseShort.textContent = tr('☕ พักสั้น', '☕ Short Break');
  tabPhaseLong.textContent = tr('🌴 พักยาว', '🌴 Long Break');

  strictLockBanner.textContent = tr(
    '🔒 โหมดเข้มงวดทำงานอยู่: ล็อกการหยุดพัก/ข้าม/รีเซ็ตจนกว่าจะครบเวลาโฟกัส!',
    '🔒 Strict Mode Active: Pause, Skip, and Reset are locked until Focus finishes!'
  );

  document.getElementById('lblLivePreview').textContent = tr(
    '🎬 ตัวอย่างแอนิเมชัน',
    '🎬 Live Theme Set Preview'
  );
  document.getElementById('lblBehaviorClick').textContent = tr(
    'คลิกเลือกท่าทางในชุดธีมนี้:',
    'Click a behavior in this Theme Set:'
  );

  document.getElementById('hdrPomodoroEngine').textContent = tr(
    '⏱️ ตั้งค่าระบบจับเวลาโพโมโดโร',
    '⏱️ Core Pomodoro Timer Engine'
  );
  document.getElementById('lblFocusMin').textContent = tr('🍅 โฟกัส (นาที)', '🍅 Focus (Min)');
  document.getElementById('lblShortBreakMin').textContent = tr('☕ พักสั้น (นาที)', '☕ Short Break (Min)');
  document.getElementById('lblLongBreakMin').textContent = tr('🌴 พักยาว (นาที)', '🌴 Long Break (Min)');
  document.getElementById('lblCyclesCount').textContent = tr('🔁 รอบก่อนพักยาว', '🔁 Cycles before Long');

  document.getElementById('lblAutoStartBreaks').textContent = tr(
    '☕ เริ่มเวลาพักอัตโนมัติ',
    '☕ Auto-start Breaks'
  );
  document.getElementById('lblAutoStartFocus').textContent = tr(
    '▶️ เริ่มรอบโฟกัสถัดไปอัตโนมัติ',
    '▶️ Auto-start Focus'
  );
  document.getElementById('lblOverflowMode').textContent = tr(
    '🔥 โหมดล่วงเวลา (นับบวกต่อไม่ขัดโฟลว์)',
    '🔥 Overflow / Overtime Mode'
  );
  document.getElementById('lblStrictMode').textContent = tr(
    '🔒 โหมดเข้มงวด (ล็อกปุ่มหยุดพักระหว่างโฟกัส)',
    '🔒 Strict Mode (Lock Pause/Skip)'
  );
  document.getElementById('lblAlertMsg').textContent = tr(
    'ข้อความแจ้งเตือนเมื่อครบเวลา',
    'Pomodoro Completion Alert Message'
  );

  document.getElementById('hdrThemeSetCard').textContent = tr(
    '🎨 ชุดธีมตัวละครและท่าทาง (Theme Set)',
    '🎨 Theme Set (Character + Behavior Set)'
  );
  document.getElementById('lblSelectThemeSet').textContent = tr(
    'เลือกชุดธีม',
    'Active Theme Set'
  );
  document.getElementById('lblCharacterOutfit').textContent = tr(
    'ชุดแต่งกายตัวละคร',
    'Character Outfit Style'
  );
  document.getElementById('optSkinKamar').textContent = tr(
    'ลุงสมชาย — ผ้าขาวม้า & หมวกสาน',
    'Uncle Somchai — Thai Kamar & Straw Hat'
  );
  document.getElementById('optSkinOveralls').textContent = tr(
    'Sunny McFarm — เอี๊ยมยีนส์',
    'Sunny McFarm — Classic Blue Overalls'
  );
  document.getElementById('optSkinRancher').textContent = tr(
    'Ranger Khao — เสื้อกั๊กฟาร์ม',
    'Ranger Khao — Modern Field Vest'
  );
  document.getElementById('optSkinBoss').textContent = tr(
    'เถ้าแก่สวนปาล์ม — แว่นดำ',
    'Boss Palm — Sunglasses & Polo'
  );

  btnOpenThemeStudio.textContent = tr(
    '🤖 สร้าง / นำเข้าชุดธีมด้วย AI',
    '🤖 AI Theme Studio & Import'
  );
  btnExportShare.textContent = tr(
    '📤 ส่งออก / แชร์ชุดธีม (.json)',
    '📤 Export / Share (.json)'
  );
  btnDeleteCustomTheme.textContent = tr('🗑️ ลบชุดธีม', '🗑️ Delete Theme Set');

  document.getElementById('lblCharName').textContent = tr('ชื่อตัวละคร', 'Character Display Name');
  document.getElementById('lblSizeText').textContent = tr('ขนาด', 'Size');
  document.getElementById('lblSpeedText').textContent = tr('ความเร็ว', 'Speed');

  document.getElementById('hdrPositionCard').textContent = tr(
    '📍 ตำแหน่งบนหน้าจอ & แจ้งเตือนกลับบ้าน',
    '📍 Screen Position & Daily Back-Home Alert'
  );
  document.getElementById('lblVisMode').textContent = tr(
    'การแสดงผลบน Taskbar',
    'Taskbar Visibility Mode'
  );
  document.getElementById('optVisBoth').textContent = tr(
    'แสดงตลอดเวลา + แจ้งเตือน',
    'Always on Taskbar + Alert'
  );
  document.getElementById('optVisAlert').textContent = tr(
    'ซ่อนไว้ แสดงเฉพาะตอนแจ้งเตือน',
    'Alert Only (Hidden until Alert)'
  );
  document.getElementById('lblPosPreset').textContent = tr(
    'ตำแหน่งบนหน้าจอ',
    'Screen Position Preset'
  );
  document.getElementById('optPosBR').textContent = tr(
    'มุมขวาล่าง (บน Taskbar)',
    'Bottom-Right Corner (On Taskbar)'
  );
  document.getElementById('optPosBC').textContent = tr('กึ่งกลางด้านล่าง', 'Bottom-Center');
  document.getElementById('optPosBL').textContent = tr('มุมซ้ายล่าง', 'Bottom-Left Corner');
  document.getElementById('optPosTR').textContent = tr('มุมขวาบน', 'Top-Right Corner');
  document.getElementById('optPosCustom').textContent = tr(
    'ตำแหน่งที่ลากวางเอง',
    'Custom (Dragged Position)'
  );
  document.getElementById('lblOffsetX').textContent = tr(
    'ระยะแนวนอน (Offset X)',
    'Horizontal Offset (X)'
  );
  document.getElementById('lblOffsetY').textContent = tr(
    'ระยะแนวตั้ง (Offset Y)',
    'Vertical Offset (Y)'
  );
  document.getElementById('lblDailyWake').textContent = tr(
    '🏡 เตือนกลับบ้าน:',
    '🏡 Back-Home Alert:'
  );
  document.getElementById('lblSoundChime').textContent = tr(
    '🔊 เปิดเสียงดนตรีแจ้งเตือน',
    '🔊 Play Alert Sound Chime'
  );

  // About & Release Notes Page Translations
  document.getElementById('aboutHeroDesc').textContent = tr(
    'แอปจับเวลาโพโมโดโรพร้อมเพื่อนคู่หูการ์ตูนแอนิเมชัน 60 FPS บน Windows Taskbar ที่เปิดให้คุณออกแบบตัวละคร ยานพาหนะ และท่าทางแอนิเมชันได้อย่างอิสระผ่านไฟล์ JSON และ Generative AI',
    'A 60 FPS animated Windows Taskbar Pomodoro Focus Companion powered by a Universal Declarative 2D Drawable Scene Graph that lets you create and import any custom character, vehicle, and behavior with Generative AI.'
  );
  document.getElementById('hdrSystemPaths').textContent = tr(
    '📂 ข้อมูลระบบและตำแหน่งไฟล์',
    '📂 System & Storage Paths'
  );
  document.getElementById('lblPathConfig').textContent = tr('ไฟล์การตั้งค่า:', 'Config File:');
  document.getElementById('lblPathThemes').textContent = tr('โฟลเดอร์ชุดธีม:', 'Themes Folder:');
  document.getElementById('hdrReleaseNotes').textContent = tr(
    '📜 ประวัติเวอร์ชันและบันทึกการอัปเดต',
    '📜 Version Control & Release Notes'
  );
  renderReleaseNotes();

  // Modal translations
  document.getElementById('modalTitle').textContent = tr(
    '🎨 สตูดิโอชุดธีมตัวละครและท่าทาง',
    '🎨 Theme Set Studio — AI Generate / Import / Export'
  );
  btnCloseModal.textContent = tr('✖ ปิด', '✖ Close');
  tabBtnJson.textContent = tr(
    '🤖 สร้างด้วย AI & นำเข้า / ส่งออก JSON',
    '🤖 AI Prompt & Import / Export JSON'
  );
  tabBtnVisual.textContent = tr(
    '✨ ปรับแต่งชุดธีมด้วยตัวเอง',
    '✨ Visual Theme Set Builder'
  );
  btnCopyAiPrompt.textContent = tr(
    '🤖 คัดลอกพรอมต์ไปวางใน ChatGPT / Gemini / Claude',
    '🤖 Copy AI Prompt for ChatGPT / Gemini / Claude'
  );
  btnBrowseJsonFile.textContent = tr(
    '📂 นำเข้าไฟล์ .json จากคอมพิวเตอร์',
    '📂 Import .json File from Computer'
  );
  btnExportThemeSet.textContent = tr(
    '📤 ส่งออกเฉพาะชุดธีม (.json)',
    '📤 Export Theme Set (.json)'
  );
  btnExportFullBundle.textContent = tr(
    '📦 ส่งออกชุดธีม + ตั้งค่าทั้งหมด (.json)',
    '📦 Export Full Settings + Theme Set Bundle'
  );
  document.getElementById('lblModalJsonHint').textContent = tr(
    '💡 กดปุ่มคัดลอกพรอมต์ด้านบนไปสั่ง Generative AI ให้ออกแบบตัวละคร ยานพาหนะ และท่าทางใหม่ทั้งหมด จากนั้นนำโค้ด JSON ที่ได้มาวางด้านล่างแล้วกดบันทึก!',
    '💡 Copy the AI prompt above and paste it into any AI chat to generate a new Character + Behavior Theme Set JSON with custom drawable objects, then paste it below and click Save!'
  );
  btnRandomizeTheme.textContent = tr('🎲 สุ่มชุดธีมใหม่', '🎲 Randomize Theme Set');
  btnSaveGeneratedTheme.textContent = tr(
    '💾 บันทึกและใช้งานชุดธีม',
    '💾 Save & Apply Theme Set'
  );
}

function rebuildThemeSetDropdown(cfg) {
  const builtin = window.BUILTIN_THEME_SETS || {};
  const custom = cfg.customThemeSets || {};
  const currentId = cfg.activeThemeSet || 'farmer';

  selectThemeSet.innerHTML = '';

  const optGroupBuiltin = document.createElement('optgroup');
  optGroupBuiltin.label = tr('🌟 ชุดธีมมาตรฐาน', '🌟 Built-in Theme Sets');
  Object.values(builtin).forEach((ts) => {
    const opt = document.createElement('option');
    opt.value = ts.id;
    opt.textContent = previewEngine.formatBilingual(ts.nameTh, ts.nameEn);
    optGroupBuiltin.appendChild(opt);
  });
  selectThemeSet.appendChild(optGroupBuiltin);

  const customList = Object.values(custom);
  if (customList.length > 0) {
    const optGroupCustom = document.createElement('optgroup');
    optGroupCustom.label = tr('🎨 ชุดธีมที่สร้างเอง / นำเข้าจาก AI', '🎨 Custom / AI Imported Theme Sets');
    customList.forEach((ts) => {
      const opt = document.createElement('option');
      opt.value = ts.id;
      opt.textContent = `${previewEngine.formatBilingual(ts.nameTh, ts.nameEn)} ★`;
      optGroupCustom.appendChild(opt);
    });
    selectThemeSet.appendChild(optGroupCustom);
  }

  selectThemeSet.value = currentId;
  const isCustom = Boolean(custom[currentId] && !builtin[currentId]);
  btnDeleteCustomTheme.style.display = isCustom ? 'inline-block' : 'none';
  characterOutfitGroup.style.display = currentId === 'farmer' ? 'flex' : 'none';
}

function rebuildBehaviorButtons(cfg) {
  const list = previewEngine.getActiveBehaviorsList();
  const activeB = runtimeState.forcedBehavior || cfg.idleBehavior || 'cycle';

  behaviorButtonsContainer.innerHTML = '';

  const cycleBtn = document.createElement('button');
  cycleBtn.className = `behavior-chip full-span ${activeB === 'cycle' ? 'active' : ''}`;
  cycleBtn.textContent = tr('🔄 สลับทุกท่าทางอัตโนมัติ', '🔄 Auto-Cycle All Behaviors');
  cycleBtn.addEventListener('click', async () => {
    previewEngine.setBehaviorMode('cycle');
    await window.companionAPI.setBehaviorNow('cycle');
    showToast(tr('🔄 เปิดโหมดสลับท่าทางอัตโนมัติ', '🔄 Auto-cycling behaviors'));
  });
  behaviorButtonsContainer.appendChild(cycleBtn);

  list.forEach((b, idx) => {
    const btn = document.createElement('button');
    const isLastOdd = idx === list.length - 1 && list.length % 2 === 1;
    btn.className = `behavior-chip ${isLastOdd ? 'full-span' : ''} ${activeB === b.id ? 'active' : ''}`;
    btn.textContent = `${b.icon || '✨'} ${previewEngine.formatBilingual(b.labelTh, b.labelEn)}`;
    btn.addEventListener('click', async () => {
      previewEngine.setBehaviorMode(b.id);
      await window.companionAPI.setBehaviorNow(b.id);
      showToast(`${b.icon || '✨'} ${previewEngine.formatBilingual(b.labelTh, b.labelEn)}`);
    });
    behaviorButtonsContainer.appendChild(btn);
  });
}

function syncPomodoroDashboard() {
  const p = runtimeState.pomodoro || {};
  const pCfg = configState.pomodoro || {};
  const isOvertime = p.status === 'overtime';
  const locked = Boolean(p.strictLocked);

  pomoDashboardCard.classList.toggle('overtime', isOvertime);
  strictLockBanner.classList.toggle('visible', locked);

  tabPhaseFocus.classList.toggle('active', p.phase === 'focus');
  tabPhaseShort.classList.toggle('active', p.phase === 'shortBreak');
  tabPhaseLong.classList.toggle('active', p.phase === 'longBreak');

  tabPhaseFocus.disabled = locked;
  tabPhaseShort.disabled = locked;
  tabPhaseLong.disabled = locked;

  if (isOvertime) {
    bigTimerDisplay.textContent = `+${formatMMSS(p.overtimeSeconds)}`;
  } else {
    bigTimerDisplay.textContent = formatMMSS(p.remainingSeconds);
  }

  const totalSessions = Math.max(1, Number(pCfg.sessionsBeforeLongBreak) || 4);
  const currentSess = p.currentSession || 1;
  cycleLabelText.textContent = `${tr('รอบโฟกัส', 'Cycle')}: ${currentSess} / ${totalSessions}`;

  cycleDotsContainer.innerHTML = '';
  for (let i = 1; i <= totalSessions; i++) {
    const dot = document.createElement('span');
    dot.className = `cycle-dot ${i < currentSess || (i === currentSess && isOvertime) ? 'done' : ''}`;
    cycleDotsContainer.appendChild(dot);
  }

  btnPomoStartPause.disabled = locked;
  btnPomoSkip.disabled = locked;
  btnPomoReset.disabled = locked;
  btnPomoResetAll.disabled = locked;

  if (p.status === 'running') {
    btnPomoStartPause.textContent = locked
      ? tr('🔒 ล็อกโหมดเข้มงวด', '🔒 Strict Locked')
      : tr('⏸️ หยุดชั่วคราว', '⏸️ Pause');
  } else if (p.status === 'paused') {
    btnPomoStartPause.textContent = tr('▶️ ทำต่อ', '▶️ Resume');
  } else if (p.status === 'overtime' || p.status === 'completed') {
    btnPomoStartPause.textContent =
      p.phase === 'focus'
        ? tr('☕ เริ่มเวลาพัก', '☕ Start Break')
        : tr('▶️ เริ่มโฟกัส', '▶️ Start Focus');
  } else {
    btnPomoStartPause.textContent =
      p.phase === 'focus'
        ? tr('▶️ เริ่มโฟกัส', '▶️ Start Focus')
        : tr('▶️ เริ่มเวลาพัก', '▶️ Start Break');
  }

  btnPomoSkip.textContent = tr('⏭️ ข้าม', '⏭️ Skip');
  btnPomoReset.textContent = tr('🔄 รีเซ็ต', '🔄 Reset');
  btnPomoResetAll.textContent = tr('🔁 รีเซ็ตรอบ', '🔁 Reset All');

  previewEngine.setAlerting(runtimeState.isAlerting, isOvertime);
}

function syncUIFromConfig(cfg) {
  configState = cfg;
  const lang = cfg.language === 'en' ? 'en' : 'th';
  configState.language = lang;
  selectLanguage.value = lang;

  previewEngine.setConfig(configState);
  if (runtimeState.forcedBehavior) {
    previewEngine.setBehaviorMode(runtimeState.forcedBehavior);
  }

  applyLanguageTranslations();
  rebuildThemeSetDropdown(configState);
  rebuildBehaviorButtons(configState);

  const activeTS = previewEngine.getActiveThemeSet();
  previewThemeBadge.textContent = previewEngine.formatBilingual(activeTS.nameTh, activeTS.nameEn);

  const pCfg = cfg.pomodoro || {};
  inputFocusMin.value = pCfg.focusMinutes || 25;
  inputShortBreakMin.value = pCfg.shortBreakMinutes || 5;
  inputLongBreakMin.value = pCfg.longBreakMinutes || 15;
  inputSessionsBeforeLong.value = pCfg.sessionsBeforeLongBreak || 4;
  chkAutoStartBreaks.checked = Boolean(pCfg.autoStartBreaks);
  chkAutoStartFocus.checked = Boolean(pCfg.autoStartFocus);
  chkOverflowMode.checked = pCfg.overflowMode !== false;
  chkStrictMode.checked = Boolean(pCfg.strictMode);

  inputAlertMessage.value = cfg.alertMessage || '';
  selectSkin.value = cfg.characterSkin || 'thai-kamar';
  inputCharacterName.value = cfg.characterName || 'ลุงสมชาย';

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

  chkAlarmEnabled.checked = cfg.alarmEnabled !== false;
  inputWakeTime.value = cfg.wakeTime || '16:00';
  chkSoundEnabled.checked = cfg.soundEnabled !== false;

  syncPomodoroDashboard();
}

async function savePartial(partial, toastLabel) {
  const updated = await window.companionAPI.saveConfig(partial);
  syncUIFromConfig(updated);
  if (toastLabel) showToast(toastLabel);
}

// Initial load
Promise.all([
  window.companionAPI.getConfig(),
  window.companionAPI.getState(),
  window.companionAPI.getAppInfo()
]).then(([cfg, st, appInfo]) => {
  runtimeState = st;
  if (appInfo) appInfoState = appInfo;
  syncUIFromConfig(cfg);
});

window.companionAPI.onConfigUpdated((cfg) => {
  syncUIFromConfig(cfg);
});

window.companionAPI.onStateUpdated((st) => {
  runtimeState = st;
  syncPomodoroDashboard();
  rebuildBehaviorButtons(configState);
});

window.companionAPI.onSwitchViewTab((tab) => {
  switchTopView(tab === 'about' ? 'about' : 'main');
});

// Clean TH / EN Language Switcher
selectLanguage.addEventListener('change', () => {
  const nextLang = selectLanguage.value === 'en' ? 'en' : 'th';
  savePartial(
    { language: nextLang },
    nextLang === 'en' ? '🇬🇧 Switched language to English' : '🇹🇭 เปลี่ยนเป็นภาษาไทยแล้ว'
  );
});

// ============================================================================
// POMODORO TIMER CONTROLS & SETTINGS LISTENERS
// ============================================================================

btnPomoStartPause.addEventListener('click', async () => {
  const res = await window.companionAPI.pomodoroStartPause();
  if (res && res.blockedByStrictMode) {
    showToast(tr('🔒 โหมดเข้มงวดล็อกอยู่! ต้องโฟกัสให้ครบเวลา', '🔒 Locked by Strict Mode!'));
  }
});

btnPomoSkip.addEventListener('click', async () => {
  const res = await window.companionAPI.pomodoroSkip(true);
  if (res && res.blockedByStrictMode) {
    showToast(tr('🔒 โหมดเข้มงวดล็อกการข้ามช่วงเวลา!', '🔒 Skip locked by Strict Mode!'));
  } else {
    showToast(tr('⏭️ ข้ามไปยังช่วงถัดไป', '⏭️ Skipped to next interval'));
  }
});

btnPomoReset.addEventListener('click', async () => {
  const res = await window.companionAPI.pomodoroReset(false);
  if (res && res.blockedByStrictMode) {
    showToast(tr('🔒 โหมดเข้มงวดล็อกการรีเซ็ต!', '🔒 Reset locked by Strict Mode!'));
  } else {
    showToast(tr('🔄 รีเซ็ตเวลารอบนี้แล้ว', '🔄 Current timer reset'));
  }
});

btnPomoResetAll.addEventListener('click', async () => {
  const res = await window.companionAPI.pomodoroReset(true);
  if (res && res.blockedByStrictMode) {
    showToast(tr('🔒 โหมดเข้มงวดล็อกการรีเซ็ต!', '🔒 Reset locked by Strict Mode!'));
  } else {
    showToast(tr('🔁 รีเซ็ตรอบโพโมโดโรทั้งหมดแล้ว', '🔁 All Pomodoro cycles reset'));
  }
});

[tabPhaseFocus, tabPhaseShort, tabPhaseLong].forEach((tab) => {
  tab.addEventListener('click', async () => {
    const phase = tab.dataset.phase;
    const res = await window.companionAPI.pomodoroSetPhase(phase);
    if (res && res.blockedByStrictMode) {
      showToast(tr('🔒 โหมดเข้มงวดล็อกอยู่!', '🔒 Locked by Strict Mode!'));
    }
  });
});

function savePomodoroSetting(partialPomo, msg) {
  savePartial({ pomodoro: partialPomo }, msg);
}

inputFocusMin.addEventListener('change', () => {
  const v = Math.max(1, Math.min(180, Number(inputFocusMin.value) || 25));
  inputFocusMin.value = v;
  savePomodoroSetting({ focusMinutes: v }, tr(`🍅 ตั้งเวลาโฟกัส ${v} นาที`, `🍅 Focus set to ${v} min`));
});

inputShortBreakMin.addEventListener('change', () => {
  const v = Math.max(1, Math.min(60, Number(inputShortBreakMin.value) || 5));
  inputShortBreakMin.value = v;
  savePomodoroSetting({ shortBreakMinutes: v }, tr(`☕ ตั้งเวลาพักสั้น ${v} นาที`, `☕ Short break: ${v} min`));
});

inputLongBreakMin.addEventListener('change', () => {
  const v = Math.max(1, Math.min(90, Number(inputLongBreakMin.value) || 15));
  inputLongBreakMin.value = v;
  savePomodoroSetting({ longBreakMinutes: v }, tr(`🌴 ตั้งเวลาพักยาว ${v} นาที`, `🌴 Long break: ${v} min`));
});

inputSessionsBeforeLong.addEventListener('change', () => {
  const v = Math.max(1, Math.min(12, Number(inputSessionsBeforeLong.value) || 4));
  inputSessionsBeforeLong.value = v;
  savePomodoroSetting({ sessionsBeforeLongBreak: v }, tr(`🔁 พักยาวทุกๆ ${v} รอบ`, `🔁 Long break every ${v} cycles`));
});

chkAutoStartBreaks.addEventListener('change', () => {
  savePomodoroSetting({ autoStartBreaks: chkAutoStartBreaks.checked });
});

chkAutoStartFocus.addEventListener('change', () => {
  savePomodoroSetting({ autoStartFocus: chkAutoStartFocus.checked });
});

chkOverflowMode.addEventListener('change', () => {
  savePomodoroSetting(
    { overflowMode: chkOverflowMode.checked },
    chkOverflowMode.checked
      ? tr('🔥 เปิดโหมดล่วงเวลา', '🔥 Overflow Mode Enabled')
      : tr('⏹️ ปิดโหมดล่วงเวลา', '⏹️ Overflow Mode Disabled')
  );
});

chkStrictMode.addEventListener('change', () => {
  savePomodoroSetting(
    { strictMode: chkStrictMode.checked },
    chkStrictMode.checked
      ? tr('🔒 เปิดโหมดเข้มงวด', '🔒 Strict Mode Enabled')
      : tr('🔓 ปิดโหมดเข้มงวด', '🔓 Strict Mode Disabled')
  );
});

inputAlertMessage.addEventListener('change', () => {
  savePartial({ alertMessage: inputAlertMessage.value });
});

// ============================================================================
// THEME SET MANAGER, AI PROMPT COPY, IMPORT & EXPORT SHARE BUNDLES
// ============================================================================

selectThemeSet.addEventListener('change', () => {
  const id = selectThemeSet.value;
  const all = previewEngine.getAllThemeSets();
  const chosen = all[id];
  const partial = { activeThemeSet: id };
  if (chosen) {
    if (chosen.characterName) partial.characterName = chosen.characterName;
    if (chosen.alertMessageFocusEnd) partial.alertMessage = chosen.alertMessageFocusEnd;
  }
  savePartial(
    partial,
    `🎨 ${tr('เปลี่ยนชุดธีมเป็น', 'Switched Theme Set to')}: ${chosen ? previewEngine.formatBilingual(chosen.nameTh, chosen.nameEn) : id}`
  );
});

btnDeleteCustomTheme.addEventListener('click', async () => {
  const id = selectThemeSet.value;
  if (!id || (window.BUILTIN_THEME_SETS && window.BUILTIN_THEME_SETS[id])) return;
  const updated = await window.companionAPI.deleteCustomThemeSet(id);
  syncUIFromConfig(updated);
  showToast(tr('🗑️ ลบชุดธีมเรียบร้อยแล้ว', '🗑️ Custom Theme Set deleted'));
});

function downloadActiveThemeSetJson() {
  const activeTS = previewEngine.getActiveThemeSet();
  const jsonStr = JSON.stringify(activeTS, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `theme-set-${activeTS.id || 'custom'}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(tr(`📤 ส่งออกชุดธีม theme-set-${activeTS.id}.json แล้ว`, `📤 Exported theme-set-${activeTS.id}.json`));
}

function downloadFullShareBundleJson() {
  const activeTS = previewEngine.getActiveThemeSet();
  const bundle = {
    type: 'pomodoro-theme-bundle',
    exportedAt: new Date().toISOString(),
    themeSet: activeTS,
    config: {
      language: configState.language,
      pomodoro: configState.pomodoro,
      wakeTime: configState.wakeTime,
      alarmEnabled: configState.alarmEnabled,
      alertMessage: configState.alertMessage,
      positionPreset: configState.positionPreset,
      scale: configState.scale,
      walkSpeed: configState.walkSpeed,
      visibilityMode: configState.visibilityMode
    }
  };
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pomodoro-share-bundle-${activeTS.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(tr('📦 ส่งออกไฟล์แชร์ตั้งค่า+ชุดธีมแล้ว!', '📦 Exported Full Settings + Theme Set Bundle!'));
}

btnExportShare.addEventListener('click', downloadFullShareBundleJson);
btnExportThemeSet.addEventListener('click', downloadActiveThemeSetJson);
btnExportFullBundle.addEventListener('click', downloadFullShareBundleJson);

function parseBiLabel(val, fallbackIcon) {
  const raw = String(val || '').trim();
  const iconMatch = raw.match(/^(\S+)\s+(.+)$/);
  const icon = iconMatch && iconMatch[1].length <= 4 ? iconMatch[1] : fallbackIcon;
  const rest = iconMatch && iconMatch[1].length <= 4 ? iconMatch[2] : raw;
  const parts = rest.split('|').map((s) => s.trim());
  return {
    icon,
    labelTh: parts[0] || rest,
    labelEn: parts[1] || parts[0] || rest
  };
}

function buildThemeSetFromVisualBuilder() {
  const nameTh = genThemeNameTh.value.trim() || '🚀 นักบินอวกาศโฟกัส';
  const nameEn = genThemeNameEn.value.trim() || '🚀 Space Explorer';
  const slug =
    nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `theme-${Date.now()}`;

  const b1 = parseBiLabel(genBTractor.value, '🛸');
  const b2 = parseBiLabel(genBMachete.value, '⚔️');
  const b3 = parseBiLabel(genBWater.value, '🧪');
  const b4 = parseBiLabel(genBPlant.value, '🌱');
  const b5 = parseBiLabel(genBPalm.value, '☄️');
  const b6 = parseBiLabel(genBFert.value, '✨');

  return {
    id: slug,
    nameTh,
    nameEn,
    characterName: genCharName.value.trim() || nameTh,
    alertMessageFocusEnd: genAlertMessage.value.trim(),
    character: {
      skinTone: '#F3C6A0',
      cheek: '#F28B82',
      hatStyle: genHatStyle.value,
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
      mustache: false,
      vehicleStyle: genVehicleStyle.value,
      vehicleBody: genColorVehicle.value,
      vehicleTrim: genColorHat.value,
      vehicleWheel: '#212121',
      vehicleRim: genColorGround.value,
      groundColor: genColorGround.value,
      customHeadShapes: []
    },
    behaviors: [
      {
        id: 'tractor',
        ...b1,
        movementType: 'ride',
        toolType: 'steering',
        propType: 'none',
        particleType: 'smoke',
        particleColor: genColorGround.value
      },
      {
        id: 'machete',
        ...b2,
        movementType: 'walk',
        toolType: 'katana',
        propType: 'grass',
        particleType: 'spark',
        particleColor: genColorHat.value
      },
      {
        id: 'water',
        ...b3,
        movementType: 'walk',
        toolType: 'watering-can',
        propType: 'flowers',
        particleType: 'water',
        particleColor: '#4FC3F7'
      },
      {
        id: 'plant',
        ...b4,
        movementType: 'work-pause',
        toolType: 'shovel',
        propType: 'sapling',
        particleType: 'spark',
        particleColor: '#81C784'
      },
      {
        id: 'palm',
        ...b5,
        movementType: 'work-pause',
        toolType: 'sickle-pole',
        propType: 'palm-tree',
        particleType: 'spark',
        particleColor: '#FFD54F'
      },
      {
        id: 'fertilizer',
        ...b6,
        movementType: 'walk',
        toolType: 'sack-throw',
        propType: 'none',
        particleType: 'fertilizer',
        particleColor: genColorHat.value
      },
      {
        id: 'fix',
        icon: '🔧',
        labelTh: 'ซ่อมและอัปเกรดอุปกรณ์',
        labelEn: 'Upgrade & Repair Gear',
        movementType: 'work-pause',
        toolType: 'hammer',
        propType: 'fence-toolbox',
        particleType: 'spark',
        particleColor: '#FF8A65'
      }
    ]
  };
}

function generateAiPromptText() {
  const declarativeExample = {
    id: 'cyber-cat-dj',
    nameTh: '🐱 เหมียวไซเบอร์ดีเจ',
    nameEn: '🐱 Cyber Cat DJ',
    characterName: 'ดีเจเหมียว (DJ Meow-77)',
    alertMessageFocusEnd: '🎵 บีทโฟกัสจบเพลงแล้ว! พักฟังเพลงชิลๆ ก่อนนะ (Track Complete! Time for a break!)',
    character: {
      skinTone: '#FFE0B2',
      cheek: '#FF80AB',
      hatStyle: 'none',
      shirt: '#1E293B',
      shirtSleeve: '#0F172A',
      overalls: '#7C4DFF',
      pants: '#0F172A',
      boots: '#00E5FF',
      groundColor: '#00E5FF',
      hatDrawables: [
        { type: 'polygon', points: [[-14, 2], [-18, -14], [-4, -4]], fill: '#FF80AB', stroke: '#263238', lineWidth: 1.5 },
        { type: 'polygon', points: [[14, 2], [18, -14], [4, -4]], fill: '#FF80AB', stroke: '#263238', lineWidth: 1.5 },
        { type: 'roundRect', x: -17, y: 2, w: 6, h: 12, r: 3, fill: '#00E5FF' },
        { type: 'roundRect', x: 11, y: 2, w: 6, h: 12, r: 3, fill: '#00E5FF' }
      ],
      torsoDrawables: [
        {
          type: 'curve',
          x1: -12,
          y1: -28,
          cx: -28,
          cy: -38,
          x2: -24,
          y2: -52,
          stroke: '#FF80AB',
          lineWidth: 4,
          cap: 'round',
          anim: { swingDeg: 22, swingSpeed: 6, pivotX: -12, pivotY: -28 }
        }
      ]
    },
    behaviors: [
      {
        id: 'ride-roomba',
        icon: '🛸',
        labelTh: 'ซิ่งหุ่นยนต์ดูดฝุ่นเทอร์โบ',
        labelEn: 'Ride Turbo Roomba Hovercraft',
        movementType: 'ride',
        seatOffsetX: -6,
        seatOffsetY: -28,
        vehicleDrawables: [
          { type: 'roundRect', x: -36, y: -22, w: 72, h: 16, r: 8, fill: '#263238', stroke: '#00E5FF', lineWidth: 2 },
          { type: 'circle', x: 24, y: -14, r: 4, fill: '#FF007F', anim: { scaleAmp: 0.3, scaleSpeed: 10 } },
          { type: 'star', x: -20, y: -10, points: 6, outerR: 9, innerR: 4, fill: '#00E5FF', anim: { rotateSpeed: 260 } },
          { type: 'star', x: 20, y: -10, points: 6, outerR: 9, innerR: 4, fill: '#00E5FF', anim: { rotateSpeed: 260 } }
        ],
        particles: {
          spawnRate: 18,
          offsetX: -38,
          offsetY: -16,
          vxRange: [-50, -15],
          vyRange: [-30, 10],
          gravity: -15,
          size: 4,
          life: 0.6,
          shape: 'note',
          colors: ['#00E5FF', '#FF80AB', '#FFD54F']
        }
      },
      {
        id: 'dj-turntable',
        icon: '🎧',
        labelTh: 'สแครชแผ่นเสียงปล่อยคลื่นบีท',
        labelEn: 'Scratch Vinyl on Neon Turntable',
        movementType: 'work-pause',
        pose: {
          frontArmBaseDeg: -35,
          frontArmSwingDeg: 35,
          frontArmSwingSpeed: 10,
          headSwingDeg: 10,
          headSwingSpeed: 8
        },
        toolDrawables: [
          { type: 'circle', x: 10, y: 2, r: 9, fill: '#111', stroke: '#00E5FF', lineWidth: 1.5, anim: { rotateSpeed: 300 } },
          { type: 'circle', x: 10, y: 2, r: 3, fill: '#FF007F' }
        ],
        propDrawables: [
          { type: 'roundRect', x: -22, y: -38, w: 44, h: 38, r: 6, fill: '#1E293B', stroke: '#7C4DFF', lineWidth: 2 },
          { type: 'circle', x: -8, y: -20, r: 9, fill: '#00E5FF', anim: { scaleAmp: 0.2, scaleSpeed: 12 } },
          { type: 'circle', x: 10, y: -20, r: 9, fill: '#FF007F', anim: { scaleAmp: 0.2, scaleSpeed: 12, scalePhase: 1.5 } }
        ],
        particles: {
          spawnRate: 22,
          offsetX: 44,
          offsetY: -45,
          vxRange: [-30, 50],
          vyRange: [-80, -30],
          gravity: -20,
          size: 4.5,
          life: 0.85,
          shape: 'note',
          colors: ['#00E5FF', '#FF007F', '#FFD54F']
        }
      }
    ]
  };

  return `You are a Creative 2D Vector Animator & Theme Set Designer for my "Pomodoro Cartoon Companion" Windows app.
The app uses a Universal Declarative 2D Drawable & Animation Scene Graph Engine — NO objects or behaviors are fixed! You can draw and animate ANY character, hat, wings, tail, vehicle, handheld tool/instrument, scene prop, joint pose, and particle effect directly in a single JSON file.

Please design a brand-new, creative Theme Set JSON (with 5 to 7 unique animated behaviors, Thai & English labels, custom drawables, and animations).

### 1. Supported Drawable Shapes (in any *Drawables array):
Every item in \`hatDrawables\`, \`headDrawables\`, \`torsoDrawables\`, \`armDrawables\`, \`legDrawables\`, \`bodyDrawables\` (set \`replaceDefaultBody: true\` for non-humanoid characters!), \`vehicleDrawables\`, \`toolDrawables\`, \`backHandDrawables\`, or \`propDrawables\` can be:
- \`{ "type": "rect" | "roundRect", "x": 0, "y": 0, "w": 20, "h": 12, "r": 4, "fill": "#HEX", "stroke": "#HEX", "lineWidth": 1.5 }\`
- \`{ "type": "circle", "x": 0, "y": 0, "r": 8, "fill": "#HEX", "stroke": "#HEX" }\`
- \`{ "type": "ellipse", "x": 0, "y": 0, "rx": 12, "ry": 6, "rotDeg": 15, "fill": "#HEX" }\`
- \`{ "type": "arc", "x": 0, "y": 0, "r": 12, "startDeg": 0, "endDeg": 180, "close": true, "fill": "#HEX" }\`
- \`{ "type": "line", "x1": 0, "y1": 0, "x2": 25, "y2": -15, "stroke": "#HEX", "lineWidth": 3, "cap": "round" }\`
- \`{ "type": "curve", "x1": 0, "y1": 0, "cx": 15, "cy": -20, "x2": 30, "y2": 0, "stroke": "#HEX", "lineWidth": 3 }\`
- \`{ "type": "polygon", "points": [[0,0], [15,-20], [30,0]], "close": true, "fill": "#HEX", "stroke": "#HEX" }\`
- \`{ "type": "star", "x": 0, "y": 0, "points": 5, "outerR": 10, "innerR": 4, "fill": "#HEX" }\`
- \`{ "type": "heart", "x": 0, "y": 0, "size": 10, "fill": "#HEX" }\`
- \`{ "type": "text", "x": 0, "y": 0, "text": "⚡", "font": "bold 14px sans-serif", "fill": "#HEX" }\`
- \`{ "type": "group", "x": 0, "y": 0, "rotDeg": 0, "anim": {...}, "children": [ ... ] }\`

### 2. Supported Per-Shape Animation (\`"anim"\` object on ANY drawable or group):
- \`"rotateSpeed": 180\` (continuous 360° spin in deg/sec — great for wheels, propellers, magic circles, gears)
- \`"swingDeg": 25, "swingSpeed": 8, "swingPhase": 0, "pivotX": 0, "pivotY": 0\` (sine-wave pendulum swing — great for wings, tails, blades, branches)
- \`"moveXAmp": 6, "moveXSpeed": 4, "moveYAmp": 6, "moveYSpeed": 5\` (floating, hovering, shaking)
- \`"scaleAmp": 0.25, "scaleSpeed": 6\` (pulsing, breathing, glowing)
- \`"fallLoop": { "duration": 2.4, "startAt": 1.0, "dropY": 85, "bounce": true }\` (repeating falling & bouncing items!)
- \`"blink": { "speed": 1.8, "threshold": 0.96 }\` (blinking eyes or flashing lights)

### 3. Supported Per-Behavior Pose & Particles:
- \`"movementType"\`: \`"walk" | "ride" | "hover" | "work-pause" | "stationary"\`
- \`"pose"\`: \`{ "bobAmp": 3.5, "headTiltDeg": -10, "headSwingDeg": 8, "headSwingSpeed": 5, "frontArmBaseDeg": -30, "frontArmSwingDeg": 45, "frontArmSwingSpeed": 8, "legSwingDeg": 28 }\`
- \`"particles"\`: \`{ "spawnRate": 20, "offsetX": 36, "offsetY": -36, "vxRange": [-30, 60], "vyRange": [-70, -20], "gravity": 160, "size": 4, "life": 0.7, "shape": "circle"|"rect"|"star"|"heart"|"note"|"text", "text": "✨", "colors": ["#00E5FF", "#FFD54F"] }\`

### Working Example JSON Structure:
${JSON.stringify(declarativeExample, null, 2)}

Return ONLY the raw valid JSON object so I can paste and import it directly into Pomodoro Cartoon Companion!`;
}

function copyAiPromptToClipboard() {
  const promptText = generateAiPromptText();
  navigator.clipboard.writeText(promptText);
  showToast(
    tr(
      '🤖 คัดลอกพรอมต์สำหรับ AI แล้ว! นำไปวางใน ChatGPT / Gemini ได้เลย',
      '🤖 Copied AI Prompt! Paste it into ChatGPT / Gemini / Claude!'
    )
  );
}

btnCopyAiPrompt.addEventListener('click', copyAiPromptToClipboard);

function openModal(tab = 'json') {
  jsonThemeEditor.value = JSON.stringify(previewEngine.getActiveThemeSet(), null, 2);
  themeModal.classList.add('open');
  switchModalTab(tab);
}

function switchModalTab(tab) {
  activeModalTab = tab;
  tabBtnJson.classList.toggle('active', tab === 'json');
  tabBtnVisual.classList.toggle('active', tab === 'visual');
  tabPaneJson.style.display = tab === 'json' ? 'block' : 'none';
  tabPaneVisual.style.display = tab === 'visual' ? 'block' : 'none';

  if (tab === 'json' && !jsonThemeEditor.value.trim()) {
    jsonThemeEditor.value = JSON.stringify(buildThemeSetFromVisualBuilder(), null, 2);
  }
}

btnOpenThemeStudio.addEventListener('click', () => openModal('json'));
btnCloseModal.addEventListener('click', () => themeModal.classList.remove('open'));
tabBtnJson.addEventListener('click', () => switchModalTab('json'));
tabBtnVisual.addEventListener('click', () => switchModalTab('visual'));

btnBrowseJsonFile.addEventListener('click', () => {
  fileImportInput.click();
});

fileImportInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    jsonThemeEditor.value = String(reader.result || '');
    switchModalTab('json');
    showToast(tr(`📂 โหลดไฟล์ ${file.name} แล้ว กดบันทึกเพื่อใช้งาน!`, `📂 Loaded ${file.name} — Click Save & Apply!`));
  };
  reader.readAsText(file);
  fileImportInput.value = '';
});

btnRandomizeTheme.addEventListener('click', () => {
  const presets = [
    {
      th: '🏴‍☠️ กัปตันโจรสลัดสายโฟกัส',
      en: '🏴‍☠️ Pirate Captain',
      char: 'กัปตันแจ็ค',
      hat: 'crown',
      veh: 'scooter',
      cHat: '#FFD54F',
      cShirt: '#D32F2F',
      cOver: '#212121',
      cVeh: '#6D4C41',
      cGrd: '#26C6DA'
    },
    {
      th: '🐱 บาริสต้าคาเฟ่แมวเหมียว',
      en: '🐱 Cat Cafe Barista',
      char: 'บาริสต้ามินท์',
      hat: 'cap',
      veh: 'scooter',
      cHat: '#F48FB1',
      cShirt: '#FFF8E1',
      cOver: '#8D6E63',
      cVeh: '#FF80AB',
      cGrd: '#A5D6A7'
    },
    {
      th: '🥷 นินจาเงาจันทรา',
      en: '🥷 Shadow Shinobi',
      char: 'ฮันโซ',
      hat: 'samurai-helm',
      veh: 'hover-bike',
      cHat: '#263238',
      cShirt: '#311B92',
      cOver: '#0F172A',
      cVeh: '#FF1744',
      cGrd: '#00E676'
    }
  ];
  const pick = presets[Math.floor(Math.random() * presets.length)];
  genThemeNameTh.value = pick.th;
  genThemeNameEn.value = pick.en;
  genCharName.value = pick.char;
  genHatStyle.value = pick.hat;
  genVehicleStyle.value = pick.veh;
  genColorHat.value = pick.cHat;
  genColorShirt.value = pick.cShirt;
  genColorOveralls.value = pick.cOver;
  genColorVehicle.value = pick.cVeh;
  genColorGround.value = pick.cGrd;

  const built = buildThemeSetFromVisualBuilder();
  jsonThemeEditor.value = JSON.stringify(built, null, 2);
  showToast(`🎲 ${tr(pick.th, pick.en)}`);
});

btnSaveGeneratedTheme.addEventListener('click', async () => {
  try {
    let payload;
    if (activeModalTab === 'json') {
      payload = JSON.parse(jsonThemeEditor.value);
    } else {
      payload = buildThemeSetFromVisualBuilder();
    }

    const updatedCfg = await window.companionAPI.importSharedBundle(payload);
    syncUIFromConfig(updatedCfg);
    themeModal.classList.remove('open');
    showToast(tr('🎉 บันทึกและเปิดใช้งานชุดธีมเรียบร้อยแล้ว!', '🎉 Saved & Activated Theme Set!'));
  } catch (err) {
    showToast(`❌ JSON Error: ${err.message}`);
  }
});

// Test Alert & Dismiss
btnTriggerAlertNow.addEventListener('click', async () => {
  await window.companionAPI.triggerTestAlert();
  showToast(tr('🔔 ทดสอบแจ้งเตือนบน Taskbar แล้ว!', '🔔 Triggered Cartoon Alert on Taskbar!'));
});

btnDismissNow.addEventListener('click', async () => {
  await window.companionAPI.dismissAlert();
  showToast(tr('✅ ปิดการแจ้งเตือนแล้ว', '✅ Alert dismissed'));
});

// Character & Screen Position listeners
selectSkin.addEventListener('change', () => {
  savePartial({ characterSkin: selectSkin.value });
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
  });
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

chkAlarmEnabled.addEventListener('change', () => {
  savePartial({ alarmEnabled: chkAlarmEnabled.checked });
});

inputWakeTime.addEventListener('change', () => {
  savePartial({ wakeTime: inputWakeTime.value || '16:00' });
});

chkSoundEnabled.addEventListener('change', () => {
  savePartial({ soundEnabled: chkSoundEnabled.checked });
});
