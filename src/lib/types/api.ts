/**
 * 표준화된 API 응답 타입 정의
 * 모든 API 엔드포인트에서 일관된 응답 형태를 사용하기 위한 인터페이스
 */

/**
 * 기본 API 응답 인터페이스
 * @template T 응답 데이터의 타입
 */
export interface StandardAPIResponse<T = any> {
  /** 요청 성공 여부 */
  success: boolean;
  /** 응답 데이터 (성공 시에만 포함) */
  data?: T;
  /** 에러 메시지 (실패 시에만 포함) */
  error?: string;
  /** 추가 메시지 (옵션) */
  message?: string;
  /** 응답 타임스탬프 (ISO 8601 형식) */
  timestamp: string;
  /** HTTP 상태 코드 */
  statusCode?: number;
}

/**
 * 페이지네이션을 포함한 API 응답 인터페이스
 * @template T 리스트 아이템의 타입
 */
export interface PaginatedAPIResponse<T = any> extends StandardAPIResponse<T[]> {
  /** 페이지네이션 정보 */
  pagination?: {
    /** 현재 페이지 번호 */
    page: number;
    /** 페이지당 아이템 수 */
    limit: number;
    /** 전체 아이템 수 */
    total: number;
    /** 전체 페이지 수 */
    totalPages: number;
    /** 다음 페이지 존재 여부 */
    hasNext: boolean;
    /** 이전 페이지 존재 여부 */
    hasPrevious: boolean;
  };
}

/**
 * 성공 응답을 생성하는 헬퍼 함수
 * @param data 응답 데이터
 * @param message 추가 메시지 (옵션)
 * @param statusCode HTTP 상태 코드 (기본값: 200)
 * @returns 표준화된 성공 응답 객체
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): StandardAPIResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };
}

/**
 * 에러 응답을 생성하는 헬퍼 함수
 * @param error 에러 메시지
 * @param statusCode HTTP 상태 코드 (기본값: 500)
 * @param message 추가 메시지 (옵션)
 * @returns 표준화된 에러 응답 객체
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 500,
  message?: string
): StandardAPIResponse {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };
}

/**
 * 페이지네이션 정보를 포함한 성공 응답을 생성하는 헬퍼 함수
 * @param data 응답 데이터 배열
 * @param page 현재 페이지 번호
 * @param limit 페이지당 아이템 수
 * @param total 전체 아이템 수
 * @param message 추가 메시지 (옵션)
 * @returns 페이지네이션을 포함한 표준화된 성공 응답 객체
 */
export function createPaginatedSuccessResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedAPIResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    statusCode: 200,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
}

/**
 * 특정 도메인별 응답 타입 정의
 */

/** 갈증포인트 데이터 타입 */
export interface PainPointData {
  id: string;
  title: string;
  content: string;
  source: string;
  source_url: string;
  sentiment_score: number;
  trend_score: number;
  keywords: string[];
  category: string;
  created_at: string;
}

/** 비즈니스 아이디어 데이터 타입 */
export interface BusinessIdeaData {
  id: string;
  title: string;
  description: string;
  target_market: string;
  revenue_model: string;
  market_size: string;
  implementation_difficulty: number;
  confidence_score: number;
  pain_point_ids: string[];
  ai_analysis: {
    market_analysis: string;
    technical_feasibility: string;
    competition: string;
  };
  created_at: string;
}

/** 통계 데이터 타입 */
export interface StatsData {
  painPoints: number;
  businessIdeas: number;
  aiAccuracy: number;
  communityPosts: number;
  telegramMessages: number;
  lastUpdated: string;
  realData?: {
    topIdeas: BusinessIdeaData[];
    trendingPainPoints: PainPointData[];
    growthMetrics: {
      painPointsGrowth: string;
      ideasGrowth: string;
      accuracyTrend: string;
    };
  };
}

/** 텔레그램 봇 테스트 결과 타입 */
export interface TelegramTestResult {
  timestamp: string;
  chatId: string;
  type: 'test' | 'digest' | 'connection';
  testMessageSent?: boolean;
  digestSent?: boolean;
  ideasCount?: number;
  avgConfidence?: number;
  connectionTest?: {
    success: boolean;
    botInfo?: any;
    error?: string;
  };
  message: string;
}

/** 크론 작업 결과 타입 */
export interface CronTaskResult {
  timestamp: string;
  tasks: Array<{
    name: string;
    status: 'success' | 'failed' | 'fallback';
    data?: any;
  }>;
  errors: Array<{
    task: string;
    error: string;
  }>;
}

/** 갈증포인트 수집 결과 타입 */
export interface PainPointCollectionData {
  painPoints: Array<PainPointData & { 
    error?: string; // 데이터베이스 저장 실패시 임시 에러 필드
  }>;
  stats: {
    totalCollected: number;
    successfullySaved: number;
    failedToSave: number;
    collectionTime: string;
  };
  meta: {
    source: string;
    collectionMethod: string;
    limit: number;
    nextCollectionRecommended: string;
  };
}

/**
 * 도메인별 응답 타입 정의
 */
export type PainPointResponse = StandardAPIResponse<PainPointData[]>;
export type BusinessIdeaResponse = StandardAPIResponse<BusinessIdeaData>;
export type StatsResponse = StandardAPIResponse<StatsData>;
export type TelegramTestResponse = StandardAPIResponse<TelegramTestResult>;
export type CronTaskResponse = StandardAPIResponse<CronTaskResult>;