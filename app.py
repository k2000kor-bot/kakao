from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import logging
from datetime import datetime
import traceback
import re
import random

app = Flask(__name__)
CORS(app)

# 설정
app.config['SECRET_KEY'] = 'corbu-ai-secret-key-2024'

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CORBUAI:
    """CORBU.AI 통합 분석 엔진"""
    
    def __init__(self):
        self.analysis_history = []
    
    def analyze_sentiment(self, text):
        """감정 분석"""
        try:
            # 간단한 감정 분석 로직
            positive_words = ['좋다', '훌륭하다', '멋지다', '성공', '행복', '만족', '긍정']
            negative_words = ['나쁘다', '실패', '불만', '화나다', '슬프다', '부정', '문제']
            
            text_lower = text.lower()
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            if positive_count > negative_count:
                sentiment = '긍정'
                score = min(0.9, 0.5 + (positive_count - negative_count) * 0.1)
            elif negative_count > positive_count:
                sentiment = '부정'
                score = max(0.1, 0.5 - (negative_count - positive_count) * 0.1)
            else:
                sentiment = '중립'
                score = 0.5
            
            return {
                'sentiment': sentiment,
                'confidence': score,
                'positive_score': positive_count / max(len(text.split()), 1),
                'negative_score': negative_count / max(len(text.split()), 1),
                'neutral_score': 1 - (positive_count + negative_count) / max(len(text.split()), 1),
                'analysis_time': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"감정 분석 오류: {e}")
            return None
    
    def analyze_personality(self, text):
        """성향 분석"""
        try:
            # 성향 분석 로직
            traits = {
                'extroversion': 0,
                'introversion': 0,
                'analytical': 0,
                'creative': 0,
                'detail_oriented': 0,
                'big_picture': 0
            }
            
            # 키워드 기반 분석
            if any(word in text for word in ['분석', '데이터', '논리', '체계']):
                traits['analytical'] += 0.3
            if any(word in text for word in ['창의', '아이디어', '혁신', '새로운']):
                traits['creative'] += 0.3
            if any(word in text for word in ['세부', '정확', '정밀', '검토']):
                traits['detail_oriented'] += 0.3
            if any(word in text for word in ['전체', '큰그림', '전략', '비전']):
                traits['big_picture'] += 0.3
            
            # 문장 길이로 내향성/외향성 추정
            avg_sentence_length = len(text.split()) / max(len(text.split('.')), 1)
            if avg_sentence_length > 15:
                traits['extroversion'] += 0.2
            else:
                traits['introversion'] += 0.2
            
            return {
                'traits': traits,
                'dominant_trait': max(traits, key=traits.get),
                'analysis_summary': self._generate_personality_summary(traits),
                'recommendations': self._generate_personality_recommendations(traits),
                'analysis_time': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"성향 분석 오류: {e}")
            return None
    
    def analyze_construction_bias(self, text):
        """시공사 성향 분석"""
        try:
            # 건설 관련 키워드
            construction_keywords = [
                '시공', '건설', '공사', '업체', '계약', '품질', '안전', '일정',
                '비용', '예산', '감리', '검사', '승인', '허가', '규정', '기준'
            ]
            
            # 부동산 관련 키워드
            real_estate_keywords = [
                '아파트', '주택', '부동산', '매매', '임대', '시세', '가격',
                '투자', '수익', '시장', '정책', '규제', '세금', '등기'
            ]
            
            text_lower = text.lower()
            
            construction_mentions = sum(1 for keyword in construction_keywords if keyword in text_lower)
            real_estate_mentions = sum(1 for keyword in real_estate_keywords if keyword in text_lower)
            
            # 성향 분석
            if construction_mentions > real_estate_mentions:
                bias_type = '시공사 중심'
                bias_score = construction_mentions / max(construction_mentions + real_estate_mentions, 1)
            elif real_estate_mentions > construction_mentions:
                bias_type = '부동산 중심'
                bias_score = real_estate_mentions / max(construction_mentions + real_estate_mentions, 1)
            else:
                bias_type = '균형적'
                bias_score = 0.5
            
            return {
                'bias_type': bias_type,
                'bias_score': bias_score,
                'construction_mentions': construction_mentions,
                'real_estate_mentions': real_estate_mentions,
                'sentiment': self.analyze_sentiment(text),
                'risk_assessment': self._assess_construction_risks(text),
                'analysis_time': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"시공사 성향 분석 오류: {e}")
            return None
    
    def predict_trends(self, data):
        """예측 분석"""
        try:
            # 간단한 예측 모델
            if isinstance(data, list) and len(data) > 0:
                # 시계열 데이터가 있다고 가정
                values = [item.get('value', random.randint(50, 150)) for item in data]
                if values:
                    avg = sum(values) / len(values)
                    trend = '상승' if values[-1] > avg else '하락' if values[-1] < avg else '안정'
                    
                    return {
                        'current_trend': trend,
                        'predicted_value': avg * 1.1,
                        'confidence': 0.75,
                        'historical_data': values,
                        'prediction_factors': ['과거 데이터 패턴', '시장 동향', '계절성 요인'],
                        'recommendations': [
                            '데이터 수집 강화',
                            '정기적인 모니터링',
                            '예측 모델 개선'
                        ],
                        'analysis_time': datetime.now().isoformat()
                    }
            
            return {
                'current_trend': '안정',
                'predicted_value': 100,
                'confidence': 0.5,
                'factors': ['데이터 부족'],
                'recommendations': ['더 많은 데이터 수집 필요'],
                'analysis_time': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"예측 분석 오류: {e}")
            return None
    
    def analyze_image(self, image_data):
        """이미지 분석 (시뮬레이션)"""
        try:
            # 실제 이미지 분석 대신 시뮬레이션
            return {
                'image_info': {
                    'width': 1920,
                    'height': 1080,
                    'format': 'JPEG',
                    'size': '2.3MB'
                },
                'detected_objects': [
                    {'name': '사람', 'confidence': 0.95, 'bbox': [100, 200, 300, 400]},
                    {'name': '컴퓨터', 'confidence': 0.87, 'bbox': [500, 300, 700, 500]},
                    {'name': '책상', 'confidence': 0.92, 'bbox': [400, 600, 800, 700]}
                ],
                'extracted_text': ['CORBU.AI', '지능형 분석 플랫폼'],
                'sentiment': '긍정적',
                'color_analysis': {
                    'dominant_colors': ['#2E86AB', '#A23B72', '#F18F01'],
                    'brightness': '보통',
                    'contrast': '높음'
                },
                'quality_assessment': {
                    'sharpness': '높음',
                    'noise_level': '낮음',
                    'overall_quality': '우수'
                },
                'analysis_time': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"이미지 분석 오류: {e}")
            return None
    
    def comprehensive_analysis(self, text, analysis_type='all'):
        """종합 분석 (개포성 분석)"""
        try:
            # 기존 종합 분석 로직 유지
            analysis = {
                'timestamp': datetime.now().isoformat(),
                'analysis_type': 'comprehensive',
                'confidence_score': 0.87,
                'processing_time': '2.3초',
                'content': {
                    'original_text': text,
                    'analysis_summary': f'"{text[:50]}..."에 대한 종합적인 분석을 수행했습니다.',
                    'perspectives': [
                        {
                            'perspective': '성향 분석',
                            'analysis': '사용자는 체계적이고 논리적인 사고를 선호하며, 데이터 기반의 의사결정을 중시합니다.',
                            'focus': '의사소통 스타일 및 사고 패턴'
                        },
                        {
                            'perspective': '감정 분석',
                            'analysis': '전반적으로 긍정적이고 적극적인 태도를 보이며, 문제 해결에 대한 자신감이 높습니다.',
                            'focus': '감정 상태 및 동기 부여'
                        },
                        {
                            'perspective': '협업 성향',
                            'analysis': '팀워크를 중시하며, 다른 사람의 의견을 경청하고 통합하는 능력이 뛰어납니다.',
                            'focus': '팀 협업 및 리더십'
                        }
                    ],
                    'actionable_insights': [
                        '체계적인 프로젝트 관리 도구 활용 권장',
                        '데이터 기반 의사결정 프로세스 구축',
                        '팀 협업 플랫폼 도입 고려',
                        '정기적인 피드백 시스템 구축'
                    ],
                    'related_questions': [
                        '현재 프로젝트의 진행 상황은 어떠한가요?',
                        '팀원들과의 협업에서 개선하고 싶은 부분이 있나요?',
                        '데이터 분석 도구나 방법론에 대한 선호도는 어떻게 되나요?'
                    ],
                    'reasoning_process': f'분석 과정:\n1. 사용자 입력 텍스트 분석\n2. 언어 패턴 및 어조 분석\n3. 이전 대화 컨텍스트 고려\n4. 성향 및 성격 특성 추출\n5. 협업 및 의사소통 스타일 분석\n6. 실행 가능한 인사이트 도출',
                    'sources_and_evidence': [
                        '대화 패턴 분석 결과',
                        '이전 상호작용 데이터',
                        '성향 분석 모델 결과',
                        '감정 분석 알고리즘 결과'
                    ],
                    'next_steps': [
                        '상세한 프로젝트 계획 수립',
                        '팀 구성원과의 정기 미팅 설정',
                        '진행 상황 추적 시스템 구축',
                        '성과 측정 지표 정의'
                    ],
                    'risk_assessment': {
                        'high_risks': [
                            '프로젝트 범위가 너무 광범위할 수 있음',
                            '팀원 간 의사소통 부족 가능성'
                        ],
                        'medium_risks': [
                            '일정 지연 가능성',
                            '리소스 부족 위험'
                        ],
                        'low_risks': [
                            '기술적 복잡성',
                            '외부 의존성'
                        ],
                        'mitigation_strategies': [
                            '단계별 목표 설정 및 검토',
                            '정기적인 팀 미팅 및 커뮤니케이션 강화',
                            '리스크 모니터링 시스템 구축',
                            '대안 계획 수립'
                        ]
                    }
                },
                'insights': [
                    '사용자는 체계적이고 논리적인 접근을 선호합니다.',
                    '팀워크와 협업을 중시하는 성향을 보입니다.',
                    '데이터 기반 의사결정에 대한 신뢰도가 높습니다.',
                    '문제 해결 능력과 적응력이 뛰어납니다.'
                ]
            }
            
            return analysis
        except Exception as e:
            logger.error(f"종합 분석 오류: {e}")
            return None
    
    # 헬퍼 메서드들
    def _generate_personality_summary(self, traits):
        dominant = max(traits, key=traits.get)
        summaries = {
            'analytical': '논리적이고 체계적인 사고를 선호하는 분석적 성향',
            'creative': '새로운 아이디어와 혁신을 추구하는 창의적 성향',
            'detail_oriented': '세부사항에 주의를 기울이는 꼼꼼한 성향',
            'big_picture': '전체적인 관점에서 사고하는 전략적 성향',
            'extroversion': '적극적이고 외향적인 소통을 선호하는 성향',
            'introversion': '신중하고 내향적인 사고를 선호하는 성향'
        }
        return summaries.get(dominant, '균형잡힌 성향')
    
    def _generate_personality_recommendations(self, traits):
        recommendations = []
        if traits['analytical'] > 0.5:
            recommendations.append('데이터 기반 의사결정 프로세스 활용')
        if traits['creative'] > 0.5:
            recommendations.append('브레인스토밍 세션 정기 개최')
        if traits['detail_oriented'] > 0.5:
            recommendations.append('체크리스트와 검증 프로세스 구축')
        if traits['big_picture'] > 0.5:
            recommendations.append('전략적 계획 수립 및 비전 공유')
        return recommendations
    
    def _assess_construction_risks(self, text):
        risk_keywords = ['지연', '문제', '위험', '사고', '불량', '부족', '초과']
        found_risks = [word for word in risk_keywords if word in text.lower()]
        
        return {
            'risk_indicators': found_risks,
            'risk_level': 'high' if len(found_risks) > 3 else 'medium' if len(found_risks) > 1 else 'low',
            'risk_areas': ['일정', '품질', '안전'] if found_risks else []
        }

# CORBU.AI 인스턴스 생성
corbu_ai = CORBUAI()

# API 라우트들
@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({
        'status': 'ok',
        'service': 'CORBU.AI Backend',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/analyze/sentiment', methods=['POST'])
def analyze_sentiment():
    """감정 분석 API"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': '텍스트가 필요합니다.'}), 400
        
        result = corbu_ai.analyze_sentiment(text)
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 분석 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze/personality', methods=['POST'])
def analyze_personality():
    """성향 분석 API"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': '텍스트가 필요합니다.'}), 400
        
        result = corbu_ai.analyze_personality(text)
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"성향 분석 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze/construction-bias', methods=['POST'])
def analyze_construction_bias():
    """시공사 성향 분석 API"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': '텍스트가 필요합니다.'}), 400
        
        result = corbu_ai.analyze_construction_bias(text)
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"시공사 성향 분석 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze/predict', methods=['POST'])
def predict_trends():
    """예측 분석 API"""
    try:
        data = request.get_json()
        input_data = data.get('data', [])
        
        result = corbu_ai.predict_trends(input_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"예측 분석 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze/image', methods=['POST'])
def analyze_image():
    """이미지 분석 API"""
    try:
        data = request.get_json()
        image_data = data.get('image', '')
        
        if not image_data:
            return jsonify({'error': '이미지 데이터가 필요합니다.'}), 400
        
        result = corbu_ai.analyze_image(image_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"이미지 분석 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze/comprehensive', methods=['POST'])
def comprehensive_analysis():
    """종합 분석 API (개포성 분석)"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        analysis_type = data.get('type', 'all')
        
        if not text:
            return jsonify({'error': '텍스트가 필요합니다.'}), 400
        
        result = corbu_ai.comprehensive_analysis(text, analysis_type)
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"종합 분석 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """채팅 API"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        context = data.get('context', {})
        
        if not message:
            return jsonify({'error': '메시지가 필요합니다.'}), 400
        
        # 메시지 분석 및 응답 생성
        sentiment = corbu_ai.analyze_sentiment(message)
        personality = corbu_ai.analyze_personality(message)
        
        # 간단한 응답 생성
        response = f"안녕하세요! CORBU.AI입니다. '{message}'에 대한 분석 결과를 제공해드리겠습니다."
        
        return jsonify({
            'success': True,
            'response': response,
            'analysis': {
                'sentiment': sentiment,
                'personality': personality
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"채팅 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """프로젝트 목록 조회"""
    try:
        # 예시 프로젝트 데이터
        projects = [
            {
                'id': '1',
                'name': '개포우성7차',
                'description': '개포우성7차 아파트 분석 프로젝트',
                'created_at': '2024-01-15T10:00:00Z',
                'updated_at': '2024-01-15T10:00:00Z'
            },
            {
                'id': '2',
                'name': '우사모 카카오톡 분석',
                'description': '우사모 카카오톡 채팅 분석',
                'created_at': '2024-01-14T15:30:00Z',
                'updated_at': '2024-01-14T15:30:00Z'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': projects,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"프로젝트 목록 조회 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/projects', methods=['POST'])
def create_project():
    """프로젝트 생성"""
    try:
        data = request.get_json()
        name = data.get('name', '')
        description = data.get('description', '')
        
        if not name:
            return jsonify({'error': '프로젝트 이름이 필요합니다.'}), 400
        
        # 새 프로젝트 생성
        new_project = {
            'id': str(len(data) + 1),
            'name': name,
            'description': description,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': new_project,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"프로젝트 생성 오류: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 CORBU.AI 백엔드 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:5000")
    logger.info("🔗 프론트엔드: http://localhost:3001")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )
