import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/lib/database';

// Edge Runtime for faster global response
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    
    // Get analytics data
    const [overallStats, dailyAnalytics, trendingKeywords] = await Promise.all([
      AnalyticsService.getOverallStats(),
      AnalyticsService.getDailyAnalytics(days),
      AnalyticsService.getTrendingKeywords(days)
    ]);

    const response = {
      overall: overallStats,
      daily: dailyAnalytics,
      trending: trendingKeywords,
      meta: {
        period: days,
        generatedAt: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=3600', // 5min client, 1hr edge
      },
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}