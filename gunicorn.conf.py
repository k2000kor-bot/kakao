# Gunicorn 설정 파일
import multiprocessing

# 서버 소켓
bind = "0.0.0.0:8080"
backlog = 2048

# 워커 프로세스
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# 재시작 설정
max_requests = 1000
max_requests_jitter = 50
preload_app = True

# 로깅
accesslog = "logs/access.log"
errorlog = "logs/error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# 프로세스 이름
proc_name = "corbu_ai"

# 보안
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# 성능 튜닝
worker_tmp_dir = "/dev/shm"
tmp_upload_dir = None

# 개발/디버깅 (프로덕션에서는 False)
reload = False
spew = False

# 사용자/그룹 설정 (필요시)
# user = "corbu"
# group = "corbu"

# PID 파일
pidfile = "logs/corbu_ai.pid"

# 데몬화 (백그라운드 실행)
daemon = False

print("📋 Gunicorn 설정이 로드되었습니다")
print(f"👥 워커 프로세스: {workers}개")
print(f"🌐 바인드 주소: {bind}")
print(f"📝 로그 레벨: {loglevel}")
