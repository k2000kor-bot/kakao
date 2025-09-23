#!/usr/bin/env python3
"""
간단한 테스트 서버
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Test Server",
    description="간단한 테스트 서버",
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

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "default"

class TestAIEngine:
    """테스트 AI 엔진"""
    
    def __init__(self):
        self.conversation_history = []
        logger.info("테스트 AI 엔진 초기화 완료")
    
    async def generate_response(self, message: str, user_id: str) -> str:
        """응답 생성"""
        logger.info(f"응답 생성 요청: {message[:50]}...")
        
        # 간단한 키워드 기반 응답
        if "정치" in message:
            response = """그런데 말이죠, 여러분이 제기하신 질문에 대해 말씀드리겠습니다.

## 🧠 심층 분석

정치는 권력의 문제가 아니라 시민들이 어떻게 함께 살아갈 것인가의 문제입니다.

여기서 중요한 것은 단순히 문제를 인식하는 것만으로는 충분하지 않다는 점입니다.

## 💡 핵심 통찰

정치에 대해 체계적으로 접근해보면, 다음과 같은 관점들이 중요합니다:

1. **근본적 이해**: 정치의 본질을 파악하는 것이 우선입니다.
2. **다각도 분석**: 여러 관점에서 접근하여 종합적인 이해를 제공합니다.
3. **실용적 해결**: 이론과 실무를 결합한 구체적인 방안을 제시합니다.

## 🔍 상세 분석

정치에 대한 우리의 이해는 역사적 맥락 속에서 더욱 깊어집니다.

과거의 경험들이 현재 우리가 직면한 문제들에 대한 통찰을 제공해주기 때문입니다.

## 🎯 구체적 제안

정치에 대한 해결 방안을 단계적으로 제시해드리겠습니다:

1. **시민 참여를 통한 정치 개혁**: 구체적인 실행 방안과 기대 효과
2. **투명하고 책임감 있는 정치 문화 조성**: 구체적인 실행 방안과 기대 효과
3. **장기적 비전을 가진 정책 수립**: 구체적인 실행 방안과 기대 효과

## 🌟 결론

그래서 제가 말씀드리고 싶은 것은, 정치에 대한 우리의 이해는 이런 다양한 관점들을 종합할 때 더욱 풍부해집니다.

그런데 여러분은 어떻게 생각하시나요? 이런 관점들이 정치에 대한 여러분의 이해에 어떤 도움이 되었는지 궁금합니다.

함께 생각하고 토론하는 과정에서 우리는 더 나은 답을 찾아갈 수 있을 것입니다.

---
*유시민 스타일로 학습한 고급 AI 시스템이 제공하는 종합적 분석*"""
        
        elif "경제" in message:
            response = """그런데 말이죠, 여러분이 제기하신 질문에 대해 말씀드리겠습니다.

## 🧠 심층 분석

경제는 숫자의 문제가 아니라 사람의 문제입니다.

GDP가 높아도 사람들이 행복하지 않다면 그 경제는 실패한 것입니다.

## 💡 핵심 통찰

경제에 대해 체계적으로 접근해보면, 다음과 같은 관점들이 중요합니다:

1. **근본적 이해**: 경제의 본질을 파악하는 것이 우선입니다.
2. **다각도 분석**: 여러 관점에서 접근하여 종합적인 이해를 제공합니다.
3. **실용적 해결**: 이론과 실무를 결합한 구체적인 방안을 제시합니다.

## 🔍 상세 분석

경제에 대한 우리의 이해는 역사적 맥락 속에서 더욱 깊어집니다.

과거의 경험들이 현재 우리가 직면한 문제들에 대한 통찰을 제공해주기 때문입니다.

## 🎯 구체적 제안

경제에 대한 해결 방안을 단계적으로 제시해드리겠습니다:

1. **포용적 성장을 통한 경제 발전**: 구체적인 실행 방안과 기대 효과
2. **지속 가능한 경제 모델 구축**: 구체적인 실행 방안과 기대 효과
3. **소득 불평등 해소를 위한 정책**: 구체적인 실행 방안과 기대 효과

## 🌟 결론

그래서 제가 말씀드리고 싶은 것은, 경제에 대한 우리의 이해는 이런 다양한 관점들을 종합할 때 더욱 풍부해집니다.

그런데 여러분은 어떻게 생각하시나요? 이런 관점들이 경제에 대한 여러분의 이해에 어떤 도움이 되었는지 궁금합니다.

함께 생각하고 토론하는 과정에서 우리는 더 나은 답을 찾아갈 수 있을 것입니다.

---
*유시민 스타일로 학습한 고급 AI 시스템이 제공하는 종합적 분석*"""
        
        else:
            response = f"""그런데 말이죠, 여러분이 제기하신 질문에 대해 말씀드리겠습니다.

## 🧠 심층 분석

"{message}"에 대해 다각도로 분석해보겠습니다.

## 💡 핵심 통찰

1. **문제의 본질**: {message}의 핵심을 파악하기 위해 근본적인 접근이 필요합니다.
2. **다양한 관점**: 여러 관점에서 접근하여 종합적인 이해를 제공합니다.
3. **실용적 해결책**: 이론과 실무를 결합한 구체적인 방안을 제시합니다.

## 🔍 상세 분석

{message}에 대한 분석을 통해 다음과 같은 인사이트를 제공합니다:

- **구조적 분석**: 문제의 구조와 패턴을 파악
- **역사적 맥락**: 과거의 경험과 현재의 상황을 연결
- **미래적 전망**: 변화하는 환경에 대한 대응 방안

## 🎯 구체적 제안

1. **단기적 접근**: 즉시 실행 가능한 구체적 방안
2. **중기적 전략**: 체계적이고 지속 가능한 전략
3. **장기적 비전**: 미래 지향적인 비전과 목표

## 🌟 결론

{message}에 대한 종합적 분석을 통해 귀하에게 최적의 답변을 제공했습니다.

이러한 접근 방식은 단순한 답변이 아닌, 깊이 있는 통찰과 실용적인 해결책을 제공합니다.

---
*고급 AI 시스템이 제공하는 지능형 서비스*"""
        
        # 대화 히스토리 저장
        self.conversation_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "message": message,
            "response": response
        })
        
        logger.info(f"응답 생성 완료: {len(response)}자")
        return response
    
    def get_status(self) -> Dict[str, Any]:
        """시스템 상태 조회"""
        return {
            "status": "healthy",
            "conversation_count": len(self.conversation_history),
            "last_conversation": self.conversation_history[-1] if self.conversation_history else None,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# AI 엔진 인스턴스
ai_engine = TestAIEngine()

@app.get("/")
async def root():
    return {
        "message": "Test Server",
        "version": "1.0.0",
        "status": "running",
        "conversation_count": len(ai_engine.conversation_history),
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "conversation_count": len(ai_engine.conversation_history)
    }

@app.post("/api/chat")
async def chat_endpoint(chat_data: ChatMessage):
    """채팅 엔드포인트"""
    try:
        logger.info(f"채팅 요청: {chat_data.message[:50]}...")
        
        response = await ai_engine.generate_response(
            chat_data.message,
            chat_data.user_id
        )
        
        return {
            "success": True,
            "response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"채팅 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """시스템 상태 조회"""
    try:
        status = ai_engine.get_status()
        return status
    except Exception as e:
        logger.error(f"상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info("🚀 테스트 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )