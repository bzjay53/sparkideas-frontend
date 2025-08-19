'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LinearCard, LinearButton } from '@/components/ui';
import SimpleMermaidDiagram from '@/components/prd/SimpleMermaidDiagram';
import { ArrowLeftIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function PRDViewerPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold">PRD 상세보기</h1>
              </div>
              <div className="flex items-center space-x-2">
                <LinearButton 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 font-medium"
                >
                  <ShareIcon className="w-4 h-4 mr-1" />
                  <span className="text-gray-700">공유</span>
                </LinearButton>
                <LinearButton 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 font-medium"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  <span className="text-gray-700">다운로드</span>
                </LinearButton>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <LinearCard padding="lg">
            {/* Document Header */}
            <div className="border-b border-gray-200 pb-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    AI 기반 스마트 쇼핑 추천 앱
                  </h1>
                  <div className="text-sm text-gray-600">
                    <span>PRD ID: {params.id}</span>
                    <span className="mx-2">•</span>
                    <span>작성일: 2025. 8. 15.</span>
                    <span className="mx-2">•</span>
                    <span>신뢰도: 92%</span>
                    <span className="mx-2">•</span>
                    <span>템플릿: mobile_app_v1</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Approved
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Executive Summary</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
                <p className="text-gray-800 leading-relaxed">
                  AI 기반 스마트 쇼핑 추천 앱은 소비자를 대상으로 하는 혁신적인 솔루션입니다.
                  사용자들이 온라인 쇼핑에서 적합한 제품을 찾기 어려워하는 문제를 해결하기 위해 
                  개인화된 AI 추천 시스템을 제안합니다.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">92%</div>
                  <div className="text-sm text-gray-700">AI 분석 신뢰도</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">Medium</div>
                  <div className="text-sm text-gray-700">시장 규모</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">Medium</div>
                  <div className="text-sm text-gray-700">개발 복잡도</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">4개월</div>
                  <div className="text-sm text-gray-700">개발 기간</div>
                </div>
              </div>
            </section>

            {/* Target Market */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">타겟 시장</h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">주요 타겟</h3>
                  <div className="text-lg text-gray-700 mb-4">
                    온라인 쇼핑을 자주 이용하는 <strong>20-40대 소비자</strong>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600 mb-2">20-40대</div>
                      <div className="text-sm text-gray-600">핵심 연령층</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600 mb-2">온라인</div>
                      <div className="text-sm text-gray-600">쇼핑 채널</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-purple-600 mb-2">개인화</div>
                      <div className="text-sm text-gray-600">AI 추천</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Features */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">핵심 기능</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">사용자 인증 시스템</h3>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">High Priority</span>
                  </div>
                  <p className="text-gray-700 mb-2">안전한 회원가입, 로그인 및 프로필 관리</p>
                  <p className="text-sm text-gray-600"><strong>작업량:</strong> Medium</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">AI 추천 엔진</h3>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">High Priority</span>
                  </div>
                  <p className="text-gray-700 mb-2">개인화된 제품 추천 및 취향 분석</p>
                  <p className="text-sm text-gray-600"><strong>작업량:</strong> High | <strong>의존성:</strong> 사용자 인증 시스템</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">쇼핑 대시보드</h3>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Medium Priority</span>
                  </div>
                  <p className="text-gray-700 mb-2">추천 제품, 위시리스트, 구매 이력 관리</p>
                  <p className="text-sm text-gray-600"><strong>작업량:</strong> Medium | <strong>의존성:</strong> AI 추천 엔진</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">가격 알림 서비스</h3>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Medium Priority</span>
                  </div>
                  <p className="text-gray-700 mb-2">관심 제품의 가격 변동 실시간 알림</p>
                  <p className="text-sm text-gray-600"><strong>작업량:</strong> Low | <strong>의존성:</strong> 쇼핑 대시보드</p>
                </div>
              </div>
            </section>

            {/* User Journey Diagram */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">사용자 여정 플로우</h2>
              <SimpleMermaidDiagram 
                title="🔄 사용자 여정 플로우"
                description="앱 사용자의 주요 기능 흐름도 (복잡도: 4.2/10)"
                code={`flowchart TD
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
    M --> C`}
              />
            </section>
            
            {/* Database Schema */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">데이터베이스 스키마</h2>
              <SimpleMermaidDiagram 
                title="🗄️ 데이터베이스 스키마"
                description="앱의 주요 데이터 모델 관계도 (복잡도: 5.8/10)"
                code={`erDiagram
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
    ORDER ||--o{ ORDER_ITEM : contains`}
              />
            </section>
            
            {/* System Architecture */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">시스템 아키텍처</h2>
              <SimpleMermaidDiagram 
                title="🏗️ 시스템 아키텍처"
                description="마이크로서비스 기반 시스템 구조도 (복잡도: 7.3/10)"
                code={`graph TB
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
    DataPipeline --> UserDB`}
              />
            </section>

            {/* Technical Requirements */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">기술 요구사항</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Frontend</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Framework:</strong> React Native + TypeScript</li>
                    <li><strong>Styling:</strong> NativeWind (Tailwind for React Native)</li>
                    <li><strong>Deployment:</strong> App Store & Google Play Store</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Backend</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Framework:</strong> FastAPI + Python</li>
                    <li><strong>Database:</strong> PostgreSQL (Supabase)</li>
                    <li><strong>Hosting:</strong> Vercel Serverless</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4">AI/ML</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Framework:</strong> TensorFlow + Scikit-learn</li>
                    <li><strong>API:</strong> OpenAI GPT-4 for NLP</li>
                    <li><strong>Deployment:</strong> Cloud ML Platform</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Development Schedule */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">개발 일정</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 bg-blue-50 p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Phase 1 (4주): 기본 앱 구조 및 인증</h3>
                  <ul className="space-y-1 text-gray-700">
                    <li>• React Native 프로젝트 설정</li>
                    <li>• 사용자 인증 시스템 구축</li>
                    <li>• 기본 UI/UX 디자인</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-green-500 bg-green-50 p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Phase 2 (6주): AI 추천 시스템</h3>
                  <ul className="space-y-1 text-gray-700">
                    <li>• 머신러닝 모델 개발</li>
                    <li>• 상품 데이터 파이프라인 구축</li>
                    <li>• 추천 알고리즘 구현</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-purple-500 bg-purple-50 p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Phase 3 (4주): 쇼핑 기능 통합</h3>
                  <ul className="space-y-1 text-gray-700">
                    <li>• 대시보드 개발</li>
                    <li>• 위시리스트 기능</li>
                    <li>• 가격 알림 시스템</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-orange-500 bg-orange-50 p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Phase 4 (2주): 테스트 및 배포</h3>
                  <ul className="space-y-1 text-gray-700">
                    <li>• 베타 테스트 및 버그 수정</li>
                    <li>• 앱 스토어 배포</li>
                    <li>• 마케팅 활동 시작</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Success Metrics */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">성공 지표</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10,000명</div>
                  <div className="font-medium text-gray-900">월간 활성 사용자</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">4.5+</div>
                  <div className="font-medium text-gray-900">앱 스토어 평점</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                  <div className="font-medium text-gray-900">추천 정확도</div>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">60%</div>
                  <div className="font-medium text-gray-900">사용자 리텐션</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">$50K</div>
                  <div className="font-medium text-gray-900">월 매출 목표</div>
                </div>
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">$75K</div>
                  <div className="font-medium text-gray-900">예상 투자</div>
                </div>
              </div>
            </section>
          </LinearCard>
        </div>
      </div>
  );
}