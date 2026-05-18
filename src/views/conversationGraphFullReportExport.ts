import { downloadGraphAnswerMarkdown } from './conversationGraphAnswerExport';

export interface GraphFullReportInput {
  title?: string;
  period?: string;
  narrative: string;
  narrativeSource?: 'heuristic' | 'ai';
  generatedAnswer?: string;
  analysisSummary?: string;
  graphSnapshot?: string;
  trustScore?: number;
  trustLabel?: string;
}

/** AI 해석·생성 답변·관계도 스냅샷을 하나의 Markdown 리포트로 저장 */
export function downloadGraphFullReportMarkdown(
  input: GraphFullReportInput,
  filename = 'conversation-graph-report.md',
): void {
  const sections: string[] = [];
  if (input.analysisSummary?.trim()) {
    sections.push('## AI 성향 요약', '', input.analysisSummary.trim(), '');
  }
  if (input.trustScore != null && input.trustLabel) {
    sections.push(`> 분석 신뢰도: ${input.trustScore}/100 (${input.trustLabel})`, '');
  }
  if (input.graphSnapshot?.trim()) {
    sections.push('## 관계도 스냅샷', '', '```', input.graphSnapshot.trim(), '```', '');
  }
  const narrativeLabel =
    input.narrativeSource === 'ai' ? '## 종합 해석 (AI)' : '## 종합 해석 (규칙 기반)';
  if (input.narrative?.trim()) {
    sections.push(narrativeLabel, '', input.narrative.trim(), '');
  }
  if (input.generatedAnswer?.trim()) {
    sections.push('## 생성된 답변', '', input.generatedAnswer.trim(), '');
  }
  const body = sections.join('\n').trim();
  if (!body) return;
  downloadGraphAnswerMarkdown(body, { title: input.title, period: input.period }, filename);
}
