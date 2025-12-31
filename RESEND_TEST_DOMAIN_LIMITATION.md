# Resend 테스트 도메인 제한 문제 해결

## 문제

Resend의 테스트 도메인(`onboarding@resend.dev`)을 사용할 때:
- ✅ Resend Dashboard에는 "Delivered"로 표시됨
- ❌ 실제로는 Resend 계정 이메일로만 전송됨
- ❌ 다른 이메일 주소로는 전송되지 않음

## 해결 방법

### 방법 1: ADMIN_EMAIL을 Resend 계정 이메일로 설정 (가장 빠름)

`.env` 파일:
```env
ADMIN_EMAIL=bongjun0289@daum.net
```

Vercel 환경 변수:
- `ADMIN_EMAIL` = `bongjun0289@daum.net`

이렇게 하면 즉시 작동합니다.

### 방법 2: Resend에서 도메인 인증 (프로덕션 권장)

1. Resend Dashboard → Domains
2. 도메인 추가 (예: `cost-signal.com`)
3. DNS 레코드 추가 (SPF, DKIM, DMARC)
4. 인증 완료 후 `RESEND_FROM_EMAIL` 변경:
   ```env
   RESEND_FROM_EMAIL=Cost Signal <noreply@cost-signal.com>
   ```

## 현재 상황

- Resend 계정: `bongjun0289@daum.net`
- 현재 `ADMIN_EMAIL`: `bongjun0289@gmail.com` (구글)
- 문제: 테스트 도메인은 daum 이메일로만 전송 가능

## 즉시 해결

`.env`와 Vercel 모두에서:
```env
ADMIN_EMAIL=bongjun0289@daum.net
```

로 변경하면 바로 작동합니다!

