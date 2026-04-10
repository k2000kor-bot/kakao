/**
 * CORBU.AI 테마 색상 — CSS 변수 이름 (chart/status/UI 일관용)
 * theme.css와 동기화. Recharts·인라인 스타일에서 var(--...) 문자열 사용.
 */

/** 차트 시리즈용 기본 팔레트 (순서 유지) */
export const CHART_COLORS = [
  'var(--accent-info)',
  'var(--accent-success)',
  'var(--accent-warning)',
  'var(--accent-error)',
  'var(--accent-secondary)',
] as const;

/** 상태: good/success/up/healthy → 초록, warning/degraded → 노랑, error/bad/down → 빨강 */
export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'good':
    case 'success':
    case 'healthy':
    case 'low':
    case 'up':
      return 'var(--accent-success)';
    case 'warning':
    case 'medium':
    case 'degraded':
      return 'var(--accent-warning)';
    case 'error':
    case 'bad':
    case 'critical':
    case 'high':
    case 'down':
    case 'unhealthy':
      return 'var(--accent-error)';
    default:
      return 'var(--text-tertiary)';
  }
}

/** 심각도: low → 초록, medium → 노랑, high → 빨강, critical → 보라 */
export function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case 'low':
      return 'var(--accent-success)';
    case 'medium':
      return 'var(--accent-warning)';
    case 'high':
      return 'var(--accent-error)';
    case 'critical':
      return 'var(--accent-secondary)';
    default:
      return 'var(--text-tertiary)';
  }
}

/** 우선순위: high → 빨강, medium → 노랑, low → 초록 */
export function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'var(--accent-error)';
    case 'medium':
      return 'var(--accent-warning)';
    case 'low':
      return 'var(--accent-success)';
    default:
      return 'var(--text-secondary)';
  }
}

/** 메트릭(CPU/메모리 등): value >= threshold → 빨강, >= 0.7*threshold → 노랑, else 초록 */
export function getMetricColor(value: number, threshold: number = 80): string {
  if (value >= threshold) return 'var(--accent-error)';
  if (value >= threshold * 0.7) return 'var(--accent-warning)';
  return 'var(--accent-success)';
}

/** 감정/의도 라벨 → 테마 색 (한글·영어 지원) */
export function getSentimentColor(label: string): string {
  const m: Record<string, string> = {
    긍정: 'var(--accent-success)',
    부정: 'var(--accent-error)',
    positive: 'var(--accent-success)',
    negative: 'var(--accent-error)',
    neutral: 'var(--text-tertiary)',
    question: 'var(--accent-warning)',
    request: 'var(--accent-secondary)',
    gratitude: 'var(--accent-success)',
    greeting: 'var(--accent-info)',
    complaint: 'var(--accent-error)',
    compliment: 'var(--accent-orange)',
  };
  return m[label] ?? 'var(--text-secondary)';
}

/** AI 인사이트 타입 색상 */
export function getInsightTypeColor(type: string): string {
  const t: Record<string, string> = {
    pattern: 'var(--accent-info)',
    anomaly: 'var(--accent-warning)',
    prediction: 'var(--accent-success)',
    recommendation: 'var(--accent-secondary)',
    opportunity: 'var(--accent-success)',
    risk: 'var(--accent-error)',
    improvement: 'var(--accent-info)',
    trend: 'var(--accent-secondary)',
  };
  return t[type] ?? 'var(--text-tertiary)';
}

/** 품질 점수 구간: 높음 초록, 중간 노랑, 낮음 빨강 */
export function getQualityScoreColor(score: number): string {
  if (score >= 80) return 'var(--accent-success)';
  if (score >= 60) return 'var(--accent-warning)';
  return 'var(--accent-error)';
}

/** 문서 카테고리별 배지 스타일 */
export function getCategoryStyle(category: string): { color: string; backgroundColor: string } {
  switch (category?.toLowerCase()) {
    case 'business': return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
    case 'technical': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'creative': return { color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' };
    case 'academic': return { color: 'var(--accent-orange)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'legal': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'marketing': return { color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 문서 상태별 배지 스타일 */
export function getDocumentStatusStyle(status: string): { color: string; backgroundColor: string } {
  switch (status?.toLowerCase()) {
    case 'draft': return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
    case 'review': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'approved': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'published': return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 사용자 상태별 배지 스타일 (RBAC 등) */
export function getUserStatusStyle(status: string): { color: string; backgroundColor: string } {
  switch (status?.toLowerCase()) {
    case 'active': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'inactive': return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
    case 'suspended': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'pending': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 역할 색상 → 배지 스타일 (purple, blue, green 등) */
export function getRoleBadgeStyle(roleColor: string): { color: string; backgroundColor: string } {
  switch (roleColor?.toLowerCase()) {
    case 'purple': return { color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' };
    case 'blue': return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
    case 'green': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'red': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'yellow':
    case 'orange': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 성능 알림 유형별 스타일 */
export function getAlertTypeStyle(type: string): { color: string; backgroundColor: string } {
  switch (type?.toLowerCase()) {
    case 'error': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'warning': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'success': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'info':
    default: return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
  }
}

/** 알림 심각도별 배지 스타일 */
export function getSeverityBadgeStyle(severity: string): { color: string; backgroundColor: string } {
  switch (severity?.toLowerCase()) {
    case 'critical': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'high': return { color: 'var(--accent-orange)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'medium': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'low':
    default: return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
  }
}

/** 감사 로그 상태별 아이콘 배경 */
export function getAuditStatusStyle(status: string): { color: string; backgroundColor: string } {
  switch (status?.toLowerCase()) {
    case 'success': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'failure': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'warning': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 시스템 헬스별 배지 스타일 (excellent, good, warning, critical) */
export function getHealthStyle(health: string): { color: string; backgroundColor: string } {
  switch (health?.toLowerCase()) {
    case 'excellent': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'good': return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
    case 'warning': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'critical': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** AI 모델 상태별 배지 스타일 */
export function getModelStatusStyle(status: string): { color: string; backgroundColor: string } {
  switch (status?.toLowerCase()) {
    case 'active': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'training': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'error': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'inactive':
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 협업자 역할별 배지 스타일 */
export function getCollaboratorRoleStyle(role: string): { color: string; backgroundColor: string } {
  switch (role?.toLowerCase()) {
    case 'owner': return { color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' };
    case 'admin': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'editor': return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
    case 'viewer':
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 협업자 온라인 상태 색상 (도트용) */
export function getCollaboratorStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'online': return 'var(--accent-success)';
    case 'away': return 'var(--accent-warning)';
    case 'offline':
    default: return 'var(--text-tertiary)';
  }
}

/** 워크플로우 상태별 배지 스타일 */
export function getWorkflowStatusStyle(status: string): { color: string; backgroundColor: string } {
  switch (status?.toLowerCase()) {
    case 'active': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'inactive': return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
    case 'draft': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'error': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 지침 카테고리별 배지 스타일 */
export function getGuidelineCategoryStyle(category: string): { color: string; backgroundColor: string } {
  switch (category?.toLowerCase()) {
    case 'general': return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
    case 'tone': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'style': return { color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' };
    case 'format': return { color: 'var(--accent-orange)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'constraint': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'custom':
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 프로젝트 상태별 배지 스타일 */
export function getProjectStatusStyle(status: string): { color: string; backgroundColor: string } {
  switch (status?.toLowerCase()) {
    case 'active': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'completed': return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
    case 'archived': return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 우선순위별 배지 스타일 */
export function getPriorityStyle(priority: string): { color: string; backgroundColor: string } {
  switch (priority?.toLowerCase()) {
    case 'high': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'medium': return { color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'low': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

/** 배지용 클래스: bw-badge-info, bw-badge-success, bw-badge-warning, bw-badge-error, bw-badge-secondary */
export function getBadgeClass(variant: 'info' | 'success' | 'warning' | 'error' | 'secondary'): string {
  return `bw-badge bw-badge-${variant}`;
}

/** 효과 점수(0-100) → 배지 클래스: 85+ success, 70+ info, 55+ warning, else error */
export function getEffectivenessBadgeClass(score: number): string {
  if (score >= 85) return 'bw-badge bw-badge-success';
  if (score >= 70) return 'bw-badge bw-badge-info';
  if (score >= 55) return 'bw-badge bw-badge-warning';
  return 'bw-badge bw-badge-error';
}

/**
 * 차트/시각화 서비스용 hex 팔레트 (theme.css와 동기화).
 * Chart.js 등 CSS var를 지원하지 않는 라이브러리용.
 * Primary #0084FF, Success #3FDD78, Warning #f59e0b, Error #ef4444, Secondary #8E55EA
 */
/** 파일 타입별 배지 스타일 (CORBU.AI theme) */
export function getFileTypeStyle(type: string): { color: string; backgroundColor: string } {
  switch (type?.toLowerCase()) {
    case 'pdf': return { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' };
    case 'doc':
    case 'docx': return { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' };
    case 'xls':
    case 'xlsx': return { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
    case 'ppt':
    case 'pptx': return { color: 'var(--accent-orange)', backgroundColor: 'var(--accent-warning-subtle)' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return { color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' };
    default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' };
  }
}

export const CHART_COLORS_HEX = [
  '#0084FF', // accent-info
  '#3FDD78', // accent-success
  '#f59e0b', // accent-warning
  '#ef4444', // accent-error
  '#8E55EA', // accent-secondary
] as const;
