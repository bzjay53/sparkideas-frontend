"""
Community API Endpoints
Developer community platform with posts, comments, and project matching
"""

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import structlog

logger = structlog.get_logger()
router = APIRouter()

class PostRequest(BaseModel):
    """Request model for creating a post"""
    title: str = Field(..., min_length=5, max_length=200)
    content: str = Field(..., min_length=10)
    category: str = Field(..., description="Category: showcase, collaboration, success, freelance, discussion")
    tags: List[str] = Field(default=[], max_items=10)

class PostResponse(BaseModel):
    """Response model for post data"""
    id: str
    title: str
    content: str
    author: Dict[str, Any]
    category: str
    tags: List[str]
    likes: int
    comments: int
    views: int
    created_at: str
    is_liked: bool = False
    is_bookmarked: bool = False

@router.get("/posts", response_model=List[PostResponse])
async def get_community_posts(
    category: Optional[str] = Query(None, description="Filter by category"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    sort: str = Query("latest", description="Sort order: latest, popular, comments"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
) -> List[PostResponse]:
    """
    Get community posts with filtering and pagination
    
    **Categories:**
    - `showcase`: 프로젝트 자랑
    - `collaboration`: 협업 모집
    - `success`: 성공 사례
    - `freelance`: 외주 모집
    - `discussion`: 토론/질문
    """
    
    # Mock posts data
    mock_posts = [
        {
            "id": "post_001",
            "title": "🚀 AI 쇼핑 추천 앱 MVP 완성! 피드백 구합니다",
            "content": "IdeaSpark에서 생성한 PRD를 바탕으로 3주 만에 MVP를 완성했습니다. 개인화된 추천 알고리즘이 핵심이고, 현재 베타 테스터를 모집하고 있어요.",
            "author": {
                "id": "user_001",
                "name": "김개발",
                "avatar": "👨‍💻",
                "level": "Maker"
            },
            "category": "showcase",
            "tags": ["자랑", "MVP", "AI", "쇼핑"],
            "likes": 42,
            "comments": 18,
            "views": 234,
            "created_at": "2025-08-16T09:30:00Z",
            "is_liked": False,
            "is_bookmarked": True
        },
        {
            "id": "post_002",
            "title": "💡 헬스케어 IoT 프로젝트 같이 하실 분 모집",
            "content": "PRD 생성 완료하고 기술 스택도 정했는데, 백엔드 개발자 1명과 IoT 전문가 1명이 더 필요합니다. 수익 공유 방식으로 진행하려고 해요.",
            "author": {
                "id": "user_002", 
                "name": "이기획",
                "avatar": "👩‍💼",
                "level": "Innovator"
            },
            "category": "collaboration",
            "tags": ["협업", "헬스케어", "IoT", "팀모집"],
            "likes": 28,
            "comments": 12,
            "views": 156,
            "created_at": "2025-08-15T14:20:00Z",
            "is_liked": True,
            "is_bookmarked": False
        },
        {
            "id": "post_003",
            "title": "📊 B2B SaaS 검증 결과 공유 - 월 MRR $12k 달성!",
            "content": "IdeaSpark PRD로 시작한 팀 협업 도구가 론칭 6개월 만에 월 $12k MRR을 달성했습니다. 초기 시장 검증부터 PMF 찾기까지의 여정을 상세히 공유드립니다.",
            "author": {
                "id": "user_003",
                "name": "박창업", 
                "avatar": "🚀",
                "level": "Unicorn"
            },
            "category": "success",
            "tags": ["성공사례", "SaaS", "B2B", "PMF"],
            "likes": 89,
            "comments": 34,
            "views": 567,
            "created_at": "2025-08-14T11:15:00Z",
            "is_liked": False,
            "is_bookmarked": True
        }
    ]
    
    # Apply filters
    filtered_posts = mock_posts
    
    if category:
        filtered_posts = [p for p in filtered_posts if p["category"] == category]
    
    if tag:
        filtered_posts = [p for p in filtered_posts if tag in p["tags"]]
    
    if search:
        search_lower = search.lower()
        filtered_posts = [
            p for p in filtered_posts 
            if search_lower in p["title"].lower() or search_lower in p["content"].lower()
        ]
    
    # Apply sorting
    if sort == "popular":
        filtered_posts.sort(key=lambda x: x["likes"], reverse=True)
    elif sort == "comments":
        filtered_posts.sort(key=lambda x: x["comments"], reverse=True)
    else:  # latest
        filtered_posts.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Apply pagination
    paginated_posts = filtered_posts[offset:offset + limit]
    
    logger.info("Community posts retrieved", 
               total=len(filtered_posts),
               returned=len(paginated_posts),
               category=category,
               tag=tag,
               search=search)
    
    return paginated_posts

@router.post("/posts", response_model=PostResponse)
async def create_post(
    request: PostRequest,
    background_tasks: BackgroundTasks
) -> PostResponse:
    """
    Create a new community post
    """
    
    try:
        # Generate mock post ID
        post_id = f"post_{int(datetime.now().timestamp())}"
        
        # Mock user data (in real app, get from authentication)
        mock_author = {
            "id": "user_current",
            "name": "현재사용자",
            "avatar": "👤",
            "level": "Member"
        }
        
        # Create post response
        new_post = PostResponse(
            id=post_id,
            title=request.title,
            content=request.content,
            author=mock_author,
            category=request.category,
            tags=request.tags,
            likes=0,
            comments=0,
            views=1,
            created_at=datetime.now().isoformat(),
            is_liked=False,
            is_bookmarked=False
        )
        
        # Add background task for notifications
        background_tasks.add_task(_notify_new_post, post_id, request.title)
        
        logger.info("New post created",
                   post_id=post_id,
                   category=request.category,
                   tags=request.tags)
        
        return new_post
        
    except Exception as e:
        logger.error("Failed to create post", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create post: {str(e)}"
        )

@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: str) -> PostResponse:
    """Get specific post by ID"""
    
    # Mock post retrieval
    if post_id == "post_001":
        return PostResponse(
            id=post_id,
            title="🚀 AI 쇼핑 추천 앱 MVP 완성! 피드백 구합니다",
            content="IdeaSpark에서 생성한 PRD를 바탕으로 3주 만에 MVP를 완성했습니다...",
            author={
                "id": "user_001",
                "name": "김개발", 
                "avatar": "👨‍💻",
                "level": "Maker"
            },
            category="showcase",
            tags=["자랑", "MVP", "AI", "쇼핑"],
            likes=42,
            comments=18,
            views=235,  # Incremented view count
            created_at="2025-08-16T09:30:00Z",
            is_liked=False,
            is_bookmarked=True
        )
    
    raise HTTPException(status_code=404, detail="Post not found")

@router.post("/posts/{post_id}/like")
async def toggle_post_like(post_id: str) -> Dict[str, Any]:
    """Toggle like on a post"""
    
    # Mock like toggle
    return {
        "post_id": post_id,
        "is_liked": True,
        "total_likes": 43,
        "message": "Post liked successfully"
    }

@router.post("/posts/{post_id}/bookmark")
async def toggle_post_bookmark(post_id: str) -> Dict[str, Any]:
    """Toggle bookmark on a post"""
    
    # Mock bookmark toggle
    return {
        "post_id": post_id,
        "is_bookmarked": True,
        "message": "Post bookmarked successfully"
    }

@router.get("/categories")
async def get_categories() -> List[Dict[str, Any]]:
    """Get available post categories"""
    
    return [
        {"id": "showcase", "name": "자랑", "icon": "🚀", "description": "완성한 프로젝트를 자랑해보세요"},
        {"id": "collaboration", "name": "협업", "icon": "🤝", "description": "함께할 팀원을 모집하세요"},
        {"id": "success", "name": "성공사례", "icon": "🏆", "description": "성공한 프로젝트 경험을 공유하세요"},
        {"id": "freelance", "name": "외주", "icon": "💼", "description": "프리랜서 프로젝트를 의뢰하세요"},
        {"id": "discussion", "name": "토론", "icon": "💬", "description": "자유로운 토론과 질문을 나누세요"}
    ]

@router.get("/tags/popular")
async def get_popular_tags() -> List[str]:
    """Get popular community tags"""
    
    return [
        "협업", "자랑", "AI", "SaaS", "외주", "모바일", 
        "B2B", "성공사례", "React", "Python", "스타트업", "MVP"
    ]

@router.get("/stats")
async def get_community_stats() -> Dict[str, Any]:
    """Get community statistics"""
    
    return {
        "total_members": 1247,
        "active_today": 89,
        "total_posts": 342,
        "success_projects": 28,
        "categories": {
            "showcase": 89,
            "collaboration": 156,
            "success": 28,
            "freelance": 45,
            "discussion": 124
        },
        "growth": {
            "new_members_this_week": 23,
            "new_posts_this_week": 18,
            "engagement_rate": 74.5
        }
    }

@router.get("/health")
async def community_health_check() -> Dict[str, str]:
    """Community service health check"""
    return {
        "service": "community",
        "status": "operational",
        "features": "Posts, categories, tags, likes, bookmarks",
        "epic": "Epic 6 - Community Platform System"
    }

# Comments API Endpoints
class CommentRequest(BaseModel):
    """Request model for creating a comment"""
    content: str = Field(..., min_length=1, max_length=1000)
    parent_id: Optional[str] = Field(None, description="Parent comment ID for threading")

class CommentResponse(BaseModel):
    """Response model for comment data"""
    id: str
    content: str
    author: Dict[str, Any]
    post_id: str
    parent_id: Optional[str] = None
    likes: int
    replies_count: int
    is_liked: bool = False
    is_edited: bool = False
    created_at: str
    replies: List["CommentResponse"] = []

# Enable forward reference for recursive comments
CommentResponse.model_rebuild()

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_post_comments(
    post_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
) -> List[CommentResponse]:
    """Get comments for a specific post with threading"""
    
    # Mock comments data
    mock_comments = [
        {
            "id": "comment_001",
            "content": "정말 대단한 아이디어네요! MVP 개발 과정에서 가장 어려웠던 부분이 무엇인가요?",
            "author": {
                "id": "user_004",
                "name": "이댓글",
                "avatar": "💬",
                "level": "Member"
            },
            "post_id": post_id,
            "parent_id": None,
            "likes": 5,
            "replies_count": 2,
            "is_liked": False,
            "is_edited": False,
            "created_at": "2025-08-16T10:15:00Z",
            "replies": [
                {
                    "id": "comment_002",
                    "content": "감사합니다! 가장 어려웠던 건 추천 알고리즘 정확도를 높이는 것이었어요.",
                    "author": {
                        "id": "user_001",
                        "name": "김개발",
                        "avatar": "👨‍💻",
                        "level": "Maker"
                    },
                    "post_id": post_id,
                    "parent_id": "comment_001",
                    "likes": 3,
                    "replies_count": 0,
                    "is_liked": True,
                    "is_edited": False,
                    "created_at": "2025-08-16T10:30:00Z",
                    "replies": []
                }
            ]
        },
        {
            "id": "comment_003",
            "content": "베타 테스터로 참여하고 싶습니다! 어떻게 신청하면 될까요?",
            "author": {
                "id": "user_005",
                "name": "박테스터",
                "avatar": "🧪",
                "level": "Tester"
            },
            "post_id": post_id,
            "parent_id": None,
            "likes": 8,
            "replies_count": 0,
            "is_liked": False,
            "is_edited": False,
            "created_at": "2025-08-16T11:45:00Z",
            "replies": []
        }
    ]
    
    # Apply pagination
    paginated_comments = mock_comments[offset:offset + limit]
    
    logger.info("Post comments retrieved",
               post_id=post_id,
               total=len(mock_comments),
               returned=len(paginated_comments))
    
    return paginated_comments

@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: str,
    request: CommentRequest,
    background_tasks: BackgroundTasks
) -> CommentResponse:
    """Create a new comment on a post"""
    
    try:
        # Generate mock comment ID
        comment_id = f"comment_{int(datetime.now().timestamp())}"
        
        # Mock current user (in real app, get from authentication)
        mock_author = {
            "id": "user_current",
            "name": "현재사용자",
            "avatar": "👤",
            "level": "Member"
        }
        
        # Create comment response
        new_comment = CommentResponse(
            id=comment_id,
            content=request.content,
            author=mock_author,
            post_id=post_id,
            parent_id=request.parent_id,
            likes=0,
            replies_count=0,
            is_liked=False,
            is_edited=False,
            created_at=datetime.now().isoformat(),
            replies=[]
        )
        
        # Add background task for notifications
        background_tasks.add_task(_notify_new_comment, post_id, comment_id, request.content)
        
        logger.info("New comment created",
                   comment_id=comment_id,
                   post_id=post_id,
                   parent_id=request.parent_id)
        
        return new_comment
        
    except Exception as e:
        logger.error("Failed to create comment", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create comment: {str(e)}"
        )

@router.post("/comments/{comment_id}/like")
async def toggle_comment_like(comment_id: str) -> Dict[str, Any]:
    """Toggle like on a comment"""
    
    # Mock like toggle
    return {
        "comment_id": comment_id,
        "is_liked": True,
        "total_likes": 6,
        "message": "Comment liked successfully"
    }

@router.put("/comments/{comment_id}")
async def update_comment(
    comment_id: str,
    request: CommentRequest
) -> CommentResponse:
    """Update an existing comment"""
    
    # Mock comment update
    mock_author = {
        "id": "user_current",
        "name": "현재사용자",
        "avatar": "👤",
        "level": "Member"
    }
    
    updated_comment = CommentResponse(
        id=comment_id,
        content=request.content,
        author=mock_author,
        post_id="post_001",  # Mock post ID
        parent_id=request.parent_id,
        likes=3,
        replies_count=0,
        is_liked=False,
        is_edited=True,
        created_at="2025-08-16T10:15:00Z",
        replies=[]
    )
    
    logger.info("Comment updated", comment_id=comment_id)
    return updated_comment

@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str) -> Dict[str, str]:
    """Delete a comment"""
    
    # In real implementation, soft delete by setting is_deleted=True
    logger.info("Comment deleted", comment_id=comment_id)
    
    return {
        "message": "Comment deleted successfully",
        "comment_id": comment_id
    }

# Real-time WebSocket endpoints for live interactions
@router.websocket("/posts/{post_id}/live")
async def websocket_post_updates(websocket, post_id: str):
    """WebSocket endpoint for real-time post updates"""
    await websocket.accept()
    
    try:
        while True:
            # In real implementation, listen for database changes
            # and push updates to connected clients
            data = await websocket.receive_text()
            
            # Echo back for now (in real app, broadcast to all subscribers)
            await websocket.send_text(f"Post {post_id} update: {data}")
    except Exception as e:
        logger.error("WebSocket error", error=str(e))
        await websocket.close()

# Notification endpoints
class NotificationResponse(BaseModel):
    """Response model for notifications"""
    id: str
    type: str
    title: str
    message: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: str

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_user_notifications(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False)
) -> List[NotificationResponse]:
    """Get user notifications"""
    
    mock_notifications = [
        {
            "id": "notif_001",
            "type": "comment",
            "title": "새 댓글이 달렸습니다",
            "message": "이댓글님이 'AI 쇼핑 추천 앱 MVP' 글에 댓글을 남겼습니다.",
            "action_url": "/community/posts/post_001#comment_001",
            "is_read": False,
            "created_at": "2025-08-16T10:15:00Z"
        },
        {
            "id": "notif_002",
            "type": "post_like",
            "title": "글이 좋아요를 받았습니다",
            "message": "박테스터님이 당신의 글을 좋아합니다.",
            "action_url": "/community/posts/post_001",
            "is_read": True,
            "created_at": "2025-08-16T09:45:00Z"
        }
    ]
    
    if unread_only:
        mock_notifications = [n for n in mock_notifications if not n["is_read"]]
    
    paginated_notifications = mock_notifications[offset:offset + limit]
    
    logger.info("User notifications retrieved",
               total=len(mock_notifications),
               returned=len(paginated_notifications),
               unread_only=unread_only)
    
    return paginated_notifications

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str) -> Dict[str, str]:
    """Mark a notification as read"""
    
    logger.info("Notification marked as read", notification_id=notification_id)
    
    return {
        "message": "Notification marked as read",
        "notification_id": notification_id
    }

# Background task functions
async def _notify_new_post(post_id: str, title: str):
    """Send notifications for new post (background task)"""
    try:
        # TODO: Implement actual notification system
        logger.info("New post notification sent",
                   post_id=post_id,
                   title=title)
    except Exception as e:
        logger.error("Failed to send post notification",
                   post_id=post_id,
                   error=str(e))

async def _notify_new_comment(post_id: str, comment_id: str, content: str):
    """Send notifications for new comment (background task)"""
    try:
        # TODO: Implement actual notification system
        # - Notify post author
        # - Notify parent comment author (if reply)
        # - Notify other commenters (if enabled)
        logger.info("New comment notification sent",
                   post_id=post_id,
                   comment_id=comment_id,
                   content_preview=content[:50])
    except Exception as e:
        logger.error("Failed to send comment notification",
                   comment_id=comment_id,
                   error=str(e))