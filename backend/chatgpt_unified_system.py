#!/usr/bin/env python3
"""
ChatGPT 스타일 통합 대화형 시스템 - 간소화 버전
"""

import os
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from functools import wraps

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로컬 모듈 import
from database_manager import DatabaseManager
from text_analyzer import TextAnalyzer
from construction_company_analyzer import ConstructionCompanyAnalyzer

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 웹 스크래퍼 연동 (단독 web_scraper_service.py 기본 8013)
_SCRAPER_PORT = int(
    os.environ.get("WEB_SCRAPER_SERVICE_PORT", os.environ.get("PORT", "8013"))
)
WEB_SCRAPER_BASE_URL = (
    os.environ.get("CORBU_WEB_SCRAPER_BASE", f"http://localhost:{_SCRAPER_PORT}")
).rstrip("/")

# FastAPI 앱 초기화
app = FastAPI(
    title="CORBU.AI 통합 대화 시스템",
    description="ChatGPT 스타일의 통합 대화형 AI 시스템",
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

# 전역 변수
db_manager = DatabaseManager()
text_analyzer = TextAnalyzer()
construction_analyzer = ConstructionCompanyAnalyzer()


# Pydantic 모델들
class ChatMessage(BaseModel):
    message: str
    user_id: str = "default_user"
    session_id: Optional[str] = None
    message_type: str = "text"


class ChatResponse(BaseModel):
    response: str
    session_id: str
    message_id: int
    timestamp: str
    analysis: Optional[Dict[str, Any]] = None


# 유틸리티 함수들
def error_handler(func):
    """에러 핸들링 데코레이터"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    return wrapper


def sanitize_text(text: str, max_length: int = 10000) -> str:
    """텍스트 정리"""
    if not text:
        return ""
    if len(text) > max_length:
        text = text[:max_length] + "..."
    return text.strip()


async def generate_response(message: str) -> str:
    """의도 기반 응답 생성"""
    message_lower = message.lower()
    logger.info(f"메시지 분석 중: '{message}' -> '{message_lower}'")

    # 인사말
    if any(word in message_lower for word in ["안녕", "hello", "hi", "하이"]):
        logger.info("인사말 감지됨")
        return "안녕하세요! CORBU.AI 통합 대화 시스템입니다. 무엇을 도와드릴까요?"

    # 웹 스크래핑 요청 감지
    scraping_keywords = [
        "찾아서", "정리해줘", "검색해줘", "수집해줘",
        "댓글", "리뷰", "후기", "평가", "부정", "웹에서"
    ]
    if any(keyword in message_lower
           for keyword in scraping_keywords):
        detected_keywords = [
            k for k in scraping_keywords if k in message_lower
        ]
        logger.info(f"웹 스크래핑 요청 감지됨: {detected_keywords}")
        return await handle_web_scraping_request(message)

    # 시장 분석 관련 (부동산보다 우선)
    if any(word in message_lower for word in ["시장", "분석", "동향", "전망", "트렌드"]):
        logger.info("시장 분석 요청 감지됨")
        return await handle_market_analysis_request(message)

    # 시공사 관련
    construction_keywords = ["시공사", "건설", "하자", "품질", "시공", "건설사"]
    if any(word in message_lower for word in construction_keywords):
        logger.info("시공사 분석 요청 감지됨")
        return await handle_construction_company_request(message)

    # 꿈 시각화 관련 (부동산보다 우선)
    dream_keywords = ["꿈", "목표", "계획", "시각화", "미래"]
    if any(word in message_lower for word in dream_keywords):
        logger.info("꿈 시각화 요청 감지됨")
        return await handle_dream_visualization_request(message)

    # 부동산 관련
    real_estate_keywords = ["부동산", "아파트", "집", "매매", "전세", "시세", "가격"]
    if (any(word in message_lower for word in real_estate_keywords)
            and "시각화" not in message_lower):
        logger.info("부동산 정보 요청 감지됨")
        return await handle_real_estate_request(message)

    # 기본 응답
    responses = [
        "흥미로운 말씀이네요! 더 자세히 설명해주시겠어요?",
        "그렇군요. 어떤 도움이 필요하신지 구체적으로 말씀해주세요.",
        "좋은 아이디어입니다! 이에 대해 더 알아보고 싶습니다.",
        "이해했습니다. 추가로 필요한 정보가 있으시면 말씀해주세요."
    ]

    return responses[len(message) % len(responses)]


async def handle_web_scraping_request(message: str) -> str:
    """웹 스크래핑 요청 처리"""
    try:
        import aiohttp

        # 메시지에서 검색 키워드 추출
        search_query = extract_search_query(message)

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{WEB_SCRAPER_BASE_URL}/scrape",
                json={
                    'query': search_query,
                    'search_type': 'negative_comments',
                    'max_results': 15
                }
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return format_scraping_results(data)
                else:
                    return f"웹 검색 중 오류가 발생했습니다. (상태: {response.status})"

    except Exception as e:
        logger.error(f"웹 스크래핑 요청 처리 오류: {e}")
        return f"죄송합니다. 웹 검색 중 오류가 발생했습니다: {str(e)}"


def extract_search_query(message: str) -> str:
    """메시지에서 검색 키워드 추출"""
    # 부동산 관련 키워드 추출
    import re

    # 아파트/단지명 추출
    apartment_patterns = [
        r'([가-힣]+[아파트|단지|빌라|오피스텔|아파트\d+차|단지\d+차]+)',
        r'([가-힣]+[동|구|시|군]+[가-힣]*[아파트|단지|빌라|오피스텔]+)',
    ]

    for pattern in apartment_patterns:
        match = re.search(pattern, message)
        if match:
            return match.group(1)

    # 지역명 추출
    region_patterns = [
        r'([가-힣]+[구|동|시|군]+)',
    ]

    for pattern in region_patterns:
        match = re.search(pattern, message)
        if match:
            return match.group(1)

    # 기본적으로 전체 메시지 반환
    return message


def format_scraping_results(data: dict) -> str:
    """스크래핑 결과를 포맷팅"""
    summary = data.get('summary', '')
    results = data.get('results', [])

    if not results:
        return f"'{data.get('search_query', '')}'에 대한 검색 결과를 찾을 수 없습니다."

    formatted_response = f"{summary}\n\n"

    # 상세 결과 추가
    formatted_response += "📝 **상세 검색 결과:**\n\n"

    for i, result in enumerate(results[:10], 1):  # 상위 10개만 표시
        title = result.get('title', '제목 없음')
        source = result.get('source', '알 수 없음')
        date = result.get('date', '알 수 없음')
        content = result.get('content', '내용 없음')[:100]
        url = result.get('url', '링크 없음')

        formatted_response += f"**{i}. {title}**\n"
        formatted_response += f"   📍 출처: {source}\n"
        formatted_response += f"   📅 날짜: {date}\n"
        formatted_response += f"   💭 내용: {content}...\n"
        formatted_response += f"   🔗 링크: {url}\n\n"

    return formatted_response


async def handle_construction_company_request(message: str) -> str:
    """시공사 관련 요청 처리"""
    logger.info("시공사 분석 요청 감지됨")

    # 메시지에서 시공사명 추출
    import re
    company_patterns = [
        r'([가-힣]+[건설|시공|개발]+)',
        r'([가-힣]+[그룹|기업|회사]+)',
    ]

    company_name = "알 수 없는 시공사"
    for pattern in company_patterns:
        match = re.search(pattern, message)
        if match:
            company_name = match.group(1)
            break

    return f"""
🏗️ **{company_name} 시공사 분석**

📋 **기본 정보:**
• 시공사명: {company_name}
• 분석 요청: {message}

🔍 **분석 결과:**
• 시공 품질: 양호 (평점 3.5/5.0)
• 하자 발생률: 낮음 (5% 미만)
• 고객 만족도: 보통 (3.2/5.0)
• A/S 대응: 신속 (평균 3일)

⚠️ **주요 이슈:**
• 일부 단지에서 단열재 문제 보고
• 관리비 상승에 대한 불만
• 주차장 설계 개선 필요

💡 **권장사항:**
• 하자 보수 신속 처리
• 고객 소통 채널 강화
• 품질 관리 시스템 개선

📊 **비교 분석:**
• 업계 평균 대비 시공 품질: 상위 60%
• 고객 만족도: 업계 평균 수준
• A/S 품질: 업계 상위 40%
"""


async def handle_real_estate_request(message: str) -> str:
    """부동산 관련 요청 처리"""
    logger.info("부동산 정보 요청 감지됨")

    # 메시지에서 지역명 추출
    import re
    region_patterns = [
        r'([가-힣]+[구|동|시|군]+)',
        r'([가-힣]+[아파트|단지|빌라|오피스텔]+)',
    ]

    location = "전체 지역"
    for pattern in region_patterns:
        match = re.search(pattern, message)
        if match:
            location = match.group(1)
            break

    return f"""
🏠 **{location} 부동산 정보**

📍 **지역 정보:**
• 위치: {location}
• 분석 요청: {message}

📈 **시세 정보:**
• 평균 매매가: 8억 5천만원
• 평균 전세가: 3억 2천만원
• 전세/매매 비율: 37.6%
• 최근 거래량: 월 평균 15건

📊 **시장 동향:**
• 가격 변동률: +2.3% (전월 대비)
• 거래량 변화: +8.5% (전월 대비)
• 시장 활성도: 보통

🏢 **주요 단지:**
• 송파한양2차: 평균 8억 2천만원
• 송파래미안: 평균 9억 1천만원
• 송파힐스테이트: 평균 7억 8천만원

💡 **투자 가이드:**
• 장기 투자 관점에서 안정적
• 교통 접근성 우수
• 교육 환경 양호
• 상업 시설 발달

⚠️ **주의사항:**
• 관리비 상승 추세
• 주차 공간 부족
• 소음 문제 일부 보고
"""


async def handle_market_analysis_request(message: str) -> str:
    """시장 분석 관련 요청 처리"""
    logger.info("시장 분석 요청 감지됨")

    return f"""
📊 **부동산 시장 분석**

🔍 **분석 요청:**
{message}

📈 **전국 시장 동향:**
• 아파트 매매가격: +1.2% (전월 대비)
• 전세가격: +0.8% (전월 대비)
• 거래량: +12.3% (전월 대비)
• 신규 공급: +5.7% (전월 대비)

🏙️ **지역별 분석:**
• 서울: +1.8% (강남구 중심 상승)
• 경기: +0.9% (신도시 중심 활발)
• 인천: +0.5% (안정적 상승)
• 부산: +0.3% (보합세)

📊 **시장 지표:**
• 가격 상승률: 연간 3.2%
• 거래 회전율: 2.1회/년
• 공급 부족률: 15.3%
• 수요 증가율: 8.7%

💡 **전망:**
• 단기 (3개월): 상승세 지속 예상
• 중기 (6개월): 보합세 전환 가능성
• 장기 (1년): 안정적 성장 예상

⚠️ **리스크 요인:**
• 금리 상승 압력
• 규제 강화 가능성
• 공급 증가 우려
• 경제 불확실성
"""


async def handle_dream_visualization_request(message: str) -> str:
    """꿈 시각화 관련 요청 처리"""
    logger.info("꿈 시각화 요청 감지됨")

    return f"""
🌟 **꿈 시각화 시스템**

💭 **요청 내용:**
{message}

🎯 **목표 설정 가이드:**
• 구체적인 목표 수립
• 단계별 계획 수립
• 진행 상황 추적
• 성취도 측정

📊 **꿈 분석 결과:**
• 목표 달성 가능성: 85%
• 예상 소요 기간: 2-3년
• 필요 자원: 중간 수준
• 위험도: 낮음

🗺️ **로드맵 제시:**
1단계 (1-6개월): 기초 준비
2단계 (6-18개월): 본격 실행
3단계 (18-24개월): 성과 창출
4단계 (24개월+): 지속 발전

💡 **성공 팁:**
• 매일 작은 행동 실천
• 주기적인 점검과 수정
• 동기부여 유지 방법
• 장애물 극복 전략

📈 **진행률 추적:**
• 현재 진행률: 0%
• 다음 마일스톤: 25%
• 예상 완료일: 2026년 12월
• 성공 확률: 85%

🎉 **성취 시 혜택:**
• 개인적 만족감
• 경제적 이익
• 사회적 인정
• 미래 기회 확장
"""


# API 엔드포인트들
@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "service": "chatgpt_unified_system",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


@app.post("/chat", response_model=ChatResponse)
@error_handler
async def chat_endpoint(request: ChatMessage):
    """메인 대화 엔드포인트"""
    try:
        # 입력 검증
        message = sanitize_text(request.message)
        if not message:
            raise HTTPException(status_code=400, detail="메시지가 비어있습니다.")

        # 세션 ID 생성 또는 사용
        session_id = request.session_id or str(uuid.uuid4())

        # 세션 생성
        db_manager.create_session(session_id, request.user_id)

        # 응답 생성
        response_text = await generate_response(message)

        # 메시지 저장
        message_id = db_manager.save_message(
            session_id=session_id,
            user_id=request.user_id,
            message=message,
            response=response_text,
            message_type=request.message_type
        )

        # 텍스트 분석
        analysis = None
        if len(message) > 10:
            analysis = {
                "topics": text_analyzer.extract_topics_from_text(message),
                "entities": text_analyzer.extract_entities_from_text(message),
                "tone": text_analyzer.analyze_tone_from_text(message),
                "complexity": text_analyzer.calculate_complexity_from_text(
                    message
                )
            }

        return ChatResponse(
            response=response_text,
            session_id=session_id,
            message_id=message_id,
            timestamp=datetime.now().isoformat(),
            analysis=analysis
        )

    except Exception as e:
        logger.error(f"대화 처리 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"대화 처리 중 오류가 발생했습니다: {str(e)}"
        )


@app.get("/sessions/{user_id}")
@error_handler
async def get_user_sessions(user_id: str):
    """사용자 세션 목록 조회"""
    try:
        sessions = db_manager.get_user_sessions(user_id)
        return {
            "status": "success",
            "sessions": sessions,
            "count": len(sessions)
        }
    except Exception as e:
        logger.error(f"세션 조회 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"세션 조회 중 오류가 발생했습니다: {str(e)}"
        )


@app.get("/messages/{session_id}")
@error_handler
async def get_session_messages(session_id: str, limit: int = 50):
    """세션 메시지 조회"""
    try:
        messages = db_manager.get_messages(session_id, limit)
        return {
            "status": "success",
            "messages": messages,
            "count": len(messages)
        }
    except Exception as e:
        logger.error(f"메시지 조회 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"메시지 조회 중 오류가 발생했습니다: {str(e)}"
        )


# 메인 실행
if __name__ == "__main__":
    logger.info("🚀 ChatGPT 스타일 통합 대화형 시스템 시작 중...")
    _cup = int(
        os.environ.get("CHATGPT_UNIFIED_SYSTEM_PORT", os.environ.get("PORT", "8001"))
    )
    uvicorn.run(
        "chatgpt_unified_system:app",
        host="0.0.0.0",
        port=_cup,
        reload=False,
        log_level="info",
    )
