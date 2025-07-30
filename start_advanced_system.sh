#!/bin/bash

echo "🚀 카카오톡 AI 분석 시스템 - 고도화 버전 시작"
echo "=================================================="
echo "📍 프로젝트 루트: $(pwd)"
echo ""

# 로그 디렉토리 생성
echo "[STEP] 로그 디렉토리 생성 중..."
mkdir -p logs
echo "[SUCCESS] 로그 디렉토리 생성 완료"

# 의존성 확인
echo "[STEP] 의존성 확인 중..."
if command -v node &> /dev/null; then
    echo "[SUCCESS] Node.js 확인됨: $(node --version)"
else
    echo "[ERROR] Node.js가 설치되지 않았습니다."
    exit 1
fi

if command -v npm &> /dev/null; then
    echo "[SUCCESS] npm 확인됨: $(npm --version)"
else
    echo "[ERROR] npm이 설치되지 않았습니다."
    exit 1
fi

if command -v python3 &> /dev/null; then
    echo "[SUCCESS] Python 확인됨: $(python3 --version)"
else
    echo "[ERROR] Python3가 설치되지 않았습니다."
    exit 1
fi

if command -v pip3 &> /dev/null; then
    echo "[SUCCESS] pip3 확인됨"
else
    echo "[ERROR] pip3가 설치되지 않았습니다."
    exit 1
fi

# 포트 확인 및 정리
echo "[STEP] 포트 상태 확인 중..."
for port in 3000 8001 8002 8003 8004 8005 8006 8007 8008 8009 8010 8011 8012 8013; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "[WARNING] 포트 $port가 사용 중입니다. 프로세스를 종료합니다."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
done

# 백엔드 서버들 시작
echo "[STEP] 백엔드 서버들 시작 중..."

# 메인 서버
echo "[INFO] 메인 서버 시작 (포트 8001)..."
cd backend
python3 main_server.py > ../logs/main_server.log 2>&1 &
MAIN_PID=$!
echo "[SUCCESS] 메인 서버 시작됨 (PID: $MAIN_PID)"

# 고급 AI 엔진 서버
echo "[INFO] 고급 AI 엔진 서버 시작 (포트 8013)..."
python3 advanced_ai_engine.py > ../logs/advanced_ai_engine.log 2>&1 &
ADVANCED_AI_PID=$!
echo "[SUCCESS] 고급 AI 엔진 서버 시작됨 (PID: $ADVANCED_AI_PID)"

# AI 메시지 추천 서버
echo "[INFO] AI 메시지 추천 서버 시작 (포트 8007)..."
python3 ai_message_recommender.py > ../logs/ai_message_recommender.log 2>&1 &
RECOMMENDER_PID=$!
echo "[SUCCESS] AI 메시지 추천 서버 시작됨 (PID: $RECOMMENDER_PID)"

# 데이터 시각화 서버
echo "[INFO] 데이터 시각화 서버 시작 (포트 8008)..."
python3 data_visualization_server.py > ../logs/data_visualization.log 2>&1 &
VISUALIZATION_PID=$!
echo "[SUCCESS] 데이터 시각화 서버 시작됨 (PID: $VISUALIZATION_PID)"

# AI 대화 인사이트 서버
echo "[INFO] AI 대화 인사이트 서버 시작 (포트 8009)..."
python3 ai_conversation_insights.py > ../logs/ai_conversation_insights.log 2>&1 &
INSIGHTS_PID=$!
echo "[SUCCESS] AI 대화 인사이트 서버 시작됨 (PID: $INSIGHTS_PID)"

# 실시간 대화 모니터 서버
echo "[INFO] 실시간 대화 모니터 서버 시작 (포트 8010)..."
python3 realtime_conversation_monitor.py > ../logs/realtime_monitor.log 2>&1 &
MONITOR_PID=$!
echo "[SUCCESS] 실시간 대화 모니터 서버 시작됨 (PID: $MONITOR_PID)"

# AI 대화 최적화 서버
echo "[INFO] AI 대화 최적화 서버 시작 (포트 8011)..."
python3 ai_conversation_optimizer.py > ../logs/ai_conversation_optimizer.log 2>&1 &
OPTIMIZER_PID=$!
echo "[SUCCESS] AI 대화 최적화 서버 시작됨 (PID: $OPTIMIZER_PID)"

# AI 패턴 분석 서버
echo "[INFO] AI 패턴 분석 서버 시작 (포트 8012)..."
python3 ai_conversation_pattern_analyzer.py > ../logs/ai_pattern_analyzer.log 2>&1 &
PATTERN_PID=$!
echo "[SUCCESS] AI 패턴 분석 서버 시작됨 (PID: $PATTERN_PID)"

cd ..

# 프론트엔드 시작
echo "[STEP] 프론트엔드 시작 중..."
echo "[INFO] React 개발 서버 시작 (포트 3000)..."
npm start > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "[SUCCESS] 프론트엔드 시작됨 (PID: $FRONTEND_PID)"

# 서버 상태 확인
echo ""
echo "[STEP] 서버 상태 확인 중..."
sleep 3

echo ""
echo "🎉 카카오톡 AI 분석 시스템 - 고도화 버전 시작 완료!"
echo "=================================================="
echo ""
echo "📱 프론트엔드:"
echo "   🌐 메인 애플리케이션: http://localhost:3000"
echo ""
echo "🔧 백엔드 서버들:"
echo "   🏠 메인 서버: http://localhost:8001"
echo "   🧠 고급 AI 엔진: http://localhost:8013"
echo "   💬 AI 메시지 추천: http://localhost:8007"
echo "   📊 데이터 시각화: http://localhost:8008"
echo "   🔍 AI 대화 인사이트: http://localhost:8009"
echo "   👁️ 실시간 대화 모니터: http://localhost:8010"
echo "   ⚡ AI 대화 최적화: http://localhost:8011"
echo "   📈 AI 패턴 분석: http://localhost:8012"
echo ""
echo "📖 API 문서:"
echo "   📚 메인 API: http://localhost:8001/docs"
echo "   📚 고급 AI 엔진: http://localhost:8013/docs"
echo "   📚 AI 추천: http://localhost:8007/docs"
echo "   📚 데이터 시각화: http://localhost:8008/docs"
echo "   📚 AI 인사이트: http://localhost:8009/docs"
echo "   📚 실시간 모니터: http://localhost:8010/docs"
echo "   📚 AI 최적화: http://localhost:8011/docs"
echo "   📚 패턴 분석: http://localhost:8012/docs"
echo ""
echo "🆕 새로운 고도화 기능:"
echo "   🧠 실시간 AI 분석 - 선택된 메시지의 즉시 분석"
echo "   ⚙️ 고급 메시지 생성 - AI 기반 고급 메시지 생성 엔진"
echo "   📊 고급 분석 대시보드 - 종합적인 대화 분석 및 인사이트"
echo "   🎯 자동 추천 시스템 - 상황별 최적 응답 추천"
echo "   📈 패턴 학습 - 대화 패턴 학습 및 예측"
echo "   🔄 실시간 업데이트 - 실시간 데이터 업데이트"
echo ""
echo "💡 사용 팁:"
echo "   - '카카오톡 대화 대응'에서 파일을 업로드하세요"
echo "   - '실시간 AI 분석'에서 메시지를 선택하면 즉시 분석됩니다"
echo "   - '고급 메시지 생성'에서 다양한 설정으로 메시지를 생성하세요"
echo "   - '고급 분석 대시보드'에서 종합적인 분석 결과를 확인하세요"
echo ""
echo "🛑 시스템 종료: ./stop_advanced_system.sh"
echo "📋 로그 확인: logs/ 디렉토리"
echo ""
echo "🚀 시스템이 성공적으로 시작되었습니다!"
echo "브라우저에서 http://localhost:3000 을 열어 사용하세요."

# PID 저장
echo "$MAIN_PID $ADVANCED_AI_PID $RECOMMENDER_PID $VISUALIZATION_PID $INSIGHTS_PID $MONITOR_PID $OPTIMIZER_PID $PATTERN_PID $FRONTEND_PID" > .advanced_system_pids

# 백그라운드에서 실행 중인 프로세스 모니터링
echo ""
echo "[INFO] 시스템 모니터링 시작..."
while true; do
    sleep 30
    echo "[INFO] 시스템 상태 확인 중... ($(date))"
    
    # 각 서버 상태 확인
    for port in 3000 8001 8007 8008 8009 8010 8011 8012 8013; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            echo "   ✅ 포트 $port: 정상"
        else
            echo "   ❌ 포트 $port: 중단됨"
        fi
    done
    echo ""
done 