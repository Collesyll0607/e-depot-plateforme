Write-Host "============================================================" -ForegroundColor Green
Write-Host "  E-DEPOT - DEMARRAGE COMPLET DE LA PLATEFORME" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

$root = $PSScriptRoot

Write-Host "[1/3] Lancement du Backend Spring Boot (port 8085)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "`"$root\lancer_backend.bat`""

Write-Host "[2/3] Lancement du Frontend Vite (port 5173)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "`"$root\lancer_frontend.bat`""

Write-Host ""
Write-Host "[3/3] Patientez 6 secondes pendant l'initialisation..." -ForegroundColor Cyan
Start-Sleep -Seconds 6

Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Plateforme lancee avec succes sur http://localhost:5173 !" -ForegroundColor Green
Write-Host "Gardez les fenetres ouvertes pendant vos tests." -ForegroundColor Gray