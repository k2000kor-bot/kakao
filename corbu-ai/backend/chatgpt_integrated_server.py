#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORBU AI ChatGPT 통합 서버 - 실제 OpenAI API 연동
"""

import os
import json
import time
import logging
import requests
import hashlib
import random
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# OpenAI API 설정
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_API_URL = os.getenv('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')

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
    "openai_requests": 0,
    "fallback_requests": 0,
    "average_response_time": 0.0,
    "start_time": datetime.now().isoformat()
}

# 캐싱 시스템
cache = {}
CACHE_EXPIRY = int(os.getenv('CACHE_EXPIRY_SECONDS', 300))  # 5분

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

def call_openai_api(messages: List[Dict[str, str]], model: str = None) -> Dict[str, Any]:
    """실제 OpenAI API를 호출합니다."""
    if not OPENAI_API_KEY:
        logger.warning("OpenAI API 키가 설정되지 않았습니다. 폴백 응답을 반환합니다.")
        return get_fallback_response(messages)
    
    model = model or OPENAI_MODEL
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.7,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    }
    
    try:
        start_time = time.time()
        response = requests.post(OPENAI_API_URL, headers=headers, json=data, timeout=30)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            metrics["openai_requests"] += 1
            logger.info(f"OpenAI API 호출 성공 (응답시간: {response_time:.2f}초)")
            
            return {
                "content": result["choices"][0]["message"]["content"],
                "model": result["model"],
                "usage": result["usage"],
                "response_time": response_time,
                "source": "openai"
            }
        else:
            logger.error(f"OpenAI API 오류: {response.status_code} - {response.text}")
            return get_fallback_response(messages)
            
    except requests.exceptions.Timeout:
        logger.error("OpenAI API 타임아웃")
        return get_fallback_response(messages)
    except requests.exceptions.RequestException as e:
        logger.error(f"OpenAI API 요청 오류: {e}")
        return get_fallback_response(messages)
    except Exception as e:
        logger.error(f"예상치 못한 오류: {e}")
        return get_fallback_response(messages)

def get_fallback_response(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """API 실패 시 폴백 응답을 생성합니다."""
    metrics["fallback_requests"] += 1
    
    if len(messages) > 0:
        user_message = messages[-1].get('content', '')
        
        # 간단한 키워드 기반 응답
        if any(keyword in user_message.lower() for keyword in ['안녕', 'hello', 'hi']):
            content = "안녕하세요! CORBU AI입니다. 현재 OpenAI API에 연결할 수 없어 폴백 모드로 작동 중입니다."
        elif any(keyword in user_message.lower() for keyword in ['감정', 'emotion', '기분']):
            content = "감정 분석을 요청하셨군요. 현재는 폴백 모드로 작동 중이어서 정확한 분석이 어렵습니다. OpenAI API 키를 설정해주세요."
        elif any(keyword in user_message.lower() for keyword in ['창작', 'creative', '소설', 'story']):
            content = "창작 콘텐츠를 요청하셨군요. 현재는 폴백 모드로 작동 중입니다. OpenAI API 키를 설정하면 더 나은 창작 콘텐츠를 제공할 수 있습니다."
        else:
            content = f"'{user_message}'에 대한 답변을 드리고 싶지만, 현재 OpenAI API에 연결할 수 없어 폴백 모드로 작동 중입니다. API 키를 설정해주세요."
        
        return {
            "content": content,
            "model": "fallback",
            "usage": {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0},
            "response_time": 0.1,
            "source": "fallback"
        }
    else:
        return {
            "content": "메시지가 없습니다.",
            "model": "error",
            "usage": {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0},
            "response_time": 0,
            "source": "error"
        }

# 감정 분석 함수
def analyze_emotion_with_ai(text: str) -> Dict[str, Any]:
    """AI를 사용한 고급 감정 분석"""
    messages = [
        {
            "role": "system",
            "content": "당신은 감정 분석 전문가입니다. 주어진 텍스트의 감정을 분석하고 신뢰도를 제공하세요. 응답은 JSON 형식으로 해주세요: {\"emotion\": \"감정\", \"confidence\": 0.0-1.0, \"keywords\": [\"키워드1\", \"키워드2\"], \"analysis\": \"상세 분석\"}"
        },
        {
            "role": "user",
            "content": f"다음 텍스트의 감정을 분석해주세요: {text}"
        }
    ]
    
    result = call_openai_api(messages)
    
    try:
        # JSON 응답 파싱 시도
        if result["source"] == "openai":
            import re
            json_match = re.search(r'\{.*\}', result["content"], re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                return {
                    "emotion": parsed.get("emotion", "중립"),
                    "confidence": parsed.get("confidence", 0.8),
                    "keywords": parsed.get("keywords", ["분석", "감정"]),
                    "analysis": parsed.get("analysis", result["content"]),
                    "model": result["model"],
                    "source": result["source"]
                }
    except:
        pass
    
    # 파싱 실패 시 기본 응답
    return {
        "emotion": "긍정적" if any(word in text for word in ["좋", "행복", "기쁨", "만족"]) else "부정적" if any(word in text for word in ["나쁘", "슬픔", "화", "불만"]) else "중립",
        "confidence": 0.7,
        "keywords": ["감정", "분석"],
        "analysis": result["content"],
        "model": result["model"],
        "source": result["source"]
    }

# 창작 AI 함수
def generate_creative_content(content_type: str, prompt: str) -> Dict[str, Any]:
    """창작 콘텐츠 생성"""
    system_prompts = {
        "story": "당신은 창의적인 소설가입니다. 흥미롭고 감동적인 이야기를 작성하세요.",
        "poem": "당신은 시인입니다. 아름답고 감성적인 시를 작성하세요.",
        "essay": "당신은 에세이 작가입니다. 깊이 있고 사고를 자극하는 에세이를 작성하세요."
    }
    
    messages = [
        {
            "role": "system",
            "content": system_prompts.get(content_type, "당신은 창의적인 작가입니다.")
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
    
    result = call_openai_api(messages)
    
    return {
        "content": result["content"],
        "type": content_type,
        "model": result["model"],
        "usage": result["usage"],
        "source": result["source"]
    }

# API 엔드포인트들
@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "features": "chatgpt_integrated",
        "openai_configured": bool(OPENAI_API_KEY),
        "metrics": {
            "total_requests": metrics["total_requests"],
            "openai_requests": metrics["openai_requests"],
            "fallback_requests": metrics["fallback_requests"]
        }
    })

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """텍스트 분석"""
    start_time = time.time()
    metrics["total_requests"] += 1
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        analysis_type = data.get('analysis_type', 'emotion')
        
        # 캐시 확인
        cache_key = get_cache_key({"text": text, "analysis_type": analysis_type})
        cached_result = get_from_cache(cache_key)
        if cached_result:
            metrics["successful_requests"] += 1
            metrics["average_response_time"] = (metrics["average_response_time"] + (time.time() - start_time)) / 2
            return jsonify({
                "data": cached_result,
                "success": True,
                "cached": True,
                "timestamp": datetime.now().isoformat()
            })
        
        # 분석 수행
        if analysis_type == 'emotion':
            result = analyze_emotion_with_ai(text)
        else:
            result = {"analysis": f"{analysis_type} 분석 결과", "confidence": 0.85}
        
        # 캐시 저장
        set_cache(cache_key, result)
        
        metrics["successful_requests"] += 1
        metrics["average_response_time"] = (metrics["average_response_time"] + (time.time() - start_time)) / 2
        
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
        }), 500

@app.route('/chat', methods=['POST'])
def chat():
    """채팅"""
    start_time = time.time()
    metrics["total_requests"] += 1
    
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        messages = [
            {"role": "system", "content": "당신은 CORBU AI 어시스턴트입니다. 도움이 되는 답변을 제공하세요."},
            {"role": "user", "content": message}
        ]
        
        result = call_openai_api(messages)
        
        metrics["successful_requests"] += 1
        metrics["average_response_time"] = (metrics["average_response_time"] + (time.time() - start_time)) / 2
        
        return jsonify({
            "response": result["content"],
            "model": result["model"],
            "usage": result["usage"],
            "source": result["source"],
            "success": True,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        metrics["failed_requests"] += 1
        logger.error(f"채팅 오류: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False,
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/creative', methods=['POST'])
def creative_writing():
    """창작 콘텐츠 생성"""
    start_time = time.time()
    metrics["total_requests"] += 1
    
    try:
        data = request.get_json()
        content_type = data.get('type', 'story')
        prompt = data.get('prompt', '')
        
        result = generate_creative_content(content_type, prompt)
        
        metrics["successful_requests"] += 1
        metrics["average_response_time"] = (metrics["average_response_time"] + (time.time() - start_time)) / 2
        
        return jsonify({
            "data": result,
            "success": True,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        metrics["failed_requests"] += 1
        logger.error(f"창작 오류: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False,
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/status', methods=['GET'])
def api_status():
    """API 상태 및 사용량"""
    return jsonify({
        "openai_configured": bool(OPENAI_API_KEY),
        "api_key_set": bool(OPENAI_API_KEY),
        "model": OPENAI_MODEL,
        "metrics": metrics,
        "cache_status": {
            "active_entries": len([k for k, v in cache.items() if datetime.now() < v['expires_at']]),
            "total_entries": len(cache),
            "expiry_seconds": CACHE_EXPIRY
        },
        "success": True,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/cache/status', methods=['GET'])
def get_cache_status():
    """캐시 상태"""
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
    """캐시 초기화"""
    global cache
    cache.clear()
    logger.info("캐시가 초기화되었습니다.")
    return jsonify({
        "message": "캐시가 성공적으로 초기화되었습니다.",
        "success": True,
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("🚀 CORBU AI ChatGPT 통합 서버 시작 중...")
    logger.info(f"📊 OpenAI API 설정: {'✅ 설정됨' if OPENAI_API_KEY else '❌ 미설정'}")
    logger.info(f"🤖 모델: {OPENAI_MODEL}")
    logger.info("🌐 서버 주소: http://localhost:5005")
    
    if not OPENAI_API_KEY:
        logger.warning("⚠️  OpenAI API 키가 설정되지 않았습니다. 폴백 모드로 작동합니다.")
        logger.info("💡 API 키를 설정하려면 .env 파일에 OPENAI_API_KEY를 추가하세요.")
    
    app.run(host='0.0.0.0', port=5005, debug=True)
