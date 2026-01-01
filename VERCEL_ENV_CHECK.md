# Vercel 환경 변수 확인 및 설정 가이드

## 문제

`redirect_uri_mismatch` 에러가 계속 발생하는 이유는 **Vercel 환경 변수 `NEXTAUTH_URL`이 제대로 설정되지 않았기 때문**입니다.

NextAuth는 OAuth redirect URI를 생성할 때 `NEXTAUTH_URL` 환경 변수를 사용합니다. 이 값이 없거나 잘못되면 Google에 전달되는 redirect URI가 달라집니다.

## 해결 방법

### 1. Vercel 환경 변수 확인

1. Vercel 대시보드 접속: https://vercel.com
2. 프로젝트 선택: `cost-signal`
3. Settings → Environment Variables 이동
4. 다음 변수 확인:

**필수 변수:**
```
NEXTAUTH_URL = https://cost-signal.com
```

**중요:**
- 프로토콜 포함: `https://`
- 슬래시 없음: `cost-signal.com` (끝에 `/` 없음)
- 프로덕션 환경에만 적용: Production 선택

### 2. 환경 변수 설정 방법

**Vercel 대시보드에서:**
1. Settings → Environment Variables
2. "Add New" 클릭
3. 다음 입력:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://cost-signal.com`
   - **Environment**: Production 선택 (또는 All)
4. "Save" 클릭
5. **재배포 필요**: Deployments → 최신 배포 → "Redeploy"

**또는 Vercel CLI로:**
```bash
vercel env add NEXTAUTH_URL production
# 입력: https://cost-signal.com
```

### 3. Google Cloud Console 확인

1. Google Cloud Console 접속
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID 선택
4. Authorized redirect URIs 확인:

**등록되어 있어야 할 URI:**
```
https://cost-signal.com/api/auth/callback/google
```

**중요:**
- 정확히 일치해야 함 (대소문자, 슬래시 포함)
- `http://`가 아닌 `https://` 사용
- 끝에 슬래시 없음

### 4. 디버그 로그 확인

코드에 디버그 로그를 추가했습니다. 배포 후 Vercel 로그에서 확인:

1. Vercel 대시보드 → Deployments
2. 최신 배포 선택 → Functions 탭
3. Google 로그인 시도 시 로그 확인:

```
🔍 OAuth Request Debug:
  - Request URL: ...
  - Request Host: ...
  - NEXTAUTH_URL: ...
  - Expected redirect URI: ...
```

**예상되는 로그:**
- `NEXTAUTH_URL`: `https://cost-signal.com`
- `Expected redirect URI`: `https://cost-signal.com/api/auth/callback/google`

### 5. 재배포

환경 변수를 변경한 후 **반드시 재배포**해야 합니다:

1. Vercel 대시보드 → Deployments
2. 최신 배포 선택
3. "Redeploy" 클릭
4. 또는 Git push로 자동 재배포

## 확인 체크리스트

- [ ] Vercel: `NEXTAUTH_URL` = `https://cost-signal.com` 설정됨
- [ ] Vercel: Production 환경에 적용됨
- [ ] Vercel: 재배포 완료
- [ ] Google Cloud Console: `https://cost-signal.com/api/auth/callback/google` 등록됨
- [ ] 실제 접근: `cost-signal.com`에서 직접 접근 (Preview URL 아님)
- [ ] 로그 확인: 디버그 로그에서 올바른 redirect URI 생성 확인

## 추가 참고

- NextAuth는 `NEXTAUTH_URL`이 없으면 요청의 `host` 헤더를 사용합니다
- Vercel Preview URL에서 접근하면 다른 redirect URI가 생성될 수 있습니다
- 프로덕션 도메인(`cost-signal.com`)에서만 테스트해야 합니다

