from pydantic import BaseModel
from typing import List, Optional

class SinglePassageRequest(BaseModel):
    type_passage: str # 분야
    keyword: List[str] # 제재
    type_structure : Optional[str] = None # 지문 구조 (선택 사항)
    requirement : Optional[str] = None # 추가 요청 사항 (선택 사항)

class SinglePassageResponse(BaseModel):
    generated_passage: str # 생성 지문
    generated_core_point: str # 핵심 논점


class ReadingPassageRequest(BaseModel):
    keyword: List[str] # 제재
    requirement : Optional[str] = None # 추가 요청 사항 (선택 사항)

class ReadingPassageResponse(BaseModel):
    generated_passage: str # 생성 지문
    generated_core_point: str # 핵심 논점


class MultiplePassageRequest(BaseModel):
    first_type_passage: str # (가) 분야
    first_keyword: List[str] # (가) 제재
    second_type_passage: str # (나) 분야
    second_keyword: List[str] # (나) 제재
    first_requirement : Optional[str] = None # (가) 추가 요청 사항 (선택 사항)
    second_requirement : Optional[str] = None # (나) 추가 요청 사항 (선택 사항)

class MultiplePassageResponse(BaseModel):
    generated_passage: str # 생성 지문
    generated_core_point: str # 핵심 논점