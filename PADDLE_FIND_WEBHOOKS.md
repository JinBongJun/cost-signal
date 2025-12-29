# Paddle Dashboard에서 Webhooks 찾기

## 방법 1: Developer Tools → Notifications

1. **왼쪽 사이드바에서 "Developer Tools" 클릭**
   - 현재 화면에서 보이는 것처럼 "Developer Tools"가 보일 것입니다

2. **"Notifications" 클릭**
   - "Developer Tools" 아래에 "Notifications" 메뉴가 보일 것입니다
   - Webhooks는 보통 "Notifications" 섹션에 있습니다

3. **Webhooks 탭 확인**
   - "Notifications" 페이지에서 "Webhooks" 탭 클릭
   - 또는 상단에 "Webhooks" 메뉴가 있을 수 있습니다

---

## 방법 2: Settings에서 찾기

1. **상단 오른쪽의 설정 아이콘 클릭**
   - 프로필 아이콘 옆의 설정 아이콘

2. **"Developer Settings" 또는 "API Settings" 찾기**
   - Webhooks 설정이 여기에 있을 수 있습니다

---

## 방법 3: 직접 URL 접근

1. **Webhooks 페이지로 직접 이동**
   - URL에 `/notifications/webhooks` 또는 `/developer-tools/webhooks` 추가
   - 예: `https://vendors.paddle.com/notifications/webhooks`

---

## 방법 4: Sandbox 환경 확인

현재 화면에 "Experiment in sandbox" 섹션이 보입니다.

1. **Sandbox 계정 사용 중인지 확인**
   - Sandbox 환경에서는 Webhooks 설정이 다를 수 있습니다
   - Production 환경으로 전환하거나
   - Sandbox 전용 Webhooks 설정 확인

2. **Sandbox Webhooks**
   - Sandbox 환경에서는 별도의 Webhooks 설정이 필요할 수 있습니다
   - "Try sandbox" 버튼을 클릭하여 Sandbox 환경 확인

---

## 방법 5: 검색 기능 사용

1. **Dashboard 상단의 검색창 사용**
   - "webhook" 또는 "webhooks" 검색
   - 관련 메뉴가 표시될 것입니다

---

## 대안: API Key로 Webhook Secret 확인

Webhooks UI가 보이지 않으면, API를 통해 확인할 수 있습니다:

1. **API Key 확인**
   - "Developer Tools" → "Authentication"에서 API Key 확인

2. **API로 Webhook 설정 확인**
   - Paddle API를 사용하여 Webhook 설정 조회

---

## 문제 해결

### "Notifications" 메뉴가 안 보이는 경우

1. **계정 권한 확인**
   - 관리자 권한이 있는지 확인
   - 일부 기능은 특정 권한이 필요할 수 있습니다

2. **계정 상태 확인**
   - 현재 화면에 "Website verification" 실패 메시지가 보입니다
   - 계정 검증이 완료되지 않아 일부 기능이 제한될 수 있습니다
   - 먼저 계정 검증을 완료해야 할 수도 있습니다

3. **Paddle 지원팀 문의**
   - "customer support" 링크를 통해 문의
   - Webhooks 설정 위치를 직접 물어보기

---

## 임시 해결책

Webhooks UI가 보이지 않으면:

1. **API Key로 테스트**
   - 일단 API Key만으로 개발 진행
   - Webhook Secret은 나중에 설정

2. **Paddle 지원팀 문의**
   - Webhooks 설정 위치 문의
   - 또는 Webhook Secret을 직접 요청

---

## 다음 단계

1. **"Developer Tools" → "Notifications" 클릭해보기**
2. **"Notifications" 페이지에서 "Webhooks" 탭 찾기**
3. **안 보이면 Paddle 지원팀 문의**

현재 화면에서 "Developer Tools" → "Notifications"를 클릭해보세요!

