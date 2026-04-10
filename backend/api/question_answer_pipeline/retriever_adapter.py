# Retriever 어댑터: retrieval_spec 실행 → evidence_bundle (Step D)
# 기존 RAG/프로젝트 컨텍스트 호출, Evidence Store에 스냅샷 고정

import hashlib
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from .schemas import EvidenceBundle, EvidenceItem, RetrievalSpec

logger = logging.getLogger(__name__)

# 프로젝트 노트북 텍스트 스캔 상한(바이트 단위 아님, 문자 기준 청크 슬라이싱)
_MAX_PROJECT_KNOWLEDGE_SCAN_CHARS = 12000

# 클라이언트·상위 레이어가 미리 넣은 웹 요약(파이프라인 단독 실행 시 선택)
_WEB_CONTEXT_KEYS = (
    "pipeline_web_evidence",
    "web_evidence_for_pipeline",
    "preloaded_web_research",
)


def _hash_content(content: str) -> str:
    return hashlib.sha256((content or "").encode("utf-8")).hexdigest()[:16]


def _web_snippet_from_context(ctx: Dict[str, Any]) -> str:
    for k in _WEB_CONTEXT_KEYS:
        raw = ctx.get(k)
        if isinstance(raw, str) and raw.strip():
            return raw.strip()
    return ""


def retrieve(
    spec: RetrievalSpec,
    context_pack: Dict[str, Any],
) -> EvidenceBundle:
    """
    spec대로 검색 실행, evidence_bundle 반환.
    MVP: internal_rag — 프로젝트 노트북 텍스트 청크화.
    web 플랜 — context.pipeline_web_evidence 등 문자열이 있으면 web_page 항목 1개.
    여러 서브질문에 동일 소스가 반복돼도 internal/web 각각 한 번만 채움(중복 청크 방지).
    """
    ctx = context_pack or {}
    items: List[EvidenceItem] = []
    project_id = ctx.get("project_id") or ctx.get("projectId")
    project_knowledge = (ctx.get("projectKnowledge") or "").strip()
    web_blob = _web_snippet_from_context(ctx)

    internal_done = False
    web_done = False

    for sq in spec.subquestions:
        for plan in sq.source_plan or []:
            ptype = plan.get("type")
            if ptype == "internal_rag":
                if internal_done:
                    continue
                internal_done = True
                query = plan.get("query", sq.question)
                top_k = int(plan.get("top_k", 8) or 8)
                if project_knowledge:
                    cap = min(len(project_knowledge), _MAX_PROJECT_KNOWLEDGE_SCAN_CHARS)
                    chunks = [
                        project_knowledge[i : i + 500].strip()
                        for i in range(0, cap, 500)
                    ]
                    for i, content in enumerate(chunks[:top_k]):
                        if not content:
                            continue
                        ev_id = f"ev_{len(items) + 1:03d}"
                        items.append(
                            EvidenceItem(
                                evidence_id=ev_id,
                                type="rag_chunk",
                                source_ref={
                                    "doc_id": f"project_{project_id}",
                                    "chunk_index": i,
                                },
                                content=content,
                                timestamp=datetime.utcnow().isoformat() + "Z",
                                score=0.9 - (i * 0.05),
                                hash=_hash_content(content),
                            )
                        )
                else:
                    items.append(
                        EvidenceItem(
                            evidence_id="ev_001",
                            type="rag_chunk",
                            source_ref={
                                "query": (query or "")[:200],
                                "query_hash": _hash_content(query or ""),
                            },
                            content="",
                            timestamp=datetime.utcnow().isoformat() + "Z",
                            score=0.0,
                            hash="",
                        )
                    )
            elif ptype == "web":
                if web_done:
                    continue
                web_done = True
                if not web_blob:
                    continue
                qpreview = (plan.get("query") or sq.question or "")[:200]
                items.append(
                    EvidenceItem(
                        evidence_id=f"ev_web_{len(items) + 1:03d}",
                        type="web_page",
                        source_ref={"query": qpreview, "source": "context_injected"},
                        content=web_blob[:4000],
                        timestamp=datetime.utcnow().isoformat() + "Z",
                        score=0.75,
                        hash=_hash_content(web_blob[:4000]),
                    )
                )

    coverage = len([e for e in items if e.content]) / max(1, len(items)) if items else 0.0
    confidence = sum(e.score for e in items) / max(1, len(items))
    bundle = EvidenceBundle(items=items, coverage=coverage, confidence=confidence)
    logger.info("evidence_bundle: %d items, coverage=%.2f", len(items), coverage)
    return bundle
