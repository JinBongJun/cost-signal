# redirect_uri_mismatch 근본 원인 및 해결

## 문제 상황

- ✅ Vercel 환경 변수 `NEXTAUTH_URL` = `https://cost-signal.com` 설정됨
- ✅ Google Cloud Console에 `https://cost-signal.com/api/auth/callback/google` 등록됨
- ❌ 여전히 `redirect_uri_mismatch` 에러 발생

## 근본 원인

NextAuth는 OAuth redirect URI를 생성할 때 다음 순서로 결정합니다:

1. **`NEXTAUTH_URL` 환경 변수** (우선순위 높음)
2. **요청의 `host` 헤더** (환경 변수가 없거나 무시되는 경우)

**문제:** NextAuth가 내부적으로 요청의 `host` 헤더를 사용하거나, 환경 변수를 제대로 읽지 못하는 경우가 있습니다.

## 해결 방법

### 방법 1: NextAuth의 `baseUrl` 명시적 설정 (권장)

NextAuth v4에서는 `baseUrl`을 직접 설정할 수 없지만, `NEXTAUTH_URL` 환경 변수를 강제로 사용하도록 할 수 있습니다.

하지만 더 확실한 방법은 **요청 레벨에서 redirect URI를 명시적으로 지정**하는 것입니다.

### 방법 2: API Route에서 요청 URL 강제 설정

`app/api/auth/[...nextauth]/route.ts`에서 요청의 URL을 수정하여 NextAuth가 올바른 base URL을 사용하도록 강제합니다.

### 방법 3: GoogleProvider에 직접 callbackURL 설정

NextAuth v4의 GoogleProvider는 `callbackURL`을 직접 설정할 수 없지만, `authorization` 옵션에서 `redirect_uri`를 명시할 수 있습니다.

## 최종 해결책

가장 확실한 방법은 **NextAuth가 요청을 처리하기 전에 요청 URL을 수정**하는 것입니다.

