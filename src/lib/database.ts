import { supabase } from './supabase';
import type { Tables, Inserts, Updates } from './supabase';

// Pain Points Operations
export class PainPointService {
  static async create(data: Inserts<'pain_points'>) {
    const { data: painPoint, error } = await supabase
      .from('pain_points')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return painPoint;
  }

  static async getAll(limit = 50) {
    const { data, error } = await supabase
      .from('pain_points')
      .select('*')
      .order('collected_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async getBySource(source: string, limit = 20) {
    const { data, error } = await supabase
      .from('pain_points')
      .select('*')
      .eq('source', source)
      .order('collected_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async getTrending(limit = 10) {
    const { data, error } = await supabase
      .from('pain_points')
      .select('*')
      .order('trend_score', { ascending: false })
      .order('sentiment_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async searchByKeywords(keywords: string[], limit = 20) {
    const { data, error } = await supabase
      .from('pain_points')
      .select('*')
      .overlaps('keywords', keywords)
      .order('trend_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async markAsProcessed(id: string) {
    const { data, error } = await supabase
      .from('pain_points')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Business Ideas Operations
export class BusinessIdeaService {
  static async create(data: Inserts<'business_ideas'>) {
    const { data: idea, error } = await supabase
      .from('business_ideas')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return idea;
  }

  static async getTopIdeas(limit = 20) {
    const { data, error } = await supabase
      .from('business_ideas')
      .select('*')
      .order('confidence_score', { ascending: false })
      .order('generated_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async getByDifficulty(difficulty: number, limit = 10) {
    const { data, error } = await supabase
      .from('business_ideas')
      .select('*')
      .eq('implementation_difficulty', difficulty)
      .order('confidence_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async getForTelegramDigest(limit = 5) {
    const { data, error } = await supabase
      .from('business_ideas')
      .select('*')
      .gte('confidence_score', 85)
      .order('generated_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async getDailyStats(date: string) {
    const { data, error } = await supabase
      .from('business_ideas')
      .select('id, confidence_score, implementation_difficulty')
      .gte('generated_at', `${date}T00:00:00.000Z`)
      .lt('generated_at', `${date}T23:59:59.999Z`);
    
    if (error) throw error;
    return {
      total: data.length,
      avgConfidence: data.reduce((sum, idea) => sum + idea.confidence_score, 0) / data.length || 0,
      byDifficulty: data.reduce((acc, idea) => {
        acc[idea.implementation_difficulty] = (acc[idea.implementation_difficulty] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    };
  }
}

// Telegram Messages Operations
export class TelegramService {
  static async logMessage(data: Inserts<'telegram_messages'>) {
    const { data: message, error } = await supabase
      .from('telegram_messages')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return message;
  }

  static async getDeliveryStats(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('telegram_messages')
      .select('success, message_type, sent_at')
      .gte('sent_at', startDate.toISOString());
    
    if (error) throw error;
    
    return {
      total: data.length,
      successful: data.filter(m => m.success).length,
      failed: data.filter(m => !m.success).length,
      successRate: data.length > 0 ? (data.filter(m => m.success).length / data.length) * 100 : 0,
      byType: data.reduce((acc, msg) => {
        acc[msg.message_type] = (acc[msg.message_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  static async getRecentMessages(limit = 20) {
    const { data, error } = await supabase
      .from('telegram_messages')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
}

// Community Operations
export class CommunityService {
  static async createPost(data: Inserts<'community_posts'>) {
    const { data: post, error } = await supabase
      .from('community_posts')
      .insert(data)
      .select('*')
      .single();
    
    if (error) throw error;
    return post;
  }

  static async getPosts(category?: string, limit = 20) {
    let query = supabase
      .from('community_posts')
      .select('*, users(display_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getPostById(id: string) {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, users(display_name, email)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async incrementLikes(postId: string) {
    const { data, error } = await supabase
      .rpc('increment_likes', { post_id: postId });
    
    if (error) throw error;
    return data;
  }

  static async searchPosts(query: string, limit = 20) {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, users(display_name)')
      .textSearch('title', query)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
}

// User Operations
export class UserService {
  static async createUser(data: Inserts<'users'>) {
    const { data: user, error } = await supabase
      .from('users')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return user;
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: Updates<'users'>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Analytics Operations
export class AnalyticsService {
  static async getDailyAnalytics(days = 7) {
    const { data, error } = await supabase
      .from('daily_analytics')
      .select('*')
      .limit(days);
    
    if (error) throw error;
    return data;
  }

  static async getTopBusinessIdeas(limit = 20) {
    const { data, error } = await supabase
      .from('top_business_ideas')
      .select('*')
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async getTrendingKeywords(daysBack = 7) {
    const { data, error } = await supabase
      .rpc('get_trending_keywords', { days_back: daysBack });
    
    if (error) throw error;
    return data;
  }

  static async getOverallStats() {
    const [painPointsCount, businessIdeasCount, telegramCount, communityCount] = await Promise.all([
      supabase.from('pain_points').select('id', { count: 'exact', head: true }),
      supabase.from('business_ideas').select('id', { count: 'exact', head: true }),
      supabase.from('telegram_messages').select('id', { count: 'exact', head: true }),
      supabase.from('community_posts').select('id', { count: 'exact', head: true })
    ]);

    return {
      painPoints: painPointsCount.count || 0,
      businessIdeas: businessIdeasCount.count || 0,
      telegramMessages: telegramCount.count || 0,
      communityPosts: communityCount.count || 0
    };
  }
}