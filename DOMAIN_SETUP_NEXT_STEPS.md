# 도메인 구매 완료! 다음 단계 가이드

`cost-signal.com` 도메인 구매를 완료하셨습니다. 이제 다음 단계를 진행하세요.

## ✅ 완료된 단계
- [x] Cloudflare에서 도메인 구매 완료
- [x] 도메인: `cost-signal.com`
- [x] 만료일: 2027년 1월 1일
- [x] 자동 갱신 설정됨

---

## 📋 다음 단계 체크리스트

### 1단계: Vercel에 도메인 연결 (2분)
- [ ] Vercel 대시보드 접속
- [ ] Settings → Domains
- [ ] `cost-signal.com` 추가

### 2단계: Cloudflare DNS 설정 (5분)
- [ ] Cloudflare → DNS → Add record
- [ ] CNAME 레코드 추가

### 3단계: Resend 도메인 인증 (10분)
- [ ] Resend 대시보드 → Domains
- [ ] `cost-signal.com` 추가
- [ ] DNS 레코드 설정

### 4단계: 환경 변수 업데이트 (5분)
- [ ] Vercel 환경 변수 업데이트
- [ ] 재배포

### 5단계: 외부 서비스 업데이트 (5분)
- [ ] Google OAuth 콜백 URL
- [ ] Paddle 웹훅 URL

---

## 🚀 단계별 상세 가이드

### 1단계: Vercel에 도메인 연결

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - `cost-signal` 프로젝트 선택

2. **Settings → Domains 클릭**

3. **"Add Domain" 버튼 클릭**

4. **도메인 입력**
   - `cost-signal.com` 입력
   - **"Add"** 클릭

5. **DNS 설정 안내 확인**
   - Vercel이 필요한 DNS 레코드를 안내합니다
   - 다음 단계에서 Cloudflare에 추가할 예정

---

### 2단계: Cloudflare DNS 설정

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com
   - `cost-signal.com` 도메인 선택

2. **DNS 탭 클릭**

3. **CNAME 레코드 추가**
   - **"Add record"** 버튼 클릭
   - 다음 정보 입력:
     ```
     Type: CNAME
     Name: @
     Target: cname.vercel-dns.com
     Proxy status: Proxied (주황색 구름)
     TTL: Auto
     ```
   - **"Save"** 클릭

4. **www 서브도메인 추가 (선택사항)**
   - **"Add record"** 버튼 클릭
   - 다음 정보 입력:
     ```
     Type: CNAME
     Name: www
     Target: cname.vercel-dns.com
     Proxy status: Proxied (주황색 구름)
     TTL: Auto
     ```
   - **"Save"** 클릭

5. **SSL 인증서 확인**
   - Cloudflare가 자동으로 SSL 인증서를 발급합니다
   - 몇 분에서 몇 시간 소요될 수 있습니다

---

### 3단계: Resend 도메인 인증

1. **Resend 대시보드 접속**
   - https://resend.com/domains
   - 로그인

2. **"Add Domain" 버튼 클릭**

3. **도메인 입력**
   - `cost-signal.com` 입력
   - **"Add"** 클릭

4. **DNS 레코드 확인**
   - Resend가 필요한 DNS 레코드를 표시합니다:
     - **SPF 레코드**
     - **DKIM 레코드** (여러 개)

5. **Cloudflare에 DNS 레코드 추가**

   #### SPF 레코드
   ```
   Type: TXT
   Name: @
   Content: v=spf1 include:resend.com ~all
   TTL: Auto
   ```

   #### DKIM 레코드 (Resend가 제공하는 값 사용)
   ```
   Type: TXT
   Name: [Resend가 제공하는 이름, 예: resend._domainkey]
   Content: [Resend가 제공하는 긴 문자열]
   TTL: Auto
   ```

6. **레코드 추가 방법**
   - Cloudflare → DNS → Add record
   - 위의 정보 입력
   - **"Save"** 클릭
   - 모든 DKIM 레코드 추가 (보통 2-3개)

7. **도메인 인증 확인**
   - Resend 대시보드로 돌아가기
   - **"Verify"** 버튼 클릭
   - 인증 완료 대기 (보통 몇 분~몇 시간)

---

### 4단계: 환경 변수 업데이트

1. **Vercel 대시보드 접속**
   - Settings → Environment Variables

2. **환경 변수 추가/수정**

   다음 변수들을 추가하거나 수정:

   ```env
   NEXT_PUBLIC_APP_URL=https://cost-signal.com
   NEXTAUTH_URL=https://cost-signal.com
   RESEND_FROM_EMAIL=Cost Signal <noreply@cost-signal.com>
   ```

3. **변수 추가 방법**
   - **"Add New"** 클릭
   - Key와 Value 입력
   - Environment 선택:
     - ✅ Production
     - ✅ Preview (선택)
     - ✅ Development (선택)
   - **"Save"** 클릭

4. **재배포**
   - 환경 변수 변경 후 자동으로 재배포되거나
   - 수동으로 재배포 필요할 수 있음

---

### 5단계: 외부 서비스 업데이트

#### Google Cloud Console (OAuth)

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com
   - APIs & Services → Credentials

2. **OAuth 2.0 Client ID 선택**

3. **"승인된 리디렉션 URI"에 추가**
   ```
   https://cost-signal.com/api/auth/callback/google
   ```

4. **"저장"** 클릭

#### Paddle 대시보드 (웹훅)

1. **Paddle 대시보드 접속**
   - https://vendors.paddle.com
   - Developer Tools → Notifications

2. **Notification URL 확인/업데이트**
   ```
   https://cost-signal.com/api/paddle/webhook
   ```

---

## ✅ 완료 확인

모든 단계를 완료한 후:

1. **사이트 접속 확인**
   - `https://cost-signal.com` 접속
   - 사이트가 정상적으로 로드되는지 확인
   - SSL 인증서 확인 (자물쇠 아이콘)

2. **이메일 전송 테스트**
   - 비밀번호 재설정 기능 테스트
   - Resend 대시보드에서 전송 로그 확인

3. **OAuth 로그인 테스트**
   - Google 로그인 테스트
   - 콜백 URL이 정상 작동하는지 확인

4. **결제 플로우 테스트**
   - Paddle 결제 테스트
   - 웹훅이 정상 작동하는지 확인

---

## ⏱️ 예상 소요 시간

- Vercel 연결: 2분
- DNS 설정: 5분
- Resend 인증: 10분 (DNS 설정)
- 환경 변수: 5분
- 외부 서비스: 5분

**총: 약 30분** (DNS 전파 대기 시간 제외)

---

## ❓ 문제 해결

### DNS가 전파되지 않나요?
- 몇 시간 기다려보세요 (최대 24-48시간)
- Cloudflare DNS는 보통 빠르게 전파됩니다 (몇 분~1시간)

### SSL 인증서가 발급되지 않나요?
- Cloudflare와 Vercel 모두 자동으로 SSL을 처리합니다
- DNS 전파 후 자동으로 발급됩니다

### Resend 인증이 실패하나요?
- DNS 레코드가 정확한지 확인
- 몇 시간 기다려보세요
- Resend 대시보드에서 에러 메시지 확인

---

## 📚 관련 문서

- `CLOUDFLARE_DOMAIN_SETUP_STEPS.md`: 상세한 단계별 가이드
- `DOMAIN_REQUIREMENTS_ANALYSIS.md`: 도메인이 필요한 기능 분석
- `RESEND_SETUP.md`: Resend 상세 설정 가이드

