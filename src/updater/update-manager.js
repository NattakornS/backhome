/**
 * Simple Electron Auto-Updater (Option 3: GitHub Releases Only)
 * - In packaged Windows builds: uses `electron-updater` (`autoUpdater`) against GitHub Releases
 *   (`NattakornS/backhome` with `latest.yml` + `.exe` installer artifacts).
 * - In development mode (`!app.isPackaged`): checks the GitHub Releases API so you can still
 *   preview available releases and open the GitHub Release download page.
 */

const { app, shell } = require('electron');
const https = require('https');
const { autoUpdater } = require('electron-updater');

const GITHUB_OWNER = 'NattakornS';
const GITHUB_REPO = 'backhome';
const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

function compareSemver(a, b) {
  const pa = String(a || '0.0.0').replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b || '0.0.0').replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

function fetchGitHubLatestRelease() {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          'User-Agent': 'PomodoroCartoonCompanion-Updater/1.2',
          Accept: 'application/vnd.github+json'
        }
      },
      (res) => {
        if (res.statusCode === 404) {
          resolve(null);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API returned HTTP ${res.statusCode}`));
          return;
        }
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('GitHub update check timed out'));
    });
  });
}

class UpdateManager {
  constructor(options = {}) {
    this.getCurrentVersion = options.getCurrentVersion || (() => '1.2.0');
    this.onStatusChange = options.onStatusChange || (() => {});

    this.state = {
      status: 'idle', // 'idle' | 'checking' | 'available' | 'up-to-date' | 'downloading' | 'downloaded' | 'error'
      currentVersion: this.getCurrentVersion(),
      availableVersion: null,
      releaseDate: null,
      releaseNotes: '',
      releaseUrl: GITHUB_RELEASES_URL,
      progressPercent: 0,
      errorMessage: null,
      isPackaged: app.isPackaged
    };

    this._setupAutoUpdater();
  }

  _setupAutoUpdater() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.logger = null;

    if (app.isPackaged) {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO
      });
    }

    autoUpdater.on('checking-for-update', () => {
      this._updateState({ status: 'checking', errorMessage: null });
    });

    autoUpdater.on('update-available', (info) => {
      const notes = Array.isArray(info.releaseNotes)
        ? info.releaseNotes.map((n) => n.note || n).join('\n')
        : String(info.releaseNotes || '');
      this._updateState({
        status: 'available',
        availableVersion: info.version,
        releaseDate: info.releaseDate ? String(info.releaseDate).slice(0, 10) : '',
        releaseNotes: notes,
        releaseUrl: `${GITHUB_RELEASES_URL}/tag/v${info.version}`
      });
    });

    autoUpdater.on('update-not-available', () => {
      this._updateState({
        status: 'up-to-date',
        availableVersion: this.getCurrentVersion(),
        errorMessage: null
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
  }

  _updateState(partial) {
    this.state = {
      ...this.state,
      currentVersion: this.getCurrentVersion(),
      isPackaged: app.isPackaged,
      ...partial
    };
    this.onStatusChange(this.state);
    return this.state;
  }

  getState() {
    this.state.currentVersion = this.getCurrentVersion();
    this.state.isPackaged = app.isPackaged;
    return this.state;
  }

  async checkForUpdates() {
    const currentVersion = this.getCurrentVersion();
    this._updateState({
      status: 'checking',
      currentVersion,
      errorMessage: null,
      progressPercent: 0
    });

    if (app.isPackaged) {
      try {
        await autoUpdater.checkForUpdates();
        return this.state;
      } catch (err) {
        return this._updateState({
          status: 'error',
          errorMessage: err ? err.message : String(err)
        });
      }
    }

    // Dev mode fallback: query GitHub Releases API directly
    try {
      const release = await fetchGitHubLatestRelease();
      if (!release || !release.tag_name) {
        return this._updateState({
          status: 'up-to-date',
          availableVersion: currentVersion,
          releaseUrl: GITHUB_RELEASES_URL
        });
      }
      const remoteVer = String(release.tag_name).replace(/^v/i, '');
      if (compareSemver(remoteVer, currentVersion) > 0) {
        return this._updateState({
          status: 'available',
          availableVersion: remoteVer,
          releaseDate: release.published_at ? String(release.published_at).slice(0, 10) : '',
          releaseNotes: release.body || '',
          releaseUrl: release.html_url || GITHUB_RELEASES_URL
        });
      }
      return this._updateState({
        status: 'up-to-date',
        availableVersion: remoteVer,
        releaseUrl: release.html_url || GITHUB_RELEASES_URL
      });
    } catch (err) {
      return this._updateState({
        status: 'error',
        errorMessage: err ? err.message : String(err)
      });
    }
  }

  async downloadUpdate() {
    if (!app.isPackaged) {
      // In dev mode, open the GitHub Release download page
      shell.openExternal(this.state.releaseUrl || GITHUB_RELEASES_URL);
      return this.state;
    }
    this._updateState({ status: 'downloading', progressPercent: 0, errorMessage: null });
    await autoUpdater.downloadUpdate();
    return this.state;
  }

  quitAndInstall() {
    if (app.isPackaged) {
      autoUpdater.quitAndInstall();
    }
  }

  openReleasesPage() {
    shell.openExternal(this.state.releaseUrl || GITHUB_RELEASES_URL);
  }
}

module.exports = { UpdateManager };
