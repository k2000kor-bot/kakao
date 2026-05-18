import { serializeGraphAiExport } from './conversationGraphAiExport';
import { analyzeRelationshipGraph } from './conversationGraphAiAnalyzer';

describe('conversationGraphAiExport', () => {
  it('serializeGraphAiExport는 narrative와 analysis를 포함한다', () => {
    const analysis = analyzeRelationshipGraph({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 1, dominant_stance: '중립' }],
      edges: [],
    });
    const json = serializeGraphAiExport(analysis, '요약', 'heuristic');
    const parsed = JSON.parse(json) as { narrative: string; analysis: { trustScore: number } };
    expect(parsed.narrative).toBe('요약');
    expect(parsed.analysis.trustScore).toBeGreaterThanOrEqual(0);
  });
});
