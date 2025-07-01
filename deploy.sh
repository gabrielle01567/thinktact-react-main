#!/bin/bash

# Git-based deployment script for ThinkTact
# This script commits and pushes changes to GitHub, which triggers Vercel deployment

echo "🚀 ThinkTact Git-based Deployment"
echo "=================================="

# Check if there are changes to commit
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ No changes to commit"
    echo "📝 Current status:"
    git status
    exit 0
fi

# Show what will be committed
echo "📋 Changes to be committed:"
git status --porcelain

# Add all changes
echo "📦 Adding all changes..."
git add .

# Get commit message from user or use default
if [ -z "$1" ]; then
    echo "💬 Enter commit message (or press Enter for default):"
    read commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
else
    commit_message="$1"
fi

# Commit changes
echo "💾 Committing changes: $commit_message"
git commit -m "$commit_message"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated!"
echo "🌐 Vercel will automatically deploy from GitHub"
echo "📊 Check deployment status at: https://vercel.com/gabrielle-shands-projects/thinktact-react-main"
echo "🔗 Production URL: https://thinktact-react-main.vercel.app" 