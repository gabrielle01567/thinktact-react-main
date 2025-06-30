#!/bin/bash

# ThinkTact React Production Deployment Script
# This script helps deploy the app to Vercel

echo "🚀 Starting ThinkTact React Production Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard:"
echo "   - BLOB_READ_WRITE_TOKEN"
echo "   - RESEND_API_KEY"
echo "2. Test the production deployment"
echo "3. Update your domain settings if needed"
echo ""
echo "🔗 Check PRODUCTION_SETUP.md for detailed instructions" 