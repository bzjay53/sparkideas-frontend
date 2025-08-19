'use client';

import { useEffect, useRef, useState } from 'react';
import { LinearCard } from '@/components/ui';

interface CDNMermaidDiagramProps {
  code: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function CDNMermaidDiagram({ 
  code, 
  title, 
  description, 
  className = '' 
}: CDNMermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const renderDiagram = async () => {
      if (!elementRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // Wait for mermaid to be available
        let attempts = 0;
        while (typeof window !== 'undefined' && !window.mermaid && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (typeof window === 'undefined' || !window.mermaid) {
          throw new Error('Mermaid library not loaded');
        }

        const mermaid = window.mermaid;
        
        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'system-ui, sans-serif'
        });

        if (!mounted || !elementRef.current) return;

        const element = elementRef.current;
        element.innerHTML = '';

        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        try {
          // Render diagram using CDN mermaid
          const { svg } = await mermaid.render(id, code);

          if (mounted && element) {
            element.innerHTML = svg;
            setIsLoading(false);
          }
        } catch (renderError) {
          console.error('Mermaid render error:', renderError);
          throw renderError;
        }

      } catch (err) {
        console.error('Mermaid setup error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setIsLoading(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(renderDiagram, 500);

    return () => {
      clearTimeout(timer);
      mounted = false;
    };
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
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500">다이어그램을 생성하고 있습니다...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <p className="text-xs text-gray-500">다이어그램을 렌더링할 수 없습니다.</p>
            </div>
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="text-center">
            <div 
              ref={elementRef}
              className="mermaid-container inline-block"
              style={{ minHeight: '300px', width: '100%' }}
            />
          </div>
        )}
      </div>
    </LinearCard>
  );
}