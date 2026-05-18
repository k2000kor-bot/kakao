import type { RelationshipGraphNode } from '../services/conversationGraphService';
import type { ParticipantAiInsight } from './conversationGraphAiAnalyzer';
import { normalizeDominantStance } from './conversationGraphFilter';

export type ParticipantSortMode = 'name' | 'influence' | 'stance';

export interface ParticipantListItem {
  id: string;
  label: string;
  dominantStance: string;
  exchangeRole?: string;
  influenceScore: number;
}

export function buildParticipantListItems(
  nodes: RelationshipGraphNode[],
  insights?: ParticipantAiInsight[],
): ParticipantListItem[] {
  const insightById = new Map(insights?.map((p) => [p.id, p]) ?? []);
  return nodes.map((n) => {
    const insight = insightById.get(n.id);
    return {
      id: n.id,
      label: n.label?.trim() || n.id,
      dominantStance: insight?.dominantStance ?? normalizeDominantStance(n.dominant_stance),
      exchangeRole: insight?.exchangeRole,
      influenceScore: insight?.influenceScore ?? n.message_count ?? 0,
    };
  });
}

export function sortParticipantListItems(
  items: ParticipantListItem[],
  mode: ParticipantSortMode,
): ParticipantListItem[] {
  const copy = [...items];
  if (mode === 'influence') {
    return copy.sort((a, b) => b.influenceScore - a.influenceScore || a.label.localeCompare(b.label, 'ko'));
  }
  if (mode === 'stance') {
    const order = { 동조: 0, 반대: 1, 중립: 2 };
    return copy.sort((a, b) => {
      const sa = order[a.dominantStance as keyof typeof order] ?? 3;
      const sb = order[b.dominantStance as keyof typeof order] ?? 3;
      return sa - sb || a.label.localeCompare(b.label, 'ko');
    });
  }
  return copy.sort((a, b) => a.label.localeCompare(b.label, 'ko'));
}

/** 참여자 이름·입장·역할로 검색 필터 */
export function filterParticipantsBySearch(
  items: ParticipantListItem[],
  query: string,
): ParticipantListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((p) => {
    const hay = [p.label, p.id, p.dominantStance, p.exchangeRole ?? ''].join(' ').toLowerCase();
    return hay.includes(q);
  });
}
