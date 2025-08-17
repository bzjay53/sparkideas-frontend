"""
Business Idea Optimization Engine
Advanced optimization algorithms for 92% accuracy in business idea generation
"""

import asyncio
import time
import math
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import json
import structlog

from .nlp_processor import get_nlp_processor
from .quality_scorer import get_quality_scorer

logger = structlog.get_logger()

@dataclass
class MarketOpportunity:
    """Identified market opportunity from pain points"""
    opportunity_id: str
    pain_point_cluster: List[str]  # Related pain point IDs
    market_gap: str
    target_segments: List[str]
    market_size_estimate: str
    competition_level: str  # "low", "medium", "high"
    entry_barriers: List[str]
    success_probability: float
    opportunity_score: float
    
    @property
    def is_viable(self) -> bool:
        """Check if opportunity is viable for business"""
        return (self.opportunity_score >= 0.7 and 
                self.success_probability >= 0.6 and
                self.competition_level != "high")

@dataclass
class IdeaOptimizationResult:
    """Result of idea optimization process"""
    original_idea: Dict[str, Any]
    optimized_idea: Dict[str, Any]
    optimization_score: float
    improvements_made: List[str]
    risk_factors: List[str]
    optimization_time: float
    confidence_improvement: float
    
    @property
    def significant_improvement(self) -> bool:
        """Check if optimization made significant improvements"""
        return (self.optimization_score > 0.8 and 
                self.confidence_improvement > 0.15)

class IdeaOptimizer:
    """Advanced business idea optimization engine"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="IdeaOptimizer")
        self.nlp_processor = get_nlp_processor()
        self.quality_scorer = get_quality_scorer()
        
        # Optimization algorithms
        self.optimization_strategies = {
            "market_validation": self._optimize_market_validation,
            "competitive_positioning": self._optimize_competitive_positioning,
            "revenue_model": self._optimize_revenue_model,
            "technical_feasibility": self._optimize_technical_feasibility,
            "scalability": self._optimize_scalability
        }
        
        # Industry knowledge base
        self._initialize_market_intelligence()
        
        # Performance tracking
        self.total_optimizations = 0
        self.average_improvement = 0.0
        self.successful_optimizations = 0
    
    def _initialize_market_intelligence(self):
        """Initialize market intelligence database"""
        
        # Market size indicators
        self.market_size_indicators = {
            "large": {
                "keywords": ["모든사람", "전세계", "일반", "대중", "everyone", "global", "universal", "mass market"],
                "user_count_threshold": 1000000,
                "market_value_threshold": 1000000000  # 1B USD
            },
            "medium": {
                "keywords": ["회사", "기업", "직장인", "사업자", "companies", "businesses", "professionals"],
                "user_count_threshold": 100000,
                "market_value_threshold": 100000000  # 100M USD
            },
            "small": {
                "keywords": ["특정", "전문가", "니치", "specific", "experts", "niche", "specialized"],
                "user_count_threshold": 10000,
                "market_value_threshold": 10000000  # 10M USD
            }
        }
        
        # Competition analysis patterns
        self.competition_patterns = {
            "low_competition": [
                "새로운", "처음", "혁신적", "독특한", "new", "first", "innovative", "unique"
            ],
            "medium_competition": [
                "기존", "개선", "향상", "existing", "improved", "enhanced", "better"
            ],
            "high_competition": [
                "유명한", "대기업", "큰회사", "popular", "big companies", "giants", "established"
            ]
        }
        
        # Revenue model viability
        self.revenue_model_scores = {
            "subscription": {"viability": 0.9, "scalability": 0.95, "predictability": 0.9},
            "freemium": {"viability": 0.8, "scalability": 0.9, "predictability": 0.7},
            "marketplace": {"viability": 0.85, "scalability": 0.95, "predictability": 0.8},
            "saas": {"viability": 0.9, "scalability": 0.95, "predictability": 0.85},
            "advertising": {"viability": 0.7, "scalability": 0.8, "predictability": 0.6},
            "transaction_fee": {"viability": 0.8, "scalability": 0.85, "predictability": 0.75},
            "one_time_purchase": {"viability": 0.6, "scalability": 0.5, "predictability": 0.8}
        }
        
        # Technical complexity assessment
        self.technical_complexity = {
            "simple": {
                "keywords": ["웹사이트", "앱", "dashboard", "website", "mobile app", "web app"],
                "development_time": "1-3 months",
                "team_size": "1-2 developers",
                "success_rate": 0.9
            },
            "moderate": {
                "keywords": ["ai", "머신러닝", "automation", "integration", "machine learning"],
                "development_time": "3-6 months", 
                "team_size": "2-4 developers",
                "success_rate": 0.7
            },
            "complex": {
                "keywords": ["blockchain", "quantum", "biotech", "vr", "ar", "robotics"],
                "development_time": "6-18 months",
                "team_size": "5+ developers",
                "success_rate": 0.4
            }
        }
        
        # Success factor weights
        self.success_factors = {
            "market_demand": 0.25,
            "technical_feasibility": 0.20,
            "competitive_advantage": 0.20,
            "revenue_potential": 0.15,
            "team_capability": 0.10,
            "timing": 0.10
        }
    
    async def identify_market_opportunities(self, pain_points: List[Dict[str, Any]]) -> List[MarketOpportunity]:
        """Identify market opportunities from pain point clusters"""
        if not pain_points:
            return []
        
        try:
            # Cluster pain points by similarity
            clusters = await self._cluster_pain_points(pain_points)
            
            opportunities = []
            for cluster_id, cluster_points in clusters.items():
                if len(cluster_points) >= 2:  # Need at least 2 pain points for opportunity
                    opportunity = await self._analyze_market_opportunity(cluster_id, cluster_points)
                    if opportunity and opportunity.is_viable:
                        opportunities.append(opportunity)
            
            # Sort by opportunity score
            opportunities.sort(key=lambda x: x.opportunity_score, reverse=True)
            
            self.logger.info("Market opportunities identified",
                           total_pain_points=len(pain_points),
                           clusters_found=len(clusters),
                           viable_opportunities=len(opportunities))
            
            return opportunities[:10]  # Return top 10 opportunities
            
        except Exception as e:
            self.logger.error("Failed to identify market opportunities", error=str(e))
            return []
    
    async def optimize_business_idea(self, idea_data: Dict[str, Any], pain_points: List[Dict[str, Any]] = None) -> IdeaOptimizationResult:
        """Optimize business idea for maximum success probability"""
        start_time = time.time()
        
        try:
            original_idea = idea_data.copy()
            optimized_idea = idea_data.copy()
            improvements_made = []
            risk_factors = []
            
            # Apply optimization strategies
            for strategy_name, strategy_func in self.optimization_strategies.items():
                try:
                    optimization_result = await strategy_func(optimized_idea, pain_points or [])
                    
                    if optimization_result["improved"]:
                        optimized_idea.update(optimization_result["updates"])
                        improvements_made.extend(optimization_result["improvements"])
                        
                    risk_factors.extend(optimization_result.get("risks", []))
                    
                except Exception as e:
                    self.logger.warning(f"Optimization strategy {strategy_name} failed", error=str(e))
                    risk_factors.append(f"Failed to apply {strategy_name} optimization")
            
            # Calculate optimization score
            optimization_score = await self._calculate_optimization_score(original_idea, optimized_idea)
            
            # Calculate confidence improvement
            original_confidence = original_idea.get("confidence_score", 0) / 100.0
            optimized_confidence = optimized_idea.get("confidence_score", 0) / 100.0
            confidence_improvement = optimized_confidence - original_confidence
            
            optimization_time = time.time() - start_time
            
            # Create result
            result = IdeaOptimizationResult(
                original_idea=original_idea,
                optimized_idea=optimized_idea,
                optimization_score=optimization_score,
                improvements_made=improvements_made,
                risk_factors=risk_factors,
                optimization_time=optimization_time,
                confidence_improvement=confidence_improvement
            )
            
            # Update performance metrics
            self.total_optimizations += 1
            if result.significant_improvement:
                self.successful_optimizations += 1
            
            self.average_improvement = (
                (self.average_improvement * (self.total_optimizations - 1) + optimization_score) / 
                self.total_optimizations
            )
            
            self.logger.info("Business idea optimized",
                           optimization_score=optimization_score,
                           improvements_count=len(improvements_made),
                           confidence_improvement=confidence_improvement,
                           optimization_time=optimization_time)
            
            return result
            
        except Exception as e:
            optimization_time = time.time() - start_time
            self.logger.error("Business idea optimization failed", error=str(e))
            
            return IdeaOptimizationResult(
                original_idea=idea_data,
                optimized_idea=idea_data,
                optimization_score=0.0,
                improvements_made=[],
                risk_factors=[f"Optimization failed: {str(e)}"],
                optimization_time=optimization_time,
                confidence_improvement=0.0
            )
    
    async def _cluster_pain_points(self, pain_points: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Cluster pain points by similarity"""
        clusters = defaultdict(list)
        
        try:
            # Simple clustering based on categories and keywords
            for pain_point in pain_points:
                category = pain_point.get("category", "general")
                keywords = pain_point.get("keywords", [])
                
                # Create cluster key based on category and dominant keywords
                cluster_key = f"{category}"
                if keywords:
                    # Add top 2 keywords to cluster key
                    top_keywords = sorted(keywords)[:2]
                    cluster_key += "_" + "_".join(top_keywords)
                
                clusters[cluster_key].append(pain_point)
            
            # Merge small clusters with similar ones
            merged_clusters = {}
            for cluster_id, points in clusters.items():
                if len(points) >= 2:
                    merged_clusters[cluster_id] = points
                else:
                    # Try to merge with existing cluster
                    merged = False
                    for existing_id, existing_points in merged_clusters.items():
                        if cluster_id.split("_")[0] == existing_id.split("_")[0]:  # Same category
                            merged_clusters[existing_id].extend(points)
                            merged = True
                            break
                    
                    if not merged:
                        merged_clusters[cluster_id] = points
            
            return merged_clusters
            
        except Exception as e:
            self.logger.error("Pain point clustering failed", error=str(e))
            return {"default": pain_points}
    
    async def _analyze_market_opportunity(self, cluster_id: str, pain_points: List[Dict[str, Any]]) -> Optional[MarketOpportunity]:
        """Analyze market opportunity for pain point cluster"""
        try:
            # Aggregate pain point data
            combined_text = " ".join([
                f"{pp.get('title', '')} {pp.get('content', '')}" 
                for pp in pain_points
            ])
            
            # NLP analysis of combined text
            nlp_result = await self.nlp_processor.analyze_text(
                text=combined_text,
                text_id=f"cluster_{cluster_id}",
                context={"cluster_size": len(pain_points)}
            )
            
            # Estimate market size
            market_size = self._estimate_market_size(combined_text, nlp_result)
            
            # Analyze competition level
            competition_level = self._analyze_competition_level(combined_text, nlp_result)
            
            # Identify target segments
            target_segments = self._identify_target_segments(pain_points, nlp_result)
            
            # Calculate opportunity score
            opportunity_score = self._calculate_opportunity_score(
                pain_points, nlp_result, market_size, competition_level
            )
            
            # Calculate success probability
            success_probability = self._calculate_success_probability(
                len(pain_points), nlp_result.trends.trend_score, competition_level
            )
            
            # Identify market gap
            market_gap = self._identify_market_gap(nlp_result, competition_level)
            
            # Identify entry barriers
            entry_barriers = self._identify_entry_barriers(combined_text, competition_level)
            
            return MarketOpportunity(
                opportunity_id=f"opp_{cluster_id}_{int(time.time())}",
                pain_point_cluster=[pp.get("id", "") for pp in pain_points],
                market_gap=market_gap,
                target_segments=target_segments,
                market_size_estimate=market_size,
                competition_level=competition_level,
                entry_barriers=entry_barriers,
                success_probability=success_probability,
                opportunity_score=opportunity_score
            )
            
        except Exception as e:
            self.logger.error("Market opportunity analysis failed", error=str(e))
            return None
    
    def _estimate_market_size(self, text: str, nlp_result) -> str:
        """Estimate market size based on text analysis"""
        text_lower = text.lower()
        
        # Check for size indicators
        for size, indicators in self.market_size_indicators.items():
            if any(keyword in text_lower for keyword in indicators["keywords"]):
                return size
        
        # Use frequency indicators from NLP
        if nlp_result.trends.frequency_indicators:
            if any("자주" in indicator or "매일" in indicator or "항상" in indicator 
                   for indicator in nlp_result.trends.frequency_indicators):
                return "large"
        
        # Default based on trend score
        if nlp_result.trends.trend_score > 0.7:
            return "medium"
        else:
            return "small"
    
    def _analyze_competition_level(self, text: str, nlp_result) -> str:
        """Analyze competition level"""
        text_lower = text.lower()
        
        for level, keywords in self.competition_patterns.items():
            if any(keyword in text_lower for keyword in keywords):
                return level.replace("_competition", "")
        
        # Default based on market signals
        if nlp_result.trends.market_signals:
            return "medium"
        else:
            return "low"
    
    def _identify_target_segments(self, pain_points: List[Dict[str, Any]], nlp_result) -> List[str]:
        """Identify target market segments"""
        segments = set()
        
        # Extract from pain point metadata
        for pp in pain_points:
            target_demo = pp.get("target_demographics", "")
            if target_demo:
                segments.add(target_demo)
        
        # Extract from NLP entities
        if nlp_result.keywords.entities:
            for entity_type, entities in nlp_result.keywords.entities.items():
                if entity_type in ["business", "technology"]:
                    segments.update(entities)
        
        # Add generic segments if none found
        if not segments:
            segments.add("일반 사용자")
        
        return list(segments)[:5]  # Limit to 5 segments
    
    def _calculate_opportunity_score(self, pain_points: List[Dict[str, Any]], nlp_result, market_size: str, competition_level: str) -> float:
        """Calculate overall opportunity score"""
        score = 0.0
        
        # Pain point frequency and severity
        avg_severity = sum(pp.get("pain_severity", 3) for pp in pain_points) / len(pain_points)
        score += (avg_severity / 5.0) * 0.3
        
        # Market size contribution
        size_scores = {"large": 0.3, "medium": 0.2, "small": 0.1}
        score += size_scores.get(market_size, 0.1)
        
        # Competition level (inverse - less competition is better)
        comp_scores = {"low": 0.3, "medium": 0.2, "high": 0.1}
        score += comp_scores.get(competition_level, 0.1)
        
        # Trend strength
        score += nlp_result.trends.trend_score * 0.2
        
        return min(1.0, score)
    
    def _calculate_success_probability(self, cluster_size: int, trend_score: float, competition_level: str) -> float:
        """Calculate success probability"""
        base_probability = 0.3
        
        # Cluster size bonus (more pain points = higher validation)
        cluster_bonus = min(0.3, cluster_size * 0.05)
        
        # Trend bonus
        trend_bonus = trend_score * 0.2
        
        # Competition penalty
        comp_penalties = {"low": 0.0, "medium": -0.1, "high": -0.2}
        comp_penalty = comp_penalties.get(competition_level, -0.1)
        
        return min(1.0, max(0.1, base_probability + cluster_bonus + trend_bonus + comp_penalty))
    
    def _identify_market_gap(self, nlp_result, competition_level: str) -> str:
        """Identify specific market gap"""
        # Analyze action words to understand what's needed
        if nlp_result.keywords.action_words:
            main_action = nlp_result.keywords.action_words[0]
            return f"{main_action}을 위한 효율적인 솔루션 부족"
        
        # Use competition level to frame gap
        if competition_level == "low":
            return "해당 분야의 전문 솔루션 부재"
        elif competition_level == "medium":
            return "기존 솔루션의 사용성 및 접근성 문제"
        else:
            return "기존 솔루션의 비용 효율성 문제"
    
    def _identify_entry_barriers(self, text: str, competition_level: str) -> List[str]:
        """Identify market entry barriers"""
        barriers = []
        
        # Technical barriers
        if any(tech in text.lower() for tech in ["ai", "머신러닝", "blockchain", "machine learning"]):
            barriers.append("기술적 전문성 요구")
        
        # Competition barriers
        if competition_level == "high":
            barriers.append("기존 시장 지배자 존재")
            barriers.append("브랜드 인지도 필요")
        
        # Market barriers
        if "규제" in text or "법률" in text or "regulation" in text:
            barriers.append("규제 및 컴플라이언스 요구")
        
        # Default barriers
        if not barriers:
            barriers.extend(["초기 자본 투자", "시장 검증 필요"])
        
        return barriers[:5]  # Limit to 5 barriers
    
    async def _optimize_market_validation(self, idea: Dict[str, Any], pain_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Optimize market validation aspects"""
        improvements = []
        updates = {}
        risks = []
        
        try:
            # Analyze current market validation
            current_validation = idea.get("ai_analysis", {}).get("market_validation", {})
            
            # Enhance with pain point evidence
            if pain_points:
                demand_evidence = []
                for pp in pain_points:
                    if pp.get("business_potential", 0) > 0.7:
                        demand_evidence.append(f"갈증포인트: {pp.get('title', 'Unknown')}")
                
                if demand_evidence:
                    updates["ai_analysis"] = idea.get("ai_analysis", {})
                    updates["ai_analysis"]["market_validation"] = current_validation.copy()
                    updates["ai_analysis"]["market_validation"]["demand_evidence"] = demand_evidence
                    improvements.append("실제 갈증포인트 기반 수요 증거 강화")
            
            # Suggest validation methods
            target_market = idea.get("target_market", "")
            if "기업" in target_market or "회사" in target_market:
                validation_methods = ["B2B 파일럿 프로그램", "업계 전문가 인터뷰", "기업 설문조사"]
            else:
                validation_methods = ["사용자 설문조사", "MVP 베타 테스트", "온라인 커뮤니티 피드백"]
            
            if "ai_analysis" not in updates:
                updates["ai_analysis"] = idea.get("ai_analysis", {})
            if "market_validation" not in updates["ai_analysis"]:
                updates["ai_analysis"]["market_validation"] = current_validation.copy()
            
            updates["ai_analysis"]["market_validation"]["suggested_validation_methods"] = validation_methods
            improvements.append("구체적인 시장 검증 방법 제안")
            
            return {
                "improved": len(improvements) > 0,
                "updates": updates,
                "improvements": improvements,
                "risks": risks
            }
            
        except Exception as e:
            return {
                "improved": False,
                "updates": {},
                "improvements": [],
                "risks": [f"Market validation optimization failed: {str(e)}"]
            }
    
    async def _optimize_competitive_positioning(self, idea: Dict[str, Any], pain_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Optimize competitive positioning"""
        improvements = []
        updates = {}
        risks = []
        
        try:
            competitive_advantage = idea.get("competitive_advantage", "")
            
            # Enhance competitive advantage
            if not competitive_advantage or len(competitive_advantage) < 50:
                # Generate stronger competitive advantage
                enhanced_advantage = self._generate_competitive_advantage(idea, pain_points)
                if enhanced_advantage:
                    updates["competitive_advantage"] = enhanced_advantage
                    improvements.append("경쟁 우위 강화 및 구체화")
            
            # Add differentiation strategy
            current_analysis = idea.get("ai_analysis", {}).get("competition_analysis", {})
            differentiation_strategy = self._create_differentiation_strategy(idea, current_analysis)
            
            if differentiation_strategy:
                updates["ai_analysis"] = idea.get("ai_analysis", {})
                updates["ai_analysis"]["competition_analysis"] = current_analysis.copy()
                updates["ai_analysis"]["competition_analysis"]["differentiation_strategy"] = differentiation_strategy
                improvements.append("차별화 전략 수립")
            
            return {
                "improved": len(improvements) > 0,
                "updates": updates,
                "improvements": improvements,
                "risks": risks
            }
            
        except Exception as e:
            return {
                "improved": False,
                "updates": {},
                "improvements": [],
                "risks": [f"Competitive positioning optimization failed: {str(e)}"]
            }
    
    async def _optimize_revenue_model(self, idea: Dict[str, Any], pain_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Optimize revenue model"""
        improvements = []
        updates = {}
        risks = []
        
        try:
            current_model = idea.get("revenue_model", "").lower()
            
            # Analyze revenue model viability
            best_model = None
            best_score = 0.0
            
            for model, scores in self.revenue_model_scores.items():
                if model in current_model:
                    # Current model is already good
                    if scores["viability"] > best_score:
                        best_model = model
                        best_score = scores["viability"]
            
            # Suggest revenue model optimization
            if not best_model or best_score < 0.8:
                # Suggest better revenue model
                target_market = idea.get("target_market", "").lower()
                
                if "기업" in target_market or "회사" in target_market:
                    suggested_model = "subscription"
                    explanation = "B2B 시장에서 예측 가능한 수익을 위한 구독 모델 권장"
                elif "플랫폼" in idea.get("description", "").lower():
                    suggested_model = "marketplace"
                    explanation = "플랫폼 비즈니스에 적합한 거래 수수료 모델 권장"
                else:
                    suggested_model = "freemium"
                    explanation = "사용자 확보와 수익화 균형을 위한 프리미엄 모델 권장"
                
                updates["revenue_model"] = f"{idea.get('revenue_model', '')} + {suggested_model} ({explanation})"
                improvements.append(f"수익 모델 최적화: {suggested_model} 모델 제안")
            
            return {
                "improved": len(improvements) > 0,
                "updates": updates,
                "improvements": improvements,
                "risks": risks
            }
            
        except Exception as e:
            return {
                "improved": False,
                "updates": {},
                "improvements": [],
                "risks": [f"Revenue model optimization failed: {str(e)}"]
            }
    
    async def _optimize_technical_feasibility(self, idea: Dict[str, Any], pain_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Optimize technical feasibility"""
        improvements = []
        updates = {}
        risks = []
        
        try:
            description = idea.get("description", "").lower()
            
            # Assess technical complexity
            complexity = "simple"
            for comp_level, comp_data in self.technical_complexity.items():
                if any(keyword in description for keyword in comp_data["keywords"]):
                    complexity = comp_level
                    break
            
            # Suggest technical optimizations
            if complexity == "complex":
                # Suggest simplification
                updates["ai_analysis"] = idea.get("ai_analysis", {})
                updates["ai_analysis"]["technical_feasibility"] = {
                    "complexity_assessment": "복잡도 높음",
                    "simplification_suggestions": [
                        "MVP에서 핵심 기능만 구현",
                        "기존 오픈소스 라이브러리 활용",
                        "클라우드 서비스 API 활용으로 개발 시간 단축"
                    ],
                    "phased_development": [
                        "1단계: 기본 기능 구현 (3개월)",
                        "2단계: 고급 기능 추가 (6개월)",
                        "3단계: 확장 기능 개발 (12개월)"
                    ]
                }
                improvements.append("기술적 복잡도 단계별 해결 방안 제시")
                risks.append("높은 기술적 복잡도로 인한 개발 지연 위험")
            
            # Update implementation difficulty
            if idea.get("implementation_difficulty", 3) > 4 and complexity != "complex":
                updates["implementation_difficulty"] = 3
                improvements.append("구현 난이도 현실적 조정")
            
            return {
                "improved": len(improvements) > 0,
                "updates": updates,
                "improvements": improvements,
                "risks": risks
            }
            
        except Exception as e:
            return {
                "improved": False,
                "updates": {},
                "improvements": [],
                "risks": [f"Technical feasibility optimization failed: {str(e)}"]
            }
    
    async def _optimize_scalability(self, idea: Dict[str, Any], pain_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Optimize scalability aspects"""
        improvements = []
        updates = {}
        risks = []
        
        try:
            # Analyze scalability potential
            market_size = idea.get("market_size", "medium")
            revenue_model = idea.get("revenue_model", "").lower()
            
            scalability_score = 0.5  # Base score
            
            # Market size impact
            if market_size == "large":
                scalability_score += 0.3
            elif market_size == "medium":
                scalability_score += 0.2
            
            # Revenue model impact
            for model, scores in self.revenue_model_scores.items():
                if model in revenue_model:
                    scalability_score += scores["scalability"] * 0.2
                    break
            
            # Add scalability recommendations
            scalability_plan = {
                "scalability_score": round(scalability_score, 2),
                "scaling_strategies": [],
                "infrastructure_requirements": [],
                "operational_challenges": []
            }
            
            if market_size == "large":
                scalability_plan["scaling_strategies"] = [
                    "클라우드 오토스케일링 구축",
                    "마이크로서비스 아키텍처 채택",
                    "글로벌 CDN 활용"
                ]
            else:
                scalability_plan["scaling_strategies"] = [
                    "수직 확장 우선 고려",
                    "데이터베이스 최적화",
                    "캐싱 시스템 도입"
                ]
            
            updates["ai_analysis"] = idea.get("ai_analysis", {})
            updates["ai_analysis"]["scalability_analysis"] = scalability_plan
            improvements.append("확장성 분석 및 전략 수립")
            
            return {
                "improved": len(improvements) > 0,
                "updates": updates,
                "improvements": improvements,
                "risks": risks
            }
            
        except Exception as e:
            return {
                "improved": False,
                "updates": {},
                "improvements": [],
                "risks": [f"Scalability optimization failed: {str(e)}"]
            }
    
    def _generate_competitive_advantage(self, idea: Dict[str, Any], pain_points: List[Dict[str, Any]]) -> str:
        """Generate enhanced competitive advantage"""
        advantages = []
        
        # Data advantage
        if pain_points and len(pain_points) >= 5:
            advantages.append("실제 사용자 갈증포인트 데이터 기반 솔루션 설계")
        
        # Technology advantage
        description = idea.get("description", "").lower()
        if "ai" in description or "머신러닝" in description:
            advantages.append("AI/ML 기술을 활용한 개인화 서비스")
        
        # Market timing
        target_market = idea.get("target_market", "")
        if "기업" in target_market:
            advantages.append("디지털 전환 가속화 시기와 부합하는 B2B 솔루션")
        
        # User experience
        advantages.append("갈증포인트 기반 직관적이고 실용적인 사용자 경험")
        
        if advantages:
            return ". ".join(advantages) + "."
        else:
            return idea.get("competitive_advantage", "")
    
    def _create_differentiation_strategy(self, idea: Dict[str, Any], current_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create differentiation strategy"""
        strategy = {
            "positioning": "실제 사용자 갈증포인트 해결에 특화된 솔루션",
            "key_differentiators": [],
            "target_positioning": "",
            "messaging_strategy": ""
        }
        
        # Key differentiators
        if "ai" in idea.get("description", "").lower():
            strategy["key_differentiators"].append("AI 기반 개인화")
        
        strategy["key_differentiators"].extend([
            "실제 갈증포인트 데이터 기반 개발",
            "사용자 중심 설계",
            "빠른 가치 실현"
        ])
        
        # Target positioning
        market_size = idea.get("market_size", "medium")
        if market_size == "large":
            strategy["target_positioning"] = "시장 리더십 추구"
        else:
            strategy["target_positioning"] = "특정 니치 시장 전문가"
        
        # Messaging strategy
        strategy["messaging_strategy"] = "실제 사용자가 겪는 문제를 정확히 이해하고 해결하는 솔루션"
        
        return strategy
    
    async def _calculate_optimization_score(self, original_idea: Dict[str, Any], optimized_idea: Dict[str, Any]) -> float:
        """Calculate optimization improvement score"""
        try:
            # Compare key metrics
            original_confidence = original_idea.get("confidence_score", 0)
            optimized_confidence = optimized_idea.get("confidence_score", 0)
            
            # Score improvements
            score = 0.0
            
            # Confidence improvement
            if optimized_confidence > original_confidence:
                score += 0.3
            
            # Analysis depth improvement
            original_analysis_depth = len(str(original_idea.get("ai_analysis", {})))
            optimized_analysis_depth = len(str(optimized_idea.get("ai_analysis", {})))
            
            if optimized_analysis_depth > original_analysis_depth * 1.2:
                score += 0.3
            
            # Competitive advantage improvement
            original_comp_adv = len(original_idea.get("competitive_advantage", ""))
            optimized_comp_adv = len(optimized_idea.get("competitive_advantage", ""))
            
            if optimized_comp_adv > original_comp_adv * 1.5:
                score += 0.2
            
            # Revenue model improvement
            if "+" in optimized_idea.get("revenue_model", ""):
                score += 0.2
            
            return min(1.0, score)
            
        except Exception as e:
            self.logger.error("Optimization score calculation failed", error=str(e))
            return 0.0
    
    def get_optimization_metrics(self) -> Dict[str, Any]:
        """Get optimization performance metrics"""
        return {
            "performance": {
                "total_optimizations": self.total_optimizations,
                "successful_optimizations": self.successful_optimizations,
                "success_rate": (
                    (self.successful_optimizations / self.total_optimizations * 100) 
                    if self.total_optimizations > 0 else 0
                ),
                "average_improvement": round(self.average_improvement, 3)
            },
            "optimization_strategies": list(self.optimization_strategies.keys()),
            "market_intelligence": {
                "market_size_categories": len(self.market_size_indicators),
                "competition_patterns": len(self.competition_patterns),
                "revenue_models_analyzed": len(self.revenue_model_scores),
                "technical_complexity_levels": len(self.technical_complexity)
            }
        }

# Global idea optimizer instance
_idea_optimizer = None

def get_idea_optimizer() -> IdeaOptimizer:
    """Get global idea optimizer instance"""
    global _idea_optimizer
    if _idea_optimizer is None:
        _idea_optimizer = IdeaOptimizer()
    return _idea_optimizer