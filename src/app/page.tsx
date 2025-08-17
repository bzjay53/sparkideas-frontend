import Link from 'next/link';
import { LinearButton, LinearCard } from '@/components/ui';
import { Suspense } from 'react';

function HeroSection() {
  return (
    <section className="py-20 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          IdeaSpark v2.0
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          실시간 갈증포인트 발굴 → AI 분석 → 커뮤니티 협업
        </p>
        <p className="text-lg text-gray-500 mb-8">
          매일 오전 9시 텔레그램으로 5가지 검증된 비즈니스 제안서를 받아보세요
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/dashboard">
            <LinearButton variant="primary" size="lg">
              대시보드 보기
            </LinearButton>
          </Link>
          <Link href="/community">
            <LinearButton variant="secondary" size="lg">
              커뮤니티 참여
            </LinearButton>
          </Link>
        </div>
      </div>
    </section>
  );
}

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
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            IdeaSpark v2.0
          </Link>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              대시보드
            </Link>
            <Link href="/community" className="text-gray-600 hover:text-blue-600">
              커뮤니티
            </Link>
            <Link href="/prd" className="text-gray-600 hover:text-blue-600">
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
      <HeroSection />
      <FeatureCards />
      <StatsSection />
      
      <footer className="py-8 px-4 text-center text-gray-500 border-t">
        <p>&copy; 2025 IdeaSpark v2.0. 실시간 갈증포인트 분석 플랫폼</p>
      </footer>
    </div>
  );
}
