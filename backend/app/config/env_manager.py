"""
Environment Variables Manager
Secure handling of environment variables and API keys
"""

import os
import base64
import json
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet
import structlog

logger = structlog.get_logger()

class EnvironmentManager:
    """Secure environment variable management"""
    
    def __init__(self):
        self.encryption_key = self._get_or_create_encryption_key()
        self.cipher = Fernet(self.encryption_key)
    
    def _get_or_create_encryption_key(self) -> bytes:
        """Get or create encryption key for sensitive data"""
        key_file = ".env_key"
        
        if os.path.exists(key_file):
            with open(key_file, "rb") as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, "wb") as f:
                f.write(key)
            logger.info("Generated new encryption key for environment variables")
            return key
    
    def encrypt_value(self, value: str) -> str:
        """Encrypt sensitive value"""
        if not value:
            return value
        
        encrypted = self.cipher.encrypt(value.encode())
        return base64.b64encode(encrypted).decode()
    
    def decrypt_value(self, encrypted_value: str) -> str:
        """Decrypt sensitive value"""
        if not encrypted_value:
            return encrypted_value
        
        try:
            decoded = base64.b64decode(encrypted_value.encode())
            decrypted = self.cipher.decrypt(decoded)
            return decrypted.decode()
        except Exception as e:
            logger.error("Failed to decrypt value", error=str(e))
            return encrypted_value
    
    def get_api_keys(self) -> Dict[str, Any]:
        """Get all API keys with security validation"""
        api_keys = {
            # OpenAI
            "openai": {
                "api_key": os.getenv("OPENAI_API_KEY"),
                "model": os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview"),
                "org_id": os.getenv("OPENAI_ORG_ID")
            },
            
            # Reddit
            "reddit": {
                "client_id": os.getenv("REDDIT_CLIENT_ID"),
                "client_secret": os.getenv("REDDIT_CLIENT_SECRET"),
                "username": os.getenv("REDDIT_USERNAME"),
                "password": os.getenv("REDDIT_PASSWORD")
            },
            
            # Google APIs
            "google": {
                "search_api_key": os.getenv("GOOGLE_SEARCH_API_KEY"),
                "search_engine_id": os.getenv("GOOGLE_SEARCH_ENGINE_ID")
            },
            
            # Naver API
            "naver": {
                "client_id": os.getenv("NAVER_CLIENT_ID"),
                "client_secret": os.getenv("NAVER_CLIENT_SECRET")
            },
            
            # Twitter API
            "twitter": {
                "bearer_token": os.getenv("TWITTER_BEARER_TOKEN"),
                "access_token": os.getenv("TWITTER_ACCESS_TOKEN"),
                "access_token_secret": os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
            },
            
            # LinkedIn API
            "linkedin": {
                "client_id": os.getenv("LINKEDIN_CLIENT_ID"),
                "client_secret": os.getenv("LINKEDIN_CLIENT_SECRET")
            },
            
            # Telegram Bot
            "telegram": {
                "bot_token": os.getenv("TELEGRAM_BOT_TOKEN"),
                "chat_id": os.getenv("TELEGRAM_CHAT_ID")
            },
            
            # Supabase
            "supabase": {
                "url": os.getenv("SUPABASE_URL"),
                "anon_key": os.getenv("SUPABASE_KEY"),
                "service_key": os.getenv("SUPABASE_SERVICE_KEY")
            }
        }
        
        # Validate critical API keys
        self._validate_api_keys(api_keys)
        
        return api_keys
    
    def _validate_api_keys(self, api_keys: Dict[str, Any]) -> None:
        """Validate that critical API keys are present"""
        critical_keys = [
            ("openai", "api_key"),
            ("reddit", "client_id"),
            ("google", "search_api_key"),
            ("telegram", "bot_token")
        ]
        
        missing_keys = []
        
        for service, key in critical_keys:
            if not api_keys.get(service, {}).get(key):
                missing_keys.append(f"{service}.{key}")
        
        if missing_keys:
            logger.warning("Missing critical API keys", missing=missing_keys)
        else:
            logger.info("All critical API keys validated successfully")
    
    def mask_sensitive_value(self, value: str, visible_chars: int = 4) -> str:
        """Mask sensitive values for logging"""
        if not value or len(value) <= visible_chars * 2:
            return "***masked***"
        
        return f"{value[:visible_chars]}***{value[-visible_chars:]}"
    
    def get_environment_info(self) -> Dict[str, Any]:
        """Get environment information for debugging"""
        return {
            "environment": os.getenv("ENVIRONMENT", "development"),
            "host": os.getenv("HOST", "0.0.0.0"),
            "port": int(os.getenv("PORT", 8000)),
            "log_level": os.getenv("LOG_LEVEL", "INFO"),
            "cors_origins": os.getenv("CORS_ORIGINS", "[]"),
            "feature_flags": {
                "data_collection": os.getenv("ENABLE_DATA_COLLECTION", "true").lower() == "true",
                "ai_analysis": os.getenv("ENABLE_AI_ANALYSIS", "true").lower() == "true",
                "telegram_bot": os.getenv("ENABLE_TELEGRAM_BOT", "true").lower() == "true",
                "background_tasks": os.getenv("ENABLE_BACKGROUND_TASKS", "true").lower() == "true"
            },
            "background_tasks": {
                "collection_interval_hours": int(os.getenv("COLLECTION_INTERVAL_HOURS", 6)),
                "telegram_digest_time": os.getenv("TELEGRAM_DIGEST_TIME", "09:00")
            }
        }
    
    def export_config_for_vercel(self) -> Dict[str, str]:
        """Export configuration for Vercel deployment"""
        config = {}
        
        # Get all environment variables
        env_vars = dict(os.environ)
        
        # Filter out system variables and include only our app variables
        app_prefixes = [
            "OPENAI_", "REDDIT_", "GOOGLE_", "NAVER_", "TWITTER_", 
            "LINKEDIN_", "TELEGRAM_", "SUPABASE_", "JWT_", 
            "COLLECTION_", "CORS_", "SENTRY_", "ENABLE_"
        ]
        
        for key, value in env_vars.items():
            if any(key.startswith(prefix) for prefix in app_prefixes):
                config[key] = value
        
        # Add essential config
        config.update({
            "ENVIRONMENT": "production",
            "LOG_LEVEL": "INFO",
            "PYTHONPATH": "."
        })
        
        return config
    
    def validate_production_readiness(self) -> Dict[str, Any]:
        """Validate if environment is ready for production"""
        issues = []
        warnings = []
        
        api_keys = self.get_api_keys()
        
        # Check critical services
        critical_services = ["openai", "reddit", "google", "telegram"]
        for service in critical_services:
            service_config = api_keys.get(service, {})
            if not any(service_config.values()):
                issues.append(f"Missing {service} API configuration")
        
        # Check security
        jwt_secret = os.getenv("JWT_SECRET_KEY")
        if not jwt_secret or len(jwt_secret) < 32:
            issues.append("JWT secret key is too weak or missing")
        
        # Check environment settings
        if os.getenv("ENVIRONMENT") != "production":
            warnings.append("Environment is not set to production")
        
        return {
            "ready": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "timestamp": "2025-08-16T00:00:00Z"
        }

# Global environment manager instance
env_manager = EnvironmentManager()