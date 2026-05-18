import type { RelationshipGraphEdge } from '../services/conversationGraphService';
import { formatConciseEdgeLabel } from './conversationGraphEdgeLabels';

export interface ParticipantEdgeRow {
  edgeKey: string;
  direction: 'outbound' | 'inbound';
  otherId: string;
  otherLabel: string;
  summary: string;
}

export function formatEdgeWeightSummary(edge: RelationshipGraphEdge): string {
  return formatConciseEdgeLabel(edge);
}

export function listParticipantEdgeRows(
  nodeId: string,
  edges: RelationshipGraphEdge[] | undefined,
  labelById: Map<string, string>,
): ParticipantEdgeRow[] {
  const rows: ParticipantEdgeRow[] = [];
  for (const edge of edges ?? []) {
    let direction: 'outbound' | 'inbound' | null = null;
    let otherId = '';
    if (edge.source === nodeId) {
      direction = 'outbound';
      otherId = edge.target;
    } else if (edge.target === nodeId) {
      direction = 'inbound';
      otherId = edge.source;
    }
    if (!direction || !otherId) continue;
    const otherLabel = labelById.get(otherId) || otherId;
    const arrow = direction === 'outbound' ? '↓' : '↑';
    const weightText = formatEdgeWeightSummary(edge);
    rows.push({
      edgeKey: `${direction}:${edge.source}:${edge.target}`,
      direction,
      otherId,
      otherLabel,
      summary: `${otherLabel} ${arrow} (${weightText})`,
    });
  }
  return rows.sort((a, b) => a.otherLabel.localeCompare(b.otherLabel, 'ko'));
}
