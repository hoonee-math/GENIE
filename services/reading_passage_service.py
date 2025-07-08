import os
import traceback
from google import genai
from google.genai import types
from fastapi import HTTPException
from schemas.passage import ReadingPassageRequest, ReadingPassageResponse
from utils.guidelines import get_passage_guidelines, get_passage_examples, get_passage_structures
from utils.logger import logger, log_api_call_cost
from dotenv import load_dotenv


load_dotenv()

try:
    # API 키 유효성 검증
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
    
    client = genai.Client(api_key=GEMINI_API_KEY)

    # 사용 가능 모델 : gemini-2.5-flash-preview-04-17, gemini-2.5-pro-preview-03-25, gemini-2.5-pro, gemini-2.5-pro-preview-05-06, gemini-2.5-pro-preview-06-05, gemini-2.5-flash-preview-05-20 등 docs에 꾸준히 업데이트되는 것을 확인할 수 있습니다.
    # 테스트 모델 : gemini-1.5-flash 
    GEMINI_PRO_MODEL = "gemini-2.5-pro"
    GEMINI_FLASH_MODEL = "gemini-2.5-flash-preview-05-20"
    
except Exception as e:
    logger.critical(f"초기화 오류 발생: {e}")
    raise RuntimeError(f"초기화 실패: {e}")



async def create_reading_passage(request: ReadingPassageRequest) -> ReadingPassageResponse:
    try:
        logger.info(f"지문 생성 요청 수신 -> 분야:독서론, 키워드:{request.keyword}, 요청사항:{request.requirement}")

        passage_guidelines = get_passage_guidelines("독서론")
        logger.debug(f"지문 가이드라인 불러오기:{passage_guidelines[:25]}...")

        passage_example = get_passage_examples("독서론")
        logger.debug(f"지문 예시 불러오기:{passage_example[:25]}...")

        keyword_str = request.keyword

        max_attempts = 2
        min_char_count_threshold = 900
        generated_passages = []

        for attempt in range(max_attempts):
            logger.info(f"지문 생성 시도 {attempt + 1}/{max_attempts}")

            system_prompt = f"""당신은 대한민국 대학수학능력시험(College Scholastic Ability Test, Republic of Korea) 국어 영역 독서 분야 비문학 지문을 작성하는 시험 출제 전문가이다.
독서론 분야에서 '{keyword_str}'을 핵심 제재로 지문을 작성해야 한다.

---

## 독서론 분야 출제 경향 및 작성 원칙

{passage_guidelines}

---

## 지문 작성 원칙

- 하나의 주제를 중심으로 지문 전체의 흐름을 유지한다.
- 공정하고 객관적인 사실을 다룬다. 허구적인 사건 및 개념, 가상의 인물을 서술하는 것은 금지한다.
- 적절한 예시나 개념적 설명을 포함하면서 자연스러운 흐름을 유지한다.
- 동일한 내용이나 유사한 논지를 불필요하게 반복하지 않는다.
- 같은 내용이라도 다른 표현 방식으로 이해를 돕고, 추론을 이끌어낸다.
- 단순한 정보 나열보다 개념 간의 관계를 유기적으로 연결하여 논리적으로 서술한다.
- 문항 출제자가 논리적 추론을 수행하는 문항을 낼 수 있도록 지문을 작성한다.
- 지문의 글자 수는 한국어 기준 **공백을 포함해 최소 900자, 최대 1000자**로 한다.
- 문단을 3~4개로 나누고, 각 문단은 중심 내용을 명확하게 전달한다.
*'결국', '결론적으로', '결과적으로'와 같은 결론 표현은 지양한다.

---

## 문장 구성 원칙

- 모든 문장은 한국어로 작성하며 문법에 맞게 작성한다.
- 평어체, 문어체로 논리적이고 객관적으로 서술하며 명확하게 작성한다.
- 각 문장은 평균 17~25 어절로 작성하며, 주어-서술어의 호응에 유의한다.

---

## 참고용 예시 지문
- 다음 예시 지문의 톤, 문장 길이, 단락 구성 방식의 참고 예시로 활용한다. 
- 내용은 절대 활용하지 않는다.

{passage_example}"""

            user_prompt = f"""출제 경향 및 작성 원칙, 지문 작성 및 문장 구성 원칙을 참고하여
분야 : 독서론
핵심 제재 : {keyword_str}
을 만족하는 논리적이고 구조적인 수능 국어 독서 영역 비문학 지문을 작성하라.
생성한 지문이 **공백 포함 최소 900자, 최대 1000자**를 충족하는지 꼭 검토해서 글자 수를 반드시 만족하도록 한다.
출력은 지문만 출력하고, 이외의 불필요한 정보는 포함하지 않도록 하라."""

            if request.requirement and request.requirement.strip():
                user_prompt += f"\n\n*추가 요청 사항 : {request.requirement.strip()}"

            response = await client.aio.models.generate_content(
                model=GEMINI_PRO_MODEL,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.3
                ),
                contents=user_prompt
            )

            usage_metadata = response.usage_metadata
            log_api_call_cost(GEMINI_PRO_MODEL, {
                "prompt_token_count": usage_metadata.prompt_token_count,
                "total_token_count": usage_metadata.total_token_count,
            })

            current_passage = response.text
            char_count = len(current_passage)
            logger.debug(f"{attempt + 1}번째 시도 -> 생성 지문 길이 : {char_count}자")

            generated_passages.append((current_passage, char_count))

            if char_count >= min_char_count_threshold:
                logger.info(f"생성된 지문이 최소 글자 수 ({min_char_count_threshold})자를 만족했습니다.")
                break
            else:
                logger.warning(f"생성 지문 길이 ({char_count})자가 최소 기준 ({min_char_count_threshold})보다 부족합니다. 다시 시도합니다.")

        if not generated_passages:
            logger.error("모든 시도에서 지문을 생성하지 못했습니다.")
            raise HTTPException(status_code=500, detail="지문 생성에 실패했습니다.")

        valid_passages = [(p, c) for p, c in generated_passages if c >= min_char_count_threshold]
        if valid_passages:
            generated_passage, max_char_count = max(valid_passages, key=lambda x: x[1])
        else:
            generated_passage, max_char_count = max(generated_passages, key=lambda x: x[1])
            logger.warning(f"기준 글자 수({min_char_count_threshold}자)를 만족하는 지문이 없어 가장 긴 지문을 반환합니다 - 길이: {max_char_count}자")

        logger.info("생성된 지문에서 핵심 논점을 추출합니다.")

        core_point_prompt = f"""다음은 수능 국어 영역 독서 분야 비문학 지문이다.

[지문]
{generated_passage}

이 지문에서 학생이 반드시 이해해야 할 핵심 논점 3가지를 요약하라.
*논점이란 해당 글에서 다루는 핵심 주제나 쟁점을 의미한다. 출제자가 독자에게 전달하고자 하는 주요 메시지나 주장으로, 글의 방향성과 목적을 결정짓는 요소이다.

<작성 예시>
"첫째, 조세는 국가 운영과 공공 서비스 재정을 마련하는 중요한 수단으로 효율적인 자원 분배와 공평한 부담을 동시에 추구해야 한다.

둘째, 조세 제도 설계 시 효율성과 공평성을 균형 있게 고려하여 경제 활동을 저해하지 않으면서도 재정 안정성을 보장할 필요가 있다.

셋째, 다양한 이해관계자와 전문가의 의견을 수렴하고 구체적인 통계 자료를 토대로 합리적인 기준을 설정하여 조세 정책의 효율성과 공평성을 실현해야 한다."


출력은 불필요한 문자 없이 줄글 형태로만 출력해라."""

        core_point_response = await client.aio.models.generate_content(
            model=GEMINI_FLASH_MODEL,
            config=types.GenerateContentConfig(
                temperature=0.3
            ),
            contents=core_point_prompt
        )

        usage_metadata_core_point = core_point_response.usage_metadata
        log_api_call_cost(GEMINI_FLASH_MODEL, {
            "prompt_token_count": usage_metadata_core_point.prompt_token_count,
            "total_token_count": usage_metadata_core_point.total_token_count,
        })

        generated_core_point = core_point_response.text.strip()
        logger.debug(f"핵심 논점 생성 완료 : {generated_core_point[:30]}...")

        return ReadingPassageResponse(
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