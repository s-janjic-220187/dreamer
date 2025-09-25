@echo off
REM Dream Analyzer Application Management Script
REM Usage: manage.bat [start|stop|restart|status|test|build]

if "%1"=="" goto help
if "%1"=="start" goto start
if "%1"=="stop" goto stop  
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="test" goto test
if "%1"=="build" goto build
if "%1"=="help" goto help
goto help

:start
echo.
echo ===============================================
echo  🚀 STARTING ALL SERVICES
echo ===============================================
echo.
echo Starting Dream Analyzer services...
start /min powershell -Command "cd '%~dp0'; pnpm dev"
timeout /t 5 /nobreak >nul
echo ✅ Services started successfully!
goto status

:stop
echo.
echo ===============================================
echo  🛑 STOPPING ALL SERVICES  
echo ===============================================
echo.
echo Stopping all Node.js services...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im tsx.exe >nul 2>&1
echo ✅ All services stopped!
goto end

:restart
echo.
echo ===============================================
echo  🔄 RESTARTING ALL SERVICES
echo ===============================================
echo.
call :stop
timeout /t 3 /nobreak >nul
call :start
goto end

:status
echo.
echo ===============================================
echo  📊 SERVICE STATUS
echo ===============================================
echo.
echo Running Node.js processes:
tasklist /fi "imagename eq node.exe" 2>nul | find /i "node.exe" && echo ✅ Node.js services running || echo ❌ No Node.js services running
echo.
echo Port status:
netstat -an | find ":3001" >nul && echo ✅ API Server (3001): ACTIVE || echo ❌ API Server (3001): INACTIVE
netstat -an | find ":5173" >nul && echo ✅ Web Dev (5173): ACTIVE || echo ❌ Web Dev (5173): INACTIVE
goto end

:test
echo.
echo ===============================================
echo  🧪 RUNNING TESTS
echo ===============================================  
echo.
pnpm test
goto end

:build
echo.
echo ===============================================
echo  🏗️ BUILDING APPLICATION
echo ===============================================
echo.
pnpm build
goto end

:help
echo.
echo ===============================================
echo  DREAM ANALYZER MANAGEMENT SCRIPT
echo ===============================================
echo.
echo Usage: manage.bat [action]
echo.
echo Available actions:
echo   start     🚀 Start all services (API + Web)
echo   stop      🛑 Stop all running services
echo   restart   🔄 Restart all services  
echo   status    📊 Show service status
echo   test      🧪 Run all tests
echo   build     🏗️ Build all applications
echo   help      ❓ Show this help message
echo.
echo Examples:
echo   manage.bat start
echo   manage.bat status
echo   manage.bat restart
echo.

:end