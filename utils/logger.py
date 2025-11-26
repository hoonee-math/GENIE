import logging
import os
from datetime import datetime, timedelta, timezone
from logging.handlers import TimedRotatingFileHandler
import threading
import time
import contextvars  # 비동기 환경에서 컨텍스트 변수를 안전하게 관리하는 라이브러리

# 사용자 ID를 저장할 컨텍스트 변수
# - 비동기 요청 간에 격리된 저장소 제공 (각 요청마다 독립적으로 값 유지)
# - main.py의 jwt_middleware에서 set_user_id_in_context 함수를 통해 설정됨
# - 기본값은 'anonymous'로 설정 (토큰이 없거나 유효하지 않은 경우)
user_id_var = contextvars.ContextVar('user_id', default='anonymous')

class KSTFormatter(logging.Formatter):
    """한국 시간대(KST)로 로그 메시지를 포맷팅하고 사용자 ID를 포함하는 포맷터"""
    
    KST = timezone(timedelta(hours=9))  # 한국 시간대

    def converter(self, timestamp):
        # timestamp (float, epoch seconds)를 KST datetime으로 변환
        dt = datetime.fromtimestamp(timestamp, self.KST)
        return dt

    def formatTime(self, record, datefmt=None):
        # 로그 시간을 KST로 포맷팅
        dt = self.converter(record.created)
        if datefmt:
            return dt.strftime(datefmt)
        else:
            # 기본 포맷
            return dt.strftime("%Y-%m-%d %H:%M:%S")
            
    def format(self, record):
        # ========== 로그에 사용자 ID 포함하는 핵심 부분 ==========
        # 1. contextvars에 저장된 현재 요청의 사용자 ID 가져오기
        # 2. jwt_utils.py의 set_user_id_in_context()에서 설정된 값을 사용
        # 3. 사용자 ID가 없으면 기본값인 'anonymous' 사용
        record.user_id = user_id_var.get()
        
        # 로그 형식에 %(user_id)s가 포함되어 있으면 여기서 설정한 값이 표시됨
        return super().format(record)


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

    # 사용자 ID가 포함된 로그 형식
    # 여기서 %(user_id)s는 KSTFormatter.format 메서드에서 설정된 record.user_id 값이 들어감
    user_formatter = KSTFormatter('%(asctime)s - [사용자: %(user_id)s] - %(name)s - %(levelname)s - %(message)s')
    
    # 시스템 이벤트용 로그 형식 (사용자 ID 제외)
    system_formatter = KSTFormatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    file_handler.setFormatter(user_formatter)
    console_handler.setFormatter(user_formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    # 원본 logger 객체에 시스템 로그 기능 추가
    logger.system_formatter = system_formatter
    logger.user_formatter = user_formatter
    logger.file_handler = file_handler
    logger.console_handler = console_handler
    
    # 시스템 이벤트를 로깅하기 위한 메서드 추가
    def system_log(level, msg, *args, **kwargs):
        # 임시로 포맷터 변경
        logger.file_handler.setFormatter(logger.system_formatter)
        logger.console_handler.setFormatter(logger.system_formatter)
        
        # 로그 기록
        if level == 'debug':
            logger.debug(msg, *args, **kwargs)
        elif level == 'info':
            logger.info(msg, *args, **kwargs)
        elif level == 'warning':
            logger.warning(msg, *args, **kwargs)
        elif level == 'error':
            logger.error(msg, *args, **kwargs)
        elif level == 'critical':
            logger.critical(msg, *args, **kwargs)
        
        # 포맷터 원복
        logger.file_handler.setFormatter(logger.user_formatter)
        logger.console_handler.setFormatter(logger.user_formatter)
    
    # 각 로그 레벨별 시스템 로그 메서드 추가
    logger.system_debug = lambda msg, *args, **kwargs: system_log('debug', msg, *args, **kwargs)
    logger.system_info = lambda msg, *args, **kwargs: system_log('info', msg, *args, **kwargs)
    logger.system_warning = lambda msg, *args, **kwargs: system_log('warning', msg, *args, **kwargs)
    logger.system_error = lambda msg, *args, **kwargs: system_log('error', msg, *args, **kwargs)
    logger.system_critical = lambda msg, *args, **kwargs: system_log('critical', msg, *args, **kwargs)

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

    elif model_name == "gemini-2.5-flash-preview-09-2025":
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
    logger.info(f"입/출력 토큰 : {prompt_tokens}/{total_tokens - prompt_tokens}")
    # logger.info(f"출력 토큰 : {total_tokens - prompt_tokens}개")
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