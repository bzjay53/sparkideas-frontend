# 📦 Shared Modules 점진적 개발 계획
**시작일**: 2025-08-09
**방식**: Bottom-up (실제 필요 → 개발 → 검증 → 공유)

## 🎯 우선순위 모듈 (실용성 기준)

### Phase 1: 즉시 필요 (이번 주)
1. **✅ auth/jwt** - 완성됨
2. **⏳ database/sqlite-connector** - 모든 프로젝트 필수
3. **⏳ utils/logger** - 디버깅 필수
4. **⏳ utils/validators** - 입력 검증

### Phase 2: 자주 필요 (다음 주)
5. **⏳ api-clients/openai-client** - AI 통합
6. **⏳ database/postgres-connector** - 프로덕션 DB
7. **⏳ utils/error-handler** - 에러 처리

### Phase 3: 점진적 추가 (이번 달)
8. **⏳ ui-components/data-table** - 데이터 표시
9. **⏳ auth/oauth** - 소셜 로그인
10. **⏳ api-clients/stripe-client** - 결제

## 📝 개발 프로세스

### 1. 실제 프로젝트에서 필요 발생
```bash
# 예: IdeaSpark에서 SQLite 필요
cd /root/dev/IdeaSpark
# SQLite 연결 코드 작성
```

### 2. 프로젝트에서 먼저 구현 & 테스트
```bash
# 실제 동작 확인
npm test
# Mock 패턴 검사
grep -r "mock" src/database/
```

### 3. 모듈로 추출 & 일반화
```bash
# 프로젝트 특화 코드 제거
# 설정 가능하도록 수정
# 문서화 추가
```

### 4. shared-modules로 이동
```bash
cp -r src/database/sqlite shared-modules/database/sqlite-connector
```

### 5. 다른 프로젝트에서 테스트
```bash
/root/dev/scripts/install-shared-module.sh TestProject sqlite-connector
```

## 🏗️ 다음 모듈: sqlite-connector

### 필요 이유
- Vibe-Kanban: SQLite 사용 중
- IdeaSpark: 로컬 캐시 필요
- 모든 프로젝트: 개발 DB로 활용

### 구현 계획
```javascript
// shared-modules/database/sqlite-connector/index.js
class SQLiteConnector {
  constructor(config) {
    this.dbPath = config.path || './data.db';
    this.options = config.options || {};
  }
  
  async connect() { /* 실제 연결 */ }
  async query(sql, params) { /* 실제 쿼리 */ }
  async close() { /* 연결 종료 */ }
}
```

### 품질 기준
- [ ] Mock 0%
- [ ] 에러 처리 완벽
- [ ] 타입 정의 포함
- [ ] 예제 3개 이상
- [ ] 테스트 커버리지 90%

## 📊 진행 상황 추적

| 모듈 | 상태 | 구현률 | 테스트 | 문서화 | 프로젝트 사용 |
|-----|------|--------|--------|--------|--------------|
| auth/jwt | ✅ | 100% | ✅ | ✅ | 0 |
| database/sqlite-connector | 🚧 | 0% | ⏳ | ⏳ | 0 |
| utils/logger | ⏳ | 0% | ⏳ | ⏳ | 0 |
| utils/validators | ⏳ | 0% | ⏳ | ⏳ | 0 |

## 🎯 성공 지표
- 실제 사용되는 모듈만 개발
- 각 모듈 최소 2개 프로젝트에서 사용
- Mock 패턴 0%
- 문서화 100%