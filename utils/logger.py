import logging
import os
from datetime import datetime, timedelta
from logging.handlers import TimedRotatingFileHandler
import threading
import time

class CostTracker:
    _instance = None
    _total_cost = 0.0

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CostTracker, cls).__new__(cls)
        return cls._instance

    @property
    def total_cost(self):
        return self._total_cost

    @total_cost.setter
    def total_cost(self, value):
        self._total_cost = value

    def add_cost(self, cost):
        self._total_cost += cost

cost_tracker = CostTracker()

def setup_logger():
    logger = logging.getLogger('Gemini_API') 
    logger.setLevel(logging.DEBUG)

    if not logger.handlers:
        log_dir = 'logs'
        os.makedirs(log_dir, exist_ok=True)
        
        log_filename = os.path.join(log_dir, 'Gemini_API.log')

        # 로그 파일 하루마다 회전하고, 삭제 없이 계속 보관하게 합니다
        file_handler = TimedRotatingFileHandler(
            filename=log_filename,
            when='midnight',      # 매일 자정 새 파일 회전
            interval=1,           # 하루 단위
            backupCount=0,        # 0 = 삭제 X, 1 = 하루 단위 삭제, 2 = 이틀 단위 삭제
            encoding='utf-8',
            utc=False
        )

        file_handler.setLevel(logging.DEBUG)

        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)

        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger

logger = setup_logger()

def calculate_gemini_cost(model_name: str, prompt_tokens: int, total_tokens: int) -> float:
    response_tokens = total_tokens - prompt_tokens
    prompt_million = prompt_tokens / 1_000_000
    response_million = response_tokens / 1_000_000

    if model_name == "gemini-2.5-pro-preview-06-05":
        if prompt_tokens <= 200_000:
            prompt_cost_per_million = 1.25
            response_cost_per_million = 10.00
        else:
            prompt_cost_per_million = 2.50
            response_cost_per_million = 15.00

    elif model_name == "gemini-2.5-flash-preview-05-20":
        prompt_cost_per_million = 0.15
        response_cost_per_million = 0.6
    else:
        raise ValueError(f"지원하지 않는 모델입니다: {model_name}")

    total_cost = (prompt_million * prompt_cost_per_million) + (response_million * response_cost_per_million)
    return total_cost

def log_api_call_cost(model_name: str, usage_metadata: dict) -> None:
    prompt_tokens = usage_metadata.get("prompt_token_count", 0)
    total_tokens = usage_metadata.get("total_token_count", 0)

    cost = calculate_gemini_cost(model_name, prompt_tokens, total_tokens)
    cost_tracker.add_cost(cost)

    logger.info(f"모델 : {model_name}")
    logger.info(f"입력 토큰 : {prompt_tokens}개")
    logger.info(f"출력 토큰 : {total_tokens - prompt_tokens}개")
    logger.info(f"전체 토큰 수 : {total_tokens}개")
    logger.info(f"비용: ${cost:.6f}")
    logger.info(f"[누적 비용] : ${cost_tracker.total_cost:.6f}")

# 자정마다 더미 로그 함수 및 스케줄러 추가
def schedule_dummy_log():
    now = datetime.now()
    # 다음 자정 계산
    next_midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=1, microsecond=0)
    delay = (next_midnight - now).total_seconds()

    def log_and_reschedule():
        logger.info('[DUMMY] 자정 더미 로그 - 로그 파일 회전 보장')
        schedule_dummy_log()

    timer = threading.Timer(delay, log_and_reschedule)
    timer.daemon = True 
    timer.start()

# 스크립트 import 시 바로 스케줄 시작
schedule_dummy_log()