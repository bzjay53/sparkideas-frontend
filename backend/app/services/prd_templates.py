"""
PRD Template Management System
Dynamic template system for automated PRD generation with customization
"""

import json
import time
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from pathlib import Path
import structlog
from jinja2 import Environment, BaseLoader, select_autoescape

from app.services.prd_generator import PRDDocument, MermaidDiagram

logger = structlog.get_logger()

class TemplateType(Enum):
    """Types of PRD templates"""
    STANDARD = "standard"
    STARTUP = "startup"
    ENTERPRISE = "enterprise"
    SAAS = "saas"
    MOBILE_APP = "mobile_app"
    WEB_APP = "web_app"
    API_SERVICE = "api_service"

class TemplateSection(Enum):
    """PRD template sections"""
    EXECUTIVE_SUMMARY = "executive_summary"
    PROBLEM_STATEMENT = "problem_statement"
    SOLUTION_OVERVIEW = "solution_overview"
    TARGET_MARKET = "target_market"
    FEATURES = "features"
    TECHNICAL_REQUIREMENTS = "technical_requirements"
    SUCCESS_METRICS = "success_metrics"
    TIMELINE = "timeline"
    RISK_ASSESSMENT = "risk_assessment"
    APPENDIX = "appendix"

@dataclass
class TemplateVariable:
    """Template variable definition"""
    name: str
    type: str  # string, number, boolean, array, object
    description: str
    required: bool = True
    default_value: Any = None
    validation_pattern: Optional[str] = None
    options: Optional[List[str]] = None

@dataclass
class TemplateMetadata:
    """Template metadata and configuration"""
    id: str
    name: str
    description: str
    template_type: TemplateType
    version: str = "1.0"
    author: str = "IdeaSpark AI"
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    tags: List[str] = field(default_factory=list)
    
    # Template configuration
    sections: List[TemplateSection] = field(default_factory=list)
    variables: List[TemplateVariable] = field(default_factory=list)
    supports_diagrams: bool = True
    requires_ai_enhancement: bool = True
    
    # Usage statistics
    usage_count: int = 0
    success_rate: float = 0.0
    average_generation_time: float = 0.0

@dataclass
class PRDTemplate:
    """Complete PRD template with content and metadata"""
    metadata: TemplateMetadata
    content: Dict[str, str]  # section_name -> template_content
    style_config: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate template structure"""
        if not self.content:
            raise ValueError("Template content cannot be empty")
        
        # Ensure all declared sections have content
        for section in self.metadata.sections:
            if section.value not in self.content:
                logger.warning(f"Missing content for section: {section.value}")

class PRDTemplateManager:
    """Advanced template management system with Jinja2 support"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="PRDTemplateManager")
        self.templates: Dict[str, PRDTemplate] = {}
        
        # Jinja2 environment setup
        self.jinja_env = Environment(
            loader=BaseLoader(),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Template storage path
        self.templates_dir = Path("/tmp/prd_templates")
        self.templates_dir.mkdir(exist_ok=True)
        
        # Performance tracking
        self.generation_stats = {
            "total_renders": 0,
            "successful_renders": 0,
            "average_render_time": 0.0,
            "template_usage": {}
        }
        
        # Initialize built-in templates
        self._initialize_builtin_templates()
    
    def _initialize_builtin_templates(self):
        """Initialize built-in PRD templates"""
        
        # Standard Business Template
        standard_template = self._create_standard_template()
        self.register_template(standard_template)
        
        # SaaS-specific template
        saas_template = self._create_saas_template()
        self.register_template(saas_template)
        
        # Mobile App template
        mobile_template = self._create_mobile_app_template()
        self.register_template(mobile_template)
        
        # Enterprise template
        enterprise_template = self._create_enterprise_template()
        self.register_template(enterprise_template)
        
        self.logger.info(f"Initialized {len(self.templates)} built-in templates")
    
    def _create_standard_template(self) -> PRDTemplate:
        """Create standard business PRD template"""
        
        metadata = TemplateMetadata(
            id="standard_business_v1",
            name="표준 비즈니스 PRD",
            description="일반적인 비즈니스 아이디어를 위한 표준 PRD 템플릿",
            template_type=TemplateType.STANDARD,
            sections=[
                TemplateSection.EXECUTIVE_SUMMARY,
                TemplateSection.PROBLEM_STATEMENT,
                TemplateSection.SOLUTION_OVERVIEW,
                TemplateSection.TARGET_MARKET,
                TemplateSection.FEATURES,
                TemplateSection.TECHNICAL_REQUIREMENTS,
                TemplateSection.SUCCESS_METRICS,
                TemplateSection.TIMELINE
            ],
            variables=[
                TemplateVariable("business_title", "string", "비즈니스 아이디어 제목"),
                TemplateVariable("problem_description", "string", "해결하려는 문제 설명"),
                TemplateVariable("target_audience", "string", "타겟 고객층"),
                TemplateVariable("confidence_score", "number", "AI 신뢰도 점수", False, 85),
                TemplateVariable("market_size", "string", "예상 시장 규모", False, "Medium"),
                TemplateVariable("development_complexity", "string", "개발 복잡도", False, "Medium"),
                TemplateVariable("key_features", "array", "핵심 기능 목록", False, []),
                TemplateVariable("technical_stack", "object", "기술 스택", False, {})
            ],
            tags=["standard", "business", "general"]
        )
        
        content = {
            "executive_summary": """
# 📋 {{ business_title }} - 제품 요구사항 문서

## 📊 Executive Summary

{{ business_title }}는 {{ target_audience }}을 대상으로 하는 혁신적인 솔루션입니다.

### 핵심 가치 제안
- 🎯 **검증된 갈증포인트 기반**: 실제 사용자 니즈에서 도출된 아이디어
- 🤖 **AI 분석 신뢰도**: {{ confidence_score }}% 검증 완료
- 📈 **시장 규모**: {{ market_size }} 규모의 시장 기회
- ⚡ **개발 복잡도**: {{ development_complexity }} 수준의 구현 난이도

{{ problem_description }}

이 문제를 해결하기 위해 {{ business_title }}를 제안합니다.
""",
            
            "problem_statement": """
## 🔍 Problem Statement

### 현재 문제점
{{ problem_description }}

### 문제의 영향
- **사용자 고충**: {{ target_audience }}가 겪고 있는 주요 불편사항
- **시장 갭**: 기존 솔루션의 한계점
- **기회 비용**: 문제 미해결 시 손실되는 가치

### 문제 검증
- **데이터 소스**: Reddit, Naver, LinkedIn 등에서 수집된 실제 갈증포인트
- **AI 분석 결과**: {{ confidence_score }}% 신뢰도로 검증된 문제
- **시장 검증**: {{ market_size }} 규모의 잠재 시장 확인
""",
            
            "solution_overview": """
## 💡 Solution Overview

### 제안 솔루션
{{ business_title }}는 다음과 같은 방식으로 문제를 해결합니다:

{% for feature in key_features %}
- **{{ feature.name }}**: {{ feature.description }}
{% endfor %}

### 핵심 차별화 요소
1. **실시간 데이터 기반**: 실제 사용자 갈증포인트에서 도출
2. **AI 기반 검증**: {{ confidence_score }}% 신뢰도의 검증 시스템
3. **사용자 중심 설계**: {{ target_audience }} 니즈에 최적화

### 기술적 접근법
- **개발 복잡도**: {{ development_complexity }}
- **핵심 기술**: {{ technical_stack.framework or "Modern Web Stack" }}
- **확장성**: {{ technical_stack.scalability or "수평적 확장 가능" }}
""",
            
            "target_market": """
## 🎯 Target Market

### Primary Target
**{{ target_audience }}**

### 시장 분석
- **시장 규모**: {{ market_size }}
- **성장률**: 연평균 15-25% 예상 성장
- **경쟁 환경**: 기존 솔루션 대비 차별화된 접근

### 사용자 페르소나
1. **얼리 어답터**: 새로운 기술에 적극적인 사용자
2. **문제 인식자**: 현재 문제를 명확히 인식하고 있는 사용자
3. **솔루션 탐색자**: 적극적으로 해결책을 찾고 있는 사용자

### Go-to-Market 전략
- **Phase 1**: 얼리 어답터 대상 베타 테스트
- **Phase 2**: 워드 오브 마우스 기반 확산
- **Phase 3**: 마케팅 채널 다각화
""",
            
            "features": """
## 🚀 Features & Requirements

### 핵심 기능 (Core Features)
{% for feature in key_features %}
#### {{ loop.index }}. {{ feature.name }}
- **설명**: {{ feature.description }}
- **우선순위**: {{ feature.priority or "High" }}
- **개발 복잡도**: {{ feature.effort or "Medium" }}
- **의존성**: {{ feature.dependencies | join(", ") if feature.dependencies else "None" }}

{% endfor %}

### 부가 기능 (Additional Features)
- **분석 대시보드**: 사용자 활동 및 성과 시각화
- **알림 시스템**: 중요 이벤트 및 업데이트 알림
- **모바일 최적화**: 반응형 디자인 및 모바일 앱 지원
- **API 제공**: 타사 서비스 연동을 위한 RESTful API

### 사용자 경험 (UX)
- **직관적 인터페이스**: 학습 곡선 최소화
- **빠른 응답**: 평균 응답 시간 < 2초
- **접근성**: WCAG 2.1 AA 준수
""",
            
            "technical_requirements": """
## 🛠️ Technical Requirements

### 기술 스택
```yaml
Frontend:
  Framework: {{ technical_stack.frontend.framework or "Next.js 15 + TypeScript" }}
  Styling: {{ technical_stack.frontend.styling or "Tailwind CSS" }}
  Deployment: {{ technical_stack.frontend.deployment or "Vercel" }}

Backend:
  Framework: {{ technical_stack.backend.framework or "FastAPI + Python" }}
  Database: {{ technical_stack.backend.database or "PostgreSQL" }}
  Hosting: {{ technical_stack.backend.hosting or "Cloud Platform" }}

Infrastructure:
  Scalability: {{ technical_stack.scalability or "Medium (100-1000 users)" }}
  Monitoring: {{ technical_stack.monitoring or "Basic logging" }}
  Security: {{ technical_stack.security or "Standard web security" }}
```

### 성능 요구사항
- **응답 시간**: < 2초 (95th percentile)
- **가용성**: 99.9% uptime
- **동시 사용자**: {{ technical_stack.concurrent_users or "1,000명" }}
- **데이터 처리**: {{ technical_stack.data_volume or "일일 10MB" }}

### 보안 요구사항
- HTTPS 통신 (모든 API)
- JWT 기반 인증
- 데이터 암호화 (저장 및 전송)
- 정기적 보안 감사

### 호환성 요구사항
- **브라우저**: Chrome, Firefox, Safari, Edge (최신 2버전)
- **모바일**: iOS 14+, Android 10+
- **API**: RESTful API with OpenAPI 3.0 문서화
""",
            
            "success_metrics": """
## 📊 Success Metrics

### 사용자 지표
- **Monthly Active Users (MAU)**: 6개월 내 1,000명 달성
- **사용자 리텐션**: 30일 리텐션 70% 이상
- **사용자 만족도**: NPS 점수 50+ 달성
- **기능 사용률**: 핵심 기능 일일 사용률 60% 이상

### 비즈니스 지표
- **전환율**: 무료 → 유료 전환율 15% 달성
- **매출**: 6개월 내 월 매출 $10,000 달성
- **고객 획득 비용**: CAC < $50
- **고객 생애 가치**: LTV > $250 (LTV/CAC > 5:1)

### 기술 지표
- **시스템 가용성**: 99.9% uptime 유지
- **응답 시간**: 평균 응답 시간 < 1초
- **에러율**: 전체 요청 대비 에러율 < 0.1%
- **보안**: 중대한 보안 사고 0건

### 제품 지표
- **기능 완성도**: 계획 대비 90% 기능 구현
- **버그 발생률**: 사용자 보고 버그 < 월 10건
- **업데이트 주기**: 2주마다 정기 업데이트
- **사용자 피드백**: 평균 평점 4.5/5.0 이상
""",
            
            "timeline": """
## 📅 Development Timeline

### Phase 1: 기반 구축 (4주)
```yaml
Week 1-2: 프로젝트 설정
  - 개발 환경 구성
  - UI/UX 설계 및 프로토타입
  - 기본 인증 시스템
  - 데이터베이스 스키마 설계

Week 3-4: 핵심 인프라
  - API 서버 구축
  - 프론트엔드 기본 구조
  - CI/CD 파이프라인
  - 기본 테스트 프레임워크
```

### Phase 2: 핵심 기능 ({{ development_complexity == "High" and "6주" or "4주" }})
```yaml
핵심 비즈니스 로직:
{% for feature in key_features %}
  - {{ feature.name }}: {{ feature.effort or "2주" }}
{% endfor %}

통합 및 테스트:
  - 기능 간 연동 테스트
  - 사용자 시나리오 검증
  - 성능 최적화
```

### Phase 3: 고급 기능 및 최적화 (3주)
```yaml
Week 1: 고급 기능
  - 분석 대시보드
  - 알림 시스템
  - 관리자 도구

Week 2: 최적화
  - 성능 튜닝
  - 보안 강화
  - 모바일 최적화

Week 3: 배포 준비
  - 프로덕션 환경 설정
  - 모니터링 시스템
  - 백업 및 복구 계획
```

### Phase 4: 론칭 및 운영 (2주)
```yaml
Week 1: 베타 테스트
  - 내부 테스트 완료
  - 제한된 사용자 베타
  - 피드백 수집 및 개선

Week 2: 정식 론칭
  - 프로덕션 배포
  - 모니터링 및 지원
  - 마케팅 활동 시작
```

**총 예상 기간**: {{ development_complexity == "High" and "15주 (약 4개월)" or development_complexity == "Medium" and "13주 (약 3개월)" or "11주 (약 2.5개월)" }}
**예상 투자**: {{ development_complexity == "High" and "$75,000" or development_complexity == "Medium" and "$50,000" or "$30,000" }}
"""
        }
        
        style_config = {
            "theme": "business",
            "colors": {
                "primary": "#3B82F6",
                "secondary": "#10B981",
                "accent": "#F59E0B"
            },
            "typography": {
                "heading_font": "Inter",
                "body_font": "Inter",
                "code_font": "JetBrains Mono"
            }
        }
        
        return PRDTemplate(metadata=metadata, content=content, style_config=style_config)
    
    def _create_saas_template(self) -> PRDTemplate:
        """Create SaaS-specific PRD template"""
        
        metadata = TemplateMetadata(
            id="saas_platform_v1",
            name="SaaS 플랫폼 PRD",
            description="SaaS 비즈니스 모델을 위한 전문 PRD 템플릿",
            template_type=TemplateType.SAAS,
            sections=[
                TemplateSection.EXECUTIVE_SUMMARY,
                TemplateSection.PROBLEM_STATEMENT,
                TemplateSection.SOLUTION_OVERVIEW,
                TemplateSection.TARGET_MARKET,
                TemplateSection.FEATURES,
                TemplateSection.TECHNICAL_REQUIREMENTS,
                TemplateSection.SUCCESS_METRICS,
                TemplateSection.TIMELINE,
                TemplateSection.RISK_ASSESSMENT
            ],
            variables=[
                TemplateVariable("saas_name", "string", "SaaS 플랫폼 이름"),
                TemplateVariable("subscription_model", "string", "구독 모델", False, "Freemium"),
                TemplateVariable("target_mrr", "number", "목표 월 매출", False, 10000),
                TemplateVariable("pricing_tiers", "array", "가격 티어", False, []),
                TemplateVariable("integration_apis", "array", "연동 API 목록", False, [])
            ],
            tags=["saas", "subscription", "platform"]
        )
        
        # SaaS-specific content would be defined here
        content = {
            "executive_summary": """
# 🚀 {{ saas_name }} - SaaS Platform PRD

## 💰 Business Model
- **구독 모델**: {{ subscription_model }}
- **목표 MRR**: ${{ target_mrr:,}} (12개월 내)
- **타겟 고객**: {{ target_audience }}

[SaaS-specific content continues...]
""",
            # Additional SaaS-specific sections...
        }
        
        return PRDTemplate(metadata=metadata, content=content)
    
    def _create_mobile_app_template(self) -> PRDTemplate:
        """Create mobile app PRD template"""
        
        metadata = TemplateMetadata(
            id="mobile_app_v1",
            name="모바일 앱 PRD",
            description="iOS/Android 모바일 애플리케이션을 위한 PRD 템플릿",
            template_type=TemplateType.MOBILE_APP,
            variables=[
                TemplateVariable("app_name", "string", "앱 이름"),
                TemplateVariable("platforms", "array", "지원 플랫폼", False, ["iOS", "Android"]),
                TemplateVariable("min_ios_version", "string", "최소 iOS 버전", False, "14.0"),
                TemplateVariable("min_android_version", "string", "최소 Android 버전", False, "10.0")
            ],
            tags=["mobile", "ios", "android", "app"]
        )
        
        content = {
            "executive_summary": """
# 📱 {{ app_name }} - Mobile App PRD

## 플랫폼 지원
{% for platform in platforms %}
- {{ platform }}{% if platform == "iOS" %} ({{ min_ios_version }}+){% elif platform == "Android" %} ({{ min_android_version }}+){% endif %}
{% endfor %}

[Mobile-specific content continues...]
"""
        }
        
        return PRDTemplate(metadata=metadata, content=content)
    
    def _create_enterprise_template(self) -> PRDTemplate:
        """Create enterprise PRD template"""
        
        metadata = TemplateMetadata(
            id="enterprise_solution_v1",
            name="엔터프라이즈 솔루션 PRD",
            description="대기업 대상 엔터프라이즈 솔루션을 위한 PRD 템플릿",
            template_type=TemplateType.ENTERPRISE,
            variables=[
                TemplateVariable("enterprise_name", "string", "엔터프라이즈 솔루션 이름"),
                TemplateVariable("compliance_requirements", "array", "컴플라이언스 요구사항", False, []),
                TemplateVariable("integration_systems", "array", "기존 시스템 연동", False, []),
                TemplateVariable("sla_requirements", "object", "SLA 요구사항", False, {})
            ],
            tags=["enterprise", "B2B", "compliance", "integration"]
        )
        
        content = {
            "executive_summary": """
# 🏢 {{ enterprise_name }} - Enterprise Solution PRD

## 엔터프라이즈 특화 요구사항
- **컴플라이언스**: {{ compliance_requirements | join(", ") if compliance_requirements else "표준 보안 정책" }}
- **기존 시스템 연동**: {{ integration_systems | join(", ") if integration_systems else "API 기반 연동" }}

[Enterprise-specific content continues...]
"""
        }
        
        return PRDTemplate(metadata=metadata, content=content)
    
    def register_template(self, template: PRDTemplate) -> bool:
        """Register a new template"""
        try:
            template_id = template.metadata.id
            
            if template_id in self.templates:
                self.logger.warning(f"Template {template_id} already exists, overwriting")
            
            self.templates[template_id] = template
            
            # Save to file
            self._save_template_to_file(template)
            
            self.logger.info(f"Template registered successfully", 
                           template_id=template_id,
                           template_type=template.metadata.template_type.value)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to register template", error=str(e))
            return False
    
    def get_template(self, template_id: str) -> Optional[PRDTemplate]:
        """Get template by ID"""
        return self.templates.get(template_id)
    
    def list_templates(self, template_type: Optional[TemplateType] = None) -> List[TemplateMetadata]:
        """List available templates"""
        templates = []
        
        for template in self.templates.values():
            if template_type is None or template.metadata.template_type == template_type:
                templates.append(template.metadata)
        
        # Sort by usage count and success rate
        templates.sort(key=lambda t: (t.usage_count, t.success_rate), reverse=True)
        
        return templates
    
    def render_template(self, template_id: str, variables: Dict[str, Any]) -> Optional[Dict[str, str]]:
        """Render template with provided variables"""
        
        start_time = time.time()
        
        try:
            template = self.get_template(template_id)
            if not template:
                self.logger.error(f"Template not found", template_id=template_id)
                return None
            
            # Validate required variables
            missing_vars = self._validate_variables(template, variables)
            if missing_vars:
                self.logger.error(f"Missing required variables", 
                               template_id=template_id,
                               missing_variables=missing_vars)
                return None
            
            # Merge with default values
            merged_vars = self._merge_with_defaults(template, variables)
            
            # Render each section
            rendered_content = {}
            
            for section_name, section_content in template.content.items():
                try:
                    jinja_template = self.jinja_env.from_string(section_content)
                    rendered_section = jinja_template.render(**merged_vars)
                    rendered_content[section_name] = rendered_section.strip()
                    
                except Exception as section_error:
                    self.logger.warning(f"Failed to render section", 
                                      section=section_name,
                                      error=str(section_error))
                    rendered_content[section_name] = f"[렌더링 오류: {section_name}]"
            
            # Update usage statistics
            self._update_template_stats(template_id, time.time() - start_time, True)
            
            self.logger.info(f"Template rendered successfully",
                           template_id=template_id,
                           render_time=time.time() - start_time,
                           sections_count=len(rendered_content))
            
            return rendered_content
            
        except Exception as e:
            self._update_template_stats(template_id, time.time() - start_time, False)
            self.logger.error(f"Template rendering failed", 
                            template_id=template_id,
                            error=str(e))
            return None
    
    def _validate_variables(self, template: PRDTemplate, variables: Dict[str, Any]) -> List[str]:
        """Validate required template variables"""
        missing_vars = []
        
        for var in template.metadata.variables:
            if var.required and var.name not in variables:
                missing_vars.append(var.name)
        
        return missing_vars
    
    def _merge_with_defaults(self, template: PRDTemplate, variables: Dict[str, Any]) -> Dict[str, Any]:
        """Merge variables with template defaults"""
        merged = variables.copy()
        
        for var in template.metadata.variables:
            if var.name not in merged and var.default_value is not None:
                merged[var.name] = var.default_value
        
        return merged
    
    def _update_template_stats(self, template_id: str, render_time: float, success: bool):
        """Update template usage statistics"""
        if template_id not in self.templates:
            return
        
        template = self.templates[template_id]
        metadata = template.metadata
        
        # Update global stats
        self.generation_stats["total_renders"] += 1
        if success:
            self.generation_stats["successful_renders"] += 1
        
        # Update template-specific stats
        metadata.usage_count += 1
        
        if success:
            # Update average generation time
            current_avg = metadata.average_generation_time
            count = metadata.usage_count
            metadata.average_generation_time = (current_avg * (count - 1) + render_time) / count
            
            # Update success rate
            successful_renders = metadata.usage_count * metadata.success_rate / 100
            if metadata.usage_count > 1:
                metadata.success_rate = ((successful_renders + 1) / metadata.usage_count) * 100
            else:
                metadata.success_rate = 100.0
        else:
            # Recalculate success rate
            if metadata.usage_count > 1:
                successful_renders = (metadata.usage_count - 1) * metadata.success_rate / 100
                metadata.success_rate = (successful_renders / metadata.usage_count) * 100
        
        metadata.updated_at = datetime.utcnow()
    
    def _save_template_to_file(self, template: PRDTemplate):
        """Save template to file for persistence"""
        try:
            template_file = self.templates_dir / f"{template.metadata.id}.json"
            
            # Convert to serializable format
            template_data = {
                "metadata": asdict(template.metadata),
                "content": template.content,
                "style_config": template.style_config
            }
            
            # Handle datetime serialization
            template_data["metadata"]["created_at"] = template.metadata.created_at.isoformat()
            template_data["metadata"]["updated_at"] = template.metadata.updated_at.isoformat()
            template_data["metadata"]["template_type"] = template.metadata.template_type.value
            template_data["metadata"]["sections"] = [s.value for s in template.metadata.sections]
            
            with open(template_file, 'w', encoding='utf-8') as f:
                json.dump(template_data, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            self.logger.error(f"Failed to save template to file", 
                            template_id=template.metadata.id,
                            error=str(e))
    
    def get_template_recommendations(self, business_idea: Dict[str, Any]) -> List[str]:
        """Recommend templates based on business idea characteristics"""
        
        description = business_idea.get("description", "").lower()
        title = business_idea.get("title", "").lower()
        combined_text = f"{title} {description}"
        
        recommendations = []
        
        # Rule-based recommendations
        if any(keyword in combined_text for keyword in ["saas", "구독", "subscription", "플랫폼"]):
            recommendations.append("saas_platform_v1")
        
        if any(keyword in combined_text for keyword in ["모바일", "앱", "mobile", "app", "ios", "android"]):
            recommendations.append("mobile_app_v1")
        
        if any(keyword in combined_text for keyword in ["기업", "enterprise", "b2b", "대기업"]):
            recommendations.append("enterprise_solution_v1")
        
        # Default to standard template
        if not recommendations:
            recommendations.append("standard_business_v1")
        
        return recommendations
    
    def get_manager_statistics(self) -> Dict[str, Any]:
        """Get template manager statistics"""
        
        total_templates = len(self.templates)
        template_types = {}
        
        for template in self.templates.values():
            template_type = template.metadata.template_type.value
            if template_type not in template_types:
                template_types[template_type] = 0
            template_types[template_type] += 1
        
        # Calculate global success rate
        global_success_rate = 0
        if self.generation_stats["total_renders"] > 0:
            global_success_rate = (self.generation_stats["successful_renders"] / 
                                 self.generation_stats["total_renders"]) * 100
        
        return {
            "templates": {
                "total_count": total_templates,
                "by_type": template_types,
                "most_used": max(self.templates.values(), 
                               key=lambda t: t.metadata.usage_count).metadata.id if self.templates else None
            },
            "rendering": {
                "total_renders": self.generation_stats["total_renders"],
                "successful_renders": self.generation_stats["successful_renders"],
                "success_rate": round(global_success_rate, 2),
                "average_render_time": round(self.generation_stats.get("average_render_time", 0), 3)
            },
            "features": {
                "jinja2_enabled": True,
                "custom_templates": True,
                "template_validation": True,
                "usage_analytics": True
            }
        }


# Global template manager instance
_template_manager = None

def get_template_manager() -> PRDTemplateManager:
    """Get global template manager instance"""
    global _template_manager
    if _template_manager is None:
        _template_manager = PRDTemplateManager()
    return _template_manager