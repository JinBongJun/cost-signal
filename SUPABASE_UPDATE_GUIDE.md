# Supabase 데이터베이스 업데이트 가이드

## 3단계 시스템 적용을 위한 마이그레이션

### 단계 1: Supabase 대시보드 접속

1. https://supabase.com 접속
2. 로그인
3. 프로젝트 선택 (cost-signal 프로젝트)

---

### 단계 2: SQL Editor 열기

1. 왼쪽 사이드바에서 **"SQL Editor"** 클릭
   - 또는 상단 메뉴에서 **"SQL Editor"** 선택
2. **"New query"** 버튼 클릭 (새 쿼리 창 열기)

---

### 단계 3: 마이그레이션 SQL 실행

1. 아래 SQL 코드를 복사:

```sql
-- Migration: Add 'caution' status to indicators table
-- Update the CHECK constraint to include 'caution'

ALTER TABLE indicators 
DROP CONSTRAINT IF EXISTS indicators_status_check;

ALTER TABLE indicators 
ADD CONSTRAINT indicators_status_check 
CHECK (status IN ('ok', 'caution', 'risk'));
```

2. SQL Editor에 붙여넣기
3. **"Run"** 버튼 클릭 (또는 `Ctrl+Enter` / `Cmd+Enter`)

---

### 단계 4: 확인

1. 실행 결과 확인:
   - 성공 메시지: "Success. No rows returned"
   - 에러가 없으면 정상적으로 완료된 것입니다

2. 테이블 구조 확인 (선택사항):
   - 왼쪽 사이드바에서 **"Table Editor"** 클릭
   - `indicators` 테이블 선택
   - 스키마에서 `status` 컬럼이 `('ok', 'caution', 'risk')`를 허용하는지 확인

---

## 주의사항

- ✅ 기존 데이터는 그대로 유지됩니다 (`'ok'` 또는 `'risk'` 상태)
- ✅ 새로운 데이터부터 `'caution'` 상태를 사용할 수 있습니다
- ⚠️ 이 마이그레이션은 안전합니다 (기존 데이터에 영향 없음)

---

## 문제 해결

### 에러: "constraint does not exist"
- 정상입니다. `DROP CONSTRAINT IF EXISTS`가 이미 없는 제약 조건을 삭제하려고 시도할 수 있습니다.
- 두 번째 `ALTER TABLE` 문만 실행해도 됩니다.

### 에러: "permission denied"
- Supabase 프로젝트의 Owner 권한이 필요합니다.
- 프로젝트 설정에서 권한을 확인하세요.

---

## 완료 후

마이그레이션이 완료되면:
1. 다음 주간 업데이트(cron job) 실행 시 자동으로 3단계 시스템이 적용됩니다
2. 새로운 데이터부터 `'caution'` 상태가 사용됩니다
3. 기존 데이터는 그대로 유지됩니다

