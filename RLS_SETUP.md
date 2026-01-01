# Row Level Security (RLS) Setup Guide

## 개요

Row Level Security (RLS)는 데이터베이스 레벨에서 사용자별 데이터 접근을 제어하는 보안 기능입니다. 이는 API 레벨 보안에 추가되는 강력한 보안 레이어입니다.

## 현재 프로젝트 상황

현재 프로젝트는 **NextAuth**를 사용하고 있으며, Supabase는 데이터베이스로만 사용하고 있습니다. 

### RLS 적용 시 고려사항

1. **서버 사이드 접근**: 
   - 현재 프로젝트는 서버 사이드에서만 Supabase를 사용합니다
   - `service_role` 키를 사용하면 RLS를 우회할 수 있습니다
   - 서버 사이드 코드는 변경 없이 계속 작동합니다

2. **클라이언트 사이드 접근**:
   - 만약 나중에 클라이언트에서 직접 Supabase를 사용한다면
   - `anon` 키를 사용하고 RLS 정책이 적용됩니다
   - Supabase Auth로 인증해야 합니다

## RLS 적용 방법

### 1. Supabase SQL Editor에서 실행

1. Supabase Dashboard → SQL Editor로 이동
2. `supabase-migration-rls.sql` 파일의 내용을 복사
3. SQL Editor에 붙여넣고 실행

### 2. 적용되는 테이블

- ✅ **users**: 사용자가 자신의 정보만 조회/수정 가능
- ✅ **accounts**: 사용자가 자신의 OAuth 계정만 조회 가능
- ✅ **sessions**: 사용자가 자신의 세션만 조회 가능
- ✅ **subscriptions**: 사용자가 자신의 구독 정보만 조회/수정 가능
- ✅ **feedback**: 사용자가 자신이 제출한 피드백만 조회 가능
- ✅ **password_reset_tokens**: 사용자가 자신의 리셋 토큰만 조회 가능

### 3. 공개 데이터 (RLS 적용 안 함)

- **indicators**: 모든 사용자가 조회 가능 (공개 데이터)
- **weekly_signals**: 모든 사용자가 조회 가능 (공개 데이터)

## 보안 정책 구조

각 테이블에 대해 다음 정책들이 생성됩니다:

1. **사용자 정책**: `auth.uid() = user_id`로 자신의 데이터만 접근
2. **서비스 역할 정책**: `service_role` 키를 사용하는 서버 사이드 코드는 모든 데이터 접근 가능

## 현재 프로젝트에서의 동작

### 서버 사이드 (현재 방식)

```typescript
// lib/supabase.ts
// 현재는 anon_key를 사용하지만, RLS 적용 후에는:
// - 서버 사이드: service_role 키 사용 (RLS 우회)
// - 클라이언트 사이드: anon_key 사용 (RLS 적용)
```

### 권장 변경사항

서버 사이드에서 `service_role` 키를 사용하도록 변경하는 것을 권장합니다:

```typescript
// lib/supabase.ts (서버 사이드용)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // 서버 사이드 전용
);
```

## 테스트 방법

### 1. RLS 정책 확인

```sql
-- 각 테이블의 RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'users';
SELECT * FROM pg_policies WHERE tablename = 'subscriptions';
SELECT * FROM pg_policies WHERE tablename = 'feedback';
```

### 2. 정책 테스트

```sql
-- 사용자로 로그인한 상태에서 테스트
-- 자신의 데이터만 조회되는지 확인
SELECT * FROM subscriptions; -- 자신의 구독만 보여야 함
SELECT * FROM feedback; -- 자신의 피드백만 보여야 함
```

## 주의사항

1. **NextAuth와의 호환성**:
   - 현재 프로젝트는 NextAuth를 사용하므로 Supabase Auth를 사용하지 않습니다
   - RLS는 추가 보안 레이어로 작동합니다
   - 서버 사이드에서는 `service_role` 키를 사용하여 RLS를 우회합니다

2. **마이그레이션 순서**:
   - RLS를 활성화하기 전에 모든 데이터가 올바르게 저장되어 있는지 확인
   - 테스트 환경에서 먼저 적용해보기

3. **성능**:
   - RLS는 약간의 성능 오버헤드가 있지만 미미합니다
   - 인덱스가 올바르게 설정되어 있으면 문제 없습니다

## 다음 단계

1. ✅ RLS 마이그레이션 파일 생성 완료
2. ⏳ Supabase SQL Editor에서 실행
3. ⏳ 서버 사이드 코드에서 `service_role` 키 사용하도록 변경 (선택사항)
4. ⏳ 테스트 및 검증

## 참고 자료

- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)


