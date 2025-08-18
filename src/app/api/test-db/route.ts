import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Supabase 연결 테스트 시작...');
    
    const results = {
      connected: false,
      needsSchema: false,
      tableStatus: {} as Record<string, string>,
      recordCounts: {} as Record<string, number>,
      errors: [] as string[]
    };

    // 1. 기본 연결 테스트
    try {
      const { data, error } = await supabase.from('pain_points').select('count').limit(1);
      
      if (error) {
        if (error.message.includes('relation "pain_points" does not exist')) {
          results.needsSchema = true;
          results.connected = true;
          results.errors.push('pain_points 테이블이 존재하지 않습니다');
          
          return NextResponse.json({
            success: false,
            message: 'Database schema needs to be deployed',
            results
          });
        } else {
          results.errors.push(`Connection error: ${error.message}`);
          return NextResponse.json({
            success: false,
            message: 'Database connection failed',
            results
          });
        }
      }
      
      results.connected = true;
      
    } catch (err: any) {
      results.errors.push(`Connection test failed: ${err.message}`);
      return NextResponse.json({
        success: false,
        message: 'Connection test failed',
        results
      });
    }

    // 2. 각 테이블 존재 확인
    const tables = ['pain_points', 'business_ideas', 'telegram_messages', 'users', 'community_posts', 'daily_analytics'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        if (error) {
          results.tableStatus[table] = `❌ ${error.message}`;
          results.recordCounts[table] = 0;
        } else {
          results.tableStatus[table] = '✅';
          
          // 레코드 수 확인
          const { count, error: countError } = await supabase
            .from(table)
            .select('id', { count: 'exact' })
            .limit(0);
            
          results.recordCounts[table] = count || 0;
        }
      } catch (err: any) {
        results.tableStatus[table] = `❌ ${err.message}`;
        results.recordCounts[table] = 0;
      }
    }

    // 3. 샘플 데이터 확인
    if (results.tableStatus['pain_points'] === '✅') {
      const { data: painPointsData } = await supabase
        .from('pain_points')
        .select('*')
        .limit(3);
        
      if (painPointsData && painPointsData.length > 0) {
        results.errors.push(`Found sample data: ${painPointsData[0].title}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database test completed successfully',
      results,
      recommendation: results.needsSchema 
        ? 'Deploy supabase_schema.sql to create tables'
        : 'Database is ready for use'
    });

  } catch (error: any) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      message: error.message
    }, { status: 500 });
  }
}