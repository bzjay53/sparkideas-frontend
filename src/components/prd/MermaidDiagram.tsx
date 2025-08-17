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

  // Enhanced Mermaid renderer with CDN fallback
  useEffect(() => {
    let mounted = true;
    
    const loadMermaidFromCDN = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.mermaid) {
          resolve(window.mermaid);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.9.0/dist/mermaid.min.js';
        script.onload = () => {
          console.log('[Mermaid] CDN loaded successfully');
          resolve(window.mermaid);
        };
        script.onerror = () => {
          reject(new Error('Failed to load Mermaid from CDN'));
        };
        document.head.appendChild(script);
      });
    };
    
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
        
        // Try CDN first, then fallback to npm package
        let mermaid;
        try {
          mermaid = await loadMermaidFromCDN();
          console.log('[Mermaid] Using CDN version');
        } catch (cdnError) {
          console.log('[Mermaid] CDN failed, trying npm package...');
          try {
            const mermaidModule = await import('mermaid');
            mermaid = mermaidModule.default;
            console.log('[Mermaid] Using npm package version');
          } catch (importError) {
            console.error('[Mermaid] Both CDN and npm failed:', { cdnError, importError });
            throw new Error('Mermaid 라이브러리를 로드할 수 없습니다');
          }
        }

        // Initialize with simpler config
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            logLevel: 1, // Only errors
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true
            },
            sequence: {
              useMaxWidth: true
            },
            gantt: {
              useMaxWidth: true
            },
            er: {
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

        // Clear previous content and create container
        diagramRef.current.innerHTML = '';
        
        // Generate unique ID
        const id = `mermaid-${Date.now()}-${renderKey}`;
        console.log('[Mermaid] Rendering with ID:', id);
        
        // Create a temporary div for rendering
        const tempDiv = document.createElement('div');
        tempDiv.id = id;
        tempDiv.innerHTML = code;
        tempDiv.style.visibility = 'hidden';
        document.body.appendChild(tempDiv);
        
        try {
          // Use Mermaid's direct rendering
          await mermaid.run({
            nodes: [tempDiv]
          });
          
          console.log('[Mermaid] Rendering completed');
          
          if (mounted && diagramRef.current) {
            // Move the rendered content to our container
            const renderedSvg = tempDiv.querySelector('svg');
            if (renderedSvg) {
              // Clone and insert
              const clonedSvg = renderedSvg.cloneNode(true) as SVGElement;
              clonedSvg.removeAttribute('height');
              clonedSvg.style.width = '100%';
              clonedSvg.style.height = 'auto';
              clonedSvg.style.maxWidth = '100%';
              clonedSvg.style.display = 'block';
              clonedSvg.style.margin = '0 auto';
              
              diagramRef.current.appendChild(clonedSvg);
              console.log('[Mermaid] SVG inserted and styled');
              setIsLoading(false);
            } else {
              throw new Error('렌더링된 SVG를 찾을 수 없습니다');
            }
          }
        } catch (renderError) {
          console.error('[Mermaid] Rendering failed:', renderError);
          const errorMessage = renderError instanceof Error ? renderError.message : 'Unknown rendering error';
          throw new Error(`다이어그램 렌더링에 실패했습니다: ${errorMessage}`);
        } finally {
          // Clean up temp div
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
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