from fastapi import APIRouter, HTTPException, Depends
from schemas.passage import PassageRequest, PassageResponse
from services.passage_service import create_passage
from utils.logger import logger

router = APIRouter(
    prefix="",
    tags=["지문 생성"]
)

@router.post("/generate-passage", response_model=PassageResponse)
async def generate_passage_endpoint(request: PassageRequest):
    try:
        response = await create_passage(request)
        return response
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"지문 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="지문 생성 중 서버 내부 오류가 발생했습니다.")