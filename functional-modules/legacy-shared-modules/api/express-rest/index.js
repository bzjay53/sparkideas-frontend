/**
 * 🚀 Express REST API Module
 * IdeaSpark 패턴 기반 재사용 가능한 REST API 모듈
 */

const express = require('express');

class RestAPIModule {
  constructor(options = {}) {
    this.options = {
      enableSwagger: true,
      enableCors: true,
      enableAuth: true,
      enableLogging: true,
      ...options
    };
    
    this.router = express.Router();
    this.routes = new Map();
  }

  /**
   * CRUD 패턴 자동 생성
   * IdeaSpark ideas.ts, auth.ts 패턴 기반
   */
  createCRUDRoutes(resource, config = {}) {
    const {
      table = resource,
      middleware = [],
      customRoutes = {},
      swaggerSchema = null
    } = config;

    // GET /resource - 목록 조회
    this.router.get(`/${resource}`, ...middleware, async (req, res) => {
      try {
        const { page = 1, limit = 10, sort = 'created_at', order = 'DESC' } = req.query;
        const offset = (page - 1) * limit;
        
        const query = `
          SELECT * FROM ${table} 
          ORDER BY ${sort} ${order}
          LIMIT $1 OFFSET $2
        `;
        
        const result = await this.executeQuery(query, [limit, offset]);
        
        res.json({
          success: true,
          data: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.rowCount
          }
        });
      } catch (error) {
        this.handleError(res, error);
      }
    });

    // GET /resource/:id - 단일 조회
    this.router.get(`/${resource}/:id`, ...middleware, async (req, res) => {
      try {
        const { id } = req.params;
        const query = `SELECT * FROM ${table} WHERE id = $1`;
        const result = await this.executeQuery(query, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: `${resource} not found`
          });
        }
        
        res.json({
          success: true,
          data: result.rows[0]
        });
      } catch (error) {
        this.handleError(res, error);
      }
    });

    // POST /resource - 생성
    this.router.post(`/${resource}`, ...middleware, async (req, res) => {
      try {
        const data = req.body;
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
          INSERT INTO ${table} (${fields.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `;
        
        const result = await this.executeQuery(query, values);
        
        res.status(201).json({
          success: true,
          data: result.rows[0],
          message: `${resource} created successfully`
        });
      } catch (error) {
        this.handleError(res, error);
      }
    });

    // PUT /resource/:id - 수정
    this.router.put(`/${resource}/:id`, ...middleware, async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;
        const fields = Object.keys(data);
        const values = Object.values(data);
        
        const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
        const query = `
          UPDATE ${table} 
          SET ${setClause}, updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `;
        
        const result = await this.executeQuery(query, [id, ...values]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: `${resource} not found`
          });
        }
        
        res.json({
          success: true,
          data: result.rows[0],
          message: `${resource} updated successfully`
        });
      } catch (error) {
        this.handleError(res, error);
      }
    });

    // DELETE /resource/:id - 삭제
    this.router.delete(`/${resource}/:id`, ...middleware, async (req, res) => {
      try {
        const { id } = req.params;
        const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
        const result = await this.executeQuery(query, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: `${resource} not found`
          });
        }
        
        res.json({
          success: true,
          message: `${resource} deleted successfully`
        });
      } catch (error) {
        this.handleError(res, error);
      }
    });

    // 커스텀 라우트 추가
    Object.entries(customRoutes).forEach(([path, handler]) => {
      const method = path.split(' ')[0].toLowerCase();
      const route = path.split(' ')[1];
      this.router[method](`/${resource}${route}`, ...middleware, handler);
    });

    this.routes.set(resource, {
      table,
      middleware,
      swaggerSchema,
      customRoutes
    });

    return this;
  }

  /**
   * 인증 라우트 생성 (IdeaSpark auth.ts 패턴)
   */
  createAuthRoutes(config = {}) {
    const {
      userTable = 'users',
      enableRegister = true,
      enableLogin = true,
      enableProfile = true,
      jwtSecret = process.env.JWT_SECRET,
      jwtExpiry = '24h'
    } = config;

    if (enableRegister) {
      this.router.post('/auth/register', async (req, res) => {
        try {
          const { email, password, username, display_name } = req.body;
          
          // 중복 검사
          const existingUser = await this.executeQuery(
            `SELECT id FROM ${userTable} WHERE email = $1 OR username = $2`,
            [email, username]
          );
          
          if (existingUser.rows.length > 0) {
            return res.status(400).json({
              success: false,
              error: 'Email or username already exists'
            });
          }
          
          // 패스워드 해시화
          const bcrypt = require('bcryptjs');
          const hashedPassword = await bcrypt.hash(password, 10);
          
          const query = `
            INSERT INTO ${userTable} (email, username, password, display_name)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, username, display_name, created_at
          `;
          
          const result = await this.executeQuery(query, [
            email, username, hashedPassword, display_name
          ]);
          
          res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'User registered successfully'
          });
        } catch (error) {
          this.handleError(res, error);
        }
      });
    }

    if (enableLogin) {
      this.router.post('/auth/login', async (req, res) => {
        try {
          const { email, password } = req.body;
          
          const query = `SELECT * FROM ${userTable} WHERE email = $1`;
          const result = await this.executeQuery(query, [email]);
          
          if (result.rows.length === 0) {
            return res.status(401).json({
              success: false,
              error: 'Invalid credentials'
            });
          }
          
          const user = result.rows[0];
          const bcrypt = require('bcryptjs');
          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (!isValidPassword) {
            return res.status(401).json({
              success: false,
              error: 'Invalid credentials'
            });
          }
          
          const jwt = require('jsonwebtoken');
          const token = jwt.sign(
            { 
              userId: user.id,
              email: user.email,
              username: user.username
            },
            jwtSecret,
            { expiresIn: jwtExpiry }
          );
          
          res.json({
            success: true,
            data: {
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
                display_name: user.display_name
              },
              token
            },
            message: 'Login successful'
          });
        } catch (error) {
          this.handleError(res, error);
        }
      });
    }

    return this;
  }

  /**
   * 에러 처리 (IdeaSpark 표준)
   */
  handleError(res, error) {
    console.error('API Error:', error);
    
    // 실제 구현 - Mock 데이터 사용 금지
    if (error.code) {
      switch (error.code) {
        case '23505': // PostgreSQL unique violation
          return res.status(400).json({
            success: false,
            error: 'Duplicate entry'
          });
        case '23503': // PostgreSQL foreign key violation
          return res.status(400).json({
            success: false,
            error: 'Referenced record not found'
          });
        default:
          break;
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }

  /**
   * 데이터베이스 쿼리 실행
   */
  async executeQuery(query, params = []) {
    // 실제 데이터베이스 연결이 필요
    if (!this.dbClient) {
      throw new Error('Database client not initialized. Call setDatabaseClient() first.');
    }
    return await this.dbClient.query(query, params);
  }

  /**
   * 데이터베이스 클라이언트 설정
   */
  setDatabaseClient(client) {
    this.dbClient = client;
    return this;
  }

  /**
   * Express 라우터 반환
   */
  getRouter() {
    return this.router;
  }

  /**
   * API 문서 생성 (Swagger)
   */
  generateApiDocs() {
    const docs = {
      openapi: '3.0.0',
      info: {
        title: 'Generated REST API',
        version: '1.0.0',
        description: 'Auto-generated from IdeaSpark patterns'
      },
      paths: {}
    };

    // 각 리소스별 문서 생성
    for (const [resource, config] of this.routes) {
      docs.paths[`/${resource}`] = {
        get: {
          summary: `Get ${resource} list`,
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'Success' }
          }
        },
        post: {
          summary: `Create new ${resource}`,
          responses: {
            201: { description: 'Created' }
          }
        }
      };
    }

    return docs;
  }
}

module.exports = {
  RestAPIModule,
  
  // 빠른 시작을 위한 헬퍼
  createAPI: (options) => new RestAPIModule(options),
  
  // IdeaSpark 호환 패턴
  createIdeasAPI: (dbClient) => {
    const api = new RestAPIModule()
      .setDatabaseClient(dbClient)
      .createCRUDRoutes('ideas', {
        middleware: [], // 인증 미들웨어 추가 가능
        customRoutes: {
          'GET /trending': async (req, res) => {
            // 트렌딩 아이디어 로직
            res.json({ success: true, data: [] });
          }
        }
      })
      .createCRUDRoutes('categories')
      .createAuthRoutes();
    
    return api.getRouter();
  }
};