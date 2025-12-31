# 도메인 요구사항 분석

이 문서는 현재 코드베이스에서 도메인과 관련된 모든 부분을 분석하고, 각 기능과의 연관성을 정리합니다.

## 📋 목차

1. [도메인이 필요한 기능 목록](#도메인이-필요한-기능-목록)
2. [환경 변수 분석](#환경-변수-분석)
3. [코드 위치별 상세 분석](#코드-위치별-상세-분석)
4. [도메인 설정 후 변경 사항](#도메인-설정-후-변경-사항)

---

## 도메인이 필요한 기능 목록

### 🔴 필수 (즉시 작동 불가)

1. **이메일 전송 기능** (Resend)
   - 비밀번호 재설정
   - 이메일 변경 확인
   - 피드백 알림
   - **현재 상태**: 테스트 도메인으로 인해 등록된 이메일로만 전송 가능

2. **Google OAuth 로그인**
   - 콜백 URL 설정 필요
   - **현재 상태**: `vercel.app` 도메인으로 설정 가능하지만, 커스텀 도메인 권장

3. **Paddle 결제 시스템**
   - 결제 성공/실패 콜백 URL
   - **현재 상태**: `vercel.app` 도메인으로 작동 가능

### 🟡 권장 (SEO, 브랜딩)

4. **SEO 및 메타데이터**
   - Open Graph 이미지
   - Twitter Card
   - 검색 엔진 최적화

5. **이메일 링크**
   - 비밀번호 재설정 링크
   - 이메일 변경 확인 링크
   - **현재 상태**: `vercel.app` 도메인으로 작동하지만 브랜딩 측면에서 개선 필요

---

## 환경 변수 분석

### 현재 사용 중인 도메인 관련 환경 변수

| 변수명 | 용도 | 현재 값 (기본값) | 필수 여부 |
|--------|------|----------------|----------|
| `RESEND_FROM_EMAIL` | 이메일 발신 주소 | `Cost Signal <noreply@cost-signal.com>` | ✅ 필수 |
| `NEXT_PUBLIC_APP_URL` | 앱 기본 URL | `https://cost-signal.vercel.app` | ✅ 필수 |
| `NEXTAUTH_URL` | NextAuth 기본 URL | (없음) | ⚠️ 프로덕션 필수 |
| `ADMIN_EMAIL` | 관리자 이메일 (피드백 수신) | (없음) | ⚠️ 피드백 기능용 |

### 도메인 설정 후 변경해야 할 환경 변수

```env
# 이메일 발신 주소 (Resend 도메인 인증 후)
RESEND_FROM_EMAIL=Cost Signal <noreply@yourdomain.com>

# 앱 기본 URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# NextAuth URL (프로덕션)
NEXTAUTH_URL=https://yourdomain.com

# 관리자 이메일 (선택사항)
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 코드 위치별 상세 분석

### 1. 이메일 전송 기능 (`lib/email.ts`)

#### 📍 위치
- `lib/email.ts`

#### 🔗 도메인 연관성
- **`RESEND_FROM_EMAIL`**: 이메일 발신 주소
- **`NEXT_PUBLIC_APP_URL`**: 이메일 링크의 기본 URL

#### 📝 사용되는 기능

##### a) 비밀번호 재설정 (`sendPasswordResetEmail`)
```typescript
// Line 22
const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.vercel.app'}/reset-password?token=${resetToken}`;

// Line 26
from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
```
- **기능**: 사용자가 비밀번호를 잊었을 때 재설정 링크 전송
- **도메인 필요 이유**: 
  - Resend 테스트 도메인은 등록된 이메일로만 전송 가능
  - 프로덕션에서는 모든 사용자에게 전송 가능해야 함
- **영향**: 도메인 없이는 등록된 이메일(`bongjun0289@daum.net`)로만 전송 가능

##### b) 이메일 변경 확인 (`sendEmailChangeEmail`)
```typescript
// Line 194
const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.vercel.app'}/account/email/confirm?token=${token}`;

// Line 198
from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
```
- **기능**: 사용자가 이메일을 변경할 때 확인 링크 전송
- **도메인 필요 이유**: 
  - Resend 테스트 도메인 제한으로 인해 Gmail 등 다른 이메일로 전송 불가
  - 프로덕션에서는 모든 이메일 주소로 전송 가능해야 함
- **영향**: 도메인 없이는 등록된 이메일로만 전송 가능

##### c) 피드백 알림 (`sendFeedbackNotification`)
```typescript
// Line 122
from: process.env.RESEND_FROM_EMAIL || 'Cost Signal <noreply@cost-signal.com>',
```
- **기능**: 사용자 피드백을 관리자에게 이메일로 전송
- **도메인 필요 이유**: 
  - 브랜딩 측면에서 전문적인 이메일 주소 사용
  - 스팸 필터 회피율 향상
- **영향**: 도메인 없이도 작동하지만 브랜딩 측면에서 개선 필요

#### 🔧 API 엔드포인트
- `app/api/auth/forgot-password/route.ts` → `sendPasswordResetEmail` 호출
- `app/api/account/email/request/route.ts` → `sendEmailChangeEmail` 호출
- `app/api/feedback/route.ts` → `sendFeedbackNotification` 호출

---

### 2. Paddle 결제 시스템 (`app/api/paddle/checkout/route.ts`)

#### 📍 위치
- `app/api/paddle/checkout/route.ts`

#### 🔗 도메인 연관성
- **`NEXT_PUBLIC_APP_URL`**: 결제 성공/실패 콜백 URL

#### 📝 사용 코드
```typescript
// Line 60
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Line 71-72
const checkout = await createCheckoutSession(
  userId,
  priceId,
  `${baseUrl}/pricing/success`,  // 성공 콜백
  `${baseUrl}/pricing`           // 실패/취소 콜백
);
```

#### 🎯 기능
- 사용자가 구독을 결제할 때 Paddle 체크아웃 세션 생성
- 결제 완료 후 리디렉션 URL 설정

#### ⚠️ 도메인 필요 이유
- Paddle 대시보드에서 콜백 URL을 화이트리스트에 등록해야 함
- `vercel.app` 도메인으로도 작동하지만, 커스텀 도메인 사용 권장
- 브랜딩 및 신뢰성 향상

#### 🔧 관련 파일
- `lib/paddle.ts`: `createCheckoutSession` 함수

---

### 3. Google OAuth 로그인 (`lib/auth-options.ts`)

#### 📍 위치
- `lib/auth-options.ts`

#### 🔗 도메인 연관성
- **Google Cloud Console 설정**: 콜백 URL 등록 필요

#### 📝 현재 설정
- Google OAuth는 코드에서 직접 URL을 사용하지 않음
- Google Cloud Console에서 콜백 URL을 수동으로 등록해야 함

#### 🎯 필요한 콜백 URL
```
https://yourdomain.com/api/auth/callback/google
```

#### ⚠️ 도메인 필요 이유
- Google Cloud Console에서 승인된 리디렉션 URI로 등록 필요
- `vercel.app` 도메인으로도 작동하지만, 커스텀 도메인 권장
- 보안 및 브랜딩 측면에서 개선

#### 📚 참고 문서
- `GOOGLE_LOGIN_SETUP.md`: Google OAuth 설정 가이드

---

### 4. SEO 및 메타데이터 (`app/layout.tsx`)

#### 📍 위치
- `app/layout.tsx`

#### 🔗 도메인 연관성
- **`NEXT_PUBLIC_APP_URL`**: 메타데이터 기본 URL

#### 📝 사용 코드
```typescript
// Line 24
metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://cost-signal.vercel.app'),
```

#### 🎯 기능
- Open Graph 이미지 URL 생성
- Twitter Card 메타데이터
- 검색 엔진 최적화 (SEO)

#### ⚠️ 도메인 필요 이유
- 검색 엔진에서 신뢰성 향상
- 소셜 미디어 공유 시 브랜딩 개선
- `vercel.app` 도메인보다 커스텀 도메인이 더 전문적으로 보임

---

### 5. 환경 변수 검증 (`lib/env.ts`)

#### 📍 위치
- `lib/env.ts`

#### 🔗 도메인 연관성
- **`RESEND_FROM_EMAIL`**: 필수 환경 변수로 검증됨
- **`NEXTAUTH_URL`**: 프로덕션에서 필수

#### 📝 검증 코드
```typescript
// Line 88-94
// Email (Resend)
if (!process.env.RESEND_API_KEY) {
  requiredVars.push('RESEND_API_KEY');
}
if (!process.env.RESEND_FROM_EMAIL) {
  requiredVars.push('RESEND_FROM_EMAIL');
}
```

#### 🎯 기능
- 앱 시작 시 필수 환경 변수 검증
- 누락된 변수에 대한 명확한 에러 메시지

---

## 도메인 설정 후 변경 사항

### 1. Resend 도메인 인증

#### 단계
1. Resend 대시보드 → Domains → Add Domain
2. 도메인 추가 후 DNS 레코드 설정:
   - SPF 레코드
   - DKIM 레코드
3. 도메인 인증 완료 대기 (보통 몇 분~몇 시간)

#### 환경 변수 변경
```env
RESEND_FROM_EMAIL=Cost Signal <noreply@yourdomain.com>
```

#### 영향
- ✅ 모든 이메일 주소로 전송 가능
- ✅ 비밀번호 재설정 기능 정상 작동
- ✅ 이메일 변경 기능 정상 작동
- ✅ 피드백 알림 정상 작동

---

### 2. Vercel 도메인 설정

#### 단계
1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 및 DNS 설정
4. SSL 인증서 자동 발급 대기

#### 환경 변수 변경
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

#### 영향
- ✅ 이메일 링크가 커스텀 도메인으로 변경
- ✅ Paddle 결제 콜백 URL이 커스텀 도메인으로 변경
- ✅ SEO 및 메타데이터 개선
- ✅ 브랜딩 향상

---

### 3. Google Cloud Console 업데이트

#### 단계
1. Google Cloud Console → APIs & Services → Credentials
2. OAuth 2.0 Client ID 선택
3. "승인된 리디렉션 URI"에 추가:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

#### 영향
- ✅ Google 로그인이 커스텀 도메인에서 작동
- ✅ 보안 향상

---

### 4. Paddle 대시보드 업데이트

#### 단계
1. Paddle 대시보드 → Developer Tools → Notifications
2. Notification URL 확인/업데이트:
   ```
   https://yourdomain.com/api/paddle/webhook
   ```

#### 영향
- ✅ 결제 웹훅이 커스텀 도메인에서 작동
- ✅ 구독 상태 업데이트 정상 작동

---

## 요약

### 🔴 즉시 해결 필요한 문제
1. **이메일 전송 제한**: Resend 테스트 도메인으로 인해 등록된 이메일로만 전송 가능
   - **해결**: Resend 도메인 인증 필요

### 🟡 개선 권장 사항
2. **브랜딩**: `vercel.app` 도메인 대신 커스텀 도메인 사용
3. **SEO**: 메타데이터 및 검색 엔진 최적화
4. **보안**: Google OAuth 및 Paddle 콜백 URL 업데이트

### ✅ 현재 작동하는 기능
- Paddle 결제 (vercel.app 도메인으로 작동)
- Google OAuth (vercel.app 도메인으로 작동)
- 이메일 링크 (vercel.app 도메인으로 작동)

---

## 다음 단계

1. **도메인 구매** (아직 없는 경우)
   - 추천: Namecheap, Google Domains, Cloudflare

2. **Resend 도메인 인증**
   - 가장 우선순위가 높음 (이메일 기능 제한 해결)

3. **Vercel 도메인 연결**
   - SSL 인증서 자동 발급

4. **환경 변수 업데이트**
   - `.env` 파일 및 Vercel 환경 변수

5. **외부 서비스 업데이트**
   - Google Cloud Console
   - Paddle 대시보드

---

## 참고 문서

- `RESEND_SETUP.md`: Resend 설정 가이드
- `GOOGLE_LOGIN_SETUP.md`: Google OAuth 설정 가이드
- `PADDLE_SETUP.md`: Paddle 설정 가이드
- `DOMAIN_SETUP.md`: 도메인 설정 가이드

