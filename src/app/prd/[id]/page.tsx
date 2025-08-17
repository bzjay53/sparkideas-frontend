'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LinearCard, LinearButton } from '@/components/ui';
import { 
  ArrowLeftIcon, 
  ShareIcon, 
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import PRDViewer from '@/components/prd/PRDViewer';
import MermaidDiagram from '@/components/prd/MermaidDiagram';

export default function PRDDetailPage() {
  const params = useParams();
  const prdId = params.id as string;
  
  const [prd, setPrd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  // Mock PRD data
  useEffect(() => {
    const mockPrd = {
      id: prdId,
      title: 'AI 기반 스마트 쇼핑 추천 앱',
      business_idea_id: 'idea_123',
      created_at: '2025-08-15T10:30:00Z',
      status: 'completed',
      template_type: 'mobile_app',
      template_used: 'mobile_app_v1',
      estimated_dev_time: '3-6개월 (표준 웹 애플리케이션)',
      confidence_score: 92,
      
      executive_summary: `
# 📱 AI 기반 스마트 쇼핑 추천 앱 - Product Requirements Document

## 📊 Executive Summary

AI 기반 스마트 쇼핑 추천 앱은 소비자를 대상으로 하는 혁신적인 솔루션입니다.

### 핵심 가치 제안
- 🎯 **검증된 갈증포인트 기반**: 실제 사용자 니즈에서 도출된 아이디어
- 🤖 **AI 분석 신뢰도**: 92% 검증 완료
- 📈 **시장 규모**: Medium 규모의 시장 기회
- ⚡ **개발 복잡도**: Medium 수준의 구현 난이도

사용자들이 온라인 쇼핑에서 적합한 제품을 찾기 어려워하는 문제를 해결하기 위해 개인화된 AI 추천 시스템을 제안합니다.

이 문제를 해결하기 위해 AI 기반 스마트 쇼핑 추천 앱을 제안합니다.
      `,
      
      target_market: '온라인 쇼핑을 자주 이용하는 20-40대 소비자',
      
      features: [
        {
          name: '사용자 인증 시스템',
          description: '안전한 회원가입, 로그인 및 프로필 관리',
          priority: 'High',
          effort: 'Medium',
          dependencies: []
        },
        {
          name: 'AI 추천 엔진',
          description: '개인화된 제품 추천 및 취향 분석',
          priority: 'High',
          effort: 'High', 
          dependencies: ['사용자 인증 시스템']
        },
        {
          name: '쇼핑 대시보드',
          description: '추천 제품, 위시리스트, 구매 이력 관리',
          priority: 'Medium',
          effort: 'Medium',
          dependencies: ['AI 추천 엔진']
        },
        {
          name: '가격 알림 서비스',
          description: '관심 제품의 가격 변동 실시간 알림',
          priority: 'Medium',
          effort: 'Low',
          dependencies: ['쇼핑 대시보드']
        }
      ],
      
      technical_requirements: {
        frontend: {
          framework: 'React Native + TypeScript',
          styling: 'NativeWind (Tailwind for React Native)',
          deployment: 'App Store & Google Play Store'
        },
        backend: {
          framework: 'FastAPI + Python',
          database: 'PostgreSQL (Supabase)',
          hosting: 'Vercel Serverless'
        },
        ai_ml: {
          framework: 'TensorFlow + Scikit-learn',
          api: 'OpenAI GPT-4 for NLP',
          deployment: 'Cloud ML Platform'
        }
      },
      
      success_metrics: [
        '월간 활성 사용자 10,000명 목표',
        '앱 스토어 평점 4.5+ 달성',
        '추천 정확도 85% 이상',
        '사용자 리텐션 60% 이상',
        '월 매출 $50,000 달성'
      ],
      
      timeline: `
Phase 1 (4주): 기본 앱 구조 및 인증
- React Native 프로젝트 설정
- 사용자 인증 시스템 구축
- 기본 UI/UX 디자인

Phase 2 (6주): AI 추천 시스템
- 머신러닝 모델 개발
- 상품 데이터 파이프라인 구축
- 추천 알고리즘 구현

Phase 3 (4주): 쇼핑 기능 통합
- 대시보드 개발
- 위시리스트 기능
- 가격 알림 시스템

Phase 4 (2주): 테스트 및 배포
- 베타 테스트 및 버그 수정
- 앱 스토어 배포
- 마케팅 활동 시작

총 예상 기간: 16주 (약 4개월)
예상 투자: $75,000
      `,
      
      diagrams: [
        {
          type: 'flowchart',
          title: '🔄 사용자 여정 플로우',
          description: '앱 사용자의 주요 기능 흐름도',
          mermaid_code: `flowchart TD
    A[앱 시작] --> B{로그인 상태}
    B -->|로그인됨| C[홈 대시보드]
    B -->|미로그인| D[로그인/회원가입]
    D --> C
    C --> E[AI 추천 보기]
    C --> F[상품 검색]
    C --> G[위시리스트]
    E --> H[상품 상세보기]
    F --> H
    G --> H
    H --> I[장바구니 추가]
    H --> J[위시리스트 추가]
    I --> K[결제 진행]
    J --> G
    K --> L[주문 완료]
    L --> M[리뷰 작성]
    M --> C`,
          complexity_score: 4.2
        },
        {
          type: 'erDiagram',
          title: '🗄️ 데이터베이스 스키마',
          description: '앱의 주요 데이터 모델 관계도',
          mermaid_code: `erDiagram
    USER {
        uuid id PK
        string email
        string username
        string password_hash
        jsonb preferences
        datetime created_at
        datetime updated_at
    }
    
    PRODUCT {
        uuid id PK
        string name
        text description
        decimal price
        string category
        jsonb metadata
        datetime created_at
        datetime updated_at
    }
    
    RECOMMENDATION {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        float confidence_score
        string reason
        datetime recommended_at
    }
    
    WISHLIST {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        datetime added_at
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
    
    USER ||--o{ RECOMMENDATION : receives
    USER ||--o{ WISHLIST : creates
    USER ||--o{ ORDER : places
    PRODUCT ||--o{ RECOMMENDATION : recommended
    PRODUCT ||--o{ WISHLIST : added_to
    PRODUCT ||--o{ ORDER_ITEM : included_in
    ORDER ||--o{ ORDER_ITEM : contains`,
          complexity_score: 5.8
        },
        {
          type: 'graph',
          title: '🏗️ 시스템 아키텍처',
          description: '마이크로서비스 기반 시스템 구조도',
          mermaid_code: `graph TB
    subgraph "Mobile Apps"
        iOS[iOS App]
        Android[Android App]
    end
    
    subgraph "API Gateway"
        Gateway[API Gateway]
    end
    
    subgraph "Microservices"
        Auth[Auth Service]
        Product[Product Service]
        Recommendation[AI Recommendation Service]
        Order[Order Service]
        Notification[Notification Service]
    end
    
    subgraph "AI/ML Platform"
        MLModel[ML Models]
        DataPipeline[Data Pipeline]
        FeatureStore[Feature Store]
    end
    
    subgraph "Databases"
        UserDB[(User DB)]
        ProductDB[(Product DB)]
        OrderDB[(Order DB)]
        MLData[(ML Data Store)]
    end
    
    subgraph "External APIs"
        PaymentGW[Payment Gateway]
        EmailAPI[Email API]
        PushAPI[Push Notification API]
        ProductAPI[Product Data APIs]
    end
    
    iOS --> Gateway
    Android --> Gateway
    Gateway --> Auth
    Gateway --> Product
    Gateway --> Recommendation
    Gateway --> Order
    Gateway --> Notification
    
    Auth --> UserDB
    Product --> ProductDB
    Product --> ProductAPI
    Order --> OrderDB
    Order --> PaymentGW
    Notification --> EmailAPI
    Notification --> PushAPI
    
    Recommendation --> MLModel
    MLModel --> FeatureStore
    DataPipeline --> MLData
    DataPipeline --> ProductDB
    DataPipeline --> UserDB`,
          complexity_score: 7.3
        }
      ]
    };

    setTimeout(() => {
      setPrd(mockPrd);
      setLoading(false);
    }, 1000);
  }, [prdId]);

  const handleExport = (format: string) => {
    // TODO: Implement actual export functionality
    alert(`${format.toUpperCase()} 다운로드 기능이 곧 제공됩니다!`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 클립보드에 복사되었습니다!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">PRD를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!prd) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LinearCard padding="lg" className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">PRD를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 PRD 문서가 존재하지 않거나 삭제되었습니다.</p>
          <LinearButton onClick={() => window.location.href = '/prd'}>
            PRD 목록으로 돌아가기
          </LinearButton>
        </LinearCard>
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: '📄 문서 내용', icon: EyeIcon },
    { id: 'diagrams', label: '📊 다이어그램', icon: CodeBracketIcon },
    { id: 'export', label: '💾 내보내기', icon: ArrowDownTrayIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <LinearButton
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/prd'}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                목록으로
              </LinearButton>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {prd.title}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    ID: {prd.id}
                  </span>
                  <span className="text-sm text-gray-500">
                    생성일: {new Date(prd.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <span className="text-sm text-gray-500">
                    템플릿: {prd.template_used}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    신뢰도: {prd.confidence_score}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <LinearButton variant="outline" size="sm" onClick={handleShare}>
                <ShareIcon className="w-4 h-4 mr-2" />
                공유
              </LinearButton>
              
              <LinearButton variant="outline" size="sm">
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                복제
              </LinearButton>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <LinearCard padding="none" shadow="sm">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </LinearCard>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && (
          <PRDViewer prd={prd} />
        )}

        {activeTab === 'diagrams' && (
          <div className="space-y-8">
            <LinearCard padding="lg" shadow="sm">
              <h2 className="text-xl font-semibold mb-4">📊 시스템 다이어그램</h2>
              <p className="text-gray-600 mb-6">
                총 {prd.diagrams.length}개의 Mermaid 다이어그램이 생성되었습니다.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {prd.diagrams.map((diagram: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-2">{diagram.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{diagram.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>복잡도: {diagram.complexity_score}/10</span>
                      <span>{diagram.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </LinearCard>

            {prd.diagrams.map((diagram: any, index: number) => (
              <LinearCard key={index} padding="lg" shadow="sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{diagram.title}</h3>
                  <p className="text-gray-600 text-sm">{diagram.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>타입: {diagram.type}</span>
                    <span>복잡도: {diagram.complexity_score}/10</span>
                  </div>
                </div>
                
                <MermaidDiagram 
                  code={diagram.mermaid_code}
                  title={diagram.title}
                />
              </LinearCard>
            ))}
          </div>
        )}

        {activeTab === 'export' && (
          <LinearCard padding="lg" shadow="sm">
            <h2 className="text-xl font-semibold mb-4">💾 문서 내보내기</h2>
            <p className="text-gray-600 mb-8">
              PRD 문서를 다양한 포맷으로 다운로드할 수 있습니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PDF Export */}
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium mb-2">PDF 문서</h3>
                <p className="text-sm text-gray-600 mb-4">
                  전문적인 PDF 문서로 다운로드합니다. 인쇄 및 공유에 적합합니다.
                </p>
                <div className="space-y-2 mb-4 text-xs text-gray-500">
                  <div>✓ 커버 페이지 포함</div>
                  <div>✓ 목차 자동 생성</div>
                  <div>✓ Mermaid 다이어그램 포함</div>
                </div>
                <LinearButton 
                  variant="primary" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleExport('pdf')}
                >
                  PDF 다운로드
                </LinearButton>
              </div>

              {/* Markdown Export */}
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">Markdown</h3>
                <p className="text-sm text-gray-600 mb-4">
                  GitHub 호환 마크다운 파일로 다운로드합니다. 개발자 친화적입니다.
                </p>
                <div className="space-y-2 mb-4 text-xs text-gray-500">
                  <div>✓ GitHub 호환</div>
                  <div>✓ Mermaid 코드 블록</div>
                  <div>✓ 링크 및 테이블 지원</div>
                </div>
                <LinearButton 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleExport('markdown')}
                >
                  Markdown 다운로드
                </LinearButton>
              </div>

              {/* HTML Export */}
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-lg font-medium mb-2">HTML 문서</h3>
                <p className="text-sm text-gray-600 mb-4">
                  인터랙티브 HTML 파일로 다운로드합니다. 웹에서 바로 볼 수 있습니다.
                </p>
                <div className="space-y-2 mb-4 text-xs text-gray-500">
                  <div>✓ 반응형 디자인</div>
                  <div>✓ 인터랙티브 다이어그램</div>
                  <div>✓ 검색 및 네비게이션</div>
                </div>
                <LinearButton 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleExport('html')}
                >
                  HTML 다운로드
                </LinearButton>
              </div>
            </div>

            {/* Export Options */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">내보내기 옵션</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">다이어그램 포함</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">커버 페이지 포함 (PDF만)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">목차 포함</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">워터마크 제거</span>
                </label>
              </div>
            </div>
          </LinearCard>
        )}
      </div>
    </div>
  );
}