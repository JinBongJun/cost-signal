# Google OAuth redirect_uri_mismatch 해결 가이드

## ✅ 확인 완료: Google Cloud Console 설정은 정상

스크린샷 확인 결과:
- ✅ 승인된 JavaScript 원본: 모두 등록됨
- ✅ 승인된 리디렉션 URI: 모두 등록됨

---

## 🔍 추가 확인 사항

### 1. Vercel 환경 변수 확인 (가장 중요!) ⭐⭐⭐

**NextAuth는 `NEXTAUTH_URL` 환경 변수를 사용하여 콜백 URL을 생성합니다.**

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - `cost-signal` 프로젝트 선택

2. **Settings → Environment Variables**
   - `NEXTAUTH_URL` 변수 확인
   - 값이 `https://cost-signal.com`인지 확인

3. **없거나 잘못된 경우:**
   - `NEXTAUTH_URL` = `https://cost-signal.com` 추가/수정
   - **Environment**: Production 선택
   - 저장 후 재배포

---

### 2. 설정 적용 대기

- Google Cloud Console 설정 저장 후 **1-2분 대기**
- Vercel 환경 변수 변경 후 **재배포 필요**

---

### 3. 브라우저 캐시 클리어

1. 시크릿 모드에서 테스트 (`Ctrl + Shift + N`)
2. 또는 하드 리프레시 (`Ctrl + Shift + R`)

---

### 4. 실제 접속 URL 확인

**중요**: `https://cost-signal.com`으로 접속하고 있는지 확인
- 프리뷰 URL이 아닌 프로덕션 도메인 사용

---

## 🛠️ 해결 단계

### Step 1: Vercel 환경 변수 확인

1. Vercel 대시보드 → Settings → Environment Variables
2. `NEXTAUTH_URL` 확인
3. 값이 `https://cost-signal.com`인지 확인

### Step 2: 환경 변수 수정 (필요시)

1. `NEXTAUTH_URL` = `https://cost-signal.com` 설정
2. **Environment**: Production 선택
3. 저장

### Step 3: 재배포

1. Vercel 대시보드 → Deployments
2. 최신 배포 → "Redeploy" 클릭
3. 배포 완료 대기 (1-2분)

### Step 4: 테스트

1. 로그아웃 (있는 경우)
2. 시크릿 모드에서 `https://cost-signal.com` 접속
3. "Sign in with Google" 클릭
4. 정상 작동 확인

---

## 📝 체크리스트

- [ ] Google Cloud Console: 리디렉션 URI 등록됨 ✅
- [ ] Google Cloud Console: JavaScript 원본 등록됨 ✅
- [ ] Vercel: `NEXTAUTH_URL` = `https://cost-signal.com` 확인 필요 ⚠️
- [ ] Vercel: 환경 변수 저장 후 재배포 필요 ⚠️
- [ ] 브라우저: 시크릿 모드에서 테스트 필요 ⚠️

---

## 💡 가장 가능성 높은 원인

**Vercel 환경 변수 `NEXTAUTH_URL`이 설정되지 않았거나 잘못된 값일 가능성이 높습니다.**

NextAuth는 `NEXTAUTH_URL`을 사용하여 콜백 URL을 생성하므로, 이 값이 정확해야 합니다.

---

## ✅ 확인 후 테스트

1. Vercel 환경 변수 확인
2. 필요시 수정 및 재배포
3. 시크릿 모드에서 테스트

이렇게 하면 해결될 가능성이 높습니다!

