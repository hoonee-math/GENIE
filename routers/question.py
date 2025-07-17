from fastapi import APIRouter, HTTPException, Depends
from schemas.question import PassageDataRequest, QuestionRequest, ReadingPassageQuestionResponse, SinglePassageQuestionResponse, MultiplePassageQuestionResponse
from services.reading_passage_question_service import create_reading_passage_question
from services.single_passage_question_service import create_single_passage_question
from services.multiple_passage_question_service import create_multiple_passage_question
from services.passage_analysis_for_question import create_passage_data
from utils.logger import logger
from utils.jwt_utils import conditional_get_current_user

router = APIRouter(
    prefix="",
    tags=["문항 생성"]
)


@router.post("/generate-passage-data")
async def generate_reading_passage_question_endpoint(request: PassageDataRequest, current_user: str = Depends(conditional_get_current_user)):
    try:
        response1 = await create_passage_data(request)
        if response1.kind_passage=="독서론":
            response2 = await create_reading_passage_question(request)
            return {
                "detail" : response1,
                "question" : response2
            }
        elif response1.kind_passage=="단일 지문":
            response2 = await create_single_passage_question(request)
            return {
                "detail" : response1,
                "question" : response2
            }
        elif response1.kind_passage=="복합 지문":
            response2 = await create_multiple_passage_question(request)
            return {
                "detail" : response1,
                "question" : response2
            }
    
    except HTTPException as http_exc:
        raise http_exc
    
    except Exception as e:
        logger.error(f"지문 분석 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="문항 생성을 위한 지문 분석 중 서버 내부 오류가 발생했습니다.")



@router.post("/generate-reading-passage-question", response_model=ReadingPassageQuestionResponse)
async def generate_reading_passage_question_endpoint(request: QuestionRequest, current_user: str = Depends(conditional_get_current_user)):
    try:
        response = await create_reading_passage_question(request)
        return response
    
    except HTTPException as http_exc:
        raise http_exc
    
    except Exception as e:
        logger.error(f"문항 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="문항 생성 중 서버 내부 오류가 발생했습니다.")


@router.post("/generate-single-passage-question", response_model=SinglePassageQuestionResponse)
async def generate_single_passage_question_endpoint(request: QuestionRequest, current_user: str = Depends(conditional_get_current_user)):
    try:
        response = await create_single_passage_question(request)
        return response
    
    except HTTPException as http_exc:
        raise http_exc
    
    except Exception as e:
        logger.error(f"문항 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="문항 생성 중 서버 내부 오류가 발생했습니다.")


@router.post("/generate-multiple-passage-question", response_model=MultiplePassageQuestionResponse)
async def generate_multiple_passage_question_endpoint(request: QuestionRequest, current_user: str = Depends(conditional_get_current_user)):
    try:
        response = await create_multiple_passage_question(request)
        return response
    
    except HTTPException as http_exc:
        raise http_exc
    
    except Exception as e:
        logger.error(f"문항 생성 API 처리 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="문항 생성 중 서버 내부 오류가 발생했습니다.")