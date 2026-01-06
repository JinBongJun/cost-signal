# Supabase 테이블 수정 가이드

## 문제
NextAuth를 사용하고 있어서 user ID가 Supabase `auth.users` 테이블에 없습니다. Foreign key constraint 때문에 에러가 발생합니다.

## 해결 방법

### 옵션 1: 기존 테이블 수정 (데이터 보존)

Supabase SQL Editor에서 다음을 실행:

```sql
-- 1. Foreign key constraint 제거
ALTER TABLE user_spending_patterns 
  DROP CONSTRAINT IF EXISTS user_spending_patterns_user_id_fkey;

-- 2. user_id 컬럼 타입 변경 (UUID → TEXT)
ALTER TABLE user_spending_patterns 
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 3. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Users can view own spending patterns" ON user_spending_patterns;
DROP POLICY IF EXISTS "Users can insert own spending patterns" ON user_spending_patterns;
DROP POLICY IF EXISTS "Users can update own spending patterns" ON user_spending_patterns;
DROP POLICY IF EXISTS "Users can delete own spending patterns" ON user_spending_patterns;

-- 4. Service role 정책 추가 (API가 service_role key를 사용하므로)
CREATE POLICY "Service role can manage all spending patterns"
  ON user_spending_patterns
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 옵션 2: 테이블 재생성 (데이터 삭제)

기존 데이터가 중요하지 않다면 `supabase-migration-spending-patterns-fix.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요.

## 확인 방법

1. Supabase Dashboard → SQL Editor
2. 위 SQL 실행
3. 다시 저장 시도

