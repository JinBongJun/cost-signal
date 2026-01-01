# 인증 시스템 활성화 가이드

## 생성된 값

**NEXTAUTH_SECRET:**
```
vBWS9RuEF33HsWLuBfkJxe2Z0Q4aD5WbdPyw+67cYDo=
```

**NEXTAUTH_URL:**
```
https://cost-signal.vercel.app
```

---

## Vercel에 환경 변수 추가하기

### 1단계: Vercel 대시보드 접속
1. https://vercel.com/dashboard 접속
2. `cost-signal` 프로젝트 클릭

### 2단계: Settings → Environment Variables 이동
1. 왼쪽 메뉴에서 **"Settings"** 클릭
2. **"Environment Variables"** 클릭

### 3단계: 환경 변수 추가

#### 변수 1: NEXTAUTH_SECRET
1. **"Add New"** 버튼 클릭
2. **Key**: `NEXTAUTH_SECRET`
3. **Value**: `vBWS9RuEF33HsWLuBfkJxe2Z0Q4aD5WbdPyw+67cYDo=`
4. **Environment**: 모든 환경 선택 (Production, Preview, Development)
5. **"Save"** 클릭

#### 변수 2: NEXTAUTH_URL
1. **"Add New"** 버튼 클릭
2. **Key**: `NEXTAUTH_URL`
3. **Value**: `https://cost-signal.vercel.app`
4. **Environment**: 모든 환경 선택
5. **"Save"** 클릭

### 4단계: 재배포
1. 환경 변수 추가 후 자동으로 재배포가 시작됩니다
2. 또는 수동으로 **Deployments** → **"Redeploy"** 클릭

---

## 확인 방법

### 1. 재배포 완료 대기
- Vercel 대시보드 → Deployments에서 배포 완료 확인

### 2. 로그인 테스트
1. https://cost-signal.vercel.app 접속
2. **"Sign Up"** 클릭
3. 이메일과 비밀번호로 회원가입
4. 로그인 확인

### 3. 세션 확인
1. 로그인 후 페이지 새로고침
2. 로그인 상태가 유지되는지 확인
3. **"Sign Out"** 기능 테스트

---

## 문제 해결

### 로그인이 안 될 때
1. Vercel → Logs → Functions → `/api/auth/[...nextauth]` 확인
2. 에러 메시지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 세션이 유지되지 않을 때
1. `NEXTAUTH_URL`이 정확한지 확인
2. 쿠키 설정 확인 (브라우저 개발자 도구)

---

## 다음 단계

인증 시스템 활성화 완료 후:
1. ✅ 회원가입/로그인 테스트
2. ✅ 유료 기능 접근 테스트
3. ✅ 세션 관리 확인




