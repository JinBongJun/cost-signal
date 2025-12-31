# Cloudflare 도메인 구매 및 설정 단계별 가이드

Cost Signal을 위한 새 도메인을 Cloudflare에서 구매하고 설정하는 완전한 가이드입니다.

## 🎯 목표

- Cloudflare에서 `costsignal.com` (또는 원하는 도메인) 구매
- Vercel에 도메인 연결
- Resend에 도메인 인증
- 환경 변수 업데이트

---

## 1단계: Cloudflare에서 도메인 구매

### 1-1. Cloudflare 대시보드 접속
1. https://dash.cloudflare.com 접속
2. 로그인 (이미 로그인되어 있을 수 있음)

### 1-2. 도메인 구매 메뉴로 이동
**방법 A: 대시보드에서**
1. 왼쪽 사이드바에서 **"도메인 등록"** (Domain Registration) 클릭
2. 또는 상단의 **"도메인 구매"** (Buy Domain) 버튼 클릭

**방법 B: 직접 링크**
- https://dash.cloudflare.com/registrar/search

### 1-3. 도메인 검색
1. 검색창에 원하는 도메인 이름 입력:
   - `costsignal` (추천)
   - `cost-signal`
   - `costsignal-app`
2. **"검색"** (Search) 버튼 클릭

### 1-4. 도메인 선택
1. 사용 가능한 도메인 목록 확인
2. 확장자 선택:
   - **`.com`** (추천, ~$8-10/년)
   - `.app` (~$15-20/년)
   - `.io` (~$30-35/년)
3. 원하는 도메인 옆의 **"구매"** (Buy) 또는 **"장바구니에 추가"** 클릭

### 1-5. 결제 정보 입력
1. 결제 정보 입력:
   - 신용카드 또는 PayPal
2. 구매 확인
3. **"구매 완료"** (Complete Purchase) 클릭

### 1-6. 구매 완료 확인
- 도메인이 Cloudflare 계정에 자동으로 추가됨
- 이메일로 확인서 수신
- DNS 설정은 자동으로 Cloudflare에서 관리됨

**예상 소요 시간: 5-10분**

---

## 2단계: Vercel에 도메인 연결

### 2-1. Vercel 대시보드 접속
1. https://vercel.com/dashboard 접속
2. `cost-signal` 프로젝트 선택

### 2-2. 도메인 추가
1. **Settings** 탭 클릭
2. **Domains** 메뉴 클릭
3. **"Add Domain"** 버튼 클릭

### 2-3. 도메인 입력
1. 구매한 도메인 입력:
   - `costsignal.com` (루트 도메인)
   - 또는 `www.costsignal.com` (www 서브도메인)
2. **"Add"** 클릭

### 2-4. DNS 설정 안내 확인
- Vercel이 필요한 DNS 레코드를 안내합니다
- 다음 단계에서 Cloudflare에 추가할 예정

**예상 소요 시간: 2분**

---

## 3단계: Cloudflare DNS 설정

### 3-1. Cloudflare DNS 페이지로 이동
1. Cloudflare 대시보드에서 구매한 도메인 클릭
2. **DNS** 탭 클릭

### 3-2. DNS 레코드 추가

#### 루트 도메인 사용 시 (예: `costsignal.com`)

**방법 A: CNAME 사용 (추천)**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: Proxied (주황색 구름)
TTL: Auto
```

**방법 B: A 레코드 사용**
```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: Proxied (주황색 구름)
TTL: Auto
```

#### www 서브도메인 사용 시 (예: `www.costsignal.com`)
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied (주황색 구름)
TTL: Auto
```

### 3-3. 레코드 추가
1. **"Add record"** 버튼 클릭
2. 위의 정보 입력
3. **"Save"** 클릭

### 3-4. SSL 인증서 확인
- Cloudflare가 자동으로 SSL 인증서를 발급합니다
- 몇 분에서 몇 시간 소요될 수 있습니다
- **SSL/TLS** 탭에서 확인 가능

**예상 소요 시간: 5분 (DNS 전파는 몇 분~몇 시간)**

---

## 4단계: Vercel 도메인 인증 확인

### 4-1. Vercel 대시보드 확인
1. Vercel → Settings → Domains
2. 도메인 상태 확인:
   - ✅ **Valid**: 정상 연결됨
   - ⏳ **Pending**: DNS 전파 대기 중

### 4-2. 사이트 접속 확인
1. 브라우저에서 `https://costsignal.com` 접속
2. 사이트가 정상적으로 로드되는지 확인
3. SSL 인증서가 정상인지 확인 (자물쇠 아이콘)

**예상 소요 시간: DNS 전파 대기 (보통 몇 분~몇 시간)**

---

## 5단계: Resend에 도메인 인증

### 5-1. Resend 대시보드 접속
1. https://resend.com/domains 접속
2. 로그인

### 5-2. 도메인 추가
1. **"Add Domain"** 버튼 클릭
2. 도메인 입력: `costsignal.com` (루트 도메인)
3. **"Add"** 클릭

### 5-3. DNS 레코드 확인
- Resend가 필요한 DNS 레코드를 표시합니다:
  - **SPF 레코드**
  - **DKIM 레코드** (여러 개)

### 5-4. Cloudflare에 DNS 레코드 추가

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

### 5-5. 레코드 추가 방법
1. Cloudflare → DNS → Add record
2. 위의 정보 입력
3. **"Save"** 클릭
4. 모든 DKIM 레코드 추가 (보통 2-3개)

### 5-6. 도메인 인증 확인
1. Resend 대시보드로 돌아가기
2. **"Verify"** 버튼 클릭
3. 인증 완료 대기 (보통 몇 분~몇 시간)

**예상 소요 시간: 10분 (DNS 설정) + 인증 대기 (몇 분~몇 시간)**

---

## 6단계: 환경 변수 업데이트

### 6-1. Vercel 환경 변수 업데이트
1. Vercel 대시보드 → Settings → Environment Variables
2. 다음 변수들을 추가/수정:

```env
NEXT_PUBLIC_APP_URL=https://costsignal.com
NEXTAUTH_URL=https://costsignal.com
RESEND_FROM_EMAIL=Cost Signal <noreply@costsignal.com>
```

### 6-2. 변수 추가 방법
1. **"Add New"** 클릭
2. Key와 Value 입력
3. Environment 선택:
   - Production
   - Preview (선택)
   - Development (선택)
4. **"Save"** 클릭

### 6-3. 재배포
- 환경 변수 변경 후 자동으로 재배포되거나
- 수동으로 재배포 필요할 수 있음

**예상 소요 시간: 5분**

---

## 7단계: 외부 서비스 업데이트

### 7-1. Google Cloud Console (OAuth)
1. https://console.cloud.google.com 접속
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID 선택
4. **"승인된 리디렉션 URI"**에 추가:
   ```
   https://costsignal.com/api/auth/callback/google
   ```
5. **"저장"** 클릭

### 7-2. Paddle 대시보드 (웹훅)
1. https://vendors.paddle.com 접속
2. Developer Tools → Notifications
3. Notification URL 확인/업데이트:
   ```
   https://costsignal.com/api/paddle/webhook
   ```

**예상 소요 시간: 5분**

---

## ✅ 완료 체크리스트

### 도메인 구매
- [ ] Cloudflare에서 도메인 구매 완료
- [ ] 도메인이 Cloudflare 계정에 표시됨

### Vercel 연결
- [ ] Vercel에 도메인 추가
- [ ] DNS 레코드 설정 완료
- [ ] `https://costsignal.com` 접속 확인

### Resend 인증
- [ ] Resend에 도메인 추가
- [ ] SPF 레코드 추가
- [ ] DKIM 레코드 추가
- [ ] 도메인 인증 완료

### 환경 변수
- [ ] `NEXT_PUBLIC_APP_URL` 업데이트
- [ ] `NEXTAUTH_URL` 업데이트
- [ ] `RESEND_FROM_EMAIL` 업데이트
- [ ] 재배포 완료

### 외부 서비스
- [ ] Google OAuth 콜백 URL 업데이트
- [ ] Paddle 웹훅 URL 확인

---

## 🚀 예상 총 소요 시간

- 도메인 구매: 5-10분
- Vercel 연결: 2분
- DNS 설정: 5분
- Resend 인증: 10분 (DNS 설정)
- 환경 변수: 5분
- 외부 서비스: 5분

**총: 약 30-40분** (DNS 전파 대기 시간 제외)

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

## 📚 다음 단계

도메인 설정이 완료되면:

1. ✅ 이메일 전송 기능 테스트 (비밀번호 재설정)
2. ✅ Google OAuth 로그인 테스트
3. ✅ Paddle 결제 플로우 테스트
4. ✅ 프로덕션 배포 확인

---

## 💡 팁

- DNS 전파는 보통 빠르지만, 최대 24-48시간까지 걸릴 수 있습니다
- Cloudflare의 Proxy 기능(주황색 구름)을 켜두면 DDoS 보호를 받을 수 있습니다
- Resend 인증은 DNS 전파 후에도 몇 시간 걸릴 수 있습니다

