import Link from 'next/link';
import { LinearButton, LinearCard, LinearHero } from '@/components/ui';
import { Suspense } from 'react';

function FeatureCards() {
  const features = [
    {
      title: '실시간 갈증포인트 수집',
      description: 'Reddit, LinkedIn 등에서 실시간으로 문제점을 발견하고 분석합니다.',
      icon: '🔍'
    },
    {
      title: 'AI 기반 아이디어 생성',
      description: 'GPT-4를 활용해 92% 정확도로 비즈니스 아이디어를 자동 생성합니다.',
      icon: '🤖'
    },
    {
      title: 'PRD 자동 생성',
      description: 'Mermaid 다이어그램과 함께 완전한 제품 기획서를 원클릭으로 생성합니다.',
      icon: '📋'
    },
    {
      title: '개발자 커뮤니티',
      description: '아이디어 공유, 협업 매칭, 성공 사례를 통해 함께 성장합니다.',
      icon: '👥'
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">핵심 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <LinearCard key={index} className="text-center p-6">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </LinearCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">실시간 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-20 rounded"></div>}>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,200+</div>
              <div className="text-gray-600">수집된 갈증포인트</div>
            </div>
          </Suspense>
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-20 rounded"></div>}>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">850+</div>
              <div className="text-gray-600">생성된 비즈니스 아이디어</div>
            </div>
          </Suspense>
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-20 rounded"></div>}>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <div className="text-gray-600">AI 분석 정확도</div>
            </div>
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function SimpleNavbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            💡 IdeaSpark
          </Link>
          <div className="flex space-x-6">
            <Link href="/auth" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              로그인
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              대시보드
            </Link>
            <Link href="/community" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              커뮤니티
            </Link>
            <Link href="/prd" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              PRD 생성
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <SimpleNavbar />
      
      <LinearHero
        title="아이디어 발굴의 새로운 패러다임"
        subtitle="AI 기반 비즈니스 인텔리전스"
        description="Reddit, SNS, 구글에서 실시간 갈증포인트를 발굴하고, GPT-4로 분석하여 매일 검증된 비즈니스 아이디어를 제공합니다."
        variant="gradient"
        size="xl"
        badge={{
          text: "🚀 BETA 런칭",
          variant: "info",
          icon: "⚡"
        }}
        primaryAction={{
          label: "지금 시작하기",
          href: "/auth",
          icon: "🚀"
        }}
        secondaryAction={{
          label: "데모 보기",
          href: "/dashboard",
          icon: "👁️"
        }}
        features={[
          {
            icon: "🔍",
            title: "실시간 갈증포인트 수집",
            description: "Reddit, LinkedIn 등에서 실시간으로 문제점을 발견하고 분석합니다."
          },
          {
            icon: "🤖",
            title: "AI 기반 아이디어 생성", 
            description: "GPT-4를 활용해 92% 정확도로 비즈니스 아이디어를 자동 생성합니다."
          },
          {
            icon: "📋",
            title: "PRD 자동 생성",
            description: "Mermaid 다이어그램과 함께 완전한 제품 기획서를 원클릭으로 생성합니다."
          }
        ]}
      />
      
      <FeatureCards />
      <StatsSection />
      
      <footer className="py-8 px-4 text-center text-gray-500 border-t bg-gray-50">
        <p>&copy; 2025 IdeaSpark. 실시간 갈증포인트 분석 플랫폼</p>
      </footer>
    </div>
  );
}
