import {
  assignGenealogyParents,
  computeGenealogyLayout,
  pickGenealogyRoot,
} from './conversationGraphGenealogyLayout';
import type { RelationshipGraphData } from '../services/conversationGraphService';

const sample: RelationshipGraphData = {
  upload_id: 'u1',
  nodes: [
    { id: 'a', label: '알파', message_count: 50 },
    { id: 'b', label: '베타', message_count: 10 },
    { id: 'c', label: '감마', message_count: 5 },
  ],
  edges: [
    { source: 'a', target: 'b', weight: 8, edge_type: 'flow' },
    { source: 'b', target: 'c', weight: 3, edge_type: '동조', weight_동조: 2 },
  ],
};

describe('conversationGraphGenealogyLayout', () => {
  it('발화가 많은 참여자를 루트로 선택한다', () => {
    expect(pickGenealogyRoot(sample.nodes, sample.edges)).toBe('a');
  });

  it('들어오는 연결이 강한 쪽을 부모로 둔다', () => {
    const parents = assignGenealogyParents('a', sample.nodes, sample.edges);
    expect(parents.get('b')).toBe('a');
    expect(parents.get('c')).toBe('b');
  });

  it('족보형 레이아웃은 위→아래로 depth가 증가한다', () => {
    const { positions, rootId } = computeGenealogyLayout(sample, 800, 500);
    expect(rootId).toBe('a');
    const pa = positions.get('a')!;
    const pb = positions.get('b')!;
    const pc = positions.get('c')!;
    expect(pa.depth).toBe(0);
    expect(pb.depth).toBeGreaterThan(pa.depth);
    expect(pc.depth).toBeGreaterThan(pb.depth);
    expect(pb.y).toBeGreaterThan(pa.y);
    expect(pc.y).toBeGreaterThan(pb.y);
  });
});
