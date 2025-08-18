'use client';

import { LinearCard, LinearHero } from '@/components/ui';
import { AuthNavbar } from '@/components/navigation/AuthNavbar';
import { RealTimeStats } from '@/components/stats/RealTimeStats';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function FeatureCards() {
  const features = [
    {
      title: '실시간 갈증포인트 수집',
      icon: (
        <svg className="w-8 h-8" style={{ color: 'var(--color-accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: 'AI 기반 아이디어 생성',
      icon: (
        <svg className="w-8 h-8" style={{ color: 'var(--color-accent-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: 'PRD 자동 생성',
      icon: (
        <svg className="w-8 h-8" style={{ color: 'var(--green)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: '개발자 커뮤니티',
      icon: (
        <svg className="w-8 h-8" style={{ color: 'var(--orange)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-background-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--color-text-primary)' }}>핵심 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <LinearCard 
              key={index} 
              variant="interactive" 
              padding="lg"
              className="text-center group"
            >
              <div className="flex justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{feature.title}</h3>
            </LinearCard>
          ))}
        </div>
      </div>
    </section>
  );
}



export default function Home() {
  const { user, loading } = useAuth();

  // 로그인 상태에 따른 버튼 동작 결정
  const getPrimaryAction = () => {
    if (loading) return { label: "로딩 중...", href: "#" };
    
    if (user) {
      return {
        label: "대시보드로 이동",
        href: "/dashboard"
      };
    }
    
    return {
      label: "지금 시작하기",
      href: "/auth"
    };
  };

  const getSecondaryAction = () => {
    if (loading) return undefined;
    
    if (user) {
      return {
        label: "PRD 생성하기",
        href: "/prd"
      };
    }
    
    return {
      label: "데모 보기 (로그인 없이)",
      href: "/dashboard?demo=true"
    };
  };

  return (
    <div className="page-background">
      <AuthNavbar />
      
      <LinearHero
        title="아이디어 발굴의 새로운 패러다임"
        subtitle="AI 기반 비즈니스 인텔리전스"
        description="Reddit, SNS, 구글에서 실시간 갈증포인트를 발굴하고, GPT-4로 분석하여 매일 검증된 비즈니스 아이디어를 제공합니다."
        variant="gradient"
        size="xl"
        badge={{
          text: user ? "환영합니다!" : "BETA",
          variant: user ? "success" : "info"
        }}
        primaryAction={getPrimaryAction()}
        secondaryAction={getSecondaryAction()}
        features={[
          {
            icon: (
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ),
            title: "실시간 갈증포인트 수집"
          },
          {
            icon: (
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ),
            title: "AI 기반 아이디어 생성"
          },
          {
            icon: (
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            title: "PRD 자동 생성"
          }
        ]}
      />
      
      <FeatureCards />
      <RealTimeStats />
      
      <footer className="py-8 px-4 text-center" style={{
        color: 'var(--color-text-tertiary)',
        borderTop: '1px solid var(--color-border-primary)',
        backgroundColor: 'var(--color-background-secondary)'
      }}>
        <p>&copy; 2025 IdeaSpark. 실시간 코더들을 위한 아이디어 제공</p>
      </footer>
    </div>
  );
}
