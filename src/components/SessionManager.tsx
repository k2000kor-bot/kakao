/**
 * 세션 관리 컴포넌트
 * 세션 목록 표시, 세션 이름 변경, 세션 생성/삭제 기능 제공
 * 
 * Task-G1: 세션 관리 UI 개선
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './SessionManager.css';

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

interface SessionManagerProps {
  currentSessionId: string | null;
  sessions: Session[];
  onSessionSelect: (sessionId: string) => void;
  onSessionCreate: (name?: string) => void;
  onSessionRename: (sessionId: string, newName: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onClose?: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  currentSessionId,
  sessions,
  onSessionSelect,
  onSessionCreate,
  onSessionRename,
  onSessionDelete,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  const handleStartEdit = useCallback((session: Session) => {
    setEditingId(session.id);
    setEditingName(session.name);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingId && editingName.trim()) {
      onSessionRename(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  }, [editingId, editingName, onSessionRename]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingName('');
  }, []);

  const handleCreateSession = useCallback(() => {
    if (newSessionName.trim()) {
      onSessionCreate(newSessionName.trim());
      setNewSessionName('');
      setShowCreateForm(false);
    }
  }, [newSessionName, onSessionCreate]);

  const handleDeleteSession = useCallback((sessionId: string) => {
    if (typeof globalThis !== 'undefined' && 'window' in globalThis && globalThis.window?.confirm) {
      if (globalThis.window.confirm('이 세션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        onSessionDelete(sessionId);
      }
    }
  }, [onSessionDelete]);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }, []);

  return (
    <div className="session-manager" role="dialog" aria-label="세션 관리">
      <div className="session-manager-header">
        <h2>세션 관리</h2>
        <div className="session-manager-actions">
          <button
            className="session-action-btn"
            onClick={() => setShowCreateForm(true)}
            aria-label="새 세션 만들기"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            새 세션
          </button>
          {onClose && (
            <button
              className="session-close-btn"
              onClick={onClose}
              aria-label="세션 관리 닫기"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showCreateForm && (
        <div className="session-create-form">
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="세션 이름을 입력하세요"
            className="session-name-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateSession();
              } else if (e.key === 'Escape') {
                setShowCreateForm(false);
                setNewSessionName('');
              }
            }}
            autoFocus
            aria-label="새 세션 이름 입력"
          />
          <div className="session-form-actions">
            <button
              className="session-btn-primary"
              onClick={handleCreateSession}
              disabled={!newSessionName.trim()}
              aria-label="세션 생성"
              type="button"
            >
              생성
            </button>
            <button
              className="session-btn-secondary"
              onClick={() => {
                setShowCreateForm(false);
                setNewSessionName('');
              }}
              aria-label="세션 생성 취소"
              type="button"
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className="session-list" role="list">
        {sessions.length === 0 ? (
          <div className="session-empty">
            <p>세션이 없습니다.</p>
            <button
              className="session-btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              첫 세션 만들기
            </button>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
              role="listitem"
            >
              {editingId === session.id ? (
                <div className="session-edit-form">
                    <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="session-name-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    autoFocus
                    aria-label="세션 이름 수정"
                  />
                  <div className="session-item-actions">
                    <button
                      className="session-icon-btn"
                      onClick={handleSaveEdit}
                      aria-label="세션 이름 저장"
                      disabled={!editingName.trim()}
                      type="button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button
                      className="session-icon-btn"
                      onClick={handleCancelEdit}
                      aria-label="세션 이름 수정 취소"
                      type="button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="session-item-content"
                    onClick={() => onSessionSelect(session.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSessionSelect(session.id);
                      }
                    }}
                  >
                    <div className="session-item-name">{session.name}</div>
                    <div className="session-item-meta">
                      <time dateTime={session.updatedAt}>{formatDate(session.updatedAt)}</time>
                      {session.messageCount !== undefined && (
                        <span aria-label={`${session.messageCount}개 메시지`}>• {session.messageCount}개 메시지</span>
                      )}
                    </div>
                  </div>
                  <div className="session-item-actions">
                    <button
                      className="session-icon-btn"
                      onClick={() => handleStartEdit(session)}
                      aria-label={`${session.name} 세션 이름 변경`}
                      type="button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="session-icon-btn session-icon-btn-danger"
                      onClick={() => handleDeleteSession(session.id)}
                      aria-label={`${session.name} 세션 삭제`}
                      type="button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionManager;

