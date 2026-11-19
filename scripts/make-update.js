/**
 * Helper Script to Generate Update Files for Pomodoro Cartoon Companion
 * Usage:
 *   npm run make-update
 *   node scripts/make-update.js 1.3.0 "เพิ่มชุดธีมใหม่และปรับปรุงประสิทธิภาพ" "Added new theme sets and performance improvements"
 *
 * Generates inside ./updates/ :
 *   - updates/latest.json               (Universal Update Manifest for Local Folder / Web Server)
 *   - updates/latest.yml                (Standard electron-updater Manifest)
 *   - updates/update-bundle-v<ver>.json (Update payload with themes & release metadata)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

const targetVersion = process.argv[2] || '1.3.0';
const noteTh =
  process.argv[3] ||
  'เพิ่มระบบอัปเดตอัตโนมัติ (Electron Auto-Update) และรองรับการวางไฟล์อัปเดตในโฟลเดอร์ updates/ หรือ Web Server';
const noteEn =
  process.argv[4] ||
  'Added Electron Auto-Update system supporting local updates/ folder, shared LAN drive, or HTTP web server.';

const today = new Date().toISOString().slice(0, 10);
const updatesDir = path.join(rootDir, 'updates');
if (!fs.existsSync(updatesDir)) {
  fs.mkdirSync(updatesDir, { recursive: true });
}

// Collect all custom theme sets from ./themes/ to bundle into the update package
const themesDir = path.join(rootDir, 'themes');
const bundledThemes = {};
if (fs.existsSync(themesDir)) {
  const files = fs.readdirSync(themesDir).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(themesDir, file), 'utf-8'));
      if (data && data.id) {
        bundledThemes[data.id] = data;
      }
    } catch (e) {}
  }
}

const bundleFileName = `update-bundle-v${targetVersion}.json`;
const bundlePayload = {
  version: targetVersion,
  date: today,
  themes: bundledThemes
};

const bundleFilePath = path.join(updatesDir, bundleFileName);
fs.writeFileSync(bundleFilePath, JSON.stringify(bundlePayload, null, 2), 'utf-8');

const bundleBuf = fs.readFileSync(bundleFilePath);
const sha512 = crypto.createHash('sha512').update(bundleBuf).digest('base64');

// 1. Write updates/latest.json
const latestJson = {
  version: targetVersion,
  date: today,
  titleTh: `อัปเดตเวอร์ชัน v${targetVersion} — Pomodoro Cartoon Companion`,
  titleEn: `Update v${targetVersion} — Pomodoro Cartoon Companion`,
  notesTh: [
    noteTh,
    'อัปเดตชุดธีมตัวละครและท่าทางล่าสุดในโฟลเดอร์ themes/ อัตโนมัติ'
  ],
  notesEn: [
    noteEn,
    'Automatically syncs latest character & behavior Theme Sets.'
  ],
  packageFile: bundleFileName,
  installerFile: null,
  sha512
};

fs.writeFileSync(
  path.join(updatesDir, 'latest.json'),
  JSON.stringify(latestJson, null, 2),
  'utf-8'
);

// 2. Write updates/latest.yml (for standard electron-updater generic HTTP servers)
const latestYml = `version: ${targetVersion}
files:
  - url: ${bundleFileName}
    sha512: ${sha512}
    size: ${bundleBuf.length}
path: ${bundleFileName}
sha512: ${sha512}
releaseDate: '${new Date().toISOString()}'
`;

fs.writeFileSync(path.join(updatesDir, 'latest.yml'), latestYml, 'utf-8');

console.log(`✅ Generated update files for v${targetVersion} in: ${updatesDir}`);
console.log(`   - ${path.join(updatesDir, 'latest.json')}`);
console.log(`   - ${path.join(updatesDir, 'latest.yml')}`);
console.log(`   - ${bundleFilePath}`);
