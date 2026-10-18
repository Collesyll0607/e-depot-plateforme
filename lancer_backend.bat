@echo off
title E-DEPOT Backend (Port 8085)
cls
echo ============================================================
echo   E-DEPOT - Backend Spring Boot (Port 8085)
echo ============================================================
echo.
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
set "PATH=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot\bin;C:\Users\user\tools\apache-maven-3.9.9\bin;%PATH%"

cd /d "%~dp0backend"

echo Demarrage du serveur Spring Boot sur le port 8085...
echo Veuillez patienter quelques instants...
call mvn.cmd spring-boot:run

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERREUR] Le backend n'a pas pu demarrer.
    pause
)