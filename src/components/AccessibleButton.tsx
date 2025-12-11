/**
 * 접근성 개선 버튼 컴포넌트
 * 키보드 네비게이션 및 스크린 리더 지원
 */

import React, { ReactNode, useCallback } from 'react';

interface AccessibleButtonProps {
    children: ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
    children,
    onClick,
    className = '',
    disabled = false,
    ariaLabel,
    ariaDescribedBy,
    type = 'button',
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
}) => {
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) {
                onClick();
            }
        }
    }, [disabled, onClick]);

    const baseClasses = `accessible-btn btn-${variant} btn-${size} ${className}`;

    return (
        <button
            type={type}
            className={baseClasses}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
        >
            {icon && iconPosition === 'left' && <span className="btn-icon-left">{icon}</span>}
            <span className="btn-content">{children}</span>
            {icon && iconPosition === 'right' && <span className="btn-icon-right">{icon}</span>}
        </button>
    );
};

export default AccessibleButton;

