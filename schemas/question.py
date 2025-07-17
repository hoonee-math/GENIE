# schemas/question.py
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


# ✅ 문항 분야 Enum 정의
class QuestionType(str, Enum):
    사실적읽기 = "사실적 읽기"
    추론적읽기 = "추론적 읽기"
    비판적읽기 = "비판적 읽기"
    어휘및문법 = "어휘 및 문법"


# ✅ 지문 분석 요청
class PassageDataRequest(BaseModel):
    kind_passage: str = Field(..., description="사용자가 입력한 지문의 유형 : 독서론/단일 지문/복합 지문")
    custom_passage: str = Field(..., description="사용자가 입력하거나 편집한 지문")
    ## 여기서부터 추가
    type_question: QuestionType = Field(..., description="문항 유형", example="사실적 읽기/추론적 읽기/비판적 읽기/어휘 및 문법")
    question_format: str = Field(..., description="문제문 형식", example="글에서 알 수 있는 'OOO'의 생각으로 적절한 것은?")
    question_statement_example: str = Field(..., description="문제문 예시", example="윗글에서 베카리아의 관점으로 보기 어려운 것은?")
    question_subpassage_example: Optional[str] = Field(None, description="문항 보기 지문 예시 (선택사항)", example="선택 사항입니다. 없을 시 제거해주세요.")
    question_choice_example: str = Field(..., description="문항 선지 예시")


# ✅ 문항 요청
class QuestionRequest(BaseModel):
    custom_passage: str = Field(..., description="사용자가 입력하거나 편집한 지문")
    type_question: QuestionType = Field(..., description="문항 유형", example="사실적 읽기/추론적 읽기/비판적 읽기/어휘 및 문법")
    question_format: str = Field(..., description="문제문 형식", example="글에서 알 수 있는 'OOO'의 생각으로 적절한 것은?")
    question_statement_example: str = Field(..., description="문제문 예시", example="윗글에서 베카리아의 관점으로 보기 어려운 것은?")
    question_subpassage_example: Optional[str] = Field(None, description="문항 보기 지문 예시 (선택사항)", example="선택 사항입니다. 없을 시 제거해주세요.")
    question_choice_example: str = Field(..., description="문항 선지 예시")

## 중간 유통 과정 스키마 정리
## ---------------------------------------------------------
class ReadingPassageInfo(BaseModel):
    keyword: str # 제재

class SinglePassageInfo(BaseModel):
    type_passage: str # 분야
    keyword: str # 제재

class MultiplePassageInfo(BaseModel):
    first_passage_type: str # (가) 분야
    first_passage_keyword: str # (가) 제재
    second_passage_type: str # (나) 분야
    second_passage_keyword: str # (나) 제재

# class QuestionInfo(BaseModel):
#     generated_question: str # 문제문
#     generated_subpassage: Optional[str] # 보기
#     generated_option: List[str] # 선지 5개
#     generated_answer: str # 정답
#     generated_description: str # 해설
#     passage_quotation: Optional[str] # 인용문구가 있는 문장
## ---------------------------------------------------------


# 📗 passage_analysis_for_question.py : 사용자가 입력한 지문에 대해 지문을 분석할 수 있도록 한다.
# ✅ 독서론 지문 분석 응답
class ReadingPassageDataResponse(BaseModel):
    kind_passage: str = Field(..., description="독서론")
    keyword: str = Field(..., description="지문 제재 키워드", example="독서, 공감적 읽기")
    generated_core_point: List[str] = Field(..., description="생성된 핵심 논점")


# ✅ 단일 지문 분석 응답
class SinglePassageDataResponse(BaseModel):
    kind_passage: str = Field(..., description="단일 지문")
    type_passage: str = Field(..., description="지문의 분야")
    keyword: str = Field(..., description="지문 제재 키워드", example="경제 사회, 민주주의")
    generated_core_point: List[str] = Field(..., description="생성된 핵심 논점")


# ✅ 복합 지문 분석 응답
class MultiplePassageDataResponse(BaseModel):
    kind_passage: str = Field(..., description="복합 지문")
    first_passage_type: str = Field(..., description="(가) 지문 분야", example="기술")
    first_passage_keyword: str = Field(..., description="(가) 지문 키워드")
    second_passage_type: str = Field(..., description="(나) 지문 분야")
    second_passage_keyword: str = Field(..., description="(나) 지문 키워드")
    generated_core_point: List[str] = Field(..., description="(가) 지문 핵심 논점과 (나) 지문 핵심 논점")

    

# 📘 reading_passage_question_service.py : 독서론 지문에 따른 문항을 생성할 수 있도록 한다.
# ✅ 독서 지문 기반 문항 응답
class ReadingPassageQuestionResponse(BaseModel):
    kind_passage: str = Field(..., description="독서론")
    generated_question: str = Field(..., description="생성된 문제문")
    generated_option: List[str] = Field(..., description="생성된 선지 목록")
    generated_answer: str = Field(..., description="정답")
    generated_description: List[str] = Field(..., description="정답해설 + 오답피하기")
    generated_subpassage: Optional[str] = Field(None, description="문항 보기 지문 (선택 사항)")
    quoted_paragraph: Optional[str] = Field(None, description="인용 문단 (선택 사항)")
    quoted_sentence: Optional[List[str]] = Field(None, description="인용 문장이 포함된 문장 목록 (선택 사항)")
    quoted_word: Optional[List[str]] = Field(None, description="인용 문구 목록 (선택 사항)")


# 📘single_passage_question_service.py : 단일 지문에 따른 문항을 생성할 수 있도록 한다.
# ✅ 단일 지문 기반 문항 응답
class SinglePassageQuestionResponse(BaseModel):
    kind_passage: str = Field(..., description="단일 지문")
    generated_question: str = Field(..., description="생성된 문제문")
    generated_option: List[str] = Field(..., description="생성된 선지 목록")
    generated_answer: str = Field(..., description="정답")
    generated_description: List[str] = Field(..., description="정답해설 + 오답피하기")
    generated_subpassage: Optional[str] = Field(None, description="문항 보기 지문 (선택 사항)")
    quoted_paragraph: Optional[str] = Field(None, description="인용 문단 (선택 사항)")
    quoted_sentence: Optional[List[str]] = Field(None, description="인용 문장이 포함된 문장 목록 (선택 사항)")
    quoted_word: Optional[List[str]] = Field(None, description="인용 문구 목록 (선택 사항)")


# 📘 multiple_passage_question_service.py : 단일 지문에 따른 문항을 생성할 수 있도록 한다.
# ✅ 복합 지문 기반 문항 응답
class MultiplePassageQuestionResponse(BaseModel):
    kind_passage: str = Field(..., description="복합 지문")
    generated_question: str = Field(..., description="생성된 문제문")
    generated_option: List[str] = Field(..., description="생성된 선지 목록")
    generated_answer: str = Field(..., description="정답")
    generated_description: List[str] = Field(..., description="정답해설 + 오답피하기")
    generated_subpassage: Optional[str] = Field(None, description="문항 보기 지문 (선택 사항)")
    quoted_paragraph: Optional[str] = Field(None, description="인용 문단 (선택 사항)")
    quoted_sentence: Optional[List[str]] = Field(None, description="인용 문장이 포함된 문장 목록 (선택 사항)")
    quoted_word: Optional[List[str]] = Field(None, description="인용 문구 목록 (선택 사항)")