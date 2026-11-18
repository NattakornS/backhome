@echo off
cd /d "%~dp0"
if exist "dist\FarmerBackHomeAlert-win32-x64\FarmerBackHomeAlert.exe" (
  start "" "dist\FarmerBackHomeAlert-win32-x64\FarmerBackHomeAlert.exe" --open-settings
) else (
  start "" npx electron . --open-settings
)
