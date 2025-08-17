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

  // Optimized Mermaid renderer for Vercel deployment (Context7 best practices)
  useEffect(() => {
    let mounted = true;
    
    const loadMermaidFromCDN = () => {
      return new Promise<any>((resolve, reject) => {
        // Check if already loaded
        if (window.mermaid) {
          console.log('[Mermaid] Already loaded from cache');
          resolve(window.mermaid as any);
          return;
        }

        // Load from Vercel-optimized CDN (Context7 recommendation)
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
        script.type = 'module';
        script.onload = () => {
          console.log('[Mermaid] CDN ES module loaded successfully');
          resolve(window.mermaid as any);
        };
        script.onerror = () => {
          console.warn('[Mermaid] ES module failed, trying UMD fallback...');
          // Fallback to UMD version
          const fallbackScript = document.createElement('script');
          fallbackScript.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.9.0/dist/mermaid.min.js';
          fallbackScript.onload = () => {
            console.log('[Mermaid] UMD fallback loaded successfully');
            resolve(window.mermaid as any);
          };
          fallbackScript.onerror = () => {
            reject(new Error('Failed to load Mermaid from CDN'));
          };
          document.head.appendChild(fallbackScript);
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
        
        // Ensure client-side only (Vercel static export best practice)
        if (typeof window === 'undefined') {
          console.log('[Mermaid] Server-side rendering detected, deferring to client...');
          setIsLoading(false);
          return;
        }

        console.log('[Mermaid] Starting client-side render process...');
        
        // Use CDN for Vercel compatibility (Context7 recommendation)
        let mermaid: any;
        try {
          mermaid = await loadMermaidFromCDN() as any;
          console.log('[Mermaid] CDN version loaded successfully');
        } catch (cdnError) {
          console.log('[Mermaid] CDN failed, attempting dynamic import fallback...');
          try {
            const mermaidModule = await import('mermaid');
            mermaid = mermaidModule.default as any;
            console.log('[Mermaid] Dynamic import fallback successful');
          } catch (importError) {
            console.error('[Mermaid] All loading methods failed:', { cdnError, importError });
            throw new Error('Mermaid 라이브러리를 로드할 수 없습니다. 네트워크 연결을 확인해주세요.');
          }
        }

        // Initialize with Vercel-optimized config (Context7 best practices)
        try {
          (mermaid as any).initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose', // Required for Vercel deployment
            logLevel: 1, // Minimal logging for production
            deterministicIds: true, // For consistent SSG
            fontFamily: '"Inter", "system-ui", sans-serif',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis'
            },
            sequence: {
              useMaxWidth: true,
              diagramMarginX: 50,
              diagramMarginY: 10
            },
            gantt: {
              useMaxWidth: true
            },
            er: {
              useMaxWidth: true
            },
            pie: {
              useMaxWidth: true
            }
          });
          console.log('[Mermaid] Initialized with Vercel-optimized config');
        } catch (initError) {
          console.error('[Mermaid] Initialization failed:', initError);
          throw new Error('Mermaid 초기화에 실패했습니다');
        }

        if (!mounted || !diagramRef.current) {
          console.log('[Mermaid] Component unmounted during initialization');
          return;
        }

        // Clear previous content
        diagramRef.current.innerHTML = '';
        
        // Generate deterministic ID for SSG compatibility
        const id = `mermaid-diagram-${renderKey}-${Date.now()}`;
        console.log('[Mermaid] Rendering diagram with ID:', id);
        
        try {
          // Use modern mermaid.render() API (Context7 best practice)
          const { svg } = await (mermaid as any).render(id, code);
          
          if (mounted && diagramRef.current && svg) {
            // Create wrapper div for better styling control
            const wrapper = document.createElement('div');
            wrapper.className = 'mermaid-wrapper';
            wrapper.innerHTML = svg;
            
            // Apply Vercel-optimized styling
            const svgElement = wrapper.querySelector('svg');
            if (svgElement) {
              svgElement.removeAttribute('height');
              svgElement.removeAttribute('width');
              svgElement.style.width = '100%';
              svgElement.style.height = 'auto';
              svgElement.style.maxWidth = '100%';
              svgElement.style.display = 'block';
              svgElement.style.margin = '0 auto';
              
              // Add responsive scaling for mobile
              svgElement.style.maxHeight = '80vh';
              svgElement.style.objectFit = 'contain';
            }
            
            diagramRef.current.appendChild(wrapper);
            console.log('[Mermaid] SVG rendered and styled successfully');
            setIsLoading(false);
          } else {
            throw new Error('SVG 렌더링 결과가 비어있습니다');
          }
        } catch (renderError) {
          console.error('[Mermaid] Rendering failed:', renderError);
          const errorMessage = renderError instanceof Error ? renderError.message : 'Unknown rendering error';
          throw new Error(`다이어그램 렌더링에 실패했습니다: ${errorMessage}`);
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

    // Optimize rendering timing for Vercel
    const timer = setTimeout(renderMermaid, 100);
    
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