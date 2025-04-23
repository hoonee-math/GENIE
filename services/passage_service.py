import os
import traceback
from google import genai
from fastapi import HTTPException
from schemas.passage import PassageRequest, PassageResponse
from utils.guidelines import get_passage_guidelines
from utils.logger import logger 
from dotenv import load_dotenv


load_dotenv()

try:
    # API 키 유효성 검증
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
    
    client = genai.Client(api_key=GEMINI_API_KEY)

    # 사용 가능 모델 : gemini-2.5-flash-preview-04-17, gemini-2.5-pro-preview-03-25
    # 테스트 모델 : gemini-1.5-flash-8b 
    MODEL_NAME = "gemini-1.5-flash-8b"
    
except Exception as e:
    logger.critical(f"초기화 오류 발생: {e}")
    raise RuntimeError(f"초기화 실패: {e}")



async def create_passage(request: PassageRequest) -> PassageResponse:
    try:
        logger.info(f"지문 생성 요청 수신 -> 분야:{request.type_passage}, 키워드:{request.keyword}")
        
        passage_guidelines = get_passage_guidelines(request.type_passage)
        logger.debug(f"지문 가이드라인 불러오기:{passage_guidelines[:50]}...")

        keyword_str = ", ".join(request.keyword)

        max_attempts = 2
        min_char_count_threshold = 1350
        generated_passages = []

        for attempt in range(max_attempts):
            logger.info(f"지문 생성 시도 {attempt + 1}/{max_attempts}")

            system_prompt = f"""당신은 대한민국 대학수학능력시험의 국어 영역 독서 분야 지문을 작성하는 시험출제 전문가이다.
                                {request.type_passage} 분야에 대해 공정하고 객관적인 사실을 다루는 지문을 작성해야 한다.
                                하나의 주제를 중심으로 지문 전체의 흐름을 유지하면서도, 동일한 내용이나 유사한 논지를 불필요하게 반복하지 말고 각 문장을 논리적으로 전개해야 한다.
                                단순한 정보 나열보다 개념 간의 관계를 유기적으로 연결하여 논리적으로 서술해야 한다.
                                시험을 치르는 수험생이 지문을 읽고 논리적 추론을 수행할 수 있게 작성해야 한다.
                                모든 문장은 한국어로 작성하며 문법적으로 완벽해야 한다."""

            user_prompt = f"""다음은 {request.type_passage} 분야의 출제 경향 및 작성 원칙이다.
                                {passage_guidelines}

                                다음은 문장 구성 및 지문 작성 원칙에 대한 정리이다.
                                모든 문장은 문어체로 논리적이고 객관적으로 서술해야 하며, 명확하고 완결성 있게 작성해야 한다.
                                적절한 예시나 개념적 설명을 포함하면서 자연스러운 흐름을 유지해야 한다.
                                모든 문장은 주어와 서술어의 호응을 고려하여 문장당 평균 17~25어절이 되도록 작성해야 한다.
                                지문이 논리적으로 구성되도록 문단을 4-5개로 적절히 나누고, 각 문단이 하나의 중심 내용을 명확하게 전달하도록 작성해야 한다.
                                지문의 전체 글자 수는 한국어 기준 공백을 포함해 최소 1400자, 최대 1600자 분량을 반드시 지켜야 한다.
                                허구적인 사건 및 개념, 가상의 인물을 서술하는 것은 금지한다.
                                지문의 마지막 문단에서 '결론적으로', '결과적으로'와 같이 결론을 지으며 교훈을 주려는 문구를 사용하지 않아야 한다.

                                출제 경향 및 작성 원칙, 문장 구성 및 지문 작성 원칙을 바탕으로 {request.type_passage} 분야에서 '{keyword_str}'을 핵심 제재로 활용하여 논리적이고 구조적인 수능 국어 독서 영역 지문을 작성하라.
                                생성한 지문이 **공백 포함 최소 1400자, 최대 1600자**를 충족하는지 실제로 세어서 검토하고, 글자수를 반드시 만족하도록 조정하여 출력하라.
                                출력은 지문만 출력하고, 이외의 불필요한 정보는 포함하지 않도록 해라."""

            response = await client.aio.models.generate_content(
                model=MODEL_NAME,
                contents=[
                    {"role": "user", "parts": [{"text": system_prompt + "\n\n" + user_prompt}]}
                ]
            )

            current_passage = response.text
            char_count = len(current_passage)
            logger.debug(f"{attempt + 1}번째 시도 -> 생성 지문 길이 : {char_count}자")

            generated_passages.append((current_passage, char_count))

            if char_count >= min_char_count_threshold:
                logger.info("생성된 지문이 최소 글자 수 조건을 만족했습니다.")
                break

            if char_count < min_char_count_threshold:
               logger.warning(f"생성 지문 길이 ({char_count})자가 최소 기준 ({min_char_count_threshold})보다 부족합니다. 다시 시도합니다.")

        if not generated_passages:
             logger.error("모든 시도에서 지문을 생성하지 못했습니다.")
             raise HTTPException(status_code=500, detail="지문 생성에 실패했습니다.")

        valid_passages = [(passage, count) for passage, count in generated_passages if count >= min_char_count_threshold]
        
        if valid_passages:
            generated_passage, max_char_count = max(valid_passages, key=lambda x: x[1])
        else:
            generated_passage, max_char_count = max(generated_passages, key=lambda x: x[1])
            logger.warning(f"기준 글자 수({min_char_count_threshold}자)를 만족하는 지문이 없어 가장 긴 지문을 반환합니다 - 길이: {max_char_count}자")

        logger.info("생성된 지문에서 핵심 논점을 추출합니다.")

        core_point_prompt = f"""다음은 한국교육과정평가원 스타일로 생성된 수능 독서 지문입니다.

                                [생성된 지문]
                                {generated_passage}

                                논점이란 해당 글에서 다루는 핵심 주제나 쟁점을 의미한다.
                                이는 출제자가 독자에게 전달하고자 하는 주요 메시지나 주장으로, 글의 방향성과 목적을 결정짓는 요소이다.
                                이 지문에서 학생이 반드시 이해해야 할 핵심 논점 3가지를 요약하라.

                                <작성 예시>
                                "첫째, 조세는 국가 운영과 공공 서비스 재정을 마련하는 중요한 수단으로 효율적인 자원 분배와 공평한 부담을 동시에 추구해야 한다.
                                둘째, 조세 제도 설계 시 효율성과 공평성을 균형 있게 고려하여 경제 활동을 저해하지 않으면서도 재정 안정성을 보장할 필요가 있다.
                                셋째, 다양한 이해관계자와 전문가의 의견을 수렴하고 구체적인 통계 자료를 토대로 합리적인 기준을 설정하여 조세 정책의 효율성과 공평성을 실현해야 한다."
                                출력은 불필요한 문자 없이 줄글 형태로만 출력해라."""

        core_point_response = await client.aio.models.generate_content(
            model=MODEL_NAME,
            contents=[{"role": "user", "parts": [{"text": core_point_prompt}]}]
        )

        generated_core_point = core_point_response.text.strip()
        logger.debug(f"핵심 논점 생성 완료 : {generated_core_point[:30]}...")

        return PassageResponse(
            generated_passage=generated_passage,
            generated_core_point=generated_core_point
        )

    except ValueError as ve:
         logger.error(f"입력값 오류 : {str(ve)}")
         raise HTTPException(status_code=400, detail=f"입력값 오류: {str(ve)}")
    
    except genai.types.generation_types.BlockedPromptException as bpe:
         logger.error(f"프롬프트 차단 : {bpe}")
         raise HTTPException(status_code=400, detail="지문 생성 요청이 안전 정책에 의해 차단되었습니다.")
    
    except Exception as e:
        error_detail = traceback.format_exc()
        logger.error(f"지문 생성 중 오류 발생 : {str(e)}\n{error_detail}")
        raise HTTPException(status_code=500, detail=f"지문 생성 중 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요: {str(e)}")
