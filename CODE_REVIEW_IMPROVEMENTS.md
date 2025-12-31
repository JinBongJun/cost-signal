# 코드 검토 및 개선 사항

> **검토 일자**: 2025-01-02  
> **검토 범위**: 전체 코드베이스

---

## 🔴 높은 우선순위 (보안/안정성)

### 1. 환경 변수 검증 부족
**문제**: 환경 변수가 없을 때 명확한 에러 메시지가 없음  
**위치**: 모든 API 라우트  
**영향**: 프로덕션에서 환경 변수 누락 시 예상치 못한 에러 발생

**개선 방안**:
```typescript
// lib/env.ts 생성
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
```

**영향받는 파일**:
- `lib/paddle.ts` - PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET
- `lib/email.ts` - RESEND_API_KEY, RESEND_FROM_EMAIL
- `lib/push.ts` - VAPID keys
- `lib/auth-options.ts` - NEXTAUTH_SECRET, NEXTAUTH_URL

---

### 2. 입력 검증 부족
**문제**: 일부 API에서 입력 검증이 약함  
**위치**: 
- `app/api/account/profile/route.ts` - name 길이 제한 없음
- `app/api/push/subscribe/route.ts` - endpoint URL 검증 없음
- `app/api/paddle/webhook/route.ts` - JSON 파싱 에러 처리 부족

**개선 방안**:
```typescript
// name 검증 추가
if (name && (name.length > 100 || name.trim().length === 0)) {
  return NextResponse.json(
    { error: 'Name must be between 1 and 100 characters' },
    { status: 400 }
  );
}

// endpoint URL 검증
if (!endpoint || !endpoint.startsWith('https://')) {
  return NextResponse.json(
    { error: 'Invalid endpoint URL' },
    { status: 400 }
  );
}
```

---

### 3. 타입 안정성 개선
**문제**: `any` 타입 사용이 많음 (24곳)  
**위치**: 
- `app/api/paddle/webhook/route.ts` - `data: any`, `db: any`
- `app/api/account/*/route.ts` - `(session.user as any).id`
- `app/api/feedback/route.ts` - `error: any`

**개선 방안**:
```typescript
// 타입 정의 추가
interface PaddleWebhookData {
  event_type: string;
  data: {
    id: string;
    customer_id: string;
    status: string;
    // ...
  };
}

interface SessionUser {
  id: string;
  email: string;
  name?: string;
}
```

---

### 4. Rate Limiting 일관성
**문제**: 일부 API에 rate limiting이 없음  
**위치**:
- `app/api/account/profile/route.ts` - Rate limiting 없음
- `app/api/account/password/route.ts` - Rate limiting 없음
- `app/api/account/subscription/*/route.ts` - Rate limiting 없음

**개선 방안**: 모든 사용자 입력을 받는 API에 rate limiting 추가

---

### 5. 에러 메시지 일관성
**문제**: 에러 메시지가 일관되지 않음  
**예시**:
- "Unauthorized" vs "Authentication required"
- "Internal server error" vs "An error occurred"

**개선 방안**: 표준 에러 메시지 상수 정의

---

## 🟡 중간 우선순위 (사용자 경험/성능)

### 6. JSON 파싱 에러 처리
**문제**: `request.json()` 호출 시 에러 처리 부족  
**위치**: 대부분의 POST API

**개선 방안**:
```typescript
let body;
try {
  body = await request.json();
} catch (error) {
  return NextResponse.json(
    { error: 'Invalid JSON in request body' },
    { status: 400 }
  );
}
```

---

### 7. 로깅 개선
**문제**: 
- 프로덕션에서 민감한 정보가 로그에 남을 수 있음
- 로그 레벨 구분 없음
- 구조화된 로깅 없음

**개선 방안**:
```typescript
// lib/logger.ts 생성
export const logger = {
  info: (message: string, data?: object) => {
    if (process.env.NODE_ENV === 'production') {
      // 구조화된 로깅 (Sentry 등)
    } else {
      console.log(message, data);
    }
  },
  error: (message: string, error?: Error) => {
    // 민감한 정보 제거
    console.error(message, error?.message);
  }
};
```

---

### 8. 데이터베이스 트랜잭션
**문제**: 여러 DB 작업 시 트랜잭션 없음  
**위치**: 
- `app/api/account/delete/route.ts` - 여러 테이블 삭제
- `app/api/paddle/webhook/route.ts` - 구독 업데이트

**개선 방안**: Supabase 트랜잭션 사용 (가능한 경우)

---

### 9. 입력 길이 제한
**문제**: 일부 입력에 길이 제한이 없음  
**위치**:
- `app/api/account/profile/route.ts` - name 길이 제한 없음
- `app/api/push/subscribe/route.ts` - endpoint 길이 제한 없음

**개선 방안**: 모든 사용자 입력에 적절한 길이 제한 추가

---

## 🟢 낮은 우선순위 (코드 품질)

### 10. 중복 코드
**문제**: 인증 체크 로직이 반복됨  
**위치**: 모든 `/api/account/*` 라우트

**개선 방안**:
```typescript
// lib/middleware.ts
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return session.user;
}
```

---

### 11. 타임아웃 설정
**문제**: 외부 API 호출에 타임아웃 없음  
**위치**:
- `lib/fetchers/*.ts` - EIA, BLS, FRED API 호출
- `lib/paddle.ts` - Paddle API 호출

**개선 방안**: `AbortController`를 사용한 타임아웃 추가

---

### 12. 캐싱 개선
**문제**: 일부 데이터에 캐싱이 없음  
**위치**: 
- `app/api/signal/route.ts` - 신호 데이터는 주간 업데이트이므로 캐싱 가능

**개선 방안**: Next.js 캐싱 또는 Redis 사용

---

### 13. API 응답 형식 일관성
**문제**: API 응답 형식이 일관되지 않음  
**예시**:
- `{ success: true }` vs `{ message: '...' }`
- `{ error: '...' }` vs `{ error: { message: '...' } }`

**개선 방안**: 표준 응답 형식 정의

---

## 📋 구체적인 개선 작업

### 즉시 작업 (1-2시간)

1. **환경 변수 검증 추가**
   - `lib/env.ts` 생성
   - 필수 환경 변수 검증 함수 추가
   - 앱 시작 시 검증

2. **입력 검증 강화**
   - `app/api/account/profile/route.ts` - name 길이 제한
   - `app/api/push/subscribe/route.ts` - endpoint URL 검증
   - 모든 POST API에 JSON 파싱 에러 처리

3. **타입 안정성 개선**
   - `any` 타입을 구체적인 타입으로 변경
   - SessionUser 타입 정의
   - PaddleWebhookData 타입 정의

### 중기 작업 (2-4시간)

4. **Rate Limiting 추가**
   - 모든 사용자 입력 API에 rate limiting 추가
   - 일관된 rate limit 설정

5. **에러 메시지 표준화**
   - 에러 메시지 상수 정의
   - 일관된 에러 응답 형식

6. **로깅 개선**
   - 구조화된 로깅 시스템
   - 민감한 정보 필터링
   - 프로덕션 로깅 설정

### 장기 작업 (선택사항)

7. **데이터베이스 트랜잭션**
   - Supabase 트랜잭션 사용
   - 에러 롤백 처리

8. **캐싱 개선**
   - 신호 데이터 캐싱
   - Redis 도입 검토

9. **API 문서화**
   - OpenAPI/Swagger 스펙 추가
   - API 엔드포인트 문서화

---

## ✅ 체크리스트

### 보안
- [ ] 환경 변수 검증 추가
- [ ] 입력 검증 강화
- [ ] Rate limiting 일관성
- [ ] 타입 안정성 개선
- [ ] 민감한 정보 로깅 제거

### 안정성
- [ ] JSON 파싱 에러 처리
- [ ] 타임아웃 설정
- [ ] 트랜잭션 처리
- [ ] 에러 메시지 일관성

### 코드 품질
- [ ] 중복 코드 제거
- [ ] 타입 정의 개선
- [ ] 로깅 개선
- [ ] API 응답 형식 일관성

---

## 💡 우선순위 권장사항

**즉시 작업**:
1. 환경 변수 검증 (보안)
2. 입력 검증 강화 (보안)
3. 타입 안정성 개선 (버그 예방)

**중기 작업**:
4. Rate Limiting 추가 (보안)
5. 에러 메시지 표준화 (사용자 경험)
6. 로깅 개선 (디버깅)

**장기 작업**:
7. 캐싱 개선 (성능)
8. 트랜잭션 처리 (데이터 무결성)
9. API 문서화 (개발자 경험)

---

## 📝 참고 사항

- 현재 코드는 전반적으로 잘 작성되어 있음
- 대부분의 개선 사항은 방어적 프로그래밍과 코드 품질 향상에 초점
- 보안 관련 개선 사항은 우선적으로 처리 권장
- 타입 안정성 개선은 장기적으로 버그를 줄이는 데 도움

