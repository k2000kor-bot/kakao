/**
 * 지연 로딩 컴포넌트 정의
 * 큰 컴포넌트들을 코드 스플리팅하여 초기 로딩 시간 단축
 */

import React, { Suspense, ComponentType } from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import type { SearchPanelProps } from './SearchPanel';
import type { AdvancedSearchPanelProps } from './AdvancedSearchPanel';
import type { SessionManagerProps } from './SessionManager';
import type { NotificationCenterProps } from './NotificationCenter';
import type { KeyboardShortcutsHelpProps } from './KeyboardShortcutsHelp';
import type { BreadcrumbNavigationProps } from './BreadcrumbNavigation';
import type { ErrorRecoveryProps } from './ErrorRecovery';
import type { AdvancedFeaturesPanelProps } from './AdvancedFeaturesPanel';

/**
 * Suspense 래퍼 컴포넌트
 */
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div style={{ padding: '20px' }}>
        <LoadingSkeleton type="card" lines={3} />
      </div>
    }
  >
    {children}
  </Suspense>
);

/**
 * 지연 로딩된 컴포넌트 래퍼
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
): React.FC<P> {
  return (props: P) => (
    <Suspense fallback={fallback || <LoadingSkeleton type="card" lines={3} />}>
      <Component {...props} />
    </Suspense>
  );
}

// 지연 로딩된 컴포넌트들
export const LazyAdvancedFeaturesPanel = React.lazy(
  () => import('./AdvancedFeaturesPanel')
);

export const LazyPerformanceMonitoringDashboard = React.lazy(
  () => import('./PerformanceMonitoringDashboard')
);

export const LazyWritingAssistant = React.lazy(
  () => import('./WritingAssistant')
);

export const LazyUserSettings = React.lazy(
  () => import('./UserSettings')
);

export const LazySearchPanel = React.lazy(
  () => import('./SearchPanel')
);

export const LazyAdvancedSearchPanel = React.lazy(
  () => import('./AdvancedSearchPanel')
);

export const LazySessionManager = React.lazy(
  () => import('./SessionManager')
);

export const LazyNotificationCenter = React.lazy(
  () => import('./NotificationCenter')
);

export const LazyKeyboardShortcutsHelp = React.lazy(
  () => import('./KeyboardShortcutsHelp')
);

export const LazyBreadcrumbNavigation = React.lazy(
  () => import('./BreadcrumbNavigation')
);

export const LazyErrorRecovery = React.lazy(
  () => import('./ErrorRecovery')
);

// 지연 로딩된 컴포넌트를 Suspense로 감싼 버전
type LazyProps = Record<string, unknown>;

export const AdvancedFeaturesPanel = (props: AdvancedFeaturesPanelProps) => (
  <SuspenseWrapper>
    <LazyAdvancedFeaturesPanel {...props} />
  </SuspenseWrapper>
);

export const PerformanceMonitoringDashboard = (props: LazyProps) => (
  <SuspenseWrapper>
    <LazyPerformanceMonitoringDashboard {...props} />
  </SuspenseWrapper>
);

export const WritingAssistant = (props: LazyProps) => (
  <SuspenseWrapper>
    <LazyWritingAssistant {...props} />
  </SuspenseWrapper>
);

export const UserSettings = (props: LazyProps) => (
  <SuspenseWrapper>
    <LazyUserSettings {...props} />
  </SuspenseWrapper>
);

export const SearchPanel = (props: SearchPanelProps) => (
  <SuspenseWrapper>
    <LazySearchPanel {...props} />
  </SuspenseWrapper>
);

export const AdvancedSearchPanel = (props: AdvancedSearchPanelProps) => (
  <SuspenseWrapper>
    <LazyAdvancedSearchPanel {...props} />
  </SuspenseWrapper>
);

export const SessionManager = (props: SessionManagerProps) => (
  <SuspenseWrapper>
    <LazySessionManager {...props} />
  </SuspenseWrapper>
);

export const NotificationCenter = (props: NotificationCenterProps) => (
  <SuspenseWrapper>
    <LazyNotificationCenter {...props} />
  </SuspenseWrapper>
);

export const KeyboardShortcutsHelp = (props: KeyboardShortcutsHelpProps) => (
  <SuspenseWrapper>
    <LazyKeyboardShortcutsHelp {...props} />
  </SuspenseWrapper>
);

export const BreadcrumbNavigation = (props: BreadcrumbNavigationProps) => (
  <SuspenseWrapper>
    <LazyBreadcrumbNavigation {...props} />
  </SuspenseWrapper>
);

export const ErrorRecovery = (props: ErrorRecoveryProps) => (
  <SuspenseWrapper>
    <LazyErrorRecovery {...props} />
  </SuspenseWrapper>
);

export const LazyChatView = React.lazy(() => import('./Chat/ChatView'));
export const LazyChatInterface = React.lazy(() => import('./Chat/ChatInterface'));
export type { ChatInterfaceProps } from './Chat/ChatInterface';

export const ChatView = (props: React.ComponentProps<typeof LazyChatView>) => (
  <SuspenseWrapper>
    <LazyChatView {...props} />
  </SuspenseWrapper>
);

export const ChatInterface = (props: React.ComponentProps<typeof LazyChatInterface>) => (
  <SuspenseWrapper>
    <LazyChatInterface {...props} />
  </SuspenseWrapper>
);

