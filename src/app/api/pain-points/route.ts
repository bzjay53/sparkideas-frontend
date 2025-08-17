import { NextRequest } from 'next/server';
import { PainPointService } from '@/lib/database';

// Edge Runtime for global performance
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const trending = searchParams.get('trending') === 'true';
    
    let painPoints;
    
    if (trending) {
      painPoints = await PainPointService.getTrending(limit);
    } else if (source) {
      painPoints = await PainPointService.getBySource(source, limit);
    } else {
      painPoints = await PainPointService.getAll(limit);
    }

    return new Response(JSON.stringify({
      data: painPoints,
      meta: {
        count: painPoints.length,
        source,
        trending,
        limit,
        generatedAt: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300', // 1min client, 5min edge
      },
    });
  } catch (error) {
    console.error('Pain Points API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch pain points',
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
    const requiredFields = ['title', 'content', 'source', 'source_url'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const painPoint = await PainPointService.create({
      title: body.title,
      content: body.content,
      source: body.source,
      source_url: body.source_url,
      sentiment_score: body.sentiment_score || 0,
      trend_score: body.trend_score || 0,
      keywords: body.keywords || [],
      category: body.category || 'general'
    });

    return new Response(JSON.stringify({
      data: painPoint,
      message: 'Pain point created successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create Pain Point API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create pain point',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}