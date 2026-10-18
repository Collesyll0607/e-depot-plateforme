@echo off
title E-DEPOT Frontend (Port 5173)
cls
echo ============================================================
echo   E-DEPOT - Frontend Web (Port 5173)
echo ============================================================
echo.
set "PATH=C:\Users\user\.tools\node-v22.23.3-win-x64;%PATH%"

cd /d "%~dp0frontend"

echo Demarrage du serveur Vite sur le port 5173...
call npm.cmd run dev -- --host

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERREUR] Le frontend n'a pas pu demarrer.
    pause
)