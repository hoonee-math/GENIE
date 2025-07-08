### 원하는 폴더 터미널에서 git clone –branch api_hj2 –single-branch https://github.com/alpaca-drun/GenieQ.git .
### .env 파일을 만들고 GEMINI_API_KEY를 입력한다.
### 터미널에서 가상환경을 만든다. (python -m venv venv)
### 터미널에서 venv\Scripts\activate 를 통해 가상환경을 실행한다.
### pip install -r requirements.txt 로 필요한 라이브러리를 설치한다.
### python main.py를 실행하여 걸계한 api를 확인한다.
### localhost:8501/docs에서 테스트한다.

---

# Genie API

FastAPI를 사용한 AI API 서버입니다.

## 🛠️ 사용된 기술 스택

-   **Framework**: FastAPI
-   **Language**: Python
-   **AI Model**: Google Gemini
-   **Documentation**: Swagger UI
-   **Package Manager**: pip

## 📋 사전 요구사항

-   Python 3.8 이상
-   Git
-   Google Gemini API Key

## 🚀 설치 및 실행 방법

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Gemini API Key를 입력하세요:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. 가상환경 생성 및 활성화

```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 가상환경 활성화 (macOS/Linux)
source venv/bin/activate
```

### 3. 의존성 설치

```bash
pip install -r requirements.txt
```

### 4. API 서버 실행

```bash
python main.py
```

API 서버가 실행된 후 `http://localhost:8501/docs` 접속하여 API를 테스트할 수 있습니다.
