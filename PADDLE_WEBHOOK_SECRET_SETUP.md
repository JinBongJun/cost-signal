# Paddle Webhook Secret 설정 가이드

## 1단계: Paddle Dashboard에서 Webhook Secret 찾기

### 방법 1: Paddle Dashboard에서 직접 확인

1. **Paddle Dashboard 접속**
   - https://vendors.paddle.com 접속
   - 로그인

2. **Developer Tools 메뉴**
   - 왼쪽 사이드바에서 **"Developer Tools"** 클릭
   - 또는 상단 메뉴에서 **"Settings"** → **"Developer Tools"**

3. **Webhooks 섹션**
   - **"Webhooks"** 탭 클릭
   - 또는 **"Notifications"** → **"Webhooks"**

4. **Signing Secret 확인**
   - Webhook 설정 화면에서 **"Signing Secret"** 또는 **"Webhook Secret"** 찾기
   - **"Reveal"** 또는 **"Show"** 버튼 클릭하여 secret 표시
   - Secret 복사 (예: `whsec_abc123xyz...`)

---

### 방법 2: Webhook 설정 화면에서 확인

1. **Webhook 추가/편집**
   - Webhook 목록에서 기존 webhook 클릭
   - 또는 **"Add Webhook"** 버튼 클릭

2. **Signing Secret 확인**
   - Webhook 설정 화면에서 **"Signing Secret"** 표시
   - 복사 버튼 클릭하여 secret 복사

---

## 2단계: .env 파일에 추가

### 로컬 개발 환경

1. **프로젝트 루트의 `.env` 파일 열기**
   - 파일이 없으면 `.env.example`을 복사하여 `.env` 생성

2. **다음 줄 추가:**
   ```env
   PADDLE_WEBHOOK_SECRET=whsec_여기에_복사한_secret_붙여넣기
   ```

3. **예시:**
   ```env
   PADDLE_WEBHOOK_SECRET=whsec_abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567
   ```

4. **파일 저장**

---

### Vercel (Production)

1. **Vercel Dashboard 접속**
   - https://vercel.com 접속
   - 프로젝트 선택

2. **Settings → Environment Variables**
   - 왼쪽 사이드바에서 **"Settings"** 클릭
   - **"Environment Variables"** 클릭

3. **새 변수 추가**
   - **"Add New"** 버튼 클릭
   - **Key**: `PADDLE_WEBHOOK_SECRET`
   - **Value**: Paddle Dashboard에서 복사한 secret
   - **Environment**: Production, Preview, Development 모두 선택 (또는 Production만)
   - **"Save"** 클릭

4. **재배포**
   - 환경 변수 추가 후 자동으로 재배포되거나
   - 수동으로 **"Deployments"** → **"Redeploy"** 클릭

---

## 3단계: 확인

### 로컬에서 확인

1. **서버 재시작**
   ```bash
   # 개발 서버가 실행 중이면 중지 (Ctrl+C)
   npm run dev
   ```

2. **로그 확인**
   - Webhook이 들어오면 서명 검증 로그 확인
   - 에러가 없으면 정상 작동

---

### Production에서 확인

1. **Paddle Dashboard에서 테스트 이벤트 전송**
   - Webhook 설정 화면에서 **"Send test event"** 클릭
   - 또는 **"Test"** 버튼 클릭

2. **Vercel Logs 확인**
   - Vercel Dashboard → **"Deployments"** → 최신 배포 → **"Functions"** → **"Logs"**
   - Webhook 처리 로그 확인

---

## 주의사항

### ⚠️ 보안

1. **`.env` 파일을 Git에 커밋하지 마세요**
   - `.gitignore`에 `.env`가 포함되어 있는지 확인
   - Secret이 GitHub에 올라가면 보안 위험

2. **Secret 공유 금지**
   - Secret을 다른 사람에게 공유하지 마세요
   - 채팅, 이메일 등으로 전송하지 마세요

3. **Secret 변경 시**
   - Secret이 유출되면 즉시 Paddle Dashboard에서 새 Secret 생성
   - `.env` 파일과 Vercel 환경 변수 모두 업데이트

---

## 문제 해결

### "PADDLE_WEBHOOK_SECRET not configured" 에러

**원인:**
- 환경 변수가 설정되지 않았거나
- 서버가 재시작되지 않았음

**해결:**
1. `.env` 파일에 `PADDLE_WEBHOOK_SECRET` 추가 확인
2. 개발 서버 재시작
3. Vercel의 경우 환경 변수 추가 후 재배포

---

### "Invalid signature" 에러

**원인:**
- Secret이 잘못되었거나
- Secret이 변경되었는데 환경 변수가 업데이트되지 않음

**해결:**
1. Paddle Dashboard에서 현재 Secret 확인
2. `.env` 파일과 Vercel 환경 변수 모두 확인
3. Secret이 정확히 일치하는지 확인 (공백, 줄바꿈 없이)

---

## 완료 ✅

환경 변수 설정이 완료되면:
- ✅ Webhook 서명 검증이 자동으로 작동
- ✅ 가짜 webhook 요청 차단
- ✅ 진짜 Paddle webhook만 처리

이제 안전하게 Paddle webhook을 받을 수 있습니다! 🎉

