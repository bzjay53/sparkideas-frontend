import Link from 'next/link';
import { LinearButton, LinearCard, LinearHero } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Suspense } from 'react';

function FeatureCards() {
  const features = [
    {
      title: '실시간 갈증포인트 수집',
      description: 'Reddit, LinkedIn 등에서 실시간으로 문제점을 발견하고 분석합니다.',
      icon: (
        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: 'AI 기반 아이디어 생성',
      description: 'GPT-4를 활용해 92% 정확도로 비즈니스 아이디어를 자동 생성합니다.',
      icon: (
        <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: 'PRD 자동 생성',
      description: 'Mermaid 다이어그램과 함께 완전한 제품 기획서를 원클릭으로 생성합니다.',
      icon: (
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: '개발자 커뮤니티',
      description: '아이디어 공유, 협업 매칭, 성공 사례를 통해 함께 성장합니다.',
      icon: (
        <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">핵심 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <LinearCard key={index} className="text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
            </LinearCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">실시간 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded"></div>}>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">1,200+</div>
              <div className="text-gray-600 dark:text-gray-300">수집된 갈증포인트</div>
            </div>
          </Suspense>
          <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded"></div>}>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">850+</div>
              <div className="text-gray-600 dark:text-gray-300">생성된 비즈니스 아이디어</div>
            </div>
          </Suspense>
          <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded"></div>}>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">92%</div>
              <div className="text-gray-600 dark:text-gray-300">AI 분석 정확도</div>
            </div>
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function SimpleNavbar() {
  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IdeaSpark
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/auth" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              로그인
            </Link>
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              대시보드
            </Link>
            <Link href="/community" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              커뮤니티
            </Link>
            <Link href="/prd" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              PRD 생성
            </Link>
            <ThemeToggle variant="icon-only" size="sm" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <SimpleNavbar />
      
      <LinearHero
        title="아이디어 발굴의 새로운 패러다임"
        subtitle="AI 기반 비즈니스 인텔리전스"
        description="Reddit, SNS, 구글에서 실시간 갈증포인트를 발굴하고, GPT-4로 분석하여 매일 검증된 비즈니스 아이디어를 제공합니다."
        variant="gradient"
        size="xl"
        badge={{
          text: "BETA",
          variant: "info"
        }}
        primaryAction={{
          label: "지금 시작하기",
          href: "/auth"
        }}
        secondaryAction={{
          label: "데모 보기",
          href: "/dashboard"
        }}
        features={[
          {
            icon: (
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ),
            title: "실시간 갈증포인트 수집",
            description: "Reddit, LinkedIn 등에서 실시간으로 문제점을 발견하고 분석합니다."
          },
          {
            icon: (
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ),
            title: "AI 기반 아이디어 생성", 
            description: "GPT-4를 활용해 92% 정확도로 비즈니스 아이디어를 자동 생성합니다."
          },
          {
            icon: (
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            title: "PRD 자동 생성",
            description: "Mermaid 다이어그램과 함께 완전한 제품 기획서를 원클릭으로 생성합니다."
          }
        ]}
      />
      
      <FeatureCards />
      <StatsSection />
      
      <footer className="py-8 px-4 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <p>&copy; 2025 IdeaSpark. 실시간 갈증포인트 분석 플랫폼</p>
      </footer>
    </div>
  );
}
