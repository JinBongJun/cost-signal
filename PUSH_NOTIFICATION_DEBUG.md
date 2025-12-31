# 푸시 알림 디버깅 가이드

## 문제: 버튼을 눌렀는데 반응이 없음

### 확인 사항

1. **브라우저 콘솔 확인**
   - F12 또는 우클릭 → "검사" → "Console" 탭
   - 에러 메시지 확인
   - 빨간색 에러가 있으면 스크린샷 찍어서 확인

2. **서비스 워커 확인**
   - 브라우저 개발자 도구 → "Application" 탭
   - 왼쪽 사이드바에서 "Service Workers" 클릭
   - 등록된 서비스 워커가 있는지 확인

3. **VAPID 키 확인**
   - 브라우저 콘솔에서 실행:
     ```javascript
     console.log('VAPID Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
     ```
   - 값이 `undefined`이면 환경 변수 문제

---

## 일반적인 문제들

### 1. VAPID 키가 로드되지 않음

**증상:**
- 콘솔에 "VAPID public key not found" 에러

**해결:**
1. `.env` 파일에 `NEXT_PUBLIC_VAPID_PUBLIC_KEY` 확인
2. 개발 서버 재시작 (`npm run dev`)
3. 브라우저 새로고침 (Ctrl+Shift+R)

---

### 2. 서비스 워커 등록 실패

**증상:**
- 콘솔에 "Service Worker registration failed" 에러

**해결:**
1. HTTPS 사용 (localhost는 괜찮지만 production은 HTTPS 필요)
2. `public/sw.js` 파일이 존재하는지 확인
3. 브라우저 캐시 삭제 후 재시도

---

### 3. 알림 권한 거부됨

**증상:**
- 브라우저에서 알림 권한 팝업이 안 뜸
- 또는 "denied" 상태

**해결:**
1. 브라우저 설정 → 사이트 설정 → 알림
2. 해당 사이트의 알림 권한 확인
3. "차단"이면 "허용"으로 변경
4. 또는 브라우저 재시작

---

### 4. HTTPS 필요 (Production)

**증상:**
- 로컬에서는 작동하지만 production에서 안 됨

**해결:**
- Production은 반드시 HTTPS 필요
- Vercel은 자동으로 HTTPS 제공

---

## 테스트 방법

### 1. 브라우저 콘솔에서 직접 테스트

```javascript
// 서비스 워커 등록 확인
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// 알림 권한 확인
console.log('Notification permission:', Notification.permission);

// VAPID 키 확인
console.log('VAPID Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
```

### 2. 수동으로 서비스 워커 등록

```javascript
navigator.serviceWorker.register('/sw.js')
  .then(reg => console.log('Registered:', reg))
  .catch(err => console.error('Error:', err));
```

---

## 개선된 코드

코드에 더 자세한 로그와 에러 처리를 추가했습니다:
- 각 단계마다 콘솔 로그 출력
- 명확한 에러 메시지
- 사용자에게 친화적인 알림

이제 버튼을 다시 눌러보고 브라우저 콘솔을 확인해보세요!


