/**
 * API Client with TypeScript Support
 * Type-safe API calls to the IdeaSpark backend
 */

import { ApiResponse, PainPoint, BusinessIdea, AnalyticsOverview, TelegramDigest, TrendingKeyword } from '@/types';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class APIClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: data.message || `HTTP ${response.status}`,
            details: data
          }
        };
      }
      
      return {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error'
        }
      };
    }
  }
  
  // ========================================================================
  // Health & System
  // ========================================================================
  
  async getHealth(): Promise<ApiResponse<{ status: string; service: string; version: string }>> {
    return this.request('/health');
  }
  
  async getRoot(): Promise<ApiResponse<{ message: string; version: string; docs: string }>> {
    return this.request('/');
  }
  
  // ========================================================================
  // Pain Points API
  // ========================================================================
  
  async getPainPoints(params?: {
    limit?: number;
    offset?: number;
    source?: string;
    category?: string;
  }): Promise<ApiResponse<{ pain_points: PainPoint[]; total: number }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.source) queryParams.append('source', params.source);
    if (params?.category) queryParams.append('category', params.category);
    
    const query = queryParams.toString();
    return this.request(`/api/pain-points${query ? `?${query}` : ''}`);
  }
  
  async getPainPoint(id: string): Promise<ApiResponse<PainPoint>> {
    return this.request(`/api/pain-points/${id}`);
  }
  
  async triggerPainPointCollection(): Promise<ApiResponse<{ message: string; task_id: string }>> {
    return this.request('/api/pain-points/collect', { method: 'POST' });
  }
  
  async getPainPointStats(): Promise<ApiResponse<{
    by_source: Record<string, { count: number; avg_sentiment: number }>;
    by_category: Record<string, number>;
    total_count: number;
  }>> {
    return this.request('/api/pain-points/stats');
  }
  
  // ========================================================================
  // Business Ideas API
  // ========================================================================
  
  async getBusinessIdeas(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    min_confidence?: number;
  }): Promise<ApiResponse<{ business_ideas: BusinessIdea[]; total: number }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.min_confidence) queryParams.append('min_confidence', params.min_confidence.toString());
    
    const query = queryParams.toString();
    return this.request(`/api/business-ideas${query ? `?${query}` : ''}`);
  }
  
  async getBusinessIdea(id: string): Promise<ApiResponse<BusinessIdea>> {
    return this.request(`/api/business-ideas/${id}`);
  }
  
  async generateBusinessIdeas(params?: {
    pain_point_ids?: string[];
    category?: string;
    count?: number;
  }): Promise<ApiResponse<{ message: string; task_id: string; expected_count: number }>> {
    return this.request('/api/business-ideas/generate', {
      method: 'POST',
      body: JSON.stringify(params || {})
    });
  }
  
  // ========================================================================
  // Analytics API
  // ========================================================================
  
  async getAnalyticsOverview(): Promise<ApiResponse<AnalyticsOverview>> {
    return this.request('/api/analytics/overview');
  }
  
  async getTrendingKeywords(params?: {
    days?: number;
    limit?: number;
  }): Promise<ApiResponse<{ keywords: TrendingKeyword[]; total_keywords: number; period_days: number }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.days) queryParams.append('days', params.days.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.request(`/api/analytics/trending-keywords${query ? `?${query}` : ''}`);
  }
  
  async getPerformanceMetrics(): Promise<ApiResponse<{
    api_health: string;
    database_status: string;
    ai_service_status: string;
    telegram_bot_status: string;
    last_data_collection: string;
    last_idea_generation: string;
    last_telegram_digest: string;
  }>> {
    return this.request('/api/analytics/performance');
  }
  
  // ========================================================================
  // Telegram API
  // ========================================================================
  
  async sendTelegramDigest(): Promise<ApiResponse<{ message: string; status: string }>> {
    return this.request('/api/telegram/send-digest', { method: 'POST' });
  }
  
  async previewTelegramDigest(): Promise<ApiResponse<TelegramDigest>> {
    return this.request('/api/telegram/digest/preview');
  }
  
  async sendTelegramTest(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request('/api/telegram/test', { method: 'POST' });
  }
  
  async getTelegramStats(days: number = 7): Promise<ApiResponse<{
    total_sent: number;
    success_rate: number;
    avg_engagement: number;
    last_sent: string;
    period_days: number;
  }>> {
    return this.request(`/api/telegram/stats?days=${days}`);
  }
  
  // ========================================================================
  // Community API (Epic 2 - Future)
  // ========================================================================
  
  async getCommunityStatus(): Promise<ApiResponse<{
    status: string;
    message: string;
    expected_features: string;
  }>> {
    return this.request('/api/community');
  }
  
  async getCommunityHealth(): Promise<ApiResponse<{
    service: string;
    status: string;
    epic: string;
  }>> {
    return this.request('/api/community/health');
  }
}

// ============================================================================
// API Client Instance
// ============================================================================

export const apiClient = new APIClient();

// ============================================================================
// Convenience Hook Functions
// ============================================================================

export const api = {
  // Health
  health: () => apiClient.getHealth(),
  root: () => apiClient.getRoot(),
  
  // Pain Points
  painPoints: {
    list: (params?: Parameters<typeof apiClient.getPainPoints>[0]) => 
      apiClient.getPainPoints(params),
    get: (id: string) => apiClient.getPainPoint(id),
    collect: () => apiClient.triggerPainPointCollection(),
    stats: () => apiClient.getPainPointStats(),
  },
  
  // Business Ideas
  businessIdeas: {
    list: (params?: Parameters<typeof apiClient.getBusinessIdeas>[0]) => 
      apiClient.getBusinessIdeas(params),
    get: (id: string) => apiClient.getBusinessIdea(id),
    generate: (params?: Parameters<typeof apiClient.generateBusinessIdeas>[0]) => 
      apiClient.generateBusinessIdeas(params),
  },
  
  // Analytics
  analytics: {
    overview: () => apiClient.getAnalyticsOverview(),
    trendingKeywords: (params?: Parameters<typeof apiClient.getTrendingKeywords>[0]) => 
      apiClient.getTrendingKeywords(params),
    performance: () => apiClient.getPerformanceMetrics(),
  },
  
  // Telegram
  telegram: {
    sendDigest: () => apiClient.sendTelegramDigest(),
    previewDigest: () => apiClient.previewTelegramDigest(),
    test: () => apiClient.sendTelegramTest(),
    stats: (days?: number) => apiClient.getTelegramStats(days),
  },
  
  // Community (Future)
  community: {
    status: () => apiClient.getCommunityStatus(),
    health: () => apiClient.getCommunityHealth(),
  },
};

// ============================================================================
// Type Exports for External Usage
// ============================================================================

export type { ApiResponse, PainPoint, BusinessIdea, AnalyticsOverview, TelegramDigest, TrendingKeyword };

export default apiClient;