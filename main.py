import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import passage as passage_router
from routers import question as question_router
from utils.logger import logger
# from utils.jwt_utils import set_user_id_in_context

load_dotenv()

app = FastAPI(
    title="API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # JWT 토큰에서 사용자 ID를 추출하는 미들웨어 추가
# @app.middleware("http")
# async def jwt_middleware(request: Request, call_next):
#     # 요청 헤더에서 JWT 토큰을 추출하고 사용자 ID를 문맥에 저장
#     set_user_id_in_context(request)
#     response = await call_next(request)
#     return response

# 라우터 등록
app.include_router(passage_router.router)
app.include_router(question_router.router)

@app.get("/", tags=["Root"])
async def read_root():
    logger.info("✅ 루트 엔드포인트 접근")
    return {"message": "API 연결 완료"}


# 개발 환경에서는 해당 코드 사용하고 아니면 주석 처리 후 배포
if __name__ == "__main__":
    logger.info("🚀 API 서버 시작 준비 중...")
    uvicorn.run("main:app", host="0.0.0.0", port=8501, reload=True)