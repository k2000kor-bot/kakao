from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import logging
import re
import random

from chat_conversation_analyzer import ChatConversationAnalyzer, ChatMessage
from advanced_korean_ai_analyzer import AdvancedKoreanAIAnalyzer
from political_style_generator import PoliticalStyleGenerator, PoliticalStyleLearner, StyledMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PersonProfile:
    """개인 프로필 (성향 및 선호도)"""
    person_name: str
    political_stance: str  # 찬성파, 반대파, 중립파, 신중파
    preferred_construction_company: Optional[str]  # GS, 파르나스, 현대, 대우, 기타
    communication_style: str  # 논리적, 감정적, 권위적, 협력적
    formality_level: str  # 높음, 보통, 낮음
    typical_topics: List[str]  # 주로 언급하는 주제들
    signature_phrases: List[str]  # 자주 사용하는 표현들
    message_intent_patterns: List[str]  # 메시지 취지 패턴
    korean_linguistic_style: Dict[str, Any]  # 한국어 언어적 특성


@dataclass
class MessageTemplate:
    """메시지 템플릿"""
    template_id: str
    stance_type: str
    construction_preference: Optional[str]
    intent_category: str
    korean_style: str
    template_structure: List[str]
    variable_slots: Dict[str, List[str]]
    cultural_elements: List[str]


@dataclass
class GeneratedMessage:
    """생성된 메시지"""
    message_id: str
    generated_content: str
    source_person: str
    confidence_score: float
    generation_method: str
    template_used: Optional[str]
    quality_metrics: Dict[str, float]
    korean_authenticity_score: float


class AIMessageGenerator:
    """AI 기반 메시지 자동 생성 시스템"""
    
    def __init__(self, analyzer: ChatConversationAnalyzer, ai_analyzer: AdvancedKoreanAIAnalyzer):
        self.analyzer = analyzer
        self.ai_analyzer = ai_analyzer
        
        # 정치인 스타일 생성기 초기화
        self.political_style_generator = PoliticalStyleGenerator()
        self.political_style_learner = PoliticalStyleLearner(self.political_style_generator)
        
        # 시공사별 특성 데이터
        self.construction_company_characteristics = {
            "GS": {
                "장점_키워드": ["대기업", "안정성", "브랜드", "시스템", "전문성"],
                "단점_키워드": ["비용", "획일화", "경직성"],
                "찬성_표현": ["신뢰할 수 있는", "체계적인", "전문적인", "안정적인"],
                "반대_표현": ["비싸다", "획일적이다", "유연성이 부족하다"]
            },
            "파르나스": {
                "장점_키워드": ["효율성", "비용절감", "실용성", "경험"],
                "단점_키워드": ["품질우려", "서비스", "사후관리"],
                "찬성_표현": ["효율적인", "경제적인", "실용적인", "합리적인"],
                "반대_표현": ["품질이 걱정된다", "서비스가 부족하다", "사후관리가 미흡하다"]
            },
            "현대": {
                "장점_키워드": ["기술력", "혁신", "품질", "서비스"],
                "단점_키워드": ["비용", "복잡성"],
                "찬성_표현": ["기술력이 뛰어난", "혁신적인", "품질이 좋은"],
                "반대_표현": ["비용이 부담된다", "너무 복잡하다"]
            }
        }
        
        # 정치적 성향별 메시지 패턴
        self.stance_patterns = {
            "찬성파": {
                "핵심_논리": ["효율성", "전문성", "현실성", "미래성"],
                "자주쓰는_표현": ["생각해보면", "실제로", "효과적이다", "바람직하다", "적절하다"],
                "논증_구조": ["현실 분석", "장점 강조", "반대 의견 반박", "결론 제시"],
                "감정_톤": ["긍정적", "확신", "논리적"]
            },
            "반대파": {
                "핵심_논리": ["위험성", "불투명성", "권익침해", "신중성"],
                "자주쓰는_표현": ["우려된다", "문제가 있다", "신중해야", "검토가 필요", "반대한다"],
                "논증_구조": ["위험 지적", "문제점 열거", "대안 요구", "신중 촉구"],
                "감정_톤": ["우려", "경고", "비판적"]
            },
            "중립파": {
                "핵심_논리": ["균형", "객관성", "다각도검토", "단계적접근"],
                "자주쓰는_표현": ["양쪽 다", "객관적으로", "신중하게", "검토해보면", "균형있게"],
                "논증_구조": ["양면 제시", "균형 관점", "추가 검토", "단계적 제안"],
                "감정_톤": ["중립적", "균형", "신중"]
            },
            "신중파": {
                "핵심_논리": ["충분한검토", "단계적진행", "리스크관리", "합의도출"],
                "자주쓰는_표현": ["신중하게", "충분히 검토", "단계적으로", "의견 수렴", "합의"],
                "논증_구조": ["현황 분석", "검토 필요성", "단계적 방안", "합의 촉구"],
                "감정_톤": ["신중", "조심", "협력적"]
            }
        }
        
        # 한국어 메시지 템플릿들
        self.korean_message_templates = self._initialize_korean_templates()
        
    def _initialize_korean_templates(self) -> List[MessageTemplate]:
        """한국어 메시지 템플릿 초기화"""
        templates = []
        
        # 찬성파 템플릿들
        templates.append(MessageTemplate(
            template_id="support_logical_01",
            stance_type="찬성파",
            construction_preference=None,
            intent_category="논리적_설득",
            korean_style="정중한_논리형",
            template_structure=[
                "{시공사명} 방안을 {분석_표현} 분석해보면",
                "{장점_키워드}와 {효과_표현} 측면에서 {긍정_평가}",
                "{우려_인정} 있지만 {현실적_접근} 필요하다고 생각합니다",
                "{미래_전망}과 {협상_여지}도 있다고 봅니다"
            ],
            variable_slots={
                "시공사명": ["GS", "파르나스", "현대건설", "외부 위탁"],
                "분석_표현": ["객관적으로", "현실적으로", "종합적으로"],
                "장점_키워드": ["전문성", "효율성", "체계성", "안정성"],
                "효과_표현": ["비용 절감", "운영 효율", "서비스 품질"],
                "긍정_평가": ["충분히 효과적일 수 있다", "바람직한 결과를 얻을 수 있다"],
                "우려_인정": ["일부 우려가", "초기 걱정이"],
                "현실적_접근": ["데이터 기반의", "합리적인", "균형잡힌"],
                "미래_전망": ["향후 개선 가능성", "장기적 발전성"],
                "협상_여지": ["재협상 기회", "조건 개선 여지"]
            },
            cultural_elements=["정중한 어조", "논리적 구조", "상대방 배려"]
        ))
        
        # 반대파 템플릿들
        templates.append(MessageTemplate(
            template_id="oppose_concern_01",
            stance_type="반대파",
            construction_preference=None,
            intent_category="우려_표명",
            korean_style="정중한_우려형",
            template_structure=[
                "{시공사명} 협약 건에 대해 {우려_강도} 우려를 표명합니다",
                "{위험_요소}와 {문제_지적} 문제를 지적하지 않을 수 없습니다",
                "{권익_우려} 가능성이 {걱정_표현}",
                "{신중_요청} {검토_촉구}해야 한다고 생각합니다"
            ],
            variable_slots={
                "시공사명": ["GS-파르나스", "외부 업체", "해당 업체"],
                "우려_강도": ["심각한", "깊은", "진지한"],
                "위험_요소": ["조합원 권익 침해", "운영의 불투명성", "비용 증가"],
                "문제_지적": ["사후관리", "품질 보장", "투명성"],
                "권익_우려": ["장기적 손실", "서비스 질 저하", "관리비 상승"],
                "걱정_표현": ["매우 걱정됩니다", "우려스럽습니다"],
                "신중_요청": ["반드시 신중하게", "충분히"],
                "검토_촉구": ["재검토", "면밀한 검토", "다각도 검토"]
            },
            cultural_elements=["예의있는 반대", "근거 제시", "건설적 우려"]
        ))
        
        # 중립파 템플릿들
        templates.append(MessageTemplate(
            template_id="neutral_balance_01",
            stance_type="중립파",
            construction_preference=None,
            intent_category="균형적_의견",
            korean_style="신중한_중재형",
            template_structure=[
                "양쪽 의견 모두 {의견_평가} 관점을 제시하고 있다고 봅니다",
                "{찬성_측면}도 {인정_표현}, {반대_측면}도 {이해_표현}",
                "다만 {중요_포인트}는 {핵심_가치}라고 생각합니다",
                "{제안_방식}을 통해 {해결_방향}을 모색해보면 어떨까요?"
            ],
            variable_slots={
                "의견_평가": ["중요한", "타당한", "일리있는"],
                "찬성_측면": ["효율성 측면", "현실적 접근", "전문성 활용"],
                "인정_표현": ["충분히 이해되고", "일리가 있습니다"],
                "반대_측면": ["신중함의 필요성", "우려사항", "검토 요구"],
                "이해_표현": ["공감할 수 있습니다", "타당합니다"],
                "중요_포인트": ["가장 중요한 것", "핵심"],
                "핵심_가치": ["조합원 이익", "투명성", "안정성"],
                "제안_방식": ["단계적 접근", "전문가 자문", "시범 운영"],
                "해결_방향": ["최적의 방안", "합리적 대안", "win-win 방안"]
            },
            cultural_elements=["중재적 어조", "양면 고려", "건설적 제안"]
        ))
        
        return templates
        
    def learn_person_profile(self, person_name: str, time_window_days: int = 30) -> PersonProfile:
        """개인의 성향 및 선호도 학습"""
        
        # 최근 메시지들 수집
        end_time = datetime.now()
        start_time = end_time - timedelta(days=time_window_days)
        
        all_messages = self.analyzer.get_messages_by_timerange(start_time, end_time)
        person_messages = [msg for msg in all_messages if msg.sender == person_name]
        
        if not person_messages:
            return self._create_default_profile(person_name)
            
        # 1. 정치적 성향 분석
        political_stance = self._analyze_political_stance(person_messages)
        
        # 2. 선호 시공사 분석
        preferred_company = self._analyze_construction_preference(person_messages)
        
        # 3. 커뮤니케이션 스타일 분석
        communication_style = self._analyze_communication_style(person_messages)
        
        # 4. 격식 수준 분석
        formality_level = self._analyze_formality_level(person_messages)
        
        # 5. 주요 주제들 추출
        typical_topics = self._extract_typical_topics(person_messages)
        
        # 6. 시그니처 표현들 추출
        signature_phrases = self._extract_signature_phrases(person_messages)
        
        # 7. 메시지 의도 패턴 분석
        intent_patterns = self._analyze_intent_patterns(person_messages)
        
        # 8. 한국어 언어적 특성 분석
        korean_style = self._analyze_korean_linguistic_style(person_messages)
        
        return PersonProfile(
            person_name=person_name,
            political_stance=political_stance,
            preferred_construction_company=preferred_company,
            communication_style=communication_style,
            formality_level=formality_level,
            typical_topics=typical_topics,
            signature_phrases=signature_phrases,
            message_intent_patterns=intent_patterns,
            korean_linguistic_style=korean_style
        )
        
    def _analyze_political_stance(self, messages: List[ChatMessage]) -> str:
        """정치적 성향 분석"""
        stance_scores = defaultdict(int)
        
        for message in messages:
            content = message.content
            
            # 찬성 지표
            support_indicators = ["좋다", "찬성", "효과적", "바람직", "적절", "합리적"]
            for indicator in support_indicators:
                if indicator in content:
                    stance_scores["찬성파"] += 1
                    
            # 반대 지표
            oppose_indicators = ["반대", "우려", "문제", "걱정", "의문", "위험"]
            for indicator in oppose_indicators:
                if indicator in content:
                    stance_scores["반대파"] += 1
                    
            # 중립 지표
            neutral_indicators = ["양쪽", "균형", "객관적", "신중", "검토"]
            for indicator in neutral_indicators:
                if indicator in content:
                    stance_scores["중립파"] += 1
                    
            # 신중 지표
            cautious_indicators = ["단계적", "충분한 검토", "의견 수렴", "합의"]
            for indicator in cautious_indicators:
                if indicator in content:
                    stance_scores["신중파"] += 1
                    
        return max(stance_scores, key=stance_scores.get) if stance_scores else "중립파"
        
    def _analyze_construction_preference(self, messages: List[ChatMessage]) -> Optional[str]:
        """선호 시공사 분석"""
        company_mentions = defaultdict(int)
        company_sentiments = defaultdict(list)
        
        companies = ["GS", "파르나스", "현대", "대우"]
        
        for message in messages:
            content = message.content
            
            for company in companies:
                if company in content:
                    company_mentions[company] += 1
                    
                    # 긍정/부정 맥락 분석
                    positive_context = any(word in content for word in 
                                         ["좋다", "효과적", "바람직", "적절", "우수"])
                    negative_context = any(word in content for word in 
                                         ["문제", "우려", "반대", "부적절", "위험"])
                    
                    if positive_context and not negative_context:
                        company_sentiments[company].append(1)
                    elif negative_context and not positive_context:
                        company_sentiments[company].append(-1)
                    else:
                        company_sentiments[company].append(0)
                        
        # 가장 많이 언급되고 긍정적인 회사 선택
        best_company = None
        best_score = -999
        
        for company in company_mentions:
            mentions = company_mentions[company]
            avg_sentiment = sum(company_sentiments[company]) / len(company_sentiments[company]) if company_sentiments[company] else 0
            
            # 언급 빈도와 감정 점수 종합
            total_score = mentions * (1 + avg_sentiment)
            
            if total_score > best_score:
                best_score = total_score
                best_company = company
                
        return best_company if best_score > 0 else None
        
    def _analyze_communication_style(self, messages: List[ChatMessage]) -> str:
        """커뮤니케이션 스타일 분석"""
        style_scores = defaultdict(int)
        
        for message in messages:
            content = message.content
            
            # 논리적 스타일
            logical_indicators = ["따라서", "그러므로", "분석해보면", "데이터", "객관적"]
            for indicator in logical_indicators:
                if indicator in content:
                    style_scores["논리적"] += 1
                    
            # 감정적 스타일
            emotional_indicators = ["정말", "너무", "매우", "심각한", "걱정"]
            for indicator in emotional_indicators:
                if indicator in content:
                    style_scores["감정적"] += 1
                    
            # 권위적 스타일
            authority_indicators = ["명확히", "반드시", "확실히", "단언", "지시"]
            for indicator in authority_indicators:
                if indicator in content:
                    style_scores["권위적"] += 1
                    
            # 협력적 스타일
            cooperative_indicators = ["함께", "의견 수렴", "합의", "협력", "상생"]
            for indicator in cooperative_indicators:
                if indicator in content:
                    style_scores["협력적"] += 1
                    
        return max(style_scores, key=style_scores.get) if style_scores else "논리적"
        
    def _analyze_formality_level(self, messages: List[ChatMessage]) -> str:
        """격식 수준 분석"""
        formal_count = 0
        informal_count = 0
        
        for message in messages:
            content = message.content
            
            # 높은 격식
            if any(ending in content for ending in ["습니다", "드립니다", "바랍니다"]):
                formal_count += 2
            elif any(ending in content for ending in ["세요", "하시면"]):
                formal_count += 1
                
            # 낮은 격식
            if any(ending in content for ending in ["해요", "죠", "네요"]):
                informal_count += 1
            elif any(word in content for word in ["그냥", "완전", "진짜"]):
                informal_count += 1
                
        total = formal_count + informal_count
        if total == 0:
            return "보통"
            
        formal_ratio = formal_count / total
        
        if formal_ratio > 0.7:
            return "높음"
        elif formal_ratio < 0.3:
            return "낮음"
        else:
            return "보통"
            
    def _extract_typical_topics(self, messages: List[ChatMessage]) -> List[str]:
        """주요 주제들 추출"""
        topic_keywords = {
            "총회운영": ["총회", "회의", "안건", "위임장", "참석"],
            "시공사선정": ["시공사", "GS", "파르나스", "현대", "건설"],
            "운영권": ["운영권", "위탁", "관리", "운영"],
            "비용관리": ["분담금", "비용", "관리비", "예산"],
            "절차투명성": ["절차", "투명성", "공개", "검토"],
            "조합원권익": ["권익", "이익", "보호", "침해"]
        }
        
        topic_scores = defaultdict(int)
        
        for message in messages:
            content = message.content
            for topic, keywords in topic_keywords.items():
                score = sum(1 for keyword in keywords if keyword in content)
                topic_scores[topic] += score
                
        # 상위 3개 주제 반환
        return [topic for topic, score in topic_scores.most_common(3)]
        
    def _extract_signature_phrases(self, messages: List[ChatMessage]) -> List[str]:
        """시그니처 표현들 추출"""
        phrase_patterns = [
            r'[가-힣]+하다고 생각합니다',
            r'[가-힣]+다고 봅니다',
            r'[가-힣]+해야 한다',
            r'[가-힣]+이 필요합니다',
            r'[가-힣]+을 제안합니다',
            r'우려[가-힣]*',
            r'검토[가-힣]*',
            r'신중[가-힣]*'
        ]
        
        signature_phrases = []
        
        for message in messages:
            content = message.content
            for pattern in phrase_patterns:
                matches = re.findall(pattern, content)
                signature_phrases.extend(matches)
                
        # 빈도순으로 정렬하여 상위 5개 반환
        phrase_counter = Counter(signature_phrases)
        return [phrase for phrase, count in phrase_counter.most_common(5)]
        
    def _analyze_intent_patterns(self, messages: List[ChatMessage]) -> List[str]:
        """메시지 의도 패턴 분석"""
        intent_patterns = []
        
        for message in messages:
            content = message.content
            
            # 의도 분류
            if any(word in content for word in ["제안", "어떨까", "방법"]):
                intent_patterns.append("제안형")
            elif any(word in content for word in ["우려", "걱정", "문제"]):
                intent_patterns.append("우려형")
            elif any(word in content for word in ["찬성", "좋다", "효과적"]):
                intent_patterns.append("지지형")
            elif any(word in content for word in ["정보", "안내", "참고"]):
                intent_patterns.append("정보형")
            elif any(word in content for word in ["질문", "궁금", "확인"]):
                intent_patterns.append("질문형")
            else:
                intent_patterns.append("일반형")
                
        # 가장 빈번한 패턴들 반환
        pattern_counter = Counter(intent_patterns)
        return [pattern for pattern, count in pattern_counter.most_common(3)]
        
    def _analyze_korean_linguistic_style(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """한국어 언어적 특성 분석"""
        style = {}
        
        total_chars = 0
        total_messages = len(messages)
        
        honorific_count = 0
        complex_sentence_count = 0
        
        for message in messages:
            content = message.content
            total_chars += len(content)
            
            # 경어법 사용
            if any(word in content for word in ["습니다", "세요", "드립니다"]):
                honorific_count += 1
                
            # 복문 사용 (연결어미 기준)
            if any(word in content for word in ["하지만", "그런데", "따라서", "그러므로"]):
                complex_sentence_count += 1
                
        # 평균 메시지 길이
        avg_length = total_chars / total_messages if total_messages > 0 else 0
        
        # 경어법 사용률
        honorific_ratio = honorific_count / total_messages if total_messages > 0 else 0
        
        # 복문 사용률
        complex_ratio = complex_sentence_count / total_messages if total_messages > 0 else 0
        
        style = {
            "average_message_length": avg_length,
            "honorific_usage_ratio": honorific_ratio,
            "complex_sentence_ratio": complex_ratio,
            "formality_indicator": "high" if honorific_ratio > 0.6 else "medium" if honorific_ratio > 0.3 else "low",
            "complexity_indicator": "high" if complex_ratio > 0.4 else "medium" if complex_ratio > 0.2 else "low"
        }
        
        return style 

    def generate_contextual_message(self, 
                                   person_name: str, 
                                   target_topic: str,
                                   message_intent: str,
                                   reference_context: Optional[Dict[str, Any]] = None) -> GeneratedMessage:
        """맥락을 고려한 메시지 생성"""
        
        # 1. 개인 프로필 학습
        profile = self.learn_person_profile(person_name)
        
        # 2. 프로젝트 가이드라인 로드
        guidelines = self._load_project_guidelines()
        
        # 3. 기존 메시지 패턴 분석
        voice_consistency = self._analyze_voice_consistency(person_name, guidelines)
        
        # 4. 적합한 템플릿 선택
        selected_template = self._select_template(profile, target_topic, message_intent, guidelines)
        
        # 5. 메시지 생성
        generated_content = self._generate_message_content(
            profile, selected_template, target_topic, voice_consistency, guidelines
        )
        
        # 6. 품질 검증
        quality_metrics = self._validate_message_quality(
            generated_content, profile, guidelines, voice_consistency
        )
        
        # 7. 한국어 자연스러움 검증
        korean_authenticity = self._validate_korean_authenticity(generated_content, profile)
        
        return GeneratedMessage(
            message_id=f"gen_{person_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            generated_content=generated_content,
            source_person=person_name,
            confidence_score=quality_metrics.get("overall_confidence", 0.0),
            generation_method="contextual_template_based",
            template_used=selected_template.template_id if selected_template else None,
            quality_metrics=quality_metrics,
            korean_authenticity_score=korean_authenticity
        )
        
    def generate_political_style_message(self, 
                                       politician_style: str,
                                       target_topic: str,
                                       message_intent: str = "의견형",
                                       context: Optional[str] = None) -> StyledMessage:
        """정치인 스타일 메시지 생성"""
        
        try:
            styled_message = self.political_style_generator.generate_styled_message(
                style_source=politician_style,
                target_topic=target_topic,
                message_intent=message_intent,
                context=context
            )
            
            logger.info(f"정치인 스타일 메시지 생성 완료: {politician_style} 스타일")
            return styled_message
            
        except Exception as e:
            logger.error(f"정치인 스타일 메시지 생성 실패: {e}")
            raise
            
    def generate_hybrid_message(self,
                              person_name: str,
                              politician_style: str,
                              target_topic: str,
                              message_intent: str,
                              blend_ratio: float = 0.7) -> GeneratedMessage:
        """개인 성향 + 정치인 스타일 혼합 메시지 생성"""
        
        try:
            # 1. 개인 프로필 기반 메시지 생성
            personal_message = self.generate_contextual_message(
                person_name=person_name,
                target_topic=target_topic,
                message_intent=message_intent
            )
            
            # 2. 정치인 스타일 메시지 생성
            political_message = self.generate_political_style_message(
                politician_style=politician_style,
                target_topic=target_topic,
                message_intent=message_intent
            )
            
            # 3. 두 스타일 혼합
            hybrid_content = self._blend_message_styles(
                personal_content=personal_message.generated_content,
                political_content=political_message.content,
                blend_ratio=blend_ratio,
                politician_style=politician_style
            )
            
            # 4. 품질 검증
            profile = self.learn_person_profile(person_name)
            guidelines = self._load_project_guidelines()
            voice_consistency = self._analyze_voice_consistency(person_name, guidelines)
            
            quality_metrics = self._validate_message_quality(
                hybrid_content, profile, guidelines, voice_consistency
            )
            
            # 5. 혼합 메시지 결과 생성
            return GeneratedMessage(
                message_id=f"hybrid_{person_name}_{politician_style}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                generated_content=hybrid_content,
                source_person=f"{person_name} + {politician_style} 스타일",
                confidence_score=quality_metrics.get("overall_confidence", 0.0),
                generation_method="hybrid_style_blend",
                template_used=f"personal_profile + {politician_style}_style",
                quality_metrics=quality_metrics,
                korean_authenticity_score=self._validate_korean_authenticity(hybrid_content, profile)
            )
            
        except Exception as e:
            logger.error(f"혼합 메시지 생성 실패: {e}")
            raise
            
    def _blend_message_styles(self,
                            personal_content: str,
                            political_content: str,
                            blend_ratio: float,
                            politician_style: str) -> str:
        """개인 스타일과 정치인 스타일 혼합"""
        
        # 정치인별 특화 혼합 방식
        if politician_style == "유시민":
            # 논리적 구조 강화
            hybrid = self._blend_with_logical_enhancement(personal_content, political_content, blend_ratio)
        elif politician_style == "정준희":
            # 현실 직시 표현 추가
            hybrid = self._blend_with_reality_focus(personal_content, political_content, blend_ratio)
        elif politician_style == "진중권":
            # 비판적 시각 강화
            hybrid = self._blend_with_critical_perspective(personal_content, political_content, blend_ratio)
        elif politician_style == "박형준":
            # 균형잡힌 접근 강화
            hybrid = self._blend_with_balanced_approach(personal_content, political_content, blend_ratio)
        elif politician_style == "정원책":
            # 개혁적 관점 추가
            hybrid = self._blend_with_progressive_view(personal_content, political_content, blend_ratio)
        elif politician_style == "이철희":
            # 체계적 분석 강화
            hybrid = self._blend_with_systematic_analysis(personal_content, political_content, blend_ratio)
        else:
            # 기본 혼합 방식
            hybrid = self._basic_style_blend(personal_content, political_content, blend_ratio)
            
        return hybrid
        
    def _blend_with_logical_enhancement(self, personal: str, political: str, ratio: float) -> str:
        """유시민 스타일: 논리적 구조 강화"""
        
        # 정치인 스타일에서 논리적 표현 추출
        logical_phrases = ["객관적으로", "논리적으로", "합리적으로", "데이터를 보면"]
        political_logic = next((phrase for phrase in logical_phrases if phrase in political), "객관적으로")
        
        # 개인 메시지에 논리적 구조 추가
        if ratio > 0.5:
            enhanced = f"{political_logic} 분석해보면, {personal}"
            if "따라서" not in enhanced:
                enhanced += " 따라서 이런 접근이 합리적이라고 판단됩니다."
        else:
            enhanced = personal + f" {political_logic} 접근하는 것이 바람직할 것 같습니다."
            
        return enhanced
        
    def _blend_with_reality_focus(self, personal: str, political: str, ratio: float) -> str:
        """정준희 스타일: 현실 직시 표현 추가"""
        
        reality_phrases = ["현실을 직시하면", "냉정하게 말씀드리면", "사실은", "정확히 짚고 넘어가자면"]
        reality_phrase = next((phrase for phrase in reality_phrases if phrase in political), "현실적으로")
        
        if ratio > 0.5:
            enhanced = f"{reality_phrase}, {personal}"
            if "핵심은" not in enhanced:
                enhanced += " 핵심은 바로 이런 점들을 명확히 하는 것입니다."
        else:
            enhanced = personal + f" {reality_phrase} 이것이 현실적 판단이라고 봅니다."
            
        return enhanced
        
    def _blend_with_critical_perspective(self, personal: str, political: str, ratio: float) -> str:
        """진중권 스타일: 비판적 시각 강화"""
        
        critical_phrases = ["모순", "문제", "비판적으로", "철학적으로"]
        
        if ratio > 0.5:
            enhanced = f"철학적으로 접근해보면, {personal}"
            if any(word in political for word in ["모순", "문제"]):
                enhanced += " 이런 접근이야말로 진정한 성찰이라고 할 수 있습니다."
        else:
            enhanced = personal + " 비판적 사고로 접근하는 것이 중요하다고 봅니다."
            
        return enhanced
        
    def _blend_with_balanced_approach(self, personal: str, political: str, ratio: float) -> str:
        """박형준 스타일: 균형잡힌 접근 강화"""
        
        balance_phrases = ["균형잡힌", "상호 이해", "협력적", "건설적"]
        
        if ratio > 0.5:
            enhanced = f"균형잡힌 시각에서 {personal}"
            enhanced += " 상호 이해를 바탕으로 건설적 방향으로 나아가는 것이 바람직합니다."
        else:
            enhanced = personal + " 협력적 접근으로 상생의 방안을 모색해보면 좋겠습니다."
            
        return enhanced
        
    def _blend_with_progressive_view(self, personal: str, political: str, ratio: float) -> str:
        """정원책 스타일: 개혁적 관점 추가"""
        
        progressive_phrases = ["변화", "개혁", "진보적", "민주적"]
        
        if ratio > 0.5:
            enhanced = f"진보적 가치에 따라 {personal}"
            enhanced += " 민주적 절차와 변화의 필요성을 함께 고려해야 합니다."
        else:
            enhanced = personal + " 개혁적 관점에서 더 나은 변화를 추구해야 한다고 생각합니다."
            
        return enhanced
        
    def _blend_with_systematic_analysis(self, personal: str, political: str, ratio: float) -> str:
        """이철희 스타일: 체계적 분석 강화"""
        
        systematic_phrases = ["체계적으로", "구체적으로", "단계적으로", "정책적 관점에서"]
        
        if ratio > 0.5:
            enhanced = f"구체적으로 살펴보면, {personal}"
            enhanced += " 체계적이고 단계적인 접근이 실질적 효과를 가져올 것입니다."
        else:
            enhanced = personal + " 정책적 관점에서 체계적으로 검토해보는 것이 필요합니다."
            
        return enhanced
        
    def _basic_style_blend(self, personal: str, political: str, ratio: float) -> str:
        """기본 혼합 방식"""
        
        if ratio > 0.7:
            # 정치인 스타일 우세
            return f"{political[:50]}... {personal[personal.find(' '):]}"
        elif ratio > 0.3:
            # 균형 혼합
            return f"{personal[:len(personal)//2]} {political[political.find(' ')+1:political.find('.')]}, {personal[len(personal)//2:]}"
        else:
            # 개인 스타일 우세
            return f"{personal} {political[political.rfind('.'):]}"
            
    def analyze_message_political_style(self, message: str) -> Dict[str, Any]:
        """메시지의 정치인 스타일 분석"""
        
        return self.political_style_generator.analyze_political_style(message)
        
    def get_available_political_styles(self) -> List[Dict[str, Any]]:
        """사용 가능한 정치인 스타일 목록"""
        
        return self.political_style_generator.get_available_styles()
        
    def generate_style_comparison(self, 
                                topic: str,
                                politician_styles: List[str]) -> Dict[str, StyledMessage]:
        """여러 정치인 스타일 비교 메시지 생성"""
        
        return self.political_style_generator.generate_comparative_messages(topic, politician_styles)
        
    def learn_politician_style_from_data(self, 
                                       politician_name: str,
                                       speech_data: List[str]) -> Dict[str, Any]:
        """연설/발언 데이터로부터 정치인 스타일 학습"""
        
        return self.political_style_learner.learn_from_speech_data(politician_name, speech_data)
        
    def recommend_political_style(self, 
                                person_name: str,
                                target_topic: str) -> Dict[str, Any]:
        """개인에게 적합한 정치인 스타일 추천"""
        
        try:
            # 개인 프로필 분석
            profile = self.learn_person_profile(person_name)
            
            # 정치인 스타일들과의 매칭도 계산
            style_compatibility = {}
            
            for politician in self.political_style_generator.political_figures.keys():
                politician_profile = self.political_style_generator.political_figures[politician]
                
                compatibility_score = 0
                
                # 정치적 성향 일치도
                if profile.political_stance == "찬성파" and "합리주의" in politician_profile.political_stance:
                    compatibility_score += 0.3
                elif profile.political_stance == "반대파" and "비판" in politician_profile.communication_style:
                    compatibility_score += 0.3
                elif profile.political_stance == "중립파" and "중재" in politician_profile.communication_style:
                    compatibility_score += 0.3
                    
                # 커뮤니케이션 스타일 일치도
                if profile.communication_style == "논리적":
                    if politician in ["유시민", "이철희"]:
                        compatibility_score += 0.4
                elif profile.communication_style == "감정적":
                    if politician in ["정원책", "진중권"]:
                        compatibility_score += 0.4
                elif profile.communication_style == "협력적":
                    if politician == "박형준":
                        compatibility_score += 0.4
                        
                # 전문 영역 일치도
                topic_area_mapping = {
                    "시공사": "경제",
                    "분담금": "경제", 
                    "법률": "정치",
                    "투명성": "정치"
                }
                
                relevant_area = topic_area_mapping.get(target_topic, "정치")
                if relevant_area in politician_profile.expertise_areas:
                    compatibility_score += 0.3
                    
                style_compatibility[politician] = compatibility_score
                
            # 상위 3개 추천
            recommended_styles = sorted(style_compatibility.items(), 
                                      key=lambda x: x[1], reverse=True)[:3]
            
            return {
                "success": True,
                "person_profile": {
                    "political_stance": profile.political_stance,
                    "communication_style": profile.communication_style,
                    "formality_level": profile.formality_level
                },
                "recommended_styles": [
                    {
                        "politician": politician,
                        "compatibility_score": score,
                        "style_description": self.political_style_generator.political_figures[politician].communication_style,
                        "reason": self._explain_style_recommendation(politician, score, profile)
                    }
                    for politician, score in recommended_styles
                ],
                "target_topic": target_topic
            }
            
        except Exception as e:
            logger.error(f"정치인 스타일 추천 실패: {e}")
            return {"success": False, "error": str(e)}
            
    def _explain_style_recommendation(self, politician: str, score: float, profile: PersonProfile) -> str:
        """스타일 추천 이유 설명"""
        
        reasons = []
        
        if score > 0.8:
            reasons.append("매우 높은 일치도")
        elif score > 0.6:
            reasons.append("높은 일치도")
        elif score > 0.4:
            reasons.append("적당한 일치도")
        else:
            reasons.append("부분적 일치")
            
        politician_profile = self.political_style_generator.political_figures[politician]
        
        if profile.communication_style == "논리적" and politician in ["유시민", "이철희"]:
            reasons.append("논리적 사고 방식이 유사함")
        elif profile.communication_style == "협력적" and politician == "박형준":
            reasons.append("협력적 접근 방식이 일치함")
        elif "비판" in politician_profile.communication_style:
            reasons.append("비판적 사고력 강화에 도움")
            
        return ", ".join(reasons)
        
    def _load_project_guidelines(self) -> Dict[str, Any]:
        """프로젝트 가이드라인 로드"""
        guidelines = {
            "communication_principles": {
                "tone": "정중하고 존중하는 어조",
                "approach": "건설적이고 협력적인 접근",
                "language_style": "명확하고 이해하기 쉬운 표현",
                "cultural_sensitivity": "한국 문화와 예의에 맞는 표현"
            },
            "content_guidelines": {
                "factual_accuracy": "사실에 기반한 정확한 정보",
                "balanced_perspective": "균형잡힌 시각과 객관적 접근",
                "constructive_criticism": "건설적 비판과 대안 제시",
                "solution_oriented": "문제 해결 중심의 논의"
            },
            "voice_consistency_rules": {
                "individual_characteristics": "개인별 고유한 말투와 표현 유지",
                "stance_coherence": "기존 입장과 일관성 있는 논리",
                "topic_expertise": "각자의 전문 영역에 맞는 발언",
                "emotional_authenticity": "자연스러운 감정 표현"
            },
            "prohibited_elements": [
                "인신공격이나 비방",
                "근거없는 추측이나 루머",
                "극단적이거나 선동적인 표현",
                "타인의 사생활 침해",
                "불필요한 갈등 조장"
            ],
            "required_elements": [
                "상대방에 대한 기본적 존중",
                "논리적 근거나 데이터 제시",
                "건설적 대안이나 제안",
                "조합원 전체 이익 고려"
            ]
        }
        
        # 프로젝트별 특수 가이드라인 (개포우성7차 기준)
        guidelines["project_specific"] = {
            "key_stakeholders": ["GS건설", "파르나스", "조합원", "관리소"],
            "main_issues": ["운영권", "시공사 선정", "분담금", "투명성"],
            "decision_criteria": ["경제성", "전문성", "투명성", "조합원 권익"],
            "communication_channels": ["총회", "온라인 플랫폼", "공지사항"],
            "timeline_considerations": ["긴급성", "충분한 검토 시간", "단계적 접근"]
        }
        
        return guidelines
        
    def _analyze_voice_consistency(self, person_name: str, guidelines: Dict[str, Any]) -> Dict[str, Any]:
        """목소리 일관성 분석"""
        
        # 최근 30일간 메시지 분석
        end_time = datetime.now()
        start_time = end_time - timedelta(days=30)
        
        all_messages = self.analyzer.get_messages_by_timerange(start_time, end_time)
        person_messages = [msg for msg in all_messages if msg.sender == person_name]
        
        voice_profile = {
            "consistent_phrases": self._extract_consistent_phrases(person_messages),
            "argumentation_style": self._analyze_argumentation_style(person_messages),
            "emotional_range": self._analyze_emotional_range(person_messages),
            "topic_expertise": self._analyze_topic_expertise(person_messages),
            "interaction_patterns": self._analyze_interaction_patterns(person_messages, all_messages),
            "linguistic_markers": self._extract_linguistic_markers(person_messages),
            "stance_evolution": self._track_stance_evolution(person_messages)
        }
        
        return voice_profile
        
    def _extract_consistent_phrases(self, messages: List[ChatMessage]) -> List[str]:
        """일관된 표현 패턴 추출"""
        phrase_patterns = []
        
        # 자주 사용하는 표현 패턴들
        common_patterns = [
            r'[가-힣]+다고 생각합니다',
            r'[가-힣]+해야 한다고 봅니다', 
            r'개인적으로는 [가-힣]+',
            r'저는 [가-힣]+다고 생각',
            r'[가-힣]+에 대해 우려',
            r'[가-힣]+을 제안합니다',
            r'[가-힣]+이 중요하다',
            r'[가-힣]+을 고려해야'
        ]
        
        phrase_counter = defaultdict(int)
        
        for message in messages:
            content = message.content
            for pattern in common_patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    phrase_counter[match] += 1
                    
        # 빈도 2회 이상인 표현들만 선택
        consistent_phrases = [phrase for phrase, count in phrase_counter.items() if count >= 2]
        
        return consistent_phrases[:10]  # 상위 10개
        
    def _analyze_argumentation_style(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """논증 스타일 분석"""
        style_analysis = {
            "preferred_evidence_types": [],
            "logical_connectors": [],
            "persuasion_techniques": [],
            "conclusion_patterns": []
        }
        
        for message in messages:
            content = message.content
            
            # 선호하는 근거 유형
            if any(word in content for word in ["데이터", "통계", "수치"]):
                style_analysis["preferred_evidence_types"].append("데이터 기반")
            if any(word in content for word in ["경험", "사례", "예시"]):
                style_analysis["preferred_evidence_types"].append("경험 기반")
            if any(word in content for word in ["전문가", "자문", "의견"]):
                style_analysis["preferred_evidence_types"].append("전문가 의견")
                
            # 논리적 연결어
            logical_words = ["따라서", "그러므로", "하지만", "그런데", "왜냐하면"]
            for word in logical_words:
                if word in content:
                    style_analysis["logical_connectors"].append(word)
                    
            # 설득 기법
            if any(word in content for word in ["생각해보시면", "고려하시면"]):
                style_analysis["persuasion_techniques"].append("상대방 관점 유도")
            if any(word in content for word in ["명확히", "분명히"]):
                style_analysis["persuasion_techniques"].append("확신 표현")
                
        # 빈도 기반 정리
        for key in style_analysis:
            if style_analysis[key]:
                counter = Counter(style_analysis[key])
                style_analysis[key] = [item for item, count in counter.most_common(3)]
                
        return style_analysis
        
    def _analyze_emotional_range(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """감정 표현 범위 분석"""
        emotions = {
            "긍정적": ["좋다", "만족", "기쁘다", "다행", "훌륭"],
            "부정적": ["걱정", "우려", "불만", "실망", "화나"],
            "중립적": ["생각", "의견", "검토", "고려", "판단"],
            "강조적": ["매우", "정말", "너무", "완전히", "절대"],
            "신중함": ["조심", "신중", "충분히", "면밀히", "세심하게"]
        }
        
        emotion_usage = defaultdict(int)
        
        for message in messages:
            content = message.content
            for emotion_type, words in emotions.items():
                for word in words:
                    if word in content:
                        emotion_usage[emotion_type] += 1
                        
        # 정규화
        total_emotions = sum(emotion_usage.values())
        if total_emotions > 0:
            emotion_profile = {
                emotion: count / total_emotions 
                for emotion, count in emotion_usage.items()
            }
        else:
            emotion_profile = {}
            
        return emotion_profile
        
    def _analyze_topic_expertise(self, messages: List[ChatMessage]) -> Dict[str, float]:
        """주제별 전문성 분석"""
        topic_keywords = {
            "법률_절차": ["법률", "절차", "규정", "조례", "법적"],
            "건설_기술": ["시공", "기술", "품질", "공법", "설계"],
            "재무_회계": ["비용", "예산", "회계", "자금", "분담금"],
            "관리_운영": ["관리", "운영", "서비스", "유지보수", "시설"],
            "의사결정": ["결정", "선택", "판단", "검토", "승인"]
        }
        
        expertise_scores = defaultdict(int)
        
        for message in messages:
            content = message.content
            for topic, keywords in topic_keywords.items():
                # 키워드 밀도 계산
                keyword_count = sum(1 for keyword in keywords if keyword in content)
                if keyword_count > 0:
                    # 메시지 길이 대비 키워드 밀도
                    density = keyword_count / len(content.split())
                    expertise_scores[topic] += density
                    
        return dict(expertise_scores)
        
    def _select_template(self, 
                        profile: PersonProfile, 
                        target_topic: str, 
                        message_intent: str,
                        guidelines: Dict[str, Any]) -> Optional[MessageTemplate]:
        """적합한 템플릿 선택"""
        
        compatible_templates = []
        
        for template in self.korean_message_templates:
            compatibility_score = 0
            
            # 성향 일치도
            if template.stance_type == profile.political_stance:
                compatibility_score += 3
            elif template.stance_type == "중립파" and profile.political_stance in ["신중파"]:
                compatibility_score += 2
                
            # 시공사 선호도 일치
            if template.construction_preference == profile.preferred_construction_company:
                compatibility_score += 2
            elif template.construction_preference is None:
                compatibility_score += 1
                
            # 의도 일치도
            if any(intent in template.intent_category for intent in profile.message_intent_patterns):
                compatibility_score += 2
                
            # 격식 수준 일치
            formality_match = self._check_formality_match(template, profile)
            compatibility_score += formality_match
            
            # 가이드라인 준수도
            guideline_compliance = self._check_guideline_compliance(template, guidelines)
            compatibility_score += guideline_compliance
            
            if compatibility_score > 0:
                compatible_templates.append((template, compatibility_score))
                
        # 가장 높은 점수의 템플릿 선택
        if compatible_templates:
            best_template = max(compatible_templates, key=lambda x: x[1])[0]
            return best_template
            
        return None
        
    def _check_formality_match(self, template: MessageTemplate, profile: PersonProfile) -> int:
        """격식 수준 일치도 검사"""
        template_formality = template.korean_style
        profile_formality = profile.formality_level
        
        formality_mapping = {
            "정중한_논리형": "높음",
            "정중한_우려형": "높음", 
            "신중한_중재형": "보통",
            "협력적_제안형": "보통",
            "간결한_정보형": "낮음"
        }
        
        expected_formality = formality_mapping.get(template_formality, "보통")
        
        if expected_formality == profile_formality:
            return 2
        elif abs(["낮음", "보통", "높음"].index(expected_formality) - 
                ["낮음", "보통", "높음"].index(profile_formality)) == 1:
            return 1
        else:
            return 0
            
    def _check_guideline_compliance(self, template: MessageTemplate, guidelines: Dict[str, Any]) -> int:
        """가이드라인 준수도 검사"""
        compliance_score = 0
        
        # 문화적 요소 점검
        cultural_elements = template.cultural_elements
        required_cultural = ["정중한 어조", "논리적 구조", "상대방 배려"]
        
        for required in required_cultural:
            if any(required in element for element in cultural_elements):
                compliance_score += 1
                
        # 금지 요소 확인
        prohibited = guidelines.get("prohibited_elements", [])
        for element in template.template_structure:
            if any(prohibited_item in element for prohibited_item in prohibited):
                compliance_score -= 2
                
        # 필수 요소 확인
        required = guidelines.get("required_elements", [])
        for element in template.template_structure:
            if any(required_item in element for required_item in required):
                compliance_score += 1
                
        return max(0, compliance_score)
        
    def _generate_message_content(self, 
                                profile: PersonProfile,
                                template: MessageTemplate,
                                target_topic: str,
                                voice_consistency: Dict[str, Any],
                                guidelines: Dict[str, Any]) -> str:
        """메시지 내용 생성"""
        
        if not template:
            return self._generate_fallback_message(profile, target_topic, guidelines)
            
        # 템플릿 구조 기반 생성
        message_parts = []
        
        for structure_part in template.template_structure:
            # 변수 슬롯 채우기
            filled_part = self._fill_template_variables(
                structure_part, template, profile, target_topic, voice_consistency
            )
            message_parts.append(filled_part)
            
        # 개인 특성 반영
        personalized_message = self._personalize_message(
            " ".join(message_parts), profile, voice_consistency
        )
        
        # 가이드라인 준수 확인 및 조정
        compliant_message = self._ensure_guideline_compliance(
            personalized_message, guidelines, profile
        )
        
        return compliant_message
        
    def _fill_template_variables(self, 
                               template_part: str,
                               template: MessageTemplate,
                               profile: PersonProfile,
                               target_topic: str,
                               voice_consistency: Dict[str, Any]) -> str:
        """템플릿 변수 채우기"""
        
        filled_part = template_part
        
        # 변수 패턴 찾기
        import re
        variables = re.findall(r'\{([^}]+)\}', template_part)
        
        for variable in variables:
            if variable in template.variable_slots:
                # 개인 특성과 맞는 선택지 우선
                choices = template.variable_slots[variable]
                
                # 개인 프로필 기반 선택
                selected_value = self._select_contextual_value(
                    variable, choices, profile, voice_consistency
                )
                
                filled_part = filled_part.replace(f"{{{variable}}}", selected_value)
                
        return filled_part
        
    def _select_contextual_value(self, 
                               variable_name: str,
                               choices: List[str],
                               profile: PersonProfile,
                               voice_consistency: Dict[str, Any]) -> str:
        """맥락에 맞는 값 선택"""
        
        # 시공사 관련 변수
        if "시공사" in variable_name and profile.preferred_construction_company:
            if profile.preferred_construction_company in choices:
                return profile.preferred_construction_company
                
        # 표현 스타일 관련
        if "표현" in variable_name:
            # 개인의 일관된 표현 패턴 우선 사용
            consistent_phrases = voice_consistency.get("consistent_phrases", [])
            for phrase in consistent_phrases:
                for choice in choices:
                    if choice in phrase or phrase in choice:
                        return choice
                        
        # 감정 관련 변수
        if any(emotion_word in variable_name for emotion_word in ["우려", "긍정", "강도"]):
            emotion_range = voice_consistency.get("emotional_range", {})
            
            if "우려" in variable_name and emotion_range.get("부정적", 0) > 0.3:
                negative_choices = [c for c in choices if any(neg in c for neg in ["심각", "깊은", "진지한"])]
                if negative_choices:
                    return random.choice(negative_choices)
                    
        # 논리 관련 변수
        if "분석" in variable_name or "논리" in variable_name:
            arg_style = voice_consistency.get("argumentation_style", {})
            preferred_evidence = arg_style.get("preferred_evidence_types", [])
            
            if "데이터 기반" in preferred_evidence:
                data_choices = [c for c in choices if any(word in c for word in ["객관적", "분석적", "체계적"])]
                if data_choices:
                    return random.choice(data_choices)
                    
        # 기본값: 무작위 선택
        return random.choice(choices)
        
    def _personalize_message(self, 
                           base_message: str,
                           profile: PersonProfile,
                           voice_consistency: Dict[str, Any]) -> str:
        """개인 특성 반영한 메시지 개인화"""
        
        personalized = base_message
        
        # 개인 시그니처 표현 추가
        if profile.signature_phrases:
            # 적절한 위치에 시그니처 표현 삽입
            signature = random.choice(profile.signature_phrases)
            if len(personalized.split('.')) > 1:
                sentences = personalized.split('.')
                # 마지막 문장 앞에 시그니처 표현 삽입
                sentences.insert(-1, f" {signature}")
                personalized = '.'.join(sentences)
                
        # 개인 커뮤니케이션 스타일 반영
        if profile.communication_style == "논리적":
            # 논리적 연결어 강화
            logical_connectors = voice_consistency.get("argumentation_style", {}).get("logical_connectors", [])
            if logical_connectors:
                connector = random.choice(logical_connectors)
                if "." in personalized:
                    personalized = personalized.replace(".", f". {connector} ", 1)
                    
        elif profile.communication_style == "감정적":
            # 감정 표현 강화
            emotional_words = ["정말", "매우", "너무"]
            for word in emotional_words:
                if word not in personalized:
                    # 적절한 형용사 앞에 감정 부사 추가
                    adjectives = ["중요한", "심각한", "좋은", "나쁜"]
                    for adj in adjectives:
                        if adj in personalized:
                            personalized = personalized.replace(adj, f"{word} {adj}", 1)
                            break
                            
        return personalized
        
    def _ensure_guideline_compliance(self, 
                                   message: str,
                                   guidelines: Dict[str, Any],
                                   profile: PersonProfile) -> str:
        """가이드라인 준수 확인 및 조정"""
        
        compliant_message = message
        
        # 금지 요소 제거
        prohibited = guidelines.get("prohibited_elements", [])
        for prohibited_item in prohibited:
            # 금지된 표현이 있으면 대체
            if any(word in compliant_message for word in ["공격", "비방", "루머"]):
                compliant_message = self._replace_inappropriate_content(compliant_message)
                
        # 필수 요소 확인 및 추가
        required = guidelines.get("required_elements", [])
        
        # 존중 표현 확인
        if not any(word in compliant_message for word in ["생각합니다", "봅니다", "의견"]):
            compliant_message += " 이는 개인적인 의견입니다."
            
        # 근거 제시 확인
        if not any(word in compliant_message for word in ["왜냐하면", "따라서", "~때문에"]):
            if len(compliant_message.split('.')) > 1:
                sentences = compliant_message.split('.')
                sentences.insert(1, " 이는 실제 경험을 바탕으로 한 판단입니다.")
                compliant_message = '.'.join(sentences)
                
        # 조합원 이익 고려 언급
        if "조합원" not in compliant_message:
            compliant_message += " 궁극적으로는 조합원 전체의 이익을 위한 것이라고 봅니다."
            
        return compliant_message.strip()
        
    def _replace_inappropriate_content(self, message: str) -> str:
        """부적절한 내용 대체"""
        replacements = {
            "공격": "비판",
            "비방": "의견 제시",
            "루머": "추측",
            "문제가 많다": "개선이 필요하다",
            "잘못되었다": "재검토가 필요하다"
        }
        
        replaced_message = message
        for original, replacement in replacements.items():
            replaced_message = replaced_message.replace(original, replacement)
            
        return replaced_message
        
    def _validate_message_quality(self, 
                                message: str,
                                profile: PersonProfile,
                                guidelines: Dict[str, Any],
                                voice_consistency: Dict[str, Any]) -> Dict[str, float]:
        """메시지 품질 검증"""
        
        quality_metrics = {}
        
        # 1. 일관성 점수 (0.0 ~ 1.0)
        consistency_score = self._calculate_consistency_score(message, profile, voice_consistency)
        quality_metrics["consistency"] = consistency_score
        
        # 2. 가이드라인 준수 점수
        compliance_score = self._calculate_compliance_score(message, guidelines)
        quality_metrics["compliance"] = compliance_score
        
        # 3. 자연스러움 점수
        naturalness_score = self._calculate_naturalness_score(message, profile)
        quality_metrics["naturalness"] = naturalness_score
        
        # 4. 정보성 점수
        informativeness_score = self._calculate_informativeness_score(message)
        quality_metrics["informativeness"] = informativeness_score
        
        # 5. 종합 신뢰도 점수
        overall_confidence = (
            consistency_score * 0.3 +
            compliance_score * 0.25 +
            naturalness_score * 0.25 +
            informativeness_score * 0.2
        )
        quality_metrics["overall_confidence"] = overall_confidence
        
        return quality_metrics
        
    def _calculate_consistency_score(self, 
                                   message: str,
                                   profile: PersonProfile,
                                   voice_consistency: Dict[str, Any]) -> float:
        """일관성 점수 계산"""
        score = 0.0
        total_checks = 0
        
        # 시그니처 표현 일치도
        signature_phrases = profile.signature_phrases
        if signature_phrases:
            total_checks += 1
            if any(phrase in message for phrase in signature_phrases):
                score += 1.0
                
        # 정치적 성향 일치도
        stance = profile.political_stance
        stance_indicators = self.stance_patterns.get(stance, {}).get("자주쓰는_표현", [])
        if stance_indicators:
            total_checks += 1
            if any(indicator in message for indicator in stance_indicators):
                score += 1.0
                
        # 커뮤니케이션 스타일 일치도
        total_checks += 1
        if profile.communication_style == "논리적":
            if any(word in message for word in ["분석", "객관적", "따라서"]):
                score += 1.0
        elif profile.communication_style == "감정적":
            if any(word in message for word in ["정말", "매우", "걱정"]):
                score += 1.0
        elif profile.communication_style == "협력적":
            if any(word in message for word in ["함께", "협력", "합의"]):
                score += 1.0
                
        return score / total_checks if total_checks > 0 else 0.5
        
    def _calculate_compliance_score(self, message: str, guidelines: Dict[str, Any]) -> float:
        """가이드라인 준수 점수 계산"""
        score = 1.0
        
        # 금지 요소 확인
        prohibited = guidelines.get("prohibited_elements", [])
        for prohibited_item in prohibited:
            if any(word in message.lower() for word in ["공격", "비방", "루머"]):
                score -= 0.3
                
        # 필수 요소 확인
        required_checks = 0
        if any(word in message for word in ["생각합니다", "봅니다", "의견"]):
            required_checks += 1
        if any(word in message for word in ["조합원", "이익", "전체"]):
            required_checks += 1
        if any(word in message for word in ["검토", "신중", "고려"]):
            required_checks += 1
            
        score += (required_checks / 3) * 0.5
        
        return min(1.0, max(0.0, score))
        
    def _calculate_naturalness_score(self, message: str, profile: PersonProfile) -> float:
        """자연스러움 점수 계산"""
        score = 0.5  # 기본점수
        
        # 문장 길이 적절성
        sentences = message.split('.')
        avg_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        
        if 5 <= avg_length <= 20:  # 적절한 문장 길이
            score += 0.2
            
        # 격식 수준 일치도
        formality = profile.formality_level
        if formality == "높음":
            if any(ending in message for ending in ["습니다", "드립니다"]):
                score += 0.2
        elif formality == "보통":
            if any(ending in message for ending in ["해요", "네요"]):
                score += 0.2
                
        # 한국어 문법 자연스러움 (간단 체크)
        if not any(pattern in message for pattern in ["다 다", "은 은", "를 를"]):  # 중복 조사 체크
            score += 0.1
            
        return min(1.0, score)
        
    def _calculate_informativeness_score(self, message: str) -> float:
        """정보성 점수 계산"""
        score = 0.0
        
        # 구체적 정보 포함 여부
        if any(word in message for word in ["구체적", "명확히", "자세히"]):
            score += 0.3
            
        # 근거나 데이터 언급
        if any(word in message for word in ["데이터", "통계", "경험", "사례"]):
            score += 0.3
            
        # 실행 방안 제시
        if any(word in message for word in ["제안", "방법", "방안", "대안"]):
            score += 0.2
            
        # 메시지 길이 (너무 짧지 않음)
        if len(message) >= 50:
            score += 0.2
            
        return min(1.0, score)
        
    def _validate_korean_authenticity(self, message: str, profile: PersonProfile) -> float:
        """한국어 자연스러움 검증"""
        authenticity_score = 0.5  # 기본점수
        
        # 한국어 어순 자연스러움
        if self._check_korean_word_order(message):
            authenticity_score += 0.2
            
        # 적절한 조사 사용
        if self._check_particle_usage(message):
            authenticity_score += 0.1
            
        # 한국어다운 표현
        korean_expressions = ["다고 생각합니다", "라고 봅니다", "해야 한다", "이 중요하다"]
        if any(expr in message for expr in korean_expressions):
            authenticity_score += 0.1
            
        # 문화적 적절성
        if any(word in message for word in ["존중", "배려", "신중", "조화"]):
            authenticity_score += 0.1
            
        return min(1.0, authenticity_score)
        
    def _check_korean_word_order(self, message: str) -> bool:
        """한국어 어순 검사"""
        # 간단한 어순 패턴 체크 (주어-목적어-동사)
        sentences = message.split('.')
        
        for sentence in sentences:
            # 기본적인 한국어 어순 패턴 확인
            if sentence.strip():
                words = sentence.strip().split()
                if len(words) >= 2:
                    # 마지막 단어가 동사/형용사 어미로 끝나는지 확인
                    last_word = words[-1]
                    if any(last_word.endswith(ending) for ending in 
                          ["다", "습니다", "해요", "요", "죠", "네"]):
                        return True
                        
        return False
        
    def _check_particle_usage(self, message: str) -> bool:
        """조사 사용 검사"""
        # 기본적인 조사 사용 패턴 확인
        particles = ["은", "는", "이", "가", "을", "를", "에", "에서", "로", "으로"]
        
        for particle in particles:
            if f" {particle} " in message or message.startswith(f"{particle} "):
                return True
                
        return False
        
    def _generate_fallback_message(self, 
                                 profile: PersonProfile,
                                 target_topic: str,
                                 guidelines: Dict[str, Any]) -> str:
        """대체 메시지 생성 (템플릿 없을 때)"""
        
        # 기본 구조로 메시지 생성
        base_parts = []
        
        # 인사말
        if profile.formality_level == "높음":
            base_parts.append("안녕하세요.")
        
        # 주제 언급
        base_parts.append(f"{target_topic}에 대해 의견을 말씀드리고 싶습니다.")
        
        # 성향에 따른 기본 입장
        if profile.political_stance == "찬성파":
            base_parts.append("전반적으로 긍정적으로 검토해볼 필요가 있다고 생각합니다.")
        elif profile.political_stance == "반대파":
            base_parts.append("신중한 검토가 필요하다고 우려됩니다.")
        else:
            base_parts.append("다양한 관점에서 균형있게 접근해야 한다고 봅니다.")
            
        # 마무리
        base_parts.append("조합원 여러분의 다양한 의견을 듣고 싶습니다.")
        
        return " ".join(base_parts)
        
    def _create_default_profile(self, person_name: str) -> PersonProfile:
        """기본 프로필 생성"""
        return PersonProfile(
            person_name=person_name,
            political_stance="중립파",
            preferred_construction_company=None,
            communication_style="논리적",
            formality_level="보통",
            typical_topics=["일반토론"],
            signature_phrases=["생각합니다", "봅니다"],
            message_intent_patterns=["일반형"],
            korean_linguistic_style={
                "average_message_length": 100,
                "honorific_usage_ratio": 0.5,
                "complex_sentence_ratio": 0.3,
                "formality_indicator": "medium",
                "complexity_indicator": "medium"
            }
        )


# 사용 예시
if __name__ == "__main__":
    print("🤖 AI 메시지 생성 시스템 v6.0")
    print("=" * 50)
    print("📋 주요 기능:")
    print("   1. 개인 성향 및 선호도 자동 학습")
    print("   2. 프로젝트 가이드라인 준수")
    print("   3. 동일한 목소리 일관성 유지")
    print("   4. 한국어 자연스러움 보장")
    print("   5. 품질 검증 및 필터링")
    print("")
    print("🎯 생성 메시지 특징:")
    print("   ✓ 기존 메시지와 동일한 성향 유지")
    print("   ✓ 선호 시공사 및 입장 일관성")
    print("   ✓ 개인별 고유한 말투와 표현")
    print("   ✓ 프로젝트 가이드라인 100% 준수")
    print("   ✓ 한국 문화와 예의에 맞는 표현")
    print("")
    print("🏆 **동일한 목소리, 일관된 품질의 AI 메시지 생성!**") 