# 피드백 이메일 미수신 문제 해결 가이드

## 체크리스트

### 1. 환경 변수 확인

다음 환경 변수들이 모두 설정되어 있는지 확인하세요:

- ✅ `RESEND_API_KEY` - Resend API 키 (필수)
- ✅ `ADMIN_EMAIL` - 관리자 이메일 주소 (필수)
- ✅ `RESEND_FROM_EMAIL` - 발신 이메일 주소 (선택, 없으면 기본값 사용)

**확인 방법:**
- 로컬: `.env` 파일 확인
- Vercel: Dashboard → Settings → Environment Variables 확인

### 2. Resend API 키 형식 확인

`RESEND_API_KEY`는 `re_`로 시작해야 합니다.

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx  # ✅ 올바른 형식
```

### 3. Resend 도메인 인증 확인

**문제**: Resend의 테스트 도메인(`onboarding@resend.dev`)은 제한이 있습니다.

**해결책**:
1. Resend Dashboard → Domains로 이동
2. 도메인 인증 (예: `cost-signal.com`)
3. DNS 레코드 추가 (SPF, DKIM, DMARC)
4. 인증 완료 후 `RESEND_FROM_EMAIL`을 인증된 도메인으로 변경

**임시 해결책**:
- 테스트 도메인은 자신의 이메일로만 전송 가능
- `ADMIN_EMAIL`을 Resend 계정 이메일과 동일하게 설정

### 4. Vercel 로그 확인

1. Vercel Dashboard → 프로젝트 → Deployments
2. 최신 배포 클릭 → Functions 탭
3. `/api/feedback` 함수 로그 확인

**확인할 로그 메시지:**
- `📧 Attempting to send feedback notification email...`
- `✅ Feedback notification email sent successfully!` (성공)
- `❌ RESEND_API_KEY is not set` (API 키 없음)
- `❌ ADMIN_EMAIL not set` (관리자 이메일 없음)
- `❌ Resend API error:` (Resend API 오류)

### 5. 스팸 폴더 확인

이메일이 스팸 폴더로 이동했을 수 있습니다. 확인해보세요.

### 6. Resend Dashboard 확인

1. Resend Dashboard → Emails로 이동
2. 최근 전송된 이메일 확인
3. 실패한 이메일이 있다면 오류 메시지 확인

## 일반적인 오류 메시지

### "Email service not configured"
- **원인**: `RESEND_API_KEY`가 설정되지 않음
- **해결**: 환경 변수에 `RESEND_API_KEY` 추가

### "Admin email not configured"
- **원인**: `ADMIN_EMAIL`과 `RESEND_FROM_EMAIL` 모두 없음
- **해결**: `ADMIN_EMAIL` 환경 변수 추가

### "You can only send testing emails to your own email address"
- **원인**: Resend 테스트 도메인 사용 중
- **해결**: 도메인 인증 또는 `ADMIN_EMAIL`을 Resend 계정 이메일로 설정

### "Domain not verified"
- **원인**: 발신 도메인이 인증되지 않음
- **해결**: Resend에서 도메인 인증 완료

## 테스트 방법

### 1. 로컬 테스트

```bash
# 환경 변수 확인
echo $RESEND_API_KEY
echo $ADMIN_EMAIL
echo $RESEND_FROM_EMAIL

# 서버 실행
npm run dev

# 피드백 제출 후 터미널 로그 확인
```

### 2. API 직접 테스트

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "general",
    "subject": "Test Feedback",
    "message": "This is a test feedback message"
  }'
```

### 3. Vercel Functions 로그 확인

Vercel Dashboard에서 Functions 로그를 확인하여 상세한 오류 메시지를 확인하세요.

## 빠른 해결 방법

1. **환경 변수 재확인**:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ADMIN_EMAIL=your-email@example.com
   RESEND_FROM_EMAIL=Cost Signal <noreply@yourdomain.com>
   ```

2. **Vercel 재배포**: 환경 변수 추가/수정 후 재배포

3. **Resend Dashboard 확인**: 이메일 전송 상태 확인

4. **로그 확인**: Vercel Functions 로그에서 상세 오류 확인

