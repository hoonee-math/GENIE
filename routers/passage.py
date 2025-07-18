from fastapi import APIRouter, HTTPException, Depends
from schemas.passage import SinglePassageRequest, SinglePassageResponse, ReadingPassageRequest, ReadingPassageResponse, MultiplePassageRequest, MultiplePassageResponse
from services.single_passage_service import create_single_passage
from services.reading_passage_service import create_reading_passage
from services.multiple_passage_service import create_multiple_passage
from utils.logger import logger  # 로그 기록을 위한 logger 객체
from utils.jwt_utils import conditional_get_current_user  # JWT 토큰 검증을 위한 함수 (인증 엔드포인트에 사용)

# FastAPI 라우터 정의 (여기에 정의된 엔드포인트는 모두 JWT 인증 필요)
router = APIRouter(
    prefix="",  # URL 접두어 없음
    tags=["지문 생성"]  # Swagger 문서화를 위한 태그
)

@router.post("/generate-single-passage", response_model=SinglePassageResponse)
async def generate_passage_endpoint(request: SinglePassageRequest, current_user: str = Depends(conditional_get_current_user)):
    # ====== 인증 흐름 설명 ======
    # 1. Depends(get_current_user)를 통해 토큰 검증이 자동으로 이루어짐
    # 2. 토큰이 없거나 유효하지 않으면 엔드포인트 함수가 실행되기 전에 HTTP 401 오류 발생
    # 3. 토큰이 유효하면 사용자 ID가 current_user 파라미터로 전달됨
    try:
        response = await create_single_passage(request)
        return response
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"단일 지문 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="단일 지문 생성 중 서버 내부 오류가 발생했습니다.")
    

@router.post("/generate-reading-passage", response_model=ReadingPassageResponse)
async def generate_passage_endpoint(request: ReadingPassageRequest, current_user: str = Depends(conditional_get_current_user)):
    try:
        response = await create_reading_passage(request)
        return response
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"독서론 지문 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="독서론 지문 생성 중 서버 내부 오류가 발생했습니다.")
    

@router.post("/generate-multiple-passage", response_model=MultiplePassageResponse)
async def generate_passage_endpoint(request: MultiplePassageRequest, current_user: str = Depends(conditional_get_current_user)):
    try:
        response = await create_multiple_passage(request)
        return response
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"복합 지문 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="복합 지문 생성 중 서버 내부 오류가 발생했습니다.")