# Google OAuth redirect_uri_mismatch 해결 방법

## 🔍 문제

Google 로그인 시 `redirect_uri_mismatch` 에러 발생:
- "400 오류: redirect_uri_mismatch"
- "이 앱의 요청이 잘못되었습니다"

## 원인

Google Cloud Console에 등록된 리디렉션 URI와 실제 요청하는 URI가 일치하지 않음

---

## 해결 방법

### 1. Google Cloud Console에서 리디렉션 URI 확인

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com
   - 프로젝트 선택

2. **API 및 서비스 → 사용자 인증 정보**
   - 왼쪽 메뉴에서 "API 및 서비스" → "사용자 인증 정보" 클릭

3. **OAuth 2.0 클라이언트 ID 확인**
   - 웹 애플리케이션 클라이언트 ID 클릭

4. **승인된 리디렉션 URI 확인**
   - 다음 URI가 등록되어 있어야 함:
     ```
     https://cost-signal.com/api/auth/callback/google
     ```

### 2. 리디렉션 URI 추가 (없는 경우)

1. **"승인된 리디렉션 URI" 섹션**
   - "URI 추가" 버튼 클릭

2. **다음 URI 추가:**
   ```
   https://cost-signal.com/api/auth/callback/google
   ```

3. **저장** 클릭

### 3. JavaScript 원본 확인

1. **"승인된 JavaScript 원본" 섹션 확인**
   - 다음이 등록되어 있어야 함:
     ```
     https://cost-signal.com
     ```

2. **없으면 추가:**
   - "URI 추가" 버튼 클릭
   - `https://cost-signal.com` 입력
   - 저장

---

## 확인 사항

### 필수 등록 항목

**승인된 JavaScript 원본:**
- `https://cost-signal.com`

**승인된 리디렉션 URI:**
- `https://cost-signal.com/api/auth/callback/google`

### 추가로 등록 가능한 항목 (선택사항)

**로컬 개발용:**
- `http://localhost:3000`
- `http://localhost:3000/api/auth/callback/google`

**Vercel 기본 도메인:**
- `https://cost-signal.vercel.app`
- `https://cost-signal.vercel.app/api/auth/callback/google`

---

## 테스트

### 1. 설정 저장 후 대기
- Google Cloud Console에서 설정 저장
- **1-2분 대기** (설정 적용 시간)

### 2. 다시 시도
1. 로그아웃 (있는 경우)
2. "Sign in with Google" 클릭
3. 정상 작동 확인

### 3. 계정 선택 화면 확인
- `prompt: 'select_account'` 옵션이 추가되어 있음
- 항상 계정 선택 화면이 표시되어야 함

---

## 문제가 계속되면

### 1. 브라우저 캐시 클리어
- `Ctrl + Shift + R` (하드 리프레시)
- 또는 시크릿 모드에서 테스트

### 2. Google Cloud Console 재확인
- 리디렉션 URI가 정확히 일치하는지 확인
- 공백이나 슬래시(/) 확인

### 3. 환경 변수 확인
- `GOOGLE_CLIENT_ID` 확인
- `GOOGLE_CLIENT_SECRET` 확인
- Vercel 환경 변수에도 설정되어 있는지 확인

---

## 요약

**문제**: `redirect_uri_mismatch` 에러

**해결**:
1. Google Cloud Console → 사용자 인증 정보
2. OAuth 2.0 클라이언트 ID 클릭
3. "승인된 리디렉션 URI"에 추가:
   ```
   https://cost-signal.com/api/auth/callback/google
   ```
4. "승인된 JavaScript 원본"에 추가:
   ```
   https://cost-signal.com
   ```
5. 저장 후 1-2분 대기
6. 다시 테스트

---

## 참고

- NextAuth는 기본적으로 `/api/auth/callback/[provider]` 형식 사용
- Google Provider의 경우: `/api/auth/callback/google`
- 정확한 URI가 등록되어 있어야 함

