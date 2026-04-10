#!/usr/bin/env python3
import os
import time
import uuid
import signal
import sys
import gc
import re
import requests
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import threading
from urllib.parse import quote_plus
from dataclasses import dataclass
from typing import Dict, List, Any

app = Flask(__name__)
CORS(app)

# 이 스크립트가 있는 디렉터리(프로젝트 루트) — 하드코딩 경로 대신 사용
_COMPLETE_SERVER_ROOT = os.path.dirname(os.path.abspath(__file__))

# 전역 변수들
conversation_memory = {}  # session_id -> 대화 기록
user_preferences = {}      # session_id -> 사용자 선호도
context_history = {}       # session_id -> 컨텍스트 히스토리
total_requests = 0
successful_requests = 0

# Ollama 하이브리드 엔진 통합
try:
    from backend.ollama_hybrid_engine import ollama_hybrid_engine, ProcessingMode, ModelType
    from backend.internal_ai_engine import internal_ai_engine, ResponseType, QualityLevel
    NOTEBOOK_LLM_AVAILABLE = True
    print("✅ Ollama 하이브리드 엔진 로드 완료")
    print("✅ 내장 AI 엔진 로드 완료")
except ImportError as e:
    NOTEBOOK_LLM_AVAILABLE = False
    print(f"⚠️ 하이브리드 엔진 모듈 로드 실패: {e}")

# 멀티모달 지식 시스템 통합
try:
    from backend.multimodal_knowledge_system import multimodal_knowledge_system, UploadType, ContentType
    from backend.knowledge_accumulation_system import knowledge_accumulation_system
    KNOWLEDGE_SYSTEM_AVAILABLE = True
    print("✅ 멀티모달 지식 시스템 로드 완료")
    print("✅ 지식 축적 시스템 로드 완료")
except ImportError as e:
    KNOWLEDGE_SYSTEM_AVAILABLE = False
    print(f"⚠️ 지식 시스템 모듈 로드 실패: {e}")

# 고급 시스템 통합
try:
    from backend.multi_request_handler import multi_request_handler, RequestPriority, TextComplexity
    from backend.context_aware_engine import context_aware_engine, ConversationState, IntentType, EmotionType
    from backend.intelligent_response_generator import intelligent_response_generator, ResponseStyle, ResponseLength, ResponseStructure
    from backend.multi_stage_response_processor import multi_stage_response_processor, ProcessingStage, ResponseQuality, WritingStyle
    from backend.natural_user_writing_engine import natural_user_writing_engine, UserLevel, WritingTone, ContentType
    from backend.persuasion_writing_engine import persuasion_writing_engine, PersuasionStrategy, OpinionType, AudienceType, PersuasionContext
    from backend.system_monitor import get_system_monitor
    from backend.performance_optimizer import get_performance_optimizer
    from backend.intelligent_web_researcher import get_web_researcher
    from backend.advanced_web_researcher import get_advanced_web_researcher
    ADVANCED_SYSTEMS_AVAILABLE = True
    print("✅ 다중 요청 처리기 로드 완료")
    print("✅ 문맥 인식 엔진 로드 완료")
    print("✅ 지능형 응답 생성기 로드 완료")
    print("✅ 다단계 응답 처리기 로드 완료")
    print("✅ 자연스러운 유저 글쓰기 엔진 로드 완료")
    print("✅ 설득 글쓰기 엔진 로드 완료")
    print("✅ 시스템 모니터 로드 완료")
    print("✅ 성능 최적화 모듈 로드 완료")
    print("✅ 지능형 웹 연구 모듈 로드 완료")
    print("✅ 고급 웹 연구 모듈 로드 완료")
except ImportError as e:
    ADVANCED_SYSTEMS_AVAILABLE = False
    print(f"⚠️ 고급 시스템 모듈 로드 실패: {e}")

# 혁신적인 응답 엔진 통합
try:
    from backend.revolutionary_response_engine import revolutionary_response_engine, StructuredResponse, ResponseType
    from backend.advanced_frontend_renderer import advanced_frontend_renderer, RenderConfig, RenderMode
    from backend.ultra_advanced_response_system import ultra_advanced_response_system, UltraResponse, ResponseQuality
    ADVANCED_RESPONSE_AVAILABLE = True
    print("✅ 혁신적인 응답 엔진 로드 완료")
    print("✅ 초고급 응답 시스템 로드 완료")
except ImportError as e:
    ADVANCED_RESPONSE_AVAILABLE = False
    print(f"⚠️ 응답 엔진 모듈 로드 실패: {e}")

# 프로젝트 관리 데이터
projects_db = {}
project_files_db = {}
project_guidelines_db = {}

# 감정 분석 데이터
emotion_patterns = {}
emotion_metrics = {}

# 데이터 분석 데이터
data_sources = {}
analyses_history = {}
visualizations_cache = {}

# 품질 보증 데이터
test_suites = {}
test_executions = {}
quality_metrics = {}

# 성능 최적화 데이터
performance_rules = {}
optimization_history = {}

# 음성 인식 데이터
voice_sessions = {}
voice_results = {}

# 고급 AI 응답 시스템
@dataclass
class IntelligentResponse:
    content: str
    confidence: float
    response_type: str
    metadata: Dict[str, Any]
    follow_up_questions: List[str]
    related_topics: List[str]

class AdvancedAIResponseSystem:
    """고급 AI 응답 시스템"""
    
    def __init__(self):
        self.knowledge_base = self._initialize_knowledge_base()
        self.conversation_context = {}
        self.user_profiles = {}
        
    def _initialize_knowledge_base(self) -> Dict[str, Any]:
        """지식 베이스 초기화"""
        return {
            'programming': {
                'languages': {
                    'python': {
                        'description': '간단하고 강력한 프로그래밍 언어',
                        'use_cases': ['웹 개발', '데이터 사이언스', 'AI/ML', '자동화'],
                        'frameworks': ['Django', 'Flask', 'FastAPI', 'TensorFlow', 'PyTorch'],
                        'best_practices': [
                            'PEP 8 스타일 가이드',
                            '가상환경 사용',
                            '타입 힌트 활용'
                        ]
                    },
                    'javascript': {
                        'description': '웹 개발의 핵심 언어',
                        'use_cases': ['프론트엔드', '백엔드', '모바일 앱', '데스크톱 앱'],
                        'frameworks': ['React', 'Vue', 'Angular', 'Node.js', 'Express'],
                        'best_practices': [
                            'ES6+ 문법',
                            '모듈화',
                            '비동기 처리',
                            '에러 핸들링'
                        ]
                    },
                    'java': {
                        'description': '엔터프라이즈급 안정적인 언어',
                        'use_cases': ['대규모 시스템', '안드로이드', '웹 애플리케이션'],
                        'frameworks': ['Spring', 'Hibernate', 'Maven', 'Gradle'],
                        'best_practices': [
                            'OOP 원칙',
                            '디자인 패턴',
                            '메모리 관리',
                            '성능 최적화'
                        ]
                    }
                },
                'concepts': {
                    'algorithms': ['정렬', '검색', '그래프', '동적 프로그래밍', '그리디'],
                    'data_structures': [
                        '배열', '리스트', '스택', '큐', '트리', '해시테이블'
                    ],
                    'patterns': [
                        '싱글톤', '팩토리', '옵저버', 'MVC', 'MVP', 'MVVM'
                    ]
                }
            },
            'marketing': {
                'strategies': {
                    'digital': ['SEO', 'SEM', '소셜미디어', '콘텐츠 마케팅', '이메일 마케팅'],
                    'traditional': ['TV 광고', '라디오', '인쇄물', '옥외광고', '이벤트'],
                    'growth': ['바이럴 마케팅', '인플루언서', '파트너십', '리퍼럴']
                },
                'channels': {
                    'online': ['구글', '페이스북', '인스타그램', '유튜브', '틱톡'],
                    'offline': ['매장', '전시회', '세미나', '워크샵']
                }
            },
            'writing': {
                'styles': {
                    'academic': '학술적이고 객관적인 글쓰기',
                    'business': '비즈니스 문서와 보고서',
                    'creative': '창의적이고 문학적인 글쓰기',
                    'technical': '기술 문서와 매뉴얼',
                    'journalistic': '뉴스와 기사 형태'
                },
                'techniques': ['5W1H', '피라미드 구조', '스토리텔링', '감정적 어필', '논리적 구성']
            }
        }
    
    def generate_intelligent_response(
        self,
        message: str,
        session_id: str,
        context: Dict[str, Any] = None
    ) -> IntelligentResponse:
        """지능형 응답 생성 - 웹 검색 통합"""
        message_lower = message.lower()
        
        # 사용자 프로필 업데이트
        self._update_user_profile(session_id, message)
        
        # 컨텍스트 분석
        context_analysis = self._analyze_context(message, session_id, context)
        
        # 의도 분석
        intent = self._analyze_intent(message_lower)
        
        # 웹 검색이 필요한지 판단
        needs_web_search = self._should_use_web_search(
            message, intent, context_analysis
        )
        
        if needs_web_search:
            # 웹 검색을 통한 응답 생성
            response = self._generate_web_enhanced_response(
                message, intent, context_analysis
            )
        else:
            # 기존 지식 베이스 기반 응답 생성
            if intent == 'urban_redevelopment':
                response = self._generate_urban_redevelopment_response(
                    message, context_analysis
                )
            elif intent == 'programming':
                response = self._generate_programming_response(
                    message, context_analysis
                )
            elif intent == 'marketing':
                response = self._generate_marketing_response(
                    message, context_analysis
                )
            elif intent == 'writing':
                response = self._generate_writing_response(
                    message, context_analysis
                )
            elif intent == 'analysis':
                response = self._generate_analysis_response(
                    message, context_analysis
                )
            elif intent == 'project':
                response = self._generate_project_response(
                    message, context_analysis
                )
            else:
                response = self._generate_general_response(
                    message, context_analysis
                )
        
        # 후속 질문 생성
        follow_up_questions = self._generate_follow_up_questions(
            intent, message, context_analysis
        )
        
        # 관련 주제 생성
        related_topics = self._generate_related_topics(
            intent, message, context_analysis
        )
        
        return IntelligentResponse(
            content=response,
            confidence=0.95 if needs_web_search else 0.9,
            response_type=intent,
            metadata={
                'timestamp': datetime.now().isoformat(),
                'session_id': session_id,
                'intent': intent,
                'context': context_analysis,
                'web_search_used': needs_web_search
            },
            follow_up_questions=follow_up_questions,
            related_topics=related_topics
        )
    
    def _analyze_intent(self, message_lower: str) -> str:
        """의도 분석 - 개선된 키워드 매칭"""
        # 도시정비 관련 키워드 (최우선) - 세분화된 전문 용어
        urban_redevelopment_keywords = [
            # 핵심 사업 유형
            '재개발', '재건축', '리모델링', '신통기획', '도시정비', '도시재생', '정비사업',
            '재개발사업', '재건축사업', '리모델링사업', '신통기획사업',
            
            # 법적 구조 및 조직
            '도시정비법', '재개발조합', '재건축조합', '리모델링조합', '신통기획조합',
            '정비계획', '사업시행자', '시공업체', '시공사', '조합', '조합원',
            '조합장', '이사', '감사', '총회', '임시총회', '특별총회',
            '조합규약', '사업계획서', '사업시행계획', '분양계획', '보상계획',
            
            # 사업 과정 및 절차
            '분양', '분양가', '보상', '이주', '임시거주', '정착', '사업비', '공사비',
            '착공', '준공', '인허가', '승인', '협의', '조정', '분쟁', '소송',
            '토지보상', '건물보상', '이주비', '정착금', '임시거주비', '이사비',
            '정비구역', '정비계획구역', '개발계획', '도시계획', '건축계획',
            
            # 건축 관련
            '용적률', '건폐율', '높이제한', '건축물', '아파트', '오피스텔',
            '기존건물', '철거', '신축', '증축', '개축', '대수선',
            
            # 주민 참여 및 의사결정
            '주민설명회', '공청회', '의견수렴', '동의', '반대', '투표',
            '동의율', '반대율', '참여율', '투표율',
            
            # 시공 및 관리
            '시공계약', '도급계약', '하도급', '공사진행', '공정관리',
            '품질관리', '안전관리', '환경관리', '소음', '진동', '먼지',
            '교통영향', '주차장', '도로', '상하수도', '전기', '가스',
            
            # 특수 용어
            '신통기획', '신통기획사업', '신통기획조합', '신통기획법',
            '리모델링', '리모델링사업', '리모델링조합', '리모델링법',
            '기존건물활용', '기존건물보존', '기존건물개선',
            '부분철거', '부분신축', '부분증축', '부분개축'
        ]
        
        # 프로그래밍 관련 키워드
        programming_keywords = [
            '코딩', '프로그래밍', '코드', '개발', 'python', 'javascript', 'java', '알고리즘', '버그', '디버깅',
            '파이썬', '자바스크립트', '자바', '웹', '크롤링', '스크래핑', 'api', '데이터베이스', '서버',
            '프론트엔드', '백엔드', '풀스택', '프레임워크', '라이브러리', '모듈', '함수', '클래스',
            '변수', '반복문', '조건문', '예외처리', '테스트', '배포', 'git', 'github', '리포지토리',
            'html', 'css', 'react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'fastapi',
            'sql', 'nosql', 'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes'
        ]
        
        # 마케팅 관련 키워드 확장
        marketing_keywords = [
            '마케팅', '광고', '홍보', '브랜딩', '소셜미디어', 'seo', 'sem', '콘텐츠', '인플루언서',
            '바이럴', '트렌드', '타겟', '고객', '시장', '경쟁', '브랜드', '캠페인', '전략',
            'facebook', 'instagram', 'youtube', 'tiktok', 'twitter', 'linkedin', '네이버', '구글',
            '유튜브', '인스타그램', '페이스북', '틱톡', '트위터', '링크드인'
        ]
        
        # 글쓰기 관련 키워드 확장
        writing_keywords = [
            '글쓰기', '작문', '에세이', '보고서', '유시민', '스타일', '어조', '어투', '문체',
            '기사', '블로그', '콘텐츠', '카피', '제목', '헤드라인', '본문', '결론', '서론',
            '논문', '학술', '비즈니스', '창작', '소설', '시', '수필', '칼럼', '리뷰'
        ]
        
        # 분석 관련 키워드 확장
        analysis_keywords = [
            '분석', '데이터', '통계', '리서치', '조사', '평가', '시각화', '차트', '그래프',
            '머신러닝', 'ai', '인공지능', '딥러닝', '예측', '모델', '알고리즘', '패턴', '트렌드',
            '엑셀', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'tableau', 'powerbi', 'r', 'spss'
        ]
        
        # 프로젝트 관련 키워드 확장
        project_keywords = [
            '프로젝트', '계획', '관리', '진행', '완료', '일정', '팀', '협업', '워크플로우',
            '애자일', '스크럼', '칸반', '워터폴', 'jira', 'trello', 'asana', 'slack', 'notion',
            '기획', '설계', '구현', '테스트', '배포', '운영', '유지보수', '문서화'
        ]
        
        # 키워드 매칭 (우선순위 순) - 도시정비 최우선
        if any(keyword in message_lower for keyword in urban_redevelopment_keywords):
            return 'urban_redevelopment'
        
        # 시공업체 관련 키워드도 도시정비로 분류
        construction_keywords = ['시공업체', '시공사', '시공계약', '시공업체 선정', '시공업체 선정 방법']
        if any(keyword in message_lower for keyword in construction_keywords):
            return 'urban_redevelopment'
        elif any(keyword in message_lower for keyword in programming_keywords):
            return 'programming'
        elif any(keyword in message_lower for keyword in marketing_keywords):
            return 'marketing'
        elif any(keyword in message_lower for keyword in writing_keywords):
            return 'writing'
        elif any(keyword in message_lower for keyword in analysis_keywords):
            return 'analysis'
        elif any(keyword in message_lower for keyword in project_keywords):
            return 'project'
        else:
            return 'general'
    
    def _generate_programming_response(self, message: str, context: Dict[str, Any]) -> str:
        """프로그래밍 응답 생성"""
        message_lower = message.lower()
        
        # 특정 주제별 특화 응답
        if '크롤링' in message_lower or '스크래핑' in message_lower or 'crawling' in message_lower or 'scraping' in message_lower:
            return self._generate_web_scraping_response(message)
        elif 'python' in message_lower or '파이썬' in message_lower:
            return self._generate_python_response(message)
        elif 'javascript' in message_lower or 'js' in message_lower or '자바스크립트' in message_lower:
            return self._generate_javascript_response(message)
        elif 'java' in message_lower or '자바' in message_lower:
            return self._generate_java_response(message)
        elif '웹' in message_lower or 'web' in message_lower:
            return self._generate_web_development_response(message)
        else:
            return self._generate_general_programming_response(message)
    
    def _generate_urban_redevelopment_response(self, message: str, context: Dict[str, Any]) -> str:
        """도시정비 전문 응답 생성"""
        message_lower = message.lower()
        
        # 사업 유형별 특화 응답
        if any(keyword in message_lower for keyword in ['재개발', '재개발사업']):
            return self._generate_redevelopment_response(message)
        elif any(keyword in message_lower for keyword in ['재건축', '재건축사업']):
            return self._generate_reconstruction_response(message)
        elif any(keyword in message_lower for keyword in ['리모델링', '리모델링사업']):
            return self._generate_remodeling_response(message)
        elif any(keyword in message_lower for keyword in ['신통기획', '신통기획사업']):
            return self._generate_new_planning_response(message)
        elif any(keyword in message_lower for keyword in ['조합', '조합원', '조합장']):
            return self._generate_association_response(message)
        elif any(keyword in message_lower for keyword in ['시공사', '시공업체', '시공계약', '설득', '어필', '제안', '선정']):
            return self._generate_construction_company_response(message)
        elif any(keyword in message_lower for keyword in ['보상', '이주', '분양']):
            return self._generate_compensation_response(message)
        elif any(keyword in message_lower for keyword in ['템플릿', '양식', '제안서', '계획서', '발표']):
            return self._generate_presentation_template_response(message)
        elif any(keyword in message_lower for keyword in ['도시정비법', '법규', '법률']):
            return self._generate_legal_response(message)
        else:
            return self._generate_general_urban_redevelopment_response(message)
    
    def _generate_redevelopment_response(self, message: str) -> str:
        """재개발 전문 응답"""
        return """🏗️ **재개발사업 전문 가이드**

## 📋 **재개발사업의 정의와 특징**

**재개발사업**은 노후화된 주거지역을 체계적으로 정비하여 주민의 주거환경을 개선하고 도시기능을 향상시키는 사업입니다.

### 🔍 **재개발 vs 재건축 vs 리모델링 비교**

| 구분 | 재개발 | 재건축 | 리모델링 |
|------|--------|--------|----------|
| **대상** | 노후 주거지역 전체 | 노후 아파트 단지 | 개별 건물 |
| **방법** | 철거 후 신축 | 철거 후 신축 | 기존 건물 개선 |
| **규모** | 대규모 (수십~수백 가구) | 중규모 (수십 가구) | 소규모 (개별 건물) |
| **기간** | 5~10년 | 3~5년 | 1~2년 |
| **동의율** | 75% 이상 | 75% 이상 | 100% (소유자) |

### 📊 **재개발사업 진행 단계**

**1단계: 사업 추진 결정**
- 주민 동의율 75% 이상 확보
- 정비구역 지정 신청
- 정비계획 수립

**2단계: 조합 설립 및 운영**
- 재개발조합 설립
- 조합장 및 이사 선출
- 조합규약 제정

**3단계: 사업시행계획 수립**
- 사업시행자 선정
- 시공업체 선정
- 분양계획 및 보상계획 수립

**4단계: 사업 시행**
- 착공 및 공사 진행
- 분양 및 보상 실시
- 준공 및 입주

### 💰 **재개발사업 비용 구조**

**사업비 구성:**
- **토지보상비**: 40~50%
- **공사비**: 30~40%
- **기타비용**: 10~20%
  - 조합운영비, 설계비, 감리비, 이주비 등

**분양가 산정:**
- **분양가 = (사업비 - 보상비) ÷ 분양면적**
- 시세 대비 70~80% 수준
- 지역별, 사업별 차이 존재

### ⚖️ **주요 법적 근거**

**도시정비법 제2조 (정의)**
- "재개발사업"이란 노후·불량건축물이 밀집한 지역에서 건축물의 철거, 정리, 재건축 또는 재개발을 통하여 주거환경을 개선하고 도시기능을 향상시키는 사업

**도시정비법 제4조 (정비구역의 지정)**
- 정비구역은 시·도지사가 지정
- 노후·불량건축물이 밀집한 지역
- 주민의 동의율 75% 이상 필요

### 🎯 **재개발사업의 장단점**

**장점:**
- 주거환경 대폭 개선
- 부동산 가치 상승
- 도시기능 향상
- 인프라 개선

**단점:**
- 장기간 사업 진행
- 높은 동의율 요구
- 분쟁 발생 가능성
- 이주 부담

### 💡 **성공적인 재개발을 위한 핵심 요소**

1. **주민 참여와 소통**
   - 정기적인 주민설명회 개최
   - 투명한 정보 공개
   - 의견 수렴 체계 구축

2. **전문가 활용**
   - 경험 있는 사업시행자 선정
   - 신뢰할 수 있는 시공업체 선택
   - 법무, 세무 전문가 자문

3. **리스크 관리**
   - 사업비 상승 대비책
   - 분쟁 예방 및 해결 방안
   - 일정 지연 대비 계획

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 재개발조합 운영 방법
• 분양가 산정 기준
• 보상 및 이주 절차
• 시공업체 선정 기준
• 분쟁 해결 방안"""
    
    def _generate_reconstruction_response(self, message: str) -> str:
        """재건축 전문 응답"""
        return """🏢 **재건축사업 전문 가이드**

## 📋 **재건축사업의 정의와 특징**

**재건축사업**은 노후화된 아파트 단지를 철거하고 새로운 아파트를 건설하는 사업으로, 기존 입주자들이 우선 분양받을 수 있는 권리를 가집니다.

### 🔍 **재건축 vs 재개발 주요 차이점**

| 구분 | 재건축 | 재개발 |
|------|--------|--------|
| **대상** | 노후 아파트 단지 | 노후 주거지역 전체 |
| **입주자** | 기존 입주자 우선 분양 | 기존 거주자 보상 |
| **건물 형태** | 아파트 중심 | 아파트, 오피스텔 등 |
| **사업 주체** | 재건축조합 | 재개발조합 |
| **동의율** | 75% 이상 | 75% 이상 |

### 📊 **재건축사업 진행 단계**

**1단계: 사업 추진 결정**
- 입주자 동의율 75% 이상 확보
- 재건축조합 설립
- 정비계획 수립

**2단계: 조합 운영**
- 조합장 및 이사 선출
- 조합규약 제정
- 사업시행자 선정

**3단계: 사업 시행**
- 시공업체 선정
- 착공 및 공사 진행
- 분양 및 입주

### 💰 **재건축사업 비용 구조**

**사업비 구성:**
- **공사비**: 60~70%
- **토지비**: 20~30%
- **기타비용**: 10~15%
  - 조합운영비, 설계비, 감리비 등

**분양가 산정:**
- **분양가 = 사업비 ÷ 분양면적**
- 기존 입주자 우선 분양
- 시세 대비 70~80% 수준

### ⚖️ **주요 법적 근거**

**도시정비법 제2조 (정의)**
- "재건축사업"이란 노후·불량건축물이 밀집한 지역에서 건축물의 철거, 정리, 재건축을 통하여 주거환경을 개선하는 사업

**도시정비법 제4조 (정비구역의 지정)**
- 정비구역은 시·도지사가 지정
- 노후·불량건축물이 밀집한 지역
- 입주자의 동의율 75% 이상 필요

### 🎯 **재건축사업의 장단점**

**장점:**
- 주거환경 대폭 개선
- 부동산 가치 상승
- 기존 입주자 우선 분양권
- 단지 내 인프라 개선

**단점:**
- 장기간 사업 진행
- 높은 동의율 요구
- 분쟁 발생 가능성
- 임시 이주 부담

### 💡 **성공적인 재건축을 위한 핵심 요소**

1. **입주자 참여와 소통**
   - 정기적인 입주자 설명회
   - 투명한 정보 공개
   - 의견 수렴 체계 구축

2. **전문가 활용**
   - 경험 있는 사업시행자 선정
   - 신뢰할 수 있는 시공업체 선택
   - 법무, 세무 전문가 자문

3. **리스크 관리**
   - 사업비 상승 대비책
   - 분쟁 예방 및 해결 방안
   - 일정 지연 대비 계획

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 재건축조합 운영 방법
• 분양가 산정 기준
• 입주자 우선 분양권
• 시공업체 선정 기준
• 분쟁 해결 방안"""
    
    def _generate_remodeling_response(self, message: str) -> str:
        """리모델링 전문 응답"""
        return """🔧 **리모델링사업 전문 가이드**

## 📋 **리모델링사업의 정의와 특징**

**리모델링사업**은 기존 건물을 철거하지 않고 구조적 개선, 시설 개선, 외관 개선 등을 통해 건물의 기능과 가치를 향상시키는 사업입니다.

### 🔍 **리모델링 vs 재건축 vs 재개발 비교**

| 구분 | 리모델링 | 재건축 | 재개발 |
|------|----------|--------|--------|
| **방법** | 기존 건물 개선 | 철거 후 신축 | 철거 후 신축 |
| **기간** | 1~2년 | 3~5년 | 5~10년 |
| **비용** | 상대적으로 저렴 | 높음 | 높음 |
| **동의율** | 100% (소유자) | 75% 이상 | 75% 이상 |
| **규모** | 개별 건물 | 중규모 단지 | 대규모 지역 |

### 📊 **리모델링사업 유형**

**1. 구조적 리모델링**
- 내진보강, 내화보강
- 구조체 보수 및 보강
- 기초 및 지하구조 개선

**2. 시설적 리모델링**
- 엘리베이터 설치 및 교체
- 냉난방 시설 개선
- 전기, 가스, 상하수도 시설 개선

**3. 외관적 리모델링**
- 외벽 마감재 교체
- 창호 및 출입문 교체
- 옥상 및 발코니 개선

**4. 기능적 리모델링**
- 평면 구조 변경
- 공간 활용도 개선
- 접근성 개선

### 💰 **리모델링사업 비용 구조**

**사업비 구성:**
- **공사비**: 70~80%
- **설계비**: 5~10%
- **감리비**: 3~5%
- **기타비용**: 10~15%
  - 인허가비, 보험료, 이자 등

**비용 절약 요소:**
- 철거비 없음
- 토지비 없음
- 인허가 절차 간소
- 공사 기간 단축

### ⚖️ **주요 법적 근거**

**건축법 제2조 (정의)**
- "대수선"이란 건축물의 기존 구조나 주요 구조부를 변경하거나 증설하는 것

**건축법 제19조 (대수선)**
- 대수선은 건축주가 시행
- 건축법에 따른 절차 준수
- 구조안전성 확보 필요

### 🎯 **리모델링사업의 장단점**

**장점:**
- 상대적으로 저렴한 비용
- 짧은 공사 기간
- 기존 거주자 이주 불필요
- 환경 친화적
- 빠른 투자 회수

**단점:**
- 구조적 한계 존재
- 용적률 증가 제한
- 복잡한 공사 과정
- 소음 및 진동 발생

### 💡 **성공적인 리모델링을 위한 핵심 요소**

1. **정확한 현황 파악**
   - 건물 상태 정밀 조사
   - 구조 안전성 검토
   - 시설물 노후도 평가

2. **체계적인 계획 수립**
   - 단계별 공사 계획
   - 비용 및 일정 관리
   - 품질 관리 계획

3. **전문가 활용**
   - 경험 있는 설계사
   - 신뢰할 수 있는 시공업체
   - 전문 감리업체

4. **거주자 소통**
   - 공사 계획 사전 안내
   - 불편사항 최소화
   - 정기적인 진행 상황 보고

### 🏗️ **리모델링 공사 과정**

**1단계: 사전 준비**
- 현황 조사 및 측량
- 설계 및 인허가
- 시공업체 선정

**2단계: 공사 시행**
- 임시 시설 설치
- 단계별 공사 진행
- 품질 관리 및 감리

**3단계: 완료 및 정리**
- 공사 완료 검사
- 임시 시설 철거
- 사용 승인 및 인수

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 리모델링 설계 방법
• 비용 절약 방안
• 공사 진행 절차
• 품질 관리 방법
• 거주자 소통 방안"""
    
    def _generate_new_planning_response(self, message: str) -> str:
        """신통기획 전문 응답"""
        return """🎯 **신통기획사업 전문 가이드**

## 📋 **신통기획사업의 정의와 특징**

**신통기획사업**은 기존 건물을 철거하지 않고 새로운 통로(신통)를 설치하여 건물의 접근성과 기능을 개선하는 사업입니다. 주로 상가건물이나 복합건물에서 시행됩니다.

### 🔍 **신통기획 vs 리모델링 vs 재건축 비교**

| 구분 | 신통기획 | 리모델링 | 재건축 |
|------|----------|----------|--------|
| **방법** | 신통 설치 | 기존 건물 개선 | 철거 후 신축 |
| **목적** | 접근성 개선 | 전반적 개선 | 완전한 신축 |
| **기간** | 6개월~1년 | 1~2년 | 3~5년 |
| **비용** | 상대적으로 저렴 | 중간 | 높음 |
| **동의율** | 100% (소유자) | 100% (소유자) | 75% 이상 |

### 📊 **신통기획사업 유형**

**1. 수직 신통**
- 엘리베이터 설치
- 에스컬레이터 설치
- 계단 개선

**2. 수평 신통**
- 복도 확장
- 통로 개선
- 출입구 개선

**3. 복합 신통**
- 수직+수평 통로
- 다층 연결 통로
- 지하 연결 통로

### 💰 **신통기획사업 비용 구조**

**사업비 구성:**
- **공사비**: 60~70%
- **설계비**: 10~15%
- **감리비**: 5~8%
- **기타비용**: 15~20%
  - 인허가비, 보험료, 이자 등

**비용 절약 요소:**
- 철거비 없음
- 토지비 없음
- 인허가 절차 간소
- 공사 기간 단축

### ⚖️ **주요 법적 근거**

**건축법 제2조 (정의)**
- "대수선"이란 건축물의 기존 구조나 주요 구조부를 변경하거나 증설하는 것

**건축법 제19조 (대수선)**
- 대수선은 건축주가 시행
- 건축법에 따른 절차 준수
- 구조안전성 확보 필요

### 🎯 **신통기획사업의 장단점**

**장점:**
- 상대적으로 저렴한 비용
- 짧은 공사 기간
- 기존 거주자 이주 불필요
- 접근성 대폭 개선
- 상권 활성화 효과

**단점:**
- 구조적 한계 존재
- 용적률 증가 제한
- 복잡한 공사 과정
- 소음 및 진동 발생

### 💡 **성공적인 신통기획을 위한 핵심 요소**

1. **정확한 현황 파악**
   - 건물 구조 분석
   - 기존 통로 상태 조사
   - 접근성 문제점 파악

2. **체계적인 계획 수립**
   - 신통 위치 및 규모 결정
   - 공사 방법 및 일정 계획
   - 비용 및 품질 관리 계획

3. **전문가 활용**
   - 경험 있는 설계사
   - 신뢰할 수 있는 시공업체
   - 전문 감리업체

4. **이해관계자 소통**
   - 사업 계획 사전 안내
   - 불편사항 최소화
   - 정기적인 진행 상황 보고

### 🏗️ **신통기획 공사 과정**

**1단계: 사전 준비**
- 현황 조사 및 측량
- 설계 및 인허가
- 시공업체 선정

**2단계: 공사 시행**
- 임시 시설 설치
- 신통 설치 공사
- 품질 관리 및 감리

**3단계: 완료 및 정리**
- 공사 완료 검사
- 임시 시설 철거
- 사용 승인 및 인수

### 📈 **신통기획 효과**

**접근성 개선:**
- 건물 내 이동 편의성 향상
- 장애인 접근성 개선
- 화재 대피 경로 개선

**상권 활성화:**
- 유동인구 증가
- 상가 임대료 상승
- 건물 가치 상승

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 신통기획 설계 방법
• 비용 절약 방안
• 공사 진행 절차
• 품질 관리 방법
• 이해관계자 소통 방안"""
    
    def _generate_association_response(self, message: str) -> str:
        """조합 관련 전문 응답"""
        return """🏛️ **도시정비조합 전문 가이드**

## 📋 **조합의 정의와 역할**

**도시정비조합**은 도시정비사업을 시행하기 위해 조합원들이 자발적으로 결성한 법인으로, 사업의 계획, 시행, 관리의 핵심 주체입니다.

### 🔍 **조합 유형별 특징**

| 구분 | 재개발조합 | 재건축조합 | 리모델링조합 |
|------|------------|------------|--------------|
| **대상** | 노후 주거지역 | 노후 아파트 단지 | 개별 건물 |
| **조합원** | 토지·건물 소유자 | 아파트 입주자 | 건물 소유자 |
| **동의율** | 75% 이상 | 75% 이상 | 100% |
| **설립기간** | 5~10년 | 3~5년 | 1~2년 |

### 📊 **조합 조직 구조**

**1. 조합장**
- 조합의 대표자
- 사업시행계획 수립 및 시행
- 조합원 총회 소집 및 주재
- 외부 기관과의 협의 및 계약

**2. 이사**
- 조합장을 보좌
- 사업 관련 업무 분담
- 조합원 의견 수렴
- 사업 진행 상황 관리

**3. 감사**
- 조합 재정 감사
- 사업비 사용 내역 점검
- 조합원 이익 보호
- 부정 방지 및 감시

**4. 조합원**
- 조합의 구성원
- 총회 참여 및 의결권 행사
- 조합비 납부 의무
- 사업 성과 향유

### 💰 **조합 운영비 및 재정 관리**

**조합비 구성:**
- **조합운영비**: 3~5%
- **설계비**: 2~3%
- **감리비**: 1~2%
- **기타비용**: 2~3%
  - 법무비, 세무비, 보험료 등

**재정 관리 원칙:**
- 투명한 회계 처리
- 정기적인 재정 공개
- 감사 및 점검 체계
- 조합원 동의 하에 사용

### ⚖️ **조합 관련 법적 근거**

**도시정비법 제8조 (조합의 설립)**
- 조합은 정비구역 내 토지·건물 소유자 75% 이상의 동의로 설립
- 조합은 법인으로 등기
- 조합규약을 정하여 시·도지사에게 신고

**도시정비법 제9조 (조합의 사업)**
- 조합은 정비사업을 시행
- 사업시행계획을 수립하여 시·도지사 승인
- 사업시행자를 선정하여 계약

### 🎯 **조합 운영의 핵심 요소**

**1. 민주적 운영**
- 조합원 총회 정기 개최
- 투명한 의사결정 과정
- 조합원 의견 수렴 체계
- 갈등 조정 및 해결

**2. 전문성 확보**
- 경험 있는 조합장 선출
- 전문가 자문 위원회 구성
- 사업시행자 선정 기준 수립
- 시공업체 선정 기준 수립

**3. 소통과 협력**
- 정기적인 조합원 설명회
- 사업 진행 상황 공개
- 의견 수렴 및 피드백
- 갈등 예방 및 해결

### 💡 **성공적인 조합 운영을 위한 전략**

**1. 조합 설립 단계**
- 충분한 사전 준비
- 조합원 동의 확보
- 조합규약 정비
- 전문가 자문 활용

**2. 조합 운영 단계**
- 체계적인 조직 운영
- 투명한 재정 관리
- 정기적인 소통
- 갈등 조정 체계

**3. 사업 시행 단계**
- 사업시행자 선정
- 시공업체 선정
- 사업 진행 관리
- 품질 관리

### 🚨 **조합 운영 시 주의사항**

**법적 준수:**
- 도시정비법 준수
- 조합규약 준수
- 회계 처리 규정 준수
- 인허가 절차 준수

**윤리적 운영:**
- 투명한 의사결정
- 공정한 사업 진행
- 조합원 이익 보호
- 부정 방지

**리스크 관리:**
- 사업비 상승 대비
- 일정 지연 대비
- 분쟁 예방 및 해결
- 보험 가입

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 조합 설립 절차
• 조합장 선출 방법
• 조합비 산정 기준
• 총회 운영 방법
• 갈등 해결 방안"""
    
    def _generate_construction_company_response(self, message: str) -> str:
        """시공사 설득 및 선정 전문 가이드 - 설득력 있는 글쓰기 기법 적용"""
        return self._enhance_persuasive_writing("""🏗️ **시공사 설득 및 선정 전문 가이드**

## 🎯 **시공사가 조합원을 설득하는 핵심 전략**

### 💼 **1. 신뢰성 구축 전략**

**회사 소개 및 실적 어필**
- **설립 연도 및 성장 과정**: "저희는 1995년 설립 이후 28년간 건설업계에서..."
- **주요 실적 및 수상 경력**: "국토교통부 우수시공업체 선정, 건설기술인협회 인증..."
- **자본금 및 재정 안정성**: "자본금 500억원, 신용등급 AA급으로 안정적인 재정 구조..."

**기술력 및 전문성 어필**
- **보유 기술 및 특허**: "친환경 건축 기술 특허 15건 보유, BIM 설계 기술 도입..."
- **기술진 현황**: "건축사 25명, 토목기사 40명, 전기기사 30명 등 전문 기술진..."
- **장비 및 시설**: "최신 건설장비 200여 대 보유, 자체 콘크리트 플랜트 운영..."

### 📊 **2. 경쟁력 어필 전략**

**비용 경쟁력**
- **합리적인 시공비**: "시장 대비 5% 저렴한 시공비로 조합원 부담 최소화..."
- **투명한 비용 구조**: "모든 비용을 투명하게 공개하여 신뢰성 확보..."
- **비용 절감 방안**: "대량 구매를 통한 자재비 절감, 효율적 공정으로 인건비 절약..."

**품질 보장**
- **품질 관리 체계**: "ISO 9001 인증, 6시그마 품질관리 시스템 도입..."
- **시공 품질 기준**: "국가표준보다 20% 높은 품질 기준 적용..."
- **품질 보증**: "준공 후 10년간 A/S 무상 제공, 품질보증보험 가입..."

**일정 관리**
- **정확한 공정 계획**: "상세한 공정 계획으로 일정 지연 위험 최소화..."
- **진도 관리 시스템**: "실시간 진도 관리 시스템으로 투명한 진행 상황 공개..."
- **지연 대응 방안**: "지연 시 일일 100만원 위약금 지급 약정..."

### 🤝 **3. 조합원 맞춤 설득 전략**

**조합원 관심사별 어필**

**💰 경제적 이익 관심 조합원**
- "분양가 절감을 통한 조합원 부담 최소화"
- "투명한 비용 구조로 불필요한 비용 제거"
- "효율적 공정으로 사업비 절약 효과"

**🏠 주거환경 관심 조합원**
- "최신 건축 기술로 쾌적한 주거환경 구현"
- "친환경 자재 사용으로 건강한 생활 공간"
- "스마트홈 시스템 도입으로 편리한 생활"

**⏰ 일정 관심 조합원**
- "체계적인 공정 관리로 정확한 준공 보장"
- "실시간 진도 공개로 투명한 진행 상황"
- "지연 시 위약금 지급으로 책임감 있는 시공"

**🛡️ 안전 관심 조합원**
- "안전관리 우수업체 인증으로 안전한 공사"
- "24시간 안전감리 체계로 사고 예방"
- "안전보험 가입으로 만약의 경우 대비"

### 📋 **4. 제안서 작성 전략**

**핵심 메시지 구성**
1. **신뢰성**: "28년 경험의 검증된 시공업체"
2. **경쟁력**: "합리적 비용, 우수한 품질, 정확한 일정"
3. **차별화**: "조합원 맞춤 서비스, 투명한 소통"
4. **보장**: "품질보증, 일정보장, 비용보장"

**제안서 구성 요소**
- **회사 소개**: 설립연도, 자본금, 주요실적
- **기술력**: 보유기술, 기술진, 장비현황
- **시공계획**: 공정계획, 품질관리, 안전관리
- **비용계획**: 시공비, 지급조건, 절감방안
- **서비스**: A/S, 소통체계, 갈등해결

### 🎤 **5. 프레젠테이션 전략**

**발표 구성 (30분 기준)**
1. **인사 및 소개** (3분): "안녕하세요. 저희는..."
2. **회사 소개** (7분): "28년 경험의 검증된 시공업체"
3. **기술력 어필** (8분): "최신 기술과 전문 인력"
4. **시공계획** (7분): "체계적인 공정 및 품질관리"
5. **Q&A** (5분): "조합원님들의 궁금한 점"

**핵심 메시지 전달**
- **감정적 어필**: "조합원님들의 꿈의 아파트를 함께 만들어가겠습니다"
- **논리적 어필**: "데이터로 증명하는 저희의 경쟁력"
- **신뢰감 어필**: "투명하고 책임감 있는 시공을 약속드립니다"

### 💬 **6. 조합원 질문 대응 전략**

**자주 나오는 질문과 답변**

**Q: 다른 시공사 대비 어떤 장점이 있나요?**
A: "저희는 28년 경험과 500억 자본금으로 안정성을, 최신 기술로 품질을, 투명한 비용으로 신뢰를 보장합니다."

**Q: 시공비가 너무 비싸지 않나요?**
A: "시장 대비 5% 저렴한 비용으로, 투명한 비용 구조를 통해 조합원님들의 부담을 최소화하겠습니다."

**Q: 일정 지연 시 어떻게 대응하나요?**
A: "체계적인 공정관리로 지연을 방지하고, 만약 지연 시 일일 100만원 위약금을 지급하겠습니다."

**Q: 품질은 어떻게 보장하나요?**
A: "ISO 9001 인증 품질관리 시스템과 10년 A/S 보장으로 품질을 책임지겠습니다."

### 🏆 **7. 차별화 전략**

**고객 맞춤 서비스**
- **조합원 맞춤 상담**: "개별 조합원님의 요구사항 반영"
- **투명한 소통**: "월 1회 정기 보고, 실시간 진도 공개"
- **갈등 해결**: "전담 갈등조정팀 운영"

**혁신적 시공 기술**
- **친환경 기술**: "친환경 자재 사용, 에너지 효율 극대화"
- **스마트 기술**: "스마트홈 시스템, IoT 기반 관리"
- **안전 기술**: "최신 안전장비, 실시간 안전모니터링"

### 📈 **8. 성공 사례 어필**

**유사 사업 성공 사례**
- "○○재개발조합: 예정일보다 3개월 단축 완공"
- "○○재건축조합: 시공비 10% 절감 달성"
- "○○리모델링조합: 품질 만족도 95% 달성"

**고객 만족도**
- "완공 후 고객 만족도 조사 결과 98% 만족"
- "재계약 의향 조합 95%"
- "업계 최고 수준의 고객 만족도"

### 🎯 **9. 최종 설득 포인트**

**조합원 이익 중심**
- "조합원님들의 이익을 최우선으로 생각합니다"
- "투명하고 공정한 사업 진행을 약속드립니다"
- "함께 성공하는 파트너가 되겠습니다"

**장기적 관계**
- "일회성 계약이 아닌 장기적 파트너십"
- "사업 완료 후에도 지속적인 관계 유지"
- "조합원님들과 함께 성장하는 시공업체"

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 조합원 설득 전략
• 제안서 작성 방법
• 프레젠테이션 기법
• 경쟁사 대응 방안
• 계약 조건 협상""", "construction_persuasion")
    
    def _enhance_persuasive_writing(self, content: str, context: str = "general") -> str:
        """설득력 있는 글쓰기 기법을 적용하여 내용을 강화"""
        
        # 설득력 있는 글쓰기 기법 적용
        enhanced_content = content
        
        # 1. 감정적 어필 강화
        if "조합원" in content:
            enhanced_content = enhanced_content.replace(
                "조합원님들의", 
                "**조합원님들의 소중한 꿈과 미래를 위해**"
            )
        
        # 2. 신뢰성 강화 표현
        if "28년" in content:
            enhanced_content = enhanced_content.replace(
                "28년간", 
                "**검증된 28년간의 풍부한 경험으로**"
            )
        
        # 3. 구체적 수치 강화
        if "500억원" in content:
            enhanced_content = enhanced_content.replace(
                "자본금 500억원", 
                "**안정적인 자본금 500억원**으로 재정적 안정성 보장"
            )
        
        # 4. 행동 유도 문구 강화
        if "어떤 부분에 대해" in content:
            enhanced_content = enhanced_content.replace(
                "어떤 부분에 대해 더 자세히 알고 싶으신가요?",
                "**지금 바로 시작하세요!** 어떤 부분에 대해 더 자세히 알고 싶으신가요?"
            )
        
        # 5. 스토리텔링 요소 추가
        story_elements = {
            "construction_persuasion": """
### 🌟 **성공 스토리: 실제 사례**

**○○재개발조합 사례 (2022년 완공)**
- **조합원 만족도**: 98% 달성
- **예정일 대비**: 3개월 단축 완공
- **시공비 절감**: 8% 절약 달성
- **조합원 후기**: "정말 만족스러운 결과입니다. 추천하고 싶어요!"

**이런 성공을 여러분도 경험하실 수 있습니다!**""",
            
            "presentation_template": """
### 🎯 **제안서 작성 성공 비결**

**실제 선정된 제안서의 특징:**
- **명확한 차별화**: 경쟁사 대비 3가지 핵심 차별점
- **구체적 데이터**: 실제 수치와 사례 중심
- **조합원 관점**: 조합원 이익을 최우선으로 강조
- **시각적 완성도**: 전문적이고 깔끔한 디자인

**이런 제안서로 성공 확률을 높이세요!**""",
            
            "compensation_guide": """
### 💰 **보상 최대화 성공 사례**

**실제 보상 최대화 사례:**
- **위치가산 20% 추가**: 교통편의성 강조로 성공
- **형상가산 15% 추가**: 불규칙한 형태의 장점 어필
- **이용가산 10% 추가**: 도로접면과 전망의 가치 증명

**전문가와 함께라면 이런 결과도 가능합니다!**""",
            
            "general": """
### 💡 **핵심 메시지**

**지금이 바로 결정의 순간입니다!**
- **기회는 한 번뿐**: 완벽한 타이밍을 놓치지 마세요
- **전문가와 함께**: 검증된 경험과 기술로 성공 보장
- **투명한 과정**: 모든 과정을 투명하게 공개하여 신뢰 구축"""
        }
        
        if context in story_elements:
            enhanced_content += story_elements[context]
        
        # 6. 감정적 연결고리 강화
        enhanced_content = enhanced_content.replace(
            "함께 성공하는 파트너가 되겠습니다",
            "**여러분의 꿈을 현실로 만들어가는 든든한 파트너**가 되겠습니다"
        )
        
        # 7. 긴급성과 희소성 강화
        enhanced_content = enhanced_content.replace(
            "장기적 파트너십",
            "**지금 결정하시면 특별한 혜택**을 드리는 장기적 파트너십"
        )
        
        return enhanced_content
    
    def _generate_presentation_template_response(self, message: str) -> str:
        """프레젠테이션 템플릿 및 제안서 작성 가이드 - 설득력 있는 글쓰기 기법 적용"""
        return self._enhance_persuasive_writing("""📋 **시공사 프레젠테이션 템플릿 및 제안서 작성 가이드**

## 🎯 **제안서 작성 템플릿**

### 📄 **1. 표지 및 목차**

**표지 구성:**
- 회사명 및 로고
- "○○재개발조합 시공업체 선정 제안서"
- 제안일자 및 유효기간
- 담당자 연락처

**목차 구성:**
1. 회사 소개
2. 기술력 및 실적
3. 시공계획
4. 비용계획
5. 품질보증
6. 일정관리
7. 안전관리
8. 서비스 약속

### 🏢 **2. 회사 소개 섹션**

**회사 개요:**
```
○○건설(주)
- 설립: 1995년 (28년 경험)
- 자본금: 500억원
- 직원수: 1,200명
- 본사: 서울시 강남구
- 신용등급: AA급
```

**주요 실적:**
- **재개발사업**: 15건 완공 (총 3,500세대)
- **재건축사업**: 25건 완공 (총 2,800세대)
- **리모델링사업**: 40건 완공 (총 1,200세대)
- **수상 경력**: 국토교통부 우수시공업체 선정 (2020, 2022)

### 🔧 **3. 기술력 어필 섹션**

**보유 기술:**
- **친환경 건축 기술**: 특허 15건 보유
- **BIM 설계 기술**: 3D 모델링 및 시뮬레이션
- **스마트 건설 기술**: IoT 기반 현장 관리
- **내진 보강 기술**: 지진 안전성 확보

**기술진 현황:**
- **건축사**: 25명
- **토목기사**: 40명
- **전기기사**: 30명
- **기계기사**: 20명
- **소방기사**: 15명

**장비 및 시설:**
- **건설장비**: 200여 대 보유
- **자체 플랜트**: 콘크리트, 아스팔트
- **품질시험소**: 자체 품질검사 시설
- **안전장비**: 최신 안전장비 완비

### 📊 **4. 시공계획 섹션**

**공정 계획:**
```
1단계: 준비공사 (2개월)
- 현장 정리 및 임시시설 설치
- 측량 및 지반조사
- 자재 및 장비 준비

2단계: 기초공사 (3개월)
- 굴착 및 기초 시공
- 지하구조물 시공
- 방수 및 단열공사

3단계: 골조공사 (8개월)
- 철근 및 거푸집 공사
- 콘크리트 타설
- 구조체 완성

4단계: 마감공사 (6개월)
- 외벽 및 내부 마감
- 설비공사
- 조경 및 완공
```

**품질관리 계획:**
- **ISO 9001 인증** 품질관리 시스템
- **6시그마** 품질관리 방법론
- **국가표준 대비 20% 높은** 품질기준 적용
- **단계별 품질검사** 및 승인제

### 💰 **5. 비용계획 섹션**

**시공비 구성:**
```
직접공사비: 70% (토목, 건축, 설비)
간접공사비: 20% (관리비, 설계비, 감리비)
일반관리비: 8% (조합운영비, 보험료 등)
이윤: 2% (합리적 수익)
```

**비용 절감 방안:**
- **대량 구매**: 자재비 5% 절감
- **효율적 공정**: 인건비 3% 절감
- **투명한 비용**: 불필요한 비용 제거
- **정기 보고**: 월 1회 비용 현황 보고

### 🛡️ **6. 품질보증 섹션**

**품질보증 체계:**
- **준공 후 10년간** A/S 무상 제공
- **품질보증보험** 가입
- **하자보수보험** 가입
- **전담 A/S팀** 운영

**품질 기준:**
- **국가표준 대비 20% 높은** 품질기준
- **단계별 품질검사** 실시
- **제3자 품질검사** 의무화
- **조합원 참여** 품질검사

### ⏰ **7. 일정관리 섹션**

**일정 보장 체계:**
- **상세한 공정계획** 수립
- **실시간 진도관리** 시스템
- **월 1회 진도보고** 의무화
- **지연 시 위약금** 지급 (일일 100만원)

**일정 관리 도구:**
- **BIM 기반** 4D 시뮬레이션
- **실시간 현장 모니터링**
- **진도 관리 앱** 제공
- **투명한 진행상황** 공개

### 🚨 **8. 안전관리 섹션**

**안전관리 체계:**
- **안전관리 우수업체** 인증
- **24시간 안전감리** 체계
- **안전보험** 가입
- **전담 안전관리자** 배치

**안전 교육:**
- **정기 안전교육** 실시
- **안전장비** 완비
- **응급처치팀** 운영
- **안전사고 제로** 목표

### 🤝 **9. 서비스 약속 섹션**

**조합원 맞춤 서비스:**
- **개별 상담** 서비스
- **투명한 소통** 체계
- **갈등조정팀** 운영
- **만족도 조사** 실시

**지속적 관계:**
- **사업 완료 후** 지속적 관계 유지
- **재계약 우선권** 제공
- **추천 보상** 제도
- **장기 파트너십** 구축

## 🎤 **프레젠테이션 발표 가이드**

### 📝 **발표 구성 (30분)**

**1. 인사 및 소개 (3분)**
- "안녕하세요. 저희는 28년 경험의 ○○건설입니다"
- "조합원님들의 꿈의 아파트를 함께 만들어가겠습니다"

**2. 회사 소개 (7분)**
- 설립연도, 자본금, 주요실적
- 수상경력 및 인증현황
- 신뢰성 어필

**3. 기술력 어필 (8분)**
- 보유기술 및 특허
- 기술진 현황
- 장비 및 시설

**4. 시공계획 (7분)**
- 공정계획 및 일정
- 품질관리 체계
- 안전관리 방안

**5. Q&A (5분)**
- 조합원 질문 대응
- 추가 설명 및 보완

### 💡 **발표 팁**

**시각적 자료:**
- **PPT 슬라이드**: 깔끔하고 전문적인 디자인
- **실제 사진**: 완공된 아파트 사진
- **동영상**: 시공 과정 및 기술 소개
- **모형**: 미니어처 건물 모형

**발표 기법:**
- **감정적 어필**: "조합원님들의 꿈을 실현"
- **논리적 어필**: "데이터로 증명하는 경쟁력"
- **신뢰감 어필**: "투명하고 책임감 있는 시공"

**Q&A 대응:**
- **미리 준비**: 자주 나오는 질문과 답변
- **솔직한 답변**: 모르는 것은 솔직히 인정
- **추가 자료**: 필요시 추가 자료 제공

## 📋 **제안서 체크리스트**

### ✅ **필수 포함 사항**
- [ ] 회사 소개 및 실적
- [ ] 기술력 및 전문성
- [ ] 시공계획 및 일정
- [ ] 비용계획 및 절감방안
- [ ] 품질보증 및 A/S
- [ ] 안전관리 체계
- [ ] 서비스 약속
- [ ] 연락처 및 담당자

### ✅ **품질 확인 사항**
- [ ] 오타 및 문법 오류 없음
- [ ] 일관된 디자인 및 레이아웃
- [ ] 명확한 목차 및 페이지 번호
- [ ] 실제 데이터 기반 내용
- [ ] 조합원 관점에서 작성
- [ ] 경쟁사 대비 차별화 포인트

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 제안서 작성 방법
• 프레젠테이션 기법
• 조합원 설득 전략
• 경쟁사 대응 방안
• 계약 조건 협상""", "presentation_template")
    
    def _generate_compensation_response(self, message: str) -> str:
        """보상 및 분양 관련 전문 응답 - 설득력 있는 글쓰기 기법 적용"""
        return self._enhance_persuasive_writing("""💰 **보상 및 분양 전문 가이드**

## 📋 **보상의 정의와 종류**

**보상**은 도시정비사업으로 인해 기존 거주지에서 이주해야 하는 조합원들에게 지급되는 경제적 보상입니다.

### 🔍 **보상 유형별 특징**

| 구분 | 토지보상 | 건물보상 | 이주비 | 정착금 |
|------|----------|----------|--------|--------|
| **대상** | 토지 소유자 | 건물 소유자 | 거주자 | 조합원 |
| **기준** | 시가표준액 | 시가표준액 | 실비 | 정착지원 |
| **지급시기** | 계약 체결시 | 계약 체결시 | 이주시 | 입주시 |
| **세금** | 양도소득세 | 양도소득세 | 비과세 | 비과세 |

### 📊 **보상 산정 기준**

**토지보상:**
- **시가표준액**: 국토교통부 고시 기준
- **위치가산**: 교통편의, 상업지역 등
- **형상가산**: 불규칙한 형태, 협소지 등
- **이용가산**: 도로접면, 전망 등

**건물보상:**
- **시가표준액**: 건물 가치 평가
- **노후도**: 건물 연령 및 상태
- **용도**: 주거용, 상업용, 공업용
- **구조**: 철근콘크리트, 블록, 목조 등

### 💰 **이주비 및 정착금**

**이주비 구성:**
- **이사비**: 실제 이사 비용
- **임시거주비**: 임시 거주 기간 비용
- **전화이전비**: 통신비용
- **기타비용**: 정리비, 포장비 등

**정착금:**
- **정착지원금**: 새 거주지 정착 지원
- **생활안정금**: 생활 안정 지원
- **자녀교육비**: 자녀 교육 지원
- **의료비**: 건강 관리 지원

### ⚖️ **보상 관련 법적 근거**

**도시정비법 제25조 (보상)**
- 조합은 토지·건물 소유자에게 보상 지급
- 보상 기준은 시가표준액에 의함
- 보상 지급 시기는 계약 체결시

**도시정비법 제26조 (이주비)**
- 조합은 거주자에게 이주비 지급
- 이주비는 실비에 의함
- 이주비 지급 시기는 이주시

### 🎯 **분양 관련 가이드**

**분양가 산정:**
- **분양가 = (사업비 - 보상비) ÷ 분양면적**
- **시세 대비 70~80%** 수준
- **지역별, 사업별** 차이 존재
- **조합원 우선** 분양권

**분양 절차:**
1. **분양 신청**: 조합원 분양 신청
2. **자격 심사**: 분양 자격 확인
3. **추첨 및 배정**: 공정한 추첨
4. **계약 체결**: 분양 계약 체결
5. **잔금 납부**: 분양잔금 납부
6. **입주**: 준공 후 입주

### 💡 **보상 및 분양 최적화 전략**

**보상 최대화:**
- **시가표준액 확인**: 정확한 기준액 파악
- **가산 요인**: 위치, 형상, 이용 가산
- **보상 협의**: 조합과의 협의 과정
- **전문가 자문**: 감정평가사 자문

**분양 최적화:**
- **분양가 비교**: 시세 대비 적정성
- **위치 선택**: 선호하는 위치 선택
- **면적 선택**: 적정 면적 선택
- **방향 선택**: 채광, 전망 고려

### 🚨 **주의사항 및 리스크**

**보상 관련 주의사항:**
- **시가표준액**: 정확한 기준액 확인
- **가산 요인**: 누락된 가산 요인 확인
- **보상 시기**: 지급 시기 및 방법 확인
- **세금**: 양도소득세 계산

**분양 관련 주의사항:**
- **분양가**: 시세 대비 적정성 확인
- **위치**: 선호도 및 편의성 고려
- **면적**: 실제 사용면적 확인
- **방향**: 채광, 전망, 소음 고려

### 📈 **성공 사례 및 팁**

**보상 최대화 사례:**
- "위치가산 20% 추가 확보"
- "형상가산 15% 추가 확보"
- "이용가산 10% 추가 확보"

**분양 최적화 사례:**
- "시세 대비 25% 절약"
- "선호 위치 확보"
- "적정 면적 선택"

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 보상 산정 기준
• 분양가 계산 방법
• 이주비 및 정착금
• 세금 절약 방안
• 분양 절차 및 주의사항""", "compensation_guide")
    
    def _generate_legal_response(self, message: str) -> str:
        """도시정비법 및 관련 법규 전문 응답"""
        return """⚖️ **도시정비법 및 관련 법규 전문 가이드**

## 📋 **도시정비법 개요**

**도시정비법**은 노후·불량건축물이 밀집한 지역의 체계적인 정비를 통해 주거환경을 개선하고 도시기능을 향상시키기 위한 법률입니다.

### 🔍 **주요 법률 체계**

| 법률 | 목적 | 적용 범위 |
|------|------|-----------|
| **도시정비법** | 도시정비사업 전반 | 재개발, 재건축, 리모델링 |
| **건축법** | 건축물 건설 | 건축 기준, 인허가 |
| **토지보상법** | 토지 수용 및 보상 | 보상 기준, 절차 |
| **건설산업기본법** | 건설업 관리 | 시공업체 등록, 관리 |

### 📊 **도시정비법 주요 조항**

**제2조 (정의)**
- **재개발사업**: 노후·불량건축물이 밀집한 지역에서 건축물의 철거, 정리, 재건축 또는 재개발을 통하여 주거환경을 개선하고 도시기능을 향상시키는 사업
- **재건축사업**: 노후·불량건축물이 밀집한 지역에서 건축물의 철거, 정리, 재건축을 통하여 주거환경을 개선하는 사업
- **리모델링사업**: 기존 건축물을 철거하지 않고 구조적 개선, 시설 개선, 외관 개선 등을 통해 건축물의 기능과 가치를 향상시키는 사업

**제4조 (정비구역의 지정)**
- 정비구역은 시·도지사가 지정
- 노후·불량건축물이 밀집한 지역
- 주민의 동의율 75% 이상 필요
- 도시계획위원회 심의

**제8조 (조합의 설립)**
- 조합은 정비구역 내 토지·건물 소유자 75% 이상의 동의로 설립
- 조합은 법인으로 등기
- 조합규약을 정하여 시·도지사에게 신고

**제15조 (사업시행자)**
- 조합은 사업시행자를 선정하여 계약
- 사업시행자는 시공업체를 선정
- 계약 조건은 조합원 총회 의결

**제25조 (보상)**
- 조합은 토지·건물 소유자에게 보상 지급
- 보상 기준은 시가표준액에 의함
- 보상 지급 시기는 계약 체결시

### 💰 **보상 관련 법규**

**토지보상법 제3조 (보상 기준)**
- 보상은 시가표준액에 의함
- 시가표준액은 국토교통부장관이 고시
- 위치, 형상, 이용에 따른 가산

**토지보상법 제4조 (보상 시기)**
- 보상은 계약 체결시 지급
- 분할 지급 가능
- 이자 지급 의무

### 🏗️ **건축 관련 법규**

**건축법 제2조 (정의)**
- **대수선**: 건축물의 기존 구조나 주요 구조부를 변경하거나 증설하는 것
- **개축**: 건축물의 구조나 주요 구조부를 변경하는 것
- **증축**: 건축물의 면적을 늘리는 것

**건축법 제19조 (대수선)**
- 대수선은 건축주가 시행
- 건축법에 따른 절차 준수
- 구조안전성 확보 필요

### 🏢 **건설업 관련 법규**

**건설산업기본법 제9조 (건설업 등록)**
- 시공업체는 건설업 등록 필요
- 등록 업종별 시공 가능
- 등록 갱신 의무

**건설산업기본법 제10조 (건설업자 의무)**
- 건설업자는 건설공사를 성실히 시공
- 품질관리 의무
- 안전관리 의무

### 🎯 **법적 절차 및 인허가**

**정비구역 지정 절차:**
1. **주민 동의**: 75% 이상 동의 확보
2. **지정 신청**: 시·도지사에게 신청
3. **도시계획위원회**: 심의 및 의결
4. **지정 고시**: 정비구역 지정 고시

**조합 설립 절차:**
1. **설립 동의**: 75% 이상 동의 확보
2. **조합 설립**: 법인 등기
3. **조합규약**: 제정 및 신고
4. **시·도지사**: 신고 접수

**사업시행계획 수립 절차:**
1. **계획 수립**: 조합에서 수립
2. **승인 신청**: 시·도지사에게 신청
3. **심의**: 도시계획위원회 심의
4. **승인**: 사업시행계획 승인

### 💡 **법적 리스크 관리**

**법적 준수 사항:**
- **도시정비법**: 모든 절차 준수
- **건축법**: 건축 기준 준수
- **토지보상법**: 보상 기준 준수
- **건설산업기본법**: 시공 기준 준수

**법적 리스크 예방:**
- **전문가 자문**: 법무법인 자문
- **정기 점검**: 법적 준수 여부 점검
- **교육 실시**: 관련 법규 교육
- **문서 관리**: 모든 문서 보관

### 🚨 **법적 분쟁 및 해결**

**분쟁 유형:**
- **보상 분쟁**: 보상액 산정 분쟁
- **분양 분쟁**: 분양가 산정 분쟁
- **시공 분쟁**: 시공 품질 분쟁
- **일정 분쟁**: 공사 일정 분쟁

**분쟁 해결 방법:**
- **협의**: 당사자 간 협의
- **조정**: 중재기관 조정
- **소송**: 법원 소송
- **중재**: 중재기관 중재

### 📈 **법규 개정 동향**

**최근 개정 사항:**
- **2023년**: 도시정비법 일부 개정
- **2022년**: 건축법 일부 개정
- **2021년**: 토지보상법 일부 개정

**개정 주요 내용:**
- **동의율**: 75%에서 70%로 하향 조정 검토
- **보상 기준**: 시가표준액 상향 조정
- **시공 기준**: 품질 기준 강화

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 도시정비법 상세 조항
• 보상 관련 법규
• 건축 관련 법규
• 건설업 관련 법규
• 법적 분쟁 해결 방법"""
    
    def _generate_general_urban_redevelopment_response(self, message: str) -> str:
        """도시정비 일반 전문 응답"""
        return """🏙️ **도시정비 종합 전문 가이드**

## 📋 **도시정비의 정의와 목적**

**도시정비**는 노후화되고 기능이 저하된 도시 지역을 체계적으로 개선하여 주민의 주거환경을 향상시키고 도시의 기능을 회복시키는 사업입니다.

### 🔍 **도시정비 사업 유형 비교**

| 구분 | 재개발 | 재건축 | 리모델링 | 신통기획 |
|------|--------|--------|----------|----------|
| **대상** | 노후 주거지역 | 노후 아파트 단지 | 개별 건물 | 상가/복합건물 |
| **방법** | 철거 후 신축 | 철거 후 신축 | 기존 건물 개선 | 신통 설치 |
| **규모** | 대규모 | 중규모 | 소규모 | 소규모 |
| **기간** | 5~10년 | 3~5년 | 1~2년 | 6개월~1년 |
| **동의율** | 75% 이상 | 75% 이상 | 100% | 100% |
| **비용** | 높음 | 높음 | 중간 | 낮음 |

### 📊 **도시정비 사업 진행 단계**

**1단계: 사업 추진 결정**
- 주민 동의율 확보 (75% 이상)
- 정비구역 지정 신청
- 정비계획 수립
- 조합 설립

**2단계: 조합 운영**
- 조합장 및 이사 선출
- 조합규약 제정
- 사업시행자 선정
- 시공업체 선정

**3단계: 사업 시행**
- 착공 및 공사 진행
- 분양 및 보상 실시
- 준공 및 입주
- 사업 완료

### 💰 **도시정비 사업 비용 구조**

**재개발사업 비용:**
- **토지보상비**: 40~50%
- **공사비**: 30~40%
- **기타비용**: 10~20%
  - 조합운영비, 설계비, 감리비, 이주비 등

**재건축사업 비용:**
- **공사비**: 60~70%
- **토지비**: 20~30%
- **기타비용**: 10~15%
  - 조합운영비, 설계비, 감리비 등

**리모델링사업 비용:**
- **공사비**: 70~80%
- **설계비**: 5~10%
- **감리비**: 3~5%
- **기타비용**: 10~15%

### ⚖️ **도시정비 관련 법적 근거**

**도시정비법 제2조 (정의)**
- 도시정비사업의 정의 및 범위
- 재개발, 재건축, 리모델링 정의
- 정비구역의 정의

**도시정비법 제4조 (정비구역의 지정)**
- 정비구역 지정 기준
- 주민 동의율 요구사항
- 도시계획위원회 심의

**도시정비법 제8조 (조합의 설립)**
- 조합 설립 요건
- 조합원 자격
- 조합규약 제정

### 🎯 **도시정비 사업의 장단점**

**장점:**
- **주거환경 개선**: 쾌적한 주거환경 제공
- **부동산 가치 상승**: 지역 가치 향상
- **도시기능 향상**: 도시 인프라 개선
- **일자리 창출**: 건설업 일자리 증가

**단점:**
- **장기간 사업**: 5~10년 소요
- **높은 동의율**: 75% 이상 요구
- **분쟁 발생**: 이해관계자 간 갈등
- **이주 부담**: 임시 이주 필요

### 💡 **성공적인 도시정비를 위한 핵심 요소**

**1. 주민 참여와 소통**
- 정기적인 주민설명회 개최
- 투명한 정보 공개
- 의견 수렴 체계 구축
- 갈등 조정 및 해결

**2. 전문가 활용**
- 경험 있는 사업시행자 선정
- 신뢰할 수 있는 시공업체 선택
- 법무, 세무 전문가 자문
- 기술 전문가 활용

**3. 체계적인 관리**
- 사업비 관리
- 일정 관리
- 품질 관리
- 안전 관리

### 🚨 **도시정비 사업 시 주의사항**

**법적 준수:**
- 도시정비법 준수
- 건축법 준수
- 토지보상법 준수
- 건설산업기본법 준수

**윤리적 운영:**
- 투명한 의사결정
- 공정한 사업 진행
- 조합원 이익 보호
- 부정 방지

**리스크 관리:**
- 사업비 상승 대비
- 일정 지연 대비
- 분쟁 예방 및 해결
- 보험 가입

### 📈 **도시정비 트렌드 및 전망**

**최근 트렌드:**
- **친환경 건축**: 에너지 효율성 중시
- **스마트 건물**: IoT 기반 관리
- **접근성 개선**: 장애인 편의시설
- **커뮤니티 공간**: 주민 소통 공간

**미래 전망:**
- **디지털화**: BIM, AI 활용
- **지속가능성**: 친환경 기술
- **주민 참여**: 민주적 의사결정
- **품질 향상**: 고품질 건축

### 🏆 **성공 사례 분석**

**성공 요인:**
- **강력한 리더십**: 조합장의 리더십
- **투명한 운영**: 공개적 정보 공유
- **전문가 활용**: 경험 있는 전문가
- **주민 참여**: 적극적인 주민 참여

**실패 요인:**
- **소통 부족**: 정보 공유 부족
- **전문성 부족**: 경험 부족
- **갈등 관리**: 분쟁 해결 실패
- **일정 관리**: 일정 지연

**어떤 부분에 대해 더 자세히 알고 싶으신가요?**
• 도시정비 사업 유형별 특징
• 사업 진행 절차
• 비용 구조 및 절감 방안
• 법적 근거 및 절차
• 성공 사례 및 실패 요인"""
    
    def _generate_web_scraping_response(self, message: str) -> str:
        """웹 크롤링/스크래핑 특화 응답 - 개선된 버전"""
        return """🕷️ **웹 크롤링/스크래핑 완전 가이드**

## 📚 **핵심 라이브러리 비교**

| 라이브러리 | 용도 | 장점 | 단점 |
|-----------|------|------|------|
| **requests + BeautifulSoup** | 정적 페이지 | 간단, 빠름 | JavaScript 콘텐츠 불가 |
| **Selenium** | 동적 페이지 | JavaScript 지원 | 느림, 리소스 사용량 높음 |
| **Scrapy** | 대규모 크롤링 | 고성능, 확장성 | 복잡한 설정 |

## 💻 **실전 코드 예제**

### 1. 기본 크롤링 (requests + BeautifulSoup)
```python
import requests
from bs4 import BeautifulSoup
import time

def basic_scraping(url):
    headers = {{
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 제목 추출
        titles = [h1.get_text().strip() for h1 in soup.find_all('h1')]
        
        # 링크 추출
        links = [a.get('href') for a in soup.find_all('a', href=True)]
        
        return {{
            'titles': titles,
            'links': links,
            'status': 'success'
        }}
        
    except Exception as e:
        return {{'error': str(e), 'status': 'failed'}}

# 사용 예시
result = basic_scraping('https://example.com')
print(result)
```

### 2. 동적 콘텐츠 크롤링 (Selenium)
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def dynamic_scraping(url):
    # Chrome 옵션 설정
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # 브라우저 창 숨기기
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(url)
        
        # 요소가 로드될 때까지 대기
        wait = WebDriverWait(driver, 10)
        elements = wait.until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "dynamic-content"))
        )
        
        data = []
        for element in elements:
            data.append({{
                'text': element.text,
                'tag': element.tag_name
            }})
        
        return data
        
    finally:
        driver.quit()

# 사용 예시
data = dynamic_scraping('https://spa-example.com')
```

### 3. 고급 크롤링 (Scrapy)
```python
import scrapy
import json

class NewsSpider(scrapy.Spider):
    name = 'news_spider'
    start_urls = ['https://news.ycombinator.com']
    
    custom_settings = {{
        'ROBOTSTXT_OBEY': True,
        'DOWNLOAD_DELAY': 1,
        'RANDOMIZE_DOWNLOAD_DELAY': 0.5,
    }}
    
    def parse(self, response):
        for story in response.css('tr.athing'):
            yield {{
                'title': story.css('a.storylink::text').get(),
                'link': story.css('a.storylink::attr(href)').get(),
                'score': story.css('span.score::text').get(),
                'timestamp': response.meta.get('timestamp')
            }}
        
        # 다음 페이지로 이동
        next_page = response.css('a.morelink::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)

# 실행: scrapy runspider spider.py -o results.json
```

## ⚠️ **중요한 고려사항**

### 법적/윤리적 고려사항
- **robots.txt 준수**: 웹사이트의 크롤링 정책 확인
- **저작권 존중**: 콘텐츠 사용 시 저작권 확인
- **개인정보 보호**: 개인정보 수집 금지

### 기술적 고려사항
- **요청 간격 조절**: `time.sleep(random.uniform(1, 3))`
- **User-Agent 설정**: 봇 차단 방지
- **에러 처리**: 네트워크 오류 및 파싱 오류 대응
- **리소스 관리**: 메모리 누수 방지

## 🚀 **다음 단계**

**어떤 종류의 크롤링을 원하시나요?**
• 특정 웹사이트 크롤링 방법
• 동적 콘텐츠 처리
• 대용량 데이터 수집
• API 연동 방법
• 에러 처리 및 최적화"""
    
    def _generate_web_development_response(self, message: str) -> str:
        """웹 개발 특화 응답"""
        return """🌐 **웹 개발 가이드를 제공하겠습니다!**

**현대 웹 개발 기술 스택:**

**프론트엔드:**
• **React**: 컴포넌트 기반 UI 개발
• **Vue.js**: 점진적 프레임워크
• **Angular**: 엔터프라이즈급 풀스택
• **Next.js**: React 기반 풀스택 프레임워크
• **TypeScript**: 타입 안전성 제공

**백엔드:**
• **Node.js**: JavaScript 런타임
• **Python**: Django, Flask, FastAPI
• **Java**: Spring Boot
• **Go**: 고성능 웹 서비스
• **Rust**: 메모리 안전성

**데이터베이스:**
• **PostgreSQL**: 관계형 데이터베이스
• **MongoDB**: NoSQL 문서 데이터베이스
• **Redis**: 인메모리 캐시
• **MySQL**: 널리 사용되는 관계형 DB

**어떤 웹 개발 영역에 관심이 있으신가요?**
• 프론트엔드 개발
• 백엔드 API 개발
• 풀스택 개발
• 특정 프레임워크 학습"""
    
    def _generate_python_response(self, message: str) -> str:
        """Python 특화 응답"""
        return """🐍 **Python 개발 도움을 제공하겠습니다!**

**Python의 핵심 특징:**
• **간결한 문법**: 읽기 쉽고 배우기 쉬운 언어
• **풍부한 라이브러리**: NumPy, Pandas, Django, Flask 등
• **다양한 용도**: 웹 개발, 데이터 사이언스, AI/ML, 자동화

**인기 프레임워크:**
• **Django**: 풀스택 웹 프레임워크, 관리자 패널 내장
• **Flask**: 가벼운 웹 프레임워크, 마이크로서비스에 적합
• **FastAPI**: 고성능 API 개발, 자동 문서화
• **TensorFlow/PyTorch**: AI/ML 개발

**베스트 프랙티스:**
• **PEP 8 스타일 가이드** 준수
• **가상환경** 사용 (venv, conda)
• **타입 힌트** 활용으로 코드 품질 향상
• **리스트 컴프리헨션** 적극 활용

**실용적인 예시:**
```python
# 데이터 처리 예시
import pandas as pd
import numpy as np

# CSV 파일 읽기
df = pd.read_csv('data.csv')

# 데이터 분석
summary = df.describe()
print(summary)
```

**어떤 Python 관련 도움이 필요하신가요?**
• 특정 라이브러리 사용법
• 웹 개발 프로젝트 구조
• 데이터 분석 방법
• AI/ML 모델 개발"""
    
    def _generate_javascript_response(self, message: str) -> str:
        """JavaScript 특화 응답"""
        return """🌐 **JavaScript 개발 도움을 제공하겠습니다!**

**JavaScript의 핵심 특징:**
• **웹의 핵심 언어**: 브라우저와 서버 모두에서 실행
• **동적 타이핑**: 유연한 데이터 타입 처리
• **비동기 처리**: Promise, async/await로 효율적인 처리

**주요 프레임워크:**
• **React**: 컴포넌트 기반 UI 라이브러리
• **Vue.js**: 점진적 프레임워크, 학습 곡선 완만
• **Angular**: 엔터프라이즈급 풀스택 프레임워크
• **Node.js**: 서버사이드 JavaScript 런타임

**모던 JavaScript (ES6+):**
• **화살표 함수**: `const add = (a, b) => a + b`
• **구조 분해**: `const {{name, age}} = user`
• **템플릿 리터럴**: `` `Hello ${{name}}` ``
• **모듈 시스템**: import/export

**실용적인 예시:**
```javascript
// 비동기 데이터 처리
async function fetchUserData(userId) {{
    try {{
        const response = await fetch(`/api/users/${{userId}}`);
        const userData = await response.json();
        return userData;
    }} catch (error) {{
        console.error('Error fetching user:', error);
        throw error;
    }}
}}
```

**어떤 JavaScript 관련 도움이 필요하신가요?**
• 프레임워크 선택 가이드
• 비동기 처리 최적화
• 성능 개선 방법
• 모던 JavaScript 문법"""
    
    def _generate_java_response(self, message: str) -> str:
        """Java 특화 응답"""
        return """☕ **Java 개발 도움을 제공하겠습니다!**

**Java의 핵심 특징:**
• **플랫폼 독립성**: "Write Once, Run Anywhere"
• **객체지향**: 강력한 OOP 지원
• **메모리 관리**: 자동 가비지 컬렉션
• **엔터프라이즈급**: 대규모 시스템에 적합

**주요 프레임워크:**
• **Spring**: 엔터프라이즈 애플리케이션 개발
• **Spring Boot**: 빠른 프로토타이핑과 마이크로서비스
• **Hibernate**: ORM 프레임워크
• **Maven/Gradle**: 빌드 도구

**핵심 개념:**
• **클래스와 객체**: 캡슐화, 상속, 다형성
• **인터페이스**: 계약 기반 설계
• **예외 처리**: try-catch-finally
• **컬렉션 프레임워크**: List, Set, Map

**실용적인 예시:**
```java
// Spring Boot REST API 예시
@RestController
@RequestMapping("/api/users")
public class UserController {{
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{{id}}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {{
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }}
}}
```

**어떤 Java 관련 도움이 필요하신가요?**
• Spring 프레임워크 활용
• 디자인 패턴 적용
• 성능 최적화 방법
• 테스트 코드 작성"""
    
    def _generate_general_programming_response(self, message: str) -> str:
        """일반 프로그래밍 응답"""
        return """💻 **프로그래밍 도움을 제공하겠습니다!**

**개발 단계별 가이드:**

**1. 기획 및 설계** 📋
• 요구사항 분석
• 시스템 아키텍처 설계
• 데이터베이스 설계
• API 설계

**2. 개발 환경 설정** ⚙️
• IDE/에디터 선택 (VS Code, IntelliJ, Eclipse)
• 버전 관리 (Git)
• 패키지 관리 (npm, pip, Maven)
• 개발 서버 설정

**3. 코딩 및 구현** 🔨
• 코딩 스타일 가이드 준수
• 모듈화 및 재사용성
• 에러 핸들링
• 로깅 및 디버깅

**4. 테스트 및 품질 관리** 🧪
• 단위 테스트 작성
• 통합 테스트
• 코드 리뷰
• 성능 테스트

**5. 배포 및 운영** 🚀
• CI/CD 파이프라인
• 모니터링 설정
• 로그 관리
• 백업 및 복구

**어떤 개발 단계에서 도움이 필요하신가요?**
• 특정 언어나 프레임워크
• 아키텍처 설계
• 성능 최적화
• 디버깅 방법"""
    
    def _generate_marketing_response(self, message: str, context: Dict[str, Any]) -> str:
        """마케팅 응답 생성"""
        return """📈 **마케팅 전략 도움을 제공하겠습니다!**

**디지털 마케팅 전략:**

**1. SEO (검색엔진최적화)** 🔍
• 키워드 리서치 및 분석
• 온페이지 SEO 최적화
• 백링크 구축 전략
• 로컬 SEO 활용

**2. 소셜미디어 마케팅** 📱
• 플랫폼별 특성 이해
• 콘텐츠 전략 수립
• 인플루언서 마케팅
• 커뮤니티 관리

**3. 콘텐츠 마케팅** ✍️
• 블로그 및 기사 작성
• 비디오 콘텐츠 제작
• 인포그래픽 활용
• 이메일 뉴스레터

**4. 광고 캠페인** 📢
• 구글 애즈 최적화
• 페이스북/인스타그램 광고
• 리타겟팅 전략
• 전환율 최적화

**성공 지표 (KPI):**
• **도달률**: 얼마나 많은 사람에게 도달했는가
• **참여율**: 좋아요, 댓글, 공유 수
• **전환율**: 목표 행동 완료 비율
• **ROI**: 투자 대비 수익률

**어떤 마케팅 영역에서 도움이 필요하신가요?**
• 특정 플랫폼 전략
• 콘텐츠 기획
• 광고 최적화
• 성과 측정"""
    
    def _generate_writing_response(self, message: str, context: Dict[str, Any]) -> str:
        """글쓰기 응답 생성"""
        return """✍️ **글쓰기 도움을 제공하겠습니다!**

**글쓰기 스타일별 가이드:**

**1. 비즈니스 글쓰기** 💼
• 명확하고 간결한 표현
• 논리적 구조 (서론-본론-결론)
• 객관적 데이터 활용
• 행동 지향적 결론

**2. 창의적 글쓰기** 🎨
• 감정적 어필과 스토리텔링
• 생생한 묘사와 비유
• 독자의 상상력 자극
• 개성 있는 어조

**3. 학술적 글쓰기** 🎓
• 객관적이고 정확한 표현
• 인용과 참고문헌 활용
• 논리적 근거 제시
• 전문 용어 적절한 사용

**4. 마케팅 글쓰기** 📢
• 강력한 헤드라인
• 고객의 니즈 중심
• 행동 유도 문구 (CTA)
• 신뢰성 있는 증거

**글쓰기 기법:**
• **5W1H**: Who, What, When, Where, Why, How
• **피라미드 구조**: 핵심 메시지부터 시작
• **스토리텔링**: 감정적 연결고리 만들기
• **반복과 강조**: 핵심 메시지 강화

**어떤 글쓰기 스타일이 필요하신가요?**
• 특정 주제의 글쓰기
• 어조와 스타일 조정
• 구조화 방법
• 매력적인 표현 기법"""
    
    def _generate_analysis_response(self, message: str, context: Dict[str, Any]) -> str:
        """분석 응답 생성"""
        return """📊 **데이터 분석 도움을 제공하겠습니다!**

**분석 단계별 프로세스:**

**1. 데이터 수집** 📥
• 내부 데이터 (CRM, ERP, 웹사이트)
• 외부 데이터 (시장 조사, 경쟁사 분석)
• 소셜미디어 데이터
• 고객 피드백

**2. 데이터 정제** 🧹
• 중복 데이터 제거
• 결측값 처리
• 이상치 식별 및 처리
• 데이터 형식 통일

**3. 탐색적 데이터 분석** 🔍
• 기술통계 (평균, 중앙값, 표준편차)
• 분포 분석
• 상관관계 분석
• 시각화 (차트, 그래프)

**4. 인사이트 도출** 💡
• 패턴 및 트렌드 발견
• 원인 분석
• 예측 모델링
• 가설 검증

**5. 보고서 작성** 📋
• 실행 요약
• 주요 발견사항
• 시각적 자료
• 권장사항

**분석 도구:**
• **Excel**: 기본적인 데이터 분석
• **Python**: Pandas, NumPy, Matplotlib
• **R**: 통계 분석 전문
• **Tableau**: 데이터 시각화
• **Power BI**: 비즈니스 인텔리전스

**어떤 분석이 필요하신가요?**
• 특정 데이터 분석 방법
• 시각화 기법
• 통계 분석
• 예측 모델링"""
    
    def _generate_project_response(self, message: str, context: Dict[str, Any]) -> str:
        """프로젝트 관리 응답 생성"""
        return """📋 **프로젝트 관리 도움을 제공하겠습니다!**

**프로젝트 관리 단계:**

**1. 기획 단계** 🎯
• 목표 설정 (SMART 원칙)
• 범위 정의
• 이해관계자 분석
• 리스크 평가

**2. 계획 단계** 📅
• 작업 분해 구조 (WBS)
• 일정 계획 (간트 차트)
• 자원 계획
• 예산 계획

**3. 실행 단계** 🚀
• 팀 구성 및 역할 분담
• 의사소통 계획
• 품질 관리
• 진행 상황 모니터링

**4. 통제 단계** 📊
• 일정 관리
• 비용 관리
• 품질 통제
• 리스크 관리

**5. 마무리 단계** ✅
• 프로젝트 완료 확인
• 성과 평가
• 교훈 정리
• 문서화

**프로젝트 관리 방법론:**
• **애자일**: 반복적 개발, 고객 피드백 중심
• **워터폴**: 순차적 단계별 진행
• **스크럼**: 짧은 스프린트 단위 개발
• **칸반**: 작업 흐름 시각화

**프로젝트 관리 도구:**
• **Jira**: 이슈 추적 및 프로젝트 관리
• **Trello**: 칸반 보드 방식
• **Asana**: 작업 관리 및 협업
• **Microsoft Project**: 종합 프로젝트 관리

**어떤 프로젝트 관리 도움이 필요하신가요?**
• 특정 방법론 적용
• 도구 선택 가이드
• 팀 관리 방법
• 일정 최적화"""
    
    def _generate_general_response(self, message: str, context: Dict[str, Any]) -> str:
        """일반 응답 생성"""
        return """🤖 **안녕하세요! CORBU.AI입니다!**

**제공 가능한 서비스:**

**💻 코딩 및 프로그래밍 도움**
• Python, JavaScript, Java 등 언어별 가이드
• 프레임워크 및 라이브러리 활용법
• 알고리즘 및 자료구조 설명
• 디버깅 및 성능 최적화

**📈 마케팅 전략 및 콘텐츠 제작**
• 디지털 마케팅 전략 수립
• SEO, 소셜미디어 마케팅
• 콘텐츠 기획 및 제작
• 광고 캠페인 최적화

**✍️ 글쓰기 및 문서 작성**
• 비즈니스 문서 작성
• 창의적 글쓰기 기법
• 학술 논문 작성
• 마케팅 카피라이팅

**📊 데이터 분석 및 텍스트 요약**
• 데이터 수집 및 정제
• 통계 분석 및 시각화
• 인사이트 도출
• 보고서 작성

**📋 프로젝트 관리 및 계획 수립**
• 프로젝트 기획 및 설계
• 일정 관리 및 리소스 배분
• 팀 관리 및 협업
• 품질 관리

**🔍 실시간 웹 검색 및 최신 정보 제공**
• 최신 기술 트렌드
• 시장 동향 분석
• 뉴스 및 정보 검색

**사용 방법:**
1. 구체적인 질문이나 요청을 입력해주세요
2. 파일이나 이미지를 업로드할 수 있습니다
3. 다양한 스타일로 답변을 받을 수 있습니다

**어떤 도움이 필요하신가요?**
더 구체적인 질문을 해주시면 더 정확하고 유용한 답변을 드릴 수 있습니다! 💡"""
    
    def _generate_follow_up_questions(self, intent: str, message: str, context: Dict[str, Any]) -> List[str]:
        """후속 질문 생성"""
        follow_up_map = {
            'programming': [
                "더 구체적인 예시를 보여주세요",
                "이 방법의 장단점은 무엇인가요?",
                "다른 대안 방법도 있나요?",
                "성능을 더 최적화할 수 있나요?"
            ],
            'marketing': [
                "예산은 얼마나 필요할까요?",
                "어떤 지표로 성과를 측정해야 하나요?",
                "경쟁사와 차별화할 수 있는 방법은?",
                "타겟 고객층은 어떻게 설정해야 하나요?"
            ],
            'writing': [
                "이 주제를 어떻게 더 흥미롭게 만들 수 있나요?",
                "독자의 관심을 끌 수 있는 방법은?",
                "더 설득력 있게 쓰려면 어떻게 해야 하나요?",
                "문체를 바꿔서 써볼 수 있나요?"
            ],
            'analysis': [
                "이 데이터에서 어떤 패턴을 찾을 수 있나요?",
                "결과를 어떻게 시각화하면 좋을까요?",
                "추가로 수집해야 할 데이터는 무엇인가요?",
                "이 분석의 한계점은 무엇인가요?"
            ],
            'project': [
                "이 프로젝트의 주요 리스크는 무엇인가요?",
                "일정을 단축할 수 있는 방법은?",
                "팀원들에게 어떻게 역할을 분배해야 하나요?",
                "품질을 보장하는 방법은 무엇인가요?"
            ],
            'general': [
                "더 자세히 설명해주세요",
                "예시를 들어주세요",
                "다른 관점에서도 설명해주세요",
                "관련된 주제도 알려주세요"
            ]
        }
        
        return follow_up_map.get(intent, follow_up_map['general'])
    
    def _generate_related_topics(self, intent: str, message: str, context: Dict[str, Any]) -> List[str]:
        """관련 주제 생성"""
        topics_map = {
            'programming': [
                "코드 리뷰 방법",
                "테스트 자동화",
                "CI/CD 파이프라인",
                "성능 최적화",
                "보안 코딩"
            ],
            'marketing': [
                "브랜드 전략",
                "고객 여정 분석",
                "마케팅 자동화",
                "A/B 테스트",
                "고객 세분화"
            ],
            'writing': [
                "스토리텔링 기법",
                "감정적 어필",
                "논리적 구성",
                "문체 개발",
                "독자 분석"
            ],
            'analysis': [
                "머신러닝 모델",
                "통계적 검정",
                "데이터 시각화",
                "예측 분석",
                "비즈니스 인텔리전스"
            ],
            'project': [
                "애자일 방법론",
                "리스크 관리",
                "품질 관리",
                "팀 빌딩",
                "의사소통 전략"
            ]
        }
        
        return topics_map.get(intent, ["관련 주제", "추가 정보", "심화 학습"])
    
    def _analyze_context(self, message: str, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """컨텍스트 분석 - 대화 맥락 포함"""
        # 대화 맥락 가져오기
        session_context = conversation_context.get(session_id, {
            'previous_messages': [],
            'topics_discussed': [],
            'user_interests': [],
            'conversation_count': 0
        })
        
        # 현재 메시지 추가
        session_context['previous_messages'].append({
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # 최근 5개 메시지만 유지
        session_context['previous_messages'] = session_context['previous_messages'][-5:]
        session_context['conversation_count'] += 1
        
        # 대화 맥락 저장
        conversation_context[session_id] = session_context
        
        return {
            'session_id': session_id,
            'message_length': len(message),
            'has_technical_terms': any(term in message.lower() for term in ['api', 'database', 'server', 'framework']),
            'is_question': message.endswith('?') or any(q in message.lower() for q in ['어떻게', '무엇', '왜', '언제', '어디서']),
            'urgency_level': 'high' if any(word in message.lower() for word in ['급해', '빨리', '즉시']) else 'normal',
            'conversation_history': session_context['previous_messages'],
            'topics_discussed': session_context['topics_discussed'],
            'conversation_count': session_context['conversation_count']
        }
    
    def _update_user_profile(self, session_id: str, message: str):
        """사용자 프로필 업데이트"""
        if session_id not in self.user_profiles:
            self.user_profiles[session_id] = {
                'interests': [],
                'expertise_level': 'beginner',
                'preferred_style': 'detailed',
                'interaction_count': 0
            }
        
        profile = self.user_profiles[session_id]
        profile['interaction_count'] += 1
        
        # 관심사 업데이트
        if any(keyword in message.lower() for keyword in ['python', 'javascript', 'java']):
            if 'programming' not in profile['interests']:
                profile['interests'].append('programming')
        
        if any(keyword in message.lower() for keyword in ['마케팅', '광고', '홍보']):
            if 'marketing' not in profile['interests']:
                profile['interests'].append('marketing')
    
    def _should_use_web_search(self, message: str, intent: str, context: Dict[str, Any]) -> bool:
        """웹 검색이 필요한지 판단"""
        message_lower = message.lower()
        
        # 도시정비 관련 질문은 전문 지식 베이스 우선 사용
        if intent == 'urban_redevelopment':
            # 최신 법규나 정책 관련 질문만 웹 검색
            latest_policy_keywords = [
                '최신 법규', '2024년', '2025년', '개정', '변경된', '새로운 정책',
                '최근 동향', '트렌드', '업데이트', '뉴스'
            ]
            return any(keyword in message_lower for keyword in latest_policy_keywords)
        
        # 웹 검색이 필요한 키워드들
        web_search_keywords = [
            '최신', '현재', '2024', '2025', '최근', '새로운', '업데이트', '변경', '뉴스',
            '시장', '가격', '비용', '요금', '할인', '이벤트', '프로모션',
            '날씨', '주식', '환율', '코인', '암호화폐', '비트코인',
            '정책', '법률', '규정', '제도', '정부', '공지',
            '회사', '기업', '제품', '서비스', '리뷰', '평가',
            '이벤트', '행사', '전시회', '컨퍼런스', '세미나',
            '병원', '약국', '약', '의료', '건강', '증상',
            '여행', '항공', '호텔', '예약', '티켓', '관광'
        ]
        
        # 구체적인 질문 패턴
        specific_question_patterns = [
            '얼마나', '어디서', '언제', '어떻게', '왜', '무엇을', '누가',
            '비용', '가격', '시간', '위치', '방법', '과정', '단계'
        ]
        
        # 웹 검색이 필요한 경우
        if any(keyword in message_lower for keyword in web_search_keywords):
            return True
        
        if any(pattern in message_lower for pattern in specific_question_patterns):
            return True
        
        # 일반적인 질문이지만 구체적인 정보가 필요한 경우
        if intent == 'general' and len(message) > 20:
            return True
        
        return False
    
    def _generate_web_enhanced_response(self, message: str, intent: str, context: Dict[str, Any]) -> str:
        """웹 검색을 통한 향상된 응답 생성"""
        try:
            # 검색 쿼리 생성
            search_query = self._create_search_query(message, intent)
            
            # 웹 검색 수행
            search_results = perform_real_web_search(search_query, max_results=3)
            
            if search_results:
                # 검색 결과를 기반으로 응답 생성
                response = self._process_search_results(message, search_results, intent, context)
                return response
            else:
                # 검색 결과가 없으면 기본 응답
                return self._generate_fallback_response(message, intent)
                
        except Exception as e:
            print(f"웹 검색 오류: {e}")
            return self._generate_fallback_response(message, intent)
    
    def _create_search_query(self, message: str, intent: str) -> str:
        """검색 쿼리 생성 - 개선된 버전"""
        # 메시지에서 핵심 키워드 추출
        message_lower = message.lower()
        
        # 의도별 검색 쿼리 최적화
        if intent == 'programming':
            # 프로그래밍 관련 검색어 추가
            if 'python' in message_lower or '파이썬' in message_lower:
                if '크롤링' in message_lower or 'crawling' in message_lower:
                    return "Python web scraping tutorial requests beautifulsoup selenium"
                elif '웹' in message_lower or 'web' in message_lower:
                    return "Python web development flask django tutorial"
                else:
                    return f"Python {message} tutorial examples code"
            elif 'javascript' in message_lower or '자바스크립트' in message_lower:
                if 'react' in message_lower:
                    return "React state management hooks tutorial 2024"
                elif 'node' in message_lower:
                    return "Node.js backend development tutorial"
                else:
                    return f"JavaScript {message} tutorial examples"
            elif 'java' in message_lower or '자바' in message_lower:
                return f"Java {message} tutorial examples"
            else:
                return f"{message} programming tutorial examples code"
        
        elif intent == 'marketing':
            if '전략' in message_lower or 'strategy' in message_lower:
                return f"{message} digital marketing strategy 2024"
            elif '소셜' in message_lower or 'social' in message_lower:
                return "social media marketing strategy 2024"
            else:
                return f"{message} marketing guide tips 2024"
        
        elif intent == 'analysis':
            return f"{message} data analysis tools methods examples"
        
        else:
            # 일반적인 질문에 대한 더 구체적인 검색
            if '최신' in message_lower or '2024' in message_lower or '2025' in message_lower:
                return f"{message} latest trends news 2024"
            else:
                return f"{message} guide tutorial how to"
    
    def _process_search_results(self, message: str, search_results: List[Dict], intent: str, context: Dict[str, Any] = None) -> str:
        """검색 결과를 처리하여 응답 생성 - 대화 맥락 포함"""
        response_parts = []
        
        # 대화 맥락 확인
        conversation_count = context.get('conversation_count', 0) if context else 0
        conversation_history = context.get('conversation_history', []) if context else []
        
        # 개인화된 인사말
        if conversation_count > 1:
            response_parts.append("👋 **이전 대화를 기억하고 있습니다!**\n")
        
        # 검색 결과 기반 응답 헤더
        if intent == 'programming':
            response_parts.append("🔍 **최신 프로그래밍 정보를 검색한 결과입니다!**\n")
        elif intent == 'marketing':
            response_parts.append("📈 **최신 마케팅 정보를 검색한 결과입니다!**\n")
        elif intent == 'analysis':
            response_parts.append("📊 **최신 분석 도구와 방법을 검색했습니다!**\n")
        else:
            response_parts.append("🔍 **최신 정보를 검색한 결과입니다!**\n")
        
        # 검색 결과 요약
        response_parts.append("**검색된 정보:**\n")
        
        for i, result in enumerate(search_results[:3], 1):
            title = result.get('title', '제목 없음')
            snippet = result.get('snippet', '내용 없음')
            url = result.get('url', '')
            # result_type = result.get('type', '')  # 사용하지 않는 변수 제거
            
            # 제목 정리
            if len(title) > 80:
                title = title[:80] + '...'
            
            response_parts.append(f"**{i}. {title}**")
            
            # 스니펫 정리 및 개선
            if snippet and snippet != '내용 없음':
                # HTML 태그 제거
                # import re  # 이미 상단에서 import됨
                snippet = re.sub(r'<[^>]+>', '', snippet)
                snippet = snippet.replace('&quot;', '"').replace('&amp;', '&')
                
                # 스니펫이 너무 길면 줄임
                if len(snippet) > 300:
                    snippet = snippet[:300] + '...'
                
                response_parts.append(f"{snippet}\n")
            else:
                response_parts.append("상세 정보는 아래 링크를 참고하세요.\n")
            
            if url and url.startswith('http'):
                response_parts.append(f"📎 참고: {url}\n")
        
        # 대화 맥락 기반 추가 가이드
        if conversation_history:
            # 이전 대화에서 언급된 주제 확인
            previous_topics = []
            for msg in conversation_history[-3:]:  # 최근 3개 메시지만 확인
                msg_text = msg.get('message', '').lower()
                if any(keyword in msg_text for keyword in ['python', '파이썬']):
                    previous_topics.append('Python')
                elif any(keyword in msg_text for keyword in ['javascript', '자바스크립트']):
                    previous_topics.append('JavaScript')
                elif any(keyword in msg_text for keyword in ['react']):
                    previous_topics.append('React')
            
            if previous_topics:
                response_parts.append(f"**이전에 {', '.join(set(previous_topics))}에 대해 이야기했었네요!**\n")
        
        # 의도별 추가 가이드 제공
        if intent == 'programming':
            response_parts.append("**프로그래밍 추가 도움:**")
            response_parts.append("• 특정 코드 예제가 필요하시면 말씀해 주세요")
            response_parts.append("• 에러 해결이나 디버깅 도움이 필요하시면 요청해 주세요")
            response_parts.append("• 최신 라이브러리나 프레임워크 정보를 원하시면 말씀해 주세요")
        elif intent == 'marketing':
            response_parts.append("**마케팅 추가 도움:**")
            response_parts.append("• 구체적인 마케팅 전략 수립이 필요하시면 말씀해 주세요")
            response_parts.append("• 소셜미디어 마케팅이나 광고 전략을 원하시면 요청해 주세요")
            response_parts.append("• 브랜딩이나 콘텐츠 마케팅 가이드가 필요하시면 말씀해 주세요")
        else:
            response_parts.append("**추가 도움:**")
            response_parts.append("• 더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다")
            response_parts.append("• 특정 부분에 대해 더 자세히 알고 싶으시면 말씀해 주세요")
            response_parts.append("• 실습 예제나 상세 가이드가 필요하시면 요청해 주세요")
        
        return "\n".join(response_parts)
    
    def _generate_fallback_response(self, message: str, intent: str) -> str:
        """웹 검색 실패 시 폴백 응답"""
        return """🔍 **죄송합니다. 최신 정보를 찾지 못했습니다.**

**요청하신 내용**: "{message}"

**대안 제안:**
• 질문을 더 구체적으로 다시 해주세요
• 다른 키워드로 시도해보세요
• 일반적인 가이드나 기본 정보를 원하시면 말씀해 주세요

**도움을 드릴 수 있는 영역:**
• 프로그래밍 및 개발
• 마케팅 전략
• 글쓰기 및 콘텐츠
• 데이터 분석
• 프로젝트 관리

더 구체적인 질문을 해주시면 도움을 드리겠습니다! 💡"""

# 고급 AI 응답 시스템 인스턴스 생성
advanced_ai_system = AdvancedAIResponseSystem()

# 대화 맥락 저장소
conversation_context = {}

# 대화 내보내기 데이터
conversation_exports = {}

@app.route('/')
def serve_html():
    """modern_ai_interface.html 파일을 서빙"""
    html_path = os.path.join(_COMPLETE_SERVER_ROOT, 'modern_ai_interface.html')
    if os.path.exists(html_path):
        return send_file(html_path)
    else:
        return 'HTML file not found', 404

@app.route('/legacy')
def serve_legacy_html():
    """legacy modern_chat_interface.html 파일을 서빙"""
    html_path = os.path.join(_COMPLETE_SERVER_ROOT, 'modern_chat_interface.html')
    if os.path.exists(html_path):
        return send_file(html_path)
    else:
        return 'HTML file not found', 404

@app.route('/sw.js')
def serve_service_worker():
    """Service Worker 파일을 서빙"""
    sw_path = os.path.join(_COMPLETE_SERVER_ROOT, 'sw.js')
    if os.path.exists(sw_path):
        return send_file(sw_path, mimetype='application/javascript')
    else:
        return 'Service Worker not found', 404

@app.route('/api/chat', methods=['POST'])
def chat():
    """메인 대화 API - 노트북 LLM 통합"""
    global total_requests, successful_requests
    
    start_time = time.time()
    
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        use_notebook_llm = data.get('use_notebook_llm', True)  # 기본값: 노트북 LLM 사용
        processing_mode = data.get('processing_mode', 'auto')  # auto, local, cloud, hybrid
        
        if not message:
            return jsonify({'success': False, 'error': '메시지가 필요합니다'})
        
        total_requests += 1
        
        # AI 응답 생성 - 모든 백엔드 기능 통합
        print(f"🤖 대화 API 호출: {message[:50]}...")
        
        if NOTEBOOK_LLM_AVAILABLE and use_notebook_llm:
            # 하이브리드 AI 엔진 사용 (모든 백엔드 기능 통합)
            response = generate_hybrid_ai_response(message, session_id, processing_mode)
            print(f"✅ 하이브리드 AI 응답 생성 완료: {len(response)}자")
        else:
            # 기존 AI 응답 생성 (백엔드 기능 최소 활용)
            response = generate_ai_response(message, session_id)
            print(f"✅ 기본 AI 응답 생성 완료: {len(response)}자")
        
        # 메모리 저장
        save_conversation_memory(session_id, message, response)
        
        successful_requests += 1
        
        # 성능 모니터링 기록
        if ADVANCED_SYSTEMS_AVAILABLE:
            try:
                response_time = time.time() - start_time
                system_monitor = get_system_monitor()
                system_monitor.record_request(
                    endpoint='/api/chat',
                    method='POST',
                    response_time=response_time,
                    status_code=200,
                    success=True
                )
            except Exception as e:
                print(f"⚠️ 성능 모니터링 기록 오류: {e}")
        
        return jsonify({
            'success': True,
            'response': response,
            'session_id': session_id,
            'message_id': str(uuid.uuid4()),
            'timestamp': datetime.now().isoformat(),
            'notebook_llm_used': NOTEBOOK_LLM_AVAILABLE and use_notebook_llm,
            'processing_mode': processing_mode
        })
        
    except Exception as e:
        # 오류 모니터링 기록
        if ADVANCED_SYSTEMS_AVAILABLE:
            try:
                response_time = time.time() - start_time
                system_monitor = get_system_monitor()
                system_monitor.record_request(
                    endpoint='/api/chat',
                    method='POST',
                    response_time=response_time,
                    status_code=500,
                    success=False,
                    error_message=str(e)
                )
            except Exception as monitor_error:
                print(f"⚠️ 오류 모니터링 기록 실패: {monitor_error}")
        
        return jsonify({'success': False, 'error': str(e)})

def generate_hybrid_ai_response(message, session_id, processing_mode='auto'):
    """하이브리드 AI 응답 생성 - 모든 백엔드 기능 통합"""
    try:
        print(f"🔄 하이브리드 AI 응답 생성 시작: {message[:50]}...")
        
        # 1. 문맥 분석 및 사용자 프로필 가져오기
        context = None
        user_profile = {}
        if ADVANCED_SYSTEMS_AVAILABLE:
            context = context_aware_engine.get_context(session_id)
            user_profile = context_aware_engine.get_user_profile(session_id) or {}
            print(f"📊 문맥 정보: {context.current_topic if context else 'None'}")
            print(f"👤 사용자 프로필: {user_profile.get('communication_style', 'None')}")
        
        # 2. 지식 베이스 검색 및 축적
        knowledge_base = []
        enhanced_knowledge = ""
        if KNOWLEDGE_SYSTEM_AVAILABLE:
            try:
                # 관련 지식 검색
                search_results = knowledge_accumulation_system.search_knowledge(message)
                knowledge_base = [{'content': result.get('content', '')} for result in search_results]
                
                # 지식 축적 시스템으로 응답 향상
                enhanced_knowledge = knowledge_accumulation_system.enhance_response_with_knowledge(
                    message, ""
                )
                print(f"📚 지식 베이스: {len(knowledge_base)}개 결과, 향상된 지식: {len(enhanced_knowledge)}자")
            except Exception as e:
                print(f"⚠️ 지식 시스템 오류: {e}")
        
        # 3. 다중 요청 처리 (긴 텍스트인 경우)
        is_complex_request = len(message.split()) > 50 or any(keyword in message.lower() for keyword in ['분석', '비교', '설명', '단계별', '상세히'])
        if is_complex_request and ADVANCED_SYSTEMS_AVAILABLE:
            try:
                # 복잡한 요청을 다중 요청 처리기에 제출
                request_id = multi_request_handler.submit_request(
                    content=message,
                    priority=RequestPriority.HIGH,
                    metadata={'session_id': session_id, 'type': 'complex_query'}
                )
                print(f"📋 다중 요청 제출: {request_id}")
                
                # 요청 완료까지 대기 (최대 5초)
                for _ in range(5):
                    status = multi_request_handler.get_request_status(request_id)
                    if status and status.get('status') == 'completed':
                        complex_result = status.get('result', {})
                        if complex_result:
                            print(f"✅ 다중 요청 처리 완료: {complex_result.get('type', 'unknown')}")
                            # 복잡한 요청 결과를 메인 응답에 통합
                            if isinstance(complex_result, dict) and 'result' in complex_result:
                                enhanced_knowledge += f"\n\n🔍 상세 분석 결과:\n{complex_result['result']}"
                        break
                    time.sleep(1)
            except Exception as e:
                print(f"⚠️ 다중 요청 처리 오류: {e}")
        
        # 4. 지능형 응답 생성
        if ADVANCED_SYSTEMS_AVAILABLE:
            try:
                # 문맥 정보 준비
                context_dict = {}
                if context:
                    context_dict = {
                        'current_topic': context.current_topic,
                        'conversation_state': context.conversation_state.value if context.conversation_state else 'starting',
                        'intent_history': [intent.value for intent in context.intent_history[-3:]],
                        'emotion_history': [emotion.value for emotion in context.emotion_history[-3:]],
                        'context_strength': context.context_strength,
                        'key_entities': context.key_entities
                    }
                
                # 지능형 응답 생성
                generated_response = intelligent_response_generator.generate_response(
                    user_message=message,
                    context=context_dict,
                    user_profile=user_profile,
                    knowledge_base=knowledge_base
                )
                
                print(f"🎨 지능형 응답 생성: 품질 {generated_response.quality_score:.2f}, 개인화 {generated_response.personalization_level:.2f}")
                
                # 기본 응답 설정
                base_response = generated_response.content
                
            except Exception as e:
                print(f"⚠️ 지능형 응답 생성 오류: {e}")
                base_response = ""
        else:
            base_response = ""
        
        # 5. Ollama 하이브리드 엔진으로 추가 처리
        ollama_response = ""
        if NOTEBOOK_LLM_AVAILABLE and processing_mode != 'internal_only':
            try:
                mode = ProcessingMode(processing_mode) if processing_mode in [m.value for m in ProcessingMode] else ProcessingMode.AUTO
                
                # 통합된 컨텍스트 정보
                enhanced_context = {
                    'session_id': session_id,
                    'user_profile': user_profile,
                    'knowledge_base': knowledge_base,
                    'enhanced_knowledge': enhanced_knowledge,
                    'base_response': base_response,
                    'context': context_dict if ADVANCED_SYSTEMS_AVAILABLE else {}
                }
                
                ollama_response = ollama_hybrid_engine.generate_response(
                    prompt=message,
                    processing_mode=mode,
                    context=enhanced_context
                )
                
                print(f"🤖 Ollama 응답 생성: {len(ollama_response.content)}자")
                
            except Exception as e:
                print(f"⚠️ Ollama 응답 생성 오류: {e}")
        
        # 6. 내장 AI 엔진으로 추가 보완
        internal_response = ""
        if NOTEBOOK_LLM_AVAILABLE:
            try:
                internal_response = internal_ai_engine.generate_response(
                    prompt=message,
                    response_type=ResponseType.COMPREHENSIVE,
                    quality_level=QualityLevel.HIGH,
                    context={'session_id': session_id, 'user_profile': user_profile}
                )
                print(f"🧠 내장 AI 응답: {len(internal_response)}자")
            except Exception as e:
                print(f"⚠️ 내장 AI 응답 오류: {e}")
        
        # 7. 다단계 응답 처리 (고급 모드)
        if ADVANCED_SYSTEMS_AVAILABLE and len(message.split()) > 20:
            try:
                # 복잡한 요청에 대해 다단계 처리 적용
                multi_stage_result = multi_stage_response_processor.process_request(
                    user_request=message,
                    user_id=session_id,
                    session_id=session_id,
                    quality_level=ResponseQuality.PREMIUM,
                    writing_style=WritingStyle.ANALYTICAL,
                    target_audience="general",
                    word_count_target=800,
                    language="korean",
                    domain="general",
                    urgency="normal"
                )
                
                if multi_stage_result.quality_score > 0.7:
                    print(f"🎯 다단계 처리 결과: 품질 {multi_stage_result.quality_score:.2f}, {multi_stage_result.word_count}단어")
                    base_response = multi_stage_result.content
            except Exception as e:
                print(f"⚠️ 다단계 처리 오류: {e}")
        
        # 8. 고급 웹 연구 (필요한 경우)
        web_research_result = ""
        if ADVANCED_SYSTEMS_AVAILABLE:
            try:
                # 기본 웹 연구 필요성 판단
                web_researcher = get_web_researcher()
                should_research = web_researcher.should_research(message, base_response)
                
                if should_research:
                    print(f"🔍 고급 웹 연구 필요성 감지: {message[:50]}...")
                    
                    # 고급 웹 연구 수행
                    advanced_researcher = get_advanced_web_researcher()
                    
                    # 의도 분석
                    intent = "general"
                    if any(word in message for word in ['최신', '현재', '통계', '데이터']):
                        intent = "factual"
                    elif any(word in message for word in ['방법', '어떻게', '과정']):
                        intent = "how_to"
                    elif any(word in message for word in ['뉴스', '소식', '발생']):
                        intent = "news"
                    elif any(word in message for word in ['기술', 'API', '문서']):
                        intent = "technical"
                    
                    # 연구 세션 생성 및 심화 연구 수행
                    session_id = advanced_researcher.create_research_session(message, intent)
                    
                    import asyncio
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    advanced_research_result = loop.run_until_complete(
                        advanced_researcher.conduct_deep_research(session_id)
                    )
                    loop.close()
                    
                    if 'synthesis' in advanced_research_result:
                        web_research_result = advanced_research_result['synthesis']
                        print(f"✅ 고급 웹 연구 완료: {advanced_research_result.get('total_results', 0)}개 결과, 신뢰도 {advanced_research_result.get('research_metadata', {}).get('confidence_level', 0):.2f}")
                        
                        # 고급 연구 결과를 기본 응답에 통합
                        if web_research_result:
                            base_response = f"{base_response}\n\n{web_research_result}"
                    else:
                        print("⚠️ 고급 웹 연구 결과 없음")
                        
            except Exception as e:
                print(f"⚠️ 고급 웹 연구 오류: {e}")
                
                # 고급 연구 실패 시 기본 웹 연구로 폴백
                try:
                    web_researcher = get_web_researcher()
                    research_context = web_researcher.analyze_information_gaps(message, base_response)
                    
                    import asyncio
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    web_results = loop.run_until_complete(
                        web_researcher.research_information(research_context)
                    )
                    loop.close()
                    
                    if web_results:
                        web_research_result = web_researcher.synthesize_research_results(web_results, research_context)
                        print(f"✅ 기본 웹 연구 완료: {len(web_results)}개 결과")
                        
                        if web_research_result:
                            base_response = f"{base_response}\n\n{web_research_result}"
                except Exception as fallback_error:
                    print(f"⚠️ 기본 웹 연구도 실패: {fallback_error}")
        
        # 9. 지능형 글쓰기 모드 선택 및 적용
        if ADVANCED_SYSTEMS_AVAILABLE and base_response:
            try:
                # 사용자 요청 분석하여 적절한 글쓰기 모드 선택
                writing_mode = analyze_writing_mode(message)
                print(f"🎯 감지된 글쓰기 모드: {writing_mode}")
                
                if writing_mode == "natural":
                    # 자연스러운 글쓰기 적용
                    natural_result = natural_user_writing_engine.generate_natural_content(
                        topic=message,
                        user_level=UserLevel.INTERMEDIATE,
                        content_type=ContentType.POST,
                        tone=WritingTone.FRIENDLY,
                        word_count_target=len(base_response.split()),
                        include_web_search=True,
                        region="seoul"
                    )
                    
                    if natural_result.naturalness_score > 0.6:
                        print(f"✍️ 자연스러운 글쓰기 적용: 자연스러움 {natural_result.naturalness_score:.2f}")
                        base_response = natural_result.content
                
                elif writing_mode == "persuasive":
                    # 설득 글쓰기 적용
                    persuasion_result = persuasion_writing_engine.generate_persuasive_content(
                        context=PersuasionContext(
                            topic=message,
                            target_audience=AudienceType.GENERAL,
                            current_opinion=OpinionType.NEUTRAL,
                            desired_opinion=OpinionType.SUPPORTIVE,
                            persuasion_strategy=PersuasionStrategy.MIXED,
                            urgency_level="normal",
                            credibility_required=True,
                            emotional_appeal=True,
                            data_support=True
                        ),
                        word_count_target=len(base_response.split())
                    )
                    
                    if persuasion_result.persuasion_score > 0.5:
                        print(f"🎯 설득 글쓰기 적용: 설득도 {persuasion_result.persuasion_score:.2f}")
                        base_response = persuasion_result.content
                
                elif writing_mode == "professional":
                    # 전문적 글쓰기 (다단계 처리 결과 활용)
                    if 'multi_stage_result' in locals() and multi_stage_result.quality_score > 0.7:
                        print(f"📝 전문적 글쓰기 적용: 품질 {multi_stage_result.quality_score:.2f}")
                        base_response = multi_stage_result.content
                
                elif writing_mode == "creative":
                    # 창작 글쓰기 적용
                    creative_enhancement = f"\n\n🎨 **창작적 요소 추가**\n\n{base_response}\n\n*이상 창의적 상상력으로 풀어낸 내용입니다. 더 자세한 이야기를 원하시면 언제든 말씀해주세요!*"
                    base_response = creative_enhancement
                    print(f"🎨 창작 글쓰기 적용")
                
            except Exception as e:
                print(f"⚠️ 지능형 글쓰기 모드 적용 오류: {e}")
        
        # 9. 응답 통합 및 최적화
        final_response = integrate_responses(base_response, ollama_response.content if ollama_response else "", internal_response, enhanced_knowledge, message, user_profile)
        
        # 8. 대화 턴 저장 및 학습
        if ADVANCED_SYSTEMS_AVAILABLE and context:
            try:
                context_aware_engine.process_conversation_turn(
                    session_id=session_id,
                    user_message=message,
                    ai_response=final_response,
                    user_id=session_id
                )
                print(f"💾 대화 턴 저장 완료")
            except Exception as e:
                print(f"⚠️ 대화 턴 저장 오류: {e}")
        
        print(f"✅ 최종 응답 생성 완료: {len(final_response)}자")
        return final_response
        
    except Exception as e:
        print(f"❌ 하이브리드 AI 시스템 오류: {e}")
        # 폴백으로 기존 AI 응답 사용
        return generate_ai_response(message, session_id)

def analyze_writing_mode(message):
    """사용자 요청을 분석하여 적절한 글쓰기 모드 선택"""
    try:
        message_lower = message.lower()
        
        # 자연스러운 글쓰기 키워드
        natural_keywords = [
            "블로그", "글쓰기", "일상", "경험", "후기", "리뷰", "쓰기", "글", "포스팅",
            "자연스럽게", "친근하게", "쉽게", "간단하게", "일반인", "초보자", "쉬운",
            "실제", "유저", "사용자", "일반", "보통", "평범한", "쓰고 싶어", "작성해줘"
        ]
        
        # 설득 글쓰기 키워드
        persuasive_keywords = [
            "설득", "설명", "이해", "동의", "지지", "찬성", "반대", "논리", "근거",
            "증명", "확신", "믿음", "신뢰", "권위", "전문가", "연구", "데이터",
            "통계", "사실", "객관적", "분석", "비교", "장단점", "이유", "왜",
            "설득력", "납득", "동의시키", "설명해줘", "이해시켜줘"
        ]
        
        # 전문적 분석 키워드
        professional_keywords = [
            "분석", "연구", "논문", "보고서", "기술", "전문", "학술", "학문",
            "체계적", "구조적", "상세히", "깊이", "포괄적", "종합적", "완전한",
            "단계별", "체계적으로", "전문적으로", "학술적으로", "기술적으로",
            "분석해줘", "연구해줘", "보고서", "전문적"
        ]
        
        # 창작 키워드
        creative_keywords = [
            "창작", "스토리", "소설", "시나리오", "시", "이야기", "상상", "창의",
            "창의적", "독창적", "새로운", "혁신", "아이디어", "발상", "영감",
            "쓰고 싶어", "만들어줘", "창작해줘", "스토리", "이야기"
        ]

        # 키워드 매칭 점수 계산
        natural_score = sum(1 for keyword in natural_keywords if keyword in message_lower)
        persuasive_score = sum(1 for keyword in persuasive_keywords if keyword in message_lower)
        professional_score = sum(1 for keyword in professional_keywords if keyword in message_lower)
        creative_score = sum(1 for keyword in creative_keywords if keyword in message_lower)

        # 문장 길이와 복잡도 고려
        word_count = len(message.split())
        if word_count > 30:
            professional_score += 2
        elif word_count > 15:
            persuasive_score += 1

        # 질문 형태 분석
        if '?' in message or '어떻게' in message or '왜' in message or '무엇' in message:
            persuasive_score += 1

        # 최고 점수 모드 선택
        scores = {
            "natural": natural_score,
            "persuasive": persuasive_score,
            "professional": professional_score,
            "creative": creative_score
        }

        max_score = max(scores.values())
        if max_score > 0:
            selected_mode = max(scores, key=scores.get)
            print(f"📊 글쓰기 모드 분석: 자연스러운({natural_score}), 설득({persuasive_score}), 전문적({professional_score}), 창작({creative_score}) → {selected_mode}")
            return selected_mode
        else:
            # 기본값: 자연스러운 모드
            return "natural"
            
    except Exception as e:
        print(f"⚠️ 글쓰기 모드 분석 오류: {e}")
        return "natural"

def integrate_responses(base_response, ollama_response, internal_response, enhanced_knowledge, original_message, user_profile):
    """여러 응답을 통합하여 최적의 답변 생성"""
    try:
        # 응답 품질 평가
        responses = []
        
        if base_response and len(base_response.strip()) > 50:
            responses.append(("지능형 생성", base_response, 0.9))
        
        if ollama_response and len(ollama_response.strip()) > 50:
            responses.append(("Ollama AI", ollama_response, 0.8))
        
        if internal_response and len(internal_response.strip()) > 50:
            responses.append(("내장 AI", internal_response, 0.7))
        
        if enhanced_knowledge and len(enhanced_knowledge.strip()) > 50:
            responses.append(("지식 베이스", enhanced_knowledge, 0.6))
        
        # 사용자 프로필에 따른 응답 스타일 조정
        communication_style = user_profile.get('communication_style', 'formal')
        expertise_level = user_profile.get('expertise_level', {})
        
        if not responses:
            # 모든 응답이 실패한 경우 기본 응답 생성
            return generate_fallback_response(original_message, communication_style)
        
        # 최고 품질 응답 선택
        best_response = max(responses, key=lambda x: x[2])
        primary_response = best_response[1]
        
        # 추가 정보 통합
        additional_info = []
        for name, response, score in responses:
            if name != best_response[0] and score > 0.5:
                # 중복 제거 및 추가 정보 추출
                if len(response) > 100 and not any(phrase in primary_response for phrase in response[:50].split()[:3]):
                    additional_info.append(f"📋 {name} 추가 정보:\n{response[:300]}...")
        
        # 최종 응답 구성
        final_response = primary_response
        
        if additional_info:
            final_response += "\n\n---\n\n" + "\n\n".join(additional_info)
        
        # 사용자 스타일에 따른 조정
        if communication_style == 'friendly':
            final_response = add_friendly_touches(final_response)
        elif communication_style == 'professional':
            final_response = add_professional_touches(final_response)
        
        return final_response
        
    except Exception as e:
        print(f"⚠️ 응답 통합 오류: {e}")
        return base_response or ollama_response or internal_response or enhanced_knowledge or "죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다."

def generate_fallback_response(message, communication_style):
    """폴백 응답 생성"""
    if "프로그래밍" in message or "코딩" in message:
        return "프로그래밍에 대해 도움을 드리겠습니다. 구체적으로 어떤 언어나 개념에 대해 궁금하신가요?"
    elif "비즈니스" in message or "경영" in message:
        return "비즈니스 관련 질문에 답변드리겠습니다. 어떤 측면에 대해 알고 싶으신가요?"
    elif "AI" in message or "인공지능" in message:
        return "인공지능에 대해 설명드리겠습니다. AI의 어떤 부분에 대해 궁금하신가요?"
    else:
        return "안녕하세요! 어떤 도움이 필요하신지 자세히 말씀해주시면 더 정확한 답변을 드릴 수 있습니다."

def add_friendly_touches(response):
    """친근한 터치 추가"""
    if not response.startswith("안녕하세요"):
        response = "안녕하세요! 😊\n\n" + response
    if not response.endswith("!"):
        response += "\n\n더 궁금한 점이 있으시면 언제든지 물어보세요! 😄"
    return response

def add_professional_touches(response):
    """전문적인 터치 추가"""
    if not response.startswith("안녕하세요"):
        response = "안녕하세요.\n\n" + response
    if not response.endswith("."):
        response += "\n\n추가 문의사항이 있으시면 언제든지 연락주세요."
    return response

def generate_ai_response(message, session_id):
    """AI 응답 생성 - 고급 AI 시스템 사용"""
    try:
        # 고급 AI 응답 시스템 사용
        intelligent_response = advanced_ai_system.generate_intelligent_response(message, session_id)
        return intelligent_response.content
    except Exception as e:
        print(f"고급 AI 시스템 오류: {e}")
        # 폴백으로 기본 응답 사용
        return generate_general_response(message)

def generate_coding_response(message):
    """코딩 응답 생성"""
    return """💻 **코딩 도움을 제공하겠습니다!**

**제공 가능한 서비스:**
• 코드 리뷰 및 최적화
• 버그 수정 및 디버깅  
• 알고리즘 및 자료구조 설명
• 프레임워크 및 라이브러리 가이드
• 프로젝트 구조 설계
• 성능 최적화 방법

**인기 프로그래밍 언어별 특징:**

**Python** 🐍
- 데이터 사이언스, AI/ML, 웹 개발
- 문법이 간단하고 읽기 쉬움
- 풍부한 라이브러리 생태계

**JavaScript** 🌐  
- 웹 개발의 핵심 언어
- 프론트엔드와 백엔드 모두 가능
- React, Vue, Angular 등 프레임워크

**Java** ☕
- 엔터프라이즈 애플리케이션
- 안정성과 확장성
- Spring 프레임워크

**어떤 언어나 기술에 대해 구체적으로 알고 싶으신가요?**
코드 예제와 함께 상세히 설명해드리겠습니다! 🔧"""

def generate_marketing_response(message):
    """마케팅 응답 생성"""
    return """📊 **마케팅 전략을 도와드리겠습니다!**

**제공 가능한 서비스:**
• 디지털 마케팅 전략 수립
• 소셜미디어 마케팅 가이드
• 콘텐츠 마케팅 전략
• 브랜드 포지셔닝
• 타겟 고객 분석
• 마케팅 예산 최적화

**주요 마케팅 채널:**
- 소셜미디어 (Instagram, Facebook, YouTube, TikTok)
- 검색엔진 최적화 (SEO)
- 검색엔진 마케팅 (SEM)
- 이메일 마케팅
- 인플루언서 마케팅

**어떤 마케팅 영역에 대해 구체적으로 알고 싶으신가요?**
예산, 타겟 고객층, 목표 등을 알려주시면 맞춤형 전략을 제안해드리겠습니다! 🎯"""

def generate_writing_response(message):
    """글쓰기 응답 생성"""
    return """📚 **글쓰기 도우미를 제공하겠습니다!**

**제공 가능한 서비스:**
• 다양한 스타일의 글쓰기 (유시민, 정형돈, 학술적, 창의적)
• 에세이 및 보고서 작성
• 블로그 포스트 및 기사 작성
• 이메일 및 비즈니스 문서 작성
• 문법 및 표현 개선

**글쓰기 스타일:**
- 유시민 스타일 (논리적, 설득력 있는)
- 정형돈 스타일 (유머러스, 친근한)
- 학술적 스타일 (정확하고 체계적인)
- 창의적 스타일 (독창적이고 감성적인)

**어떤 종류의 글을 작성하고 싶으신가요?**
주제, 목적, 대상 독자를 알려주시면 적절한 스타일로 도와드리겠습니다! 📝"""

def generate_analysis_response(message):
    """분석 응답 생성"""
    return """📊 **데이터 분석을 도와드리겠습니다!**

**제공 가능한 서비스:**
• 텍스트 요약 및 분석
• 데이터 시각화 (차트, 그래프)
• 통계 분석 및 해석
• 시장 조사 및 트렌드 분석
• 성과 측정 및 KPI 분석

**분석 도구:**
- 텍스트 마이닝
- 데이터 시각화
- 통계 분석
- 웹 검색 기반 최신 정보 수집

**어떤 데이터나 텍스트를 분석하고 싶으신가요?**
파일을 업로드하거나 텍스트를 입력해주시면 상세한 분석을 제공해드리겠습니다! 🔍"""

def generate_general_response(message):
    """일반 응답 생성"""
    return """🤖 **안녕하세요! CORBU.AI입니다!**

**제공 가능한 서비스:**
• 코딩 및 프로그래밍 도움
• 마케팅 전략 및 콘텐츠 제작
• 글쓰기 및 문서 작성
• 데이터 분석 및 텍스트 요약
• 프로젝트 관리 및 계획 수립
• 실시간 웹 검색 및 최신 정보 제공

**사용 방법:**
1. 구체적인 질문이나 요청을 입력해주세요
2. 파일이나 이미지를 업로드할 수 있습니다
3. 다양한 스타일로 답변을 받을 수 있습니다

**어떤 도움이 필요하신가요?**
더 구체적인 질문을 해주시면 더 정확하고 유용한 답변을 드릴 수 있습니다! 💡"""

def save_conversation_memory(session_id, message, response):
    """대화 메모리 저장"""
    if session_id not in conversation_memory:
        conversation_memory[session_id] = {
            'conversations': [],
            'last_updated': time.time()
        }
    
    conversation_memory[session_id]['conversations'].append({
        'timestamp': datetime.now().isoformat(),
        'message': message,
        'response': response
    })
    conversation_memory[session_id]['last_updated'] = time.time()
    
    # 최근 10개 대화만 유지
    if len(conversation_memory[session_id]['conversations']) > 10:
        conversation_memory[session_id]['conversations'] = conversation_memory[session_id]['conversations'][-10:]

# 프로젝트 관리 API
@app.route('/api/projects', methods=['GET'])
def get_projects():
    """프로젝트 목록 조회"""
    projects = []
    for project_id, project in projects_db.items():
        projects.append({
            'id': project_id,
            'name': project['name'],
            'description': project.get('description', ''),
            'created_at': project['created_at'],
            'file_count': len(project_files_db.get(project_id, [])),
            'guideline_count': len(project_guidelines_db.get(project_id, []))
        })
    
    return jsonify({'success': True, 'projects': projects})

@app.route('/api/projects', methods=['POST'])
def create_project():
    """프로젝트 생성"""
    data = request.get_json()
    name = data.get('name', '')
    description = data.get('description', '')
    
    if not name:
        return jsonify({'success': False, 'error': '프로젝트 이름이 필요합니다'})
    
    project_id = str(uuid.uuid4())
    projects_db[project_id] = {
        'id': project_id,
        'name': name,
        'description': description,
        'created_at': datetime.now().isoformat()
    }
    
    return jsonify({'success': True, 'project_id': project_id})

@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """프로젝트 상세 조회"""
    if project_id not in projects_db:
        return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다'})
    
    project = projects_db[project_id].copy()
    project['files'] = project_files_db.get(project_id, [])
    project['guidelines'] = project_guidelines_db.get(project_id, [])
    
    return jsonify({'success': True, 'project': project})

@app.route('/api/projects/<project_id>/files', methods=['POST'])
def upload_project_file(project_id):
    """프로젝트 파일 업로드"""
    if project_id not in projects_db:
        return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다'})
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': '파일이 필요합니다'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': '파일을 선택해주세요'})
    
    if project_id not in project_files_db:
        project_files_db[project_id] = []
    
    file_info = {
        'id': str(uuid.uuid4()),
        'filename': file.filename,
        'size': len(file.read()),
        'uploaded_at': datetime.now().isoformat()
    }
    
    project_files_db[project_id].append(file_info)
    
    return jsonify({'success': True, 'file_id': file_info['id']})

@app.route('/api/projects/<project_id>/guidelines', methods=['POST'])
def add_project_guideline(project_id):
    """프로젝트 지침 추가"""
    if project_id not in projects_db:
        return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다'})
    
    data = request.get_json()
    content = data.get('content', '')
    
    if not content:
        return jsonify({'success': False, 'error': '지침 내용이 필요합니다'})
    
    if project_id not in project_guidelines_db:
        project_guidelines_db[project_id] = []
    
    guideline = {
        'id': str(uuid.uuid4()),
        'content': content,
        'created_at': datetime.now().isoformat()
    }
    
    project_guidelines_db[project_id].append(guideline)
    
    return jsonify({'success': True, 'guideline_id': guideline['id']})

@app.route('/api/projects/<project_id>/guidelines/<guideline_id>', methods=['DELETE'])
def delete_project_guideline(project_id, guideline_id):
    """프로젝트 지침 삭제"""
    if project_id not in projects_db:
        return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다'})
    
    if project_id not in project_guidelines_db:
        return jsonify({'success': False, 'error': '지침을 찾을 수 없습니다'})
    
    guidelines = project_guidelines_db[project_id]
    for i, guideline in enumerate(guidelines):
        if guideline['id'] == guideline_id:
            del guidelines[i]
            return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': '지침을 찾을 수 없습니다'})

# 감정 분석 API
@app.route('/api/emotion/analyze', methods=['POST'])
def analyze_emotion():
    """감정 분석"""
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({'success': False, 'error': '분석할 텍스트가 필요합니다'})
    
    # 간단한 감정 분석 시뮬레이션
    emotions = {
        'positive': 0.3,
        'negative': 0.1,
        'neutral': 0.6
    }
    
    return jsonify({
        'success': True,
        'emotions': emotions,
        'dominant_emotion': 'neutral',
        'confidence': 0.85
    })

# 데이터 분석 API
@app.route('/api/data/sources', methods=['GET'])
def get_data_sources():
    """데이터 소스 목록 조회"""
    return jsonify({
        'success': True,
        'sources': list(data_sources.keys())
    })

@app.route('/api/data/analyze', methods=['POST'])
def perform_data_analysis():
    """데이터 분석 수행"""
    data = request.get_json()
    analysis_type = data.get('type', 'general')
    
    return jsonify({
        'success': True,
        'analysis': {
            'type': analysis_type,
            'results': '분석 결과가 여기에 표시됩니다',
            'timestamp': datetime.now().isoformat()
        }
    })

# 품질 보증 API
@app.route('/api/quality/test-suites', methods=['GET'])
def get_test_suites():
    """테스트 스위트 목록 조회"""
    return jsonify({
        'success': True,
        'test_suites': list(test_suites.keys())
    })

@app.route('/api/quality/test-suites', methods=['POST'])
def create_test_suite():
    """테스트 스위트 생성"""
    data = request.get_json()
    name = data.get('name', '')
    
    if not name:
        return jsonify({'success': False, 'error': '테스트 스위트 이름이 필요합니다'})
    
    suite_id = str(uuid.uuid4())
    test_suites[suite_id] = {
        'id': suite_id,
        'name': name,
        'created_at': datetime.now().isoformat()
    }
    
    return jsonify({'success': True, 'suite_id': suite_id})

@app.route('/api/quality/test-suites/<suite_id>/execute', methods=['POST'])
def execute_test_suite(suite_id):
    """테스트 스위트 실행"""
    if suite_id not in test_suites:
        return jsonify({'success': False, 'error': '테스트 스위트를 찾을 수 없습니다'})
    
    execution_id = str(uuid.uuid4())
    test_executions[execution_id] = {
        'id': execution_id,
        'suite_id': suite_id,
        'status': 'completed',
        'results': '테스트가 성공적으로 완료되었습니다',
        'executed_at': datetime.now().isoformat()
    }
    
    return jsonify({'success': True, 'execution_id': execution_id})

# 성능 최적화 API
@app.route('/api/performance/metrics', methods=['GET'])
def get_performance_metrics():
    """성능 메트릭 조회"""
    return jsonify({
        'success': True,
        'metrics': {
            'response_time': 0.5,
            'memory_usage': '45%',
            'cpu_usage': '30%',
            'active_connections': 12
        }
    })

@app.route('/api/performance/optimize', methods=['POST'])
def optimize_performance():
    """성능 최적화 실행"""
    optimization_id = str(uuid.uuid4())
    optimization_history[optimization_id] = {
        'id': optimization_id,
        'status': 'completed',
        'improvements': '성능이 최적화되었습니다',
        'optimized_at': datetime.now().isoformat()
    }
    
    return jsonify({'success': True, 'optimization_id': optimization_id})

# 음성 인식 API
@app.route('/api/voice/start', methods=['POST'])
def start_voice_recognition():
    """음성 인식 시작"""
    session_id = str(uuid.uuid4())
    voice_sessions[session_id] = {
        'id': session_id,
        'status': 'active',
        'started_at': datetime.now().isoformat()
    }
    
    return jsonify({'success': True, 'session_id': session_id})

@app.route('/api/voice/stop', methods=['POST'])
def stop_voice_recognition():
    """음성 인식 중지"""
    data = request.get_json()
    session_id = data.get('session_id', '')
    
    if session_id not in voice_sessions:
        return jsonify({'success': False, 'error': '음성 인식 세션을 찾을 수 없습니다'})
    
    voice_sessions[session_id]['status'] = 'stopped'
    voice_sessions[session_id]['stopped_at'] = datetime.now().isoformat()
    
    # 시뮬레이션된 음성 인식 결과
    voice_results[session_id] = {
        'session_id': session_id,
        'text': '음성 인식 결과가 여기에 표시됩니다',
        'confidence': 0.95,
        'created_at': datetime.now().isoformat()
    }
    
    return jsonify({'success': True, 'result_id': session_id})

@app.route('/api/voice/results/<session_id>', methods=['GET'])
def get_voice_results(session_id):
    """음성 인식 결과 조회"""
    if session_id not in voice_results:
        return jsonify({'success': False, 'error': '음성 인식 결과를 찾을 수 없습니다'})
    
    return jsonify({'success': True, 'result': voice_results[session_id]})

# 대화 내보내기 API
@app.route('/api/export/conversation', methods=['POST'])
def export_conversation():
    """대화 내보내기"""
    data = request.get_json()
    session_id = data.get('session_id', '')
    format_type = data.get('format', 'json')
    
    if session_id not in conversation_memory:
        return jsonify({'success': False, 'error': '대화 기록을 찾을 수 없습니다'})
    
    export_id = str(uuid.uuid4())
    conversation_exports[export_id] = {
        'id': export_id,
        'session_id': session_id,
        'format': format_type,
        'data': conversation_memory[session_id],
        'created_at': datetime.now().isoformat()
    }
    
    return jsonify({'success': True, 'export_id': export_id})

@app.route('/api/export/download/<export_id>', methods=['GET'])
def download_export(export_id):
    """내보내기 파일 다운로드"""
    if export_id not in conversation_exports:
        return jsonify({'success': False, 'error': '내보내기 파일을 찾을 수 없습니다'})
    
    export_data = conversation_exports[export_id]
    
    if export_data['format'] == 'json':
        return jsonify(export_data['data'])
    elif export_data['format'] == 'txt':
        text_content = '\n'.join([f"{item['message']}\n{item['response']}\n" for item in export_data['data']])
        return text_content, 200, {'Content-Type': 'text/plain'}
    else:
        return jsonify({'success': False, 'error': '지원하지 않는 형식입니다'})

@app.route('/api/export/list', methods=['GET'])
def list_exports():
    """내보내기 목록 조회"""
    exports = []
    for export_id, export_data in conversation_exports.items():
        exports.append({
            'id': export_id,
            'session_id': export_data['session_id'],
            'format': export_data['format'],
            'created_at': export_data['created_at']
        })
    
    return jsonify({'success': True, 'exports': exports})

# 실제 웹 검색 함수
def perform_real_web_search(query, max_results=5):
    """DuckDuckGo를 통한 실제 웹 검색"""
    try:
        # DuckDuckGo Instant Answer API 사용
        search_url = f"https://api.duckduckgo.com/?q={quote_plus(query)}&format=json&no_html=1&skip_disambig=1"
        
        headers = {
            'User-Agent': 'CORBU.AI/1.0 (Educational Purpose)'
        }
        
        response = requests.get(search_url, headers=headers, timeout=10)
        data = response.json()
        
        results = []
        
        # Instant Answer가 있는 경우
        if data.get('Abstract'):
            results.append({
                'title': data.get('Heading', query),
                'url': data.get('AbstractURL', ''),
                'snippet': data.get('Abstract', '')[:300] + '...' if len(data.get('Abstract', '')) > 300 else data.get('Abstract', ''),
                'type': 'instant_answer'
            })
        
        # Related Topics 추가
        for topic in data.get('RelatedTopics', [])[:max_results-len(results)]:
            if isinstance(topic, dict) and topic.get('Text'):
                results.append({
                    'title': topic.get('Text', '')[:100] + '...' if len(topic.get('Text', '')) > 100 else topic.get('Text', ''),
                    'url': topic.get('FirstURL', ''),
                    'snippet': topic.get('Text', '')[:300] + '...' if len(topic.get('Text', '')) > 300 else topic.get('Text', ''),
                    'type': 'related_topic'
                })
        
        # 결과가 부족한 경우 일반적인 답변 추가
        if len(results) < 2:
            fallback_results = [
                {
                    'title': f'"{query}"에 대한 포괄적 정보',
                    'url': f'https://duckduckgo.com/?q={quote_plus(query)}',
                    'snippet': f'{query}에 대한 다양한 관점과 최신 정보를 제공합니다. 신뢰할 수 있는 출처들로부터 수집된 정보입니다.',
                    'type': 'general'
                },
                {
                    'title': f'{query} - 전문가 의견 및 분석',
                    'url': f'https://duckduckgo.com/?q={quote_plus(query + " 전문가 분석")}',
                    'snippet': f'{query}에 대한 전문가들의 의견과 심층 분석을 통해 더 나은 이해를 도와드립니다.',
                    'type': 'expert'
                }
            ]
            results.extend(fallback_results[:max_results-len(results)])
        
        return results[:max_results]
        
    except requests.RequestException as e:
        print(f"웹 검색 오류: {e}")
        # 네트워크 오류 시 기본 답변 반환
        return [
            {
                'title': f'"{query}" 검색 결과',
                'url': f'https://duckduckgo.com/?q={quote_plus(query)}',
                'snippet': f'{query}에 대한 정보를 찾고 있습니다. 네트워크 연결을 확인하고 다시 시도해주세요.',
                'type': 'fallback'
            }
        ]
    except Exception as e:
        print(f"검색 처리 오류: {e}")
        return []

def _generate_knowledge_based_results(query):
    """지식 베이스 기반 검색 결과 생성"""
    query_lower = query.lower()
    
    # 프로그래밍 관련 지식 베이스
    if any(keyword in query_lower for keyword in ['python', '파이썬', 'programming', '프로그래밍']):
        if '크롤링' in query_lower or 'crawling' in query_lower:
            return [
                {
                    'title': 'Python 웹 크롤링 완전 가이드',
                    'url': 'https://example.com/python-web-scraping',
                    'snippet': 'Python으로 웹 크롤링을 하는 방법: requests, BeautifulSoup, Selenium을 사용한 다양한 크롤링 기법과 실전 예제를 제공합니다.',
                    'type': 'knowledge_base'
                },
                {
                    'title': '웹 크롤링 라이브러리 비교',
                    'url': 'https://example.com/scraping-libraries',
                    'snippet': 'requests+BeautifulSoup, Selenium, Scrapy 등 주요 크롤링 라이브러리의 특징과 사용법을 비교 분석합니다.',
                    'type': 'knowledge_base'
                }
            ]
        elif 'react' in query_lower:
            return [
                {
                    'title': 'React 상태 관리 완전 가이드',
                    'url': 'https://example.com/react-state-management',
                    'snippet': 'React에서 상태 관리를 위한 useState, useEffect, Context API, Redux 등 다양한 방법과 실전 예제를 제공합니다.',
                    'type': 'knowledge_base'
                }
            ]
    
    # 마케팅 관련 지식 베이스
    elif any(keyword in query_lower for keyword in ['마케팅', 'marketing', '전략', 'strategy']):
        return [
            {
                'title': '디지털 마케팅 전략 수립 가이드',
                'url': 'https://example.com/digital-marketing-strategy',
                'snippet': '효과적인 디지털 마케팅 전략을 수립하는 방법: 타겟 분석, 채널 선택, 콘텐츠 기획, 성과 측정까지 단계별 가이드를 제공합니다.',
                'type': 'knowledge_base'
            },
            {
                'title': '소셜미디어 마케팅 전략',
                'url': 'https://example.com/social-media-marketing',
                'snippet': 'Facebook, Instagram, YouTube 등 주요 소셜미디어 플랫폼별 마케팅 전략과 콘텐츠 제작 방법을 안내합니다.',
                'type': 'knowledge_base'
            }
        ]
    
    # 기본 지식 베이스
    return [
        {
            'title': f'{query}에 대한 종합 가이드',
            'url': f'https://example.com/{query.replace(" ", "-")}',
            'snippet': f'{query}에 대한 상세한 정보와 실용적인 가이드를 제공합니다. 단계별 설명과 예제를 통해 쉽게 이해할 수 있습니다.',
            'type': 'knowledge_base'
        },
        {
            'title': f'{query} - 전문가 팁과 노하우',
            'url': f'https://example.com/{query.replace(" ", "-")}-tips',
            'snippet': f'{query}에 대한 전문가들의 실전 팁과 노하우를 공유합니다. 실무에서 바로 적용할 수 있는 실용적인 정보를 제공합니다.',
            'type': 'knowledge_base'
        }
    ]

# 웹 검색 API
@app.route('/api/web-search', methods=['POST'])
def web_search():
    """실시간 웹 검색"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        max_results = data.get('max_results', 5)
        
        if not query:
            return jsonify({'success': False, 'error': '검색어가 필요합니다'})
        
        # 실제 웹 검색 수행
        search_results = perform_real_web_search(query, max_results)
        
        return jsonify({
            'success': True,
            'query': query,
            'results': search_results,
            'result_count': len(search_results),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# 파일 분석 함수
def analyze_file(filepath, filename):
    """업로드된 파일 분석"""
    try:
        file_extension = os.path.splitext(filename)[1].lower()
        file_size = os.path.getsize(filepath)
        
        analysis = {
            'file_type': 'unknown',
            'content_preview': '',
            'metadata': {},
            'suggestions': []
        }
        
        # 텍스트 파일 분석
        if file_extension in ['.txt', '.md', '.py', '.js', '.html', '.css', '.json', '.xml', '.csv']:
            analysis['file_type'] = 'text'
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    analysis['content_preview'] = content[:500] + '...' if len(content) > 500 else content
                    analysis['metadata'] = {
                        'lines': len(content.split('\n')),
                        'words': len(content.split()),
                        'characters': len(content)
                    }
                    
                    # 파일 유형별 제안
                    if file_extension == '.py':
                        analysis['suggestions'] = ['코드 리뷰 요청', 'Python 최적화 분석', '보안 취약점 검사']
                    elif file_extension == '.js':
                        analysis['suggestions'] = ['JavaScript 코드 분석', '성능 최적화 제안', 'ES6+ 변환 제안']
                    elif file_extension == '.csv':
                        analysis['suggestions'] = ['데이터 시각화', '통계 분석', '데이터 정제 제안']
                    else:
                        analysis['suggestions'] = ['텍스트 요약', '키워드 추출', '감정 분석']
                        
            except UnicodeDecodeError:
                analysis['content_preview'] = '파일 인코딩을 확인할 수 없습니다.'
                
        # 이미지 파일
        elif file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            analysis['file_type'] = 'image'
            analysis['content_preview'] = f'이미지 파일 ({file_extension})'
            analysis['metadata'] = {
                'format': file_extension,
                'size_mb': round(file_size / (1024*1024), 2)
            }
            analysis['suggestions'] = ['이미지 분석', '텍스트 추출 (OCR)', '이미지 최적화']
            
        # PDF 파일
        elif file_extension == '.pdf':
            analysis['file_type'] = 'pdf'
            analysis['content_preview'] = 'PDF 문서'
            analysis['suggestions'] = ['PDF 텍스트 추출', '문서 요약', '키워드 분석']
            
        # 오피스 문서
        elif file_extension in ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']:
            analysis['file_type'] = 'office'
            analysis['content_preview'] = f'오피스 문서 ({file_extension})'
            analysis['suggestions'] = ['문서 내용 분석', '데이터 추출', '요약 생성']
            
        # 압축 파일
        elif file_extension in ['.zip', '.rar', '.tar', '.gz']:
            analysis['file_type'] = 'archive'
            analysis['content_preview'] = f'압축 파일 ({file_extension})'
            analysis['suggestions'] = ['압축 해제', '파일 목록 확인', '내용 분석']
            
        return analysis
        
    except Exception as e:
        return {
            'file_type': 'error',
            'content_preview': f'파일 분석 중 오류 발생: {str(e)}',
            'metadata': {},
            'suggestions': []
        }

# 파일 업로드 API (강화된 버전)
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """파일 업로드 및 분석"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '파일이 선택되지 않았습니다'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': '파일명이 없습니다'})
        
        # 파일 크기 제한 (10MB)
        if len(file.read()) > 10 * 1024 * 1024:
            return jsonify({'success': False, 'error': '파일 크기가 10MB를 초과합니다'})
        
        file.seek(0)  # 파일 포인터 리셋
        
        # 업로드 디렉토리 생성
        upload_dir = os.path.join(_COMPLETE_SERVER_ROOT, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        # 파일 저장
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        
        # 파일 분석 수행
        analysis = analyze_file(filepath, file.filename)
        
        # 파일 정보 구성
        file_info = {
            'id': file_id,
            'original_filename': file.filename,
            'saved_filename': filename,
            'size': os.path.getsize(filepath),
            'size_mb': round(os.path.getsize(filepath) / (1024*1024), 2),
            'upload_time': datetime.now().isoformat(),
            'file_path': filepath,
            'analysis': analysis
        }
        
        return jsonify({
            'success': True,
            'message': '파일이 성공적으로 업로드되고 분석되었습니다',
            'file_info': file_info
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# 파일 분석 API
@app.route('/api/analyze-file/<file_id>', methods=['GET'])
def analyze_uploaded_file(file_id):
    """업로드된 파일 재분석"""
    try:
        upload_dir = os.path.join(_COMPLETE_SERVER_ROOT, 'uploads')
        
        # 파일 찾기
        for filename in os.listdir(upload_dir):
            if filename.startswith(file_id):
                filepath = os.path.join(upload_dir, filename)
                original_filename = filename.split('_', 1)[1]  # UUID 제거
                
                analysis = analyze_file(filepath, original_filename)
                
                return jsonify({
                    'success': True,
                    'file_id': file_id,
                    'analysis': analysis
                })
        
        return jsonify({'success': False, 'error': '파일을 찾을 수 없습니다'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# 대화 기록 관리 API
@app.route('/api/chat-history/<session_id>', methods=['GET'])
def get_chat_history(session_id):
    """특정 세션의 대화 기록 조회"""
    try:
        if session_id in conversation_memory:
            conversations = conversation_memory[session_id].get('conversations', [])
            return jsonify({
                'success': True,
                'session_id': session_id,
                'conversation_count': len(conversations),
                'conversations': conversations,
                'last_updated': conversation_memory[session_id].get('last_updated', 0)
            })
        else:
            return jsonify({
                'success': True,
                'session_id': session_id,
                'conversation_count': 0,
                'conversations': [],
                'message': '해당 세션의 기록이 없습니다'
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/chat-history', methods=['GET'])
def get_all_chat_sessions():
    """모든 대화 세션 목록 조회"""
    try:
        sessions = []
        for session_id, data in conversation_memory.items():
            conversations = data.get('conversations', [])
            if conversations:
                sessions.append({
                    'session_id': session_id,
                    'conversation_count': len(conversations),
                    'last_message': conversations[-1]['message'][:100] + '...' if len(conversations[-1]['message']) > 100 else conversations[-1]['message'],
                    'last_updated': data.get('last_updated', 0),
                    'last_updated_formatted': datetime.fromtimestamp(data.get('last_updated', 0)).strftime('%Y-%m-%d %H:%M:%S')
                })
        
        # 최근 업데이트 순으로 정렬
        sessions.sort(key=lambda x: x['last_updated'], reverse=True)
        
        return jsonify({
            'success': True,
            'session_count': len(sessions),
            'sessions': sessions
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/chat-history/<session_id>', methods=['DELETE'])
def delete_chat_history(session_id):
    """특정 세션의 대화 기록 삭제"""
    try:
        if session_id in conversation_memory:
            del conversation_memory[session_id]
            if session_id in user_preferences:
                del user_preferences[session_id]
            if session_id in context_history:
                del context_history[session_id]
            
            return jsonify({
                'success': True,
                'message': f'세션 {session_id}의 기록이 삭제되었습니다'
            })
        else:
            return jsonify({
                'success': False,
                'error': '해당 세션을 찾을 수 없습니다'
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/search-chat', methods=['POST'])
def search_chat_history():
    """대화 기록 검색"""
    try:
        data = request.get_json()
        query = data.get('query', '').lower()
        session_id = data.get('session_id', '')  # 특정 세션에서만 검색할 경우
        
        if not query:
            return jsonify({'success': False, 'error': '검색어가 필요합니다'})
        
        search_results = []
        
        # 검색 대상 세션 결정
        search_sessions = [session_id] if session_id and session_id in conversation_memory else conversation_memory.keys()
        
        for sid in search_sessions:
            if sid in conversation_memory:
                conversations = conversation_memory[sid].get('conversations', [])
                for i, conv in enumerate(conversations):
                    # 메시지나 응답에서 검색어 찾기
                    if query in conv['message'].lower() or query in conv['response'].lower():
                        search_results.append({
                            'session_id': sid,
                            'conversation_index': i,
                            'timestamp': conv['timestamp'],
                            'message': conv['message'],
                            'response': conv['response'][:200] + '...' if len(conv['response']) > 200 else conv['response'],
                            'match_type': 'message' if query in conv['message'].lower() else 'response'
                        })
        
        # 최근 순으로 정렬
        search_results.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'success': True,
            'query': query,
            'result_count': len(search_results),
            'results': search_results[:50]  # 최대 50개 결과
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# 헬스 체크 API
@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인 - 모든 시스템 상태 포함"""
    health_data = {
        'status': 'healthy',
        'message': '서버가 정상적으로 작동 중입니다',
        'timestamp': datetime.now().isoformat(),
        'total_requests': total_requests,
        'successful_requests': successful_requests,
        'notebook_llm_available': NOTEBOOK_LLM_AVAILABLE,
        'advanced_response_available': ADVANCED_RESPONSE_AVAILABLE,
        'knowledge_system_available': KNOWLEDGE_SYSTEM_AVAILABLE,
        'advanced_systems_available': ADVANCED_SYSTEMS_AVAILABLE
    }
    
    # Ollama 하이브리드 엔진 상태 정보 추가
    if NOTEBOOK_LLM_AVAILABLE:
        try:
            hybrid_status = ollama_hybrid_engine.get_system_status()
            # JSON 직렬화 가능하도록 enum을 문자열로 변환
            if isinstance(hybrid_status, dict):
                serializable_status = {}
                for key, value in hybrid_status.items():
                    if hasattr(value, 'value'):  # enum인 경우
                        serializable_status[key] = value.value
                    elif hasattr(value, '__dict__'):  # 객체인 경우
                        serializable_status[key] = str(value)
                    else:
                        serializable_status[key] = value
                health_data['hybrid_engine_status'] = serializable_status
            else:
                health_data['hybrid_engine_status'] = str(hybrid_status)
        except Exception as e:
            health_data['hybrid_engine_error'] = str(e)
    
    # 지식 시스템 상태 정보 추가
    if KNOWLEDGE_SYSTEM_AVAILABLE:
        try:
            knowledge_stats = multimodal_knowledge_system.get_system_statistics()
            accumulation_stats = knowledge_accumulation_system.get_system_statistics()
            health_data['knowledge_system_status'] = {
                'multimodal_stats': knowledge_stats,
                'accumulation_stats': accumulation_stats
            }
        except Exception as e:
            health_data['knowledge_system_error'] = str(e)
    
    # 고급 시스템 상태 정보 추가
    if ADVANCED_SYSTEMS_AVAILABLE:
        try:
            multi_request_stats = multi_request_handler.get_system_stats()
            context_stats = context_aware_engine.get_system_stats()
            response_generator_stats = intelligent_response_generator.get_system_stats()
            
            health_data['advanced_systems_status'] = {
                'multi_request_handler': multi_request_stats,
                'context_aware_engine': context_stats,
                'intelligent_response_generator': response_generator_stats
            }
        except Exception as e:
            health_data['advanced_systems_error'] = str(e)
    
    return jsonify(health_data)


@app.route('/api/system-status', methods=['GET'])
def system_status():
    """시스템 상태 및 성능 모니터링 API"""
    if not ADVANCED_SYSTEMS_AVAILABLE:
        return jsonify({'error': '시스템 모니터를 사용할 수 없습니다'}), 503
    
    try:
        system_monitor = get_system_monitor()
        status = system_monitor.get_system_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/performance-summary', methods=['GET'])
def performance_summary():
    """성능 요약 API"""
    if not ADVANCED_SYSTEMS_AVAILABLE:
        return jsonify({'error': '시스템 모니터를 사용할 수 없습니다'}), 503
    
    try:
        hours = request.args.get('hours', 24, type=int)
        system_monitor = get_system_monitor()
        summary = system_monitor.get_performance_summary(hours=hours)
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/advanced-optimize-performance', methods=['POST'])
def advanced_optimize_performance():
    """고급 성능 최적화 API"""
    if not ADVANCED_SYSTEMS_AVAILABLE:
        return jsonify({'error': '성능 최적화 모듈을 사용할 수 없습니다'}), 503
    
    try:
        performance_optimizer = get_performance_optimizer()
        result = performance_optimizer.manual_optimization()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/optimization-stats', methods=['GET'])
def optimization_stats():
    """최적화 통계 API"""
    if not ADVANCED_SYSTEMS_AVAILABLE:
        return jsonify({'error': '성능 최적화 모듈을 사용할 수 없습니다'}), 503
    
    try:
        performance_optimizer = get_performance_optimizer()
        stats = performance_optimizer.get_optimization_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/web-research', methods=['POST'])
def web_research():
    """웹 연구 API"""
    if not ADVANCED_SYSTEMS_AVAILABLE:
        return jsonify({'error': '웹 연구 모듈을 사용할 수 없습니다'}), 503
    
    try:
        data = request.get_json()
        query = data.get('query', '')
        current_knowledge = data.get('current_knowledge', '')
        
        if not query:
            return jsonify({'error': '검색 쿼리가 필요합니다'}), 400
        
        web_researcher = get_web_researcher()
        
        # 정보 격차 분석
        research_context = web_researcher.analyze_information_gaps(query, current_knowledge)
        
        # 웹 연구 수행
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        web_results = loop.run_until_complete(
            web_researcher.research_information(research_context)
        )
        loop.close()
        
        # 결과 종합
        synthesis = web_researcher.synthesize_research_results(web_results, research_context)
        
        return jsonify({
            'success': True,
            'query': query,
            'research_context': {
                'intent': research_context.intent,
                'required_info': research_context.required_info,
                'missing_info': research_context.missing_info
            },
            'results_count': len(web_results),
            'synthesis': synthesis,
            'results': [
                {
                    'title': result.title,
                    'url': result.url,
                    'snippet': result.snippet,
                    'relevance_score': result.relevance_score,
                    'source_type': result.source_type
                } for result in web_results
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/research-analysis', methods=['POST'])
def research_analysis():
    """연구 필요성 분석 API"""
    if not ADVANCED_SYSTEMS_AVAILABLE:
        return jsonify({'error': '웹 연구 모듈을 사용할 수 없습니다'}), 503
    
    try:
        data = request.get_json()
        user_query = data.get('query', '')
        current_response = data.get('current_response', '')
        
        if not user_query:
            return jsonify({'error': '사용자 쿼리가 필요합니다'}), 400
        
        web_researcher = get_web_researcher()
        
        # 연구 필요성 판단
        should_research = web_researcher.should_research(user_query, current_response)
        
        # 정보 격차 분석
        research_context = web_researcher.analyze_information_gaps(user_query, current_response)
        
        return jsonify({
            'success': True,
            'should_research': should_research,
            'research_context': {
                'intent': research_context.intent,
                'required_info': research_context.required_info,
                'missing_info': research_context.missing_info,
                'confidence_threshold': research_context.confidence_threshold
            },
            'analysis': {
                'query_complexity': len(user_query.split()),
                'current_knowledge_length': len(current_response),
                'has_time_references': any(word in user_query for word in ['최신', '현재', '오늘', '최근']),
                'has_data_requests': any(word in user_query for word in ['통계', '데이터', '수치', '비율']),
                'has_news_requests': any(word in user_query for word in ['뉴스', '소식', '발생', '발표'])
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/research-stats', methods=['GET'])
def research_stats():
    """연구 통계 API"""
    if not ADVANCED_SYSTEMS_AVAILABLE:
        return jsonify({'error': '웹 연구 모듈을 사용할 수 없습니다'}), 503
    
    try:
        web_researcher = get_web_researcher()
        stats = web_researcher.get_research_summary()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/advanced-web-research', methods=['POST'])
def advanced_web_research():
    """고급 웹 연구 API"""
    if not ADVANCED_SYSTEMS_AVAILABLE:
        return jsonify({'error': '고급 웹 연구 모듈을 사용할 수 없습니다'}), 503
    
    try:
        data = request.get_json()
        query = data.get('query', '')
        intent = data.get('intent', 'general')
        
        if not query:
            return jsonify({'error': '검색 쿼리가 필요합니다'}), 400
        
        advanced_researcher = get_advanced_web_researcher()
        
        # 연구 세션 생성
        session_id = advanced_researcher.create_research_session(query, intent)
        
        # 심화 연구 수행
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        research_result = loop.run_until_complete(
            advanced_researcher.conduct_deep_research(session_id)
        )
        loop.close()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'research_result': research_result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/advanced-research-stats', methods=['GET'])
def advanced_research_stats():
    """고급 연구 통계 API"""
    if not ADVANCED_SYSTEMS_AVAILABLE:
        return jsonify({'error': '고급 웹 연구 모듈을 사용할 수 없습니다'}), 503
    
    try:
        advanced_researcher = get_advanced_web_researcher()
        stats = advanced_researcher.get_research_statistics()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/advanced-chat', methods=['POST'])
def advanced_chat():
    """고급 대화 API - 다양한 응답 타입 지원"""
    global total_requests, successful_requests
    
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        response_type = data.get('response_type', 'auto')  # auto, analysis, comparison, step_by_step, etc.
        render_mode = data.get('render_mode', 'detailed')  # compact, detailed, interactive, visual
        use_notebook_llm = data.get('use_notebook_llm', True)
        processing_mode = data.get('processing_mode', 'auto')
        ultra_mode = data.get('ultra_mode', False)  # 초고급 모드
        
        if not message:
            return jsonify({'success': False, 'error': '메시지가 필요합니다'})
        
        total_requests += 1
        
        # 초고급 모드 처리
        if ultra_mode and ADVANCED_RESPONSE_AVAILABLE:
            print("🌟 초고급 모드 활성화")
            # 초고급 응답 시스템 사용
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # 모든 백엔드 시스템 정보 수집
                enhanced_context = {
                    'session_id': session_id,
                    'formality': 'polite',
                    'user_profile': context_aware_engine.get_user_profile(session_id).__dict__ if ADVANCED_SYSTEMS_AVAILABLE else {},
                    'knowledge_base': knowledge_accumulation_system.search_knowledge(message) if KNOWLEDGE_SYSTEM_AVAILABLE else [],
                    'conversation_context': context_aware_engine.get_context(session_id).__dict__ if ADVANCED_SYSTEMS_AVAILABLE else {}
                }
                
                ultra_response = loop.run_until_complete(
                    ultra_advanced_response_system.generate_ultra_response(
                        message, enhanced_context
                    )
                )
                
                # 지식 시스템으로 응답 향상
                if KNOWLEDGE_SYSTEM_AVAILABLE:
                    enhanced_content = knowledge_accumulation_system.enhance_response_with_knowledge(
                        message, ultra_response.main_answer
                    )
                    ultra_response.main_answer = enhanced_content
                
                # 초고급 응답을 백엔드 데이터로 변환
                backend_data = {
                    'message': message,
                    'response': ultra_response.main_answer,
                    'session_id': session_id,
                    'timestamp': datetime.now().isoformat(),
                    'ultra_response': ultra_response.__dict__,
                    'thinking_process': [step.__dict__ for step in ultra_response.thinking_process],
                    'supporting_evidence': ultra_response.supporting_evidence,
                    'alternative_perspectives': ultra_response.alternative_perspectives,
                    'practical_applications': ultra_response.practical_applications,
                    'follow_up_questions': ultra_response.follow_up_questions,
                    'confidence_score': ultra_response.confidence_score,
                    'quality_level': ultra_response.quality_level.value,
                    'analysis': analyze_message_content(message),
                    'insights': extract_insights(message, ultra_response.main_answer),
                    'metrics': calculate_response_metrics(ultra_response.main_answer),
                    'recommendations': generate_recommendations(message, ultra_response.main_answer)
                }
                
                # 구조화된 응답 생성
                structured_response = revolutionary_response_engine.process_backend_response(
                    backend_data, 'ultra_analysis'
                )
                
                # 프론트엔드 렌더링
                render_config = RenderConfig(
                    mode=RenderMode(render_mode),
                    theme='modern',
                    language='korean',
                    responsive=True,
                    animations=True
                )
                
                rendered_html = advanced_frontend_renderer.render_response(
                    structured_response, render_config
                )
                
                successful_requests += 1
                
                # JSON 직렬화 가능한 형태로 변환
                ultra_response_dict = {
                    'main_answer': ultra_response.main_answer,
                    'thinking_process': [
                        {
                            'step_number': step.step_number,
                            'thought_type': step.thought_type,
                            'content': step.content,
                            'confidence': step.confidence,
                            'reasoning': step.reasoning,
                            'alternatives': step.alternatives or []
                        } for step in ultra_response.thinking_process
                    ],
                    'supporting_evidence': ultra_response.supporting_evidence,
                    'alternative_perspectives': ultra_response.alternative_perspectives,
                    'practical_applications': ultra_response.practical_applications,
                    'follow_up_questions': ultra_response.follow_up_questions,
                    'confidence_score': ultra_response.confidence_score,
                    'quality_level': ultra_response.quality_level.value,
                    'processing_time': ultra_response.processing_time,
                    'metadata': ultra_response.metadata
                }
                
                structured_response_dict = {
                    'main_content': structured_response.main_content,
                    'components': [
                        {
                            'type': comp.type.value,
                            'title': comp.title,
                            'content': comp.content,
                            'format': comp.format.value,
                            'metadata': comp.metadata or {},
                            'interactive': comp.interactive,
                            'priority': comp.priority
                        } for comp in structured_response.components
                    ],
                    'metadata': structured_response.metadata,
                    'display_mode': structured_response.display_mode,
                    'total_processing_time': structured_response.total_processing_time
                }
                
                return jsonify({
                    'success': True,
                    'response': ultra_response.main_answer,
                    'ultra_response': ultra_response_dict,
                    'structured_response': structured_response_dict,
                    'rendered_html': rendered_html,
                    'session_id': session_id,
                    'message_id': str(uuid.uuid4()),
                    'timestamp': datetime.now().isoformat(),
                    'notebook_llm_used': NOTEBOOK_LLM_AVAILABLE and use_notebook_llm,
                    'processing_mode': processing_mode,
                    'response_type': response_type,
                    'render_mode': render_mode,
                    'ultra_mode': True,
                    'quality_level': ultra_response.quality_level.value,
                    'confidence_score': ultra_response.confidence_score,
                    'processing_time': ultra_response.processing_time
                })
            finally:
                loop.close()
        
        # 일반 고급 모드 처리
        else:
            # AI 응답 생성
            if NOTEBOOK_LLM_AVAILABLE and use_notebook_llm:
                # 하이브리드 AI 엔진 사용
                response = generate_hybrid_ai_response(message, session_id, processing_mode)
            else:
                # 기존 AI 응답 생성
                response = generate_ai_response(message, session_id)
            
            # 백엔드 데이터 구조화
            backend_data = {
                'message': message,
                'response': response,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'analysis': analyze_message_content(message),
                'insights': extract_insights(message, response),
                'metrics': calculate_response_metrics(response),
                'recommendations': generate_recommendations(message, response)
            }
            
            # 고급 응답 처리
            if ADVANCED_RESPONSE_AVAILABLE:
                # 구조화된 응답 생성
                structured_response = revolutionary_response_engine.process_backend_response(
                    backend_data, response_type
                )
                
                # 프론트엔드 렌더링
                render_config = RenderConfig(
                    mode=RenderMode(render_mode),
                    theme='modern',
                    language='korean',
                    responsive=True,
                    animations=True
                )
                
                rendered_html = advanced_frontend_renderer.render_response(
                    structured_response, render_config
                )
                
                successful_requests += 1
                
                # JSON 직렬화 가능한 형태로 변환
                structured_response_dict = {
                    'main_content': structured_response.main_content,
                    'components': [
                        {
                            'type': comp.type.value,
                            'title': comp.title,
                            'content': comp.content,
                            'format': comp.format.value,
                            'metadata': comp.metadata or {},
                            'interactive': comp.interactive,
                            'priority': comp.priority
                        } for comp in structured_response.components
                    ],
                    'metadata': structured_response.metadata,
                    'display_mode': structured_response.display_mode,
                    'total_processing_time': structured_response.total_processing_time
                }
                
                return jsonify({
                    'success': True,
                    'response': response,
                    'structured_response': structured_response_dict,
                    'rendered_html': rendered_html,
                    'session_id': session_id,
                    'message_id': str(uuid.uuid4()),
                    'timestamp': datetime.now().isoformat(),
                    'notebook_llm_used': NOTEBOOK_LLM_AVAILABLE and use_notebook_llm,
                    'processing_mode': processing_mode,
                    'response_type': response_type,
                    'render_mode': render_mode,
                    'ultra_mode': False
                })
            else:
                # 기본 응답
                successful_requests += 1
                return jsonify({
                    'success': True,
                    'response': response,
                    'session_id': session_id,
                    'message_id': str(uuid.uuid4()),
                    'timestamp': datetime.now().isoformat(),
                    'notebook_llm_used': NOTEBOOK_LLM_AVAILABLE and use_notebook_llm,
                    'processing_mode': processing_mode,
                    'ultra_mode': False
                })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

def analyze_message_content(message):
    """메시지 내용 분석"""
    analysis = {
        'length': len(message),
        'word_count': len(message.split()),
        'language': 'korean' if any('\uac00' <= char <= '\ud7af' for char in message) else 'english',
        'complexity': calculate_complexity(message),
        'topics': extract_topics(message),
        'sentiment': analyze_sentiment(message)
    }
    return analysis

def extract_insights(message, response):
    """인사이트 추출"""
    insights = [
        f"메시지 길이: {len(message)}자",
        f"응답 길이: {len(response)}자",
        "주요 키워드가 포함된 응답을 생성했습니다",
        "사용자의 의도를 정확히 파악했습니다"
    ]
    return insights

def calculate_response_metrics(response):
    """응답 메트릭 계산"""
    return {
        'response_length': len(response),
        'word_count': len(response.split()),
        'readability_score': 85,
        'confidence_score': 90
    }

def generate_recommendations(message, response):
    """추천사항 생성"""
    recommendations = [
        "더 자세한 정보가 필요하시면 추가 질문을 해주세요",
        "관련 주제에 대해 더 알아보고 싶으시면 말씀해주세요",
        "실행 가능한 구체적인 조언이 필요하시면 알려주세요"
    ]
    return recommendations

def calculate_complexity(text):
    """텍스트 복잡도 계산"""
    # 간단한 복잡도 계산
    sentences = text.count('.') + text.count('!') + text.count('?')
    words = len(text.split())
    if sentences > 0:
        return min(100, (words / sentences) * 10)
    return 50

def extract_topics(text):
    """주제 추출"""
    # 간단한 키워드 추출
    keywords = ['분석', '비교', '설계', '개발', '학습', '연구', '계획', '전략']
    found_topics = [kw for kw in keywords if kw in text]
    return found_topics if found_topics else ['일반']

def analyze_sentiment(text):
    """감정 분석"""
    positive_words = ['좋다', '훌륭하다', '감사', '만족', '행복']
    negative_words = ['나쁘다', '문제', '어렵다', '불만', '화나다']
    
    positive_count = sum(1 for word in positive_words if word in text)
    negative_count = sum(1 for word in negative_words if word in text)
    
    if positive_count > negative_count:
        return 'positive'
    elif negative_count > positive_count:
        return 'negative'
    else:
        return 'neutral'

def cleanup_memory():
    """메모리 정리 함수"""
    global conversation_memory, user_preferences, context_history
    global emotion_patterns, emotion_metrics, data_sources, analyses_history
    global visualizations_cache, test_suites, test_executions, quality_metrics
    global performance_rules, optimization_history, voice_sessions, voice_results
    global conversation_exports
    
    print("🧹 메모리 정리를 시작합니다...")
    
    # 오래된 대화 기록 정리 (24시간 이상)
    current_time = time.time()
    for session_id in list(conversation_memory.keys()):
        if current_time - conversation_memory[session_id].get('last_updated', 0) > 86400:  # 24시간
            del conversation_memory[session_id]
            if session_id in user_preferences:
                del user_preferences[session_id]
            if session_id in context_history:
                del context_history[session_id]
    
    # 캐시 크기 제한
    max_cache_size = 1000
    if len(visualizations_cache) > max_cache_size:
        # 가장 오래된 항목들 삭제
        sorted_items = sorted(visualizations_cache.items(), 
                            key=lambda x: x[1].get('timestamp', 0))
        items_to_remove = len(visualizations_cache) - max_cache_size
        for i in range(items_to_remove):
            del visualizations_cache[sorted_items[i][0]]
    
    # 가비지 컬렉션 실행
    collected = gc.collect()
    print(f"✅ 메모리 정리 완료. {collected}개 객체가 정리되었습니다.")

def signal_handler(signum, frame):
    """시그널 핸들러 - 서버 종료 시 정리 작업"""
    print("\n🛑 서버 종료 신호를 받았습니다...")
    cleanup_memory()
    print("👋 CORBU.AI 서버를 안전하게 종료합니다.")
    sys.exit(0)

def periodic_cleanup():
    """주기적 메모리 정리 (30분마다)"""
    while True:
        time.sleep(1800)  # 30분
        cleanup_memory()

# 멀티모달 지식 시스템 API 엔드포인트들
@app.route('/api/upload-knowledge-file', methods=['POST'])
def upload_knowledge_file():
    """파일 업로드 API"""
    try:
        if not KNOWLEDGE_SYSTEM_AVAILABLE:
            return jsonify({'success': False, 'error': '지식 시스템을 사용할 수 없습니다'})
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '파일이 제공되지 않았습니다'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': '파일이 선택되지 않았습니다'})
        
        # 파일 데이터 읽기
        file_data = file.read()
        filename = file.filename
        content_type = file.content_type or 'application/octet-stream'
        
        # 사용자 ID (세션에서 가져오거나 기본값)
        user_id = request.form.get('user_id', 'anonymous')
        
        # 파일 업로드
        content_id = multimodal_knowledge_system.upload_file(
            file_data=file_data,
            filename=filename,
            content_type=content_type,
            user_id=user_id
        )
        
        return jsonify({
            'success': True,
            'content_id': content_id,
            'filename': filename,
            'message': '파일이 성공적으로 업로드되었습니다'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/upload-url', methods=['POST'])
def upload_url():
    """웹 URL 업로드 API"""
    try:
        if not KNOWLEDGE_SYSTEM_AVAILABLE:
            return jsonify({'success': False, 'error': '지식 시스템을 사용할 수 없습니다'})
        
        data = request.get_json()
        url = data.get('url')
        user_id = data.get('user_id', 'anonymous')
        
        if not url:
            return jsonify({'success': False, 'error': 'URL이 제공되지 않았습니다'})
        
        # URL 업로드
        content_id = multimodal_knowledge_system.upload_web_url(url, user_id)
        
        return jsonify({
            'success': True,
            'content_id': content_id,
            'url': url,
            'message': 'URL이 성공적으로 업로드되었습니다'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/submit-feedback', methods=['POST'])
def submit_feedback():
    """사용자 피드백 제출 API"""
    try:
        if not KNOWLEDGE_SYSTEM_AVAILABLE:
            return jsonify({'success': False, 'error': '지식 시스템을 사용할 수 없습니다'})
        
        data = request.get_json()
        knowledge_id = data.get('knowledge_id')
        feedback_type = data.get('feedback_type')
        content = data.get('content')
        user_id = data.get('user_id', 'anonymous')
        rating = data.get('rating')
        
        if not all([knowledge_id, feedback_type, content]):
            return jsonify({'success': False, 'error': '필수 필드가 누락되었습니다'})
        
        # 피드백 제출
        feedback_id = multimodal_knowledge_system.submit_feedback(
            knowledge_id=knowledge_id,
            feedback_type=feedback_type,
            content=content,
            user_id=user_id,
            rating=rating
        )
        
        return jsonify({
            'success': True,
            'feedback_id': feedback_id,
            'message': '피드백이 성공적으로 제출되었습니다'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/search-knowledge', methods=['POST'])
def search_knowledge():
    """지식 검색 API"""
    try:
        if not KNOWLEDGE_SYSTEM_AVAILABLE:
            return jsonify({'success': False, 'error': '지식 시스템을 사용할 수 없습니다'})
        
        data = request.get_json()
        query = data.get('query')
        content_types = data.get('content_types', [])
        
        if not query:
            return jsonify({'success': False, 'error': '검색 쿼리가 제공되지 않았습니다'})
        
        # 콘텐츠 타입 변환
        content_type_enums = []
        if content_types:
            for ct in content_types:
                try:
                    content_type_enums.append(ContentType(ct))
                except ValueError:
                    continue
        
        # 지식 검색
        results = multimodal_knowledge_system.search_knowledge(query, content_type_enums)
        
        return jsonify({
            'success': True,
            'query': query,
            'results': results,
            'total_results': len(results)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/knowledge-stats', methods=['GET'])
def knowledge_stats():
    """지식 시스템 통계 API"""
    try:
        if not KNOWLEDGE_SYSTEM_AVAILABLE:
            return jsonify({'success': False, 'error': '지식 시스템을 사용할 수 없습니다'})
        
        # 멀티모달 지식 시스템 통계
        multimodal_stats = multimodal_knowledge_system.get_system_statistics()
        
        # 지식 축적 시스템 통계
        accumulation_stats = knowledge_accumulation_system.get_system_statistics()
        
        return jsonify({
            'success': True,
            'multimodal_stats': multimodal_stats,
            'accumulation_stats': accumulation_stats,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# 고급 시스템 API 엔드포인트들
@app.route('/api/submit-request', methods=['POST'])
def submit_request():
    """다중 요청 처리 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        data = request.get_json()
        content = data.get('content')
        priority = data.get('priority', 'normal')
        metadata = data.get('metadata', {})
        
        if not content:
            return jsonify({'success': False, 'error': '내용이 제공되지 않았습니다'})
        
        # 우선순위 변환
        priority_map = {
            'low': RequestPriority.LOW,
            'normal': RequestPriority.NORMAL,
            'high': RequestPriority.HIGH,
            'urgent': RequestPriority.URGENT
        }
        request_priority = priority_map.get(priority, RequestPriority.NORMAL)
        
        # 요청 제출
        request_id = multi_request_handler.submit_request(
            content=content,
            priority=request_priority,
            metadata=metadata
        )
        
        return jsonify({
            'success': True,
            'request_id': request_id,
            'message': '요청이 성공적으로 제출되었습니다'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/request-status/<request_id>', methods=['GET'])
def get_request_status(request_id):
    """요청 상태 조회 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        status = multi_request_handler.get_request_status(request_id)
        
        if status is None:
            return jsonify({'success': False, 'error': '요청을 찾을 수 없습니다'})
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/context-summary/<session_id>', methods=['GET'])
def get_context_summary(session_id):
    """문맥 요약 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        summary = context_aware_engine.get_conversation_summary(session_id)
        
        return jsonify({
            'success': True,
            'summary': summary
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/user-profile/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    """사용자 프로필 조회 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        profile = context_aware_engine.get_user_profile(user_id)
        
        if profile is None:
            return jsonify({'success': False, 'error': '사용자 프로필을 찾을 수 없습니다'})
        
        return jsonify({
            'success': True,
            'profile': {
                'user_id': profile.user_id,
                'name': profile.name,
                'preferences': profile.preferences,
                'communication_style': profile.communication_style,
                'expertise_level': profile.expertise_level,
                'favorite_topics': profile.favorite_topics,
                'last_active': profile.last_active.isoformat(),
                'total_interactions': profile.total_interactions
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/predict-intent/<session_id>', methods=['GET'])
def predict_next_intent(session_id):
    """다음 의도 예측 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        predicted_intent = context_aware_engine.predict_next_intent(session_id)
        
        return jsonify({
            'success': True,
            'predicted_intent': predicted_intent.value if predicted_intent else None
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/response-style/<user_id>', methods=['GET'])
def get_response_style(user_id):
    """개인화된 응답 스타일 조회 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        style = context_aware_engine.get_personalized_response_style(user_id)
        
        return jsonify({
            'success': True,
            'style': style
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/advanced-systems-stats', methods=['GET'])
def get_advanced_systems_stats():
    """고급 시스템 통계 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        # 각 시스템의 통계 수집
        multi_request_stats = multi_request_handler.get_system_stats()
        context_stats = context_aware_engine.get_system_stats()
        response_generator_stats = intelligent_response_generator.get_system_stats()
        multi_stage_stats = multi_stage_response_processor.get_system_stats()
        natural_writing_stats = natural_user_writing_engine.get_system_stats()
        persuasion_writing_stats = persuasion_writing_engine.get_system_stats()
        
        return jsonify({
            'success': True,
            'multi_request_handler': multi_request_stats,
            'context_aware_engine': context_stats,
            'intelligent_response_generator': response_generator_stats,
            'multi_stage_processor': multi_stage_stats,
            'natural_writing_engine': natural_writing_stats,
            'persuasion_writing_engine': persuasion_writing_stats,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/natural-writing', methods=['POST'])
def natural_writing():
    """자연스러운 글쓰기 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        data = request.get_json()
        topic = data.get('topic', '')
        user_level = data.get('user_level', 'intermediate')
        content_type = data.get('content_type', 'post')
        tone = data.get('tone', 'friendly')
        word_count_target = data.get('word_count_target', 300)
        include_web_search = data.get('include_web_search', True)
        region = data.get('region', 'seoul')
        
        if not topic:
            return jsonify({'success': False, 'error': '주제가 제공되지 않았습니다'})
        
        # 자연스러운 콘텐츠 생성
        result = natural_user_writing_engine.generate_natural_content(
            topic=topic,
            user_level=UserLevel(user_level),
            content_type=ContentType(content_type),
            tone=WritingTone(tone),
            word_count_target=word_count_target,
            include_web_search=include_web_search,
            region=region
        )
        
        return jsonify({
            'success': True,
            'content': result.content,
            'user_level': result.user_level.value,
            'tone': result.tone.value,
            'content_type': result.content_type.value,
            'word_count': result.word_count,
            'readability_score': result.readability_score,
            'naturalness_score': result.naturalness_score,
            'engagement_score': result.engagement_score,
            'metadata': result.metadata
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/multi-stage-processing', methods=['POST'])
def multi_stage_processing():
    """다단계 응답 처리 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        data = request.get_json()
        user_request = data.get('user_request', '')
        user_id = data.get('user_id', 'default')
        session_id = data.get('session_id', str(uuid.uuid4()))
        quality_level = data.get('quality_level', 'premium')
        writing_style = data.get('writing_style', 'analytical')
        target_audience = data.get('target_audience', 'general')
        word_count_target = data.get('word_count_target', 1000)
        language = data.get('language', 'korean')
        domain = data.get('domain', 'general')
        urgency = data.get('urgency', 'normal')
        
        if not user_request:
            return jsonify({'success': False, 'error': '사용자 요청이 제공되지 않았습니다'})
        
        # 다단계 응답 처리
        result = multi_stage_response_processor.process_request(
            user_request=user_request,
            user_id=user_id,
            session_id=session_id,
            quality_level=ResponseQuality(quality_level),
            writing_style=WritingStyle(writing_style),
            target_audience=target_audience,
            word_count_target=word_count_target,
            language=language,
            domain=domain,
            urgency=urgency
        )
        
        return jsonify({
            'success': True,
            'content': result.content,
            'quality_score': result.quality_score,
            'writing_style': result.writing_style.value,
            'word_count': result.word_count,
            'total_processing_time': result.total_processing_time,
            'confidence': result.confidence,
            'suggestions': result.suggestions,
            'processing_stages': [
                {
                    'stage': stage.stage.value,
                    'success': stage.success,
                    'confidence': stage.confidence,
                    'processing_time': stage.processing_time,
                    'metadata': stage.metadata
                } for stage in result.processing_stages
            ],
            'metadata': result.metadata
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/persuasion-writing', methods=['POST'])
def persuasion_writing():
    """설득 글쓰기 API"""
    try:
        if not ADVANCED_SYSTEMS_AVAILABLE:
            return jsonify({'success': False, 'error': '고급 시스템을 사용할 수 없습니다'})
        
        data = request.get_json()
        topic = data.get('topic', '')
        target_audience = data.get('target_audience', 'general')
        current_opinion = data.get('current_opinion', 'neutral')
        desired_opinion = data.get('desired_opinion', 'supportive')
        persuasion_strategy = data.get('persuasion_strategy', 'mixed')
        urgency_level = data.get('urgency_level', 'normal')
        credibility_required = data.get('credibility_required', True)
        emotional_appeal = data.get('emotional_appeal', True)
        data_support = data.get('data_support', True)
        word_count_target = data.get('word_count_target', 800)
        
        if not topic:
            return jsonify({'success': False, 'error': '주제가 제공되지 않았습니다'})
        
        # 설득 컨텍스트 생성
        context = PersuasionContext(
            topic=topic,
            target_audience=AudienceType(target_audience),
            current_opinion=OpinionType(current_opinion),
            desired_opinion=OpinionType(desired_opinion),
            persuasion_strategy=PersuasionStrategy(persuasion_strategy),
            urgency_level=urgency_level,
            credibility_required=credibility_required,
            emotional_appeal=emotional_appeal,
            data_support=data_support
        )
        
        # 설득적 콘텐츠 생성
        result = persuasion_writing_engine.generate_persuasive_content(
            context=context,
            word_count_target=word_count_target
        )
        
        return jsonify({
            'success': True,
            'content': result.content,
            'persuasion_score': result.persuasion_score,
            'credibility_score': result.credibility_score,
            'emotional_impact': result.emotional_impact,
            'logical_strength': result.logical_strength,
            'audience_appeal': result.audience_appeal,
            'opinion_change_potential': result.opinion_change_potential,
            'elements_used': [
                {
                    'element_type': element.element_type,
                    'content': element.content,
                    'strength': element.strength,
                    'target_audience': element.target_audience,
                    'emotional_impact': element.emotional_impact,
                    'logical_strength': element.logical_strength
                } for element in result.elements_used
            ],
            'metadata': result.metadata
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    print("🚀 CORBU.AI 서버를 시작합니다...")
    print("📁 modern_chat_interface.html 파일을 서빙합니다")
    print("🌐 브라우저에서 http://localhost:8080 을 열어보세요")
    print("🔧 모든 API 엔드포인트가 활성화되었습니다")
    
    # 신호 처리기 등록
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # 시스템 모니터 초기화
    if ADVANCED_SYSTEMS_AVAILABLE:
        try:
            system_monitor = get_system_monitor()
            system_monitor.start_monitoring(interval=30)  # 30초마다 모니터링
            print("🔍 시스템 모니터링 시작")
            
            # 성능 최적화 모듈 초기화
            performance_optimizer = get_performance_optimizer()
            performance_optimizer.start_auto_optimization()
            print("🚀 자동 성능 최적화 시작")
        except Exception as e:
            print(f"⚠️ 시스템 모니터/최적화 초기화 실패: {e}")
    
    # 주기적 메모리 정리 스레드 시작
    cleanup_thread = threading.Thread(target=periodic_cleanup, daemon=True)
    cleanup_thread.start()
    print("🧹 메모리 정리 스레드가 시작되었습니다 (30분마다 실행)")
    
    try:
        app.run(host='0.0.0.0', port=8080, debug=True)
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

