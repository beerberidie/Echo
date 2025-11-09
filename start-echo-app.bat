@echo off
:: ========================================================
:: Echo Voice Recording App Launcher
:: ========================================================
:: This script starts the Echo Voice Recording application
:: by launching the Vite development server and opening
:: the application in the default web browser.
:: ========================================================

echo.
echo ========================================================
echo    Starting Echo Voice Recording Application
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

:: Check if node_modules exists, if not run npm install
if not exist "node_modules\" (
    echo Node modules not found. Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install dependencies.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully.
    echo.
)

:: Start the Vite development server
echo Starting Vite development server...
echo.
echo The application will open in your default browser automatically.
echo Server will be available at http://127.0.0.1:5004/
echo.
echo Press Ctrl+C in this window to stop the server when you're done.
echo.

:: Start the development server
:: The --open flag will automatically open the browser
call npm run dev -- --open

:: This point is reached only if the server is stopped
echo.
echo Server stopped. Thank you for using Echo Voice Recording App.
echo.
pause
