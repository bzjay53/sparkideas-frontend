import { NextRequest } from 'next/server';
import { openaiService } from '@/lib/services/openai-service';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';
import { handleError } from '@/lib/error-handler';
import { STATUS_MESSAGES } from '@/lib/constants';

// Use Node.js runtime for better compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const requestId = `generate-idea-${Date.now()}`;
  
  try {
    const { painPoint, industry, userPreferences } = await request.json();

    console.log(`💡 Generating business idea for pain point: "${painPoint}"`);

    // OpenAIService를 사용하여 아이디어 생성
    const result = await openaiService.generateIdeaFromPainPoint({
      painPoint,
      industry,
      userPreferences
    });

    const response = createSuccessResponse(
      {
        idea: result.idea,
        meta: result.meta
      },
      STATUS_MESSAGES.SUCCESS.BOT_CONNECTION_SUCCESS,
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
    console.error('AI 아이디어 생성 에러:', error);
    
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