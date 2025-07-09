import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import passage as passage_router
from routers import question as question_router
from utils.logger import logger  # 로그 기록을 위한 logger 객체 import
from utils.jwt_utils import set_user_id_in_context  # JWT 토큰에서 사용자 ID를 추출하는 함수 import

load_dotenv()

app = FastAPI(
    title="지문/문항 생성 API",
    description="지문과 문항을 생성할 수 있는 API입니다.",
    version="1.0.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT 토큰에서 사용자 ID를 추출하는 미들웨어 추가
@app.middleware("http")
async def jwt_middleware(request: Request, call_next):
    # ======== 로깅 목적의 사용자 ID 추출 ========
    # 1. 모든 HTTP 요청에 대해 실행됨 (모든 엔드포인트)
    # 2. 요청 헤더에서 JWT 토큰을 추출하여 사용자 ID를 추출함
    # 3. 토큰이 없거나 유효하지 않아도 오류를 발생시키지 않고 'anonymous'로 설정
    # 4. 추출된 사용자 ID는 contextvars(user_id_var)에 저장됨
    # 5. logger.py의 KSTFormatter에서 이 user_id_var 값을 사용하여 로그에 사용자 ID 기록
    set_user_id_in_context(request)
    
    # 다음 미들웨어나 라우트 핸들러 실행 (여기서는 엔드포인트 함수)
    response = await call_next(request)
    return response
    
    # 주의: 이 미들웨어는 로깅 목적이며 인증을 강제하지 않음
    # 인증은 각 엔드포인트에서 Depends(get_current_user)를 통해 별도로 처리됨

# 라우터 등록
# 각 라우터에는 JWT 인증이 적용된 엔드포인트들이 포함됨
# 라우터 내의 엔드포인트는 get_current_user 의존성을 통해 인증을 확인함
app.include_router(passage_router.router)
app.include_router(question_router.router)

@app.get("/", tags=["Root"])
async def read_root():
    # 로그에는 jwt_middleware에서 설정된 user_id가 포함됨
    # 인증을 요구하지 않는 공개 엔드포인트 예시 (Depends(get_current_user)가 없음)
    logger.info("✅ 루트 엔드포인트 접근")
    return {"message": "API 연결 완료"}


# 개발 환경에서는 해당 코드 사용하고 아니면 주석 처리 후 배포
if __name__ == "__main__":
    # 시스템 이벤트는 system_info 메서드를 사용하여 사용자 ID 없이 로깅
    logger.system_info("🚀 API 서버 시작 준비 중...")
    uvicorn.run("main:app", host="0.0.0.0", port=8501, reload=True)