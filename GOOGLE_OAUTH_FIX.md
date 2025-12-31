# Google OAuth redirect_uri_mismatch 해결 방법

## 문제 원인

Google Cloud Console에는 `cost-signal.com`이 등록되어 있지만, 실제 접속한 URL이 Vercel 프리뷰 URL(`cost-signal-be998h92p-...vercel.app`)이어서 NextAuth가 해당 프리뷰 URL로 콜백 URL을 생성합니다.

## 해결 방법

### 옵션 1: Vercel 프리뷰 URL 와일드카드 추가 (권장)

Google Cloud Console에서:

1. **"승인된 리디렉션 URI"에 추가:**
   ```
   https://*.vercel.app/api/auth/callback/google
   ```
   (와일드카드 사용 - 모든 Vercel 프리뷰 URL 허용)

2. **"승인된 JavaScript 원본"에 추가:**
   ```
   https://*.vercel.app
   ```

3. **"저장" 클릭**

### 옵션 2: 특정 프리뷰 URL 추가

현재 사용 중인 프리뷰 URL을 정확히 추가:

1. **에러 메시지에서 정확한 URL 확인**
   - 에러 페이지의 URL을 복사
   - 예: `cost-signal-be998h92p-bongjun0289-9527s-projects.vercel.app`

2. **"승인된 리디렉션 URI"에 추가:**
   ```
   https://cost-signal-be998h92p-bongjun0289-9527s-projects.vercel.app/api/auth/callback/google
   ```

3. **"저장" 클릭**

**단점**: 프리뷰 URL이 바뀔 때마다 다시 추가해야 함

### 옵션 3: 프로덕션 도메인만 사용 (가장 안전)

프리뷰 URL에서 테스트하지 않고 프로덕션 도메인(`cost-signal.com`)에서만 테스트:

1. `https://cost-signal.com`에서 직접 테스트
2. 프리뷰 URL은 무시

---

## 추천: 옵션 1 (와일드카드 사용)

**이유:**
- 모든 Vercel 프리뷰 URL에서 작동
- URL이 바뀌어도 문제없음
- 개발 및 테스트에 유용

---

## 설정 후 확인

1. Google Cloud Console에서 "저장" 클릭
2. 몇 분 대기 (설정 적용 시간)
3. 다시 Google 로그인 시도

---

## 참고

- Google은 와일드카드를 지원합니다
- `*.vercel.app` 형식으로 모든 Vercel 프리뷰 URL을 허용할 수 있습니다
- 보안상 문제없음 (Vercel 도메인만 허용)

