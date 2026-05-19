"""
LLM 서비스 모듈
- OpenAI, Anthropic, 로컬 LLM 지원
- 기본 지식 통합
- 컨텍스트 관리
- generate_response: context에 temperature/max_tokens가 없으면 quality(또는 response_quality)로
  pipeline_tuning.get_preset을 조회해 보강(unified_chat 등에서 값을 안 넣은 경로와 정합)
- notebook/auto/ollama provider: 위에서 정한 temperature·max_tokens를 context에 병합해 노트북 LLM
  (Ollama·DeepSeek API) 호출에도 동일 적용
- context.model / llm_model / openai_model / ollama_model: 해당 요청에만 쓸 모델명 오버라이드
- context._generation_scenario_markdown: 작성 시나리오(마크다운). 직경로 LLM에도 프리픽스로 반영
"""

import os
import json
import time
from urllib.parse import quote
from typing import Dict, List, Optional, Any, Union
import logging

logger = logging.getLogger(__name__)

# 환경 변수에서 API 키 로드
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")  # deepseek-chat | deepseek-reasoner
# 설치형(로컬) DeepSeek: Ollama에 설치한 DeepSeek 모델 사용 (API 키 불필요, 개발용)
DEEPSEEK_USE_LOCAL = os.getenv("DEEPSEEK_USE_LOCAL", "").lower() in ("1", "true", "yes")
DEEPSEEK_LOCAL_MODEL = os.getenv("DEEPSEEK_LOCAL_MODEL", "deepseek-r1")  # ollama 모델명: deepseek-r1 | deepseek-coder 등
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
# OpenAI Chat Completions 전용 (self.model 은 Ollama용 LLM_MODEL 과 공유되면 qwen 등이 들어가 API 오류 남)
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# 노트북 LLM 통합 확인
try:
    from notebook_llm_integration import NotebookLLMIntegration
    NOTEBOOK_LLM_AVAILABLE = True
except ImportError:
    NOTEBOOK_LLM_AVAILABLE = False
    NotebookLLMIntegration = None

try:
    from llm_internal_security import is_deepseek_cloud_blocked, log_policy_once
except ImportError:
    def is_deepseek_cloud_blocked() -> bool:
        return False

    def log_policy_once() -> None:
        pass


class LLMService:
    """LLM 서비스 클래스"""

    def __init__(self):
        # 환경변수에서 provider 결정 (없으면 자동 감지)
        env_provider = os.getenv("LLM_PROVIDER", "").lower()
        self.model = os.getenv("LLM_MODEL", "qwen3:4b")  # 기본 모델을 Ollama로 변경
        self.knowledge_base = self._load_knowledge_base()
        self.conversation_history: Dict[str, List[Dict]] = {}
        
        # 노트북 LLM 초기화
        self.notebook_llm = None
        if NOTEBOOK_LLM_AVAILABLE:
            try:
                self.notebook_llm = NotebookLLMIntegration()
                logger.info("✅ 노트북 LLM 통합 초기화 완료")
            except Exception as e:
                logger.warning(f"⚠️ 노트북 LLM 초기화 실패: {e}")
        
        # Provider 결정 로직 (우선순위: 환경변수 > DeepSeek 설치형(로컬) > DeepSeek API > 노트북LLM > OpenAI > Anthropic > fallback)
        if env_provider:
            self.provider = env_provider
        elif DEEPSEEK_USE_LOCAL:
            self.provider = "deepseek-local"
            logger.info("✅ DeepSeek 설치형(로컬 Ollama)을 기본 provider로 사용")
        elif DEEPSEEK_API_KEY:
            self.provider = "deepseek"
            logger.info("✅ DeepSeek LLM(API)을 기본 provider로 사용")
        elif self.notebook_llm:
            self.provider = "notebook"
            logger.info("✅ 노트북 LLM/Ollama를 기본 provider로 사용")
        elif OPENAI_API_KEY:
            self.provider = "openai"
            logger.info("✅ OpenAI를 기본 provider로 사용")
        elif ANTHROPIC_API_KEY:
            self.provider = "anthropic"
            logger.info("✅ Anthropic을 기본 provider로 사용")
        else:
            self.provider = "fallback"
            logger.warning("⚠️ LLM provider 미설정, 폴백 모드로 작동")

        # 내부 보안: DeepSeek 클라우드로 프롬프트 외부 전송 금지 시 provider 교체
        if is_deepseek_cloud_blocked() and self.provider in ("deepseek",):
            log_policy_once()
            logger.warning(
                "🔒 내부 보안 정책: DeepSeek API(클라우드) provider 비활성화 → 로컬/기타로 대체"
            )
            if DEEPSEEK_USE_LOCAL:
                self.provider = "deepseek-local"
            elif self.notebook_llm:
                self.provider = "notebook"
            elif OPENAI_API_KEY:
                self.provider = "openai"
            elif ANTHROPIC_API_KEY:
                self.provider = "anthropic"
            else:
                self.provider = "ollama"

        # 도시정비·부동산·조합 등 도메인 전문 지식 (DeepSeek 등 LLM 답변 시 근거로 활용)
        self._domain_knowledge_urban_text, self._domain_knowledge_urban_keywords = self._load_domain_knowledge_urban()

    def _load_domain_knowledge_urban(self) -> tuple[str, List[str]]:
        """정부·법률 자료 우선, 이어서 도시정비법·국토부·전문가·판례·조합업무 등 도메인 지식 로드. 반환: (통합 텍스트, 트리거 키워드 목록)"""
        domain_file = os.path.join(os.path.dirname(__file__), "domain_knowledge_urban.json")
        default_keywords = [
            "도시정비", "재건축", "재개발", "조합", "국토부", "계약", "부동산", "변호사", "세무사",
            "감정평가", "판례", "법무사", "변리사", "중개사", "정비사업", "분담금", "시공사", "정관", "총회",
        ]
        if not os.path.exists(domain_file):
            return "", default_keywords
        try:
            with open(domain_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            sections = data.get("sections") or {}
            order = data.get("sections_order")  # 정부·법률 먼저 등 순서 보장
            keywords = data.get("keywords_trigger") or default_keywords
            parts = []
            names = order if isinstance(order, list) else list(sections.keys())
            for name in names:
                content = sections.get(name) if isinstance(name, str) else None
                if isinstance(content, str) and content.strip():
                    parts.append(f"[{name}]\n{content.strip()}")
            text = "\n\n".join(parts)
            return text, keywords
        except Exception as e:
            logger.warning(f"도메인 전문 지식 로드 실패: {e}")
            return "", default_keywords

    def _load_knowledge_base(self) -> Dict[str, Any]:
        """기본 지식 베이스 로드"""
        knowledge_file = os.path.join(os.path.dirname(__file__), "knowledge_base.json")

        # 기본 지식 베이스
        default_knowledge = {
            "system_info": {
                "name": "CORBU.AI",
                "version": "1.0.0",
                "description": "차세대 AI 어시스턴트",
            },
            "capabilities": [
                "자연어 대화",
                "질문 답변",
                "정보 검색",
                "텍스트 분석",
                "코드 작성 지원",
            ],
            "common_responses": {
                "greeting": "안녕하세요! CORBU.AI입니다. 무엇을 도와드릴까요?",
                "unknown": "죄송합니다. 그 질문에 대한 답변을 준비하지 못했습니다. 다른 질문을 해주시겠어요?",
                "error": "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            },
            "knowledge_topics": {
                "programming": {
                    "description": "프로그래밍 관련 질문",
                    "examples": [
                        "Python",
                        "JavaScript",
                        "TypeScript",
                        "React",
                        "FastAPI",
                    ],
                },
                "general": {
                    "description": "일반적인 질문",
                    "examples": ["날씨", "뉴스", "정보 검색"],
                },
            },
        }

        # 파일이 있으면 로드, 없으면 기본값 사용
        if os.path.exists(knowledge_file):
            try:
                with open(knowledge_file, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    default_knowledge.update(loaded)
            except Exception as e:
                logger.warning(f"지식 베이스 로드 실패: {e}, 기본값 사용")

        return default_knowledge

    @staticmethod
    def _openai_compatible_history(history: List[Dict]) -> List[Dict[str, str]]:
        """Chat Completions API용: user|assistant만 (system은 상단 별도 메시지와 중복 방지)."""
        out: List[Dict[str, str]] = []
        for h in history:
            if not isinstance(h, dict):
                continue
            role = str(h.get("role", "user")).lower().strip()
            if role in ("model", "bot", "ai", "assistant"):
                role = "assistant"
            elif role == "system":
                continue
            else:
                role = "user"
            raw = h.get("content", "")
            content = "" if raw is None else str(raw)
            if not content.strip():
                continue
            out.append({"role": role, "content": content})
        return out

    @staticmethod
    def _safe_temperature(value: Union[float, int, str, None], cap: float = 2.0) -> float:
        """API별 허용 범위 내 temperature (OpenAI·DeepSeek·Ollama: cap=2, Anthropic: cap=1)."""
        try:
            t = float(value)
        except (TypeError, ValueError):
            return 0.7
        return max(0.0, min(float(cap), t))

    @staticmethod
    def _safe_max_tokens(
        value: Union[int, float, str, None], default: int, cap: int = 32000
    ) -> int:
        """양수·상한 클램프 (과도한 값으로 인한 API 거부 방지)."""
        try:
            v = int(float(value))
        except (TypeError, ValueError):
            return default
        return max(1, min(cap, v))

    @staticmethod
    def _model_override_from_context(context: Optional[Dict[str, Any]]) -> Optional[str]:
        """요청별 모델: context.model / llm_model 등 (비어 있으면 None)."""
        if not context or not isinstance(context, dict):
            return None
        for key in ("llm_model", "model", "ollama_model", "openai_model"):
            raw = context.get(key)
            if isinstance(raw, str) and raw.strip():
                return raw.strip()
        return None

    @staticmethod
    def _genspark_markdown_ui_block() -> str:
        """웹 대화 UI(젠스파이크형)에서 제목·목록·코드블록이 구조화되어 보이도록 GFM 출력 규칙."""
        return """
[출력 형식 — 반드시 준수]
- 본문은 GitHub Flavored Markdown(GFM)으로 작성한다.
- 모든 답변 맨 위에 `## 한 줄 결론` 제목을 두고, 그 아래에 핵심 답을 1~3문장으로 쓴다. (인사·예/아니오 수준의 초단답도 동일하게 제목만 유지한다.)
- 필요 시에만 이어서 `## 핵심 내용`, `## 근거·분석`, `## 실행안`, `## 다음 단계` 중 해당 섹션을 추가한다. 관련 없는 섹션은 생략한다.
- 코드는 반드시 ``` 언어 로 감싼 펜스 블록을 사용한다.
- 표(파이프 테이블)·체크리스트·굵게·목록을 활용해 가독성을 높인다.
- 불필요한 메타 서두(예: "다음과 같이 답변드립니다")는 쓰지 않고, 곧바로 마크다운 본문으로 시작한다.
""".strip()

    def _get_system_prompt(self, is_long_form: bool = False) -> str:
        """시스템 프롬프트 생성"""
        knowledge = self.knowledge_base
        sys_info = knowledge.get("system_info") or {}
        caps = knowledge.get("capabilities") or ["자연어 대화", "질문 답변"]
        system_prompt = f"""당신은 {sys_info.get("name", "CORBU.AI")}입니다.
버전: {sys_info.get("version", "1.0.0")}
설명: {sys_info.get("description", "AI 어시스턴트")}

능력:
{chr(10).join(f"- {cap}" for cap in caps)}

지침:
1. 사용자 질문에 직접·자연스럽게 답하되, 아래 [출력 형식]의 Markdown(GFM) 구조를 지켜 웹 대화에서 젠스파이크형으로 읽히게 하세요. 요청한 길이·톤을 우선합니다.
2. 사용자에게 친절하고 도움이 되는 응답을 제공하세요.
3. 정확하지 않은 정보는 추측하지 말고 솔직하게 말하세요.
4. 한국어로 자연스럽게 대화하세요.
5. 질문과 요구에 맞는 답변: 질문의 핵심을 정확히 짚고, 요구한 형식·길이·톤을 반영하세요. 짧은 질문·한 줄 요청에는 한 줄로, 반대/찬성 논리만 요청하면 해당 입장만 서술하세요. 한 메시지에 질문·요구·요청이 여럿이면 모두 수용하고, 사용자가 제시한 번호·순서(또는 논리적 순서)대로 단계적으로 처리한 뒤, 생성 전에 전개 시나리오를 고려해 하나의 완결된 응답으로 마무리하세요.
6. 글쓰기 형식·스타일·구성: 요구한 글쓰기 형식(보고서·칼럼·요약·가이드·Q&A·사건조사 형식 등)과 스타일(어투·톤)에 맞게 구성하고, 결과물의 구성(서론·본론·결론, 항목·섹션)을 질문과 요구에 맞게 잡으세요. 요구에 형식이 명시되면 반드시 따르세요. 답변 작성 시 생성로직(사실 정리→맥락·원인→분석·조사 내용→결론·시사점)을 갖추어 단계적으로 서술하세요. 사건조사 형식 요청 시 개요·경과·원인 분석·관계자·결론·시사점 등 조사보고 구조에 맞게 작성하세요.
7. 글 생성 시: 논리적 구조(서론·본론·결론), 명확한 문장, 적절한 예시로 가독성 높은 글을 작성하세요.
8. 원문 재작성 요청(예: 스타일로 바꿔줘, 되묻는 방식으로 만들어줘)인 경우: 원문을 그대로 복사·요약하지 말고, 요청한 스타일·어투·취지로 새 글로 작성하세요.

{self._genspark_markdown_ui_block()}
"""
        
        if is_long_form:
            system_prompt += """
9. 사용자의 질문이나 요구에 대해 상세하고 포괄적인 글을 작성하세요.
10. 최소 500자 이상의 길고 자세한 답변을 제공하세요.
11. 요구에 맞는 구조(서론·본론·결론, 항목·섹션)로 작성하고, 마크다운(제목·소제목·목록·강조)으로 가독성을 높이세요.
12. 구체적인 예시와 설명을 포함하세요.
13. 글쓰기 품질: 한 문장은 한 가지 생각만, 문단은 하나의 주제로 묶고, 흐름이 자연스럽게 이어지도록 하세요."""
        else:
            system_prompt += """
9. 간결하고 명확한 답변을 제공하되, 질문 핵심에는 반드시 답하고 요구한 형식·구성에 맞게 작성하세요."""
        
        return system_prompt

    async def generate_response(
        self,
        message: str,
        conversation_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """LLM 응답 생성"""
        start_time = time.time()

        try:
            # 대화 히스토리: 프론트에서 전달한 context.conversation_history 우선, 없으면 메모리
            history = []
            if context and isinstance(context, dict):
                hist = context.get("conversation_history") or context.get("conversationHistory")
                if isinstance(hist, list) and len(hist) > 0:
                    history = [{"role": h.get("role", "user"), "content": h.get("content", "") or str(h)} for h in hist]
            if not history:
                history = list(self.conversation_history.get(conversation_id or "default", []))

            # 컨텍스트와 지식 베이스 통합
            enhanced_message, is_long_form = self._enhance_with_knowledge(message, context)

            # 파이프라인 튜닝: context의 temperature·max_tokens 우선; 없으면 quality 프리셋 → 기본값
            _temp = (context.get("temperature") if context and isinstance(context, dict) else None)
            _max_tok = (context.get("max_tokens") if context and isinstance(context, dict) else None)
            if (_temp is None or _max_tok is None) and context and isinstance(context, dict):
                q = context.get("quality") or context.get("response_quality")
                if isinstance(q, str) and q.strip():
                    try:
                        from pipeline_tuning import get_preset

                        preset = get_preset(q.strip().lower())
                        if _temp is None and preset.get("temperature") is not None:
                            _temp = float(preset["temperature"])
                        if _max_tok is None and preset.get("max_tokens") is not None:
                            _max_tok = int(preset["max_tokens"])
                    except (ImportError, TypeError, ValueError) as e:
                        logger.debug("pipeline_tuning 프리셋 보강 스킵: %s", e)
            if _temp is None:
                _temp = 0.7
            if _max_tok is None:
                _max_tok = 4096 if is_long_form else 2048
            _max_tok = self._safe_max_tokens(
                _max_tok, 4096 if is_long_form else 2048, cap=32000
            )

            _model_ov = self._model_override_from_context(context)

            # LLM 호출 (DeepSeek 설치형 > DeepSeek API > 노트북/OpenAI/Anthropic/Ollama)
            if self.provider == "deepseek-local":
                response = await self._call_deepseek_local(
                    enhanced_message, history, is_long_form, _temp, _max_tok, _model_ov
                )
            elif self.provider == "deepseek":
                response = await self._call_deepseek(
                    enhanced_message, history, is_long_form, _temp, _max_tok, _model_ov
                )
            elif self.notebook_llm and self.provider in ["notebook", "auto", "ollama"]:
                if context and isinstance(context, dict):
                    nb_ctx = {**context, "temperature": _temp, "max_tokens": _max_tok}
                else:
                    nb_ctx = {"temperature": _temp, "max_tokens": _max_tok}
                response = await self._call_notebook_llm(enhanced_message, history, nb_ctx, is_long_form)
            elif self.provider == "openai":
                response = await self._call_openai(
                    enhanced_message, history, is_long_form, _temp, _max_tok, _model_ov
                )
            elif self.provider == "anthropic":
                response = await self._call_anthropic(
                    enhanced_message, history, is_long_form, _temp, _max_tok, _model_ov
                )
            elif self.provider == "ollama":
                response = await self._call_ollama(
                    enhanced_message, history, is_long_form, _temp, _max_tok, _model_ov
                )
            else:
                # 폴백: 기본 응답
                response = self._generate_fallback_response(message)

            reply_text = (response.get("content") or "").strip() or "(응답 없음)"

            # 대화 히스토리 업데이트 (사용자에게 보이는 원문 message 저장)
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": reply_text})

            self.conversation_history[conversation_id or "default"] = history

            processing_time = time.time() - start_time

            return {
                "content": reply_text,
                "model": response.get("model", self.model),
                "processing_time": processing_time,
                "tokens": response.get("tokens", 0),
                "confidence": response.get("confidence", 0.8),
            }

        except Exception as e:
            logger.error(f"LLM 응답 생성 오류: {e}")
            cr = self.knowledge_base.get("common_responses") or {}
            err_plain = cr.get("error") or "오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            err_msg = f"""## 한 줄 결론

처리 중 오류가 발생했습니다.

## 핵심 내용

{err_plain}

## 다음 단계

잠시 후 다시 시도하거나, 요청을 짧게 나누어 보내 주세요.

<details><summary>기술 정보</summary>

`{str(e)}`

</details>"""
            return {
                "content": err_msg,
                "model": "fallback",
                "processing_time": time.time() - start_time,
                "tokens": 0,
                "confidence": 0.0,
                "error": str(e),
            }

    def _enhance_with_knowledge(self, message: str, context: Optional[Dict]) -> tuple[str, bool]:
        """지식 베이스를 활용하여 메시지 강화 (사전 파이프라인 결과 반영)
        
        Returns:
            tuple: (enhanced_message, is_long_form)
        """
        # 간단한 키워드 매칭으로 관련 지식 추가
        enhanced = message
        is_long_form = bool(context and isinstance(context, dict) and context.get("is_long_form"))
        if not is_long_form and ("[지시] 아래 원문을" in (message or "") or ("재작성" in (message or "") and "원문" in (message or ""))):
            is_long_form = True  # 원문 재작성 요청은 항상 긴 글 생성

        # 도메인 전문 지식: 메시지 또는 프로젝트 맥락이 도시정비·부동산·조합 등이면 통합 지식 블록 주입 (DeepSeek 등이 근거로 활용)
        combined_for_trigger = message
        if context and isinstance(context, dict):
            pk = context.get("projectKnowledge")
            if isinstance(pk, str) and pk.strip():
                combined_for_trigger = combined_for_trigger + "\n" + pk
        domain_text = ""
        if self._domain_knowledge_urban_text and self._domain_knowledge_urban_keywords:
            if any(kw in combined_for_trigger for kw in self._domain_knowledge_urban_keywords):
                domain_text = "[도메인 전문 지식]\n" + self._domain_knowledge_urban_text + "\n"

        prefix_parts = []
        # ChatGPT/Gemini처럼 사용자 요청에 맞게 직접 답하도록: 사용자 원문·요구 지시를 맨 앞에 (파이프라인 결과)
        if context and isinstance(context, dict):
            if context.get("_user_message_priority_hint"):
                prefix_parts.append(str(context["_user_message_priority_hint"]))
            # 다중 요청을 adapt 지시보다 먼저 두어 항목별 처리가 우선되게 함
            if context.get("_multi_request_instruction"):
                prefix_parts.append(
                    "[다중 질문·요구 — 순서·시나리오 준수]\n"
                    + str(context["_multi_request_instruction"])
                )
            if context.get("_adapt_answer_to_request_instruction"):
                prefix_parts.append(
                    "[요구·질문 맞춤]\n"
                    + str(context["_adapt_answer_to_request_instruction"])
                )
            if context.get("_advanced_memory_instruction"):
                prefix_parts.append(str(context["_advanced_memory_instruction"]))
            if context.get("_conversation_graph_instruction"):
                prefix_parts.append(
                    str(context["_conversation_graph_instruction"])
                )
            # Q→A 파이프라인·클라이언트가 넘긴 작성 시나리오(직경로 LLM에도 순서·검증 힌트)
            _gsc = context.get("_generation_scenario_markdown")
            if isinstance(_gsc, str) and _gsc.strip():
                prefix_parts.append(
                    "[답변 생성 시나리오 — 순서·검증 포인트 참고]\n" + _gsc.strip()
                )
        # 정보 수집·학습·정보 찾기 능력 및 요구·질문에 맞는 논리적 답변 지시 (딥시크 LLM 등)
        if context and isinstance(context, dict):
            abilities_hint = context.get("_information_abilities_hint")
            if abilities_hint:
                prefix_parts.append(f"[시스템 능력]\n{abilities_hint}\n")
            if context.get("_collected_materials_summary") or context.get("_logical_structure_outline"):
                prefix_parts.append(
                    "[지시] 사용자의 요구와 질문에 맞는 논리적 사고로, 아래 수집·학습·검색된 자료와 논리 구성을 반드시 참고하여 답변을 생성하세요. 제시된 자료를 활용해 근거 있는 답변을 작성하세요. 질문의 핵심에 정확히 답하고, 글을 생성할 때는 구조·가독성·논리성을 갖추세요.\n"
                )
            elif not context.get("_conversation_graph_instruction"):
                # 파이프라인 없이도 질문·요구 답변 및 글 생성 품질 유지 (관계도 답변은 전용 지시만)
                prefix_parts.append(
                    "[지시] 질문에는 핵심에 맞게 정확히 답하고, 요구한 형식·길이를 반영하세요. 글을 생성할 때는 서론·본론·결론과 논리적 흐름, 가독성을 갖추세요.\n"
                )
        elif not prefix_parts:
            prefix_parts.append(
                "[지시] 질문과 요구에 맞는 답변을 생성하세요. 질문의 핵심에 답하고, 글 작성 시 구조와 가독성을 갖추세요.\n"
            )
        if domain_text:
            prefix_parts.append(domain_text)
        # 프로젝트 컨텍스트·지침·소스(projectKnowledge) 및 사전 파이프라인 결과를 프롬프트 앞에 추가 (샘플: 프로젝트 설정 지침·소스 기반 답변)
        if context and isinstance(context, dict):
            project_knowledge = context.get("projectKnowledge")
            if isinstance(project_knowledge, str) and project_knowledge.strip():
                prefix_parts.append(
                    "[프로젝트 컨텍스트·지침·참고 소스]\n" + project_knowledge.strip() + "\n"
                )
            if context.get("_collected_materials_summary"):
                prefix_parts.append(
                    "[수집 자료]\n" + str(context["_collected_materials_summary"]) + "\n"
                )
                if context.get("_materials_collection_hint"):
                    prefix_parts.append(context["_materials_collection_hint"] + "\n")
            if context.get("_logical_structure_outline"):
                structure_hint = context.get("_structure_hint") or "아래 [논리 구성]에 따라 답변하세요."
                prefix_parts.append(
                    "[논리 구성]\n" + str(context["_logical_structure_outline"]) + "\n\n" + structure_hint + "\n"
                )
            if context.get("_style_and_tone_instruction"):
                prefix_parts.append(
                    "[스타일 지시]\n" + str(context["_style_and_tone_instruction"]) + "\n"
                )
        # Genspark 에이전트 폼 프로필·과업 완결형 힌트 — context에만 있고 prefix에 안 붙던 필드 반영
        if context and isinstance(context, dict):
            _ags = context.get("agentic_genspark_style")
            _genspark_on = _ags is True or (
                isinstance(_ags, str) and _ags.strip().lower() in ("1", "true", "yes", "on")
            )
            if _genspark_on:
                # 프로필 없이 route id만 온 API 호출(예: genspark_route_agent_id) — 레포 프론트 레지스트리 밖 클라이언트용 최소 메타
                _route_id = ""
                _rid_raw = context.get("genspark_route_agent_id") or context.get("gensparkRouteAgentId")
                if isinstance(_rid_raw, str):
                    _route_id = _rid_raw.strip()
                _prof = context.get("genspark_external_agent_profile")
                _has_profile = isinstance(_prof, str) and bool(_prof.strip())
                if _route_id and not _has_profile:
                    _url = f"https://www.genspark.ai/agents?id={quote(_route_id, safe='')}"
                    prefix_parts.append(
                        "[Genspark 에이전트 세션 — route id만 전달됨]\n"
                        f"에이전트 ID: {_route_id}\n편집 URL: {_url}\n"
                        "상세 지시문은 genspark_external_agent_profile 또는 서버 GENSPARK_REFERENCE_AGENT_INSTRUCTIONS로 보강할 수 있습니다.\n"
                    )
                for _gk in (
                    "genspark_external_agent_profile",
                    "genspark_agentic_system",
                    "genspark_output_structure",
                ):
                    _gv = context.get(_gk)
                    if isinstance(_gv, str) and _gv.strip():
                        prefix_parts.append(_gv.strip() + "\n")
                _gs_srv = (os.getenv("GENSPARK_REFERENCE_AGENT_INSTRUCTIONS") or "").strip()
                if _gs_srv:
                    prefix_parts.append(
                        "[서버: Genspark 참조 에이전트 추가 지시문]\n" + _gs_srv + "\n"
                    )
        if prefix_parts:
            enhanced = "\n".join(prefix_parts) + "\n---\n\n" + enhanced

        # 긴 글 생성 요구 감지 (글 생성 능력 강화)
        long_form_keywords = [
            "글", "작성", "생성", "만들어", "작성해줘", "생성해줘",
            "만들어줘", "글쓰기", "에세이", "문서", "상세하게",
            "자세히", "길게", "포괄적으로", "전체적으로", "써줘", "쓰여줘",
            "정리해줘", "요약해줘", "기록해줘", "초안", "원고", "콘텐츠"
        ]
        question_keywords = ["?", "질문", "궁금", "알려줘", "설명해줘", "알려주세요", "뭐야", "어떻게", "왜", "무엇"]
        
        message_lower = message.lower()
        
        # 긴 글 생성 키워드가 있거나 질문 형태인 경우
        if any(keyword in message_lower for keyword in long_form_keywords):
            is_long_form = True
            enhanced = f"""{enhanced}

[글 생성 지시] 위 요청에 맞는 품질 높은 글을 작성해주세요:
- 서론: 주제 소개 및 배경 설명
- 본론: 핵심 내용을 여러 섹션으로 나누어 상세히 설명 (한 문단은 한 주제, 문장은 명확하게)
- 결론: 요약 및 마무리
- 구체적인 예시·사례·근거 포함
- 마크다운 형식(제목, 소제목, 목록, 강조)으로 가독성 확보
- 논리적 흐름과 자연스러운 문체 유지
최소 500자 이상의 자세하고 읽기 좋은 글을 작성해주세요."""
        elif any(keyword in message_lower for keyword in question_keywords):
            # 질문인 경우: 질문·요구에 맞는 답변 품질 강화
            is_long_form = True
            enhanced = f"""{enhanced}

[질문·요구 답변 지시] 위 질문에 정확하고 충실하게 답변해주세요:
- 질문의 핵심에 대한 명확한 답변을 먼저 제시
- 배경 설명·컨텍스트·근거를 필요에 따라 포함
- 구체적인 예시와 실행 가능한 다음 단계가 있으면 제시
- 마크다운으로 읽기 쉽게 구성
최소 300자 이상으로 질문에 맞는 자세한 답변을 작성해주세요."""

        # 프로그래밍 관련 질문 감지 (대소문자 무시)
        programming_keywords = ["코드", "프로그래밍", "함수", "변수", "클래스", "모듈"]
        if any(keyword in message_lower for keyword in programming_keywords):
            enhanced = f"[프로그래밍 질문] {enhanced}"

        return enhanced, is_long_form

    async def _call_openai(
        self,
        message: str,
        history: List[Dict],
        is_long_form: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """OpenAI API 호출. temperature·max_tokens는 파이프라인 튜닝에서 전달."""
        try:
            from openai import AsyncOpenAI  # type: ignore[import-untyped]

            if not OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")

            client = AsyncOpenAI(api_key=OPENAI_API_KEY)

            messages = [{"role": "system", "content": self._get_system_prompt(is_long_form)}]
            messages.extend(self._openai_compatible_history(history))
            messages.append({"role": "user", "content": message})

            max_tokens = self._safe_max_tokens(
                max_tokens, 2000 if is_long_form else 1000, cap=32000
            )

            temp = self._safe_temperature(temperature, 2.0)
            chat_model = (model_override or OPENAI_MODEL).strip() or OPENAI_MODEL
            response = await client.chat.completions.create(
                model=chat_model,
                messages=messages,
                temperature=temp,
                max_tokens=max_tokens,
            )

            raw_content = (
                response.choices[0].message.content
                if response.choices and response.choices[0].message
                else None
            )
            usage = getattr(response, "usage", None)
            tok = (getattr(usage, "total_tokens", 0) or 0) if usage else 0
            return {
                "content": (raw_content or "").strip() or "(응답 없음)",
                "model": getattr(response, "model", None) or chat_model,
                "tokens": tok,
                "confidence": 0.9,
            }

        except ImportError:
            logger.warning("openai 패키지가 설치되지 않았습니다.")
            return self._generate_fallback_response(message)
        except Exception as e:
            logger.error(f"OpenAI API 호출 오류: {e}")
            return self._generate_fallback_response(message)

    async def _call_anthropic(
        self,
        message: str,
        history: List[Dict],
        is_long_form: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Anthropic API 호출. temperature·max_tokens는 파이프라인 튜닝에서 전달."""
        try:
            from anthropic import AsyncAnthropic  # type: ignore[import-untyped]

            if not ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY가 설정되지 않았습니다.")

            client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
            system_prompt = self._get_system_prompt(is_long_form)
            lines = []
            for h in self._openai_compatible_history(history):
                who = "Human" if h["role"] == "user" else "Assistant"
                lines.append(f"{who}: {h['content']}")
            conversation = "\n".join(lines)
            max_tokens = self._safe_max_tokens(
                max_tokens, 2000 if is_long_form else 1000, cap=32000
            )

            temp = self._safe_temperature(temperature, 1.0)
            claude_model = (model_override or ANTHROPIC_MODEL).strip() or ANTHROPIC_MODEL
            response = await client.messages.create(
                model=claude_model,
                max_tokens=max_tokens,
                temperature=temp,
                system=system_prompt,
                messages=[{"role": "user", "content": f"{conversation}\n\nHuman: {message}"}],
            )

            first_block = response.content[0] if response.content else None
            text = getattr(first_block, "text", None) or ""
            usage = getattr(response, "usage", None)
            in_tok = (getattr(usage, "input_tokens", 0) or 0) if usage else 0
            out_tok = (getattr(usage, "output_tokens", 0) or 0) if usage else 0
            return {
                "content": text.strip() or "(응답 없음)",
                "model": claude_model,
                "tokens": in_tok + out_tok,
                "confidence": 0.9,
            }

        except ImportError:
            logger.warning("anthropic 패키지가 설치되지 않았습니다.")
            return self._generate_fallback_response(message)
        except Exception as e:
            logger.error(f"Anthropic API 호출 오류: {e}")
            return self._generate_fallback_response(message)

    async def _call_deepseek(
        self,
        message: str,
        history: List[Dict],
        is_long_form: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """DeepSeek API 호출 (OpenAI 호환 엔드포인트). temperature·max_tokens는 파이프라인 튜닝에서 전달."""
        if is_deepseek_cloud_blocked():
            logger.warning("🔒 내부 보안: _call_deepseek 호출 차단, 폴백 응답")
            return self._generate_fallback_response(message)
        try:
            from openai import AsyncOpenAI  # type: ignore[import-untyped]

            if not DEEPSEEK_API_KEY:
                raise ValueError("DEEPSEEK_API_KEY가 설정되지 않았습니다.")

            client = AsyncOpenAI(
                api_key=DEEPSEEK_API_KEY,
                base_url=DEEPSEEK_BASE_URL.rstrip("/"),
            )

            messages = [{"role": "system", "content": self._get_system_prompt(is_long_form)}]
            messages.extend(self._openai_compatible_history(history))
            messages.append({"role": "user", "content": message})

            max_tokens = self._safe_max_tokens(
                max_tokens, 4096 if is_long_form else 2048, cap=32000
            )

            temp = self._safe_temperature(temperature, 2.0)
            ds_model = (model_override or DEEPSEEK_MODEL).strip() or DEEPSEEK_MODEL
            response = await client.chat.completions.create(
                model=ds_model,
                messages=messages,
                temperature=temp,
                max_tokens=max_tokens,
            )

            raw_ds = None
            if response.choices and response.choices[0].message:
                raw_ds = response.choices[0].message.content
            content = (raw_ds or "").strip() or "(응답 없음)"
            usage = response.usage
            tokens = (usage.total_tokens if usage else 0) or 0

            return {
                "content": content,
                "model": ds_model,
                "tokens": tokens,
                "confidence": 0.9,
            }
        except ImportError:
            logger.warning("openai 패키지가 설치되지 않았습니다.")
            return self._generate_fallback_response(message)
        except Exception as e:
            logger.error(f"DeepSeek API 호출 오류: {e}")
            return self._generate_fallback_response(message)

    async def _call_deepseek_local(
        self,
        message: str,
        history: List[Dict],
        is_long_form: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """DeepSeek 설치형: Ollama에 설치한 DeepSeek 모델 호출. temperature·max_tokens는 파이프라인 튜닝에서 전달."""
        try:
            import aiohttp  # type: ignore[import-untyped]

            prompt = self._get_system_prompt(is_long_form) + "\n\n"
            for h in self._openai_compatible_history(history):
                role = "User" if h["role"] == "user" else "Assistant"
                prompt += f"{role}: {h['content']}\n"
            prompt += f"User: {message}\nAssistant:"

            num_predict = self._safe_max_tokens(
                max_tokens if max_tokens > 0 else (2048 if is_long_form else 1024),
                2048 if is_long_form else 1024,
                cap=32000,
            )
            temp = self._safe_temperature(temperature, 2.0)
            ollama_ds_model = (
                (model_override or DEEPSEEK_LOCAL_MODEL).strip() or DEEPSEEK_LOCAL_MODEL
            )
            payload = {
                "model": ollama_ds_model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": temp, "num_predict": num_predict},
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=120),
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        raw = (data.get("response") or "").strip()
                        return {
                            "content": raw or "(응답 없음)",
                            "model": ollama_ds_model,
                            "tokens": data.get("eval_count", 0),
                            "confidence": 0.85,
                        }
                    body = await response.text()
                    logger.warning(
                        "Ollama(DeepSeek 로컬) HTTP %s: %s", response.status, body[:500]
                    )
                    raise Exception(f"Ollama(DeepSeek 로컬) API 오류: {response.status}")
        except ImportError:
            logger.warning("aiohttp 패키지가 설치되지 않았습니다.")
            return self._generate_fallback_response(message)
        except Exception as e:
            logger.error(f"DeepSeek 설치형(Ollama) 호출 오류: {e}")
            return self._generate_fallback_response(message)

    async def _call_ollama(
        self,
        message: str,
        history: List[Dict],
        is_long_form: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Ollama API 호출 (로컬 LLM). temperature·max_tokens는 파이프라인 튜닝에서 전달."""
        try:
            import aiohttp  # type: ignore[import-untyped]

            prompt = self._get_system_prompt(is_long_form) + "\n\n"
            for h in self._openai_compatible_history(history):
                role = "User" if h["role"] == "user" else "Assistant"
                prompt += f"{role}: {h['content']}\n"
            prompt += f"User: {message}\nAssistant:"

            opts = {}
            np = self._safe_max_tokens(
                max_tokens if max_tokens > 0 else (2048 if is_long_form else 1024),
                2048 if is_long_form else 1024,
                cap=32000,
            )
            opts["num_predict"] = np
            opts["temperature"] = self._safe_temperature(temperature, 2.0)
            ollama_model = (model_override or self.model).strip() or self.model
            payload = {"model": ollama_model, "prompt": prompt, "stream": False}
            if opts:
                payload["options"] = opts

            timeout = aiohttp.ClientTimeout(total=120)
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json=payload,
                    timeout=timeout,
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        raw = (data.get("response") or "").strip()
                        return {
                            "content": raw or "(응답 없음)",
                            "model": ollama_model,
                            "tokens": data.get("eval_count", 0),
                            "confidence": 0.8,
                        }
                    else:
                        body = await response.text()
                        logger.warning("Ollama HTTP %s: %s", response.status, body[:500])
                        raise Exception(f"Ollama API 오류: {response.status}")

        except ImportError:
            logger.warning("aiohttp 패키지가 설치되지 않았습니다.")
            return self._generate_fallback_response(message)
        except Exception as e:
            logger.error(f"Ollama API 호출 오류: {e}")
            return self._generate_fallback_response(message)

    def _generate_fallback_response(self, message: str) -> Dict[str, Any]:
        """폴백 응답 생성 (LLM 없이)"""
        # 간단한 규칙 기반 응답
        message_lower = message.lower()

        cr = self.knowledge_base.get("common_responses") or {}
        if any(word in message_lower for word in ["안녕", "hello", "hi"]):
            greet = cr.get("greeting") or "안녕하세요! 무엇을 도와드릴까요?"
            content = f"""## 한 줄 결론

{greet}

## 다음 단계

원하시는 **주제나 질문**을 구체적으로 입력해 주세요."""
        elif any(word in message_lower for word in ["도움", "help", "도와"]):
            caps = self.knowledge_base.get("capabilities") or [
                "자연어 대화",
                "질문 답변",
            ]
            content = f"""## 한 줄 결론

도움을 드릴 수 있는 범위를 안내합니다.

## 핵심 내용

제가 할 수 있는 것들:

{chr(10).join(f"- {cap}" for cap in caps)}

## 다음 단계

어떤 **과업**이나 **질문**이 필요하신지 알려 주세요."""
        elif "코드" in message_lower or "프로그래밍" in message_lower:
            content = """## 한 줄 결론

프로그래밍·코드 관련 질문에 맞춰 단계적으로 도와드릴 수 있습니다.

## 핵심 내용

다음 주제를 지원합니다.

- Python, JavaScript, TypeScript 등 언어
- React, FastAPI 등 프레임워크
- 알고리즘·자료구조
- 코드 리뷰·디버깅

## 다음 단계

**언어·목표·에러 메시지**를 함께 보내 주시면 더 정확히 답합니다."""
        else:
            preview = message if len(message) <= 200 else (message[:200] + "…")
            content = f"""## 한 줄 결론

요청하신 내용에 대해 **기본 모드(폴백)** 로 안내합니다.

## 핵심 내용

입력: `{preview}`

더 정확한 생성 응답을 쓰려면 LLM API 또는 로컬 모델을 설정하세요.

## 실행안

| 방식 | 환경 변수 예시 |
|------|----------------|
| OpenAI | `OPENAI_API_KEY`, `OPENAI_MODEL` |
| Anthropic | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` |
| Ollama | `OLLAMA_BASE_URL`, `LLM_MODEL` |

## 다음 단계

설정 후 같은 질문을 다시 보내 주시거나, **원하시는 출력 형식**을 알려 주세요."""

        return {
            "content": content,
            "model": "fallback",
            "tokens": len(content.split()),
            "confidence": 0.6,
        }

    async def _call_notebook_llm(
        self, message: str, history: List[Dict], context: Optional[Dict], is_long_form: bool = False
    ) -> Dict[str, Any]:
        """노트북 LLM 호출"""
        try:
            if not self.notebook_llm:
                raise ValueError("노트북 LLM이 초기화되지 않았습니다.")
            
            # 히스토리를 노트북 LLM 형식으로 변환
            prompt = message
            if history:
                recent_history = self._openai_compatible_history(history)
                context_text = "\n".join(
                    [
                        f"{'User' if h['role'] == 'user' else 'Assistant'}: {h['content']}"
                        for h in recent_history
                    ]
                )
                prompt = f"{context_text}\n\nUser: {message}\nAssistant:"
            
            # 시스템 프롬프트: OpenAI 등 경로와 동일하게 항상 GFM(젠스파이크형) 출력 규칙 적용
            system_prompt = self._get_system_prompt(is_long_form)
            prompt = f"{system_prompt}\n\n{prompt}"
            
            # 노트북 LLM 호출
            llm_response = await self.notebook_llm.generate_response(
                prompt=prompt,
                context=context,
                preferred_model=None,
                force_mode=None
            )
            
            nb_content = getattr(llm_response, "content", None)
            nb_content = (nb_content or "").strip() or "(응답 없음)"
            return {
                "content": nb_content,
                "model": getattr(llm_response, "model_used", None) or self.model,
                "tokens": getattr(llm_response, "tokens_used", 0) or 0,
                "confidence": float(getattr(llm_response, "confidence", 0.8) or 0.8),
            }
            
        except Exception as e:
            logger.error(f"노트북 LLM 호출 오류: {e}")
            # 폴백으로 Ollama 시도 (context에 보강된 temperature·max_tokens 반영)
            fb_temp, fb_max = 0.7, 2048
            if context and isinstance(context, dict):
                if context.get("temperature") is not None:
                    try:
                        fb_temp = float(context["temperature"])
                    except (TypeError, ValueError):
                        pass
                if context.get("max_tokens") is not None:
                    try:
                        fb_max = int(context["max_tokens"])
                    except (TypeError, ValueError):
                        pass
                if fb_max <= 0:
                    fb_max = 2048
            if self.provider != "ollama":
                return await self._call_ollama(message, history, is_long_form, fb_temp, fb_max)
            return self._generate_fallback_response(message)
    
    def clear_history(self, conversation_id: Optional[str] = None):
        """대화 히스토리 초기화"""
        if conversation_id:
            self.conversation_history.pop(conversation_id, None)
        else:
            self.conversation_history.clear()
