'use client';

import { useState, useEffect } from 'react';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import { 
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  PencilIcon,
  TrashIcon,
  ArrowUturnRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: string;
  };
  post_id: string;
  parent_id?: string;
  likes: number;
  replies_count: number;
  is_liked: boolean;
  is_edited: boolean;
  created_at: string;
  replies: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        // Actual API call to fetch comments
        const response = await fetch(`/api/community/comments?postId=${postId}`);
        if (response.ok) {
          const fetchedComments: Comment[] = await response.json();
          setComments(fetchedComments);
        } else {
          // Fallback to empty array if API fails
          setComments([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load comments:', error);
        setLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!content.trim()) return;

    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
          parentId,
          userId: 'temp-user-id' // TODO: Get actual user ID from auth
        })
      });

      if (response.ok) {
        const newComment: Comment = await response.json();
        
        if (parentId) {
          // Add as reply
          setComments(prevComments => 
            prevComments.map(comment => 
              comment.id === parentId 
                ? { 
                    ...comment, 
                    replies: [...comment.replies, newComment],
                    replies_count: comment.replies_count + 1
                  }
                : comment
            )
          );
          setReplyingTo(null);
        } else {
          // Add as top-level comment
          setComments(prevComments => [newComment, ...prevComments]);
          setNewComment('');
        }
      } else {
        console.error('Failed to create comment');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string, isReply: boolean = false) => {
    try {
      if (isReply) {
        setComments(prevComments =>
          prevComments.map(comment => ({
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId
                ? {
                    ...reply,
                    is_liked: !reply.is_liked,
                    likes: reply.is_liked ? reply.likes - 1 : reply.likes + 1
                  }
                : reply
            )
          }))
        );
      } else {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  is_liked: !comment.is_liked,
                  likes: comment.is_liked ? comment.likes - 1 : comment.likes + 1
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditContent(currentContent);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      // Update comment in state
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content: editContent.trim(), is_edited: true };
          }
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId
                ? { ...reply, content: editContent.trim(), is_edited: true }
                : reply
            )
          };
        })
      );

      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        <LinearCard padding="md" shadow="sm" className="mb-4">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="text-xl">{comment.author.avatar}</div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{comment.author.name}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {comment.author.level}
                  </span>
                  {comment.is_edited && (
                    <span className="text-xs text-gray-500">(수정됨)</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Comment Actions Menu */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleEditComment(comment.id, comment.content)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                title="댓글 수정"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"
                title="댓글 삭제"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="댓글을 수정하세요..."
              />
              <div className="flex items-center space-x-2 mt-2">
                <LinearButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateComment(comment.id)}
                  disabled={!editContent.trim()}
                >
                  수정 완료
                </LinearButton>
                <LinearButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                >
                  취소
                </LinearButton>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* Comment Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLikeComment(comment.id, isReply)}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                {comment.is_liked ? (
                  <HeartSolidIcon className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
                <span className="text-sm">{comment.likes}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <ArrowUturnRightIcon className="w-4 h-4" />
                  <span className="text-sm">답글</span>
                </button>
              )}
            </div>

            {comment.replies_count > 0 && !isReply && (
              <span className="text-sm text-gray-500">
                답글 {comment.replies_count}개
              </span>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <CommentForm
                onSubmit={(content) => handleSubmitComment(content, comment.id)}
                onCancel={() => setReplyingTo(null)}
                placeholder={`${comment.author.name}님에게 답글...`}
                buttonText="답글 작성"
              />
            </div>
          )}
        </LinearCard>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const CommentForm = ({ 
    onSubmit, 
    onCancel, 
    placeholder = "댓글을 작성하세요...",
    buttonText = "댓글 작성"
  }: {
    onSubmit: (content: string) => void;
    onCancel?: () => void;
    placeholder?: string;
    buttonText?: string;
  }) => {
    const [content, setContent] = useState('');

    const handleSubmit = () => {
      if (content.trim()) {
        onSubmit(content);
        setContent('');
      }
    };

    return (
      <div className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder={placeholder}
          maxLength={1000}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LinearButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim()}
            >
              {buttonText}
            </LinearButton>
            {onCancel && (
              <LinearButton
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                취소
              </LinearButton>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {content.length}/1000
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <LinearCard padding="lg" className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">댓글을 불러오는 중...</p>
      </LinearCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Stats */}
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
          <span>댓글 {comments.length}개</span>
        </div>
      </div>

      {/* New Comment Form */}
      <LinearCard padding="lg" shadow="sm">
        <h3 className="text-lg font-semibold mb-4">댓글 작성</h3>
        <CommentForm onSubmit={(content) => handleSubmitComment(content)} />
      </LinearCard>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <LinearCard padding="lg" className="text-center">
            <ChatBubbleLeftEllipsisIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 댓글이 없습니다
            </h3>
            <p className="text-gray-600">
              첫 번째 댓글을 작성해보세요!
            </p>
          </LinearCard>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}