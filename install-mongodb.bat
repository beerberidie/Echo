@echo off
:: ========================================================
:: MongoDB Installation Guide for Echo Voice Recording App
:: ========================================================
:: This script provides instructions for installing MongoDB
:: ========================================================

echo.
echo ========================================================
echo    MongoDB Installation Guide for Echo Voice Recording App
echo ========================================================
echo.
echo This script will guide you through the process of installing MongoDB,
echo which is required for the Echo Voice Recording App backend.
echo.
echo Steps to install MongoDB:
echo.
echo 1. Download MongoDB Community Server from:
echo    https://www.mongodb.com/try/download/community
echo.
echo 2. Run the installer and follow the installation wizard.
echo    - Choose "Complete" installation
echo    - Install MongoDB as a service
echo    - Keep the default data directory (C:\data\db)
echo.
echo 3. After installation, MongoDB should start automatically as a Windows service.
echo.
echo 4. To verify the installation, open a new command prompt and run:
echo    mongosh
echo.
echo 5. If MongoDB is running correctly, you should see the MongoDB shell.
echo.
echo 6. Once MongoDB is installed and running, you can start the Echo Voice Recording App backend.
echo.
echo ========================================================
echo.
echo Would you like to open the MongoDB download page now?
echo.
choice /C YN /M "Open MongoDB download page (Y/N)?"

if %ERRORLEVEL% EQU 1 (
    start https://www.mongodb.com/try/download/community
)

echo.
echo Once MongoDB is installed, you can run the start-echo-server.bat script to start the backend.
echo.
pause
