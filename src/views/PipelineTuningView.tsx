/**
 * 파이프라인 튜닝·LLM 내부 보안 상태 (관리자)
 * API: GET /api/pipeline-tuning, GET /api/llm-internal-security
 */
import React, { useEffect, useState } from 'react';
import {
  fetchPipelineTuning,
  fetchLlmInternalSecurity,
  type PipelineTuningResponse,
  type LlmInternalSecurityResponse,
} from '../services/pipelineTuningService';
import { AGENTS_PATH, AGENTS_QUERY_PARAM_ID } from '../config/routes';
import { buildPublicGensparkAgentUrl } from '../services/gensparkAgentRegistry';

function PipelineTuningView() {
  const [tuning, setTuning] = useState<PipelineTuningResponse | null>(null);
  const [security, setSecurity] = useState<LlmInternalSecurityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    setLoading(true);
    Promise.all([fetchPipelineTuning(), fetchLlmInternalSecurity()])
      .then(([t, s]) => {
        if (!c) {
          setTuning(t);
          setSecurity(s);
        }
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);

  const jsonBlock = (obj: unknown) => (
    <pre
      className="bw-detail-code-block"
      style={{
        margin: 0,
        padding: '12px',
        overflow: 'auto',
        maxHeight: '420px',
        fontSize: '12px',
        background: 'var(--surface-elevated, #f5f5f5)',
        borderRadius: '8px',
      }}
    >
      {JSON.stringify(obj, null, 2)}
    </pre>
  );

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="파이프라인 튜닝"
      data-testid="pipeline-tuning-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">
          응답 품질 프리셋(basic/enhanced/ultimate), LLM 타임아웃·temperature·max_tokens, 사전 파이프라인 단계를 서버 설정으로
          조회합니다. 저장은 서버 환경 변수 <code>PIPELINE_TUNING_SECRET</code>이 설정된 경우에만 POST{' '}
          <code>/api/pipeline-tuning</code>으로 가능합니다.
        </p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="llm-security-heading">
          <h2 id="llm-security-heading" className="bw-detail-section-title">
            LLM 내부 보안 상태
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            {loading ? (
              <p className="bw-features-card-desc">불러오는 중…</p>
            ) : security?.success ? (
              <ul className="bw-detail-meta-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <li>
                  <strong>에어갭(LLM_INTERNAL_AIRGAP 등)</strong>: {security.airgap ? '예' : '아니오'}
                </li>
                <li>
                  <strong>DeepSeek 클라우드 차단</strong>: {security.deepseek_cloud_blocked ? '예' : '아니오'}
                </li>
                <li>
                  <strong>외부 웹·수집 차단</strong>: {security.outbound_collection_blocked ? '예' : '아니오'}
                </li>
              </ul>
            ) : (
              <p className="bw-features-card-desc">
                API에 연결할 수 없거나 엔드포인트가 없습니다. 백엔드(main_server) 실행 및{' '}
                <code>/api/llm-internal-security</code>를 확인하세요.
              </p>
            )}
            <p className="bw-features-card-desc" style={{ marginTop: 12 }}>
              상세: <code>docs/DEEPSEEK_SETUP.md</code> §0 내부 보안, <code>backend/llm_internal_security.py</code>
            </p>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="genspark-ref-agent-heading">
          <h2 id="genspark-ref-agent-heading" className="bw-detail-section-title">
            참조 Genspark 에이전트 폼
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              레포는 Genspark <strong>에이전트 편집 폼</strong>(이름·설명·지시문·산출·품질)에 맞춘 참조 프리셋을 context에 실어 보냅니다. 지시문 원문은 페이지에서 복사해{' '}
              <code>REACT_APP_GENSPARK_REFERENCE_AGENT_INSTRUCTIONS</code>에 넣으면 동일하게 맞출 수 있습니다.
            </p>
            <ul className="bw-detail-meta-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <li>
                <strong>참조 ID</strong>: <code>eb7747f5-0399-48ff-b436-68a0a23365c9</code>
              </li>
              <li>
                <strong>편집 URL</strong>:{' '}
                <a
                  href={buildPublicGensparkAgentUrl('eb7747f5-0399-48ff-b436-68a0a23365c9')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  genspark.ai/agents?{AGENTS_QUERY_PARAM_ID}=…
                </a>
              </li>
              <li>
                <strong>문서</strong>: <code>docs/architecture/GENSPARK_EXTERNAL_AGENT_FORM_MAPPING.md</code>
              </li>
              <li>
                <strong>앱 내 에이전트 URL</strong>: 허브{' '}
                <a href={AGENTS_PATH}>{AGENTS_PATH}</a>
                {' · '}
                <a
                  href={`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`}
                >
                  등록 ID 예시 (쿼리)
                </a>
                {' — '}
                <code>mergeApiChatContextPayload</code>에 <code>genspark_route_agent_id</code>를 넣어도 동일 프로필 정렬.
              </li>
              <li>
                <strong>서버 추가 지시</strong>: 환경 변수 <code>GENSPARK_REFERENCE_AGENT_INSTRUCTIONS</code> (백엔드 프롬프트 prefix)
              </li>
            </ul>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="frontend-scenario-heading">
          <h2 id="frontend-scenario-heading" className="bw-detail-section-title">
            프론트 — 응답 시나리오·상속 (CRA env)
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <ul className="bw-detail-meta-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <li>
                <code>REACT_APP_INCLUDE_QA_GENERATION_SCENARIO=true</code> — Q→A 응답 메타에{' '}
                <code>generation_scenario</code> 포함(패널·다음 턴 맥락).
              </li>
              <li>
                <code>REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO=true</code> — 직전 어시스턴트{' '}
                <code>pipelineExtras.generationScenarioMarkdown</code>을 다음 요청{' '}
                <code>context.client_generation_scenario</code>로 전달. 헬퍼{' '}
                <code>scenarioInheritMergeOptionsFromMessages</code>·
                <code>scenarioInheritMergeOptionsFromPipelineLikeMessages</code>(<code>role</code>·<code>sender</code>·
                <code>type</code> 예: 파일분석 <code>ai</code>) —{' '}
                <code>modernChatContextBuilder</code>·<code>unifiedAPI</code> 재export.
              </li>
              <li>
                최상위 <code>conversation_history</code> 없이도 <code>context.conversation_history</code> /{' '}
                <code>conversationHistory</code> / <code>messages</code> 턴의 <code>pipelineExtras</code>만으로 동일
                상속 — <code>mergeApiChatContextPayload</code>·<code>buildUnifiedApiChatRequestBody</code>가 내부
                병합. 스트리밍은 <code>requestBody.context</code>에 넣은 히스토리도 merge에 포함.
              </li>
              <li>
                상세 표: <code>docs/DEEPSEEK_SETUP.md</code> 2.3절
              </li>
            </ul>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="pipeline-config-heading">
          <h2 id="pipeline-config-heading" className="bw-detail-section-title">
            현재 파이프라인 설정
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            {loading ? (
              <p className="bw-features-card-desc">불러오는 중…</p>
            ) : tuning?.success && tuning.config ? (
              <>
                <p className="bw-features-card-desc">
                  API 쓰기 허용: <strong>{tuning.writable ? '예 (PIPELINE_TUNING_SECRET 설정됨)' : '아니오 (파일 직접 편집)'}</strong>
                </p>
                {jsonBlock(tuning.config)}
              </>
            ) : (
              <p className="bw-features-card-desc">
                <code>GET /api/pipeline-tuning</code> 응답을 가져오지 못했습니다. 백엔드가 <code>main_server</code>인지 확인하세요.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default PipelineTuningView;
