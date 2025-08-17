import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Edge Runtime for faster global response
export const runtime = 'edge';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SaveIdeaRequest {
  idea: {
    id: string;
    title: string;
    description: string;
    targetMarket: string;
    businessModel: string;
    keyFeatures: string[];
    marketSize: string;
    competitiveAdvantage: string;
    confidenceScore: number;
    tags: string[];
    estimatedCost: string;
    timeToMarket: string;
    originalPainPoint: string;
  };
  userId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    
    // Supabase 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { idea } = await request.json() as SaveIdeaRequest;

    if (!idea || !idea.id || !idea.title) {
      return new Response(
        JSON.stringify({ error: 'Invalid idea data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 아이디어 데이터를 business_ideas 테이블에 저장
    const { data: savedIdea, error: saveError } = await supabase
      .from('business_ideas')
      .insert({
        id: idea.id,
        user_id: user.id,
        title: idea.title,
        description: idea.description,
        target_market: idea.targetMarket,
        business_model: idea.businessModel,
        key_features: idea.keyFeatures,
        market_size: idea.marketSize,
        competitive_advantage: idea.competitiveAdvantage,
        confidence_score: idea.confidenceScore,
        tags: idea.tags,
        estimated_cost: idea.estimatedCost,
        time_to_market: idea.timeToMarket,
        original_pain_point: idea.originalPainPoint,
        is_favorite: false,
        status: 'draft',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('아이디어 저장 에러:', saveError);
      
      // 중복 ID 에러 처리
      if (saveError.code === '23505') {
        return new Response(
          JSON.stringify({ 
            error: 'Idea already saved',
            message: '이미 저장된 아이디어입니다.'
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      throw saveError;
    }

    return new Response(JSON.stringify({
      success: true,
      savedIdea: {
        id: savedIdea.id,
        title: savedIdea.title,
        createdAt: savedIdea.created_at,
        confidenceScore: savedIdea.confidence_score
      },
      message: '아이디어가 성공적으로 저장되었습니다.'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('아이디어 저장 API 에러:', error);
    
    // 개발 환경에서는 Mock 저장 응답 반환
    if (process.env.NODE_ENV === 'development') {
      return new Response(JSON.stringify({
        success: true,
        savedIdea: {
          id: `mock_saved_${Date.now()}`,
          title: 'Mock 저장된 아이디어',
          createdAt: new Date().toISOString(),
          confidenceScore: 85
        },
        message: '[개발 모드] 아이디어가 Mock 저장되었습니다.',
        note: 'Supabase 연결 문제로 실제 저장되지 않았습니다.'
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ 
        error: '아이디어 저장에 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// 사용자의 저장된 아이디어 목록 조회
export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    
    // Supabase 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 사용자의 저장된 아이디어 조회
    const { data: ideas, error: fetchError } = await supabase
      .from('business_ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      throw fetchError;
    }

    return new Response(JSON.stringify({
      success: true,
      ideas: ideas || [],
      pagination: {
        limit,
        offset,
        total: ideas?.length || 0
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('아이디어 목록 조회 에러:', error);
    
    // 개발 환경에서는 Mock 데이터 반환
    if (process.env.NODE_ENV === 'development') {
      return new Response(JSON.stringify({
        success: true,
        ideas: [
          {
            id: 'mock_idea_1',
            title: 'Mock 저장된 아이디어 1',
            description: '개발 환경용 Mock 아이디어입니다.',
            confidence_score: 85,
            created_at: new Date().toISOString(),
            is_favorite: false
          }
        ],
        pagination: { limit: 10, offset: 0, total: 1 },
        note: 'Supabase 연결 문제로 Mock 데이터를 반환합니다.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ 
        error: '아이디어 목록 조회에 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// DELETE handler - 아이디어 삭제
export async function DELETE(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    
    // Supabase 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('id');

    if (!ideaId) {
      return new Response(
        JSON.stringify({ error: 'Idea ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 아이디어 삭제 (사용자 소유 확인)
    const { error: deleteError } = await supabase
      .from('business_ideas')
      .delete()
      .eq('id', ideaId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('아이디어 삭제 에러:', deleteError);
      throw deleteError;
    }

    return new Response(JSON.stringify({
      success: true,
      message: '아이디어가 삭제되었습니다.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('아이디어 삭제 API 에러:', error);
    
    return new Response(
      JSON.stringify({ 
        error: '아이디어 삭제에 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// PUT handler - 아이디어 업데이트 (즐겨찾기 토글)
export async function PUT(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    
    // Supabase 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { ideaId, updates } = await request.json();

    if (!ideaId) {
      return new Response(
        JSON.stringify({ error: 'Idea ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 허용된 업데이트 필드만 처리
    const allowedFields = ['is_favorite', 'status', 'title', 'description'];
    const validUpdates: any = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        validUpdates[key] = value;
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid update fields provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 아이디어 업데이트 (사용자 소유 확인)
    const { data: updatedIdea, error: updateError } = await supabase
      .from('business_ideas')
      .update(validUpdates)
      .eq('id', ideaId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('아이디어 업데이트 에러:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({
      success: true,
      updatedIdea: {
        id: updatedIdea.id,
        title: updatedIdea.title,
        is_favorite: updatedIdea.is_favorite,
        status: updatedIdea.status
      },
      message: '아이디어가 업데이트되었습니다.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('아이디어 업데이트 API 에러:', error);
    
    // 개발 환경에서는 Mock 응답 반환
    if (process.env.NODE_ENV === 'development') {
      return new Response(JSON.stringify({
        success: true,
        updatedIdea: {
          id: 'mock_updated',
          title: 'Mock 업데이트됨',
          is_favorite: true,
          status: 'draft'
        },
        message: '[개발 모드] 아이디어가 Mock 업데이트되었습니다.',
        note: 'Supabase 연결 문제로 실제 업데이트되지 않았습니다.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(
      JSON.stringify({ 
        error: '아이디어 업데이트에 실패했습니다',
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}