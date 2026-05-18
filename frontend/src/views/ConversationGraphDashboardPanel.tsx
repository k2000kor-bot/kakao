import React from 'react';
import type { GraphDashboardKpi } from './conversationGraphExpertSnapshot';
import type { RelationshipGraphContractorSignal } from '../services/conversationGraphService';

export type ConversationGraphDashboardPanelProps = {
  kpi: GraphDashboardKpi;
  contractorSignals?: RelationshipGraphContractorSignal[];
};

export function ConversationGraphDashboardPanel({
  kpi,
  contractorSignals = [],
}: ConversationGraphDashboardPanelProps) {
  return (
    <div
      className="conversation-graph-dashboard bw-mt-md"
      data-testid="conversation-graph-dashboard"
      style={{ padding: 12 }}
    >
      <p className="bw-label-block">분석 대시보드</p>
      <div className="conversation-graph-kpi-grid bw-mt-sm">
        <div className="conversation-graph-kpi-card" data-testid="conversation-graph-kpi-messages">
          <span className="conversation-graph-kpi-value">{kpi.messageCount}</span>
          <span className="conversation-graph-kpi-label">발언</span>
        </div>
        <div className="conversation-graph-kpi-card" data-testid="conversation-graph-kpi-participants">
          <span className="conversation-graph-kpi-value">{kpi.participantCount}</span>
          <span className="conversation-graph-kpi-label">참여자</span>
        </div>
        <div className="conversation-graph-kpi-card" data-testid="conversation-graph-kpi-edges">
          <span className="conversation-graph-kpi-value">{kpi.edgeCount}</span>
          <span className="conversation-graph-kpi-label">연결</span>
        </div>
        <div className="conversation-graph-kpi-card" data-testid="conversation-graph-kpi-trust">
          <span className="conversation-graph-kpi-value">{kpi.trustScore}</span>
          <span className="conversation-graph-kpi-label">신뢰({kpi.trustLabel})</span>
        </div>
      </div>
      <p className="bw-detail-meta-text bw-mt-sm" data-testid="conversation-graph-kpi-stance">
        입장: {kpi.stanceText} · 족보 루트: <strong>{kpi.rootLabel}</strong>
      </p>
      {contractorSignals.length > 0 ? (
        <div className="bw-mt-sm" data-testid="conversation-graph-contractor-signals">
          <p className="bw-label-block" style={{ fontSize: 12 }}>
            시공사·제안 반응 신호 (추정)
          </p>
          <ul className="conversation-graph-contractor-list">
            {contractorSignals.slice(0, 5).map((s) => (
              <li key={`${s.contractor}-${s.proposal_item}`} className="conversation-graph-contractor-item">
                <span className="conversation-graph-contractor-name">{s.contractor}</span>
                <span className="conversation-graph-contractor-proposal">{s.proposal_item}</span>
                <span className="conversation-graph-contractor-counts">
                  +{s.positive_count} / −{s.negative_count}
                </span>
              </li>
            ))}
          </ul>
          <p className="bw-detail-meta-text bw-mt-sm">
            직접 지지가 아닌 제안 항목 반응 패턴입니다. 확정 선호가 아닙니다.
          </p>
        </div>
      ) : null}
    </div>
  );
}
