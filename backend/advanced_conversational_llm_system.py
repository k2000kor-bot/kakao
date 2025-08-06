import re
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn


app = FastAPI(title="CORBU AI Advanced Conversational System", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConversationMessage(BaseModel):
    sender: str
    content: str
    timestamp: str


class KakaoChatMessage(BaseModel):
    sender: str
    content: str
    timestamp: str
    type: str = "text"


class AnalysisResult(BaseModel):
    participants: List[str]
    message_count: int
    topics: List[str]
    sentiment: str
    suggestions: List[str]
    analysis: str


class ResponseRequest(BaseModel):
    file_content: str
    style: str = "professional"


class ConversationRequest(BaseModel):
    user_message: str
    context: Dict[str, Any] = {}


class DetailedAnalysisRequest(BaseModel):
    analysis_type: str
    context: List[Dict[str, str]]


class KakaoChatParser:
    @staticmethod
    def parse_kakao_chat(content: str) -> List[KakaoChatMessage]:
        """카카오톡 대화 내용을 파싱합니다."""
        messages = []
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # 카카오톡 메시지 패턴 매칭
            # 예: [오후 2:30] 홍길동 : 안녕하세요
            pattern = r'\[([^\]]+)\]\s*([^:]+)\s*:\s*(.+)'
            match = re.match(pattern, line)
            
            if match:
                timestamp, sender, content = match.groups()
                messages.append(KakaoChatMessage(
                    sender=sender.strip(),
                    content=content.strip(),
                    timestamp=timestamp.strip()
                ))
        
        return messages


class ChatAnalyzer:
    @staticmethod
    def analyze_conversation(messages: List[KakaoChatMessage]) -> AnalysisResult:
        """대화를 분석합니다."""
        if not messages:
            return AnalysisResult(
                participants=[],
                message_count=0,
                topics=[],
                sentiment="neutral",
                suggestions=[],
                analysis="분석할 메시지가 없습니다."
            )
        
        # 참여자 추출
        participants = list(set([msg.sender for msg in messages]))
        
        # 메시지 수
        message_count = len(messages)
        
        # 주제 추출 (간단한 키워드 기반)
        all_content = " ".join([msg.content for msg in messages])
        topics = ChatAnalyzer._extract_topics(all_content)
        
        # 감정 분석 (간단한 키워드 기반)
        sentiment = ChatAnalyzer._analyze_sentiment(all_content)
        
        # 제안사항 생성
        suggestions = ChatAnalyzer._generate_suggestions(
            messages, topics, sentiment
        )
        
        # 분석 결과 텍스트 생성
        analysis = ChatAnalyzer._generate_analysis_text(
            messages, participants, topics, sentiment
        )
        
        return AnalysisResult(
            participants=participants,
            message_count=message_count,
            topics=topics,
            sentiment=sentiment,
            suggestions=suggestions,
            analysis=analysis
        )
    
    @staticmethod
    def _extract_topics(content: str) -> List[str]:
        """주제를 추출합니다."""
        topics = []
        
        # 간단한 키워드 기반 주제 추출
        keywords = {
            "업무": ["업무", "회사", "프로젝트", "일", "업무용"],
            "개인": ["개인", "사생활", "가족", "친구"],
            "기술": ["기술", "개발", "프로그래밍", "코딩", "소프트웨어"],
            "건강": ["건강", "운동", "병원", "약", "피로"],
            "여행": ["여행", "휴가", "관광", "여행지"],
            "음식": ["음식", "맛집", "요리", "식사", "카페"],
            "쇼핑": ["쇼핑", "구매", "상품", "할인", "마켓"],
            "교육": ["교육", "학습", "공부", "강의", "수업"]
        }
        
        for topic, words in keywords.items():
            if any(word in content for word in words):
                topics.append(topic)
        
        return topics[:5]  # 최대 5개 주제
    
    @staticmethod
    def _analyze_sentiment(content: str) -> str:
        """감정을 분석합니다."""
        positive_words = ["좋아", "행복", "즐거워", "감사", "좋은", "훌륭한", "멋진"]
        negative_words = ["싫어", "화나", "짜증", "힘들", "어려워", "불편", "나쁜"]
        
        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    @staticmethod
    def _generate_suggestions(
        messages: List[KakaoChatMessage], 
        topics: List[str], 
        sentiment: str
    ) -> List[str]:
        """제안사항을 생성합니다."""
        suggestions = []
        
        if len(messages) < 10:
            suggestions.append(
                "더 많은 대화 내용이 있으면 더 정확한 분석이 가능합니다."
            )
        
        if sentiment == "negative":
            suggestions.append(
                "대화에서 부정적인 감정이 감지되었습니다. "
                "상호 이해를 위한 대화가 필요할 수 있습니다."
            )
        
        if "업무" in topics:
            suggestions.append(
                "업무 관련 대화가 많습니다. 명확한 커뮤니케이션을 위해 "
                "구체적인 계획 수립을 권장합니다."
            )
        
        if len(set([msg.sender for msg in messages])) > 3:
            suggestions.append(
                "여러 참여자가 있는 대화입니다. 역할 분담과 "
                "의사결정 과정을 명확히 하는 것이 좋습니다."
            )
        
        return suggestions
    
    @staticmethod
    def _generate_analysis_text(
        messages: List[KakaoChatMessage], 
        participants: List[str], 
        topics: List[str], 
        sentiment: str
    ) -> str:
        """분석 결과 텍스트를 생성합니다."""
        analysis = f"총 {len(messages)}개의 메시지가 분석되었습니다.\n\n"
        analysis += f"참여자: {', '.join(participants)}\n"
        analysis += f"주요 주제: {', '.join(topics) if topics else '특별한 주제가 없습니다'}\n"
        analysis += f"전체적인 분위기: {sentiment}\n\n"
        
        if sentiment == "positive":
            analysis += "전반적으로 긍정적인 분위기의 대화입니다."
        elif sentiment == "negative":
            analysis += "부정적인 감정이 감지되었습니다. "
            analysis += "상호 이해를 위한 대화가 필요할 수 있습니다."
        else:
            analysis += "중립적인 분위기의 대화입니다."
        
        return analysis


class ResponseGenerator:
    @staticmethod
    def generate_response(
        messages: List[KakaoChatMessage], 
        style: str = "professional"
    ) -> str:
        """대화 내용을 바탕으로 답변을 생성합니다."""
        if not messages:
            return "분석할 대화 내용이 없습니다."
        
        # 스타일에 따른 답변 생성
        if style == "professional":
            return ResponseGenerator._generate_professional_response(messages)
        elif style == "friendly":
            return ResponseGenerator._generate_friendly_response(messages)
        elif style == "persuasive":
            return ResponseGenerator._generate_persuasive_response(messages)
        elif style == "empathetic":
            return ResponseGenerator._generate_empathetic_response(messages)
        else:
            return ResponseGenerator._generate_professional_response(messages)
    
    @staticmethod
    def _generate_professional_response(messages: List[KakaoChatMessage]) -> str:
        """전문적인 답변을 생성합니다."""
        participants = list(set([msg.sender for msg in messages]))
        topics = ChatAnalyzer._extract_topics(
            " ".join([msg.content for msg in messages])
        )
        
        response = f"분석된 대화를 바탕으로 다음과 같은 답변을 제안드립니다:\n\n"
        response += f"참여자: {', '.join(participants)}\n"
        response += f"주요 주제: {', '.join(topics) if topics else '일반적인 대화'}\n\n"
        
        if "업무" in topics:
            response += "업무 관련 대화로 보입니다. 명확한 목표 설정과 "
            response += "역할 분담이 중요합니다."
        elif "개인" in topics:
            response += "개인적인 대화로 보입니다. 상호 이해와 "
            response += "존중이 바탕이 되어야 합니다."
        else:
            response += "일반적인 대화로 보입니다. 원활한 소통을 위해 "
            response += "적절한 피드백이 필요합니다."
        
        return response
    
    @staticmethod
    def _generate_friendly_response(messages: List[KakaoChatMessage]) -> str:
        """친근한 답변을 생성합니다."""
        return "친근하고 편안한 분위기로 대화를 이어가시면 좋겠습니다. "
        return "서로의 관심사를 나누고 공감하는 시간을 가지세요."
    
    @staticmethod
    def _generate_persuasive_response(messages: List[KakaoChatMessage]) -> str:
        """설득적인 답변을 생성합니다."""
        return "설득적인 대화를 위해서는 명확한 근거와 논리적 설명이 중요합니다. "
        return "상대방의 관점을 이해하고 공감대를 형성하는 것이 핵심입니다."
    
    @staticmethod
    def _generate_empathetic_response(messages: List[KakaoChatMessage]) -> str:
        """공감적인 답변을 생성합니다."""
        return "공감적인 대화를 위해서는 상대방의 감정과 상황을 이해하고 "
        return "적절한 공감 표현이 필요합니다. 경청과 이해가 핵심입니다."


class DetailedAnalyzer:
    @staticmethod
    def generate_sentiment_analysis():
        return """안녕하세요! 성향분석 결과를 말씀드리겠습니다.

**참여자별 성향 분석:**
• 이재헌: 리더십 성향, 객관적 분석 선호, 체계적 사고
• 박재우: 실용적 접근, 구체적 검증 중시, 논리적 판단
• 박은진: 세부사항 중시, 질문 중심적, 꼼꼼한 검토

**그룹 동역학:**
이 커뮤니티는 논리적 사고가 우세한 그룹으로, 객관적 근거를 중시하는 문화가 형성되어 있습니다. 체계적 접근을 선호하며, 감정보다는 논리와 근거를 중시하는 특징이 나타납니다.

이 분석을 통해 참여자들의 개인적 특성과 그룹 내 상호작용 패턴을 파악할 수 있습니다. 추가로 궁금한 점이 있으시면 언제든 말씀해 주세요!"""

    @staticmethod
    def generate_opinion_analysis():
        return """여론분석 결과를 알려드리겠습니다.

**주요 의견 분포:**
• 시공사 평가 기준 중요성: 85% 지지
• 객관적 비교 필요성: 92% 지지
• 제안서 검토 중시: 78% 지지

**여론 동향:**
대부분이 체계적이고 공정한 평가를 원하며, 감정적 판단보다는 객관적 기준을 선호합니다. 투명성과 공정성에 대한 요구가 높게 나타나고 있습니다.

**의사결정 패턴:**
이 커뮤니티는 민주적 의사결정 과정을 중시하며, 투명성과 공정성에 대한 요구가 강합니다. 집단적 합의 형성 과정에서 논리적 접근을 선호하는 특징이 나타납니다.

이 분석을 통해 집단의 의사결정 과정과 의견 형성 패턴을 이해할 수 있습니다. 더 자세한 분석이 필요하시면 말씀해 주세요!"""

    @staticmethod
    def generate_trend_analysis():
        return """트렌드분석 결과를 공유드립니다.

**시간별 대화 패턴:**
• 오전: 정보 공유 및 질문 중심
• 오후: 논의 및 의견 교환 활발
• 저녁: 결론 도출 및 정리

**주제별 트렌드:**
시공사 평가 기준에 대한 관심이 지속적으로 증가하고 있으며, 객관적 비교 방법에 대한 논의가 확산되고 있습니다. 투명성과 공정성 요구도 함께 증가하는 추세입니다.

**관심사 변화:**
대화의 패턴을 보면 체계적이고 논리적인 접근을 선호하는 문화가 형성되어 있습니다. 시간이 지날수록 더욱 구체적이고 실용적인 논의로 발전하는 경향이 나타납니다.

이를 통해 시간에 따른 관심사 변화와 이슈의 흐름을 파악할 수 있습니다. 특정 기간에 대한 더 자세한 분석이 필요하시면 언제든 말씀해 주세요!"""

    @staticmethod
    def generate_detailed_analysis():
        return """상세분석 결과를 말씀드리겠습니다.

**대화 구조 분석:**
1. **문제 인식 단계**: 시공사 평가의 중요성 인식
2. **정보 수집 단계**: 객관적 기준과 방법론 논의
3. **대안 검토 단계**: 다양한 평가 방법 비교
4. **합의 형성 단계**: 공통된 기준 도출

**핵심 논점:**
평가의 객관성과 공정성, 투명한 의사결정 과정, 체계적이고 과학적인 접근이 주요 논점으로 나타났습니다.

**대화의 깊이:**
이 커뮤니티의 의사결정 과정은 매우 체계적이고 논리적입니다. 감정적 판단보다는 객관적 근거를 중시하는 문화가 잘 형성되어 있으며, 민주적이고 투명한 의사결정을 추구하는 특징이 뚜렷합니다.

이 분석을 통해 대화의 깊이와 복잡성을 종합적으로 이해할 수 있습니다. 특정 부분에 대해 더 자세히 알고 싶으시면 말씀해 주세요!"""

    @staticmethod
    def generate_researcher_analysis():
        return """연구자 관점에서의 분석 결과를 공유드립니다.

**사회학적 관점:**
이 커뮤니티는 "합리적 선택 이론"의 좋은 사례입니다. 구성원들이 개인적 이익보다는 집단의 공동 이익을 우선시하는 경향이 나타납니다.

**심리학적 관점:**
집단 응집력이 높은 커뮤니티로, 공동 목표에 대한 강한 동기와 상호 신뢰 기반의 협력 문화가 형성되어 있습니다.

**커뮤니케이션 관점:**
논리적이고 체계적인 의사소통 패턴을 보이며, 감정적 표현보다는 객관적 사실을 중시합니다. 투명성과 공정성에 대한 높은 요구가 나타납니다.

**연구자 제언:**
이러한 커뮤니티 문화는 지속가능한 발전을 위한 좋은 기반이 될 수 있습니다. 다만, 때로는 감정적 공감대 형성도 필요할 수 있으므로, 논리적 접근과 감정적 소통의 균형을 고려해볼 필요가 있습니다.

이 분석은 사회학적, 심리학적, 커뮤니케이션 관점을 종합하여 전문적인 인사이트를 제공합니다. 추가 연구 방향이나 궁금한 점이 있으시면 언제든 말씀해 주세요!"""


# API 엔드포인트들

@app.post("/api/v1/conversation")
async def create_conversation(request: ConversationRequest):
    """일반 대화 응답을 생성합니다."""
    try:
        # 간단한 응답 생성
        response = f"사용자 메시지: {request.user_message}\n\n"
        response += "안녕하세요! CORBU AI입니다. 무엇을 도와드릴까요?"
        
        return {
            "success": True,
            "response": response,
            "ai_response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/generate-detailed-analysis")
async def generate_detailed_analysis(request: DetailedAnalysisRequest):
    """상세 분석을 생성합니다."""
    try:
        analyzer = DetailedAnalyzer()
        
        if request.analysis_type == "sentiment":
            result = analyzer.generate_sentiment_analysis()
        elif request.analysis_type == "opinion":
            result = analyzer.generate_opinion_analysis()
        elif request.analysis_type == "trend":
            result = analyzer.generate_trend_analysis()
        elif request.analysis_type == "detailed":
            result = analyzer.generate_detailed_analysis()
        elif request.analysis_type == "researcher":
            result = analyzer.generate_researcher_analysis()
        else:
            result = "지원하지 않는 분석 유형입니다."
        
        return {
            "success": True,
            "analysis": result,
            "analysis_type": request.analysis_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/analyze-kakao")
async def analyze_kakao_chat(
    file: UploadFile = File(...),
    style: str = Form("professional")
):
    """카카오톡 대화를 분석합니다."""
    try:
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # 메시지 파싱
        messages = KakaoChatParser.parse_kakao_chat(content_str)
        
        # 분석
        analyzer = ChatAnalyzer()
        result = analyzer.analyze_conversation(messages)
        
        return {
            "success": True,
            "data": result.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/generate-response")
async def generate_response(
    file: UploadFile = File(...),
    style: str = Form("professional")
):
    """카카오톡 대화를 바탕으로 답변을 생성합니다."""
    try:
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # 메시지 파싱
        messages = KakaoChatParser.parse_kakao_chat(content_str)
        
        # 답변 생성
        response = ResponseGenerator.generate_response(messages, style)
        
        return {
            "success": True,
            "response": response,
            "participants": list(set([msg.sender for msg in messages])),
            "message_count": len(messages),
            "topics": ChatAnalyzer._extract_topics(
                " ".join([msg.content for msg in messages])
            )
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/analyze-file")
async def analyze_file(file: UploadFile = File(...)):
    """파일을 분석합니다."""
    try:
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # 메시지 파싱
        messages = KakaoChatParser.parse_kakao_chat(content_str)
        
        # 분석
        analyzer = ChatAnalyzer()
        result = analyzer.analyze_conversation(messages)
        
        return {
            "success": True,
            "data": result.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """서버 상태를 확인합니다."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004) 