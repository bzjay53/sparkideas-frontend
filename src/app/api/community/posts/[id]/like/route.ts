import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';
import { AppError, ErrorFactory } from '@/lib/error-handler';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/community/posts/[id]/like - 게시글 좋아요/취소
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, action } = body; // action: 'like' | 'unlike'

    if (!userId) {
      throw ErrorFactory.badRequest('User ID is required');
    }

    if (!['like', 'unlike'].includes(action)) {
      throw ErrorFactory.badRequest('Action must be either "like" or "unlike"');
    }

    // 게시글 존재 확인
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id, likes_count')
      .eq('id', id)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        throw ErrorFactory.notFound('Post not found');
      }
      throw ErrorFactory.database(`Failed to fetch post: ${postError.message}`);
    }

    if (action === 'like') {
      // 중복 좋아요 확인
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        return NextResponse.json(createSuccessResponse({
          message: 'Already liked',
          isLiked: true,
          likesCount: post.likes_count
        }));
      }

      // 좋아요 추가
      const { error: likeError } = await supabase
        .from('community_likes')
        .insert({
          post_id: id,
          user_id: userId
        });

      if (likeError) {
        throw ErrorFactory.database(`Failed to add like: ${likeError.message}`);
      }

      // 게시글의 likes_count 증가
      const { error: updateError } = await supabase
        .from('community_posts')
        .update({
          likes_count: post.likes_count + 1
        })
        .eq('id', id);

      if (updateError) {
        throw ErrorFactory.database(`Failed to update likes count: ${updateError.message}`);
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Post liked successfully',
        isLiked: true,
        likesCount: post.likes_count + 1
      }));

    } else { // unlike
      // 좋아요 제거
      const { error: unlikeError } = await supabase
        .from('community_likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', userId);

      if (unlikeError) {
        throw ErrorFactory.database(`Failed to remove like: ${unlikeError.message}`);
      }

      // 게시글의 likes_count 감소 (0 이하로는 내려가지 않도록)
      const newLikesCount = Math.max(0, post.likes_count - 1);
      const { error: updateError } = await supabase
        .from('community_posts')
        .update({
          likes_count: newLikesCount
        })
        .eq('id', id);

      if (updateError) {
        throw ErrorFactory.database(`Failed to update likes count: ${updateError.message}`);
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Post unliked successfully',
        isLiked: false,
        likesCount: newLikesCount
      }));
    }

  } catch (error) {
    console.error('Error toggling like:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to toggle like', 
      500
    ), { status: 500 });
  }
}

// GET /api/community/posts/[id]/like - 사용자의 좋아요 상태 확인
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw ErrorFactory.badRequest('User ID is required');
    }

    const { data: like } = await supabase
      .from('community_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    return NextResponse.json(createSuccessResponse({
      isLiked: !!like
    }));

  } catch (error) {
    console.error('Error checking like status:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to check like status', 
      500
    ), { status: 500 });
  }
}