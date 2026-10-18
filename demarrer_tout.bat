@echo off
title E-DEPOT - Lanceur Global
cls
echo ============================================================
echo   E-DEPOT - DEMARRAGE COMPLET DE LA PLATEFORME
echo ============================================================
echo.
echo [1/3] Lancement du Backend Spring Boot (port 8085)...
start "E-DEPOT Backend" "%~dp0lancer_backend.bat"

echo.
echo [2/3] Lancement du Frontend Vite (port 5173)...
start "E-DEPOT Frontend" "%~dp0lancer_frontend.bat"

echo.
echo [3/3] Ouverture automatique du navigateur...
timeout /t 6 /nobreak > nul
start "" "http://localhost:5173"

echo.
echo ============================================================
echo   Plateforme lancee avec succes !
echo   - Frontend : http://localhost:5173
echo   - Backend  : http://localhost:8085
echo.
echo   Gardez les deux fenetres ouvertes pendant vos tests.
echo ============================================================
echo.
pause