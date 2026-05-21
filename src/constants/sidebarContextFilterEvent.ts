/**
 * Sidebar context filter synchronization contract.
 * - storage keys
 * - custom event names
 * - payload detail types
 * - parsing/coercion helpers
 */
export const SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT = 'sidebar-context-filter-updated';
export const SIDEBAR_CONTEXT_FILTER_STORAGE_KEY = 'sidebarContextFilter';
export const SIDEBAR_CONTEXT_RESTORE_KEY = 'corbu.settings.sidebarContextFilterRestore';
export const SIDEBAR_CONTEXT_TOAST_KEY = 'corbu.settings.sidebarContextFilterToast';
export const SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT = 'sidebar-context-restore-mode-updated';
export const SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT = 'sidebar-context-toast-updated';

export type SidebarContextFilter = 'all' | 'agent' | 'project';

export interface SidebarContextFilterUpdatedDetail {
  filter?: string;
}

export interface SidebarContextRestoreUpdatedDetail {
  restoreEnabled: boolean;
}

export interface SidebarContextToastUpdatedDetail {
  enabled: boolean;
}

/** Accept only strict boolean values from event details. */
export function coerceSidebarContextBooleanDetail(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

export function isSidebarContextFilter(value: string | undefined): value is SidebarContextFilter {
  return value === 'all' || value === 'agent' || value === 'project';
}

export function normalizeSidebarContextFilter(
  value: string | undefined,
  fallback: SidebarContextFilter = 'all',
): SidebarContextFilter {
  return isSidebarContextFilter(value) ? value : fallback;
}

export function readSidebarContextFilterFromStorage(
  fallback: SidebarContextFilter = 'all',
): SidebarContextFilter {
  try {
    const saved = localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    return normalizeSidebarContextFilter(saved ?? undefined, fallback);
  } catch {
    return fallback;
  }
}

export function writeSidebarContextFilterToStorage(filter: SidebarContextFilter): void {
  try {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, filter);
  } catch {
    /* ignore */
  }
}

export function sidebarContextFilterLabel(filter: SidebarContextFilter): string {
  if (filter === 'agent') return '에이전트';
  if (filter === 'project') return '프로젝트';
  return '전체';
}

/** Accept only valid filter literals from event details. */
export function coerceSidebarContextFilterDetail(value: unknown): SidebarContextFilter | undefined {
  if (typeof value !== 'string' || !isSidebarContextFilter(value)) return undefined;
  return value;
}

export function dispatchSidebarContextFilterUpdated(filter: SidebarContextFilter): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SidebarContextFilterUpdatedDetail>(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, {
      detail: { filter },
    }),
  );
}

export function dispatchSidebarContextRestoreUpdated(restoreEnabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SidebarContextRestoreUpdatedDetail>(SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT, {
      detail: { restoreEnabled },
    }),
  );
}

export function dispatchSidebarContextToastUpdated(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SidebarContextToastUpdatedDetail>(SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT, {
      detail: { enabled },
    }),
  );
}

export function readSidebarContextFilterFlag(
  key: string,
  defaultEnabled = true,
): boolean {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultEnabled;
    return value !== '0';
  } catch {
    return defaultEnabled;
  }
}

export function writeSidebarContextFilterFlag(key: string, enabled: boolean): void {
  try {
    localStorage.setItem(key, enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}
