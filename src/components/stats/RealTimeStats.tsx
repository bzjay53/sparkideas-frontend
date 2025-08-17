'use client';

import { useEffect, useState } from 'react';
import { LinearCard } from '@/components/ui';

interface StatsData {
  painPoints: number;
  businessIdeas: number;
  aiAccuracy: number;
  communityPosts: number;
  telegramMessages: number;
  lastUpdated: string;
  error?: string;
  realData?: {
    topIdeas: Array<{
      id: string;
      title: string;
      confidence_score: number;
    }>;
    trendingPainPoints: Array<{
      id: string;
      description: string;
      trend_score: number;
    }>;
    growthMetrics: {
      painPointsGrowth: string;
      ideasGrowth: string;
      accuracyTrend: string;
    };
  };
}

export function RealTimeStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StatsData = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      
      // Set fallback data
      setStats({
        painPoints: 1200,
        businessIdeas: 850,
        aiAccuracy: 92,
        communityPosts: 45,
        telegramMessages: 320,
        lastUpdated: new Date().toISOString(),
        error: 'Using fallback data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`;
    }
    return `${num}+`;
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">실시간 현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <LinearCard key={index} padding="lg" shadow="md" className="animate-pulse">
                <div className="text-center">
                  <div className="bg-gray-200 dark:bg-gray-700 h-12 w-24 mx-auto mb-2 rounded"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-32 mx-auto rounded"></div>
                </div>
              </LinearCard>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">실시간 현황</h2>
        
        {/* Warning if using fallback data */}
        {stats?.error && (
          <div className="mb-6 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ 실시간 데이터를 불러오는 중입니다. 현재는 샘플 데이터를 표시하고 있습니다.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <LinearCard padding="lg" shadow="md" className="group hover:shadow-lg transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-105 transition-transform">
                {stats ? formatNumber(stats.painPoints) : '1,200+'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">수집된 갈증포인트</div>
              {stats?.realData?.growthMetrics.painPointsGrowth && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stats.realData.growthMetrics.painPointsGrowth} 이번 주
                </div>
              )}
            </div>
          </LinearCard>

          <LinearCard padding="lg" shadow="md" className="group hover:shadow-lg transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-105 transition-transform">
                {stats ? formatNumber(stats.businessIdeas) : '850+'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">생성된 비즈니스 아이디어</div>
              {stats?.realData?.growthMetrics.ideasGrowth && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stats.realData.growthMetrics.ideasGrowth} 이번 주
                </div>
              )}
            </div>
          </LinearCard>

          <LinearCard padding="lg" shadow="md" className="group hover:shadow-lg transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:scale-105 transition-transform">
                {stats ? `${stats.aiAccuracy}%` : '92%'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">AI 분석 정확도</div>
              {stats?.realData?.growthMetrics.accuracyTrend && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stats.realData.growthMetrics.accuracyTrend} 개선
                </div>
              )}
            </div>
          </LinearCard>
        </div>

        {/* Last updated timestamp */}
        {stats?.lastUpdated && (
          <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
            마지막 업데이트: {new Date(stats.lastUpdated).toLocaleString('ko-KR')}
          </div>
        )}

        {/* Real-time data indicators */}
        {stats && !stats.error && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">실시간 데이터</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default RealTimeStats;