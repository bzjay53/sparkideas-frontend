'use client';

import { useState, useEffect } from 'react';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  BookmarkIcon,
  UserGroupIcon,
  TagIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    level: string;
  };
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  created_at: string;
  category: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  status?: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');

  // 실제 API에서 커뮤니티 게시글 로드
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      if (selectedTag) {
        params.set('tag', selectedTag);
      }
      params.set('limit', '20');

      const response = await fetch(`/api/community/posts?${params}`);
      const result = await response.json();

      if (result.success && result.data?.posts) {
        // API 응답을 frontend 형태로 변환
        const transformedPosts: Post[] = result.data.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          author: post.author,
          tags: post.tags || [],
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          views: post.views || 0,
          created_at: post.created_at,
          category: post.category,
          isLiked: post.isLiked || false,
          isBookmarked: post.isBookmarked || false,
          status: post.status
        }));

        setPosts(transformedPosts);
      } else {
        console.error('Failed to fetch posts:', result.error);
        // Fallback to empty state
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching community posts:', error);
      // Fallback to empty state
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, selectedTag]); // searchQuery는 제외하여 타이핑 중 불필요한 요청 방지

  // 검색 쿼리 변경 시 디바운스 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchPosts();
      } else if (searchQuery === '' && posts.length === 0) {
        fetchPosts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categories = [
    { id: 'all', name: '전체', icon: '📋', count: posts.length },
    { id: '자랑', name: '자랑', icon: '🚀', count: posts.filter(p => p.category === '자랑').length },
    { id: '협업', name: '협업', icon: '🤝', count: posts.filter(p => p.category === '협업').length },
    { id: '외주', name: '외주', icon: '💼', count: posts.filter(p => p.category === '외주').length },
    { id: '공유', name: '공유', icon: '💬', count: posts.filter(p => p.category === '공유').length }
  ];

  const popularTags = ['협업', '자랑', 'AI', 'SaaS', '외주', '모바일', 'B2B', '성공사례'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesTag = !selectedTag || post.tags.some(tag => tag.includes(selectedTag));
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const badges = {
      hot: { bg: 'bg-red-100', text: 'text-red-800', label: '🔥 HOT' },
      trending: { bg: 'bg-orange-100', text: 'text-orange-800', label: '📈 TRENDING' },
      new: { bg: 'bg-green-100', text: 'text-green-800', label: '✨ NEW' }
    };
    
    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">커뮤니티 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Logo - 메인으로 이동 */}
                <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">IdeaSpark</span>
                </a>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    🌟 개발자 커뮤니티
                  </h1>
                  <p className="text-gray-600 mt-1">
                    아이디어를 공유하고, 협업하고, 성공 사례를 나누는 공간
                  </p>
                </div>
              </div>
            
            <LinearButton 
              variant="primary" 
              size="lg" 
              className="flex items-center space-x-2"
              onClick={() => window.location.href = '/community/create'}
            >
              <PlusIcon className="w-5 h-5" />
              <span>글쓰기</span>
            </LinearButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <LinearCard padding="lg" shadow="sm" className="mb-6">
              <h3 className="text-lg font-semibold mb-4">📂 카테고리</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </LinearCard>

            {/* Popular Tags */}
            <LinearCard padding="lg" shadow="sm" className="mb-6">
              <h3 className="text-lg font-semibold mb-4">🏷️ 인기 태그</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTag === tag
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </LinearCard>

            {/* Community Stats */}
            <LinearCard padding="lg" shadow="sm">
              <h3 className="text-lg font-semibold mb-4">📊 커뮤니티 현황</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">총 멤버</span>
                  <span className="font-semibold">1,247명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">오늘 활성</span>
                  <span className="font-semibold">89명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 게시글</span>
                  <span className="font-semibold">342개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">성공 프로젝트</span>
                  <span className="font-semibold text-green-600">28개</span>
                </div>
              </div>
            </LinearCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <LinearCard padding="lg" shadow="sm" className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <LinearInput
                    type="text"
                    placeholder="제목이나 내용으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="latest">최신순</option>
                    <option value="popular">인기순</option>
                    <option value="comments">댓글순</option>
                  </select>
                </div>
              </div>
            </LinearCard>

            {/* Posts */}
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <LinearCard padding="lg" className="text-center">
                  <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || selectedTag ? '검색 결과가 없습니다' : '아직 게시글이 없습니다'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || selectedTag 
                      ? '다른 키워드로 검색해보세요.'
                      : '첫 번째 게시글을 작성해보세요!'
                    }
                  </p>
                  <LinearButton 
                    variant="primary"
                    onClick={() => window.location.href = '/community/create'}
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    글쓰기
                  </LinearButton>
                </LinearCard>
              ) : (
                filteredPosts.map((post) => (
                  <LinearCard key={post.id} padding="lg" shadow="sm" className="hover:shadow-md transition-shadow">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{post.author.avatar}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{post.author.name}</span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {post.author.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString('ko-KR')} · 조회 {post.views}
                          </p>
                        </div>
                      </div>
                      
                      {getStatusBadge(post.status)}
                    </div>

                    {/* Post Title and Content */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors"
                          onClick={() => setSelectedTag(tag)}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          {post.isLiked ? (
                            <HeartSolidIcon className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                          <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`p-2 rounded-full transition-colors ${
                          post.isBookmarked 
                            ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
                        }`}
                      >
                        <BookmarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </LinearCard>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}