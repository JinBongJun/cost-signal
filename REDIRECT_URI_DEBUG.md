# redirect_uri_mismatch 에러 디버깅 가이드

## 문제 원인

NextAuth는 OAuth redirect URI를 생성할 때 다음 순서로 결정합니다:

1. **`NEXTAUTH_URL` 환경 변수** (우선순위 높음)
2. **요청의 `host` 헤더** (환경 변수가 없을 때)

## 현재 상황

- 도메인: `cost-signal.com`
- Google Cloud Console에 등록된 URI: `https://cost-signal.com/api/auth/callback/google`

## 가능한 원인

1. **Vercel 환경 변수 `NEXTAUTH_URL`이 설정되지 않음**
   - NextAuth가 요청의 `host` 헤더를 사용
   - Vercel preview URL이나 다른 URL이 사용될 수 있음

2. **`NEXTAUTH_URL`이 잘못된 값으로 설정됨**
   - 예: `https://cost-signal.vercel.app` (프로덕션 도메인이 아님)

3. **요청이 다른 도메인에서 오는 경우**
   - Preview URL에서 접근
   - 또는 다른 서브도메인

## 해결 방법

### 1. Vercel 환경 변수 확인

Vercel 대시보드에서:
- Settings → Environment Variables
- `NEXTAUTH_URL` = `https://cost-signal.com` 확인

### 2. 코드에서 강제로 설정

`lib/auth-options.ts`에서 명시적으로 설정:

```typescript
export const authOptions: NextAuthOptions = {
  // ... 기존 설정
  // NextAuth가 사용할 base URL 명시
  // 이렇게 하면 NEXTAUTH_URL이 없어도 작동
};
```

하지만 NextAuth는 이미 `NEXTAUTH_URL`을 사용하므로, 환경 변수만 확인하면 됩니다.

### 3. 실제 생성되는 redirect URI 확인

로그를 추가하여 실제로 어떤 redirect URI가 생성되는지 확인:

```typescript
// app/api/auth/[...nextauth]/route.ts
const handler = async (req: NextRequest, context: any) => {
  const url = req.nextUrl;
  console.log('🔍 Request URL:', url.toString());
  console.log('🔍 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('🔍 Request Host:', req.headers.get('host'));
  // ...
};
```

## 즉시 확인할 사항

1. **Vercel 환경 변수 확인**
   - `NEXTAUTH_URL` = `https://cost-signal.com` (프로토콜 포함, 슬래시 없음)

2. **Google Cloud Console 확인**
   - Authorized redirect URIs에 `https://cost-signal.com/api/auth/callback/google` 등록됨

3. **실제 접근 URL 확인**
   - `cost-signal.com`에서 직접 접근하는지 확인
   - Preview URL이 아닌지 확인

