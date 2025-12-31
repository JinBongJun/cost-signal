# Cloudflare 도메인 구매 빠른 가이드

이미 Cloudflare 계정이 있으시므로, Cost Signal을 위한 새 도메인을 빠르게 구매할 수 있습니다.

## 🚀 빠른 구매 방법 (3단계)

### 1단계: 도메인 구매 버튼 클릭
1. Cloudflare 대시보드에서 **"도메인 구매"** 버튼 클릭
   - 또는 왼쪽 사이드바에서 **"도메인 등록"** 클릭

### 2단계: 도메인 검색 및 선택
1. 원하는 도메인 이름 입력 (예: `costsignal`)
2. 사용 가능한 확장자 확인:
   - `.com` (추천, ~$8-10/년)
   - `.io` (~$30-35/년)
   - `.app` (~$15-20/년)
3. 원하는 도메인 선택

### 3단계: 결제 및 완료
1. 결제 정보 입력
2. 구매 완료
3. 도메인이 자동으로 Cloudflare에 추가됨

---

## 💡 추천 도메인 이름

- `costsignal.com` (가장 직관적)
- `cost-signal.com` (하이픈 포함)
- `costsignal.io` (기술 스타트업 느낌)

---

## 📋 구매 후 다음 단계

도메인을 구매한 후:

1. ✅ **Vercel에 도메인 연결**
   - Vercel 대시보드 → Settings → Domains
   - 도메인 추가
   - Cloudflare DNS 레코드 자동 설정 (또는 수동 설정)

2. ✅ **Resend에 도메인 인증**
   - Resend 대시보드 → Domains → Add Domain
   - DNS 레코드 설정 (SPF, DKIM)

3. ✅ **환경 변수 업데이트**
   - Vercel 환경 변수 업데이트
   - `NEXT_PUBLIC_APP_URL` 변경
   - `RESEND_FROM_EMAIL` 변경

---

## 💰 예상 비용

- `.com`: ~$8-10/년 (Cloudflare는 마진 없이 비용만 청구)
- `.io`: ~$30-35/년
- `.app`: ~$15-20/년

---

## 🔧 Cloudflare DNS 설정 팁

도메인을 구매하면 Cloudflare에서 자동으로 DNS를 관리합니다.

### Vercel 연결 시
- Vercel이 제공하는 DNS 레코드를 Cloudflare에 추가
- 또는 Vercel Nameservers를 사용

### Resend 인증 시
- Resend가 제공하는 SPF, DKIM 레코드를 Cloudflare DNS에 추가

---

## ❓ 문제 해결

### 도메인이 보이지 않나요?
- 구매 후 몇 분 기다려보세요
- 페이지를 새로고침해보세요

### DNS 설정이 복잡한가요?
- Cloudflare는 자동으로 DNS를 관리합니다
- Vercel이나 Resend에서 제공하는 레코드만 추가하면 됩니다

---

## 📚 관련 문서

- `DOMAIN_SETUP.md`: Vercel 도메인 연결 가이드
- `DOMAIN_REQUIREMENTS_ANALYSIS.md`: 도메인이 필요한 기능 분석
- `RESEND_SETUP.md`: Resend 도메인 인증 가이드

