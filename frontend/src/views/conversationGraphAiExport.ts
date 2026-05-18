import type { GraphAiAnalysis } from './conversationGraphAiAnalyzer';

export interface GraphAiExportPayload {
  exported_at: string;
  narrative: string;
  narrative_source: 'heuristic' | 'ai';
  analysis: GraphAiAnalysis;
}

export function serializeGraphAiExport(
  analysis: GraphAiAnalysis,
  narrative: string,
  narrativeSource: 'heuristic' | 'ai',
): string {
  const payload: GraphAiExportPayload = {
    exported_at: new Date().toISOString(),
    narrative,
    narrative_source: narrativeSource,
    analysis,
  };
  return JSON.stringify(payload, null, 2);
}

/** AI 성향 분석 결과를 JSON 파일로 저장한다. */
export function downloadGraphAiAnalysisJson(
  analysis: GraphAiAnalysis,
  narrative: string,
  narrativeSource: 'heuristic' | 'ai',
  filename = 'conversation-graph-ai-analysis.json',
): void {
  const text = serializeGraphAiExport(analysis, narrative, narrativeSource);
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
