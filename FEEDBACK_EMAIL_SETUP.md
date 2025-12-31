# 피드백 이메일 알림 설정 가이드

## 개요

피드백이 제출되면 관리자에게 자동으로 이메일 알림이 전송됩니다.

## 환경 변수 설정

### 1. 관리자 이메일 주소 설정

`.env` 파일에 추가:

```env
ADMIN_EMAIL=your-email@example.com
```

또는 `RESEND_FROM_EMAIL`을 사용할 수도 있습니다 (없으면 `RESEND_FROM_EMAIL` 사용).

### 2. Vercel 환경 변수 추가

1. Vercel Dashboard → 프로젝트 → Settings → Environment Variables
2. 새 변수 추가:
   - **Key**: `ADMIN_EMAIL`
   - **Value**: 관리자 이메일 주소
   - **Environment**: Production, Preview, Development 모두 선택

## 동작 방식

1. 사용자가 피드백을 제출
2. 데이터베이스에 저장
3. 관리자에게 이메일 알림 전송 (비동기, 실패해도 피드백 저장은 성공)

## 이메일 내용

관리자에게 전송되는 이메일에는 다음 정보가 포함됩니다:
- 피드백 타입 (Bug Report / Feature Request / General Feedback)
- 제목
- 사용자 이메일 (로그인한 경우)
- 메시지 내용

## 문제 해결

### 이메일이 오지 않는 경우

1. **환경 변수 확인**:
   - `ADMIN_EMAIL` 또는 `RESEND_FROM_EMAIL`이 설정되어 있는지 확인
   - `RESEND_API_KEY`가 설정되어 있는지 확인

2. **Resend 도메인 확인**:
   - Resend에서 도메인을 인증했는지 확인
   - 테스트 도메인(`onboarding@resend.dev`)은 제한이 있을 수 있음
   - 프로덕션에서는 인증된 도메인 사용 권장

3. **로그 확인**:
   - Vercel 로그에서 이메일 전송 오류 확인
   - `Failed to send feedback notification email` 메시지 확인

4. **스팸 폴더 확인**:
   - 관리자 이메일의 스팸 폴더 확인

## 참고

- 이메일 전송 실패해도 피드백은 정상적으로 저장됩니다
- 이메일은 비동기로 전송되므로 응답 시간에 영향을 주지 않습니다
- Resend 도메인 인증이 필요할 수 있습니다 (프로덕션 환경)

