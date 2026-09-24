@echo off
title AquaShield AI - 1-Click Starter
cd /d "%~dp0"
echo ================================================================
echo    AQUASHIELD AI - COASTAL DISASTER INTELLIGENCE PLATFORM
echo ================================================================
echo.
echo Launching AquaShield AI...
echo.

python run_app.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Opening direct UI in browser fallback...
    start "" "index.html"
)

pause
