'use client';

import { useEffect, useRef, useState } from 'react';

export default function TestMermaidPage() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testCode = `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Fix it]
    D --> A`;

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Loading Mermaid...');
        
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          console.log('Server-side rendering, skipping...');
          return;
        }
        
        const mermaid = (await import('mermaid')).default;
        
        console.log('Mermaid loaded:', !!mermaid);
        console.log('Mermaid version:', mermaid.version || 'unknown');
        
        console.log('Initializing Mermaid...');
        await mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'system-ui, sans-serif',
          logLevel: 'debug',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        });
        
        if (!diagramRef.current) {
          console.log('No diagram ref available');
          return;
        }
        
        console.log('Clearing previous content...');
        diagramRef.current.innerHTML = '';
        
        console.log('Rendering diagram with code:', testCode);
        const id = `test-diagram-${Date.now()}`;
        
        // Try parsing first
        const parseResult = await mermaid.parse(testCode);
        console.log('Parse result:', parseResult);
        
        const { svg } = await mermaid.render(id, testCode);
        
        console.log('SVG generated:', svg ? 'yes' : 'no');
        console.log('SVG length:', svg?.length || 0);
        console.log('SVG preview:', svg?.substring(0, 200) + '...');
        
        if (svg && diagramRef.current) {
          diagramRef.current.innerHTML = svg;
          console.log('SVG inserted into DOM');
          
          // Make responsive
          const svgElement = diagramRef.current.querySelector('svg');
          if (svgElement) {
            console.log('Making SVG responsive...');
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
          }
        }
        
        setIsLoading(false);
        console.log('Rendering completed successfully');
        
      } catch (err) {
        console.error('Mermaid test error:', err);
        console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    // Add delay to ensure DOM is ready
    const timer = setTimeout(renderMermaid, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mermaid Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Diagram</h2>
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          )}
          
          {error && (
            <div className="text-red-600 p-4 bg-red-50 rounded">
              Error: {error}
            </div>
          )}
          
          <div 
            ref={diagramRef} 
            className="min-h-[200px] border border-gray-200 rounded p-4"
          />
          
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Mermaid Code:</h3>
            <pre className="text-sm text-gray-600">{testCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}