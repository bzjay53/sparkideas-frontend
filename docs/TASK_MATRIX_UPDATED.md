# 📋 IdeaSpark v2.0 - Vercel 최적화 Task 매트릭스

> **업데이트**: 2025-08-16 (Vercel 최적화 반영)
> **총 Epic**: 6개 | **총 Task**: 84개 | **총 SubTask**: 252개

---

## 🎯 Epic 1: Vercel 완전 최적화 프로젝트 기반 구축 (4주)

### **담당자**: DevOps + Backend + Frontend + QA
### **우선순위**: P0 (Blocker)
### **상태**: 🔴 대기 중

| Task ID | Task명 | 담당자 | SubTask 수 | 상태 | 진행률 | 예상 시간 | 완료일 |
|---------|--------|--------|------------|------|--------|-----------|--------|
| 1.1 | **Next.js 15 Vercel 최적화 프로젝트 초기화** | Frontend + DevOps | 3 | 🔴 대기 | 0% | 6시간 | - |
| 1.2 | **UI_COMPONENT_ARCHIVE → Tailwind CSS 완전 변환** | Frontend | 4 | 🔴 대기 | 0% | 12시간 | - |
| 1.3 | **Supabase 완전 연동 및 스키마 설계** | Backend + Database | 3 | 🔴 대기 | 0% | 10시간 | - |
| 1.4 | **Vercel 자동 배포 + ISR + Edge Functions** | DevOps | 4 | 🔴 대기 | 0% | 8시간 | - |
| 1.5 | **FastAPI + Vercel Serverless 하이브리드** | Backend | 3 | 🔴 대기 | 0% | 8시간 | - |
| 1.6 | **환경변수 + API 키 보안 관리** | Security + DevOps | 3 | 🔴 대기 | 0% | 4시간 | - |
| 1.7 | **TypeScript + 경로 별칭 완전 설정** | Frontend | 3 | 🔴 대기 | 0% | 4시간 | - |
| 1.8 | **Vercel 성능 최적화 (Core Web Vitals)** | Frontend + DevOps | 4 | 🔴 대기 | 0% | 6시간 | - |
| 1.9 | **SEO + 접근성 자동 설정** | Frontend | 3 | 🔴 대기 | 0% | 4시간 | - |
| 1.10 | **모니터링 + 로깅 시스템** | DevOps | 3 | 🔴 대기 | 0% | 4시간 | - |

**Epic 1 총계**: 0/10 Tasks 완료 (0%) | 예상 시간: 66시간

---

## 📝 Task 1.2 세부 SubTask (UI_COMPONENT_ARCHIVE → Tailwind 변환)

### **SubTask 1.2.1: CSS Variables → Tailwind Config 변환** (4시간)
```yaml
작업 내용:
  - LinearButton.styles.css의 CSS 변수 분석
  - tailwind.config.js에 커스텀 테마 설정
  - var(--color-accent-primary) → theme.colors.accent.primary
  - var(--space-2) → theme.spacing.2
  - var(--radius-md) → theme.borderRadius.md

완료 기준:
  ✅ 모든 CSS 변수가 Tailwind config로 매핑
  ✅ 빌드 에러 0개
  ✅ 기존 디자인과 100% 동일한 결과
```

### **SubTask 1.2.2: CSS Classes → Tailwind Utilities 변환** (4시간)
```yaml
작업 내용:
  - .linear-btn--primary → bg-accent-primary text-white
  - .linear-btn--secondary → bg-background-tertiary text-text-primary
  - .linear-btn--outline → bg-transparent border border-border-primary
  - 모든 size, variant 클래스 변환

완료 기준:
  ✅ 모든 LinearButton 스타일이 Tailwind로 변환
  ✅ hover, focus, active 상태 정상 동작
  ✅ 반응형 디자인 유지
```

### **SubTask 1.2.3: DOM 조작 → useEffect SSR 호환** (2시간)
```yaml
작업 내용:
  - document.createElement → useEffect 훅으로 래핑
  - 클라이언트 사이드에서만 실행되도록 조건 처리
  - 리플 애니메이션 SSR 안전하게 구현

완료 기준:
  ✅ SSR/SSG 빌드 성공
  ✅ 하이드레이션 에러 0개
  ✅ 애니메이션 정상 동작
```

### **SubTask 1.2.4: 모든 컴포넌트 변환 완료** (2시간)
```yaml
작업 내용:
  - LinearCard, LinearInput, LinearNavbar 등 모든 컴포넌트
  - 컴포넌트 간 일관성 유지
  - index.ts export 정리

완료 기준:
  ✅ 모든 UI_COMPONENT_ARCHIVE 컴포넌트 변환 완료
  ✅ TypeScript 에러 0개
  ✅ Storybook 정상 동작 (선택사항)
```

---

## 📝 Task 1.4 세부 SubTask (Vercel 배포 최적화)

### **SubTask 1.4.1: ISR + SSG 설정** (2시간)
```yaml
작업 내용:
  - 홈페이지: generateStaticParams로 SSG
  - 커뮤니티: ISR로 revalidate 설정
  - 분석 페이지: dynamic route ISR

완료 기준:
  ✅ 페이지별 최적화된 렌더링 방식 적용
  ✅ Core Web Vitals 85+ 달성
  ✅ Vercel Analytics 데이터 정상 수집
```

### **SubTask 1.4.2: Edge Functions 설정** (2시간)
```yaml
작업 내용:
  - API Routes를 Edge Runtime으로 최적화
  - 경량 API 함수 Edge로 이동
  - 지역별 성능 최적화

완료 기준:
  ✅ 응답 시간 50% 개선
  ✅ Cold Start 문제 해결
  ✅ 글로벌 성능 일관성 확보
```

### **SubTask 1.4.3: 자동 이미지 + 폰트 최적화** (2시간)
```yaml
작업 내용:
  - next/image 컴포넌트 적용
  - next/font Google Fonts 최적화
  - WebP/AVIF 자동 변환 설정

완료 기준:
  ✅ 이미지 로딩 속도 70% 개선
  ✅ 폰트 Flash 현상 제거
  ✅ 누적 레이아웃 이동(CLS) 0.1 미만
```

### **SubTask 1.4.4: 번들 최적화 + 코드 스플리팅** (2시간)
```yaml
작업 내용:
  - Dynamic import로 페이지별 코드 분할
  - Tree shaking 최적화
  - 번들 분석기 설정

완료 기준:
  ✅ 초기 로딩 번들 크기 50% 감소
  ✅ 페이지별 필요한 코드만 로딩
  ✅ 성능 점수 90+ 달성
```

---

## 🔧 Vercel 최적화 체크리스트

### **필수 완료 사항**
```yaml
성능 최적화:
  ✅ Lighthouse Score 90+ (Performance, Accessibility, SEO)
  ✅ Core Web Vitals 기준 충족:
    - LCP (Largest Contentful Paint): < 2.5초
    - FID (First Input Delay): < 100ms
    - CLS (Cumulative Layout Shift): < 0.1
  ✅ 페이지 로드 시간: < 2초
  ✅ 번들 크기: 초기 로딩 < 200KB

SEO 최적화:
  ✅ 메타 태그 완전 설정
  ✅ Open Graph 이미지 최적화
  ✅ JSON-LD 구조화 데이터
  ✅ 사이트맵 자동 생성
  ✅ robots.txt 최적화

접근성:
  ✅ ARIA 라벨 적용
  ✅ 키보드 네비게이션
  ✅ 색상 대비 4.5:1 이상
  ✅ 스크린 리더 지원

Vercel 특화:
  ✅ Edge Functions 활용
  ✅ ISR/SSG 최적화
  ✅ 자동 이미지 최적화
  ✅ Vercel Analytics 연동
```

---

## 📋 경로 생성 단계별 가이드

### **1단계: 디렉토리 구조 생성**
```bash
# 프로젝트 기본 구조
mkdir -p /root/dev/web-services/IdeaSpark/{frontend,backend,docs}
mkdir -p /root/dev/web-services/IdeaSpark/docs/{tasks,epics,tracking,checklists}

# Frontend 세부 구조
mkdir -p /root/dev/web-services/IdeaSpark/frontend/src/{components,lib,hooks,types,styles}
mkdir -p /root/dev/web-services/IdeaSpark/frontend/src/components/{ui,modules}
```

### **2단계: Next.js 15 프로젝트 초기화**
```bash
cd /root/dev/web-services/IdeaSpark/frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --yes
```

### **3단계: UI_COMPONENT_ARCHIVE 변환 준비**
```bash
# 원본 컴포넌트 분석용 복사
cp -r /root/dev/UI_COMPONENT_ARCHIVE/components ./src/components/original
# 변환된 컴포넌트 저장 위치
mkdir -p ./src/components/ui/{atoms,molecules,organisms}
```

### **4단계: Tailwind 설정 최적화**
```javascript
// tailwind.config.js에 UI_COMPONENT_ARCHIVE 테마 변환
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: '#3b82f6',
          hover: '#2563eb',
        },
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },
        // ... 모든 CSS 변수 매핑
      }
    }
  }
}
```

---

## 🚀 즉시 실행 계획 (수정된 버전)

### **현재 세션 목표** (다음 2시간)
1. **Task 1.1**: Next.js 15 프로젝트 올바른 초기화 (30분)
2. **Task 1.2.1**: CSS Variables → Tailwind Config 변환 (60분)
3. **Task 1.2.2**: LinearButton Tailwind 변환 시작 (30분)

### **다음 세션 연속성 보장**
```yaml
완료 후 업데이트할 문서:
  - docs/PROJECT_STATUS.md: Task 1.1, 1.2.1 완료 상태로 변경
  - docs/TASK_MATRIX_UPDATED.md: 진행률 업데이트
  - docs/tracking/DAILY_LOG.md: 당일 작업 내용 기록

다음 세션 시작점:
  - Task 1.2.2부터 계속 진행
  - 변환된 LinearButton 컴포넌트 테스트
  - 나머지 컴포넌트 변환 계획
```

---

**최종 업데이트**: 2025-08-16 16:00 KST
**Vercel 최적화**: ✅ 완전 반영
**UI_COMPONENT_ARCHIVE**: ✅ Tailwind 변환 전략 확정
**세션 연속성**: ✅ 보장