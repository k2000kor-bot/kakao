#!/usr/bin/env python3
"""
고급 이미지 분석 시스템
"""

import cv2
import numpy as np
from PIL import Image
import pytesseract
from typing import Dict, List, Tuple
import logging
from datetime import datetime
import base64
import io

class AdvancedImageAnalysis:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # OpenCV 설정
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
        
        # Tesseract 설정
        try:
            pytesseract.get_tesseract_version()
            self.logger.info("✅ Tesseract OCR 초기화 완료")
        except Exception as e:
            self.logger.warning(f"⚠️ Tesseract OCR 초기화 실패: {e}")
    
    def analyze_image(self, image_path: str) -> Dict:
        """이미지 종합 분석"""
        try:
            # 이미지 로드
            image = cv2.imread(image_path)
            if image is None:
                return {"error": "이미지를 로드할 수 없습니다."}
            
            analysis_result = {
                "image_info": self._get_image_info(image),
                "text_extraction": self._extract_text(image_path),
                "face_detection": self._detect_faces(image),
                "object_detection": self._detect_objects(image),
                "color_analysis": self._analyze_colors(image),
                "quality_metrics": self._calculate_quality_metrics(image),
                "timestamp": datetime.now().isoformat()
            }
            
            self.logger.info(f"이미지 분석 완료: {image_path}")
            return analysis_result
            
        except Exception as e:
            self.logger.error(f"이미지 분석 실패: {e}")
            return {"error": str(e)}
    
    def _get_image_info(self, image) -> Dict:
        """이미지 기본 정보"""
        height, width, channels = image.shape
        return {
            "width": width,
            "height": height,
            "channels": channels,
            "aspect_ratio": width / height,
            "total_pixels": width * height
        }
    
    def _extract_text(self, image_path: str) -> Dict:
        """OCR 텍스트 추출"""
        try:
            # PIL로 이미지 로드
            image = Image.open(image_path)
            
            # 다양한 언어로 텍스트 추출
            text_korean = pytesseract.image_to_string(image, lang='kor+eng')
            text_english = pytesseract.image_to_string(image, lang='eng')
            
            # 신뢰도 계산
            data = pytesseract.image_to_data(image, lang='kor+eng', output_type=pytesseract.Output.DICT)
            confidence_scores = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = np.mean(confidence_scores) if confidence_scores else 0
            
            return {
                "korean_text": text_korean.strip(),
                "english_text": text_english.strip(),
                "confidence": avg_confidence,
                "word_count": len(text_korean.split()),
                "has_text": bool(text_korean.strip())
            }
            
        except Exception as e:
            self.logger.warning(f"텍스트 추출 실패: {e}")
            return {"error": str(e)}
    
    def _detect_faces(self, image) -> Dict:
        """얼굴 검출"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
            )
            
            face_data = []
            for (x, y, w, h) in faces:
                face_roi = gray[y:y+h, x:x+w]
                eyes = self.eye_cascade.detectMultiScale(face_roi)
                
                face_data.append({
                    "position": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                    "eye_count": len(eyes),
                    "confidence": 0.8  # 기본 신뢰도
                })
            
            return {
                "face_count": len(faces),
                "faces": face_data,
                "has_faces": len(faces) > 0
            }
            
        except Exception as e:
            self.logger.warning(f"얼굴 검출 실패: {e}")
            return {"error": str(e)}
    
    def _detect_objects(self, image) -> Dict:
        """기본 객체 검출"""
        try:
            # 엣지 검출
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            # 윤곽선 검출
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # 큰 객체 필터링
            large_objects = []
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 1000:  # 최소 면적
                    x, y, w, h = cv2.boundingRect(contour)
                    large_objects.append({
                        "position": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                        "area": int(area),
                        "shape": "rectangle"  # 기본값
                    })
            
            return {
                "object_count": len(large_objects),
                "objects": large_objects,
                "edge_density": np.sum(edges > 0) / edges.size
            }
            
        except Exception as e:
            self.logger.warning(f"객체 검출 실패: {e}")
            return {"error": str(e)}
    
    def _analyze_colors(self, image) -> Dict:
        """색상 분석"""
        try:
            # BGR을 HSV로 변환
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # 주요 색상 분석
            colors = {
                "red": self._count_color_range(hsv, [(0, 50, 50), (10, 255, 255)]),
                "green": self._count_color_range(hsv, [(35, 50, 50), (85, 255, 255)]),
                "blue": self._count_color_range(hsv, [(100, 50, 50), (130, 255, 255)]),
                "yellow": self._count_color_range(hsv, [(20, 50, 50), (35, 255, 255)]),
                "purple": self._count_color_range(hsv, [(130, 50, 50), (170, 255, 255)])
            }
            
            # 평균 색상
            mean_color = np.mean(image, axis=(0, 1))
            
            return {
                "dominant_colors": colors,
                "mean_color": {
                    "b": int(mean_color[0]),
                    "g": int(mean_color[1]),
                    "r": int(mean_color[2])
                },
                "brightness": np.mean(hsv[:, :, 2]),
                "saturation": np.mean(hsv[:, :, 1])
            }
            
        except Exception as e:
            self.logger.warning(f"색상 분석 실패: {e}")
            return {"error": str(e)}
    
    def _count_color_range(self, hsv, range_tuple) -> int:
        """특정 색상 범위의 픽셀 수 계산"""
        lower, upper = range_tuple
        mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
        return np.sum(mask > 0)
    
    def _calculate_quality_metrics(self, image) -> Dict:
        """이미지 품질 지표 계산"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 선명도 (Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # 대비
            contrast = gray.std()
            
            # 밝기
            brightness = gray.mean()
            
            # 노이즈 추정
            noise = np.std(cv2.GaussianBlur(gray, (3, 3), 0) - gray)
            
            return {
                "sharpness": float(laplacian_var),
                "contrast": float(contrast),
                "brightness": float(brightness),
                "noise_level": float(noise),
                "quality_score": min(100, laplacian_var / 100 + contrast / 10)
            }
            
        except Exception as e:
            self.logger.warning(f"품질 지표 계산 실패: {e}")
            return {"error": str(e)}
    
    def process_base64_image(self, base64_string: str) -> Dict:
        """Base64 이미지 처리"""
        try:
            # Base64 디코딩
            image_data = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_data))
            
            # 임시 파일로 저장
            temp_path = f"temp_image_{datetime.now().timestamp()}.png"
            image.save(temp_path)
            
            # 분석 실행
            result = self.analyze_image(temp_path)
            
            # 임시 파일 삭제
            import os
            os.remove(temp_path)
            
            return result
            
        except Exception as e:
            self.logger.error(f"Base64 이미지 처리 실패: {e}")
            return {"error": str(e)}

# 전역 인스턴스
image_analyzer = AdvancedImageAnalysis() 