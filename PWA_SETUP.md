# PWA 푸시 알림 설정 가이드

## 1. VAPID 키를 .env 파일에 추가

생성된 VAPID 키를 `.env` 파일에 추가하세요:

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BA9SfeLb9DwxWFk83h2fUY6MYABbvIxqglqyGnT448OD5TsLoXPcrHGTPvmyUdMktxd4i4Wiq2gig14EiHVy0z8
VAPID_PRIVATE_KEY=aTHNIvcsBUe5vfV5U7kww_d58zJWMQh1xcz1g8UYo60
VAPID_EMAIL=mailto:your-email@example.com
```

⚠️ **중요**: `VAPID_EMAIL`을 실제 이메일 주소로 변경하세요 (예: `mailto:yourname@example.com`)

## 2. 아이콘 생성

PWA 아이콘이 필요합니다. `public/` 폴더에 다음 파일들을 추가하세요:

- `icon-192.png` (192x192 픽셀)
- `icon-512.png` (512x512 픽셀)

온라인 도구 사용:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

또는 간단한 아이콘을 만들려면:
1. 512x512 이미지를 준비
2. `public/icon-512.png`로 저장
3. 192x192로 리사이즈해서 `public/icon-192.png`로 저장

## 3. Service Worker 등록 확인

Service Worker는 `public/sw.js`에 있습니다. Next.js가 자동으로 등록합니다.

## 4. 테스트 방법

1. **개발 서버 재시작**:
   ```bash
   npm run dev
   ```

2. **브라우저에서 테스트**:
   - Chrome/Edge: `localhost:3000` 접속
   - "주간 알림 받기" 버튼 클릭
   - 알림 권한 허용
   - "앱으로 설치하기" 버튼으로 PWA 설치

3. **푸시 알림 테스트**:
   - 수동으로 알림 보내기: `npm run cron` 실행하면 자동으로 구독자에게 알림 발송

## 5. 주간 자동 알림

매주 월요일 `npm run cron`을 실행하면:
1. 경제 데이터 수집
2. 신호 계산
3. **모든 구독자에게 푸시 알림 자동 발송**

프로덕션에서는:
- Vercel Cron 사용 (이미 설정됨)
- 또는 외부 스케줄러에서 `POST /api/cron` 호출

## 6. 알림 내용

알림에는 다음이 포함됩니다:
- 제목: "Cost Signal: 🟢 OK" (신호에 따라 변경)
- 본문: LLM이 생성한 설명
- 클릭 시: 앱/웹사이트로 이동

## 문제 해결

### 알림이 오지 않을 때
1. 브라우저 알림 권한 확인
2. Service Worker 등록 확인 (브라우저 개발자 도구 → Application → Service Workers)
3. VAPID 키가 올바르게 설정되었는지 확인

### iOS에서 작동하지 않을 때
- iOS는 푸시 알림을 지원하지만 제한적입니다
- Safari에서 "홈 화면에 추가"로 설치 가능
- 푸시 알림은 iOS 16.4+ Safari에서만 지원

### Service Worker 오류
- `next.config.js`에서 PWA 설정 확인
- `public/sw.js` 파일이 존재하는지 확인
- 개발 모드에서는 PWA가 비활성화될 수 있음 (프로덕션 빌드에서 테스트)




