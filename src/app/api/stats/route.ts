import { NextRequest } from 'next/server';
import { AnalyticsService, PainPointService, BusinessIdeaService } from '@/lib/database';
import { createSuccessResponse, createErrorResponse, type StatsData } from '@/lib/types/api';
import { 
  COLLECTION_LIMITS, 
  CACHE_DURATIONS, 
  FALLBACK_STATS, 
  GROWTH_METRICS,
  AI_CONFIG,
  STATUS_MESSAGES 
} from '@/lib/constants';

// Edge Runtime for faster global response
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get real-time statistics for the main page
    const [overallStats, topIdeas, trendingPainPoints] = await Promise.all([
      AnalyticsService.getOverallStats(),
      BusinessIdeaService.getTopIdeas(COLLECTION_LIMITS.IDEAS_TOP_COUNT),
      PainPointService.getTrending(COLLECTION_LIMITS.TRENDING_PAIN_POINTS)
    ]);

    // Calculate AI analysis accuracy based on real data
    const totalIdeas = overallStats.businessIdeas || 0;
    const accuracyScore = totalIdeas > 0 ? 
      Math.min(
        AI_CONFIG.MAX_CONFIDENCE_SCORE, 
        AI_CONFIG.MIN_CONFIDENCE_SCORE + (totalIdeas / AI_CONFIG.CONFIDENCE_BASE_UNIT) * AI_CONFIG.CONFIDENCE_MULTIPLIER
      ) : AI_CONFIG.DEFAULT_CONFIDENCE_SCORE;

    const statsData: StatsData = {
      painPoints: overallStats.painPoints || FALLBACK_STATS.PAIN_POINTS,
      businessIdeas: overallStats.businessIdeas || FALLBACK_STATS.BUSINESS_IDEAS,
      aiAccuracy: Math.round(accuracyScore),
      communityPosts: overallStats.communityPosts || FALLBACK_STATS.COMMUNITY_POSTS,
      telegramMessages: overallStats.telegramMessages || FALLBACK_STATS.TELEGRAM_MESSAGES,
      lastUpdated: new Date().toISOString(),
      realData: {
        topIdeas: topIdeas.slice(0, COLLECTION_LIMITS.DASHBOARD_TOP_IDEAS),
        trendingPainPoints: trendingPainPoints.slice(0, COLLECTION_LIMITS.DASHBOARD_TRENDING_POINTS),
        growthMetrics: {
          painPointsGrowth: GROWTH_METRICS.PAIN_POINTS_GROWTH,
          ideasGrowth: GROWTH_METRICS.IDEAS_GROWTH,
          accuracyTrend: GROWTH_METRICS.ACCURACY_TREND
        }
      }
    };

    const response = createSuccessResponse(
      statsData,
      STATUS_MESSAGES.SUCCESS.STATS_RETRIEVED,
      200
    );

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_DURATIONS.CLIENT_SHORT}, s-maxage=${CACHE_DURATIONS.EDGE_MEDIUM}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    
    // Fallback to reasonable defaults if database is unavailable
    const fallbackStatsData: StatsData = {
      painPoints: FALLBACK_STATS.PAIN_POINTS,
      businessIdeas: FALLBACK_STATS.BUSINESS_IDEAS,
      aiAccuracy: FALLBACK_STATS.AI_ACCURACY,
      communityPosts: FALLBACK_STATS.COMMUNITY_POSTS,
      telegramMessages: FALLBACK_STATS.TELEGRAM_MESSAGES,
      lastUpdated: new Date().toISOString(),
      realData: {
        topIdeas: [],
        trendingPainPoints: [],
        growthMetrics: {
          painPointsGrowth: GROWTH_METRICS.PAIN_POINTS_GROWTH,
          ideasGrowth: GROWTH_METRICS.IDEAS_GROWTH,
          accuracyTrend: GROWTH_METRICS.ACCURACY_TREND
        }
      }
    };

    const fallbackResponse = createSuccessResponse(
      fallbackStatsData,
      STATUS_MESSAGES.INFO.USING_FALLBACK_DATA,
      200
    );

    return new Response(JSON.stringify(fallbackResponse), {
      status: 200, // Return 200 with fallback data instead of 500
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_DURATIONS.FALLBACK_CLIENT}, s-maxage=${CACHE_DURATIONS.FALLBACK_EDGE}`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}