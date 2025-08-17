"""
Quality Scoring System
Advanced quality assessment for pain points and business ideas with 92% accuracy target
"""

import re
import time
import math
from typing import Dict, Any, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
import structlog

logger = structlog.get_logger()

@dataclass
class QualityMetrics:
    """Comprehensive quality metrics for scoring"""
    content_completeness: float = 0.0
    content_relevance: float = 0.0
    feasibility_score: float = 0.0
    innovation_score: float = 0.0
    market_validation: float = 0.0
    technical_soundness: float = 0.0
    business_viability: float = 0.0
    competitive_advantage: float = 0.0
    overall_score: float = 0.0
    confidence_level: float = 0.0
    
    def calculate_overall_score(self, weights: Optional[Dict[str, float]] = None) -> float:
        """Calculate weighted overall score"""
        default_weights = {
            "content_completeness": 0.15,
            "content_relevance": 0.15,
            "feasibility_score": 0.20,
            "innovation_score": 0.10,
            "market_validation": 0.15,
            "technical_soundness": 0.10,
            "business_viability": 0.10,
            "competitive_advantage": 0.05
        }
        
        weights = weights or default_weights
        
        score = (
            self.content_completeness * weights.get("content_completeness", 0) +
            self.content_relevance * weights.get("content_relevance", 0) +
            self.feasibility_score * weights.get("feasibility_score", 0) +
            self.innovation_score * weights.get("innovation_score", 0) +
            self.market_validation * weights.get("market_validation", 0) +
            self.technical_soundness * weights.get("technical_soundness", 0) +
            self.business_viability * weights.get("business_viability", 0) +
            self.competitive_advantage * weights.get("competitive_advantage", 0)
        )
        
        self.overall_score = min(1.0, max(0.0, score))
        return self.overall_score

@dataclass
class QualityAssessment:
    """Complete quality assessment result"""
    item_id: str
    item_type: str  # "pain_point" or "business_idea"
    metrics: QualityMetrics
    detailed_feedback: Dict[str, Any]
    improvement_suggestions: List[str]
    quality_grade: str  # A, B, C, D, F
    assessment_timestamp: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def is_high_quality(self) -> bool:
        """Check if item meets high quality standards"""
        return (self.metrics.overall_score >= 0.85 and
                self.metrics.feasibility_score >= 0.75 and
                self.quality_grade in ["A", "B"])
    
    @property
    def needs_improvement(self) -> bool:
        """Check if item needs improvement"""
        return (self.metrics.overall_score < 0.70 or
                self.quality_grade in ["D", "F"])

class QualityScorer:
    """Advanced quality scoring system for AI-generated content"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="QualityScorer")
        
        # Quality thresholds
        self.grade_thresholds = {
            "A": 0.90,  # Excellent
            "B": 0.80,  # Good
            "C": 0.70,  # Acceptable
            "D": 0.60,  # Needs improvement
            "F": 0.00   # Poor
        }
        
        # Keyword databases for scoring
        self._initialize_keyword_databases()
        
        # Statistical tracking
        self.total_assessments = 0
        self.quality_distribution = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    
    def _initialize_keyword_databases(self):
        """Initialize keyword databases for quality assessment"""
        
        # High-quality business keywords
        self.business_quality_keywords = {
            "market_validation": [
                "시장조사", "고객검증", "mvp", "pilot", "베타테스트", "사용자피드백",
                "market research", "customer validation", "user feedback", "beta test"
            ],
            "revenue_models": [
                "구독", "subscription", "freemium", "saas", "marketplace", "commission",
                "구독료", "수수료", "광고", "프리미엄", "라이센스"
            ],
            "competitive_advantage": [
                "차별화", "독특함", "혁신", "특허", "네트워크효과", "규모의경제",
                "differentiation", "innovation", "patent", "network effect", "moat"
            ],
            "feasibility_indicators": [
                "기존기술", "오픈소스", "api", "클라우드", "스마트폰", "웹",
                "existing technology", "open source", "cloud", "mobile", "web"
            ]
        }
        
        # Low-quality warning signs
        self.quality_warning_signs = [
            "불가능", "너무어려움", "비현실적", "impossible", "too difficult", "unrealistic",
            "완전히새로운", "혁명적인", "전례없는", "completely new", "revolutionary", "unprecedented",
            "모든사람", "누구나", "everyone", "anybody", "모든문제해결", "solve everything"
        ]
        
        # Technical complexity indicators
        self.technical_complexity_keywords = {
            "low": ["웹사이트", "앱", "chatbot", "dashboard", "website", "mobile app"],
            "medium": ["ai", "머신러닝", "blockchain", "iot", "데이터분석", "machine learning"],
            "high": ["quantum", "뇌과학", "우주", "nuclear", "biotech", "gene therapy"]
        }
    
    async def score_pain_point(self, pain_point_data: Dict[str, Any]) -> Dict[str, float]:
        """Score pain point quality"""
        try:
            metrics = QualityMetrics()
            
            # Extract key data
            title = pain_point_data.get("title", "")
            content = pain_point_data.get("content", "")
            source = pain_point_data.get("source", "")
            keywords = pain_point_data.get("keywords", [])
            sentiment_score = pain_point_data.get("sentiment_score", 0.0)
            business_potential = pain_point_data.get("business_potential", 0.0)
            
            # 1. Content Completeness
            metrics.content_completeness = self._assess_content_completeness(title, content, keywords)
            
            # 2. Content Relevance  
            metrics.content_relevance = self._assess_pain_point_relevance(title, content, keywords)
            
            # 3. Business Viability
            metrics.business_viability = self._assess_business_potential(
                content, business_potential, sentiment_score
            )
            
            # 4. Market Validation
            metrics.market_validation = self._assess_market_signals(content, source)
            
            # 5. Technical Soundness
            metrics.technical_soundness = self._assess_technical_feasibility(content, keywords)
            
            # 6. Competitive Advantage Potential
            metrics.competitive_advantage = self._assess_differentiation_potential(content, keywords)
            
            # Calculate overall score
            pain_point_weights = {
                "content_completeness": 0.20,
                "content_relevance": 0.25,
                "business_viability": 0.20,
                "market_validation": 0.15,
                "technical_soundness": 0.10,
                "competitive_advantage": 0.10
            }
            
            metrics.calculate_overall_score(pain_point_weights)
            
            # Calculate confidence level based on data quality
            metrics.confidence_level = self._calculate_confidence_level(pain_point_data)
            
            self.total_assessments += 1
            
            return {
                "content_completeness": metrics.content_completeness,
                "content_relevance": metrics.content_relevance,
                "business_viability": metrics.business_viability,
                "market_validation": metrics.market_validation,
                "technical_soundness": metrics.technical_soundness,
                "competitive_advantage": metrics.competitive_advantage,
                "overall_score": metrics.overall_score,
                "confidence_level": metrics.confidence_level
            }
            
        except Exception as e:
            self.logger.error("Failed to score pain point", error=str(e))
            return {"overall_score": 0.0, "error": True}
    
    async def score_business_idea(self, idea_data: Dict[str, Any], related_pain_points: List[Dict[str, Any]] = None) -> Dict[str, float]:
        """Score business idea quality"""
        try:
            metrics = QualityMetrics()
            
            # Extract key data
            title = idea_data.get("title", "")
            description = idea_data.get("description", "")
            target_market = idea_data.get("target_market", "")
            revenue_model = idea_data.get("revenue_model", "")
            competitive_advantage = idea_data.get("competitive_advantage", "")
            ai_analysis = idea_data.get("ai_analysis", {})
            confidence_score = idea_data.get("confidence_score", 0)
            implementation_difficulty = idea_data.get("implementation_difficulty", 3)
            
            # 1. Content Completeness
            metrics.content_completeness = self._assess_idea_completeness(idea_data)
            
            # 2. Content Relevance
            metrics.content_relevance = self._assess_idea_relevance(
                title, description, target_market, related_pain_points
            )
            
            # 3. Feasibility Score
            metrics.feasibility_score = self._assess_implementation_feasibility(
                description, implementation_difficulty, ai_analysis
            )
            
            # 4. Innovation Score
            metrics.innovation_score = self._assess_innovation_level(
                description, competitive_advantage, ai_analysis
            )
            
            # 5. Market Validation
            metrics.market_validation = self._assess_idea_market_validation(
                target_market, ai_analysis, related_pain_points
            )
            
            # 6. Technical Soundness
            metrics.technical_soundness = self._assess_idea_technical_soundness(
                description, ai_analysis
            )
            
            # 7. Business Viability
            metrics.business_viability = self._assess_idea_business_viability(
                revenue_model, target_market, ai_analysis
            )
            
            # 8. Competitive Advantage
            metrics.competitive_advantage = self._assess_competitive_strength(
                competitive_advantage, ai_analysis
            )
            
            # Calculate overall score with idea-specific weights
            idea_weights = {
                "content_completeness": 0.10,
                "content_relevance": 0.15,
                "feasibility_score": 0.20,
                "innovation_score": 0.10,
                "market_validation": 0.15,
                "technical_soundness": 0.15,
                "business_viability": 0.10,
                "competitive_advantage": 0.05
            }
            
            metrics.calculate_overall_score(idea_weights)
            
            # Adjust for confidence score
            confidence_factor = min(1.0, confidence_score / 100.0)
            metrics.overall_score *= (0.7 + 0.3 * confidence_factor)  # Confidence adjustment
            
            metrics.confidence_level = confidence_factor
            
            self.total_assessments += 1
            
            return {
                "content_completeness": metrics.content_completeness,
                "content_relevance": metrics.content_relevance,
                "feasibility_score": metrics.feasibility_score,
                "innovation_score": metrics.innovation_score,
                "market_validation": metrics.market_validation,
                "technical_soundness": metrics.technical_soundness,
                "business_viability": metrics.business_viability,
                "competitive_advantage": metrics.competitive_advantage,
                "overall_score": metrics.overall_score,
                "confidence_level": metrics.confidence_level
            }
            
        except Exception as e:
            self.logger.error("Failed to score business idea", error=str(e))
            return {"overall_score": 0.0, "error": True}
    
    def assess_quality_comprehensive(self, item_data: Dict[str, Any], item_type: str) -> QualityAssessment:
        """Comprehensive quality assessment with detailed feedback"""
        try:
            # Score the item
            if item_type == "pain_point":
                # This would be async in real implementation
                metrics_dict = {"overall_score": 0.8}  # Placeholder
            else:
                metrics_dict = {"overall_score": 0.8}  # Placeholder
            
            # Create metrics object
            metrics = QualityMetrics()
            for key, value in metrics_dict.items():
                if hasattr(metrics, key):
                    setattr(metrics, key, value)
            
            # Determine grade
            grade = self._calculate_grade(metrics.overall_score)
            
            # Generate detailed feedback
            detailed_feedback = self._generate_detailed_feedback(item_data, metrics, item_type)
            
            # Generate improvement suggestions
            suggestions = self._generate_improvement_suggestions(metrics, item_type)
            
            # Update quality distribution
            self.quality_distribution[grade] += 1
            
            assessment = QualityAssessment(
                item_id=item_data.get("id", f"{item_type}_{int(time.time())}"),
                item_type=item_type,
                metrics=metrics,
                detailed_feedback=detailed_feedback,
                improvement_suggestions=suggestions,
                quality_grade=grade
            )
            
            return assessment
            
        except Exception as e:
            self.logger.error("Failed to assess quality comprehensively", error=str(e))
            # Return minimal assessment
            return QualityAssessment(
                item_id="error",
                item_type=item_type,
                metrics=QualityMetrics(),
                detailed_feedback={"error": str(e)},
                improvement_suggestions=["데이터 품질 개선 필요"],
                quality_grade="F"
            )
    
    def _assess_content_completeness(self, title: str, content: str, keywords: List[str]) -> float:
        """Assess completeness of content"""
        score = 0.0
        
        # Title quality (0-0.3)
        if title and len(title.strip()) > 10:
            score += 0.3
        elif title and len(title.strip()) > 5:
            score += 0.15
        
        # Content quality (0-0.5)
        if content:
            content_length = len(content.strip())
            if content_length > 200:
                score += 0.5
            elif content_length > 100:
                score += 0.3
            elif content_length > 50:
                score += 0.15
        
        # Keywords presence (0-0.2)
        if keywords and len(keywords) >= 3:
            score += 0.2
        elif keywords and len(keywords) >= 1:
            score += 0.1
        
        return min(1.0, score)
    
    def _assess_pain_point_relevance(self, title: str, content: str, keywords: List[str]) -> float:
        """Assess relevance of pain point to business opportunities"""
        text = f"{title} {content}".lower()
        score = 0.5  # Base score
        
        # Business opportunity indicators
        business_indicators = [
            "불편", "문제", "어려움", "힘들다", "개선", "필요", "바라다",
            "problem", "issue", "difficult", "need", "want", "improve"
        ]
        
        for indicator in business_indicators:
            if indicator in text:
                score += 0.1
        
        # Market size indicators
        market_indicators = ["많은사람", "모든", "사용자", "고객", "시장", "users", "market", "customers"]
        for indicator in market_indicators:
            if indicator in text:
                score += 0.05
        
        # Technology relevance
        tech_keywords = keywords or []
        tech_score = min(0.2, len([k for k in tech_keywords if any(tech in k.lower() for tech in ["tech", "app", "web", "ai", "software"])]) * 0.05)
        score += tech_score
        
        return min(1.0, score)
    
    def _assess_business_potential(self, content: str, business_potential: float, sentiment_score: float) -> float:
        """Assess business potential of pain point"""
        score = 0.0
        
        # Use existing business potential if available
        if business_potential > 0:
            score += business_potential * 0.6
        
        # Sentiment analysis contribution
        if sentiment_score < -0.5:  # Strong negative sentiment indicates pain
            score += 0.3
        elif sentiment_score < 0:
            score += 0.15
        
        # Market scale indicators
        content_lower = content.lower()
        scale_indicators = {
            "대규모": 0.1, "많은회사": 0.08, "모든사람": 0.05,
            "large scale": 0.1, "many companies": 0.08, "everyone": 0.05
        }
        
        for indicator, value in scale_indicators.items():
            if indicator in content_lower:
                score += value
        
        return min(1.0, score)
    
    def _assess_market_signals(self, content: str, source: str) -> float:
        """Assess market validation signals"""
        score = 0.4  # Base score
        
        # Source credibility
        trusted_sources = ["reddit", "stackoverflow", "linkedin", "hackernews", "github"]
        if any(source_name in source.lower() for source_name in trusted_sources):
            score += 0.2
        
        # Community engagement indicators
        engagement_signals = ["댓글", "좋아요", "공유", "토론", "comments", "likes", "shares", "discussion"]
        content_lower = content.lower()
        
        for signal in engagement_signals:
            if signal in content_lower:
                score += 0.05
        
        # Frequency indicators
        frequency_words = ["자주", "매번", "항상", "계속", "frequently", "always", "often", "repeatedly"]
        for word in frequency_words:
            if word in content_lower:
                score += 0.1
                break
        
        return min(1.0, score)
    
    def _assess_technical_feasibility(self, content: str, keywords: List[str]) -> float:
        """Assess technical feasibility"""
        content_lower = content.lower()
        score = 0.5  # Base score assuming moderate feasibility
        
        # Check for complexity indicators
        for complexity, tech_keywords in self.technical_complexity_keywords.items():
            matches = sum(1 for keyword in tech_keywords if keyword in content_lower)
            if matches > 0:
                if complexity == "low":
                    score += 0.3
                elif complexity == "medium":
                    score += 0.1
                else:  # high complexity
                    score -= 0.2
        
        # Existing technology utilization
        existing_tech = ["api", "오픈소스", "기존플랫폼", "클라우드", "open source", "existing platform", "cloud"]
        for tech in existing_tech:
            if tech in content_lower:
                score += 0.1
        
        # Warning signs for infeasibility
        for warning in self.quality_warning_signs:
            if warning in content_lower:
                score -= 0.2
        
        return min(1.0, max(0.0, score))
    
    def _assess_differentiation_potential(self, content: str, keywords: List[str]) -> float:
        """Assess potential for competitive differentiation"""
        content_lower = content.lower()
        score = 0.3  # Base score
        
        # Innovation indicators
        innovation_words = ["새로운", "혁신", "독특", "차별화", "unique", "innovative", "new", "different"]
        for word in innovation_words:
            if word in content_lower:
                score += 0.15
        
        # Network effect potential
        network_words = ["커뮤니티", "소셜", "공유", "연결", "community", "social", "network", "connect"]
        for word in network_words:
            if word in content_lower:
                score += 0.1
        
        # Data advantage potential
        data_words = ["데이터", "학습", "개인화", "맞춤", "data", "learning", "personalization", "custom"]
        for word in data_words:
            if word in content_lower:
                score += 0.1
        
        return min(1.0, score)
    
    def _assess_idea_completeness(self, idea_data: Dict[str, Any]) -> float:
        """Assess completeness of business idea"""
        required_fields = [
            "title", "description", "target_market", "revenue_model", 
            "competitive_advantage", "mvp_timeline", "initial_investment"
        ]
        
        score = 0.0
        for field in required_fields:
            value = idea_data.get(field, "")
            if value and len(str(value).strip()) > 10:
                score += 1.0 / len(required_fields)
            elif value and len(str(value).strip()) > 0:
                score += 0.5 / len(required_fields)
        
        # Bonus for AI analysis completeness
        ai_analysis = idea_data.get("ai_analysis", {})
        if ai_analysis and len(ai_analysis) > 3:
            score += 0.1
        
        return min(1.0, score)
    
    def _assess_idea_relevance(self, title: str, description: str, target_market: str, pain_points: List[Dict[str, Any]]) -> float:
        """Assess relevance of idea to original pain points"""
        if not pain_points:
            return 0.6  # Default moderate relevance
        
        idea_text = f"{title} {description} {target_market}".lower()
        score = 0.0
        
        # Check keyword overlap with pain points
        for pain_point in pain_points[:5]:  # Check first 5 pain points
            pp_keywords = pain_point.get("keywords", [])
            pp_content = pain_point.get("content", "").lower()
            
            # Keyword overlap
            matches = sum(1 for keyword in pp_keywords if keyword.lower() in idea_text)
            if matches > 0:
                score += min(0.2, matches * 0.05)
            
            # Content relevance
            common_words = set(idea_text.split()) & set(pp_content.split())
            if len(common_words) > 5:
                score += 0.1
        
        # Category relevance
        relevant_categories = ["technology", "business", "productivity", "social"]
        if any(category in idea_text for category in relevant_categories):
            score += 0.2
        
        return min(1.0, max(0.3, score))  # Minimum 0.3 relevance
    
    def _assess_implementation_feasibility(self, description: str, difficulty: int, ai_analysis: Dict[str, Any]) -> float:
        """Assess implementation feasibility"""
        score = 0.5  # Base score
        
        # Difficulty adjustment (1=easy, 5=very hard)
        difficulty_score = (6 - difficulty) / 5.0  # Invert and normalize
        score = difficulty_score * 0.6
        
        # Technology feasibility
        tech_feasibility = ai_analysis.get("technical_feasibility", {})
        if tech_feasibility:
            tech_risks = tech_feasibility.get("technical_risks", [])
            if len(tech_risks) <= 2:
                score += 0.2
            elif len(tech_risks) <= 4:
                score += 0.1
        
        # Market entry barriers
        competition = ai_analysis.get("competition_analysis", {})
        if competition:
            barriers = competition.get("market_entry_barriers", "")
            if "낮음" in barriers.lower() or "low" in barriers.lower():
                score += 0.2
            elif "중간" in barriers.lower() or "medium" in barriers.lower():
                score += 0.1
        
        return min(1.0, max(0.1, score))
    
    def _assess_innovation_level(self, description: str, competitive_advantage: str, ai_analysis: Dict[str, Any]) -> float:
        """Assess innovation level"""
        text = f"{description} {competitive_advantage}".lower()
        score = 0.4  # Base score
        
        # Innovation keywords
        innovation_indicators = [
            "ai", "머신러닝", "블록체인", "iot", "빅데이터", "개인화",
            "machine learning", "blockchain", "big data", "personalization"
        ]
        
        for indicator in innovation_indicators:
            if indicator in text:
                score += 0.15
        
        # Differentiation strength
        differentiation_words = ["독특", "새로운", "최초", "혁신", "unique", "first", "innovative", "novel"]
        for word in differentiation_words:
            if word in text:
                score += 0.1
        
        # Check for incremental vs breakthrough innovation
        incremental_words = ["개선", "향상", "최적화", "improve", "enhance", "optimize"]
        breakthrough_words = ["혁명", "파괴적", "새로운패러다임", "revolutionary", "disruptive", "paradigm"]
        
        if any(word in text for word in breakthrough_words):
            score += 0.2
        elif any(word in text for word in incremental_words):
            score += 0.1
        
        return min(1.0, score)
    
    def _assess_idea_market_validation(self, target_market: str, ai_analysis: Dict[str, Any], pain_points: List[Dict[str, Any]]) -> float:
        """Assess market validation level"""
        score = 0.3  # Base score
        
        # Market size assessment
        market_research = ai_analysis.get("market_research", {})
        if market_research:
            market_size = market_research.get("market_size_details", "")
            if "대규모" in market_size or "large" in market_size.lower():
                score += 0.3
            elif "중규모" in market_size or "medium" in market_size.lower():
                score += 0.2
            elif "소규모" in market_size or "small" in market_size.lower():
                score += 0.1
        
        # Pain point validation
        if pain_points:
            high_potential_points = sum(1 for pp in pain_points if pp.get("business_potential", 0) > 0.7)
            score += min(0.3, high_potential_points * 0.1)
        
        # Target market specificity
        if target_market and len(target_market) > 20:  # Detailed target market
            score += 0.2
        elif target_market:
            score += 0.1
        
        return min(1.0, score)
    
    def _assess_idea_technical_soundness(self, description: str, ai_analysis: Dict[str, Any]) -> float:
        """Assess technical soundness of idea"""
        score = 0.5  # Base score
        
        # Check for realistic technology stack
        tech_feasibility = ai_analysis.get("technical_feasibility", {})
        if tech_feasibility:
            tech_stack = tech_feasibility.get("technology_stack", [])
            realistic_tech = ["web", "mobile", "cloud", "api", "database", "ai", "ml"]
            
            realistic_count = sum(1 for tech in tech_stack if any(rt in str(tech).lower() for rt in realistic_tech))
            if realistic_count > 0:
                score += min(0.3, realistic_count * 0.1)
        
        # Development timeline reasonableness
        timeline = ai_analysis.get("technical_feasibility", {}).get("development_timeline", "")
        if "개월" in timeline or "month" in timeline.lower():
            # Extract months if possible
            timeline_months = re.findall(r'(\d+).*?개월', timeline)
            if timeline_months:
                months = int(timeline_months[0])
                if 3 <= months <= 18:  # Reasonable timeline
                    score += 0.2
                elif months <= 24:  # Acceptable timeline
                    score += 0.1
        
        # Avoid over-ambitious technical claims
        description_lower = description.lower()
        ambitious_words = ["완전자동화", "100%정확", "모든문제해결", "fully automated", "100% accurate", "solve everything"]
        for word in ambitious_words:
            if word in description_lower:
                score -= 0.2
        
        return min(1.0, max(0.1, score))
    
    def _assess_idea_business_viability(self, revenue_model: str, target_market: str, ai_analysis: Dict[str, Any]) -> float:
        """Assess business viability"""
        score = 0.3  # Base score
        
        # Revenue model assessment
        proven_models = ["구독", "수수료", "광고", "프리미엄", "subscription", "commission", "advertising", "freemium"]
        if any(model in revenue_model.lower() for model in proven_models):
            score += 0.3
        
        # Market size and financial projections
        financial = ai_analysis.get("financial_projections", {})
        if financial:
            revenue_forecast = financial.get("revenue_forecast", {})
            if revenue_forecast and len(revenue_forecast) >= 2:  # Multi-year forecast
                score += 0.2
            
            break_even = financial.get("break_even_analysis", "")
            if break_even and ("년" in break_even or "year" in break_even.lower()):
                score += 0.1
        
        # Customer acquisition strategy
        go_to_market = ai_analysis.get("go_to_market", {})
        if go_to_market:
            acquisition = go_to_market.get("customer_acquisition", {})
            channels = acquisition.get("channels", [])
            if len(channels) >= 2:  # Multiple acquisition channels
                score += 0.2
        
        return min(1.0, score)
    
    def _assess_competitive_strength(self, competitive_advantage: str, ai_analysis: Dict[str, Any]) -> float:
        """Assess competitive advantage strength"""
        score = 0.2  # Base score
        
        # Competitive advantage quality
        if competitive_advantage and len(competitive_advantage) > 50:
            advantage_text = competitive_advantage.lower()
            
            # Strong competitive moats
            strong_moats = ["네트워크효과", "데이터우위", "특허", "네트워크효과", "network effect", "data advantage", "patent"]
            for moat in strong_moats:
                if moat in advantage_text:
                    score += 0.3
                    break
            
            # Moderate advantages
            moderate_advantages = ["사용편의성", "가격우위", "브랜드", "ease of use", "price advantage", "brand"]
            for advantage in moderate_advantages:
                if advantage in advantage_text:
                    score += 0.2
                    break
        
        # Competition analysis depth
        competition = ai_analysis.get("competition_analysis", {})
        if competition:
            if competition.get("direct_competitors") and competition.get("competitive_moat"):
                score += 0.3
            elif competition.get("direct_competitors") or competition.get("competitive_moat"):
                score += 0.2
        
        return min(1.0, score)
    
    def _calculate_confidence_level(self, data: Dict[str, Any]) -> float:
        """Calculate confidence level based on data quality"""
        score = 0.0
        
        # Data completeness
        required_fields = ["title", "content", "source"]
        present_fields = sum(1 for field in required_fields if data.get(field))
        score += (present_fields / len(required_fields)) * 0.4
        
        # Data richness
        if data.get("keywords") and len(data["keywords"]) >= 3:
            score += 0.2
        elif data.get("keywords"):
            score += 0.1
        
        # Source reliability
        source = data.get("source", "").lower()
        if any(trusted in source for trusted in ["reddit", "stackoverflow", "github", "linkedin"]):
            score += 0.2
        
        # Content length
        content_length = len(data.get("content", ""))
        if content_length > 200:
            score += 0.2
        elif content_length > 100:
            score += 0.1
        
        return min(1.0, score)
    
    def _calculate_grade(self, overall_score: float) -> str:
        """Calculate letter grade from overall score"""
        for grade, threshold in self.grade_thresholds.items():
            if overall_score >= threshold:
                return grade
        return "F"
    
    def _generate_detailed_feedback(self, item_data: Dict[str, Any], metrics: QualityMetrics, item_type: str) -> Dict[str, Any]:
        """Generate detailed feedback for improvement"""
        feedback = {
            "strengths": [],
            "weaknesses": [],
            "recommendations": [],
            "score_breakdown": {}
        }
        
        # Score breakdown
        for field in ["content_completeness", "content_relevance", "feasibility_score", "business_viability"]:
            if hasattr(metrics, field):
                score = getattr(metrics, field)
                feedback["score_breakdown"][field] = {
                    "score": round(score, 2),
                    "grade": self._calculate_grade(score)
                }
        
        # Identify strengths (scores > 0.8)
        if metrics.content_completeness > 0.8:
            feedback["strengths"].append("내용이 완전하고 상세합니다")
        if metrics.feasibility_score > 0.8:
            feedback["strengths"].append("실현 가능성이 높습니다")
        if metrics.business_viability > 0.8:
            feedback["strengths"].append("비즈니스 잠재력이 우수합니다")
        
        # Identify weaknesses (scores < 0.6)
        if metrics.content_completeness < 0.6:
            feedback["weaknesses"].append("내용이 불완전하거나 부족합니다")
        if metrics.feasibility_score < 0.6:
            feedback["weaknesses"].append("실현 가능성에 의문이 있습니다")
        if metrics.business_viability < 0.6:
            feedback["weaknesses"].append("비즈니스 모델이 불분명합니다")
        
        return feedback
    
    def _generate_improvement_suggestions(self, metrics: QualityMetrics, item_type: str) -> List[str]:
        """Generate specific improvement suggestions"""
        suggestions = []
        
        if metrics.content_completeness < 0.7:
            suggestions.append("제목과 내용을 더 구체적으로 작성해주세요")
            suggestions.append("핵심 키워드를 3개 이상 포함해주세요")
        
        if metrics.feasibility_score < 0.7:
            suggestions.append("구현 방법을 더 현실적으로 계획해주세요")
            suggestions.append("기존 기술을 활용한 방안을 고려해주세요")
        
        if metrics.business_viability < 0.7:
            suggestions.append("명확한 수익 모델을 제시해주세요")
            suggestions.append("타겟 시장을 더 구체적으로 정의해주세요")
        
        if item_type == "business_idea":
            if metrics.market_validation < 0.7:
                suggestions.append("시장 검증 방법을 추가해주세요")
            if metrics.competitive_advantage < 0.7:
                suggestions.append("경쟁 우위를 더 명확히 해주세요")
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    def get_quality_statistics(self) -> Dict[str, Any]:
        """Get quality scoring statistics"""
        return {
            "total_assessments": self.total_assessments,
            "quality_distribution": self.quality_distribution,
            "high_quality_rate": (
                (self.quality_distribution["A"] + self.quality_distribution["B"]) / 
                max(1, self.total_assessments) * 100
            ),
            "grade_thresholds": self.grade_thresholds
        }

# Global quality scorer instance
_quality_scorer = None

def get_quality_scorer() -> QualityScorer:
    """Get global quality scorer instance"""
    global _quality_scorer
    if _quality_scorer is None:
        _quality_scorer = QualityScorer()
    return _quality_scorer