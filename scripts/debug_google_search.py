#!/usr/bin/env python3
"""
Google Search API Debug Tool
Diagnoses Google Custom Search Engine configuration issues
"""

import requests
import json
import sys
from pathlib import Path

# Load environment variables
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

import os

class GoogleSearchDebugger:
    """Debug Google Search API configuration"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        self.engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
        
    def check_api_key_format(self):
        """Check if API key format is valid"""
        print("🔑 Checking API Key Format...")
        
        if not self.api_key:
            print("❌ API key missing")
            return False
            
        if not self.api_key.startswith("AIza"):
            print(f"❌ Invalid API key format: {self.api_key[:10]}...")
            print("   Google API keys should start with 'AIza'")
            return False
            
        if len(self.api_key) < 30:
            print(f"❌ API key too short: {len(self.api_key)} characters")
            return False
            
        print(f"✅ API key format looks valid: {self.api_key[:10]}...{self.api_key[-4:]}")
        return True
        
    def check_engine_id_format(self):
        """Check if Custom Search Engine ID format is valid"""
        print("\n🎯 Checking Search Engine ID Format...")
        
        if not self.engine_id:
            print("❌ Search Engine ID missing")
            return False
            
        # Engine IDs are typically 17 characters long
        if len(self.engine_id) < 10:
            print(f"❌ Engine ID too short: {self.engine_id}")
            return False
            
        print(f"✅ Engine ID format looks valid: {self.engine_id}")
        return True
        
    def test_api_quota(self):
        """Test if API has remaining quota"""
        print("\n📊 Testing API Quota...")
        
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": self.api_key,
            "cx": self.engine_id,
            "q": "hello",
            "num": 1
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ API call successful!")
                print(f"   Total results: {data.get('searchInformation', {}).get('totalResults', 'unknown')}")
                return True
                
            elif response.status_code == 400:
                error_data = response.json()
                print("❌ Bad Request (400)")
                print(f"   Error: {error_data.get('error', {}).get('message', 'Unknown error')}")
                
                # Check for specific error reasons
                errors = error_data.get('error', {}).get('errors', [])
                for error in errors:
                    reason = error.get('reason', '')
                    if reason == 'invalid':
                        print("   🔍 Likely cause: Invalid Search Engine ID")
                    elif reason == 'keyInvalid':
                        print("   🔍 Likely cause: Invalid API Key")
                    elif reason == 'dailyLimitExceeded':
                        print("   🔍 Likely cause: Daily quota exceeded")
                        
                return False
                
            elif response.status_code == 403:
                print("❌ Forbidden (403)")
                print("   🔍 Likely causes:")
                print("     - API key not enabled for Custom Search")
                print("     - Daily quota exceeded")
                print("     - Billing not enabled")
                return False
                
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False
                
        except Exception as e:
            print(f"❌ Request failed: {str(e)}")
            return False
            
    def check_search_engine_config(self):
        """Check Search Engine configuration"""
        print("\n⚙️ Search Engine Configuration Guidelines...")
        
        print("📋 Required Settings for Custom Search Engine:")
        print("   1. Go to: https://cse.google.com/cse/")
        print("   2. Create New Search Engine or Edit Existing")
        print("   3. Configuration Requirements:")
        print("      ✓ Search the entire web: ON")
        print("      ✓ Image search: ON (optional)")
        print("      ✓ SafeSearch: OFF or MODERATE")
        print("   4. Get Search Engine ID from:")
        print("      Settings > Basic > Search engine ID")
        
        print(f"\n🎯 Current Engine ID: {self.engine_id}")
        print("   Expected format: 17 characters (letters, numbers, colons)")
        
    def provide_troubleshooting_steps(self):
        """Provide step-by-step troubleshooting"""
        print("\n🛠️ Troubleshooting Steps:")
        print("=" * 50)
        
        print("1. 🔑 API Key Issues:")
        print("   - Go to: https://console.cloud.google.com/apis/credentials")
        print("   - Create API Key or check existing one")
        print("   - Enable 'Custom Search API' service")
        print("   - Set restrictions (HTTP referrers or IP addresses)")
        
        print("\n2. 🎯 Search Engine Issues:")
        print("   - Go to: https://cse.google.com/cse/")
        print("   - Check if Search Engine ID is correct")
        print("   - Verify 'Search the entire web' is enabled")
        print("   - Check if engine is active")
        
        print("\n3. 💰 Billing & Quota:")
        print("   - Enable billing in Google Cloud Console")
        print("   - Check daily quota: 100 queries/day (free)")
        print("   - Monitor usage in API console")
        
        print("\n4. 🔧 Quick Fix Commands:")
        print("   # Test with curl:")
        print(f'   curl "https://www.googleapis.com/customsearch/v1?key={self.api_key[:10]}...&cx={self.engine_id}&q=test&num=1"')
        
    def run_full_diagnosis(self):
        """Run complete diagnosis"""
        print("🔍 Google Search API Full Diagnosis")
        print("=" * 50)
        
        key_ok = self.check_api_key_format()
        engine_ok = self.check_engine_id_format()
        
        if key_ok and engine_ok:
            quota_ok = self.test_api_quota()
            
            if quota_ok:
                print("\n🎉 All checks passed! Google Search API is working.")
                return True
            else:
                self.check_search_engine_config()
                self.provide_troubleshooting_steps()
                return False
        else:
            print("\n❌ Basic configuration issues found.")
            self.provide_troubleshooting_steps()
            return False

def main():
    debugger = GoogleSearchDebugger()
    success = debugger.run_full_diagnosis()
    
    if success:
        print("\n✅ Diagnosis complete - API ready to use!")
        return 0
    else:
        print("\n❌ Issues found - Check troubleshooting steps above")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)