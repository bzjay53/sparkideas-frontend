-- IdeaSpark 누락된 테이블 생성 스크립트
-- 실행 방법: Supabase Dashboard SQL Editor에서 실행

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Telegram Messages table - 텔레그램 봇 메시지 추적
CREATE TABLE IF NOT EXISTS telegram_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('daily_digest', 'single_idea', 'alert')),
  business_idea_ids UUID[] DEFAULT '{}',
  message_content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table - 사용자 관리 및 환경설정
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  telegram_chat_id TEXT,
  notification_preferences JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Analytics table - 일일 집계 통계
CREATE TABLE IF NOT EXISTS daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  pain_points_collected INTEGER DEFAULT 0,
  business_ideas_generated INTEGER DEFAULT 0,
  telegram_messages_sent INTEGER DEFAULT 0,
  community_posts_created INTEGER DEFAULT 0,
  avg_confidence_score DECIMAL(5,2) DEFAULT 0.0,
  top_categories JSONB DEFAULT '{}',
  trending_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_telegram_messages_sent_at ON telegram_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date DESC);

-- Create Row Level Security policies
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for daily_analytics
CREATE POLICY "Allow public read access on daily_analytics" ON daily_analytics FOR SELECT USING (true);

-- Service role can do everything (for background tasks)
CREATE POLICY "Service role can do anything on telegram_messages" ON telegram_messages USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do anything on daily_analytics" ON daily_analytics USING (auth.role() = 'service_role');

-- User-based policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_analytics_updated_at BEFORE UPDATE ON daily_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample analytics data
INSERT INTO daily_analytics (date, pain_points_collected, business_ideas_generated, telegram_messages_sent, community_posts_created, avg_confidence_score, top_categories, trending_keywords) VALUES
(CURRENT_DATE, 245, 28, 47, 12, 84.2, '{"development": 45, "productivity": 32, "ecommerce": 28}', ARRAY['React', 'AI', '원격근무', '상태관리', '효율성']),
(CURRENT_DATE - INTERVAL '1 day', 312, 35, 43, 18, 86.1, '{"development": 52, "productivity": 38, "ecommerce": 31}', ARRAY['Vue.js', '머신러닝', '협업도구', '자동화', 'SaaS'])
ON CONFLICT (date) DO UPDATE SET
  pain_points_collected = EXCLUDED.pain_points_collected,
  business_ideas_generated = EXCLUDED.business_ideas_generated,
  telegram_messages_sent = EXCLUDED.telegram_messages_sent,
  community_posts_created = EXCLUDED.community_posts_created,
  avg_confidence_score = EXCLUDED.avg_confidence_score,
  top_categories = EXCLUDED.top_categories,
  trending_keywords = EXCLUDED.trending_keywords,
  updated_at = NOW();

-- Create analytics view for easy querying
CREATE OR REPLACE VIEW analytics_overview AS
SELECT 
  SUM(pain_points_collected) as total_pain_points,
  SUM(business_ideas_generated) as total_ideas,
  SUM(telegram_messages_sent) as total_messages,
  SUM(community_posts_created) as total_posts,
  AVG(avg_confidence_score) as overall_avg_confidence,
  COUNT(*) as total_days
FROM daily_analytics
WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ 누락된 테이블 생성 완료!';
  RAISE NOTICE '📊 생성된 테이블: telegram_messages, users, daily_analytics';
  RAISE NOTICE '🔍 샘플 데이터 삽입 완료';
END $$;