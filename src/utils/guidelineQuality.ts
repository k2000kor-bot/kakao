import { coerceTrimmedString } from './chatInputUtils';

export type GuidelinePriority = 'required' | 'recommended' | 'untyped';

export interface ParsedGuideline {
  raw: string;
  content: string;
  priority: GuidelinePriority;
  isEmpty: boolean;
}

export interface GuidelineQualityReport {
  total: number;
  nonEmpty: number;
  empty: number;
  required: number;
  recommended: number;
  untyped: number;
  duplicates: number;
  qualityScore: number;
  qualityStatus: 'good' | 'warning' | 'risk';
  recommendations: string[];
}

export interface GuidelineQualityHistoryPoint {
  savedAt: string;
  score: number;
  status: GuidelineQualityReport['qualityStatus'];
}

export interface GuidelineQualityTrend {
  delta: number;
  direction: 'up' | 'down' | 'flat';
  label: string;
}

export function parseGuideline(raw: string): ParsedGuideline {
  const trimmed = coerceTrimmedString(raw, '');
  if (!trimmed) {
    return {
      raw,
      content: '',
      priority: 'untyped',
      isEmpty: true,
    };
  }

  const matched = trimmed.match(/^\[(필수|권장)\]\s*(.+)?$/);
  if (!matched) {
    return {
      raw,
      content: trimmed,
      priority: 'untyped',
      isEmpty: false,
    };
  }

  const content = coerceTrimmedString(matched[2] ?? '', '');
  return {
    raw,
    content,
    priority: matched[1] === '필수' ? 'required' : 'recommended',
    isEmpty: content.length === 0,
  };
}

export function analyzeGuidelines(guidelines: string[]): GuidelineQualityReport {
  const parsed = guidelines.map(parseGuideline);
  const empty = parsed.filter((g) => g.isEmpty).length;
  const nonEmptyGuidelines = parsed.filter((g) => !g.isEmpty);
  const nonEmpty = nonEmptyGuidelines.length;
  const required = nonEmptyGuidelines.filter((g) => g.priority === 'required').length;
  const recommended = nonEmptyGuidelines.filter((g) => g.priority === 'recommended').length;
  const untyped = nonEmptyGuidelines.filter((g) => g.priority === 'untyped').length;

  const normalizedContents = nonEmptyGuidelines.map((g) =>
    coerceTrimmedString(g.content.toLowerCase(), '')
  );
  const uniqueContentCount = new Set(normalizedContents).size;
  const duplicates = Math.max(0, normalizedContents.length - uniqueContentCount);

  let qualityScore = 100;
  if (required === 0 && nonEmpty > 0) qualityScore -= 25;
  if (untyped > 0) qualityScore -= Math.min(20, untyped * 6);
  if (duplicates > 0) qualityScore -= Math.min(15, duplicates * 5);
  if (empty > 0) qualityScore -= Math.min(20, empty * 5);
  if (nonEmpty < 2) qualityScore -= 10;
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  const qualityStatus: GuidelineQualityReport['qualityStatus'] =
    qualityScore >= 80 ? 'good' : qualityScore >= 55 ? 'warning' : 'risk';

  const recommendations: string[] = [];
  if (required === 0 && nonEmpty > 0) recommendations.push('핵심 규칙 1개 이상을 [필수]로 지정하세요.');
  if (untyped > 0) recommendations.push(`[권장] 또는 [필수] 접두어가 없는 항목 ${untyped}개를 정리하세요.`);
  if (duplicates > 0) recommendations.push(`중복 가이드라인 ${duplicates}개를 제거하세요.`);
  if (empty > 0) recommendations.push(`내용이 비어 있는 가이드라인 ${empty}개를 삭제하거나 내용을 입력하세요.`);
  if (nonEmpty < 2) recommendations.push('운영 안정성을 위해 최소 2개 이상의 가이드라인을 권장합니다.');

  return {
    total: guidelines.length,
    nonEmpty,
    empty,
    required,
    recommended,
    untyped,
    duplicates,
    qualityScore,
    qualityStatus,
    recommendations,
  };
}

export function getGuidelineQualityTrend(history: GuidelineQualityHistoryPoint[]): GuidelineQualityTrend {
  if (history.length < 2) {
    return { delta: 0, direction: 'flat', label: '추세 데이터 부족' };
  }
  const latest = history[0];
  const prev = history[1];
  const delta = latest.score - prev.score;
  if (delta > 0) {
    return { delta, direction: 'up', label: `상승 (+${delta})` };
  }
  if (delta < 0) {
    return { delta, direction: 'down', label: `하락 (${delta})` };
  }
  return { delta: 0, direction: 'flat', label: '유지 (0)' };
}
