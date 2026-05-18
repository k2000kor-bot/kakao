import React, { useMemo } from 'react';
import type {
  RelationshipGraphData,
  RelationshipGraphEvidence,
} from '../services/conversationGraphService';

export type ConversationGraphEvidencePanelProps = {
  graph: RelationshipGraphData;
  selectedNodeId: string | null;
  focusEdge?: { sourceId: string; targetId: string } | null;
};

function filterEvidenceForSelection(
  evidence: RelationshipGraphEvidence[],
  selectedNodeId: string | null,
  focusEdge: { sourceId: string; targetId: string } | null,
): RelationshipGraphEvidence[] {
  if (focusEdge) {
    return evidence.filter(
      (e) =>
        e.type === 'edge' &&
        e.source === focusEdge.sourceId &&
        e.target === focusEdge.targetId,
    );
  }
  if (!selectedNodeId) return evidence.slice(0, 4);
  return evidence.filter(
    (e) =>
      e.type === 'edge' &&
      (e.source === selectedNodeId || e.target === selectedNodeId),
  );
}

export function ConversationGraphEvidencePanel({
  graph,
  selectedNodeId,
  focusEdge = null,
}: ConversationGraphEvidencePanelProps) {
  const evidence = graph.evidence ?? [];
  const rows = useMemo(
    () => filterEvidenceForSelection(evidence, selectedNodeId, focusEdge),
    [evidence, selectedNodeId, focusEdge],
  );

  const participantSamples = useMemo(() => {
    if (!selectedNodeId) return [];
    const label =
      graph.nodes?.find((n) => n.id === selectedNodeId)?.label ?? selectedNodeId;
    const fromContractor = (graph.meta?.contractor_signals ?? []).flatMap((s) =>
      (s.sample_messages ?? [])
        .filter((m) => m.user === label)
        .map((m) => ({ kind: '시공사 반응' as const, text: m.text, stance: m.stance })),
    );
    return fromContractor.slice(0, 4);
  }, [graph, selectedNodeId]);

  if (rows.length === 0 && participantSamples.length === 0) {
    return (
      <p className="bw-detail-meta-text bw-mt-sm" data-testid="conversation-graph-evidence-empty">
        표시할 근거 발언 샘플이 없습니다. 관계도 검색 후 참여자·연결을 선택해 보세요.
      </p>
    );
  }

  return (
    <div className="conversation-graph-evidence bw-mt-sm" data-testid="conversation-graph-evidence">
      <p className="bw-label-block">근거 발언</p>
      <p className="bw-detail-meta-text">연결선·참여자 선택 시 실제 대화 발췌(추정 관계의 근거)입니다.</p>
      <ul className="conversation-graph-evidence-list">
        {rows.map((row, idx) => (
          <li key={`${row.source}-${row.target}-${idx}`} className="conversation-graph-evidence-item">
            <p className="conversation-graph-evidence-head">
              {row.summary ?? `${row.source} → ${row.target}`}
              {row.edge_type ? ` · ${row.edge_type}` : ''}
            </p>
            {(row.messages ?? []).length === 0 ? (
              <p className="bw-detail-meta-text">직접 인용 가능한 연속 발화 샘플 없음</p>
            ) : (
              (row.messages ?? []).map((m, mi) => (
                <blockquote key={mi} className="conversation-graph-evidence-quote">
                  {m.from_user ? (
                    <>
                      <span className="conversation-graph-evidence-user">{m.from_user}</span>
                      <span className="conversation-graph-evidence-stance">({m.from_stance})</span>
                      <p>{m.from_text}</p>
                      <span className="conversation-graph-evidence-arrow">↓</span>
                      <span className="conversation-graph-evidence-user">{m.to_user}</span>
                      <span className="conversation-graph-evidence-stance">({m.to_stance})</span>
                      <p>{m.to_text}</p>
                    </>
                  ) : (
                    <p>{m.text}</p>
                  )}
                </blockquote>
              ))
            )}
          </li>
        ))}
        {participantSamples.map((s, i) => (
          <li key={`contractor-${i}`} className="conversation-graph-evidence-item">
            <p className="conversation-graph-evidence-head">{s.kind}</p>
            <blockquote className="conversation-graph-evidence-quote">
              <p>{s.text}</p>
              <span className="conversation-graph-evidence-stance">({s.stance})</span>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
}
