@echo off
REM ThinkTact React Production Deployment Script for Windows
REM This script helps deploy the app to Vercel

echo 🚀 Starting ThinkTact React Production Deployment...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI is not installed. Installing now...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Vercel...
    vercel login
)

REM Build the project
echo 📦 Building the project...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment completed!
echo.
echo 📋 Next steps:
echo 1. Set up environment variables in Vercel dashboard:
echo    - BLOB_READ_WRITE_TOKEN
echo    - RESEND_API_KEY
echo 2. Test the production deployment
echo 3. Update your domain settings if needed
echo.
echo 🔗 Check PRODUCTION_SETUP.md for detailed instructions
pause 