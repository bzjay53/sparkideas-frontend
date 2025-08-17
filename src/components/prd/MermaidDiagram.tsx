'use client';

import { useEffect, useRef, useState } from 'react';
import { LinearCard, LinearButton } from '@/components/ui';
import { 
  ClipboardDocumentIcon, 
  PhotoIcon, 
  ArrowsPointingOutIcon,
  ExclamationTriangleIcon
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Load Mermaid library
  useEffect(() => {
    const loadMermaid = async () => {
      try {
        setIsLoading(true);
        
        // Only run on client side
        if (typeof window === 'undefined') {
          return;
        }

        // Check if mermaid is already loaded
        if ((window as any).mermaid) {
          console.log('Mermaid already loaded');
          setMermaidLoaded(true);
          return;
        }

        console.log('Loading Mermaid...');
        
        // Dynamically import mermaid
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;
        
        console.log('Mermaid imported successfully', mermaid);
        
        // Store mermaid in window for reuse
        (window as any).mermaid = mermaid;
        
        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          themeVariables: {
            primaryColor: '#3B82F6',
            primaryTextColor: '#1F2937',
            primaryBorderColor: '#2563EB',
            lineColor: '#6B7280',
            secondaryColor: '#F3F4F6',
            tertiaryColor: '#F8FAFC'
          }
        });

        console.log('Mermaid initialized');
        setMermaidLoaded(true);
      } catch (err) {
        console.error('Failed to load Mermaid:', err);
        setError(`Mermaid 라이브러리 로드 실패: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    // Add delay to ensure DOM is ready
    const timer = setTimeout(loadMermaid, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Render diagram when mermaid is loaded
  useEffect(() => {
    if (!mermaidLoaded || !diagramRef.current || !code) {
      console.log('Skipping render:', { mermaidLoaded, hasRef: !!diagramRef.current, hasCode: !!code });
      return;
    }

    const renderDiagram = async () => {
      try {
        console.log('Starting diagram render...');
        setIsLoading(true);
        setError(null);

        const mermaid = (window as any).mermaid;
        if (!mermaid) {
          throw new Error('Mermaid not available');
        }
        
        // Clear previous content
        if (diagramRef.current) {
          diagramRef.current.innerHTML = '';
        }

        // Generate unique ID for this diagram
        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        console.log('Rendering with ID:', diagramId);
        console.log('Code:', code);
        
        try {
          // Try to parse first
          console.log('Parsing code...');
          const parseResult = await mermaid.parse(code);
          console.log('Parse result:', parseResult);
          
          if (!parseResult) {
            throw new Error('Invalid Mermaid syntax');
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          throw new Error(`Syntax error: ${parseError instanceof Error ? parseError.message : 'Invalid syntax'}`);
        }

        // Render the diagram
        console.log('Rendering diagram...');
        const renderResult = await mermaid.render(diagramId, code);
        console.log('Render result:', renderResult);
        
        if (diagramRef.current && renderResult.svg) {
          diagramRef.current.innerHTML = renderResult.svg;
          
          // Make diagram responsive
          const svgElement = diagramRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.removeAttribute('height');
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '100%';
          }
          
          console.log('Diagram rendered successfully');
        } else {
          throw new Error('No SVG content returned');
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    // Add small delay to ensure DOM is ready
    const timer = setTimeout(renderDiagram, 200);
    
    return () => clearTimeout(timer);
  }, [mermaidLoaded, code]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // Could add a toast notification here
      alert('Mermaid 코드가 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadAsImage = async () => {
    try {
      const svgElement = diagramRef.current?.querySelector('svg');
      if (!svgElement) return;

      // Create canvas and convert SVG to image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Download as PNG
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title || 'mermaid-diagram'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
        
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('이미지 다운로드에 실패했습니다.');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const FullscreenModal = () => {
    if (!isFullscreen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-6xl max-h-full overflow-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title || 'Mermaid Diagram'}</h3>
            <LinearButton variant="outline" size="sm" onClick={toggleFullscreen}>
              ✕ 닫기
            </LinearButton>
          </div>
          <div className="p-6">
            <div 
              className="text-center"
              dangerouslySetInnerHTML={{ 
                __html: diagramRef.current?.innerHTML || '' 
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <LinearCard padding="lg" shadow="sm" className={className}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <LinearButton
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              title="코드 복사"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
            </LinearButton>
            
            <LinearButton
              variant="outline"
              size="sm"
              onClick={downloadAsImage}
              title="이미지로 다운로드"
              disabled={isLoading || !!error}
            >
              <PhotoIcon className="w-4 h-4" />
            </LinearButton>
            
            <LinearButton
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title="전체화면"
              disabled={isLoading || !!error}
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </LinearButton>
          </div>
        </div>

        {/* Diagram Content */}
        <div className="relative">
          {isLoading && (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">다이어그램 렌더링 중...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
              <div className="text-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-red-600 mb-2">다이어그램 렌더링 실패</p>
                <p className="text-xs text-red-500">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div 
              ref={diagramRef}
              className="mermaid-container text-center bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto"
            />
          )}
        </div>

        {/* Code Block (Collapsible) */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            Mermaid 코드 보기
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        </details>
      </LinearCard>

      <FullscreenModal />
    </>
  );
}