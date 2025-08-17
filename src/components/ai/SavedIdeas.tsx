'use client';

import { useState, useEffect } from 'react';
import { LinearCard, LinearButton } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

interface SavedIdea {
  id: string;
  title: string;
  description: string;
  confidence_score: number;
  created_at: string;
  is_favorite: boolean;
  tags: string[];
  target_market: string;
  business_model: string;
  estimated_cost: string;
  time_to_market: string;
}

interface SavedIdeasResponse {
  success: boolean;
  ideas: SavedIdea[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  note?: string;
}

export function SavedIdeas() {
  const { user, session } = useAuth();
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ limit: 5, offset: 0, total: 0 });
  const [managingId, setManagingId] = useState<string | null>(null);

  const fetchSavedIdeas = async () => {
    if (!user || !session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/save-idea?limit=${pagination.limit}&offset=${pagination.offset}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: SavedIdeasResponse = await response.json();

      if (response.ok && data.success) {
        setIdeas(data.ideas);
        setPagination(data.pagination);
      } else {
        throw new Error(data.note || '저장된 아이디어를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('저장된 아이디어 조회 에러:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedIdeas();
  }, [user, session]);

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleFavorite = async (ideaId: string, currentFavorite: boolean) => {
    if (!session) return;

    setManagingId(ideaId);
    try {
      const response = await fetch('/api/ai/save-idea', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ideaId,
          updates: { is_favorite: !currentFavorite }
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 로컬 상태 업데이트
        setIdeas(prevIdeas => 
          prevIdeas.map(idea => 
            idea.id === ideaId 
              ? { ...idea, is_favorite: !currentFavorite }
              : idea
          )
        );
      } else {
        throw new Error(data.message || '즐겨찾기 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('즐겨찾기 토글 에러:', err);
      setError(err instanceof Error ? err.message : '즐겨찾기 업데이트 실패');
    } finally {
      setManagingId(null);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!session || !confirm('정말로 이 아이디어를 삭제하시겠습니까?')) return;

    setManagingId(ideaId);
    try {
      const response = await fetch(`/api/ai/save-idea?id=${ideaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 로컬 상태에서 제거
        setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      } else {
        throw new Error(data.message || '아이디어 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('아이디어 삭제 에러:', err);
      setError(err instanceof Error ? err.message : '삭제 실패');
    } finally {
      setManagingId(null);
    }
  };

  if (!user) {
    return (
      <LinearCard className="p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm">로그인 후 저장된 아이디어를 확인하세요</p>
        </div>
      </LinearCard>
    );
  }

  if (loading) {
    return (
      <LinearCard className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-l-4 border-gray-200 dark:border-gray-700 pl-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
              <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </LinearCard>
    );
  }

  if (error) {
    return (
      <LinearCard className="p-6">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
          <LinearButton 
            onClick={fetchSavedIdeas}
            variant="outline"
            size="sm"
          >
            다시 시도
          </LinearButton>
        </div>
      </LinearCard>
    );
  }

  if (ideas.length === 0) {
    return (
      <LinearCard className="p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm mb-2">아직 저장된 아이디어가 없습니다</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            AI로 아이디어를 생성하고 저장해보세요!
          </p>
        </div>
      </LinearCard>
    );
  }

  return (
    <LinearCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          저장된 아이디어
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {pagination.total}개
        </span>
      </div>

      <div className="space-y-4">
        {ideas.map((idea) => (
          <div key={idea.id} className="group border-l-4 border-purple-500 dark:border-purple-400 pl-4 py-3 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent rounded-r-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight flex-1">
                {idea.title}
              </h3>
              <div className="flex items-center gap-2 ml-4">
                {/* 관리 버튼들 */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {/* 즐겨찾기 토글 */}
                  <button
                    onClick={() => handleToggleFavorite(idea.id, idea.is_favorite)}
                    disabled={managingId === idea.id}
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                      idea.is_favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                    } ${managingId === idea.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={idea.is_favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  >
                    {managingId === idea.id ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </button>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => handleDeleteIdea(idea.id)}
                    disabled={managingId === idea.id}
                    className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-gray-400 hover:text-red-500 transition-colors ${
                      managingId === idea.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="아이디어 삭제"
                  >
                    {managingId === idea.id ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* 신뢰도 점수 */}
                <span className={`text-xs font-semibold ${getConfidenceColor(idea.confidence_score)}`}>
                  {idea.confidence_score}%
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
              {idea.description}
            </p>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-wrap gap-1">
                {idea.tags && idea.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="text-gray-500 dark:text-gray-400 ml-2">
                {formatDate(idea.created_at)}
              </div>
            </div>

            <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              {idea.estimated_cost && (
                <span>💰 {idea.estimated_cost}</span>
              )}
              {idea.time_to_market && (
                <span>⏰ {idea.time_to_market}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {pagination.total > pagination.limit && (
        <div className="mt-4 text-center">
          <LinearButton
            variant="outline"
            size="sm"
            onClick={() => {
              // 추후 페이지네이션 구현
              console.log('더 보기 클릭');
            }}
          >
            더 보기 ({pagination.total - pagination.limit}개 더)
          </LinearButton>
        </div>
      )}
    </LinearCard>
  );
}

export default SavedIdeas;