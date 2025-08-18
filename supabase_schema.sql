-- IdeaSpark Database Schema for Supabase
-- This creates all necessary tables for the real-time pain point analysis and business idea generation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pain Points table - stores collected pain points from various sources
CREATE TABLE IF NOT EXISTS pain_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('reddit', 'google', 'naver', 'linkedin', 'twitter')),
  source_url TEXT NOT NULL,
  sentiment_score DECIMAL(3,2) DEFAULT 0.0,
  trend_score DECIMAL(3,2) DEFAULT 0.0,
  keywords TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general',
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Ideas table - stores AI-generated business ideas
CREATE TABLE IF NOT EXISTS business_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_market TEXT NOT NULL,
  revenue_model TEXT NOT NULL,
  market_size TEXT NOT NULL,
  implementation_difficulty INTEGER CHECK (implementation_difficulty >= 1 AND implementation_difficulty <= 5),
  confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  pain_point_ids UUID[] DEFAULT '{}',
  ai_analysis JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Telegram Messages table - tracks telegram bot message deliveries
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

-- Users table - user management and preferences
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

-- Community Posts table - user-generated content and collaboration
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('자랑', '공유', '외주', '협업')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  project_status TEXT DEFAULT 'idea' CHECK (project_status IN ('idea', 'development', 'launched', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Analytics table - aggregated daily statistics
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
CREATE INDEX IF NOT EXISTS idx_pain_points_source ON pain_points(source);
CREATE INDEX IF NOT EXISTS idx_pain_points_trend_score ON pain_points(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_pain_points_collected_at ON pain_points(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_ideas_confidence ON business_ideas(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_business_ideas_generated_at ON business_ideas(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_sent_at ON telegram_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date DESC);

-- Create Row Level Security policies
ALTER TABLE pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for pain points and business ideas
CREATE POLICY "Allow public read access on pain_points" ON pain_points FOR SELECT USING (true);
CREATE POLICY "Allow public read access on business_ideas" ON business_ideas FOR SELECT USING (true);
CREATE POLICY "Allow public read access on daily_analytics" ON daily_analytics FOR SELECT USING (true);

-- User-based policies for community posts
CREATE POLICY "Users can view all community posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything (for background tasks)
CREATE POLICY "Service role can do anything on pain_points" ON pain_points USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do anything on business_ideas" ON business_ideas USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do anything on telegram_messages" ON telegram_messages USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do anything on daily_analytics" ON daily_analytics USING (auth.role() = 'service_role');

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_pain_points_updated_at BEFORE UPDATE ON pain_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_ideas_updated_at BEFORE UPDATE ON business_ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_analytics_updated_at BEFORE UPDATE ON daily_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO pain_points (title, content, source, source_url, sentiment_score, trend_score, keywords, category) VALUES
('React 상태 관리 복잡성', 'Redux는 너무 복잡하고, Context API는 성능 이슈가 있어서 중간 규모 프로젝트에서 어떤 상태 관리를 써야 할지 모르겠다.', 'reddit', 'https://reddit.com/r/reactjs/sample1', 0.35, 0.91, ARRAY['React', 'Redux', 'Context API', '상태 관리'], 'development'),
('원격근무 시 소통 문제', '슬랙으로는 빠른 의사소통이 어렵고, 줌 미팅은 너무 많아서 집중할 시간이 없다. 효율적인 원격 소통 방법이 필요하다.', 'linkedin', 'https://linkedin.com/posts/sample1', 0.28, 0.85, ARRAY['원격근무', '소통', '슬랙', '줌', '효율성'], 'productivity'),
('온라인 쇼핑몰 리뷰 신뢰성', '상품 리뷰가 너무 많아서 어떤 게 진짜 후기인지 모르겠다. AI로 가짜 리뷰 걸러주는 서비스 있으면 좋겠다.', 'naver', 'https://cafe.naver.com/sample1', 0.42, 0.78, ARRAY['온라인 쇼핑', '리뷰', '신뢰성', 'AI', '가짜 리뷰'], 'ecommerce')
ON CONFLICT DO NOTHING;

INSERT INTO business_ideas (title, description, target_market, revenue_model, market_size, implementation_difficulty, confidence_score, pain_point_ids, ai_analysis) VALUES
('React 상태 관리 통합 솔루션', 'Redux의 강력함과 Context API의 간편함을 결합한 중간 복잡도 프로젝트를 위한 상태 관리 라이브러리', '리액트 개발자, 중소규모 개발팀', 'MIT 라이선스 + 프리미엄 지원', '글로벌 리액트 개발자 시장의 15%', 3, 87.5, ARRAY[]::UUID[], '{"market_analysis": "high_demand", "technical_feasibility": "moderate", "competition": "medium"}'),
('AI 기반 원격 소통 최적화 도구', '팀의 소통 패턴을 분석하여 최적의 소통 방법과 시간을 제안하는 AI 도구', '원격근무 팀, 스타트업, 중소기업', '월 구독 모델 ($20/월 per team)', '원격근무 소프트웨어 시장의 8%', 4, 82.3, ARRAY[]::UUID[], '{"market_analysis": "growing_fast", "technical_feasibility": "high", "competition": "low"}')
ON CONFLICT DO NOTHING;

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

-- View for easy analytics queries
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