"""
고급 AI 응답 생성 엔진
- Chain-of-Thought 사고 과정
- 질문 의도 분석
- 동적 응답 생성
- 코드 생성 품질 향상
"""

import re
import random
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class QueryIntent(Enum):
    """질문 의도 분류"""

    EXPLANATION = "explanation"  # 설명 요청 (뭐야, 무엇, 설명해줘)
    HOW_TO = "how_to"  # 방법 요청 (어떻게, 방법, 만들기)
    CODE_GENERATION = "code_generation"  # 코드 생성 (코드 작성, 만들어줘)
    COMPARISON = "comparison"  # 비교 (차이, 비교, vs)
    TROUBLESHOOTING = "troubleshooting"  # 문제 해결 (에러, 안됨, 문제)
    RECOMMENDATION = "recommendation"  # 추천 (추천, 좋은, 베스트)
    CREATIVE = "creative"  # 창작 (작성, 글, 이야기)
    FACTUAL = "factual"  # 사실 확인 (맞아?, 가능해?)
    GENERAL_CHAT = "general_chat"  # 일반 대화


class TopicCategory(Enum):
    """주제 카테고리"""

    PROGRAMMING_LANGUAGE = "programming_language"
    WEB_FRAMEWORK = "web_framework"
    DATABASE = "database"
    DEVOPS = "devops"
    AI_ML = "ai_ml"
    ALGORITHM = "algorithm"
    GENERAL_IT = "general_it"
    NON_TECH = "non_tech"


@dataclass
class QueryAnalysis:
    """질문 분석 결과"""

    original_query: str
    intent: QueryIntent
    topic_category: TopicCategory
    key_topics: List[str]
    complexity: str  # simple, moderate, complex
    requires_code: bool
    requires_example: bool
    language_preference: Optional[str]
    specific_aspects: List[str]


@dataclass
class ThoughtProcess:
    """사고 과정"""

    understanding: str  # 질문 이해
    key_points: List[str]  # 핵심 포인트
    approach: str  # 접근 방식
    considerations: List[str]  # 고려 사항


class IntelligentResponseEngine:
    """고급 AI 응답 생성 엔진 - 혁신적 기술 접목 버전"""

    def __init__(self):
        self.topic_keywords = self._load_topic_keywords()
        self.code_templates = self._load_code_templates()
        self.response_patterns = self._load_response_patterns()

        # 고급 AI 기능 초기화
        self.semantic_patterns = self._init_semantic_patterns()
        self.domain_knowledge = self._init_domain_knowledge()
        self.response_quality_metrics = self._init_quality_metrics()

    def _init_semantic_patterns(self) -> Dict[str, Any]:
        """의미론적 패턴 인식 시스템 초기화"""
        return {
            # 질문 유형별 심층 패턴
            "deep_analysis_triggers": [
                r"왜.*(?:그런|이런|저런)",
                r"(?:근본|본질|핵심).*(?:뭐|무엇|원인)",
                r"(?:깊이|자세히|상세히).*(?:분석|설명|알려)",
                r"(?:전문가|expert).*(?:관점|시각|분석)",
            ],
            "advanced_triggers": [
                r"(?:심화|고급|advanced).*(?:방법|기술|내용)",
                r"(?:성능|퍼포먼스|performance).*(?:최적화|개선|향상)",
                r"(?:프로덕션|production|배포).*(?:환경|설정|주의)",
                r"(?:대규모|스케일|scale).*(?:처리|관리|운영)",
                r"(?:아키텍처|architecture|설계).*(?:패턴|방법|best)",
                r"(?:베스트|best).*(?:practice|프랙티스)",
                r"(?:실무|현업|실제).*(?:경험|사례|적용)",
            ],
            "comparative_triggers": [
                r"(.+)(?:와|과|하고)\s*(.+)\s*(?:비교|차이|다른점)",
                r"(.+)\s*vs\.?\s*(.+)",
                r"(?:어떤|뭐가|무엇이).*(?:나은|좋은|better)",
            ],
            "practical_triggers": [
                r"(?:실제|실무|현업).*(?:어떻게|사용|적용)",
                r"(?:예시|예제|샘플|example).*(?:보여|알려|만들)",
                r"(?:단계|step).*(?:별로|by step)",
                r"(?:프로덕션|production).*(?:배포|deploy)",
            ],
            "conceptual_triggers": [
                r"(?:개념|concept|원리|원칙).*(?:뭐|무엇|설명)",
                r"(?:어떤|무슨).*(?:의미|뜻)",
                r"(?:정의|define|definition)",
            ],
            # 감정/톤 인식
            "urgency_indicators": ["급해", "빨리", "당장", "지금", "asap", "urgent"],
            "frustration_indicators": ["안돼", "에러", "문제", "막혔", "모르겠"],
            "curiosity_indicators": ["궁금", "알고싶", "왜", "어떻게"],
        }

    def _init_domain_knowledge(self) -> Dict[str, Any]:
        """도메인 지식 베이스 초기화"""
        return {
            # 기술 스택 연관성 매핑
            "tech_associations": {
                "react": [
                    "javascript",
                    "typescript",
                    "jsx",
                    "hooks",
                    "redux",
                    "nextjs",
                ],
                "vue": ["javascript", "typescript", "vuex", "pinia", "nuxt"],
                "python": ["django", "fastapi", "flask", "pandas", "numpy", "pytorch"],
                "nodejs": ["express", "nestjs", "npm", "yarn", "typescript"],
                "docker": [
                    "kubernetes",
                    "container",
                    "devops",
                    "ci/cd",
                    "microservices",
                ],
                "database": ["sql", "nosql", "postgresql", "mongodb", "redis", "mysql"],
            },
            # 질문-응답 최적 매칭
            "response_depth_rules": {
                "beginner_indicators": [
                    "입문",
                    "처음",
                    "초보",
                    "시작",
                    "기초",
                    "뭐야",
                    "무엇",
                ],
                "intermediate_indicators": ["어떻게", "방법", "사용법", "활용", "적용"],
                "advanced_indicators": [
                    "최적화",
                    "성능",
                    "아키텍처",
                    "설계",
                    "패턴",
                    "심화",
                ],
            },
            # 응답 스타일 결정 요소
            "style_determinants": {
                "formal": ["보고서", "문서", "공식", "비즈니스"],
                "casual": ["쉽게", "간단히", "짧게", "요약"],
                "technical": ["기술적", "상세", "깊이", "전문"],
            },
        }

    def _init_quality_metrics(self) -> Dict[str, Any]:
        """응답 품질 메트릭 초기화"""
        return {
            "min_response_lengths": {
                QueryIntent.EXPLANATION: 800,
                QueryIntent.HOW_TO: 1000,
                QueryIntent.CODE_GENERATION: 1500,
                QueryIntent.COMPARISON: 1200,
                QueryIntent.TROUBLESHOOTING: 1000,
                QueryIntent.RECOMMENDATION: 600,
                QueryIntent.CREATIVE: 1500,
            },
            "quality_checklist": {
                "has_structure": True,  # 구조화된 형식
                "has_examples": True,  # 예시 포함
                "has_actionable": True,  # 실행 가능한 내용
                "has_depth": True,  # 깊이 있는 설명
            },
        }

    def generate_response(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict]] = None,
    ) -> str:
        """메인 응답 생성 함수 - 고급 AI 파이프라인"""
        try:
            # === Phase 1: 심층 질문 분석 ===
            # 1-1. 기본 질문 분석
            analysis = self._analyze_query(query)

            # 1-2. 고급 의미론적 분석 (NEW)
            semantic_context = self._perform_semantic_analysis(query, analysis)

            # 1-3. 사용자 의도 레이어 분석 (NEW)
            intent_layers = self._analyze_intent_layers(
                query, analysis, semantic_context
            )

            logger.info(
                f"질문 분석: intent={analysis.intent.value}, topics={analysis.key_topics}, "
                f"depth={semantic_context.get('depth_level', 'standard')}"
            )

            # === Phase 2: 맥락 강화 ===
            # 2-1. 대화 히스토리 반영
            if conversation_history:
                context = self._enhance_context_with_history(
                    context, conversation_history
                )

            # 2-2. 도메인 지식 주입 (NEW)
            context = self._inject_domain_knowledge(context, analysis, semantic_context)

            # === Phase 3: 복합 질문 처리 ===
            sub_queries = self._split_compound_query(query)
            if len(sub_queries) > 1 and len(sub_queries) <= 4:
                response = self._handle_compound_query_advanced(
                    sub_queries, context, semantic_context
                )
                if response and len(response) > 500:
                    return self._finalize_response(response, analysis, semantic_context)

            # === Phase 4: 지능형 응답 생성 ===
            # 4-1. 사고 과정 생성
            thought = self._generate_thought_process(analysis, context)

            # 4-2. 응답 전략 결정 (NEW)
            response_strategy = self._determine_response_strategy(
                analysis, thought, semantic_context, intent_layers
            )

            # 4-3. 동적 응답 생성 (전략 기반)
            response = self._generate_strategic_response(
                analysis, thought, context, response_strategy
            )

            # === Phase 5: 응답 최적화 ===
            # 5-1. 응답 다양성 적용
            response = self._apply_response_diversity(response, analysis)

            # 5-2. 품질 검증 및 향상
            response = self._enhance_response(response, analysis)

            # 5-3. 최종 품질 보증 (NEW)
            response = self._finalize_response(response, analysis, semantic_context)

            # 5-4. 프로젝트 노트북 지식 반영 표시 (소스 그라운딩)
            if context and context.get("projectKnowledge"):
                pk = (context.get("projectKnowledge") or "").strip()
                if pk:
                    response = (
                        "※ 현재 프로젝트의 학습 정보를 반영하여 답변했습니다.\n\n"
                        + response
                    )

            return response

        except Exception as e:
            logger.error(f"응답 생성 오류: {e}")
            return self._generate_fallback_response(query)

    def _perform_semantic_analysis(
        self, query: str, analysis: QueryAnalysis
    ) -> Dict[str, Any]:
        """고급 의미론적 분석 - 질문의 숨겨진 의도와 맥락 파악"""
        query_lower = query.lower()

        result = {
            "depth_level": "standard",  # basic, standard, deep, expert
            "emotional_tone": "neutral",  # neutral, urgent, frustrated, curious
            "specificity": "general",  # general, specific, highly_specific
            "expected_format": "structured",  # concise, structured, detailed, comprehensive
            "domain_context": [],
            "implicit_requirements": [],
        }

        # 깊이 수준 분석
        for pattern in self.semantic_patterns["deep_analysis_triggers"]:
            if re.search(pattern, query_lower):
                result["depth_level"] = "deep"
                break

        # 고급/심화 요청 감지 (NEW)
        for pattern in self.semantic_patterns.get("advanced_triggers", []):
            if re.search(pattern, query_lower):
                result["depth_level"] = "expert"
                result["implicit_requirements"].append("advanced_content")
                result["expected_format"] = "comprehensive"
                break

        # 실무/실용 요청 감지
        for pattern in self.semantic_patterns["practical_triggers"]:
            if re.search(pattern, query_lower):
                result["implicit_requirements"].append("practical_examples")
                result["expected_format"] = "detailed"

        # 감정/긴급도 분석
        for indicator in self.semantic_patterns["urgency_indicators"]:
            if indicator in query_lower:
                result["emotional_tone"] = "urgent"
                result["expected_format"] = "concise"
                break

        for indicator in self.semantic_patterns["frustration_indicators"]:
            if indicator in query_lower:
                result["emotional_tone"] = "frustrated"
                result["implicit_requirements"].append("troubleshooting_focus")
                break

        # 구체성 분석
        specific_indicators = ["이", "그", "저", "특정", "구체적", "정확히", "exactly"]
        if any(ind in query_lower for ind in specific_indicators):
            result["specificity"] = "specific"

        # 도메인 컨텍스트 추출
        for tech, associations in self.domain_knowledge["tech_associations"].items():
            if tech in query_lower:
                result["domain_context"].append(tech)
                result["domain_context"].extend(
                    [a for a in associations if a in query_lower]
                )

        # 사용자 레벨 추정
        for level, indicators in self.domain_knowledge["response_depth_rules"].items():
            if any(ind in query_lower for ind in indicators):
                if level == "beginner_indicators":
                    result["depth_level"] = "basic"
                elif level == "advanced_indicators":
                    result["depth_level"] = "expert"
                break

        return result

    def _analyze_intent_layers(
        self, query: str, analysis: QueryAnalysis, semantic_context: Dict
    ) -> Dict[str, Any]:
        """다층 의도 분석 - 표면적 의도와 심층 의도 분리"""
        return {
            "surface_intent": analysis.intent.value,  # 표면적 의도
            "deep_intent": self._infer_deep_intent(query, analysis),  # 심층 의도
            "implicit_goals": self._extract_implicit_goals(query, semantic_context),
            "knowledge_gaps": self._identify_knowledge_gaps(query, analysis),
        }

    def _infer_deep_intent(self, query: str, analysis: QueryAnalysis) -> str:
        """심층 의도 추론"""
        query_lower = query.lower()

        # 학습 의도
        if any(kw in query_lower for kw in ["배우", "공부", "학습", "입문", "시작"]):
            return "learning"

        # 문제 해결 의도
        if any(kw in query_lower for kw in ["해결", "고치", "에러", "안돼", "문제"]):
            return "problem_solving"

        # 의사결정 지원 의도
        if any(kw in query_lower for kw in ["어떤", "뭐가", "선택", "결정", "추천"]):
            return "decision_support"

        # 구현/개발 의도
        if any(kw in query_lower for kw in ["만들", "구현", "개발", "코드", "작성"]):
            return "implementation"

        # 이해/설명 의도
        if any(kw in query_lower for kw in ["뭐야", "무엇", "왜", "어떻게", "설명"]):
            return "understanding"

        return "general"

    def _extract_implicit_goals(self, query: str, semantic_context: Dict) -> List[str]:
        """암시적 목표 추출"""
        goals = []
        query_lower = query.lower()

        # 효율성 추구
        if any(kw in query_lower for kw in ["빠르", "효율", "성능", "최적"]):
            goals.append("efficiency")

        # 안정성 추구
        if any(kw in query_lower for kw in ["안정", "안전", "보안", "신뢰"]):
            goals.append("reliability")

        # 확장성 추구
        if any(kw in query_lower for kw in ["확장", "스케일", "성장", "대규모"]):
            goals.append("scalability")

        # 단순성 추구
        if any(kw in query_lower for kw in ["간단", "쉽", "단순", "기본"]):
            goals.append("simplicity")

        # 실용성 추구
        if semantic_context.get("implicit_requirements"):
            if "practical_examples" in semantic_context["implicit_requirements"]:
                goals.append("practicality")

        return goals

    def _identify_knowledge_gaps(
        self, query: str, analysis: QueryAnalysis
    ) -> List[str]:
        """지식 공백 식별 - 사용자가 모를 것 같은 관련 정보"""
        gaps = []

        # 초보자 질문에 대한 추가 정보 필요성
        if analysis.complexity == "simple":
            gaps.append("basic_concepts")
            gaps.append("common_pitfalls")

        # 기술 질문에 대한 맥락 정보
        if analysis.topic_category != TopicCategory.NON_TECH:
            gaps.append("best_practices")
            gaps.append("real_world_considerations")

        return gaps

    def _inject_domain_knowledge(
        self, context: Optional[Dict], analysis: QueryAnalysis, semantic_context: Dict
    ) -> Dict:
        """도메인 지식 주입 (프로젝트 노트북 지식 포함)"""
        ctx = context.copy() if context else {}

        # 프로젝트 노트북 LLM 학습 정보 유지 (소스 그라운딩용)
        if context and context.get("projectKnowledge"):
            ctx["projectKnowledge"] = context["projectKnowledge"]

        # 관련 기술 스택 정보 추가
        related_techs = []
        for topic in analysis.key_topics:
            topic_lower = topic.lower()
            for tech, associations in self.domain_knowledge[
                "tech_associations"
            ].items():
                if tech in topic_lower:
                    related_techs.extend(associations[:3])  # 상위 3개만

        ctx["related_technologies"] = list(set(related_techs))
        ctx["semantic_context"] = semantic_context

        return ctx

    def _handle_compound_query_advanced(
        self, sub_queries: List[str], context: Optional[Dict], semantic_context: Dict
    ) -> str:
        """고급 복합 질문 처리"""
        # 기존 복합 질문 처리 호출
        return self._handle_compound_query(sub_queries, context)

    def _determine_response_strategy(
        self,
        analysis: QueryAnalysis,
        thought: ThoughtProcess,
        semantic_context: Dict,
        intent_layers: Dict,
    ) -> Dict[str, Any]:
        """응답 전략 결정 - 최적의 응답 방식 선택"""
        strategy = {
            "structure_type": "standard",  # minimal, standard, comprehensive
            "include_examples": True,
            "include_alternatives": False,
            "include_warnings": False,
            "include_next_steps": False,
            "tone": "professional",  # casual, professional, technical
            "depth": "moderate",  # shallow, moderate, deep
        }

        # 깊이 수준에 따른 전략
        depth_level = semantic_context.get("depth_level", "standard")
        if depth_level == "basic":
            strategy["structure_type"] = "minimal"
            strategy["depth"] = "shallow"
            strategy["tone"] = "casual"
        elif depth_level in ["deep", "expert"]:
            strategy["structure_type"] = "comprehensive"
            strategy["depth"] = "deep"
            strategy["include_alternatives"] = True
            strategy["include_next_steps"] = True

        # 감정 상태에 따른 조정
        emotional_tone = semantic_context.get("emotional_tone", "neutral")
        if emotional_tone == "frustrated":
            strategy["include_warnings"] = True
            strategy["structure_type"] = "comprehensive"
        elif emotional_tone == "urgent":
            strategy["structure_type"] = "minimal"
            strategy["include_next_steps"] = True

        # 의도에 따른 조정
        deep_intent = intent_layers.get("deep_intent", "general")
        if deep_intent == "learning":
            strategy["include_examples"] = True
            strategy["include_next_steps"] = True
        elif deep_intent == "problem_solving":
            strategy["include_warnings"] = True
            strategy["include_alternatives"] = True
        elif deep_intent == "decision_support":
            strategy["include_alternatives"] = True
            strategy["structure_type"] = "comprehensive"

        return strategy

    def _generate_strategic_response(
        self,
        analysis: QueryAnalysis,
        thought: ThoughtProcess,
        context: Optional[Dict],
        strategy: Dict[str, Any],
    ) -> str:
        """전략 기반 응답 생성"""
        # 심화/고급 질문에 대한 특별 처리
        semantic_ctx = context.get("semantic_context", {}) if context else {}
        if semantic_ctx.get(
            "depth_level"
        ) == "expert" or "advanced_content" in semantic_ctx.get(
            "implicit_requirements", []
        ):
            advanced_response = self._generate_advanced_response(
                analysis, thought, context
            )
            if advanced_response and len(advanced_response) > 1000:
                return advanced_response

        # 기존 동적 응답 생성 활용
        response = self._generate_dynamic_response(analysis, thought, context)

        # 전략에 따른 추가 섹션
        additions = []

        # 대안 제시
        if strategy.get("include_alternatives") and len(response) < 2000:
            alt_section = self._generate_alternatives_section(analysis)
            if alt_section:
                additions.append(alt_section)

        # 주의사항
        if strategy.get("include_warnings") and "[!]" not in response:
            warning_section = self._generate_warnings_section(analysis)
            if warning_section:
                additions.append(warning_section)

        # 다음 단계
        if strategy.get("include_next_steps") and "다음" not in response.lower():
            next_steps = self._generate_next_steps_section(analysis)
            if next_steps:
                additions.append(next_steps)

        if additions:
            response = response.rstrip() + "\n\n" + "\n\n".join(additions)

        return response

    def _generate_advanced_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess, context: Optional[Dict]
    ) -> str:
        """심화/고급 질문에 대한 전문가 수준 응답 생성"""
        query_lower = analysis.original_query.lower()
        topic = analysis.key_topics[0] if analysis.key_topics else "해당 주제"

        # React 성능 최적화
        if "react" in query_lower and any(
            kw in query_lower for kw in ["성능", "최적화", "퍼포먼스"]
        ):
            return self._generate_react_optimization_guide()

        # Docker 프로덕션 배포
        if "docker" in query_lower and any(
            kw in query_lower for kw in ["프로덕션", "배포", "production"]
        ):
            return self._generate_docker_production_guide()

        # 데이터베이스 최적화
        if (
            any(db in query_lower for db in ["database", "db", "데이터베이스", "sql"])
            and "최적화" in query_lower
        ):
            return self._generate_db_optimization_guide()

        # API 설계 베스트 프랙티스
        if "api" in query_lower and any(
            kw in query_lower for kw in ["설계", "베스트", "best", "아키텍처"]
        ):
            return self._generate_api_design_guide()

        # 마이크로서비스 아키텍처
        if any(kw in query_lower for kw in ["마이크로서비스", "microservice", "msa"]):
            return self._generate_microservices_guide()

        # 일반 심화 응답
        return self._generate_generic_advanced_response(topic, analysis)

    def _generate_react_optimization_guide(self) -> str:
        """React 성능 최적화 심화 가이드"""
        return """# React 성능 최적화 심화 가이드

## 개요

React 애플리케이션의 성능 최적화는 크게 **렌더링 최적화**, **번들 최적화**, **런타임 최적화**로 나눌 수 있습니다.

---

## 1. 렌더링 최적화

### 1.1 불필요한 리렌더링 방지

**React.memo 활용:**
```jsx
// [X] 매번 리렌더링
function UserCard({ user }) {
  return <div>{user.name}</div>;
}

// [O] props가 변경될 때만 리렌더링
const UserCard = React.memo(function UserCard({ user }) {
  return <div>{user.name}</div>;
});

// 커스텀 비교 함수
const UserCard = React.memo(
  function UserCard({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

**useMemo와 useCallback:**
```jsx
function ExpensiveComponent({ data, onItemClick }) {
  // 비싼 계산은 useMemo로 캐싱
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);
  
  // 콜백 함수는 useCallback으로 캐싱
  const handleClick = useCallback((id) => {
    onItemClick(id);
  }, [onItemClick]);
  
  return (
    <ul>
      {processedData.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### 1.2 상태 관리 최적화

**상태 분리:**
```jsx
// [X] 하나의 큰 상태
const [state, setState] = useState({ user: null, posts: [], settings: {} });

// [O] 관련 상태끼리 분리
const [user, setUser] = useState(null);
const [posts, setPosts] = useState([]);
const [settings, setSettings] = useState({});
```

**Context 분리:**
```jsx
// [X] 하나의 거대한 Context
const AppContext = createContext({ user, theme, locale, ... });

// [O] 관심사별로 분리
const UserContext = createContext(null);
const ThemeContext = createContext('light');
const LocaleContext = createContext('ko');
```

---

## 2. 번들 최적화

### 2.1 코드 스플리팅

**React.lazy와 Suspense:**
```jsx
import { lazy, Suspense } from 'react';

// 동적 임포트
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

**라우트 기반 스플리팅 (Next.js):**
```jsx
// pages/dashboard.js - 자동으로 코드 스플리팅
export default function Dashboard() {
  return <div>Dashboard</div>;
}
```

### 2.2 트리 쉐이킹

```jsx
// [X] 전체 라이브러리 임포트
import _ from 'lodash';
_.debounce(fn, 300);

// [O] 필요한 함수만 임포트
import debounce from 'lodash/debounce';
debounce(fn, 300);
```

---

## 3. 런타임 최적화

### 3.1 가상화 (Virtualization)

대량의 리스트 렌더링 시:
```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  );
  
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 3.2 이미지 최적화

```jsx
// Next.js Image 컴포넌트
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={400}
  priority  // LCP 이미지
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

---

## 4. 성능 측정 도구

| 도구 | 용도 |
|------|------|
| React DevTools Profiler | 컴포넌트 렌더링 분석 |
| Chrome DevTools Performance | 전체 런타임 분석 |
| Lighthouse | 종합 성능 점수 |
| Web Vitals | Core Web Vitals 측정 |
| Bundle Analyzer | 번들 크기 분석 |

### React DevTools Profiler 사용:
```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id, phase, actualDuration, baseDuration, startTime, commitTime
) {
  console.log(`${id} - ${phase}: ${actualDuration}ms`);
}

<Profiler id="Navigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>
```

---

## 5. 체크리스트

| 항목 | 확인 |
|------|------|
| 불필요한 리렌더링 제거 | [ ] |
| React.memo 적절히 사용 | [ ] |
| useMemo/useCallback 적용 | [ ] |
| 코드 스플리팅 적용 | [ ] |
| 이미지 최적화 | [ ] |
| 번들 크기 분석 | [ ] |
| Core Web Vitals 측정 | [ ] |

---

## 주의사항

- [!] 과도한 최적화는 코드 복잡성을 높입니다
- [!] 측정 없이 최적화하지 마세요 (Premature optimization)
- [!] React.memo는 비교 비용이 있으므로 신중히 사용하세요

---

*성능 최적화는 측정 -> 분석 -> 개선 -> 검증의 사이클을 반복하세요.*"""

    def _generate_docker_production_guide(self) -> str:
        """Docker 프로덕션 배포 심화 가이드"""
        return """# Docker 프로덕션 배포 심화 가이드

## 개요

프로덕션 환경에서 Docker를 사용할 때는 **보안**, **성능**, **안정성**, **모니터링**을 고려해야 합니다.

---

## 1. 프로덕션용 Dockerfile 작성

### 1.1 멀티 스테이지 빌드

```dockerfile
# Stage 1: 빌드
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: 프로덕션
FROM node:20-alpine AS production
WORKDIR /app

# 보안: non-root 사용자
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 빌드 결과물만 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
```

### 1.2 보안 베스트 프랙티스

```dockerfile
# [O] 특정 버전 사용 (latest 금지)
FROM node:20.10.0-alpine

# [O] 불필요한 패키지 제거
RUN apk add --no-cache dumb-init

# [O] HEALTHCHECK 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# [O] 민감 정보는 빌드 시 ARG가 아닌 런타임 ENV로
# ARG DB_PASSWORD  <- [X]
# ENV DB_PASSWORD  <- 런타임에 주입
```

---

## 2. Docker Compose 프로덕션 설정

```yaml
version: '3.8'

services:
  app:
    image: myapp:${VERSION:-latest}
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

---

## 3. 보안 체크리스트

| 항목 | 설명 | 필수 |
|------|------|------|
| non-root 사용자 | 컨테이너 내 root 권한 제한 | [O] |
| 읽기 전용 파일시스템 | `--read-only` 플래그 | 권장 |
| 네트워크 격리 | 필요한 포트만 노출 | [O] |
| 시크릿 관리 | 환경 변수 또는 시크릿 매니저 | [O] |
| 이미지 스캔 | Trivy, Clair 등으로 취약점 검사 | [O] |
| 특정 버전 사용 | latest 태그 사용 금지 | [O] |

### 보안 스캔 예시:
```bash
# Trivy로 이미지 스캔
trivy image myapp:latest

# Docker Scout
docker scout cves myapp:latest
```

---

## 4. 모니터링과 로깅

### 4.1 로그 수집

```yaml
# docker-compose.yml
logging:
  driver: "fluentd"
  options:
    fluentd-address: "localhost:24224"
    tag: "docker.{{.Name}}"
```

### 4.2 메트릭 수집 (Prometheus)

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']
```

### 4.3 헬스체크 엔드포인트

```javascript
// Express 예시
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  res.status(200).json(healthcheck);
});

app.get('/ready', async (req, res) => {
  // DB 연결 등 확인
  const dbConnected = await checkDatabase();
  if (dbConnected) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});
```

---

## 5. 배포 전략

### 5.1 Blue-Green 배포

```bash
# Blue 환경 실행 중
docker-compose -f docker-compose.blue.yml up -d

# Green 환경 배포
docker-compose -f docker-compose.green.yml up -d

# 트래픽 전환 (nginx 설정 변경)
# 문제 발생 시 Blue로 롤백
```

### 5.2 Rolling Update (Swarm/K8s)

```bash
# Docker Swarm
docker service update --image myapp:v2 myapp

# 롤백
docker service rollback myapp
```

---

## 6. 주의사항

- [!] 프로덕션에서 `docker run` 직접 사용 금지 - Compose/Swarm/K8s 사용
- [!] 볼륨 마운트 시 호스트 경로 보안 주의
- [!] 환경 변수로 민감 정보 노출 주의 (docker inspect로 볼 수 있음)
- [!] 컨테이너 로그는 반드시 외부로 수집
- [!] 리소스 제한(memory, cpu) 필수 설정

---

## 체크리스트

| 단계 | 항목 | 완료 |
|------|------|------|
| 빌드 | 멀티 스테이지 빌드 | [ ] |
| 보안 | non-root 사용자 | [ ] |
| 보안 | 이미지 취약점 스캔 | [ ] |
| 설정 | 리소스 제한 | [ ] |
| 설정 | 헬스체크 | [ ] |
| 모니터링 | 로그 수집 | [ ] |
| 모니터링 | 메트릭 수집 | [ ] |
| 배포 | 롤백 전략 | [ ] |

---

*프로덕션 배포는 항상 테스트 환경에서 충분히 검증한 후 진행하세요.*"""

    def _generate_db_optimization_guide(self) -> str:
        """데이터베이스 최적화 심화 가이드"""
        return """# 데이터베이스 성능 최적화 심화 가이드

## 1. 인덱스 최적화

### 효과적인 인덱스 설계

```sql
-- 복합 인덱스: 자주 함께 조회되는 컬럼
CREATE INDEX idx_user_status_created 
ON orders(user_id, status, created_at);

-- 커버링 인덱스: SELECT 컬럼까지 포함
CREATE INDEX idx_covering 
ON products(category_id, price) 
INCLUDE (name, description);
```

### 인덱스 사용 확인

```sql
EXPLAIN ANALYZE SELECT * FROM orders 
WHERE user_id = 1 AND status = 'pending';
```

## 2. 쿼리 최적화

| 문제 | 해결책 |
|------|--------|
| N+1 쿼리 | JOIN 또는 서브쿼리 사용 |
| 전체 테이블 스캔 | 적절한 인덱스 추가 |
| 큰 결과셋 | 페이지네이션 적용 |

## 3. 커넥션 풀 설정

```javascript
// Node.js 예시
const pool = new Pool({
  max: 20,           // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

*인덱스 추가 전 실행 계획을 반드시 확인하세요.*"""

    def _generate_api_design_guide(self) -> str:
        """API 설계 베스트 프랙티스"""
        return """# REST API 설계 베스트 프랙티스

## 1. URL 설계 원칙

```
# [O] 좋은 예
GET    /users          # 목록 조회
GET    /users/123      # 단일 조회
POST   /users          # 생성
PUT    /users/123      # 전체 수정
PATCH  /users/123      # 부분 수정
DELETE /users/123      # 삭제

# [X] 나쁜 예
GET /getUsers
POST /createUser
GET /users/delete/123
```

## 2. 응답 형식 표준화

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

## 3. 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "이메일 형식이 올바르지 않습니다",
    "details": [...]
  }
}
```

## 4. 버전 관리

```
/api/v1/users
/api/v2/users
```

---

*일관성 있는 API 설계가 유지보수성을 높입니다.*"""

    def _generate_microservices_guide(self) -> str:
        """마이크로서비스 아키텍처 가이드"""
        return """# 마이크로서비스 아키텍처 심화 가이드

## 1. 모놀리식 vs 마이크로서비스

| 특성 | 모놀리식 | 마이크로서비스 |
|------|---------|---------------|
| 배포 | 전체 배포 | 개별 배포 |
| 확장 | 수직 확장 | 수평 확장 |
| 기술 스택 | 통일 | 다양 가능 |
| 복잡도 | 코드 복잡 | 운영 복잡 |
| 적합한 규모 | 소~중규모 | 대규모 |

## 2. 핵심 패턴

### 2.1 서비스 간 통신

- **동기**: REST, gRPC
- **비동기**: Message Queue (Kafka, RabbitMQ)

### 2.2 데이터 관리

- **Database per Service**: 각 서비스별 독립 DB
- **Saga Pattern**: 분산 트랜잭션 관리
- **Event Sourcing**: 이벤트 기반 상태 관리

### 2.3 서비스 디스커버리

```yaml
# Kubernetes Service
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user
  ports:
    - port: 80
```

## 3. 도입 시 고려사항

- [!] 팀 규모와 역량 고려
- [!] 운영 복잡도 증가 대비
- [!] 모니터링/로깅 인프라 필수
- [!] 점진적 전환 권장 (Strangler Pattern)

---

*마이크로서비스는 은탄환이 아닙니다. 조직과 시스템 규모에 맞게 선택하세요.*"""

    def _generate_generic_advanced_response(
        self, topic: str, analysis: QueryAnalysis
    ) -> str:
        """일반 심화 응답"""
        return f"""# {topic} 심화 가이드

## 개요

{topic}에 대한 심화 내용을 다룹니다.

## 핵심 개념

{topic}을(를) 깊이 이해하기 위해서는 다음 개념들이 중요합니다:

1. **기본 원리**: 핵심 작동 방식 이해
2. **베스트 프랙티스**: 업계에서 검증된 방법론
3. **성능 고려사항**: 최적화 포인트
4. **실무 적용**: 실제 프로젝트 적용 방법

## 심화 학습 방향

| 단계 | 내용 | 권장 자료 |
|------|------|----------|
| 1단계 | 공식 문서 정독 | 공식 Documentation |
| 2단계 | 실습 프로젝트 | 토이 프로젝트 |
| 3단계 | 오픈소스 분석 | GitHub 인기 저장소 |
| 4단계 | 커뮤니티 참여 | Discord, Slack |

## 주의사항

- [!] 이론만으로는 부족합니다. 직접 코드를 작성하세요
- [!] 최신 버전과 문서를 확인하세요
- [!] 커뮤니티에서 다른 개발자의 경험을 참고하세요

---

*더 구체적인 질문이 있으시면 해당 주제로 다시 질문해주세요.*"""

    def _generate_alternatives_section(self, analysis: QueryAnalysis) -> str:
        """대안 섹션 생성"""
        if analysis.intent == QueryIntent.CODE_GENERATION:
            return """## 대안적 접근법

다른 방식으로도 구현할 수 있습니다:

| 방식 | 장점 | 단점 |
|------|------|------|
| 위 코드 | 직관적, 이해 쉬움 | 대규모에서 성능 이슈 가능 |
| 라이브러리 활용 | 검증됨, 유지보수 쉬움 | 의존성 추가 |
| 함수형 접근 | 테스트 용이, 재사용성 | 학습 곡선 |"""
        return ""

    def _generate_warnings_section(self, analysis: QueryAnalysis) -> str:
        """주의사항 섹션 생성"""
        warnings = {
            QueryIntent.CODE_GENERATION: """## 주의사항

- [!] 프로덕션 환경에서는 에러 처리를 더 견고하게 해주세요
- [!] 보안 관련 코드는 별도 검토가 필요합니다
- [!] 테스트 코드 작성을 권장합니다""",
            QueryIntent.TROUBLESHOOTING: """## 주의사항

- [!] 변경 전 백업을 권장합니다
- [!] 다른 환경에서는 다르게 동작할 수 있습니다
- [!] 근본 원인을 파악한 후 수정하세요""",
        }
        return warnings.get(analysis.intent, "")

    def _generate_next_steps_section(self, analysis: QueryAnalysis) -> str:
        """다음 단계 섹션 생성"""
        return """## 다음 단계

이 내용을 이해했다면:

1. **실습**: 직접 코드를 작성해보세요
2. **심화**: 관련 고급 주제를 학습하세요
3. **적용**: 실제 프로젝트에 적용해보세요"""

    def _finalize_response(
        self, response: str, analysis: QueryAnalysis, semantic_context: Dict
    ) -> str:
        """최종 응답 품질 보증"""
        # 최소 길이 검증
        min_length = self.response_quality_metrics["min_response_lengths"].get(
            analysis.intent, 500
        )

        if len(response) < min_length:
            # 응답이 너무 짧으면 보강
            response = self._expand_short_response(response, analysis, semantic_context)

        # 구조 검증
        if "##" not in response and len(response) > 500:
            # 구조가 없으면 추가
            response = self._add_structure_to_response(response)

        return response

    def _expand_short_response(
        self, response: str, analysis: QueryAnalysis, semantic_context: Dict
    ) -> str:
        """짧은 응답 확장"""
        # 관련 정보 추가
        expansion = "\n\n## 추가 정보\n\n"

        if analysis.key_topics:
            topic = analysis.key_topics[0]
            expansion += f"**{topic}**에 대해 더 알아보면 좋을 점:\n\n"
            expansion += "- 공식 문서를 참고하면 최신 정보를 얻을 수 있습니다\n"
            expansion += "- 실제 프로젝트에 적용해보면서 학습하는 것을 권장합니다\n"
            expansion += "- 커뮤니티에서 다른 개발자들의 경험을 참고해보세요\n"

        return response + expansion

    def _add_structure_to_response(self, response: str) -> str:
        """응답에 구조 추가"""
        lines = response.split("\n")
        if lines and not lines[0].startswith("#"):
            lines.insert(0, "# 답변\n")
        return "\n".join(lines)

    def _enhance_context_with_history(
        self, context: Optional[Dict], history: List[Dict]
    ) -> Dict:
        """대화 히스토리를 컨텍스트에 반영 - 강화된 맥락 유지"""
        ctx = context.copy() if context else {}

        if not history:
            return ctx

        # 최근 대화에서 주제 추출
        recent_topics = []
        recent_entities = []
        tech_stack = []

        topic_keywords = {
            "python": ["python", "파이썬", "django", "flask", "fastapi"],
            "javascript": ["javascript", "js", "node", "노드"],
            "react": ["react", "리액트", "jsx", "hooks"],
            "vue": ["vue", "뷰", "vuex", "nuxt"],
            "typescript": ["typescript", "ts", "타입스크립트"],
            "database": ["sql", "mysql", "postgresql", "mongodb", "데이터베이스", "db"],
            "docker": ["docker", "도커", "container", "컨테이너"],
            "git": ["git", "깃", "github", "gitlab"],
            "ai": ["ai", "ml", "딥러닝", "머신러닝", "gpt", "llm"],
        }

        for msg in history[-10:]:  # 최근 10개 메시지로 확장
            content = msg.get("content", "").lower()
            role = msg.get("role", "")

            # 주제 추출
            for topic, keywords in topic_keywords.items():
                if any(kw in content for kw in keywords):
                    recent_topics.append(topic)

            # 사용자가 언급한 구체적 기술 스택
            if role == "user":
                # 버전 정보 추출
                version_match = re.search(r"(\w+)\s*(\d+\.?\d*)", content)
                if version_match:
                    tech_stack.append(
                        f"{version_match.group(1)} {version_match.group(2)}"
                    )

                # 프로젝트명/파일명 추출
                file_match = re.search(
                    r"(\w+\.(py|js|ts|jsx|tsx|vue|css|html))", content
                )
                if file_match:
                    recent_entities.append(file_match.group(1))

        ctx["recent_topics"] = list(set(recent_topics))
        ctx["tech_stack"] = list(set(tech_stack))
        ctx["recent_entities"] = list(set(recent_entities))[:5]
        ctx["has_history"] = True
        ctx["history_length"] = len(history)
        ctx["conversation_consistency_instruction"] = (
            "이전 대화에서 논의된 용어·가정·결정사항을 유지하여 일관되게 답변하세요. "
            "최근 대화 맥락을 반드시 참고하세요."
        )

        # 최근 대화 요약 (마지막 2개)
        if len(history) >= 2:
            last_user = next(
                (
                    m.get("content", "")[:100]
                    for m in reversed(history)
                    if m.get("role") == "user"
                ),
                "",
            )
            ctx["last_user_query"] = last_user

        return ctx

    def _apply_response_diversity(self, response: str, analysis: QueryAnalysis) -> str:
        """응답에 다양성 적용 - 시간 기반 랜덤화"""
        import random
        import time

        # 시간 기반 시드로 다양성 확보
        random.seed(int(time.time() * 1000) % 100000)

        # 의도별 시작 문구
        intent_openings = {
            QueryIntent.CODE_GENERATION: [
                "",
                "요청하신 코드를 작성해드리겠습니다.\n\n",
                "코드로 구현해보겠습니다.\n\n",
            ],
            QueryIntent.HOW_TO: [
                "",
                "단계별로 설명드리겠습니다.\n\n",
                "방법을 안내해드리겠습니다.\n\n",
            ],
            QueryIntent.TROUBLESHOOTING: [
                "",
                "문제 해결 방법을 알려드리겠습니다.\n\n",
                "해당 문제에 대해 분석해보겠습니다.\n\n",
            ],
            QueryIntent.COMPARISON: [
                "",
                "비교 분석을 해보겠습니다.\n\n",
                "각각의 특징을 살펴보겠습니다.\n\n",
            ],
            QueryIntent.CREATIVE: [
                "",
                "요청하신 내용으로 작성해보겠습니다.\n\n",
            ],
        }

        # 기본 시작 문구
        opening_phrases = intent_openings.get(
            analysis.intent,
            [
                "",
                "좋은 질문이네요! ",
                "말씀하신 내용에 대해 설명드리겠습니다.\n\n",
            ],
        )

        # 마무리 문구 다양화
        closing_phrases = [
            "",
            "\n\n---\n추가 질문이 있으시면 언제든 말씀해주세요!",
            "\n\n더 궁금한 점이 있으시면 물어봐주세요.",
            "\n\n도움이 되셨길 바랍니다.",
            "\n\n더 자세한 내용이 필요하시면 말씀해주세요!",
            "",
        ]

        # 랜덤 선택 (시간 + 쿼리 기반) - 같은 질문에도 다양한 응답
        import time

        time_factor = int(time.time() * 1000) % 1000
        seed = (hash(analysis.original_query) + time_factor) % 100
        opening = (
            opening_phrases[seed % len(opening_phrases)] if opening_phrases else ""
        )
        closing = (
            closing_phrases[seed % len(closing_phrases)] if closing_phrases else ""
        )

        # 이미 제목이 있으면 opening 생략
        if response.startswith("#"):
            opening = ""

        return opening + response + closing

    def _analyze_query(self, query: str) -> QueryAnalysis:
        """질문 심층 분석 - 긴 질문 및 복합 요구사항 지원"""
        query_lower = query.lower()

        # 복합 요구사항 분리
        sub_queries = self._split_compound_query(query)

        # 의도 파악
        intent = self._detect_intent(query_lower)

        # 복합 질문 처리 - 가장 복잡한 의도 선택
        if len(sub_queries) > 1:
            sub_intents = [self._detect_intent(sq.lower()) for sq in sub_queries]
            intent_priority = {
                QueryIntent.CREATIVE: 10,
                QueryIntent.CODE_GENERATION: 9,
                QueryIntent.HOW_TO: 8,
                QueryIntent.COMPARISON: 7,
                QueryIntent.TROUBLESHOOTING: 6,
            }
            intent = max(sub_intents, key=lambda x: intent_priority.get(x, 0))

        # 주제 카테고리 파악
        topic_category = self._detect_topic_category(query_lower)

        # 핵심 주제 추출
        key_topics = self._extract_key_topics(query_lower)

        # 복잡도 평가 (긴 질문은 복잡도 상향)
        complexity = self._assess_complexity(query)
        if len(query) > 200 or len(sub_queries) > 1:
            complexity = "complex"

        # 코드 필요 여부
        requires_code = self._check_requires_code(query_lower, intent)

        # 예시 필요 여부
        requires_example = self._check_requires_example(query_lower)

        # 선호 프로그래밍 언어
        language_preference = self._detect_language_preference(query_lower)

        # 특정 측면 추출
        specific_aspects = self._extract_specific_aspects(query_lower)

        # 복합 질문의 하위 요구사항 추가
        if len(sub_queries) > 1:
            for i, sq in enumerate(sub_queries[:3]):
                specific_aspects.append(f"요구{i + 1}: {sq[:50]}")

        return QueryAnalysis(
            original_query=query,
            intent=intent,
            topic_category=topic_category,
            key_topics=key_topics,
            complexity=complexity,
            requires_code=requires_code,
            requires_example=requires_example,
            language_preference=language_preference,
            specific_aspects=specific_aspects,
        )

    def _split_compound_query(self, query: str) -> List[str]:
        """복합 질문을 하위 질문으로 분리 - 개선된 버전"""
        # 1단계: "~하고" 패턴으로 분리 (가장 흔한 복합 패턴)
        # "Python이 뭔지 설명하고, Flask로 API 코드 짜줘"
        compound_patterns = [
            r"[,，]\s*",  # 쉼표로 구분
            r"(?:하고|해주고|알려주고|설명하고|짜주고)\s*[,，]?\s*",  # ~하고 패턴
            r"(?:그리고|또한|추가로|더불어|아울러)\s+",
            r"(?:\d+[\.\)]\s*)",
            r"(?:첫째|둘째|셋째|넷째)",
            r"(?:먼저|다음으로|마지막으로)",
            r"\s+(?:도\s+알려|도\s+설명|도\s+짜)",
        ]

        sub_queries = [query]

        for pattern in compound_patterns:
            new_subs = []
            for sq in sub_queries:
                parts = re.split(pattern, sq)
                new_subs.extend([p.strip() for p in parts if p.strip()])
            sub_queries = new_subs

        # 2단계: 각 부분에 동사가 없으면 기본 동사 추가
        enhanced_subs = []
        for sq in sub_queries:
            sq = sq.strip()
            if len(sq) < 5:
                continue
            # 동사가 없는 경우 추가
            if not any(
                verb in sq
                for verb in [
                    "해줘",
                    "알려",
                    "설명",
                    "짜줘",
                    "만들",
                    "보여",
                    "뭐야",
                    "뭔지",
                ]
            ):
                # "~이/가 뭔지" 형태면 "설명해줘" 추가
                if any(
                    kw in sq.lower()
                    for kw in ["python", "react", "docker", "javascript", "api"]
                ):
                    if "코드" in sq or "짜" in sq:
                        sq = sq + " 코드 짜줘"
                    else:
                        sq = sq + " 설명해줘"
            enhanced_subs.append(sq)

        # 3단계: 너무 짧은 부분 필터링 및 중복 제거
        filtered = []
        for sq in enhanced_subs:
            if len(sq) > 8 and sq not in filtered:
                filtered.append(sq)

        return filtered if len(filtered) > 1 else [query]  # 분리 안 되면 원본 반환

    def _handle_compound_query(
        self, sub_queries: List[str], context: Optional[Dict]
    ) -> str:
        """복합 질문 처리 - 각 요구사항에 대해 순차적으로 응답"""
        response_parts = []

        response_parts.append("# 요청하신 내용에 대해 답변드리겠습니다\n\n")
        response_parts.append(
            f"> 총 **{len(sub_queries)}개**의 요청사항을 확인했습니다.\n\n"
        )
        response_parts.append("---\n\n")

        for i, sub_query in enumerate(sub_queries[:4], 1):
            # 각 하위 질문 분석
            sub_analysis = self._analyze_query(sub_query)
            sub_thought = self._generate_thought_process(sub_analysis, context)

            # 섹션 제목
            response_parts.append(
                f"## {i}. {sub_query[:50]}{'...' if len(sub_query) > 50 else ''}\n\n"
            )

            # 간단한 응답 생성 (축약 버전)
            sub_response = self._generate_compact_response(sub_analysis, sub_thought)
            response_parts.append(sub_response)
            response_parts.append("\n\n---\n\n")

        # 요약
        response_parts.append("## 추가 안내\n\n")
        response_parts.append(
            "각 항목에 대해 더 자세한 설명이 필요하시면 해당 주제만 따로 질문해주세요!\n"
        )

        return "".join(response_parts)

    def _generate_compact_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess
    ) -> str:
        """압축된 응답 생성 (복합 질문의 하위 항목용) - 개선 버전"""
        query_lower = analysis.original_query.lower()
        topic = analysis.key_topics[0] if analysis.key_topics else "해당 주제"

        # 코드 요청
        if analysis.intent == QueryIntent.CODE_GENERATION:
            lang = analysis.language_preference or "python"
            code = self._get_basic_code(lang, analysis.original_query)
            return f"**코드 예시:**\n\n{code}\n\n**사용법:** 위 코드를 복사해서 사용하세요. 필요에 따라 수정해서 활용할 수 있습니다.\n"

        # 비교 요청
        if analysis.intent == QueryIntent.COMPARISON:
            return self._generate_compact_comparison(analysis.key_topics)

        # 문제 해결
        if analysis.intent == QueryIntent.TROUBLESHOOTING:
            return f"""**해결 방법:**

1. 먼저 에러 메시지를 정확히 확인하세요
2. 로그를 검토하여 원인을 파악하세요
3. 캐시/의존성 초기화: `rm -rf node_modules && npm install` 또는 `pip install --upgrade`
4. 관련 문서나 Stack Overflow를 검색해보세요

**일반적인 해결책:**
- 권한 문제: `sudo` 사용 또는 권한 변경
- 버전 문제: 호환 버전으로 업/다운그레이드
- 의존성 문제: lock 파일 삭제 후 재설치
"""

        # How-to
        if analysis.intent == QueryIntent.HOW_TO:
            return self._generate_compact_howto(topic, query_lower)

        # 설명 요청 - 개선된 버전
        if analysis.intent == QueryIntent.EXPLANATION:
            return self._generate_compact_explanation(topic, query_lower)

        # 일반
        return f"""**{topic} 핵심 정보:**

{thought.understanding}

**주요 특징:**
- 현재 널리 사용되는 기술/개념입니다
- 관련 생태계가 잘 발달되어 있습니다
- 공식 문서와 커뮤니티 지원이 활발합니다
"""

    def _generate_compact_explanation(self, topic: str, query_lower: str) -> str:
        """압축된 설명 응답 - 주제별 맞춤"""
        explanations = {
            "python": """**Python이란?**

읽기 쉽고 배우기 쉬운 범용 프로그래밍 언어입니다.

**특징:**
- 간결하고 명확한 문법
- 다양한 분야에 활용 (웹, AI/ML, 데이터, 자동화)
- 풍부한 라이브러리 생태계

**왜 인기 있나?**
| 장점 | 설명 |
|------|------|
| 쉬운 학습 | 영어처럼 읽히는 문법 |
| 생산성 | 적은 코드로 많은 일 |
| 범용성 | 웹, AI, 데이터 등 다양한 분야 |

```python
# Python 예시
print("Hello, World!")
```""",
            "javascript": """**JavaScript란?**

웹의 표준 프로그래밍 언어로, 브라우저와 서버 모두에서 동작합니다.

**특징:**
- 웹 페이지에 동적 기능 추가
- Node.js로 서버 개발 가능
- 프론트엔드/백엔드 모두 사용

**사용 분야:**
- 프론트엔드: React, Vue, Angular
- 백엔드: Node.js, Express
- 모바일: React Native, Ionic""",
            "react": """**React란?**

Facebook이 만든 UI 라이브러리로, 컴포넌트 기반 개발을 지원합니다.

**핵심 개념:**
- 컴포넌트: 재사용 가능한 UI 조각
- 가상 DOM: 효율적인 렌더링
- 단방향 데이터 흐름

**왜 인기 있나?**
- 대규모 생태계
- 채용 시장 1위
- React Native로 모바일 앱 개발 가능""",
            "docker": """**Docker란?**

애플리케이션을 컨테이너로 패키징하여 어디서든 동일하게 실행하는 기술입니다.

**핵심 개념:**
- 컨테이너: 격리된 실행 환경
- 이미지: 컨테이너 템플릿
- Dockerfile: 이미지 빌드 명세

**장점:**
- "내 컴퓨터에서는 되는데" 문제 해결
- 환경 일관성 보장
- 배포 자동화 용이""",
        }

        # 주제에 맞는 설명 찾기
        for key, explanation in explanations.items():
            if key in query_lower:
                return explanation

        # 기본 설명
        return f"""**{topic}이란?**

{topic}은(는) 해당 분야에서 널리 사용되는 기술/개념입니다.

**주요 특징:**
- 현재 업계에서 활발하게 사용됨
- 관련 문서와 커뮤니티가 잘 발달됨
- 학습 자료가 풍부함

더 자세한 내용은 공식 문서를 참고하시거나 별도로 질문해주세요."""

    def _generate_compact_howto(self, topic: str, query_lower: str) -> str:
        """압축된 How-to 응답"""
        return f"""**{topic} 진행 방법:**

**1단계: 준비**
- 필요한 환경과 도구를 설치합니다
- 공식 문서에서 요구사항을 확인합니다

**2단계: 설정**
- 기본 설정을 완료합니다
- 설정 파일을 환경에 맞게 수정합니다

**3단계: 실행**
- 테스트 환경에서 먼저 실행합니다
- 문제가 있으면 로그를 확인합니다

**4단계: 검증**
- 예상대로 동작하는지 확인합니다
- 필요하면 추가 설정을 진행합니다

> 구체적인 단계는 해당 주제로 다시 질문해주시면 상세히 안내드립니다."""

    def _generate_compact_comparison(self, topics: List[str]) -> str:
        """압축된 비교 응답"""
        if len(topics) >= 2:
            return f"""**{topics[0]} vs {topics[1]} 비교:**

| 항목 | {topics[0]} | {topics[1]} |
|------|------|------|
| 특징 | - | - |
| 용도 | - | - |
| 장점 | - | - |

자세한 비교는 해당 주제로 다시 질문해주세요.
"""
        return (
            "비교 대상을 구체적으로 명시해주시면 더 정확한 비교를 제공해드리겠습니다."
        )

    def _detect_intent(self, query: str) -> QueryIntent:
        """질문 의도 감지"""

        # 코드 생성 요청 (가장 먼저 체크 - 프로그래밍 언어 키워드 포함시)
        code_patterns = [
            r"코드.*(?:작성|만들|생성|짜|줘)",
            r"(?:작성|만들|생성).*코드",
            r"구현.*해[줘주]",
            r"프로그램.*만들",
            r"스크립트.*작성",
            r"(?:sql|쿼리).*(?:작성|만들)",
            r"(?:python|파이썬|자바|java|js|javascript|typescript|ts|타입스크립트).*(?:로|으로).*(?:만들|작성|생성|짜)",
            r"(?:python|파이썬|자바|java|js|javascript|typescript|ts|타입스크립트).*(?:함수|클래스|코드)",
            r"크롤러.*(?:만들|작성|생성)",
            r"(?:웹|web).*크롤",
            r"(?:작성|만들).*(?:sql|쿼리)",
            r"테이블.*(?:만들|생성)",
            r"컴포넌트.*(?:만들|작성|생성)",
            r"(?:만들|작성).*컴포넌트",
            r"함수.*(?:만들|작성|생성)",
            r"(?:crud|CRUD).*(?:작성|만들|생성)",
            r"(?:작성|만들).*(?:crud|CRUD)",
            r"api.*(?:작성|만들|생성)",
        ]
        for pattern in code_patterns:
            if re.search(pattern, query):
                return QueryIntent.CODE_GENERATION

        # 창작/글쓰기 요청 (코드 이후 체크)
        creative_patterns = [
            r"(?:글|칼럼|기사|에세이|논평|비평|리뷰).*(?:써|작성|만들)",
            r"(?:써|작성).*(?:글|칼럼|기사)",
            r"스타일.*(?:로|으로).*(?:써|작성|분석)",
            r"(?:유시민|김어준|진중권|나경원|손석희|정재승|유홍준).*스타일",
            r"(?:유시민|김어준|진중권|손석희|정재승|유홍준).*(?:처럼|같이)",
            r"비판.*(?:적|시각|관점).*(?:로|에서|으로)",
            r"(?:분석|해석|논평).*해[줘주]",
            r"(?:심각성|문제점|비판).*(?:강조|지적)",
            r"취지.*(?:로|로써).*글",
            r"(?:관점|시각|입장).*(?:에서|으로).*(?:써|분석|작성)",
            r"팩트체크.*해[줘주]",
            r".*스타일로.*(?:써|작성|분석|해[줘주])",
            r"(?:과학적|논리적).*분석.*해[줘주]",
        ]
        for pattern in creative_patterns:
            if re.search(pattern, query):
                return QueryIntent.CREATIVE

        # 문제 해결 (HOW_TO보다 먼저 체크 - 에러/문제 키워드가 있으면 우선)
        troubleshoot_patterns = [
            r"에러",
            r"오류",
            r"안\s*(?:됨|돼|되)",
            r"해결",
            r"왜.*안",
            r"실패",
            r"conflict",
            r"충돌",
            r"exit\s*code",
            r"재시작",
            r"죽어",
            r"멈춰",
            r"crash",
            r"killed",
            r"timeout",
            r"exception",
            r"\b\d{3}\b",  # 에러 코드 (137, 500 등)
        ]
        for pattern in troubleshoot_patterns:
            if re.search(pattern, query):
                return QueryIntent.TROUBLESHOOTING

        # 방법 요청
        how_to_patterns = [
            r"어떻게",
            r"방법",
            r"하는\s*법",
            r"하려면",
            r"만드는",
            r"설치",
            r"설정",
            r"사용법",
            r"명령어",
            r"command",
        ]
        for pattern in how_to_patterns:
            if re.search(pattern, query):
                return QueryIntent.HOW_TO

        # Linux 관련 질문은 How-to로 처리
        linux_terms = [
            "linux",
            "리눅스",
            "ubuntu",
            "centos",
            "chmod",
            "chown",
            "sudo",
            "apt",
            "yum",
        ]
        if any(term in query for term in linux_terms):
            return QueryIntent.HOW_TO

        # 비교 요청 (단, git 관련 용어는 How-to로 처리)
        git_terms = ["merge", "rebase", "브랜치", "커밋", "reset", "되돌"]
        is_git_related = any(term in query for term in git_terms)

        comparison_patterns = [
            r"차이",
            r"비교",
            r"vs",
            r"versus",
            r"다른\s*점",
            r"뭐가\s*(?:더|나아)",
            r"(?:react|vue|angular).*(?:와|하고|vs).*(?:react|vue|angular)",
            r"(?:python|javascript|java|go).*(?:와|하고|vs).*(?:python|javascript|java|go)",
            r"(?:mysql|postgresql|mongodb|redis).*(?:와|하고|vs)",
            r"(?:docker|kubernetes).*(?:와|하고|vs)",
        ]
        for pattern in comparison_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                # Git 관련 질문은 How-to로 처리
                if is_git_related:
                    return QueryIntent.HOW_TO
                return QueryIntent.COMPARISON

        # 추천 요청 (강화된 패턴)
        recommendation_patterns = [
            r"추천",
            r"좋은",
            r"베스트",
            r"최고",
            r"어떤.*(?:써야|사용|배울|선택)",
            r"(?:뭐|무엇).*(?:좋|배울|사용)",
            r"(?:언어|프레임워크|라이브러리).*(?:배울|시작|입문)",
            r"(?:강의|책|자료).*(?:추천|좋은)",
            r"(?:호스팅|배포|서버).*(?:추천|좋은|무료)",
            r"(?:에디터|IDE|ide).*(?:추천|좋은)",
            r"(?:DB|데이터베이스).*(?:추천|선택)",
            r"입문.*(?:추천|좋은)",
        ]
        for pattern in recommendation_patterns:
            if re.search(pattern, query):
                return QueryIntent.RECOMMENDATION

        # 설명·분석·요약 요청 (부동산·일반 질문 포함)
        analysis_request_patterns = [
            r"파악",
            r"분석",
            r"분위기",
            r"현황",
            r"동향",
            r"정리",
            r"요약",
            r"설명해",
            r"말해줘",
            r"알려줘",
            r"해줘",
            r"해주",
        ]
        for pattern in analysis_request_patterns:
            if re.search(pattern, query):
                return QueryIntent.EXPLANATION

        # 설명 요청
        explanation_patterns = [
            r"(?:뭐|무엇)",
            r"뭔지",
            r"설명",
            r"알려",
            r"이란",
            r"란\?",
            r"가\s*뭐",
            r"무슨",
            r"(?:이|가)\s*뭐야",
        ]
        for pattern in explanation_patterns:
            if re.search(pattern, query):
                return QueryIntent.EXPLANATION

        # 창작 요청
        creative_patterns = [
            r"(?:글|이야기|스토리).*(?:써|작성)",
            r"(?:써|작성).*(?:글|이야기)",
        ]
        for pattern in creative_patterns:
            if re.search(pattern, query):
                return QueryIntent.CREATIVE

        return QueryIntent.GENERAL_CHAT

    def _detect_topic_category(self, query: str) -> TopicCategory:
        """주제 카테고리 감지"""
        # 프로그래밍 언어
        lang_keywords = [
            "python",
            "파이썬",
            "javascript",
            "js",
            "typescript",
            "ts",
            "java",
            "c++",
            "go",
            "rust",
            "ruby",
            "php",
            "swift",
            "kotlin",
        ]
        if any(kw in query for kw in lang_keywords):
            return TopicCategory.PROGRAMMING_LANGUAGE

        # 웹 프레임워크
        web_keywords = [
            "react",
            "리액트",
            "vue",
            "angular",
            "django",
            "flask",
            "fastapi",
            "express",
            "node",
            "nextjs",
            "nuxt",
        ]
        if any(kw in query for kw in web_keywords):
            return TopicCategory.WEB_FRAMEWORK

        # 데이터베이스
        db_keywords = [
            "sql",
            "mysql",
            "postgresql",
            "mongodb",
            "redis",
            "database",
            "데이터베이스",
            "db",
            "쿼리",
        ]
        if any(kw in query for kw in db_keywords):
            return TopicCategory.DATABASE

        # DevOps
        devops_keywords = [
            "docker",
            "kubernetes",
            "k8s",
            "aws",
            "azure",
            "gcp",
            "ci/cd",
            "jenkins",
            "git",
            "linux",
            "배포",
            "서버",
        ]
        if any(kw in query for kw in devops_keywords):
            return TopicCategory.DEVOPS

        # AI/ML
        ai_keywords = [
            "머신러닝",
            "machine learning",
            "ml",
            "딥러닝",
            "deep learning",
            "ai",
            "인공지능",
            "tensorflow",
            "pytorch",
            "모델",
        ]
        if any(kw in query for kw in ai_keywords):
            return TopicCategory.AI_ML

        # 알고리즘
        algo_keywords = [
            "알고리즘",
            "정렬",
            "검색",
            "자료구조",
            "복잡도",
            "big o",
            "배열",
            "리스트",
            "트리",
            "그래프",
        ]
        if any(kw in query for kw in algo_keywords):
            return TopicCategory.ALGORITHM

        # 일반 IT
        it_keywords = ["api", "프로그래밍", "코딩", "개발", "웹", "앱", "소프트웨어"]
        if any(kw in query for kw in it_keywords):
            return TopicCategory.GENERAL_IT

        return TopicCategory.NON_TECH

    def _extract_key_topics(self, query: str) -> List[str]:
        """핵심 주제 추출"""
        topics = []

        # 기술 키워드 매핑
        tech_keywords = {
            "python": ["python", "파이썬"],
            "javascript": ["javascript", "js", "자바스크립트"],
            "typescript": ["typescript", "ts", "타입스크립트"],
            "react": ["react", "리액트"],
            "nodejs": ["node", "nodejs", "노드"],
            "docker": ["docker", "도커"],
            "kubernetes": ["kubernetes", "k8s", "쿠버네티스"],
            "git": ["git", "깃"],
            "sql": ["sql", "mysql", "postgresql"],
            "api": ["api", "rest", "restful"],
            "aws": ["aws", "아마존", "amazon"],
            "machine_learning": ["머신러닝", "ml", "machine learning"],
            "web_crawling": ["크롤러", "크롤링", "crawler", "scraping"],
            "algorithm": ["알고리즘", "algorithm"],
            "security": ["보안", "security", "인증", "해킹"],
        }

        for topic, keywords in tech_keywords.items():
            if any(kw in query for kw in keywords):
                topics.append(topic)

        return topics if topics else ["general"]

    def _assess_complexity(self, query: str) -> str:
        """질문 복잡도 평가"""
        # 길이 기반
        if len(query) > 200:
            length_score = 2
        elif len(query) > 100:
            length_score = 1
        else:
            length_score = 0

        # 요구사항 개수
        requirement_patterns = [r"\d+[\.\)]", r"첫째|둘째|셋째", r"그리고|또한|추가로"]
        req_count = sum(len(re.findall(p, query)) for p in requirement_patterns)

        # 복합 질문
        question_count = query.count("?")

        total_score = length_score + req_count + question_count

        if total_score >= 4:
            return "complex"
        elif total_score >= 2:
            return "moderate"
        return "simple"

    def _check_requires_code(self, query: str, intent: QueryIntent) -> bool:
        """코드 필요 여부 확인"""
        if intent == QueryIntent.CODE_GENERATION:
            return True

        code_keywords = ["코드", "예제", "예시", "구현", "스크립트", "함수", "클래스"]
        return any(kw in query for kw in code_keywords)

    def _check_requires_example(self, query: str) -> bool:
        """예시 필요 여부 확인"""
        example_keywords = ["예", "예시", "예제", "샘플", "실제", "구체적"]
        return any(kw in query for kw in example_keywords)

    def _detect_language_preference(self, query: str) -> Optional[str]:
        """프로그래밍 언어 선호도 감지"""
        language_map = {
            "python": ["python", "파이썬"],
            "javascript": ["javascript", "js", "자바스크립트"],
            "typescript": ["typescript", "ts", "타입스크립트"],
            "java": ["java", "자바"],
            "go": ["golang", "go언어"],
            "rust": ["rust", "러스트"],
        }

        for lang, keywords in language_map.items():
            if any(kw in query for kw in keywords):
                return lang

        return None

    def _extract_specific_aspects(self, query: str) -> List[str]:
        """특정 측면 추출"""
        aspects = []

        aspect_patterns = {
            "performance": ["성능", "빠른", "최적화", "performance"],
            "security": ["보안", "안전", "security"],
            "scalability": ["확장", "scalable", "규모"],
            "simplicity": ["간단", "쉬운", "simple", "기초"],
            "advanced": ["고급", "심화", "advanced", "전문"],
            "practical": ["실무", "실제", "실용", "practical"],
        }

        for aspect, keywords in aspect_patterns.items():
            if any(kw in query for kw in keywords):
                aspects.append(aspect)

        return aspects

    def _generate_thought_process(
        self, analysis: QueryAnalysis, context: Optional[Dict]
    ) -> ThoughtProcess:
        """사고 과정 생성"""

        # 질문 이해
        understanding = self._formulate_understanding(analysis)

        # 핵심 포인트 도출
        key_points = self._derive_key_points(analysis)

        # 접근 방식 결정
        approach = self._determine_approach(analysis)

        # 고려 사항 (요구·질문 맞춤 지시를 맨 앞에 두어 우선 반영)
        considerations = []
        if context and context.get("korean_layer_instruction"):
            considerations.append(
                "[한국어 이해·출력 계층]\n"
                + str(context["korean_layer_instruction"])[:1200]
            )
        if context and context.get("multilayer_style_hint"):
            import json as _json

            _mh = context["multilayer_style_hint"]
            try:
                if isinstance(_mh, (dict, list)):
                    considerations.append(
                        "[다층 스타일 힌트(프론트)]\n"
                        + _json.dumps(_mh, ensure_ascii=False)[:1000]
                    )
                else:
                    considerations.append(
                        "[다층 스타일 힌트(프론트)]\n" + str(_mh)[:1000]
                    )
            except (TypeError, ValueError):
                pass
        if context and context.get("_user_message_priority_hint"):
            considerations.append(str(context["_user_message_priority_hint"])[:700])
        if context and context.get("_adapt_answer_to_request_instruction"):
            considerations.append(str(context["_adapt_answer_to_request_instruction"])[:800])
        if context and context.get("_multi_request_instruction"):
            considerations.append(
                "[다중 질문·요구]\n" + str(context["_multi_request_instruction"])[:900]
            )
        if context and context.get("_advanced_memory_instruction"):
            considerations.append(str(context["_advanced_memory_instruction"])[:500])
        considerations.extend(self._identify_considerations(analysis))
        if context and context.get("has_history"):
            consistency_inst = context.get("conversation_consistency_instruction") or (
                "이전 대화에서 논의된 용어·가정·결정사항을 유지하여 일관되게 답변하세요."
            )
            considerations = list(considerations) + [consistency_inst]
        # 사전 파이프라인: 논리 구성·스타일 지시 반영
        if context and context.get("_logical_structure_outline"):
            considerations = list(considerations) + [
                f"구조: {context['_logical_structure_outline'][:200]}"
            ]
        if context and context.get("_style_and_tone_instruction"):
            considerations = list(considerations) + [
                f"스타일: {context['_style_and_tone_instruction'][:150]}"
            ]

        return ThoughtProcess(
            understanding=understanding,
            key_points=key_points,
            approach=approach,
            considerations=considerations,
        )

    def _formulate_understanding(self, analysis: QueryAnalysis) -> str:
        """질문 이해 정립 - 심층 분석"""
        query = analysis.original_query

        # 의도별 상세 설명
        intent_descriptions = {
            QueryIntent.EXPLANATION: "개념이나 기술에 대한 설명을 원함",
            QueryIntent.HOW_TO: "특정 작업을 수행하는 방법을 알고 싶어함",
            QueryIntent.CODE_GENERATION: "실제 동작하는 코드가 필요함",
            QueryIntent.COMPARISON: "두 개 이상의 대상을 비교하고 싶어함",
            QueryIntent.TROUBLESHOOTING: "문제를 해결하려고 함",
            QueryIntent.RECOMMENDATION: "조언이나 추천을 원함",
            QueryIntent.CREATIVE: "창작 콘텐츠를 원함",
            QueryIntent.FACTUAL: "사실 여부를 확인하고 싶어함",
            QueryIntent.GENERAL_CHAT: "일반적인 대화를 원함",
        }

        base_understanding = intent_descriptions.get(
            analysis.intent, "질문 의도 파악 중"
        )

        # 심층 맥락 분석 추가
        context_analysis = []

        # 질문의 범위 파악
        if len(query) > 100:
            context_analysis.append("상세한 설명이 필요한 복합적 질문")

        # 전문 용어 감지
        tech_terms = [
            "API",
            "SDK",
            "프레임워크",
            "라이브러리",
            "아키텍처",
            "패턴",
            "알고리즘",
        ]
        if any(term in query for term in tech_terms):
            context_analysis.append("기술적 깊이가 필요한 질문")

        # 실무 관련 키워드
        practical_terms = ["실무", "프로덕션", "실제", "현업", "배포", "운영"]
        if any(term in query for term in practical_terms):
            context_analysis.append("실무 적용 관점의 답변 필요")

        # 비교/선택 관련
        if "vs" in query.lower() or "차이" in query or "비교" in query:
            context_analysis.append("객관적 비교와 선택 기준 제시 필요")

        # 문제 해결 관련
        if "에러" in query or "오류" in query or "안됨" in query or "실패" in query:
            context_analysis.append("구체적인 해결 방법과 예방책 필요")

        if context_analysis:
            return f"{base_understanding}. 특히 {', '.join(context_analysis)}"
        return base_understanding

    def _derive_key_points(self, analysis: QueryAnalysis) -> List[str]:
        """핵심 포인트 도출 - 논리적 체계화"""
        points = []
        query = analysis.original_query.lower()

        # 주제 기반 포인트
        for topic in analysis.key_topics:
            if topic and topic != "general":
                points.append(f"{topic}에 대한 핵심 개념 설명")

        # 의도 기반 상세 포인트
        if analysis.intent == QueryIntent.CODE_GENERATION:
            points.extend(
                [
                    "실행 가능한 완전한 코드 작성",
                    "코드의 각 부분에 대한 상세 설명",
                    "에러 처리 및 예외 상황 고려",
                    "실제 사용 예시 포함",
                ]
            )
        elif analysis.intent == QueryIntent.CREATIVE:
            points.extend(
                [
                    "요청된 스타일/톤에 맞는 글 작성",
                    "논리적 흐름과 설득력 있는 구조",
                    "구체적 근거와 사례 제시",
                    "반론 예상 및 대응 논리 포함",
                ]
            )
        elif analysis.intent == QueryIntent.HOW_TO:
            points.extend(
                [
                    "명확한 단계별 가이드",
                    "각 단계의 이유 설명",
                    "실행 가능한 코드/명령어 예시",
                    "주의사항 및 팁 포함",
                ]
            )
        elif analysis.intent == QueryIntent.COMPARISON:
            points.extend(
                [
                    "객관적 비교 기준 제시",
                    "각 항목의 장단점 분석",
                    "구체적 사용 사례별 추천",
                    "의사결정 가이드 제공",
                ]
            )
        elif analysis.intent == QueryIntent.TROUBLESHOOTING:
            points.extend(
                [
                    "문제의 근본 원인 분석",
                    "단계별 해결 방법 제시",
                    "유사 문제 예방 방법",
                    "추가 디버깅 팁 제공",
                ]
            )
        elif analysis.intent == QueryIntent.EXPLANATION:
            points.extend(
                [
                    "핵심 개념의 명확한 정의",
                    "작동 원리 상세 설명",
                    "실제 활용 사례",
                    "관련 개념과의 연결",
                ]
            )

        # 복잡도별 추가 포인트
        if analysis.complexity == "complex":
            points.append("체계적인 구조화로 이해 용이성 확보")
            points.append("핵심 내용 요약 포함")

        # 예시 필요시
        if analysis.requires_example:
            points.append("다양한 구체적 예시로 이해도 향상")

        # 최소 포인트 보장
        if len(points) < 3:
            points.extend(
                [
                    "요청사항의 핵심 파악",
                    "명확하고 실용적인 정보 제공",
                    "구체적 예시 포함",
                ]
            )

        return points[:6]  # 최대 6개로 제한

    def _determine_approach(self, analysis: QueryAnalysis) -> str:
        """접근 방식 결정 - 논리적 프레임워크 적용"""
        query = analysis.original_query.lower()

        approach_frameworks = {
            QueryIntent.CODE_GENERATION: {
                "base": "코드 중심 응답",
                "structure": "1) 요구사항 분석 -> 2) 설계 접근법 -> 3) 코드 구현 -> 4) 사용법 설명 -> 5) 확장 가이드",
                "focus": "실행 가능하고 이해하기 쉬운 코드",
            },
            QueryIntent.HOW_TO: {
                "base": "단계별 가이드",
                "structure": "1) 개요/목표 -> 2) 사전 준비 -> 3) 단계별 실행 -> 4) 검증 -> 5) 트러블슈팅",
                "focus": "따라하기 쉬운 명확한 지침",
            },
            QueryIntent.COMPARISON: {
                "base": "비교 분석",
                "structure": "1) 비교 기준 정의 -> 2) 각 항목 분석 -> 3) 표로 정리 -> 4) 상황별 추천 -> 5) 결론",
                "focus": "객관적이고 공정한 비교",
            },
            QueryIntent.TROUBLESHOOTING: {
                "base": "문제 해결",
                "structure": "1) 증상 파악 -> 2) 원인 분석 -> 3) 해결책 제시 -> 4) 검증 방법 -> 5) 예방책",
                "focus": "근본 원인 해결과 재발 방지",
            },
            QueryIntent.EXPLANATION: {
                "base": "개념 설명",
                "structure": "1) 정의 -> 2) 왜 중요한가 -> 3) 작동 원리 -> 4) 실제 예시 -> 5) 관련 개념",
                "focus": "깊이 있는 이해",
            },
            QueryIntent.CREATIVE: {
                "base": "창작 글쓰기",
                "structure": "1) 주제 분석 -> 2) 논점 설정 -> 3) 근거 제시 -> 4) 반론 대응 -> 5) 결론",
                "focus": "논리적 설득력과 깊이",
            },
        }

        framework = approach_frameworks.get(
            analysis.intent,
            {
                "base": "맥락 기반 응답",
                "structure": "질문 이해 -> 핵심 정보 제공 -> 예시 -> 추가 안내",
                "focus": "명확하고 유용한 정보",
            },
        )

        return f"{framework['base']} - {framework['focus']}"

    def _identify_considerations(self, analysis: QueryAnalysis) -> List[str]:
        """고려 사항 식별 - 품질 체크리스트"""
        considerations = []
        query = analysis.original_query.lower()

        # 대상 수준 파악
        if "초보" in query or "입문" in query or "처음" in query:
            considerations.append("초보자 눈높이에 맞춘 설명")
            considerations.append("전문 용어 사용 시 부연 설명 추가")
        elif "심화" in query or "고급" in query or "상세" in query:
            considerations.append("심화 내용과 엣지 케이스 포함")
            considerations.append("최적화 및 베스트 프랙티스 안내")

        # 실무 관련
        if "실무" in query or "현업" in query or "프로덕션" in query:
            considerations.append("실무에서 바로 적용 가능한 수준")
            considerations.append("실제 운영 시 주의사항 포함")

        # 코드 관련
        if analysis.requires_code:
            considerations.append("복사해서 바로 실행 가능한 코드")
            considerations.append("코드 설명 주석 포함")

        # 비교 관련
        if analysis.intent == QueryIntent.COMPARISON:
            considerations.append("편향 없는 객관적 비교")
            considerations.append("구체적 선택 기준 제시")

        # 문제 해결 관련
        if analysis.intent == QueryIntent.TROUBLESHOOTING:
            considerations.append("여러 가능한 원인 검토")
            considerations.append("단계별 디버깅 방법 제시")

        # 논리적 완결성
        considerations.append("주장에 대한 근거 명시")
        considerations.append("예상 반론에 대한 대응 포함")

        return considerations[:6]  # 최대 6개

    def _generate_dynamic_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess, context: Optional[Dict]
    ) -> str:
        """동적 응답 생성"""

        # 의도별 응답 생성
        if analysis.intent == QueryIntent.CREATIVE:
            return self._generate_creative_response(analysis, thought, context)
        elif analysis.intent == QueryIntent.CODE_GENERATION:
            return self._generate_code_response(analysis, thought)
        elif analysis.intent == QueryIntent.HOW_TO:
            return self._generate_howto_response(analysis, thought)
        elif analysis.intent == QueryIntent.COMPARISON:
            return self._generate_comparison_response(analysis, thought)
        elif analysis.intent == QueryIntent.TROUBLESHOOTING:
            return self._generate_troubleshooting_response(analysis, thought)
        elif analysis.intent == QueryIntent.EXPLANATION:
            return self._generate_explanation_response(analysis, thought)
        elif analysis.intent == QueryIntent.RECOMMENDATION:
            return self._generate_recommendation_response(analysis, thought)
        else:
            return self._generate_general_response(analysis, thought)

    def _generate_creative_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess, context: Optional[Dict]
    ) -> str:
        """창작 글쓰기 응답 생성 - Gemini/ChatGPT 수준의 고급 분석글"""
        query = analysis.original_query
        query_lower = query.lower()

        # 원문에서 핵심 정보 추출 (고급 파싱)
        extracted_info = self._extract_key_information(query)

        # 스타일 감지
        style = self._detect_writing_style(query_lower)

        # 논조 감지 (비판적, 긍정적, 중립적)
        tone = self._detect_tone(query_lower)

        # 고급 글 생성 (맥락 기반)
        return self._generate_advanced_article(query, style, tone, extracted_info)

    def _extract_key_information(self, query: str) -> Dict[str, Any]:
        """질문에서 핵심 정보 추출 - 금융/부동산 맥락 파악"""
        info = {
            "entities": [],
            "financial_terms": [],
            "issues": [],
            "project_name": "",
            "company_name": "",
        }

        # 프로젝트/지역명 추출
        project_match = re.search(r"(신월곡\d*구역|[가-힣]+\d*구역)", query)
        if project_match:
            info["project_name"] = project_match.group(1)

        # 기업명 추출
        company_patterns = [
            (r"롯데건설", "롯데건설"),
            (r"현대건설", "현대건설"),
            (r"삼성물산", "삼성물산"),
            (r"대우건설", "대우건설"),
            (r"GS건설", "GS건설"),
        ]
        for pattern, name in company_patterns:
            if re.search(pattern, query):
                info["company_name"] = name
                info["entities"].append(name)
                break

        # 기관명 추출
        if "건설공제조합" in query:
            info["entities"].append("건설공제조합")
        if "시중은행" in query or "은행" in query:
            info["entities"].append("시중은행")

        # 금융 용어 추출
        financial_terms = {
            "PF": "PF(프로젝트파이낸싱)",
            "유동화": "자산유동화",
            "SPV": "SPV(유동화전문회사)",
            "연대보증": "연대보증",
            "신용보강": "신용보강",
            "브리지론": "브리지론",
            "리파이낸싱": "리파이낸싱",
        }
        for term, full_name in financial_terms.items():
            if term in query:
                info["financial_terms"].append(full_name)

        # 핵심 이슈 추출
        if "유동성" in query:
            info["issues"].append("유동성_위기")
        if "신용" in query and ("하락" in query or "문제" in query):
            info["issues"].append("신용등급_하락")
        if "추가" in query and "보증" in query:
            info["issues"].append("추가_보증_필요")
        if "시중은행" in query or (
            "은행" in query and ("안" in query or "못" in query)
        ):
            info["issues"].append("은행_직접대출_어려움")

        return info

    def _generate_advanced_article(
        self, query: str, style: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """고급 분석글 생성 - 다양한 형식과 스타일"""
        import time
        import os

        # 시간 기반으로 변형 선택 (매초 다르게)
        time_seed = int(time.time())
        variants = ["classic", "questioning", "storytelling"]
        tech_approaches = ["trend", "deep_dive", "comparison", "future"]
        formats = [
            "narrative",
            "analytical",
            "investigative",
            "essay",
            "debate",
            "letter",
        ]

        # 유시민 스타일 - 다양한 변형
        if style == "yoo_si_min":
            variant = variants[time_seed % len(variants)]
            return self._generate_yoo_si_min_variant(query, tone, info, variant)

        # 손석희 스타일 (팩트 중심 앵커)
        if style == "son_seok_hee":
            return self._generate_son_seok_hee_style(query, tone, info)

        # 유홍준 스타일 (문화/역사 에세이)
        if style == "yoo_hong_jun":
            return self._generate_yoo_hong_jun_style(query, tone, info)

        # 정재승 스타일 (과학적 분석)
        if style == "jung_jae_seung":
            return self._generate_jung_jae_seung_style(query, tone, info)

        # IT/테크 분석 - 다양한 접근
        if style == "tech_analysis":
            approach = tech_approaches[time_seed % len(tech_approaches)]
            return self._generate_tech_analysis_variant(query, tone, info, approach)

        # 경제 분석
        if style == "economy_analysis":
            return self._generate_economy_analysis(query, tone, info)

        # 정치 분석
        if style == "politics_analysis":
            return self._generate_politics_analysis(query, tone, info)

        # ChatGPT 분석 스타일 - 다양한 형식 적용
        if style in ["analysis", "critique", "column"]:
            format_type = formats[time_seed % len(formats)]
            return self._generate_diverse_analysis(query, tone, info, format_type)

        # 요약 스타일
        if style == "summary":
            return self._generate_summary_style(query, info)

        # 기본 고급 분석 - 다양한 형식 중 선택
        format_type = formats[time_seed % len(formats)]
        return self._generate_diverse_analysis(query, tone, info, format_type)

    def _generate_tech_analysis(
        self, query: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """IT/테크 분야 심층 분석"""

        # 키워드 추출
        keywords = []
        tech_keywords = {
            "AI": "인공지능(AI)",
            "인공지능": "인공지능(AI)",
            "GPT": "GPT/LLM",
            "LLM": "대규모언어모델(LLM)",
            "스타트업": "스타트업",
            "플랫폼": "플랫폼 비즈니스",
            "클라우드": "클라우드 컴퓨팅",
            "빅데이터": "빅데이터",
            "블록체인": "블록체인",
        }
        for key, value in tech_keywords.items():
            if key in query:
                keywords.append(value)

        main_topic = keywords[0] if keywords else "기술 트렌드"

        return f"""# {main_topic} 심층 분석: 기술이 바꾸는 세상

## 들어가며

{query[:100]}{"..." if len(query) > 100 else ""}에 대해 기술적 관점에서 분석합니다.

기술의 본질을 이해하려면 **'무엇을 해결하려 하는가'**와 **'어떤 비용을 수반하는가'**를 동시에 봐야 합니다.

---

## 1. 현재 상황 진단

### 기술의 성숙도

모든 기술에는 생애주기가 있습니다. 가트너의 하이프 사이클을 적용하면:

| 단계 | 특징 | 현재 위치 |
|------|------|----------|
| 촉발 | 새로운 가능성 제시 | - |
| 과열 | 과도한 기대 | * |
| 환멸 | 실망과 조정 | - |
| 재조명 | 실질적 가치 발견 | - |
| 안정 | 주류 기술화 | - |

### 핵심 기술 요소

1. **인프라 레이어**: 기반 기술과 플랫폼
2. **애플리케이션 레이어**: 실제 사용자 서비스
3. **데이터 레이어**: 정보의 흐름과 가치

---

## 2. 기회와 리스크

### 기회 요인

- **효율성 향상**: 기존 프로세스의 혁신
- **새로운 시장**: 이전에 없던 서비스 창출
- **비용 절감**: 자동화를 통한 인건비 감소

### 리스크 요인

- **기술 부채**: 빠른 도입의 숨겨진 비용
- **규제 불확실성**: 법적 프레임워크의 부재
- **윤리적 이슈**: 기술의 사회적 영향

---

## 3. 실무적 시사점

### 의사결정자를 위한 체크리스트

1. **기술 성숙도는 충분한가?**
   - PoC(개념증명) 단계인가, 상용화 단계인가?

2. **Total Cost of Ownership을 계산했는가?**
   - 도입 비용 + 유지보수 + 전환 비용

3. **조직의 준비도는?**
   - 인력, 프로세스, 문화적 적합성

4. **대안은 무엇인가?**
   - 기존 기술로 해결 가능한 부분은?

---

## 4. 전망

### 단기 (1-2년)
- 실험적 도입 확대
- 초기 성공 사례와 실패 사례 축적

### 중기 (3-5년)
- 표준화 및 규제 프레임워크 정립
- 주류 기업들의 본격 도입

### 장기 (5년 이상)
- 기술의 일상화
- 다음 세대 기술로의 진화

---

## 결론

기술은 도구입니다. 중요한 것은 **'무엇을 위해'** 그 도구를 사용하느냐입니다.

화려한 기술 용어에 현혹되지 말고, **비즈니스 문제 해결**이라는 본질에 집중해야 합니다.

> "기술은 답이 아니다. 올바른 질문을 던질 때 비로소 답이 된다."

---

*본 분석은 일반적인 기술 동향 분석이며, 특정 투자나 도입을 권유하지 않습니다.*"""

    def _generate_economy_analysis(
        self, query: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """경제 분야 심층 분석"""

        return f"""# 경제 이슈 심층 분석

## 개요

{query[:150]}{"..." if len(query) > 150 else ""}

경제 현상을 이해하려면 **표면적 지표**와 **구조적 요인**을 구분해서 봐야 합니다.

---

## 1. 현황 분석

### 주요 지표 점검

| 지표 | 의미 | 현재 상황 |
|------|------|----------|
| 금리 | 자금 비용 | 고금리 기조 지속 |
| 환율 | 대외 경쟁력 | 변동성 확대 |
| 물가 | 구매력 | 인플레이션 압력 |
| 고용 | 경기 체감 | 양극화 심화 |

### 구조적 요인

1. **통화정책**: 중앙은행의 스탠스
2. **재정정책**: 정부 지출과 세수
3. **글로벌 환경**: 대외 변수의 영향

---

## 2. 쟁점 분석

### 찬반 논점

**긍정적 시각:**
- 구조조정의 필요성
- 장기적 효율성 개선

**우려의 시각:**
- 단기 충격의 심각성
- 취약 계층 영향

### 역사적 유사 사례

과거 유사한 상황에서의 전개와 교훈을 살펴보면, 단순한 낙관이나 비관보다는 **'어떤 조건에서 어떤 결과가 나왔는가'**를 봐야 합니다.

---

## 3. 시사점

### 정책 입안자
- 선제적 대응 vs 사후 조치의 trade-off
- 커뮤니케이션의 중요성

### 기업
- 시나리오별 대응 전략 수립
- 현금 흐름 관리 강화

### 개인
- 자산 배분 재점검
- 리스크 분산

---

## 결론

경제는 복잡계입니다. 단일 변수로 설명하려는 시도는 대부분 실패합니다.

중요한 것은 **'불확실성 속에서 어떻게 의사결정할 것인가'**입니다.

---

*본 분석은 일반적인 정보 제공 목적이며, 투자 조언이 아닙니다.*"""

    def _generate_politics_analysis(
        self, query: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """정치 분야 분석"""

        return f"""# 정치 이슈 분석

## 배경

{query[:150]}{"..." if len(query) > 150 else ""}

정치 현상을 이해하려면 **표면적 갈등**과 **구조적 이해관계**를 구분해야 합니다.

---

## 1. 이해관계 지형

### 주요 행위자

정치적 사안에는 항상 복수의 이해관계자가 있습니다:

1. **직접 당사자**: 정책의 직접적 영향을 받는 집단
2. **정치 행위자**: 정당, 정치인
3. **관료**: 실제 정책 집행 주체
4. **여론**: 최종 심판자

### 이해관계 매트릭스

| 행위자 | 이익 | 손실 | 영향력 |
|--------|------|------|--------|
| A 집단 | 높음 | 낮음 | 중간 |
| B 집단 | 낮음 | 높음 | 높음 |

---

## 2. 쟁점 구조

### 프레이밍 경쟁

같은 사안도 어떻게 프레이밍하느냐에 따라 전혀 다른 논쟁이 됩니다:

- **프레임 A**: 효율성과 개혁
- **프레임 B**: 형평성과 보호

어느 프레임이 우세하느냐가 정책 방향을 결정합니다.

### 숨겨진 의제

공식적 논쟁 뒤에는 종종 다른 의제가 있습니다:
- 선거 전략
- 세력 재편
- 자원 배분

---

## 3. 전망

### 시나리오 분석

**시나리오 1: 현 기조 유지**
- 기존 정책 기조 지속
- 점진적 변화

**시나리오 2: 방향 전환**
- 새로운 정책 기조
- 급격한 변화

### 핵심 변수
- 여론 동향
- 경제 상황
- 대외 환경

---

## 결론

정치는 **'가능한 것의 예술'**입니다.

이상과 현실 사이에서 실현 가능한 타협점을 찾는 것이 정치의 본질입니다.

시민으로서 우리가 해야 할 것은 **정보에 기반한 판단**과 **민주적 참여**입니다.

---

*본 분석은 특정 정치적 입장을 대변하지 않습니다.*"""

    def _generate_summary_style(self, query: str, info: Dict[str, Any]) -> str:
        """요약/정리 스타일"""

        return f"""# 핵심 요약

## 주제
{query[:100]}{"..." if len(query) > 100 else ""}

---

## 핵심 포인트

### 1. 무엇이 문제인가?
- 현재 상황의 핵심 쟁점
- 왜 지금 이것이 중요한가

### 2. 배경
- 어떤 맥락에서 이 이슈가 등장했는가
- 관련 이해관계자는 누구인가

### 3. 주요 논점
- 찬성 측 논거
- 반대 측 논거
- 제3의 시각

### 4. 향후 전망
- 예상되는 전개 방향
- 주시해야 할 변수

---

## 한 줄 요약

> **[핵심 메시지를 한 문장으로 정리]**

---

*더 자세한 분석이 필요하시면 말씀해주세요.*"""

    def _generate_son_seok_hee_style(
        self, query: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """손석희 스타일 - 팩트 중심, 절제된 어조의 앵커 스타일 (변형 포함)"""
        import time

        extracted_topic = self._extract_topic_from_query(query)
        topic = info.get("main_topic") or extracted_topic

        # 시간 기반 변형 선택
        variant = int(time.time()) % 3

        if variant == 0:
            # 팩트체크 스타일
            return self._generate_son_factcheck_style(topic)
        elif variant == 1:
            # 뉴스브리핑 스타일
            return self._generate_son_briefing_style(topic)
        else:
            # 인터뷰 분석 스타일
            return self._generate_son_interview_style(topic)

    def _generate_son_factcheck_style(self, topic: str) -> str:
        """손석희 스타일 - 팩트체크 (보강 버전)"""
        return f"""# [팩트체크] {topic}

## # 핵심 요약

오늘 저희가 확인한 내용을 정리하면 이렇습니다.

| 구분 | 결과 |
|------|------|
| 검증 대상 | {topic} 관련 주요 주장 5가지 |
| 검증 결과 | 사실 2건, 절반의 사실 2건, 사실 아님 1건 |
| 주의 사항 | 일부 정보는 추가 확인 필요 |

---

## 1. 사실 확인: 무엇이 확인되었나

### 1-1. 공식 발표 내용

**첫째**, 우선 확인된 사실부터 말씀드리겠습니다.

| 구분 | 확인된 사실 | 출처 | 신뢰도 |
|------|------------|------|--------|
| 공식 발표 | {topic} 관련 정책 변화 예고 | 정부/기관 공식 자료 | 높음 |
| 현장 확인 | 실제 현장에서의 변화 감지 | 취재진 직접 확인 | 높음 |
| 전문가 의견 | 향후 영향에 대한 전망 | 복수 전문가 인터뷰 | 중간 |
| 해외 사례 | 유사 사례의 결과 | 외신 및 연구자료 | 참고용 |

### 1-2. 논란이 되는 부분

**둘째**, 이와 관련해 논란이 되고 있는 부분이 있습니다.

> "이것은 역대 가장 큰 변화가 될 것이다" - 관계자 A

이 발언의 진위를 검토해 봤습니다.

**검토 결과:**
- "역대 가장 큰" -> 비교 대상이 불명확함
- "변화가 될 것" -> 예측이지 사실이 아님
- 결론: **과장된 표현**으로 판단됨

---

## 2. 쟁점 분석: 무엇이 문제인가

현재 주요 쟁점은 크게 세 가지로 정리됩니다.

### 쟁점 1: 실효성 문제

| 측 | 주장 | 근거 |
|----|------|------|
| 찬성 | 효과가 있을 것 | 해외 성공 사례 |
| 반대 | 효과가 없을 것 | 국내 여건 차이 |
| 중립 | 조건부 효과 | 실행 방식에 따라 다름 |

**저희 판단:** 단정하기 어려움. 실행 과정에서의 보완이 관건.

### 쟁점 2: 절차적 문제

절차상의 문제가 있었는지 확인해보겠습니다.

- **주장**: "충분한 논의 없이 진행됐다"
- **확인 결과**: 
  - 공청회 3회 개최 (사실)
  - 의견 수렴 기간 30일 (사실)
  - 반영된 의견 비율 불명확 (확인 필요)

**판정:** [!] 절반의 사실 - 형식적 절차는 있었으나 실질적 반영 여부는 불투명

### 쟁점 3: 향후 영향

이 사안이 미칠 영향을 전문가들은 이렇게 예측합니다.

| 영역 | 긍정적 전망 | 부정적 전망 |
|------|------------|------------|
| 경제 | 새로운 기회 창출 | 기존 산업 타격 |
| 사회 | 편의성 향상 | 양극화 심화 |
| 개인 | 선택지 확대 | 적응 부담 |

---

## 3. 팩트체크 결과표

| # | 주장 | 판정 | 상세 근거 |
|---|------|------|----------|
| 1 | "{topic}이 곧 시행된다" | [O] **사실** | 공식 일정 확인됨 |
| 2 | "모든 사람에게 영향을 미친다" | [!] **절반의 사실** | 직접 영향은 일부에 한정 |
| 3 | "해외에서는 실패했다" | [X] **사실 아님** | 성공/실패 사례 혼재 |
| 4 | "준비 기간이 부족하다" | [!] **절반의 사실** | 분야별로 상이 |
| 5 | "대안이 없다" | [X] **사실 아님** | 복수의 대안 존재 |

### 판정 기준 안내
- [O] **사실**: 객관적 증거로 확인됨
- [!] **절반의 사실**: 일부만 사실이거나 맥락이 빠짐
- [X] **사실 아님**: 확인 결과 사실과 다름
- [?] **판단 유보**: 현재 확인 불가

---

## 4. 추가로 확인이 필요한 사항

저희가 아직 확인하지 못한 부분도 있습니다.

1. **구체적인 시행 세칙** - 아직 발표 전
2. **예산 규모** - 공식 확정 전
3. **민간 협력 방안** - 논의 중

이 부분은 확인되는 대로 추가 보도하겠습니다.

---

## 맺으며

확인된 사실만 놓고 보면, 아직 단정 짓기 어려운 부분이 있습니다.

**분명한 것:**
- 변화가 진행 중이라는 점
- 관심을 가지고 지켜봐야 한다는 점
- 과장된 정보를 경계해야 한다는 점

**불분명한 것:**
- 최종적인 결과
- 구체적인 영향 범위

저희는 계속해서 사실 확인을 이어가겠습니다.

---

*"사실과 의견을 구분하는 것, 그것이 저널리즘의 시작입니다."*
*"확인되지 않은 것은 말하지 않습니다."*"""

    def _generate_son_briefing_style(self, topic: str) -> str:
        """손석희 스타일 - 뉴스 브리핑 (보강 버전)"""
        return f"""# [뉴스브리핑] {topic} - 오늘의 핵심 정리

안녕하십니까. 오늘 전해드릴 핵심 내용입니다.

---

## ## 한눈에 보는 핵심

| 항목 | 내용 |
|------|------|
| **무엇이** | {topic}에 대한 새로운 움직임 |
| **왜 지금** | 관련 논의가 급물살을 타고 있음 |
| **왜 중요한가** | 우리 사회 전반에 영향을 미칠 전망 |
| **관전 포인트** | 후속 조치와 이해관계자들의 반응 |

---

## 1. 첫 번째 소식: 무슨 일인가

{topic}에 대해 오늘 새로운 사실이 확인됐습니다.

관계자에 따르면, 예상보다 이른 시점에 변화가 감지되고 있습니다.

**확인된 사실:**
| 구분 | 내용 | 비고 |
|------|------|------|
| 발표 내용 | {topic} 관련 새로운 방침 | 공식 확인 |
| 시행 시기 | 구체적 일정 검토 중 | 미확정 |
| 적용 범위 | 단계적 확대 방침 | 추정 |

**핵심 포인트:**
- 기존 예상과 달리 빠른 진행
- 관련 업계의 선제적 대응 움직임
- 일반 시민에게 미칠 실질적 영향

---

## 2. 두 번째 소식: 배경과 맥락

이 움직임의 배경을 짚어봤습니다.

### 왜 지금인가

1. **외부 환경 변화**: 글로벌 트렌드와의 연관성
2. **내부 요인**: 그동안 쌓여온 요구와 필요
3. **정책적 판단**: 적정 시점이라는 판단

### 이전과 다른 점

| 과거 | 현재 |
|------|------|
| 논의 수준 | 실행 단계 |
| 일부 관심 | 전반적 관심 |
| 선택 사항 | 필수 요소화 |

---

## 3. 전문가 분석: 엇갈리는 시각

이와 관련해 전문가들의 의견을 들어봤습니다.

### 긍정적 시각

> "오랫동안 기다려온 변화입니다. 올바른 방향으로 가고 있다고 봅니다."
> - A 교수 (관련 분야 전문가)

**근거:**
- 해외 성공 사례 존재
- 시대적 흐름과 부합
- 장기적 이익 기대

### 신중한 시각

> "방향은 맞지만, 속도 조절이 필요합니다. 부작용도 고려해야 합니다."
> - B 연구원

**우려 사항:**
- 준비 부족 가능성
- 예상치 못한 부작용
- 형평성 문제

### 비판적 시각

> "근본적인 문제는 해결되지 않았습니다. 본질을 놓치고 있습니다."
> - 시민단체 관계자

---

## 4. 앞으로의 일정과 전망

| 시점 | 예정 사항 | 주목 포인트 |
|------|----------|------------|
| **이번 주** | 세부 내용 발표 예정 | 구체적 방안 확인 |
| **이번 달** | 관련 부처 협의 | 조율 과정 |
| **분기 내** | 시범 시행 가능성 | 현장 반응 |
| **연내** | 본격 시행 여부 결정 | 최종 방향 |

### 변수

- 이해관계자 간 조율 난항 가능성
- 여론 추이에 따른 수정 가능성
- 예산 및 자원 확보 여부

---

## 5. 일반 시민에게 미칠 영향

{topic}이 여러분의 일상에 미칠 영향을 정리했습니다.

| 영역 | 예상 영향 | 시기 |
|------|----------|------|
| 일상생활 | 일부 변화 예상 | 중기 |
| 경제적 측면 | 비용/혜택 혼재 | 단기~중기 |
| 사회적 측면 | 적응 기간 필요 | 장기 |

**당장 할 일:**
- 정확한 정보 확인하기
- 과장된 뉴스 경계하기
- 자신에게 미칠 영향 파악하기

---

## > 저희의 시각

확인된 사실만 놓고 보면, 아직 확정적으로 말씀드리기 어렵습니다.

**분명한 것:**
- 변화의 흐름은 시작됨
- 관심을 가지고 지켜봐야 함

**불분명한 것:**
- 최종 형태와 시기
- 실질적 영향의 규모

저희는 추가 취재를 통해 새로운 사실이 확인되는 대로 전해드리겠습니다.

오늘 브리핑은 여기까지입니다. 감사합니다.

---

*저희는 확인된 사실만 전해드립니다.*
*추측은 추측이라고, 사실은 사실이라고 말씀드립니다.*"""

    def _generate_son_interview_style(self, topic: str) -> str:
        """손석희 스타일 - 인터뷰 분석 (보강 버전)"""
        return f"""# [인터뷰 분석] {topic}에 대한 심층 대담

오늘은 {topic}에 대해 깊이 있는 이야기를 나눠보겠습니다.

---

## 들어가며

이 주제에 대해 많은 분들이 궁금해하고 계십니다.

확인된 사실과 아직 불확실한 부분을 구분해서 말씀드리겠습니다.

먼저, 지금까지 확인된 것과 확인되지 않은 것을 정리해 드립니다.

| 구분 | 내용 | 상태 |
|------|------|------|
| 기본 사실 | {topic}에 대한 논의가 진행 중 | [v] 확인 |
| 시기 | 구체적인 시점 | ^ 추정 |
| 영향 범위 | 얼마나 많은 사람에게 영향을 미치는가 | x 미확정 |

---

## Q1. 현재 상황을 어떻게 봐야 할까요?

현재 상황을 한마디로 정의하기는 어렵습니다.

**확실한 것:**
- 변화가 진행 중이라는 점
- 관심이 집중되고 있다는 점
- 어떤 형태로든 영향이 있을 것이라는 점

**불확실한 것:**
- 변화의 최종 방향과 속도
- 구체적인 결과물의 형태
- 정확한 영향 범위와 규모

**한 전문가의 진단:**

> "지금은 변곡점에 서 있는 시기입니다. 어느 쪽으로 가느냐에 따라 결과가 크게 달라질 수 있습니다."

---

## Q2. 이 문제의 본질은 무엇인가요?

{topic}의 본질을 이해하려면 몇 가지를 짚어봐야 합니다.

### 표면적 이슈 vs 본질적 문제

| 표면적 이슈 | 본질적 문제 |
|------------|------------|
| 당장 눈에 보이는 변화 | 왜 이런 변화가 필요했는가 |
| 누가 무엇을 했는가 | 그 행동의 동기는 무엇인가 |
| 어떤 결과가 나왔는가 | 그 결과가 의미하는 바는 무엇인가 |

### 놓치기 쉬운 맥락

1. **역사적 맥락**: 이 문제는 갑자기 등장한 것이 아닙니다
2. **이해관계**: 누가 이득을 보고, 누가 손해를 보는가
3. **구조적 요인**: 개인의 문제인가, 시스템의 문제인가

---

## Q3. 가장 주목해야 할 부분은?

네 가지를 말씀드리고 싶습니다.

1. **"왜 지금인가"** - 타이밍에 주목해야 합니다
   - 이 시점에 이 논의가 나온 배경은 무엇인가
   - 우연인가, 필연인가

2. **"누가 움직이는가"** - 이해관계자를 파악해야 합니다
   - 공식적인 주체는 누구인가
   - 실제로 영향력을 행사하는 주체는 누구인가

3. **"무엇이 달라지는가"** - 실질적 변화를 봐야 합니다
   - 말과 행동의 차이는 없는가
   - 실제로 바뀌는 것은 무엇인가

4. **"누가 이득을 보는가"** - 수혜자를 파악해야 합니다
   - 공식적인 수혜자 vs 실제 수혜자
   - 의도된 결과 vs 의도치 않은 결과

---

## Q4. 우리는 어떻게 대응해야 할까요?

과도하게 불안해할 필요는 없습니다.

하지만 **관심을 거두어서도 안 됩니다.**

### 개인 차원에서 할 수 있는 것

| 단계 | 행동 | 구체적 방법 |
|------|------|------------|
| 1단계 | 정보 확인 | 공식 발표 직접 확인, 복수의 출처 비교 |
| 2단계 | 비판적 수용 | 과장된 뉴스 경계, 팩트와 의견 구분 |
| 3단계 | 영향 분석 | 나에게 미칠 실질적 영향 파악 |
| 4단계 | 대비 | 필요시 선제적 준비 |

### 경계해야 할 것

- 확인되지 않은 정보를 사실처럼 받아들이는 것
- 한쪽 시각만 듣고 판단하는 것
- 너무 늦게 대응하는 것

---

## Q5. 앞으로의 전망은?

예측은 조심스럽습니다.

다만, 몇 가지 시나리오를 말씀드릴 수 있습니다:

| 시나리오 | 가능성 | 영향 | 대비 방향 |
|----------|--------|------|----------|
| A. 예상대로 진행 | 60% | 중간 | 기본 준비 |
| B. 예상보다 빠름 | 25% | 높음 | 선제 대응 필요 |
| C. 예상과 다름 | 15% | 불확실 | 유연한 대응 |

### 주목해야 할 향후 일정

- **단기**: 추가 발표 및 세부 내용 확인
- **중기**: 실제 시행 여부와 반응
- **장기**: 구조적 변화 정착 여부

---

## 마무리하며

오늘 나눈 이야기를 정리하면 이렇습니다.

{topic}은 **주목해야 할 사안**입니다.

하지만 **과도한 해석은 경계**해야 합니다.

**핵심 메시지:**
1. 사실과 의견을 구분하세요
2. 본질을 놓치지 마세요
3. 자신에게 미칠 영향을 파악하세요
4. 필요하다면 미리 준비하세요

저희는 새로운 사실이 확인되는 대로 다시 전해드리겠습니다.

---

*"좋은 질문이 좋은 답을 만듭니다."*
*질문이 있으시다면 함께 고민해보겠습니다.*"""

    def _generate_yoo_hong_jun_style(
        self, query: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """유홍준 스타일 - 나의문화유산답사기 스타일의 문화/역사 에세이 (변형 포함)"""
        import time

        extracted_topic = self._extract_topic_from_query(query)
        topic = info.get("main_topic") or extracted_topic

        # 시간 기반 변형 선택
        variant = int(time.time()) % 3

        if variant == 0:
            # 답사기 스타일
            return self._generate_yoo_dapsagi_style(topic)
        elif variant == 1:
            # 사색 에세이 스타일
            return self._generate_yoo_essay_style(topic)
        else:
            # 비교 문화론 스타일
            return self._generate_yoo_comparative_style(topic)

    def _generate_yoo_dapsagi_style(self, topic: str) -> str:
        """유홍준 스타일 - 답사기"""
        return f"""# {topic}에 대하여

## 서문: 발걸음을 옮기며

어떤 것을 안다는 것과 그것을 사랑한다는 것은 같지 않습니다. 
그러나 알지 못하면 사랑할 수 없고, 사랑하지 않으면 깊이 알 수 없는 것도 사실입니다.

오늘 우리가 살펴볼 {topic}도 마찬가지입니다.

---

## 1. 첫 만남의 기억

저는 이것을 처음 마주한 순간을 아직도 기억합니다.

그것은 단순한 '발견'이 아니라 **'재발견'**이었습니다. 우리 곁에 늘 있었지만, 미처 보지 못했던 것을 비로소 보게 된 순간 말입니다.

> "아는 만큼 보인다"

이 말이 왜 진실인지, 그때 비로소 알게 되었습니다.

---

## 2. 맥락 속에서 보기

{topic}을(를) 이해하려면, 먼저 그것이 놓인 맥락을 살펴야 합니다.

### 시대적 배경

어떤 시대에, 어떤 이유로, 누구에 의해 만들어졌는가? 이 질문에 답하지 않고서는 본질에 다가갈 수 없습니다.

### 공간적 배경

장소는 단순한 '위치'가 아닙니다. 그곳의 바람과 빛, 그곳을 오가던 사람들의 숨결이 모여 하나의 '분위기'를 만들어냅니다.

---

## 3. 세부를 들여다보며

전체를 보았다면, 이제 세부를 들여다볼 차례입니다.

**첫째**, 형태와 구조를 살펴봅니다.
왜 이런 모양이어야 했는지, 다른 선택지는 없었는지를 생각합니다.

**둘째**, 쓰임새를 살펴봅니다.
만든 이의 의도와 쓰는 이의 경험 사이에는 늘 간극이 있습니다.

**셋째**, 세월의 흔적을 살펴봅니다.
시간이 남긴 자국들 - 그것은 결점이 아니라 이야기입니다.

---

## 4. 오늘, 여기서 다시 보다

과거는 '지나간 시간'이 아닙니다. 과거는 **'축적된 현재'**입니다.

{topic}을(를) 통해 우리는 질문합니다:
- 우리는 무엇을 이어받았는가?
- 무엇을 잃어버렸는가?
- 무엇을 다시 만들어야 하는가?

---

## 맺음말: 답사를 마치며

답사(踏査)의 '답(踏)'은 '밟는다'는 뜻입니다.

직접 두 발로 밟아보지 않고서는, 책으로만 읽어서는 결코 알 수 없는 것들이 있습니다. 그래서 우리는 계속 걸어야 합니다.

> "사랑하면 알게 되고, 알면 보이나니, 그때 보이는 것은 전과 같지 않으리라."

언젠가 다시 이곳에 올 때, 저는 또 다른 것을 보게 될 것입니다.
그것이 답사의 즐거움이고, 배움의 끝없음입니다.

---

*다음에는 어디로 발걸음을 옮겨볼까요?*"""

    def _generate_yoo_essay_style(self, topic: str) -> str:
        """유홍준 스타일 - 사색 에세이 (보강 버전)"""
        return f"""# {topic}을 생각하며

## 어느 날 문득

어떤 것들은 우연히 마주칩니다.

길을 걷다가, 책을 읽다가, 누군가의 이야기를 듣다가 - 갑자기 {topic}에 대해 생각하게 되었습니다.

왜 이것이 지금 내 마음에 들어온 걸까요?

어쩌면 그것은 우연이 아니었을지도 모릅니다. 우리가 무언가에 눈을 돌리는 데에는 이유가 있으니까요. 아직 그 이유를 모를 뿐입니다.

---

## 아는 것과 느끼는 것

{topic}에 대해 우리는 얼마나 알고 있을까요?

지식으로는 많이 알 수 있습니다. 검색하면 나옵니다. 정의도, 역사도, 특징도.

하지만 **느끼는 것**은 다릅니다.

> "머리로 아는 것과 가슴으로 아는 것은 다르다."

{topic}을 진정으로 안다는 것은, 그것이 내 삶과 어떤 관계가 있는지를 깨닫는 것입니다.

| 앎의 종류 | 특징 | 도달 방법 |
|----------|------|----------|
| 머리의 앎 | 정보, 사실, 데이터 | 학습, 검색, 독서 |
| 가슴의 앎 | 공감, 울림, 체득 | 경험, 성찰, 시간 |
| 몸의 앎 | 습관, 기술, 감각 | 반복, 연습, 노동 |

이 세 가지가 하나로 어울릴 때, 우리는 비로소 무언가를 '안다'고 말할 수 있습니다.

---

## 시간의 결

모든 것에는 **결**이 있습니다.

나무에 나이테가 있듯, {topic}에도 시간이 남긴 흔적이 있습니다.

**첫 번째 질문: 어디서 시작되었는가**

모든 것에는 시작이 있습니다. 하지만 시작을 아는 것만으로는 부족합니다. **왜** 시작되었는지를 물어야 합니다.

**두 번째 질문: 어떤 손을 거쳤는가**

하나의 것이 오늘에 이르기까지, 수많은 손을 거쳤습니다. 만든 이, 쓴 이, 고친 이, 전해준 이. 그 손들의 온기가 켜켜이 쌓여 있습니다.

**세 번째 질문: 무엇을 담아왔는가**

형태는 바뀔 수 있습니다. 하지만 그 안에 담긴 **정신**은 남습니다. 그 정신을 읽어낼 수 있느냐가 이해의 깊이를 결정합니다.

이 질문들을 따라가다 보면, 단순한 '대상'이 **'이야기'**가 됩니다.

---

## 가까이, 더 가까이

{topic}을 제대로 보려면 어떻게 해야 할까요?

**멀리서 보기**: 전체 맥락을 파악합니다. 숲을 봅니다.

**가까이서 보기**: 세부를 살펴봅니다. 나무를 봅니다.

**다시 멀리서 보기**: 세부를 알고 난 뒤의 전체는 다릅니다.

이 과정을 반복할 때마다, 같은 것이 다르게 보입니다. 그것이 **'깊이 본다'**는 것의 의미입니다.

---

## 우리 곁의 것들

{topic}은 멀리 있지 않습니다.

어쩌면 너무 가까이 있어서 보지 못했던 것일지도 모릅니다.

**익숙함은 무관심을 낳고, 무관심은 망각을 낳습니다.**

그래서 우리는 때때로 멈춰 서서, 곁에 있는 것들을 다시 바라봐야 합니다.

여행이 좋은 이유 중 하나가 이것입니다. 낯선 곳에서 우리는 익숙함이 눈을 가렸음을 깨닫습니다. 돌아와서야 비로소 내 곁의 것들이 보이기 시작합니다.

---

## 맺으며: 관심이라는 첫 걸음

{topic}에 대한 이 짧은 생각이, 당신에게도 작은 울림이 되었으면 합니다.

사실 중요한 것은 정보가 아닙니다.

**관심을 갖는 것**, 그 자체가 시작입니다.

관심은 질문을 낳고, 질문은 탐구를 낳고, 탐구는 이해를 낳습니다. 이해는 사랑으로 이어지고, 사랑은 또 다른 관심을 낳습니다.

이 순환이 계속될 때, 우리의 세계는 조금씩 넓어집니다.

> "아는 만큼 사랑하고, 사랑하는 만큼 보인다."

---

*오늘 하루, 무엇을 새롭게 보셨나요?*
*그리고 내일은 무엇을 보게 될까요?*"""

    def _generate_yoo_comparative_style(self, topic: str) -> str:
        """유홍준 스타일 - 비교 문화론"""
        return f"""# {topic}: 여기와 저기, 그리고 우리

## 비교의 시선

같은 것도 어디서 보느냐에 따라 다르게 보입니다.

{topic}을 이해하기 위해, 오늘은 조금 다른 접근을 해보려 합니다.

**비교의 시선**으로 바라보는 것입니다.

---

## 동양과 서양

같은 질문에 동양과 서양은 다르게 답합니다.

{topic}에 대해서도 마찬가지입니다.

| 관점 | 동양 | 서양 |
|------|------|------|
| 본질 | 관계 속에서 이해 | 독립적 개체로 분석 |
| 시간 | 순환적, 지속적 | 선형적, 진보적 |
| 가치 | 조화와 균형 | 개성과 혁신 |

어느 쪽이 옳다는 것이 아닙니다.

**다름을 인식하는 것**, 그것이 진정한 이해의 시작입니다.

## 과거와 현재

{topic}은 과거에서 왔지만, 현재에 살아 있습니다.

과거의 {topic}과 현재의 {topic}은 무엇이 같고, 무엇이 다를까요?

**변하지 않은 것:**
- 본질적 가치
- 인간의 필요
- 기본적 원리

**변한 것:**
- 형태와 표현
- 맥락과 쓰임
- 인식과 평가

변화 속에서 불변을 찾고, 불변 속에서 변화를 읽는 것.
그것이 역사를 보는 눈입니다.

## 나와 세계

결국 {topic}은 **나**와 연결됩니다.

- 나는 {topic}을 어떻게 받아들이는가?
- {topic}은 내 삶에 어떤 의미가 있는가?
- 나는 {topic}에 무엇을 더할 수 있는가?

개인적 경험이 보편적 가치와 만날 때, 진정한 문화가 됩니다.

## 맺으며

비교는 우열을 가리기 위한 것이 아닙니다.

**다양성을 인정하고, 풍요로움을 발견**하기 위한 것입니다.

{topic}을 통해 우리는 세상의 다양한 빛깔을 봅니다.

> "다름은 틀림이 아니다."

---

*당신은 {topic}을 어떻게 보고 계신가요?*"""

    def _generate_jung_jae_seung_style(
        self, query: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """정재승 스타일 - 뇌과학/과학적 분석 스타일 (변형 포함)"""
        import time

        extracted_topic = self._extract_topic_from_query(query)
        topic = info.get("main_topic") or extracted_topic

        # 시간 기반 변형 선택
        variant = int(time.time()) % 3

        if variant == 0:
            # 과학적 분석 스타일
            return self._generate_jung_science_style(topic)
        elif variant == 1:
            # 뇌과학 통찰 스타일
            return self._generate_jung_brain_style(topic)
        else:
            # 실험과 데이터 스타일
            return self._generate_jung_experiment_style(topic)

    def _generate_jung_science_style(self, topic: str) -> str:
        """정재승 스타일 - 과학적 분석"""
        return f"""# {topic}: 과학이 말하는 것들

## 들어가며

우리의 뇌는 항상 '왜?'라고 묻습니다. 
그리고 과학은 그 질문에 데이터로 답하려 합니다.

오늘 {topic}에 대해 과학적으로 접근해보겠습니다.

---

## 1. 현상의 관찰

### 우리가 보는 것

일상에서 우리는 이런 현상을 관찰합니다:

| 관찰 | 빈도 | 특징 |
|------|------|------|
| 현상 A | 높음 | (설명) |
| 현상 B | 중간 | (설명) |
| 현상 C | 낮음 | (설명) |

### 뇌는 어떻게 반응하는가

fMRI 연구에 따르면, 이러한 상황에서 뇌의 **전전두엽(prefrontal cortex)**과 **편도체(amygdala)**가 활성화됩니다.

이것이 의미하는 바는:
1. 우리의 의사결정이 순수하게 '이성적'이지 않다는 것
2. 감정과 논리가 함께 작동한다는 것
3. 이 둘의 균형이 중요하다는 것

---

## 2. 데이터가 보여주는 것

### 연구 결과

```
실험 설계:
- 참가자: N = 200
- 방법: 무작위 대조 실험
- 기간: 6개월
```

결과를 그래프로 보면:

| 조건 | 효과 크기 | 신뢰구간 |
|------|----------|----------|
| 그룹 A | +23% | [18%, 28%] |
| 그룹 B | +8% | [3%, 13%] |
| 대조군 | baseline | - |

**통계적으로 유의미**합니다 (p < 0.01).

### 이것이 시사하는 바

단순히 '효과가 있다/없다'를 넘어서, **왜** 이런 결과가 나왔는지를 이해해야 합니다.

---

## 3. 메커니즘의 이해

### 작동 원리

```
[입력] -> [처리] -> [출력]
   ^         v
   <--- [피드백] <---
```

1. **1단계**: 정보가 입력됩니다
2. **2단계**: 뇌/시스템이 이를 처리합니다
3. **3단계**: 행동/결과가 출력됩니다
4. **피드백**: 결과가 다시 입력에 영향을 줍니다

### 핵심 변수

과학에서는 **상관관계**와 **인과관계**를 구분합니다.

- A와 B가 함께 일어난다 != A가 B를 일으킨다
- 제3의 변수(C)가 둘 다에 영향을 줄 수 있습니다

---

## 4. 실생활 적용

### 알면 달라지는 것들

이 연구 결과를 일상에 적용하면:

1. **첫째**, (실용적 조언)
2. **둘째**, (행동 변화 제안)
3. **셋째**, (주의사항)

### 한계와 주의점

과학적 결과를 해석할 때 주의할 점:
- 연구 대상과 나의 상황이 다를 수 있음
- 평균적 효과 != 개인적 효과
- 과학은 '확률'을 말할 뿐, '확실성'을 보장하지 않음

---

## 맺으며: 겸손한 확신

과학은 모든 것을 알지 못합니다.
하지만 "모른다"고 정직하게 말할 수 있는 것이 과학의 힘입니다.

> "Science is not about certainty. It's about finding the most reliable way to think."
> - 리처드 파인만

우리가 확실히 아는 것, 불확실하지만 유력한 것, 그리고 아직 모르는 것을 구분하는 것.
그것이 과학적 사고의 시작입니다.

---

*궁금한 점이 있으시다면, 함께 탐구해봅시다.*"""

    def _generate_jung_brain_style(self, topic: str) -> str:
        """정재승 스타일 - 뇌과학 통찰"""
        return f"""# {topic}: 뇌는 왜 이렇게 반응할까?

## 뇌의 비밀

우리 뇌는 매 순간 수많은 결정을 내립니다.

{topic}에 대해 생각할 때도 마찬가지입니다. 뇌 속에서는 무슨 일이 일어나고 있을까요?

---

## 1. 두 개의 시스템

노벨상 수상자 대니얼 카너먼은 인간의 사고를 두 시스템으로 설명합니다.

| 시스템 1 | 시스템 2 |
|---------|---------|
| 빠름 | 느림 |
| 자동적 | 의식적 |
| 직관적 | 논리적 |
| 감정적 | 이성적 |

{topic}을 처음 접할 때, **시스템 1**이 먼저 작동합니다.
"좋다/싫다", "위험하다/안전하다"를 순식간에 판단하죠.

그 다음에야 **시스템 2**가 천천히 분석을 시작합니다.

## 2. 편향의 함정

뇌는 효율적이지만, 그래서 오류를 범합니다.

**{topic} 관련 흔한 인지 편향:**

1. **확증 편향**: 내 생각을 확인해주는 정보만 찾음
2. **가용성 휴리스틱**: 쉽게 떠오르는 사례로 판단
3. **앵커링 효과**: 처음 접한 정보에 과도하게 의존
4. **후견 편향**: "나는 이미 알고 있었어"

이런 편향을 **인식하는 것**만으로도 더 나은 판단이 가능합니다.

## 3. 감정과 이성의 협업

"감정을 배제하고 이성적으로 판단하라"

이 말은 **불가능한 요구**입니다.

뇌과학 연구에 따르면, 감정은 의사결정에 **필수적**입니다.
감정 영역이 손상된 환자는 오히려 결정을 내리지 못합니다.

핵심은 감정을 **배제**하는 것이 아니라 **인식**하는 것입니다.

## 4. 더 나은 판단을 위해

{topic}에 대해 더 좋은 판단을 내리려면:

1. **멈추기**: 즉각적 반응 전에 잠시 멈춤
2. **질문하기**: "왜 이렇게 느끼지?" 자문
3. **반대 논거 찾기**: 의도적으로 반대 의견 검토
4. **시간 두기**: 중요한 결정은 하룻밤 자고 나서

## 맺으며

뇌를 이해한다는 것은 **나 자신을 이해**하는 것입니다.

완벽한 판단은 불가능합니다.
하지만 **덜 틀리는 것**은 가능합니다.

> "메타인지 - 생각에 대해 생각하는 것 - 가 지혜의 시작이다."

---

*당신의 뇌는 지금 무슨 생각을 하고 있나요?*"""

    def _generate_jung_experiment_style(self, topic: str) -> str:
        """정재승 스타일 - 실험과 데이터"""
        return f"""# {topic}: 실험이 증명하는 것들

## 데이터로 말하다

"내 경험으로는...", "사람들이 다 그러는데..."

우리는 일상에서 이런 말을 자주 합니다. 하지만 **개인의 경험은 데이터가 아닙니다.**

{topic}에 대해 과학적 연구들은 무엇을 말해주고 있을까요?

---

## 실험 1: 기본 가정 검증

**연구 질문**: "{topic}은 정말 효과가 있는가?"

| 구분 | 내용 |
|------|------|
| 참가자 | N = 500 (무작위 선정) |
| 방법 | 이중맹검 무작위 대조 실험 |
| 기간 | 12개월 추적 관찰 |

**결과:**
- 실험군: 긍정적 변화 32%
- 대조군: 자연적 변화 8%
- 효과 크기: d = 0.65 (중간 이상)

**해석**: 통계적으로 유의미한 효과가 있음 (p < 0.001)

## 실험 2: 조건별 차이

**연구 질문**: "어떤 조건에서 효과가 더 큰가?"

| 조건 | 효과 크기 | 비고 |
|------|----------|------|
| 조건 A | +45% | 가장 효과적 |
| 조건 B | +28% | 보통 |
| 조건 C | +12% | 미미함 |
| 조건 D | -5% | 오히려 역효과 |

**핵심 발견**: 조건에 따라 효과가 크게 다름

## 실험 3: 장기 추적

**연구 질문**: "효과가 지속되는가?"

```
시간에 따른 효과 변화:
1개월: ############ 80%
3개월: ########## 70%  
6개월: ######## 55%
12개월: ###### 45%
```

**해석**: 초기 효과는 강하지만, 시간이 지남에 따라 감소

## 메타분석: 전체 그림

개별 연구가 아닌, **50개 이상의 연구를 종합**한 메타분석 결과:

- **전체 효과 크기**: 0.43 (유의미함)
- **이질성**: 높음 (연구마다 결과 차이 큼)
- **출판 편향**: 일부 존재 (부정적 결과 덜 출판됨)

## 실용적 시사점

데이터가 말해주는 것:

1. **{topic}은 효과가 있다** - 단, 조건부로
2. **모든 사람에게 같은 효과는 아니다** - 개인차 존재
3. **유지하려면 노력이 필요하다** - 자동으로 지속되지 않음
4. **기대는 낮추되, 시도는 해볼 만하다**

## 주의사항

과학적 데이터를 해석할 때:

- **평균 != 개인**: 평균적 효과가 나에게 적용되는 건 아님
- **상관 != 인과**: 관련이 있다 != 원인이다
- **유의미함 != 중요함**: 통계적 의미 != 실제적 의미

## 맺으며

과학은 "정답"을 주지 않습니다.
**더 나은 질문**을 던지고, **확률적 답변**을 제공할 뿐입니다.

그럼에도 과학적 방법이 가치 있는 이유:
**편견과 직관보다 신뢰할 수 있기 때문입니다.**

> "데이터 없는 의견은 그냥 의견일 뿐이다." - W. 에드워즈 데밍

---

*더 궁금한 연구 결과가 있으시면 함께 살펴봐요.*"""

    def _extract_topic_from_query(self, query: str) -> str:
        """쿼리에서 주제 추출"""
        # "~에 대해", "~에 관해", "~를", "~을" 패턴 처리
        import re

        # 스타일 관련 키워드 제거
        clean_query = re.sub(
            r"(유시민|손석희|정재승|유홍준)\s*(스타일로?|처럼|식으로)?",
            "",
            query,
        )
        clean_query = re.sub(
            r"(분석|설명|작성|써줘|해줘|알려줘|말해줘)",
            "",
            clean_query,
        )

        # 주제 추출 패턴
        patterns = [
            r"(.+?)(?:에\s*대해|에\s*관해|에\s*대한)",
            r"(.+?)(?:를|을)\s*$",
            r"(.+?)(?:의\s*)",
        ]

        for pattern in patterns:
            match = re.search(pattern, clean_query)
            if match:
                topic = match.group(1).strip()
                if len(topic) > 2:
                    return topic

        # 패턴 매칭 실패 시 정리된 쿼리 반환
        clean_query = clean_query.strip()
        if len(clean_query) > 2:
            return clean_query[:30] if len(clean_query) > 30 else clean_query

        return "해당 주제"

    def _get_tech_topic_info(self, topic: str) -> Dict[str, str]:
        """주제별 맞춤 기술 정보 제공"""
        topic_lower = topic.lower()

        # AI/인공지능 관련
        if any(
            kw in topic_lower
            for kw in ["ai", "인공지능", "gpt", "llm", "머신러닝", "딥러닝"]
        ):
            return {
                "market_data": """- **글로벌 AI 시장**: 2024년 1,840억 달러 -> 2030년 8,270억 달러 예상 (CAGR 28.46%)
- **생성 AI 투자**: 2023년 한 해만 250억 달러 이상 투자
- **채용 시장**: AI/ML 엔지니어 수요 5년간 74% 증가
- **기업 도입률**: Fortune 500 기업 75% 이상이 AI 프로젝트 진행 중""",
                "why_now": """1. **컴퓨팅 파워**: GPU 성능 향상과 클라우드 인프라 발전
2. **데이터 폭발**: 매일 2.5엑사바이트의 데이터 생성
3. **알고리즘 혁신**: Transformer 아키텍처가 가져온 패러다임 전환""",
                "key_players": """- **OpenAI**: GPT 시리즈로 시장 선도, ChatGPT 월간 사용자 1억 돌파
- **Google**: Gemini로 반격, 검색과 클라우드에 AI 전면 통합
- **Microsoft**: Copilot 전략으로 오피스/개발 도구 AI화
- **Meta**: Llama 오픈소스 전략으로 생태계 구축""",
                "opportunities": """- 반복 작업 자동화로 생산성 향상
- 새로운 비즈니스 모델 가능 (AI-first 서비스)
- 개인화된 사용자 경험 제공
- 의사결정 지원 및 인사이트 도출""",
                "risks": """- 기술 변화 속도가 너무 빨라 투자 타이밍 어려움
- 인력 부족과 높은 인건비
- 데이터 프라이버시 및 규제 리스크
- AI 편향성과 윤리적 이슈""",
                "action_items": """1. **기본 개념 학습**: 프롬프트 엔지니어링, AI 리터러시
2. **도구 활용**: ChatGPT, Copilot 등 실무 적용
3. **파일럿 프로젝트**: 작은 범위에서 PoC 진행
4. **인재 확보/육성**: 내부 역량 강화""",
            }

        # 블록체인/암호화폐 관련
        elif any(
            kw in topic_lower
            for kw in ["블록체인", "비트코인", "암호화폐", "이더리움", "web3"]
        ):
            return {
                "market_data": """- **비트코인 시가총액**: 1조 달러 이상 (디지털 금 지위 확립)
- **블록체인 시장**: 2030년까지 연평균 85% 성장 전망
- **기업 도입**: 글로벌 기업 81%가 블록체인 기술 검토 중
- **DeFi TVL**: 500억 달러 이상 (탈중앙화 금융 성장)""",
                "why_now": """1. **기관 투자 진입**: 블랙록 등 대형 자산운용사 ETF 승인
2. **규제 명확화**: 각국 정부의 규제 프레임워크 정비
3. **실사용 증가**: 결제, 송금, 자산 토큰화 등 유틸리티 확대""",
                "key_players": """- **비트코인**: 디지털 금, 가치 저장 수단으로 자리매김
- **이더리움**: 스마트 컨트랙트 플랫폼, DeFi/NFT 기반
- **금융기관**: JP모건, 골드만삭스 등 적극 참여
- **각국 정부**: CBDC(중앙은행 디지털화폐) 개발 경쟁""",
                "opportunities": """- 새로운 금융 인프라 구축 참여
- 토큰 이코노미를 활용한 비즈니스 모델
- 국경 없는 거래 및 결제 시스템
- 투명한 공급망 관리""",
                "risks": """- 높은 변동성과 투자 리스크
- 규제 불확실성 (국가별 상이)
- 기술적 복잡성과 사용자 경험 이슈
- 에너지 소비 및 환경 논란""",
                "action_items": """1. **기술 이해**: 블록체인 기본 원리 학습
2. **시장 모니터링**: 규제 동향 및 주요 프로젝트 추적
3. **소액 경험**: 실제 사용 경험 (지갑, 거래소)
4. **비즈니스 적용**: 자사 서비스에 적용 가능성 검토""",
            }

        # 클라우드 관련
        elif any(kw in topic_lower for kw in ["클라우드", "aws", "azure", "gcp"]):
            return {
                "market_data": """- **글로벌 클라우드 시장**: 2024년 6,790억 달러 규모
- **시장 점유율**: AWS(32%), Azure(23%), GCP(10%)
- **기업 도입률**: 94% 기업이 하나 이상의 클라우드 서비스 사용
- **멀티클라우드**: 87% 기업이 멀티클라우드 전략 채택""",
                "why_now": """1. **비용 효율성**: CapEx에서 OpEx로 전환, 유연한 비용 구조
2. **확장성**: 수요에 따른 즉각적인 리소스 조정
3. **혁신 속도**: 신기술 도입 속도 획기적 단축""",
                "key_players": """- **AWS**: 가장 넓은 서비스 포트폴리오, 시장 선도
- **Microsoft Azure**: 엔터프라이즈 통합, 하이브리드 강점
- **Google Cloud**: AI/ML 및 데이터 분석 특화
- **국내**: NHN Cloud, NCP, 카카오 클라우드 등""",
                "opportunities": """- 인프라 관리 부담 해소
- 글로벌 확장 용이
- 최신 기술 빠른 적용 (AI, 빅데이터 등)
- 보안 및 컴플라이언스 강화""",
                "risks": """- 벤더 락인 우려
- 데이터 주권 및 규제 이슈
- 예상치 못한 비용 증가 가능
- 운영 복잡성 (멀티클라우드 시)""",
                "action_items": """1. **클라우드 기초**: AWS/Azure/GCP 중 하나 학습
2. **자격증 취득**: SAA, AZ-900 등 기본 자격증
3. **마이그레이션 계획**: 현재 인프라 분석 및 전환 로드맵
4. **비용 최적화**: FinOps 관점의 비용 관리 체계 수립""",
            }

        # 기본 (범용)
        else:
            return {
                "market_data": f"""- **시장 성장률**: 연평균 20% 이상 성장 추세
- **투자 규모**: 관련 스타트업 투자 급증
- **채용 시장**: {topic} 관련 직무 수요 지속 증가
- **기업 관심도**: 주요 기업들의 도입 검토 활발""",
                "why_now": f"""1. **기술 성숙도**: {topic} 관련 기술이 실용화 단계 진입
2. **비용 효율성**: 도입 비용 대비 효과 검증 사례 증가
3. **경쟁 압박**: 선도 기업들의 적극적 도입으로 후발 주자 압박""",
                "key_players": f"""- **빅테크**: Google, Microsoft, Amazon 등 대규모 투자
- **스타트업**: 혁신적인 솔루션으로 틈새시장 공략
- **기존 강자**: 레거시 기업들의 디지털 전환 가속
- **국내 기업**: {topic} 관련 역량 강화 중""",
                "opportunities": f"""- 업무 효율성 향상
- 새로운 비즈니스 기회 창출
- 경쟁력 확보 및 차별화
- 미래 성장 동력 확보""",
                "risks": f"""- 기술 변화 속도에 따른 불확실성
- 초기 투자 비용 및 ROI 불확실
- 인력 확보 및 역량 부족
- 시장 과열 및 거품 우려""",
                "action_items": f"""1. **기본 학습**: {topic} 관련 개념과 트렌드 파악
2. **사례 연구**: 성공/실패 사례 분석
3. **소규모 시작**: 파일럿 프로젝트로 검증
4. **역량 확보**: 내부 인력 육성 또는 전문가 영입""",
            }

    def _generate_yoo_si_min_variant(
        self, query: str, tone: str, info: Dict[str, Any], variant: str
    ) -> str:
        """유시민 스타일 - 다양한 변형"""
        # 쿼리에서 주제 추출
        topic = self._extract_topic_from_query(query)
        project = info.get("project_name") or topic
        company = info.get("company_name", "관련 주체")

        if variant == "classic":
            return self._generate_yoo_si_min_advanced(query, tone, info)

        elif variant == "questioning":
            # 질문으로 시작하는 스타일 - 범용적
            return f"""# '{project}'에 대해 우리가 던져야 할 질문들

왜 아무도 이 질문을 하지 않는 걸까요?

{project}에 관한 이야기가 넘쳐납니다. 뉴스, 유튜브, SNS 어디서든 만날 수 있죠. 하지만 콘텐츠를 보다 보면 이상한 점을 발견하게 됩니다.

**정작 중요한 질문은 빠져 있다는 것입니다.**

---

## 첫 번째 질문: 정말 필요한 것인가?

"모두가 하니까", "트렌드니까"

이런 이유로 움직이고 있지는 않나요?

{project}가 실제로 나에게, 우리 사회에 어떤 가치를 주는지 진지하게 생각해본 적 있습니까?

유행을 따르는 것과 필요에 의한 선택은 다릅니다.

## 두 번째 질문: 누가 이익을 보는가?

모든 변화에는 수혜자가 있습니다.

{project}의 경우:
- 직접적 수혜자는 누구인가?
- 간접적 수혜자는 누구인가?
- 그리고, 피해자는 없는가?

이 질문에 답해보면, 전혀 다른 그림이 보이기 시작합니다.

**"좋은 것"으로만 포장된 것들의 이면에는 반드시 누군가의 이해관계가 있습니다.**

## 세 번째 질문: 대안은 없는가?

{project}만이 유일한 해결책일까요?

다른 접근법은 정말 없는 걸까요, 아니면 우리가 찾아보지 않은 걸까요?

때로는 "가장 인기 있는 선택"이 "가장 좋은 선택"이 아닙니다.

## 네 번째 질문: 10년 후에도 의미가 있을까?

지금 뜨거운 관심을 받는 것이 10년 후에도 중요할까요?

역사를 보면, 한때 "필수"였던 것들이 지금은 잊혀진 경우가 많습니다.

**장기적 관점에서 판단해야 합니다.**

## 결론: 질문하는 것을 두려워하지 맙시다

"다들 좋다고 하니까 좋은 거겠지"

이런 생각은 위험합니다.

남들이 묻지 않는 질문을 던져야 합니다. 불편하더라도, 인기가 없더라도.

> "현명한 자는 질문하고, 어리석은 자는 확신한다."

{project}에 대해 더 많은 질문을 던져봅시다. 그래야 진짜 답을 찾을 수 있습니다.

---

*비판적 사고는 부정적 사고가 아닙니다. 더 나은 선택을 위한 도구입니다.*"""

        else:  # storytelling
            # 서사적 접근 - 범용적 주제
            return f"""# '{project}'를 바라보며 든 생각

어느 날 문득, {project}에 대해 깊이 생각하게 되었습니다.

처음에는 대수롭지 않게 여겼습니다. "또 하나의 트렌드겠지", "금방 지나가겠지" 하고 말이죠.

그런데 알면 알수록, 이건 단순한 유행이 아니었습니다.

---

## 첫 인상과 달랐던 것

{project}를 처음 접했을 때의 느낌을 기억합니다.

솔직히, 별로였습니다. "이게 뭐가 대단하다고?"

하지만 깊이 파고들수록 생각이 바뀌었습니다. 표면 아래에 훨씬 복잡하고 흥미로운 이야기가 숨어 있었습니다.

**첫인상만으로 판단하면 안 됩니다.** 이건 인생의 여러 영역에서도 마찬가지죠.

## 사람들이 말하지 않는 것

{project}에 대한 콘텐츠는 넘쳐납니다.

유튜브를 켜면 "이것만 알면 됩니다!" 류의 영상이 쏟아지고, 뉴스에서는 매일 새로운 소식이 나옵니다.

하지만 대부분은 **같은 이야기의 반복**입니다.

정작 중요한 질문들은 다루지 않습니다:

- 이것의 한계는 무엇인가?
- 실패 사례는 없는가?
- 10년 후에도 유효할 것인가?

인기 있는 이야기만 하기 때문입니다.

## 빛과 그림자

모든 것에는 양면이 있습니다.

**{project}의 빛:**
- 새로운 가능성 제시
- 효율성 향상
- 접근성 확대

**{project}의 그림자:**
- 예상치 못한 부작용
- 양극화 심화 가능성
- 과도한 기대로 인한 거품

빛만 보는 것은 순진한 것이고, 그림자만 보는 것은 비관적인 것입니다.

**둘 다 봐야 합니다.**

## 내가 내린 결론

{project}는 분명 의미 있는 주제입니다.

하지만 맹목적으로 따를 것도, 무조건 거부할 것도 아닙니다.

제가 선택한 태도는 이렇습니다:

1. **열린 마음으로 관찰한다** - 선입견 없이 바라본다
2. **비판적으로 분석한다** - 장점과 단점을 모두 본다  
3. **나에게 맞는지 판단한다** - 남들이 아닌 나의 상황에서 평가한다
4. **유연하게 대응한다** - 상황이 바뀌면 생각도 바꾼다

## 마무리: 당신의 생각은?

{project}에 대한 제 생각을 나눠봤습니다.

물론 이것은 하나의 관점일 뿐입니다. 정답이 아닙니다.

중요한 것은 **스스로 생각하는 것**입니다.

남의 의견을 듣되, 최종 판단은 본인이 해야 합니다. 그래야 후회가 없습니다.

> "생각하는 것을 멈추는 순간, 우리는 존재하기를 멈춘다."

함께 생각해봐요.

---

*긴 글 읽어주셔서 감사합니다. 다른 관점도 환영합니다.*"""

    def _generate_tech_analysis_variant(
        self, query: str, tone: str, info: Dict[str, Any], approach: str
    ) -> str:
        """IT/테크 분석 - 다양한 접근법"""
        # 쿼리에서 주제 추출
        extracted_topic = self._extract_topic_from_query(query)
        topic = info.get("project_name") or extracted_topic

        # 주제별 맞춤 정보 가져오기
        topic_info = self._get_tech_topic_info(topic)

        if approach == "trend":
            return f"""# {topic}: 지금 주목해야 하는 이유

기술 트렌드는 빠르게 변합니다. 하지만 모든 트렌드가 의미 있는 것은 아닙니다.

{topic}이 지금 주목받는 이유는 단순한 유행 때문이 아닙니다. **실질적인 가치**를 제공하기 때문입니다.

---

## 현재 상황: 숫자로 보는 {topic}

{topic_info["market_data"]}

이 숫자들이 말해주는 것은 명확합니다. 이것은 일시적 현상이 아니라 **구조적 변화**입니다.

## 왜 지금인가? 세 가지 전환점

{topic}이 "지금" 폭발하는 이유가 있습니다:

{topic_info["why_now"]}

이 세 가지가 동시에 맞아떨어지는 시점은 드뭅니다.

## 실제로 누가 움직이고 있나

큰 기업들의 움직임을 보면 방향이 보입니다:

{topic_info["key_players"]}

스타트업 생태계에서도 {topic} 관련 기업들이 빠르게 성장 중입니다.

## 현실적 관점: 기회와 리스크

**기회:**
{topic_info["opportunities"]}

**리스크:**
{topic_info["risks"]}

## 지금 준비해야 할 것

{topic_info["action_items"]}

## 결론

{topic}은 "언젠가"의 기술이 아니라 "지금"의 기술입니다.

지금 시작하기에 늦지 않았습니다. 하지만 더 늦추면 기회비용이 커집니다.

> "미래를 예측하는 가장 좋은 방법은 미래를 만드는 것이다." - 앨런 케이

---

*기술의 파도를 피할 수는 없습니다. 다만 서핑을 배울 수는 있습니다.*"""

        elif approach == "deep_dive":
            return f"""# {topic} 깊이 파헤치기: 표면 아래의 이야기

모든 기술에는 두 개의 얼굴이 있습니다. 마케팅 슬라이드에서 보여주는 얼굴과, 실제 운영 현장에서 드러나는 얼굴.

오늘은 {topic}의 두 번째 얼굴을 들여다보겠습니다.

---

## 공식 설명 vs 실제 현장

| 구분 | 공식 설명 | 실제 현장 |
|------|----------|----------|
| 도입 시간 | "몇 주면 충분" | 최소 3-6개월 안정화 필요 |
| 생산성 | "즉시 향상" | 초기 6개월은 오히려 하락 |
| 비용 | "X원이면 됩니다" | 숨겨진 비용 2-3배 추가 |
| 난이도 | "쉽습니다" | 팀 전체 재교육 필요 |

이 간극은 왜 생기는 걸까요?

## 아무도 말하지 않는 7가지 진실

### 1. 학습 곡선의 현실
- 팀 전체가 새 시스템에 익숙해지는 데 **최소 3-6개월**
- 그 기간 동안의 생산성 저하는 예산에 포함되지 않음
- 핵심 인력이 "새로운 것 배우기"에 시간을 뺏김

### 2. 숨겨진 비용
- 라이선스 비용 외에 커스터마이징 비용
- 기존 시스템과의 통합 비용 (API, 데이터 마이그레이션)
- 유지보수 인력 교육 비용
- 예상치 못한 인프라 비용

### 3. 기술 부채 누적
- 빠른 도입을 위해 타협한 부분들
- "나중에 고치자"가 영원한 부채로
- 결국 청구서가 날아옴 (리팩토링, 마이그레이션)

### 4. 의존성 리스크
- 특정 벤더에 종속될 위험
- 가격 인상, 서비스 중단 시 대안 부재
- 오픈소스도 유지보수 중단 가능성

### 5. 보안과 규정 준수
- 새로운 기술 = 새로운 보안 취약점
- 규정 준수(GDPR, 개인정보보호법) 검토 필요
- 감사 대응 준비

### 6. 조직 저항
- "왜 바꿔야 하지?" 내부 저항
- 변화 관리 비용 과소평가
- 핵심 인력 이탈 리스크

### 7. 성공 측정의 어려움
- ROI 계산이 생각보다 복잡
- 정성적 효과를 어떻게 수치화할 것인가
- 단기 vs 장기 효과의 구분

## 그럼에도 불구하고: 왜 해야 하는가

이런 어려움에도 불구하고 {topic}을 도입해야 하는 이유:

1. **경쟁력 유지**: 하지 않으면 도태
2. **장기적 효율성**: 단기 고통, 장기 이득
3. **인재 확보**: 최신 기술 사용 기업 선호
4. **미래 대비**: 지금 준비하지 않으면 격차 확대

## 현실적 타임라인

| 시기 | 상태 | 기대치 |
|------|------|--------|
| 0-6개월 | 도입/학습기 | 생산성 하락 감수 |
| 6-12개월 | 적응기 | 기존 수준 회복 |
| 12-18개월 | 성장기 | 효과 체감 시작 |
| 18개월+ | 성숙기 | ROI 달성 |

## 결론: 성공을 위한 조건

{topic}은 분명 가치 있습니다.

하지만 성공하려면:

1. **현실적 기대치 설정** - 장밋빛 전망 경계
2. **충분한 시간 확보** - 서두르면 망함
3. **숨겨진 비용 예산에 반영** - 1.5~2배 버퍼
4. **변화 관리 계획** - 기술보다 사람이 먼저
5. **단계적 접근** - 빅뱅 도입 피하기

> "모든 것을 바꾸려 하지 마라. 먼저 작은 승리를 만들어라."

---

*기술 도입의 성공은 기술 자체가 아니라 도입 과정에서 결정됩니다.*"""

        elif approach == "comparison":
            return f"""# {topic} 선택 가이드: 무엇이 당신에게 맞는가

"최고의 기술"은 존재하지 않습니다. "상황에 맞는 최선의 선택"만 있을 뿐입니다.

{topic}과 관련된 선택지들을 비교해보겠습니다.

## 선택의 기준

기술을 선택할 때 고려해야 할 요소:

| 기준 | 중요도 | 질문 |
|------|--------|------|
| 팀 역량 | ***** | 우리 팀이 배울 수 있는가? |
| 비용 | **** | 예산 내에서 가능한가? |
| 확장성 | **** | 미래 성장을 감당할 수 있는가? |
| 생태계 | *** | 커뮤니티와 지원이 충분한가? |
| 성숙도 | *** | 프로덕션에 쓸 만큼 안정적인가? |

## 상황별 추천

**스타트업 (빠른 개발 필요)**
-> 학습 곡선 낮고 생산성 높은 옵션
-> 초기 비용보다 개발 속도 우선

**엔터프라이즈 (안정성 필요)**
-> 검증된 기술, 긴 지원 기간
-> 벤더 락인 vs 유연성 트레이드오프 고려

**개인 프로젝트 (학습 목적)**
-> 최신 기술 도전 추천
-> 실패해도 괜찮으니 과감하게

## 흔한 실수들

1. **유행 따라가기**: "다들 쓰니까"는 이유가 아님
2. **오버 엔지니어링**: 필요 이상으로 복잡한 솔루션
3. **익숙함 고집**: 새로운 것을 거부하는 것도 문제

## 최종 조언

결정을 내리기 전에 이 질문에 답해보세요:

> "6개월 후에도 이 선택에 만족할 것인가?"

확신이 없다면, 작은 규모로 먼저 시험해보세요.
프로토타입의 실패는 배움이지만, 전면 도입의 실패는 재앙입니다.

---

*좋은 선택은 많은 정보에서 나오지 않습니다. 올바른 질문에서 나옵니다.*"""

        else:  # future
            return f"""# {topic}의 미래: 3년 후 우리는 어디에 있을까

미래를 예측하는 것은 불가능합니다.
하지만 가능성의 지도를 그려볼 수는 있습니다.

{topic}이 앞으로 어떻게 발전할지, 몇 가지 시나리오를 그려보겠습니다.

## 시나리오 1: 낙관적 전망

**"보편화의 시대"**

- 모든 기업이 필수적으로 도입
- 관련 인력 수요 폭발적 증가
- 새로운 직업군 탄생

이 시나리오가 실현되려면:
- 비용이 획기적으로 낮아져야 함
- 규제 환경이 정비되어야 함
- 성공 사례가 충분히 축적되어야 함

## 시나리오 2: 현실적 전망

**"선택적 도입의 시대"**

- 특정 산업/규모에서 활발히 활용
- 전문가 수요는 증가하나 제한적
- 기존 기술과 공존

가장 가능성 높은 시나리오입니다.

## 시나리오 3: 비관적 전망

**"거품 붕괴의 시대"**

- 과도한 기대 후 실망
- 투자 위축
- "겨울" 도래

역사적으로 모든 기술이 이 단계를 거쳤습니다.
문제는 시기와 정도입니다.

## 준비하는 자세

어떤 시나리오가 오든, 준비된 사람이 기회를 잡습니다.

**지금 해야 할 것:**
- 기본기 다지기 (유행과 무관하게 유효한 역량)
- 네트워크 구축 (관련 커뮤니티 참여)
- 포트폴리오 만들기 (실제 결과물로 증명)

**피해야 할 것:**
- 한 기술에 올인
- 트렌드 맹목 추종
- 기초 무시하고 응용만 쫓기

## 맺으며

미래는 준비하는 사람의 것입니다.

{topic}이 어떻게 되든, 변화에 적응하는 능력이 가장 중요한 자산입니다.

> "예측할 수 없다면, 적응하라."

---

*미래를 두려워하지 마세요. 준비하세요.*"""

    def _generate_diverse_analysis(
        self, query: str, tone: str, info: Dict[str, Any], format_type: str
    ) -> str:
        """다양한 형식의 분석글"""
        # 쿼리에서 주제 추출
        extracted_topic = self._extract_topic_from_query(query)
        topic = info.get("project_name") or extracted_topic

        if format_type == "narrative":
            # 서사적 스타일 - 보강된 버전
            return f"""# {topic}: 이것이 중요한 이유

이야기를 하나 들려드리겠습니다.

{topic}에 대해 처음 알게 된 것은 우연이었습니다. 하지만 파고들수록 이것이 단순한 트렌드가 아님을 깨달았습니다.

---

## 왜 지금 이 이야기를 하는가

세상에는 두 종류의 변화가 있습니다.

**첫 번째**: 시끄럽게 오는 변화
- 모두가 주목하고, 뉴스에 나오고, 논쟁이 일어납니다
- 눈에 보이기 때문에 대비하기 쉽습니다

**두 번째**: 조용히 오는 변화
- 아무도 모르는 사이에 세상을 바꿔놓습니다
- 깨달았을 때는 이미 늦은 경우가 많습니다

{topic}은 후자에 속합니다.

그래서 지금 이야기하는 것입니다.

## 무엇이 달라지고 있는가

표면적으로는 크게 달라진 것이 없어 보입니다.

하지만 조금만 깊이 들여다보면, **근본적인 변화**가 일어나고 있음을 알 수 있습니다.

| 시점 | 상황 | 특징 |
|------|------|------|
| **과거** | 전문가의 영역 | 높은 진입 장벽, 제한된 접근성 |
| **현재** | 대중화 진입 | 장벽 하락, 누구나 접근 가능 |
| **미래** | 필수 역량화 | 모르면 도태, 새로운 기회 |

이 변화는 **돌이킬 수 없습니다.**

## 실제 영향: 일상의 변화

{topic}이 가져올 변화는 추상적이지 않습니다.

**개인의 삶:**
- 일하는 방식이 바뀝니다
- 배워야 할 것이 달라집니다
- 경쟁의 규칙이 변합니다

**사회 전반:**
- 산업 구조가 재편됩니다
- 새로운 직업이 생기고, 기존 직업이 사라집니다
- 부의 분배 방식이 달라집니다

## 당신은 어디에 서 있는가

변화의 속도는 점점 빨라지고 있습니다.

> 5년 전에는 **선택**이었던 것이, 지금은 **필수**가 되었습니다.
> 지금 **선택**인 것이, 5년 후에는 **필수**가 될 것입니다.

문제는, 대부분의 사람들이 **"나중에 해도 되지"**라고 생각한다는 것입니다.

하지만 "나중"이 오면, 이미 앞서간 사람들과의 격차를 좁히기 어렵습니다.

## 지금 할 수 있는 것

지금 당장 모든 것을 바꿀 필요는 없습니다.

하지만 **눈을 감지 마세요.**

**1단계: 인지**
- {topic}에 대한 기본 개념 이해
- 관련 뉴스와 트렌드 팔로우

**2단계: 탐색**
- 나의 영역에서 어떤 영향이 있을지 생각
- 선도 사례 학습

**3단계: 실험**
- 작은 범위에서 적용해보기
- 시행착오를 통한 학습

**4단계: 확장**
- 검증된 것을 본격 적용
- 지속적인 개선

## 결론: 작은 시작이 큰 차이를 만든다

{topic}은 피할 수 없는 흐름입니다.

중요한 것은 **언제 시작하느냐**입니다.

지금 시작하면 기회가 되고, 나중에 시작하면 생존의 문제가 됩니다.

> "미래를 예측하는 가장 좋은 방법은 미래를 만드는 것이다." - 피터 드러커

---

*변화는 준비된 자에게 기회가 됩니다. 당신은 준비되어 있습니까?*"""

        elif format_type == "analytical":
            # 분석적 스타일
            return f"""# {topic}: 객관적 분석

본 문서에서는 {topic}에 대해 데이터와 사실에 기반하여 분석합니다.

## 1. 현황 분석

### 1.1 시장 규모
- 글로벌 시장: 지속적 성장세
- 국내 시장: 초기 단계이나 잠재력 높음

### 1.2 주요 플레이어
| 구분 | 특징 | 점유율 |
|------|------|--------|
| 리더 | 기술력 + 자본 | 40-50% |
| 도전자 | 혁신 + 속도 | 20-30% |
| 틈새 | 특화 + 전문성 | 10-20% |

### 1.3 기술 성숙도
- 연구 단계 -> 초기 상용화 -> **대중화 진입** -> 성숙기
- 현재 위치: 대중화 진입 단계

## 2. SWOT 분석

| | 긍정적 | 부정적 |
|------|--------|--------|
| 내부 | **강점**: 확장성, 효율성 | **약점**: 학습 곡선, 초기 비용 |
| 외부 | **기회**: 성장 시장, 규제 완화 | **위협**: 경쟁 심화, 기술 변화 |

## 3. 시나리오 분석

### 최상 시나리오 (확률: 20%)
- 급속한 대중화
- 관련 산업 동반 성장

### 기본 시나리오 (확률: 60%)
- 점진적 성장
- 특정 분야에서 표준화

### 최악 시나리오 (확률: 20%)
- 기대 대비 저조한 성과
- 대체 기술 등장

## 4. 결론 및 제언

**핵심 요약:**
1. 성장 잠재력은 높으나 불확실성 존재
2. 선제적 대응이 유리하나 과도한 투자는 리스크
3. 단계적 접근 권장

**권장 행동:**
- 단기: 학습 및 모니터링
- 중기: 파일럿 프로젝트 시도
- 장기: 본격 도입 검토

---

*본 분석은 참고용이며, 최종 의사결정은 상황에 맞게 판단하시기 바랍니다.*"""

        elif format_type == "investigative":
            # 탐사 보도 스타일
            return f"""# [심층 취재] {topic}의 이면

겉으로 보이는 것과 실제는 다를 수 있습니다.

{topic}에 대해 공개된 정보 너머의 이야기를 파헤쳐 보았습니다.

## * 공식 발표 vs 내부 사정

**공식 발표:**
"모든 것이 계획대로 순조롭게 진행 중"

**취재 결과:**
실상은 조금 다릅니다.

관계자 A씨는 이렇게 말했습니다:
> "발표와 현실 사이에는 간극이 있어요. 물론 큰 방향은 맞지만, 세부적으로는 예상치 못한 문제들이 발생하고 있죠."

## * 돈의 흐름을 따라가 보면

어떤 사안이든, 돈의 흐름을 따라가면 진실이 보입니다.

**자금 조달 구조:**
- 당초 계획: 단순한 구조
- 현재 구조: 복잡하게 변경됨

왜 이렇게 바뀌었을까요?

한 전문가는 이렇게 분석합니다:
> "복잡해진다는 것은 그만큼 쉽지 않다는 의미입니다. 단순한 방법이 통하지 않으니 우회로를 찾는 거죠."

## * 이해관계자들의 속내

**수혜자 측:**
"좋은 기회다. 놓칠 수 없다."

**부담자 측:**
"불안하다. 최악의 경우가 걱정된다."

**중립적 관찰자:**
"아직 판단하기 이르다. 하지만 경계는 필요하다."

## * 앞으로 주목해야 할 포인트

1. **다음 발표 내용**: 계획대로인지 수정되는지
2. **시장 반응**: 투자자들의 움직임
3. **규제 당국 동향**: 개입 여부

## * 기자의 시선

{topic}은 아직 현재진행형입니다.

결론을 내리기엔 이릅니다. 다만, 관심을 갖고 지켜봐야 할 사안임은 분명합니다.

**핵심 포인트:**
- 공식 발표를 그대로 믿지 말 것
- 행간을 읽을 것
- 돈의 흐름을 따라갈 것

---

*진실은 항상 복잡합니다. 하지만 포기하지 않으면 조금씩 드러납니다.*"""

        elif format_type == "essay":
            # 에세이 스타일 - 보강된 버전
            return f"""# {topic}에 대한 단상

요즘 자주 생각하는 것이 있습니다.

{topic}이라는 주제가 머릿속을 떠나지 않습니다. 왜일까요?

---

## 처음 만났을 때

솔직히 말하면, 처음에는 대수롭지 않게 생각했습니다.

"또 하나의 유행이겠지."
"금방 사라지겠지."
"나와는 상관없는 이야기겠지."

그런데 시간이 지날수록 생각이 바뀌었습니다.

처음에는 **무관심**이었습니다.
그 다음은 **호기심**이었습니다.
지금은 **진지한 관심**입니다.

## 무엇이 나를 사로잡았나

몇 가지 이유가 있습니다.

**첫째, 변화의 깊이.**

표면적인 변화가 아니었습니다. 근본적인 무언가가 달라지고 있었습니다.

마치 빙산 같습니다. 수면 위로 보이는 것은 작은 부분이고, 실제로는 훨씬 더 큰 변화가 수면 아래에서 진행 중입니다.

**둘째, 속도.**

예상보다 훨씬 빠르게 확산되고 있었습니다.

1년 전에 "아직 먼 이야기"라고 했던 것들이, 지금은 "당장의 현실"이 되었습니다. 이 속도는 앞으로 더 빨라질 것입니다.

**셋째, 범위.**

한 분야에 국한되지 않고, 여러 영역으로 퍼져나가고 있었습니다.

| 영역 | 변화 양상 |
|------|----------|
| 일 | 업무 방식의 근본적 변화 |
| 학습 | 배우는 방법과 내용의 변화 |
| 관계 | 소통 방식의 변화 |
| 가치관 | 중요하게 여기는 것의 변화 |

## 불편한 질문들

생각이 깊어질수록 불편한 질문들이 떠올랐습니다.

> "나는 준비가 되어 있는가?"

이 질문 앞에서 자신 있게 "예"라고 대답하기 어려웠습니다.

> "이 변화에서 나는 어디에 서야 하는가?"

방관자? 참여자? 선도자? 아직 나의 위치를 정하지 못했습니다.

> "지금 하는 것들이 5년 후에도 의미가 있을까?"

가장 두려운 질문입니다. 오늘의 노력이 내일 무의미해질 수 있다는 것.

쉽게 답할 수 없는 질문들입니다. 하지만 **질문을 회피하는 것보다 질문과 마주하는 것**이 낫습니다.

## 그럼에도 불구하고

불안함 속에서도 희망을 찾습니다.

변화는 **위협**이기도 하지만, **기회**이기도 합니다.

문이 닫히면 창문이 열린다고 했습니다. 사라지는 것이 있으면, 새로 생기는 것도 있습니다.

중요한 것은:

1. **깨어 있는 것** - 변화를 인지하기
2. **유연한 것** - 고정관념 버리기
3. **배우는 것** - 계속 성장하기
4. **연결되는 것** - 함께 나아가기

## 나만의 원칙

{topic}을 대하는 저만의 원칙을 세워봤습니다.

- 맹목적으로 따르지 않는다
- 무조건 거부하지도 않는다
- 호기심을 유지한다
- 비판적으로 수용한다
- 나에게 맞게 적용한다

## 오늘의 결론

{topic}에 대한 제 생각은 아직 정리 중입니다.

확실한 답을 드리지 못합니다. 하지만 괜찮습니다.

**정답이 없는 질문도 있습니다.**

중요한 것은 답을 찾는 과정에서 **생각이 깊어지고, 시야가 넓어지는 것**입니다.

함께 고민할 수 있다면 좋겠습니다. 혼자보다 함께가 낫습니다.

> "인생에서 가장 중요한 것은 정답을 아는 것이 아니라, 좋은 질문을 던지는 것이다."

---

*생각은 나누면 자랍니다. 당신의 생각은 어떠신가요?*"""

        elif format_type == "debate":
            # 토론/양비론 스타일
            return f"""# {topic}: 찬반 양론을 넘어서

{topic}에 대해 의견이 분분합니다.

찬성하는 쪽과 반대하는 쪽, 양측 모두 나름의 논리가 있습니다. 오늘은 양측의 주장을 균형 있게 살펴보고, 그 너머를 생각해보려 합니다.

---

## + 찬성 측 주장

**핵심 논거:**

1. **효율성 향상**
   - 기존 방식 대비 생산성 대폭 개선
   - 시간과 비용 절감 효과 입증됨

2. **불가피한 변화**
   - 글로벌 트렌드를 거스를 수 없음
   - 안 하면 뒤처짐

3. **새로운 기회 창출**
   - 새로운 일자리와 산업 탄생
   - 선점 효과 기대

**찬성 측이 간과하는 것:**
- 전환 과정의 사회적 비용
- 불평등 심화 가능성

---

## - 반대 측 주장

**핵심 논거:**

1. **검증 부족**
   - 아직 충분히 검증되지 않음
   - 숨겨진 리스크 존재

2. **사회적 부작용**
   - 기존 일자리 파괴
   - 양극화 심화

3. **대안 존재**
   - 기존 시스템 개선으로 충분
   - 급진적 변화 불필요

**반대 측이 간과하는 것:**
- 변화 거부의 장기적 비용
- 점진적 적응 가능성

---

## = 양측을 넘어서

사실, 이것은 찬성/반대의 문제가 아닙니다.

**어떻게** 도입할 것인가의 문제입니다.

### 균형 잡힌 접근:

| 요소 | 고려사항 |
|------|----------|
| 속도 | 급진적 X, 점진적 O |
| 범위 | 전면적 X, 선택적 O |
| 지원 | 도입만 X, 전환 지원 O |
| 평가 | 성과만 X, 부작용도 O |

### 진짜 질문:

1. 누가 혜택을 받고, 누가 피해를 보는가?
2. 피해를 최소화할 방법은 무엇인가?
3. 준비 기간은 충분한가?

## 결론

{topic}는 피할 수 없는 변화일 수 있습니다.

하지만 **어떻게** 변화하느냐는 우리 손에 달려 있습니다.

맹목적 수용도, 무조건적 거부도 답이 아닙니다.
**비판적 수용**이 필요합니다.

---

*좋은 토론은 승패를 가리지 않습니다. 더 나은 이해를 만들어냅니다.*"""

        else:  # letter (편지 스타일)
            # 독자에게 보내는 편지 스타일
            return f"""# {topic}에 대해 당신에게 드리는 편지

안녕하세요.

오늘은 {topic}에 대해 이야기하고 싶어서 글을 씁니다.

---

## 솔직한 고백부터 하겠습니다

저도 처음에는 잘 몰랐습니다.

{topic}이라는 말을 들었을 때, "그게 나랑 무슨 상관이지?" 싶었습니다. 먼 나라 이야기 같았고, 전문가들이나 신경 쓸 일이라고 생각했습니다.

하지만 알면 알수록, 이것이 우리 모두의 이야기임을 깨달았습니다.

## 왜 이 이야기를 꺼내는가

요즘 {topic} 관련 뉴스가 많이 나옵니다.

하지만 대부분의 기사는 전문 용어로 가득하거나, 특정 관점만 강조합니다. 정작 **"우리에게 어떤 의미인가"**는 다루지 않습니다.

그래서 제 나름대로 정리해보았습니다.

## 제가 이해한 핵심

복잡하게 들릴 수 있지만, 핵심은 간단합니다.

**1. 변화가 오고 있다**
- 이것은 확실합니다
- 속도만이 문제입니다

**2. 준비하면 기회, 안 하면 위기**
- 미리 알면 대비할 수 있습니다
- 모르면 당합니다

**3. 지금 시작해도 늦지 않았다**
- 완벽할 필요 없습니다
- 관심을 갖는 것만으로 시작입니다

## 부탁드리고 싶은 것

너무 두려워하지 마세요.

{topic}은 무서운 것이 아닙니다. 새로운 것일 뿐입니다. 새로운 것은 항상 낯설고 불안하게 느껴집니다. 하지만 시간이 지나면 익숙해집니다.

그러니 조금씩, 천천히 알아가시면 됩니다.

## 함께 가면 좋겠습니다

저도 아직 배우는 중입니다.

완벽한 답을 가지고 있지 않습니다. 하지만 혼자보다는 함께가 낫다고 믿습니다.

궁금한 것이 있으면 언제든 물어봐 주세요. 제가 아는 범위에서 최선을 다해 답해드리겠습니다.

## 마치며

긴 글 읽어주셔서 감사합니다.

{topic}에 대해 조금이나마 이해하는 데 도움이 되었으면 좋겠습니다.

앞으로도 좋은 정보로 찾아뵙겠습니다.

건강하세요.

---

*함께 성장하는 것이 가장 큰 기쁨입니다.*"""

    def _generate_yoo_si_min_advanced(
        self, query: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """유시민 스타일 고급 글 - 범용 분석 (주제에 맞게 동적 생성)"""

        # 주제 추출
        topic = self._extract_topic_from_query(query)
        project = info.get("project_name") or topic

        # 본문 생성 - 범용 분석
        article = f"""# [유시민의 시선] {project} - 우리가 묻지 않는 질문들

## 들어가며: 말의 포장을 벗기다

{project}에 대한 이야기가 쏟아지고 있습니다.

뉴스를 보면 화려한 수식어들이 넘쳐납니다. "혁신적", "획기적", "미래 지향적". 이 말들은 아주 점잖고 세련되게 들립니다.

그런데 말입니다. 이 화려한 포장지를 한 꺼풀만 벗겨내면, 그 안에는 **우리가 직시해야 할 현실**이 도사리고 있습니다.

저는 이 뉴스를 단순한 '소식'이 아니라, **우리 사회가 보내는 신호**로 읽었습니다. 왜 그런지 하나씩 짚어보겠습니다.

---

## 1. 누가 이 이야기를 하고 있는가?

모든 정보에는 **화자**가 있습니다.

{project}에 대해 말하는 사람들은 누구입니까?

- **이해관계자**: 이득을 볼 수 있는 사람들
- **전문가**: 해당 분야에 깊은 지식을 가진 사람들
- **언론**: 뉴스 가치를 판단하는 사람들

문제는, 이들의 이해관계가 **우리의 이해관계와 일치하지 않을 수 있다**는 것입니다.

> "누가 이익을 보는가?"를 물으면, 진실의 윤곽이 드러나기 시작합니다.

---

## 2. 왜 '지금' 이 이야기가 나오는가?

타이밍은 우연이 아닙니다.

{project}가 지금 이 시점에 주목받는 이유가 있습니다:

| 시점 | 의미 | 해석 |
|------|------|------|
| 특정 이벤트 직전 | 관심 유도 | 의도적 타이밍 |
| 위기 상황 | 물타기 | 관심 분산 |
| 성과 발표 시점 | 정당화 | 사후 설명 |

**"왜 하필 지금?"**

이 질문에 답하지 못한다면, 우리는 누군가의 각본대로 움직이고 있는 것일 수 있습니다.

---

## 3. 공식 설명 vs 현실

### 말과 현실의 간극

| 구분 | 공식 설명 | 현실적 상황 |
|------|----------|------------|
| 효과 | "획기적" | 검증 필요 |
| 비용 | "합리적" | 숨겨진 비용 존재 |
| 리스크 | "관리 가능" | 불확실성 상존 |
| 수혜자 | "모두" | 일부에 집중 |

**공식 발표만 믿으면 안 됩니다.** 행간을 읽어야 합니다.

---

## 4. 반론에 대한 검토

여기서 누군가 이렇게 반박할 수 있습니다:

> "그래도 긍정적인 측면도 있지 않습니까?"

맞습니다. 모든 사안에는 양면이 있습니다.

하지만 제가 문제 삼는 것은 **균형 없는 보도**입니다.

긍정적 측면은 충분히 다뤄지고 있습니다. 그러나:

1. **부정적 측면은 축소**되거나 생략됩니다
2. **수혜자와 피해자가 명확히 구분**되지 않습니다
3. **장기적 영향은 논의되지 않습니다**

---

## 5. 우리가 물어야 할 질문들

{project}에 대해 진정으로 이해하려면 이 질문들을 던져야 합니다:

### 핵심 체크리스트

| 질문 | 왜 중요한가 |
|------|------------|
| 실제 수혜자는 누구인가? | 공평함 검증 |
| 비용은 누가 부담하는가? | 책임 소재 |
| 대안은 검토되었는가? | 최선인지 확인 |
| 반대 의견은 무엇인가? | 균형 잡힌 시각 |
| 10년 후에도 유효한가? | 지속 가능성 |

**이 질문들에 명확한 답이 있다면, 좋은 신호입니다.**
답이 흐릿하다면, **경계해야 합니다.**

---

## 6. 더 넓은 맥락에서 보기

{project}는 고립된 사건이 아닙니다.

더 큰 흐름 속에서 봐야 합니다:

- **사회적 맥락**: 왜 이런 논의가 필요해졌는가?
- **역사적 맥락**: 과거 유사 사례는 어떻게 되었는가?
- **국제적 맥락**: 다른 나라는 어떻게 접근하는가?

넓게 봐야 깊이 볼 수 있습니다.

---

## 맺으며: 질문하는 것을 멈추지 맙시다

"좋은 것"이라는 말을 들으면 저는 반대로 묻고 싶습니다.

> **누구에게 좋은 것인가?**
> **어떤 조건에서 좋은 것인가?**
> **무엇을 포기해야 얻을 수 있는 것인가?**

멋진 말은 종종, 우리가 불편해서 직시하지 않는 현실을 가리는 천입니다.

**천을 걷어내고 사실을 봐야 합니다.** 그래야 시민으로서 판단할 수 있습니다.

비판적 시각은 비관적 시각이 아닙니다. **더 나은 선택을 위한 도구**입니다.

> "민주주의는 깨어 있는 시민이 지킨다."

---

*이 글은 특정 결론을 강요하지 않습니다. 다만, 질문할 것을 권합니다.*"""

        return article

    def _generate_chatgpt_analysis_style(
        self, query: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """ChatGPT 스타일 심층 분석글"""

        project = info.get("project_name", "해당 사업")
        company = info.get("company_name", "시공사")
        fin_terms = info.get("financial_terms", [])

        return f"""# "자본시장형 전환"이라는 말이 가리는 것들: {project}의 진짜 표정

## 서론: 금융은 말보다 구조가 더 솔직하다

{project}이 PF 대출을 기초자산으로 자산유동화 절차에 들어갔다는 소식은, 표면적으로는 "금융 선진화"라는 말로 포장되기 좋습니다. SPV를 세우고, 채권을 넘기고, 증권을 발행해 자금을 끌어오는 구조. 듣기엔 정교하고, 무엇보다 '돈줄이 넓어지는' 듯 보입니다.

그런데 **금융은 말보다 구조가 더 솔직합니다.** 그리고 이번 구조의 솔직함은, "여유"가 아니라 **불안의 관리** 쪽에 가깝습니다.

---

## 핵심: 보증을 겹겹이 쌓았다는 것의 의미

핵심은 간단합니다.

> **한 번의 보증으로는 부족해서, 보증을 겹겹이 쌓았다.**

건설공제조합 보증이 들어가고, 시공사 연대보증까지 붙었습니다. 신용보강 장치를 복수로 결합했다는 건, 누군가의 도덕성 문제가 아니라 **시장 가격표**입니다.

즉, 이 사업의 현금흐름이 아직 '스스로 서서' 신용을 만들기 어렵고, 그래서 **외부의 신용을 빌려와야 한다**는 뜻입니다.

---

## "그래도 보증기관이 들어왔으니 안전한 거 아닌가요?"

많은 사람들이 이렇게 묻습니다.

그 질문이 성립하려면 전제가 하나 필요합니다:
**그 '보증'이 무너지지 않는 신용이라는 전제.**

하지만 지금 PF 시장이 겪는 현실은 정반대입니다. PF는 '사업성'만 보는 금융이 아닙니다. **사업성 + 시장 심리 + 신용비용**이 한 덩어리로 움직입니다.

착공을 앞뒀고, 인허가도 마쳤고, 숫자로는 대단지입니다. 그런데도 "리파이낸싱/구조 전환"이 전면에 나온다면, 이건 축하할 일이 아니라 **일단 경계해야 할 신호**입니다.

---

## 왜 PF 유동화가 등장하는가

PF 유동화는 종종 이런 상황에서 등장합니다:

> **시중은행이 '그냥은 못 받겠다'고 말할 때.**

은행은 보수적입니다. 그런데 지금은 은행마저 더 보수적입니다. 결국 거래가 성사되는 조건은 단순합니다:

**"추가 보증, 더 두꺼운 신용보강, 더 많은 안전장치."**

은행이 받아준다는 사실 자체가 안전을 의미하는 게 아니라, **'추가 장치를 전제로 해서만' 받아준다는 조건**이 진짜 메시지입니다.

---

## 연대보증이 붙는 순간 발생하는 일

시공사 연대보증이 강조되는 순간, 사업은 **회사 신용과 업황 리스크를 함께 짊어집니다.**

시장에서는 대형 건설사들에 대해 유동성 압박, 신용도 부담, 계열 전반의 조달비용 상승 같은 얘기가 반복적으로 돌고, 실제로 업황이 조금만 흔들려도 **신용비용(금리*가산금리*수수료)이 먼저 반응**합니다.

이때 연대보증은 "믿음"이 아니라 **"담보"**로 해석됩니다.

---

## 진짜 승부: 발행 이후

더 날카로운 지점은 이겁니다.

유동화는 실행 전 단계에서는 멀쩡해 보입니다. 계획 등록도 하고, SPV도 세웁니다. 그러나 **진짜 승부는 그 다음**입니다:

1. **증권이 실제로 팔리느냐**
2. **팔린다면 얼마의 금리로 팔리느냐**
3. **그 금리가 사업비를 견딜 만큼 낮으냐**

이 셋 중 하나라도 틀어지면, '자본시장형 전환'은 곧바로 다른 이름이 됩니다:
**'자금 공백 관리'**, 혹은 더 직설적으로 말하면 **'시간 벌기'**입니다.

---

## 조합이 확인해야 할 질문들

구조가 복잡해질수록 책임의 경계가 흐려집니다. 이해관계자가 늘어날수록 비용이 스며듭니다.

조합 입장에서 실무적으로 확인해야 할 질문:

| 질문 | 왜 중요한가 |
|------|-------------|
| 유동화증권 발행 실패 시 대체 플랜은? | 자금 공백 대비 |
| 보증 발동 조건(트리거)은? | 조합 부담 비용 예측 |
| 공사비 지급 우선순위(워터폴)는? | 내 돈이 어디로 가는지 |
| 시공사 신용 변화 시 자동 악화 조항은? | 연쇄 리스크 파악 |

이 질문에 답이 명확하면, 유동화는 **도구**가 될 수 있습니다.
답이 흐릿하면, 유동화는 도구가 아니라 **경고등**이 됩니다.

---

## 결론: 천을 걷어내고 숫자를 봐야 한다

'자본시장형 구조 전환'은 멋진 말입니다.

하지만 금융에서 멋진 말은 종종, **우리가 불편해서 직시하지 않는 현실을 가리는 천**입니다.

천을 걷어내고 숫자와 조건을 봐야 합니다.

**그래야 조합의 돈이 지켜집니다.**

---

*본 분석은 공개된 정보를 바탕으로 작성되었습니다.*"""

    def _generate_professional_analysis(
        self, query: str, tone: str, info: Dict[str, Any]
    ) -> str:
        """전문적 분석글 (기본)"""
        project = info.get("project_name", "해당 사업")
        company = info.get("company_name", "시공사")

        return f"""# {project} 금융 구조 분석

## 개요

{query[:150]}{"..." if len(query) > 150 else ""}

## 핵심 분석

### 1. 금융 구조의 특징

이번 사안에서 주목할 점은 **복수의 신용보강 장치**가 결합되었다는 것입니다. 이는 단일 보증으로는 시장의 신뢰를 얻기 어려웠음을 시사합니다.

### 2. 시장이 보내는 신호

금융기관은 리스크에 민감합니다. 추가적인 보증 요구는 다음을 의미할 수 있습니다:
- 사업 자체의 리스크 평가 상향
- 시공사 신용도에 대한 우려
- 시장 전반의 보수적 심리

### 3. 향후 관전 포인트

1. **실제 증권 발행 성공 여부**
2. **발행 금리 수준**
3. **시공사 재무 건전성 변화**
4. **착공 일정 준수 여부**

## 결론

표면적인 "금융 구조 고도화"라는 설명 이면에 있는 실질적 리스크 요인들을 파악하는 것이 중요합니다.

---
*본 분석은 일반적인 정보 제공 목적이며, 투자 조언이 아닙니다.*"""

    def _detect_writing_style(self, query: str) -> str:
        """글쓰기 스타일 감지 - 확장된 스타일 지원"""
        query_lower = query.lower()

        # 특정 인물 스타일
        if "유시민" in query:
            return "yoo_si_min"
        elif "김어준" in query:
            return "kim_eo_jun"
        elif "진중권" in query:
            return "jin_joong_kwon"
        elif "손석희" in query:
            return "son_seok_hee"
        elif "유홍준" in query or "나의문화유산답사기" in query:
            return "yoo_hong_jun"
        elif "정재승" in query or "뇌과학" in query:
            return "jung_jae_seung"

        # IT/테크 분석
        elif any(
            kw in query_lower
            for kw in [
                "ai",
                "인공지능",
                "테크",
                "스타트업",
                "it",
                "소프트웨어",
                "플랫폼",
                "블록체인",
                "비트코인",
                "암호화폐",
                "클라우드",
                "빅데이터",
                "머신러닝",
                "딥러닝",
            ]
        ):
            return "tech_analysis"

        # 경제 분석
        elif any(
            kw in query
            for kw in ["경제", "시장", "주식", "투자", "금리", "인플레이션", "환율"]
        ):
            return "economy_analysis"

        # 정치 분석
        elif any(
            kw in query for kw in ["정치", "정부", "국회", "대통령", "정책", "선거"]
        ):
            return "politics_analysis"

        # 글 형식
        elif "칼럼" in query or "논평" in query:
            return "column"
        elif "기사" in query:
            return "news"
        elif "분석" in query:
            return "analysis"
        elif "비평" in query or "비판" in query:
            return "critique"
        elif "요약" in query or "정리" in query:
            return "summary"

        return "general"

    def _detect_tone(self, query: str) -> str:
        """논조 감지"""
        critical_keywords = ["비판", "문제", "심각", "지적", "우려", "위기", "문제점"]
        positive_keywords = ["긍정", "장점", "성과", "발전", "희망"]

        critical_count = sum(1 for kw in critical_keywords if kw in query)
        positive_count = sum(1 for kw in positive_keywords if kw in query)

        if critical_count > positive_count:
            return "critical"
        elif positive_count > critical_count:
            return "positive"
        return "neutral"

    def _extract_main_topic(self, query: str) -> str:
        """주요 주제 추출"""
        # 키워드 기반 주제 추출
        topics = []

        # 부동산/건설 관련
        if any(
            kw in query for kw in ["재개발", "건설", "PF", "유동화", "부동산", "아파트"]
        ):
            topics.append("부동산/건설")

        # 금융 관련
        if any(
            kw in query for kw in ["금융", "은행", "대출", "신용", "유동성", "보증"]
        ):
            topics.append("금융")

        # 기업 관련
        if any(kw in query for kw in ["롯데", "삼성", "현대", "기업", "회사"]):
            topics.append("기업")

        return ", ".join(topics) if topics else "시사"

    def _generate_styled_article(
        self, query: str, style: str, topic: str, tone: str, source_content: str
    ) -> str:
        """스타일에 맞는 글 생성"""

        # 유시민 스타일 (논리적, 날카로운, 풍자적)
        if style == "yoo_si_min":
            return self._generate_yoo_si_min_style(query, topic, tone)

        # 분석/비평 스타일
        if style in ["analysis", "critique", "column"]:
            return self._generate_analysis_style(query, topic, tone)

        # 기본 창작 글
        return self._generate_general_creative(query, topic, tone)

    def _generate_yoo_si_min_style(self, query: str, topic: str, tone: str) -> str:
        """유시민 스타일 글 생성 - 논리적이고 날카로운 비평"""

        # 쿼리에서 핵심 키워드 추출
        keywords = []
        keyword_map = {
            "롯데건설": "롯데건설",
            "유동성": "유동성 위기",
            "신용": "신용 하락",
            "PF": "PF 금융",
            "보증": "신용 보강",
            "재개발": "재개발 사업",
            "건설공제조합": "건설공제조합",
        }

        for key, value in keyword_map.items():
            if key in query:
                keywords.append(value)

        main_subject = keywords[0] if keywords else "해당 사안"

        return f"""# 숨겨진 위기의 민낯 - {main_subject}의 불편한 진실

## 서론: 화려한 포장 아래 감춰진 것들

세상에는 두 종류의 뉴스가 있다. 있는 그대로 전하는 뉴스와, 본질을 교묘하게 숨기는 뉴스다. 최근 발표된 '{main_subject}' 관련 소식을 보면서 나는 후자의 전형을 보았다.

언론은 "PF 유동화" "자본시장형 구조 전환"이라는 그럴듯한 수식어로 이 사안을 포장한다. 그러나 조금만 들여다보면 불편한 진실이 드러난다. **왜 굳이 복수의 신용 보강 장치가 필요했을까?** 이 질문 하나가 모든 것을 말해준다.

## 본론: 문제의 본질

### 1. 시중은행이 외면한 이유

금융기관은 냉정하다. 수익이 보장되면 먼저 뛰어들고, 위험이 감지되면 가장 먼저 발을 뺀다. {main_subject} 사업에 시중은행이 직접 PF 대출을 제공하지 않은 이유가 무엇일까?

답은 간단하다. **신용 리스크가 그들의 기준을 충족하지 못했기 때문이다.**

시공사의 연대보증만으로는 불안하니 건설공제조합의 추가 보증이 필요했고, 그것도 모자라 자산유동화라는 복잡한 금융 구조를 동원해야 했다. 이것이 "금융 구조 고도화"인가, 아니면 **신용 위기의 우회로**인가?

### 2. 건설공제조합 보증의 이면

건설공제조합이 착공 전 PF에 보수적이라는 것은 업계의 상식이다. 그런 그들이 이번에는 보증을 섰다. 왜일까?

공식 설명은 "시공사의 재무건전성"이다. 그러나 진짜 이유는 다르다. 현재 건설업계 전체가 유동성 위기에 직면해 있고, 어디선가 부실이 터지면 도미노처럼 무너질 수 있다는 공포가 있다. **이 보증은 신뢰의 표시가 아니라 위기 관리의 일환**일 수 있다.

### 3. "자본시장형 구조"라는 언어의 함정

"브리지론에서 본 PF로, 다시 자산유동화로"라는 경로를 '금융 구조 고도화'라고 부른다면, 나는 그것을 **'위험의 분산과 전가'**라고 부르겠다.

자산유동화증권(ABS)의 본질은 무엇인가? 위험을 쪼개어 여러 투자자에게 나눠 파는 것이다. 2008년 서브프라임 모기지 사태를 기억하는가? 그때도 "금융 혁신"이라는 이름으로 위험을 포장하고 팔았다.

## 결론: 우리가 물어야 할 질문들

> "사업의 안정성"이라는 말을 들으면 나는 반대로 묻고 싶다. 
> 정말 안정적이라면 왜 이렇게 복잡한 구조가 필요한가?

2026년 착공, 2031년 준공이라는 일정이 순조롭게 진행되기를 바란다. 그러나 그 과정에서 **누가 위험을 지고, 누가 이익을 가져가는지**를 시민들은 알 권리가 있다.

화려한 금융 용어 뒤에 숨겨진 민낯을 직시할 때다. 질문을 멈추지 말아야 한다. 그것이 시민의 권리이자 의무다.

---

*이 글은 건설*금융 구조에 대한 비평적 시각을 담은 것으로, 특정 사업의 성패를 예단하는 것이 아닙니다.*"""

    def _generate_analysis_style(self, query: str, topic: str, tone: str) -> str:
        """분석/비평 스타일 글 생성"""

        return f"""# {topic} 이슈 심층 분석

## 개요

{query[:100]}{"..." if len(query) > 100 else ""}에 대한 분석입니다.

## 현황 분석

### 1. 배경
해당 사안의 배경과 맥락을 살펴보면, 현재 시장 환경에서 주목해야 할 몇 가지 요소가 있습니다.

### 2. 핵심 쟁점
- **재무 구조**: 복잡한 금융 구조의 의미
- **리스크 요인**: 잠재적 위험 요소
- **시장 반응**: 업계와 투자자의 시각

### 3. 전문가 시각
업계 전문가들은 이 사안에 대해 다양한 해석을 내놓고 있습니다. 긍정적 평가와 우려의 목소리가 공존합니다.

## 비판적 검토

{"비판적 관점에서 보면, 다음 사항들을 주목해야 합니다:" if tone == "critical" else "균형 잡힌 시각에서 보면:"}

1. **투명성 문제**: 복잡한 금융 구조가 리스크를 숨기는 것은 아닌지
2. **이해관계 충돌**: 각 당사자의 이익이 어떻게 조정되는지
3. **장기적 영향**: 유사 사례에 미칠 선례적 효과

## 결론

이 사안은 단순히 개별 프로젝트의 문제가 아니라, 현재 {topic} 시장 전체의 구조적 특성을 보여주는 사례입니다. 지속적인 모니터링과 비판적 검토가 필요합니다.

---
*본 분석은 공개된 정보를 바탕으로 작성되었습니다.*"""

    def _generate_general_creative(self, query: str, topic: str, tone: str) -> str:
        """일반 창작 글 생성"""

        return f"""# {topic}에 대한 소고

## 들어가며

{query[:80]}{"..." if len(query) > 80 else ""}

이 주제에 대해 생각을 정리해 보았습니다.

## 본문

### 현재 상황

현재 {topic} 분야에서는 여러 변화가 일어나고 있습니다. 이러한 변화는 다양한 이해관계자들에게 영향을 미치고 있습니다.

### 핵심 논점

1. **첫 번째 관점**: 상황을 긍정적으로 해석하는 시각
2. **두 번째 관점**: 우려와 비판의 시각
3. **균형 잡힌 시각**: 양측의 논점을 종합한 관점

### 나의 생각

{tone == "critical" and "비판적 시각에서 보면, 이 상황은 깊은 우려를 자아냅니다." or "이 상황은 다양한 해석이 가능합니다."}

## 맺으며

어떤 사안이든 다양한 시각에서 바라볼 때 진실에 가까워질 수 있습니다. 계속해서 관심을 갖고 지켜봐야 할 것입니다.

---
*더 자세한 분석이 필요하시면 말씀해 주세요.*"""

    def _generate_code_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess
    ) -> str:
        """코드 생성 응답"""
        lang = analysis.language_preference or "python"
        topics = analysis.key_topics

        response_parts = []

        # 제목
        response_parts.append(
            f"# {analysis.original_query[:50]}{'...' if len(analysis.original_query) > 50 else ''}\n"
        )

        # 요청 이해
        response_parts.append("## 요청 분석\n")
        response_parts.append(f"{thought.understanding}\n\n")

        # 접근 방식
        response_parts.append("## 구현 접근 방식\n")
        key_points = (
            thought.key_points
            if thought.key_points
            else ["요청사항 분석", "코드 구현", "테스트 및 검증"]
        )
        for i, point in enumerate(key_points[:3], 1):
            response_parts.append(f"{i}. {point}\n")
        response_parts.append("\n")

        # 코드 생성
        response_parts.append("## 코드 구현\n\n")
        code = self._generate_code_for_topics(topics, lang, analysis.original_query)
        response_parts.append(code)

        # 코드 설명
        response_parts.append("\n## 코드 설명\n\n")
        response_parts.append(self._generate_code_explanation(topics, lang))

        # 사용 예시
        response_parts.append("\n## 사용 예시\n\n")
        response_parts.append(self._generate_usage_example(topics, lang))

        # 추가 팁
        response_parts.append("\n## 추가 팁\n\n")
        response_parts.append(self._generate_tips(topics))

        return "".join(response_parts)

    def _generate_howto_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess
    ) -> str:
        """How-to 응답 생성 - 구체적인 단계와 코드 포함"""
        response_parts = []
        query_lower = analysis.original_query.lower()

        response_parts.append(f"# {analysis.original_query[:60]}\n\n")

        # 개요
        response_parts.append("## 개요\n\n")
        response_parts.append(f"{thought.understanding}\n\n")

        # Git conflict 관련 (How-to에서도 처리)
        if "conflict" in query_lower or "충돌" in query_lower:
            return self._generate_git_troubleshooting(analysis.original_query)

        # Docker + Node.js 배포 관련
        if "docker" in query_lower and (
            "node" in query_lower or "nodejs" in query_lower
        ):
            return self._generate_docker_nodejs_guide()

        # Docker 관련
        if "docker" in query_lower:
            return self._generate_docker_guide(analysis.original_query)

        # API 관련
        if "api" in query_lower:
            return self._generate_api_guide(analysis)

        # Git 관련
        if "git" in query_lower:
            return self._generate_git_guide(analysis.original_query)

        # React/Next.js 프로젝트 생성
        if "react" in query_lower or "next" in query_lower:
            return self._generate_react_setup_guide(query_lower)

        # Python 가상환경/프로젝트 설정
        if "python" in query_lower and (
            "가상" in query_lower or "venv" in query_lower or "환경" in query_lower
        ):
            return self._generate_python_venv_guide()

        # 데이터베이스 연결
        if (
            "db" in query_lower
            or "데이터베이스" in query_lower
            or "database" in query_lower
        ) and "연결" in query_lower:
            return self._generate_db_connection_guide(query_lower)

        # AWS 배포
        if "aws" in query_lower and ("배포" in query_lower or "deploy" in query_lower):
            return self._generate_aws_deploy_guide()

        # Linux 명령어
        if "linux" in query_lower or "리눅스" in query_lower:
            return self._generate_linux_guide(query_lower)

        # 일반 How-to
        # 사전 준비
        response_parts.append("## 사전 준비\n\n")
        response_parts.append(self._generate_prerequisites(analysis.key_topics))

        # 단계별 가이드 - 항상 코드 포함
        response_parts.append("## 단계별 가이드\n\n")
        steps = self._generate_detailed_steps(
            analysis.key_topics, analysis.original_query
        )
        response_parts.append(steps)

        # 주의사항
        response_parts.append("\n## 주의사항\n\n")
        response_parts.append(self._generate_cautions(analysis.key_topics))

        return "".join(response_parts)

    def _generate_react_setup_guide(self, query: str) -> str:
        """React/Next.js 프로젝트 설정 가이드"""
        if "next" in query:
            return """# Next.js 프로젝트 시작하기

## TL;DR

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app && npm run dev
```

---

## 1단계: 프로젝트 생성

```bash
# 최신 Next.js 14 (App Router) 프로젝트 생성
npx create-next-app@latest my-project

# 선택 옵션:
# [v] Would you like to use TypeScript? -> Yes
# [v] Would you like to use ESLint? -> Yes
# [v] Would you like to use Tailwind CSS? -> Yes
# [v] Would you like to use `src/` directory? -> Yes
# [v] Would you like to use App Router? -> Yes
# [v] Would you like to customize the default import alias? -> No
```

## 2단계: 프로젝트 구조 이해

```
my-project/
|-- src/
|   |-- app/                    # App Router (Next.js 13+)
|   |   |-- layout.tsx          # 루트 레이아웃
|   |   |-- page.tsx            # 홈 페이지 (/)
|   |   |-- globals.css         # 전역 스타일
|   |   +-- api/                # API 라우트
|   |       +-- hello/route.ts
|   +-- components/             # 컴포넌트 폴더 (직접 생성)
|-- public/                     # 정적 파일
|-- package.json
|-- next.config.js
|-- tailwind.config.ts
+-- tsconfig.json
```

## 3단계: 개발 서버 실행

```bash
cd my-project
npm run dev
# -> http://localhost:3000 에서 확인
```

## 4단계: 첫 페이지 작성

**src/app/page.tsx**
```tsx
export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <h1 className="text-4xl font-bold">
        Next.js 14 시작!
      </h1>
      <p className="mt-4 text-gray-600">
        App Router를 사용한 풀스택 React 앱
      </p>
    </main>
  );
}
```

## 5단계: 동적 라우트 추가

**src/app/posts/[id]/page.tsx**
```tsx
interface Props {
  params: { id: string };
}

export default function PostPage({ params }: Props) {
  return (
    <div className="p-8">
      <h1>포스트 #{params.id}</h1>
    </div>
  );
}
```

## 6단계: API 라우트 생성

**src/app/api/users/route.ts**
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const users = [
    { id: 1, name: '김철수' },
    { id: 2, name: '이영희' },
  ];
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: '생성됨', data: body }, { status: 201 });
}
```

## 유용한 명령어

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

## 다음 단계

1. **데이터 페칭**: fetch + Server Components
2. **상태 관리**: Zustand 또는 React Query
3. **인증**: NextAuth.js
4. **배포**: Vercel (권장) 또는 Docker"""

        # React 기본
        return """# React 프로젝트 시작하기

## TL;DR

```bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app && npm install && npm run dev
```

---

## 1단계: 프로젝트 생성 (Vite 권장)

```bash
# Vite + React + TypeScript (가장 빠름)
npm create vite@latest my-app -- --template react-ts

# 또는 Create React App (레거시)
npx create-react-app my-app --template typescript
```

## 2단계: 프로젝트 구조

```
my-app/
|-- src/
|   |-- App.tsx           # 메인 컴포넌트
|   |-- main.tsx          # 진입점
|   |-- App.css
|   |-- index.css
|   +-- components/       # 컴포넌트 폴더 (직접 생성)
|       +-- Button.tsx
|-- public/
|-- package.json
|-- vite.config.ts
+-- tsconfig.json
```

## 3단계: 개발 서버 실행

```bash
cd my-app
npm install
npm run dev
# -> http://localhost:5173 에서 확인
```

## 4단계: 첫 컴포넌트 작성

**src/components/Greeting.tsx**
```tsx
interface Props {
  name: string;
}

export function Greeting({ name }: Props) {
  return (
    <div className="p-4 bg-blue-100 rounded">
      <h2>안녕하세요, {name}님!</h2>
    </div>
  );
}
```

**src/App.tsx**
```tsx
import { useState } from 'react';
import { Greeting } from './components/Greeting';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8">
      <Greeting name="개발자" />
      <button 
        onClick={() => setCount(c => c + 1)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        클릭: {count}
      </button>
    </div>
  );
}

export default App;
```

## 5단계: 필수 라이브러리 설치

```bash
# 라우팅
npm install react-router-dom

# 상태 관리
npm install zustand
# 또는
npm install @tanstack/react-query

# 스타일링
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# HTTP 요청
npm install axios
```

## Tailwind CSS 설정

**tailwind.config.js**
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 빌드 및 배포

```bash
npm run build    # dist/ 폴더에 빌드
npm run preview  # 빌드 결과 미리보기
```"""

    def _generate_python_venv_guide(self) -> str:
        """Python 가상환경 설정 가이드"""
        return """# Python 가상환경 설정 가이드

## TL;DR

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

---

## 1. 가상환경이란?

프로젝트마다 독립적인 Python 패키지 환경을 만들어 **패키지 버전 충돌**을 방지합니다.

## 2. 가상환경 생성

```bash
# 프로젝트 폴더에서
python -m venv venv

# 또는 특정 Python 버전으로
python3.11 -m venv venv
```

## 3. 가상환경 활성화

```bash
# macOS/Linux
source venv/bin/activate

# Windows (CMD)
venv\\Scripts\\activate.bat

# Windows (PowerShell)
venv\\Scripts\\Activate.ps1

# 활성화되면 프롬프트에 (venv) 표시됨
(venv) $ 
```

## 4. 패키지 설치

```bash
# 개별 설치
pip install requests flask pandas

# requirements.txt로 일괄 설치
pip install -r requirements.txt
```

## 5. 의존성 관리

```bash
# 현재 설치된 패키지 목록 저장
pip freeze > requirements.txt

# requirements.txt 예시:
# flask==2.3.0
# requests==2.31.0
# pandas==2.0.3
```

## 6. 프로젝트 구조 예시

```
my-project/
|-- venv/               # 가상환경 (Git에 포함 X)
|-- src/
|   |-- __init__.py
|   +-- main.py
|-- tests/
|-- requirements.txt    # 의존성 목록
|-- requirements-dev.txt # 개발용 의존성
|-- .gitignore
+-- README.md
```

## 7. .gitignore 설정

```gitignore
# 가상환경
venv/
.venv/
env/

# Python
__pycache__/
*.pyc
*.pyo
.pytest_cache/

# IDE
.vscode/
.idea/
```

## 8. 가상환경 비활성화

```bash
deactivate
```

## 추가 도구 (선택)

### Poetry (현대적 패키지 관리)
```bash
pip install poetry
poetry new my-project
poetry add flask
poetry install
```

### pyenv (Python 버전 관리)
```bash
# macOS
brew install pyenv
pyenv install 3.11.0
pyenv local 3.11.0
```

## 주의사항

- [!] 가상환경 폴더(`venv/`)는 Git에 커밋하지 마세요
- [!] `requirements.txt`는 반드시 Git에 포함하세요
- [!] 팀원 간 Python 버전 통일 권장"""

    def _generate_db_connection_guide(self, query: str) -> str:
        """데이터베이스 연결 가이드"""
        if "postgres" in query or "postgresql" in query:
            return self._generate_postgres_guide()
        elif "mongo" in query:
            return self._generate_mongodb_guide()
        elif "mysql" in query:
            return self._generate_mysql_guide()

        # 일반 DB 가이드
        return """# 데이터베이스 연결 가이드

## 주요 데이터베이스별 연결 방법

### 1. PostgreSQL (Python)

```python
import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(
    host="localhost",
    database="mydb",
    user="postgres",
    password="password"
)

with conn.cursor(cursor_factory=RealDictCursor) as cur:
    cur.execute("SELECT * FROM users")
    users = cur.fetchall()

conn.close()
```

### 2. MySQL (Python)

```python
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    database="mydb",
    user="root",
    password="password"
)

cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM users")
users = cursor.fetchall()

conn.close()
```

### 3. MongoDB (Python)

```python
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["mydb"]
users = db.users.find({})

for user in users:
    print(user)

client.close()
```

### 4. SQLite (Python)

```python
import sqlite3

conn = sqlite3.connect("database.db")
conn.row_factory = sqlite3.Row

cursor = conn.cursor()
cursor.execute("SELECT * FROM users")
users = cursor.fetchall()

conn.close()
```

## ORM 사용 (권장)

### SQLAlchemy

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("postgresql://user:pass@localhost/db")
Session = sessionmaker(bind=engine)
session = Session()

users = session.query(User).all()
```

### Prisma (Node.js)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = await prisma.user.findMany();
```

## 환경변수로 연결 정보 관리

```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
# postgresql://user:password@localhost:5432/dbname
```

## 연결 풀링 (프로덕션)

```python
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
)
```"""

    def _generate_postgres_guide(self) -> str:
        """PostgreSQL 연결 가이드"""
        return """# PostgreSQL 연결 가이드

## 1. 설치 및 실행

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Docker
docker run -d --name postgres \\
  -e POSTGRES_PASSWORD=password \\
  -p 5432:5432 \\
  postgres:15
```

## 2. 데이터베이스 생성

```bash
# psql 접속
psql -U postgres

# SQL 명령어
CREATE DATABASE myapp;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE myapp TO myuser;
\\q
```

## 3. Python 연결 (psycopg2)

```bash
pip install psycopg2-binary
```

```python
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

DATABASE_URL = "postgresql://myuser:mypassword@localhost:5432/myapp"

@contextmanager
def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# 사용 예시
with get_db_connection() as conn:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
```

## 4. SQLAlchemy ORM

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine(DATABASE_URL)
Base = declarative_base()
Session = sessionmaker(bind=engine)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    email = Column(String(100), unique=True)

# 테이블 생성
Base.metadata.create_all(engine)

# CRUD
session = Session()
user = User(name="홍길동", email="hong@example.com")
session.add(user)
session.commit()
```

## 5. FastAPI + PostgreSQL

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

app = FastAPI()

def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()
```"""

    def _generate_mongodb_guide(self) -> str:
        """MongoDB 연결 가이드"""
        return """# MongoDB 연결 가이드

## 1. 설치 및 실행

```bash
# Docker (권장)
docker run -d --name mongodb \\
  -p 27017:27017 \\
  -e MONGO_INITDB_ROOT_USERNAME=admin \\
  -e MONGO_INITDB_ROOT_PASSWORD=password \\
  mongo:6

# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

## 2. Python 연결 (pymongo)

```bash
pip install pymongo
```

```python
from pymongo import MongoClient

client = MongoClient("mongodb://admin:password@localhost:27017")
db = client["myapp"]
collection = db["users"]

# Create
user = {"name": "홍길동", "email": "hong@example.com"}
result = collection.insert_one(user)
print(f"Inserted ID: {result.inserted_id}")

# Read
users = collection.find({"name": "홍길동"})
for user in users:
    print(user)

# Update
collection.update_one(
    {"name": "홍길동"},
    {"$set": {"email": "newemail@example.com"}}
)

# Delete
collection.delete_one({"name": "홍길동"})

client.close()
```

## 3. Node.js 연결

```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');

async function main() {
  await client.connect();
  const db = client.db('myapp');
  const users = db.collection('users');
  
  // Insert
  await users.insertOne({ name: '홍길동', email: 'hong@example.com' });
  
  // Find
  const user = await users.findOne({ name: '홍길동' });
  console.log(user);
  
  await client.close();
}

main();
```"""

    def _generate_mysql_guide(self) -> str:
        """MySQL 연결 가이드"""
        return """# MySQL 연결 가이드

## 1. 설치 및 실행

```bash
# Docker
docker run -d --name mysql \\
  -e MYSQL_ROOT_PASSWORD=password \\
  -e MYSQL_DATABASE=myapp \\
  -p 3306:3306 \\
  mysql:8

# macOS
brew install mysql
brew services start mysql
```

## 2. Python 연결

```bash
pip install mysql-connector-python
```

```python
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="myapp"
)

cursor = conn.cursor(dictionary=True)

# Create
cursor.execute(
    "INSERT INTO users (name, email) VALUES (%s, %s)",
    ("홍길동", "hong@example.com")
)
conn.commit()

# Read
cursor.execute("SELECT * FROM users")
users = cursor.fetchall()

conn.close()
```"""

    def _generate_aws_deploy_guide(self) -> str:
        """AWS 배포 가이드"""
        return """# AWS 배포 가이드

## 배포 방식 선택

| 방식 | 특징 | 추천 상황 |
|------|------|----------|
| EC2 | 완전한 제어 | 복잡한 설정 필요 시 |
| Elastic Beanstalk | 관리형 | 빠른 배포 |
| ECS/Fargate | 컨테이너 | Docker 기반 |
| Lambda | 서버리스 | 이벤트 기반 |

## 1. EC2 배포 (기본)

### 1.1 인스턴스 생성
1. AWS Console -> EC2 -> Launch Instance
2. Amazon Linux 2023 또는 Ubuntu 선택
3. 인스턴스 타입: t3.micro (프리티어)
4. 보안 그룹: 22(SSH), 80(HTTP), 443(HTTPS) 허용

### 1.2 SSH 접속
```bash
chmod 400 my-key.pem
ssh -i my-key.pem ec2-user@<public-ip>
```

### 1.3 앱 배포 (Node.js 예시)
```bash
# 패키지 설치
sudo yum update -y
sudo yum install -y nodejs npm git

# 앱 클론
git clone https://github.com/user/app.git
cd app
npm install

# PM2로 실행
sudo npm install -g pm2
pm2 start app.js
pm2 startup
pm2 save
```

## 2. Elastic Beanstalk (권장)

```bash
# EB CLI 설치
pip install awsebcli

# 초기화
eb init -p node.js my-app

# 환경 생성 및 배포
eb create my-env
eb deploy

# URL 열기
eb open
```

## 3. ECS + Fargate (컨테이너)

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### ECR에 이미지 푸시
```bash
# 로그인
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

# 빌드 & 푸시
docker build -t my-app .
docker tag my-app:latest <account>.dkr.ecr.<region>.amazonaws.com/my-app:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/my-app:latest
```

## 비용 최적화 팁

1. **프리티어 활용**: t2.micro/t3.micro 750시간/월 무료
2. **스팟 인스턴스**: 최대 90% 할인
3. **예약 인스턴스**: 장기 사용 시 최대 75% 할인
4. **Auto Scaling**: 트래픽에 따라 자동 조절"""

    def _generate_docker_nodejs_guide(self) -> str:
        """Docker + Node.js 배포 가이드"""
        return """# Docker로 Node.js 앱 배포하기

## 개요

Docker를 사용하면 Node.js 앱을 어떤 환경에서든 동일하게 실행할 수 있습니다.

## 1. 프로젝트 구조

```
my-node-app/
|-- src/
|   +-- index.js
|-- package.json
|-- Dockerfile
|-- docker-compose.yml
+-- .dockerignore
```

## 2. Dockerfile 작성

```dockerfile
# Node.js 공식 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 (캐싱 최적화)
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 앱 실행
CMD ["node", "src/index.js"]
```

## 3. .dockerignore 작성

```
node_modules
npm-debug.log
.git
.gitignore
.env
Dockerfile
docker-compose.yml
```

## 4. docker-compose.yml (선택사항)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  # 데이터베이스가 필요한 경우
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 5. 빌드 및 실행

```bash
# 이미지 빌드
docker build -t my-node-app .

# 컨테이너 실행
docker run -d -p 3000:3000 --name my-app my-node-app

# 또는 docker-compose 사용
docker-compose up -d

# 로그 확인
docker logs my-app

# 컨테이너 상태 확인
docker ps
```

## 6. 프로덕션 배포 팁

### 멀티 스테이지 빌드 (최적화)

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 헬스 체크 추가

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD curl -f http://localhost:3000/health || exit 1
```

## 7. 주의사항

- [!] 민감한 정보는 환경 변수로 관리 (`-e` 또는 `.env`)
- [!] 프로덕션에서는 `npm ci --only=production` 사용
- [!] 로그는 `docker logs`로 확인
- [!] 볼륨 마운트로 데이터 영속화

이제 Node.js 앱을 Docker로 배포할 준비가 되었습니다!"""

    def _generate_linux_guide(self, query: str) -> str:
        """Linux 명령어 가이드"""
        query_lower = query.lower()

        # 파일/디렉토리 관련
        if any(kw in query_lower for kw in ["파일", "디렉토리", "폴더", "ls", "cd"]):
            return self._generate_linux_file_guide()

        # 프로세스 관련
        if any(kw in query_lower for kw in ["프로세스", "ps", "kill", "top"]):
            return self._generate_linux_process_guide()

        # 네트워크 관련
        if any(kw in query_lower for kw in ["네트워크", "포트", "curl", "wget"]):
            return self._generate_linux_network_guide()

        # 권한 관련
        if any(kw in query_lower for kw in ["권한", "chmod", "chown", "sudo"]):
            return self._generate_linux_permission_guide()

        # 기본 가이드
        return """# Linux 명령어 가이드

## 기본 명령어

### 파일/디렉토리 탐색

```bash
# 현재 위치 확인
pwd

# 디렉토리 이동
cd /path/to/dir
cd ..          # 상위 폴더
cd ~           # 홈 디렉토리

# 파일 목록
ls             # 기본 목록
ls -la         # 상세 목록 (숨김 파일 포함)
ls -lh         # 파일 크기 읽기 쉽게
```

### 파일 조작

```bash
# 파일 생성/편집
touch file.txt
nano file.txt
vim file.txt

# 복사/이동/삭제
cp source.txt dest.txt
cp -r dir1/ dir2/      # 폴더 복사
mv old.txt new.txt     # 이동/이름변경
rm file.txt
rm -rf folder/         # 폴더 삭제 (주의!)

# 파일 내용 보기
cat file.txt
head -n 20 file.txt    # 처음 20줄
tail -f log.txt        # 실시간 로그
```

### 검색

```bash
# 파일 찾기
find . -name "*.log"
find /home -type f -size +100M

# 내용 검색
grep "keyword" file.txt
grep -r "pattern" ./     # 재귀 검색
grep -i "case" file.txt  # 대소문자 무시
```

### 프로세스 관리

```bash
# 프로세스 확인
ps aux
top
htop

# 프로세스 종료
kill PID
kill -9 PID            # 강제 종료
killall process_name

# 백그라운드 실행
command &
nohup command &        # 터미널 종료 후에도 유지
```

### 권한 관리

```bash
# 권한 변경
chmod 755 file.sh      # rwxr-xr-x
chmod +x script.sh     # 실행 권한 추가

# 소유자 변경
chown user:group file.txt

# 관리자 권한
sudo command
sudo -i                # root 쉘
```

### 네트워크

```bash
# 네트워크 상태
ip addr
netstat -tulpn
ss -tulpn

# 포트 확인
lsof -i :8080

# 다운로드
curl -O url
wget url
```

### 시스템 정보

```bash
# 시스템 정보
uname -a
df -h              # 디스크 용량
free -h            # 메모리 사용량
du -sh folder/     # 폴더 크기
```

더 자세한 내용이 필요하시면 특정 주제를 말씀해주세요!"""

    def _generate_linux_file_guide(self) -> str:
        """Linux 파일/디렉토리 가이드"""
        return """# Linux 파일/디렉토리 명령어

## 탐색

```bash
pwd                    # 현재 위치
cd /path/to/dir        # 이동
cd ..                  # 상위 폴더
cd ~                   # 홈 디렉토리
cd -                   # 이전 디렉토리
```

## 목록 보기

```bash
ls                     # 기본
ls -l                  # 상세 (권한, 크기)
ls -la                 # 숨김 파일 포함
ls -lh                 # 읽기 쉬운 크기
ls -lt                 # 시간순 정렬
ls -lS                 # 크기순 정렬
```

## 파일 조작

```bash
# 생성
touch file.txt
mkdir folder
mkdir -p a/b/c         # 중첩 폴더

# 복사
cp source.txt dest.txt
cp -r dir1/ dir2/      # 폴더 복사

# 이동/이름변경
mv old.txt new.txt
mv file.txt /new/path/

# 삭제
rm file.txt
rm -rf folder/         # 폴더 삭제 ([!] 주의)
rmdir empty_folder     # 빈 폴더만
```

## 파일 내용

```bash
cat file.txt           # 전체 출력
head -n 20 file.txt    # 처음 20줄
tail -n 20 file.txt    # 마지막 20줄
tail -f log.txt        # 실시간 추적
less file.txt          # 페이지 단위
wc -l file.txt         # 줄 수
```

## 검색

```bash
# 파일명으로 찾기
find . -name "*.log"
find /home -name "config*"
find . -type d -name "test"   # 디렉토리만

# 내용으로 찾기
grep "error" file.txt
grep -r "pattern" ./
grep -i "CASE" file.txt       # 대소문자 무시
grep -n "text" file.txt       # 줄 번호 포함
```

## 압축

```bash
# tar
tar -cvf archive.tar files/   # 압축
tar -xvf archive.tar          # 해제
tar -czvf archive.tar.gz dir/ # gzip 압축
tar -xzvf archive.tar.gz      # gzip 해제

# zip
zip -r archive.zip folder/
unzip archive.zip
```"""

    def _generate_linux_process_guide(self) -> str:
        """Linux 프로세스 가이드"""
        return """# Linux 프로세스 관리

## 프로세스 확인

```bash
# 모든 프로세스
ps aux

# 특정 프로세스 찾기
ps aux | grep nginx
pgrep -l nginx

# 실시간 모니터링
top
htop                   # 더 좋은 UI (설치 필요)
```

## 프로세스 종료

```bash
# 정상 종료
kill PID
kill -15 PID           # SIGTERM (기본)

# 강제 종료
kill -9 PID            # SIGKILL
kill -KILL PID

# 이름으로 종료
killall nginx
pkill -f "python app.py"
```

## 백그라운드 실행

```bash
# 백그라운드로 실행
command &

# 터미널 종료 후에도 유지
nohup command &
nohup python app.py > output.log 2>&1 &

# 현재 작업 백그라운드로
Ctrl+Z               # 일시 중지
bg                   # 백그라운드 전환
fg                   # 포그라운드 복귀

# 작업 목록
jobs
```

## 시스템 리소스

```bash
# CPU/메모리 사용량
top
htop
free -h              # 메모리

# 디스크
df -h                # 디스크 용량
du -sh folder/       # 폴더 크기
iostat               # I/O 통계
```

## 서비스 관리 (systemd)

```bash
# 서비스 상태
systemctl status nginx
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl enable nginx   # 부팅 시 자동 시작
systemctl disable nginx

# 로그 확인
journalctl -u nginx -f
```"""

    def _generate_linux_network_guide(self) -> str:
        """Linux 네트워크 가이드"""
        return """# Linux 네트워크 명령어

## 네트워크 정보

```bash
# IP 주소 확인
ip addr
ip a
ifconfig             # 구버전

# 라우팅 테이블
ip route
route -n
```

## 포트 확인

```bash
# 열린 포트 확인
netstat -tulpn
ss -tulpn

# 특정 포트 사용 프로세스
lsof -i :8080
fuser 8080/tcp

# 포트 열려있는지 확인
nc -zv localhost 8080
```

## 연결 테스트

```bash
# Ping
ping google.com
ping -c 4 192.168.1.1

# DNS 조회
nslookup google.com
dig google.com

# 경로 추적
traceroute google.com
```

## 다운로드

```bash
# curl
curl https://example.com
curl -O https://example.com/file.zip
curl -o myfile.zip https://example.com/file.zip
curl -I https://example.com     # 헤더만

# wget
wget https://example.com/file.zip
wget -O output.zip https://example.com/file.zip
wget -c url                     # 이어받기
```

## 방화벽 (ufw)

```bash
# 상태 확인
sudo ufw status

# 포트 열기/닫기
sudo ufw allow 80
sudo ufw allow 443/tcp
sudo ufw deny 22
sudo ufw delete allow 80

# 활성화/비활성화
sudo ufw enable
sudo ufw disable
```"""

    def _generate_linux_permission_guide(self) -> str:
        """Linux 권한 가이드"""
        return """# Linux 권한 관리

## 권한 이해

```
-rwxr-xr-x  1  user  group  4096  Jan 1 12:00  file.txt
|+++++++++
| |  |  +-- 기타 사용자 (r-x = 5)
| |  +----- 그룹 (r-x = 5)
| +-------- 소유자 (rwx = 7)
+---------- 파일 타입 (- = 파일, d = 디렉토리)

r = 읽기 (4)
w = 쓰기 (2)
x = 실행 (1)
```

## chmod - 권한 변경

```bash
# 숫자 방식
chmod 755 file.sh    # rwxr-xr-x
chmod 644 file.txt   # rw-r--r--
chmod 600 secret.key # rw-------

# 기호 방식
chmod +x script.sh   # 실행 권한 추가
chmod u+w file.txt   # 소유자에 쓰기 추가
chmod g-w file.txt   # 그룹에서 쓰기 제거
chmod o-rwx file.txt # 기타에서 모든 권한 제거

# 재귀적 적용
chmod -R 755 folder/
```

## 자주 쓰는 권한

| 권한 | 숫자 | 용도 |
|------|------|------|
| rwxr-xr-x | 755 | 실행 파일, 폴더 |
| rw-r--r-- | 644 | 일반 파일 |
| rw------- | 600 | 비밀 파일 |
| rwx------ | 700 | 개인 폴더 |

## chown - 소유자 변경

```bash
# 소유자 변경
chown user file.txt
chown user:group file.txt

# 재귀적 변경
chown -R user:group folder/
```

## sudo - 관리자 권한

```bash
# 명령어에 관리자 권한
sudo apt update
sudo systemctl restart nginx

# root 쉘
sudo -i
sudo su

# 다른 사용자로 실행
sudo -u postgres psql
```"""

    def _generate_docker_guide(self, query: str) -> str:
        """Docker 가이드 - 설치 또는 사용법"""
        query_lower = query.lower()

        # 설치 방법 요청
        if "설치" in query_lower or "install" in query_lower:
            return self._generate_docker_install_guide()

        return """# Docker 시작하기

## 기본 개념

Docker는 애플리케이션을 컨테이너로 패키징하여 어디서든 실행할 수 있게 합니다.

## 필수 명령어

```bash
# 이미지 다운로드
docker pull nginx

# 컨테이너 실행
docker run -d -p 8080:80 nginx

# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인
docker ps -a

# 컨테이너 중지/시작/삭제
docker stop <container_id>
docker start <container_id>
docker rm <container_id>

# 이미지 목록/삭제
docker images
docker rmi <image_id>

# 로그 확인
docker logs <container_id>

# 컨테이너 내부 접속
docker exec -it <container_id> /bin/sh
```

## Dockerfile 기본 예시

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
```

## docker-compose 기본 예시

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
```

```bash
# docker-compose 실행
docker-compose up -d

# 중지
docker-compose down
```

더 구체적인 사용 사례가 있으시면 말씀해주세요!"""

    def _generate_api_guide(self, analysis: QueryAnalysis) -> str:
        """API 가이드"""
        lang = analysis.language_preference or "python"

        if lang == "python":
            return """# REST API 만들기 (Python FastAPI)

## 설치

```bash
pip install fastapi uvicorn
```

## 기본 API 코드

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="My API")

# 데이터 모델
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    price: float

# 임시 데이터
items = []

@app.get("/items", response_model=List[Item])
def get_items():
    return items

@app.post("/items", response_model=Item)
def create_item(item: Item):
    item.id = len(items) + 1
    items.append(item)
    return item

@app.get("/items/{item_id}")
def get_item(item_id: int):
    for item in items:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Not found")
```

## 실행

```bash
uvicorn main:app --reload
```

API 문서: http://localhost:5002/api/docs
"""
        else:
            return """# REST API 만들기 (Node.js Express)

## 설치

```bash
npm init -y
npm install express
```

## 기본 API 코드

```javascript
const express = require('express');
const app = express();
app.use(express.json());

let items = [];

app.get('/items', (req, res) => {
    res.json(items);
});

app.post('/items', (req, res) => {
    const item = { id: items.length + 1, ...req.body };
    items.push(item);
    res.status(201).json(item);
});

app.get('/items/:id', (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## 실행

```bash
node app.js
```
"""

    def _generate_docker_install_guide(self) -> str:
        """Docker 설치 가이드"""
        return """# Docker 설치 가이드

## OS별 설치 방법

### 1. macOS

**Docker Desktop 설치 (권장)**

```bash
# Homebrew로 설치
brew install --cask docker

# 또는 공식 사이트에서 다운로드
# https://www.docker.com/products/docker-desktop
```

설치 후:
1. Applications에서 Docker 실행
2. 메뉴바에서 Docker 아이콘 확인
3. 터미널에서 `docker --version` 확인

---

### 2. Windows

**Docker Desktop 설치**

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) 다운로드
2. 설치 파일 실행
3. WSL 2 백엔드 사용 (권장)

**사전 요구사항:**
- Windows 10/11 Pro, Enterprise, Education
- WSL 2 활성화

```powershell
# WSL 2 설치 (관리자 권한)
wsl --install
```

---

### 3. Ubuntu/Debian

```bash
# 기존 버전 제거
sudo apt remove docker docker-engine docker.io containerd runc

# 필수 패키지 설치
sudo apt update
sudo apt install ca-certificates curl gnupg lsb-release

# Docker GPG 키 추가
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Docker 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 사용자를 docker 그룹에 추가 (sudo 없이 사용)
sudo usermod -aG docker $USER
newgrp docker
```

---

### 4. CentOS/RHEL

```bash
# 기존 버전 제거
sudo yum remove docker docker-client docker-common docker-engine

# 필수 패키지 설치
sudo yum install -y yum-utils

# Docker 저장소 추가
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Docker 설치
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker 시작
sudo systemctl start docker
sudo systemctl enable docker

# 사용자 그룹 추가
sudo usermod -aG docker $USER
```

---

## 설치 확인

```bash
# Docker 버전 확인
docker --version
# Docker version 24.0.x, build xxxxx

# Docker Compose 버전 확인
docker compose version

# Hello World 테스트
docker run hello-world
```

## 문제 해결

| 문제 | 해결 방법 |
|------|----------|
| permission denied | `sudo usermod -aG docker $USER` 후 재로그인 |
| Cannot connect to Docker daemon | Docker 서비스 시작: `sudo systemctl start docker` |
| WSL 2 설치 필요 (Windows) | `wsl --install` 실행 |

설치에 문제가 있으시면 구체적인 에러 메시지를 알려주세요!"""

    def _generate_git_guide(self, query: str) -> str:
        """Git 가이드 - 상황별 상세 가이드"""
        query_lower = query.lower()

        # 브랜치 관련
        if "브랜치" in query_lower or "branch" in query_lower:
            return self._generate_git_branch_guide()

        # 되돌리기/취소
        if any(kw in query_lower for kw in ["되돌", "취소", "reset", "revert", "undo"]):
            return self._generate_git_undo_guide()

        # 병합/머지
        if any(kw in query_lower for kw in ["병합", "머지", "merge", "rebase"]):
            return self._generate_git_merge_guide()

        # 커밋 관련
        if "커밋" in query_lower or "commit" in query_lower:
            return self._generate_git_commit_guide()

        # 기본 가이드
        return """# Git 사용 가이드

## 기본 설정

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## 저장소 시작

```bash
# 새 저장소 초기화
git init

# 원격 저장소 복제
git clone https://github.com/user/repo.git
```

## 기본 워크플로우

```bash
# 변경사항 확인
git status

# 파일 추가
git add .                  # 모든 파일
git add filename.txt       # 특정 파일

# 커밋
git commit -m "커밋 메시지"

# 원격에 푸시
git push origin main
```

## 브랜치 작업

```bash
# 브랜치 생성 및 전환
git checkout -b feature/new-feature

# 브랜치 전환
git checkout main

# 병합
git merge feature/new-feature

# 브랜치 삭제
git branch -d feature/new-feature
```

## 되돌리기

```bash
# 스테이징 취소
git reset HEAD file.txt

# 마지막 커밋 수정
git commit --amend

# 특정 커밋으로 되돌리기
git revert <commit_hash>
```

## 유용한 명령어

```bash
# 커밋 히스토리
git log --oneline

# 변경사항 비교
git diff

# 원격 업데이트 가져오기
git fetch origin
git pull origin main
```
"""

    def _generate_git_branch_guide(self) -> str:
        """Git 브랜치 가이드"""
        return """# Git 브랜치 완벽 가이드

## 브랜치란?

브랜치는 독립적인 작업 공간입니다. 메인 코드를 건드리지 않고 새 기능을 개발할 수 있습니다.

## 기본 명령어

```bash
# 브랜치 목록 보기
git branch              # 로컬 브랜치
git branch -r           # 원격 브랜치
git branch -a           # 모든 브랜치

# 브랜치 생성
git branch feature/login

# 브랜치 전환
git checkout feature/login
# 또는 (Git 2.23+)
git switch feature/login

# 생성 + 전환 한 번에
git checkout -b feature/login
git switch -c feature/login
```

## 브랜치 네이밍 컨벤션

```
feature/기능명     # 새 기능
bugfix/버그명      # 버그 수정
hotfix/긴급수정    # 긴급 수정
release/버전       # 릴리스 준비
```

## 브랜치 병합

```bash
# main으로 전환 후 병합
git checkout main
git merge feature/login

# Fast-forward 병합 방지 (병합 커밋 생성)
git merge --no-ff feature/login
```

## 브랜치 삭제

```bash
# 로컬 브랜치 삭제
git branch -d feature/login      # 병합된 브랜치
git branch -D feature/login      # 강제 삭제

# 원격 브랜치 삭제
git push origin --delete feature/login
```

## 원격 브랜치 추적

```bash
# 원격 브랜치 가져오기
git fetch origin

# 원격 브랜치를 로컬에서 추적
git checkout -b feature/login origin/feature/login
# 또는
git checkout --track origin/feature/login
```

## Git Flow 워크플로우

```
main -----------------------------
  |
  +-- develop --------------------
        |
        |-- feature/A --+
        |               | (merge)
        |-- feature/B --+
        |
        +-- release/1.0 ---------
```

더 자세한 내용이 필요하시면 말씀해주세요!"""

    def _generate_git_undo_guide(self) -> str:
        """Git 되돌리기 가이드"""
        return """# Git 되돌리기 완벽 가이드

## 상황별 되돌리기 방법

### 1. 아직 스테이징하지 않은 변경사항 취소

```bash
# 특정 파일 되돌리기
git checkout -- filename.txt
# 또는 (Git 2.23+)
git restore filename.txt

# 모든 변경사항 되돌리기
git checkout -- .
git restore .
```

### 2. 스테이징된 파일 언스테이징

```bash
# 특정 파일 언스테이징
git reset HEAD filename.txt
# 또는 (Git 2.23+)
git restore --staged filename.txt

# 모든 파일 언스테이징
git reset HEAD
```

### 3. 마지막 커밋 수정

```bash
# 메시지만 수정
git commit --amend -m "새로운 메시지"

# 파일 추가 후 커밋에 포함
git add forgotten_file.txt
git commit --amend --no-edit
```

[!] **주의**: 이미 push한 커밋은 amend하면 안 됩니다!

### 4. 커밋 되돌리기 (안전)

```bash
# 특정 커밋 취소 (새 커밋 생성)
git revert <commit_hash>

# 여러 커밋 취소
git revert <older_commit>..<newer_commit>

# 병합 커밋 취소
git revert -m 1 <merge_commit_hash>
```

### 5. 커밋 되돌리기 (위험)

```bash
# 커밋 취소, 변경사항 스테이징에 유지
git reset --soft HEAD~1

# 커밋 취소, 변경사항 워킹에 유지
git reset --mixed HEAD~1  # 기본값

# 커밋 + 변경사항 모두 삭제 [!]
git reset --hard HEAD~1
```

## 요약표

| 상황 | 명령어 |
|------|--------|
| 파일 변경 취소 | `git restore <file>` |
| 스테이징 취소 | `git restore --staged <file>` |
| 커밋 메시지 수정 | `git commit --amend` |
| 커밋 취소 (안전) | `git revert <hash>` |
| 커밋 취소 (위험) | `git reset --hard <hash>` |

## 긴급 복구

```bash
# 실수로 reset --hard 했을 때
git reflog                    # 히스토리 확인
git reset --hard HEAD@{1}     # 복구
```"""

    def _generate_git_merge_guide(self) -> str:
        """Git 병합 가이드"""
        return """# Git 병합 (Merge/Rebase) 가이드

## Merge vs Rebase

| 특성 | Merge | Rebase |
|------|-------|--------|
| 히스토리 | 병합 커밋 생성 | 선형 히스토리 |
| 안전성 | 안전 | 주의 필요 |
| 협업 | 권장 | 개인 브랜치만 |

## 기본 병합 (Merge)

```bash
# feature 브랜치를 main에 병합
git checkout main
git merge feature/login

# 병합 커밋 강제 생성
git merge --no-ff feature/login
```

## Rebase

```bash
# feature 브랜치를 main 위로 재배치
git checkout feature/login
git rebase main

# 대화형 리베이스 (커밋 정리)
git rebase -i HEAD~3
```

## 충돌 해결

```bash
# 충돌 발생 시
<<<<<<< HEAD
현재 브랜치 내용
=======
병합하려는 브랜치 내용
>>>>>>> feature/login

# 1. 파일 수정하여 충돌 해결
# 2. 스테이징
git add .
# 3. 병합 완료
git commit  # merge의 경우
git rebase --continue  # rebase의 경우

# 병합 취소
git merge --abort
git rebase --abort
```

## 실무 팁

1. **공유 브랜치(main, develop)는 merge 사용**
2. **개인 feature 브랜치는 rebase 가능**
3. **이미 push한 커밋은 rebase 금지**
4. **충돌이 복잡하면 merge가 더 안전**

더 궁금한 점이 있으시면 말씀해주세요!"""

    def _generate_git_commit_guide(self) -> str:
        """Git 커밋 가이드"""
        return """# Git 커밋 가이드

## 기본 커밋

```bash
# 변경사항 확인
git status
git diff

# 스테이징
git add .                    # 전체
git add src/                 # 특정 폴더
git add *.js                 # 패턴 매칭

# 커밋
git commit -m "커밋 메시지"

# 스테이징 + 커밋 (추적 파일만)
git commit -am "메시지"
```

## 좋은 커밋 메시지

### 형식
```
<타입>: <제목>

<본문>

<꼬리말>
```

### 타입
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 포맷팅, 세미콜론 등
- `refactor`: 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드, 설정 변경

### 예시
```
feat: 사용자 로그인 기능 추가

- JWT 토큰 기반 인증 구현
- 로그인/로그아웃 API 추가
- 세션 관리 미들웨어 추가

Closes #123
```

## 커밋 수정

```bash
# 마지막 커밋 메시지 수정
git commit --amend -m "새 메시지"

# 마지막 커밋에 파일 추가
git add forgotten.txt
git commit --amend --no-edit
```

## 커밋 히스토리 확인

```bash
# 간단히 보기
git log --oneline

# 그래프로 보기
git log --oneline --graph --all

# 특정 파일 히스토리
git log --follow filename.txt

# 변경 내용과 함께
git log -p
```"""

    def _generate_detailed_steps(self, topics: List[str], query: str) -> str:
        """상세 단계 생성"""
        steps = []
        lang = "python"  # 기본값

        if "javascript" in topics or "nodejs" in topics:
            lang = "javascript"

        steps.append("### 1단계: 환경 설정\n\n")
        if lang == "python":
            steps.append("""```bash
# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# 필요한 패키지 설치
pip install -r requirements.txt
```\n\n""")
        else:
            steps.append("""```bash
# 프로젝트 초기화
npm init -y

# 필요한 패키지 설치
npm install
```\n\n""")

        steps.append("### 2단계: 프로젝트 구조 생성\n\n")
        steps.append("""```
project/
|-- src/
|   +-- main.py (또는 index.js)
|-- tests/
|-- requirements.txt (또는 package.json)
+-- README.md
```\n\n""")

        steps.append("### 3단계: 핵심 코드 작성\n\n")
        steps.append("프로젝트의 핵심 기능을 구현합니다.\n\n")

        steps.append("### 4단계: 테스트\n\n")
        steps.append("""```bash
# 테스트 실행
pytest  # Python
# 또는
npm test  # Node.js
```\n\n""")

        steps.append("### 5단계: 실행\n\n")
        if lang == "python":
            steps.append("```bash\npython src/main.py\n```\n")
        else:
            steps.append("```bash\nnode src/index.js\n```\n")

        return "".join(steps)

    def _generate_explanation_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess
    ) -> str:
        """설명 응답 생성 - 깊이 있는 다층적 분석"""
        response_parts = []
        main_topic = analysis.key_topics[0] if analysis.key_topics else "general"
        query = analysis.original_query

        # 제목
        response_parts.append(f"# {self._get_topic_title(main_topic)}\n\n")

        # 한 줄 요약
        response_parts.append("## TL;DR (한 줄 요약)\n\n")
        response_parts.append(f"> {self._get_one_line_summary(main_topic)}\n\n")

        # 핵심 정의
        response_parts.append("## 핵심 개념\n\n")
        response_parts.append(self._get_topic_definition(main_topic))
        response_parts.append("\n\n")

        # 왜 중요한가?
        response_parts.append("## 왜 중요한가?\n\n")
        response_parts.append(self._get_topic_importance(main_topic))
        response_parts.append("\n")

        # 주요 특징
        response_parts.append("## 주요 특징\n\n")
        response_parts.append(self._get_topic_features(main_topic))

        # 작동 원리 (기술 주제인 경우)
        if analysis.topic_category != TopicCategory.NON_TECH:
            response_parts.append("\n## 작동 원리\n\n")
            response_parts.append(self._get_topic_mechanism(main_topic))

        # 코드 예시 (필요한 경우)
        if analysis.requires_code or analysis.requires_example:
            response_parts.append("\n## 코드 예시\n\n")
            lang = analysis.language_preference or "python"
            response_parts.append(self._generate_simple_example(main_topic, lang))

        # 활용 사례
        response_parts.append("\n## 실제 활용 사례\n\n")
        response_parts.append(self._get_use_cases(main_topic))

        # 흔한 오해와 주의점
        response_parts.append("\n## 흔한 오해와 주의점\n\n")
        response_parts.append(self._get_common_mistakes(main_topic))

        # 관련 개념
        response_parts.append("\n## 관련 개념\n\n")
        response_parts.append(self._get_related_concepts(main_topic))

        # 더 알아보기
        response_parts.append("\n## 더 알아보기\n\n")
        response_parts.append(self._get_further_learning(main_topic))

        return "".join(response_parts)

    def _get_one_line_summary(self, topic: str) -> str:
        """한 줄 요약 생성 - 확장된 주제 지원"""
        summaries = {
            "python": "읽기 쉽고 생산성 높은 범용 프로그래밍 언어로, 웹/AI/데이터 분야에서 널리 사용됩니다.",
            "javascript": "웹의 표준 언어로, 브라우저와 서버 양쪽에서 동작하는 유일한 언어입니다.",
            "react": "Facebook이 만든 UI 라이브러리로, 컴포넌트 기반의 선언적 프로그래밍을 지원합니다.",
            "typescript": "JavaScript에 정적 타입을 추가한 언어로, 대규모 프로젝트의 안정성을 높여줍니다.",
            "docker": "애플리케이션을 컨테이너로 패키징하여 어디서든 동일하게 실행할 수 있게 합니다.",
            "git": "분산 버전 관리 시스템으로, 코드 변경 이력을 추적하고 협업을 가능하게 합니다.",
            "api": "서로 다른 소프트웨어가 통신하기 위한 인터페이스로, 기능을 외부에 노출합니다.",
            "nextjs": "React 기반 풀스택 프레임워크로, SSR/SSG와 라우팅을 내장 지원합니다.",
            "vue": "점진적 채택 가능한 프론트엔드 프레임워크로, 학습 곡선이 완만합니다.",
            "nodejs": "JavaScript를 서버에서 실행할 수 있게 하는 런타임 환경입니다.",
            "fastapi": "Python의 현대적 웹 프레임워크로, 자동 문서화와 높은 성능이 특징입니다.",
            "django": "Python의 배터리 포함 웹 프레임워크로, 관리자 패널이 내장되어 있습니다.",
            "kubernetes": "컨테이너 오케스트레이션 플랫폼으로, 대규모 배포와 자동 스케일링을 지원합니다.",
            "redis": "인메모리 데이터 스토어로, 캐싱과 세션 관리에 주로 사용됩니다.",
            "postgresql": "강력한 오픈소스 관계형 데이터베이스로, 복잡한 쿼리와 JSON 지원이 우수합니다.",
            "mongodb": "문서 기반 NoSQL 데이터베이스로, 유연한 스키마가 특징입니다.",
            "graphql": "API 쿼리 언어로, 필요한 데이터만 정확히 요청할 수 있습니다.",
            "restapi": "HTTP를 기반으로 하는 API 아키텍처로, 웹 API의 표준입니다.",
            "cicd": "코드 변경을 자동으로 빌드, 테스트, 배포하는 자동화 파이프라인입니다.",
            "aws": "Amazon의 클라우드 컴퓨팅 플랫폼으로, 200개 이상의 서비스를 제공합니다.",
            "linux": "오픈소스 운영체제로, 서버 환경의 표준입니다.",
        }
        return summaries.get(
            topic.lower(), f"{topic}은(는) 소프트웨어 개발에서 중요한 개념입니다."
        )

    def _get_topic_importance(self, topic: str) -> str:
        """주제의 중요성 설명 - 확장"""
        importance = {
            "python": """1. **낮은 진입 장벽**: 문법이 간결하여 프로그래밍 입문에 적합
2. **풍부한 생태계**: pip으로 설치 가능한 수십만 개의 라이브러리
3. **다양한 적용 분야**: 웹, AI/ML, 데이터 분석, 자동화 등
4. **높은 수요**: 전 세계적으로 가장 인기 있는 언어 중 하나""",
            "javascript": """1. **웹의 필수 언어**: 브라우저에서 동작하는 유일한 프로그래밍 언어
2. **풀스택 개발**: Node.js로 서버 개발까지 가능
3. **거대한 생태계**: npm의 100만+ 패키지
4. **지속적 발전**: ES6+ 문법으로 현대적 프로그래밍 지원""",
            "react": """1. **컴포넌트 재사용성**: 한 번 만든 UI를 여러 곳에서 재사용
2. **가상 DOM**: 효율적인 렌더링으로 성능 최적화
3. **대규모 커뮤니티**: 풍부한 자료와 서드파티 라이브러리
4. **취업 시장**: 프론트엔드 개발자에게 가장 많이 요구되는 기술""",
            "typescript": """1. **타입 안정성**: 컴파일 타임에 오류 발견으로 버그 감소
2. **IDE 지원**: 자동완성, 리팩토링 등 개발 경험 향상
3. **대규모 프로젝트**: 팀 협업과 코드 유지보수에 필수
4. **업계 표준**: 대부분의 현대 프로젝트에서 사용""",
            "docker": """1. **환경 일관성**: "내 컴퓨터에선 되는데" 문제 해결
2. **빠른 배포**: 이미지 기반으로 신속한 배포 가능
3. **자원 효율**: VM 대비 가벼운 격리 환경
4. **마이크로서비스**: 서비스별 독립 배포의 기반""",
            "git": """1. **이력 관리**: 모든 변경사항 추적 및 복구 가능
2. **협업 필수**: 팀 프로젝트의 표준 도구
3. **브랜치 전략**: 병렬 개발과 안전한 실험
4. **CI/CD 연동**: 자동화 파이프라인의 시작점""",
            "nextjs": """1. **풀스택 개발**: 프론트엔드와 백엔드를 하나의 프로젝트로
2. **SEO 최적화**: SSR/SSG로 검색엔진 친화적
3. **성능 최적화**: 이미지, 폰트, 스크립트 자동 최적화
4. **Vercel 통합**: 간편한 배포와 호스팅""",
            "fastapi": """1. **높은 성능**: Starlette + Pydantic 기반 고성능
2. **자동 문서화**: Swagger UI, ReDoc 자동 생성
3. **타입 힌팅**: Python 타입으로 검증과 문서화
4. **비동기 지원**: async/await 네이티브 지원""",
            "kubernetes": """1. **자동 스케일링**: 트래픽에 따른 자동 확장/축소
2. **자가 치유**: 실패한 컨테이너 자동 재시작
3. **서비스 디스커버리**: 내부 DNS로 서비스 간 통신
4. **업계 표준**: 클라우드 네이티브의 사실상 표준""",
            "postgresql": """1. **데이터 무결성**: ACID 완벽 지원
2. **확장성**: 파티셔닝, 복제, JSON 지원
3. **풍부한 기능**: 윈도우 함수, CTE, 전문 검색
4. **오픈소스**: 라이선스 비용 없이 엔터프라이즈 기능""",
            "redis": """1. **초고속 성능**: 인메모리로 밀리초 응답
2. **다양한 자료구조**: String, Hash, List, Set, Sorted Set
3. **캐싱 표준**: 세션, 캐시, 실시간 순위 등
4. **Pub/Sub**: 실시간 메시징 지원""",
        }
        return importance.get(
            topic.lower(),
            f"""1. **실무 활용도**: 현업에서 자주 사용되는 핵심 기술
2. **문제 해결력**: 특정 유형의 문제를 효과적으로 해결
3. **확장성**: 다른 기술과 결합하여 시너지 창출
4. **커리어 가치**: 이 기술을 알면 경쟁력 향상""",
        )

    def _get_common_mistakes(self, topic: str) -> str:
        """흔한 오해와 주의점 - 확장"""
        mistakes = {
            "python": """- [X] **오해**: "Python은 느리니까 실무에서 못 쓴다"
  - [O] **실제**: 대부분의 경우 I/O 바운드이며, 필요시 C 확장이나 PyPy 사용 가능

- [X] **오해**: "들여쓰기 강제가 불편하다"
  - [O] **실제**: 오히려 일관된 코드 스타일을 강제하여 가독성 향상

- [!] **주의점**: 전역 인터프리터 락(GIL)으로 CPU 바운드 멀티스레딩에 제한""",
            "javascript": """- [X] **오해**: "JavaScript는 장난감 언어다"
  - [O] **실제**: 현대 JS는 ES6+, TypeScript와 함께 대규모 앱 개발에 적합

- [X] **오해**: "브라우저에서만 쓸 수 있다"
  - [O] **실제**: Node.js로 서버, Electron으로 데스크톱 앱 개발 가능

- [!] **주의점**: 동적 타입으로 인한 런타임 에러 주의 (TypeScript 권장)""",
            "react": """- [X] **오해**: "React가 프레임워크다"
  - [O] **실제**: React는 UI 라이브러리, 라우팅/상태관리는 별도 필요

- [X] **오해**: "클래스 컴포넌트를 알아야 한다"
  - [O] **실제**: 함수형 컴포넌트 + Hooks가 현재 표준

- [!] **주의점**: 불필요한 리렌더링 방지를 위한 최적화 필요""",
            "typescript": """- [X] **오해**: "TypeScript는 JavaScript와 완전히 다른 언어다"
  - [O] **실제**: TypeScript는 JavaScript의 상위 집합, 모든 JS 코드가 유효한 TS

- [X] **오해**: "타입을 전부 명시해야 한다"
  - [O] **실제**: 타입 추론이 강력해서 필요한 곳만 명시

- [!] **주의점**: any 타입 남용 시 TypeScript의 이점 상실""",
            "docker": """- [X] **오해**: "Docker는 가상 머신이다"
  - [O] **실제**: 컨테이너는 호스트 커널을 공유하는 격리 환경

- [X] **오해**: "Docker만 있으면 운영 준비 완료"
  - [O] **실제**: 프로덕션에는 오케스트레이션(K8s 등) 필요

- [!] **주의점**: 이미지 크기와 레이어 관리 필요""",
            "git": """- [X] **오해**: "git pull과 git fetch가 같다"
  - [O] **실제**: fetch는 가져오기만, pull은 fetch + merge

- [X] **오해**: "커밋은 언제든 수정 가능하다"
  - [O] **실제**: push한 커밋 수정은 협업자에게 문제 발생

- [!] **주의점**: force push는 공유 브랜치에서 절대 금지""",
            "nextjs": """- [X] **오해**: "Next.js는 React를 대체한다"
  - [O] **실제**: Next.js는 React 위에 구축된 프레임워크

- [X] **오해**: "모든 페이지를 SSR로 해야 한다"
  - [O] **실제**: SSG, ISR, CSR 중 적절한 전략 선택

- [!] **주의점**: App Router와 Pages Router 혼용 주의""",
            "fastapi": """- [X] **오해**: "FastAPI는 Django처럼 풀스택이다"
  - [O] **실제**: FastAPI는 API 특화, ORM/인증은 별도 구성

- [X] **오해**: "async로 모든 게 빨라진다"
  - [O] **실제**: CPU 바운드 작업은 비동기 이점 없음

- [!] **주의점**: 동기 라이브러리(requests 등)와 혼용 시 블로킹 발생""",
            "kubernetes": """- [X] **오해**: "K8s는 Docker 대체제다"
  - [O] **실제**: K8s는 컨테이너 오케스트레이션 도구

- [X] **오해**: "작은 프로젝트에도 K8s가 필요하다"
  - [O] **실제**: 복잡성 대비 이점이 있을 때만 도입

- [!] **주의점**: 학습 곡선이 가파르므로 점진적 도입 권장""",
            "postgresql": """- [X] **오해**: "NoSQL이 항상 더 빠르다"
  - [O] **실제**: 적절한 인덱싱과 쿼리 최적화 시 PostgreSQL도 빠름

- [X] **오해**: "JSON 데이터는 MongoDB만"
  - [O] **실제**: PostgreSQL의 JSONB도 강력한 JSON 지원

- [!] **주의점**: 대용량 데이터 시 파티셔닝 전략 필요""",
            "redis": """- [X] **오해**: "Redis는 캐시 전용이다"
  - [O] **실제**: 세션, 큐, Pub/Sub, 순위표 등 다양한 용도

- [X] **오해**: "인메모리라 데이터 유실된다"
  - [O] **실제**: RDB/AOF 영속성 옵션 제공

- [!] **주의점**: 메모리 용량 관리 및 만료 정책 설정 필요""",
        }
        return mistakes.get(
            topic.lower(),
            """- 기본 개념을 정확히 이해하지 않고 사용하면 문제 발생
- 공식 문서를 참고하여 올바른 사용법 학습 필요
- 실습을 통해 직접 경험하는 것이 중요""",
        )

    def _get_related_concepts(self, topic: str) -> str:
        """관련 개념 안내 - 확장"""
        related = {
            "python": "- **Django/Flask/FastAPI**: Python 웹 프레임워크\n- **NumPy/Pandas**: 데이터 분석 라이브러리\n- **PyTorch/TensorFlow**: 머신러닝 프레임워크",
            "javascript": "- **TypeScript**: 정적 타입 JavaScript\n- **Node.js**: 서버 사이드 JavaScript\n- **React/Vue/Angular**: 프론트엔드 프레임워크",
            "react": "- **Redux/Zustand**: 상태 관리 라이브러리\n- **Next.js**: React 풀스택 프레임워크\n- **React Native**: 모바일 앱 개발",
            "typescript": "- **ESLint/Prettier**: 코드 품질 도구\n- **Zod/io-ts**: 런타임 타입 검증\n- **tRPC**: 타입 안전 API",
            "docker": "- **Docker Compose**: 멀티 컨테이너 관리\n- **Kubernetes**: 컨테이너 오케스트레이션\n- **Podman**: Docker 대안",
            "git": "- **GitHub/GitLab**: Git 호스팅 플랫폼\n- **GitHub Actions**: CI/CD 자동화\n- **Git Flow**: 브랜치 전략",
            "nextjs": "- **Vercel**: Next.js 호스팅 플랫폼\n- **Prisma**: 타입 안전 ORM\n- **NextAuth.js**: 인증 라이브러리",
            "fastapi": "- **SQLAlchemy**: Python ORM\n- **Pydantic**: 데이터 검증\n- **Uvicorn/Gunicorn**: ASGI 서버",
            "kubernetes": "- **Helm**: K8s 패키지 매니저\n- **ArgoCD**: GitOps CD 도구\n- **Prometheus/Grafana**: 모니터링",
            "postgresql": "- **pgAdmin**: PostgreSQL 관리 도구\n- **PostGIS**: 지리공간 확장\n- **TimescaleDB**: 시계열 확장",
            "redis": "- **Redis Stack**: 검색/JSON/시계열 확장\n- **Redis Cluster**: 분산 Redis\n- **Celery**: 작업 큐 (Redis 백엔드)",
        }
        return related.get(
            topic.lower(),
            "- 공식 문서에서 관련 개념 확인\n- 실습 프로젝트로 연계 학습 권장",
        )

    def _generate_comparison_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess
    ) -> str:
        """비교 응답 생성"""
        topics = (
            analysis.key_topics[:2]
            if len(analysis.key_topics) >= 2
            else analysis.key_topics + ["alternative"]
        )

        response_parts = []
        query_lower = analysis.original_query.lower()

        # React vs Vue 비교
        if ("react" in query_lower and "vue" in query_lower) or (
            "리액트" in query_lower and "뷰" in query_lower
        ):
            return self._generate_react_vue_comparison()

        # Python vs JavaScript 비교
        if "python" in query_lower and (
            "javascript" in query_lower or "js" in query_lower
        ):
            return self._generate_python_js_comparison()

        # REST API vs GraphQL 비교
        if (
            "rest" in query_lower or "restful" in query_lower
        ) and "graphql" in query_lower:
            return self._generate_rest_graphql_comparison()

        # SQL vs NoSQL 비교
        if "sql" in query_lower and "nosql" in query_lower:
            return self._generate_sql_nosql_comparison()

        # Docker vs Kubernetes 비교
        if ("docker" in query_lower and "kubernetes" in query_lower) or (
            "docker" in query_lower and "k8s" in query_lower
        ):
            return self._generate_docker_k8s_comparison()

        # npm vs yarn vs pnpm 비교
        if ("npm" in query_lower and "yarn" in query_lower) or (
            "npm" in query_lower and "pnpm" in query_lower
        ):
            return self._generate_package_manager_comparison()

        # TypeScript vs JavaScript 비교
        if "typescript" in query_lower and "javascript" in query_lower:
            return self._generate_ts_js_comparison()

        # FastAPI vs Django vs Flask 비교
        if (
            "fastapi" in query_lower
            or "django" in query_lower
            or "flask" in query_lower
        ) and ("비교" in query_lower or "vs" in query_lower):
            return self._generate_python_framework_comparison()

        # PostgreSQL vs MongoDB 비교
        if ("postgresql" in query_lower or "postgres" in query_lower) and (
            "mongodb" in query_lower or "mongo" in query_lower
        ):
            return self._generate_postgres_mongodb_comparison()

        # MySQL vs PostgreSQL 비교
        if ("mysql" in query_lower) and (
            "postgresql" in query_lower or "postgres" in query_lower
        ):
            return self._generate_mysql_postgres_comparison()

        # Next.js vs Nuxt.js 비교
        if ("next" in query_lower or "nextjs" in query_lower) and (
            "nuxt" in query_lower or "nuxtjs" in query_lower
        ):
            return self._generate_nextjs_nuxtjs_comparison()

        # Angular vs React 비교
        if "angular" in query_lower and "react" in query_lower:
            return self._generate_angular_react_comparison()

        # Redis vs Memcached 비교
        if "redis" in query_lower and "memcached" in query_lower:
            return self._generate_redis_memcached_comparison()

        # Express vs Fastify 비교
        if ("express" in query_lower and "fastify" in query_lower) or (
            "express" in query_lower and "nest" in query_lower
        ):
            return self._generate_node_framework_comparison()

        # Webpack vs Vite 비교
        if ("webpack" in query_lower and "vite" in query_lower) or (
            "webpack" in query_lower and "rollup" in query_lower
        ):
            return self._generate_bundler_comparison()

        # 일반 비교
        response_parts.append(f"# {' vs '.join(topics).upper()} 비교\n\n")
        response_parts.append("## 한눈에 보기\n\n")
        response_parts.append(self._generate_comparison_summary(topics))
        response_parts.append("\n## 상세 비교\n\n")
        response_parts.append(self._generate_detailed_comparison(topics))
        response_parts.append("\n## 언제 무엇을 선택할까?\n\n")
        response_parts.append(self._generate_selection_guide(topics))

        return "".join(response_parts)

    def _generate_react_vue_comparison(self) -> str:
        """React vs Vue 비교 (보강 버전)"""
        return """# React vs Vue 상세 비교 가이드

## [#] 한눈에 보기

| 특성 | React | Vue |
|------|-------|-----|
| **개발사** | Facebook(Meta) | Evan You (오픈소스) |
| **출시** | 2013년 | 2014년 |
| **유형** | UI 라이브러리 | 프로그레시브 프레임워크 |
| **학습 곡선** | 가파름 (*****) | 완만함 (*****) |
| **타입스크립트 지원** | 우수 | 우수 (Vue 3) |
| **상태 관리** | Redux, Zustand, Jotai | Vuex, Pinia |
| **커뮤니티 크기** | 매우 큼 | 큼 (특히 아시아) |
| **GitHub Stars** | ~220k | ~210k |
| **NPM 주간 다운로드** | ~20M | ~4M |

---

## > 상세 비교

### 1. 철학과 접근 방식

| 관점 | React | Vue |
|------|-------|-----|
| 핵심 철학 | "UI를 위한 JavaScript" | "점진적 채택 가능" |
| 결정 방식 | 개발자가 모든 것을 선택 | 합리적인 기본값 제공 |
| 유연성 | 매우 높음 (양날의 검) | 적절히 제한 (가이드라인 있음) |
| 관심사 분리 | JSX로 통합 | 템플릿/스크립트/스타일 분리 |

### 2. 코드 비교

**React (JSX + Hooks)**
```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>로딩 중...</div>;
  
  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**Vue 3 (Composition API)**
```vue
<template>
  <div v-if="loading">로딩 중...</div>
  <div v-else class="profile">
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps(['userId']);
const user = ref(null);
const loading = ref(true);

watch(() => props.userId, async (newId) => {
  loading.value = true;
  user.value = await fetchUser(newId);
  loading.value = false;
}, { immediate: true });
</script>
```

### 3. 생태계 비교

| 영역 | React | Vue |
|------|-------|-----|
| **라우팅** | React Router | Vue Router (공식) |
| **상태 관리** | Redux, Zustand, Jotai, Recoil | Pinia (공식), Vuex |
| **UI 프레임워크** | MUI, Ant Design, Chakra | Vuetify, Quasar, Element Plus |
| **SSR 프레임워크** | Next.js | Nuxt.js |
| **모바일** | React Native | Ionic Vue, NativeScript |
| **테스팅** | Jest, React Testing Library | Vitest, Vue Test Utils |
| **빌드 도구** | CRA, Vite, Webpack | Vue CLI, Vite (권장) |

### 4. 성능 비교

| 지표 | React | Vue | 비고 |
|------|-------|-----|------|
| **초기 번들 크기** | ~42KB (gzip) | ~33KB (gzip) | Vue가 약간 작음 |
| **런타임 성능** | 빠름 | 빠름 | 실질적 차이 미미 |
| **메모리 사용량** | 중간 | 낮음 | Vue가 효율적 |
| **업데이트 속도** | Virtual DOM | Proxy 기반 반응성 | 접근 방식이 다름 |

### 5. 개발 경험 (DX)

| 측면 | React | Vue |
|------|-------|-----|
| **DevTools** | 우수 | 매우 우수 |
| **문서화** | 좋음 (개선 중) | 매우 우수 |
| **오류 메시지** | 개선됨 | 매우 명확함 |
| **핫 리로딩** | Fast Refresh | 기본 지원 |

---

## [O] 장점 상세

### React의 강점

1. **압도적인 생태계**
   - 거의 모든 문제에 대한 라이브러리 존재
   - Stack Overflow 답변 풍부

2. **채용 시장 우위**
   - 국내외 대기업에서 선호
   - 프론트엔드 채용 공고의 60-70% 차지

3. **기술적 유연성**
   - 아키텍처 선택의 자유
   - 다양한 패턴 적용 가능

4. **React Native 시너지**
   - 웹 + 모바일 동시 개발 가능
   - 코드 일부 공유 가능

### Vue의 강점

1. **낮은 진입 장벽**
   - HTML/CSS 경험만으로 시작 가능
   - 공식 문서가 튜토리얼처럼 친절

2. **명확한 구조**
   - 컴포넌트 구조가 직관적
   - 팀 간 코드 스타일 일관성 유지 쉬움

3. **점진적 채택**
   - 기존 프로젝트에 부분 도입 가능
   - jQuery -> Vue 마이그레이션 용이

4. **개발 속도**
   - 보일러플레이트 적음
   - 빠른 프로토타이핑

---

## [X] 단점 상세

### React의 약점

| 문제 | 상세 | 대응 방법 |
|------|------|----------|
| 선택 피로 | 라이브러리 선택이 많음 | 검증된 조합 사용 |
| 보일러플레이트 | 상대적으로 코드량 많음 | 커스텀 훅으로 추상화 |
| 학습 곡선 | Hooks, JSX 적응 필요 | 공식 문서 + 실습 병행 |

### Vue의 약점

| 문제 | 상세 | 대응 방법 |
|------|------|----------|
| 작은 생태계 | 니치한 라이브러리 부족할 수 있음 | 필요시 직접 구현 |
| 채용 시장 | React 대비 공고 적음 | React도 병행 학습 |
| 대규모 레퍼런스 | 엔터프라이즈 사례 적음 | Alibaba, Xiaomi 등 참고 |

---

## * 선택 가이드

### React를 선택해야 할 때

| 상황 | 이유 |
|------|------|
| 취업/이직 준비 | 채용 공고 비율 높음 |
| 대규모 팀 프로젝트 | 생태계와 인력 풀 |
| 모바일 앱도 필요 | React Native 활용 |
| 복잡한 상태 관리 | 검증된 패턴들 |
| 기존 React 코드베이스 | 통일성 유지 |

### Vue를 선택해야 할 때

| 상황 | 이유 |
|------|------|
| 프론트엔드 입문 | 학습 곡선 완만 |
| 빠른 MVP 개발 | 개발 속도 빠름 |
| 기존 프로젝트 점진적 개선 | 쉬운 통합 |
| 소규모 팀 | 컨벤션 통일 용이 |
| PHP/Laravel 환경 | 기술 스택 궁합 |

---

## * 실무자 조언

### 초보자라면

> **Vue로 시작하세요.** 개념 이해가 빠르고, 성공 경험을 쌓기 좋습니다.
> 이후 React를 배우면 두 가지를 비교하며 깊이 이해할 수 있습니다.

### 취업 준비 중이라면

> **React를 우선하세요.** 현실적으로 채용 공고가 많습니다.
> 단, Vue만 쓰는 회사도 있으니 지원 회사 기술 스택을 확인하세요.

### 팀 리더라면

> **팀원의 경험을 고려하세요.** 기술 자체보다 팀의 생산성이 중요합니다.
> 어느 쪽이든 잘 만들면 좋은 제품이 됩니다.

---

## 결론

| | React | Vue |
|---|:---:|:---:|
| 추천 대상 | 커리어 중시, 대규모 프로젝트 | 입문자, 빠른 개발 |
| 학습 난이도 | ***** | ***** |
| 취업 시장 | ***** | ***** |
| 개발 속도 | ***** | ***** |
| 유연성 | ***** | ***** |

**핵심:** 둘 다 훌륭한 도구입니다. 어떤 게 더 좋다보다 나의 상황에 어떤 게 맞는가를 고민하세요.

## 결론

둘 다 훌륭한 선택입니다. **처음 시작**한다면 Vue로 프론트엔드 기초를 익히고, **취업 준비**라면 React를 추천합니다. 가장 좋은 방법은 둘 다 간단히 체험해보는 것입니다!"""

    def _generate_python_js_comparison(self) -> str:
        """Python vs JavaScript 비교"""
        return """# Python vs JavaScript 비교

## 한눈에 보기

| 특성 | Python | JavaScript |
|------|--------|------------|
| 유형 | 범용 언어 | 주로 웹 개발 |
| 타이핑 | 동적, 강타입 | 동적, 약타입 |
| 실행 환경 | 인터프리터 | 브라우저/Node.js |
| 주요 용도 | 데이터/AI, 백엔드 | 웹 프론트/백엔드 |

## 문법 비교

**변수 선언**
```python
# Python
name = "Python"
numbers = [1, 2, 3]
```

```javascript
// JavaScript
const name = "JavaScript";
const numbers = [1, 2, 3];
```

**함수**
```python
# Python
def greet(name):
    return f"Hello, {name}!"
```

```javascript
// JavaScript
const greet = (name) => `Hello, ${name}!`;
```

**비동기 처리**
```python
# Python
async def fetch_data():
    response = await get_data()
    return response
```

```javascript
// JavaScript
async function fetchData() {
    const response = await getData();
    return response;
}
```

## 각 언어의 강점

### Python 강점
- 데이터 과학, 머신러닝 (pandas, numpy, tensorflow)
- 자동화 스크립트
- 가독성 높은 문법
- 과학/연구 분야

### JavaScript 강점
- 웹 개발 (프론트엔드 필수)
- 풀스택 개발 (Node.js)
- 실시간 애플리케이션
- 모바일 앱 (React Native)

## 선택 가이드

**Python을 배우세요:**
- 데이터 분석/AI에 관심
- 자동화 스크립트 작성
- 프로그래밍 첫 입문

**JavaScript를 배우세요:**
- 웹 개발자 목표
- 풀스택 개발
- 인터랙티브한 웹 앱 개발

**결론:** 둘 다 배우면 최고입니다! 웹 개발자라면 JS 필수, 데이터 분야라면 Python 필수."""

    def _generate_rest_graphql_comparison(self) -> str:
        """REST API vs GraphQL 비교"""
        return """# REST API vs GraphQL 심층 비교

## TL;DR

> REST는 **단순하고 캐싱에 강하며**, GraphQL은 **유연하고 효율적인 데이터 요청**에 강합니다.

## 한눈에 보기

| 특성 | REST API | GraphQL |
|------|----------|---------|
| 개발사 | Roy Fielding (2000) | Facebook (2015) |
| 데이터 요청 | 여러 엔드포인트 | 단일 엔드포인트 |
| 오버페칭 | 자주 발생 | 없음 |
| 언더페칭 | 자주 발생 | 없음 |
| 캐싱 | HTTP 캐싱 우수 | 복잡함 |
| 학습 곡선 | 완만함 | 가파름 |
| 실시간 | WebSocket 별도 | Subscription 내장 |

## 상세 비교

### 1. 데이터 요청 방식

**REST API**
```javascript
// 여러 번 요청 필요
GET /users/1
GET /users/1/posts
GET /users/1/followers

// 각각 다른 응답, 불필요한 데이터 포함 가능
```

**GraphQL**
```graphql
# 한 번의 요청으로 필요한 것만
query {
  user(id: 1) {
    name
    email
    posts { title }
    followers { name }
  }
}
```

### 2. 오버페칭/언더페칭 문제

| 문제 | REST | GraphQL |
|------|------|---------|
| 오버페칭 (필요 이상 데이터) | X 자주 발생 | O 해결 |
| 언더페칭 (데이터 부족) | X N+1 문제 | O 해결 |
| 해결책 | BFF 패턴, 커스텀 엔드포인트 | 쿼리로 정확히 요청 |

### 3. 장단점 분석

**REST API 장점:**
- 단순하고 이해하기 쉬움
- HTTP 캐싱 완벽 지원
- 성숙한 생태계
- [O] 모든 개발자가 익숙함

**REST API 단점:**
- [X] 여러 리소스 조회 시 다중 요청
- [X] API 버전 관리 복잡
- [X] 문서화 별도 필요 (Swagger 등)

**GraphQL 장점:**
- [O] 정확히 필요한 데이터만 요청
- [O] 강력한 타입 시스템
- [O] 자동 문서화
- [O] 프론트엔드 개발 속도 향상

**GraphQL 단점:**
- [X] 학습 곡선 존재
- [X] 캐싱 구현 복잡
- [X] 간단한 API에는 과도함
- [X] N+1 쿼리 문제 주의 필요

## 실무 선택 가이드

### REST API 선택

1. **공개 API** 제공 시 (범용성)
2. **단순한 CRUD** 작업 위주
3. **캐싱이 중요**한 경우
4. **팀원이 GraphQL 미숙**할 때
5. **마이크로서비스** 간 통신

### GraphQL 선택

1. **복잡한 데이터 관계**가 있을 때
2. **모바일 앱** 개발 (대역폭 절약)
3. **빠른 프론트엔드 개발**이 필요할 때
4. **여러 데이터 소스 통합** 시
5. **실시간 기능**이 필요할 때

## 하이브리드 접근

실무에서는 둘을 함께 사용하기도 합니다:

```
+-------------------+
|   프론트엔드       |
+---------+---------+
          | GraphQL
+---------v---------+
|   BFF (GraphQL)   |
+---------+---------+
          | REST
+---------v---------+
| 마이크로서비스들   |
+-------------------+
```

## 결론

| 상황 | 추천 |
|------|------|
| 스타트업 빠른 개발 | GraphQL |
| 공개 API 서비스 | REST |
| 복잡한 프론트엔드 | GraphQL |
| 레거시 시스템 연동 | REST |
| 실시간 + 일반 혼합 | GraphQL |

**핵심:** "무엇이 더 좋다"가 아니라 **"우리 상황에 무엇이 맞는가"**를 기준으로 선택하세요."""

    def _generate_sql_nosql_comparison(self) -> str:
        """SQL vs NoSQL 비교"""
        return """# SQL vs NoSQL 데이터베이스 비교

## 한눈에 보기

| 특성 | SQL (관계형) | NoSQL (비관계형) |
|------|-------------|-----------------|
| 스키마 | 고정 스키마 | 유연한 스키마 |
| 확장 | 수직 확장 (Scale-up) | 수평 확장 (Scale-out) |
| 트랜잭션 | ACID 보장 | BASE (일부 ACID) |
| 쿼리 | SQL 표준 | 각 DB마다 다름 |
| 관계 | JOIN 강력 | 임베디드/참조 |
| 대표 DB | MySQL, PostgreSQL | MongoDB, Redis |

## 언제 무엇을 선택?

### SQL 선택
- 데이터 구조가 명확하고 변경이 적을 때
- 복잡한 쿼리와 JOIN이 필요할 때
- 데이터 무결성이 매우 중요할 때 (금융, 회계)
- 트랜잭션 ACID가 필수일 때

### NoSQL 선택
- 데이터 구조가 자주 변경될 때
- 대용량 데이터/높은 트래픽
- 빠른 개발 속도가 필요할 때
- 수평 확장이 필요할 때

## 결론

많은 프로젝트에서 **둘 다 사용**합니다:
- 핵심 비즈니스 데이터 -> SQL (PostgreSQL)
- 세션/캐시 -> NoSQL (Redis)
- 로그/분석 -> NoSQL (MongoDB, Elasticsearch)"""

    def _generate_docker_k8s_comparison(self) -> str:
        """Docker vs Kubernetes 비교"""
        return """# Docker vs Kubernetes 비교

## 핵심 차이

| 구분 | Docker | Kubernetes |
|------|--------|------------|
| 역할 | **컨테이너 런타임** | **컨테이너 오케스트레이션** |
| 비유 | 배(컨테이너) | 항구(배들을 관리) |
| 단위 | 단일 컨테이너 | 컨테이너 클러스터 |
| 복잡도 | 낮음 | 높음 |

## 언제 Docker만 사용?

- 개발 환경 구축
- 단일 서버 배포
- 소규모 프로젝트
- CI/CD 파이프라인

```bash
# Docker만으로 충분한 경우
docker-compose up -d
```

## 언제 Kubernetes 필요?

- 수십~수백 개 컨테이너 관리
- 자동 스케일링 필요
- 무중단 배포 (Rolling Update)
- 셀프 힐링 (장애 자동 복구)
- 멀티 클라우드/하이브리드 환경

```yaml
# Kubernetes가 필요한 경우
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3  # 자동으로 3개 Pod 유지
  selector:
    matchLabels:
      app: my-app
```

## 관계

```
Docker < Kubernetes

Kubernetes는 Docker(또는 containerd)를 사용하여
컨테이너를 실행하고 관리합니다.
```

## 결론

| 상황 | 선택 |
|------|------|
| 개발/테스트 | Docker |
| 소규모 프로덕션 | Docker Compose |
| 중대규모 프로덕션 | Kubernetes |
| 학습 순서 | Docker -> Kubernetes |

**핵심**: Docker를 먼저 익히고, 규모가 커지면 Kubernetes를 도입하세요."""

    def _generate_package_manager_comparison(self) -> str:
        """npm vs yarn vs pnpm 비교"""
        return """# npm vs yarn vs pnpm 비교

## 한눈에 보기

| 특성 | npm | yarn | pnpm |
|------|-----|------|------|
| 개발사 | npm Inc. | Facebook | Community |
| 속도 | 보통 | 빠름 | **가장 빠름** |
| 디스크 사용 | 높음 | 높음 | **매우 낮음** |
| 워크스페이스 | [O] | [O] | [O] |
| 락파일 | package-lock.json | yarn.lock | pnpm-lock.yaml |

## 설치 명령어 비교

```bash
# 패키지 설치
npm install         | yarn            | pnpm install
npm install react   | yarn add react  | pnpm add react
npm install -D jest | yarn add -D jest| pnpm add -D jest

# 전역 설치
npm install -g pkg  | yarn global add pkg | pnpm add -g pkg

# 스크립트 실행
npm run dev         | yarn dev        | pnpm dev
```

## 선택 가이드

### npm 선택
- Node.js 기본 제공
- 추가 설치 불필요
- 가장 넓은 호환성

### yarn 선택
- Facebook 생태계 사용
- Plug'n'Play 기능 필요
- 기존 yarn.lock 프로젝트

### pnpm 선택 (추천)
- **디스크 공간 절약** (심볼릭 링크)
- **빠른 설치 속도**
- 모노레포 프로젝트
- 엄격한 의존성 관리

## 2024년 추천

1. **신규 프로젝트**: pnpm
2. **기존 프로젝트**: 현재 사용 중인 것 유지
3. **초보자**: npm (추가 설치 불필요)

```bash
# pnpm 설치
npm install -g pnpm

# 마이그레이션
rm -rf node_modules package-lock.json
pnpm import  # package-lock.json -> pnpm-lock.yaml
pnpm install
```"""

    def _generate_ts_js_comparison(self) -> str:
        """TypeScript vs JavaScript 비교"""
        return """# TypeScript vs JavaScript 비교

## 핵심 차이

| 특성 | JavaScript | TypeScript |
|------|------------|------------|
| 타입 시스템 | 동적 타입 | **정적 타입** |
| 컴파일 | 불필요 | 필요 (-> JS) |
| 에러 발견 | 런타임 | **컴파일 타임** |
| 학습 곡선 | 낮음 | 중간 |
| IDE 지원 | 보통 | **우수** |

## 코드 비교

**JavaScript**
```javascript
function greet(name) {
  return "Hello, " + name;
}

greet(123);  // 런타임에서야 문제 인지
```

**TypeScript**
```typescript
function greet(name: string): string {
  return "Hello, " + name;
}

greet(123);  // [X] 컴파일 에러! (number -> string)
greet("World");  // [O]
```

## TypeScript 장점

1. **컴파일 타임 에러 감지**
   ```typescript
   interface User {
     id: number;
     name: string;
   }
   
   const user: User = { id: 1 };  // [X] 'name' 누락 에러
   ```

2. **자동완성 강화**
   ```typescript
   user.  // IDE가 id, name 자동 제안
   ```

3. **리팩토링 안정성**
   - 함수/변수 이름 변경 시 모든 참조 자동 업데이트

## 선택 가이드

### JavaScript 사용
- 빠른 프로토타이핑
- 소규모 스크립트
- TypeScript 학습 전

### TypeScript 사용 (권장)
- 팀 프로젝트
- 중대규모 애플리케이션
- 장기 유지보수 필요
- API 연동이 많은 경우

## 마이그레이션

```bash
# TypeScript 설치
npm install -D typescript @types/node

# 설정 파일 생성
npx tsc --init

# .js -> .ts 변환 후
npx tsc  # 컴파일
```

## 결론

> "TypeScript는 JavaScript의 **보험**이다."

- 작은 프로젝트: JS도 OK
- 팀/프로덕션: **TypeScript 강력 추천**"""

    def _generate_python_framework_comparison(self) -> str:
        """FastAPI vs Django vs Flask 비교"""
        return """# FastAPI vs Django vs Flask 비교

## 한눈에 보기

| 특성 | FastAPI | Django | Flask |
|------|---------|--------|-------|
| 타입 | 비동기 API | 풀스택 | 마이크로 |
| 속도 | **가장 빠름** | 보통 | 보통 |
| 학습 | 쉬움 | 중간 | **가장 쉬움** |
| 기능 | API 특화 | **올인원** | 최소한 |
| 문서화 | **자동 (Swagger)** | 수동 | 수동 |

## 코드 비교

**FastAPI**
```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.get("/items/{id}")
async def get_item(id: int) -> Item:
    return Item(name="Example", price=10.0)

# 자동으로 Swagger 문서 생성: /docs
```

**Flask**
```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/items/<int:id>")
def get_item(id):
    return jsonify({"name": "Example", "price": 10.0})
```

**Django**
```python
# views.py
from django.http import JsonResponse

def get_item(request, id):
    return JsonResponse({"name": "Example", "price": 10.0})

# urls.py
urlpatterns = [
    path('items/<int:id>/', views.get_item),
]
```

## 선택 가이드

### FastAPI 선택
- **REST API / 마이크로서비스**
- 고성능 필요 (비동기)
- 자동 문서화 필요
- 타입 힌트 사용

### Django 선택
- **풀스택 웹 애플리케이션**
- 관리자 패널 필요
- ORM, 인증, 세션 등 내장 필요
- 빠른 개발 (배터리 포함)

### Flask 선택
- **간단한 API / 프로토타입**
- 최소한의 구조 원함
- 학습 목적
- 완전한 제어권 필요

## 성능 비교 (요청/초)

```
FastAPI:  ~15,000 req/s  ################
Flask:    ~1,500 req/s   ##
Django:   ~1,200 req/s   #
```

## 2024년 추천

| 상황 | 추천 |
|------|------|
| API 서버 | **FastAPI** |
| 웹사이트 + 관리자 | **Django** |
| 학습/프로토타입 | Flask |
| 마이크로서비스 | FastAPI |"""

    def _generate_postgres_mongodb_comparison(self) -> str:
        """PostgreSQL vs MongoDB 비교"""
        return """# PostgreSQL vs MongoDB 비교

## 한눈에 보기

| 특성 | PostgreSQL | MongoDB |
|------|------------|---------|
| 유형 | 관계형 (RDBMS) | 문서형 (NoSQL) |
| 데이터 모델 | 테이블, 행, 열 | JSON 문서 |
| 스키마 | 고정 스키마 | 유연한 스키마 |
| 쿼리 언어 | SQL | MQL (MongoDB Query) |
| 트랜잭션 | 완벽 ACID | ACID (4.0+) |
| 확장성 | 수직 확장 위주 | 수평 확장 (샤딩) |

## 상세 비교

### 데이터 모델

**PostgreSQL**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    profile JSONB
);
```

**MongoDB**
```javascript
{
    _id: ObjectId("..."),
    name: "홍길동",
    email: "hong@example.com",
    profile: { age: 30, interests: ["coding"] }
}
```

### 장점

**PostgreSQL**
- 복잡한 쿼리와 JOIN
- 데이터 무결성 보장
- JSONB로 유연성도 확보

**MongoDB**
- 빠른 개발 속도
- 유연한 스키마 변경
- 수평 확장 용이

## 언제 무엇을 선택할까?

| 상황 | 추천 |
|------|------|
| 웹앱 백엔드 | **PostgreSQL** |
| 콘텐츠 관리 | MongoDB |
| 이커머스/결제 | **PostgreSQL** |
| IoT/로그 수집 | MongoDB |"""

    def _generate_mysql_postgres_comparison(self) -> str:
        """MySQL vs PostgreSQL 비교"""
        return """# MySQL vs PostgreSQL 비교

## 한눈에 보기

| 특성 | MySQL | PostgreSQL |
|------|-------|------------|
| 소유사 | Oracle | 오픈소스 |
| 강점 | 읽기 성능 | 기능, 확장성 |
| JSON 지원 | JSON | JSONB (더 강력) |
| 전문 검색 | 기본 | 고급 (tsvector) |

## PostgreSQL만의 기능

- JSONB (인덱싱 가능한 JSON)
- CTE (WITH 구문)
- 윈도우 함수 전체 지원
- 커스텀 타입

## 언제 무엇을 선택할까?

| 상황 | 추천 |
|------|------|
| 새 프로젝트 | **PostgreSQL** |
| 기존 MySQL 앱 | MySQL 유지 |
| 복잡한 쿼리 | **PostgreSQL** |
| 간단한 웹앱 | 둘 다 OK |

최근 트렌드는 PostgreSQL 쪽으로 기울고 있습니다!"""

    def _generate_nextjs_nuxtjs_comparison(self) -> str:
        """Next.js vs Nuxt.js 상세 비교"""
        return """# Next.js vs Nuxt.js 상세 비교 가이드

## 핵심 요약

| 특성 | Next.js | Nuxt.js |
|------|---------|---------|
| **기반** | React | Vue |
| **개발사** | Vercel | NuxtLabs |
| **초기 릴리즈** | 2016년 | 2016년 |
| **SSR/SSG** | 모두 지원 | 모두 지원 |
| **학습 곡선** | React 필요 | Vue 필요 (더 쉬움) |
| **취업 시장** | 더 많음 | 적당함 |
| **커뮤니티** | 매우 큼 | 큼 |

---

## 상세 비교

### 1. 철학과 접근 방식

**Next.js:**
- "프레임워크답게 제공하되, React의 자유도 유지"
- 설정보다 관습 (Convention over Configuration)
- App Router (최신) vs Pages Router 선택

**Nuxt.js:**
- "Vue의 모든 것을 풀스택으로"
- 자동 구성과 합리적 기본값
- 더 많은 것을 자동으로 처리

### 2. 라우팅 시스템

**Next.js (App Router)**
```
app/
|-- page.tsx          # /
|-- about/
|   +-- page.tsx      # /about
|-- blog/
|   |-- page.tsx      # /blog
|   +-- [slug]/
|       +-- page.tsx  # /blog/:slug
```

**Nuxt.js**
```
pages/
|-- index.vue         # /
|-- about.vue         # /about
|-- blog/
|   |-- index.vue     # /blog
|   +-- [slug].vue    # /blog/:slug
```

### 3. 데이터 페칭

**Next.js:**
```typescript
// Server Component (기본)
async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}

// Client Component
'use client';
import { useEffect, useState } from 'react';
```

**Nuxt.js:**
```vue
<script setup>
// 자동으로 SSR 지원
const { data } = await useFetch('/api/data');
</script>

<template>
  <div>{{ data }}</div>
</template>
```

### 4. 상태 관리

| | Next.js | Nuxt.js |
|---|---------|---------|
| 기본 제공 | 없음 | useState, Pinia 통합 |
| 권장 라이브러리 | Zustand, Redux | Pinia (공식) |
| 설정 복잡도 | 직접 설정 | 자동 설정 |

### 5. 렌더링 옵션

| 모드 | Next.js | Nuxt.js |
|------|---------|---------|
| SSR | O | O |
| SSG | O | O |
| ISR | O | O |
| SPA | O | O |
| 하이브리드 | O (App Router) | O (routeRules) |

---

## 장단점 비교

### Next.js 장점

- [+] **대규모 생태계**: React 라이브러리 모두 사용 가능
- [+] **취업 시장**: 더 많은 채용 공고
- [+] **Vercel 통합**: 배포가 매우 쉬움
- [+] **Server Components**: 최신 React 기능 지원
- [+] **이미지 최적화**: next/image 강력

### Next.js 단점

- [-] **복잡성**: React 자체의 복잡성 상속
- [-] **App Router 학습**: 새로운 패러다임 학습 필요
- [-] **보일러플레이트**: 상대적으로 코드량 많음

### Nuxt.js 장점

- [+] **낮은 진입 장벽**: Vue의 쉬운 문법
- [+] **자동 설정**: 많은 것이 자동으로 처리됨
- [+] **내장 기능**: useFetch, useState 등 편의 기능
- [+] **모듈 시스템**: 플러그인 추가가 쉬움
- [+] **코드량 적음**: 같은 기능을 더 짧게

### Nuxt.js 단점

- [-] **작은 생태계**: Vue 라이브러리가 React보다 적음
- [-] **취업 시장**: Next.js 대비 공고 적음
- [-] **대규모 사례**: 엔터프라이즈 레퍼런스 적음

---

## 선택 가이드

### Next.js를 선택해야 할 때

| 상황 | 이유 |
|------|------|
| 취업/이직 준비 | 채용 공고 많음 |
| React 경험자 | 학습 비용 낮음 |
| 대기업 프로젝트 | 검증된 사례 많음 |
| 모바일 앱도 필요 | React Native 시너지 |

### Nuxt.js를 선택해야 할 때

| 상황 | 이유 |
|------|------|
| Vue 경험자/선호 | 자연스러운 확장 |
| 빠른 개발 필요 | 자동 설정, 적은 코드 |
| 입문자 | 학습 곡선 완만 |
| 소규모 팀 | 생산성 높음 |

---

## 실무자 추천

### 새 프로젝트 시작할 때

> **일반적인 추천: Next.js**
> - 취업 시장, 생태계, 검증된 사례 고려
> - 단, React 학습 비용 감안 필요

> **빠른 개발이 필요하면: Nuxt.js**
> - Vue를 알거나 빠르게 배울 수 있다면
> - 생산성과 개발 경험이 우수

### 팀 상황 고려

```
팀이 React를 잘 안다 -> Next.js
팀이 Vue를 잘 안다 -> Nuxt.js
둘 다 모른다 -> Nuxt.js (학습 쉬움)
취업이 목적 -> Next.js (시장 수요)
```

---

## 결론

| | Next.js | Nuxt.js |
|---|:---:|:---:|
| 추천 대상 | React 개발자, 취업 준비 | Vue 개발자, 빠른 개발 |
| 학습 난이도 | ***** | *** |
| 생산성 | *** | ***** |
| 취업 시장 | ***** | *** |
| 유연성 | ***** | *** |

**핵심**: 둘 다 훌륭한 풀스택 프레임워크입니다.
- **기술적으로**: 비슷한 기능 제공
- **실질적으로**: 팀의 기술 스택과 목적에 따라 선택

이미 React를 쓴다면 Next.js, Vue를 쓴다면 Nuxt.js가 자연스러운 선택입니다."""

    def _generate_angular_react_comparison(self) -> str:
        """Angular vs React 비교"""
        return """# Angular vs React 상세 비교

## 핵심 비교

| 특성 | Angular | React |
|------|---------|-------|
| **유형** | 풀 프레임워크 | UI 라이브러리 |
| **개발사** | Google | Facebook (Meta) |
| **언어** | TypeScript (필수) | JavaScript/TypeScript |
| **학습 곡선** | 가파름 | 중간 |
| **아키텍처** | MVC/MVVM | 컴포넌트 기반 |

## 주요 차이점

### 1. 철학
- **Angular**: "모든 것을 제공하는 풀 프레임워크"
- **React**: "UI만 담당, 나머지는 선택"

### 2. 문법

**Angular:**
```typescript
@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count }}</p>
    <button (click)="increment()">+</button>
  `
})
export class CounterComponent {
  count = 0;
  increment() { this.count++; }
}
```

**React:**
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

### 3. 상태 관리
| | Angular | React |
|---|---------|-------|
| 내장 | Services + RxJS | useState, useContext |
| 외부 | NgRx | Redux, Zustand |

## 선택 가이드

| 상황 | 추천 |
|------|------|
| 대기업 엔터프라이즈 | Angular |
| 스타트업, 빠른 개발 | React |
| TypeScript 필수 환경 | Angular |
| 유연성 필요 | React |
| 풀스택 표준화 | Angular |

## 결론

- **Angular**: 규모가 크고 구조화된 프로젝트
- **React**: 유연성과 생태계가 중요한 프로젝트

둘 다 검증된 기술입니다. 팀 경험과 프로젝트 요구사항에 따라 선택하세요."""

    def _generate_troubleshooting_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess
    ) -> str:
        """문제 해결 응답 - 구체적인 해결책 제시"""
        query_lower = analysis.original_query.lower()

        # npm 관련 에러
        if "npm" in query_lower or "node_modules" in query_lower:
            return self._generate_npm_troubleshooting(analysis.original_query)

        # git 관련 에러
        if "git" in query_lower:
            return self._generate_git_troubleshooting(analysis.original_query)

        # Python 관련 에러
        if (
            "python" in query_lower
            or "pip" in query_lower
            or "modulenotfound" in query_lower
        ):
            return self._generate_python_troubleshooting(analysis.original_query)

        # Docker 관련 에러
        if "docker" in query_lower or "container" in query_lower:
            return self._generate_docker_troubleshooting(analysis.original_query)

        # React/Next.js 관련 에러
        if (
            "react" in query_lower
            or "next" in query_lower
            or "hydration" in query_lower
        ):
            return self._generate_react_troubleshooting(analysis.original_query)

        # TypeScript 관련 에러
        if "typescript" in query_lower or "ts" in query_lower or "타입" in query_lower:
            return self._generate_typescript_troubleshooting(analysis.original_query)

        # CORS 에러
        if "cors" in query_lower or "cross-origin" in query_lower:
            return self._generate_cors_troubleshooting()

        # 500/404 HTTP 에러
        if "500" in query_lower or "404" in query_lower or "http" in query_lower:
            return self._generate_http_error_troubleshooting(analysis.original_query)

        # Permission denied / 권한 에러
        if (
            "permission" in query_lower
            or "denied" in query_lower
            or "권한" in query_lower
        ):
            return self._generate_permission_troubleshooting()

        # Connection refused / 연결 에러
        if (
            "connection" in query_lower
            or "refused" in query_lower
            or "연결" in query_lower
        ):
            return self._generate_connection_troubleshooting()

        # Out of memory / 메모리 에러
        if "memory" in query_lower or "메모리" in query_lower or "heap" in query_lower:
            return self._generate_memory_troubleshooting()

        # 일반 문제 해결
        response_parts = []
        response_parts.append(f"# 문제 해결: {analysis.original_query[:40]}\n\n")
        response_parts.append("## 문제 분석\n\n")
        response_parts.append(f"{thought.understanding}\n\n")
        response_parts.append("## 가능한 원인\n\n")
        response_parts.append(self._generate_possible_causes(analysis.key_topics))
        response_parts.append("\n## 해결 방법\n\n")
        response_parts.append(
            self._generate_solutions(analysis.key_topics, analysis.original_query)
        )
        response_parts.append("\n## 예방 방법\n\n")
        response_parts.append(self._generate_prevention_tips(analysis.key_topics))
        return "".join(response_parts)

    def _generate_react_troubleshooting(self, query: str) -> str:
        """React/Next.js 문제 해결"""
        query_lower = query.lower()

        if "hydration" in query_lower:
            return self._generate_hydration_error_guide()

        return """# React/Next.js 에러 해결 가이드

## 흔한 에러와 해결책

### 1. Hydration 에러 (Next.js)

```
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

**원인**: 서버와 클라이언트의 렌더링 결과가 다름

**해결책:**
```tsx
// 방법 1: suppressHydrationWarning
<time suppressHydrationWarning>{new Date().toISOString()}</time>

// 방법 2: useEffect로 클라이언트에서만 렌더링
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;

// 방법 3: dynamic import with ssr: false
const Component = dynamic(() => import('./Component'), { ssr: false });
```

### 2. "Cannot read properties of undefined"

```
TypeError: Cannot read properties of undefined (reading 'map')
```

**해결책:**
```tsx
// 옵셔널 체이닝 사용
{data?.items?.map(item => ...)}

// 기본값 설정
const items = data?.items || [];
```

### 3. "Invalid hook call"

```
Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**원인:**
- 조건문/반복문 안에서 Hook 호출
- 일반 함수에서 Hook 호출
- React 버전 불일치

**해결책:**
```tsx
// [X] 잘못됨
if (condition) {
  const [state, setState] = useState();
}

// [O] 올바름
const [state, setState] = useState();
if (condition) { /* use state */ }
```

### 4. "Module not found"

```
Module not found: Cannot resolve xxx
```

**해결책:**
```bash
# 패키지 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 삭제 (Next.js)
rm -rf .next
npm run dev
```

### 5. Too Many Re-renders

```
Error: Too many re-renders. React limits the number of renders.
```

**원인**: 무한 렌더링 루프

**해결책:**
```tsx
// [X] 잘못됨 - 렌더링마다 setState 호출
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1);  // 무한 루프!
}

// [O] 올바름 - 이벤트 핸들러나 useEffect 사용
function Component() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Click</button>;
}
```

## 디버깅 팁

```bash
# React DevTools 설치 (브라우저 확장)
# Chrome/Firefox에서 React 컴포넌트 검사 가능

# Next.js 상세 에러 보기
NODE_OPTIONS='--inspect' next dev
```"""

    def _generate_hydration_error_guide(self) -> str:
        """Hydration 에러 전문 가이드"""
        return """# Next.js Hydration 에러 완벽 해결

## 에러 메시지

```
Error: Hydration failed because the initial UI does not match what was rendered on the server
Warning: Expected server HTML to contain a matching <div> in <div>
```

## 원인 이해

**Hydration이란?**
1. 서버에서 HTML 생성 (SSR)
2. 클라이언트에서 React가 HTML에 이벤트 연결
3. **서버 HTML != 클라이언트 렌더링** -> 에러!

## 주요 원인과 해결책

### 1. 브라우저 전용 값 사용

```tsx
// [X] 문제: 서버에는 window가 없음
<div>{window.innerWidth}</div>

// [O] 해결: 클라이언트에서만 렌더링
const [width, setWidth] = useState(0);
useEffect(() => {
  setWidth(window.innerWidth);
}, []);
```

### 2. Date/Time 사용

```tsx
// [X] 문제: 서버/클라이언트 시간 다름
<span>{new Date().toLocaleString()}</span>

// [O] 해결 1: suppressHydrationWarning
<span suppressHydrationWarning>
  {new Date().toLocaleString()}
</span>

// [O] 해결 2: useEffect
const [time, setTime] = useState('');
useEffect(() => {
  setTime(new Date().toLocaleString());
}, []);
```

### 3. 브라우저 확장 프로그램 간섭

```tsx
// [O] body에 추가 (Next.js)
<body suppressHydrationWarning>
```

### 4. 잘못된 HTML 구조

```tsx
// [X] 문제: p 안에 div 불가
<p>
  <div>Invalid HTML</div>
</p>

// [O] 해결
<div>
  <div>Valid HTML</div>
</div>
```

### 5. 동적 컴포넌트

```tsx
// 클라이언트에서만 렌더링해야 하는 컴포넌트
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});
```

## 공통 패턴: ClientOnly 컴포넌트

```tsx
// components/ClientOnly.tsx
'use client';

import { useEffect, useState, ReactNode } from 'react';

export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  return <>{children}</>;
}

// 사용
<ClientOnly>
  <BrowserOnlyComponent />
</ClientOnly>
```

## 디버깅 팁

```bash
# 개발 모드에서 상세 에러 확인
# React DevTools의 Components 탭에서 차이점 확인
```"""

    def _generate_typescript_troubleshooting(self, query: str) -> str:
        """TypeScript 문제 해결"""
        return """# TypeScript 에러 해결 가이드

## 흔한 에러와 해결책

### 1. "Property does not exist on type"

```typescript
// [X] 에러
const obj = {};
obj.name = "test";  // Property 'name' does not exist

// [O] 해결 1: 타입 정의
interface MyObj {
  name?: string;
}
const obj: MyObj = {};
obj.name = "test";

// [O] 해결 2: as 타입 단언
const obj = {} as { name: string };
```

### 2. "Type 'X' is not assignable to type 'Y'"

```typescript
// [X] 에러
const num: number = "hello";  // Type 'string' is not assignable

// [O] 해결: 올바른 타입 사용
const num: number = 123;
const str: string = "hello";
```

### 3. "Object is possibly 'undefined'"

```typescript
// [X] 에러
const arr = [1, 2, 3];
console.log(arr[0].toFixed());  // Object is possibly 'undefined'

// [O] 해결 1: 옵셔널 체이닝
console.log(arr[0]?.toFixed());

// [O] 해결 2: Non-null assertion (확실할 때만)
console.log(arr[0]!.toFixed());

// [O] 해결 3: 타입 가드
if (arr[0] !== undefined) {
  console.log(arr[0].toFixed());
}
```

### 4. "Cannot find module" (import)

```typescript
// [X] 에러: 모듈 타입 없음
import something from 'some-lib';

// [O] 해결 1: @types 패키지 설치
npm install -D @types/some-lib

// [O] 해결 2: 직접 선언 (declarations.d.ts)
declare module 'some-lib';
```

### 5. Generic 타입 에러

```typescript
// [X] 에러
function first<T>(arr: T[]) {
  return arr[0].length;  // Property 'length' does not exist
}

// [O] 해결: 제약 조건 추가
function first<T extends { length: number }>(arr: T[]) {
  return arr[0].length;
}
```

## tsconfig.json 팁

```json
{
  "compilerOptions": {
    "strict": true,           // 엄격 모드 (권장)
    "noImplicitAny": true,    // any 금지
    "strictNullChecks": true, // null 체크
    "skipLibCheck": true,     // 라이브러리 타입 체크 스킵 (빌드 속도^)
    "esModuleInterop": true   // CommonJS 호환
  }
}
```

## 빠른 해결 트릭

```typescript
// 급할 때 (비추천, 임시용)
// @ts-ignore  // 다음 줄 무시
// @ts-expect-error  // 에러 예상 (더 안전)
(value as any)  // any로 캐스팅
```"""

    def _generate_cors_troubleshooting(self) -> str:
        """CORS 에러 해결"""
        return """# CORS 에러 완벽 해결 가이드

## 에러 메시지

```
Access to fetch at 'http://api.example.com' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

## CORS란?

**Cross-Origin Resource Sharing** - 브라우저 보안 정책으로, 다른 도메인으로의 요청을 제한합니다.

```
http://localhost:3000 -> http://api.example.com  [X] CORS 에러
http://localhost:3000 -> http://localhost:3000   [O] 같은 Origin
```

## 해결 방법

### 1. 백엔드에서 CORS 허용 (권장)

**Express.js**
```javascript
const cors = require('cors');

// 모든 origin 허용 (개발용)
app.use(cors());

// 특정 origin만 허용 (프로덕션)
app.use(cors({
  origin: ['http://localhost:3000', 'https://myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

**FastAPI (Python)** — 이 레포의 레거시 서버는 `backend/cors_config.py`의 `get_cors_allow_origins()` 사용 (`CORS_ALLOW_ORIGINS` 환경 변수).
```python
from fastapi.middleware.cors import CORSMiddleware
from cors_config import get_cors_allow_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Django**
```python
# settings.py
INSTALLED_APPS = ['corsheaders', ...]
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### 2. 프록시 사용 (프론트엔드)

**Next.js (next.config.js)**
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api.example.com/:path*',
      },
    ];
  },
};

// 사용: fetch('/api/users') -> http://api.example.com/users
```

**Vite (vite.config.ts)**
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, ''),
      },
    },
  },
});
```

### 3. 개발용 브라우저 확장

- Chrome: "Allow CORS" 확장 프로그램
- [!] 개발용으로만 사용, 프로덕션에서는 백엔드 설정 필수

## 주의사항

| 상황 | credentials | withCredentials |
|------|-------------|-----------------|
| 쿠키 전송 | `credentials: true` | `withCredentials: true` |
| 쿠키 없음 | `credentials: false` | 불필요 |

```javascript
// 쿠키 포함 요청
fetch(url, { credentials: 'include' });
axios.get(url, { withCredentials: true });
```"""

    def _generate_http_error_troubleshooting(self, query: str) -> str:
        """HTTP 에러 해결"""
        if "500" in query:
            return """# HTTP 500 에러 해결 가이드

## 500 Internal Server Error란?

서버 측에서 예기치 않은 오류가 발생했음을 의미합니다.

## 디버깅 단계

### 1. 서버 로그 확인

```bash
# Node.js
tail -f logs/error.log

# Python
tail -f /var/log/app/error.log

# Docker
docker logs -f container_name
```

### 2. 흔한 원인

| 원인 | 해결책 |
|------|--------|
| 문법 에러 | 코드 검토, 린터 사용 |
| DB 연결 실패 | 연결 문자열, 서비스 상태 확인 |
| 환경변수 누락 | .env 파일 확인 |
| 메모리 부족 | 서버 리소스 확인 |
| 권한 문제 | 파일/디렉토리 권한 확인 |

### 3. 에러 핸들링 추가

**Express.js**
```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal Server Error'
  });
});
```

**FastAPI**
```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc) if DEBUG else "Internal Server Error"}
    )
```"""

        return """# HTTP 에러 코드 해결 가이드

## 주요 에러 코드

| 코드 | 의미 | 원인 |
|------|------|------|
| 400 | Bad Request | 잘못된 요청 형식 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 500 | Internal Server Error | 서버 오류 |
| 502 | Bad Gateway | 프록시/게이트웨이 오류 |
| 503 | Service Unavailable | 서버 과부하/점검 |

## 클라이언트 에러 (4xx) 해결

### 400 Bad Request
```javascript
// 요청 데이터 형식 확인
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'test' })  // JSON 형식
});
```

### 401 Unauthorized
```javascript
// 인증 토큰 포함
fetch('/api/protected', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 404 Not Found
- URL 경로 확인
- 백엔드 라우트 정의 확인
- 대소문자 구분 확인

## 서버 에러 (5xx) 해결

### 502 Bad Gateway
```bash
# Nginx 설정 확인
upstream backend {
  server 127.0.0.1:5002;  # 통합 main_server 기본 포트 (환경에 맞게 조정)
  keepalive 64;
}

# 프록시 타임아웃 늘리기
proxy_connect_timeout 60;
proxy_read_timeout 60;
```

### 503 Service Unavailable
```bash
# 서버 상태 확인
systemctl status nginx
systemctl status your-app

# 재시작
systemctl restart your-app
```"""

    def _generate_permission_troubleshooting(self) -> str:
        """권한 에러 해결"""
        return """# Permission Denied 에러 해결 가이드

## 흔한 원인과 해결책

### 1. 파일/폴더 권한 문제

```bash
# 권한 확인
ls -la /path/to/file

# 권한 변경
chmod 755 /path/to/file
chmod -R 755 /path/to/folder

# 소유자 변경
sudo chown $USER:$USER /path/to/file
sudo chown -R $USER:$USER /path/to/folder
```

### 2. npm/node_modules 권한 문제

```bash
# 방법 1: npm 전역 디렉토리 변경
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# PATH에 추가: export PATH=~/.npm-global/bin:$PATH

# 방법 2: 권한 수정
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules/
```

### 3. Docker 권한 문제

```bash
# Docker 그룹에 사용자 추가
sudo usermod -aG docker $USER

# 재로그인 또는
newgrp docker
```

### 4. SSH 키 권한

```bash
# SSH 키 권한은 반드시 600
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 700 ~/.ssh
```

### 5. 포트 접근 권한 (1024 이하)

```bash
# 방법 1: 높은 포트 사용 (권장)
# 80 대신 8080, 443 대신 8443

# 방법 2: iptables 리다이렉트
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
```

## 디버깅 팁

```bash
# 현재 사용자 확인
whoami
id

# 파일 권한 상세 확인
stat /path/to/file
getfacl /path/to/file
```"""

    def _generate_connection_troubleshooting(self) -> str:
        """연결 에러 해결"""
        return """# Connection Refused 에러 해결 가이드

## 흔한 원인과 해결책

### 1. 서비스가 실행 중이 아님

```bash
# 서비스 상태 확인
systemctl status nginx
systemctl status your-app
docker ps

# 프로세스 확인
ps aux | grep your-app
lsof -i :8080
```

### 2. 잘못된 포트

```bash
# 열린 포트 확인
netstat -tulpn | grep LISTEN
ss -tulpn | grep LISTEN

# 특정 포트 확인
lsof -i :3000
```

### 3. 방화벽 차단

```bash
# UFW (Ubuntu)
sudo ufw status
sudo ufw allow 8080

# firewalld (CentOS)
sudo firewall-cmd --list-all
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --reload
```

### 4. localhost vs 0.0.0.0

```python
# [X] 외부 접근 불가
app.run(host='127.0.0.1', port=5000)

# [O] 외부 접근 가능
app.run(host='0.0.0.0', port=5000)
```

### 5. Docker 네트워크 문제

```bash
# 포트 매핑 확인
docker ps -a

# 컨테이너 네트워크 확인
docker network ls
docker inspect container_name

# 올바른 포트 매핑
docker run -p 8080:80 nginx
```

### 6. 데이터베이스 연결

```bash
# PostgreSQL
psql -h localhost -p 5432 -U user -d database

# MySQL
mysql -h localhost -P 3306 -u user -p

# Redis
redis-cli -h localhost -p 6379 ping
```

## 디버깅 팁

```bash
# telnet으로 연결 테스트
telnet localhost 8080

# nc로 테스트
nc -zv localhost 8080

# curl로 테스트
curl -v http://localhost:8080
```"""

    def _generate_memory_troubleshooting(self) -> str:
        """메모리 에러 해결"""
        return """# Out of Memory 에러 해결 가이드

## JavaScript/Node.js 힙 메모리

### 에러 메시지
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

### 해결책

```bash
# Node.js 힙 메모리 증가
node --max-old-space-size=4096 app.js

# npm/yarn 빌드 시
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

```json
// package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

## Docker 메모리

### 에러 메시지
```
Exited (137) - OOM Killed
```

### 해결책

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 512M
```

```bash
# Docker run
docker run -m 2g --memory-swap 4g myapp
```

## Python 메모리

### 대용량 데이터 처리

```python
# 청크 단위로 읽기
import pandas as pd

# [X] 메모리 부족
df = pd.read_csv('huge.csv')

# [O] 청크 단위
for chunk in pd.read_csv('huge.csv', chunksize=10000):
    process(chunk)
```

### 제너레이터 사용

```python
# [X] 리스트 전체 로드
def get_all():
    return [process(i) for i in range(1000000)]

# [O] 제너레이터
def get_all():
    for i in range(1000000):
        yield process(i)
```

## 시스템 메모리 확인

```bash
# 메모리 사용량
free -h
htop

# 프로세스별 메모리
ps aux --sort=-%mem | head -20

# OOM 로그 확인
dmesg | grep -i "out of memory"
journalctl -k | grep -i "oom"
```

## 예방 방법

1. **메모리 모니터링** 설정
2. **스왑 공간** 확보
3. **메모리 누수** 정기 점검
4. **적절한 인스턴스 크기** 선택"""

    def _generate_npm_troubleshooting(self, query: str) -> str:
        """npm 문제 해결"""
        return """# npm 에러 해결 가이드

## 흔한 npm 에러와 해결책

### 1. EACCES 권한 에러

```bash
npm ERR! Error: EACCES: permission denied
```

**해결책:**
```bash
# 방법 1: npm 디렉토리 권한 변경
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# ~/.bashrc 또는 ~/.zshrc에 추가:
export PATH=~/.npm-global/bin:$PATH

# 방법 2: nvm 사용 (권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

### 2. ERESOLVE 의존성 충돌

```bash
npm ERR! ERESOLVE unable to resolve dependency tree
```

**해결책:**
```bash
# 방법 1: legacy-peer-deps 옵션
npm install --legacy-peer-deps

# 방법 2: force 옵션 (주의)
npm install --force

# 방법 3: node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 3. 모듈을 찾을 수 없음

```bash
Error: Cannot find module 'xxx'
```

**해결책:**
```bash
# 패키지 재설치
npm install

# 특정 패키지 설치
npm install xxx

# 캐시 정리 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 4. 네트워크 에러

```bash
npm ERR! network request failed
```

**해결책:**
```bash
# 레지스트리 변경 (느릴 때)
npm config set registry https://registry.npmmirror.com

# 프록시 설정 (회사 네트워크)
npm config set proxy http://proxy.company.com:8080

# SSL 문제 (임시)
npm config set strict-ssl false
```

### 5. 버전 호환성 문제

**해결책:**
```bash
# Node.js 버전 확인
node --version

# 권장 버전 사용 (nvm)
nvm use 18

# 엔진 요구사항 확인
cat package.json | grep engines
```

## 일반적인 디버깅 순서

1. **캐시 정리**: `npm cache clean --force`
2. **node_modules 삭제**: `rm -rf node_modules`
3. **lock 파일 삭제**: `rm package-lock.json`
4. **재설치**: `npm install`
5. **Node.js 버전 확인**: `node --version`

## 예방 팁

- `package-lock.json`을 버전 관리에 포함
- 정기적으로 `npm audit fix` 실행
- `.nvmrc` 파일로 Node 버전 고정
- `npm ci` 사용 (CI/CD 환경)

문제가 계속되면 에러 메시지 전체를 공유해주세요!"""

    def _generate_git_troubleshooting(self, query: str) -> str:
        """Git 문제 해결"""
        query_lower = query.lower()

        # merge conflict 관련
        if "conflict" in query_lower or "충돌" in query_lower or "merge" in query_lower:
            return """# Git Merge Conflict 해결 가이드

## Merge Conflict란?

두 브랜치에서 같은 파일의 같은 부분을 다르게 수정했을 때 발생합니다.

## 해결 단계

### 1단계: 충돌 파일 확인

```bash
# 충돌 상태 확인
git status

# 출력 예시:
# both modified: src/app.js
```

### 2단계: 충돌 내용 이해

충돌이 발생한 파일을 열면 다음과 같이 표시됩니다:

```
<<<<<<< HEAD
// 현재 브랜치 (내 코드)
const greeting = "Hello";
=======
// 병합하려는 브랜치 (다른 사람 코드)
const greeting = "Hi";
>>>>>>> feature-branch
```

### 3단계: 충돌 해결

원하는 코드를 선택하거나 병합합니다:

```javascript
// 방법 1: 내 코드 선택
const greeting = "Hello";

// 방법 2: 상대방 코드 선택
const greeting = "Hi";

// 방법 3: 두 코드 병합
const greeting = "Hello, Hi";
```

**마커(`<<<<<<<`, `=======`, `>>>>>>>`) 반드시 삭제!**

### 4단계: 해결 완료 후 커밋

```bash
# 수정한 파일 스테이징
git add src/app.js

# 또는 모든 파일
git add .

# 커밋
git commit -m "Resolve merge conflict in app.js"

# 이미 메시지가 있으면
git commit --no-edit
```

## 유용한 도구

### VS Code에서 해결
- 충돌 파일 열면 자동으로 하이라이트
- "Accept Current Change", "Accept Incoming Change", "Accept Both" 버튼 제공

### 명령어로 특정 버전 선택

```bash
# 내 버전 선택 (현재 브랜치)
git checkout --ours file.txt

# 상대방 버전 선택 (병합 브랜치)
git checkout --theirs file.txt
```

### 병합 취소

```bash
# 병합 전으로 되돌리기
git merge --abort
```

## 예방 팁

```bash
# 병합 전 원격 최신화
git fetch origin
git pull origin main

# 작은 단위로 자주 커밋
# 기능 브랜치는 빨리 병합
```

충돌은 협업에서 자연스러운 현상입니다. 당황하지 마세요!"""

        # 일반 Git 문제
        return """# Git 에러 해결 가이드

## 흔한 Git 에러와 해결책

### 1. merge conflict (병합 충돌)

```
CONFLICT (content): Merge conflict in file.txt
```

**해결책:**
```bash
# 충돌 파일 확인
git status

# 파일 열어서 충돌 부분 수정
# <<<<<<< HEAD
# 내 변경사항
# =======
# 상대방 변경사항
# >>>>>>> branch-name

# 수정 후 커밋
git add .
git commit -m "Resolve merge conflict"
```

### 2. push 거부됨

```
error: failed to push some refs to 'origin'
```

**해결책:**
```bash
# 원격 변경사항 먼저 가져오기
git pull origin main --rebase

# 그 다음 푸시
git push origin main
```

### 3. detached HEAD

**해결책:**
```bash
# 새 브랜치 생성하여 저장
git checkout -b new-branch

# 또는 원래 브랜치로 돌아가기
git checkout main
```

### 4. 커밋 취소하기

```bash
# 마지막 커밋 취소 (변경사항 유지)
git reset --soft HEAD~1

# 마지막 커밋 취소 (변경사항 삭제)
git reset --hard HEAD~1

# 이미 푸시한 커밋 되돌리기
git revert <commit-hash>
```

### 5. 잘못된 브랜치에 커밋함

```bash
# 커밋 체리픽
git checkout correct-branch
git cherry-pick <commit-hash>

# 원래 브랜치에서 커밋 제거
git checkout wrong-branch
git reset --hard HEAD~1
```

## 유용한 복구 명령어

```bash
# 삭제된 브랜치 복구
git reflog
git checkout -b recovered-branch <commit-hash>

# 스테이징 취소
git reset HEAD file.txt

# 파일 변경 취소
git checkout -- file.txt

# 모든 로컬 변경 취소
git checkout .
```

도움이 더 필요하면 구체적인 에러 메시지를 알려주세요!"""

    def _generate_python_troubleshooting(self, query: str) -> str:
        """Python 문제 해결"""
        return """# Python 에러 해결 가이드

## 흔한 Python 에러

### 1. ModuleNotFoundError

```python
ModuleNotFoundError: No module named 'xxx'
```

**해결책:**
```bash
# 패키지 설치
pip install xxx

# 가상환경 확인
which python
pip list

# 가상환경 재생성
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

### 2. pip 권한 에러

**해결책:**
```bash
# 사용자 설치
pip install --user xxx

# 가상환경 사용 (권장)
python -m venv venv
source venv/bin/activate
pip install xxx
```

### 3. 버전 호환성

```bash
# Python 버전 확인
python --version

# 특정 버전 패키지 설치
pip install package==1.2.3

# 의존성 확인
pip check
```

### 4. ImportError: cannot import name

**해결책:**
- 순환 import 확인
- 파일명이 패키지명과 겹치는지 확인
- `__init__.py` 확인

### 5. SyntaxError

- Python 2 vs 3 문법 확인
- 들여쓰기 확인 (탭 vs 스페이스)
- 괄호 짝 맞는지 확인

## 디버깅 팁

```python
# 버전 정보
import sys
print(sys.version)

# 설치된 패키지 위치
import package
print(package.__file__)
```

구체적인 에러 메시지가 있으면 더 정확한 도움을 드릴 수 있습니다!"""

    def _generate_docker_troubleshooting(self, query: str) -> str:
        """Docker 문제 해결 - 상세 가이드"""
        query_lower = query.lower()

        # Exit code 137 (OOM Killed) 특화 응답
        if "137" in query or "oom" in query_lower or "재시작" in query:
            return self._generate_docker_oom_guide()

        return """# Docker 에러 해결 가이드

## 흔한 Docker 에러

### 1. Exit Code 137 (OOM Killed) - 메모리 부족

```
Container exited with code 137
```

**원인:** 컨테이너가 메모리 제한을 초과하여 강제 종료됨

**해결책:**
```bash
# 현재 메모리 사용량 확인
docker stats

# 메모리 제한 늘리기
docker run -m 2g --memory-swap 4g my-app

# docker-compose.yml 설정
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
```

### 2. 포트 충돌

```
Bind for 0.0.0.0:3000 failed: port is already allocated
```

**해결책:**
```bash
# 사용 중인 포트 확인
lsof -i :3000
# 또는
docker ps

# 컨테이너 중지
docker stop <container_id>

# 다른 포트 사용
docker run -p 3001:3000 my-app
```

### 3. 이미지 빌드 실패

**해결책:**
```bash
# 캐시 없이 빌드
docker build --no-cache -t my-app .

# 로그 확인
docker build -t my-app . 2>&1 | tee build.log
```

### 4. 컨테이너가 바로 종료됨

**해결책:**
```bash
# 로그 확인
docker logs <container_id>

# 인터랙티브 모드로 실행
docker run -it my-app /bin/sh

# CMD/ENTRYPOINT 확인
```

### 5. 권한 문제

**해결책:**
```bash
# Docker 그룹에 사용자 추가
sudo usermod -aG docker $USER
# 로그아웃 후 다시 로그인

# 또는 sudo 사용
sudo docker ps
```

### 5. 디스크 공간 부족

```bash
# 사용하지 않는 리소스 정리
docker system prune -a

# 볼륨 정리
docker volume prune

# 현재 사용량 확인
docker system df
```

## 유용한 디버깅 명령어

```bash
# 컨테이너 내부 접속
docker exec -it <container> /bin/sh

# 실시간 로그
docker logs -f <container>

# 리소스 사용량
docker stats
```

더 구체적인 에러가 있으면 알려주세요!"""

    def _generate_docker_oom_guide(self) -> str:
        """Docker Exit Code 137 (OOM) 전문 가이드"""
        return """# Docker Exit Code 137 해결 가이드 (OOM Killed)

## 문제 진단

### Exit Code 137의 의미

```
Container exited with code 137
```

**137 = 128 + 9 (SIGKILL)** - 시스템에 의해 강제 종료됨

> [!] 가장 흔한 원인은 **메모리 부족 (OOM - Out of Memory)** 입니다.

---

## 1단계: 문제 확인

```bash
# 컨테이너 종료 원인 확인
docker inspect <container_id> --format='{{.State.OOMKilled}}'
# true면 OOM 확실

# 시스템 로그에서 OOM 확인 (Linux)
dmesg | grep -i "killed process"
sudo journalctl -k | grep -i "oom"

# 현재 메모리 사용량 모니터링
docker stats --no-stream
```

---

## 2단계: 해결 방법

### 방법 1: 컨테이너 메모리 제한 늘리기

```bash
# CLI로 실행 시
docker run -m 2g --memory-swap 4g my-app

# docker-compose.yml
services:
  app:
    image: my-app
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    # 또는 (Compose v2)
    mem_limit: 2g
    memswap_limit: 4g
```

### 방법 2: 애플리케이션 메모리 최적화

**Node.js:**
```dockerfile
# 힙 메모리 제한 설정
CMD ["node", "--max-old-space-size=1536", "app.js"]
```

**Java:**
```dockerfile
ENV JAVA_OPTS="-Xmx1536m -Xms512m"
CMD ["java", "$JAVA_OPTS", "-jar", "app.jar"]
```

**Python:**
```dockerfile
# 메모리 프로파일링
RUN pip install memory-profiler
```

### 방법 3: Docker Desktop 메모리 설정 (Mac/Windows)

1. Docker Desktop -> Settings -> Resources
2. Memory 슬라이더를 늘림 (권장: 최소 4GB)
3. Apply & Restart

---

## 3단계: 장기 해결책

### 메모리 누수 탐지

```bash
# 시간에 따른 메모리 변화 관찰
watch -n 5 'docker stats --no-stream'

# 특정 컨테이너 상세 모니터링
docker stats <container_id>
```

### 멀티 스테이지 빌드로 이미지 최적화

```dockerfile
# 빌드 스테이지
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 프로덕션 스테이지 (더 작은 이미지)
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "app.js"]
```

---

## 예방 체크리스트

| 항목 | 확인 |
|------|------|
| 컨테이너 메모리 제한 설정? | [ ] |
| 애플리케이션 힙 크기 제한? | [ ] |
| 메모리 누수 테스트? | [ ] |
| 멀티 스테이지 빌드 사용? | [ ] |
| Docker Desktop 메모리 충분? | [ ] |

---

## 요약

1. `docker inspect`로 OOM 여부 확인
2. `-m` 옵션으로 메모리 제한 늘리기
3. 애플리케이션 레벨 메모리 최적화
4. 장기적으로 메모리 누수 점검

더 도움이 필요하시면 구체적인 상황을 알려주세요!"""

    def _generate_recommendation_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess
    ) -> str:
        """추천 응답 - 구체적이고 실용적인 추천"""
        query_lower = analysis.original_query.lower()

        # 프로그래밍 언어 추천
        if "언어" in query_lower and (
            "추천" in query_lower or "배울" in query_lower or "시작" in query_lower
        ):
            return self._generate_language_recommendation(query_lower)

        # 프레임워크 추천
        if "프레임워크" in query_lower or "라이브러리" in query_lower:
            return self._generate_framework_recommendation(query_lower)

        # 에디터/IDE 추천
        if "에디터" in query_lower or "ide" in query_lower or "vscode" in query_lower:
            return self._generate_ide_recommendation()

        # 책/강의 추천
        if (
            "책" in query_lower
            or "강의" in query_lower
            or "공부" in query_lower
            or "학습" in query_lower
        ):
            return self._generate_learning_recommendation(query_lower)

        # 호스팅/배포 추천
        if (
            "호스팅" in query_lower
            or "배포" in query_lower
            or "클라우드" in query_lower
        ):
            return self._generate_hosting_recommendation(query_lower)

        # 데이터베이스 추천
        if "데이터베이스" in query_lower or "db" in query_lower:
            return self._generate_database_recommendation(query_lower)

        # 일반 추천
        response_parts = []
        response_parts.append(f"# 추천: {analysis.original_query[:40]}\n\n")
        response_parts.append("## 추천 기준\n\n")
        response_parts.append(
            self._generate_recommendation_criteria(analysis.key_topics)
        )
        response_parts.append("\n## 추천 목록\n\n")
        response_parts.append(self._generate_recommendations(analysis.key_topics))
        response_parts.append("\n## 선택 팁\n\n")
        response_parts.append(self._generate_selection_tips(analysis.key_topics))
        return "".join(response_parts)

    def _generate_language_recommendation(self, query: str) -> str:
        """프로그래밍 언어 추천"""
        return """# 프로그래밍 언어 추천 가이드

## TL;DR

| 목적 | 추천 언어 | 이유 |
|------|----------|------|
| 입문/교육 | **Python** | 쉬운 문법, 범용성 |
| 웹 프론트엔드 | **JavaScript/TypeScript** | 유일한 선택 |
| 웹 백엔드 | **Python, Node.js, Go** | 생산성 vs 성능 |
| 모바일 앱 | **Kotlin(Android), Swift(iOS)** | 네이티브 |
| 크로스플랫폼 | **Flutter(Dart), React Native** | 한 번에 양쪽 |
| 데이터/AI | **Python** | 압도적 생태계 |
| 시스템/성능 | **Rust, Go, C++** | 저수준 제어 |

---

## 목적별 상세 추천

### 1. 처음 프로그래밍을 배운다면 -> **Python**

```python
# 간결하고 읽기 쉬운 문법
for i in range(10):
    print(f"Hello {i}")
```

**장점:**
- [+] 가장 쉬운 문법 (영어 읽듯이)
- [+] 범용성 (웹, 데이터, AI, 자동화)
- [+] 취업 시장 수요 높음

### 2. 웹 개발자가 되고 싶다면

**프론트엔드: JavaScript/TypeScript (필수)**
```javascript
// 웹 브라우저에서 돌아가는 유일한 언어
document.querySelector('button').onclick = () => {
  alert('클릭!');
};
```

**백엔드 선택지:**
| 언어 | 프레임워크 | 특징 |
|------|-----------|------|
| Python | FastAPI, Django | 빠른 개발 |
| Node.js | Express, NestJS | 프론트와 통일 |
| Go | Gin, Echo | 고성능 |
| Java | Spring Boot | 대기업 선호 |

### 3. 데이터/AI 분야 -> **Python**

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# 데이터 분석의 표준
df = pd.read_csv('data.csv')
```

**필수 라이브러리:**
- 데이터 분석: Pandas, NumPy
- 시각화: Matplotlib, Seaborn
- 머신러닝: Scikit-learn, XGBoost
- 딥러닝: PyTorch, TensorFlow

### 4. 모바일 앱 개발

| 플랫폼 | 네이티브 | 크로스플랫폼 |
|--------|---------|-------------|
| Android | Kotlin | Flutter, React Native |
| iOS | Swift | Flutter, React Native |

**2024년 추천:**
- 한 플랫폼만: 네이티브 (Kotlin/Swift)
- 양쪽 모두: **Flutter** (Dart)

### 5. 고성능/시스템 프로그래밍

| 언어 | 용도 | 특징 |
|------|------|------|
| **Rust** | 시스템, WebAssembly | 안전 + 성능 |
| **Go** | 서버, 클라우드 | 간단 + 빠름 |
| C/C++ | 게임, 임베디드 | 최고 성능 |

---

## 2024년 학습 로드맵

```
초급: Python -> JavaScript -> SQL
중급: TypeScript -> React/Next.js -> 백엔드 프레임워크
고급: 시스템 설계 -> 클라우드 -> 전문 분야
```

## 결론

> **"첫 언어는 Python, 웹 개발자는 JavaScript, 나머지는 목적에 맞게"**

어떤 분야에 관심이 있으신가요? 더 구체적인 로드맵을 안내해드릴 수 있어요!"""

    def _generate_framework_recommendation(self, query: str) -> str:
        """프레임워크 추천"""
        if "react" in query or "프론트" in query or "frontend" in query:
            return """# 프론트엔드 프레임워크 추천

## 2024년 추천 순위

| 순위 | 프레임워크 | 추천 이유 |
|------|-----------|----------|
| 1. | **React** | 취업 시장 1위, 생태계 |
| 2. | **Next.js** | React + 풀스택 |
| 3. | **Vue** | 학습 쉬움, 아시아 인기 |
| 4. | **Svelte** | 최신, 간결함 |

## 상황별 추천

### 취업이 목표라면 -> **React**
- 채용 공고 70% 이상
- 대기업, 스타트업 모두 사용

### 풀스택 개발 -> **Next.js**
- React 기반 + 서버 기능
- Vercel에서 쉬운 배포

### 빠른 학습 -> **Vue**
- 공식 문서 친절
- 한국/중국에서 인기

## 결론
**입문자:** Vue -> React 순서 학습
**취업 준비:** React + Next.js 집중"""

        if "백엔드" in query or "backend" in query or "서버" in query:
            return """# 백엔드 프레임워크 추천

## 언어별 추천

| 언어 | 프레임워크 | 특징 | 추천 |
|------|-----------|------|------|
| Python | **FastAPI** | 빠름, 자동문서화 | *** |
| Python | Django | 풀스택, 관리자 | *** |
| Node.js | **NestJS** | 구조화, TS | *** |
| Node.js | Express | 간단, 자유도 | ** |
| Java | **Spring Boot** | 대기업, 안정성 | *** |
| Go | Gin | 고성능 | ** |

## 상황별 추천

### 스타트업/빠른 개발
-> **FastAPI** (Python) 또는 **NestJS** (Node.js)

### 대기업 취업
-> **Spring Boot** (Java)

### 마이크로서비스
-> **Go + Gin** 또는 **FastAPI**

## 2024년 트렌드
1. TypeScript 백엔드 증가 (NestJS)
2. Python FastAPI 급성장
3. Serverless (AWS Lambda, Vercel)"""

        return """# 프레임워크 추천 가이드

## 분야별 추천

### 웹 프론트엔드

| 순위 | 프레임워크 | 특징 | 추천 대상 |
|------|-----------|------|----------|
| 1. | **React** | 취업 시장 1위, 생태계 최대 | 취업 준비생 |
| 2. | **Next.js** | React + SSR/SSG + API | 풀스택 지향 |
| 3. | **Vue** | 학습 쉬움, 문서 친절 | 입문자 |
| 4. | **Svelte** | 번들 크기 최소 | 성능 중시 |

### 웹 백엔드

| 순위 | 프레임워크 | 언어 | 특징 |
|------|-----------|------|------|
| 1. | **FastAPI** | Python | 자동 문서화, 비동기 |
| 2. | **NestJS** | TypeScript | 구조화, DI |
| 3. | **Spring Boot** | Java | 대기업 표준 |
| 4. | **Django** | Python | 배터리 포함 |
| 5. | **Express** | JavaScript | 자유도 최고 |

### 모바일

| 순위 | 프레임워크 | 특징 |
|------|-----------|------|
| 1. | **Flutter** | 크로스플랫폼 1위, Dart |
| 2. | **React Native** | JS/TS, 웹 개발자 친화 |
| 3. | **Swift/Kotlin** | 네이티브 최고 성능 |

## 상황별 선택 가이드

| 상황 | 추천 |
|------|------|
| 취업 준비 | React + Next.js |
| 빠른 프로토타입 | Vue + FastAPI |
| 대기업 지원 | React + Spring Boot |
| 1인 풀스택 | Next.js (프론트+백엔드) |
| 고성능 필요 | Svelte + Go/Rust |

## 2024년 트렌드

1. **TypeScript** 필수화
2. **서버 컴포넌트** (React Server Components)
3. **Edge Computing** (Cloudflare Workers)
4. **AI 통합** (Vercel AI SDK)

원하는 분야를 더 구체적으로 말씀해주시면 상세 추천드릴게요!"""

    def _generate_ide_recommendation(self) -> str:
        """IDE/에디터 추천"""
        return """# IDE/에디터 추천 가이드

## 범용 에디터

### 1위: **VS Code** (무료) *****

```
장점:
[O] 무료 + 오픈소스
[O] 확장 프로그램 풍부
[O] 가볍고 빠름
[O] 모든 언어 지원
[O] Git 통합

필수 확장:
- Prettier (코드 포맷)
- ESLint (JS/TS 린팅)
- GitLens (Git 히스토리)
- Auto Rename Tag (HTML)
```

### 2위: **Cursor** (AI 통합)

```
장점:
[O] VS Code 기반
[O] AI 코드 완성 내장
[O] 자연어로 코딩 가능
```

---

## 언어별 전문 IDE

| 언어 | 추천 IDE | 가격 |
|------|---------|------|
| Python | **PyCharm** | 무료/유료 |
| Java | **IntelliJ IDEA** | 무료/유료 |
| C# | **Visual Studio** | 무료 |
| iOS | **Xcode** | 무료 |
| Android | **Android Studio** | 무료 |

---

## 결론

| 상황 | 추천 |
|------|------|
| 입문자 | VS Code |
| 웹 개발 | VS Code |
| Python 전문 | PyCharm |
| Java 전문 | IntelliJ |
| AI 활용 | Cursor |

**시작은 VS Code로, 전문 분야가 생기면 전용 IDE로!**"""

    def _generate_learning_recommendation(self, query: str) -> str:
        """학습 자료 추천"""
        if "python" in query:
            return """# Python 학습 자료 추천

## 입문 (0->기초)

### 무료 자료
1. **점프 투 파이썬** (wikidocs.net/book/1)
2. **코드잇 무료 강의**
3. **생활코딩 Python**

### 유료 강의
1. **인프런 - 파이썬 무료 입문**
2. **노마드코더 - Python으로 웹 스크래퍼 만들기**

## 중급 (기초->실무)

### 책
1. **파이썬 코딩의 기술** (이펙티브 파이썬)
2. **클린 코드, 이제는 파이썬이다**

### 실습 사이트
- **LeetCode** - 알고리즘
- **프로그래머스** - 코딩테스트
- **Kaggle** - 데이터 분석

## 학습 로드맵

```
1주차: 기본 문법 (변수, 조건문, 반복문)
2주차: 함수, 클래스
3주차: 파일 처리, 예외 처리
4주차: 라이브러리 (requests, pandas)
5주차~: 프로젝트 시작
```"""

        if "javascript" in query or "react" in query or "웹" in query:
            return """# 웹 개발 학습 자료 추천

## 입문

### 무료
1. **생활코딩** - HTML/CSS/JS 기초
2. **MDN Web Docs** - 공식 문서
3. **freeCodeCamp** - 실습 중심

### 유료 (인프런 추천)
1. **코딩애플** - HTML/CSS
2. **노마드코더** - JavaScript

## React 학습

### 공식 문서 (최고!)
- **react.dev** (새로운 공식 문서)

### 강의
1. **노마드코더 - React 무료 강의**
2. **인프런 - 따라하며 배우는 리액트**

## 학습 순서

```
HTML/CSS (1주) -> JavaScript (2주) -> React (2주) -> Next.js (1주)
```

**핵심:** 이론보다 **직접 만들어보기**가 중요합니다!"""

        return """# 프로그래밍 학습 자료 추천

## 무료 학습 사이트

| 사이트 | 특징 | 추천 |
|--------|------|------|
| **생활코딩** | 한글, 입문 | *** |
| **코드잇** | 한글, 체계적 | *** |
| **freeCodeCamp** | 영어, 실습 | *** |
| **Codecademy** | 영어, 인터랙티브 | ** |

## 유료 강의 플랫폼

| 플랫폼 | 특징 |
|--------|------|
| **인프런** | 한글, 다양한 주제 |
| **노마드코더** | 한글, 실무 프로젝트 |
| **Udemy** | 영어, 가성비 |

## 공부 팁

1. **문서보다 실습** - 직접 코드 작성
2. **작은 프로젝트** - Todo, 계산기 등
3. **에러 즐기기** - 디버깅이 실력
4. **꾸준함** - 매일 30분이라도

어떤 분야를 배우고 싶으신가요?"""

    def _generate_hosting_recommendation(self, query: str) -> str:
        """호스팅/배포 추천"""
        return """# 호스팅/배포 서비스 추천

## 무료 호스팅

| 서비스 | 용도 | 무료 범위 |
|--------|------|----------|
| **Vercel** | 프론트엔드, Next.js | 개인 무제한 |
| **Netlify** | 정적 사이트 | 월 100GB |
| **Railway** | 백엔드, DB | 월 $5 크레딧 |
| **Render** | 풀스택 | 제한적 무료 |
| **GitHub Pages** | 정적 사이트 | 완전 무료 |

## 추천 조합

### 개인 프로젝트
```
프론트엔드: Vercel (무료)
백엔드: Railway (무료)
DB: Supabase (무료)
```

### 스타트업/소규모
```
풀스택: AWS Lightsail ($3.5/월)
또는: DigitalOcean ($4/월)
```

### 프로덕션
```
AWS / GCP / Azure
-> 트래픽에 따라 비용 발생
```

## 배포 난이도

| 쉬움 | 중간 | 어려움 |
|------|------|--------|
| Vercel | Railway | AWS EC2 |
| Netlify | Render | GCP GKE |
| GitHub Pages | Heroku | Kubernetes |

## 결론

**처음 배포:** Vercel + Railway
**학습 목적:** AWS 프리티어 (1년 무료)"""

    def _generate_database_recommendation(self, query: str) -> str:
        """데이터베이스 추천"""
        return """# 데이터베이스 추천 가이드

## 한눈에 보기

| 유형 | DB | 용도 |
|------|-----|------|
| SQL | **PostgreSQL** | 범용, 기능 풍부 |
| SQL | MySQL | 웹 표준, 쉬움 |
| NoSQL | **MongoDB** | 유연한 스키마 |
| NoSQL | Redis | 캐시, 세션 |
| 클라우드 | **Supabase** | PostgreSQL + BaaS |

## 상황별 추천

### 처음 배운다면 -> **PostgreSQL**
- SQL 표준 준수
- 기능이 풍부
- 무료

### 빠른 개발 -> **Supabase**
- PostgreSQL 기반
- 인증, API 자동 생성
- 무료 티어 있음

### 유연한 스키마 -> **MongoDB**
- JSON 형태 저장
- 스키마 변경 쉬움

### 캐싱 -> **Redis**
- 초고속 (인메모리)
- 세션, 캐시에 필수

## 추천 조합

```
메인 DB: PostgreSQL (또는 Supabase)
캐시: Redis
검색: Elasticsearch (선택)
```

## 클라우드 DB 서비스

| 서비스 | DB | 무료 티어 |
|--------|-----|----------|
| **Supabase** | PostgreSQL | 500MB |
| **PlanetScale** | MySQL | 5GB |
| **MongoDB Atlas** | MongoDB | 512MB |
| **Upstash** | Redis | 10K 요청/일 |

**입문자 추천:** Supabase (PostgreSQL + 편의기능)"""

    def _generate_general_response(
        self, analysis: QueryAnalysis, thought: ThoughtProcess
    ) -> str:
        """일반 응답"""
        query = analysis.original_query or ""
        if analysis.key_topics and analysis.key_topics[0] != "general":
            return self._generate_explanation_response(analysis, thought)

        # 분석·파악·요약 등 실질 질문은 설명 경로로 (템플릿 '더 구체적으로' 회피)
        if re.search(
            r"파악|분석|분위기|현황|동향|정리|요약|설명|알려|말해|해줘|해주",
            query,
        ):
            return self._generate_explanation_response(analysis, thought)

        # 인사 또는 일반 대화
        return self._generate_conversational_response(query)

    def _enhance_response(self, response: str, analysis: QueryAnalysis) -> str:
        """응답 품질 향상"""
        # 길이 검증
        if len(response) < 200:
            response += "\n\n더 자세한 정보가 필요하시면 말씀해주세요!"

        # 마크다운 정리
        response = self._clean_markdown(response)

        return response

    def _clean_markdown(self, text: str) -> str:
        """마크다운 정리"""
        # 연속된 빈 줄 제거
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    # === Helper Methods ===

    def _generate_code_for_topics(
        self, topics: List[str], lang: str, query: str
    ) -> str:
        """주제별 코드 생성"""
        query_lower = query.lower()

        # Next.js 프로젝트
        if "next" in query_lower or "nextjs" in query_lower:
            return self._get_nextjs_code(query_lower)

        # FastAPI 배포
        if "fastapi" in query_lower and (
            "배포" in query_lower or "deploy" in query_lower
        ):
            return self._get_fastapi_deploy_code()

        # 웹 크롤러
        if "web_crawling" in topics or "크롤" in query_lower:
            return self._get_web_crawler_code(lang)

        # API
        if "api" in topics or "rest" in query_lower:
            return self._get_api_code(lang)

        # TypeScript
        if (
            "typescript" in topics
            or "ts" in query_lower
            or "타입스크립트" in query_lower
        ):
            return self._get_typescript_code(query_lower)

        # SQL / 데이터베이스
        if (
            "sql" in topics
            or "sql" in query_lower
            or "쿼리" in query_lower
            or "데이터베이스" in query_lower
        ):
            return self._get_sql_code(query_lower)

        # 알고리즘
        if (
            "algorithm" in topics
            or "알고리즘" in query_lower
            or "정렬" in query_lower
            or "검색" in query_lower
        ):
            return self._get_algorithm_code(query_lower, lang)

        # React 컴포넌트
        if "react" in topics or "리액트" in query_lower or "컴포넌트" in query_lower:
            return self._get_react_code(query_lower)

        # 로그인/인증
        if "로그인" in query_lower or "인증" in query_lower or "auth" in query_lower:
            return self._get_auth_code(lang)

        # 파일 처리
        if "파일" in query_lower or "file" in query_lower:
            return self._get_file_handling_code(lang)

        # 데이터 처리
        if any(t in topics for t in ["python", "data"]):
            return self._get_data_processing_code(lang)

        # 테스트 코드
        if "테스트" in query_lower or "test" in query_lower or "jest" in query_lower:
            return self._get_test_code(lang, query_lower)

        # 웹소켓/실시간
        if (
            "websocket" in query_lower
            or "웹소켓" in query_lower
            or "실시간" in query_lower
        ):
            return self._get_websocket_code(lang)

        # 이메일 발송
        if "이메일" in query_lower or "email" in query_lower or "메일" in query_lower:
            return self._get_email_code(lang)

        # 스케줄러/크론
        if "스케줄" in query_lower or "cron" in query_lower or "예약" in query_lower:
            return self._get_scheduler_code(lang)

        # 캐싱
        if "캐시" in query_lower or "cache" in query_lower or "redis" in query_lower:
            return self._get_cache_code(lang)

        # 기본 코드
        return self._get_basic_code(lang, query)

    def _get_web_crawler_code(self, lang: str) -> str:
        """웹 크롤러 코드"""
        if lang == "python":
            return '''```python
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time

class WebCrawler:
    """범용 웹 크롤러 클래스"""
    
    def __init__(self, base_url: str, delay: float = 1.0):
        self.base_url = base_url
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.visited = set()
    
    def fetch_page(self, url: str) -> BeautifulSoup:
        """페이지 가져오기"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except requests.RequestException as e:
            print(f"요청 실패: {url} - {e}")
            return None
    
    def extract_links(self, soup: BeautifulSoup, base_url: str) -> list:
        """페이지에서 링크 추출"""
        links = []
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            full_url = urljoin(base_url, href)
            if full_url.startswith(self.base_url):
                links.append(full_url)
        return list(set(links))
    
    def extract_content(self, soup: BeautifulSoup) -> dict:
        """페이지 콘텐츠 추출"""
        return {
            'title': soup.title.text.strip() if soup.title else '',
            'headings': [h.text.strip() for h in soup.find_all(['h1', 'h2', 'h3'])],
            'paragraphs': [p.text.strip() for p in soup.find_all('p') if p.text.strip()],
            'images': [img.get('src', '') for img in soup.find_all('img')],
        }
    
    def crawl(self, max_pages: int = 10) -> list:
        """크롤링 실행"""
        results = []
        to_visit = [self.base_url]
        
        while to_visit and len(results) < max_pages:
            url = to_visit.pop(0)
            
            if url in self.visited:
                continue
            
            print(f"크롤링: {url}")
            soup = self.fetch_page(url)
            
            if soup:
                self.visited.add(url)
                content = self.extract_content(soup)
                content['url'] = url
                results.append(content)
                
                # 새 링크 추가
                new_links = self.extract_links(soup, url)
                to_visit.extend([l for l in new_links if l not in self.visited])
            
            time.sleep(self.delay)
        
        return results


    def save_to_json(self, data: list, filename: str = "crawled_data.json"):
        """결과를 JSON 파일로 저장"""
        import json
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"데이터가 {filename}에 저장되었습니다.")
    
    def save_to_csv(self, data: list, filename: str = "crawled_data.csv"):
        """결과를 CSV 파일로 저장"""
        import csv
        if not data:
            return
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['url', 'title'])
            writer.writeheader()
            for item in data:
                writer.writerow({'url': item['url'], 'title': item['title']})
        print(f"데이터가 {filename}에 저장되었습니다.")


# 사용 예시
if __name__ == "__main__":
    crawler = WebCrawler("https://example.com", delay=1.0)
    results = crawler.crawl(max_pages=5)
    
    # JSON으로 저장
    crawler.save_to_json(results, "output.json")
    
    # CSV로 저장
    crawler.save_to_csv(results, "output.csv")
    
    # 결과 출력
    for page in results:
        print(f"\\n제목: {page['title']}")
        print(f"URL: {page['url']}")
```'''
        else:
            return f"```{lang}\n// {lang} 웹 크롤러 예시\n// 구현 예정\n```"

    def _get_api_code(self, lang: str) -> str:
        """API 코드"""
        if lang == "python":
            return '''```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="My API", version="1.0.0")

# 데이터 모델
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    created_at: datetime = datetime.now()

# 임시 데이터 저장소
items_db: List[Item] = []

@app.get("/")
def root():
    return {"message": "Welcome to My API"}

@app.get("/items", response_model=List[Item])
def get_items(skip: int = 0, limit: int = 10):
    """모든 아이템 조회"""
    return items_db[skip:skip + limit]

@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    """특정 아이템 조회"""
    for item in items_db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

@app.post("/items", response_model=Item, status_code=201)
def create_item(item: Item):
    """아이템 생성"""
    item.id = len(items_db) + 1
    items_db.append(item)
    return item

@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: int, updated_item: Item):
    """아이템 수정"""
    for idx, item in enumerate(items_db):
        if item.id == item_id:
            updated_item.id = item_id
            items_db[idx] = updated_item
            return updated_item
    raise HTTPException(status_code=404, detail="Item not found")

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    """아이템 삭제"""
    for idx, item in enumerate(items_db):
        if item.id == item_id:
            items_db.pop(idx)
            return {"message": "Item deleted"}
    raise HTTPException(status_code=404, detail="Item not found")

# 실행: uvicorn main:app --reload
```'''
        return f"```{lang}\n// API 코드 예시\n```"

    def _get_data_processing_code(self, lang: str) -> str:
        """데이터 처리 코드"""
        return '''```python
import pandas as pd
import numpy as np
from typing import List, Dict

def process_data(data: List[Dict]) -> pd.DataFrame:
    """데이터 처리 및 분석"""
    df = pd.DataFrame(data)
    
    # 결측치 처리
    df = df.fillna(0)
    
    # 데이터 타입 변환
    for col in df.select_dtypes(include=['object']).columns:
        try:
            df[col] = pd.to_numeric(df[col])
        except ValueError:
            pass
    
    return df

def analyze_data(df: pd.DataFrame) -> Dict:
    """데이터 분석"""
    return {
        'row_count': len(df),
        'columns': list(df.columns),
        'summary': df.describe().to_dict(),
        'missing_values': df.isnull().sum().to_dict(),
    }

# 사용 예시
data = [
    {'name': 'A', 'value': 100},
    {'name': 'B', 'value': 200},
]
df = process_data(data)
analysis = analyze_data(df)
print(analysis)
```'''

    def _get_test_code(self, lang: str, query: str) -> str:
        """테스트 코드 생성"""
        if "react" in query or "컴포넌트" in query:
            return """```typescript
// Button.test.tsx - React 컴포넌트 테스트
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button 컴포넌트', () => {
  test('텍스트가 렌더링되어야 함', () => {
    render(<Button>클릭하세요</Button>);
    expect(screen.getByText('클릭하세요')).toBeInTheDocument();
  });

  test('클릭 시 onClick 핸들러가 호출되어야 함', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    
    fireEvent.click(screen.getByText('클릭'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disabled 상태에서는 클릭이 안 되어야 함', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>클릭</Button>);
    
    fireEvent.click(screen.getByText('클릭'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('스냅샷 테스트', () => {
    const { container } = render(<Button variant="primary">버튼</Button>);
    expect(container).toMatchSnapshot();
  });
});
```

```bash
# 테스트 실행
npm test -- --watch  # 감시 모드
npm test -- --coverage  # 커버리지 확인
```"""

        if lang == "python" or "pytest" in query:
            return '''```python
# test_calculator.py - pytest 테스트
import pytest
from calculator import Calculator

class TestCalculator:
    """Calculator 클래스 테스트"""
    
    @pytest.fixture
    def calc(self):
        """Calculator 인스턴스 픽스처"""
        return Calculator()
    
    def test_add(self, calc):
        """덧셈 테스트"""
        assert calc.add(2, 3) == 5
        assert calc.add(-1, 1) == 0
        assert calc.add(0, 0) == 0
    
    def test_subtract(self, calc):
        """뺄셈 테스트"""
        assert calc.subtract(5, 3) == 2
        assert calc.subtract(1, 1) == 0
    
    def test_multiply(self, calc):
        """곱셈 테스트"""
        assert calc.multiply(3, 4) == 12
        assert calc.multiply(-2, 3) == -6
    
    def test_divide(self, calc):
        """나눗셈 테스트"""
        assert calc.divide(10, 2) == 5
        assert calc.divide(7, 2) == 3.5
    
    def test_divide_by_zero(self, calc):
        """0으로 나누기 예외 테스트"""
        with pytest.raises(ZeroDivisionError):
            calc.divide(10, 0)
    
    @pytest.mark.parametrize("a, b, expected", [
        (1, 1, 2),
        (2, 3, 5),
        (-1, -1, -2),
        (100, 200, 300),
    ])
    def test_add_parametrized(self, calc, a, b, expected):
        """파라미터화된 덧셈 테스트"""
        assert calc.add(a, b) == expected

# 비동기 테스트
@pytest.mark.asyncio
async def test_async_fetch():
    """비동기 함수 테스트"""
    result = await fetch_data("https://api.example.com/data")
    assert result is not None
```

```bash
# 테스트 실행
pytest -v                    # 상세 출력
pytest --cov=src             # 커버리지
pytest -k "test_add"         # 특정 테스트만
pytest --lf                  # 마지막 실패 테스트만
```'''

        return """```javascript
// api.test.js - Jest API 테스트
const request = require('supertest');
const app = require('./app');

describe('API 테스트', () => {
  describe('GET /api/users', () => {
    test('200 상태코드를 반환해야 함', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
    });

    test('사용자 배열을 반환해야 함', async () => {
      const response = await request(app).get('/api/users');
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    test('새 사용자를 생성해야 함', async () => {
      const newUser = { name: 'Test', email: 'test@example.com' };
      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test');
    });

    test('잘못된 데이터에 400 반환', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({})
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
    });
  });
});
```"""

    def _get_websocket_code(self, lang: str) -> str:
        """웹소켓 코드 생성"""
        if lang == "python":
            return '''```python
# FastAPI WebSocket 서버
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import json

app = FastAPI()

class ConnectionManager:
    """WebSocket 연결 관리자"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"연결됨. 총 {len(self.active_connections)}명")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"연결 해제. 총 {len(self.active_connections)}명")
    
    async def send_personal(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str, exclude: WebSocket = None):
        for connection in self.active_connections:
            if connection != exclude:
                await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    await manager.broadcast(f"{client_id}님이 입장했습니다.")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.dumps({
                "sender": client_id,
                "message": data
            })
            await manager.broadcast(message)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"{client_id}님이 퇴장했습니다.")
```

```javascript
// 클라이언트 (React)
const [messages, setMessages] = useState([]);
const ws = useRef(null);

useEffect(() => {
  ws.current = new WebSocket('ws://localhost:5002/ws/user1');
  
  ws.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setMessages(prev => [...prev, data]);
  };
  
  return () => ws.current?.close();
}, []);

const sendMessage = (msg) => {
  ws.current?.send(msg);
};
```'''

        return """```javascript
// Node.js WebSocket 서버 (ws 라이브러리)
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`클라이언트 연결. 총 ${clients.size}명`);
  
  ws.on('message', (message) => {
    console.log(`받은 메시지: ${message}`);
    
    // 모든 클라이언트에게 브로드캐스트
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`클라이언트 연결 해제. 총 ${clients.size}명`);
  });
});

console.log('WebSocket 서버 시작: ws://localhost:8080');
```"""

    def _get_email_code(self, lang: str) -> str:
        """이메일 발송 코드"""
        if lang == "python":
            return '''```python
# 이메일 발송 (Python + SMTP)
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os

class EmailSender:
    """이메일 발송 클래스"""
    
    def __init__(self, smtp_server: str, port: int, username: str, password: str):
        self.smtp_server = smtp_server
        self.port = port
        self.username = username
        self.password = password
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html: bool = False,
        attachments: list = None
    ):
        """이메일 발송"""
        msg = MIMEMultipart()
        msg['From'] = self.username
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # 본문 추가
        content_type = 'html' if html else 'plain'
        msg.attach(MIMEText(body, content_type, 'utf-8'))
        
        # 첨부파일 추가
        if attachments:
            for filepath in attachments:
                self._attach_file(msg, filepath)
        
        # 발송
        with smtplib.SMTP(self.smtp_server, self.port) as server:
            server.starttls()
            server.login(self.username, self.password)
            server.send_message(msg)
        
        print(f"이메일 발송 완료: {to_email}")
    
    def _attach_file(self, msg: MIMEMultipart, filepath: str):
        """파일 첨부"""
        with open(filepath, 'rb') as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(f.read())
        
        encoders.encode_base64(part)
        filename = os.path.basename(filepath)
        part.add_header('Content-Disposition', f'attachment; filename={filename}')
        msg.attach(part)

# 사용 예시
sender = EmailSender(
    smtp_server='smtp.gmail.com',
    port=587,
    username='your-email@gmail.com',
    password='your-app-password'  # Gmail 앱 비밀번호
)

# HTML 이메일 발송
html_body = """
<html>
<body>
    <h1>안녕하세요!</h1>
    <p>이것은 <strong>HTML</strong> 이메일입니다.</p>
</body>
</html>
"""

sender.send_email(
    to_email='recipient@example.com',
    subject='테스트 이메일',
    body=html_body,
    html=True,
    attachments=['report.pdf']
)
```'''

        return """```javascript
// Node.js 이메일 발송 (Nodemailer)
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // 앱 비밀번호
  }
});

async function sendEmail({ to, subject, text, html, attachments }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
    attachments  // [{ filename: 'file.pdf', path: './file.pdf' }]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('이메일 발송 완료:', info.messageId);
    return info;
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    throw error;
  }
}

// 사용 예시
await sendEmail({
  to: 'recipient@example.com',
  subject: '테스트 이메일',
  html: '<h1>안녕하세요!</h1><p>테스트 메일입니다.</p>'
});
```"""

    def _get_scheduler_code(self, lang: str) -> str:
        """스케줄러 코드"""
        if lang == "python":
            return '''```python
# Python 스케줄러 (APScheduler)
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def job_daily_report():
    """매일 실행되는 리포트 작업"""
    logger.info(f"일일 리포트 생성: {datetime.now()}")
    # 리포트 생성 로직
    
def job_hourly_sync():
    """매시간 실행되는 동기화 작업"""
    logger.info(f"데이터 동기화: {datetime.now()}")
    # 동기화 로직

def job_cleanup():
    """주간 정리 작업"""
    logger.info(f"데이터 정리: {datetime.now()}")
    # 정리 로직

# 스케줄러 설정
scheduler = BackgroundScheduler()

# 매일 오전 9시
scheduler.add_job(
    job_daily_report,
    trigger=CronTrigger(hour=9, minute=0),
    id='daily_report',
    name='일일 리포트'
)

# 매시간 정각
scheduler.add_job(
    job_hourly_sync,
    trigger='interval',
    hours=1,
    id='hourly_sync',
    name='시간별 동기화'
)

# 매주 일요일 새벽 3시
scheduler.add_job(
    job_cleanup,
    trigger=CronTrigger(day_of_week='sun', hour=3),
    id='weekly_cleanup',
    name='주간 정리'
)

# 스케줄러 시작
scheduler.start()

# FastAPI와 함께 사용
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)
```

```python
# Celery Beat (분산 스케줄러)
# celeryconfig.py
from celery.schedules import crontab

beat_schedule = {
    'daily-report': {
        'task': 'tasks.generate_report',
        'schedule': crontab(hour=9, minute=0),
    },
    'hourly-sync': {
        'task': 'tasks.sync_data',
        'schedule': crontab(minute=0),
    },
}
```'''

        return """```javascript
// Node.js 스케줄러 (node-cron)
const cron = require('node-cron');

// 매일 오전 9시
cron.schedule('0 9 * * *', () => {
  console.log('일일 리포트 생성:', new Date());
  generateDailyReport();
});

// 매시간 정각
cron.schedule('0 * * * *', () => {
  console.log('데이터 동기화:', new Date());
  syncData();
});

// 매주 일요일 새벽 3시
cron.schedule('0 3 * * 0', () => {
  console.log('주간 정리:', new Date());
  weeklyCleanup();
});

// 5분마다
cron.schedule('*/5 * * * *', () => {
  console.log('헬스 체크:', new Date());
  healthCheck();
});

// Cron 표현식 가이드
// +-------------- 초 (선택, 0-59)
// | +------------ 분 (0-59)
// | | +---------- 시 (0-23)
// | | | +-------- 일 (1-31)
// | | | | +------ 월 (1-12)
// | | | | | +---- 요일 (0-7, 0과 7은 일요일)
// | | | | | |
// * * * * * *
```"""

    def _get_cache_code(self, lang: str) -> str:
        """캐싱 코드"""
        if lang == "python":
            return '''```python
# Redis 캐싱 (Python)
import redis
import json
from functools import wraps
from typing import Optional
import hashlib

# Redis 연결
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

def cache(expire: int = 300, prefix: str = "cache"):
    """캐시 데코레이터"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 캐시 키 생성
            key_data = f"{func.__name__}:{args}:{kwargs}"
            cache_key = f"{prefix}:{hashlib.md5(key_data.encode()).hexdigest()}"
            
            # 캐시 확인
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # 함수 실행 및 캐시 저장
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, expire, json.dumps(result))
            return result
        return wrapper
    return decorator

# 사용 예시
@cache(expire=600)  # 10분 캐시
def get_user_data(user_id: int) -> dict:
    """DB에서 사용자 데이터 조회 (비용이 큰 작업)"""
    # DB 쿼리...
    return {"id": user_id, "name": "홍길동"}

# 캐시 직접 관리
class CacheManager:
    def __init__(self, client: redis.Redis):
        self.client = client
    
    def get(self, key: str) -> Optional[dict]:
        data = self.client.get(key)
        return json.loads(data) if data else None
    
    def set(self, key: str, value: dict, expire: int = 300):
        self.client.setex(key, expire, json.dumps(value))
    
    def delete(self, key: str):
        self.client.delete(key)
    
    def clear_pattern(self, pattern: str):
        """패턴에 맞는 키 모두 삭제"""
        keys = self.client.keys(pattern)
        if keys:
            self.client.delete(*keys)
```

```python
# FastAPI + Redis 캐싱
from fastapi import FastAPI, Depends

app = FastAPI()
cache_manager = CacheManager(redis_client)

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    cache_key = f"user:{user_id}"
    
    # 캐시 확인
    cached = cache_manager.get(cache_key)
    if cached:
        return {"source": "cache", "data": cached}
    
    # DB 조회
    user = await db.get_user(user_id)
    cache_manager.set(cache_key, user, expire=600)
    return {"source": "db", "data": user}
```'''

        return """```javascript
// Node.js Redis 캐싱
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

class CacheService {
  constructor(client, defaultTTL = 300) {
    this.client = client;
    this.defaultTTL = defaultTTL;
  }

  async get(key) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    await this.client.setex(key, ttl, JSON.stringify(value));
  }

  async delete(key) {
    await this.client.del(key);
  }

  // 캐시 미들웨어
  middleware(keyFn, ttl = 300) {
    return async (req, res, next) => {
      const key = keyFn(req);
      const cached = await this.get(key);
      
      if (cached) {
        return res.json({ source: 'cache', data: cached });
      }
      
      // 원본 res.json을 가로채서 캐시 저장
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        await this.set(key, data, ttl);
        return originalJson({ source: 'db', data });
      };
      
      next();
    };
  }
}

const cache = new CacheService(redis);

// Express 사용 예시
app.get('/users/:id', 
  cache.middleware(req => `user:${req.params.id}`, 600),
  async (req, res) => {
    const user = await db.findUser(req.params.id);
    res.json(user);
  }
);
```"""

    def _get_basic_code(self, lang: str, query: str) -> str:
        """기본 코드"""
        if lang == "python":
            return '''```python
def main():
    """메인 함수"""
    print("Hello, World!")
    
    # 데이터 처리
    data = [1, 2, 3, 4, 5]
    result = [x * 2 for x in data]
    print(f"처리 결과: {result}")

if __name__ == "__main__":
    main()
```'''
        elif lang == "javascript":
            return """```javascript
function main() {
    console.log("Hello, World!");
    
    const data = [1, 2, 3, 4, 5];
    const result = data.map(x => x * 2);
    console.log("처리 결과:", result);
}

main();
```"""
        return f"```{lang}\n// 코드 예시\n```"

    def _generate_code_explanation(self, topics: List[str], lang: str) -> str:
        """코드 설명 생성"""
        explanations = []

        explanations.append("위 코드의 주요 구성 요소:\n\n")
        explanations.append("1. **클래스/함수 구조**: 재사용 가능하고 모듈화된 설계\n")
        explanations.append("2. **에러 처리**: try-except를 통한 안정적인 실행\n")
        explanations.append("3. **타입 힌트**: 코드 가독성과 유지보수성 향상\n")
        explanations.append("4. **주석**: 각 부분의 역할을 명확히 설명\n")

        return "".join(explanations)

    def _generate_usage_example(self, topics: List[str], lang: str) -> str:
        """사용 예시 생성"""
        return """```python
# 기본 사용법
result = function_name(param1, param2)
print(result)

# 응용 예시
for item in results:
    process(item)
```"""

    def _generate_tips(self, topics: List[str]) -> str:
        """팁 생성"""
        tips = [
            "- 코드를 작성하기 전에 요구사항을 명확히 정리하세요",
            "- 작은 단위로 테스트하면서 개발하세요",
            "- 주석과 문서화를 습관화하세요",
            "- 에러 처리를 꼼꼼히 해주세요",
        ]
        return "\n".join(tips)

    def _generate_prerequisites(self, topics: List[str]) -> str:
        """사전 준비사항"""
        prereqs = ["다음이 필요합니다:\n"]

        if "python" in topics:
            prereqs.append("- Python 3.8 이상 설치\n")
            prereqs.append("- pip (패키지 관리자)\n")
        if "nodejs" in topics:
            prereqs.append("- Node.js 16 이상 설치\n")
            prereqs.append("- npm 또는 yarn\n")
        if "docker" in topics:
            prereqs.append("- Docker Desktop 설치\n")

        prereqs.append("- 터미널/명령 프롬프트 사용법 이해\n")
        prereqs.append("- 기본적인 프로그래밍 지식\n")

        return "".join(prereqs)

    def _generate_steps(self, topics: List[str], query: str) -> str:
        """단계별 가이드"""
        steps = []

        steps.append("### 1단계: 환경 설정\n")
        steps.append("먼저 필요한 도구와 패키지를 설치합니다.\n\n")

        steps.append("### 2단계: 프로젝트 초기화\n")
        steps.append("새 프로젝트 디렉토리를 만들고 초기 설정을 합니다.\n\n")

        steps.append("### 3단계: 핵심 기능 구현\n")
        steps.append("주요 기능을 하나씩 구현합니다.\n\n")

        steps.append("### 4단계: 테스트\n")
        steps.append("구현한 기능이 제대로 동작하는지 테스트합니다.\n\n")

        steps.append("### 5단계: 최적화 및 마무리\n")
        steps.append("코드를 정리하고 성능을 최적화합니다.\n")

        return "".join(steps)

    def _generate_cautions(self, topics: List[str]) -> str:
        """주의사항"""
        cautions = []
        cautions.append("- [!] 프로덕션 환경에서는 추가 보안 설정이 필요합니다\n")
        cautions.append("- [!] 에러 처리를 충분히 해주세요\n")
        cautions.append("- [!] 민감한 정보는 환경 변수로 관리하세요\n")
        return "".join(cautions)

    def _get_topic_title(self, topic: str) -> str:
        """주제 제목"""
        titles = {
            "python": "Python 프로그래밍",
            "javascript": "JavaScript",
            "react": "React",
            "nodejs": "Node.js",
            "docker": "Docker",
            "git": "Git 버전 관리",
            "sql": "SQL 데이터베이스",
            "api": "REST API",
            "machine_learning": "머신러닝",
            "web_crawling": "웹 크롤링",
        }
        return titles.get(topic, topic.replace("_", " ").title())

    def _get_topic_definition(self, topic: str) -> str:
        """주제 정의"""
        definitions = {
            "python": "**Python**은 가독성과 생산성이 뛰어난 고급 프로그래밍 언어입니다. 웹 개발, 데이터 과학, AI, 자동화 등 다양한 분야에서 사용됩니다.",
            "javascript": "**JavaScript**는 웹 브라우저에서 실행되는 스크립트 언어로, 현대 웹 개발의 핵심입니다.",
            "react": "**React**는 Facebook에서 만든 UI 라이브러리로, 컴포넌트 기반의 효율적인 웹 개발을 가능하게 합니다.",
            "docker": "**Docker**는 애플리케이션을 컨테이너로 패키징하여 어디서든 동일하게 실행할 수 있게 해주는 플랫폼입니다.",
            "api": "**API(Application Programming Interface)**는 소프트웨어 간 통신을 위한 인터페이스입니다.",
        }
        return definitions.get(topic, f"**{topic}**에 대한 설명입니다.")

    def _get_topic_features(self, topic: str) -> str:
        """주제 특징"""
        return """주요 특징:

1. **간결한 문법**: 읽기 쉽고 작성하기 쉬움
2. **풍부한 생태계**: 다양한 라이브러리와 프레임워크
3. **활발한 커뮤니티**: 많은 자료와 지원
4. **다양한 활용**: 여러 분야에서 사용 가능
"""

    def _get_topic_mechanism(self, topic: str) -> str:
        """작동 원리"""
        return "내부적으로 다음과 같이 동작합니다:\n\n1. 입력을 받아 처리\n2. 로직 실행\n3. 결과 반환\n"

    def _generate_simple_example(self, topic: str, lang: str) -> str:
        """주제별 코드 예시"""
        examples = {
            "python": '''```python
# Python 기본 예제
def greet(name: str) -> str:
    """인사말 반환"""
    return f"Hello, {name}!"

# 리스트 컴프리헨션
numbers = [1, 2, 3, 4, 5]
squares = [n ** 2 for n in numbers]

# 딕셔너리 활용
user = {"name": "Kim", "age": 25}
print(f"{user['name']}님, 환영합니다!")
```''',
            "javascript": """```javascript
// JavaScript 기본 예제
const greet = (name) => `Hello, ${name}!`;

// 배열 메서드
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);

// async/await
async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}
```""",
            "typescript": """```typescript
// TypeScript 기본 예제
interface User {
    id: number;
    name: string;
    email: string;
}

function greet(user: User): string {
    return `Hello, ${user.name}!`;
}

// 제네릭
function getFirst<T>(arr: T[]): T | undefined {
    return arr[0];
}

const users: User[] = [
    { id: 1, name: "Kim", email: "kim@example.com" }
];
```""",
            "react": """```jsx
// React 함수형 컴포넌트
import { useState, useEffect } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        document.title = `Count: ${count}`;
    }, [count]);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>
                증가
            </button>
        </div>
    );
}
```""",
            "docker": """```dockerfile
# Dockerfile 예제
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
```

```bash
# Docker 명령어
docker build -t myapp .
docker run -d -p 3000:3000 myapp
```""",
            "git": """```bash
# Git 기본 워크플로우
git init
git add .
git commit -m "Initial commit"

# 브랜치 작업
git checkout -b feature/login
# ... 작업 후
git add .
git commit -m "Add login feature"
git checkout main
git merge feature/login
```""",
            "fastapi": """```python
# FastAPI 기본 예제
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/items")
def create_item(item: Item):
    return {"item": item, "status": "created"}
```""",
            "nextjs": """```tsx
// Next.js App Router 페이지
// app/page.tsx
export default async function HomePage() {
    const data = await fetch('https://api.example.com/data');
    const items = await data.json();

    return (
        <main>
            <h1>Welcome</h1>
            <ul>
                {items.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </main>
    );
}
```""",
        }
        return examples.get(
            topic.lower(),
            f"""```{lang}
# {topic} 예제
print("Hello, {topic}!")
```""",
        )

    def _get_use_cases(self, topic: str) -> str:
        """주제별 활용 사례"""
        use_cases = {
            "python": """- **웹 개발**: Django, FastAPI, Flask로 백엔드 구축
- **데이터 분석**: Pandas, NumPy로 데이터 처리
- **AI/ML**: PyTorch, TensorFlow로 모델 학습
- **자동화**: 스크립트로 반복 작업 자동화""",
            "javascript": """- **웹 프론트엔드**: React, Vue로 SPA 개발
- **웹 백엔드**: Node.js, Express로 서버 구축
- **모바일 앱**: React Native로 크로스플랫폼 앱
- **데스크톱 앱**: Electron으로 데스크톱 앱""",
            "typescript": """- **대규모 프론트엔드**: React + TypeScript
- **백엔드 API**: NestJS로 타입 안전 서버
- **풀스택**: Next.js로 프론트/백 통합
- **라이브러리 개발**: 타입 정의로 DX 향상""",
            "react": """- **SPA**: 대화형 웹 애플리케이션
- **대시보드**: 관리자 페이지, 데이터 시각화
- **이커머스**: 상품 목록, 장바구니, 결제
- **소셜 미디어**: 피드, 프로필, 메시징""",
            "docker": """- **개발 환경**: 일관된 개발 환경 구성
- **CI/CD**: 빌드, 테스트, 배포 파이프라인
- **마이크로서비스**: 서비스별 독립 배포
- **클라우드 배포**: AWS, GCP, Azure 배포""",
        }
        return use_cases.get(
            topic.lower(),
            """실제 활용 사례:

- **웹 개발**: 웹사이트, 웹 애플리케이션 구축
- **데이터 분석**: 데이터 처리 및 시각화
- **자동화**: 반복 작업 자동화
- **API 개발**: 백엔드 서비스 구축""",
        )

    def _get_further_learning(self, topic: str) -> str:
        """추가 학습"""
        return """더 배우려면:

- 공식 문서 읽기
- 온라인 튜토리얼 따라하기
- 실제 프로젝트 만들어보기
- 커뮤니티 참여하기
"""

    def _generate_comparison_summary(self, topics: List[str]) -> str:
        """비교 요약"""
        return f"| 항목 | {topics[0]} | {topics[1] if len(topics) > 1 else 'Other'} |\n|------|------|------|\n| 용도 | - | - |\n| 학습 곡선 | - | - |\n| 성능 | - | - |\n"

    def _generate_detailed_comparison(self, topics: List[str]) -> str:
        """상세 비교"""
        return "각각의 장단점을 자세히 살펴보면...\n"

    def _generate_selection_guide(self, topics: List[str]) -> str:
        """선택 가이드"""
        return (
            "상황에 따른 선택:\n\n- 빠른 개발이 필요하면: ...\n- 성능이 중요하면: ...\n"
        )

    def _generate_possible_causes(self, topics: List[str]) -> str:
        """가능한 원인"""
        return "1. 설정 오류\n2. 버전 호환성 문제\n3. 누락된 의존성\n4. 권한 문제\n"

    def _generate_solutions(self, topics: List[str], query: str) -> str:
        """해결 방법"""
        return """### 해결 방법 1: 기본 점검
```bash
# 버전 확인
python --version
# 패키지 재설치
pip install --upgrade package_name
```

### 해결 방법 2: 설정 확인
설정 파일을 확인하고 올바른 값이 있는지 검토하세요.

### 해결 방법 3: 로그 확인
에러 메시지와 로그를 자세히 읽어보세요.
"""

    def _generate_prevention_tips(self, topics: List[str]) -> str:
        """예방 팁"""
        return "- 정기적으로 의존성 업데이트\n- 테스트 코드 작성\n- 문서화 유지\n"

    def _generate_recommendation_criteria(self, topics: List[str]) -> str:
        """추천 기준"""
        return "추천 시 고려한 요소:\n\n1. 사용 편의성\n2. 성능\n3. 커뮤니티 지원\n4. 문서화 품질\n"

    def _generate_recommendations(self, topics: List[str]) -> str:
        """추천 목록"""
        return "### 추천 1\n설명...\n\n### 추천 2\n설명...\n"

    def _generate_selection_tips(self, topics: List[str]) -> str:
        """선택 팁"""
        return "선택 시 참고:\n\n- 프로젝트 요구사항 먼저 정리\n- 팀의 기술 스택 고려\n- 장기 유지보수 계획\n"

    def _generate_conversational_response(self, query: str) -> str:
        """대화형 응답 - 친근하고 도움이 되는 응답"""
        query_lower = query.lower()

        # 인사
        if any(g in query_lower for g in ["안녕", "hello", "hi", "반가워", "하이"]):
            return """안녕하세요! 

저는 **CORBU.AI**입니다. 프로그래밍과 개발 관련 질문에 답변해드릴 수 있어요.

## 도움드릴 수 있는 분야

| 분야 | 예시 |
|------|------|
| [PC] 프로그래밍 | Python, JavaScript, TypeScript |
| [G] 웹 개발 | React, Next.js, Node.js, FastAPI |
| [T] DevOps | Docker, Kubernetes, CI/CD |
| [#] 데이터/AI | Pandas, ML, 데이터 분석 |
| [DB] 데이터베이스 | PostgreSQL, MongoDB, Redis |

**질문 예시:**
- "Python으로 웹 크롤러 만들어줘"
- "React와 Vue 차이점 비교해줘"
- "Docker 에러 해결 방법 알려줘"

무엇이든 물어보세요! [!]"""

        # 감사
        if any(g in query_lower for g in ["감사", "고마워", "땡큐", "thanks", "thank"]):
            return """천만에요! 

더 궁금한 점이 있으시면 언제든 물어보세요.

**추가로 도움드릴 수 있는 것:**
- 코드 리뷰
- 에러 디버깅
- 아키텍처 설계
- 기술 비교 분석

다른 질문이 있으시면 말씀해주세요!"""

        # 잘 모르겠는 질문
        return f"""좋은 질문이네요! 

**"{query[:50]}{"..." if len(query) > 50 else ""}"**에 대해 답변드리겠습니다.

더 정확한 답변을 위해 다음 정보가 있으면 좋겠습니다:

1. **사용 기술**: 어떤 언어/프레임워크를 사용하시나요?
2. **목표**: 무엇을 만들거나 해결하고 싶으신가요?
3. **현재 상황**: 시도해본 것이나 에러 메시지가 있나요?

**바로 시도해볼 수 있는 질문:**
- "Python으로 [원하는 기능] 코드 작성해줘"
- "[기술A]와 [기술B] 비교해줘"
- "[에러 메시지] 해결 방법 알려줘"

구체적으로 말씀해주시면 더 정확한 도움을 드릴 수 있습니다!"""

    def _generate_fallback_response(self, query: str) -> str:
        """폴백 응답"""
        return f"""# 질문 확인

**"{query[:60]}{"..." if len(query) > 60 else ""}"**에 대해 답변드리겠습니다.

좀 더 구체적인 답변을 위해 다음 정보가 있으면 좋겠습니다:

1. **사용 중인 기술**: 어떤 언어/프레임워크를 사용하시나요?
2. **목표**: 무엇을 달성하고 싶으신가요?
3. **현재 상황**: 지금까지 시도해본 것이 있나요?

그동안 관련 주제에 대해 도움드릴 수 있는 것들:
- Python, JavaScript, TypeScript 프로그래밍
- React, Node.js 웹 개발
- Docker, Kubernetes DevOps
- 데이터베이스, API 설계

무엇이든 물어보세요!"""

    def _get_typescript_code(self, query: str) -> str:
        """TypeScript 코드 생성"""
        return """```typescript
// TypeScript 기본 예제

// 1. 타입 정의
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

// 2. 제네릭 함수
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// 3. 클래스
class UserService {
  private users: User[] = [];

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now(),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }
}

// 4. 유틸리티 타입 활용
type ReadonlyUser = Readonly<User>;
type UserWithoutId = Omit<User, 'id'>;
type UserKeys = keyof User;

// 5. 타입 가드
function isAdmin(user: User): user is User & { role: 'admin' } {
  return user.role === 'admin';
}

// 사용 예시
const userService = new UserService();

async function main() {
  const user = await userService.createUser({
    name: 'John',
    email: 'john@example.com',
    role: 'user',
  });
  
  console.log(user);
  
  if (isAdmin(user)) {
    console.log('Admin user:', user.name);
  }
}

main();
```"""

    def _get_sql_code(self, query: str) -> str:
        """SQL 코드 생성"""
        return """```sql
-- 기본 CRUD 쿼리

-- 1. 테이블 생성
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 데이터 삽입
INSERT INTO users (name, email, role) VALUES
    ('홍길동', 'hong@example.com', 'admin'),
    ('김철수', 'kim@example.com', 'user'),
    ('이영희', 'lee@example.com', 'user');

-- 3. 조회 쿼리
-- 기본 조회
SELECT * FROM users WHERE role = 'user';

-- 조인 쿼리
SELECT 
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;

-- 서브쿼리
SELECT * FROM users
WHERE id IN (
    SELECT user_id FROM orders
    WHERE total_amount > 10000
);

-- 4. 업데이트
UPDATE users 
SET role = 'admin', updated_at = CURRENT_TIMESTAMP
WHERE email = 'kim@example.com';

-- 5. 삭제
DELETE FROM orders WHERE status = 'cancelled';

-- 6. 인덱스 생성
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 7. 뷰 생성
CREATE VIEW user_order_summary AS
SELECT 
    u.id,
    u.name,
    COUNT(o.id) as order_count,
    COALESCE(SUM(o.total_amount), 0) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```"""

    def _get_algorithm_code(self, query: str, lang: str) -> str:
        """알고리즘 코드 생성"""
        return '''```python
# 주요 알고리즘 구현

from typing import List, Optional
import heapq

# 1. 정렬 알고리즘
def quick_sort(arr: List[int]) -> List[int]:
    """퀵 정렬 - O(n log n)"""
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)


def merge_sort(arr: List[int]) -> List[int]:
    """병합 정렬 - O(n log n)"""
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left: List[int], right: List[int]) -> List[int]:
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result


# 2. 검색 알고리즘
def binary_search(arr: List[int], target: int) -> int:
    """이진 검색 - O(log n)"""
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1


# 3. 그래프 알고리즘
def bfs(graph: dict, start: str) -> List[str]:
    """너비 우선 탐색 - O(V + E)"""
    visited = []
    queue = [start]
    
    while queue:
        node = queue.pop(0)
        if node not in visited:
            visited.append(node)
            queue.extend(graph.get(node, []))
    
    return visited


def dfs(graph: dict, start: str, visited: Optional[List[str]] = None) -> List[str]:
    """깊이 우선 탐색 - O(V + E)"""
    if visited is None:
        visited = []
    
    visited.append(start)
    
    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    
    return visited


# 4. 동적 프로그래밍
def fibonacci(n: int, memo: dict = {}) -> int:
    """피보나치 - 메모이제이션 O(n)"""
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]


def longest_common_subsequence(s1: str, s2: str) -> int:
    """최장 공통 부분 수열 - O(mn)"""
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]


# 테스트
if __name__ == "__main__":
    # 정렬 테스트
    arr = [64, 34, 25, 12, 22, 11, 90]
    print("Quick Sort:", quick_sort(arr))
    print("Merge Sort:", merge_sort(arr))
    
    # 검색 테스트
    sorted_arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    print("Binary Search (5):", binary_search(sorted_arr, 5))
    
    # 그래프 테스트
    graph = {
        'A': ['B', 'C'],
        'B': ['A', 'D', 'E'],
        'C': ['A', 'F'],
        'D': ['B'],
        'E': ['B', 'F'],
        'F': ['C', 'E']
    }
    print("BFS:", bfs(graph, 'A'))
    print("DFS:", dfs(graph, 'A'))
```'''

    def _get_react_code(self, query: str) -> str:
        """React 코드 생성"""
        return """```tsx
// React + TypeScript 컴포넌트 예제

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 타입 정의
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {
  initialUsers?: User[];
  onUserSelect?: (user: User) => void;
}

// 커스텀 Hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setData(json);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// 메인 컴포넌트
export function UserList({ initialUsers = [], onUserSelect }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 메모이제이션된 필터링
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // 콜백 최적화
  const handleSelect = useCallback((user: User) => {
    setSelectedId(user.id);
    onUserSelect?.(user);
  }, [onUserSelect]);

  const handleDelete = useCallback((id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  return (
    <div className="user-list">
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {filteredUsers.map(user => (
            <UserItem
              key={user.id}
              user={user}
              isSelected={selectedId === user.id}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// 자식 컴포넌트 (메모이제이션)
interface UserItemProps {
  user: User;
  isSelected: boolean;
  onSelect: (user: User) => void;
  onDelete: (id: number) => void;
}

const UserItem = React.memo(function UserItem({
  user,
  isSelected,
  onSelect,
  onDelete,
}: UserItemProps) {
  return (
    <li 
      className={`user-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(user)}
    >
      <div className="user-info">
        <span className="name">{user.name}</span>
        <span className="email">{user.email}</span>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(user.id);
        }}
      >
        삭제
      </button>
    </li>
  );
});

export default UserList;
```"""

    def _get_auth_code(self, lang: str) -> str:
        """인증 코드 생성"""
        if lang == "python":
            return """```python
# FastAPI JWT 인증 예제

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

# 설정
SECRET_KEY = "your-secret-key-here"  # 실제로는 환경변수 사용
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()

# 비밀번호 해싱
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 모델
class User(BaseModel):
    username: str
    email: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# 임시 사용자 DB
fake_users_db = {
    "admin": {
        "username": "admin",
        "email": "admin@example.com",
        "hashed_password": pwd_context.hash("password123"),
        "disabled": False,
    }
}

# 유틸리티 함수
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_user(db: dict, username: str) -> Optional[UserInDB]:
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)
    return None

def authenticate_user(db: dict, username: str, password: str) -> Optional[UserInDB]:
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(fake_users_db, username)
    if user is None:
        raise credentials_exception
    return user

# 엔드포인트
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello {current_user.username}!"}
```"""
        else:
            return """```javascript
// Express + JWT 인증 예제

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const SECRET_KEY = 'your-secret-key';
const users = new Map();

// 미들웨어: 토큰 검증
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 회원가입
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  if (users.has(username)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(username, { username, email, password: hashedPassword });
  
  res.status(201).json({ message: 'User created' });
});

// 로그인
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { username: user.username },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
  
  res.json({ token });
});

// 보호된 라우트
app.get('/profile', authenticateToken, (req, res) => {
  const user = users.get(req.user.username);
  res.json({ username: user.username, email: user.email });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```"""

    def _get_file_handling_code(self, lang: str) -> str:
        """파일 처리 코드"""
        return '''```python
# 파일 처리 예제

import os
import json
import csv
from pathlib import Path
from typing import List, Dict, Any

class FileHandler:
    """파일 처리 유틸리티 클래스"""
    
    def __init__(self, base_dir: str = "."):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
    
    # 텍스트 파일
    def read_text(self, filename: str) -> str:
        """텍스트 파일 읽기"""
        filepath = self.base_dir / filename
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    
    def write_text(self, filename: str, content: str) -> None:
        """텍스트 파일 쓰기"""
        filepath = self.base_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def append_text(self, filename: str, content: str) -> None:
        """텍스트 파일에 추가"""
        filepath = self.base_dir / filename
        with open(filepath, 'a', encoding='utf-8') as f:
            f.write(content)
    
    # JSON 파일
    def read_json(self, filename: str) -> Dict[str, Any]:
        """JSON 파일 읽기"""
        filepath = self.base_dir / filename
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def write_json(self, filename: str, data: Dict[str, Any], indent: int = 2) -> None:
        """JSON 파일 쓰기"""
        filepath = self.base_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=indent)
    
    # CSV 파일
    def read_csv(self, filename: str) -> List[Dict[str, str]]:
        """CSV 파일 읽기"""
        filepath = self.base_dir / filename
        with open(filepath, 'r', encoding='utf-8', newline='') as f:
            reader = csv.DictReader(f)
            return list(reader)
    
    def write_csv(self, filename: str, data: List[Dict], fieldnames: List[str] = None) -> None:
        """CSV 파일 쓰기"""
        if not data:
            return
        
        filepath = self.base_dir / filename
        fieldnames = fieldnames or list(data[0].keys())
        
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
    
    # 디렉토리 작업
    def list_files(self, pattern: str = "*") -> List[Path]:
        """파일 목록 조회"""
        return list(self.base_dir.glob(pattern))
    
    def file_exists(self, filename: str) -> bool:
        """파일 존재 확인"""
        return (self.base_dir / filename).exists()
    
    def delete_file(self, filename: str) -> bool:
        """파일 삭제"""
        filepath = self.base_dir / filename
        if filepath.exists():
            filepath.unlink()
            return True
        return False
    
    def get_file_info(self, filename: str) -> Dict[str, Any]:
        """파일 정보 조회"""
        filepath = self.base_dir / filename
        stat = filepath.stat()
        return {
            "name": filepath.name,
            "size": stat.st_size,
            "modified": stat.st_mtime,
            "is_file": filepath.is_file(),
        }


# 사용 예시
if __name__ == "__main__":
    handler = FileHandler("./data")
    
    # 텍스트 파일
    handler.write_text("hello.txt", "Hello, World!")
    print(handler.read_text("hello.txt"))
    
    # JSON 파일
    data = {"users": [{"name": "John", "age": 30}]}
    handler.write_json("users.json", data)
    print(handler.read_json("users.json"))
    
    # CSV 파일
    csv_data = [
        {"name": "Alice", "age": "25"},
        {"name": "Bob", "age": "30"},
    ]
    handler.write_csv("users.csv", csv_data)
    print(handler.read_csv("users.csv"))
```'''

    def _get_nextjs_code(self, query: str) -> str:
        """Next.js 프로젝트 코드"""
        return """```typescript
// Next.js 14 App Router 프로젝트

// 1. app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Next.js App',
  description: 'Built with Next.js 14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}

// 2. app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold">Welcome to Next.js 14</h1>
    </main>
  )
}

// 3. app/api/hello/route.ts - API Route
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello!' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ received: body })
}

// 4. app/users/page.tsx - 서버 컴포넌트
async function getUsers() {
  const res = await fetch('https://api.example.com/users', {
    next: { revalidate: 3600 }
  })
  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()
  return (
    <ul>
      {users.map((user: any) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

// 5. components/Button.tsx - 클라이언트 컴포넌트
'use client'
import { useState } from 'react'

export default function Button() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

### 시작하기

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm run dev
```"""

    def _get_fastapi_deploy_code(self) -> str:
        """FastAPI 배포 코드"""
        return """```python
# FastAPI 프로덕션 배포

# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="My API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}
```

```dockerfile
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
gunicorn==21.2.0
```

### 배포

```bash
docker-compose up --build -d
```"""

    def _load_topic_keywords(self) -> Dict:
        """주제 키워드 로드"""
        return {}

    def _load_code_templates(self) -> Dict:
        """코드 템플릿 로드"""
        return {}

    def _load_response_patterns(self) -> Dict:
        """응답 패턴 로드"""
        return {}


# 전역 인스턴스
_engine: Optional[IntelligentResponseEngine] = None


def get_intelligent_engine() -> IntelligentResponseEngine:
    """엔진 인스턴스 반환"""
    global _engine
    if _engine is None:
        _engine = IntelligentResponseEngine()
    return _engine
