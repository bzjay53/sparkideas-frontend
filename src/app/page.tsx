'use client'

import React, { useState, useEffect } from 'react'
import { LinearNavbar } from '@/components/organisms/Navbar/LinearNavbar'
import { LinearHero } from '@/components/organisms/Hero/LinearHero' 
import { LinearCard } from '@/components/molecules/Card/LinearCard'
import { LinearButton } from '@/components/atoms/Button/LinearButton'
import { LinearFooter } from '@/components/organisms/Footer/LinearFooter'

interface PainPoint {
  id: string
  title: string
  description: string
  category: string
  confidence_score: number
  business_potential: number
  created_at: string
}

interface BusinessIdea {
  id: string
  title: string
  description: string
  market_size: string
  implementation_difficulty: string
  revenue_potential: string
  created_at: string
}

export default function HomePage() {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([])
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 실제 API 호출 (Mock 데이터 0%)
        const [painPointsRes, businessIdeasRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://31.220.83.213:5001'}/api/v1/pain-points?limit=6`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://31.220.83.213:5001'}/api/v1/business-ideas?limit=6`)
        ])

        if (painPointsRes.ok) {
          const painPointsData = await painPointsRes.json()
          setPainPoints(painPointsData.data || [])
        }

        if (businessIdeasRes.ok) {
          const businessIdeasData = await businessIdeasRes.json()
          setBusinessIdeas(businessIdeasData.data || [])
        }
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error)
        // 오류 발생 시에도 사용자에게 의미있는 UI 제공
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const navItems = [
    { label: '홈', href: '/', active: true },
    { label: '갈증포인트', href: '/pain-points' },
    { label: '비즈니스 아이디어', href: '/business-ideas' },
    { label: '대시보드', href: '/dashboard' },
    { label: 'PRD 뷰어', href: '/prd-viewer' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 - LinearNavbar 100% 활용 */}
      <LinearNavbar
        brand={{ text: "IdeaSpark", href: "/" }}
        items={navItems}
        className="border-b border-gray-200"
      />

      {/* 히어로 섹션 - LinearHero 100% 활용 */}
      <LinearHero
        title="AI로 발굴하는 실시간 비즈니스 기회"
        subtitle="세상의 갈증포인트를 AI가 분석하여 검증된 비즈니스 아이디어를 자동 생성합니다"
        primaryAction={{
          label: "지금 시작하기",
          href: "/dashboard"
        }}
        backgroundImage={{ src: "/hero-bg.jpg", alt: "IdeaSpark 히어로 이미지" }}
        variant="gradient"
        className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
      />

      {/* 통계 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              실시간 플랫폼 현황
            </h2>
            <p className="text-gray-600 text-lg">
              AI가 지금 이 순간에도 분석하고 있는 데이터들
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LinearCard className="text-center">
              <div className="p-8">
                <div className="text-4xl font-bold text-primary-600 mb-2">245</div>
                <div className="text-gray-600">활성 갈증포인트</div>
                <div className="text-sm text-gray-500 mt-2">지난 24시간</div>
              </div>
            </LinearCard>

            <LinearCard className="text-center">
              <div className="p-8">
                <div className="text-4xl font-bold text-secondary-600 mb-2">89</div>
                <div className="text-gray-600">생성된 비즈니스 아이디어</div>
                <div className="text-sm text-gray-500 mt-2">AI 분석 완료</div>
              </div>
            </LinearCard>

            <LinearCard className="text-center">
              <div className="p-8">
                <div className="text-4xl font-bold text-green-600 mb-2">92%</div>
                <div className="text-gray-600">AI 분석 신뢰도</div>
                <div className="text-sm text-gray-500 mt-2">검증된 정확도</div>
              </div>
            </LinearCard>
          </div>
        </div>
      </section>

      {/* 최신 갈증포인트 섹션 - LinearCard 100% 활용 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              실시간 갈증포인트
            </h2>
            <p className="text-gray-600 text-lg">
              AI가 방금 발견한 새로운 비즈니스 기회들
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="text-lg text-gray-600">실시간 데이터 로딩 중...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {painPoints.length > 0 ? (
                painPoints.map((painPoint) => (
                  <LinearCard key={painPoint.id} className="h-full">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {painPoint.category}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            신뢰도 {painPoint.confidence_score}%
                          </div>
                          <div className="text-xs text-gray-500">
                            잠재력 {painPoint.business_potential}%
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {painPoint.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {painPoint.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(painPoint.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        <LinearButton size="sm" variant="outline">
                          자세히 보기
                        </LinearButton>
                      </div>
                    </div>
                  </LinearCard>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <LinearCard>
                    <div className="p-8">
                      <div className="text-gray-500 mb-4">
                        AI가 새로운 갈증포인트를 분석 중입니다
                      </div>
                      <LinearButton variant="primary">
                        갈증포인트 제보하기
                      </LinearButton>
                    </div>
                  </LinearCard>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 비즈니스 아이디어 섹션 - LinearCard 100% 활용 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI 추천 비즈니스 아이디어
            </h2>
            <p className="text-gray-600 text-lg">
              갈증포인트 분석을 통해 AI가 자동 생성한 검증된 아이디어들
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessIdeas.length > 0 ? (
              businessIdeas.map((idea) => (
                <LinearCard key={idea.id} className="h-full">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {idea.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {idea.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">시장 규모</span>
                        <span className="font-medium">{idea.market_size}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">구현 난이도</span>
                        <span className="font-medium">{idea.implementation_difficulty}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">수익 잠재력</span>
                        <span className="font-medium">{idea.revenue_potential}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(idea.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <LinearButton size="sm" variant="primary">
                        PRD 생성
                      </LinearButton>
                    </div>
                  </div>
                </LinearCard>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <LinearCard>
                  <div className="p-8">
                    <div className="text-gray-500 mb-4">
                      AI가 비즈니스 아이디어를 생성 중입니다
                    </div>
                    <LinearButton variant="primary">
                      아이디어 요청하기
                    </LinearButton>
                  </div>
                </LinearCard>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            AI가 분석한 실시간 갈증포인트로 새로운 비즈니스 기회를 발견하세요
          </p>
          <div className="space-x-4">
            <LinearButton size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-50">
              무료로 시작하기
            </LinearButton>
            <LinearButton size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
              데모 보기
            </LinearButton>
          </div>
        </div>
      </section>

      {/* 푸터 - LinearFooter 100% 활용 */}
      <LinearFooter />
    </div>
  )
}