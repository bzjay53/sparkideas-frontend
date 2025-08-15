/**
 * JWT 인증 모듈
 * 모든 프로젝트에서 재사용 가능한 JWT 토큰 관리 시스템
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTManager {
    constructor(config = {}) {
        this.secret = config.secret || process.env.JWT_SECRET || this.generateSecret();
        this.expiresIn = config.expiresIn || '24h';
        this.refreshExpiresIn = config.refreshExpiresIn || '7d';
        this.algorithm = config.algorithm || 'HS256';
        this.issuer = config.issuer || 'shared-modules';
        this.audience = config.audience || 'api';
    }

    /**
     * 비밀키 자동 생성 (환경변수 없을 때)
     */
    generateSecret() {
        const secret = crypto.randomBytes(64).toString('hex');
        console.warn('⚠️  JWT_SECRET이 설정되지 않았습니다. 자동 생성된 키를 사용합니다.');
        console.warn(`   환경변수에 추가하세요: JWT_SECRET=${secret}`);
        return secret;
    }

    /**
     * Access Token 생성
     */
    generateToken(payload) {
        if (!payload || typeof payload !== 'object') {
            throw new Error('Payload must be an object');
        }

        const token = jwt.sign(
            {
                ...payload,
                type: 'access',
                iat: Math.floor(Date.now() / 1000),
            },
            this.secret,
            {
                expiresIn: this.expiresIn,
                algorithm: this.algorithm,
                issuer: this.issuer,
                audience: this.audience,
            }
        );

        return token;
    }

    /**
     * Refresh Token 생성
     */
    generateRefreshToken(payload) {
        const token = jwt.sign(
            {
                ...payload,
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000),
            },
            this.secret,
            {
                expiresIn: this.refreshExpiresIn,
                algorithm: this.algorithm,
                issuer: this.issuer,
                audience: this.audience,
            }
        );

        return token;
    }

    /**
     * 토큰 검증
     */
    verifyToken(token, options = {}) {
        try {
            const decoded = jwt.verify(token, this.secret, {
                algorithms: [this.algorithm],
                issuer: this.issuer,
                audience: this.audience,
                ...options
            });

            return {
                valid: true,
                decoded,
                expired: false
            };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return {
                    valid: false,
                    error: 'Token expired',
                    expired: true,
                    expiredAt: error.expiredAt
                };
            }

            return {
                valid: false,
                error: error.message,
                expired: false
            };
        }
    }

    /**
     * 토큰 갱신
     */
    refreshToken(refreshToken) {
        const verification = this.verifyToken(refreshToken);
        
        if (!verification.valid) {
            throw new Error(verification.error || 'Invalid refresh token');
        }

        if (verification.decoded.type !== 'refresh') {
            throw new Error('Not a refresh token');
        }

        // 기존 payload에서 불필요한 필드 제거
        const { exp, iat, type, ...payload } = verification.decoded;

        // 새로운 토큰 생성
        return {
            accessToken: this.generateToken(payload),
            refreshToken: this.generateRefreshToken(payload)
        };
    }

    /**
     * 토큰 디코드 (검증 없이)
     */
    decodeToken(token) {
        return jwt.decode(token, { complete: true });
    }

    /**
     * Express 미들웨어
     */
    middleware(options = {}) {
        return (req, res, next) => {
            const token = this.extractToken(req);
            
            if (!token) {
                if (options.optional) {
                    return next();
                }
                return res.status(401).json({ 
                    error: 'No token provided' 
                });
            }

            const verification = this.verifyToken(token);
            
            if (!verification.valid) {
                if (options.optional) {
                    return next();
                }
                
                const status = verification.expired ? 401 : 403;
                return res.status(status).json({ 
                    error: verification.error 
                });
            }

            // 사용자 정보를 request에 추가
            req.user = verification.decoded;
            next();
        };
    }

    /**
     * 토큰 추출 (헤더, 쿠키, 쿼리에서)
     */
    extractToken(req) {
        // Bearer Token
        if (req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        // Cookie
        if (req.cookies && req.cookies.token) {
            return req.cookies.token;
        }

        // Query Parameter
        if (req.query && req.query.token) {
            return req.query.token;
        }

        return null;
    }

    /**
     * 역할 기반 접근 제어
     */
    requireRole(roles) {
        if (!Array.isArray(roles)) {
            roles = [roles];
        }

        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Authentication required' 
                });
            }

            const userRole = req.user.role || req.user.roles;
            const hasRole = Array.isArray(userRole) 
                ? userRole.some(r => roles.includes(r))
                : roles.includes(userRole);

            if (!hasRole) {
                return res.status(403).json({ 
                    error: 'Insufficient permissions' 
                });
            }

            next();
        };
    }

    /**
     * 토큰 블랙리스트 체크 (Redis 연동 시)
     */
    async isBlacklisted(token, redisClient) {
        if (!redisClient) {
            return false;
        }

        const key = `blacklist:${token}`;
        const exists = await redisClient.exists(key);
        return exists === 1;
    }

    /**
     * 토큰 블랙리스트 추가
     */
    async blacklistToken(token, redisClient) {
        if (!redisClient) {
            console.warn('Redis client not provided, blacklist not saved');
            return;
        }

        const decoded = this.decodeToken(token);
        if (!decoded) return;

        const key = `blacklist:${token}`;
        const ttl = decoded.payload.exp - Math.floor(Date.now() / 1000);
        
        if (ttl > 0) {
            await redisClient.setex(key, ttl, '1');
        }
    }
}

// 싱글톤 인스턴스
let instance = null;

/**
 * 싱글톤 팩토리
 */
function createJWTManager(config) {
    if (!instance) {
        instance = new JWTManager(config);
    }
    return instance;
}

module.exports = {
    JWTManager,
    createJWTManager,
    // 편의 함수들
    generateToken: (payload, config) => new JWTManager(config).generateToken(payload),
    verifyToken: (token, config) => new JWTManager(config).verifyToken(token),
    middleware: (options, config) => new JWTManager(config).middleware(options),
};