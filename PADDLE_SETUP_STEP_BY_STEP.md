# Paddle 설정 단계별 가이드

> **목표**: Paddle 결제 시스템 완전 설정 및 테스트

---

## 📋 체크리스트

- [ ] 1단계: Paddle 계정 확인/생성
- [ ] 2단계: Product 생성
- [ ] 3단계: Price IDs 확인 및 복사
- [ ] 4단계: API Key 확인
- [ ] 5단계: Webhook 설정
- [ ] 6단계: Vercel 환경 변수 설정
- [ ] 7단계: 테스트 결제

---

## 1단계: Paddle 계정 확인/생성

### 1.1 Paddle Dashboard 접속
1. https://vendors.paddle.com 접속
2. 로그인 (또는 계정 생성)

### 1.2 계정 상태 확인
- [ ] 계정 활성화 확인
- [ ] 비즈니스 정보 입력 완료 확인
- [ ] 결제 수신 가능 상태 확인

---

## 2단계: Product 생성

### 2.1 Product 생성
1. **Paddle Dashboard** → **Products** → **Create product**
2. **제품 정보 입력**:
   - **Name**: `Cost Signal Premium`
   - **Type**: `Subscription` (구독형)
   - **Description**: `Weekly economic signal with detailed indicator breakdowns`

3. **Create** 클릭

### 2.2 Product 확인
- [ ] Product가 생성되었는지 확인
- [ ] Product ID 확인 (나중에 필요할 수 있음)

---

## 3단계: Price IDs 생성 및 확인

각 플랜별로 Price를 생성해야 합니다.

### 3.1 Monthly Plan ($4.99/월)

1. **Product 페이지**에서 **"Create price"** 또는 **"Add price"** 클릭
2. **Price 설정**:
   - **Billing cycle**: `Monthly` (월간)
   - **Price**: `4.99`
   - **Currency**: `USD`
   - **Description**: `Monthly subscription`

3. **Create** 클릭
4. **Price ID 복사** (예: `pri_01h...`)
   - Price ID는 나중에 환경 변수에 사용됩니다
   - **중요**: 이 ID를 복사해서 저장하세요!

### 3.2 Yearly Plan ($49.99/년)

1. **같은 Product**에서 **"Create price"** 클릭
2. **Price 설정**:
   - **Billing cycle**: `Yearly` (연간)
   - **Price**: `49.99`
   - **Currency**: `USD`
   - **Description**: `Yearly subscription (save 17%)`

3. **Create** 클릭
4. **Price ID 복사**

### 3.3 Early Bird Plan ($2.99/월) - 선택사항

1. **같은 Product**에서 **"Create price"** 클릭
2. **Price 설정**:
   - **Billing cycle**: `Monthly` (월간)
   - **Price**: `2.99`
   - **Currency**: `USD`
   - **Description**: `Early Bird - Limited time offer`

3. **Create** 클릭
4. **Price ID 복사**

### 3.4 Price IDs 정리

복사한 Price IDs를 정리하세요:

```
Monthly: pri_01h...
Yearly: pri_01h...
Early Bird: pri_01h... (선택)
```

---

## 4단계: API Key 확인

### 4.1 API Key 발급

1. **Paddle Dashboard** → **Developer Tools** → **API Keys**
2. **Sandbox API Key** 확인 (테스트용)
   - 테스트 모드에서 사용
   - 실제 결제 없이 테스트 가능

3. **Production API Key** 확인 (프로덕션용)
   - 실제 결제에 사용
   - 프로덕션 전환 시 사용

### 4.2 API Key 복사

- [ ] Sandbox API Key 복사
- [ ] Production API Key 복사 (나중에 사용)

**중요**: 
- 현재는 **Sandbox 모드**로 테스트
- 프로덕션 전환 시 **Production API Key** 사용

---

## 5단계: Webhook 설정

### 5.1 Webhook URL 설정

1. **Paddle Dashboard** → **Developer Tools** → **Notifications** (또는 **Webhooks**)
2. **"Add notification URL"** 또는 **"Create webhook"** 클릭
3. **Webhook URL 입력**:
   ```
   https://cost-signal.com/api/paddle/webhook
   ```
4. **Events 선택** (다음 이벤트들):
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `transaction.completed`
   - ✅ `transaction.payment_failed`

5. **Save** 또는 **Create** 클릭

### 5.2 Webhook Secret 확인

1. **Webhook 설정 화면**에서 **"Signing Secret"** 또는 **"Webhook Secret"** 찾기
2. **"Reveal"** 또는 **"Show"** 버튼 클릭
3. **Secret 복사** (예: `whsec_abc123...`)
   - **중요**: 이 Secret을 복사해서 저장하세요!

---

## 6단계: Vercel 환경 변수 설정

### 6.1 Vercel Dashboard 접속

1. https://vercel.com 접속
2. 프로젝트 선택 (`cost-signal`)

### 6.2 환경 변수 추가

**Settings** → **Environment Variables** → **Add New**

다음 변수들을 추가하세요:

#### 필수 변수

1. **PADDLE_API_KEY**
   - **Key**: `PADDLE_API_KEY`
   - **Value**: Sandbox API Key (테스트용) 또는 Production API Key
   - **Environment**: Production, Preview, Development 모두

2. **PADDLE_WEBHOOK_SECRET**
   - **Key**: `PADDLE_WEBHOOK_SECRET`
   - **Value**: Webhook Secret (5단계에서 복사한 것)
   - **Environment**: Production, Preview, Development 모두

3. **PADDLE_PRICE_ID_MONTHLY**
   - **Key**: `PADDLE_PRICE_ID_MONTHLY`
   - **Value**: Monthly Plan Price ID (3.1에서 복사한 것)
   - **Environment**: Production, Preview, Development 모두

4. **PADDLE_PRICE_ID_YEARLY**
   - **Key**: `PADDLE_PRICE_ID_YEARLY`
   - **Value**: Yearly Plan Price ID (3.2에서 복사한 것)
   - **Environment**: Production, Preview, Development 모두

5. **PADDLE_PRICE_ID_EARLY_BIRD** (선택)
   - **Key**: `PADDLE_PRICE_ID_EARLY_BIRD`
   - **Value**: Early Bird Plan Price ID (3.3에서 복사한 것)
   - **Environment**: Production, Preview, Development 모두

6. **PADDLE_ENVIRONMENT** (선택)
   - **Key**: `PADDLE_ENVIRONMENT`
   - **Value**: `sandbox` (테스트용) 또는 `production` (프로덕션용)
   - **Environment**: Production, Preview, Development 모두

### 6.3 환경 변수 확인

추가한 환경 변수들:
- [ ] `PADDLE_API_KEY`
- [ ] `PADDLE_WEBHOOK_SECRET`
- [ ] `PADDLE_PRICE_ID_MONTHLY`
- [ ] `PADDLE_PRICE_ID_YEARLY`
- [ ] `PADDLE_PRICE_ID_EARLY_BIRD` (선택)
- [ ] `PADDLE_ENVIRONMENT` (선택)

### 6.4 재배포

환경 변수 추가 후:
- Vercel이 자동으로 재배포하거나
- 수동으로 **Deployments** → **Redeploy** 클릭

---

## 7단계: 테스트 결제

### 7.1 테스트 카드 정보

Paddle Sandbox 모드에서 사용할 수 있는 테스트 카드:

**성공하는 테스트 카드**:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: 미래 날짜 (예: `12/25`)
- **CVV**: `123`
- **Name**: 아무 이름

**실패하는 테스트 카드** (에러 테스트용):
- **Card Number**: `4000 0000 0000 0002` (거부됨)

### 7.2 테스트 플로우

1. **앱 접속**: https://cost-signal.com
2. **로그인**: 테스트 계정으로 로그인
3. **Pricing 페이지**: `/pricing` 접속
4. **플랜 선택**: Monthly, Yearly, 또는 Early Bird 선택
5. **결제 페이지**: Paddle 체크아웃 페이지로 리다이렉트
6. **테스트 카드 입력**: `4242 4242 4242 4242` 입력
7. **결제 완료**: 결제 완료 후 `/pricing/success`로 리다이렉트

### 7.3 확인 사항

- [ ] Checkout 페이지가 정상적으로 열리는지
- [ ] 테스트 카드로 결제가 완료되는지
- [ ] `/pricing/success` 페이지로 리다이렉트되는지
- [ ] Account 페이지에서 구독 상태가 "Active"로 표시되는지
- [ ] Paid 티어 데이터에 접근할 수 있는지

### 7.4 Webhook 확인

1. **Paddle Dashboard** → **Developer Tools** → **Notifications** (또는 **Webhooks**)
2. **Event Log** 확인:
   - `subscription.created` 이벤트 확인
   - `transaction.completed` 이벤트 확인
   - Webhook이 성공적으로 전송되었는지 확인

3. **Vercel Logs** 확인:
   - Vercel Dashboard → **Deployments** → 최신 배포 → **Functions** → **Logs**
   - `/api/paddle/webhook` 로그 확인
   - 에러가 없는지 확인

---

## 8단계: 프로덕션 전환 (나중에)

### 8.1 Production 모드로 전환

1. **Paddle Dashboard**에서 **Production 모드**로 전환
2. **Production API Key** 사용
3. **Production Webhook URL** 설정: `https://cost-signal.com/api/paddle/webhook`
4. **Vercel 환경 변수 업데이트**:
   - `PADDLE_API_KEY` → Production API Key로 변경
   - `PADDLE_ENVIRONMENT` → `production`으로 변경

### 8.2 실제 결제 테스트

1. 실제 카드로 소액 결제 테스트
2. 구독 생성 확인
3. Webhook 수신 확인
4. 구독 취소 테스트

---

## 문제 해결

### "Failed to create checkout session" 에러

**원인**:
- API Key가 잘못되었거나
- Price ID가 잘못되었거나
- Paddle API 연결 문제

**해결**:
1. API Key 확인 (Sandbox/Production 구분)
2. Price ID 확인 (정확히 복사했는지)
3. Paddle Dashboard에서 API 상태 확인

### Webhook이 작동하지 않을 때

**원인**:
- Webhook URL이 잘못되었거나
- Webhook Secret이 잘못되었거나
- 서버에서 Webhook 처리 실패

**해결**:
1. Webhook URL 확인: `https://cost-signal.com/api/paddle/webhook`
2. Webhook Secret 확인 (Vercel 환경 변수)
3. Vercel Logs에서 에러 확인
4. Paddle Dashboard에서 Event Log 확인

### 구독이 생성되지 않을 때

**원인**:
- Webhook이 실패했거나
- 데이터베이스 연결 문제

**해결**:
1. Webhook 로그 확인
2. Supabase 연결 확인
3. 데이터베이스 스키마 확인

---

## 완료 체크리스트

- [ ] Paddle 계정 생성/확인
- [ ] Product 생성
- [ ] 3개 Price 생성 (Monthly, Yearly, Early Bird)
- [ ] Price IDs 복사 및 저장
- [ ] API Key 확인
- [ ] Webhook URL 설정
- [ ] Webhook Secret 복사
- [ ] Vercel 환경 변수 모두 설정
- [ ] 테스트 결제 성공
- [ ] Webhook 수신 확인
- [ ] 구독 상태 확인

---

## 다음 단계

Paddle 설정이 완료되면:
1. ✅ **전체 기능 테스트** (4번)
2. ⚠️ **Sentry 설정** (5번, 선택)

---

## 참고

- **Paddle Dashboard**: https://vendors.paddle.com
- **Paddle API 문서**: https://developer.paddle.com/
- **Webhook 이벤트**: https://developer.paddle.com/webhook-reference/overview

