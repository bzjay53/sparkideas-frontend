# IdeaSpark v2.0 - AI 기반 갈증포인트 분석 플랫폼

## 🚀 완전 구현 기능

### Epic 1-3, 5 (기존 완료)
- ✅ 갈증포인트 발굴 시스템
- ✅ AI 기반 비즈니스 아이디어 생성
- ✅ 시장 검증 및 분석

### Epic 4: PRD 자동 생성 시스템
- ✅ Mermaid 다이어그램 자동 생성 (Flowchart, ERD, Architecture)
- ✅ 4가지 PRD 템플릿 (Standard, SaaS, Mobile, Enterprise)
- ✅ PDF/Markdown/HTML 멀티포맷 익스포트
- ✅ 반응형 PRD 뷰어

### Epic 6: 커뮤니티 플랫폼
- ✅ 게시판 시스템 (CRUD, 카테고리, 태그, 좋아요, 북마크)
- ✅ 실시간 댓글 시스템 (계층구조, WebSocket)
- ✅ 알림 시스템 (실시간 업데이트)
- ✅ 프로젝트 매칭 플랫폼
- ✅ 성공 사례 큐레이션

## 🏗️ 기술 스택

### Frontend
- **Next.js 15** + TypeScript
- **Tailwind CSS** 반응형 디자인
- **Linear Design System** UI 컴포넌트
- **Mermaid.js** 다이어그램 렌더링
- **WebSocket** 실시간 통신

### Backend
- **FastAPI** + Python 비동기 서버
- **Jinja2** 템플릿 엔진
- **ReportLab** PDF 생성
- **AI Services** (OpenAI 통합)
- **Data Collectors** (네이버, Reddit, 대안 소스)

## 📱 반응형 페이지
- `/` - 메인 랜딩페이지
- `/dashboard` - 실시간 대시보드
- `/prd` - PRD 생성 및 관리
- `/community` - 커뮤니티 게시판
- `/matching` - 프로젝트 매칭
- `/success-stories` - 성공 사례

## 🔗 배포 URL
https://sparkideas-app.vercel.app

---

**배포 날짜**: 2025-08-17  
**버전**: v2.0 Complete Implementation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
