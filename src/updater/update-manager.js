/**
 * Electron Auto-Update & Universal Update Manager for Pomodoro Cartoon Companion
 * Supports:
 * 1. electron-updater (autoUpdater) with latest.yml + .exe installer (HTTP/HTTPS or GitHub Releases)
 * 2. Universal Local Folder / Shared Network Drive / HTTP Server Update Feed (latest.json + update package)
 *    which works in Dev Mode, Portable electron-packager builds, and Air-gapped / LAN folders!
 */

const { app, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

let autoUpdater = null;
try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch (e) {
  // electron-updater optional fallback if not yet installed
}

function parseSemver(v) {
  const clean = String(v || '0.0.0').replace(/^v/i, '').trim();
  const parts = clean.split('.').map((n) => parseInt(n, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function compareSemver(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

function fetchUrlBuffer(urlStr) {
  return new Promise((resolve, reject) => {
    const client = urlStr.startsWith('https://') ? https : http;
    const req = client.get(
      urlStr,
      { headers: { 'User-Agent': 'PomodoroCartoonCompanion-Updater/1.2' } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrlBuffer(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} when fetching ${urlStr}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    );
    req.on('error', reject);
    req.setTimeout(12000, () => {
      req.destroy(new Error('Update request timed out'));
    });
  });
}

class UpdateManager {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.getCurrentVersion = options.getCurrentVersion || (() => '1.2.0');
    this.getFeedSource = options.getFeedSource || (() => path.join(this.rootDir, 'updates'));
    this.onStatusChange = options.onStatusChange || (() => {});

    this.state = {
      status: 'idle', // 'idle' | 'checking' | 'available' | 'up-to-date' | 'downloading' | 'downloaded' | 'error'
      currentVersion: this.getCurrentVersion(),
      availableVersion: null,
      releaseDate: null,
      titleTh: '',
      titleEn: '',
      notesTh: [],
      notesEn: [],
      progressPercent: 0,
      errorMessage: null,
      feedSource: this.getFeedSource(),
      lastCheckedAt: null,
      manifestData: null,
      downloadedFilePath: null,
      usingNativeAutoUpdater: false
    };

    this._setupNativeAutoUpdater();
  }

  _setupNativeAutoUpdater() {
    if (!autoUpdater) return;
    try {
      autoUpdater.autoDownload = false;
      autoUpdater.autoInstallOnAppQuit = true;
      autoUpdater.logger = null;

      autoUpdater.on('checking-for-update', () => {
        this._updateState({ status: 'checking', errorMessage: null });
      });

      autoUpdater.on('update-available', (info) => {
        this._updateState({
          status: 'available',
          availableVersion: info.version,
          releaseDate: info.releaseDate ? String(info.releaseDate).slice(0, 10) : '',
          titleTh: `อัปเดตเวอร์ชันใหม่ v${info.version}`,
          titleEn: `New Update Available v${info.version}`,
          notesTh: Array.isArray(info.releaseNotes) ? info.releaseNotes : [String(info.releaseNotes || '')],
          notesEn: Array.isArray(info.releaseNotes) ? info.releaseNotes : [String(info.releaseNotes || '')],
          usingNativeAutoUpdater: true
        });
      });

      autoUpdater.on('update-not-available', () => {
        this._updateState({
          status: 'up-to-date',
          availableVersion: this.getCurrentVersion(),
          lastCheckedAt: new Date().toISOString()
        });
      });

      autoUpdater.on('download-progress', (prog) => {
        this._updateState({
          status: 'downloading',
          progressPercent: Math.round(prog.percent || 0)
        });
      });

      autoUpdater.on('update-downloaded', (info) => {
        this._updateState({
          status: 'downloaded',
          progressPercent: 100,
          availableVersion: info.version
        });
      });

      autoUpdater.on('error', (err) => {
        this._updateState({
          status: 'error',
          errorMessage: err ? err.message : 'AutoUpdater error'
        });
      });
    } catch (e) {
      // Ignore if unpackaged
    }
  }

  _updateState(partial) {
    this.state = {
      ...this.state,
      currentVersion: this.getCurrentVersion(),
      feedSource: this.getFeedSource(),
      ...partial
    };
    this.onStatusChange(this.state);
    return this.state;
  }

  getState() {
    this.state.currentVersion = this.getCurrentVersion();
    this.state.feedSource = this.getFeedSource();
    return this.state;
  }

  resolveFeedDirectory(feedSource) {
    const raw = String(feedSource || '').trim();
    if (!raw || raw === './updates' || raw === 'updates') {
      return path.join(this.rootDir, 'updates');
    }
    if (path.isAbsolute(raw)) {
      return raw;
    }
    return path.join(this.rootDir, raw);
  }

  async checkForUpdates() {
    const currentVersion = this.getCurrentVersion();
    const feedSource = String(this.getFeedSource() || '').trim() || path.join(this.rootDir, 'updates');

    this._updateState({
      status: 'checking',
      currentVersion,
      feedSource,
      errorMessage: null,
      progressPercent: 0,
      usingNativeAutoUpdater: false
    });

    try {
      let manifest = null;

      // 1. Check if feedSource is HTTP/HTTPS URL
      if (feedSource.startsWith('http://') || feedSource.startsWith('https://')) {
        const baseUrl = feedSource.replace(/\/+$/, '');
        const jsonUrl = baseUrl.endsWith('.json') ? baseUrl : `${baseUrl}/latest.json`;
        try {
          const buf = await fetchUrlBuffer(jsonUrl);
          manifest = JSON.parse(buf.toString('utf-8'));
          manifest._baseUrl = baseUrl.replace(/\/latest\.json$/, '');
        } catch (jsonErr) {
          // If latest.json not found and app is packaged with app-update.yml, try electron-updater generic provider
          if (autoUpdater && app.isPackaged) {
            autoUpdater.setFeedURL({ provider: 'generic', url: baseUrl });
            await autoUpdater.checkForUpdates();
            return this.state;
          }
          throw jsonErr;
        }
      } else {
        // 2. Local Folder or Shared Network Drive (e.g. ./updates or \\Server\Share\updates)
        const dirPath = this.resolveFeedDirectory(feedSource);
        const manifestPath = dirPath.endsWith('.json')
          ? dirPath
          : path.join(dirPath, 'latest.json');

        if (!fs.existsSync(manifestPath)) {
          throw new Error(
            `ไม่พบไฟล์อัปเดต latest.json ในโฟลเดอร์: ${manifestPath} (No latest.json found at ${manifestPath})`
          );
        }
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        manifest = JSON.parse(raw);
        manifest._baseDir = path.dirname(manifestPath);
      }

      if (!manifest || !manifest.version) {
        throw new Error('Invalid update manifest: missing "version" field.');
      }

      const cmp = compareSemver(manifest.version, currentVersion);
      if (cmp > 0) {
        return this._updateState({
          status: 'available',
          availableVersion: manifest.version,
          releaseDate: manifest.date || new Date().toISOString().slice(0, 10),
          titleTh: manifest.titleTh || manifest.title || `อัปเดตเวอร์ชัน v${manifest.version}`,
          titleEn: manifest.titleEn || manifest.title || `Update v${manifest.version}`,
          notesTh: Array.isArray(manifest.notesTh) ? manifest.notesTh : manifest.changesTh || [],
          notesEn: Array.isArray(manifest.notesEn) ? manifest.notesEn : manifest.changesEn || [],
          manifestData: manifest,
          lastCheckedAt: new Date().toISOString()
        });
      } else {
        return this._updateState({
          status: 'up-to-date',
          availableVersion: manifest.version,
          manifestData: manifest,
          lastCheckedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      return this._updateState({
        status: 'error',
        errorMessage: err.message || String(err),
        lastCheckedAt: new Date().toISOString()
      });
    }
  }

  async downloadAndApplyUpdate(onReleaseAppliedCallback) {
    if (this.state.usingNativeAutoUpdater && autoUpdater) {
      this._updateState({ status: 'downloading', progressPercent: 10 });
      await autoUpdater.downloadUpdate();
      return this.state;
    }

    const manifest = this.state.manifestData;
    if (!manifest || !manifest.version) {
      return this._updateState({
        status: 'error',
        errorMessage: 'No update manifest loaded. Please check for updates first.'
      });
    }

    try {
      this._updateState({ status: 'downloading', progressPercent: 15, errorMessage: null });

      // Step 1: Check if there is an external installer (.exe) or package bundle (.json)
      let bundleData = manifest.bundle || null;
      let exeInstallerPath = null;

      if (manifest.installerFile) {
        if (manifest._baseDir) {
          const candidateExe = path.join(manifest._baseDir, manifest.installerFile);
          if (fs.existsSync(candidateExe)) {
            exeInstallerPath = candidateExe;
          }
        } else if (manifest._baseUrl) {
          const dlUrl = `${manifest._baseUrl}/${manifest.installerFile}`;
          this._updateState({ progressPercent: 45 });
          const exeBuf = await fetchUrlBuffer(dlUrl);
          const tempExe = path.join(app.getPath('temp'), manifest.installerFile);
          fs.writeFileSync(tempExe, exeBuf);
          exeInstallerPath = tempExe;
        }
      }

      if (!bundleData && manifest.packageFile) {
        this._updateState({ progressPercent: 50 });
        if (manifest._baseDir) {
          const pkgPath = path.join(manifest._baseDir, manifest.packageFile);
          if (fs.existsSync(pkgPath)) {
            bundleData = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          }
        } else if (manifest._baseUrl) {
          const pkgUrl = `${manifest._baseUrl}/${manifest.packageFile}`;
          const buf = await fetchUrlBuffer(pkgUrl);
          bundleData = JSON.parse(buf.toString('utf-8'));
        }
      }

      this._updateState({ progressPercent: 80 });

      // Step 2: Apply bundle updates (version, release notes, new themes, or file patches)
      if (bundleData && typeof bundleData === 'object') {
        if (bundleData.themes && typeof bundleData.themes === 'object') {
          const themesDir = path.join(this.rootDir, 'themes');
          if (!fs.existsSync(themesDir)) fs.mkdirSync(themesDir, { recursive: true });
          for (const [themeId, themeObj] of Object.entries(bundleData.themes)) {
            fs.writeFileSync(
              path.join(themesDir, `${themeId}.json`),
              JSON.stringify(themeObj, null, 2),
              'utf-8'
            );
          }
        }
        if (bundleData.files && typeof bundleData.files === 'object') {
          for (const [relFile, content] of Object.entries(bundleData.files)) {
            const safeRel = path.normalize(relFile).replace(/^(\.\.(\/|\\|$))+/, '');
            const destPath = path.join(this.rootDir, safeRel);
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.writeFileSync(destPath, String(content), 'utf-8');
          }
        }
      }

      // Step 3: Update releases.json and package.json version metadata
      const relPath = path.join(this.rootDir, 'releases.json');
      if (fs.existsSync(relPath)) {
        const relJson = JSON.parse(fs.readFileSync(relPath, 'utf-8'));
        relJson.currentVersion = manifest.version;
        const alreadyInList = Array.isArray(relJson.releases) &&
          relJson.releases.some((r) => r.version === manifest.version);
        if (!alreadyInList) {
          relJson.releases = relJson.releases || [];
          relJson.releases.forEach((r) => {
            if (r.tag === 'Latest') r.tag = 'Release';
          });
          relJson.releases.unshift({
            version: manifest.version,
            date: manifest.date || new Date().toISOString().slice(0, 10),
            tag: 'Latest',
            titleTh: manifest.titleTh || `อัปเดตเวอร์ชัน v${manifest.version}`,
            titleEn: manifest.titleEn || `Update v${manifest.version}`,
            changesTh: manifest.notesTh || manifest.changesTh || [],
            changesEn: manifest.notesEn || manifest.changesEn || []
          });
        }
        fs.writeFileSync(relPath, JSON.stringify(relJson, null, 2), 'utf-8');
      }

      const pkgJsonPath = path.join(this.rootDir, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        try {
          const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
          pkgJson.version = manifest.version;
          fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2), 'utf-8');
        } catch (e) {}
      }

      if (onReleaseAppliedCallback) {
        onReleaseAppliedCallback(manifest, bundleData);
      }

      this._updateState({
        status: 'downloaded',
        progressPercent: 100,
        currentVersion: manifest.version,
        downloadedFilePath: exeInstallerPath
      });

      return this.state;
    } catch (err) {
      return this._updateState({
        status: 'error',
        errorMessage: err.message || String(err)
      });
    }
  }

  quitAndInstall() {
    if (this.state.usingNativeAutoUpdater && autoUpdater) {
      autoUpdater.quitAndInstall();
      return;
    }
    if (this.state.downloadedFilePath && fs.existsSync(this.state.downloadedFilePath)) {
      spawn(this.state.downloadedFilePath, [], {
        detached: true,
        stdio: 'ignore'
      }).unref();
      app.exit(0);
      return;
    }
    app.relaunch();
    app.exit(0);
  }
}

module.exports = { UpdateManager, compareSemver };
