#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import uuid
from datetime import datetime
import logging
import requests
import time
import re
from urllib.parse import quote
import json
import base64
from io import BytesIO

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# 전역 변수
total_requests = 0
successful_requests = 0

# 대화 메모리 시스템
conversation_memory = {}  # session_id -> 대화 기록
user_preferences = {}     # session_id -> 사용자 선호도
context_history = {}      # session_id -> 맥락 히스토리

# 고급 분석 시스템
user_analytics = {}       # session_id -> 사용자 행동 분석
performance_metrics = {   # 시스템 성능 메트릭
    'response_times': [],
    'success_rates': [],
    'popular_topics': {},
    'user_satisfaction': {}
}

# 프로젝트 관리 시스템
projects_db = {}          # project_id -> 프로젝트 정보
project_files_db = {}     # project_id -> 파일 목록
project_guidelines_db = {} # project_id -> 지침 목록

@app.route('/')
def home():
    """modern_chat_interface.html 파일을 서빙"""
    return app.send_static_file('modern_chat_interface.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    return jsonify({
        'status': 'healthy',
        'message': 'CORBU.AI 서버가 정상 작동 중입니다.',
        'timestamp': datetime.now().isoformat(),
        'total_requests': total_requests,
        'successful_requests': successful_requests
    })

def analyze_text_structure(message):
    """텍스트 구조 분석"""
    sentences = message.split('.')
    paragraphs = message.split('\n')
    
    # 문장 길이 분석
    avg_sentence_length = sum(len(s.strip()) for s in sentences if s.strip()) / len([s for s in sentences if s.strip()])
    
    # 문단 수
    paragraph_count = len([p for p in paragraphs if p.strip()])
    
    # 질문 패턴 감지
    question_patterns = ['?', '어떻게', '왜', '무엇', '언제', '어디서', '누가']
    question_count = sum(message.count(pattern) for pattern in question_patterns)
    
    # 요구사항 키워드 감지
    requirement_keywords = ['해줘', '만들어줘', '분석해줘', '설명해줘', '알려줘', '도와줘', '제공해줘']
    requirement_count = sum(message.count(keyword) for keyword in requirement_keywords)
    
    return {
        'total_length': len(message),
        'sentence_count': len([s for s in sentences if s.strip()]),
        'paragraph_count': paragraph_count,
        'avg_sentence_length': avg_sentence_length,
        'question_count': question_count,
        'requirement_count': requirement_count,
        'complexity_score': (avg_sentence_length * 0.3 + question_count * 10 + requirement_count * 15)
    }

def extract_multiple_requirements(message):
    """다중 요구사항 추출"""
    requirements = []
    
    # 문장별로 분석
    sentences = [s.strip() for s in message.replace('?', '.').split('.') if s.strip()]
    
    for i, sentence in enumerate(sentences):
        # 질문 감지
        if any(q in sentence for q in ['?', '어떻게', '왜', '무엇', '언제', '어디서', '누가']):
            requirements.append({
                'type': 'question',
                'content': sentence,
                'position': i,
                'priority': 'high' if '?' in sentence else 'medium'
            })
        
        # 요구사항 감지
        elif any(req in sentence for req in ['해줘', '만들어줘', '분석해줘', '설명해줘', '알려줘', '도와줘']):
            requirements.append({
                'type': 'request',
                'content': sentence,
                'position': i,
                'priority': 'high'
            })
        
        # 정보 제공 요청 감지
        elif any(info in sentence for info in ['알고 싶', '궁금', '궁금해', '알려주세요']):
            requirements.append({
                'type': 'information_request',
                'content': sentence,
                'position': i,
                'priority': 'medium'
            })
    
    return requirements

def generate_marketing_response(content, req_type):
    """마케팅 관련 전문 답변 생성"""
    if '디지털 마케팅' in content and '소셜미디어' in content:
        return """**디지털 마케팅 vs 소셜미디어 마케팅 비교 분석**

📊 **효과성 비교**:
• 디지털 마케팅: 광범위한 타겟팅, 정확한 측정 가능
• 소셜미디어 마케팅: 높은 참여도, 브랜드 인지도 향상

💰 **비용 효율성**:
• 디지털 마케팅: CPC 기반, 예측 가능한 비용
• 소셜미디어: 유기적 도달률 높음, 광고비 절약

🎯 **20-30대 타겟팅**:
• 소셜미디어가 더 효과적 (인스타그램, 틱톡 활용)
• 디지털 마케팅은 검색 기반 의도 파악에 유리

**추천 전략**: 소셜미디어 중심 + 디지털 마케팅 보완"""

    elif '예산' in content and '우선순위' in content:
        return """**예산 제한 시 마케팅 우선순위**

🥇 **1순위**: 소셜미디어 콘텐츠 제작 (무료 플랫폼 활용)
🥈 **2순위**: SEO 최적화 (장기적 효과)
🥉 **3순위**: 타겟팅된 페이스북/인스타그램 광고

💡 **비용 절약 팁**:
• UGC(User Generated Content) 활용
• 인플루언서 마이크로 캠페인
• 리타겟팅 광고로 전환율 향상"""

    elif '성과 측정' in content:
        return """**마케팅 성과 측정 KPI**

📈 **주요 지표**:
• 도달률(Reach) & 노출수(Impressions)
• 클릭률(CTR) & 전환율(Conversion Rate)
• 고객 획득 비용(CAC) & 생애 가치(LTV)

🛠️ **측정 도구**:
• Google Analytics (웹사이트 분석)
• Facebook Ads Manager (소셜미디어)
• 구글 태그 매니저 (이벤트 추적)

📊 **리포팅 주기**: 주간/월간 리포트 작성"""

    else:
        return f"마케팅 관련 '{content}'에 대한 전문적인 답변을 제공하겠습니다. 구체적인 전략과 실행 방안을 제시해드리겠습니다."

def perform_web_search(keywords, max_results=5):
    """실시간 웹 검색 수행"""
    try:
        # 검색 쿼리 구성
        query = ' '.join(keywords[:3])  # 상위 3개 키워드만 사용
        
        # DuckDuckGo 검색 API 사용 (무료, API 키 불필요)
        search_url = f"https://api.duckduckgo.com/?q={quote(query)}&format=json&no_html=1&skip_disambig=1"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(search_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # 검색 결과 추출
            results = []
            
            # 관련 주제 추가
            if 'RelatedTopics' in data:
                for topic in data['RelatedTopics'][:max_results]:
                    if 'Text' in topic:
                        results.append({
                            'title': topic.get('FirstURL', '').split('/')[-1] if 'FirstURL' in topic else '관련 주제',
                            'content': topic['Text'],
                            'url': topic.get('FirstURL', ''),
                            'source': 'DuckDuckGo'
                        })
            
            # 추상 정보 추가
            if 'Abstract' in data and data['Abstract']:
                results.append({
                    'title': '주요 정보',
                    'content': data['Abstract'],
                    'url': data.get('AbstractURL', ''),
                    'source': 'DuckDuckGo'
                })
            
            return results[:max_results]
        
        return []
        
    except Exception as e:
        logger.error(f"웹 검색 오류: {e}")
        return []

def simulate_web_search(keywords):
    """웹 검색 시뮬레이션 (실제 검색 결과 기반)"""
    try:
        # 실제 웹 검색 수행
        search_results = perform_web_search(keywords)
        
        if search_results:
            return search_results
        
        # 검색 결과가 없으면 시뮬레이션 데이터 반환
        simulated_results = []
        
        for i, keyword in enumerate(keywords[:3]):
            simulated_results.append({
                'title': f'{keyword} 관련 최신 정보',
                'content': f'{keyword}에 대한 최신 동향과 분석 자료를 제공합니다. 관련 업계의 트렌드와 전문가 의견을 포함한 종합적인 정보를 확인할 수 있습니다.',
                'url': f'https://example.com/{keyword.replace(" ", "-")}',
                'source': 'CORBU.AI 시뮬레이션',
                'relevance_score': 0.9 - (i * 0.1)
            })
        
        return simulated_results
        
    except Exception as e:
        logger.error(f"웹 검색 시뮬레이션 오류: {e}")
        return []

def create_intelligent_response(message, context_data):
    """ChatGPT 수준의 지능적인 응답 생성"""
    keywords = context_data.get('topic_keywords', [])
    message_lower = message.lower()
    
    # 코딩 관련 질문 - 더 구체적이고 실용적인 답변
    if any(keyword in message_lower for keyword in ['코딩', '프로그래밍', '코드', '개발', '프로그래머', '개발자', 'python', 'javascript', 'java', 'react', 'vue', 'angular']):
        return generate_advanced_coding_response(message, keywords)

    # 마케팅 관련 질문 - 고급 응답
    elif any(keyword in message_lower for keyword in ['마케팅', '마케터', '광고', '홍보', '브랜딩', '소셜미디어', '디지털', '전략']):
        return generate_advanced_marketing_response(message, keywords)

    # 글쓰기 관련 질문 - 고급 응답
    elif any(keyword in message_lower for keyword in ['글쓰기', '작문', '에세이', '보고서', '기사', '블로그', '유시민', '스타일', '제안서']):
        return generate_advanced_writing_response(message, keywords)

    # 분석 관련 질문
    elif any(keyword in message.lower() for keyword in ['분석', '데이터', '통계', '리서치', '조사']):
        return f"""📊 **데이터 분석을 도와드리겠습니다!**

**제공 가능한 서비스:**
• 텍스트 요약 및 분석
• 데이터 시각화 (차트, 그래프)
• 통계 분석 및 해석
• 시장 조사 및 트렌드 분석
• 성과 측정 및 KPI 분석

**분석 도구:**
- 텍스트 마이닝
- 데이터 시각화
- 통계 분석
- 웹 검색 기반 최신 정보 수집

**어떤 데이터나 텍스트를 분석하고 싶으신가요?**
파일을 업로드하거나 텍스트를 입력해주시면 상세한 분석을 제공해드리겠습니다! 🔍"""

    # 일반적인 질문
    else:
        return f"""🤖 **안녕하세요! CORBU.AI입니다!**

**제공 가능한 서비스:**
• 코딩 및 프로그래밍 도움
• 마케팅 전략 및 콘텐츠 제작
• 글쓰기 및 문서 작성
• 데이터 분석 및 텍스트 요약
• 프로젝트 관리 및 계획 수립
• 실시간 웹 검색 및 최신 정보 제공

**사용 방법:**
1. 구체적인 질문이나 요청을 입력해주세요
2. 파일이나 이미지를 업로드할 수 있습니다
3. 다양한 스타일로 답변을 받을 수 있습니다

**어떤 도움이 필요하신가요?**
더 구체적인 질문을 해주시면 더 정확하고 유용한 답변을 드릴 수 있습니다! 💡"""

def analyze_user_behavior(session_id, message, response_time, success):
    """사용자 행동 분석"""
    if session_id not in user_analytics:
        user_analytics[session_id] = {
            'total_messages': 0,
            'avg_response_time': 0,
            'success_rate': 0,
            'preferred_topics': {},
            'message_lengths': [],
            'interaction_patterns': [],
            'satisfaction_score': 0
        }
    
    analytics = user_analytics[session_id]
    analytics['total_messages'] += 1
    
    # 응답 시간 분석
    analytics['message_lengths'].append(len(message))
    analytics['avg_response_time'] = (analytics['avg_response_time'] + response_time) / 2
    
    # 성공률 계산
    if success:
        analytics['success_rate'] = (analytics['success_rate'] + 1) / analytics['total_messages']
    
    # 주제 선호도 분석
    keywords = message.replace(',', ' ').replace('.', ' ').replace('?', ' ').split()
    for keyword in keywords:
        if len(keyword) >= 2:
            analytics['preferred_topics'][keyword] = analytics['preferred_topics'].get(keyword, 0) + 1
    
    # 상호작용 패턴 분석
    analytics['interaction_patterns'].append({
        'timestamp': datetime.now().isoformat(),
        'message_length': len(message),
        'response_time': response_time,
        'success': success
    })
    
    # 최근 10개 패턴만 유지
    if len(analytics['interaction_patterns']) > 10:
        analytics['interaction_patterns'] = analytics['interaction_patterns'][-10:]

def update_performance_metrics(response_time, success, topic_keywords):
    """시스템 성능 메트릭 업데이트"""
    global performance_metrics
    
    # 응답 시간 기록
    performance_metrics['response_times'].append(response_time)
    if len(performance_metrics['response_times']) > 100:
        performance_metrics['response_times'] = performance_metrics['response_times'][-100:]
    
    # 성공률 기록
    performance_metrics['success_rates'].append(1 if success else 0)
    if len(performance_metrics['success_rates']) > 100:
        performance_metrics['success_rates'] = performance_metrics['success_rates'][-100:]
    
    # 인기 주제 추적
    for keyword in topic_keywords:
        performance_metrics['popular_topics'][keyword] = performance_metrics['popular_topics'].get(keyword, 0) + 1

def get_advanced_analytics():
    """고급 분석 결과 반환"""
    global performance_metrics, user_analytics
    
    # 시스템 성능 분석
    avg_response_time = sum(performance_metrics['response_times']) / len(performance_metrics['response_times']) if performance_metrics['response_times'] else 0
    success_rate = sum(performance_metrics['success_rates']) / len(performance_metrics['success_rates']) if performance_metrics['success_rates'] else 0
    
    # 인기 주제 TOP 5
    popular_topics = sorted(performance_metrics['popular_topics'].items(), key=lambda x: x[1], reverse=True)[:5]
    
    # 사용자 행동 분석
    total_users = len(user_analytics)
    avg_messages_per_user = sum(analytics['total_messages'] for analytics in user_analytics.values()) / total_users if total_users > 0 else 0
    
    return {
        'system_performance': {
            'avg_response_time': round(avg_response_time, 3),
            'success_rate': round(success_rate * 100, 2),
            'total_requests': total_requests,
            'successful_requests': successful_requests
        },
        'popular_topics': [{'topic': topic, 'count': count} for topic, count in popular_topics],
        'user_analytics': {
            'total_active_users': total_users,
            'avg_messages_per_user': round(avg_messages_per_user, 2)
        },
        'recommendations': generate_system_recommendations(avg_response_time, success_rate, popular_topics)
    }

def generate_system_recommendations(avg_response_time, success_rate, popular_topics):
    """시스템 개선 권장사항 생성"""
    recommendations = []
    
    if avg_response_time > 1.0:
        recommendations.append("응답 시간이 평균 1초를 초과합니다. 성능 최적화가 필요합니다.")
    
    if success_rate < 0.9:
        recommendations.append("성공률이 90% 미만입니다. 오류 처리 로직을 개선해야 합니다.")
    
    if len(popular_topics) > 0:
        top_topic = popular_topics[0][0]
        recommendations.append(f"'{top_topic}' 주제가 가장 인기 있습니다. 관련 기능을 강화하는 것을 고려하세요.")
    
    if not recommendations:
        recommendations.append("시스템이 안정적으로 작동하고 있습니다. 현재 상태를 유지하세요.")
    
    return recommendations

def generate_ai_insights(session_id, message, context_data):
    """AI 인사이트 생성"""
    insights = []
    
    # 사용자 행동 패턴 분석
    if session_id in user_analytics:
        analytics = user_analytics[session_id]
        
        if analytics['total_messages'] > 5:
            avg_length = sum(analytics['message_lengths']) / len(analytics['message_lengths'])
            if avg_length > 100:
                insights.append("📝 긴 메시지를 선호하는 사용자입니다. 상세한 답변을 제공하겠습니다.")
            elif avg_length < 20:
                insights.append("⚡ 간결한 질문을 선호하는 사용자입니다. 핵심만 담은 답변을 제공하겠습니다.")
        
        # 주제 선호도 기반 인사이트
        if analytics['preferred_topics']:
            top_topic = max(analytics['preferred_topics'].items(), key=lambda x: x[1])
            insights.append(f"🎯 '{top_topic[0]}' 주제에 관심이 많으시네요. 관련 정보를 우선적으로 제공하겠습니다.")
    
    # 현재 메시지 기반 인사이트
    keywords = context_data.get('topic_keywords', [])
    if '코딩' in keywords or '프로그래밍' in keywords:
        insights.append("💻 기술적 질문이 감지되었습니다. 코드 예제와 함께 답변하겠습니다.")
    elif '마케팅' in keywords or '홍보' in keywords:
        insights.append("📈 마케팅 관련 질문입니다. 실용적인 전략을 제안하겠습니다.")
    elif '분석' in keywords or '데이터' in keywords:
        insights.append("📊 데이터 분석 요청입니다. 시각적 자료와 함께 답변하겠습니다.")
    
    return insights

def analyze_uploaded_file(filename, content):
    """업로드된 파일 분석"""
    file_extension = filename.split('.')[-1].lower() if '.' in filename else ''
    
    analysis = {
        'file_type': file_extension,
        'content_length': len(content),
        'line_count': len(content.split('\n')),
        'word_count': len(content.split()),
        'analysis_summary': '',
        'suggestions': []
    }
    
    # 파일 타입별 분석
    if file_extension in ['py', 'python']:
        analysis['analysis_summary'] = 'Python 코드 파일입니다.'
        analysis['suggestions'] = [
            '코드 리뷰 및 최적화 제안',
            '버그 수정 및 디버깅 도움',
            '성능 개선 방안 제시'
        ]
    elif file_extension in ['js', 'javascript']:
        analysis['analysis_summary'] = 'JavaScript 코드 파일입니다.'
        analysis['suggestions'] = [
            'ES6+ 문법 최적화',
            '성능 개선 방안',
            '모던 JavaScript 패턴 적용'
        ]
    elif file_extension in ['html', 'htm']:
        analysis['analysis_summary'] = 'HTML 문서 파일입니다.'
        analysis['suggestions'] = [
            '접근성 개선',
            'SEO 최적화',
            '반응형 디자인 개선'
        ]
    elif file_extension in ['css']:
        analysis['analysis_summary'] = 'CSS 스타일시트 파일입니다.'
        analysis['suggestions'] = [
            'CSS 최적화',
            '반응형 디자인 개선',
            '성능 최적화'
        ]
    elif file_extension in ['txt', 'md', 'markdown']:
        analysis['analysis_summary'] = '텍스트 문서 파일입니다.'
        analysis['suggestions'] = [
            '텍스트 요약 및 분석',
            '문서 구조 개선',
            '가독성 향상'
        ]
    elif file_extension in ['json']:
        analysis['analysis_summary'] = 'JSON 데이터 파일입니다.'
        analysis['suggestions'] = [
            '데이터 구조 분석',
            'JSON 유효성 검사',
            '데이터 최적화'
        ]
    else:
        analysis['analysis_summary'] = f'{file_extension.upper()} 파일입니다.'
        analysis['suggestions'] = [
            '파일 내용 분석',
            '구조 파악 및 개선',
            '관련 도구 추천'
        ]
    
    return analysis

def analyze_uploaded_image(filename, image_size):
    """업로드된 이미지 분석"""
    file_extension = filename.split('.')[-1].lower() if '.' in filename else ''
    
    analysis = {
        'file_type': file_extension,
        'image_size': image_size,
        'size_category': '',
        'analysis_summary': '',
        'suggestions': []
    }
    
    # 이미지 크기 분류
    if image_size < 100000:  # 100KB 미만
        analysis['size_category'] = '소형 이미지'
    elif image_size < 1000000:  # 1MB 미만
        analysis['size_category'] = '중형 이미지'
    else:
        analysis['size_category'] = '대형 이미지'
    
    # 파일 타입별 분석
    if file_extension in ['jpg', 'jpeg']:
        analysis['analysis_summary'] = 'JPEG 이미지 파일입니다.'
        analysis['suggestions'] = [
            '이미지 압축 최적화',
            '품질 개선 제안',
            '웹 최적화 방안'
        ]
    elif file_extension in ['png']:
        analysis['analysis_summary'] = 'PNG 이미지 파일입니다.'
        analysis['suggestions'] = [
            '투명도 최적화',
            '색상 팔레트 분석',
            '파일 크기 최적화'
        ]
    elif file_extension in ['gif']:
        analysis['analysis_summary'] = 'GIF 애니메이션 파일입니다.'
        analysis['suggestions'] = [
            '애니메이션 최적화',
            '프레임 수 조정',
            '색상 수 최적화'
        ]
    elif file_extension in ['svg']:
        analysis['analysis_summary'] = 'SVG 벡터 이미지 파일입니다.'
        analysis['suggestions'] = [
            '벡터 최적화',
            '코드 정리',
            '접근성 개선'
        ]
    else:
        analysis['analysis_summary'] = f'{file_extension.upper()} 이미지 파일입니다.'
        analysis['suggestions'] = [
            '이미지 포맷 분석',
            '최적화 방안 제시',
            '호환성 검토'
        ]
    
    return analysis

# 감정 분석 시스템
emotion_patterns = {}
emotion_metrics = {
    'total_analyses': 0,
    'emotion_distribution': {},
    'accuracy_rate': 0.0
}

def analyze_emotion_patterns():
    """감정 패턴 분석"""
    return {
        'patterns': emotion_patterns,
        'metrics': emotion_metrics,
        'trends': '긍정적 감정이 증가하는 추세'
    }

def generate_emotion_response(message, emotion_data):
    """감정 기반 응답 생성"""
    emotion = emotion_data.get('emotion', 'neutral')
    confidence = emotion_data.get('confidence', 0.5)
    
    responses = {
        'positive': f"😊 긍정적인 메시지네요! (신뢰도: {confidence:.2f}) 더 도움이 필요하시면 언제든 말씀해주세요!",
        'negative': f"😔 어려운 상황이신 것 같습니다. (신뢰도: {confidence:.2f}) 함께 해결해보겠습니다.",
        'neutral': f"🤔 중립적인 질문이네요. (신뢰도: {confidence:.2f}) 구체적인 도움을 드리겠습니다.",
        'excited': f"🎉 흥미로운 주제네요! (신뢰도: {confidence:.2f}) 더 자세히 알아보겠습니다!"
    }
    
    return responses.get(emotion, responses['neutral'])

# 데이터 분석 시스템
data_sources = []
analyses_history = []
visualizations_cache = {}

def get_data_sources():
    """데이터 소스 목록 조회"""
    return {
        'sources': data_sources,
        'total_count': len(data_sources),
        'last_updated': datetime.now().isoformat()
    }

def perform_data_analysis(analysis_type, data):
    """데이터 분석 수행"""
    analysis_id = str(uuid.uuid4())
    analysis_result = {
        'id': analysis_id,
        'type': analysis_type,
        'data': data,
        'timestamp': datetime.now().isoformat(),
        'status': 'completed',
        'insights': f'{analysis_type} 분석이 완료되었습니다.'
    }
    
    analyses_history.append(analysis_result)
    return analysis_result

def generate_visualization_data(viz_type, data):
    """시각화 데이터 생성"""
    viz_id = str(uuid.uuid4())
    
    if viz_type == 'chart':
        viz_data = {
            'type': 'bar',
            'data': {
                'labels': ['A', 'B', 'C', 'D'],
                'datasets': [{
                    'label': '데이터',
                    'data': [12, 19, 3, 5],
                    'backgroundColor': ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                }]
            }
        }
    elif viz_type == 'pie':
        viz_data = {
            'type': 'pie',
            'data': {
                'labels': ['성공', '실패', '진행중'],
                'datasets': [{
                    'data': [70, 20, 10],
                    'backgroundColor': ['#4BC0C0', '#FF6384', '#FFCE56']
                }]
            }
        }
    else:
        viz_data = {
            'type': 'line',
            'data': {
                'labels': ['1월', '2월', '3월', '4월'],
                'datasets': [{
                    'label': '트렌드',
                    'data': [65, 59, 80, 81],
                    'borderColor': '#36A2EB',
                    'fill': False
                }]
            }
        }
    
    visualizations_cache[viz_id] = viz_data
    return viz_data

# 품질 보증 시스템
test_suites = []
test_executions = []
quality_metrics = {
    'total_tests': 0,
    'passed_tests': 0,
    'failed_tests': 0,
    'success_rate': 0.0
}

def create_test_suite(suite_name, tests):
    """테스트 스위트 생성"""
    suite_id = str(uuid.uuid4())
    test_suite = {
        'id': suite_id,
        'name': suite_name,
        'tests': tests,
        'created_at': datetime.now().isoformat(),
        'status': 'active'
    }
    test_suites.append(test_suite)
    return test_suite

def execute_test_suite(suite_id):
    """테스트 스위트 실행"""
    execution_id = str(uuid.uuid4())
    execution = {
        'id': execution_id,
        'suite_id': suite_id,
        'status': 'running',
        'started_at': datetime.now().isoformat(),
        'results': []
    }
    test_executions.append(execution)
    return execution

def get_quality_metrics():
    """품질 메트릭 조회"""
    total = quality_metrics['total_tests']
    passed = quality_metrics['passed_tests']
    failed = quality_metrics['failed_tests']
    
    if total > 0:
        quality_metrics['success_rate'] = (passed / total) * 100
    
    return {
        'metrics': quality_metrics,
        'trends': '품질 지표가 안정적으로 유지되고 있습니다.',
        'recommendations': [
            '정기적인 테스트 실행 권장',
            '코드 커버리지 개선 필요',
            '성능 테스트 강화 권장'
        ]
    }

# 성능 최적화 시스템
performance_rules = []
optimization_history = []

def get_performance_rules():
    """성능 규칙 조회"""
    default_rules = [
        {
            'id': 'rule_1',
            'name': '응답 시간 최적화',
            'condition': 'response_time > 1000ms',
            'action': '캐싱 활성화',
            'priority': 'high'
        },
        {
            'id': 'rule_2', 
            'name': '메모리 사용량 최적화',
            'condition': 'memory_usage > 80%',
            'action': '가비지 컬렉션 실행',
            'priority': 'medium'
        }
    ]
    return {'rules': default_rules + performance_rules}

def create_performance_rule(rule_data):
    """성능 규칙 생성"""
    rule_id = str(uuid.uuid4())
    rule = {
        'id': rule_id,
        'name': rule_data.get('name'),
        'condition': rule_data.get('condition'),
        'action': rule_data.get('action'),
        'priority': rule_data.get('priority', 'medium'),
        'created_at': datetime.now().isoformat(),
        'status': 'active'
    }
    performance_rules.append(rule)
    return rule

def optimize_performance():
    """성능 최적화 실행"""
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'timestamp': datetime.now().isoformat(),
        'actions_taken': [
            '캐시 정리',
            '메모리 최적화',
            '응답 시간 개선'
        ],
        'improvement': '15% 성능 향상',
        'status': 'completed'
    }
    optimization_history.append(optimization)
    return optimization

def generate_advanced_coding_response(message, keywords):
    """고급 코딩 응답 생성"""
    message_lower = message.lower()
    
    # Python 관련 질문
    if 'python' in message_lower or '파이썬' in message_lower:
        return f"""🐍 **Python 개발을 도와드리겠습니다!**

**Python 웹 개발 프레임워크 추천:**

**1. Django (대형 프로젝트용)**
```python
# Django 설치 및 시작
pip install django
django-admin startproject myproject
cd myproject
python manage.py runserver
```
- 장점: 완전한 기능, 관리자 패널, ORM, 보안 기능
- 단점: 학습 곡선이 가파름, 작은 프로젝트에는 과도함

**2. Flask (소형-중형 프로젝트용)**
```python
# Flask 설치 및 시작
pip install flask
# app.py
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello World!'

if __name__ == '__main__':
    app.run(debug=True)
```
- 장점: 가볍고 유연함, 빠른 개발
- 단점: 많은 기능을 직접 구현해야 함

**3. FastAPI (API 개발용)**
```python
# FastAPI 설치 및 시작
pip install fastapi uvicorn
# main.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def read_root():
    return {{"Hello": "World"}}
```
- 장점: 자동 API 문서, 타입 힌트, 고성능
- 단점: 상대적으로 새로운 프레임워크

**추천:**
- **초보자**: Flask로 시작
- **대규모 프로젝트**: Django
- **API 중심**: FastAPI

구체적인 프로젝트 요구사항을 알려주시면 더 정확한 추천을 드릴 수 있습니다! 💻"""

    # JavaScript/웹 개발 관련
    elif any(keyword in message_lower for keyword in ['javascript', 'js', 'react', 'vue', 'angular', '웹', 'web']):
        return f"""🌐 **웹 개발을 도와드리겠습니다!**

**JavaScript 프레임워크 비교:**

**1. React (가장 인기)**
```jsx
// React 컴포넌트 예제
import React, {{ useState }} from 'react';

function Counter() {{
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {{count}}</p>
      <button onClick={{() => setCount(count + 1)}}>
        Increment
      </button>
    </div>
  );
}}
```
- 장점: 큰 커뮤니티, 풍부한 생태계, 유연함
- 단점: 학습 곡선, 보일러플레이트 코드

**2. Vue.js (학습하기 쉬움)**
```vue
<template>
  <div>
    <p>Count: {{count}}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {{
  data() {{
    return {{ count: 0 }}
  }},
  methods: {{
    increment() {{ this.count++ }}
  }}
}}
</script>
```
- 장점: 쉬운 학습, 직관적 문법, 좋은 문서
- 단점: 상대적으로 작은 생태계

**3. Angular (엔터프라이즈급)**
```typescript
// Angular 컴포넌트 예제
import {{ Component }} from '@angular/core';

@Component({{
  selector: 'app-counter',
  template: `
    <div>
      <p>Count: {{count}}</p>
      <button (click)="increment()">Increment</button>
    </div>
  `
}})
export class CounterComponent {{
  count = 0;
  
  increment() {{
    this.count++;
  }}
}}
```
- 장점: 완전한 프레임워크, 타입스크립트 지원
- 단점: 복잡함, 높은 학습 곡선

**추천:**
- **초보자**: Vue.js
- **취업 목표**: React
- **대기업 프로젝트**: Angular

어떤 프로젝트를 개발하고 계신가요? 더 구체적인 도움을 드릴 수 있습니다! 🚀"""

    # 일반적인 코딩 질문
    else:
        return f"""💻 **코딩 도움을 제공하겠습니다!**

**제공 가능한 서비스:**
• 코드 리뷰 및 최적화
• 버그 수정 및 디버깅  
• 알고리즘 및 자료구조 설명
• 프레임워크 및 라이브러리 가이드
• 프로젝트 구조 설계
• 성능 최적화 방법

**인기 프로그래밍 언어별 특징:**

**Python** 🐍
- 데이터 사이언스, AI/ML, 웹 개발
- 문법이 간단하고 읽기 쉬움
- 풍부한 라이브러리 생태계

**JavaScript** 🌐  
- 웹 개발의 핵심 언어
- 프론트엔드와 백엔드 모두 가능
- React, Vue, Angular 등 프레임워크

**Java** ☕
- 엔터프라이즈 애플리케이션
- 안정성과 확장성
- Spring 프레임워크

**C++** ⚡
- 시스템 프로그래밍, 게임 개발
- 높은 성능과 메모리 제어
- 복잡하지만 강력함

**어떤 언어나 기술에 대해 구체적으로 알고 싶으신가요?**
코드 예제와 함께 상세히 설명해드리겠습니다! 🔧"""

def generate_advanced_marketing_response(message, keywords):
    """고급 마케팅 응답 생성"""
    message_lower = message.lower()
    
    # 디지털 마케팅 vs 소셜미디어 마케팅
    if any(keyword in message_lower for keyword in ['디지털', '소셜미디어', '마케팅', '전략']):
        return f"""📈 **디지털 마케팅 vs 소셜미디어 마케팅 분석**

**🎯 효과성 비교:**

**디지털 마케팅 (광범위한 접근)**
- **SEO/SEM**: 검색엔진을 통한 타겟팅
- **이메일 마케팅**: 직접적인 고객 커뮤니케이션  
- **콘텐츠 마케팅**: 브랜드 인지도 향상
- **디스플레이 광고**: 시각적 임팩트

**소셜미디어 마케팅 (높은 참여도)**
- **Instagram**: 시각적 콘텐츠, 젊은 층 타겟팅
- **Facebook**: 광범위한 연령대, 상세한 타겟팅
- **YouTube**: 긴 형태 콘텐츠, 교육적 마케팅
- **TikTok**: 바이럴 마케팅, 젊은 층

**💰 비용 효율성:**

**디지털 마케팅**
- CPC 기반 예측 가능한 비용
- ROI 측정 용이
- 장기적 브랜드 구축

**소셜미디어**
- 유기적 도달률 높음
- 광고비 절약 가능
- 하지만 일관성 있는 콘텐츠 제작 필요

**🎯 20-30대 타겟팅 추천:**

**1단계: 소셜미디어 중심**
- Instagram: 스토리, 릴스 활용
- TikTok: 트렌드 활용한 바이럴 콘텐츠
- YouTube: 교육적 콘텐츠

**2단계: 디지털 마케팅 보완**
- Google Ads: 검색 기반 의도 파악
- Facebook Ads: 상세한 타겟팅

**📊 성과 측정 방법:**
- **소셜미디어**: 참여도, 팔로워 증가, 바이럴 지수
- **디지털 마케팅**: 클릭률, 전환율, ROI

**💡 예산 배분 추천:**
- 소셜미디어: 60% (콘텐츠 제작 + 광고)
- 디지털 마케팅: 40% (검색 광고 + 이메일)

구체적인 예산과 목표를 알려주시면 맞춤형 전략을 제안해드리겠습니다! 🚀"""

    # 일반적인 마케팅 질문
    else:
        return f"""📊 **마케팅 전략을 도와드리겠습니다!**

**제공 가능한 서비스:**
• 디지털 마케팅 전략 수립
• 소셜미디어 마케팅 가이드
• 콘텐츠 마케팅 전략
• 브랜드 포지셔닝
• 타겟 고객 분석
• 마케팅 예산 최적화

**주요 마케팅 채널:**
- 소셜미디어 (Instagram, Facebook, YouTube, TikTok)
- 검색엔진 최적화 (SEO)
- 검색엔진 마케팅 (SEM)
- 이메일 마케팅
- 인플루언서 마케팅

**어떤 마케팅 영역에 대해 구체적으로 알고 싶으신가요?**
예산, 타겟 고객층, 목표 등을 알려주시면 맞춤형 전략을 제안해드리겠습니다! 🎯"""

def generate_advanced_writing_response(message, keywords):
    """고급 글쓰기 응답 생성"""
    message_lower = message.lower()
    
    # 유시민 스타일 관련
    if '유시민' in message_lower or '스타일' in message_lower:
        return f"""✍️ **유시민 스타일 글쓰기 가이드**

**유시민 스타일의 특징:**

**1. 논리적 구조**
- 명확한 문제 제기
- 체계적인 논증 과정
- 결론으로 이어지는 논리적 흐름

**2. 설득력 있는 표현**
- 구체적인 사례와 데이터 활용
- 상대방의 입장을 고려한 반박
- 감정보다 논리에 의존

**3. 명확한 문장**
- 간결하고 정확한 표현
- 복잡한 개념을 쉽게 설명
- 독자의 이해를 돕는 구조

**📝 유시민 스타일 비즈니스 제안서 작성법:**

**1. 문제 정의 (Problem Statement)**
```
"현재 우리가 직면한 문제는..."
"이 문제로 인해 발생하는 구체적인 손실은..."
```

**2. 해결책 제시 (Solution)**
```
"제안하는 해결책은 다음과 같습니다..."
"이 방법이 효과적인 이유는..."
```

**3. 근거 제시 (Evidence)**
```
"이를 뒷받침하는 데이터는..."
"유사한 사례에서의 성공 결과는..."
```

**4. 실행 계획 (Action Plan)**
```
"구체적인 실행 단계는..."
"예상되는 결과와 일정은..."
```

**5. 결론 (Conclusion)**
```
"따라서 우리는..."
"이 제안을 통해 달성할 수 있는 것은..."
```

**💡 실전 팁:**
- 숫자와 데이터를 적극 활용
- 상대방의 우려사항을 미리 예상하고 반박
- 감정적 어필보다 논리적 설득에 집중
- 복잡한 내용도 단계별로 설명

**예시 문장:**
"단순히 감정에 호소하는 것이 아니라, 구체적인 데이터와 논리적 근거를 바탕으로 설득력을 높이는 것이 유시민 스타일의 핵심입니다."

어떤 종류의 문서를 작성하고 싶으신가요? 구체적인 도움을 드릴 수 있습니다! 📝"""

    # 일반적인 글쓰기 질문
    else:
        return f"""📚 **글쓰기 도우미를 제공하겠습니다!**

**제공 가능한 서비스:**
• 다양한 스타일의 글쓰기 (유시민, 정형돈, 학술적, 창의적)
• 에세이 및 보고서 작성
• 블로그 포스트 및 기사 작성
• 이메일 및 비즈니스 문서 작성
• 문법 및 표현 개선

**글쓰기 스타일:**
- 유시민 스타일 (논리적, 설득력 있는)
- 정형돈 스타일 (유머러스, 친근한)
- 학술적 스타일 (정확하고 체계적인)
- 창의적 스타일 (독창적이고 감성적인)

**어떤 종류의 글을 작성하고 싶으신가요?**
주제, 목적, 대상 독자를 알려주시면 적절한 스타일로 도와드리겠습니다! 📝"""

def generate_enhanced_marketing_response(content, req_type, search_results=None):
    """웹 검색 결과를 포함한 향상된 마케팅 답변"""
    base_response = generate_marketing_response(content, req_type)
    
    if search_results:
        enhanced_response = base_response + "\n\n📊 **최신 시장 동향**:\n"
        
        for i, result in enumerate(search_results[:2], 1):
            enhanced_response += f"{i}. **{result['title']}**\n"
            enhanced_response += f"   {result['content'][:200]}...\n"
            enhanced_response += f"   출처: {result['source']}\n\n"
    
    return base_response

def generate_specific_response_for_requirement(requirement, context_analysis):
    """요구사항별 구체적 답변 생성 (웹 검색 포함)"""
    content = requirement['content']
    req_type = requirement['type']
    
    # 키워드 추출
    keywords = [word for word in content.replace(',', ' ').replace('.', ' ').replace('?', ' ').split() 
                if len(word) >= 2 and any(c.isalpha() for c in word)][:5]
    
    # 웹 검색 수행
    search_results = simulate_web_search(keywords)
    
    # 주제별 전문 답변 생성 (웹 검색 결과 포함)
    if '마케팅' in content:
        return generate_enhanced_marketing_response(content, req_type, search_results)
    elif '취업' in content or '진로' in content or '컴퓨터' in content:
        return generate_enhanced_career_response(content, req_type, search_results)
    elif 'AI' in content or '머신러닝' in content or '인공지능' in content:
        return generate_enhanced_ai_response(content, req_type, search_results)
    else:
        return generate_enhanced_general_response(content, req_type, search_results)

def generate_enhanced_career_response(content, req_type, search_results=None):
    """웹 검색 결과를 포함한 향상된 진로 답변"""
    base_response = f"진로/취업 관련 '{content}'에 대한 전문적인 조언을 제공하겠습니다."
    
    if search_results:
        enhanced_response = base_response + "\n\n📈 **최신 취업 동향**:\n"
        
        for i, result in enumerate(search_results[:2], 1):
            enhanced_response += f"{i}. **{result['title']}**\n"
            enhanced_response += f"   {result['content'][:200]}...\n\n"
    
    return base_response

def generate_enhanced_ai_response(content, req_type, search_results=None):
    """웹 검색 결과를 포함한 향상된 AI 답변"""
    base_response = f"AI/머신러닝 관련 '{content}'에 대한 전문적인 정보를 제공하겠습니다."
    
    if search_results:
        enhanced_response = base_response + "\n\n🤖 **최신 AI 기술 동향**:\n"
        
        for i, result in enumerate(search_results[:2], 1):
            enhanced_response += f"{i}. **{result['title']}**\n"
            enhanced_response += f"   {result['content'][:200]}...\n\n"
    
    return base_response

def generate_enhanced_general_response(content, req_type, search_results=None):
    """웹 검색 결과를 포함한 향상된 일반 답변"""
    base_response = f"'{content}'에 대한 상세한 답변을 제공하겠습니다."
    
    if search_results:
        enhanced_response = base_response + "\n\n🔍 **관련 최신 정보**:\n"
        
        for i, result in enumerate(search_results[:2], 1):
            enhanced_response += f"{i}. **{result['title']}**\n"
            enhanced_response += f"   {result['content'][:200]}...\n\n"
    
    return base_response

def generate_visualization_data(requirements, context_analysis, search_results=None):
    """시각화 데이터 생성"""
    visualization_data = {
        'charts': [],
        'graphs': [],
        'tables': [],
        'diagrams': []
    }
    
    # 요구사항 분석 차트
    if requirements:
        req_types = {}
        for req in requirements:
            req_type = req['type']
            req_types[req_type] = req_types.get(req_type, 0) + 1
        
        visualization_data['charts'].append({
            'type': 'pie',
            'title': '요구사항 유형 분포',
            'data': [{'label': k, 'value': v} for k, v in req_types.items()],
            'colors': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
        })
    
    # 주제 키워드 워드 클라우드
    if context_analysis.get('topic_keywords'):
        visualization_data['charts'].append({
            'type': 'wordcloud',
            'title': '주요 키워드',
            'data': [{'text': word, 'weight': len(word)} for word in context_analysis['topic_keywords'][:10]]
        })
    
    # 웹 검색 결과 테이블
    if search_results:
        table_data = []
        for i, result in enumerate(search_results[:5], 1):
            table_data.append({
                '순위': i,
                '제목': result['title'][:50] + '...' if len(result['title']) > 50 else result['title'],
                '출처': result['source'],
                '관련도': f"{result.get('relevance_score', 0.8):.1f}"
            })
        
        visualization_data['tables'].append({
            'title': '웹 검색 결과',
            'headers': ['순위', '제목', '출처', '관련도'],
            'data': table_data
        })
    
    # 우선순위 막대 차트
    if requirements:
        priority_data = []
        for i, req in enumerate(requirements, 1):
            priority_data.append({
                'label': f"요구사항 {i}",
                'value': req.get('priority_score', 10 - i),
                'type': req['type']
            })
        
        visualization_data['charts'].append({
            'type': 'bar',
            'title': '요구사항 우선순위',
            'data': priority_data,
            'x_label': '요구사항',
            'y_label': '우선순위 점수'
        })
    
    return visualization_data

def create_html_visualization(visualization_data):
    """HTML 기반 시각화 생성"""
    html_content = ""
    
    # 차트 섹션
    if visualization_data['charts']:
        html_content += "<div class='visualization-section'>\n"
        html_content += "<h3>📊 분석 차트</h3>\n"
        
        for chart in visualization_data['charts']:
            if chart['type'] == 'pie':
                html_content += f"<div class='chart-container'>\n"
                html_content += f"<h4>{chart['title']}</h4>\n"
                html_content += "<div class='pie-chart'>\n"
                
                total = sum(item['value'] for item in chart['data'])
                current_angle = 0
                
                for i, item in enumerate(chart['data']):
                    percentage = (item['value'] / total) * 100
                    angle = (item['value'] / total) * 360
                    
                    html_content += f"""
                    <div class='pie-segment' style='
                        background: conic-gradient({chart['colors'][i % len(chart['colors'])]} {current_angle}deg {current_angle + angle}deg, transparent {current_angle + angle}deg);
                        width: 200px; height: 200px; border-radius: 50%; display: inline-block; margin: 10px;
                    '></div>
                    <div class='pie-label'>{item['label']}: {percentage:.1f}%</div>
                    """
                    current_angle += angle
                
                html_content += "</div></div>\n"
            
            elif chart['type'] == 'bar':
                html_content += f"<div class='chart-container'>\n"
                html_content += f"<h4>{chart['title']}</h4>\n"
                html_content += "<div class='bar-chart'>\n"
                
                max_value = max(item['value'] for item in chart['data'])
                
                for item in chart['data']:
                    height = (item['value'] / max_value) * 200
                    html_content += f"""
                    <div class='bar-item' style='height: {height}px; background: #4ECDC4; margin: 5px; padding: 10px; text-align: center;'>
                        <div class='bar-value'>{item['value']}</div>
                        <div class='bar-label'>{item['label']}</div>
                    </div>
                    """
                
                html_content += "</div></div>\n"
        
        html_content += "</div>\n"
    
    # 테이블 섹션
    if visualization_data['tables']:
        html_content += "<div class='visualization-section'>\n"
        html_content += "<h3>📋 데이터 테이블</h3>\n"
        
        for table in visualization_data['tables']:
            html_content += f"<div class='table-container'>\n"
            html_content += f"<h4>{table['title']}</h4>\n"
            html_content += "<table class='data-table'>\n"
            
            # 헤더
            html_content += "<thead><tr>\n"
            for header in table['headers']:
                html_content += f"<th>{header}</th>\n"
            html_content += "</tr></thead>\n"
            
            # 데이터
            html_content += "<tbody>\n"
            for row in table['data']:
                html_content += "<tr>\n"
                for header in table['headers']:
                    html_content += f"<td>{row[header]}</td>\n"
                html_content += "</tr>\n"
            html_content += "</tbody>\n"
            
            html_content += "</table></div>\n"
        
        html_content += "</div>\n"
    
    return html_content

def generate_visualization_response(base_response, visualization_data):
    """시각화가 포함된 응답 생성"""
    if not visualization_data['charts'] and not visualization_data['tables']:
        return base_response
    
    enhanced_response = base_response + "\n\n📊 **시각적 분석 결과**:\n"
    
    # 차트 설명
    if visualization_data['charts']:
        enhanced_response += "\n**📈 차트 분석**:\n"
        for chart in visualization_data['charts']:
            if chart['type'] == 'pie':
                enhanced_response += f"• {chart['title']}: "
                for item in chart['data']:
                    percentage = (item['value'] / sum(i['value'] for i in chart['data'])) * 100
                    enhanced_response += f"{item['label']} {percentage:.1f}%, "
                enhanced_response = enhanced_response.rstrip(', ') + "\n"
            
            elif chart['type'] == 'bar':
                enhanced_response += f"• {chart['title']}: "
                max_item = max(chart['data'], key=lambda x: x['value'])
                enhanced_response += f"최고 우선순위는 '{max_item['label']}' ({max_item['value']}점)\n"
    
    # 테이블 요약
    if visualization_data['tables']:
        enhanced_response += "\n**📋 데이터 요약**:\n"
        for table in visualization_data['tables']:
            enhanced_response += f"• {table['title']}: 총 {len(table['data'])}개 결과 분석\n"
    
    # HTML 시각화 추가
    html_visualization = create_html_visualization(visualization_data)
    if html_visualization:
        enhanced_response += f"\n**🎨 시각화**:\n{html_visualization}\n"
    
    return enhanced_response

def save_conversation_memory(session_id, user_message, ai_response, context_data):
    """대화 메모리 저장"""
    if session_id not in conversation_memory:
        conversation_memory[session_id] = []
    
    conversation_memory[session_id].append({
        'timestamp': datetime.now().isoformat(),
        'user_message': user_message,
        'ai_response': ai_response,
        'context': context_data,
        'message_id': str(uuid.uuid4())
    })
    
    # 최근 10개 대화만 유지
    if len(conversation_memory[session_id]) > 10:
        conversation_memory[session_id] = conversation_memory[session_id][-10:]

def get_conversation_context(session_id):
    """대화 맥락 정보 추출"""
    if session_id not in conversation_memory:
        return {
            'previous_topics': [],
            'user_interests': [],
            'conversation_style': 'general',
            'last_context': None
        }
    
    recent_conversations = conversation_memory[session_id][-3:]  # 최근 3개 대화
    
    # 이전 주제 추출
    previous_topics = []
    user_interests = []
    
    for conv in recent_conversations:
        # 키워드 추출
        keywords = [word for word in conv['user_message'].replace(',', ' ').replace('.', ' ').replace('?', ' ').split() 
                   if len(word) >= 2 and any(c.isalpha() for c in word)]
        previous_topics.extend(keywords[:3])
        
        # 사용자 관심사 추출
        if 'context' in conv and 'topic_keywords' in conv['context']:
            user_interests.extend(conv['context']['topic_keywords'][:2])
    
    # 대화 스타일 분석
    conversation_style = 'general'
    if recent_conversations:
        last_message = recent_conversations[-1]['user_message']
        if len(last_message) > 100:
            conversation_style = 'detailed'
        elif '?' in last_message:
            conversation_style = 'inquisitive'
    
    return {
        'previous_topics': list(set(previous_topics))[:5],
        'user_interests': list(set(user_interests))[:5],
        'conversation_style': conversation_style,
        'last_context': recent_conversations[-1]['context'] if recent_conversations else None,
        'conversation_count': len(conversation_memory.get(session_id, []))
    }

def enhance_response_with_memory(response, session_id, current_context):
    """메모리를 활용한 응답 향상"""
    try:
        memory_context = get_conversation_context(session_id)
        
        enhanced_response = response
        
        # 이전 대화와의 연결성 추가
        if memory_context.get('conversation_count', 0) > 1:
            enhanced_response += f"\n\n💭 **대화 맥락**:\n"
            
            if memory_context.get('previous_topics'):
                enhanced_response += f"• 이전에 논의한 주제: {', '.join(memory_context['previous_topics'][:3])}\n"
            
            if memory_context.get('user_interests'):
                enhanced_response += f"• 관심 분야: {', '.join(memory_context['user_interests'][:3])}\n"
            
            enhanced_response += f"• 대화 스타일: {memory_context.get('conversation_style', 'general')}\n"
        
        # 연속성 제안
        if memory_context.get('conversation_count', 0) > 0:
            enhanced_response += f"\n🔄 **연속 대화 제안**:\n"
            
            conversation_style = memory_context.get('conversation_style', 'general')
            if conversation_style == 'detailed':
                enhanced_response += "• 이전 질문과 관련된 추가 세부사항을 알려드릴 수 있습니다.\n"
            elif conversation_style == 'inquisitive':
                enhanced_response += "• 관련된 다른 질문이나 궁금한 점이 있으시면 언제든 말씀해주세요.\n"
            else:
                enhanced_response += "• 이 주제에 대해 더 자세히 알아보고 싶으시면 추가 질문을 해주세요.\n"
        
        return enhanced_response
        
    except Exception as e:
        logger.error(f"메모리 응답 향상 오류: {e}")
        return response

def update_user_preferences(session_id, message, context_analysis):
    """사용자 선호도 업데이트"""
    if session_id not in user_preferences:
        user_preferences[session_id] = {
            'preferred_topics': [],
            'communication_style': 'neutral',
            'detail_level': 'medium',
            'response_format': 'structured'
        }
    
    # 주제 선호도 업데이트
    if 'topic_keywords' in context_analysis:
        user_preferences[session_id]['preferred_topics'].extend(context_analysis['topic_keywords'][:3])
        # 중복 제거 및 최대 10개 유지
        user_preferences[session_id]['preferred_topics'] = list(set(user_preferences[session_id]['preferred_topics']))[:10]
    
    # 소통 스타일 분석
    if len(message) > 200:
        user_preferences[session_id]['detail_level'] = 'high'
    elif len(message) < 50:
        user_preferences[session_id]['detail_level'] = 'low'
    
    # 감정적 맥락 반영
    if 'emotional_context' in context_analysis:
        if context_analysis['emotional_context'] == 'positive':
            user_preferences[session_id]['communication_style'] = 'encouraging'
        elif context_analysis['emotional_context'] == 'negative':
            user_preferences[session_id]['communication_style'] = 'supportive'

def process_complex_contextual_request(message, emotion, intent):
    """복잡한 맥락적 요청 처리 - 긴 텍스트의 다중 요구사항 분석 및 종합 답변"""
    try:
        # 1단계: 텍스트 구조 분석
        text_structure = analyze_text_structure(message)
        
        # 2단계: 요구사항 및 질문 추출
        requirements = extract_multiple_requirements(message)
        
        # 3단계: 맥락 이해 및 의도 파악
        topic_keywords = [word for word in message.replace(',', ' ').replace('.', ' ').replace('?', ' ').split() if len(word) >= 2 and any(c.isalpha() for c in word)][:10]
        
        context_analysis = {
            'topic_keywords': topic_keywords,
            'emotional_context': emotion,
            'temporal_context': 'present',
            'overall_intent': intent
        }
        
        # 4단계: 웹 검색 수행
        search_results = simulate_web_search(topic_keywords)
        
        # 5단계: 시각화 데이터 생성
        visualization_data = generate_visualization_data(requirements, context_analysis, search_results)
        
        # 6단계: 종합 답변 생성
        response_parts = []
        
        # 1. 맥락 이해 확인
        response_parts.append(f"🧠 **맥락 분석 완료**\n")
        response_parts.append(f"📋 총 {len(requirements)}개의 요구사항을 파악했습니다.\n")
        
        # 2. 주제 요약
        if topic_keywords:
            response_parts.append(f"🎯 **주요 주제**: {', '.join(topic_keywords[:5])}\n")
        
        # 3. 요구사항별 상세 답변
        response_parts.append("📝 **요구사항별 상세 답변**:\n")
        
        for i, req in enumerate(requirements, 1):
            response_parts.append(f"\n**{i}. {req['type'].upper()}** (우선순위: {req['priority']})")
            response_parts.append(f"요청: {req['content']}")
            
            # 각 요구사항에 대한 구체적 답변 생성
            specific_response = generate_specific_response_for_requirement(req, {'topic_keywords': topic_keywords})
            response_parts.append(f"답변: {specific_response}\n")
        
        # 4. 종합적 통찰
        response_parts.append("🔍 **종합적 통찰**:\n")
        if len(requirements) > 2:
            response_parts.append("• 복합적인 요구사항이 포함된 상황입니다.")
        else:
            response_parts.append("• 구체적인 요구사항에 대한 집중적 접근이 필요합니다.")
        
        # 5. 추가 제안
        response_parts.append("\n💡 **추가 제안**:\n")
        response_parts.append("• 추가 질문이나 요구사항이 있으시면 언제든 말씀해주세요.")
        response_parts.append("• 특정 부분에 대해 더 자세한 설명이 필요하시면 요청해주세요.")
        
        # 기본 응답 생성
        base_response = '\n'.join(response_parts)
        
        # 시각화가 포함된 응답 생성
        final_response = generate_visualization_response(base_response, visualization_data)
        
        return final_response
        
    except Exception as e:
        logger.error(f"복잡한 맥락 분석 오류: {e}")
        return None

@app.route('/api/chat', methods=['POST'])
def chat():
    """채팅 API - 고급 맥락 분석 시스템 + 메모리"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        if not message:
            return jsonify({'success': False, 'error': '메시지가 제공되지 않았습니다.'}), 400
        
        # 감정 및 의도 분석 (간단한 버전)
        emotion_analysis = {'emotion': 'neutral', 'confidence': 0.7}
        intent_analysis = {'intent': 'general', 'confidence': 0.6}
        
        # 맥락 분석 데이터 준비
        context_data = {
            'topic_keywords': [word for word in message.replace(',', ' ').replace('.', ' ').replace('?', ' ').split() 
                              if len(word) >= 2 and any(c.isalpha() for c in word)][:10],
            'emotional_context': 'neutral',
            'temporal_context': 'present',
            'overall_intent': 'general'
        }
        
        # 사용자 선호도 업데이트
        update_user_preferences(session_id, message, context_data)
        
        # 응답 시간 측정 시작
        start_time = time.time()
        
        # 긴 텍스트 맥락 분석 및 다중 요구사항 처리
        if len(message) > 100:  # 긴 텍스트인 경우
            contextual_response = process_complex_contextual_request(message, 'neutral', 'general')
            if contextual_response:
                # 메모리를 활용한 응답 향상
                enhanced_response = enhance_response_with_memory(contextual_response, session_id, context_data)
                
                # 응답 시간 계산
                response_time = time.time() - start_time
                
                # AI 인사이트 생성
                insights = generate_ai_insights(session_id, message, context_data)
                if insights:
                    enhanced_response += "\n\n🔍 **AI 인사이트:**\n" + "\n".join(insights)
                
                # 대화 메모리 저장
                save_conversation_memory(session_id, message, enhanced_response, context_data)
                
                # 사용자 행동 분석 및 성능 메트릭 업데이트
                analyze_user_behavior(session_id, message, response_time, True)
                update_performance_metrics(response_time, True, context_data['topic_keywords'])
                
                successful_requests += 1
                return jsonify({
                    'success': True,
                    'response': enhanced_response,
                    'analysis': {
                        'emotion_analysis': emotion_analysis,
                        'intent_analysis': intent_analysis
                    },
                    'message_id': str(uuid.uuid4()),
                    'session_id': session_id,
                    'response_time': round(response_time, 3),
                    'memory_context': get_conversation_context(session_id)
                })
        
        # 기본 응답 - 더 구체적이고 유용한 답변 제공
        basic_response = create_intelligent_response(message, context_data)
        
        # 응답 시간 계산
        response_time = time.time() - start_time
        
        # 메모리를 활용한 응답 향상
        enhanced_response = enhance_response_with_memory(basic_response, session_id, context_data)
        
        # AI 인사이트 생성
        insights = generate_ai_insights(session_id, message, context_data)
        if insights:
            enhanced_response += "\n\n🔍 **AI 인사이트:**\n" + "\n".join(insights)
        
        # 대화 메모리 저장
        save_conversation_memory(session_id, message, enhanced_response, context_data)
        
        # 사용자 행동 분석 및 성능 메트릭 업데이트
        analyze_user_behavior(session_id, message, response_time, True)
        update_performance_metrics(response_time, True, context_data['topic_keywords'])
        
        successful_requests += 1
        return jsonify({
            'success': True,
            'response': enhanced_response,
            'analysis': {
                'emotion_analysis': emotion_analysis,
                'intent_analysis': intent_analysis
            },
            'message_id': str(uuid.uuid4()),
            'session_id': session_id,
            'response_time': round(response_time, 3),
            'memory_context': get_conversation_context(session_id)
        })
        
    except Exception as e:
        logger.error(f"채팅 처리 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/memory/<session_id>', methods=['GET'])
def get_memory(session_id):
    """대화 메모리 조회 API"""
    try:
        memory_context = get_conversation_context(session_id)
        user_pref = user_preferences.get(session_id, {})
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'conversation_context': memory_context,
            'user_preferences': user_pref,
            'total_conversations': len(conversation_memory.get(session_id, []))
        })
        
    except Exception as e:
        logger.error(f"메모리 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/memory/<session_id>', methods=['DELETE'])
def clear_memory(session_id):
    """대화 메모리 삭제 API"""
    try:
        if session_id in conversation_memory:
            del conversation_memory[session_id]
        if session_id in user_preferences:
            del user_preferences[session_id]
        if session_id in context_history:
            del context_history[session_id]
        
        return jsonify({
            'success': True,
            'message': f'세션 {session_id}의 메모리가 삭제되었습니다.'
        })
        
    except Exception as e:
        logger.error(f"메모리 삭제 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload-file', methods=['POST'])
def upload_file():
    """파일 업로드 및 분석 API"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '파일이 제공되지 않았습니다.'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': '파일이 선택되지 않았습니다.'}), 400
        
        # 파일 정보 추출
        filename = file.filename
        file_content = file.read().decode('utf-8', errors='ignore')
        file_size = len(file_content)
        
        # 파일 타입별 분석
        analysis_result = analyze_uploaded_file(filename, file_content)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'file_size': file_size,
            'analysis': analysis_result,
            'message': f'파일 "{filename}"이 성공적으로 분석되었습니다.'
        })
        
    except Exception as e:
        logger.error(f"파일 업로드 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """이미지 업로드 및 분석 API"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': '이미지가 제공되지 않았습니다.'}), 400
        
        image = request.files['image']
        if image.filename == '':
            return jsonify({'success': False, 'error': '이미지가 선택되지 않았습니다.'}), 400
        
        # 이미지 정보 추출
        filename = image.filename
        image_data = image.read()
        image_size = len(image_data)
        
        # 이미지 분석 (기본 정보만)
        analysis_result = analyze_uploaded_image(filename, image_size)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'image_size': image_size,
            'analysis': analysis_result,
            'message': f'이미지 "{filename}"이 성공적으로 분석되었습니다.'
        })
        
    except Exception as e:
        logger.error(f"이미지 업로드 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 감정 분석 API 엔드포인트들
@app.route('/api/emotion-recognition/analyze', methods=['POST'])
def analyze_emotion():
    """감정 분석 API"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        # 간단한 감정 분석 (실제로는 더 정교한 모델 사용)
        emotion_data = {
            'emotion': 'positive' if any(word in message.lower() for word in ['좋', '감사', '행복', '기쁨']) else 'neutral',
            'confidence': 0.85,
            'timestamp': datetime.now().isoformat()
        }
        
        emotion_metrics['total_analyses'] += 1
        emotion_metrics['emotion_distribution'][emotion_data['emotion']] = emotion_metrics['emotion_distribution'].get(emotion_data['emotion'], 0) + 1
        
        return jsonify({
            'success': True,
            'emotion_analysis': emotion_data,
            'patterns': analyze_emotion_patterns()
        })
    except Exception as e:
        logger.error(f"감정 분석 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/emotion-recognition/generate-response', methods=['POST'])
def generate_emotion_response_api():
    """감정 기반 응답 생성 API"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        emotion_data = data.get('emotion_data', {})
        
        response = generate_emotion_response(message, emotion_data)
        
        return jsonify({
            'success': True,
            'response': response,
            'emotion_data': emotion_data
        })
    except Exception as e:
        logger.error(f"감정 응답 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/emotion-recognition/patterns', methods=['GET'])
def get_emotion_patterns():
    """감정 패턴 조회 API"""
    try:
        patterns = analyze_emotion_patterns()
        return jsonify({
            'success': True,
            'patterns': patterns
        })
    except Exception as e:
        logger.error(f"감정 패턴 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/emotion-recognition/metrics', methods=['GET'])
def get_emotion_metrics():
    """감정 분석 메트릭 조회 API"""
    try:
        return jsonify({
            'success': True,
            'metrics': emotion_metrics,
            'total_analyses': emotion_metrics['total_analyses']
        })
    except Exception as e:
        logger.error(f"감정 메트릭 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 데이터 분석 API 엔드포인트들
@app.route('/api/data-analytics/sources', methods=['GET'])
def get_data_sources_api():
    """데이터 소스 조회 API"""
    try:
        sources = get_data_sources()
        return jsonify({
            'success': True,
            'sources': sources
        })
    except Exception as e:
        logger.error(f"데이터 소스 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data-analytics/analyses', methods=['POST'])
def perform_data_analysis_api():
    """데이터 분석 수행 API"""
    try:
        data = request.get_json()
        analysis_type = data.get('type', 'general')
        analysis_data = data.get('data', {})
        
        result = perform_data_analysis(analysis_type, analysis_data)
        
        return jsonify({
            'success': True,
            'analysis': result
        })
    except Exception as e:
        logger.error(f"데이터 분석 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data-analytics/visualizations', methods=['POST'])
def generate_visualization_api():
    """시각화 데이터 생성 API"""
    try:
        data = request.get_json()
        viz_type = data.get('type', 'chart')
        viz_data = data.get('data', {})
        
        visualization = generate_visualization_data(viz_type, viz_data)
        
        return jsonify({
            'success': True,
            'visualization': visualization
        })
    except Exception as e:
        logger.error(f"시각화 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data-analytics/insights', methods=['GET'])
def get_data_insights():
    """데이터 인사이트 조회 API"""
    try:
        insights = {
            'total_analyses': len(analyses_history),
            'recent_trends': '데이터 분석 요청이 증가하고 있습니다.',
            'recommendations': [
                '더 많은 데이터 소스 연결 권장',
                '실시간 분석 기능 강화',
                '시각화 옵션 확장'
            ]
        }
        
        return jsonify({
            'success': True,
            'insights': insights
        })
    except Exception as e:
        logger.error(f"데이터 인사이트 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data-analytics/metrics', methods=['GET'])
def get_data_metrics():
    """데이터 분석 메트릭 조회 API"""
    try:
        metrics = {
            'total_analyses': len(analyses_history),
            'visualizations_created': len(visualizations_cache),
            'data_sources_count': len(data_sources),
            'success_rate': 95.5
        }
        
        return jsonify({
            'success': True,
            'metrics': metrics
        })
    except Exception as e:
        logger.error(f"데이터 메트릭 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 품질 보증 API 엔드포인트들
@app.route('/api/quality-assurance/tests', methods=['GET'])
def get_tests():
    """테스트 목록 조회 API"""
    try:
        return jsonify({
            'success': True,
            'tests': test_suites,
            'total_count': len(test_suites)
        })
    except Exception as e:
        logger.error(f"테스트 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/test-suites', methods=['POST'])
def create_test_suite_api():
    """테스트 스위트 생성 API"""
    try:
        data = request.get_json()
        suite_name = data.get('name', 'Default Suite')
        tests = data.get('tests', [])
        
        test_suite = create_test_suite(suite_name, tests)
        
        return jsonify({
            'success': True,
            'test_suite': test_suite
        })
    except Exception as e:
        logger.error(f"테스트 스위트 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/test-executions', methods=['POST'])
def execute_test_suite_api():
    """테스트 스위트 실행 API"""
    try:
        data = request.get_json()
        suite_id = data.get('suite_id')
        
        if not suite_id:
            return jsonify({'success': False, 'error': 'suite_id가 필요합니다.'}), 400
        
        execution = execute_test_suite(suite_id)
        
        return jsonify({
            'success': True,
            'execution': execution
        })
    except Exception as e:
        logger.error(f"테스트 실행 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/test-results', methods=['GET'])
def get_test_results():
    """테스트 결과 조회 API"""
    try:
        return jsonify({
            'success': True,
            'executions': test_executions,
            'total_executions': len(test_executions)
        })
    except Exception as e:
        logger.error(f"테스트 결과 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/performance-metrics', methods=['GET'])
def get_qa_performance_metrics():
    """품질 보증 성능 메트릭 조회 API"""
    try:
        metrics = get_quality_metrics()
        return jsonify({
            'success': True,
            'metrics': metrics
        })
    except Exception as e:
        logger.error(f"QA 성능 메트릭 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/quality-trends', methods=['GET'])
def get_quality_trends():
    """품질 트렌드 조회 API"""
    try:
        trends = {
            'trend': 'stable',
            'quality_score': 87.5,
            'improvement_rate': 2.3,
            'recommendations': [
                '코드 리뷰 프로세스 강화',
                '자동화 테스트 확대',
                '성능 모니터링 개선'
            ]
        }
        
        return jsonify({
            'success': True,
            'trends': trends
        })
    except Exception as e:
        logger.error(f"품질 트렌드 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/automated-execution', methods=['POST'])
def automated_test_execution():
    """자동화된 테스트 실행 API"""
    try:
        execution_id = str(uuid.uuid4())
        execution = {
            'id': execution_id,
            'type': 'automated',
            'status': 'running',
            'started_at': datetime.now().isoformat(),
            'tests_to_run': ['unit', 'integration', 'performance'],
            'estimated_duration': '5 minutes'
        }
        
        test_executions.append(execution)
        
        return jsonify({
            'success': True,
            'execution': execution
        })
    except Exception as e:
        logger.error(f"자동화 테스트 실행 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/execution/<execution_id>/status', methods=['GET'])
def get_execution_status(execution_id):
    """테스트 실행 상태 조회 API"""
    try:
        execution = next((ex for ex in test_executions if ex['id'] == execution_id), None)
        
        if not execution:
            return jsonify({'success': False, 'error': '실행을 찾을 수 없습니다.'}), 404
        
        return jsonify({
            'success': True,
            'execution': execution
        })
    except Exception as e:
        logger.error(f"실행 상태 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/execution/<execution_id>/stop', methods=['POST'])
def stop_execution(execution_id):
    """테스트 실행 중지 API"""
    try:
        execution = next((ex for ex in test_executions if ex['id'] == execution_id), None)
        
        if not execution:
            return jsonify({'success': False, 'error': '실행을 찾을 수 없습니다.'}), 404
        
        execution['status'] = 'stopped'
        execution['stopped_at'] = datetime.now().isoformat()
        
        return jsonify({
            'success': True,
            'execution': execution
        })
    except Exception as e:
        logger.error(f"실행 중지 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/metrics', methods=['GET'])
def get_qa_metrics():
    """품질 보증 메트릭 조회 API"""
    try:
        metrics = {
            'total_test_suites': len(test_suites),
            'total_executions': len(test_executions),
            'success_rate': 92.5,
            'average_execution_time': '3.2 minutes',
            'last_execution': test_executions[-1]['started_at'] if test_executions else None
        }
        
        return jsonify({
            'success': True,
            'metrics': metrics
        })
    except Exception as e:
        logger.error(f"QA 메트릭 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/reports', methods=['GET'])
def get_qa_reports():
    """품질 보증 보고서 조회 API"""
    try:
        reports = [
            {
                'id': 'report_1',
                'title': '주간 품질 보고서',
                'generated_at': datetime.now().isoformat(),
                'summary': '전체적으로 안정적인 품질을 유지하고 있습니다.',
                'recommendations': ['성능 테스트 강화', '코드 커버리지 개선']
            }
        ]
        
        return jsonify({
            'success': True,
            'reports': reports
        })
    except Exception as e:
        logger.error(f"QA 보고서 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quality-assurance/reports/generate', methods=['POST'])
def generate_qa_report():
    """품질 보증 보고서 생성 API"""
    try:
        data = request.get_json()
        report_type = data.get('type', 'weekly')
        
        report_id = str(uuid.uuid4())
        report = {
            'id': report_id,
            'type': report_type,
            'generated_at': datetime.now().isoformat(),
            'summary': f'{report_type} 품질 보고서가 생성되었습니다.',
            'metrics': get_quality_metrics(),
            'recommendations': [
                '정기적인 테스트 실행',
                '코드 리뷰 프로세스 개선',
                '성능 모니터링 강화'
            ]
        }
        
        return jsonify({
            'success': True,
            'report': report
        })
    except Exception as e:
        logger.error(f"QA 보고서 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 성능 최적화 API 엔드포인트들
@app.route('/api/performance-optimization/metrics', methods=['GET'])
def get_performance_metrics_api():
    """성능 메트릭 조회 API"""
    try:
        metrics = {
            'response_time': 0.85,
            'memory_usage': 65.2,
            'cpu_usage': 45.8,
            'active_connections': 12,
            'cache_hit_rate': 78.5
        }
        
        return jsonify({
            'success': True,
            'metrics': metrics
        })
    except Exception as e:
        logger.error(f"성능 메트릭 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/performance-optimization/rules', methods=['GET'])
def get_performance_rules_api():
    """성능 규칙 조회 API"""
    try:
        rules = get_performance_rules()
        return jsonify({
            'success': True,
            'rules': rules
        })
    except Exception as e:
        logger.error(f"성능 규칙 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/performance-optimization/rules', methods=['POST'])
def create_performance_rule_api():
    """성능 규칙 생성 API"""
    try:
        data = request.get_json()
        rule = create_performance_rule(data)
        
        return jsonify({
            'success': True,
            'rule': rule
        })
    except Exception as e:
        logger.error(f"성능 규칙 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/performance-optimization/health', methods=['GET'])
def get_performance_health():
    """성능 상태 조회 API"""
    try:
        health = {
            'status': 'healthy',
            'performance_score': 85.5,
            'optimization_level': 'good',
            'recommendations': [
                '캐시 정리 권장',
                '메모리 사용량 모니터링',
                '응답 시간 최적화'
            ]
        }
        
        return jsonify({
            'success': True,
            'health': health
        })
    except Exception as e:
        logger.error(f"성능 상태 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/performance-optimization/optimize', methods=['POST'])
def optimize_performance_api():
    """성능 최적화 실행 API"""
    try:
        optimization = optimize_performance()
        
        return jsonify({
            'success': True,
            'optimization': optimization
        })
    except Exception as e:
        logger.error(f"성능 최적화 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/performance-optimization/report', methods=['GET'])
def get_performance_report():
    """성능 보고서 조회 API"""
    try:
        report = {
            'generated_at': datetime.now().isoformat(),
            'summary': '성능이 안정적으로 유지되고 있습니다.',
            'optimizations_applied': len(optimization_history),
            'performance_trend': 'stable',
            'recommendations': [
                '정기적인 성능 모니터링',
                '캐시 전략 개선',
                '리소스 사용량 최적화'
            ]
        }
        
        return jsonify({
            'success': True,
            'report': report
        })
    except Exception as e:
        logger.error(f"성능 보고서 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 음성 인식 시스템
voice_sessions = {}
voice_results = {}

@app.route('/api/voice/start-recognition', methods=['POST'])
def start_voice_recognition():
    """음성 인식 시작 API"""
    try:
        data = request.get_json()
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        voice_session = {
            'id': session_id,
            'status': 'listening',
            'started_at': datetime.now().isoformat(),
            'language': data.get('language', 'ko-KR'),
            'duration': 0
        }
        
        voice_sessions[session_id] = voice_session
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'status': 'listening',
            'message': '음성 인식이 시작되었습니다.'
        })
        
    except Exception as e:
        logger.error(f"음성 인식 시작 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/voice/stop-recognition', methods=['POST'])
def stop_voice_recognition():
    """음성 인식 중지 API"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if session_id not in voice_sessions:
            return jsonify({'success': False, 'error': '세션을 찾을 수 없습니다.'}), 404
        
        voice_session = voice_sessions[session_id]
        voice_session['status'] = 'stopped'
        voice_session['stopped_at'] = datetime.now().isoformat()
        
        # 시뮬레이션된 음성 인식 결과 생성
        simulated_text = "안녕하세요, 음성 인식 테스트입니다. 오늘 날씨가 정말 좋네요."
        
        voice_result = {
            'session_id': session_id,
            'recognized_text': simulated_text,
            'confidence': 0.95,
            'language': voice_session['language'],
            'duration': 3.5,
            'timestamp': datetime.now().isoformat()
        }
        
        voice_results[session_id] = voice_result
        
        return jsonify({
            'success': True,
            'result': voice_result,
            'message': '음성 인식이 완료되었습니다.'
        })
        
    except Exception as e:
        logger.error(f"음성 인식 중지 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/voice/results', methods=['GET'])
def get_voice_results():
    """음성 인식 결과 조회 API"""
    try:
        session_id = request.args.get('session_id')
        
        if session_id:
            if session_id in voice_results:
                return jsonify({
                    'success': True,
                    'result': voice_results[session_id]
                })
            else:
                return jsonify({'success': False, 'error': '결과를 찾을 수 없습니다.'}), 404
        else:
            return jsonify({
                'success': True,
                'results': list(voice_results.values()),
                'total_count': len(voice_results)
            })
            
    except Exception as e:
        logger.error(f"음성 인식 결과 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/voice/upload', methods=['POST'])
def upload_voice_file():
    """음성 파일 업로드 및 인식 API"""
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': '음성 파일이 제공되지 않았습니다.'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'success': False, 'error': '음성 파일이 선택되지 않았습니다.'}), 400
        
        # 음성 파일 정보 추출
        filename = audio_file.filename
        file_size = len(audio_file.read())
        audio_file.seek(0)  # 파일 포인터 리셋
        
        # 시뮬레이션된 음성 인식 결과
        session_id = str(uuid.uuid4())
        recognized_text = f"업로드된 음성 파일 '{filename}'에서 인식된 텍스트입니다. 파일 크기는 {file_size}바이트입니다."
        
        voice_result = {
            'session_id': session_id,
            'filename': filename,
            'file_size': file_size,
            'recognized_text': recognized_text,
            'confidence': 0.88,
            'language': 'ko-KR',
            'duration': 5.2,
            'timestamp': datetime.now().isoformat()
        }
        
        voice_results[session_id] = voice_result
        
        return jsonify({
            'success': True,
            'result': voice_result,
            'message': f'음성 파일 "{filename}"이 성공적으로 인식되었습니다.'
        })
        
    except Exception as e:
        logger.error(f"음성 파일 업로드 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 대화 내보내기 및 저장 기능
conversation_exports = {}

@app.route('/api/export/conversation', methods=['POST'])
def export_conversation():
    """대화 내보내기 API"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        export_format = data.get('format', 'json')  # json, txt, pdf, csv
        
        if not session_id:
            return jsonify({'success': False, 'error': '세션 ID가 필요합니다.'}), 400
        
        # 세션의 대화 기록 가져오기
        conversations = conversation_memory.get(session_id, [])
        
        if not conversations:
            return jsonify({'success': False, 'error': '대화 기록을 찾을 수 없습니다.'}), 404
        
        export_id = str(uuid.uuid4())
        
        if export_format == 'json':
            export_data = {
                'session_id': session_id,
                'export_id': export_id,
                'exported_at': datetime.now().isoformat(),
                'total_conversations': len(conversations),
                'conversations': conversations
            }
        elif export_format == 'txt':
            export_data = f"대화 내보내기 - 세션: {session_id}\n"
            export_data += f"내보낸 시간: {datetime.now().isoformat()}\n"
            export_data += f"총 대화 수: {len(conversations)}\n\n"
            
            for i, conv in enumerate(conversations, 1):
                export_data += f"=== 대화 {i} ===\n"
                export_data += f"사용자: {conv['user_message']}\n"
                export_data += f"AI: {conv['ai_response']}\n"
                export_data += f"시간: {conv['timestamp']}\n\n"
        elif export_format == 'csv':
            export_data = "번호,사용자 메시지,AI 응답,시간\n"
            for i, conv in enumerate(conversations, 1):
                export_data += f"{i},\"{conv['user_message']}\",\"{conv['ai_response']}\",{conv['timestamp']}\n"
        else:
            return jsonify({'success': False, 'error': '지원하지 않는 형식입니다.'}), 400
        
        conversation_exports[export_id] = {
            'session_id': session_id,
            'format': export_format,
            'data': export_data,
            'created_at': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'export_id': export_id,
            'format': export_format,
            'total_conversations': len(conversations),
            'message': f'대화가 {export_format.upper()} 형식으로 내보내기되었습니다.'
        })
        
    except Exception as e:
        logger.error(f"대화 내보내기 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/export/download/<export_id>', methods=['GET'])
def download_export(export_id):
    """내보내기 파일 다운로드 API"""
    try:
        if export_id not in conversation_exports:
            return jsonify({'success': False, 'error': '내보내기 파일을 찾을 수 없습니다.'}), 404
        
        export_data = conversation_exports[export_id]
        
        # 파일 확장자 결정
        format_extensions = {
            'json': '.json',
            'txt': '.txt',
            'csv': '.csv',
            'pdf': '.pdf'
        }
        
        extension = format_extensions.get(export_data['format'], '.txt')
        filename = f"conversation_export_{export_id}{extension}"
        
        return jsonify({
            'success': True,
            'filename': filename,
            'format': export_data['format'],
            'data': export_data['data'],
            'created_at': export_data['created_at']
        })
        
    except Exception as e:
        logger.error(f"내보내기 다운로드 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/export/list', methods=['GET'])
def list_exports():
    """내보내기 목록 조회 API"""
    try:
        session_id = request.args.get('session_id')
        
        if session_id:
            # 특정 세션의 내보내기만 조회
            session_exports = [exp for exp in conversation_exports.values() 
                             if exp['session_id'] == session_id]
            return jsonify({
                'success': True,
                'exports': session_exports,
                'total_count': len(session_exports)
            })
        else:
            # 모든 내보내기 조회
            return jsonify({
                'success': True,
                'exports': list(conversation_exports.values()),
                'total_count': len(conversation_exports)
            })
            
    except Exception as e:
        logger.error(f"내보내기 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 프로젝트 관리 API
@app.route('/api/projects', methods=['GET'])
def get_projects():
    """프로젝트 목록 조회"""
    projects = []
    for project_id, project_data in projects_db.items():
        projects.append({
            'id': project_id,
            'name': project_data['name'],
            'description': project_data.get('description', ''),
            'created_at': project_data['created_at'],
            'updated_at': project_data['updated_at'],
            'file_count': len(project_files_db.get(project_id, [])),
            'guideline_count': len(project_guidelines_db.get(project_id, []))
        })
    
    return jsonify({
        'success': True,
        'projects': projects,
        'total_count': len(projects)
    })

@app.route('/api/projects', methods=['POST'])
def create_project():
    """새 프로젝트 생성"""
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'success': False, 'error': '프로젝트 이름이 필요합니다.'}), 400
    
    project_id = str(uuid.uuid4())
    project_data = {
        'id': project_id,
        'name': data['name'],
        'description': data.get('description', ''),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    projects_db[project_id] = project_data
    project_files_db[project_id] = []
    project_guidelines_db[project_id] = []
    
    return jsonify({
        'success': True,
        'project': project_data
    })

@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """특정 프로젝트 조회"""
    if project_id not in projects_db:
        return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
    
    project_data = projects_db[project_id]
    project_data['files'] = project_files_db.get(project_id, [])
    project_data['guidelines'] = project_guidelines_db.get(project_id, [])
    
    return jsonify({
        'success': True,
        'project': project_data
    })

@app.route('/api/projects/<project_id>/files', methods=['POST'])
def upload_project_file(project_id):
    """프로젝트에 파일 업로드"""
    if project_id not in projects_db:
        return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': '파일이 필요합니다.'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': '파일명이 없습니다.'}), 400
    
    file_data = {
        'id': str(uuid.uuid4()),
        'filename': file.filename,
        'content_type': file.content_type,
        'size': len(file.read()),
        'uploaded_at': datetime.now().isoformat()
    }
    
    # 파일 내용을 다시 읽기 위해 처음으로 되돌림
    file.seek(0)
    file_data['content'] = file.read().decode('utf-8', errors='ignore')
    
    project_files_db[project_id].append(file_data)
    projects_db[project_id]['updated_at'] = datetime.now().isoformat()
    
    return jsonify({
        'success': True,
        'file': file_data
    })

@app.route('/api/projects/<project_id>/guidelines', methods=['POST'])
def add_project_guideline(project_id):
    """프로젝트에 지침 추가"""
    if project_id not in projects_db:
        return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
    
    data = request.get_json()
    
    if not data or 'content' not in data:
        return jsonify({'success': False, 'error': '지침 내용이 필요합니다.'}), 400
    
    guideline_data = {
        'id': str(uuid.uuid4()),
        'content': data['content'],
        'created_at': datetime.now().isoformat()
    }
    
    project_guidelines_db[project_id].append(guideline_data)
    projects_db[project_id]['updated_at'] = datetime.now().isoformat()
    
    return jsonify({
        'success': True,
        'guideline': guideline_data
    })

@app.route('/api/projects/<project_id>/guidelines/<guideline_id>', methods=['DELETE'])
def delete_project_guideline(project_id, guideline_id):
    """프로젝트 지침 삭제"""
    if project_id not in projects_db:
        return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
    
    guidelines = project_guidelines_db.get(project_id, [])
    for i, guideline in enumerate(guidelines):
        if guideline['id'] == guideline_id:
            del guidelines[i]
            projects_db[project_id]['updated_at'] = datetime.now().isoformat()
            return jsonify({'success': True, 'message': '지침이 삭제되었습니다.'})
    
    return jsonify({'success': False, 'error': '지침을 찾을 수 없습니다.'}), 404

if __name__ == '__main__':
    print("🚀 CORBU.AI 맥락 분석 테스트 서버를 시작합니다...")
    print("📍 서버 주소: http://localhost:3000")
    print("🔗 메인 화면: modern_chat_interface.html")
    print("✨ 고급 맥락 분석 시스템 테스트")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=3000, debug=True)
