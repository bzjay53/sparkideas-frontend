/**
 * Pain Points API Routes
 * 100% Real Data Implementation - No Mock
 */

const express = require('express');
const router = express.Router();

// GET /api/v1/pain-points - Get all pain points
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0, category, status = 'active' } = req.query;
    
    let query = `
      SELECT 
        id, title, description, category, platform, url,
        confidence_score, business_potential, status,
        created_at, updated_at
      FROM pain_points 
      WHERE status = ?
    `;
    
    const params = [status];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const painPoints = await req.db.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM pain_points WHERE status = ?';
    const countParams = [status];
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    const totalResult = await req.db.get(countQuery, countParams);
    const total = totalResult.total;
    
    res.json({
      data: painPoints,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      },
      meta: {
        mock_percentage: 0,
        data_source: 'real_database'
      }
    });
  } catch (error) {
    console.error('Error fetching pain points:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch pain points',
        details: error.message
      }
    });
  }
});

// GET /api/v1/pain-points/:id - Get single pain point
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const painPoint = await req.db.get(
      `SELECT 
        id, title, description, category, platform, url,
        confidence_score, business_potential, status,
        created_at, updated_at
       FROM pain_points 
       WHERE id = ?`,
      [id]
    );
    
    if (!painPoint) {
      return res.status(404).json({
        error: {
          message: 'Pain point not found',
          id
        }
      });
    }
    
    // Get related business ideas
    const businessIdeas = await req.db.query(
      `SELECT id, title, description, market_size, implementation_difficulty, revenue_potential 
       FROM business_ideas 
       WHERE pain_point_id = ?`,
      [id]
    );
    
    res.json({
      data: {
        ...painPoint,
        business_ideas: businessIdeas
      },
      meta: {
        mock_percentage: 0,
        data_source: 'real_database'
      }
    });
  } catch (error) {
    console.error('Error fetching pain point:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch pain point',
        details: error.message
      }
    });
  }
});

// POST /api/v1/pain-points - Create new pain point
router.post('/', async (req, res) => {
  try {
    const { title, description, category, platform, url, confidence_score, business_potential } = req.body;
    
    // Validation
    if (!title || !description || !category || !platform) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields',
          required: ['title', 'description', 'category', 'platform']
        }
      });
    }
    
    const result = await req.db.query(
      `INSERT INTO pain_points 
       (title, description, category, platform, url, confidence_score, business_potential) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, platform, url || null, confidence_score || 0, business_potential || 0]
    );
    
    // Fetch the created pain point
    const newPainPoint = await req.db.get(
      'SELECT * FROM pain_points WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json({
      data: newPainPoint,
      meta: {
        action: 'created',
        id: result.lastID
      }
    });
  } catch (error) {
    console.error('Error creating pain point:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create pain point',
        details: error.message
      }
    });
  }
});

// PUT /api/v1/pain-points/:id - Update pain point
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, platform, url, confidence_score, business_potential, status } = req.body;
    
    // Check if pain point exists
    const existing = await req.db.get('SELECT id FROM pain_points WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        error: {
          message: 'Pain point not found',
          id
        }
      });
    }
    
    const result = await req.db.query(
      `UPDATE pain_points 
       SET title = ?, description = ?, category = ?, platform = ?, url = ?, 
           confidence_score = ?, business_potential = ?, status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, category, platform, url, confidence_score, business_potential, status, id]
    );
    
    // Fetch updated pain point
    const updatedPainPoint = await req.db.get('SELECT * FROM pain_points WHERE id = ?', [id]);
    
    res.json({
      data: updatedPainPoint,
      meta: {
        action: 'updated',
        changes: result.changes
      }
    });
  } catch (error) {
    console.error('Error updating pain point:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update pain point',
        details: error.message
      }
    });
  }
});

// DELETE /api/v1/pain-points/:id - Delete pain point
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.db.query('DELETE FROM pain_points WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({
        error: {
          message: 'Pain point not found',
          id
        }
      });
    }
    
    res.json({
      meta: {
        action: 'deleted',
        id,
        changes: result.changes
      }
    });
  } catch (error) {
    console.error('Error deleting pain point:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete pain point',
        details: error.message
      }
    });
  }
});

// GET /api/v1/pain-points/categories - Get all categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await req.db.query(
      'SELECT DISTINCT category, COUNT(*) as count FROM pain_points GROUP BY category ORDER BY count DESC'
    );
    
    res.json({
      data: categories,
      meta: {
        total_categories: categories.length
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch categories',
        details: error.message
      }
    });
  }
});

module.exports = router;