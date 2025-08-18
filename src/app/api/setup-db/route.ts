import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 데이터베이스 스키마 설정 시작...');
    
    const results = {
      createdTables: [] as string[],
      errors: [] as string[],
      samplesInserted: [] as string[]
    };

    // 1. telegram_messages 테이블 생성
    try {
      const { error: telegramError } = await supabase.rpc('exec_sql', {
        query: `
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
          
          CREATE INDEX IF NOT EXISTS idx_telegram_messages_sent_at ON telegram_messages(sent_at DESC);
          ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Service role can do anything on telegram_messages" 
          ON telegram_messages USING (auth.role() = 'service_role');
        `
      });

      if (telegramError && !telegramError.message.includes('already exists')) {
        results.errors.push(`Telegram table: ${telegramError.message}`);
      } else {
        results.createdTables.push('telegram_messages');
      }
    } catch (err: any) {
      // RPC가 없는 경우 직접 테이블 생성 시도
      const { error } = await supabase
        .from('telegram_messages')
        .select('id')
        .limit(1);
        
      if (error && error.message.includes('does not exist')) {
        results.errors.push('telegram_messages 테이블이 없습니다. Supabase Dashboard에서 수동 생성이 필요합니다.');
      } else {
        results.createdTables.push('telegram_messages (already exists)');
      }
    }

    // 2. users 테이블 생성
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
        
      if (error && error.message.includes('does not exist')) {
        results.errors.push('users 테이블이 없습니다. Supabase Dashboard에서 수동 생성이 필요합니다.');
      } else {
        results.createdTables.push('users (already exists)');
      }
    } catch (err: any) {
      results.errors.push(`Users table check: ${err.message}`);
    }

    // 3. daily_analytics 테이블 생성
    try {
      const { error } = await supabase
        .from('daily_analytics')
        .select('id')
        .limit(1);
        
      if (error && error.message.includes('does not exist')) {
        results.errors.push('daily_analytics 테이블이 없습니다. Supabase Dashboard에서 수동 생성이 필요합니다.');
      } else {
        results.createdTables.push('daily_analytics (already exists)');
      }
    } catch (err: any) {
      results.errors.push(`Daily analytics table check: ${err.message}`);
    }

    // 4. 기존 테이블에 샘플 데이터 삽입 시도
    try {
      // Pain points 샘플 데이터
      const { error: painError } = await supabase
        .from('pain_points')
        .upsert([
          {
            title: 'React useState가 업데이트 안되는 문제',
            content: 'setState를 호출해도 컴포넌트가 리렌더링되지 않습니다. 클로저 문제인 것 같은데 어떻게 해결하나요?',
            source: 'reddit',
            source_url: 'https://reddit.com/r/reactjs/sample1',
            sentiment_score: 0.3,
            trend_score: 0.85,
            keywords: ['React', 'useState', 'setState', '리렌더링', '클로저'],
            category: 'development'
          },
          {
            title: '스타트업 초기 고객 확보 방법',
            content: 'MVP를 만들었는데 첫 고객을 어떻게 확보해야 할지 모르겠습니다. 마케팅 예산이 거의 없는 상황에서 효과적인 방법이 있을까요?',
            source: 'reddit',
            source_url: 'https://reddit.com/r/startups/sample2',
            sentiment_score: 0.4,
            trend_score: 0.78,
            keywords: ['스타트업', 'MVP', '고객 확보', '마케팅', '예산'],
            category: 'business'
          }
        ], { onConflict: 'source_url' });

      if (!painError) {
        results.samplesInserted.push('pain_points');
      }
    } catch (err: any) {
      results.errors.push(`Sample data insertion: ${err.message}`);
    }

    // 5. Business ideas 샘플 데이터
    try {
      const { error: ideaError } = await supabase
        .from('business_ideas')
        .upsert([
          {
            title: 'React 상태 관리 통합 솔루션',
            description: 'Redux의 강력함과 Context API의 간편함을 결합한 중간 복잡도 프로젝트를 위한 상태 관리 라이브러리',
            target_market: '리액트 개발자, 중소규모 개발팀',
            revenue_model: 'MIT 라이선스 + 프리미엄 지원',
            market_size: '글로벌 리액트 개발자 시장의 15%',
            implementation_difficulty: 3,
            confidence_score: 87.5,
            pain_point_ids: [],
            ai_analysis: {
              market_analysis: 'high_demand',
              technical_feasibility: 'moderate',
              competition: 'medium'
            }
          }
        ], { onConflict: 'title' });

      if (!ideaError) {
        results.samplesInserted.push('business_ideas');
      }
    } catch (err: any) {
      results.errors.push(`Business ideas sample: ${err.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      results,
      instructions: results.errors.length > 0 ? 
        'Some tables need manual creation in Supabase Dashboard. Check scripts/create-missing-tables.sql' : 
        'All tables are ready!'
    });

  } catch (error: any) {
    console.error('Database setup error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      message: error.message,
      instruction: 'Please run the SQL script manually in Supabase Dashboard'
    }, { status: 500 });
  }
}