#!/usr/bin/env python3
"""
아파트 커뮤니티 분석 시스템
입주민 성향, 댓글 분석, 맞춤형 대응글 생성
"""

import os
import json
import sqlite3
import logging
from typing import Dict, List, Any
from dataclasses import dataclass
from collections import Counter
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from konlpy.tag import Okt
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ResidentProfile:
    """입주민 프로필 데이터 클래스"""
    user_id: str
    age_group: str
    family_type: str
    interests: List[str]
    communication_style: str
    activity_level: str
    sentiment_tendency: str
    response_patterns: Dict[str, Any]


@dataclass
class CommunityAnalysis:
    """커뮤니티 분석 결과"""
    total_residents: int
    age_distribution: Dict[str, int]
    family_type_distribution: Dict[str, int]
    dominant_interests: List[str]
    communication_trends: Dict[str, float]
    sentiment_analysis: Dict[str, float]
    activity_hotspots: List[str]
    community_cohesion_score: float


class ApartmentCommunityAnalyzer:
    """아파트 커뮤니티 분석기"""

    def __init__(self, db_path: str = "apartment_community.db"):
        self.db_path = db_path
        self.okt = Okt()
        self.vectorizer = TfidfVectorizer(
            max_features=1000, stop_words='english'
        )
        self.init_database()

    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 입주민 프로필 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS resident_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE,
                age_group TEXT,
                family_type TEXT,
                interests TEXT,
                communication_style TEXT,
                activity_level TEXT,
                sentiment_tendency TEXT,
                response_patterns TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # 커뮤니티 댓글 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS community_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                content TEXT,
                sentiment_score REAL,
                topic_category TEXT,
                engagement_score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES resident_profiles (user_id)
            )
        ''')

        # 커뮤니티 활동 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS community_activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                activity_type TEXT,
                activity_content TEXT,
                location TEXT,
                participation_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES resident_profiles (user_id)
            )
        ''')

        conn.commit()
        conn.close()

    def analyze_resident_profile(
        self, user_id: str, comments: List[str]
    ) -> ResidentProfile:
        """입주민 프로필 분석"""
        try:
            # 나이대 추정 (댓글 내용 기반)
            age_group = self._estimate_age_group(comments)

            # 가족 유형 추정
            family_type = self._estimate_family_type(comments)

            # 관심사 추출
            interests = self._extract_interests(comments)

            # 커뮤니케이션 스타일 분석
            communication_style = self._analyze_communication_style(comments)

            # 활동 수준 분석
            activity_level = self._analyze_activity_level(comments)

            # 감정 경향 분석
            sentiment_tendency = self._analyze_sentiment_tendency(comments)

            # 응답 패턴 분석
            response_patterns = self._analyze_response_patterns(comments)

            return ResidentProfile(
                user_id=user_id,
                age_group=age_group,
                family_type=family_type,
                interests=interests,
                communication_style=communication_style,
                activity_level=activity_level,
                sentiment_tendency=sentiment_tendency,
                response_patterns=response_patterns
            )

        except Exception as e:
            logger.error(f"입주민 프로필 분석 오류: {e}")
            return self._create_default_profile(user_id)

    def _estimate_age_group(self, comments: List[str]) -> str:
        """나이대 추정"""
        age_keywords = {
            "20대": ["대학", "취업", "연애", "데이트", "친구", "술", "파티"],
            "30대": ["결혼", "육아", "아이", "직장", "승진", "부동산", "투자"],
            "40대": ["중학생", "고등학생", "교육", "학원", "입시", "자녀"],
            "50대": ["대학생", "취업준비", "자녀결혼", "건강", "여행"],
            "60대+": ["건강", "의료", "여행", "취미", "손자", "손녀"]
        }

        comment_text = " ".join(comments).lower()
        age_scores = {}

        for age_group, keywords in age_keywords.items():
            score = sum(1 for keyword in keywords if keyword in comment_text)
            age_scores[age_group] = score

        return max(age_scores, key=age_scores.get) if age_scores else "30대"

    def _estimate_family_type(self, comments: List[str]) -> str:
        """가족 유형 추정"""
        family_keywords = {
            "신혼부부": ["신혼", "신랑", "신부", "결혼식", "신혼여행"],
            "육아가족": ["아이", "육아", "유치원", "어린이집", "아기"],
            "학부모가족": ["학원", "입시", "공부", "성적", "대학"],
            "중년부부": ["건강", "여행", "취미", "자녀결혼"],
            "노년부부": ["건강", "의료", "손자", "손녀", "여행"]
        }

        comment_text = " ".join(comments).lower()
        family_scores = {}

        for family_type, keywords in family_keywords.items():
            score = sum(1 for keyword in keywords if keyword in comment_text)
            family_scores[family_type] = score

        return (
            max(family_scores, key=family_scores.get) if family_scores
            else "중년부부"
        )

    def _extract_interests(self, comments: List[str]) -> List[str]:
        """관심사 추출"""
        interest_categories = {
            "부동산": ["아파트", "매매", "전세", "임대", "투자", "시세"],
            "교육": ["학원", "교육", "입시", "공부", "성적", "대학"],
            "건강": ["건강", "운동", "병원", "의료", "약", "체력"],
            "여행": ["여행", "휴가", "관광", "해외", "국내", "여행지"],
            "취미": ["취미", "독서", "영화", "음악", "게임", "스포츠"],
            "소비": ["쇼핑", "할인", "브랜드", "구매", "리뷰", "상품"],
            "사회": ["뉴스", "정치", "사회", "이슈", "토론", "의견"]
        }

        comment_text = " ".join(comments).lower()
        interests = []

        for category, keywords in interest_categories.items():
            if any(keyword in comment_text for keyword in keywords):
                interests.append(category)

        return interests[:5]  # 상위 5개 관심사만 반환

    def _analyze_communication_style(self, comments: List[str]) -> str:
        """커뮤니케이션 스타일 분석"""
        styles = {
            "적극적": ["제안", "추천", "의견", "토론", "참여"],
            "소극적": ["동의", "좋아요", "감사", "확인", "알겠습니다"],
            "친근함": ["안녕", "고마워", "친구", "이웃", "도움"],
            "공식적": ["문의", "확인", "요청", "제안", "검토"],
            "감정적": ["기쁘", "슬프", "화나", "걱정", "불안"]
        }

        comment_text = " ".join(comments).lower()
        style_scores = {}

        for style, keywords in styles.items():
            score = sum(1 for keyword in keywords if keyword in comment_text)
            style_scores[style] = score

        return (
            max(style_scores, key=style_scores.get) if style_scores
            else "친근함"
        )

    def _analyze_activity_level(self, comments: List[str]) -> str:
        """활동 수준 분석"""
        comment_count = len(comments)
        avg_length = np.mean([len(comment) for comment in comments])

        if comment_count > 20 and avg_length > 50:
            return "매우 활발"
        elif comment_count > 10 and avg_length > 30:
            return "활발"
        elif comment_count > 5:
            return "보통"
        else:
            return "소극적"

    def _analyze_sentiment_tendency(self, comments: List[str]) -> str:
        """감정 경향 분석"""
        positive_words = ["좋", "감사", "기쁘", "만족", "행복", "좋아"]
        negative_words = ["나쁘", "화나", "슬프", "불만", "걱정", "불안"]

        comment_text = " ".join(comments).lower()
        positive_count = sum(
            1 for word in positive_words if word in comment_text
        )
        negative_count = sum(
            1 for word in negative_words if word in comment_text
        )

        if positive_count > negative_count * 1.5:
            return "긍정적"
        elif negative_count > positive_count * 1.5:
            return "부정적"
        else:
            return "중립적"

    def _analyze_response_patterns(
        self, comments: List[str]
    ) -> Dict[str, Any]:
        """응답 패턴 분석"""
        patterns = {
            "평균_응답_길이": np.mean([len(comment) for comment in comments]),
            "질문_비율": (
                len([c for c in comments if "?" in c]) / len(comments)
            ),
            "감탄사_비율": (
                len([c for c in comments if "!" in c]) / len(comments)
            ),
            "이모티콘_사용": len([
                c for c in comments if any(
                    emoji in c for emoji in ["😊", "😢", "😡", "👍", "👎"]
                )
            ]),
            "링크_공유": (
                len([c for c in comments if "http" in c]) / len(comments)
            )
        }
        return patterns

    def _create_default_profile(self, user_id: str) -> ResidentProfile:
        """기본 프로필 생성"""
        return ResidentProfile(
            user_id=user_id,
            age_group="30대",
            family_type="중년부부",
            interests=["부동산", "건강"],
            communication_style="친근함",
            activity_level="보통",
            sentiment_tendency="중립적",
            response_patterns={}
        )

    def analyze_community(self) -> CommunityAnalysis:
        """전체 커뮤니티 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 전체 입주민 수
        cursor.execute("SELECT COUNT(*) FROM resident_profiles")
        total_residents = cursor.fetchone()[0]

        # 나이대 분포
        cursor.execute(
            "SELECT age_group, COUNT(*) FROM resident_profiles "
            "GROUP BY age_group"
        )
        age_distribution = dict(cursor.fetchall())

        # 가족 유형 분포
        cursor.execute(
            "SELECT family_type, COUNT(*) FROM resident_profiles "
            "GROUP BY family_type"
        )
        family_type_distribution = dict(cursor.fetchall())

        # 주요 관심사
        cursor.execute("SELECT interests FROM resident_profiles")
        all_interests = []
        for row in cursor.fetchall():
            interests = json.loads(row[0]) if row[0] else []
            all_interests.extend(interests)

        interest_counter = Counter(all_interests)
        dominant_interests = [
            interest for interest, count in interest_counter.most_common(5)
        ]

        # 커뮤니케이션 트렌드
        cursor.execute(
            "SELECT communication_style, COUNT(*) FROM resident_profiles "
            "GROUP BY communication_style"
        )
        communication_trends = dict(cursor.fetchall())

        # 감정 분석
        cursor.execute(
            "SELECT sentiment_tendency, COUNT(*) FROM resident_profiles "
            "GROUP BY sentiment_tendency"
        )
        sentiment_analysis = dict(cursor.fetchall())

        # 활동 핫스팟
        cursor.execute(
            "SELECT location, COUNT(*) FROM community_activities "
            "GROUP BY location ORDER BY COUNT(*) DESC LIMIT 5"
        )
        activity_hotspots = [row[0] for row in cursor.fetchall()]

        # 커뮤니티 응집도 점수 계산
        cohesion_score = self._calculate_cohesion_score(
            age_distribution, family_type_distribution, sentiment_analysis
        )

        conn.close()

        return CommunityAnalysis(
            total_residents=total_residents,
            age_distribution=age_distribution,
            family_type_distribution=family_type_distribution,
            dominant_interests=dominant_interests,
            communication_trends=communication_trends,
            sentiment_analysis=sentiment_analysis,
            activity_hotspots=activity_hotspots,
            community_cohesion_score=cohesion_score
        )

    def _calculate_cohesion_score(
        self, age_dist, family_dist, sentiment_dist
    ) -> float:
        """커뮤니티 응집도 점수 계산"""
        # 다양성 지수 계산
        age_diversity = len(age_dist) / 5.0  # 최대 5개 나이대
        family_diversity = len(family_dist) / 5.0  # 최대 5개 가족 유형

        # 감정 균형 점수
        total_sentiment = sum(sentiment_dist.values())
        positive_ratio = (
            sentiment_dist.get("긍정적", 0) / total_sentiment
            if total_sentiment > 0 else 0
        )
        negative_ratio = (
            sentiment_dist.get("부정적", 0) / total_sentiment
            if total_sentiment > 0 else 0
        )
        sentiment_balance = 1 - abs(positive_ratio - negative_ratio)

        # 종합 점수 (0-100)
        cohesion_score = (
            age_diversity * 30 + family_diversity * 30 + sentiment_balance * 40
        ) * 100

        return min(cohesion_score, 100.0)

    def generate_custom_response(
        self, target_user_id: str, context: str
    ) -> str:
        """맞춤형 대응글 생성"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 대상 사용자 프로필 조회
        cursor.execute(
            "SELECT * FROM resident_profiles WHERE user_id = ?",
            (target_user_id,)
        )
        profile_data = cursor.fetchone()

        if not profile_data:
            conn.close()
            return "안녕하세요! 좋은 하루 되세요! 😊"

        # 프로필 정보 파싱
        age_group = profile_data[2]
        interests = json.loads(profile_data[4]) if profile_data[4] else []
        communication_style = profile_data[5]
        sentiment_tendency = profile_data[7]

        # 맞춤형 응답 생성
        response_templates = {
            "20대": {
                "친근함": "안녕하세요! 요즘 어떻게 지내세요? 😊",
                "공식적": "안녕하세요. 문의사항이 있으시면 언제든 말씀해 주세요.",
                "적극적": "안녕하세요! 함께 이야기 나눠요! 어떤 얘기든 좋아요!"
            },
            "30대": {
                "친근함": "안녕하세요! 가족분들 모두 건강하시죠? 😊",
                "공식적": "안녕하세요. 공동체 관련 문의사항이 있으시면 연락주세요.",
                "적극적": "안녕하세요! 좋은 정보 있으면 공유해요!"
            },
            "40대": {
                "친근함": "안녕하세요! 자녀분들 공부는 잘 되고 계시죠? 😊",
                "공식적": "안녕하세요. 교육 관련 문의사항이 있으시면 도움드리겠습니다.",
                "적극적": "안녕하세요! 교육 정보나 경험담 공유해요!"
            }
        }

        # 기본 응답 선택
        base_response = response_templates.get(age_group, {}).get(
            communication_style, "안녕하세요! 좋은 하루 되세요! 😊"
        )

        # 관심사 기반 맞춤화
        if interests:
            interest_response = f" {interests[0]} 관련해서도 언제든 이야기해요!"
            base_response += interest_response

        # 감정 경향 반영
        if sentiment_tendency == "긍정적":
            base_response += " 항상 긍정적인 마음으로 함께해요! 🌟"
        elif sentiment_tendency == "부정적":
            base_response += (
                " 걱정되는 일이 있으시면 언제든 말씀해 주세요. 함께 해결해요! 💪"
            )

        conn.close()
        return base_response

    def save_resident_profile(self, profile: ResidentProfile):
        """입주민 프로필 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO resident_profiles
            (user_id, age_group, family_type, interests, communication_style,
             activity_level, sentiment_tendency, response_patterns, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            profile.user_id,
            profile.age_group,
            profile.family_type,
            json.dumps(profile.interests),
            profile.communication_style,
            profile.activity_level,
            profile.sentiment_tendency,
            json.dumps(profile.response_patterns)
        ))

        conn.commit()
        conn.close()

    def save_community_comment(
        self, user_id: str, content: str, sentiment_score: float,
        topic_category: str
    ):
        """커뮤니티 댓글 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 참여도 점수 계산
        engagement_score = self._calculate_engagement_score(content)

        cursor.execute('''
            INSERT INTO community_comments
            (user_id, content, sentiment_score, topic_category,
             engagement_score)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_id, content, sentiment_score, topic_category, engagement_score
        ))

        conn.commit()
        conn.close()

    def _calculate_engagement_score(self, content: str) -> float:
        """참여도 점수 계산"""
        score = 0.0

        # 길이 점수
        if len(content) > 100:
            score += 20
        elif len(content) > 50:
            score += 10

        # 질문 포함
        if "?" in content:
            score += 15

        # 감탄사 포함
        if "!" in content:
            score += 10

        # 이모티콘 포함
        if any(
            emoji in content for emoji in ["😊", "😢", "😡", "👍", "👎"]
        ):
            score += 15

        # 링크 공유
        if "http" in content:
            score += 20

        return min(score, 100.0)


# API 서버 통합
app = FastAPI(title="아파트 커뮤니티 분석 API")


class CommentAnalysisRequest(BaseModel):
    user_id: str
    comments: List[str]


class CommunityAnalysisResponse(BaseModel):
    profile: Dict[str, Any]
    community_analysis: Dict[str, Any]
    custom_response: str


analyzer = ApartmentCommunityAnalyzer()


@app.post("/analyze-resident", response_model=CommunityAnalysisResponse)
async def analyze_resident(request: CommentAnalysisRequest):
    """입주민 분석 API"""
    try:
        # 입주민 프로필 분석
        profile = analyzer.analyze_resident_profile(
            request.user_id, request.comments
        )

        # 프로필 저장
        analyzer.save_resident_profile(profile)

        # 커뮤니티 전체 분석
        community_analysis = analyzer.analyze_community()

        # 맞춤형 응답 생성
        custom_response = analyzer.generate_custom_response(
            request.user_id, ""
        )

        return CommunityAnalysisResponse(
            profile=profile.__dict__,
            community_analysis=community_analysis.__dict__,
            custom_response=custom_response
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/community-analysis")
async def get_community_analysis():
    """커뮤니티 분석 결과 조회"""
    try:
        analysis = analyzer.analyze_community()
        return analysis.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-response/{user_id}")
async def generate_custom_response(user_id: str, context: str = ""):
    """맞춤형 대응글 생성"""
    try:
        response = analyzer.generate_custom_response(user_id, context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    _ac = int(
        os.environ.get("APARTMENT_COMMUNITY_PORT", os.environ.get("PORT", "8005"))
    )
    uvicorn.run(app, host="0.0.0.0", port=_ac)
