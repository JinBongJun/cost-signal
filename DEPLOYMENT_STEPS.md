# 배포 단계별 가이드

## ✅ 완료된 작업
- [x] Supabase 프로젝트 생성
- [x] 테이블 생성 및 RLS 비활성화
- [x] 코드 마이그레이션 (SQLite → Supabase)
- [x] 로컬 환경 변수 설정
- [x] 로컬 테스트 성공

## 📋 다음 단계

### 1단계: 초기 데이터 생성 (로컬)
```bash
npm run cron
```

이 명령어는:
- 정부 API에서 최신 경제 데이터 가져오기
- 신호 계산 및 Supabase에 저장
- 약 1-2분 소요

**예상 결과:**
```
Starting weekly economic data update...
Week start: 2025-01-20
Fetching economic data...
Gas: $3.45/gal (ok)
CPI: 305.23 (ok)
Interest Rate: 5.25% (ok)
Unemployment: 3.7% (ok)
Overall signal: OK (0 risk indicators)
Generating explanation...
Weekly update completed successfully!
```

---

### 2단계: Vercel 환경 변수 추가

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택: `cost-signal`

2. **Settings → Environment Variables** 이동

3. **다음 환경 변수 추가:**

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | Production, Preview, Development |
   | `NEXTAUTH_SECRET` | 랜덤 문자열 (기존 값 유지) | Production, Preview, Development |
   | `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
   | `OPENAI_API_KEY` | OpenAI API 키 (기존 값 유지) | Production, Preview, Development |

   **참고:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 설정 → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 프로젝트 설정 → API → anon public key

4. **각 환경 변수 추가 후:**
   - ✅ "Production", "Preview", "Development" 모두 체크
   - "Save" 클릭

---

### 3단계: GitHub에 푸시

```bash
# 변경사항 확인
git status

# 모든 변경사항 추가
git add .

# 커밋
git commit -m "Migrate from SQLite to Supabase"

# GitHub에 푸시
git push origin main
```

---

### 4단계: Vercel 자동 배포 확인

1. **GitHub 푸시 후 자동 배포 시작**
   - Vercel 대시보드에서 배포 상태 확인
   - 약 2-3분 소요

2. **배포 완료 후:**
   - 배포된 사이트 URL 접속
   - 데이터가 정상적으로 표시되는지 확인

---

### 5단계: 프로덕션 데이터 생성

배포된 사이트에서:
1. Vercel 대시보드 → Functions 탭
2. `/api/cron` 엔드포인트 찾기
3. 또는 로컬에서 다음 명령어로 프로덕션 API 호출:

```bash
# 프로덕션 URL로 cron 실행
curl -X POST https://your-domain.vercel.app/api/cron
```

**또는 Vercel Cron 설정:**
- Vercel 대시보드 → Settings → Cron Jobs
- 매주 월요일 오전 9시에 자동 실행되도록 설정

---

## 🔍 문제 해결

### 데이터가 표시되지 않는 경우
1. Supabase 테이블 확인:
   - Supabase 대시보드 → Table Editor
   - `indicators`, `weekly_signals` 테이블에 데이터가 있는지 확인

2. 환경 변수 확인:
   - Vercel 대시보드 → Settings → Environment Variables
   - 모든 변수가 올바르게 설정되었는지 확인

3. 로그 확인:
   - Vercel 대시보드 → Deployments → 최신 배포 → Functions 탭
   - 에러 메시지 확인

---

## ✅ 완료 체크리스트

- [ ] 로컬에서 `npm run cron` 실행 성공
- [ ] Vercel에 환경 변수 추가 완료
- [ ] GitHub에 푸시 완료
- [ ] Vercel 배포 성공
- [ ] 배포된 사이트에서 데이터 표시 확인
- [ ] 프로덕션에서 초기 데이터 생성 완료

---

## 다음 작업 (선택사항)

- [ ] Paddle 결제 통합
- [ ] PWA 설정 완료
- [ ] 도메인 연결
- [ ] 자동화된 주간 업데이트 설정


