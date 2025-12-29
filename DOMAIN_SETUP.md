# 도메인 설정 가이드

## 옵션 1: 무료 도메인 사용 (추천)

### Vercel에서 무료 도메인 제공
- Vercel은 기본적으로 `*.vercel.app` 도메인을 제공합니다
- 하지만 Paddle은 커스텀 도메인이 필요할 수 있습니다

### 무료 도메인 서비스
1. **Freenom** (https://www.freenom.com)
   - `.tk`, `.ml`, `.ga`, `.cf`, `.gq` 도메인 무료 제공
   - 단점: 신뢰도 낮음, Paddle에서 거부될 수 있음

2. **GitHub Student Pack** (학생인 경우)
   - Namecheap 도메인 1년 무료

## 옵션 2: 저렴한 유료 도메인 (추천)

### 추천 도메인 등록업체
1. **Namecheap** (https://www.namecheap.com)
   - `.com` 도메인: 약 $10-15/년
   - `.xyz` 도메인: 약 $1-3/년
   - 첫 해 할인 많음

2. **Cloudflare Registrar** (https://www.cloudflare.com/products/registrar/)
   - 도메인 등록 비용만 청구 (마진 없음)
   - `.com` 도메인: 약 $9-10/년

3. **Google Domains** (현재 Squarespace로 이전)
   - `.com` 도메인: 약 $12/년

### 추천 도메인 이름
- `costsignal.com`
- `cost-signal.com`
- `costsignal.app`
- `costsignal.xyz` (저렴)

## 옵션 3: Vercel에서 도메인 구매

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. "Buy Domain" 클릭
3. 원하는 도메인 검색 및 구매
4. 자동으로 연결됨

---

## Vercel에 도메인 연결하기

### 1단계: 도메인 구매/확보
- 위 옵션 중 하나 선택하여 도메인 확보

### 2단계: Vercel에 도메인 추가

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - `cost-signal` 프로젝트 선택

2. **Settings → Domains 클릭**

3. **"Add Domain" 버튼 클릭**

4. **도메인 입력**
   - 예: `costsignal.com`
   - 또는 `www.costsignal.com`

5. **DNS 설정 안내 확인**
   - Vercel이 DNS 레코드를 안내합니다

### 3단계: DNS 설정 (도메인 등록업체에서)

도메인 등록업체의 DNS 설정 페이지에서:

#### A 레코드 추가 (루트 도메인용)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### CNAME 레코드 추가 (www 서브도메인용)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

또는 Vercel이 제공하는 Nameservers 사용:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### 4단계: SSL 인증서 자동 발급
- Vercel이 자동으로 SSL 인증서를 발급합니다
- 몇 분에서 몇 시간 소요될 수 있습니다

### 5단계: 확인
- `https://yourdomain.com` 접속하여 사이트 확인

---

## Paddle 웹사이트 인증

### 1단계: Paddle 대시보드 접속
1. https://vendors.paddle.com 접속
2. 로그인

### 2단계: 웹사이트 추가
1. **Settings → Websites** 클릭
2. **"Add Website" 클릭**
3. **도메인 입력**
   - 예: `costsignal.com`
   - 또는 `www.costsignal.com`

### 3단계: 인증 방법 선택

#### 방법 1: HTML 파일 업로드 (가장 쉬움)
1. Paddle이 제공하는 HTML 파일 다운로드
2. 프로젝트의 `public/` 폴더에 추가
3. GitHub에 푸시
4. Vercel 재배포
5. Paddle에서 "Verify" 클릭

#### 방법 2: DNS 레코드 추가
1. Paddle이 제공하는 DNS 레코드 복사
2. 도메인 등록업체의 DNS 설정에 추가
3. Paddle에서 "Verify" 클릭

#### 방법 3: Meta 태그 추가
1. Paddle이 제공하는 meta 태그 복사
2. `app/layout.tsx`의 `<head>` 섹션에 추가
3. GitHub에 푸시
4. Vercel 재배포
5. Paddle에서 "Verify" 클릭

### 4단계: 인증 완료 확인
- Paddle 대시보드에서 "Verified" 상태 확인

---

## 빠른 시작 (가장 쉬운 방법)

### 1. Namecheap에서 도메인 구매
- https://www.namecheap.com
- `.xyz` 도메인 선택 (저렴)
- 예: `costsignal.xyz` ($1-3/년)

### 2. Vercel에 도메인 추가
- Settings → Domains → Add Domain
- 도메인 입력

### 3. DNS 설정
- Namecheap → Domain List → Manage
- Advanced DNS → Vercel이 제공하는 레코드 추가

### 4. Paddle 인증
- Paddle → Settings → Websites
- 도메인 추가 및 인증

---

## 예상 비용

### 도메인
- `.com`: $10-15/년
- `.xyz`: $1-3/년
- `.app`: $15-20/년

### Vercel
- 무료 (Hobby 플랜)

### 총 비용
- 첫 해: $1-15 (도메인만)
- 이후: $1-15/년

---

## 다음 단계

도메인 설정 완료 후:
1. ✅ Paddle 웹사이트 인증 완료
2. ✅ NEXTAUTH 환경 변수 추가
3. ✅ 결제 플로우 테스트
4. ✅ 주간 데이터 업데이트 자동화


