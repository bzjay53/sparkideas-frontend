/**
 * Telegram Bot 통합 서비스
 * 메시지 발송, 템플릿 관리, 데이터베이스 연동을 위한 체계화된 텔레그램 서비스
 */

import { 
  API_TIMEOUTS, 
  TELEGRAM_TEMPLATES,
  STATUS_MESSAGES,
  CATEGORIES,
  BUSINESS_IDEA_DEFAULTS,
  ENDPOINTS,
  UTILS
} from '@/lib/constants';
import { 
  AppError, 
  ErrorFactory, 
  ErrorLogger,
  ErrorCategory 
} from '@/lib/error-handler';
import { supabase } from '@/lib/supabase';

// 타입 정의
export interface TelegramConfig {
  botToken: string;
  apiUrl: string;
  defaultChatId?: string;
}

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
}

export interface DailyDigest {
  date: string;
  businessIdeas: Array<{
    title: string;
    description: string;
    confidenceScore: number;
    targetMarket: string;
    estimatedCost: string;
    timeToMarket: string;
  }>;
  summary: {
    totalIdeas: number;
    avgConfidence: number;
    topCategories: string[];
  };
}

export interface SendResult {
  success: boolean;
  messageId?: number;
  error?: string;
  timestamp: string;
}

export interface BotConnectionTest {
  success: boolean;
  botInfo?: {
    id: number;
    isBot: boolean;
    firstName: string;
    username: string;
    canJoinGroups: boolean;
    canReadAllGroupMessages: boolean;
    supportsInlineQueries: boolean;
  };
  error?: string;
}

/**
 * 텔레그램 메시지 템플릿 관리 클래스
 * 다양한 메시지 타입에 대한 템플릿을 중앙 관리
 */
class TelegramTemplateManager {
  /**
   * 일일 다이제스트 메시지 포맷팅
   */
  static formatDailyDigest(digest: DailyDigest): string {
    const { businessIdeas, summary } = digest;
    
    let message = `${TELEGRAM_TEMPLATES.DAILY_TITLE}\n`;
    message += `📅 <i>${UTILS.getCurrentKoreanDate()}</i>\n\n`;
    
    message += `${TELEGRAM_TEMPLATES.DAILY_SUMMARY_TITLE}\n`;
    message += `• 총 아이디어: ${summary.totalIdeas}개\n`;
    message += `• 평균 신뢰도: ${summary.avgConfidence}%\n`;
    message += `• 주요 카테고리: ${summary.topCategories.join(', ')}\n\n`;
    
    message += `${TELEGRAM_TEMPLATES.IDEAS_SECTION_TITLE}\n\n`;
    
    businessIdeas.forEach((idea, index) => {
      message += `<b>${index + 1}. ${idea.title}</b>\n`;
      message += `${idea.description.substring(0, 150)}${idea.description.length > 150 ? '...' : ''}\n\n`;
      message += `🎯 타겟: ${idea.targetMarket}\n`;
      message += `💰 예산: ${idea.estimatedCost}\n`;
      message += `⏱ 출시: ${idea.timeToMarket}\n`;
      message += `📈 신뢰도: ${idea.confidenceScore}%\n\n`;
      message += `${index < businessIdeas.length - 1 ? `${TELEGRAM_TEMPLATES.SEPARATOR}\n\n` : ''}`;
    });
    
    message += `\n${TELEGRAM_TEMPLATES.FOOTER_TEXT}\n`;
    message += TELEGRAM_TEMPLATES.WEBSITE_LINK;
    
    return message;
  }

  /**
   * 테스트 메시지 포맷팅
   */
  static formatTestMessage(): string {
    return `${TELEGRAM_TEMPLATES.TEST_TITLE}

${TELEGRAM_TEMPLATES.TEST_GREETING}

📅 현재 시간: ${UTILS.getCurrentKoreanTime()}
${TELEGRAM_TEMPLATES.TEST_SCHEDULE}

🔗 <a href="${ENDPOINTS.WEBSITE_URL}">IdeaSpark 웹사이트</a>`;
  }

  /**
   * 에러 알림 메시지 포맷팅
   */
  static formatErrorAlert(error: string, context?: string): string {
    return `🚨 <b>시스템 알림</b>

❌ <b>에러 발생:</b> ${error}

${context ? `📋 <b>상황:</b> ${context}\n` : ''}
🕐 <b>시간:</b> ${UTILS.getCurrentKoreanTime()}

🔧 시스템 관리자에게 문의해주세요.`;
  }

  /**
   * 성공 알림 메시지 포맷팅
   */
  static formatSuccessAlert(message: string, details?: string): string {
    return `✅ <b>작업 완료</b>

📋 <b>내용:</b> ${message}

${details ? `📊 <b>세부사항:</b> ${details}\n` : ''}
🕐 <b>시간:</b> ${UTILS.getCurrentKoreanTime()}`;
  }
}

/**
 * 텔레그램 API 클라이언트 클래스
 * HTTP 통신, 메시지 발송, 봇 상태 관리 담당
 */
class TelegramAPIClient {
  private config: TelegramConfig;

  constructor(config: TelegramConfig) {
    this.config = config;
  }

  /**
   * 텔레그램 API 직접 호출
   */
  private async callAPI(method: string, data: any = {}): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.TELEGRAM_API);

      const response = await fetch(`${this.config.apiUrl}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw ErrorFactory.externalApi('Telegram', `API request failed with status ${response.status}`, {
          method,
          status: response.status,
          statusText: response.statusText
        });
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.externalApi('Telegram', `Failed to call API method ${method}`, {
        method,
        originalError: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 메시지 발송
   */
  async sendMessage(chatId: string, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<SendResult> {
    try {
      const result = await this.callAPI('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      });

      return {
        success: true,
        messageId: result.result?.message_id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      ErrorLogger.log(
        ErrorFactory.externalApi('Telegram', 'Failed to send message', { chatId, error: errorMsg }),
        `telegram-send-${Date.now()}`
      );

      return {
        success: false,
        error: errorMsg,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 봇 정보 가져오기
   */
  async getBotInfo(): Promise<BotConnectionTest> {
    try {
      const result = await this.callAPI('getMe');
      
      return {
        success: true,
        botInfo: {
          id: result.result.id,
          isBot: result.result.is_bot,
          firstName: result.result.first_name,
          username: result.result.username,
          canJoinGroups: result.result.can_join_groups,
          canReadAllGroupMessages: result.result.can_read_all_group_messages,
          supportsInlineQueries: result.result.supports_inline_queries
        }
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMsg
      };
    }
  }
}

/**
 * 텔레그램 데이터베이스 연동 클래스
 * 메시지 발송 기록, 사용자 관리, 통계 수집 담당
 */
class TelegramDatabaseManager {
  /**
   * 메시지 발송 기록 저장
   */
  static async logMessage(params: {
    chatId: string;
    messageType: string;
    messageContent: string;
    success: boolean;
    businessIdeaIds?: string[];
    errorMessage?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('telegram_messages')
        .insert({
          chat_id: params.chatId,
          message_type: params.messageType,
          message_content: params.messageContent,
          sent_at: new Date().toISOString(),
          success: params.success,
          business_idea_ids: params.businessIdeaIds || [],
          error_message: params.errorMessage
        });

      if (error) {
        throw ErrorFactory.database('Failed to log telegram message', { error, params });
      }
    } catch (error) {
      ErrorLogger.log(
        error instanceof AppError ? error : ErrorFactory.database('Database logging failed', { error, params }),
        `telegram-log-${Date.now()}`
      );
    }
  }

  /**
   * 일일 다이제스트용 아이디어 가져오기
   */
  static async getLatestIdeasForDigest(limit = 5): Promise<any[]> {
    try {
      const { data: ideas, error } = await supabase
        .from('business_ideas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw ErrorFactory.database('Failed to fetch ideas for digest', { error, limit });
      }

      return ideas || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.database('Failed to get latest ideas', {
        originalError: error instanceof Error ? error.message : String(error),
        limit
      });
    }
  }

  /**
   * 텔레그램 메시지 통계 가져오기
   */
  static async getMessageStats(): Promise<{
    totalSent: number;
    successRate: number;
    dailyDigestCount: number;
    lastSentAt?: string;
  }> {
    try {
      const { data: stats, error } = await supabase
        .from('telegram_messages')
        .select('success, message_type, sent_at')
        .order('sent_at', { ascending: false });

      if (error) {
        throw ErrorFactory.database('Failed to fetch message stats', { error });
      }

      const totalSent = stats?.length || 0;
      const successCount = stats?.filter(s => s.success).length || 0;
      const successRate = totalSent > 0 ? Math.round((successCount / totalSent) * 100) : 0;
      const dailyDigestCount = stats?.filter(s => s.message_type === 'daily_digest').length || 0;
      const lastSentAt = stats?.[0]?.sent_at;

      return {
        totalSent,
        successRate,
        dailyDigestCount,
        lastSentAt
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.database('Failed to get message stats', {
        originalError: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

/**
 * 텔레그램 서비스 메인 클래스
 * 전체 텔레그램 봇 워크플로우 관리
 */
export class TelegramService {
  private client: TelegramAPIClient;

  constructor() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    
    if (!botToken) {
      throw ErrorFactory.businessLogic('Telegram Bot Token not configured in environment variables', {
        hasBotToken: !!botToken
      });
    }

    const config: TelegramConfig = {
      botToken,
      apiUrl: `https://api.telegram.org/bot${botToken}`,
      defaultChatId: process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_DEFAULT_CHAT_ID
    };

    this.client = new TelegramAPIClient(config);
  }

  /**
   * 일반 메시지 발송
   */
  async sendMessage(chatId: string, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    const result = await this.client.sendMessage(chatId, text, parseMode);
    
    await TelegramDatabaseManager.logMessage({
      chatId,
      messageType: 'general',
      messageContent: text,
      success: result.success,
      errorMessage: result.error
    });

    return result.success;
  }

  /**
   * 일일 다이제스트 발송
   */
  async sendDailyDigest(chatId: string, digest?: DailyDigest): Promise<boolean> {
    try {
      let finalDigest: DailyDigest;
      
      if (digest) {
        finalDigest = digest;
      } else {
        // 최신 아이디어들로 다이제스트 생성
        const ideas = await TelegramDatabaseManager.getLatestIdeasForDigest(5);
        
        if (ideas.length === 0) {
          throw ErrorFactory.businessLogic('No business ideas available for digest creation', { chatId });
        }

        finalDigest = {
          date: UTILS.getCurrentKoreanDate(),
          businessIdeas: ideas.map((idea: any) => ({
            title: idea.title || 'Untitled Idea',
            description: idea.description || 'No description available',
            confidenceScore: Math.round(idea.confidence_score || 0),
            targetMarket: idea.target_market || BUSINESS_IDEA_DEFAULTS.DEFAULT_TARGET_MARKET,
            estimatedCost: idea.implementation_difficulty ? 
              `$${idea.implementation_difficulty * BUSINESS_IDEA_DEFAULTS.COST_MULTIPLIER}` : 
              BUSINESS_IDEA_DEFAULTS.DEFAULT_COST,
            timeToMarket: idea.implementation_difficulty ? 
              `${idea.implementation_difficulty * BUSINESS_IDEA_DEFAULTS.TIME_MULTIPLIER} months` : 
              BUSINESS_IDEA_DEFAULTS.DEFAULT_TIME_TO_MARKET
          })),
          summary: {
            totalIdeas: ideas.length,
            avgConfidence: Math.round(ideas.reduce((acc: number, idea: any) => acc + (idea.confidence_score || 0), 0) / ideas.length),
            topCategories: [...CATEGORIES.DEFAULT_TOP_CATEGORIES]
          }
        };
      }

      const formattedMessage = TelegramTemplateManager.formatDailyDigest(finalDigest);
      const result = await this.client.sendMessage(chatId, formattedMessage, 'HTML');

      await TelegramDatabaseManager.logMessage({
        chatId,
        messageType: 'daily_digest',
        messageContent: formattedMessage,
        success: result.success,
        businessIdeaIds: finalDigest.businessIdeas.map((_, index) => `digest_idea_${index}`),
        errorMessage: result.error
      });

      return result.success;
    } catch (error) {
      ErrorLogger.log(
        error instanceof AppError ? error : ErrorFactory.businessLogic('Failed to send daily digest', {
          chatId,
          originalError: error instanceof Error ? error.message : String(error)
        }),
        `telegram-digest-${Date.now()}`
      );

      return false;
    }
  }

  /**
   * 테스트 메시지 발송
   */
  async sendTestMessage(chatId: string): Promise<boolean> {
    const testMessage = TelegramTemplateManager.formatTestMessage();
    const result = await this.client.sendMessage(chatId, testMessage, 'HTML');

    await TelegramDatabaseManager.logMessage({
      chatId,
      messageType: 'test',
      messageContent: testMessage,
      success: result.success,
      errorMessage: result.error
    });

    return result.success;
  }

  /**
   * 에러 알림 발송 (시스템 관리자용)
   */
  async sendErrorAlert(chatId: string, error: string, context?: string): Promise<boolean> {
    const alertMessage = TelegramTemplateManager.formatErrorAlert(error, context);
    const result = await this.client.sendMessage(chatId, alertMessage, 'HTML');

    await TelegramDatabaseManager.logMessage({
      chatId,
      messageType: 'error_alert',
      messageContent: alertMessage,
      success: result.success,
      errorMessage: result.error
    });

    return result.success;
  }

  /**
   * 성공 알림 발송
   */
  async sendSuccessAlert(chatId: string, message: string, details?: string): Promise<boolean> {
    const alertMessage = TelegramTemplateManager.formatSuccessAlert(message, details);
    const result = await this.client.sendMessage(chatId, alertMessage, 'HTML');

    await TelegramDatabaseManager.logMessage({
      chatId,
      messageType: 'success_alert',
      messageContent: alertMessage,
      success: result.success,
      errorMessage: result.error
    });

    return result.success;
  }

  /**
   * 봇 연결 상태 테스트
   */
  async testBotConnection(): Promise<BotConnectionTest> {
    return await this.client.getBotInfo();
  }

  /**
   * 메시지 통계 가져오기
   */
  async getMessageStats() {
    return await TelegramDatabaseManager.getMessageStats();
  }

  /**
   * 서비스 정보 반환
   */
  getServiceInfo(): object {
    return {
      service: 'TelegramService',
      version: '2.0',
      features: [
        'Daily digest sending with real data',
        'Template-based message formatting',
        'Database message logging',
        'Bot connection testing',
        'Error and success alerts',
        'Message statistics tracking',
        'Timeout and retry handling'
      ],
      messageTypes: [
        'general',
        'daily_digest',
        'test',
        'error_alert',
        'success_alert'
      ],
      templates: Object.keys(TELEGRAM_TEMPLATES),
      limits: {
        timeout: API_TIMEOUTS.TELEGRAM_API,
        defaultDigestIdeas: 5
      }
    };
  }
}

// 기존 메서드들을 위한 호환성 유지
export const telegramService = new TelegramService();

// TelegramTemplateManager를 외부에서 사용할 수 있도록 export
export { TelegramTemplateManager };

// formatDailyDigest 메서드는 TelegramTemplateManager.formatDailyDigest로 직접 사용