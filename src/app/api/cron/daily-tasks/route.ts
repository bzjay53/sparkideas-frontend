import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 인증 토큰 확인 (Vercel Cron에서만 호출 가능)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      tasks: [],
      success: true,
      errors: []
    };

    // 1. 갈증포인트 수집
    try {
      console.log('🔍 Starting pain point collection...');
      
      // Mock 데이터로 대체 (실제 구현 시 외부 API 호출)
      const painPointsCollected = 50 + Math.floor(Math.random() * 100);
      
      results.tasks.push({
        name: 'collect-pain-points',
        status: 'success',
        data: { collected: painPointsCollected }
      });
      
      console.log(`✅ Pain points collected: ${painPointsCollected}`);
    } catch (error) {
      console.error('❌ Pain point collection failed:', error);
      results.errors.push({
        task: 'collect-pain-points',
        error: String(error)
      });
    }

    // 2. AI 비즈니스 아이디어 생성
    try {
      console.log('🤖 Generating business ideas...');
      
      // Mock 데이터로 대체 (실제 구현 시 OpenAI API 호출)
      const ideasGenerated = 10 + Math.floor(Math.random() * 20);
      
      results.tasks.push({
        name: 'generate-ideas',
        status: 'success',
        data: { generated: ideasGenerated }
      });
      
      console.log(`✅ Business ideas generated: ${ideasGenerated}`);
    } catch (error) {
      console.error('❌ Idea generation failed:', error);
      results.errors.push({
        task: 'generate-ideas',
        error: String(error)
      });
    }

    // 3. 텔레그램 전송 (모든 작업 완료 후)
    try {
      console.log('📱 Sending Telegram summary...');
      
      // Mock 데이터로 대체 (실제 구현 시 Telegram Bot API 호출)
      const summary = {
        painPoints: results.tasks.find(t => t.name === 'collect-pain-points')?.data?.collected || 0,
        ideas: results.tasks.find(t => t.name === 'generate-ideas')?.data?.generated || 0,
        date: new Date().toLocaleDateString('ko-KR')
      };
      
      results.tasks.push({
        name: 'send-telegram',
        status: 'success',
        data: { summary }
      });
      
      console.log('✅ Telegram summary sent');
    } catch (error) {
      console.error('❌ Telegram sending failed:', error);
      results.errors.push({
        task: 'send-telegram',
        error: String(error)
      });
    }

    // 결과 반환
    console.log('🎉 Daily tasks completed:', results);
    
    return NextResponse.json(results, { 
      status: results.errors.length > 0 ? 207 : 200 // Multi-Status if partial errors
    });

  } catch (error) {
    console.error('💥 Daily tasks failed:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST 메서드로도 접근 가능 (수동 트리거용)
export async function POST(request: NextRequest) {
  return GET(request);
}