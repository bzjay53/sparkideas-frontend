import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';
import { AppError, ErrorFactory } from '@/lib/error-handler';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  tags: string[];
  category: string;
  likes_count: number;
  comments_count: number;
  project_status: string;
  created_at: string;
  updated_at: string;
}

// GET /api/community/posts - 커뮤니티 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('community_posts')
      .select(`
        id,
        title,
        content,
        user_id,
        tags,
        category,
        likes_count,
        comments_count,
        project_status,
        created_at,
        updated_at,
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 카테고리 필터
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // 검색 필터
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // 태그 필터
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      throw ErrorFactory.database(`Failed to fetch community posts: ${error.message}`);
    }

    // 사용자 정보와 함께 포스트 정보 구성
    const enrichedPosts = posts?.map(post => {
      return {
        ...post,
        author: {
          id: post.user_id,
          name: 'User', // TODO: Implement user name lookup
          avatar: '👤',
          level: 'Member'
        },
        views: Math.floor(Math.random() * 500) + 50, // TODO: Implement real view tracking
        isLiked: false, // TODO: Implement user-specific like status
        isBookmarked: false, // TODO: Implement user-specific bookmark status
        status: getPostStatus(post)
      };
    }) || [];

    return NextResponse.json(createSuccessResponse({
      posts: enrichedPosts,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }));

  } catch (error) {
    console.error('Error fetching community posts:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to fetch community posts', 
      500
    ), { status: 500 });
  }
}

// POST /api/community/posts - 새 게시글 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, tags = [], project_status = 'idea' } = body;

    // 입력 검증
    if (!title || !content || !category) {
      throw ErrorFactory.badRequest('Title, content, and category are required');
    }

    if (title.length < 5 || title.length > 200) {
      throw ErrorFactory.badRequest('Title must be between 5 and 200 characters');
    }

    if (content.length < 20 || content.length > 5000) {
      throw ErrorFactory.badRequest('Content must be between 20 and 5000 characters');
    }

    const validCategories = ['자랑', '공유', '외주', '협업'];
    if (!validCategories.includes(category)) {
      throw ErrorFactory.badRequest(`Category must be one of: ${validCategories.join(', ')}`);
    }

    // TODO: 실제 인증된 사용자 ID를 가져와야 함 (현재는 임시 사용자 ID)
    const userId = body.userId || 'temp-user-' + Date.now();

    const { data: newPost, error } = await supabase
      .from('community_posts')
      .insert({
        title,
        content,
        user_id: userId,
        category,
        tags: Array.isArray(tags) ? tags : [],
        project_status,
        likes_count: 0,
        comments_count: 0
      })
      .select()
      .single();

    if (error) {
      throw ErrorFactory.database(`Failed to create post: ${error.message}`);
    }

    return NextResponse.json(createSuccessResponse({
      post: {
        ...newPost,
        author: {
          id: newPost.user_id,
          name: 'New User', // TODO: Get from user authentication
          avatar: '👤',
          level: 'Member'
        },
        views: 1,
        isLiked: false,
        isBookmarked: false
      }
    }), { status: 201 });

  } catch (error) {
    console.error('Error creating community post:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to create community post', 
      500
    ), { status: 500 });
  }
}

// Helper functions

function getPostStatus(post: CommunityPost): string | undefined {
  const now = new Date();
  const createdAt = new Date(post.created_at);
  const hoursAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (post.likes_count > 50) return 'trending';
  if (hoursAgo < 24 && post.likes_count > 20) return 'hot';
  if (hoursAgo < 6) return 'new';
  
  return undefined;
}