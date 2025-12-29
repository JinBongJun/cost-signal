# Supabase 설정 가이드

## 1. 환경 변수 설정

### 로컬 개발 (.env 파일)

`.env` 파일에 다음을 추가하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sstrqfygphaalevfjzxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdHJxZnlncGhhYWxldmZqenhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MzM3MzcsImV4cCI6MjA4MjQwOTczN30.BTevo4a7eBz4HWf_mGDal_SldSkrdZ4Yw8dLKCSZKXE
```

### Vercel 배포 환경

1. Vercel 대시보드 → 프로젝트 → "Settings" → "Environment Variables"
2. 다음 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://sstrqfygphaalevfjzxc.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (anon public key)

## 2. Supabase 데이터베이스 테이블 생성

1. Supabase 대시보드 → 프로젝트 선택
2. 왼쪽 메뉴에서 "SQL Editor" 클릭
3. "New query" 클릭
4. `supabase-schema.sql` 파일의 내용을 복사해서 붙여넣기
5. "Run" 버튼 클릭

또는 직접 SQL Editor에서 다음 SQL을 실행:

```sql
-- Indicators table
CREATE TABLE IF NOT EXISTS indicators (
  id BIGSERIAL PRIMARY KEY,
  week_start TEXT NOT NULL,
  indicator_type TEXT NOT NULL CHECK(indicator_type IN ('gas', 'cpi', 'interest_rate', 'unemployment')),
  value NUMERIC NOT NULL,
  previous_value NUMERIC,
  change_percent NUMERIC,
  status TEXT NOT NULL CHECK(status IN ('ok', 'caution', 'risk')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(week_start, indicator_type)
);

-- Weekly signals table
CREATE TABLE IF NOT EXISTS weekly_signals (
  id BIGSERIAL PRIMARY KEY,
  week_start TEXT NOT NULL UNIQUE,
  overall_status TEXT NOT NULL CHECK(overall_status IN ('ok', 'caution', 'risk')),
  risk_count INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verified TIMESTAMPTZ,
  name TEXT,
  image TEXT,
  password TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts table (for OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_account_id)
);

-- Sessions table (for NextAuth sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  expires BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verification tokens table (for email verification)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires BIGINT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Subscriptions table (for Paddle subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL CHECK(status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  plan TEXT NOT NULL CHECK(plan IN ('monthly', 'yearly', 'early_bird')),
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_indicators_week ON indicators(week_start);
CREATE INDEX IF NOT EXISTS idx_indicators_type ON indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

## 3. Row Level Security (RLS) 설정

Supabase는 기본적으로 Row Level Security가 활성화되어 있습니다. 
현재는 서버 사이드에서만 접근하므로 RLS를 비활성화하거나 적절한 정책을 설정해야 합니다.

### 옵션 1: RLS 비활성화 (개발 단계)

각 테이블에 대해 RLS를 비활성화:

```sql
ALTER TABLE indicators DISABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
```

### 옵션 2: 서비스 역할 키 사용 (프로덕션 권장)

서버 사이드에서는 service_role key를 사용하여 RLS를 우회할 수 있습니다.
하지만 현재는 anon key를 사용하므로 RLS를 비활성화하는 것이 더 간단합니다.

## 4. 테스트

1. 로컬에서 테스트:
   ```bash
   npm run dev
   ```

2. 초기 데이터 생성:
   ```bash
   npm run cron
   ```

3. 사이트 접속:
   - http://localhost:3000

## 5. Vercel 배포

1. 환경 변수 추가 (위 참조)
2. GitHub에 푸시
3. Vercel 자동 배포 확인
4. 배포 후 `/api/cron` 엔드포인트 호출하여 초기 데이터 생성



