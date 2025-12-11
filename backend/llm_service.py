"""
LLM 서비스 모듈
- OpenAI, Anthropic, 로컬 LLM 지원
- 기본 지식 통합
- 컨텍스트 관리
"""

import os
import json
import time
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

# 환경 변수에서 API 키 로드
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# 노트북 LLM 통합 확인
try:
    from notebook_llm_integration import NotebookLLMIntegration
    NOTEBOOK_LLM_AVAILABLE = True
except ImportError:
    NOTEBOOK_LLM_AVAILABLE = False
    NotebookLLMIntegration = None


class LLMService:
    """LLM 서비스 클래스"""

    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "openai").lower()
        self.model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
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

    def _load_knowledge_base(self) -> Dict[str, Any]:
        """기본 지식 베이스 로드"""
        knowledge_file = os.path.join(os.path.dirname(__file__), "knowledge_base.json")

        # 기본 지식 베이스
        default_knowledge = {
            "system_info": {
                "name": "CORBU AI",
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
                "greeting": "안녕하세요! CORBU AI입니다. 무엇을 도와드릴까요?",
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

    def _get_system_prompt(self, is_long_form: bool = False) -> str:
        """시스템 프롬프트 생성"""
        knowledge = self.knowledge_base
        system_prompt = f"""당신은 {knowledge["system_info"]["name"]}입니다.
버전: {knowledge["system_info"]["version"]}
설명: {knowledge["system_info"]["description"]}

능력:
{chr(10).join(f"- {cap}" for cap in knowledge["capabilities"])}

지침:
1. 사용자에게 친절하고 도움이 되는 응답을 제공하세요.
2. 정확하지 않은 정보는 추측하지 말고 솔직하게 말하세요.
3. 한국어로 자연스럽게 대화하세요.
4. 코드나 기술적인 내용을 설명할 때는 예시를 들어주세요."""
        
        if is_long_form:
            system_prompt += """
5. 사용자의 질문이나 요구에 대해 상세하고 포괄적인 글을 작성하세요.
6. 최소 500자 이상의 길고 자세한 답변을 제공하세요.
7. 구조화된 형식(서론, 본론, 결론)으로 작성하세요.
8. 구체적인 예시와 설명을 포함하세요.
9. 마크다운 형식을 사용하여 가독성을 높이세요."""
        else:
            system_prompt += """
5. 간결하고 명확한 답변을 제공하세요."""
        
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
            # 대화 히스토리 가져오기
            history = self.conversation_history.get(conversation_id or "default", [])

            # 컨텍스트와 지식 베이스 통합
            enhanced_message, is_long_form = self._enhance_with_knowledge(message, context)

            # LLM 호출
            # 노트북 LLM 우선 사용 (사용 가능한 경우)
            if self.notebook_llm and self.provider in ["notebook", "auto", "ollama"]:
                response = await self._call_notebook_llm(enhanced_message, history, context, is_long_form)
            elif self.provider == "openai":
                response = await self._call_openai(enhanced_message, history, is_long_form)
            elif self.provider == "anthropic":
                response = await self._call_anthropic(enhanced_message, history, is_long_form)
            elif self.provider == "ollama":
                response = await self._call_ollama(enhanced_message, history, is_long_form)
            else:
                # 폴백: 기본 응답
                response = self._generate_fallback_response(message)

            # 대화 히스토리 업데이트
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": response["content"]})

            # 히스토리 길이 제한 (최근 10개 대화만 유지)
            if len(history) > 20:
                history = history[-20:]

            self.conversation_history[conversation_id or "default"] = history

            processing_time = time.time() - start_time

            return {
                "content": response["content"],
                "model": response.get("model", self.model),
                "processing_time": processing_time,
                "tokens": response.get("tokens", 0),
                "confidence": response.get("confidence", 0.8),
            }

        except Exception as e:
            logger.error(f"LLM 응답 생성 오류: {e}")
            return {
                "content": self.knowledge_base["common_responses"]["error"],
                "model": "fallback",
                "processing_time": time.time() - start_time,
                "tokens": 0,
                "confidence": 0.0,
                "error": str(e),
            }

    def _enhance_with_knowledge(self, message: str, context: Optional[Dict]) -> tuple[str, bool]:
        """지식 베이스를 활용하여 메시지 강화
        
        Returns:
            tuple: (enhanced_message, is_long_form)
        """
        # 간단한 키워드 매칭으로 관련 지식 추가
        enhanced = message
        is_long_form = False

        # 긴 글 생성 요구 감지
        long_form_keywords = [
            "글", "작성", "생성", "만들어", "작성해줘", "생성해줘", 
            "만들어줘", "글쓰기", "에세이", "문서", "상세하게", 
            "자세히", "길게", "포괄적으로", "전체적으로"
        ]
        question_keywords = ["?", "질문", "궁금", "알려줘", "설명해줘", "알려주세요"]
        
        message_lower = message.lower()
        
        # 긴 글 생성 키워드가 있거나 질문 형태인 경우
        if any(keyword in message_lower for keyword in long_form_keywords):
            is_long_form = True
            enhanced = f"""{message}

위 요청에 대해 다음을 포함한 상세하고 포괄적인 글을 작성해주세요:
- 서론: 주제 소개 및 배경 설명
- 본론: 핵심 내용을 여러 섹션으로 나누어 상세히 설명
- 결론: 요약 및 마무리
- 구체적인 예시와 사례 포함
- 마크다운 형식 사용 (제목, 소제목, 목록, 강조 등)
최소 500자 이상의 길고 자세한 글을 작성해주세요."""
        elif any(keyword in message_lower for keyword in question_keywords):
            # 질문인 경우에도 상세한 답변 제공
            is_long_form = True
            enhanced = f"""{message}

위 질문에 대해 상세하고 포괄적으로 답변해주세요. 다음을 포함해주세요:
- 질문에 대한 명확한 답변
- 배경 설명 및 컨텍스트
- 구체적인 예시와 사례
- 관련 정보 및 추가 설명
- 마크다운 형식 사용
최소 300자 이상의 자세한 답변을 작성해주세요."""

        # 프로그래밍 관련 질문 감지
        programming_keywords = ["코드", "프로그래밍", "함수", "변수", "클래스", "모듈"]
        if any(keyword in message for keyword in programming_keywords):
            enhanced = f"[프로그래밍 질문] {enhanced}"

        return enhanced, is_long_form

    async def _call_openai(self, message: str, history: List[Dict], is_long_form: bool = False) -> Dict[str, Any]:
        """OpenAI API 호출"""
        try:
            from openai import AsyncOpenAI

            if not OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")

            client = AsyncOpenAI(api_key=OPENAI_API_KEY)

            messages = [{"role": "system", "content": self._get_system_prompt(is_long_form)}]

            # 히스토리 추가 (최근 10개만)
            for h in history[-10:]:
                messages.append(h)

            messages.append({"role": "user", "content": message})
            
            # 긴 글 생성인 경우 max_tokens 증가
            max_tokens = 2000 if is_long_form else 1000

            response = await client.chat.completions.create(
                model=self.model, messages=messages, temperature=0.7, max_tokens=max_tokens
            )

            return {
                "content": response.choices[0].message.content,
                "model": response.model,
                "tokens": response.usage.total_tokens if response.usage else 0,
                "confidence": 0.9,
            }

        except ImportError:
            logger.warning("openai 패키지가 설치되지 않았습니다.")
            return self._generate_fallback_response(message)
        except Exception as e:
            logger.error(f"OpenAI API 호출 오류: {e}")
            return self._generate_fallback_response(message)

    async def _call_anthropic(
        self, message: str, history: List[Dict], is_long_form: bool = False
    ) -> Dict[str, Any]:
        """Anthropic API 호출"""
        try:
            from anthropic import Anthropic

            if not ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY가 설정되지 않았습니다.")

            client = Anthropic(api_key=ANTHROPIC_API_KEY)

            # 시스템 프롬프트와 히스토리 결합
            system_prompt = self._get_system_prompt(is_long_form)
            conversation = "\n".join(
                [
                    f"{'Human' if h['role'] == 'user' else 'Assistant'}: {h['content']}"
                    for h in history[-10:]
                ]
            )
            
            # 긴 글 생성인 경우 max_tokens 증가
            max_tokens = 2000 if is_long_form else 1000

            response = await client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": f"{conversation}\n\nHuman: {message}"}
                ],
            )

            return {
                "content": response.content[0].text,
                "model": "claude-3-5-sonnet",
                "tokens": response.usage.input_tokens + response.usage.output_tokens,
                "confidence": 0.9,
            }

        except ImportError:
            logger.warning("anthropic 패키지가 설치되지 않았습니다.")
            return self._generate_fallback_response(message)
        except Exception as e:
            logger.error(f"Anthropic API 호출 오류: {e}")
            return self._generate_fallback_response(message)

    async def _call_ollama(self, message: str, history: List[Dict], is_long_form: bool = False) -> Dict[str, Any]:
        """Ollama API 호출 (로컬 LLM)"""
        try:
            import aiohttp

            # 히스토리와 메시지 결합
            prompt = self._get_system_prompt(is_long_form) + "\n\n"
            for h in history[-10:]:
                role = "User" if h["role"] == "user" else "Assistant"
                prompt += f"{role}: {h['content']}\n"
            prompt += f"User: {message}\nAssistant:"

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={"model": self.model, "prompt": prompt, "stream": False},
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "content": data.get("response", ""),
                            "model": self.model,
                            "tokens": data.get("eval_count", 0),
                            "confidence": 0.8,
                        }
                    else:
                        raise Exception(f"Ollama API 오류: {response.status}")

        except ImportError:
            logger.warning("aiohttp 패키지가 설치되지 않았습니다.")
            return self._generate_fallback_response(message)
        except (aiohttp.ClientError, ValueError, KeyError) as e:
            logger.error(f"Ollama API 호출 오류: {e}")
            return self._generate_fallback_response(message)

    def _generate_fallback_response(self, message: str) -> Dict[str, Any]:
        """폴백 응답 생성 (LLM 없이)"""
        # 간단한 규칙 기반 응답
        message_lower = message.lower()

        if any(word in message_lower for word in ["안녕", "hello", "hi"]):
            content = self.knowledge_base["common_responses"]["greeting"]
        elif any(word in message_lower for word in ["도움", "help", "도와"]):
            content = f"""도움을 드리겠습니다!

제가 할 수 있는 것들:
{chr(10).join(f"- {cap}" for cap in self.knowledge_base["capabilities"])}

어떤 도움이 필요하신가요?"""
        elif "코드" in message_lower or "프로그래밍" in message_lower:
            content = """프로그래밍 관련 질문이시군요!

다음과 같은 주제에 대해 도움을 드릴 수 있습니다:
- Python, JavaScript, TypeScript 등 프로그래밍 언어
- React, FastAPI 등 프레임워크
- 알고리즘 및 자료구조
- 코드 리뷰 및 디버깅

구체적으로 어떤 도움이 필요하신가요?"""
        else:
            content = f"""'{message}'에 대한 답변입니다.

현재 기본 모드로 작동 중입니다. 더 정확한 답변을 원하시면 LLM API 키를 설정해주세요.

환경 변수 설정:
- OPENAI_API_KEY: OpenAI API 사용
- ANTHROPIC_API_KEY: Anthropic API 사용
- OLLAMA_BASE_URL: 로컬 Ollama 사용

어떤 도움이 더 필요하신가요?"""

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
                # 최근 대화를 프롬프트에 포함
                recent_history = history[-5:]  # 최근 5개만
                context_text = "\n".join([
                    f"{'User' if h['role'] == 'user' else 'Assistant'}: {h['content']}"
                    for h in recent_history
                ])
                prompt = f"{context_text}\n\nUser: {message}\nAssistant:"
            
            # 시스템 프롬프트 추가 (긴 글 생성인 경우)
            if is_long_form:
                system_prompt = self._get_system_prompt(is_long_form)
                prompt = f"{system_prompt}\n\n{prompt}"
            
            # 노트북 LLM 호출
            llm_response = await self.notebook_llm.generate_response(
                prompt=prompt,
                context=context,
                preferred_model=None,
                force_mode=None
            )
            
            return {
                "content": llm_response.content,
                "model": llm_response.model_used,
                "tokens": llm_response.tokens_used,
                "confidence": llm_response.confidence
            }
            
        except Exception as e:
            logger.error(f"노트북 LLM 호출 오류: {e}")
            # 폴백으로 Ollama 시도
            if self.provider != "ollama":
                return await self._call_ollama(message, history)
            return self._generate_fallback_response(message)
    
    def clear_history(self, conversation_id: Optional[str] = None):
        """대화 히스토리 초기화"""
        if conversation_id:
            self.conversation_history.pop(conversation_id, None)
        else:
            self.conversation_history.clear()
