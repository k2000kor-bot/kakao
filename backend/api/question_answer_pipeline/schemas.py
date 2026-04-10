# 질문→답변 파이프라인 스키마 (QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md §3)
# 서비스에 바로 박는 기준의 데이터 구조

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class RouteDecision:
    """Step B 산출물. Router 결정."""
    task_type: str  # fact_check | how_to | compare | summarize | generate | planning
    domain: List[str]  # real_estate, law, dev, marketing 등
    grounding_required: str  # required | preferred | none
    sources: List[str]  # internal_rag, sql, web
    risk_level: str  # low | medium | high
    answer_schema: str  # steps | checklist | table | narrative
    stop_conditions: List[str] = field(default_factory=list)  # need_more_data, refuse, safe_complete

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_type": self.task_type,
            "domain": self.domain,
            "grounding_required": self.grounding_required,
            "sources": self.sources,
            "risk_level": self.risk_level,
            "answer_schema": self.answer_schema,
            "stop_conditions": self.stop_conditions,
        }


@dataclass
class SourcePlanItem:
    type: str  # internal_rag, sql, web
    query: str = ""
    top_k: int = 8


@dataclass
class SubQuestion:
    id: str
    question: str
    source_plan: List[Dict[str, Any]]
    required_fields: List[str] = field(default_factory=list)
    freshness: Optional[Dict[str, Any]] = None
    confidence_min: float = 0.7


@dataclass
class RetrievalSpec:
    """Step C 산출물."""
    subquestions: List[SubQuestion]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "subquestions": [
                {
                    "id": sq.id,
                    "question": sq.question,
                    "source_plan": sq.source_plan,
                    "required_fields": sq.required_fields,
                    "freshness": sq.freshness,
                    "confidence_min": sq.confidence_min,
                }
                for sq in self.subquestions
            ]
        }


@dataclass
class EvidenceItem:
    evidence_id: str
    type: str  # rag_chunk | sql_row | web_page
    source_ref: Dict[str, Any]
    content: str
    timestamp: str = ""
    score: float = 0.0
    hash: str = ""


@dataclass
class EvidenceBundle:
    """Step D 산출물."""
    items: List[EvidenceItem]
    coverage: float = 0.0
    confidence: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "items": [
                {
                    "evidence_id": e.evidence_id,
                    "type": e.type,
                    "source_ref": e.source_ref,
                    "content": e.content,
                    "timestamp": e.timestamp,
                    "score": e.score,
                    "hash": e.hash,
                }
                for e in self.items
            ],
            "coverage": self.coverage,
            "confidence": self.confidence,
        }


@dataclass
class Claim:
    claim_id: str
    statement: str
    supporting: List[str]  # evidence_ids
    conflicts: List[str] = field(default_factory=list)
    certainty: str = "medium"  # high | medium | low


@dataclass
class ClaimGraph:
    """Step E 산출물."""
    claims: List[Claim]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "claims": [
                {
                    "claim_id": c.claim_id,
                    "statement": c.statement,
                    "supporting": c.supporting,
                    "conflicts": c.conflicts,
                    "certainty": c.certainty,
                }
                for c in self.claims
            ]
        }


@dataclass
class VerificationReport:
    """Step G 산출물."""
    pass_: bool
    issues: List[str] = field(default_factory=list)
    fix_actions: List[str] = field(default_factory=list)
    # 한국어 스타일·장르 경량 검사 힌트 (pass_와 별도)
    korean_style_notes: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "pass": self.pass_,
            "issues": self.issues,
            "fix_actions": self.fix_actions,
            "korean_style_notes": self.korean_style_notes,
        }
