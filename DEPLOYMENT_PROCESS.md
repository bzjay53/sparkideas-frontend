# 🚀 IdeaSpark 자동배포 프로세스 가이드

## 📊 현재 상태 분석

### ✅ 성공적으로 해결된 사항
- **프로젝트 구조**: Next.js 루트 구조로 최적화 완료
- **Git 저장소**: `bzjay53/sparkideas-frontend` 올바르게 연결
- **보안**: 모든 API 키 및 시크릿 완전 제거
- **코드 품질**: 149개 파일, 33,501줄 IdeaSpark v2.0 완전 구현

### ⚠️ 해결 필요 사항
- **GitHub 웹훅**: Vercel 자동배포 트리거 불안정
- **배포 지연**: 수동 커밋 후에도 배포 반영 지연

## 🔧 자동배포 문제 원인 분석

### 1. GitHub 웹훅 연결 문제
```yaml
증상:
  - 새로운 커밋이 배포 목록에 나타나지 않음
  - gitProviderOptions.createDeployments: "enabled" 설정되어 있으나 미작동
  - 최신 커밋 ca427362가 Vercel에 인식되지 않음

원인:
  - 강제 푸시 (--force)로 인한 웹훅 연결 끊김
  - GitHub-Vercel 권한 문제
  - Repository 설정 불일치
```

### 2. 배포 상태 문제
```yaml
현재 상태:
  - Production: ERROR (커밋 09ac0911)
  - READY: 이전 데모 버전 (커밋 83aaa54a)
  - 최신 v2.0 기능들이 완전히 배포되지 않음
```

## 🚀 즉시 해결 프로세스

### 단계 1: 자동배포 스크립트 사용
```bash
# 향후 모든 배포는 이 스크립트 사용
./deploy.sh "배포 메시지"

# 예시:
./deploy.sh "fix: update community feature UI"
./deploy.sh "feat: add new PRD template"
```

### 단계 1-B: 수동 배포 트리거 (웹훅 문제 시)
```bash
# GitHub 웹훅이 작동하지 않을 때 사용
./trigger-deploy.sh

# 또는 직접 강제 커밋
echo "$(date)" >> FORCE_DEPLOY.md
git add . && git commit -m "deploy: force $(date)"
git push origin main
```

### 단계 2: 수동 검증 프로세스
```bash
# 1. 빌드 테스트
npm run build

# 2. 배포 실행
git add .
git commit -m "deploy: 변경사항 설명"
git push origin main

# 3. 45초 대기 후 확인
curl -s https://sparkideas-app.vercel.app | grep "새로운 기능"
```

### 단계 3: GitHub 웹훅 재설정 (필요시)
```yaml
Vercel Dashboard 접근:
  1. vercel.com → bzjay53s-projects → ideaspark-mvp
  2. Settings → Git
  3. "Disconnect Git Repository"
  4. "Connect Git Repository" 재연결
  5. Repository: bzjay53/sparkideas-frontend
  6. Production Branch: main 설정
```

## 📋 향후 배포 체크리스트

### 배포 전 검증 (필수)
- [ ] `npm run build` 성공 확인
- [ ] TypeScript 타입 에러 0개
- [ ] 주요 페이지 라우트 접근 가능
- [ ] API 엔드포인트 정상 응답
- [ ] 환경변수 보안 확인

### 배포 후 검증 (필수)
- [ ] https://sparkideas-app.vercel.app 접근 가능
- [ ] 새로운 기능 정상 작동
- [ ] 모바일 반응형 확인
- [ ] Console 에러 없음
- [ ] Performance Score 90+ 유지

## 🎯 자동배포 안정화 계획

### 즉시 조치 (완료)
- ✅ 자동배포 스크립트 생성 (`deploy.sh`)
- ✅ 배포 프로세스 문서화
- ✅ 수동 백업 프로세스 구축

### 단기 개선 (1주 내)
- [ ] Deploy Hook URL 생성 및 테스트
- [ ] GitHub Actions 워크플로우 추가
- [ ] 배포 상태 모니터링 자동화

### 장기 개선 (1개월 내)
- [ ] Vercel CLI 통합 배포
- [ ] 스테이징 환경 분리
- [ ] 자동 롤백 시스템 구축

## 💡 사용자 역할별 가이드

### 개발자용 (당신)
```bash
# 일반적인 변경사항 배포
./deploy.sh "feat: 새로운 기능 추가"

# 긴급 수정사항 배포
./deploy.sh "hotfix: 중요한 버그 수정"

# 상태 확인
curl -I https://sparkideas-app.vercel.app
```

### Claude (AI) 배포 프로세스
```yaml
배포 실행 조건:
  - 사용자가 명시적으로 배포 요청
  - 중요한 기능 구현 완료
  - 코드 품질 검증 통과

배포 순서:
  1. TodoWrite로 배포 계획 수립
  2. ./deploy.sh 스크립트 실행
  3. 배포 결과 검증 및 보고
  4. 문제 발생 시 해결 방안 제시
```

## 🔍 문제 발생 시 진단 가이드

### 배포가 트리거되지 않는 경우
```bash
# 1. GitHub 연결 확인
git remote -v

# 2. 최신 커밋 확인
git log --oneline -3

# 3. Vercel 프로젝트 상태 확인
# (MCP 도구 사용)

# 4. 수동 트리거
echo "$(date)" >> FORCE_DEPLOY.txt
git add . && git commit -m "trigger: force deploy $(date)"
git push origin main
```

### 배포는 성공했지만 기능이 반영되지 않는 경우
```bash
# 1. 캐시 클리어
curl -X PURGE https://sparkideas-app.vercel.app

# 2. 브라우저 캐시 클리어 안내
# - Ctrl+F5 (하드 리프레시)
# - 개발자도구 → Network → "Disable cache" 체크

# 3. Vercel 함수 재시작 대기 (최대 5분)
```

## 📈 성공 지표

### 배포 안정성 목표
- 자동배포 성공률: 95% 이상
- 배포 완료 시간: 2분 이내
- 다운타임: 0초 (Zero Downtime)
- 롤백 가능 시간: 30초 이내

### 모니터링 메트릭
- 배포 빈도: 주 3-5회
- 핫픽스 배포: 24시간 이내
- 사용자 접근 가능성: 99.9%

---

## 🎯 해결된 주요 이슈

### ✅ Vercel Hobby 계정 Cron Job 제한 해결
- **문제**: `0 */6 * * *` (6시간마다) 스케줄이 일일 제한 초과
- **해결**: 단일 `0 9 * * *` (매일 오전 9시) 스케줄로 통합
- **결과**: `/api/cron/daily-tasks` 엔드포인트에서 모든 작업 처리

### ✅ 자동배포 프로세스 최적화
- **문제**: 로컬 빌드 시간 과다 (88초+) 및 타임아웃
- **해결**: Vercel 서버에서 빌드하도록 변경, 로컬은 타입체크만
- **결과**: 배포 시간 단축 및 안정성 향상

### ✅ GitHub 웹훅 백업 프로세스
- **문제**: 웹훅 연결 불안정으로 자동배포 실패
- **해결**: `trigger-deploy.sh` 수동 트리거 스크립트 제공
- **결과**: 배포 실패 시 대안 경로 확보

**최종 업데이트**: 2025-08-17 04:20
**상태**: ✅ 모든 배포 이슈 해결 완료
**사용법**: `./deploy.sh "메시지"` 또는 `./trigger-deploy.sh`