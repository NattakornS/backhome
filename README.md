# 👨‍🌾 Farmer Back-Home Alert (16:00) & Cartoon Taskbar Companion

A lightweight Windows desktop companion and **16:00 Back-Home Alert** app built with **Electron** and a **60 FPS HTML5 Canvas 2D Cartoon Engine**.

A cheerful cartoon character walks along the bottom-right corner above your Windows taskbar performing 7 animated behaviors, and pops up an interactive alert with chime + Snooze buttons when it's time to go home (`16:00` by default).

---

## ✨ Key Features

- **7 Animated Cartoon Behaviors**:
  1. 🚜 **Drive a Tractor / Ride Vehicle** (`tractor`) — Rides a bouncing tractor, scooter, magic broom, or hover-bike with exhaust puffs.
  2. 🔪 **Hold / Swing Machete / Blade** (`machete`) — Walks and slashes tall grass blades with flying clippings.
  3. 🚿 **Pouring Water / Elixir** (`water`) — Tilts a watering can with animated droplets onto blooming sprouts.
  4. 🌱 **Plant the Tree** (`plant`) — Digs soil with a shovel and grows a lush sapling.
  5. 🌴 **Harvest Oil Palm / Fruit** (`palm`) — Uses a long harvesting sickle pole (`เคียวแทงปาล์ม`) to slice ripe red-orange palm fruit bunches (`ทะลายปาล์มสุก`).
  6. 🌾 **Spread Fertilizer / Sparkles** (`fertilizer`) — Carries a sack and tosses granules in sweeping parabolic arcs.
  7. 🔧 **Fix the Things** (`fix`) — Hammers and repairs a fence & toolbox with comic sparks.
- **🎨 Multi-Theme Engine + Custom Theme Studio**:
  - **4 Built-in Cartoon Themes**:
    - 🌾 **Country Farmer (ชาวสวนปาล์ม)** — *Uncle Somchai* (+ 4 farmer outfit presets)
    - 🍜 **Street Food Chef (เชฟสตรีทฟู้ด)** — *Chef Moo-Krob*
    - 🧙‍♂️ **Cozy Alchemist Wizard (พ่อมดนักปรุงยา)** — *Archmage Poom*
    - ⚡ **Cyber Samurai (ซามูไรไซเบอร์ 2077)** — *Kenshin-77*
  - **1 Sample Custom Theme Included**:
    - 🏴‍☠️ **Pirate Captain (`themes/pirate-captain.json`)**
  - **Generate & Import Your Own Themes**:
    - Visual Theme Generator inside Settings (`✨ Generate Own Theme`)
    - One-click `🎲 Randomize Colors & Style`
    - Import/Export `.json` theme files (`📥 Import Theme (.json)` / `📤 Export Active Theme (.json)`)
    - One-click `🤖 Copy AI Prompt` to generate custom themes with ChatGPT, Gemini, or Claude
    - Optional `customSpriteUrl` to use your own PNG/GIF/WebP character animation
- **📍 Flexible Screen Positioning**:
  - Presets: *Bottom-Right (Taskbar Corner)*, *Bottom-Center*, *Bottom-Left*, *Top-Right*, or **Drag & Drop (`✋ Move`)** anywhere on screen.
  - Fine-tune X/Y pixel offsets and character scale (`0.8x` – `1.4x`).
- **⏰ 16:00 Wake Time & Snooze**:
  - Configurable 24-hour wake alarm (`16:00` default) with custom banner text and Web Audio chime.
  - Quick Snooze buttons (`💤 Snooze 10m`, `+5m`, `+15m`) and `🏡 Back Home! (Dismiss)`.
  - Dual Visibility Mode: **Walk on Taskbar All Day + Alert at 16:00** OR **Stay Hidden in System Tray Until 16:00**.

---

## 🚀 Getting Started

### Prerequisites
- **Windows 10 / 11**
- **Node.js** (v18+ or v22+ recommended)

### Install & Run (Development)
```powershell
# Install dependencies
npm install

# Start the taskbar companion
npm start

# Start and open the Settings & Theme Studio window immediately
npm run settings
```
Or simply double-click **[start-farmer.bat](file:///c:/Users/ntkswu/dev/personal/miniapp/start-farmer.bat)**.

### Build Standalone Windows `.exe`
```powershell
npm run build
```
This packages the app into `dist/FarmerBackHomeAlert-win32-x64/FarmerBackHomeAlert.exe`.

---

## 🎨 How to Generate & Import Your Own Cartoon Theme

You can create and import custom themes in **3 ways**:

### Method 1: In-App Visual Theme Generator
1. Open **Settings** (click the System Tray icon or click `⚙️ Settings` on the farmer's hover toolbar).
2. Under **🎨 Cartoon Animation Theme & Custom Theme Studio**, click **`✨ Generate Own Theme`**.
3. Pick your **Theme Name**, **Character Name**, **Hat Style** (`straw-hat`, `chef-hat`, `wizard-hat`, `samurai-helm`, `crown`, `cap`), **Vehicle Style** (`tractor`, `scooter`, `magic-broom`, `hover-bike`), **Color Palette**, and **7 Action Labels** (or click **`🎲 Randomize Colors & Style`**).
4. Click **`💾 Save & Apply Custom Theme`**. Your theme is immediately activated and saved to the `themes/` folder!

### Method 2: Generate with AI (ChatGPT / Gemini / Claude) & Import JSON
1. In Settings, click **`📥 Import Theme (.json)`**.
2. Click **`🤖 Copy AI Prompt (Generate with ChatGPT / Gemini)`**.
3. Paste the prompt into any AI assistant and ask for any theme you want (e.g., *"Make a Space Astronaut theme"* or *"Make a Cozy Cat Barista theme"*).
4. Paste the resulting JSON into the editor (or save it as a `.json` file and click **`📂 Choose .json File from Computer`**), then click **`💾 Save & Apply Custom Theme`**.

### Method 3: Drop `.json` Files into the `themes/` Folder
Any `.json` file placed inside the [`themes/`](file:///c:/Users/ntkswu/dev/personal/miniapp/themes) folder (see [`themes/pirate-captain.json`](file:///c:/Users/ntkswu/dev/personal/miniapp/themes/pirate-captain.json) as an example) is automatically loaded when the app starts.

#### Custom Theme JSON Schema Example
```json
{
  "id": "pirate-captain",
  "name": "🏴‍☠️ Pirate Captain (กัปตันโจรสลัด)",
  "characterName": "Captain Jack Kra-Pao",
  "alertMessage": "16:00 Drop Anchor! 🏴‍☠️ ได้เวลาเทียบท่า กลับบ้านกัน!",
  "hatStyle": "crown",
  "vehicleStyle": "scooter",
  "groundColor": "#26C6DA",
  "customSpriteUrl": "",
  "skin": {
    "skinTone": "#E8B48A",
    "cheek": "#E57373",
    "hatMain": "#FFD54F",
    "hatDark": "#F57F17",
    "hatBand": "#B71C1C",
    "shirt": "#B71C1C",
    "shirtSleeve": "#8E0000",
    "overalls": "#212121",
    "kamarBelt": true,
    "pants": "#1C2833",
    "boots": "#3E2723",
    "sunglasses": false,
    "mustache": true
  },
  "vehicle": {
    "bodyColor": "#5D4037",
    "trimColor": "#FFD54F",
    "wheelColor": "#212121",
    "rimColor": "#FFB300",
    "smokeColor": "#E0F7FA"
  },
  "behaviors": {
    "tractor": { "icon": "🚢", "label": "Sailing Mini Galleon", "particleColor": "#80DEEA" },
    "machete": { "icon": "🗡️", "label": "Swinging Cutlass Sword", "particleColor": "#FFD54F" },
    "water": { "icon": "🍺", "label": "Pouring Island Rum", "particleColor": "#FFB300" },
    "plant": { "icon": "🗺️", "label": "Burying Treasure Chest", "particleColor": "#FFE082" },
    "palm": { "icon": "🌴", "label": "Harvesting Island Coconuts", "particleColor": "#66BB6A" },
    "fertilizer": { "icon": "🪙", "label": "Tossing Gold Doubloons", "particleColor": "#FFD700" },
    "fix": { "icon": "⚓", "label": "Repairing Ship Helm", "particleColor": "#FF8A65" }
  }
}
```

---

## 📁 Project Structure

```text
miniapp/
├── main.js                       # Electron main process, System Tray, 16:00 Scheduler, Theme Loader
├── preload.js                    # Context-isolated IPC bridge
├── package.json                  # Scripts & Electron dependencies
├── start-farmer.bat              # Quick double-click Windows launcher
├── themes/
│   └── pirate-captain.json       # Sample custom cartoon theme JSON
└── src/
    ├── overlay/
    │   ├── overlay.html          # Transparent click-through taskbar overlay & alert banner
    │   ├── overlay.css           # Overlay & speech bubble styling
    │   └── farmer-engine.js      # 60 FPS 2D Canvas multi-theme cartoon animation engine
    └── settings/
        ├── settings.html         # Settings Control Panel & Custom Theme Studio Modal
        ├── settings.css          # Dark-mode UI styling
        └── settings.js           # Live preview, theme generator, JSON import/export logic
```
