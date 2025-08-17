"""
Business Idea Generator
AI-powered business idea generation with 92% accuracy target
"""

import asyncio
import time
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
import structlog

from .openai_client import get_openai_client, ModelConfig
from .prompt_engine import get_prompt_engine
from .quality_scorer import get_quality_scorer
from .idea_optimizer import get_idea_optimizer
from app.services.database import DatabaseService

logger = structlog.get_logger()

@dataclass
class IdeaGenerationRequest:
    """Request for business idea generation"""
    pain_points: List[Dict[str, Any]]
    target_market: Optional[str] = None
    industry_focus: Optional[str] = None
    complexity_preference: Optional[str] = "medium"  # low, medium, high
    innovation_level: Optional[str] = "balanced"  # conservative, balanced, innovative
    market_size_target: Optional[str] = "medium"  # small, medium, large
    
@dataclass 
class GeneratedIdea:
    """Generated business idea with comprehensive analysis"""
    id: str
    title: str
    description: str
    target_market: str
    revenue_model: str
    market_size: str
    implementation_difficulty: int
    confidence_score: int
    competitive_advantage: str
    mvp_timeline: str
    initial_investment: str
    ai_analysis: Dict[str, Any]
    quality_scores: Dict[str, float]
    pain_point_ids: List[str]
    generated_at: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def is_high_quality(self) -> bool:
        """Check if idea meets high quality standards"""
        return (self.confidence_score >= 80 and
                self.quality_scores.get("overall_score", 0) >= 0.85 and
                self.quality_scores.get("feasibility_score", 0) >= 0.75)
    
    @property
    def investment_category(self) -> str:
        """Categorize investment level"""
        investment_text = self.initial_investment.lower()
        if any(word in investment_text for word in ["천만", "억", "million", "10m"]):
            return "high"
        elif any(word in investment_text for word in ["백만", "천만", "100k", "1m"]):
            return "medium"
        else:
            return "low"

@dataclass
class IdeaGenerationMetrics:
    """Track idea generation performance"""
    total_requests: int = 0
    successful_generations: int = 0
    high_quality_ideas: int = 0
    failed_generations: int = 0
    average_generation_time: float = 0.0
    average_confidence_score: float = 0.0
    total_generation_time: float = 0.0
    
    @property
    def success_rate(self) -> float:
        if self.total_requests == 0:
            return 0.0
        return (self.successful_generations / self.total_requests) * 100
    
    @property
    def high_quality_rate(self) -> float:
        if self.successful_generations == 0:
            return 0.0
        return (self.high_quality_ideas / self.successful_generations) * 100
    
    def add_result(self, success: bool, generation_time: float, confidence_score: int = 0, is_high_quality: bool = False):
        """Add generation result to metrics"""
        self.total_requests += 1
        self.total_generation_time += generation_time
        
        if success:
            self.successful_generations += 1
            if is_high_quality:
                self.high_quality_ideas += 1
            
            # Update running averages
            self.average_generation_time = self.total_generation_time / self.successful_generations
            
            # Update confidence score average
            total_confidence = (self.average_confidence_score * (self.successful_generations - 1) + confidence_score)
            self.average_confidence_score = total_confidence / self.successful_generations
        else:
            self.failed_generations += 1

class IdeaGenerator:
    """Advanced business idea generator with 92% accuracy target"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="IdeaGenerator")
        self.openai_client = get_openai_client()
        self.prompt_engine = get_prompt_engine()
        self.quality_scorer = get_quality_scorer()
        self.idea_optimizer = get_idea_optimizer()
        self.metrics = IdeaGenerationMetrics()
        
        # Quality thresholds for 92% accuracy target
        self.min_confidence_score = 75
        self.target_accuracy = 0.92
        self.min_quality_threshold = 0.85
        
        # Generation configuration
        self.max_concurrent_generations = 3  # Vercel memory limit
        self.generation_timeout = 45  # seconds (longer for creative tasks)
        self.retry_attempts = 2
        
        # Idea enhancement levels
        self.enhancement_levels = {
            "basic": {"detail_level": 1, "analysis_depth": "shallow"},
            "standard": {"detail_level": 2, "analysis_depth": "medium"},
            "comprehensive": {"detail_level": 3, "analysis_depth": "deep"}
        }
    
    async def generate_business_idea(self, request: IdeaGenerationRequest, enhancement_level: str = "standard") -> GeneratedIdea:
        """Generate single business idea with comprehensive analysis"""
        start_time = time.time()
        
        try:
            # Prepare pain points data for analysis
            pain_points_summary = self._analyze_pain_points_patterns(request.pain_points)
            
            # Prepare generation variables
            variables = {
                "pain_points_list": self._format_pain_points_for_prompt(request.pain_points),
                "primary_categories": pain_points_summary["primary_categories"],
                "avg_business_potential": pain_points_summary["avg_business_potential"],
                "market_size_summary": pain_points_summary["market_size_summary"],
                "target_market_hint": request.target_market or "자동 분석됨",
                "industry_focus": request.industry_focus or "범용",
                "complexity_preference": request.complexity_preference,
                "innovation_level": request.innovation_level
            }
            
            # Render prompt for idea generation
            prompt_data = self.prompt_engine.render_prompt("business_idea_generation", variables)
            
            # Configure AI model for creative generation
            config = ModelConfig.for_ideation()
            
            # Generate idea with retry logic
            ai_result = await self.openai_client.analyze_with_retry(
                messages=[{"role": "user", "content": prompt_data["user_prompt"]}],
                config=config,
                system_prompt=prompt_data["system_prompt"],
                max_retries=self.retry_attempts
            )
            
            generation_time = time.time() - start_time
            
            if "error" in ai_result:
                raise Exception(f"AI idea generation failed: {ai_result['error']}")
            
            # Extract and validate idea data
            idea_data = ai_result.get("parsed_content", {})
            if not idea_data and "content" in ai_result:
                try:
                    idea_data = json.loads(ai_result["content"])
                except json.JSONDecodeError:
                    raise Exception("Failed to parse AI response as JSON")
            
            # Validate response against schema
            validation_results = self.prompt_engine.validate_response("business_idea_generation", idea_data)
            
            if not validation_results.get("valid", False):
                raise Exception(f"Generated idea failed validation: {validation_results}")
            
            # Calculate quality scores using quality scorer
            quality_scores = await self.quality_scorer.score_business_idea(idea_data, request.pain_points)
            
            # Create structured idea object
            idea = GeneratedIdea(
                id=f"idea_{int(time.time())}_{hash(idea_data.get('title', ''))%10000:04d}",
                title=idea_data.get("title", ""),
                description=idea_data.get("description", ""),
                target_market=idea_data.get("target_market", ""),
                revenue_model=idea_data.get("revenue_model", ""),
                market_size=idea_data.get("market_size", "medium"),
                implementation_difficulty=idea_data.get("implementation_difficulty", 3),
                confidence_score=idea_data.get("confidence_score", 0),
                competitive_advantage=idea_data.get("competitive_advantage", ""),
                mvp_timeline=idea_data.get("mvp_timeline", ""),
                initial_investment=idea_data.get("initial_investment", ""),
                ai_analysis=idea_data.get("ai_analysis", {}),
                quality_scores=quality_scores,
                pain_point_ids=[pp["id"] for pp in request.pain_points]
            )
            
            # Enhance idea if requested
            if enhancement_level in ["standard", "comprehensive"]:
                idea = await self._enhance_idea_analysis(idea, enhancement_level)
            
            # Apply 92% accuracy optimization
            if idea.confidence_score > 0:
                idea = await self._apply_92_percent_optimization(idea, request.pain_points)
            
            # Update metrics
            self.metrics.add_result(
                success=True,
                generation_time=generation_time,
                confidence_score=idea.confidence_score,
                is_high_quality=idea.is_high_quality
            )
            
            self.logger.info("Business idea generated successfully",
                           idea_id=idea.id,
                           confidence_score=idea.confidence_score,
                           quality_score=idea.quality_scores.get("overall_score", 0),
                           generation_time=generation_time)
            
            return idea
            
        except Exception as e:
            generation_time = time.time() - start_time
            
            # Create error idea object
            error_idea = GeneratedIdea(
                id=f"error_{int(time.time())}",
                title="생성 실패",
                description=f"아이디어 생성 중 오류가 발생했습니다: {str(e)}",
                target_market="알 수 없음",
                revenue_model="알 수 없음",
                market_size="unknown",
                implementation_difficulty=5,
                confidence_score=0,
                competitive_advantage="",
                mvp_timeline="",
                initial_investment="",
                ai_analysis={"error": str(e)},
                quality_scores={"overall_score": 0.0, "error": True},
                pain_point_ids=[pp.get("id", "") for pp in request.pain_points]
            )
            
            self.metrics.add_result(False, generation_time)
            
            self.logger.error("Business idea generation failed",
                            error=str(e),
                            generation_time=generation_time)
            
            return error_idea
    
    async def generate_ideas_batch(self, requests: List[IdeaGenerationRequest], enhancement_level: str = "standard") -> List[GeneratedIdea]:
        """Generate multiple business ideas with controlled concurrency"""
        if not requests:
            return []
        
        self.logger.info("Starting batch idea generation", count=len(requests))
        
        # Process in batches to respect Vercel memory limits
        batch_size = min(self.max_concurrent_generations, len(requests))
        results = []
        
        for i in range(0, len(requests), batch_size):
            batch = requests[i:i + batch_size]
            
            # Process batch concurrently
            batch_tasks = [self.generate_business_idea(req, enhancement_level) for req in batch]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Handle results and exceptions
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    error_idea = GeneratedIdea(
                        id=f"batch_error_{i}_{j}",
                        title="배치 처리 실패",
                        description=f"배치 처리 중 오류 발생: {str(result)}",
                        target_market="알 수 없음",
                        revenue_model="알 수 없음",
                        market_size="unknown",
                        implementation_difficulty=5,
                        confidence_score=0,
                        competitive_advantage="",
                        mvp_timeline="",
                        initial_investment="",
                        ai_analysis={"batch_error": str(result)},
                        quality_scores={"overall_score": 0.0, "batch_error": True},
                        pain_point_ids=[]
                    )
                    results.append(error_idea)
                else:
                    results.append(result)
            
            # Brief pause between batches for Vercel optimization
            if i + batch_size < len(requests):
                await asyncio.sleep(1)
        
        # Log batch completion
        successful = sum(1 for r in results if r.confidence_score > 0)
        high_quality = sum(1 for r in results if r.is_high_quality)
        
        self.logger.info("Batch idea generation completed",
                        total=len(results),
                        successful=successful,
                        high_quality=high_quality,
                        success_rate=f"{(successful/len(results)*100):.1f}%",
                        high_quality_rate=f"{(high_quality/successful*100):.1f}%" if successful > 0 else "0%")
        
        return results
    
    async def store_generated_ideas(self, ideas: List[GeneratedIdea]) -> Dict[str, Any]:
        """Store generated ideas in database"""
        stored_count = 0
        error_count = 0
        
        for idea in ideas:
            try:
                if idea.confidence_score > 0:  # Only store successful generations
                    # Prepare idea data for database
                    idea_data = {
                        "title": idea.title,
                        "description": idea.description,
                        "target_market": idea.target_market,
                        "revenue_model": idea.revenue_model,
                        "market_size": idea.market_size,
                        "implementation_difficulty": idea.implementation_difficulty,
                        "confidence_score": idea.confidence_score,
                        "competitive_advantage": idea.competitive_advantage,
                        "mvp_timeline": idea.mvp_timeline,
                        "initial_investment": idea.initial_investment,
                        "ai_analysis": idea.ai_analysis,
                        "quality_scores": idea.quality_scores,
                        "pain_point_ids": idea.pain_point_ids,
                        "generated_at": idea.generated_at.isoformat(),
                        "is_high_quality": idea.is_high_quality,
                        "investment_category": idea.investment_category
                    }
                    
                    # Store in database
                    await DatabaseService.create_business_idea(idea_data)
                    stored_count += 1
                
            except Exception as e:
                error_count += 1
                self.logger.error("Failed to store generated idea",
                                idea_id=idea.id,
                                error=str(e))
        
        return {
            "stored": stored_count,
            "errors": error_count,
            "total": len(ideas)
        }
    
    def _analyze_pain_points_patterns(self, pain_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze patterns in pain points for better idea generation"""
        if not pain_points:
            return {
                "primary_categories": "general",
                "avg_business_potential": 0.5,
                "market_size_summary": "medium"
            }
        
        # Extract categories
        categories = [pp.get("category", "general") for pp in pain_points]
        category_counts = {}
        for cat in categories:
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        primary_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        primary_categories_text = ", ".join([cat[0] for cat in primary_categories])
        
        # Calculate average business potential
        potentials = [pp.get("business_potential", 0.5) for pp in pain_points if pp.get("business_potential")]
        avg_potential = sum(potentials) / len(potentials) if potentials else 0.5
        
        # Determine market size summary
        market_sizes = [pp.get("market_size", "medium") for pp in pain_points]
        large_count = market_sizes.count("large")
        medium_count = market_sizes.count("medium")
        
        if large_count > len(market_sizes) * 0.5:
            market_size_summary = "large"
        elif medium_count > len(market_sizes) * 0.5:
            market_size_summary = "medium"
        else:
            market_size_summary = "mixed"
        
        return {
            "primary_categories": primary_categories_text,
            "avg_business_potential": round(avg_potential, 2),
            "market_size_summary": market_size_summary,
            "pain_points_count": len(pain_points),
            "category_distribution": category_counts
        }
    
    def _format_pain_points_for_prompt(self, pain_points: List[Dict[str, Any]]) -> str:
        """Format pain points for prompt template"""
        formatted_points = []
        
        for i, pp in enumerate(pain_points[:10], 1):  # Limit to 10 for prompt size
            title = pp.get("title", "제목 없음")
            content = pp.get("content", "내용 없음")[:200]  # Truncate long content
            source = pp.get("source", "출처 불명")
            sentiment = pp.get("sentiment_score", 0.0)
            business_potential = pp.get("business_potential", 0.0)
            
            formatted_points.append(
                f"{i}. [{title}]\n"
                f"   내용: {content}\n"
                f"   출처: {source}\n"
                f"   감정점수: {sentiment:.2f}, 비즈니스잠재력: {business_potential:.2f}\n"
            )
        
        return "\n".join(formatted_points)
    
    async def _enhance_idea_analysis(self, idea: GeneratedIdea, enhancement_level: str) -> GeneratedIdea:
        """Enhance idea with deeper analysis"""
        try:
            if enhancement_level not in self.enhancement_levels:
                return idea
            
            # Prepare enhancement variables
            variables = {
                "title": idea.title,
                "description": idea.description,
                "target_market": idea.target_market,
                "revenue_model": idea.revenue_model,
                "confidence_score": idea.confidence_score
            }
            
            # Render enhancement prompt
            prompt_data = self.prompt_engine.render_prompt("idea_enhancement", variables)
            
            # Configure AI model for enhancement
            config = ModelConfig.for_enhancement()
            
            # Perform enhancement
            ai_result = await self.openai_client.analyze_with_retry(
                messages=[{"role": "user", "content": prompt_data["user_prompt"]}],
                config=config,
                system_prompt=prompt_data["system_prompt"]
            )
            
            if "error" not in ai_result and "parsed_content" in ai_result:
                enhanced_data = ai_result["parsed_content"]
                
                # Update idea with enhanced analysis
                idea.ai_analysis.update(enhanced_data.get("enhanced_analysis", {}))
                idea.confidence_score = enhanced_data.get("updated_confidence", idea.confidence_score)
                
                # Add enhancement metadata
                idea.ai_analysis["enhancement_level"] = enhancement_level
                idea.ai_analysis["enhanced_at"] = datetime.utcnow().isoformat()
            
        except Exception as e:
            self.logger.warning("Failed to enhance idea analysis",
                              idea_id=idea.id,
                              error=str(e))
        
        return idea
    
    async def get_high_potential_pain_points(self, limit: int = 20, min_business_potential: float = 0.7) -> List[Dict[str, Any]]:
        """Get high-potential pain points for idea generation"""
        try:
            pain_points = await DatabaseService.get_high_quality_pain_points(
                limit=limit,
                min_business_potential=min_business_potential,
                min_confidence=0.8
            )
            
            self.logger.info("Retrieved high-potential pain points", 
                           count=len(pain_points),
                           min_potential=min_business_potential)
            return pain_points
            
        except Exception as e:
            self.logger.error("Failed to get high-potential pain points", error=str(e))
            return []
    
    async def generate_ideas_from_queue(self, batch_size: int = 5, enhancement_level: str = "standard") -> Dict[str, Any]:
        """Generate ideas from high-potential pain points queue"""
        try:
            # Get high-potential pain points
            pain_points = await self.get_high_potential_pain_points(batch_size * 3)
            
            if len(pain_points) < 3:
                return {
                    "status": "insufficient_data",
                    "message": "Insufficient high-quality pain points for idea generation",
                    "generated": 0
                }
            
            # Group pain points for idea generation (3-5 per idea)
            requests = []
            for i in range(0, len(pain_points), 3):
                group = pain_points[i:i+5]  # 3-5 pain points per idea
                if len(group) >= 3:
                    requests.append(IdeaGenerationRequest(pain_points=group))
                    if len(requests) >= batch_size:
                        break
            
            # Generate ideas
            ideas = await self.generate_ideas_batch(requests, enhancement_level)
            
            # Store successful ideas
            storage_result = await self.store_generated_ideas(ideas)
            
            # Filter successful ideas
            successful_ideas = [idea for idea in ideas if idea.confidence_score >= self.min_confidence_score]
            high_quality_ideas = [idea for idea in successful_ideas if idea.is_high_quality]
            
            return {
                "status": "completed",
                "generated": len(ideas),
                "successful": len(successful_ideas),
                "high_quality": len(high_quality_ideas),
                "stored": storage_result["stored"],
                "storage_errors": storage_result["errors"],
                "metrics": {
                    "success_rate": self.metrics.success_rate,
                    "high_quality_rate": self.metrics.high_quality_rate,
                    "average_confidence": self.metrics.average_confidence_score,
                    "average_generation_time": self.metrics.average_generation_time
                },
                "ideas": [
                    {
                        "id": idea.id,
                        "title": idea.title,
                        "confidence_score": idea.confidence_score,
                        "quality_score": idea.quality_scores.get("overall_score", 0),
                        "is_high_quality": idea.is_high_quality
                    }
                    for idea in successful_ideas[:3]  # Return first 3 for summary
                ]
            }
            
        except Exception as e:
            self.logger.error("Failed to generate ideas from queue", error=str(e))
            return {
                "status": "error",
                "error": str(e),
                "generated": 0
            }
    
    async def _apply_92_percent_optimization(self, idea: GeneratedIdea, pain_points: List[Dict[str, Any]]) -> GeneratedIdea:
        """Apply 92% accuracy optimization to generated idea"""
        try:
            # Convert GeneratedIdea to dict for optimization
            idea_dict = {
                "title": idea.title,
                "description": idea.description,
                "target_market": idea.target_market,
                "revenue_model": idea.revenue_model,
                "market_size": idea.market_size,
                "implementation_difficulty": idea.implementation_difficulty,
                "confidence_score": idea.confidence_score,
                "competitive_advantage": idea.competitive_advantage,
                "mvp_timeline": idea.mvp_timeline,
                "initial_investment": idea.initial_investment,
                "ai_analysis": idea.ai_analysis
            }
            
            # Apply optimization
            optimization_result = await self.idea_optimizer.optimize_business_idea(idea_dict, pain_points)
            
            if optimization_result.significant_improvement:
                # Update idea with optimized values
                optimized_data = optimization_result.optimized_idea
                
                idea.title = optimized_data.get("title", idea.title)
                idea.description = optimized_data.get("description", idea.description)
                idea.target_market = optimized_data.get("target_market", idea.target_market)
                idea.revenue_model = optimized_data.get("revenue_model", idea.revenue_model)
                idea.competitive_advantage = optimized_data.get("competitive_advantage", idea.competitive_advantage)
                idea.ai_analysis.update(optimized_data.get("ai_analysis", {}))
                
                # Boost confidence score for optimized ideas
                idea.confidence_score = min(100, int(idea.confidence_score + (optimization_result.confidence_improvement * 100)))
                
                # Update quality scores
                original_quality = idea.quality_scores.get("overall_score", 0.0)
                improved_quality = min(1.0, original_quality + optimization_result.optimization_score * 0.2)
                idea.quality_scores["overall_score"] = improved_quality
                idea.quality_scores["optimization_applied"] = True
                idea.quality_scores["optimization_score"] = optimization_result.optimization_score
                
                # Add optimization metadata
                idea.ai_analysis["optimization_results"] = {
                    "optimization_score": optimization_result.optimization_score,
                    "improvements_made": optimization_result.improvements_made,
                    "confidence_improvement": optimization_result.confidence_improvement,
                    "optimized_at": datetime.utcnow().isoformat()
                }
                
                self.logger.info("Idea optimized for 92% accuracy",
                               idea_id=idea.id,
                               optimization_score=optimization_result.optimization_score,
                               improvements_count=len(optimization_result.improvements_made),
                               new_confidence=idea.confidence_score)
            
            return idea
            
        except Exception as e:
            self.logger.warning("92% accuracy optimization failed", idea_id=idea.id, error=str(e))
            return idea
    
    async def generate_market_opportunity_ideas(self, pain_points: List[Dict[str, Any]], limit: int = 5) -> List[GeneratedIdea]:
        """Generate ideas based on identified market opportunities"""
        try:
            # Identify market opportunities first
            opportunities = await self.idea_optimizer.identify_market_opportunities(pain_points)
            
            if not opportunities:
                self.logger.warning("No viable market opportunities found")
                return []
            
            generated_ideas = []
            
            # Generate ideas for top opportunities
            for opportunity in opportunities[:limit]:
                # Get pain points for this opportunity
                opportunity_pain_points = [
                    pp for pp in pain_points 
                    if pp.get("id") in opportunity.pain_point_cluster
                ]
                
                if opportunity_pain_points:
                    # Create specialized request for this opportunity
                    request = IdeaGenerationRequest(
                        pain_points=opportunity_pain_points,
                        target_market=", ".join(opportunity.target_segments),
                        market_size_target=opportunity.market_size_estimate,
                        complexity_preference="medium" if opportunity.competition_level == "low" else "low"
                    )
                    
                    # Generate idea with comprehensive enhancement
                    idea = await self.generate_business_idea(request, enhancement_level="comprehensive")
                    
                    if idea.confidence_score >= self.min_confidence_score:
                        # Add opportunity metadata
                        idea.ai_analysis["market_opportunity"] = {
                            "opportunity_id": opportunity.opportunity_id,
                            "opportunity_score": opportunity.opportunity_score,
                            "success_probability": opportunity.success_probability,
                            "market_gap": opportunity.market_gap,
                            "entry_barriers": opportunity.entry_barriers,
                            "competition_level": opportunity.competition_level
                        }
                        
                        generated_ideas.append(idea)
            
            self.logger.info("Market opportunity-based ideas generated",
                           opportunities_analyzed=len(opportunities),
                           ideas_generated=len(generated_ideas))
            
            return generated_ideas
            
        except Exception as e:
            self.logger.error("Market opportunity idea generation failed", error=str(e))
            return []
    
    def get_generation_metrics(self) -> Dict[str, Any]:
        """Get comprehensive generation metrics"""
        return {
            "performance": {
                "total_requests": self.metrics.total_requests,
                "success_rate": round(self.metrics.success_rate, 2),
                "high_quality_rate": round(self.metrics.high_quality_rate, 2),
                "average_generation_time": round(self.metrics.average_generation_time, 3),
                "target_accuracy": self.target_accuracy
            },
            "quality": {
                "average_confidence_score": round(self.metrics.average_confidence_score, 1),
                "min_confidence_threshold": self.min_confidence_score,
                "min_quality_threshold": self.min_quality_threshold
            },
            "configuration": {
                "max_concurrent_generations": self.max_concurrent_generations,
                "generation_timeout": self.generation_timeout,
                "retry_attempts": self.retry_attempts,
                "enhancement_levels": list(self.enhancement_levels.keys())
            },
            "openai_usage": self.openai_client.get_usage_stats(),
            "optimization_metrics": self.idea_optimizer.get_optimization_metrics()
        }

# Global idea generator instance
_idea_generator = None

def get_idea_generator() -> IdeaGenerator:
    """Get global idea generator instance"""
    global _idea_generator
    if _idea_generator is None:
        _idea_generator = IdeaGenerator()
    return _idea_generator