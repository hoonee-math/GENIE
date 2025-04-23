from pydantic import BaseModel
from typing import List

class PassageRequest(BaseModel):
    type_passage: str # 분야
    keyword: List[str] # 제재

class PassageResponse(BaseModel):
    generated_passage: str # 생성 지문
    generated_core_point: str # 핵심 논점