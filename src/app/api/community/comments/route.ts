import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Fetch comments from Supabase
    const { data: comments, error } = await supabase
      .from('community_comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        parent_comment_id,
        users:user_id (
          id,
          display_name,
          email
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json([], { status: 200 }); // Return empty array instead of error
    }

    // Transform data to match frontend interface
    const transformedComments = (comments || []).map(comment => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.users?.id || 'unknown',
        name: comment.users?.display_name || comment.users?.email?.split('@')[0] || 'Anonymous',
        avatar: '👤',
        level: 'Member'
      },
      post_id: postId,
      parent_id: comment.parent_comment_id,
      likes: 0,
      replies_count: 0,
      is_liked: false,
      is_edited: false,
      created_at: comment.created_at,
      replies: []
    }));

    return NextResponse.json(transformedComments);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array for graceful degradation
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, content, parentId, userId } = body;

    if (!postId || !content || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        parent_comment_id: parentId || null
      })
      .select(`
        id,
        content,
        created_at,
        users:user_id (
          id,
          display_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    const transformedComment = {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.users?.id || 'unknown',
        name: comment.users?.display_name || comment.users?.email?.split('@')[0] || 'Anonymous',
        avatar: '👤',
        level: 'Member'
      },
      post_id: postId,
      parent_id: parentId,
      likes: 0,
      replies_count: 0,
      is_liked: false,
      is_edited: false,
      created_at: comment.created_at,
      replies: []
    };

    return NextResponse.json(transformedComment, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}