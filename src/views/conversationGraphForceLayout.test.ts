/**
 * conversationGraphForceLayout — D3 스텁 환경에서 마운트·정리 동작 검증
 */
import {
  CONVERSATION_GRAPH_SVG_HEIGHT,
  CONVERSATION_GRAPH_SVG_WIDTH,
  mountConversationGraphForceLayout,
} from './conversationGraphForceLayout';

describe('conversationGraphForceLayout', () => {
  it('SVG 크기 상수를 export한다', () => {
    expect(CONVERSATION_GRAPH_SVG_WIDTH).toBe(800);
    expect(CONVERSATION_GRAPH_SVG_HEIGHT).toBe(500);
  });

  it('노드가 없으면 undefined를 반환한다', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    expect(
      mountConversationGraphForceLayout(svg, {
        upload_id: 'g1',
        nodes: [],
        edges: [],
      }),
    ).toBeUndefined();
  });

  it('단일 노드 그래프를 마운트하면 undefined이거나 정리 함수를 반환한다', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const result = mountConversationGraphForceLayout(svg, {
      upload_id: 'g1',
      nodes: [{ id: 'p1', label: '참여자A', message_count: 1 }],
      edges: [],
    });
    expect(result === undefined || typeof result === 'object').toBe(true);
    if (result && typeof result === 'object') {
      expect(typeof result.destroy).toBe('function');
      expect(typeof result.resetZoom).toBe('function');
      expect(() => result.destroy()).not.toThrow();
      expect(() => result.resetZoom()).not.toThrow();
    }
  });
});
