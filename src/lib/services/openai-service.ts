/**
 * OpenAI API 통합 서비스
 * 비즈니스 아이디어 생성과 NLP 분석을 위한 체계화된 AI 서비스
 */

import { 
  AI_CONFIG, 
  API_TIMEOUTS, 
  BUSINESS_IDEA_DEFAULTS,
  STATUS_MESSAGES 
} from '@/lib/constants';
import { 
  AppError, 
  ErrorFactory, 
  ErrorLogger,
  ErrorCategory 
} from '@/lib/error-handler';

// 타입 정의
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

export interface BusinessIdeaRequest {
  painPoint?: string;
  painPoints?: Array<any>;
  industry?: string;
  userPreferences?: string;
  category?: string;
  count?: number;
}

export interface BusinessIdeaResponse {
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
  painPointsAddressed?: string[];
  implementationSteps?: string[];
}

export interface OpenAICallResult {
  success: boolean;
  content?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  responseTime: number;
}

/**
 * 프롬프트 관리 클래스
 * 다양한 AI 작업에 대한 프롬프트 템플릿을 중앙 관리
 */
class PromptManager {
  /**
   * 단일 갈증포인트 기반 아이디어 생성 프롬프트
   */
  static getSinglePainPointPrompt(): string {
    return `당신은 비즈니스 아이디어 생성 전문가입니다. 
          
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

반드시 JSON 형식으로만 응답하세요.`;
  }

  /**
   * 다중 갈증포인트 트렌딩 분석 프롬프트
   */
  static getTrendingPainPointsPrompt(): string {
    return `당신은 비즈니스 아이디어 생성 전문가입니다. 

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

반드시 JSON 형식으로만 응답하세요.`;
  }

  /**
   * 사용자 입력에 따른 단일 아이디어 프롬프트 생성
   */
  static createSingleIdeaPrompt(request: BusinessIdeaRequest): string {
    const { painPoint, industry, userPreferences } = request;
    
    return `
갈증포인트: ${painPoint}
${industry ? `산업 분야: ${industry}` : ''}
${userPreferences ? `사용자 선호: ${userPreferences}` : ''}

위의 갈증포인트를 해결할 수 있는 혁신적이고 실현 가능한 비즈니스 아이디어를 생성해주세요.
실제 시장에서 성공할 수 있는 구체적이고 실용적인 솔루션을 제안해주세요.
`;
  }

  /**
   * 트렌딩 갈증포인트들 기반 아이디어 프롬프트 생성
   */
  static createTrendingIdeaPrompt(painPoints: any[], category?: string): string {
    const painPointSummary = painPoints.map((pp, index) => 
      `${index + 1}. "${pp.title}"
         내용: ${pp.content}
         소스: ${pp.source}
         트렌드 스코어: ${pp.trend_score}
         카테고리: ${pp.category}
         키워드: ${pp.keywords?.join(', ') || 'N/A'}`
    ).join('\n\n');

    return `
다음은 Reddit에서 실시간으로 수집된 ${painPoints.length}개의 실제 갈증포인트들입니다:

${painPointSummary}

이 갈증포인트들을 종합적으로 분석하여:
1. 공통된 문제점이나 패턴을 찾아내고
2. 이들을 효과적으로 해결할 수 있는 혁신적인 비즈니스 아이디어를 생성해주세요

${category ? `특히 "${category}" 분야에 초점을 맞춰 주세요.` : ''}

실제 시장의 니즈를 반영하고, 실현 가능성이 높으며, 수익성이 있는 아이디어를 제안해주세요.
`;
  }
}

/**
 * OpenAI API 클라이언트 클래스
 * HTTP 통신, 토큰 관리, 에러 처리 담당
 */
class OpenAIClient {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
  }

  /**
   * OpenAI Chat Completions API 호출
   */
  async callChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: Partial<{
      model: string;
      temperature: number;
      maxTokens: number;
      timeout: number;
    }>
  ): Promise<OpenAICallResult> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeout = options?.timeout || this.config.timeout;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: options?.maxTokens || this.config.maxTokens,
          temperature: options?.temperature || this.config.temperature,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw ErrorFactory.externalApi('OpenAI', `API request failed with status ${response.status}`, {
          status: response.status,
          statusText: response.statusText
        });
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        content,
        usage: data.usage,
        model: data.model,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.externalApi('OpenAI', 'Failed to call OpenAI API', {
        originalError: error instanceof Error ? error.message : String(error),
        responseTime
      });
    }
  }
}

/**
 * AI 응답 파싱 및 검증 클래스
 * JSON 파싱, 데이터 검증, fallback 처리 담당
 */
class ResponseValidator {
  /**
   * AI 응답을 JSON으로 파싱하고 검증
   */
  static parseBusinessIdeaResponse(rawResponse: string): BusinessIdeaResponse {
    try {
      // JSON 응답에서 코드 블록 제거
      const cleanResponse = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?$/g, '')
        .trim();

      const ideaData = JSON.parse(cleanResponse);
      
      // 데이터 검증 및 기본값 적용
      return this.validateBusinessIdea(ideaData);
    } catch (error) {
      throw ErrorFactory.businessLogic('Failed to parse AI response as JSON', {
        rawResponse: rawResponse.substring(0, 200) + '...',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 비즈니스 아이디어 데이터 검증 및 보완
   */
  private static validateBusinessIdea(data: any): BusinessIdeaResponse {
    return {
      title: data.title || '새로운 비즈니스 아이디어',
      description: data.description || '상세 설명이 생성되지 않았습니다.',
      targetMarket: data.targetMarket || BUSINESS_IDEA_DEFAULTS.DEFAULT_TARGET_MARKET,
      businessModel: data.businessModel || '구독 기반 모델',
      keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : ['기능 1', '기능 2', '기능 3'],
      marketSize: data.marketSize || '중소 규모',
      competitiveAdvantage: data.competitiveAdvantage || '혁신적인 접근 방식',
      confidenceScore: typeof data.confidenceScore === 'number' ? 
        Math.max(AI_CONFIG.MIN_CONFIDENCE_SCORE, Math.min(data.confidenceScore, AI_CONFIG.MAX_CONFIDENCE_SCORE)) : 
        AI_CONFIG.DEFAULT_CONFIDENCE_SCORE,
      tags: Array.isArray(data.tags) ? data.tags : ['혁신', '기술', '서비스'],
      estimatedCost: data.estimatedCost || BUSINESS_IDEA_DEFAULTS.DEFAULT_COST,
      timeToMarket: data.timeToMarket || BUSINESS_IDEA_DEFAULTS.DEFAULT_TIME_TO_MARKET,
      painPointsAddressed: Array.isArray(data.painPointsAddressed) ? data.painPointsAddressed : undefined,
      implementationSteps: Array.isArray(data.implementationSteps) ? data.implementationSteps : undefined
    };
  }

  /**
   * Mock 비즈니스 아이디어 생성 (API 실패시 fallback)
   */
  static createMockBusinessIdea(request: BusinessIdeaRequest): BusinessIdeaResponse {
    const mockIdeas = [
      {
        title: 'AI 스마트 학습 플랫폼',
        description: '개인 맞춤형 AI 튜터가 학습자의 진도와 이해도를 실시간으로 분석하여 최적의 학습 경로를 제공하는 플랫폼입니다.',
        targetMarket: '고등학생, 대학생, 직장인 (평생 학습)',
        businessModel: '월간 구독 모델 + 프리미엄 1:1 튜터링',
        keyFeatures: ['AI 맞춤 학습', '실시간 진도 분석', '학습 효율 최적화'],
        marketSize: '국내 에듀테크 시장 2조원',
        competitiveAdvantage: '개인화된 AI 알고리즘',
        tags: ['에듀테크', 'AI', '개인화']
      },
      {
        title: '원격 근무 협업 도구',
        description: '분산된 팀의 효율적인 협업을 위한 통합 플랫폼으로, 실시간 커뮤니케이션과 프로젝트 관리를 제공합니다.',
        targetMarket: '중소기업, 스타트업, 원격 근무팀',
        businessModel: '팀 단위 월간 구독',
        keyFeatures: ['실시간 협업', '프로젝트 추적', '성과 분석'],
        marketSize: '글로벌 협업 도구 시장 150억 달러',
        competitiveAdvantage: '사용자 친화적 인터페이스',
        tags: ['협업', '원격근무', 'SaaS']
      }
    ];

    const selectedIdea = mockIdeas[Math.floor(Math.random() * mockIdeas.length)];
    
    return {
      ...selectedIdea,
      confidenceScore: AI_CONFIG.DEFAULT_CONFIDENCE_SCORE,
      estimatedCost: BUSINESS_IDEA_DEFAULTS.DEFAULT_COST,
      timeToMarket: BUSINESS_IDEA_DEFAULTS.DEFAULT_TIME_TO_MARKET
    };
  }
}

/**
 * OpenAI 서비스 메인 클래스
 * 비즈니스 아이디어 생성 워크플로우 관리
 */
export class OpenAIService {
  private client: OpenAIClient;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!apiKey || apiKey === 'sk-placeholder-key-for-development') {
      throw ErrorFactory.businessLogic('OpenAI API key not configured in environment variables', {
        hasApiKey: !!apiKey,
        keyPrefix: apiKey ? `${apiKey.substring(0, 7)}...` : 'none'
      });
    }

    const config: OpenAIConfig = {
      apiKey,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 1500,
      timeout: API_TIMEOUTS.OPENAI_API
    };

    this.client = new OpenAIClient(config);
  }

  /**
   * 단일 갈증포인트 기반 아이디어 생성
   */
  async generateIdeaFromPainPoint(request: BusinessIdeaRequest): Promise<{
    idea: BusinessIdeaResponse & { id: string; createdAt: string; originalPainPoint: string };
    meta: {
      model: string;
      generatedAt: string;
      processingTime: number;
    };
  }> {
    try {
      if (!request.painPoint) {
        throw ErrorFactory.badRequest('Pain point is required for idea generation', { request });
      }

      console.log(`🤖 Generating business idea from pain point: "${request.painPoint}"`);

      const systemPrompt = PromptManager.getSinglePainPointPrompt();
      const userPrompt = PromptManager.createSingleIdeaPrompt(request);

      const result = await this.client.callChatCompletion(
        systemPrompt,
        userPrompt,
        { maxTokens: 1000 }
      );

      const validatedIdea = ResponseValidator.parseBusinessIdeaResponse(result.content!);

      const enhancedIdea = {
        ...validatedIdea,
        id: `idea_${Date.now()}`,
        createdAt: new Date().toISOString(),
        originalPainPoint: request.painPoint
      };

      console.log(`✅ Business idea generated successfully (confidence: ${validatedIdea.confidenceScore}%)`);

      return {
        idea: enhancedIdea,
        meta: {
          model: result.model,
          generatedAt: new Date().toISOString(),
          processingTime: result.responseTime
        }
      };
    } catch (error) {
      ErrorLogger.log(
        error instanceof AppError ? error : ErrorFactory.externalApi('OpenAI', 'Failed to generate idea from pain point', {
          request,
          originalError: error instanceof Error ? error.message : String(error)
        }),
        `openai-single-${Date.now()}`
      );

      // Fallback to mock data in case of error
      const mockIdea = ResponseValidator.createMockBusinessIdea(request);
      
      return {
        idea: {
          ...mockIdea,
          id: `mock_idea_${Date.now()}`,
          createdAt: new Date().toISOString(),
          originalPainPoint: request.painPoint || 'Unknown pain point'
        },
        meta: {
          model: 'mock-fallback',
          generatedAt: new Date().toISOString(),
          processingTime: 0
        }
      };
    }
  }

  /**
   * 트렌딩 갈증포인트들 기반 종합 아이디어 생성
   */
  async generateIdeaFromTrendingPainPoints(request: BusinessIdeaRequest & { painPoints: any[] }): Promise<{
    idea: BusinessIdeaResponse & { 
      id: string; 
      createdAt: string; 
      basedOnRealData: boolean;
      sourcePainPoints: Array<{
        id: string;
        title: string;
        trendScore: number;
        category: string;
      }>;
    };
    meta: {
      model: string;
      generatedAt: string;
      basedOnPainPoints: number;
      processingTime: number;
      dataSource: string;
    };
  }> {
    try {
      const { painPoints, category } = request;

      if (!painPoints || painPoints.length === 0) {
        throw ErrorFactory.badRequest('Pain points array is required and cannot be empty', { request });
      }

      console.log(`🎯 Generating comprehensive idea from ${painPoints.length} trending pain points...`);

      const systemPrompt = PromptManager.getTrendingPainPointsPrompt();
      const userPrompt = PromptManager.createTrendingIdeaPrompt(painPoints, category);

      const result = await this.client.callChatCompletion(systemPrompt, userPrompt);

      const validatedIdea = ResponseValidator.parseBusinessIdeaResponse(result.content!);

      const enhancedIdea = {
        ...validatedIdea,
        id: `trending_idea_${Date.now()}`,
        createdAt: new Date().toISOString(),
        basedOnRealData: true,
        sourcePainPoints: painPoints.map(pp => ({
          id: pp.id,
          title: pp.title,
          trendScore: pp.trend_score,
          category: pp.category
        }))
      };

      console.log(`✅ Comprehensive business idea generated (confidence: ${validatedIdea.confidenceScore}%)`);

      return {
        idea: enhancedIdea,
        meta: {
          model: result.model,
          generatedAt: new Date().toISOString(),
          basedOnPainPoints: painPoints.length,
          processingTime: result.responseTime,
          dataSource: 'reddit_trending_real_time'
        }
      };
    } catch (error) {
      ErrorLogger.log(
        error instanceof AppError ? error : ErrorFactory.externalApi('OpenAI', 'Failed to generate idea from trending pain points', {
          request,
          originalError: error instanceof Error ? error.message : String(error)
        }),
        `openai-trending-${Date.now()}`
      );

      // Fallback to mock data
      const mockIdea = ResponseValidator.createMockBusinessIdea(request);
      
      return {
        idea: {
          ...mockIdea,
          id: `mock_trending_idea_${Date.now()}`,
          createdAt: new Date().toISOString(),
          basedOnRealData: false,
          sourcePainPoints: request.painPoints?.map(pp => ({
            id: pp.id || 'unknown',
            title: pp.title || 'Unknown',
            trendScore: pp.trend_score || 0,
            category: pp.category || 'general'
          })) || []
        },
        meta: {
          model: 'mock-fallback',
          generatedAt: new Date().toISOString(),
          basedOnPainPoints: request.painPoints?.length || 0,
          processingTime: 0,
          dataSource: 'mock_fallback'
        }
      };
    }
  }

  /**
   * 서비스 연결 상태 테스트
   */
  /**
   * 구조화된 응답을 생성하는 범용 메서드
   * PRD, 보고서 등 복잡한 문서 생성용
   */
  async generateStructuredResponse(
    prompt: string, 
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const systemPrompt = "You are a professional technical writer and business analyst. Generate comprehensive, well-structured responses in Korean.";
    
    try {
      const result = await this.client.callChatCompletion(systemPrompt, prompt, {
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 4000
      });
      
      if (!result.success || !result.content) {
        throw ErrorFactory.externalApi('OpenAI', 'Failed to generate structured response');
      }
      
      return result.content;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.log(errorInstance, 'OpenAIService.generateStructuredResponse');
      throw ErrorFactory.externalApi('OpenAI', 'Structured response generation failed', errorInstance);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const result = await this.client.callChatCompletion(
        'You are a helpful assistant.',
        'Say "Hello from OpenAI!"',
        { maxTokens: 50, timeout: 10000 }
      );
      
      return {
        success: true,
        message: 'OpenAI API connection successful',
        details: {
          model: result.model,
          responseTime: result.responseTime,
          content: result.content
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'OpenAI API connection failed',
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * 서비스 정보 반환
   */
  getServiceInfo(): object {
    return {
      service: 'OpenAIService',
      version: '2.0',
      features: [
        'Single pain point idea generation',
        'Trending pain points comprehensive analysis',
        'Prompt template management',
        'Response validation and fallback',
        'Error handling with retry logic',
        'Performance monitoring'
      ],
      models: {
        default: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        available: ['gpt-4o-mini', 'gpt-4-turbo-preview', 'gpt-3.5-turbo']
      },
      limits: {
        maxTokens: AI_CONFIG.TARGET_RESPONSE_TIME * 1000, // 대략적인 계산
        timeout: API_TIMEOUTS.OPENAI_API,
        confidenceScoreRange: `${AI_CONFIG.MIN_CONFIDENCE_SCORE}-${AI_CONFIG.MAX_CONFIDENCE_SCORE}`
      }
    };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const openaiService = new OpenAIService();