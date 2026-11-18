/**
 * 2D Cartoon Taskbar Companion & Pomodoro Alert Engine (60 FPS HTML5 Canvas)
 * Supports "Theme Sets" (Character Style + Behavior Set + Custom AI Vector Shapes),
 * Bilingual TH/EN labels, and Pomodoro Phase awareness.
 */

const BUILTIN_THEME_SETS = {
  farmer: {
    id: 'farmer',
    nameTh: '🌾 ชาวสวนปาล์ม',
    nameEn: '🌾 Country Farmer',
    characterName: 'ลุงสมชาย',
    alertMessageFocusEnd: '🍅 ครบเวลาโฟกัสแล้ว! พักสายตาสักนิดนะ (Focus Complete! Time for a break!)',
    alertMessageBreakEnd: '⚡ หมดเวลาพักแล้ว! มาลุยงานต่อกันเถอะ (Break Over! Ready to focus!)',
    alertMessageBackHome: '🏡 16:00 เลิกงานแล้ว กลับบ้านกัน! (16:00 Back Home Time!)',
    character: {
      skinTone: '#F1C29B',
      cheek: '#E88B78',
      hatStyle: 'straw-hat', // 'straw-hat' | 'chef-hat' | 'wizard-hat' | 'samurai-helm' | 'crown' | 'cap' | 'headphones'
      hatMain: '#E5B95C',
      hatDark: '#C49438',
      hatBand: '#C93B2B',
      shirt: '#284B7A',
      shirtSleeve: '#1E3A61',
      overalls: '#1D3354',
      kamarBelt: true,
      pants: '#34495E',
      boots: '#2C3E28',
      sunglasses: false,
      mustache: true,
      vehicleStyle: 'tractor', // 'tractor' | 'scooter' | 'magic-broom' | 'hover-bike' | 'desk-chair'
      vehicleBody: '#D32F2F',
      vehicleTrim: '#FFCA28',
      vehicleWheel: '#263238',
      vehicleRim: '#FBC02D',
      groundColor: '#4CAF50',
      customHeadShapes: []
    },
    behaviors: [
      {
        id: 'tractor',
        icon: '🚜',
        labelTh: 'ขับรถไถฟาร์ม',
        labelEn: 'Drive a Tractor',
        movementType: 'ride',
        toolType: 'steering',
        propType: 'none',
        particleType: 'smoke',
        particleColor: '#CFD8DC'
      },
      {
        id: 'machete',
        icon: '🔪',
        labelTh: 'ถือมีดพร้าดายหญ้า',
        labelEn: 'Swing Machete',
        movementType: 'walk',
        toolType: 'machete',
        propType: 'grass',
        particleType: 'grass',
        particleColor: '#66BB6A'
      },
      {
        id: 'water',
        icon: '🚿',
        labelTh: 'รดน้ำต้นไม้',
        labelEn: 'Pouring Water',
        movementType: 'walk',
        toolType: 'watering-can',
        propType: 'flowers',
        particleType: 'water',
        particleColor: '#4FC3F7'
      },
      {
        id: 'plant',
        icon: '🌱',
        labelTh: 'ปลูกต้นไม้ใหม่',
        labelEn: 'Plant the Tree',
        movementType: 'work-pause',
        toolType: 'shovel',
        propType: 'sapling',
        particleType: 'spark',
        particleColor: '#81C784'
      },
      {
        id: 'palm',
        icon: '🌴',
        labelTh: 'แทงปาล์มน้ำมัน',
        labelEn: 'Harvest Oil Palm',
        movementType: 'work-pause',
        toolType: 'sickle-pole',
        propType: 'palm-tree',
        particleType: 'spark',
        particleColor: '#FF7043'
      },
      {
        id: 'fertilizer',
        icon: '🌾',
        labelTh: 'หว่านปุ๋ยบำรุงดิน',
        labelEn: 'Spread Fertilizer',
        movementType: 'walk',
        toolType: 'sack-throw',
        propType: 'none',
        particleType: 'fertilizer',
        particleColor: '#FFF176'
      },
      {
        id: 'fix',
        icon: '🔧',
        labelTh: 'ซ่อมรั้วและเครื่องมือ',
        labelEn: 'Fix the Things',
        movementType: 'work-pause',
        toolType: 'hammer',
        propType: 'fence-toolbox',
        particleType: 'spark',
        particleColor: '#FFD54F'
      }
    ]
  },

  chef: {
    id: 'chef',
    nameTh: '🍜 เชฟสตรีทฟู้ด',
    nameEn: '🍜 Street Food Chef',
    characterName: 'เชฟหมูกรอบ',
    alertMessageFocusEnd: '🍜 อาหารสุกพอดี! พักชิมของอร่อยก่อนนะ (Dish Ready! Take a break!)',
    alertMessageBreakEnd: '🔥 ตั้งกระทะรอบใหม่! มาลุยโฟกัสกันต่อ (Wok Heated! Back to Focus!)',
    alertMessageBackHome: '🏡 16:00 ปิดร้านแล้ว กลับบ้านกัน! (16:00 Kitchen Closed!)',
    character: {
      skinTone: '#F5CBA7',
      cheek: '#F1948A',
      hatStyle: 'chef-hat',
      hatMain: '#FFFFFF',
      hatDark: '#CFD8DC',
      hatBand: '#E53935',
      shirt: '#FFFFFF',
      shirtSleeve: '#ECEFF1',
      overalls: '#D32F2F',
      kamarBelt: false,
      pants: '#263238',
      boots: '#3E2723',
      sunglasses: false,
      mustache: true,
      vehicleStyle: 'scooter',
      vehicleBody: '#FB8C00',
      vehicleTrim: '#FFF176',
      vehicleWheel: '#212121',
      vehicleRim: '#ECEFF1',
      groundColor: '#FFB300',
      customHeadShapes: []
    },
    behaviors: [
      {
        id: 'tractor',
        icon: '🛵',
        labelTh: 'ขี่รถพ่วงสตรีทฟู้ด',
        labelEn: 'Ride Food Scooter',
        movementType: 'ride',
        toolType: 'steering',
        propType: 'none',
        particleType: 'smoke',
        particleColor: '#FFF9C4'
      },
      {
        id: 'machete',
        icon: '🔪',
        labelTh: 'สับหมูกรอบรัวๆ',
        labelEn: 'Chop Crispy Pork',
        movementType: 'walk',
        toolType: 'machete',
        propType: 'grass',
        particleType: 'spark',
        particleColor: '#FFAB40'
      },
      {
        id: 'water',
        icon: '🧋',
        labelTh: 'ชักชาไทยเย็น',
        labelEn: 'Pour Thai Tea',
        movementType: 'walk',
        toolType: 'watering-can',
        propType: 'flowers',
        particleType: 'water',
        particleColor: '#FF8A65'
      },
      {
        id: 'plant',
        icon: '🌿',
        labelTh: 'ปลูกต้นกะเพรา',
        labelEn: 'Plant Holy Basil',
        movementType: 'work-pause',
        toolType: 'shovel',
        propType: 'sapling',
        particleType: 'grass',
        particleColor: '#66BB6A'
      },
      {
        id: 'palm',
        icon: '🥥',
        labelTh: 'สอยมะพร้าวน้ำหอม',
        labelEn: 'Harvest Coconuts',
        movementType: 'work-pause',
        toolType: 'sickle-pole',
        propType: 'palm-tree',
        particleType: 'spark',
        particleColor: '#81C784'
      },
      {
        id: 'fertilizer',
        icon: '🌶️',
        labelTh: 'โรยพริกคั่วปรุงรส',
        labelEn: 'Sprinkle Chili Spices',
        movementType: 'walk',
        toolType: 'sack-throw',
        propType: 'none',
        particleType: 'fertilizer',
        particleColor: '#FF5252'
      },
      {
        id: 'fix',
        icon: '🍳',
        labelTh: 'เคาะกระทะเหล็กเผาไฟ',
        labelEn: 'Season Iron Wok',
        movementType: 'work-pause',
        toolType: 'hammer',
        propType: 'fence-toolbox',
        particleType: 'spark',
        particleColor: '#FFD740'
      }
    ]
  },

  wizard: {
    id: 'wizard',
    nameTh: '🧙‍♂️ พ่อมดนักปรุงยา',
    nameEn: '🧙‍♂️ Cozy Alchemist Wizard',
    characterName: 'จอมเวทย์ภูมิ',
    alertMessageFocusEnd: '✨ ร่ายเวทย์ครบสมบูรณ์! พักฟื้นมานาก่อนนะ (Spell Complete! Recharge Mana!)',
    alertMessageBreakEnd: '🔮 มานาเต็มหลอดแล้ว! เริ่มร่ายเวทย์รอบต่อไป (Mana Full! Start Next Focus!)',
    alertMessageBackHome: '🏡 16:00 ปิดหอคอยเวทมนตร์ กลับบ้านกัน! (16:00 Tower Closed!)',
    character: {
      skinTone: '#F3D2B8',
      cheek: '#F48FB1',
      hatStyle: 'wizard-hat',
      hatMain: '#4A148C',
      hatDark: '#311B92',
      hatBand: '#FFD54F',
      shirt: '#5E35B1',
      shirtSleeve: '#4527A0',
      overalls: '#311B92',
      kamarBelt: false,
      pants: '#1A237E',
      boots: '#4E342E',
      sunglasses: false,
      mustache: false,
      vehicleStyle: 'magic-broom',
      vehicleBody: '#6D4C41',
      vehicleTrim: '#FFD54F',
      vehicleWheel: '#4A148C',
      vehicleRim: '#00E5FF',
      groundColor: '#9575CD',
      customHeadShapes: []
    },
    behaviors: [
      {
        id: 'tractor',
        icon: '🧹',
        labelTh: 'ขี่ไม้กวาดเวทมนตร์',
        labelEn: 'Fly Magic Broom',
        movementType: 'ride',
        toolType: 'steering',
        propType: 'none',
        particleType: 'spark',
        particleColor: '#EA80FC'
      },
      {
        id: 'machete',
        icon: '🪄',
        labelTh: 'กวัดแกว่งคทาเวทย์',
        labelEn: 'Cast Wand Spell',
        movementType: 'walk',
        toolType: 'wand',
        propType: 'grass',
        particleType: 'spark',
        particleColor: '#FFD54F'
      },
      {
        id: 'water',
        icon: '🧪',
        labelTh: 'เทน้ำยาโพชั่นฟื้นฟู',
        labelEn: 'Pour Mana Elixir',
        movementType: 'walk',
        toolType: 'watering-can',
        propType: 'flowers',
        particleType: 'water',
        particleColor: '#00E5FF'
      },
      {
        id: 'plant',
        icon: '🔮',
        labelTh: 'เสกต้นไม้คริสตัล',
        labelEn: 'Grow Crystal Tree',
        movementType: 'work-pause',
        toolType: 'wand',
        propType: 'sapling',
        particleType: 'spark',
        particleColor: '#B388FF'
      },
      {
        id: 'palm',
        icon: '🌟',
        labelTh: 'สอยผลไม้แห่งดวงดาว',
        labelEn: 'Harvest Starfruit',
        movementType: 'work-pause',
        toolType: 'sickle-pole',
        propType: 'palm-tree',
        particleType: 'spark',
        particleColor: '#FFE57F'
      },
      {
        id: 'fertilizer',
        icon: '✨',
        labelTh: 'โปรยผงภูตเรืองแสง',
        labelEn: 'Scatter Fairy Dust',
        movementType: 'walk',
        toolType: 'sack-throw',
        propType: 'none',
        particleType: 'fertilizer',
        particleColor: '#80D8FF'
      },
      {
        id: 'fix',
        icon: '⚒️',
        labelTh: 'ตีหินรูนซ่อมศิลา',
        labelEn: 'Forge Arcane Runes',
        movementType: 'work-pause',
        toolType: 'hammer',
        propType: 'fence-toolbox',
        particleType: 'spark',
        particleColor: '#FF80AB'
      }
    ]
  },

  coder: {
    id: 'coder',
    nameTh: '💻 นักพัฒนาสายโฟกัส',
    nameEn: '💻 Focus Software Dev',
    characterName: 'เดฟต้น',
    alertMessageFocusEnd: '🍅 โค้ดรันผ่านฉลุย! พักยืดเส้นยืดสายก่อนนะ (Build Passed! Time for a Break!)',
    alertMessageBreakEnd: '☕ เติมกาแฟแล้ว! มาเริ่ม Sprint ต่อไปกัน (Coffee Refilled! Next Sprint!)',
    alertMessageBackHome: '🏡 16:00 ปิดคอมได้! เลิกงานกลับบ้านกัน! (16:00 Push & Go Home!)',
    character: {
      skinTone: '#F3C6A0',
      cheek: '#FF8A80',
      hatStyle: 'headphones',
      hatMain: '#00E5FF',
      hatDark: '#1E293B',
      hatBand: '#FF007F',
      shirt: '#1E293B',
      shirtSleeve: '#0F172A',
      overalls: '#334155',
      kamarBelt: false,
      pants: '#0F172A',
      boots: '#00E5FF',
      sunglasses: true,
      mustache: false,
      vehicleStyle: 'hover-bike',
      vehicleBody: '#0F172A',
      vehicleTrim: '#00E5FF',
      vehicleWheel: '#1E293B',
      vehicleRim: '#38BDF8',
      groundColor: '#38BDF8',
      customHeadShapes: []
    },
    behaviors: [
      {
        id: 'tractor',
        icon: '🛴',
        labelTh: 'ซิ่งโฮเวอร์สกู๊ตเตอร์',
        labelEn: 'Ride Hover Scooter',
        movementType: 'ride',
        toolType: 'steering',
        propType: 'none',
        particleType: 'smoke',
        particleColor: '#80D8FF'
      },
      {
        id: 'machete',
        icon: '⚔️',
        labelTh: 'ฟันบั๊กด้วยเลเซอร์เบลด',
        labelEn: 'Slash Bugs with Laser',
        movementType: 'walk',
        toolType: 'katana',
        propType: 'grass',
        particleType: 'spark',
        particleColor: '#00E5FF'
      },
      {
        id: 'water',
        icon: '☕',
        labelTh: 'ดริปกาแฟเติมพลัง',
        labelEn: 'Pour Specialty Coffee',
        movementType: 'walk',
        toolType: 'watering-can',
        propType: 'flowers',
        particleType: 'water',
        particleColor: '#A1887F'
      },
      {
        id: 'plant',
        icon: '🌱',
        labelTh: 'Commit Green Graph',
        labelEn: 'Plant Green Commits',
        movementType: 'work-pause',
        toolType: 'shovel',
        propType: 'sapling',
        particleType: 'spark',
        particleColor: '#4ADE80'
      },
      {
        id: 'palm',
        icon: '💎',
        labelTh: 'เก็บเกี่ยว Cloud Nodes',
        labelEn: 'Harvest Cloud Nodes',
        movementType: 'work-pause',
        toolType: 'sickle-pole',
        propType: 'palm-tree',
        particleType: 'spark',
        particleColor: '#38BDF8'
      },
      {
        id: 'fertilizer',
        icon: '✨',
        labelTh: 'Deploy ไมโครเซอร์วิส',
        labelEn: 'Deploy Microservices',
        movementType: 'walk',
        toolType: 'sack-throw',
        propType: 'none',
        particleType: 'fertilizer',
        particleColor: '#FACC15'
      },
      {
        id: 'fix',
        icon: '🔧',
        labelTh: 'Refactor & ซ่อมเซิร์ฟเวอร์',
        labelEn: 'Refactor Server Gear',
        movementType: 'work-pause',
        toolType: 'hammer',
        propType: 'fence-toolbox',
        particleType: 'spark',
        particleColor: '#F472B6'
      }
    ]
  }
};

// Backward-compatible farmer skins
const SKINS = {
  'thai-kamar': BUILTIN_THEME_SETS.farmer.character,
  'classic-overalls': {
    ...BUILTIN_THEME_SETS.farmer.character,
    skinTone: '#FAD2B8',
    cheek: '#F28B82',
    hatMain: '#F4CE6A',
    hatDark: '#D4A843',
    hatBand: '#D94336',
    shirt: '#D94E41',
    shirtSleeve: '#B83B30',
    overalls: '#2E6F9E',
    kamarBelt: false,
    pants: '#255A82',
    boots: '#6E4726',
    sunglasses: false,
    mustache: false
  },
  'modern-rancher': {
    ...BUILTIN_THEME_SETS.farmer.character,
    skinTone: '#E8B48A',
    cheek: '#E07A68',
    hatStyle: 'cap',
    hatMain: '#2E7D32',
    hatDark: '#1B5E20',
    hatBand: '#FBC02D',
    shirt: '#689F38',
    shirtSleeve: '#558B2F',
    overalls: '#8D6E63',
    kamarBelt: false,
    pants: '#4E342E',
    boots: '#F57F17',
    sunglasses: false,
    mustache: false
  },
  'golden-palm': {
    ...BUILTIN_THEME_SETS.farmer.character,
    skinTone: '#F3C6A0',
    cheek: '#E88A78',
    hatMain: '#FFF3D1',
    hatDark: '#D9C38A',
    hatBand: '#E65100',
    shirt: '#EF6C00',
    shirtSleeve: '#E65100',
    overalls: '#37474F',
    kamarBelt: true,
    pants: '#263238',
    boots: '#4E342E',
    sunglasses: true,
    mustache: true
  }
};

class FarmerEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isPreview = Boolean(options.isPreview);

    this.lang = options.lang || 'both'; // 'th' | 'en' | 'both'
    this.customThemeSets = {};
    this.activeThemeSetId = options.themeSetId || 'farmer';
    this.skinId = options.skinId || 'thai-kamar';
    this.behaviorMode = options.behavior || 'cycle';
    this.currentBehaviorIndex = 0;
    this.currentBehaviorId = 'tractor';
    this.isAlerting = Boolean(options.isAlerting);
    this.isOvertime = Boolean(options.isOvertime);
    this.walkSpeed = Number(options.walkSpeed) || 1.0;
    this.cycleIntervalSec = Number(options.cycleIntervalSec) || 14;

    this.x = canvas.width * 0.5;
    this.direction = -1;
    this.time = 0;
    this.lastFrameTime = performance.now();
    this.lastCycleSwitch = performance.now();
    this.particles = [];

    this.onBehaviorChange = options.onBehaviorChange || null;
    this._running = false;
  }

  getAllThemeSets() {
    return {
      ...BUILTIN_THEME_SETS,
      ...this.customThemeSets
    };
  }

  getActiveThemeSet() {
    const all = this.getAllThemeSets();
    return all[this.activeThemeSetId] || BUILTIN_THEME_SETS.farmer;
  }

  getActiveCharacterStyle() {
    const themeSet = this.getActiveThemeSet();
    if (this.activeThemeSetId === 'farmer' && SKINS[this.skinId]) {
      return {
        ...BUILTIN_THEME_SETS.farmer.character,
        ...SKINS[this.skinId]
      };
    }
    return {
      ...BUILTIN_THEME_SETS.farmer.character,
      ...(themeSet.character || {})
    };
  }

  getActiveBehaviorsList() {
    const themeSet = this.getActiveThemeSet();
    if (Array.isArray(themeSet.behaviors) && themeSet.behaviors.length > 0) {
      return themeSet.behaviors;
    }
    return BUILTIN_THEME_SETS.farmer.behaviors;
  }

  getCurrentBehaviorObj() {
    const list = this.getActiveBehaviorsList();
    const found = list.find((b) => b.id === this.currentBehaviorId);
    return found || list[this.currentBehaviorIndex % list.length] || list[0];
  }

  formatBilingual(th, en) {
    if (this.lang === 'en') return en || th || '';
    return th || en || '';
  }

  getCurrentBehaviorLabel() {
    const bObj = this.getCurrentBehaviorObj();
    if (!bObj) return '';
    return `${bObj.icon || '✨'} ${this.formatBilingual(bObj.labelTh, bObj.labelEn)}`;
  }

  setConfig(cfg) {
    if (cfg.language) {
      this.lang = cfg.language;
    }
    if (cfg.customThemeSets && typeof cfg.customThemeSets === 'object') {
      this.customThemeSets = cfg.customThemeSets;
    }
    if (cfg.activeThemeSet) {
      this.activeThemeSetId = cfg.activeThemeSet;
    }
    if (cfg.characterSkin && SKINS[cfg.characterSkin]) {
      this.skinId = cfg.characterSkin;
    }
    if (cfg.walkSpeed !== undefined) {
      this.walkSpeed = Number(cfg.walkSpeed) || 1.0;
    }
    if (cfg.cycleIntervalSec !== undefined) {
      this.cycleIntervalSec = Math.max(5, Number(cfg.cycleIntervalSec) || 14);
    }

    const list = this.getActiveBehaviorsList();
    if (!list.some((b) => b.id === this.currentBehaviorId)) {
      this.currentBehaviorIndex = 0;
      this.currentBehaviorId = list[0].id;
    }

    const targetMode = this.isAlerting
      ? (cfg.alertBehavior || cfg.idleBehavior || 'cycle')
      : (cfg.idleBehavior || 'cycle');
    this.setBehaviorMode(targetMode);
  }

  setBehaviorMode(mode) {
    this.behaviorMode = mode;
    const list = this.getActiveBehaviorsList();
    if (mode !== 'cycle') {
      const idx = list.findIndex((b) => b.id === mode);
      if (idx !== -1 && this.currentBehaviorId !== mode) {
        this.currentBehaviorIndex = idx;
        this.currentBehaviorId = mode;
        this.particles = [];
        if (this.onBehaviorChange) {
          this.onBehaviorChange(this.currentBehaviorId, this.getCurrentBehaviorObj());
        }
      }
    }
  }

  nextBehavior() {
    const list = this.getActiveBehaviorsList();
    this.currentBehaviorIndex = (this.currentBehaviorIndex + 1) % list.length;
    this.currentBehaviorId = list[this.currentBehaviorIndex].id;
    this.particles = [];
    return this.currentBehaviorId;
  }

  setAlerting(alerting, isOvertime = false) {
    this.isAlerting = Boolean(alerting);
    this.isOvertime = Boolean(isOvertime);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this.lastFrameTime = performance.now();
    const loop = (now) => {
      if (!this._running) return;
      const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
      this.lastFrameTime = now;
      this.update(dt, now);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this._running = false;
  }

  getFarmerBounds() {
    const groundY = this.canvas.height - 14;
    return {
      x: this.x - 80,
      y: groundY - 160,
      width: 160,
      height: 160
    };
  }

  update(dt, now) {
    const speedMultiplier = (this.isAlerting || this.isOvertime ? 1.35 : 1.0) * this.walkSpeed;
    this.time += dt * speedMultiplier;

    const list = this.getActiveBehaviorsList();
    if (this.behaviorMode === 'cycle' && list.length > 0) {
      if (now - this.lastCycleSwitch > this.cycleIntervalSec * 1000) {
        this.lastCycleSwitch = now;
        this.currentBehaviorIndex = (this.currentBehaviorIndex + 1) % list.length;
        this.currentBehaviorId = list[this.currentBehaviorIndex].id;
        this.particles = [];
        if (this.onBehaviorChange) {
          this.onBehaviorChange(this.currentBehaviorId, this.getCurrentBehaviorObj());
        }
      }
    }

    const bObj = this.getCurrentBehaviorObj();
    const moveType = bObj.movementType || 'walk';

    const margin = this.isPreview ? 75 : 88;
    const minX = margin;
    const maxX = Math.max(margin + 20, this.canvas.width - margin);

    let moveRate = 36;
    if (moveType === 'ride' || bObj.id === 'tractor') moveRate = 60;
    else if (moveType === 'work-pause' || bObj.id === 'plant' || bObj.id === 'palm' || bObj.id === 'fix') {
      const cyclePhase = this.time % 4.0;
      moveRate = cyclePhase < 1.1 ? 34 : 0;
    } else if (moveType === 'stationary') {
      moveRate = 0;
    }

    if (this.isPreview) {
      moveRate *= 0.45;
    }

    this.x += this.direction * moveRate * dt * speedMultiplier;
    if (this.x <= minX) {
      this.x = minX;
      this.direction = 1;
    } else if (this.x >= maxX) {
      this.x = maxX;
      this.direction = -1;
    }

    this.spawnParticles(dt, bObj);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 0) * dt;
      if (p.groundY && p.y > p.groundY) {
        p.y = p.groundY;
        p.vy = -Math.abs(p.vy) * 0.45;
        p.vx *= 0.7;
      }
    }
  }

  spawnParticles(dt, bObj) {
    const groundY = this.canvas.height - 14;
    const dir = this.direction;

    // 1. Declarative custom particle emitter from JSON config (`bObj.particles`)
    if (bObj.particles && typeof bObj.particles === 'object') {
      const pe = bObj.particles;
      const rate = Number(pe.spawnRate) || 18;
      if (Math.random() < dt * rate) {
        const vxMin = Array.isArray(pe.vxRange) ? pe.vxRange[0] : -30;
        const vxMax = Array.isArray(pe.vxRange) ? pe.vxRange[1] : 50;
        const vyMin = Array.isArray(pe.vyRange) ? pe.vyRange[0] : -70;
        const vyMax = Array.isArray(pe.vyRange) ? pe.vyRange[1] : -20;
        const colors =
          Array.isArray(pe.colors) && pe.colors.length > 0
            ? pe.colors
            : [bObj.particleColor || '#FFD54F'];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        const life = Number(pe.life) || 0.75;

        this.particles.push({
          type: pe.shape || 'circle',
          text: pe.text || '✨',
          x: this.x + dir * (Number(pe.offsetX) || 32) + (Math.random() - 0.5) * 12,
          y: groundY + (Number(pe.offsetY) || -42) + (Math.random() - 0.5) * 10,
          vx: dir * (vxMin + Math.random() * (vxMax - vxMin)),
          vy: vyMin + Math.random() * (vyMax - vyMin),
          gravity: pe.gravity !== undefined ? Number(pe.gravity) : 140,
          groundY: pe.bounce !== false ? groundY : null,
          r: (Number(pe.size) || 4) * (0.8 + Math.random() * 0.4),
          angle: Math.random() * Math.PI,
          life,
          maxLife: life,
          color: chosenColor
        });
      }
      return;
    }

    // 2. Fallback preset particle emitter (`particleType`)
    const pType = bObj.particleType || 'spark';
    const pColor = bObj.particleColor || '#FFD54F';

    if (pType === 'smoke') {
      if (Math.random() < dt * 9) {
        this.particles.push({
          type: 'smoke',
          x: this.x + dir * 24,
          y: groundY - 94,
          vx: -dir * (18 + Math.random() * 15),
          vy: -35 - Math.random() * 20,
          gravity: -10,
          r: 5 + Math.random() * 5,
          life: 0.9,
          maxLife: 0.9,
          color: this.isAlerting ? '#FFE082' : pColor
        });
      }
    } else if (pType === 'grass') {
      const swing = Math.sin(this.time * 8);
      if (swing > 0.75 && Math.random() < dt * 22) {
        this.particles.push({
          type: 'grass',
          x: this.x + dir * 42 + (Math.random() - 0.5) * 14,
          y: groundY - 18 - Math.random() * 14,
          vx: dir * (25 + Math.random() * 45),
          vy: -55 - Math.random() * 45,
          gravity: 190,
          groundY,
          angle: Math.random() * Math.PI,
          life: 0.75,
          maxLife: 0.75,
          color: pColor
        });
      }
    } else if (pType === 'water') {
      if (Math.random() < dt * 32) {
        this.particles.push({
          type: 'water',
          x: this.x + dir * 48 + (Math.random() - 0.5) * 6,
          y: groundY - 46 + (Math.random() - 0.5) * 4,
          vx: dir * (28 + Math.random() * 28),
          vy: 15 + Math.random() * 25,
          gravity: 220,
          groundY,
          r: 2.5 + Math.random() * 1.5,
          life: 0.55,
          maxLife: 0.55,
          color: pColor
        });
      }
    } else if (pType === 'fertilizer') {
      const tossPhase = Math.sin(this.time * 6.5);
      if (tossPhase > 0.5 && Math.random() < dt * 35) {
        this.particles.push({
          type: 'fertilizer',
          x: this.x + dir * 24,
          y: groundY - 58,
          vx: dir * (45 + Math.random() * 65),
          vy: -75 - Math.random() * 40,
          gravity: 240,
          groundY,
          r: 2.8,
          life: 0.85,
          maxLife: 0.85,
          color: pColor
        });
      }
    } else if (pType === 'spark' || pType === 'star' || pType === 'heart' || pType === 'note') {
      const hit = Math.sin(this.time * 9);
      if (hit > 0.65 && Math.random() < dt * 24) {
        this.particles.push({
          type: pType,
          x: this.x + dir * 38,
          y: groundY - 38,
          vx: (Math.random() - 0.5) * 85,
          vy: -50 - Math.random() * 60,
          gravity: pType === 'note' || pType === 'heart' ? -25 : 200,
          groundY: pType === 'note' || pType === 'heart' ? null : groundY,
          r: 4,
          life: 0.65,
          maxLife: 0.65,
          color: pColor
        });
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const groundY = h - 14;
    const bObj = this.getCurrentBehaviorObj();
    const skin = this.getActiveCharacterStyle();

    this.drawGroundStrip(ctx, w, groundY);
    this.drawBehaviorBackgroundProps(ctx, groundY, bObj);

    ctx.save();
    ctx.translate(this.x, groundY);
    ctx.scale(this.direction, 1);

    // If character defines a 100% custom non-humanoid body (`replaceDefaultBody: true`), draw it!
    if (skin.replaceDefaultBody && Array.isArray(skin.bodyDrawables)) {
      const bob = Math.sin(this.time * 6) * 3;
      ctx.save();
      ctx.translate(0, -bob);
      this.drawDrawableList(ctx, skin.bodyDrawables);
      if (Array.isArray(bObj.toolDrawables)) {
        this.drawDrawableList(ctx, bObj.toolDrawables);
      }
      ctx.restore();
    } else if (
      bObj.movementType === 'ride' ||
      bObj.movementType === 'hover' ||
      bObj.id === 'tractor' ||
      Array.isArray(bObj.vehicleDrawables)
    ) {
      this.drawVehicleWithCharacter(ctx, bObj);
    } else {
      this.drawWalkingCharacter(ctx, bObj);
    }
    ctx.restore();

    this.drawParticles(ctx);
    if (this.isPreview) {
      this.drawBehaviorMiniTag(ctx, groundY, bObj);
    }
  }

  // ==========================================================================
  // UNIVERSAL DECLARATIVE 2D DRAWABLE & ANIMATION SCENE GRAPH ENGINE
  // Any shape or group in JSON can define geometry + `anim` keyframe/wave rules
  // ==========================================================================
  drawDrawableList(ctx, shapes) {
    if (!Array.isArray(shapes) || shapes.length === 0) return;
    const t = this.time;

    for (const s of shapes) {
      if (!s || !s.type) continue;

      // Optional blink visibility check
      if (s.anim && s.anim.blink) {
        const bSpeed = Number(s.anim.blink.speed) || 1.8;
        const bThresh = Number(s.anim.blink.threshold) || 0.96;
        if (Math.sin(t * bSpeed) > bThresh) continue;
      }

      ctx.save();

      // Apply local transform + declarative `anim`
      let tx = Number(s.x) || 0;
      let ty = Number(s.y) || 0;
      let rotRad = ((Number(s.rotDeg) || 0) * Math.PI) / 180 + (Number(s.rot) || 0);
      let sx = s.scaleX !== undefined ? Number(s.scaleX) : 1;
      let sy = s.scaleY !== undefined ? Number(s.scaleY) : 1;

      if (s.anim && typeof s.anim === 'object') {
        const a = s.anim;
        if (a.moveXAmp) {
          tx += Math.sin(t * (Number(a.moveXSpeed) || 4) + (Number(a.moveXPhase) || 0)) * Number(a.moveXAmp);
        }
        if (a.moveYAmp) {
          ty += Math.sin(t * (Number(a.moveYSpeed) || 4) + (Number(a.moveYPhase) || 0)) * Number(a.moveYAmp);
        }
        if (a.fallLoop) {
          const dur = Math.max(0.5, Number(a.fallLoop.duration) || 2.5);
          const startAt = Number(a.fallLoop.startAt) || 1.0;
          const dropY = Number(a.fallLoop.dropY) || 85;
          const cyc = (t * 1.3) % dur;
          if (cyc > startAt) {
            const fallT = Math.min(1, (cyc - startAt) / Math.max(0.2, (dur - startAt) * 0.5));
            const bounce =
              a.fallLoop.bounce !== false && fallT >= 1
                ? Math.abs(Math.sin((cyc - startAt) * 9)) * 8
                : 0;
            ty += fallT * dropY - bounce;
          }
        }
        if (a.rotateSpeed) {
          rotRad += ((t * Number(a.rotateSpeed)) * Math.PI) / 180;
        }
        if (a.swingDeg) {
          const deg =
            Math.sin(t * (Number(a.swingSpeed) || 6) + (Number(a.swingPhase) || 0)) *
            Number(a.swingDeg);
          rotRad += (deg * Math.PI) / 180;
        }
        if (a.scaleAmp) {
          const sc =
            1 +
            Math.sin(t * (Number(a.scaleSpeed) || 4) + (Number(a.scalePhase) || 0)) *
            Number(a.scaleAmp);
          sx *= sc;
          sy *= sc;
        }
      }

      const pivX = (s.anim && Number(s.anim.pivotX)) || 0;
      const pivY = (s.anim && Number(s.anim.pivotY)) || 0;

      ctx.translate(tx + pivX, ty + pivY);
      if (rotRad !== 0) ctx.rotate(rotRad);
      if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
      ctx.translate(-pivX, -pivY);

      if (s.alpha !== undefined) {
        ctx.globalAlpha *= Math.max(0, Math.min(1, Number(s.alpha)));
      }

      ctx.fillStyle = s.fill || 'transparent';
      ctx.strokeStyle = s.stroke || 'transparent';
      ctx.lineWidth = Number(s.lineWidth) || 1.5;
      if (s.cap) ctx.lineCap = s.cap;

      if (s.type === 'group') {
        if (Array.isArray(s.children)) {
          this.drawDrawableList(ctx, s.children);
        }
      } else if (s.type === 'rect' || s.type === 'roundRect') {
        ctx.beginPath();
        ctx.roundRect(0, 0, Number(s.w) || 10, Number(s.h) || 10, Number(s.r) || 0);
        if (s.fill) ctx.fill();
        if (s.stroke) ctx.stroke();
      } else if (s.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, Number(s.r) || 6), 0, Math.PI * 2);
        if (s.fill) ctx.fill();
        if (s.stroke) ctx.stroke();
      } else if (s.type === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(0.5, Number(s.rx) || 8), Math.max(0.5, Number(s.ry) || 4), 0, 0, Math.PI * 2);
        if (s.fill) ctx.fill();
        if (s.stroke) ctx.stroke();
      } else if (s.type === 'arc') {
        const startRad = ((Number(s.startDeg) || 0) * Math.PI) / 180;
        const endRad = ((s.endDeg !== undefined ? Number(s.endDeg) : 180) * Math.PI) / 180;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, Number(s.r) || 10), startRad, endRad);
        if (s.close) ctx.closePath();
        if (s.fill) ctx.fill();
        if (s.stroke) ctx.stroke();
      } else if (s.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(Number(s.x1) || 0, Number(s.y1) || 0);
        ctx.lineTo(Number(s.x2) || 10, Number(s.y2) || 10);
        ctx.stroke();
      } else if (s.type === 'curve' || s.type === 'quadratic') {
        ctx.beginPath();
        ctx.moveTo(Number(s.x1) || 0, Number(s.y1) || 0);
        ctx.quadraticCurveTo(
          Number(s.cx) || 0,
          Number(s.cy) || 0,
          Number(s.x2) || 10,
          Number(s.y2) || 10
        );
        if (s.close) ctx.closePath();
        if (s.fill) ctx.fill();
        if (s.stroke) ctx.stroke();
      } else if (s.type === 'bezier') {
        ctx.beginPath();
        ctx.moveTo(Number(s.x1) || 0, Number(s.y1) || 0);
        ctx.bezierCurveTo(
          Number(s.cx1) || 0,
          Number(s.cy1) || 0,
          Number(s.cx2) || 0,
          Number(s.cy2) || 0,
          Number(s.x2) || 10,
          Number(s.y2) || 10
        );
        if (s.close) ctx.closePath();
        if (s.fill) ctx.fill();
        if (s.stroke) ctx.stroke();
      } else if (s.type === 'polygon' || s.type === 'path') {
        if (Array.isArray(s.points) && s.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(Number(s.points[0][0]) || 0, Number(s.points[0][1]) || 0);
          for (let i = 1; i < s.points.length; i++) {
            ctx.lineTo(Number(s.points[i][0]) || 0, Number(s.points[i][1]) || 0);
          }
          if (s.close !== false) ctx.closePath();
          if (s.fill) ctx.fill();
          if (s.stroke) ctx.stroke();
        }
      } else if (s.type === 'star') {
        const pts = Math.max(3, Number(s.points) || 5);
        const outerR = Number(s.outerR) || 10;
        const innerR = Number(s.innerR) || outerR * 0.45;
        ctx.beginPath();
        for (let i = 0; i < pts * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const a = (i * Math.PI) / pts - Math.PI / 2;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        if (s.fill) ctx.fill();
        if (s.stroke) ctx.stroke();
      } else if (s.type === 'heart') {
        const sz = Number(s.size) || 10;
        ctx.beginPath();
        ctx.moveTo(0, sz * 0.3);
        ctx.bezierCurveTo(-sz, -sz * 0.4, -sz * 0.5, -sz, 0, -sz * 0.4);
        ctx.bezierCurveTo(sz * 0.5, -sz, sz, -sz * 0.4, 0, sz * 0.3);
        if (s.fill) ctx.fill();
        if (s.stroke) ctx.stroke();
      } else if (s.type === 'text') {
        ctx.font = s.font || 'bold 12px "Segoe UI", sans-serif';
        ctx.textAlign = s.align || 'center';
        ctx.textBaseline = 'middle';
        if (s.fill) ctx.fillText(String(s.text || ''), 0, 0);
      }

      ctx.restore();
    }
  }

  // Backward-compatible alias
  drawCustomShapesArray(ctx, shapes) {
    this.drawDrawableList(ctx, shapes);
  }

  drawGroundStrip(ctx, w, groundY) {
    const charStyle = this.getActiveCharacterStyle();
    const turfColor = charStyle.groundColor || '#4CAF50';
    ctx.save();
    const grad = ctx.createRadialGradient(this.x, groundY + 2, 6, this.x, groundY + 2, 68);
    grad.addColorStop(0, 'rgba(20, 40, 20, 0.45)');
    grad.addColorStop(1, 'rgba(20, 40, 20, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(this.x, groundY + 2, 68, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (Array.isArray(charStyle.groundDrawables) && charStyle.groundDrawables.length > 0) {
      ctx.save();
      ctx.translate(this.x, groundY);
      this.drawDrawableList(ctx, charStyle.groundDrawables);
      ctx.restore();
    } else {
      const tuftCount = Math.floor(w / 55);
      for (let i = 1; i < tuftCount; i++) {
        const tx = i * 55 + Math.sin(i * 3) * 12;
        const sway = Math.sin(this.time * 2.5 + i) * 2;
        ctx.strokeStyle = turfColor;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tx, groundY + 2);
        ctx.quadraticCurveTo(tx - 4 + sway, groundY - 6, tx - 6 + sway, groundY - 9);
        ctx.moveTo(tx, groundY + 2);
        ctx.quadraticCurveTo(tx + 3 + sway, groundY - 7, tx + 5 + sway, groundY - 11);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawBehaviorBackgroundProps(ctx, groundY, bObj) {
    const dir = this.direction;
    const charStyle = this.getActiveCharacterStyle();
    const accent = charStyle.groundColor || '#43A047';

    ctx.save();

    // 1. Declarative Scene / Prop Drawables (`propDrawables` or `customPropShapes` or `sceneDrawables`)
    const customProps = bObj.propDrawables || bObj.customPropShapes || bObj.sceneDrawables;
    if (Array.isArray(customProps) && customProps.length > 0) {
      const offsetX = bObj.propOffsetX !== undefined ? Number(bObj.propOffsetX) : 52;
      ctx.save();
      ctx.translate(this.x + dir * offsetX, groundY);
      if (bObj.flipPropWithDirection) {
        ctx.scale(dir, 1);
      }
      this.drawDrawableList(ctx, customProps);
      ctx.restore();
      if (!bObj.propType || bObj.propType === 'custom' || bObj.propType === 'none') {
        ctx.restore();
        return;
      }
    }

    const propType = bObj.propType || bObj.id;

    // 2. Built-in fallback props
    if (propType === 'flowers' || bObj.id === 'water') {
      const plantX = this.x + dir * 64;
      const growScale = 0.85 + 0.2 * Math.sin(this.time * 4);
      ctx.save();
      ctx.translate(plantX, groundY);
      ctx.scale(growScale, growScale);
      ctx.fillStyle = '#6D4C41';
      ctx.beginPath();
      ctx.arc(0, 0, 14, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.quadraticCurveTo(4, -18, 0, -32);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.ellipse(-9, -18, 9, 5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(9, -22, 9, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFEE58';
      for (let a = 0; a < 5; a++) {
        const ang = (a * Math.PI * 2) / 5 + this.time;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 6, -34 + Math.sin(ang) * 6, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FB8C00';
      ctx.beginPath();
      ctx.arc(0, -34, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (propType === 'sapling' || bObj.id === 'plant') {
      const phase = (this.time % 4.0) / 4.0;
      const saplingX = this.x + dir * 44;
      ctx.save();
      ctx.translate(saplingX, groundY);
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 8, 0, Math.PI, 0);
      ctx.fill();

      const treeScale = Math.min(1.15, Math.max(0.25, phase * 1.35));
      ctx.scale(treeScale, treeScale);
      ctx.fillStyle = '#795548';
      ctx.fillRect(-3.5, -34, 7, 34);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(0, -44, 16, 0, Math.PI * 2);
      ctx.arc(-11, -36, 12, 0, Math.PI * 2);
      ctx.arc(11, -36, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (propType === 'palm-tree' || bObj.id === 'palm') {
      const palmX = this.x + dir * 56;
      ctx.save();
      ctx.translate(palmX, groundY);

      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.moveTo(-11, 0);
      ctx.lineTo(-7, -112);
      ctx.lineTo(7, -112);
      ctx.lineTo(11, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      for (let py = -12; py > -108; py -= 14) {
        ctx.beginPath();
        ctx.moveTo(-9, py);
        ctx.lineTo(9, py - 6);
        ctx.moveTo(9, py);
        ctx.lineTo(-9, py - 6);
        ctx.stroke();
      }

      const fronds = [-2.4, -1.9, -1.4, -0.5, 0.4, 1.3, 1.9, 2.4];
      fronds.forEach((angle, idx) => {
        ctx.save();
        ctx.translate(0, -112);
        const sway = Math.sin(this.time * 2 + idx) * 0.04;
        ctx.rotate(angle + sway);
        ctx.strokeStyle = idx % 2 === 0 ? accent : '#43A047';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(22, -10, 46, 6);
        ctx.stroke();
        for (let lx = 8; lx <= 44; lx += 6) {
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(lx, -2);
          ctx.lineTo(lx + 3, 9);
          ctx.stroke();
        }
        ctx.restore();
      });

      const cutCycle = (this.time * 1.4) % 2.5;
      let bunchY = -102;
      let bunchX = -dir * 8;
      if (cutCycle > 1.2) {
        const fallT = Math.min(1, (cutCycle - 1.2) / 0.6);
        const bounce = fallT >= 1 ? Math.abs(Math.sin((cutCycle - 1.8) * 8)) * 8 : 0;
        bunchY = -102 + fallT * 92 - bounce;
        bunchX = -dir * 14;
      }

      ctx.save();
      ctx.translate(bunchX, bunchY);
      ctx.fillStyle = '#D84315';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      const dots = [[-4, -4], [4, -4], [0, 0], [-5, 3], [5, 3], [0, 6], [-2, -7], [3, -7]];
      dots.forEach(([dx, dy], i) => {
        ctx.fillStyle = i % 2 === 0 ? '#FF6D00' : '#FFAB00';
        ctx.beginPath();
        ctx.arc(dx, dy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      ctx.restore();
    } else if (propType === 'fence-toolbox' || bObj.id === 'fix') {
      const propX = this.x + dir * 42;
      const shake = Math.sin(this.time * 10) > 0.8 ? (Math.random() - 0.5) * 3 : 0;
      ctx.save();
      ctx.translate(propX + shake, groundY);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(-16, -48, 9, 48);
      ctx.fillRect(10, -48, 9, 48);
      ctx.fillStyle = '#A1887F';
      ctx.fillRect(-22, -38, 46, 7);
      ctx.fillRect(-22, -22, 46, 7);
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(-12, -16, 24, 16);
      ctx.fillStyle = '#B71C1C';
      ctx.fillRect(-13, -18, 26, 4);
      ctx.strokeStyle = '#CFD8DC';
      ctx.lineWidth = 2;
      ctx.strokeRect(-5, -22, 10, 4);
      ctx.restore();
    } else if (propType === 'grass' || bObj.id === 'machete') {
      const grassX = this.x + dir * 42;
      ctx.save();
      ctx.translate(grassX, groundY);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let g = -2; g <= 2; g++) {
        ctx.beginPath();
        ctx.moveTo(g * 4, 0);
        ctx.quadraticCurveTo(g * 7, -18, g * 9, -28);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  drawWalkingCharacter(ctx, bObj) {
    const skin = this.getActiveCharacterStyle();
    const pose = bObj.pose || {};
    const walkSpeed = Number(pose.legSwingSpeed) || 7.5;
    const walkCycle = this.time * walkSpeed;
    const moveType = bObj.movementType || 'walk';
    const isMoving =
      moveType === 'walk' || (moveType === 'work-pause' && (this.time % 4.0) < 1.1);

    const legAmpRad =
      pose.legSwingDeg !== undefined
        ? (Number(pose.legSwingDeg) * Math.PI) / 180
        : 0.48;
    const legSwing = isMoving ? Math.sin(walkCycle) * legAmpRad : 0;

    const bobAmp = pose.bobAmp !== undefined ? Number(pose.bobAmp) : 3.5;
    const bob = isMoving
      ? Math.abs(Math.sin(walkCycle)) * bobAmp
      : Math.sin(this.time * 3) * 1.5;

    ctx.save();
    ctx.translate(0, -bob);

    // 1. Back Leg
    ctx.save();
    ctx.translate(-3, -24);
    ctx.rotate(-legSwing);
    this.drawLeg(ctx, skin, true);
    ctx.restore();

    // 2. Back Arm + Optional Back Hand Drawables
    ctx.save();
    ctx.translate(-4, -52);
    if (Array.isArray(bObj.backHandDrawables) && bObj.backHandDrawables.length > 0) {
      const backBase = ((Number(pose.backArmBaseDeg) || 15) * Math.PI) / 180;
      const backSwing =
        ((Number(pose.backArmSwingDeg) || 10) *
          Math.sin(this.time * (Number(pose.backArmSwingSpeed) || 5)) *
          Math.PI) /
        180;
      ctx.rotate(backBase + backSwing);
      this.drawArm(ctx, skin, true);
      ctx.save();
      ctx.translate(0, 17);
      this.drawDrawableList(ctx, bObj.backHandDrawables);
      ctx.restore();
    } else if (bObj.toolType === 'sack-throw' || bObj.id === 'fertilizer') {
      ctx.rotate(0.25);
      this.drawArm(ctx, skin, true);
      ctx.fillStyle = '#FFF8E1';
      ctx.strokeStyle = '#D7CCC8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-14, 6, 22, 26, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2E7D32';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('BAG', -10, 22);
    } else {
      ctx.rotate(-legSwing * 0.8);
      this.drawArm(ctx, skin, true);
    }
    ctx.restore();

    // 3. Torso
    ctx.save();
    if (pose.torsoTiltDeg) {
      ctx.rotate((Number(pose.torsoTiltDeg) * Math.PI) / 180);
    }
    this.drawTorso(ctx, skin);
    ctx.restore();

    // 4. Front Leg
    ctx.save();
    ctx.translate(3, -24);
    ctx.rotate(legSwing);
    this.drawLeg(ctx, skin, false);
    ctx.restore();

    // 5. Head & Hat
    ctx.save();
    ctx.translate(0, -60);
    let headTilt =
      pose.headTiltDeg !== undefined
        ? (Number(pose.headTiltDeg) * Math.PI) / 180
        : bObj.toolType === 'sickle-pole'
          ? -0.24
          : bObj.toolType === 'shovel' || bObj.toolType === 'hammer'
            ? 0.15
            : Math.sin(this.time * 3) * 0.05;
    if (pose.headSwingDeg) {
      headTilt +=
        (Math.sin(this.time * (Number(pose.headSwingSpeed) || 4)) *
          Number(pose.headSwingDeg) *
          Math.PI) /
        180;
    }
    ctx.rotate(headTilt);
    this.drawHeadAndHat(ctx, skin);
    ctx.restore();

    // 6. Front Arm + Active Tool
    ctx.save();
    ctx.translate(5, -50);
    this.drawFrontArmWithTool(ctx, skin, bObj);
    ctx.restore();

    ctx.restore();
  }

  drawVehicleWithCharacter(ctx, bObj = {}) {
    const skin = this.getActiveCharacterStyle();
    const customVehicle =
      (Array.isArray(bObj.vehicleDrawables) && bObj.vehicleDrawables.length > 0 && bObj.vehicleDrawables) ||
      (Array.isArray(skin.vehicleDrawables) && skin.vehicleDrawables.length > 0 && skin.vehicleDrawables) ||
      null;

    // 1. If JSON defines custom `vehicleDrawables`, render them with seated character!
    if (customVehicle) {
      const isHover = bObj.movementType === 'hover';
      const bob = isHover
        ? Math.sin(this.time * 5) * 6 - 8
        : Math.sin(this.time * 16) * 1.8;

      ctx.save();
      ctx.translate(0, bob);

      // Seated character riding the custom vehicle
      const seatX = bObj.seatOffsetX !== undefined ? Number(bObj.seatOffsetX) : -8;
      const seatY = bObj.seatOffsetY !== undefined ? Number(bObj.seatOffsetY) : -36;
      ctx.save();
      ctx.translate(seatX, seatY);
      this.drawTorso(ctx, skin);
      ctx.fillStyle = skin.pants || '#263238';
      ctx.fillRect(0, -24, 15, 8);
      ctx.fillStyle = skin.boots || '#3E2723';
      ctx.fillRect(10, -18, 8, 11);
      ctx.save();
      ctx.translate(0, -60);
      this.drawHeadAndHat(ctx, skin);
      ctx.restore();
      ctx.save();
      ctx.translate(4, -48);
      ctx.rotate(-0.45);
      this.drawArm(ctx, skin, false);
      if (Array.isArray(bObj.toolDrawables)) {
        ctx.save();
        ctx.translate(0, 17);
        this.drawDrawableList(ctx, bObj.toolDrawables);
        ctx.restore();
      }
      ctx.restore();
      ctx.restore();

      // Custom declarative vehicle drawables (can include spinning wheels, wings, thrusters via `anim`)
      this.drawDrawableList(ctx, customVehicle);

      ctx.restore();
      return;
    }

    // 2. Built-in vehicle styles fallback
    const vStyle = skin.vehicleStyle || 'tractor';
    const chug = Math.sin(this.time * 18) * 1.8;
    const wheelRot = this.time * 7;

    if (vStyle === 'magic-broom') {
      const hoverY = Math.sin(this.time * 5) * 6 - 10;
      ctx.save();
      ctx.translate(0, hoverY);

      ctx.strokeStyle = skin.vehicleBody || '#6D4C41';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-42, -22);
      ctx.quadraticCurveTo(0, -28, 42, -32);
      ctx.stroke();

      ctx.fillStyle = skin.vehicleTrim || '#FFD54F';
      ctx.beginPath();
      ctx.moveTo(-38, -22);
      ctx.lineTo(-64, -34);
      ctx.lineTo(-60, -10);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(-4, -22);
      this.drawTorso(ctx, skin);
      ctx.fillStyle = skin.pants;
      ctx.fillRect(0, -24, 14, 8);
      ctx.fillStyle = skin.boots;
      ctx.fillRect(10, -18, 8, 11);
      ctx.save();
      ctx.translate(0, -60);
      this.drawHeadAndHat(ctx, skin);
      ctx.restore();
      ctx.save();
      ctx.translate(4, -48);
      ctx.rotate(-0.4);
      this.drawArm(ctx, skin, false);
      ctx.restore();
      ctx.restore();

      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(0, chug);

    ctx.save();
    ctx.translate(-12, -46);
    this.drawTorso(ctx, skin);
    ctx.fillStyle = skin.pants;
    ctx.fillRect(0, -26, 16, 8);
    ctx.fillStyle = skin.boots;
    ctx.fillRect(10, -20, 8, 12);
    ctx.save();
    ctx.translate(0, -60);
    this.drawHeadAndHat(ctx, skin);
    ctx.restore();
    ctx.save();
    ctx.translate(4, -48);
    ctx.rotate(-0.45);
    this.drawArm(ctx, skin, false);
    ctx.restore();
    ctx.restore();

    ctx.fillStyle = skin.vehicleBody || '#D32F2F';
    ctx.strokeStyle = skin.vehicleTrim || '#FFCA28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (vStyle === 'hover-bike') {
      ctx.moveTo(-38, -32);
      ctx.lineTo(44, -42);
      ctx.lineTo(32, -20);
      ctx.lineTo(-34, -20);
      ctx.closePath();
    } else if (vStyle === 'scooter') {
      ctx.roundRect(-30, -40, 58, 20, 10);
    } else {
      ctx.roundRect(-34, -56, 72, 30, 8);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = skin.vehicleTrim || '#FFCA28';
    ctx.fillRect(-28, -48, 58, 4);

    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(38, -44, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 245, 157, 0.25)';
    ctx.beginPath();
    ctx.moveTo(41, -47);
    ctx.lineTo(74, -60);
    ctx.lineTo(74, -28);
    ctx.closePath();
    ctx.fill();

    if (vStyle === 'tractor') {
      ctx.fillStyle = '#37474F';
      ctx.fillRect(20, -82, 6, 26);
      ctx.fillRect(18, -85, 10, 4);
    }

    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -52);
    ctx.lineTo(2, -68);
    ctx.stroke();

    ctx.restore();

    const rearR = vStyle === 'tractor' ? 22 : 15;
    const frontR = 14;
    this.drawVehicleWheel(ctx, -20, -rearR, rearR, wheelRot, skin);
    this.drawVehicleWheel(ctx, 26, -frontR, frontR, wheelRot * 1.4, skin);
  }

  drawVehicleWheel(ctx, x, y, radius, angle, skin) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = skin.vehicleWheel || '#263238';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#11171A';
    const treads = 8;
    for (let i = 0; i < treads; i++) {
      const a = (i * Math.PI * 2) / treads;
      ctx.save();
      ctx.rotate(a);
      ctx.fillRect(-3, -radius - 2, 6, 4);
      ctx.restore();
    }

    ctx.fillStyle = skin.vehicleRim || '#FBC02D';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skin.vehicleBody || '#D32F2F';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawTorso(ctx, skin) {
    if (skin.replaceTorso && Array.isArray(skin.torsoDrawables)) {
      this.drawDrawableList(ctx, skin.torsoDrawables);
      return;
    }

    ctx.fillStyle = skin.shirt;
    ctx.beginPath();
    ctx.roundRect(-13, -58, 26, 35, 7);
    ctx.fill();

    ctx.fillStyle = skin.overalls;
    ctx.beginPath();
    ctx.roundRect(-12, -44, 24, 21, 5);
    ctx.fill();
    ctx.fillRect(-10, -57, 5, 15);
    ctx.fillRect(5, -57, 5, 15);

    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(-7.5, -43, 2, 0, Math.PI * 2);
    ctx.arc(7.5, -43, 2, 0, Math.PI * 2);
    ctx.fill();

    if (skin.kamarBelt) {
      for (let bx = -13; bx < 13; bx += 5) {
        ctx.fillStyle = Math.floor((bx + 13) / 5) % 2 === 0 ? '#D32F2F' : '#FFFFFF';
        ctx.fillRect(bx, -31, 5, 6);
      }
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(7, -27, 5, 8);
    }

    if (Array.isArray(skin.torsoDrawables) && skin.torsoDrawables.length > 0) {
      this.drawDrawableList(ctx, skin.torsoDrawables);
    }
  }

  drawLeg(ctx, skin, isBack) {
    if (Array.isArray(skin.legDrawables) && skin.legDrawables.length > 0) {
      this.drawDrawableList(ctx, skin.legDrawables);
      return;
    }

    ctx.fillStyle = isBack ? '#1F2D3A' : skin.pants;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 15, 4);
    ctx.fill();

    ctx.fillStyle = skin.boots;
    ctx.beginPath();
    ctx.roundRect(-5, 12, 13, 11, 4);
    ctx.fill();
  }

  drawArm(ctx, skin, isBack) {
    if (Array.isArray(skin.armDrawables) && skin.armDrawables.length > 0) {
      this.drawDrawableList(ctx, skin.armDrawables);
      return;
    }

    ctx.fillStyle = isBack ? skin.shirtSleeve : skin.shirt;
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 14, 4);
    ctx.fill();

    ctx.fillStyle = skin.skinTone;
    ctx.beginPath();
    ctx.arc(0, 17, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHeadAndHat(ctx, skin) {
    if (skin.replaceHead && Array.isArray(skin.headDrawables)) {
      this.drawDrawableList(ctx, skin.headDrawables);
      return;
    }

    const hatStyle = skin.hatStyle || 'straw-hat';

    ctx.fillStyle = skin.skinTone;
    ctx.fillRect(-4, -5, 8, 8);

    ctx.fillStyle = skin.skinTone;
    ctx.beginPath();
    ctx.arc(0, -16, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skin.cheek;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(-6, -13, 3.2, 0, Math.PI * 2);
    ctx.arc(9, -13, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    if (skin.sunglasses) {
      ctx.fillStyle = '#111';
      ctx.fillRect(-5, -20, 8, 5);
      ctx.fillRect(5, -20, 8, 5);
      ctx.strokeStyle = skin.hatBand || '#FFD54F';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -20, 8, 5);
      ctx.strokeRect(5, -20, 8, 5);
    } else {
      const blink = Math.sin(this.time * 1.7) > 0.97;
      ctx.fillStyle = '#212121';
      if (blink) {
        ctx.fillRect(-3, -18, 4, 1.5);
        ctx.fillRect(6, -18, 4, 1.5);
      } else {
        ctx.beginPath();
        ctx.arc(-1, -18, 2.3, 0, Math.PI * 2);
        ctx.arc(8, -18, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-1.6, -18.8, 0.9, 0, Math.PI * 2);
        ctx.arc(7.4, -18.8, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (skin.mustache) {
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(3, -11);
      ctx.quadraticCurveTo(0, -12, -3, -9);
      ctx.moveTo(3, -11);
      ctx.quadraticCurveTo(7, -12, 10, -9);
      ctx.stroke();
    }

    ctx.strokeStyle = '#6D3228';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.isAlerting) {
      ctx.fillStyle = '#C62828';
      ctx.arc(3.5, -9, 4, 0, Math.PI);
      ctx.fill();
    } else {
      ctx.arc(3.5, -10, 3.8, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }

    if (Array.isArray(skin.headDrawables) && skin.headDrawables.length > 0) {
      this.drawDrawableList(ctx, skin.headDrawables);
    }

    ctx.save();
    ctx.translate(0, -27);

    // 1. If JSON defines custom `hatDrawables`, draw them instead of fixed hat styles!
    if (Array.isArray(skin.hatDrawables) && skin.hatDrawables.length > 0) {
      this.drawDrawableList(ctx, skin.hatDrawables);
    } else if (hatStyle === 'none') {
      // No preset hat
    } else if (hatStyle === 'chef-hat') {
      ctx.fillStyle = skin.hatMain || '#FFFFFF';
      ctx.strokeStyle = skin.hatDark || '#CFD8DC';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-13, -10, 26, 10);
      ctx.beginPath();
      ctx.arc(-8, -14, 9, 0, Math.PI * 2);
      ctx.arc(0, -17, 10, 0, Math.PI * 2);
      ctx.arc(8, -14, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = skin.hatBand || '#E53935';
      ctx.fillRect(-13, -3, 26, 3);
    } else if (hatStyle === 'wizard-hat') {
      ctx.fillStyle = skin.hatMain || '#4A148C';
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-3, -28);
      ctx.lineTo(8, -24);
      ctx.lineTo(16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = skin.hatBand || '#FFD54F';
      ctx.fillRect(-14, -4, 28, 4);
      ctx.fillStyle = skin.hatMain || '#4A148C';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatStyle === 'samurai-helm') {
      ctx.fillStyle = skin.hatMain || '#263238';
      ctx.beginPath();
      ctx.arc(0, 2, 16, Math.PI, 0);
      ctx.lineTo(20, 8);
      ctx.lineTo(-20, 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = skin.hatBand || '#00E5FF';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-12, -18);
      ctx.moveTo(0, -6);
      ctx.lineTo(12, -18);
      ctx.stroke();
    } else if (hatStyle === 'headphones') {
      ctx.strokeStyle = skin.hatDark || '#1E293B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 10, 16, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = skin.hatMain || '#00E5FF';
      ctx.beginPath();
      ctx.roundRect(-18, 4, 6, 13, 3);
      ctx.roundRect(12, 4, 6, 13, 3);
      ctx.fill();
    } else if (hatStyle === 'crown') {
      ctx.fillStyle = skin.hatMain || '#FFD54F';
      ctx.strokeStyle = skin.hatDark || '#F57F17';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.lineTo(-15, -14);
      ctx.lineTo(-6, -6);
      ctx.lineTo(0, -16);
      ctx.lineTo(6, -6);
      ctx.lineTo(15, -14);
      ctx.lineTo(13, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (hatStyle === 'cap') {
      ctx.fillStyle = skin.hatMain;
      ctx.beginPath();
      ctx.arc(0, 0, 14, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = skin.hatDark;
      ctx.fillRect(0, -3, 24, 4);
    } else {
      ctx.fillStyle = skin.hatMain;
      ctx.beginPath();
      ctx.arc(0, 0, 14, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = skin.hatDark;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.lineTo(10, -6);
      ctx.moveTo(-7, -10);
      ctx.lineTo(7, -10);
      ctx.stroke();
      ctx.fillStyle = skin.hatBand;
      ctx.fillRect(-14, -4, 28, 4);
      ctx.fillStyle = skin.hatMain;
      ctx.strokeStyle = skin.hatDark;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 25, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (Array.isArray(skin.customHeadShapes) && skin.customHeadShapes.length > 0) {
      this.drawDrawableList(ctx, skin.customHeadShapes);
    }

    ctx.restore();
  }

  drawFrontArmWithTool(ctx, skin, bObj) {
    const pose = bObj.pose || {};
    const customTool = bObj.toolDrawables || bObj.customToolShapes;

    // 1. Declarative Custom Tool Drawables + Configurable Arm Pose!
    if (Array.isArray(customTool) && customTool.length > 0) {
      const baseRad =
        pose.frontArmBaseDeg !== undefined
          ? (Number(pose.frontArmBaseDeg) * Math.PI) / 180
          : -0.35;
      const swingRad =
        pose.frontArmSwingDeg !== undefined
          ? (Number(pose.frontArmSwingDeg) * Math.PI) / 180
          : 0.55;
      const swingSpeed = Number(pose.frontArmSwingSpeed) || 7.5;
      const armRot = baseRad + Math.sin(this.time * swingSpeed) * swingRad;

      ctx.rotate(armRot);
      this.drawArm(ctx, skin, false);
      ctx.save();
      ctx.translate(0, 17);
      this.drawDrawableList(ctx, customTool);
      ctx.restore();
      return;
    }

    // 2. Fallback preset tool types
    const tType = bObj.toolType || bObj.id;

    if (tType === 'machete' || tType === 'katana') {
      const swing = Math.sin(this.time * 8) * 0.75 - 0.3;
      ctx.rotate(swing);
      this.drawArm(ctx, skin, false);

      ctx.save();
      ctx.translate(0, 17);
      ctx.rotate(0.4);
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-2, -3, 9, 5);
      ctx.fillStyle = tType === 'katana' ? '#00E5FF' : '#ECEFF1';
      ctx.strokeStyle = '#90A4AE';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(7, -3);
      ctx.lineTo(34, -7);
      ctx.quadraticCurveTo(38, 0, 31, 4);
      ctx.lineTo(7, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (tType === 'wand') {
      const swing = Math.sin(this.time * 7) * 0.55 - 0.35;
      ctx.rotate(swing);
      this.drawArm(ctx, skin, false);
      ctx.save();
      ctx.translate(0, 17);
      ctx.strokeStyle = '#6D4C41';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, -10);
      ctx.stroke();
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(25, -11, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (tType === 'watering-can') {
      const tilt = -0.55 + Math.sin(this.time * 4) * 0.08;
      ctx.rotate(tilt);
      this.drawArm(ctx, skin, false);

      ctx.save();
      ctx.translate(4, 18);
      ctx.rotate(0.5);
      ctx.strokeStyle = '#1E88E5';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-2, -6, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#29B6F6';
      ctx.strokeStyle = '#0277BD';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-6, -6, 20, 16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#29B6F6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(13, 2);
      ctx.lineTo(26, -6);
      ctx.stroke();
      ctx.fillStyle = '#FFCA28';
      ctx.beginPath();
      ctx.ellipse(27, -7, 3, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (tType === 'shovel') {
      const digAngle = -0.4 + Math.sin(this.time * 7) * 0.45;
      ctx.rotate(digAngle);
      this.drawArm(ctx, skin, false);

      ctx.save();
      ctx.translate(0, 17);
      ctx.rotate(0.3);
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(22, 12);
      ctx.stroke();
      ctx.fillStyle = '#78909C';
      ctx.beginPath();
      ctx.moveTo(19, 7);
      ctx.lineTo(31, 14);
      ctx.lineTo(25, 21);
      ctx.lineTo(16, 13);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (tType === 'sickle-pole') {
      const sliceMotion = Math.sin(this.time * 5.6) * 0.14;
      ctx.rotate(-0.95 + sliceMotion);
      this.drawArm(ctx, skin, false);

      ctx.save();
      ctx.translate(2, 16);
      ctx.strokeStyle = '#B0BEC5';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-8, 12);
      ctx.lineTo(68, -42);
      ctx.stroke();
      ctx.strokeStyle = '#ECEFF1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(68, -46, 11, -0.8, 1.5);
      ctx.stroke();
      ctx.restore();
    } else if (tType === 'sack-throw') {
      const throwSwing = Math.sin(this.time * 6.5) * 0.85 - 0.4;
      ctx.rotate(throwSwing);
      this.drawArm(ctx, skin, false);
    } else if (tType === 'hammer') {
      const hammerSwing = Math.sin(this.time * 10) * 0.65 - 0.4;
      ctx.rotate(hammerSwing);
      this.drawArm(ctx, skin, false);

      ctx.save();
      ctx.translate(0, 17);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(0, -2, 18, 4);
      ctx.fillStyle = '#546E7A';
      ctx.fillRect(15, -8, 7, 16);
      ctx.restore();
    } else {
      ctx.rotate(Math.sin(this.time * 7.5) * 0.4);
      this.drawArm(ctx, skin, false);
    }
  }

  drawParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1.8 - alpha * 0.8), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'grass' || p.type === 'rect') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle || 0) + p.life * 5);
        ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8);
        ctx.restore();
      } else if (p.type === 'star') {
        ctx.save();
        ctx.translate(p.x, p.y);
        this.drawDrawableList(ctx, [{ type: 'star', outerR: p.r * 1.4, innerR: p.r * 0.6, fill: p.color }]);
        ctx.restore();
      } else if (p.type === 'heart') {
        ctx.save();
        ctx.translate(p.x, p.y);
        this.drawDrawableList(ctx, [{ type: 'heart', size: p.r * 1.8, fill: p.color }]);
        ctx.restore();
      } else if (p.type === 'note' || p.type === 'text') {
        ctx.font = `bold ${Math.round(p.r * 3.2)}px "Segoe UI", sans-serif`;
        ctx.fillText(p.type === 'note' ? '♪' : p.text || '✨', p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawBehaviorMiniTag(ctx, groundY, bObj) {
    if (!bObj) return;
    const text = this.formatBilingual(bObj.labelTh, bObj.labelEn);
    const label = `${bObj.icon || '✨'} ${text}`;

    ctx.save();
    ctx.font = '600 11px "Segoe UI", Tahoma, sans-serif';
    const textW = ctx.measureText(label).width;
    const pillW = textW + 18;
    const pillH = 20;
    const px = Math.max(8, Math.min(this.canvas.width - pillW - 8, this.x - pillW / 2));
    const py = groundY - 4;

    ctx.fillStyle = 'rgba(18, 28, 22, 0.85)';
    ctx.strokeStyle = this.isAlerting
      ? '#FFCA28'
      : this.isOvertime
        ? '#FF7043'
        : 'rgba(129, 199, 132, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(px, py - pillH + 10, pillW, pillH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E8F5E9';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, px + 9, py + 1);
    ctx.restore();
  }
}

window.FarmerEngine = FarmerEngine;
window.FARMER_SKINS = SKINS;
window.BUILTIN_THEME_SETS = BUILTIN_THEME_SETS;
