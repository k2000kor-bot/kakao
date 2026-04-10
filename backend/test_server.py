#!/usr/bin/env python3
"""
테스트용 간단한 FastAPI 서버
프론트엔드와의 연동 테스트를 위한 서버
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
import uuid
from datetime import datetime
import random
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
import os

from cors_config import get_cors_allow_origins

app = FastAPI(title="CORBU.AI Backend", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 연결 관리자
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
                pass

manager = ConnectionManager()

# 데이터 모델
class ChatMessage(BaseModel):
    content: str
    role: str = "user"
    timestamp: Optional[str] = None

class AIResponse(BaseModel):
    content: str
    role: str = "assistant"
    timestamp: Optional[str] = None
    model: str = "CORBU.AI"

class Project(BaseModel):
    id: str
    name: str
    description: str
    created_at: str
    updated_at: str

# 메모리 저장소 (실제 프로덕션에서는 데이터베이스 사용)
chat_history: Dict[str, List[Dict]] = {}
projects: Dict[str, Project] = {}

# 실시간 모니터링 및 알림 시스템
monitoring_topics: Dict[str, Dict] = {}
alert_settings: Dict[str, Dict] = {}
notification_queue: List[Dict] = []

# 대시보드 데이터를 위한 전역 변수
dashboard_stats = {
    "total_analyses": 0,
    "average_score": 0,
    "active_monitorings": 0,
    "total_alerts": 0,
    "sentiment_distribution": {"positive": 0, "negative": 0, "neutral": 0},
    "category_distribution": {},
    "recent_activities": []
}

# 활동 추적을 위한 전역 변수
activity_log = []
sentiment_scores = []
analysis_categories = []


def log_activity(activity_type: str, title: str, status: str = "success", details: Dict = None):
    """활동을 로그에 기록하고 대시보드 통계를 업데이트"""
    global activity_log, dashboard_stats
    
    activity = {
        "id": str(len(activity_log) + 1),
        "type": activity_type,
        "title": title,
        "timestamp": datetime.now().isoformat(),
        "status": status,
        "details": details or {}
    }
    
    activity_log.append(activity)
    
    # 최근 활동 목록 업데이트 (최대 10개 유지)
    dashboard_stats["recent_activities"] = activity_log[-10:]
    
    # 활동 타입별 통계 업데이트
    if activity_type == "analysis":
        dashboard_stats["total_analyses"] += 1
    elif activity_type == "monitoring":
        dashboard_stats["active_monitorings"] = len(monitoring_topics)
    elif activity_type == "alert":
        dashboard_stats["total_alerts"] += 1


def update_sentiment_stats(sentiment: str, confidence: float):
    """감정 분석 통계 업데이트"""
    global sentiment_scores, dashboard_stats
    
    sentiment_scores.append({"sentiment": sentiment, "confidence": confidence})
    
    # 감정 분포 계산
    total_sentiments = len(sentiment_scores)
    positive_count = sum(1 for s in sentiment_scores if s["sentiment"] == "positive")
    negative_count = sum(1 for s in sentiment_scores if s["sentiment"] == "negative")
    neutral_count = total_sentiments - positive_count - negative_count
    
    if total_sentiments > 0:
        dashboard_stats["sentiment_distribution"] = {
            "positive": round((positive_count / total_sentiments) * 100, 1),
            "negative": round((negative_count / total_sentiments) * 100, 1),
            "neutral": round((neutral_count / total_sentiments) * 100, 1)
        }


def update_category_stats(category: str):
    """카테고리 통계 업데이트"""
    global analysis_categories, dashboard_stats
    
    analysis_categories.append(category)
    
    # 카테고리 분포 계산
    category_counts = {}
    total_categories = len(analysis_categories)
    
    for cat in analysis_categories:
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    # 백분율로 변환
    for cat, count in category_counts.items():
        category_counts[cat] = round((count / total_categories) * 100, 1)
    
    dashboard_stats["category_distribution"] = category_counts


def update_average_score(score: float):
    """평균 점수 업데이트"""
    global dashboard_stats
    
    if dashboard_stats["average_score"] == 0:
        dashboard_stats["average_score"] = score
    else:
        # 기존 점수와 새 점수의 평균 계산
        current_total = dashboard_stats["average_score"] * dashboard_stats["total_analyses"]
        new_total = current_total + score
        dashboard_stats["average_score"] = round(new_total / (dashboard_stats["total_analyses"] + 1), 1)


def generate_high_quality_content(user_input: str) -> str:
    """고품질 글쓰기 도우미 - 자체 검수 및 개선 시스템 포함"""
    
    def self_review_content(content: str, request_info: Dict) -> Dict:
        """글쓰기 자체 검수 시스템"""
        review_result = {
            "score": 0,
            "issues": [],
            "improvements": []
        }
        
        # 기본 점수 (0-100)
        base_score = 70
        
        # 1. 도입부 검토
        if len(content) > 100 and any(word in content[:200] for word in ["안녕", "안녕하세요", "이번", "오늘"]):
            base_score += 10
        else:
            review_result["issues"].append("도입부가 부족합니다")
            review_result["improvements"].append("명확한 도입부를 추가하세요")
        
        # 2. 결론부 검토
        if len(content) > 200 and any(word in content[-200:] for word in ["감사", "감사합니다", "바랍니다", "기대", "희망"]):
            base_score += 10
        else:
            review_result["issues"].append("결론부가 부족합니다")
            review_result["improvements"].append("적절한 결론을 추가하세요")
        
        # 3. 구조 검토
        paragraphs = content.split('\n\n')
        if len(paragraphs) >= 3:
            base_score += 10
        else:
            review_result["issues"].append("문단 구조가 부족합니다")
            review_result["improvements"].append("적절한 문단 구분을 추가하세요")
        
        # 4. 길이 검토
        if 200 <= len(content) <= 1000:
            base_score += 10
        elif len(content) < 200:
            review_result["issues"].append("내용이 너무 짧습니다")
            review_result["improvements"].append("더 자세한 내용을 추가하세요")
        else:
            review_result["issues"].append("내용이 너무 깁니다")
            review_result["improvements"].append("핵심 내용만 요약하세요")
        
        # 5. 주제 일관성 검토
        if request_info.get("writing_type") in content:
            base_score += 10
        else:
            review_result["issues"].append("주제 일관성이 부족합니다")
            review_result["improvements"].append("요청된 주제에 더 집중하세요")
        
        review_result["score"] = min(100, base_score)
        return review_result
    
    def improve_content(content: str, review_result: Dict, request_info: Dict) -> str:
        """검수 결과를 바탕으로 내용 개선"""
        improved_content = content
        
        # 점수가 80점 미만이면 개선 시도
        if review_result["score"] < 80:
            # 도입부 개선
            if "도입부가 부족합니다" in review_result["issues"]:
                if "이메일" in request_info.get("writing_type", ""):
                    improved_content = f"안녕하세요,\n\n{improved_content}"
                elif "블로그" in request_info.get("writing_type", ""):
                    improved_content = f"오늘은 {request_info.get('writing_type', '주제')}에 대해 이야기해보겠습니다.\n\n{improved_content}"
            
            # 결론부 개선
            if "결론부가 부족합니다" in review_result["issues"]:
                if "이메일" in request_info.get("writing_type", ""):
                    improved_content += "\n\n감사합니다."
                elif "블로그" in request_info.get("writing_type", ""):
                    improved_content += f"\n\n이상으로 {request_info.get('writing_type', '주제')}에 대한 내용을 마치겠습니다."
        
        return improved_content
    
    # 글쓰기 요청 분석
    user_input_lower = user_input.lower()
    writing_type = "일반 글쓰기"
    
    if "이메일" in user_input_lower:
        writing_type = "이메일"
        content = f"""안녕하세요,

이번 기회에 연락드려서 기쁩니다.

{user_input}에 대한 내용을 정리해드리겠습니다.

주요 내용:
• 첫 번째 핵심 사항
• 두 번째 중요 포인트  
• 세 번째 고려사항

추가 문의사항이 있으시면 언제든 연락주세요.

감사합니다.

최선을 다하겠습니다."""
    
    elif "블로그" in user_input_lower:
        writing_type = "블로그"
        content = f"""# {user_input}에 대한 블로그 포스트

오늘은 {user_input}에 대해 자세히 알아보겠습니다.

## 주요 내용

### 1. 핵심 개념
{user_input}의 기본 개념과 중요성에 대해 설명드리겠습니다.

### 2. 실제 적용 사례
현실에서 어떻게 활용되는지 구체적인 예시를 통해 살펴보겠습니다.

### 3. 향후 전망
앞으로의 발전 방향과 기회에 대해 전망해보겠습니다.

## 결론

{user_input}는 현재와 미래에 매우 중요한 역할을 할 것으로 예상됩니다. 지속적인 관심과 학습이 필요합니다.

읽어주셔서 감사합니다!"""
    
    elif "보고서" in user_input_lower:
        writing_type = "보고서"
        content = f"""# {user_input} 보고서

## 개요
본 보고서는 {user_input}에 대한 종합적인 분석 결과를 제시합니다.

## 주요 발견사항

### 1. 현황 분석
- 현재 상황 및 배경
- 주요 이슈 및 문제점
- 관련 데이터 및 통계

### 2. 문제점 및 기회
- 식별된 문제점들
- 개선 기회 및 가능성
- 위험 요소 및 대응 방안

### 3. 권장사항
- 단기적 조치사항
- 중장기 전략
- 예상 효과 및 결과

## 결론
{user_input}에 대한 체계적인 접근과 지속적인 모니터링이 필요합니다.

보고서 작성일: {datetime.now().strftime('%Y년 %m월 %d일')}"""
    
    else:
        content = f"""# {user_input}에 대한 글

안녕하세요! 오늘은 {user_input}에 대해 이야기해보겠습니다.

## 주요 내용

{user_input}는 매우 흥미로운 주제입니다. 이에 대해 자세히 알아보겠습니다.

### 핵심 포인트
1. 첫 번째 중요한 점
2. 두 번째 고려사항
3. 세 번째 결론

## 마무리

{user_input}에 대한 이해를 바탕으로 앞으로의 발전 방향을 모색해보시기 바랍니다.

감사합니다!"""
    
    # 자체 검수 및 개선
    request_info = {"writing_type": writing_type}
    review_result = self_review_content(content, request_info)
    
    # 검수 결과가 좋지 않으면 개선 시도
    if review_result["score"] < 80:
        content = improve_content(content, review_result, request_info)
        # 재검수
        review_result = self_review_content(content, request_info)
    
    # 검수 결과를 포함한 응답
    final_content = f"""# {writing_type} 작성 완료

{content}

---
## 📊 글쓰기 품질 검수 결과
- **점수**: {review_result['score']}/100
- **상태**: {'우수' if review_result['score'] >= 80 else '개선 필요'}

"""
    
    if review_result["issues"]:
        final_content += f"### 개선 사항\n"
        for issue in review_result["issues"]:
            final_content += f"- {issue}\n"
    
    if review_result["improvements"]:
        final_content += f"\n### 개선 제안\n"
        for improvement in review_result["improvements"]:
            final_content += f"- {improvement}\n"
    
    return final_content


def format_response(title: str, content: str, summary: str = None, key_points: List[str] = None) -> str:
    """응답을 구조화된 형태로 포맷팅"""
    formatted_response = f"# {title}\n\n"
    
    if summary:
        formatted_response += f"## 📋 요약\n{summary}\n\n"
    
    formatted_response += f"## 📄 상세 내용\n{content}\n\n"
    
    if key_points:
        formatted_response += "## 🔑 핵심 포인트\n"
        for i, point in enumerate(key_points, 1):
            formatted_response += f"{i}. {point}\n"
        formatted_response += "\n"
    
    formatted_response += "---\n*CORBU.AI가 제공하는 서비스입니다.*"
    
    return formatted_response


def add_monitoring_topic(topic: str, user_id: str, alert_threshold: float = 0.7) -> Dict:
    """모니터링 주제 추가"""
    topic_id = f"{topic}_{user_id}_{int(datetime.now().timestamp())}"
    monitoring_topics[topic_id] = {
        "topic": topic,
        "user_id": user_id,
        "created_at": datetime.now(),
        "alert_threshold": alert_threshold,
        "last_check": datetime.now(),
        "alert_count": 0,
        "is_active": True
    }
    return {
        "topic_id": topic_id,
        "topic": topic,
        "alert_threshold": alert_threshold,
        "status": "active"
    }

def check_monitoring_alerts() -> List[Dict]:
    """모니터링 알림 확인"""
    alerts = []
    current_time = datetime.now()
    
    for topic_id, topic_info in monitoring_topics.items():
        if not topic_info["is_active"]:
            continue
            
        # 마지막 확인 후 1시간 경과 시 알림 생성
        time_diff = (current_time - topic_info["last_check"]).total_seconds() / 3600
        if time_diff >= 1:  # 1시간마다 체크
            # 새로운 뉴스 검색
            search_results = search_web_content(topic_info["topic"], max_results=3)
            if search_results:
                # 중요도 계산
                importance_score = calculate_importance_score(search_results)
                
                if importance_score >= topic_info["alert_threshold"]:
                    alert = {
                        "topic_id": topic_id,
                        "topic": topic_info["topic"],
                        "user_id": topic_info["user_id"],
                        "importance_score": importance_score,
                        "news_count": len(search_results),
                        "timestamp": current_time,
                        "message": f"'{topic_info['topic']}' 관련 중요 뉴스 {len(search_results)}개 발견 (중요도: {importance_score:.2f})"
                    }
                    alerts.append(alert)
                    topic_info["alert_count"] += 1
            
            topic_info["last_check"] = current_time
    
    return alerts

def calculate_importance_score(news_list: List[Dict]) -> float:
    """뉴스 중요도 점수 계산"""
    if not news_list:
        return 0.0
    
    total_score = 0.0
    for news in news_list:
        # 제목에 중요 키워드가 포함된 경우
        important_keywords = ["긴급", "중요", "발표", "결정", "변화", "혁신", "위기", "기회"]
        title_score = sum(1 for keyword in important_keywords if keyword in news.get("title", ""))
        
        # 출처 신뢰도
        source_score = 0.5
        if "네이버" in news.get("source", ""):
            source_score = 0.8
        elif "전문매체" in news.get("source", ""):
            source_score = 0.9
        
        # 최종 점수 계산
        news_score = (title_score * 0.3 + source_score * 0.7)
        total_score += news_score
    
    return min(1.0, total_score / len(news_list))

# 웹 검색 및 뉴스 분석 함수들
def search_web_content(query: str, max_results: int = 5) -> List[Dict]:
    """실제 웹에서 관련 내용 검색"""
    try:
        # 실제 뉴스 사이트에서 검색 (예시)
        search_urls = [
            f"https://search.naver.com/search.naver?query={query}",
            f"https://www.google.com/search?q={query}+뉴스",
            f"https://www.daum.net/search?q={query}+최신뉴스"
        ]
        
        results = []
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        for url in search_urls[:1]:  # 네이버 검색만 사용
            try:
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # 네이버 뉴스 결과 추출
                    news_items = soup.find_all('div', class_='news_wrap')
                    for item in news_items[:max_results]:
                        title_elem = item.find('a', class_='news_tit')
                        if title_elem:
                            title = title_elem.get_text(strip=True)
                            url = title_elem.get('href', '')
                            
                            # 요약 추출
                            summary_elem = item.find('div', class_='news_dsc')
                            summary = summary_elem.get_text(strip=True) if summary_elem else ""
                            
                            # 출처 추출
                            source_elem = item.find('a', class_='info_group')
                            source = source_elem.get_text(strip=True) if source_elem else "네이버뉴스"
                            
                            results.append({
                                "title": title,
                                "url": url,
                                "snippet": summary,
                                "source": source,
                                "date": datetime.now().strftime("%Y-%m-%d")
                            })
            except Exception as e:
                print(f"검색 오류: {e}")
                continue
        
        # 실제 검색 결과가 없으면 샘플 데이터 반환
        if not results:
            results = [
                {
                    "title": f"{query} 관련 최신 뉴스",
                    "url": f"https://example.com/news/{query.replace(' ', '-')}",
                    "snippet": f"{query}에 대한 최신 정보와 분석이 담긴 기사입니다.",
                    "source": "뉴스사이트",
                    "date": datetime.now().strftime("%Y-%m-%d")
                },
                {
                    "title": f"{query} 전문가 분석",
                    "url": f"https://example.com/analysis/{query.replace(' ', '-')}",
                    "snippet": f"{query}에 대한 전문가들의 의견과 전망을 담은 분석 기사입니다.",
                    "source": "전문매체",
                    "date": datetime.now().strftime("%Y-%m-%d")
                }
            ]
        
        return results[:max_results]
    except Exception as e:
        print(f"웹 검색 오류: {e}")
        return []

def extract_article_content(url: str) -> Dict:
    """실제 웹 페이지에서 기사 내용 추출"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 제목 추출
            title = ""
            title_selectors = ['h1', '.title', '.headline', '.article-title', 'title']
            for selector in title_selectors:
                title_elem = soup.select_one(selector)
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    break
            
            # 본문 내용 추출
            content = ""
            content_selectors = ['.article-content', '.news-content', '.content', '.article-body', 'article']
            for selector in content_selectors:
                content_elem = soup.select_one(selector)
                if content_elem:
                    # 불필요한 요소 제거
                    for elem in content_elem.find_all(['script', 'style', 'nav', 'header', 'footer']):
                        elem.decompose()
                    content = content_elem.get_text(strip=True)
                    break
            
            # 작성자 추출
            author = ""
            author_selectors = ['.author', '.writer', '.reporter', '.byline']
            for selector in author_selectors:
                author_elem = soup.select_one(selector)
                if author_elem:
                    author = author_elem.get_text(strip=True)
                    break
            
            # 날짜 추출
            date = datetime.now().strftime("%Y-%m-%d")
            date_selectors = ['.date', '.published', '.time', '.timestamp']
            for selector in date_selectors:
                date_elem = soup.select_one(selector)
                if date_elem:
                    date_text = date_elem.get_text(strip=True)
                    if date_text:
                        date = date_text
                        break
            
            return {
                "title": title or "기사 제목",
                "content": content or "기사 내용을 추출할 수 없습니다.",
                "author": author or "기자명",
                "date": date,
                "source": "뉴스사이트",
                "url": url
            }
        else:
            return {
                "title": "기사 제목",
                "content": "기사 내용을 가져올 수 없습니다.",
                "author": "기자명",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "source": "뉴스사이트",
                "url": url
            }
    except Exception as e:
        print(f"기사 추출 오류: {e}")
        return {
            "title": "기사 제목",
            "content": "기사 내용을 추출하는 중 오류가 발생했습니다.",
            "author": "기자명",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "source": "뉴스사이트",
            "url": url
        }

def analyze_news_content(content: str) -> Dict:
    """고급 뉴스 기사 내용 분석 - AI 추천 시스템 포함"""
    
    def generate_ai_recommendations(analysis_result: Dict) -> List[str]:
        """AI 기반 추천사항 생성"""
        recommendations = []
        
        # 감정 분석 기반 추천
        sentiment = analysis_result.get("sentiment", "neutral")
        if sentiment == "positive":
            recommendations.append("긍정적인 뉴스로 투자 기회나 성장 가능성을 모니터링하세요.")
        elif sentiment == "negative":
            recommendations.append("부정적인 뉴스로 리스크 관리와 대응 전략을 준비하세요.")
        
        # 카테고리 기반 추천
        main_category = analysis_result.get("analysis_info", {}).get("main_category", "")
        if main_category == "technology":
            recommendations.append("기술 트렌드를 파악하여 혁신 기회를 포착하세요.")
        elif main_category == "business":
            recommendations.append("비즈니스 전략 수립에 참고할 수 있는 인사이트를 활용하세요.")
        elif main_category == "finance":
            recommendations.append("금융 시장 동향을 파악하여 투자 결정에 참고하세요.")
        
        # 신뢰도 기반 추천
        confidence = analysis_result.get("confidence", 0.5)
        if confidence < 0.7:
            recommendations.append("추가적인 정보 검증이 필요할 수 있습니다.")
        elif confidence > 0.9:
            recommendations.append("높은 신뢰도의 정보로 의사결정에 활용하세요.")
        
        # 키워드 기반 추천
        keywords = analysis_result.get("keywords", [])
        if "AI" in keywords or "인공지능" in keywords:
            recommendations.append("AI 기술 동향을 지속적으로 모니터링하세요.")
        if "투자" in keywords:
            recommendations.append("투자 기회와 리스크를 균형있게 고려하세요.")
        
        return recommendations
    try:
        # 확장된 키워드 사전
        keyword_categories = {
            "technology": ["AI", "인공지능", "기술", "혁신", "디지털", "소프트웨어", "하드웨어", "플랫폼"],
            "business": ["시장", "투자", "성장", "전략", "매출", "이익", "기업", "경영"],
            "finance": ["주식", "금융", "투자", "경제", "금리", "환율", "부동산"],
            "health": ["의료", "건강", "질병", "치료", "백신", "병원", "의사"],
            "politics": ["정치", "정부", "국회", "법안", "정책", "선거", "외교"],
            "society": ["사회", "문화", "교육", "환경", "복지", "안전", "범죄"]
        }
        
        found_keywords = []
        category_scores = {}
        
        # 카테고리별 키워드 분석
        for category, keywords in keyword_categories.items():
            category_score = 0
            for keyword in keywords:
                if keyword in content:
                    found_keywords.append(keyword)
                    category_score += 1
            category_scores[category] = category_score
        
        # 주요 카테고리 결정
        main_category = max(category_scores.items(), key=lambda x: x[1])[0] if category_scores else "general"
        
        if not found_keywords:
            found_keywords = ["주요", "중요", "핵심", "관련", "영향"]
        
        # 고급 요약 생성
        sentences = content.split('.')
        important_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20 and any(keyword in sentence for keyword in found_keywords):
                important_sentences.append(sentence)
        
        if important_sentences:
            summary = f"이 기사는 {important_sentences[0][:100]}...에 대한 내용을 다루고 있습니다. "
            if len(important_sentences) > 1:
                summary += f"또한 {important_sentences[1][:50]}...등의 내용을 포함합니다."
        else:
            summary = f"이 기사는 {content[:100]}...에 대한 내용을 다루고 있습니다."
        
        # 고급 사실 관계 분석
        facts = []
        for sentence in sentences[:10]:
            sentence = sentence.strip()
            if len(sentence) > 15 and any(word in sentence for word in ["발표", "공개", "발표", "계획", "예상", "전망"]):
                facts.append(sentence + ".")
        
        if not facts:
            facts = [sentence.strip() + "." for sentence in sentences[:3] if len(sentence.strip()) > 10]
        
        if not facts:
            facts = [
                "기사에서 언급된 주요 사실 1",
                "기사에서 언급된 주요 사실 2",
                "기사에서 언급된 주요 사실 3"
            ]
        
        # 고급 감정 분석
        positive_words = ["성장", "발전", "혁신", "성공", "긍정", "희망", "미래", "상승", "증가", "개선"]
        negative_words = ["위험", "실패", "손실", "부정", "우려", "문제", "위기", "하락", "감소", "악화"]
        neutral_words = ["발표", "공개", "계획", "예상", "전망", "분석", "연구", "조사"]
        
        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)
        neutral_count = sum(1 for word in neutral_words if word in content)
        
        total_sentiment_words = positive_count + negative_count + neutral_count
        
        if total_sentiment_words > 0:
            positive_ratio = positive_count / total_sentiment_words
            negative_ratio = negative_count / total_sentiment_words
            
            if positive_ratio > 0.6:
                sentiment = "positive"
                sentiment_score = positive_ratio
            elif negative_ratio > 0.6:
                sentiment = "negative"
                sentiment_score = negative_ratio
            else:
                sentiment = "neutral"
                sentiment_score = 0.5
        else:
            sentiment = "neutral"
            sentiment_score = 0.5
        
        # 고급 신뢰도 계산
        content_length_score = min(1.0, len(content) / 1000)  # 내용 길이 점수
        keyword_diversity_score = min(1.0, len(found_keywords) / 10)  # 키워드 다양성 점수
        fact_count_score = min(1.0, len(facts) / 5)  # 사실 개수 점수
        
        confidence = (content_length_score * 0.3 + keyword_diversity_score * 0.3 + fact_count_score * 0.4)
        confidence = min(0.95, max(0.5, confidence))
        
        # 추가 분석 정보
        analysis_info = {
            "main_category": main_category,
            "category_scores": category_scores,
            "sentiment_score": sentiment_score,
            "content_complexity": len(content.split()) / len(sentences) if sentences else 0,
            "fact_density": len(facts) / len(sentences) if sentences else 0
        }
        
        # 기본 분석 결과
        analysis_result = {
            "summary": summary,
            "keywords": found_keywords,
            "facts": facts,
            "sentiment": sentiment,
            "sentiment_score": sentiment_score * 100,  # 0-100 스케일로 변환
            "confidence": confidence,
            "word_count": len(content.split()),
            "analysis_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "analysis_info": analysis_info,
            "main_category": main_category  # 직접 접근 가능하도록 추가
        }
        
        # AI 추천사항 생성
        recommendations = generate_ai_recommendations(analysis_result)
        analysis_result["recommendations"] = recommendations
        
        return analysis_result
    except Exception as e:
        print(f"뉴스 분석 오류: {e}")
        return {
            "summary": "기사 내용 분석 중 오류가 발생했습니다.",
            "keywords": ["분석", "오류"],
            "facts": ["분석을 완료할 수 없습니다."],
            "sentiment": "neutral",
            "confidence": 0.5,
            "analysis_info": {}
        }

def monitor_news_topic(topic: str, time_period: str = "1d") -> List[Dict]:
    """실제 특정 주제의 뉴스 모니터링 - 고급 분석 포함"""
    
    def analyze_trends(news_list: List[Dict]) -> Dict:
        """뉴스 트렌드 분석"""
        if not news_list:
            return {}
        
        # 시간별 분석
        time_analysis = {
            "total_articles": len(news_list),
            "sources": list(set([news["source"] for news in news_list])),
            "date_range": f"{news_list[0]['date']} ~ {news_list[-1]['date']}"
        }
        
        # 감정 트렌드 분석
        sentiments = []
        categories = []
        
        for news in news_list:
            if "full_content" in news:
                analysis = analyze_news_content(news["full_content"])
                sentiments.append(analysis["sentiment"])
                categories.append(analysis.get("analysis_info", {}).get("main_category", "general"))
        
        if sentiments:
            positive_count = sentiments.count("positive")
            negative_count = sentiments.count("negative")
            neutral_count = sentiments.count("neutral")
            
            time_analysis["sentiment_trend"] = {
                "positive": positive_count,
                "negative": negative_count,
                "neutral": neutral_count,
                "dominant_sentiment": max(set(sentiments), key=sentiments.count) if sentiments else "neutral"
            }
        
        if categories:
            category_counts = {}
            for category in categories:
                category_counts[category] = category_counts.get(category, 0) + 1
            
            time_analysis["category_trend"] = {
                "categories": category_counts,
                "dominant_category": max(category_counts.items(), key=lambda x: x[1])[0] if category_counts else "general"
            }
        
        return time_analysis
    try:
        # 실제 뉴스 검색을 통한 모니터링
        search_results = search_web_content(f"{topic} 최신뉴스", max_results=3)
        monitored_news = []
        
        for result in search_results:
            # 기사 내용 추출
            article_content = extract_article_content(result["url"])
            
            monitored_news.append({
                "title": result["title"],
                "content": article_content["content"][:200] + "..." if len(article_content["content"]) > 200 else article_content["content"],
                "date": result["date"],
                "source": result["source"],
                "url": result["url"],
                "author": article_content["author"],
                "full_content": article_content["content"]
            })
        
        # 고급 트렌드 분석 수행
        trend_analysis = analyze_trends(monitored_news)
        
        # 모니터링 통계 추가
        monitoring_stats = {
            "topic": topic,
            "time_period": time_period,
            "total_articles": len(monitored_news),
            "monitoring_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "sources": list(set([news["source"] for news in monitored_news])),
            "trend_analysis": trend_analysis
        }
        
        return {
            "news": monitored_news,
            "stats": monitoring_stats
        }
    except Exception as e:
        print(f"뉴스 모니터링 오류: {e}")
        # 오류 시 기본 데이터 반환
        return {
            "news": [
                {
                    "title": f"{topic} 관련 최신 뉴스 1",
                    "content": f"{topic}에 대한 최신 소식입니다.",
                    "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "source": "뉴스사이트1",
                    "url": f"https://example1.com/news/{topic}",
                    "author": "기자명",
                    "full_content": f"{topic}에 대한 최신 소식입니다."
                },
                {
                    "title": f"{topic} 관련 최신 뉴스 2", 
                    "content": f"{topic}에 대한 추가 분석 기사입니다.",
                    "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "source": "뉴스사이트2",
                    "url": f"https://example2.com/news/{topic}",
                    "author": "기자명",
                    "full_content": f"{topic}에 대한 추가 분석 기사입니다."
                }
            ],
            "stats": {
                "topic": topic,
                "time_period": time_period,
                "total_articles": 2,
                "monitoring_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "sources": ["뉴스사이트1", "뉴스사이트2"]
            }
        }

def update_dashboard_stats(analysis_type: str, sentiment: str = None, category: str = None, score: float = None):
    """대시보드 통계를 업데이트하는 함수"""
    global dashboard_stats
    
    # 총 분석 수 증가
    dashboard_stats["total_analyses"] += 1
    
    # 감정 분포 업데이트
    if sentiment:
        if sentiment == "positive":
            dashboard_stats["sentiment_distribution"]["positive"] += 1
        elif sentiment == "negative":
            dashboard_stats["sentiment_distribution"]["negative"] += 1
        else:
            dashboard_stats["sentiment_distribution"]["neutral"] += 1
    
    # 카테고리 분포 업데이트
    if category:
        if category not in dashboard_stats["category_distribution"]:
            dashboard_stats["category_distribution"][category] = 0
        dashboard_stats["category_distribution"][category] += 1
    
    # 평균 점수 업데이트
    if score is not None:
        current_total = dashboard_stats["average_score"] * (dashboard_stats["total_analyses"] - 1)
        dashboard_stats["average_score"] = (current_total + score) / dashboard_stats["total_analyses"]
    
    # 최근 활동 추가
    activity_types = {
        "web_search": "analysis",
        "news_analysis": "analysis", 
        "writing": "writing",
        "monitoring": "monitoring"
    }
    
    activity_titles = {
        "web_search": "웹 검색 및 분석",
        "news_analysis": "뉴스 분석 완료",
        "writing": "글쓰기 완료",
        "monitoring": "모니터링 설정"
    }
    
    activity_type = activity_types.get(analysis_type, "analysis")
    activity_title = activity_titles.get(analysis_type, "분석 완료")
    
    new_activity = {
        "id": str(len(dashboard_stats["recent_activities"]) + 1),
        "type": activity_type,
        "title": activity_title,
        "timestamp": datetime.now().isoformat(),
        "status": "success" if score and score > 80 else "warning"
    }
    
    # 최근 활동 목록에 추가 (최대 10개 유지)
    dashboard_stats["recent_activities"].insert(0, new_activity)
    if len(dashboard_stats["recent_activities"]) > 10:
        dashboard_stats["recent_activities"] = dashboard_stats["recent_activities"][:10]

# 실제 글쓰기 도우미 AI 응답 생성 함수
def generate_ai_response(user_input: str) -> str:
    """사용자 입력에 따른 AI 응답 생성"""
    user_input_lower = user_input.lower()
    
    # 모니터링 기능 (우선순위 높음)
    if any(keyword in user_input_lower for keyword in ["모니터링", "추적", "감시", "관찰"]):
        try:
            # 모니터링 주제 추출
            monitoring_topic = user_input.replace("모니터링", "").replace("추적", "").replace("감시", "").replace("관찰", "").strip()
            if not monitoring_topic:
                monitoring_topic = "기술 트렌드"
            
            # 모니터링 시작
            monitoring_result = monitor_news_topic(monitoring_topic)
            
            # 모니터링 주제 등록
            topic_id = add_monitoring_topic(monitoring_topic, "user_001", 0.7)
            
            response_content = f"## 📊 {monitoring_topic} 모니터링 시작\n\n"
            response_content += f"**모니터링 주제**: {monitoring_topic}\n"
            response_content += f"**모니터링 ID**: {topic_id['topic_id']}\n"
            response_content += f"**알림 임계값**: {topic_id['alert_threshold']}\n\n"
            
            if monitoring_result.get("news"):
                response_content += "### 📰 최신 뉴스\n\n"
                for i, news in enumerate(monitoring_result["news"][:3], 1):
                    response_content += f"**{i}. {news['title']}**\n"
                    response_content += f"출처: {news['source']}\n"
                    response_content += f"내용: {news['content'][:100]}...\n\n"
            
            if monitoring_result.get("stats"):
                stats = monitoring_result["stats"]
                response_content += "### 📈 모니터링 통계\n\n"
                response_content += f"**총 기사 수**: {stats['total_articles']}\n"
                response_content += f"**모니터링 시간**: {stats['monitoring_time']}\n"
                response_content += f"**뉴스 소스**: {', '.join(stats['sources'])}\n\n"
            
            # 활동 로깅
            log_activity("monitoring", f"{monitoring_topic} 모니터링 시작", "active", {
                "topic": monitoring_topic,
                "topic_id": topic_id['topic_id']
            })
            
            return format_response(
                "모니터링 시작 완료",
                response_content,
                f"{monitoring_topic}에 대한 실시간 모니터링이 시작되었습니다.",
                ["실시간 알림", "뉴스 추적", "트렌드 분석", "자동 업데이트"]
            )
        except Exception as e:
            return format_response(
                "모니터링 오류",
                f"모니터링 설정 중 오류가 발생했습니다: {str(e)}",
                "잠시 후 다시 시도해주세요."
            )
    
    # 웹 검색 및 뉴스 분석
    elif any(keyword in user_input_lower for keyword in ["검색", "뉴스", "기사", "웹"]):
        try:
            if "뉴스" in user_input_lower or "기사" in user_input_lower:
                # 뉴스 검색 및 분석
                search_results = search_web_content(user_input)
                if search_results:
                    analysis_results = []
                    for result in search_results[:3]:  # 상위 3개 기사만 분석
                        article_content = extract_article_content(result["url"])
                        if article_content:
                            analysis = analyze_news_content(article_content["content"])
                            analysis_results.append({
                                "title": article_content["title"],
                                "url": result["url"],
                                "analysis": analysis
                            })
                    
                    if analysis_results:
                        response_content = "## 📰 뉴스 분석 결과\n\n"
                        for i, result in enumerate(analysis_results, 1):
                            analysis = result["analysis"]
                            response_content += f"### {i}. {result['title']}\n\n"
                            response_content += f"**주요 카테고리**: {analysis['main_category']}\n"
                            response_content += f"**감정 점수**: {analysis['sentiment_score']:.1f}/100\n"
                            response_content += f"**신뢰도**: {analysis['confidence']:.1f}%\n"
                            response_content += f"**내용 복잡도**: {analysis['content_complexity']}\n"
                            response_content += f"**사실 밀도**: {analysis['fact_density']:.1f}%\n\n"
                            
                            if analysis['summary']:
                                response_content += f"**요약**: {analysis['summary']}\n\n"
                            
                            if analysis['key_facts']:
                                response_content += "**핵심 사실**:\n"
                                for fact in analysis['key_facts'][:3]:
                                    response_content += f"- {fact}\n"
                                response_content += "\n"
                            
                            if analysis.get('recommendations'):
                                response_content += "**AI 추천**:\n"
                                for rec in analysis['recommendations'][:2]:
                                    response_content += f"- {rec}\n"
                                response_content += "\n"
                            
                            if analysis.get('trend_analysis'):
                                response_content += f"**트렌드 분석**: {analysis['trend_analysis']}\n\n"
                            
                            response_content += "---\n\n"
                        
                        # 활동 로깅 및 대시보드 통계 업데이트
                        main_analysis = analysis_results[0]["analysis"]
                        sentiment = "positive" if main_analysis.get("sentiment_score", 0) > 50 else "negative"
                        main_category = main_analysis.get("main_category", "기술")
                        
                        log_activity("analysis", f"{user_input} 뉴스 분석", "success", {
                            "article_count": len(analysis_results),
                            "main_category": main_category
                        })
                        update_sentiment_stats(sentiment, main_analysis.get("confidence", 0.8))
                        update_category_stats(main_category)
                        update_average_score(main_analysis.get("confidence", 0.8) * 100)
                        
                        return format_response(
                            "뉴스 분석 완료",
                            response_content,
                            "다양한 뉴스 소스에서 정보를 수집하고 분석했습니다.",
                            ["실시간 뉴스 모니터링", "감정 분석", "사실 검증", "AI 추천"]
                        )
                else:
                    return format_response(
                        "뉴스 검색 결과 없음",
                        "요청하신 주제에 대한 최신 뉴스를 찾을 수 없습니다. 다른 키워드로 검색해보세요.",
                        "검색 결과가 없어 분석을 진행할 수 없습니다."
                    )
            else:
                # 일반 웹 검색
                search_results = search_web_content(user_input)
                if search_results:
                    response_content = "## 🔍 웹 검색 결과\n\n"
                    for i, result in enumerate(search_results[:5], 1):
                        response_content += f"### {i}. {result['title']}\n"
                        response_content += f"**URL**: {result['url']}\n"
                        response_content += f"**설명**: {result.get('snippet', result.get('description', '설명 없음'))}\n\n"
                    
                    # 활동 로깅 및 대시보드 통계 업데이트
                    log_activity("analysis", f"{user_input} 웹 검색", "success", {
                        "result_count": len(search_results)
                    })
                    update_sentiment_stats("neutral", 0.8)
                    update_category_stats("기술")
                    update_average_score(80.0)
                    
                    return format_response(
                        "웹 검색 완료",
                        response_content,
                        "웹에서 관련 정보를 검색했습니다.",
                        ["실시간 검색", "다양한 소스", "신뢰할 수 있는 정보"]
                    )
                else:
                    return format_response(
                        "검색 결과 없음",
                        "요청하신 내용에 대한 검색 결과를 찾을 수 없습니다.",
                        "검색어를 변경해보세요."
                    )
        except Exception as e:
            return format_response(
                "검색 오류",
                f"검색 중 오류가 발생했습니다: {str(e)}",
                "잠시 후 다시 시도해주세요."
            )
    
    # 글쓰기 도우미
    elif any(keyword in user_input_lower for keyword in ["이메일", "블로그", "보고서", "마케팅", "논리", "감정", "AI"]):
        content = generate_high_quality_content(user_input)
        
        # 활동 로깅 및 대시보드 통계 업데이트
        writing_type = "이메일" if "이메일" in user_input_lower else "블로그" if "블로그" in user_input_lower else "보고서" if "보고서" in user_input_lower else "일반 글쓰기"
        
        log_activity("writing", f"{writing_type} 작성 완료", "success", {
            "content_length": len(content),
            "writing_type": writing_type
        })
        update_sentiment_stats("positive", 0.9)
        update_category_stats("글쓰기")
        update_average_score(85.0)
        
        return content
    
    # 기본 응답
    else:
        return format_response(
            "CORBU.AI 도우미 서비스 안내",
            """안녕하세요! CORBU.AI 도우미입니다. 다음과 같은 서비스를 제공합니다:

### 📝 글쓰기 도우미
- 이메일, 블로그, 보고서 작성
- 논리적 사고와 감정적 어조 조절
- 자동 검수 및 개선 제안

### 🔍 웹 검색 & 뉴스 분석
- 실시간 웹 검색
- 뉴스 기사 분석 및 요약
- 핵심 사실 추출 및 감정 분석

### 📊 실시간 모니터링
- 특정 주제 모니터링
- 중요 뉴스 알림
- 트렌드 분석

어떤 도움이 필요하신가요?""",
            "CORBU.AI의 다양한 기능을 활용해보세요.",
            ["글쓰기 지원", "웹 검색", "뉴스 분석", "실시간 모니터링"]
        )

# API 엔드포인트
@app.get("/")
async def root():
    return {"message": "CORBU.AI Backend Server", "status": "running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# 대화 관련 API
@app.post("/api/chat")
async def send_message(message: ChatMessage):
    """대화 메시지 전송 및 AI 응답"""
    try:
        # AI 응답 생성
        ai_response_content = generate_ai_response(message.content)
        
        # 응답 생성
        ai_response = AIResponse(
            content=ai_response_content,
            timestamp=datetime.now().isoformat()
        )
        
        return {
            "success": True,
            "user_message": message.model_dump(),
            "ai_response": ai_response.model_dump(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/history")
async def get_chat_history():
    """대화 히스토리 조회"""
    return {
        "success": True,
        "history": chat_history,
        "total_messages": sum(len(messages) for messages in chat_history.values())
    }

# 프로젝트 관련 API
@app.post("/api/projects")
async def create_project(project: Project):
    """새 프로젝트 생성"""
    try:
        project_id = str(uuid.uuid4())
        project.id = project_id
        project.created_at = datetime.now().isoformat()
        project.updated_at = datetime.now().isoformat()
        
        projects[project_id] = project
        
        return {
            "success": True,
            "project": project.dict(),
            "message": "프로젝트가 성공적으로 생성되었습니다."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects")
async def get_projects():
    """프로젝트 목록 조회"""
    return {
        "success": True,
        "projects": [project.dict() for project in projects.values()],
        "total": len(projects)
    }

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    """특정 프로젝트 조회"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    
    return {
        "success": True,
        "project": projects[project_id].dict()
    }

# AI 엔진 관련 API (기존 aiEngineSlice와 호환)
@app.post("/ai/initialize")
async def initialize_ai_engine():
    """AI 엔진 초기화"""
    return {
        "success": True,
        "data": {
            "currentModel": "enhanced_unified",
            "availableModels": ["enhanced_unified", "advanced_nlp", "contextual_ai", "quantum_ai"],
            "status": "initialized"
        }
    }

@app.post("/ai/switch-model")
async def switch_ai_model(model_data: Dict[str, str]):
    """AI 모델 전환"""
    model_name = model_data.get("model", "enhanced_unified")
    return {
        "success": True,
        "data": {
            "model": model_name,
            "status": "switched"
        }
    }

@app.post("/ai/sentiment-analysis")
async def analyze_sentiment(request: Dict[str, str]):
    """감정 분석"""
    text = request.get("text", "")
    # 간단한 감정 분석 (실제로는 NLP 라이브러리 사용)
    sentiment = "positive" if any(word in text for word in ["좋", "행복", "감사", "좋아"]) else "neutral"
    if any(word in text for word in ["나쁘", "슬프", "화나", "싫어"]):
        sentiment = "negative"
    
    return {
        "success": True,
        "data": {
            "sentiment": sentiment,
            "confidence": random.uniform(0.7, 0.95)
        }
    }

@app.post("/ai/intent-detection")
async def detect_intent(request: Dict[str, str]):
    """의도 감지"""
    text = request.get("text", "")
    # 간단한 의도 감지
    intent = "general"
    if "프로젝트" in text:
        intent = "project_management"
    elif "코딩" in text or "개발" in text:
        intent = "coding_help"
    elif "안녕" in text:
        intent = "greeting"
    
    return {
        "success": True,
        "data": {
            "intent": intent,
            "confidence": random.uniform(0.8, 0.98)
        }
    }

@app.get("/ai/status")
async def get_ai_status():
    """AI 엔진 상태 조회"""
    return {
        "success": True,
        "data": {
            "status": "active",
            "currentModel": "enhanced_unified",
            "uptime": "2h 30m",
            "requestsProcessed": random.randint(100, 1000)
        }
    }

@app.get("/ai/model-performance")
async def get_model_performance():
    """모델 성능 조회"""
    return {
        "success": True,
        "data": {
            "enhanced_unified": random.uniform(0.85, 0.95),
            "advanced_nlp": random.uniform(0.80, 0.90),
            "contextual_ai": random.uniform(0.75, 0.85),
            "quantum_ai": random.uniform(0.90, 0.98)
        }
    }

@app.post("/api/monitoring/add")
async def add_monitoring_endpoint(request: Dict[str, Any]):
    """모니터링 주제 추가 API"""
    try:
        topic = request.get("topic", "")
        user_id = request.get("user_id", "default_user")
        alert_threshold = request.get("alert_threshold", 0.7)
        
        if not topic:
            raise HTTPException(status_code=400, detail="주제가 필요합니다")
        
        result = add_monitoring_topic(topic, user_id, alert_threshold)
        
        return {
            "success": True,
            "data": result,
            "message": f"'{topic}' 모니터링이 시작되었습니다."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/monitoring/alerts")
async def get_monitoring_alerts():
    """모니터링 알림 조회 API"""
    try:
        alerts = check_monitoring_alerts()
        return {
            "success": True,
            "data": alerts,
            "total_alerts": len(alerts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard")
async def get_dashboard_data():
    """대시보드 데이터를 반환하는 API"""
    global dashboard_stats, monitoring_topics, notification_queue, activity_log
    
    # 실시간 통계 업데이트
    dashboard_stats["active_monitorings"] = len(monitoring_topics)
    dashboard_stats["total_alerts"] = len(notification_queue)
    
    # 실제 활동 로그 사용 (최근 10개)
    if activity_log:
        dashboard_stats["recent_activities"] = activity_log[-10:]
    else:
        # 초기 모의 데이터 (활동이 없을 때만)
        dashboard_stats["recent_activities"] = [
            {
                "id": "1",
                "type": "analysis",
                "title": "AI 기술 뉴스 분석",
                "timestamp": "2024-01-15T10:30:00Z",
                "status": "success"
            },
            {
                "id": "2", 
                "type": "monitoring",
                "title": "기술 트렌드 모니터링 시작",
                "timestamp": "2024-01-15T09:15:00Z",
                "status": "active"
            },
            {
                "id": "3",
                "type": "writing",
                "title": "블로그 포스트 작성 완료",
                "timestamp": "2024-01-15T08:45:00Z", 
                "status": "success"
            },
            {
                "id": "4",
                "type": "alert",
                "title": "중요 뉴스 알림",
                "timestamp": "2024-01-15T08:30:00Z",
                "status": "warning"
            }
        ]
    
    return {
        "success": True,
        "data": dashboard_stats,
        "last_updated": datetime.now().isoformat()
    }

# WebSocket 엔드포인트
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 메시지 타입에 따른 처리
            if message.get("type") == "chat":
                # 대화 메시지 처리
                user_message = message.get("content", "")
                ai_response = generate_ai_response(user_message)
                
                response_data = {
                    "type": "ai_response",
                    "content": ai_response,
                    "timestamp": datetime.now().isoformat(),
                    "model": "CORBU.AI"
                }
                
                await manager.send_personal_message(json.dumps(response_data), websocket)
            
            elif message.get("type") == "heartbeat":
                # 하트비트 응답
                await manager.send_personal_message(json.dumps({
                    "type": "heartbeat_response",
                    "timestamp": datetime.now().isoformat()
                }), websocket)
            
            elif message.get("type") == "sentiment_analysis":
                # 감정 분석 요청
                text = message.get("text", "")
                sentiment = "positive" if any(word in text for word in ["좋", "행복", "감사"]) else "neutral"
                
                await manager.send_personal_message(json.dumps({
                    "type": "sentiment_result",
                    "sentiment": sentiment,
                    "confidence": random.uniform(0.7, 0.95),
                    "timestamp": datetime.now().isoformat()
                }), websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    _p = int(os.environ.get("TEST_SERVER_PORT", os.environ.get("PORT", "5000")))
    uvicorn.run(app, host="0.0.0.0", port=_p) 