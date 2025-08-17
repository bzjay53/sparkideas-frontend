'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LinearCard, LinearButton } from '@/components/ui';
import CommentSection from '@/components/community/CommentSection';
import { 
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: string;
  };
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  created_at: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  status?: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        // Mock post data - replace with actual API call
        const mockPost: Post = {
          id: postId,
          title: '🚀 AI 쇼핑 추천 앱 MVP 완성! 피드백 구합니다',
          content: `IdeaSpark에서 생성한 PRD를 바탕으로 3주 만에 MVP를 완성했습니다. 

**주요 기능:**
- 개인화된 추천 알고리즘 (머신러닝 기반)
- 실시간 가격 비교 기능
- 사용자 리뷰 분석 및 요약
- 위시리스트 및 알림 기능

**기술 스택:**
- Frontend: React Native (iOS/Android 동시 지원)
- Backend: Node.js + Express + MongoDB
- AI/ML: Python + TensorFlow + 협업 필터링
- Infrastructure: AWS EC2 + S3 + CloudFront

**현재 상태:**
✅ 기본 추천 시스템 구현 완료
✅ 사용자 인증 및 프로필 관리
✅ 상품 검색 및 필터링
🔄 추천 정확도 개선 중 (현재 78%)
🔄 UI/UX 최적화 진행 중

**피드백 요청 사항:**
1. 추천 알고리즘의 정확도를 높일 수 있는 방법
2. 사용자 경험 개선을 위한 UI 제안
3. 마케팅 및 사용자 획득 전략

현재 베타 테스터를 모집하고 있습니다. 관심 있으신 분들은 댓글로 연락 부탁드립니다!

**데모:** https://shopping-ai-demo.vercel.app
**GitHub:** https://github.com/username/shopping-ai-app

많은 피드백 부탁드립니다! 🙏`,
          author: {
            id: 'user_001',
            name: '김개발',
            avatar: '👨‍💻',
            level: 'Maker'
          },
          category: 'showcase',
          tags: ['자랑', 'MVP', 'AI', '쇼핑', 'React Native', 'Machine Learning'],
          likes: 42,
          comments: 18,
          views: 234,
          created_at: '2025-08-16T09:30:00Z',
          isLiked: false,
          isBookmarked: true,
          status: 'hot'
        };

        setTimeout(() => {
          setPost(mockPost);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to load post:', error);
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId]);

  const handleLike = () => {
    if (!post) return;
    
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1
    });
  };

  const handleBookmark = () => {
    if (!post) return;
    
    setPost({
      ...post,
      isBookmarked: !post.isBookmarked
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title,
          text: post?.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const getCategoryInfo = (category: string) => {
    const categories = {
      showcase: { name: '자랑', icon: '🚀', color: 'bg-purple-100 text-purple-800' },
      collaboration: { name: '협업', icon: '🤝', color: 'bg-blue-100 text-blue-800' },
      success: { name: '성공사례', icon: '🏆', color: 'bg-green-100 text-green-800' },
      freelance: { name: '외주', icon: '💼', color: 'bg-orange-100 text-orange-800' },
      discussion: { name: '토론', icon: '💬', color: 'bg-gray-100 text-gray-800' }
    };
    return categories[category as keyof typeof categories] || categories.discussion;
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LinearCard padding="lg" className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 게시글이 삭제되었거나 존재하지 않습니다.</p>
          <Link href="/community">
            <LinearButton variant="primary">
              커뮤니티로 돌아가기
            </LinearButton>
          </Link>
        </LinearCard>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(post.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/community">
            <LinearButton variant="outline" size="sm" className="flex items-center space-x-2">
              <ArrowLeftIcon className="w-4 h-4" />
              <span>커뮤니티로 돌아가기</span>
            </LinearButton>
          </Link>
        </div>

        {/* Post Content */}
        <LinearCard padding="lg" shadow="sm" className="mb-8">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{post.author.avatar}</div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-lg text-gray-900">{post.author.name}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {post.author.level}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>조회 {post.views}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusBadge(post.status)}
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${categoryInfo.color}`}>
                {categoryInfo.icon} {categoryInfo.name}
              </span>
            </div>
          </div>

          {/* Post Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Post Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                #{tag}
              </span>
            ))}
          </div>

          {/* Post Content */}
          <div className="prose max-w-none mb-8">
            <div 
              className="text-gray-700 whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: post.content.replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/✅/g, '<span class="text-green-600">✅</span>')
                  .replace(/🔄/g, '<span class="text-blue-600">🔄</span>')
              }}
            />
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group"
              >
                {post.isLiked ? (
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 group-hover:text-red-500" />
                )}
                <span className="font-medium">{post.likes}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-500">
                <span className="font-medium">{post.comments}개 댓글</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="공유하기"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  post.isBookmarked 
                    ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
                }`}
                title={post.isBookmarked ? '북마크 해제' : '북마크 추가'}
              >
                <BookmarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </LinearCard>

        {/* Comments Section */}
        <CommentSection postId={postId} />
      </div>
    </div>
  );
}