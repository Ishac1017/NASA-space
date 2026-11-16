@echo off
cd /d "%~dp0"
echo =========================================
echo         MOONBOUND - MISSION LAB FUSION
 echo =========================================
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 20 or newer from https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules\vite" (
  echo Installing the project packages for the first run...
  call npm install
  if errorlevel 1 (
    echo The package install failed. Check your internet connection.
    pause
    exit /b 1
  )
)
echo Starting the game. Open the address printed below.
call npm run dev
pause
