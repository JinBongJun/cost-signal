# Cron 엔드포인트 보안 설정 가이드

## 보안 개요

`/api/cron` 엔드포인트는 주간 데이터 업데이트를 트리거하는 중요한 엔드포인트입니다. 다음 보안 메커니즘이 적용되어 있습니다:

### 보안 레벨 (우선순위 순)

1. **Vercel Cron** (가장 안전)
   - `x-vercel-signature` 헤더로 자동 인증
   - Vercel이 자동으로 보호

2. **CRON_SECRET** (수동/외부 호출용)
   - 환경 변수 `CRON_SECRET` 설정 필요
   - Authorization 헤더 또는 쿼리 파라미터로 전달

3. **개발 모드** (로컬 테스트용)
   - `NODE_ENV=development`일 때만 허용
   - 프로덕션에서는 비활성화

## 설정 방법

### 1. Vercel Cron (권장)

`vercel.json`에 이미 설정되어 있습니다:
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 13 * * 1"
    }
  ]
}
```

Vercel이 자동으로 보호하므로 추가 설정 불필요합니다.

### 2. 수동/외부 호출 (CRON_SECRET 필요)

#### 환경 변수 설정

**로컬 `.env`:**
```env
CRON_SECRET=your-strong-random-secret-here
```

**Vercel 환경 변수:**
- Key: `CRON_SECRET`
- Value: 강력한 랜덤 문자열 (최소 32자 권장)
- Environment: Production, Preview, Development

#### 호출 방법

**방법 1: Authorization 헤더**
```bash
curl -X POST https://your-domain.com/api/cron \
  -H "Authorization: Bearer your-cron-secret"
```

**방법 2: X-Cron-Secret 헤더**
```bash
curl -X POST https://your-domain.com/api/cron \
  -H "X-Cron-Secret: your-cron-secret"
```

**방법 3: 쿼리 파라미터 (덜 안전, 테스트용)**
```bash
curl -X POST "https://your-domain.com/api/cron?secret=your-cron-secret"
```

### 3. 개발 모드 (로컬 테스트)

로컬 개발 시 `NODE_ENV=development`이고 `CRON_SECRET`이 없으면 자동으로 허용됩니다.

```bash
npm run dev
# Then call: http://localhost:3000/api/cron
```

## 보안 모범 사례

### 1. CRON_SECRET 생성

강력한 랜덤 문자열 생성:
```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. 환경 변수 관리

- ✅ `.env` 파일을 `.gitignore`에 포함
- ✅ Vercel 환경 변수는 암호화되어 저장
- ✅ 프로덕션과 개발 환경 분리

### 3. Rate Limiting

비-Vercel Cron 요청은 자동으로 Rate Limiting 적용:
- 최대 5회/분
- IP 기반 추적

## 문제 해결

### "Unauthorized" 에러

1. `CRON_SECRET` 환경 변수 확인
2. 헤더 또는 쿼리 파라미터 확인
3. Vercel 환경 변수가 배포에 반영되었는지 확인

### 개발 모드에서 작동 안 함

- `NODE_ENV=development` 확인
- 또는 `CRON_SECRET` 설정

### Vercel Cron이 작동 안 함

- `vercel.json` 설정 확인
- Vercel Dashboard에서 Cron 작업 상태 확인

## 보안 체크리스트

- [ ] `CRON_SECRET` 환경 변수 설정 (프로덕션)
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] Vercel 환경 변수 설정 완료
- [ ] Rate Limiting 작동 확인
- [ ] 개발 모드에서만 비인증 허용 확인

---

## 참고

- Vercel Cron은 자동으로 보호되므로 가장 안전합니다
- 수동 호출은 반드시 `CRON_SECRET`을 사용하세요
- 프로덕션에서는 개발 모드 보안이 자동으로 비활성화됩니다

