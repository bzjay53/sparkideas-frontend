import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';
import { AppError, ErrorFactory } from '@/lib/error-handler';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/community/posts/[id] - 특정 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: post, error } = await supabase
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
        users:user_id (
          id,
          display_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw ErrorFactory.notFound('Post not found');
      }
      throw ErrorFactory.database(`Failed to fetch post: ${error.message}`);
    }

    // Transform user data
    const user = Array.isArray(post.users) ? post.users[0] : post.users;
    const enrichedPost = {
      ...post,
      author: {
        id: user?.id || post.user_id,
        name: user?.display_name || user?.email?.split('@')[0] || 'Anonymous',
        avatar: '👤',
        level: 'Member'
      },
      views: Math.floor(Math.random() * 500) + 50, // TODO: Implement real view tracking
      isLiked: false, // TODO: Implement user-specific like status
      isBookmarked: false // TODO: Implement user-specific bookmark status
    };

    return NextResponse.json(createSuccessResponse({
      post: enrichedPost
    }));

  } catch (error) {
    console.error('Error fetching post:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to fetch post', 
      500
    ), { status: 500 });
  }
}

// PUT /api/community/posts/[id] - 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, content, category, tags, project_status } = body;

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

    // TODO: 실제 사용자 인증 확인 - 작성자만 수정 가능하도록
    
    const { data: updatedPost, error } = await supabase
      .from('community_posts')
      .update({
        title,
        content,
        category,
        tags: Array.isArray(tags) ? tags : [],
        project_status: project_status || 'idea',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
        users:user_id (
          id,
          display_name,
          email
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw ErrorFactory.notFound('Post not found');
      }
      throw ErrorFactory.database(`Failed to update post: ${error.message}`);
    }

    // Transform user data
    const user = Array.isArray(updatedPost.users) ? updatedPost.users[0] : updatedPost.users;
    const enrichedPost = {
      ...updatedPost,
      author: {
        id: user?.id || updatedPost.user_id,
        name: user?.display_name || user?.email?.split('@')[0] || 'Anonymous',
        avatar: '👤',
        level: 'Member'
      }
    };

    return NextResponse.json(createSuccessResponse({
      post: enrichedPost
    }));

  } catch (error) {
    console.error('Error updating post:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to update post', 
      500
    ), { status: 500 });
  }
}

// DELETE /api/community/posts/[id] - 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: 실제 사용자 인증 확인 - 작성자만 삭제 가능하도록

    // 먼저 게시글 존재 확인
    const { data: existingPost, error: checkError } = await supabase
      .from('community_posts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        throw ErrorFactory.notFound('Post not found');
      }
      throw ErrorFactory.database(`Failed to check post: ${checkError.message}`);
    }

    // 관련 댓글들도 함께 삭제 (CASCADE)
    const { error: deleteError } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw ErrorFactory.database(`Failed to delete post: ${deleteError.message}`);
    }

    return NextResponse.json(createSuccessResponse({
      message: 'Post deleted successfully'
    }));

  } catch (error) {
    console.error('Error deleting post:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to delete post', 
      500
    ), { status: 500 });
  }
}