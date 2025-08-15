/**
 * 🧪 API 모듈과 IdeaSpark 데이터베이스 연결 테스트
 * 실제 PostgreSQL과 연동 확인
 */

const { RestAPIModule } = require('./index.js');
const { Pool } = require('pg');
const express = require('express');

// IdeaSpark 데이터베이스 설정 (동일한 설정 사용)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5050'),
  database: process.env.DB_NAME || 'ideaspark',
  user: process.env.DB_USER || 'ideaspark_user',
  password: process.env.DB_PASSWORD || 'ideaspark_pass',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testAPIModule() {
  console.log('🚀 API 모듈 통합 테스트 시작...\n');
  
  try {
    // 1. 데이터베이스 연결 테스트
    console.log('1️⃣ 데이터베이스 연결 테스트...');
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ DB 연결 성공:', testResult.rows[0].current_time);
    
    // 2. API 모듈 생성 및 설정
    console.log('\n2️⃣ API 모듈 생성...');
    const api = new RestAPIModule()
      .setDatabaseClient(pool)
      .createCRUDRoutes('categories', {
        middleware: [],
        swaggerSchema: {
          name: { type: 'string', required: true },
          description: { type: 'string' },
          color: { type: 'string' },
          icon: { type: 'string' }
        }
      });
    
    console.log('✅ API 모듈 생성 완료');
    
    // 3. Express 앱 생성 및 테스트
    console.log('\n3️⃣ Express 테스트 서버 설정...');
    const app = express();
    app.use(express.json());
    app.use('/api', api.getRouter());
    
    // 4. 실제 데이터 확인
    console.log('\n4️⃣ 실제 categories 데이터 확인...');
    const categoriesResult = await pool.query('SELECT * FROM categories LIMIT 3');
    console.log('📊 기존 categories 데이터:');
    categoriesResult.rows.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.color})`);
    });
    
    // 5. API 문서 생성 테스트
    console.log('\n5️⃣ API 문서 생성 테스트...');
    const apiDocs = api.generateApiDocs();
    console.log('✅ Swagger 문서 생성 완료');
    console.log('📚 생성된 엔드포인트:', Object.keys(apiDocs.paths));
    
    console.log('\n🎉 모든 테스트 통과!');
    console.log('\n📋 사용 가능한 엔드포인트:');
    console.log('   GET    /api/categories      - 카테고리 목록');
    console.log('   GET    /api/categories/:id  - 특정 카테고리');
    console.log('   POST   /api/categories      - 카테고리 생성');
    console.log('   PUT    /api/categories/:id  - 카테고리 수정');
    console.log('   DELETE /api/categories/:id  - 카테고리 삭제');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error('상세 에러:', error);
  } finally {
    await pool.end();
    console.log('\n🔚 데이터베이스 연결 종료');
  }
}

// 직접 실행 시 테스트 수행
if (require.main === module) {
  testAPIModule();
}

module.exports = { testAPIModule };