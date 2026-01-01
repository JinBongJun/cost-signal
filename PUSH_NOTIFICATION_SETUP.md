# 푸시 알림 설정 가이드

## 다음 단계: 푸시 알림 테스트 및 완성

---

## 1단계: VAPID 키 생성

### VAPID 키란?
- Web Push 알림을 보내기 위한 공개/비공개 키 쌍
- 한 번만 생성하면 됨
- 브라우저가 알림을 받을 수 있도록 인증하는 데 사용

### 생성 방법

1. **터미널에서 실행:**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **결과 예시:**
   ```
   ========================================
   
   Public Key:
   BKx1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz
   
   Private Key:
   abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
   
   ========================================
   ```

3. **`.env` 파일에 추가:**
   ```env
   # VAPID Keys for Push Notifications
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKx1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz
   VAPID_PRIVATE_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
   VAPID_EMAIL=mailto:your-email@example.com
   ```

   ⚠️ **주의**: 
   - `NEXT_PUBLIC_` 접두사가 있는 것은 클라이언트에서 사용 (공개해도 됨)
   - `VAPID_PRIVATE_KEY`는 절대 공개하지 마세요!

---

## 2단계: 환경 변수 설정

### 로컬 개발 환경

`.env` 파일에 추가:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=여기에_공개키_붙여넣기
VAPID_PRIVATE_KEY=여기에_비공개키_붙여넣기
VAPID_EMAIL=mailto:your-email@example.com
```

### Vercel (Production)

1. Vercel Dashboard → Settings → Environment Variables
2. 다음 변수 추가:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_EMAIL`
3. 재배포

---

## 3단계: 브라우저에서 테스트

### 알림 권한 요청

1. **개발 서버 실행:**
   ```bash
   npm run dev
   ```

2. **브라우저에서 접속:**
   - http://localhost:3000

3. **알림 활성화 버튼 클릭:**
   - "🔔 Enable Weekly Notifications" 버튼 클릭
   - 브라우저 알림 권한 요청 팝업 확인
   - "허용" 클릭

4. **확인:**
   - 버튼이 "🔕 Disable Notifications"로 변경되면 성공

---

## 4단계: 테스트 알림 전송

### 수동 테스트

1. **API 엔드포인트로 테스트:**
   ```bash
   # 알림 전송 테스트 (개발용)
   curl -X POST http://localhost:3000/api/push/test
   ```

2. **또는 코드에서 직접 테스트:**
   - 브라우저 콘솔에서 테스트 함수 실행

---

## 5단계: 주간 업데이트 시 자동 알림

### 확인 사항

1. **주간 업데이트 실행:**
   ```bash
   npm run cron
   ```

2. **알림 전송 확인:**
   - 구독한 사용자에게 자동으로 알림 전송
   - Vercel Logs에서 확인

---

## 문제 해결

### "VAPID keys not configured" 에러

**원인:**
- 환경 변수가 설정되지 않았거나
- 서버가 재시작되지 않았음

**해결:**
1. `.env` 파일에 VAPID 키 추가 확인
2. 개발 서버 재시작
3. Vercel의 경우 환경 변수 추가 후 재배포

---

### 알림이 안 오는 경우

1. **브라우저 알림 권한 확인:**
   - 브라우저 설정 → 알림 → 사이트 권한 확인

2. **서비스 워커 확인:**
   - 브라우저 개발자 도구 → Application → Service Workers

3. **구독 상태 확인:**
   - Supabase에서 `push_subscriptions` 테이블 확인

---

## 완료 ✅

VAPID 키 생성 및 설정이 완료되면:
- ✅ 브라우저에서 알림 권한 요청 가능
- ✅ 테스트 알림 전송 가능
- ✅ 주간 업데이트 시 자동 알림 전송

이제 사용자에게 주간 경제 신호를 알림으로 전달할 수 있습니다! 🎉



