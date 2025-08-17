/**
 * IdeaSpark Type Definitions
 * Central type definitions for the application
 */

// ============================================================================
// Core Application Types
// ============================================================================

export interface AppConfig {
  name: string;
  version: string;
  description: string;
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Pain Point Types
// ============================================================================

export interface PainPoint {
  id: string;
  title: string;
  content: string;
  source: 'reddit' | 'google' | 'naver' | 'linkedin' | 'twitter' | 'alternative-hackernews' | 'alternative-github' | 'fallback-productivity';
  sourceUrl: string;
  sentimentScore: number;
  trendScore: number;
  keywords: string[];
  category: 'technology' | 'business' | 'healthcare' | 'education' | 'entertainment' | 'general';
  createdAt: string;
  updatedAt: string;
}

export interface PainPointStats {
  totalCount: number;
  bySource: Record<string, { count: number; avgSentiment: number }>;
  byCategory: Record<string, number>;
  trendingKeywords: Array<{ keyword: string; count: number; trend: 'up' | 'down' | 'stable' }>;
}

// ============================================================================
// Business Idea Types
// ============================================================================

export interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  marketSize: string;
  confidenceScore: number;
  implementation: {
    difficulty: 'low' | 'medium' | 'high';
    timeToMarket: string;
    estimatedCost: string;
    keyFeatures: string[];
  };
  relatedPainPoints: string[]; // PainPoint IDs
  generatedAt: string;
  category: string;
}

export interface BusinessIdeaStats {
  totalIdeas: number;
  avgConfidence: number;
  topCategories: string[];
  successfulImplementations: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsOverview {
  painPoints: PainPointStats;
  businessIdeas: BusinessIdeaStats;
  telegram: TelegramStats;
  generatedAt: string;
}

export interface TelegramStats {
  totalSent: number;
  successRate: number;
  avgEngagement: number;
  lastSent: string;
  periodDays: number;
}

export interface TrendingKeyword {
  keyword: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

// ============================================================================
// Telegram & Notification Types
// ============================================================================

export interface TelegramDigest {
  date: string;
  businessIdeas: BusinessIdea[];
  summary: {
    totalPainPoints: number;
    topCategories: string[];
    confidenceScore: number;
  };
  metadata: {
    generationTime: number;
    aiModel: string;
    dataQuality: number;
  };
}

export interface NotificationSettings {
  telegramEnabled: boolean;
  digestTime: string; // HH:mm format
  categories: string[];
  minimumConfidence: number;
  maxIdeasPerDigest: number;
}

// ============================================================================
// Community Types (Epic 2)
// ============================================================================

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: CommunityTag[];
  likes: number;
  comments: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityTag {
  id: string;
  name: '자랑' | '공유' | '외주' | '협업';
  color: string;
  description: string;
}

export interface ProjectMatching {
  id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: string;
  type: 'project' | 'collaboration' | 'outsourcing';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: User;
  applicants: User[];
}

// ============================================================================
// PRD Generator Types (Epic 4)
// ============================================================================

export interface PRDTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: PRDSection[];
  isDefault: boolean;
  createdAt: string;
}

export interface PRDSection {
  id: string;
  title: string;
  type: 'text' | 'list' | 'table' | 'diagram' | 'mermaid';
  content: string;
  order: number;
  required: boolean;
}

export interface GeneratedPRD {
  id: string;
  title: string;
  description: string;
  businessIdea: BusinessIdea;
  template: PRDTemplate;
  sections: PRDSection[];
  mermaidDiagrams: {
    flowchart: string;
    erd: string;
    architecture: string;
  };
  metadata: {
    generatedAt: string;
    aiModel: string;
    confidence: number;
    estimatedReadTime: number;
  };
  exports: {
    pdf?: string;
    markdown?: string;
    shareUrl?: string;
  };
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface LinearComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface LinearButtonProps extends LinearComponentProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  href?: string;
  target?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface LinearCardProps extends LinearComponentProps {
  title?: string;
  description?: string;
  image?: string;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export interface LinearTableProps<T = any> {
  data: T[];
  columns: Array<{
    key: keyof T;
    title: string;
    width?: string;
    render?: (value: any, record: T) => React.ReactNode;
  }>;
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T) => void;
}

// ============================================================================
// API Response Types
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
// Feature Flags & Environment Types
// ============================================================================

export interface FeatureFlags {
  enableAnalytics: boolean;
  enableCommunity: boolean;
  enablePRDGenerator: boolean;
  enableDarkMode: boolean;
  showPerformanceMetrics: boolean;
  enableDebug: boolean;
  enableSocialLogin: boolean;
}

export interface EnvironmentConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  vercelUrl: string;
  environment: 'development' | 'staging' | 'production';
  featureFlags: FeatureFlags;
}

// ============================================================================
// Chart & Visualization Types
// ============================================================================

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export interface DashboardMetrics {
  painPointsToday: number;
  businessIdeasGenerated: number;
  telegramDeliveries: number;
  apiSuccessRate: number;
  trendChange: {
    painPoints: number;
    ideas: number;
    deliveries: number;
    successRate: number;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface SortCondition {
  field: string;
  direction: SortDirection;
}

export interface TableState {
  loading: LoadingState;
  filters: FilterCondition[];
  sort: SortCondition[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ============================================================================
// Export Collections
// ============================================================================

// Core types for main features
export type CoreTypes = PainPoint | BusinessIdea | User | TelegramDigest;

// Component props for UI library
export type ComponentProps = LinearButtonProps | LinearCardProps | LinearTableProps;

// API types for data fetching
export type ApiTypes = ApiResponse | ApiError | AnalyticsOverview;

// Configuration types
export type ConfigTypes = AppConfig | EnvironmentConfig | FeatureFlags | NotificationSettings;