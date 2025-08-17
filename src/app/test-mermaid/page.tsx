'use client';

import { useState } from 'react';
import MermaidDiagram from '@/components/prd/MermaidDiagram';
import { LinearCard, LinearButton } from '@/components/ui';

export default function TestMermaidPage() {
  const [selectedDiagram, setSelectedDiagram] = useState('flowchart');

  const diagrams = {
    flowchart: {
      title: '🔄 Simple Flowchart',
      code: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Do Something]
    B -->|No| D[Do Something Else]
    C --> E[End]
    D --> E`
    },
    erDiagram: {
      title: '🗄️ Entity Relationship',
      code: `erDiagram
    USER {
        uuid id PK
        string email
        string name
    }
    
    POST {
        uuid id PK
        uuid user_id FK
        string title
        text content
    }
    
    USER ||--o{ POST : creates`
    },
    graph: {
      title: '📊 Simple Graph',
      code: `graph LR
    A[Client] --> B[Gateway]
    B --> C[Service 1]
    B --> D[Service 2]
    C --> E[Database]
    D --> E`
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <LinearCard padding="lg" shadow="sm" className="mb-8">
          <h1 className="text-2xl font-bold mb-4">🧪 Mermaid Diagram Test</h1>
          <p className="text-gray-600 mb-6">
            Mermaid 다이어그램 렌더링을 테스트합니다. 
            각 다이어그램을 선택하여 렌더링이 제대로 되는지 확인하세요.
          </p>
          
          <div className="flex space-x-4 mb-8">
            {Object.keys(diagrams).map((key) => (
              <LinearButton
                key={key}
                variant={selectedDiagram === key ? 'primary' : 'outline'}
                onClick={() => setSelectedDiagram(key)}
              >
                {diagrams[key as keyof typeof diagrams].title}
              </LinearButton>
            ))}
          </div>
        </LinearCard>

        <MermaidDiagram
          code={diagrams[selectedDiagram as keyof typeof diagrams].code}
          title={diagrams[selectedDiagram as keyof typeof diagrams].title}
          description="테스트용 다이어그램입니다."
        />
        
        <LinearCard padding="lg" shadow="sm" className="mt-8">
          <h3 className="text-lg font-semibold mb-4">디버그 정보</h3>
          <div className="bg-gray-100 p-4 rounded text-sm">
            <p><strong>선택된 다이어그램:</strong> {selectedDiagram}</p>
            <p><strong>코드 길이:</strong> {diagrams[selectedDiagram as keyof typeof diagrams].code.length} 문자</p>
            <p><strong>브라우저 콘솔을 확인하세요:</strong> F12를 눌러 개발자 도구에서 Mermaid 로딩 로그를 확인할 수 있습니다.</p>
          </div>
        </LinearCard>
      </div>
    </div>
  );
}