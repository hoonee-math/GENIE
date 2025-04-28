import logging
import os
from datetime import datetime, timedelta
from logging.handlers import TimedRotatingFileHandler
import threading
import time

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