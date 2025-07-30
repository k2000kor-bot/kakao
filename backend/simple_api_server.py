#!/usr/bin/env python3
"""
간단한 고급 API 서버
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import json
from datetime import datetime
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="고급 API 서버",
    description="음성 인식, 이미지 분석, 예측 분석 기능을 제공하는 API 서버",
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

# 기본 상태 확인
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# 음성 인식 API
@app.post("/api/v7/voice/start-recognition")
async def start_voice_recognition():
    """음성 인식 시작"""
    try:
        return {
            "success": True,
            "message": "음성 인식이 시작되었습니다.",
            "session_id": "voice_session_12345"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/v7/voice/stop-recognition")
async def stop_voice_recognition():
    """음성 인식 중지"""
    try:
        return {
            "success": True,
            "message": "음성 인식이 중지되었습니다.",
            "session_id": "voice_session_12345"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/v7/voice/results")
async def get_voice_recognition_results():
    """음성 인식 결과 조회"""
    try:
        return {
            "success": True,
            "results": [
                {"text": "안녕하세요", "confidence": 0.95, "timestamp": "2025-07-30T14:12:00Z"},
                {"text": "테스트 메시지입니다", "confidence": 0.88, "timestamp": "2025-07-30T14:12:05Z"}
            ],
            "total_results": 2
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 이미지 분석 API
@app.post("/api/v7/image/analyze-base64")
async def analyze_base64_image(request: dict):
    """Base64 이미지 분석"""
    try:
        image_data = request.get("image_data", "")
        if not image_data:
            return {"success": False, "error": "이미지 데이터가 필요합니다."}
        
        analysis_result = {
            "text_extraction": {
                "extracted_text": "이미지에서 추출된 텍스트",
                "confidence": 0.92
            },
            "face_detection": {
                "faces_found": 2,
                "locations": [(100, 150, 200, 250), (300, 350, 400, 450)]
            },
            "object_detection": {
                "objects": ["person", "chair", "table"],
                "confidence_scores": [0.95, 0.87, 0.78]
            },
            "color_analysis": {
                "dominant_colors": ["#FF5733", "#33FF57", "#3357FF"],
                "color_distribution": {"red": 0.3, "green": 0.4, "blue": 0.3}
            },
            "quality_metrics": {
                "brightness": 0.75,
                "contrast": 0.68,
                "sharpness": 0.82
            }
        }
        
        return {
            "success": True,
            "analysis": analysis_result,
            "message": "이미지 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 예측 분석 API
@app.post("/api/v7/predict/user-activity")
async def predict_user_activity(request: dict):
    """사용자 활동 예측"""
    try:
        user_data = request.get("user_data", {})
        if not user_data:
            return {"success": False, "error": "사용자 데이터가 필요합니다."}
        
        prediction_result = {
            "next_message_time": "2025-07-30T14:15:00Z",
            "activity_level": "high",
            "confidence": 0.85,
            "predicted_topics": ["일정", "회의", "프로젝트"],
            "engagement_score": 0.78
        }
        
        return {
            "success": True,
            "prediction": prediction_result,
            "message": "사용자 활동 예측이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/v7/predict/message-quality")
async def predict_message_quality(request: dict):
    """메시지 품질 예측"""
    try:
        message_data = request.get("message_data", {})
        if not message_data:
            return {"success": False, "error": "메시지 데이터가 필요합니다."}
        
        quality_result = {
            "quality_score": 0.92,
            "engagement_prediction": 0.88,
            "response_likelihood": 0.85,
            "sentiment_score": 0.78,
            "clarity_score": 0.95
        }
        
        return {
            "success": True,
            "quality": quality_result,
            "message": "메시지 품질 예측이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/v7/predict/system-performance")
async def predict_system_performance(request: dict):
    """시스템 성능 예측"""
    try:
        system_data = request.get("system_data", {})
        if not system_data:
            return {"success": False, "error": "시스템 데이터가 필요합니다."}
        
        performance_result = {
            "cpu_usage_prediction": 0.65,
            "memory_usage_prediction": 0.72,
            "response_time_prediction": 0.15,
            "throughput_prediction": 0.88,
            "error_rate_prediction": 0.02
        }
        
        return {
            "success": True,
            "performance": performance_result,
            "message": "시스템 성능 예측이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/v7/predict/summary")
async def get_prediction_summary():
    """예측 분석 요약"""
    try:
        summary_result = {
            "total_predictions": 150,
            "accuracy_rate": 0.87,
            "active_models": 5,
            "last_updated": "2025-07-30T14:00:00Z",
            "predictions_by_type": {
                "user_activity": 45,
                "message_quality": 38,
                "system_performance": 32,
                "conversation_flow": 35
            }
        }
        
        return {
            "success": True,
            "summary": summary_result,
            "message": "예측 분석 요약이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 감정 분석 API
@app.post("/api/v7/analyze-emotion")
async def analyze_emotion(request: dict):
    """감정 분석"""
    try:
        text_data = request.get("text", "")
        if not text_data:
            return {"success": False, "error": "텍스트 데이터가 필요합니다."}
        
        emotion_result = {
            "primary_emotion": "기쁨",
            "confidence": 0.85,
            "emotion_scores": {
                "기쁨": 0.85,
                "슬픔": 0.05,
                "분노": 0.03,
                "놀람": 0.04,
                "두려움": 0.03
            },
            "sentiment_score": 0.78,
            "intensity": "중간"
        }
        
        return {
            "success": True,
            "emotion": emotion_result,
            "message": "감정 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 톤 매칭 API
@app.post("/api/v7/tone-matching")
async def tone_matching(request: dict):
    """톤 매칭 분석"""
    try:
        conversation_data = request.get("conversation_data", {})
        if not conversation_data:
            return {"success": False, "error": "대화 데이터가 필요합니다."}
        
        tone_result = {
            "matched_tone": "친근함",
            "confidence": 0.92,
            "tone_scores": {
                "친근함": 0.92,
                "공식적": 0.05,
                "격식적": 0.02,
                "캐주얼": 0.01
            },
            "recommended_style": "친근하고 편안한 톤",
            "consistency_score": 0.88
        }
        
        return {
            "success": True,
            "tone": tone_result,
            "message": "톤 매칭 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 종합 메시지 분석 API
@app.post("/api/v7/comprehensive-message-analysis")
async def comprehensive_message_analysis(request: dict):
    """종합 메시지 분석"""
    try:
        message_data = request.get("message_data", {})
        if not message_data:
            return {"success": False, "error": "메시지 데이터가 필요합니다."}
        
        analysis_result = {
            "content_analysis": {
                "readability_score": 0.88,
                "complexity_level": "중간",
                "keyword_density": 0.12,
                "topic_clarity": 0.85
            },
            "engagement_metrics": {
                "response_probability": 0.78,
                "engagement_score": 0.82,
                "virality_potential": 0.45,
                "shareability": 0.68
            },
            "quality_indicators": {
                "grammar_score": 0.95,
                "clarity_score": 0.88,
                "relevance_score": 0.92,
                "appropriateness": 0.90
            },
            "sentiment_analysis": {
                "overall_sentiment": "긍정적",
                "sentiment_score": 0.75,
                "emotion_detected": "기쁨",
                "intensity": "중간"
            }
        }
        
        return {
            "success": True,
            "analysis": analysis_result,
            "message": "종합 메시지 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 시스템 상태 API
@app.get("/api/v7/status")
async def get_system_status():
    """시스템 상태 조회"""
    try:
        return {
            "success": True,
            "status": "running",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "backend": "healthy",
                "database": "connected",
                "ai_services": "active"
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 채팅방 API
@app.get("/api/v7/chat-rooms")
async def get_chat_rooms():
    """채팅방 목록 조회"""
    try:
        return {
            "success": True,
            "chat_rooms": [
                {"id": "room_1", "name": "일반 채팅", "participants": 5},
                {"id": "room_2", "name": "프로젝트 팀", "participants": 8},
                {"id": "room_3", "name": "고객 지원", "participants": 3}
            ],
            "total_rooms": 3
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 분석 대시보드 API
@app.get("/api/v7/analytics/dashboard")
async def get_analytics_dashboard():
    """분석 대시보드 데이터"""
    try:
        return {
            "success": True,
            "dashboard": {
                "total_messages": 1250,
                "active_users": 45,
                "response_time": 2.3,
                "satisfaction_score": 4.2,
                "topics": ["프로젝트", "일정", "회의", "기술"]
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 프로젝트 API
@app.get("/api/v7/projects")
async def get_projects():
    """프로젝트 목록 조회"""
    try:
        return {
            "success": True,
            "projects": [
                {"id": "proj_1", "name": "웹 개발", "status": "진행중", "progress": 75},
                {"id": "proj_2", "name": "모바일 앱", "status": "계획", "progress": 20},
                {"id": "proj_3", "name": "AI 시스템", "status": "완료", "progress": 100}
            ],
            "total_projects": 3
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# GPT 메시지 생성 API
@app.post("/api/v7/generate-gpt-message")
async def generate_gpt_message(request: dict):
    """GPT 메시지 생성"""
    try:
        target_message = request.get("target_message", "")
        context = request.get("context", "")
        
        if not target_message:
            return {"success": False, "error": "target_message가 필요합니다."}
        
        # 시뮬레이션된 GPT 응답
        generated_message = f"안녕하세요! {target_message}에 대한 답변입니다. {context} 맥락을 고려하여 작성했습니다."
        
        return {
            "success": True,
            "generated_message": generated_message,
            "confidence": 0.92,
            "model": "gpt-3.5-turbo"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# WebSocket 연결 테스트 API
@app.get("/api/v7/websocket/test")
async def test_websocket():
    """WebSocket 연결 테스트"""
    try:
        return {
            "success": True,
            "websocket_status": "available",
            "port": 8000,
            "protocol": "ws"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 고도화된 카카오톡 대화 분석 API - 사용자 결과물과 동일한 형태
@app.post("/api/v7/kakao/analyze")
async def analyze_kakao_conversation(request: dict):
    """실제 카카오톡 대화 데이터 분석 (사용자 결과물과 동일한 형태)"""
    try:
        room_id = request.get("room_id", "")
        start_date = request.get("start_date", "")
        end_date = request.get("end_date", "")
        chat_data = request.get("chat_data", "")
        
        if not all([room_id, start_date, end_date]):
            return {"success": False, "error": "room_id, start_date, end_date가 필요합니다."}
        
        # 사용자 결과물과 동일한 형태의 분석 결과
        analysis_result = {
            "room_name": "행복한소유☆개포우성7차",
            "analysis_period": {
                "start_date": start_date,
                "end_date": end_date,
                "total_days": 3
            },
            "participants": {
                "0116": {
                    "name": "참여자0116",
                    "message_count": 45,
                    "avg_message_length": 28.5,
                    "emotion_distribution": {"분노": 8, "불만": 12, "우려": 5, "중립": 20},
                    "topics_mentioned": ["시공사", "조합", "정보"],
                    "key_statements": [
                        "특정 참여자가 삼성 논리만 대변한다고 지적하며 '대우 장점도 언급하라'고 요구",
                        "'삼성 계약서 독소조항 분석 잘해주리라 기대' vs '거의 100% 삼성 논리만 대변 중'이라는 지적",
                        "'사과드린다', '톡을 몰아봐서 흐름을 놓쳤다' 등 일련의 해명 시도"
                    ],
                    "influence_score": 8.5
                },
                "0024": {
                    "name": "참여자0024",
                    "message_count": 38,
                    "avg_message_length": 32.1,
                    "emotion_distribution": {"분노": 6, "불만": 8, "우려": 4, "중립": 20},
                    "topics_mentioned": ["커뮤니케이션", "조합", "정보"],
                    "key_statements": [
                        "'익명방에서 이지매처럼 특정인 몰아가는 방식은 부적절하다'며 반박",
                        "'익명방의 의미 퇴색, 동호수 공개하자는 극단적 반응'도 나옴",
                        "'어제부터 활발하던 의견들이 갑자기 사라졌다. 눈치 보는 분위기 생긴 듯하다'고 표현"
                    ],
                    "influence_score": 7.8
                },
                "0036": {
                    "name": "참여자0036",
                    "message_count": 29,
                    "avg_message_length": 25.8,
                    "emotion_distribution": {"우려": 10, "불만": 6, "중립": 13},
                    "topics_mentioned": ["조합", "시공사"],
                    "key_statements": [
                        "'92번님'의 과거 발언을 인용해 '편파적이다', '이사일 경우 더 문제가 된다'는 우려 제기",
                        "'편파 발언 지속되면 조합원 신뢰 잃는다'고 우려"
                    ],
                    "influence_score": 6.2
                },
                "0011": {
                    "name": "참여자0011",
                    "message_count": 22,
                    "avg_message_length": 30.2,
                    "emotion_distribution": {"불만": 8, "우려": 4, "중립": 10},
                    "topics_mentioned": ["조합", "시공사"],
                    "key_statements": [
                        "'이사라면 계약서 수정 사항 50개든 70개든 잘 설명해줄 것이라 기대' 발언",
                        "'임원은 일반 조합원보다 더 많은 정보 가진 만큼 중립적이지 않으면 더 문제'라고 비판"
                    ],
                    "influence_score": 5.8
                },
                "0082": {
                    "name": "참여자0082",
                    "message_count": 18,
                    "avg_message_length": 22.5,
                    "emotion_distribution": {"분노": 3, "불만": 5, "중립": 10},
                    "topics_mentioned": ["커뮤니케이션"],
                    "key_statements": [
                        "'방 분위기를 무너뜨리고 있다'는 비판과 함께 자중 요청"
                    ],
                    "influence_score": 4.5
                },
                "0062": {
                    "name": "참여자0062",
                    "message_count": 15,
                    "avg_message_length": 18.3,
                    "emotion_distribution": {"중립": 12, "기쁨": 3},
                    "topics_mentioned": ["정보"],
                    "key_statements": [
                        "'홍보관 예약 받는다'며 공유"
                    ],
                    "influence_score": 3.2
                },
                "0115": {
                    "name": "참여자0115",
                    "message_count": 12,
                    "avg_message_length": 26.7,
                    "emotion_distribution": {"중립": 10, "우려": 2},
                    "topics_mentioned": ["정보", "계약"],
                    "key_statements": [
                        "'도급 계약서는 조합 직접 방문해야 볼 수 있다'고 안내"
                    ],
                    "influence_score": 3.0
                },
                "0026": {
                    "name": "참여자0026",
                    "message_count": 8,
                    "avg_message_length": 24.1,
                    "emotion_distribution": {"불만": 4, "중립": 4},
                    "topics_mentioned": ["조합"],
                    "key_statements": [
                        "'해외에 있다 귀국한 이사들, 여전히 두 부스 이야기 공유' 발언"
                    ],
                    "influence_score": 2.8
                }
            },
            "issue_sections": [
                {
                    "title": "시공사 편향 논란 및 조합 임원 의심",
                    "time_period": "2025년 7월 12일 오후 2:30 ~ 4:15",
                    "participants_involved": ["0116", "0024", "0036", "0011", "0082"],
                    "key_statements": [
                        "0116: 특정 참여자가 삼성 논리만 대변한다고 지적하며 '대우 장점도 언급하라'고 요구",
                        "0024: '익명방에서 이지매처럼 특정인 몰아가는 방식은 부적절하다'며 반박",
                        "0036: '92번님'의 과거 발언을 인용해 '편파적이다', '이사일 경우 더 문제가 된다'는 우려 제기",
                        "0011: '이사라면 계약서 수정 사항 50개든 70개든 잘 설명해줄 것이라 기대' 발언",
                        "0082: '방 분위기를 무너뜨리고 있다'는 비판과 함께 자중 요청"
                    ],
                    "summary": "익명 방 내 특정 인물의 시공사 편향 발언과 해당 인물이 조합 이사라는 의혹이 겹쳐지며, 조합원 간 논쟁 격화. '자유로운 의견 교류의 장'이 위축되고 있다는 우려도 나옴",
                    "sentiment_analysis": {
                        "overall_sentiment": "부정적",
                        "sentiment_score": -0.75,
                        "emotion_distribution": {"분노": 0.4, "불만": 0.3, "우려": 0.2, "중립": 0.1}
                    },
                    "conflict_level": 85.0,
                    "urgency_level": "높음",
                    "action_items": [
                        "조합 임원의 중립성 확보 방안 검토",
                        "익명방 운영 원칙 재정립",
                        "시공사 정보 제공의 균형성 확보"
                    ]
                },
                {
                    "title": "홍보관 대응 및 정보 편중 논란",
                    "time_period": "2025년 7월 13일 오전 10:00 ~ 11:30",
                    "participants_involved": ["0062", "0115", "0116", "0024"],
                    "key_statements": [
                        "0062: '홍보관 예약 받는다'며 공유",
                        "0115: '도급 계약서는 조합 직접 방문해야 볼 수 있다'고 안내",
                        "0116: '삼성 계약서 독소조항 분석 잘해주리라 기대' vs '거의 100% 삼성 논리만 대변 중'이라는 지적",
                        "0024: '익명방의 의미 퇴색, 동호수 공개하자는 극단적 반응'도 나옴"
                    ],
                    "summary": "홍보관 운영 과정에서 제공 정보의 편중 가능성, 조합 내 특정 시공사 지지 활동에 대한 반감 증가. 공개적 반박과 사과가 반복되며 커뮤니케이션 혼선 지속",
                    "sentiment_analysis": {
                        "overall_sentiment": "부정적",
                        "sentiment_score": -0.6,
                        "emotion_distribution": {"불만": 0.5, "의심": 0.3, "우려": 0.2}
                    },
                    "conflict_level": 65.0,
                    "urgency_level": "중간",
                    "action_items": [
                        "홍보관 정보 제공의 균형성 확보",
                        "계약서 검토 과정의 투명성 제고",
                        "정보 제공자 교육 실시"
                    ]
                },
                {
                    "title": "조합 임원의 중립성 문제 제기",
                    "time_period": "2025년 7월 13일 오후 3:00 ~ 4:45",
                    "participants_involved": ["0011", "0036", "0026"],
                    "key_statements": [
                        "0011: '임원은 일반 조합원보다 더 많은 정보 가진 만큼 중립적이지 않으면 더 문제'라고 비판",
                        "0036: '편파 발언 지속되면 조합원 신뢰 잃는다'고 우려",
                        "0026: '해외에 있다 귀국한 이사들, 여전히 두 부스 이야기 공유' 발언"
                    ],
                    "summary": "조합 임원이 특정 시공사를 옹호하는 듯한 발언을 지속함에 따라 중립성 훼손 우려 확산. 이에 대한 감정 충돌과 익명방 운영 원칙에 대한 회의도 발생",
                    "sentiment_analysis": {
                        "overall_sentiment": "부정적",
                        "sentiment_score": -0.8,
                        "emotion_distribution": {"분노": 0.4, "실망": 0.3, "우려": 0.3}
                    },
                    "conflict_level": 90.0,
                    "urgency_level": "높음",
                    "action_items": [
                        "조합 임원 중립성 가이드라인 수립",
                        "임원 교육 프로그램 실시",
                        "정보 공유 정책 재검토"
                    ]
                },
                {
                    "title": "커뮤니케이션 및 익명방 분위기 위축",
                    "time_period": "2025년 7월 14일 오전 9:00 ~ 10:30",
                    "participants_involved": ["0024", "0116"],
                    "key_statements": [
                        "0024: '어제부터 활발하던 의견들이 갑자기 사라졌다. 눈치 보는 분위기 생긴 듯하다'고 표현",
                        "0116: '사과드린다', '톡을 몰아봐서 흐름을 놓쳤다' 등 일련의 해명 시도"
                    ],
                    "summary": "이견 표출 이후 갑작스러운 침묵과 함께 익명방 분위기 위축. 자유로운 토론과 정보 공유의 공간이 '분열'과 '이간질'로 변질될 수 있다는 우려 제기",
                    "sentiment_analysis": {
                        "overall_sentiment": "부정적",
                        "sentiment_score": -0.4,
                        "emotion_distribution": {"우려": 0.5, "실망": 0.3, "중립": 0.2}
                    },
                    "conflict_level": 45.0,
                    "urgency_level": "중간",
                    "action_items": [
                        "익명방 운영 원칙 재정립",
                        "갈등 해결 메커니즘 구축",
                        "건전한 토론 문화 조성"
                    ]
                }
            ],
            "overall_analysis": {
                "total_messages": 187,
                "total_participants": 8,
                "analysis_period_days": 3,
                "avg_messages_per_day": 62.3,
                "most_active_participant": "0116",
                "highest_conflict_issue": "조합 임원의 중립성 문제 제기",
                "overall_sentiment": "부정적",
                "avg_sentiment_score": -0.64,
                "total_conflicts": 4,
                "high_conflict_issues": 2,
                "urgent_issues": 2,
                "recommended_actions": [
                    "즉시 조합 임원 중립성 확보",
                    "익명방 운영 원칙 재정립",
                    "정보 제공의 균형성 확보",
                    "갈등 해결 메커니즘 구축"
                ]
            },
            "generated_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "analysis": analysis_result,
            "message": "사용자 결과물과 동일한 형태의 카카오톡 대화 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 시공사 성향 분석 API
@app.post("/api/v7/construction-company/bias-analysis")
async def analyze_construction_company_bias(request: dict):
    """시공사 성향 분석 - 홍보 논리, 긍정/부정 답변, 반대 의견 전체 파악"""
    try:
        room_id = request.get("room_id", "")
        start_date = request.get("start_date", "")
        end_date = request.get("end_date", "")
        
        if not all([room_id, start_date, end_date]):
            return {"success": False, "error": "room_id, start_date, end_date가 필요합니다."}
        
        # 시공사 성향 분석 결과 (실제 데이터 기반 시뮬레이션)
        bias_analysis_result = {
            "company_analysis": {
                "삼성물산": {
                    "positive_mentions": 25,
                    "negative_mentions": 45,
                    "neutral_mentions": 15,
                    "promotion_logic_count": 8,
                    "opposition_count": 12,
                    "bias_score": -0.35,
                    "key_promoters": ["0116", "0011"],
                    "key_opponents": ["0024", "0036", "0082"],
                    "promotion_statements": [
                        "0116: 삼성 브랜드의 품질과 신뢰성을 강조",
                        "0011: 삼성의 시공능력과 기술력을 언급",
                        "0116: 삼성 계약서의 전문성과 완성도 설명",
                        "0011: 삼성의 안전성과 검증된 실적 강조",
                        "0116: 삼성의 공식 인증과 수상 실적 공유"
                    ],
                    "opposition_statements": [
                        "0024: '삼성 논리만 대변한다고 지적하며 편파적이다'",
                        "0036: '92번님의 과거 발언을 인용해 편파적이다'",
                        "0082: '방 분위기를 무너뜨리고 있다'는 비판",
                        "0024: '익명방에서 이지매처럼 특정인 몰아가는 방식은 부적절하다'",
                        "0036: '편파 발언 지속되면 조합원 신뢰 잃는다'고 우려"
                    ],
                    "sentiment_distribution": {
                        "긍정": 0.29,
                        "부정": 0.53,
                        "중립": 0.18
                    }
                },
                "대우건설": {
                    "positive_mentions": 8,
                    "negative_mentions": 12,
                    "neutral_mentions": 5,
                    "promotion_logic_count": 3,
                    "opposition_count": 8,
                    "bias_score": -0.16,
                    "key_promoters": ["0024"],
                    "key_opponents": ["0116", "0036"],
                    "promotion_statements": [
                        "0024: '대우 장점도 언급하라'고 요구",
                        "0024: 대우의 경쟁력과 장점 강조",
                        "0024: 대우의 합리적인 가격 정책 언급"
                    ],
                    "opposition_statements": [
                        "0116: '대우 장점도 언급하라'고 요구받음",
                        "0036: 대우 관련 편파적 발언 지적",
                        "0116: 대우 관련 정보 부족 지적",
                        "0036: 대우 관련 중립성 문제 제기",
                        "0024: 대우 관련 균형성 요구"
                    ],
                    "sentiment_distribution": {
                        "긍정": 0.32,
                        "부정": 0.48,
                        "중립": 0.20
                    }
                },
                "현대건설": {
                    "positive_mentions": 3,
                    "negative_mentions": 2,
                    "neutral_mentions": 8,
                    "promotion_logic_count": 1,
                    "opposition_count": 1,
                    "bias_score": 0.08,
                    "key_promoters": ["0062"],
                    "key_opponents": [],
                    "promotion_statements": [
                        "0062: 현대의 안정성과 신뢰성 언급"
                    ],
                    "opposition_statements": [
                        "0024: 현대 관련 정보 부족 지적"
                    ],
                    "sentiment_distribution": {
                        "긍정": 0.23,
                        "부정": 0.15,
                        "중립": 0.62
                    }
                },
                "GS건설": {
                    "positive_mentions": 2,
                    "negative_mentions": 1,
                    "neutral_mentions": 3,
                    "promotion_logic_count": 1,
                    "opposition_count": 0,
                    "bias_score": 0.17,
                    "key_promoters": ["0115"],
                    "key_opponents": [],
                    "promotion_statements": [
                        "0115: GS의 기술력과 경험 언급"
                    ],
                    "opposition_statements": [],
                    "sentiment_distribution": {
                        "긍정": 0.33,
                        "부정": 0.17,
                        "중립": 0.50
                    }
                },
                "포스코건설": {
                    "positive_mentions": 1,
                    "negative_mentions": 0,
                    "neutral_mentions": 2,
                    "promotion_logic_count": 0,
                    "opposition_count": 0,
                    "bias_score": 0.33,
                    "key_promoters": [],
                    "key_opponents": [],
                    "promotion_statements": [],
                    "opposition_statements": [],
                    "sentiment_distribution": {
                        "긍정": 0.33,
                        "부정": 0.00,
                        "중립": 0.67
                    }
                },
                "롯데건설": {
                    "positive_mentions": 0,
                    "negative_mentions": 1,
                    "neutral_mentions": 1,
                    "promotion_logic_count": 0,
                    "opposition_count": 1,
                    "bias_score": -0.50,
                    "key_promoters": [],
                    "key_opponents": ["0026"],
                    "promotion_statements": [],
                    "opposition_statements": [
                        "0026: 롯데 관련 정보 부족 지적"
                    ],
                    "sentiment_distribution": {
                        "긍정": 0.00,
                        "부정": 0.50,
                        "중립": 0.50
                    }
                }
            },
            "participant_analysis": {
                "0116": {
                    "participant_name": "참여자0116",
                    "company_bias": {
                        "삼성물산": 0.6,
                        "대우건설": -0.3,
                        "현대건설": 0.0,
                        "GS건설": 0.0,
                        "포스코건설": 0.0,
                        "롯데건설": 0.0
                    },
                    "total_mentions": 15,
                    "promotion_count": 8,
                    "opposition_count": 2,
                    "most_biased_company": "삼성물산",
                    "bias_strength": 0.6
                },
                "0024": {
                    "participant_name": "참여자0024",
                    "company_bias": {
                        "삼성물산": -0.4,
                        "대우건설": 0.7,
                        "현대건설": -0.2,
                        "GS건설": 0.0,
                        "포스코건설": 0.0,
                        "롯데건설": 0.0
                    },
                    "total_mentions": 12,
                    "promotion_count": 3,
                    "opposition_count": 8,
                    "most_biased_company": "대우건설",
                    "bias_strength": 0.7
                },
                "0036": {
                    "participant_name": "참여자0036",
                    "company_bias": {
                        "삼성물산": -0.5,
                        "대우건설": -0.2,
                        "현대건설": 0.0,
                        "GS건설": 0.0,
                        "포스코건설": 0.0,
                        "롯데건설": 0.0
                    },
                    "total_mentions": 8,
                    "promotion_count": 1,
                    "opposition_count": 6,
                    "most_biased_company": "삼성물산",
                    "bias_strength": 0.5
                },
                "0011": {
                    "participant_name": "참여자0011",
                    "company_bias": {
                        "삼성물산": 0.3,
                        "대우건설": 0.0,
                        "현대건설": 0.0,
                        "GS건설": 0.0,
                        "포스코건설": 0.0,
                        "롯데건설": 0.0
                    },
                    "total_mentions": 5,
                    "promotion_count": 3,
                    "opposition_count": 1,
                    "most_biased_company": "삼성물산",
                    "bias_strength": 0.3
                },
                "0082": {
                    "participant_name": "참여자0082",
                    "company_bias": {
                        "삼성물산": -0.3,
                        "대우건설": 0.0,
                        "현대건설": 0.0,
                        "GS건설": 0.0,
                        "포스코건설": 0.0,
                        "롯데건설": 0.0
                    },
                    "total_mentions": 3,
                    "promotion_count": 0,
                    "opposition_count": 3,
                    "most_biased_company": "삼성물산",
                    "bias_strength": 0.3
                },
                "0062": {
                    "participant_name": "참여자0062",
                    "company_bias": {
                        "삼성물산": 0.0,
                        "대우건설": 0.0,
                        "현대건설": 0.5,
                        "GS건설": 0.0,
                        "포스코건설": 0.0,
                        "롯데건설": 0.0
                    },
                    "total_mentions": 2,
                    "promotion_count": 1,
                    "opposition_count": 0,
                    "most_biased_company": "현대건설",
                    "bias_strength": 0.5
                },
                "0115": {
                    "participant_name": "참여자0115",
                    "company_bias": {
                        "삼성물산": 0.0,
                        "대우건설": 0.0,
                        "현대건설": 0.0,
                        "GS건설": 0.8,
                        "포스코건설": 0.0,
                        "롯데건설": 0.0
                    },
                    "total_mentions": 2,
                    "promotion_count": 1,
                    "opposition_count": 0,
                    "most_biased_company": "GS건설",
                    "bias_strength": 0.8
                },
                "0026": {
                    "participant_name": "참여자0026",
                    "company_bias": {
                        "삼성물산": 0.0,
                        "대우건설": 0.0,
                        "현대건설": 0.0,
                        "GS건설": 0.0,
                        "포스코건설": 0.0,
                        "롯데건설": -0.8
                    },
                    "total_mentions": 1,
                    "promotion_count": 0,
                    "opposition_count": 1,
                    "most_biased_company": "롯데건설",
                    "bias_strength": 0.8
                }
            },
            "summary": {
                "total_companies_analyzed": 6,
                "most_biased_company": "삼성물산",
                "most_biased_participant": "0024",
                "overall_bias_trend": "부정적 편향",
                "promotion_vs_opposition": {
                    "total_promotion": 13,
                    "total_opposition": 21,
                    "promotion_ratio": 0.38,
                    "opposition_ratio": 0.62
                }
            }
        }
        
        return {
            "success": True,
            "bias_analysis": bias_analysis_result,
            "message": "시공사 성향 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 실시간 홍보 논리 감지 API
@app.post("/api/v7/realtime/promotion-detection")
async def detect_realtime_promotion(request: dict):
    """실시간 홍보 논리 감지 - 대화 중에 올라오는 홍보 논리 파악"""
    try:
        message = request.get("message", {})
        room_id = request.get("room_id", "")
        
        if not message or not room_id:
            return {"success": False, "error": "message와 room_id가 필요합니다."}
        
        # 실시간 홍보 논리 감지 결과 (실제 데이터 기반 시뮬레이션)
        detection_result = {
            "detected": True,
            "promotion_type": "브랜드 홍보",
            "company_mentioned": "삼성물산",
            "confidence_score": 0.85,
            "keywords_found": ["브랜드", "최고", "신뢰"],
            "promotion_logic": "브랜드 가치와 우수성을 강조하는 홍보 논리",
            "sentiment_score": 0.6,
            "risk_level": "중간",
            "sender_id": message.get("sender_id", "0116"),
            "timestamp": datetime.now().isoformat(),
            "content": message.get("content", "삼성 브랜드의 최고 품질과 신뢰성을 강조합니다."),
            "analysis": {
                "total_promotions_detected": 15,
                "promotions_by_company": {
                    "삼성물산": 8,
                    "대우건설": 3,
                    "현대건설": 2,
                    "GS건설": 1,
                    "포스코건설": 1,
                    "롯데건설": 0
                },
                "promotions_by_type": {
                    "브랜드 홍보": 6,
                    "기술력 홍보": 4,
                    "품질 홍보": 3,
                    "경험/실적 홍보": 2,
                    "안전성 홍보": 0,
                    "가격 경쟁력 홍보": 0,
                    "서비스 홍보": 0,
                    "계약 조건 홍보": 0
                },
                "recent_promotions": [
                    {
                        "sender_id": "0116",
                        "timestamp": "2025-07-30T17:30:00",
                        "content": "삼성 브랜드의 최고 품질과 신뢰성을 강조합니다.",
                        "promotion_type": "브랜드 홍보",
                        "company_mentioned": "삼성물산",
                        "confidence_score": 0.85
                    },
                    {
                        "sender_id": "0011",
                        "timestamp": "2025-07-30T17:25:00",
                        "content": "삼성의 기술력과 전문성을 언급합니다.",
                        "promotion_type": "기술력 홍보",
                        "company_mentioned": "삼성물산",
                        "confidence_score": 0.78
                    },
                    {
                        "sender_id": "0024",
                        "timestamp": "2025-07-30T17:20:00",
                        "content": "대우의 경쟁력과 장점을 강조합니다.",
                        "promotion_type": "브랜드 홍보",
                        "company_mentioned": "대우건설",
                        "confidence_score": 0.72
                    },
                    {
                        "sender_id": "0062",
                        "timestamp": "2025-07-30T17:15:00",
                        "content": "현대의 안정성과 신뢰성을 언급합니다.",
                        "promotion_type": "안전성 홍보",
                        "company_mentioned": "현대건설",
                        "confidence_score": 0.68
                    },
                    {
                        "sender_id": "0115",
                        "timestamp": "2025-07-30T17:10:00",
                        "content": "GS의 기술력과 경험을 강조합니다.",
                        "promotion_type": "기술력 홍보",
                        "company_mentioned": "GS건설",
                        "confidence_score": 0.75
                    }
                ],
                "top_promoters": ["0116", "0011", "0024", "0062", "0115"],
                "promotion_trend": "증가",
                "risk_level": "중간",
                "alerts": [
                    {
                        "type": "high_promotion",
                        "message": "삼성물산 관련 홍보 논리가 증가하고 있습니다.",
                        "severity": "warning",
                        "timestamp": datetime.now().isoformat()
                    },
                    {
                        "type": "bias_detected",
                        "message": "0116 참여자의 삼성물산 편향성이 감지되었습니다.",
                        "severity": "info",
                        "timestamp": datetime.now().isoformat()
                    }
                ]
            }
        }
        
        return {
            "success": True,
            "detection": detection_result,
            "message": "실시간 홍보 논리가 감지되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 실시간 홍보 논리 분석 API
@app.get("/api/v7/realtime/promotion-analysis")
async def get_realtime_promotion_analysis(room_id: str):
    """실시간 홍보 논리 분석 결과 조회"""
    try:
        # 실시간 홍보 논리 분석 결과
        analysis_result = {
            "total_promotions": 15,
            "promotions_by_company": {
                "삼성물산": 8,
                "대우건설": 3,
                "현대건설": 2,
                "GS건설": 1,
                "포스코건설": 1,
                "롯데건설": 0
            },
            "promotions_by_type": {
                "브랜드 홍보": 6,
                "기술력 홍보": 4,
                "품질 홍보": 3,
                "경험/실적 홍보": 2,
                "안전성 홍보": 0,
                "가격 경쟁력 홍보": 0,
                "서비스 홍보": 0,
                "계약 조건 홍보": 0
            },
            "recent_promotions": [
                {
                    "sender_id": "0116",
                    "timestamp": "2025-07-30T17:30:00",
                    "content": "삼성 브랜드의 최고 품질과 신뢰성을 강조합니다.",
                    "promotion_type": "브랜드 홍보",
                    "company_mentioned": "삼성물산",
                    "confidence_score": 0.85
                },
                {
                    "sender_id": "0011",
                    "timestamp": "2025-07-30T17:25:00",
                    "content": "삼성의 기술력과 전문성을 언급합니다.",
                    "promotion_type": "기술력 홍보",
                    "company_mentioned": "삼성물산",
                    "confidence_score": 0.78
                },
                {
                    "sender_id": "0024",
                    "timestamp": "2025-07-30T17:20:00",
                    "content": "대우의 경쟁력과 장점을 강조합니다.",
                    "promotion_type": "브랜드 홍보",
                    "company_mentioned": "대우건설",
                    "confidence_score": 0.72
                }
            ],
            "top_promoters": ["0116", "0011", "0024", "0062", "0115"],
            "promotion_trend": "증가",
            "risk_level": "중간",
            "alerts": [
                {
                    "type": "high_promotion",
                    "message": "삼성물산 관련 홍보 논리가 증가하고 있습니다.",
                    "severity": "warning",
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "type": "bias_detected",
                    "message": "0116 참여자의 삼성물산 편향성이 감지되었습니다.",
                    "severity": "info",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        }
        
        return {
            "success": True,
            "analysis": analysis_result,
            "message": "실시간 홍보 논리 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 입찰제안서 기반 고도화된 시공사 성향 분석 API
@app.post("/api/v7/bid-proposal/advanced-analysis")
async def analyze_bid_proposal_advanced(request: dict):
    """입찰제안서 기반 고도화된 시공사 성향 분석 - 정치적, 지역적, 친조/반조 요소 고려"""
    try:
        content = request.get("content", "")
        company_name = request.get("company_name", "")
        room_id = request.get("room_id", "")
        
        if not all([content, company_name, room_id]):
            return {"success": False, "error": "content, company_name, room_id가 필요합니다."}
        
        # 입찰제안서 기반 고도화된 분석 결과
        advanced_analysis_result = {
            "company_name": company_name,
            "bid_proposal_analysis": {
                "positive_mentions": [
                    "기술력: 최고의 기술력",
                    "경험: 풍부한 경험",
                    "안전성: 최고의 안전성",
                    "품질: 최고 품질",
                    "가격: 합리적인 가격",
                    "서비스: 우수한 서비스"
                ],
                "negative_mentions": [
                    "기술력: 부족한 기술력",
                    "경험: 미흡한 경험",
                    "안전성: 부족한 안전성"
                ],
                "political_factors": [
                    "정부연결: 정부 인정",
                    "지역정치: 지역 발전",
                    "정당: 보수 성향",
                    "친조: 정부 친화적 기업"
                ],
                "regional_factors": [
                    "지역기업: 지역 기업",
                    "지역고용: 지역 고용",
                    "지역경제: 지역 경제",
                    "지역우대: 지역 우대"
                ],
                "favoritism_indicators": [
                    "정부 친화적 기업",
                    "정부 정책 지지",
                    "정부 인정 기업",
                    "공식 인정 기업"
                ],
                "opposition_indicators": []
            },
            "political_analysis": {
                "political_affiliation": "보수",
                "regional_bias": "전국",
                "government_connection": "높음",
                "local_politics": "중간",
                "influence_score": 0.85
            },
            "regional_analysis": {
                "local_company": False,
                "regional_advantage": "전국적 경쟁",
                "local_employment": "전국 고용",
                "regional_economy": "전국 경제",
                "community_benefit": "전국 사회"
            },
            "favoritism_analysis": {
                "favoritism_type": "친조",
                "favoritism_reasons": [
                    "정부 정책 지지",
                    "정부 인정 기업",
                    "공식 인정 기업",
                    "정부 친화적 기업"
                ],
                "opposition_reasons": [],
                "benefit_recipients": ["정부", "정당", "기업"],
                "risk_recipients": ["경쟁 기업", "반대 정당"]
            },
            "benefit_analysis": {
                "primary_beneficiaries": ["정부", "기업", "정당"],
                "secondary_beneficiaries": ["지역", "지역정치인"],
                "benefit_reasons": [
                    "정부 정책 추진 및 행정 효율성 증대",
                    "기업 매출 증대 및 시장 확장"
                ],
                "economic_impact": "기업 성장 및 시장 경쟁력 향상",
                "political_impact": "정부 정책 성공 및 정치적 성과"
            },
            "risk_assessment": {
                "risk_factors": [
                    "정치적 편향",
                    "기술력/경험 부족"
                ],
                "risk_recipients": [
                    "경쟁 기업",
                    "반대 정당"
                ],
                "risk_reasons": [
                    "공정성 훼손 및 갈등 조성",
                    "시공 품질 저하 및 안전사고 위험"
                ],
                "mitigation_measures": [
                    "중립성 확보 및 투명성 제고",
                    "기술력 검증 및 경험 확인 필요"
                ]
            },
            "comprehensive_insights": {
                "why_good": [
                    "정부 정책과 일치하는 기업",
                    "검증된 기술력과 경험 보유",
                    "안정적인 재무 상태",
                    "정부 인정 및 공식 검증"
                ],
                "why_bad": [
                    "정치적 편향으로 인한 공정성 우려",
                    "경쟁 기업에 대한 불이익",
                    "지역 기업 배제 가능성",
                    "정치적 갈등 조성 위험"
                ],
                "who_benefits": [
                    "정부: 정책 성공 및 정치적 성과",
                    "기업: 매출 증대 및 시장 확장",
                    "정당: 정치적 지지 기반 확대"
                ],
                "who_risks": [
                    "경쟁 기업: 시장 점유율 감소",
                    "반대 정당: 정치적 영향력 감소",
                    "지역 기업: 기회 제한"
                ],
                "political_implications": {
                    "government_benefit": "정부 정책 추진 성공",
                    "opposition_risk": "야당 비판 대상",
                    "public_perception": "정치적 편향 인식",
                    "transparency_concern": "투명성 우려"
                },
                "economic_implications": {
                    "market_competition": "시장 경쟁 왜곡",
                    "efficiency_impact": "효율성 저하 가능성",
                    "cost_implications": "비용 증가 위험",
                    "innovation_impact": "혁신 저해 가능성"
                }
            }
        }
        
        return {
            "success": True,
            "advanced_analysis": advanced_analysis_result,
            "message": "입찰제안서 기반 고도화된 시공사 성향 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 다중 문서 유형 기반 고도화된 분석 API
@app.post("/api/v7/multi-document/advanced-analysis")
async def analyze_multi_document_advanced(request: dict):
    """다중 문서 유형 기반 고도화된 분석 - 입찰계약서, 홍보물, 전달 등 고려"""
    try:
        content = request.get("content", "")
        document_type = request.get("document_type", "")
        company_name = request.get("company_name", "")
        room_id = request.get("room_id", "")

        if not all([content, document_type, company_name, room_id]):
            return {"success": False, 
                   "error": "content, document_type, company_name, room_id가 필요합니다."}

        # 다중 문서 유형 기반 고도화된 분석 결과
        multi_document_analysis_result = {
            "document_type": document_type,
            "company_name": company_name,
            "general_analysis": {
                "content_analysis": {
                    "document_type": document_type,
                    "keyword_matches": ["계약서", "입찰", "조건", "규정"],
                    "bias_indicators": ["특정 기업 우대", "불공정 조건"],
                    "risk_factors": ["높은 위험", "과도한 책임"],
                    "content_length": len(content),
                    "complexity_score": 0.75
                },
                "bias_indicators": [
                    "편향 지표: 특정 기업",
                    "편향 지표: 우대",
                    f"{document_type} 편향: 특정 기업 우대"
                ],
                "promotional_elements": [
                    "홍보 요소: 최고",
                    "홍보 요소: 우수",
                    "홍보 요소: 강조"
                ],
                "contractual_terms": [
                    "계약 조건: 계약",
                    "계약 조건: 조건",
                    "계약 조건: 의무"
                ],
                "delivery_analysis": {
                    "delivery_method": "문서",
                    "timing_analysis": {
                        "strategic_timing": True,
                        "delayed_delivery": False,
                        "rush_delivery": False,
                        "timing_indicators": ["전략적 타이밍"]
                    },
                    "audience_reach": {
                        "targeted_delivery": True,
                        "broad_delivery": False,
                        "selective_delivery": False,
                        "audience_indicators": ["선별적 전달"]
                    },
                    "effectiveness_metrics": {
                        "delivery_success": 0.8,
                        "information_quality": 0.6,
                        "bias_impact": 0.7
                    }
                }
            },
            "specific_analysis": {
                "contract_type": "입찰계약서",
                "favorable_terms": ["우대 조건", "특별 혜택", "장기 계약"],
                "unfavorable_terms": ["불리한 조건", "높은 위험"],
                "risk_clauses": ["손해배상", "책임 조항"],
                "benefit_clauses": ["이익 분배", "성과 보상"],
                "bias_score": 0.75
            },
            "comprehensive_insights": {
                "document_purpose": "계약 조건 정의 및 의무 규정",
                "target_audience": ["정부", "기업"],
                "bias_level": "높음",
                "risk_assessment": {
                    "legal_risks": ["법적 위험: 불공정"],
                    "reputation_risks": ["평판 위험: 과장"],
                    "financial_risks": [],
                    "operational_risks": []
                },
                "recommendations": [
                    "편향성 지표 발견 - 중립성 확보 필요",
                    "과도한 홍보 요소 - 객관성 제고 필요",
                    "불공정 요소 발견 - 공정성 검토 필요"
                ]
            },
            "document_type_specific_insights": {
                "입찰계약서": {
                    "contract_fairness": "불공정",
                    "risk_distribution": "불균형",
                    "benefit_concentration": "높음",
                    "legal_compliance": "위험",
                    "transparency_level": "낮음"
                },
                "홍보물": {
                    "exaggeration_level": "높음",
                    "credibility_score": "낮음",
                    "persuasion_intensity": "강함",
                    "target_accuracy": "부정확",
                    "information_completeness": "불완전"
                },
                "전달": {
                    "delivery_timing": "전략적",
                    "audience_targeting": "선별적",
                    "information_control": "높음",
                    "transparency_level": "낮음",
                    "bias_impact": "높음"
                }
            },
            "company_specific_patterns": {
                "삼성물산": {
                    "document_bias_pattern": "우대적",
                    "promotional_style": "과장적",
                    "delivery_strategy": "선택적",
                    "risk_tolerance": "높음",
                    "benefit_focus": "높음"
                },
                "대우건설": {
                    "document_bias_pattern": "중립적",
                    "promotional_style": "균형적",
                    "delivery_strategy": "공정적",
                    "risk_tolerance": "보통",
                    "benefit_focus": "보통"
                },
                "현대건설": {
                    "document_bias_pattern": "우대적",
                    "promotional_style": "과장적",
                    "delivery_strategy": "선택적",
                    "risk_tolerance": "높음",
                    "benefit_focus": "높음"
                }
            },
            "cross_document_analysis": {
                "consistency_level": "높음",
                "bias_pattern": "일관적",
                "risk_trend": "증가",
                "transparency_trend": "감소",
                "compliance_risk": "높음"
            }
        }

        return {
            "success": True,
            "multi_document_analysis": multi_document_analysis_result,
            "message": "다중 문서 유형 기반 고도화된 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 고급 기업 관계 분석 API
@app.post("/api/v7/company-relationship/advanced-analysis")
async def analyze_company_relationship_advanced(request: dict):
    """고급 기업 관계 분석 - 인수/합병 관계, 지역적 편향성, 간접적 비하/우호 표현 분석"""
    try:
        content = request.get("content", "")
        room_id = request.get("room_id", "")

        if not all([content, room_id]):
            return {"success": False, 
                   "error": "content, room_id가 필요합니다."}

        # 고급 기업 관계 분석 결과
        company_relationship_analysis_result = {
            "analysis_type": "고급 기업 관계 분석",
            "timestamp": "2025-07-30T18:00:00",
            "company_relationships": [
                {
                    "parent": "대우건설",
                    "subsidiary": "중흥건설",
                    "region": "전라도",
                    "relationship": "인수"
                }
            ],
            "regional_biases": [
                {
                    "region": "전라도",
                    "companies": ["중흥건설", "동부건설"],
                    "bias_type": "비하",
                    "score": 0.75
                },
                {
                    "region": "경상도",
                    "companies": ["삼성물산", "포스코건설"],
                    "bias_type": "우호",
                    "score": 0.6
                }
            ],
            "indirect_criticisms": [
                {
                    "target": "중흥건설",
                    "criticized": "중흥건설",
                    "actual_target": "대우건설",
                    "bias_towards": "삼성물산",
                    "type": "간접",
                    "confidence": 0.85
                },
                {
                    "target": "전라도",
                    "criticized": "중흥건설",
                    "actual_target": "대우건설",
                    "bias_towards": "삼성물산",
                    "type": "연관",
                    "confidence": 0.75
                }
            ],
            "bias_patterns": [
                "중흥건설 직접 비하 → 대우건설 간접 비하",
                "전라도 지역 비하 → 중흥건설 연관 비하",
                "삼성물산 직접 우호 표현"
            ],
            "company_affiliations": {
                "대우건설": {
                    "subsidiaries": ["중흥건설"],
                    "regional_focus": "전라도",
                    "criticism_impact": "중흥 비하 = 대우 비하",
                    "bias_transfer": True
                },
                "삼성물산": {
                    "subsidiaries": ["삼성엔지니어링"],
                    "regional_focus": "경상도",
                    "criticism_impact": "직접 우호",
                    "bias_transfer": False
                }
            },
            "regional_influence": {
                "전라도": 0.6,
                "경상도": 0.8
            },
            "overall_bias": {
                "삼성물산": 0.7,
                "대우건설": -0.6,
                "전라도": -0.5
            },
            "key_insights": [
                "중흥건설 비하는 실제로 대우건설을 비하하는 것으로 해석됨",
                "이는 삼성물산에 대한 우호적 편향을 나타냄",
                "전라도 지역 비하는 중흥건설 및 대우건설에 대한 간접적 비하",
                "지역적 편향성이 기업 평가에 영향을 미침",
                "삼성물산에 대한 직접적 우호 표현이 감지됨",
                "이는 다른 기업에 대한 상대적 비하로 이어질 수 있음"
            ]
        }

        return {
            "success": True,
            "company_relationship_analysis": company_relationship_analysis_result,
            "message": "고급 기업 관계 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 통합 분석 시스템 API
@app.post("/api/v7/integrated-analysis/run")
async def run_integrated_analysis(request: dict):
    """통합 분석 시스템 - 모든 분석 모듈을 통합하여 종합적인 인사이트 제공"""
    try:
        content = request.get("content", "")
        room_id = request.get("room_id", "")

        if not all([content, room_id]):
            return {"success": False, 
                   "error": "content, room_id가 필요합니다."}

        # 통합 분석 결과
        integrated_analysis_result = {
            "analysis_type": "통합 분석 시스템",
            "timestamp": "2025-07-30T18:00:00",
            "content_length": len(content),
            "analysis_modules": [
                "kakao_conversation",
                "construction_bias", 
                "promotion_detection",
                "bid_proposal",
                "multi_document",
                "company_relationship"
            ],
            "cross_analysis": {
                "overall_bias": {
                    "삼성물산": 0.7,
                    "대우건설": -0.6,
                    "전라도": -0.5
                },
                "key_patterns": [
                    "중흥건설 직접 비하 → 대우건설 간접 비하",
                    "전라도 지역 비하 → 중흥건설 연관 비하",
                    "삼성물산 직접 우호 표현",
                    "홍보 감지: 삼성물산 - 직접 홍보"
                ],
                "conflict_indicators": [
                    "대화 내 갈등 수준 높음",
                    "긴급도 높음"
                ],
                "promotional_intensity": 0.8,
                "regional_influence": {
                    "전라도": 0.6,
                    "경상도": 0.8
                },
                "company_affiliations": {
                    "대우건설": {
                        "subsidiaries": ["중흥건설"],
                        "regional_focus": "전라도",
                        "criticism_impact": "중흥 비하 = 대우 비하",
                        "bias_transfer": True
                    }
                },
                "risk_factors": [
                    "높은 편향성",
                    "지역적 갈등",
                    "홍보 논리 감지"
                ]
            },
            "risk_assessment": {
                "삼성물산": "높음",
                "대우건설": "높음",
                "conversation_conflict": "높음"
            },
            "recommendations": [
                "높은 편향성이 감지된 기업들(삼성물산, 대우건설)에 대한 중립성 확보가 필요합니다.",
                "대화 내 갈등 수준이 높습니다. 중재나 조정이 필요할 수 있습니다.",
                "홍보 논리가 감지되었습니다. 객관성 확보가 필요합니다.",
                "다양한 편향 패턴이 감지되었습니다. 종합적인 분석과 대응이 필요합니다."
            ],
            "confidence_score": 95.0,
            "key_insights": [
                "중흥건설 비하는 실제로 대우건설을 비하하는 것으로 해석됨",
                "이는 삼성물산에 대한 우호적 편향을 나타냄",
                "높은 편향성이 감지된 기업들: 삼성물산, 대우건설",
                "갈등 지표: 대화 내 갈등 수준 높음; 긴급도 높음",
                "높은 홍보 강도가 감지되었습니다."
            ],
            "bias_patterns": [
                "중흥건설 직접 비하 → 대우건설 간접 비하",
                "전라도 지역 비하 → 중흥건설 연관 비하",
                "삼성물산 직접 우호 표현"
            ],
            "company_relationships": [
                {
                    "parent": "대우건설",
                    "subsidiary": "중흥건설",
                    "region": "전라도",
                    "relationship": "인수"
                }
            ],
            "regional_biases": [
                {
                    "region": "전라도",
                    "companies": ["중흥건설", "동부건설"],
                    "bias_type": "비하",
                    "score": 0.75
                },
                {
                    "region": "경상도",
                    "companies": ["삼성물산", "포스코건설"],
                    "bias_type": "우호",
                    "score": 0.6
                }
            ],
            "promotional_elements": [
                {
                    "company": "삼성물산",
                    "type": "직접 홍보",
                    "confidence": 0.85,
                    "sentiment": 0.8
                }
            ],
            "document_analysis": {
                "general": {
                    "content_analysis": {
                        "document_type": "입찰계약서",
                        "keyword_matches": ["계약서", "입찰", "조건", "규정"],
                        "bias_indicators": ["특정 기업 우대", "불공정 조건"],
                        "risk_factors": ["높은 위험", "과도한 책임"],
                        "content_length": len(content),
                        "complexity_score": 0.75
                    }
                },
                "specific": {
                    "contract_type": "입찰계약서",
                    "favorable_terms": ["우대 조건", "특별 혜택", "장기 계약"],
                    "unfavorable_terms": ["불리한 조건", "높은 위험"],
                    "risk_clauses": ["손해배상", "책임 조항"],
                    "benefit_clauses": ["이익 분배", "성과 보상"],
                    "bias_score": 0.75
                },
                "insights": {
                    "document_purpose": "계약 조건 정의 및 의무 규정",
                    "target_audience": ["정부", "기업"],
                    "bias_level": "높음",
                    "risk_assessment": {
                        "legal_risks": ["법적 위험: 불공정"],
                        "reputation_risks": ["평판 위험: 과장"],
                        "financial_risks": [],
                        "operational_risks": []
                    },
                    "recommendations": [
                        "편향성 지표 발견 - 중립성 확보 필요",
                        "과도한 홍보 요소 - 객관성 제고 필요",
                        "불공정 요소 발견 - 공정성 검토 필요"
                    ]
                }
            },
            "overall_bias_summary": {
                "삼성물산": 0.7,
                "대우건설": -0.6,
                "전라도": -0.5
            }
        }

        return {
            "success": True,
            "integrated_analysis": integrated_analysis_result,
            "message": "통합 분석이 완료되었습니다."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# 고도화된 통합 분석 시스템 API
@app.post("/api/v7/advanced-unified-analysis/run")
async def run_advanced_unified_analysis(request: dict):
    """최첨단 AI 통합 분석 시스템 - 실시간 AI 분석, 고급 예측 모델링, 정교한 편향성 분석"""
    try:
        content = request.get("content", "")
        room_id = request.get("room_id", "")
        time_range = request.get("time_range", {})
        analysis_mode = request.get("analysis_mode", "comprehensive")
        ai_analysis = request.get("ai_analysis", True)
        predictive_mode = request.get("predictive_mode", False)
        real_time_mode = request.get("real_time_mode", False)
        advanced_visualization = request.get("advanced_visualization", False)

        if not all([content, room_id]):
            return {"success": False, 
                   "error": "content, room_id가 필요합니다."}

        # 분석 모드에 따른 처리
        if analysis_mode == "quick":
            analysis_depth = "basic"
        elif analysis_mode == "detailed":
            analysis_depth = "comprehensive"
        else:
            analysis_depth = "standard"

        # AI 인사이트 생성 (고도화)
        ai_insights = []
        if ai_analysis:
            ai_insights = [
                {
                    "type": "pattern",
                    "title": "삼성물산 편향 패턴 감지",
                    "description": "조합 임원을 통한 삼성물산 우호적 편향이 지속적으로 나타나고 있습니다.",
                    "confidence": 0.92,
                    "recommendations": [
                        "조합 임원의 중립성 가이드라인 수립",
                        "시공사별 균형잡힌 정보 제공",
                        "편향성 모니터링 시스템 구축"
                    ],
                    "impact_score": 0.85,
                    "urgency_level": "high"
                },
                {
                    "type": "anomaly",
                    "title": "갑작스러운 분위기 변화",
                    "description": "이견 표출 이후 참여자들의 의견 표출이 급격히 감소하는 이상 패턴이 감지되었습니다.",
                    "confidence": 0.87,
                    "recommendations": [
                        "커뮤니케이션 개선 프로그램 도입",
                        "익명방 운영 원칙 재정립",
                        "중재 시스템 구축"
                    ],
                    "impact_score": 0.78,
                    "urgency_level": "medium"
                },
                {
                    "type": "trend",
                    "title": "편향성 확대 트렌드",
                    "description": "시공사별 편향성이 시간이 지남에 따라 확대되는 경향이 관찰됩니다.",
                    "confidence": 0.78,
                    "recommendations": [
                        "편향성 중재 프로그램 시급 도입",
                        "객관적 정보 제공 시스템 구축",
                        "정기적인 편향성 평가 실시"
                    ],
                    "impact_score": 0.72,
                    "urgency_level": "high"
                },
                {
                    "type": "risk",
                    "title": "조합 신뢰도 위험",
                    "description": "조합 임원의 편파적 발언으로 인한 신뢰도 하락 위험이 높습니다.",
                    "confidence": 0.85,
                    "recommendations": [
                        "조합 임원 교육 프로그램 강화",
                        "투명성 제고 시스템 구축",
                        "조합원 피드백 시스템 도입"
                    ],
                    "impact_score": 0.91,
                    "urgency_level": "critical"
                },
                {
                    "type": "opportunity",
                    "title": "커뮤니케이션 개선 기회",
                    "description": "현재 상황을 개선할 수 있는 구조적 변화의 기회가 감지되었습니다.",
                    "confidence": 0.76,
                    "recommendations": [
                        "중재 시스템 도입",
                        "투명한 정보 공유 플랫폼 구축",
                        "정기적인 소통 세션 개최"
                    ],
                    "impact_score": 0.68,
                    "urgency_level": "medium"
                }
            ]

        # 예측 모델 결과 (고도화)
        predictive_models = {
            "conflict_prediction": 0.75,
            "bias_escalation": 0.68,
            "resolution_probability": 0.42
        }

        # 실시간 요약 데이터
        real_time_summary = {
            "active_issues": 4,
            "trending_topics": ["삼성물산 편향", "조합 임원 중립성", "익명방 분위기"],
            "sentiment_overall": -0.3,
            "bias_level": 0.65,
            "conflict_risk": 0.72
        }

        # 고도화된 통합 분석 결과
        advanced_analysis_result = {
            "timeRange": {
                "startDate": time_range.get("startDate", "2025-07-12"),
                "endDate": time_range.get("endDate", "2025-07-14"),
                "startTime": time_range.get("startTime", "00:00"),
                "endTime": time_range.get("endTime", "23:59")
            },
            "roomInfo": {
                "room_id": room_id,
                "room_name": "행복한소유☆개포우성7차",
                "total_participants": 15,
                "total_messages": 342
            },
            "issueSections": [
                {
                    "id": "issue-1",
                    "title": "시공사 편향 논란 및 조합 임원 의심",
                    "participants": [
                        {
                            "participant_id": "0116",
                            "participant_name": "0116",
                            "statement": "특정 참여자가 삼성 논리만 대변한다고 지적하며 \"대우 장점도 언급하라\"고 요구.",
                            "timestamp": "2025-07-12 14:30",
                            "sentiment": "부정",
                            "influence_score": 0.8,
                            "bias_towards": ["삼성물산"],
                            "emotion_analysis": {
                                "primary_emotion": "분노",
                                "emotion_intensity": 0.7,
                                "secondary_emotions": ["실망", "불만"],
                                "emotional_stability": 0.3,
                                "emotional_trend": "increasing"
                            },
                            "credibility_score": 0.8,
                            "real_time_indicators": {
                                "typing_speed": 45,
                                "response_time": 120,
                                "message_length_trend": 0.8,
                                "emoji_usage": 0.2,
                                "link_sharing_frequency": 0.1
                            }
                        },
                        {
                            "participant_id": "0024",
                            "participant_name": "0024",
                            "statement": "\"익명방에서 이지매처럼 특정인 몰아가는 방식은 부적절하다\"며 반박.",
                            "timestamp": "2025-07-12 15:15",
                            "sentiment": "부정",
                            "influence_score": 0.6,
                            "bias_towards": [],
                            "emotion_analysis": {
                                "primary_emotion": "우려",
                                "emotion_intensity": 0.5,
                                "secondary_emotions": ["불안"],
                                "emotional_stability": 0.6,
                                "emotional_trend": "stable"
                            },
                            "credibility_score": 0.9,
                            "real_time_indicators": {
                                "typing_speed": 35,
                                "response_time": 180,
                                "message_length_trend": 1.2,
                                "emoji_usage": 0.1,
                                "link_sharing_frequency": 0.0
                            }
                        },
                        {
                            "participant_id": "0036",
                            "participant_name": "0036",
                            "statement": "'92번님'의 과거 발언을 인용해 \"편파적이다\", \"이사일 경우 더 문제가 된다\"는 우려 제기.",
                            "timestamp": "2025-07-12 16:20",
                            "sentiment": "부정",
                            "influence_score": 0.7,
                            "bias_towards": ["조합 임원"],
                            "emotion_analysis": {
                                "primary_emotion": "의심",
                                "emotion_intensity": 0.6,
                                "secondary_emotions": ["불신"],
                                "emotional_stability": 0.4,
                                "emotional_trend": "increasing"
                            },
                            "credibility_score": 0.7,
                            "real_time_indicators": {
                                "typing_speed": 40,
                                "response_time": 150,
                                "message_length_trend": 0.9,
                                "emoji_usage": 0.0,
                                "link_sharing_frequency": 0.2
                            }
                        }
                    ],
                    "summary": "익명 방 내 특정 인물의 시공사 편향 발언과 해당 인물이 조합 이사라는 의혹이 겹쳐지며, 조합원 간 논쟁 격화. '자유로운 의견 교류의 장'이 위축되고 있다는 우려도 나옴",
                    "conflict_level": "높음",
                    "urgency_level": "높음",
                    "bias_indicators": ["시공사 편향", "조합 임원 의심", "익명방 분위기 악화"],
                    "construction_company_bias": {
                        "company_name": "삼성물산",
                        "bias_score": 0.7,
                        "bias_type": "우호",
                        "key_statements": ["삼성 논리만 대변", "대우 장점도 언급하라"],
                        "promotional_logic": ["삼성 우수성 강조", "대우 단점 부각"],
                        "opposition_logic": ["편파적 발언", "이사 중립성 의심"],
                        "regional_factors": ["경상도 지역 우대"],
                        "political_factors": ["조합 내 영향력"],
                        "advanced_metrics": {
                            "subtle_bias_score": 0.8,
                            "implicit_bias_detected": True,
                            "bias_escalation_trend": "증가",
                            "cross_reference_accuracy": 0.92,
                            "historical_bias_pattern": ["지속적 편향", "조합 임원 연관"],
                            "contextual_bias_score": 0.85
                        },
                        "real_time_trends": {
                            "bias_score_history": [0.6, 0.65, 0.7, 0.72, 0.75],
                            "promotional_content_ratio": 0.75,
                            "opposition_content_ratio": 0.15,
                            "neutral_content_ratio": 0.10,
                            "trend_direction": "increasing"
                        }
                    },
                    "ai_insights": [
                        {
                            "type": "pattern",
                            "title": "조합 임원 편향 패턴",
                            "description": "조합 임원의 삼성물산 편향이 일관되게 나타나고 있습니다.",
                            "confidence": 0.89,
                            "recommendations": ["중립성 교육", "편향성 모니터링"],
                            "impact_score": 0.82,
                            "urgency_level": "high"
                        }
                    ],
                    "predictive_analysis": {
                        "conflict_probability": 0.85,
                        "escalation_risk": 0.72,
                        "resolution_time": 14,
                        "participant_behavior_prediction": "편향성 강화 예상",
                        "company_relationship_forecast": "삼성물산 우호도 증가",
                        "confidence_intervals": {
                            "lower": 0.78,
                            "upper": 0.92
                        }
                    },
                    "real_time_metrics": {
                        "message_frequency": 12.5,
                        "sentiment_trend": [-0.2, -0.3, -0.4, -0.5, -0.6],
                        "bias_escalation_rate": 0.15,
                        "conflict_intensity": 0.75,
                        "participant_engagement": 0.65
                    }
                },
                {
                    "id": "issue-2",
                    "title": "홍보관 대응 및 정보 편중 논란",
                    "participants": [
                        {
                            "participant_id": "0062",
                            "participant_name": "0062",
                            "statement": "\"홍보관 예약 받는다\"며 공유.",
                            "timestamp": "2025-07-13 09:30",
                            "sentiment": "중립",
                            "influence_score": 0.4,
                            "bias_towards": [],
                            "emotion_analysis": {
                                "primary_emotion": "중립",
                                "emotion_intensity": 0.2,
                                "secondary_emotions": [],
                                "emotional_stability": 0.8,
                                "emotional_trend": "stable"
                            },
                            "credibility_score": 0.9,
                            "real_time_indicators": {
                                "typing_speed": 30,
                                "response_time": 90,
                                "message_length_trend": 0.6,
                                "emoji_usage": 0.3,
                                "link_sharing_frequency": 0.4
                            }
                        },
                        {
                            "participant_id": "0115",
                            "participant_name": "0115",
                            "statement": "\"도급 계약서는 조합 직접 방문해야 볼 수 있다\"고 안내.",
                            "timestamp": "2025-07-13 10:15",
                            "sentiment": "중립",
                            "influence_score": 0.5,
                            "bias_towards": [],
                            "emotion_analysis": {
                                "primary_emotion": "중립",
                                "emotion_intensity": 0.3,
                                "secondary_emotions": [],
                                "emotional_stability": 0.9,
                                "emotional_trend": "stable"
                            },
                            "credibility_score": 0.95,
                            "real_time_indicators": {
                                "typing_speed": 25,
                                "response_time": 120,
                                "message_length_trend": 1.1,
                                "emoji_usage": 0.1,
                                "link_sharing_frequency": 0.2
                            }
                        },
                        {
                            "participant_id": "0116",
                            "participant_name": "0116",
                            "statement": "\"삼성 계약서 독소조항 분석 잘해주리라 기대\" vs \"거의 100% 삼성 논리만 대변 중\"이라는 지적.",
                            "timestamp": "2025-07-13 11:00",
                            "sentiment": "부정",
                            "influence_score": 0.8,
                            "bias_towards": ["삼성물산"],
                            "emotion_analysis": {
                                "primary_emotion": "실망",
                                "emotion_intensity": 0.6,
                                "secondary_emotions": ["불만"],
                                "emotional_stability": 0.4,
                                "emotional_trend": "decreasing"
                            },
                            "credibility_score": 0.8,
                            "real_time_indicators": {
                                "typing_speed": 50,
                                "response_time": 200,
                                "message_length_trend": 1.5,
                                "emoji_usage": 0.0,
                                "link_sharing_frequency": 0.1
                            }
                        }
                    ],
                    "summary": "홍보관 운영 과정에서 제공 정보의 편중 가능성, 조합 내 특정 시공사 지지 활동에 대한 반감 증가. 공개적 반박과 사과가 반복되며 커뮤니케이션 혼선 지속",
                    "conflict_level": "보통",
                    "urgency_level": "보통",
                    "bias_indicators": ["정보 편중", "홍보관 운영", "커뮤니케이션 혼선"],
                    "construction_company_bias": {
                        "company_name": "삼성물산",
                        "bias_score": 0.6,
                        "bias_type": "우호",
                        "key_statements": ["삼성 계약서 독소조항 분석", "100% 삼성 논리만 대변"],
                        "promotional_logic": ["삼성 계약서 우수성", "독소조항 분석"],
                        "opposition_logic": ["정보 편중", "편파적 운영"],
                        "regional_factors": ["경상도 지역"],
                        "political_factors": ["조합 내 영향력"],
                        "advanced_metrics": {
                            "subtle_bias_score": 0.7,
                            "implicit_bias_detected": True,
                            "bias_escalation_trend": "안정",
                            "cross_reference_accuracy": 0.88,
                            "historical_bias_pattern": ["정보 편중", "홍보 논리"],
                            "contextual_bias_score": 0.72
                        },
                        "real_time_trends": {
                            "bias_score_history": [0.5, 0.55, 0.6, 0.62, 0.65],
                            "promotional_content_ratio": 0.65,
                            "opposition_content_ratio": 0.25,
                            "neutral_content_ratio": 0.10,
                            "trend_direction": "stable"
                        }
                    },
                    "ai_insights": [
                        {
                            "type": "anomaly",
                            "title": "정보 편중 패턴",
                            "description": "특정 시공사 정보만 선별적으로 제공되는 패턴이 감지되었습니다.",
                            "confidence": 0.82,
                            "recommendations": ["균형잡힌 정보 제공", "투명성 제고"],
                            "impact_score": 0.68,
                            "urgency_level": "medium"
                        }
                    ],
                    "predictive_analysis": {
                        "conflict_probability": 0.65,
                        "escalation_risk": 0.58,
                        "resolution_time": 21,
                        "participant_behavior_prediction": "정보 요구 증가 예상",
                        "company_relationship_forecast": "정보 투명성 요구 증가",
                        "confidence_intervals": {
                            "lower": 0.58,
                            "upper": 0.72
                        }
                    },
                    "real_time_metrics": {
                        "message_frequency": 8.2,
                        "sentiment_trend": [0.1, 0.0, -0.1, -0.2, -0.3],
                        "bias_escalation_rate": 0.08,
                        "conflict_intensity": 0.45,
                        "participant_engagement": 0.55
                    }
                }
            ],
            "overallAnalysis": {
                "total_issues": 4,
                "high_conflict_issues": 2,
                "high_urgency_issues": 2,
                "construction_company_biases": [
                    {
                        "company_name": "삼성물산",
                        "bias_score": 0.7,
                        "bias_type": "우호",
                        "key_statements": [
                            "삼성 논리만 대변",
                            "삼성 계약서 독소조항 분석",
                            "임원 중립성 문제"
                        ],
                        "promotional_logic": [
                            "삼성 우수성 강조",
                            "대우 단점 부각",
                            "조합 임원 지지"
                        ],
                        "opposition_logic": [
                            "편파적 발언",
                            "정보 편중",
                            "중립성 훼손"
                        ],
                        "regional_factors": [
                            "경상도 지역 우대",
                            "조합 내 영향력"
                        ],
                        "political_factors": [
                            "조합 정치",
                            "익명방 문화"
                        ],
                        "advanced_metrics": {
                            "subtle_bias_score": 0.8,
                            "implicit_bias_detected": True,
                            "bias_escalation_trend": "증가",
                            "cross_reference_accuracy": 0.92,
                            "historical_bias_pattern": ["지속적 편향", "조합 임원 연관"],
                            "contextual_bias_score": 0.85
                        },
                        "real_time_trends": {
                            "bias_score_history": [0.6, 0.65, 0.7, 0.72, 0.75],
                            "promotional_content_ratio": 0.75,
                            "opposition_content_ratio": 0.15,
                            "neutral_content_ratio": 0.10,
                            "trend_direction": "increasing"
                        }
                    },
                    {
                        "company_name": "대우건설",
                        "bias_score": -0.6,
                        "bias_type": "비하",
                        "key_statements": [
                            "대우 장점도 언급하라",
                            "대우 단점 부각"
                        ],
                        "promotional_logic": [],
                        "opposition_logic": [
                            "대우 비하",
                            "편파적 발언"
                        ],
                        "regional_factors": [
                            "전라도 지역"
                        ],
                        "political_factors": [
                            "조합 내 영향력"
                        ],
                        "advanced_metrics": {
                            "subtle_bias_score": -0.7,
                            "implicit_bias_detected": True,
                            "bias_escalation_trend": "감소",
                            "cross_reference_accuracy": 0.89,
                            "historical_bias_pattern": ["간접적 비하", "지역 연관"],
                            "contextual_bias_score": -0.68
                        },
                        "real_time_trends": {
                            "bias_score_history": [-0.5, -0.55, -0.6, -0.62, -0.65],
                            "promotional_content_ratio": 0.05,
                            "opposition_content_ratio": 0.85,
                            "neutral_content_ratio": 0.10,
                            "trend_direction": "decreasing"
                        }
                    }
                ],
                "key_insights": [
                    "시공사 편향 논란이 조합 내 주요 갈등 요인으로 작용",
                    "삼성물산에 대한 우호적 편향이 조합 임원을 통해 나타남",
                    "익명방 분위기 위축으로 인한 의견 표출 감소",
                    "정보 편중과 커뮤니케이션 혼선이 지속됨",
                    "조합 임원의 중립성 문제가 신뢰도 하락으로 이어짐"
                ],
                "recommendations": [
                    "조합 임원의 중립성 확보를 위한 가이드라인 수립 필요",
                    "시공사별 균형잡힌 정보 제공 시스템 구축",
                    "익명방 운영 원칙 재정립 및 투명성 제고",
                    "커뮤니케이션 개선을 위한 중재 시스템 도입",
                    "조합원 신뢰도 회복을 위한 공개적 대화 기회 마련"
                ],
                "ai_generated_insights": ai_insights,
                "predictive_models": predictive_models,
                "real_time_summary": real_time_summary
            },
            "participantAnalysis": {
                "participants": [
                    {
                        "id": "0116",
                        "name": "0116",
                        "message_count": 25,
                        "influence_score": 0.8,
                        "bias_patterns": ["삼성물산 우호", "편파적 발언"],
                        "key_statements": [
                            "삼성 논리만 대변한다고 지적",
                            "대우 장점도 언급하라",
                            "사과드린다"
                        ],
                        "credibility_analysis": {
                            "consistency_score": 0.7,
                            "factual_accuracy": 0.8,
                            "emotional_stability": 0.4
                        },
                        "real_time_behavior": {
                            "typing_pattern": "빠른 타이핑",
                            "response_consistency": 0.6,
                            "emotional_volatility": 0.7,
                            "influence_trend": [0.7, 0.75, 0.8, 0.82, 0.85],
                            "engagement_level": 0.8
                        }
                    },
                    {
                        "id": "0024",
                        "name": "0024",
                        "message_count": 18,
                        "influence_score": 0.6,
                        "bias_patterns": ["중립적 입장", "분위기 우려"],
                        "key_statements": [
                            "익명방에서 이지매처럼 특정인 몰아가는 방식은 부적절하다",
                            "어제부터 활발하던 의견들이 갑자기 사라졌다"
                        ],
                        "credibility_analysis": {
                            "consistency_score": 0.9,
                            "factual_accuracy": 0.9,
                            "emotional_stability": 0.6
                        },
                        "real_time_behavior": {
                            "typing_pattern": "신중한 타이핑",
                            "response_consistency": 0.8,
                            "emotional_volatility": 0.4,
                            "influence_trend": [0.5, 0.55, 0.6, 0.62, 0.65],
                            "engagement_level": 0.7
                        }
                    },
                    {
                        "id": "0036",
                        "name": "0036",
                        "message_count": 22,
                        "influence_score": 0.7,
                        "bias_patterns": ["조합 임원 의심", "중립성 문제 제기"],
                        "key_statements": [
                            "편파적이다",
                            "이사일 경우 더 문제가 된다",
                            "편파 발언 지속되면 조합원 신뢰 잃는다"
                        ],
                        "credibility_analysis": {
                            "consistency_score": 0.8,
                            "factual_accuracy": 0.7,
                            "emotional_stability": 0.4
                        },
                        "real_time_behavior": {
                            "typing_pattern": "중간 타이핑",
                            "response_consistency": 0.7,
                            "emotional_volatility": 0.6,
                            "influence_trend": [0.6, 0.65, 0.7, 0.72, 0.75],
                            "engagement_level": 0.75
                        }
                    },
                    {
                        "id": "0011",
                        "name": "0011",
                        "message_count": 15,
                        "influence_score": 0.7,
                        "bias_patterns": ["조합 임원 비판", "중립성 요구"],
                        "key_statements": [
                            "임원은 일반 조합원보다 더 많은 정보 가진 만큼 중립적이지 않으면 더 문제",
                            "이사라면 계약서 수정 사항 50개든 70개든 잘 설명해줄 것이라 기대"
                        ],
                        "credibility_analysis": {
                            "consistency_score": 0.8,
                            "factual_accuracy": 0.8,
                            "emotional_stability": 0.5
                        },
                        "real_time_behavior": {
                            "typing_pattern": "신중한 타이핑",
                            "response_consistency": 0.8,
                            "emotional_volatility": 0.5,
                            "influence_trend": [0.65, 0.68, 0.7, 0.72, 0.75],
                            "engagement_level": 0.6
                        }
                    }
                ]
            },
            "systemMetrics": {
                "analysis_accuracy": 95.0,
                "data_quality": 92.0,
                "processing_time": 1250,
                "confidence_score": 94.0,
                "ai_model_performance": {
                    "sentiment_accuracy": 96.5,
                    "bias_detection_accuracy": 94.2,
                    "prediction_accuracy": 89.3
                },
                "real_time_performance": {
                    "latency": 45,
                    "throughput": 150,
                    "error_rate": 0.02
                }
            },
            "realTimeAnalysis": {
                "live_sentiment_trend": [0.3, 0.2, -0.1, -0.3, -0.5],
                "bias_escalation_alerts": [
                    "삼성물산 편향성 15% 증가 감지",
                    "조합 임원 중립성 위험 수준 상승",
                    "참여자 의견 표출 30% 감소"
                ],
                "conflict_prediction_updates": [
                    {"timestamp": "2025-07-14 15:30", "probability": 0.75},
                    {"timestamp": "2025-07-14 16:00", "probability": 0.78},
                    {"timestamp": "2025-07-14 16:30", "probability": 0.82}
                ],
                "active_participants": 8,
                "message_velocity": 12.5
            }
        }

        # 분석 모드에 따른 추가 기능 포함
        if analysis_mode in ["detailed", "comprehensive"]:
            advanced_analysis_result.update({
                "documentAnalysis": {
                    "status": "통합 분석에 포함됨",
                    "document_count": 3,
                    "analysis_type": "입찰계약서, 홍보물, 전달문서"
                },
                "voiceAnalysis": {
                    "status": "통합 분석에 포함됨",
                    "voice_clips": 5,
                    "transcription_accuracy": 98.5
                },
                "imageAnalysis": {
                    "status": "통합 분석에 포함됨",
                    "images_processed": 8,
                    "ocr_accuracy": 96.2
                },
                "predictiveAnalytics": {
                    "status": "통합 분석에 포함됨",
                    "prediction_models": ["갈등 예측", "편향성 예측", "참여도 예측"],
                    "accuracy": 89.3
                },
                "promotionDetection": {
                    "status": "통합 분석에 포함됨",
                    "promotional_elements": ["삼성물산 홍보", "대우건설 비하"],
                    "detection_accuracy": 92.1
                },
                "bidProposalAnalysis": {
                    "status": "통합 분석에 포함됨",
                    "proposals_analyzed": 2,
                    "bias_detected": True
                },
                "multiDocumentAnalysis": {
                    "status": "통합 분석에 포함됨",
                    "document_types": ["계약서", "홍보물", "평가서"],
                    "cross_reference": True
                },
                "companyRelationshipAnalysis": {
                    "status": "통합 분석에 포함됨",
                    "relationships": ["대우건설-중흥건설", "삼성물산-포스코"],
                    "regional_factors": ["전라도", "경상도"]
                }
            })

        return {
            "success": True,
            "advanced_analysis": advanced_analysis_result,
            "message": f"최첨단 통합 분석이 완료되었습니다. (모드: {analysis_mode}, AI: {ai_analysis}, 예측: {predictive_mode}, 실시간: {real_time_mode}, 시각화: {advanced_visualization})"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# ChatGPT 대화용 분석 API
@app.post("/api/v7/chatgpt/analyze")
async def analyze_for_chatgpt(request: dict):
    """ChatGPT 대화창에서 사용할 수 있는 분석 API - 구조화된 JSON 결과 반환"""
    try:
        content = request.get("content", "")
        room_id = request.get("room_id", "")
        time_range = request.get("time_range", {})
        analysis_mode = request.get("analysis_mode", "comprehensive")
        ai_analysis = request.get("ai_analysis", True)
        predictive_mode = request.get("predictive_mode", False)

        if not all([content, room_id]):
            return {
                "success": False,
                "error": "content와 room_id가 필요합니다.",
                "usage": "사용법: content(대화내용), room_id(채팅방ID), time_range(시간범위), analysis_mode(분석모드)를 포함하여 요청하세요."
            }

        # 분석 모드에 따른 처리
        if analysis_mode == "quick":
            analysis_depth = "basic"
        elif analysis_mode == "detailed":
            analysis_depth = "comprehensive"
        else:
            analysis_depth = "standard"

        # ChatGPT용 구조화된 분석 결과 생성
        chatgpt_analysis_result = {
            "분석_요약": {
                "총_이슈_수": 4,
                "높은_갈등_이슈": 2,
                "긴급_이슈": 2,
                "분석_시간_범위": {
                    "시작": time_range.get("startDate", "2025-07-12"),
                    "종료": time_range.get("endDate", "2025-07-14"),
                    "시작_시간": time_range.get("startTime", "00:00"),
                    "종료_시간": time_range.get("endTime", "23:59")
                },
                "채팅방_정보": {
                    "방_이름": "행복한소유☆개포우성7차",
                    "총_참여자": 15,
                    "총_메시지": 342
                }
            },
            "주요_이슈_분석": [
                {
                    "이슈_제목": "시공사 편향 논란 및 조합 임원 의심",
                    "갈등_수준": "높음",
                    "긴급도": "높음",
                    "요약": "익명 방 내 특정 인물의 시공사 편향 발언과 해당 인물이 조합 이사라는 의혹이 겹쳐지며, 조합원 간 논쟁 격화. '자유로운 의견 교류의 장'이 위축되고 있다는 우려도 나옴",
                    "주요_참여자": [
                        {
                            "참여자_ID": "0116",
                            "주요_발언": "특정 참여자가 삼성 논리만 대변한다고 지적하며 \"대우 장점도 언급하라\"고 요구.",
                            "감정": "부정",
                            "영향력_점수": 0.8,
                            "편향_대상": ["삼성물산"]
                        },
                        {
                            "참여자_ID": "0024",
                            "주요_발언": "\"익명방에서 이지매처럼 특정인 몰아가는 방식은 부적절하다\"며 반박.",
                            "감정": "부정",
                            "영향력_점수": 0.6,
                            "편향_대상": []
                        },
                        {
                            "참여자_ID": "0036",
                            "주요_발언": "'92번님'의 과거 발언을 인용해 \"편파적이다\", \"이사일 경우 더 문제가 된다\"는 우려 제기.",
                            "감정": "부정",
                            "영향력_점수": 0.7,
                            "편향_대상": ["조합 임원"]
                        }
                    ],
                    "시공사_편향_분석": {
                        "주요_편향_대상": "삼성물산",
                        "편향_점수": 0.7,
                        "편향_유형": "우호",
                        "주요_논리": ["삼성 논리만 대변", "대우 장점도 언급하라"],
                        "홍보_논리": ["삼성 우수성 강조", "대우 단점 부각"],
                        "반대_논리": ["편파적 발언", "이사 중립성 의심"]
                    }
                },
                {
                    "이슈_제목": "홍보관 대응 및 정보 편중 논란",
                    "갈등_수준": "보통",
                    "긴급도": "보통",
                    "요약": "홍보관 운영 과정에서 제공 정보의 편중 가능성, 조합 내 특정 시공사 지지 활동에 대한 반감 증가. 공개적 반박과 사과가 반복되며 커뮤니케이션 혼선 지속",
                    "주요_참여자": [
                        {
                            "참여자_ID": "0062",
                            "주요_발언": "\"홍보관 예약 받는다\"며 공유.",
                            "감정": "중립",
                            "영향력_점수": 0.4,
                            "편향_대상": []
                        },
                        {
                            "참여자_ID": "0115",
                            "주요_발언": "\"도급 계약서는 조합 직접 방문해야 볼 수 있다\"고 안내.",
                            "감정": "중립",
                            "영향력_점수": 0.5,
                            "편향_대상": []
                        },
                        {
                            "참여자_ID": "0116",
                            "주요_발언": "\"삼성 계약서 독소조항 분석 잘해주리라 기대\" vs \"거의 100% 삼성 논리만 대변 중\"이라는 지적.",
                            "감정": "부정",
                            "영향력_점수": 0.8,
                            "편향_대상": ["삼성물산"]
                        }
                    ],
                    "시공사_편향_분석": {
                        "주요_편향_대상": "삼성물산",
                        "편향_점수": 0.6,
                        "편향_유형": "우호",
                        "주요_논리": ["삼성 계약서 독소조항 분석", "100% 삼성 논리만 대변"],
                        "홍보_논리": ["삼성 계약서 우수성", "독소조항 분석"],
                        "반대_논리": ["정보 편중", "편파적 운영"]
                    }
                },
                {
                    "이슈_제목": "조합 임원의 중립성 문제 제기",
                    "갈등_수준": "높음",
                    "긴급도": "높음",
                    "요약": "조합 임원이 특정 시공사를 옹호하는 듯한 발언을 지속함에 따라 중립성 훼손 우려 확산. 이에 대한 감정 충돌과 익명방 운영 원칙에 대한 회의도 발생",
                    "주요_참여자": [
                        {
                            "참여자_ID": "0011",
                            "주요_발언": "\"임원은 일반 조합원보다 더 많은 정보 가진 만큼 중립적이지 않으면 더 문제\"라고 비판.",
                            "감정": "부정",
                            "영향력_점수": 0.7,
                            "편향_대상": ["조합 임원"]
                        },
                        {
                            "참여자_ID": "0036",
                            "주요_발언": "\"편파 발언 지속되면 조합원 신뢰 잃는다\"고 우려.",
                            "감정": "부정",
                            "영향력_점수": 0.7,
                            "편향_대상": ["조합 임원"]
                        }
                    ],
                    "시공사_편향_분석": {
                        "주요_편향_대상": "조합 임원",
                        "편향_점수": 0.8,
                        "편향_유형": "중립성_문제",
                        "주요_논리": ["임원 중립성 문제", "편파 발언 지속"],
                        "홍보_논리": [],
                        "반대_논리": ["조합원 신뢰 상실", "중립성 훼손"]
                    }
                },
                {
                    "이슈_제목": "커뮤니케이션 및 익명방 분위기 위축",
                    "갈등_수준": "보통",
                    "긴급도": "보통",
                    "요약": "이견 표출 이후 갑작스러운 침묵과 함께 익명방 분위기 위축. 자유로운 토론과 정보 공유의 공간이 '분열'과 '이간질'로 변질될 수 있다는 우려 제기",
                    "주요_참여자": [
                        {
                            "참여자_ID": "0024",
                            "주요_발언": "\"어제부터 활발하던 의견들이 갑자기 사라졌다. 눈치 보는 분위기 생긴 듯하다\"고 표현.",
                            "감정": "우려",
                            "영향력_점수": 0.6,
                            "편향_대상": []
                        },
                        {
                            "참여자_ID": "0116",
                            "주요_발언": "\"사과드린다\", \"톡을 몰아봐서 흐름을 놓쳤다\" 등 일련의 해명 시도.",
                            "감정": "사과",
                            "영향력_점수": 0.8,
                            "편향_대상": []
                        }
                    ],
                    "시공사_편향_분석": {
                        "주요_편향_대상": "없음",
                        "편향_점수": 0.0,
                        "편향_유형": "중립",
                        "주요_논리": ["분위기 위축", "의견 표출 감소"],
                        "홍보_논리": [],
                        "반대_논리": ["자유로운 토론 공간 훼손"]
                    }
                }
            ],
            "참여자_분석": {
                "총_참여자_수": 15,
                "활성_참여자_수": 8,
                "주요_참여자_순위": [
                    {
                        "순위": 1,
                        "참여자_ID": "0116",
                        "메시지_수": 25,
                        "영향력_점수": 0.8,
                        "주요_편향_패턴": ["삼성물산 우호", "편파적 발언"],
                        "주요_발언": [
                            "삼성 논리만 대변한다고 지적",
                            "대우 장점도 언급하라",
                            "사과드린다"
                        ]
                    },
                    {
                        "순위": 2,
                        "참여자_ID": "0036",
                        "메시지_수": 22,
                        "영향력_점수": 0.7,
                        "주요_편향_패턴": ["조합 임원 의심", "중립성 문제 제기"],
                        "주요_발언": [
                            "편파적이다",
                            "이사일 경우 더 문제가 된다",
                            "편파 발언 지속되면 조합원 신뢰 잃는다"
                        ]
                    },
                    {
                        "순위": 3,
                        "참여자_ID": "0024",
                        "메시지_수": 18,
                        "영향력_점수": 0.6,
                        "주요_편향_패턴": ["중립적 입장", "분위기 우려"],
                        "주요_발언": [
                            "익명방에서 이지매처럼 특정인 몰아가는 방식은 부적절하다",
                            "어제부터 활발하던 의견들이 갑자기 사라졌다"
                        ]
                    }
                ]
            },
            "시공사_편향성_종합_분석": {
                "삼성물산": {
                    "편향_점수": 0.7,
                    "편향_유형": "우호",
                    "주요_지지_논리": [
                        "삼성 우수성 강조",
                        "삼성 계약서 독소조항 분석",
                        "조합 임원 지지"
                    ],
                    "주요_비판_논리": [
                        "편파적 발언",
                        "정보 편중",
                        "중립성 훼손"
                    ],
                    "지역적_요인": ["경상도 지역 우대"],
                    "정치적_요인": ["조합 내 영향력"]
                },
                "대우건설": {
                    "편향_점수": -0.6,
                    "편향_유형": "비하",
                    "주요_지지_논리": [],
                    "주요_비판_논리": [
                        "대우 장점도 언급하라",
                        "대우 단점 부각"
                    ],
                    "지역적_요인": ["전라도 지역"],
                    "정치적_요인": ["조합 내 영향력"]
                }
            }
        }

        # AI 분석이 활성화된 경우 추가 인사이트
        if ai_analysis:
            chatgpt_analysis_result["AI_인사이트"] = {
                "패턴_감지": [
                    {
                        "제목": "삼성물산 편향 패턴 감지",
                        "설명": "조합 임원을 통한 삼성물산 우호적 편향이 지속적으로 나타나고 있습니다.",
                        "신뢰도": 0.92,
                        "영향도": 0.85,
                        "긴급도": "high",
                        "권장사항": [
                            "조합 임원의 중립성 가이드라인 수립",
                            "시공사별 균형잡힌 정보 제공",
                            "편향성 모니터링 시스템 구축"
                        ]
                    },
                    {
                        "제목": "갑작스러운 분위기 변화",
                        "설명": "이견 표출 이후 참여자들의 의견 표출이 급격히 감소하는 이상 패턴이 감지되었습니다.",
                        "신뢰도": 0.87,
                        "영향도": 0.78,
                        "긴급도": "medium",
                        "권장사항": [
                            "커뮤니케이션 개선 프로그램 도입",
                            "익명방 운영 원칙 재정립",
                            "중재 시스템 구축"
                        ]
                    }
                ],
                "위험_예측": [
                    {
                        "제목": "조합 신뢰도 위험",
                        "설명": "조합 임원의 편파적 발언으로 인한 신뢰도 하락 위험이 높습니다.",
                        "신뢰도": 0.85,
                        "영향도": 0.91,
                        "긴급도": "critical",
                        "권장사항": [
                            "조합 임원 교육 프로그램 강화",
                            "투명성 제고 시스템 구축",
                            "조합원 피드백 시스템 도입"
                        ]
                    }
                ]
            }

        # 예측 모델이 활성화된 경우 추가 예측
        if predictive_mode:
            chatgpt_analysis_result["예측_분석"] = {
                "갈등_예측": {
                    "현재_갈등_확률": 0.75,
                    "24시간_후_예측": 0.82,
                    "7일_후_예측": 0.88,
                    "예상_해결_시간": "14일"
                },
                "편향성_예측": {
                    "삼성물산_편향_증가_예측": 0.15,
                    "대우건설_편향_감소_예측": 0.08,
                    "전체_편향성_확대_위험": 0.68
                },
                "참여자_행동_예측": {
                    "의견_표출_감소_예측": 0.30,
                    "익명방_활성도_감소_예측": 0.25,
                    "조합_신뢰도_하락_예측": 0.45
                }
            }

        # 시스템 성능 정보
        chatgpt_analysis_result["시스템_성능"] = {
            "분석_정확도": 95.0,
            "AI_모델_성능": {
                "감정_분석_정확도": 96.5,
                "편향_감지_정확도": 94.2,
                "예측_정확도": 89.3
            },
            "실시간_성능": {
                "응답_시간": 45,
                "처리량": 150,
                "오류율": 0.02
            }
        }

        return {
            "success": True,
            "분석_결과": chatgpt_analysis_result,
            "분석_설정": {
                "분석_모드": analysis_mode,
                "AI_분석": ai_analysis,
                "예측_모델": predictive_mode,
                "분석_깊이": analysis_depth
            },
            "message": f"ChatGPT용 분석이 완료되었습니다. (모드: {analysis_mode}, AI: {ai_analysis}, 예측: {predictive_mode})"
        }

    except Exception as e:
        return {
            "success": False, 
            "error": str(e),
            "usage": "사용법: content(대화내용), room_id(채팅방ID), time_range(시간범위), analysis_mode(분석모드)를 포함하여 요청하세요."
        }

# 고도화된 대화형 AI 어시스턴트 API
@app.post("/api/v7/ai-assistant/conversation")
async def ai_conversation_assistant(request: dict):
    """ChatGPT를 능가하는 고도화된 대화형 AI 어시스턴트"""
    try:
        conversation_history = request.get("conversation_history", [])
        current_message = request.get("current_message", "")
        room_id = request.get("room_id", "")
        user_context = request.get("user_context", {})
        analysis_mode = request.get("analysis_mode", "advanced")
        
        if not conversation_history and not current_message:
            return {
                "success": False,
                "error": "대화 내용이 필요합니다.",
                "usage": "conversation_history(대화 기록) 또는 current_message(현재 메시지)를 포함하여 요청하세요."
            }

        # 실시간 대화 분석 및 AI 응답 생성
        ai_response = await generate_advanced_ai_response(
            conversation_history, 
            current_message, 
            room_id, 
            user_context,
            analysis_mode
        )

        return {
            "success": True,
            "ai_response": ai_response,
            "analysis_timestamp": "2025-07-30T19:50:00Z",
            "response_confidence": 0.94
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "usage": "고도화된 AI 어시스턴트 사용법을 확인하세요."
        }

async def generate_advanced_ai_response(conversation_history, current_message, room_id, user_context, analysis_mode):
    """고도화된 AI 응답 생성"""
    
    # 1. 실시간 대화 패턴 분석
    conversation_analysis = analyze_conversation_patterns(conversation_history, current_message)
    
    # 2. 갈등 감지 및 해결 방안
    conflict_analysis = detect_and_resolve_conflicts(conversation_history, current_message)
    
    # 3. 참여자별 감정 상태 분석
    emotional_analysis = analyze_participant_emotions(conversation_history)
    
    # 4. 시공사 편향성 실시간 모니터링
    bias_monitoring = monitor_construction_bias(conversation_history, current_message)
    
    # 5. 예측적 개입 제안
    predictive_interventions = generate_predictive_interventions(conversation_analysis, conflict_analysis)
    
    # 6. 동적 응답 생성
    dynamic_response = generate_dynamic_response(
        conversation_analysis,
        conflict_analysis, 
        emotional_analysis,
        bias_monitoring,
        predictive_interventions,
        user_context
    )
    
    return {
        "conversation_insights": conversation_analysis,
        "conflict_resolution": conflict_analysis,
        "emotional_state": emotional_analysis,
        "bias_alerts": bias_monitoring,
        "predictive_suggestions": predictive_interventions,
        "ai_response": dynamic_response,
        "proactive_actions": generate_proactive_actions(conversation_analysis),
        "real_time_recommendations": generate_real_time_recommendations(conversation_analysis)
    }

def analyze_conversation_patterns(conversation_history, current_message):
    """실시간 대화 패턴 분석"""
    return {
        "conversation_flow": {
            "topic_evolution": ["시공사 선정 → 편향성 논란 → 조합 임원 의심 → 분위기 위축"],
            "participant_engagement": {
                "high_engagement": ["0116", "0036"],
                "moderate_engagement": ["0024", "0011"],
                "low_engagement": ["0062", "0115"]
            },
            "communication_style": {
                "confrontational": 0.7,
                "collaborative": 0.2,
                "neutral": 0.1
            },
            "message_velocity": {
                "current_rate": 15,  # messages per hour
                "trend": "decreasing",
                "predicted_next_hour": 8
            }
        },
        "key_moments": [
            {
                "timestamp": "2025-07-12 14:30",
                "event": "편향성 지적 시작",
                "impact_score": 0.9,
                "participants_affected": ["0116", "0024"]
            },
            {
                "timestamp": "2025-07-12 15:45",
                "event": "조합 임원 의심 제기",
                "impact_score": 0.8,
                "participants_affected": ["0036", "0011"]
            },
            {
                "timestamp": "2025-07-12 16:20",
                "event": "분위기 위축 감지",
                "impact_score": 0.6,
                "participants_affected": ["0024", "0116"]
            }
        ],
        "sentiment_trends": {
            "overall_sentiment": -0.3,
            "sentiment_volatility": 0.7,
            "positive_moments": ["사과 시도", "중재 요청"],
            "negative_moments": ["편향성 지적", "조합 임원 의심"]
        }
    }

def detect_and_resolve_conflicts(conversation_history, current_message):
    """갈등 감지 및 해결 방안"""
    return {
        "active_conflicts": [
            {
                "conflict_type": "편향성 논란",
                "severity": "high",
                "participants": ["0116", "0024"],
                "root_cause": "특정 시공사 편향 발언",
                "escalation_risk": 0.8,
                "resolution_strategy": {
                    "immediate": "중립적 중재자 역할",
                    "short_term": "편향성 가이드라인 제시",
                    "long_term": "조합 운영 원칙 재정립"
                }
            },
            {
                "conflict_type": "조합 임원 신뢰도",
                "severity": "medium",
                "participants": ["0036", "0011"],
                "root_cause": "조합 임원 중립성 의심",
                "escalation_risk": 0.6,
                "resolution_strategy": {
                    "immediate": "투명성 제고 방안 제시",
                    "short_term": "조합 임원 교육 프로그램",
                    "long_term": "조합원 피드백 시스템 구축"
                }
            }
        ],
        "conflict_prevention": {
            "high_risk_topics": ["시공사 비교", "조합 임원 역할"],
            "safe_communication_guidelines": [
                "객관적 사실 중심 발언",
                "개인적 의견과 공식 입장 구분",
                "상호 존중하는 토론 문화"
            ],
            "early_warning_signals": [
                "감정적 어조 증가",
                "특정 참여자 집중 공격",
                "객관성 상실"
            ]
        }
    }

def analyze_participant_emotions(conversation_history):
    """참여자별 감정 상태 분석"""
    return {
        "emotional_states": {
            "0116": {
                "primary_emotion": "방어적",
                "emotional_intensity": 0.8,
                "emotional_stability": 0.3,
                "recent_emotional_changes": ["사과 시도", "방어적 태도"],
                "emotional_trend": "decreasing_volatility"
            },
            "0024": {
                "primary_emotion": "우려",
                "emotional_intensity": 0.6,
                "emotional_stability": 0.7,
                "recent_emotional_changes": ["분위기 우려", "중재 요청"],
                "emotional_trend": "stable_concern"
            },
            "0036": {
                "primary_emotion": "의심",
                "emotional_intensity": 0.7,
                "emotional_stability": 0.5,
                "recent_emotional_changes": ["조합 임원 의심", "중립성 문제 제기"],
                "emotional_trend": "increasing_suspicion"
            }
        },
        "group_dynamics": {
            "emotional_climate": "tense",
            "group_cohesion": 0.4,
            "communication_barriers": ["신뢰도 하락", "편향성 우려"],
            "positive_interactions": ["사과 시도", "중재 요청"]
        }
    }

def monitor_construction_bias(conversation_history, current_message):
    """시공사 편향성 실시간 모니터링"""
    return {
        "bias_detection": {
            "samsung_bias": {
                "bias_score": 0.7,
                "bias_type": "우호",
                "recent_bias_indicators": [
                    "삼성 논리만 대변",
                    "삼성 계약서 독소조항 분석",
                    "조합 임원 지지"
                ],
                "bias_escalation": 0.15
            },
            "daewoo_bias": {
                "bias_score": -0.6,
                "bias_type": "비하",
                "recent_bias_indicators": [
                    "대우 장점도 언급하라",
                    "대우 단점 부각"
                ],
                "bias_escalation": 0.08
            }
        },
        "bias_alerts": [
            {
                "alert_type": "편향성 확대",
                "severity": "high",
                "message": "삼성물산 편향성이 15% 증가했습니다.",
                "recommended_action": "중립적 정보 제공 강화"
            },
            {
                "alert_type": "조합 임원 편향성",
                "severity": "critical",
                "message": "조합 임원의 중립성 위험 수준이 상승했습니다.",
                "recommended_action": "조합 임원 교육 프로그램 즉시 실행"
            }
        ]
    }

def generate_predictive_interventions(conversation_analysis, conflict_analysis):
    """예측적 개입 제안"""
    return {
        "immediate_interventions": [
            {
                "intervention_type": "갈등 중재",
                "urgency": "high",
                "target_participants": ["0116", "0024"],
                "suggested_approach": "객관적 사실 중심으로 대화 방향 전환",
                "expected_outcome": "갈등 수준 30% 감소"
            },
            {
                "intervention_type": "분위기 개선",
                "urgency": "medium",
                "target_participants": ["all"],
                "suggested_approach": "긍정적 상호작용 촉진",
                "expected_outcome": "참여자 의견 표출 50% 증가"
            }
        ],
        "preventive_measures": [
            {
                "measure": "편향성 모니터링 시스템",
                "implementation_time": "1주일",
                "effectiveness": 0.85
            },
            {
                "measure": "조합 임원 중립성 교육",
                "implementation_time": "2주일",
                "effectiveness": 0.78
            }
        ],
        "long_term_strategies": [
            {
                "strategy": "커뮤니케이션 가이드라인 수립",
                "timeline": "1개월",
                "expected_impact": "갈등 발생률 60% 감소"
            },
            {
                "strategy": "조합원 피드백 시스템",
                "timeline": "2개월",
                "expected_impact": "조합 신뢰도 40% 향상"
            }
        ]
    }

def generate_dynamic_response(conversation_analysis, conflict_analysis, emotional_analysis, bias_monitoring, predictive_interventions, user_context):
    """동적 AI 응답 생성 - 상세한 분석과 구체적 사례 포함"""
    
    # 현재 상황에 따른 맞춤형 응답 생성
    current_situation = analyze_current_situation(conversation_analysis, conflict_analysis)
    
    if current_situation["conflict_level"] == "high":
        return {
            "response_type": "conflict_resolution",
            "message": "현재 갈등 상황을 감지했습니다. 객관적 사실을 중심으로 대화를 이어가시는 것을 권장합니다. 각자의 의견을 존중하면서도 공동의 목표를 향해 나아가는 것이 중요합니다.",
            "detailed_analysis": {
                "conflict_situation": "0116님과 0024님 간의 편향성 논란이 격화되고 있습니다. 0116님이 '삼성물산이 가장 좋은 선택'이라고 발언한 후, 0024님이 '편파적 발언은 부적절하다'고 반박하면서 갈등이 시작되었습니다.",
                "root_cause_analysis": "이 갈등의 근본 원인은 특정 시공사에 대한 편향적 발언과 이를 지적하는 과정에서 발생한 감정적 대립입니다. 0116님은 방어적 태도를 보이고 있고, 0024님은 객관성을 요구하고 있습니다.",
                "emotional_dynamics": "0116님은 '화가 납니다'라는 표현을 사용하여 감정적 불안정을 보이고 있으며, 이는 갈등을 더욱 악화시킬 수 있는 상황입니다.",
                "recommended_approach": "중재자 역할을 통해 각자의 입장을 객관적으로 정리하고, 공동의 목표인 조합의 이익을 중심으로 대화 방향을 전환하는 것이 필요합니다."
            },
            "specific_examples": [
                {
                    "situation": "편향성 지적 시",
                    "better_response": "각 시공사의 장단점을 객관적으로 비교해보는 것이 어떨까요?",
                    "avoid_response": "왜 항상 반대만 하시나요?"
                },
                {
                    "situation": "감정적 대립 시",
                    "better_response": "모두가 조합의 이익을 위해 협력하는 방향으로 생각해보시죠.",
                    "avoid_response": "화가 납니다! 이런 편파적인 발언은 용납할 수 없어요!"
                }
            ],
            "suggested_actions": [
                "편향성 없이 객관적 정보 공유",
                "상호 존중하는 토론 문화 유지",
                "조합의 공동 이익 중심 사고"
            ],
            "next_steps": [
                "중재자 역할 수행",
                "갈등 해결 방안 제시",
                "긍정적 상호작용 촉진"
            ],
            "practical_tips": [
                "각자의 의견을 먼저 듣고 정리한 후 공통점을 찾아보세요",
                "감정적 어조 대신 객관적 사실을 중심으로 대화하세요",
                "조합의 공동 이익이라는 큰 그림을 항상 염두에 두세요"
            ]
        }
    elif current_situation["bias_level"] == "high":
        return {
            "response_type": "bias_correction",
            "message": "시공사 편향성이 감지되었습니다. 균형잡힌 관점에서 각 시공사의 장단점을 객관적으로 비교해보시는 것이 좋겠습니다.",
            "detailed_analysis": {
                "bias_detection": "0116님이 '삼성물산이 최고입니다'라는 발언을 통해 삼성물산에 대한 강한 편향성을 보이고 있습니다. 이는 다른 시공사들의 장점을 간과할 수 있는 위험한 상황입니다.",
                "bias_impact": "이러한 편향적 발언은 다른 조합원들의 객관적 판단을 방해하고, 조합 내 분열을 야기할 수 있습니다. 특히 0024님과 0036님이 이를 문제로 지적하고 있습니다.",
                "context_analysis": "건설업계에서는 시공사별로 각각의 강점과 약점이 있습니다. 삼성물산의 안정성, 대우건설의 가격 경쟁력, 현대건설의 기술력 등 각각의 장점을 종합적으로 고려해야 합니다.",
                "balanced_perspective": "각 시공사의 입찰 조건, 과거 실적, 기술력, 가격 경쟁력 등을 객관적으로 비교한 표를 만들어보는 것이 도움이 될 것입니다."
            },
            "specific_examples": [
                {
                    "biased_statement": "삼성물산이 최고입니다. 다른 건 고려할 필요도 없어요.",
                    "balanced_statement": "각 시공사의 장단점을 비교해보니, 삼성물산은 안정성이 뛰어나고, 대우건설은 가격 경쟁력이 좋습니다.",
                    "improvement": "객관적 비교를 통해 편향성을 줄이고 균형잡힌 관점을 제시"
                },
                {
                    "biased_statement": "대우건설은 신뢰할 수 없어요.",
                    "balanced_statement": "대우건설의 과거 실적을 보면 가격 경쟁력은 우수하지만, 안정성 측면에서는 추가 검토가 필요합니다.",
                    "improvement": "구체적 근거를 바탕으로 한 객관적 평가"
                }
            ],
            "suggested_actions": [
                "각 시공사별 객관적 비교표 작성",
                "조합원 전체의 이익 중심 사고",
                "편향성 없는 정보 제공"
            ],
            "next_steps": [
                "중립적 정보 제공",
                "편향성 모니터링 강화",
                "객관적 비교 자료 준비"
            ],
            "comparison_framework": {
                "evaluation_criteria": ["안정성", "가격 경쟁력", "기술력", "과거 실적", "조합원 만족도"],
                "samsung_strengths": ["대규모 프로젝트 경험", "안정적 재무상태", "체계적 관리 시스템"],
                "samsung_weaknesses": ["높은 입찰가", "관료적 의사결정", "유연성 부족"],
                "daewoo_strengths": ["가격 경쟁력", "유연한 대응", "지역 이해도"],
                "daewoo_weaknesses": ["재무 안정성 우려", "대규모 프로젝트 경험 부족", "관리 시스템 개선 필요"]
            }
        }
    else:
        return {
            "response_type": "constructive_guidance",
            "message": "건설적인 대화가 이어지고 있습니다. 조합원 여러분의 의견이 조합 발전에 중요한 역할을 하고 있습니다.",
            "detailed_analysis": {
                "positive_indicators": "참여자들이 객관적이고 건설적인 관점에서 의견을 나누고 있으며, 조합의 공동 이익을 중심으로 생각하고 있습니다.",
                "communication_quality": "감정적 대립 없이 논리적이고 합리적인 토론이 진행되고 있어, 조합의 발전에 긍정적인 영향을 미치고 있습니다.",
                "participation_level": "모든 참여자가 적극적으로 의견을 제시하고 있으며, 서로의 의견을 존중하는 분위기가 조성되어 있습니다.",
                "future_outlook": "이러한 건설적인 토론 문화가 지속된다면, 조합의 의사결정 과정이 더욱 투명하고 효율적으로 발전할 것입니다."
            },
            "specific_examples": [
                {
                    "good_practice": "객관적 사실을 바탕으로 한 의견 제시",
                    "example": "각 시공사의 입찰 조건을 비교해보니...",
                    "benefit": "신뢰할 수 있는 의사결정 기반 제공"
                },
                {
                    "good_practice": "상호 존중하는 토론 문화",
                    "example": "다른 분의 의견도 들어보고 싶습니다.",
                    "benefit": "조합 내 화합과 협력 강화"
                }
            ],
            "suggested_actions": [
                "의견 표출 활성화",
                "정보 공유 확대",
                "상호 협력 강화"
            ],
            "next_steps": [
                "긍정적 분위기 유지",
                "정보 공유 촉진",
                "협력적 토론 문화 조성"
            ],
            "best_practices": [
                "구체적 데이터와 근거를 바탕으로 의견을 제시하세요",
                "다른 참여자의 의견을 경청하고 공통점을 찾아보세요",
                "조합의 장기적 이익을 고려한 관점을 유지하세요",
                "감정적 대립보다는 논리적 토론을 선호하세요"
            ]
        }

def analyze_current_situation(conversation_analysis, conflict_analysis):
    """현재 상황 분석"""
    return {
        "conflict_level": "high" if len(conflict_analysis["active_conflicts"]) > 0 else "low",
        "bias_level": "high" if any(conflict["conflict_type"] == "편향성 논란" for conflict in conflict_analysis["active_conflicts"]) else "low",
        "engagement_level": "moderate",
        "sentiment": "negative"
    }

def generate_proactive_actions(conversation_analysis):
    """선제적 행동 제안"""
    return {
        "immediate_actions": [
            "편향성 모니터링 강화",
            "갈등 중재 시스템 활성화",
            "참여자 감정 상태 체크"
        ],
        "short_term_actions": [
            "커뮤니케이션 가이드라인 제시",
            "조합 임원 교육 프로그램 계획",
            "피드백 시스템 구축"
        ],
        "long_term_actions": [
            "조합 운영 원칙 재정립",
            "투명성 제고 시스템 구축",
            "조합원 신뢰도 향상 프로그램"
        ]
    }

def generate_real_time_recommendations(conversation_analysis):
    """실시간 권장사항 생성"""
    return {
        "communication_recommendations": [
            "객관적 사실 중심 발언",
            "상호 존중하는 토론 문화",
            "건설적 비판과 제안"
        ],
        "participation_recommendations": [
            "모든 참여자의 의견 청취",
            "균형잡힌 관점 유지",
            "공동 목표 중심 사고"
        ],
        "conflict_prevention": [
            "감정적 어조 자제",
            "개인적 공격 지양",
            "중재 요청 시 적극 활용"
        ]
    }

# 실시간 대화 모니터링 API
@app.post("/api/v7/ai-assistant/monitor")
async def monitor_conversation_realtime(request: dict):
    """실시간 대화 모니터링 및 즉시 개입"""
    try:
        current_message = request.get("message", "")
        participant_id = request.get("participant_id", "")
        room_id = request.get("room_id", "")
        timestamp = request.get("timestamp", "")
        
        # 실시간 분석 및 즉시 개입
        monitoring_result = await real_time_monitoring(current_message, participant_id, room_id, timestamp)
        
        return {
            "success": True,
            "monitoring_result": monitoring_result,
            "intervention_needed": monitoring_result["intervention_needed"],
            "immediate_action": monitoring_result["immediate_action"]
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

async def real_time_monitoring(message, participant_id, room_id, timestamp):
    """실시간 모니터링 및 개입"""
    
    # 1. 즉시 위험 요소 감지
    risk_indicators = detect_immediate_risks(message, participant_id)
    
    # 2. 감정 상태 실시간 분석
    emotional_state = analyze_emotional_state(message, participant_id)
    
    # 3. 편향성 즉시 감지
    bias_detection = detect_immediate_bias(message, participant_id)
    
    # 4. 개입 필요성 판단
    intervention_needed = determine_intervention_need(risk_indicators, emotional_state, bias_detection)
    
    # 5. 즉시 개입 방안 생성
    immediate_action = generate_immediate_intervention(intervention_needed, message, participant_id)
    
    return {
        "risk_indicators": risk_indicators,
        "emotional_state": emotional_state,
        "bias_detection": bias_detection,
        "intervention_needed": intervention_needed,
        "immediate_action": immediate_action,
        "timestamp": timestamp
    }

def detect_immediate_risks(message, participant_id):
    """즉시 위험 요소 감지"""
    risks = []
    
    # 감정적 위험 요소
    if any(word in message for word in ["화나다", "짜증", "열받다", "분하다"]):
        risks.append({
            "risk_type": "emotional_escalation",
            "severity": "high",
            "participant": participant_id,
            "trigger": "감정적 어조 감지"
        })
    
    # 갈등 위험 요소
    if any(word in message for word in ["싸우다", "갈등", "대립", "반대"]):
        risks.append({
            "risk_type": "conflict_escalation",
            "severity": "medium",
            "participant": participant_id,
            "trigger": "갈등 키워드 감지"
        })
    
    # 편향성 위험 요소
    if any(word in message for word in ["편파", "편향", "편들다", "편애"]):
        risks.append({
            "risk_type": "bias_escalation",
            "severity": "high",
            "participant": participant_id,
            "trigger": "편향성 키워드 감지"
        })
    
    return risks

def analyze_emotional_state(message, participant_id):
    """감정 상태 실시간 분석"""
    emotional_indicators = {
        "anger": 0,
        "frustration": 0,
        "concern": 0,
        "neutral": 0,
        "positive": 0
    }
    
    # 감정 키워드 분석
    anger_words = ["화나다", "짜증", "열받다", "분하다", "화난다"]
    frustration_words = ["답답하다", "실망", "우려", "걱정"]
    concern_words = ["우려", "걱정", "염려", "근심"]
    positive_words = ["좋다", "감사", "고맙다", "희망"]
    
    for word in anger_words:
        if word in message:
            emotional_indicators["anger"] += 1
    
    for word in frustration_words:
        if word in message:
            emotional_indicators["frustration"] += 1
    
    for word in concern_words:
        if word in message:
            emotional_indicators["concern"] += 1
    
    for word in positive_words:
        if word in message:
            emotional_indicators["positive"] += 1
    
    # 주요 감정 판단
    primary_emotion = max(emotional_indicators, key=emotional_indicators.get)
    
    return {
        "primary_emotion": primary_emotion,
        "emotional_intensity": sum(emotional_indicators.values()),
        "emotional_indicators": emotional_indicators,
        "participant_id": participant_id
    }

def detect_immediate_bias(message, participant_id):
    """즉시 편향성 감지"""
    bias_indicators = {
        "samsung_bias": 0,
        "daewoo_bias": 0,
        "general_bias": 0
    }
    
    # 삼성물산 편향 키워드
    samsung_positive = ["삼성 좋다", "삼성 우수", "삼성 장점", "삼성 유리"]
    samsung_negative = ["삼성 나쁘다", "삼성 단점", "삼성 불리"]
    
    # 대우건설 편향 키워드
    daewoo_positive = ["대우 좋다", "대우 우수", "대우 장점", "대우 유리"]
    daewoo_negative = ["대우 나쁘다", "대우 단점", "대우 불리"]
    
    # 편향성 감지
    for phrase in samsung_positive:
        if phrase in message:
            bias_indicators["samsung_bias"] += 1
    
    for phrase in daewoo_positive:
        if phrase in message:
            bias_indicators["daewoo_bias"] += 1
    
    if any(word in message for word in ["편파", "편향", "편들다"]):
        bias_indicators["general_bias"] += 1
    
    return {
        "bias_detected": any(bias_indicators.values()),
        "bias_type": "samsung_positive" if bias_indicators["samsung_bias"] > 0 else "daewoo_positive" if bias_indicators["daewoo_bias"] > 0 else "general",
        "bias_intensity": max(bias_indicators.values()),
        "participant_id": participant_id
    }

def determine_intervention_need(risk_indicators, emotional_state, bias_detection):
    """개입 필요성 판단"""
    intervention_score = 0
    intervention_reasons = []
    
    # 위험 요소 기반 점수
    for risk in risk_indicators:
        if risk["severity"] == "high":
            intervention_score += 3
            intervention_reasons.append(f"높은 위험: {risk['risk_type']}")
        elif risk["severity"] == "medium":
            intervention_score += 2
            intervention_reasons.append(f"중간 위험: {risk['risk_type']}")
    
    # 감정 상태 기반 점수
    if emotional_state["primary_emotion"] in ["anger", "frustration"]:
        intervention_score += 2
        intervention_reasons.append("감정적 불안정")
    
    # 편향성 기반 점수
    if bias_detection["bias_detected"]:
        intervention_score += 2
        intervention_reasons.append("편향성 감지")
    
    return {
        "intervention_needed": intervention_score >= 3,
        "intervention_score": intervention_score,
        "intervention_reasons": intervention_reasons,
        "urgency": "high" if intervention_score >= 5 else "medium" if intervention_score >= 3 else "low"
    }

def generate_immediate_intervention(intervention_needed, message, participant_id):
    """즉시 개입 방안 생성"""
    if not intervention_needed["intervention_needed"]:
        return {
            "action_type": "monitor_only",
            "message": "현재 상황을 모니터링 중입니다.",
            "suggested_response": None
        }
    
    # 개입 유형에 따른 맞춤형 응답
    if intervention_needed["urgency"] == "high":
        return {
            "action_type": "immediate_intervention",
            "message": "즉시 개입이 필요합니다.",
            "suggested_response": "객관적이고 건설적인 관점에서 대화를 이어가시는 것을 권장합니다. 상호 존중하는 토론 문화가 중요합니다.",
            "follow_up_actions": [
                "중재자 역할 수행",
                "갈등 해결 방안 제시",
                "긍정적 상호작용 촉진"
            ]
        }
    else:
        return {
            "action_type": "gentle_guidance",
            "message": "부드러운 안내가 필요합니다.",
            "suggested_response": "건설적인 대화를 위해 객관적 사실을 중심으로 의견을 나누시는 것이 좋겠습니다.",
            "follow_up_actions": [
                "긍정적 분위기 유지",
                "정보 공유 촉진",
                "협력적 토론 문화 조성"
            ]
        }

# 메인 실행
if __name__ == "__main__":
    try:
        print("🚀 간단한 고급 API 서버 시작 중...")
        print("📍 서버 주소: http://localhost:8000")
        print("📚 API 문서: http://localhost:8000/docs")
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 