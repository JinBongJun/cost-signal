# 출시 전 최종 체크리스트

> **목표**: 실제 사용자에게 서비스를 제공할 수 있는 상태 확인

---

## ✅ 완료된 항목

### 1. 핵심 기능
- [x] **인증 시스템** ✅
  - 이메일/비밀번호 로그인/회원가입
  - Google OAuth 로그인/회원가입
  - 비밀번호 재설정
  - 이메일 변경 (일반 계정만)
  - 이름 변경
  - Account 삭제

- [x] **데이터 수집 및 신호 계산** ✅
  - EIA (Gas Prices)
  - BLS (CPI)
  - FRED (Interest Rates, Unemployment)
  - 주간 신호 계산 로직
  - OpenAI 설명 생성

- [x] **결제 시스템** ✅
  - Paddle 통합
  - Webhook 처리
  - 구독 관리 (생성, 업데이트, 취소)

- [x] **푸시 알림** ✅
  - VAPID 키 설정
  - 주간 알림 발송

- [x] **PWA 지원** ✅
  - Service Worker
  - Manifest
  - 오프라인 지원

### 2. 인프라 및 설정
- [x] **도메인 설정** ✅
  - `cost-signal.com` 구매 및 연결
  - Vercel 도메인 연결
  - SSL 인증서
  - Cloudflare DNS 설정
  - Resend 도메인 인증

- [x] **환경 변수 검증** ✅
  - `lib/env.ts` 구현
  - `validateRequiredEnv()` 함수
  - 앱 시작 시 검증

- [x] **에러 처리** ✅
  - `app/error.tsx` (클라이언트 에러)
  - `app/global-error.tsx` (글로벌 에러)
  - `app/not-found.tsx` (404 페이지)
  - Sentry 통합

- [x] **법적 준비** ✅
  - Privacy Policy (`/privacy`)
  - Terms of Service (`/terms`)

- [x] **Vercel Cron 설정** ✅
  - `vercel.json` 설정
  - 주간 자동 업데이트 (매주 월요일 13:00 UTC)

---

## ⚠️ 확인 필요한 항목

### 1. 환경 변수 설정 (Vercel)
다음 환경 변수들이 Vercel에 모두 설정되어 있는지 확인:

**필수 환경 변수**:
```
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL (https://cost-signal.com)
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ OPENAI_API_KEY
✅ EIA_API_KEY
✅ FRED_API_KEY
✅ BLS_API_KEY (선택, 권장)
✅ PADDLE_API_KEY
✅ PADDLE_WEBHOOK_SECRET
✅ RESEND_API_KEY
✅ RESEND_FROM_EMAIL (noreply@cost-signal.com)
✅ VAPID_PUBLIC_KEY
✅ VAPID_PRIVATE_KEY
✅ VAPID_EMAIL
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET
✅ ADMIN_EMAIL (피드백 수신용)
```

**선택 환경 변수**:
```
CRON_SECRET (수동 호출용)
SENTRY_DSN (에러 모니터링)
SENTRY_ORG
SENTRY_PROJECT
```

### 2. Paddle 설정 확인
- [ ] **Paddle 계정 검증**
  - Paddle 계정 활성화 확인
  - 결제 수신 가능 상태 확인

- [ ] **Products 생성 확인**
  - Monthly Plan 생성 및 Price ID 확인
  - Yearly Plan 생성 및 Price ID 확인
  - Early Bird Plan 생성 및 Price ID 확인 (선택)
  - `PADDLE_PRICE_ID_MONTHLY` 환경 변수 설정
  - `PADDLE_PRICE_ID_YEARLY` 환경 변수 설정
  - `PADDLE_PRICE_ID_EARLY_BIRD` 환경 변수 설정 (선택)

- [ ] **Webhook 설정 확인**
  - Webhook URL: `https://cost-signal.com/api/paddle/webhook`
  - Webhook Secret 확인 (`PADDLE_WEBHOOK_SECRET`)
  - 테스트 Webhook 발송 확인

- [ ] **테스트 결제 진행**
  - Paddle 테스트 모드에서 결제 테스트
  - 구독 생성 확인
  - Webhook 수신 확인
  - 구독 상태 업데이트 확인

### 3. Sentry 설정 확인
- [ ] **Sentry 프로젝트 생성**
  - Sentry 계정 생성/로그인
  - 프로젝트 생성
  - DSN 확인

- [ ] **환경 변수 설정**
  - `SENTRY_DSN` 설정
  - `SENTRY_ORG` 설정 (선택)
  - `SENTRY_PROJECT` 설정 (선택)

- [ ] **에러 추적 테스트**
  - 테스트 에러 발생
  - Sentry 대시보드에서 확인

### 4. Google OAuth 설정 확인
- [ ] **Google Cloud Console**
  - OAuth 2.0 Client ID 확인
  - Authorized JavaScript origins: `https://cost-signal.com`
  - Authorized redirect URIs: `https://cost-signal.com/api/auth/callback/google`
  - `GOOGLE_CLIENT_ID` 환경 변수 확인
  - `GOOGLE_CLIENT_SECRET` 환경 변수 확인

### 5. 기능 테스트
- [ ] **인증 플로우**
  - [ ] 이메일/비밀번호 회원가입
  - [ ] 이메일/비밀번호 로그인
  - [ ] Google 로그인/회원가입
  - [ ] 비밀번호 재설정
  - [ ] 이메일 변경 (일반 계정)
  - [ ] 이름 변경
  - [ ] Account 삭제

- [ ] **신호 데이터**
  - [ ] 홈페이지에서 신호 표시 확인
  - [ ] Free 티어: 신호 + 설명 확인
  - [ ] Paid 티어: 신호 + 설명 + 지표 상세 확인
  - [ ] 히스토리 조회 확인

- [ ] **결제 플로우**
  - [ ] Pricing 페이지 접근
  - [ ] 구독 플랜 선택
  - [ ] Paddle 결제 페이지 이동
  - [ ] 테스트 결제 완료
  - [ ] 구독 활성화 확인
  - [ ] Paid 티어 데이터 접근 확인
  - [ ] 구독 취소 확인

- [ ] **푸시 알림**
  - [ ] 푸시 알림 권한 요청
  - [ ] 알림 구독 확인
  - [ ] 알림 수신 테스트 (수동 발송)

- [ ] **기타 기능**
  - [ ] 피드백 제출
  - [ ] FAQ 페이지
  - [ ] Privacy Policy 페이지
  - [ ] Terms of Service 페이지

### 6. 보안 확인
- [ ] **HTTPS 연결**
  - 모든 페이지 HTTPS 확인
  - Mixed Content 없음 확인

- [ ] **환경 변수 노출**
  - 클라이언트 코드에 환경 변수 노출 없음 확인
  - `.env` 파일 gitignore 확인

- [ ] **API 보안**
  - 인증 필요한 API 엔드포인트 보호 확인
  - Rate limiting 적용 확인 (선택)

- [ ] **RLS (Row Level Security)**
  - Supabase RLS 활성화 확인
  - 사용자 데이터 격리 확인

### 7. 성능 확인
- [ ] **페이지 로딩 속도**
  - 홈페이지 로딩 시간 확인
  - Lighthouse 성능 점수 확인 (목표: 90+)

- [ ] **API 응답 시간**
  - `/api/signal` 응답 시간 확인
  - `/api/cron` 실행 시간 확인

- [ ] **데이터베이스 쿼리**
  - 쿼리 최적화 확인
  - 인덱스 설정 확인

### 8. 모니터링 확인
- [ ] **Vercel 대시보드**
  - 배포 상태 확인
  - 로그 확인
  - 에러 확인

- [ ] **Sentry 대시보드**
  - 에러 추적 확인
  - 알림 설정 확인

- [ ] **Supabase 대시보드**
  - 데이터베이스 상태 확인
  - 쿼리 성능 확인

---

## 🚨 출시 전 필수 확인 사항

### 최소 필수 항목 (즉시 확인)
1. ✅ **환경 변수 모두 설정** - Vercel에서 확인
2. ⚠️ **Paddle Products 생성 및 테스트** - 결제 플로우 테스트
3. ⚠️ **Google OAuth 설정 확인** - 로그인 테스트
4. ⚠️ **기능 테스트** - 모든 주요 기능 동작 확인
5. ⚠️ **Sentry 설정** (선택, 권장) - 에러 모니터링

### 권장 항목 (출시 후에도 가능)
- Rate Limiting 추가
- 에러 메시지 표준화
- 로깅 개선
- 성능 최적화

---

## 📋 체크리스트 요약

### 즉시 확인해야 할 것
- [x] Vercel 환경 변수 모두 설정 확인 ✅ **완료**
- [ ] Paddle Products 생성 및 테스트 결제 ⚠️ **진행 필요**
- [x] Google OAuth 설정 확인 ✅ **완료**
- [ ] 전체 기능 테스트 (인증, 결제, 신호 데이터) ⚠️ **진행 필요**
- [ ] Sentry 설정 (선택, 권장) ⚠️ **선택사항**

### 출시 후 개선 가능
- [ ] Rate Limiting 추가
- [ ] 에러 메시지 표준화
- [ ] 로깅 개선
- [ ] 성능 최적화

---

## ✅ 결론

**현재 상태**: 대부분의 기능과 인프라가 준비되어 있습니다.

**출시 전 최종 확인**:
1. 환경 변수 설정 확인 (Vercel)
2. Paddle 설정 및 테스트 결제
3. Google OAuth 설정 확인
4. 전체 기능 테스트
5. Sentry 설정 (선택)

이 5가지만 확인하면 **출시 준비 완료**입니다!

---

## 🔗 참고 문서

- `PRODUCTION_CHECKLIST.md` - 상세 프로덕션 체크리스트
- `ACCOUNT_FLOWS.md` - 계정 관련 모든 플로우
- `SETUP.md` - 초기 설정 가이드
- `TROUBLESHOOTING.md` - 문제 해결 가이드

