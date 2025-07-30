#!/bin/bash

echo "🛑 카카오톡 AI 분석 시스템 - 고도화 버전 종료"
echo "=================================================="

# PID 파일에서 프로세스 종료
if [ -f .advanced_system_pids ]; then
    echo "[STEP] 저장된 프로세스 종료 중..."
    PIDS=$(cat .advanced_system_pids)
    for pid in $PIDS; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "[INFO] 프로세스 $pid 종료 중..."
            kill -TERM $pid 2>/dev/null || true
            sleep 1
            if ps -p $pid > /dev/null 2>&1; then
                echo "[WARNING] 프로세스 $pid 강제 종료 중..."
                kill -KILL $pid 2>/dev/null || true
            fi
        fi
    done
    rm -f .advanced_system_pids
    echo "[SUCCESS] 저장된 프로세스 종료 완료"
fi

# 포트별 프로세스 종료
echo "[STEP] 포트별 프로세스 종료 중..."
for port in 3000 8001 8007 8008 8009 8010 8011 8012 8013; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "[INFO] 포트 $port 프로세스 종료 중..."
        lsof -ti:$port | xargs kill -TERM 2>/dev/null || true
        sleep 1
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            echo "[WARNING] 포트 $port 프로세스 강제 종료 중..."
            lsof -ti:$port | xargs kill -KILL 2>/dev/null || true
        fi
    fi
done

# Node.js 프로세스 종료
echo "[STEP] Node.js 프로세스 종료 중..."
pkill -f "node.*react-scripts" 2>/dev/null || true
pkill -f "node.*start.js" 2>/dev/null || true

# Python 프로세스 종료
echo "[STEP] Python 프로세스 종료 중..."
pkill -f "python3.*main_server.py" 2>/dev/null || true
pkill -f "python3.*advanced_ai_engine.py" 2>/dev/null || true
pkill -f "python3.*ai_message_recommender.py" 2>/dev/null || true
pkill -f "python3.*data_visualization_server.py" 2>/dev/null || true
pkill -f "python3.*ai_conversation_insights.py" 2>/dev/null || true
pkill -f "python3.*realtime_conversation_monitor.py" 2>/dev/null || true
pkill -f "python3.*ai_conversation_optimizer.py" 2>/dev/null || true
pkill -f "python3.*ai_conversation_pattern_analyzer.py" 2>/dev/null || true

# 포트 상태 확인
echo "[STEP] 포트 상태 확인 중..."
sleep 2

for port in 3000 8001 8007 8008 8009 8010 8011 8012 8013; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "   ❌ 포트 $port: 여전히 사용 중"
    else
        echo "   ✅ 포트 $port: 해제됨"
    fi
done

echo ""
echo "🎉 카카오톡 AI 분석 시스템 - 고도화 버전 종료 완료!"
echo "=================================================="
echo ""
echo "📋 정리된 항목:"
echo "   🏠 메인 서버 (포트 8001)"
echo "   🧠 고급 AI 엔진 (포트 8013)"
echo "   💬 AI 메시지 추천 (포트 8007)"
echo "   📊 데이터 시각화 (포트 8008)"
echo "   🔍 AI 대화 인사이트 (포트 8009)"
echo "   👁️ 실시간 대화 모니터 (포트 8010)"
echo "   ⚡ AI 대화 최적화 (포트 8011)"
echo "   📈 AI 패턴 분석 (포트 8012)"
echo "   🌐 프론트엔드 (포트 3000)"
echo ""
echo "📁 로그 파일은 logs/ 디렉토리에 보관됩니다."
echo "🚀 시스템을 다시 시작하려면: ./start_advanced_system.sh"
echo ""
echo "👋 시스템이 안전하게 종료되었습니다!" 