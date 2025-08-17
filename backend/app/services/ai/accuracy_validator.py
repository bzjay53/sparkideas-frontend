"""
Accuracy Validation System
A/B testing and accuracy metrics for 92% AI accuracy validation
"""

import asyncio
import time
import random
import statistics
import math
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict, deque
from enum import Enum
import json
import structlog

logger = structlog.get_logger()

class TestType(Enum):
    """Types of A/B tests"""
    SENTIMENT_ANALYSIS = "sentiment_analysis"
    KEYWORD_EXTRACTION = "keyword_extraction"
    IDEA_GENERATION = "idea_generation"
    QUALITY_SCORING = "quality_scoring"
    TREND_ANALYSIS = "trend_analysis"

@dataclass
class ABTestResult:
    """Single A/B test result"""
    test_id: str
    test_type: TestType
    control_result: Any
    variant_result: Any
    ground_truth: Any
    control_accuracy: float
    variant_accuracy: float
    improvement: float
    confidence_level: float
    sample_size: int
    test_duration: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def is_significant(self) -> bool:
        """Check if improvement is statistically significant"""
        return (abs(self.improvement) > 0.05 and 
                self.confidence_level > 0.95 and
                self.sample_size >= 30)
    
    @property
    def winner(self) -> str:
        """Determine which variant performs better"""
        if self.is_significant:
            return "variant" if self.improvement > 0 else "control"
        else:
            return "no_significant_difference"

@dataclass
class AccuracyMetrics:
    """Comprehensive accuracy metrics"""
    overall_accuracy: float
    component_accuracies: Dict[str, float]
    precision_scores: Dict[str, float]
    recall_scores: Dict[str, float]
    f1_scores: Dict[str, float]
    confidence_intervals: Dict[str, Tuple[float, float]]
    sample_sizes: Dict[str, int]
    error_analysis: Dict[str, List[str]]
    temporal_trends: Dict[str, List[float]]
    
    @property
    def meets_target(self) -> bool:
        """Check if overall accuracy meets 92% target"""
        return self.overall_accuracy >= 0.92
    
    @property
    def quality_grade(self) -> str:
        """Get quality grade based on accuracy"""
        if self.overall_accuracy >= 0.95:
            return "A+"
        elif self.overall_accuracy >= 0.92:
            return "A"
        elif self.overall_accuracy >= 0.88:
            return "B+"
        elif self.overall_accuracy >= 0.85:
            return "B"
        else:
            return "C"

class AccuracyValidator:
    """Advanced accuracy validation and A/B testing system"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="AccuracyValidator")
        
        # Test configuration
        self.min_sample_size = 30
        self.confidence_threshold = 0.95
        self.significance_threshold = 0.05
        
        # Ground truth datasets for validation
        self._initialize_ground_truth_datasets()
        
        # Test history and metrics tracking
        self.test_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self.accuracy_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.current_metrics = AccuracyMetrics(
            overall_accuracy=0.0,
            component_accuracies={},
            precision_scores={},
            recall_scores={},
            f1_scores={},
            confidence_intervals={},
            sample_sizes={},
            error_analysis={},
            temporal_trends={}
        )
        
        # A/B test tracking
        self.active_tests: Dict[str, Dict[str, Any]] = {}
        self.completed_tests: List[ABTestResult] = []
        
        # Performance tracking
        self.total_validations = 0
        self.successful_validations = 0
    
    def _initialize_ground_truth_datasets(self):
        """Initialize ground truth datasets for validation"""
        
        # Sentiment analysis ground truth
        self.sentiment_ground_truth = [
            {
                "text": "모바일 앱이 너무 느려서 짜증나요. 로딩이 10초나 걸립니다.",
                "expected_sentiment": -0.8,
                "expected_emotions": ["anger", "frustration"],
                "context": "performance_complaint"
            },
            {
                "text": "This new feature is amazing! It saves me so much time every day.",
                "expected_sentiment": 0.9,
                "expected_emotions": ["satisfaction", "excitement"],
                "context": "feature_praise"
            },
            {
                "text": "결제 과정이 복잡해서 중간에 포기하게 됩니다. 간단하게 만들어주세요.",
                "expected_sentiment": -0.6,
                "expected_emotions": ["frustration"],
                "context": "usability_issue"
            },
            {
                "text": "AI가 정확히 제가 원하는 것을 추천해주네요. 정말 좋습니다.",
                "expected_sentiment": 0.8,
                "expected_emotions": ["satisfaction"],
                "context": "ai_recommendation"
            }
        ]
        
        # Keyword extraction ground truth
        self.keyword_ground_truth = [
            {
                "text": "데이터베이스 연결이 자주 끊어져서 업무에 지장이 있습니다. API 호출도 실패합니다.",
                "expected_keywords": ["데이터베이스", "연결", "API", "호출", "실패", "업무"],
                "expected_technical_terms": ["데이터베이스", "API"],
                "expected_category": "technology"
            },
            {
                "text": "스타트업에서 고객 관리 시스템이 필요한데 비용이 너무 비쌉니다.",
                "expected_keywords": ["스타트업", "고객", "관리", "시스템", "비용", "비싸다"],
                "expected_technical_terms": ["시스템"],
                "expected_category": "business"
            }
        ]
        
        # Business idea quality ground truth
        self.idea_quality_ground_truth = [
            {
                "idea": {
                    "title": "AI 기반 개인화 학습 플랫폼",
                    "description": "머신러닝을 활용하여 각 학생의 학습 패턴을 분석하고 맞춤형 커리큘럼을 제공하는 교육 플랫폼",
                    "target_market": "중고등학생 및 학부모",
                    "revenue_model": "월 구독료 + 프리미엄 과정",
                    "confidence_score": 85
                },
                "expected_quality_score": 0.88,
                "expected_feasibility": 0.85,
                "expected_market_validation": 0.80,
                "reasoning": "AI 교육 시장 성장, 개인화 트렌드, 기술적 실현 가능성"
            }
        ]
    
    async def run_ab_test(self, test_type: TestType, control_algorithm: callable, 
                         variant_algorithm: callable, test_data: List[Dict[str, Any]], 
                         test_name: str = None) -> ABTestResult:
        """Run A/B test comparing two algorithms"""
        
        test_id = f"{test_type.value}_{test_name or 'test'}_{int(time.time())}"
        start_time = time.time()
        
        try:
            self.logger.info("Starting A/B test", test_id=test_id, test_type=test_type.value)
            
            # Prepare test data
            if len(test_data) < self.min_sample_size:
                raise ValueError(f"Insufficient test data. Need at least {self.min_sample_size} samples")
            
            # Randomize and split data
            random.shuffle(test_data)
            
            # Run both algorithms on all data for comparison
            control_results = []
            variant_results = []
            ground_truths = []
            
            for data_point in test_data:
                try:
                    # Run control algorithm
                    control_result = await control_algorithm(data_point)
                    control_results.append(control_result)
                    
                    # Run variant algorithm
                    variant_result = await variant_algorithm(data_point)
                    variant_results.append(variant_result)
                    
                    # Extract ground truth
                    ground_truth = self._extract_ground_truth(test_type, data_point)
                    ground_truths.append(ground_truth)
                    
                except Exception as e:
                    self.logger.warning("Test data point failed", error=str(e))
                    continue
            
            if len(control_results) < self.min_sample_size:
                raise ValueError("Too many test failures, insufficient valid results")
            
            # Calculate accuracies
            control_accuracy = self._calculate_accuracy(test_type, control_results, ground_truths)
            variant_accuracy = self._calculate_accuracy(test_type, variant_results, ground_truths)
            
            # Calculate improvement and statistical significance
            improvement = variant_accuracy - control_accuracy
            confidence_level = self._calculate_confidence_level(
                control_results, variant_results, ground_truths, test_type
            )
            
            test_duration = time.time() - start_time
            
            # Create test result
            ab_result = ABTestResult(
                test_id=test_id,
                test_type=test_type,
                control_result=control_results,
                variant_result=variant_results,
                ground_truth=ground_truths,
                control_accuracy=control_accuracy,
                variant_accuracy=variant_accuracy,
                improvement=improvement,
                confidence_level=confidence_level,
                sample_size=len(control_results),
                test_duration=test_duration,
                metadata={
                    "test_name": test_name or "unnamed",
                    "control_algorithm": control_algorithm.__name__ if hasattr(control_algorithm, '__name__') else "unknown",
                    "variant_algorithm": variant_algorithm.__name__ if hasattr(variant_algorithm, '__name__') else "unknown"
                }
            )
            
            # Store results
            self.completed_tests.append(ab_result)
            self.test_history[test_type.value].append(ab_result)
            
            self.logger.info("A/B test completed",
                           test_id=test_id,
                           control_accuracy=control_accuracy,
                           variant_accuracy=variant_accuracy,
                           improvement=improvement,
                           is_significant=ab_result.is_significant,
                           winner=ab_result.winner)
            
            return ab_result
            
        except Exception as e:
            test_duration = time.time() - start_time
            self.logger.error("A/B test failed", test_id=test_id, error=str(e))
            
            # Return failed test result
            return ABTestResult(
                test_id=test_id,
                test_type=test_type,
                control_result=[],
                variant_result=[],
                ground_truth=[],
                control_accuracy=0.0,
                variant_accuracy=0.0,
                improvement=0.0,
                confidence_level=0.0,
                sample_size=0,
                test_duration=test_duration,
                metadata={"error": str(e)}
            )
    
    async def validate_system_accuracy(self, ai_components: Dict[str, Any]) -> AccuracyMetrics:
        """Validate overall system accuracy against ground truth datasets"""
        
        try:
            self.logger.info("Starting comprehensive accuracy validation")
            
            component_accuracies = {}
            precision_scores = {}
            recall_scores = {}
            f1_scores = {}
            sample_sizes = {}
            error_analysis = defaultdict(list)
            
            # Validate sentiment analysis
            if "nlp_processor" in ai_components:
                sentiment_metrics = await self._validate_sentiment_analysis(
                    ai_components["nlp_processor"]
                )
                component_accuracies["sentiment_analysis"] = sentiment_metrics["accuracy"]
                precision_scores["sentiment_analysis"] = sentiment_metrics["precision"]
                recall_scores["sentiment_analysis"] = sentiment_metrics["recall"]
                f1_scores["sentiment_analysis"] = sentiment_metrics["f1"]
                sample_sizes["sentiment_analysis"] = sentiment_metrics["sample_size"]
                error_analysis["sentiment_analysis"] = sentiment_metrics["errors"]
            
            # Validate keyword extraction
            if "nlp_processor" in ai_components:
                keyword_metrics = await self._validate_keyword_extraction(
                    ai_components["nlp_processor"]
                )
                component_accuracies["keyword_extraction"] = keyword_metrics["accuracy"]
                precision_scores["keyword_extraction"] = keyword_metrics["precision"]
                recall_scores["keyword_extraction"] = keyword_metrics["recall"]
                f1_scores["keyword_extraction"] = keyword_metrics["f1"]
                sample_sizes["keyword_extraction"] = keyword_metrics["sample_size"]
                error_analysis["keyword_extraction"] = keyword_metrics["errors"]
            
            # Validate idea generation quality
            if "idea_generator" in ai_components:
                idea_metrics = await self._validate_idea_quality(
                    ai_components["idea_generator"]
                )
                component_accuracies["idea_generation"] = idea_metrics["accuracy"]
                precision_scores["idea_generation"] = idea_metrics["precision"]
                recall_scores["idea_generation"] = idea_metrics["recall"]
                f1_scores["idea_generation"] = idea_metrics["f1"]
                sample_sizes["idea_generation"] = idea_metrics["sample_size"]
                error_analysis["idea_generation"] = idea_metrics["errors"]
            
            # Calculate overall accuracy (weighted average)
            total_samples = sum(sample_sizes.values())
            if total_samples > 0:
                overall_accuracy = sum(
                    accuracy * sample_sizes[component] 
                    for component, accuracy in component_accuracies.items()
                ) / total_samples
            else:
                overall_accuracy = 0.0
            
            # Calculate confidence intervals
            confidence_intervals = {}
            for component, accuracy in component_accuracies.items():
                n = sample_sizes[component]
                if n > 0:
                    margin_of_error = 1.96 * (accuracy * (1 - accuracy) / n) ** 0.5
                    confidence_intervals[component] = (
                        max(0, accuracy - margin_of_error),
                        min(1, accuracy + margin_of_error)
                    )
            
            # Update current metrics
            self.current_metrics = AccuracyMetrics(
                overall_accuracy=overall_accuracy,
                component_accuracies=component_accuracies,
                precision_scores=precision_scores,
                recall_scores=recall_scores,
                f1_scores=f1_scores,
                confidence_intervals=confidence_intervals,
                sample_sizes=sample_sizes,
                error_analysis=dict(error_analysis),
                temporal_trends=self._calculate_temporal_trends()
            )
            
            # Store accuracy history
            self.accuracy_history["overall"].append(overall_accuracy)
            for component, accuracy in component_accuracies.items():
                self.accuracy_history[component].append(accuracy)
            
            self.total_validations += 1
            if overall_accuracy >= 0.92:
                self.successful_validations += 1
            
            self.logger.info("System accuracy validation completed",
                           overall_accuracy=overall_accuracy,
                           meets_target=self.current_metrics.meets_target,
                           quality_grade=self.current_metrics.quality_grade)
            
            return self.current_metrics
            
        except Exception as e:
            self.logger.error("System accuracy validation failed", error=str(e))
            return self.current_metrics
    
    async def _validate_sentiment_analysis(self, nlp_processor) -> Dict[str, Any]:
        """Validate sentiment analysis accuracy"""
        correct_predictions = 0
        total_predictions = 0
        true_positives = 0
        false_positives = 0
        false_negatives = 0
        errors = []
        
        for test_case in self.sentiment_ground_truth:
            try:
                result = await nlp_processor.analyze_text(
                    text=test_case["text"],
                    text_id=f"sentiment_test_{total_predictions}"
                )
                
                predicted_sentiment = result.sentiment.score
                expected_sentiment = test_case["expected_sentiment"]
                
                # Calculate accuracy (within 0.3 tolerance for sentiment)
                if abs(predicted_sentiment - expected_sentiment) <= 0.3:
                    correct_predictions += 1
                else:
                    errors.append(f"Sentiment mismatch: expected {expected_sentiment}, got {predicted_sentiment}")
                
                # Calculate precision/recall for positive sentiment
                if expected_sentiment > 0.2:  # Expected positive
                    if predicted_sentiment > 0.2:  # Predicted positive
                        true_positives += 1
                    else:  # Predicted negative/neutral
                        false_negatives += 1
                else:  # Expected negative/neutral
                    if predicted_sentiment > 0.2:  # Predicted positive
                        false_positives += 1
                
                total_predictions += 1
                
            except Exception as e:
                errors.append(f"Processing error: {str(e)}")
                total_predictions += 1
        
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
        recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        return {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "sample_size": total_predictions,
            "errors": errors[:10]  # Limit error list
        }
    
    async def _validate_keyword_extraction(self, nlp_processor) -> Dict[str, Any]:
        """Validate keyword extraction accuracy"""
        correct_extractions = 0
        total_extractions = 0
        keyword_matches = 0
        total_expected_keywords = 0
        errors = []
        
        for test_case in self.keyword_ground_truth:
            try:
                result = await nlp_processor.analyze_text(
                    text=test_case["text"],
                    text_id=f"keyword_test_{total_extractions}"
                )
                
                extracted_keywords = set(result.keywords.primary_keywords + result.keywords.secondary_keywords)
                expected_keywords = set(test_case["expected_keywords"])
                
                # Calculate keyword overlap
                intersection = extracted_keywords.intersection(expected_keywords)
                keyword_matches += len(intersection)
                total_expected_keywords += len(expected_keywords)
                
                # Check if at least 60% of expected keywords were found
                overlap_ratio = len(intersection) / len(expected_keywords) if expected_keywords else 0
                if overlap_ratio >= 0.6:
                    correct_extractions += 1
                else:
                    errors.append(f"Low keyword overlap: {overlap_ratio:.2f}, expected {expected_keywords}, got {extracted_keywords}")
                
                total_extractions += 1
                
            except Exception as e:
                errors.append(f"Processing error: {str(e)}")
                total_extractions += 1
        
        accuracy = correct_extractions / total_extractions if total_extractions > 0 else 0
        precision = keyword_matches / (total_extractions * 5) if total_extractions > 0 else 0  # Assume avg 5 keywords extracted
        recall = keyword_matches / total_expected_keywords if total_expected_keywords > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        return {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "sample_size": total_extractions,
            "errors": errors[:10]
        }
    
    async def _validate_idea_quality(self, idea_generator) -> Dict[str, Any]:
        """Validate business idea generation quality"""
        quality_matches = 0
        total_evaluations = 0
        errors = []
        
        for test_case in self.idea_quality_ground_truth:
            try:
                from .idea_generator import IdeaGenerationRequest
                
                # Mock pain points for idea generation
                mock_pain_points = [
                    {
                        "id": f"test_pp_{total_evaluations}",
                        "title": "Learning difficulty",
                        "content": "Students struggle with personalized learning",
                        "category": "education",
                        "business_potential": 0.8
                    }
                ]
                
                request = IdeaGenerationRequest(pain_points=mock_pain_points)
                generated_idea = await idea_generator.generate_business_idea(request)
                
                # Compare quality scores
                expected_quality = test_case["expected_quality_score"]
                actual_quality = generated_idea.quality_scores.get("overall_score", 0.0)
                
                # Check if quality is within reasonable range
                if abs(actual_quality - expected_quality) <= 0.15:
                    quality_matches += 1
                else:
                    errors.append(f"Quality mismatch: expected {expected_quality}, got {actual_quality}")
                
                total_evaluations += 1
                
            except Exception as e:
                errors.append(f"Idea generation error: {str(e)}")
                total_evaluations += 1
        
        accuracy = quality_matches / total_evaluations if total_evaluations > 0 else 0
        
        return {
            "accuracy": accuracy,
            "precision": accuracy,  # For idea quality, precision ≈ accuracy
            "recall": accuracy,     # For idea quality, recall ≈ accuracy
            "f1": accuracy,         # For idea quality, F1 ≈ accuracy
            "sample_size": total_evaluations,
            "errors": errors[:10]
        }
    
    def _extract_ground_truth(self, test_type: TestType, data_point: Dict[str, Any]) -> Any:
        """Extract ground truth value from test data point"""
        if test_type == TestType.SENTIMENT_ANALYSIS:
            return data_point.get("expected_sentiment", 0.0)
        elif test_type == TestType.KEYWORD_EXTRACTION:
            return data_point.get("expected_keywords", [])
        elif test_type == TestType.IDEA_GENERATION:
            return data_point.get("expected_quality_score", 0.5)
        else:
            return None
    
    def _calculate_accuracy(self, test_type: TestType, results: List[Any], ground_truths: List[Any]) -> float:
        """Calculate accuracy for specific test type"""
        if not results or not ground_truths or len(results) != len(ground_truths):
            return 0.0
        
        correct = 0
        total = len(results)
        
        for result, truth in zip(results, ground_truths):
            if test_type == TestType.SENTIMENT_ANALYSIS:
                # Sentiment accuracy with tolerance
                if hasattr(result, 'sentiment'):
                    predicted = result.sentiment.score
                else:
                    predicted = result.get("sentiment_score", 0.0)
                
                if abs(predicted - truth) <= 0.3:
                    correct += 1
                    
            elif test_type == TestType.KEYWORD_EXTRACTION:
                # Keyword extraction accuracy
                if hasattr(result, 'keywords'):
                    predicted_keywords = set(result.keywords.primary_keywords)
                else:
                    predicted_keywords = set(result.get("keywords", []))
                
                expected_keywords = set(truth)
                overlap = len(predicted_keywords.intersection(expected_keywords))
                
                if overlap >= len(expected_keywords) * 0.6:  # 60% overlap threshold
                    correct += 1
                    
            elif test_type == TestType.IDEA_GENERATION:
                # Idea quality accuracy
                if hasattr(result, 'quality_scores'):
                    predicted_quality = result.quality_scores.get("overall_score", 0.0)
                else:
                    predicted_quality = result.get("quality_score", 0.0)
                
                if abs(predicted_quality - truth) <= 0.15:  # 15% tolerance
                    correct += 1
        
        return correct / total
    
    def _calculate_confidence_level(self, control_results: List[Any], variant_results: List[Any], 
                                  ground_truths: List[Any], test_type: TestType) -> float:
        """Calculate statistical confidence level using bootstrap method"""
        try:
            if len(control_results) < 10:  # Need minimum samples for confidence calculation
                return 0.0
            
            # Simple confidence calculation based on sample size and variance
            n = len(control_results)
            
            # Calculate accuracy differences for bootstrap
            differences = []
            for _ in range(100):  # 100 bootstrap samples
                # Sample with replacement
                indices = [random.randint(0, n-1) for _ in range(n)]
                
                control_sample = [control_results[i] for i in indices]
                variant_sample = [variant_results[i] for i in indices]
                truth_sample = [ground_truths[i] for i in indices]
                
                control_acc = self._calculate_accuracy(test_type, control_sample, truth_sample)
                variant_acc = self._calculate_accuracy(test_type, variant_sample, truth_sample)
                
                differences.append(variant_acc - control_acc)
            
            # Calculate confidence based on consistency of differences
            mean_diff = statistics.mean(differences)
            std_diff = statistics.stdev(differences) if len(differences) > 1 else 0
            
            if std_diff == 0:
                return 0.99 if abs(mean_diff) > 0.01 else 0.5
            
            # Simple confidence estimate
            z_score = abs(mean_diff) / (std_diff / (n ** 0.5))
            confidence = min(0.99, max(0.5, 1 - (2 * (1 - self._normal_cdf(z_score)))))
            
            return confidence
            
        except Exception:
            return 0.5  # Default confidence
    
    def _normal_cdf(self, x: float) -> float:
        """Approximate normal cumulative distribution function"""
        return 0.5 * (1 + self._erf(x / (2 ** 0.5)))
    
    def _erf(self, x: float) -> float:
        """Approximate error function"""
        # Abramowitz and Stegun approximation
        a1, a2, a3, a4, a5 = 0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429
        p = 0.3275911
        
        sign = 1 if x >= 0 else -1
        x = abs(x)
        
        t = 1.0 / (1.0 + p * x)
        y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * math.exp(-x * x)
        
        return sign * y
    
    def _calculate_temporal_trends(self) -> Dict[str, List[float]]:
        """Calculate temporal trends for each component"""
        trends = {}
        
        for component, history in self.accuracy_history.items():
            if len(history) >= 5:  # Need at least 5 data points for trend
                recent_history = list(history)[-20:]  # Last 20 measurements
                trends[component] = recent_history
            
        return trends
    
    async def continuous_accuracy_monitoring(self, ai_components: Dict[str, Any], 
                                           monitoring_interval: int = 3600) -> None:
        """Continuously monitor system accuracy"""
        self.logger.info("Starting continuous accuracy monitoring", interval=monitoring_interval)
        
        while True:
            try:
                # Run accuracy validation
                metrics = await self.validate_system_accuracy(ai_components)
                
                # Check if accuracy dropped below threshold
                if metrics.overall_accuracy < 0.88:  # Warning threshold
                    self.logger.warning("Accuracy dropped below warning threshold",
                                      accuracy=metrics.overall_accuracy,
                                      grade=metrics.quality_grade)
                
                # Check individual components
                for component, accuracy in metrics.component_accuracies.items():
                    if accuracy < 0.85:
                        self.logger.warning("Component accuracy low",
                                          component=component,
                                          accuracy=accuracy)
                
                # Sleep until next check
                await asyncio.sleep(monitoring_interval)
                
            except Exception as e:
                self.logger.error("Continuous monitoring error", error=str(e))
                await asyncio.sleep(60)  # Retry after 1 minute on error
    
    def get_validation_report(self) -> Dict[str, Any]:
        """Generate comprehensive validation report"""
        return {
            "current_metrics": {
                "overall_accuracy": self.current_metrics.overall_accuracy,
                "meets_92_percent_target": self.current_metrics.meets_target,
                "quality_grade": self.current_metrics.quality_grade,
                "component_accuracies": self.current_metrics.component_accuracies
            },
            "performance_summary": {
                "total_validations": self.total_validations,
                "successful_validations": self.successful_validations,
                "success_rate": (self.successful_validations / self.total_validations * 100) 
                              if self.total_validations > 0 else 0
            },
            "ab_test_summary": {
                "total_tests": len(self.completed_tests),
                "significant_improvements": sum(1 for test in self.completed_tests if test.is_significant and test.improvement > 0),
                "latest_tests": [
                    {
                        "test_id": test.test_id,
                        "test_type": test.test_type.value,
                        "improvement": test.improvement,
                        "is_significant": test.is_significant,
                        "winner": test.winner
                    }
                    for test in self.completed_tests[-5:]  # Last 5 tests
                ]
            },
            "accuracy_trends": {
                component: list(history)[-10:]  # Last 10 measurements
                for component, history in self.accuracy_history.items()
                if len(history) > 0
            },
            "error_analysis": self.current_metrics.error_analysis,
            "recommendations": self._generate_recommendations()
        }
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on current metrics"""
        recommendations = []
        
        # Overall accuracy recommendations
        if self.current_metrics.overall_accuracy < 0.92:
            recommendations.append("Overall accuracy below 92% target - consider algorithm improvements")
        
        # Component-specific recommendations
        for component, accuracy in self.current_metrics.component_accuracies.items():
            if accuracy < 0.85:
                recommendations.append(f"{component} accuracy low ({accuracy:.2f}) - needs optimization")
        
        # Sample size recommendations
        for component, sample_size in self.current_metrics.sample_sizes.items():
            if sample_size < 50:
                recommendations.append(f"{component} needs more test data (current: {sample_size})")
        
        # A/B test recommendations
        recent_tests = self.completed_tests[-10:]
        if recent_tests:
            improvements = [test.improvement for test in recent_tests if test.is_significant]
            if not improvements:
                recommendations.append("No significant A/B test improvements recently - try new variants")
        
        return recommendations

# Global accuracy validator instance
_accuracy_validator = None

def get_accuracy_validator() -> AccuracyValidator:
    """Get global accuracy validator instance"""
    global _accuracy_validator
    if _accuracy_validator is None:
        _accuracy_validator = AccuracyValidator()
    return _accuracy_validator