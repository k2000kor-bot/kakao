#!/bin/bash

# CORBU AI 전체 시스템 중지 스크립트

echo "🛑 CORBU AI 전체 시스템을 중지합니다..."

# PID 파일에서 프로세스 종료
pids=(
    "existing_system_pid"
    "community_pid"
    "construction_pid"
    "market_pid"
    "dream_pid"
    "performance_pid"
    "scalability_pid"
    "advanced_ai_pid"
    "planning_pid"
    "frontend_pid"
)

echo "📋 실행 중인 서비스들을 중지합니다..."

for pid_file in "${pids[@]}"; do
    if [ -f ".$pid_file" ]; then
        pid=$(cat ".$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "   중지 중: PID $pid"
            kill $pid 2>/dev/null
        fi
        rm ".$pid_file"
    fi
done

# 추가로 실행 중인 Python 프로세스들 중지
echo "🐍 Python 서버 프로세스들을 중지합니다..."
pkill -f "apartment_community_analyzer.py" 2>/dev/null
pkill -f "construction_company_info_system.py" 2>/dev/null
pkill -f "market_analysis_engine.py" 2>/dev/null
pkill -f "dream_visualization_system.py" 2>/dev/null
pkill -f "performance_optimizer.py" 2>/dev/null
pkill -f "scalability_manager.py" 2>/dev/null
pkill -f "advanced_ai_features.py" 2>/dev/null
pkill -f "long_term_planning.py" 2>/dev/null
pkill -f "simple_test_server.py" 2>/dev/null
pkill -f "chatgpt_unified_system.py" 2>/dev/null

# React 개발 서버 중지
echo "⚛️  React 개발 서버를 중지합니다..."
pkill -f "react-scripts" 2>/dev/null

echo ""
echo "✅ 모든 서비스가 중지되었습니다."
echo "🎉 CORBU AI 시스템이 안전하게 종료되었습니다."
