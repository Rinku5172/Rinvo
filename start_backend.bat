@echo off
title RocketPDF Backend Server
color 0a
echo ===================================================
echo      RocketPDF Backend Server Launcher
echo ===================================================
echo.

echo [1/3] Checking Python installation...
python --version
if %errorlevel% neq 0 (
    color 0c
    echo.
    echo [ERROR] Python is not found! 
    echo Please install Python 3.10+ from https://python.org
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b
)
echo [OK] Python found.

echo.
echo [2/3] Installing/Updating dependencies...
echo This make take a few minutes for the first time...
pip install -r backend/requirements.txt
if %errorlevel% neq 0 (
    color 0c
    echo.
    echo [ERROR] Failed to install dependencies.
    echo Please check your internet connection or Python installation.
    echo.
    pause
    exit /b
)
echo [OK] Dependencies ready.

echo.
echo [3/3] Starting API Server...
echo Server will run at http://localhost:8000
echo Keep this window OPEN while using the tools.
echo.
python backend/api_server.py

pause
