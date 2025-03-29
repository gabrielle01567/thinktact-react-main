#!/bin/bash

# Make sure the script exits on any error
set -e

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Pushing ThinkTactAI to GitHub...${NC}"

# Check if git is initialized
if [ ! -d .git ]; then
  echo -e "${GREEN}Initializing git repository...${NC}"
  git init
  git add .
  git commit -m "Initial commit"
fi

# Check if remote is set
if ! git remote | grep -q "origin"; then
  echo -e "${GREEN}Adding GitHub remote...${NC}"
  git remote add origin https://github.com/gabrielle01567/thinktact-react-main.git
fi

# Make script executable
chmod +x push-to-github.sh

# Build the app
echo -e "${GREEN}Building the application...${NC}"
npm run build

# Add all changes
echo -e "${GREEN}Adding changes to git...${NC}"
git add .

# Commit changes
echo -e "${GREEN}Committing changes...${NC}"
echo -e "${YELLOW}Enter commit message:${NC}"
read commit_message

if [ -z "$commit_message" ]; then
  commit_message="Update application"
fi

git commit -m "$commit_message"

# Push to GitHub
echo -e "${GREEN}Pushing to GitHub...${NC}"
git push -u origin main || git push -u origin master

echo -e "${GREEN}Done! Your changes have been pushed to GitHub.${NC}"
echo -e "${YELLOW}Vercel will automatically deploy the changes.${NC}" 