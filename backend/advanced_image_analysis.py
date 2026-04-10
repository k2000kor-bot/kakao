#!/usr/bin/env python3
"""
고급 이미지 분석 시스템 v1.0
- Base64 이미지 분석
- 이미지 객체 감지
- OCR 텍스트 추출
- 이미지 감정 분석
"""

import os
import asyncio
import json
import logging
import time
import base64
import io
import cv2
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytesseract
from PIL import Image, ImageEnhance
import requests
from io import BytesIO

from cors_config import get_cors_allow_origins

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="고급 이미지 분석 시스템", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 데이터 모델들 ====================

class ImageAnalysisRequest(BaseModel):
    """이미지 분석 요청"""
    image_data: str  # Base64 인코딩된 이미지 데이터
    analysis_type: str = "comprehensive"  # comprehensive, ocr, object, emotion
    language: str = "kor+eng"  # OCR 언어 설정
    confidence_threshold: float = 0.5

class ObjectDetectionResult(BaseModel):
    """객체 감지 결과"""
    object_name: str
    confidence: float
    bounding_box: List[int]  # [x, y, width, height]
    class_id: int

class OCRResult(BaseModel):
    """OCR 결과"""
    text: str
    confidence: float
    bounding_boxes: List[List[int]]
    language: str

class EmotionAnalysisResult(BaseModel):
    """감정 분석 결과"""
    primary_emotion: str
    emotion_confidence: float
    emotion_scores: Dict[str, float]
    face_detected: bool
    face_count: int

class ImageAnalysisResult(BaseModel):
    """이미지 분석 결과"""
    image_info: Dict[str, Any]
    object_detection: List[ObjectDetectionResult]
    ocr_results: List[OCRResult]
    emotion_analysis: EmotionAnalysisResult
    analysis_timestamp: str
    processing_time: float

# ==================== 이미지 분석 엔진 ====================

class AdvancedImageAnalyzer:
    """고급 이미지 분석 엔진"""
    
    def __init__(self):
        # OpenCV 객체 감지 모델 로드
        self.object_detector = self._load_object_detector()
        
        # 감정 분석을 위한 얼굴 감지기
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # OCR 설정
        self.ocr_config = '--oem 3 --psm 6'
        
        # 감정 카테고리
        self.emotion_categories = {
            "기쁨": ["😊", "😄", "😃", "😁", "😆"],
            "슬픔": ["😢", "😭", "😔", "😞", "😥"],
            "화남": ["😠", "😡", "😤", "😾", "😈"],
            "놀람": ["😲", "😱", "😨", "😰", "😳"],
            "중립": ["😐", "😑", "😶", "😯", "😴"]
        }
        
        logger.info("고급 이미지 분석 엔진 초기화 완료")
    
    def _load_object_detector(self):
        """객체 감지 모델 로드"""
        try:
            # YOLO 모델이 없는 경우 기본 객체 감지기 사용
            net = cv2.dnn.readNetFromDarknet(
                "yolov3.weights",
                "yolov3.cfg"
            )
            return net
        except:
            # 기본 객체 감지기 사용
            return None
    
    async def analyze_image(self, image_data: str, analysis_type: str = "comprehensive") -> ImageAnalysisResult:
        """이미지 종합 분석"""
        try:
            start_time = time.time()
            
            # Base64 디코딩 및 이미지 로드
            image = self._decode_base64_image(image_data)
            
            # 이미지 정보 추출
            image_info = self._extract_image_info(image)
            
            # 분석 타입에 따른 처리
            object_detection = []
            ocr_results = []
            emotion_analysis = None
            
            if analysis_type in ["comprehensive", "object"]:
                object_detection = await self._detect_objects(image)
            
            if analysis_type in ["comprehensive", "ocr"]:
                ocr_results = await self._extract_text(image)
            
            if analysis_type in ["comprehensive", "emotion"]:
                emotion_analysis = await self._analyze_emotion(image)
            
            processing_time = time.time() - start_time
            
            result = ImageAnalysisResult(
                image_info=image_info,
                object_detection=object_detection,
                ocr_results=ocr_results,
                emotion_analysis=emotion_analysis or self._create_default_emotion_analysis(),
                analysis_timestamp=datetime.now().isoformat(),
                processing_time=processing_time
            )
            
            logger.info(f"이미지 분석 완료: {analysis_type} (처리시간: {processing_time:.2f}초)")
            
            return result
            
        except Exception as e:
            logger.error(f"이미지 분석 중 오류: {e}")
            raise HTTPException(status_code=500, detail=f"이미지 분석 중 오류가 발생했습니다: {str(e)}")
    
    def _decode_base64_image(self, image_data: str) -> np.ndarray:
        """Base64 이미지 디코딩"""
        try:
            # Base64 디코딩
            image_bytes = base64.b64decode(image_data)
            
            # PIL Image로 변환
            pil_image = Image.open(BytesIO(image_bytes))
            
            # OpenCV 형식으로 변환
            opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            return opencv_image
            
        except Exception as e:
            logger.error(f"이미지 디코딩 오류: {e}")
            raise HTTPException(status_code=400, detail="잘못된 이미지 형식입니다.")
    
    def _extract_image_info(self, image: np.ndarray) -> Dict[str, Any]:
        """이미지 정보 추출"""
        height, width = image.shape[:2]
        
        # 이미지 통계
        mean_color = cv2.mean(image)
        std_color = np.std(image)
        
        # 이미지 품질 평가
        quality_score = self._assess_image_quality(image)
        
        return {
            "dimensions": {"width": width, "height": height},
            "channels": image.shape[2] if len(image.shape) > 2 else 1,
            "file_size_estimate": width * height * 3,  # 대략적인 파일 크기
            "mean_color": [float(c) for c in mean_color],
            "std_color": float(std_color),
            "quality_score": quality_score,
            "aspect_ratio": width / height if height > 0 else 0
        }
    
    def _assess_image_quality(self, image: np.ndarray) -> float:
        """이미지 품질 평가"""
        try:
            # 그레이스케일 변환
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Laplacian 변환으로 선명도 측정
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # 품질 점수 계산 (0-1)
            quality_score = min(laplacian_var / 1000, 1.0)
            
            return quality_score
            
        except Exception as e:
            logger.warning(f"이미지 품질 평가 실패: {e}")
            return 0.5
    
    async def _detect_objects(self, image: np.ndarray) -> List[ObjectDetectionResult]:
        """객체 감지"""
        try:
            objects = []
            
            if self.object_detector is not None:
                # YOLO 객체 감지
                objects = await self._yolo_object_detection(image)
            else:
                # 기본 객체 감지 (얼굴, 사람 등)
                objects = await self._basic_object_detection(image)
            
            return objects
            
        except Exception as e:
            logger.error(f"객체 감지 오류: {e}")
            return []
    
    async def _yolo_object_detection(self, image: np.ndarray) -> List[ObjectDetectionResult]:
        """YOLO 객체 감지"""
        try:
            height, width = image.shape[:2]
            
            # 이미지 전처리
            blob = cv2.dnn.blobFromImage(image, 1/255.0, (416, 416), swapRB=True, crop=False)
            self.object_detector.setInput(blob)
            
            # 객체 감지
            layer_names = self.object_detector.getLayerNames()
            output_layers = [layer_names[i[0] - 1] for i in self.object_detector.getUnconnectedOutLayers()]
            outputs = self.object_detector.forward(output_layers)
            
            objects = []
            
            for output in outputs:
                for detection in output:
                    scores = detection[5:]
                    class_id = np.argmax(scores)
                    confidence = scores[class_id]
                    
                    if confidence > 0.5:
                        center_x = int(detection[0] * width)
                        center_y = int(detection[1] * height)
                        w = int(detection[2] * width)
                        h = int(detection[3] * height)
                        
                        x = int(center_x - w / 2)
                        y = int(center_y - h / 2)
                        
                        # COCO 클래스 이름 (간단한 버전)
                        class_names = ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light"]
                        object_name = class_names[class_id] if class_id < len(class_names) else f"object_{class_id}"
                        
                        objects.append(ObjectDetectionResult(
                            object_name=object_name,
                            confidence=float(confidence),
                            bounding_box=[x, y, w, h],
                            class_id=int(class_id)
                        ))
            
            return objects
            
        except Exception as e:
            logger.error(f"YOLO 객체 감지 오류: {e}")
            return []
    
    async def _basic_object_detection(self, image: np.ndarray) -> List[ObjectDetectionResult]:
        """기본 객체 감지"""
        try:
            objects = []
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 얼굴 감지
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            for (x, y, w, h) in faces:
                objects.append(ObjectDetectionResult(
                    object_name="face",
                    confidence=0.8,
                    bounding_box=[int(x), int(y), int(w), int(h)],
                    class_id=0
                ))
            
            # 사람 감지 (간단한 버전)
            # 실제로는 더 정교한 사람 감지 모델을 사용해야 함
            if len(faces) > 0:
                objects.append(ObjectDetectionResult(
                    object_name="person",
                    confidence=0.7,
                    bounding_box=[0, 0, image.shape[1], image.shape[0]],
                    class_id=1
                ))
            
            return objects
            
        except Exception as e:
            logger.error(f"기본 객체 감지 오류: {e}")
            return []
    
    async def _extract_text(self, image: np.ndarray) -> List[OCRResult]:
        """OCR 텍스트 추출"""
        try:
            results = []
            
            # 이미지 전처리
            processed_image = self._preprocess_for_ocr(image)
            
            # OCR 실행
            ocr_data = pytesseract.image_to_data(processed_image, output_type=pytesseract.Output.DICT, config=self.ocr_config)
            
            # 결과 파싱
            for i in range(len(ocr_data['text'])):
                text = ocr_data['text'][i].strip()
                confidence = float(ocr_data['conf'][i]) / 100.0
                
                if text and confidence > 0.3:  # 신뢰도가 낮은 텍스트 제외
                    x = ocr_data['left'][i]
                    y = ocr_data['top'][i]
                    w = ocr_data['width'][i]
                    h = ocr_data['height'][i]
                    
                    results.append(OCRResult(
                        text=text,
                        confidence=confidence,
                        bounding_boxes=[[x, y, w, h]],
                        language="ko+en"
                    ))
            
            return results
            
        except Exception as e:
            logger.error(f"OCR 텍스트 추출 오류: {e}")
            return []
    
    def _preprocess_for_ocr(self, image: np.ndarray) -> np.ndarray:
        """OCR을 위한 이미지 전처리"""
        try:
            # 그레이스케일 변환
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 노이즈 제거
            denoised = cv2.medianBlur(gray, 3)
            
            # 이진화
            _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # 모폴로지 연산으로 텍스트 선명화
            kernel = np.ones((1, 1), np.uint8)
            processed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            
            return processed
            
        except Exception as e:
            logger.error(f"이미지 전처리 오류: {e}")
            return image
    
    async def _analyze_emotion(self, image: np.ndarray) -> EmotionAnalysisResult:
        """이미지 감정 분석"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 얼굴 감지
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) == 0:
                # 얼굴이 감지되지 않은 경우 전체 이미지 분석
                return self._analyze_image_emotion(image)
            
            # 감지된 얼굴들의 감정 분석
            emotion_scores = {"기쁨": 0.0, "슬픔": 0.0, "화남": 0.0, "놀람": 0.0, "중립": 0.0}
            
            for (x, y, w, h) in faces:
                face_roi = gray[y:y+h, x:x+w]
                face_emotion = self._analyze_face_emotion(face_roi)
                
                # 감정 점수 누적
                for emotion, score in face_emotion.items():
                    emotion_scores[emotion] += score
            
            # 평균 계산
            face_count = len(faces)
            for emotion in emotion_scores:
                emotion_scores[emotion] /= face_count
            
            # 주요 감정 결정
            primary_emotion = max(emotion_scores, key=emotion_scores.get)
            emotion_confidence = emotion_scores[primary_emotion]
            
            return EmotionAnalysisResult(
                primary_emotion=primary_emotion,
                emotion_confidence=emotion_confidence,
                emotion_scores=emotion_scores,
                face_detected=True,
                face_count=face_count
            )
            
        except Exception as e:
            logger.error(f"감정 분석 오류: {e}")
            return self._create_default_emotion_analysis()
    
    def _analyze_face_emotion(self, face_roi: np.ndarray) -> Dict[str, float]:
        """얼굴 영역 감정 분석"""
        try:
            # 간단한 감정 분석 (실제로는 더 정교한 모델 사용)
            # 여기서는 이미지의 밝기와 대비를 기반으로 감정 추정
            
            # 이미지 통계
            mean_brightness = np.mean(face_roi)
            std_brightness = np.std(face_roi)
            
            # 감정 점수 계산
            emotions = {
                "기쁨": 0.0,
                "슬픔": 0.0,
                "화남": 0.0,
                "놀람": 0.0,
                "중립": 0.0
            }
            
            # 밝기에 따른 감정 추정
            if mean_brightness > 150:
                emotions["기쁨"] = 0.6
                emotions["중립"] = 0.4
            elif mean_brightness < 100:
                emotions["슬픔"] = 0.5
                emotions["화남"] = 0.3
                emotions["중립"] = 0.2
            else:
                emotions["중립"] = 0.7
                emotions["기쁨"] = 0.2
                emotions["슬픔"] = 0.1
            
            return emotions
            
        except Exception as e:
            logger.error(f"얼굴 감정 분석 오류: {e}")
            return {"기쁨": 0.0, "슬픔": 0.0, "화남": 0.0, "놀람": 0.0, "중립": 1.0}
    
    def _analyze_image_emotion(self, image: np.ndarray) -> EmotionAnalysisResult:
        """전체 이미지 감정 분석"""
        try:
            # 이미지의 색상과 밝기를 기반으로 감정 추정
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # 색상 분석
            hue_mean = np.mean(hsv[:, :, 0])
            saturation_mean = np.mean(hsv[:, :, 1])
            value_mean = np.mean(hsv[:, :, 2])
            
            # 감정 점수 계산
            emotions = {
                "기쁨": 0.0,
                "슬픔": 0.0,
                "화남": 0.0,
                "놀람": 0.0,
                "중립": 0.0
            }
            
            # 색상에 따른 감정 추정
            if value_mean > 150:  # 밝은 이미지
                emotions["기쁨"] = 0.5
                emotions["중립"] = 0.3
                emotions["놀람"] = 0.2
            elif value_mean < 100:  # 어두운 이미지
                emotions["슬픔"] = 0.6
                emotions["화남"] = 0.3
                emotions["중립"] = 0.1
            else:  # 중간 밝기
                emotions["중립"] = 0.8
                emotions["기쁨"] = 0.1
                emotions["슬픔"] = 0.1
            
            # 채도에 따른 조정
            if saturation_mean > 100:  # 채도가 높은 경우
                emotions["기쁨"] += 0.2
                emotions["놀람"] += 0.1
            elif saturation_mean < 50:  # 채도가 낮은 경우
                emotions["슬픔"] += 0.2
                emotions["중립"] += 0.1
            
            # 정규화
            total = sum(emotions.values())
            for emotion in emotions:
                emotions[emotion] /= total
            
            primary_emotion = max(emotions, key=emotions.get)
            emotion_confidence = emotions[primary_emotion]
            
            return EmotionAnalysisResult(
                primary_emotion=primary_emotion,
                emotion_confidence=emotion_confidence,
                emotion_scores=emotions,
                face_detected=False,
                face_count=0
            )
            
        except Exception as e:
            logger.error(f"이미지 감정 분석 오류: {e}")
            return self._create_default_emotion_analysis()
    
    def _create_default_emotion_analysis(self) -> EmotionAnalysisResult:
        """기본 감정 분석 결과"""
        return EmotionAnalysisResult(
            primary_emotion="중립",
            emotion_confidence=1.0,
            emotion_scores={"기쁨": 0.0, "슬픔": 0.0, "화남": 0.0, "놀람": 0.0, "중립": 1.0},
            face_detected=False,
            face_count=0
        )

# 이미지 분석 엔진 초기화
image_analyzer = AdvancedImageAnalyzer()

# ==================== API 엔드포인트 ====================

@app.post("/api/v7/image/analyze")
async def analyze_image(request: ImageAnalysisRequest):
    """이미지 종합 분석 API"""
    try:
        result = await image_analyzer.analyze_image(
            request.image_data,
            request.analysis_type
        )
        
        return {
            "success": True,
            "result": result.dict(),
            "message": "이미지 분석이 완료되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "이미지 분석 중 오류가 발생했습니다."
        }

@app.post("/api/v7/image/ocr")
async def extract_text_from_image(request: ImageAnalysisRequest):
    """OCR 텍스트 추출 API"""
    try:
        # Base64 디코딩 및 이미지 로드
        image = image_analyzer._decode_base64_image(request.image_data)
        
        # OCR 실행
        ocr_results = await image_analyzer._extract_text(image)
        
        return {
            "success": True,
            "ocr_results": [result.dict() for result in ocr_results],
            "total_text": " ".join([result.text for result in ocr_results]),
            "message": "OCR 텍스트 추출이 완료되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "OCR 텍스트 추출 중 오류가 발생했습니다."
        }

@app.post("/api/v7/image/objects")
async def detect_objects_in_image(request: ImageAnalysisRequest):
    """객체 감지 API"""
    try:
        # Base64 디코딩 및 이미지 로드
        image = image_analyzer._decode_base64_image(request.image_data)
        
        # 객체 감지
        objects = await image_analyzer._detect_objects(image)
        
        return {
            "success": True,
            "objects": [obj.dict() for obj in objects],
            "object_count": len(objects),
            "message": "객체 감지가 완료되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "객체 감지 중 오류가 발생했습니다."
        }

@app.post("/api/v7/image/emotion")
async def analyze_image_emotion(request: ImageAnalysisRequest):
    """이미지 감정 분석 API"""
    try:
        # Base64 디코딩 및 이미지 로드
        image = image_analyzer._decode_base64_image(request.image_data)
        
        # 감정 분석
        emotion_result = await image_analyzer._analyze_emotion(image)
        
        return {
            "success": True,
            "emotion_analysis": emotion_result.dict(),
            "message": "이미지 감정 분석이 완료되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "이미지 감정 분석 중 오류가 발생했습니다."
        }

@app.get("/api/v7/image/status")
async def get_image_analysis_status():
    """이미지 분석 시스템 상태 조회"""
    return {
        "success": True,
        "status": {
            "system": "active",
            "version": "1.0.0",
            "supported_formats": ["JPEG", "PNG", "BMP", "TIFF"],
            "max_image_size": "10MB",
            "analysis_types": ["comprehensive", "ocr", "object", "emotion"]
        }
    }

# ==================== 메인 실행 ====================

if __name__ == "__main__":
    import uvicorn
    
    try:
        _p = int(
            os.environ.get("ADVANCED_IMAGE_ANALYSIS_PORT", os.environ.get("PORT", "8002"))
        )
        print("🖼️ 고급 이미지 분석 시스템 시작 중...")
        print(f"📍 서버 주소: http://localhost:{_p}")
        print(f"📚 API 문서: http://localhost:{_p}/docs")
        print("🔍 지원 분석: OCR, 객체감지, 감정분석")

        uvicorn.run(app, host="0.0.0.0", port=_p)
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 