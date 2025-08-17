"""
Prompt Engineering Engine
Advanced prompt templates for 92% AI accuracy in pain point analysis
"""

from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from datetime import datetime
import json
import structlog

logger = structlog.get_logger()

@dataclass
class PromptTemplate:
    """Structured prompt template"""
    name: str
    system_prompt: str
    user_template: str
    response_schema: Dict[str, Any]
    examples: List[Dict[str, Any]]
    validation_rules: List[str]
    target_accuracy: float = 0.92
    
class PromptEngine:
    """Advanced prompt engineering for high-accuracy AI analysis"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="PromptEngine")
        self._templates = self._initialize_templates()
    
    def _initialize_templates(self) -> Dict[str, PromptTemplate]:
        """Initialize all prompt templates"""
        
        templates = {}
        
        # Pain Point Analysis Template
        templates["pain_point_analysis"] = PromptTemplate(
            name="pain_point_analysis",
            system_prompt="""당신은 갈증포인트(pain point) 분석 전문가입니다. 
사용자가 제공하는 텍스트를 분석하여 다음을 정확히 파악해야 합니다:

1. 감정 분석 (sentiment): 매우 정확한 감정 점수
2. 트렌드 분석 (trend): 시장에서의 관심도와 중요성
3. 비즈니스 잠재력: 실제 비즈니스 기회로 전환 가능성
4. 긴급도: 해결이 필요한 시급성
5. 시장 규모: 잠재적 시장 크기

반드시 제공된 JSON 스키마 형식으로만 응답하세요. 추가 설명이나 마크다운은 사용하지 마세요.""",
            
            user_template="""다음 갈증포인트를 분석해주세요:

📝 제목: {title}
📄 내용: {content}
🔗 출처: {source}
📅 수집시간: {collected_at}

위 정보를 바탕으로 정확한 분석을 수행하고, 반드시 아래 JSON 형식으로만 응답해주세요:

{{
  "sentiment_score": -1.0에서 1.0 사이의 정확한 감정 점수,
  "trend_score": 0.0에서 1.0 사이의 트렌드 점수,
  "business_potential": 0.0에서 1.0 사이의 비즈니스 잠재력,
  "urgency_level": 1에서 5 사이의 긴급도,
  "market_size": "small", "medium", "large" 중 하나,
  "keywords": 핵심 키워드 배열 (최대 8개),
  "category": "technology", "business", "lifestyle", "healthcare", "education", "entertainment", "productivity", "social" 중 하나,
  "pain_severity": 1에서 5 사이의 고통 정도,
  "solution_complexity": 1에서 5 사이의 해결 복잡도,
  "target_demographics": "구체적인 타겟층 설명",
  "confidence": 0.0에서 1.0 사이의 분석 신뢰도,
  "reasoning": {{
    "sentiment_analysis": "감정 점수 근거",
    "trend_justification": "트렌드 점수 근거", 
    "business_rationale": "비즈니스 잠재력 근거",
    "market_evidence": "시장 규모 판단 근거"
  }}
}}""",
            
            response_schema={
                "type": "object",
                "required": ["sentiment_score", "trend_score", "business_potential", "urgency_level", 
                           "market_size", "keywords", "category", "pain_severity", "solution_complexity",
                           "target_demographics", "confidence", "reasoning"],
                "properties": {
                    "sentiment_score": {"type": "number", "minimum": -1.0, "maximum": 1.0},
                    "trend_score": {"type": "number", "minimum": 0.0, "maximum": 1.0},
                    "business_potential": {"type": "number", "minimum": 0.0, "maximum": 1.0},
                    "urgency_level": {"type": "integer", "minimum": 1, "maximum": 5},
                    "market_size": {"type": "string", "enum": ["small", "medium", "large"]},
                    "keywords": {"type": "array", "items": {"type": "string"}, "maxItems": 8},
                    "category": {"type": "string", "enum": ["technology", "business", "lifestyle", "healthcare", "education", "entertainment", "productivity", "social"]},
                    "pain_severity": {"type": "integer", "minimum": 1, "maximum": 5},
                    "solution_complexity": {"type": "integer", "minimum": 1, "maximum": 5},
                    "target_demographics": {"type": "string"},
                    "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0}
                }
            },
            
            examples=[
                {
                    "input": {
                        "title": "모바일 앱 결제 과정이 너무 복잡함",
                        "content": "온라인 쇼핑할 때마다 결제 단계가 너무 많아서 중간에 포기하게 됨. 카드 정보 입력하고 인증하고 주소 입력하고... 간단하게 할 수 없나?",
                        "source": "reddit-mildlyinfuriating",
                        "collected_at": "2025-08-16T10:30:00Z"
                    },
                    "output": {
                        "sentiment_score": -0.7,
                        "trend_score": 0.85,
                        "business_potential": 0.9,
                        "urgency_level": 4,
                        "market_size": "large",
                        "keywords": ["mobile payment", "UX", "checkout", "simplification", "conversion"],
                        "category": "technology",
                        "pain_severity": 4,
                        "solution_complexity": 3,
                        "target_demographics": "온라인 쇼핑 사용자, 특히 모바일 사용자",
                        "confidence": 0.92
                    }
                }
            ],
            
            validation_rules=[
                "sentiment_score는 텍스트의 감정을 정확히 반영해야 함",
                "business_potential은 실제 시장 기회를 현실적으로 평가해야 함",
                "keywords는 핵심적이고 검색 가능한 용어여야 함",
                "category는 내용과 정확히 일치해야 함",
                "confidence는 분석의 확실성을 정직하게 표현해야 함"
            ],
            
            target_accuracy=0.95
        )
        
        # Business Idea Generation Template
        templates["business_idea_generation"] = PromptTemplate(
            name="business_idea_generation",
            system_prompt="""당신은 혁신적이고 실현 가능한 비즈니스 아이디어를 생성하는 전문가입니다.
갈증포인트를 분석하여 구체적이고 실행 가능한 비즈니스 솔루션을 제시해야 합니다.

핵심 원칙:
1. 실현 가능성: 현재 기술로 구현 가능한 솔루션
2. 시장 검증: 실제 시장 수요가 있는 아이디어
3. 수익성: 명확한 수익 모델이 있는 비즈니스
4. 차별화: 기존 솔루션과 구별되는 독특함
5. 확장성: 성장 가능한 비즈니스 모델

반드시 제공된 JSON 스키마 형식으로만 응답하세요.""",
            
            user_template="""다음 갈증포인트들을 바탕으로 혁신적인 비즈니스 아이디어를 생성해주세요:

🔍 갈증포인트 목록:
{pain_points_list}

📊 분석된 공통 패턴:
- 주요 카테고리: {primary_categories}
- 평균 비즈니스 잠재력: {avg_business_potential}
- 타겟 시장 규모: {market_size_summary}

위 정보를 종합하여 실현 가능한 비즈니스 아이디어를 생성하고, 반드시 아래 JSON 형식으로만 응답해주세요:

{{
  "title": "매력적이고 구체적인 비즈니스 아이디어 제목 (50자 이내)",
  "description": "상세하고 실현 가능한 솔루션 설명 (500자 이내)",
  "target_market": "구체적인 타겟 시장과 고객층 분석",
  "revenue_model": "명확하고 검증 가능한 수익 모델",
  "market_size": "small", "medium", "large" 중 하나,
  "implementation_difficulty": 1에서 5 사이의 구현 난이도,
  "confidence_score": 0에서 100 사이의 성공 확신도,
  "competitive_advantage": "핵심 경쟁 우위와 차별화 요소",
  "mvp_timeline": "MVP 개발 예상 기간 (주 단위)",
  "initial_investment": "초기 투자 규모 추정",
  "ai_analysis": {{
    "market_validation": {{
      "existing_solutions": ["기존 솔루션들의 한계점"],
      "market_gap": "발견된 시장 공백과 기회",
      "demand_signals": ["수요 증명 근거들"]
    }},
    "competition_analysis": {{
      "direct_competitors": ["직접 경쟁사 분석"],
      "indirect_competitors": ["간접 경쟁사 분석"],
      "competitive_moat": "지속 가능한 경쟁 우위 방안"
    }},
    "risk_assessment": {{
      "technical_risks": ["기술적 위험 요소들"],
      "market_risks": ["시장 위험 요소들"],
      "financial_risks": ["재정적 위험 요소들"],
      "mitigation_strategies": ["위험 완화 전략들"]
    }},
    "implementation_roadmap": [
      {{"phase": "1단계: MVP 개발", "timeline": "1-3개월", "key_milestones": ["핵심 기능 구현"], "resources_needed": ["필요 자원"]}},
      {{"phase": "2단계: 시장 검증", "timeline": "3-6개월", "key_milestones": ["사용자 피드백 수집"], "resources_needed": ["마케팅 예산"]}},
      {{"phase": "3단계: 확장", "timeline": "6-12개월", "key_milestones": ["시장 확장"], "resources_needed": ["확장 자금"]}}
    ],
    "success_metrics": {{
      "user_acquisition": "사용자 확보 목표",
      "revenue_targets": "수익 목표",
      "market_penetration": "시장 점유율 목표"
    }},
    "success_probability": 0에서 100 사이의 성공 확률
  }}
}}""",
            
            response_schema={
                "type": "object",
                "required": ["title", "description", "target_market", "revenue_model", 
                           "market_size", "implementation_difficulty", "confidence_score",
                           "competitive_advantage", "mvp_timeline", "initial_investment", "ai_analysis"],
                "properties": {
                    "title": {"type": "string", "maxLength": 50},
                    "description": {"type": "string", "maxLength": 500},
                    "target_market": {"type": "string"},
                    "revenue_model": {"type": "string"},
                    "market_size": {"type": "string", "enum": ["small", "medium", "large"]},
                    "implementation_difficulty": {"type": "integer", "minimum": 1, "maximum": 5},
                    "confidence_score": {"type": "integer", "minimum": 0, "maximum": 100},
                    "competitive_advantage": {"type": "string"},
                    "mvp_timeline": {"type": "string"},
                    "initial_investment": {"type": "string"},
                    "ai_analysis": {"type": "object"}
                }
            },
            
            examples=[
                {
                    "input": {
                        "pain_points": [
                            "모바일 결제 과정 복잡함",
                            "온라인 쇼핑 카트 이탈률 높음",
                            "결제 보안 우려"
                        ]
                    },
                    "output": {
                        "title": "원터치 결제 플랫폼",
                        "description": "생체 인증과 AI를 활용한 초간단 모바일 결제 시스템",
                        "confidence_score": 85,
                        "market_size": "large"
                    }
                }
            ],
            
            validation_rules=[
                "실현 가능한 기술을 기반으로 해야 함",
                "명확한 수익 모델이 있어야 함",
                "타겟 시장이 구체적이고 측정 가능해야 함",
                "경쟁 우위가 지속 가능해야 함",
                "구현 일정이 현실적이어야 함"
            ],
            
            target_accuracy=0.92
        )
        
        # Idea Enhancement Template
        templates["idea_enhancement"] = PromptTemplate(
            name="idea_enhancement",
            system_prompt="""당신은 비즈니스 전략과 시장 분석 전문가입니다.
기존 비즈니스 아이디어를 심화 분석하여 실행 가능한 전략으로 발전시켜야 합니다.

전문 영역:
1. 시장 조사 및 분석
2. 재정 계획 및 예측
3. 기술적 실현 가능성
4. 마케팅 및 고객 확보 전략
5. 위험 관리 및 완화 방안

반드시 제공된 JSON 스키마 형식으로만 응답하세요.""",
            
            user_template="""다음 비즈니스 아이디어에 대한 심화 분석을 수행해주세요:

💡 아이디어: {title}
📝 설명: {description}
🎯 타겟 시장: {target_market}
💰 수익 모델: {revenue_model}
📊 현재 신뢰도: {confidence_score}%

위 아이디어를 심화 분석하여 실행 가능한 비즈니스 전략으로 발전시키고, 반드시 아래 JSON 형식으로만 응답해주세요:

{{
  "enhanced_analysis": {{
    "market_research": {{
      "total_addressable_market": "TAM 규모와 성장률",
      "serviceable_addressable_market": "SAM 규모 분석",
      "competitive_landscape": "경쟁사 현황과 포지셔닝",
      "customer_segments": ["세분화된 고객군들"],
      "pricing_strategy": "최적 가격 전략과 근거"
    }},
    "technical_feasibility": {{
      "technology_requirements": ["핵심 기술 요구사항"],
      "development_phases": ["단계별 개발 계획"],
      "technical_risks": ["기술적 위험 요소"],
      "alternative_approaches": ["대안 기술 접근법"]
    }},
    "financial_projections": {{
      "startup_costs": {{
        "development": "개발 비용",
        "marketing": "마케팅 비용", 
        "operations": "운영 비용",
        "total": "총 초기 투자"
      }},
      "revenue_forecast": {{
        "year1": "1년차 예상 수익",
        "year2": "2년차 예상 수익",
        "year3": "3년차 예상 수익"
      }},
      "break_even_analysis": "손익분기점 분석",
      "funding_requirements": "단계별 자금 조달 계획"
    }},
    "go_to_market": {{
      "launch_strategy": "시장 진입 전략",
      "customer_acquisition": {{
        "channels": ["고객 확보 채널들"],
        "cost_per_acquisition": "고객 확보 비용",
        "retention_strategy": "고객 유지 전략"
      }},
      "partnership_opportunities": ["전략적 파트너십 기회"],
      "pilot_program": "파일럿 프로그램 계획"
    }},
    "risk_mitigation": {{
      "identified_risks": ["식별된 주요 위험들"],
      "contingency_plans": ["비상 계획들"],
      "success_indicators": ["성공 지표들"],
      "pivot_strategies": ["피벗 전략 옵션들"]
    }}
  }},
  "updated_confidence": 0에서 100 사이의 업데이트된 신뢰도,
  "implementation_priority": "high", "medium", "low" 중 하나,
  "next_steps": ["구체적인 다음 실행 단계들"]
}}""",
            
            response_schema={
                "type": "object",
                "required": ["enhanced_analysis", "updated_confidence", "implementation_priority", "next_steps"],
                "properties": {
                    "enhanced_analysis": {"type": "object"},
                    "updated_confidence": {"type": "integer", "minimum": 0, "maximum": 100},
                    "implementation_priority": {"type": "string", "enum": ["high", "medium", "low"]},
                    "next_steps": {"type": "array", "items": {"type": "string"}}
                }
            },
            
            examples=[],
            validation_rules=[
                "시장 분석은 구체적인 데이터와 근거가 있어야 함",
                "재정 예측은 현실적이고 보수적이어야 함",
                "위험 분석은 포괄적이고 완화 방안이 실행 가능해야 함",
                "구현 단계는 측정 가능하고 시간 프레임이 명확해야 함"
            ],
            
            target_accuracy=0.90
        )
        
        return templates
    
    def get_template(self, template_name: str) -> Optional[PromptTemplate]:
        """Get prompt template by name"""
        return self._templates.get(template_name)
    
    def render_prompt(self, template_name: str, variables: Dict[str, Any]) -> Dict[str, str]:
        """Render prompt template with variables"""
        template = self.get_template(template_name)
        if not template:
            raise ValueError(f"Template '{template_name}' not found")
        
        try:
            # Render user prompt with variables
            user_prompt = template.user_template.format(**variables)
            
            return {
                "system_prompt": template.system_prompt,
                "user_prompt": user_prompt,
                "template_name": template_name
            }
            
        except KeyError as e:
            raise ValueError(f"Missing required variable for template '{template_name}': {e}")
        except Exception as e:
            raise ValueError(f"Error rendering template '{template_name}': {e}")
    
    def validate_response(self, template_name: str, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate AI response against template schema"""
        template = self.get_template(template_name)
        if not template:
            return {"valid": False, "error": f"Template '{template_name}' not found"}
        
        try:
            # Basic schema validation
            schema = template.response_schema
            required_fields = schema.get("required", [])
            
            validation_results = {
                "valid": True,
                "missing_fields": [],
                "invalid_types": [],
                "validation_errors": [],
                "accuracy_score": 0.0
            }
            
            # Check required fields
            for field in required_fields:
                if field not in response:
                    validation_results["missing_fields"].append(field)
                    validation_results["valid"] = False
            
            # Check field types and constraints
            properties = schema.get("properties", {})
            for field, value in response.items():
                if field in properties:
                    field_schema = properties[field]
                    
                    # Type checking
                    expected_type = field_schema.get("type")
                    if expected_type == "number" and not isinstance(value, (int, float)):
                        validation_results["invalid_types"].append(f"{field}: expected number, got {type(value)}")
                        validation_results["valid"] = False
                    elif expected_type == "integer" and not isinstance(value, int):
                        validation_results["invalid_types"].append(f"{field}: expected integer, got {type(value)}")
                        validation_results["valid"] = False
                    elif expected_type == "string" and not isinstance(value, str):
                        validation_results["invalid_types"].append(f"{field}: expected string, got {type(value)}")
                        validation_results["valid"] = False
                    elif expected_type == "array" and not isinstance(value, list):
                        validation_results["invalid_types"].append(f"{field}: expected array, got {type(value)}")
                        validation_results["valid"] = False
                    
                    # Range checking for numbers
                    if expected_type in ["number", "integer"] and isinstance(value, (int, float)):
                        if "minimum" in field_schema and value < field_schema["minimum"]:
                            validation_results["validation_errors"].append(f"{field}: value {value} below minimum {field_schema['minimum']}")
                            validation_results["valid"] = False
                        if "maximum" in field_schema and value > field_schema["maximum"]:
                            validation_results["validation_errors"].append(f"{field}: value {value} above maximum {field_schema['maximum']}")
                            validation_results["valid"] = False
                    
                    # Enum checking
                    if "enum" in field_schema and value not in field_schema["enum"]:
                        validation_results["validation_errors"].append(f"{field}: value '{value}' not in allowed values {field_schema['enum']}")
                        validation_results["valid"] = False
            
            # Calculate accuracy score
            total_checks = len(required_fields) + len(properties)
            failed_checks = len(validation_results["missing_fields"]) + len(validation_results["invalid_types"]) + len(validation_results["validation_errors"])
            validation_results["accuracy_score"] = max(0.0, (total_checks - failed_checks) / total_checks) if total_checks > 0 else 0.0
            
            return validation_results
            
        except Exception as e:
            return {
                "valid": False,
                "error": f"Validation error: {str(e)}",
                "accuracy_score": 0.0
            }
    
    def get_all_templates(self) -> List[str]:
        """Get list of all available template names"""
        return list(self._templates.keys())
    
    def get_template_info(self, template_name: str) -> Dict[str, Any]:
        """Get detailed information about a template"""
        template = self.get_template(template_name)
        if not template:
            return {"error": f"Template '{template_name}' not found"}
        
        return {
            "name": template.name,
            "target_accuracy": template.target_accuracy,
            "required_variables": self._extract_template_variables(template.user_template),
            "response_schema": template.response_schema,
            "validation_rules": template.validation_rules,
            "examples_count": len(template.examples)
        }
    
    def _extract_template_variables(self, template_string: str) -> List[str]:
        """Extract variable names from template string"""
        import re
        pattern = r'\{([^}]+)\}'
        return re.findall(pattern, template_string)

# Global prompt engine instance
_prompt_engine = None

def get_prompt_engine() -> PromptEngine:
    """Get global prompt engine instance"""
    global _prompt_engine
    if _prompt_engine is None:
        _prompt_engine = PromptEngine()
    return _prompt_engine