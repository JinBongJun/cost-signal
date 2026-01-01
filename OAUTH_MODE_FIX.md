# oauth_mode 전달 불안정성 해결 ✅

## 문제점
- 초기 요청(`/signin/google`)에서 `oauth_mode` 추출 ✅
- 하지만 콜백 요청(`/callback/google`)에서는 `currentOAuthMode`가 유지되지 않을 수 있음 ❌
- 결과: 케이스 3, 4에서 검증이 우회될 수 있음

## 해결 방법

### 1. 쿠키 사용
- 초기 요청에서 쿠키에 `oauth_mode` 저장
- 콜백 요청에서 쿠키에서 `oauth_mode` 읽기
- `signIn` 콜백에서 `authOptions.currentOAuthMode` 사용

### 2. 이중 저장
- `authOptions.currentOAuthMode`: 즉시 접근용
- `authOptions.oauthModeCookieValue`: 쿠키 값 백업
- 쿠키: 요청 간 전달용

### 3. Fallback 메커니즘
- 쿠키에서 읽기 실패 시 `authOptions.oauthModeCookieValue` 사용
- `signIn` 콜백에서도 여러 소스 확인

## 구현 내용

### API 라우트 (`app/api/auth/[...nextauth]/route.ts`)
1. **초기 요청 처리:**
   - `callbackUrl`에서 `oauth_mode` 추출
   - `authOptions`에 저장
   - 쿠키에 저장 (응답 헤더에 추가)

2. **콜백 요청 처리:**
   - 쿠키에서 `oauth_mode` 읽기
   - `authOptions`에 저장
   - 쿠키 삭제 (응답 헤더에 추가)

### signIn 콜백 (`lib/auth-options.ts`)
- `authOptions.currentOAuthMode` 확인
- Fallback: `authOptions.oauthModeCookieValue` 확인
- 검증 수행

## 결과

✅ **모든 케이스가 안정적으로 처리됨:**
- 케이스 1: 로그인 → 기존 사용자 ✅
- 케이스 2: 회원가입 → 새 사용자 ✅
- 케이스 3: 로그인 → 새 사용자 (바로 에러!) ✅
- 케이스 4: 회원가입 → 기존 사용자 (바로 에러!) ✅

**이제 `oauth_mode` 전달이 안정적으로 작동합니다!** 🎉

