'use client';

import { useState, useEffect } from 'react';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PlusIcon, DocumentTextIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Logo from '@/components/common/Logo';

interface PRD {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: string;
  template_type: string;
  diagrams_count: number;
  estimated_dev_time: string;
  confidence_score: number;
}

export default function PRDListPage() {
  const [prds, setPrds] = useState<PRD[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock PRD data
  useEffect(() => {
    const mockPrds: PRD[] = [
      {
        id: 'prd_001',
        title: 'AI 기반 스마트 쇼핑 추천 앱',
        description: '개인화된 쇼핑 경험을 제공하는 AI 추천 시스템',
        created_at: '2025-08-15T10:30:00Z',
        status: 'completed',
        template_type: 'mobile_app',
        diagrams_count: 3,
        estimated_dev_time: '3-6개월 (표준 웹 애플리케이션)',
        confidence_score: 92
      },
      {
        id: 'prd_002', 
        title: 'B2B 팀 협업 SaaS 플랫폼',
        description: '원격 팀을 위한 실시간 협업 도구',
        created_at: '2025-08-14T14:20:00Z',
        status: 'completed',
        template_type: 'saas',
        diagrams_count: 4,
        estimated_dev_time: '6-12개월 (중대규모 애플리케이션)',
        confidence_score: 87
      },
      {
        id: 'prd_003',
        title: '헬스케어 IoT 모니터링 시스템',
        description: '실시간 건강 데이터 수집 및 분석 플랫폼',
        created_at: '2025-08-13T09:15:00Z', 
        status: 'draft',
        template_type: 'enterprise',
        diagrams_count: 5,
        estimated_dev_time: '12-18개월 (복잡한 엔터프라이즈 시스템)',
        confidence_score: 95
      }
    ];

    setTimeout(() => {
      setPrds(mockPrds);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPrds = prds.filter(prd =>
    prd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'draft':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'in_progress':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'draft': return '초안';
      case 'in_progress': return '진행중';
      default: return '알 수 없음';
    }
  };

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case 'mobile_app': return '📱';
      case 'saas': return '☁️';
      case 'enterprise': return '🏢';
      case 'web_app': return '💻';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">PRD 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            {/* Logo */}
            <div className="mb-4">
              <Logo size="md" />
            </div>
            
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                PRD 관리
              </h1>
              <p className="text-gray-600 mt-2">
                자동 생성된 제품 요구사항 문서를 관리하고 다운로드하세요
              </p>
            </div>
            
            <LinearButton 
              variant="primary" 
              size="lg"
              className="flex items-center space-x-2"
              onClick={() => window.location.href = '/prd/create'}
            >
              <PlusIcon className="w-5 h-5" />
              <span>새 PRD 생성</span>
            </LinearButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <LinearCard padding="lg" shadow="sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <LinearInput
                  type="text"
                  placeholder="PRD 제목이나 설명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">모든 상태</option>
                  <option value="completed">완료</option>
                  <option value="draft">초안</option>
                  <option value="in_progress">진행중</option>
                </select>
                
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="created_desc">최신순</option>
                  <option value="created_asc">오래된순</option>
                  <option value="confidence_desc">신뢰도 높은순</option>
                </select>
              </div>
            </div>
          </LinearCard>
        </div>

        {/* PRD Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <LinearCard padding="lg" className="text-center">
            <div className="text-2xl font-bold text-blue-600">{prds.length}</div>
            <div className="text-sm text-gray-600">전체 PRD</div>
          </LinearCard>
          
          <LinearCard padding="lg" className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {prds.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">완료됨</div>
          </LinearCard>
          
          <LinearCard padding="lg" className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {prds.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">초안</div>
          </LinearCard>
          
          <LinearCard padding="lg" className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(prds.reduce((acc, p) => acc + p.confidence_score, 0) / prds.length)}%
            </div>
            <div className="text-sm text-gray-600">평균 신뢰도</div>
          </LinearCard>
        </div>

        {/* PRD List */}
        <div className="space-y-6">
          {filteredPrds.length === 0 ? (
            <LinearCard padding="lg" className="text-center">
              <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? '검색 결과가 없습니다' : '아직 생성된 PRD가 없습니다'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? '다른 검색어를 시도해보세요.'
                  : '첫 번째 PRD를 생성해보세요!'
                }
              </p>
              <LinearButton 
                variant="primary"
                onClick={() => window.location.href = '/prd/create'}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                새 PRD 생성
              </LinearButton>
            </LinearCard>
          ) : (
            filteredPrds.map((prd) => (
              <LinearCard key={prd.id} padding="lg" shadow="sm" className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTemplateIcon(prd.template_type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={getStatusBadge(prd.status)}>
                          {getStatusText(prd.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(prd.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        신뢰도 {prd.confidence_score}%
                      </div>
                      <div className="text-xs text-gray-500">
                        다이어그램 {prd.diagrams_count}개
                      </div>
                    </div>
                  </div>
                </div>

                <Link href={`/prd/${prd.id}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                    {prd.title}
                  </h3>
                </Link>
                
                <p className="text-gray-700 mb-4">
                  {prd.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>예상 개발 기간: {prd.estimated_dev_time}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {prd.template_type.replace('_', ' ').toUpperCase()} 템플릿
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <LinearButton variant="outline" size="sm">
                      <ShareIcon className="w-4 h-4 mr-1" />
                      공유
                    </LinearButton>
                    
                    <LinearButton variant="outline" size="sm">
                      <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                      다운로드
                    </LinearButton>
                    
                    <Link href={`/prd/${prd.id}`}>
                      <LinearButton variant="primary" size="sm">
                        자세히 보기
                      </LinearButton>
                    </Link>
                  </div>
                </div>
              </LinearCard>
            ))
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}