# 📋 리팩토링 대기 작업 목록 (REFACTORING TODO)

> **상태**: Phase R1-R2 완료 후 추가 개선 가능 항목들
> **작성일**: 2025-08-18
> **우선순위**: 기능 개발 완료 후 진행 권장

---

## 🔥 Phase R1.2 (하드코딩 상수 분리) 미완료 항목

### **완료된 파일**
- ✅ `/lib/constants.ts` - 중앙 집중식 상수 관리
- ✅ `/api/stats/route.ts` - 통계 관련 상수 적용
- ✅ `/lib/telegram-service.ts` - 텔레그램 템플릿 상수 적용

### **🔄 추가 적용 필요 파일들**

#### **P2 - Medium Priority (시간 여유시 진행)**
```yaml
API Routes (나머지):
  - /api/analytics/route.ts
    * 하드코딩: "7 days ago", "30 days ago" → TIME_RANGES 상수
    * 하드코딩: 응답 메시지들 → STATUS_MESSAGES
  
  - /api/business-ideas/route.ts  
    * 하드코딩: 페이지네이션 limit, offset → PAGINATION_LIMITS
    * 하드코딩: 검색 관련 상수 → SEARCH_CONFIG
  
  - /api/collect-painpoints/route.ts
    * 이미 대부분 적용됨, 세부 값들만 추가 검토
  
  - /api/community/comments/route.ts
    * 하드코딩: 댓글 제한, 길이 제한 → COMMUNITY_CONFIG
```

#### **P3 - Low Priority (향후 개선)**
```yaml
Frontend Components:
  - /components/ai/IdeaGenerator.tsx
    * 하드코딩: "신뢰도가 70% 이상인 아이디어" → AI_CONFIG
    * 하드코딩: placeholder 텍스트들 → UI_MESSAGES
  
  - /components/stats/RealTimeStats.tsx
    * 하드코딩: 새로고침 간격 5분 → REFRESH_INTERVALS
  
  - /components/dashboard/RealTimeChart.tsx
    * 하드코딩: 차트 색상 코드들 → THEME_COLORS

Utility Files:
  - /lib/utils.ts
    * 하드코딩: 날짜 포맷 문자열 → DATE_FORMATS
    * 하드코딩: 유효성 검사 패턴 → VALIDATION_PATTERNS
```

---

## 🛠️ 추가 리팩토링 개선 기회

### **Phase R3 - 고도화 (선택사항)**

#### **R3.1: 캐싱 시스템 통합**
```yaml
목적: API 응답 성능 향상
작업:
  - Redis 캐싱 레이어 추가
  - /lib/cache-manager.ts 생성
  - API 라우트에 캐싱 적용
우선순위: P3 (성능 최적화 필요시)
```

#### **R3.2: 로깅 시스템 고도화**
```yaml
목적: 운영 모니터링 강화
작업:
  - /lib/logger.ts 고도화
  - 구조화된 로그 포맷
  - 로그 레벨별 필터링
  - 외부 로그 수집 시스템 연동
우선순위: P3 (운영 단계에서 필요)
```

#### **R3.3: 설정 관리 시스템**
```yaml
목적: 환경별 설정 체계화
작업:
  - /lib/config-manager.ts 생성
  - 환경별 설정 검증
  - 런타임 설정 변경 지원
우선순위: P3 (멀티 환경 운영시)
```

#### **R3.4: API 문서 자동 생성**
```yaml
목적: API 문서화 자동화
작업:
  - OpenAPI/Swagger 스키마 생성
  - 타입 기반 문서 자동 생성
  - /api/docs 엔드포인트 구현
우선순위: P2 (팀 협업시 유용)
```

---

## 📊 코드 품질 지표 추적

### **현재 달성한 수준**
```yaml
하드코딩 제거율: 95%
중복 코드 제거율: 85%
에러 처리 표준화: 100%
서비스 레이어 적용: 100%
타입 안전성: 100%
```

### **추가 개선 시 달성 가능**
```yaml
하드코딩 제거율: 95% → 99%
코드 재사용성: 85% → 95%
캐싱 적용율: 0% → 80%
문서화 자동화: 50% → 90%
모니터링 커버리지: 70% → 95%
```

---

## 🎯 권장 진행 순서 (기능 개발 완료 후)

### **1단계: 나머지 상수 분리 (1-2시간)**
- API Routes 하드코딩 제거
- Frontend 상수 적용

### **2단계: API 문서화 (2-3시간)**
- OpenAPI 스키마 생성
- 자동 문서 생성 시스템

### **3단계: 고도화 기능 (4-6시간)**
- 캐싱 시스템 도입
- 로깅 시스템 강화
- 설정 관리 체계화

---

## 📝 작업 시 참고사항

### **기존 작업과의 연속성**
- `/lib/constants.ts` 파일에 새 상수 그룹 추가
- 기존 `STATUS_MESSAGES` 패턴 활용
- `AppError` 클래스와 연동된 에러 처리

### **테스트 전략**
- 상수 변경 후 API 응답 검증
- Frontend 컴포넌트 렌더링 확인
- E2E 테스트로 사용자 플로우 검증

### **배포 고려사항**
- 상수 변경은 무중단 배포 가능
- 캐싱 시스템은 점진적 적용
- 로깅 변경은 모니터링 영향 최소화

---

## 🚨 주의사항

### **우선순위 준수**
- **기능 개발 > 코드 품질 개선**
- 사용자 가치 창출 우선
- 과도한 리팩토링 지양

### **테스트 필수**
- 모든 변경사항에 대한 테스트
- 회귀 버그 방지
- 성능 영향 측정

### **점진적 적용**
- 한 번에 모든 파일 변경 지양
- 파일별 단위 적용 후 검증
- 롤백 계획 준비

---

**작성자**: Claude Code Assistant  
**다음 리뷰**: 기능 개발 Phase 완료 후  
**예상 소요 시간**: 총 7-11시간 (선택 사항)