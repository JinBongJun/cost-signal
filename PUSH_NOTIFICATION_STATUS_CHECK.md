# 푸시 알림 상태 확인 가이드

## 화면에서 확인할 것

### ✅ 정상 작동하는 것들

1. **서비스 워커 로그**
   - 콘솔에 "Service Worker" 관련 메시지가 많이 보임
   - 이는 서비스 워커가 등록되고 작동 중이라는 의미

2. **페이지 로드**
   - "Cost Signal" 페이지가 정상적으로 표시됨
   - 경제 신호 (CAUTION)가 표시됨

3. **로그인 상태**
   - "Signed in as bongjun0289@gmail.com" 표시
   - 인증이 정상 작동

---

### ⚠️ 확인이 필요한 것

1. **403 에러 (`/api/signal?tier=paid`)**
   - 이건 **정상**일 수 있음
   - 유료 구독이 없으면 403이 맞음
   - 무료 사용자는 paid tier 접근 불가

2. **푸시 알림 구독 상태**
   - 버튼이 "🔔 Enable Weekly Notifications"인지
   - 아니면 "🔕 Disable Notifications"로 바뀌었는지 확인

---

## 푸시 알림 작동 확인 방법

### 방법 1: 버튼 상태 확인

**"🔔 Enable Weekly Notifications" 버튼을 클릭했을 때:**

✅ **성공하면:**
- 버튼이 "🔕 Disable Notifications"로 변경
- 알림 팝업: "✅ Notifications enabled!"

❌ **실패하면:**
- 버튼이 그대로 "🔔 Enable Weekly Notifications"
- 알림 팝업: "❌ Failed to enable notifications..."

---

### 방법 2: 콘솔 로그 확인

콘솔에서 다음 메시지들을 찾아보세요:

✅ **성공 메시지:**
```
Registering service worker...
Service Worker registered: ...
Service Worker is ready
Subscribing to push notifications...
✅ Push notification subscription successful
```

❌ **실패 메시지:**
```
Service Worker registration failed: ...
Failed to subscribe to push notifications
Error: ...
```

---

### 방법 3: 브라우저 개발자 도구 확인

1. **Application 탭 → Service Workers**
   - 등록된 서비스 워커가 있는지 확인
   - 상태가 "activated and is running"인지 확인

2. **Application 탭 → Storage → IndexedDB**
   - 푸시 구독 정보가 저장되어 있는지 확인

---

## 403 에러에 대해

### `/api/signal?tier=paid` 403 에러

이건 **정상**일 수 있습니다:
- 유료 구독이 없으면 403이 맞음
- 무료 사용자는 paid tier 접근 불가
- 코드에서 자동으로 free tier로 fallback함

**확인 방법:**
- 페이지가 정상적으로 표시되면 문제 없음
- 유료 기능을 보려면 실제 구독 필요

---

## 다음 단계

1. **"🔔 Enable Weekly Notifications" 버튼 클릭**
2. **알림 팝업 확인**
3. **버튼 상태 변경 확인**
4. **콘솔 로그 확인**

버튼을 클릭해보고 결과를 알려주세요!

