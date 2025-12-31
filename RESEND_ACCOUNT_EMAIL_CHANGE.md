# Resend 계정 이메일 변경 방법

## 현재 위치
- Settings → Team 탭 (팀 관리)
- ❌ 여기서는 계정 이메일을 변경할 수 없습니다

## 계정 이메일 변경 위치

### 방법 1: Account Settings (권장)

1. **왼쪽 사이드바에서 "Settings" 클릭** (현재 위치)
2. **상단 탭에서 "Account" 또는 "Profile" 탭 찾기**
   - Settings 페이지의 탭 목록:
     - Usage
     - Billing
     - Team (현재 위치)
     - **Account** 또는 **Profile** ← 여기!
     - SMTP
     - Integrations
     - Unsubscribe Page
     - Documents

3. **"Account" 또는 "Profile" 탭 클릭**
4. **"Email" 또는 "Account Email" 필드 찾기**
5. **이메일을 `bongjun0289@gmail.com`으로 변경**
6. **저장**

### 방법 2: 우측 상단 프로필 메뉴

1. **우측 상단의 사용자 이메일/아바타 클릭**
   - 현재: `bongjun0289@dau...` (사이드바 하단)
2. **"Account Settings" 또는 "Profile" 선택**
3. **이메일 변경**

## 확인 사항

변경 후:
- ✅ 새 이메일로 인증 메일이 발송됨
- ✅ 인증 완료 후 계정 이메일이 변경됨
- ✅ 테스트 도메인(`onboarding@resend.dev`)은 새 계정 이메일로만 전송 가능

## 다음 단계

계정 이메일을 Gmail로 변경한 후:

1. **환경 변수 업데이트**
   ```env
   ADMIN_EMAIL=bongjun0289@gmail.com
   ```

2. **Vercel 환경 변수도 업데이트**

3. **재배포 및 테스트**

---

## 참고

- Team 설정: 팀 이름, 아바타, 멤버 관리
- Account 설정: 개인 계정 이메일, 비밀번호, 2FA 등

계정 이메일은 **Account** 또는 **Profile** 탭에서 변경할 수 있습니다!

