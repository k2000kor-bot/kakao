#!/usr/bin/env python3
"""
종합 카카오톡 메시지 관리 API v8.1
- 복합 미디어 메시지 데이터베이스 통합
- 고도화된 미디어 처리 시스템
- 실시간 파일 업로드 및 분석
- 메시지 구성 요소별 검색
- 미디어 콘텐츠 기반 AI 메시지 생성
- 프론트엔드 연동 강화
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Union
from datetime import datetime, timedelta
import uvicorn
import logging
import os
import json
import shutil
import asyncio
import time
from pathlib import Path
import aiofiles

# 통합 시스템들
from advanced_message_database import AdvancedMessageDatabase, ComplexMessage, MessageComponent
from enhanced_media_processor import EnhancedMediaProcessor, ProcessedMedia
from integrated_ai_system import IntegratedAISystem
from kakao_chat_parser import KakaoChatParser
from advanced_ai_message_generator import ai_message_generator
from notification_system import notification_manager
from conversation_analyzer import conversation_analyzer
from realtime_conversation_monitor import realtime_monitor
from advanced_ml_engine import advanced_ml_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="종합 카카오톡 메시지 관리 API v8.1",
    description="복합 미디어 메시지 분석 및 AI 메시지 생성 통합 시스템",
    version="8.1.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 시스템 인스턴스들
message_db: Optional[AdvancedMessageDatabase] = None
media_processor: Optional[EnhancedMediaProcessor] = None
ai_system: Optional[IntegratedAISystem] = None
chat_parser: Optional[KakaoChatParser] = None

# WebSocket 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Pydantic 모델들
class MessageSearchRequest(BaseModel):
    chat_room_id: Optional[str] = None
    sender_id: Optional[str] = None
    content_type: Optional[str] = None
    keywords: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    has_media: Optional[bool] = None
    limit: int = 50


class MediaProcessingRequest(BaseModel):
    file_ids: List[str]
    processing_options: Optional[Dict[str, Any]] = None


class AIMessageRequest(BaseModel):
    person_id: str
    target_topic: str
    message_intent: str
    reference_media_ids: Optional[List[str]] = None
    use_political_style: Optional[str] = None
    political_blend_ratio: float = 0.3

class SimpleAIMessageRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class NotificationRequest(BaseModel):
    notification_type: str
    title: str
    message: str
    priority: str = "normal"
    data: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None
    project_id: Optional[str] = None


class MessageAnalysisResponse(BaseModel):
    success: bool
    message_id: str
    analysis_results: Dict[str, Any]
    extracted_content: List[Dict[str, Any]]
    media_analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ProjectCreateRequest(BaseModel):
    name: str
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:74:17
TS2322: Type '{ original_message: string; sender: string; chat_room_id: string; target_audience: string[]; context_type: string; urgency_level: string; message_length: string; include_data: boolean; include_examples: boolean; ... 4 more ...; learning_enabled: boolean; }' is not assignable to type 'AdvancedMessageRequest'.
  Object literal may only specify known properties, and 'sender' does not exist in type 'AdvancedMessageRequest'.
    72 |             const request: AdvancedMessageRequest = {
    73 |                 original_message: originalMessage,
  > 74 |                 sender: sender || 'default_user',
       |                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    75 |                 chat_room_id: chatRoomId || 'default_room',
    76 |                 target_audience: targetAudience.length > 0 ? targetAudience : ['일반'],
    77 |                 context_type: contextType,
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:89:53
TS2551: Property 'generateAdvancedMessage' does not exist on type 'AdvancedMessageAPIClient'. Did you mean 'generateAIMessage'?
    87 |             };
    88 |
  > 89 |             const result = await advancedMessageAPI.generateAdvancedMessage(request);
       |                                                     ^^^^^^^^^^^^^^^^^^^^^^^
    90 |             setGeneratedMessage(result);
    91 |         } catch (error) {
    92 |             console.error('메시지 생성 오류:', error);
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:103:38
TS2339: Property 'submitLearningFeedback' does not exist on type 'AdvancedMessageAPIClient'.
    101 |
    102 |         try {
  > 103 |             await advancedMessageAPI.submitLearningFeedback({
        |                                      ^^^^^^^^^^^^^^^^^^^^^^
    104 |                 message_id: generatedMessage.id,
    105 |                 user_feedback: feedback,
    106 |                 success_indicator: success,
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:112:36
TS2345: Argument of type 'APIResponse<any>' is not assignable to parameter of type 'SetStateAction<PerformanceAnalysis | null>'.
    110 |             // 성능 분석 새로고침
    111 |             const performance = await advancedMessageAPI.getPerformanceAnalysis();
  > 112 |             setPerformanceAnalysis(performance);
        |                                    ^^^^^^^^^^^
    113 |
    114 |             alert('학습 피드백이 제출되었습니다.');
    115 |         } catch (error) {
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:125:53
TS2339: Property 'updateUserProfile' does not exist on type 'AdvancedMessageAPIClient'.
    123 |
    124 |         try {
  > 125 |             const result = await advancedMessageAPI.updateUserProfile(userProfile);
        |                                                     ^^^^^^^^^^^^^^^^^
    126 |             if (result.success) {
    127 |                 alert('사용자 프로필이 업데이트되었습니다.');
    128 |             } else {
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:263:56
TS2339: Property 'model_name' does not exist on type 'AIModelPerformance'.
    261 |                                 <option value="">자동 선택</option>
    262 |                                 {aiModels.map(model => (
  > 263 |                                     <option key={model.model_name} value={model.model_name}>
        |                                                        ^^^^^^^^^^
    264 |                                         {model.model_name} (성공률: {model.success_rate * 100}%)
    265 |                                     </option>
    266 |                                 ))}
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:263:81
TS2339: Property 'model_name' does not exist on type 'AIModelPerformance'.
    261 |                                 <option value="">자동 선택</option>
    262 |                                 {aiModels.map(model => (
  > 263 |                                     <option key={model.model_name} value={model.model_name}>
        |                                                                                 ^^^^^^^^^^
    264 |                                         {model.model_name} (성공률: {model.success_rate * 100}%)
    265 |                                     </option>
    266 |                                 ))}
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:264:48
TS2339: Property 'model_name' does not exist on type 'AIModelPerformance'.
    262 |                                 {aiModels.map(model => (
    263 |                                     <option key={model.model_name} value={model.model_name}>
  > 264 |                                         {model.model_name} (성공률: {model.success_rate * 100}%)
        |                                                ^^^^^^^^^^
    265 |                                     </option>
    266 |                                 ))}
    267 |                             </select>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:264:73
TS2339: Property 'success_rate' does not exist on type 'AIModelPerformance'.
    262 |                                 {aiModels.map(model => (
    263 |                                     <option key={model.model_name} value={model.model_name}>
  > 264 |                                         {model.model_name} (성공률: {model.success_rate * 100}%)
        |                                                                         ^^^^^^^^^^^^
    265 |                                     </option>
    266 |                                 ))}
    267 |                             </select>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:344:80
TS2339: Property 'generated_message' does not exist on type 'AdvancedGeneratedMessage'.
    342 |                             <div className="bg-gray-50 p-4 rounded-lg">
    343 |                                 <h3 className="font-medium text-gray-800 mb-2">생성된 메시지</h3>
  > 344 |                                 <p className="text-gray-700">{generatedMessage.generated_message}</p>
        |                                                                                ^^^^^^^^^^^^^^^^^
    345 |                             </div>
    346 |
    347 |                             {/* AI 모델 정보 */}
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:350:88
TS2339: Property 'ai_model_used' does not exist on type 'AdvancedGeneratedMessage'.
    348 |                             <div className="bg-blue-50 p-4 rounded-lg">
    349 |                                 <h3 className="font-medium text-blue-800 mb-2">AI 모델 정보</h3>
  > 350 |                                 <p className="text-blue-700">사용된 모델: {generatedMessage.ai_model_used}</p>
        |                                                                                        ^^^^^^^^^^^^^
    351 |                                 <p className="text-blue-700">신뢰도: {(generatedMessage.confidence_score * 100).toFixed(1)}%</p>
    352 |                                 <p className="text-blue-700">개인화 점수: {(generatedMessage.personalization_score * 100).toFixed(1)}%</p>
    353 |                                 <p className="text-blue-700">영향력 예측: {generatedMessage.impact_prediction.toFixed(1)}%</p>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:351:86
TS2339: Property 'confidence_score' does not exist on type 'AdvancedGeneratedMessage'.
    349 |                                 <h3 className="font-medium text-blue-800 mb-2">AI 모델 정보</h3>
    350 |                                 <p className="text-blue-700">사용된 모델: {generatedMessage.ai_model_used}</p>
  > 351 |                                 <p className="text-blue-700">신뢰도: {(generatedMessage.confidence_score * 100).toFixed(1)}%</p>
        |                                                                                      ^^^^^^^^^^^^^^^^
    352 |                                 <p className="text-blue-700">개인화 점수: {(generatedMessage.personalization_score * 100).toFixed(1)}%</p>
    353 |                                 <p className="text-blue-700">영향력 예측: {generatedMessage.impact_prediction.toFixed(1)}%</p>
    354 |                             </div>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:352:89
TS2339: Property 'personalization_score' does not exist on type 'AdvancedGeneratedMessage'.
    350 |                                 <p className="text-blue-700">사용된 모델: {generatedMessage.ai_model_used}</p>
    351 |                                 <p className="text-blue-700">신뢰도: {(generatedMessage.confidence_score * 100).toFixed(1)}%</p>
  > 352 |                                 <p className="text-blue-700">개인화 점수: {(generatedMessage.personalization_score * 100).toFixed(1)}%</p>
        |                                                                                         ^^^^^^^^^^^^^^^^^^^^^
    353 |                                 <p className="text-blue-700">영향력 예측: {generatedMessage.impact_prediction.toFixed(1)}%</p>
    354 |                             </div>
    355 |
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:353:88
TS2339: Property 'impact_prediction' does not exist on type 'AdvancedGeneratedMessage'.
    351 |                                 <p className="text-blue-700">신뢰도: {(generatedMessage.confidence_score * 100).toFixed(1)}%</p>
    352 |                                 <p className="text-blue-700">개인화 점수: {(generatedMessage.personalization_score * 100).toFixed(1)}%</p>
  > 353 |                                 <p className="text-blue-700">영향력 예측: {generatedMessage.impact_prediction.toFixed(1)}%</p>
        |                                                                                        ^^^^^^^^^^^^^^^^^
    354 |                             </div>
    355 |
    356 |                             {/* 감정 분석 */}
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:359:88
TS2339: Property 'emotion_analysis' does not exist on type 'AdvancedGeneratedMessage'.
    357 |                             <div className="bg-green-50 p-4 rounded-lg">
    358 |                                 <h3 className="font-medium text-green-800 mb-2">감정 분석</h3>
  > 359 |                                 <p className="text-green-700">주요 감정: {generatedMessage.emotion_analysis.primary_emotion}</p>
        |                                                                                        ^^^^^^^^^^^^^^^^
    360 |                                 <p className="text-green-700">감정 강도: {(generatedMessage.emotion_analysis.intensity * 100).toFixed(1)}%</p>
    361 |                                 <p className="text-green-700">분석 신뢰도: {(generatedMessage.emotion_analysis.confidence * 100).toFixed(1)}%</p>
    362 |                             </div>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:360:89
TS2339: Property 'emotion_analysis' does not exist on type 'AdvancedGeneratedMessage'.
    358 |                                 <h3 className="font-medium text-green-800 mb-2">감정 분석</h3>
    359 |                                 <p className="text-green-700">주요 감정: {generatedMessage.emotion_analysis.primary_emotion}</p>
  > 360 |                                 <p className="text-green-700">감정 강도: {(generatedMessage.emotion_analysis.intensity * 100).toFixed(1)}%</p>
        |                                                                                         ^^^^^^^^^^^^^^^^
    361 |                                 <p className="text-green-700">분석 신뢰도: {(generatedMessage.emotion_analysis.confidence * 100).toFixed(1)}%</p>
    362 |                             </div>
    363 |
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:361:90
TS2339: Property 'emotion_analysis' does not exist on type 'AdvancedGeneratedMessage'.
    359 |                                 <p className="text-green-700">주요 감정: {generatedMessage.emotion_analysis.primary_emotion}</p>
    360 |                                 <p className="text-green-700">감정 강도: {(generatedMessage.emotion_analysis.intensity * 100).toFixed(1)}%</p>
  > 361 |                                 <p className="text-green-700">분석 신뢰도: {(generatedMessage.emotion_analysis.confidence * 100).toFixed(1)}%</p>
        |                                                                                          ^^^^^^^^^^^^^^^^
    362 |                             </div>
    363 |
    364 |                             {/* 학습 인사이트 */}
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:365:47
TS2339: Property 'learning_insights' does not exist on type 'AdvancedGeneratedMessage'.
    363 |
    364 |                             {/* 학습 인사이트 */}
  > 365 |                             {generatedMessage.learning_insights.length > 0 && (
        |                                               ^^^^^^^^^^^^^^^^^
    366 |                                 <div className="bg-yellow-50 p-4 rounded-lg">
    367 |                                     <h3 className="font-medium text-yellow-800 mb-2">학습 인사이트</h3>
    368 |                                     <ul className="text-yellow-700 space-y-1">
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:369:59
TS2339: Property 'learning_insights' does not exist on type 'AdvancedGeneratedMessage'.
    367 |                                     <h3 className="font-medium text-yellow-800 mb-2">학습 인사이트</h3>
    368 |                                     <ul className="text-yellow-700 space-y-1">
  > 369 |                                         {generatedMessage.learning_insights.map((insight, index) => (
        |                                                           ^^^^^^^^^^^^^^^^^
    370 |                                             <li key={index} className="text-sm">• {insight}</li>
    371 |                                         ))}
    372 |                                     </ul>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:369:82
TS7006: Parameter 'insight' implicitly has an 'any' type.
    367 |                                     <h3 className="font-medium text-yellow-800 mb-2">학습 인사이트</h3>
    368 |                                     <ul className="text-yellow-700 space-y-1">
  > 369 |                                         {generatedMessage.learning_insights.map((insight, index) => (
        |                                                                                  ^^^^^^^
    370 |                                             <li key={index} className="text-sm">• {insight}</li>
    371 |                                         ))}
    372 |                                     </ul>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:369:91
TS7006: Parameter 'index' implicitly has an 'any' type.
    367 |                                     <h3 className="font-medium text-yellow-800 mb-2">학습 인사이트</h3>
    368 |                                     <ul className="text-yellow-700 space-y-1">
  > 369 |                                         {generatedMessage.learning_insights.map((insight, index) => (
        |                                                                                           ^^^^^
    370 |                                             <li key={index} className="text-sm">• {insight}</li>
    371 |                                         ))}
    372 |                                     </ul>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:377:47
TS2339: Property 'alternatives' does not exist on type 'AdvancedGeneratedMessage'.
    375 |
    376 |                             {/* 대안 메시지 */}
  > 377 |                             {generatedMessage.alternatives.length > 0 && (
        |                                               ^^^^^^^^^^^^
    378 |                                 <div className="bg-purple-50 p-4 rounded-lg">
    379 |                                     <h3 className="font-medium text-purple-800 mb-2">대안 메시지</h3>
    380 |                                     <div className="space-y-2">
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:381:59
TS2339: Property 'alternatives' does not exist on type 'AdvancedGeneratedMessage'.
    379 |                                     <h3 className="font-medium text-purple-800 mb-2">대안 메시지</h3>
    380 |                                     <div className="space-y-2">
  > 381 |                                         {generatedMessage.alternatives.map((alternative, index) => (
        |                                                           ^^^^^^^^^^^^
    382 |                                             <div key={index} className="text-sm text-purple-700 p-2 bg-white rounded">
    383 |                                                 {alternative}
    384 |                                             </div>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:381:77
TS7006: Parameter 'alternative' implicitly has an 'any' type.
    379 |                                     <h3 className="font-medium text-purple-800 mb-2">대안 메시지</h3>
    380 |                                     <div className="space-y-2">
  > 381 |                                         {generatedMessage.alternatives.map((alternative, index) => (
        |                                                                             ^^^^^^^^^^^
    382 |                                             <div key={index} className="text-sm text-purple-700 p-2 bg-white rounded">
    383 |                                                 {alternative}
    384 |                                             </div>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:381:90
TS7006: Parameter 'index' implicitly has an 'any' type.
    379 |                                     <h3 className="font-medium text-purple-800 mb-2">대안 메시지</h3>
    380 |                                     <div className="space-y-2">
  > 381 |                                         {generatedMessage.alternatives.map((alternative, index) => (
        |                                                                                          ^^^^^
    382 |                                             <div key={index} className="text-sm text-purple-700 p-2 bg-white rounded">
    383 |                                                 {alternative}
    384 |                                             </div>
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:429:100
TS2339: Property 'average_feedback' does not exist on type 'PerformanceAnalysis'.
    427 |                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    428 |                         <div className="bg-blue-50 p-4 rounded-lg text-center">
  > 429 |                             <div className="text-2xl font-bold text-blue-600">{performanceAnalysis.average_feedback.toFixed(1)}</div>
        |                                                                                                    ^^^^^^^^^^^^^^^^
    430 |                             <div className="text-sm text-blue-700">평균 피드백</div>
    431 |                         </div>
    432 |                         <div className="bg-green-50 p-4 rounded-lg text-center">
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:433:101
TS2339: Property 'total_messages' does not exist on type 'PerformanceAnalysis'.
    431 |                         </div>
    432 |                         <div className="bg-green-50 p-4 rounded-lg text-center">
  > 433 |                             <div className="text-2xl font-bold text-green-600">{performanceAnalysis.total_messages}</div>
        |                                                                                                     ^^^^^^^^^^^^^^
    434 |                             <div className="text-sm text-green-700">총 메시지 수</div>
    435 |                         </div>
    436 |                         <div className="bg-yellow-50 p-4 rounded-lg text-center">
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:437:103
TS2339: Property 'success_rate' does not exist on type 'PerformanceAnalysis'.
    435 |                         </div>
    436 |                         <div className="bg-yellow-50 p-4 rounded-lg text-center">
  > 437 |                             <div className="text-2xl font-bold text-yellow-600">{(performanceAnalysis.success_rate * 100).toFixed(1)}%</div>
        |                                                                                                       ^^^^^^^^^^^^
    438 |                             <div className="text-sm text-yellow-700">성공률</div>
    439 |                         </div>
    440 |                         <div className="bg-red-50 p-4 rounded-lg text-center">
ERROR in src/components/AdvancedMessageGenerationSystem.tsx:442:54
TS2339: Property 'improvement_needed' does not exist on type 'PerformanceAnalysis'.
    440 |                         <div className="bg-red-50 p-4 rounded-lg text-center">
    441 |                             <div className="text-2xl font-bold text-red-600">
  > 442 |                                 {performanceAnalysis.improvement_needed ? '필요' : '불필요'}
        |                                                      ^^^^^^^^^^^^^^^^^^
    443 |                             </div>
    444 |                             <div className="text-sm text-red-700">개선 필요</div>
    445 |                         </div>
ERROR in src/components/AdvancedMLDashboard.tsx:82:60
TS2339: Property 'profile' does not exist on type 'APIResponse<any>'.
    80 |             // 사용자 프로필 로드
    81 |             const profileResponse = await advancedMessageAPI.getUserMLProfile(userId);
  > 82 |             if (profileResponse.success && profileResponse.profile) {
       |                                                            ^^^^^^^
    83 |                 setUserProfile(profileResponse.profile);
    84 |             }
    85 |
ERROR in src/components/AdvancedMLDashboard.tsx:83:48
TS2339: Property 'profile' does not exist on type 'APIResponse<any>'.
    81 |             const profileResponse = await advancedMessageAPI.getUserMLProfile(userId);
    82 |             if (profileResponse.success && profileResponse.profile) {
  > 83 |                 setUserProfile(profileResponse.profile);
       |                                                ^^^^^^^
    84 |             }
    85 |
    86 |             // 모든 사용자 프로필 로드
ERROR in src/components/AdvancedMLDashboard.tsx:88:68
TS2339: Property 'profiles' does not exist on type 'APIResponse<any>'.
    86 |             // 모든 사용자 프로필 로드
    87 |             const allProfilesResponse = await advancedMessageAPI.getAllUserMLProfiles();
  > 88 |             if (allProfilesResponse.success && allProfilesResponse.profiles) {
       |                                                                    ^^^^^^^^
    89 |                 setAllProfiles(allProfilesResponse.profiles);
    90 |             }
    91 |
ERROR in src/components/AdvancedMLDashboard.tsx:89:52
TS2339: Property 'profiles' does not exist on type 'APIResponse<any>'.
    87 |             const allProfilesResponse = await advancedMessageAPI.getAllUserMLProfiles();
    88 |             if (allProfilesResponse.success && allProfilesResponse.profiles) {
  > 89 |                 setAllProfiles(allProfilesResponse.profiles);
       |                                                    ^^^^^^^^
    90 |             }
    91 |
    92 |             // 시스템 통계 로드
ERROR in src/components/AdvancedMLDashboard.tsx:94:56
TS2339: Property 'stats' does not exist on type 'APIResponse<any>'.
    92 |             // 시스템 통계 로드
    93 |             const statsResponse = await advancedMessageAPI.getMLSystemStats();
  > 94 |             if (statsResponse.success && statsResponse.stats) {
       |                                                        ^^^^^
    95 |                 setSystemStats(statsResponse.stats);
    96 |             }
    97 |
ERROR in src/components/AdvancedMLDashboard.tsx:95:46
TS2339: Property 'stats' does not exist on type 'APIResponse<any>'.
    93 |             const statsResponse = await advancedMessageAPI.getMLSystemStats();
    94 |             if (statsResponse.success && statsResponse.stats) {
  > 95 |                 setSystemStats(statsResponse.stats);
       |                                              ^^^^^
    96 |             }
    97 |
    98 |         } catch (err) {
ERROR in src/components/AdvancedMLDashboard.tsx:114:66
TS2339: Property 'prediction' does not exist on type 'APIResponse<any>'.
    112 |             // 참여도 예측
    113 |             const engagementResponse = await advancedMessageAPI.predictUserEngagement(testMessage, context);
  > 114 |             if (engagementResponse.success && engagementResponse.prediction) {
        |                                                                  ^^^^^^^^^^
    115 |                 setEngagementPrediction(engagementResponse.prediction);
    116 |             }
    117 |
ERROR in src/components/AdvancedMLDashboard.tsx:115:60
TS2339: Property 'prediction' does not exist on type 'APIResponse<any>'.
    113 |             const engagementResponse = await advancedMessageAPI.predictUserEngagement(testMessage, context);
    114 |             if (engagementResponse.success && engagementResponse.prediction) {
  > 115 |                 setEngagementPrediction(engagementResponse.prediction);
        |                                                            ^^^^^^^^^^
    116 |             }
    117 |
    118 |             // 응답 시간 예측
ERROR in src/components/AdvancedMLDashboard.tsx:120:70
TS2339: Property 'prediction' does not exist on type 'APIResponse<any>'.
    118 |             // 응답 시간 예측
    119 |             const responseTimeResponse = await advancedMessageAPI.predictResponseTime(testMessage, context);
  > 120 |             if (responseTimeResponse.success && responseTimeResponse.prediction) {
        |                                                                      ^^^^^^^^^^
    121 |                 setResponseTimePrediction(responseTimeResponse.prediction);
    122 |             }
    123 |
ERROR in src/components/AdvancedMLDashboard.tsx:121:64
TS2339: Property 'prediction' does not exist on type 'APIResponse<any>'.
    119 |             const responseTimeResponse = await advancedMessageAPI.predictResponseTime(testMessage, context);
    120 |             if (responseTimeResponse.success && responseTimeResponse.prediction) {
  > 121 |                 setResponseTimePrediction(responseTimeResponse.prediction);
        |                                                                ^^^^^^^^^^
    122 |             }
    123 |
    124 |             // 개인화된 응답 스타일
ERROR in src/components/AdvancedMLDashboard.tsx:126:56
TS2339: Property 'personalized_style' does not exist on type 'APIResponse<any>'.
    124 |             // 개인화된 응답 스타일
    125 |             const styleResponse = await advancedMessageAPI.getPersonalizedResponse(testMessage, context);
  > 126 |             if (styleResponse.success && styleResponse.personalized_style) {
        |                                                        ^^^^^^^^^^^^^^^^^^
    127 |                 setPersonalizedStyle(styleResponse.personalized_style);
    128 |             }
    129 |
ERROR in src/components/AdvancedMLDashboard.tsx:127:52
TS2339: Property 'personalized_style' does not exist on type 'APIResponse<any>'.
    125 |             const styleResponse = await advancedMessageAPI.getPersonalizedResponse(testMessage, context);
    126 |             if (styleResponse.success && styleResponse.personalized_style) {
  > 127 |                 setPersonalizedStyle(styleResponse.personalized_style);
        |                                                    ^^^^^^^^^^^^^^^^^^
    128 |             }
    129 |
    130 |         } catch (err) {
ERROR in src/components/ChatGPTUnifiedSystem.tsx:1192:16
TS2304: Cannot find name 'ArrowRight'.
    1190 |             
    1191 |             <div className="flow-arrow">
  > 1192 |               <ArrowRight size={24} />
         |                ^^^^^^^^^^
    1193 |             </div>
    1194 |             
    1195 |             <div className="flow-step">
ERROR in src/components/ChatGPTUnifiedSystem.tsx:1206:16
TS2304: Cannot find name 'ArrowRight'.
    1204 |             
    1205 |             <div className="flow-arrow">
  > 1206 |               <ArrowRight size={24} />
         |                ^^^^^^^^^^
    1207 |             </div>
    1208 |             
    1209 |             <div className="flow-step">
ERROR in src/components/ChatGPTUnifiedSystem.tsx:1220:16
TS2304: Cannot find name 'ArrowRight'.
    1218 |             
    1219 |             <div className="flow-arrow">
  > 1220 |               <ArrowRight size={24} />
         |                ^^^^^^^^^^
    1221 |             </div>
    1222 |             
    1223 |             <div className="flow-step">
ERROR in src/components/ChatInterface.tsx:158:13
TS2554: Expected 1 arguments, but got 0.
    156 |             setConversationHistory([]);
    157 |             setAiResponse('');
  > 158 |             clearProgress();
        |             ^^^^^^^^^^^^^^^
    159 |         } catch (error) {
    160 |             console.error('대화 초기화 오류:', error);
    161 |         }
ERROR in src/components/ConversationAnalysis.tsx:67:58
TS2339: Property 'analysis' does not exist on type 'APIResponse<any>'.
    65 |       if (conversationId) {
    66 |         const analysisResponse = await advancedMessageAPI.getConversationAnalysis(conversationId);
  > 67 |         if (analysisResponse.success && analysisResponse.analysis) {
       |                                                          ^^^^^^^^
    68 |           setAnalysisData(analysisResponse.analysis);
    69 |         }
    70 |       }
ERROR in src/components/ConversationAnalysis.tsx:68:44
TS2339: Property 'analysis' does not exist on type 'APIResponse<any>'.
    66 |         const analysisResponse = await advancedMessageAPI.getConversationAnalysis(conversationId);
    67 |         if (analysisResponse.success && analysisResponse.analysis) {
  > 68 |           setAnalysisData(analysisResponse.analysis);
       |                                            ^^^^^^^^
    69 |         }
    70 |       }
    71 |
ERROR in src/components/ConversationAnalysis.tsx:74:54
TS2339: Property 'user_profile' does not exist on type 'APIResponse<any>'.
    72 |       // 사용자 프로필 로드
    73 |       const profileResponse = await advancedMessageAPI.getUserConversationProfile(userId);
  > 74 |       if (profileResponse.success && profileResponse.user_profile) {
       |                                                      ^^^^^^^^^^^^
    75 |         setUserProfile(profileResponse.user_profile);
    76 |       }
    77 |
ERROR in src/components/ConversationAnalysis.tsx:75:40
TS2339: Property 'user_profile' does not exist on type 'APIResponse<any>'.
    73 |       const profileResponse = await advancedMessageAPI.getUserConversationProfile(userId);
    74 |       if (profileResponse.success && profileResponse.user_profile) {
  > 75 |         setUserProfile(profileResponse.user_profile);
       |                                        ^^^^^^^^^^^^
    76 |       }
    77 |
    78 |     } catch (err) {
ERROR in src/components/ConversationAnalysis.tsx:237:76
TS18048: 'analysisData.emotion_analysis' is possibly 'undefined'.
    235 |                             className="bar"
    236 |                             style={{
  > 237 |                               width: `${(count / Math.max(...Object.values(analysisData.emotion_analysis.emotion_distribution))) * 100}%`,
        |                                                                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    238 |                               backgroundColor: getEmotionColor(emotion)
    239 |                             }}
    240 |                           ></div>
ERROR in src/components/ConversationAnalyticsDashboard.tsx:17:10
TS2724: '"../services/advancedMessageAPI"' has no exported member named 'AdvancedMessageAPI'. Did you mean 'advancedMessageAPI'?
    15 |     XMarkIcon
    16 | } from '@heroicons/react/24/outline';
  > 17 | import { AdvancedMessageAPI } from '../services/advancedMessageAPI';
       |          ^^^^^^^^^^^^^^^^^^
    18 |
    19 | interface AnalyticsData {
    20 |     total_messages: number;
ERROR in src/components/NotificationSystem.tsx:43:26
TS2339: Property 'lastMessage' does not exist on type '{ isConnected: boolean; isConnecting: boolean; error: string | null; reconnect: () => void; }'.
    41 |     const [unreadCount, setUnreadCount] = useState(0);
    42 |
  > 43 |     const { isConnected, lastMessage, subscribeToRoom, connectionStatus } = useWebSocket({
       |                          ^^^^^^^^^^^
    44 |         clientId,
    45 |         autoReconnect: true
    46 |     });
ERROR in src/components/NotificationSystem.tsx:43:39
TS2339: Property 'subscribeToRoom' does not exist on type '{ isConnected: boolean; isConnecting: boolean; error: string | null; reconnect: () => void; }'.
    41 |     const [unreadCount, setUnreadCount] = useState(0);
    42 |
  > 43 |     const { isConnected, lastMessage, subscribeToRoom, connectionStatus } = useWebSocket({
       |                                       ^^^^^^^^^^^^^^^
    44 |         clientId,
    45 |         autoReconnect: true
    46 |     });
ERROR in src/components/NotificationSystem.tsx:43:56
TS2339: Property 'connectionStatus' does not exist on type '{ isConnected: boolean; isConnecting: boolean; error: string | null; reconnect: () => void; }'.
    41 |     const [unreadCount, setUnreadCount] = useState(0);
    42 |
  > 43 |     const { isConnected, lastMessage, subscribeToRoom, connectionStatus } = useWebSocket({
       |                                                        ^^^^^^^^^^^^^^^^
    44 |         clientId,
    45 |         autoReconnect: true
    46 |     });
ERROR in src/components/NotificationSystem.tsx:43:90
TS2554: Expected 0 arguments, but got 1.
    41 |     const [unreadCount, setUnreadCount] = useState(0);
    42 |
  > 43 |     const { isConnected, lastMessage, subscribeToRoom, connectionStatus } = useWebSocket({
       |                                                                                          ^
  > 44 |         clientId,
       | ^^^^^^^^^^^^^^^^^
  > 45 |         autoReconnect: true
       | ^^^^^^^^^^^^^^^^^
  > 46 |     });
       | ^^^^^^
    47 |
    48 |     // 현재 대화방 구독
    49 |     useEffect(() => {
ERROR in src/components/RealTimeDashboard.tsx:30:13
TS2339: Property 'messages' does not exist on type '{ isConnected: boolean; isConnecting: boolean; error: string | null; reconnect: () => void; }'.
    28 |     const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    29 |
  > 30 |     const { messages: wsMessages, isConnected: wsConnected } = useWebSocket({
       |             ^^^^^^^^
    31 |         url: 'ws://localhost:8000',
    32 |         clientId: 'dashboard',
    33 |         autoReconnect: true
ERROR in src/components/RealTimeDashboard.tsx:30:77
TS2554: Expected 0 arguments, but got 1.
    28 |     const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    29 |
  > 30 |     const { messages: wsMessages, isConnected: wsConnected } = useWebSocket({
       |                                                                             ^
  > 31 |         url: 'ws://localhost:8000',
       | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 32 |         clientId: 'dashboard',
       | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 33 |         autoReconnect: true
       | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 34 |     });
       | ^^^^^^
    35 |
    36 |     useEffect(() => {
    37 |         setIsConnected(wsConnected);
ERROR in src/components/RealtimeMonitoringDashboard.tsx:90:58
TS2339: Property 'status' does not exist on type 'APIResponse<any>'.
    88 |             // 모니터링 상태 조회
    89 |             const statusResponse = await advancedMessageAPI.getConversationMonitoringStatus(conversationId);
  > 90 |             if (statusResponse.success && statusResponse.status) {
       |                                                          ^^^^^^
    91 |                 setMonitoringStatus(statusResponse.status);
    92 |             }
    93 |
ERROR in src/components/RealtimeMonitoringDashboard.tsx:91:52
TS2339: Property 'status' does not exist on type 'APIResponse<any>'.
    89 |             const statusResponse = await advancedMessageAPI.getConversationMonitoringStatus(conversationId);
    90 |             if (statusResponse.success && statusResponse.status) {
  > 91 |                 setMonitoringStatus(statusResponse.status);
       |                                                    ^^^^^^
    92 |             }
    93 |
    94 |             // 이벤트 조회
ERROR in src/components/RealtimeMonitoringDashboard.tsx:96:58
TS2339: Property 'events' does not exist on type 'APIResponse<any>'.
    94 |             // 이벤트 조회
    95 |             const eventsResponse = await advancedMessageAPI.getConversationEvents(conversationId, 20);
  > 96 |             if (eventsResponse.success && eventsResponse.events) {
       |                                                          ^^^^^^
    97 |                 setEvents(eventsResponse.events);
    98 |             }
    99 |
ERROR in src/components/RealtimeMonitoringDashboard.tsx:97:42
TS2339: Property 'events' does not exist on type 'APIResponse<any>'.
     95 |             const eventsResponse = await advancedMessageAPI.getConversationEvents(conversationId, 20);
     96 |             if (eventsResponse.success && eventsResponse.events) {
  >  97 |                 setEvents(eventsResponse.events);
        |                                          ^^^^^^
     98 |             }
     99 |
    100 |             // 예측 결과 조회
ERROR in src/components/RealtimeMonitoringDashboard.tsx:102:68
TS2339: Property 'predictions' does not exist on type 'APIResponse<any>'.
    100 |             // 예측 결과 조회
    101 |             const predictionsResponse = await advancedMessageAPI.getConversationPredictions(conversationId, 10);
  > 102 |             if (predictionsResponse.success && predictionsResponse.predictions) {
        |                                                                    ^^^^^^^^^^^
    103 |                 setPredictions(predictionsResponse.predictions);
    104 |             }
    105 |
ERROR in src/components/RealtimeMonitoringDashboard.tsx:103:52
TS2339: Property 'predictions' does not exist on type 'APIResponse<any>'.
    101 |             const predictionsResponse = await advancedMessageAPI.getConversationPredictions(conversationId, 10);
    102 |             if (predictionsResponse.success && predictionsResponse.predictions) {
  > 103 |                 setPredictions(predictionsResponse.predictions);
        |                                                    ^^^^^^^^^^^
    104 |             }
    105 |
    106 |         } catch (err) {
ERROR in src/components/RealtimeMonitoringDashboard.tsx:117:46
TS2339: Property 'stats' does not exist on type 'APIResponse<any>'.
    115 |         try {
    116 |             const response = await advancedMessageAPI.getMonitoringSystemStats();
  > 117 |             if (response.success && response.stats) {
        |                                              ^^^^^
    118 |                 setSystemStats(response.stats);
    119 |             }
    120 |         } catch (err) {
ERROR in src/components/RealtimeMonitoringDashboard.tsx:118:41
TS2339: Property 'stats' does not exist on type 'APIResponse<any>'.
    116 |             const response = await advancedMessageAPI.getMonitoringSystemStats();
    117 |             if (response.success && response.stats) {
  > 118 |                 setSystemStats(response.stats);
        |                                         ^^^^^
    119 |             }
    120 |         } catch (err) {
    121 |             console.error('시스템 통계 로드 실패:', err);
    description: str
    project_type: str
    settings: Optional[Dict[str, Any]] = None


class ChatSessionRequest(BaseModel):
    project_id: str
    title: str
    initial_message: Optional[str] = None


class FileUploadResponse(BaseModel):
    success: bool
    file_id: str
    file_name: str
    file_size: int
    file_type: str
    upload_timestamp: datetime
    processing_status: str


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 모든 시스템 초기화"""
    global message_db, media_processor, ai_system, chat_parser
    
    logger.info("🚀 종합 카카오톡 메시지 관리 API v8.1 시작...")
    
    try:
        # 시스템들 초기화
        message_db = AdvancedMessageDatabase()
        media_processor = EnhancedMediaProcessor()
        ai_system = IntegratedAISystem()
        chat_parser = KakaoChatParser()
        
        logger.info("✅ 모든 시스템 초기화 완료")
        
        # 업로드 디렉토리 생성
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # 프로젝트 디렉토리 생성
        project_dir = Path("project_data/projects")
        project_dir.mkdir(parents=True, exist_ok=True)
        
    except Exception as e:
        logger.error(f"❌ 시스템 초기화 실패: {e}")
        raise


@app.get("/", response_model=Dict[str, Any])
async def root():
    """루트 엔드포인트"""
    
    return {
        "service": "종합 카카오톡 메시지 관리 API",
        "version": "8.1.0",
        "description": "복합 미디어 메시지 분석 및 AI 메시지 생성 통합 시스템",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "key_features": [
            "복합 미디어 메시지 파싱 및 저장",
            "이미지/문서/음성/비디오 콘텐츠 추출",
            "메시지 구성 요소별 검색",
            "미디어 기반 AI 메시지 생성",
            "실시간 파일 처리",
            "개인별 학습 데이터 통합",
            "실시간 WebSocket 통신",
            "프로젝트 기반 대화 세션 관리"
        ],
        "api_endpoints": {
            "upload_chat": "/api/v8/upload-chat",
            "upload_media": "/api/v8/upload-media",
            "search_messages": "/api/v8/search",
            "message_analysis": "/api/v8/messages/{message_id}/analysis",
            "media_processing": "/api/v8/media/process",
            "ai_message_generation": "/api/v8/ai-message",
            "database_stats": "/api/v8/database/statistics",
            "websocket": "/ws",
            "projects": "/api/v8/projects",
            "chat_sessions": "/api/v8/chat-sessions"
        }
    }


# WebSocket 엔드포인트
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 메시지 타입에 따른 처리
            if message.get("type") == "chat_message":
                # 대화 메시지 처리
                response = await process_chat_message(message)
                await manager.send_personal_message(json.dumps(response), websocket)
            
            elif message.get("type") == "file_upload_progress":
                # 파일 업로드 진행상황 브로드캐스트
                await manager.broadcast(json.dumps(message))
            
            elif message.get("type") == "ai_analysis_request":
                # AI 분석 요청 처리
                response = await process_ai_analysis_request(message)
                await manager.send_personal_message(json.dumps(response), websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def process_chat_message(message: Dict[str, Any]) -> Dict[str, Any]:
    """대화 메시지 처리"""
    try:
        content = message.get("content", "")
        sender = message.get("sender", "user")
        project_id = message.get("project_id")
        
        # AI 응답 생성
        ai_response = await ai_system.generate_response(
            user_message=content,
            context={"project_id": project_id, "sender": sender}
        )
        
        return {
            "type": "chat_response",
            "success": True,
            "ai_response": ai_response,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"대화 메시지 처리 실패: {e}")
        return {
            "type": "chat_response",
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


async def process_ai_analysis_request(message: Dict[str, Any]) -> Dict[str, Any]:
    """AI 분석 요청 처리"""
    try:
        analysis_type = message.get("analysis_type", "general")
        content = message.get("content", "")
        
        if analysis_type == "sentiment":
            result = await ai_system.analyze_sentiment(content)
        elif analysis_type == "intent":
            result = await ai_system.analyze_intent(content)
        else:
            result = await ai_system.analyze_general(content)
        
        return {
            "type": "ai_analysis_response",
            "success": True,
            "analysis_type": analysis_type,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"AI 분석 요청 처리 실패: {e}")
        return {
            "type": "ai_analysis_response",
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


# 프로젝트 관리 API
@app.post("/api/v8/projects")
async def create_project(request: ProjectCreateRequest):
    """새 프로젝트 생성"""
    try:
        project_id = f"proj_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(request.name) % 10000:04d}"
        
        project_data = {
            "id": project_id,
            "name": request.name,
            "description": request.description,
            "project_type": request.project_type,
            "settings": request.settings or {},
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        # 프로젝트 파일 저장
        project_file = Path(f"project_data/projects/{project_id}.json")
        async with aiofiles.open(project_file, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(project_data, ensure_ascii=False, indent=2))
        
        return {
            "success": True,
            "project": project_data,
            "message": "프로젝트가 성공적으로 생성되었습니다."
        }
    
    except Exception as e:
        logger.error(f"프로젝트 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/projects")
async def get_projects():
    """모든 프로젝트 조회"""
    try:
        projects = []
        project_dir = Path("project_data/projects")
        
        if project_dir.exists():
            for project_file in project_dir.glob("*.json"):
                async with aiofiles.open(project_file, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    project_data = json.loads(content)
                    projects.append(project_data)
        
        return {
            "success": True,
            "projects": projects,
            "count": len(projects)
        }
    
    except Exception as e:
        logger.error(f"프로젝트 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/projects/{project_id}")
async def get_project(project_id: str):
    """특정 프로젝트 조회"""
    try:
        project_file = Path(f"project_data/projects/{project_id}.json")
        
        if not project_file.exists():
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
        
        async with aiofiles.open(project_file, 'r', encoding='utf-8') as f:
            content = await f.read()
            project_data = json.loads(content)
        
        return {
            "success": True,
            "project": project_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 대화 세션 관리 API
@app.post("/api/v8/chat-sessions")
async def create_chat_session(request: ChatSessionRequest):
    """새 대화 세션 생성"""
    try:
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(request.title) % 10000:04d}"
        
        session_data = {
            "id": session_id,
            "project_id": request.project_id,
            "title": request.title,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "messages": [],
            "status": "active"
        }
        
        # 초기 메시지가 있으면 추가
        if request.initial_message:
            session_data["messages"].append({
                "id": f"msg_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "role": "user",
                "content": request.initial_message,
                "timestamp": datetime.now().isoformat()
            })
        
        # 세션 파일 저장
        session_file = Path(f"project_data/projects/{request.project_id}_sessions/{session_id}.json")
        session_file.parent.mkdir(parents=True, exist_ok=True)
        
        async with aiofiles.open(session_file, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(session_data, ensure_ascii=False, indent=2))
        
        return {
            "success": True,
            "session": session_data,
            "message": "대화 세션이 성공적으로 생성되었습니다."
        }
    
    except Exception as e:
        logger.error(f"대화 세션 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/chat-sessions")
async def get_chat_sessions(project_id: str = Query(...)):
    """프로젝트의 모든 대화 세션 조회"""
    try:
        sessions = []
        sessions_dir = Path(f"project_data/projects/{project_id}_sessions")
        
        if sessions_dir.exists():
            for session_file in sessions_dir.glob("*.json"):
                async with aiofiles.open(session_file, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    session_data = json.loads(content)
                    sessions.append(session_data)
        
        return {
            "success": True,
            "sessions": sessions,
            "count": len(sessions)
        }
    
    except Exception as e:
        logger.error(f"대화 세션 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v8/chat-sessions/{session_id}/messages")
async def add_message_to_session(session_id: str, message: Dict[str, Any]):
    """대화 세션에 메시지 추가"""
    try:
        session_file = Path(f"project_data/projects/sessions/{session_id}.json")
        
        if not session_file.exists():
            raise HTTPException(status_code=404, detail="대화 세션을 찾을 수 없습니다")
        
        # 세션 데이터 읽기
        async with aiofiles.open(session_file, 'r', encoding='utf-8') as f:
            content = await f.read()
            session_data = json.loads(content)
        
        # 새 메시지 추가
        new_message = {
            "id": f"msg_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "role": message.get("role", "user"),
            "content": message.get("content", ""),
            "timestamp": datetime.now().isoformat()
        }
        
        session_data["messages"].append(new_message)
        session_data["updated_at"] = datetime.now().isoformat()
        
        # 세션 데이터 저장
        async with aiofiles.open(session_file, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(session_data, ensure_ascii=False, indent=2))
        
        return {
            "success": True,
            "message": new_message,
            "session_updated": session_data["updated_at"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"메시지 추가 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v8/upload-chat")
async def upload_chat_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    chat_room_name: str = Form(...)
):
    """카카오톡 대화 파일 업로드 및 복합 분석"""
    
    try:
        if not file.filename.endswith('.txt'):
            raise HTTPException(status_code=400, detail="txt 파일만 업로드 가능합니다")
            
        # 파일 저장
        upload_path = Path("uploads") / file.filename
        with open(upload_path, "wb") as f:
            content = await file.read()
            f.write(content)
            
        # 백그라운드에서 복합 처리
        background_tasks.add_task(
            process_uploaded_chat_comprehensive,
            str(upload_path),
            chat_room_name
        )
        
        # 알림 생성
        notification_manager.notify_file_upload_complete(
            file_name=file.filename,
            file_size=file.size,
            user_id="user",
            project_id=chat_room_name
        )
        
        return {
            "success": True,
            "message": "대화 파일 업로드 완료, 백그라운드에서 분석 중",
            "file_name": file.filename,
            "chat_room": chat_room_name,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"대화 파일 업로드 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_uploaded_chat_comprehensive(file_path: str, chat_room_name: str):
    """대화 파일 종합 처리"""
    
    try:
        logger.info(f"대화 파일 종합 분석 시작: {file_path}")
        
        # 1. 대화 파싱
        kakao_room = chat_parser.parse_chat_file(file_path)
        chat_room_id = f"room_{hash(chat_room_name) % 10000:04d}"
        
        # 2. 각 메시지를 복합 메시지로 변환 및 저장
        for kakao_msg in kakao_room.messages:
            if kakao_msg.message_type == "text" and not kakao_msg.is_deleted:
                # 복합 메시지 파싱
                complex_msg = message_db.parse_complex_message(
                    raw_message=kakao_msg.content,
                    sender=kakao_msg.sender,
                    timestamp=kakao_msg.timestamp,
                    chat_room_id=chat_room_id
                )
                
                # 메시지 저장
                message_db.save_complex_message(complex_msg)
        
        logger.info(f"대화 파일 처리 완료: {len(kakao_room.messages)}개 메시지 처리됨")
        
        # WebSocket으로 진행상황 브로드캐스트
        await manager.broadcast(json.dumps({
            "type": "chat_processing_complete",
            "chat_room": chat_room_name,
            "message_count": len(kakao_room.messages),
            "timestamp": datetime.now().isoformat()
        }))
        
    except Exception as e:
        logger.error(f"대화 파일 처리 실패: {e}")
        await manager.broadcast(json.dumps({
            "type": "chat_processing_error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }))


@app.post("/api/v8/upload-media")
async def upload_media_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    chat_room_id: str = Form(...),
    sender_id: str = Form(...),
    process_immediately: bool = Form(True)
):
    """미디어 파일 업로드 및 처리"""
    
    try:
        uploaded_files = []
        
        for file in files:
            # 파일 저장
            file_id = f"media_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(file.filename) % 10000:04d}"
            file_extension = Path(file.filename).suffix
            upload_path = Path("uploads") / f"{file_id}{file_extension}"
            
            with open(upload_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            uploaded_files.append({
                "file_id": file_id,
                "original_name": file.filename,
                "file_path": str(upload_path),
                "file_size": len(content),
                "file_type": file.content_type
            })
            
            # 즉시 처리 옵션이 활성화된 경우 백그라운드에서 처리
            if process_immediately:
                background_tasks.add_task(
                    process_uploaded_media,
                    str(upload_path),
                    chat_room_id,
                    sender_id,
                    file.filename
                )
        
        return {
            "success": True,
            "message": f"{len(uploaded_files)}개 파일 업로드 완료",
            "files": uploaded_files,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"미디어 파일 업로드 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_uploaded_media(file_path: str, chat_room_id: str, sender_id: str, original_name: str):
    """업로드된 미디어 파일 처리"""
    
    try:
        logger.info(f"미디어 파일 처리 시작: {file_path}")
        
        # 미디어 처리
        processed_media = media_processor.process_media_file(file_path)
        
        # 처리된 미디어 정보를 메시지 데이터베이스에 저장
        media_message = message_db.create_media_message(
            file_path=file_path,
            chat_room_id=chat_room_id,
            sender_id=sender_id,
            original_name=original_name,
            processed_data=processed_media
        )
        
        message_db.save_complex_message(media_message)
        
        logger.info(f"미디어 파일 처리 완료: {file_path}")
        
        # WebSocket으로 진행상황 브로드캐스트
        await manager.broadcast(json.dumps({
            "type": "media_processing_complete",
            "file_name": original_name,
            "file_id": media_message.message_id,
            "timestamp": datetime.now().isoformat()
        }))
        
    except Exception as e:
        logger.error(f"미디어 파일 처리 실패: {e}")
        await manager.broadcast(json.dumps({
            "type": "media_processing_error",
            "file_name": original_name,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }))


@app.post("/api/v8/search")
async def search_messages(request: MessageSearchRequest):
    """메시지 검색"""
    
    try:
        if not message_db:
            raise HTTPException(status_code=500, detail="메시지 데이터베이스가 초기화되지 않았습니다")
        
        # 검색 조건 구성
        search_criteria = {}
        if request.chat_room_id:
            search_criteria["chat_room_id"] = request.chat_room_id
        if request.sender_id:
            search_criteria["sender_id"] = request.sender_id
        if request.content_type:
            search_criteria["content_type"] = request.content_type
        if request.keywords:
            search_criteria["keywords"] = request.keywords
        if request.start_date:
            search_criteria["start_date"] = request.start_date
        if request.end_date:
            search_criteria["end_date"] = request.end_date
        if request.has_media is not None:
            search_criteria["has_media"] = request.has_media
        
        # 메시지 검색
        search_results = message_db.search_messages(
            criteria=search_criteria,
            limit=request.limit
        )
        
        return {
            "success": True,
            "results": search_results,
            "count": len(search_results),
            "search_criteria": search_criteria
        }
        
    except Exception as e:
        logger.error(f"메시지 검색 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/messages/{message_id}/analysis", response_model=MessageAnalysisResponse)
async def analyze_message(message_id: str):
    """특정 메시지 분석"""
    
    try:
        if not message_db:
            raise HTTPException(status_code=500, detail="메시지 데이터베이스가 초기화되지 않았습니다")
        
        # 메시지 조회
        message = message_db.get_message(message_id)
        if not message:
            raise HTTPException(status_code=404, detail="메시지를 찾을 수 없습니다")
        
        # 메시지 분석
        analysis_results = {}
        extracted_content = []
        media_analysis = None
        
        # 텍스트 분석
        if message.text_content:
            text_analysis = await ai_system.analyze_text_content(message.text_content)
            analysis_results["text_analysis"] = text_analysis
            extracted_content.append({
                "type": "text",
                "content": message.text_content,
                "analysis": text_analysis
            })
        
        # 미디어 분석
        if message.media_components:
            media_analysis = {}
            for media_comp in message.media_components:
                media_result = await media_processor.analyze_media_component(media_comp)
                media_analysis[media_comp.component_id] = media_result
                extracted_content.append({
                    "type": "media",
                    "component_id": media_comp.component_id,
                    "content_type": media_comp.content_type,
                    "analysis": media_result
                })
        
        # 전체 메시지 분석
        overall_analysis = await ai_system.analyze_complex_message(message)
        analysis_results["overall_analysis"] = overall_analysis
        
        return MessageAnalysisResponse(
            success=True,
            message_id=message_id,
            analysis_results=analysis_results,
            extracted_content=extracted_content,
            media_analysis=media_analysis
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"메시지 분석 실패: {e}")
        return MessageAnalysisResponse(
            success=False,
            message_id=message_id,
            analysis_results={},
            extracted_content=[],
            error=str(e)
        )


@app.post("/api/v8/media/process")
async def process_media_batch(request: MediaProcessingRequest, background_tasks: BackgroundTasks):
    """미디어 파일 일괄 처리"""
    
    try:
        if not media_processor:
            raise HTTPException(status_code=500, detail="미디어 프로세서가 초기화되지 않았습니다")
        
        # 백그라운드에서 일괄 처리
        background_tasks.add_task(
            batch_process_media_files,
            request.file_ids,
            request.processing_options or {}
        )
        
        return {
            "success": True,
            "message": f"{len(request.file_ids)}개 파일 일괄 처리 시작",
            "file_count": len(request.file_ids),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"미디어 일괄 처리 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def batch_process_media_files(file_ids: List[str], processing_options: Dict[str, Any]):
    """미디어 파일 일괄 처리 백그라운드 작업"""
    
    try:
        logger.info(f"미디어 파일 일괄 처리 시작: {len(file_ids)}개 파일")
        
        for file_id in file_ids:
            try:
                # 파일 경로 찾기
                file_path = message_db.get_media_file_path(file_id)
                if file_path and Path(file_path).exists():
                    # 개별 파일 처리
                    await process_uploaded_media(file_path, "", "", file_id)
                else:
                    logger.warning(f"파일을 찾을 수 없음: {file_id}")
            
            except Exception as e:
                logger.error(f"파일 처리 실패 {file_id}: {e}")
        
        logger.info("미디어 파일 일괄 처리 완료")
        
    except Exception as e:
        logger.error(f"미디어 일괄 처리 실패: {e}")


@app.post("/api/v8/ai-message")
async def generate_ai_message_with_media(request: AIMessageRequest):
    """고급 AI 메시지 생성"""
    
    try:
        # 새로운 AI 메시지 생성기 사용
        user_message = request.target_topic
        context = {
            "project_type": request.person_id,
            "message_intent": request.message_intent
        }
        
        ai_response = ai_message_generator.generate_response(user_message, context)
        
        # 대화 분석 데이터 추가
        conversation_data = {
            "user_id": "default",
            "messages": [
                {
                    "content": user_message,
                    "speaker": "user",
                    "emotion": ai_message_generator.analyze_emotion(user_message),
                    "language": ai_message_generator.detect_language(user_message),
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "content": ai_response,
                    "speaker": "ai",
                    "emotion": "neutral",
                    "language": "korean",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        }
        conversation_analyzer.add_conversation(conversation_data)
        
        return {
            "success": True,
            "ai_message": ai_response,
            "timestamp": datetime.now().isoformat(),
            "model_used": "advanced_ai_message_generator",
            "context": context
        }
        
    except Exception as e:
        logger.error(f"AI 메시지 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v8/chat")
async def simple_ai_chat(request: SimpleAIMessageRequest):
    """간단한 AI 대화"""
    
    try:
        # 대화 ID 생성
        conversation_id = f"conv_{int(time.time() * 1000)}"
        user_id = request.context.get("user_id", "default") if request.context else "default"
        
        # 실시간 모니터링 시작
        realtime_monitor.start_monitoring_conversation(conversation_id, user_id)
        
        # 사용자 프로필 업데이트를 위한 대화 데이터 준비
        conversation_data = [
            {
                "content": request.message,
                "speaker": "user",
                "timestamp": datetime.now().isoformat(),
                "conversation_id": conversation_id
            }
        ]
        
        # ML 엔진으로 사용자 프로필 업데이트
        advanced_ml_engine.update_user_profile(user_id, conversation_data)
        
        # 개인화된 응답 스타일 가져오기
        personalized_style = advanced_ml_engine.get_personalized_response(
            user_id, request.message, request.context or {}
        )
        
        # 참여도 예측
        engagement_prediction = advanced_ml_engine.predict_user_engagement(
            user_id, request.message, request.context or {}
        )
        
        # 응답 시간 예측
        response_time_prediction = advanced_ml_engine.predict_response_time(
            user_id, request.message, request.context or {}
        )
        
        # AI 응답 생성 (개인화된 스타일 적용)
        ai_response = ai_message_generator.generate_response(
            request.message, 
            request.context
        )
        
        # 메시지 데이터 준비
        message_data = {
            "content": request.message,
            "speaker": "user",
            "emotion": ai_message_generator.analyze_emotion(request.message),
            "language": ai_message_generator.detect_language(request.message),
            "topic": "general",
            "engagement_prediction": engagement_prediction,
            "response_time_prediction": response_time_prediction
        }
        
        # 실시간 모니터링에 메시지 기록
        realtime_monitor.record_message(conversation_id, message_data)
        
        # AI 응답도 기록
        ai_message_data = {
            "content": ai_response,
            "speaker": "ai",
            "emotion": "neutral",
            "language": "korean",
            "topic": "response",
            "personalized_style": personalized_style
        }
        realtime_monitor.record_message(conversation_id, ai_message_data)
        
        return {
            "success": True,
            "response": ai_response,
            "timestamp": datetime.now().isoformat(),
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        logger.error(f"AI 대화 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/chat/summary")
async def get_chat_summary():
    """대화 요약 조회"""
    
    try:
        summary = ai_message_generator.get_conversation_summary()
        
        return {
            "success": True,
            "summary": summary
        }
        
    except Exception as e:
        logger.error(f"대화 요약 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v8/chat/history")
async def clear_chat_history():
    """대화 히스토리 초기화"""
    
    try:
        ai_message_generator.clear_history()
        
        return {
            "success": True,
            "message": "대화 히스토리가 초기화되었습니다."
        }
        
    except Exception as e:
        logger.error(f"대화 히스토리 초기화 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 알림 관련 엔드포인트들
@app.get("/api/v8/notifications")
async def get_notifications(
    user_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    unread_only: bool = Query(False),
    limit: int = Query(50)
):
    """알림 목록 조회"""
    
    try:
        notifications = notification_manager.get_notifications(
            user_id=user_id,
            project_id=project_id,
            unread_only=unread_only,
            limit=limit
        )
        
        return {
            "success": True,
            "notifications": [notification.to_dict() for notification in notifications],
            "count": len(notifications)
        }
        
    except Exception as e:
        logger.error(f"알림 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v8/notifications")
async def create_notification(request: NotificationRequest):
    """알림 생성"""
    
    try:
        from notification_system import NotificationType, NotificationPriority
        
        notification_type = NotificationType(request.notification_type)
        priority = NotificationPriority(request.priority)
        
        notification = notification_manager.create_notification(
            notification_type=notification_type,
            title=request.title,
            message=request.message,
            priority=priority,
            data=request.data,
            user_id=request.user_id,
            project_id=request.project_id
        )
        
        return {
            "success": True,
            "notification": notification.to_dict()
        }
        
    except Exception as e:
        logger.error(f"알림 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/v8/notifications/{notification_id}/read")
async def mark_notification_as_read(notification_id: str):
    """알림을 읽음으로 표시"""
    
    try:
        success = notification_manager.mark_as_read(notification_id)
        
        if success:
            return {
                "success": True,
                "message": "알림이 읽음으로 표시되었습니다."
            }
        else:
            raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"알림 읽음 표시 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v8/notifications/{notification_id}")
async def dismiss_notification(notification_id: str):
    """알림 해제"""
    
    try:
        success = notification_manager.dismiss_notification(notification_id)
        
        if success:
            return {
                "success": True,
                "message": "알림이 해제되었습니다."
            }
        else:
            raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"알림 해제 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/notifications/unread-count")
async def get_unread_count(user_id: Optional[str] = Query(None)):
    """읽지 않은 알림 개수 조회"""
    
    try:
        count = notification_manager.get_unread_count(user_id=user_id)
        
        return {
            "success": True,
            "unread_count": count
        }
        
    except Exception as e:
        logger.error(f"읽지 않은 알림 개수 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/notifications/statistics")
async def get_notification_statistics():
    """알림 통계 조회"""
    
    try:
        stats = notification_manager.get_notification_statistics()
        
        return {
            "success": True,
            "statistics": stats
        }
        
    except Exception as e:
        logger.error(f"알림 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 대화 분석 관련 엔드포인트들
@app.get("/api/v8/conversation/analysis")
async def get_conversation_analysis(conversation_id: Optional[str] = Query(None)):
    """대화 분석 결과 조회"""
    
    try:
        analysis_result = conversation_analyzer.get_conversation_summary(conversation_id)
        
        return {
            "success": True,
            "analysis": analysis_result
        }
        
    except Exception as e:
        logger.error(f"대화 분석 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/conversation/user-profile/{user_id}")
async def get_user_conversation_profile(user_id: str):
    """사용자 대화 프로필 조회"""
    
    try:
        user_profile = conversation_analyzer.get_user_profile(user_id)
        
        return {
            "success": True,
            "user_profile": user_profile
        }
        
    except Exception as e:
        logger.error(f"사용자 프로필 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v8/conversation/clear")
async def clear_conversation_data():
    """대화 분석 데이터 초기화"""
    
    try:
        conversation_analyzer.clear_data()
        
        return {
            "success": True,
            "message": "대화 분석 데이터가 초기화되었습니다."
        }
        
    except Exception as e:
        logger.error(f"대화 분석 데이터 초기화 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 실시간 모니터링 관련 엔드포인트들
@app.get("/api/v8/monitoring/status/{conversation_id}")
async def get_conversation_monitoring_status(conversation_id: str):
    """대화 모니터링 상태 조회"""
    
    try:
        status = realtime_monitor.get_conversation_status(conversation_id)
        
        if status:
            return {
                "success": True,
                "status": status
            }
        else:
            return {
                "success": False,
                "error": "대화를 찾을 수 없습니다."
            }
        
    except Exception as e:
        logger.error(f"모니터링 상태 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/monitoring/events/{conversation_id}")
async def get_conversation_events(conversation_id: str, limit: int = Query(10)):
    """대화 이벤트 조회"""
    
    try:
        events = realtime_monitor.get_recent_events(conversation_id, limit)
        
        return {
            "success": True,
            "events": events,
            "count": len(events)
        }
        
    except Exception as e:
        logger.error(f"대화 이벤트 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/monitoring/predictions/{conversation_id}")
async def get_conversation_predictions(conversation_id: str, limit: int = Query(10)):
    """대화 예측 결과 조회"""
    
    try:
        predictions = realtime_monitor.get_recent_predictions(conversation_id, limit)
        
        return {
            "success": True,
            "predictions": predictions,
            "count": len(predictions)
        }
        
    except Exception as e:
        logger.error(f"대화 예측 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/monitoring/system-stats")
async def get_monitoring_system_stats():
    """모니터링 시스템 통계 조회"""
    
    try:
        stats = realtime_monitor.get_system_stats()
        
        return {
            "success": True,
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"시스템 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v8/monitoring/stop/{conversation_id}")
async def stop_conversation_monitoring(conversation_id: str):
    """대화 모니터링 중지"""
    
    try:
        realtime_monitor.stop_monitoring_conversation(conversation_id)
        
        return {
            "success": True,
            "message": f"대화 모니터링이 중지되었습니다: {conversation_id}"
        }
        
    except Exception as e:
        logger.error(f"모니터링 중지 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 고급 ML 엔진 관련 엔드포인트들
@app.get("/api/v8/ml/user-profile/{user_id}")
async def get_user_ml_profile(user_id: str):
    """사용자 ML 프로필 조회"""
    
    try:
        profile = advanced_ml_engine.get_user_profile(user_id)
        
        if profile:
            return {
                "success": True,
                "profile": profile
            }
        else:
            return {
                "success": False,
                "error": "사용자 프로필을 찾을 수 없습니다."
            }
        
    except Exception as e:
        logger.error(f"사용자 프로필 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/ml/user-profiles")
async def get_all_user_ml_profiles():
    """모든 사용자 ML 프로필 조회"""
    
    try:
        profiles = advanced_ml_engine.get_all_user_profiles()
        
        return {
            "success": True,
            "profiles": profiles,
            "total_users": len(profiles)
        }
        
    except Exception as e:
        logger.error(f"모든 사용자 프로필 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v8/ml/predict-engagement")
async def predict_user_engagement(request: SimpleAIMessageRequest):
    """사용자 참여도 예측"""
    
    try:
        user_id = request.context.get("user_id", "default") if request.context else "default"
        
        prediction = advanced_ml_engine.predict_user_engagement(
            user_id, request.message, request.context or {}
        )
        
        return {
            "success": True,
            "prediction": prediction
        }
        
    except Exception as e:
        logger.error(f"참여도 예측 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v8/ml/predict-response-time")
async def predict_response_time(request: SimpleAIMessageRequest):
    """응답 시간 예측"""
    
    try:
        user_id = request.context.get("user_id", "default") if request.context else "default"
        
        prediction = advanced_ml_engine.predict_response_time(
            user_id, request.message, request.context or {}
        )
        
        return {
            "success": True,
            "prediction": prediction
        }
        
    except Exception as e:
        logger.error(f"응답 시간 예측 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v8/ml/personalized-response")
async def get_personalized_response(request: SimpleAIMessageRequest):
    """개인화된 응답 스타일 조회"""
    
    try:
        user_id = request.context.get("user_id", "default") if request.context else "default"
        
        personalized_style = advanced_ml_engine.get_personalized_response(
            user_id, request.message, request.context or {}
        )
        
        return {
            "success": True,
            "personalized_style": personalized_style
        }
        
    except Exception as e:
        logger.error(f"개인화된 응답 스타일 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v8/ml/user-data/{user_id}")
async def clear_user_ml_data(user_id: str):
    """사용자 ML 데이터 삭제"""
    
    try:
        advanced_ml_engine.clear_user_data(user_id)
        
        return {
            "success": True,
            "message": f"사용자 ML 데이터가 삭제되었습니다: {user_id}"
        }
        
    except Exception as e:
        logger.error(f"사용자 ML 데이터 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/ml/system-stats")
async def get_ml_system_stats():
    """ML 시스템 통계 조회"""
    
    try:
        stats = advanced_ml_engine.get_system_stats()
        
        return {
            "success": True,
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"ML 시스템 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/database/statistics")
async def get_database_statistics():
    """데이터베이스 통계 정보"""
    
    try:
        if not message_db:
            raise HTTPException(status_code=500, detail="메시지 데이터베이스가 초기화되지 않았습니다")
        
        # 기본 통계
        total_messages = message_db.get_total_message_count()
        total_chat_rooms = message_db.get_total_chat_room_count()
        total_senders = message_db.get_total_sender_count()
        
        # 미디어 통계
        media_stats = message_db.get_media_statistics()
        
        # 시간별 통계
        time_stats = message_db.get_time_based_statistics()
        
        # 프로젝트 통계
        project_dir = Path("project_data/projects")
        project_count = len(list(project_dir.glob("*.json"))) if project_dir.exists() else 0
        
        return {
            "success": True,
            "statistics": {
                "total_messages": total_messages,
                "total_chat_rooms": total_chat_rooms,
                "total_senders": total_senders,
                "media_statistics": media_stats,
                "time_statistics": time_stats,
                "project_count": project_count,
                "generated_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"데이터베이스 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/media/{file_id}/thumbnail")
async def get_media_thumbnail(file_id: str):
    """미디어 썸네일 조회"""
    
    try:
        if not media_processor:
            raise HTTPException(status_code=500, detail="미디어 프로세서가 초기화되지 않았습니다")
        
        # 썸네일 경로 찾기
        thumbnail_path = media_processor.get_thumbnail_path(file_id)
        
        if thumbnail_path and Path(thumbnail_path).exists():
            return FileResponse(thumbnail_path)
        else:
            raise HTTPException(status_code=404, detail="썸네일을 찾을 수 없습니다")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"썸네일 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/export/messages")
async def export_messages(
    chat_room_id: Optional[str] = Query(None),
    format: str = Query("json", regex="^(json|csv|excel)$"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """메시지 내보내기"""
    
    try:
        if not message_db:
            raise HTTPException(status_code=500, detail="메시지 데이터베이스가 초기화되지 않았습니다")
        
        # 검색 조건 구성
        search_criteria = {}
        if chat_room_id:
            search_criteria["chat_room_id"] = chat_room_id
        if start_date:
            search_criteria["start_date"] = start_date
        if end_date:
            search_criteria["end_date"] = end_date
        
        # 메시지 조회
        messages = message_db.search_messages(search_criteria, limit=10000)
        
        if format == "json":
            return JSONResponse(content={
                "success": True,
                "messages": messages,
                "export_format": "json",
                "message_count": len(messages),
                "exported_at": datetime.now().isoformat()
            })
        
        elif format == "csv":
            # CSV 형식으로 변환
            csv_content = "timestamp,sender,content_type,content\n"
            for msg in messages:
                csv_content += f"{msg.get('timestamp', '')},{msg.get('sender', '')},{msg.get('content_type', '')},{msg.get('content', '').replace(',', ';')}\n"
            
            return StreamingResponse(
                iter([csv_content]),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=messages_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
            )
        
        else:  # excel
            # Excel 형식으로 변환 (간단한 구현)
            excel_content = "Timestamp\tSender\tContent Type\tContent\n"
            for msg in messages:
                excel_content += f"{msg.get('timestamp', '')}\t{msg.get('sender', '')}\t{msg.get('content_type', '')}\t{msg.get('content', '')}\n"
            
            return StreamingResponse(
                iter([excel_content]),
                media_type="application/vnd.ms-excel",
                headers={"Content-Disposition": f"attachment; filename=messages_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xls"}
            )
        
    except Exception as e:
        logger.error(f"메시지 내보내기 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    _cmp = int(
        os.environ.get("COMPREHENSIVE_MESSAGE_PORT", os.environ.get("PORT", "8001"))
    )
    uvicorn.run(app, host="0.0.0.0", port=_cmp) 