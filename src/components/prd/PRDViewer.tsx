'use client';

import { useState } from 'react';
import { LinearCard } from '@/components/ui';
import MermaidDiagram from './MermaidDiagram';
import { 
  ClockIcon, 
  UserGroupIcon, 
  CpuChipIcon, 
  ChartBarIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface PRDViewerProps {
  prd: any;
}

export default function PRDViewer({ prd }: PRDViewerProps) {
  const [expandedSections, setExpandedSections] = useState(new Set(['summary']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const Section = ({ 
    id, 
    title, 
    icon: Icon, 
    children, 
    defaultExpanded = false 
  }: {
    id: string;
    title: string;
    icon: any;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <LinearCard padding="none" shadow="sm" className="mb-6">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100">
            {children}
          </div>
        )}
      </LinearCard>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quick Stats */}
      <LinearCard padding="lg" shadow="sm" className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{prd.confidence_score}%</div>
            <div className="text-sm text-gray-600">AI 신뢰도</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{prd.diagrams.length}</div>
            <div className="text-sm text-gray-600">다이어그램</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{prd.features.length}</div>
            <div className="text-sm text-gray-600">핵심 기능</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">16주</div>
            <div className="text-sm text-gray-600">예상 기간</div>
          </div>
        </div>
      </LinearCard>

      {/* Executive Summary */}
      <Section id="summary" title="Executive Summary" icon={ClockIcon} defaultExpanded>
        <div className="prose max-w-none mt-4">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: prd.executive_summary.replace(/\n/g, '<br>') 
            }} 
          />
        </div>
      </Section>

      {/* Target Market */}
      <Section id="market" title="타겟 시장" icon={UserGroupIcon}>
        <div className="mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">주요 타겟</h4>
            <p className="text-blue-800">{prd.target_market}</p>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section id="features" title="핵심 기능" icon={CpuChipIcon}>
        <div className="mt-4 space-y-4">
          {prd.features.map((feature: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                <div className="flex items-center space-x-2">
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${
                      feature.priority === 'High' 
                        ? 'bg-red-100 text-red-800' 
                        : feature.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {feature.priority}
                  </span>
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${
                      feature.effort === 'High' 
                        ? 'bg-purple-100 text-purple-800' 
                        : feature.effort === 'Medium'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {feature.effort}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
              
              {feature.dependencies && feature.dependencies.length > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">의존성:</span> {feature.dependencies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Technical Requirements */}
      <Section id="tech" title="기술 요구사항" icon={CpuChipIcon}>
        <div className="mt-4 space-y-4">
          {Object.entries(prd.technical_requirements).map(([category, details]: [string, any]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 capitalize">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(details).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-gray-600 capitalize">{key}:</span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Success Metrics */}
      <Section id="metrics" title="성공 지표" icon={ChartBarIcon}>
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prd.success_metrics.map((metric: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <TrophyIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800">{metric}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Timeline */}
      <Section id="timeline" title="개발 일정" icon={CalendarIcon}>
        <div className="mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {prd.timeline}
            </pre>
          </div>
        </div>
      </Section>

      {/* Mini Diagrams Preview */}
      <Section id="diagrams-preview" title="다이어그램 미리보기" icon={ChartBarIcon}>
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            상세한 다이어그램은 "📊 다이어그램" 탭에서 확인할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prd.diagrams.map((diagram: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">
                  {diagram.type === 'flowchart' ? '🔄' : 
                   diagram.type === 'erDiagram' ? '🗄️' : '🏗️'}
                </div>
                <h4 className="font-medium text-sm mb-1">{diagram.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{diagram.description}</p>
                <div className="text-xs text-gray-500">
                  복잡도: {diagram.complexity_score}/10
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}