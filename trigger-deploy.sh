#!/bin/bash
# Vercel Deploy Hook Trigger
# Usage: ./trigger-deploy.sh

echo "🚀 Triggering Vercel deployment via Deploy Hook..."

# Deploy Hook URL (나중에 Vercel Dashboard에서 생성)
DEPLOY_HOOK_URL=""

if [ -z "$DEPLOY_HOOK_URL" ]; then
    echo "⚠️  Deploy Hook URL not configured"
    echo "📋 To create a Deploy Hook:"
    echo "   1. Go to https://vercel.com/bzjay53s-projects/ideaspark-mvp/settings/git"
    echo "   2. Click 'Create Hook'"
    echo "   3. Name: 'Manual Deploy'"
    echo "   4. Branch: 'main'"
    echo "   5. Copy URL and update this script"
    echo ""
    echo "🔄 Falling back to git push method..."
    
    # Fallback: Create a timestamp commit to trigger deployment
    echo "# Force Deploy - $(date)" >> FORCE_DEPLOY.md
    git add FORCE_DEPLOY.md
    git commit -m "deploy: force deployment $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    
    echo "✅ Git push completed"
    echo "⏳ Please wait 2-3 minutes for Vercel to detect and deploy"
    
else
    # Use Deploy Hook
    echo "📡 Calling Deploy Hook..."
    response=$(curl -X POST "$DEPLOY_HOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{"ref": "main"}' \
        -w "%{http_code}" \
        -s -o /tmp/deploy_response.json)
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo "✅ Deployment triggered successfully!"
        echo "📊 Response: $(cat /tmp/deploy_response.json)"
        echo "⏳ Deployment will start shortly"
    else
        echo "❌ Deploy Hook failed (HTTP $response)"
        echo "📄 Response: $(cat /tmp/deploy_response.json)"
        echo "🔄 Falling back to git push..."
        
        # Fallback method
        echo "# Force Deploy - $(date)" >> FORCE_DEPLOY.md
        git add FORCE_DEPLOY.md
        git commit -m "deploy: force deployment $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
    fi
fi

echo "🌐 Live URL: https://sparkideas-app.vercel.app"
echo "📊 Monitor: https://vercel.com/bzjay53s-projects/ideaspark-mvp"
echo "🎉 Deploy trigger completed!"