'use client';

import { useEffect, useRef, useState } from 'react';
import { LinearCard, LinearButton } from '@/components/ui';
import { 
  ClipboardDocumentIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Extend window object for Mermaid
declare global {
  interface Window {
    mermaid: any;
  }
}

interface MermaidDiagramProps {
  code: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function MermaidDiagram({ 
  code, 
  title, 
  description, 
  className = '' 
}: MermaidDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  // Simplified Mermaid renderer
  useEffect(() => {
    let mounted = true;
    
    const renderMermaid = async () => {
      if (!diagramRef.current || !code.trim()) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Client-side only check
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        // Simple dynamic import
        let mermaid: any;
        try {
          const mermaidModule = await import('mermaid');
          mermaid = mermaidModule.default;
        } catch (importError) {
          throw new Error('Mermaid 라이브러리를 로드할 수 없습니다.');
        }

        // Simple initialization
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        });

        if (!mounted || !diagramRef.current) {
          return;
        }

        // Clear previous content
        diagramRef.current.innerHTML = '';
        
        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, code);
        
        if (mounted && diagramRef.current && svg) {
          diagramRef.current.innerHTML = svg;
          
          // Make responsive
          const svgElement = diagramRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.removeAttribute('height');
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '100%';
          }
          
          setIsLoading(false);
        } else {
          throw new Error('다이어그램을 렌더링할 수 없습니다.');
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    // Start rendering
    renderMermaid();
    
    return () => {
      mounted = false;
    };
  }, [code, renderKey]);

  const handleRetry = () => {
    setRenderKey(prev => prev + 1);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <LinearCard className={`${className} bg-white border border-gray-200 shadow-sm`}>
      {title && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500">다이어그램 렌더링 중...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <LinearButton 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="mr-2"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                다시 시도
              </LinearButton>
            </div>
          </div>
        )}
        
        {!isLoading && !error && (
          <>
            <div 
              ref={diagramRef} 
              className="mermaid-container overflow-x-auto"
              style={{ minHeight: '200px' }}
            />
            
            <div className="mt-4 flex justify-end">
              <LinearButton 
                variant="outline" 
                size="sm" 
                onClick={handleCopyCode}
              >
                <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                코드 복사
              </LinearButton>
            </div>
          </>
        )}
      </div>
    </LinearCard>
  );
}