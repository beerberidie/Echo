@echo off
:: ========================================================
:: Echo Voice Recording App Server Launcher
:: ========================================================
:: This script starts the Echo Voice Recording backend server
:: ========================================================

echo.
echo ========================================================
echo    Starting Echo Voice Recording Backend Server
echo ========================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Navigate to server directory
cd server

:: Check if node_modules exists, if not run npm install
if not exist "node_modules\" (
    echo Server dependencies not found. Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install server dependencies.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Server dependencies installed successfully.
    echo.
)

:: Start the server in development mode
echo Starting Echo server in development mode...
echo.
echo Server will be available at http://localhost:5000/
echo.
echo Press Ctrl+C in this window to stop the server when you're done.
echo.

:: Start the development server
call npm run dev

:: This point is reached only if the server is stopped
echo.
echo Server stopped. Thank you for using Echo Voice Recording App.
echo.
pause
