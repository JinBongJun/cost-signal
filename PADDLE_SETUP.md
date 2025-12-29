# Paddle 설정 가이드

## 1. Paddle 계정 생성

1. https://vendors.paddle.com 접속
2. "Sign up" 클릭
3. 비즈니스 정보 입력 (한국 주소 가능)
4. 이메일 인증 완료

## 2. Paddle 대시보드 설정

### 2.1 제품 생성
1. 대시보드 → Products → Create product
2. 제품 이름: "Cost Signal Premium"
3. 제품 타입: Subscription

### 2.2 가격 플랜 생성

#### Monthly Plan ($4.99/월)
1. Create price
2. Billing cycle: Monthly
3. Price: $4.99 USD
4. Price ID 복사 (예: `pri_01...`)

#### Yearly Plan ($49.99/년)
1. Create price
2. Billing cycle: Yearly
3. Price: $49.99 USD
4. Price ID 복사

#### Early Bird Plan ($2.99/월) - 선택
1. Create price
2. Billing cycle: Monthly
3. Price: $2.99 USD
4. Price ID 복사

### 2.3 API 키 발급
1. 대시보드 → Developer Tools → API Keys
2. Sandbox API Key 복사 (테스트용)
3. Production API Key 복사 (프로덕션용)

### 2.4 Webhook 설정
1. 대시보드 → Developer Tools → Notifications
2. Add notification URL: `https://yourdomain.com/api/paddle/webhook`
3. Webhook Secret 복사

## 3. 환경 변수 설정

`.env` 파일에 추가:

```env
# Paddle Configuration
PADDLE_API_KEY=your_paddle_api_key_here
PADDLE_ENVIRONMENT=sandbox  # or 'production'
PADDLE_WEBHOOK_SECRET=your_webhook_secret_here

# Paddle Price IDs (from dashboard)
PADDLE_PRICE_ID_MONTHLY=pri_01...
PADDLE_PRICE_ID_YEARLY=pri_01...
PADDLE_PRICE_ID_EARLY_BIRD=pri_01...  # Optional
```

## 4. 테스트

### 4.1 Sandbox 모드
- 테스트 카드: Paddle 대시보드에서 제공
- 실제 결제 없이 테스트 가능

### 4.2 테스트 플로우
1. `/pricing` 페이지 접속
2. 플랜 선택
3. Paddle 체크아웃 페이지로 이동
4. 테스트 카드로 결제
5. Webhook 확인
6. 구독 상태 확인

## 5. 프로덕션 전환

1. Paddle 대시보드에서 Production 모드로 전환
2. Production API Key 사용
3. Production Webhook URL 설정
4. 실제 결제 테스트

## 6. 비용

### Paddle 수수료
- **5% + $0.50** per transaction
- 예: $4.99 결제 → $0.75 수수료

### 예상 비용 (1000명 기준)
- 월 수수료: $750
- 순수익: $4,240/월

## 7. 자동화

### Webhook 자동 처리
- ✅ 구독 생성/업데이트 자동 처리
- ✅ 구독 취소 자동 처리
- ✅ 결제 완료 자동 처리
- ✅ 데이터베이스 자동 업데이트

### 에러 처리
- ✅ Webhook 실패 시 재시도
- ✅ 로깅 및 모니터링
- ✅ 수동 처리 가능

## 8. 문제 해결

### Webhook이 작동하지 않을 때
1. Webhook URL 확인
2. Webhook Secret 확인
3. Paddle 대시보드에서 이벤트 로그 확인
4. 서버 로그 확인

### 결제가 처리되지 않을 때
1. API Key 확인
2. Price ID 확인
3. Sandbox/Production 모드 확인
4. Paddle 대시보드에서 거래 확인

## 9. 다음 단계

1. Paddle 계정 생성
2. 가격 플랜 생성
3. API 키 발급
4. 환경 변수 설정
5. 테스트
6. 프로덕션 전환





