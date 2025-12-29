# 문제 해결 가이드

## 문제: Cron 실행 후에도 데이터가 업데이트되지 않음

### 가능한 원인들

#### 1. 이미 해당 주의 데이터가 존재함
**증상**: Cron을 실행해도 새 데이터가 생성되지 않음

**원인**: `run-cron.ts`에서 이미 해당 주의 데이터가 있으면 새로 생성하지 않습니다:
```typescript
const existingSignal = await db.getWeeklySignal(weekStart);
if (existingSignal) {
  console.log(`Signal already computed for week ${weekStart}`);
  return; // 여기서 종료!
}
```

**해결 방법**:
- Supabase에서 해당 주의 데이터를 삭제하고 다시 실행
- 또는 다음 주까지 기다리기

---

#### 2. Cron 실행 중 에러 발생
**증상**: Vercel 로그에 에러 메시지가 표시됨

**확인 방법**:
1. Vercel 대시보드 → Logs
2. `/api/cron` 필터 적용
3. 에러 메시지 확인

**일반적인 에러들**:
- API 키 누락 (EIA, FRED, OpenAI)
- Supabase 연결 실패
- 네트워크 타임아웃

---

#### 3. 현재 주 계산 문제
**증상**: 잘못된 주의 데이터가 표시됨

**확인 방법**:
- 현재 날짜 확인
- `getCurrentWeekStart()` 함수가 올바른 주를 계산하는지 확인

---

## 확인 단계

### 1단계: Vercel 로그 확인
1. Vercel 대시보드 → Logs
2. `/api/cron` 필터 적용
3. 최근 실행 로그 확인
4. 성공 메시지 또는 에러 메시지 확인

**성공 시 예상 로그**:
```
Starting weekly economic data update...
Week start: 2025-12-29
Fetching economic data...
...
Weekly update completed successfully!
```

**실패 시 예상 로그**:
```
Error in cron endpoint: ...
```

---

### 2단계: Supabase 데이터 확인
1. Supabase 대시보드 → Table Editor
2. `weekly_signals` 테이블 확인
3. 최신 데이터 확인:
   - `week_start` 컬럼 확인
   - `created_at` 컬럼 확인
   - 데이터가 있는지 확인

---

### 3단계: 현재 주 확인
현재 날짜가 2025년 12월 29일이라면:
- 이번 주 시작일: 2025년 12월 29일 (일요일)
- 표시된 데이터: 2025년 12월 28일 주간 → **이전 주 데이터**

**이 경우**:
- 다음 주까지 기다리기
- 또는 수동으로 이번 주 데이터 생성

---

## 해결 방법

### 방법 1: Supabase에서 데이터 확인 및 삭제
1. Supabase → Table Editor → `weekly_signals`
2. 최신 데이터 확인
3. 필요시 이전 데이터 삭제
4. Cron 다시 실행

### 방법 2: 로컬에서 수동 실행
```bash
npm run cron
```

이 명령어는:
- 현재 주의 데이터 생성
- Supabase에 저장
- 에러 메시지 확인 가능

### 방법 3: API 직접 호출
```powershell
Invoke-RestMethod -Uri "https://cost-signal.vercel.app/api/cron" -Method GET
```

---

## 예상 시나리오

### 시나리오 1: 정상 작동
- Cron 실행 → 새 데이터 생성 → 사이트에 최신 데이터 표시

### 시나리오 2: 이미 데이터 존재
- Cron 실행 → "이미 존재함" 메시지 → 기존 데이터 유지

### 시나리오 3: 에러 발생
- Cron 실행 → 에러 발생 → 로그에 에러 메시지 표시

---

## 다음 단계

1. **Vercel 로그 확인** - cron 실행 결과 확인
2. **Supabase 확인** - 데이터가 실제로 저장되었는지 확인
3. **현재 날짜 확인** - 올바른 주의 데이터인지 확인
