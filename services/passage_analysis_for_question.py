import os
import json
import traceback
from typing import List, Dict, Any
from google import genai
from google.genai import types
from fastapi import HTTPException
from schemas.question import PassageDataRequest, SinglePassageDataResponse, ReadingPassageDataResponse, MultiplePassageDataResponse
from utils.guidelines import get_question_guidelines
from utils.json_utils import process_json_response
from utils.logger import logger, log_api_call_cost

## 제미나이 모델을 불러오기 위해서 api key가 유효한지 확인합니다.
## api key는 gcp(구글 클라우드 플랫폼)에서 프로젝트를 생성하고, google ai studio에서 해당 프로젝트 안에서 발급할 수 있습니다.
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


# 단일 지문/복합 지문/독서론 여부를 구분하고 그에 맞춰서 지문을 분석하는 함수를 만들었습니다.
async def create_passage_data(request: PassageDataRequest):
    try:
        logger.info("---------- 지문 분석 및 문항 생성 ----------")
        logger.info(f"{request.kind_passage} 분석 요청 수신")
        logger.debug(f"입력 지문 길이 : {len(request.custom_passage)}자")

#         kind_prompt = f"""아래 수능 국어 독서 영역 비문학 지문은 다음 3가지 유형(독서론/단일 지문/복합 지문) 중 하나입니다.

# ## 지문 유형 분류 기준

# - 독서론 : 독서 방법과 같은 독서와 관련한 이야기를 다루는 지문입니다.
# - 단일 지문 : 인문/사회/과학/기술/예술 중 하나의 분야를 바탕으로 쓰여진 단일 지문입니다.
# - 복합 지문 : (가), (나) 지문으로 나뉘어 이루어져 있으며, (가)와 (나) 지문은 각각 인문/사회/과학/기술/예술 중 하나의 분야를 바탕으로 쓰여진 지문입니다.

# ---

# ## 지문

# {request.custom_passage}

# ---

# 입력받은 지문의 유형을 설명 없이 독서론/단일 지문/복합 지문 중 하나로만 분류해 주세요."""
        

#         kind_response = await client.aio.models.generate_content(
#             model=GEMINI_PRO_MODEL,
#             config=types.GenerateContentConfig(
#                 temperature=0.3
#             ),
#             contents=kind_prompt
#         )

#         usage_metadata_first = kind_response.usage_metadata
#         log_api_call_cost(GEMINI_PRO_MODEL, {
#             "prompt_token_count": usage_metadata_first.prompt_token_count,
#             "total_token_count": usage_metadata_first.total_token_count,
#         })

#         kind_passage = kind_response.text.strip()
#         logger.debug(f"지문 유형 : {kind_passage}")

        kind_passage = request.kind_passage

        if kind_passage == "단일 지문":
            logger.info("단일 지문의 분야/핵심 키워드/논점 추출 중")

            single_passage_data_system_prompt = f"""아래 수능 국어 독서 영역 비문학 지문을 바탕으로
1. 5가지 주제 (인문, 예술, 사회, 기술, 과학) 중 하나로 분류하라.
2. 20자 이내로 요약한 핵심 키워드를 3개 뽑아라. 각 키워드는 쉼표(,)로 구분하라.
3. 지문에서 학생이 반드시 이해해야 할 핵심 논점 3가지를 요약하라.
*논점이란 해당 글에서 다루는 핵심 주제나 쟁점을 의미한다. 출제자가 독자에게 전달하고자 하는 주요 메시지나 주장으로, 글의 방향성과 목적을 결정짓는 요소이다.

---

## 주제 분류 기준

- 인문: 인간의 존재와 관련된 문제, 그리고 인간의 사상과 문화 등을 다루고 있는 글이다. 인간의 본질이나 정신세계, 그리고 인간의 행위에 대한 이해를 목적으로 하는 글이다. 인간과 세계의 본질과 관련된 글, 인간의 행위 규범과 관련된 글, 인간의 의식 세계와 관련된 글, 사유의 형식이나 법칙과 관련된 글, 그리고 역사나 종교와 관련된 글 등을 포함한다.
- 예술: 미의 본질이나 미를 추구하는 인간의 다양한 예술 행위에 대해 다루고 있는 글이다. 예술의 본질과 다양한 예술 행위의 특징을 이해하는 한편, 예술 작품을 수용하는 미적 안목을 향상하는 데 도움을 주기 위한 글이다. 예술의 본질에 대해 논의하는 글, 다양한 예술 행위의 특징을 설명하는 글, 주요 예술가나 예술 작품을 비평하는 글, 예술 사조에 대해 설명하는 글 등을 포함한다.
- 사회: 사회에서 일어나거나 일어날 수 있는 다양한 문제를 소개하고 해결하는 방안을 제시하는 글이다. 사회 현상이나 문화 현상을 다양한 관점에서 논리적, 체계적으로 설명하는 글이다. 법을 다룬 법학, 사회 제도 및 사회의 다양한 현상을 연구하는 사회학, 기업의 경영을 다룬 경영학, 경제 문제 및 경제 활동을 설명하는 경제학, 생물로서의 인간을 종합적으로 연구하는 인류학, 사회 구성원에 의해 이루어진 생활 양식 및 그와 관련하여 일어나는 여러 현상들을 연구하는 문화학과 관련된 글 등을 포함한다.
- 기술: 인간의 삶을 편리하게 하는 산업 기술, 생활 기술 등 다양한 분야의 기술을 설명하는 글이다. 특정 과학 이론을 바탕으로 장치나 시스템에 적용되는 원리와 작동 과정, 한계 등을 구체적으로 서술한 글이다. 전기와 전자의 원리를 이용한 공학 기술, 컴퓨터를 이용한 공학 기술, 화학이나 생명 과학과 결합된 공학 기술, 토목이나 건축에 활용되는 토목건축 공학 기술과 관련된 글 등을 포함한다.
- 과학: 자연 과학적 시각으로 물질계와 생태계, 우주를 탐구하는 인간의 정신 활동을 담고 있는 글이다. 수에 관하여 연구하는 수학, 물질의 물리적 성질과 운동 형태 등을 연구하는 물리학, 물질의 조성과 구조 · 성질 등을 연구하는 화학, 생물의 구조와 기능을 과학적으로 연구하는 생명 과학, 지구 및 천체를 연구하는 지구 과학과 관련된 글 등을 포함한다.

---

## 지문

{request.custom_passage}

---

## 핵심 키워드 예시

유서, 조선 전기, 실학자

---

## 핵심 논점 예시

첫째, 조세는 국가 운영과 공공 서비스 재정을 마련하는 중요한 수단으로 효율적인 자원 분배와 공평한 부담을 동시에 추구해야 한다.

둘째, 조세 제도 설계 시 효율성과 공평성을 균형 있게 고려하여 경제 활동을 저해하지 않으면서도 재정 안정성을 보장할 필요가 있다.

셋째, 다양한 이해관계자와 전문가의 의견을 수렴하고 구체적인 통계 자료를 토대로 합리적인 기준을 설정하여 조세 정책의 효율성과 공평성을 실현해야 한다."""


            single_passage_data_user_prompt = f"""반드시 아래 JSON 형식으로 답변하세요.
{{
    "type_passage": String "인문" | "예술" | "사회" | "기술" | "과학",
    "keyword": String "string1, string2, string3",
    "generated_core_point : String "핵심 논점"
}}"""
            
            single_passage_data_response = await client.aio.models.generate_content(
                model=GEMINI_PRO_MODEL,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    system_instruction=single_passage_data_system_prompt
                ),
                contents=single_passage_data_user_prompt
            )

            usage_metadata_single_passage_data = single_passage_data_response.usage_metadata
            log_api_call_cost(GEMINI_PRO_MODEL, {
                "prompt_token_count": usage_metadata_single_passage_data.prompt_token_count,
                "total_token_count": usage_metadata_single_passage_data.total_token_count,
            })

            single_passage_data_json = process_json_response(single_passage_data_response.text)

            single_passage_type = str(single_passage_data_json.get("type_passage")).strip()
            single_passage_keyword = str(single_passage_data_json.get("keyword")).strip()
            single_passage_core = str(single_passage_data_json.get("generated_core_point")).strip()

            logger.debug(f"단일 지문 분야 : {single_passage_type}, 제재 : {single_passage_keyword}, 논점 : {single_passage_core[:15]}...")

            logger.info("단일 지문 분석 및 문항 생성 완료")
            logger.info("----------------------------")

            return SinglePassageDataResponse(
                kind_passage=kind_passage,
                type_passage=single_passage_type,
                keyword=single_passage_keyword,
                generated_core_point=[single_passage_core])
        
        elif kind_passage == "복합 지문":
            logger.info("복합 지문의 분야/핵심 키워드/논점 추출 중")

            multiple_passage_data_system_prompt = f"""아래 수능 국어 독서 영역 비문학 지문의 (가), (나) 지문을 각각
1. 5가지 주제 (인문, 예술, 사회, 기술, 과학) 중 하나로 분류하라.
2. 20자 이내로 요약한 핵심 키워드를 3개 뽑아라. 각 키워드는 쉼표(,)로 구분하라.
3. 지문에서 학생이 반드시 이해해야 할 핵심 논점 3가지를 요약하라.
*논점이란 해당 글에서 다루는 핵심 주제나 쟁점을 의미한다. 출제자가 독자에게 전달하고자 하는 주요 메시지나 주장으로, 글의 방향성과 목적을 결정짓는 요소이다.

---

## 주제 분류 기준

- 인문: 인간의 존재와 관련된 문제, 그리고 인간의 사상과 문화 등을 다루고 있는 글이다. 인간의 본질이나 정신세계, 그리고 인간의 행위에 대한 이해를 목적으로 하는 글이다. 인간과 세계의 본질과 관련된 글, 인간의 행위 규범과 관련된 글, 인간의 의식 세계와 관련된 글, 사유의 형식이나 법칙과 관련된 글, 그리고 역사나 종교와 관련된 글 등을 포함한다.
- 예술: 미의 본질이나 미를 추구하는 인간의 다양한 예술 행위에 대해 다루고 있는 글이다. 예술의 본질과 다양한 예술 행위의 특징을 이해하는 한편, 예술 작품을 수용하는 미적 안목을 향상하는 데 도움을 주기 위한 글이다. 예술의 본질에 대해 논의하는 글, 다양한 예술 행위의 특징을 설명하는 글, 주요 예술가나 예술 작품을 비평하는 글, 예술 사조에 대해 설명하는 글 등을 포함한다.
- 사회: 사회에서 일어나거나 일어날 수 있는 다양한 문제를 소개하고 해결하는 방안을 제시하는 글이다. 사회 현상이나 문화 현상을 다양한 관점에서 논리적, 체계적으로 설명하는 글이다. 법을 다룬 법학, 사회 제도 및 사회의 다양한 현상을 연구하는 사회학, 기업의 경영을 다룬 경영학, 경제 문제 및 경제 활동을 설명하는 경제학, 생물로서의 인간을 종합적으로 연구하는 인류학, 사회 구성원에 의해 이루어진 생활 양식 및 그와 관련하여 일어나는 여러 현상들을 연구하는 문화학과 관련된 글 등을 포함한다.
- 기술: 인간의 삶을 편리하게 하는 산업 기술, 생활 기술 등 다양한 분야의 기술을 설명하는 글이다. 특정 과학 이론을 바탕으로 장치나 시스템에 적용되는 원리와 작동 과정, 한계 등을 구체적으로 서술한 글이다. 전기와 전자의 원리를 이용한 공학 기술, 컴퓨터를 이용한 공학 기술, 화학이나 생명 과학과 결합된 공학 기술, 토목이나 건축에 활용되는 토목건축 공학 기술과 관련된 글 등을 포함한다.
- 과학: 자연 과학적 시각으로 물질계와 생태계, 우주를 탐구하는 인간의 정신 활동을 담고 있는 글이다. 수에 관하여 연구하는 수학, 물질의 물리적 성질과 운동 형태 등을 연구하는 물리학, 물질의 조성과 구조 · 성질 등을 연구하는 화학, 생물의 구조와 기능을 과학적으로 연구하는 생명 과학, 지구 및 천체를 연구하는 지구 과학과 관련된 글 등을 포함한다.

---

## 지문

{request.custom_passage}

---

## 핵심 키워드 예시

유서, 조선 전기, 실학자

---

## 핵심 논점 예시

첫째, 조세는 국가 운영과 공공 서비스 재정을 마련하는 중요한 수단으로 효율적인 자원 분배와 공평한 부담을 동시에 추구해야 한다.

둘째, 조세 제도 설계 시 효율성과 공평성을 균형 있게 고려하여 경제 활동을 저해하지 않으면서도 재정 안정성을 보장할 필요가 있다.

셋째, 다양한 이해관계자와 전문가의 의견을 수렴하고 구체적인 통계 자료를 토대로 합리적인 기준을 설정하여 조세 정책의 효율성과 공평성을 실현해야 한다."""
            
            multiple_passage_data_user_prompt = f"""반드시 아래 JSON 형식으로 답변하세요.
{{
    "first_passage_type": String "인문" | "예술" | "사회" | "기술" | "과학",
    "first_passage_keyword": String "string1, string2, string3",
    "first_passage_generated_core_point": String "(가) 논점",
    "second_passage_type": String "인문" | "예술" | "사회" | "기술" | "과학",
    "second_passage_keyword": String "string1, string2, string3",
    "second_passage_generated_core_point": String "(나) 논점"
}}"""
            
            multiple_passage_data_response = await client.aio.models.generate_content(
                model=GEMINI_PRO_MODEL,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    system_instruction=multiple_passage_data_system_prompt
                ),
                contents=multiple_passage_data_user_prompt
            )

            usage_metadata_multiple_passage_data = multiple_passage_data_response.usage_metadata
            log_api_call_cost(GEMINI_PRO_MODEL, {
                "prompt_token_count": usage_metadata_multiple_passage_data.prompt_token_count,
                "total_token_count": usage_metadata_multiple_passage_data.total_token_count,
            })

            multiple_passage_data_json = process_json_response(multiple_passage_data_response.text)

            first_passage_type = str(multiple_passage_data_json.get("first_passage_type")).strip()
            first_passage_keyword = str(multiple_passage_data_json.get("first_passage_keyword")).strip()
            first_passage_generated_core_point = str(multiple_passage_data_json.get("first_passage_generated_core_point")).strip()
            second_passage_type = str(multiple_passage_data_json.get("second_passage_type")).strip()
            second_passage_keyword = str(multiple_passage_data_json.get("second_passage_keyword")).strip()
            second_passage_generated_core_point = str(multiple_passage_data_json.get("second_passage_generated_core_point")).strip()

            logger.debug(f"복합 지문 (가) 분야 : {first_passage_type}, (나) 분야 : {second_passage_type}, (가) 제재 : {first_passage_keyword}, (나) 제재 : {second_passage_keyword}, (가) 논점 : {first_passage_generated_core_point[:15]}..., (나) 제재 : {second_passage_generated_core_point[:15]}...")

            logger.info("복합 지문 분석 및 문항 생성 완료")
            logger.info("----------------------------")

            return MultiplePassageDataResponse(
                kind_passage=kind_passage,
                first_passage_type=first_passage_type,
                first_passage_keyword=first_passage_keyword,
                second_passage_type=second_passage_type,
                second_passage_keyword=second_passage_keyword,
                generated_core_point=[first_passage_generated_core_point, second_passage_generated_core_point])


        else:
            logger.info("독서론 지문의 분야/핵심 키워드/논점 추출 중")

            reading_passage_data_system_prompt = f"""아래 수능 국어 독서 영역 비문학(독서론) 지문을 바탕으로
1. 20자 이내로 요약한 핵심 키워드를 3개 뽑아라. 각 키워드는 쉼표(,)로 구분하라.
2. 지문에서 학생이 반드시 이해해야 할 핵심 논점 3가지를 요약하라.
*논점이란 해당 글에서 다루는 핵심 주제나 쟁점을 의미한다. 출제자가 독자에게 전달하고자 하는 주요 메시지나 주장으로, 글의 방향성과 목적을 결정짓는 요소이다.

---

## 지문

{request.custom_passage}

---

## 핵심 키워드 예시

유서, 조선 전기, 실학자

---

## 핵심 논점 예시

첫째, 조세는 국가 운영과 공공 서비스 재정을 마련하는 중요한 수단으로 효율적인 자원 분배와 공평한 부담을 동시에 추구해야 한다.

둘째, 조세 제도 설계 시 효율성과 공평성을 균형 있게 고려하여 경제 활동을 저해하지 않으면서도 재정 안정성을 보장할 필요가 있다.

셋째, 다양한 이해관계자와 전문가의 의견을 수렴하고 구체적인 통계 자료를 토대로 합리적인 기준을 설정하여 조세 정책의 효율성과 공평성을 실현해야 한다."""
            
            reading_passage_data_user_prompt ="""반드시 아래 JSON 형식으로 답변하세요.
{{
    "keyword": String "string1, string2, string3",
    "generated_core_point : String "핵심 논점"
}}"""
            
            reading_passage_data_response = await client.aio.models.generate_content(
                model=GEMINI_PRO_MODEL,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    system_instruction=reading_passage_data_system_prompt
                ),
                contents=reading_passage_data_user_prompt
            )

            usage_metadata_reading_passage_data = reading_passage_data_response.usage_metadata
            log_api_call_cost(GEMINI_PRO_MODEL, {
                "prompt_token_count": usage_metadata_reading_passage_data.prompt_token_count,
                "total_token_count": usage_metadata_reading_passage_data.total_token_count,
            })

            reading_passage_data_json = process_json_response(reading_passage_data_response.text)

            reading_passage_keyword = str(reading_passage_data_json.get("keyword")).strip()
            reading_passage_core = str(reading_passage_data_json.get("generated_core_point")).strip()

            logger.debug(f"독서론 제재 : {reading_passage_keyword}, 논점 : {reading_passage_core[:15]}...")

            logger.info("독서론 지문 분석 및 문항 생성 완료")
            logger.info("---------------------------------------")

            return ReadingPassageDataResponse(
                kind_passage=kind_passage,
                keyword=reading_passage_keyword,
                generated_core_point=[reading_passage_core])



    except ValueError as ve:
         logger.error(f"입력값 오류 : {str(ve)}")
         raise HTTPException(status_code=400, detail=f"입력값 오류: {str(ve)}")
    
    except genai.types.generation_types.BlockedPromptException as bpe:
         logger.error(f"프롬프트 차단 : {bpe}")
         raise HTTPException(status_code=400, detail="지문 분석 요청이 안전 정책에 의해 차단되었습니다.")
    
    except HTTPException as http_exc:
         raise http_exc
    
    except Exception as e:
        error_detail = traceback.format_exc()
        logger.error(f"문항 생성을 위한 지문 분석 중 오류 발생 : {str(e)}\n{error_detail}")
        raise HTTPException(status_code=500, detail=f"지문 분석 중 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요: {str(e)}")