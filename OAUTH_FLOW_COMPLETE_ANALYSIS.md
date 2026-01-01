# Google OAuth 모든 플로우 완전 분석 및 대응 상태

## 현재 구현 상태 분석

### ✅ 구현된 부분

1. **서버 사이드 검증 (정석 구현)**
   - `lib/auth-options.ts`: `signIn` 콜백에서 `oauth_mode` 확인
   - 로그인 모드 + 새 사용자 → `return false` (바로 에러!)
   - 회원가입 모드 + 기존 사용자 → `return false` (바로 에러!)

2. **에러 페이지**
   - `app/api/auth/error/page.tsx`: NextAuth 에러 처리

3. **클라이언트 사이드 처리**
   - `app/login/page.tsx`: `callbackUrl`에 `oauth_mode=login` 추가
   - `app/signup/page.tsx`: `callbackUrl`에 `oauth_mode=signup` 추가
   - `app/page.tsx`: 클라이언트 검증 로직 (하지만 서버에서 이미 처리하므로 중복)

### ❌ 발견된 문제점

1. **API 라우트의 제한사항**
   - 초기 요청(`/signin/google`)에서 `oauth_mode` 추출 ✅
   - 하지만 콜백 요청(`/callback/google`)에서는 `state` 파라미터를 디코딩하지 못함 ❌
   - 결과: `currentOAuthMode`가 콜백 시점에 `null`이 될 수 있음

2. **에러 페이지의 제한사항**
   - NextAuth는 `error=AccessDenied`만 전달
   - `errorDescription`이 없어서 로그인/회원가입 구분 불가
   - 현재는 `errorDescription`을 확인하지만, 실제로는 전달되지 않음

3. **중복된 클라이언트 검증**
   - `app/page.tsx`의 클라이언트 검증 로직이 불필요
   - 서버에서 이미 처리하므로 중복

4. **oauth_mode가 null일 때**
   - 현재는 기본 동작(자동 회원가입) 허용
   - 하지만 이것이 의도된 동작인지 불명확

---

## 모든 플로우 케이스 및 대응 상태

### ✅ 케이스 1: 로그인 페이지 → Google 로그인 → 기존 사용자
**상태:** ✅ 완전 처리됨

**플로우:**
1. 사용자가 로그인 페이지에서 "Sign in with Google" 클릭
2. `signIn('google', { callbackUrl: '/?oauth_mode=login' })` 호출
3. API 라우트에서 초기 요청 확인 → `oauth_mode=login` 추출 ✅
4. `authOptions.currentOAuthMode = 'login'` 저장
5. Google 계정 선택 화면 표시
6. 기존 사용자 계정 선택
7. 콜백 요청 → `currentOAuthMode` 유지 여부 불확실 ⚠️
8. `signIn` 콜백 실행:
   - 사용자 존재 확인 → 기존 사용자 발견
   - `oauthMode = 'login'` 확인 (null일 수 있음)
   - `oauthMode === 'login' && !existingUser` → false (통과)
   - `oauthMode === 'signup' && existingUser` → false (통과)
   - ✅ 조건 통과 → 로그인 성공

**문제점:** `oauthMode`가 `null`이면 검증이 우회됨

---

### ✅ 케이스 2: 회원가입 페이지 → Google 로그인 → 새 사용자
**상태:** ✅ 완전 처리됨

**플로우:**
1. 사용자가 회원가입 페이지에서 "Sign up with Google" 클릭
2. `signIn('google', { callbackUrl: '/?oauth_mode=signup' })` 호출
3. API 라우트에서 초기 요청 확인 → `oauth_mode=signup` 추출 ✅
4. `authOptions.currentOAuthMode = 'signup'` 저장
5. Google 계정 선택 화면 표시
6. 새 사용자 계정 선택
7. 콜백 요청 → `currentOAuthMode` 유지 여부 불확실 ⚠️
8. `signIn` 콜백 실행:
   - 사용자 존재 확인 → 사용자 없음
   - `oauthMode = 'signup'` 확인 (null일 수 있음)
   - `oauthMode === 'login' && !existingUser` → false (통과)
   - `oauthMode === 'signup' && existingUser` → false (통과)
   - ✅ 조건 통과 → 새 사용자 생성

**문제점:** `oauthMode`가 `null`이면 검증이 우회됨

---

### ⚠️ 케이스 3: 로그인 페이지 → Google 로그인 → 새 사용자 (정석: 바로 에러!)
**상태:** ⚠️ 부분적으로 처리됨 (제한사항 있음)

**플로우:**
1. 사용자가 로그인 페이지에서 "Sign in with Google" 클릭
2. `signIn('google', { callbackUrl: '/?oauth_mode=login' })` 호출
3. API 라우트에서 초기 요청 확인 → `oauth_mode=login` 추출 ✅
4. `authOptions.currentOAuthMode = 'login'` 저장
5. Google 계정 선택 화면 표시
6. 새 사용자 계정 선택
7. 콜백 요청 → `currentOAuthMode` 유지 여부 불확실 ⚠️
8. `signIn` 콜백 실행:
   - 사용자 존재 확인 → 사용자 없음
   - `oauthMode = 'login'` 확인 (null일 수 있음) ⚠️
   - **만약 `oauthMode === 'login'`이면:**
     - `oauthMode === 'login' && !existingUser` → true
     - `return false` → 바로 에러! ✅
   - **만약 `oauthMode === null`이면:**
     - 검증 우회 → 자동 회원가입 발생 ❌

**문제점:** `oauthMode`가 `null`이면 자동 회원가입이 발생할 수 있음

---

### ⚠️ 케이스 4: 회원가입 페이지 → Google 로그인 → 기존 사용자 (정석: 바로 에러!)
**상태:** ⚠️ 부분적으로 처리됨 (제한사항 있음)

**플로우:**
1. 사용자가 회원가입 페이지에서 "Sign up with Google" 클릭
2. `signIn('google', { callbackUrl: '/?oauth_mode=signup' })` 호출
3. API 라우트에서 초기 요청 확인 → `oauth_mode=signup` 추출 ✅
4. `authOptions.currentOAuthMode = 'signup'` 저장
5. Google 계정 선택 화면 표시
6. 기존 사용자 계정 선택
7. 콜백 요청 → `currentOAuthMode` 유지 여부 불확실 ⚠️
8. `signIn` 콜백 실행:
   - 사용자 존재 확인 → 기존 사용자 발견
   - `oauthMode = 'signup'` 확인 (null일 수 있음) ⚠️
   - **만약 `oauthMode === 'signup'`이면:**
     - `oauthMode === 'signup' && existingUser` → true
     - `return false` → 바로 에러! ✅
   - **만약 `oauthMode === null`이면:**
     - 검증 우회 → 로그인 성공 ❌

**문제점:** `oauthMode`가 `null`이면 검증이 우회됨

---

## 추가 케이스

### ⚠️ 케이스 5: oauth_mode가 null일 때 (기본 동작)
**상태:** ⚠️ 불명확

**시나리오:**
- API 라우트에서 `oauth_mode` 추출 실패
- 또는 콜백 요청에서 `currentOAuthMode` 유지 실패

**현재 동작:**
- `oauthMode === null`이면 검증 우회
- 새 사용자면 자동 회원가입
- 기존 사용자면 로그인

**문제점:**
- 의도하지 않은 자동 회원가입 발생 가능
- 로그인/회원가입 구분 불가

---

## 해결 방안

### 1. state 파라미터 디코딩
- NextAuth의 `state` 파라미터를 디코딩하여 `callbackUrl` 추출
- 콜백 요청에서도 `oauth_mode` 확인 가능

### 2. 에러 페이지 개선
- `errorDescription` 대신 다른 방법으로 로그인/회원가입 구분
- 예: 쿠키나 세션에 저장

### 3. 클라이언트 검증 로직 제거
- 서버에서 이미 처리하므로 불필요
- `app/page.tsx`의 클라이언트 검증 로직 제거

### 4. oauth_mode null 처리 명확화
- `oauth_mode`가 `null`일 때의 동작 명확히 정의
- 또는 항상 `oauth_mode`를 요구하도록 변경

---

## 결론

**현재 상태:**
- ✅ 기본적인 정석 구현은 완료
- ⚠️ 하지만 `oauth_mode` 전달이 불안정할 수 있음
- ⚠️ 콜백 요청에서 `currentOAuthMode` 유지가 보장되지 않음

**필요한 개선:**
1. `state` 파라미터 디코딩으로 콜백 요청에서도 `oauth_mode` 확인
2. 에러 페이지 개선 (로그인/회원가입 구분)
3. 클라이언트 검증 로직 제거 (중복)
4. `oauth_mode` null 처리 명확화

