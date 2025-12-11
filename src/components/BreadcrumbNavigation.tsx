/**
 * 브레드크럼 네비게이션 컴포넌트
 * 현재 위치 표시 및 빠른 네비게이션 제공
 * 
 * Task-D1: 네비게이션 개선
 */

import React from 'react';
import './BreadcrumbNavigation.css';

export interface BreadcrumbItem {
    label: string;
    path?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
}

interface BreadcrumbNavigationProps {
    items: BreadcrumbItem[];
    className?: string;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
    items,
    className = '',
}) => {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav className={`breadcrumb-navigation ${className}`} aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const key = item.path || item.label || `breadcrumb-${index}`;

                    return (
                        <li key={key} className="breadcrumb-item">
                            {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                            {isLast ? (
                                <span className="breadcrumb-current" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <button
                                    className="breadcrumb-link"
                                    onClick={item.onClick}
                                    aria-label={`${item.label}로 이동`}
                                >
                                    {item.label}
                                </button>
                            )}
                            {!isLast && (
                                <span className="breadcrumb-separator" aria-hidden="true">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default BreadcrumbNavigation;

