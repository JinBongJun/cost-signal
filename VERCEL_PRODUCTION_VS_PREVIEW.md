# Vercel 프로덕션 vs 프리뷰 URL 설명

## 🔍 문제 원인

도메인(`cost-signal.com`)을 구매하고 연결했지만, 여전히 Vercel 프리뷰 URL로 접속하고 있는 이유를 설명합니다.

---

## Vercel의 배포 시스템

### 1. 프리뷰 배포 (Preview Deployment)
- **언제 생성**: GitHub에 푸시할 때마다
- **URL 형식**: `cost-signal-[hash]-[username]-[project].vercel.app`
- **용도**: 코드 변경사항 테스트
- **도메인 연결**: 프로덕션 도메인과 연결되지 않음

### 2. 프로덕션 배포 (Production Deployment)
- **언제 생성**: `main` 브랜치에 푸시할 때
- **URL 형식**: `cost-signal.vercel.app` (기본) 또는 커스텀 도메인
- **용도**: 실제 사용자에게 제공
- **도메인 연결**: `cost-signal.com`과 연결됨

---

## 현재 상황

### 문제
- 도메인 `cost-signal.com`은 프로덕션 배포에만 연결됨
- 현재 접속한 URL: `cost-signal-be998h92p-...vercel.app` (프리뷰 배포)
- 프리뷰 배포는 프로덕션 도메인과 연결되지 않음

### 해결 방법

#### 방법 1: 프로덕션 도메인으로 직접 접속 (권장) ⭐

**`https://cost-signal.com`으로 직접 접속하세요.**

- 프로덕션 도메인은 프로덕션 배포에 연결됨
- Google OAuth가 정상 작동함
- 실제 사용자가 사용하는 URL

#### 방법 2: Vercel 대시보드에서 프로덕션 배포 확인

1. Vercel 대시보드 접속
2. `cost-signal` 프로젝트 선택
3. **Deployments** 탭 클릭
4. **Production** 배포 확인
5. 해당 배포의 URL 사용

#### 방법 3: Google Cloud Console에 와일드카드 추가

모든 Vercel URL을 허용:
```
https://*.vercel.app/api/auth/callback/google
```

---

## 확인 방법

### 프로덕션 도메인 확인
1. 브라우저에서 `https://cost-signal.com` 접속
2. 정상적으로 로드되는지 확인
3. 이 URL에서 Google 로그인 테스트

### Vercel 배포 확인
1. Vercel 대시보드 → Deployments
2. **Production** 배포 확인
3. 해당 배포가 `cost-signal.com`과 연결되어 있는지 확인

---

## 권장 사항

### 프로덕션 도메인 사용 (권장) ⭐⭐⭐

**`https://cost-signal.com`으로 직접 접속하세요.**

이유:
- 실제 사용자가 사용하는 URL
- 프로덕션 환경과 동일
- Google OAuth가 정상 작동
- 도메인도 구매했으니 사용해야 함

### 프리뷰 URL 사용 (개발/테스트용)

프리뷰 URL은:
- 코드 변경사항 테스트용
- 프로덕션 도메인과 연결되지 않음
- Google OAuth를 사용하려면 와일드카드 추가 필요

---

## 요약

### 현재 상황
- ✅ 도메인 구매 완료: `cost-signal.com`
- ✅ Vercel 연결 완료
- ✅ Google Cloud Console에 등록 완료
- ❌ 하지만 프리뷰 URL로 접속 중

### 해결 방법
**`https://cost-signal.com`으로 직접 접속하세요!**

프로덕션 도메인을 사용하면:
- ✅ Google OAuth 정상 작동
- ✅ 모든 기능 정상 작동
- ✅ 실제 사용자 환경과 동일

---

## 다음 단계

1. **브라우저에서 `https://cost-signal.com` 접속**
2. **Google 로그인 테스트**
3. **정상 작동 확인**

프리뷰 URL 대신 프로덕션 도메인을 사용하세요!

