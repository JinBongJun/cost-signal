# Vercel Postgres 마이그레이션 가이드

## 문제 상황
현재 SQLite를 사용하고 있지만, Vercel 서버리스 환경에서는 각 함수 인스턴스가 독립적인 `/tmp` 디렉토리를 가지고 있어서 데이터를 공유할 수 없습니다.

## 해결 방법: Vercel Postgres 사용

### 1단계: Vercel Postgres 생성
1. Vercel 대시보드 → 프로젝트 → "Storage" 탭
2. "Create Database" 클릭
3. "Postgres" 선택
4. 데이터베이스 이름 입력 (예: `cost-signal-db`)
5. 지역 선택 (가장 가까운 지역)
6. "Create" 클릭

### 2단계: 환경 변수 자동 설정
- Vercel Postgres를 생성하면 자동으로 환경 변수가 설정됩니다:
  - `POSTGRES_URL`
  - `POSTGRES_PRISMA_URL`
  - `POSTGRES_URL_NON_POOLING`

### 3단계: 패키지 설치
```bash
npm install @vercel/postgres
```

### 4단계: 코드 수정
`lib/db.ts`를 Postgres를 사용하도록 수정해야 합니다.

### 5단계: 테이블 생성
Vercel Postgres 대시보드에서 SQL 쿼리를 실행하거나, 마이그레이션 스크립트를 실행합니다.

## 대안: Supabase 사용
Vercel Postgres 대신 Supabase를 사용할 수도 있습니다:
- 무료 티어 제공
- PostgreSQL 기반
- Vercel과 쉽게 통합 가능




