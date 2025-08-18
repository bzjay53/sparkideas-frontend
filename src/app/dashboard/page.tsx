'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LinearCard, LinearButton } from '@/components/ui';
import { AnalyticsService, PainPointService, BusinessIdeaService } from '@/lib/database';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import IdeaGenerator from '@/components/ai/IdeaGenerator';
import SavedIdeas from '@/components/ai/SavedIdeas';
import Logo from '@/components/common/Logo';
import { AuthNavbar } from '@/components/navigation/AuthNavbar';
import Link from 'next/link';

// Note: ISR revalidate is disabled for client components

// Mock data for demo version
function getMockDashboardData() {
  return {
    analytics: { 
      painPoints: 15842, 
      businessIdeas: 1284, 
      telegramMessages: 47, 
      communityPosts: 23 
    },
    topIdeas: [
      {
        id: 'demo-1',
        title: 'AI 기반 개발자 채용 매칭 플랫폼',
        description: '프로젝트 경험과 코딩 스타일을 분석하여 개발자와 회사를 매칭하는 플랫폼',
        confidence_score: 87,
        implementation_difficulty: 3
      },
      {
        id: 'demo-2',
        title: '원격근무 생산성 관리 도구',
        description: '재택근무자를 위한 시간 추적, 집중력 향상, 팀 협업 통합 솔루션',
        confidence_score: 82,
        implementation_difficulty: 2
      }
    ],
    recentPainPoints: [
      {
        id: 'pain-1',
        title: 'React 상태 관리 복잡성',
        content: 'Redux는 너무 복잡하고, Context API는 성능 이슈가...',
        source: 'Reddit',
        trend_score: 0.91
      },
      {
        id: 'pain-2',
        title: '원격근무 시 소통 문제',
        content: '슬랙으로는 빠른 의사소통이 어렵고, 줌 미팅은 너무 많아서...',
        source: 'LinkedIn',
        trend_score: 0.85
      }
    ]
  };
}

async function getDashboardData(isDemo: boolean = false) {
  if (isDemo) {
    // Return mock data for demo version
    return getMockDashboardData();
  }

  try {
    const [analytics, topIdeas, recentPainPoints] = await Promise.all([
      AnalyticsService.getOverallStats(),
      BusinessIdeaService.getTopIdeas(5),
      PainPointService.getTrending(10)
    ]);

    return {
      analytics,
      topIdeas,
      recentPainPoints
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return {
      analytics: { painPoints: 0, businessIdeas: 0, telegramMessages: 0, communityPosts: 0 },
      topIdeas: [],
      recentPainPoints: []
    };
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <LinearCard key={i} padding="md" className="h-24 animate-pulse">
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded" />
          </LinearCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LinearCard padding="md" className="h-96 animate-pulse">
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded" />
        </LinearCard>
        <LinearCard padding="md" className="h-96 animate-pulse">
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded" />
        </LinearCard>
      </div>
    </div>
  );
}

function DashboardContent({ isDemo }: { isDemo: boolean }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getDashboardData(isDemo);
      setData(result);
      setLoading(false);
    };
    
    fetchData();
  }, [isDemo]);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const { analytics, topIdeas, recentPainPoints } = data;

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemo && (
        <LinearCard padding="md" className="mb-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-orange-800">데모 모드로 실행 중</h3>
                <p className="text-sm text-orange-700">실제 데이터가 아닌 샘플 데이터를 표시합니다. 모든 기능을 체험해보려면 로그인하세요.</p>
              </div>
            </div>
            <Link href="/auth">
              <LinearButton variant="primary" size="sm" className="whitespace-nowrap">
                로그인하기
              </LinearButton>
            </Link>
          </div>
        </LinearCard>
      )}

      {/* AI 아이디어 생성 섹션 - 로그인 시에만 */}
      {!isDemo && (
        <div className="mb-8">
          <IdeaGenerator />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LinearCard padding="md" shadow="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-primary">{analytics.painPoints}</p>
            <p className="text-sm text-text-secondary">갈증포인트 수집</p>
          </div>
        </LinearCard>
        
        <LinearCard padding="md" shadow="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-primary">{analytics.businessIdeas}</p>
            <p className="text-sm text-text-secondary">비즈니스 아이디어</p>
          </div>
        </LinearCard>
        
        <LinearCard padding="md" shadow="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-primary">{analytics.telegramMessages}</p>
            <p className="text-sm text-text-secondary">텔레그램 발송</p>
          </div>
        </LinearCard>
        
        <LinearCard padding="md" shadow="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-primary">{analytics.communityPosts}</p>
            <p className="text-sm text-text-secondary">커뮤니티 게시글</p>
          </div>
        </LinearCard>
      </div>

      {/* Top Ideas and Recent Pain Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LinearCard padding="lg" shadow="md">
          <h2 className="text-lg font-semibold mb-4">최고 신뢰도 아이디어</h2>
          <div className="space-y-3">
            {topIdeas.map((idea: any) => (
              <div key={idea.id} className="border-l-4 border-accent-primary pl-3">
                <h3 className="font-medium text-sm">{idea.title}</h3>
                <p className="text-xs text-text-secondary line-clamp-2">{idea.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs bg-accent-light text-accent-primary px-2 py-1 rounded">
                    신뢰도 {idea.confidence_score}%
                  </span>
                  <span className="text-xs text-text-tertiary">
                    난이도 {idea.implementation_difficulty}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </LinearCard>

        <div className="lg:col-span-1">
          {!isDemo && <SavedIdeas />}
          {isDemo && (
            <LinearCard padding="lg" shadow="md">
              <h2 className="text-lg font-semibold mb-4">저장된 아이디어</h2>
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">로그인하면 아이디어를</p>
                <p className="text-sm">저장하고 관리할 수 있습니다</p>
                <Link href="/auth">
                  <LinearButton variant="outline" size="sm" className="mt-3">
                    로그인하기
                  </LinearButton>
                </Link>
              </div>
            </LinearCard>
          )}
        </div>

        <LinearCard padding="lg" shadow="md">
          <h2 className="text-lg font-semibold mb-4">트렌딩 갈증포인트</h2>
          <div className="space-y-3">
            {recentPainPoints.map((point: any) => (
              <div key={point.id} className="border-l-4 border-orange-400 pl-3">
                <h3 className="font-medium text-sm">{point.title}</h3>
                <p className="text-xs text-text-secondary line-clamp-2">{point.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    {point.source}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    트렌드 {(point.trend_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </LinearCard>
      </div>

      {/* Quick Actions */}
      <LinearCard padding="lg" shadow="md">
        <h2 className="text-lg font-semibold mb-4">빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          <LinearButton 
            variant="primary" 
            size="sm" 
            className="!text-white font-medium"
          >
            새 데이터 수집 시작
          </LinearButton>
          <LinearButton variant="secondary" size="sm">
            AI 분석 실행
          </LinearButton>
          <LinearButton variant="outline" size="sm">
            텔레그램 테스트 발송
          </LinearButton>
          <LinearButton variant="outline" size="sm">
            커뮤니티 관리
          </LinearButton>
        </div>
      </LinearCard>
    </div>
  );
}

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams?.get('demo') === 'true';

  if (isDemo) {
    // Demo mode - no authentication required
    return (
      <div className="page-background">
        <AuthNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>IdeaSpark 대시보드 (데모)</h1>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              실시간 갈증포인트 분석 및 비즈니스 아이디어 현황 - 데모 버전
            </p>
          </div>
          
          <DashboardContent isDemo={true} />
        </div>
      </div>
    );
  }

  // Regular mode - authentication required
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="mb-6">
          <Logo size="md" />
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">IdeaSpark 대시보드</h1>
          <p className="text-text-secondary mt-2">
            실시간 갈증포인트 분석 및 비즈니스 아이디어 현황
          </p>
        </div>
        
        <DashboardContent isDemo={false} />
      </div>
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}