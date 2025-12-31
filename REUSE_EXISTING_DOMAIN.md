# 기존 도메인 재사용 가이드

`modifitai.app` 도메인을 Cost Signal에 재사용하는 방법을 안내합니다.

## 🎯 옵션 1: 서브도메인 사용 (추천) ⭐

### 장점
- 기존 도메인 유지
- 나중에 다른 프로젝트에도 사용 가능
- 비용 절감 (새 도메인 구매 불필요)

### 추천 서브도메인
- `costsignal.modifitai.app`
- `signal.modifitai.app`
- `cost.modifitai.app`

### 설정 방법
1. **Cloudflare DNS 설정**
   - Cloudflare 대시보드 → `modifitai.app` 선택
   - DNS → Records → Add record
   - Type: `CNAME`
   - Name: `costsignal` (또는 원하는 서브도메인)
   - Target: `cname.vercel-dns.com`
   - Proxy: ON (주황색 구름)

2. **Vercel에 도메인 추가**
   - Vercel 대시보드 → Settings → Domains
   - `costsignal.modifitai.app` 입력
   - 자동으로 인증됨

3. **환경 변수 업데이트**
   ```env
   NEXT_PUBLIC_APP_URL=https://costsignal.modifitai.app
   NEXTAUTH_URL=https://costsignal.modifitai.app
   RESEND_FROM_EMAIL=Cost Signal <noreply@modifitai.app>
   ```

---

## 🎯 옵션 2: 루트 도메인 사용

### 장점
- 더 짧고 기억하기 쉬운 URL
- 브랜딩 측면에서 더 깔끔

### 단점
- `modifitai.app`을 다른 용도로 사용할 수 없음
- 기존에 사용 중이면 충돌 가능

### 설정 방법
1. **Cloudflare DNS 설정**
   - Cloudflare 대시보드 → `modifitai.app` 선택
   - DNS → Records
   - 기존 A 레코드 확인/수정
   - 또는 새 A 레코드 추가:
     - Type: `A`
     - Name: `@` (루트 도메인)
     - IPv4 address: Vercel이 제공하는 IP (또는 CNAME 사용)

2. **Vercel에 도메인 추가**
   - Vercel 대시보드 → Settings → Domains
   - `modifitai.app` 입력
   - 자동으로 인증됨

3. **환경 변수 업데이트**
   ```env
   NEXT_PUBLIC_APP_URL=https://modifitai.app
   NEXTAUTH_URL=https://modifitai.app
   RESEND_FROM_EMAIL=Cost Signal <noreply@modifitai.app>
   ```

---

## 📋 단계별 설정 가이드

### 1단계: Cloudflare DNS 확인

1. Cloudflare 대시보드 접속
2. `modifitai.app` 도메인 선택
3. **DNS** 탭 클릭
4. 현재 DNS 레코드 확인

### 2단계: Vercel에 도메인 추가

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - `cost-signal` 프로젝트 선택

2. **Settings → Domains 클릭**

3. **"Add Domain" 버튼 클릭**

4. **도메인 입력**
   - 서브도메인: `costsignal.modifitai.app`
   - 또는 루트: `modifitai.app`

5. **DNS 설정 안내 확인**
   - Vercel이 필요한 DNS 레코드를 안내합니다

### 3단계: Cloudflare DNS 레코드 추가

#### 서브도메인 사용 시 (추천)
```
Type: CNAME
Name: costsignal (또는 원하는 서브도메인)
Target: cname.vercel-dns.com
Proxy status: Proxied (주황색 구름)
TTL: Auto
```

#### 루트 도메인 사용 시
Vercel이 제공하는 방법 중 하나 선택:

**방법 A: CNAME (추천)**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: Proxied
```

**방법 B: A 레코드**
```
Type: A
Name: @
IPv4 address: 76.76.21.21 (Vercel IP)
Proxy status: Proxied
```

### 4단계: SSL 인증서 확인

- Cloudflare와 Vercel 모두 SSL을 자동으로 처리합니다
- 몇 분에서 몇 시간 소요될 수 있습니다
- `https://yourdomain.com` 접속하여 확인

---

## 🔧 Resend 이메일 설정

### 도메인 인증 (필수)

1. **Resend 대시보드 접속**
   - https://resend.com/domains

2. **"Add Domain" 클릭**

3. **도메인 입력**
   - `modifitai.app` (루트 도메인)

4. **DNS 레코드 추가**
   - Resend가 제공하는 SPF, DKIM 레코드를 Cloudflare DNS에 추가
   - Cloudflare → DNS → Records → Add record

5. **인증 완료 대기**
   - 보통 몇 분~몇 시간 소요

6. **환경 변수 업데이트**
   ```env
   RESEND_FROM_EMAIL=Cost Signal <noreply@modifitai.app>
   ```

---

## ✅ 체크리스트

### DNS 설정
- [ ] Cloudflare에서 DNS 레코드 추가
- [ ] Vercel에서 도메인 추가
- [ ] SSL 인증서 발급 확인 (자동)

### Resend 설정
- [ ] Resend에 `modifitai.app` 도메인 추가
- [ ] SPF 레코드 추가
- [ ] DKIM 레코드 추가
- [ ] 도메인 인증 완료 확인

### 환경 변수
- [ ] Vercel 환경 변수 업데이트
  - `NEXT_PUBLIC_APP_URL`
  - `NEXTAUTH_URL`
  - `RESEND_FROM_EMAIL`

### 외부 서비스 업데이트
- [ ] Google Cloud Console (OAuth 콜백 URL)
- [ ] Paddle 대시보드 (웹훅 URL)

---

## 💡 추천 사항

### 서브도메인 사용을 추천하는 이유

1. **유연성**: 나중에 다른 프로젝트에도 도메인 사용 가능
2. **명확성**: `costsignal.modifitai.app`이 더 명확한 브랜딩
3. **확장성**: 여러 서비스에 같은 도메인 사용 가능

### 루트 도메인 사용을 고려할 때

- `modifitai.app`을 더 이상 사용하지 않을 때
- Cost Signal이 메인 프로젝트일 때
- 더 짧은 URL이 중요할 때

---

## 🚀 빠른 시작 (서브도메인)

1. **Cloudflare DNS 설정** (5분)
   - `costsignal.modifitai.app` CNAME 레코드 추가

2. **Vercel 도메인 추가** (2분)
   - `costsignal.modifitai.app` 입력

3. **환경 변수 업데이트** (2분)
   - Vercel 대시보드에서 업데이트

4. **Resend 도메인 인증** (10분)
   - `modifitai.app` 도메인 추가 및 DNS 설정

**총 소요 시간: 약 20분**

---

## ❓ 자주 묻는 질문

### Q1: 서브도메인과 루트 도메인 중 어떤 게 좋나요?
**A:** 서브도메인을 추천합니다. 더 유연하고 확장 가능합니다.

### Q2: 기존 DNS 레코드와 충돌하나요?
**A:** 서브도메인을 사용하면 충돌하지 않습니다. 루트 도메인을 사용할 때만 기존 설정을 확인해야 합니다.

### Q3: Resend는 루트 도메인만 인증하나요?
**A:** 네, Resend는 루트 도메인(`modifitai.app`)을 인증하면 서브도메인도 사용할 수 있습니다.

### Q4: SSL 인증서는 자동으로 발급되나요?
**A:** 네, Cloudflare와 Vercel 모두 자동으로 SSL을 처리합니다.

---

## 📚 관련 문서

- `DOMAIN_SETUP.md`: 일반적인 도메인 설정 가이드
- `DOMAIN_REQUIREMENTS_ANALYSIS.md`: 도메인이 필요한 기능 분석
- `RESEND_SETUP.md`: Resend 상세 설정 가이드

