# Google OAuth Login Setup Guide

이 가이드는 Google Cloud Console에서 OAuth 클라이언트 ID와 Secret을 발급받는 방법을 단계별로 설명합니다.

## Step 1: Google Cloud Console 접속 및 프로젝트 선택

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 상단 프로젝트 선택 드롭다운에서 **"modifit-vision"** 프로젝트 선택 (또는 사용할 프로젝트)

## Step 2: API 및 서비스로 이동

1. 왼쪽 햄버거 메뉴(☰) 클릭
2. **"API 및 서비스"** (APIs & Services) 클릭
   - 또는 빠른 액세스 카드에서 **"API API 및 서비스"** 카드 클릭
3. 왼쪽 메뉴에서 **"사용자 인증 정보"** (Credentials) 클릭

## Step 3: OAuth 동의 화면 구성 (처음 설정하는 경우)

⚠️ **중요**: OAuth 클라이언트 ID를 만들기 전에 먼저 OAuth 동의 화면을 구성해야 합니다.

1. 상단에 **"OAuth 동의 화면 구성"** (Configure OAuth consent screen) 버튼이 보이면 클릭
   - 또는 왼쪽 메뉴에서 **"OAuth 동의 화면"** (OAuth consent screen) 클릭

2. **사용자 유형 선택**:
   - **"외부"** (External) 선택 → **"만들기"** (Create) 클릭
   - (Google Workspace 조직이 있는 경우에만 "내부" 선택 가능)

3. **앱 정보 입력**:
   - **앱 이름** (App name): `Cost Signal` (또는 원하는 이름)
   - **사용자 지원 이메일** (User support email): 본인 이메일 주소 선택
   - **앱 로고** (App logo): 선택사항 (나중에 추가 가능)
   - **앱 도메인** (Application home page): 
     - 개발: `http://localhost:3000`
     - 프로덕션: `https://your-domain.vercel.app` (실제 도메인으로 변경)
   - **개발자 연락처 정보** (Developer contact information): 본인 이메일 주소 입력
   - **"저장 후 계속"** (Save and Continue) 클릭

4. **범위 (Scopes) 설정**:
   - **"범위 추가 또는 삭제"** (Add or Remove Scopes) 클릭
   - 다음 범위를 찾아서 체크박스 선택:
     - `.../auth/userinfo.email` (이메일 주소)
     - `.../auth/userinfo.profile` (기본 프로필 정보)
     - `openid` (OpenID Connect)
   - 또는 검색창에 `email`, `profile`, `openid` 검색
   - **"업데이트"** (Update) 클릭
   - **"저장 후 계속"** (Save and Continue) 클릭

5. **테스트 사용자 (Test users)** - 테스트 모드인 경우:
   - **"사용자 추가"** (Add Users) 클릭
   - 본인 이메일 주소 입력
   - **"추가"** (Add) 클릭
   - **"저장 후 계속"** (Save and Continue) 클릭

6. **요약 확인**:
   - 입력한 정보 확인
   - **"대시보드로 돌아가기"** (Back to Dashboard) 클릭

## Step 4: OAuth 클라이언트 ID 생성

1. 왼쪽 메뉴에서 **"사용자 인증 정보"** (Credentials) 클릭
   - 또는 상단 **"사용자 인증 정보"** 탭 클릭

2. 상단 **"+ 사용자 인증 정보 만들기"** (+ Create Credentials) 버튼 클릭

3. **"OAuth 클라이언트 ID"** (OAuth client ID) 선택

4. **OAuth 클라이언트 만들기**:
   - **애플리케이션 유형** (Application type): 
     - 드롭다운에서 **"웹 애플리케이션"** (Web application) 선택
   
   - **이름** (Name): 
     - 예) `Cost Signal Web Client`
   
   - **승인된 JavaScript 원본** (Authorized JavaScript origins):
     - **"+ URI 추가"** (+ Add URI) 클릭
     - 개발용: `http://localhost:3000` 입력
     - Enter 키로 추가
     - 프로덕션용: `https://your-domain.vercel.app` 입력 (실제 Vercel 도메인으로 변경)
     - Enter 키로 추가
   
   - **승인된 리디렉션 URI** (Authorized redirect URIs):
     - **"+ URI 추가"** (+ Add URI) 클릭
     - 개발용: `http://localhost:3000/api/auth/callback/google` 입력
     - Enter 키로 추가
     - 프로덕션용: `https://your-domain.vercel.app/api/auth/callback/google` 입력 (실제 Vercel 도메인으로 변경)
     - Enter 키로 추가

5. **"만들기"** (Create) 클릭

6. **⚠️ 중요: 클라이언트 ID와 Secret 복사**:
   - 팝업 창이 나타나면 다음 정보를 **반드시 복사**해두세요:
     - **클라이언트 ID** (Client ID): 
       - 예) `123456789-abcdefghijklmnop.apps.googleusercontent.com`
     - **클라이언트 보안 비밀번호** (Client secret): 
       - 예) `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **이 창을 닫으면 Client Secret을 다시 볼 수 없습니다!**
   - 안전한 곳에 저장해두세요 (메모장, 비밀번호 관리자 등)

7. **"확인"** (OK) 클릭

## Step 5: 환경 변수 설정

### 5.1. 로컬 개발용 (`.env.local`)

프로젝트 루트에 `.env.local` 파일을 만들고 다음 내용 추가:

```env
GOOGLE_CLIENT_ID=복사한-클라이언트-ID-여기에-붙여넣기
GOOGLE_CLIENT_SECRET=복사한-클라이언트-보안-비밀번호-여기에-붙여넣기
```

### 5.2. Vercel 프로덕션용

1. [Vercel Dashboard](https://vercel.com/dashboard)에 접속
2. 프로젝트 선택
3. **"Settings"** 탭 클릭
4. 왼쪽 메뉴에서 **"Environment Variables"** 클릭
5. 다음 변수 추가:

   **첫 번째 변수:**
   - **Name**: `GOOGLE_CLIENT_ID`
   - **Value**: 복사한 클라이언트 ID 붙여넣기
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     - 모두 체크
   - **"Add"** 클릭

   **두 번째 변수:**
   - **Name**: `GOOGLE_CLIENT_SECRET`
   - **Value**: 복사한 클라이언트 보안 비밀번호 붙여넣기
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     - 모두 체크
   - **"Add"** 클릭

6. **⚠️ 중요**: 환경 변수 추가 후 **프로젝트를 재배포**해야 합니다!
   - 상단 **"Deployments"** 탭 클릭
   - 최신 배포 옆 **"..."** 메뉴 → **"Redeploy"** 클릭

## Step 6: 테스트

1. 로컬 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 `/login` 또는 `/signup` 페이지 접속

3. **"Sign in with Google"** 또는 **"Sign up with Google"** 버튼이 보이는지 확인
   - 환경 변수가 설정되지 않으면 버튼이 보이지 않습니다 (정상 동작)

4. 버튼 클릭 → Google 로그인 페이지로 리디렉션

5. Google 계정 선택 및 로그인

6. 앱으로 리디렉션되어 로그인 완료

## 문제 해결

### ❌ 에러: "client_id is required"
**원인**: 환경 변수가 설정되지 않았거나 잘못 설정됨

**해결 방법**:
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- 개발 서버를 재시작 (`npm run dev`)
- Vercel에 환경 변수를 추가한 경우 재배포 확인

### ❌ 에러: "redirect_uri_mismatch"
**원인**: OAuth 클라이언트의 리디렉션 URI와 실제 URI가 일치하지 않음

**해결 방법**:
- Google Cloud Console → 사용자 인증 정보 → OAuth 클라이언트 ID 클릭
- **승인된 리디렉션 URI** 확인:
  - 개발: `http://localhost:3000/api/auth/callback/google` (정확히 일치해야 함)
  - 프로덕션: `https://your-domain.vercel.app/api/auth/callback/google` (실제 도메인으로 변경)
- 프로토콜(http/https), 도메인, 경로가 정확히 일치해야 함
- URI 끝에 슬래시(/)가 있으면 안 됨

### ❌ 에러: "access_denied"
**원인**: OAuth 동의 화면이 제대로 구성되지 않았거나 테스트 사용자가 추가되지 않음

**해결 방법**:
- Google Cloud Console → API 및 서비스 → OAuth 동의 화면 확인
- 테스트 모드인 경우, 본인 이메일이 테스트 사용자 목록에 추가되었는지 확인
- 필요한 범위(email, profile, openid)가 추가되었는지 확인

### ❌ Google 로그인 버튼이 보이지 않음
**원인**: 환경 변수가 설정되지 않음

**해결 방법**:
- 환경 변수가 설정되지 않으면 버튼이 자동으로 숨겨집니다 (정상 동작)
- 환경 변수를 설정하고 재배포하면 버튼이 나타납니다

## 참고사항

- **Client Secret은 절대 공개하지 마세요!** GitHub에 커밋하지 않도록 주의
- `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다
- 프로덕션 배포 전에 OAuth 동의 화면을 **"프로덕션"** (Production)으로 전환해야 합니다
- 테스트 모드에서는 최대 100명의 테스트 사용자만 로그인할 수 있습니다
- 프로덕션 모드로 전환하려면 Google의 검토 과정을 거쳐야 합니다

## 다음 단계

환경 변수를 설정하고 재배포하면 Google 로그인이 작동합니다!
