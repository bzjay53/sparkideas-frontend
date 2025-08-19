-- Fix Community Posts Table Schema
-- 실행 방법: Supabase Dashboard SQL Editor에서 실행

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Community Posts table - 커뮤니티 게시글
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- 외래키 없이 UUID만 저장 (임시)
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);

-- Create Row Level Security policies
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (모든 사용자가 게시글을 볼 수 있음)
DROP POLICY IF EXISTS "Users can view all community posts" ON community_posts;
CREATE POLICY "Allow public read access on community_posts" ON community_posts FOR SELECT USING (true);

-- Allow anyone to create posts (인증 없이 임시로 허용)
DROP POLICY IF EXISTS "Users can create their own posts" ON community_posts;
CREATE POLICY "Allow public create on community_posts" ON community_posts FOR INSERT WITH CHECK (true);

-- Allow anyone to update posts (임시로 허용)
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
CREATE POLICY "Allow public update on community_posts" ON community_posts FOR UPDATE USING (true);

-- Service role can do everything
CREATE POLICY "Service role can do anything on community_posts" ON community_posts USING (auth.role() = 'service_role');

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample community posts
INSERT INTO community_posts (user_id, title, content, category, tags, project_status, likes_count, comments_count) VALUES
('00000000-0000-0000-0000-000000000001', '🚀 React Native 쇼핑몰 앱 완성!', '3개월 동안 개발한 React Native 쇼핑몰 앱을 드디어 완성했습니다. Firebase와 Stripe 결제 시스템을 연동했고, 디자인은 Figma에서 직접 제작했어요. 많은 분들의 피드백을 받고 싶습니다!', '자랑', ARRAY['React Native', 'Firebase', 'Stripe', '쇼핑몰'], 'launched', 24, 8),
('00000000-0000-0000-0000-000000000002', '🤝 AI 스타트업 공동창업자 모집', 'ChatGPT API를 활용한 B2B SaaS 플랫폼을 함께 만들어갈 CTO급 개발자를 찾고 있습니다. 이미 MVP는 완성되었고, 초기 고객 확보도 완료했습니다. 지분 참여 가능하신 분 연락주세요!', '협업', ARRAY['AI', 'ChatGPT', 'B2B', 'SaaS', 'CTO'], 'development', 18, 12),
('00000000-0000-0000-0000-000000000003', '💼 Next.js 웹사이트 개발 외주', '회사 홈페이지를 Next.js로 새로 만들어주실 개발자를 찾습니다. 디자인 시안은 준비되어 있고, SEO 최적화와 반응형 웹이 필요합니다. 예산은 300만원 정도로 생각하고 있어요.', '외주', ARRAY['Next.js', 'SEO', '반응형', '홈페이지'], 'idea', 7, 3),
('00000000-0000-0000-0000-000000000004', '💬 개발자 번아웃 극복 방법 공유', '5년차 풀스택 개발자인데 최근에 심한 번아웃을 겪었어요. 어떻게 극복했는지, 그리고 예방할 수 있는 방법들을 정리해서 공유합니다. 같은 고민을 하시는 분들께 도움이 되길 바라요.', '공유', ARRAY['번아웃', '개발자', '멘탈케어', '경험담'], 'completed', 31, 15)
ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Community Posts 테이블 생성 및 설정 완료!';
  RAISE NOTICE '📝 샘플 게시글 4개 추가';
  RAISE NOTICE '🔒 RLS 정책 설정 완료 (임시 공개 허용)';
END $$;