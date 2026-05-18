import { applyConversationGraphNodeSelection } from './conversationGraphSelection';

describe('conversationGraphSelection', () => {
  it('applyConversationGraphNodeSelection은 선택 노드 테두리만 강조한다', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    const makeNode = (id: string) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-graph-node', 'true');
      g.setAttribute('data-node-id', id);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('stroke-width', '2');
      g.appendChild(circle);
      svg.appendChild(g);
      return circle;
    };

    const c1 = makeNode('a');
    const c2 = makeNode('b');

    applyConversationGraphNodeSelection(svg as SVGSVGElement, 'b');

    expect(c1.getAttribute('stroke-width')).toBe('2');
    expect(c2.getAttribute('stroke-width')).toBe('4');
    expect(c2.getAttribute('stroke')).toContain('accent-primary');
  });
});
