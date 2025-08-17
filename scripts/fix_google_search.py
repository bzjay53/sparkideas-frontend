#!/usr/bin/env python3
"""
Google Search API Fix Tool
Creates a new Custom Search Engine and updates configuration
"""

import os
import sys
import json
from pathlib import Path

def create_google_search_engine_guide():
    """Provide step-by-step guide to create proper Search Engine"""
    
    print("🔧 Google Custom Search Engine Setup Guide")
    print("=" * 50)
    
    print("🎯 Problem: Current Search Engine ID is invalid format")
    print(f"   Current ID: 41d49b56d93b04e02")
    print(f"   Expected format: [project_id]:[engine_id] (with colon)")
    
    print("\n📋 Step-by-Step Fix:")
    print("1. 🌐 Go to Google Custom Search: https://cse.google.com/cse/")
    print("2. 🔑 Sign in with your Google account")
    print("3. ➕ Click 'Add' or 'Create New Search Engine'")
    
    print("\n4. ⚙️ Configuration Settings:")
    print("   📝 Name: 'IdeaSpark Pain Point Search'")
    print("   🌍 Sites to search: 'Search the entire web'")
    print("   🔍 What to search: 'Search the entire web but emphasize included sites'")
    print("   🏷️ Include these sites (optional):")
    print("      - reddit.com/*")
    print("      - stackoverflow.com/*") 
    print("      - medium.com/*")
    print("      - news.ycombinator.com/*")
    
    print("\n5. 🎨 Customization:")
    print("   🖼️ Image search: ON")
    print("   🔒 SafeSearch: OFF or MODERATE")
    print("   🌍 Language: English & Korean")
    print("   📍 Country: No specific country")
    
    print("\n6. 💾 Save and Get Engine ID:")
    print("   ✅ Click 'Create'")
    print("   ⚙️ Go to 'Setup' > 'Basic'")
    print("   📋 Copy 'Search engine ID' (format: xxxxx:yyyyy)")
    
    print("\n7. 🔧 Update Environment Variables:")
    
    # Get the current .env file path
    env_file = Path(__file__).parent.parent / "backend" / ".env"
    
    print(f"   📄 Edit file: {env_file}")
    print("   🔄 Replace line:")
    print("      GOOGLE_SEARCH_ENGINE_ID=41d49b56d93b04e02")
    print("   ➡️ With new line:")
    print("      GOOGLE_SEARCH_ENGINE_ID=your_new_engine_id")
    
    print("\n🚨 Common Issues & Solutions:")
    print("━" * 30)
    
    print("❌ 'Request contains an invalid argument'")
    print("   🔍 Solution: Wrong Engine ID format")
    print("   ✅ Fix: Use format with colon (project:engine)")
    
    print("\n❌ 'API key not valid'")
    print("   🔍 Solution: API key needs Custom Search API enabled")
    print("   ✅ Fix: Go to Google Cloud Console > APIs & Services")
    print("   ➡️ Enable 'Custom Search JSON API'")
    
    print("\n❌ 'Daily Limit Exceeded'")
    print("   🔍 Solution: Free tier = 100 queries/day")
    print("   ✅ Fix: Enable billing for more quota")
    
    print("\n💡 Alternative Solution - Use Different Engine:")
    working_engines = [
        "017576662512468239146:omuauf_lfve",  # Example format
        "000455696194071821846:65dokzqg-r4",  # Another example
    ]
    
    print("   🎯 Try these working engine formats:")
    for engine in working_engines:
        print(f"      {engine}")
    print("   ⚠️ Note: These are examples, create your own!")
    
def test_alternative_approach():
    """Test alternative search approaches"""
    
    print("\n🔄 Alternative Search Methods")
    print("=" * 40)
    
    print("1. 🐍 SerpAPI (Google Search alternative):")
    print("   - More reliable than Custom Search")
    print("   - 100 free queries/month")
    print("   - No complex setup required")
    print("   - URL: https://serpapi.com/")
    
    print("\n2. 🔍 Bing Search API:")
    print("   - Microsoft Cognitive Services")
    print("   - 1000 free queries/month")
    print("   - Easier setup than Google")
    
    print("\n3. 📰 Direct Reddit/News APIs:")
    print("   - Skip Google entirely")
    print("   - Use Reddit API + news aggregators")
    print("   - More focused pain point data")

def generate_fix_script():
    """Generate script to update environment variables"""
    
    env_file = Path(__file__).parent.parent / "backend" / ".env"
    
    script_content = f"""#!/bin/bash
# Google Search Engine ID Fix Script
# Run this after creating a new Custom Search Engine

echo "🔧 Updating Google Search Engine ID..."

# Backup current .env
cp {env_file} {env_file}.backup

# Prompt for new Engine ID
echo "📋 Enter your new Google Custom Search Engine ID:"
echo "   Format should be: project_id:engine_id (with colon)"
echo "   Example: 017576662512468239146:omuauf_lfve"
read -p "Engine ID: " NEW_ENGINE_ID

# Validate format (should contain colon)
if [[ "$NEW_ENGINE_ID" == *":"* ]]; then
    echo "✅ Format looks correct"
    
    # Update .env file
    sed -i "s/GOOGLE_SEARCH_ENGINE_ID=.*/GOOGLE_SEARCH_ENGINE_ID=$NEW_ENGINE_ID/" {env_file}
    
    echo "✅ Updated .env file"
    echo "🧪 Testing new configuration..."
    
    # Test the API
    python {Path(__file__).parent}/validate_api_keys.py
    
else
    echo "❌ Invalid format - Engine ID should contain a colon (:)"
    echo "   Please go to https://cse.google.com/cse/ and create a proper engine"
fi
"""
    
    fix_script_path = Path(__file__).parent / "fix_google_engine_id.sh"
    with open(fix_script_path, 'w') as f:
        f.write(script_content)
    
    # Make executable
    fix_script_path.chmod(0o755)
    
    print(f"\n📜 Fix script created: {fix_script_path}")
    print("🏃 Run it with: ./fix_google_engine_id.sh")

def main():
    """Main function"""
    
    print("🚨 Google Search API Configuration Problem Detected")
    print("=" * 60)
    
    create_google_search_engine_guide()
    test_alternative_approach()
    generate_fix_script()
    
    print("\n🎯 Quick Summary:")
    print("1. 🌐 Create new Custom Search Engine: https://cse.google.com/cse/")
    print("2. 📋 Get proper Engine ID (with colon)")
    print("3. 🔧 Run: ./fix_google_engine_id.sh")
    print("4. 🧪 Test: python validate_api_keys.py")
    
    print("\n💡 Or consider using SerpAPI as alternative!")

if __name__ == "__main__":
    main()