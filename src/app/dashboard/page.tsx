import { Suspense } from 'react';
import { LinearCard, LinearButton } from '@/components/ui';
import { AnalyticsService, PainPointService, BusinessIdeaService } from '@/lib/database';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import IdeaGenerator from '@/components/ai/IdeaGenerator';
import SavedIdeas from '@/components/ai/SavedIdeas';

// ISR: Revalidate every hour
export const revalidate = 3600;

async function getDashboardData() {
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
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

async function DashboardContent() {
  const { analytics, topIdeas, recentPainPoints } = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* AI 아이디어 생성 섹션 */}
      <div className="mb-8">
        <IdeaGenerator />
      </div>

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
          <h2 className="text-lg font-semibold mb-4">🚀 최고 신뢰도 아이디어</h2>
          <div className="space-y-3">
            {topIdeas.map((idea) => (
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
          <SavedIdeas />
        </div>

        <LinearCard padding="lg" shadow="md">
          <h2 className="text-lg font-semibold mb-4">🔥 트렌딩 갈증포인트</h2>
          <div className="space-y-3">
            {recentPainPoints.map((point) => (
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
        <h2 className="text-lg font-semibold mb-4">⚡ 빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          <LinearButton variant="primary" size="sm">
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">📊 IdeaSpark 대시보드</h1>
          <p className="text-text-secondary mt-2">
            실시간 갈증포인트 분석 및 비즈니스 아이디어 현황
          </p>
        </div>
        
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}