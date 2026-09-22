@echo off
title KrishiVision Backend Server
echo ========================================================
echo Starting KrishiVision Flask Backend Server on port 5000...
echo ========================================================
cd /d "%~dp0backend"
if exist venv\Scripts\python.exe (
    venv\Scripts\python.exe -m app.server
) else (
    python -m app.server
)
pause
