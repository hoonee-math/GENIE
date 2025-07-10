from jose import jwt, JWTError  # JWT 토큰 처리 라이브러리
import os
from fastapi import Request, HTTPException, Depends, status, Request
from utils.logger import user_id_var  # contextvars로 만든 사용자 ID 저장용 변수
from dotenv import load_dotenv

load_dotenv(override=True)

# .env 파일에서 JWT 설정 가져오기
# .env 파일 예시:
# JWT_SECRET_KEY=your_secret_key_here
# JWT_ALGORITHM=HS256
# Spring Boot 백엔드와 동일한 비밀키와 알고리즘을 사용해야 함
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")  # JWT 비밀키 (.env 파일에서 로드)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")  # JWT 알고리즘 (기본값: HS256)

# 개발 환경에서 인증 비활성화 설정 (.env 파일에서 로드)
# .env에 DISABLE_AUTH=True 설정 시 인증 검사를 건너뛰고 개발 가능
DISABLE_AUTH = os.getenv("DISABLE_AUTH", "False").lower() == "true"  # 기본값: False (인증 활성화)

def extract_user_id_from_token(token: str) -> str:
    """
    JWT 토큰에서 사용자 ID를 추출합니다.
    
    Args:
        token (str): JWT 토큰
        
    Returns:
        str: 사용자 ID 또는 'anonymous' (토큰이 유효하지 않은 경우)
    """
    try:
        # JWT 토큰 디코딩 
        # (여기서는 예외가 발생해도 캐치해서 처리함 - 로깅 목적)
        payload = jwt.decode(
            token, 
            JWT_SECRET_KEY, 
            algorithms=[JWT_ALGORITHM]
        )
        
        # memEmail 필드에서 사용자 ID 추출 (Spring Boot에서 사용하는 필드명)
        user_id = payload.get("memEmail") 
        return user_id if user_id else "anonymous"
    except Exception:
        # 토큰이 유효하지 않거나 디코딩 실패 시 'anonymous' 반환
        # 로깅 목적이므로 예외를 발생시키지 않고 기본값 반환
        return "anonymous"

def set_user_id_in_context(request: Request):
    """
    요청 헤더에서 JWT 토큰을 추출하고 사용자 ID를 컨텍스트에 설정합니다.
    (로그 기록용 - 인증을 위한 것이 아님)
    
    개발 모드에서는 토큰이 없어도 'dev_user'로 설정합니다.
    
    Args:
        request (Request): FastAPI 요청 객체
    """
    # ======== 로깅 목적의 함수 ========
    # 1. main.py의 jwt_middleware에서 모든 요청마다 호출됨
    # 2. 성공/실패와 관계없이 항상 진행됨 (예외를 발생시키지 않음)
    
    # 인증 비활성화 모드에서는 무조건 개발용 사용자 ID 사용
    if DISABLE_AUTH:
        user_id = "dev_user"  # 개발용 사용자 ID
    else:
        # 일반 모드에서는 토큰에서 사용자 ID 추출
        # Authorization 헤더에서 토큰 추출
        auth_header = request.headers.get("Authorization", "")
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
            user_id = extract_user_id_from_token(token)  # 토큰에서 사용자 ID 추출
        else:
            user_id = "anonymous"  # 토큰이 없으면 'anonymous'로 설정
    
    # 컨텍스트 변수에 사용자 ID 설정 (이 값은 logger.py에서 사용됨)
    # contextvars는 비동기 컨텍스트에서 안전하게 데이터를 저장하는 방법
    user_id_var.set(user_id)


def get_token_from_header(authorization: str = None):
    """
    Authorization 헤더에서 JWT 토큰을 추출합니다.
    
    Args:
        authorization: Authorization 헤더 값
        
    Returns:
        str: JWT 토큰 문자열
        
    Raises:
        HTTPException: 헤더가 없거나 올바른 형식이 아닐 때
    """
    # ======== 인증 목적의 함수 ========
    # 1. 토큰이 없거나 형식이 잘못된 경우 HTTP 401 예외를 발생시킴
    # 2. 엔드포인트 함수가 실행되기 전에 검증
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization 헤더가 누락되었습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="잘못된 Authorization 헤더 형식입니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return authorization.replace("Bearer ", "")


async def get_current_user(authorization: str = Depends(lambda x: x.headers.get("Authorization"))):
    """
    JWT 토큰을 검증하고 사용자 ID를 반환합니다.
    
    이 함수는 FastAPI의 Depends를 통해 필요한 라우트에서 사용될 수 있습니다.
    
    Args:
        authorization: Authorization 헤더 값
        
    Returns:
        str: 사용자 ID
        
    Raises:
        HTTPException: JWT 토큰이 유효하지 않을 때
    """
    # ======== 인증 목적의 함수 ========
    # 1. 각 보호된 엔드포인트에서 Depends(get_current_user)로 호출됨
    # 2. 다음 단계로 진행하기 전에 인증이 유효한지 확인함
    # 3. 인증 실패 시 HTTP 401 예외를 발생시켜 요청을 중단함
    # 4. 인증 성공 시 사용자 ID를 반환하여 엔드포인트 함수에 전달함
    
    try:
        # 토큰 추출 (헤더 검증 포함)
        token = get_token_from_header(authorization)
        
        # 토큰 디코딩 및 검증
        # extract_user_id_from_token과 달리, 여기서는 예외를 캐치하지 않고 발생시킴 (인증 목적)
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )
        
        # 사용자 ID 추출
        user_id = payload.get("memEmail")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="사용자 ID를 찾을 수 없습니다",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    
    except JWTError:
        # JWT 검증 실패 시 401 오류 반환
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 인증 토큰입니다",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def conditional_get_current_user(request: Request) -> str:
    """
    개발 모드에서는 인증을 건너뛰고, 운영 모드에서는 실제 인증 수행
    """
    authorization = request.headers.get("Authorization")

    if DISABLE_AUTH:
        return "dev_user"
    
    return await get_current_user(authorization)