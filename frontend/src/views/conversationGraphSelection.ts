/** SVG 그래프에서 선택된 참여자 노드 테두리를 갱신한다. */
export function applyConversationGraphNodeSelection(
  svgEl: SVGSVGElement | null,
  selectedNodeId: string | null,
): void {
  if (!svgEl) return;
  const nodes = svgEl.querySelectorAll('[data-graph-node]');
  nodes.forEach((el) => {
    const id = el.getAttribute('data-node-id');
    const circle = el.querySelector('circle');
    if (!circle || circle.tagName.toLowerCase() !== 'circle') return;
    const active = Boolean(selectedNodeId && id === selectedNodeId);
    circle.setAttribute('stroke-width', active ? '4' : '2');
    circle.setAttribute(
      'stroke',
      active ? 'var(--accent-primary, #3b82f6)' : 'var(--surface-overlay)',
    );
    if (active) {
      el.setAttribute('opacity', '1');
    }
  });
}
