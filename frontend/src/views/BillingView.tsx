/**
 * 구독·플랜·결제 뷰 (확장 범위)
 * DEVELOPMENT_SCOPE_MASTER: /billing
 * 데이터: billingViewService (목데이터, 추후 API 교체)
 */
import React, { useEffect, useState } from 'react';
import {
  fetchBillingSummary,
  normalizeBillingSummary,
  type BillingSummary,
} from '../services/billingViewService';

function BillingView() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBillingSummary()
      .then((data) => {
        if (!cancelled) setSummary(normalizeBillingSummary(data));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const planLabel = loading ? '현재 플랜: …' : summary ? `현재 플랜: ${summary.currentPlan}` : '현재 플랜: —';
  const nextDateLabel = loading
    ? '다음 결제일: …'
    : summary?.nextBillingDate
      ? `다음 결제일: ${summary.nextBillingDate}`
      : '다음 결제일: —';

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="결제"
      data-testid="billing-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">플랜·결제·사용량을 확인하고 관리할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="billing-plan-heading">
          <h2 id="billing-plan-heading" className="bw-detail-section-title">
            플랜
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              무료·PRO·팀 등 플랜 비교와 업그레이드 옵션을 확인할 수 있습니다.
            </p>
            <div className="bw-detail-meta-row" role="list" aria-label="구독 요약">
              <span className="bw-label-block bw-detail-meta-text">{planLabel}</span>
              <span className="bw-label-block bw-detail-meta-text">{nextDateLabel}</span>
            </div>
            {!loading && summary && !summary.nextBillingDate && (
              <p className="bw-label-block bw-detail-note bw-mt-sm">
                유료 플랜으로 전환하면 다음 결제일이 표시됩니다. 아래 카드는 비교용 데모입니다.
              </p>
            )}
            {!loading && summary && (
              <div className="bw-tool-grid bw-mt-md">
                {summary.planOptions.map((p) => (
                  <div
                    key={p.id}
                    className={`bw-tool-plan-card${p.recommended ? ' bw-tool-plan-card--recommended' : ''}`}
                  >
                    <div>
                      <h3 className="bw-tool-tile-title">{p.name}</h3>
                      <p className="bw-tool-plan-price">{p.priceLabel}</p>
                    </div>
                    <ul className="bw-tool-plan-features">
                      {p.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={p.recommended ? 'bw-btn-primary' : 'bw-btn-secondary'}
                      disabled={summary.currentPlan === p.name}
                    >
                      {summary.currentPlan === p.name ? '현재 플랜' : '선택'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="billing-payment-heading">
          <h2 id="billing-payment-heading" className="bw-detail-section-title">
            결제
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              결제 수단·청구 내역·영수증을 관리합니다.
            </p>
            {!loading && summary && (
              <div className="bw-tool-table-wrap bw-mt-sm">
                <table className="bw-tool-table">
                  <caption>청구 내역 (샘플)</caption>
                  <thead>
                    <tr>
                      <th scope="col">일자</th>
                      <th scope="col">금액</th>
                      <th scope="col">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.invoices.map((inv) => (
                      <tr key={`${inv.date}-${inv.amount}`}>
                        <td>{inv.date}</td>
                        <td>{inv.amount}</td>
                        <td>{inv.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="billing-usage-heading">
          <h2 id="billing-usage-heading" className="bw-detail-section-title">
            사용량
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              요청 수·토큰·스토리지 등 사용량 한도와 현재 사용량을 표시합니다.
            </p>
            {!loading &&
              summary?.usage.map((u) => {
                const pct = Math.min(100, Math.round((u.used / u.limit) * 100));
                return (
                  <div key={u.label} className="bw-progress-row">
                    <div className="bw-progress-label">
                      <span>{u.label}</span>
                      <span>
                        {u.used} / {u.limit}
                      </span>
                    </div>
                    <div className="bw-progress-track">
                      <div className="bw-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BillingView;
