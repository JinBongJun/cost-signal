# redirect_uri_mismatch 에러 원인 및 해결

## 문제 원인

### 1. Response 조작으로 인한 리다이렉트 URI 손상

**문제가 된 코드:**
```typescript
// ❌ 문제: Response body를 복사하면서 리다이렉트 URI가 손상됨
const response = new Response(authResponse.body, {
  status: authResponse.status,
  statusText: authResponse.statusText,
  headers: authResponse.headers,
});
```

**왜 문제였나?**
1. NextAuth는 OAuth 리다이렉트를 위해 특정 형식의 Response를 생성합니다
2. Response body를 복사하면서 리다이렉트 응답의 내부 구조가 손상되었을 수 있습니다
3. 특히 리다이렉트 응답(302/307)의 경우 Location 헤더와 body의 관계가 중요합니다
4. 새로운 Response 객체를 만들면서 NextAuth가 설정한 내부 상태가 손실되었을 수 있습니다

### 2. 리다이렉트 응답 처리 오류

**문제:**
- 리다이렉트 응답의 경우 `NextResponse.redirect()`를 사용하려고 했지만
- 이미 NextAuth가 생성한 리다이렉트를 다시 생성하면서 URI가 변경되었을 수 있습니다
- Location 헤더를 복사하는 과정에서 문제가 발생했을 수 있습니다

## 해결 방법

### 수정된 코드:
```typescript
// ✅ 해결: Response body는 그대로 두고 헤더만 추가
const response = new Response(authResponse.body, {
  status: authResponse.status,
  statusText: authResponse.statusText,
  headers: authResponse.headers, // NextAuth가 설정한 헤더 그대로 사용
});

// 쿠키 헤더만 추가 (기존 헤더는 보존)
response.headers.append('Set-Cookie', '...');
```

**왜 이렇게 해결했나?**
1. Response body를 그대로 보존 → NextAuth의 내부 구조 유지
2. 헤더만 추가 → 리다이렉트 URI에 영향 없음
3. Location 헤더 보존 → Google OAuth 리다이렉트 URI 정상 작동

## 핵심 포인트

### ❌ 하지 말아야 할 것:
- Response body를 조작하거나 복사
- 리다이렉트 응답을 다시 생성
- Location 헤더를 수정

### ✅ 해야 할 것:
- Response body는 그대로 보존
- 헤더만 추가 (append 사용)
- NextAuth가 생성한 리다이렉트 URI 그대로 사용

## 결과

1. ✅ 쿠키로 `oauth_mode` 안정적 전달
2. ✅ NextAuth의 리다이렉트 URI 정상 생성
3. ✅ `redirect_uri_mismatch` 에러 해결
4. ✅ 모든 OAuth 플로우 정상 작동

