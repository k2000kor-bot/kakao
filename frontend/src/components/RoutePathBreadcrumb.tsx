/**
 * 페이지·입력 도크 상단 경로 크롬 — 한 줄(홈 › 대화 등)
 */
import React from 'react';
import { NavLink } from 'react-router-dom';

export type RoutePathCrumb = {
  label: string;
  to?: string;
};

export type RoutePathBreadcrumbProps = {
  items: RoutePathCrumb[];
  className?: string;
  /** 보조 안내(프로젝트 목록 등) — 있으면 다음 줄 */
  hint?: React.ReactNode;
};

export function RoutePathBreadcrumb({ items, className, hint }: RoutePathBreadcrumbProps) {
  if (items.length === 0) return null;
  return (
    <nav
      className={[
        'brainwave-chat-route-breadcrumb',
        'brainwave-chat-route-breadcrumb--page-aligned',
        'brainwave-chat-route-breadcrumb--single-line',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="현재 위치"
    >
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${item.to ?? 'leaf'}-${index}`}>
          {index > 0 ? (
            <span className="brainwave-chat-route-breadcrumb__sep" aria-hidden>
              ›
            </span>
          ) : null}
          {item.to ? (
            <NavLink to={item.to} className="brainwave-chat-route-breadcrumb__link">
              {item.label}
            </NavLink>
          ) : (
            <span className="brainwave-chat-route-breadcrumb__leaf" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
      {hint ? <span className="brainwave-chat-route-breadcrumb__hint">{hint}</span> : null}
    </nav>
  );
}
