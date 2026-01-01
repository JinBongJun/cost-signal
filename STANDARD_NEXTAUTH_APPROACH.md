# 다른 앱들의 표준 NextAuth + Google OAuth 방식

## 표준 방식 (대부분의 앱)

### 1. 환경 변수만 설정
```env
NEXTAUTH_URL=https://cost-signal.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 2. NextAuth 기본 설정 (복잡한 수정 없음)
```typescript
// lib/auth-options.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // 기본 설정만 사용
};
```

### 3. API Route도 기본 사용
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const { GET, POST } = NextAuth(authOptions);
```

**핵심:** NextAuth가 자동으로 `{NEXTAUTH_URL}/api/auth/callback/google` 형식으로 redirect URI를 생성합니다.

## 우리가 추가한 복잡한 로직들

### 1. 요청 URL 수정
```typescript
// host 불일치 감지 및 URL 수정
if (currentHost !== baseUrlHost) {
  url = new URL(url.pathname + url.search, baseUrl);
}
```

### 2. redirect 콜백에서 baseUrl 강제
```typescript
const forcedBaseUrl = process.env.NEXTAUTH_URL || baseUrl;
```

### 3. Response 조작 (쿠키 추가)
```typescript
// Response body 복사 및 헤더 추가
const response = new Response(authResponse.body, {...});
```

## 문제 가능성

**우리가 추가한 로직들이 NextAuth의 기본 동작을 방해할 수 있습니다:**

1. **요청 URL 수정**: NextAuth가 내부적으로 사용하는 URL과 다를 수 있음
2. **Response 조작**: redirect URI가 포함된 Response body를 복사하면서 문제 발생 가능
3. **복잡한 로직**: 표준 방식과 다르게 동작하여 예상치 못한 문제 발생

## 해결 방안

### 옵션 1: 표준 방식으로 단순화 (권장)
- 불필요한 복잡한 로직 제거
- NextAuth 기본 동작에 맡기기
- `NEXTAUTH_URL` 환경 변수만 올바르게 설정

### 옵션 2: 현재 방식 유지 + 디버그
- 현재 로직 유지하되 디버그 로그로 실제 문제 확인
- Vercel 로그에서 실제 생성되는 redirect URI 확인

## 결론

**대부분의 앱들은 우리처럼 복잡한 로직 없이 단순히 `NEXTAUTH_URL`만 설정합니다.**

우리가 추가한 로직들이 오히려 문제를 일으킬 수 있으므로, 표준 방식으로 단순화하는 것을 고려해야 합니다.

