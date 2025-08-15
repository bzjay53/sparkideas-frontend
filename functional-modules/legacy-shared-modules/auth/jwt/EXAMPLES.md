# JWT 모듈 사용 예제

## 기본 사용법

### 1. 설치 및 설정
```javascript
// 프로젝트에 모듈 복사
// cp -r /root/dev/shared-modules/auth/jwt ./src/auth/

const { createJWTManager } = require('./auth/jwt');

// JWT 매니저 생성
const jwtManager = createJWTManager({
    secret: process.env.JWT_SECRET,
    expiresIn: '1h',
    refreshExpiresIn: '7d'
});
```

### 2. 토큰 생성
```javascript
// 로그인 엔드포인트
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    // 사용자 인증 (실제 DB 조회)
    const user = await authenticateUser(email, password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 토큰 생성
    const accessToken = jwtManager.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
    });
    
    const refreshToken = jwtManager.generateRefreshToken({
        userId: user.id
    });
    
    res.json({
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    });
});
```

### 3. 미들웨어 사용
```javascript
// Express 앱에 미들웨어 적용
const express = require('express');
const app = express();

// 모든 /api/protected 경로 보호
app.use('/api/protected', jwtManager.middleware());

// 선택적 인증 (인증 없어도 접근 가능)
app.use('/api/public', jwtManager.middleware({ optional: true }));

// 보호된 라우트
app.get('/api/protected/profile', (req, res) => {
    // req.user에 디코드된 토큰 정보가 있음
    res.json({
        user: req.user
    });
});
```

### 4. 역할 기반 접근 제어
```javascript
// 관리자만 접근 가능
app.get('/api/admin/users', 
    jwtManager.middleware(),
    jwtManager.requireRole('admin'),
    async (req, res) => {
        const users = await getAllUsers();
        res.json(users);
    }
);

// 여러 역할 허용
app.post('/api/content/create',
    jwtManager.middleware(),
    jwtManager.requireRole(['admin', 'editor']),
    async (req, res) => {
        // 컨텐츠 생성 로직
    }
);
```

### 5. 토큰 갱신
```javascript
app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;
    
    try {
        const tokens = jwtManager.refreshToken(refreshToken);
        res.json(tokens);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});
```

### 6. 로그아웃 (블랙리스트)
```javascript
const redis = require('redis');
const redisClient = redis.createClient();

app.post('/api/auth/logout', jwtManager.middleware(), async (req, res) => {
    const token = jwtManager.extractToken(req);
    
    // 토큰을 블랙리스트에 추가
    await jwtManager.blacklistToken(token, redisClient);
    
    res.json({ message: 'Logged out successfully' });
});
```

## 고급 사용법

### 1. 커스텀 검증 옵션
```javascript
// 특정 발급자만 허용
const verification = jwtManager.verifyToken(token, {
    issuer: 'my-app',
    audience: 'mobile-app'
});
```

### 2. 다중 시크릿 키 지원
```javascript
// 환경별 다른 시크릿 사용
const jwtManager = createJWTManager({
    secret: process.env.NODE_ENV === 'production' 
        ? process.env.JWT_SECRET_PROD 
        : process.env.JWT_SECRET_DEV
});
```

### 3. 토큰 정보 추출
```javascript
app.get('/api/token-info', (req, res) => {
    const token = jwtManager.extractToken(req);
    const decoded = jwtManager.decodeToken(token);
    
    res.json({
        header: decoded.header,
        payload: decoded.payload,
        signature: decoded.signature
    });
});
```

### 4. 에러 처리
```javascript
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ 
            error: 'Invalid token' 
        });
    } else if (err.name === 'TokenExpiredError') {
        res.status(401).json({ 
            error: 'Token expired',
            expiredAt: err.expiredAt
        });
    } else {
        next(err);
    }
});
```

## React/Next.js 통합

### 1. API 클라이언트 설정
```javascript
// utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');
            
            try {
                const { data } = await axios.post('/api/auth/refresh', {
                    refreshToken
                });
                
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                
                // 원래 요청 재시도
                error.config.headers.Authorization = `Bearer ${data.accessToken}`;
                return axios.request(error.config);
            } catch (refreshError) {
                // 리프레시 실패 - 로그인 페이지로
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
```

### 2. React Hook 사용
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
            try {
                const decoded = jwtDecode(token);
                
                // 토큰 만료 체크
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(decoded);
                } else {
                    localStorage.removeItem('accessToken');
                }
            } catch (error) {
                console.error('Invalid token:', error);
            }
        }
        
        setLoading(false);
    }, []);
    
    return { user, loading };
}
```

## 테스트 코드

```javascript
// jwt.test.js
const { JWTManager } = require('./jwt');

describe('JWT Manager', () => {
    let jwtManager;
    
    beforeEach(() => {
        jwtManager = new JWTManager({
            secret: 'test-secret',
            expiresIn: '1h'
        });
    });
    
    test('should generate valid token', () => {
        const payload = { userId: 1, role: 'user' };
        const token = jwtManager.generateToken(payload);
        
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
    });
    
    test('should verify valid token', () => {
        const payload = { userId: 1, role: 'user' };
        const token = jwtManager.generateToken(payload);
        const result = jwtManager.verifyToken(token);
        
        expect(result.valid).toBe(true);
        expect(result.decoded.userId).toBe(1);
        expect(result.decoded.role).toBe('user');
    });
    
    test('should reject invalid token', () => {
        const result = jwtManager.verifyToken('invalid-token');
        
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
    });
});
```

## 환경변수 설정

```bash
# .env
JWT_SECRET=your-super-secret-key-min-32-chars-recommended
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=HS256
JWT_ISSUER=my-app
JWT_AUDIENCE=web-app
```

## 보안 체크리스트

- [ ] 프로덕션에서 강력한 시크릿 키 사용 (최소 32자)
- [ ] HTTPS 환경에서만 토큰 전송
- [ ] Refresh Token은 HttpOnly 쿠키에 저장
- [ ] 토큰 만료 시간 적절히 설정 (Access: 15분-1시간)
- [ ] 로그아웃 시 토큰 블랙리스트 처리
- [ ] XSS 공격 방지를 위해 localStorage 대신 쿠키 사용 고려
- [ ] CORS 설정 확인