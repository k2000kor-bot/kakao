#!/usr/bin/env python3
"""
CORBU AI 간단한 API 서버
정리된 프로젝트 구조용
"""

import json
import random
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask 앱 생성
app = Flask(__name__)
CORS(app)

# 전역 변수
system_metrics = {
    'total_requests': 0,
    'successful_requests': 0,
    'failed_requests': 0,
    'average_response_time': 0.0
}

@app.route('/api/health', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    """시스템 헬스 체크"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'services': {
            'api': 'running',
            'database': 'connected',
            'ai_engines': 'active'
        }
    })

@app.route('/api/metrics', methods=['GET'])
@app.route('/metrics', methods=['GET'])
def get_metrics():
    """시스템 메트릭 조회"""
    return jsonify({
        'success': True,
        'metrics': system_metrics,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/integrated/analyze', methods=['POST'])
@app.route('/analyze', methods=['POST'])
def analyze_message():
    """통합 메시지 분석"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({
                'success': False,
                'error': '메시지가 제공되지 않았습니다.',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # 메트릭 업데이트
        system_metrics['total_requests'] += 1
        
        # 감정 분석 시뮬레이션
        emotions = ['긍정', '부정', '중립']
        emotion = random.choice(emotions)
        confidence = random.uniform(0.7, 0.95)
        
        # 의도 분석 시뮬레이션
        intents = ['question', 'request', 'gratitude', 'greeting']
        intent = random.choice(intents)
        
        # 키워드 추출 시뮬레이션
        keywords = ['건설', 'AI', '기술', '미래', '혁신']
        extracted_keywords = random.sample(keywords, random.randint(1, 3))
        
        # AI 응답 생성
        responses = {
            'question': f"'{message}'에 대한 질문이군요. 건설업계의 관점에서 답변드리겠습니다.",
            'request': f"'{message}' 요청을 이해했습니다. 최선의 솔루션을 제공하겠습니다.",
            'gratitude': "감사합니다! 더 나은 서비스를 위해 노력하겠습니다.",
            'greeting': "안녕하세요! CORBU AI입니다. 무엇을 도와드릴까요?"
        }
        
        response_text = responses.get(intent, f"'{message}'에 대해 분석한 결과를 제공합니다.")
        
        # 분석 결과
        analysis_result = {
            'emotion': {
                'label': emotion,
                'confidence': confidence
            },
            'intent': intent,
            'keywords': extracted_keywords,
            'response': response_text
        }
        
        # 성공 메트릭 업데이트
        system_metrics['successful_requests'] += 1
        
        result = {
            'success': True,
            'analysis': analysis_result,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"메시지 분석 완료: {message[:50]}...")
        return jsonify(result)
        
    except Exception as e:
        system_metrics['failed_requests'] += 1
        logger.error(f"메시지 분석 오류: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/integrated/creative/story', methods=['POST'])
@app.route('/creative/story', methods=['POST'])
def generate_story():
    """창작 글쓰기 - 소설 생성"""
    try:
        data = request.get_json()
        genre = data.get('genre', 'romance')
        theme = data.get('theme', '일반적인 이야기')
        length = data.get('length', 'short')
        
        # 장르별 템플릿
        story_templates = {
            'romance': f"# {theme}에 대한 로맨스 이야기\n\n그날, {theme}에 대한 생각이 마음을 사로잡았다.\n아름다운 만남이 시작되었고, 두 사람의 사랑 이야기가 펼쳐진다.\n\n시간이 흘러도 변하지 않는 {theme}의 의미를\n서로의 마음속에서 발견하게 된다.\n\n그렇게 {theme}은 사랑의 이름으로\n영원히 기억되리라.",
            'fantasy': f"# {theme}의 판타지 모험\n\n고대의 {theme}이 깨어나면서\n마법의 세계가 펼쳐진다.\n\n용사는 {theme}의 힘을 찾아\n위험한 여행을 떠난다.\n\n{theme}의 비밀이 밝혀지면서\n세상의 운명이 바뀐다.",
            'mystery': f"# {theme}의 미스터리\n\n{theme}과 관련된 수상한 사건이 발생했다.\n\n탐정은 단서를 따라가며\n진실을 찾아나선다.\n\n{theme}의 뒤에 숨은 진실이\n드디어 밝혀진다."
        }
        
        story_content = story_templates.get(genre, story_templates['romance'])
        
        # 길이 조정
        if length == 'long':
            story_content += "\n\n" + "이야기는 계속해서 더 깊어지고, 등장인물들은 복잡한 관계를 맺어간다. " * 3
        elif length == 'medium':
            story_content += "\n\n" + "이야기는 더욱 흥미진진해지며, 독자들의 관심을 끌어간다."
        
        word_count = len(story_content.split())
        
        result = {
            'success': True,
            'data': {
                'type': 'story',
                'genre': genre,
                'theme': theme,
                'length': length,
                'content': story_content,
                'word_count': word_count,
                'created_at': datetime.now().isoformat()
            },
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"소설 생성 완료: {genre} - {theme}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"소설 생성 오류: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    logger.info("🚀 CORBU AI 간단한 API 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:5002")
    
    app.run(
        host='0.0.0.0',
        port=5002,
        debug=True,
        threaded=True
    )
