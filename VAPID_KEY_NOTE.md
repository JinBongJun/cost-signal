# VAPID 키 중복 생성 안내

## 상황

- ✅ 기존 VAPID 키가 이미 `.env` 파일에 있었음
- ❌ 새로 VAPID 키를 다시 생성함 (중복)

## 해결 방법

### 기존 키 사용 (권장)

`.env` 파일에서 **첫 번째 VAPID 키 세트**를 사용하세요:

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BA9SfeLb9DwxWFk83h2fUY6MYABbvIxqg1q
VAPID_PRIVATE_KEY=aTHNIvcsBUe5vfV5U7kww_d58zJWMQh1xcz1g8UY060
VAPID_EMAIL=mailto:bongjun0289@gmail.com
```

### 중복 제거

`.env` 파일에서 **두 번째 VAPID 키 세트는 삭제**하세요:

```env
# 이 부분 삭제
#VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BLA9G9pcXgn0QTimRvMUPPcuPn8JqcQZNul=
VAPID_PRIVATE_KEY=Dt6Reg2iNPgr4HA4KekNqPNWWj2hDUmlcM6zyEaf2X0
VAPID_EMAIL=bongjun0289@gmail.com
```

## 주의사항

- ✅ **기존 키를 계속 사용**: 이미 구독한 사용자들이 있으면 기존 키를 유지해야 함
- ❌ **새 키로 변경하면**: 기존 구독이 작동하지 않을 수 있음

## 결론

**기존 VAPID 키를 그대로 사용하세요!** 새로 생성한 키는 무시하셔도 됩니다.

