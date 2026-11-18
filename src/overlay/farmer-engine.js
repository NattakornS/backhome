/**
 * 2D Cartoon Farmer Animation Engine (60 FPS HTML5 Canvas)
 * Supports 7 farming behaviors + 4 character skins + patrol walking + particle effects
 */

const SKINS = {
  'thai-kamar': {
    name: 'Uncle Somchai (ลุงสมชาย)',
    skinTone: '#F1C29B',
    cheek: '#E88B78',
    hatMain: '#E5B95C',
    hatDark: '#C49438',
    hatBand: '#C93B2B',
    shirt: '#284B7A', // Mo Hom indigo
    shirtSleeve: '#1E3A61',
    overalls: '#1D3354',
    kamarBelt: true, // Red/white checkered pha khao ma
    pants: '#34495E',
    boots: '#2C3E28',
    sunglasses: false,
    mustache: true
  },
  'classic-overalls': {
    name: 'Sunny McFarm',
    skinTone: '#FAD2B8',
    cheek: '#F28B82',
    hatMain: '#F4CE6A',
    hatDark: '#D4A843',
    hatBand: '#D94336',
    shirt: '#D94E41', // Red plaid style
    shirtSleeve: '#B83B30',
    overalls: '#2E6F9E', // Denim blue overalls
    kamarBelt: false,
    pants: '#255A82',
    boots: '#6E4726',
    sunglasses: false,
    mustache: false
  },
  'modern-rancher': {
    name: 'Ranger Khao',
    skinTone: '#E8B48A',
    cheek: '#E07A68',
    hatMain: '#2E7D32',
    hatDark: '#1B5E20',
    hatBand: '#FBC02D',
    shirt: '#689F38',
    shirtSleeve: '#558B2F',
    overalls: '#8D6E63', // Khaki field vest
    kamarBelt: false,
    pants: '#4E342E',
    boots: '#F57F17',
    sunglasses: false,
    mustache: false
  },
  'golden-palm': {
    name: 'Boss Palm (เถ้าแก่สวนปาล์ม)',
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

const BEHAVIORS_LIST = [
  'tractor',
  'machete',
  'water',
  'plant',
  'palm',
  'fertilizer',
  'fix'
];

const BEHAVIOR_META = {
  tractor: { icon: '🚜', label: 'Driving Tractor (ขับรถไถ)', th: 'กำลังขับรถไถกลับบ้าน!' },
  machete: { icon: '🔪', label: 'Swinging Machete (ดายหญ้า)', th: 'ฟันหญ้าเคลียร์ทาง!' },
  water: { icon: '🚿', label: 'Pouring Water (รดน้ำต้นไม้)', th: 'รดน้ำต้นไม้ให้สดชื่น!' },
  plant: { icon: '🌱', label: 'Planting Tree (ปลูกต้นไม้)', th: 'ปลูกต้นไม้เพิ่มร่มเงา!' },
  palm: { icon: '🌴', label: 'Harvesting Oil Palm (แทงปาล์ม)', th: 'แทงปาล์มสุกทะลายใหญ่!' },
  fertilizer: { icon: '🌾', label: 'Spreading Fertilizer (หว่านปุ๋ย)', th: 'หว่านปุ๋ยบำรุงดิน!' },
  fix: { icon: '🔧', label: 'Fixing Farm Gear (ซ่อมเครื่องมือ)', th: 'ซ่อมรั้วซ่อมเครื่องมือ!' }
};

class FarmerEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isPreview = Boolean(options.isPreview);

    // State
    this.skinId = options.skinId || 'thai-kamar';
    this.behaviorMode = options.behavior || 'cycle'; // 'cycle' or one of BEHAVIORS_LIST
    this.currentBehavior = this.behaviorMode === 'cycle' ? 'tractor' : this.behaviorMode;
    this.isAlerting = Boolean(options.isAlerting);
    this.walkSpeed = Number(options.walkSpeed) || 1.0;
    this.cycleIntervalSec = Number(options.cycleIntervalSec) || 14;

    // Position & physics inside canvas
    this.x = canvas.width * 0.5;
    this.direction = -1; // -1 walking left, +1 walking right
    this.time = 0;
    this.lastFrameTime = performance.now();
    this.lastCycleSwitch = performance.now();
    this.particles = [];
    this.props = []; // Grass tufts, saplings, palm bunches, sparks

    this.onBehaviorChange = options.onBehaviorChange || null;
    this._running = false;
  }

  setConfig(cfg) {
    if (cfg.characterSkin && SKINS[cfg.characterSkin]) {
      this.skinId = cfg.characterSkin;
    }
    if (cfg.walkSpeed !== undefined) {
      this.walkSpeed = Number(cfg.walkSpeed) || 1.0;
    }
    if (cfg.cycleIntervalSec !== undefined) {
      this.cycleIntervalSec = Math.max(5, Number(cfg.cycleIntervalSec) || 14);
    }
    const targetMode = this.isAlerting
      ? (cfg.alertBehavior || cfg.idleBehavior || 'cycle')
      : (cfg.idleBehavior || 'cycle');
    this.setBehaviorMode(targetMode);
  }

  setBehaviorMode(mode) {
    this.behaviorMode = mode;
    if (mode !== 'cycle' && BEHAVIORS_LIST.includes(mode)) {
      if (this.currentBehavior !== mode) {
        this.currentBehavior = mode;
        this.particles = [];
        if (this.onBehaviorChange) this.onBehaviorChange(this.currentBehavior, BEHAVIOR_META[this.currentBehavior]);
      }
    }
  }

  setAlerting(alerting) {
    this.isAlerting = Boolean(alerting);
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
      x: this.x - 75,
      y: groundY - 155,
      width: 150,
      height: 155
    };
  }

  update(dt, now) {
    const speedMultiplier = (this.isAlerting ? 1.35 : 1.0) * this.walkSpeed;
    this.time += dt * speedMultiplier;

    // Cycle behavior if in 'cycle' mode
    if (this.behaviorMode === 'cycle') {
      if (now - this.lastCycleSwitch > this.cycleIntervalSec * 1000) {
        this.lastCycleSwitch = now;
        const idx = BEHAVIORS_LIST.indexOf(this.currentBehavior);
        this.currentBehavior = BEHAVIORS_LIST[(idx + 1) % BEHAVIORS_LIST.length];
        this.particles = [];
        if (this.onBehaviorChange) {
          this.onBehaviorChange(this.currentBehavior, BEHAVIOR_META[this.currentBehavior]);
        }
      }
    }

    // Horizontal patrol movement depending on behavior
    const margin = this.isPreview ? 75 : 88;
    const minX = margin;
    const maxX = Math.max(margin + 20, this.canvas.width - margin);

    // Behaviors that walk continuously vs stationary work with short steps
    let moveRate = 38;
    if (this.currentBehavior === 'tractor') moveRate = 62;
    else if (this.currentBehavior === 'machete' || this.currentBehavior === 'fertilizer') moveRate = 36;
    else if (this.currentBehavior === 'water') moveRate = 24;
    else if (this.currentBehavior === 'plant' || this.currentBehavior === 'palm' || this.currentBehavior === 'fix') {
      // Slow patrol pause during action beat
      const cyclePhase = (this.time % 4.0);
      moveRate = cyclePhase < 1.1 ? 34 : 0;
    }

    if (this.isPreview) {
      // Gentle patrol in preview box
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

    // Spawn behavior-specific particles
    this.spawnParticles(dt);

    // Update particles
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
      if (p. groundY && p.y > p.groundY) {
        p.y = p.groundY;
        p.vy = -Math.abs(p.vy) * 0.45;
        p.vx *= 0.7;
      }
    }
  }

  spawnParticles(dt) {
    const groundY = this.canvas.height - 14;
    const dir = this.direction;

    if (this.currentBehavior === 'tractor') {
      // Exhaust smoke puffs
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
          color: this.isAlerting ? '#FFE082' : '#CFD8DC'
        });
      }
    } else if (this.currentBehavior === 'machete') {
      // Slash grass clippings on swing downbeat
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
          color: Math.random() > 0.4 ? '#66BB6A' : '#9CCC65'
        });
      }
    } else if (this.currentBehavior === 'water') {
      // Water droplets from watering can spout
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
          color: '#4FC3F7'
        });
      }
    } else if (this.currentBehavior === 'fertilizer') {
      // Fertilizer granules tossed in an arc
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
          color: Math.random() > 0.3 ? '#FFF176' : '#FF8A65'
        });
      }
    } else if (this.currentBehavior === 'fix') {
      // Sparks when hammer hits
      const hit = Math.sin(this.time * 10);
      if (hit > 0.8 && Math.random() < dt * 28) {
        this.particles.push({
          type: 'spark',
          x: this.x + dir * 38,
          y: groundY - 28,
          vx: (Math.random() - 0.5) * 90,
          vy: -50 - Math.random() * 65,
          gravity: 210,
          groundY,
          r: 3,
          life: 0.45,
          maxLife: 0.45,
          color: Math.random() > 0.5 ? '#FFD54F' : '#FF7043'
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

    // 1. Subtle grassy ground strip at the bottom of the overlay (sits right on top of taskbar)
    this.drawGroundStrip(ctx, w, groundY);

    // 2. Render background props for current behavior (palm tree, saplings, fence)
    this.drawBehaviorBackgroundProps(ctx, groundY);

    // 3. Render the Farmer (or Tractor + Farmer)
    ctx.save();
    ctx.translate(this.x, groundY);
    // Default character drawings face RIGHT (+1); flip horizontally if walking LEFT (-1)
    ctx.scale(this.direction, 1);

    if (this.currentBehavior === 'tractor') {
      this.drawTractorWithFarmer(ctx);
    } else {
      this.drawWalkingFarmer(ctx);
    }
    ctx.restore();

    // 4. Render foreground particles (smoke, water drops, grass clippings, fertilizer, sparks)
    this.drawParticles(ctx);

    // 5. Floating status mini-pill right below the farmer's feet
    this.drawBehaviorMiniTag(ctx, groundY);
  }

  drawGroundStrip(ctx, w, groundY) {
    ctx.save();
    // Soft shadow patch under the farmer
    const grad = ctx.createRadialGradient(this.x, groundY + 2, 6, this.x, groundY + 2, 68);
    grad.addColorStop(0, 'rgba(20, 40, 20, 0.45)');
    grad.addColorStop(1, 'rgba(20, 40, 20, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(this.x, groundY + 2, 68, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Decorative grass tufts along patrol area
    const tuftCount = Math.floor(w / 55);
    for (let i = 1; i < tuftCount; i++) {
      const tx = i * 55 + Math.sin(i * 3) * 12;
      const sway = Math.sin(this.time * 2.5 + i) * 2;
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, groundY + 2);
      ctx.quadraticCurveTo(tx - 4 + sway, groundY - 6, tx - 6 + sway, groundY - 9);
      ctx.moveTo(tx, groundY + 2);
      ctx.quadraticCurveTo(tx + 3 + sway, groundY - 7, tx + 5 + sway, groundY - 11);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBehaviorBackgroundProps(ctx, groundY) {
    const dir = this.direction;
    ctx.save();

    if (this.currentBehavior === 'water') {
      // Draw lush sprouts / flowers being watered ahead of the farmer
      const plantX = this.x + dir * 64;
      const growScale = 0.85 + 0.2 * Math.sin(this.time * 4);
      ctx.save();
      ctx.translate(plantX, groundY);
      ctx.scale(growScale, growScale);
      // Soil mound
      ctx.fillStyle = '#6D4C41';
      ctx.beginPath();
      ctx.arc(0, 0, 14, Math.PI, 0);
      ctx.fill();
      // Stem & leaves
      ctx.strokeStyle = '#43A047';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.quadraticCurveTo(4, -18, 0, -32);
      ctx.stroke();
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.ellipse(-9, -18, 9, 5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(9, -22, 9, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      // Blooming yellow flower
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
    } else if (this.currentBehavior === 'plant') {
      // Sapling growing in phases (0..4 sec cycle)
      const phase = (this.time % 4.0) / 4.0;
      const saplingX = this.x + dir * 44;
      ctx.save();
      ctx.translate(saplingX, groundY);
      // Rich soil mound
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 8, 0, Math.PI, 0);
      ctx.fill();

      // Tree grows taller as phase progresses
      const treeScale = Math.min(1.15, Math.max(0.25, phase * 1.35));
      ctx.scale(treeScale, treeScale);
      // Trunk
      ctx.fillStyle = '#795548';
      ctx.fillRect(-3.5, -34, 7, 34);
      // Canopy
      ctx.fillStyle = '#43A047';
      ctx.beginPath();
      ctx.arc(0, -44, 16, 0, Math.PI * 2);
      ctx.arc(-11, -36, 12, 0, Math.PI * 2);
      ctx.arc(11, -36, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#81C784';
      ctx.beginPath();
      ctx.arc(-4, -48, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.currentBehavior === 'palm') {
      // Oil Palm Tree (ต้นปาล์มน้ำมัน) ahead of the farmer
      const palmX = this.x + dir * 56;
      ctx.save();
      ctx.translate(palmX, groundY);

      // Textured oil palm trunk
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.moveTo(-11, 0);
      ctx.lineTo(-7, -112);
      ctx.lineTo(7, -112);
      ctx.lineTo(11, 0);
      ctx.closePath();
      ctx.fill();

      // Criss-cross palm bark pattern
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

      // Lush palm fronds radiating from crown (-112)
      const fronds = [-2.4, -1.9, -1.4, -0.5, 0.4, 1.3, 1.9, 2.4];
      fronds.forEach((angle, idx) => {
        ctx.save();
        ctx.translate(0, -112);
        const sway = Math.sin(this.time * 2 + idx) * 0.04;
        ctx.rotate(angle + sway);
        ctx.strokeStyle = idx % 2 === 0 ? '#2E7D32' : '#43A047';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(22, -10, 46, 6);
        ctx.stroke();
        // Leaflets
        for (let lx = 8; lx <= 44; lx += 6) {
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(lx, -2);
          ctx.lineTo(lx + 3, 9);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Ripe red-orange Oil Palm Fruit Bunch (ทะลายปาล์มสุก) dropping when sickle slices!
      const cutCycle = (this.time * 1.4) % 2.5;
      let bunchY = -102;
      let bunchX = -dir * 8;
      if (cutCycle > 1.2) {
        // Falling and bouncing on the ground
        const fallT = Math.min(1, (cutCycle - 1.2) / 0.6);
        const bounce = fallT >= 1 ? Math.abs(Math.sin((cutCycle - 1.8) * 8)) * 8 : 0;
        bunchY = -102 + fallT * 92 - bounce;
        bunchX = -dir * 14;
      }

      // Draw the palm fruit bunch
      ctx.save();
      ctx.translate(bunchX, bunchY);
      ctx.fillStyle = '#D84315';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      // Individual glossy palm fruitlets
      const dots = [
        [-4, -4], [4, -4], [0, 0], [-5, 3], [5, 3], [0, 6], [-2, -7], [3, -7]
      ];
      dots.forEach(([dx, dy], i) => {
        ctx.fillStyle = i % 2 === 0 ? '#FF6D00' : '#FFAB00';
        ctx.beginPath();
        ctx.arc(dx, dy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      ctx.restore();
    } else if (this.currentBehavior === 'fix') {
      // Wooden fence + broken farm pump being repaired ahead of the farmer
      const propX = this.x + dir * 42;
      const shake = Math.sin(this.time * 10) > 0.8 ? (Math.random() - 0.5) * 3 : 0;
      ctx.save();
      ctx.translate(propX + shake, groundY);

      // Wooden fence post
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(-16, -48, 9, 48);
      ctx.fillRect(10, -48, 9, 48);
      ctx.fillStyle = '#A1887F';
      ctx.fillRect(-22, -38, 46, 7);
      ctx.fillRect(-22, -22, 46, 7);

      // Red metal toolbox & gear
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(-12, -16, 24, 16);
      ctx.fillStyle = '#B71C1C';
      ctx.fillRect(-13, -18, 26, 4);
      ctx.strokeStyle = '#CFD8DC';
      ctx.lineWidth = 2;
      ctx.strokeRect(-5, -22, 10, 4);
      ctx.restore();
    } else if (this.currentBehavior === 'machete') {
      // Tall grass clump in front of farmer waiting to be slashed
      const grassX = this.x + dir * 42;
      ctx.save();
      ctx.translate(grassX, groundY);
      ctx.strokeStyle = '#388E3C';
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

  drawWalkingFarmer(ctx) {
    const skin = SKINS[this.skinId] || SKINS['thai-kamar'];
    const walkCycle = this.time * 7.5;
    const isMoving =
      this.currentBehavior === 'machete' ||
      this.currentBehavior === 'water' ||
      this.currentBehavior === 'fertilizer' ||
      (this.time % 4.0) < 1.1;

    const legSwing = isMoving ? Math.sin(walkCycle) * 0.48 : 0;
    const bob = isMoving ? Math.abs(Math.sin(walkCycle)) * 3.5 : Math.sin(this.time * 3) * 1.5;

    ctx.save();
    ctx.translate(0, -bob);

    // 1. Back Leg
    ctx.save();
    ctx.translate(-3, -24);
    ctx.rotate(-legSwing);
    this.drawLeg(ctx, skin, true);
    ctx.restore();

    // 2. Back Arm (holds secondary props like Fertilizer Sack)
    ctx.save();
    ctx.translate(-4, -52);
    if (this.currentBehavior === 'fertilizer') {
      ctx.rotate(0.25);
      this.drawArm(ctx, skin, true);
      // Fertilizer Sack (กระสอบปุ๋ย)
      ctx.fillStyle = '#FFF8E1';
      ctx.strokeStyle = '#D7CCC8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-14, 6, 22, 26, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2E7D32';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('NPK', -10, 22);
    } else {
      ctx.rotate(-legSwing * 0.8);
      this.drawArm(ctx, skin, true);
    }
    ctx.restore();

    // 3. Torso (Shirt + Overalls / Thai Kamar)
    this.drawTorso(ctx, skin);

    // 4. Front Leg
    ctx.save();
    ctx.translate(3, -24);
    ctx.rotate(legSwing);
    this.drawLeg(ctx, skin, false);
    ctx.restore();

    // 5. Head & Straw Hat
    ctx.save();
    ctx.translate(0, -60);
    const headTilt =
      this.currentBehavior === 'palm'
        ? -0.24 // Looking up at the palm crown!
        : this.currentBehavior === 'plant' || this.currentBehavior === 'fix'
        ? 0.15 // Looking down at work
        : Math.sin(this.time * 3) * 0.05;
    ctx.rotate(headTilt);
    this.drawHeadAndHat(ctx, skin);
    ctx.restore();

    // 6. Front Arm + Active Farming Tool!
    ctx.save();
    ctx.translate(5, -50);
    this.drawFrontArmWithTool(ctx, skin);
    ctx.restore();

    ctx.restore();
  }

  drawTractorWithFarmer(ctx) {
    const skin = SKINS[this.skinId] || SKINS['thai-kamar'];
    const chug = Math.sin(this.time * 18) * 1.8;
    const wheelRot = this.time * 7;

    ctx.save();
    ctx.translate(0, chug);

    // Seated Farmer on the tractor seat
    ctx.save();
    ctx.translate(-12, -46);
    this.drawTorso(ctx, skin);
    // Seated bent leg
    ctx.fillStyle = skin.pants;
    ctx.fillRect(0, -26, 16, 8);
    ctx.fillStyle = skin.boots;
    ctx.fillRect(10, -20, 8, 12);
    // Head
    ctx.save();
    ctx.translate(0, -60);
    this.drawHeadAndHat(ctx, skin);
    ctx.restore();
    // Arm holding steering wheel
    ctx.save();
    ctx.translate(4, -48);
    ctx.rotate(-0.45);
    this.drawArm(ctx, skin, false);
    ctx.restore();
    ctx.restore();

    // Tractor Chassis (Vibrant Farm Red + Golden Trim)
    ctx.fillStyle = '#D32F2F';
    ctx.strokeStyle = '#8E0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-34, -56, 72, 30, 8);
    ctx.fill();
    ctx.stroke();

    // Engine Grille stripes
    ctx.fillStyle = '#FFCA28';
    ctx.fillRect(-30, -49, 64, 5);
    ctx.fillStyle = '#263238';
    for (let gy = -42; gy <= -32; gy += 4) {
      ctx.fillRect(24, gy, 10, 2.5);
    }

    // Headlight + glowing beam
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(39, -46, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 245, 157, 0.28)';
    ctx.beginPath();
    ctx.moveTo(42, -49);
    ctx.lineTo(75, -62);
    ctx.lineTo(75, -30);
    ctx.closePath();
    ctx.fill();

    // Exhaust Pipe chimney
    ctx.fillStyle = '#37474F';
    ctx.fillRect(20, -82, 6, 26);
    ctx.fillRect(18, -85, 10, 4);

    // Steering Wheel
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -56);
    ctx.lineTo(2, -68);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -70, 8, 3, -0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Rear Fender
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.arc(-20, -24, 26, Math.PI, -0.2);
    ctx.lineTo(-20, -24);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Big Rear Wheel (drawn without chug offset so it stays planted on ground)
    this.drawTractorWheel(ctx, -20, -22, 22, wheelRot);
    // Smaller Front Wheel
    this.drawTractorWheel(ctx, 26, -14, 14, wheelRot * 1.4);
  }

  drawTractorWheel(ctx, x, y, radius, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Tire rubber
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Tire treads
    ctx.fillStyle = '#11171A';
    const treads = 8;
    for (let i = 0; i < treads; i++) {
      const a = (i * Math.PI * 2) / treads;
      ctx.save();
      ctx.rotate(a);
      ctx.fillRect(-3, -radius - 2, 6, 4);
      ctx.restore();
    }

    // Yellow rim
    ctx.fillStyle = '#FBC02D';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Lug bolts & hub
    ctx.fillStyle = '#D32F2F';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawTorso(ctx, skin) {
    // Shirt body
    ctx.fillStyle = skin.shirt;
    ctx.beginPath();
    ctx.roundRect(-13, -58, 26, 35, 7);
    ctx.fill();

    // Overalls or Vest
    ctx.fillStyle = skin.overalls;
    ctx.beginPath();
    ctx.roundRect(-12, -44, 24, 21, 5);
    ctx.fill();
    // Straps
    ctx.fillRect(-10, -57, 5, 15);
    ctx.fillRect(5, -57, 5, 15);

    // Brass buttons
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(-7.5, -43, 2, 0, Math.PI * 2);
    ctx.arc(7.5, -43, 2, 0, Math.PI * 2);
    ctx.fill();

    // Optional Thai Kamar (ผ้าขาวม้าคาดเอว) checkered belt!
    if (skin.kamarBelt) {
      for (let bx = -13; bx < 13; bx += 5) {
        ctx.fillStyle = (Math.floor((bx + 13) / 5) % 2 === 0) ? '#D32F2F' : '#FFFFFF';
        ctx.fillRect(bx, -31, 5, 6);
      }
      // Hanging sash knot on side
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(7, -27, 5, 8);
    }
  }

  drawLeg(ctx, skin, isBack) {
    ctx.fillStyle = isBack ? '#1F2D3A' : skin.pants;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 15, 4);
    ctx.fill();

    // Rubber farm boot
    ctx.fillStyle = skin.boots;
    ctx.beginPath();
    ctx.roundRect(-5, 12, 13, 11, 4);
    ctx.fill();
  }

  drawArm(ctx, skin, isBack) {
    ctx.fillStyle = isBack ? skin.shirtSleeve : skin.shirt;
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 14, 4);
    ctx.fill();

    // Forearm / Hand
    ctx.fillStyle = skin.skinTone;
    ctx.beginPath();
    ctx.arc(0, 17, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHeadAndHat(ctx, skin) {
    // Neck
    ctx.fillStyle = skin.skinTone;
    ctx.fillRect(-4, -5, 8, 8);

    // Head circle
    ctx.fillStyle = skin.skinTone;
    ctx.beginPath();
    ctx.arc(0, -16, 15, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle = skin.cheek;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(-6, -13, 3.2, 0, Math.PI * 2);
    ctx.arc(9, -13, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Eyes or Sunglasses
    if (skin.sunglasses) {
      ctx.fillStyle = '#111';
      ctx.fillRect(-5, -20, 8, 5);
      ctx.fillRect(5, -20, 8, 5);
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -20, 8, 5);
      ctx.strokeRect(5, -20, 8, 5);
    } else {
      // Expressive cartoon eyes
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
        // Eye shine
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-1.6, -18.8, 0.9, 0, Math.PI * 2);
        ctx.arc(7.4, -18.8, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Mustache (for Uncle Somchai / Boss Palm)
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

    // Cheerful smile
    ctx.strokeStyle = '#6D3228';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.isAlerting) {
      // Excited open mouth smile when 16:00 hits!
      ctx.fillStyle = '#C62828';
      ctx.arc(3.5, -9, 4, 0, Math.PI);
      ctx.fill();
    } else {
      ctx.arc(3.5, -10, 3.8, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }

    // Woven Straw Farmer Hat (งอบ / หมวกสานชาวสวน)
    ctx.save();
    ctx.translate(0, -27);

    // Hat dome
    ctx.fillStyle = skin.hatMain;
    ctx.beginPath();
    ctx.arc(0, 0, 14, Math.PI, 0);
    ctx.fill();

    // Hat weave cross-lines
    ctx.strokeStyle = skin.hatDark;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(10, -6);
    ctx.moveTo(-7, -10);
    ctx.lineTo(7, -10);
    ctx.stroke();

    // Ribbon band
    ctx.fillStyle = skin.hatBand;
    ctx.fillRect(-14, -4, 28, 4);

    // Wide sun-brim
    ctx.fillStyle = skin.hatMain;
    ctx.strokeStyle = skin.hatDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawFrontArmWithTool(ctx, skin) {
    const b = this.currentBehavior;

    if (b === 'machete') {
      // Swinging Machete (มีดพร้าดายหญ้า)
      const swing = Math.sin(this.time * 8) * 0.75 - 0.3;
      ctx.rotate(swing);
      this.drawArm(ctx, skin, false);

      // Wooden handle + gleaming steel machete blade
      ctx.save();
      ctx.translate(0, 17);
      ctx.rotate(0.4);
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-2, -3, 9, 5);
      ctx.fillStyle = '#ECEFF1';
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
    } else if (b === 'water') {
      // Holding Watering Can (บัวรดน้ำ)
      const tilt = -0.55 + Math.sin(this.time * 4) * 0.08;
      ctx.rotate(tilt);
      this.drawArm(ctx, skin, false);

      ctx.save();
      ctx.translate(4, 18);
      ctx.rotate(0.5);
      // Handle loop
      ctx.strokeStyle = '#1E88E5';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-2, -6, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Can body
      ctx.fillStyle = '#29B6F6';
      ctx.strokeStyle = '#0277BD';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-6, -6, 20, 16, 4);
      ctx.fill();
      ctx.stroke();
      // Spout & rose head
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
    } else if (b === 'plant') {
      // Digging with a garden trowel/shovel & patting soil
      const digAngle = -0.4 + Math.sin(this.time * 7) * 0.45;
      ctx.rotate(digAngle);
      this.drawArm(ctx, skin, false);

      ctx.save();
      ctx.translate(0, 17);
      ctx.rotate(0.3);
      // Shovel shaft
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(22, 12);
      ctx.stroke();
      // Spade blade
      ctx.fillStyle = '#78909C';
      ctx.beginPath();
      ctx.moveTo(19, 7);
      ctx.lineTo(31, 14);
      ctx.lineTo(25, 21);
      ctx.lineTo(16, 13);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (b === 'palm') {
      // Long Oil Palm Harvesting Sickle Pole (เคียวแทงปาล์มด้ามยาว)
      const sliceMotion = Math.sin(this.time * 5.6) * 0.14;
      ctx.rotate(-0.95 + sliceMotion);
      this.drawArm(ctx, skin, false);

      ctx.save();
      ctx.translate(2, 16);
      // Long aluminum/bamboo pole reaching up to the palm crown
      ctx.strokeStyle = '#B0BEC5';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-8, 12);
      ctx.lineTo(68, -42);
      ctx.stroke();

      // Curved Crescent Palm Sickle Blade (เคียวเหล็กกล้า) at tip
      ctx.strokeStyle = '#ECEFF1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(68, -46, 11, -0.8, 1.5);
      ctx.stroke();
      ctx.restore();
    } else if (b === 'fertilizer') {
      // Tossing fertilizer granules in wide sweeping arcs
      const throwSwing = Math.sin(this.time * 6.5) * 0.85 - 0.4;
      ctx.rotate(throwSwing);
      this.drawArm(ctx, skin, false);
    } else if (b === 'fix') {
      // Hammering / Wrenching with comic impact
      const hammerSwing = Math.sin(this.time * 10) * 0.65 - 0.4;
      ctx.rotate(hammerSwing);
      this.drawArm(ctx, skin, false);

      ctx.save();
      ctx.translate(0, 17);
      // Wooden hammer handle
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(0, -2, 18, 4);
      // Steel hammer head
      ctx.fillStyle = '#546E7A';
      ctx.fillRect(15, -8, 7, 16);
      ctx.restore();
    } else {
      // Default arm swing
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
      } else if (p.type === 'grass') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle + p.life * 5);
        ctx.fillRect(-5, -1.5, 10, 3);
        ctx.restore();
      } else if (p.type === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // water & fertilizer droplets
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawBehaviorMiniTag(ctx, groundY) {
    const meta = BEHAVIOR_META[this.currentBehavior];
    if (!meta) return;

    ctx.save();
    const label = `${meta.icon} ${meta.label}`;
    ctx.font = '600 11px "Segoe UI", Tahoma, sans-serif';
    const textW = ctx.measureText(label).width;
    const pillW = textW + 18;
    const pillH = 20;
    const px = Math.max(8, Math.min(this.canvas.width - pillW - 8, this.x - pillW / 2));
    const py = groundY - 4;

    ctx.fillStyle = 'rgba(18, 28, 22, 0.82)';
    ctx.strokeStyle = this.isAlerting ? '#FFCA28' : 'rgba(129, 199, 132, 0.55)';
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
window.FARMER_BEHAVIORS = BEHAVIOR_META;
