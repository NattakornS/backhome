# 🍅 Pomodoro Cartoon Companion

A lightweight Windows desktop **Pomodoro Focus Timer & Animated Cartoon Taskbar Companion** built with **Electron** and a **60 FPS Universal Declarative 2D Drawable Scene Graph Engine**.

A cute cartoon companion walks above your Windows taskbar with a lean bottom-right Pomodoro timer pill, expanding controls on hover, and alerts you with animations and sound chimes when a Focus/Break session completes or at daily Back-Home time (`16:00`).

---

## ✨ Key Features

### 🍅 Core Pomodoro Timer Engine
- **Customizable Intervals**: Adjust Focus (`25m` default), Short Break (`5m` default), and Long Break (`15m` default).
- **Cycle Automation**: Configure the number of Focus sessions before a Long Break (`4` cycles default), plus optional **Auto-start Breaks** and **Auto-start Focus** toggles.
- **Overflow / Overtime Mode**: Keep counting up past `00:00` (`+00:01`, `+00:02`...) so you don't lose momentum during deep flow state.
- **Strict Mode**: Locks Pause, Skip, Reset, and Quitting the app during an active Focus session until the timer completes.
- **Lean Taskbar Overlay**:
  - Bottom-right Pomodoro pill shows only **Mode + Timer** by default and reveals **Start/Pause, Skip, Reset** on hover.
  - Character behavior label + action menu (`Next`, `Move`, `Settings`) stays hidden until you hover over the cartoon character.

### 🎨 Universal 2D Cartoon Engine & AI Theme Set Studio
- **Built-in Theme Sets** (Character Style + 7 Animated Behaviors):
  - 🌾 **Country Farmer (`ชาวสวนปาล์ม`)** + 4 farmer outfit presets
  - 🍜 **Street Food Chef (`เชฟสตรีทฟู้ด`)**
  - 🧙‍♂️ **Cozy Alchemist Wizard (`พ่อมดนักปรุงยา`)**
  - 💻 **Focus Software Dev (`นักพัฒนาสายโฟกัส`)**
- **Showcase Custom Theme Sets** in [`themes/`](file:///c:/Users/ntkswu/dev/personal/miniapp/themes):
  - `themes/mecha-dragon-knight.json` (flapping dragon wings, spinning star crystals, dragon lute notes)
  - `themes/pirate-captain.json`
- **Declarative Drawables & Animations**: Any character part, hat, vehicle, handheld tool, scene prop, pose, and particle emitter can be drawn and animated purely in JSON (`rect`, `roundRect`, `circle`, `ellipse`, `arc`, `line`, `curve`, `bezier`, `polygon`, `star`, `heart`, `text`, `group` + `anim` rules).
- **Generative AI Workflow**:
  - Click **`🤖 AI Theme Studio & Import`** in Settings to copy the full declarative schema prompt for **ChatGPT / Gemini / Claude**, paste the generated JSON, and activate your new Theme Set immediately.
  - Export and share standalone Theme Sets (`.json`) or full Settings + Theme Set Share Bundles.

### 🌐 Bilingual & Auto-Update
- **Thai / English (`TH / EN`)**: Switch cleanly between Thai and English across the Settings UI, Overlay, System Tray, and Release Notes.
- **GitHub Releases Auto-Updater**: Built-in `electron-updater` checks `NattakornS/backhome` GitHub Releases, downloads updates, and installs on restart.
- **About & Release Notes**: In-app version history backed by [`releases.json`](file:///c:/Users/ntkswu/dev/personal/miniapp/releases.json) and [`CHANGELOG.md`](file:///c:/Users/ntkswu/dev/personal/miniapp/CHANGELOG.md).

---

## 🚀 Getting Started

### Prerequisites
- **Windows 10 / 11**
- **Node.js** (v20+ or v22+ recommended)

### Install & Run (Development)
```powershell
# Install dependencies
npm install

# Start the taskbar companion
npm start

# Start and open the Settings & Theme Studio window
npm run settings
```
Or double-click **[start-companion.bat](file:///c:/Users/ntkswu/dev/personal/miniapp/start-companion.bat)**.

### Build Windows Installer (`.exe` + `latest.yml`)
```powershell
npm run build
```
Outputs the NSIS Windows installer and auto-update metadata into `dist/`.

---

## 📦 Publishing a New Release Update (GitHub Actions)

This repository includes a GitHub Actions workflow ([`.github/workflows/release.yml`](file:///c:/Users/ntkswu/dev/personal/miniapp/.github/workflows/release.yml)) that automatically builds the Windows `.exe` installer + `latest.yml` + `.blockmap` and publishes a **GitHub Release** whenever a `v*` tag is pushed.

Use the built-in release publisher script ([`scripts/publish-release.js`](file:///c:/Users/ntkswu/dev/personal/miniapp/scripts/publish-release.js)):

```powershell
# Interactive prompt (asks for version & TH/EN release notes)
npm run publish-release

# Or pass --version directly (X.Y.Z | patch | minor | major)
npm run publish-release -- --version 1.2.1
npm run publish-release -- --version patch --notes-th "แก้ไขบั๊ก" --notes-en "Bug fixes"

# Preview without committing/pushing
npm run publish-release -- --version 1.2.1 --dry-run
```

The script automatically updates `package.json`, `releases.json`, and `CHANGELOG.md`, commits, tags (`vX.Y.Z`), and pushes with `--tags` to trigger the release build.

---

## 📁 Project Structure

```text
miniapp/
├── .github/workflows/
│   └── release.yml               # GitHub Actions Windows build & GitHub Release publisher
├── scripts/
│   └── publish-release.js        # CLI/interactive version bump, changelog & tag publisher
├── src/
│   ├── overlay/
│   │   ├── overlay.html          # Transparent taskbar overlay, hover menu & Pomodoro pill
│   │   ├── overlay.css           # Overlay & alert banner styling (Kanit font)
│   │   └── cartoon-engine.js     # 60 FPS Universal 2D Drawable & Animation Scene Graph
│   ├── settings/
│   │   ├── settings.html         # Pomodoro Dashboard, Theme Studio, Updater & About page
│   │   ├── settings.css          # Responsive dark-mode styling
│   │   └── settings.js           # Settings, AI Prompt, Theme import/export & Updater UI
│   └── updater/
│       └── update-manager.js     # electron-updater + GitHub Releases API manager
├── themes/
│   ├── mecha-dragon-knight.json  # Showcase declarative 2D drawable Theme Set
│   └── pirate-captain.json       # Sample custom Theme Set
├── main.js                       # Electron main process, Pomodoro Core Engine, Tray & IPC
├── preload.js                    # Context-isolated IPC bridge (window.companionAPI)
├── package.json                  # App metadata, electron-builder config & scripts
├── releases.json                 # Structured bilingual release notes for About page
├── CHANGELOG.md                  # Markdown changelog
└── start-companion.bat           # Quick Windows launcher
```

---

## 👨‍💻 Developer

**Nattakorn Sanpabopit** — *Fullstack Web Developer*
