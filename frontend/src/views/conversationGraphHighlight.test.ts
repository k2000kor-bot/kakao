import {
  applyConversationGraphFocusHighlight,
  getNeighborNodeIds,
} from './conversationGraphHighlight';

describe('conversationGraphHighlight', () => {
  it('getNeighborNodeIds는 직접 연결 id를 모은다', () => {
    const ids = getNeighborNodeIds('a', [
      { source: 'a', target: 'b', weight: 1 },
      { source: 'c', target: 'a', weight: 1 },
    ]);
    expect([...ids].sort()).toEqual(['a', 'b', 'c']);
  });

  it('applyConversationGraphFocusHighlight는 비포커스 노드·엣지를 흐리게 한다', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    const nodeA = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeA.setAttribute('data-graph-node', 'true');
    nodeA.setAttribute('data-node-id', 'a');
    const nodeB = nodeA.cloneNode(false) as Element;
    nodeB.setAttribute('data-node-id', 'b');
    svg.appendChild(nodeA);
    svg.appendChild(nodeB);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('data-graph-edge', 'true');
    line.setAttribute('data-edge-source', 'a');
    line.setAttribute('data-edge-target', 'b');
    line.setAttribute('stroke-opacity', '0.85');
    svg.appendChild(line);

    applyConversationGraphFocusHighlight(svg as SVGSVGElement, new Set(['a']));

    expect(nodeA.getAttribute('opacity')).toBe('1');
    expect(nodeB.getAttribute('opacity')).toBe('0.35');
    expect(line.getAttribute('stroke-opacity')).toBe('0.12');
  });
});
