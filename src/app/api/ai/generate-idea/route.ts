import { NextRequest } from 'next/server';

// Edge Runtime for faster global response
export const runtime = 'edge';

// OpenAI API 호출 함수 (fetch 사용)
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
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 비즈니스 아이디어 생성 전문가입니다. 
          
주어진 갈증포인트(pain point)를 분석하여 실현 가능한 비즈니스 아이디어를 생성해주세요.

다음 형식으로 응답해주세요:
{
  "title": "아이디어 제목 (간결하고 명확하게)",
  "description": "아이디어 상세 설명 (2-3문장)",
  "targetMarket": "타겟 시장 (구체적으로)",
  "businessModel": "비즈니스 모델 (수익 구조)",
  "keyFeatures": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
  "marketSize": "예상 시장 규모",
  "competitiveAdvantage": "경쟁 우위 요소",
  "confidenceScore": 85,
  "tags": ["태그1", "태그2", "태그3"],
  "estimatedCost": "초기 투자 비용 추정",
  "timeToMarket": "출시까지 예상 기간"
}

반드시 JSON 형식으로만 응답하세요.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
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
    const { painPoint, industry, userPreferences } = await request.json();

    if (!painPoint) {
      return new Response(
        JSON.stringify({ error: 'Pain point is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 프롬프트 생성
    const prompt = `
갈증포인트: ${painPoint}
${industry ? `산업 분야: ${industry}` : ''}
${userPreferences ? `사용자 선호: ${userPreferences}` : ''}

위의 갈증포인트를 해결할 수 있는 혁신적이고 실현 가능한 비즈니스 아이디어를 생성해주세요.
실제 시장에서 성공할 수 있는 구체적이고 실용적인 솔루션을 제안해주세요.
`;

    const aiResponse = await callOpenAI(prompt);
    
    // JSON 파싱 시도
    let ideaData;
    try {
      // JSON 응답에서 코드 블록 제거
      const cleanResponse = aiResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
      ideaData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('JSON 파싱 에러:', parseError);
      throw new Error('AI 응답을 파싱할 수 없습니다');
    }

    // 응답 데이터 검증 및 보완
    const validatedIdea = {
      id: `idea_${Date.now()}`,
      title: ideaData.title || '새로운 비즈니스 아이디어',
      description: ideaData.description || '상세 설명이 생성되지 않았습니다.',
      targetMarket: ideaData.targetMarket || '일반 소비자',
      businessModel: ideaData.businessModel || '구독 기반 모델',
      keyFeatures: ideaData.keyFeatures || ['기능 1', '기능 2', '기능 3'],
      marketSize: ideaData.marketSize || '중소 규모',
      competitiveAdvantage: ideaData.competitiveAdvantage || '혁신적인 접근 방식',
      confidenceScore: ideaData.confidenceScore || 75,
      tags: ideaData.tags || ['혁신', '기술', '서비스'],
      estimatedCost: ideaData.estimatedCost || '100만원 - 500만원',
      timeToMarket: ideaData.timeToMarket || '3-6개월',
      createdAt: new Date().toISOString(),
      originalPainPoint: painPoint
    };

    return new Response(JSON.stringify({
      success: true,
      idea: validatedIdea,
      meta: {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        generatedAt: new Date().toISOString(),
        processingTime: 'calculated_client_side'
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // AI 응답은 캐시하지 않음
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('AI 아이디어 생성 에러:', error);
    
    // 개발 환경에서는 Mock 데이터 반환
    if (process.env.NODE_ENV === 'development' && error instanceof Error && error.message.includes('API key not configured')) {
      const mockIdea = {
        id: `mock_idea_${Date.now()}`,
        title: 'AI 스마트 학습 플랫폼',
        description: '개인 맞춤형 AI 튜터가 학습자의 진도와 이해도를 실시간으로 분석하여 최적의 학습 경로를 제공하는 플랫폼입니다.',
        targetMarket: '고등학생, 대학생, 직장인 (평생 학습)',
        businessModel: '월간 구독 모델 + 프리미엄 1:1 튜터링',
        keyFeatures: ['AI 맞춤 학습', '실시간 진도 분석', '학습 효율 최적화'],
        marketSize: '국내 에듀테크 시장 2조원',
        competitiveAdvantage: '개인화된 AI 알고리즘',
        confidenceScore: 88,
        tags: ['에듀테크', 'AI', '개인화'],
        estimatedCost: '1억원 - 3억원',
        timeToMarket: '6-12개월',
        createdAt: new Date().toISOString(),
        originalPainPoint: '입력된 갈증포인트'
      };

      return new Response(JSON.stringify({
        success: true,
        idea: mockIdea,
        meta: {
          model: 'mock-development',
          generatedAt: new Date().toISOString(),
          note: 'OpenAI API 키가 설정되지 않아 Mock 데이터를 반환합니다.'
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ 
        error: 'AI 아이디어 생성에 실패했습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'OpenAI API 연결을 확인해주세요'
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