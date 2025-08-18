import { NextRequest, NextResponse } from 'next/server';
import { telegramService } from '@/lib/telegram-service';
import { createSuccessResponse, createErrorResponse, type TelegramTestResult } from '@/lib/types/api';
import { handleError } from '@/lib/error-handler';
import { STATUS_MESSAGES, CATEGORIES } from '@/lib/constants';
import { isValidTestType } from '@/lib/constants';

export async function POST(request: NextRequest) {
  const requestId = `test-telegram-${Date.now()}`;
  
  try {
    const body = await request.json();
    const { chatId, type = 'test' } = body;

    if (!chatId) {
      const errorResponse = createErrorResponse(
        STATUS_MESSAGES.ERROR.MISSING_CHAT_ID,
        400,
        'chatId is required for telegram testing'
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!isValidTestType(type)) {
      const errorResponse = createErrorResponse(
        STATUS_MESSAGES.ERROR.INVALID_TEST_TYPE,
        400,
        STATUS_MESSAGES.INFO.SUPPORTED_TEST_TYPES
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const testResult: TelegramTestResult = {
      timestamp: new Date().toISOString(),
      chatId,
      type: type as 'test' | 'digest' | 'connection',
      message: ''
    };

    if (type === 'test') {
      // 간단한 테스트 메시지 발송
      const success = await telegramService.sendTestMessage(chatId);
      
      testResult.testMessageSent = success;
      testResult.message = success ? STATUS_MESSAGES.SUCCESS.TEST_MESSAGE_SENT : STATUS_MESSAGES.ERROR.BOT_CONNECTION_FAILED;

    } else if (type === 'digest') {
      // 실제 데일리 다이제스트 발송 (자동 데이터 기반)
      try {
        const success = await telegramService.sendDailyDigest(chatId);
        
        testResult.digestSent = success;
        testResult.message = success ? STATUS_MESSAGES.SUCCESS.DIGEST_SENT : STATUS_MESSAGES.ERROR.NO_IDEAS_FOR_DIGEST;
      } catch (error) {
        const errorResponse = createErrorResponse(
          STATUS_MESSAGES.ERROR.NO_IDEAS_FOR_DIGEST,
          404,
          'Cannot create digest without business ideas'
        );
        return NextResponse.json(errorResponse, { status: 404 });
      }

    } else if (type === 'connection') {
      // 봇 연결 상태 테스트
      const connectionTest = await telegramService.testBotConnection();
      
      testResult.connectionTest = connectionTest;
      testResult.message = connectionTest.success ? 
        STATUS_MESSAGES.SUCCESS.BOT_CONNECTION_SUCCESS : 
        `${STATUS_MESSAGES.ERROR.BOT_CONNECTION_FAILED}: ${connectionTest.error}`;
    }

    const response = createSuccessResponse(
      testResult,
      STATUS_MESSAGES.SUCCESS.TELEGRAM_TEST_COMPLETED
    );
    return NextResponse.json(response);

  } catch (error) {
    console.error('Telegram test error:', error);
    
    const errorResponse = handleError(error, requestId);
    return NextResponse.json(errorResponse, { 
      status: errorResponse.statusCode || 500 
    });
  }
}

export async function GET() {
  const apiDocumentation = {
    message: STATUS_MESSAGES.INFO.TELEGRAM_API_DOC,
    endpoints: {
      'POST /api/test-telegram': {
        description: 'Test Telegram bot functionality',
        body: {
          chatId: 'string (required)',
          type: 'string (test|digest|connection, default: test)'
        }
      }
    },
    examples: [
      {
        type: 'test',
        description: 'Send a simple test message',
        body: { chatId: 'YOUR_CHAT_ID', type: 'test' }
      },
      {
        type: 'digest',
        description: 'Send a daily digest with latest business ideas',
        body: { chatId: 'YOUR_CHAT_ID', type: 'digest' }
      },
      {
        type: 'connection',
        description: 'Test bot connection and get bot info',
        body: { chatId: 'YOUR_CHAT_ID', type: 'connection' }
      }
    ],
    serviceInfo: telegramService.getServiceInfo()
  };

  const response = createSuccessResponse(
    apiDocumentation,
    STATUS_MESSAGES.INFO.TELEGRAM_API_DOC
  );
  return NextResponse.json(response);
}