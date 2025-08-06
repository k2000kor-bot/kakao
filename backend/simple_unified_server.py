#!/usr/bin/env python3
"""
간단한 통합 메시지 서버
안정적인 실행을 위한 최소한의 기능만 포함
"""

import json
import random
import time
from datetime import datetime
from typing import Dict, List, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# FastAPI 앱 생성
app = FastAPI(
    title="간단한 통합 메시지 시스템",
    description="안정적인 메시지 생성 시스템",
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
class MessageFormatRequest(BaseModel):
    format_type: str
    original_message: str
    context: str = ""
    recent_messages: List[Dict[str, Any]] = []

class MessageFormat:
    """메시지 형식 생성기"""
    
    def __init__(self):
        self.formats = {
            "반박": self._generate_refutation,
            "반문": self._generate_counter_question,
            "반대": self._generate_opposition,
            "동조": self._generate_agreement,
            "응호": self._generate_defense,
            "비난": self._generate_criticism,
            "중립": self._generate_neutral,
            "회피": self._generate_avoidance,
            "풍자": self._generate_sarcasm,
            "공감": self._generate_empathy,
            "제안": self._generate_suggestion,
            "질문": self._generate_questioning,
            "무시": self._generate_ignoring,
            "강조": self._generate_emphasis,
            "추측": self._generate_speculation,
            "감정적호소": self._generate_emotional_appeal,
            "조롱": self._generate_mockery,
            "명령": self._generate_directive,
            "강압": self._generate_coercion,
            "강제": self._generate_forcefulness,
            "세뇌": self._generate_brainwashing,
            "가스라이팅": self._generate_gaslighting
        }
    
    def generate_formatted_message(self, format_type: str, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """선택된 형식에 따른 메시지 생성"""
        if format_type in self.formats:
            return self.formats[format_type](context, recent_messages)
        else:
            return self._generate_neutral(context, recent_messages)
    
    def _generate_refutation(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """반박 형식"""
        responses = [
            "그런 주장은 근거가 부족해요",
            "실제로는 그렇지 않을 것 같아요",
            "그건 잘못된 생각이에요",
            "사실과 다르네요",
            "그런 말은 성립하지 않아요",
            "그건 논리적으로 맞지 않아요",
            "실제 상황과는 다를 것 같아요",
            "그런 주장은 문제가 있어요"
        ]
        return random.choice(responses)
    
    def _generate_counter_question(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """반문 형식"""
        responses = [
            "그런 근거가 있나요?",
            "정말 그런가요?",
            "어떻게 그런 결론을 내리셨나요?",
            "그건 어떻게 알 수 있나요?",
            "실제로 확인해보셨나요?",
            "그런 말씀의 근거는 뭔가요?",
            "정말 그럴까요?",
            "어떤 기준으로 그렇게 생각하시나요?"
        ]
        return random.choice(responses)
    
    def _generate_opposition(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """반대 형식"""
        responses = [
            "저는 반대합니다",
            "그건 동의할 수 없어요",
            "저는 그렇게 생각하지 않아요",
            "그건 맞지 않아요",
            "저는 다른 의견이에요",
            "그건 문제가 있어요",
            "저는 그렇게 하지 않을 것 같아요",
            "그건 옳지 않아요"
        ]
        return random.choice(responses)
    
    def _generate_agreement(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """동조 형식"""
        responses = [
            "저도 동감합니다",
            "맞습니다",
            "저도 그렇게 생각해요",
            "동감합니다",
            "그렇네요",
            "저도 그렇게 봐요",
            "맞는 말씀이에요",
            "저도 동의합니다"
        ]
        return random.choice(responses)
    
    def _generate_defense(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """응호 형식"""
        responses = [
            "그건 옳은 선택이에요",
            "그렇게 하는 게 맞아요",
            "그건 정말 좋은 생각이에요",
            "그렇게 해야 해요",
            "그건 당연한 거예요",
            "그렇게 하는 게 최선이에요",
            "그건 올바른 판단이에요",
            "그렇게 해야 합니다"
        ]
        return random.choice(responses)
    
    def _generate_criticism(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """비난 형식"""
        responses = [
            "그건 정말 문제가 있어요",
            "그런 생각은 위험해요",
            "그건 잘못된 접근이에요",
            "그런 방식은 안 돼요",
            "그건 실패할 거예요",
            "그런 생각은 버리세요",
            "그건 문제가 많아요",
            "그런 건 안 돼요"
        ]
        return random.choice(responses)
    
    def _generate_neutral(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """중립 형식"""
        responses = [
            "그런 상황이군요",
            "알겠습니다",
            "그렇네요",
            "그런 일이 있었군요",
            "그런 상황이에요",
            "그런 말씀이시군요",
            "그런 일이 있었네요",
            "그런 상황이군요"
        ]
        return random.choice(responses)
    
    def _generate_avoidance(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """회피 형식"""
        responses = [
            "그런 건 잘 모르겠어요",
            "그건 생각해봐야겠어요",
            "그런 건 나중에 말씀드릴게요",
            "그건 좀 더 생각해보고요",
            "그런 건 잘 모르겠네요",
            "그건 좀 더 알아보고요",
            "그런 건 나중에요",
            "그건 생각해보겠어요"
        ]
        return random.choice(responses)
    
    def _generate_sarcasm(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """풍자 형식"""
        responses = [
            "정말 대단하시네요",
            "와, 정말 좋은 생각이에요",
            "정말 훌륭한 아이디어네요",
            "와, 정말 대단해요",
            "정말 멋진 생각이에요",
            "와, 정말 훌륭하시네요",
            "정말 좋은 제안이에요",
            "와, 정말 대단한 생각이에요"
        ]
        return random.choice(responses)
    
    def _generate_empathy(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """공감 형식"""
        responses = [
            "그런 마음 이해해요",
            "그런 기분이 드시겠어요",
            "그런 상황이 힘드셨겠어요",
            "그런 생각이 드시는 게 당연해요",
            "그런 기분이 드시겠네요",
            "그런 상황이 어려우셨겠어요",
            "그런 마음이 드시는 게 자연스러워요",
            "그런 기분이 드시겠어요"
        ]
        return random.choice(responses)
    
    def _generate_suggestion(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """제안 형식"""
        responses = [
            "그런 방법은 어떨까요?",
            "이렇게 해보시는 건 어떨까요?",
            "다른 방법을 생각해보시는 건 어떨까요?",
            "이런 방식을 시도해보시는 건 어떨까요?",
            "그런 방법도 있어요",
            "이렇게 해보시는 건 어떨까요?",
            "다른 접근을 해보시는 건 어떨까요?",
            "이런 방법을 고려해보시는 건 어떨까요?"
        ]
        return random.choice(responses)
    
    def _generate_questioning(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """질문 형식"""
        responses = [
            "그런 건 어떻게 되나요?",
            "그런 상황이 언제인가요?",
            "그런 건 왜 그런가요?",
            "그런 일이 언제 있었나요?",
            "그런 건 어떻게 알 수 있나요?",
            "그런 상황이 왜 그런가요?",
            "그런 건 언제부터인가요?",
            "그런 일이 어떻게 된 건가요?"
        ]
        return random.choice(responses)
    
    def _generate_ignoring(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """무시 형식"""
        responses = [
            "...",
            "ㅎ",
            "그렇군요",
            "알겠어요",
            "그런가요",
            "그렇네요",
            "그런 일이 있었군요",
            "그런 상황이군요"
        ]
        return random.choice(responses)
    
    def _generate_emphasis(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """강조 형식"""
        responses = [
            "정말 중요한 건 그게 아니에요",
            "핵심은 그게 아니라요",
            "가장 중요한 건 그거예요",
            "중요한 건 그게 아니에요",
            "실제로 중요한 건 그거예요",
            "진짜 중요한 건 그게 아니에요",
            "핵심은 그게 아니라요",
            "가장 중요한 건 그거예요"
        ]
        return random.choice(responses)
    
    def _generate_speculation(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """추측 형식"""
        responses = [
            "아마 그럴 것 같아요",
            "그런 것 같아요",
            "아마 그럴 것 같습니다",
            "그런 것 같네요",
            "아마 그럴 것 같아요",
            "그런 것 같습니다",
            "아마 그럴 것 같네요",
            "그런 것 같아요"
        ]
        return random.choice(responses)
    
    def _generate_emotional_appeal(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """감정적 호소 형식"""
        responses = [
            "정말 그렇게 하면 안 돼요",
            "그렇게 하면 정말 안 돼요",
            "정말 그런 건 안 돼요",
            "그렇게 하면 정말 문제가 있어요",
            "정말 그런 건 안 됩니다",
            "그렇게 하면 정말 안 됩니다",
            "정말 그런 건 안 돼요",
            "그렇게 하면 정말 문제가 있어요"
        ]
        return random.choice(responses)
    
    def _generate_mockery(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """조롱 형식"""
        responses = [
            "정말 대단하시네요 ㅎ",
            "와, 정말 좋은 생각이에요 ㅋ",
            "정말 훌륭한 아이디어네요 ㅎ",
            "와, 정말 대단해요 ㅋ",
            "정말 멋진 생각이에요 ㅎ",
            "와, 정말 훌륭하시네요 ㅋ",
            "정말 좋은 제안이에요 ㅎ",
            "와, 정말 대단한 생각이에요 ㅋ"
        ]
        return random.choice(responses)
    
    def _generate_directive(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """명령 형식"""
        responses = [
            "그렇게 하세요",
            "그렇게 해야 해요",
            "그렇게 하시기 바랍니다",
            "그렇게 해야 합니다",
            "그렇게 하세요",
            "그렇게 해야 해요",
            "그렇게 하시기 바랍니다",
            "그렇게 해야 합니다"
        ]
        return random.choice(responses)
    
    def _generate_coercion(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """강압 형식"""
        responses = [
            "그렇게 안 하면 안 돼요",
            "그렇게 안 하면 문제가 있어요",
            "그렇게 안 하면 안 됩니다",
            "그렇게 안 하면 문제가 생겨요",
            "그렇게 안 하면 안 돼요",
            "그렇게 안 하면 문제가 있어요",
            "그렇게 안 하면 안 됩니다",
            "그렇게 안 하면 문제가 생겨요"
        ]
        return random.choice(responses)
    
    def _generate_forcefulness(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """강제 형식"""
        responses = [
            "그렇게 해야만 해요",
            "그렇게 해야만 합니다",
            "그렇게 해야만 돼요",
            "그렇게 해야만 됩니다",
            "그렇게 해야만 해요",
            "그렇게 해야만 합니다",
            "그렇게 해야만 돼요",
            "그렇게 해야만 됩니다"
        ]
        return random.choice(responses)
    
    def _generate_brainwashing(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """세뇌 형식"""
        responses = [
            "그런 생각이 옳은 거예요",
            "그런 생각이 맞는 거예요",
            "그런 생각이 정답이에요",
            "그런 생각이 올바른 거예요",
            "그런 생각이 옳은 거예요",
            "그런 생각이 맞는 거예요",
            "그런 생각이 정답이에요",
            "그런 생각이 올바른 거예요"
        ]
        return random.choice(responses)
    
    def _generate_gaslighting(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """가스라이팅 형식"""
        responses = [
            "그런 건 없었어요",
            "그런 일은 없었어요",
            "그런 건 기억이 안 나요",
            "그런 일은 없었습니다",
            "그런 건 없었어요",
            "그런 일은 없었어요",
            "그런 건 기억이 안 나요",
            "그런 일은 없었습니다"
        ]
        return random.choice(responses)

# 전역 인스턴스
message_generator = MessageFormat()

# API 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "간단한 통합 메시지 시스템",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "healthy",
        "services": {
            "message_format": "running",
            "message_generation": "running"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/message-formats")
async def get_message_formats():
    """사용 가능한 메시지 형식 목록 반환"""
    formats = {
        "반박": "상대 주장의 오류나 약점을 지적하며 부정",
        "반문": "상대의 주장에 질문을 던져 되묻는 방식",
        "반대": "명확하게 의견을 거부하거나 부정",
        "동조": "상대 의견에 동의하거나 지지",
        "응호": "특정 입장이나 대상을 적극적으로 옹호",
        "비난": "강하게 부정적 평가나 공격",
        "중립": "감정이나 입장 없이 상황만 설명",
        "회피": "명확한 입장을 회피하거나 대화를 흐림",
        "풍자": "비꼬거나 간접적으로 비판",
        "공감": "상대 감정을 이해하고 수용",
        "제안": "해결책이나 대안을 제시",
        "질문": "정보를 얻거나 의문을 던짐",
        "무시": "반응하지 않거나 대화를 거부",
        "강조": "특정 사실이나 의견을 부각",
        "추측": "확실하지 않은 의견을 조심스럽게 제시",
        "감정적호소": "논리보다 감정에 기반해 설득",
        "조롱": "상대를 비웃거나 깎아내림",
        "명령": "지시하거나 강제하는 어투",
        "강압": "위협, 압박을 통해 상대를 설득",
        "강제": "선택권을 주지 않고 특정 행동을 요구",
        "세뇌": "장기간 반복·왜곡으로 판단력을 마비시킴",
        "가스라이팅": "상대의 현실 인식을 부정하거나 조작해 혼란을 유도"
    }
    
    return {
        "success": True,
        "formats": formats
    }

@app.post("/api/generate-formatted-message")
async def generate_formatted_message(request: MessageFormatRequest):
    """선택된 메시지 형식에 따른 메시지 생성"""
    try:
        formatted_message = message_generator.generate_formatted_message(
            request.format_type,
            request.context,
            request.recent_messages
        )
        
        return {
            "success": True,
            "message": {
                "id": f"formatted_msg_{int(time.time())}_{random.randint(1000, 9999)}",
                "original_message": request.original_message,
                "format_type": request.format_type,
                "generated_message": formatted_message,
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"메시지 생성 실패: {str(e)}"
        }

@app.get("/api/test")
async def test_endpoint():
    """테스트 엔드포인트"""
    return {
        "message": "서버가 정상적으로 작동하고 있습니다!",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    print("🚀 간단한 통합 메시지 시스템 시작 중...")
    uvicorn.run(
        "simple_unified_server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    ) 