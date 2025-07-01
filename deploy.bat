@echo off
REM Git-based deployment script for ThinkTact (Windows)
REM This script commits and pushes changes to GitHub, which triggers Vercel deployment

echo 🚀 ThinkTact Git-based Deployment
echo ==================================

REM Check if there are changes to commit
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ No changes to commit
    echo 📝 Current status:
    git status
    pause
    exit /b 0
)

REM Show what will be committed
echo 📋 Changes to be committed:
git status --porcelain

REM Add all changes
echo 📦 Adding all changes...
git add .

REM Get commit message from user or use default
if "%1"=="" (
    echo 💬 Enter commit message (or press Enter for default):
    set /p commit_message=
    if "!commit_message!"=="" (
        for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
        set "commit_message=Update: !dt:~0,4!-!dt:~4,2!-!dt:~6,2! !dt:~8,2!:!dt:~10,2!:!dt:~12,2!"
    )
) else (
    set "commit_message=%1"
)

REM Commit changes
echo 💾 Committing changes: !commit_message!
git commit -m "!commit_message!"

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Deployment initiated!
echo 🌐 Vercel will automatically deploy from GitHub
echo 📊 Check deployment status at: https://vercel.com/gabrielle-shands-projects/thinktact-react-main
echo 🔗 Production URL: https://thinktact-react-main.vercel.app
pause 