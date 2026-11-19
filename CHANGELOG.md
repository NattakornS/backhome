# Changelog — Pomodoro Cartoon Companion

All notable changes to **Pomodoro Cartoon Companion** are documented in this file.

## [1.2.1] - 2026-11-19
### Changed
- Add update app feature

## [1.2.0] - 2026-11-18
### Added
- **Core Pomodoro Timer Engine**:
  - Customizable **Focus** (default 25m), **Short Break** (default 5m), and **Long Break** (default 15m) intervals.
  - **Cycle Automation**: Configurable work intervals before a Long Break (default 4 cycles) + optional Auto-start Breaks and Auto-start Focus toggles.
  - **Overflow / Overtime Mode**: Continues counting up (`+00:01`, `+00:02`...) past zero when a session finishes so deep flow state is not interrupted.
  - **Strict Mode**: Optional lock that prevents pausing, skipping, resetting, or quitting while a Focus interval is running.
- **Universal Declarative 2D Drawable & Animation Scene Graph Engine (`cartoon-engine.js`)**:
  - Any drawable shape (`rect`, `roundRect`, `circle`, `ellipse`, `arc`, `line`, `curve`, `bezier`, `polygon`, `star`, `heart`, `text`, `group`) and animation (`rotateSpeed`, `swingDeg`, `moveXAmp`, `moveYAmp`, `scaleAmp`, `fallLoop`, `blink`) can be defined purely in JSON.
  - Added showcase declarative Theme Set `themes/mecha-dragon-knight.json` (`🐉 Mecha Dragon Knight`).
- **About & Release Notes Page**:
  - Added in-app **About & Version History (`เกี่ยวกับ & บันทึกการอัปเดต`)** view backed by `releases.json` and `CHANGELOG.md`.

### Changed
- **Refactored Project Naming**:
  - Renamed app to **Pomodoro Cartoon Companion**.
  - Refactored `farmer-engine.js` -> `cartoon-engine.js`, `FarmerEngine` -> `CartoonEngine`, `farmerAPI` -> `companionAPI`, and `start-farmer.bat` -> `start-companion.bat`.
- **Cleaner Taskbar Overlay UX**:
  - Shifted default bottom-right overlay position left with screen boundary clamping.
  - Lean bottom-right Pomodoro corner badge shows only Mode + Timer by default and expands call-to-action controls on hover.
  - Combined character behavior label with the action menu and hid it until hovering over the character.
  - Streamlined Theme Set card toolbar in Settings to eliminate redundant buttons and placed it on the bottom row of the card.

---

## [1.1.0] - 2026-11-18
### Added
- **Theme Set Studio**: Support for switching, creating, importing, and exporting Theme Sets (Character Style + Behavior Set).
- **Generative AI Prompt Helper**: One-click prompt copy for ChatGPT, Gemini, or Claude to generate custom Theme Set JSON files.
- **Thai / English (`TH / EN`) Language Switcher** across all menus and System Tray.

---

## [1.0.0] - 2026-11-17
### Added
- Initial release of the transparent 60 FPS Windows taskbar cartoon overlay, 7 animated behaviors, 16:00 Back-Home alert, Snooze system, and System Tray controls.
