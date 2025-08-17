'use client';

import { useState, useEffect } from 'react';
import { LinearButton } from '@/components/ui';
import { 
  BellIcon,
  XMarkIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Mock notifications - replace with actual API call
        const mockNotifications: Notification[] = [
          {
            id: 'notif_001',
            type: 'comment',
            title: '새 댓글이 달렸습니다',
            message: '이댓글님이 "AI 쇼핑 추천 앱 MVP" 글에 댓글을 남겼습니다.',
            action_url: '/community/posts/post_001#comment_001',
            is_read: false,
            created_at: '2025-08-16T10:15:00Z'
          },
          {
            id: 'notif_002',
            type: 'post_like',
            title: '글이 좋아요를 받았습니다',
            message: '박테스터님이 당신의 글을 좋아합니다.',
            action_url: '/community/posts/post_001',
            is_read: false,
            created_at: '2025-08-16T09:45:00Z'
          },
          {
            id: 'notif_003',
            type: 'comment',
            title: '답글이 달렸습니다',
            message: '김개발님이 당신의 댓글에 답글을 남겼습니다.',
            action_url: '/community/posts/post_001#comment_002',
            is_read: true,
            created_at: '2025-08-15T16:30:00Z'
          },
          {
            id: 'notif_004',
            type: 'follow',
            title: '새 팔로워',
            message: '정분석님이 당신을 팔로우하기 시작했습니다.',
            action_url: '/profile/user_006',
            is_read: true,
            created_at: '2025-08-15T14:20:00Z'
          }
        ];

        setTimeout(() => {
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-blue-600" />;
      case 'post_like':
        return <HeartIcon className="w-5 h-5 text-red-600" />;
      case 'follow':
        return <UserPlusIcon className="w-5 h-5 text-green-600" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="알림"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6 text-blue-600" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-600" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">알림</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <LinearButton
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    모두 읽음
                  </LinearButton>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">알림을 불러오는 중...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">알림이 없습니다</h4>
                  <p className="text-xs text-gray-600">새로운 알림이 오면 여기에 표시됩니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        if (notification.action_url) {
                          // Navigate to the URL
                          window.location.href = notification.action_url;
                        }
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Notification Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {getTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <LinearButton
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // Navigate to notifications page
                    window.location.href = '/notifications';
                    setIsOpen(false);
                  }}
                >
                  모든 알림 보기
                </LinearButton>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}