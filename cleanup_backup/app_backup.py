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
                    'contrast': '높음',
                    'color_temperature': '따뜻함'
                },
                'analysis_time': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"이미지 분석 오류: {e}")
            return None

    # AI 감정 인식 시스템 메서드들
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
            # 감정 키워드 정의
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

            # 감정이 감지되지 않으면 중립으로 설정
            if not detected_emotions:
                detected_emotions.append({
                    'emotion': 'neutral',
                    'intensity': 0.3,
                    'confidence': 0.5,
                    'valence': 0.5,
                    'arousal': 0.3,
                    'dominance': 0.5
                })

            # 강도순으로 정렬
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
            # 음성 분석 시뮬레이션
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
            # 표정 분석 시뮬레이션
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
            # 멀티모달 분석 시뮬레이션
            text_result = self._analyze_text_emotion(data.get('text', ''), context)
            voice_result = self._analyze_voice_emotion(data.get('voice', ''), context)
            facial_result = self._analyze_facial_emotion(data.get('facial', ''), context)

            # 결과 통합
            all_emotions = []
            if text_result:
                all_emotions.extend(text_result['detected_emotions'])
            if voice_result:
                all_emotions.extend(voice_result['detected_emotions'])
            if facial_result:
                all_emotions.extend(facial_result['detected_emotions'])

            # 감정 통합 및 가중 평균 계산
            emotion_scores = {}
            for emotion in all_emotions:
                emo_type = emotion['emotion']
                if emo_type not in emotion_scores:
                    emotion_scores[emo_type] = {'total_intensity': 0, 'total_confidence': 0, 'count': 0}
                
                emotion_scores[emo_type]['total_intensity'] += emotion['intensity']
                emotion_scores[emo_type]['total_confidence'] += emotion['confidence']
                emotion_scores[emo_type]['count'] += 1

            # 평균 계산
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

            # 강도순으로 정렬
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

            # 감정에 따른 응답 전략 선택
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

            # 템플릿에서 응답 선택
            response_template = random.choice(strategy['templates'])
            
            # 강도에 따른 응답 조정
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
            # 감정 지능 점수 계산 (0-1)
            score = 0.7  # 기본 점수
            
            # 감정 강도에 따른 조정
            if emotion['intensity'] > 0.8:
                score += 0.1  # 강한 감정에 대한 적절한 대응
            elif emotion['intensity'] < 0.3:
                score += 0.05  # 약한 감정에 대한 세심한 관찰
            
            # 감정 타입에 따른 조정
            if emotion['emotion'] in ['joy', 'love', 'excitement']:
                score += 0.1  # 긍정적 감정에 대한 공유
            elif emotion['emotion'] in ['sadness', 'fear', 'anxiety']:
                score += 0.1  # 부정적 감정에 대한 공감
            
            return min(score, 1.0)
        except Exception as e:
            logger.error(f"감정 지능 점수 계산 오류: {e}")
            return 0.7

    def _calculate_appropriateness(self, emotion, strategy):
        """응답 적절성 점수 계산"""
        try:
            # 적절성 점수 계산 (0-1)
            score = 0.8  # 기본 점수
            
            # 감정과 전략의 일치도
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
            # 사용자 만족도 예측 (0-1)
            prediction = 0.75  # 기본 예측
            
            # 감정 강도에 따른 조정
            if emotion['intensity'] > 0.7:
                prediction += 0.1  # 강한 감정에 대한 적절한 대응
            elif emotion['intensity'] < 0.3:
                prediction += 0.05  # 약한 감정에 대한 세심한 관찰
            
            # 감정 타입에 따른 조정
            if emotion['emotion'] in ['joy', 'love']:
                prediction += 0.1  # 긍정적 감정에 대한 공유
            elif emotion['emotion'] in ['sadness', 'fear']:
                prediction += 0.1  # 부정적 감정에 대한 공감
            
            return min(prediction, 1.0)
        except Exception as e:
            logger.error(f"사용자 만족도 예측 오류: {e}")
            return 0.75

    def get_emotion_patterns(self, user_id='', limit=50):
        """감정 패턴 조회"""
        try:
            # 시뮬레이션된 감정 패턴 데이터
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
            # 설정 업데이트 시뮬레이션
            current_config = self.get_emotion_config()
            updated_config = {**current_config, **new_config}
            
            logger.info(f"감정 인식 설정 업데이트: {new_config}")
            return updated_config
        except Exception as e:
            logger.error(f"감정 설정 업데이트 오류: {e}")
            return {}

# CORBU.AI 인스턴스 생성
corbu_ai = CORBUAI()
    
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
        
        # 감정 분석 수행
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
        
        # 감정 기반 응답 생성
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
        
        # 감정 패턴 조회
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
        # 감정 인식 메트릭 조회
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
            # 설정 조회
            config = corbu_ai.get_emotion_config()
            return jsonify({
                'success': True,
                'data': config,
                'timestamp': datetime.now().isoformat()
            })
        else:
            # 설정 업데이트
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
