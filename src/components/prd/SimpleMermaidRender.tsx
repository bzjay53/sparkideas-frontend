'use client';

import { useEffect, useRef } from 'react';
import { LinearCard } from '@/components/ui';

interface SimpleMermaidRenderProps {
  code: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function SimpleMermaidRender({ 
  code, 
  title, 
  description, 
  className = '' 
}: SimpleMermaidRenderProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 브라우저에서만 실행
    if (typeof window !== 'undefined' && mermaidRef.current) {
      // Mermaid가 이미 로드되었는지 확인
      if (window.mermaid) {
        // 기존 내용 제거
        mermaidRef.current.innerHTML = '';
        
        // Mermaid 코드를 직접 텍스트로 삽입 (옵시디언 방식)
        mermaidRef.current.textContent = code;
        mermaidRef.current.className = 'mermaid';
        
        // Mermaid 재초기화 및 렌더링
        window.mermaid.init(undefined, mermaidRef.current);
      } else {
        // Mermaid 로드 대기
        const checkMermaid = setInterval(() => {
          if (window.mermaid && mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
            mermaidRef.current.textContent = code;
            mermaidRef.current.className = 'mermaid';
            window.mermaid.init(undefined, mermaidRef.current);
            clearInterval(checkMermaid);
          }
        }, 100);

        // 10초 후 정리
        setTimeout(() => clearInterval(checkMermaid), 10000);
      }
    }
  }, [code]);

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
        <div 
          ref={mermaidRef}
          className="text-center"
          style={{ minHeight: '200px' }}
        />
      </div>
    </LinearCard>
  );
}

declare global {
  interface Window {
    mermaid: any;
  }
}