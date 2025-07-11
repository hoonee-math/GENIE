from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


# ✅ 지문 분야 Enum 정의
class PassageType(str, Enum):
    인문 = "인문"
    예술 = "예술"
    사회 = "사회"
    과학 = "과학"
    기술 = "기술"

# ✅ 지문 구조 Enum 정의
class PassageStructure(str, Enum):
    설명과분석 = "설명과 분석"
    비교와대조 = "비교와 대조"
    문제와해결 = "문제와 해결"
    흐름과과정 = "흐름과 과정"

# ✅ 단일 지문 요청
class SinglePassageRequest(BaseModel):
    type_passage: PassageType = Field(..., description="지문의 분야", example="인문/예술/사회/과학/기술")
    keyword: str = Field(..., description="지문에 포함할 제재 키워드 목록", example="인공지능, 머신러닝, 딥러닝")
    type_structure: Optional[PassageStructure] = Field(None, description="지문의 구조 (선택 사항)", example="설명과 분석/비교와 대조/문제와 해결/흐름과 과정")
    requirement: Optional[str] = Field(None, description="추가 요청 사항 (선택 사항)", example="고3 수준으로 작성해주세요.")

# ✅ 단일 지문 응답
class SinglePassageResponse(BaseModel):
    generated_passage: str = Field(..., description="생성된 지문")
    generated_core_point: List[str] = Field(..., description="지문의 핵심 논점")

# ✅ 독서 지문 요청
class ReadingPassageRequest(BaseModel):
    keyword: str = Field(..., description="지문에 포함할 제재 키워드 목록", example="독서, 공감적 읽기, 가을")
    requirement: Optional[str] = Field(None, description="추가 요청 사항 (선택 사항)", example="고3 수준으로 작성해주세요.")

# ✅ 독서 지문 응답
class ReadingPassageResponse(BaseModel):
    generated_passage: str = Field(..., description="생성된 지문")
    generated_core_point: List[str] = Field(..., description="지문의 핵심 논점")

# ✅ 복합 지문 요청
class MultiplePassageRequest(BaseModel):
    first_type_passage: PassageType = Field(..., description="(가) 지문의 분야", example="인문/예술/사회/과학/기술")
    first_keyword: str = Field(..., description="(가) 지문 키워드 목록", example="계층, 평등")
    second_type_passage: PassageType = Field(..., description="(나) 지문의 분야", example="인문/예술/사회/과학/기술")
    second_keyword: str = Field(..., description="(나) 지문 키워드 목록", example="시장, 자본주의")
    first_requirement: Optional[str] = Field(None, description="(가) 추가 요청 사항 (선택 사항)", example="비판적인 시각 강조")
    second_requirement: Optional[str] = Field(None, description="(나) 추가 요청 사항 (선택 사항)", example="객관적 서술")

# ✅ 복합 지문 응답
class MultiplePassageResponse(BaseModel):
    generated_passage: str = Field(..., description="생성된 지문")
    generated_core_point: List[str] = Field(..., description="(가) 지문의 핵심 논점과 (나) 지문 핵심 논점")