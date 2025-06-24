# Genie Frontend

Vue 3 + Vite + tailwind 를 사용한 프론트엔드 프로젝트입니다.

## 🛠️ 사용된 기술 스택

-   **Framework**: Vue 3
-   **Build Tool**: Vite
-   **State Management**: Pinia
-   **Router**: Vue Router
-   **Styling**: Tailwind CSS
-   **Package Manager**: npm

## 📋 사전 요구사항

-   Node.js (v16.0.0 이상)
-   npm

## 🚀 설치 및 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트 폴더에 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```env
# Toss Payments 설정
VITE_TOSS_CLIENT_KEY=your_toss_client_key_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 실행되면 `http://localhost:80`에서 애플리케이션을 확인할 수 있습니다.

### 4. 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 📁 프로젝트 구조

```
frontend/
├── public/          # 정적 파일
├── src/             # 소스 코드
│   ├── assets/      # 이미지, 폰트 등
│   ├── components/  # Vue 컴포넌트
│   ├── views/       # 페이지 컴포넌트
│   ├── router/      # 라우터 설정
│   ├── stores/      # Pinia 스토어
│   ├── App.vue      # 루트 컴포넌트
│   └── main.js      # 진입점
├── index.html       # HTML 템플릿
├── jsconfig.json    # JavaScript 설정
├── .env             # 환경 변수
├── package.json     # 의존성 및 스크립트
└── vite.config.js   # Vite 설정
```

## 🐛 문제 해결

### 의존성 설치 오류 시

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```
