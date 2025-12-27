# 자동화 설정 가이드

## 현재 상태

✅ **푸시 알림 (휴대폰 알림)**: 이미 구현 완료
- 사용자가 "주간 알림 받기" 버튼 클릭
- 매주 월요일 자동으로 휴대폰에 알림 발송

✅ **데이터 수집 자동화**: 배포 후 자동 실행
- Vercel에 배포하면 `vercel.json` 설정으로 자동 실행
- 로컬에서는 수동 실행 필요

## 자동화 옵션

### 옵션 1: Vercel 배포 (가장 쉬움) ⭐ 추천

1. GitHub에 코드 푸시
2. Vercel에 배포
3. 환경 변수 설정
4. **끝!** 매주 월요일 자동 실행

**장점:**
- 완전 자동화
- 무료 플랜 사용 가능
- 별도 설정 불필요

### 옵션 2: Windows 작업 스케줄러 (로컬)

PowerShell을 **관리자 권한**으로 실행:

```powershell
cd "C:\Users\user\Desktop\cost signal"
.\scripts\setup-windows-scheduler.ps1
```

또는 수동 설정:
1. 작업 스케줄러 열기
2. 기본 작업 만들기
3. 트리거: 매주 월요일 오전 9시
4. 작업: `npm run cron` 실행

### 옵션 3: GitHub Actions (무료)

`.github/workflows/weekly-update.yml` 파일 생성:

```yaml
name: Weekly Update

on:
  schedule:
    - cron: '0 9 * * 1'  # 매주 월요일 9시 UTC
  workflow_dispatch:  # 수동 실행도 가능

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run cron
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          EIA_API_KEY: ${{ secrets.EIA_API_KEY }}
          FRED_API_KEY: ${{ secrets.FRED_API_KEY }}
```

## 알림 방식

### 현재 구현: 푸시 알림 (휴대폰 알림) ✅

- **방식**: 브라우저 푸시 알림
- **장점**: 
  - 즉시 확인 가능
  - 앱 설치 없이도 작동
  - 사용자가 직접 구독/해제 가능
- **작동**: 
  - 사용자가 "주간 알림 받기" 클릭
  - 매주 월요일 자동 발송

### 이메일 알림 (구현 안 됨)

필요하다면 추가 가능하지만, 푸시 알림이 더 나은 이유:
- ✅ 즉시 확인 가능
- ✅ 이메일 스팸 폴더에 안 들어감
- ✅ 사용자 참여도 높음
- ✅ 설정 간단

## 결론

**현재 상태:**
- ✅ 휴대폰 푸시 알림: 완료
- ⚠️ 데이터 수집 자동화: 배포 후 자동 실행

**추천:**
1. Vercel에 배포 → 완전 자동화
2. 사용자는 "주간 알림 받기" 클릭
3. 매주 월요일 자동으로:
   - 데이터 수집
   - 신호 계산
   - 휴대폰 알림 발송

**이메일 알림은 필요 없습니다!** 푸시 알림이 더 효과적입니다.




