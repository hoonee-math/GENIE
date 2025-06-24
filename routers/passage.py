from fastapi import APIRouter, HTTPException, Depends
from schemas.passage import SinglePassageRequest, SinglePassageResponse, ReadingPassageRequest, ReadingPassageResponse, MultiplePassageRequest, MultiplePassageResponse
from services.single_passage_service import create_single_passage
from services.reading_passage_service import create_reading_passage
from services.multiple_passage_service import create_multiple_passage
from utils.logger import logger

router = APIRouter(
    prefix="",
    tags=["지문 생성"]
)

@router.post("/generate-single-passage", response_model=SinglePassageResponse)
async def generate_passage_endpoint(request: SinglePassageRequest):
    try:
        response = await create_single_passage(request)
        return response
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"지문 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="지문 생성 중 서버 내부 오류가 발생했습니다.")
    

@router.post("/generate-reading-passage", response_model=ReadingPassageResponse)
async def generate_passage_endpoint(request: ReadingPassageRequest):
    try:
        response = await create_reading_passage(request)
        return response
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"지문 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="지문 생성 중 서버 내부 오류가 발생했습니다.")
    

@router.post("/generate-multiple-passage", response_model=MultiplePassageResponse)
async def generate_passage_endpoint(request: MultiplePassageRequest):
    try:
        response = await create_multiple_passage(request)
        return response
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"지문 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="지문 생성 중 서버 내부 오류가 발생했습니다.")