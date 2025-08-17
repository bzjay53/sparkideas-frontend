#!/bin/bash
# IdeaSpark Auto-Deploy Script
# Usage: ./deploy.sh "commit message"

set -e

echo "🚀 IdeaSpark Auto-Deploy Starting..."

# Build check
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting deployment."
    exit 1
fi

echo "✅ Build successful!"

# Git operations
echo "📝 Committing changes..."
git add .
git commit -m "${1:-Auto-deploy $(date '+%Y-%m-%d %H:%M:%S')}"

echo "🔄 Pushing to GitHub..."
git push origin main

echo "⏳ Waiting for Vercel deployment..."
sleep 45

echo "🔍 Checking deployment status..."
curl -s https://sparkideas-app.vercel.app > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Live URL: https://sparkideas-app.vercel.app"
else
    echo "⚠️  Deployment may still be in progress"
fi

echo "🎉 Auto-deploy completed!"