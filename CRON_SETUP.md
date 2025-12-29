# 주간 데이터 자동 업데이트 설정 가이드

## 현재 설정 상태

`vercel.json`에 이미 cron 설정이 있습니다:
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

**설정 내용:**
- **경로**: `/api/cron`
- **스케줄**: 매주 월요일 오후 1시 UTC (미국 동부 시간 월요일 오전 9시 EDT / 오전 8시 EST)
- **동작**: 자동으로 주간 경제 데이터를 가져와서 신호 계산

---

## Vercel Cron Jobs 확인하기

### 1단계: Vercel 대시보드 접속
1. https://vercel.com/dashboard 접속
2. `cost-signal` 프로젝트 클릭

### 2단계: Cron Jobs 확인
1. 왼쪽 메뉴에서 **"Settings"** 클릭
2. **"Cron Jobs"** 클릭
3. 다음 정보가 표시되어야 합니다:
   - **Path**: `/api/cron`
   - **Schedule**: `0 13 * * 1` (Every Monday at 1:00 PM UTC = 9:00 AM EDT)
   - **Status**: Active 또는 Enabled

### 3단계: Cron Jobs가 보이지 않을 때
- Vercel Hobby 플랜에서는 Cron Jobs가 제한적일 수 있습니다
- Pro 플랜 업그레이드가 필요할 수 있습니다
- 또는 외부 스케줄러 사용 (아래 참고)

---

## 테스트 방법

### 방법 1: 수동으로 API 호출 (즉시 테스트)
터미널에서 다음 명령어 실행:

```powershell
# PowerShell
Invoke-RestMethod -Uri "https://cost-signal.vercel.app/api/cron" -Method POST
```

또는 브라우저에서:
- 직접 호출은 불가능 (POST 요청 필요)
- 대신 아래 스크립트 사용

### 방법 2: 테스트 스크립트 사용
프로젝트에 테스트 스크립트를 만들어서 실행:

```bash
npm run cron
```

이 명령어는 로컬에서 실행되지만, Supabase에 데이터가 저장됩니다.

---

## Vercel Cron Jobs 제한사항

### Hobby 플랜
- Cron Jobs 지원 여부 확인 필요
- 일부 기능 제한 가능

### Pro 플랜
- Cron Jobs 완전 지원
- 더 많은 실행 시간

---

## 대안: 외부 스케줄러 사용

Vercel Cron Jobs가 작동하지 않으면 외부 스케줄러를 사용할 수 있습니다:

### 옵션 1: GitHub Actions (무료)
- 매주 월요일 자동 실행
- GitHub 저장소에 워크플로우 추가

### 옵션 2: Cron-job.org (무료)
- 외부 cron 서비스
- 매주 월요일 `/api/cron` 호출

### 옵션 3: EasyCron (무료 플랜 있음)
- 간단한 설정
- HTTP 요청 스케줄링

---

## 다음 실행 시간 확인

현재 설정: **매주 월요일 오후 1시 UTC**

**시간대별 변환:**
- **미국 동부 시간 (EDT)**: 월요일 오전 9시
- **미국 동부 시간 (EST)**: 월요일 오전 8시
- **한국 시간**: 월요일 오후 10시 (일광절약시간 고려)
- **태평양 시간 (PDT)**: 월요일 오전 6시

---

## 수동 실행 테스트

지금 바로 테스트하려면:

1. **터미널에서 실행:**
   ```bash
   npm run cron
   ```

2. **또는 API 직접 호출:**
   - Postman 또는 curl 사용
   - `POST https://cost-signal.vercel.app/api/cron`

---

## 확인 방법

### 1. Supabase에서 확인
1. Supabase 대시보드 → Table Editor
2. `weekly_signals` 테이블 확인
3. 새로운 데이터가 추가되었는지 확인

### 2. 사이트에서 확인
1. https://cost-signal.vercel.app 접속
2. 신호 데이터가 업데이트되었는지 확인
3. 날짜가 최신인지 확인

---

## 문제 해결

### Cron이 실행되지 않을 때
1. Vercel → Logs → Functions → `/api/cron` 확인
2. 에러 메시지 확인
3. 환경 변수 확인 (API 키 등)

### 데이터가 업데이트되지 않을 때
1. Supabase 연결 확인
2. API 키 확인 (EIA, FRED, OpenAI)
3. Vercel 로그 확인

---

## 권장 사항

1. **즉시 테스트**: `npm run cron` 실행하여 수동으로 데이터 업데이트
2. **Cron Jobs 확인**: Vercel 대시보드에서 Cron Jobs 상태 확인
3. **대안 준비**: Vercel Cron이 작동하지 않으면 외부 스케줄러 설정


