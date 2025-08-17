"""
Application Settings with Enhanced Security
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os
import structlog
from .env_manager import env_manager

logger = structlog.get_logger()

class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    # API Configuration
    api_title: str = "IdeaSpark API"
    api_version: str = "2.0.0"
    api_prefix: str = "/api/v1"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Security
    secret_key: str = "ideaSpark_super_secret_jwt_key_2025"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS & Security
    cors_origins: List[str] = [
        "http://localhost:3300",
        "http://localhost:8000", 
        "https://*.vercel.app",
        "https://ideaSpark-frontend.vercel.app"
    ]
    allowed_hosts: List[str] = ["*"]
    
    # Database (Supabase)
    supabase_url: str = "https://your-project-ref.supabase.co"
    supabase_key: str = "your_anon_key"
    supabase_service_key: str = "your_service_role_key"
    database_url: Optional[str] = None
    
    # External APIs
    openai_api_key: str = ""
    openai_model: str = "gpt-4-turbo-preview"
    
    # Reddit API
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_username: str = ""
    reddit_password: str = ""
    
    # Twitter API
    twitter_bearer_token: str = ""
    twitter_access_token: str = ""
    twitter_access_token_secret: str = ""
    
    # Google Search API
    google_search_api_key: str = ""
    google_search_engine_id: str = ""
    
    # Naver Search API
    naver_client_id: str = ""
    naver_client_secret: str = ""
    
    # LinkedIn API
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""
    
    # Telegram Bot
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    
    # Redis (for Celery)
    redis_url: str = "redis://localhost:6379/0"
    
    # Data Collection Settings
    collection_interval_hours: int = 6
    pain_points_per_source: int = 50
    ai_analysis_batch_size: int = 10
    telegram_digest_time: str = "09:00"  # 24-hour format
    
    # Cron Security (for Vercel cron jobs)
    cron_secret: str = "ideaSpark_cron_secret_2025"
    
    # Performance Settings
    max_concurrent_requests: int = 10
    request_timeout_seconds: int = 30
    
    # Pipeline Settings (Vercel optimized)
    pipeline_max_execution_minutes: int = 10
    pipeline_memory_limit_mb: int = 800
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    enable_metrics: bool = True
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Create settings instance
settings = Settings()

# Load from environment variables if available
def load_from_env():
    """Load API keys from environment variables"""
    env_mappings = {
        'OPENAI_API_KEY': 'openai_api_key',
        'REDDIT_CLIENT_ID': 'reddit_client_id',
        'REDDIT_CLIENT_SECRET': 'reddit_client_secret',
        'REDDIT_USERNAME': 'reddit_username',
        'REDDIT_PASSWORD': 'reddit_password',
        'TWITTER_BEARER_TOKEN': 'twitter_bearer_token',
        'TWITTER_ACCESS_TOKEN': 'twitter_access_token',
        'TWITTER_ACCESS_TOKEN_SECRET': 'twitter_access_token_secret',
        'GOOGLE_SEARCH_API_KEY': 'google_search_api_key',
        'GOOGLE_SEARCH_ENGINE_ID': 'google_search_engine_id',
        'NAVER_CLIENT_ID': 'naver_client_id',
        'NAVER_CLIENT_SECRET': 'naver_client_secret',
        'LINKEDIN_CLIENT_ID': 'linkedin_client_id',
        'LINKEDIN_CLIENT_SECRET': 'linkedin_client_secret',
        'TELEGRAM_BOT_TOKEN': 'telegram_bot_token',
        'TELEGRAM_CHAT_ID': 'telegram_chat_id',
        'SUPABASE_URL': 'supabase_url',
        'SUPABASE_KEY': 'supabase_key',
        'SUPABASE_SERVICE_KEY': 'supabase_service_key',
    }
    
    for env_var, setting_name in env_mappings.items():
        value = os.getenv(env_var)
        if value:
            setattr(settings, setting_name, value)

# Load environment variables with security validation
load_from_env()

# Validate API keys on startup
api_keys = env_manager.get_api_keys()
env_info = env_manager.get_environment_info()

logger.info("Settings loaded successfully", 
           environment=env_info["environment"],
           port=env_info["port"],
           features=env_info["feature_flags"])