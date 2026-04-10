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

export interface KeyboardShortcutsHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const shortcuts: Shortcut[] = useMemo(() => [
        // 네비게이션 (ChatGPTInterface 실제 지원)
        { key: 'Ctrl/Cmd + N', description: '새 대화 시작', category: 'navigation' },
        { key: 'Ctrl/Cmd + /', description: '사이드바 토글', category: 'navigation' },
        { key: 'Ctrl/Cmd + L', description: '입력창 포커스', category: 'navigation' },
        { key: '/', description: '입력창 포커스 (입력창 비어 있을 때)', category: 'navigation' },
        { key: 'Esc', description: '모달·검색·스트리밍 닫기/취소', category: 'navigation' },
        { key: 'Ctrl/Cmd + E', description: '대화 내보내기 (MD)', category: 'navigation' },
        { key: 'Ctrl/Cmd + Shift + D', description: '대화 복제', category: 'navigation' },
        { key: 'Ctrl/Cmd + Shift + I', description: '대화 가져오기', category: 'navigation' },

        // 편집
        { key: 'Ctrl/Cmd + Enter', description: '메시지 전송', category: 'editing' },
        { key: 'Shift + Enter', description: '줄바꿈', category: 'editing' },
        { key: 'Ctrl/Cmd + A', description: '전체 선택', category: 'editing' },
        { key: 'Ctrl/Cmd + C', description: '복사', category: 'editing' },
        { key: 'Ctrl/Cmd + V', description: '붙여넣기', category: 'editing' },
        { key: '↑ / ↓', description: '입력 히스토리 탐색 (입력창 포커스 시)', category: 'editing' },

        // 검색
        { key: 'Ctrl/Cmd + F', description: '대화 내 메시지 검색', category: 'search' },

        // 일반
        { key: 'Ctrl/Cmd + ? 또는 ?', description: '단축키 도움말 (이 창)', category: 'general' },
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
                        <span aria-hidden="true">💡</span> ⌘? 또는 ? 로 이 도움말을 열 수 있습니다. 질문·요구 입력 시 검색·분석·예측 등 기능으로 답변이 생성됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsHelp;

