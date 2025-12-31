# 캐시 문제 해결 가이드

## 문제 상황
- ✅ Supabase에 최신 데이터 있음: `2025-12-29` (caution, risk_count: 1)
- ❌ 사이트에는 이전 데이터 표시: `2025-12-28` (ok, risk_count: 0)

## 원인
브라우저나 Vercel이 이전 데이터를 캐시하고 있을 가능성이 높습니다.

---

## 해결 방법

### 방법 1: 브라우저 강력 새로고침 (가장 간단)
1. **Ctrl + F5** (Windows) 또는 **Cmd + Shift + R** (Mac)
2. 또는 **F12** → Network 탭 → "Disable cache" 체크 → 새로고침

### 방법 2: API 직접 확인
브라우저에서 직접 API 호출:
```
https://cost-signal.vercel.app/api/signal
```

**예상 결과:**
```json
{
  "week_start": "2025-12-29",
  "overall_status": "caution",
  "risk_count": 1
}
```

만약 여전히 `2025-12-28`이 나오면:
- Vercel 캐시 문제
- API 코드 문제

### 방법 3: 시크릿 모드에서 확인
1. 시크릿/프라이빗 모드 열기
2. 사이트 접속
3. 최신 데이터가 표시되는지 확인

---

## 확인 체크리스트

- [ ] 브라우저 강력 새로고침 (Ctrl+F5)
- [ ] API 직접 호출해서 확인
- [ ] 시크릿 모드에서 확인
- [ ] Supabase 데이터 확인 (이미 확인함 ✅)

---

## 예상 결과

해결 후 사이트에 표시되어야 할 것:
- **Week of Sunday, December 29, 2025**
- **Status: CAUTION** (노란색)
- **Risk Count: 1**


