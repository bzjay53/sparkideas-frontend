# 🧩 공통 모듈 시스템 (Shared Modules)

## 개요
모든 프로젝트에서 재사용 가능한 검증된 모듈들의 중앙 저장소입니다.

## 📁 디렉토리 구조

```
shared-modules/
├── auth/               # 인증/인가 모듈
│   ├── jwt/           # JWT 토큰 관리
│   ├── oauth/         # OAuth 2.0 통합
│   └── rbac/          # 역할 기반 접근 제어
│
├── database/          # 데이터베이스 유틸리티
│   ├── migrations/    # 마이그레이션 템플릿
│   ├── seeders/       # 시드 데이터 템플릿
│   └── connectors/    # DB 연결 관리자
│
├── ui-components/     # UI 컴포넌트 확장
│   ├── advanced/      # 고급 컴포넌트
│   ├── charts/        # 차트 컴포넌트
│   └── forms/         # 폼 컴포넌트
│
├── api-clients/       # 외부 API 클라이언트
│   ├── openai/        # OpenAI API
│   ├── stripe/        # Stripe 결제
│   └── aws/           # AWS 서비스
│
├── utils/             # 유틸리티 함수
│   ├── validators/    # 검증 함수
│   ├── formatters/    # 포맷터
│   └── helpers/       # 헬퍼 함수
│
└── config-templates/  # 설정 템플릿
    ├── docker/        # Docker 설정
    ├── ci-cd/         # CI/CD 파이프라인
    └── env/           # 환경변수 템플릿
```

## 🚀 사용법

### 1. 모듈 가져오기
```bash
# 프로젝트에서 필요한 모듈 복사
cp -r /root/dev/shared-modules/auth/jwt ./src/auth/

# 또는 심볼릭 링크 사용 (업데이트 자동 반영)
ln -s /root/dev/shared-modules/auth/jwt ./src/auth/jwt
```

### 2. 모듈 버전 관리
```bash
# 모듈 버전 확인
cat /root/dev/shared-modules/auth/jwt/version.json

# 특정 버전 사용
git checkout tags/v1.0.0 -- /root/dev/shared-modules/auth/jwt
```

### 3. 커스터마이징
```bash
# 모듈 복사 후 프로젝트별 수정
cp -r /root/dev/shared-modules/auth/jwt ./src/auth/
# 필요한 부분만 수정
```

## 📋 모듈 목록

### 🔐 인증 모듈 (auth/)
- **jwt**: JWT 토큰 생성/검증/갱신
- **oauth**: Google, GitHub, Facebook OAuth
- **rbac**: 역할 기반 권한 관리
- **2fa**: 2단계 인증
- **session**: 세션 관리

### 💾 데이터베이스 모듈 (database/)
- **postgres-connector**: PostgreSQL 연결 관리
- **mongodb-connector**: MongoDB 연결 관리
- **redis-cache**: Redis 캐싱 레이어
- **migration-runner**: 마이그레이션 실행기
- **query-builder**: 쿼리 빌더

### 🎨 UI 컴포넌트 (ui-components/)
- **data-table**: 고급 데이터 테이블
- **chart-library**: 차트 컴포넌트 모음
- **form-builder**: 동적 폼 생성기
- **file-uploader**: 파일 업로드 컴포넌트
- **notification**: 알림 시스템

### 🌐 API 클라이언트 (api-clients/)
- **openai-client**: GPT API 통합
- **stripe-client**: 결제 처리
- **aws-s3**: S3 파일 저장소
- **sendgrid**: 이메일 발송
- **twilio**: SMS 발송

### 🛠️ 유틸리티 (utils/)
- **validators**: 이메일, URL, 전화번호 검증
- **formatters**: 날짜, 통화, 숫자 포맷
- **crypto**: 암호화/복호화
- **logger**: 구조화된 로깅
- **error-handler**: 중앙 에러 처리

### ⚙️ 설정 템플릿 (config-templates/)
- **dockerfile-node**: Node.js Dockerfile
- **dockerfile-python**: Python Dockerfile
- **docker-compose**: 멀티 서비스 구성
- **github-actions**: CI/CD 워크플로우
- **nginx-config**: Nginx 설정

## 🔄 업데이트 정책

1. **주기적 업데이트**: 매주 금요일 보안 패치
2. **버전 관리**: Semantic Versioning (MAJOR.MINOR.PATCH)
3. **호환성 보장**: 메이저 버전 간 1년 지원
4. **자동 알림**: 업데이트 시 프로젝트에 알림

## 📚 문서화

각 모듈은 다음 문서를 포함합니다:
- `README.md`: 모듈 설명 및 사용법
- `API.md`: API 레퍼런스
- `EXAMPLES.md`: 사용 예제
- `CHANGELOG.md`: 변경 이력
- `version.json`: 버전 정보

## 🤝 기여 가이드

1. 새 모듈 추가 시 품질 기준:
   - 99% Mock-free 구현
   - 단위 테스트 90% 커버리지
   - TypeScript 타입 정의
   - 완전한 문서화

2. PR 체크리스트:
   - [ ] 품질 검증 통과
   - [ ] 테스트 작성
   - [ ] 문서 업데이트
   - [ ] 버전 업데이트

## 📞 지원

문제 발생 시:
1. 모듈별 이슈 트래커 확인
2. 공통 문제 해결 가이드 참조
3. 커뮤니티 포럼 질문

---
*최종 업데이트: 2025년 1월*