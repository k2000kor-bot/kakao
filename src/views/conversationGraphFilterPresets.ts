import { DEFAULT_EDGE_FILTER, type EdgeTypeFilterState } from './conversationGraphEdgeFilter';
import { DEFAULT_STANCE_FILTER, type StanceFilterState, type StanceKey } from './conversationGraphFilter';

export type GraphFilterPresetId = 'all' | StanceKey;

export const GRAPH_FILTER_PRESETS: GraphFilterPresetId[] = ['all', '동조', '반대', '중립'];

export function stanceFilterForPreset(preset: GraphFilterPresetId): StanceFilterState {
  if (preset === 'all') return { ...DEFAULT_STANCE_FILTER };
  return { 동조: preset === '동조', 반대: preset === '반대', 중립: preset === '중립' };
}

export function edgeFilterForPreset(_preset: GraphFilterPresetId): EdgeTypeFilterState {
  return { ...DEFAULT_EDGE_FILTER };
}

export function graphFilterPresetLabel(preset: GraphFilterPresetId): string {
  if (preset === 'all') return '전체';
  return `${preset}만`;
}
