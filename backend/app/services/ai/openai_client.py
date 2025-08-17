"""
OpenAI Client Manager
Vercel-optimized OpenAI GPT-4 client with connection pooling and error handling
"""

import asyncio
import time
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
import structlog

from app.config.settings import settings

logger = structlog.get_logger()

@dataclass
class ModelConfig:
    """OpenAI model configuration"""
    name: str
    max_tokens: int
    temperature: float
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    timeout_seconds: int = 30
    max_retries: int = 3
    
    @classmethod
    def for_analysis(cls) -> 'ModelConfig':
        """Configuration optimized for pain point analysis"""
        return cls(
            name="gpt-4-turbo-preview",
            max_tokens=2000,
            temperature=0.3,  # Lower temperature for consistent analysis
            top_p=0.9,
            frequency_penalty=0.1,
            presence_penalty=0.1,
            timeout_seconds=25,  # Vercel function limit
            max_retries=2
        )
    
    @classmethod
    def for_ideation(cls) -> 'ModelConfig':
        """Configuration optimized for creative idea generation"""
        return cls(
            name="gpt-4-turbo-preview",
            max_tokens=3500,
            temperature=0.8,  # Higher temperature for creativity
            top_p=0.95,
            frequency_penalty=0.2,
            presence_penalty=0.3,
            timeout_seconds=35,
            max_retries=2
        )
    
    @classmethod
    def for_enhancement(cls) -> 'ModelConfig':
        """Configuration optimized for idea enhancement"""
        return cls(
            name="gpt-4-turbo-preview",
            max_tokens=2500,
            temperature=0.6,  # Balanced creativity and consistency
            top_p=0.9,
            frequency_penalty=0.15,
            presence_penalty=0.2,
            timeout_seconds=30,
            max_retries=2
        )

@dataclass
class APIUsageMetrics:
    """Track API usage for optimization"""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    total_tokens_used: int = 0
    total_cost_usd: float = 0.0
    average_response_time: float = 0.0
    last_request_time: Optional[datetime] = None
    rate_limit_hits: int = 0
    
    @property
    def success_rate(self) -> float:
        if self.total_requests == 0:
            return 0.0
        return (self.successful_requests / self.total_requests) * 100
    
    def add_request(self, success: bool, tokens_used: int, response_time: float, cost: float = 0.0):
        """Record API request metrics"""
        self.total_requests += 1
        if success:
            self.successful_requests += 1
        else:
            self.failed_requests += 1
        
        self.total_tokens_used += tokens_used
        self.total_cost_usd += cost
        self.last_request_time = datetime.utcnow()
        
        # Calculate running average
        if self.total_requests == 1:
            self.average_response_time = response_time
        else:
            self.average_response_time = (
                (self.average_response_time * (self.total_requests - 1) + response_time) 
                / self.total_requests
            )

class OpenAIClient:
    """Vercel-optimized OpenAI client with advanced features"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="OpenAIClient")
        self._client = None
        self._client_created_at = None
        self._client_ttl = timedelta(minutes=30)  # Reuse client for 30 minutes
        self.metrics = APIUsageMetrics()
        
        # Rate limiting
        self._request_times: List[float] = []
        self._rate_limit_window = 60.0  # 1 minute window
        self._max_requests_per_minute = 50  # Conservative limit
        
        # Pricing (as of 2024, may need updates)
        self._token_costs = {
            "gpt-4-turbo-preview": {"input": 0.01, "output": 0.03},  # per 1K tokens
            "gpt-4": {"input": 0.03, "output": 0.06},
            "gpt-3.5-turbo": {"input": 0.001, "output": 0.002}
        }
    
    async def _get_client(self):
        """Get OpenAI client with connection reuse"""
        try:
            # Check if we can reuse existing client
            if (self._client and 
                self._client_created_at and 
                datetime.utcnow() - self._client_created_at < self._client_ttl):
                return self._client
            
            # Import OpenAI only when needed (lazy loading for Vercel)
            try:
                from openai import AsyncOpenAI
            except ImportError:
                self.logger.error("OpenAI library not installed")
                return None
            
            # Create new client
            self._client = AsyncOpenAI(
                api_key=settings.openai_api_key,
                timeout=30.0,
                max_retries=2
            )
            
            self._client_created_at = datetime.utcnow()
            
            self.logger.info("OpenAI client initialized successfully")
            return self._client
            
        except Exception as e:
            self.logger.error("Failed to initialize OpenAI client", error=str(e))
            self._client = None
            return None
    
    def _check_rate_limit(self) -> bool:
        """Check if we're within rate limits"""
        current_time = time.time()
        
        # Remove requests older than the window
        self._request_times = [
            req_time for req_time in self._request_times 
            if current_time - req_time < self._rate_limit_window
        ]
        
        # Check if we can make another request
        if len(self._request_times) >= self._max_requests_per_minute:
            self.metrics.rate_limit_hits += 1
            return False
        
        return True
    
    def _calculate_cost(self, model: str, prompt_tokens: int, completion_tokens: int) -> float:
        """Calculate cost for API call"""
        if model not in self._token_costs:
            return 0.0
        
        costs = self._token_costs[model]
        input_cost = (prompt_tokens / 1000) * costs["input"]
        output_cost = (completion_tokens / 1000) * costs["output"]
        
        return input_cost + output_cost
    
    async def complete_chat(
        self, 
        messages: List[Dict[str, str]], 
        config: ModelConfig,
        system_prompt: Optional[str] = None,
        response_format: Optional[str] = "json"
    ) -> Dict[str, Any]:
        """Enhanced chat completion with comprehensive error handling"""
        
        # Rate limiting check
        if not self._check_rate_limit():
            await asyncio.sleep(2)  # Brief delay before retry
            if not self._check_rate_limit():
                raise Exception("Rate limit exceeded, please try again later")
        
        start_time = time.time()
        
        try:
            client = await self._get_client()
            if not client:
                raise Exception("Failed to initialize OpenAI client")
            
            # Prepare messages
            chat_messages = []
            
            # Add system prompt if provided
            if system_prompt:
                chat_messages.append({"role": "system", "content": system_prompt})
            
            # Add conversation messages
            chat_messages.extend(messages)
            
            # Prepare request parameters
            request_params = {
                "model": config.name,
                "messages": chat_messages,
                "max_tokens": config.max_tokens,
                "temperature": config.temperature,
                "top_p": config.top_p,
                "frequency_penalty": config.frequency_penalty,
                "presence_penalty": config.presence_penalty
            }
            
            # Add response format if specified
            if response_format == "json":
                request_params["response_format"] = {"type": "json_object"}
            
            # Record request time for rate limiting
            self._request_times.append(time.time())
            
            # Make API call with timeout
            try:
                response = await asyncio.wait_for(
                    client.chat.completions.create(**request_params),
                    timeout=config.timeout_seconds
                )
            except asyncio.TimeoutError:
                raise Exception(f"OpenAI API call timed out after {config.timeout_seconds} seconds")
            
            response_time = time.time() - start_time
            
            # Extract response data
            choice = response.choices[0]
            content = choice.message.content.strip()
            
            # Calculate token usage and cost
            usage = response.usage
            prompt_tokens = usage.prompt_tokens
            completion_tokens = usage.completion_tokens
            total_tokens = usage.total_tokens
            
            cost = self._calculate_cost(config.name, prompt_tokens, completion_tokens)
            
            # Record metrics
            self.metrics.add_request(True, total_tokens, response_time, cost)
            
            result = {
                "content": content,
                "usage": {
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": total_tokens
                },
                "model": config.name,
                "response_time": response_time,
                "cost_usd": cost,
                "finish_reason": choice.finish_reason
            }
            
            # Parse JSON if expected
            if response_format == "json":
                try:
                    result["parsed_content"] = json.loads(content)
                except json.JSONDecodeError as e:
                    self.logger.warning("Failed to parse JSON response", error=str(e))
                    result["json_parse_error"] = str(e)
            
            self.logger.info(
                "OpenAI API call successful",
                model=config.name,
                tokens=total_tokens,
                cost=cost,
                response_time=response_time
            )
            
            return result
            
        except Exception as e:
            response_time = time.time() - start_time
            self.metrics.add_request(False, 0, response_time)
            
            self.logger.error(
                "OpenAI API call failed",
                error=str(e),
                model=config.name,
                response_time=response_time
            )
            
            return {
                "error": str(e),
                "model": config.name,
                "response_time": response_time
            }
    
    async def analyze_with_retry(
        self,
        messages: List[Dict[str, str]],
        config: ModelConfig,
        system_prompt: Optional[str] = None,
        max_retries: Optional[int] = None
    ) -> Dict[str, Any]:
        """Analyze with automatic retry logic"""
        
        retries = max_retries or config.max_retries
        last_error = None
        
        for attempt in range(retries + 1):
            try:
                result = await self.complete_chat(
                    messages=messages,
                    config=config,
                    system_prompt=system_prompt,
                    response_format="json"
                )
                
                if "error" not in result:
                    return result
                
                last_error = result["error"]
                
                # Don't retry for certain errors
                if "rate limit" in str(last_error).lower():
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                elif "timeout" in str(last_error).lower():
                    # Reduce timeout for retry
                    config.timeout_seconds = max(15, config.timeout_seconds - 5)
                else:
                    break  # Don't retry for other errors
                
            except Exception as e:
                last_error = str(e)
                if attempt < retries:
                    await asyncio.sleep(1 * (attempt + 1))  # Linear backoff
        
        return {"error": f"Failed after {retries + 1} attempts: {last_error}"}
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get comprehensive usage statistics"""
        return {
            "metrics": {
                "total_requests": self.metrics.total_requests,
                "success_rate": self.metrics.success_rate,
                "total_tokens": self.metrics.total_tokens_used,
                "total_cost_usd": round(self.metrics.total_cost_usd, 4),
                "average_response_time": round(self.metrics.average_response_time, 2),
                "rate_limit_hits": self.metrics.rate_limit_hits
            },
            "client_status": {
                "client_active": self._client is not None,
                "client_age_minutes": (
                    (datetime.utcnow() - self._client_created_at).total_seconds() / 60
                    if self._client_created_at else 0
                ),
                "recent_requests": len(self._request_times),
                "rate_limit_available": self._max_requests_per_minute - len(self._request_times)
            }
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check with minimal API call"""
        try:
            simple_config = ModelConfig(
                name="gpt-3.5-turbo",  # Cheaper model for health check
                max_tokens=10,
                temperature=0.1,
                timeout_seconds=10
            )
            
            result = await self.complete_chat(
                messages=[{"role": "user", "content": "Respond with just 'OK'"}],
                config=simple_config,
                response_format=None
            )
            
            return {
                "status": "healthy" if "error" not in result else "unhealthy",
                "response_time": result.get("response_time", 0),
                "error": result.get("error")
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }

# Global client instance
_openai_client = None

def get_openai_client() -> OpenAIClient:
    """Get global OpenAI client instance"""
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAIClient()
    return _openai_client