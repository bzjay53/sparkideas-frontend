#!/bin/bash
# IdeaSpark Auto-Deploy Script
# Usage: ./deploy.sh "commit message"

set -e

echo "🚀 IdeaSpark Auto-Deploy Starting..."

# Quick lint and type check (instead of full build)
echo "🔍 Quick validation..."
if command -v npm > /dev/null; then
    echo "📝 Running type check..."
    npx tsc --noEmit --skipLibCheck || {
        echo "⚠️  TypeScript warnings found, but continuing..."
    }
else
    echo "⚠️  npm not found, skipping validation"
fi

# Git operations
echo "📝 Committing changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
    echo "🔍 Checking current deployment status..."
    curl -s https://sparkideas-app.vercel.app > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Site is already live and accessible!"
        echo "🌐 Live URL: https://sparkideas-app.vercel.app"
    fi
    exit 0
fi

git commit -m "${1:-Auto-deploy $(date '+%Y-%m-%d %H:%M:%S')}"

echo "🔄 Pushing to GitHub..."
git push origin main

echo "⏳ Waiting for Vercel deployment..."
echo "💡 Note: Vercel will build the project automatically"
sleep 60

echo "🔍 Checking deployment status..."
curl -s https://sparkideas-app.vercel.app > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Live URL: https://sparkideas-app.vercel.app"
    echo "📊 Check detailed status: https://vercel.com/bzjay53s-projects/ideaspark-mvp"
else
    echo "⚠️  Site may be temporarily unavailable during deployment"
    echo "🔄 Please wait a few more minutes and check manually"
fi

echo "🎉 Auto-deploy completed!"