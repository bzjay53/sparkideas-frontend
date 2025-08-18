import { NextRequest } from 'next/server';
import { PainPointService } from '@/lib/database';

// Use Node.js runtime for better compatibility
export const runtime = 'nodejs';

// OpenAI API 호출 함수
async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'sk-placeholder-key-for-development') {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `당신은 비즈니스 아이디어 생성 전문가입니다. 

실제 Reddit에서 수집된 여러 갈증포인트들을 분석하여, 이들을 종합적으로 해결할 수 있는 혁신적인 비즈니스 아이디어를 생성해주세요.

다음 형식으로 응답해주세요:
{
  "title": "아이디어 제목 (간결하고 명확하게)",
  "description": "아이디어 상세 설명 (3-4문장, 수집된 갈증포인트들을 어떻게 해결하는지 포함)",
  "targetMarket": "타겟 시장 (구체적으로)",
  "businessModel": "비즈니스 모델 (수익 구조)",
  "keyFeatures": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3", "핵심 기능 4"],
  "marketSize": "예상 시장 규모",
  "competitiveAdvantage": "경쟁 우위 요소",
  "confidenceScore": 85,
  "tags": ["태그1", "태그2", "태그3"],
  "estimatedCost": "초기 투자 비용 추정",
  "timeToMarket": "출시까지 예상 기간",
  "painPointsAddressed": ["해결하는 갈증포인트 1", "해결하는 갈증포인트 2"],
  "implementationSteps": ["1단계: 구체적 단계", "2단계: 구체적 단계", "3단계: 구체적 단계"]
}

반드시 JSON 형식으로만 응답하세요.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const { count = 5, category } = await request.json().catch(() => ({}));

    console.log('🎯 Generating idea from trending pain points...');
    
    // 실제 트렌딩 갈증포인트들 가져오기
    const trendingPainPoints = await PainPointService.getTrending(count);
    
    if (trendingPainPoints.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No trending pain points found',
          suggestion: 'Try collecting pain points first using /api/collect-painpoints'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 수집된 갈증포인트들을 분석용 프롬프트로 구성
    const painPointSummary = trendingPainPoints.map((pp, index) => 
      `${index + 1}. "${pp.title}"
         내용: ${pp.content}
         소스: ${pp.source}
         트렌드 스코어: ${pp.trend_score}
         카테고리: ${pp.category}
         키워드: ${pp.keywords?.join(', ') || 'N/A'}`
    ).join('\n\n');

    const prompt = `
다음은 Reddit에서 실시간으로 수집된 ${trendingPainPoints.length}개의 실제 갈증포인트들입니다:

${painPointSummary}

이 갈증포인트들을 종합적으로 분석하여:
1. 공통된 문제점이나 패턴을 찾아내고
2. 이들을 효과적으로 해결할 수 있는 혁신적인 비즈니스 아이디어를 생성해주세요

${category ? `특히 "${category}" 분야에 초점을 맞춰 주세요.` : ''}

실제 시장의 니즈를 반영하고, 실현 가능성이 높으며, 수익성이 있는 아이디어를 제안해주세요.
`;

    console.log(`📊 Using ${trendingPainPoints.length} real pain points for idea generation`);

    const aiResponse = await callOpenAI(prompt);
    
    // JSON 파싱 시도
    let ideaData;
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
      ideaData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('JSON 파싱 에러:', parseError);
      throw new Error('AI 응답을 파싱할 수 없습니다');
    }

    // 응답 데이터 검증 및 보완
    const validatedIdea = {
      id: `trending_idea_${Date.now()}`,
      title: ideaData.title || '트렌딩 기반 비즈니스 아이디어',
      description: ideaData.description || '실제 갈증포인트를 기반으로 생성된 아이디어입니다.',
      targetMarket: ideaData.targetMarket || '일반 소비자',
      businessModel: ideaData.businessModel || '구독 기반 모델',
      keyFeatures: ideaData.keyFeatures || ['기능 1', '기능 2', '기능 3', '기능 4'],
      marketSize: ideaData.marketSize || '중소 규모',
      competitiveAdvantage: ideaData.competitiveAdvantage || '실제 사용자 니즈 기반',
      confidenceScore: ideaData.confidenceScore || 85,
      tags: ideaData.tags || ['실시간 데이터', '트렌딩', '검증된 니즈'],
      estimatedCost: ideaData.estimatedCost || '100만원 - 500만원',
      timeToMarket: ideaData.timeToMarket || '3-6개월',
      painPointsAddressed: ideaData.painPointsAddressed || trendingPainPoints.map(pp => pp.title).slice(0, 3),
      implementationSteps: ideaData.implementationSteps || ['1단계: 시장 검증', '2단계: MVP 개발', '3단계: 베타 출시'],
      createdAt: new Date().toISOString(),
      basedOnRealData: true,
      sourcePainPoints: trendingPainPoints.map(pp => ({
        id: pp.id,
        title: pp.title,
        trendScore: pp.trend_score,
        category: pp.category
      }))
    };

    return new Response(JSON.stringify({
      success: true,
      idea: validatedIdea,
      meta: {
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        generatedAt: new Date().toISOString(),
        basedOnPainPoints: trendingPainPoints.length,
        processingTime: 'calculated_client_side',
        dataSource: 'reddit_trending_real_time'
      }
    }), {
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
    console.error('Trending AI 아이디어 생성 에러:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: '트렌딩 갈증포인트 기반 아이디어 생성에 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Reddit 데이터 수집 또는 OpenAI API 연결을 확인해주세요'
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}