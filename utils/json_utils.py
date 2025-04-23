import json
import logging
from fastapi import HTTPException
3
logger = logging.getLogger('Gemini_API')

def process_json_response(response_content: str):
    logger.debug(f"JSON 파싱 시도 중")
    try:
        processed_content = response_content.strip()
        if processed_content.startswith("```json"):
             processed_content = processed_content[7:]
             if  processed_content.endswith("```"):
                 processed_content =  processed_content[:-3] 
        elif processed_content.startswith("```"):
             processed_content = processed_content[3:] 
             if processed_content.endswith("```"):
                 processed_content = processed_content[:-3]

        processed_content = processed_content.strip()

        return json.loads(processed_content)

    except json.JSONDecodeError as json_err:
        logger.warning(f"Json 파싱 실패 : {json_err}. 원본 내용: {response_content}")

        try:
            start_idx = response_content.find('{')
            end_idx = response_content.rfind('}') + 1

            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                json_text = response_content[start_idx:end_idx]
                logger.info(f"Fallback JSON 추출 시도")
                return json.loads(json_text)
            else:
                 logger.error("Fallback JSON 추출 실패: 유효한 JSON 중괄호({})를 찾지 못했습니다.")
                 raise ValueError("유효한 JSON 형식을 찾을 수 없습니다")

        except Exception as e:
            logger.error(f"Fallback JSON 추출 중 예외 발생 : {str(e)}")
            # Raise HTTPException here to be caught by the endpoint
            raise HTTPException(
                status_code=500,
                detail=f"응답을 JSON 형식으로 변환할 수 없습니다. 오류: {str(json_err)}, 응답 내용: {response_content}"
            )