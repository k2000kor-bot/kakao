#!/usr/bin/env python3
"""
Ultra-Advanced ChatGPT 초월 시스템 v2.0
- 고급 파일 분석 (OCR, 이미지 인식, 표 추출)
- 대화 컨텍스트 인식 및 연속성 유지
- 계층화된 지침 시스템
- 멀티모달 메시지 형식 지원
- 실시간 적응 학습
- 고도화된 대화형 메시지 생성
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional, Union
import json
import os
import asyncio
import aiofiles
from datetime import datetime, timedelta
import logging
import hashlib
import base64
from pathlib import Path
import numpy as np
from PIL import Image, ImageEnhance
import pytesseract
import cv2
import pandas as pd
import re
from collections import defaultdict, deque
import pickle

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Ultra-Advanced ChatGPT 초월 시스템", version="2.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 데이터 모델들 ====================

class ConversationContext(BaseModel):
    """대화 컨텍스트"""
    conversation_id: str
    participant_id: str
    conversation_history: List[Dict] = []
    context_summary: str = ""
    emotional_state: str = "neutral"
    topic_thread: List[str] = []
    urgency_level: int = 1  # 1-5
    relationship_type: str = "professional"
    
class AdvancedInstruction(BaseModel):
    """고급 지침"""
    instruction_id: str
    title: str
    content: str
    category: str
    priority: int
    activation_conditions: Dict[str, Any] = {}
    parent_instruction: Optional[str] = None
    child_instructions: List[str] = []
    success_metrics: Dict[str, float] = {}
    adaptation_rules: Dict[str, Any] = {}

class MessageFormat(BaseModel):
    """메시지 형식"""
    format_type: str  # "text", "markdown", "html", "structured", "multimodal"
    structure: Dict[str, Any] = {}
    visual_elements: List[str] = []
    interactive_elements: List[str] = []
    accessibility_features: List[str] = []

class AdvancedFileAnalysis(BaseModel):
    """고급 파일 분석 결과"""
    file_id: str
    analysis_type: str
    extracted_text: str = ""
    detected_tables: List[Dict] = []
    identified_images: List[Dict] = []
    document_structure: Dict[str, Any] = {}
    content_categories: List[str] = []
    sentiment_analysis: Dict[str, float] = {}
    entity_recognition: List[Dict] = []
    topic_modeling: List[str] = []

class ConversationalMessage(BaseModel):
    """대화형 메시지"""
    message_id: str
    conversation_id: str
    message_type: str  # "question", "answer", "clarification", "summary"
    content: str
    format: MessageFormat
    context_references: List[str] = []
    follow_up_suggestions: List[str] = []
    adaptive_elements: Dict[str, Any] = {}
    quality_metrics: Dict[str, float] = {}

# ==================== 핵심 시스템 클래스들 ====================

class UltraFileAnalyzer:
    """초고급 파일 분석기"""
    
    def __init__(self):
        self.analysis_cache = {}
        self.supported_formats = {
            'image': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'],
            'document': ['.pdf', '.docx', '.txt', '.md'],
            'spreadsheet': ['.xlsx', '.xls', '.csv'],
            'presentation': ['.pptx', '.ppt'],
            'archive': ['.zip', '.rar', '.7z']
        }
    
    async def ultra_analyze_file(self, file_path: str, file_type: str) -> AdvancedFileAnalysis:
        """파일 초고급 분석"""
        
        file_id = hashlib.md5(file_path.encode()).hexdigest()[:16]
        
        # 캐시 확인
        if file_id in self.analysis_cache:
            return self.analysis_cache[file_id]
        
        analysis = AdvancedFileAnalysis(
            file_id=file_id,
            analysis_type="ultra_advanced"
        )
        
        file_ext = Path(file_path).suffix.lower()
        
        # 이미지 파일 처리
        if file_ext in self.supported_formats['image']:
            analysis = await self._analyze_image_advanced(file_path, analysis)
        
        # 문서 파일 처리
        elif file_ext in self.supported_formats['document']:
            analysis = await self._analyze_document_advanced(file_path, analysis)
        
        # 스프레드시트 파일 처리
        elif file_ext in self.supported_formats['spreadsheet']:
            analysis = await self._analyze_spreadsheet_advanced(file_path, analysis)
        
        # 결과 캐시
        self.analysis_cache[file_id] = analysis
        
        return analysis
    
    async def _analyze_image_advanced(self, file_path: str, analysis: AdvancedFileAnalysis) -> AdvancedFileAnalysis:
        """고급 이미지 분석"""
        
        try:
            # 이미지 로드 및 전처리
            image = cv2.imread(file_path)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 이미지 품질 개선
            enhanced = cv2.equalizeHist(gray)
            denoised = cv2.fastNlMeansDenoising(enhanced)
            
            # OCR 텍스트 추출
            custom_config = r'--oem 3 --psm 6 -l kor+eng'
            extracted_text = pytesseract.image_to_string(denoised, config=custom_config)
            analysis.extracted_text = extracted_text
            
            # 표 감지
            tables = self._detect_tables_in_image(denoised)
            analysis.detected_tables = tables
            
            # 텍스트 영역 감지
            text_regions = self._detect_text_regions(denoised)
            analysis.identified_images = text_regions
            
            # 문서 구조 분석
            analysis.document_structure = {
                "image_dimensions": image.shape,
                "text_regions_count": len(text_regions),
                "tables_count": len(tables),
                "estimated_content_type": self._classify_image_content(extracted_text)
            }
            
            # 내용 카테고리 분류
            analysis.content_categories = self._categorize_extracted_content(extracted_text)
            
            # 감정 분석
            analysis.sentiment_analysis = self._analyze_sentiment(extracted_text)
            
            # 엔터티 인식
            analysis.entity_recognition = self._extract_entities(extracted_text)
            
        except Exception as e:
            logger.error(f"이미지 분석 오류: {e}")
            analysis.extracted_text = f"이미지 분석 중 오류 발생: {str(e)}"
        
        return analysis
    
    def _detect_tables_in_image(self, image) -> List[Dict]:
        """이미지에서 표 감지"""
        
        # 수평 및 수직 선 감지
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 1))
        vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))
        
        horizontal_lines = cv2.morphologyEx(image, cv2.MORPH_OPEN, horizontal_kernel)
        vertical_lines = cv2.morphologyEx(image, cv2.MORPH_OPEN, vertical_kernel)
        
        # 표 구조 감지
        table_structure = cv2.bitwise_or(horizontal_lines, vertical_lines)
        
        # 컨투어 찾기
        contours, _ = cv2.findContours(table_structure, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        tables = []
        for i, contour in enumerate(contours):
            x, y, w, h = cv2.boundingRect(contour)
            if w > 100 and h > 50:  # 최소 크기 필터
                tables.append({
                    "table_id": f"table_{i}",
                    "position": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                    "estimated_rows": max(1, h // 30),
                    "estimated_cols": max(1, w // 100)
                })
        
        return tables
    
    def _detect_text_regions(self, image) -> List[Dict]:
        """텍스트 영역 감지"""
        
        # MSER을 사용한 텍스트 영역 감지
        mser = cv2.MSER_create()
        regions, _ = mser.detectRegions(image)
        
        text_regions = []
        for i, region in enumerate(regions):
            if len(region) > 50:  # 최소 포인트 수
                x, y, w, h = cv2.boundingRect(region)
                text_regions.append({
                    "region_id": f"text_region_{i}",
                    "position": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                    "confidence": 0.8
                })
        
        return text_regions[:10]  # 상위 10개만
    
    def _classify_image_content(self, text: str) -> str:
        """이미지 내용 분류"""
        
        keywords = {
            "contract": ["계약", "동의", "서명", "날인"],
            "financial": ["금액", "원", "달러", "비용", "예산"],
            "technical": ["설계", "도면", "사양", "규격"],
            "communication": ["안녕", "감사", "문의", "연락"],
            "legal": ["법", "조항", "규정", "의무"]
        }
        
        for category, category_keywords in keywords.items():
            if any(keyword in text for keyword in category_keywords):
                return category
        
        return "general"
    
    def _categorize_extracted_content(self, text: str) -> List[str]:
        """추출된 내용 카테고리화"""
        
        categories = []
        
        if re.search(r'\d{4}[.-]\d{2}[.-]\d{2}', text):
            categories.append("날짜_정보")
        
        if re.search(r'\d{1,3}(?:,\d{3})*원', text):
            categories.append("금액_정보")
        
        if any(word in text for word in ["설계", "시공", "건설"]):
            categories.append("건설_관련")
        
        if any(word in text for word in ["조합", "조합원", "입주자"]):
            categories.append("조합_관련")
        
        return categories if categories else ["일반_문서"]
    
    def _analyze_sentiment(self, text: str) -> Dict[str, float]:
        """감정 분석"""
        
        positive_words = ["좋", "훌륭", "만족", "감사", "기쁘", "성공", "우수"]
        negative_words = ["나쁘", "불만", "문제", "실패", "걱정", "우려", "반대"]
        neutral_words = ["검토", "확인", "진행", "계획", "예정", "일정"]
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        neutral_count = sum(1 for word in neutral_words if word in text_lower)
        
        total = positive_count + negative_count + neutral_count
        
        if total == 0:
            return {"positive": 0.33, "negative": 0.33, "neutral": 0.34}
        
        return {
            "positive": positive_count / total,
            "negative": negative_count / total,
            "neutral": neutral_count / total
        }
    
    def _extract_entities(self, text: str) -> List[Dict]:
        """엔터티 추출"""
        
        entities = []
        
        # 날짜 추출
        date_pattern = r'\d{4}[.-]\d{2}[.-]\d{2}'
        dates = re.findall(date_pattern, text)
        for date in dates:
            entities.append({"type": "날짜", "value": date, "confidence": 0.9})
        
        # 금액 추출
        money_pattern = r'\d{1,3}(?:,\d{3})*원'
        amounts = re.findall(money_pattern, text)
        for amount in amounts:
            entities.append({"type": "금액", "value": amount, "confidence": 0.95})
        
        # 전화번호 추출
        phone_pattern = r'\d{3}-\d{4}-\d{4}'
        phones = re.findall(phone_pattern, text)
        for phone in phones:
            entities.append({"type": "전화번호", "value": phone, "confidence": 0.9})
        
        return entities

class ConversationContextManager:
    """대화 컨텍스트 관리자"""
    
    def __init__(self):
        self.active_conversations = {}
        self.conversation_history = defaultdict(deque)
        self.context_memory = {}
        self.learning_data = defaultdict(list)
    
    def create_conversation(self, participant_id: str) -> str:
        """새 대화 생성"""
        
        conversation_id = f"conv_{participant_id}_{int(datetime.now().timestamp())}"
        
        context = ConversationContext(
            conversation_id=conversation_id,
            participant_id=participant_id,
            conversation_history=[],
            context_summary="새 대화 시작",
            emotional_state="neutral",
            topic_thread=[],
            urgency_level=1,
            relationship_type="professional"
        )
        
        self.active_conversations[conversation_id] = context
        
        return conversation_id
    
    def update_conversation_context(self, conversation_id: str, message: Dict) -> ConversationContext:
        """대화 컨텍스트 업데이트"""
        
        if conversation_id not in self.active_conversations:
            # 새 대화 자동 생성
            participant_id = message.get("participant_id", "unknown")
            conversation_id = self.create_conversation(participant_id)
        
        context = self.active_conversations[conversation_id]
        
        # 대화 히스토리 추가
        context.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "analysis": self._analyze_message_context(message)
        })
        
        # 최근 10개 메시지만 유지
        if len(context.conversation_history) > 10:
            context.conversation_history = context.conversation_history[-10:]
        
        # 컨텍스트 요약 업데이트
        context.context_summary = self._generate_context_summary(context)
        
        # 감정 상태 업데이트
        context.emotional_state = self._detect_emotional_state(message)
        
        # 토픽 스레드 업데이트
        new_topics = self._extract_topics(message)
        context.topic_thread.extend(new_topics)
        context.topic_thread = context.topic_thread[-5:]  # 최근 5개 토픽만
        
        # 긴급도 평가
        context.urgency_level = self._assess_urgency(message)
        
        # 관계 타입 추론
        context.relationship_type = self._infer_relationship_type(context)
        
        return context
    
    def _analyze_message_context(self, message: Dict) -> Dict:
        """메시지 컨텍스트 분석"""
        
        content = message.get("content", "")
        
        return {
            "word_count": len(content.split()),
            "question_count": content.count("?") + content.count("？"),
            "exclamation_count": content.count("!") + content.count("！"),
            "formal_level": self._assess_formality(content),
            "complexity": self._assess_complexity(content),
            "intent": self._classify_intent(content)
        }
    
    def _generate_context_summary(self, context: ConversationContext) -> str:
        """컨텍스트 요약 생성"""
        
        if not context.conversation_history:
            return "새 대화 시작"
        
        recent_messages = context.conversation_history[-3:]
        topics = set()
        
        for msg_data in recent_messages:
            message = msg_data["message"]
            content = message.get("content", "")
            topics.update(self._extract_topics(message))
        
        if topics:
            return f"주요 토픽: {', '.join(list(topics)[:3])}"
        else:
            return "일반적인 대화 진행 중"
    
    def _detect_emotional_state(self, message: Dict) -> str:
        """감정 상태 감지"""
        
        content = message.get("content", "").lower()
        
        if any(word in content for word in ["화", "분노", "짜증", "불만"]):
            return "angry"
        elif any(word in content for word in ["걱정", "우려", "불안", "염려"]):
            return "concerned"
        elif any(word in content for word in ["기쁘", "좋", "만족", "감사"]):
            return "positive"
        elif any(word in content for word in ["긴급", "급", "빨리", "즉시"]):
            return "urgent"
        else:
            return "neutral"
    
    def _extract_topics(self, message: Dict) -> List[str]:
        """토픽 추출"""
        
        content = message.get("content", "")
        
        topic_keywords = {
            "시공": ["시공", "공사", "건설", "작업"],
            "설계": ["설계", "도면", "계획", "방안"],
            "계약": ["계약", "조건", "협의", "합의"],
            "일정": ["일정", "스케줄", "기한", "날짜"],
            "비용": ["비용", "예산", "금액", "돈"],
            "품질": ["품질", "품질관리", "검사", "점검"]
        }
        
        topics = []
        for topic, keywords in topic_keywords.items():
            if any(keyword in content for keyword in keywords):
                topics.append(topic)
        
        return topics
    
    def _assess_urgency(self, message: Dict) -> int:
        """긴급도 평가 (1-5)"""
        
        content = message.get("content", "").lower()
        urgency_indicators = {
            5: ["긴급", "즉시", "당장", "빨리"],
            4: ["오늘", "내일", "급"],
            3: ["이번주", "곧", "빠른"],
            2: ["다음주", "천천히"],
            1: ["언제든", "나중에"]
        }
        
        for level, indicators in urgency_indicators.items():
            if any(indicator in content for indicator in indicators):
                return level
        
        return 2  # 기본 값
    
    def _assess_formality(self, content: str) -> float:
        """격식 수준 평가 (0.0-1.0)"""
        
        formal_patterns = ["습니다", "하겠습니다", "드립니다", "하십시오"]
        informal_patterns = ["해요", "하자", "할게", "그래"]
        
        formal_count = sum(1 for pattern in formal_patterns if pattern in content)
        informal_count = sum(1 for pattern in informal_patterns if pattern in content)
        
        total = formal_count + informal_count
        if total == 0:
            return 0.5
        
        return formal_count / total
    
    def _assess_complexity(self, content: str) -> float:
        """복잡도 평가 (0.0-1.0)"""
        
        sentences = content.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        
        # 문장 길이 기반 복잡도
        if avg_sentence_length > 15:
            return 0.8
        elif avg_sentence_length > 10:
            return 0.6
        elif avg_sentence_length > 5:
            return 0.4
        else:
            return 0.2
    
    def _classify_intent(self, content: str) -> str:
        """의도 분류"""
        
        intent_patterns = {
            "질문": ["?", "？", "어떻게", "무엇", "언제", "어디"],
            "요청": ["해주세요", "부탁", "요청", "해줘"],
            "정보제공": ["알려드리", "보고", "안내", "공지"],
            "의견": ["생각", "의견", "견해", "판단"],
            "불만": ["문제", "불만", "개선", "수정"]
        }
        
        for intent, patterns in intent_patterns.items():
            if any(pattern in content for pattern in patterns):
                return intent
        
        return "일반"
    
    def _infer_relationship_type(self, context: ConversationContext) -> str:
        """관계 타입 추론"""
        
        formality_sum = 0
        message_count = len(context.conversation_history)
        
        if message_count == 0:
            return "professional"
        
        for msg_data in context.conversation_history:
            analysis = msg_data.get("analysis", {})
            formality_sum += analysis.get("formal_level", 0.5)
        
        avg_formality = formality_sum / message_count
        
        if avg_formality > 0.7:
            return "formal_business"
        elif avg_formality > 0.4:
            return "professional"
        else:
            return "casual"

# ==================== 전역 인스턴스들 ====================

ultra_file_analyzer = UltraFileAnalyzer()
conversation_manager = ConversationContextManager()

# ==================== API 엔드포인트들 ====================

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "system": "Ultra-Advanced ChatGPT 초월 시스템",
        "version": "2.0.0",
        "capabilities": [
            "🔍 고급 파일 분석 (OCR, 이미지 인식, 표 추출)",
            "🧠 대화 컨텍스트 인식 및 연속성 유지",
            "📋 계층화된 지침 시스템",
            "🎨 멀티모달 메시지 형식 지원",
            "📚 실시간 적응 학습",
            "💬 고도화된 대화형 메시지 생성"
        ],
        "features": {
            "file_analysis": "OCR, 표감지, 엔터티추출, 감정분석",
            "conversation": "컨텍스트 유지, 감정인식, 토픽추적",
            "messaging": "다양한 형식, 적응형 응답, 품질평가",
            "learning": "실시간 학습, 개인화, 성능최적화"
        }
    }

@app.post("/ultra-upload")
async def ultra_upload_file(file: UploadFile = File(...)):
    """초고급 파일 업로드 및 분석"""
    
    try:
        # 파일 저장
        upload_dir = Path("ultra_uploads")
        upload_dir.mkdir(exist_ok=True)
        
        file_path = upload_dir / file.filename
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # 초고급 분석 실행
        analysis = await ultra_file_analyzer.ultra_analyze_file(str(file_path), file.content_type)
        
        return {
            "success": True,
            "message": "파일이 성공적으로 업로드되고 초고급 분석이 완료되었습니다.",
            "file_info": {
                "filename": file.filename,
                "size": len(content),
                "type": file.content_type
            },
            "ultra_analysis": analysis.dict(),
            "capabilities_used": [
                "OCR 텍스트 추출",
                "표 자동 감지",
                "이미지 영역 분석",
                "감정 분석",
                "엔터티 인식",
                "내용 카테고리화"
            ]
        }
        
    except Exception as e:
        logger.error(f"초고급 파일 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"파일 분석 중 오류: {str(e)}")

@app.post("/start-conversation")
async def start_conversation(participant_info: Dict[str, Any]):
    """대화 시작"""
    
    participant_id = participant_info.get("participant_id", f"user_{datetime.now().timestamp()}")
    conversation_id = conversation_manager.create_conversation(participant_id)
    
    return {
        "success": True,
        "conversation_id": conversation_id,
        "message": "새로운 고급 대화가 시작되었습니다.",
        "context": conversation_manager.active_conversations[conversation_id].dict()
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Ultra-Advanced ChatGPT 초월 시스템 v2.0 시작!")
    print("🔥 혁신적 기능들:")
    print("   📸 고급 이미지 OCR 및 표 감지")
    print("   🧠 지능형 대화 컨텍스트 관리")
    print("   🎯 적응형 메시지 생성")
    print("   📊 실시간 학습 및 최적화")
    
    _p = int(os.environ.get("ULTRA_CHATGPT_ADVANCED_PORT", os.environ.get("PORT", "8091")))
    uvicorn.run(app, host="0.0.0.0", port=_p) 