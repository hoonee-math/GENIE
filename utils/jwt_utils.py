# from jose import jwt
# import os
# from fastapi import Request
# from utils.logger import user_id_var

# # .env 파일에서 JWT 설정 가져오기
# # .env 파일 예시:
# # JWT_SECRET_KEY=your_secret_key_here
# # JWT_ALGORITHM=HS256
# JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
# JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")

# def extract_user_id_from_token(token: str) -> str:
#     """
#     JWT 토큰에서 사용자 ID를 추출합니다.
    
#     Args:
#         token (str): 요청에서 추출한 JWT 토큰
    
#     Returns:
#         str: 사용자 ID 또는 토큰이 유효하지 않은 경우 'unknown'
#     """
#     try:
#         # 토큰 디코딩 (검증 포함)
#         payload = jwt.decode(
#             token, 
#             JWT_SECRET_KEY, 
#             algorithms=[JWT_ALGORITHM]
#         )
        
#         # 사용자 ID 필드 - SpringBoot JWT 구현에 따라 달라질 수 있음
#         # 일반적으로 'sub', 'id', 'userId' 등의 필드에 사용자 ID가 저장됩니다
#         user_id = payload.get("sub") or payload.get("id") or payload.get("userId")
        
#         return user_id if user_id else "unknown"
#     except Exception:
#         # 토큰 검증 실패
#         return "unknown"

# def set_user_id_in_context(request: Request):
#     """
#     요청 헤더에서 JWT 토큰을 추출하고 사용자 ID를 컨텍스트에 설정합니다.
    
#     Args:
#         request (Request): FastAPI 요청 객체
#     """
#     # Authorization 헤더에서 토큰 추출
#     auth_header = request.headers.get("Authorization", "")
    
#     if auth_header and auth_header.startswith("Bearer "):
#         token = auth_header.replace("Bearer ", "")
#         user_id = extract_user_id_from_token(token)
#     else:
#         user_id = "anonymous"
    
#     # 컨텍스트 변수에 사용자 ID 설정
#     user_id_var.set(user_id)