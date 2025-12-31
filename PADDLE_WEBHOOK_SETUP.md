# Paddle Webhook 서명 검증 설정 가이드

## 구현 완료 ✅

Paddle webhook 서명 검증이 구현되었습니다. 이제 실제 Paddle webhook 요청의 진위를 확인할 수 있습니다.

---

## 환경 변수 설정

`.env` 파일에 다음 변수를 추가하세요:

```env
PADDLE_WEBHOOK_SECRET=your_webhook_secret_from_paddle_dashboard
```

**Paddle Dashboard에서 Webhook Secret 찾기:**
1. Paddle Dashboard 로그인
2. Developer Tools → Webhooks
3. Webhook 설정에서 "Signing Secret" 확인

---

## 사용 방법

### 예시: Webhook 엔드포인트 생성

`app/api/webhooks/paddle/route.ts` 파일을 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get raw body as string (important for signature verification)
    const body = await request.text();
    
    // Get Paddle-Signature header
    const signature = request.headers.get('paddle-signature');
    
    // Get webhook secret from environment
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    
    if (!signature || !secret) {
      return NextResponse.json(
        { error: 'Missing signature or secret' },
        { status: 401 }
      );
    }
    
    // Verify signature
    const isValid = verifyWebhookSignature(body, signature, secret);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Parse webhook payload
    const payload = JSON.parse(body);
    
    // Handle webhook event
    switch (payload.event_type) {
      case 'subscription.created':
        // Handle subscription creation
        console.log('Subscription created:', payload.data);
        break;
      case 'subscription.updated':
        // Handle subscription update
        console.log('Subscription updated:', payload.data);
        break;
      case 'subscription.canceled':
        // Handle subscription cancellation
        console.log('Subscription canceled:', payload.data);
        break;
      default:
        console.log('Unknown event type:', payload.event_type);
    }
    
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 보안 기능

### 1. 서명 검증
- HMAC-SHA256을 사용한 서명 검증
- Paddle의 `Paddle-Signature` 헤더 파싱
- `ts:<timestamp>;h1:<signature>` 형식 지원

### 2. Replay Attack 방지
- 타임스탬프 검증 (5분 허용 범위)
- 오래된 요청 또는 미래의 요청 거부

### 3. Timing Attack 방지
- `crypto.timingSafeEqual` 사용
- 상수 시간 비교로 타이밍 공격 방지

---

## Paddle Dashboard 설정

1. **Webhook URL 설정:**
   - Production: `https://your-domain.com/api/webhooks/paddle`
   - Development: `https://your-ngrok-url.ngrok.io/api/webhooks/paddle`

2. **Webhook Secret 복사:**
   - Developer Tools → Webhooks → Signing Secret
   - `.env` 파일에 `PADDLE_WEBHOOK_SECRET`로 설정

3. **이벤트 선택:**
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - 기타 필요한 이벤트

---

## 테스트

### 로컬 테스트 (ngrok 사용)

1. **ngrok 설치 및 실행:**
   ```bash
   ngrok http 3000
   ```

2. **Paddle Dashboard에서 webhook URL 설정:**
   - `https://your-ngrok-url.ngrok.io/api/webhooks/paddle`

3. **테스트 이벤트 전송:**
   - Paddle Dashboard에서 "Send test event" 클릭

---

## 주의사항

1. **Raw Body 필요:**
   - Next.js에서 raw body를 받으려면 `request.text()` 사용
   - JSON 파싱은 서명 검증 **후**에 수행

2. **환경 변수 보안:**
   - `.env` 파일을 `.gitignore`에 추가
   - Production에서는 Vercel 환경 변수로 설정

3. **에러 처리:**
   - 서명 검증 실패 시 401 반환
   - 처리 성공 시 항상 200 반환 (Paddle 재시도 방지)

---

## 구현 세부사항

### 서명 형식
```
Paddle-Signature: ts=1234567890;h1=abc123def456...
```

### 검증 과정
1. `Paddle-Signature` 헤더에서 `ts`와 `h1` 추출
2. 타임스탬프 유효성 검사 (5분 이내)
3. `ts:body` 형식으로 서명 생성
4. HMAC-SHA256으로 서명 계산
5. 제공된 서명과 비교 (timing-safe)

---

## 완료 ✅

이제 Paddle webhook 요청이 실제로 Paddle에서 온 것인지 안전하게 확인할 수 있습니다!


