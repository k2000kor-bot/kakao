#!/usr/bin/env python3
"""
멀티모달 학습 통합 시스템
- 텍스트, 음성, 이미지 통합 학습
- 실시간 적응 및 개인화
- 고급 AI 모델 통합
- 지능형 대화 관리
- 성능 최적화 및 확장성
"""

import asyncio
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum

import aiohttp
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModalityType(Enum):
    """모달리티 유형"""
    TEXT = "text"
    AUDIO = "audio"
    IMAGE = "image"
    VIDEO = "video"
    MULTIMODAL = "multimodal"

class LearningStage(Enum):
    """학습 단계"""
    INITIALIZATION = "initialization"
    EXPLORATION = "exploration"
    DEEP_LEARNING = "deep_learning"
    SYNTHESIS = "synthesis"
    APPLICATION = "application"

class AdaptationLevel(Enum):
    """적응 수준"""
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

@dataclass
class MultimodalContent:
    """멀티모달 콘텐츠"""
    content_id: str
    modality: ModalityType
    content_data: Union[str, bytes, Dict]
    metadata: Dict[str, Any]
    processing_status: str = "pending"
    learning_score: float = 0.0
    yoo_relevance: float = 0.0
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

@dataclass
class LearningSession:
    """학습 세션"""
    session_id: str
    user_id: str
    modality: ModalityType
    stage: LearningStage
    adaptation_level: AdaptationLevel
    content_history: List[MultimodalContent] = field(default_factory=list)
    learning_progress: Dict[str, float] = field(default_factory=dict)
    personalization_data: Dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    last_updated: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TextProcessor:
    """텍스트 처리기"""
    
    def __init__(self):
        self.yoo_patterns = self._initialize_yoo_patterns()
        self.sentiment_analyzer = self._initialize_sentiment_analyzer()
        
    def _initialize_yoo_patterns(self) -> Dict[str, List[str]]:
        """유시민 패턴 초기화"""
        return {
            "opening_patterns": [
                "그런데 말이죠", "사실 우리가", "현재 우리 사회는",
                "정말 흥미로운 점은", "여기서 주목할 점은", "그런데 이것이"
            ],
            "transition_patterns": [
                "따라서", "그러므로", "그래서", "이제", "여기서 중요한 것은",
                "그런데 말이죠", "사실 이런 문제는", "우리가 놓치고 있는"
            ],
            "conclusion_patterns": [
                "따라서 우리는", "그래서 제가 말씀드리고 싶은 것은",
                "마지막으로", "결론적으로", "함께 생각해보면"
            ],
            "question_patterns": [
                "어떻게 생각하시나요?", "이것이 우리에게 주는 의미는 무엇일까요?",
                "함께 생각해보면 어떨까요?", "이런 관점에서 접근해보면 어떨까요?"
            ]
        }
    
    def _initialize_sentiment_analyzer(self) -> Dict[str, List[str]]:
        """감정 분석기 초기화"""
        return {
            "positive": ["좋다", "훌륭", "멋지다", "감사", "만족", "행복", "긍정"],
            "negative": ["나쁘다", "실망", "화나다", "슬프다", "불만", "문제", "부정"],
            "analytical": ["분석", "연구", "조사", "검토", "평가", "비교", "탐구"],
            "curious": ["궁금", "알고싶", "왜", "어떻게", "무엇", "언제", "어디서"]
        }
    
    async def process_text(self, text: str) -> Dict[str, Any]:
        """텍스트 처리"""
        analysis = {
            "text_length": len(text),
            "sentence_count": len(re.findall(r'[.!?]', text)),
            "yoo_patterns_detected": self._detect_yoo_patterns(text),
            "sentiment": self._analyze_sentiment(text),
            "complexity_score": self._calculate_complexity(text),
            "learning_potential": self._assess_learning_potential(text),
            "key_concepts": self._extract_key_concepts(text),
            "discussion_points": self._identify_discussion_points(text)
        }
        
        return analysis
    
    def _detect_yoo_patterns(self, text: str) -> Dict[str, int]:
        """유시민 패턴 감지"""
        detected = {}
        for pattern_type, patterns in self.yoo_patterns.items():
            count = sum(1 for pattern in patterns if pattern in text)
            detected[pattern_type] = count
        
        return detected
    
    def _analyze_sentiment(self, text: str) -> str:
        """감정 분석"""
        text_lower = text.lower()
        scores = {}
        
        for sentiment, keywords in self.sentiment_analyzer.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            scores[sentiment] = score
        
        return max(scores, key=scores.get) if max(scores.values()) > 0 else "neutral"
    
    def _calculate_complexity(self, text: str) -> float:
        """복잡도 계산"""
        factors = {
            "length": min(1.0, len(text) / 1000),
            "sentence_variety": len(set(re.findall(r'[.!?]', text))) / 3,
            "complex_words": len(re.findall(r'[가-힣]{3,}', text)) / 20,
            "question_density": len(re.findall(r'[?]', text)) / 5
        }
        
        return sum(factors.values()) / len(factors)
    
    def _assess_learning_potential(self, text: str) -> float:
        """학습 잠재력 평가"""
        potential_indicators = [
            "학습", "교육", "지식", "이해", "탐구", "분석", "비교",
            "사고", "논리", "근거", "증거", "사례", "예시"
        ]
        
        text_lower = text.lower()
        indicator_count = sum(1 for indicator in potential_indicators if indicator in text_lower)
        
        return min(1.0, indicator_count / 10)
    
    def _extract_key_concepts(self, text: str) -> List[str]:
        """핵심 개념 추출"""
        # 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
        words = re.findall(r'[가-힣]{2,}', text)
        word_freq = {}
        
        for word in words:
            if len(word) >= 2:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # 빈도순으로 정렬하여 상위 키워드 반환
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:10] if freq > 1]
    
    def _identify_discussion_points(self, text: str) -> List[str]:
        """토론 포인트 식별"""
        discussion_indicators = [
            "어떻게 생각하시나요?", "이것이 우리에게 주는 의미는 무엇일까요?",
            "함께 생각해보면 어떨까요?", "이런 관점에서 접근해보면 어떨까요?",
            "왜", "어떻게", "무엇", "언제", "어디서"
        ]
        
        points = []
        for indicator in discussion_indicators:
            if indicator in text:
                points.append(indicator)
        
        return points

class AudioProcessor:
    """음성 처리기"""
    
    def __init__(self):
        self.speech_patterns = self._initialize_speech_patterns()
        
    def _initialize_speech_patterns(self) -> Dict[str, List[str]]:
        """음성 패턴 초기화"""
        return {
            "rhythm_patterns": ["pause", "emphasis", "rhythm_change"],
            "tone_patterns": ["rising", "falling", "steady", "varied"],
            "pace_patterns": ["slow", "medium", "fast", "varied"],
            "emphasis_patterns": ["key_words", "concepts", "questions"]
        }
    
    async def process_audio(self, audio_data: bytes) -> Dict[str, Any]:
        """음성 처리 (시뮬레이션)"""
        # 실제로는 음성 인식 및 분석 라이브러리 사용
        await asyncio.sleep(2)
        
        analysis = {
            "duration": 120.5,  # 초
            "speech_rate": 150,  # 분당 단어 수
            "pause_frequency": 0.3,
            "emphasis_points": ["민주주의", "교육", "사회"],
            "tone_analysis": {
                "overall_tone": "conversational",
                "emotional_range": "moderate",
                "confidence_level": 0.8
            },
            "speech_patterns": {
                "rhythm": "steady",
                "pace": "medium",
                "emphasis": "key_concepts"
            },
            "transcription": "그런데 말이죠, 오늘 이 자리에서 여러분과 함께 이야기하고 싶은 주제가 있습니다.",
            "learning_indicators": ["clear_explanation", "logical_flow", "engaging_delivery"]
        }
        
        return analysis

class ImageProcessor:
    """이미지 처리기"""
    
    def __init__(self):
        self.visual_patterns = self._initialize_visual_patterns()
        
    def _initialize_visual_patterns(self) -> Dict[str, List[str]]:
        """시각적 패턴 초기화"""
        return {
            "composition_patterns": ["balanced", "asymmetric", "centered", "dynamic"],
            "color_patterns": ["warm", "cool", "neutral", "contrasting"],
            "texture_patterns": ["smooth", "rough", "mixed", "varied"],
            "content_patterns": ["text", "diagram", "photo", "illustration"]
        }
    
    async def process_image(self, image_data: bytes) -> Dict[str, Any]:
        """이미지 처리 (시뮬레이션)"""
        # 실제로는 이미지 분석 라이브러리 사용
        await asyncio.sleep(1.5)
        
        analysis = {
            "image_type": "presentation_slide",
            "content_analysis": {
                "text_elements": ["제목", "부제목", "본문"],
                "visual_elements": ["차트", "그래프", "이미지"],
                "layout": "structured"
            },
            "visual_patterns": {
                "composition": "balanced",
                "color_scheme": "professional",
                "texture": "clean"
            },
            "learning_relevance": {
                "educational_value": 0.8,
                "clarity": 0.9,
                "engagement": 0.7
            },
            "extracted_text": "민주주의의 진정한 의미는 시민 참여입니다.",
            "key_concepts": ["민주주의", "시민참여", "정치"]
        }
        
        return analysis

class MultimodalLearningEngine:
    """멀티모달 학습 엔진"""
    
    def __init__(self):
        self.text_processor = TextProcessor()
        self.audio_processor = AudioProcessor()
        self.image_processor = ImageProcessor()
        self.learning_sessions: Dict[str, LearningSession] = {}
        self.adaptation_rules = self._initialize_adaptation_rules()
        
    def _initialize_adaptation_rules(self) -> Dict[str, Dict]:
        """적응 규칙 초기화"""
        return {
            "basic": {
                "complexity_threshold": 0.3,
                "explanation_depth": "simple",
                "interaction_frequency": "high",
                "feedback_style": "encouraging"
            },
            "intermediate": {
                "complexity_threshold": 0.6,
                "explanation_depth": "moderate",
                "interaction_frequency": "medium",
                "feedback_style": "analytical"
            },
            "advanced": {
                "complexity_threshold": 0.8,
                "explanation_depth": "deep",
                "interaction_frequency": "low",
                "feedback_style": "synthetic"
            },
            "expert": {
                "complexity_threshold": 0.9,
                "explanation_depth": "expert",
                "interaction_frequency": "minimal",
                "feedback_style": "collaborative"
            }
        }
    
    async def create_learning_session(
        self, 
        user_id: str, 
        modality: ModalityType,
        initial_content: Optional[MultimodalContent] = None
    ) -> str:
        """학습 세션 생성"""
        session_id = f"session_{user_id}_{int(time.time())}"
        
        # 적응 수준 결정
        adaptation_level = self._determine_adaptation_level(user_id)
        
        # 학습 단계 결정
        stage = LearningStage.INITIALIZATION
        
        session = LearningSession(
            session_id=session_id,
            user_id=user_id,
            modality=modality,
            stage=stage,
            adaptation_level=adaptation_level
        )
        
        if initial_content:
            session.content_history.append(initial_content)
        
        self.learning_sessions[session_id] = session
        
        return session_id
    
    def _determine_adaptation_level(self, user_id: str) -> AdaptationLevel:
        """적응 수준 결정"""
        # 실제로는 사용자 히스토리 기반으로 결정
        # 여기서는 랜덤하게 결정
        levels = list(AdaptationLevel)
        return levels[hash(user_id) % len(levels)]
    
    async def process_multimodal_content(
        self, 
        content: MultimodalContent,
        session_id: str
    ) -> Dict[str, Any]:
        """멀티모달 콘텐츠 처리"""
        session = self.learning_sessions.get(session_id)
        if not session:
            raise ValueError(f"세션을 찾을 수 없습니다: {session_id}")
        
        try:
            # 모달리티별 처리
            if content.modality == ModalityType.TEXT:
                analysis = await self.text_processor.process_text(content.content_data)
            elif content.modality == ModalityType.AUDIO:
                analysis = await self.audio_processor.process_audio(content.content_data)
            elif content.modality == ModalityType.IMAGE:
                analysis = await self.image_processor.process_image(content.content_data)
            else:
                analysis = {"error": "지원하지 않는 모달리티입니다."}
            
            # 학습 점수 계산
            learning_score = self._calculate_learning_score(analysis, session)
            content.learning_score = learning_score
            
            # 유시민 관련성 계산
            yoo_relevance = self._calculate_yoo_relevance(analysis, content)
            content.yoo_relevance = yoo_relevance
            
            # 콘텐츠를 세션에 추가
            content.processing_status = "completed"
            session.content_history.append(content)
            session.last_updated = datetime.now(timezone.utc).isoformat()
            
            # 학습 진행률 업데이트
            self._update_learning_progress(session, analysis)
            
            return {
                "success": True,
                "analysis": analysis,
                "learning_score": learning_score,
                "yoo_relevance": yoo_relevance,
                "session_progress": session.learning_progress
            }
            
        except Exception as e:
            logger.error(f"멀티모달 콘텐츠 처리 오류: {e}")
            content.processing_status = "failed"
            return {
                "success": False,
                "error": str(e)
            }
    
    def _calculate_learning_score(self, analysis: Dict, session: LearningSession) -> float:
        """학습 점수 계산"""
        score = 0.0
        
        # 기본 점수
        score += 0.2
        
        # 분석 결과 기반 점수
        if "complexity_score" in analysis:
            score += analysis["complexity_score"] * 0.3
        
        if "learning_potential" in analysis:
            score += analysis["learning_potential"] * 0.3
        
        # 세션 적응 수준 기반 조정
        adaptation_rules = self.adaptation_rules[session.adaptation_level.value]
        complexity_threshold = adaptation_rules["complexity_threshold"]
        
        if score >= complexity_threshold:
            score += 0.2
        
        return min(score, 1.0)
    
    def _calculate_yoo_relevance(self, analysis: Dict, content: MultimodalContent) -> float:
        """유시민 관련성 계산"""
        relevance = 0.0
        
        # 텍스트 분석 결과 기반
        if "yoo_patterns_detected" in analysis:
            patterns = analysis["yoo_patterns_detected"]
            total_patterns = sum(patterns.values())
            relevance += min(total_patterns / 10, 0.5)
        
        # 키워드 기반
        if "key_concepts" in analysis:
            yoo_keywords = ["민주주의", "교육", "사회", "역사", "정치", "시민"]
            concept_matches = sum(1 for concept in analysis["key_concepts"] if concept in yoo_keywords)
            relevance += min(concept_matches / len(yoo_keywords), 0.3)
        
        # 감정 분석 기반
        if "sentiment" in analysis:
            if analysis["sentiment"] in ["analytical", "curious"]:
                relevance += 0.2
        
        return min(relevance, 1.0)
    
    def _update_learning_progress(self, session: LearningSession, analysis: Dict):
        """학습 진행률 업데이트"""
        # 각 모달리티별 진행률 업데이트
        modality = session.modality.value
        current_progress = session.learning_progress.get(modality, 0.0)
        
        # 분석 결과 기반 진행률 증가
        if "learning_potential" in analysis:
            progress_increase = analysis["learning_potential"] * 0.1
            session.learning_progress[modality] = min(current_progress + progress_increase, 1.0)
        
        # 전체 진행률 계산
        total_progress = sum(session.learning_progress.values()) / len(session.learning_progress)
        session.learning_progress["overall"] = total_progress
    
    def get_learning_session(self, session_id: str) -> Optional[LearningSession]:
        """학습 세션 조회"""
        return self.learning_sessions.get(session_id)
    
    def get_user_sessions(self, user_id: str) -> List[LearningSession]:
        """사용자 세션 조회"""
        return [session for session in self.learning_sessions.values() if session.user_id == user_id]
    
    def get_learning_analytics(self) -> Dict:
        """학습 분석 데이터 조회"""
        total_sessions = len(self.learning_sessions)
        active_sessions = sum(1 for session in self.learning_sessions.values() if session.last_updated > (datetime.now(timezone.utc).timestamp() - 3600).isoformat())
        
        modality_distribution = {}
        adaptation_distribution = {}
        
        for session in self.learning_sessions.values():
            modality = session.modality.value
            adaptation = session.adaptation_level.value
            
            modality_distribution[modality] = modality_distribution.get(modality, 0) + 1
            adaptation_distribution[adaptation] = adaptation_distribution.get(adaptation, 0) + 1
        
        return {
            "total_sessions": total_sessions,
            "active_sessions": active_sessions,
            "modality_distribution": modality_distribution,
            "adaptation_distribution": adaptation_distribution,
            "average_progress": sum(session.learning_progress.get("overall", 0) for session in self.learning_sessions.values()) / total_sessions if total_sessions > 0 else 0
        }

# FastAPI 앱 생성
app = FastAPI(
    title="멀티모달 학습 통합 시스템",
    description="텍스트, 음성, 이미지 통합 학습 시스템",
    version="3.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 시스템 인스턴스
multimodal_engine = MultimodalLearningEngine()

class MultimodalContentRequest(BaseModel):
    modality: str
    content_data: str
    metadata: Optional[Dict[str, Any]] = None

class LearningSessionRequest(BaseModel):
    user_id: str
    modality: str
    initial_content: Optional[Dict] = None

@app.post("/api/multimodal/create-session")
async def create_learning_session(request: LearningSessionRequest):
    """학습 세션 생성"""
    try:
        modality = ModalityType(request.modality)
        
        initial_content = None
        if request.initial_content:
            initial_content = MultimodalContent(
                content_id=f"content_{int(time.time())}",
                modality=modality,
                content_data=request.initial_content.get("content_data", ""),
                metadata=request.initial_content.get("metadata", {})
            )
        
        session_id = await multimodal_engine.create_learning_session(
            request.user_id,
            modality,
            initial_content
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "message": "학습 세션이 생성되었습니다."
        }
        
    except Exception as e:
        logger.error(f"학습 세션 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/multimodal/process-content/{session_id}")
async def process_multimodal_content(session_id: str, request: MultimodalContentRequest):
    """멀티모달 콘텐츠 처리"""
    try:
        content = MultimodalContent(
            content_id=f"content_{int(time.time())}",
            modality=ModalityType(request.modality),
            content_data=request.content_data,
            metadata=request.metadata or {}
        )
        
        result = await multimodal_engine.process_multimodal_content(content, session_id)
        
        return {
            "success": True,
            "result": result
        }
        
    except Exception as e:
        logger.error(f"멀티모달 콘텐츠 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/multimodal/session/{session_id}")
async def get_learning_session(session_id: str):
    """학습 세션 조회"""
    try:
        session = multimodal_engine.get_learning_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
        
        return {
            "success": True,
            "session": {
                "session_id": session.session_id,
                "user_id": session.user_id,
                "modality": session.modality.value,
                "stage": session.stage.value,
                "adaptation_level": session.adaptation_level.value,
                "learning_progress": session.learning_progress,
                "content_count": len(session.content_history),
                "created_at": session.created_at,
                "last_updated": session.last_updated
            }
        }
    except Exception as e:
        logger.error(f"학습 세션 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/multimodal/user-sessions/{user_id}")
async def get_user_sessions(user_id: str):
    """사용자 세션 조회"""
    try:
        sessions = multimodal_engine.get_user_sessions(user_id)
        
        return {
            "success": True,
            "sessions": [
                {
                    "session_id": session.session_id,
                    "modality": session.modality.value,
                    "stage": session.stage.value,
                    "adaptation_level": session.adaptation_level.value,
                    "learning_progress": session.learning_progress,
                    "content_count": len(session.content_history),
                    "created_at": session.created_at,
                    "last_updated": session.last_updated
                }
                for session in sessions
            ],
            "total_count": len(sessions)
        }
    except Exception as e:
        logger.error(f"사용자 세션 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/multimodal/analytics")
async def get_multimodal_analytics():
    """멀티모달 학습 분석 데이터 조회"""
    try:
        analytics = multimodal_engine.get_learning_analytics()
        
        return {
            "success": True,
            "analytics": analytics
        }
    except Exception as e:
        logger.error(f"멀티모달 학습 분석 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "멀티모달 학습 통합 시스템",
        "version": "3.0.0",
        "status": "running",
        "features": [
            "텍스트, 음성, 이미지 통합 학습",
            "실시간 적응 및 개인화",
            "고급 AI 모델 통합",
            "지능형 대화 관리",
            "성능 최적화 및 확장성",
            "학습 세션 관리",
            "멀티모달 콘텐츠 처리",
            "적응형 학습 진행률 추적"
        ],
        "system_info": {
            "active_sessions": len(multimodal_engine.learning_sessions),
            "supported_modalities": [modality.value for modality in ModalityType],
            "adaptation_levels": [level.value for level in AdaptationLevel],
            "learning_stages": [stage.value for stage in LearningStage]
        },
        "endpoints": {
            "create_session": "/api/multimodal/create-session",
            "process_content": "/api/multimodal/process-content/{session_id}",
            "get_session": "/api/multimodal/session/{session_id}",
            "user_sessions": "/api/multimodal/user-sessions/{user_id}",
            "analytics": "/api/multimodal/analytics",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    logger.info("🚀 멀티모달 학습 통합 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8005")
    logger.info("📚 API 문서: http://localhost:8005/docs")
    logger.info("📝 텍스트 처리: 활성화")
    logger.info("🎵 음성 처리: 활성화")
    logger.info("🖼️ 이미지 처리: 활성화")
    logger.info("🧠 멀티모달 학습: 활성화")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8005,
        reload=False,
        log_level="info"
    )
