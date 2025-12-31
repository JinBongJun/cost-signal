# Google OAuth redirect_uri_mismatch 해결 방법

## 문제 원인

Google Cloud Console에는 `cost-signal.com`이 등록되어 있지만, 실제 접속한 URL이 Vercel 프리뷰 URL(`cost-signal-be998h92p-...vercel.app`)이어서 NextAuth가 해당 프리뷰 URL로 콜백 URL을 생성합니다.

## 해결 방법

### ⚠️ 옵션 1: 와일드카드 사용 불가

**Google은 와일드카드를 지원하지 않습니다!**

- `https://*.vercel.app` 형식은 사용할 수 없음
- 에러: "올바르지 않은 리디렉션: 와일드 카드(*)를 포함할 수 없습니다"

**해결**: 와일드카드는 제거하고 다른 방법 사용

### 옵션 1: 프로덕션 도메인만 사용 (가장 권장) ⭐⭐⭐

프로덕션 도메인(`cost-signal.com`)에서만 테스트:

1. `https://cost-signal.com`에서 직접 테스트
2. 프리뷰 URL은 무시
3. **이미 Google Cloud Console에 등록되어 있음!**

### 옵션 2: 특정 프리뷰 URL 추가 (필요한 경우만)

프리뷰 URL에서도 테스트하려면:

1. **에러 메시지에서 정확한 URL 확인**
   - 에러 페이지의 URL을 복사
   - 예: `cost-signal-be998h92p-bongjun0289-9527s-projects.vercel.app`

2. **"승인된 리디렉션 URI"에 추가:**
   ```
   https://cost-signal-be998h92p-bongjun0289-9527s-projects.vercel.app/api/auth/callback/google
   ```

3. **"저장" 클릭**

**단점**: 프리뷰 URL이 바뀔 때마다 다시 추가해야 함

---

## 추천: 옵션 1 (프로덕션 도메인만 사용) ⭐⭐⭐

**이유:**
- 이미 Google Cloud Console에 등록되어 있음
- 실제 사용자가 사용하는 URL
- 프리뷰 URL 추가 불필요
- 가장 안전하고 간단함

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

