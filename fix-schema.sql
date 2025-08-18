-- 빠른 스키마 수정을 위한 SQL 스크립트
-- Supabase SQL Editor에서 실행

-- 필수 컬럼만 추가 (간단한 버전)
ALTER TABLE pain_points ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE business_ideas ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2) DEFAULT 0.0;

-- 확인 쿼리
SELECT 
    table_name, 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name IN ('pain_points', 'business_ideas') 
  AND column_name IN ('category', 'confidence_score')
ORDER BY table_name, column_name;