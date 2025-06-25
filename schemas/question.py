# schemas/question.py
from pydantic import BaseModel
from typing import List, Optional

class QuestionRequest(BaseModel):
    custom_passage: str # 사용자 입력 지문 Or 생성 지문을 사용자가 편집한 지문
    type_question: str # 문항 유형
    question_format: str # 문항 형식
    question_statement_example : str # 문항 문제문 예시
    question_subpassage_example : Optional[str] = None # 문항 보기 지문 예시
    question_choice_example : str # 문항 선지 예시

## 중간 유통 과정 스키마 정리
## ---------------------------------------------------------
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

class SinglePassageQuestionResponse(BaseModel):
    type_passage: str # 분야
    keyword: List[str] # 제재
    generated_core_point: str # 핵심 논점
    generated_question: str # 문제문
    generated_option: List[str] # 선지
    generated_answer: str # 정답
    generated_description: str # 해설
    generated_subpassage: Optional[str] = None # 보기
    passage_quotation: Optional[List[str]] = None # 인용문구가 있는 문장

class MultiplePassageQuestionResponse(BaseModel):
    first_passage_type: str # (가) 분야
    first_passage_keyword: List[str] # (가) 제재
    second_passage_type: str # (나) 분야
    second_passage_keyword: List[str] # (나) 제재
    first_passage_generated_core_point: str # 핵심 논점
    second_passage_generated_core_point: str # 핵심 논점
    generated_question: str # 문제문
    generated_option: List[str] # 선지
    generated_answer: str # 정답
    generated_description: str # 해설
    generated_subpassage: Optional[str] = None # 보기
    passage_quotation: Optional[List[str]] = None # 인용문구가 있는 문장