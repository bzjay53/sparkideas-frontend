"""
AI Analysis Service - Legacy Wrapper
Maintains backward compatibility while using new modular AI system
"""

import asyncio
import json
from typing import List, Dict, Any, Optional
import structlog
from datetime import datetime

from app.config.settings import settings
from app.services.database import DatabaseService
from app.services.ai import (
    get_analysis_processor, 
    get_idea_generator, 
    get_quality_scorer,
    IdeaGenerationRequest
)

logger = structlog.get_logger()

class AIAnalyzerService:
    """AI-powered analysis service using modular AI system"""
    
    def __init__(self):
        # Initialize new modular components
        self.analysis_processor = get_analysis_processor()
        self.idea_generator = get_idea_generator()
        self.quality_scorer = get_quality_scorer()
        
        # Legacy compatibility
        self.model = settings.openai_model
        self.max_tokens = 2000
        self.temperature = 0.7
    
    @classmethod
    async def analyze_pain_point(cls, pain_point: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze single pain point using new modular system"""
        try:
            # Use new analysis processor
            service = cls()
            result = await service.analysis_processor.analyze_pain_point(pain_point)
            
            # Convert result to legacy format for backward compatibility
            if result.quality_score > 0:
                analysis = result.analysis_data
                analysis['processed_at'] = result.timestamp.isoformat()
                analysis['confidence'] = result.confidence_score
                analysis['quality_score'] = result.quality_score
                
                logger.info("Pain point analyzed successfully (new system)", 
                          pain_point_id=pain_point['id'],
                          quality_score=result.quality_score)
                return analysis
            else:
                return {"error": "Analysis failed"}
                
        except Exception as e:
            logger.error("Failed to analyze pain point", pain_point_id=pain_point.get('id'), error=str(e))
            return {"error": str(e)}
    
    @classmethod
    async def generate_business_idea(cls, pain_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate business idea using new modular system"""
        try:
            # Use new idea generator
            service = cls()
            request = IdeaGenerationRequest(pain_points=pain_points)
            idea = await service.idea_generator.generate_business_idea(request, enhancement_level="standard")
            
            # Convert to legacy format for backward compatibility
            if idea.confidence_score > 0:
                result = {
                    "id": idea.id,
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
                    "pain_point_ids": idea.pain_point_ids,
                    "generated_at": idea.generated_at.isoformat(),
                    "quality_scores": idea.quality_scores,
                    "is_high_quality": idea.is_high_quality
                }
                
                # Store in database
                created_idea = await DatabaseService.create_business_idea(result)
                
                logger.info("Business idea generated successfully (new system)", 
                          idea_id=idea.id,
                          confidence_score=idea.confidence_score,
                          quality_score=idea.quality_scores.get("overall_score", 0))
                return created_idea
            else:
                return {"error": "Idea generation failed"}
                
        except Exception as e:
            logger.error("Failed to generate business idea", error=str(e))
            return {"error": str(e)}
    
    @classmethod
    async def analyze_unprocessed_pain_points(cls, batch_size: int = 10):
        """Analyze unprocessed pain points using new modular system"""
        try:
            # Use new analysis processor
            service = cls()
            result = await service.analysis_processor.process_analysis_queue(batch_size)
            
            logger.info("Batch analysis completed (new system)", 
                       status=result.get("status"),
                       processed=result.get("processed", 0),
                       stored=result.get("stored", 0),
                       success_rate=result.get("metrics", {}).get("success_rate", 0))
            
            return result
            
        except Exception as e:
            logger.error("Failed to analyze unprocessed pain points", error=str(e))
            return {"status": "error", "error": str(e)}
    
    @classmethod
    async def generate_business_ideas_batch(cls, batch_size: int = 5, min_confidence: float = 75.0):
        """Generate business ideas using new modular system"""
        try:
            # Use new idea generator
            service = cls()
            result = await service.idea_generator.generate_ideas_from_queue(
                batch_size=batch_size, 
                enhancement_level="standard"
            )
            
            # Filter by confidence if needed
            if min_confidence > service.idea_generator.min_confidence_score:
                successful_ideas = [idea for idea in result.get("ideas", []) 
                                  if idea.get("confidence_score", 0) >= min_confidence]
                result["high_confidence_ideas"] = len(successful_ideas)
            
            logger.info("Business ideas batch generation completed (new system)", 
                       status=result.get("status"),
                       generated=result.get("generated", 0),
                       successful=result.get("successful", 0),
                       high_quality=result.get("high_quality", 0))
            
            return result
            
        except Exception as e:
            logger.error("Failed to generate business ideas batch", error=str(e))
            return {"status": "error", "error": str(e)}
    
    @classmethod
    async def enhance_business_idea_analysis(cls, idea_id: str):
        """Enhance existing business idea using new modular system"""
        try:
            # Get the existing idea
            idea = await DatabaseService.get_business_idea_by_id(idea_id)
            if not idea:
                logger.error("Business idea not found for enhancement", idea_id=idea_id)
                return {"error": "Business idea not found"}
            
            # Use new idea generator for enhancement
            service = cls()
            
            # Create a mock GeneratedIdea object for enhancement
            from app.services.ai.idea_generator import GeneratedIdea
            mock_idea = GeneratedIdea(
                id=idea_id,
                title=idea.get("title", ""),
                description=idea.get("description", ""),
                target_market=idea.get("target_market", ""),
                revenue_model=idea.get("revenue_model", ""),
                market_size=idea.get("market_size", "medium"),
                implementation_difficulty=idea.get("implementation_difficulty", 3),
                confidence_score=idea.get("confidence_score", 0),
                competitive_advantage=idea.get("competitive_advantage", ""),
                mvp_timeline=idea.get("mvp_timeline", ""),
                initial_investment=idea.get("initial_investment", ""),
                ai_analysis=idea.get("ai_analysis", {}),
                quality_scores=idea.get("quality_scores", {}),
                pain_point_ids=idea.get("pain_point_ids", [])
            )
            
            # Enhance the idea
            enhanced_idea = await service.idea_generator._enhance_idea_analysis(
                mock_idea, 
                enhancement_level="comprehensive"
            )
            
            # Update the database
            await DatabaseService.update_business_idea(idea_id, {
                'ai_analysis': enhanced_idea.ai_analysis,
                'confidence_score': enhanced_idea.confidence_score
            })
            
            logger.info("Business idea enhanced successfully (new system)", 
                       idea_id=idea_id,
                       enhancement_level="comprehensive")
            
            return {
                "status": "success",
                "idea_id": idea_id,
                "enhanced_analysis": enhanced_idea.ai_analysis
            }
            
        except Exception as e:
            logger.error("Failed to enhance business idea", idea_id=idea_id, error=str(e))
            return {"error": str(e)}
    
    @classmethod
    async def get_ai_system_metrics(cls) -> Dict[str, Any]:
        """Get comprehensive metrics from new AI system"""
        try:
            service = cls()
            
            return {
                "analysis_processor": service.analysis_processor.get_processing_metrics(),
                "idea_generator": service.idea_generator.get_generation_metrics(),
                "quality_scorer": service.quality_scorer.get_quality_statistics(),
                "system_status": "operational",
                "version": "2.0_modular"
            }
            
        except Exception as e:
            logger.error("Failed to get AI system metrics", error=str(e))
            return {
                "system_status": "error",
                "error": str(e),
                "version": "2.0_modular"
            }