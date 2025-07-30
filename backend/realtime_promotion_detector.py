#!/usr/bin/env python3
"""
실시간 홍보 논리 감지 시스템
대화 중에 올라오는 홍보 논리를 실시간으로 파악
"""

import re
import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class PromotionPattern:
    """홍보 논리 패턴"""
    pattern_type: str
    keywords: List[str]
    confidence_score: float
    description: str

@dataclass
class DetectedPromotion:
    """감지된 홍보 논리"""
    message_id: str
    sender_id: str
    timestamp: datetime
    content: str
    promotion_type: str
    company_mentioned: str
    confidence_score: float
    keywords_found: List[str]
    promotion_logic: str
    sentiment_score: float

@dataclass
class RealTimePromotionAnalysis:
    """실시간 홍보 논리 분석 결과"""
    total_promotions: int
    promotions_by_company: Dict[str, int]
    promotions_by_type: Dict[str, int]
    recent_promotions: List[DetectedPromotion]
    top_promoters: List[str]
    promotion_trend: str
    risk_level: str

class RealTimePromotionDetector:
    """실시간 홍보 논리 감지기"""
    
    def __init__(self):
        # 홍보 논리 패턴 정의
        self.promotion_patterns = {
            "브랜드 홍보": {
                "keywords": [
                    "브랜드", "명품", "최고", "최상", "우수", "훌륭", "뛰어나", "탁월",
                    "신뢰", "안전", "믿음", "보장", "확실", "검증", "인증", "수상",
                    "1등", "최고의", "최상의", "우수한", "훌륭한", "뛰어난", "탁월한"
                ],
                "confidence_score": 0.8,
                "description": "브랜드 가치와 우수성을 강조하는 홍보 논리"
            },
            "기술력 홍보": {
                "keywords": [
                    "기술력", "기술", "혁신", "첨단", "최신", "고급", "전문", "전문성",
                    "전문가", "전문기관", "기술진", "엔지니어", "기술자", "기술팀",
                    "기술 개발", "기술 혁신", "기술 우수성", "기술 경쟁력", "기술 실력"
                ],
                "confidence_score": 0.85,
                "description": "기술적 우수성과 전문성을 강조하는 홍보 논리"
            },
            "품질 홍보": {
                "keywords": [
                    "품질", "고품질", "최고 품질", "우수 품질", "품질 보장", "품질 검증",
                    "품질 인증", "품질 관리", "품질 시스템", "품질 기준", "품질 우수성",
                    "A급", "최고급", "프리미엄", "럭셔리", "고급", "상급"
                ],
                "confidence_score": 0.9,
                "description": "제품/서비스의 품질을 강조하는 홍보 논리"
            },
            "경험/실적 홍보": {
                "keywords": [
                    "경험", "실적", "성과", "업적", "수상", "인정", "공인", "공식",
                    "검증", "검토", "분석", "전문", "전문성", "전문가", "전문기관",
                    "공인 인증", "공식 검증", "공식 인정", "공식 수상", "공식 실적"
                ],
                "confidence_score": 0.75,
                "description": "과거 경험과 실적을 강조하는 홍보 논리"
            },
            "안전성 홍보": {
                "keywords": [
                    "안전", "안전성", "안전 보장", "안전 검증", "안전 인증", "안전 관리",
                    "안전 시스템", "안전 기준", "안전 우수성", "안전성 검증", "안전성 인증",
                    "보안", "보호", "보장", "확실", "믿음", "신뢰"
                ],
                "confidence_score": 0.8,
                "description": "안전성과 신뢰성을 강조하는 홍보 논리"
            },
            "가격 경쟁력 홍보": {
                "keywords": [
                    "가격", "비용", "경제", "합리", "저렴", "싸다", "경쟁력", "경쟁 가격",
                    "합리적", "경제적", "저렴한", "싼", "경쟁력 있는", "경쟁력 있는 가격",
                    "가격 경쟁력", "비용 효율성", "경제성", "합리성"
                ],
                "confidence_score": 0.7,
                "description": "가격 경쟁력을 강조하는 홍보 논리"
            },
            "서비스 홍보": {
                "keywords": [
                    "서비스", "관리", "유지보수", "AS", "고객", "고객 서비스", "고객 관리",
                    "고객 만족", "고객 지원", "고객 케어", "고객 보호", "고객 보장",
                    "서비스 품질", "서비스 우수성", "서비스 경쟁력", "서비스 실력"
                ],
                "confidence_score": 0.75,
                "description": "서비스 품질과 고객 만족을 강조하는 홍보 논리"
            },
            "계약 조건 홍보": {
                "keywords": [
                    "계약", "계약서", "조건", "약관", "규정", "정책", "제도", "시스템",
                    "혜택", "할인", "특가", "특별", "우대", "프리미엄", "럭셔리",
                    "계약 조건", "계약 혜택", "계약 우대", "계약 특별"
                ],
                "confidence_score": 0.8,
                "description": "계약 조건과 혜택을 강조하는 홍보 논리"
            }
        }
        
        # 시공사별 키워드
        self.company_keywords = {
            "삼성물산": ["삼성", "삼성물산", "삼성건설", "삼성 브랜드", "삼성 품질"],
            "대우건설": ["대우", "대우건설", "대우 브랜드", "대우 품질"],
            "현대건설": ["현대", "현대건설", "현대 브랜드", "현대 품질"],
            "GS건설": ["GS", "GS건설", "GS 브랜드", "GS 품질"],
            "포스코건설": ["포스코", "포스코건설", "포스코 브랜드", "포스코 품질"],
            "롯데건설": ["롯데", "롯데건설", "롯데 브랜드", "롯데 품질"]
        }
        
        # 부정적 키워드 (홍보 논리와 대조)
        self.negative_keywords = [
            "나쁘", "불량", "열등", "하위", "최악", "최하", "부족", "미흡",
            "문제", "결함", "오류", "실패", "실수", "잘못", "틀림", "거짓",
            "허위", "과장", "왜곡", "조작", "속임", "기만", "사기", "사칭"
        ]
        
        self.detected_promotions = []
        self.promotion_counters = {
            "total": 0,
            "by_company": {company: 0 for company in self.company_keywords.keys()},
            "by_type": {promo_type: 0 for promo_type in self.promotion_patterns.keys()}
        }

    def detect_promotion_in_message(self, message: Dict) -> Optional[DetectedPromotion]:
        """단일 메시지에서 홍보 논리 감지"""
        content = message.get('content', '').lower()
        sender_id = message.get('sender_id', '')
        message_id = message.get('id', '')
        timestamp = datetime.fromisoformat(message.get('timestamp', datetime.now().isoformat()))
        
        # 홍보 논리 패턴 검사
        detected_promotion = None
        max_confidence = 0.0
        best_promotion_type = ""
        keywords_found = []
        
        for promotion_type, pattern in self.promotion_patterns.items():
            found_keywords = []
            for keyword in pattern['keywords']:
                if keyword in content:
                    found_keywords.append(keyword)
            
            if found_keywords:
                confidence = len(found_keywords) / len(pattern['keywords']) * pattern['confidence_score']
                if confidence > max_confidence:
                    max_confidence = confidence
                    best_promotion_type = promotion_type
                    keywords_found = found_keywords
        
        # 시공사 언급 확인
        mentioned_company = self._detect_mentioned_company(content)
        
        # 부정적 키워드로 인한 신뢰도 감소
        negative_count = sum(1 for keyword in self.negative_keywords if keyword in content)
        if negative_count > 0:
            max_confidence *= 0.5  # 부정적 키워드가 있으면 신뢰도 50% 감소
        
        # 최소 신뢰도 임계값 (0.3)
        if max_confidence >= 0.3 and mentioned_company:
            sentiment_score = self._calculate_sentiment_score(content)
            
            detected_promotion = DetectedPromotion(
                message_id=message_id,
                sender_id=sender_id,
                timestamp=timestamp,
                content=message.get('content', ''),
                promotion_type=best_promotion_type,
                company_mentioned=mentioned_company,
                confidence_score=max_confidence,
                keywords_found=keywords_found,
                promotion_logic=self.promotion_patterns[best_promotion_type]['description'],
                sentiment_score=sentiment_score
            )
            
            # 카운터 업데이트
            self.promotion_counters['total'] += 1
            self.promotion_counters['by_company'][mentioned_company] += 1
            self.promotion_counters['by_type'][best_promotion_type] += 1
            
            # 감지된 홍보 논리 저장
            self.detected_promotions.append(detected_promotion)
        
        return detected_promotion

    def _detect_mentioned_company(self, content: str) -> Optional[str]:
        """언급된 시공사 감지"""
        for company, keywords in self.company_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    return company
        return None

    def _calculate_sentiment_score(self, content: str) -> float:
        """감정 점수 계산"""
        positive_count = 0
        negative_count = 0
        
        # 긍정적 키워드
        positive_keywords = [
            "좋", "우수", "최고", "최상", "훌륭", "뛰어나", "탁월", "신뢰", "안전",
            "믿음", "보장", "확실", "검증", "인증", "수상", "1등", "최고의", "최상의"
        ]
        
        # 부정적 키워드
        negative_keywords = [
            "나쁘", "불량", "열등", "하위", "최악", "최하", "부족", "미흡", "문제",
            "결함", "오류", "실패", "실수", "잘못", "틀림", "거짓", "허위", "과장"
        ]
        
        for keyword in positive_keywords:
            if keyword in content:
                positive_count += 1
        
        for keyword in negative_keywords:
            if keyword in content:
                negative_count += 1
        
        total_words = len(content.split())
        if total_words == 0:
            return 0.0
        
        return (positive_count - negative_count) / total_words

    def get_realtime_analysis(self) -> RealTimePromotionAnalysis:
        """실시간 홍보 논리 분석 결과 반환"""
        # 최근 10개 홍보 논리
        recent_promotions = sorted(
            self.detected_promotions, 
            key=lambda x: x.timestamp, 
            reverse=True
        )[:10]
        
        # 상위 홍보자
        promoter_counts = {}
        for promotion in self.detected_promotions:
            sender_id = promotion.sender_id
            promoter_counts[sender_id] = promoter_counts.get(sender_id, 0) + 1
        
        top_promoters = sorted(
            promoter_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5]
        top_promoters = [promoter[0] for promoter in top_promoters]
        
        # 홍보 트렌드 분석
        if len(self.detected_promotions) >= 2:
            recent_count = len([p for p in self.detected_promotions if 
                              (datetime.now() - p.timestamp).total_seconds() < 3600])  # 1시간 내
            if recent_count > len(self.detected_promotions) * 0.7:
                promotion_trend = "증가"
            elif recent_count < len(self.detected_promotions) * 0.3:
                promotion_trend = "감소"
            else:
                promotion_trend = "안정"
        else:
            promotion_trend = "새로운"
        
        # 위험도 분석
        total_promotions = self.promotion_counters['total']
        if total_promotions > 20:
            risk_level = "높음"
        elif total_promotions > 10:
            risk_level = "중간"
        else:
            risk_level = "낮음"
        
        return RealTimePromotionAnalysis(
            total_promotions=total_promotions,
            promotions_by_company=self.promotion_counters['by_company'],
            promotions_by_type=self.promotion_counters['by_type'],
            recent_promotions=recent_promotions,
            top_promoters=top_promoters,
            promotion_trend=promotion_trend,
            risk_level=risk_level
        )

    def reset_counters(self):
        """카운터 초기화"""
        self.promotion_counters = {
            "total": 0,
            "by_company": {company: 0 for company in self.company_keywords.keys()},
            "by_type": {promo_type: 0 for promo_type in self.promotion_patterns.keys()}
        }
        self.detected_promotions = []

# 사용 예시
if __name__ == "__main__":
    detector = RealTimePromotionDetector()
    # 실제 사용 시에는 메시지 데이터를 전달하여 실시간 감지 