/**
 * 알림 센터 컴포넌트
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './NotificationCenter.css';
import { getStatusColor } from '../styles/themeColors';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'writing' | 'collaboration';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onClearAll?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | Notification['type']>('all');
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleEscape]);

  const unreadCount = useMemo(() =>
    notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() =>
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter),
    [notifications, filter]
  );

  const getTypeIcon = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'writing':
        return '✍️';
      case 'collaboration':
        return '👥';
      default:
        return '🔔';
    }
  }, []);

  const getTypeColor = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'success':
        return getStatusColor('success');
      case 'info':
        return 'var(--accent-info)';
      case 'warning':
        return getStatusColor('warning');
      case 'error':
        return getStatusColor('error');
      case 'writing':
        return 'var(--accent-secondary)';
      case 'collaboration':
        return 'var(--accent-orange)';
      default:
        return 'var(--text-tertiary)';
    }
  }, []);

  const formatTime = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
    }
  }, [onMarkAsRead]);

  const handleActionClick = useCallback((e: React.MouseEvent, action: Notification['action']) => {
    e.stopPropagation();
    action?.onClick();
  }, []);

  const handleDismiss = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDismiss?.(id);
  }, [onDismiss]);

  return (
    <section className="notification-center" ref={notificationRef} aria-label="알림 센터">
      <button
        className="notification-toggle"
        onClick={handleToggle}
        aria-label={unreadCount > 0 ? `알림 (읽지 않은 알림 ${unreadCount}개)` : '알림'}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`읽지 않은 알림 ${unreadCount}개`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <dialog className="notification-panel" aria-labelledby="notification-title" open>
          <div className="notification-header">
            <h3 id="notification-title">알림</h3>
            <fieldset className="notification-actions" aria-label="알림 필터 및 액션" style={{ border: 'none', padding: 0, margin: 0 }}>
              <select
                className="notification-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as Notification['type'] | 'all')}
                aria-label="알림 필터"
              >
                <option value="all">전체</option>
                <option value="success">성공</option>
                <option value="info">정보</option>
                <option value="warning">경고</option>
                <option value="error">오류</option>
                <option value="writing">글쓰기</option>
                <option value="collaboration">협업</option>
              </select>
              {notifications.length > 0 && (
                <button
                  className="clear-all-btn"
                  onClick={onClearAll}
                  aria-label="모든 알림 지우기"
                  type="button"
                >
                  모두 지우기
                </button>
              )}
            </fieldset>
          </div>

          <ul className="notification-list" aria-label="알림 목록">
            {filteredNotifications.length === 0 ? (
              <li className="notification-empty">
                <output aria-live="polite">
                  <p>알림이 없습니다.</p>
                </output>
              </li>
            ) : (
              filteredNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${notification.read ? '읽은' : '읽지 않은'} 알림: ${notification.title}`}
                >
                  <div
                    className="notification-icon"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderLeft: `3px solid ${getTypeColor(notification.type)}`,
                    }}
                    aria-hidden="true"
                  >
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title-row">
                      <h4>{notification.title}</h4>
                      <time className="notification-time" dateTime={notification.timestamp.toISOString()}>
                        {formatTime(notification.timestamp)}
                      </time>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    {notification.action && (
                      <button
                        className="notification-action-btn"
                        onClick={(e) => handleActionClick(e, notification.action)}
                        aria-label={notification.action.label}
                        type="button"
                      >
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                  <button
                    className="notification-dismiss"
                    onClick={(e) => handleDismiss(e, notification.id)}
                    aria-label={`${notification.title} 알림 닫기`}
                    type="button"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </dialog>
      )}
    </section>
  );
};

export default NotificationCenter;
