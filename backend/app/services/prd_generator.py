"""
PRD Generator Service
Automatic PRD generation with Mermaid diagrams and templates
"""

import asyncio
import json
import time
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import structlog

from app.services.ai.openai_client import get_openai_client, ModelConfig
from app.services.ai.prompt_engine import get_prompt_engine
from app.services.database import DatabaseService

logger = structlog.get_logger()

class DiagramType(Enum):
    """Types of Mermaid diagrams"""
    FLOWCHART = "flowchart"
    ERD = "erDiagram"
    ARCHITECTURE = "graph"
    USER_JOURNEY = "journey"
    GANTT = "gantt"
    SEQUENCE = "sequenceDiagram"

@dataclass
class MermaidDiagram:
    """Generated Mermaid diagram with metadata"""
    diagram_type: DiagramType
    title: str
    description: str
    mermaid_code: str
    complexity_score: float
    generated_at: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def is_valid(self) -> bool:
        """Check if diagram code is valid"""
        return (len(self.mermaid_code) > 20 and 
                self.diagram_type.value in self.mermaid_code)

@dataclass
class PRDDocument:
    """Complete PRD document with diagrams"""
    id: str
    title: str
    business_idea_id: str
    executive_summary: str
    target_market: str
    features: List[Dict[str, Any]]
    technical_requirements: Dict[str, Any]
    diagrams: List[MermaidDiagram]
    timeline: str
    success_metrics: List[str]
    generated_at: datetime = field(default_factory=datetime.utcnow)
    template_version: str = "v1.0"
    
    @property
    def estimated_dev_time(self) -> str:
        """Estimate development time based on complexity"""
        total_complexity = sum(d.complexity_score for d in self.diagrams)
        if total_complexity > 8.0:
            return "12-18개월 (복잡한 엔터프라이즈 시스템)"
        elif total_complexity > 5.0:
            return "6-12개월 (중대규모 애플리케이션)"
        elif total_complexity > 3.0:
            return "3-6개월 (표준 웹 애플리케이션)"
        else:
            return "1-3개월 (간단한 프로토타입)"

class MermaidDiagramGenerator:
    """Advanced Mermaid diagram generator"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="MermaidGenerator")
        self.openai_client = get_openai_client()
        self.prompt_engine = get_prompt_engine()
        
        # Vercel-optimized configuration
        self.max_diagram_complexity = 15  # Nodes limit for performance
        self.generation_timeout = 30  # seconds
        self.retry_attempts = 2
        
        # Diagram templates for common patterns
        self._initialize_diagram_templates()
    
    def _initialize_diagram_templates(self):
        """Initialize Mermaid diagram templates"""
        
        self.diagram_templates = {
            DiagramType.FLOWCHART: {
                "web_app": """
flowchart TD
    A[사용자] --> B[웹 애플리케이션]
    B --> C{인증 필요?}
    C -->|Yes| D[로그인 페이지]
    C -->|No| E[메인 대시보드]
    D --> F[인증 확인]
    F --> E
    E --> G[핵심 기능]
    G --> H[데이터 처리]
    H --> I[결과 표시]
    I --> J[사용자 피드백]
    J --> A
""",
                "mobile_app": """
flowchart TD
    Start([앱 시작]) --> Loading[로딩 화면]
    Loading --> Auth{로그인 상태}
    Auth -->|Logged In| Dashboard[대시보드]
    Auth -->|Not Logged In| Login[로그인]
    Login --> Dashboard
    Dashboard --> Feature1[주요 기능 1]
    Dashboard --> Feature2[주요 기능 2]
    Feature1 --> API[API 호출]
    Feature2 --> API
    API --> Response[응답 처리]
    Response --> UI[UI 업데이트]
""",
                "saas": """
flowchart TD
    User[사용자] --> Landing[랜딩 페이지]
    Landing --> Signup[회원가입]
    Signup --> Onboarding[온보딩]
    Onboarding --> Dashboard[대시보드]
    Dashboard --> Core[핵심 서비스]
    Core --> Analytics[분석]
    Analytics --> Reports[리포트]
    Reports --> Export[내보내기]
    Core --> Settings[설정]
    Settings --> Billing[결제 관리]
"""
            },
            
            DiagramType.ERD: {
                "basic": """
erDiagram
    USER {
        uuid id PK
        string email
        string password_hash
        datetime created_at
        datetime updated_at
        boolean is_active
    }
    
    PROJECT {
        uuid id PK
        uuid user_id FK
        string title
        text description
        enum status
        datetime created_at
        datetime updated_at
    }
    
    TASK {
        uuid id PK
        uuid project_id FK
        string title
        text description
        enum priority
        datetime due_date
        datetime completed_at
    }
    
    USER ||--o{ PROJECT : creates
    PROJECT ||--o{ TASK : contains
""",
                "ecommerce": """
erDiagram
    USER {
        uuid id PK
        string email
        string first_name
        string last_name
        datetime created_at
    }
    
    PRODUCT {
        uuid id PK
        string name
        text description
        decimal price
        int stock_quantity
        boolean is_active
    }
    
    ORDER {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        enum status
        datetime created_at
    }
    
    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }
    
    USER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : included_in
"""
            },
            
            DiagramType.ARCHITECTURE: {
                "microservices": """
graph TB
    subgraph "Frontend"
        React[React App]
        Mobile[Mobile App]
    end
    
    subgraph "API Gateway"
        Gateway[API Gateway]
    end
    
    subgraph "Services"
        Auth[Auth Service]
        User[User Service]
        Product[Product Service]
        Order[Order Service]
    end
    
    subgraph "Databases"
        UserDB[(User DB)]
        ProductDB[(Product DB)]
        OrderDB[(Order DB)]
    end
    
    subgraph "External"
        Payment[Payment Gateway]
        Email[Email Service]
    end
    
    React --> Gateway
    Mobile --> Gateway
    Gateway --> Auth
    Gateway --> User
    Gateway --> Product
    Gateway --> Order
    
    Auth --> UserDB
    User --> UserDB
    Product --> ProductDB
    Order --> OrderDB
    Order --> Payment
    Auth --> Email
"""
            }
        }
    
    async def generate_flowchart(self, business_idea: Dict[str, Any], context: Dict[str, Any] = None) -> MermaidDiagram:
        """Generate flowchart diagram for business idea"""
        
        try:
            self.logger.info("Generating flowchart diagram", idea_id=business_idea.get("id"))
            
            # Determine app type and select appropriate template
            app_type = self._determine_app_type(business_idea)
            base_template = self.diagram_templates[DiagramType.FLOWCHART].get(app_type, 
                          self.diagram_templates[DiagramType.FLOWCHART]["web_app"])
            
            # Prepare variables for customization
            variables = {
                "business_title": business_idea.get("title", "비즈니스 아이디어"),
                "description": business_idea.get("description", ""),
                "target_market": business_idea.get("target_market", "일반 사용자"),
                "key_features": self._extract_key_features(business_idea),
                "base_template": base_template,
                "app_type": app_type
            }
            
            # Generate customized flowchart using AI
            customized_diagram = await self._generate_ai_flowchart(variables)
            
            # Create Mermaid diagram object
            diagram = MermaidDiagram(
                diagram_type=DiagramType.FLOWCHART,
                title=f"🔄 {business_idea.get('title', 'Business')} - 사용자 플로우",
                description=f"{app_type.title()} 타입의 사용자 여정 및 주요 기능 플로우",
                mermaid_code=customized_diagram,
                complexity_score=self._calculate_complexity_score(customized_diagram)
            )
            
            self.logger.info("Flowchart diagram generated successfully", 
                           complexity=diagram.complexity_score,
                           valid=diagram.is_valid)
            
            return diagram
            
        except Exception as e:
            self.logger.error("Flowchart generation failed", error=str(e))
            return self._create_fallback_flowchart(business_idea)
    
    async def generate_erd(self, business_idea: Dict[str, Any], technical_requirements: Dict[str, Any] = None) -> MermaidDiagram:
        """Generate ERD diagram for data model"""
        
        try:
            self.logger.info("Generating ERD diagram", idea_id=business_idea.get("id"))
            
            # Determine database schema type
            schema_type = self._determine_schema_type(business_idea, technical_requirements)
            base_template = self.diagram_templates[DiagramType.ERD].get(schema_type,
                          self.diagram_templates[DiagramType.ERD]["basic"])
            
            # Prepare variables for ERD generation
            variables = {
                "business_title": business_idea.get("title", ""),
                "description": business_idea.get("description", ""),
                "target_market": business_idea.get("target_market", ""),
                "base_template": base_template,
                "schema_type": schema_type,
                "entities": self._extract_entities(business_idea),
                "relationships": self._extract_relationships(business_idea)
            }
            
            # Generate customized ERD using AI
            customized_erd = await self._generate_ai_erd(variables)
            
            # Create Mermaid diagram object
            diagram = MermaidDiagram(
                diagram_type=DiagramType.ERD,
                title=f"🗄️ {business_idea.get('title', 'Business')} - 데이터 모델",
                description=f"{schema_type.title()} 스키마 기반 엔티티 관계도",
                mermaid_code=customized_erd,
                complexity_score=self._calculate_complexity_score(customized_erd)
            )
            
            self.logger.info("ERD diagram generated successfully",
                           complexity=diagram.complexity_score,
                           entities_count=customized_erd.count("{")):
            
            return diagram
            
        except Exception as e:
            self.logger.error("ERD generation failed", error=str(e))
            return self._create_fallback_erd(business_idea)
    
    async def generate_system_architecture(self, business_idea: Dict[str, Any], 
                                        technical_requirements: Dict[str, Any] = None) -> MermaidDiagram:
        """Generate system architecture diagram"""
        
        try:
            self.logger.info("Generating architecture diagram", idea_id=business_idea.get("id"))
            
            # Determine architecture pattern
            arch_pattern = self._determine_architecture_pattern(business_idea, technical_requirements)
            base_template = self.diagram_templates[DiagramType.ARCHITECTURE].get(arch_pattern,
                          self.diagram_templates[DiagramType.ARCHITECTURE]["microservices"])
            
            # Prepare variables for architecture generation
            variables = {
                "business_title": business_idea.get("title", ""),
                "description": business_idea.get("description", ""),
                "tech_stack": technical_requirements.get("tech_stack", []) if technical_requirements else [],
                "scalability_requirements": technical_requirements.get("scalability", "medium") if technical_requirements else "medium",
                "base_template": base_template,
                "arch_pattern": arch_pattern
            }
            
            # Generate customized architecture using AI
            customized_arch = await self._generate_ai_architecture(variables)
            
            # Create Mermaid diagram object
            diagram = MermaidDiagram(
                diagram_type=DiagramType.ARCHITECTURE,
                title=f"🏗️ {business_idea.get('title', 'Business')} - 시스템 아키텍처",
                description=f"{arch_pattern.title()} 패턴 기반 시스템 구조도",
                mermaid_code=customized_arch,
                complexity_score=self._calculate_complexity_score(customized_arch)
            )
            
            self.logger.info("Architecture diagram generated successfully",
                           complexity=diagram.complexity_score,
                           components_count=customized_arch.count("subgraph"))
            
            return diagram
            
        except Exception as e:
            self.logger.error("Architecture generation failed", error=str(e))
            return self._create_fallback_architecture(business_idea)
    
    def _determine_app_type(self, business_idea: Dict[str, Any]) -> str:
        """Determine application type from business idea"""
        description = business_idea.get("description", "").lower()
        title = business_idea.get("title", "").lower()
        
        combined_text = f"{title} {description}"
        
        if any(keyword in combined_text for keyword in ["saas", "구독", "subscription", "플랫폼"]):
            return "saas"
        elif any(keyword in combined_text for keyword in ["모바일", "앱", "mobile", "app"]):
            return "mobile_app"
        else:
            return "web_app"
    
    def _determine_schema_type(self, business_idea: Dict[str, Any], technical_requirements: Dict[str, Any] = None) -> str:
        """Determine database schema type"""
        description = business_idea.get("description", "").lower()
        
        if any(keyword in description for keyword in ["쇼핑", "상품", "주문", "결제", "ecommerce", "shop"]):
            return "ecommerce"
        else:
            return "basic"
    
    def _determine_architecture_pattern(self, business_idea: Dict[str, Any], 
                                      technical_requirements: Dict[str, Any] = None) -> str:
        """Determine system architecture pattern"""
        
        if technical_requirements:
            scalability = technical_requirements.get("scalability", "medium")
            if scalability == "high":
                return "microservices"
        
        # Default to microservices for modern applications
        return "microservices"
    
    def _extract_key_features(self, business_idea: Dict[str, Any]) -> List[str]:
        """Extract key features from business idea"""
        description = business_idea.get("description", "")
        
        # Simple keyword extraction for features
        feature_keywords = [
            "로그인", "회원가입", "대시보드", "검색", "필터링", "정렬", 
            "알림", "메시지", "결제", "분석", "리포트", "설정", "프로필"
        ]
        
        found_features = []
        for keyword in feature_keywords:
            if keyword in description:
                found_features.append(keyword)
        
        return found_features[:5]  # Limit to 5 features
    
    def _extract_entities(self, business_idea: Dict[str, Any]) -> List[str]:
        """Extract potential database entities"""
        description = business_idea.get("description", "").lower()
        
        entity_keywords = {
            "사용자": ["사용자", "유저", "회원", "고객"],
            "프로젝트": ["프로젝트", "작업", "업무"],
            "제품": ["제품", "상품", "아이템"],
            "주문": ["주문", "구매", "결제"],
            "게시글": ["게시글", "포스트", "글"],
            "댓글": ["댓글", "답변", "리뷰"]
        }
        
        found_entities = []
        for entity, keywords in entity_keywords.items():
            if any(keyword in description for keyword in keywords):
                found_entities.append(entity)
        
        return found_entities
    
    def _extract_relationships(self, business_idea: Dict[str, Any]) -> List[str]:
        """Extract entity relationships"""
        # Simple relationship inference
        entities = self._extract_entities(business_idea)
        relationships = []
        
        if "사용자" in entities and "프로젝트" in entities:
            relationships.append("사용자가 프로젝트를 생성")
        if "사용자" in entities and "주문" in entities:
            relationships.append("사용자가 주문을 수행")
        if "제품" in entities and "주문" in entities:
            relationships.append("주문이 제품을 포함")
        
        return relationships
    
    async def _generate_ai_flowchart(self, variables: Dict[str, Any]) -> str:
        """Generate AI-customized flowchart"""
        
        # For now, return enhanced template
        # TODO: Implement AI customization using prompt_engine
        base = variables["base_template"]
        
        # Simple customization based on business title
        business_title = variables["business_title"]
        if business_title:
            base = base.replace("웹 애플리케이션", f"{business_title}")
            base = base.replace("핵심 기능", f"{business_title} 핵심 기능")
        
        return base
    
    async def _generate_ai_erd(self, variables: Dict[str, Any]) -> str:
        """Generate AI-customized ERD"""
        
        # Return enhanced template with business-specific entities
        base = variables["base_template"]
        business_title = variables["business_title"]
        
        if business_title and "PROJECT" in base:
            base = base.replace("PROJECT", business_title.upper().replace(" ", "_"))
        
        return base
    
    async def _generate_ai_architecture(self, variables: Dict[str, Any]) -> str:
        """Generate AI-customized architecture"""
        
        # Return enhanced template
        base = variables["base_template"]
        business_title = variables["business_title"]
        
        if business_title:
            base = base.replace("React App", f"{business_title} Web")
            base = base.replace("Mobile App", f"{business_title} Mobile")
        
        return base
    
    def _calculate_complexity_score(self, mermaid_code: str) -> float:
        """Calculate diagram complexity score"""
        
        # Count various complexity indicators
        node_count = mermaid_code.count("-->") + mermaid_code.count("|")
        subgraph_count = mermaid_code.count("subgraph")
        entity_count = mermaid_code.count("{") 
        
        # Base complexity calculation
        complexity = (node_count * 0.1) + (subgraph_count * 0.5) + (entity_count * 0.3)
        
        # Normalize to 0-10 scale
        return min(10.0, max(1.0, complexity))
    
    def _create_fallback_flowchart(self, business_idea: Dict[str, Any]) -> MermaidDiagram:
        """Create fallback flowchart on generation failure"""
        
        title = business_idea.get("title", "비즈니스 아이디어")
        
        fallback_code = f"""
flowchart TD
    A[사용자] --> B[{title}]
    B --> C[주요 기능]
    C --> D[결과 제공]
    D --> E[사용자 만족]
    E --> A
"""
        
        return MermaidDiagram(
            diagram_type=DiagramType.FLOWCHART,
            title=f"🔄 {title} - 기본 플로우",
            description="기본 사용자 플로우 (간단 버전)",
            mermaid_code=fallback_code,
            complexity_score=2.0
        )
    
    def _create_fallback_erd(self, business_idea: Dict[str, Any]) -> MermaidDiagram:
        """Create fallback ERD on generation failure"""
        
        title = business_idea.get("title", "비즈니스")
        
        fallback_code = f"""
erDiagram
    USER {{
        uuid id PK
        string email
        datetime created_at
    }}
    
    {title.upper().replace(" ", "_")} {{
        uuid id PK
        uuid user_id FK
        string name
        datetime created_at
    }}
    
    USER ||--o{{ {title.upper().replace(" ", "_")} : creates
"""
        
        return MermaidDiagram(
            diagram_type=DiagramType.ERD,
            title=f"🗄️ {title} - 기본 데이터 모델",
            description="기본 엔티티 관계도 (간단 버전)",
            mermaid_code=fallback_code,
            complexity_score=2.0
        )
    
    def _create_fallback_architecture(self, business_idea: Dict[str, Any]) -> MermaidDiagram:
        """Create fallback architecture on generation failure"""
        
        title = business_idea.get("title", "비즈니스")
        
        fallback_code = f"""
graph TB
    Frontend[{title} Frontend]
    Backend[{title} Backend]
    Database[(Database)]
    
    Frontend --> Backend
    Backend --> Database
"""
        
        return MermaidDiagram(
            diagram_type=DiagramType.ARCHITECTURE,
            title=f"🏗️ {title} - 기본 아키텍처",
            description="기본 시스템 구조도 (간단 버전)",
            mermaid_code=fallback_code,
            complexity_score=1.5
        )


class PRDGeneratorService:
    """Complete PRD generation service with Mermaid diagrams and templates"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="PRDGenerator")
        self.mermaid_generator = MermaidDiagramGenerator()
        self.openai_client = get_openai_client()
        
        # Initialize template manager (lazy import to avoid circular dependencies)
        self._template_manager = None
        
        # Generation configuration
        self.max_concurrent_diagrams = 3  # Vercel memory limit
        self.total_generation_timeout = 120  # 2 minutes total
        
        # Performance tracking
        self.total_generated = 0
        self.successful_generations = 0
        self.average_generation_time = 0.0
    
    @property
    def template_manager(self):
        """Lazy load template manager to avoid circular imports"""
        if self._template_manager is None:
            from app.services.prd_templates import get_template_manager
            self._template_manager = get_template_manager()
        return self._template_manager
    
    async def generate_complete_prd(self, business_idea: Dict[str, Any], 
                                  options: Dict[str, Any] = None) -> PRDDocument:
        """Generate complete PRD document with all diagrams"""
        
        start_time = time.time()
        idea_id = business_idea.get("id", "unknown")
        
        try:
            self.logger.info("Starting complete PRD generation", idea_id=idea_id)
            
            # Parse options
            options = options or {}
            include_diagrams = options.get("include_diagrams", ["flowchart", "erd", "architecture"])
            technical_requirements = options.get("technical_requirements", {})
            
            # Generate diagrams concurrently (Vercel optimized)
            diagram_tasks = []
            
            if "flowchart" in include_diagrams:
                diagram_tasks.append(self.mermaid_generator.generate_flowchart(business_idea))
            
            if "erd" in include_diagrams:
                diagram_tasks.append(self.mermaid_generator.generate_erd(business_idea, technical_requirements))
            
            if "architecture" in include_diagrams:
                diagram_tasks.append(self.mermaid_generator.generate_system_architecture(business_idea, technical_requirements))
            
            # Execute diagram generation with timeout
            try:
                diagrams = await asyncio.wait_for(
                    asyncio.gather(*diagram_tasks, return_exceptions=True),
                    timeout=60  # 1 minute for diagrams
                )
                
                # Filter successful diagrams
                valid_diagrams = [d for d in diagrams if isinstance(d, MermaidDiagram) and d.is_valid]
                
            except asyncio.TimeoutError:
                self.logger.warning("Diagram generation timeout, using fallbacks")
                valid_diagrams = [
                    self.mermaid_generator._create_fallback_flowchart(business_idea),
                    self.mermaid_generator._create_fallback_erd(business_idea)
                ]
            
            # Generate PRD content using templates
            prd_content = await self._generate_prd_content_with_templates(business_idea, valid_diagrams, technical_requirements, options)
            
            # Create PRD document
            prd_document = PRDDocument(
                id=f"prd_{idea_id}_{int(time.time())}",
                title=prd_content["title"],
                business_idea_id=idea_id,
                executive_summary=prd_content["executive_summary"],
                target_market=prd_content["target_market"],
                features=prd_content["features"],
                technical_requirements=prd_content["technical_requirements"],
                diagrams=valid_diagrams,
                timeline=prd_content["timeline"],
                success_metrics=prd_content["success_metrics"]
            )
            
            generation_time = time.time() - start_time
            
            # Update performance metrics
            self.total_generated += 1
            self.successful_generations += 1
            self.average_generation_time = (
                (self.average_generation_time * (self.successful_generations - 1) + generation_time) / 
                self.successful_generations
            )
            
            self.logger.info("PRD generation completed successfully",
                           prd_id=prd_document.id,
                           diagrams_count=len(valid_diagrams),
                           generation_time=generation_time,
                           estimated_dev_time=prd_document.estimated_dev_time)
            
            return prd_document
            
        except Exception as e:
            generation_time = time.time() - start_time
            self.total_generated += 1
            
            self.logger.error("PRD generation failed", 
                            idea_id=idea_id,
                            error=str(e),
                            generation_time=generation_time)
            
            # Return minimal PRD document
            return self._create_minimal_prd(business_idea)
    
    async def _generate_prd_content_with_templates(self, business_idea: Dict[str, Any], 
                                                 diagrams: List[MermaidDiagram],
                                                 technical_requirements: Dict[str, Any],
                                                 options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate PRD content using template system"""
        
        try:
            # Parse options
            options = options or {}
            template_id = options.get("template_id")
            
            # Auto-select template if not specified
            if not template_id:
                recommendations = self.template_manager.get_template_recommendations(business_idea)
                template_id = recommendations[0] if recommendations else "standard_business_v1"
            
            # Prepare template variables
            template_variables = self._prepare_template_variables(business_idea, diagrams, technical_requirements)
            
            # Render template
            rendered_content = self.template_manager.render_template(template_id, template_variables)
            
            if rendered_content:
                self.logger.info("PRD content generated using template", 
                               template_id=template_id,
                               sections=list(rendered_content.keys()))
                
                # Convert rendered content to expected format
                return self._convert_rendered_content(rendered_content, business_idea, diagrams)
            else:
                self.logger.warning("Template rendering failed, falling back to basic generation")
                return await self._generate_prd_content_basic(business_idea, diagrams, technical_requirements)
                
        except Exception as e:
            self.logger.error("Template-based generation failed", error=str(e))
            return await self._generate_prd_content_basic(business_idea, diagrams, technical_requirements)
    
    def _prepare_template_variables(self, business_idea: Dict[str, Any], 
                                  diagrams: List[MermaidDiagram],
                                  technical_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare variables for template rendering"""
        
        # Extract key information
        title = business_idea.get("title", "새로운 비즈니스 아이디어")
        description = business_idea.get("description", "")
        target_market = business_idea.get("target_market", "일반 사용자")
        
        # Calculate complexity
        complexity_score = sum(d.complexity_score for d in diagrams) / len(diagrams) if diagrams else 3.0
        development_complexity = "High" if complexity_score > 7 else "Medium" if complexity_score > 4 else "Low"
        
        # Prepare features list
        features = self._extract_detailed_features(business_idea, diagrams)
        
        # Prepare technical stack
        tech_stack = {
            "frontend": {
                "framework": "Next.js 15 + TypeScript",
                "styling": "Tailwind CSS",
                "deployment": "Vercel"
            },
            "backend": {
                "framework": "FastAPI + Python",
                "database": "PostgreSQL (Supabase)",
                "hosting": "Vercel Serverless"
            },
            "scalability": technical_requirements.get("scalability", "Medium (100-1000 users)"),
            "concurrent_users": technical_requirements.get("concurrent_users", "1,000명"),
            "data_volume": technical_requirements.get("data_volume", "일일 10MB")
        }
        
        return {
            # Basic info
            "business_title": title,
            "problem_description": description,
            "target_audience": target_market,
            
            # AI analysis results
            "confidence_score": business_idea.get("confidence_score", 85),
            "market_size": business_idea.get("market_size", "Medium"),
            "development_complexity": development_complexity,
            
            # Features and technical
            "key_features": features,
            "technical_stack": tech_stack,
            
            # Diagram-related
            "diagrams_count": len(diagrams),
            "complexity_score": complexity_score,
            
            # Additional context
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "platform": "IdeaSpark v2.0"
        }
    
    def _convert_rendered_content(self, rendered_content: Dict[str, str], 
                                business_idea: Dict[str, Any],
                                diagrams: List[MermaidDiagram]) -> Dict[str, Any]:
        """Convert rendered template content to expected format"""
        
        # Extract title from rendered content or fallback
        title = business_idea.get("title", "새로운 비즈니스 아이디어")
        
        # Combine all rendered sections into executive summary
        executive_summary = rendered_content.get("executive_summary", "")
        if not executive_summary and "problem_statement" in rendered_content:
            executive_summary = rendered_content["problem_statement"]
        
        # Extract features (assuming they're in the rendered content)
        features = self._extract_detailed_features(business_idea, diagrams)
        
        # Extract timeline
        timeline = rendered_content.get("timeline", "3-6개월 예상")
        
        # Extract success metrics
        success_metrics = [
            f"사용자 확보: 월 1000명 목표",
            f"참여도: 주간 활성 사용자 70% 이상", 
            f"만족도: NPS 점수 50+ 달성",
            f"비즈니스: 6개월 내 수익 구조 검증",
            f"기술: 99.9% 가용성 및 2초 이내 응답 시간"
        ]
        
        # Technical requirements
        tech_reqs = {
            "frontend": {
                "framework": "Next.js 15 + TypeScript",
                "styling": "Tailwind CSS",
                "deployment": "Vercel"
            },
            "backend": {
                "framework": "FastAPI + Python",
                "database": "PostgreSQL (Supabase)",
                "hosting": "Vercel Serverless"
            }
        }
        
        return {
            "title": title,
            "executive_summary": executive_summary.strip(),
            "target_market": business_idea.get("target_market", "일반 사용자"),
            "features": features,
            "technical_requirements": tech_reqs,
            "timeline": timeline,
            "success_metrics": success_metrics,
            "full_rendered_content": rendered_content  # Include full template output
        }
    
    async def _generate_prd_content_basic(self, business_idea: Dict[str, Any], 
                                        diagrams: List[MermaidDiagram],
                                        technical_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback basic PRD content generation"""
        
        # Extract key information
        title = business_idea.get("title", "새로운 비즈니스 아이디어")
        description = business_idea.get("description", "")
        target_market = business_idea.get("target_market", "일반 사용자")
        
        # Generate executive summary
        executive_summary = f"""
{title}는 {target_market}을 대상으로 하는 혁신적인 솔루션입니다.

핵심 가치 제안:
- 실제 사용자 갈증포인트 기반 검증된 아이디어
- {business_idea.get('confidence_score', 80)}% 성공 확신도
- {len(diagrams)}개의 시각화된 시스템 설계도 포함

{description[:200]}{'...' if len(description) > 200 else ''}
"""
        
        # Generate features list
        features = self._extract_detailed_features(business_idea, diagrams)
        
        # Generate technical requirements
        tech_reqs = {
            "frontend": {
                "framework": "Next.js 15 + TypeScript",
                "styling": "Tailwind CSS",
                "deployment": "Vercel"
            },
            "backend": {
                "framework": "FastAPI + Python",
                "database": "PostgreSQL (Supabase)",
                "hosting": "Vercel Serverless"
            },
            "integrations": technical_requirements.get("integrations", []),
            "scalability": technical_requirements.get("scalability", "Medium (100-1000 users)")
        }
        
        # Generate timeline
        complexity_score = sum(d.complexity_score for d in diagrams) / len(diagrams) if diagrams else 3.0
        timeline = self._generate_development_timeline(complexity_score)
        
        # Generate success metrics
        success_metrics = [
            f"사용자 확보: {target_market} 세그먼트에서 월 1000명 목표",
            f"참여도: 주간 활성 사용자 70% 이상",
            f"만족도: NPS 점수 50+ 달성",
            f"비즈니스: 6개월 내 수익 구조 검증",
            f"기술: 99.9% 가용성 및 2초 이내 응답 시간"
        ]
        
        return {
            "title": title,
            "executive_summary": executive_summary.strip(),
            "target_market": target_market,
            "features": features,
            "technical_requirements": tech_reqs,
            "timeline": timeline,
            "success_metrics": success_metrics
        }
    
    def _extract_detailed_features(self, business_idea: Dict[str, Any], 
                                 diagrams: List[MermaidDiagram]) -> List[Dict[str, Any]]:
        """Extract detailed features from business idea and diagrams"""
        
        features = []
        
        # Core features from business idea
        core_features = [
            {
                "name": "사용자 인증 시스템",
                "description": "안전한 회원가입, 로그인 및 프로필 관리",
                "priority": "High",
                "effort": "Medium",
                "dependencies": []
            },
            {
                "name": "핵심 비즈니스 로직",
                "description": business_idea.get("description", "주요 기능 구현")[:100],
                "priority": "High", 
                "effort": "High",
                "dependencies": ["사용자 인증 시스템"]
            },
            {
                "name": "대시보드 및 분석",
                "description": "사용자 활동 및 비즈니스 메트릭 시각화",
                "priority": "Medium",
                "effort": "Medium",
                "dependencies": ["핵심 비즈니스 로직"]
            }
        ]
        
        # Add features inferred from diagrams
        for diagram in diagrams:
            if diagram.diagram_type == DiagramType.FLOWCHART:
                if "결제" in diagram.mermaid_code:
                    core_features.append({
                        "name": "결제 시스템",
                        "description": "안전한 온라인 결제 처리 및 구독 관리",
                        "priority": "High",
                        "effort": "High",
                        "dependencies": ["사용자 인증 시스템"]
                    })
        
        return core_features[:6]  # Limit to 6 features
    
    def _generate_development_timeline(self, complexity_score: float) -> str:
        """Generate development timeline based on complexity"""
        
        if complexity_score > 7.0:
            return """
Phase 1 (1-2개월): 기반 인프라 및 인증 시스템
Phase 2 (3-4개월): 핵심 비즈니스 로직 구현
Phase 3 (5-6개월): 고급 기능 및 최적화
Phase 4 (7-8개월): 테스트, 배포 및 모니터링
총 예상 기간: 8개월
"""
        elif complexity_score > 4.0:
            return """
Phase 1 (1개월): 프로젝트 설정 및 기본 인증
Phase 2 (2-3개월): 핵심 기능 개발
Phase 3 (4개월): 테스트 및 최적화
Phase 4 (5개월): 배포 및 론칭
총 예상 기간: 5개월
"""
        else:
            return """
Phase 1 (2주): 프로젝트 설정 및 기본 구조
Phase 2 (4-6주): 핵심 기능 개발
Phase 3 (2주): 테스트 및 버그 수정
Phase 4 (1주): 배포 및 론칭
총 예상 기간: 3개월
"""
    
    def _create_minimal_prd(self, business_idea: Dict[str, Any]) -> PRDDocument:
        """Create minimal PRD document on generation failure"""
        
        title = business_idea.get("title", "비즈니스 아이디어")
        
        return PRDDocument(
            id=f"minimal_prd_{int(time.time())}",
            title=f"{title} - 기본 PRD",
            business_idea_id=business_idea.get("id", "unknown"),
            executive_summary=f"{title}에 대한 기본 제품 요구사항 문서입니다.",
            target_market=business_idea.get("target_market", "일반 사용자"),
            features=[{
                "name": "기본 기능",
                "description": business_idea.get("description", "기본 기능 구현"),
                "priority": "High",
                "effort": "Medium",
                "dependencies": []
            }],
            technical_requirements={
                "frontend": {"framework": "Next.js"},
                "backend": {"framework": "FastAPI"}
            },
            diagrams=[],
            timeline="3-6개월 예상",
            success_metrics=["사용자 만족도 70% 이상"]
        )
    
    def get_generation_metrics(self) -> Dict[str, Any]:
        """Get PRD generation performance metrics"""
        
        success_rate = (self.successful_generations / self.total_generated * 100) if self.total_generated > 0 else 0
        
        return {
            "performance": {
                "total_generated": self.total_generated,
                "successful_generations": self.successful_generations,
                "success_rate": round(success_rate, 2),
                "average_generation_time": round(self.average_generation_time, 3)
            },
            "configuration": {
                "max_concurrent_diagrams": self.max_concurrent_diagrams,
                "total_generation_timeout": self.total_generation_timeout
            },
            "diagram_generator": {
                "supported_types": [dt.value for dt in DiagramType],
                "max_diagram_complexity": self.mermaid_generator.max_diagram_complexity
            },
            "template_system": self.template_manager.get_manager_statistics() if self._template_manager else {
                "status": "not_initialized"
            }
        }


# Global PRD generator instance
_prd_generator = None

def get_prd_generator() -> PRDGeneratorService:
    """Get global PRD generator instance"""
    global _prd_generator
    if _prd_generator is None:
        _prd_generator = PRDGeneratorService()
    return _prd_generator