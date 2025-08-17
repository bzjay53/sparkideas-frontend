#!/bin/bash
# Google Search Engine ID Fix Script
# Run this after creating a new Custom Search Engine

echo "🔧 Updating Google Search Engine ID..."

# Backup current .env
cp /root/dev/web-services/IdeaSpark/backend/.env /root/dev/web-services/IdeaSpark/backend/.env.backup

# Prompt for new Engine ID
echo "📋 Enter your new Google Custom Search Engine ID:"
echo "   Format should be: project_id:engine_id (with colon)"
echo "   Example: 017576662512468239146:omuauf_lfve"
read -p "Engine ID: " NEW_ENGINE_ID

# Validate format (should contain colon)
if [[ "$NEW_ENGINE_ID" == *":"* ]]; then
    echo "✅ Format looks correct"
    
    # Update .env file
    sed -i "s/GOOGLE_SEARCH_ENGINE_ID=.*/GOOGLE_SEARCH_ENGINE_ID=$NEW_ENGINE_ID/" /root/dev/web-services/IdeaSpark/backend/.env
    
    echo "✅ Updated .env file"
    echo "🧪 Testing new configuration..."
    
    # Test the API
    python /root/dev/web-services/IdeaSpark/scripts/validate_api_keys.py
    
else
    echo "❌ Invalid format - Engine ID should contain a colon (:)"
    echo "   Please go to https://cse.google.com/cse/ and create a proper engine"
fi
