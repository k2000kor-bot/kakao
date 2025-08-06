import os
import json
import uuid
import sqlite3
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import shutil
import mimetypes
import hashlib

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# OCR 및 이미지 분석을 위한 라이브러리 (실제 구현 시 필요)
# import pytesseract
# from PIL import Image
# import cv2
# import numpy as np

# 음성 인식을 위한 라이브러리 (실제 구현 시 필요)
# import speech_recognition as sr
# from pydub import AudioSegment

# 문서 분석을 위한 라이브러리 (실제 구현 시 필요)
# import PyPDF2
# import docx

app = FastAPI(title="Advanced Media Analysis API", version="1.0.0")

# 데이터베이스 초기화
def init_database():
    conn = sqlite3.connect('media_analysis.db')
    cursor = conn.cursor()
    
    # 미디어 파일 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS media_files (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            file_hash TEXT NOT NULL,
            upload_date TEXT NOT NULL,
            analysis_status TEXT DEFAULT 'pending',
            project_id TEXT,
            user_id TEXT
        )
    ''')
    
    # 분석 결과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analysis_results (
            id TEXT PRIMARY KEY,
            file_id TEXT NOT NULL,
            extracted_text TEXT,
            summary TEXT,
            keywords TEXT,
            sentiment TEXT,
            confidence_score REAL,
            analysis_date TEXT NOT NULL,
            writing_insights TEXT,
            FOREIGN KEY (file_id) REFERENCES media_files (id)
        )
    ''')
    
    # 글쓰기 인사이트 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS writing_insights (
            id TEXT PRIMARY KEY,
            analysis_id TEXT NOT NULL,
            insight_type TEXT NOT NULL,
            content TEXT NOT NULL,
            source TEXT,
            confidence REAL,
            context TEXT,
            writing_style TEXT,
            citation_format TEXT,
            FOREIGN KEY (analysis_id) REFERENCES analysis_results (id)
        )
    ''')
    
    # 대화 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversation_messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            media_files TEXT,
            writing_context TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# Pydantic 모델들
class MediaUploadResponse(BaseModel):
    file_id: str
    filename: str
    file_size: int
    mime_type: str
    upload_date: str
    analysis_status: str

class AnalysisResult(BaseModel):
    file_id: str
    extracted_text: str
    summary: str
    keywords: List[str]
    sentiment: str
    confidence_score: float
    writing_insights: List[Dict[str, Any]]

class WritingInsight(BaseModel):
    id: str
    type: str
    content: str
    source: Optional[str]
    confidence: float
    context: str
    writing_style: str
    citation_format: str

class ConversationMessage(BaseModel):
    session_id: str
    sender: str
    content: str
    media_files: Optional[List[str]] = None
    writing_context: Optional[Dict[str, str]] = None

class WritingTheory(BaseModel):
    id: str
    name: str
    description: str
    principles: List[str]
    examples: List[str]
    application: str

# 글쓰기 이론 데이터
WRITING_THEORIES = [
    {
        "id": "1",
        "name": "인용 이론 (Citation Theory)",
        "description": "다른 사람의 말이나 글을 적절히 인용하여 자신의 주장을 뒷받침하는 방법",
        "principles": [
            "정확한 출처 표시",
            "적절한 인용 형식 사용",
            "인용과 자신의 의견 구분",
            "맥락에 맞는 인용 선택"
        ],
        "examples": [
            '"인용은 자신의 주장을 강화하는 강력한 도구입니다." (김철수, 2023)',
            '연구 결과에 따르면 "적절한 인용은 글의 신뢰성을 높인다."',
            '전문가들은 "인용은 학술적 글쓰기의 기본"이라고 강조한다.'
        ],
        "application": "분석된 미디어 내용에서 핵심 문구를 인용하여 대화체로 표현"
    },
    {
        "id": "2",
        "name": "대화체 글쓰기 (Conversational Writing)",
        "description": "자연스러운 대화처럼 읽기 쉽고 이해하기 쉬운 글쓰기 스타일",
        "principles": [
            "간결하고 명확한 문장",
            "일상적인 표현 사용",
            "독자와의 연결감 형성",
            "자연스러운 흐름 유지"
        ],
        "examples": [
            "이런 식으로 보시면 됩니다.",
            "말씀하신 대로 정말 중요한 부분이에요.",
            "한번 같이 살펴볼까요?"
        ],
        "application": "분석 결과를 친근하고 이해하기 쉬운 대화체로 전달"
    },
    {
        "id": "3",
        "name": "맥락 기반 글쓰기 (Context-Based Writing)",
        "description": "주어진 상황과 배경을 고려하여 적절한 내용과 톤을 선택하는 글쓰기",
        "principles": [
            "상황에 맞는 어조 선택",
            "대상 독자 고려",
            "목적에 맞는 내용 구성",
            "적절한 예시와 설명"
        ],
        "examples": [
            "이 상황에서는 이런 접근이 효과적일 것 같아요.",
            "고려해야 할 중요한 포인트들이 있어요.",
            "실제 사례를 통해 설명드리면..."
        ],
        "application": "미디어 분석 결과를 상황에 맞게 재구성하여 전달"
    }
]

class MediaAnalysisService:
    def __init__(self):
        self.upload_dir = Path("uploads/media")
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def save_file(self, file: UploadFile, project_id: str = None) -> Dict[str, Any]:
        """파일 저장 및 메타데이터 생성"""
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        new_filename = f"{file_id}{file_extension}"
        file_path = self.upload_dir / new_filename
        
        # 파일 저장
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 파일 해시 생성
        file_hash = self.calculate_file_hash(file_path)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('media_analysis.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO media_files (id, filename, original_filename, file_path, file_size, mime_type, file_hash, upload_date, project_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            file_id, new_filename, file.filename, str(file_path), 
            file.size, file.content_type, file_hash, 
            datetime.now().isoformat(), project_id
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "file_id": file_id,
            "filename": new_filename,
            "original_filename": file.filename,
            "file_size": file.size,
            "mime_type": file.content_type,
            "upload_date": datetime.now().isoformat(),
            "analysis_status": "pending"
        }
    
    def calculate_file_hash(self, file_path: Path) -> str:
        """파일 해시 계산"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    async def analyze_media_file(self, file_id: str) -> AnalysisResult:
        """미디어 파일 분석"""
        conn = sqlite3.connect('media_analysis.db')
        cursor = conn.cursor()
        
        # 파일 정보 조회
        cursor.execute('SELECT * FROM media_files WHERE id = ?', (file_id,))
        file_data = cursor.fetchone()
        
        if not file_data:
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
        
        file_path = Path(file_data[4])  # file_path
        mime_type = file_data[6]  # mime_type
        
        # 파일 타입별 분석
        analysis_result = await self.perform_analysis(file_path, mime_type, file_data[2])  # original_filename
        
        # 분석 결과 저장
        analysis_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO analysis_results (id, file_id, extracted_text, summary, keywords, sentiment, confidence_score, analysis_date, writing_insights)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            analysis_id, file_id, analysis_result.extracted_text,
            analysis_result.summary, json.dumps(analysis_result.keywords),
            analysis_result.sentiment, analysis_result.confidence_score,
            datetime.now().isoformat(), json.dumps(analysis_result.writing_insights)
        ))
        
        # 글쓰기 인사이트 저장
        for insight in analysis_result.writing_insights:
            insight_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO writing_insights (id, analysis_id, insight_type, content, source, confidence, context, writing_style, citation_format)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                insight_id, analysis_id, insight['type'], insight['content'],
                insight.get('source'), insight['confidence'], insight['context'],
                insight['writing_style'], insight['citation_format']
            ))
        
        # 파일 상태 업데이트
        cursor.execute('''
            UPDATE media_files SET analysis_status = 'completed' WHERE id = ?
        ''', (file_id,))
        
        conn.commit()
        conn.close()
        
        return analysis_result
    
    async def perform_analysis(self, file_path: Path, mime_type: str, original_filename: str) -> AnalysisResult:
        """실제 파일 분석 수행"""
        file_type = mime_type.split('/')[0]
        
        # 실제 구현에서는 OCR, 음성인식, 문서 파싱 등을 수행
        # 여기서는 시뮬레이션된 분석 결과를 반환
        
        if file_type == 'image':
            return await self.analyze_image(file_path, original_filename)
        elif file_type == 'video':
            return await self.analyze_video(file_path, original_filename)
        elif file_type == 'audio':
            return await self.analyze_audio(file_path, original_filename)
        else:
            return await self.analyze_document(file_path, original_filename)
    
    async def analyze_image(self, file_path: Path, filename: str) -> AnalysisResult:
        """이미지 분석 (OCR 포함)"""
        # 실제 구현에서는 OCR 라이브러리 사용
        # text = pytesseract.image_to_string(Image.open(file_path), lang='kor+eng')
        
        mock_text = f"""이미지 파일에서 추출된 텍스트 내용입니다.
        
파일명: {filename}
분석 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

주요 내용:
- 이미지 내 텍스트 정보
- 시각적 요소 분석
- 컨텍스트 파악

이미지 분석을 통해 다양한 정보를 추출할 수 있습니다."""

        return AnalysisResult(
            file_id=str(uuid.uuid4()),
            extracted_text=mock_text,
            summary="이미지 파일 분석 완료 - 텍스트 추출 및 시각적 요소 분석",
            keywords=["이미지", "텍스트", "분석", "OCR", "시각적"],
            sentiment="neutral",
            confidence_score=0.85,
            writing_insights=self.generate_writing_insights("image", filename)
        )
    
    async def analyze_video(self, file_path: Path, filename: str) -> AnalysisResult:
        """비디오 분석"""
        mock_text = f"""비디오 파일에서 추출된 내용입니다.
        
파일명: {filename}
분석 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

주요 내용:
- 비디오 내 오디오 텍스트
- 시각적 정보 분석
- 시간 기반 정보 추출

비디오 분석을 통해 다양한 미디어 정보를 종합적으로 파악할 수 있습니다."""

        return AnalysisResult(
            file_id=str(uuid.uuid4()),
            extracted_text=mock_text,
            summary="비디오 파일 분석 완료 - 오디오 및 시각적 정보 종합 분석",
            keywords=["비디오", "오디오", "시각적", "시간", "미디어"],
            sentiment="neutral",
            confidence_score=0.80,
            writing_insights=self.generate_writing_insights("video", filename)
        )
    
    async def analyze_audio(self, file_path: Path, filename: str) -> AnalysisResult:
        """오디오 분석 (음성인식)"""
        # 실제 구현에서는 음성인식 라이브러리 사용
        # recognizer = sr.Recognizer()
        # with sr.AudioFile(str(file_path)) as source:
        #     audio = recognizer.record(source)
        #     text = recognizer.recognize_google(audio, language='ko-KR')
        
        mock_text = f"""오디오 파일에서 추출된 음성 내용입니다.
        
파일명: {filename}
분석 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

주요 내용:
- 음성 인식 결과
- 발화자 정보
- 음성 품질 분석

음성 분석을 통해 대화 내용을 텍스트로 변환할 수 있습니다."""

        return AnalysisResult(
            file_id=str(uuid.uuid4()),
            extracted_text=mock_text,
            summary="오디오 파일 분석 완료 - 음성인식 및 품질 분석",
            keywords=["오디오", "음성", "인식", "발화", "대화"],
            sentiment="neutral",
            confidence_score=0.75,
            writing_insights=self.generate_writing_insights("audio", filename)
        )
    
    async def analyze_document(self, file_path: Path, filename: str) -> AnalysisResult:
        """문서 분석"""
        # 실제 구현에서는 문서 파싱 라이브러리 사용
        # if filename.endswith('.pdf'):
        #     with open(file_path, 'rb') as file:
        #         pdf_reader = PyPDF2.PdfReader(file)
        #         text = ""
        #         for page in pdf_reader.pages:
        #             text += page.extract_text()
        
        mock_text = f"""문서 파일에서 추출된 텍스트 내용입니다.
        
파일명: {filename}
분석 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

주요 내용:
- 문서 구조 분석
- 키워드 추출
- 내용 요약

문서 분석을 통해 체계적인 정보를 추출할 수 있습니다."""

        return AnalysisResult(
            file_id=str(uuid.uuid4()),
            extracted_text=mock_text,
            summary="문서 파일 분석 완료 - 구조 분석 및 키워드 추출",
            keywords=["문서", "텍스트", "구조", "키워드", "분석"],
            sentiment="neutral",
            confidence_score=0.90,
            writing_insights=self.generate_writing_insights("document", filename)
        )
    
    def generate_writing_insights(self, file_type: str, filename: str) -> List[Dict[str, Any]]:
        """글쓰기 인사이트 생성"""
        insights = [
            {
                "id": str(uuid.uuid4()),
                "type": "quote",
                "content": f"이 {file_type} 파일은 중요한 정보를 담고 있습니다.",
                "source": filename,
                "confidence": 0.9,
                "context": "파일 분석 결과",
                "writing_style": "대화체",
                "citation_format": f"({filename}, {datetime.now().year})"
            },
            {
                "id": str(uuid.uuid4()),
                "type": "reference",
                "content": "분석 결과에 따르면 이 내용은 참고할 만한 가치가 있습니다.",
                "source": "AI 분석",
                "confidence": 0.8,
                "context": "자동 분석",
                "writing_style": "학술적",
                "citation_format": "(AI 분석, 2024)"
            },
            {
                "id": str(uuid.uuid4()),
                "type": "argument",
                "content": "이 정보를 바탕으로 다음과 같은 결론을 도출할 수 있습니다.",
                "source": "논리적 추론",
                "confidence": 0.7,
                "context": "분석 기반 추론",
                "writing_style": "논리적",
                "citation_format": "(논리적 분석, 2024)"
            }
        ]
        
        return insights
    
    def generate_conversational_response(self, user_message: str, analysis_results: List[AnalysisResult], writing_theory: Optional[WritingTheory] = None) -> str:
        """
        분석된 미디어 내용을 바탕으로 대화체 응답을 생성합니다.
        """
        try:
            # 사용자 메시지 분석
            user_message_lower = user_message.lower()
            
            # 분석된 내용에서 핵심 정보 추출
            extracted_texts = []
            summaries = []
            keywords = []
            
            for result in analysis_results:
                if result.extracted_text:
                    extracted_texts.append(result.extracted_text)
                if result.summary:
                    summaries.append(result.summary)
                if result.keywords:
                    keywords.extend(result.keywords)
            
            # 글쓰기 이론에 따른 응답 생성
            if writing_theory:
                if writing_theory.id == '1':  # 인용 이론
                    return self._generate_citation_based_response(user_message, extracted_texts, summaries, keywords)
                elif writing_theory.id == '2':  # 대화체 글쓰기
                    return self._generate_conversational_style_response(user_message, extracted_texts, summaries, keywords)
                elif writing_theory.id == '3':  # 맥락 기반 글쓰기
                    return self._generate_context_based_response(user_message, extracted_texts, summaries, keywords)
            
            # 기본 대화체 응답
            return self._generate_default_conversational_response(user_message, extracted_texts, summaries, keywords)
            
        except Exception as e:
            return f"죄송해요, 응답을 생성하는 중에 문제가 생겼어요. 다시 시도해보시겠어요? (오류: {str(e)})"
    
    def _generate_citation_based_response(self, user_message: str, extracted_texts: List[str], summaries: List[str], keywords: List[str]) -> str:
        """인용 이론을 적용한 응답 생성"""
        response_parts = []
        
        # 인사말
        if any(word in user_message.lower() for word in ['안녕', 'hello', 'hi']):
            response_parts.append("안녕하세요! 👋 분석된 내용을 바탕으로 답변드릴게요.")
        
        # 핵심 내용 인용
        if summaries:
            main_summary = summaries[0]
            response_parts.append(f"분석 결과에 따르면 \"{main_summary}\"라고 해요.")
        
        # 키워드 인용
        if keywords:
            key_keywords = keywords[:3]  # 상위 3개 키워드
            response_parts.append(f"주요 키워드로는 \"{', '.join(key_keywords)}\" 등이 있어요.")
        
        # 사용자 질문에 대한 구체적 답변
        if '무엇' in user_message or '뭐' in user_message:
            response_parts.append("말씀하신 내용을 보니 정말 궁금한 점이 많으시군요! 😊")
            if extracted_texts:
                response_parts.append(f"첨부된 파일에서 \"{extracted_texts[0][:100]}...\"라는 내용을 확인할 수 있어요.")
        
        # 결론
        response_parts.append("이런 식으로 접근하시면 더 깊이 있는 이해가 가능할 것 같아요!")
        
        return " ".join(response_parts)
    
    def _generate_conversational_style_response(self, user_message: str, extracted_texts: List[str], summaries: List[str], keywords: List[str]) -> str:
        """대화체 스타일 응답 생성"""
        response_parts = []
        
        # 친근한 인사
        response_parts.append("네, 말씀해주세요! 😊")
        
        # 분석 결과를 친근하게 설명
        if summaries:
            response_parts.append(f"첨부해주신 파일들을 분석해보니 {summaries[0]}라는 내용이 있어요.")
        
        # 키워드를 자연스럽게 언급
        if keywords:
            response_parts.append(f"특히 {', '.join(keywords[:2])} 같은 부분들이 눈에 띄네요.")
        
        # 사용자와의 상호작용
        if '도움' in user_message or '도와' in user_message:
            response_parts.append("무엇을 도와드릴까요? 구체적으로 말씀해주시면 더 정확한 답변을 드릴 수 있어요!")
        
        # 추가 정보 제공
        if extracted_texts:
            response_parts.append("더 자세한 내용이 궁금하시면 언제든지 물어보세요!")
        
        return " ".join(response_parts)
    
    def _generate_context_based_response(self, user_message: str, extracted_texts: List[str], summaries: List[str], keywords: List[str]) -> str:
        """맥락 기반 응답 생성"""
        response_parts = []
        
        # 상황 파악
        if '분석' in user_message or '요약' in user_message:
            response_parts.append("분석 요청이시군요! 📊")
            if summaries:
                response_parts.append(f"주요 내용을 정리하면: {summaries[0]}")
        
        elif '중요' in user_message or '핵심' in user_message:
            response_parts.append("중요한 포인트를 찾아드릴게요! 🔍")
            if keywords:
                response_parts.append(f"핵심 키워드는 {', '.join(keywords[:3])}입니다.")
        
        elif '설명' in user_message or '이해' in user_message:
            response_parts.append("이해하기 쉽게 설명드릴게요! 💡")
            if extracted_texts:
                response_parts.append(f"이 내용은 {extracted_texts[0][:50]}...와 관련이 있어요.")
        
        # 맥락에 맞는 조언
        response_parts.append("이런 관점에서 보시면 어떨까요?")
        
        return " ".join(response_parts)
    
    def _generate_default_conversational_response(self, user_message: str, extracted_texts: List[str], summaries: List[str], keywords: List[str]) -> str:
        """기본 대화체 응답 생성"""
        response_parts = []
        
        # 사용자 메시지에 따른 응답
        if any(word in user_message.lower() for word in ['안녕', 'hello', 'hi']):
            response_parts.append("안녕하세요! 무엇을 도와드릴까요? 😊")
        
        elif any(word in user_message.lower() for word in ['분석', '분석해', '봐']):
            response_parts.append("네, 분석해드릴게요! 📋")
            if summaries:
                response_parts.append(f"분석 결과: {summaries[0]}")
        
        elif any(word in user_message.lower() for word in ['요약', '정리', '핵심']):
            response_parts.append("핵심을 정리해드릴게요! ✨")
            if keywords:
                response_parts.append(f"주요 포인트: {', '.join(keywords[:3])}")
        
        elif any(word in user_message.lower() for word in ['무엇', '뭐', '어떤']):
            response_parts.append("말씀하신 내용을 확인해보니... 🤔")
            if extracted_texts:
                response_parts.append(f"첨부된 파일에서 {extracted_texts[0][:30]}...라는 내용이 있어요.")
        
        else:
            response_parts.append("네, 말씀해주세요! 어떤 도움이 필요하신가요? 💬")
            if summaries:
                response_parts.append(f"현재 분석된 내용: {summaries[0]}")
        
        return " ".join(response_parts)
    
    def _generate_detailed_explanation_response(self, user_message: str, extracted_texts: List[str], summaries: List[str], keywords: List[str]) -> str:
        """구체적이고 이해하기 쉬운 상세 설명 응답 생성"""
        response_parts = []
        
        # 인사말
        response_parts.append("안녕하세요! 📚 분석된 내용을 바탕으로 자세히 설명드릴게요.")
        
        # 파일 분석 결과 요약
        if summaries:
            response_parts.append(f"\n📋 **주요 내용 요약:**")
            response_parts.append(f"{summaries[0]}")
        
        # 키워드 분석
        if keywords:
            response_parts.append(f"\n🔑 **핵심 키워드:**")
            response_parts.append(f"• {', '.join(keywords[:5])}")
        
        # 구체적인 내용 분석
        if extracted_texts:
            response_parts.append(f"\n📖 **상세 내용:**")
            # 첫 200자 정도를 추출하여 설명
            content_preview = extracted_texts[0][:200] + "..." if len(extracted_texts[0]) > 200 else extracted_texts[0]
            response_parts.append(f"{content_preview}")
        
        # 사용자 질문에 대한 구체적 답변
        if '무엇' in user_message or '뭐' in user_message:
            response_parts.append(f"\n❓ **질문에 대한 답변:**")
            response_parts.append("말씀하신 내용을 분석한 결과, 다음과 같은 정보를 확인할 수 있습니다:")
            
            if summaries:
                response_parts.append(f"• {summaries[0]}")
            if keywords:
                response_parts.append(f"• 주요 키워드: {', '.join(keywords[:3])}")
        
        # 실용적인 조언
        response_parts.append(f"\n💡 **활용 방안:**")
        response_parts.append("이 정보를 다음과 같이 활용하실 수 있습니다:")
        response_parts.append("• 문서 작성 시 참고 자료로 활용")
        response_parts.append("• 프레젠테이션 준비 시 핵심 포인트로 활용")
        response_parts.append("• 추가 연구나 분석의 기초 자료로 활용")
        
        # 추가 질문 유도
        response_parts.append(f"\n🤔 **더 궁금한 점이 있으시면 언제든지 물어보세요!**")
        
        return "\n".join(response_parts)

# 서비스 인스턴스
media_service = MediaAnalysisService()

# API 엔드포인트들
@app.on_event("startup")
async def startup_event():
    init_database()

@app.get("/")
async def root():
    return {"message": "Advanced Media Analysis API", "version": "1.0.0"}

@app.post("/upload", response_model=MediaUploadResponse)
async def upload_media_file(
    file: UploadFile = File(...),
    project_id: str = Form(None)
):
    """미디어 파일 업로드"""
    try:
        result = media_service.save_file(file, project_id)
        return MediaUploadResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/{file_id}", response_model=AnalysisResult)
async def analyze_file(file_id: str, background_tasks: BackgroundTasks):
    """파일 분석"""
    try:
        # 백그라운드에서 분석 수행
        background_tasks.add_task(media_service.analyze_media_file, file_id)
        
        return {
            "file_id": file_id,
            "extracted_text": "분석 중...",
            "summary": "분석이 시작되었습니다.",
            "keywords": [],
            "sentiment": "neutral",
            "confidence_score": 0.0,
            "writing_insights": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/{file_id}", response_model=AnalysisResult)
async def get_analysis_result(file_id: str):
    """분석 결과 조회"""
    try:
        conn = sqlite3.connect('media_analysis.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT ar.*, mf.original_filename 
            FROM analysis_results ar
            JOIN media_files mf ON ar.file_id = mf.id
            WHERE ar.file_id = ?
        ''', (file_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            raise HTTPException(status_code=404, detail="분석 결과를 찾을 수 없습니다")
        
        return AnalysisResult(
            file_id=result[1],
            extracted_text=result[2],
            summary=result[3],
            keywords=json.loads(result[4]),
            sentiment=result[5],
            confidence_score=result[6],
            writing_insights=json.loads(result[8])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/writing-theories", response_model=List[WritingTheory])
async def get_writing_theories():
    """글쓰기 이론 목록 조회"""
    return WRITING_THEORIES

@app.post("/conversation/response")
async def generate_response(
    message: ConversationMessage,
    theory_id: str = Form(None)
):
    """대화체 응답 생성"""
    try:
        # 선택된 이론 찾기
        writing_theory = None
        if theory_id:
            for theory in WRITING_THEORIES:
                if theory["id"] == theory_id:
                    writing_theory = WritingTheory(**theory)
                    break
        
        # 분석 결과 조회 (실제로는 파일 ID를 통해 조회)
        analysis_results = []  # 실제 구현에서는 파일 ID를 통해 분석 결과 조회
        
        # 응답 생성
        response = media_service.generate_conversational_response(
            message.content, 
            analysis_results, 
            writing_theory
        )
        
        # 대화 메시지 저장
        conn = sqlite3.connect('media_analysis.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO conversation_messages (id, session_id, sender, content, timestamp, media_files, writing_context)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()), message.session_id, message.sender,
            message.content, message.timestamp,
            json.dumps(message.media_files) if message.media_files else None,
            json.dumps(message.writing_context) if message.writing_context else None
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "response": response,
            "timestamp": datetime.now().isoformat(),
            "writing_theory_applied": writing_theory.name if writing_theory else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
async def get_uploaded_files(project_id: str = None):
    """업로드된 파일 목록 조회"""
    try:
        conn = sqlite3.connect('media_analysis.db')
        cursor = conn.cursor()
        
        if project_id:
            cursor.execute('''
                SELECT id, original_filename, file_size, mime_type, upload_date, analysis_status
                FROM media_files WHERE project_id = ? ORDER BY upload_date DESC
            ''', (project_id,))
        else:
            cursor.execute('''
                SELECT id, original_filename, file_size, mime_type, upload_date, analysis_status
                FROM media_files ORDER BY upload_date DESC
            ''')
        
        files = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": file[0],
                "name": file[1],
                "size": file[2],
                "mime_type": file[3],
                "upload_date": file[4],
                "analysis_status": file[5]
            }
            for file in files
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 