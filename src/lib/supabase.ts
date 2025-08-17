import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      pain_points: {
        Row: {
          id: string;
          title: string;
          content: string;
          source: 'reddit' | 'google' | 'naver' | 'linkedin' | 'twitter';
          source_url: string;
          sentiment_score: number;
          trend_score: number;
          keywords: string[];
          category: string;
          collected_at: string;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          source: 'reddit' | 'google' | 'naver' | 'linkedin' | 'twitter';
          source_url: string;
          sentiment_score?: number;
          trend_score?: number;
          keywords?: string[];
          category?: string;
          collected_at?: string;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          source?: 'reddit' | 'google' | 'naver' | 'linkedin' | 'twitter';
          source_url?: string;
          sentiment_score?: number;
          trend_score?: number;
          keywords?: string[];
          category?: string;
          collected_at?: string;
          processed_at?: string | null;
          updated_at?: string;
        };
      };
      business_ideas: {
        Row: {
          id: string;
          title: string;
          description: string;
          target_market: string;
          revenue_model: string;
          market_size: string;
          implementation_difficulty: 1 | 2 | 3 | 4 | 5;
          confidence_score: number;
          pain_point_ids: string[];
          ai_analysis: any;
          generated_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          target_market: string;
          revenue_model: string;
          market_size: string;
          implementation_difficulty: 1 | 2 | 3 | 4 | 5;
          confidence_score: number;
          pain_point_ids: string[];
          ai_analysis?: any;
          generated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          target_market?: string;
          revenue_model?: string;
          market_size?: string;
          implementation_difficulty?: 1 | 2 | 3 | 4 | 5;
          confidence_score?: number;
          pain_point_ids?: string[];
          ai_analysis?: any;
          generated_at?: string;
          updated_at?: string;
        };
      };
      telegram_messages: {
        Row: {
          id: string;
          chat_id: string;
          message_type: 'daily_digest' | 'single_idea' | 'alert';
          business_idea_ids: string[];
          message_content: string;
          sent_at: string;
          success: boolean;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          message_type: 'daily_digest' | 'single_idea' | 'alert';
          business_idea_ids: string[];
          message_content: string;
          sent_at?: string;
          success?: boolean;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          message_type?: 'daily_digest' | 'single_idea' | 'alert';
          business_idea_ids?: string[];
          message_content?: string;
          sent_at?: string;
          success?: boolean;
          error_message?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          telegram_chat_id: string | null;
          notification_preferences: any;
          subscription_tier: 'free' | 'pro' | 'business';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          telegram_chat_id?: string | null;
          notification_preferences?: any;
          subscription_tier?: 'free' | 'pro' | 'business';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          telegram_chat_id?: string | null;
          notification_preferences?: any;
          subscription_tier?: 'free' | 'pro' | 'business';
          updated_at?: string;
        };
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          tags: string[];
          category: '자랑' | '공유' | '외주' | '협업';
          likes_count: number;
          comments_count: number;
          project_status: 'idea' | 'development' | 'launched' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          tags?: string[];
          category: '자랑' | '공유' | '외주' | '협업';
          likes_count?: number;
          comments_count?: number;
          project_status?: 'idea' | 'development' | 'launched' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          tags?: string[];
          category?: '자랑' | '공유' | '외주' | '협업';
          likes_count?: number;
          comments_count?: number;
          project_status?: 'idea' | 'development' | 'launched' | 'completed';
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];