import logging
import os
from datetime import datetime, timedelta, timezone
from logging.handlers import TimedRotatingFileHandler
import threading
import time

class KSTFormatter(logging.Formatter):
    KST = timezone(timedelta(hours=9))  # 한국 시간대

    def converter(self, timestamp):
        # timestamp (float, epoch seconds)를 KST datetime으로 변환
        dt = datetime.fromtimestamp(timestamp, self.KST)
        return dt

    def formatTime(self, record, datefmt=None):
        dt = self.converter(record.created)
        if datefmt:
            return dt.strftime(datefmt)
        else:
            # 기본 포맷
            return dt.strftime("%Y-%m-%d %H:%M:%S")


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

    if logger.hasHandlers():
        logger.handlers.clear()

    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)
    log_filename = os.path.join(log_dir, 'Gemini_API.log')

    file_handler = TimedRotatingFileHandler(
        filename=log_filename,
        when='midnight',
        interval=1,
        backupCount=0,
        encoding='utf-8',
        utc=False,
        delay=True
    )
    file_handler.setLevel(logging.DEBUG)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    formatter = KSTFormatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

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

    if model_name == "gemini-2.5-pro":
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
    next_midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=100000)
    delay = (next_midnight - now).total_seconds()

    def log_and_reschedule():
        # ✅ 회전 강제 트리거 (안정성 보완용)
        for handler in logger.handlers:
            if isinstance(handler, TimedRotatingFileHandler):
                handler.doRollover()

        logger.info('[DUMMY] 자정 더미 로그 - 로그 파일 회전 보장')
        schedule_dummy_log()

    timer = threading.Timer(delay, log_and_reschedule)
    timer.daemon = True 
    timer.start()

# 스크립트 import 시 바로 스케줄 시작
schedule_dummy_log()