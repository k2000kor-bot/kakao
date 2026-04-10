/**
 * 대화 관계도 뷰 — 대화 업로드 후 참여자 간 발화 흐름 그래프
 * 기간/시간 지정 시 해당 구간 대화 관계도 검색·출력
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  uploadConversation,
  uploadConversationText,
  listConversations,
  fetchRelationshipGraph,
  type ConversationUploadItem,
  type RelationshipGraphData,
} from '../services/conversationGraphService';
import { showToast } from '../utils/toast';
import { coerceTrimmedString } from '../utils/chatInputUtils';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;

function ConversationGraphView() {
  const [uploads, setUploads] = useState<ConversationUploadItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [graph, setGraph] = useState<RelationshipGraphData | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const loadList = useCallback(() => {
    setLoadingList(true);
    listConversations()
      .then((list) => {
        setUploads(list);
        if (list.length > 0 && !selectedId) setSelectedId(list[0].id);
      })
      .catch(() => setUploads([]))
      .finally(() => setLoadingList(false));
  }, [selectedId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLoadingUpload(true);
      uploadConversation(file, file.name)
        .then(() => {
          loadList();
          showToast('대화가 업로드되었습니다.', 'success');
        })
        .catch((err) => showToast(err?.message || '업로드 실패', 'error'))
        .finally(() => setLoadingUpload(false));
      e.target.value = '';
    },
    [loadList]
  );

  const handlePasteUpload = useCallback(() => {
    const trimmed = coerceTrimmedString(pasteText, '');
    if (!trimmed) return;
    setLoadingUpload(true);
    uploadConversationText(trimmed, '붙여넣은 대화', 'pasted.txt')
      .then(() => {
        loadList();
        setPasteText('');
        showToast('대화가 업로드되었습니다.', 'success');
      })
      .catch((err) => showToast(err?.message || '업로드 실패', 'error'))
      .finally(() => setLoadingUpload(false));
  }, [pasteText, loadList]);

  const handleSearchGraph = useCallback(() => {
    if (!selectedId) return;
    setLoadingGraph(true);
    fetchRelationshipGraph(
      selectedId,
      startDate || undefined,
      endDate || undefined
    )
      .then((data) => setGraph(data))
      .catch((err) => {
        showToast(err?.message || '관계도 조회 실패', 'error');
        setGraph(null);
      })
      .finally(() => setLoadingGraph(false));
  }, [selectedId, startDate, endDate]);

  // D3 force graph
  useEffect(() => {
    if (!graph || !svgRef.current || graph.nodes.length === 0) return;
    const links = graph.edges.map((e) => ({ ...e, source: e.source, target: e.target }));
    const nodes = graph.nodes.map((n) => ({ ...n, x: 0, y: 0 }));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = SVG_WIDTH;
    const height = SVG_HEIGHT;

    const simulation = d3
      .forceSimulation(nodes as Array<{ id?: string; x: number; y: number; index?: number; fx?: number | null; fy?: number | null }>)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: unknown) => (d as { id: string }).id)
          .distance(80)
          .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(28));

    const strokeByEdgeType = (t: string) => {
      if (t === '동조') return '#22c55e';
      if (t === '반대') return '#ef4444';
      if (t === '대립') return '#f97316';
      return 'var(--border-overlay)';
    };
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d: { edge_type?: string }) => strokeByEdgeType(d.edge_type || 'flow'))
      .attr('stroke-opacity', 0.85)
      .attr('stroke-width', (d: { weight?: number; weight_대립?: number; weight_동조?: number; weight_반대?: number }) => {
        const w = (d.weight ?? 0) + (d.weight_대립 ?? 0) + (d.weight_동조 ?? 0) + (d.weight_반대 ?? 0);
        return Math.min(5, Math.max(1, w / 2 + 1));
      });

    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        (d3 as { drag: () => { on: (a: string, b: (ev: unknown) => void) => { on: (a: string, b: (ev: unknown) => void) => { on: (a: string, b: (ev: unknown) => void) => unknown } } } }).drag()
          .on('start', (event: unknown) => {
            const e = event as { active: number; subject: { x: number; y: number; fx?: number | null; fy?: number | null } };
            if (!e.active) simulation.alphaTarget(0.3).restart();
            e.subject.fx = e.subject.x;
            e.subject.fy = e.subject.y;
          })
          .on('drag', (event: unknown) => {
            const e = event as { subject: { fx?: number | null; fy?: number | null }; x: number; y: number };
            e.subject.fx = e.x;
            e.subject.fy = e.y;
          })
          .on('end', (event: unknown) => {
            const e = event as { active: number; subject: { fx?: number | null; fy?: number | null } };
            if (!e.active) simulation.alphaTarget(0);
            e.subject.fx = null;
            e.subject.fy = null;
          })
      );

    const fillByStance = (s: string) => {
      if (s === '동조') return '#22c55e';
      if (s === '반대') return '#ef4444';
      return '#94a3b8';
    };
    node
      .append('circle')
      .attr('r', 22)
      .attr('fill', (d: { dominant_stance?: string }) => fillByStance(d.dominant_stance || '중립'))
      .attr('stroke', 'var(--surface-overlay)')
      .attr('stroke-width', 2);

    node
      .append('text')
      .text((d: { label?: string; id?: string }) => d.label || d.id || '')
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

    simulation.on('tick', () => {
      link
        .attr('x1', (d: { source: { x: number }; target: { x: number } }) => d.source.x)
        .attr('y1', (d: { source: { y: number }; target: { y: number } }) => d.source.y)
        .attr('x2', (d: { source: { x: number }; target: { x: number } }) => d.target.x)
        .attr('y2', (d: { source: { y: number }; target: { y: number } }) => d.target.y);
      node.attr('transform', (d: { x: number; y: number }) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graph]);

  return (
    <div className="bw-detail-page" data-testid="conversation-graph-view">
      <div className="bw-detail-inner">
        <header className="bw-detail-header" id="conversation-graph-heading">
          <p className="bw-detail-desc">
            대화 내용(TXT/CSV)을 업로드하면 참여자 간 발화 흐름과 동조·반대·대립 관계도를 그립니다. 재개발·조합 등 주제에 대한 찬반이 메시지 내용으로 분류되어 노드·선 색으로 표시됩니다. 기간을 지정하면 해당 구간만 검색해 출력합니다.
          </p>
        </header>

        <section className="bw-detail-section" aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="bw-detail-section-title">
            대화 업로드
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              카카오톡 내보내기 형식(.txt, .csv) 또는 동일 형식 텍스트를 업로드하세요. CSV는 날짜·시간·유저·메시지 컬럼을 지원합니다. 동조/반대는 메시지 내용으로 자동 분류됩니다.
            </p>
            <div className="bw-mt-sm" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label className="bw-btn-primary" style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept=".txt,.csv,text/plain,text/csv"
                  onChange={handleFileUpload}
                  disabled={loadingUpload}
                  style={{ display: 'none' }}
                  aria-label="대화 파일 선택 (TXT/CSV)"
                />
                {loadingUpload ? '업로드 중…' : '파일 선택 (TXT/CSV)'}
              </label>
              <span className="bw-detail-meta-text">또는</span>
              <textarea
                placeholder="대화 텍스트 붙여넣기 (날짜 줄 + 메시지 줄 형식)"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={3}
                className="bw-input"
                style={{ minWidth: 280, flex: 1, maxWidth: 400 }}
                aria-label="대화 텍스트 붙여넣기"
              />
              <button
                type="button"
                className="bw-btn-secondary"
                onClick={() => void handlePasteUpload()}
                disabled={loadingUpload || !coerceTrimmedString(pasteText, '')}
              >
                붙여넣기 업로드
              </button>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="list-heading">
          <h2 id="list-heading" className="bw-detail-section-title">
            업로드된 대화
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            {loadingList && <p className="bw-label-block bw-detail-meta-text">목록 로딩 중…</p>}
            {!loadingList && uploads.length === 0 && (
              <p className="bw-label-block bw-detail-note">
                업로드된 대화가 없습니다. 위에서 파일을 업로드하거나 텍스트를 붙여넣어 주세요.
              </p>
            )}
            {!loadingList && uploads.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {uploads.map((u) => (
                  <li key={u.id} className="bw-mt-sm">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="conversation"
                        checked={selectedId === u.id}
                        onChange={() => setSelectedId(u.id)}
                        aria-label={`대화 선택: ${u.name}`}
                      />
                      <span>{u.name}</span>
                      <span className="bw-detail-meta-text">
                        메시지 {u.message_count}개 · {u.uploaded_at.slice(0, 10)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="period-heading">
          <h2 id="period-heading" className="bw-detail-section-title">
            기간 지정 (선택)
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              특정 기간·시간을 지정하면 해당 구간의 대화만 사용해 관계도를 그립니다. 비우면 전체 기간입니다.
            </p>
            <div className="bw-mt-sm" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="bw-detail-meta-text">시작:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bw-input"
                  style={{ width: 160 }}
                  aria-label="시작 날짜"
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="bw-detail-meta-text">끝:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bw-input"
                  style={{ width: 160 }}
                  aria-label="끝 날짜"
                />
              </label>
              <button
                type="button"
                className="bw-btn-primary"
                onClick={handleSearchGraph}
                disabled={loadingGraph || !selectedId}
              >
                {loadingGraph ? '검색 중…' : '관계도 검색'}
              </button>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="graph-heading">
          <h2 id="graph-heading" className="bw-detail-section-title">
            대화 관계도
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            {graph && graph.nodes.length === 0 && (
              <p className="bw-label-block bw-detail-note">
                해당 기간에 메시지가 없거나 파싱된 참여자가 없습니다.
              </p>
            )}
            {graph && graph.nodes.length > 0 && (
              <div style={{ overflow: 'auto', maxWidth: '100%' }}>
                <svg
                  ref={svgRef}
                  width={SVG_WIDTH}
                  height={SVG_HEIGHT}
                  role="img"
                  aria-label="대화 관계도 그래프"
                  style={{ display: 'block', margin: '0 auto', background: 'var(--surface-overlay)' }}
                />
                <p className="bw-detail-meta-text bw-mt-sm">
                  노드 색: 동조(초록)·반대(빨강)·중립(회색). 선: 발화 흐름(회색), 동조(초록), 반대(빨강), 대립(주황). 드래그로 위치를 옮길 수 있습니다.
                </p>
                <div className="bw-mt-sm" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e', verticalAlign: 'middle', marginRight: 4 }} /> 동조</span>
                  <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444', verticalAlign: 'middle', marginRight: 4 }} /> 반대</span>
                  <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#94a3b8', verticalAlign: 'middle', marginRight: 4 }} /> 중립</span>
                  <span>· 선: 동조(초록) 반대(빨강) 대립(주황)</span>
                </div>
              </div>
            )}
            {!graph && !loadingGraph && selectedId && (
              <p className="bw-label-block bw-detail-note">
                위에서 대화를 선택한 뒤 &quot;관계도 검색&quot;을 누르면 그래프가 표시됩니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ConversationGraphView;
