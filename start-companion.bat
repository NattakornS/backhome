@echo off
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=
if exist "dist\PomodoroCartoonCompanion-win32-x64\PomodoroCartoonCompanion.exe" (
  start "" "dist\PomodoroCartoonCompanion-win32-x64\PomodoroCartoonCompanion.exe" --open-settings
) else (
  start "" npx electron . --open-settings
)
