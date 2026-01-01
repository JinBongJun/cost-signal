# Google OAuth redirect_uri_mismatch 에러 해결 가이드

## 문제
`400 오류: redirect_uri_mismatch` - Google Cloud Console에 등록된 리다이렉트 URI와 실제 요청하는 URI가 일치하지 않음

## 해결 방법

### 1. 현재 사용 중인 도메인 확인
- **프로덕션**: `https://cost-signal.com`
- **프리뷰**: `https://cost-signal-xxx.vercel.app`
- **로컬**: `http://localhost:3000`

### 2. Google Cloud Console 설정 확인

**Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID**

#### Authorized JavaScript origins (필수):
```
https://cost-signal.com
https://www.cost-signal.com
```

#### Authorized redirect URIs (필수):
```
https://cost-signal.com/api/auth/callback/google
https://www.cost-signal.com/api/auth/callback/google
```

**⚠️ 중요:** 
- `http://`가 아닌 `https://` 사용
- `/api/auth/callback/google` 경로 정확히 입력
- 끝에 슬래시(`/`) 없이 입력

### 3. Vercel 환경 변수 확인

**Vercel Dashboard → Project → Settings → Environment Variables**

다음 변수가 올바르게 설정되어 있는지 확인:
```
NEXTAUTH_URL=https://cost-signal.com
```

**⚠️ 중요:**
- 프로덕션 환경 변수에 설정
- `https://` 사용 (http 아님)
- 끝에 슬래시(`/`) 없이 입력

### 4. 로컬 개발 환경 (선택사항)

로컬에서 테스트하려면 Google Cloud Console에 추가:
```
http://localhost:3000/api/auth/callback/google
```

그리고 `.env.local` 파일에:
```
NEXTAUTH_URL=http://localhost:3000
```

### 5. 변경사항 적용

1. Google Cloud Console에서 설정 변경 후 **저장**
2. Vercel 환경 변수 확인/변경 후 **재배포**
3. 브라우저 캐시 클리어
4. 다시 시도

## 확인 체크리스트

- [ ] Google Cloud Console에 `https://cost-signal.com/api/auth/callback/google` 등록됨
- [ ] Vercel에 `NEXTAUTH_URL=https://cost-signal.com` 설정됨
- [ ] 환경 변수 변경 후 재배포 완료
- [ ] 브라우저 캐시 클리어 완료

## 참고

NextAuth는 자동으로 다음 형식의 리다이렉트 URI를 생성합니다:
```
{NEXTAUTH_URL}/api/auth/callback/{provider}
```

따라서 `NEXTAUTH_URL`이 올바르게 설정되어 있으면 자동으로 올바른 URI가 생성됩니다.

