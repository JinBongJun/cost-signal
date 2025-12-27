# Git 설치 및 설정 가이드

## 1단계: Git 설치

1. **Git 다운로드**
   - https://git-scm.com/download/win 접속
   - "Download for Windows" 클릭
   - 설치 파일 다운로드

2. **Git 설치**
   - 다운로드한 `.exe` 파일 실행
   - 기본 설정으로 진행 (Next 클릭)
   - 설치 완료까지 대기 (약 2-3분)

3. **설치 확인**
   - PowerShell을 **새로 열기** (중요!)
   - 다음 명령어 실행:
   ```bash
   git --version
   ```
   - 버전 정보가 나오면 성공!

## 2단계: Git 사용자 정보 설정

PowerShell에서 다음 명령어 실행:

```bash
git config --global user.name "Your Name"
git config --global user.email "bongjun0289@gmail.com"
```

예시:
```bash
git config --global user.name "Jin Bong Jun"
git config --global user.email "bongjun0289@gmail.com"
```

## 3단계: 프로젝트 Git 초기화

프로젝트 폴더에서:

```bash
cd "C:\Users\user\Desktop\cost signal"
git init
git add .
git commit -m "Initial commit"
```

## 4단계: GitHub 저장소 생성 및 연결

1. **GitHub 저장소 생성**
   - https://github.com 접속
   - 로그인 (없으면 회원가입)
   - 우측 상단 "+" → "New repository" 클릭
   - Repository name: `cost-signal`
   - Public 또는 Private 선택
   - "Create repository" 클릭

2. **로컬 프로젝트와 연결**
   - GitHub에서 생성된 저장소의 URL 복사 (예: `https://github.com/YOUR_USERNAME/cost-signal.git`)
   - PowerShell에서:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cost-signal.git
   git branch -M main
   git push -u origin main
   ```

## 5단계: Vercel 배포

GitHub 저장소가 준비되면:

1. https://vercel.com 접속
2. GitHub로 로그인
3. "Add New..." → "Project" 클릭
4. `cost-signal` 저장소 선택
5. "Import" 클릭
6. 환경 변수 설정 (VERCEL_DEPLOY.md 참고)
7. "Deploy" 클릭

## 문제 해결

### Git 명령어가 인식되지 않을 때
- PowerShell을 **완전히 종료**하고 다시 열기
- 또는 컴퓨터 재시작

### GitHub 인증 문제
- GitHub에서 Personal Access Token 생성 필요할 수 있음
- Settings → Developer settings → Personal access tokens → Generate new token


