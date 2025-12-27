# Vercel 배포 가이드

## 1단계: GitHub에 프로젝트 푸시

### Git 초기화 (아직 안 했다면)
```bash
git init
git add .
git commit -m "Initial commit"
```

### GitHub 저장소 생성 및 푸시
1. GitHub에서 새 저장소 생성 (예: `cost-signal`)
2. 다음 명령어 실행:
```bash
git remote add origin https://github.com/YOUR_USERNAME/cost-signal.git
git branch -M main
git push -u origin main
```

## 2단계: Vercel 계정 생성 및 프로젝트 연결

1. **Vercel 가입**
   - https://vercel.com 접속
   - "Sign Up" 클릭
   - GitHub 계정으로 로그인 (권장)

2. **프로젝트 Import**
   - Vercel 대시보드에서 "Add New..." → "Project" 클릭
   - GitHub 저장소 선택 (`cost-signal`)
   - "Import" 클릭

3. **프로젝트 설정**
   - Framework Preset: Next.js (자동 감지)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)

## 3단계: 환경 변수 설정

Vercel 프로젝트 설정에서 "Environment Variables" 섹션으로 이동하여 다음 변수들을 추가:

### 필수 환경 변수
```
EIA_API_KEY=your_eia_key
FRED_API_KEY=your_fred_key
BLS_API_KEY=your_bls_key
OPENAI_API_KEY=your_openai_key
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=https://your-project.vercel.app
PADDLE_VENDOR_ID=your_paddle_vendor_id
PADDLE_API_KEY=your_paddle_api_key
PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your_email@example.com
```

### 환경 변수 생성 방법
- `NEXTAUTH_SECRET`: 다음 명령어로 생성 가능
  ```bash
  openssl rand -base64 32
  ```
  또는 온라인 생성기 사용: https://generate-secret.vercel.app/32

- `NEXTAUTH_URL`: 배포 후 자동으로 생성된 URL 사용 (예: `https://cost-signal.vercel.app`)

## 4단계: 배포

1. "Deploy" 버튼 클릭
2. 배포 완료 대기 (약 2-3분)
3. 배포 완료 후 URL 확인 (예: `https://cost-signal-xxx.vercel.app`)

## 5단계: Paddle 설정 업데이트

배포 완료 후:

1. **Paddle 대시보드**로 이동
2. **Settings** → **Website verification** 또는 **Get Started**로 돌아가기
3. 실제 배포된 URL로 업데이트:
   - Web domains: `https://your-project.vercel.app`
   - Pricing page: `https://your-project.vercel.app/pricing`
   - Terms of service: `https://your-project.vercel.app/terms` (나중에 페이지 생성 필요)

## 6단계: Terms 페이지 생성 (선택사항)

Paddle 검증을 위해 Terms 페이지가 필요합니다. 간단한 페이지를 생성하세요:

```typescript
// app/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-gray-600">Terms content here...</p>
    </div>
  );
}
```

## 문제 해결

### 빌드 에러
- `next-pwa` 관련 에러가 나면 `package.json`에 추가:
  ```bash
  npm install @imbios/next-pwa
  ```

### 환경 변수 누락
- 모든 필수 환경 변수가 설정되었는지 확인
- Vercel 대시보드에서 "Settings" → "Environment Variables" 확인

### 데이터베이스 문제
- SQLite는 Vercel의 서버리스 환경에서 제한적
- 나중에 Vercel Postgres나 다른 데이터베이스로 마이그레이션 고려

## 다음 단계

배포 완료 후:
1. ✅ Paddle 설정 업데이트
2. ✅ Products 생성
3. ✅ 테스트 결제 진행
4. ✅ 실제 서비스 시작!


