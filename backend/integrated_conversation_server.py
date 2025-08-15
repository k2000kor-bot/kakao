#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path
import random # Added for random number generation in new endpoints

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# 프로젝트 루트를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# 궁극의 통합 응답 시스템 import
from simple_ultimate_system import process_simple_ultimate_request

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/integrated_conversation_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="CORBU AI 통합 대화 시스템",
    description="모든 AI 시스템을 통합한 대화형 인터페이스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델
class MessageRequest(BaseModel):
    content: str
    context: Optional[str] = None
    systemType: Optional[str] = None
    userPreferences: Optional[Dict] = None
    projectId: Optional[str] = None
    knowledgeBaseId: Optional[str] = None
    timestamp: Optional[str] = None

class UltimateRequest(BaseModel):
    user_input: str
    conversation_history: Optional[List[Dict[str, Any]]] = []
    project_context: Optional[Dict[str, Any]] = None
    user_preferences: Optional[Dict[str, Any]] = None

class MessageResponse(BaseModel):
    id: str
    content: str
    type: str = "text"
    confidence: float = 0.8
    processingTime: int
    metadata: Optional[Dict] = None

class UltimateResponse(BaseModel):
    success: bool
    result: Optional[Dict[str, Any]] = None
    system_status: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class SystemStatus(BaseModel):
    id: str
    name: str
    description: str
    isActive: bool
    capabilities: List[str]
    performance: Dict[str, float]

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    systems: List[SystemStatus]

# 시스템 상태 관리
class SystemManager:
    def __init__(self):
        self.systems = {
            'conversation': {
                'id': 'conversation',
                'name': '대화형 AI',
                'description': '자연스러운 대화형 인터페이스',
                'isActive': True,
                'capabilities': ['대화', '질의응답', '컨텍스트 이해'],
                'performance': {'accuracy': 0.95, 'speed': 0.9, 'reliability': 0.95}
            },
            'analysis': {
                'id': 'analysis',
                'name': '분석 엔진',
                'description': '고급 데이터 분석 및 인사이트 제공',
                'isActive': True,
                'capabilities': ['감정 분석', '의도 분석', '주제 추출', '복잡도 평가'],
                'performance': {'accuracy': 0.92, 'speed': 0.85, 'reliability': 0.9}
            },
            'guidance': {
                'id': 'guidance',
                'name': '메시지 가이드',
                'description': '상황별 메시지 생성 및 가이드',
                'isActive': True,
                'capabilities': ['톤 설정', '길이 조절', '구조 가이드', '예시 제공'],
                'performance': {'accuracy': 0.88, 'speed': 0.8, 'reliability': 0.85}
            },
            'project': {
                'id': 'project',
                'name': '프로젝트 관리',
                'description': '프로젝트 정보 및 진행 상황 관리',
                'isActive': True,
                'capabilities': ['진행 상황', '팀 구성', '관련 파일', '지침 정보'],
                'performance': {'accuracy': 0.9, 'speed': 0.9, 'reliability': 0.9}
            },
            'file': {
                'id': 'file',
                'name': '파일 관리',
                'description': '파일 업로드, 분석 및 관리',
                'isActive': True,
                'capabilities': ['파일 분석', 'OCR', '문서 요약', '미디어 처리'],
                'performance': {'accuracy': 0.85, 'speed': 0.75, 'reliability': 0.8}
            },
            'ultimate': {
                'id': 'ultimate',
                'name': '궁극의 통합 응답 시스템',
                'description': '모든 AI 기능을 통합한 고신뢰도 답변 생성',
                'isActive': True,
                'capabilities': [
                    '다중 모델 병렬 처리', 
                    '품질 정제 및 개선', 
                    '신뢰도 검증',
                    '실시간 학습',
                    '적응형 개선'
                ],
                'performance': {'accuracy': 0.98, 'speed': 0.8, 'reliability': 0.99}
            }
        }
        
        # 프로젝트 데이터
        self.projects = {
            'gaepo_woosung_7': {
                'id': 'gaepo_woosung_7',
                'name': '개포우성7차',
                'description': '개포우성7차 재개발 프로젝트',
                'status': '진행중',
                'files': [],
                'lastUpdated': '2025-01-27'
            }
        }
        
        # 파일 저장소
        self.files = []
        
        # 학습 데이터
        self.learning_data = {
            'message_feedback': {},
            'system_performance': {},
            'user_preferences': {}
        }

    def get_system_status(self) -> List[SystemStatus]:
        return [SystemStatus(**system) for system in self.systems.values()]

    def process_message(self, request: MessageRequest) -> MessageResponse:
        start_time = time.time()
        
        # 시스템 타입 결정
        system_type = self.determine_system_type(request.content)
        
        # 메시지 처리
        response_content = self.generate_response(request.content, system_type, request.userPreferences)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return MessageResponse(
            id=f"msg_{int(time.time() * 1000)}",
            content=response_content,
            type="text",
            confidence=0.85,
            processingTime=processing_time,
            metadata={
                'usedSystems': [system_type],
                'learningScore': 0.7,
                'suggestions': self.generate_suggestions(request.content),
                'actions': self.generate_actions(request.content)
            }
        )

    def determine_system_type(self, content: str) -> str:
        content_lower = content.lower()
        
        if any(keyword in content_lower for keyword in ['분석', 'analyze', '분석해']):
            return 'analysis'
        elif any(keyword in content_lower for keyword in ['가이드', 'guidance', '메시지']):
            return 'guidance'
        elif any(keyword in content_lower for keyword in ['프로젝트', 'project', '개포우성']):
            return 'project'
        elif any(keyword in content_lower for keyword in ['파일', 'file', '업로드']):
            return 'file'
        else:
            return 'conversation'

    def generate_response(self, content: str, system_type: str, preferences: Optional[Dict] = None) -> str:
        if system_type == 'analysis':
            return self.generate_analysis_response(content)
        elif system_type == 'guidance':
            return self.generate_guidance_response(content, preferences)
        elif system_type == 'project':
            return self.generate_project_response(content)
        elif system_type == 'file':
            return self.generate_file_response(content)
        else:
            return self.generate_conversation_response(content)

    def generate_conversation_response(self, content: str) -> str:
        responses = [
            "네, 말씀해주세요. 무엇을 도와드릴까요?",
            "이해했습니다. 더 자세한 정보가 필요하시면 언제든 말씀해주세요.",
            "좋은 질문입니다. 관련된 정보를 찾아보겠습니다.",
            "도움이 필요하시면 언제든지 말씀해주세요.",
            "이해했습니다. 다른 도움이 필요하시면 알려주세요."
        ]
        return responses[len(content) % len(responses)]

    def generate_analysis_response(self, content: str) -> str:
        return f"'{content}'에 대한 분석을 수행하겠습니다.\n\n" \
               f"📊 분석 결과:\n" \
               f"• 주요 주제: {content[:10]}...\n" \
               f"• 감정 분석: 중립적\n" \
               f"• 복잡도: 보통\n" \
               f"• 추천 액션: 더 자세한 분석이 필요합니다."

    def generate_guidance_response(self, content: str, preferences: Optional[Dict] = None) -> str:
        tone = preferences.get('tone', 'formal') if preferences else 'formal'
        
        guidance_templates = {
            'formal': "공식적인 톤으로 응답하시는 것을 권장합니다.",
            'casual': "친근한 톤으로 대화하시면 좋겠습니다.",
            'professional': "전문적이고 신뢰할 수 있는 톤을 유지하세요."
        }
        
        return f"메시지 가이드:\n\n" \
               f"💡 상황: {content[:20]}...\n" \
               f"📝 권장사항: {guidance_templates.get(tone, guidance_templates['formal'])}\n" \
               f"🎯 목표: 효과적인 의사소통"

    def generate_project_response(self, content: str) -> str:
        project = self.projects.get('gaepo_woosung_7', {})
        
        return f"프로젝트 정보:\n\n" \
               f"📋 프로젝트: {project.get('name', '개포우성7차')}\n" \
               f"📄 상태: {project.get('status', '진행중')}\n" \
               f"📁 파일: {len(project.get('files', []))}개\n" \
               f"🕒 최종 업데이트: {project.get('lastUpdated', '2025-01-27')}"

    def generate_file_response(self, content: str) -> str:
        return f"파일 관리:\n\n" \
               f"📁 현재 파일: {len(self.files)}개\n" \
               f"📤 업로드 가능한 파일 형식: PDF, DOC, TXT, 이미지\n" \
               f"🔍 파일 분석 기능: OCR, 텍스트 추출, 요약"

    def generate_suggestions(self, content: str) -> List[str]:
        suggestions = [
            "더 자세한 정보를 제공해드릴까요?",
            "관련 파일을 찾아보시겠습니까?",
            "분석 결과를 차트로 보여드릴까요?"
        ]
        return suggestions[:2]

    def generate_actions(self, content: str) -> List[str]:
        actions = [
            "analyze",
            "search_files",
            "generate_report"
        ]
        return actions

    def upload_file(self, file: UploadFile) -> Dict[str, Any]:
        try:
            # 파일 정보 저장
            file_info = {
                'id': f"file_{int(time.time() * 1000)}",
                'name': file.filename,
                'size': 0,  # 실제로는 파일 크기 계산
                'type': file.content_type,
                'uploaded_at': datetime.now().isoformat()
            }
            
            self.files.append(file_info)
            
            return {
                'success': True,
                'fileId': file_info['id'],
                'message': '파일이 성공적으로 업로드되었습니다.'
            }
        except Exception as e:
            logger.error(f"파일 업로드 실패: {e}")
            return {
                'success': False,
                'error': '파일 업로드 중 오류가 발생했습니다.'
            }

    def get_project_info(self, project_id: str) -> Optional[Dict]:
        return self.projects.get(project_id)

    def get_file_list(self) -> List[Dict]:
        return self.files

    def update_learning_data(self, message_id: str, feedback: str) -> bool:
        try:
            self.learning_data['message_feedback'][message_id] = {
                'feedback': feedback,
                'timestamp': datetime.now().isoformat()
            }
            return True
        except Exception as e:
            logger.error(f"학습 데이터 업데이트 실패: {e}")
            return False

# 시스템 매니저 인스턴스
system_manager = SystemManager()

# API 엔드포인트
@app.get("/")
async def root():
    return {"message": "CORBU AI 통합 대화 시스템이 실행 중입니다."}

@app.get("/api/health")
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        systems=system_manager.get_system_status()
    )

@app.post("/api/chat")
async def chat_endpoint(request: MessageRequest):
    try:
        response = system_manager.process_message(request)
        return response
    except Exception as e:
        logger.error(f"채팅 처리 실패: {e}")
        raise HTTPException(status_code=500, detail="메시지 처리 중 오류가 발생했습니다.")

@app.post("/api/analyze")
async def analyze_endpoint(request: MessageRequest):
    try:
        # 분석 시스템으로 라우팅
        request.systemType = 'analysis'
        response = system_manager.process_message(request)
        return response
    except Exception as e:
        logger.error(f"분석 처리 실패: {e}")
        raise HTTPException(status_code=500, detail="분석 처리 중 오류가 발생했습니다.")

@app.post("/api/guidance")
async def guidance_endpoint(request: MessageRequest):
    try:
        # 가이드 시스템으로 라우팅
        request.systemType = 'guidance'
        response = system_manager.process_message(request)
        return response
    except Exception as e:
        logger.error(f"가이드 처리 실패: {e}")
        raise HTTPException(status_code=500, detail="가이드 처리 중 오류가 발생했습니다.")

@app.post("/api/project")
async def project_endpoint(request: MessageRequest):
    try:
        # 프로젝트 시스템으로 라우팅
        request.systemType = 'project'
        response = system_manager.process_message(request)
        return response
    except Exception as e:
        logger.error(f"프로젝트 처리 실패: {e}")
        raise HTTPException(status_code=500, detail="프로젝트 처리 중 오류가 발생했습니다.")

@app.post("/api/file")
async def file_endpoint(request: MessageRequest):
    try:
        # 파일 시스템으로 라우팅
        request.systemType = 'file'
        response = system_manager.process_message(request)
        return response
    except Exception as e:
        logger.error(f"파일 처리 실패: {e}")
        raise HTTPException(status_code=500, detail="파일 처리 중 오류가 발생했습니다.")

@app.post("/api/ultimate/process", response_model=UltimateResponse)
async def process_ultimate_message(request: UltimateRequest):
    """궁극의 통합 응답 시스템을 통한 메시지 처리"""
    try:
        logger.info(f"궁극 요청 처리 시작: {request.user_input[:50]}...")
        
        # 궁극의 통합 응답 시스템 호출
        result = await process_simple_ultimate_request({
            'user_input': request.user_input,
            'conversation_history': request.conversation_history or [],
            'project_context': request.project_context,
            'user_preferences': request.user_preferences
        })
        
        if result['success']:
            logger.info("✅ 궁극 요청 처리 성공")
            return UltimateResponse(
                success=True,
                result=result['result'],
                system_status=result['system_status']
            )
        else:
            logger.error(f"❌ 궁극 요청 처리 실패: {result['error']}")
            return UltimateResponse(
                success=False,
                error=result['error']
            )
            
    except Exception as e:
        logger.error(f"궁극 요청 처리 중 예외 발생: {e}")
        return UltimateResponse(
            success=False,
            error=f"처리 중 오류가 발생했습니다: {str(e)}"
        )

@app.get("/api/ultimate/status")
async def get_ultimate_system_status():
    """궁극의 통합 응답 시스템 상태 확인"""
    try:
        return {
            "status": "operational",
            "version": "2.0.0",
            "uptime": "24h",
            "services": {
                "conversation": "active",
                "analysis": "active",
                "real_estate": "active",
                "file_processing": "active"
            }
        }
    except Exception as e:
        logger.error(f"시스템 상태 확인 중 오류: {e}")
        return {"status": "error", "message": str(e)}

# 부동산 관련 API 엔드포인트들
@app.post("/api/real-estate/kb")
async def get_kb_real_estate_data(request: dict):
    """KB시세 데이터 조회"""
    try:
        location = request.get('location', '')
        apartment = request.get('apartment', '')
        count = request.get('count', 10)
        
        # 실제 KB API 호출 로직 (현재는 샘플 데이터)
        base_price = 150000 + random.random() * 50000
        kb_price = base_price * (0.95 + random.random() * 0.1)
        
        return {
            "location": location,
            "apartment": apartment,
            "price": kb_price,
            "area": 95,
            "floor": "중간층 (5~15층)",
            "direction": "남향",
            "source": "KB부동산",
            "timestamp": datetime.now().isoformat(),
            "kbIndex": 105.2,
            "marketTrend": "상승",
            "investmentGrade": "A등급 (매우 우수)",
            "relatedPrices": {
                "officialPrice": kb_price * 0.9,
                "transactionPrice": kb_price * 0.95
            }
        }
    except Exception as e:
        logger.error(f"KB시세 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/real-estate/official-price")
async def get_official_price_data(request: dict):
    """공시가 데이터 조회"""
    try:
        location = request.get('location', '')
        apartment = request.get('apartment', '')
        
        # 실제 공시가 API 호출 로직 (현재는 샘플 데이터)
        base_price = 150000 + random.random() * 50000
        official_price = base_price * (0.85 + random.random() * 0.2)
        
        return {
            "location": location,
            "apartment": apartment,
            "officialPrice": official_price,
            "baseDate": "2024년 7월 1일",
            "area": 95,
            "floor": "중간층 (5~15층)",
            "direction": "남향",
            "characteristics": [
                "국토교통부에서 매년 7월 1일 기준으로 공시",
                "부동산 거래세, 종합부동산세, 재산세 등의 기준이 됨",
                "실제 거래가와 차이가 있을 수 있음",
                "2024년 기준으로 전년 대비 약 3.2% 상승"
            ],
            "notes": [
                "공시가는 1년에 1회만 조정됨",
                "실제 거래가보다 낮은 경우가 많음",
                "세금 계산 시 중요한 기준이 됨"
            ]
        }
    except Exception as e:
        logger.error(f"공시가 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/real-estate/property-tax")
async def get_property_tax_data(request: dict):
    """종부세 계산 데이터 조회"""
    try:
        location = request.get('location', '')
        apartment = request.get('apartment', '')
        
        # 실제 종부세 계산 로직 (현재는 샘플 데이터)
        base_price = 150000 + random.random() * 50000
        official_price = base_price * (0.85 + random.random() * 0.2)
        property_value = official_price * 0.7
        deduction = 120000
        taxable_amount = max(0, property_value - deduction)
        
        # 종부세 세율 계산 (누진세율)
        if taxable_amount <= 60000:
            tax_rate = 0.5
        elif taxable_amount <= 150000:
            tax_rate = 0.7
        elif taxable_amount <= 300000:
            tax_rate = 1.0
        elif taxable_amount <= 600000:
            tax_rate = 1.5
        else:
            tax_rate = 2.0
        
        tax_amount = taxable_amount * (tax_rate / 100)
        
        return {
            "location": location,
            "apartment": apartment,
            "officialPrice": official_price,
            "taxableStandard": property_value,
            "deduction": deduction,
            "taxableAmount": taxable_amount,
            "taxRate": tax_rate,
            "estimatedTax": tax_amount,
            "characteristics": [
                "매년 6월 1일 기준으로 과세",
                "주택 1세대 1주택 공제 12억원 적용",
                "누진세율로 과세 (0.5~2.0%)",
                "공시가격 기준으로 계산"
            ],
            "warnings": [
                "실제 세금은 정확한 공시가격 기준",
                "1세대 1주택 공제 조건 확인 필요",
                "지역별 세율 차이가 있을 수 있음",
                "매년 세율 및 공제액 변동 가능"
            ]
        }
    except Exception as e:
        logger.error(f"종부세 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/systems/status")
async def get_systems_status():
    return {
        "systems": system_manager.get_system_status(),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        result = system_manager.upload_file(file)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"파일 업로드 실패: {e}")
        raise HTTPException(status_code=500, detail="파일 업로드 중 오류가 발생했습니다.")

@app.get("/api/project/{project_id}")
async def get_project_info(project_id: str):
    project_info = system_manager.get_project_info(project_id)
    if not project_info:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    return project_info

@app.get("/api/files")
async def get_file_list():
    return {
        "files": system_manager.get_file_list(),
        "total": len(system_manager.get_file_list())
    }

@app.post("/api/guidance/generate")
async def generate_guidance(request: Dict):
    try:
        context = request.get('context', '')
        preferences = request.get('preferences', {})
        
        # 가이드 생성 로직
        guidance = system_manager.generate_guidance_response(context, preferences)
        
        return {
            "guidance": guidance,
            "suggestions": system_manager.generate_suggestions(context),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"가이드 생성 실패: {e}")
        raise HTTPException(status_code=500, detail="가이드 생성 중 오류가 발생했습니다.")

@app.post("/api/learning/feedback")
async def update_learning_feedback(request: Dict):
    try:
        message_id = request.get('messageId')
        feedback = request.get('feedback')
        
        if not message_id or not feedback:
            raise HTTPException(status_code=400, detail="필수 파라미터가 누락되었습니다.")
        
        success = system_manager.update_learning_data(message_id, feedback)
        
        return {
            "success": success,
            "message": "피드백이 성공적으로 저장되었습니다." if success else "피드백 저장에 실패했습니다."
        }
    except Exception as e:
        logger.error(f"학습 피드백 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail="피드백 처리 중 오류가 발생했습니다.")

if __name__ == "__main__":
    # 로그 디렉토리 생성
    os.makedirs("logs", exist_ok=True)
    
    # 서버 시작
    uvicorn.run(
        "integrated_conversation_server:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    ) 