import { NextRequest } from 'next/server';
import { redditCollector } from '@/lib/reddit-collector';
import { PainPointService } from '@/lib/database';

// Use Node.js runtime for better compatibility with external APIs
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { limit = 20 } = await request.json().catch(() => ({}));
    
    console.log('🔍 Starting Reddit pain point collection...');
    
    // Reddit에서 갈증포인트 수집
    const painPoints = await redditCollector.collectPainPoints(limit);
    
    console.log(`📊 Collected ${painPoints.length} pain points from Reddit`);
    
    // 수집된 갈증포인트들을 데이터베이스에 저장
    const savedPainPoints = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const painPoint of painPoints) {
      try {
        const saved = await PainPointService.create({
          title: painPoint.title,
          content: painPoint.content,
          source: painPoint.source,
          source_url: painPoint.source_url,
          sentiment_score: painPoint.sentiment_score,
          trend_score: painPoint.trend_score,
          keywords: painPoint.keywords,
          category: painPoint.category
        });
        savedPainPoints.push(saved);
        successCount++;
      } catch (error) {
        console.error('Failed to save pain point:', error);
        errorCount++;
        // 저장 실패한 항목도 응답에 포함 (개발용)
        savedPainPoints.push({
          ...painPoint,
          id: `temp_${Date.now()}_${Math.random()}`,
          created_at: new Date().toISOString(),
          error: 'Failed to save to database'
        });
      }
    }

    const response = {
      success: true,
      message: `Collected and processed ${painPoints.length} pain points`,
      data: savedPainPoints,
      stats: {
        total_collected: painPoints.length,
        successfully_saved: successCount,
        failed_to_save: errorCount,
        collection_time: new Date().toISOString()
      },
      meta: {
        source: 'reddit',
        collection_method: 'real_time_api',
        limit,
        next_collection_recommended: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15분 후
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // 실시간 수집이므로 캐시하지 않음
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Pain points collection error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to collect pain points from Reddit',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check Reddit API credentials and rate limits'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // GET 요청시 최근 수집된 갈증포인트 반환
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const recentPainPoints = await PainPointService.getTrending(limit);
    
    return new Response(JSON.stringify({
      success: true,
      data: recentPainPoints,
      meta: {
        count: recentPainPoints.length,
        last_updated: new Date().toISOString(),
        source: 'database_trending'
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5분 캐시
      },
    });
  } catch (error) {
    console.error('Get pain points error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to retrieve pain points',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}