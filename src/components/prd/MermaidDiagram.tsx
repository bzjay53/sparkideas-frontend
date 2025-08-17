'use client';

import { useEffect, useRef, useState } from 'react';
import { LinearCard, LinearButton } from '@/components/ui';
import { 
  ClipboardDocumentIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

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

  // Simple and reliable Mermaid renderer
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
        
        // Import and initialize Mermaid
        const mermaid = (await import('mermaid')).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'system-ui, sans-serif',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          },
          sequence: {
            useMaxWidth: true
          },
          gantt: {
            useMaxWidth: true
          }
        });

        // Clear previous content
        diagramRef.current.innerHTML = '';
        
        // Generate unique ID
        const id = `mermaid-diagram-${Date.now()}-${renderKey}`;
        
        // Render diagram
        const { svg } = await mermaid.render(id, code);
        
        if (mounted && diagramRef.current) {
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
        }
      } catch (err) {
        if (mounted) {
          console.error('Mermaid render error:', err);
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setIsLoading(false);
        }
      }
    };

    // Add small delay to ensure DOM is ready
    const timer = setTimeout(renderMermaid, 200);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
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