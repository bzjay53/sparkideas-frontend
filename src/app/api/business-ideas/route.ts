import { NextRequest } from 'next/server';
import { BusinessIdeaService } from '@/lib/database';

// Edge Runtime for optimal performance
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const difficulty = searchParams.get('difficulty');
    const forTelegram = searchParams.get('telegram') === 'true';
    
    let businessIdeas;
    
    if (forTelegram) {
      businessIdeas = await BusinessIdeaService.getForTelegramDigest(5);
    } else if (difficulty) {
      businessIdeas = await BusinessIdeaService.getByDifficulty(parseInt(difficulty, 10), limit);
    } else {
      businessIdeas = await BusinessIdeaService.getTopIdeas(limit);
    }

    return new Response(JSON.stringify({
      data: businessIdeas,
      meta: {
        count: businessIdeas.length,
        difficulty,
        forTelegram,
        limit,
        generatedAt: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=1800', // 5min client, 30min edge
      },
    });
  } catch (error) {
    console.error('Business Ideas API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch business ideas',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'target_market', 'revenue_model', 'market_size', 'implementation_difficulty', 'confidence_score'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate ranges
    if (body.implementation_difficulty < 1 || body.implementation_difficulty > 5) {
      return new Response(
        JSON.stringify({ error: 'Implementation difficulty must be between 1 and 5' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.confidence_score < 0 || body.confidence_score > 100) {
      return new Response(
        JSON.stringify({ error: 'Confidence score must be between 0 and 100' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const businessIdea = await BusinessIdeaService.create({
      title: body.title,
      description: body.description,
      target_market: body.target_market,
      revenue_model: body.revenue_model,
      market_size: body.market_size,
      implementation_difficulty: body.implementation_difficulty,
      confidence_score: body.confidence_score,
      pain_point_ids: body.pain_point_ids || [],
      ai_analysis: body.ai_analysis || {}
    });

    return new Response(JSON.stringify({
      data: businessIdea,
      message: 'Business idea created successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create Business Idea API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create business idea',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}