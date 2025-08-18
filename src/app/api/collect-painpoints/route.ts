import { NextRequest } from 'next/server';
import { redditService } from '@/lib/services/reddit-service';
import { PainPointService } from '@/lib/database';
import { createSuccessResponse, createErrorResponse, type PainPointCollectionData } from '@/lib/types/api';
import { handleError } from '@/lib/error-handler';
import { COLLECTION_LIMITS, STATUS_MESSAGES } from '@/lib/constants';

// Use Node.js runtime for better compatibility with external APIs
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const requestId = `collect-${Date.now()}`;
  
  try {
    const { limit = COLLECTION_LIMITS.PAIN_POINTS_DEFAULT } = await request.json().catch(() => ({}));
    
    // 제한값 유효성 검사
    const actualLimit = Math.min(Math.max(limit, 1), COLLECTION_LIMITS.PAIN_POINTS_MAX);
    
    console.log(`🔍 Starting Reddit pain point collection (limit: ${actualLimit})...`);
    
    // 새로운 RedditService를 사용하여 갈증포인트 수집
    const painPoints = await redditService.collectPainPoints(actualLimit);
    
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

    const responseData: PainPointCollectionData = {
      painPoints: savedPainPoints,
      stats: {
        totalCollected: painPoints.length,
        successfullySaved: successCount,
        failedToSave: errorCount,
        collectionTime: new Date().toISOString()
      },
      meta: {
        source: 'reddit',
        collectionMethod: 'real_time_api',
        limit: actualLimit,
        nextCollectionRecommended: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }
    };

    const response = createSuccessResponse(
      responseData,
      `${STATUS_MESSAGES.SUCCESS.STATS_RETRIEVED}: ${painPoints.length} pain points collected`,
      200
    );

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Pain points collection error:', error);
    
    const errorResponse = handleError(error, requestId);
    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.statusCode || 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request: NextRequest) {
  const requestId = `get-trending-${Date.now()}`;
  
  try {
    // GET 요청시 최근 수집된 갈증포인트 반환
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(COLLECTION_LIMITS.TRENDING_PAIN_POINTS), 10),
      COLLECTION_LIMITS.PAIN_POINTS_MAX
    );
    
    const recentPainPoints = await PainPointService.getTrending(limit);
    
    const responseData = {
      painPoints: recentPainPoints,
      meta: {
        count: recentPainPoints.length,
        lastUpdated: new Date().toISOString(),
        source: 'database_trending',
        limit
      }
    };
    
    const response = createSuccessResponse(
      responseData,
      STATUS_MESSAGES.SUCCESS.STATS_RETRIEVED,
      200
    );
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Get pain points error:', error);
    
    const errorResponse = handleError(error, requestId);
    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.statusCode || 500,
      headers: { 'Content-Type': 'application/json' }
    });
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