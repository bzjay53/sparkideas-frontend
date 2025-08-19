import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// Edge Runtime for fastest health checks
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      api: 'healthy'
    },
    performance: {
      uptime: process.uptime ? Math.floor(process.uptime()) : 'N/A',
      responseTime: Date.now()
    }
  };

  try {
    // Test Supabase connection using pain_points table
    const { data, error } = await supabase
      .from('pain_points')
      .select('id')
      .limit(1);
    
    if (error) {
      healthCheck.services.database = 'error';
      healthCheck.status = 'degraded';
      console.error('Health check database error:', error);
    } else {
      healthCheck.services.database = 'healthy';
    }
  } catch (error) {
    healthCheck.services.database = 'error';
    healthCheck.status = 'unhealthy';
    console.error('Health check connection error:', error);
  }

  // Calculate response time
  healthCheck.performance.responseTime = Date.now() - healthCheck.performance.responseTime;

  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503;

  return new Response(JSON.stringify(healthCheck), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}