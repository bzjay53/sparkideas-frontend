-- IdeaSpark Supabase Database Schema
-- 100% Real Implementation for Production

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pain Points table
CREATE TABLE IF NOT EXISTS pain_points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    platform TEXT NOT NULL,
    url TEXT,
    confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    business_potential INTEGER DEFAULT 0 CHECK (business_potential >= 0 AND business_potential <= 100),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Ideas table
CREATE TABLE IF NOT EXISTS business_ideas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pain_point_id UUID REFERENCES pain_points(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    market_size TEXT CHECK (market_size IN ('small', 'medium', 'large', 'very_large')),
    implementation_difficulty TEXT CHECK (implementation_difficulty IN ('low', 'medium', 'high', 'very_high')),
    revenue_potential TEXT CHECK (revenue_potential IN ('low', 'medium', 'high', 'very_high')),
    target_audience TEXT,
    competitive_advantage TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'rejected', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (using Supabase Auth, this is for additional profile data)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'premium')),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business', 'enterprise')),
    credits_remaining INTEGER DEFAULT 10,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pain_points_category ON pain_points(category);
CREATE INDEX IF NOT EXISTS idx_pain_points_status ON pain_points(status);
CREATE INDEX IF NOT EXISTS idx_pain_points_created_at ON pain_points(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pain_points_confidence_score ON pain_points(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_pain_points_business_potential ON pain_points(business_potential DESC);

CREATE INDEX IF NOT EXISTS idx_business_ideas_pain_point_id ON business_ideas(pain_point_id);
CREATE INDEX IF NOT EXISTS idx_business_ideas_status ON business_ideas(status);
CREATE INDEX IF NOT EXISTS idx_business_ideas_created_at ON business_ideas(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_pain_points_updated_at 
    BEFORE UPDATE ON pain_points 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_business_ideas_updated_at 
    BEFORE UPDATE ON business_ideas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for pain points and business ideas
CREATE POLICY "Public can read pain points" ON pain_points
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public can read approved business ideas" ON business_ideas
    FOR SELECT USING (status = 'approved');

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin policies (for user with admin role)
CREATE POLICY "Admins can do everything on pain points" ON pain_points
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can do everything on business ideas" ON business_ideas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert some initial data
INSERT INTO pain_points (title, description, category, platform, confidence_score, business_potential) 
VALUES 
    ('개발자 API 문서화 시간 과다 소비', '개발팀에서 API 문서 작성이 개발 시간의 30% 이상을 차지하고 있으며, 자동화 도구 필요성 급증', '개발도구', 'Stack Overflow', 92, 85),
    ('소상공인 온라인 마케팅 진입장벽', 'Instagram, 네이버 블로그 등 플랫폼별 콘텐츠 최적화 어려움으로 온라인 마케팅 포기율 증가', '마케팅', '네이버 카페', 88, 92),
    ('재택근무 집중력 관리 문제', '집에서 일하는 직장인들의 집중력 유지 어려움과 생산성 저하 문제 심화', '생산성', 'Reddit', 79, 76),
    ('중소기업 데이터 분석 역량 부족', '데이터는 많지만 분석할 인력과 도구가 부족한 중소기업들의 고민', '분석도구', 'LinkedIn', 85, 88),
    ('프리랜서 프로젝트 관리 복잡성', '여러 클라이언트, 다양한 프로젝트를 동시에 관리해야 하는 프리랜서들의 업무 관리 어려움', '프로젝트관리', 'Freelancer 커뮤니티', 82, 77)
ON CONFLICT DO NOTHING;

INSERT INTO business_ideas (pain_point_id, title, description, market_size, implementation_difficulty, revenue_potential, target_audience)
SELECT 
    pp.id,
    CASE 
        WHEN pp.title LIKE '%API 문서%' THEN 'AI 기반 자동 API 문서 생성기'
        WHEN pp.title LIKE '%온라인 마케팅%' THEN '소상공인 전용 올인원 마케팅 플랫폼'
        WHEN pp.title LIKE '%집중력%' THEN '스마트 집중력 관리 앱'
        WHEN pp.title LIKE '%데이터 분석%' THEN 'No-Code 비즈니스 인텔리전스 플랫폼'
        WHEN pp.title LIKE '%프로젝트 관리%' THEN '프리랜서 전용 올인원 워크스페이스'
    END,
    CASE 
        WHEN pp.title LIKE '%API 문서%' THEN '코드 분석하여 자동으로 API 문서를 생성하고 실시간 업데이트하는 AI 도구'
        WHEN pp.title LIKE '%온라인 마케팅%' THEN '하나의 도구로 모든 SNS 플랫폼에 맞춤형 콘텐츠를 자동 생성하고 배포하는 마케팅 솔루션'
        WHEN pp.title LIKE '%집중력%' THEN 'AI가 개인의 집중 패턴을 학습하여 최적의 작업 환경을 제안하는 생산성 앱'
        WHEN pp.title LIKE '%데이터 분석%' THEN '코딩 없이 드래그&드롭으로 데이터 분석과 시각화를 할 수 있는 BI 도구'
        WHEN pp.title LIKE '%프로젝트 관리%' THEN '프로젝트 관리, 시간 추적, 인보이스, 클라이언트 소통을 하나로 통합한 플랫폼'
    END,
    CASE 
        WHEN pp.title LIKE '%API 문서%' THEN 'medium'
        WHEN pp.title LIKE '%온라인 마케팅%' THEN 'large'
        WHEN pp.title LIKE '%집중력%' THEN 'medium'
        WHEN pp.title LIKE '%데이터 분석%' THEN 'large'
        WHEN pp.title LIKE '%프로젝트 관리%' THEN 'medium'
    END,
    CASE 
        WHEN pp.title LIKE '%API 문서%' THEN 'high'
        WHEN pp.title LIKE '%온라인 마케팅%' THEN 'medium'
        WHEN pp.title LIKE '%집중력%' THEN 'medium'
        WHEN pp.title LIKE '%데이터 분석%' THEN 'high'
        WHEN pp.title LIKE '%프로젝트 관리%' THEN 'medium'
    END,
    CASE 
        WHEN pp.title LIKE '%API 문서%' THEN 'high'
        WHEN pp.title LIKE '%온라인 마케팅%' THEN 'very_high'
        WHEN pp.title LIKE '%집중력%' THEN 'medium'
        WHEN pp.title LIKE '%데이터 분석%' THEN 'high'
        WHEN pp.title LIKE '%프로젝트 관리%' THEN 'high'
    END,
    CASE 
        WHEN pp.title LIKE '%API 문서%' THEN '개발팀, 스타트업, API 서비스 제공업체'
        WHEN pp.title LIKE '%온라인 마케팅%' THEN '소상공인, 자영업자, 소규모 비즈니스'
        WHEN pp.title LIKE '%집중력%' THEN '재택근무자, 프리랜서, 학생'
        WHEN pp.title LIKE '%데이터 분석%' THEN '중소기업, 스타트업, 마케팅 담당자'
        WHEN pp.title LIKE '%프로젝트 관리%' THEN '프리랜서, 1인 사업자, 소규모 에이전시'
    END
FROM pain_points pp
ON CONFLICT DO NOTHING;