import React from 'react';
import { TEST_IDS } from '../constants/testIds';
import type { ComposerMultiRequestProgressState } from '../utils/composerMultiRequestProgress';

export type ComposerMultiRequestChecklistProps = {
  progress: ComposerMultiRequestProgressState;
};

/** 입력창 하단 — 다중 질문·요구·요청 항목별 순차 처리 표시 */
export function ComposerMultiRequestChecklist({ progress }: ComposerMultiRequestChecklistProps) {
  const { items, activeIndex } = progress;
  return (
    <ol
      className="composer-multi-request-checklist"
      data-testid={TEST_IDS.COMPOSER_MULTI_REQUEST_CHECKLIST}
      aria-label="다중 요청 처리 순서"
    >
      {items.map((item, index) => {
        const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending';
        const preview = item.length > 72 ? `${item.slice(0, 72)}…` : item;
        return (
          <li
            key={`${index}-${preview.slice(0, 24)}`}
            className={`composer-multi-request-checklist__item composer-multi-request-checklist__item--${state}`}
          >
            <span className="composer-multi-request-checklist__index" aria-hidden>
              {index + 1}
            </span>
            <span className="composer-multi-request-checklist__text">{preview}</span>
            {state === 'active' ? (
              <span className="composer-multi-request-checklist__badge">처리 중</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
