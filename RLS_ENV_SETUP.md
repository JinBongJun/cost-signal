# RLS 환경 변수 설정 가이드

## Service Role Key 추가 필요

RLS가 활성화되었으므로, 서버 사이드에서 모든 데이터에 접근하려면 `SUPABASE_SERVICE_ROLE_KEY`를 환경 변수에 추가해야 합니다.

## 설정 방법

### 1. Supabase에서 Service Role Key 가져오기

1. Supabase Dashboard → Settings → API
2. "service_role" 섹션에서 "service_role key" 복사
   - ⚠️ **주의**: 이 키는 절대 클라이언트에 노출되면 안 됩니다!

### 2. 로컬 환경 변수 추가

`.env` 파일에 추가:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Vercel 환경 변수 추가

1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. 다음 변수 추가:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Supabase에서 복사한 service_role key
   - **Environment**: Production, Preview, Development 모두 선택

## 보안 주의사항

- ✅ **서버 사이드에서만 사용**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 코드에 포함되면 안 됩니다
- ✅ **환경 변수로 관리**: `.env` 파일에만 저장하고 Git에 커밋하지 마세요
- ✅ **`.gitignore` 확인**: `.env` 파일이 `.gitignore`에 포함되어 있는지 확인하세요

## 동작 방식

- **서버 사이드**: `service_role` 키 사용 → RLS 우회, 모든 데이터 접근 가능
- **클라이언트 사이드**: `anon` 키 사용 → RLS 정책 적용, 사용자별 데이터만 접근

## 현재 코드 변경사항

`lib/supabase.ts`가 다음과 같이 변경되었습니다:

1. `SUPABASE_SERVICE_ROLE_KEY`를 우선적으로 사용
2. 없으면 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 사용 (하위 호환성)
3. 서버 사이드 전용 설정 적용

## 테스트

환경 변수를 추가한 후:

1. 로컬에서 `npm run dev` 실행
2. 앱이 정상적으로 작동하는지 확인
3. 데이터베이스 쿼리가 성공하는지 확인

