import { buildHeuristicGraphNarrative, buildGraphAiNarrativePrompt, extractGuidanceNarrative } from './conversationGraphAiNarrative';
import { analyzeRelationshipGraph } from './conversationGraphAiAnalyzer';

describe('conversationGraphAiNarrative', () => {
  it('extractGuidanceNarrative는 response 필드를 읽는다', () => {
    expect(extractGuidanceNarrative({ response: '요약 텍스트' })).toBe('요약 텍스트');
  });

  it('buildGraphAiNarrativePrompt는 분석 통계를 포함한다', () => {
    const analysis = analyzeRelationshipGraph({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 1, dominant_stance: '중립' }],
      edges: [],
    });
    const prompt = buildGraphAiNarrativePrompt(analysis);
    expect(prompt).toMatch(/신뢰 지표/);
    expect(prompt).toMatch(/A/);
  });

  it('buildHeuristicGraphNarrative는 규칙 기반 요약을 만든다', () => {
    const analysis = analyzeRelationshipGraph({
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: 'A', message_count: 2, dominant_stance: '동조', stance_동조: 2 }],
      edges: [],
    });
    expect(buildHeuristicGraphNarrative(analysis)).toMatch(/신뢰도/);
  });
});
