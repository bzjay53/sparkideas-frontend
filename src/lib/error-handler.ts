/**
 * 통일된 에러 처리 시스템
 * 애플리케이션 전반에 걸친 일관된 에러 처리와 로깅을 제공
 */

import { createErrorResponse, type StandardAPIResponse } from '@/lib/types/api';
import { STATUS_MESSAGES } from '@/lib/constants';

/**
 * 에러 심각도 레벨
 */
export enum ErrorSeverity {
  /** 정보성 - 로그만 기록 */
  INFO = 'info',
  /** 경고 - 주의 필요 */
  WARNING = 'warning',
  /** 에러 - 처리 필요 */
  ERROR = 'error',
  /** 치명적 - 즉시 조치 필요 */
  CRITICAL = 'critical'
}

/**
 * 에러 카테고리
 */
export enum ErrorCategory {
  /** 인증/인가 관련 에러 */
  AUTH = 'auth',
  /** 데이터베이스 관련 에러 */
  DATABASE = 'database',
  /** 외부 API 관련 에러 */
  EXTERNAL_API = 'external_api',
  /** 비즈니스 로직 에러 */
  BUSINESS_LOGIC = 'business_logic',
  /** 시스템 에러 */
  SYSTEM = 'system',
  /** 사용자 입력 에러 */
  USER_INPUT = 'user_input',
  /** 네트워크 에러 */
  NETWORK = 'network'
}

/**
 * 표준화된 애플리케이션 에러 클래스
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly userMessage: string;
  public readonly context?: Record<string, any>;
  public readonly timestamp: string;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    userMessage?: string,
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.severity = severity;
    this.category = category;
    this.userMessage = userMessage || this.getDefaultUserMessage(statusCode);
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;

    // V8 에러 스택 트레이스 보정
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * HTTP 상태 코드에 따른 기본 사용자 메시지 반환
   */
  private getDefaultUserMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return '잘못된 요청입니다. 입력값을 확인해주세요.';
      case 401:
        return '인증이 필요합니다. 다시 로그인해주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 409:
        return '요청이 현재 서버 상태와 충돌합니다.';
      case 429:
        return '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 502:
        return '서버 게이트웨이 오류입니다. 잠시 후 다시 시도해주세요.';
      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.';
      default:
        return '알 수 없는 오류가 발생했습니다.';
    }
  }

  /**
   * 에러를 JSON 형태로 직렬화
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      severity: this.severity,
      category: this.category,
      userMessage: this.userMessage,
      context: this.context,
      timestamp: this.timestamp,
      requestId: this.requestId,
      stack: this.stack
    };
  }
}

/**
 * 사전 정의된 에러 생성 함수들
 */
export const ErrorFactory = {
  /**
   * 인증 관련 에러
   */
  unauthorized(message: string = '인증이 필요합니다', context?: Record<string, any>): AppError {
    return new AppError(
      message,
      401,
      ErrorSeverity.WARNING,
      ErrorCategory.AUTH,
      '로그인이 필요합니다. 다시 로그인해주세요.',
      context
    );
  },

  /**
   * 권한 관련 에러
   */
  forbidden(message: string = '접근 권한이 없습니다', context?: Record<string, any>): AppError {
    return new AppError(
      message,
      403,
      ErrorSeverity.WARNING,
      ErrorCategory.AUTH,
      '이 작업을 수행할 권한이 없습니다.',
      context
    );
  },

  /**
   * 리소스를 찾을 수 없음
   */
  notFound(resource: string, context?: Record<string, any>): AppError {
    return new AppError(
      `${resource}을(를) 찾을 수 없습니다`,
      404,
      ErrorSeverity.INFO,
      ErrorCategory.BUSINESS_LOGIC,
      `요청한 ${resource}이(가) 존재하지 않습니다.`,
      context
    );
  },

  /**
   * 잘못된 사용자 입력
   */
  badRequest(message: string, context?: Record<string, any>): AppError {
    return new AppError(
      message,
      400,
      ErrorSeverity.INFO,
      ErrorCategory.USER_INPUT,
      '입력값이 올바르지 않습니다. 다시 확인해주세요.',
      context
    );
  },

  /**
   * 데이터베이스 에러
   */
  database(message: string, context?: Record<string, any>): AppError {
    return new AppError(
      `Database error: ${message}`,
      500,
      ErrorSeverity.ERROR,
      ErrorCategory.DATABASE,
      '데이터 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      context
    );
  },

  /**
   * 외부 API 에러
   */
  externalApi(service: string, message: string, context?: Record<string, any>): AppError {
    return new AppError(
      `External API error (${service}): ${message}`,
      502,
      ErrorSeverity.ERROR,
      ErrorCategory.EXTERNAL_API,
      `외부 서비스(${service}) 연동 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`,
      context
    );
  },

  /**
   * 비즈니스 로직 에러
   */
  businessLogic(message: string, context?: Record<string, any>): AppError {
    return new AppError(
      message,
      422,
      ErrorSeverity.WARNING,
      ErrorCategory.BUSINESS_LOGIC,
      '요청을 처리할 수 없습니다. 입력값을 확인해주세요.',
      context
    );
  },

  /**
   * 레이트 리미팅 에러
   */
  rateLimited(message: string = 'Too many requests', context?: Record<string, any>): AppError {
    return new AppError(
      message,
      429,
      ErrorSeverity.WARNING,
      ErrorCategory.SYSTEM,
      '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
      context
    );
  }
};

/**
 * 에러 로깅 시스템
 */
export class ErrorLogger {
  /**
   * 에러를 적절한 수준으로 로깅
   */
  static log(error: AppError | Error, requestId?: string): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      requestId,
      ...(error instanceof AppError ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    };

    // 심각도에 따른 로깅 레벨 결정
    if (error instanceof AppError) {
      switch (error.severity) {
        case ErrorSeverity.INFO:
          console.info('🔵 INFO:', errorInfo);
          break;
        case ErrorSeverity.WARNING:
          console.warn('🟡 WARNING:', errorInfo);
          break;
        case ErrorSeverity.ERROR:
          console.error('🔴 ERROR:', errorInfo);
          break;
        case ErrorSeverity.CRITICAL:
          console.error('🚨 CRITICAL:', errorInfo);
          // 추가: 알림 시스템 연동 (Slack, 이메일 등)
          break;
      }
    } else {
      console.error('❌ UNKNOWN ERROR:', errorInfo);
    }

    // 프로덕션 환경에서는 외부 로깅 서비스로 전송
    // 예: Sentry, LogRocket, DataDog 등
    if (process.env.NODE_ENV === 'production') {
      // TODO: 외부 로깅 서비스 연동
    }
  }

  /**
   * 성능 지표와 함께 에러 로깅
   */
  static logWithMetrics(
    error: AppError | Error, 
    metrics: { duration?: number; memoryUsage?: number }, 
    requestId?: string
  ): void {
    console.error('📊 ERROR WITH METRICS:', {
      error: error instanceof AppError ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      metrics,
      requestId,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 에러를 표준 API 응답으로 변환하는 핸들러
 */
export function handleError(error: unknown, requestId?: string): StandardAPIResponse {
  // AppError 인스턴스인 경우
  if (error instanceof AppError) {
    ErrorLogger.log(error, requestId);
    return createErrorResponse(
      error.userMessage,
      error.statusCode,
      error.message
    );
  }

  // 일반 Error 인스턴스인 경우
  if (error instanceof Error) {
    const appError = new AppError(
      error.message,
      500,
      ErrorSeverity.ERROR,
      ErrorCategory.SYSTEM,
      undefined,
      undefined,
      requestId
    );
    ErrorLogger.log(appError, requestId);
    return createErrorResponse(
      appError.userMessage,
      500,
      error.message
    );
  }

  // 알 수 없는 에러인 경우
  const unknownError = new AppError(
    `Unknown error: ${String(error)}`,
    500,
    ErrorSeverity.ERROR,
    ErrorCategory.SYSTEM,
    undefined,
    { originalError: error },
    requestId
  );
  ErrorLogger.log(unknownError, requestId);
  return createErrorResponse(
    unknownError.userMessage,
    500,
    String(error)
  );
}

/**
 * Promise 기반 함수의 에러를 자동으로 처리하는 래퍼
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return ((...args: Parameters<T>) => {
    return fn(...args).catch((error: unknown) => {
      if (error instanceof AppError) {
        throw error;
      }
      
      // 일반 에러를 AppError로 변환
      throw new AppError(
        error instanceof Error ? error.message : String(error),
        500,
        ErrorSeverity.ERROR,
        ErrorCategory.SYSTEM,
        undefined,
        { ...context, originalArgs: args }
      );
    });
  }) as T;
}

/**
 * 특정 에러 유형 체크 유틸리티
 */
export const ErrorUtils = {
  /**
   * 인증 에러인지 확인
   */
  isAuthError(error: unknown): error is AppError {
    return error instanceof AppError && error.category === ErrorCategory.AUTH;
  },

  /**
   * 데이터베이스 에러인지 확인
   */
  isDatabaseError(error: unknown): error is AppError {
    return error instanceof AppError && error.category === ErrorCategory.DATABASE;
  },

  /**
   * 외부 API 에러인지 확인
   */
  isExternalApiError(error: unknown): error is AppError {
    return error instanceof AppError && error.category === ErrorCategory.EXTERNAL_API;
  },

  /**
   * 재시도 가능한 에러인지 확인
   */
  isRetryable(error: unknown): boolean {
    if (!(error instanceof AppError)) return false;
    
    return [
      ErrorCategory.NETWORK,
      ErrorCategory.EXTERNAL_API,
      ErrorCategory.SYSTEM
    ].includes(error.category) && error.statusCode >= 500;
  },

  /**
   * 에러에서 상태 코드 추출
   */
  getStatusCode(error: unknown): number {
    if (error instanceof AppError) {
      return error.statusCode;
    }
    return 500;
  }
};