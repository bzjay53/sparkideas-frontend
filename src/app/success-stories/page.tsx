'use client';

import { useState, useEffect } from 'react';
import { LinearCard, LinearButton } from '@/components/ui';
import { 
  TrophyIcon,
  StarIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  LinkIcon,
  EyeIcon,
  HeartIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface SuccessStory {
  id: string;
  title: string;
  description: string;
  summary: string;
  category: string;
  industry: string;
  founder: {
    name: string;
    avatar: string;
    title: string;
    company: string;
  };
  metrics: {
    revenue: string;
    users: string;
    growth: string;
    funding?: string;
  };
  tags: string[];
  timeline: string;
  tools_used: string[];
  lessons_learned: string[];
  advice: string;
  links: {
    website?: string;
    case_study?: string;
    demo?: string;
  };
  featured: boolean;
  views: number;
  likes: number;
  isLiked: boolean;
  created_at: string;
  updated_at: string;
}

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  useEffect(() => {
    const loadSuccessStories = async () => {
      try {
        // Mock success stories data
        const mockStories: SuccessStory[] = [
          {
            id: 'story_001',
            title: '🚀 B2B SaaS로 월 MRR $12k 달성한 팀 협업 도구',
            description: 'IdeaSpark PRD를 바탕으로 시작한 팀 협업 도구가 6개월 만에 월 $12k MRR을 달성하고, 현재 200+ 기업이 사용하는 성공 스토리입니다.',
            summary: '개발팀의 갈증포인트를 해결하는 협업 도구로 시작하여 PMF를 찾고 빠른 성장을 이룬 사례',
            category: 'saas',
            industry: 'software',
            founder: {
              name: '박창업',
              avatar: '🚀',
              title: 'CEO & Founder',
              company: 'TeamSync'
            },
            metrics: {
              revenue: '$12,000 MRR',
              users: '200+ 기업, 5,000+ 사용자',
              growth: '월 35% 성장',
              funding: 'Pre-Seed $500k'
            },
            tags: ['B2B', 'SaaS', 'PMF', '팀협업', '빠른성장'],
            timeline: '6개월 (아이디어 → PMF)',
            tools_used: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Stripe'],
            lessons_learned: [
              '초기 사용자 피드백에 빠르게 대응하는 것이 PMF 달성의 핵심',
              'MVP 단계에서 과도한 기능보다는 핵심 문제 해결에 집중',
              '고객 인터뷰를 통한 실제 갈증포인트 발굴이 가장 중요',
              'Freemium 모델보다는 유료 고객 확보에 우선 집중'
            ],
            advice: '너무 많은 기능을 넣으려 하지 마세요. 하나의 문제를 명확히 해결하는 것이 성공의 열쇠입니다. 그리고 고객의 목소리에 귀 기울이세요.',
            links: {
              website: 'https://teamsync.io',
              case_study: 'https://teamsync.io/case-study',
              demo: 'https://demo.teamsync.io'
            },
            featured: true,
            views: 1247,
            likes: 89,
            isLiked: false,
            created_at: '2025-08-14T11:15:00Z',
            updated_at: '2025-08-16T09:30:00Z'
          },
          {
            id: 'story_002',
            title: '🛍️ AI 쇼핑 추천 앱으로 시드 투자 $1M 유치',
            description: 'IdeaSpark에서 생성한 PRD로 시작한 AI 기반 개인화 쇼핑 추천 앱이 3개월 만에 10만 사용자를 확보하고 시드 투자를 유치한 사례입니다.',
            summary: 'AI 기술을 활용한 개인화 추천 서비스로 빠른 사용자 증가와 투자 유치를 달성',
            category: 'mobile',
            industry: 'ecommerce',
            founder: {
              name: '김AI',
              avatar: '🤖',
              title: 'CTO & Co-founder',
              company: 'ShopAI'
            },
            metrics: {
              revenue: '$50k ARR',
              users: '100,000+ 다운로드',
              growth: '주 15% 사용자 증가',
              funding: 'Seed $1M'
            },
            tags: ['AI/ML', '모바일앱', 'E-commerce', '추천시스템', '투자유치'],
            timeline: '8개월 (아이디어 → 시드투자)',
            tools_used: ['React Native', 'Python', 'TensorFlow', 'FastAPI', 'GCP'],
            lessons_learned: [
              'AI 기술보다는 사용자 경험이 더 중요함을 깨달음',
              '추천 정확도보다는 사용자가 체감하는 가치가 핵심',
              '초기 투자자들은 기술보다는 트랙션을 더 중요하게 봄',
              '팀워크와 실행력이 아이디어보다 중요'
            ],
            advice: '기술에만 매몰되지 말고 사용자가 정말 원하는 것이 무엇인지 끊임없이 질문하세요. 그리고 빠르게 시도하고 검증하는 것을 두려워하지 마세요.',
            links: {
              website: 'https://shopai.app',
              demo: 'https://demo.shopai.app'
            },
            featured: true,
            views: 892,
            likes: 67,
            isLiked: true,
            created_at: '2025-08-12T14:20:00Z',
            updated_at: '2025-08-15T16:45:00Z'
          },
          {
            id: 'story_003',
            title: '📊 데이터 분석 SaaS로 연 매출 $500k 달성',
            description: '작은 기업들을 위한 간단한 데이터 분석 도구로 시작하여 현재 1,000+ 고객사를 보유하고 연 매출 $500k를 달성한 성공 사례입니다.',
            summary: 'No-code 데이터 분석 도구로 중소기업 시장에서 안정적인 성장을 이룬 사례',
            category: 'saas',
            industry: 'analytics',
            founder: {
              name: '이분석',
              avatar: '📈',
              title: 'CEO',
              company: 'DataSimple'
            },
            metrics: {
              revenue: '$500k ARR',
              users: '1,000+ 기업',
              growth: '월 8% 안정 성장',
              funding: 'Bootstrap (자체 자금)'
            },
            tags: ['B2B', 'SaaS', 'No-code', '데이터분석', 'Bootstrap'],
            timeline: '18개월 (아이디어 → 수익화)',
            tools_used: ['Vue.js', 'Django', 'PostgreSQL', 'D3.js', 'Heroku'],
            lessons_learned: [
              '복잡한 기능보다는 사용하기 쉬운 인터페이스가 승부',
              '중소기업 고객은 가격에 민감하지만 가치를 인정하면 충성도가 높음',
              '입소문과 추천이 가장 효과적인 마케팅 채널',
              '안정적인 성장이 폭발적 성장보다 지속가능함'
            ],
            advice: '무리하게 벤처캐피털을 찾지 말고 고객이 돈을 내고 살 제품을 만드는 데 집중하세요. 작은 성공부터 쌓아가는 것이 중요합니다.',
            links: {
              website: 'https://datasimple.io',
              case_study: 'https://datasimple.io/success-story'
            },
            featured: false,
            views: 623,
            likes: 45,
            isLiked: false,
            created_at: '2025-08-10T09:30:00Z',
            updated_at: '2025-08-13T11:20:00Z'
          },
          {
            id: 'story_004',
            title: '🎯 니치 마켓 공략으로 월 $30k 달성한 법률 SaaS',
            description: '변호사들을 위한 전문 업무 관리 도구로 시작하여 니치 마켓에서 성공을 거둔 사례입니다. 현재 300+ 법무법인이 사용하고 있습니다.',
            summary: '전문직 대상 니치 SaaS로 높은 객단가와 낮은 이탈률을 달성한 성공 사례',
            category: 'saas',
            industry: 'legal',
            founder: {
              name: '정법무',
              avatar: '⚖️',
              title: 'Founder',
              company: 'LegalFlow'
            },
            metrics: {
              revenue: '$30k MRR',
              users: '300+ 법무법인',
              growth: '월 12% 성장',
              funding: 'Angel $200k'
            },
            tags: ['B2B', 'SaaS', '니치마켓', 'LegalTech', '전문직'],
            timeline: '12개월 (아이디어 → 수익화)',
            tools_used: ['Angular', 'ASP.NET', 'SQL Server', 'Azure', 'DocuSign API'],
            lessons_learned: [
              '니치 마켓이지만 고객의 지불 의향이 높아 수익성이 좋음',
              '전문직 고객은 기능보다는 신뢰성과 보안을 중시',
              '도메인 전문성이 경쟁 우위의 핵심',
              '고객 지원과 교육이 매우 중요'
            ],
            advice: '큰 시장을 노리기보다는 작지만 확실한 니치 마켓을 찾아 깊이 파고드세요. 전문성이 있다면 그것을 최대한 활용하세요.',
            links: {
              website: 'https://legalflow.pro'
            },
            featured: false,
            views: 456,
            likes: 32,
            isLiked: false,
            created_at: '2025-08-08T15:45:00Z',
            updated_at: '2025-08-11T10:15:00Z'
          }
        ];

        setTimeout(() => {
          setStories(mockStories);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to load success stories:', error);
        setLoading(false);
      }
    };

    loadSuccessStories();
  }, []);

  const categories = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'saas', name: 'B2B SaaS', icon: '💼' },
    { id: 'mobile', name: '모바일 앱', icon: '📱' },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛍️' },
    { id: 'fintech', name: 'FinTech', icon: '💳' },
    { id: 'healthtech', name: 'HealthTech', icon: '🏥' },
    { id: 'edtech', name: 'EdTech', icon: '📚' }
  ];

  const industries = [
    { id: 'all', name: '전체 산업' },
    { id: 'software', name: '소프트웨어' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'analytics', name: '데이터 분석' },
    { id: 'legal', name: '법률' },
    { id: 'healthcare', name: '헬스케어' },
    { id: 'finance', name: '금융' },
    { id: 'education', name: '교육' }
  ];

  const handleLike = (storyId: string) => {
    setStories(stories.map(story => 
      story.id === storyId 
        ? { 
            ...story, 
            isLiked: !story.isLiked,
            likes: story.isLiked ? story.likes - 1 : story.likes + 1
          }
        : story
    ));
  };

  const filteredStories = stories.filter(story => {
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'all' || story.industry === selectedIndustry;
    return matchesCategory && matchesIndustry;
  });

  const featuredStories = filteredStories.filter(story => story.featured);
  const regularStories = filteredStories.filter(story => !story.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">성공 사례를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center mb-4">
              🏆 성공 사례
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              IdeaSpark에서 시작된 아이디어들이 어떻게 성공적인 비즈니스로 성장했는지 살펴보세요.
              실제 창업자들의 경험과 노하우를 공유합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Category Filter */}
          <LinearCard padding="lg" shadow="sm">
            <h3 className="text-lg font-semibold mb-4">📂 카테고리</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="font-medium text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </LinearCard>

          {/* Industry Filter */}
          <LinearCard padding="lg" shadow="sm">
            <h3 className="text-lg font-semibold mb-4">🏭 산업 분야</h3>
            <div className="grid grid-cols-2 gap-2">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedIndustry === industry.id
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="font-medium text-sm">{industry.name}</span>
                </button>
              ))}
            </div>
          </LinearCard>
        </div>

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <TrophyIcon className="w-6 h-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">추천 성공 사례</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredStories.map((story) => (
                <LinearCard key={story.id} padding="lg" shadow="md" className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                  {/* Featured Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      ⭐ 추천 스토리
                    </span>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>{story.views}</span>
                      </div>
                      <button
                        onClick={() => handleLike(story.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <HeartIcon className={`w-4 h-4 ${story.isLiked ? 'text-red-500 fill-current' : ''}`} />
                        <span>{story.likes}</span>
                      </button>
                    </div>
                  </div>

                  {/* Founder Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">{story.founder.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{story.founder.name}</div>
                      <div className="text-sm text-gray-600">{story.founder.title}, {story.founder.company}</div>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                    {story.title}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {story.summary}
                  </p>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-lg font-bold text-green-600">{story.metrics.revenue}</div>
                      <div className="text-xs text-gray-600">월 매출</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-lg font-bold text-blue-600">{story.metrics.users.split(',')[0]}</div>
                      <div className="text-xs text-gray-600">고객사</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.tags.slice(0, 4).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-white text-gray-700 rounded-full border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action */}
                  <LinearButton variant="primary" className="w-full">
                    자세한 스토리 보기
                  </LinearButton>
                </LinearCard>
              ))}
            </div>
          </div>
        )}

        {/* All Stories */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              모든 성공 사례 ({filteredStories.length})
            </h2>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="revenue">매출순</option>
            </select>
          </div>

          {filteredStories.length === 0 ? (
            <LinearCard padding="lg" className="text-center">
              <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                검색 조건에 맞는 성공 사례가 없습니다
              </h3>
              <p className="text-gray-600">
                다른 카테고리나 산업 분야를 선택해보세요.
              </p>
            </LinearCard>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {regularStories.map((story) => (
                <LinearCard key={story.id} padding="lg" shadow="sm" className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                    {/* Story Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-xl">{story.founder.avatar}</div>
                          <div>
                            <div className="font-semibold text-gray-900">{story.founder.name}</div>
                            <div className="text-sm text-gray-600">{story.founder.company}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>{story.timeline}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <EyeIcon className="w-4 h-4" />
                            <span>{story.views}</span>
                          </div>
                        </div>
                      </div>

                      {/* Title and Description */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        {story.title}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        {story.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {story.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLike(story.id)}
                            className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <HeartIcon className={`w-5 h-5 ${story.isLiked ? 'text-red-500 fill-current' : ''}`} />
                            <span className="text-sm">{story.likes}</span>
                          </button>
                          
                          {story.links.website && (
                            <a
                              href={story.links.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                            >
                              <LinkIcon className="w-5 h-5" />
                              <span className="text-sm">웹사이트</span>
                            </a>
                          )}
                        </div>
                        
                        <LinearButton variant="outline" size="sm">
                          전체 스토리 보기
                        </LinearButton>
                      </div>
                    </div>

                    {/* Metrics Sidebar */}
                    <div className="w-full lg:w-64 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">📊 핵심 지표</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">매출</span>
                          <span className="text-sm font-medium text-green-600">{story.metrics.revenue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">사용자</span>
                          <span className="text-sm font-medium text-blue-600">{story.metrics.users.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">성장률</span>
                          <span className="text-sm font-medium text-purple-600">{story.metrics.growth}</span>
                        </div>
                        {story.metrics.funding && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">투자</span>
                            <span className="text-sm font-medium text-orange-600">{story.metrics.funding}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </LinearCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}