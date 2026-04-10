"""
파이프라인 튜닝 설정 — 서버/관리자 전용.
설정 파일 또는 환경 변수로만 변경 가능하며, API 쓰기는 PIPELINE_TUNING_SECRET 필요.
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

_CONFIG_PATH = Path(__file__).resolve().parent / "pipeline_tuning_config.json"
_DEFAULT: Dict[str, Any] = {
    "version": 1,
    "quality_presets": {
        "basic": {
            "description": "빠른 응답, 파이프라인 최소, ChatGPT/Gemini처럼 직접 LLM 우선",
            "pipeline_steps": {"material_collection": True, "logical_structure": False, "style_instruction": False},
            "llm_timeout_seconds": 15,
            "temperature": 0.5,
            "max_tokens": 8192,
            "use_intelligent_engine": False,
            "use_pre_generation_pipeline": False,
            "prefer_direct_llm": True,
        },
        "enhanced": {
            "description": "균형 잡힌 품질, ChatGPT/Gemini처럼 직접 LLM 우선 시도 후 파이프라인",
            "pipeline_steps": {"material_collection": True, "logical_structure": True, "style_instruction": True},
            "llm_timeout_seconds": 30,
            "temperature": 0.7,
            "max_tokens": 16384,
            "use_intelligent_engine": True,
            "use_pre_generation_pipeline": True,
            "prefer_direct_llm": True,
        },
        "ultimate": {
            "description": "최고 품질, ChatGPT/Gemini처럼 직접 LLM 우선 시도 후 파이프라인",
            "pipeline_steps": {"material_collection": True, "logical_structure": True, "style_instruction": True},
            "llm_timeout_seconds": 60,
            "temperature": 0.8,
            "max_tokens": 16384,
            "use_intelligent_engine": True,
            "use_pre_generation_pipeline": True,
            "prefer_direct_llm": True,
        },
    },
    "pipeline": {
        "max_web_research_chars": 2000,
        "max_project_knowledge_chars": 1500,
        "max_conversation_context_messages": 4,
        "max_conversation_message_chars": 200,
        "max_materials_summary_per_source": 800,
        "enable_capability_help_injection": True,
    },
    "deepseek_auto": {
        "reasoner_min_query_len": 500,
        "refine_min_query_len": 280,
        # 0 = 비활성. 질문 길이(문자)가 상한을 넘으면 해당 단계는 AUTO로 켜지지 않음(토큰·지연 가드).
        "reasoner_max_query_len": 0,
        "refine_max_query_len": 0,
        # True이면 AUTO가 reasoner·refine을 동시에 켠 경우 refine만 끔(Reasoner 우선, 중복 호출 완화).
        "prefer_single_deepseek_stage": False,
    },
    "response_flow": {
        "try_intelligent_engine_first": True,
        "try_knowledge_based_second": True,
        "try_llm_service_third": True,
        "fallback_to_intelligent_response": True,
    },
}

_cached: Optional[Dict[str, Any]] = None


def _load_raw() -> Dict[str, Any]:
    """파일에서 설정 로드. 없거나 오류 시 기본값 반환."""
    global _cached
    if _cached is not None:
        return _cached
    if not _CONFIG_PATH.exists():
        _cached = dict(_DEFAULT)
        logger.info("파이프라인 튜닝: 설정 파일 없음, 기본값 사용")
        return _cached
    try:
        with open(_CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        # 필수 키 보강
        out = dict(_DEFAULT)
        for key in ("quality_presets", "pipeline", "response_flow", "deepseek_auto"):
            if isinstance(data.get(key), dict):
                deep_merge(out[key], data[key])
        out["version"] = data.get("version", out["version"])
        _cached = out
        logger.info("파이프라인 튜닝: 설정 파일 로드 완료")
        return _cached
    except Exception as e:
        logger.warning("파이프라인 튜닝 로드 실패: %s, 기본값 사용", e)
        _cached = dict(_DEFAULT)
        return _cached


def deep_merge(base: Dict[str, Any], override: Dict[str, Any]) -> None:
    """base에 override를 재귀 병합 (in-place)."""
    for k, v in override.items():
        if k in base and isinstance(base[k], dict) and isinstance(v, dict):
            deep_merge(base[k], v)
        else:
            base[k] = v


def get_config() -> Dict[str, Any]:
    """현재 파이프라인 튜닝 설정 반환 (읽기 전용 사본)."""
    return json.loads(json.dumps(_load_raw()))


def get_preset(quality: str) -> Dict[str, Any]:
    """품질 프리셋(basic/enhanced/ultimate)에 해당하는 설정. 없으면 enhanced 기준."""
    raw = _load_raw()
    presets = raw.get("quality_presets") or {}
    q = (quality or "enhanced").lower()
    if q not in presets:
        q = "enhanced"
    return dict(presets.get(q, presets.get("enhanced", {})))


def is_pipeline_step_enabled(quality: str, step: str) -> bool:
    """해당 품질에서 파이프라인 단계( material_collection / logical_structure / style_instruction ) 사용 여부."""
    preset = get_preset(quality)
    steps = preset.get("pipeline_steps") or {}
    return steps.get(step, True)


def apply_config(updates: Dict[str, Any], secret: Optional[str] = None) -> bool:
    """
    설정 업데이트 적용. 성공 시 True.
    PIPELINE_TUNING_SECRET이 설정된 경우 secret 인자가 일치해야 저장 가능.
    """
    expected = os.environ.get("PIPELINE_TUNING_SECRET", "").strip()
    if expected and secret != expected:
        logger.warning("파이프라인 튜닝: 잘못된 시크릿으로 쓰기 시도")
        return False
    global _cached
    current = _load_raw()
    deep_merge(current, updates)
    try:
        with open(_CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(current, f, ensure_ascii=False, indent=2)
        _cached = current
        logger.info("파이프라인 튜닝: 설정 저장 완료")
        return True
    except Exception as e:
        logger.error("파이프라인 튜닝 저장 실패: %s", e)
        return False


def reload_config() -> None:
    """캐시 무효화 후 다음 get_config()에서 파일 재로드."""
    global _cached
    _cached = None
