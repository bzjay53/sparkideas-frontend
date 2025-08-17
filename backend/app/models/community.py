"""
Community Database Models
Database schema for posts, comments, and user interactions
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    """User model for community members"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(200), nullable=False)
    avatar = Column(String(10), default="👤")  # Emoji avatar
    level = Column(String(50), default="Member")  # Member, Maker, Innovator, Unicorn
    bio = Column(Text, nullable=True)
    
    # Stats
    posts_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    likes_received = Column(Integer, default=0)
    reputation_score = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("PostBookmark", back_populates="user", cascade="all, delete-orphan")

class Category(Base):
    """Post categories"""
    __tablename__ = "categories"
    
    id = Column(String(50), primary_key=True)  # showcase, collaboration, success, freelance, discussion
    name = Column(String(100), nullable=False)
    icon = Column(String(10), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), default="#3B82F6")  # Hex color
    post_count = Column(Integer, default=0)
    
    # Relationships
    posts = relationship("Post", back_populates="category")

class Tag(Base):
    """Post tags"""
    __tablename__ = "tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Post(Base):
    """Community posts"""
    __tablename__ = "posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    slug = Column(String(250), unique=True, nullable=False)
    
    # Foreign Keys
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(String(50), ForeignKey("categories.id"), nullable=False)
    
    # Stats
    views = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    bookmarks_count = Column(Integer, default=0)
    
    # Status
    status = Column(String(20), default="published")  # draft, published, hot, trending, pinned
    is_featured = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    author = relationship("User", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    bookmarks = relationship("PostBookmark", back_populates="post", cascade="all, delete-orphan")
    post_tags = relationship("PostTag", back_populates="post", cascade="all, delete-orphan")

class Comment(Base):
    """Post comments with threading support"""
    __tablename__ = "comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    
    # Foreign Keys
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("comments.id"), nullable=True)  # For threading
    
    # Stats
    likes_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    
    # Status
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")
    comment_likes = relationship("CommentLike", back_populates="comment", cascade="all, delete-orphan")

class PostLike(Base):
    """Post likes/reactions"""
    __tablename__ = "post_likes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reaction_type = Column(String(20), default="like")  # like, love, laugh, wow, sad, angry
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    post = relationship("Post", back_populates="likes")
    user = relationship("User", back_populates="likes")
    
    # Unique constraint
    __table_args__ = (
        {'schema': None},
    )

class CommentLike(Base):
    """Comment likes/reactions"""
    __tablename__ = "comment_likes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comment_id = Column(UUID(as_uuid=True), ForeignKey("comments.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reaction_type = Column(String(20), default="like")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    comment = relationship("Comment", back_populates="comment_likes")

class PostBookmark(Base):
    """Post bookmarks"""
    __tablename__ = "post_bookmarks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    post = relationship("Post", back_populates="bookmarks")
    user = relationship("User", back_populates="bookmarks")

class PostTag(Base):
    """Many-to-many relationship between posts and tags"""
    __tablename__ = "post_tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=False)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("tags.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    post = relationship("Post", back_populates="post_tags")
    tag = relationship("Tag")

class Notification(Base):
    """User notifications"""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Notification details
    type = Column(String(50), nullable=False)  # post_like, comment, mention, follow
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    action_url = Column(String(500), nullable=True)
    
    # Related entities
    related_post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=True)
    related_comment_id = Column(UUID(as_uuid=True), ForeignKey("comments.id"), nullable=True)
    related_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Status
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)