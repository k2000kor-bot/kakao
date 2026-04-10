#!/usr/bin/env python3
"""
연구용 고급 메시지 생성 시스템 v1.0
- 기존 프로젝트 자동분류 시스템과 연동
- 다양한 메시지 생성 기법 연구
- 설득력 강화 알고리즘 분석
- 심리학적 접근법 연구
- 소통 효과성 측정
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import json
import sqlite3
from datetime import datetime
import logging
import asyncio
from collections import defaultdict
import numpy as np
import re

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="연구용 고급 메시지 생성 시스템", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 데이터 모델들 ====================

class MessageGenerationRequest(BaseModel):
    """메시지 생성 요청"""
    project_id: str
    target_situation: str
    generation_strategy: str  # "logical", "emotional", "psychological", "hybrid"
    intensity_level: int = 3  # 1-5 (연구용 강도 조절)
    target_audience: str = "general"
    context_factors: Dict[str, Any] = {}
    research_parameters: Dict[str, Any] = {}

class AdvancedMessage(BaseModel):
    """고급 메시지"""
    message_id: str
    content: str
    strategy_used: str
    psychological_elements: List[str]
    persuasion_techniques: List[str]
    effectiveness_score: float
    research_analysis: Dict[str, Any]
    generation_time: str

# ==================== 핵심 연구 시스템 ====================

class MessageResearchEngine:
    """메시지 연구 엔진"""
    
    def __init__(self):
        self.db_path = "project_media_system.db"
        self.research_data = self._initialize_research_data()
        self.generation_history = []
    
    def _initialize_research_data(self) -> Dict[str, Any]:
        """연구 데이터 초기화"""
        
        return {
            "psychological_techniques": {
                "cognitive_biases": {
                    "confirmation_bias": {
                        "description": "기존 믿음을 확인하는 정보 선호",
                        "application": "상대방의 기존 견해와 일치하는 논리 제시",
                        "triggers": ["이미 알고 계시겠지만", "예상하셨겠지만", "당연히"],
                        "effectiveness": 0.75
                    },
                    "authority_bias": {
                        "description": "권위있는 출처의 정보를 더 신뢰",
                        "application": "전문가, 기관, 법적근거 인용",
                        "triggers": ["전문가들에 따르면", "법적으로", "공식적으로"],
                        "effectiveness": 0.80
                    },
                    "social_proof": {
                        "description": "다른 사람들의 행동을 따르려는 경향",
                        "application": "다수의 의견이나 행동 사례 제시",
                        "triggers": ["대부분의 조합원들이", "일반적으로", "많은 분들이"],
                        "effectiveness": 0.70
                    },
                    "loss_aversion": {
                        "description": "손실에 대한 민감성이 이득보다 높음",
                        "application": "현재 상황의 위험성 강조",
                        "triggers": ["놓치게 되면", "위험할 수 있습니다", "손해를 볼 수"],
                        "effectiveness": 0.85
                    }
                },
                "persuasion_principles": {
                    "reciprocity": {
                        "description": "받은 것에 대해 갚으려는 심리",
                        "application": "먼저 양보나 배려를 보여주기",
                        "patterns": ["귀하의 입장을 충분히 이해하므로", "배려해드리고자"],
                        "effectiveness": 0.75
                    },
                    "commitment": {
                        "description": "자신의 약속과 일치하려는 경향",
                        "application": "상대방의 이전 발언이나 약속 상기",
                        "patterns": ["이전에 말씀하신 대로", "합의했던 내용에 따라"],
                        "effectiveness": 0.80
                    },
                    "scarcity": {
                        "description": "희소한 것에 대한 가치 인식 증가",
                        "application": "기회의 한정성이나 시급성 강조",
                        "patterns": ["이번 기회를 놓치면", "한정된 시간", "마지막 기회"],
                        "effectiveness": 0.75
                    }
                },
                "emotional_appeals": {
                    "fear_appeal": {
                        "description": "두려움을 통한 행동 유도",
                        "application": "부정적 결과 시나리오 제시",
                        "intensity_levels": {
                            1: "약간의 우려 표현",
                            3: "구체적 위험 시나리오",
                            5: "심각한 결과 경고"
                        },
                        "effectiveness": 0.70
                    },
                    "hope_appeal": {
                        "description": "희망과 긍정적 전망 제시",
                        "application": "성공적 결과 비전 제시",
                        "intensity_levels": {
                            1: "소극적 긍정 표현",
                            3: "구체적 이익 제시",
                            5: "이상적 결과 강조"
                        },
                        "effectiveness": 0.75
                    },
                    "empathy_connection": {
                        "description": "감정적 공감대 형성",
                        "application": "상대방의 감정 상태 인정 및 공감",
                        "patterns": ["충분히 이해됩니다", "같은 마음입니다", "공감합니다"],
                        "effectiveness": 0.80
                    }
                }
            },
            "linguistic_techniques": {
                "framing_effects": {
                    "positive_framing": {
                        "description": "긍정적 측면으로 상황 재구성",
                        "examples": ["기회", "발전", "개선", "성장"],
                        "effectiveness": 0.70
                    },
                    "negative_framing": {
                        "description": "부정적 결과 방지 관점으로 구성",
                        "examples": ["손실 방지", "위험 회피", "문제 해결"],
                        "effectiveness": 0.75
                    }
                },
                "rhetorical_devices": {
                    "repetition": {
                        "description": "핵심 메시지 반복으로 강조",
                        "application": "중요한 포인트를 다양한 방식으로 반복",
                        "effectiveness": 0.65
                    },
                    "analogy": {
                        "description": "이해하기 쉬운 비유 사용",
                        "application": "복잡한 상황을 친숙한 예시로 설명",
                        "effectiveness": 0.70
                    },
                    "rhetorical_questions": {
                        "description": "생각을 유도하는 질문",
                        "application": "상대방이 스스로 결론에 도달하도록 유도",
                        "effectiveness": 0.75
                    }
                }
            },
            "contextual_factors": {
                "audience_analysis": {
                    "decision_makers": {
                        "characteristics": ["논리적", "데이터 중시", "위험 회피"],
                        "preferred_approach": "객관적 근거와 리스크 분석"
                    },
                    "stakeholders": {
                        "characteristics": ["감정적", "관계 중시", "공정성 중시"],
                        "preferred_approach": "공감과 상호 이익 강조"
                    },
                    "general_public": {
                        "characteristics": ["단순명료 선호", "감정적 반응", "사회적 증거 중시"],
                        "preferred_approach": "간단하고 감정적 어필"
                    }
                },
                "situation_types": {
                    "conflict_resolution": {
                        "key_elements": ["중재", "타협", "상호 이익"],
                        "avoid_elements": ["대립", "비난", "극단적 표현"]
                    },
                    "negotiation": {
                        "key_elements": ["교환", "조건", "대안"],
                        "avoid_elements": ["일방적 요구", "감정적 반응"]
                    },
                    "persuasion": {
                        "key_elements": ["논리", "감정", "신뢰"],
                        "avoid_elements": ["강요", "위협", "과장"]
                    }
                }
            }
        }
    
    async def generate_advanced_message(self, request: MessageGenerationRequest) -> AdvancedMessage:
        """고급 메시지 생성"""
        
        # 프로젝트 컨텍스트 로드
        project_context = await self._load_project_context(request.project_id)
        
        # 전략별 메시지 생성
        if request.generation_strategy == "logical":
            message_content = await self._generate_logical_message(request, project_context)
        elif request.generation_strategy == "emotional":
            message_content = await self._generate_emotional_message(request, project_context)
        elif request.generation_strategy == "psychological":
            message_content = await self._generate_psychological_message(request, project_context)
        else:  # hybrid
            message_content = await self._generate_hybrid_message(request, project_context)
        
        # 효과성 분석
        effectiveness_score = self._analyze_effectiveness(message_content, request)
        
        # 연구 분석 데이터 생성
        research_analysis = self._generate_research_analysis(message_content, request)
        
        message = AdvancedMessage(
            message_id=f"msg_{len(self.generation_history)+1}",
            content=message_content,
            strategy_used=request.generation_strategy,
            psychological_elements=research_analysis["psychological_elements"],
            persuasion_techniques=research_analysis["persuasion_techniques"],
            effectiveness_score=effectiveness_score,
            research_analysis=research_analysis,
            generation_time=datetime.now().isoformat()
        )
        
        self.generation_history.append(message.dict())
        
        return message
    
    async def _load_project_context(self, project_id: str) -> Dict[str, Any]:
        """프로젝트 컨텍스트 로드"""
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 프로젝트 정보
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,))
            project_data = cursor.fetchone()
            
            # 지침 정보
            cursor.execute("SELECT * FROM instruction_rules WHERE project_id = ?", (project_id,))
            instructions = cursor.fetchall()
            
            # 미디어 정보
            cursor.execute("SELECT * FROM media_files WHERE project_id = ?", (project_id,))
            media_files = cursor.fetchall()
            
            conn.close()
            
            return {
                "project_data": project_data,
                "instructions": instructions,
                "media_files": media_files,
                "context_loaded": True
            }
        except Exception as e:
            logger.warning(f"프로젝트 컨텍스트 로드 실패: {e}")
            return {"context_loaded": False}
    
    async def _generate_logical_message(self, request: MessageGenerationRequest, 
                                      context: Dict[str, Any]) -> str:
        """논리적 접근 메시지 생성"""
        
        situation = request.target_situation
        intensity = request.intensity_level
        
        # 논리적 구조 구성
        logical_elements = []
        
        # 1. 상황 인식 및 분석
        logical_elements.append("현재 상황을 객관적으로 분석해보면")
        
        # 2. 근거 제시
        if "공정" in situation:
            logical_elements.append("공정한 경쟁의 원칙에 따르면, 모든 참여자에게 동등한 기회가 보장되어야 합니다")
            
            if intensity >= 3:
                logical_elements.append("이는 단순한 선호의 문제가 아니라 법적, 윤리적 의무입니다")
            
            if intensity >= 4:
                logical_elements.append("공정성이 훼손될 경우, 전체 프로세스의 정당성이 의문시될 수 있습니다")
        
        # 3. 데이터 기반 논증
        if context["context_loaded"] and context["media_files"]:
            doc_count = len([f for f in context["media_files"] if f[4] == "document"])
            if doc_count > 0:
                logical_elements.append(f"관련 문서 {doc_count}건의 검토 결과도 이를 뒷받침합니다")
        
        # 4. 결론 및 제안
        logical_elements.append("따라서 투명하고 객관적인 기준에 따른 재검토가 필요합니다")
        
        if intensity >= 4:
            logical_elements.append("이는 모든 이해관계자의 장기적 이익을 위한 필수적 조치입니다")
        
        return ". ".join(logical_elements) + "."
    
    async def _generate_emotional_message(self, request: MessageGenerationRequest,
                                        context: Dict[str, Any]) -> str:
        """감정적 접근 메시지 생성"""
        
        situation = request.target_situation
        intensity = request.intensity_level
        
        emotional_elements = []
        
        # 1. 공감 표현
        emotional_elements.append("말씀하신 우려에 대해 깊이 공감합니다")
        
        # 2. 감정적 연결
        if "조합원" in situation:
            emotional_elements.append("조합원 여러분의 마음을 충분히 이해합니다")
            
            if intensity >= 3:
                emotional_elements.append("이런 상황에서 느끼시는 답답함과 불안감이 얼마나 클지 짐작이 갑니다")
        
        # 3. 희망과 비전 제시
        if intensity >= 2:
            emotional_elements.append("함께 노력한다면 반드시 공정하고 만족스러운 결과를 만들어낼 수 있습니다")
        
        # 4. 신뢰와 약속
        emotional_elements.append("여러분의 신뢰를 저버리지 않겠습니다")
        
        if intensity >= 4:
            emotional_elements.append("이 문제가 해결될 때까지 끝까지 함께하겠습니다")
        
        # 5. 감정적 강화
        if intensity >= 5:
            emotional_elements.append("정의롭고 공정한 결과를 위해 최선을 다하겠습니다")
        
        return ". ".join(emotional_elements) + "."
    
    async def _generate_psychological_message(self, request: MessageGenerationRequest,
                                            context: Dict[str, Any]) -> str:
        """심리학적 접근 메시지 생성"""
        
        situation = request.target_situation
        intensity = request.intensity_level
        
        psychological_elements = []
        
        # 1. 권위 편향 활용
        psych_data = self.research_data["psychological_techniques"]
        
        # Authority bias 적용
        if intensity >= 2:
            psychological_elements.append("법적 전문가들과 업계 전문가들의 견해에 따르면")
        
        # 2. Social proof 적용
        if "조합원" in situation:
            psychological_elements.append("대부분의 조합원분들께서 공정성을 가장 중요하게 생각하고 계십니다")
        
        # 3. Loss aversion 활용
        if intensity >= 3:
            if "공정" in situation:
                psychological_elements.append("지금 이 문제를 해결하지 않으면, 향후 더 큰 법적 분쟁이나 신뢰도 손상을 겪을 수 있습니다")
        
        # 4. Commitment and consistency
        psychological_elements.append("처음 프로젝트를 시작할 때 모두가 합의했던 '공정하고 투명한 절차'라는 원칙을 지켜야 합니다")
        
        # 5. Reciprocity 원칙
        psychological_elements.append("조합원 여러분께서 보여주신 신뢰와 기대에 부응하고자 합니다")
        
        # 6. 인지 편향 조정
        if intensity >= 4:
            psychological_elements.append("객관적이고 편견 없는 시각에서 이 문제를 바라봐야 합니다")
        
        return ". ".join(psychological_elements) + "."
    
    async def _generate_hybrid_message(self, request: MessageGenerationRequest,
                                     context: Dict[str, Any]) -> str:
        """통합적 접근 메시지 생성"""
        
        # 각 접근법의 핵심 요소들을 조합
        logical_part = await self._generate_logical_message(request, context)
        emotional_part = await self._generate_emotional_message(request, context)
        psychological_part = await self._generate_psychological_message(request, context)
        
        # 강도에 따른 조합 비율 조정
        intensity = request.intensity_level
        
        if intensity <= 2:
            # 논리 중심, 감정 보조
            main_parts = logical_part.split(". ")[:2]
            supporting_parts = emotional_part.split(". ")[:1]
        elif intensity <= 4:
            # 균형적 접근
            main_parts = logical_part.split(". ")[:2]
            supporting_parts = emotional_part.split(". ")[:1] + psychological_part.split(". ")[:1]
        else:
            # 모든 요소 통합
            main_parts = logical_part.split(". ")[:2]
            supporting_parts = emotional_part.split(". ")[:2] + psychological_part.split(". ")[:2]
        
        combined_elements = main_parts + supporting_parts
        
        return ". ".join([elem for elem in combined_elements if elem.strip()]) + "."
    
    def _analyze_effectiveness(self, message: str, request: MessageGenerationRequest) -> float:
        """메시지 효과성 분석"""
        
        effectiveness_score = 0.5  # 기본 점수
        
        # 길이 적절성 (50-300자)
        if 50 <= len(message) <= 300:
            effectiveness_score += 0.1
        
        # 심리학적 요소 포함도
        psych_data = self.research_data["psychological_techniques"]
        
        for category in psych_data.values():
            for technique, data in category.items():
                if isinstance(data, dict) and "triggers" in data:
                    if any(trigger in message for trigger in data["triggers"]):
                        effectiveness_score += 0.05
                elif isinstance(data, dict) and "patterns" in data:
                    if any(pattern in message for pattern in data["patterns"]):
                        effectiveness_score += 0.05
        
        # 상황 적합성
        if "공정" in request.target_situation and "공정" in message:
            effectiveness_score += 0.1
        
        # 전략 일관성
        if request.generation_strategy == "logical" and any(word in message for word in ["분석", "객관", "근거"]):
            effectiveness_score += 0.1
        elif request.generation_strategy == "emotional" and any(word in message for word in ["공감", "이해", "마음"]):
            effectiveness_score += 0.1
        
        return min(effectiveness_score, 1.0)
    
    def _generate_research_analysis(self, message: str, request: MessageGenerationRequest) -> Dict[str, Any]:
        """연구 분석 데이터 생성"""
        
        psychological_elements = []
        persuasion_techniques = []
        
        psych_data = self.research_data["psychological_techniques"]
        
        # 심리학적 요소 감지
        for category_name, category in psych_data.items():
            for technique_name, technique_data in category.items():
                if isinstance(technique_data, dict):
                    if "triggers" in technique_data:
                        if any(trigger in message for trigger in technique_data["triggers"]):
                            psychological_elements.append(technique_name)
                    elif "patterns" in technique_data:
                        if any(pattern in message for pattern in technique_data["patterns"]):
                            psychological_elements.append(technique_name)
        
        # 설득 기법 분석
        if "전문가" in message or "법적" in message:
            persuasion_techniques.append("authority_appeal")
        
        if "대부분" in message or "많은" in message:
            persuasion_techniques.append("social_proof")
        
        if "위험" in message or "손실" in message:
            persuasion_techniques.append("loss_aversion")
        
        if "공감" in message or "이해" in message:
            persuasion_techniques.append("empathy_connection")
        
        return {
            "psychological_elements": psychological_elements,
            "persuasion_techniques": persuasion_techniques,
            "strategy_distribution": {
                "logical_ratio": self._calculate_logical_ratio(message),
                "emotional_ratio": self._calculate_emotional_ratio(message),
                "psychological_ratio": self._calculate_psychological_ratio(message)
            },
            "complexity_analysis": {
                "sentence_count": len(message.split(".")),
                "word_count": len(message.split()),
                "complexity_level": "high" if len(message.split()) > 150 else "medium"
            },
            "research_notes": f"Generated using {request.generation_strategy} strategy at intensity level {request.intensity_level}"
        }
    
    def _calculate_logical_ratio(self, message: str) -> float:
        """논리적 요소 비율 계산"""
        logical_keywords = ["분석", "객관", "근거", "데이터", "사실", "증거", "논리"]
        count = sum(1 for keyword in logical_keywords if keyword in message)
        return min(count / 5, 1.0)
    
    def _calculate_emotional_ratio(self, message: str) -> float:
        """감정적 요소 비율 계산"""
        emotional_keywords = ["공감", "이해", "마음", "느낌", "감정", "신뢰", "희망"]
        count = sum(1 for keyword in emotional_keywords if keyword in message)
        return min(count / 5, 1.0)
    
    def _calculate_psychological_ratio(self, message: str) -> float:
        """심리학적 요소 비율 계산"""
        psychological_keywords = ["전문가", "대부분", "일반적", "위험", "기회", "손실"]
        count = sum(1 for keyword in psychological_keywords if keyword in message)
        return min(count / 5, 1.0)

# ==================== 전역 인스턴스 ====================

research_engine = MessageResearchEngine()

# ==================== API 엔드포인트들 ====================

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "system": "연구용 고급 메시지 생성 시스템",
        "version": "1.0.0",
        "purpose": "다양한 메시지 생성 기법의 연구 및 분석",
        "capabilities": [
            "🧠 심리학적 접근법 연구",
            "📊 논리적 설득 기법 분석", 
            "💭 감정적 어필 효과 측정",
            "🔬 통합적 접근법 개발",
            "📈 효과성 정량 분석"
        ],
        "research_areas": [
            "인지 편향 활용 연구",
            "설득 원리 적용 분석",
            "감정적 어필 효과성",
            "언어학적 기법 연구",
            "상황별 최적화 방법"
        ]
    }

@app.post("/research/generate-message")
async def research_generate_message(request: MessageGenerationRequest):
    """연구용 메시지 생성"""
    
    try:
        message = await research_engine.generate_advanced_message(request)
        
        return {
            "success": True,
            "message": "연구용 메시지가 성공적으로 생성되었습니다.",
            "result": message.dict(),
            "research_metadata": {
                "generation_strategy": request.generation_strategy,
                "intensity_level": request.intensity_level,
                "target_audience": request.target_audience,
                "research_purpose": "메시지 생성 기법 연구 및 효과성 분석"
            }
        }
    except Exception as e:
        logger.error(f"연구용 메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/research/analyze-effectiveness")
async def analyze_message_effectiveness(analysis_request: Dict[str, Any]):
    """메시지 효과성 분석"""
    
    try:
        message = analysis_request.get("message", "")
        strategy = analysis_request.get("strategy", "hybrid")
        
        # 가상의 요청 객체 생성 (분석용)
        mock_request = MessageGenerationRequest(
            project_id="analysis",
            target_situation=analysis_request.get("situation", ""),
            generation_strategy=strategy
        )
        
        effectiveness_score = research_engine._analyze_effectiveness(message, mock_request)
        research_analysis = research_engine._generate_research_analysis(message, mock_request)
        
        return {
            "success": True,
            "effectiveness_score": effectiveness_score,
            "analysis": research_analysis,
            "recommendations": [
                "논리적 근거 강화 필요" if research_analysis["strategy_distribution"]["logical_ratio"] < 0.3 else "논리적 구조 양호",
                "감정적 연결 개선 필요" if research_analysis["strategy_distribution"]["emotional_ratio"] < 0.3 else "감정적 어필 적절",
                "심리학적 기법 보완 필요" if research_analysis["strategy_distribution"]["psychological_ratio"] < 0.3 else "심리학적 접근 효과적"
            ]
        }
    except Exception as e:
        logger.error(f"효과성 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/research/techniques")
async def get_research_techniques():
    """연구 기법 목록 조회"""
    
    return {
        "psychological_techniques": research_engine.research_data["psychological_techniques"],
        "linguistic_techniques": research_engine.research_data["linguistic_techniques"],
        "contextual_factors": research_engine.research_data["contextual_factors"]
    }

@app.get("/research/history")
async def get_generation_history():
    """메시지 생성 이력 조회"""
    
    return {
        "total_generated": len(research_engine.generation_history),
        "history": research_engine.generation_history[-10:],  # 최근 10개
        "statistics": {
            "average_effectiveness": sum(msg["effectiveness_score"] for msg in research_engine.generation_history) / max(len(research_engine.generation_history), 1),
            "strategy_distribution": {
                strategy: len([msg for msg in research_engine.generation_history if msg["strategy_used"] == strategy])
                for strategy in ["logical", "emotional", "psychological", "hybrid"]
            }
        }
    }

# 연구용 데모 엔드포인트
@app.post("/research/demo/comprehensive-test")
async def comprehensive_research_demo():
    """종합적 연구 데모"""
    
    test_situation = "삼성은 경쟁사 설계에 없는 것을 이유로 '허가 불가'라고 몰아붙이는데, 이건 공정 경쟁이 아닙니다. 조합원들이 다 지켜보고 있습니다."
    
    strategies = ["logical", "emotional", "psychological", "hybrid"]
    intensity_levels = [2, 3, 4, 5]
    
    results = []
    
    for strategy in strategies:
        for intensity in intensity_levels:
            request = MessageGenerationRequest(
                project_id="demo_project",
                target_situation=test_situation,
                generation_strategy=strategy,
                intensity_level=intensity,
                target_audience="stakeholders"
            )
            
            message = await research_engine.generate_advanced_message(request)
            results.append({
                "strategy": strategy,
                "intensity": intensity,
                "message": message.content,
                "effectiveness": message.effectiveness_score,
                "psychological_elements": message.psychological_elements,
                "persuasion_techniques": message.persuasion_techniques
            })
    
    # 최고 효과성 메시지 선별
    best_message = max(results, key=lambda x: x["effectiveness"])
    
    return {
        "demo_title": "연구용 종합 메시지 생성 테스트",
        "input_situation": test_situation,
        "total_generated": len(results),
        "all_results": results,
        "best_performing": best_message,
        "research_insights": {
            "most_effective_strategy": best_message["strategy"],
            "optimal_intensity": best_message["intensity"],
            "key_psychological_elements": best_message["psychological_elements"],
            "effective_persuasion_techniques": best_message["persuasion_techniques"]
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🔬 연구용 고급 메시지 생성 시스템 시작!")
    print("📊 연구 기능:")
    print("   🧠 심리학적 접근법 연구")
    print("   📈 설득 기법 효과성 분석")
    print("   💭 감정적 어필 최적화")
    print("   🔄 통합적 접근법 개발")
    
    _p = int(os.environ.get("ADVANCED_MESSAGE_RESEARCH_PORT", os.environ.get("PORT", "8093")))
    uvicorn.run(app, host="0.0.0.0", port=_p) 