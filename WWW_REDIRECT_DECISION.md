# www 리디렉션 선택 가이드

`cost-signal.com`과 `www.cost-signal.com` 중 어떤 것을 사용할지 결정하는 가이드입니다.

## 🔍 두 옵션의 차이

### 옵션 1: 체크 유지 (www 리디렉션)
```
cost-signal.com → www.cost-signal.com으로 자동 리디렉션
```

**동작:**
- 사용자가 `cost-signal.com`에 접속하면 자동으로 `www.cost-signal.com`으로 이동
- 두 도메인 모두 작동하지만, 최종적으로는 `www.cost-signal.com`만 사용

### 옵션 2: 체크 해제 (www 없이 사용)
```
cost-signal.com만 사용 (www 없음)
```

**동작:**
- `cost-signal.com`만 사용
- `www.cost-signal.com`은 작동하지 않음 (또는 별도 설정 필요)

---

## 📱 PWA 앱과의 관계

### PWA 앱에 미치는 영향

#### 1. **앱 설치 및 시작 URL**
- PWA 앱이 설치되면 `manifest.json`의 `start_url`이 사용됩니다
- 현재 설정: `"/"` (상대 경로)
- **결과**: 어떤 도메인으로 접속했든 상관없이 작동합니다

#### 2. **Service Worker 범위**
- Service Worker는 도메인 전체에 적용됩니다
- `cost-signal.com`과 `www.cost-signal.com`은 **다른 도메인**으로 인식됩니다
- **중요**: 리디렉션이 있으면 Service Worker가 두 도메인에서 모두 작동해야 합니다

#### 3. **앱 업데이트**
- 도메인이 바뀌면 PWA 앱이 업데이트되지 않을 수 있습니다
- 사용자가 `cost-signal.com`으로 설치했는데 `www.cost-signal.com`으로 리디렉션되면 혼란 가능

#### 4. **푸시 알림**
- 푸시 알림은 도메인에 연결됩니다
- 도메인이 바뀌면 알림 구독이 끊어질 수 있습니다

---

## ✅ 추천: 체크 해제 (www 없이 사용)

### 이유

#### 1. **PWA 앱 호환성**
- ✅ 하나의 도메인만 사용하면 Service Worker가 안정적으로 작동
- ✅ 앱 설치 후 도메인 변경 없음
- ✅ 푸시 알림이 안정적으로 작동

#### 2. **간단함**
- ✅ 하나의 도메인만 관리
- ✅ DNS 설정이 간단
- ✅ 환경 변수 설정이 간단

#### 3. **현대적 트렌드**
- ✅ 최근 웹사이트들은 www 없이 사용하는 추세
- ✅ 더 짧고 기억하기 쉬운 URL
- ✅ 브랜딩 측면에서 깔끔함

#### 4. **SEO**
- ✅ 하나의 도메인만 사용하면 SEO가 더 명확
- ✅ 중복 콘텐츠 문제 없음

---

## ⚠️ 체크 유지 (www 리디렉션)를 선택하는 경우

### 장점
- 전통적인 방식 (일부 사용자가 www를 기대할 수 있음)
- 두 도메인 모두 작동

### 단점
- ❌ PWA 앱에서 도메인 변경으로 인한 혼란 가능
- ❌ Service Worker가 두 도메인에서 모두 작동해야 함
- ❌ DNS 설정이 복잡 (두 도메인 모두 설정 필요)
- ❌ 환경 변수 설정이 복잡

---

## 🎯 최종 추천

### **체크 해제 (www 없이 사용)** ⭐⭐⭐

**이유:**
1. ✅ PWA 앱과 가장 호환됨
2. ✅ 간단하고 명확함
3. ✅ 현대적이고 깔끔함
4. ✅ 관리가 쉬움

**설정:**
- 체크박스 해제
- `cost-signal.com`만 사용
- 환경 변수: `NEXT_PUBLIC_APP_URL=https://cost-signal.com`

---

## 📋 설정 후 해야 할 일

### 체크 해제 선택 시

1. **환경 변수 설정**
   ```env
   NEXT_PUBLIC_APP_URL=https://cost-signal.com
   NEXTAUTH_URL=https://cost-signal.com
   RESEND_FROM_EMAIL=Cost Signal <noreply@cost-signal.com>
   ```

2. **Cloudflare DNS 설정**
   - CNAME 레코드 하나만 추가:
     ```
     Type: CNAME
     Name: @
     Target: cname.vercel-dns.com
     ```

3. **외부 서비스 업데이트**
   - Google OAuth: `https://cost-signal.com/api/auth/callback/google`
   - Paddle: `https://cost-signal.com/api/paddle/webhook`

### 체크 유지 선택 시

1. **환경 변수 설정**
   ```env
   NEXT_PUBLIC_APP_URL=https://www.cost-signal.com
   NEXTAUTH_URL=https://www.cost-signal.com
   RESEND_FROM_EMAIL=Cost Signal <noreply@cost-signal.com>
   ```

2. **Cloudflare DNS 설정**
   - 두 개의 CNAME 레코드 추가:
     ```
     Type: CNAME
     Name: @
     Target: cname.vercel-dns.com
     
     Type: CNAME
     Name: www
     Target: cname.vercel-dns.com
     ```

---

## 💡 결론

**PWA 앱을 사용하는 경우, 체크 해제 (www 없이 사용)를 강력히 추천합니다.**

이유:
- PWA 앱이 하나의 도메인에서 안정적으로 작동
- Service Worker와 푸시 알림이 안정적으로 작동
- 설정과 관리가 간단

---

## ❓ 자주 묻는 질문

### Q1: 나중에 www를 추가할 수 있나요?
**A:** 네, 가능합니다. 나중에 Vercel에서 www 서브도메인을 추가하고 리디렉션을 설정할 수 있습니다.

### Q2: SEO에 영향이 있나요?
**A:** 하나의 도메인만 사용하는 것이 SEO에 더 좋습니다. 중복 콘텐츠 문제가 없습니다.

### Q3: 사용자가 www를 입력하면?
**A:** 체크 해제를 선택하면 `www.cost-signal.com`은 작동하지 않습니다. 하지만 대부분의 사용자는 www 없이 입력합니다.

### Q4: PWA 앱이 제대로 작동하나요?
**A:** 네, 하나의 도메인만 사용하면 PWA 앱이 더 안정적으로 작동합니다.

