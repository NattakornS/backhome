/**
 * Interactive & CLI Release Publisher for Pomodoro Cartoon Companion
 *
 * Usage:
 *   npm run publish-release
 *   npm run publish-release -- --version 1.2.1
 *   npm run publish-release -- --version patch --notes-th "แก้ไขบั๊ก" --notes-en "Bug fixes"
 *   npm run publish-release -- 1.3.0 --dry-run
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const releasesPath = path.join(rootDir, 'releases.json');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

function parseArgs(argv) {
  const args = {
    version: null,
    notesTh: null,
    notesEn: null,
    dryRun: false
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--version' || a === '-v') {
      args.version = argv[++i];
    } else if (a.startsWith('--version=')) {
      args.version = a.slice('--version='.length);
    } else if (a === '--notes-th') {
      args.notesTh = argv[++i];
    } else if (a === '--notes-en') {
      args.notesEn = argv[++i];
    } else if (a === '--dry-run') {
      args.dryRun = true;
    } else if (!a.startsWith('-') && !args.version) {
      args.version = a;
    }
  }
  return args;
}

function bumpSemver(current, type) {
  const clean = String(current || '1.0.0').replace(/^v/i, '').trim();
  const [maj, min, pat] = clean.split('.').map((n) => parseInt(n, 10) || 0);
  if (type === 'major') return `${maj + 1}.0.0`;
  if (type === 'minor') return `${maj}.${min + 1}.0`;
  if (type === 'patch') return `${maj}.${min}.${pat + 1}`;
  return null;
}

function isValidSemver(v) {
  return /^\d+\.\d+\.\d+$/.test(String(v || '').trim());
}

function askQuestion(rl, question) {
  return new Promise((resolve) => rl.question(question, (ans) => resolve(ans.trim())));
}

function runCmd(cmd, dryRun) {
  console.log(`> ${cmd}`);
  if (dryRun) return '';
  return execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const currentVersion = pkg.version || '1.2.0';

  let nextVersion = args.version;
  let notesTh = args.notesTh;
  let notesEn = args.notesEn;

  if (!nextVersion) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`\n🍅 Pomodoro Cartoon Companion — Release Publisher`);
    console.log(`   Current version: v${currentVersion}`);
    console.log(`   Options: patch (${bumpSemver(currentVersion, 'patch')}), minor (${bumpSemver(currentVersion, 'minor')}), major (${bumpSemver(currentVersion, 'major')}), or enter X.Y.Z\n`);

    const ansVer = await askQuestion(rl, `Enter new version [${bumpSemver(currentVersion, 'patch')}]: `);
    nextVersion = ansVer || 'patch';

    if (!notesTh) {
      notesTh = await askQuestion(rl, `Release note (TH) [อัปเดตเวอร์ชันใหม่และปรับปรุงระบบ]: `);
    }
    if (!notesEn) {
      notesEn = await askQuestion(rl, `Release note (EN) [New release and improvements]: `);
    }
    rl.close();
  }

  // Resolve patch/minor/major keywords or strip leading 'v'
  const bumped = bumpSemver(currentVersion, nextVersion.toLowerCase());
  if (bumped) {
    nextVersion = bumped;
  } else {
    nextVersion = String(nextVersion).replace(/^v/i, '').trim();
  }

  if (!isValidSemver(nextVersion)) {
    console.error(`❌ Invalid version "${nextVersion}". Expected format X.Y.Z (e.g. 1.2.1) or patch/minor/major.`);
    process.exit(1);
  }

  const finalNoteTh = notesTh || 'อัปเดตเวอร์ชันใหม่และปรับปรุงระบบ';
  const finalNoteEn = notesEn || 'New release and improvements';
  const today = new Date().toISOString().slice(0, 10);

  console.log(`\n📦 Preparing release v${nextVersion} (from v${currentVersion})${args.dryRun ? ' [DRY RUN]' : ''}...`);

  if (!args.dryRun) {
    // 1. Update package.json
    pkg.version = nextVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

    // 2. Update releases.json
    if (fs.existsSync(releasesPath)) {
      const relJson = JSON.parse(fs.readFileSync(releasesPath, 'utf-8'));
      relJson.currentVersion = nextVersion;
      relJson.releases = Array.isArray(relJson.releases) ? relJson.releases : [];
      relJson.releases.forEach((r) => {
        if (r.tag === 'Latest') r.tag = 'Release';
      });
      relJson.releases.unshift({
        version: nextVersion,
        date: today,
        tag: 'Latest',
        titleTh: `อัปเดตเวอร์ชัน v${nextVersion} — ${finalNoteTh}`,
        titleEn: `Release v${nextVersion} — ${finalNoteEn}`,
        changesTh: [finalNoteTh],
        changesEn: [finalNoteEn]
      });
      fs.writeFileSync(releasesPath, JSON.stringify(relJson, null, 2) + '\n', 'utf-8');
    }

    // 3. Prepend to CHANGELOG.md
    if (fs.existsSync(changelogPath)) {
      const oldChangelog = fs.readFileSync(changelogPath, 'utf-8');
      const newSection = `## [${nextVersion}] - ${today}\n### Changed\n- ${finalNoteEn}\n\n`;
      const marker = '## [';
      const idx = oldChangelog.indexOf(marker);
      const updatedChangelog =
        idx !== -1
          ? oldChangelog.slice(0, idx) + newSection + oldChangelog.slice(idx)
          : oldChangelog + '\n' + newSection;
      fs.writeFileSync(changelogPath, updatedChangelog, 'utf-8');
    }
  }

  // 4. Commit, tag, and push to trigger GitHub Actions Release workflow
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir })
    .toString()
    .trim();

  runCmd('git add -A', args.dryRun);
  runCmd(`git commit -m "chore: release v${nextVersion}"`, args.dryRun);
  runCmd(`git tag v${nextVersion}`, args.dryRun);
  runCmd(`git push origin ${branch} --tags`, args.dryRun);

  console.log(`\n✅ Release v${nextVersion} pushed to origin/${branch}!`);
  console.log(`   GitHub Actions will now build the Windows .exe + latest.yml and publish to GitHub Releases.`);
}

main().catch((err) => {
  console.error('❌ Release failed:', err.message);
  process.exit(1);
});
