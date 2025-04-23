# schemas/question.py
from pydantic import BaseModel
from typing import List

class QuestionRequest(BaseModel):
    custom_passage: str # 사용자 입력 지문 Or 생성 지문을 사용자가 편집한 지문
    type_question: str # 문항 유형
    question_example: str # 문항 예시

class QuestionResponse(BaseModel):
    type_passage: str # 분야
    keyword: List[str] # 제재
    generated_core_point: str # 핵심 논점
    generated_question: str # 질문
    generated_option: List[str] # 선지
    generated_answer: str # 정답
    generated_description: str # 해설