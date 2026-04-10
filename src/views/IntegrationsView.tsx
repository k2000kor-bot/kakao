/**
 * 연동·API·웹훅 뷰 (확장 범위)
 * DEVELOPMENT_SCOPE_MASTER: /integrations
 * API: GET /api/integrated/health (integrationsViewService)
 */
import React, { useEffect, useState } from 'react';
import {
  fetchIntegrationsHealth,
  INTEGRATIONS_CATALOG,
  type IntegrationCatalogItem,
} from '../services/integrationsViewService';
import { DEMO_SIM_WEBHOOK_CORBU_EXAMPLE_URL } from '../config/api';

function IntegrationsView() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tiles, setTiles] = useState<IntegrationCatalogItem[]>(() => [...INTEGRATIONS_CATALOG]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchIntegrationsHealth()
      .then((data) => {
        if (!cancelled) setHealthStatus(data?.status ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const statusLabel = loading
    ? '연동 상태: …'
    : healthStatus
      ? `연동 상태: ${healthStatus === 'healthy' ? '정상' : healthStatus}`
      : '연동 상태: —';

  const toggleConnected = (id: string) => {
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, connected: !t.connected } : t)));
  };

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="연동"
      data-testid="integrations-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">외부 API·웹훅·OAuth 등 연동 설정을 관리할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="integrations-catalog-heading">
          <h2 id="integrations-catalog-heading" className="bw-detail-section-title">
            연동 카탈로그
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              알림·스토리지·개발 도구를 연결합니다. 토글은 브라우저 세션용 데모입니다.
            </p>
            <div className="bw-tool-grid bw-mt-sm">
              {tiles.map((item) => (
                <div
                  key={item.id}
                  className={`bw-tool-tile${item.connected ? ' bw-tool-tile--on' : ''}`}
                >
                  <p className="bw-tool-tile-title">{item.name}</p>
                  <span className="bw-badge-soft">{item.category}</span>
                  <p className="bw-tool-tile-meta">{item.description}</p>
                  <button
                    type="button"
                    className={item.connected ? 'bw-btn-primary' : 'bw-btn-secondary'}
                    onClick={() => toggleConnected(item.id)}
                    aria-pressed={item.connected}
                  >
                    {item.connected ? '연결됨' : '연결'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="integrations-webhook-heading">
          <h2 id="integrations-webhook-heading" className="bw-detail-section-title">
            웹훅
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              이벤트 발생 시 외부 URL로 페이로드를 전송하는 웹훅을 등록·관리할 수 있습니다.
            </p>
            <div className="bw-detail-meta-row" role="list" aria-label="웹훅 예시">
              <span className="bw-label-block bw-detail-meta-text">웹훅 URL: —</span>
              <span className="bw-label-block bw-detail-meta-text">{statusLabel}</span>
            </div>
            {!loading && healthStatus == null && (
              <p className="bw-label-block bw-detail-note bw-mt-sm">
                백엔드 미연결 시 게이트웨이 상태는 &apos;—&apos;로 표시됩니다. 위 카탈로그는 데모
                목록입니다.
              </p>
            )}
            <div className="bw-tool-toolbar bw-tool-toolbar--inline-end bw-mt-md">
              <label htmlFor="int-wh-url" className="sr-only">
                웹훅 URL
              </label>
              <input
                id="int-wh-url"
                className="bw-input"
                type="url"
                placeholder={DEMO_SIM_WEBHOOK_CORBU_EXAMPLE_URL}
              />
              <button type="button" className="bw-btn-secondary">
                검증 (데모)
              </button>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="integrations-oauth-heading">
          <h2 id="integrations-oauth-heading" className="bw-detail-section-title">
            OAuth·외부 API
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              서드파티 로그인·API 키·게이트웨이 설정을 한곳에서 관리합니다.
            </p>
            <div className="bw-tool-table-wrap bw-mt-sm">
              <table className="bw-tool-table">
                <caption>API 키 (샘플)</caption>
                <thead>
                  <tr>
                    <th scope="col">이름</th>
                    <th scope="col">마스킹</th>
                    <th scope="col"> </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>내부 게이트웨이</td>
                    <td>sk_live••••42</td>
                    <td>
                      <button type="button" className="bw-btn-secondary">
                        재발급
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="integrations-notifications-heading">
          <h2 id="integrations-notifications-heading" className="bw-detail-section-title">
            알림 연동
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              슬랙·이메일·푸시 등 알림 채널을 연결할 수 있습니다.
            </p>
            <p className="bw-detail-meta-text bw-mt-sm">
              Slack·이메일 타일에서 연결 상태를 바꾼 뒤, 실제 웹훅 URL을 위 섹션에 등록하세요.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default IntegrationsView;
