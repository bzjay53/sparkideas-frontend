'use client';

import { useState, useEffect } from 'react';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TagIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  duration: string;
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  remote: boolean;
  location?: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: string;
    rating: number;
  };
  requirements: string[];
  applications: number;
  likes: number;
  isLiked: boolean;
  isApplied: boolean;
  created_at: string;
  deadline?: string;
  status: 'open' | 'in_progress' | 'completed' | 'paused';
}

interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  level: string;
  rating: number;
  skills: string[];
  hourlyRate: string;
  availability: string;
  location: string;
  remote: boolean;
  completedProjects: number;
  description: string;
  isAvailable: boolean;
  portfolio: string[];
  languages: string[];
}

export default function ProjectMatchingPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'freelancers'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock projects data
        const mockProjects: Project[] = [
          {
            id: 'project_001',
            title: '🛍️ 이커머스 모바일 앱 개발 프로젝트',
            description: 'React Native를 사용한 크로스플랫폼 쇼핑 앱 개발. 결제 시스템, 상품 관리, 사용자 리뷰 기능이 포함됩니다. 기존 웹사이트와 API 연동이 필요합니다.',
            category: 'mobile',
            budget: '₩300-500만',
            duration: '3개월',
            skills: ['React Native', 'TypeScript', 'Node.js', 'MongoDB'],
            difficulty: 'Intermediate',
            remote: true,
            location: '서울, 대한민국',
            author: {
              id: 'client_001',
              name: '김사장',
              avatar: '👔',
              level: 'Business',
              rating: 4.8
            },
            requirements: [
              '3년 이상의 React Native 개발 경험',
              '이커머스 앱 개발 경험 우대',
              '결제 시스템 연동 경험',
              '영어 의사소통 가능'
            ],
            applications: 12,
            likes: 28,
            isLiked: false,
            isApplied: false,
            created_at: '2025-08-15T10:00:00Z',
            deadline: '2025-08-25T23:59:59Z',
            status: 'open'
          },
          {
            id: 'project_002',
            title: '🤖 AI 챗봇 시스템 구축',
            description: 'GPT-4 기반 고객 서비스 챗봇 개발. 기존 CRM 시스템과 연동하여 실시간 고객 지원이 가능한 시스템 구축이 목표입니다.',
            category: 'ai',
            budget: '₩200-400만',
            duration: '2개월',
            skills: ['Python', 'FastAPI', 'OpenAI API', 'PostgreSQL'],
            difficulty: 'Advanced',
            remote: true,
            author: {
              id: 'client_002',
              name: '박매니저',
              avatar: '👩‍💼',
              level: 'Manager',
              rating: 4.9
            },
            requirements: [
              'OpenAI API 활용 경험',
              'Python 웹 프레임워크 숙련',
              'DB 설계 및 최적화 경험',
              'AI/ML 프로젝트 경험 우대'
            ],
            applications: 8,
            likes: 35,
            isLiked: true,
            isApplied: false,
            created_at: '2025-08-14T14:30:00Z',
            deadline: '2025-08-22T23:59:59Z',
            status: 'open'
          },
          {
            id: 'project_003',
            title: '📊 데이터 분석 대시보드 제작',
            description: '영업 데이터 시각화 및 분석을 위한 웹 대시보드 개발. 실시간 차트, 필터링, 리포트 생성 기능이 필요합니다.',
            category: 'data',
            budget: '₩150-250만',
            duration: '6주',
            skills: ['React', 'D3.js', 'Python', 'Pandas'],
            difficulty: 'Intermediate',
            remote: false,
            location: '부산, 대한민국',
            author: {
              id: 'client_003',
              name: '이분석가',
              avatar: '📈',
              level: 'Analyst',
              rating: 4.7
            },
            requirements: [
              'React 또는 Vue.js 경험',
              '데이터 시각화 라이브러리 경험',
              '통계 및 데이터 분석 이해',
              '부산 지역 거주자 우대'
            ],
            applications: 15,
            likes: 22,
            isLiked: false,
            isApplied: true,
            created_at: '2025-08-13T09:15:00Z',
            deadline: '2025-08-20T23:59:59Z',
            status: 'open'
          }
        ];

        // Mock freelancers data
        const mockFreelancers: Freelancer[] = [
          {
            id: 'freelancer_001',
            name: '최개발',
            title: 'Full-Stack 개발자',
            avatar: '👨‍💻',
            level: 'Expert',
            rating: 4.9,
            skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
            hourlyRate: '₩50,000/시간',
            availability: '즉시 가능',
            location: '서울, 대한민국',
            remote: true,
            completedProjects: 47,
            description: '5년 경력의 풀스택 개발자입니다. 스타트업부터 대기업까지 다양한 프로젝트 경험이 있으며, 특히 React와 Node.js를 활용한 웹 애플리케이션 개발에 강점이 있습니다.',
            isAvailable: true,
            portfolio: ['https://portfolio1.com', 'https://project2.com'],
            languages: ['한국어', '영어']
          },
          {
            id: 'freelancer_002',
            name: '박디자이너',
            title: 'UI/UX 디자이너',
            avatar: '🎨',
            level: 'Professional',
            rating: 4.8,
            skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
            hourlyRate: '₩40,000/시간',
            availability: '2주 후',
            location: '부산, 대한민국',
            remote: true,
            completedProjects: 32,
            description: '사용자 중심의 디자인을 추구하는 UI/UX 디자이너입니다. 모바일 앱과 웹 서비스 디자인에 특화되어 있으며, 사용성 테스트와 데이터 기반 디자인 결정을 중요하게 생각합니다.',
            isAvailable: false,
            portfolio: ['https://behance.net/designer', 'https://dribbble.com/designer'],
            languages: ['한국어', '영어', '일본어']
          },
          {
            id: 'freelancer_003',
            name: '정데이터',
            title: 'AI/ML 엔지니어',
            avatar: '🤖',
            level: 'Expert',
            rating: 4.9,
            skills: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI API', 'Data Science'],
            hourlyRate: '₩60,000/시간',
            availability: '1주 후',
            location: '대전, 대한민국',
            remote: true,
            completedProjects: 23,
            description: '7년 경력의 AI/ML 엔지니어입니다. 자연어 처리, 컴퓨터 비전, 추천 시스템 개발 경험이 풍부하며, 최신 AI 기술을 비즈니스에 적용하는 것을 전문으로 합니다.',
            isAvailable: true,
            portfolio: ['https://github.com/ai-engineer', 'https://kaggle.com/expert'],
            languages: ['한국어', '영어']
          }
        ];

        setTimeout(() => {
          setProjects(mockProjects);
          setFreelancers(mockFreelancers);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to load matching data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const categories = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'web', name: '웹 개발', icon: '🌐' },
    { id: 'mobile', name: '모바일', icon: '📱' },
    { id: 'ai', name: 'AI/ML', icon: '🤖' },
    { id: 'data', name: '데이터', icon: '📊' },
    { id: 'design', name: '디자인', icon: '🎨' },
    { id: 'devops', name: 'DevOps', icon: '⚙️' }
  ];

  const allSkills = [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript',
    'React Native', 'Flutter', 'iOS', 'Android', 'PHP', 'Laravel', 'Django',
    'AI/ML', 'TensorFlow', 'PyTorch', 'OpenAI API', 'Data Science',
    'Figma', 'Adobe XD', 'Sketch', 'UI/UX', 'Prototyping',
    'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps'
  ];

  const handleLikeProject = (projectId: string) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            isLiked: !project.isLiked,
            likes: project.isLiked ? project.likes - 1 : project.likes + 1
          }
        : project
    ));
  };

  const handleApplyProject = (projectId: string) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            isApplied: !project.isApplied,
            applications: project.isApplied ? project.applications - 1 : project.applications + 1
          }
        : project
    ));
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => project.skills.includes(skill));
    
    return matchesSearch && matchesCategory && matchesSkills;
  });

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => freelancer.skills.includes(skill));
    
    return matchesSearch && matchesSkills;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">매칭 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                🤝 프로젝트 매칭
              </h1>
              <p className="text-gray-600 mt-2">
                프로젝트와 프리랜서를 연결하는 스마트 매칭 플랫폼
              </p>
            </div>
            
            <LinearButton variant="primary" size="lg" className="flex items-center space-x-2">
              <span>프로젝트 등록</span>
            </LinearButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-3 px-6 rounded-md text-center font-medium transition-colors ${
              activeTab === 'projects'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💼 프로젝트 찾기 ({filteredProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('freelancers')}
            className={`flex-1 py-3 px-6 rounded-md text-center font-medium transition-colors ${
              activeTab === 'freelancers'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 프리랜서 찾기 ({filteredFreelancers.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            {/* Search */}
            <LinearCard padding="lg" shadow="sm" className="mb-6">
              <h3 className="text-lg font-semibold mb-4">🔍 검색</h3>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <LinearInput
                  type="text"
                  placeholder="프로젝트, 스킬, 키워드..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </LinearCard>

            {/* Categories */}
            {activeTab === 'projects' && (
              <LinearCard padding="lg" shadow="sm" className="mb-6">
                <h3 className="text-lg font-semibold mb-4">📂 카테고리</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </LinearCard>
            )}

            {/* Skills Filter */}
            <LinearCard padding="lg" shadow="sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🛠️ 스킬</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <FunnelIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {showFilters && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allSkills.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkillFilter(skill)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {selectedSkills.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {skill}
                        <button
                          onClick={() => toggleSkillFilter(skill)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedSkills([])}
                    className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                  >
                    모두 해제
                  </button>
                </div>
              )}
            </LinearCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'projects' ? (
              /* Projects List */
              <div className="space-y-6">
                {filteredProjects.length === 0 ? (
                  <LinearCard padding="lg" className="text-center">
                    <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      검색 조건에 맞는 프로젝트가 없습니다
                    </h3>
                    <p className="text-gray-600">
                      다른 검색어나 필터를 시도해보세요.
                    </p>
                  </LinearCard>
                ) : (
                  filteredProjects.map((project) => (
                    <LinearCard key={project.id} padding="lg" shadow="sm" className="hover:shadow-md transition-shadow">
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{project.author.avatar}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{project.author.name}</span>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {project.author.level}
                              </span>
                              <div className="flex items-center space-x-1">
                                <StarIcon className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-gray-600">{project.author.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(project.created_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(project.difficulty)}`}>
                            {project.difficulty}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                            {project.status === 'open' ? '모집중' : project.status}
                          </span>
                        </div>
                      </div>

                      {/* Project Title and Description */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                        {project.title}
                      </h3>
                      
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      {/* Project Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span>{project.budget}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>{project.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{project.remote ? '원격' : project.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{project.applications}명 지원</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLikeProject(project.id)}
                            className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            {project.isLiked ? (
                              <HeartSolidIcon className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartIcon className="w-5 h-5" />
                            )}
                            <span className="text-sm">{project.likes}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                            <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                            <span className="text-sm">문의하기</span>
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <LinearButton
                            variant="outline"
                            size="sm"
                          >
                            자세히 보기
                          </LinearButton>
                          <LinearButton
                            variant={project.isApplied ? "outline" : "primary"}
                            size="sm"
                            onClick={() => handleApplyProject(project.id)}
                          >
                            {project.isApplied ? '지원 취소' : '지원하기'}
                          </LinearButton>
                        </div>
                      </div>
                    </LinearCard>
                  ))
                )}
              </div>
            ) : (
              /* Freelancers List */
              <div className="space-y-6">
                {filteredFreelancers.length === 0 ? (
                  <LinearCard padding="lg" className="text-center">
                    <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      검색 조건에 맞는 프리랜서가 없습니다
                    </h3>
                    <p className="text-gray-600">
                      다른 검색어나 필터를 시도해보세요.
                    </p>
                  </LinearCard>
                ) : (
                  filteredFreelancers.map((freelancer) => (
                    <LinearCard key={freelancer.id} padding="lg" shadow="sm" className="hover:shadow-md transition-shadow">
                      {/* Freelancer Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{freelancer.avatar}</div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-xl font-semibold text-gray-900">{freelancer.name}</h3>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {freelancer.level}
                              </span>
                              {freelancer.isAvailable ? (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  작업 가능
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                  예약중
                                </span>
                              )}
                            </div>
                            <p className="text-lg text-gray-700 mb-1">{freelancer.title}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <StarIcon className="w-4 h-4 text-yellow-500" />
                                <span>{freelancer.rating} ({freelancer.completedProjects}개 프로젝트)</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CurrencyDollarIcon className="w-4 h-4" />
                                <span>{freelancer.hourlyRate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 mb-4">
                        {freelancer.description}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>{freelancer.availability}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{freelancer.remote ? '원격 작업' : freelancer.location}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          언어: {freelancer.languages.join(', ')}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {freelancer.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                            <span className="text-sm">포트폴리오 보기</span>
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <LinearButton
                            variant="outline"
                            size="sm"
                          >
                            프로필 보기
                          </LinearButton>
                          <LinearButton
                            variant="primary"
                            size="sm"
                          >
                            채팅하기
                          </LinearButton>
                        </div>
                      </div>
                    </LinearCard>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}