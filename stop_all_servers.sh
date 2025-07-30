#!/bin/bash

echo "🛑 모든 서버 중지"
echo "=================="

# 각 서버 프로세스 종료
pkill -f "python.*main_server.py" 2>/dev/null
pkill -f "python.*message_generation_server.py" 2>/dev/null
pkill -f "python.*sync_server.py" 2>/dev/null
pkill -f "python.*chat_analysis_server.py" 2>/dev/null
pkill -f "python.*simulation_server.py" 2>/dev/null
pkill -f "python.*media_management_server.py" 2>/dev/null
pkill -f "python.*response_generation_server.py" 2>/dev/null
pkill -f "python.*context_analysis_server.py" 2>/dev/null
pkill -f "python.*strategy_optimization_server.py" 2>/dev/null
pkill -f "python.*advanced_message_generation_server.py" 2>/dev/null

echo "✅ 모든 서버가 중지되었습니다." 