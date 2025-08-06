#!/usr/bin/env python3
"""
시공사 성향 분석 시스템
홍보 논리, 긍정/부정 답변, 반대 의견을 전체적으로 파악
"""

import re
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from collections import defaultdict, Counter
import logging

logger = logging.getLogger(__name__)

@dataclass
class CompanyBias:
    """시공사별 편향성 분석 결과"""
    company_name: str
    positive_mentions: int
    negative_mentions: int
    neutral_mentions: int
    promotion_logic_count: int
    opposition_count: int
    bias_score: float  # -1.0 (부정적) ~ 1.0 (긍정적)
    key_promoters: List[str]  # 주요 옹호자
    key_opponents: List[str]  # 주요 반대자
    promotion_statements: List[str]  # 홍보 논리 발언
    opposition_statements: List[str]  # 반대 의견 발언
    sentiment_distribution: Dict[str, float]

@dataclass
class ParticipantBias:
    """참여자별 시공사 편향성"""
    participant_id: str
    participant_name: str
    company_bias: Dict[str, float]  # 시공사별 편향성 점수
    total_mentions: int
    promotion_count: int
    opposition_count: int
    most_biased_company: str
    bias_strength: float

class ConstructionCompanyAnalyzer:
    """시공사 성향 분석기"""
    
    def __init__(self):
        # 시공사별 키워드 정의
        self.company_keywords = {
            "삼성물산": [
                "삼성", "삼성물산", "삼성건설", "삼성 브랜드", "삼성 품질",
                "삼성 계약서", "삼성 독소조항", "삼성 논리", "삼성 대변",
                "삼성 장점", "삼성 장점도 언급", "삼성 100%", "삼성만 대변"
            ],
            "대우건설": [
                "대우", "대우건설", "대우 브랜드", "대우 품질", "대우 장점",
                "대우 계약서", "대우 논리", "대우 대변", "대우 언급"
            ],
            "현대건설": [
                "현대", "현대건설", "현대 브랜드", "현대 품질", "현대 계약서",
                "현대 논리", "현대 대변"
            ],
            "GS건설": [
                "GS", "GS건설", "GS 브랜드", "GS 품질", "GS 계약서",
                "GS 논리", "GS 대변"
            ],
            "포스코건설": [
                "포스코", "포스코건설", "포스코 브랜드", "포스코 품질",
                "포스코 계약서", "포스코 논리", "포스코 대변"
            ],
            "롯데건설": [
                "롯데", "롯데건설", "롯데 브랜드", "롯데 품질", "롯데 계약서",
                "롯데 논리", "롯데 대변"
            ]
        }
        
        # 홍보 논리 키워드
        self.promotion_keywords = [
            "장점", "우수", "최고", "최상", "브랜드", "품질", "신뢰", "안전",
            "기술력", "시공능력", "경험", "실적", "인증", "수상", "인정",
            "검증", "검토", "분석", "전문", "전문성", "전문가", "전문기관",
            "공인", "공식", "공식적", "공식화", "공식 인정", "공식 검증"
        ]
        
        # 반대 의견 키워드
        self.opposition_keywords = [
            "편파", "편향", "편향적", "편파적", "편파 발언", "편향 발언",
            "편파적이다", "편향적이다", "편파 논리", "편향 논리", "편파 대변",
            "편향 대변", "편파적 발언", "편향적 발언", "편파 논리만",
            "편향 논리만", "편파 대변만", "편향 대변만", "편파적이다",
            "편향적이다", "편파 논리만 대변", "편향 논리만 대변",
            "편파 대변만", "편향 대변만", "편파 논리만 대변한다",
            "편향 논리만 대변한다", "편파 대변만 한다", "편향 대변만 한다",
            "편파 논리만 대변한다고", "편향 논리만 대변한다고",
            "편파 대변만 한다고", "편향 대변만 한다고", "편파 논리만 대변한다고 지적",
            "편향 논리만 대변한다고 지적", "편파 대변만 한다고 지적",
            "편향 대변만 한다고 지적", "편파 논리만 대변한다고 지적하며",
            "편향 논리만 대변한다고 지적하며", "편파 대변만 한다고 지적하며",
            "편향 대변만 한다고 지적하며", "편파 논리만 대변한다고 지적하며 요구",
            "편향 논리만 대변한다고 지적하며 요구", "편파 대변만 한다고 지적하며 요구",
            "편향 대변만 한다고 지적하며 요구", "편파 논리만 대변한다고 지적하며 '대우 장점도 언급하라'고 요구",
            "편향 논리만 대변한다고 지적하며 '대우 장점도 언급하라'고 요구",
            "편파 대변만 한다고 지적하며 '대우 장점도 언급하라'고 요구",
            "편향 대변만 한다고 지적하며 '대우 장점도 언급하라'고 요구"
        ]
        
        # 긍정적 키워드
        self.positive_keywords = [
            "좋", "우수", "최고", "최상", "훌륭", "뛰어나", "탁월", "우수한",
            "최고의", "최상의", "훌륭한", "뛰어난", "탁월한", "우수하다",
            "최고다", "최상이다", "훌륭하다", "뛰어나다", "탁월하다",
            "우수함", "최고임", "최상임", "훌륭함", "뛰어남", "탁월함",
            "우수성", "최고성", "최상성", "훌륭성", "뛰어남", "탁월성",
            "우수하다고", "최고라고", "최상이라고", "훌륭하다고", "뛰어나다고",
            "탁월하다고", "우수하다고 생각", "최고라고 생각", "최상이라고 생각",
            "훌륭하다고 생각", "뛰어나다고 생각", "탁월하다고 생각"
        ]
        
        # 부정적 키워드
        self.negative_keywords = [
            "나쁘", "불량", "열등", "하위", "최악", "최하", "부족", "미흡",
            "나쁜", "불량한", "열등한", "하위의", "최악의", "최하의", "부족한",
            "미흡한", "나쁘다", "불량하다", "열등하다", "하위다", "최악이다",
            "최하이다", "부족하다", "미흡하다", "나쁨", "불량함", "열등함",
            "하위임", "최악임", "최하임", "부족함", "미흡함", "나쁘다고",
            "불량하다고", "열등하다고", "하위라고", "최악이라고", "최하라고",
            "부족하다고", "미흡하다고", "나쁘다고 생각", "불량하다고 생각",
            "열등하다고 생각", "하위라고 생각", "최악이라고 생각", "최하라고 생각",
            "부족하다고 생각", "미흡하다고 생각"
        ]

    def analyze_company_bias(self, messages: List[Dict]) -> Dict[str, CompanyBias]:
        """시공사별 편향성 분석"""
        company_analysis = {}
        
        for company_name, keywords in self.company_keywords.items():
            company_analysis[company_name] = self._analyze_single_company(
                company_name, keywords, messages
            )
        
        return company_analysis

    def _analyze_single_company(self, company_name: str, keywords: List[str], 
                               messages: List[Dict]) -> CompanyBias:
        """단일 시공사 편향성 분석"""
        positive_mentions = 0
        negative_mentions = 0
        neutral_mentions = 0
        promotion_logic_count = 0
        opposition_count = 0
        key_promoters = []
        key_opponents = []
        promotion_statements = []
        opposition_statements = []
        participant_mentions = defaultdict(int)
        
        for msg in messages:
            content = msg.get('content', '').lower()
            sender_id = msg.get('sender_id', '')
            
            # 시공사 키워드가 언급된 메시지인지 확인
            if any(keyword in content for keyword in keywords):
                participant_mentions[sender_id] += 1
                
                # 긍정/부정/중립 분류
                if any(pos_keyword in content for pos_keyword in self.positive_keywords):
                    positive_mentions += 1
                elif any(neg_keyword in content for neg_keyword in self.negative_keywords):
                    negative_mentions += 1
                else:
                    neutral_mentions += 1
                
                # 홍보 논리 확인
                if any(promo_keyword in content for promo_keyword in self.promotion_keywords):
                    promotion_logic_count += 1
                    promotion_statements.append(f"{sender_id}: {msg.get('content', '')}")
                
                # 반대 의견 확인
                if any(oppo_keyword in content for oppo_keyword in self.opposition_keywords):
                    opposition_count += 1
                    opposition_statements.append(f"{sender_id}: {msg.get('content', '')}")
        
        # 주요 옹호자/반대자 식별
        for sender_id, count in participant_mentions.items():
            if count >= 3:  # 3회 이상 언급한 참여자
                if positive_mentions > negative_mentions:
                    key_promoters.append(sender_id)
                else:
                    key_opponents.append(sender_id)
        
        # 편향성 점수 계산 (-1.0 ~ 1.0)
        total_mentions = positive_mentions + negative_mentions + neutral_mentions
        if total_mentions > 0:
            bias_score = (positive_mentions - negative_mentions) / total_mentions
        else:
            bias_score = 0.0
        
        # 감정 분포 계산
        sentiment_distribution = {}
        if total_mentions > 0:
            sentiment_distribution = {
                "긍정": positive_mentions / total_mentions,
                "부정": negative_mentions / total_mentions,
                "중립": neutral_mentions / total_mentions
            }
        
        return CompanyBias(
            company_name=company_name,
            positive_mentions=positive_mentions,
            negative_mentions=negative_mentions,
            neutral_mentions=neutral_mentions,
            promotion_logic_count=promotion_logic_count,
            opposition_count=opposition_count,
            bias_score=bias_score,
            key_promoters=key_promoters,
            key_opponents=key_opponents,
            promotion_statements=promotion_statements[:5],  # 상위 5개만
            opposition_statements=opposition_statements[:5],  # 상위 5개만
            sentiment_distribution=sentiment_distribution
        )

    def analyze_participant_bias(self, messages: List[Dict], 
                                participants: Dict[str, Any]) -> Dict[str, ParticipantBias]:
        """참여자별 시공사 편향성 분석"""
        participant_analysis = {}
        
        for participant_id, participant_data in participants.items():
            # 해당 참여자의 메시지만 필터링
            participant_messages = [
                msg for msg in messages 
                if msg.get('sender_id') == participant_id
            ]
            
            # 시공사별 편향성 분석
            company_bias = {}
            total_mentions = 0
            promotion_count = 0
            opposition_count = 0
            
            for company_name, keywords in self.company_keywords.items():
                company_score = 0.0
                company_mentions = 0
                
                for msg in participant_messages:
                    content = msg.get('content', '').lower()
                    
                    if any(keyword in content for keyword in keywords):
                        company_mentions += 1
                        total_mentions += 1
                        
                        # 긍정/부정 점수 계산
                        if any(pos_keyword in content for pos_keyword in self.positive_keywords):
                            company_score += 1
                        elif any(neg_keyword in content for neg_keyword in self.negative_keywords):
                            company_score -= 1
                        
                        # 홍보/반대 카운트
                        if any(promo_keyword in content for promo_keyword in self.promotion_keywords):
                            promotion_count += 1
                        if any(oppo_keyword in content for oppo_keyword in self.opposition_keywords):
                            opposition_count += 1
                
                if company_mentions > 0:
                    company_bias[company_name] = company_score / company_mentions
                else:
                    company_bias[company_name] = 0.0
            
            # 가장 편향된 시공사 찾기
            most_biased_company = max(company_bias.items(), key=lambda x: abs(x[1]))[0] if company_bias else ""
            bias_strength = max(abs(score) for score in company_bias.values()) if company_bias else 0.0
            
            participant_analysis[participant_id] = ParticipantBias(
                participant_id=participant_id,
                participant_name=participant_data.get('name', f'참여자{participant_id}'),
                company_bias=company_bias,
                total_mentions=total_mentions,
                promotion_count=promotion_count,
                opposition_count=opposition_count,
                most_biased_company=most_biased_company,
                bias_strength=bias_strength
            )
        
        return participant_analysis

    def generate_bias_report(self, company_analysis: Dict[str, CompanyBias],
                           participant_analysis: Dict[str, ParticipantBias]) -> Dict[str, Any]:
        """편향성 분석 리포트 생성"""
        return {
            "company_analysis": {
                company_name: {
                    "positive_mentions": analysis.positive_mentions,
                    "negative_mentions": analysis.negative_mentions,
                    "neutral_mentions": analysis.neutral_mentions,
                    "promotion_logic_count": analysis.promotion_logic_count,
                    "opposition_count": analysis.opposition_count,
                    "bias_score": analysis.bias_score,
                    "key_promoters": analysis.key_promoters,
                    "key_opponents": analysis.key_opponents,
                    "promotion_statements": analysis.promotion_statements,
                    "opposition_statements": analysis.opposition_statements,
                    "sentiment_distribution": analysis.sentiment_distribution
                }
                for company_name, analysis in company_analysis.items()
            },
            "participant_analysis": {
                participant_id: {
                    "participant_name": analysis.participant_name,
                    "company_bias": analysis.company_bias,
                    "total_mentions": analysis.total_mentions,
                    "promotion_count": analysis.promotion_count,
                    "opposition_count": analysis.opposition_count,
                    "most_biased_company": analysis.most_biased_company,
                    "bias_strength": analysis.bias_strength
                }
                for participant_id, analysis in participant_analysis.items()
            },
            "summary": {
                "total_companies_analyzed": len(company_analysis),
                "most_biased_company": self._find_most_biased_company(company_analysis),
                "most_biased_participant": self._find_most_biased_participant(participant_analysis),
                "overall_bias_trend": self._calculate_overall_bias_trend(company_analysis),
                "promotion_vs_opposition": self._calculate_promotion_vs_opposition(company_analysis)
            }
        }

    def _find_most_biased_company(self, company_analysis: Dict[str, CompanyBias]) -> str:
        """가장 편향된 시공사 찾기"""
        if not company_analysis:
            return ""
        
        return max(company_analysis.items(), 
                  key=lambda x: abs(x[1].bias_score))[0]

    def _find_most_biased_participant(self, participant_analysis: Dict[str, ParticipantBias]) -> str:
        """가장 편향된 참여자 찾기"""
        if not participant_analysis:
            return ""
        
        return max(participant_analysis.items(), 
                  key=lambda x: x[1].bias_strength)[0]

    def _calculate_overall_bias_trend(self, company_analysis: Dict[str, CompanyBias]) -> str:
        """전체 편향성 트렌드 계산"""
        positive_companies = 0
        negative_companies = 0
        
        for analysis in company_analysis.values():
            if analysis.bias_score > 0.1:
                positive_companies += 1
            elif analysis.bias_score < -0.1:
                negative_companies += 1
        
        if positive_companies > negative_companies:
            return "긍정적 편향"
        elif negative_companies > positive_companies:
            return "부정적 편향"
        else:
            return "균형적"

    def _calculate_promotion_vs_opposition(self, company_analysis: Dict[str, CompanyBias]) -> Dict[str, int]:
        """홍보 vs 반대 비율 계산"""
        total_promotion = sum(analysis.promotion_logic_count for analysis in company_analysis.values())
        total_opposition = sum(analysis.opposition_count for analysis in company_analysis.values())
        
        return {
            "total_promotion": total_promotion,
            "total_opposition": total_opposition,
            "promotion_ratio": total_promotion / (total_promotion + total_opposition) if (total_promotion + total_opposition) > 0 else 0,
            "opposition_ratio": total_opposition / (total_promotion + total_opposition) if (total_promotion + total_opposition) > 0 else 0
        }

# 사용 예시
if __name__ == "__main__":
    analyzer = ConstructionCompanyAnalyzer()
    # 실제 사용 시에는 메시지 데이터를 전달하여 분석 