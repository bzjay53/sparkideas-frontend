/**
 * Dashboard API Routes
 * Real-time analytics and statistics - No Mock Data
 */

const express = require('express');
const router = express.Router();

// GET /api/v1/dashboard - Get dashboard overview
router.get('/', async (req, res) => {
  try {
    // Get real-time statistics
    const [
      painPointsCount,
      businessIdeasCount,
      usersCount,
      recentActivity
    ] = await Promise.all([
      // Pain points statistics
      req.db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 END) as today,
          COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as this_week,
          AVG(confidence_score) as avg_confidence,
          AVG(business_potential) as avg_potential
        FROM pain_points 
        WHERE status = 'active'
      `),
      
      // Business ideas statistics  
      req.db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 END) as today,
          COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as this_week,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
        FROM business_ideas
      `),
      
      // Users statistics
      req.db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 END) as today,
          COUNT(CASE WHEN last_login >= datetime('now', '-7 days') THEN 1 END) as active_week
        FROM users
      `),
      
      // Recent activity (last 10 items)
      req.db.query(`
        SELECT 'pain_point' as type, title, created_at, category as extra_info
        FROM pain_points 
        WHERE status = 'active'
        UNION ALL
        SELECT 'business_idea' as type, title, created_at, market_size as extra_info
        FROM business_ideas
        ORDER BY created_at DESC 
        LIMIT 10
      `)
    ]);

    // Get category breakdown
    const categoryBreakdown = await req.db.query(`
      SELECT 
        category,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence,
        AVG(business_potential) as avg_potential
      FROM pain_points 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);

    // Get trend data (last 30 days)
    const trendData = await req.db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as pain_points_created,
        (SELECT COUNT(*) FROM business_ideas WHERE DATE(created_at) = DATE(pp.created_at)) as ideas_created
      FROM pain_points pp
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    // Platform statistics
    const platformStats = await req.db.query(`
      SELECT 
        platform,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence
      FROM pain_points
      WHERE status = 'active'
      GROUP BY platform
      ORDER BY count DESC
    `);

    // Compile dashboard data
    const dashboardData = {
      overview: {
        pain_points: {
          total: painPointsCount[0]?.total || 0,
          today: painPointsCount[0]?.today || 0,
          this_week: painPointsCount[0]?.this_week || 0,
          avg_confidence: Math.round(painPointsCount[0]?.avg_confidence || 0),
          avg_potential: Math.round(painPointsCount[0]?.avg_potential || 0)
        },
        business_ideas: {
          total: businessIdeasCount[0]?.total || 0,
          today: businessIdeasCount[0]?.today || 0,
          this_week: businessIdeasCount[0]?.this_week || 0,
          approved: businessIdeasCount[0]?.approved || 0
        },
        users: {
          total: usersCount[0]?.total || 0,
          today: usersCount[0]?.today || 0,
          active_this_week: usersCount[0]?.active_week || 0
        }
      },
      
      recent_activity: recentActivity.map(item => ({
        type: item.type,
        title: item.title,
        created_at: item.created_at,
        extra_info: item.extra_info,
        time_ago: getTimeAgo(new Date(item.created_at))
      })),
      
      category_breakdown: categoryBreakdown,
      
      trend_data: trendData.reverse(), // Show oldest to newest for charts
      
      platform_stats: platformStats,
      
      key_metrics: {
        total_insights: (painPointsCount[0]?.total || 0) + (businessIdeasCount[0]?.total || 0),
        conversion_rate: businessIdeasCount[0]?.total > 0 ? 
          Math.round((businessIdeasCount[0]?.approved / businessIdeasCount[0]?.total) * 100) : 0,
        avg_quality_score: Math.round(
          ((painPointsCount[0]?.avg_confidence || 0) + (painPointsCount[0]?.avg_potential || 0)) / 2
        ),
        growth_rate: calculateGrowthRate(trendData)
      }
    };

    res.json({
      data: dashboardData,
      meta: {
        generated_at: new Date().toISOString(),
        mock_percentage: 0,
        data_source: 'real_database',
        cache_duration: 300 // 5 minutes
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch dashboard data',
        details: error.message
      }
    });
  }
});

// GET /api/v1/dashboard/analytics - Get detailed analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = "datetime('now', '-30 days')";
    if (period === '7d') dateFilter = "datetime('now', '-7 days')";
    if (period === '90d') dateFilter = "datetime('now', '-90 days')";
    
    // Detailed analytics queries
    const [hourlyActivity, topCategories, qualityDistribution] = await Promise.all([
      // Hourly activity pattern
      req.db.query(`
        SELECT 
          strftime('%H', created_at) as hour,
          COUNT(*) as activity_count
        FROM (
          SELECT created_at FROM pain_points WHERE created_at >= ${dateFilter}
          UNION ALL
          SELECT created_at FROM business_ideas WHERE created_at >= ${dateFilter}
        )
        GROUP BY hour
        ORDER BY hour
      `),
      
      // Top performing categories
      req.db.query(`
        SELECT 
          pp.category,
          COUNT(pp.id) as pain_points_count,
          COUNT(bi.id) as business_ideas_count,
          AVG(pp.confidence_score) as avg_confidence,
          AVG(pp.business_potential) as avg_potential
        FROM pain_points pp
        LEFT JOIN business_ideas bi ON pp.id = bi.pain_point_id
        WHERE pp.created_at >= ${dateFilter}
        GROUP BY pp.category
        ORDER BY pain_points_count DESC
        LIMIT 10
      `),
      
      // Quality score distribution
      req.db.query(`
        SELECT 
          CASE 
            WHEN confidence_score >= 90 THEN '90-100'
            WHEN confidence_score >= 80 THEN '80-89'
            WHEN confidence_score >= 70 THEN '70-79'
            WHEN confidence_score >= 60 THEN '60-69'
            ELSE 'Below 60'
          END as score_range,
          COUNT(*) as count
        FROM pain_points
        WHERE created_at >= ${dateFilter}
        GROUP BY score_range
        ORDER BY score_range DESC
      `)
    ]);

    res.json({
      data: {
        period,
        hourly_activity: hourlyActivity,
        top_categories: topCategories,
        quality_distribution: qualityDistribution,
        insights: {
          peak_hour: findPeakHour(hourlyActivity),
          top_category: topCategories[0]?.category || 'N/A',
          quality_trend: calculateQualityTrend(qualityDistribution)
        }
      },
      meta: {
        period,
        generated_at: new Date().toISOString(),
        data_points: hourlyActivity.length + topCategories.length + qualityDistribution.length
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch analytics',
        details: error.message
      }
    });
  }
});

// Helper functions
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
}

function calculateGrowthRate(trendData) {
  if (trendData.length < 2) return 0;
  
  const recent = trendData.slice(-7).reduce((sum, day) => sum + (day.pain_points_created || 0), 0);
  const previous = trendData.slice(-14, -7).reduce((sum, day) => sum + (day.pain_points_created || 0), 0);
  
  if (previous === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - previous) / previous) * 100);
}

function findPeakHour(hourlyData) {
  if (!hourlyData.length) return '알 수 없음';
  
  const peak = hourlyData.reduce((max, current) => 
    current.activity_count > max.activity_count ? current : max
  );
  
  return `${peak.hour}:00`;
}

function calculateQualityTrend(qualityData) {
  const highQuality = qualityData.filter(q => q.score_range === '90-100' || q.score_range === '80-89')
    .reduce((sum, q) => sum + q.count, 0);
  const total = qualityData.reduce((sum, q) => sum + q.count, 0);
  
  return total > 0 ? Math.round((highQuality / total) * 100) : 0;
}

module.exports = router;