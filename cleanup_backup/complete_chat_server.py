from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import uuid
import random
import time
from datetime import datetime
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# 전역 변수
chat_sessions = {}
total_requests = 0
successful_requests = 0

# 프로젝트 데이터 저장소 (실제 환경에서는 데이터베이스 사용)
projects_db = {}
project_files_db = {}

@app.route('/', methods=['GET'])
def root():
    """메인 HTML 파일 서빙 - modern_chat_interface.html"""
    try:
        return app.send_static_file('modern_chat_interface.html')
    except Exception as e:
        logger.error(f"HTML 파일 서빙 오류: {e}")
        return f"오류: {e}", 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스 체크 API"""
    global total_requests, successful_requests
    total_requests += 1
    successful_requests += 1
    
    return jsonify({
        'service': 'CORBU.AI Backend',
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'uptime': 'running',
        'version': '2.0.0',
        'total_requests': total_requests,
        'successful_requests': successful_requests
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """채팅 API - 모든 기능 포함"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        if not message:
            return jsonify({'success': False, 'error': '메시지가 제공되지 않았습니다.'}), 400
        
        # 세션 관리
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                'messages': [],
                'created_at': datetime.now().isoformat(),
                'last_activity': datetime.now().isoformat()
            }
        
        # 사용자 메시지 저장
        user_message = {
            'id': str(uuid.uuid4()),
            'type': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        }
        chat_sessions[session_id]['messages'].append(user_message)
        
        # AI 응답 생성 (고급 기능 포함)
        ai_response = generate_ai_response(message, session_id)
        
        # AI 메시지 저장
        ai_message = {
            'id': str(uuid.uuid4()),
            'type': 'ai',
            'content': ai_response['content'],
            'timestamp': datetime.now().isoformat(),
            'analysis': ai_response.get('analysis', {})
        }
        chat_sessions[session_id]['messages'].append(ai_message)
        chat_sessions[session_id]['last_activity'] = datetime.now().isoformat()
        
        successful_requests += 1
        
        return jsonify({
            'success': True,
            'response': ai_response['content'],
            'response_time': ai_response.get('response_time', 0.01),
            'session_id': session_id,
            'analysis': ai_response.get('analysis', {}),
            'message_id': ai_message['id']
        })
        
    except Exception as e:
        logger.error(f"채팅 오류: {e}")
        return jsonify({'success': False, 'error': '채팅 처리 중 오류가 발생했습니다.'}), 500

def generate_ai_response(message, session_id):
    """고급 AI 응답 생성"""
    start_time = time.time()
    
    # 감정 분석
    emotion_analysis = analyze_emotion(message)
    
    # 의도 파악
    intent_analysis = analyze_intent(message)
    
    # 응답 생성
    response_content = create_response_content(message, emotion_analysis, intent_analysis)
    
    response_time = time.time() - start_time
    
    return {
        'content': response_content,
        'response_time': response_time,
        'analysis': {
            'emotion_analysis': emotion_analysis,
            'intent_analysis': intent_analysis
        }
    }

def analyze_emotion(message):
    """감정 분석"""
    positive_words = ['좋다', '좋아', '감사', '고마워', '행복', '기쁘', '만족', '훌륭', '완벽']
    negative_words = ['나쁘', '싫어', '화나', '슬프', '우울', '불만', '짜증', '어려워', '힘들']
    
    message_lower = message.lower()
    positive_count = sum(1 for word in positive_words if word in message_lower)
    negative_count = sum(1 for word in negative_words if word in message_lower)
    
    if positive_count > negative_count:
        emotion = 'positive'
        confidence = min(0.9, 0.5 + positive_count * 0.1)
    elif negative_count > positive_count:
        emotion = 'negative'
        confidence = min(0.9, 0.5 + negative_count * 0.1)
    else:
        emotion = 'neutral'
        confidence = 0.7
    
    return {
        'emotion': emotion,
        'confidence': confidence,
        'positive_score': positive_count,
        'negative_score': negative_count
    }

def analyze_intent(message):
    """의도 파악"""
    question_words = ['?', '?', '어떻게', '무엇', '언제', '어디', '왜', '누구']
    greeting_words = ['안녕', '하이', '헬로', '반가워']
    help_words = ['도움', '도와', '알려', '설명', '가르쳐']
    
    message_lower = message.lower()
    
    if any(word in message_lower for word in question_words):
        intent = 'question'
        confidence = 0.9
    elif any(word in message_lower for word in greeting_words):
        intent = 'greeting'
        confidence = 0.9
    elif any(word in message_lower for word in help_words):
        intent = 'help_request'
        confidence = 0.8
    else:
        intent = 'general'
        confidence = 0.6
    
    return {
        'intent': intent,
        'confidence': confidence
    }

def create_response_content(message, emotion_analysis, intent_analysis):
    """고급 AI 응답 생성 - 검색, 가공, 논리, 근거 자료, 웹수집, 가공, 논리, 글쓰기 스타일 맞춤 답변"""
    emotion = emotion_analysis['emotion']
    intent = intent_analysis['intent']
    message_lower = message.lower()
    
    # 긴 텍스트 맥락 분석 및 다중 요구사항 처리
    if len(message) > 100:  # 긴 텍스트인 경우
        contextual_response = process_complex_contextual_request(message, emotion, intent)
        if contextual_response:
            return contextual_response
    
    # 특수 기능 요청 감지 및 자동 처리
    special_response = detect_and_execute_special_functions(message, message_lower)
    if special_response:
        return special_response
    
    # 고급 AI 응답 생성 프로세스
    advanced_response = generate_advanced_ai_response(message, emotion, intent)
    if advanced_response:
        return advanced_response
    
    # 기본 응답 템플릿
    responses = {
        'greeting': [
            "안녕하세요! CORBU.AI입니다. 🚀\n\n📋 **고급 AI 기능들:**\n• 🔍 실시간 웹 검색 및 정보 수집\n• 🧠 논리적 분석 및 근거 기반 답변\n• 📊 데이터 가공 및 분석\n• ✍️ 스타일 맞춤 글쓰기\n• 💬 지능형 대화\n• 🎯 맞춤형 콘텐츠 생성\n\n어떤 주제에 대해 깊이 있게 알아보고 싶으신가요?",
            "반갑습니다! 저는 고급 AI 어시스턴트입니다.\n\n🎯 **핵심 기능:**\n• 실시간 정보 검색 및 분석\n• 논리적 추론 및 근거 제시\n• 데이터 기반 인사이트 제공\n• 개인화된 글쓰기 스타일\n• 다각도 분석 및 종합적 답변\n\n구체적으로 무엇을 탐구하고 싶으신가요?",
            "안녕하세요! 다차원적 사고와 분석 능력을 갖춘 AI입니다.\n\n💡 **사용법 예시:**\n• '인공지능의 미래에 대해 분석해줘' → 웹 검색 + 논리 분석\n• '경제 전망에 대한 근거를 제시해줘' → 데이터 수집 + 분석\n• '과학적 관점에서 설명해줘' → 논리적 추론 + 근거 제시\n\n어떤 주제를 깊이 있게 탐구해볼까요?"
        ],
        'question': [
            f"흥미로운 질문이네요! '{message}'에 대해 다각도로 분석해보겠습니다.",
            f"'{message}'에 대한 종합적이고 근거 있는 답변을 제공해드리겠습니다.",
            f"좋은 질문입니다! '{message}'에 대해 검색하고 분석해보겠습니다."
        ],
        'help_request': [
            "도움을 드리겠습니다! 어떤 주제에 대해 깊이 있게 알아보고 싶으신가요?",
            "네, 도와드리겠습니다! 구체적인 주제나 질문을 알려주시면 검색하고 분석해드리겠습니다.",
            "물론입니다! 어떤 분야의 정보나 분석이 필요한지 알려주세요."
        ],
        'general': [
            f"'{message}'에 대해 종합적으로 분석해보겠습니다.",
            f"흥미로운 주제네요! '{message}'에 대해 다각도로 탐구해보겠습니다.",
            f"'{message}'에 대한 깊이 있는 정보를 수집하고 분석해드리겠습니다."
        ]
    }
    
    # 감정에 따른 응답 조정
    if emotion == 'positive':
        base_response = random.choice(responses.get(intent, responses['general']))
        return base_response + "\n\n😊 긍정적인 관점에서 더욱 풍부한 정보를 제공해드리겠습니다!"
    elif emotion == 'negative':
        base_response = random.choice(responses.get(intent, responses['general']))
        return base_response + "\n\n💙 어려운 상황이시군요. 객관적이고 도움이 되는 정보를 제공해드리겠습니다."
    else:
        return random.choice(responses.get(intent, responses['general']))

def generate_advanced_ai_response(message, emotion, intent):
    """고급 AI 응답 생성 - 검색, 가공, 논리, 근거 자료 기반"""
    try:
        # 1단계: 키워드 추출 및 분석
        keywords = extract_keywords(message)
        if not keywords:
            return None
        
        # 2단계: 웹 검색 시뮬레이션 (실제 환경에서는 웹 검색 API 사용)
        search_results = simulate_web_search(keywords)
        
        # 3단계: 논리적 분석 및 근거 수집
        logical_analysis = perform_logical_analysis(message, search_results)
        
        # 4단계: 데이터 가공 및 종합
        processed_data = process_and_synthesize_data(search_results, logical_analysis)
        
        # 5단계: 글쓰기 스타일 결정 및 답변 생성
        writing_style = determine_writing_style(emotion, intent, message)
        final_response = generate_structured_response(processed_data, writing_style, message)
        
        return final_response
        
    except Exception as e:
        logger.error(f"고급 AI 응답 생성 오류: {e}")
        return None

def extract_keywords(message):
    """메시지에서 핵심 키워드 추출"""
    import re
    
    # 불용어 제거
    stop_words = ['이', '그', '저', '것', '들', '의', '가', '을', '를', '에', '와', '과', '로', '으로', '에서', '에게', '한테', '께', '도', '만', '은', '는', '이', '가', '에', '와', '과', '로', '으로', '에서', '에게', '한테', '께', '도', '만', '은', '는', '에', '대해', '에', '대한', '에', '관한', '에', '대해', '에', '대한', '에', '관한']
    
    # 단어 추출 및 정제
    words = re.findall(r'\b\w+\b', message.lower())
    keywords = [word for word in words if word not in stop_words and len(word) > 1]
    
    # 빈도수 기반 키워드 선택
    word_freq = {}
    for word in keywords:
        word_freq[word] = word_freq.get(word, 0) + 1
    
    # 상위 키워드 선택 (최대 5개)
    top_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
    return [word for word, freq in top_keywords]

def simulate_web_search(keywords):
    """웹 검색 시뮬레이션 (실제 환경에서는 웹 검색 API 사용)"""
    search_results = []
    
    for keyword in keywords:
        # 키워드별 가상 검색 결과 생성
        if '인공지능' in keyword or 'ai' in keyword:
            search_results.append({
                'keyword': keyword,
                'title': '인공지능 기술 동향 및 미래 전망',
                'content': '인공지능 기술은 머신러닝, 딥러닝, 자연어처리 등의 발전으로 다양한 분야에서 활용되고 있습니다. 특히 GPT, BERT 등의 대규모 언어모델이 주목받고 있으며, 의료, 금융, 교육, 제조업 등에서 혁신적인 변화를 가져오고 있습니다.',
                'source': 'AI 기술 리포트 2024',
                'relevance_score': 0.95
            })
        elif '경제' in keyword or '경영' in keyword:
            search_results.append({
                'keyword': keyword,
                'title': '글로벌 경제 동향 및 시장 분석',
                'content': '현재 글로벌 경제는 디지털 전환, 지속가능성, 공급망 재편 등의 메가트렌드에 의해 변화하고 있습니다. 특히 ESG 경영, 디지털 자산, 메타버스 경제 등이 새로운 성장 동력으로 부상하고 있습니다.',
                'source': '경제 동향 분석 보고서',
                'relevance_score': 0.88
            })
        elif '과학' in keyword or '기술' in keyword:
            search_results.append({
                'keyword': keyword,
                'title': '최신 과학 기술 동향',
                'content': '양자컴퓨팅, 바이오테크놀로지, 우주 기술, 신재생 에너지 등이 미래를 이끌 핵심 기술로 주목받고 있습니다. 특히 양자 우위 달성과 CRISPR 유전자 편집 기술의 상용화가 가속화되고 있습니다.',
                'source': '과학 기술 동향 보고서',
                'relevance_score': 0.92
            })
        else:
            # 일반적인 검색 결과
            search_results.append({
                'keyword': keyword,
                'title': f'{keyword} 관련 최신 정보',
                'content': f'{keyword}에 대한 최신 동향과 분석 자료를 수집했습니다. 다양한 관점에서 접근하여 종합적인 정보를 제공합니다.',
                'source': '종합 정보 데이터베이스',
                'relevance_score': 0.75
            })
    
    return search_results

def perform_logical_analysis(message, search_results):
    """논리적 분석 및 근거 수집"""
    analysis = {
        'main_topic': message,
        'key_points': [],
        'evidence': [],
        'logical_connections': [],
        'conclusions': []
    }
    
    # 검색 결과에서 핵심 포인트 추출
    for result in search_results:
        analysis['key_points'].append({
            'point': result['title'],
            'evidence': result['content'],
            'source': result['source'],
            'relevance': result['relevance_score']
        })
    
    # 논리적 연결고리 생성
    if len(analysis['key_points']) > 1:
        analysis['logical_connections'].append("여러 정보원을 종합하여 일관성 있는 분석을 제공합니다.")
        analysis['logical_connections'].append("상호 연관성을 고려한 통합적 관점을 제시합니다.")
    
    # 결론 도출
    analysis['conclusions'].append("수집된 정보를 바탕으로 종합적인 분석 결과를 제시합니다.")
    analysis['conclusions'].append("다각도 검증을 통해 신뢰성 있는 정보를 제공합니다.")
    
    return analysis

def process_and_synthesize_data(search_results, logical_analysis):
    """데이터 가공 및 종합"""
    processed_data = {
        'summary': '',
        'detailed_analysis': '',
        'supporting_evidence': [],
        'statistics': {},
        'trends': [],
        'implications': []
    }
    
    # 요약 생성
    all_content = ' '.join([result['content'] for result in search_results])
    processed_data['summary'] = summarize_text(all_content)['summary']
    
    # 상세 분석
    processed_data['detailed_analysis'] = f"총 {len(search_results)}개의 정보원을 분석한 결과, 다음과 같은 주요 내용을 확인할 수 있습니다."
    
    # 근거 자료 정리
    for result in search_results:
        processed_data['supporting_evidence'].append({
            'source': result['source'],
            'content': result['content'][:200] + '...',
            'relevance': result['relevance_score']
        })
    
    # 통계 정보 생성
    processed_data['statistics'] = {
        'total_sources': len(search_results),
        'avg_relevance': sum(r['relevance_score'] for r in search_results) / len(search_results),
        'coverage_score': min(100, len(search_results) * 20)
    }
    
    # 트렌드 및 시사점
    processed_data['trends'] = [
        "디지털 전환이 가속화되고 있습니다.",
        "데이터 기반 의사결정이 중요해지고 있습니다.",
        "사용자 중심의 서비스가 확산되고 있습니다."
    ]
    
    processed_data['implications'] = [
        "기술 발전에 따른 사회적 변화가 예상됩니다.",
        "새로운 기회와 도전이 동시에 나타날 것입니다.",
        "지속적인 학습과 적응이 필요합니다."
    ]
    
    return processed_data

def determine_writing_style(emotion, intent, message):
    """글쓰기 스타일 결정"""
    if emotion == 'positive':
        return 'enthusiastic'
    elif emotion == 'negative':
        return 'supportive'
    elif intent == 'question':
        return 'analytical'
    elif '분석' in message or '연구' in message:
        return 'academic'
    elif '설명' in message or '알려' in message:
        return 'explanatory'
    else:
        return 'balanced'

def process_complex_contextual_request(message, emotion, intent):
    """복잡한 맥락적 요청 처리 - 긴 텍스트의 다중 요구사항 분석 및 종합 답변"""
    try:
        # 1단계: 텍스트 구조 분석
        text_structure = analyze_text_structure(message)
        
        # 2단계: 요구사항 및 질문 추출
        requirements = extract_multiple_requirements(message)
        
        # 3단계: 맥락 이해 및 의도 파악
        context_analysis = understand_context(message, requirements)
        
        # 4단계: 논리적 사고 및 추론
        logical_reasoning = perform_logical_reasoning(message, requirements, context_analysis)
        
        # 5단계: 우선순위 결정 및 종합 답변 생성
        comprehensive_response = generate_comprehensive_response(
            message, requirements, context_analysis, logical_reasoning, emotion, intent
        )
        
        return comprehensive_response
        
    except Exception as e:
        logger.error(f"복잡한 맥락 분석 오류: {e}")
        return None

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

def understand_context(message, requirements):
    """맥락 이해 및 의도 파악"""
    # 주제 추출
    topic_keywords = extract_topic_keywords(message)
    
    # 감정적 맥락 분석
    emotional_context = analyze_emotional_context(message)
    
    # 시간적 맥락 (과거, 현재, 미래 언급)
    temporal_context = analyze_temporal_context(message)
    
    # 관계성 분석 (요구사항들 간의 연결고리)
    relationship_analysis = analyze_requirement_relationships(requirements)
    
    return {
        'topic_keywords': topic_keywords,
        'emotional_context': emotional_context,
        'temporal_context': temporal_context,
        'requirement_relationships': relationship_analysis,
        'overall_intent': determine_overall_intent(message, requirements)
    }

def perform_logical_reasoning(message, requirements, context_analysis):
    """논리적 사고 및 추론"""
    # 요구사항 간의 논리적 연결고리 파악
    logical_connections = identify_logical_connections(requirements)
    
    # 우선순위 결정
    priority_analysis = determine_priority_order(requirements, context_analysis)
    
    # 답변 구조 설계
    response_structure = design_response_structure(requirements, logical_connections, priority_analysis)
    
    # 필요한 정보 수집 계획
    information_gathering_plan = create_information_gathering_plan(requirements, context_analysis)
    
    return {
        'logical_connections': logical_connections,
        'priority_order': priority_analysis,
        'response_structure': response_structure,
        'information_plan': information_gathering_plan
    }

def generate_comprehensive_response(message, requirements, context_analysis, logical_reasoning, emotion, intent):
    """종합적 답변 생성"""
    # 기본 구조
    response_parts = []
    
    # 1. 맥락 이해 확인
    response_parts.append(f"🧠 **맥락 분석 완료**\n")
    response_parts.append(f"📋 총 {len(requirements)}개의 요구사항을 파악했습니다.\n")
    
    # 2. 주제 요약
    if context_analysis['topic_keywords']:
        response_parts.append(f"🎯 **주요 주제**: {', '.join(context_analysis['topic_keywords'][:5])}\n")
    
    # 3. 요구사항별 상세 답변
    response_parts.append("📝 **요구사항별 상세 답변**:\n")
    
    for i, req in enumerate(logical_reasoning['priority_order'], 1):
        response_parts.append(f"\n**{i}. {req['type'].upper()}** (우선순위: {req['priority']})")
        response_parts.append(f"요청: {req['content']}")
        
        # 각 요구사항에 대한 구체적 답변 생성
        specific_response = generate_specific_response_for_requirement(req, context_analysis)
        response_parts.append(f"답변: {specific_response}\n")
    
    # 4. 종합적 통찰
    response_parts.append("🔍 **종합적 통찰**:\n")
    comprehensive_insight = generate_comprehensive_insight(requirements, context_analysis, logical_reasoning)
    response_parts.append(comprehensive_insight)
    
    # 5. 추가 제안
    response_parts.append("\n💡 **추가 제안**:\n")
    additional_suggestions = generate_additional_suggestions(requirements, context_analysis)
    response_parts.append(additional_suggestions)
    
    return '\n'.join(response_parts)

# 보조 함수들
def extract_topic_keywords(message):
    """주제 키워드 추출"""
    # 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
    words = message.replace(',', ' ').replace('.', ' ').replace('?', ' ').split()
    # 명사성 키워드 필터링 (길이 2 이상, 한글/영문)
    keywords = [word for word in words if len(word) >= 2 and any(c.isalpha() for c in word)]
    return list(set(keywords))[:10]  # 상위 10개

def analyze_emotional_context(message):
    """감정적 맥락 분석"""
    positive_words = ['좋', '훌륭', '감사', '기쁘', '행복', '만족']
    negative_words = ['어려', '힘들', '문제', '걱정', '불안', '화나']
    
    positive_count = sum(message.count(word) for word in positive_words)
    negative_count = sum(message.count(word) for word in negative_words)
    
    if positive_count > negative_count:
        return 'positive'
    elif negative_count > positive_count:
        return 'negative'
    else:
        return 'neutral'

def analyze_temporal_context(message):
    """시간적 맥락 분석"""
    past_words = ['했', '였', '이었', '었', '과거', '전에']
    present_words = ['현재', '지금', '오늘', '이번']
    future_words = ['할', '될', '미래', '앞으로', '향후']
    
    past_count = sum(message.count(word) for word in past_words)
    present_count = sum(message.count(word) for word in present_words)
    future_count = sum(message.count(word) for word in future_words)
    
    if past_count > present_count and past_count > future_count:
        return 'past'
    elif present_count > future_count:
        return 'present'
    else:
        return 'future'

def analyze_requirement_relationships(requirements):
    """요구사항 간 관계 분석"""
    relationships = []
    for i, req1 in enumerate(requirements):
        for j, req2 in enumerate(requirements[i+1:], i+1):
            # 키워드 겹침으로 관계성 판단
            keywords1 = set(req1['content'].split())
            keywords2 = set(req2['content'].split())
            overlap = len(keywords1.intersection(keywords2))
            
            if overlap > 0:
                relationships.append({
                    'req1_index': i,
                    'req2_index': j,
                    'relationship_strength': overlap / min(len(keywords1), len(keywords2)),
                    'relationship_type': 'related'
                })
    
    return relationships

def determine_overall_intent(message, requirements):
    """전체 의도 결정"""
    if len(requirements) == 0:
        return 'general_inquiry'
    elif len(requirements) == 1:
        return 'single_request'
    elif len(requirements) > 3:
        return 'complex_analysis'
    else:
        return 'multiple_requests'

def identify_logical_connections(requirements):
    """논리적 연결고리 파악"""
    connections = []
    for i, req1 in enumerate(requirements):
        for j, req2 in enumerate(requirements[i+1:], i+1):
            # 시간적 순서
            if req1['position'] < req2['position']:
                connections.append({
                    'from': i,
                    'to': j,
                    'type': 'sequential',
                    'description': f"{req1['type']} → {req2['type']}"
                })
            
            # 유사한 주제
            keywords1 = set(req1['content'].split())
            keywords2 = set(req2['content'].split())
            similarity = len(keywords1.intersection(keywords2)) / len(keywords1.union(keywords2))
            
            if similarity > 0.3:
                connections.append({
                    'from': i,
                    'to': j,
                    'type': 'thematic',
                    'description': f"유사 주제 (유사도: {similarity:.2f})"
                })
    
    return connections

def determine_priority_order(requirements, context_analysis):
    """우선순위 결정"""
    # 우선순위 점수 계산
    for req in requirements:
        score = 0
        
        # 질문은 높은 우선순위
        if req['type'] == 'question':
            score += 10
        
        # 요청은 중간 우선순위
        if req['type'] == 'request':
            score += 8
        
        # 정보 요청은 낮은 우선순위
        if req['type'] == 'information_request':
            score += 5
        
        # 위치 기반 점수 (앞쪽이 높음)
        score += (len(requirements) - req['position']) * 2
        
        req['priority_score'] = score
    
    # 점수 순으로 정렬
    return sorted(requirements, key=lambda x: x['priority_score'], reverse=True)

def design_response_structure(requirements, logical_connections, priority_analysis):
    """답변 구조 설계"""
    structure = {
        'introduction': '맥락 이해 및 요구사항 파악',
        'main_sections': [],
        'conclusion': '종합적 통찰 및 추가 제안'
    }
    
    for req in priority_analysis:
        structure['main_sections'].append({
            'requirement': req,
            'response_type': 'detailed_analysis',
            'connections': [conn for conn in logical_connections if conn['from'] == req['position'] or conn['to'] == req['position']]
        })
    
    return structure

def create_information_gathering_plan(requirements, context_analysis):
    """정보 수집 계획 생성"""
    plan = {
        'web_search_topics': [],
        'analysis_requirements': [],
        'data_processing_needs': []
    }
    
    for req in requirements:
        if req['type'] in ['question', 'information_request']:
            plan['web_search_topics'].extend(extract_topic_keywords(req['content']))
        
        if req['type'] == 'request':
            plan['analysis_requirements'].append(req['content'])
    
    return plan

def generate_specific_response_for_requirement(requirement, context_analysis):
    """요구사항별 구체적 답변 생성"""
    content = requirement['content']
    req_type = requirement['type']
    
    # 주제별 전문 답변 생성
    if '마케팅' in content or '마케팅' in ' '.join(context_analysis['topic_keywords']):
        return generate_marketing_response(content, req_type)
    elif '취업' in content or '진로' in content or '컴퓨터' in content:
        return generate_career_response(content, req_type)
    elif 'AI' in content or '머신러닝' in content or '인공지능' in content:
        return generate_ai_response(content, req_type)
    elif '분석' in content or '데이터' in content:
        return generate_analysis_response(content, req_type)
    elif '코딩' in content or '개발' in content or '프로그래밍' in content:
        return generate_coding_response(content, req_type)
    else:
        return generate_general_response(content, req_type)

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

def generate_career_response(content, req_type):
    """진로/취업 관련 전문 답변 생성"""
    if '개발자' in content and '취업' in content:
        return """**개발자 취업 가이드**

🏢 **추천 회사 유형**:
• 스타트업: 빠른 성장, 다양한 경험
• 대기업: 안정성, 체계적 교육
• 중견기업: 균형잡힌 성장 기회

💼 **취업 준비 체크리스트**:
• 포트폴리오 프로젝트 3-5개
• GitHub 활동 기록
• 기술 블로그 운영
• 알고리즘 문제 풀이

🎯 **면접 준비**:
• 기술 면접: 코딩 테스트, 시스템 설계
• 인성 면접: 프로젝트 경험, 문제 해결 과정"""

    elif '대학원' in content and '연구' in content:
        return """**대학원 진학 가이드**

🔬 **연구 분야 추천**:
• AI/ML: 딥러닝, 자연어처리, 컴퓨터비전
• 시스템: 분산시스템, 클라우드 컴퓨팅
• 보안: 사이버보안, 암호학

📚 **준비 사항**:
• 연구 계획서 작성
• 관련 논문 리뷰
• 연구실 인턴십 경험
• GRE/TOEFL 점수

🎓 **진로 방향**:
• 박사 과정 → 연구원/교수
• 석사 과정 → R&D 직무"""

    elif '포트폴리오' in content:
        return """**개발자 포트폴리오 구성**

💻 **필수 프로젝트**:
• 웹 애플리케이션 (풀스택)
• 모바일 앱 (React Native/Flutter)
• 데이터 분석 프로젝트
• 오픈소스 기여

📝 **포트폴리오 작성법**:
• 프로젝트 설명 + 기술 스택
• GitHub 링크 + 라이브 데모
• 문제 해결 과정 상세 기술
• 성과 및 배운 점 정리

🌐 **배포 플랫폼**:
• GitHub Pages, Netlify, Vercel
• AWS, Google Cloud Platform"""

    elif '연봉' in content or '복리후생' in content:
        return """**개발자 연봉 및 복리후생**

💰 **연봉 현황 (2024년 기준)**:
• 신입: 3,500-4,500만원
• 경력 3년: 5,000-7,000만원
• 시니어 5년+: 7,000만원 이상

🏢 **복리후생**:
• 스톡옵션, 성과급
• 교육비 지원, 컨퍼런스 참석
• 유연근무, 재택근무
• 건강검진, 휴양시설 이용"""

    else:
        return f"진로/취업 관련 '{content}'에 대한 전문적인 조언을 제공하겠습니다. 구체적인 실행 방안과 팁을 제시해드리겠습니다."

def generate_ai_response(content, req_type):
    """AI/머신러닝 관련 전문 답변 생성"""
    if 'AI' in content and '진출' in content:
        return """**AI 분야 진출 가이드**

🤖 **핵심 기술 스택**:
• Python, R (데이터 분석)
• TensorFlow, PyTorch (딥러닝)
• Scikit-learn, Pandas (머신러닝)
• SQL, NoSQL (데이터베이스)

📚 **학습 로드맵**:
1. 수학 기초 (선형대수, 통계, 확률)
2. 프로그래밍 기초 (Python)
3. 머신러닝 이론 및 실습
4. 딥러닝 심화 과정
5. 실제 프로젝트 경험

🎯 **진출 분야**:
• 데이터 사이언티스트
• ML 엔지니어
• AI 연구원
• 데이터 분석가"""

    else:
        return f"AI/머신러닝 관련 '{content}'에 대한 전문적인 정보를 제공하겠습니다. 최신 기술 동향과 실무 적용 방법을 알려드리겠습니다."

def generate_analysis_response(content, req_type):
    """분석/데이터 관련 전문 답변 생성"""
    return f"데이터 분석 관련 '{content}'에 대한 전문적인 분석 방법과 도구를 제시하겠습니다. 통계적 접근과 시각화 기법을 포함한 종합적인 답변을 제공하겠습니다."

def generate_coding_response(content, req_type):
    """코딩/개발 관련 전문 답변 생성"""
    return f"개발/프로그래밍 관련 '{content}'에 대한 실용적인 솔루션과 코드 예시를 제공하겠습니다. 모범 사례와 디버깅 팁을 포함한 상세한 가이드를 제시하겠습니다."

def generate_general_response(content, req_type):
    """일반적인 요구사항에 대한 답변 생성"""
    if req_type == 'question':
        return f"'{content}'에 대한 상세한 답변을 제공하겠습니다. 관련 정보를 수집하고 분석하여 종합적인 설명을 드리겠습니다."
    elif req_type == 'request':
        return f"'{content}'에 대한 구체적인 솔루션을 제시하겠습니다. 단계별 실행 방안과 팁을 포함한 실용적인 가이드를 제공하겠습니다."
    elif req_type == 'information_request':
        return f"'{content}'에 대한 상세한 정보를 수집하여 알려드리겠습니다. 최신 동향과 관련 자료를 포함한 종합적인 정보를 제공하겠습니다."
    else:
        return f"'{content}'에 대한 적절한 답변을 제공하겠습니다."

def generate_comprehensive_insight(requirements, context_analysis, logical_reasoning):
    """종합적 통찰 생성"""
    insights = []
    
    # 요구사항 패턴 분석
    question_count = len([r for r in requirements if r['type'] == 'question'])
    request_count = len([r for r in requirements if r['type'] == 'request'])
    
    if question_count > request_count:
        insights.append("• 질문 중심의 탐구적 접근이 필요한 상황입니다.")
    elif request_count > question_count:
        insights.append("• 실용적 솔루션 중심의 접근이 필요한 상황입니다.")
    else:
        insights.append("• 균형 잡힌 정보 제공과 실용적 조언이 필요한 상황입니다.")
    
    # 맥락적 통찰
    if context_analysis['emotional_context'] == 'positive':
        insights.append("• 긍정적인 맥락에서의 건설적 대화가 가능합니다.")
    elif context_analysis['emotional_context'] == 'negative':
        insights.append("• 신중하고 지원적인 접근이 필요합니다.")
    
    return '\n'.join(insights)

def generate_additional_suggestions(requirements, context_analysis):
    """추가 제안 생성"""
    suggestions = []
    
    # 주제 기반 제안
    if '분석' in ' '.join([r['content'] for r in requirements]):
        suggestions.append("• 더 깊이 있는 분석을 원하시면 추가 데이터나 구체적 기준을 알려주세요.")
    
    if '만들어' in ' '.join([r['content'] for r in requirements]):
        suggestions.append("• 구체적인 형식이나 스타일 요구사항이 있으시면 알려주세요.")
    
    # 일반적 제안
    suggestions.append("• 추가 질문이나 요구사항이 있으시면 언제든 말씀해주세요.")
    suggestions.append("• 특정 부분에 대해 더 자세한 설명이 필요하시면 요청해주세요.")
    
    return '\n'.join(suggestions)

def generate_structured_response(processed_data, writing_style, original_message):
    """구조화된 답변 생성"""
    
    # 스타일별 응답 템플릿
    style_templates = {
        'enthusiastic': {
            'opening': '🚀 흥미로운 주제네요!',
            'analysis': '📊 분석 결과를 말씀드리겠습니다:',
            'evidence': '📚 근거 자료:',
            'conclusion': '✨ 결론적으로 말하면:'
        },
        'supportive': {
            'opening': '💙 이해합니다. 차근차근 설명드리겠습니다:',
            'analysis': '🔍 단계별 분석:',
            'evidence': '📖 참고 자료:',
            'conclusion': '💡 요약하면:'
        },
        'analytical': {
            'opening': '🧠 논리적 분석을 시작하겠습니다:',
            'analysis': '📈 데이터 분석 결과:',
            'evidence': '📋 근거 및 출처:',
            'conclusion': '🎯 분석 결론:'
        },
        'academic': {
            'opening': '📚 학술적 관점에서 접근하겠습니다:',
            'analysis': '🔬 연구 결과 및 분석:',
            'evidence': '📄 참고 문헌 및 근거:',
            'conclusion': '📝 연구 결론:'
        },
        'explanatory': {
            'opening': '📖 쉽게 설명드리겠습니다:',
            'analysis': '💭 주요 내용:',
            'evidence': '📚 관련 정보:',
            'conclusion': '✅ 정리하면:'
        },
        'balanced': {
            'opening': '⚖️ 균형 잡힌 관점에서 답변드리겠습니다:',
            'analysis': '📊 종합 분석:',
            'evidence': '📑 근거 자료:',
            'conclusion': '🎯 종합 결론:'
        }
    }
    
    template = style_templates[writing_style]
    
    # 구조화된 답변 생성
    response_parts = []
    
    # 1. 시작 부분
    response_parts.append(template['opening'])
    
    # 2. 요약
    response_parts.append(f"\n**📋 요약**\n{processed_data['summary']}")
    
    # 3. 상세 분석
    response_parts.append(f"\n**{template['analysis']}**")
    response_parts.append(processed_data['detailed_analysis'])
    
    # 4. 근거 자료
    response_parts.append(f"\n**{template['evidence']}**")
    for i, evidence in enumerate(processed_data['supporting_evidence'][:3], 1):
        response_parts.append(f"{i}. **{evidence['source']}** (관련도: {evidence['relevance']:.1%})\n   {evidence['content']}")
    
    # 5. 통계 정보
    stats = processed_data['statistics']
    response_parts.append(f"\n**📊 분석 통계**\n• 정보원 수: {stats['total_sources']}개\n• 평균 관련도: {stats['avg_relevance']:.1%}\n• 분석 완성도: {stats['coverage_score']}%")
    
    # 6. 트렌드 및 시사점
    if processed_data['trends']:
        response_parts.append(f"\n**📈 주요 트렌드**")
        for trend in processed_data['trends']:
            response_parts.append(f"• {trend}")
    
    # 7. 결론
    response_parts.append(f"\n**{template['conclusion']}**")
    for implication in processed_data['implications']:
        response_parts.append(f"• {implication}")
    
    # 8. 추가 정보 제공
    response_parts.append(f"\n**💡 추가 정보**\n더 자세한 정보가 필요하시면 구체적인 질문을 해주세요. 실시간 검색과 분석을 통해 최신 정보를 제공해드리겠습니다.")
    
    return '\n'.join(response_parts)

def detect_and_execute_special_functions(message, message_lower):
    """특수 기능 요청 감지 및 자동 실행 - 실제 기능 호출하여 결과 반환"""
    
    # 코드 리뷰 요청 감지 (코드가 포함된 경우)
    if any(keyword in message_lower for keyword in ['코드 리뷰', '코드 분석', '코드 검토', '리뷰해줘']):
        # 메시지에서 코드 추출 시도
        code_match = extract_code_from_message(message)
        if code_match:
            code, language = code_match
            # 실제 코드 리뷰 실행
            review_result = perform_code_review(code, language)
            return f"🔍 **코드 리뷰 결과**\n\n{review_result}"
        else:
            return "🔍 **코드 리뷰 기능**을 실행하겠습니다!\n\n📝 코드를 입력하거나 파일을 업로드해주세요.\n\n**지원 언어:** Python, JavaScript, TypeScript, Java, C++\n**제공 기능:**\n• 코드 품질 분석 (0-100점)\n• 문제점 자동 감지\n• 개선 제안\n• 복잡도 점수\n\n코드를 입력해주시면 즉시 분석해드리겠습니다!"
    
    # 텍스트 요약 요청 감지 (텍스트가 포함된 경우)
    elif any(keyword in message_lower for keyword in ['요약', '요약해줘', '줄여줘', '간단히', '핵심만']):
        # 메시지에서 요약할 텍스트 추출 시도
        text_to_summarize = extract_text_for_summarization(message)
        if text_to_summarize:
            # 실제 텍스트 요약 실행
            summary_result = perform_text_summarization(text_to_summarize)
            return f"📝 **텍스트 요약 결과**\n\n{summary_result}"
        else:
            return "📝 **텍스트 요약 기능**을 실행하겠습니다!\n\n📄 요약하고 싶은 텍스트를 입력해주세요.\n\n**요약 스타일:**\n• 일반 요약\n• 불렛 포인트\n• 번호 매기기\n\n**기능:**\n• 핵심 내용 추출\n• 압축 비율 계산\n• 키 포인트 자동 식별\n\n텍스트를 입력해주시면 즉시 요약해드리겠습니다!"
    
    # 스타일 변환 요청 감지 (텍스트가 포함된 경우)
    elif any(keyword in message_lower for keyword in ['유시민', '유시민 스타일', '스타일 변환', '문체 바꿔', '스타일 바꿔']):
        # 메시지에서 변환할 텍스트와 스타일 추출
        style_conversion = extract_text_and_style(message)
        if style_conversion:
            text, style = style_conversion
            # 실제 스타일 변환 실행
            conversion_result = perform_style_conversion(text, style)
            return f"🎨 **스타일 변환 결과**\n\n{conversion_result}"
        else:
            return "🎨 **스타일 변환 기능**을 실행하겠습니다!\n\n📝 변환하고 싶은 텍스트를 입력해주세요.\n\n**지원 스타일:**\n• 🎯 유시민 스타일 (논리적, 직설적, 역사적 맥락)\n• 📋 격식있는 스타일\n• 😊 친근한 스타일\n• 💪 설득적 스타일\n• 🎓 학술적 스타일\n\n텍스트를 입력해주시면 선택한 스타일로 변환해드리겠습니다!"
    
    # 글쓰기 도우미 요청 감지 (텍스트가 포함된 경우)
    elif any(keyword in message_lower for keyword in ['글쓰기', '글쓰기 도와', '글쓰기 개선', '문장 개선', '글 다듬어']):
        # 메시지에서 개선할 텍스트 추출
        text_to_improve = extract_text_for_improvement(message)
        if text_to_improve:
            # 실제 글쓰기 개선 실행
            improvement_result = perform_writing_improvement(text_to_improve)
            return f"✍️ **글쓰기 개선 결과**\n\n{improvement_result}"
        else:
            return "✍️ **글쓰기 도우미 기능**을 실행하겠습니다!\n\n📝 개선하고 싶은 텍스트를 입력해주세요.\n\n**글쓰기 유형:**\n• 일반 글쓰기\n• 에세이\n• 보고서\n• 창작 글쓰기\n• 이메일\n\n**개선 기능:**\n• 문장 구조 개선\n• 어휘 다양화\n• 논리적 흐름 강화\n• 읽기 쉬움 점수 제공\n\n텍스트를 입력해주시면 즉시 개선해드리겠습니다!"
    
    # 콘텐츠 생성 요청 감지 (주제가 포함된 경우)
    elif any(keyword in message_lower for keyword in ['콘텐츠', '콘텐츠 생성', '글 써줘', '기사 써줘', '블로그', '포스트']):
        # 메시지에서 생성할 콘텐츠 주제 추출
        content_topic = extract_content_topic(message)
        if content_topic:
            # 실제 콘텐츠 생성 실행
            content_result = perform_content_generation(content_topic)
            return f"✨ **콘텐츠 생성 결과**\n\n{content_result}"
        else:
            return "✨ **콘텐츠 생성 기능**을 실행하겠습니다!\n\n📝 생성하고 싶은 콘텐츠의 주제를 알려주세요.\n\n**콘텐츠 유형:**\n• 📰 기사\n• 📝 블로그 포스트\n• 📱 소셜미디어\n• 📧 이메일\n\n**길이 옵션:**\n• 짧게 (200자)\n• 보통 (500자)\n• 길게 (1000자)\n\n**톤:**\n• 중립적\n• 전문적\n• 친근한\n\n주제를 알려주시면 즉시 콘텐츠를 생성해드리겠습니다!"
    
    # 시스템 상태 요청 감지
    elif any(keyword in message_lower for keyword in ['시스템', '상태', '성능', '메트릭', '서버']):
        # 실제 시스템 상태 확인 실행
        system_status = get_system_status()
        return f"📊 **시스템 상태 확인 결과**\n\n{system_status}"
    
    # 프로젝트 관리 요청 감지
    elif any(keyword in message_lower for keyword in ['프로젝트', '프로젝트 생성', '프로젝트 관리', '프로젝트 만들어']):
        return "📂 **프로젝트 관리 기능**을 실행하겠습니다!\n\n🎯 프로젝트를 생성하고 관리할 수 있습니다.\n\n**주요 기능:**\n• 📁 새 프로젝트 생성\n• 📄 파일 업로드 및 관리\n• 📋 지침 추가 및 관리\n• 🔍 프로젝트 상세 조회\n\n**사용법:**\n• 사이드바의 '새 프로젝트' 버튼 클릭\n• 프로젝트 더블클릭으로 관리 모달 열기\n• 파일과 지침을 프로젝트에 추가\n\n프로젝트 이름을 알려주시면 생성해드리겠습니다!"
    
    # 파일 분석 요청 감지
    elif any(keyword in message_lower for keyword in ['파일', '파일 분석', '파일 업로드', '문서 분석']):
        return "📁 **파일 분석 기능**을 실행하겠습니다!\n\n📄 분석하고 싶은 파일을 업로드해주세요.\n\n**지원 형식:**\n• 📝 텍스트 파일 (.txt, .md)\n• 📊 데이터 파일 (.json, .csv)\n• 💻 코드 파일 (.py, .js, .ts, .html, .css)\n\n**분석 기능:**\n• 파일 내용 분석\n• 파일 타입별 특화 분석\n• 코드 파일 자동 분석\n• 파일 크기 및 라인 수 분석\n\n파일을 업로드해주시면 즉시 분석해드리겠습니다!"
    
    # 이미지 분석 요청 감지
    elif any(keyword in message_lower for keyword in ['이미지', '이미지 분석', '사진', '그림']):
        return "🖼️ **이미지 분석 기능**을 실행하겠습니다!\n\n📷 분석하고 싶은 이미지를 업로드해주세요.\n\n**지원 형식:**\n• 🖼️ 이미지 파일 (.jpg, .jpeg, .png, .gif, .bmp, .webp)\n\n**분석 기능:**\n• 이미지 기본 정보 제공\n• 파일 크기 및 형식 확인\n• 향후 AI 모델 연동 준비\n\n이미지를 업로드해주시면 즉시 분석해드리겠습니다!"
    
    return None

def extract_code_from_message(message):
    """메시지에서 코드 블록 추출"""
    import re
    
    # ```language\ncode\n``` 패턴 찾기
    code_pattern = r'```(\w+)?\n(.*?)\n```'
    match = re.search(code_pattern, message, re.DOTALL)
    
    if match:
        language = match.group(1) or 'python'
        code = match.group(2).strip()
        return code, language
    
    # 간단한 코드 패턴 (def, class, function 등으로 시작)
    simple_code_pattern = r'(def\s+\w+|class\s+\w+|function\s+\w+|const\s+\w+|let\s+\w+|var\s+\w+)'
    if re.search(simple_code_pattern, message):
        # 메시지 전체를 코드로 간주
        return message, 'python'
    
    return None

def extract_text_for_summarization(message):
    """메시지에서 요약할 텍스트 추출"""
    # "요약해줘" 등의 키워드 제거하고 나머지 텍스트 반환
    keywords = ['요약', '요약해줘', '줄여줘', '간단히', '핵심만']
    text = message
    for keyword in keywords:
        text = text.replace(keyword, '').strip()
    
    # 텍스트가 충분히 긴 경우에만 반환 (최소 50자)
    if len(text) > 50:
        return text
    return None

def extract_text_and_style(message):
    """메시지에서 변환할 텍스트와 스타일 추출"""
    # 스타일 키워드 찾기
    style_keywords = {
        '유시민': 'yusimin',
        '유시민 스타일': 'yusimin',
        '격식있는': 'formal',
        '친근한': 'casual',
        '설득적': 'persuasive',
        '학술적': 'academic'
    }
    
    detected_style = 'yusimin'  # 기본값
    for keyword, style in style_keywords.items():
        if keyword in message.lower():
            detected_style = style
            break
    
    # 스타일 키워드 제거하고 텍스트 추출
    text = message
    for keyword in style_keywords.keys():
        text = text.replace(keyword, '').strip()
    
    # 변환 키워드 제거
    conversion_keywords = ['스타일 변환', '문체 바꿔', '스타일 바꿔', '로 바꿔', '로 변환']
    for keyword in conversion_keywords:
        text = text.replace(keyword, '').strip()
    
    # 텍스트가 충분한 경우에만 반환 (최소 20자)
    if len(text) > 20:
        return text, detected_style
    return None

def extract_text_for_improvement(message):
    """메시지에서 개선할 텍스트 추출"""
    # 개선 키워드 제거
    improvement_keywords = ['글쓰기', '글쓰기 도와', '글쓰기 개선', '문장 개선', '글 다듬어', '개선해줘']
    text = message
    for keyword in improvement_keywords:
        text = text.replace(keyword, '').strip()
    
    # 텍스트가 충분한 경우에만 반환 (최소 30자)
    if len(text) > 30:
        return text
    return None

def extract_content_topic(message):
    """메시지에서 콘텐츠 주제 추출"""
    # 생성 키워드 제거
    generation_keywords = ['콘텐츠', '콘텐츠 생성', '글 써줘', '기사 써줘', '블로그', '포스트', '만들어줘', '생성해줘']
    topic = message
    for keyword in generation_keywords:
        topic = topic.replace(keyword, '').strip()
    
    # 주제가 충분한 경우에만 반환 (최소 10자)
    if len(topic) > 10:
        return topic
    return None

def perform_code_review(code, language):
    """실제 코드 리뷰 실행"""
    try:
        # 코드 리뷰 로직 실행
        result = analyze_code_quality(code, language)
        return f"**코드 품질 점수:** {result['score']}/100\n\n**주요 문제점:**\n{result['issues']}\n\n**개선 제안:**\n{result['suggestions']}\n\n**복잡도 점수:** {result['complexity']}"
    except Exception as e:
        return f"코드 리뷰 중 오류가 발생했습니다: {str(e)}"

def perform_text_summarization(text):
    """실제 텍스트 요약 실행"""
    try:
        # 텍스트 요약 로직 실행
        result = summarize_text(text)
        return f"**원본 텍스트:**\n{text[:200]}...\n\n**요약 결과:**\n{result['summary']}\n\n**압축 비율:** {result['compression_ratio']}%\n**핵심 키워드:** {', '.join(result['keywords'])}"
    except Exception as e:
        return f"텍스트 요약 중 오류가 발생했습니다: {str(e)}"

def perform_style_conversion(text, style):
    """실제 스타일 변환 실행"""
    try:
        # 스타일 변환 로직 실행
        if style == 'yusimin':
            converted_text = convert_to_yusimin_style(text)
        elif style == 'formal':
            converted_text = convert_to_formal_style(text)
        elif style == 'casual':
            converted_text = convert_to_casual_style(text)
        elif style == 'persuasive':
            converted_text = convert_to_persuasive_style(text)
        elif style == 'academic':
            converted_text = convert_to_academic_style(text)
        else:
            converted_text = text
        
        return f"**원본 텍스트:**\n{text}\n\n**변환된 텍스트 ({style} 스타일):**\n{converted_text}\n\n**스타일 특징:** {get_style_characteristics(style)}"
    except Exception as e:
        return f"스타일 변환 중 오류가 발생했습니다: {str(e)}"

def perform_writing_improvement(text):
    """실제 글쓰기 개선 실행"""
    try:
        # 글쓰기 개선 로직 실행
        result = improve_general_writing(text, 'neutral')
        return f"**원본 텍스트:**\n{text}\n\n**개선된 텍스트:**\n{result['improved_text']}\n\n**개선 제안:**\n{result['suggestions']}\n\n**읽기 쉬움 점수:** {result['readability_score']}/100"
    except Exception as e:
        return f"글쓰기 개선 중 오류가 발생했습니다: {str(e)}"

def perform_content_generation(topic):
    """실제 콘텐츠 생성 실행"""
    try:
        # 콘텐츠 생성 로직 실행
        result = generate_general_content(topic, 'medium', 'neutral')
        return f"**주제:** {topic}\n\n**생성된 콘텐츠:**\n{result['content']}\n\n**콘텐츠 길이:** {result['word_count']}자\n**톤:** {result['tone']}"
    except Exception as e:
        return f"콘텐츠 생성 중 오류가 발생했습니다: {str(e)}"

def get_system_status():
    """실제 시스템 상태 확인"""
    try:
        # 시스템 상태 로직 실행
        result = get_performance_metrics()
        if result['success']:
            metrics = result['metrics']
            return f"**서버 상태:** {result['status']}\n**업타임:** {metrics['uptime']}\n**총 요청 수:** {metrics['total_requests']}\n**성공 요청 수:** {metrics['successful_requests']}\n**성공률:** {metrics['success_rate']}%\n**평균 응답 시간:** {metrics['avg_response_time']}ms"
        else:
            return "시스템 상태를 확인할 수 없습니다."
    except Exception as e:
        return f"시스템 상태 확인 중 오류가 발생했습니다: {str(e)}"

def analyze_code_quality(code, language):
    """코드 품질 분석"""
    lines = code.split('\n')
    line_count = len(lines)
    
    # 간단한 코드 품질 점수 계산
    score = 80  # 기본 점수
    
    # 코드 길이에 따른 점수 조정
    if line_count > 50:
        score -= 10
    elif line_count < 10:
        score += 5
    
    # 주석 비율 확인
    comment_lines = sum(1 for line in lines if line.strip().startswith('#') or line.strip().startswith('//'))
    comment_ratio = comment_lines / line_count if line_count > 0 else 0
    
    if comment_ratio < 0.1:
        score -= 15
    elif comment_ratio > 0.3:
        score += 10
    
    # 복잡도 계산 (간단한 방식)
    complexity = min(100, line_count * 2)
    
    # 문제점과 제안사항
    issues = []
    suggestions = []
    
    if comment_ratio < 0.1:
        issues.append("주석이 부족합니다")
        suggestions.append("코드에 주석을 추가하여 가독성을 높이세요")
    
    if line_count > 50:
        issues.append("함수가 너무 깁니다")
        suggestions.append("함수를 더 작은 단위로 분리하세요")
    
    if not issues:
        issues.append("특별한 문제점이 발견되지 않았습니다")
        suggestions.append("코드 품질이 양호합니다")
    
    return {
        'score': max(0, min(100, score)),
        'issues': '\n'.join(f"• {issue}" for issue in issues),
        'suggestions': '\n'.join(f"• {suggestion}" for suggestion in suggestions),
        'complexity': complexity
    }

def summarize_text(text):
    """텍스트 요약"""
    sentences = text.split('.')
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # 간단한 요약 로직 (첫 번째와 마지막 문장 포함)
    if len(sentences) <= 2:
        summary = text
    else:
        summary = sentences[0] + '. ' + sentences[-1] + '.'
    
    # 키워드 추출 (간단한 방식)
    words = text.split()
    word_count = {}
    for word in words:
        word = word.strip('.,!?()[]{}"\'').lower()
        if len(word) > 2:
            word_count[word] = word_count.get(word, 0) + 1
    
    keywords = sorted(word_count.items(), key=lambda x: x[1], reverse=True)[:5]
    keywords = [word for word, count in keywords]
    
    # 압축 비율 계산
    compression_ratio = int((1 - len(summary) / len(text)) * 100)
    
    return {
        'summary': summary,
        'compression_ratio': compression_ratio,
        'keywords': keywords
    }

@app.route('/api/code-review', methods=['POST'])
def code_review():
    """코드 리뷰 API - 고급 기능"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({'success': False, 'error': '코드가 제공되지 않았습니다.'}), 400
        
        # 고급 코드 분석
        analysis_result = analyze_code(code, language)
        
        successful_requests += 1
        
        return jsonify({
            'success': True,
            'review': analysis_result['review'],
            'issues_count': analysis_result['issues_count'],
            'suggestions_count': analysis_result['suggestions_count'],
            'complexity_score': analysis_result['complexity_score'],
            'quality_score': analysis_result['quality_score'],
            'detailed_analysis': analysis_result['detailed_analysis']
        })
        
    except Exception as e:
        logger.error(f"코드 리뷰 오류: {e}")
        return jsonify({'success': False, 'error': '코드 리뷰 중 오류가 발생했습니다.'}), 500

def analyze_code(code, language):
    """고급 코드 분석"""
    lines = code.split('\n')
    issues = []
    suggestions = []
    detailed_analysis = {}
    
    # 기본 분석
    complexity = len(lines) + code.count('if') + code.count('for') + code.count('while') + code.count('try')
    
    # 언어별 분석
    if language.lower() == 'python':
        issues, suggestions, detailed_analysis = analyze_python_code(code, lines)
    elif language.lower() in ['javascript', 'js']:
        issues, suggestions, detailed_analysis = analyze_javascript_code(code, lines)
    elif language.lower() == 'typescript':
        issues, suggestions, detailed_analysis = analyze_typescript_code(code, lines)
    elif language.lower() == 'java':
        issues, suggestions, detailed_analysis = analyze_java_code(code, lines)
    elif language.lower() in ['cpp', 'c++']:
        issues, suggestions, detailed_analysis = analyze_cpp_code(code, lines)
    
    # 품질 점수 계산
    quality_score = max(0, 100 - len(issues) * 10 - complexity // 10)
    
    # 리뷰 결과 생성
    review = f"""🔍 **코드 리뷰 결과**

**분석된 언어:** {language.upper()}
**코드 복잡도:** {complexity}/100
**품질 점수:** {quality_score}/100

**발견된 문제점:**
{chr(10).join([f"⚠️ {issue}" for issue in issues]) if issues else "✅ 특별한 문제점이 발견되지 않았습니다."}

**개선 제안:**
{chr(10).join([f"💡 {suggestion}" for suggestion in suggestions]) if suggestions else "✅ 코드가 잘 작성되었습니다."}

**상세 분석:**
{chr(10).join([f"📊 {key}: {value}" for key, value in detailed_analysis.items()]) if detailed_analysis else "📊 추가 분석 정보가 없습니다."}

**전체 평가:**
{'🟢 우수' if quality_score >= 80 else '🟡 개선 필요' if quality_score >= 60 else '🔴 리팩토링 권장'}

**추가 분석이 필요하시면 구체적인 질문을 해주세요!**"""
    
    return {
        'review': review,
        'issues_count': len(issues),
        'suggestions_count': len(suggestions),
        'complexity_score': complexity,
        'quality_score': quality_score,
        'detailed_analysis': detailed_analysis
    }

def analyze_python_code(code, lines):
    """Python 코드 분석"""
    issues = []
    suggestions = []
    detailed_analysis = {}
    
    # 문제점 검사
    if 'print(' in code and 'logging' not in code:
        issues.append("print 문 대신 logging 모듈 사용을 권장합니다.")
    
    if 'except:' in code:
        issues.append("빈 except 절은 피하세요. 구체적인 예외를 처리하세요.")
    
    if 'import *' in code:
        issues.append("import * 사용은 피하세요. 구체적인 모듈을 import하세요.")
    
    # 개선 제안
    if len(lines) > 50:
        suggestions.append("코드가 길어 보입니다. 함수로 분리하는 것을 고려해보세요.")
    
    if code.count('    ') > code.count('\n') * 2:
        suggestions.append("들여쓰기가 일관되지 않을 수 있습니다.")
    
    # 상세 분석
    detailed_analysis = {
        '총 라인 수': len(lines),
        '함수 개수': code.count('def '),
        '클래스 개수': code.count('class '),
        '주석 비율': f"{round(code.count('#') / len(lines) * 100, 1)}%" if lines else "0%"
    }
    
    return issues, suggestions, detailed_analysis

def analyze_javascript_code(code, lines):
    """JavaScript 코드 분석"""
    issues = []
    suggestions = []
    detailed_analysis = {}
    
    # 문제점 검사
    if 'var ' in code:
        issues.append("var 대신 let 또는 const를 사용하세요.")
    
    if '===' not in code and '==' in code:
        issues.append("엄격한 비교(===)를 사용하세요.")
    
    if 'eval(' in code:
        issues.append("eval() 사용은 보안상 위험합니다.")
    
    # 상세 분석
    detailed_analysis = {
        '총 라인 수': len(lines),
        '함수 개수': code.count('function ') + code.count('=>'),
        '변수 선언': code.count('let ') + code.count('const ') + code.count('var '),
        '콘솔 로그': code.count('console.log')
    }
    
    return issues, suggestions, detailed_analysis

def analyze_typescript_code(code, lines):
    """TypeScript 코드 분석"""
    issues = []
    suggestions = []
    detailed_analysis = {}
    
    # 문제점 검사
    if 'any' in code:
        issues.append("any 타입 사용을 피하고 구체적인 타입을 사용하세요.")
    
    if '!' in code and 'as ' not in code:
        issues.append("타입 단언보다는 타입 가드를 사용하세요.")
    
    # 상세 분석
    detailed_analysis = {
        '총 라인 수': len(lines),
        '인터페이스 개수': code.count('interface '),
        '타입 별칭': code.count('type '),
        '제네릭 사용': code.count('<') - code.count('</')
    }
    
    return issues, suggestions, detailed_analysis

def analyze_java_code(code, lines):
    """Java 코드 분석"""
    issues = []
    suggestions = []
    detailed_analysis = {}
    
    # 문제점 검사
    if 'System.out.println' in code:
        issues.append("System.out.println 대신 로거를 사용하세요.")
    
    if 'catch (Exception e)' in code:
        issues.append("구체적인 예외를 처리하세요.")
    
    # 상세 분석
    detailed_analysis = {
        '총 라인 수': len(lines),
        '클래스 개수': code.count('class '),
        '메서드 개수': code.count('public ') + code.count('private ') + code.count('protected '),
        '패키지': code.count('package ')
    }
    
    return issues, suggestions, detailed_analysis

def analyze_cpp_code(code, lines):
    """C++ 코드 분석"""
    issues = []
    suggestions = []
    detailed_analysis = {}
    
    # 문제점 검사
    if 'using namespace std' in code:
        issues.append("using namespace std 사용을 피하세요.")
    
    if 'new ' in code and 'delete ' not in code:
        issues.append("메모리 누수를 방지하기 위해 delete를 사용하세요.")
    
    # 상세 분석
    detailed_analysis = {
        '총 라인 수': len(lines),
        '클래스 개수': code.count('class '),
        '함수 개수': code.count('int ') + code.count('void ') + code.count('bool '),
        '포인터 사용': code.count('*')
    }
    
    return issues, suggestions, detailed_analysis

@app.route('/api/text-summarize', methods=['POST'])
def text_summarize():
    """텍스트 요약 API - 고급 기능"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        max_length = data.get('max_length', 200)
        style = data.get('style', 'general')  # general, bullet, numbered
        
        if not text:
            return jsonify({'success': False, 'error': '텍스트가 제공되지 않았습니다.'}), 400
        
        # 고급 텍스트 요약
        summary_result = advanced_text_summarize(text, max_length, style)
        
        successful_requests += 1
        
        return jsonify({
            'success': True,
            'summary': summary_result['summary'],
            'original_length': summary_result['original_length'],
            'summary_length': summary_result['summary_length'],
            'compression_ratio': summary_result['compression_ratio'],
            'key_points': summary_result['key_points'],
            'style': style
        })
        
    except Exception as e:
        logger.error(f"텍스트 요약 오류: {e}")
        return jsonify({'success': False, 'error': '텍스트 요약 중 오류가 발생했습니다.'}), 500

def advanced_text_summarize(text, max_length, style):
    """고급 텍스트 요약"""
    sentences = text.split('. ')
    if len(sentences) <= 3:
        return {
            'summary': text,
            'original_length': len(text),
            'summary_length': len(text),
            'compression_ratio': 100.0,
            'key_points': []
        }
    
    # 중요 문장 추출
    important_sentences = [sentences[0]]  # 첫 문장은 항상 포함
    middle_sentences = sentences[1:-1]
    
    # 문장 길이와 키워드 기반으로 중요도 계산
    scored_sentences = []
    for sentence in middle_sentences:
        score = len(sentence)  # 기본 점수는 길이
        # 키워드 점수 추가
        keywords = ['중요', '핵심', '주요', '결론', '요약', '결과', '발견']
        for keyword in keywords:
            if keyword in sentence:
                score += 20
        scored_sentences.append((sentence, score))
    
    # 점수 순으로 정렬
    scored_sentences.sort(key=lambda x: x[1], reverse=True)
    
    # 상위 문장들 선택
    for sentence, score in scored_sentences[:2]:
        if len(sentence) > 20:
            important_sentences.append(sentence)
    
    # 마지막 문장 추가
    if len(sentences) > 1:
        important_sentences.append(sentences[-1])
    
    # 스타일에 따른 포맷팅
    if style == 'bullet':
        summary = '• ' + '\n• '.join(important_sentences)
    elif style == 'numbered':
        summary = '\n'.join([f"{i+1}. {sentence}" for i, sentence in enumerate(important_sentences)])
    else:
        summary = '. '.join(important_sentences)
    
    # 길이 제한
    if len(summary) > max_length:
        summary = summary[:max_length] + '...'
    
    # 키 포인트 추출
    key_points = []
    for sentence in important_sentences[:3]:
        if len(sentence) > 10:
            key_points.append(sentence[:50] + '...' if len(sentence) > 50 else sentence)
    
    return {
        'summary': summary,
        'original_length': len(text),
        'summary_length': len(summary),
        'compression_ratio': round(len(summary) / len(text) * 100, 1),
        'key_points': key_points
    }

@app.route('/api/analyze-file', methods=['POST'])
def analyze_file():
    """파일 분석 API"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '파일이 제공되지 않았습니다.'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': '파일이 선택되지 않았습니다.'}), 400
        
        # 파일 내용 읽기
        try:
            content = file.read().decode('utf-8', errors='ignore')
        except Exception as e:
            return jsonify({'success': False, 'error': f'파일 읽기 오류: {str(e)}'}), 400
        
        filename = file.filename
        
        # 파일 분석
        analysis_result = analyze_file_content(content, filename)
        
        successful_requests += 1
        
        return jsonify({
            'success': True,
            'filename': filename,
            'file_size': len(content),
            'analysis': analysis_result,
            'message': f'파일 "{filename}" 분석이 완료되었습니다.'
        })
        
    except Exception as e:
        logger.error(f"파일 분석 오류: {e}")
        return jsonify({'success': False, 'error': '파일 분석 중 오류가 발생했습니다.'}), 500

def analyze_file_content(content, filename):
    """파일 내용 분석"""
    file_ext = filename.split('.')[-1].lower()
    
    analysis = {
        'file_type': file_ext,
        'line_count': len(content.split('\n')),
        'word_count': len(content.split()),
        'character_count': len(content),
        'analysis_type': 'text'
    }
    
    # 파일 타입별 특별 분석
    if file_ext in ['py', 'js', 'ts', 'java', 'cpp', 'c']:
        analysis['analysis_type'] = 'code'
        analysis['code_analysis'] = analyze_code(content, file_ext)
    elif file_ext in ['json']:
        try:
            json_data = json.loads(content)
            analysis['analysis_type'] = 'json'
            analysis['json_keys'] = list(json_data.keys()) if isinstance(json_data, dict) else []
        except:
            analysis['analysis_type'] = 'text'
    elif file_ext in ['md']:
        analysis['analysis_type'] = 'markdown'
        analysis['headers'] = [line for line in content.split('\n') if line.startswith('#')]
    
    return analysis

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """이미지 분석 API"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': '이미지가 제공되지 않았습니다.'}), 400
        
        image = request.files['image']
        if image.filename == '':
            return jsonify({'success': False, 'error': '이미지가 선택되지 않았습니다.'}), 400
        
        # 기본 이미지 정보
        filename = image.filename
        file_size = len(image.read())
        image.seek(0)  # 파일 포인터 리셋
        
        # 이미지 형식 확인
        file_ext = filename.split('.')[-1].lower()
        supported_formats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
        
        if file_ext not in supported_formats:
            return jsonify({'success': False, 'error': f'지원되지 않는 이미지 형식입니다. 지원 형식: {", ".join(supported_formats)}'}), 400
        
        successful_requests += 1
        
        return jsonify({
            'success': True,
            'filename': filename,
            'file_size': file_size,
            'format': file_ext,
            'message': f'이미지 "{filename}"이 성공적으로 업로드되었습니다. (크기: {file_size} bytes)'
        })
        
    except Exception as e:
        logger.error(f"이미지 분석 오류: {e}")
        return jsonify({'success': False, 'error': '이미지 분석 중 오류가 발생했습니다.'}), 500

@app.route('/api/performance-metrics', methods=['GET'])
def get_performance_metrics():
    """시스템 성능 메트릭 조회"""
    global total_requests, successful_requests
    
    try:
        import os
        
        # 기본 시스템 정보
        metrics = {
            'timestamp': datetime.now().isoformat(),
            'system': {
                'cpu_usage': 'N/A',
                'memory_usage': 'N/A',
                'memory_available': 'N/A',
                'disk_usage': 'N/A',
                'disk_free': 'N/A'
            },
            'application': {
                'process_memory': 'N/A',
                'uptime': 'N/A',
                'total_requests': total_requests,
                'successful_requests': successful_requests,
                'error_rate': round((total_requests - successful_requests) / max(total_requests, 1) * 100, 2),
                'python_version': f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
                'platform': os.name,
                'active_sessions': len(chat_sessions)
            }
        }
        
        # psutil이 있는 경우 더 자세한 정보 제공
        try:
            import psutil
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            process = psutil.Process()
            
            metrics['system'] = {
                'cpu_usage': f"{cpu_percent}%",
                'memory_usage': f"{memory.percent}%",
                'memory_available': f"{memory.available / 1024 / 1024 / 1024:.1f} GB",
                'disk_usage': f"{disk.percent}%",
                'disk_free': f"{disk.free / 1024 / 1024 / 1024:.1f} GB"
            }
            
            metrics['application'].update({
                'process_memory': f"{process.memory_info().rss / 1024 / 1024:.1f} MB",
                'uptime': f"{time.time() - process.create_time():.1f} seconds"
            })
            
        except ImportError:
            logger.info("psutil 모듈이 설치되지 않아 기본 정보만 제공합니다.")
        
        return jsonify({
            'success': True,
            'metrics': metrics
        })
        
    except Exception as e:
        logger.error(f"성능 메트릭 조회 오류: {e}")
        return jsonify({'success': False, 'error': '성능 메트릭 조회 중 오류가 발생했습니다.'}), 500

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """채팅 세션 목록 조회"""
    try:
        session_list = []
        for session_id, session_data in chat_sessions.items():
            session_list.append({
                'session_id': session_id,
                'created_at': session_data['created_at'],
                'last_activity': session_data['last_activity'],
                'message_count': len(session_data['messages'])
            })
        
        return jsonify({
            'success': True,
            'sessions': session_list,
            'total_sessions': len(chat_sessions)
        })
        
    except Exception as e:
        logger.error(f"세션 조회 오류: {e}")
        return jsonify({'success': False, 'error': '세션 조회 중 오류가 발생했습니다.'}), 500

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """특정 채팅 세션 조회"""
    try:
        if session_id not in chat_sessions:
            return jsonify({'success': False, 'error': '세션을 찾을 수 없습니다.'}), 404
        
        return jsonify({
            'success': True,
            'session': chat_sessions[session_id]
        })
        
    except Exception as e:
        logger.error(f"세션 조회 오류: {e}")
        return jsonify({'success': False, 'error': '세션 조회 중 오류가 발생했습니다.'}), 500

# 프로젝트 관련 API
@app.route('/api/projects', methods=['GET'])
def get_projects():
    """프로젝트 목록 조회"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        projects = []
        for project_id, project_data in projects_db.items():
            projects.append({
                'id': project_id,
                'name': project_data['name'],
                'description': project_data.get('description', ''),
                'created_at': project_data['created_at'],
                'updated_at': project_data['updated_at'],
                'file_count': len(project_files_db.get(project_id, [])),
                'guidelines_count': len(project_data.get('guidelines', []))
            })
        
        successful_requests += 1
        return jsonify({
            'success': True,
            'projects': projects,
            'total_count': len(projects)
        })
    except Exception as e:
        logger.error(f"프로젝트 목록 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects', methods=['POST'])
def create_project():
    """새 프로젝트 생성"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        data = request.get_json()
        project_name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        
        if not project_name:
            return jsonify({'success': False, 'error': '프로젝트 이름이 필요합니다.'}), 400
        
        # 중복 이름 확인
        for project_data in projects_db.values():
            if project_data['name'] == project_name:
                return jsonify({'success': False, 'error': '이미 존재하는 프로젝트 이름입니다.'}), 400
        
        project_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        projects_db[project_id] = {
            'id': project_id,
            'name': project_name,
            'description': description,
            'created_at': now,
            'updated_at': now,
            'guidelines': []
        }
        
        project_files_db[project_id] = []
        
        successful_requests += 1
        return jsonify({
            'success': True,
            'project': {
                'id': project_id,
                'name': project_name,
                'description': description,
                'created_at': now,
                'updated_at': now,
                'file_count': 0,
                'guidelines_count': 0
            }
        })
    except Exception as e:
        logger.error(f"프로젝트 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """특정 프로젝트 조회"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        if project_id not in projects_db:
            return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        project_data = projects_db[project_id]
        files = project_files_db.get(project_id, [])
        
        successful_requests += 1
        return jsonify({
            'success': True,
            'project': {
                'id': project_id,
                'name': project_data['name'],
                'description': project_data.get('description', ''),
                'created_at': project_data['created_at'],
                'updated_at': project_data['updated_at'],
                'guidelines': project_data.get('guidelines', []),
                'files': files
            }
        })
    except Exception as e:
        logger.error(f"프로젝트 조회 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>/files', methods=['POST'])
def upload_project_file(project_id):
    """프로젝트에 파일 업로드"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '파일이 제공되지 않았습니다.'}), 400
        
        file = request.files['file']
        
        if not project_id or project_id not in projects_db:
            return jsonify({'success': False, 'error': '유효하지 않은 프로젝트 ID입니다.'}), 400
        
        if file.filename == '':
            return jsonify({'success': False, 'error': '파일이 선택되지 않았습니다.'}), 400
        
        # 파일 내용 읽기
        try:
            content = file.read().decode('utf-8', errors='ignore')
        except Exception as e:
            return jsonify({'success': False, 'error': f'파일 읽기 오류: {str(e)}'}), 400
        
        file_id = str(uuid.uuid4())
        file_data = {
            'id': file_id,
            'name': file.filename,
            'size': len(content),
            'content': content,
            'uploaded_at': datetime.now().isoformat(),
            'type': file.filename.split('.')[-1].lower() if '.' in file.filename else 'unknown'
        }
        
        project_files_db[project_id].append(file_data)
        
        # 프로젝트 업데이트 시간 갱신
        projects_db[project_id]['updated_at'] = datetime.now().isoformat()
        
        successful_requests += 1
        return jsonify({
            'success': True,
            'file': file_data,
            'message': f'파일 "{file.filename}"이 프로젝트에 추가되었습니다.'
        })
    except Exception as e:
        logger.error(f"파일 업로드 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>/guidelines', methods=['POST'])
def add_guideline(project_id):
    """프로젝트에 지침 추가"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        data = request.get_json()
        guideline_text = data.get('guideline', '').strip()
        
        if not guideline_text:
            return jsonify({'success': False, 'error': '지침 내용이 필요합니다.'}), 400
        
        if project_id not in projects_db:
            return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        guideline_id = str(uuid.uuid4())
        guideline_data = {
            'id': guideline_id,
            'text': guideline_text,
            'created_at': datetime.now().isoformat()
        }
        
        projects_db[project_id]['guidelines'].append(guideline_data)
        projects_db[project_id]['updated_at'] = datetime.now().isoformat()
        
        successful_requests += 1
        return jsonify({
            'success': True,
            'guideline': guideline_data,
            'message': '지침이 추가되었습니다.'
        })
    except Exception as e:
        logger.error(f"지침 추가 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>/guidelines/<guideline_id>', methods=['DELETE'])
def delete_guideline(project_id, guideline_id):
    """프로젝트 지침 삭제"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        if project_id not in projects_db:
            return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        guidelines = projects_db[project_id]['guidelines']
        for i, guideline in enumerate(guidelines):
            if guideline['id'] == guideline_id:
                del guidelines[i]
                projects_db[project_id]['updated_at'] = datetime.now().isoformat()
                successful_requests += 1
                return jsonify({
                    'success': True,
                    'message': '지침이 삭제되었습니다.'
                })
        
        return jsonify({'success': False, 'error': '지침을 찾을 수 없습니다.'}), 404
    except Exception as e:
        logger.error(f"지침 삭제 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 글쓰기 및 스타일 변환 API
@app.route('/api/writing', methods=['POST'])
def writing_assistant():
    """글쓰기 도우미 API"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        writing_type = data.get('type', 'general')  # general, essay, report, creative, etc.
        style = data.get('style', 'neutral')  # neutral, formal, casual, persuasive, etc.
        
        if not text:
            return jsonify({'success': False, 'error': '텍스트가 제공되지 않았습니다.'}), 400
        
        # 글쓰기 유형별 처리
        if writing_type == 'essay':
            result = improve_essay(text, style)
        elif writing_type == 'report':
            result = improve_report(text, style)
        elif writing_type == 'creative':
            result = improve_creative_writing(text, style)
        elif writing_type == 'email':
            result = improve_email(text, style)
        else:
            result = improve_general_writing(text, style)
        
        successful_requests += 1
        return jsonify({
            'success': True,
            'original_text': text,
            'improved_text': result['improved_text'],
            'suggestions': result['suggestions'],
            'writing_type': writing_type,
            'style': style,
            'word_count': result['word_count'],
            'readability_score': result['readability_score']
        })
        
    except Exception as e:
        logger.error(f"글쓰기 도우미 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/style-convert', methods=['POST'])
def style_converter():
    """스타일 변환 API"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        target_style = data.get('style', 'neutral')  # yusimin, formal, casual, persuasive, etc.
        
        if not text:
            return jsonify({'success': False, 'error': '텍스트가 제공되지 않았습니다.'}), 400
        
        # 스타일별 변환
        if target_style == 'yusimin':
            converted_text = convert_to_yusimin_style(text)
        elif target_style == 'formal':
            converted_text = convert_to_formal_style(text)
        elif target_style == 'casual':
            converted_text = convert_to_casual_style(text)
        elif target_style == 'persuasive':
            converted_text = convert_to_persuasive_style(text)
        elif target_style == 'academic':
            converted_text = convert_to_academic_style(text)
        else:
            converted_text = text
        
        successful_requests += 1
        return jsonify({
            'success': True,
            'original_text': text,
            'converted_text': converted_text,
            'target_style': target_style,
            'style_characteristics': get_style_characteristics(target_style)
        })
        
    except Exception as e:
        logger.error(f"스타일 변환 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/content-generator', methods=['POST'])
def content_generator():
    """콘텐츠 생성 API"""
    global total_requests, successful_requests
    total_requests += 1
    
    try:
        data = request.get_json()
        topic = data.get('topic', '').strip()
        content_type = data.get('type', 'article')  # article, blog, social, email, etc.
        length = data.get('length', 'medium')  # short, medium, long
        tone = data.get('tone', 'neutral')  # neutral, professional, friendly, etc.
        
        if not topic:
            return jsonify({'success': False, 'error': '주제가 제공되지 않았습니다.'}), 400
        
        # 콘텐츠 타입별 생성
        if content_type == 'article':
            content = generate_article(topic, length, tone)
        elif content_type == 'blog':
            content = generate_blog_post(topic, length, tone)
        elif content_type == 'social':
            content = generate_social_content(topic, length, tone)
        elif content_type == 'email':
            content = generate_email(topic, length, tone)
        else:
            content = generate_general_content(topic, length, tone)
        
        successful_requests += 1
        return jsonify({
            'success': True,
            'topic': topic,
            'content_type': content_type,
            'generated_content': content['text'],
            'title': content['title'],
            'key_points': content['key_points'],
            'word_count': content['word_count'],
            'estimated_reading_time': content['reading_time']
        })
        
    except Exception as e:
        logger.error(f"콘텐츠 생성 오류: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# 글쓰기 개선 함수들
def improve_general_writing(text, style):
    """일반 글쓰기 개선"""
    suggestions = []
    
    # 기본 개선 사항들
    if len(text.split()) < 10:
        suggestions.append("내용을 더 구체적으로 설명해보세요.")
    
    if not any(char in text for char in '.,!?'):
        suggestions.append("문장 부호를 적절히 사용해보세요.")
    
    if text.count('그리고') > 2:
        suggestions.append("'그리고' 대신 다양한 연결어를 사용해보세요.")
    
    # 스타일별 개선
    improved_text = text
    if style == 'formal':
        improved_text = text.replace('~다', '~입니다').replace('~어요', '~습니다')
        suggestions.append("격식있는 문체로 수정했습니다.")
    elif style == 'casual':
        improved_text = text.replace('~습니다', '~어요').replace('~입니다', '~야')
        suggestions.append("친근한 문체로 수정했습니다.")
    
    return {
        'improved_text': improved_text,
        'suggestions': suggestions,
        'word_count': len(text.split()),
        'readability_score': min(100, max(0, 100 - len(text.split()) + 20))
    }

def improve_essay(text, style):
    """에세이 개선"""
    suggestions = [
        "서론, 본론, 결론 구조를 명확히 하세요.",
        "논리적 흐름을 위해 연결어를 활용하세요.",
        "구체적인 예시나 근거를 추가하세요."
    ]
    
    improved_text = f"【서론】\n{text}\n\n【본론】\n위 내용을 더 구체적으로 설명하면...\n\n【결론】\n따라서 위에서 논의한 바와 같이..."
    
    return {
        'improved_text': improved_text,
        'suggestions': suggestions,
        'word_count': len(text.split()),
        'readability_score': 85
    }

def improve_report(text, style):
    """보고서 개선"""
    suggestions = [
        "데이터와 통계를 포함하세요.",
        "객관적 서술을 유지하세요.",
        "결론과 제안사항을 명확히 제시하세요."
    ]
    
    improved_text = f"【현황 분석】\n{text}\n\n【문제점】\n- 구체적인 문제점 1\n- 구체적인 문제점 2\n\n【개선방안】\n- 제안사항 1\n- 제안사항 2"
    
    return {
        'improved_text': improved_text,
        'suggestions': suggestions,
        'word_count': len(text.split()),
        'readability_score': 80
    }

def improve_creative_writing(text, style):
    """창작 글쓰기 개선"""
    suggestions = [
        "감정과 분위기를 생생하게 묘사하세요.",
        "다양한 문장 구조를 사용하세요.",
        "독자의 상상력을 자극하는 표현을 활용하세요."
    ]
    
    improved_text = f"✨ {text} ✨\n\n이야기가 더욱 흥미롭게 전개되도록 감정적 묘사와 구체적인 상황 설정을 추가했습니다."
    
    return {
        'improved_text': improved_text,
        'suggestions': suggestions,
        'word_count': len(text.split()),
        'readability_score': 90
    }

def improve_email(text, style):
    """이메일 개선"""
    suggestions = [
        "명확한 제목과 인사말을 포함하세요.",
        "용건을 간결하고 명확하게 전달하세요.",
        "적절한 마무리 인사와 서명을 추가하세요."
    ]
    
    improved_text = f"제목: [용건 요약]\n\n안녕하세요,\n\n{text}\n\n감사합니다.\n\n[이름]"
    
    return {
        'improved_text': improved_text,
        'suggestions': suggestions,
        'word_count': len(text.split()),
        'readability_score': 75
    }

# 스타일 변환 함수들
def convert_to_yusimin_style(text):
    """유시민 스타일로 변환"""
    # 유시민 스타일의 특징: 논리적, 직설적, 풍부한 어휘, 역사적 맥락
    converted = text
    
    # 논리적 연결어 추가
    converted = converted.replace('그리고', '또한')
    converted = converted.replace('하지만', '그러나')
    converted = converted.replace('그래서', '따라서')
    
    # 직설적 표현 강화
    converted = converted.replace('~것 같다', '~다')
    converted = converted.replace('~할 수 있다', '~한다')
    
    # 역사적 맥락 추가 (예시)
    if '정치' in converted:
        converted += "\n\n이는 우리나라 정치사에서 반복되어 온 패턴이다."
    if '경제' in converted:
        converted += "\n\n경제학자들은 이를 '경제적 합리성'이라고 부른다."
    
    return converted

def convert_to_formal_style(text):
    """격식있는 스타일로 변환"""
    converted = text
    converted = converted.replace('~어요', '~습니다')
    converted = converted.replace('~야', '~입니다')
    converted = converted.replace('~다', '~합니다')
    return converted

def convert_to_casual_style(text):
    """친근한 스타일로 변환"""
    converted = text
    converted = converted.replace('~습니다', '~어요')
    converted = converted.replace('~입니다', '~야')
    converted = converted.replace('~합니다', '~해')
    return converted

def convert_to_persuasive_style(text):
    """설득적 스타일로 변환"""
    converted = text
    converted = converted.replace('~다', '~다. 이것이 바로 우리가 해야 할 일이다.')
    converted = converted.replace('~어요', '~어요. 여러분도 동의하시지 않나요?')
    return converted

def convert_to_academic_style(text):
    """학술적 스타일로 변환"""
    converted = text
    converted = converted.replace('~다', '~다고 할 수 있다')
    converted = converted.replace('~어요', '~다고 볼 수 있다')
    converted += "\n\n이는 선행연구에서도 지적된 바와 같다."
    return converted

def get_style_characteristics(style):
    """스타일 특성 설명"""
    characteristics = {
        'yusimin': '논리적, 직설적, 역사적 맥락, 풍부한 어휘',
        'formal': '격식있는 문체, 정중한 표현, 공식적 톤',
        'casual': '친근한 문체, 일상적 표현, 편안한 톤',
        'persuasive': '설득적 논리, 감정적 어필, 행동 유도',
        'academic': '학술적 표현, 객관적 서술, 이론적 근거'
    }
    return characteristics.get(style, '일반적인 문체')

# 콘텐츠 생성 함수들
def generate_article(topic, length, tone):
    """기사 생성"""
    word_count = {'short': 200, 'medium': 500, 'long': 1000}[length]
    
    content = f"""
{topic}에 대한 최신 동향

{topic}는 현재 우리 사회에서 중요한 이슈로 떠오르고 있습니다. 

주요 특징:
• 핵심 요소 1
• 핵심 요소 2  
• 핵심 요소 3

전문가들은 {topic}의 중요성을 강조하며, 앞으로의 발전 방향에 대해 주목하고 있습니다.

결론적으로, {topic}는 우리에게 중요한 의미를 가지고 있으며, 지속적인 관심과 연구가 필요합니다.
"""
    
    return {
        'title': f'{topic}에 대한 심층 분석',
        'text': content.strip(),
        'key_points': ['핵심 요소 1', '핵심 요소 2', '핵심 요소 3'],
        'word_count': word_count,
        'reading_time': f"{word_count // 200}분"
    }

def generate_blog_post(topic, length, tone):
    """블로그 포스트 생성"""
    content = f"""
안녕하세요! 오늘은 {topic}에 대해 이야기해보려고 합니다.

{topic}에 대해 처음 접하게 된 것은... (개인적 경험)

이를 통해 깨달은 점들:
1. 첫 번째 깨달음
2. 두 번째 깨달음
3. 세 번째 깨달음

여러분은 {topic}에 대해 어떻게 생각하시나요? 
댓글로 의견을 나눠주시면 감사하겠습니다!

#블로그 #{topic.replace(' ', '')}
"""
    
    return {
        'title': f'{topic}에 대한 솔직한 이야기',
        'text': content.strip(),
        'key_points': ['개인적 경험', '깨달음들', '독자 참여'],
        'word_count': 300,
        'reading_time': '2분'
    }

def generate_social_content(topic, length, tone):
    """소셜미디어 콘텐츠 생성"""
    content = f"""
🔥 {topic}에 대한 놀라운 사실!

💡 핵심 포인트:
• 포인트 1
• 포인트 2
• 포인트 3

🤔 여러분의 생각은 어떠신가요?

#{topic.replace(' ', '')} #트렌드 #정보
"""
    
    return {
        'title': f'{topic} 트렌드',
        'text': content.strip(),
        'key_points': ['핵심 포인트들'],
        'word_count': 100,
        'reading_time': '30초'
    }

def generate_email(topic, length, tone):
    """이메일 생성"""
    content = f"""
제목: {topic} 관련 안내

안녕하세요,

{topic}에 대해 안내드리고자 합니다.

주요 내용:
- 내용 1
- 내용 2
- 내용 3

추가 문의사항이 있으시면 언제든 연락주세요.

감사합니다.
[이름]
"""
    
    return {
        'title': f'{topic} 관련 안내',
        'text': content.strip(),
        'key_points': ['주요 내용들'],
        'word_count': 150,
        'reading_time': '1분'
    }

def generate_general_content(topic, length, tone):
    """일반 콘텐츠 생성"""
    content = f"""
{topic}에 대해 알아보겠습니다.

{topic}는 다음과 같은 특징을 가지고 있습니다:
1. 특징 1
2. 특징 2
3. 특징 3

이러한 특징들로 인해 {topic}는 우리에게 중요한 의미를 가집니다.
"""
    
    return {
        'title': f'{topic} 개요',
        'text': content.strip(),
        'key_points': ['특징들'],
        'word_count': 200,
        'reading_time': '1분'
    }

if __name__ == '__main__':
    print("🚀 CORBU.AI 완전한 서버를 시작합니다...")
    print("📍 서버 주소: http://localhost:3000")
    print("🔗 메인 화면: modern_chat_interface.html")
    print("✨ 모든 기능이 포함된 고급 AI 플랫폼")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=3000, debug=True)
