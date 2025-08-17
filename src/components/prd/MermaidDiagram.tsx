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

  // Enhanced Mermaid renderer with better error handling
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
        
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          console.log('[Mermaid] Server-side rendering, skipping...');
          setIsLoading(false);
          return;
        }

        console.log('[Mermaid] Starting render process...');
        
        // Dynamic import with error handling
        let mermaid;
        try {
          const mermaidModule = await import('mermaid');
          mermaid = mermaidModule.default;
          console.log('[Mermaid] Library loaded successfully');
        } catch (importError) {
          console.error('[Mermaid] Failed to import library:', importError);
          throw new Error('Mermaid 라이브러리를 로드할 수 없습니다');
        }

        // Initialize with enhanced config
        try {
          await mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'system-ui, sans-serif',
            logLevel: 'error', // Reduce console noise
            suppressErrorRendering: true,
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis'
            },
            sequence: {
              useMaxWidth: true,
              wrap: true,
              width: 300
            },
            gantt: {
              useMaxWidth: true,
              leftPadding: 75
            },
            er: {
              useMaxWidth: true
            },
            graph: {
              useMaxWidth: true
            }
          });
          console.log('[Mermaid] Initialized successfully');
        } catch (initError) {
          console.error('[Mermaid] Initialization failed:', initError);
          throw new Error('Mermaid 초기화에 실패했습니다');
        }

        if (!mounted || !diagramRef.current) {
          console.log('[Mermaid] Component unmounted or ref lost');
          return;
        }

        // Clear previous content
        diagramRef.current.innerHTML = '';
        
        // Generate unique ID
        const id = `mermaid-diagram-${Date.now()}-${renderKey}`;
        console.log('[Mermaid] Rendering with ID:', id);
        
        // Validate diagram code first
        try {
          const parseResult = await mermaid.parse(code);
          console.log('[Mermaid] Code validation passed');
        } catch (parseError) {
          console.error('[Mermaid] Code validation failed:', parseError);
          throw new Error(`다이어그램 코드에 오류가 있습니다: ${parseError.message}`);
        }
        
        // Render diagram with timeout
        let svg;
        try {
          const renderPromise = mermaid.render(id, code);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('렌더링 시간 초과')), 10000)
          );
          
          const result = await Promise.race([renderPromise, timeoutPromise]);
          svg = result.svg;
          console.log('[Mermaid] Rendering completed, SVG length:', svg?.length || 0);
        } catch (renderError) {
          console.error('[Mermaid] Rendering failed:', renderError);
          throw new Error(`다이어그램 렌더링에 실패했습니다: ${renderError.message}`);
        }
        
        if (!svg) {
          throw new Error('빈 SVG가 생성되었습니다');
        }
        
        if (mounted && diagramRef.current) {
          // Insert SVG
          diagramRef.current.innerHTML = svg;
          console.log('[Mermaid] SVG inserted into DOM');
          
          // Make responsive
          const svgElement = diagramRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.removeAttribute('height');
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '100%';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
            console.log('[Mermaid] SVG made responsive');
          }
          
          setIsLoading(false);
          console.log('[Mermaid] Render process completed successfully');
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error('[Mermaid] Final error:', errorMessage);
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    // Add delay to ensure DOM is ready
    const timer = setTimeout(renderMermaid, 300);
    
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