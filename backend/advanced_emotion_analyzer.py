import re
import json
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import numpy as np
from collections import Counter, defaultdict
import asyncio

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedEmotionAnalyzer:
    """고급 감정 분석 및 톤 매칭 시스템"""
    
    def __init__(self):
        # 감정 키워드 사전 (한국어 중심)
        self.emotion_keywords = {
            'positive': {
                'high': ['기쁘다', '행복하다', '만족하다', '감사하다', '좋다', '훌륭하다', '완벽하다', '최고다', '환상적이다', '신나다'],
                'medium': ['괜찮다', '나쁘지 않다', '그런대로', '보통', '적당하다', '무난하다', '안정적이다'],
                'low': ['그럭저럭', '별로', '그냥', '뭐', '음', '어']
            },
            'negative': {
                'high': ['화나다', '짜증나다', '분노하다', '싫다', '최악이다', '끔찍하다', '망했다', '답답하다', '스트레스', '미치겠다'],
                'medium': ['불만이다', '아쉽다', '걱정되다', '불안하다', '힘들다', '어렵다', '복잡하다'],
                'low': ['조금', '약간', '살짝', '그런대로', '아무래도']
            },
            'concern': {
                'high': ['우려되다', '걱정이다', '문제다', '위험하다', '심각하다', '큰일이다', '안 될 것 같다'],
                'medium': ['신경쓰인다', '의문이다', '확실하지 않다', '애매하다', '불분명하다'],
                'low': ['궁금하다', '어떨까', '모르겠다', '확인해야']
            },
            'neutral': {
                'high': ['사실이다', '현실이다', '당연하다', '명확하다', '분명하다'],
                'medium': ['생각한다', '판단한다', '추정한다', '예상한다', '짐작한다'],
                'low': ['그렇다', '이렇다', '저렇다', '뭐', '음']
            }
        }
        
        # 톤 분석 패턴
        self.tone_patterns = {
            'formal': {
                'markers': ['입니다', '습니다', '께서', '하십시오', '해주시기', '드립니다', '하시면', '되겠습니다'],
                'score_weight': 2.0
            },
            'informal': {
                'markers': ['해', '야', '지', '어', '아', '네', '응', 'ㅋㅋ', 'ㅎㅎ', '~'],
                'score_weight': 1.5
            },
            'professional': {
                'markers': ['검토', '분석', '제안', '방안', '대책', '계획', '진행', '추진', '검토드립니다', '말씀드리겠습니다'],
                'score_weight': 2.5
            },
            'emotional': {
                'markers': ['정말', '진짜', '완전', '너무', '엄청', '되게', '매우', '굉장히', '!', '?!', '!!!'],
                'score_weight': 1.8
            },
            'questioning': {
                'markers': ['?', '어떻게', '왜', '언제', '어디서', '무엇을', '누가', '어떤', '혹시', '~까요', '~나요'],
                'score_weight': 1.2
            },
            'assertive': {
                'markers': ['반드시', '꼭', '절대', '무조건', '확실히', '명확히', '분명히', '당연히', '절대로'],
                'score_weight': 2.2
            }
        }
        
        # 맥락 분석 패턴
        self.context_patterns = {
            'urgency': {
                'high': ['긴급', '당장', '즉시', '빨리', '서둘러', '급하다', '시급하다', '오늘 중', '내일까지'],
                'medium': ['빠른 시일 내', '가능한 한', '조속히', '되도록 빨리'],
                'low': ['천천히', '여유있게', '차후에', '나중에', '언젠가']
            },
            'formality': {
                'high': ['회의', '안건', '결정', '승인', '보고', '검토', '협의', '논의'],
                'medium': ['이야기', '대화', '상담', '논의', '의견'],
                'low': ['수다', '잡담', '이런저런', '그냥', '별거 아닌']
            },
            'relationship': {
                'hierarchical': ['사장님', '부장님', '팀장님', '선배님', '교수님', '~님', '선생님'],
                'peer': ['동료', '친구', '형', '누나', '언니', '오빠', '~씨'],
                'subordinate': ['후배', '학생', '아이', '얘', '~야', '~아']
            }
        }
        
        # 주제별 감정 가중치
        self.topic_emotion_weights = {
            '재건축': {'concern': 1.5, 'positive': 1.2, 'negative': 1.3},
            '환급금': {'concern': 1.8, 'positive': 1.4, 'negative': 1.6},
            '시공사': {'concern': 1.4, 'neutral': 1.3, 'negative': 1.2},
            '총회': {'neutral': 1.3, 'positive': 1.2, 'concern': 1.1},
            '일정': {'concern': 1.3, 'negative': 1.2, 'neutral': 1.1}
        }

    def analyze_emotion(self, text: str, context: Optional[Dict] = None) -> Dict:
        """종합적인 감정 분석"""
        try:
            # 기본 감정 점수 계산
            emotion_scores = self._calculate_basic_emotions(text)
            
            # 톤 분석
            tone_analysis = self._analyze_tone(text)
            
            # 맥락 분석
            context_analysis = self._analyze_context(text, context)
            
            # 주제별 가중치 적용
            if context and 'topic' in context:
                emotion_scores = self._apply_topic_weights(emotion_scores, context['topic'])
            
            # 최종 감정 결정
            primary_emotion = max(emotion_scores.items(), key=lambda x: x[1])
            
            # 감정 강도 계산
            intensity = self._calculate_intensity(text, primary_emotion[0])
            
            # 감정 변화 추적 (이전 메시지와 비교)
            emotion_trend = self._track_emotion_trend(emotion_scores, context)
            
            return {
                'primary_emotion': primary_emotion[0],
                'emotion_confidence': round(primary_emotion[1], 2),
                'emotion_scores': {k: round(v, 2) for k, v in emotion_scores.items()},
                'tone_analysis': tone_analysis,
                'context_analysis': context_analysis,
                'intensity': intensity,
                'emotion_trend': emotion_trend,
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"감정 분석 오류: {e}")
            return self._get_default_emotion_analysis()

    def _calculate_basic_emotions(self, text: str) -> Dict[str, float]:
        """기본 감정 점수 계산"""
        emotion_scores = {'positive': 0.0, 'negative': 0.0, 'concern': 0.0, 'neutral': 0.0}
        text_lower = text.lower()
        
        for emotion, intensity_levels in self.emotion_keywords.items():
            for intensity, keywords in intensity_levels.items():
                weight = {'high': 3.0, 'medium': 2.0, 'low': 1.0}[intensity]
                
                for keyword in keywords:
                    if keyword in text_lower:
                        emotion_scores[emotion] += weight
        
        # 정규화
        total_score = sum(emotion_scores.values())
        if total_score > 0:
            emotion_scores = {k: v / total_score for k, v in emotion_scores.items()}
        else:
            emotion_scores['neutral'] = 1.0
            
        return emotion_scores

    def _analyze_tone(self, text: str) -> Dict:
        """톤 분석"""
        tone_scores = {}
        text_lower = text.lower()
        
        for tone, config in self.tone_patterns.items():
            score = 0.0
            for marker in config['markers']:
                count = text_lower.count(marker)
                score += count * config['score_weight']
            
            tone_scores[tone] = score
        
        # 정규화 및 상위 톤 선택
        if any(tone_scores.values()):
            total = sum(tone_scores.values())
            tone_scores = {k: v / total for k, v in tone_scores.items()}
            primary_tone = max(tone_scores.items(), key=lambda x: x[1])
        else:
            primary_tone = ('neutral', 1.0)
            tone_scores = {'neutral': 1.0}
        
        return {
            'primary_tone': primary_tone[0],
            'tone_confidence': round(primary_tone[1], 2),
            'tone_scores': {k: round(v, 2) for k, v in tone_scores.items()}
        }

    def _analyze_context(self, text: str, context: Optional[Dict] = None) -> Dict:
        """맥락 분석"""
        context_analysis = {
            'urgency_level': 'low',
            'formality_level': 'medium',
            'relationship_type': 'peer',
            'message_purpose': 'informative'
        }
        
        text_lower = text.lower()
        
        # 긴급도 분석
        urgency_scores = {'high': 0, 'medium': 0, 'low': 0}
        for level, keywords in self.context_patterns['urgency'].items():
            for keyword in keywords:
                if keyword in text_lower:
                    urgency_scores[level] += 1
        
        if any(urgency_scores.values()):
            context_analysis['urgency_level'] = max(urgency_scores.items(), key=lambda x: x[1])[0]
        
        # 격식 수준 분석
        formality_scores = {'high': 0, 'medium': 0, 'low': 0}
        for level, keywords in self.context_patterns['formality'].items():
            for keyword in keywords:
                if keyword in text_lower:
                    formality_scores[level] += 1
        
        if any(formality_scores.values()):
            context_analysis['formality_level'] = max(formality_scores.items(), key=lambda x: x[1])[0]
        
        # 관계 유형 분석
        relationship_scores = {'hierarchical': 0, 'peer': 0, 'subordinate': 0}
        for rel_type, keywords in self.context_patterns['relationship'].items():
            for keyword in keywords:
                if keyword in text_lower:
                    relationship_scores[rel_type] += 1
        
        if any(relationship_scores.values()):
            context_analysis['relationship_type'] = max(relationship_scores.items(), key=lambda x: x[1])[0]
        
        # 메시지 목적 추론
        if '?' in text or any(q in text_lower for q in ['어떻게', '왜', '언제', '어디서']):
            context_analysis['message_purpose'] = 'questioning'
        elif any(a in text_lower for a in ['제안', '추천', '권장', '~해보세요']):
            context_analysis['message_purpose'] = 'advisory'
        elif any(s in text_lower for s in ['지지', '동의', '찬성', '좋다', '맞다']):
            context_analysis['message_purpose'] = 'supportive'
        elif any(o in text_lower for o in ['반대', '아니다', '틀렸다', '문제']):
            context_analysis['message_purpose'] = 'opposing'
        
        return context_analysis

    def _apply_topic_weights(self, emotion_scores: Dict[str, float], topic: str) -> Dict[str, float]:
        """주제별 가중치 적용"""
        if topic in self.topic_emotion_weights:
            weights = self.topic_emotion_weights[topic]
            for emotion, weight in weights.items():
                if emotion in emotion_scores:
                    emotion_scores[emotion] *= weight
        
        # 재정규화
        total = sum(emotion_scores.values())
        if total > 0:
            emotion_scores = {k: v / total for k, v in emotion_scores.items()}
        
        return emotion_scores

    def _calculate_intensity(self, text: str, primary_emotion: str) -> str:
        """감정 강도 계산"""
        intensity_markers = {
            'high': ['!!!', '완전', '너무', '진짜', '정말', '엄청', '굉장히', '매우', '극도로'],
            'medium': ['!!', '꽤', '상당히', '제법', '어느 정도', '조금'],
            'low': ['!', '약간', '살짝', '조금', '다소', '그럭저럭']
        }
        
        text_lower = text.lower()
        intensity_scores = {'high': 0, 'medium': 0, 'low': 0}
        
        for level, markers in intensity_markers.items():
            for marker in markers:
                if marker in text_lower:
                    intensity_scores[level] += 1
        
        if any(intensity_scores.values()):
            return max(intensity_scores.items(), key=lambda x: x[1])[0]
        
        return 'medium'

    def _track_emotion_trend(self, current_emotions: Dict[str, float], context: Optional[Dict] = None) -> Dict:
        """감정 변화 추적"""
        trend_analysis = {
            'direction': 'stable',
            'change_magnitude': 0.0,
            'emotion_consistency': 'consistent'
        }
        
        if context and 'previous_emotions' in context:
            prev_emotions = context['previous_emotions']
            
            # 주요 감정 변화 계산
            current_primary = max(current_emotions.items(), key=lambda x: x[1])
            prev_primary = max(prev_emotions.items(), key=lambda x: x[1])
            
            if current_primary[0] != prev_primary[0]:
                trend_analysis['emotion_consistency'] = 'changing'
            
            # 변화 크기 계산
            change_sum = sum(abs(current_emotions.get(k, 0) - prev_emotions.get(k, 0)) 
                           for k in set(current_emotions.keys()) | set(prev_emotions.keys()))
            
            trend_analysis['change_magnitude'] = round(change_sum / 2, 2)
            
            # 변화 방향 결정
            if change_sum > 0.3:
                if current_emotions.get('positive', 0) > prev_emotions.get('positive', 0):
                    trend_analysis['direction'] = 'improving'
                elif current_emotions.get('negative', 0) > prev_emotions.get('negative', 0):
                    trend_analysis['direction'] = 'declining'
                else:
                    trend_analysis['direction'] = 'shifting'
        
        return trend_analysis

    def generate_tone_matched_response(self, analysis_result: Dict, response_purpose: str, 
                                     target_audience: str = 'general') -> Dict:
        """분석 결과에 기반한 톤 매칭 응답 생성"""
        try:
            primary_emotion = analysis_result.get('primary_emotion', 'neutral')
            tone_analysis = analysis_result.get('tone_analysis', {})
            context_analysis = analysis_result.get('context_analysis', {})
            
            # 응답 톤 결정
            response_tone = self._determine_response_tone(
                primary_emotion, tone_analysis, context_analysis, target_audience
            )
            
            # 응답 스타일 가이드라인
            style_guidelines = self._get_style_guidelines(response_tone, context_analysis)
            
            # 감정별 응답 전략
            response_strategy = self._get_response_strategy(primary_emotion, response_purpose)
            
            return {
                'recommended_tone': response_tone,
                'style_guidelines': style_guidelines,
                'response_strategy': response_strategy,
                'emotional_approach': self._get_emotional_approach(primary_emotion),
                'formality_level': context_analysis.get('formality_level', 'medium'),
                'urgency_handling': self._get_urgency_handling(context_analysis.get('urgency_level', 'low'))
            }
            
        except Exception as e:
            logger.error(f"톤 매칭 응답 생성 오류: {e}")
            return self._get_default_tone_matching()

    def _determine_response_tone(self, primary_emotion: str, tone_analysis: Dict, 
                                context_analysis: Dict, target_audience: str) -> str:
        """응답 톤 결정"""
        formality = context_analysis.get('formality_level', 'medium')
        relationship = context_analysis.get('relationship_type', 'peer')
        
        # 감정별 기본 톤
        emotion_tone_map = {
            'positive': 'supportive',
            'negative': 'empathetic',
            'concern': 'reassuring',
            'neutral': 'informative'
        }
        
        base_tone = emotion_tone_map.get(primary_emotion, 'informative')
        
        # 격식 수준과 관계에 따른 조정
        if formality == 'high' or relationship == 'hierarchical':
            if base_tone == 'supportive':
                return 'professional_supportive'
            elif base_tone == 'empathetic':
                return 'professional_empathetic'
            else:
                return 'professional'
        elif formality == 'low' or relationship == 'peer':
            if base_tone == 'supportive':
                return 'friendly_supportive'
            elif base_tone == 'empathetic':
                return 'friendly_empathetic'
            else:
                return 'conversational'
        
        return base_tone

    def _get_style_guidelines(self, response_tone: str, context_analysis: Dict) -> Dict:
        """스타일 가이드라인 제공"""
        guidelines = {
            'professional': {
                'language_style': '존댓말 사용, 정중한 표현',
                'sentence_structure': '완전한 문장, 논리적 구성',
                'emotional_expression': '절제된 감정 표현',
                'examples': ['검토해보겠습니다', '말씀드리겠습니다', '협의가 필요합니다']
            },
            'friendly_supportive': {
                'language_style': '친근한 말투, 공감적 표현',
                'sentence_structure': '자연스러운 대화체',
                'emotional_expression': '따뜻하고 지지적인 톤',
                'examples': ['정말 좋은 생각이에요', '충분히 이해됩니다', '함께 해결해봐요']
            },
            'empathetic': {
                'language_style': '공감적 언어, 이해하는 표현',
                'sentence_structure': '상대방 감정 인정, 위로하는 구조',
                'emotional_expression': '따뜻하고 이해심 있는 톤',
                'examples': ['힘드셨겠어요', '충분히 우려스러우실 것 같습니다', '함께 방법을 찾아봅시다']
            },
            'informative': {
                'language_style': '명확하고 객관적인 표현',
                'sentence_structure': '사실 중심, 구체적 정보 제공',
                'emotional_expression': '중립적이고 신뢰할 수 있는 톤',
                'examples': ['현재 상황은 다음과 같습니다', '구체적인 내용을 말씀드리면', '정확한 정보를 확인해보겠습니다']
            }
        }
        
        return guidelines.get(response_tone, guidelines['informative'])

    def _get_response_strategy(self, primary_emotion: str, response_purpose: str) -> Dict:
        """응답 전략 제공"""
        strategies = {
            'positive': {
                'acknowledge': '긍정적인 의견에 공감 표시',
                'build_upon': '좋은 점을 더욱 발전시키는 방향 제시',
                'maintain_momentum': '긍정적 분위기 유지'
            },
            'negative': {
                'acknowledge': '불만이나 우려를 충분히 인정',
                'address_concerns': '구체적인 해결방안 제시',
                'provide_reassurance': '안심할 수 있는 정보 제공'
            },
            'concern': {
                'validate_concerns': '우려사항을 타당하게 인정',
                'provide_information': '관련 정보를 투명하게 제공',
                'offer_solutions': '실질적인 해결방안 제시'
            },
            'neutral': {
                'provide_clarity': '명확한 정보 제공',
                'maintain_objectivity': '객관적 관점 유지',
                'encourage_discussion': '추가 논의 유도'
            }
        }
        
        return strategies.get(primary_emotion, strategies['neutral'])

    def _get_emotional_approach(self, primary_emotion: str) -> str:
        """감정적 접근 방식"""
        approaches = {
            'positive': '긍정적 에너지를 유지하면서 건설적인 방향으로 발전',
            'negative': '불만을 이해하고 해결을 위한 구체적 방안 제시',
            'concern': '우려를 공감하고 신뢰할 수 있는 정보로 안심시키기',
            'neutral': '객관적이고 균형잡힌 관점으로 정보 제공'
        }
        
        return approaches.get(primary_emotion, approaches['neutral'])

    def _get_urgency_handling(self, urgency_level: str) -> str:
        """긴급도별 처리 방식"""
        handling = {
            'high': '즉시 응답하고 신속한 조치 방안 제시',
            'medium': '적절한 시기에 충분한 정보와 함께 응답',
            'low': '여유있게 충분한 검토 후 상세한 답변 제공'
        }
        
        return handling.get(urgency_level, handling['medium'])

    def _get_default_emotion_analysis(self) -> Dict:
        """기본 감정 분석 결과"""
        return {
            'primary_emotion': 'neutral',
            'emotion_confidence': 0.5,
            'emotion_scores': {'neutral': 1.0, 'positive': 0.0, 'negative': 0.0, 'concern': 0.0},
            'tone_analysis': {'primary_tone': 'neutral', 'tone_confidence': 0.5},
            'context_analysis': {'urgency_level': 'low', 'formality_level': 'medium'},
            'intensity': 'medium',
            'emotion_trend': {'direction': 'stable', 'change_magnitude': 0.0},
            'analysis_timestamp': datetime.now().isoformat()
        }

    def _get_default_tone_matching(self) -> Dict:
        """기본 톤 매칭 결과"""
        return {
            'recommended_tone': 'informative',
            'style_guidelines': self._get_style_guidelines('informative', {}),
            'response_strategy': self._get_response_strategy('neutral', 'informative'),
            'emotional_approach': '객관적이고 균형잡힌 관점으로 정보 제공',
            'formality_level': 'medium',
            'urgency_handling': '적절한 시기에 충분한 정보와 함께 응답'
        }

# 감정 분석기 인스턴스
emotion_analyzer = AdvancedEmotionAnalyzer()

# 비동기 분석 함수
async def analyze_message_emotion(text: str, context: Optional[Dict] = None) -> Dict:
    """비동기 메시지 감정 분석"""
    try:
        # CPU 집약적 작업을 별도 스레드에서 실행
        loop = asyncio.get_event_loop()
        analysis_result = await loop.run_in_executor(
            None, emotion_analyzer.analyze_emotion, text, context
        )
        return analysis_result
    except Exception as e:
        logger.error(f"비동기 감정 분석 오류: {e}")
        return emotion_analyzer._get_default_emotion_analysis()

async def generate_tone_matched_response(analysis_result: Dict, response_purpose: str, 
                                       target_audience: str = 'general') -> Dict:
    """비동기 톤 매칭 응답 생성"""
    try:
        loop = asyncio.get_event_loop()
        response_result = await loop.run_in_executor(
            None, emotion_analyzer.generate_tone_matched_response, 
            analysis_result, response_purpose, target_audience
        )
        return response_result
    except Exception as e:
        logger.error(f"비동기 톤 매칭 오류: {e}")
        return emotion_analyzer._get_default_tone_matching()

if __name__ == "__main__":
    # 테스트 코드
    test_messages = [
        "환급금 3억 받은걸로 알고 있습니다! 개인당",
        "조합원들의 의사가 중요한게 루체하임의 경우는 조합원들이 환급금을 받는걸 최우선 과제로 삼았기에 물산은 고객의 입맛에 맞춰줄 수 밖에 없었다고 알고 있습니다.",
        "하지만 계약 조건을 꼼꼼히 봐야겠어요. 나중에 문제 생기면 안되니까"
    ]
    
    async def test_emotion_analysis():
        for message in test_messages:
            print(f"\n분석 대상: {message}")
            analysis = await analyze_message_emotion(message)
            print(f"감정 분석: {analysis}")
            
            tone_matching = await generate_tone_matched_response(analysis, 'informative')
            print(f"톤 매칭: {tone_matching}")
    
    asyncio.run(test_emotion_analysis()) 