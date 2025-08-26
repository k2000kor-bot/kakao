from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
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
        """CORBU.AI 초기화"""
        self.conversation_history = []
        self.emotion_patterns = {}
        self.emotion_metrics = {
            'total_analyses': 0,
            'emotion_distribution': {},
            'average_confidence': 0.0
        }
        
        # 데이터 분석 관련 속성
        self.data_sources = []
        self.data_analyses = []
        self.data_visualizations = []
        self.data_insights = []
        
        # 품질 보증 관련 속성
        self.quality_tests = []
        self.quality_metrics = {}
        self.quality_reports = {}
        
        # 성능 최적화 관련 속성
        self.performance_metrics = []
        self.optimization_rules = []
        self.system_health = {
            'overall_status': 'healthy',
            'systems': {},
            'recommendations': [],
            'alerts': []
        }
        
        # 샘플 데이터 초기화
        self._initialize_emotion_recognition_data()
        self._initialize_data_analytics_data()
        self._initialize_quality_assurance_data()
        self._initialize_performance_optimization_data()
    
    def analyze_sentiment(self, text):
        """감정 분석"""
        try:
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
    
    def analyze_emotion(self, content, analysis_type='text', context=None):
        """감정 분석"""
        try:
            if analysis_type == 'text':
                return self._analyze_text_emotion(content, context)
            elif analysis_type == 'voice':
                return self._analyze_voice_emotion(content, context)
            elif analysis_type == 'facial':
                return self._analyze_facial_emotion(content, context)
            elif analysis_type == 'multimodal':
                return self._analyze_multimodal_emotion(content, context)
            else:
                return self._analyze_text_emotion(content, context)
        except Exception as e:
            logger.error(f"감정 분석 오류: {e}")
            return None

    def _analyze_text_emotion(self, text, context=None):
        """텍스트 감정 분석"""
        try:
            emotion_keywords = {
                'joy': ['기쁘다', '행복하다', '즐겁다', '신나다', '만족하다', '성공', '축하'],
                'sadness': ['슬프다', '우울하다', '실망하다', '아쉽다', '후회하다', '실패'],
                'anger': ['화나다', '분노하다', '짜증나다', '열받다', '불만', '문제'],
                'fear': ['무섭다', '겁나다', '걱정하다', '불안하다', '위험', '두렵다'],
                'surprise': ['놀랐다', '깜짝', '예상밖', '충격', '믿을수없다'],
                'love': ['사랑하다', '좋아하다', '애정', '관심', '따뜻하다'],
                'confusion': ['혼란', '어렵다', '이해안된다', '모르겠다', '복잡하다'],
                'excitement': ['흥미진진하다', '재미있다', '새롭다', '도전', '모험'],
                'anxiety': ['불안하다', '긴장하다', '스트레스', '압박', '부담'],
                'relief': ['안심하다', '다행이다', '해결', '완료', '성공']
            }

            text_lower = text.lower()
            detected_emotions = []

            for emotion, keywords in emotion_keywords.items():
                matches = sum(1 for keyword in keywords if keyword in text_lower)
                if matches > 0:
                    intensity = min(1.0, matches * 0.3)
                    confidence = min(1.0, matches * 0.4)
                    
                    detected_emotions.append({
                        'emotion': emotion,
                        'intensity': intensity,
                        'confidence': confidence,
                        'valence': self._calculate_valence(emotion, intensity),
                        'arousal': self._calculate_arousal(emotion, intensity),
                        'dominance': self._calculate_dominance(emotion, intensity)
                    })

            if not detected_emotions:
                detected_emotions.append({
                    'emotion': 'neutral',
                    'intensity': 0.3,
                    'confidence': 0.5,
                    'valence': 0.5,
                    'arousal': 0.3,
                    'dominance': 0.5
                })

            detected_emotions.sort(key=lambda x: x['intensity'], reverse=True)
            
            return {
                'id': f'emotion-{datetime.now().timestamp()}',
                'content': text,
                'type': 'text',
                'detected_emotions': detected_emotions,
                'dominant_emotion': detected_emotions[0],
                'context': context or {},
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': sum(e['confidence'] for e in detected_emotions) / len(detected_emotions)
            }
        except Exception as e:
            logger.error(f"텍스트 감정 분석 오류: {e}")
            return None
    
    def _analyze_voice_emotion(self, audio_data, context=None):
        """음성 감정 분석 (시뮬레이션)"""
        try:
            emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'confusion', 'excitement', 'anxiety', 'relief']
            dominant_emotion = random.choice(emotions)
            
            detected_emotions = [{
                'emotion': dominant_emotion,
                'intensity': random.uniform(0.6, 0.9),
                'confidence': random.uniform(0.7, 0.95),
                'valence': self._calculate_valence(dominant_emotion, 0.7),
                'arousal': self._calculate_arousal(dominant_emotion, 0.7),
                'dominance': self._calculate_dominance(dominant_emotion, 0.7)
            }]

            return {
                'id': f'emotion-{datetime.now().timestamp()}',
                'content': '음성 데이터',
                'type': 'voice',
                'detected_emotions': detected_emotions,
                'dominant_emotion': detected_emotions[0],
                'context': context or {},
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': detected_emotions[0]['confidence']
            }
        except Exception as e:
            logger.error(f"음성 감정 분석 오류: {e}")
            return None

    def _analyze_facial_emotion(self, image_data, context=None):
        """표정 감정 분석 (시뮬레이션)"""
        try:
            emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'confusion', 'excitement', 'anxiety', 'relief']
            dominant_emotion = random.choice(emotions)
            
            detected_emotions = [{
                'emotion': dominant_emotion,
                'intensity': random.uniform(0.5, 0.8),
                'confidence': random.uniform(0.6, 0.9),
                'valence': self._calculate_valence(dominant_emotion, 0.6),
                'arousal': self._calculate_arousal(dominant_emotion, 0.6),
                'dominance': self._calculate_dominance(dominant_emotion, 0.6)
            }]
            
            return {
                'id': f'emotion-{datetime.now().timestamp()}',
                'content': '이미지 데이터',
                'type': 'facial',
                'detected_emotions': detected_emotions,
                'dominant_emotion': detected_emotions[0],
                'context': context or {},
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': detected_emotions[0]['confidence']
            }
        except Exception as e:
            logger.error(f"표정 감정 분석 오류: {e}")
            return None
    
    def _analyze_multimodal_emotion(self, data, context=None):
        """멀티모달 감정 분석"""
        try:
            text_result = self._analyze_text_emotion(data.get('text', ''), context)
            voice_result = self._analyze_voice_emotion(data.get('voice', ''), context)
            facial_result = self._analyze_facial_emotion(data.get('facial', ''), context)

            all_emotions = []
            if text_result:
                all_emotions.extend(text_result['detected_emotions'])
            if voice_result:
                all_emotions.extend(voice_result['detected_emotions'])
            if facial_result:
                all_emotions.extend(facial_result['detected_emotions'])

            emotion_scores = {}
            for emotion in all_emotions:
                emo_type = emotion['emotion']
                if emo_type not in emotion_scores:
                    emotion_scores[emo_type] = {'total_intensity': 0, 'total_confidence': 0, 'count': 0}
                
                emotion_scores[emo_type]['total_intensity'] += emotion['intensity']
                emotion_scores[emo_type]['total_confidence'] += emotion['confidence']
                emotion_scores[emo_type]['count'] += 1

            integrated_emotions = []
            for emo_type, scores in emotion_scores.items():
                avg_intensity = scores['total_intensity'] / scores['count']
                avg_confidence = scores['total_confidence'] / scores['count']
                
                integrated_emotions.append({
                    'emotion': emo_type,
                    'intensity': avg_intensity,
                    'confidence': avg_confidence,
                    'valence': self._calculate_valence(emo_type, avg_intensity),
                    'arousal': self._calculate_arousal(emo_type, avg_intensity),
                    'dominance': self._calculate_dominance(emo_type, avg_intensity)
                })

            integrated_emotions.sort(key=lambda x: x['intensity'], reverse=True)
                    
                    return {
                'id': f'emotion-{datetime.now().timestamp()}',
                'content': '멀티모달 데이터',
                'type': 'multimodal',
                'detected_emotions': integrated_emotions,
                'dominant_emotion': integrated_emotions[0] if integrated_emotions else None,
                'context': context or {},
                'timestamp': datetime.now().isoformat(),
                'analysis_confidence': sum(e['confidence'] for e in integrated_emotions) / len(integrated_emotions) if integrated_emotions else 0.5
            }
        except Exception as e:
            logger.error(f"멀티모달 감정 분석 오류: {e}")
            return None

    def _calculate_valence(self, emotion, intensity):
        """가치(긍정/부정) 계산"""
        positive_emotions = ['joy', 'love', 'excitement', 'relief']
        negative_emotions = ['sadness', 'anger', 'fear', 'anxiety']
        
        if emotion in positive_emotions:
            return 0.5 + (intensity * 0.5)
        elif emotion in negative_emotions:
            return 0.5 - (intensity * 0.5)
        else:
            return 0.5

    def _calculate_arousal(self, emotion, intensity):
        """각성 수준 계산"""
        high_arousal = ['joy', 'anger', 'fear', 'surprise', 'excitement', 'anxiety']
        low_arousal = ['sadness', 'love', 'confusion', 'relief']
        
        if emotion in high_arousal:
            return 0.5 + (intensity * 0.5)
        elif emotion in low_arousal:
            return 0.5 - (intensity * 0.3)
        else:
            return 0.5

    def _calculate_dominance(self, emotion, intensity):
        """지배성 계산"""
        high_dominance = ['joy', 'anger', 'excitement', 'love']
        low_dominance = ['fear', 'sadness', 'anxiety', 'confusion']
        
        if emotion in high_dominance:
            return 0.5 + (intensity * 0.5)
        elif emotion in low_dominance:
            return 0.5 - (intensity * 0.5)
        else:
            return 0.5

    def generate_emotional_response(self, emotion_data, user_context=None):
        """감정 기반 응답 생성"""
        try:
            if not emotion_data or 'dominant_emotion' not in emotion_data:
                return None

            dominant_emotion = emotion_data['dominant_emotion']
            emotion_type = dominant_emotion['emotion']
            intensity = dominant_emotion['intensity']

            response_strategies = {
                'joy': {
                    'type': 'celebratory',
                    'tone': 'warm',
                    'templates': [
                        '정말 기쁜 일이군요! 🎉 그런 긍정적인 에너지가 느껴집니다.',
                        '축하드립니다! 😊 이런 순간들이 삶을 아름답게 만드는 것 같아요.',
                        '정말 좋은 소식이네요! 🌟 계속해서 이런 기쁨을 유지하시길 바랍니다.'
                    ]
                },
                'sadness': {
                    'type': 'supportive',
                    'tone': 'warm',
                    'templates': [
                        '마음이 아프시겠어요. 😔 이런 때는 충분히 쉬시는 것도 중요해요.',
                        '슬픈 마음을 이해합니다. 🤗 시간이 해결해줄 거예요.',
                        '힘든 시간을 보내고 계시는군요. 💙 제가 함께 있어드릴게요.'
                    ]
                },
                'anger': {
                    'type': 'calming',
                    'tone': 'professional',
                    'templates': [
                        '화가 나시는 것 같아요. 😤 깊은 숨을 한 번 쉬어보세요.',
                        '분노를 이해합니다. 😔 차분히 생각해보면 해결책이 보일 거예요.',
                        '짜증나시는 상황이군요. 😌 잠시 마음을 가라앉혀보세요.'
                    ]
                },
                'fear': {
                    'type': 'supportive',
                    'tone': 'warm',
                    'templates': [
                        '걱정되시는군요. 😰 하지만 함께 해결해나갈 수 있어요.',
                        '두려운 마음이 드시겠어요. 🤗 차근차근 접근해보세요.',
                        '불안하시는 것 같아요. 💪 용기를 내세요, 잘 해낼 수 있을 거예요.'
                    ]
                },
                'surprise': {
                    'type': 'encouraging',
                    'tone': 'friendly',
                    'templates': [
                        '정말 놀라운 일이군요! 😲 이런 예상 밖의 상황이 흥미롭네요.',
                        '깜짝 놀라셨겠어요! 😱 새로운 경험이 될 것 같아요.',
                        '믿을 수 없는 일이네요! 🤯 어떻게 대응하실 건가요?'
                    ]
                },
                'love': {
                    'type': 'empathic',
                    'tone': 'warm',
                    'templates': [
                        '사랑스러운 마음이 느껴져요. 💕 그런 따뜻한 감정이 아름다워요.',
                        '애정이 가득하시군요. 💖 이런 순간들이 소중하죠.',
                        '따뜻한 마음이 전해져요. 💗 그런 감정을 소중히 여기세요.'
                    ]
                },
                'confusion': {
                    'type': 'analytical',
                    'tone': 'professional',
                    'templates': [
                        '혼란스러우시겠어요. 🤔 차근차근 정리해보면 도움이 될 거예요.',
                        '어려운 상황이군요. 💭 단계별로 접근해보는 건 어떨까요?',
                        '복잡한 문제네요. 🧠 천천히 생각해보시면 해결책이 보일 거예요.'
                    ]
                },
                'excitement': {
                    'type': 'encouraging',
                    'tone': 'playful',
                    'templates': [
                        '정말 흥미진진하시군요! 🎢 그런 열정이 멋져요!',
                        '신나는 일이 있으신가요? 🚀 계속해서 그 에너지를 유지하세요!',
                        '흥미로운 상황이네요! ⭐ 그런 호기심이 발전을 만들어요!'
                    ]
                },
                'anxiety': {
                    'type': 'calming',
                    'tone': 'warm',
                    'templates': [
                        '불안하시는군요. 😰 하지만 차분히 생각해보면 괜찮을 거예요.',
                        '긴장되시는 것 같아요. 😌 깊은 숨을 쉬며 마음을 가라앉혀보세요.',
                        '걱정이 많으시군요. 🤗 한 번에 하나씩 해결해나가면 됩니다.'
                    ]
                },
                'relief': {
                    'type': 'supportive',
                    'tone': 'warm',
                    'templates': [
                        '다행이네요! 😊 안심이 되셨겠어요.',
                        '해결되어서 좋으시겠어요! 😌 이제 마음이 편하실 거예요.',
                        '완료되어서 다행이에요! 🎉 수고하셨습니다.'
                    ]
                }
            }

            strategy = response_strategies.get(emotion_type, {
                'type': 'adaptive',
                'tone': 'friendly',
                'templates': ['현재 상황을 이해하고 있습니다. 어떻게 도움을 드릴까요?']
            })

            response_template = random.choice(strategy['templates'])
            
            if intensity > 0.8:
                response_template += ' 정말 강한 감정이 느껴져요.'
            elif intensity < 0.3:
                response_template += ' 조금은 차분한 상태인 것 같아요.'
            
            return {
                'id': f'response-{datetime.now().timestamp()}',
                'content': response_template,
                'response_type': strategy['type'],
                'tone': strategy['tone'],
                'target_emotion': emotion_type,
                'emotional_intelligence_score': self._calculate_emotional_intelligence(dominant_emotion),
                'appropriateness_score': self._calculate_appropriateness(dominant_emotion, strategy),
                'user_satisfaction_prediction': self._predict_user_satisfaction(dominant_emotion),
                'generated_at': datetime.now().isoformat(),
                'context': user_context or {}
            }
        except Exception as e:
            logger.error(f"감정 응답 생성 오류: {e}")
            return None
    
    def _calculate_emotional_intelligence(self, emotion):
        """감정 지능 점수 계산"""
        try:
            score = 0.7
            
            if emotion['intensity'] > 0.8:
                score += 0.1
            elif emotion['intensity'] < 0.3:
                score += 0.05
            
            if emotion['emotion'] in ['joy', 'love', 'excitement']:
                score += 0.1
            elif emotion['emotion'] in ['sadness', 'fear', 'anxiety']:
                score += 0.1
            
            return min(score, 1.0)
        except Exception as e:
            logger.error(f"감정 지능 점수 계산 오류: {e}")
            return 0.7

    def _calculate_appropriateness(self, emotion, strategy):
        """응답 적절성 점수 계산"""
        try:
            score = 0.8
            
            emotion_strategy_match = {
                'joy': ['celebratory', 'empathic'],
                'sadness': ['supportive', 'empathic'],
                'anger': ['calming', 'analytical'],
                'fear': ['supportive', 'calming'],
                'surprise': ['encouraging', 'analytical'],
                'love': ['empathic', 'supportive'],
                'confusion': ['analytical', 'supportive']
            }
            
            appropriate_strategies = emotion_strategy_match.get(emotion['emotion'], [])
            if strategy['type'] in appropriate_strategies:
                score += 0.1
            
            return min(score, 1.0)
        except Exception as e:
            logger.error(f"응답 적절성 점수 계산 오류: {e}")
            return 0.8

    def _predict_user_satisfaction(self, emotion):
        """사용자 만족도 예측"""
        try:
            prediction = 0.75
            
            if emotion['intensity'] > 0.7:
                prediction += 0.1
            elif emotion['intensity'] < 0.3:
                prediction += 0.05
            
            if emotion['emotion'] in ['joy', 'love']:
                prediction += 0.1
            elif emotion['emotion'] in ['sadness', 'fear']:
                prediction += 0.1
            
            return min(prediction, 1.0)
        except Exception as e:
            logger.error(f"사용자 만족도 예측 오류: {e}")
            return 0.75

    # 데이터 분석 시스템 메서드들
    def get_data_sources(self):
        """데이터 소스 조회"""
            return {
            'success': True,
            'data': self.data_sources,
            'timestamp': datetime.now().isoformat()
        }

    def create_data_source(self, source_data):
        """데이터 소스 생성"""
        source = {
            'id': f'source-{len(self.data_sources) + 1}',
            'name': source_data.get('name', '새 데이터 소스'),
            'type': source_data.get('type', 'database'),
            'url': source_data.get('url', ''),
            'status': 'active',
            'last_updated': datetime.now().isoformat()
        }
        self.data_sources.append(source)
        return {
            'success': True,
            'data': source,
            'timestamp': datetime.now().isoformat()
        }

    def get_data_analyses(self):
        """데이터 분석 작업 조회"""
        return {
            'success': True,
            'data': self.data_analyses,
            'timestamp': datetime.now().isoformat()
        }

    def create_data_analysis(self, analysis_data):
        """데이터 분석 작업 생성"""
        analysis = {
            'id': f'analysis-{len(self.data_analyses) + 1}',
            'name': analysis_data.get('name', '새 분석 작업'),
            'type': analysis_data.get('type', 'descriptive'),
            'status': 'pending',
            'source_id': analysis_data.get('source_id', ''),
            'created_at': datetime.now().isoformat()
        }
        self.data_analyses.append(analysis)
        return {
            'success': True,
            'data': analysis,
            'timestamp': datetime.now().isoformat()
        }

    def get_data_visualizations(self):
        """데이터 시각화 조회"""
        return {
            'success': True,
            'data': self.data_visualizations,
            'timestamp': datetime.now().isoformat()
        }

    def create_data_visualization(self, viz_data):
        """데이터 시각화 생성"""
        visualization = {
            'id': f'viz-{len(self.data_visualizations) + 1}',
            'name': viz_data.get('name', '새 시각화'),
            'type': viz_data.get('type', 'chart'),
            'analysis_id': viz_data.get('analysis_id', ''),
            'created_at': datetime.now().isoformat()
        }
        self.data_visualizations.append(visualization)
        return {
            'success': True,
            'data': visualization,
            'timestamp': datetime.now().isoformat()
        }

    def get_data_insights(self):
        """데이터 인사이트 조회"""
        return {
            'success': True,
            'data': self.data_insights,
            'timestamp': datetime.now().isoformat()
        }

    def get_data_analytics_metrics(self):
        """데이터 분석 메트릭 조회"""
        metrics = {
            'total_sources': len(self.data_sources),
            'total_analyses': len(self.data_analyses),
            'total_visualizations': len(self.data_visualizations),
            'total_insights': len(self.data_insights),
            'active_sources': len([s for s in self.data_sources if s.get('status') == 'active']),
            'completed_analyses': len([a for a in self.data_analyses if a.get('status') == 'completed'])
        }
        return {
            'success': True,
            'data': metrics,
            'timestamp': datetime.now().isoformat()
        }

    # 품질 보증 시스템 메서드들
    def get_quality_tests(self):
        """품질 테스트 조회"""
        return {
            'success': True,
            'data': self.quality_tests,
            'timestamp': datetime.now().isoformat()
        }

    def create_quality_test(self, test_data):
        """품질 테스트 생성"""
        test = {
            'id': f'test-{len(self.quality_tests) + 1}',
            'name': test_data.get('name', '새 품질 테스트'),
            'type': test_data.get('type', 'functional'),
            'category': test_data.get('category', 'general'),
            'priority': test_data.get('priority', 'medium'),
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }
        self.quality_tests.append(test)
        return {
            'success': True,
            'data': test,
            'timestamp': datetime.now().isoformat()
        }

    def get_quality_metrics(self):
        """품질 메트릭 조회"""
        metrics = {
            'total_tests': len(self.quality_tests),
            'passed_tests': len([t for t in self.quality_tests if t.get('status') == 'passed']),
            'failed_tests': len([t for t in self.quality_tests if t.get('status') == 'failed']),
            'pending_tests': len([t for t in self.quality_tests if t.get('status') == 'pending']),
            'success_rate': len([t for t in self.quality_tests if t.get('status') == 'passed']) / max(len(self.quality_tests), 1)
        }
        return {
            'success': True,
            'data': metrics,
            'timestamp': datetime.now().isoformat()
        }

    def get_quality_reports(self):
        """품질 보고서 조회"""
        return {
            'success': True,
            'data': self.quality_reports,
            'timestamp': datetime.now().isoformat()
        }

    # 샘플 데이터 초기화 메서드들
    def _initialize_sample_data_sources(self):
        """샘플 데이터 소스 초기화"""
        sample_sources = [
            {
                'id': 'source-1',
                'name': '사용자 데이터베이스',
                'type': 'database',
                'url': 'postgresql://localhost:5432/users',
                'status': 'active',
                'created_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat(),
                'data_count': 15420,
                'size_mb': 245
            },
            {
                'id': 'source-2',
                'name': 'API 데이터 스트림',
                'type': 'api',
                'url': 'https://api.example.com/data',
                'status': 'active',
                'created_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat(),
                'data_count': 8920,
                'size_mb': 156
            },
            {
                'id': 'source-3',
                'name': '파일 시스템',
                'type': 'file',
                'url': '/data/files/',
                'status': 'active',
                'created_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat(),
                'data_count': 3240,
                'size_mb': 89
            }
        ]
        
        for source in sample_sources:
            self.data_sources[source['id']] = source

    def _initialize_sample_data_analyses(self):
        """샘플 데이터 분석 작업 초기화"""
        sample_analyses = [
            {
                'id': 'analysis-1',
                'name': '사용자 행동 분석',
                'type': 'predictive',
                'data_source_id': 'source-1',
                'status': 'completed',
                'progress': 100,
                'created_at': datetime.now().isoformat(),
                'started_at': datetime.now().isoformat(),
                'completed_at': datetime.now().isoformat(),
                'parameters': {'algorithm': 'random_forest', 'features': 15},
                'results': {'accuracy': 0.87, 'precision': 0.85, 'recall': 0.89}
            },
            {
                'id': 'analysis-2',
                'name': '트렌드 분석',
                'type': 'descriptive',
                'data_source_id': 'source-2',
                'status': 'running',
                'progress': 65,
                'created_at': datetime.now().isoformat(),
                'started_at': datetime.now().isoformat(),
                'parameters': {'time_window': '30d', 'metrics': ['views', 'clicks']},
                'results': {}
            }
        ]
        
        for analysis in sample_analyses:
            self.data_analyses[analysis['id']] = analysis

    def _initialize_sample_data_visualizations(self):
        """샘플 데이터 시각화 초기화"""
        sample_viz = [
            {
                'id': 'viz-1',
                'name': '사용자 활동 대시보드',
                'type': 'chart',
                'chart_type': 'line',
                'data_source_id': 'source-1',
                'analysis_id': 'analysis-1',
                'status': 'active',
                'created_at': datetime.now().isoformat(),
                'config': {'title': '일별 사용자 활동', 'x_axis': '날짜', 'y_axis': '활동 수'},
                'data': self._generate_sample_chart_data()
            },
            {
                'id': 'viz-2',
                'name': '성능 메트릭 차트',
                'type': 'chart',
                'chart_type': 'bar',
                'data_source_id': 'source-2',
                'analysis_id': 'analysis-2',
                'status': 'active',
                'created_at': datetime.now().isoformat(),
                'config': {'title': '월별 성능 지표', 'x_axis': '월', 'y_axis': '성능 점수'},
                'data': self._generate_sample_chart_data()
            }
        ]
        
        for viz in sample_viz:
            self.data_visualizations[viz['id']] = viz

    def _initialize_sample_data_insights(self):
        """샘플 데이터 인사이트 초기화"""
        sample_insights = [
            {
                'id': 'insight-1',
                'title': '사용자 참여도 증가',
                'type': 'trend',
                'description': '최근 30일간 사용자 참여도가 15% 증가했습니다.',
                'confidence': 0.92,
                'impact': 'high',
                'created_at': datetime.now().isoformat(),
                'data_source_id': 'source-1',
                'recommendations': ['마케팅 캠페인 강화', '사용자 경험 개선']
            },
            {
                'id': 'insight-2',
                'title': '성능 병목 지점 발견',
                'type': 'anomaly',
                'description': '특정 시간대에 시스템 성능이 저하되는 패턴이 발견되었습니다.',
                'confidence': 0.88,
                'impact': 'medium',
                'created_at': datetime.now().isoformat(),
                'data_source_id': 'source-2',
                'recommendations': ['서버 리소스 확장', '캐싱 최적화']
            }
        ]
        
        for insight in sample_insights:
            self.data_insights[insight['id']] = insight

    def _initialize_sample_quality_tests(self):
        """샘플 품질 테스트 초기화"""
        sample_tests = [
            {
                'id': 'test-1',
                'name': 'API 응답 시간 테스트',
                'type': 'performance',
                'category': 'performance',
                'priority': 'high',
                'status': 'passed',
                'created_at': datetime.now().isoformat(),
                'started_at': datetime.now().isoformat(),
                'completed_at': datetime.now().isoformat(),
                'parameters': {'timeout': 5000, 'threshold': 2000},
                'results': {'response_time': 1500, 'status': 'passed'}
            },
            {
                'id': 'test-2',
                'name': '데이터 정확성 검증',
                'type': 'validation',
                'category': 'data_quality',
                'priority': 'medium',
                'status': 'running',
                'created_at': datetime.now().isoformat(),
                'started_at': datetime.now().isoformat(),
                'parameters': {'validation_rules': ['completeness', 'accuracy']},
                'results': {}
            }
        ]
        
        for test in sample_tests:
            self.quality_tests[test['id']] = test

    def _initialize_sample_quality_reports(self):
        """샘플 품질 보고서 초기화"""
        sample_reports = [
            {
                'id': 'report-1',
                'title': '주간 품질 보고서',
                'type': 'weekly',
                'status': 'completed',
                'created_at': datetime.now().isoformat(),
                'summary': '전체 시스템 품질이 양호한 상태를 유지하고 있습니다.',
                'metrics': {
                    'test_coverage': 0.92,
                    'code_quality': 0.88,
                    'performance': 0.91,
                    'security': 0.95
                },
                'recommendations': ['테스트 커버리지 향상', '코드 리뷰 강화']
            }
        ]
        
        for report in sample_reports:
            self.quality_reports[report['id']] = report

    def _generate_sample_chart_data(self):
        """샘플 차트 데이터 생성"""
        return {
            'labels': ['1월', '2월', '3월', '4월', '5월', '6월'],
            'datasets': [
                {
                    'label': '데이터 1',
                    'data': [65, 59, 80, 81, 56, 55],
                    'backgroundColor': 'rgba(75, 192, 192, 0.2)',
                    'borderColor': 'rgba(75, 192, 192, 1)',
                    'borderWidth': 1
                },
                {
                    'label': '데이터 2',
                    'data': [28, 48, 40, 19, 86, 27],
                    'backgroundColor': 'rgba(255, 99, 132, 0.2)',
                    'borderColor': 'rgba(255, 99, 132, 1)',
                    'borderWidth': 1
                }
            ]
        }

    def get_emotion_patterns(self, user_id='', limit=50):
        """감정 패턴 조회"""
        try:
            patterns = []
            pattern_types = ['daily', 'weekly', 'situational', 'contextual']
            emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'confusion', 'excitement', 'anxiety', 'relief']
            
            for i in range(min(limit, 10)):
                pattern_type = random.choice(pattern_types)
                dominant_emotion = random.choice(emotions)
                
                pattern = {
                    'id': f'pattern-{i+1}',
                    'user_id': user_id or f'user-{random.randint(1, 100)}',
                    'pattern_type': pattern_type,
                    'emotions': [
                        {
                            'emotion': dominant_emotion,
                            'intensity': random.uniform(0.5, 0.9),
                            'frequency': random.uniform(0.3, 0.8)
                        }
                    ],
                    'frequency': random.uniform(0.2, 0.7),
                    'intensity_trend': random.choice(['increasing', 'decreasing', 'stable', 'fluctuating']),
                    'triggers': random.sample(['스트레스', '성공', '실패', '사람', '환경', '시간'], random.randint(1, 3)),
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }
                patterns.append(pattern)
            
            return patterns
        except Exception as e:
            logger.error(f"감정 패턴 조회 오류: {e}")
            return []

    def get_emotion_metrics(self):
        """감정 인식 메트릭 조회"""
        try:
            return {
                'total_analyses': random.randint(1000, 5000),
                'accuracy_rate': random.uniform(0.75, 0.95),
                'average_confidence': random.uniform(0.7, 0.9),
                'response_appropriateness': random.uniform(0.8, 0.95),
                'user_satisfaction': random.uniform(0.75, 0.9),
                'pattern_detection_rate': random.uniform(0.6, 0.85),
                'emotional_intelligence_score': random.uniform(0.7, 0.9),
                'system_empathy_level': random.uniform(0.75, 0.9),
                'real_time_processing_time': random.uniform(0.1, 0.5),
                'multimodal_accuracy': random.uniform(0.8, 0.95)
            }
        except Exception as e:
            logger.error(f"감정 메트릭 조회 오류: {e}")
            return {}

    def get_emotion_config(self):
        """감정 인식 설정 조회"""
        try:
            return {
                'enable_multimodal': True,
                'enable_real_time': True,
                'enable_pattern_analysis': True,
                'enable_emotional_response': True,
                'enable_empathy_learning': True,
                'privacy_mode': False,
                'analysis_confidence_threshold': 0.7,
                'response_generation_threshold': 0.6,
                'pattern_detection_sensitivity': 0.5,
                'emotional_intelligence_learning_rate': 0.1
            }
        except Exception as e:
            logger.error(f"감정 설정 조회 오류: {e}")
            return {}

    def update_emotion_config(self, new_config):
        """감정 인식 설정 업데이트"""
        try:
            current_config = self.get_emotion_config()
            updated_config = {**current_config, **new_config}
            
            logger.info(f"감정 인식 설정 업데이트: {new_config}")
            return updated_config
        except Exception as e:
            logger.error(f"감정 설정 업데이트 오류: {e}")
            return {}

    def get_performance_metrics(self):
        """성능 메트릭 조회"""
        return {
            'status': 'success',
            'data': self.performance_metrics,
            'message': f'{len(self.performance_metrics)}개의 성능 메트릭을 조회했습니다.'
        }

    def create_performance_metric(self, metric_data):
        """성능 메트릭 생성"""
        metric = {
            'id': f'metric-{len(self.performance_metrics) + 1}',
                'timestamp': datetime.now().isoformat(),
            'system': metric_data.get('system', 'unknown'),
            'metric_type': metric_data.get('metric_type', 'cpu'),
            'value': metric_data.get('value', 0),
            'unit': metric_data.get('unit', '%'),
            'threshold': metric_data.get('threshold', 80),
            'status': metric_data.get('status', 'normal'),
            'context': metric_data.get('context', {})
        }
        self.performance_metrics.append(metric)
        return {
            'status': 'success',
            'data': metric,
            'message': '성능 메트릭이 생성되었습니다.'
        }

    def get_optimization_rules(self):
        """최적화 규칙 조회"""
        return {
            'status': 'success',
            'data': self.optimization_rules,
            'message': f'{len(self.optimization_rules)}개의 최적화 규칙을 조회했습니다.'
        }

    def create_optimization_rule(self, rule_data):
        """최적화 규칙 생성"""
        rule = {
            'id': f'rule-{len(self.optimization_rules) + 1}',
            'name': rule_data.get('name', '새 최적화 규칙'),
            'description': rule_data.get('description', ''),
            'condition': rule_data.get('condition', {
                'metric_type': 'cpu',
                'operator': 'gt',
                'threshold': 80,
                'duration': 60
            }),
            'action': rule_data.get('action', {
                'type': 'scale',
                'parameters': {}
            }),
            'enabled': rule_data.get('enabled', True),
            'priority': rule_data.get('priority', 'medium'),
            'created_at': datetime.now().isoformat()
        }
        self.optimization_rules.append(rule)
        return {
            'status': 'success',
            'data': rule,
            'message': '최적화 규칙이 생성되었습니다.'
        }

    def get_system_health(self):
        """시스템 상태 조회"""
        return {
            'status': 'success',
            'data': self.system_health,
            'message': '시스템 상태를 조회했습니다.'
        }

    def perform_manual_optimization(self, optimization_data):
        """수동 최적화 수행"""
        optimization_type = optimization_data.get('type', 'scale')
        parameters = optimization_data.get('parameters', {})
        
        # 최적화 수행 시뮬레이션
        result = {
            'id': f'optimization-{len(self.performance_metrics) + 1}',
            'type': optimization_type,
            'parameters': parameters,
            'status': 'completed',
            'timestamp': datetime.now().isoformat(),
            'message': f'{optimization_type} 최적화가 성공적으로 수행되었습니다.'
        }
        
        return {
            'status': 'success',
            'data': result,
            'message': '수동 최적화가 완료되었습니다.'
        }

    def get_performance_report(self):
        """성능 보고서 생성"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'overall_health': self.system_health['overall_status'],
            'systems': list(self.system_health['systems'].keys()),
            'metrics_count': len(self.performance_metrics),
            'optimization_rules': {
                'total': len(self.optimization_rules),
                'enabled': len([r for r in self.optimization_rules if r.get('enabled', False)]),
                'disabled': len([r for r in self.optimization_rules if not r.get('enabled', False)])
            },
            'recommendations': self.system_health['recommendations'],
            'alerts': self.system_health['alerts']
        }
        
        return {
            'status': 'success',
            'data': report,
            'message': '성능 보고서가 생성되었습니다.'
        }

    def _initialize_performance_optimization_data(self):
        """성능 최적화 샘플 데이터 초기화"""
        # 샘플 성능 메트릭
        sample_metrics = [
            {
                'id': 'metric-1',
                'timestamp': datetime.now().isoformat(),
                'system': 'data_analytics',
                'metric_type': 'cpu',
                'value': 75.5,
                'unit': '%',
                'threshold': 80,
                'status': 'normal'
            },
            {
                'id': 'metric-2',
                'timestamp': datetime.now().isoformat(),
                'system': 'quality_assurance',
                'metric_type': 'memory',
                'value': 82.3,
                'unit': '%',
                'threshold': 85,
                'status': 'normal'
            },
            {
                'id': 'metric-3',
                'timestamp': datetime.now().isoformat(),
                'system': 'emotion_recognition',
                'metric_type': 'response_time',
                'value': 850,
                'unit': 'ms',
                'threshold': 1000,
                'status': 'normal'
            }
        ]
        self.performance_metrics = sample_metrics

        # 샘플 최적화 규칙
        sample_rules = [
            {
                'id': 'rule-1',
                'name': 'CPU 사용률 최적화',
                'description': 'CPU 사용률이 80%를 초과하면 자동 스케일링을 수행합니다.',
                'condition': {
                    'metric_type': 'cpu',
                    'operator': 'gt',
                    'threshold': 80,
                    'duration': 60
                },
                'action': {
                    'type': 'scale',
                    'parameters': {'scale_factor': 1.5, 'target': 'cpu'}
                },
                'enabled': True,
                'priority': 'high',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': 'rule-2',
                'name': '응답 시간 최적화',
                'description': '응답 시간이 1초를 초과하면 캐싱을 활성화합니다.',
                'condition': {
                    'metric_type': 'response_time',
                    'operator': 'gt',
                    'threshold': 1000,
                    'duration': 30
                },
                'action': {
                    'type': 'cache',
                    'parameters': {'cache_duration': 300, 'strategy': 'aggressive'}
                },
                'enabled': True,
                'priority': 'medium',
                'created_at': datetime.now().isoformat()
            }
        ]
        self.optimization_rules = sample_rules

        # 샘플 시스템 상태
        self.system_health = {
            'overall_status': 'healthy',
            'systems': {
                'data_analytics': {
                    'status': 'healthy',
                    'metrics': sample_metrics[:1],
                    'last_updated': datetime.now().isoformat()
                },
                'quality_assurance': {
                    'status': 'healthy',
                    'metrics': sample_metrics[1:2],
                    'last_updated': datetime.now().isoformat()
                },
                'emotion_recognition': {
                    'status': 'healthy',
                    'metrics': sample_metrics[2:],
                    'last_updated': datetime.now().isoformat()
                }
            },
            'recommendations': [
                '시스템이 정상적으로 작동하고 있습니다.',
                '정기적인 성능 모니터링을 권장합니다.'
            ],
            'alerts': []
        }

    def _initialize_emotion_recognition_data(self):
        """감정 인식 샘플 데이터 초기화"""
        # 샘플 감정 패턴
        self.emotion_patterns = {
            'user-1': [
                {
                    'timestamp': datetime.now().isoformat(),
                    'emotion': 'joy',
                    'confidence': 0.85,
                    'context': 'positive_feedback'
                }
            ]
        }
        
        # 샘플 감정 메트릭
        self.emotion_metrics = {
            'total_analyses': 10,
            'emotion_distribution': {
                'joy': 0.4,
                'sadness': 0.2,
                'anger': 0.1,
                'fear': 0.1,
                'surprise': 0.1,
                'neutral': 0.1
            },
            'average_confidence': 0.78
        }

    def _initialize_data_analytics_data(self):
        """데이터 분석 샘플 데이터 초기화"""
        # 샘플 데이터 소스
        self.data_sources = [
            {
                'id': 'source-1',
                'name': '사용자 행동 데이터',
                'type': 'database',
                'url': 'postgresql://localhost/user_behavior',
                'status': 'active',
                'last_updated': datetime.now().isoformat()
            },
            {
                'id': 'source-2',
                'name': 'API 로그',
                'type': 'api',
                'url': 'https://api.example.com/logs',
                'status': 'active',
                'last_updated': datetime.now().isoformat()
            }
        ]
        
        # 샘플 분석 작업
        self.data_analyses = [
            {
                'id': 'analysis-1',
                'name': '사용자 패턴 분석',
                'type': 'descriptive',
                'status': 'completed',
                'source_id': 'source-1',
                'created_at': datetime.now().isoformat()
            }
        ]
        
        # 샘플 시각화
        self.data_visualizations = [
            {
                'id': 'viz-1',
                'name': '사용자 활동 차트',
                'type': 'line_chart',
                'analysis_id': 'analysis-1',
                'created_at': datetime.now().isoformat()
            }
        ]
        
        # 샘플 인사이트
        self.data_insights = [
            {
                'id': 'insight-1',
                'type': 'trend',
                'description': '사용자 활동이 주말에 증가하는 경향을 보입니다.',
                'confidence': 0.85,
                'created_at': datetime.now().isoformat()
            }
        ]

    def _initialize_quality_assurance_data(self):
        """품질 보증 샘플 데이터 초기화"""
        # 샘플 품질 테스트
        self.quality_tests = [
            {
                'id': 'test-1',
                'name': '감정 분석 정확도 테스트',
                'type': 'accuracy',
                'category': 'ai_model',
                'priority': 'high',
                'status': 'passed',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': 'test-2',
                'name': 'API 응답 시간 테스트',
                'type': 'performance',
                'category': 'api',
                'priority': 'medium',
                'status': 'passed',
                'created_at': datetime.now().isoformat()
            }
        ]
        
        # 샘플 품질 메트릭
        self.quality_metrics = {
            'total_tests': 2,
            'passed_tests': 2,
            'failed_tests': 0,
            'success_rate': 1.0,
            'average_execution_time': 2.5
        }
        
        # 샘플 품질 보고서
        self.quality_reports = [
            {
                'id': 'report-1',
                'title': '주간 품질 보고서',
                'summary': '모든 테스트가 성공적으로 통과했습니다.',
                'status': 'completed',
                'created_at': datetime.now().isoformat()
            }
        ]

# CORBU.AI 인스턴스 생성
corbu_ai = CORBUAI()

# API 라우트
@app.route('/api/chat', methods=['POST'])
def chat():
    """채팅 API"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        context = data.get('context', {})
        
        if not message:
            return jsonify({'error': '메시지가 필요합니다.'}), 400
        
        sentiment = corbu_ai.analyze_sentiment(message)
        response = f"안녕하세요! CORBU.AI입니다. '{message}'에 대한 분석 결과를 제공해드리겠습니다."
        
        return jsonify({
            'success': True,
            'response': response,
            'analysis': {
                'sentiment': sentiment
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"채팅 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

# AI 감정 인식 시스템 API
@app.route('/api/emotion-recognition/analyze', methods=['POST'])
def analyze_emotion():
    """감정 분석 API"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        analysis_type = data.get('type', 'text')
        context = data.get('context', {})
        
        if not content:
            return jsonify({'error': '분석할 내용이 필요합니다.'}), 400
        
        emotion_result = corbu_ai.analyze_emotion(content, analysis_type, context)
        
        return jsonify({
            'success': True,
            'data': emotion_result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 분석 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emotion-recognition/generate-response', methods=['POST'])
def generate_emotional_response():
    """감정 기반 응답 생성 API"""
    try:
        data = request.get_json()
        emotion_data = data.get('emotion_data', {})
        user_context = data.get('user_context', {})
        
        if not emotion_data:
            return jsonify({'error': '감정 데이터가 필요합니다.'}), 400
        
        response = corbu_ai.generate_emotional_response(emotion_data, user_context)
        
        return jsonify({
            'success': True,
            'data': response,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 응답 생성 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emotion-recognition/patterns', methods=['GET'])
def get_emotion_patterns():
    """감정 패턴 조회 API"""
    try:
        user_id = request.args.get('user_id', '')
        limit = int(request.args.get('limit', 50))
        
        patterns = corbu_ai.get_emotion_patterns(user_id, limit)
        
        return jsonify({
            'success': True,
            'data': patterns,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 패턴 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emotion-recognition/metrics', methods=['GET'])
def get_emotion_metrics():
    """감정 인식 메트릭 조회 API"""
    try:
        metrics = corbu_ai.get_emotion_metrics()
        
        return jsonify({
            'success': True,
            'data': metrics,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 메트릭 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emotion-recognition/config', methods=['GET', 'PUT'])
def emotion_recognition_config():
    """감정 인식 설정 관리 API"""
    try:
        if request.method == 'GET':
            config = corbu_ai.get_emotion_config()
            return jsonify({
                'success': True,
                'data': config,
                'timestamp': datetime.now().isoformat()
            })
        else:
        data = request.get_json()
            updated_config = corbu_ai.update_emotion_config(data)
        return jsonify({
            'success': True,
                'data': updated_config,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"감정 설정 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

# AI 데이터 분석 시스템 API
@app.route('/api/data-analytics/sources', methods=['GET', 'POST'])
def data_analytics_sources():
    """데이터 소스 관리 API"""
    try:
        if request.method == 'GET':
            sources = corbu_ai.get_data_sources()
            return jsonify(sources)
        else:
        data = request.get_json()
            source = corbu_ai.create_data_source(data)
            return jsonify(source)
    except Exception as e:
        logger.error(f"데이터 소스 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/data-analytics/analyses', methods=['GET', 'POST'])
def data_analytics_analyses():
    """데이터 분석 작업 관리 API"""
    try:
        if request.method == 'GET':
            analyses = corbu_ai.get_data_analyses()
            return jsonify(analyses)
        else:
            data = request.get_json()
            analysis = corbu_ai.create_data_analysis(data)
            return jsonify(analysis)
    except Exception as e:
        logger.error(f"데이터 분석 작업 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/data-analytics/visualizations', methods=['GET', 'POST'])
def data_analytics_visualizations():
    """데이터 시각화 관리 API"""
    try:
        if request.method == 'GET':
            visualizations = corbu_ai.get_data_visualizations()
            return jsonify(visualizations)
        else:
            data = request.get_json()
            visualization = corbu_ai.create_data_visualization(data)
            return jsonify(visualization)
    except Exception as e:
        logger.error(f"데이터 시각화 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/data-analytics/insights', methods=['GET'])
def data_analytics_insights():
    """데이터 인사이트 조회 API"""
    try:
        insights = corbu_ai.get_data_insights()
        return jsonify(insights)
    except Exception as e:
        logger.error(f"데이터 인사이트 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/data-analytics/metrics', methods=['GET'])
def data_analytics_metrics():
    """데이터 분석 메트릭 조회 API"""
    try:
        metrics = corbu_ai.get_data_analytics_metrics()
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"데이터 분석 메트릭 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

# AI 품질 보증 시스템 API
@app.route('/api/quality-assurance/tests', methods=['GET', 'POST'])
def quality_assurance_tests():
    """품질 테스트 관리 API"""
    try:
        if request.method == 'GET':
            tests = corbu_ai.get_quality_tests()
            return jsonify(tests)
        else:
            data = request.get_json()
            test = corbu_ai.create_quality_test(data)
            return jsonify(test)
    except Exception as e:
        logger.error(f"품질 테스트 관리 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/quality-assurance/metrics', methods=['GET'])
def quality_assurance_metrics():
    """품질 보증 메트릭 조회 API"""
    try:
        metrics = corbu_ai.get_quality_metrics()
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"품질 보증 메트릭 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/quality-assurance/reports', methods=['GET'])
def quality_assurance_reports():
    """품질 보고서 조회 API"""
    try:
        reports = corbu_ai.get_quality_reports()
        return jsonify(reports)
    except Exception as e:
        logger.error(f"품질 보고서 조회 API 오류: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/performance-optimization/metrics', methods=['GET'])
def get_performance_metrics():
    """성능 메트릭 조회 API"""
    return jsonify(corbu_ai.get_performance_metrics())

@app.route('/api/performance-optimization/metrics', methods=['POST'])
def create_performance_metric():
    """성능 메트릭 생성 API"""
        data = request.get_json()
    return jsonify(corbu_ai.create_performance_metric(data))

@app.route('/api/performance-optimization/rules', methods=['GET'])
def get_optimization_rules():
    """최적화 규칙 조회 API"""
    return jsonify(corbu_ai.get_optimization_rules())

@app.route('/api/performance-optimization/rules', methods=['POST'])
def create_optimization_rule():
    """최적화 규칙 생성 API"""
    data = request.get_json()
    return jsonify(corbu_ai.create_optimization_rule(data))

@app.route('/api/performance-optimization/health', methods=['GET'])
def get_system_health():
    """시스템 상태 조회 API"""
    return jsonify(corbu_ai.get_system_health())

@app.route('/api/performance-optimization/optimize', methods=['POST'])
def perform_manual_optimization():
    """수동 최적화 수행 API"""
    data = request.get_json()
    return jsonify(corbu_ai.perform_manual_optimization(data))

@app.route('/api/performance-optimization/report', methods=['GET'])
def get_performance_report():
    """성능 보고서 생성 API"""
    return jsonify(corbu_ai.get_performance_report())

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
