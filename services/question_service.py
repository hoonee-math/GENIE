import os
import traceback
from typing import List, Dict, Any
from google import genai
from fastapi import HTTPException
from schemas.question import QuestionRequest, QuestionResponse
from utils.guidelines import get_question_guidelines
from utils.json_utils import process_json_response
from utils.logger import logger, log_api_call_cost

try:
    # API 키 유효성 검증
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
    
    client = genai.Client(api_key=GEMINI_API_KEY)

    # 사용 가능 모델 : gemini-2.5-flash-preview-04-17, gemini-2.5-pro-preview-03-25
    # 테스트 모델 : gemini-1.5-flash 
    GEMINI_PRO_MODEL = "gemini-2.5-pro-preview-03-25"
    GEMINI_FLASH_MODEL = "gemini-2.0-flash-lite"
    
except Exception as e:
    logger.critical(f"초기화 오류 발생: {e}")
    raise RuntimeError(f"초기화 실패: {e}")


async def create_question(request: QuestionRequest) -> QuestionResponse:
    try:
        logger.info(f"문항 생성 요청 수신 -> 유형:{request.type_question}")
        logger.debug(f"입력 지문 길이:{len(request.custom_passage)}자")

        # --- 1. 지문 분류 및 키워드 추출 ---
        logger.info("지문 유형 및 핵심 키워드 추출 중")

        type_keyword_prompt = f"""아래의 지문을 5가지 주제 (인문, 예술, 사회, 기술, 과학 중 선택) 중 하나로 분류하세요.
그리고 15자 이내로 요약한 핵심 키워드를 1~3개 뽑아주세요. 쉼표(,)로 구분해주세요.

[주제 분류 기준]
인문: 인간의 존재와 관련된 문제, 그리고 인간의 사상과 문화 등을 다루고 있는 글이다. 인간의 본질이나 정신세계, 그리고 인간의 행위에 대한 이해를 목적으로 하는 글이다. 인간과 세계의 본질과 관련된 글, 인간의 행위 규범과 관련된 글, 인간의 의식 세계와 관련된 글, 사유의 형식이나 법칙과 관련된 글, 그리고 역사나 종교와 관련된 글 등을 포함한다.
예술: 미의 본질이나 미를 추구하는 인간의 다양한 예술 행위에 대해 다루고 있는 글이다. 예술의 본질과 다양한 예술 행위의 특징을 이해하는 한편, 예술 작품을 수용하는 미적 안목을 향상하는 데 도움을 주기 위한 글이다. 예술의 본질에 대해 논의하는 글, 다양한 예술 행위의 특징을 설명하는 글, 주요 예술가나 예술 작품을 비평하는 글, 예술 사조에 대해 설명하는 글 등을 포함한다.
사회: 사회에서 일어나거나 일어날 수 있는 다양한 문제를 소개하고 해결하는 방안을 제시하 는 글이다. 사회 현상이나 문화 현상을 다양한 관점에서 논리적, 체계적으로 설명하는 글이다. 법을 다룬 법학, 사회 제도 및 사회의 다양한 현상을 연구하는 사회학, 기업의 경영을 다룬 경영학, 경제 문제 및 경제 활동을 설명하는 경제학, 생물로서의 인간을 종합적으로 연구하는 인류학, 사회 구성원에 의해 이루어진 생활 양식 및 그와 관련하여 일어나는 여러 현상들을 연구하는 문화학과 관련된 글 등을 포함한다.
기술: 인간의 삶을 편리하게 하는 산업 기술, 생활 기술 등 다양한 분야의 기술을 설명하는 글이다. 특정 과학 이론을 바탕으로 장치나 시스템에 적용되는 원리와 작동 과정, 한계 등을 구체적으로 서술한 글이다. 전기와 전자의 원리를 이용한 공학 기술, 컴퓨터를 이용한 공학 기술, 화학이나 생명 과학과 결합된 공학 기술, 토목이나 건축에 활용되는 토목건축 공학 기술과 관련된 글 둥을 포함한다.
과학: 자연 과학적 시각으로 물질계와 생태계, 우주를 탐구하는 인간의 정신 활동을 담고 있는 글이다. 수에 관하여 연구하는 수학, 물질의 물리적 성질과 운동 형태 등을 연구하는 물리학, 물질의 조성과 구조 · 성질 등을 연구하는 화학, 생물의 구조와 기능을 과학적으로 연구하는 생명 과학, 지구 및 천체를 연구하는 지구 과학과 관련된 글 등을 포함한다.

[지문]
{request.custom_passage}

반드시 아래 JSON 형식으로만 응답해야 합니다:
{{
    "type_passage": "string",
    "keyword": "[string1], [string2], [string3]"
}}"""

        type_keyword_response = await client.aio.models.generate_content(
            model=GEMINI_FLASH_MODEL,
            contents=[{"role": "user", "parts": [{"text": type_keyword_prompt}]}]
        )

        usage_metadata_type_keyword = type_keyword_response.usage_metadata
        log_api_call_cost(GEMINI_FLASH_MODEL, {
            "prompt_token_count": usage_metadata_type_keyword.prompt_token_count,
            "total_token_count": usage_metadata_type_keyword.total_token_count,
        })

        type_keyword_result = process_json_response(type_keyword_response.text)
        type_passage = type_keyword_result.get("type_passage", "분야 추출 실패")
        keyword_str = type_keyword_result.get("keyword", "제재 추출 실패")

        logger.debug(f"추출 지문 유형:{type_passage}, 키워드:{keyword_str}")

        keyword_list = [k.strip() for k in keyword_str.split(',')]

        # --- 2. 핵심 논점 추출 ---
        logger.info("지문 핵심 논점 추출 중...")

        core_point_prompt = f"""다음은 한국교육과정평가원 스타일로 생성된 수능 독서 지문입니다.

[생성된 지문]
{request.custom_passage}

논점이란 해당 글에서 다루는 핵심 주제나 쟁점을 의미한다.
이는 출제자가 독자에게 전달하고자 하는 주요 메시지나 주장으로, 글의 방향성과 목적을 결정짓는 요소이다.
이 지문에서 학생이 반드시 이해해야 할 핵심 논점 3가지를 요약하라.

<작성 예시>
"첫째, 조세는 국가 운영과 공공 서비스 재정을 마련하는 중요한 수단으로 효율적인 자원 분배와 공평한 부담을 동시에 추구해야 한다.
둘째, 조세 제도 설계 시 효율성과 공평성을 균형 있게 고려하여 경제 활동을 저해하지 않으면서도 재정 안정성을 보장할 필요가 있다.
셋째, 다양한 이해관계자와 전문가의 의견을 수렴하고 구체적인 통계 자료를 토대로 합리적인 기준을 설정하여 조세 정책의 효율성과 공평성을 실현해야 한다."
출력은 불필요한 문자 없이 줄글 형태로만 출력해라."""

        core_point_response = await client.aio.models.generate_content(
            model=GEMINI_FLASH_MODEL,
            contents=[{"role": "user", "parts": [{"text": core_point_prompt}]}]
        )

        usage_metadata_core_point = core_point_response.usage_metadata
        log_api_call_cost(GEMINI_FLASH_MODEL, {
            "prompt_token_count": usage_metadata_core_point.prompt_token_count,
            "total_token_count": usage_metadata_core_point.total_token_count,
        })

        generated_core_point = core_point_response.text.strip()
        logger.debug(f"추출 논점 : {generated_core_point[:30]}...")

        # --- 3. 문항 생성 ---
        logger.info("문항 생성 중...")
        question_guidelines = get_question_guidelines(request.type_question)
        logger.debug(f"문항 생성 가이드라인 불러오기 : {question_guidelines[:30]}...")

        system_prompt = """당신은 대한민국 대학수학능력시험의 국어 영역 독서 분야 문항을 생성하는 시험출제 전문가이다.
문항은 지문에서 측정하고자 하는 내용을 정확히 반영하고, 핵심 내용을 간결하고 구조적이며 체계적으로 구성해야 한다.
선택지를 작성할 때는 문법적, 논리적으로 지문과 일치하도록 하며, 정답과 오답이 명확하게 구별되도록 해야한다.
정답의 위치는 무작위로 배치하여 특정 패턴이 드러나지 않도록 하고, 다른 문항과 중복되지 않도록 해야 한다.
또한 단순히 특정 어휘를 대체하는 방식으로 오답을 구성하면 안된다."""

        user_prompt = f"""다음은 {request.type_question} 유형의 문항과 선지를 작성할 때 반드시 고려해야 할 기준이다.

{question_guidelines}

다음으로 제시하는 지문과 문항 유형을 바탕으로 5개의 선지로 이루어진 문항 1개를 작성해라.
지문의 논점을 반영하여 문항을 생성해라.
[지문]
{request.custom_passage}

[논점]
{generated_core_point}

[문항 예시]
{request.question_example}

문항을 출력하는 형식은 아래와 같다.
정답 및 해설은 선지 번호( ①, ②, ③, ④, ⑤)를 활용하여 정답 선지의 근거와 오답의 틀린 이유를 포함한 상세 해설을 최소 100자, 최대 200자로 출력해야 한다.
선지 출력 결과 안에는 선지 번호( ①, ②, ③, ④, ⑤)를 포함하지 말아라.
반드시 아래 JSON 형식으로만 응답해야 합니다. 마크다운 코드 블록(```)을 사용하지 말고 순수 JSON 형식으로만 응답하세요.
정답은 선지 번호( ①, ②, ③, ④, ⑤)로 출력해라.

{{
    "generated_question": "질문",
    "generated_option": ["선지1", "선지2", "선지3", "선지4", "선지5"],
    "generated_answer": "정답",
    "generated_description": "해설"
}}"""

        question_gen_response = await client.aio.models.generate_content(
            model=GEMINI_PRO_MODEL,
            contents=[
                {"role": "user", "parts": [{"text": system_prompt + "\n\n" + user_prompt}]}]
        )

        usage_metadata_question = question_gen_response.usage_metadata
        log_api_call_cost(GEMINI_PRO_MODEL, {
            "prompt_token_count": usage_metadata_question.prompt_token_count,
            "total_token_count": usage_metadata_question.total_token_count,
        })

        response_json = process_json_response(question_gen_response.text)
        logger.info("문항 생성 완료")

        return QuestionResponse(
            type_passage=type_passage,
            keyword=keyword_list,
            generated_core_point=generated_core_point,
            generated_question=response_json.get("generated_question", "질문 생성 실패"),
            generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
            generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
            generated_description=response_json.get("generated_description", "해설 생성 실패")
        )

    except ValueError as ve:
         logger.error(f"입력값 오류 : {str(ve)}")
         raise HTTPException(status_code=400, detail=f"입력값 오류: {str(ve)}")
    
    except genai.types.generation_types.BlockedPromptException as bpe:
         logger.error(f"프롬프트 차단 : {bpe}")
         raise HTTPException(status_code=400, detail="지문 생성 요청이 안전 정책에 의해 차단되었습니다.")
    
    except HTTPException as http_exc:
         raise http_exc
    
    except Exception as e:
        error_detail = traceback.format_exc()
        logger.error(f"문항 생성 중 오류 발생 : {str(e)}\n{error_detail}")
        raise HTTPException(status_code=500, detail=f"지문 생성 중 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요: {str(e)}")