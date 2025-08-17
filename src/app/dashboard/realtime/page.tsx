'use client';

import { useState, useEffect } from 'react';
import { LinearCard, LinearButton } from '@/components/ui';
import RealTimeChart from '@/components/dashboard/RealTimeChart';
import RealTimeMetrics from '@/components/dashboard/RealTimeMetrics';
import { useDashboardWebSocket } from '@/hooks/useWebSocket';

export default function RealTimeDashboard() {
  const {
    isConnected,
    isConnecting,
    error,
    dashboardData,
    metricsData,
    alertsData,
    requestMetricsUpdate,
    requestDashboardUpdate,
    triggerDataCollection
  } = useDashboardWebSocket();

  // Mock data for charts (will be replaced by real data from WebSocket)
  const [painPointsChart, setPainPointsChart] = useState({
    labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
    datasets: [
      {
        label: '갈증포인트 수집',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'AI 분석 완료',
        data: [8, 15, 12, 20, 18, 25],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  });

  const [sourceDistribution] = useState({
    labels: ['Reddit', 'Naver', 'Alternative', 'GitHub', 'HackerNews'],
    datasets: [
      {
        label: '데이터 소스별 분포',
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  });

  const [categoryChart] = useState({
    labels: ['기술', '비즈니스', '생산성', '헬스케어', '교육', '엔터테인먼트'],
    datasets: [
      {
        label: '카테고리별 아이디어',
        data: [45, 38, 32, 18, 15, 12],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#22C55E'
        ],
        borderWidth: 1
      }
    ]
  });

  // Real-time metrics data
  const [metrics] = useState([
    {
      label: '총 갈증포인트',
      value: 1247,
      change: 23,
      trend: 'up' as const,
      icon: '📊',
      color: 'primary' as const,
      format: 'number' as const
    },
    {
      label: '비즈니스 아이디어',
      value: 89,
      change: 5,
      trend: 'up' as const,
      icon: '💡',
      color: 'success' as const,
      format: 'number' as const
    },
    {
      label: 'AI 분석률',
      value: 92.5,
      change: 2.1,
      trend: 'up' as const,
      icon: '🤖',
      color: 'info' as const,
      format: 'percentage' as const
    },
    {
      label: '텔레그램 발송',
      value: 156,
      change: -3,
      trend: 'down' as const,
      icon: '📱',
      color: 'warning' as const,
      format: 'number' as const
    }
  ]);

  // Connection status indicator
  const getConnectionStatus = () => {
    if (isConnecting) return { text: '연결 중...', color: 'yellow' };
    if (isConnected) return { text: '실시간 연결됨', color: 'green' };
    if (error) return { text: '연결 오류', color: 'red' };
    return { text: '연결 안됨', color: 'gray' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 실시간 대시보드
              </h1>
              <p className="text-gray-600 mt-2">
                IdeaSpark 갈증포인트 분석 및 비즈니스 아이디어 실시간 모니터링
              </p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    connectionStatus.color === 'green' ? 'bg-green-400' :
                    connectionStatus.color === 'yellow' ? 'bg-yellow-400 animate-pulse' :
                    connectionStatus.color === 'red' ? 'bg-red-400' : 'bg-gray-400'
                  }`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {connectionStatus.text}
                </span>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <LinearButton 
                  variant="outline" 
                  size="sm"
                  onClick={requestMetricsUpdate}
                  disabled={!isConnected}
                >
                  📈 메트릭 새로고침
                </LinearButton>
                <LinearButton 
                  variant="outline" 
                  size="sm"
                  onClick={triggerDataCollection}
                  disabled={!isConnected}
                >
                  🔄 데이터 수집 시작
                </LinearButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Real-time Metrics */}
        <RealTimeMetrics
          title="핵심 지표"
          metrics={metrics}
          updateInterval={15000} // 15 seconds
          columns={4}
          size="md"
        />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealTimeChart
            type="line"
            title="📈 갈증포인트 수집 추이"
            data={painPointsChart}
            height={350}
            updateInterval={20000} // 20 seconds
          />
          
          <RealTimeChart
            type="doughnut"
            title="🌐 데이터 소스 분포"
            data={sourceDistribution}
            height={350}
            updateInterval={60000} // 1 minute
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RealTimeChart
              type="bar"
              title="📊 카테고리별 비즈니스 아이디어"
              data={categoryChart}
              height={300}
              updateInterval={45000} // 45 seconds
            />
          </div>
          
          {/* System Status */}
          <LinearCard padding="lg" shadow="md">
            <h3 className="text-lg font-semibold mb-4">⚙️ 시스템 상태</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API 서버</span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  정상
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">데이터베이스</span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  연결됨
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reddit API</span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  활성
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Naver API</span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  활성
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI 분석 엔진</span>
                <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                  대기 중
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">텔레그램 봇</span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  활성
                </span>
              </div>
            </div>
            
            {/* Quick System Actions */}
            <div className="mt-6 space-y-2">
              <LinearButton 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={requestDashboardUpdate}
              >
                🔄 시스템 상태 새로고침
              </LinearButton>
              <LinearButton 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                📋 로그 보기
              </LinearButton>
            </div>
          </LinearCard>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Pain Points */}
          <LinearCard padding="lg" shadow="md">
            <h3 className="text-lg font-semibold mb-4">최근 갈증포인트</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[1,2,3,4,5].map((item) => (
                <div key={item} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      모바일 앱 네비게이션 문제 #{item}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reddit • 2분 전 • 신뢰도 85%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </LinearCard>

          {/* System Alerts */}
          <LinearCard padding="lg" shadow="md">
            <h3 className="text-lg font-semibold mb-4">🚨 시스템 알림</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alertsData.length > 0 ? alertsData.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message || '새로운 알림'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp || Date.now()).toLocaleTimeString('ko-KR')}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">현재 알림이 없습니다</p>
                  <p className="text-xs mt-1">시스템이 정상적으로 작동 중입니다</p>
                </div>
              )}
            </div>
          </LinearCard>
        </div>

        {/* Performance Stats */}
        <LinearCard padding="lg" shadow="md">
          <h3 className="text-lg font-semibold mb-4">📊 성능 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">2.3초</p>
              <p className="text-sm text-gray-600">평균 응답시간</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">99.8%</p>
              <p className="text-sm text-gray-600">가동률</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">1,247</p>
              <p className="text-sm text-gray-600">일일 처리량</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">0.2GB</p>
              <p className="text-sm text-gray-600">메모리 사용량</p>
            </div>
          </div>
        </LinearCard>
      </div>
    </div>
  );
}