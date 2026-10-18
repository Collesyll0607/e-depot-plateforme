@echo off
title E-DEPOT - Arret des serveurs
cls
echo ============================================================
echo   E-DEPOT - Arret des serveurs
echo ============================================================
echo.
echo Fermeture des processus en cours...
taskkill /F /FI "WINDOWTITLE eq E-DEPOT*" > nul 2>&1
echo Serveurs arretes proprement.
timeout /t 2 > nul