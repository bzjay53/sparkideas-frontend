'use client';

import { LinearCard } from '@/components/ui';

interface StaticDiagramProps {
  type: 'flowchart' | 'erdiagram' | 'architecture';
  title?: string;
  description?: string;
  className?: string;
}

export default function StaticDiagram({ 
  type,
  title, 
  description, 
  className = '' 
}: StaticDiagramProps) {

  const renderFlowchart = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg">
      <div className="flex flex-col items-center space-y-6">
        {/* App Start */}
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg">
          앱 시작
        </div>
        
        <div className="w-px h-6 bg-gray-400"></div>
        
        {/* Login Check */}
        <div className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg">
          로그인 상태 확인
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-sm text-gray-600">로그인됨</div>
            <div className="w-6 h-px bg-gray-400"></div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
              홈 대시보드
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="text-sm text-gray-600">미로그인</div>
            <div className="w-6 h-px bg-gray-400"></div>
            <div className="bg-purple-500 text-white px-4 py-2 rounded shadow-lg">
              로그인/회원가입
            </div>
          </div>
        </div>
        
        <div className="w-px h-6 bg-gray-400"></div>
        
        {/* Main Features */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-indigo-500 text-white px-4 py-2 rounded text-center shadow-lg">
            AI 추천 보기
          </div>
          <div className="bg-indigo-500 text-white px-4 py-2 rounded text-center shadow-lg">
            상품 검색
          </div>
          <div className="bg-indigo-500 text-white px-4 py-2 rounded text-center shadow-lg">
            위시리스트
          </div>
        </div>
        
        <div className="w-px h-6 bg-gray-400"></div>
        
        {/* Product Detail */}
        <div className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg">
          상품 상세보기
        </div>
        
        <div className="w-px h-6 bg-gray-400"></div>
        
        {/* Actions */}
        <div className="flex space-x-6">
          <div className="bg-red-500 text-white px-4 py-2 rounded shadow-lg">
            장바구니 추가
          </div>
          <div className="bg-pink-500 text-white px-4 py-2 rounded shadow-lg">
            위시리스트 추가
          </div>
        </div>
      </div>
    </div>
  );

  const renderERDiagram = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {/* USER Table */}
        <div className="bg-white border-2 border-green-500 rounded-lg p-4 shadow-lg">
          <div className="bg-green-500 text-white px-3 py-1 rounded text-center font-bold mb-3">
            USER
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">id</span>
              <span className="text-yellow-600">PK</span>
            </div>
            <div>email</div>
            <div>username</div>
            <div>password_hash</div>
            <div>preferences</div>
            <div>created_at</div>
          </div>
        </div>
        
        {/* PRODUCT Table */}
        <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg">
          <div className="bg-blue-500 text-white px-3 py-1 rounded text-center font-bold mb-3">
            PRODUCT
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">id</span>
              <span className="text-yellow-600">PK</span>
            </div>
            <div>name</div>
            <div>description</div>
            <div>price</div>
            <div>category</div>
            <div>metadata</div>
          </div>
        </div>
        
        {/* RECOMMENDATION Table */}
        <div className="bg-white border-2 border-purple-500 rounded-lg p-4 shadow-lg">
          <div className="bg-purple-500 text-white px-3 py-1 rounded text-center font-bold mb-3">
            RECOMMENDATION
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">id</span>
              <span className="text-yellow-600">PK</span>
            </div>
            <div className="flex justify-between">
              <span>user_id</span>
              <span className="text-orange-600">FK</span>
            </div>
            <div className="flex justify-between">
              <span>product_id</span>
              <span className="text-orange-600">FK</span>
            </div>
            <div>confidence_score</div>
            <div>reason</div>
          </div>
        </div>
        
        {/* ORDER Table */}
        <div className="bg-white border-2 border-red-500 rounded-lg p-4 shadow-lg">
          <div className="bg-red-500 text-white px-3 py-1 rounded text-center font-bold mb-3">
            ORDER
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">id</span>
              <span className="text-yellow-600">PK</span>
            </div>
            <div className="flex justify-between">
              <span>user_id</span>
              <span className="text-orange-600">FK</span>
            </div>
            <div>total_amount</div>
            <div>status</div>
            <div>created_at</div>
          </div>
        </div>
        
        {/* WISHLIST Table */}
        <div className="bg-white border-2 border-pink-500 rounded-lg p-4 shadow-lg">
          <div className="bg-pink-500 text-white px-3 py-1 rounded text-center font-bold mb-3">
            WISHLIST
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">id</span>
              <span className="text-yellow-600">PK</span>
            </div>
            <div className="flex justify-between">
              <span>user_id</span>
              <span className="text-orange-600">FK</span>
            </div>
            <div className="flex justify-between">
              <span>product_id</span>
              <span className="text-orange-600">FK</span>
            </div>
            <div>added_at</div>
          </div>
        </div>
        
        {/* ORDER_ITEM Table */}
        <div className="bg-white border-2 border-indigo-500 rounded-lg p-4 shadow-lg">
          <div className="bg-indigo-500 text-white px-3 py-1 rounded text-center font-bold mb-3">
            ORDER_ITEM
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">id</span>
              <span className="text-yellow-600">PK</span>
            </div>
            <div className="flex justify-between">
              <span>order_id</span>
              <span className="text-orange-600">FK</span>
            </div>
            <div className="flex justify-between">
              <span>product_id</span>
              <span className="text-orange-600">FK</span>
            </div>
            <div>quantity</div>
            <div>unit_price</div>
          </div>
        </div>
      </div>
      
      {/* Relationships */}
      <div className="mt-8 p-4 bg-white bg-opacity-70 rounded-lg">
        <h4 className="font-bold text-gray-800 mb-3">관계 (Relationships)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>• USER → RECOMMENDATION (1:N)</div>
          <div>• USER → WISHLIST (1:N)</div>
          <div>• USER → ORDER (1:N)</div>
          <div>• PRODUCT → RECOMMENDATION (1:N)</div>
          <div>• PRODUCT → WISHLIST (1:N)</div>
          <div>• ORDER → ORDER_ITEM (1:N)</div>
        </div>
      </div>
    </div>
  );

  const renderArchitecture = () => (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-8 rounded-lg">
      <div className="space-y-8">
        {/* Mobile Apps Layer */}
        <div className="text-center">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Mobile Applications</h4>
          <div className="flex justify-center space-x-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
              iOS App
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
              Android App
            </div>
          </div>
        </div>
        
        {/* API Gateway */}
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gray-400"></div>
        </div>
        
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-lg shadow-lg inline-block">
            API Gateway
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gray-400"></div>
        </div>
        
        {/* Microservices Layer */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">Microservices</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-orange-500 text-white px-4 py-3 rounded-lg text-center shadow-lg">
              Auth Service
            </div>
            <div className="bg-blue-500 text-white px-4 py-3 rounded-lg text-center shadow-lg">
              Product Service
            </div>
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-center shadow-lg">
              AI Recommendation
            </div>
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg text-center shadow-lg">
              Order Service
            </div>
            <div className="bg-purple-500 text-white px-4 py-3 rounded-lg text-center shadow-lg">
              Notification
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gray-400"></div>
        </div>
        
        {/* Databases & External APIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">Databases</h4>
            <div className="space-y-3">
              <div className="bg-gray-600 text-white px-4 py-2 rounded-lg text-center shadow-lg">
                User DB (PostgreSQL)
              </div>
              <div className="bg-gray-600 text-white px-4 py-2 rounded-lg text-center shadow-lg">
                Product DB (PostgreSQL)
              </div>
              <div className="bg-gray-600 text-white px-4 py-2 rounded-lg text-center shadow-lg">
                ML Data Store
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">External APIs</h4>
            <div className="space-y-3">
              <div className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-center shadow-lg">
                Payment Gateway
              </div>
              <div className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-center shadow-lg">
                Email API
              </div>
              <div className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-center shadow-lg">
                Push Notification
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDiagram = () => {
    switch (type) {
      case 'flowchart':
        return renderFlowchart();
      case 'erdiagram':
        return renderERDiagram();
      case 'architecture':
        return renderArchitecture();
      default:
        return <div>Unknown diagram type</div>;
    }
  };

  const getMermaidCode = () => {
    switch (type) {
      case 'flowchart':
        return `flowchart TD
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
    M --> C`;

      case 'erdiagram':
        return `erDiagram
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
    ORDER ||--o{ ORDER_ITEM : contains`;

      case 'architecture':
        return `graph TB
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
    DataPipeline --> UserDB`;

      default:
        return '';
    }
  };

  return (
    <LinearCard className={`${className} bg-white border border-gray-200 shadow-sm mb-6`}>
      {title && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      
      <div className="p-6">
        {renderDiagram()}
      </div>

      {/* Mermaid Code for Obsidian */}
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            📋 옵시디언용 Mermaid 코드 (클릭하여 펼치기)
          </summary>
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">
              아래 코드를 복사하여 옵시디언에 붙여넣으면 다이어그램이 자동 렌더링됩니다:
            </p>
            <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto">
              <code>{`\`\`\`mermaid\n${getMermaidCode()}\n\`\`\``}</code>
            </pre>
            <button 
              onClick={() => navigator.clipboard?.writeText(`\`\`\`mermaid\n${getMermaidCode()}\n\`\`\``)}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              📋 클립보드에 복사
            </button>
          </div>
        </details>
      </div>
    </LinearCard>
  );
}