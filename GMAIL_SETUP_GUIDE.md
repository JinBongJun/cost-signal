# Gmail로 피드백 받기 가이드

## 방법 1: Resend 계정 이메일을 Gmail로 변경 (가장 빠름) ⚡

### 단계:

1. **Resend 계정 설정 변경**
   - https://resend.com/settings 접속
   - Account Email을 Gmail로 변경
   - 예: `bongjun0289@gmail.com`

2. **환경 변수 업데이트**

   **로컬 `.env`:**
   ```env
   ADMIN_EMAIL=bongjun0289@gmail.com
   ```

   **Vercel 환경 변수:**
   - `ADMIN_EMAIL` = `bongjun0289@gmail.com`

3. **재배포**
   ```bash
   git add .
   git commit -m "Update ADMIN_EMAIL to Gmail"
   git push origin main
   ```

4. **테스트**
   - 피드백 페이지에서 테스트 메시지 전송
   - Gmail 받은편지함 확인

### ⚠️ 주의사항
- Resend 테스트 도메인(`onboarding@resend.dev`)은 여전히 Resend 계정 이메일로만 전송 가능
- Gmail로 받으려면 Resend 계정 이메일을 Gmail로 변경해야 함

---

## 방법 2: 도메인 인증 (프로덕션 권장) 🚀

도메인을 인증하면 어떤 이메일로도 전송 가능합니다.

### 단계:

1. **도메인 구매** (아직 없다면)
   - Namecheap: https://www.namecheap.com
   - Google Domains: https://domains.google
   - 가격: 약 $10-15/년 (1만원)

2. **Resend에서 도메인 추가**
   - https://resend.com/domains 접속
   - "Add Domain" 클릭
   - 도메인 입력 (예: `costsignal.com`)

3. **DNS 레코드 추가**
   
   도메인 등록 서비스의 DNS 설정에서:
   
   **SPF 레코드 (TXT):**
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:resend.com ~all
   TTL: 3600
   ```
   
   **DKIM 레코드 (TXT):**
   - Resend에서 제공하는 DKIM 레코드 복사해서 추가
   
   **DMARC 레코드 (TXT) - 선택사항:**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:bongjun0289@gmail.com
   TTL: 3600
   ```

4. **DNS 전파 대기**
   - 최대 24시간 (보통 1-2시간)
   - https://dnschecker.org 에서 확인

5. **Resend에서 도메인 인증 확인**
   - Resend 대시보드 → Domains
   - "Verify" 버튼 클릭
   - "Verified" 상태 확인

6. **환경 변수 업데이트**

   **로컬 `.env`:**
   ```env
   RESEND_FROM_EMAIL=Cost Signal <noreply@yourdomain.com>
   ADMIN_EMAIL=bongjun0289@gmail.com
   ```

   **Vercel 환경 변수:**
   - `RESEND_FROM_EMAIL` = `Cost Signal <noreply@yourdomain.com>`
   - `ADMIN_EMAIL` = `bongjun0289@gmail.com`

7. **재배포 및 테스트**

### 장점
- ✅ 어떤 이메일로도 전송 가능
- ✅ 스팸 필터링 개선
- ✅ 프로덕션 환경에 적합
- ✅ 브랜드 이메일 주소 사용 가능

---

## 추천

**즉시 테스트:** 방법 1 (Resend 계정 이메일을 Gmail로 변경)

**장기 운영:** 방법 2 (도메인 인증)

---

## 현재 상황

- Resend 계정: `bongjun0289@daum.net`
- 원하는 수신 이메일: `bongjun0289@gmail.com`
- 문제: 테스트 도메인은 Resend 계정 이메일로만 전송 가능

**해결:** Resend 계정 이메일을 Gmail로 변경하면 즉시 해결됩니다!


