@echo off
rem === Liella! vocal mixer - local launcher ===
rem Serves THIS folder over local HTTP so the mixer can load the audio,
rem then opens the app in your default browser.

set PORT=8137
set PY=python
where python >nul 2>nul || set PY=py -3

cd /d "%~dp0"
start "liella-mixer-server" cmd /c %PY% -m http.server %PORT%
timeout /t 1 /nobreak >nul
start "" "http://localhost:%PORT%/index.html"

echo.
echo   Liella mixer is running at http://localhost:%PORT%/index.html
echo   A separate "liella-mixer-server" window opened - close it to stop the server.
echo.
