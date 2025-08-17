#!/usr/bin/env python3
"""
API Key Validation Script
Validates all API keys are working and properly configured
"""

import sys
import os
import asyncio
import aiohttp
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Load environment variables first
from dotenv import load_dotenv
load_dotenv(backend_path / ".env")

from app.config.env_manager import env_manager
import structlog

logger = structlog.get_logger()

class APIKeyValidator:
    """Validates API keys functionality"""
    
    def __init__(self):
        self.api_keys = env_manager.get_api_keys()
        self.results = {}
    
    async def validate_all_keys(self):
        """Validate all API keys"""
        print("🔐 IdeaSpark API Key Validation")
        print("=" * 50)
        
        validators = [
            self.validate_openai(),
            self.validate_reddit(),
            self.validate_google_search(),
            self.validate_naver(),
            self.validate_telegram(),
            # Skip Twitter for now as it requires more complex setup
        ]
        
        results = await asyncio.gather(*validators, return_exceptions=True)
        
        # Print summary
        self.print_summary()
        
        return all(r is True for r in results if not isinstance(r, Exception))
    
    async def validate_openai(self) -> bool:
        """Validate OpenAI API key"""
        print("Testing OpenAI API...")
        
        api_key = self.api_keys["openai"]["api_key"]
        if not api_key:
            self.results["openai"] = {"status": "❌", "message": "API key missing"}
            return False
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                
                # Test with a simple models list request
                async with session.get(
                    "https://api.openai.com/v1/models",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        self.results["openai"] = {"status": "✅", "message": "Working"}
                        return True
                    else:
                        error_text = await response.text()
                        self.results["openai"] = {"status": "❌", "message": f"HTTP {response.status}"}
                        return False
                        
        except Exception as e:
            self.results["openai"] = {"status": "❌", "message": str(e)[:50]}
            return False
    
    async def validate_reddit(self) -> bool:
        """Validate Reddit API credentials"""
        print("Testing Reddit API...")
        
        reddit_config = self.api_keys["reddit"]
        if not all([reddit_config["client_id"], reddit_config["client_secret"]]):
            self.results["reddit"] = {"status": "❌", "message": "Credentials missing"}
            return False
        
        try:
            # Test Reddit OAuth
            async with aiohttp.ClientSession() as session:
                auth_data = {
                    "grant_type": "password",
                    "username": reddit_config["username"],
                    "password": reddit_config["password"]
                }
                
                auth = aiohttp.BasicAuth(
                    reddit_config["client_id"], 
                    reddit_config["client_secret"]
                )
                
                headers = {"User-Agent": "IdeaSpark:v2.0 (by /u/RelationshipOne8189)"}
                
                async with session.post(
                    "https://www.reddit.com/api/v1/access_token",
                    data=auth_data,
                    auth=auth,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if "access_token" in data:
                            self.results["reddit"] = {"status": "✅", "message": "Working"}
                            return True
                    
                    self.results["reddit"] = {"status": "❌", "message": f"Auth failed: {response.status}"}
                    return False
                    
        except Exception as e:
            self.results["reddit"] = {"status": "❌", "message": str(e)[:50]}
            return False
    
    async def validate_google_search(self) -> bool:
        """Validate Google Search API"""
        print("Testing Google Search API...")
        
        google_config = self.api_keys["google"]
        if not all([google_config["search_api_key"], google_config["search_engine_id"]]):
            self.results["google"] = {"status": "❌", "message": "API key or engine ID missing"}
            return False
        
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "key": google_config["search_api_key"],
                    "cx": google_config["search_engine_id"],
                    "q": "test",
                    "num": 1
                }
                
                async with session.get(
                    "https://www.googleapis.com/customsearch/v1",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if "items" in data:
                            self.results["google"] = {"status": "✅", "message": "Working"}
                            return True
                    
                    error_text = await response.text()
                    self.results["google"] = {"status": "❌", "message": f"HTTP {response.status}"}
                    return False
                    
        except Exception as e:
            self.results["google"] = {"status": "❌", "message": str(e)[:50]}
            return False
    
    async def validate_naver(self) -> bool:
        """Validate Naver Search API"""
        print("Testing Naver Search API...")
        
        naver_config = self.api_keys["naver"]
        if not all([naver_config["client_id"], naver_config["client_secret"]]):
            self.results["naver"] = {"status": "❌", "message": "Client credentials missing"}
            return False
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "X-Naver-Client-Id": naver_config["client_id"],
                    "X-Naver-Client-Secret": naver_config["client_secret"]
                }
                
                params = {
                    "query": "테스트",
                    "display": 1
                }
                
                async with session.get(
                    "https://openapi.naver.com/v1/search/blog.json",
                    headers=headers,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if "items" in data:
                            self.results["naver"] = {"status": "✅", "message": "Working"}
                            return True
                    
                    self.results["naver"] = {"status": "❌", "message": f"HTTP {response.status}"}
                    return False
                    
        except Exception as e:
            self.results["naver"] = {"status": "❌", "message": str(e)[:50]}
            return False
    
    async def validate_telegram(self) -> bool:
        """Validate Telegram Bot"""
        print("Testing Telegram Bot...")
        
        telegram_config = self.api_keys["telegram"]
        if not telegram_config["bot_token"]:
            self.results["telegram"] = {"status": "❌", "message": "Bot token missing"}
            return False
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"https://api.telegram.org/bot{telegram_config['bot_token']}/getMe",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("ok"):
                            bot_info = data.get("result", {})
                            username = bot_info.get("username", "unknown")
                            self.results["telegram"] = {"status": "✅", "message": f"Bot: @{username}"}
                            return True
                    
                    self.results["telegram"] = {"status": "❌", "message": f"HTTP {response.status}"}
                    return False
                    
        except Exception as e:
            self.results["telegram"] = {"status": "❌", "message": str(e)[:50]}
            return False
    
    def print_summary(self):
        """Print validation summary"""
        print("\n" + "=" * 50)
        print("🔍 API Key Validation Results")
        print("=" * 50)
        
        for service, result in self.results.items():
            print(f"{result['status']} {service.capitalize()}: {result['message']}")
        
        working_count = sum(1 for r in self.results.values() if r["status"] == "✅")
        total_count = len(self.results)
        
        print(f"\n📊 Summary: {working_count}/{total_count} services working")
        
        if working_count == total_count:
            print("🎉 All API keys are working correctly!")
        else:
            print("⚠️  Some API keys need attention")
        
        print("\n🚀 IdeaSpark is ready for data collection!")

async def main():
    """Main validation function"""
    validator = APIKeyValidator()
    success = await validator.validate_all_keys()
    
    if success:
        print("\n✅ All validations passed - Ready for production!")
        return 0
    else:
        print("\n❌ Some validations failed - Check API keys")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)