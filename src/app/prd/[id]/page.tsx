'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LinearCard, LinearButton } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ArrowLeftIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function PRDViewerPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold">PRD 상세보기</h1>
              </div>
              <div className="flex items-center space-x-2">
                <LinearButton 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 font-medium"
                >
                  <ShareIcon className="w-4 h-4 mr-1" />
                  <span className="text-gray-700">공유</span>
                </LinearButton>
                <LinearButton 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 font-medium"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  <span className="text-gray-700">다운로드</span>
                </LinearButton>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <LinearCard padding="lg" className="mb-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    AI 기반 개발자 협업 플랫폼
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>PRD ID: {params.id}</span>
                    <span>•</span>
                    <span>생성일: 2024-08-19</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      승인됨
                    </span>
                  </div>
                </div>

                {/* Executive Summary */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 요약</h2>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed">
                      개발팀의 원격 협업 문제를 해결하기 위한 AI 기반 통합 플랫폼입니다. 
                      실시간 코드 리뷰, 자동화된 작업 배분, 그리고 프로젝트 진행도 예측을 통해 
                      개발 생산성을 40% 향상시키는 것을 목표로 합니다.
                    </p>
                  </div>
                </section>

                {/* Problem Statement */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 해결하고자 하는 문제</h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-400 pl-4">
                      <h3 className="font-medium text-gray-900">원격 협업의 비효율성</h3>
                      <p className="text-gray-700 text-sm mt-1">
                        코드 리뷰 지연, 비동기 소통 문제, 작업 중복 등으로 개발 속도 저하
                      </p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4">
                      <h3 className="font-medium text-gray-900">프로젝트 관리의 어려움</h3>
                      <p className="text-gray-700 text-sm mt-1">
                        진행도 파악 곤란, 일정 예측 부정확, 리소스 배분 최적화 부족
                      </p>
                    </div>
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h3 className="font-medium text-gray-900">개발 품질 관리</h3>
                      <p className="text-gray-700 text-sm mt-1">
                        일관성 없는 코딩 스타일, 버그 발생률 증가, 기술 부채 누적
                      </p>
                    </div>
                  </div>
                </section>

                {/* Solution */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 해결 방안</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-2">🤖 AI 코드 리뷰어</h3>
                      <p className="text-green-700 text-sm">
                        자동화된 코드 품질 검사와 개선 제안으로 리뷰 시간 단축
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">📊 스마트 대시보드</h3>
                      <p className="text-blue-700 text-sm">
                        실시간 프로젝트 진행도와 예측 분석을 통한 투명한 관리
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-800 mb-2">🔄 자동 워크플로</h3>
                      <p className="text-purple-700 text-sm">
                        작업 배분과 일정 조정의 자동화로 효율성 극대화
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-medium text-orange-800 mb-2">📱 통합 커뮤니케이션</h3>
                      <p className="text-orange-700 text-sm">
                        컨텍스트 기반 실시간 소통과 비동기 협업 지원
                      </p>
                    </div>
                  </div>
                </section>

                {/* Technical Architecture */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">🏗️ 기술 아키텍처</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-white p-3 rounded border">
                        <div className="text-2xl mb-2">🎨</div>
                        <h4 className="font-medium text-gray-900">Frontend</h4>
                        <p className="text-sm text-gray-600">React + TypeScript</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="text-2xl mb-2">⚡</div>
                        <h4 className="font-medium text-gray-900">Backend</h4>
                        <p className="text-sm text-gray-600">Node.js + FastAPI</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="text-2xl mb-2">🗄️</div>
                        <h4 className="font-medium text-gray-900">Database</h4>
                        <p className="text-sm text-gray-600">PostgreSQL + Redis</p>
                      </div>
                    </div>
                  </div>
                </section>
              </LinearCard>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Project Status */}
              <LinearCard padding="lg" className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 프로젝트 현황</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상태</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                      개발 진행중
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">진행률</span>
                    <span className="font-semibold">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">예상 완료일</span>
                    <span className="font-semibold">2024-12-15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">팀 크기</span>
                    <span className="font-semibold">5명</span>
                  </div>
                </div>
              </LinearCard>

              {/* Key Metrics */}
              <LinearCard padding="lg" className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 핵심 지표</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">40%</div>
                    <div className="text-sm text-gray-600">생산성 향상</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$2.5M</div>
                    <div className="text-sm text-gray-600">예상 ARR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">12개월</div>
                    <div className="text-sm text-gray-600">투자회수기간</div>
                  </div>
                </div>
              </LinearCard>

              {/* Team */}
              <LinearCard padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 담당 팀</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      PM
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">김지민</div>
                      <div className="text-sm text-gray-600">Product Manager</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      FE
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">이정우</div>
                      <div className="text-sm text-gray-600">Frontend Lead</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      BE
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">박서연</div>
                      <div className="text-sm text-gray-600">Backend Lead</div>
                    </div>
                  </div>
                </div>
              </LinearCard>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}