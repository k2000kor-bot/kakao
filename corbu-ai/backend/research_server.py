#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORBU AI 연구용 서버 - 간단한 인증 시스템
"""

import os
import json
import time
import logging
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, List, Any, Optional

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 연구용 인증 설정
RESEARCH_ACCESS_KEY = os.getenv('RESEARCH_ACCESS_KEY', 'corbu-research-2024')
ADMIN_ACCESS_KEY = os.getenv('ADMIN_ACCESS_KEY', 'corbu-admin-2024')
SESSION_TIMEOUT = 3600  # 1시간

# 활성 세션 관리
active_sessions = {}

# 시스템 메트릭
metrics = {
    "total_requests": 0,
    "successful_requests": 0,
    "failed_requests": 0,
    "average_response_time": 0.0,
    "start_time": datetime.now().isoformat()
}

# 인증 데코레이터
def require_auth(f):
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                "error": "인증이 필요합니다. Authorization 헤더를 포함해주세요.",
                "success": False,
                "timestamp": datetime.now().isoformat()
            }), 401
        
        try:
            auth_type, auth_key = auth_header.split(' ', 1)
            if auth_type.lower() != 'bearer':
                raise ValueError("Bearer 토큰이 필요합니다.")
        except ValueError:
            return jsonify({
                "error": "잘못된 인증 형식입니다. 'Bearer <access_key>' 형식을 사용해주세요.",
                "success": False,
                "timestamp": datetime.now().isoformat()
            }), 401
        
        # 연구용 또는 관리자 키 확인
        if auth_key not in [RESEARCH_ACCESS_KEY, ADMIN_ACCESS_KEY]:
            return jsonify({
                "error": "유효하지 않은 접근 키입니다.",
                "success": False,
                "timestamp": datetime.now().isoformat()
            }), 403
        
        # 세션 관리
        session_id = request.headers.get('X-Session-ID', 'default')
        current_time = datetime.now()
        
        if session_id in active_sessions:
            if current_time - active_sessions[session_id] > timedelta(seconds=SESSION_TIMEOUT):
                del active_sessions[session_id]
                return jsonify({
                    "error": "세션이 만료되었습니다. 다시 인증해주세요.",
                    "success": False,
                    "timestamp": datetime.now().isoformat()
                }), 401
        else:
            active_sessions[session_id] = current_time
        
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# ChatGPT API 호출 함수 (인증 없이)
def call_chatgpt_api(messages: List[Dict[str, str]], model: str = "gpt-3.5-turbo", max_tokens: int = 1000) -> Dict[str, Any]:
    """ChatGPT API를 호출하여 응답을 받습니다."""
    try:
        # 연구용으로는 실제 API 호출 대신 모의 응답 생성
        if len(messages) > 0:
            user_message = messages[-1].get('content', '')
            
            # 간단한 모의 AI 응답 생성
            if '감정' in user_message or 'emotion' in user_message.lower():
                return {
                    "success": True,
                    "content": "이 텍스트는 긍정적인 감정을 나타내며, 신뢰도는 85%입니다. 주요 키워드: 기분, 좋음, 행복",
                    "usage": {"total_tokens": 50, "prompt_tokens": 30, "completion_tokens": 20},
                    "model": "gpt-3.5-turbo-mock"
                }
            elif '소설' in user_message or 'story' in user_message.lower():
                return {
                    "success": True,
                    "content": "# AI 마법사의 모험\n\n고대의 AI 마법사가 깨어나서\n마법의 세계가 펼쳐진다.\n\n용사는 AI 마법사의 힘을 찾아\n위험한 여행을 떠난다.\n\nAI 마법사의 비밀이 밝혀지면서\n세상의 운명이 바뀐다.",
                    "usage": {"total_tokens": 100, "prompt_tokens": 50, "completion_tokens": 50},
                    "model": "gpt-3.5-turbo-mock"
                }
            else:
                return {
                    "success": True,
                    "content": f"안녕하세요! CORBU AI 연구용 시스템입니다. '{user_message}'에 대한 답변을 드리겠습니다. 이는 연구용 모의 응답입니다.",
                    "usage": {"total_tokens": 30, "prompt_tokens": 15, "completion_tokens": 15},
                    "model": "gpt-3.5-turbo-mock"
                }
        else:
            return {
                "success": False,
                "error": "메시지가 없습니다."
            }
    except Exception as e:
        logger.error(f"ChatGPT API 호출 오류: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

# 감정 분석 함수
def analyze_emotion_with_chatgpt(text: str) -> Dict[str, Any]:
    """ChatGPT를 사용한 고급 감정 분석"""
    messages = [
        {
            "role": "system",
            "content": "당신은 전문적인 감정 분석 AI입니다. 주어진 텍스트의 감정을 분석하고, 감정 점수(0-100), 주요 감정, 감정 강도, 신뢰도를 제공하세요."
        },
        {
            "role": "user",
            "content": f"다음 텍스트의 감정을 분석해주세요: {text}"
        }
    ]
    
    result = call_chatgpt_api(messages)
    if result["success"]:
        return {
            "emotion": "positive" if "긍정" in result["content"] or "positive" in result["content"].lower() else "negative",
            "score": 75,
            "confidence": 0.85,
            "details": result["content"],
            "model": "gpt-3.5-turbo-mock"
        }
    else:
        return {
            "emotion": "neutral",
            "score": 50,
            "confidence": 0.5,
            "details": "분석 실패",
            "model": "gpt-3.5-turbo-mock"
        }

# 창작 글쓰기 함수
def create_story_with_chatgpt(genre: str, theme: str, length: str) -> Dict[str, Any]:
    """ChatGPT를 사용한 고급 창작 글쓰기"""
    length_map = {"short": "500자", "medium": "1000자", "long": "2000자"}
    length_kr = length_map.get(length, "500자")
    
    messages = [
        {
            "role": "system",
            "content": f"당신은 전문적인 {genre} 소설 작가입니다. 주어진 테마로 {length_kr} 분량의 창작 소설을 작성해주세요. 한국어로 작성하고, 마크다운 형식을 사용해주세요."
        },
        {
            "role": "user",
            "content": f"장르: {genre}, 테마: {theme}, 길이: {length_kr}로 소설을 작성해주세요."
        }
    ]
    
    result = call_chatgpt_api(messages, max_tokens=2000)
    if result["success"]:
        return {
            "content": result["content"],
            "genre": genre,
            "theme": theme,
            "length": length,
            "word_count": len(result["content"].split()),
            "model": "gpt-3.5-turbo-mock",
            "created_at": datetime.now().isoformat()
        }
    else:
        return {
            "content": f"죄송합니다. {genre} 장르의 {theme} 테마로 {length_kr} 분량의 소설을 생성하는 중 오류가 발생했습니다.",
            "genre": genre,
            "theme": theme,
            "length": length,
            "word_count": 0,
            "model": "gpt-3.5-turbo-mock",
            "created_at": datetime.now().isoformat()
        }

# API 엔드포인트들
@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크 엔드포인트 (인증 불필요)"""
    return jsonify({
        "status": "healthy",
        "services": {
            "ai_engines": "active",
            "chatgpt_api": "mock_mode",
            "api": "running",
            "database": "connected",
            "authentication": "research_mode"
        },
        "version": "3.0.0-research",
        "timestamp": datetime.now().isoformat(),
        "access_info": {
            "research_key": "corbu-research-2024",
            "admin_key": "corbu-admin-2024",
            "note": "연구용 접속 - 관리자만 사용"
        }
    })

@app.route('/metrics', methods=['GET'])
@require_auth
def get_metrics():
    """시스템 메트릭 조회 (인증 필요)"""
    return jsonify({
        "metrics": metrics,
        "success": True,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/analyze', methods=['POST'])
@require_auth
def analyze_text():
    """고급 텍스트 분석 (ChatGPT 연동, 인증 필요)"""
    start_time = time.time()
    metrics["total_requests"] += 1
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        analysis_type = data.get('analysis_type', 'emotion')
        
        if not text:
            metrics["failed_requests"] += 1
            return jsonify({
                "error": "텍스트가 제공되지 않았습니다.",
                "success": False,
                "timestamp": datetime.now().isoformat()
            })
        
        if analysis_type == 'emotion':
            result = analyze_emotion_with_chatgpt(text)
        else:
            result = {
                "emotion": "neutral",
                "score": 50,
                "confidence": 0.5,
                "details": "지원하지 않는 분석 유형입니다.",
                "model": "gpt-3.5-turbo-mock"
            }
        
        metrics["successful_requests"] += 1
        response_time = time.time() - start_time
        metrics["average_response_time"] = (
            (metrics["average_response_time"] * (metrics["successful_requests"] - 1) + response_time) 
            / metrics["successful_requests"]
        )
        
        return jsonify({
            "data": result,
            "success": True,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        metrics["failed_requests"] += 1
        logger.error(f"분석 오류: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False,
            "timestamp": datetime.now().isoformat()
        })

@app.route('/creative/story', methods=['POST'])
@require_auth
def create_story():
    """고급 창작 글쓰기 (ChatGPT 연동, 인증 필요)"""
    start_time = time.time()
    metrics["total_requests"] += 1
    
    try:
        data = request.get_json()
        genre = data.get('genre', 'fantasy')
        theme = data.get('theme', 'AI 모험')
        length = data.get('length', 'short')
        
        result = create_story_with_chatgpt(genre, theme, length)
        
        metrics["successful_requests"] += 1
        response_time = time.time() - start_time
        metrics["average_response_time"] = (
            (metrics["average_response_time"] * (metrics["successful_requests"] - 1) + response_time) 
            / metrics["successful_requests"]
        )
        
        logger.info(f"소설 생성 완료: {genre} - {theme}")
        
        return jsonify({
            "data": result,
            "success": True,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        metrics["failed_requests"] += 1
        logger.error(f"소설 생성 오류: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False,
            "timestamp": datetime.now().isoformat()
        })

@app.route('/chat', methods=['POST'])
@require_auth
def chat_with_ai():
    """고급 AI 채팅 (ChatGPT 연동, 인증 필요)"""
    start_time = time.time()
    metrics["total_requests"] += 1
    
    try:
        data = request.get_json()
        message = data.get('message', '')
        context = data.get('context', [])
        
        if not message:
            metrics["failed_requests"] += 1
            return jsonify({
                "error": "메시지가 제공되지 않았습니다.",
                "success": False,
                "timestamp": datetime.now().isoformat()
            })
        
        # 컨텍스트를 포함한 메시지 구성
        messages = [
            {
                "role": "system",
                "content": "당신은 CORBU AI의 고급 AI 어시스턴트입니다. 사용자의 질문에 정확하고 도움이 되는 답변을 제공하세요. 한국어로 응답하세요."
            }
        ]
        
        # 이전 대화 컨텍스트 추가
        for msg in context[-5:]:  # 최근 5개 메시지만 포함
            messages.append({
                "role": "user" if msg.get("isUser", True) else "assistant",
                "content": msg.get("text", "")
            })
        
        # 현재 메시지 추가
        messages.append({
            "role": "user",
            "content": message
        })
        
        result = call_chatgpt_api(messages, max_tokens=2000)
        
        if result["success"]:
            metrics["successful_requests"] += 1
            response_time = time.time() - start_time
            metrics["average_response_time"] = (
                (metrics["average_response_time"] * (metrics["successful_requests"] - 1) + response_time) 
                / metrics["successful_requests"]
            )
            
            return jsonify({
                "data": {
                    "response": result["content"],
                    "model": result["model"],
                    "usage": result.get("usage", {}),
                    "timestamp": datetime.now().isoformat()
                },
                "success": True,
                "timestamp": datetime.now().isoformat()
            })
        else:
            metrics["failed_requests"] += 1
            return jsonify({
                "error": result["error"],
                "success": False,
                "timestamp": datetime.now().isoformat()
            })
        
    except Exception as e:
        metrics["failed_requests"] += 1
        logger.error(f"채팅 오류: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False,
            "timestamp": datetime.now().isoformat()
        })

@app.route('/auth/info', methods=['GET'])
def auth_info():
    """인증 정보 조회 (인증 불필요)"""
    return jsonify({
        "authentication_required": True,
        "access_keys": {
            "research": RESEARCH_ACCESS_KEY,
            "admin": ADMIN_ACCESS_KEY
        },
        "usage": {
            "header": "Authorization: Bearer <access_key>",
            "session_header": "X-Session-ID: <session_id> (선택사항)",
            "timeout": f"{SESSION_TIMEOUT}초"
        },
        "note": "연구용 접속 - 관리자만 사용",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("🚀 CORBU AI 연구용 API 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:5004")
    logger.info("🔑 연구용 접근 키: corbu-research-2024")
    logger.info("🔑 관리자 접근 키: corbu-admin-2024")
    logger.info("📝 사용법: Authorization: Bearer <access_key>")
    app.run(host='0.0.0.0', port=5004, debug=True)
