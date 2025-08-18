/**
 * 애플리케이션 전역 상수 정의
 * 하드코딩된 값들을 중앙에서 관리하기 위한 상수 모음
 */

/**
 * 데이터 수집 관련 상수
 */
export const COLLECTION_LIMITS = {
  /** 기본 갈증포인트 수집 개수 */
  PAIN_POINTS_DEFAULT: 10,
  /** 크론 작업용 갈증포인트 수집 개수 */
  PAIN_POINTS_CRON: 20,
  /** 최대 갈증포인트 수집 개수 */
  PAIN_POINTS_MAX: 50,
  /** 일일 AI 아이디어 생성 개수 */
  IDEAS_DAILY: 5,
  /** 비즈니스 아이디어 상위 개수 */
  IDEAS_TOP_COUNT: 5,
  /** 트렌딩 갈증포인트 개수 */
  TRENDING_PAIN_POINTS: 10,
  /** 대시보드 표시용 상위 아이디어 개수 */
  DASHBOARD_TOP_IDEAS: 3,
  /** 대시보드 표시용 트렌딩 갈증포인트 개수 */
  DASHBOARD_TRENDING_POINTS: 5,
} as const;

/**
 * 캐시 관련 상수 (초 단위)
 */
export const CACHE_DURATIONS = {
  /** 클라이언트 캐시 시간 (1분) */
  CLIENT_SHORT: 60,
  /** 에지 캐시 시간 (5분) */
  EDGE_MEDIUM: 300,
  /** 에지 캐시 긴 시간 (1시간) */
  EDGE_LONG: 3600,
  /** Fallback 데이터 캐시 시간 (30초) */
  FALLBACK_CLIENT: 30,
  /** Fallback 데이터 에지 캐시 (1분) */
  FALLBACK_EDGE: 60,
  /** 실시간 통계 새로고침 간격 (5분) */
  STATS_REFRESH: 5 * 60 * 1000, // milliseconds
} as const;

/**
 * Fallback 통계 데이터 (데이터베이스 연결 실패 시 사용)
 */
export const FALLBACK_STATS = {
  /** 기본 갈증포인트 수 */
  PAIN_POINTS: 1200,
  /** 기본 비즈니스 아이디어 수 */
  BUSINESS_IDEAS: 850,
  /** 기본 AI 정확도 */
  AI_ACCURACY: 92,
  /** 기본 커뮤니티 게시물 수 */
  COMMUNITY_POSTS: 45,
  /** 기본 텔레그램 메시지 수 */
  TELEGRAM_MESSAGES: 320,
} as const;

/**
 * 성장 지표 기본값
 */
export const GROWTH_METRICS = {
  /** 갈증포인트 증가율 */
  PAIN_POINTS_GROWTH: '+12%',
  /** 아이디어 증가율 */
  IDEAS_GROWTH: '+18%',
  /** 정확도 트렌드 */
  ACCURACY_TREND: '+2.3%',
} as const;

/**
 * AI 분석 관련 상수
 */
export const AI_CONFIG = {
  /** 최소 신뢰도 점수 */
  MIN_CONFIDENCE_SCORE: 85,
  /** 최대 신뢰도 점수 */
  MAX_CONFIDENCE_SCORE: 95,
  /** 기본 신뢰도 점수 (데이터 없을 시) */
  DEFAULT_CONFIDENCE_SCORE: 92,
  /** 신뢰도 증가 계수 (아이디어 100개당 10점 증가) */
  CONFIDENCE_MULTIPLIER: 10,
  /** 신뢰도 계산 기준 단위 */
  CONFIDENCE_BASE_UNIT: 100,
  /** AI 응답 시간 목표 (초) */
  TARGET_RESPONSE_TIME: 20,
} as const;

/**
 * 텔레그램 봇 메시지 템플릿
 */
export const TELEGRAM_TEMPLATES = {
  /** 테스트 메시지 제목 */
  TEST_TITLE: '🧪 <b>IdeaSpark 봇 테스트</b>',
  /** 테스트 메시지 인사 */
  TEST_GREETING: '안녕하세요! IdeaSpark 텔레그램 봇이 정상적으로 작동하고 있습니다.',
  /** 테스트 메시지 스케줄 안내 */
  TEST_SCHEDULE: '🤖 매일 오전 9시에 최신 비즈니스 아이디어를 전송합니다.',
  /** 일일 다이제스트 제목 */
  DAILY_TITLE: '🚀 <b>IdeaSpark 데일리 리포트</b>',
  /** 일일 요약 제목 */
  DAILY_SUMMARY_TITLE: '📊 <b>오늘의 요약</b>',
  /** 아이디어 섹션 제목 */
  IDEAS_SECTION_TITLE: '💡 <b>상위 5개 비즈니스 아이디어</b>',
  /** 구분선 */
  SEPARATOR: '━━━━━━━━━━━━━━━━━━━━━',
  /** 푸터 텍스트 */
  FOOTER_TEXT: '🤖 <i>실시간 갈증포인트 기반 AI 분석으로 생성되었습니다.</i>',
  /** 웹사이트 링크 텍스트 */
  WEBSITE_LINK: '🔗 자세한 내용: <a href="https://ideaspark-v2.vercel.app">IdeaSpark 방문하기</a>',
} as const;

/**
 * 비즈니스 아이디어 기본값
 */
export const BUSINESS_IDEA_DEFAULTS = {
  /** 기본 예산 */
  DEFAULT_COST: '$50,000',
  /** 기본 출시 기간 */
  DEFAULT_TIME_TO_MARKET: '6 months',
  /** 예산 계수 (난이도 * 10000) */
  COST_MULTIPLIER: 10000,
  /** 출시 기간 계수 (난이도 * 2 months) */
  TIME_MULTIPLIER: 2,
  /** 기본 타겟 마켓 */
  DEFAULT_TARGET_MARKET: 'General Market',
} as const;

/**
 * 데이터베이스 쿼리 관련 상수
 */
export const DB_QUERY_LIMITS = {
  /** 저장된 아이디어 기본 조회 개수 */
  SAVED_IDEAS_DEFAULT: 20,
  /** 최신 아이디어 조회 개수 */
  RECENT_IDEAS: 5,
  /** 사용자별 최대 저장 가능 아이디어 수 */
  MAX_SAVED_PER_USER: 100,
} as const;

/**
 * API 응답 시간 제한 (밀리초)
 */
export const API_TIMEOUTS = {
  /** Reddit API 타임아웃 */
  REDDIT_API: 10000, // 10초
  /** OpenAI API 타임아웃 */
  OPENAI_API: 60000, // 60초
  /** Telegram API 타임아웃 */
  TELEGRAM_API: 5000, // 5초
  /** 데이터베이스 쿼리 타임아웃 */
  DATABASE_QUERY: 5000, // 5초
} as const;

/**
 * 상태 메시지 상수
 */
export const STATUS_MESSAGES = {
  /** 성공 메시지 */
  SUCCESS: {
    STATS_RETRIEVED: 'Real-time statistics retrieved successfully',
    TELEGRAM_TEST_COMPLETED: 'Telegram test completed successfully',
    DAILY_TASKS_COMPLETED: 'All daily tasks completed successfully',
    DAILY_TASKS_PARTIAL: 'Daily tasks completed with some errors',
    BOT_CONNECTION_SUCCESS: 'Bot connection successful',
    DIGEST_SENT: 'Daily digest sent successfully',
    TEST_MESSAGE_SENT: 'Test message sent successfully',
  },
  /** 에러 메시지 */
  ERROR: {
    MISSING_CHAT_ID: 'Missing chatId parameter',
    UNAUTHORIZED_CRON: 'Unauthorized access to cron endpoint',
    INVALID_TEST_TYPE: 'Invalid test type. Use: test, digest, or connection',
    NO_IDEAS_FOR_DIGEST: 'No business ideas found for digest',
    BOT_CONNECTION_FAILED: 'Bot connection failed',
    DAILY_TASKS_FAILED: 'Daily tasks execution failed',
    INTERNAL_ERROR: 'Internal server error',
  },
  /** 정보 메시지 */
  INFO: {
    USING_FALLBACK_DATA: 'Using fallback data due to database unavailability',
    TELEGRAM_API_DOC: 'Telegram Test API documentation',
    CRON_SECRET_REQUIRED: 'Valid CRON_SECRET bearer token required',
    SUPPORTED_TEST_TYPES: 'Supported types: test, digest, connection',
  },
} as const;

/**
 * 카테고리 분류 기본값
 */
export const CATEGORIES = {
  /** 기본 상위 카테고리 */
  DEFAULT_TOP_CATEGORIES: ['AI & Tech', 'Productivity', 'SaaS'],
  /** 기본 트렌딩 키워드 */
  DEFAULT_TRENDING_KEYWORDS: ['AI', 'automation', 'productivity', 'SaaS', 'development'],
  /** 카테고리별 기본 점수 */
  DEFAULT_CATEGORY_SCORES: {
    'AI & Tech': 35,
    'Productivity': 28,
    'SaaS': 22,
  },
} as const;

/**
 * URL 및 엔드포인트 상수
 */
export const ENDPOINTS = {
  /** 기본 API URL (프로덕션) */
  PRODUCTION_API: 'https://ideaspark-v2.vercel.app/api',
  /** 로컬 개발 API URL */
  LOCAL_API: 'http://localhost:3000',
  /** 웹사이트 URL */
  WEBSITE_URL: 'https://ideaspark-v2.vercel.app',
} as const;

/**
 * 타입 가드 함수들
 */
export function isValidTestType(type: string): type is 'test' | 'digest' | 'connection' {
  return ['test', 'digest', 'connection'].includes(type);
}

/**
 * 유틸리티 함수들
 */
export const UTILS = {
  /** 현재 한국 시간 포맷 */
  getCurrentKoreanTime: () => new Date().toLocaleString('ko-KR'),
  /** 현재 날짜 (한국 형식) */
  getCurrentKoreanDate: () => new Date().toLocaleDateString('ko-KR'),
  /** ISO 타임스탬프 생성 */
  getCurrentTimestamp: () => new Date().toISOString(),
} as const;