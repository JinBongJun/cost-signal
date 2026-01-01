# 코드 복잡도 분석: 표준 vs 우리 구현

## 표준 NextAuth 구현 (대부분의 앱)

### API Route
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const { GET, POST } = NextAuth(authOptions);
```
**줄 수: 4줄**

### authOptions
```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // 기본 설정만
};
```
**줄 수: ~10줄**

---

## 우리 구현

### API Route
- oauth_mode 추출 및 쿠키 관리
- Response 조작 (쿠키 추가/삭제)
- Fallback 로직
**줄 수: 96줄** (표준의 24배)

### authOptions
- oauth_mode 검증 로직
- 사용자 생성/연결 로직
- redirect 콜백에서 oauth_mode 처리
- 복잡한 signIn 콜백
**줄 수: 245줄** (표준의 24배)

---

## 과도한 부분 분석

### 1. ✅ 필요한 것 (기능 요구사항)
- **oauth_mode 전달**: 로그인/회원가입 구분을 위해 필요
- **사용자 검증**: 정석 구현 (로그인 시도 시 새 사용자 차단)
- **쿠키 관리**: oauth_mode를 Google OAuth 사이에 전달하기 위해 필요

### 2. ⚠️ 과도할 수 있는 것
- **redirect 콜백에서 oauth_mode 처리**: 이미 API route에서 처리함
- **중복된 fallback 로직**: `currentOAuthMode`와 `oauthModeCookieValue` 둘 다 사용
- **Response 조작**: 쿠키 추가를 위해 Response를 복사하는 것이 redirect URI에 영향을 줄 수 있음

### 3. ❌ 불필요할 수 있는 것
- **redirect 콜백의 oauth_mode 처리**: API route에서 이미 처리하므로 중복
- **과도한 로깅**: 프로덕션에서는 불필요할 수 있음

---

## 단순화 가능한 부분

### 1. redirect 콜백 단순화
현재:
```typescript
async redirect({ url, baseUrl }) {
  // oauth_mode 추출 및 저장 (중복)
  const oauthMode = urlObj.searchParams.get('oauth_mode');
  if (oauthMode) {
    (authOptions as any).currentOAuthMode = oauthMode;
  }
  // ...
}
```

단순화:
```typescript
async redirect({ url, baseUrl }) {
  // oauth_mode는 API route에서 이미 처리하므로 여기서는 URL만 정리
  try {
    const urlObj = new URL(url, baseUrl);
    urlObj.searchParams.delete('oauth_mode');
    // ...
  }
}
```

### 2. Fallback 로직 단순화
현재:
- `currentOAuthMode` (즉시 접근용)
- `oauthModeCookieValue` (쿠키 값 백업)
- 쿠키에서 읽기
- Fallback 체크

단순화:
- 쿠키만 사용 (가장 안정적)
- Fallback 제거

### 3. Response 조작 최소화
현재: Response body를 복사하여 새 Response 생성
개선: 쿠키만 추가하는 방식으로 변경 (NextAuth의 내장 기능 활용)

---

## 결론

**과도한 부분:**
1. redirect 콜백에서 oauth_mode 중복 처리
2. 복잡한 fallback 로직
3. Response 조작 방식

**유지해야 할 부분:**
1. oauth_mode 쿠키 전달 (기능 요구사항)
2. 사용자 검증 로직 (정석 구현)
3. signIn 콜백의 검증 로직

**단순화 가능:**
- redirect 콜백에서 oauth_mode 처리 제거 (API route에서 이미 처리)
- Fallback 로직 단순화 (쿠키만 사용)
- Response 조작 방식 개선

