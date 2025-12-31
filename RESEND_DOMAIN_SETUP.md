# Resend 도메인 인증 가이드

## 문제 상황

`onboarding@resend.dev` 테스트 도메인은 Resend 계정에 등록된 이메일 주소로만 이메일을 보낼 수 있습니다.

**에러 메시지:**
```
You can only send testing emails to your own email address (bongjun0289@daum.net). 
To send emails to other recipients, please verify a domain at resend.com/domains
```

## 해결 방법: 도메인 인증

### 1. 도메인 구매 (아직 없다면)

추천 도메인 등록 서비스:
- **Namecheap**: https://www.namecheap.com (저렴하고 사용하기 쉬움)
- **Google Domains**: https://domains.google
- **Cloudflare**: https://www.cloudflare.com/products/registrar

도메인 가격: 보통 $10-15/년 (약 1만원)

### 2. Resend에서 도메인 추가

1. https://resend.com/domains 접속
2. "Add Domain" 클릭
3. 도메인 입력 (예: `costsignal.com`)
4. DNS 레코드 복사

### 3. DNS 레코드 추가

도메인 등록 서비스의 DNS 설정에서 다음 레코드 추가:

#### SPF 레코드 (TXT)
```
Type: TXT
Name: @ (또는 루트 도메인)
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

#### DKIM 레코드 (TXT)
Resend에서 제공하는 DKIM 레코드를 복사해서 추가:
```
Type: TXT
Name: resend._domainkey (또는 Resend에서 제공하는 이름)
Value: (Resend에서 제공하는 값)
TTL: 3600
```

#### DMARC 레코드 (TXT) - 선택사항
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:your-email@yourdomain.com
TTL: 3600
```

### 4. DNS 전파 대기

- DNS 변경사항이 전파되기까지 **최대 24시간** 소요
- 보통 1-2시간 내에 완료됨
- https://dnschecker.org 에서 확인 가능

### 5. Resend에서 도메인 인증 확인

1. Resend 대시보드 → Domains
2. 도메인 옆에 "Verify" 버튼 클릭
3. 모든 레코드가 확인되면 "Verified" 상태로 변경

### 6. 환경 변수 업데이트

도메인 인증 완료 후:

**Vercel 환경 변수:**
```
RESEND_FROM_EMAIL=Cost Signal <noreply@yourdomain.com>
```

**로컬 .env:**
```env
RESEND_FROM_EMAIL=Cost Signal <noreply@yourdomain.com>
```

## 임시 해결책 (테스트용)

도메인을 구매하기 전까지는:
- 테스트는 `bongjun0289@daum.net`으로만 가능
- 프로덕션에서는 도메인 인증 필수

## 비용

- **도메인**: $10-15/년 (약 1만원)
- **Resend**: 무료 티어 (월 3,000개 이메일, 일 100개)

## 참고

- 도메인 인증 후에는 모든 이메일 주소로 전송 가능
- 스팸 필터링도 개선됨
- 프로덕션 환경에서는 반드시 도메인 인증 필요


