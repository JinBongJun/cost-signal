# Google OAuth 최종 확인 가이드

## ✅ 확인 완료 항목

- ✅ Google Cloud Console: 리디렉션 URI 등록됨
- ✅ Google Cloud Console: JavaScript 원본 등록됨
- ✅ Vercel: `NEXTAUTH_URL` = `https://cost-signal.com` 설정됨

---

## 🔍 추가 확인 사항

### 1. Google Cloud Console 설정 저장 확인

1. **Google Cloud Console에서 "저장" 버튼 클릭했는지 확인**
   - 설정을 변경한 후 반드시 "저장" 버튼 클릭 필요
   - 저장하지 않으면 변경사항이 적용되지 않음

2. **설정 적용 대기**
   - 저장 후 **1-2분 대기** (Google 서버에 전파 시간 필요)

### 2. 브라우저 캐시 및 쿠키

1. **시크릿 모드에서 테스트**
   - `Ctrl + Shift + N` (Chrome/Edge)
   - 시크릿 창에서 `https://cost-signal.com` 접속
   - "Sign in with Google" 클릭

2. **브라우저 쿠키 삭제**
   - Google 계정 쿠키 삭제
   - `accounts.google.com` 쿠키 삭제

### 3. 실제 접속 URL 확인

**중요**: 정확히 `https://cost-signal.com`으로 접속하고 있는지 확인
- 프리뷰 URL이 아닌 프로덕션 도메인 사용
- 주소창에 정확히 `https://cost-signal.com` 표시되는지 확인

### 4. Google OAuth 동의 화면 확인

1. **Google Cloud Console → API 및 서비스 → OAuth 동의 화면**
   - "게시 상태"가 "프로덕션"인지 확인
   - 테스트 모드면 제한이 있을 수 있음

---

## 🛠️ 단계별 해결

### Step 1: Google Cloud Console 재확인

1. Google Cloud Console 접속
2. 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 클릭
3. **"저장" 버튼이 있는지 확인**
   - 변경사항이 있으면 "저장" 클릭
4. **1-2분 대기**

### Step 2: 브라우저 완전 초기화

1. **시크릿 모드에서 테스트**
   - `Ctrl + Shift + N`
   - `https://cost-signal.com` 접속
   - "Sign in with Google" 클릭

2. **다른 브라우저에서 테스트**
   - Chrome에서 테스트했다면 Edge에서 시도
   - 또는 그 반대

### Step 3: 에러 메시지 확인

에러 페이지에서:
1. **정확한 에러 메시지 확인**
2. **요청된 redirect_uri 확인**
   - 에러 페이지에 표시된 URI 확인
   - Google Cloud Console에 등록된 URI와 정확히 일치하는지 확인

---

## 💡 가능한 원인

### 1. 설정 전파 지연
- Google Cloud Console 설정이 아직 전파되지 않음
- **해결**: 1-2분 더 대기 후 다시 시도

### 2. 브라우저 캐시
- 이전 OAuth 요청이 캐시되어 있음
- **해결**: 시크릿 모드에서 테스트

### 3. Google 계정 쿠키
- 이미 로그인된 Google 계정 쿠키가 간섭
- **해결**: Google 계정 로그아웃 후 다시 시도

### 4. OAuth 동의 화면 상태
- 테스트 모드로 설정되어 있을 수 있음
- **해결**: 프로덕션 모드로 전환

---

## 🔄 빠른 해결 방법

### 방법 1: 시크릿 모드 테스트 (가장 빠름)

1. 시크릿 모드 열기 (`Ctrl + Shift + N`)
2. `https://cost-signal.com` 접속
3. "Sign in with Google" 클릭
4. 정상 작동 확인

### 방법 2: Google 계정 로그아웃

1. Google 계정 로그아웃
2. `https://cost-signal.com` 접속
3. "Sign in with Google" 클릭
4. 계정 선택 화면 표시 확인

### 방법 3: 설정 재저장

1. Google Cloud Console 접속
2. 사용자 인증 정보 → OAuth 2.0 클라이언트 ID
3. 아무것도 변경하지 않고 **"저장" 버튼 클릭**
4. 1-2분 대기
5. 다시 테스트

---

## 📝 체크리스트

- [ ] Google Cloud Console: 설정 저장 확인
- [ ] Google Cloud Console: 1-2분 대기 완료
- [ ] 브라우저: 시크릿 모드에서 테스트
- [ ] 브라우저: Google 계정 로그아웃 후 테스트
- [ ] URL: 정확히 `https://cost-signal.com` 접속 확인

---

## ✅ 다음 단계

설정이 모두 정상이라면:

1. **시크릿 모드에서 테스트** (가장 빠름)
2. **1-2분 더 대기 후 다시 시도**
3. **에러 메시지의 정확한 redirect_uri 확인**

이 중 하나로 해결될 가능성이 높습니다!

