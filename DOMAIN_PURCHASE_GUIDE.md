# 도메인 구매 및 설정 가이드

이 가이드는 Cost Signal을 위한 도메인을 구매하고 설정하는 방법을 단계별로 설명합니다.

## 🎯 도메인 선택

### 추천 도메인 이름
- `costsignal.com` (가장 직관적)
- `cost-signal.com` (하이픈 포함)
- `costsignal.io` (기술 스타트업 느낌)
- `costsignal.app` (앱 서비스 느낌)

### 도메인 확장자 (.com, .io, .app 등)
- **`.com`**: 가장 일반적, 신뢰도 높음, 비싸지만 권장
- **`.io`**: 기술 스타트업에 인기, 상대적으로 저렴
- **`.app`**: 앱 서비스에 적합, Google에서 관리
- **`.co`**: 짧고 기억하기 쉬움

---

## 🛒 도메인 구매 방법

### 옵션 1: Namecheap (추천) ⭐

#### 장점
- 저렴한 가격 ($10-15/년)
- 무료 WHOIS 보호
- 사용하기 쉬운 인터페이스
- DNS 관리 용이

#### 구매 단계
1. **Namecheap 접속**: https://www.namecheap.com
2. **도메인 검색**: 원하는 도메인 이름 입력 (예: `costsignal`)
3. **가격 확인**: `.com` 도메인은 보통 $10-15/년
4. **장바구니 추가**: 원하는 도메인 선택
5. **계정 생성/로그인**: Namecheap 계정 필요
6. **결제**: 신용카드 또는 PayPal
7. **구매 완료**: 이메일로 확인서 수신

#### 가격 예시
- `.com`: ~$12-15/년
- `.io`: ~$30-40/년
- `.app`: ~$15-20/년

---

### 옵션 2: Google Domains (현재 Squarespace로 이전됨)

#### 참고
- Google Domains는 2023년 Squarespace로 판매됨
- 기존 Google Domains 사용자는 Squarespace로 이전됨
- 새로운 구매는 Squarespace에서 가능

#### Squarespace Domains
- **접속**: https://www.squarespace.com/domains
- **가격**: Google Domains와 유사
- **인터페이스**: Google Domains와 유사하게 유지

---

### 옵션 3: Cloudflare (가장 저렴) 💰

#### 장점
- **가장 저렴한 가격** (도메인 등록 비용만, 마진 없음)
- 무료 DNS 서비스
- 빠른 DNS 전파
- DDoS 보호 포함

#### 단점
- 도메인 구매만 가능 (이전은 제한적)
- 초보자에게는 다소 복잡할 수 있음

#### 구매 단계
1. **Cloudflare 접속**: https://www.cloudflare.com
2. **계정 생성**: 무료 계정 생성
3. **Domains → Register Domain**: 도메인 등록 메뉴
4. **도메인 검색 및 구매**: 원하는 도메인 선택
5. **결제**: 신용카드 또는 PayPal

#### 가격 예시
- `.com`: ~$8-10/년 (다른 곳보다 저렴!)
- `.io`: ~$30-35/년

---

### 옵션 4: GoDaddy (인기 있지만 비쌈)

#### 장점
- 가장 유명한 도메인 등록업체
- 다양한 프로모션

#### 단점
- 상대적으로 비쌈
- 추가 서비스 판매 압력
- WHOIS 보호 유료

#### 가격 예시
- `.com`: ~$15-20/년 (프로모션 시 저렴)

---

## 💡 추천 순서

1. **Cloudflare** (가장 저렴, 기술적)
2. **Namecheap** (저렴, 사용하기 쉬움)
3. **Squarespace Domains** (Google Domains 이전 사용자)
4. **GoDaddy** (유명하지만 비쌈)

---

## 📋 도메인 구매 체크리스트

구매 전 확인 사항:
- [ ] 도메인 이름이 사용 가능한지 확인
- [ ] 연간 비용 확인 (갱신 비용 포함)
- [ ] WHOIS 보호 포함 여부 확인
- [ ] DNS 관리 가능 여부 확인
- [ ] 이메일 전달 서비스 포함 여부 확인 (필요 시)

---

## 🔧 도메인 구매 후 다음 단계

도메인을 구매한 후에는 다음 작업이 필요합니다:

### 1. Vercel에 도메인 연결
- Vercel 대시보드 → 프로젝트 → Settings → Domains
- 도메인 추가 및 DNS 설정

### 2. Resend에 도메인 인증
- Resend 대시보드 → Domains → Add Domain
- DNS 레코드 설정 (SPF, DKIM)

### 3. 환경 변수 업데이트
- Vercel 환경 변수 업데이트
- `NEXT_PUBLIC_APP_URL` 변경
- `RESEND_FROM_EMAIL` 변경

자세한 내용은 `DOMAIN_SETUP.md`를 참고하세요.

---

## 💰 예상 비용

### 도메인 구매
- `.com` 도메인: **$8-20/년** (업체에 따라 다름)
- Cloudflare: ~$8-10/년 (가장 저렴)
- Namecheap: ~$12-15/년
- GoDaddy: ~$15-20/년

### 추가 비용
- WHOIS 보호: 대부분 무료 (Namecheap, Cloudflare)
- DNS 서비스: 무료 (대부분의 업체)
- 이메일 서비스: 별도 (Resend 사용 중이므로 불필요)

### 총 예상 비용
- **연간 약 $10-20** (도메인만)

---

## 🚀 빠른 시작 가이드

### 가장 빠른 방법 (Cloudflare)

1. **Cloudflare 계정 생성** (5분)
   - https://www.cloudflare.com 접속
   - 무료 계정 생성

2. **도메인 검색 및 구매** (5분)
   - Domains → Register Domain
   - 원하는 도메인 검색
   - 구매 및 결제

3. **DNS 설정** (10분)
   - Cloudflare에서 DNS 레코드 확인
   - Vercel에 도메인 추가 시 자동 설정

4. **Vercel 연결** (5분)
   - Vercel 대시보드 → Settings → Domains
   - 도메인 추가

**총 소요 시간: 약 25분**

---

## ❓ 자주 묻는 질문 (FAQ)

### Q1: 어떤 도메인 확장자를 선택해야 하나요?
**A:** `.com`을 가장 추천합니다. 신뢰도가 높고 사용자가 기억하기 쉽습니다. 예산이 부족하면 `.io`나 `.app`도 좋은 선택입니다.

### Q2: 도메인은 어디서 구매하는 게 가장 좋나요?
**A:** 가격을 중시한다면 **Cloudflare**, 사용 편의성을 중시한다면 **Namecheap**을 추천합니다.

### Q3: 도메인 구매 후 바로 사용할 수 있나요?
**A:** 아니요. DNS 설정이 완료되어야 합니다 (보통 몇 분~몇 시간 소요).

### Q4: 도메인 갱신은 어떻게 하나요?
**A:** 구매한 업체에서 자동 갱신 설정을 하거나, 갱신 알림을 받으면 수동으로 갱신할 수 있습니다.

### Q5: 도메인을 다른 업체로 이전할 수 있나요?
**A:** 네, 가능합니다. 다만 구매 후 60일이 지나야 이전할 수 있습니다 (ICANN 규정).

### Q6: WHOIS 보호가 필요한가요?
**A:** 네, 필요합니다. 스팸 이메일과 개인정보 보호를 위해 권장합니다. 대부분의 업체에서 무료로 제공합니다.

---

## 📚 참고 자료

- **Namecheap**: https://www.namecheap.com
- **Cloudflare**: https://www.cloudflare.com
- **Squarespace Domains**: https://www.squarespace.com/domains
- **GoDaddy**: https://www.godaddy.com
- **Vercel 도메인 설정**: https://vercel.com/docs/concepts/projects/domains
- **Resend 도메인 인증**: https://resend.com/domains

---

## 🎯 다음 단계

도메인을 구매했다면:

1. ✅ `DOMAIN_SETUP.md` 읽기 (Vercel 연결 가이드)
2. ✅ `RESEND_SETUP.md` 읽기 (이메일 도메인 인증)
3. ✅ 환경 변수 업데이트
4. ✅ 외부 서비스 (Google OAuth, Paddle) 콜백 URL 업데이트

