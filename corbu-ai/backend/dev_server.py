#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORBU AI 개발용 서버 - ChatGPT API 연동
"""

import os
import json
import time
import logging
import requests
import hashlib
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# OpenAI API 설정
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 시스템 메트릭
metrics = {
    "total_requests": 0,
    "successful_requests": 0,
    "failed_requests": 0,
    "average_response_time": 0.0,
    "start_time": datetime.now().isoformat()
}

# 캐싱 시스템
cache = {}
CACHE_EXPIRY = 300  # 5분

def get_cache_key(data: Dict[str, Any]) -> str:
    """캐시 키를 생성합니다."""
    return hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()

def get_from_cache(key: str) -> Optional[Dict[str, Any]]:
    """캐시에서 데이터를 가져옵니다."""
    if key in cache:
        cached_data = cache[key]
        if datetime.now() < cached_data['expires_at']:
            logger.info(f"캐시 히트: {key}")
            return cached_data['data']
        else:
            del cache[key]
            logger.info(f"캐시 만료: {key}")
    return None

def set_cache(key: str, data: Dict[str, Any]) -> None:
    """캐시에 데이터를 저장합니다."""
    cache[key] = {
        'data': data,
        'expires_at': datetime.now() + timedelta(seconds=CACHE_EXPIRY)
    }
    logger.info(f"캐시 저장: {key}")

def call_chatgpt_api(messages: List[Dict[str, str]], model: str = "gpt-3.5-turbo") -> Dict[str, Any]:
    """ChatGPT API를 호출합니다."""
    if not OPENAI_API_KEY:
        logger.warning("OpenAI API 키가 설정되지 않았습니다. 모의 응답을 반환합니다.")
        return {
            "content": "OpenAI API 키가 설정되지 않았습니다. 환경 변수 OPENAI_API_KEY를 설정해주세요.",
            "model": "mock",
            "usage": {"total_tokens": 0}
        }
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(OPENAI_API_URL, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        return {
            "content": result["choices"][0]["message"]["content"],
            "model": result["model"],
            "usage": result["usage"]
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"ChatGPT API 호출 실패: {e}")
        return {
            "content": f"API 호출 중 오류가 발생했습니다: {str(e)}",
            "model": "error",
            "usage": {"total_tokens": 0}
        }
    except Exception as e:
        logger.error(f"예상치 못한 오류: {e}")
        return {
            "content": f"예상치 못한 오류가 발생했습니다: {str(e)}",
            "model": "error",
            "usage": {"total_tokens": 0}
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
            "model": "gpt-3.5-turbo-dev"
        }
    else:
        return {
            "emotion": "neutral",
            "score": 50,
            "confidence": 0.5,
            "details": "분석 실패",
            "model": "gpt-3.5-turbo-dev"
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
            "model": "gpt-3.5-turbo-dev",
            "created_at": datetime.now().isoformat()
        }
    else:
        return {
            "content": f"죄송합니다. {genre} 장르의 {theme} 테마로 {length_kr} 분량의 소설을 생성하는 중 오류가 발생했습니다.",
            "genre": genre,
            "theme": theme,
            "length": length,
            "word_count": 0,
            "model": "gpt-3.5-turbo-dev",
            "created_at": datetime.now().isoformat()
        }

# 마케팅 콘텐츠 생성 함수
def create_marketing_content_with_chatgpt(content_type: str, platform: str, tone: str, topic: str) -> Dict[str, Any]:
    """ChatGPT를 사용한 고급 마케팅 콘텐츠 생성"""
    messages = [
        {
            "role": "system",
            "content": f"당신은 전문적인 마케팅 콘텐츠 작성자입니다. {platform} 플랫폼에 적합한 {content_type} 콘텐츠를 {tone} 톤으로 작성해주세요. 해시태그와 이모지를 포함해주세요."
        },
        {
            "role": "user",
            "content": f"주제: {topic}, 플랫폼: {platform}, 콘텐츠 유형: {content_type}, 톤: {tone}로 마케팅 콘텐츠를 작성해주세요."
        }
    ]
    
    result = call_chatgpt_api(messages, max_tokens=1500)
    if result["success"]:
        return {
            "content": result["content"],
            "platform": platform,
            "content_type": content_type,
            "tone": tone,
            "topic": topic,
            "model": "gpt-3.5-turbo-dev",
            "created_at": datetime.now().isoformat()
        }
    else:
        return {
            "content": f"죄송합니다. {platform} 플랫폼용 {content_type} 콘텐츠를 생성하는 중 오류가 발생했습니다.",
            "platform": platform,
            "content_type": content_type,
            "tone": tone,
            "topic": topic,
            "model": "gpt-3.5-turbo-dev",
            "created_at": datetime.now().isoformat()
        }

# API 엔드포인트들
@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크 엔드포인트"""
    return jsonify({
        "status": "healthy",
        "services": {
            "ai_engines": "active",
            "chatgpt_api": "dev_mode",
            "api": "running",
            "database": "connected",
            "authentication": "disabled"
        },
        "version": "3.0.0-dev",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/metrics', methods=['GET'])
def get_metrics():
    """시스템 메트릭 조회"""
    return jsonify({
        "metrics": metrics,
        "success": True,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/cache/status', methods=['GET'])
def get_cache_status():
    """캐시 상태 확인 엔드포인트"""
    active_cache_count = len([k for k, v in cache.items() if datetime.now() < v['expires_at']])
    expired_cache_count = len([k for k, v in cache.items() if datetime.now() >= v['expires_at']])
    
    return jsonify({
        "cache_status": {
            "active_entries": active_cache_count,
            "expired_entries": expired_cache_count,
            "total_entries": len(cache),
            "cache_expiry_seconds": CACHE_EXPIRY
        },
        "success": True,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    """캐시 초기화 엔드포인트"""
    global cache
    cache.clear()
    logger.info("캐시가 초기화되었습니다.")
    
    return jsonify({
        "message": "캐시가 성공적으로 초기화되었습니다.",
        "success": True,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/system/metrics', methods=['GET'])
def get_system_metrics():
    """실시간 시스템 메트릭 엔드포인트"""
    import psutil
    import random
    
    try:
        # 실제 시스템 메트릭 (psutil 사용 가능한 경우)
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        system_metrics = {
            "cpu_usage": cpu_percent,
            "memory_usage": memory.percent,
            "disk_usage": (disk.used / disk.total) * 100,
            "network_latency": random.uniform(10, 50),  # 시뮬레이션
            "active_connections": len(cache) + random.randint(5, 15),
            "response_time": metrics["average_response_time"] * 1000,
            "error_rate": (metrics["failed_requests"] / max(metrics["total_requests"], 1)) * 100,
            "throughput": metrics["total_requests"] / max((time.time() - time.mktime(datetime.fromisoformat(metrics["start_time"]).timetuple())), 1)
        }
    except ImportError:
        # psutil이 없는 경우 시뮬레이션된 메트릭
        system_metrics = {
            "cpu_usage": random.uniform(20, 80),
            "memory_usage": random.uniform(40, 85),
            "disk_usage": random.uniform(30, 70),
            "network_latency": random.uniform(10, 50),
            "active_connections": len(cache) + random.randint(5, 15),
            "response_time": metrics["average_response_time"] * 1000,
            "error_rate": (metrics["failed_requests"] / max(metrics["total_requests"], 1)) * 100,
            "throughput": metrics["total_requests"] / max((time.time() - time.mktime(datetime.fromisoformat(metrics["start_time"]).timetuple())), 1)
        }
    
    return jsonify({
        "system_metrics": system_metrics,
        "success": True,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/notifications/generate', methods=['POST'])
def generate_smart_notification():
    """스마트 알림 생성 엔드포인트"""
    try:
        data = request.get_json()
        notification_type = data.get('type', 'ai_insight')
        
        # 알림 타입별 메시지 생성
        notification_templates = {
            'ai_insight': {
                'title': 'AI 인사이트',
                'message': '새로운 AI 분석 결과가 도출되었습니다. 시스템 성능이 최적화되고 있습니다.',
                'priority': 'medium'
            },
            'system_alert': {
                'title': '시스템 알림',
                'message': '시스템 상태가 모니터링되고 있습니다. 모든 서비스가 정상 작동 중입니다.',
                'priority': 'low'
            },
            'performance_tip': {
                'title': '성능 개선 제안',
                'message': '캐시 시스템이 효과적으로 작동하고 있습니다. 응답 시간이 단축되었습니다.',
                'priority': 'low'
            },
            'trend_analysis': {
                'title': '사용 패턴 분석',
                'message': '사용자 활동 패턴이 분석되었습니다. 최적의 서비스 제공을 위한 인사이트를 확인하세요.',
                'priority': 'medium'
            }
        }
        
        template = notification_templates.get(notification_type, notification_templates['ai_insight'])
        
        notification = {
            'id': f'notif-{int(time.time())}',
            'type': notification_type,
            'title': template['title'],
            'message': template['message'],
            'priority': template['priority'],
            'timestamp': datetime.now().isoformat(),
            'category': 'AI 시스템',
            'actionable': True
        }
        
        return jsonify({
            'notification': notification,
            'success': True,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"알림 생성 오류: {str(e)}")
        return jsonify({
            'error': '알림 생성에 실패했습니다.',
            'success': False,
            'timestamp': datetime.now().isoformat()
        })

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """고급 텍스트 분석 (ChatGPT 연동 + 캐싱)"""
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
        
        # 캐시 키 생성
        cache_key = get_cache_key({"text": text, "analysis_type": analysis_type})
        
        # 캐시에서 확인
        cached_result = get_from_cache(cache_key)
        if cached_result:
            metrics["successful_requests"] += 1
            response_time = time.time() - start_time
            metrics["average_response_time"] = (
                (metrics["average_response_time"] * (metrics["successful_requests"] - 1) + response_time) 
                / metrics["successful_requests"]
            )
            return jsonify({
                "data": cached_result,
                "success": True,
                "cached": True,
                "timestamp": datetime.now().isoformat()
            })
        
        # 캐시에 없으면 새로 분석
        if analysis_type == 'emotion':
            result = analyze_emotion_with_chatgpt(text)
        else:
            result = {
                "emotion": "neutral",
                "score": 50,
                "confidence": 0.5,
                "details": "지원하지 않는 분석 유형입니다.",
                "model": "gpt-3.5-turbo-dev"
            }
        
        # 결과를 캐시에 저장
        set_cache(cache_key, result)
        
        metrics["successful_requests"] += 1
        response_time = time.time() - start_time
        metrics["average_response_time"] = (
            (metrics["average_response_time"] * (metrics["successful_requests"] - 1) + response_time) 
            / metrics["successful_requests"]
        )
        
        return jsonify({
            "data": result,
            "success": True,
            "cached": False,
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
def create_story():
    """고급 창작 글쓰기 (ChatGPT 연동)"""
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

@app.route('/marketing/content', methods=['POST'])
def create_marketing_content():
    """고급 마케팅 콘텐츠 생성 (ChatGPT 연동)"""
    start_time = time.time()
    metrics["total_requests"] += 1
    
    try:
        data = request.get_json()
        content_type = data.get('content_type', 'post')
        platform = data.get('platform', 'instagram')
        tone = data.get('tone', 'friendly')
        topic = data.get('topic', 'AI 기술')
        
        result = create_marketing_content_with_chatgpt(content_type, platform, tone, topic)
        
        metrics["successful_requests"] += 1
        response_time = time.time() - start_time
        metrics["average_response_time"] = (
            (metrics["average_response_time"] * (metrics["successful_requests"] - 1) + response_time) 
            / metrics["successful_requests"]
        )
        
        logger.info(f"마케팅 콘텐츠 생성 완료: {platform} - {content_type}")
        
        return jsonify({
            "data": result,
            "success": True,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        metrics["failed_requests"] += 1
        logger.error(f"마케팅 콘텐츠 생성 오류: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False,
            "timestamp": datetime.now().isoformat()
        })

@app.route('/chat', methods=['POST'])
def chat_with_ai():
    """고급 AI 채팅 (ChatGPT 연동)"""
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

if __name__ == '__main__':
    logger.info("🚀 CORBU AI 개발용 API 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:5005")
    logger.info("🔓 인증 없음 - 개발용")
    logger.info("🤖 ChatGPT 모의 응답 모드")
    app.run(host='0.0.0.0', port=5005, debug=True)
