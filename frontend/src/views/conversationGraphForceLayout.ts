/**
 * 대화 관계도 SVG — 기본: 족보형(위→아래) 트리, 선택: force 자유 배치
 * Jest에서는 `ConversationGraphView.test.tsx`에서 이 모듈 전체를 모킹한다.
 */
import * as d3 from 'd3';
import type { RelationshipGraphData } from '../services/conversationGraphService';
import type { ExchangeRole } from './conversationGraphAiAnalyzer';
import { formatConciseEdgeLabel } from './conversationGraphEdgeLabels';
import {
  computeGenealogyLayout,
  genealogyLinkMidpoint,
  genealogyLinkPath,
} from './conversationGraphGenealogyLayout';

export const CONVERSATION_GRAPH_SVG_WIDTH = 800;
export const CONVERSATION_GRAPH_SVG_HEIGHT = 500;

const SVG_WIDTH = CONVERSATION_GRAPH_SVG_WIDTH;
const SVG_HEIGHT = CONVERSATION_GRAPH_SVG_HEIGHT;

export type ConversationGraphLayoutMode = 'genealogy' | 'force';

export type ConversationGraphNodeVisual = {
  radius: number;
  confidence: number;
  exchangeRole?: ExchangeRole;
};

export type ConversationGraphMountOptions = {
  onNodeSelect?: (nodeId: string) => void;
  nodeVisuals?: Map<string, ConversationGraphNodeVisual>;
  /** 기본: 족보형(이해하기 쉬운 위→아래) */
  layoutMode?: ConversationGraphLayoutMode;
};

export type ConversationGraphMountHandle = {
  destroy: () => void;
  resetZoom: () => void;
  focusOnNode: (nodeId: string) => void;
};

type GraphZoomEvent = {
  transform: { toString(): string };
};

type LayoutNode = {
  id?: string;
  label?: string;
  dominant_stance?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type LayoutLink = {
  source: string | LayoutNode;
  target: string | LayoutNode;
  edge_type?: string;
  weight?: number;
  weight_동조?: number;
  weight_반대?: number;
  weight_대립?: number;
};

type GraphDragEvent = {
  active: number;
  x: number;
  y: number;
  subject: LayoutNode;
};

function strokeByEdgeType(t: string) {
  if (t === '동조') return '#22c55e';
  if (t === '반대') return '#ef4444';
  if (t === '대립') return '#f97316';
  return 'var(--border-overlay)';
}

function nodeRadiusFor(d: { id?: string }, visuals?: Map<string, ConversationGraphNodeVisual>) {
  return visuals?.get(d.id ?? '')?.radius ?? 22;
}

function resolveEndpoint(
  end: 'source' | 'target',
  axis: 'x' | 'y',
  nodesById: Map<string, LayoutNode>,
) {
  return (d: LayoutLink) => {
    const raw = d[end];
    if (raw && typeof raw === 'object' && axis in raw) {
      return (raw as LayoutNode)[axis] ?? 0;
    }
    const id = typeof raw === 'string' ? raw : '';
    const n = nodesById.get(id);
    return n?.[axis] ?? 0;
  };
}

function appendEdgeMarkers(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
  const edgeTypes = ['flow', '동조', '반대', '대립'] as const;
  const defs = svg.append('defs');
  for (const edgeType of edgeTypes) {
    defs
      .append('marker')
      .attr('id', `cg-arrow-${edgeType}`)
      .attr('viewBox', '0 -4 8 8')
      .attr('refX', 7)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', strokeByEdgeType(edgeType));
  }
}

function appendGraphNodes(
  viewport: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: LayoutNode[],
  options: ConversationGraphMountOptions | undefined,
  simulation: d3.Simulation<LayoutNode, undefined> | null,
) {
  const node = viewport
    .append('g')
    .attr('data-graph-nodes', 'true')
    .selectAll<SVGGElement, LayoutNode>('g')
    .data(nodes)
    .join('g')
    .attr('data-graph-node', 'true')
    .attr('data-node-id', (d: LayoutNode) => d.id ?? '')
    .attr('cursor', 'pointer')
    .attr('role', 'button')
    .attr('tabindex', 0)
    .attr('aria-label', (d: LayoutNode) => {
      const name = d.label || d.id || '참여자';
      const vis = d.id ? options?.nodeVisuals?.get(d.id) : undefined;
      const extra = vis
        ? `, ${vis.exchangeRole ?? '균형'}형, 입장 신뢰 ${Math.round(vis.confidence * 100)}%`
        : '';
      return `참여자 노드: ${name}${extra}`;
    })
    .on('click', (_event: MouseEvent, d: LayoutNode) => {
      if (d?.id && options?.onNodeSelect) options.onNodeSelect(d.id);
    })
    .on('keydown', (event: KeyboardEvent, d: LayoutNode) => {
      const e = event;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (d?.id && options?.onNodeSelect) options.onNodeSelect(d.id);
    });

  if (simulation) {
    node.call(
      d3
        .drag<SVGGElement, LayoutNode>()
        .on('start', (event: GraphDragEvent) => {
          try {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          } catch {
            /* noop */
          }
        })
        .on('drag', (event: GraphDragEvent) => {
          try {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          } catch {
            /* noop */
          }
        })
        .on('end', (event: GraphDragEvent) => {
          try {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          } catch {
            /* noop */
          }
        }),
    );
  }

  const fillByStance = (s: string) => {
    if (s === '동조') return '#22c55e';
    if (s === '반대') return '#ef4444';
    return '#94a3b8';
  };

  node
    .append('circle')
    .attr('data-graph-node-halo', 'true')
    .attr('r', (d: LayoutNode) => nodeRadiusFor(d, options?.nodeVisuals) + 5)
    .attr('fill', 'none')
    .attr('stroke', (d: LayoutNode) => {
      const vis = d.id ? options?.nodeVisuals?.get(d.id) : undefined;
      const conf = vis?.confidence ?? 0.35;
      if (conf >= 0.65) return fillByStance(d.dominant_stance || '중립');
      return 'var(--border-overlay)';
    })
    .attr('stroke-opacity', (d: LayoutNode) => {
      const vis = d.id ? options?.nodeVisuals?.get(d.id) : undefined;
      return 0.25 + (vis?.confidence ?? 0.35) * 0.55;
    })
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', (d: LayoutNode) => {
      const conf = d.id ? options?.nodeVisuals?.get(d.id)?.confidence : undefined;
      return conf != null && conf < 0.5 ? '4 3' : null;
    });

  node
    .append('circle')
    .attr('data-graph-node-core', 'true')
    .attr('r', (d: LayoutNode) => nodeRadiusFor(d, options?.nodeVisuals))
    .attr('fill', (d: LayoutNode) => fillByStance(d.dominant_stance || '중립'))
    .attr('stroke', 'var(--surface-overlay)')
    .attr('stroke-width', 2);

  node
    .append('text')
    .attr('data-graph-node-role', 'true')
    .text((d: LayoutNode) => {
      const role = d.id ? options?.nodeVisuals?.get(d.id)?.exchangeRole : undefined;
      return role && role !== '균형' ? role : '';
    })
    .attr('x', 0)
    .attr('y', (d: LayoutNode) => nodeRadiusFor(d, options?.nodeVisuals) + 14)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--text-secondary)')
    .attr('font-size', '9px')
    .attr('pointer-events', 'none');

  node
    .append('text')
    .attr('data-graph-node-label', 'true')
    .text((d: LayoutNode) => d.label || d.id || '')
    .attr('x', 0)
    .attr('y', 5)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--text-primary)')
    .attr('font-size', '11px')
    .attr('pointer-events', 'none')
    .clone(true)
    .lower()
    .attr('stroke', 'var(--surface)')
    .attr('stroke-width', 3);

  return node;
}

function updateEdgeLabels(
  labelSel: d3.Selection<SVGGElement, LayoutLink, SVGGElement, unknown>,
  nodesById: Map<string, LayoutNode>,
  visuals?: Map<string, ConversationGraphNodeVisual>,
) {
  labelSel.each(function updateOne(this: SVGGElement, d: LayoutLink) {
    const g = d3.select(this);
    const sx = resolveEndpoint('source', 'x', nodesById)(d);
    const sy = resolveEndpoint('source', 'y', nodesById)(d);
    const tx = resolveEndpoint('target', 'x', nodesById)(d);
    const ty = resolveEndpoint('target', 'y', nodesById)(d);
    const r1 = nodeRadiusFor(
      typeof d.source === 'object' ? (d.source as LayoutNode) : { id: String(d.source) },
      visuals,
    );
    const r2 = nodeRadiusFor(
      typeof d.target === 'object' ? (d.target as LayoutNode) : { id: String(d.target) },
      visuals,
    );
    const mid = genealogyLinkMidpoint(sx, sy, tx, ty, Math.max(r1, r2));
    const text = formatConciseEdgeLabel(d);
    g.select('text')
      .attr('x', mid.x)
      .attr('y', mid.y)
      .text(text);
    const bbox = (g.select('text').node() as SVGTextElement | null)?.getBBox?.();
    if (bbox) {
      g.select('rect')
        .attr('x', bbox.x - 3)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 6)
        .attr('height', bbox.height + 4);
    }
  });
}

export function mountConversationGraphForceLayout(
  svgEl: SVGSVGElement,
  graph: RelationshipGraphData,
  options?: ConversationGraphMountOptions,
): ConversationGraphMountHandle | undefined {
  if (!svgEl || !graph || (graph.nodes ?? []).length === 0) return undefined;

  const layoutMode = options?.layoutMode ?? 'genealogy';

  try {
    const links: LayoutLink[] = (graph.edges ?? []).map((e) => ({ ...e }));
    const nodes: LayoutNode[] = (graph.nodes ?? []).map((n) => ({ ...n, x: 0, y: 0 }));
    const nodesById = new Map(nodes.map((n) => [n.id ?? '', n]));

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const genealogy =
      layoutMode === 'genealogy' ? computeGenealogyLayout(graph, SVG_WIDTH, SVG_HEIGHT) : null;
    const width = SVG_WIDTH;
    const height = genealogy?.height ?? SVG_HEIGHT;
    svg.attr('width', width).attr('height', height);

    const viewport = svg.append('g').attr('data-graph-viewport', 'true');
    appendEdgeMarkers(svg as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>);

    if (genealogy) {
      for (const n of nodes) {
        const pos = genealogy.positions.get(n.id ?? '');
        if (pos) {
          n.x = pos.x;
          n.y = pos.y;
          n.fx = pos.x;
          n.fy = pos.y;
        }
      }
    }

    let simulation: d3.Simulation<LayoutNode, undefined> | null = null;
    if (!genealogy) {
      simulation = d3
        .forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(28));
      if (links.length > 0) {
        simulation.force(
          'link',
          d3
            .forceLink(links)
            .id((d: unknown) => (d as LayoutNode).id ?? '')
            .distance(80)
            .strength(0.5),
        );
      }
    }

    const linkStroke = (d: LayoutLink) => strokeByEdgeType(d.edge_type || 'flow');
    const linkWidth = (d: LayoutLink) => {
      const w = (d.weight ?? 0) + (d.weight_대립 ?? 0) + (d.weight_동조 ?? 0) + (d.weight_반대 ?? 0);
      return Math.min(5, Math.max(1, w / 2 + 1));
    };

    const linkGroup = viewport.append('g').attr('data-graph-links', 'true');
    const link = (
      genealogy
        ? linkGroup.selectAll<SVGPathElement, LayoutLink>('path').data(links).join('path')
        : linkGroup.selectAll<SVGLineElement, LayoutLink>('line').data(links).join('line')
    ) as d3.Selection<SVGPathElement | SVGLineElement, LayoutLink, SVGGElement, unknown>;
    link
      .attr('data-graph-edge', 'true')
      .attr('data-edge-source', (d: LayoutLink) =>
        typeof d.source === 'object' && d.source ? (d.source as LayoutNode).id ?? '' : String(d.source ?? ''),
      )
      .attr('data-edge-target', (d: LayoutLink) =>
        typeof d.target === 'object' && d.target ? (d.target as LayoutNode).id ?? '' : String(d.target ?? ''),
      )
      .attr('stroke', linkStroke)
      .attr('stroke-opacity', 0.85)
      .attr('stroke-width', linkWidth)
      .attr('fill', 'none')
      .attr('marker-end', (d: LayoutLink) => {
        const t = d.edge_type || 'flow';
        return ['flow', '동조', '반대', '대립'].includes(t) ? `url(#cg-arrow-${t})` : 'url(#cg-arrow-flow)';
      });

    const edgeLabels = viewport
      .append('g')
      .attr('data-graph-edge-labels', 'true')
      .selectAll<SVGGElement, LayoutLink>('g')
      .data(links)
      .join('g')
      .attr('class', 'cg-edge-label')
      .attr('pointer-events', 'none');

    edgeLabels
      .append('rect')
      .attr('rx', 3)
      .attr('fill', 'var(--surface)')
      .attr('stroke', 'var(--border-color)')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.92);

    edgeLabels
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '9px')
      .attr('fill', 'var(--text-secondary)')
      .text((d: LayoutLink) => formatConciseEdgeLabel(d));

    const node = appendGraphNodes(viewport, nodes, options, simulation);

    const syncLinksAndLabels = () => {
      try {
        if (links.length === 0) return;
        if (genealogy) {
          link.attr('d', (d: LayoutLink) => {
            const sx = resolveEndpoint('source', 'x', nodesById)(d);
            const sy = resolveEndpoint('source', 'y', nodesById)(d);
            const tx = resolveEndpoint('target', 'x', nodesById)(d);
            const ty = resolveEndpoint('target', 'y', nodesById)(d);
            const r1 = nodeRadiusFor(
              typeof d.source === 'object' ? (d.source as LayoutNode) : { id: String(d.source) },
              options?.nodeVisuals,
            );
            const r2 = nodeRadiusFor(
              typeof d.target === 'object' ? (d.target as LayoutNode) : { id: String(d.target) },
              options?.nodeVisuals,
            );
            return genealogyLinkPath(sx, sy, tx, ty, Math.max(r1, r2));
          });
        } else {
          (link as d3.Selection<SVGLineElement, LayoutLink, SVGGElement, unknown>)
            .attr('x1', resolveEndpoint('source', 'x', nodesById))
            .attr('y1', resolveEndpoint('source', 'y', nodesById))
            .attr('x2', resolveEndpoint('target', 'x', nodesById))
            .attr('y2', resolveEndpoint('target', 'y', nodesById));
        }
        updateEdgeLabels(
          edgeLabels as d3.Selection<SVGGElement, LayoutLink, SVGGElement, unknown>,
          nodesById,
          options?.nodeVisuals,
        );
        node.attr('transform', (d: LayoutNode) => `translate(${Number(d.x ?? 0)},${Number(d.y ?? 0)})`);
      } catch {
        /* tick·jsdom */
      }
    };

    if (simulation) {
      simulation.on('tick', syncLinksAndLabels);
    } else {
      syncLinksAndLabels();
    }

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 2.5])
      .on('zoom', (event: GraphZoomEvent) => {
        viewport.attr('transform', event.transform.toString());
      });

    svg.call(zoomBehavior);

    const resetZoom = () => {
      try {
        svg.call(zoomBehavior.transform, d3.zoomIdentity as d3.ZoomTransform);
      } catch {
        viewport.attr('transform', null);
      }
    };

    const focusOnNode = (nodeId: string) => {
      try {
        const target = nodes.find((n) => n.id === nodeId);
        if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') return;
        const scale = 1.35;
        const tx = width / 2 - target.x * scale;
        const ty = height / 2 - target.y * scale;
        const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);
        svg.transition().duration(400).call(zoomBehavior.transform, transform);
      } catch {
        /* noop */
      }
    };

    return {
      destroy: () => {
        simulation?.stop();
        svg.on('.zoom', null);
      },
      resetZoom,
      focusOnNode,
    };
  } catch {
    return undefined;
  }
}
