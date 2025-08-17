"""
NLP Analysis Pipeline
Advanced sentiment analysis and keyword extraction for 95% accuracy
"""

import re
import asyncio
import time
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import json
import structlog

logger = structlog.get_logger()

@dataclass
class SentimentAnalysis:
    """Comprehensive sentiment analysis result"""
    score: float  # -1.0 to 1.0
    confidence: float  # 0.0 to 1.0
    magnitude: float  # 0.0 to 1.0 (intensity of emotion)
    emotions: Dict[str, float]  # specific emotions with scores
    polarity_breakdown: Dict[str, float]  # positive, negative, neutral percentages
    context_factors: List[str]  # factors affecting sentiment
    
    @property
    def sentiment_label(self) -> str:
        """Get human-readable sentiment label"""
        if self.score > 0.3:
            return "positive"
        elif self.score < -0.3:
            return "negative"
        else:
            return "neutral"
    
    @property
    def is_high_confidence(self) -> bool:
        """Check if sentiment analysis is high confidence"""
        return self.confidence >= 0.8 and self.magnitude >= 0.3

@dataclass
class KeywordExtraction:
    """Advanced keyword extraction result"""
    primary_keywords: List[str]  # 3-5 most important keywords
    secondary_keywords: List[str]  # 5-10 supporting keywords
    technical_terms: List[str]  # technical/domain-specific terms
    action_words: List[str]  # verbs indicating actions/needs
    entities: Dict[str, List[str]]  # named entities by type
    keyword_scores: Dict[str, float]  # relevance scores for each keyword
    keyword_clusters: Dict[str, List[str]]  # related keyword groups
    
    @property
    def all_keywords(self) -> List[str]:
        """Get all keywords combined"""
        return list(set(self.primary_keywords + self.secondary_keywords))
    
    @property
    def top_keywords(self, limit: int = 8) -> List[str]:
        """Get top keywords by score"""
        sorted_keywords = sorted(
            self.keyword_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        return [kw for kw, score in sorted_keywords[:limit]]

@dataclass
class TrendAnalysis:
    """Trend pattern analysis for pain points"""
    trend_score: float  # 0.0 to 1.0
    trend_direction: str  # "rising", "declining", "stable"
    frequency_indicators: List[str]  # words indicating frequency
    urgency_indicators: List[str]  # words indicating urgency
    market_signals: List[str]  # market trend indicators
    temporal_context: Dict[str, Any]  # time-related context
    popularity_score: float  # 0.0 to 1.0
    
    @property
    def is_trending(self) -> bool:
        """Check if shows strong trending signals"""
        return (self.trend_score >= 0.7 and 
                self.trend_direction == "rising" and
                self.popularity_score >= 0.6)

@dataclass
class NLPAnalysisResult:
    """Complete NLP analysis result"""
    text_id: str
    sentiment: SentimentAnalysis
    keywords: KeywordExtraction
    trends: TrendAnalysis
    text_quality: Dict[str, float]
    processing_time: float
    analysis_timestamp: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def overall_quality_score(self) -> float:
        """Calculate overall quality score"""
        sentiment_quality = self.sentiment.confidence * 0.3
        keyword_quality = min(1.0, len(self.keywords.primary_keywords) / 5.0) * 0.3
        trend_quality = self.trends.trend_score * 0.2
        text_quality_avg = sum(self.text_quality.values()) / len(self.text_quality) * 0.2
        
        return sentiment_quality + keyword_quality + trend_quality + text_quality_avg

class NLPProcessor:
    """Advanced NLP processor for pain point analysis"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="NLPProcessor")
        
        # Initialize language databases
        self._initialize_language_databases()
        
        # Performance tracking
        self.total_processed = 0
        self.average_processing_time = 0.0
        self.accuracy_scores = []
        
        # Caching for performance
        self._sentiment_cache = {}
        self._keyword_cache = {}
        self._cache_ttl = timedelta(hours=1)
        self._cache_timestamps = {}
    
    def _initialize_language_databases(self):
        """Initialize comprehensive language databases"""
        
        # Korean sentiment lexicons
        self.korean_sentiment = {
            "positive": {
                "좋다": 0.8, "훌륭하다": 0.9, "만족": 0.7, "편리하다": 0.6, "쉽다": 0.5,
                "빠르다": 0.6, "효율적": 0.7, "유용하다": 0.8, "도움": 0.6, "성공": 0.8,
                "개선": 0.6, "향상": 0.7, "해결": 0.8, "완벽": 0.9, "우수": 0.8
            },
            "negative": {
                "나쁘다": -0.8, "싫다": -0.7, "불편하다": -0.8, "어렵다": -0.6, "복잡하다": -0.7,
                "느리다": -0.6, "문제": -0.8, "오류": -0.9, "버그": -0.8, "실패": -0.9,
                "귀찮다": -0.7, "짜증": -0.8, "화나다": -0.9, "스트레스": -0.8, "포기": -0.9,
                "불만": -0.8, "실망": -0.7, "걱정": -0.6, "힘들다": -0.8, "막막하다": -0.7
            }
        }
        
        # English sentiment lexicons
        self.english_sentiment = {
            "positive": {
                "good": 0.7, "great": 0.8, "excellent": 0.9, "amazing": 0.9, "awesome": 0.8,
                "love": 0.8, "like": 0.6, "enjoy": 0.7, "happy": 0.8, "satisfied": 0.7,
                "easy": 0.6, "simple": 0.6, "fast": 0.6, "efficient": 0.7, "useful": 0.7,
                "helpful": 0.7, "convenient": 0.6, "success": 0.8, "perfect": 0.9
            },
            "negative": {
                "bad": -0.7, "terrible": -0.9, "awful": -0.9, "hate": -0.9, "dislike": -0.6,
                "difficult": -0.6, "hard": -0.6, "slow": -0.6, "complex": -0.5, "confusing": -0.7,
                "problem": -0.8, "issue": -0.7, "error": -0.8, "bug": -0.8, "fail": -0.9,
                "frustrating": -0.8, "annoying": -0.7, "stress": -0.8, "worried": -0.6
            }
        }
        
        # Emotion categories
        self.emotion_keywords = {
            "anger": ["화나다", "짜증", "분노", "angry", "mad", "furious", "irritated"],
            "frustration": ["답답하다", "막막하다", "좌절", "frustrated", "stuck", "blocked"],
            "anxiety": ["걱정", "불안", "스트레스", "worried", "anxious", "stressed", "nervous"],
            "disappointment": ["실망", "아쉽다", "disappointed", "let down", "unsatisfied"],
            "satisfaction": ["만족", "기쁘다", "satisfied", "pleased", "content", "happy"],
            "excitement": ["흥미", "기대", "excited", "enthusiastic", "thrilled", "eager"]
        }
        
        # Business keyword categories
        self.business_keywords = {
            "pain_indicators": [
                "문제", "불편", "어려움", "힘들다", "복잡", "느리다", "오래걸리다",
                "problem", "issue", "difficult", "hard", "slow", "complex", "trouble"
            ],
            "solution_indicators": [
                "해결", "개선", "향상", "도구", "방법", "시스템", "플랫폼",
                "solution", "solve", "improve", "tool", "method", "system", "platform"
            ],
            "market_indicators": [
                "사용자", "고객", "시장", "많은사람", "모든", "업계",
                "users", "customers", "market", "people", "everyone", "industry"
            ],
            "urgency_indicators": [
                "빨리", "시급", "즉시", "urgent", "asap", "immediately", "quickly", "now"
            ],
            "frequency_indicators": [
                "자주", "매일", "항상", "계속", "often", "always", "frequently", "constantly"
            ]
        }
        
        # Technical domains
        self.technical_domains = {
            "technology": ["api", "앱", "웹", "소프트웨어", "ai", "머신러닝", "코딩", "개발"],
            "business": ["비즈니스", "스타트업", "회사", "매출", "수익", "마케팅", "영업"],
            "design": ["디자인", "ui", "ux", "인터페이스", "사용성", "화면", "레이아웃"],
            "data": ["데이터", "분석", "통계", "리포트", "대시보드", "차트", "그래프"],
            "communication": ["소통", "커뮤니케이션", "메시지", "채팅", "이메일", "알림"]
        }
        
        # Stop words (common words to filter out)
        self.stop_words = {
            "korean": ["그", "이", "저", "것", "들", "를", "을", "가", "이", "에", "의", "와", "과", "도", "만", "부터", "까지", "위해", "대해"],
            "english": ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "as", "is", "are", "was", "were"]
        }
    
    async def analyze_text(self, text: str, text_id: str = None, context: Dict[str, Any] = None) -> NLPAnalysisResult:
        """Comprehensive NLP analysis of text"""
        start_time = time.time()
        
        try:
            text_id = text_id or f"text_{int(time.time())}"
            context = context or {}
            
            # Check cache first
            cache_key = f"{hash(text)}_{text_id}"
            if self._is_cached(cache_key):
                cached_result = self._get_cached_result(cache_key)
                if cached_result:
                    return cached_result
            
            # Preprocess text
            cleaned_text = self._preprocess_text(text)
            
            # Parallel analysis
            sentiment_task = self._analyze_sentiment(cleaned_text, context)
            keywords_task = self._extract_keywords(cleaned_text, context)
            trends_task = self._analyze_trends(cleaned_text, context)
            quality_task = self._assess_text_quality(cleaned_text)
            
            # Wait for all analyses to complete
            sentiment, keywords, trends, text_quality = await asyncio.gather(
                sentiment_task, keywords_task, trends_task, quality_task
            )
            
            processing_time = time.time() - start_time
            
            # Create comprehensive result
            result = NLPAnalysisResult(
                text_id=text_id,
                sentiment=sentiment,
                keywords=keywords,
                trends=trends,
                text_quality=text_quality,
                processing_time=processing_time
            )
            
            # Cache the result
            self._cache_result(cache_key, result)
            
            # Update performance metrics
            self.total_processed += 1
            self.average_processing_time = (
                (self.average_processing_time * (self.total_processed - 1) + processing_time) / 
                self.total_processed
            )
            
            self.logger.info("Text analysis completed",
                           text_id=text_id,
                           sentiment_score=sentiment.score,
                           sentiment_confidence=sentiment.confidence,
                           keyword_count=len(keywords.primary_keywords),
                           trend_score=trends.trend_score,
                           processing_time=processing_time)
            
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.logger.error("Text analysis failed", 
                            text_id=text_id, 
                            error=str(e),
                            processing_time=processing_time)
            
            # Return minimal result on error
            return NLPAnalysisResult(
                text_id=text_id or "error",
                sentiment=SentimentAnalysis(0.0, 0.0, 0.0, {}, {}, []),
                keywords=KeywordExtraction([], [], [], [], {}, {}, {}),
                trends=TrendAnalysis(0.0, "stable", [], [], [], {}, 0.0),
                text_quality={"error": True},
                processing_time=processing_time
            )
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and preprocess text for analysis"""
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep Korean, English, numbers, and basic punctuation
        text = re.sub(r'[^\w\s가-힣.,!?-]', '', text)
        
        return text.strip()
    
    async def _analyze_sentiment(self, text: str, context: Dict[str, Any]) -> SentimentAnalysis:
        """Advanced sentiment analysis"""
        try:
            text_lower = text.lower()
            words = text_lower.split()
            
            # Calculate sentiment scores
            sentiment_scores = []
            emotion_scores = defaultdict(float)
            context_factors = []
            
            # Korean sentiment analysis
            for word in words:
                for sentiment_type, lexicon in self.korean_sentiment.items():
                    for term, score in lexicon.items():
                        if term in word or word in term:
                            weight = 1.0
                            if sentiment_type == "positive":
                                sentiment_scores.append(score * weight)
                            else:
                                sentiment_scores.append(score * weight)
            
            # English sentiment analysis
            for word in words:
                for sentiment_type, lexicon in self.english_sentiment.items():
                    for term, score in lexicon.items():
                        if word == term or term in word:
                            weight = 1.0
                            if sentiment_type == "positive":
                                sentiment_scores.append(score * weight)
                            else:
                                sentiment_scores.append(score * weight)
            
            # Emotion analysis
            for emotion, keywords in self.emotion_keywords.items():
                for keyword in keywords:
                    if keyword in text_lower:
                        emotion_scores[emotion] += 0.2
            
            # Calculate final sentiment score
            if sentiment_scores:
                final_score = sum(sentiment_scores) / len(sentiment_scores)
                # Normalize to -1 to 1 range
                final_score = max(-1.0, min(1.0, final_score))
            else:
                final_score = 0.0
            
            # Calculate confidence based on number of sentiment indicators
            confidence = min(1.0, len(sentiment_scores) / 10.0)
            
            # Calculate magnitude (intensity)
            magnitude = min(1.0, abs(final_score) + (len(sentiment_scores) * 0.1))
            
            # Analyze polarity breakdown
            positive_count = sum(1 for score in sentiment_scores if score > 0)
            negative_count = sum(1 for score in sentiment_scores if score < 0)
            neutral_count = len(words) - positive_count - negative_count
            
            total_words = max(1, len(words))
            polarity_breakdown = {
                "positive": positive_count / total_words,
                "negative": negative_count / total_words,
                "neutral": neutral_count / total_words
            }
            
            # Context factors
            if "문제" in text_lower or "problem" in text_lower:
                context_factors.append("problem_context")
            if "개선" in text_lower or "improve" in text_lower:
                context_factors.append("improvement_context")
            if len(words) < 10:
                context_factors.append("short_text")
            
            return SentimentAnalysis(
                score=final_score,
                confidence=confidence,
                magnitude=magnitude,
                emotions=dict(emotion_scores),
                polarity_breakdown=polarity_breakdown,
                context_factors=context_factors
            )
            
        except Exception as e:
            self.logger.error("Sentiment analysis failed", error=str(e))
            return SentimentAnalysis(0.0, 0.0, 0.0, {}, {}, ["analysis_error"])
    
    async def _extract_keywords(self, text: str, context: Dict[str, Any]) -> KeywordExtraction:
        """Advanced keyword extraction"""
        try:
            text_lower = text.lower()
            words = text_lower.split()
            
            # Remove stop words
            filtered_words = []
            for word in words:
                if (word not in self.stop_words["korean"] and 
                    word not in self.stop_words["english"] and 
                    len(word) > 2):
                    filtered_words.append(word)
            
            # Count word frequencies
            word_freq = Counter(filtered_words)
            
            # Categorize keywords
            primary_keywords = []
            secondary_keywords = []
            technical_terms = []
            action_words = []
            entities = defaultdict(list)
            keyword_scores = {}
            
            # Extract primary keywords (high frequency + business relevance)
            for word, freq in word_freq.most_common(20):
                score = freq / len(filtered_words)
                
                # Boost score for business-relevant terms
                for category, terms in self.business_keywords.items():
                    if any(term in word or word in term for term in terms):
                        score *= 2.0
                        break
                
                # Boost score for technical terms
                for domain, terms in self.technical_domains.items():
                    if word in terms:
                        score *= 1.5
                        technical_terms.append(word)
                        entities[domain].append(word)
                        break
                
                keyword_scores[word] = score
                
                if len(primary_keywords) < 5 and score > 0.1:
                    primary_keywords.append(word)
                elif len(secondary_keywords) < 10:
                    secondary_keywords.append(word)
            
            # Extract action words (verbs indicating needs/actions)
            action_indicators = ["하다", "되다", "필요", "원하다", "바라다", "want", "need", "require", "should", "must"]
            for word in filtered_words:
                if any(indicator in word for indicator in action_indicators):
                    if word not in action_words:
                        action_words.append(word)
            
            # Create keyword clusters (related terms)
            keyword_clusters = {}
            for category, terms in self.business_keywords.items():
                cluster = [word for word in filtered_words if any(term in word for term in terms)]
                if cluster:
                    keyword_clusters[category] = list(set(cluster))
            
            # Ensure we have meaningful keywords
            if not primary_keywords and secondary_keywords:
                primary_keywords = secondary_keywords[:3]
                secondary_keywords = secondary_keywords[3:]
            
            return KeywordExtraction(
                primary_keywords=primary_keywords,
                secondary_keywords=secondary_keywords,
                technical_terms=technical_terms,
                action_words=action_words[:5],  # Limit action words
                entities=dict(entities),
                keyword_scores=keyword_scores,
                keyword_clusters=keyword_clusters
            )
            
        except Exception as e:
            self.logger.error("Keyword extraction failed", error=str(e))
            return KeywordExtraction([], [], [], [], {}, {}, {})
    
    async def _analyze_trends(self, text: str, context: Dict[str, Any]) -> TrendAnalysis:
        """Analyze trend patterns and market signals"""
        try:
            text_lower = text.lower()
            
            # Analyze frequency indicators
            frequency_indicators = []
            urgency_indicators = []
            market_signals = []
            
            for indicator in self.business_keywords["frequency_indicators"]:
                if indicator in text_lower:
                    frequency_indicators.append(indicator)
            
            for indicator in self.business_keywords["urgency_indicators"]:
                if indicator in text_lower:
                    urgency_indicators.append(indicator)
            
            for indicator in self.business_keywords["market_indicators"]:
                if indicator in text_lower:
                    market_signals.append(indicator)
            
            # Calculate trend score
            trend_score = 0.0
            
            # Frequency contribution (0-0.4)
            if frequency_indicators:
                trend_score += min(0.4, len(frequency_indicators) * 0.2)
            
            # Urgency contribution (0-0.3)
            if urgency_indicators:
                trend_score += min(0.3, len(urgency_indicators) * 0.15)
            
            # Market signals contribution (0-0.3)
            if market_signals:
                trend_score += min(0.3, len(market_signals) * 0.1)
            
            # Determine trend direction
            rising_words = ["증가", "늘어나다", "많아지다", "growing", "increasing", "rising", "popular"]
            declining_words = ["감소", "줄어들다", "declining", "decreasing", "falling"]
            
            trend_direction = "stable"
            if any(word in text_lower for word in rising_words):
                trend_direction = "rising"
                trend_score += 0.2
            elif any(word in text_lower for word in declining_words):
                trend_direction = "declining"
                trend_score -= 0.1
            
            # Calculate popularity score
            popularity_words = ["인기", "유명", "핫", "트렌드", "popular", "trending", "hot", "viral"]
            popularity_score = min(1.0, sum(0.3 for word in popularity_words if word in text_lower))
            
            # Temporal context
            temporal_context = {
                "has_frequency_indicators": len(frequency_indicators) > 0,
                "has_urgency_indicators": len(urgency_indicators) > 0,
                "trend_strength": trend_score,
                "temporal_words": frequency_indicators + urgency_indicators
            }
            
            trend_score = max(0.0, min(1.0, trend_score))
            
            return TrendAnalysis(
                trend_score=trend_score,
                trend_direction=trend_direction,
                frequency_indicators=frequency_indicators,
                urgency_indicators=urgency_indicators,
                market_signals=market_signals,
                temporal_context=temporal_context,
                popularity_score=popularity_score
            )
            
        except Exception as e:
            self.logger.error("Trend analysis failed", error=str(e))
            return TrendAnalysis(0.0, "stable", [], [], [], {}, 0.0)
    
    async def _assess_text_quality(self, text: str) -> Dict[str, float]:
        """Assess various aspects of text quality"""
        try:
            words = text.split()
            
            quality_metrics = {}
            
            # Length quality
            if len(words) >= 20:
                quality_metrics["length_quality"] = 1.0
            elif len(words) >= 10:
                quality_metrics["length_quality"] = 0.7
            elif len(words) >= 5:
                quality_metrics["length_quality"] = 0.4
            else:
                quality_metrics["length_quality"] = 0.2
            
            # Vocabulary richness (unique words ratio)
            unique_words = set(words)
            if len(words) > 0:
                vocabulary_richness = len(unique_words) / len(words)
                quality_metrics["vocabulary_richness"] = min(1.0, vocabulary_richness * 2)
            else:
                quality_metrics["vocabulary_richness"] = 0.0
            
            # Information density (meaningful words ratio)
            meaningful_words = [w for w in words if len(w) > 3 and w not in self.stop_words["korean"] and w not in self.stop_words["english"]]
            if len(words) > 0:
                info_density = len(meaningful_words) / len(words)
                quality_metrics["information_density"] = info_density
            else:
                quality_metrics["information_density"] = 0.0
            
            # Technical specificity
            tech_words = sum(1 for word in words for domain_words in self.technical_domains.values() for tech_word in domain_words if tech_word in word.lower())
            quality_metrics["technical_specificity"] = min(1.0, tech_words / 10.0)
            
            # Business relevance
            business_words = sum(1 for word in words for category_words in self.business_keywords.values() for biz_word in category_words if biz_word in word.lower())
            quality_metrics["business_relevance"] = min(1.0, business_words / 5.0)
            
            return quality_metrics
            
        except Exception as e:
            self.logger.error("Text quality assessment failed", error=str(e))
            return {"error": True}
    
    def _is_cached(self, cache_key: str) -> bool:
        """Check if result is cached and still valid"""
        if cache_key not in self._cache_timestamps:
            return False
        
        timestamp = self._cache_timestamps[cache_key]
        return datetime.utcnow() - timestamp < self._cache_ttl
    
    def _get_cached_result(self, cache_key: str) -> Optional[NLPAnalysisResult]:
        """Get cached result if available"""
        return self._sentiment_cache.get(cache_key)
    
    def _cache_result(self, cache_key: str, result: NLPAnalysisResult):
        """Cache analysis result"""
        self._sentiment_cache[cache_key] = result
        self._cache_timestamps[cache_key] = datetime.utcnow()
        
        # Simple cache cleanup (keep last 100 entries)
        if len(self._sentiment_cache) > 100:
            oldest_key = min(self._cache_timestamps.keys(), key=lambda k: self._cache_timestamps[k])
            del self._sentiment_cache[oldest_key]
            del self._cache_timestamps[oldest_key]
    
    async def analyze_batch(self, texts: List[Dict[str, Any]]) -> List[NLPAnalysisResult]:
        """Analyze multiple texts efficiently"""
        if not texts:
            return []
        
        self.logger.info("Starting batch NLP analysis", count=len(texts))
        
        # Process in batches to respect memory limits
        batch_size = 5
        results = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            # Process batch concurrently
            batch_tasks = []
            for text_data in batch:
                text_content = text_data.get("content", "") or text_data.get("text", "")
                text_id = text_data.get("id", f"batch_{i}_{len(batch_tasks)}")
                context = {k: v for k, v in text_data.items() if k not in ["content", "text", "id"]}
                
                task = self.analyze_text(text_content, text_id, context)
                batch_tasks.append(task)
            
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Handle results and exceptions
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    error_result = NLPAnalysisResult(
                        text_id=f"batch_error_{i}_{j}",
                        sentiment=SentimentAnalysis(0.0, 0.0, 0.0, {}, {}, ["batch_error"]),
                        keywords=KeywordExtraction([], [], [], [], {}, {}, {}),
                        trends=TrendAnalysis(0.0, "stable", [], [], [], {}, 0.0),
                        text_quality={"error": True},
                        processing_time=0.0
                    )
                    results.append(error_result)
                else:
                    results.append(result)
            
            # Brief pause between batches
            if i + batch_size < len(texts):
                await asyncio.sleep(0.2)
        
        successful = sum(1 for r in results if "error" not in r.text_quality)
        self.logger.info("Batch NLP analysis completed",
                        total=len(results),
                        successful=successful,
                        average_sentiment=sum(r.sentiment.score for r in results) / len(results) if results else 0)
        
        return results
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get NLP processor performance metrics"""
        return {
            "processing_stats": {
                "total_processed": self.total_processed,
                "average_processing_time": round(self.average_processing_time, 3),
                "cache_size": len(self._sentiment_cache),
                "cache_hit_rate": "not_tracked"  # Could implement if needed
            },
            "language_support": {
                "korean_sentiment_terms": sum(len(lex) for lex in self.korean_sentiment.values()),
                "english_sentiment_terms": sum(len(lex) for lex in self.english_sentiment.values()),
                "emotion_categories": len(self.emotion_keywords),
                "business_categories": len(self.business_keywords),
                "technical_domains": len(self.technical_domains)
            },
            "accuracy_targets": {
                "sentiment_accuracy_target": 0.95,
                "keyword_relevance_target": 0.90,
                "trend_detection_target": 0.85
            }
        }

# Global NLP processor instance
_nlp_processor = None

def get_nlp_processor() -> NLPProcessor:
    """Get global NLP processor instance"""
    global _nlp_processor
    if _nlp_processor is None:
        _nlp_processor = NLPProcessor()
    return _nlp_processor