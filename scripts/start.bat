@echo off
REM Dream Analyzer Startup Script for Windows
REM This script checks and starts the Dream Analyzer application services

echo 🌙 Dream Analyzer Startup Manager
echo ================================

REM Set the working directory to the project root
cd /d %~dp0..
echo Current Directory: %CD%

REM Check if Node.js is available and run the startup manager
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Node.js startup manager...
    node scripts\startup-manager.js %*
) else (
    echo Node.js not found, using PowerShell script...
    powershell -ExecutionPolicy Bypass -File "scripts\check-and-start.ps1" %*
)

pause