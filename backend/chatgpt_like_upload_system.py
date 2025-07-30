#!/usr/bin/env python3
"""
ChatGPT 스타일 파일 업로드 & 지침 기능 시스템 v1.0
- 프로젝트 자료 업로드 및 분석
- 지침 기반 대화 생성
- 컨텍스트 인식 메시지 형식 적용
- 스마트 문서 이해 및 활용
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import json
import os
import base64
import hashlib
from datetime import datetime
import logging
import asyncio
import aiofiles
from pathlib import Path
import mimetypes
import pandas as pd
import docx
import PyPDF2
from PIL import Image
import io

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ChatGPT 스타일 업로드 & 지침 시스템", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델들
class ProjectInstruction(BaseModel):
    instruction_id: str
    title: str
    content: str
    category: str  # "tone", "style", "format", "constraint", "custom"
    priority: int
    active: bool
    created_at: str
    examples: List[str] = []
    conditions: Dict[str, Any] = {}

class UploadedFile(BaseModel):
    file_id: str
    filename: str
    file_type: str
    file_size: int
    content_summary: str
    key_information: Dict[str, Any]
    upload_time: str
    status: str
    processing_results: Dict[str, Any] = {}

class MessageGenerationRequest(BaseModel):
    message_intent: str
    target_situation: str
    reference_files: List[str] = []  # 파일 ID 목록
    apply_instructions: List[str] = []  # 적용할 지침 ID 목록
    style_preferences: Dict[str, str] = {}
    constraints: List[str] = []
    context_description: str = ""

class SmartMessageResponse(BaseModel):
    message_id: str
    generated_message: str
    applied_instructions: List[str]
    referenced_files: List[str]
    reasoning: str
    quality_score: float
    suggestions: List[str]
    generated_at: str

# 저장소 클래스들
class FileStorage:
    """파일 저장 및 관리"""
    
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(exist_ok=True)
        self.files_db = {}  # 실제로는 데이터베이스 사용
        
    async def save_file(self, file: UploadFile) -> str:
        """파일 저장"""
        file_id = hashlib.md5(f"{file.filename}_{datetime.now().isoformat()}".encode()).hexdigest()[:16]
        
        # 파일 경로 생성
        file_path = self.upload_dir / f"{file_id}_{file.filename}"
        
        # 파일 저장
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # 메타데이터 저장
        file_info = {
            "file_id": file_id,
            "filename": file.filename,
            "file_type": file.content_type,
            "file_size": len(content),
            "file_path": str(file_path),
            "upload_time": datetime.now().isoformat(),
            "status": "uploaded"
        }
        
        self.files_db[file_id] = file_info
        
        return file_id
    
    def get_file_info(self, file_id: str) -> Optional[Dict]:
        """파일 정보 조회"""
        return self.files_db.get(file_id)
    
    def list_files(self) -> List[Dict]:
        """모든 파일 목록"""
        return list(self.files_db.values())

class DocumentProcessor:
    """문서 처리 및 분석"""
    
    def __init__(self):
        self.supported_types = {
            'text/plain': self._process_txt,
            'application/pdf': self._process_pdf,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': self._process_docx,
            'application/vnd.ms-excel': self._process_excel,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': self._process_excel,
            'image/jpeg': self._process_image,
            'image/png': self._process_image,
        }
    
    async def process_file(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """파일 처리 및 분석"""
        
        if file_type in self.supported_types:
            processor = self.supported_types[file_type]
            return await processor(file_path)
        else:
            return {
                "content_summary": "지원되지 않는 파일 형식입니다.",
                "key_information": {},
                "processing_status": "unsupported"
            }
    
    async def _process_txt(self, file_path: str) -> Dict[str, Any]:
        """텍스트 파일 처리"""
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
            content = await f.read()
        
        # 기본 분석
        lines = content.split('\n')
        word_count = len(content.split())
        
        # 키워드 추출 (간단한 버전)
        keywords = self._extract_keywords(content)
        
        return {
            "content_summary": f"텍스트 문서 ({len(lines)}줄, {word_count}단어)",
            "key_information": {
                "line_count": len(lines),
                "word_count": word_count,
                "keywords": keywords,
                "content_preview": content[:500] + "..." if len(content) > 500 else content
            },
            "processing_status": "completed"
        }
    
    async def _process_pdf(self, file_path: str) -> Dict[str, Any]:
        """PDF 파일 처리"""
        try:
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                page_count = len(pdf_reader.pages)
                
                # 첫 페이지 텍스트 추출
                first_page = pdf_reader.pages[0].extract_text()
                
            return {
                "content_summary": f"PDF 문서 ({page_count}페이지)",
                "key_information": {
                    "page_count": page_count,
                    "first_page_preview": first_page[:500] + "..." if len(first_page) > 500 else first_page,
                    "document_type": "PDF"
                },
                "processing_status": "completed"
            }
        except Exception as e:
            return {
                "content_summary": "PDF 처리 중 오류 발생",
                "key_information": {"error": str(e)},
                "processing_status": "error"
            }
    
    async def _process_docx(self, file_path: str) -> Dict[str, Any]:
        """DOCX 파일 처리"""
        try:
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            full_text = '\n'.join(paragraphs)
            
            return {
                "content_summary": f"Word 문서 ({len(paragraphs)}문단)",
                "key_information": {
                    "paragraph_count": len(paragraphs),
                    "word_count": len(full_text.split()),
                    "content_preview": full_text[:500] + "..." if len(full_text) > 500 else full_text
                },
                "processing_status": "completed"
            }
        except Exception as e:
            return {
                "content_summary": "Word 문서 처리 중 오류 발생",
                "key_information": {"error": str(e)},
                "processing_status": "error"
            }
    
    async def _process_excel(self, file_path: str) -> Dict[str, Any]:
        """Excel 파일 처리"""
        try:
            df = pd.read_excel(file_path)
            rows, cols = df.shape
            column_names = df.columns.tolist()
            
            return {
                "content_summary": f"Excel 문서 ({rows}행, {cols}열)",
                "key_information": {
                    "row_count": rows,
                    "column_count": cols,
                    "column_names": column_names,
                    "data_preview": df.head(3).to_dict()
                },
                "processing_status": "completed"
            }
        except Exception as e:
            return {
                "content_summary": "Excel 처리 중 오류 발생",
                "key_information": {"error": str(e)},
                "processing_status": "error"
            }
    
    async def _process_image(self, file_path: str) -> Dict[str, Any]:
        """이미지 파일 처리"""
        try:
            with Image.open(file_path) as img:
                width, height = img.size
                format_type = img.format
                
            return {
                "content_summary": f"이미지 파일 ({width}x{height}, {format_type})",
                "key_information": {
                    "width": width,
                    "height": height,
                    "format": format_type,
                    "aspect_ratio": round(width/height, 2)
                },
                "processing_status": "completed"
            }
        except Exception as e:
            return {
                "content_summary": "이미지 처리 중 오류 발생",
                "key_information": {"error": str(e)},
                "processing_status": "error"
            }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """간단한 키워드 추출"""
        # 실제로는 더 정교한 NLP 처리 필요
        common_words = ['의', '이', '가', '을', '를', '은', '는', '에', '와', '과', '로', '으로']
        words = text.split()
        keywords = []
        
        for word in words:
            if len(word) > 2 and word not in common_words:
                if word not in keywords:
                    keywords.append(word)
                if len(keywords) >= 10:
                    break
        
        return keywords

class InstructionManager:
    """지침 관리 시스템"""
    
    def __init__(self):
        self.instructions_db = {}
        self._initialize_default_instructions()
    
    def _initialize_default_instructions(self):
        """기본 지침들 초기화"""
        default_instructions = [
            {
                "instruction_id": "tone_professional",
                "title": "전문적 톤 사용",
                "content": "비즈니스 상황에서는 전문적이고 격식있는 톤을 사용하세요.",
                "category": "tone",
                "priority": 1,
                "active": True,
                "created_at": datetime.now().isoformat(),
                "examples": [
                    "말씀해주신 의견에 대해 검토해보겠습니다.",
                    "해당 사안에 대한 전문적 분석이 필요합니다."
                ],
                "conditions": {"situation": "business"}
            },
            {
                "instruction_id": "style_persuasive",
                "title": "설득적 스타일",
                "content": "상대방을 설득할 때는 논리적 근거와 함께 부드러운 접근을 사용하세요.",
                "category": "style",
                "priority": 2,
                "active": True,
                "created_at": datetime.now().isoformat(),
                "examples": [
                    "데이터를 바탕으로 보면 이 방향이 더 유리할 것 같습니다.",
                    "함께 검토해보시면 좋은 결과가 있을 것입니다."
                ],
                "conditions": {"intent": "persuasion"}
            },
            {
                "instruction_id": "format_structured",
                "title": "구조화된 메시지",
                "content": "복잡한 내용은 1) 상황설명 2) 분석내용 3) 제안사항 순으로 구조화하세요.",
                "category": "format",
                "priority": 3,
                "active": True,
                "created_at": datetime.now().isoformat(),
                "examples": [
                    "1) 현재 상황: ... 2) 분석 결과: ... 3) 제안 방향: ..."
                ],
                "conditions": {"complexity": "high"}
            },
            {
                "instruction_id": "constraint_length",
                "title": "적절한 길이 유지",
                "content": "메시지는 핵심만 간결하게, 200자 내외로 작성하세요.",
                "category": "constraint",
                "priority": 4,
                "active": True,
                "created_at": datetime.now().isoformat(),
                "examples": [],
                "conditions": {"length_limit": 200}
            }
        ]
        
        for instruction in default_instructions:
            self.instructions_db[instruction["instruction_id"]] = instruction
    
    def add_instruction(self, instruction: ProjectInstruction) -> str:
        """새 지침 추가"""
        self.instructions_db[instruction.instruction_id] = instruction.dict()
        return instruction.instruction_id
    
    def get_instruction(self, instruction_id: str) -> Optional[Dict]:
        """지침 조회"""
        return self.instructions_db.get(instruction_id)
    
    def list_instructions(self, category: Optional[str] = None) -> List[Dict]:
        """지침 목록 조회"""
        instructions = list(self.instructions_db.values())
        
        if category:
            instructions = [i for i in instructions if i["category"] == category]
        
        return sorted(instructions, key=lambda x: x["priority"])
    
    def get_applicable_instructions(self, context: Dict[str, Any]) -> List[Dict]:
        """컨텍스트에 맞는 지침들 조회"""
        applicable = []
        
        for instruction in self.instructions_db.values():
            if not instruction["active"]:
                continue
            
            # 조건 확인
            conditions = instruction.get("conditions", {})
            matches = True
            
            for key, value in conditions.items():
                if key in context and context[key] != value:
                    matches = False
                    break
            
            if matches:
                applicable.append(instruction)
        
        return sorted(applicable, key=lambda x: x["priority"])

class SmartMessageGenerator:
    """스마트 메시지 생성기"""
    
    def __init__(self, file_storage: FileStorage, doc_processor: DocumentProcessor, 
                 instruction_manager: InstructionManager):
        self.file_storage = file_storage
        self.doc_processor = doc_processor
        self.instruction_manager = instruction_manager
    
    async def generate_message(self, request: MessageGenerationRequest) -> SmartMessageResponse:
        """지침과 파일을 기반으로 스마트 메시지 생성"""
        
        # 1. 참조 파일들 분석
        file_context = await self._analyze_reference_files(request.reference_files)
        
        # 2. 적용할 지침들 수집
        instructions = self._collect_instructions(request)
        
        # 3. 컨텍스트 구성
        context = {
            "intent": request.message_intent,
            "situation": request.target_situation,
            "files": file_context,
            "instructions": instructions,
            "style_preferences": request.style_preferences,
            "constraints": request.constraints,
            "description": request.context_description
        }
        
        # 4. 메시지 생성
        generated_message = await self._generate_smart_message(context)
        
        # 5. 품질 평가
        quality_score = self._evaluate_message_quality(generated_message, context)
        
        # 6. 개선 제안
        suggestions = self._generate_suggestions(generated_message, context)
        
        message_id = hashlib.md5(f"{generated_message}_{datetime.now().isoformat()}".encode()).hexdigest()[:12]
        
        return SmartMessageResponse(
            message_id=message_id,
            generated_message=generated_message,
            applied_instructions=[i["instruction_id"] for i in instructions],
            referenced_files=request.reference_files,
            reasoning=self._generate_reasoning(context, instructions),
            quality_score=quality_score,
            suggestions=suggestions,
            generated_at=datetime.now().isoformat()
        )
    
    async def _analyze_reference_files(self, file_ids: List[str]) -> Dict[str, Any]:
        """참조 파일들 분석"""
        
        if not file_ids:
            return {}
        
        file_analysis = {}
        
        for file_id in file_ids:
            file_info = self.file_storage.get_file_info(file_id)
            if file_info:
                # 파일 재처리 (이미 처리된 경우 캐시된 결과 사용)
                if "processing_results" not in file_info:
                    processing_results = await self.doc_processor.process_file(
                        file_info["file_path"], 
                        file_info["file_type"]
                    )
                    file_info["processing_results"] = processing_results
                
                file_analysis[file_id] = file_info
        
        return file_analysis
    
    def _collect_instructions(self, request: MessageGenerationRequest) -> List[Dict]:
        """적용할 지침들 수집"""
        
        instructions = []
        
        # 명시적으로 요청된 지침들
        for instruction_id in request.apply_instructions:
            instruction = self.instruction_manager.get_instruction(instruction_id)
            if instruction:
                instructions.append(instruction)
        
        # 컨텍스트 기반 자동 선택
        context = {
            "intent": request.message_intent.lower(),
            "situation": request.target_situation.lower(),
            "complexity": "high" if len(request.context_description) > 100 else "low"
        }
        
        auto_instructions = self.instruction_manager.get_applicable_instructions(context)
        
        # 중복 제거하면서 병합
        instruction_ids = {i["instruction_id"] for i in instructions}
        for auto_instruction in auto_instructions:
            if auto_instruction["instruction_id"] not in instruction_ids:
                instructions.append(auto_instruction)
        
        return instructions
    
    async def _generate_smart_message(self, context: Dict[str, Any]) -> str:
        """실제 메시지 생성"""
        
        # 기본 메시지 템플릿
        intent = context["intent"]
        situation = context["situation"]
        
        # 파일 기반 정보 추출
        file_insights = self._extract_file_insights(context.get("files", {}))
        
        # 지침 적용
        style_guide = self._apply_instructions(context["instructions"])
        
        # 메시지 생성 로직
        if "불공정" in situation or "경쟁" in situation:
            base_message = self._generate_fairness_message(intent, situation, file_insights)
        elif "제안" in intent or "설득" in intent:
            base_message = self._generate_persuasive_message(intent, situation, file_insights)
        elif "대응" in intent or "반박" in intent:
            base_message = self._generate_response_message(intent, situation, file_insights)
        else:
            base_message = self._generate_general_message(intent, situation, file_insights)
        
        # 스타일 가이드 적용
        final_message = self._apply_style_guide(base_message, style_guide, context)
        
        return final_message
    
    def _extract_file_insights(self, files: Dict[str, Any]) -> Dict[str, Any]:
        """파일에서 인사이트 추출"""
        
        insights = {
            "data_points": [],
            "key_facts": [],
            "statistics": [],
            "references": []
        }
        
        for file_id, file_info in files.items():
            processing_results = file_info.get("processing_results", {})
            key_info = processing_results.get("key_information", {})
            
            # 키워드에서 인사이트 추출
            if "keywords" in key_info:
                insights["key_facts"].extend(key_info["keywords"][:3])
            
            # 파일명에서 컨텍스트 추출
            filename = file_info.get("filename", "")
            if any(word in filename for word in ["설계", "제안", "비교"]):
                insights["references"].append(f"'{filename}' 문서 참조")
        
        return insights
    
    def _apply_instructions(self, instructions: List[Dict]) -> Dict[str, Any]:
        """지침들을 스타일 가이드로 변환"""
        
        style_guide = {
            "tone": "neutral",
            "structure": "simple",
            "length_limit": None,
            "special_requirements": []
        }
        
        for instruction in instructions:
            category = instruction["category"]
            content = instruction["content"]
            
            if category == "tone":
                if "전문적" in content:
                    style_guide["tone"] = "professional"
                elif "친근" in content:
                    style_guide["tone"] = "friendly"
            
            elif category == "format":
                if "구조화" in content:
                    style_guide["structure"] = "structured"
            
            elif category == "constraint":
                if "200자" in content:
                    style_guide["length_limit"] = 200
            
            style_guide["special_requirements"].append(content)
        
        return style_guide
    
    def _generate_fairness_message(self, intent: str, situation: str, insights: Dict) -> str:
        """공정성 관련 메시지 생성"""
        
        base_templates = {
            "설득": "공정한 경쟁을 위해서는 {situation}에 대한 객관적 검토가 필요합니다. {evidence}를 고려할 때, 모든 참여사에게 동등한 기회가 주어져야 합니다.",
            "대응": "{situation}에 대해 우려를 표명합니다. {evidence} 이는 공정한 경쟁 환경을 해칠 수 있습니다.",
            "제안": "{situation} 상황에서 공정성 확보를 위해 다음과 같은 방안을 제안합니다: {proposal}"
        }
        
        template = base_templates.get(intent, base_templates["대응"])
        
        # 인사이트 활용
        evidence = "관련 자료" if not insights["references"] else insights["references"][0]
        proposal = "객관적 기준 적용"
        
        return template.format(
            situation=situation,
            evidence=evidence,
            proposal=proposal
        )
    
    def _generate_persuasive_message(self, intent: str, situation: str, insights: Dict) -> str:
        """설득형 메시지 생성"""
        
        return f"이 {situation}에 대해 신중히 검토해보시면, 더 나은 방향을 찾을 수 있을 것입니다. {insights.get('key_facts', ['객관적 근거'])[0]}를 바탕으로 판단해보시기 바랍니다."
    
    def _generate_response_message(self, intent: str, situation: str, insights: Dict) -> str:
        """대응형 메시지 생성"""
        
        return f"{situation}에 대해서는 다른 관점도 고려해야 합니다. {insights.get('references', ['관련 자료'])[0]}에서 보듯이, 보다 균형잡힌 접근이 필요합니다."
    
    def _generate_general_message(self, intent: str, situation: str, insights: Dict) -> str:
        """일반 메시지 생성"""
        
        return f"{situation}에 대한 {intent} 메시지입니다. 상황을 종합적으로 고려하여 최선의 방향을 모색해보겠습니다."
    
    def _apply_style_guide(self, message: str, style_guide: Dict, context: Dict) -> str:
        """스타일 가이드 적용"""
        
        # 톤 적용
        if style_guide["tone"] == "professional":
            message = f"말씀드린 바와 같이, {message}"
        elif style_guide["tone"] == "friendly":
            message = f"솔직히 말씀드리면, {message}"
        
        # 구조화
        if style_guide["structure"] == "structured":
            parts = message.split(". ")
            if len(parts) > 1:
                message = f"1) {parts[0]}. 2) {'. '.join(parts[1:])}"
        
        # 길이 제한
        if style_guide["length_limit"]:
            if len(message) > style_guide["length_limit"]:
                message = message[:style_guide["length_limit"]-3] + "..."
        
        # 제약 조건 적용
        constraints = context.get("constraints", [])
        if "존댓말 사용" in constraints:
            message = message.replace("다", "습니다").replace("요.", "습니다.")
        
        return message
    
    def _evaluate_message_quality(self, message: str, context: Dict) -> float:
        """메시지 품질 평가"""
        
        score = 0.7  # 기본 점수
        
        # 길이 적절성
        if 50 <= len(message) <= 200:
            score += 0.1
        
        # 지침 적용도
        if context["instructions"]:
            score += 0.1
        
        # 파일 활용도
        if context["files"]:
            score += 0.1
        
        return min(score, 1.0)
    
    def _generate_suggestions(self, message: str, context: Dict) -> List[str]:
        """개선 제안 생성"""
        
        suggestions = []
        
        if len(message) > 200:
            suggestions.append("메시지를 더 간결하게 줄여보세요")
        
        if not context["files"]:
            suggestions.append("관련 자료를 업로드하면 더 구체적인 메시지를 생성할 수 있습니다")
        
        if len(context["instructions"]) < 2:
            suggestions.append("더 많은 지침을 적용하면 품질이 향상됩니다")
        
        return suggestions
    
    def _generate_reasoning(self, context: Dict, instructions: List[Dict]) -> str:
        """생성 근거 설명"""
        
        reasoning_parts = []
        
        reasoning_parts.append(f"'{context['intent']}' 의도에 맞는 메시지 생성")
        
        if context["files"]:
            reasoning_parts.append(f"{len(context['files'])}개 참조 파일 활용")
        
        if instructions:
            reasoning_parts.append(f"{len(instructions)}개 지침 적용")
        
        return ". ".join(reasoning_parts) + "."

# 전역 인스턴스들
file_storage = FileStorage()
doc_processor = DocumentProcessor()
instruction_manager = InstructionManager()
message_generator = SmartMessageGenerator(file_storage, doc_processor, instruction_manager)

# API 엔드포인트들

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "ChatGPT 스타일 업로드 & 지침 시스템",
        "version": "1.0.0",
        "features": [
            "프로젝트 파일 업로드 및 분석",
            "지침 기반 메시지 생성",
            "스마트 컨텍스트 인식",
            "다양한 파일 형식 지원"
        ],
        "supported_formats": [
            "텍스트 (.txt)",
            "PDF (.pdf)", 
            "Word (.docx)",
            "Excel (.xlsx, .xls)",
            "이미지 (.jpg, .png)"
        ]
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """파일 업로드"""
    
    try:
        # 파일 저장
        file_id = await file_storage.save_file(file)
        
        # 파일 처리
        file_info = file_storage.get_file_info(file_id)
        processing_results = await doc_processor.process_file(
            file_info["file_path"], 
            file_info["file_type"]
        )
        
        # 처리 결과 저장
        file_info["processing_results"] = processing_results
        file_storage.files_db[file_id] = file_info
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "processing_results": processing_results,
            "message": "파일이 성공적으로 업로드되고 처리되었습니다."
        }
        
    except Exception as e:
        logger.error(f"파일 업로드 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
async def list_files():
    """업로드된 파일 목록"""
    
    files = file_storage.list_files()
    return {
        "files": files,
        "total_count": len(files)
    }

@app.get("/files/{file_id}")
async def get_file_info(file_id: str):
    """파일 정보 조회"""
    
    file_info = file_storage.get_file_info(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
    
    return file_info

@app.post("/instructions")
async def add_instruction(instruction: ProjectInstruction):
    """새 지침 추가"""
    
    instruction_id = instruction_manager.add_instruction(instruction)
    return {
        "success": True,
        "instruction_id": instruction_id,
        "message": "지침이 성공적으로 추가되었습니다."
    }

@app.get("/instructions")
async def list_instructions(category: Optional[str] = None):
    """지침 목록 조회"""
    
    instructions = instruction_manager.list_instructions(category)
    return {
        "instructions": instructions,
        "total_count": len(instructions)
    }

@app.post("/generate")
async def generate_smart_message(request: MessageGenerationRequest):
    """스마트 메시지 생성"""
    
    try:
        response = await message_generator.generate_message(request)
        return {
            "success": True,
            "result": response.dict(),
            "message": "메시지가 성공적으로 생성되었습니다."
        }
        
    except Exception as e:
        logger.error(f"메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 실제 상황 테스트용 엔드포인트
@app.post("/demo/fairness-response")
async def demo_fairness_response():
    """공정성 이슈 대응 메시지 데모"""
    
    # 사용자 입력 상황
    situation = "삼성은 경쟁사 설계에 없는 것을 이유로 '허가 불가'라고 몰아붙이는데, 이건 공정 경쟁이 아닙니다. 조합원들이 다 지켜보고 있습니다."
    
    # 자동 메시지 생성
    request = MessageGenerationRequest(
        message_intent="공정성 주장",
        target_situation=situation,
        reference_files=[],
        apply_instructions=["tone_professional", "style_persuasive"],
        style_preferences={"tone": "assertive", "approach": "logical"},
        constraints=["존댓말 사용", "200자 이내"],
        context_description="시공사 선정 과정에서의 공정성 이슈에 대한 조합원 입장 표명"
    )
    
    response = await message_generator.generate_message(request)
    
    return {
        "original_situation": situation,
        "generated_response": response.dict(),
        "demo_mode": True
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 ChatGPT 스타일 업로드 & 지침 시스템 시작")
    print("📁 파일 업로드: POST /upload")
    print("📋 지침 관리: GET/POST /instructions") 
    print("🤖 메시지 생성: POST /generate")
    print("🎭 데모 테스트: POST /demo/fairness-response")
    
    uvicorn.run(app, host="0.0.0.0", port=8090) 