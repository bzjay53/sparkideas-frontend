import { NextRequest, NextResponse } from 'next/server';
import { telegramService, TelegramTemplateManager } from '@/lib/telegram-service';
import { supabase } from '@/lib/supabase';
import { createSuccessResponse, createErrorResponse, type CronTaskResult } from '@/lib/types/api';
import { handleError } from '@/lib/error-handler';
import { 
  COLLECTION_LIMITS, 
  CATEGORIES, 
  STATUS_MESSAGES,
  BUSINESS_IDEA_DEFAULTS
} from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    // 인증 토큰 확인 (Vercel Cron에서만 호출 가능)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      const errorResponse = createErrorResponse(
        'Unauthorized access to cron endpoint',
        401,
        'Valid CRON_SECRET bearer token required'
      );
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const cronResult: CronTaskResult = {
      timestamp: new Date().toISOString(),
      tasks: [],
      errors: []
    };

    // 1. 갈증포인트 수집 (Reddit API 사용)
    try {
      console.log('🔍 Starting pain point collection...');
      
      const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/collect-painpoints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: COLLECTION_LIMITS.PAIN_POINTS_CRON })
      });

      const data = await response.json();
      
      if (data.success) {
        cronResult.tasks.push({
          name: 'collect-pain-points',
          status: 'success',
          data: { 
            collected: data.data?.length || 0,
            sources: data.sources || ['reddit']
          }
        });
        console.log(`✅ Pain points collected: ${data.data?.length || 0}`);
      } else {
        throw new Error(data.error || 'Collection failed');
      }
    } catch (error) {
      console.error('❌ Pain point collection failed:', error);
      cronResult.errors.push({
        task: 'collect-pain-points',
        error: String(error)
      });
      
      // Fallback: Use existing pain points from database
      try {
        const { data: existingPainPoints } = await supabase
          .from('pain_points')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
          
        cronResult.tasks.push({
          name: 'collect-pain-points',
          status: 'fallback',
          data: { 
            collected: existingPainPoints?.length || 0,
            sources: ['database_fallback']
          }
        });
      } catch (fallbackError) {
        console.error('❌ Fallback collection also failed:', fallbackError);
      }
    }

    // 2. AI 비즈니스 아이디어 생성
    try {
      console.log('🤖 Generating business ideas...');
      
      const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/ai/generate-from-trending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          limit: COLLECTION_LIMITS.IDEAS_DAILY,
          source: 'daily_cron'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        cronResult.tasks.push({
          name: 'generate-ideas',
          status: 'success',
          data: { 
            generated: data.ideas?.length || 0,
            avgConfidence: data.avgConfidence || 0,
            ideas: data.ideas?.slice(0, 5) || []
          }
        });
        console.log(`✅ Business ideas generated: ${data.ideas?.length || 0}`);
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('❌ Idea generation failed:', error);
      cronResult.errors.push({
        task: 'generate-ideas',
        error: String(error)
      });
      
      // Fallback: Use existing top ideas
      try {
        const { data: existingIdeas } = await supabase
          .from('business_ideas')
          .select('*')
          .order('confidence_score', { ascending: false })
          .limit(5);
          
        cronResult.tasks.push({
          name: 'generate-ideas',
          status: 'fallback',
          data: { 
            generated: existingIdeas?.length || 0,
            avgConfidence: existingIdeas?.reduce((acc, idea) => acc + (idea.confidence_score || 0), 0) / (existingIdeas?.length || 1),
            ideas: existingIdeas || []
          }
        });
      } catch (fallbackError) {
        console.error('❌ Fallback idea generation also failed:', fallbackError);
      }
    }

    // 3. 텔레그램 전송 (실제 데이터 기반)
    try {
      console.log('📱 Sending Telegram daily digest...');
      
      // 생성된 아이디어 데이터 가져오기
      const ideasTask = cronResult.tasks.find(t => t.name === 'generate-ideas');
      const ideas = ideasTask?.data?.ideas || [];
      
      if (ideas.length === 0) {
        throw new Error('No business ideas available for digest');
      }
      
      // Daily Digest 포맷 구성
      const dailyDigest = {
        date: new Date().toLocaleDateString('ko-KR'),
        businessIdeas: ideas.map((idea: any) => ({
          title: idea.title || 'Untitled Idea',
          description: idea.description || 'No description available',
          confidenceScore: Math.round(idea.confidence_score || 0),
          targetMarket: idea.target_market || 'General Market',
          estimatedCost: idea.implementation_difficulty ? `$${idea.implementation_difficulty * BUSINESS_IDEA_DEFAULTS.COST_MULTIPLIER}` : BUSINESS_IDEA_DEFAULTS.DEFAULT_COST,
          timeToMarket: idea.implementation_difficulty ? `${idea.implementation_difficulty * BUSINESS_IDEA_DEFAULTS.TIME_MULTIPLIER} months` : BUSINESS_IDEA_DEFAULTS.DEFAULT_TIME_TO_MARKET
        })),
        summary: {
          totalIdeas: ideas.length,
          avgConfidence: Math.round(ideasTask?.data?.avgConfidence || 0),
          topCategories: [...CATEGORIES.DEFAULT_TOP_CATEGORIES]
        }
      };
      
      // 텔레그램 발송 (기본 채널 - 환경변수에서 가져오기)
      const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_DEFAULT_CHAT_ID || '-1234567890';
      const success = await telegramService.sendDailyDigest(chatId, dailyDigest);
      
      if (success) {
        // 발송 기록을 데이터베이스에 저장
        await supabase
          .from('telegram_messages')
          .insert({
            chat_id: chatId,
            message_type: 'daily_digest',
            business_idea_ids: ideas.map((idea: any) => idea.id).filter(Boolean),
            message_content: TelegramTemplateManager.formatDailyDigest(dailyDigest),
            sent_at: new Date().toISOString(),
            success: true
          });
      
        cronResult.tasks.push({
          name: 'send-telegram',
          status: 'success',
          data: { 
            chatId,
            ideasSent: ideas.length,
            digestSent: true
          }
        });
        
        console.log('✅ Telegram daily digest sent successfully');
      } else {
        throw new Error('Telegram sending failed');
      }
    } catch (error) {
      console.error('❌ Telegram sending failed:', error);
      cronResult.errors.push({
        task: 'send-telegram',
        error: String(error)
      });
      
      // 실패 기록도 저장
      try {
        await supabase
          .from('telegram_messages')
          .insert({
            chat_id: process.env.TELEGRAM_CHAT_ID || 'unknown',
            message_type: 'daily_digest',
            message_content: 'Failed to send daily digest',
            sent_at: new Date().toISOString(),
            success: false,
            error_message: String(error)
          });
      } catch (dbError) {
        console.error('❌ Failed to log telegram error to database:', dbError);
      }
    }

    // 4. 일일 분석 데이터 업데이트
    try {
      console.log('📊 Updating daily analytics...');
      
      const painPointsTask = cronResult.tasks.find(t => t.name === 'collect-pain-points');
      const ideasTask = cronResult.tasks.find(t => t.name === 'generate-ideas');
      const telegramTask = cronResult.tasks.find(t => t.name === 'send-telegram');
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Upsert daily analytics record
      const { error: analyticsError } = await supabase
        .from('daily_analytics')
        .upsert({
          date: today,
          pain_points_collected: painPointsTask?.data?.collected || 0,
          business_ideas_generated: ideasTask?.data?.generated || 0,
          telegram_messages_sent: telegramTask?.data?.digestSent ? 1 : 0,
          community_posts_created: 0, // Will be updated by community activity
          avg_confidence_score: ideasTask?.data?.avgConfidence || 0,
          top_categories: CATEGORIES.DEFAULT_CATEGORY_SCORES,
          trending_keywords: CATEGORIES.DEFAULT_TRENDING_KEYWORDS,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'date'
        });
      
      if (analyticsError) {
        console.error('Analytics update error:', analyticsError);
      } else {
        cronResult.tasks.push({
          name: 'update-analytics',
          status: 'success',
          data: { 
            date: today,
            painPoints: painPointsTask?.data?.collected || 0,
            ideas: ideasTask?.data?.generated || 0,
            telegram: telegramTask?.data?.digestSent ? 1 : 0
          }
        });
        console.log('✅ Daily analytics updated');
      }
    } catch (error) {
      console.error('❌ Analytics update failed:', error);
      cronResult.errors.push({
        task: 'update-analytics',
        error: String(error)
      });
    }

    // 결과 반환
    console.log('🎉 Daily tasks completed:', cronResult);
    
    const response = createSuccessResponse(
      cronResult,
      cronResult.errors.length === 0 
        ? STATUS_MESSAGES.SUCCESS.DAILY_TASKS_COMPLETED 
        : STATUS_MESSAGES.SUCCESS.DAILY_TASKS_PARTIAL,
      cronResult.errors.length > 0 ? 207 : 200
    );
    
    return NextResponse.json(response, { 
      status: cronResult.errors.length > 0 ? 207 : 200
    });

  } catch (error) {
    console.error('💥 Daily tasks failed:', error);
    
    const errorResponse = handleError(error, `daily-tasks-${Date.now()}`);
    return NextResponse.json(errorResponse, { 
      status: errorResponse.statusCode || 500 
    });
  }
}

// POST 메서드로도 접근 가능 (수동 트리거용)
export async function POST(request: NextRequest) {
  return GET(request);
}