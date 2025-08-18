/**
 * API Types
 * Contains request/response interfaces and API-related types
 */

// ============================================================================
// Base API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// ============================================================================
// Pain Point API Types
// ============================================================================

export interface PainPointCreateRequest {
  title: string;
  content: string;
  source: 'reddit' | 'google' | 'naver' | 'linkedin' | 'twitter' | 'alternative-hackernews' | 'alternative-github' | 'fallback-productivity';
  source_url: string;
  sentiment_score?: number;
  trend_score?: number;
  keywords?: string[];
  category?: string;
}

export interface PainPointResponse {
  id: string;
  title: string;
  content: string;
  source: string;
  source_url: string;
  sentiment_score: number;
  trend_score: number;
  keywords: string[];
  category: string;
  created_at: string;
  updated_at: string;
}

export interface PainPointListResponse extends ApiResponse<PainPointResponse[]> {
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      source?: string;
      category?: string;
      date_range?: {
        start: string;
        end: string;
      };
    };
    timestamp: string;
  };
}

export interface PainPointCollectionResponse extends ApiResponse<PainPointResponse[]> {
  stats: {
    total_collected: number;
    successfully_saved: number;
    failed_to_save: number;
    collection_time: string;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    source: string;
    collection_method: string;
    limit: number;
    next_collection_recommended: string;
  };
}

// ============================================================================
// Business Idea API Types
// ============================================================================

export interface BusinessIdeaGenerationRequest {
  pain_point_ids?: string[];
  category?: string;
  count?: number;
  use_trending?: boolean;
}

export interface BusinessIdeaResponse {
  id: string;
  title: string;
  description: string;
  targetMarket: string;
  businessModel: string;
  keyFeatures: string[];
  marketSize: string;
  competitiveAdvantage: string;
  confidenceScore: number;
  tags: string[];
  estimatedCost: string;
  timeToMarket: string;
  painPointsAddressed: string[];
  implementationSteps: string[];
  createdAt: string;
  basedOnRealData?: boolean;
  sourcePainPoints?: Array<{
    id: string;
    title: string;
    trendScore: number;
    category: string;
  }>;
}

export interface BusinessIdeaGenerationResponse extends ApiResponse<BusinessIdeaResponse> {
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    model: string;
    generatedAt: string;
    basedOnPainPoints: number;
    processingTime: string;
    dataSource: string;
  };
}

// ============================================================================
// Analytics API Types
// ============================================================================

export interface AnalyticsRequest {
  period?: 'day' | 'week' | 'month' | 'year';
  start_date?: string;
  end_date?: string;
  categories?: string[];
  sources?: string[];
}

export interface AnalyticsMetricsResponse {
  pain_points: {
    total_count: number;
    today_count: number;
    trend_change: number;
    by_source: Record<string, { count: number; avg_sentiment: number }>;
    by_category: Record<string, number>;
    trending_keywords: Array<{
      keyword: string;
      count: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
  business_ideas: {
    total_generated: number;
    today_generated: number;
    avg_confidence: number;
    trend_change: number;
    top_categories: string[];
  };
  telegram: {
    total_sent: number;
    success_rate: number;
    avg_engagement: number;
    last_sent: string;
    period_days: number;
  };
  generated_at: string;
}

export interface RealTimeMetricsResponse extends ApiResponse<{
  current_processing: number;
  queue_length: number;
  api_health: {
    reddit: boolean;
    openai: boolean;
    telegram: boolean;
    database: boolean;
  };
  last_collection: string;
  next_scheduled: string;
  processing_rate: number;
}> {
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    refresh_interval: number;
  };
}

// ============================================================================
// Telegram Bot API Types
// ============================================================================

export interface TelegramConfigRequest {
  chat_id: string;
  enabled: boolean;
  digest_time?: string; // HH:mm format
  categories?: string[];
  minimum_confidence?: number;
  max_ideas_per_digest?: number;
}

export interface TelegramMessageRequest {
  chat_id: string;
  message_type: 'daily_digest' | 'single_idea' | 'alert';
  business_idea_ids?: string[];
  custom_message?: string;
}

export interface TelegramMessageResponse extends ApiResponse<{
  message_id: string;
  chat_id: string;
  message_type: string;
  sent_at: string;
  success: boolean;
  error_message?: string;
}> {}

// ============================================================================
// PRD Generator API Types
// ============================================================================

export interface PRDGenerationRequest {
  business_idea_id: string;
  template_id?: string;
  custom_sections?: Array<{
    title: string;
    content: string;
    type: 'text' | 'list' | 'table' | 'diagram';
  }>;
  include_diagrams?: boolean;
  export_format?: 'json' | 'markdown' | 'pdf';
}

export interface PRDGenerationResponse extends ApiResponse<{
  prd_id: string;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    title: string;
    type: 'text' | 'list' | 'table' | 'diagram' | 'mermaid';
    content: string;
    order: number;
    required: boolean;
  }>;
  mermaid_diagrams: {
    flowchart: string;
    erd: string;
    architecture: string;
  };
  metadata: {
    generated_at: string;
    ai_model: string;
    confidence: number;
    estimated_read_time: number;
  };
  exports: {
    pdf_url?: string;
    markdown_url?: string;
    share_url?: string;
  };
}> {}

// ============================================================================
// Community API Types
// ============================================================================

export interface CommunityPostCreateRequest {
  title: string;
  content: string;
  tags: string[];
  category: '자랑' | '공유' | '외주' | '협업';
  project_status?: 'idea' | 'development' | 'launched' | 'completed';
}

export interface CommunityPostResponse {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    display_name: string;
    avatar?: string;
  };
  tags: string[];
  category: string;
  project_status: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityPostListResponse extends ApiResponse<CommunityPostResponse[]> {
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      category?: string;
      tags?: string[];
      status?: string;
    };
    timestamp: string;
  };
}

// ============================================================================
// Authentication API Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
  telegram_chat_id?: string;
}

export interface AuthResponse extends ApiResponse<{
  user: {
    id: string;
    email: string;
    display_name?: string;
    telegram_chat_id?: string;
    subscription_tier: 'free' | 'pro' | 'business';
    created_at: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}> {}

// ============================================================================
// Health Check API Types
// ============================================================================

export interface HealthCheckResponse extends ApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: boolean;
    redis: boolean;
    openai: boolean;
    telegram: boolean;
    reddit: boolean;
  };
  metrics: {
    total_requests: number;
    error_rate: number;
    avg_response_time: number;
    active_connections: number;
  };
}> {}

// ============================================================================
// Export Collections
// ============================================================================

// API types for data fetching
export type ApiTypes = 
  | ApiResponse 
  | ApiError 
  | AnalyticsMetricsResponse
  | PainPointResponse
  | BusinessIdeaResponse
  | TelegramMessageResponse;