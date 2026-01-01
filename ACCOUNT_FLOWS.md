# 계정 관련 모든 플로우 정리

## 📋 목차
1. [로그인 플로우](#1-로그인-플로우)
2. [회원가입 플로우](#2-회원가입-플로우)
3. [Account 삭제 플로우](#3-account-삭제-플로우)
4. [재로그인 플로우](#4-재로그인-플로우)
5. [이메일 변경 플로우](#5-이메일-변경-플로우)
6. [비밀번호 변경 플로우](#6-비밀번호-변경-플로우)
7. [이름 변경 플로우](#7-이름-변경-플로우)
8. [메시지 표시](#8-메시지-표시)

---

## 1. 로그인 플로우

### 1.1 일반 계정 (이메일/비밀번호)
**경로**: `/login`

**동작**:
- 이메일/비밀번호 입력
- `signIn('credentials')` 호출
- NextAuth `CredentialsProvider` 처리
- 성공 시 홈페이지로 리다이렉트

**결과**:
- ✅ 기존 계정: 로그인 성공
- ❌ 잘못된 정보: "Invalid email or password" 에러

**메시지**: 없음

---

### 1.2 구글 계정
**경로**: `/login` (또는 `/signup`)

**동작**:
- "Sign in with Google" 버튼 클릭
- `signIn('google', { callbackUrl: '/' })` 호출
- Google OAuth 인증
- `lib/auth-options.ts`의 `signIn` callback 실행

**시나리오별 처리**:

#### 케이스 1: 기존 사용자 (같은 이메일)
- `getUserByEmail()`로 사용자 찾음
- 기존 계정에 로그인
- Google 계정이 연결되어 있지 않으면 자동 연결
- `isNewUser = false`

#### 케이스 2: 새 사용자 (이메일 없음)
- 새 사용자 생성 (`createUser`)
- Google 계정 연결 (`linkAccount`)
- `isNewUser = true`

#### 케이스 3: 기존 사용자 (다른 이메일로 가입했지만 Google 계정은 새로 로그인)
- `getUserByEmail()`로 사용자 찾음
- 기존 계정에 로그인
- Google 계정 자동 연결
- `isNewUser = false`

**메시지**: 
- 새 계정 생성 시: "Welcome! Your account has been created successfully."

---

## 2. 회원가입 플로우

### 2.1 일반 계정 (이메일/비밀번호)
**경로**: `/signup`

**동작**:
- 이름(선택), 이메일, 비밀번호 입력
- `/api/auth/signup` API 호출
- 사용자 생성
- 성공 시 `/login?signup=success`로 리다이렉트

**결과**:
- ✅ 성공: 로그인 페이지로 이동, "Password reset successful!" 메시지
- ❌ 이메일 중복: "This email is already registered. Please sign in instead."

**메시지**: 없음 (로그인 페이지에서 표시)

---

### 2.2 구글 계정
**경로**: `/signup` (또는 `/login`)

**동작**:
- "Sign up with Google" 버튼 클릭
- `signIn('google', { callbackUrl: '/' })` 호출
- Google OAuth 인증
- **로그인 플로우와 동일한 처리** (자동 로그인/회원가입)

**시나리오별 처리**:
- 기존 사용자: 자동 로그인
- 새 사용자: 자동 회원가입

**메시지**:
- 새 계정 생성 시: "Welcome! Your account has been created successfully."

**참고**: 
- 로그인 페이지와 회원가입 페이지 모두 동일한 Google 버튼 제공
- 둘 다 같은 동작 (자동 로그인/회원가입)

---

## 3. Account 삭제 플로우

### 3.1 일반 계정 삭제
**경로**: `/account/delete`

**동작**:
- Account 삭제 확인
- `DELETE /api/account/delete` 호출
- 다음 순서로 데이터 삭제:
  1. `subscriptions` 삭제
  2. `email_change_tokens` 삭제
  3. `sessions` 삭제
  4. `accounts` (OAuth) 삭제
  5. `password_reset_tokens` 삭제
  6. `users` 삭제

**결과**:
- ✅ 성공: 로그아웃 후 홈페이지로 리다이렉트
- ❌ 실패: 에러 메시지 표시

**메시지**: 없음

---

### 3.2 구글 계정 삭제
**경로**: `/account/delete`

**동작**:
- 일반 계정 삭제와 동일
- Google 계정 정보도 `accounts` 테이블에서 삭제

**결과**:
- ✅ 성공: 로그아웃 후 홈페이지로 리다이렉트
- ❌ 실패: 에러 메시지 표시

**메시지**: 없음

**참고**:
- 구독 기록도 함께 삭제됨
- 모든 관련 데이터 완전 삭제

---

## 4. 재로그인 플로우

### 4.1 일반 계정 삭제 후 재로그인
**경로**: `/login`

**동작**:
- Account 삭제 후 같은 이메일로 회원가입 시도
- `/api/auth/signup` API 호출
- 새 계정 생성

**결과**:
- ✅ 성공: 새 계정 생성, 로그인 페이지로 이동
- ❌ 이메일 중복: "This email is already registered" (삭제가 완전히 안 된 경우)

**메시지**: 없음

---

### 4.2 구글 계정 삭제 후 재로그인
**경로**: `/login` 또는 `/signup`

**동작**:
- Account 삭제 후 같은 Google 계정으로 로그인 시도
- `signIn('google')` 호출
- Google OAuth 인증
- `lib/auth-options.ts`의 `signIn` callback 실행

**시나리오별 처리**:

#### 케이스 1: 완전 삭제된 경우
- `getUserByEmail()` → 사용자 없음
- 새 사용자 생성
- Google 계정 연결
- `isNewUser = true`

#### 케이스 2: Orphaned Account (삭제 실패)
- `getAccountByProvider()` → 계정 찾음
- `getUserById()` → 사용자 없음 (orphaned)
- Orphaned account 삭제
- 새 사용자 생성
- Google 계정 연결
- `isNewUser = true`

**결과**:
- ✅ 성공: 새 계정 생성, 홈페이지로 리다이렉트

**메시지**:
- "Welcome! Your account has been created successfully."

**참고**:
- 구독 기록은 삭제되었으므로 새 계정에는 구독 기록 없음
- 이전 데이터는 완전히 삭제됨

---

## 5. 이메일 변경 플로우

### 5.1 일반 계정
**경로**: `/account`

**동작**:
1. "Change Email" 버튼 클릭
2. 새 이메일 입력
3. `POST /api/account/email/request` 호출
4. 검증 이메일 발송
5. 새 이메일에서 링크 클릭
6. `POST /api/account/email/confirm` 호출
7. 이메일 업데이트
8. 로그아웃 후 로그인 페이지로 리다이렉트

**결과**:
- ✅ 성공: 로그아웃, 로그인 페이지로 이동
- ❌ 실패: 에러 메시지 표시

**메시지**: 없음

---

### 5.2 구글 계정
**경로**: `/account`

**동작**:
- 이메일 변경 버튼 숨김
- 안내 메시지 표시

**UI 표시**:
```
Google Account: Your email is managed by your Google account.
To change your email, please update it in your Google Account settings.
[Google Account settings 링크]
```

**결과**:
- ❌ 이메일 변경 불가능
- Google Account settings로 안내

**API 차단**:
- `POST /api/account/email/request`에서 `hasGoogleAccount` 체크
- 400 에러 반환: "Email cannot be changed for Google accounts..."

**메시지**: 안내 메시지만 표시

---

## 6. 비밀번호 변경 플로우

### 6.1 일반 계정
**경로**: `/account`

**동작**:
1. "Change Password" 버튼 클릭
2. 현재 비밀번호, 새 비밀번호, 확인 비밀번호 입력
3. `POST /api/account/password/change` 호출
4. 비밀번호 업데이트

**결과**:
- ✅ 성공: "Password changed successfully" 토스트
- ❌ 실패: 에러 메시지 표시

**메시지**: "Password changed successfully"

---

### 6.2 구글 계정
**경로**: `/account`

**동작**:
- 비밀번호 변경 버튼 숨김 (비밀번호 없음)
- 안내 메시지 표시

**UI 표시**:
```
You signed in with Google. Password management is handled by your Google account.
To change your password, please visit your Google Account settings.
[Google Account settings 링크]
```

**결과**:
- ❌ 비밀번호 변경 불가능
- Google Account settings로 안내

**조건**:
- `hasGoogleAccount = true` && `hasPassword = false`인 경우만 표시

**메시지**: 안내 메시지만 표시

---

## 7. 이름 변경 플로우

### 7.1 모든 계정 (일반/구글)
**경로**: `/account`

**동작**:
1. 이름 옆 "Edit" 버튼 클릭
2. 새 이름 입력
3. "Save" 버튼 클릭
4. `PATCH /api/account` 호출
5. 이름 업데이트
6. 세션 업데이트 (`updateSession()`)
7. 페이지 새로고침

**결과**:
- ✅ 성공: 이름 업데이트, 프로필 아바타 업데이트
- ❌ 실패: 에러 메시지 표시

**메시지**: "Name updated successfully"

**참고**:
- 일반 계정과 구글 계정 모두 동일하게 처리
- 프로필 아바타의 이니셜도 자동 업데이트

---

## 8. 메시지 표시

### 8.1 Welcome 메시지 (새 계정 생성)
**조건**: `isNewUser = true`

**표시 위치**: 홈페이지 (`/`)

**메시지**: 
```
"Welcome! Your account has been created successfully."
```

**표시 시점**:
- 일반 회원가입: 표시 안 함 (로그인 페이지로 리다이렉트)
- 구글 계정 회원가입: 홈페이지 접속 시 표시
- Account 삭제 후 재로그인: 홈페이지 접속 시 표시

**표시 횟수**: 한 번만 (sessionStorage 사용)

**구현**:
```typescript
// app/page.tsx
useEffect(() => {
  if (session?.user && (session.user as any).isNewUser) {
    const messageShown = sessionStorage.getItem('newAccountMessageShown');
    if (!messageShown) {
      toast.success('Welcome! Your account has been created successfully.');
      sessionStorage.setItem('newAccountMessageShown', 'true');
    }
  }
}, [session, toast]);
```

---

## 📊 플로우 비교표

| 기능 | 일반 계정 | 구글 계정 |
|------|----------|----------|
| **로그인** | 이메일/비밀번호 | Google OAuth |
| **회원가입** | 이메일/비밀번호 | Google OAuth (자동) |
| **Account 삭제** | ✅ 가능 | ✅ 가능 |
| **재로그인** | 새 계정 생성 | 새 계정 생성 (자동) |
| **이메일 변경** | ✅ 가능 | ❌ 불가능 (Google 설정으로 안내) |
| **비밀번호 변경** | ✅ 가능 | ❌ 불가능 (비밀번호 없음) |
| **이름 변경** | ✅ 가능 | ✅ 가능 |
| **Welcome 메시지** | ❌ 없음 | ✅ 새 계정 생성 시 |

---

## 🔄 주요 플로우 다이어그램

### 구글 계정 로그인/회원가입 플로우
```
사용자 → Google 버튼 클릭
  ↓
Google OAuth 인증
  ↓
signIn callback 실행
  ↓
getUserByEmail() 체크
  ↓
┌─────────────────┬─────────────────┐
│ 기존 사용자      │ 새 사용자        │
│ (로그인)        │ (회원가입)       │
│ isNewUser=false │ isNewUser=true  │
└─────────────────┴─────────────────┘
  ↓
홈페이지 리다이렉트
  ↓
Welcome 메시지 (새 계정만)
```

### Account 삭제 플로우
```
사용자 → Account 삭제 확인
  ↓
DELETE /api/account/delete
  ↓
데이터 삭제 순서:
  1. subscriptions
  2. email_change_tokens
  3. sessions
  4. accounts (OAuth)
  5. password_reset_tokens
  6. users
  ↓
로그아웃
  ↓
홈페이지 리다이렉트
```

### 재로그인 플로우 (구글 계정)
```
Account 삭제 후
  ↓
Google 로그인 시도
  ↓
getUserByEmail() → 사용자 없음
  ↓
새 사용자 생성
  ↓
Google 계정 연결
  ↓
isNewUser = true
  ↓
홈페이지 리다이렉트
  ↓
Welcome 메시지 표시
```

---

## ✅ 체크리스트

### 일반 계정
- [x] 이메일/비밀번호 로그인
- [x] 이메일/비밀번호 회원가입
- [x] Account 삭제
- [x] 이메일 변경
- [x] 비밀번호 변경
- [x] 이름 변경

### 구글 계정
- [x] Google OAuth 로그인
- [x] Google OAuth 회원가입 (자동)
- [x] Account 삭제
- [x] 재로그인 (새 계정 생성)
- [x] 이메일 변경 차단 (안내 메시지)
- [x] 비밀번호 변경 차단 (안내 메시지)
- [x] 이름 변경
- [x] Welcome 메시지 (새 계정 생성 시)

---

## 📝 참고사항

1. **구글 계정과 일반 계정 통합**:
   - 같은 이메일로 일반 계정 가입 후 구글 로그인 시 자동 연결
   - 구글 계정으로 가입 후 이메일/비밀번호 추가 가능 (현재 미구현)

2. **Orphaned Account 처리**:
   - Account 삭제 실패 시 orphaned account 발생 가능
   - 재로그인 시 자동으로 정리됨

3. **구독 기록**:
   - Account 삭제 시 구독 기록도 함께 삭제
   - 재로그인 시 새 계정이므로 구독 기록 없음

4. **메시지 표시**:
   - 새 계정 생성 시에만 Welcome 메시지 표시
   - Account 삭제 후 재로그인도 새 계정으로 간주

5. **UI 일관성**:
   - 구글 계정 사용자는 이메일/비밀번호 변경 불가능
   - Google Account settings로 안내하는 명확한 메시지 표시

