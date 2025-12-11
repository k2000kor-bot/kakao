/**
 * 키보드 단축키 도움말 컴포넌트
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './KeyboardShortcutsHelp.css';

interface Shortcut {
    key: string;
    description: string;
    category: 'navigation' | 'editing' | 'search' | 'general';
}

interface KeyboardShortcutsHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const shortcuts: Shortcut[] = useMemo(() => [
        // 네비게이션
        { key: 'Ctrl + N', description: '새 채팅 시작', category: 'navigation' },
        { key: 'Ctrl + K', description: '검색 열기', category: 'navigation' },
        { key: 'Ctrl + Shift + K', description: '고급 검색 열기', category: 'navigation' },
        { key: 'Ctrl + /', description: '고급 검색 열기', category: 'navigation' },
        { key: 'Ctrl + L', description: '입력창 포커스', category: 'navigation' },
        { key: 'Ctrl + ,', description: '설정 열기', category: 'navigation' },
        { key: 'Ctrl + 1', description: '일반 채팅 모드', category: 'navigation' },
        { key: 'Ctrl + 2', description: '코딩 파트너 모드', category: 'navigation' },
        { key: 'Ctrl + 3', description: '분석 모드', category: 'navigation' },
        { key: 'Ctrl + M', description: '성능 모니터링 열기', category: 'navigation' },
        { key: 'Ctrl + W', description: '글쓰기 모드 열기', category: 'navigation' },
        { key: 'Esc', description: '모달/패널 닫기', category: 'navigation' },

        // 편집
        { key: 'Ctrl + Enter', description: '메시지 전송', category: 'editing' },
        { key: 'Shift + Enter', description: '줄바꿈', category: 'editing' },
        { key: 'Ctrl + Z', description: '실행 취소', category: 'editing' },
        { key: 'Ctrl + Y', description: '다시 실행', category: 'editing' },
        { key: 'Ctrl + A', description: '전체 선택', category: 'editing' },
        { key: 'Ctrl + C', description: '복사', category: 'editing' },
        { key: 'Ctrl + V', description: '붙여넣기', category: 'editing' },

        // 검색
        { key: '↑ / ↓', description: '검색 결과 이동', category: 'search' },
        { key: 'Enter', description: '검색 결과 선택', category: 'search' },
        { key: 'Ctrl + / (검색 중)', description: '필터 토글', category: 'search' },

        // 일반
        { key: 'Ctrl + ?', description: '단축키 도움말', category: 'general' },
        { key: 'Ctrl + D', description: '다크 모드 토글', category: 'general' },
    ], []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (isOpen && e.key === 'Escape') {
            onClose();
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
            globalThis.window?.addEventListener('keydown', handleKeyDown);
            return () => {
                globalThis.window?.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [handleKeyDown]);

    const categories = useMemo(() => [
        { id: 'all', name: '전체' },
        { id: 'navigation', name: '네비게이션' },
        { id: 'editing', name: '편집' },
        { id: 'search', name: '검색' },
        { id: 'general', name: '일반' },
    ], []);

    const filteredShortcuts = useMemo(() =>
        selectedCategory === 'all'
            ? shortcuts
            : shortcuts.filter((s) => s.category === selectedCategory),
        [shortcuts, selectedCategory]
    );

    const getCategoryIcon = useCallback((category: string) => {
        switch (category) {
            case 'navigation':
                return '🧭';
            case 'editing':
                return '✏️';
            case 'search':
                return '🔍';
            case 'general':
                return '⚙️';
            default:
                return '⌨️';
        }
    }, []);

    const handleCategoryChange = useCallback((categoryId: string) => {
        setSelectedCategory(categoryId);
    }, []);

    const handleOverlayClick = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleModalClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    if (!isOpen) return null;

    return (
        <div
            className="shortcuts-help-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-labelledby="shortcuts-title"
            aria-modal="true"
        >
            <div className="shortcuts-help-modal" onClick={handleModalClick}>
                <div className="shortcuts-header">
                    <h2 id="shortcuts-title">
                        <span aria-hidden="true">⌨️</span> 키보드 단축키
                    </h2>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        aria-label="단축키 도움말 닫기"
                        type="button"
                    >
                        <span aria-hidden="true">✕</span>
                    </button>
                </div>

                <nav className="shortcuts-categories" role="tablist" aria-label="단축키 카테고리">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(cat.id)}
                            role="tab"
                            aria-selected={selectedCategory === cat.id}
                            aria-controls="shortcuts-list"
                            type="button"
                        >
                            <span aria-hidden="true">{getCategoryIcon(cat.id)}</span>
                            {cat.name}
                        </button>
                    ))}
                </nav>

                <div
                    id="shortcuts-list"
                    className="shortcuts-list"
                    role="tabpanel"
                    aria-label={`${categories.find(c => c.id === selectedCategory)?.name || '전체'} 단축키`}
                >
                    {filteredShortcuts.map((shortcut, index) => (
                        <div key={`${shortcut.category}-${index}-${shortcut.key.substring(0, 5)}`} className="shortcut-item" role="listitem">
                            <div className="shortcut-key" aria-label={`단축키: ${shortcut.key}`}>
                                {shortcut.key.split(' + ').map((k, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <span className="key-separator" aria-hidden="true">+</span>}
                                        <kbd>{k}</kbd>
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="shortcut-description">{shortcut.description}</div>
                        </div>
                    ))}
                </div>

                <div className="shortcuts-footer" role="note" aria-label="팁">
                    <p>
                        <span aria-hidden="true">💡</span> 팁: 대부분의 단축키는 입력창에 포커스가 있을 때 작동합니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsHelp;

