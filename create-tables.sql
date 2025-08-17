-- Create basic pain_points table for testing
CREATE TABLE IF NOT EXISTS pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    source_url TEXT DEFAULT '',
    sentiment_score DECIMAL(3,2) DEFAULT 0.0,
    trend_score DECIMAL(3,2) DEFAULT 0.0,
    keywords TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'general',
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test data
INSERT INTO pain_points (title, content, source, sentiment_score, trend_score) VALUES 
('테스트 갈증포인트 1', '개발할 때 항상 배포가 어려워요', 'manual', 0.8, 0.9),
('테스트 갈증포인트 2', 'UI 컴포넌트 재사용이 힘들어요', 'manual', 0.7, 0.8);