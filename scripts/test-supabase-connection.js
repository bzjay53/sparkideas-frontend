// Supabase 연결 및 스키마 테스트 스크립트
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 환경변수 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Supabase 연결 테스트 시작...');
console.log(`Supabase URL: ${supabaseUrl?.substring(0, 20)}...`);
console.log(`Anon Key: ${supabaseAnonKey?.substring(0, 20)}...`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n📊 데이터베이스 연결 테스트...');
    
    // 1. 기본 연결 테스트
    const { data, error } = await supabase.from('pain_points').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation "pain_points" does not exist')) {
        console.log('⚠️  pain_points 테이블이 존재하지 않습니다. 스키마 배포가 필요합니다.');
        return { needsSchema: true, connected: true };
      } else {
        console.error('❌ 데이터베이스 연결 실패:', error.message);
        return { needsSchema: false, connected: false };
      }
    }
    
    console.log('✅ pain_points 테이블 연결 성공');
    
    // 2. 각 테이블 존재 확인
    const tables = ['pain_points', 'business_ideas', 'telegram_messages', 'users', 'community_posts'];
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('count').limit(1);
        tableStatus[table] = tableError ? '❌' : '✅';
      } catch (err) {
        tableStatus[table] = '❌';
      }
    }
    
    console.log('\n📋 테이블 상태:');
    Object.entries(tableStatus).forEach(([table, status]) => {
      console.log(`  ${status} ${table}`);
    });
    
    // 3. 샘플 데이터 확인
    const { data: painPointsData } = await supabase
      .from('pain_points')
      .select('*')
      .limit(3);
      
    console.log(`\n📊 pain_points 테이블 레코드 수: ${painPointsData?.length || 0}`);
    
    if (painPointsData && painPointsData.length > 0) {
      console.log('샘플 데이터:', painPointsData[0].title);
    }
    
    return { 
      needsSchema: false, 
      connected: true, 
      tableStatus, 
      recordCount: painPointsData?.length || 0 
    };
    
  } catch (err) {
    console.error('❌ 연결 테스트 중 오류:', err.message);
    return { needsSchema: false, connected: false };
  }
}

// 테스트 실행
testConnection()
  .then(result => {
    console.log('\n🏁 테스트 결과:', result);
    if (result.needsSchema) {
      console.log('\n📝 다음 단계: supabase_schema.sql 파일을 Supabase에서 실행하세요.');
    } else if (result.connected) {
      console.log('\n✅ 데이터베이스 준비 완료!');
    }
  })
  .catch(err => {
    console.error('❌ 테스트 실패:', err);
  });