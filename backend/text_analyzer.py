#!/usr/bin/env python3
"""
텍스트 분석 모듈
"""

import re
import logging
from typing import Dict, List, Any, Optional
from collections import Counter

logger = logging.getLogger(__name__)

class TextAnalyzer:
    """텍스트 분석 클래스"""
    
    def __init__(self):
        self.logger = logger
    
    def extract_topics_from_text(self, text: str) -> List[str]:
        """텍스트에서 주제 추출"""
        try:
            # 간단한 키워드 추출 (실제로는 더 정교한 NLP 라이브러리 사용)
            words = re.findall(r'\b\w+\b', text.lower())
            
            # 불용어 제거
            stop_words = {'은', '는', '이', '가', '을', '를', '에', '의', '로', '으로', 
                        '와', '과', '도', '만', '부터', '까지', '에서', '에게', '한테',
                        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'}
            
            filtered_words = [word for word in words if word not in stop_words and len(word) > 2]
            
            # 빈도수 기반 주제 추출
            word_counts = Counter(filtered_words)
            topics = [word for word, count in word_counts.most_common(10) if count > 1]
            
            self.logger.info(f"주제 추출 완료: {len(topics)}개")
            return topics
            
        except Exception as e:
            self.logger.error(f"주제 추출 오류: {e}")
            return []
    
    def extract_entities_from_text(self, text: str) -> List[Dict[str, str]]:
        """텍스트에서 개체명 추출"""
        try:
            entities = []
            
            # 이메일 패턴
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, text)
            for email in emails:
                entities.append({"type": "email", "value": email})
            
            # 전화번호 패턴
            phone_pattern = r'\b\d{2,3}-\d{3,4}-\d{4}\b'
            phones = re.findall(phone_pattern, text)
            for phone in phones:
                entities.append({"type": "phone", "value": phone})
            
            # URL 패턴
            url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
            urls = re.findall(url_pattern, text)
            for url in urls:
                entities.append({"type": "url", "value": url})
            
            self.logger.info(f"개체명 추출 완료: {len(entities)}개")
            return entities
            
        except Exception as e:
            self.logger.error(f"개체명 추출 오류: {e}")
            return []
    
    def analyze_tone_from_text(self, text: str) -> Dict[str, Any]:
        """텍스트의 톤 분석"""
        try:
            # 간단한 감정 분석 (실제로는 더 정교한 모델 사용)
            positive_words = ['좋다', '훌륭하다', '훌륭한', '멋지다', '훌륭한', '좋은', '훌륭한', '좋은', '훌륭한', '좋은']
            negative_words = ['나쁘다', '안좋다', '싫다', '화나다', '짜증', '불만', '문제', '오류', '실패']
            
            words = re.findall(r'\b\w+\b', text.lower())
            
            positive_count = sum(1 for word in words if word in positive_words)
            negative_count = sum(1 for word in words if word in negative_words)
            
            total_words = len(words)
            if total_words == 0:
                return {"tone": "neutral", "confidence": 0.0}
            
            positive_ratio = positive_count / total_words
            negative_ratio = negative_count / total_words
            
            if positive_ratio > negative_ratio:
                tone = "positive"
                confidence = positive_ratio
            elif negative_ratio > positive_ratio:
                tone = "negative"
                confidence = negative_ratio
            else:
                tone = "neutral"
                confidence = 0.5
            
            result = {
                "tone": tone,
                "confidence": confidence,
                "positive_ratio": positive_ratio,
                "negative_ratio": negative_ratio,
                "word_count": total_words
            }
            
            self.logger.info(f"톤 분석 완료: {tone} (신뢰도: {confidence:.2f})")
            return result
            
        except Exception as e:
            self.logger.error(f"톤 분석 오류: {e}")
            return {"tone": "neutral", "confidence": 0.0}
    
    def calculate_complexity_from_text(self, text: str) -> Dict[str, Any]:
        """텍스트 복잡도 계산"""
        try:
            sentences = re.split(r'[.!?]+', text)
            words = re.findall(r'\b\w+\b', text)
            
            avg_sentence_length = len(words) / len(sentences) if sentences else 0
            avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
            
            # 복잡도 점수 계산 (0-100)
            complexity_score = min(100, (avg_sentence_length * 2) + (avg_word_length * 5))
            
            result = {
                "complexity_score": complexity_score,
                "avg_sentence_length": avg_sentence_length,
                "avg_word_length": avg_word_length,
                "sentence_count": len(sentences),
                "word_count": len(words),
                "character_count": len(text)
            }
            
            self.logger.info(f"복잡도 분석 완료: 점수 {complexity_score:.1f}")
            return result
            
        except Exception as e:
            self.logger.error(f"복잡도 분석 오류: {e}")
            return {"complexity_score": 0, "error": str(e)}
