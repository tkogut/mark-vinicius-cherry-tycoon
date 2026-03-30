@echo off
title AntiGravity Chrome Launcher
echo [SYSTEM] Zamykanie istniejacych instancji Chrome...
taskkill /F /IM chrome.exe /T >nul 2>&1

echo [SYSTEM] Uruchamianie Chrome (Profile: roostertk, Port: 9222)...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
--remote-debugging-port=9222 ^
--user-data-dir="C:\Users\tkogut\AppData\Local\Google\Chrome\User Data" ^
--profile-directory="Default" ^
--remote-allow-origins=*

echo [SYSTEM] Gotowe. Mozesz teraz uruchomic mostek w WSL.
