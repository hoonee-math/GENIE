import os
import json
import traceback
from typing import List, Dict, Any
from google import genai
from google.genai import types
from fastapi import HTTPException
from schemas.question import QuestionRequest, MultiplePassageInfo, MultiplePassageQuestionResponse # QuestionInfo
from utils.guidelines import get_question_guidelines
from utils.json_utils import process_json_response
from utils.logger import logger, log_api_call_cost

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


async def create_multiple_passage_question(request: QuestionRequest) -> MultiplePassageQuestionResponse:
    try:
        logger.info("---------- 복합 지문 문항 생성 ----------")
        logger.info(f"문항 생성 요청 수신 -> 유형:{request.type_question}")
        logger.debug(f"입력 복합 지문 길이:{len(request.custom_passage)}자")


        # -------------------------------------------------- 문항 생성 : 문항을 생성합니다. ----------------------------------------------------
        ## 사실적, 추론적, 비판적, 어휘 각각의 유형에 따른 가이드라인을 가져옵니다.
        question_guidelines = get_question_guidelines(request.type_question)
        logger.debug(f"문항 생성 가이드라인 불러오기 : {question_guidelines[:30]}...")

        system_prompt = f"""당신은 대한민국 대학수학능력시험(College Scholastic Ability Test, Republic of Korea) 국어 영역 독서 분야 비문학 지문에 대한 한 개의 문항을 작성하는 시험 출제 전문가이다.
아래 지문을 기반으로 제시된 문제문 형식과 예시 문항을 참고하여 같은 원리로 {request.type_question} 유형 문항을 작성하라. 
지문의 논점, 문항 작성 원칙은 다음과 같다.

---

## 지문

{request.custom_passage}


## 문제문 형식

{request.question_format}

---

## 예시 문제문, """

        if request.question_subpassage_example and request.question_subpassage_example.strip():
            system_prompt += "보기 지문, "

        system_prompt +=f"""선지

문제문
{request.question_statement_example}
"""

        if request.question_subpassage_example and request.question_subpassage_example.strip(): 
            system_prompt += f"""
보기 지문
{request.question_subpassage_example}
"""
        system_prompt += f"""
선지
{request.question_choice_example}

---

## {request.type_question} 유형 고려사항

{question_guidelines}"""

        user_prompt = f"""제시된 지문을 기반으로 {request.question_format} 형식의 5개의 선지"""
        
        if request.question_subpassage_example and request.question_subpassage_example.strip():
            user_prompt += "와 보기 지문으"
            
            
        user_prompt += f"""로 이루어진 문항 1개를 작성해라.

---

## quoted_paragraph, quoted_sentence, quoted_word 처리 로직

1. 문제문에 [A]가 포함되어 있는 경우:
- [A]가 가리킬 **문단 1개(\\n\\n으로 각 문단이 구분되어 있다.)**를 그대로 quoted_paragraph에 담는다.

2. 문제문에 ㉠과 같은 기호가 포함된 경우:
- 해당 기호가 가리키는 어구를 포함하는 지문 속 문장을 찾아, 그 문장을 그대로 quoted_sentence에 담는다.
- 해당 기호가 가리키는 어구 자체는 그대로 quoted_word에 담는다.
- ex)
quoted_sentence(기호를 담지 말 것) : 경마식 보도는 경마 중계를 하듯 지지율 변화나 득표율 예측 등을 집중 보도하는 선거 방송의 한 방식이다.
quoted_word : 경마식 보도

3. 문제문에 [A]와 ㉠ 같은 기호가 **동시에 포함된 경우**:
- [A]가 나타내는 문단은 quoted_paragraph에 담고, 문단 안에 ㉠이 나타내는 단어를 포함한 문장은 quoted_sentence에, 단어는 quoted_word에 담는다.

4. 문제문에 ㉠, ㉡, ㉢, ㉣ 등 **여러 개의 기호가 포함된 경우**:
- ㉠, ㉡, ㉢, ㉣은 지문 내에서 순서대로 나와야 한다.
- 각 어구가 가리키는 단어를 포함하는 문장을 지문에서 찾아, 해당 문장을 quoted_sentence의 `List[str]`에 **기호 순서대로 담는다.**.
- 각 어구가 가리키는 단어 자체는 quoted_word의 `List[str]`에 **기호 순서대로 담는다.**.
- ex)
quoted_sentence
[
    "수정 진동자는 고유 주파수에 맞추어 진동을 유도하여 진동량을 측정하기 쉽게 만든 장치이다.",
    "경마식 보도는 지지율 변화만을 중계하는 방식으로 선거 보도의 본질을 흐릴 수 있다.",
    "개방형 자율학습은 학습자가 스스로 학습 목표와 진도를 조절할 수 있게 하는 방식이다.",
    "조세 정책의 효율성과 공평성은 정책 설계의 양대 축으로 고려된다."
],
quoted_word
["수정 진동자", "경마식 보도", "개방형 자율학습", "조세 정책의 효율성과 공평성"]

---

## 답변 출력 형식

- 해설은 선지 번호(①, ②, ③, ④, ⑤)를 활용하여 <정답 및 해설 예시>를 참고해 [정답해설]과 [오답피하기]로 작성한다.
- 정답은 선지 번호(①, ②, ③, ④, ⑤)로 출력한다. 
- 선지 출력 결과 안에는 선지 번호(①, ②, ③, ④, ⑤)를 절대 포함하지 않는다.
- 선지는 꼭 예시 선지와 같은 형식으로 맞춘다.(ex: 마크다운 태그 여부)
- 마크다운 코드 블록(```) 없이, 반드시 아래 JSON 형식을 만족하는 답변을 출력한다.
{{
    "generated_question": String "문제문",
    "generated_option": List ["선지1", "선지2", "선지3", "선지4", "선지5"],
    "generated_answer": String "정답",
    "generated_description": List ["정답해설", "오답피하기"]",
    """
        if request.question_subpassage_example and request.question_subpassage_example.strip():
            user_prompt += '"generated_subpassage": String "보기 지문",'

        user_prompt += f"""
    "quoted_paragraph" : Optional[str] "인용된 문단",
    "quoted_sentence" : Optional[List[str]], "인용문구가 포함된 문장
    "quoted_word": Optional[List[str]] "인용문구"
}}"""

        question_gen_response = await client.aio.models.generate_content(
            model=GEMINI_PRO_MODEL,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.3,
                # response_mime_type="application/json",
                # response_schema=QuestionInfo,
            ),
            contents=user_prompt
        )

        usage_metadata_question = question_gen_response.usage_metadata
        log_api_call_cost(GEMINI_PRO_MODEL, {
            "prompt_token_count": usage_metadata_question.prompt_token_count,
            "total_token_count": usage_metadata_question.total_token_count,
        })

        ## 구조화된 답변을 유도하는 설정
        # response_json = json.loads(question_gen_response.text)
        response_json = process_json_response(question_gen_response.text)
        logger.info("복합 지문 문항 생성 완료")
        logger.info("---------------------------------------")


        return MultiplePassageQuestionResponse(
                    kind_passage="복합 지문",
                    generated_question=response_json.get("generated_question", "문제문 생성 실패"),
                    generated_subpassage=response_json.get("generated_subpassage", None),
                    generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
                    generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
                    generated_description=response_json.get("generated_description", "해설 생성 실패"),
                    quoted_paragraph = response_json.get("quoted_paragraph", None),
                    quoted_sentence = response_json.get("quoted_sentence", None),
                    quoted_word = response_json.get("quoted_word", None)
                )
    

    except ValueError as ve:
         logger.error(f"입력값 오류 : {str(ve)}")
         raise HTTPException(status_code=400, detail=f"입력값 오류: {str(ve)}")
    
    except genai.types.generation_types.BlockedPromptException as bpe:
         logger.error(f"프롬프트 차단 : {bpe}")
         raise HTTPException(status_code=400, detail="문항 생성 요청이 안전 정책에 의해 차단되었습니다.")
    
    except HTTPException as http_exc:
         raise http_exc
    
    except Exception as e:
        error_detail = traceback.format_exc()
        logger.error(f"문항 생성 중 오류 발생 : {str(e)}\n{error_detail}")
        raise HTTPException(status_code=500, detail=f"문항 생성 중 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요: {str(e)}")



        # quoted_paragraph = response_json.get("quoted_paragraph", "")
        # quoted_sentence = response_json.get("quoted_sentence", [])
        # quoted_word = response_json.get("quoted_word", [])


        
        # if request.question_subpassage_example and request.question_subpassage_example.strip():
        #     if (quoted_paragraph=="") and (quoted_sentence == []) and (quoted_word == []):
        #         return MultiplePassageQuestionResponse(
        #             kind_passage="복합 지문",
        #             generated_question=response_json.get("generated_question", "문제문 생성 실패"),
        #             generated_subpassage=response_json.get("generated_subpassage", "보기 지문 생성 실패"),
        #             generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
        #             generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
        #             generated_description=response_json.get("generated_description", "해설 생성 실패")
        #         )
        #     elif (quoted_paragraph!="") and (quoted_sentence == []) and (quoted_word == []):
        #         return MultiplePassageQuestionResponse(
        #             kind_passage="복합 지문",
        #             generated_question=response_json.get("generated_question", "문제문 생성 실패"),
        #             generated_subpassage=response_json.get("generated_subpassage", "보기 지문 생성 실패"),
        #             generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
        #             generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
        #             generated_description=response_json.get("generated_description", "해설 생성 실패"),
        #             quoted_paragraph=quoted_paragraph
        #         )
        #     elif (quoted_paragraph!="") and (quoted_sentence != []) and (quoted_word != []):
        #         return MultiplePassageQuestionResponse(
        #             kind_passage="복합 지문",
        #             generated_question=response_json.get("generated_question", "문제문 생성 실패"),
        #             generated_subpassage=response_json.get("generated_subpassage", "보기 지문 생성 실패"),
        #             generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
        #             generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
        #             generated_description=response_json.get("generated_description", "해설 생성 실패"),
        #             quoted_paragraph=quoted_paragraph,
        #             quoted_sentence=quoted_sentence,
        #             quoted_word=quoted_word
        #         )
        #     elif (quoted_paragraph=="") and (quoted_sentence != []) and (quoted_word != []):
        #         return MultiplePassageQuestionResponse(
        #             kind_passage="복합 지문",
        #             generated_question=response_json.get("generated_question", "문제문 생성 실패"),
        #             generated_subpassage=response_json.get("generated_subpassage", "보기 지문 생성 실패"),
        #             generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
        #             generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
        #             generated_description=response_json.get("generated_description", "해설 생성 실패"),
        #             quoted_sentence=quoted_sentence,
        #             quoted_word=quoted_word
        #         )
        # else:
        #     if (quoted_paragraph=="") and (quoted_sentence == []) and (quoted_word == []):
        #         return MultiplePassageQuestionResponse(
        #             kind_passage="복합 지문",
        #             generated_question=response_json.get("generated_question", "문제문 생성 실패"),
        #             generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
        #             generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
        #             generated_description=response_json.get("generated_description", "해설 생성 실패")
        #         )
        #     elif (quoted_paragraph!="") and (quoted_sentence == []) and (quoted_word == []):
        #         return MultiplePassageQuestionResponse(
        #             kind_passage="복합 지문",
        #             generated_question=response_json.get("generated_question", "문제문 생성 실패"),
        #             generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
        #             generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
        #             generated_description=response_json.get("generated_description", "해설 생성 실패"),
        #             quoted_paragraph=quoted_paragraph
        #         )
        #     elif (quoted_paragraph!="") and (quoted_sentence != []) and (quoted_word != []):
        #         return MultiplePassageQuestionResponse(
        #             kind_passage="복합 지문",
        #             generated_question=response_json.get("generated_question", "문제문 생성 실패"),
        #             generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
        #             generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
        #             generated_description=response_json.get("generated_description", "해설 생성 실패"),
        #             quoted_paragraph=quoted_paragraph,
        #             quoted_sentence=quoted_sentence,
        #             quoted_word=quoted_word
        #         )
        #     elif (quoted_paragraph=="") and (quoted_sentence != []) and (quoted_word != []):
        #         return MultiplePassageQuestionResponse(
        #             kind_passage="복합 지문",
        #             generated_question=response_json.get("generated_question", "문제문 생성 실패"),
        #             generated_option=response_json.get("generated_option", ["선지 생성 실패"] * 5),
        #             generated_answer=response_json.get("generated_answer", "정답 생성 실패"),
        #             generated_description=response_json.get("generated_description", "해설 생성 실패"),
        #             quoted_sentence=quoted_sentence,
        #             quoted_word=quoted_word
        #         )

    # except ValueError as ve:
    #      logger.error(f"입력값 오류 : {str(ve)}")
    #      raise HTTPException(status_code=400, detail=f"입력값 오류: {str(ve)}")
    
    # except genai.types.generation_types.BlockedPromptException as bpe:
    #      logger.error(f"프롬프트 차단 : {bpe}")
    #      raise HTTPException(status_code=400, detail="지문 생성 요청이 안전 정책에 의해 차단되었습니다.")
    
    # except HTTPException as http_exc:
    #      raise http_exc
    
    # except Exception as e:
    #     error_detail = traceback.format_exc()
    #     logger.error(f"문항 생성 중 오류 발생 : {str(e)}\n{error_detail}")
    #     raise HTTPException(status_code=500, detail=f"지문 생성 중 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요: {str(e)}")