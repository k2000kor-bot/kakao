# YouTube 영상 → 자막 추출·이해(요약/핵심) → 지식 문자열
# 입력창 URL 또는 파이프라인 내 근거 부족 시 사용. 별도 UI 없이 대화/답변 과정에 통합.

import asyncio
import logging
import re
from typing import List, Optional, Tuple

logger = logging.getLogger(__name__)

# YouTube URL 패턴 (공유 링크 포함)
_YOUTUBE_URL_PATTERN = re.compile(
    r"https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w\-]+(?:\?[^\s]*)?",
    re.IGNORECASE,
)


def extract_youtube_urls(text: str) -> List[str]:
    """텍스트(메시지 등)에서 YouTube URL 목록 추출. 중복 제거 순서 유지."""
    if not (text or "").strip():
        return []
    seen = set()
    out = []
    for m in _YOUTUBE_URL_PATTERN.findall(text):
        # 정규화: ? 이전만
        u = m.split("?")[0].strip()
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def _get_transcript_from_url(url: str) -> Optional[Tuple[str, str]]:
    """URL에서 (제목, 자막텍스트) 반환. 실패 시 None. 동기."""
    try:
        from api.project_session_api import (
            _extract_youtube_video_id,
            _get_youtube_transcript,
            _get_youtube_video_title,
        )
        vid = _extract_youtube_video_id(url)
        if not vid:
            return None
        transcript = _get_youtube_transcript(vid)
        if not (transcript or "").strip():
            return None
        title = _get_youtube_video_title(vid)
        return (title, transcript.strip())
    except Exception as e:
        logger.warning("자막 추출 실패 url=%s: %s", url[:60], e)
        return None


def _search_and_get_transcripts(query: str, max_videos: int = 2) -> List[Tuple[str, str]]:
    """검색어로 영상 목록 조회 후 각 영상 자막 추출. (제목, 자막) 리스트."""
    try:
        from api.project_session_api import (
            _get_youtube_transcript,
            _youtube_search_videos,
        )
    except ImportError:
        return []
    videos = _youtube_search_videos(query.strip(), max_videos=max_videos)
    if not videos:
        return []
    result = []
    for v in videos:
        vid = v.get("id")
        if not vid:
            continue
        transcript = _get_youtube_transcript(vid)
        if not (transcript or "").strip():
            continue
        title = (v.get("title") or "").strip() or f"영상 {vid}"
        result.append((title, transcript.strip()))
    return result


async def _summarize_transcript_to_knowledge_async(title: str, transcript: str) -> str:
    """자막을 요약·핵심 지식으로 압축. LLM 사용 시 비동기."""
    if not (transcript or "").strip():
        return ""
    text = transcript
    prompt = (
        f'다음은 YouTube 영상 "{title}"의 자막입니다. '
        "요약과 핵심 지식만 추출해 한 덩어리 텍스트로 정리해 주세요. "
        "번호·불필요한 반복은 제거하고, 질문 답변의 근거로 쓸 수 있도록 사실 위주로 작성해 주세요. "
        "자막 원문을 그대로 넣지 말고 요약·핵심만 출력하세요.\n\n[자막]\n" + text
    )
    try:
        from llm_service import LLMService
        llm = LLMService()
        res = await llm.generate_response(prompt, None, {})
        out = (res.get("content") or "").strip()
        return out if out else transcript
    except Exception as e:
        logger.debug("자막 요약 LLM 실패, 원문 일부 사용: %s", e)
        return transcript


def _summarize_transcript_to_knowledge_sync(title: str, transcript: str) -> str:
    """동기 컨텍스트에서 자막 요약 (이벤트 루프 밖에서 호출)."""
    try:
        return asyncio.run(_summarize_transcript_to_knowledge_async(title, transcript))
    except RuntimeError:
        # 이미 실행 중인 이벤트 루프가 있으면 새 루프에서 실행
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(_summarize_transcript_to_knowledge_async(title, transcript))
        finally:
            loop.close()


def transcript_to_knowledge(title: str, transcript: str, use_llm: bool = True) -> str:
    """
    자막을 지식 문자열로 변환.
    use_llm=True면 LLM으로 요약·핵심 추출, False면 원문 일부만 사용.
    """
    if not (transcript or "").strip():
        return ""
    if use_llm:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None
        if loop is not None:
            # 이미 async 컨텍스트: 동기 호출에서 async 실행 불가 → 원문 사용
            return transcript
        return _summarize_transcript_to_knowledge_sync(title, transcript)


async def fetch_knowledge_from_url_async(
    url: str, understand: bool = True
) -> Optional[Tuple[str, str]]:
    """
    YouTube URL 하나에서 자막 추출 후, 이해(요약)해 지식으로 반환.
    반환: (제목, 지식문자열) 또는 None.
    understand=True면 LLM으로 요약·핵심 추출.
    """
    pair = _get_transcript_from_url(url)
    if not pair:
        return None
    title, transcript = pair
    if understand:
        knowledge = await _summarize_transcript_to_knowledge_async(title, transcript)
    else:
        knowledge = transcript
    return (title, knowledge)


def fetch_knowledge_from_url_sync(
    url: str, understand: bool = True
) -> Optional[Tuple[str, str]]:
    """동기: URL 하나에서 (제목, 지식문자열) 추출."""
    pair = _get_transcript_from_url(url)
    if not pair:
        return None
    title, transcript = pair
    knowledge = transcript_to_knowledge(title, transcript, use_llm=understand)
    return (title, knowledge)


async def fetch_knowledge_for_query_async(query: str, max_videos: int = 2, understand: bool = True) -> str:
    """
    검색어로 영상 검색 후 자막 추출·(선택)요약하여 하나의 지식 문자열로 반환.
    답변 생성 과정에서 근거가 부족할 때 파이프라인 내부에서 호출.
    """
    if not (query or "").strip():
        return ""
    pairs = _search_and_get_transcripts(query.strip(), max_videos=max_videos)
    if not pairs:
        return ""
    parts = []
    for title, transcript in pairs:
        if understand:
            knowledge = await _summarize_transcript_to_knowledge_async(title, transcript)
        else:
            knowledge = transcript
        if knowledge:
            parts.append(f"[영상: {title}]\n{knowledge}")
    return "\n\n".join(parts).strip() if parts else ""


def fetch_knowledge_for_query_sync(query: str, max_videos: int = 2, understand: bool = True) -> str:
    """동기: 검색어로 영상 지식 수집."""
    try:
        return asyncio.run(fetch_knowledge_for_query_async(query, max_videos, understand))
    except RuntimeError:
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(fetch_knowledge_for_query_async(query, max_videos, understand))
        finally:
            loop.close()
