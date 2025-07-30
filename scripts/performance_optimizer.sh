#!/bin/bash

# 🚀 Kakao AI 시스템 성능 최적화 스크립트
# 이 스크립트는 시스템 성능을 최적화하고 응답 속도를 개선합니다.

echo "🔧 Kakao AI 시스템 성능 최적화 시작..."
echo "=================================================="

# 1. 불필요한 프로세스 정리
echo "📦 불필요한 프로세스 정리 중..."
pkill -f "python.*server.py" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
pkill -f "fork-ts-checker" 2>/dev/null

# 2. 캐시 정리
echo "🗑️ 캐시 정리 중..."
rm -rf node_modules/.cache 2>/dev/null
rm -rf .next 2>/dev/null
rm -rf dist 2>/dev/null
rm -rf build 2>/dev/null
rm -rf __pycache__ 2>/dev/null
rm -rf backend/__pycache__ 2>/dev/null
find . -name "*.pyc" -delete 2>/dev/null

# 3. 포트 확인 및 정리
echo "🔍 포트 상태 확인 중..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8001 | xargs kill -9 2>/dev/null
lsof -ti:8002 | xargs kill -9 2>/dev/null
lsof -ti:8003 | xargs kill -9 2>/dev/null
lsof -ti:8004 | xargs kill -9 2>/dev/null
lsof -ti:8005 | xargs kill -9 2>/dev/null

# 4. 시스템 리소스 확인
echo "💻 시스템 리소스 확인 중..."
echo "메모리 사용량:"
free -h 2>/dev/null || vm_stat 2>/dev/null || echo "메모리 정보를 확인할 수 없습니다."

echo "디스크 사용량:"
df -h . 2>/dev/null

echo "CPU 사용률:"
top -l 1 | head -10 2>/dev/null || top -bn1 | head -10 2>/dev/null || echo "CPU 정보를 확인할 수 없습니다."

# 5. Python 가상환경 최적화
echo "🐍 Python 환경 최적화 중..."
if [ -d ".venv" ]; then
    echo "가상환경이 존재합니다."
    source .venv/bin/activate
    pip install --upgrade pip
    pip install --upgrade setuptools wheel
else
    echo "가상환경이 없습니다. 생성 중..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    pip install fastapi uvicorn openai aiohttp beautifulsoup4
fi

# 6. Node.js 의존성 최적화
echo "📦 Node.js 의존성 최적화 중..."
if [ -f "package.json" ]; then
    npm cache clean --force
    npm install --production=false
    npm audit fix
else
    echo "package.json을 찾을 수 없습니다."
fi

# 7. 데이터베이스 최적화
echo "🗄️ 데이터베이스 최적화 중..."
if [ -f "chat_system.db" ]; then
    echo "SQLite 데이터베이스 최적화 중..."
    sqlite3 chat_system.db "VACUUM;" 2>/dev/null || echo "SQLite 최적화를 건너뜁니다."
fi

# 8. 로그 파일 정리
echo "📝 로그 파일 정리 중..."
find . -name "*.log" -size +10M -delete 2>/dev/null
find . -name "*.tmp" -delete 2>/dev/null

# 9. 성능 모니터링 설정
echo "📊 성능 모니터링 설정 중..."
cat > performance_monitor.py << 'EOF'
#!/usr/bin/env python3
import psutil
import time
import json
from datetime import datetime

def get_system_stats():
    return {
        "timestamp": datetime.now().isoformat(),
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent,
        "network_io": psutil.net_io_counters()._asdict()
    }

def monitor_performance(duration=60):
    print(f"🔍 {duration}초 동안 성능 모니터링 시작...")
    stats = []
    
    for i in range(duration):
        stats.append(get_system_stats())
        time.sleep(1)
        if i % 10 == 0:
            print(f"진행률: {i}/{duration}초")
    
    # 평균 계산
    avg_cpu = sum(s["cpu_percent"] for s in stats) / len(stats)
    avg_memory = sum(s["memory_percent"] for s in stats) / len(stats)
    
    print(f"📊 성능 통계:")
    print(f"  평균 CPU 사용률: {avg_cpu:.1f}%")
    print(f"  평균 메모리 사용률: {avg_memory:.1f}%")
    
    return stats

if __name__ == "__main__":
    try:
        monitor_performance(30)
    except KeyboardInterrupt:
        print("\n⏹️ 모니터링 중단됨")
EOF

# 10. 최적화 완료
echo "✅ 성능 최적화 완료!"
echo "=================================================="
echo "🎯 다음 단계:"
echo "1. 백엔드 서버 시작: cd backend && source ../.venv/bin/activate && python advanced_api_server.py &"
echo "2. 프론트엔드 서버 시작: npm start"
echo "3. 성능 모니터링: python performance_monitor.py"
echo "4. 웹 브라우저에서 http://localhost:3000 접속"
echo "=================================================="

# 11. 권장사항 출력
echo "💡 성능 최적화 권장사항:"
echo "- 정기적으로 캐시를 정리하세요 (주 1회)"
echo "- 로그 파일을 정기적으로 관리하세요"
echo "- 시스템 리소스를 모니터링하세요"
echo "- 불필요한 프로세스를 정리하세요"
echo "- 데이터베이스를 정기적으로 최적화하세요"

echo "🚀 최적화가 완료되었습니다!" 