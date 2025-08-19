'use client';

import { useEffect, useRef, useState } from 'react';
import { LinearCard, LinearButton } from '@/components/ui';

interface SimpleMermaidDiagramProps {
  code: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function SimpleMermaidDiagram({ 
  code, 
  title, 
  description, 
  className = '' 
}: SimpleMermaidDiagramProps) {
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
        // Import mermaid
        const mermaid = (await import('mermaid')).default;
        
        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose'
        });

        if (!mounted) return;

        // Clear previous content
        const element = elementRef.current;
        element.innerHTML = '';

        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Render diagram
        const { svg } = await mermaid.render(id, code);

        if (mounted && element) {
          element.innerHTML = svg;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      mounted = false;
    };
  }, [code]);

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
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <p className="text-xs text-gray-500">Mermaid 다이어그램을 렌더링할 수 없습니다.</p>
            </div>
          </div>
        )}
        
        {!isLoading && !error && (
          <div 
            ref={elementRef}
            className="mermaid-container overflow-x-auto"
            style={{ minHeight: '200px' }}
          />
        )}
      </div>
    </LinearCard>
  );
}