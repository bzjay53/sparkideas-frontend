import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';
import { AppError, ErrorFactory } from '@/lib/error-handler';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/community/comments/[id] - 특정 댓글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: comment, error } = await supabase
      .from('community_comments')
      .select(`
        id,
        content,
        post_id,
        user_id,
        parent_comment_id,
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
        throw ErrorFactory.notFound('Comment not found');
      }
      throw ErrorFactory.database(`Failed to fetch comment: ${error.message}`);
    }

    // Transform user data
    const user = Array.isArray(comment.users) ? comment.users[0] : comment.users;
    const enrichedComment = {
      id: comment.id,
      content: comment.content,
      author: {
        id: user?.id || comment.user_id,
        name: user?.display_name || user?.email?.split('@')[0] || 'Anonymous',
        avatar: '👤',
        level: 'Member'
      },
      post_id: comment.post_id,
      parent_id: comment.parent_comment_id,
      likes: 0, // TODO: Implement comment likes
      replies_count: 0, // TODO: Calculate actual replies count
      is_liked: false,
      is_edited: comment.updated_at !== comment.created_at,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      replies: []
    };

    return NextResponse.json(createSuccessResponse({
      comment: enrichedComment
    }));

  } catch (error) {
    console.error('Error fetching comment:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to fetch comment', 
      500
    ), { status: 500 });
  }
}

// PUT /api/community/comments/[id] - 댓글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content, userId } = body;

    if (!content || typeof content !== 'string') {
      throw ErrorFactory.badRequest('Content is required');
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 1 || trimmedContent.length > 2000) {
      throw ErrorFactory.badRequest('Content must be between 1 and 2000 characters');
    }

    if (!userId) {
      throw ErrorFactory.badRequest('User ID is required');
    }

    // 댓글 존재 및 권한 확인
    const { data: existingComment, error: checkError } = await supabase
      .from('community_comments')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        throw ErrorFactory.notFound('Comment not found');
      }
      throw ErrorFactory.database(`Failed to check comment: ${checkError.message}`);
    }

    // TODO: 실제 인증 시스템에서는 JWT 토큰으로 사용자 확인
    if (existingComment.user_id !== userId) {
      throw ErrorFactory.forbidden('You can only edit your own comments');
    }

    const { data: updatedComment, error } = await supabase
      .from('community_comments')
      .update({
        content: trimmedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        content,
        post_id,
        user_id,
        parent_comment_id,
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
      throw ErrorFactory.database(`Failed to update comment: ${error.message}`);
    }

    // Transform user data
    const user = Array.isArray(updatedComment.users) ? updatedComment.users[0] : updatedComment.users;
    const enrichedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      author: {
        id: user?.id || updatedComment.user_id,
        name: user?.display_name || user?.email?.split('@')[0] || 'Anonymous',
        avatar: '👤',
        level: 'Member'
      },
      post_id: updatedComment.post_id,
      parent_id: updatedComment.parent_comment_id,
      likes: 0,
      replies_count: 0,
      is_liked: false,
      is_edited: true,
      created_at: updatedComment.created_at,
      updated_at: updatedComment.updated_at,
      replies: []
    };

    return NextResponse.json(createSuccessResponse({
      comment: enrichedComment
    }));

  } catch (error) {
    console.error('Error updating comment:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to update comment', 
      500
    ), { status: 500 });
  }
}

// DELETE /api/community/comments/[id] - 댓글 삭제
export async function DELETE(
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

    // 댓글 존재 및 권한 확인
    const { data: existingComment, error: checkError } = await supabase
      .from('community_comments')
      .select('id, user_id, post_id')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        throw ErrorFactory.notFound('Comment not found');
      }
      throw ErrorFactory.database(`Failed to check comment: ${checkError.message}`);
    }

    // TODO: 실제 인증 시스템에서는 JWT 토큰으로 사용자 확인
    if (existingComment.user_id !== userId) {
      throw ErrorFactory.forbidden('You can only delete your own comments');
    }

    // 대댓글이 있는 경우 처리 (소프트 삭제 또는 완전 삭제)
    const { data: replies, error: repliesError } = await supabase
      .from('community_comments')
      .select('id')
      .eq('parent_comment_id', id);

    if (repliesError) {
      throw ErrorFactory.database(`Failed to check replies: ${repliesError.message}`);
    }

    if (replies && replies.length > 0) {
      // 대댓글이 있는 경우 소프트 삭제 (내용만 변경)
      const { error: softDeleteError } = await supabase
        .from('community_comments')
        .update({
          content: '[삭제된 댓글입니다]',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (softDeleteError) {
        throw ErrorFactory.database(`Failed to soft delete comment: ${softDeleteError.message}`);
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Comment soft deleted successfully',
        type: 'soft_delete'
      }));

    } else {
      // 대댓글이 없는 경우 완전 삭제
      const { error: deleteError } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw ErrorFactory.database(`Failed to delete comment: ${deleteError.message}`);
      }

      // 게시글의 댓글 수 감소
      const { error: updatePostError } = await supabase
        .rpc('decrement_comments_count', { 
          post_id: existingComment.post_id 
        });

      if (updatePostError) {
        console.warn('Failed to update post comments count:', updatePostError);
      }

      return NextResponse.json(createSuccessResponse({
        message: 'Comment deleted successfully',
        type: 'hard_delete'
      }));
    }

  } catch (error) {
    console.error('Error deleting comment:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to delete comment', 
      500
    ), { status: 500 });
  }
}