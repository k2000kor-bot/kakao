#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORBU.AI 지능형 AI 분석 플랫폼 API 서버
CORBU.AI Intelligent AI Analysis Platform API Server
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import logging
from datetime import datetime
from werkzeug.utils import secure_filename
from pathlib import Path
import threading
import time

from gaeposung_advanced_analysis_system import (
    GaepoSungAdvancedAnalysisSystem,
    AnalysisResult,
    MediaFile
)
from advanced_ai_analysis_engine import (
    AdvancedAIAnalysisEngine,
    AnalysisContext,
    IntelligentResponse
)
from advanced_nlp_engine import (
    AdvancedNLPEngine,
    AdvancedSemanticAnalysis
)
from intelligent_question_analyzer import (
    IntelligentQuestionAnalyzer,
    IntelligentResponse
)
# 웹 연구 엔진 (간단한 버전)
import asyncio
from datetime import datetime

# 대화형 QA 시스템
from conversational_qa_system import conversational_qa_system

class SimpleWebResearchEngine:
    def __init__(self):
        self.credibility_domains = {
            'high': ['ac.kr', 'edu', 'gov.kr', 'go.kr'],
            'medium': ['naver.com', 'daum.net'],
            'low': ['blog.naver.com', 'cafe.naver.com']
        }
    
    async def comprehensive_research(self, question: str, context: dict = None):
        """간단한 연구 시뮬레이션"""
        
        # 시뮬레이션된 검색 결과
        sources = [
            {
                'url': 'https://example.com/gaeposung-analysis',
                'title': f'개포우성 재개발 프로젝트 분석 - {question[:20]}...',
                'content': f'개포우성 재개발 프로젝트에 대한 종합적인 분석 결과입니다. {question}에 대한 상세한 정보를 제공합니다.',
                'domain': 'example.com',
                'credibility_score': 0.8,
                'source_type': 'news'
            },
            {
                'url': 'https://blog.naver.com/gaeposung-info',
                'title': f'개포우성 재개발 최신 정보 - {question[:20]}...',
                'content': f'개포우성 재개발 프로젝트의 최신 동향과 {question}에 대한 분석입니다.',
                'domain': 'blog.naver.com',
                'credibility_score': 0.6,
                'source_type': 'community'
            },
            {
                'url': 'https://cafe.daum.net/gaeposung-community',
                'title': f'개포우성 주민 커뮤니티 - {question[:20]}...',
                'content': f'개포우성 재개발에 대한 주민들의 의견과 {question}에 대한 토론입니다.',
                'domain': 'cafe.daum.net',
                'credibility_score': 0.5,
                'source_type': 'community'
            }
        ]
        
        # 키워드 추출
        keywords = self._extract_keywords(question)
        
        # 연구 결과 구성
        research_results = {
            'query': question,
            'sources': sources,
            'key_findings': [
                f"{keyword} 관련 정보: {len([s for s in sources if keyword in s['content']])}개 소스에서 발견"
                for keyword in keywords
            ],
            'consensus_points': [
                f"{keyword}에 대한 정보가 여러 소스에서 확인됨"
                for keyword in keywords if len([s for s in sources if keyword in s['content']]) >= 2
            ],
            'credibility_assessment': {
                'high_credibility_sources': len([s for s in sources if s['credibility_score'] >= 0.8]),
                'medium_credibility_sources': len([s for s in sources if 0.5 <= s['credibility_score'] < 0.8]),
                'low_credibility_sources': len([s for s in sources if s['credibility_score'] < 0.5]),
                'average_credibility': sum(s['credibility_score'] for s in sources) / len(sources)
            },
            'research_summary': f"총 {len(sources)}개의 소스를 분석한 결과, {len(keywords)}개의 주요 키워드가 발견되었습니다."
        }
        
        # 논리적 반박 생성
        logical_refutations = []
        if any(word in question for word in ['확실히', '분명히', '틀림없이']):
            logical_refutations.append({
                'claim': question,
                'refutation_type': 'logical_fallacy',
                'evidence': ['확증 편향의 가능성이 있습니다'],
                'counter_arguments': ['다양한 관점에서 검증이 필요합니다'],
                'confidence_score': 0.7,
                'refutation_strength': 'moderate'
            })
        
        # 종합 분석 결과
        comprehensive_analysis = {
            'original_question': question,
            'research_results': research_results,
            'logical_refutations': logical_refutations,
            'methodology_assessment': {
                'sample_size': len(sources),
                'source_diversity': len(set(s['domain'] for s in sources)),
                'methodology_strength': 'moderate' if len(sources) >= 3 else 'weak'
            },
            'conclusion': f"웹 연구 결과를 종합한 결론: {question}에 대한 다양한 관점에서의 추가 검증이 필요합니다.",
            'recommendations': [
                "고신뢰도 소스에서 추가 정보를 수집하세요",
                "다양한 관점에서의 검증을 거치세요",
                "정량적 데이터와 정성적 분석을 결합하세요"
            ],
            'confidence_score': research_results['credibility_assessment']['average_credibility'],
            'timestamp': datetime.now().isoformat()
        }
        
        return comprehensive_analysis
    
    def _extract_keywords(self, question: str) -> list:
        """핵심 키워드 추출"""
        keywords = []
        
        if '개포우성' in question:
            keywords.extend(['개포우성', '개포동', '강남구'])
        
        if any(word in question for word in ['재개발', '개발', '투자']):
            keywords.extend(['재개발', '도시개발', '투자'])
        
        if any(word in question for word in ['정책', '법', '규제']):
            keywords.extend(['정책', '법규', '규제'])
        
        if any(word in question for word in ['경제', '투자', '수익']):
            keywords.extend(['경제', '투자', '수익성'])
        
        return list(set(keywords))

# 웹 연구 엔진 인스턴스 생성
web_research_engine = SimpleWebResearchEngine()

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)

# 설정
UPLOAD_FOLDER = 'uploads/gaeposung'
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'jpg', 'jpeg', 'png', 'gif', 'txt', 'csv', 'json'
}

# 업로드 폴더 생성
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 분석 시스템 초기화
analysis_system = GaepoSungAdvancedAnalysisSystem()
analysis_system.start_analysis_engine()

# 고도화된 AI 분석 엔진 초기화
advanced_ai_engine = AdvancedAIAnalysisEngine()

# 고급 NLP 엔진 초기화
advanced_nlp_engine = AdvancedNLPEngine(use_gpu=True)

# 지능형 질문 분석기 초기화
intelligent_analyzer = IntelligentQuestionAnalyzer()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def allowed_file(filename):
    """허용된 파일 확장자 확인"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'system': 'CORBU.AI Analysis Platform'
    })

@app.route('/api/files/upload', methods=['POST'])
def upload_file():
    """파일 업로드"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': '파일이 없습니다'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '파일이 선택되지 않았습니다'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # 분석 시스템에 파일 추가
            file_id = analysis_system.add_media_file(file_path)
            
            return jsonify({
                'success': True,
                'file_id': file_id,
                'filename': filename,
                'message': '파일이 성공적으로 업로드되었습니다'
            })
        
        return jsonify({'error': '허용되지 않는 파일 형식입니다'}), 400
        
    except Exception as e:
        logger.error(f"파일 업로드 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/files', methods=['GET'])
def get_files():
    """업로드된 파일 목록 조회"""
    try:
        files = analysis_system.get_all_media_files()
        file_list = []
        
        for file in files:
            file_list.append({
                'file_id': file.file_id,
                'filename': file.filename,
                'file_type': file.file_type,
                'file_size': file.file_size,
                'upload_time': file.upload_time,
                'metadata': file.metadata
            })
        
        return jsonify({
            'success': True,
            'files': file_list,
            'total_count': len(file_list)
        })
        
    except Exception as e:
        logger.error(f"파일 목록 조회 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/comprehensive', methods=['POST'])
def start_comprehensive_analysis():
    """종합 분석 시작"""
    try:
        data = request.get_json()
        file_ids = data.get('file_ids', [])
        
        if not file_ids:
            return jsonify({'error': '분석할 파일 ID가 필요합니다'}), 400
        
        # 분석 작업 큐에 추가
        analysis_system.queue_comprehensive_analysis(file_ids)
        
        return jsonify({
            'success': True,
            'message': '종합 분석이 시작되었습니다',
            'file_count': len(file_ids),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"종합 분석 시작 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/results', methods=['GET'])
def get_analysis_results():
    """분석 결과 조회"""
    try:
        analysis_id = request.args.get('analysis_id')
        
        if analysis_id:
            # 특정 분석 결과 조회
            result = analysis_system.get_analysis_result(analysis_id)
            if result:
                return jsonify({
                    'success': True,
                    'result': {
                        'analysis_id': result.analysis_id,
                        'timestamp': result.timestamp,
                        'analysis_type': result.analysis_type,
                        'content': result.content,
                        'confidence_score': result.confidence_score,
                        'source_files': result.source_files,
                        'metadata': result.metadata
                    }
                })
            else:
                return jsonify({'error': '분석 결과를 찾을 수 없습니다'}), 404
        else:
            # 모든 분석 결과 조회 (구현 필요)
            return jsonify({
                'success': True,
                'results': [],
                'message': '전체 분석 결과 조회 기능은 개발 중입니다'
            })
        
    except Exception as e:
        logger.error(f"분석 결과 조회 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/status', methods=['GET'])
def get_analysis_status():
    """분석 상태 조회"""
    try:
        return jsonify({
            'success': True,
            'status': {
                'system_running': analysis_system.running,
                'queue_size': analysis_system.analysis_queue.qsize(),
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"분석 상태 조회 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/project/context', methods=['POST'])
def set_project_context():
    """프로젝트 컨텍스트 설정"""
    try:
        data = request.get_json()
        project_name = data.get('project_name', '개포우성')
        description = data.get('description', '')
        settings = data.get('settings', {})
        
        # 프로젝트 컨텍스트 저장
        context_id = f"context_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        with analysis_system.db_path as conn:
            conn.execute("""
                INSERT OR REPLACE INTO project_context 
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                context_id,
                project_name,
                description,
                datetime.now().isoformat(),
                datetime.now().isoformat(),
                json.dumps(settings)
            ))
            conn.commit()
        
        return jsonify({
            'success': True,
            'context_id': context_id,
            'message': '프로젝트 컨텍스트가 설정되었습니다'
        })
        
    except Exception as e:
        logger.error(f"프로젝트 컨텍스트 설정 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/quick', methods=['POST'])
def quick_analysis():
    """빠른 분석 (실시간)"""
    try:
        data = request.get_json()
        file_ids = data.get('file_ids', [])
        analysis_type = data.get('analysis_type', 'comprehensive')
        
        if not file_ids:
            return jsonify({'error': '분석할 파일 ID가 필요합니다'}), 400
        
        # 즉시 분석 실행
        if analysis_type == 'researcher':
            result = analysis_system._researcher_analysis(file_ids)
        elif analysis_type == 'policy':
            result = analysis_system._policy_analysis(file_ids)
        elif analysis_type == 'public_opinion':
            result = analysis_system._public_opinion_analysis(file_ids)
        elif analysis_type == 'real_estate':
            result = analysis_system._real_estate_analysis(file_ids)
        elif analysis_type == 'sociological':
            result = analysis_system._sociological_analysis(file_ids)
        else:
            return jsonify({'error': '지원하지 않는 분석 타입입니다'}), 400
        
        return jsonify({
            'success': True,
            'analysis_type': analysis_type,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"빠른 분석 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/advanced-ai', methods=['POST'])
def advanced_ai_analysis():
    """고도화된 AI 분석 (ChatGPT 수준)"""
    try:
        data = request.get_json()
        user_input = data.get('user_input', '')
        project_id = data.get('project_id', 'gaeposung_project')
        user_id = data.get('user_id', 'default_user')
        analysis_depth = data.get('analysis_depth', 'advanced')
        
        if not user_input:
            return jsonify({'error': '사용자 입력이 필요합니다'}), 400
        
        # 컨텍스트 생성
        context = AnalysisContext(
            user_id=user_id,
            project_id=project_id,
            conversation_history=data.get('conversation_history', []),
            uploaded_files=data.get('uploaded_files', []),
            user_preferences=data.get('user_preferences', {}),
            current_focus=data.get('current_focus', 'general'),
            analysis_depth=analysis_depth
        )
        
        # 고도화된 AI 분석 실행
        response = advanced_ai_engine.deep_understanding_analysis(
            user_input=user_input,
            context=context,
            analysis_type='comprehensive'
        )
        
        return jsonify({
            'success': True,
            'response': {
                'direct_answer': response.direct_answer,
                'contextual_explanation': response.contextual_explanation,
                'related_insights': response.related_insights,
                'follow_up_questions': response.follow_up_questions,
                'confidence_level': response.confidence_level,
                'sources': response.sources,
                'next_steps': response.next_steps
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"고도화된 AI 분석 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/advanced-nlp', methods=['POST'])
def advanced_nlp_analysis():
    """고급 NLP 분석 (최상급 성능)"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        analysis_type = data.get('analysis_type', 'semantic')
        context = data.get('context', {})
        
        if not text:
            return jsonify({'error': '분석할 텍스트가 필요합니다'}), 400
        
        # 고급 NLP 분석 실행
        if analysis_type == 'semantic':
            result = advanced_nlp_engine.advanced_semantic_analysis(text, context)
            
            return jsonify({
                'success': True,
                'analysis_type': 'semantic',
                'result': {
                    'surface_meaning': result.surface_meaning,
                    'contextual_meaning': result.contextual_meaning,
                    'implicit_meaning': result.implicit_meaning,
                    'emotional_tone': result.emotional_tone,
                    'user_intent': result.user_intent,
                    'confidence_score': result.confidence_score,
                    'related_concepts': result.related_concepts,
                    'suggested_questions': result.suggested_questions,
                    'semantic_similarity': result.semantic_similarity,
                    'discourse_analysis': result.discourse_analysis
                },
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': '지원하지 않는 분석 타입입니다'}), 400
        
    except Exception as e:
        logger.error(f"고급 NLP 분석 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/intelligent-question', methods=['POST'])
def intelligent_question_analysis():
    """지능형 질문 분석 (최상급 성능)"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        context = data.get('context', {})
        
        if not question:
            return jsonify({'error': '분석할 질문이 필요합니다'}), 400
        
        # 지능형 질문 분석 실행
        result = intelligent_analyzer.analyze_question_intelligently(question, context)
        
        return jsonify({
            'success': True,
            'analysis_type': 'intelligent_question',
            'result': {
                'direct_answer': result.direct_answer,
                'comprehensive_analysis': result.comprehensive_analysis,
                'multiple_perspectives': result.multiple_perspectives,
                'actionable_insights': result.actionable_insights,
                'related_questions': result.related_questions,
                'confidence_score': result.confidence_score,
                'reasoning_process': result.reasoning_process,
                'sources_and_evidence': result.sources_and_evidence,
                'next_steps': result.next_steps,
                'risk_assessment': result.risk_assessment
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"지능형 질문 분석 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/web-research', methods=['POST'])
def web_research_analysis():
    """웹 연구 기반 고도화된 분석 (최상급 성능)"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        context = data.get('context', {})
        
        if not question:
            return jsonify({'error': '분석할 질문이 필요합니다'}), 400
        
        # 웹 연구 기반 종합 분석 실행 (동기 버전)
        import asyncio
        result = asyncio.run(web_research_engine.comprehensive_research(question, context))
        
        return jsonify({
            'success': True,
            'analysis_type': 'web_research',
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"웹 연구 분석 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    """파일 삭제"""
    try:
        # 파일 정보 조회
        files = analysis_system.get_all_media_files()
        target_file = None
        
        for file in files:
            if file.file_id == file_id:
                target_file = file
                break
        
        if not target_file:
            return jsonify({'error': '파일을 찾을 수 없습니다'}), 404
        
        # 파일 삭제
        if os.path.exists(target_file.file_path):
            os.remove(target_file.file_path)
        
        # 데이터베이스에서 삭제
        with analysis_system.db_path as conn:
            conn.execute("DELETE FROM media_files WHERE file_id = ?", (file_id,))
            conn.commit()
        
        return jsonify({
            'success': True,
            'message': '파일이 삭제되었습니다'
        })
        
    except Exception as e:
        logger.error(f"파일 삭제 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/export', methods=['POST'])
def export_analysis():
    """분석 결과 내보내기"""
    try:
        data = request.get_json()
        analysis_id = data.get('analysis_id')
        export_format = data.get('format', 'json')
        
        if not analysis_id:
            return jsonify({'error': '분석 ID가 필요합니다'}), 400
        
        result = analysis_system.get_analysis_result(analysis_id)
        if not result:
            return jsonify({'error': '분석 결과를 찾을 수 없습니다'}), 404
        
        if export_format == 'json':
            return jsonify({
                'success': True,
                'analysis_result': {
                    'analysis_id': result.analysis_id,
                    'timestamp': result.timestamp,
                    'analysis_type': result.analysis_type,
                    'content': result.content,
                    'confidence_score': result.confidence_score,
                    'source_files': result.source_files,
                    'metadata': result.metadata
                }
            })
        else:
            return jsonify({'error': '지원하지 않는 내보내기 형식입니다'}), 400
        
    except Exception as e:
        logger.error(f"분석 결과 내보내기 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversational/qa', methods=['POST'])
def conversational_qa():
    """대화형 질문-답변 시스템"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        context = data.get('context', {})
        user_id = data.get('user_id', 'default_user')
        session_id = data.get('session_id', 'default_session')
        
        if not question:
            return jsonify({'error': '질문이 필요합니다'}), 400
        
        # 1. 질문 분석
        question_analysis = conversational_qa_system.analyze_question(question, context)
        
        # 2. 답변 찾기
        answer = asyncio.run(conversational_qa_system.find_answer(question_analysis))
        
        # 3. 대화 저장
        asyncio.run(conversational_qa_system.save_conversation(answer, user_id, session_id))
        
        return jsonify({
            'success': True,
            'analysis_type': 'conversational_qa',
            'result': {
                'question': answer.question,
                'answer': answer.answer,
                'confidence': answer.confidence,
                'question_analysis': {
                    'question_type': question_analysis.question_type,
                    'keywords': question_analysis.keywords,
                    'entities': question_analysis.entities,
                    'intent': question_analysis.intent,
                    'confidence': question_analysis.confidence
                },
                'sources': [
                    {
                        'source_id': source.source_id,
                        'source_type': source.source_type,
                        'content': source.content[:200] + '...' if len(source.content) > 200 else source.content,
                        'relevance_score': source.relevance_score,
                        'confidence': source.confidence
                    } for source in answer.sources
                ],
                'follow_up_questions': answer.follow_up_questions,
                'related_topics': answer.related_topics,
                'timestamp': answer.timestamp.isoformat()
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"대화형 QA 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversational/knowledge', methods=['POST'])
def add_knowledge():
    """지식 베이스에 정보 추가"""
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        content = data.get('content', '')
        source_type = data.get('source_type', 'manual')
        relevance_score = data.get('relevance_score', 0.8)
        confidence = data.get('confidence', 0.9)
        
        if not topic or not content:
            return jsonify({'error': '주제와 내용이 필요합니다'}), 400
        
        # 지식 베이스에 추가
        asyncio.run(conversational_qa_system.add_knowledge(
            topic, content, source_type, relevance_score, confidence
        ))
        
        return jsonify({
            'success': True,
            'message': f"지식 베이스에 '{topic}' 추가됨",
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"지식 베이스 추가 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/system/info', methods=['GET'])
def get_system_info():
    """시스템 정보 조회"""
    try:
        files = analysis_system.get_all_media_files()
        
        # 파일 타입별 통계
        file_types = {}
        total_size = 0
        
        for file in files:
            file_type = file.file_type
            if file_type not in file_types:
                file_types[file_type] = {'count': 0, 'size': 0}
            
            file_types[file_type]['count'] += 1
            file_types[file_type]['size'] += file.file_size
            total_size += file.file_size
        
        return jsonify({
            'success': True,
            'system_info': {
                'total_files': len(files),
                'total_size': total_size,
                'file_types': file_types,
                'system_running': analysis_system.running,
                'queue_size': analysis_system.analysis_queue.qsize(),
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"시스템 정보 조회 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """404 에러 핸들러"""
    return jsonify({'error': '요청한 리소스를 찾을 수 없습니다'}), 404

@app.errorhandler(500)
def internal_error(error):
    """500 에러 핸들러"""
    return jsonify({'error': '내부 서버 오류가 발생했습니다'}), 500

if __name__ == '__main__':
    print("개포우성 분석 API 서버를 시작합니다...")
    print(f"업로드 폴더: {UPLOAD_FOLDER}")
    print("API 엔드포인트:")
    print("  - GET  /api/health : 헬스 체크")
    print("  - POST /api/files/upload : 파일 업로드")
    print("  - GET  /api/files : 파일 목록 조회")
    print("  - POST /api/analysis/comprehensive : 종합 분석 시작")
    print("  - GET  /api/analysis/results : 분석 결과 조회")
    print("  - GET  /api/analysis/status : 분석 상태 조회")
    print("  - POST /api/analysis/quick : 빠른 분석")
    print("  - POST /api/project/context : 프로젝트 컨텍스트 설정")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
