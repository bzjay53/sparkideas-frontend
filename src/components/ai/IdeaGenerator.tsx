'use client';

import { useState } from 'react';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  targetMarket: string;
  businessModel: string;
  keyFeatures: string[];
  marketSize: string;
  competitiveAdvantage: string;
  confidenceScore: number;
  tags: string[];
  estimatedCost: string;
  timeToMarket: string;
  createdAt: string;
  originalPainPoint: string;
}

interface GenerateResponse {
  success: boolean;
  idea: BusinessIdea;
  meta: {
    model: string;
    generatedAt: string;
    note?: string;
  };
}

export function IdeaGenerator() {
  const { user, session } = useAuth();
  const [painPoint, setPainPoint] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<BusinessIdea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!painPoint.trim()) {
      setError('갈증포인트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedIdea(null);

    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/ai/generate-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          painPoint: painPoint.trim(),
          industry: industry.trim() || undefined,
          userPreferences: '실현 가능하고 혁신적인 아이디어'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GenerateResponse = await response.json();
      
      if (data.success) {
        setGeneratedIdea(data.idea);
      } else {
        throw new Error('아이디어 생성에 실패했습니다.');
      }

    } catch (err) {
      console.error('아이디어 생성 에러:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedIdea || !user || !session) {
      setError('로그인이 필요합니다.');
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/ai/save-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          idea: generatedIdea,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveMessage('✅ 아이디어가 성공적으로 저장되었습니다!');
        if (data.note) {
          setSaveMessage(`✅ ${data.message} (${data.note})`);
        }
      } else if (response.status === 409) {
        setSaveMessage('⚠️ 이미 저장된 아이디어입니다.');
      } else {
        throw new Error(data.message || '저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('아이디어 저장 에러:', err);
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setGeneratedIdea(null);
    setError(null);
    setSaveMessage(null);
    setPainPoint('');
    setIndustry('');
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* 입력 섹션 */}
      <LinearCard className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI 비즈니스 아이디어 생성
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            해결하고 싶은 문제점을 입력하면 AI가 혁신적인 비즈니스 아이디어를 제안해드립니다.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              갈증포인트 (해결하고 싶은 문제) *
            </label>
            <textarea
              value={painPoint}
              onChange={(e) => setPainPoint(e.target.value)}
              placeholder="예: 온라인 쇼핑에서 옷 사이즈가 맞지 않아서 반품률이 높은 문제"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              관련 산업/분야 (선택사항)
            </label>
            <LinearInput
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="예: 패션/이커머스, 교육, 헬스케어, 핀테크"
              disabled={loading}
              className="w-full"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-lg text-red-800 dark:text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          {saveMessage && (
            <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 rounded-lg text-green-800 dark:text-green-200 text-sm">
              {saveMessage}
            </div>
          )}

          <div className="flex gap-3">
            <LinearButton
              onClick={handleGenerate}
              disabled={loading || !painPoint.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  AI 아이디어 생성 중...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI 아이디어 생성
                </div>
              )}
            </LinearButton>

            {generatedIdea && (
              <LinearButton
                onClick={handleReset}
                variant="outline"
                disabled={loading}
                className="px-6"
              >
                새로 생성
              </LinearButton>
            )}
          </div>
        </div>
      </LinearCard>

      {/* 결과 섹션 */}
      {generatedIdea && (
        <LinearCard className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-600">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {generatedIdea.title}
            </h3>
            <div className={`text-lg font-bold ${getConfidenceColor(generatedIdea.confidenceScore)}`}>
              신뢰도 {generatedIdea.confidenceScore}%
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📝 아이디어 설명</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {generatedIdea.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 타겟 시장</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {generatedIdea.targetMarket}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 비즈니스 모델</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {generatedIdea.businessModel}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🔗 핵심 기능</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedIdea.keyFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 시장 규모</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {generatedIdea.marketSize}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🏆 경쟁 우위</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {generatedIdea.competitiveAdvantage}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💵 초기 투자 비용</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {generatedIdea.estimatedCost}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">⏰ 출시 예상 기간</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {generatedIdea.timeToMarket}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🏷️ 태그</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedIdea.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div>
                원본 갈증포인트: {generatedIdea.originalPainPoint}
              </div>
              <div>
                생성일: {new Date(generatedIdea.createdAt).toLocaleString('ko-KR')}
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="mt-6 flex gap-3">
            <LinearButton
              variant="outline"
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !user}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  저장 중...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {user ? '저장하기' : '로그인 필요'}
                </div>
              )}
            </LinearButton>
            
            <LinearButton
              variant="outline"
              className="flex-1"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(generatedIdea, null, 2));
                alert('아이디어가 클립보드에 복사되었습니다!');
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              복사하기
            </LinearButton>
          </div>
        </LinearCard>
      )}
    </div>
  );
}

export default IdeaGenerator;