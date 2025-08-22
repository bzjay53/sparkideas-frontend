import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';
import { AppError, ErrorFactory } from '@/lib/error-handler';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/community/posts/[id]/bookmark - 게시글 북마크/취소
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, action } = body; // action: 'bookmark' | 'unbookmark'

    if (!userId) {
      throw ErrorFactory.badRequest('User ID is required');
    }

    if (!['bookmark', 'unbookmark'].includes(action)) {
      throw ErrorFactory.badRequest('Action must be either "bookmark" or "unbookmark"');
    }

    // 게시글 존재 확인
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', id)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        throw ErrorFactory.notFound('Post not found');
      }
      throw ErrorFactory.database(`Failed to fetch post: ${postError.message}`);
    }

    if (action === 'bookmark') {
      // 중복 북마크 확인
      const { data: existingBookmark } = await supabase
        .from('community_bookmarks')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', userId)
        .single();

      if (existingBookmark) {
        return NextResponse.json(createSuccessResponse({
          message: 'Already bookmarked',
          isBookmarked: true
        }));
      }

      // 북마크 추가
      const { error: bookmarkError } = await supabase
        .from('community_bookmarks')
        .insert({
          post_id: id,
          user_id: userId
        });

      if (bookmarkError) {
        throw ErrorFactory.database(`Failed to add bookmark: ${bookmarkError.message}`);
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Post bookmarked successfully',
        isBookmarked: true
      }));

    } else { // unbookmark
      // 북마크 제거
      const { error: unbookmarkError } = await supabase
        .from('community_bookmarks')
        .delete()
        .eq('post_id', id)
        .eq('user_id', userId);

      if (unbookmarkError) {
        throw ErrorFactory.database(`Failed to remove bookmark: ${unbookmarkError.message}`);
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Post unbookmarked successfully',
        isBookmarked: false
      }));
    }

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to toggle bookmark', 
      500
    ), { status: 500 });
  }
}

// GET /api/community/posts/[id]/bookmark - 사용자의 북마크 상태 확인
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

    const { data: bookmark } = await supabase
      .from('community_bookmarks')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    return NextResponse.json(createSuccessResponse({
      isBookmarked: !!bookmark
    }));

  } catch (error) {
    console.error('Error checking bookmark status:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to check bookmark status', 
      500
    ), { status: 500 });
  }
}