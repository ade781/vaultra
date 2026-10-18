@echo off
title Vaultra Runner
echo ========================================================
echo               STARTING VAULTRA SYSTEM
echo ========================================================
echo.

echo [1/2] Menjalankan Backend Server (Port 5000)...
start "Vaultra Backend Server" cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Menjalankan Frontend Client (Port 5173)...
start "Vaultra Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo  Server & Client berhasil dijalankan!
echo  Buka di browser: http://localhost:5173
echo ========================================================
pause
