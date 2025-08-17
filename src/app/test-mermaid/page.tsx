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
        const mermaid = (await import('mermaid')).default;
        
        console.log('Initializing Mermaid...');
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        });
        
        if (!diagramRef.current) return;
        
        console.log('Rendering diagram...');
        const id = `test-diagram-${Date.now()}`;
        const { svg } = await mermaid.render(id, testCode);
        
        console.log('SVG result:', svg.substring(0, 100) + '...');
        
        diagramRef.current.innerHTML = svg;
        setIsLoading(false);
        
      } catch (err) {
        console.error('Mermaid test error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    renderMermaid();
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