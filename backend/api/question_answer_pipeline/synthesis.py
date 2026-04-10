# Evidence Synthesis: evidence_bundle → claim_graph (Step E)
# 중복 제거, Claim 후보 추출. MVP: evidence 1개당 claim 1개.

import logging
import re
from typing import List, Set

from .schemas import Claim, ClaimGraph, EvidenceBundle

logger = logging.getLogger(__name__)


def synthesize(bundle: EvidenceBundle) -> ClaimGraph:
    """
    evidence_bundle -> claim_graph.
    MVP: content가 있는 각 evidence를 하나의 claim으로, supporting에 evidence_id만 연결.
    동일·유사 청크(정규화 후 앞 80자 동일)는 한 claim으로 합치지 않고 스킵해 Writer 부담 감소.
    """
    claims: List[Claim] = []
    seen_statement_keys: Set[str] = set()
    for ev in bundle.items:
        if not (ev.content and ev.content.strip()):
            continue
        raw = ev.content.strip()
        raw_norm = re.sub(r"\s+", " ", raw)
        # 동일 청크가 여러 번 들어온 경우(겹치는 RAG 슬라이스) claim 중복 방지
        dedup_key = raw_norm[:72]
        if dedup_key in seen_statement_keys:
            continue
        seen_statement_keys.add(dedup_key)
        # 문장 단위로 자르고 첫 200자만 statement로 (간단)
        statement = (raw_norm[:200] + ("..." if len(raw_norm) > 200 else ""))
        claim_id = f"c{len(claims) + 1}"
        claims.append(
            Claim(
                claim_id=claim_id,
                statement=statement,
                supporting=[ev.evidence_id],
                conflicts=[],
                certainty="high" if ev.score >= 0.8 else "medium",
            )
        )
    if not claims:
        claims.append(
            Claim(
                claim_id="c0",
                statement="(제공된 근거가 없어 일반적인 안내만 가능합니다.)",
                supporting=[],
                conflicts=[],
                certainty="low",
            )
        )
    return ClaimGraph(claims=claims)
