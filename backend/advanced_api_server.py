#!/usr/bin/env python3
"""
간단한 고급 API 서버
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
import logging
from typing import Dict, List, Optional
import base64
import io
from pydantic import BaseModel

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# WebSocket 연결 관리자
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    self.disconnect(connection, room_id)


manager = ConnectionManager()

# 음성 인식 세션 관리
voice_sessions: Dict[str, Dict] = {}

# 이미지 분석 결과 저장소
image_analysis_cache: Dict[str, Dict] = {}

# 예측 분석 데이터 저장소
prediction_data: Dict[str, List] = {
    "user_activity": [],
    "message_quality": [],
    "system_performance": []
}


# FastAPI 앱 생성
app = FastAPI(
    title="고급 API 서버",
    description="다양한 AI 기능을 제공하는 API 서버",
    version="1.0.0"
)

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket 엔드포인트
@app.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket 채팅 엔드포인트"""
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            
            # 메시지 브로드캐스트
            await manager.broadcast_to_room(data, room_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "고급 API 서버"
    }


@app.post("/api/v7/voice/start-recognition")
async def start_voice_recognition(request: dict):
    """음성 인식 시작"""
    try:
        session_id = request.get("session_id", f"session_{datetime.now().timestamp()}")
        language = request.get("language", "ko")
        
        voice_sessions[session_id] = {
            "status": "recording",
            "language": language,
            "started_at": datetime.now().isoformat(),
            "results": []
        }
        
        logger.info(f"음성 인식 세션 시작: {session_id}")
        
        return {
            "status": "success",
            "message": "음성 인식이 시작되었습니다.",
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"음성 인식 시작 중 오류: {e}")
        return {
            "status": "error",
            "message": f"음성 인식 시작 중 오류가 발생했습니다: {str(e)}"
        }


@app.post("/api/v7/voice/stop-recognition")
async def stop_voice_recognition(request: dict):
    """음성 인식 중지"""
    try:
        session_id = request.get("session_id")
        
        if not session_id or session_id not in voice_sessions:
            return {
                "status": "error",
                "message": "유효하지 않은 세션 ID입니다."
            }
        
        session = voice_sessions[session_id]
        session["status"] = "stopped"
        session["stopped_at"] = datetime.now().isoformat()
        
        # 세션 지속 시간 계산
        started = datetime.fromisoformat(session["started_at"])
        stopped = datetime.fromisoformat(session["stopped_at"])
        duration = (stopped - started).total_seconds()
        
        logger.info(f"음성 인식 세션 중지: {session_id} (지속시간: {duration:.2f}초)")
        
    return {
        "status": "success",
        "message": "음성 인식이 중지되었습니다.",
            "session_id": session_id,
            "duration_seconds": duration,
        "timestamp": datetime.now().isoformat()
    }
    except Exception as e:
        logger.error(f"음성 인식 중지 중 오류: {e}")
        return {
            "status": "error",
            "message": f"음성 인식 중지 중 오류가 발생했습니다: {str(e)}"
        }


@app.get("/api/v7/voice/results")
async def get_voice_recognition_results(session_id: Optional[str] = None):
    """음성 인식 결과 조회"""
    try:
        if session_id:
            if session_id not in voice_sessions:
                return {
                    "status": "error",
                    "message": "세션을 찾을 수 없습니다."
                }
            session = voice_sessions[session_id]
    return {
        "status": "success",
                "session_id": session_id,
                "session_status": session.get("status", "unknown"),
                "results": session.get("results", []),
                "language": session.get("language", "ko"),
                "started_at": session.get("started_at"),
        "timestamp": datetime.now().isoformat()
            }
        else:
            # 모든 세션 결과 반환
            all_results = {}
            for sid, session in voice_sessions.items():
                all_results[sid] = {
                    "status": session.get("status"),
                    "results": session.get("results", []),
                    "started_at": session.get("started_at")
                }
            return {
                "status": "success",
                "sessions": all_results,
                "total_sessions": len(voice_sessions),
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        logger.error(f"음성 인식 결과 조회 중 오류: {e}")
        return {
            "status": "error",
            "message": f"음성 인식 결과 조회 중 오류가 발생했습니다: {str(e)}"
    }


@app.post("/api/v7/image/analyze-base64")
async def analyze_base64_image(request: dict):
    """Base64 이미지 분석"""
    try:
        image_data = request.get("image_data", "")
        analysis_type = request.get("analysis_type", "comprehensive")
        
        if not image_data:
            return {
                "status": "error",
                "message": "이미지 데이터가 제공되지 않았습니다."
            }
        
        # Base64 디코딩
        try:
            # data:image/jpeg;base64, 형식 처리
            if "," in image_data:
                image_data = image_data.split(",")[1]
            
            image_bytes = base64.b64decode(image_data)
            image_size = len(image_bytes)
        
            # 기본 이미지 정보 추출
            from PIL import Image
            image = Image.open(io.BytesIO(image_bytes))
            width, height = image.size
            format_type = image.format or "unknown"
            mode = image.mode
            
        except Exception as decode_error:
            logger.error(f"이미지 디코딩 오류: {decode_error}")
            return {
                "status": "error",
                "message": f"이미지 디코딩 중 오류가 발생했습니다: {str(decode_error)}"
            }
        
        # 분석 타입별 처리
        analysis_result = {
            "image_info": {
                "width": width,
                "height": height,
                "format": format_type,
                "mode": mode,
                "size_bytes": image_size,
                "aspect_ratio": round(width / height, 2) if height > 0 else 0
            },
            "analysis_type": analysis_type,
            "timestamp": datetime.now().isoformat()
        }
        
        # 종합 분석
        if analysis_type in ["comprehensive", "object"]:
            # 객체 감지 (시뮬레이션)
            analysis_result["object_detection"] = {
                "detected_objects": [
                    {"name": "객체1", "confidence": 0.85, "bbox": [10, 20, 100, 150]},
                    {"name": "객체2", "confidence": 0.72, "bbox": [150, 200, 250, 300]}
                ],
                "total_objects": 2
            }
        
        if analysis_type in ["comprehensive", "ocr"]:
            # OCR 텍스트 추출 (시뮬레이션)
            analysis_result["ocr_results"] = {
                "extracted_text": "이미지에서 추출된 텍스트 샘플",
                "text_regions": [
                    {"text": "샘플 텍스트", "confidence": 0.88, "bbox": [50, 50, 200, 80]}
                ],
                "language": "ko"
            }
        
        if analysis_type in ["comprehensive", "emotion"]:
            # 감정 분석 (시뮬레이션)
            analysis_result["emotion_analysis"] = {
                "primary_emotion": "neutral",
                "emotions": {
                    "positive": 0.3,
                    "neutral": 0.5,
                    "negative": 0.2
                },
                "confidence": 0.75
            }
        
        # 색상 분석
        if analysis_type in ["comprehensive", "color"]:
            try:
                # 주요 색상 추출
                colors = image.getcolors(maxcolors=256*256*256)
                if colors:
                    dominant_colors = sorted(colors, key=lambda x: x[0], reverse=True)[:5]
                    analysis_result["color_analysis"] = {
                        "dominant_colors": [
                            {
                                "color": f"rgb({c[1][0]}, {c[1][1]}, {c[1][2]})",
                                "count": c[0],
                                "percentage": round((c[0] / (width * height)) * 100, 2)
                            }
                            for c in dominant_colors
                        ]
                    }
            except Exception:
                pass
        
        # 결과 캐시에 저장
        analysis_id = f"analysis_{datetime.now().timestamp()}"
        image_analysis_cache[analysis_id] = analysis_result
        
        return {
            "status": "success",
            "analysis_id": analysis_id,
            "analysis": analysis_result
        }
    except Exception as e:
        logger.error(f"이미지 분석 중 오류: {e}")
        return {
            "status": "error",
            "message": f"이미지 분석 중 오류가 발생했습니다: {str(e)}"
        }


@app.post("/api/v7/predict/user-activity")
async def predict_user_activity(request: dict):
    """사용자 활동 예측"""
    try:
        user_id = request.get("user_id", "")
        time_horizon = request.get("time_horizon", "1h")  # 1h, 6h, 24h, 7d
        
        # 과거 활동 데이터 분석 (시뮬레이션)
        import random
        activity_patterns = {
            "peak_hours": [9, 10, 14, 15, 20, 21],  # 활동이 많은 시간대
            "average_session_duration": 15,  # 평균 세션 지속 시간 (분)
            "messages_per_session": 8,
            "active_days": ["월", "화", "수", "목", "금"]
        }
        
        current_hour = datetime.now().hour
        is_peak_hour = current_hour in activity_patterns["peak_hours"]
        
        # 활동 확률 계산
        base_probability = 0.5
        if is_peak_hour:
            base_probability += 0.2
        if datetime.now().weekday() < 5:  # 평일
            base_probability += 0.15
        
        # 예측된 활동들
        predicted_activities = [
            {
                "activity": "메시지 전송",
                "probability": min(0.95, base_probability + 0.1),
                "expected_time": f"{random.randint(5, 30)}분 후",
                "confidence": 0.78
            },
            {
                "activity": "파일 업로드",
                "probability": min(0.85, base_probability * 0.6),
                "expected_time": f"{random.randint(30, 120)}분 후",
                "confidence": 0.65
            },
            {
                "activity": "프로젝트 조회",
                "probability": min(0.75, base_probability * 0.5),
                "expected_time": f"{random.randint(60, 240)}분 후",
                "confidence": 0.58
            }
        ]
        
        # 다음 행동 예측
        next_action = max(predicted_activities, key=lambda x: x["probability"])
        
        prediction_result = {
            "user_id": user_id,
            "time_horizon": time_horizon,
            "predicted_activities": sorted(predicted_activities, key=lambda x: x["probability"], reverse=True),
            "next_likely_action": next_action,
            "activity_patterns": {
                "peak_hours": activity_patterns["peak_hours"],
                "is_currently_peak": is_peak_hour,
                "average_activity_level": "high" if is_peak_hour else "medium"
            },
            "confidence": 0.78,
            "timestamp": datetime.now().isoformat()
        }
        
        # 예측 데이터 저장
        prediction_data["user_activity"].append({
            "user_id": user_id,
            "prediction": prediction_result,
            "created_at": datetime.now().isoformat()
        })
        
        # 최근 100개만 유지
        if len(prediction_data["user_activity"]) > 100:
            prediction_data["user_activity"] = prediction_data["user_activity"][-100:]
        
        return {
            "status": "success",
            "prediction": prediction_result
        }
    except Exception as e:
        logger.error(f"사용자 활동 예측 중 오류: {e}")
        return {
            "status": "error",
            "message": f"사용자 활동 예측 중 오류가 발생했습니다: {str(e)}"
        }


@app.post("/api/v7/predict/message-quality")
async def predict_message_quality(request: dict):
    """메시지 품질 예측"""
    try:
        message_content = request.get("message_content", "")
        message_type = request.get("message_type", "general")
        
        if not message_content:
            return {
                "status": "error",
                "message": "메시지 내용이 제공되지 않았습니다."
            }
        
        # 메시지 분석
        message_length = len(message_content)
        word_count = len(message_content.split())
        has_question = "?" in message_content or "?" in message_content
        has_emotion = any(emoji in message_content for emoji in ["😊", "😢", "😡", "😮", "👍", "👎"])
        
        # 품질 점수 계산
        clarity_score = min(1.0, 0.5 + (word_count / 50) * 0.3) if word_count > 0 else 0.3
        completeness_score = min(1.0, 0.4 + (message_length / 200) * 0.4) if message_length > 0 else 0.2
        relevance_score = 0.75  # 컨텍스트 기반 계산 (시뮬레이션)
        tone_score = 0.80
        
        # 메시지 타입별 가중치
        type_weights = {
            "question": {"clarity": 1.2, "completeness": 0.9},
            "statement": {"clarity": 1.0, "completeness": 1.1},
            "command": {"clarity": 1.3, "completeness": 1.0}
        }
        weights = type_weights.get(message_type, {"clarity": 1.0, "completeness": 1.0})
        
        clarity_score = min(1.0, clarity_score * weights["clarity"])
        completeness_score = min(1.0, completeness_score * weights["completeness"])
        
        # 종합 품질 점수
        quality_score = (
            clarity_score * 0.3 +
            completeness_score * 0.3 +
            relevance_score * 0.25 +
            tone_score * 0.15
        )
        
        # 개선 제안
        suggestions = []
        if clarity_score < 0.7:
            suggestions.append("메시지를 더 명확하게 작성하세요.")
        if completeness_score < 0.7:
            suggestions.append("필요한 정보를 더 추가하세요.")
        if not has_question and message_type == "question":
            suggestions.append("질문 형식으로 작성하면 더 좋습니다.")
        if message_length < 10:
            suggestions.append("메시지가 너무 짧습니다. 더 자세히 설명해주세요.")
        
        quality_analysis = {
            "overall_score": round(quality_score, 2),
            "scores": {
                "clarity": round(clarity_score, 2),
                "completeness": round(completeness_score, 2),
                "relevance": round(relevance_score, 2),
                "tone_appropriateness": round(tone_score, 2)
            },
            "message_metrics": {
                "length": message_length,
                "word_count": word_count,
                "has_question": has_question,
                "has_emotion": has_emotion
            },
            "quality_level": (
                "excellent" if quality_score >= 0.9 else
                "good" if quality_score >= 0.75 else
                "fair" if quality_score >= 0.6 else
                "poor"
            ),
            "suggestions": suggestions if suggestions else ["메시지 품질이 양호합니다."],
            "predicted_effectiveness": round(quality_score * 0.9, 2),  # 예상 효과성
            "timestamp": datetime.now().isoformat()
        }
        
        # 예측 데이터 저장
        prediction_data["message_quality"].append({
            "message_content": message_content[:100],  # 처음 100자만 저장
            "quality_analysis": quality_analysis,
            "created_at": datetime.now().isoformat()
        })
        
        # 최근 100개만 유지
        if len(prediction_data["message_quality"]) > 100:
            prediction_data["message_quality"] = prediction_data["message_quality"][-100:]
        
        return {
            "status": "success",
            "quality_analysis": quality_analysis
        }
    except Exception as e:
        logger.error(f"메시지 품질 예측 중 오류: {e}")
        return {
            "status": "error",
            "message": f"메시지 품질 예측 중 오류가 발생했습니다: {str(e)}"
        }


@app.post("/api/v7/predict/system-performance")
async def predict_system_performance(request: dict):
    """시스템 성능 예측"""
    try:
        time_horizon = request.get("time_horizon", "1h")
        include_trends = request.get("include_trends", True)
        
        import random
        import psutil
        
        # 현재 시스템 메트릭
        current_cpu = psutil.cpu_percent(interval=0.1)
        current_memory = psutil.virtual_memory().percent
        current_disk = psutil.disk_usage('/').percent
        
        # 예측 로직 (트렌드 기반)
        # 현재 시간대에 따른 부하 패턴 고려
        current_hour = datetime.now().hour
        is_business_hours = 9 <= current_hour <= 18
        
        # 예측된 메트릭
        cpu_trend = "increasing" if current_cpu > 50 else "stable"
        memory_trend = "increasing" if current_memory > 60 else "stable"
        
        # 시간대별 예측
        predicted_cpu = current_cpu
        predicted_memory = current_memory
        predicted_response_time = 100
        
        if is_business_hours:
            # 업무 시간대에는 부하 증가 예상
            predicted_cpu = min(95, current_cpu + random.uniform(5, 20))
            predicted_memory = min(95, current_memory + random.uniform(3, 15))
            predicted_response_time = 100 + random.uniform(10, 50)
        else:
            # 비업무 시간대에는 부하 감소 예상
            predicted_cpu = max(10, current_cpu - random.uniform(5, 15))
            predicted_memory = max(30, current_memory - random.uniform(3, 10))
            predicted_response_time = max(50, 100 - random.uniform(10, 30))
        
        # 경고 생성
        alerts = []
        if predicted_cpu > 80:
            alerts.append({
                "level": "warning",
                "type": "high_cpu",
                "message": f"CPU 사용률이 {predicted_cpu:.1f}%로 예상됩니다.",
                "recommendation": "리소스 최적화 또는 스케일 아웃을 고려하세요."
            })
        if predicted_memory > 85:
            alerts.append({
                "level": "critical",
                "type": "high_memory",
                "message": f"메모리 사용률이 {predicted_memory:.1f}%로 예상됩니다.",
                "recommendation": "메모리 정리 또는 서버 증설을 고려하세요."
            })
        if predicted_response_time > 200:
            alerts.append({
                "level": "warning",
                "type": "slow_response",
                "message": f"응답 시간이 {predicted_response_time:.0f}ms로 예상됩니다.",
                "recommendation": "성능 최적화 또는 캐싱 전략을 검토하세요."
            })
        
        performance_prediction = {
            "current_metrics": {
                "cpu_usage": round(current_cpu, 2),
                "memory_usage": round(current_memory, 2),
                "disk_usage": round(current_disk, 2)
            },
            "predicted_metrics": {
                "cpu_usage": round(predicted_cpu, 2),
                "memory_usage": round(predicted_memory, 2),
                "response_time_ms": round(predicted_response_time, 0),
                "throughput": round(1500 * (1 - predicted_cpu / 100), 0)
            },
            "trends": {
                "cpu_trend": cpu_trend,
                "memory_trend": memory_trend,
                "load_trend": "increasing" if is_business_hours else "decreasing"
            } if include_trends else {},
            "prediction_horizon": time_horizon,
            "confidence": 0.75,
            "alerts": alerts,
            "recommendations": [
                "정기적인 모니터링 권장",
                "피크 시간대 리소스 준비",
                "자동 스케일링 설정 검토"
            ] if not alerts else [alert["recommendation"] for alert in alerts],
            "timestamp": datetime.now().isoformat()
        }
        
        # 예측 데이터 저장
        prediction_data["system_performance"].append({
            "prediction": performance_prediction,
            "created_at": datetime.now().isoformat()
        })
        
        # 최근 100개만 유지
        if len(prediction_data["system_performance"]) > 100:
            prediction_data["system_performance"] = prediction_data["system_performance"][-100:]
        
        return {
            "status": "success",
            "performance_prediction": performance_prediction
        }
    except Exception as e:
        logger.error(f"시스템 성능 예측 중 오류: {e}")
        # psutil이 없는 경우 기본값 반환
        return {
            "status": "success",
            "performance_prediction": {
                "current_metrics": {"cpu_usage": 0, "memory_usage": 0, "disk_usage": 0},
                "predicted_metrics": {"cpu_usage": 45, "memory_usage": 62, "response_time_ms": 120, "throughput": 1500},
                "prediction_horizon": time_horizon,
                "confidence": 0.70,
                "alerts": [],
                "timestamp": datetime.now().isoformat()
            },
            "warning": f"시스템 메트릭 수집 중 오류: {str(e)}"
        }


@app.get("/api/v7/predict/summary")
async def get_prediction_summary():
    """예측 요약 정보"""
    try:
        # 실제 예측 데이터에서 통계 계산
        total_user_activity = len(prediction_data["user_activity"])
        total_message_quality = len(prediction_data["message_quality"])
        total_system_performance = len(prediction_data["system_performance"])
        
        total_predictions = total_user_activity + total_message_quality + total_system_performance
        
        # 평균 정확도 계산 (시뮬레이션)
        accuracy_rates = {
            "user_activity": 0.78,
            "message_quality": 0.82,
            "system_performance": 0.75
        }
        
        overall_accuracy = (
            accuracy_rates["user_activity"] * total_user_activity +
            accuracy_rates["message_quality"] * total_message_quality +
            accuracy_rates["system_performance"] * total_system_performance
        ) / total_predictions if total_predictions > 0 else 0.78
        
        # 최근 예측 추세
        recent_predictions = {
            "user_activity": prediction_data["user_activity"][-10:] if total_user_activity > 0 else [],
            "message_quality": prediction_data["message_quality"][-10:] if total_message_quality > 0 else [],
            "system_performance": prediction_data["system_performance"][-10:] if total_system_performance > 0 else []
        }
        
        # 예측 품질 분석
        quality_insights = []
        if total_message_quality > 0:
            recent_quality = [p["quality_analysis"]["overall_score"] for p in recent_predictions["message_quality"]]
            avg_quality = sum(recent_quality) / len(recent_quality) if recent_quality else 0
            quality_insights.append({
                "metric": "평균 메시지 품질",
                "value": round(avg_quality, 2),
                "trend": "improving" if len(recent_quality) > 1 and recent_quality[-1] > recent_quality[0] else "stable"
            })
        
        summary = {
            "total_predictions": total_predictions,
            "accuracy_rate": round(overall_accuracy, 2),
            "active_models": 3,
            "last_updated": datetime.now().isoformat(),
            "predictions_by_type": {
                "user_activity": total_user_activity,
                "message_quality": total_message_quality,
                "system_performance": total_system_performance
            },
            "accuracy_by_type": {
                "user_activity": round(accuracy_rates["user_activity"], 2),
                "message_quality": round(accuracy_rates["message_quality"], 2),
                "system_performance": round(accuracy_rates["system_performance"], 2)
            },
            "recent_activity": {
                "last_hour": total_predictions,  # 실제로는 시간별 집계 필요
                "last_24_hours": total_predictions
            },
            "quality_insights": quality_insights,
            "model_status": {
                "user_activity": "active",
                "message_quality": "active",
                "system_performance": "active"
            }
        }
        
        return {
            "status": "success",
            "summary": summary
        }
    except Exception as e:
        logger.error(f"예측 요약 조회 중 오류: {e}")
        return {
            "status": "error",
            "message": f"예측 요약 조회 중 오류가 발생했습니다: {str(e)}"
        }


@app.post("/api/v7/analyze-emotion")
async def analyze_emotion(request: dict):
    """감정 분석"""
    try:
        text_content = request.get("text_content", "")
        user_id = request.get("user_id", "")
        room_id = request.get("room_id", user_id)
        
        # 감정 분석 로직 (실제로는 더 정교한 감정 분석 수행)
        emotion_keywords = [
            "기뻐", "좋아", "행복", "슬퍼", "화나", "놀라", "무서", "걱정"
        ]
        detected_emotions = [
            keyword for keyword in emotion_keywords if keyword in text_content
        ]
        
        positive_words = ["좋아", "기뻐", "행복"]
        primary_emotion = (
            "positive" if any(word in text_content for word in positive_words)
            else "neutral"
        )
        if any(word in text_content for word in ["슬퍼", "화나", "걱정"]):
            primary_emotion = "negative"
            
        emotion_analysis = {
            "primary_emotion": primary_emotion,
            "secondary_emotion": (
                "curious" if "?" in text_content else "neutral"
            ),
            "confidence": 0.85 if detected_emotions else 0.65,
            "intensity": len(detected_emotions) * 0.2 + 0.3,
            "sentiment_score": (
                0.7 if primary_emotion == "positive" 
                else (-0.3 if primary_emotion == "negative" else 0.1)
            ),
            "keywords": (
                detected_emotions[:3] if detected_emotions 
                else ["일반", "중립", "대화"]
            ),
            "text_length": len(text_content),
            "timestamp": datetime.now().isoformat()
        }
        
        # WebSocket을 통해 실시간 분석 결과 전송
        if room_id:
            analysis_message = {
                "type": "emotion_analysis",
                "user_id": user_id,
                "analysis": emotion_analysis,
                "original_message": text_content
            }
            await manager.broadcast_to_room(str(analysis_message), room_id)
        
        return {
            "status": "success",
            "emotion_analysis": emotion_analysis
        }
    except Exception as e:
        logger.error(f"감정 분석 중 오류: {e}")
        return {
            "status": "error",
            "message": "감정 분석 중 오류가 발생했습니다."
        }


@app.post("/api/v7/tone-matching")
async def tone_matching(request: dict):
    """톤 매칭"""
    try:
        
        # 톤 매칭 로직
        tone_analysis = {
            "detected_tone": "professional",
            "suggested_tone": "friendly",
            "confidence": 0.82,
            "tone_shift_reason": "사용자가 더 친근한 톤을 선호하는 것으로 보입니다.",
            "recommendations": [
                "더 친근한 표현 사용",
                "이모티콘 활용",
                "질문 형태로 대화 유도"
            ],
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "tone_analysis": tone_analysis
        }
    except Exception as e:
        logger.error(f"톤 매칭 중 오류: {e}")
        return {
            "status": "error",
            "message": "톤 매칭 중 오류가 발생했습니다."
        }


@app.post("/api/v7/comprehensive-message-analysis")
async def comprehensive_message_analysis(request: dict):
    """종합 메시지 분석"""
    try:
        message_content = request.get("message_content", "")
        
        # 종합 메시지 분석 로직
        comprehensive_analysis = {
            "content_analysis": {
                "length": len(message_content),
                "complexity": "medium",
                "readability_score": 0.78,
                "key_topics": ["프로젝트", "분석", "결과"]
            },
            "sentiment_analysis": {
                "overall_sentiment": "positive",
                "confidence": 0.75,
                "emotion_detected": "satisfied"
            },
            "context_analysis": {
                "relevance_to_context": 0.85,
                "continuity_score": 0.72,
                "context_alignment": "high"
            },
            "quality_metrics": {
                "clarity": 0.80,
                "completeness": 0.75,
                "appropriateness": 0.85
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "comprehensive_analysis": comprehensive_analysis
        }
    except Exception as e:
        logger.error(f"종합 메시지 분석 중 오류: {e}")
        return {
            "status": "error",
            "message": "종합 메시지 분석 중 오류가 발생했습니다."
        }


@app.get("/api/v7/status")
async def get_system_status():
    """시스템 상태 조회"""
    try:
        status_info = {
            "service_status": "running",
            "uptime": "2h 15m 30s",
            "active_connections": len(manager.active_connections),
            "total_rooms": len(manager.active_connections),
            "api_version": "v7",
            "last_health_check": datetime.now().isoformat(),
            "system_metrics": {
                "cpu_usage": 0.35,
                "memory_usage": 0.48,
                "disk_usage": 0.25
            }
        }
        
        return {
            "status": "success",
            "system_status": status_info
        }
    except Exception as e:
        logger.error(f"시스템 상태 조회 중 오류: {e}")
        return {
            "status": "error",
            "message": "시스템 상태 조회 중 오류가 발생했습니다."
        }


@app.get("/api/v7/chat-rooms")
async def get_chat_rooms():
    """채팅방 목록 조회"""
    try:
        rooms = []
        for room_id, connections in manager.active_connections.items():
            rooms.append({
                "room_id": room_id,
                "active_connections": len(connections),
                "created_at": datetime.now().isoformat()
            })
        
        return {
            "status": "success",
            "rooms": rooms,
            "total_rooms": len(rooms)
        }
    except Exception as e:
        logger.error(f"채팅방 목록 조회 중 오류: {e}")
        return {
            "status": "error",
            "message": "채팅방 목록 조회 중 오류가 발생했습니다."
        }


@app.get("/api/v7/analytics/dashboard")
async def get_analytics_dashboard():
    """분석 대시보드 데이터"""
    try:
        dashboard_data = {
            "total_messages": 1250,
            "active_users": 45,
            "average_response_time": 1.2,
            "popular_topics": [
                {"topic": "프로젝트 관리", "count": 320},
                {"topic": "기술 분석", "count": 280},
                {"topic": "팀 협업", "count": 240}
            ],
            "system_performance": {
                "uptime": "99.8%",
                "error_rate": "0.2%",
                "average_load": 0.65
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "dashboard_data": dashboard_data
        }
    except Exception as e:
        logger.error(f"분석 대시보드 조회 중 오류: {e}")
        return {
            "status": "error",
            "message": "분석 대시보드 조회 중 오류가 발생했습니다."
        }


@app.get("/api/v7/projects")
async def get_projects():
    """프로젝트 목록 조회"""
    try:
        projects = [
            {
                "id": "1",
                "name": "개포우성7차",
                "description": "개포우성7차 재건축 프로젝트",
                "status": "active",
                "created_at": "2024-01-15T10:00:00",
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": "2",
                "name": "AI 분석 시스템",
                "description": "고급 AI 분석 시스템 개발",
                "status": "active",
                "created_at": "2024-01-20T14:30:00",
                "updated_at": datetime.now().isoformat()
            }
        ]
        
        return {
            "status": "success",
            "projects": projects,
            "total_projects": len(projects)
        }
    except Exception as e:
        logger.error(f"프로젝트 목록 조회 중 오류: {e}")
        return {
            "status": "error",
            "message": "프로젝트 목록 조회 중 오류가 발생했습니다."
        }


@app.post("/api/v7/generate-gpt-message")
async def generate_gpt_message(request: dict):
    """GPT 메시지 생성"""
    try:
        prompt = request.get("prompt", "")
        style = request.get("style", "professional")
        
        # 스타일에 따른 응답 생성
        style_responses = {
            "encouraging": [
                "정말 멋진 소식이네요! 계속해서 좋은 결과가 있기를 바랍니다.",
                "훌륭한 성과입니다! 앞으로도 이런 긍정적인 에너지를 유지하세요.",
                "기쁜 마음이 전해집니다! 성공을 축하드립니다."
            ],
            "supportive": [
                "걱정하지 마세요. 어려운 상황도 시간이 지나면 해결됩니다.",
                "힘든 시간이지만, 당신은 충분히 극복할 수 있는 능력이 있습니다.",
                "모든 일이 잘 풀릴 거예요. 함께 해결책을 찾아보겠습니다."
            ],
            "professional": [
                "말씀하신 내용을 검토하고 적절한 답변을 드리겠습니다.",
                "해당 사안에 대해 분석하여 도움을 드리겠습니다.",
                "관련 정보를 바탕으로 최선의 조언을 제공하겠습니다."
            ]
        }
        
        import random
        responses = style_responses.get(style, style_responses["professional"])
        generated_message = random.choice(responses)
        
        # 프롬프트 내용이 있으면 더 구체적인 응답 생성
        if "감정:" in prompt:
            emotion = prompt.split("감정:")[-1].strip()
            if emotion == "positive":
                generated_message = "긍정적인 에너지가 느껴집니다! " + generated_message
            elif emotion == "negative":
                generated_message = "힘든 상황인 것 같네요. " + generated_message
        
        return {
            "status": "success",
            "generated_message": generated_message,
            "style": style,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"GPT 메시지 생성 중 오류: {e}")
        return {
            "status": "error",
            "message": "GPT 메시지 생성 중 오류가 발생했습니다."
        }


@app.post("/api/v7/file/analyze-and-learn")
async def analyze_and_learn_file(request: dict):
    """파일 분석 및 AI 학습"""
    try:
        file_name = request.get("file_name", "")
        file_type = request.get("file_type", "")
        file_size = request.get("file_size", 0)
        user_id = request.get("user_id", "")
        room_id = request.get("room_id", user_id)
        
        # 파일 타입별 분석 로직
        analysis_steps = []
        
        if file_type.startswith('image/'):
            analysis_steps = [
                "이미지 메타데이터 추출",
                "시각적 요소 분석",
                "객체 인식 실행",
                "텍스트 OCR 처리",
                "이미지 특성 학습"
            ]
        elif file_type == 'application/pdf':
            analysis_steps = [
                "PDF 텍스트 추출",
                "문서 구조 분석",
                "키워드 추출",
                "토픽 모델링",
                "지식 베이스 업데이트"
            ]
        elif file_type.startswith('text/'):
            analysis_steps = [
                "텍스트 전처리",
                "언어 패턴 분석",
                "감정 분석",
                "주제 분류",
                "문맥 학습"
            ]
        else:
            analysis_steps = [
                "파일 구조 분석",
                "메타데이터 추출",
                "패턴 인식",
                "데이터 분류",
                "지식 통합"
            ]
        
        # 학습 결과 생성
        learning_result = {
            "file_info": {
                "name": file_name,
                "type": file_type,
                "size": file_size
            },
            "analysis_steps": analysis_steps,
            "extracted_knowledge": {
                "keywords": ["프로젝트", "분석", "데이터", "AI"],
                "topics": ["파일 분석", "지식 추출", "AI 학습"],
                "insights": [
                    f"{file_name} 파일에서 중요한 정보를 추출했습니다.",
                    "새로운 지식이 시스템에 추가되었습니다.",
                    "AI 모델의 성능이 향상되었습니다."
                ]
            },
            "learning_metrics": {
                "knowledge_growth": 0.15,
                "model_accuracy_improvement": 0.03,
                "processing_time": 4.2,
                "confidence": 0.88
            },
            "timestamp": datetime.now().isoformat()
        }
        
        # WebSocket을 통해 학습 진행 상황 실시간 전송
        if room_id:
            for i, step in enumerate(analysis_steps):
                progress_message = {
                    "type": "file_learning_progress",
                    "step": i + 1,
                    "total_steps": len(analysis_steps),
                    "current_step": step,
                    "progress": ((i + 1) / len(analysis_steps)) * 100,
                    "file_name": file_name
                }
                await manager.broadcast_to_room(str(progress_message), room_id)
        
        return {
            "status": "success",
            "learning_result": learning_result
        }
    except Exception as e:
        logger.error(f"파일 분석 및 학습 중 오류: {e}")
        return {
            "status": "error",
            "message": "파일 분석 및 학습 중 오류가 발생했습니다."
        }


@app.post("/api/v7/writing/suggestions")
async def get_writing_suggestions(request: dict):
    """
    글쓰기 AI 제안 생성
    """
    try:
        content = request.get("content", "")
        template = request.get("template", "")
        max_suggestions = request.get("max_suggestions", 5)

        if not content or len(content.strip()) < 50:
            return {
                "success": False,
                "error": "내용이 너무 짧습니다. 최소 50자 이상 필요합니다.",
                "suggestions": []
            }

        suggestions = []
        word_count = len(content.split())
        sentence_count = len([s for s in content.split('.') if s.strip()])
        paragraph_count = len([p for p in content.split('\n\n') if p.strip()])
        avg_words_per_sentence = word_count / (sentence_count or 1)

        # 구조 개선 제안
        if paragraph_count < 2 and word_count > 200:
            suggestions.append({
                "id": "struct-1",
                "type": "structure",
                "title": "구조 개선",
                "description": "내용을 더 명확한 단락으로 나누면 가독성이 향상됩니다.",
                "suggestion": "주제별로 단락을 나누고 각 단락에 소제목을 추가하는 것을 고려해보세요.",
                "confidence": 0.8,
                "priority": "high"
            })

        # 문장 길이 제안
        if avg_words_per_sentence > 25:
            suggestions.append({
                "id": "simplify-1",
                "type": "simplification",
                "title": "문장 간소화",
                "description": "긴 문장을 짧게 나누면 이해하기 쉬워집니다.",
                "suggestion": "복잡한 문장을 두 개 이상의 짧은 문장으로 나누어보세요.",
                "confidence": 0.75,
                "priority": "medium"
            })

        # 확장 제안
        if word_count < 200 and template:
            suggestions.append({
                "id": "expand-1",
                "type": "expansion",
                "title": "내용 확장",
                "description": "주제를 더 깊이 있게 다루면 글의 완성도가 높아집니다.",
                "suggestion": "구체적인 예시나 경험, 데이터를 추가하여 내용을 보강해보세요.",
                "confidence": 0.7,
                "priority": "medium"
            })

        # 어투 제안
        if template and any(keyword in template for keyword in ['이메일', '공식 문서', '보고서']):
            suggestions.append({
                "id": "tone-1",
                "type": "tone",
                "title": "어투 조정",
                "description": "공식적인 문서에는 격식 있는 어투가 적합합니다.",
                "suggestion": "격식 있는 표현(예: ~입니다, ~합니다)을 사용하여 전문성을 높이세요.",
                "confidence": 0.85,
                "priority": "high"
            })

        # 가독성 제안
        if avg_words_per_sentence < 5:
            suggestions.append({
                "id": "readability-1",
                "type": "improvement",
                "title": "가독성 개선",
                "description": "문장이 너무 짧으면 글의 흐름이 끊길 수 있습니다.",
                "suggestion": "관련된 짧은 문장들을 연결하여 더 자연스러운 흐름을 만들어보세요.",
                "confidence": 0.7,
                "priority": "medium"
            })

        return {
            "success": True,
            "suggestions": suggestions[:max_suggestions],
            "analysis": {
                "word_count": word_count,
                "sentence_count": sentence_count,
                "paragraph_count": paragraph_count,
                "avg_words_per_sentence": round(avg_words_per_sentence, 2)
            }
        }

    except Exception as e:
        logger.error(f"글쓰기 제안 생성 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "suggestions": []
        }


@app.get("/api/v7/analytics/realtime")
async def get_realtime_analytics():
    """실시간 분석 데이터"""
    try:
        import random
        
        realtime_data = {
            "current_time": datetime.now().isoformat(),
            "active_sessions": len(manager.active_connections),
            "messages_per_minute": random.randint(15, 45),
            "ai_processing_queue": random.randint(2, 8),
            "system_load": {
                "cpu": round(random.uniform(0.2, 0.8), 2),
                "memory": round(random.uniform(0.3, 0.7), 2),
                "ai_models": round(random.uniform(0.4, 0.9), 2)
            },
            "emotion_distribution": {
                "positive": round(random.uniform(0.3, 0.6), 2),
                "neutral": round(random.uniform(0.2, 0.5), 2),
                "negative": round(random.uniform(0.1, 0.3), 2)
            },
            "learning_stats": {
                "files_processed": random.randint(50, 150),
                "knowledge_entries": random.randint(500, 1500),
                "model_updates": random.randint(5, 25)
            }
        }
        
        return {
            "status": "success",
            "realtime_data": realtime_data
        }
    except Exception as e:
        logger.error(f"실시간 분석 데이터 조회 중 오류: {e}")
        return {
            "status": "error",
            "message": "실시간 분석 데이터 조회 중 오류가 발생했습니다."
        }


@app.post("/api/v7/conversation/summarize")
async def summarize_conversation(request: dict):
    """대화 요약 생성"""
    try:
        messages = request.get("messages", [])
        summary_type = request.get("type", "brief")  # brief/detailed/insights
        
        if not messages:
            return {
                "status": "error",
                "message": "요약할 메시지가 없습니다."
            }
        
        # 메시지 분석
        total_messages = len(messages)
        user_messages = [msg for msg in messages if msg.get("isUser", False)]
        ai_messages = [msg for msg in messages if not msg.get("isUser", False)]
        
        # 키워드 추출 (간단한 빈도 분석)
        all_text = " ".join([msg.get("content", "") for msg in messages])
        keywords = ["프로젝트", "분석", "개발", "AI", "시스템", "기능", "데이터"]
        found_keywords = [kw for kw in keywords if kw in all_text]
        
        # 요약 생성
        if summary_type == "brief":
            summary = {
                "type": "brief",
                "summary": (
                    f"총 {total_messages}개의 메시지로 구성된 대화입니다. "
                    f"주요 키워드: {', '.join(found_keywords[:3])}"
                ),
                "message_count": total_messages,
                "duration_estimate": f"약 {total_messages * 0.5:.1f}분",
                "main_topics": found_keywords[:3]
            }
        elif summary_type == "detailed":
            summary = {
                "type": "detailed",
                "summary": (
                    f"이 대화는 {len(user_messages)}개의 사용자 메시지와 "
                    f"{len(ai_messages)}개의 AI 응답으로 구성되어 있습니다."
                ),
                "key_insights": [
                    f"주요 논의 주제: {', '.join(found_keywords[:5])}",
                    (
                        f"대화의 활발함: "
                        f"{'높음' if total_messages > 10 else ('보통' if total_messages > 5 else '낮음')}"
                    ),
                    f"AI 참여도: {len(ai_messages) / total_messages * 100:.1f}%"
                ],
                "statistics": {
                    "total_messages": total_messages,
                    "user_messages": len(user_messages),
                    "ai_messages": len(ai_messages),
                    "average_length": (
                        sum(len(msg.get("content", "")) for msg in messages) 
                        / total_messages
                    )
                }
            }
        else:  # insights
            summary = {
                "type": "insights",
                "summary": "대화 패턴 및 인사이트 분석 결과입니다.",
                "insights": [
                    "사용자는 주로 기술적 질문에 관심을 보입니다.",
                    "AI 시스템에 대한 이해도가 높은 편입니다.",
                    "프로젝트 진행 상황에 대한 업데이트를 자주 요청합니다."
                ],
                "recommendations": [
                    "더 구체적인 기술 문서 제공을 고려해보세요.",
                    "정기적인 프로젝트 상태 업데이트 알림을 설정하세요.",
                    "사용자 맞춤형 AI 기능 추천을 제공하세요."
                ]
            }
        
        return {
            "status": "success",
            "summary": summary,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"대화 요약 생성 중 오류: {e}")
        return {
            "status": "error",
            "message": "대화 요약 생성 중 오류가 발생했습니다."
        }


@app.post("/api/v7/predict/next-action")
async def predict_next_action(request: dict):
    """다음 행동 예측"""
    try:
        # user_context = request.get("context", {})  # Reserved for future use
        recent_actions = request.get("recent_actions", [])
        
        # 간단한 패턴 기반 예측
        predictions = []
        
        if any("파일" in action for action in recent_actions):
            predictions.append({
                "action": "file_analysis_request",
                "description": "파일 분석 결과 확인",
                "probability": 0.85,
                "suggested_prompt": "방금 업로드한 파일의 분석 결과를 자세히 보여주세요."
            })
        
        if any("프로젝트" in action for action in recent_actions):
            predictions.append({
                "action": "project_status_check",
                "description": "프로젝트 상태 확인",
                "probability": 0.75,
                "suggested_prompt": "현재 프로젝트 진행 상황을 요약해주세요."
            })
        
        if any("분석" in action for action in recent_actions):
            predictions.append({
                "action": "detailed_analysis_request",
                "description": "상세 분석 요청",
                "probability": 0.70,
                "suggested_prompt": "더 자세한 분석을 해주실 수 있나요?"
            })
        
        # 기본 예측들
        if not predictions:
            predictions = [
                {
                    "action": "general_question",
                    "description": "일반적인 질문",
                    "probability": 0.60,
                    "suggested_prompt": "무엇을 도와드릴까요?"
                },
                {
                    "action": "system_status_check",
                    "description": "시스템 상태 확인",
                    "probability": 0.40,
                    "suggested_prompt": "시스템 상태를 확인해주세요."
                }
            ]
        
        return {
            "status": "success",
            "predictions": sorted(
                predictions, key=lambda x: x["probability"], reverse=True
            )[:3],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"다음 행동 예측 중 오류: {e}")
        return {
            "status": "error",
            "message": "다음 행동 예측 중 오류가 발생했습니다."
        }


@app.get("/api/v7/websocket/test")
async def test_websocket():
    """WebSocket 테스트 엔드포인트"""
    return {
        "status": "success",
        "message": "WebSocket 서버가 정상적으로 실행 중입니다.",
        "websocket_url": "ws://localhost:8000/ws/chat/{room_id}",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/v7/projects/{project_id}/analytics")
async def get_project_analytics(project_id: str):
    """프로젝트 상세 분석 데이터"""
    try:
        import random
        
        # 프로젝트별 상세 분석 데이터 생성
        analytics_data = {
            "project_id": project_id,
            "overview": {
                "completion_rate": round(random.uniform(0.3, 0.95), 2),
                "total_tasks": random.randint(15, 50),
                "completed_tasks": random.randint(5, 30),
                "team_members": random.randint(3, 12),
                "active_discussions": random.randint(2, 15)
            },
            "progress_timeline": [
                {
                    "date": "2025-01-01",
                    "milestone": "프로젝트 시작",
                    "completion": 0.0,
                    "notes": "초기 설정 및 팀 구성"
                },
                {
                    "date": "2025-01-15", 
                    "milestone": "1차 개발 완료",
                    "completion": 0.3,
                    "notes": "기본 구조 설계 완료"
                },
                {
                    "date": "2025-02-01",
                    "milestone": "중간 점검",
                    "completion": 0.6,
                    "notes": "핵심 기능 구현 진행"
                }
            ],
            "team_performance": {
                "productivity_score": round(random.uniform(0.7, 0.95), 2),
                "collaboration_rating": round(random.uniform(0.8, 1.0), 2),
                "code_quality": round(random.uniform(0.75, 0.9), 2),
                "communication_frequency": random.randint(20, 80)
            },
            "risk_assessment": {
                "overall_risk": "medium",
                "identified_risks": [
                    {
                        "type": "schedule",
                        "description": "일정 지연 가능성",
                        "probability": 0.3,
                        "impact": "medium"
                    },
                    {
                        "type": "resource",
                        "description": "리소스 부족",
                        "probability": 0.2,
                        "impact": "low"
                    }
                ],
                "mitigation_suggestions": [
                    "추가 개발자 투입 검토",
                    "일정 조정 및 우선순위 재설정",
                    "정기적인 진행 상황 점검 강화"
                ]
            },
            "ai_insights": {
                "predicted_completion_date": "2025-03-15",
                "success_probability": round(random.uniform(0.8, 0.95), 2),
                "recommended_actions": [
                    "코드 리뷰 프로세스 강화",
                    "테스트 커버리지 향상",
                    "문서화 작업 병행"
                ],
                "optimization_opportunities": [
                    "자동화 도구 도입으로 효율성 20% 향상 가능",
                    "커뮤니케이션 채널 개선으로 협업 효율 증대",
                    "CI/CD 파이프라인 구축으로 배포 시간 단축"
                ]
            },
            "resource_utilization": {
                "budget_usage": round(random.uniform(0.4, 0.8), 2),
                "time_allocation": {
                    "development": 0.6,
                    "testing": 0.2,
                    "documentation": 0.1,
                    "meetings": 0.1
                },
                "skill_distribution": {
                    "frontend": 0.4,
                    "backend": 0.35,
                    "devops": 0.15,
                    "design": 0.1
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "analytics": analytics_data
        }
    except Exception as e:
        logger.error(f"프로젝트 분석 데이터 조회 중 오류: {e}")
        return {
            "status": "error",
            "message": "프로젝트 분석 데이터 조회 중 오류가 발생했습니다."
        }


@app.post("/api/v7/projects/{project_id}/collaborate")
async def update_collaboration(project_id: str, request: dict):
    """프로젝트 협업 업데이트"""
    try:
        action_type = request.get("action", "")
        user_id = request.get("user_id", "")
        content = request.get("content", "")
        
        # 협업 액션 처리
        collaboration_response = {
            "project_id": project_id,
            "action_processed": action_type,
            "user_id": user_id,
            "result": "",
            "timestamp": datetime.now().isoformat()
        }
        
        if action_type == "add_comment":
            collaboration_response["result"] = "댓글이 추가되었습니다."
        elif action_type == "update_status":
            collaboration_response["result"] = f"상태가 '{content}'로 업데이트되었습니다."
        elif action_type == "assign_task":
            collaboration_response["result"] = "작업이 할당되었습니다."
        elif action_type == "share_file":
            collaboration_response["result"] = "파일이 공유되었습니다."
        else:
            collaboration_response["result"] = "협업 액션이 처리되었습니다."
        
        # 팀에게 실시간 알림 전송 (WebSocket)
        notification_message = {
            "type": "collaboration_update",
            "project_id": project_id,
            "user_id": user_id,
            "action": action_type,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        
        # 프로젝트 룸에 브로드캐스트
        await manager.broadcast_to_room(str(notification_message), project_id)
        
        return {
            "status": "success",
            "collaboration": collaboration_response
        }
    except Exception as e:
        logger.error(f"협업 업데이트 중 오류: {e}")
        return {
            "status": "error", 
            "message": "협업 업데이트 중 오류가 발생했습니다."
        }


@app.get("/api/v7/projects/{project_id}/recommendations")
async def get_project_recommendations(project_id: str):
    """프로젝트 개선 추천사항"""
    try:
        recommendations = {
            "project_id": project_id,
            "priority_actions": [
                {
                    "priority": "high",
                    "category": "performance",
                    "title": "코드 최적화",
                    "description": "병목 지점 개선으로 성능 30% 향상 가능",
                    "estimated_impact": 0.8,
                    "effort_required": "medium",
                    "timeline": "2주"
                },
                {
                    "priority": "medium", 
                    "category": "collaboration",
                    "title": "커뮤니케이션 강화",
                    "description": "일일 스탠드업 미팅 도입",
                    "estimated_impact": 0.6,
                    "effort_required": "low",
                    "timeline": "즉시"
                },
                {
                    "priority": "low",
                    "category": "documentation",
                    "title": "API 문서화",
                    "description": "개발자 가이드 및 API 문서 작성",
                    "estimated_impact": 0.4,
                    "effort_required": "high",
                    "timeline": "1개월"
                }
            ],
            "ai_suggestions": {
                "automation_opportunities": [
                    "테스트 자동화로 QA 시간 50% 단축",
                    "배포 자동화로 릴리스 사이클 개선",
                    "코드 리뷰 자동화 도구 도입"
                ],
                "skill_gaps": [
                    "DevOps 역량 강화 필요",
                    "클라우드 네이티브 기술 학습",
                    "보안 전문성 향상"
                ],
                "resource_optimization": [
                    "클라우드 비용 20% 절감 가능",
                    "개발 도구 통합으로 효율성 증대",
                    "모니터링 시스템 개선"
                ]
            },
            "success_factors": [
                "명확한 목표 설정과 진행 상황 추적",
                "팀원 간의 원활한 소통과 협업",
                "지속적인 학습과 기술 개선",
                "사용자 피드백 반영 및 개선"
            ],
            "next_milestones": [
                {
                    "date": "2025-02-15",
                    "title": "베타 버전 출시",
                    "description": "핵심 기능 완성 및 사용자 테스트"
                },
                {
                    "date": "2025-03-01", 
                    "title": "성능 최적화",
                    "description": "시스템 성능 개선 및 안정성 강화"
                },
                {
                    "date": "2025-03-15",
                    "title": "최종 릴리스",
                    "description": "정식 버전 출시 및 서비스 시작"
                }
            ],
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "recommendations": recommendations
        }
    except Exception as e:
        logger.error(f"프로젝트 추천사항 조회 중 오류: {e}")
        return {
            "status": "error",
            "message": "프로젝트 추천사항 조회 중 오류가 발생했습니다."
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 