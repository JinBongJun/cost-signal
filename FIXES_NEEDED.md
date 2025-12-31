# 현재 발견된 문제 및 해결 방법

## 1. 이메일 스팸함 문제 ✅ (정상 작동)

### 상황
- 이메일이 스팸함에 들어갔지만 정상적으로 전송됨
- 모든 사용자에게도 동일하게 작동함

### 설명
이것은 **정상적인 현상**입니다:
- 새로 인증한 도메인은 처음에 스팸 필터에 걸릴 수 있음
- 시간이 지나면 (보통 며칠~몇 주) 개선됨
- 이메일이 전송되는 것 자체는 성공

### 개선 방법 (선택사항)
1. **DMARC 레코드 추가** (Resend에서 제공)
   - 스팸 필터 회피율 향상
   - 신뢰도 향상

2. **사용자 안내**
   - 이메일이 스팸함에 있을 수 있다고 안내
   - 시간이 지나면 개선됨을 설명

### 결론
✅ **모든 사용자에게 정상적으로 이메일이 전송됩니다**
- 스팸함에 들어가는 것은 일시적
- 이메일 전송 자체는 성공

---

## 2. Google OAuth redirect_uri_mismatch 에러 ❌

### 문제
- Google 로그인 시 `redirect_uri_mismatch` 에러 발생
- URL이 `cost-signal-be998h92p-bongjun0289-9527s-projects.vercel.app`로 되어 있음

### 원인
Google Cloud Console에 Vercel 프리뷰 URL이 등록되지 않음

### 해결 방법

#### Google Cloud Console 업데이트
1. https://console.cloud.google.com 접속
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID 선택
4. **"승인된 리디렉션 URI"에 추가:**
   ```
   https://cost-signal-be998h92p-bongjun0289-9527s-projects.vercel.app/api/auth/callback/google
   ```
   또는 와일드카드 사용:
   ```
   https://*.vercel.app/api/auth/callback/google
   ```

#### 또는 프로덕션 도메인만 사용
- Vercel 프리뷰 URL 대신 `cost-signal.com`만 사용
- 개발 시에는 로컬호스트만 사용

### 권장 사항
**프로덕션 도메인만 사용하는 것을 추천:**
- `https://cost-signal.com/api/auth/callback/google` (이미 추가됨)
- `http://localhost:3000/api/auth/callback/google` (개발용)

프리뷰 URL은 제거하고 프로덕션 도메인만 사용하세요.

---

## 3. 로그인 페이지 헤더 없음 ❌

### 문제
- 회원가입 페이지에는 헤더가 있음
- 로그인 페이지에는 헤더가 없음

### 원인
`app/login/page.tsx`의 `LoginForm` 컴포넌트에 `Header`가 없음

### 해결
✅ **수정 완료**: `LoginForm`에 `Header` 추가

---

## 요약

### 완료된 수정
- [x] 로그인 페이지에 Header 추가

### 해결 필요
- [ ] Google OAuth redirect URI 설정
  - Vercel 프리뷰 URL 추가 또는 제거
  - 프로덕션 도메인만 사용 권장

### 정상 작동 (개선 가능)
- [x] 이메일 전송 (스팸함에 들어가지만 전송 성공)
  - DMARC 설정으로 개선 가능 (선택사항)

