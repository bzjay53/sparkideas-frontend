import { NextRequest } from 'next/server';
import { PainPointService } from '@/lib/database';
import { openaiService } from '@/lib/services/openai-service';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';
import { handleError } from '@/lib/error-handler';
import { COLLECTION_LIMITS, STATUS_MESSAGES } from '@/lib/constants';

// Use Node.js runtime for better compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const requestId = `generate-trending-${Date.now()}`;
  
  try {
    const { count = COLLECTION_LIMITS.IDEAS_DAILY, category } = await request.json().catch(() => ({}));

    console.log('🎯 Generating idea from trending pain points...');
    
    // 실제 트렌딩 갈증포인트들 가져오기
    const trendingPainPoints = await PainPointService.getTrending(count);
    
    if (trendingPainPoints.length === 0) {
      const errorResponse = createErrorResponse(
        STATUS_MESSAGES.ERROR.NO_IDEAS_FOR_DIGEST,
        404,
        'Try collecting pain points first using /api/collect-painpoints'
      );
      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Using ${trendingPainPoints.length} real pain points for comprehensive idea generation`);

    // OpenAIService를 사용하여 종합 아이디어 생성
    const result = await openaiService.generateIdeaFromTrendingPainPoints({
      painPoints: trendingPainPoints,
      category,
      count
    });

    const response = createSuccessResponse(
      {
        idea: result.idea,
        meta: result.meta
      },
      STATUS_MESSAGES.SUCCESS.STATS_RETRIEVED,
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
    console.error('트렌딩 AI 아이디어 생성 에러:', error);
    
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}