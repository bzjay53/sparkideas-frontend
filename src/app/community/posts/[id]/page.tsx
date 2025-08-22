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
  ArrowLeftIcon,
  PencilIcon,
  EllipsisVerticalIcon
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
        setLoading(true);
        
        const response = await fetch(`/api/community/posts/${postId}`);
        const result = await response.json();

        if (result.success && result.data?.post) {
          const apiPost = result.data.post;
          
          // API 응답을 frontend 형태로 변환
          const transformedPost: Post = {
            id: apiPost.id,
            title: apiPost.title,
            content: apiPost.content,
            author: apiPost.author,
            category: apiPost.category,
            tags: apiPost.tags || [],
            likes: apiPost.likes_count || 0,
            comments: apiPost.comments_count || 0,
            views: apiPost.views || 0,
            created_at: apiPost.created_at,
            isLiked: apiPost.isLiked || false,
            isBookmarked: apiPost.isBookmarked || false,
            status: apiPost.status
          };

          setPost(transformedPost);
        } else {
          console.error('Failed to load post:', result.error);
          setPost(null);
        }
      } catch (error) {
        console.error('Failed to load post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    
    try {
      const action = post.isLiked ? 'unlike' : 'like';
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'temp-user-id', // TODO: Get actual user ID from auth
          action
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setPost({
          ...post,
          isLiked: result.data.isLiked,
          likes: result.data.likesCount
        });
      } else {
        console.error('Failed to toggle like:', result.error);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!post) return;
    
    try {
      const action = post.isBookmarked ? 'unbookmark' : 'bookmark';
      const response = await fetch(`/api/community/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'temp-user-id', // TODO: Get actual user ID from auth
          action
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setPost({
          ...post,
          isBookmarked: result.data.isBookmarked
        });
      } else {
        console.error('Failed to toggle bookmark:', result.error);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
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
              
              {/* TODO: 작성자만 보이도록 권한 체크 */}
              <div className="relative group">
                <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <Link href={`/community/posts/${post.id}/edit`}>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <PencilIcon className="w-4 h-4" />
                      <span>수정하기</span>
                    </button>
                  </Link>
                </div>
              </div>
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