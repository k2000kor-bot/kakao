import React, { useMemo, useState } from 'react';
import type { RelationshipGraphData } from '../services/conversationGraphService';
import type { GraphAiAnalysis } from './conversationGraphAiAnalyzer';
import {
  buildConversationMatrixRows,
  downloadMatrixCsv,
  sortMatrixRows,
  type MatrixSortKey,
} from './conversationGraphMatrix';

export type ConversationGraphMatrixPanelProps = {
  graph: RelationshipGraphData;
  analysis: GraphAiAnalysis | null;
  selectedNodeId: string | null;
  onSelectParticipant: (nodeId: string) => void;
  exportBasename: string;
};

const SORT_OPTIONS: { key: MatrixSortKey; label: string }[] = [
  { key: 'influence', label: '영향력' },
  { key: 'messages', label: '발화수' },
  { key: 'stance', label: '입장' },
  { key: 'outbound', label: '나감' },
  { key: 'inbound', label: '들어옴' },
  { key: 'name', label: '이름' },
];

export function ConversationGraphMatrixPanel({
  graph,
  analysis,
  selectedNodeId,
  onSelectParticipant,
  exportBasename,
}: ConversationGraphMatrixPanelProps) {
  const [sortKey, setSortKey] = useState<MatrixSortKey>('influence');

  const rows = useMemo(() => {
    const built = buildConversationMatrixRows(graph, analysis);
    return sortMatrixRows(built, sortKey);
  }, [graph, analysis, sortKey]);

  return (
    <div className="conversation-graph-matrix bw-mt-md" data-testid="conversation-graph-matrix">
      <div className="conversation-graph-matrix-toolbar">
        <p className="bw-label-block">매트릭스 분석표</p>
        <p className="bw-detail-meta-text">
          행=참여자, 열=발화·입장·역할·족보·연결. 기획서의 분석표 보기입니다.
        </p>
        <div className="bw-mt-sm" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              className={sortKey === o.key ? 'bw-btn-primary' : 'bw-btn-secondary'}
              style={{ fontSize: 12 }}
              data-testid={`conversation-graph-matrix-sort-${o.key}`}
              onClick={() => setSortKey(o.key)}
            >
              {o.label}
            </button>
          ))}
          <button
            type="button"
            className="bw-btn-secondary"
            style={{ fontSize: 12 }}
            data-testid="conversation-graph-matrix-download"
            onClick={() => {
              downloadMatrixCsv(rows, `${exportBasename}-matrix.csv`);
            }}
          >
            CSV 저장
          </button>
        </div>
      </div>
      <div className="conversation-graph-matrix-scroll bw-mt-sm">
        <table className="conversation-graph-matrix-table">
          <thead>
            <tr>
              <th scope="col">참여자</th>
              <th scope="col">발화</th>
              <th scope="col">우세 입장</th>
              <th scope="col">동조/반대/중립</th>
              <th scope="col">역할</th>
              <th scope="col">족보</th>
              <th scope="col">영향력</th>
              <th scope="col">연결↔</th>
              <th scope="col">신뢰</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className={
                  selectedNodeId === r.id ? 'conversation-graph-matrix-row--selected' : undefined
                }
              >
                <td>
                  <button
                    type="button"
                    className="conversation-graph-matrix-name-btn"
                    data-testid={`conversation-graph-matrix-row-${r.id}`}
                    onClick={() => onSelectParticipant(r.id)}
                  >
                    {r.label}
                  </button>
                </td>
                <td>{r.messageCount}</td>
                <td>{r.dominantStance}</td>
                <td>
                  {r.stance동조}/{r.stance반대}/{r.stance중립}
                </td>
                <td>{r.exchangeRole}</td>
                <td>{r.genealogyTier}</td>
                <td>{r.influenceScore}</td>
                <td>
                  {r.outbound}↓ {r.inbound}↑
                </td>
                <td>{r.trustPercent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
