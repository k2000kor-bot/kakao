/**
 * themeColors.ts 단위 테스트
 */

import {
  CHART_COLORS,
  CHART_COLORS_HEX,
  getStatusColor,
  getSeverityColor,
  getPriorityColor,
  getMetricColor,
  getSentimentColor,
  getInsightTypeColor,
  getQualityScoreColor,
  getBadgeClass,
  getEffectivenessBadgeClass,
  getCategoryStyle,
  getDocumentStatusStyle,
  getUserStatusStyle,
  getRoleBadgeStyle,
  getAlertTypeStyle,
  getSeverityBadgeStyle,
  getAuditStatusStyle,
  getHealthStyle,
  getModelStatusStyle,
  getCollaboratorStatusColor,
  getCollaboratorRoleStyle,
  getWorkflowStatusStyle,
  getGuidelineCategoryStyle,
  getProjectStatusStyle,
  getPriorityStyle,
  getFileTypeStyle,
} from '../themeColors';

describe('themeColors', () => {
  describe('CHART_COLORS', () => {
    it('returns 5 CSS var strings', () => {
      expect(CHART_COLORS).toHaveLength(5);
      CHART_COLORS.forEach((c) => {
        expect(c).toMatch(/^var\(--/);
      });
    });
  });

  describe('CHART_COLORS_HEX', () => {
    it('returns 5 hex strings', () => {
      expect(CHART_COLORS_HEX).toHaveLength(5);
      CHART_COLORS_HEX.forEach((c) => {
        expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('getStatusColor', () => {
    it('returns success for good/success/healthy/up/low', () => {
      expect(getStatusColor('good')).toBe('var(--accent-success)');
      expect(getStatusColor('success')).toBe('var(--accent-success)');
      expect(getStatusColor('healthy')).toBe('var(--accent-success)');
      expect(getStatusColor('up')).toBe('var(--accent-success)');
      expect(getStatusColor('low')).toBe('var(--accent-success)');
    });
    it('returns warning for warning/medium/degraded', () => {
      expect(getStatusColor('warning')).toBe('var(--accent-warning)');
      expect(getStatusColor('degraded')).toBe('var(--accent-warning)');
    });
    it('returns error for error/bad/critical/high/down/unhealthy', () => {
      expect(getStatusColor('error')).toBe('var(--accent-error)');
      expect(getStatusColor('down')).toBe('var(--accent-error)');
      expect(getStatusColor('unhealthy')).toBe('var(--accent-error)');
    });
    it('returns text-tertiary for unknown', () => {
      expect(getStatusColor('unknown')).toBe('var(--text-tertiary)');
      expect(getStatusColor('')).toBe('var(--text-tertiary)');
    });
  });

  describe('getSeverityColor', () => {
    it('maps low→success, medium→warning, high→error, critical→secondary', () => {
      expect(getSeverityColor('low')).toBe('var(--accent-success)');
      expect(getSeverityColor('medium')).toBe('var(--accent-warning)');
      expect(getSeverityColor('high')).toBe('var(--accent-error)');
      expect(getSeverityColor('critical')).toBe('var(--accent-secondary)');
    });
    it('returns text-tertiary for unknown severity', () => {
      expect(getSeverityColor('unknown')).toBe('var(--text-tertiary)');
    });
  });

  describe('getPriorityColor', () => {
    it('maps high→error, medium→warning, low→success', () => {
      expect(getPriorityColor('high')).toBe('var(--accent-error)');
      expect(getPriorityColor('medium')).toBe('var(--accent-warning)');
      expect(getPriorityColor('low')).toBe('var(--accent-success)');
    });
    it('returns text-secondary for unknown priority', () => {
      expect(getPriorityColor('unknown')).toBe('var(--text-secondary)');
    });
  });

  describe('getMetricColor', () => {
    it('returns error when value >= threshold', () => {
      expect(getMetricColor(80, 80)).toBe('var(--accent-error)');
      expect(getMetricColor(100, 80)).toBe('var(--accent-error)');
    });
    it('returns warning when value >= 0.7*threshold', () => {
      expect(getMetricColor(56, 80)).toBe('var(--accent-warning)');
      expect(getMetricColor(79, 80)).toBe('var(--accent-warning)');
    });
    it('returns success when value < 0.7*threshold', () => {
      expect(getMetricColor(0, 80)).toBe('var(--accent-success)');
      expect(getMetricColor(55, 80)).toBe('var(--accent-success)');
    });
  });

  describe('getSentimentColor', () => {
    it('maps known labels to theme vars', () => {
      expect(getSentimentColor('긍정')).toBe('var(--accent-success)');
      expect(getSentimentColor('부정')).toBe('var(--accent-error)');
      expect(getSentimentColor('positive')).toBe('var(--accent-success)');
      expect(getSentimentColor('negative')).toBe('var(--accent-error)');
      expect(getSentimentColor('neutral')).toBe('var(--text-tertiary)');
      expect(getSentimentColor('question')).toBe('var(--accent-warning)');
      expect(getSentimentColor('greeting')).toBe('var(--accent-info)');
      expect(getSentimentColor('gratitude')).toBe('var(--accent-success)');
    });
    it('returns text-secondary for unknown', () => {
      expect(getSentimentColor('unknown')).toBe('var(--text-secondary)');
    });
  });

  describe('getInsightTypeColor', () => {
    it('maps pattern/anomaly/prediction/recommendation/opportunity/risk/improvement/trend', () => {
      expect(getInsightTypeColor('pattern')).toBe('var(--accent-info)');
      expect(getInsightTypeColor('anomaly')).toBe('var(--accent-warning)');
      expect(getInsightTypeColor('prediction')).toBe('var(--accent-success)');
      expect(getInsightTypeColor('recommendation')).toBe('var(--accent-secondary)');
      expect(getInsightTypeColor('opportunity')).toBe('var(--accent-success)');
      expect(getInsightTypeColor('risk')).toBe('var(--accent-error)');
      expect(getInsightTypeColor('improvement')).toBe('var(--accent-info)');
      expect(getInsightTypeColor('trend')).toBe('var(--accent-secondary)');
    });
  });

  describe('getQualityScoreColor', () => {
    it('returns success for score >= 80', () => {
      expect(getQualityScoreColor(80)).toBe('var(--accent-success)');
      expect(getQualityScoreColor(100)).toBe('var(--accent-success)');
    });
    it('returns warning for score >= 60 and < 80', () => {
      expect(getQualityScoreColor(60)).toBe('var(--accent-warning)');
      expect(getQualityScoreColor(79)).toBe('var(--accent-warning)');
    });
    it('returns error for score < 60', () => {
      expect(getQualityScoreColor(0)).toBe('var(--accent-error)');
      expect(getQualityScoreColor(59)).toBe('var(--accent-error)');
    });
  });

  describe('getBadgeClass', () => {
    it('returns bw-badge variant classes', () => {
      expect(getBadgeClass('info')).toBe('bw-badge bw-badge-info');
      expect(getBadgeClass('success')).toBe('bw-badge bw-badge-success');
      expect(getBadgeClass('warning')).toBe('bw-badge bw-badge-warning');
      expect(getBadgeClass('error')).toBe('bw-badge bw-badge-error');
      expect(getBadgeClass('secondary')).toBe('bw-badge bw-badge-secondary');
    });
  });

  describe('getEffectivenessBadgeClass', () => {
    it('returns success for score >= 85', () => {
      expect(getEffectivenessBadgeClass(85)).toBe('bw-badge bw-badge-success');
      expect(getEffectivenessBadgeClass(100)).toBe('bw-badge bw-badge-success');
    });
    it('returns info for score >= 70 and < 85', () => {
      expect(getEffectivenessBadgeClass(70)).toBe('bw-badge bw-badge-info');
      expect(getEffectivenessBadgeClass(84)).toBe('bw-badge bw-badge-info');
    });
    it('returns warning for score >= 55 and < 70', () => {
      expect(getEffectivenessBadgeClass(55)).toBe('bw-badge bw-badge-warning');
      expect(getEffectivenessBadgeClass(69)).toBe('bw-badge bw-badge-warning');
    });
    it('returns error for score < 55', () => {
      expect(getEffectivenessBadgeClass(0)).toBe('bw-badge bw-badge-error');
      expect(getEffectivenessBadgeClass(54)).toBe('bw-badge bw-badge-error');
    });
  });

  describe('getCategoryStyle', () => {
    it('returns style for business/technical/creative/academic/legal/marketing', () => {
      expect(getCategoryStyle('business')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
      expect(getCategoryStyle('technical')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getCategoryStyle('creative')).toEqual({ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' });
      expect(getCategoryStyle('academic')).toEqual({ color: 'var(--accent-orange)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getCategoryStyle('legal')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getCategoryStyle('marketing')).toEqual({ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' });
    });
    it('returns default for unknown', () => {
      expect(getCategoryStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getDocumentStatusStyle', () => {
    it('returns style for draft/review/approved/published', () => {
      expect(getDocumentStatusStyle('draft')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
      expect(getDocumentStatusStyle('review')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getDocumentStatusStyle('approved')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getDocumentStatusStyle('published')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
    });
    it('returns default for unknown status', () => {
      expect(getDocumentStatusStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getUserStatusStyle', () => {
    it('returns style for active/inactive/suspended/pending', () => {
      expect(getUserStatusStyle('active')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getUserStatusStyle('inactive')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
      expect(getUserStatusStyle('suspended')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getUserStatusStyle('pending')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
    });
    it('returns default for unknown status', () => {
      expect(getUserStatusStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getRoleBadgeStyle', () => {
    it('returns style for purple/blue/green/red/yellow/orange', () => {
      expect(getRoleBadgeStyle('purple')).toEqual({ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' });
      expect(getRoleBadgeStyle('blue')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
      expect(getRoleBadgeStyle('green')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getRoleBadgeStyle('red')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getRoleBadgeStyle('yellow')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getRoleBadgeStyle('orange')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
    });
    it('returns default for unknown role', () => {
      expect(getRoleBadgeStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getAlertTypeStyle', () => {
    it('returns style for error/warning/success/info', () => {
      expect(getAlertTypeStyle('error')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getAlertTypeStyle('warning')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getAlertTypeStyle('success')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getAlertTypeStyle('info')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
    });
  });

  describe('getSeverityBadgeStyle', () => {
    it('returns style for critical/high/medium/low', () => {
      expect(getSeverityBadgeStyle('critical')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getSeverityBadgeStyle('high')).toEqual({ color: 'var(--accent-orange)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getSeverityBadgeStyle('medium')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getSeverityBadgeStyle('low')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
    });
  });

  describe('getAuditStatusStyle', () => {
    it('returns style for success/failure/warning', () => {
      expect(getAuditStatusStyle('success')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getAuditStatusStyle('failure')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getAuditStatusStyle('warning')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
    });
    it('returns default for unknown status', () => {
      expect(getAuditStatusStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getHealthStyle', () => {
    it('returns style for excellent/good/warning/critical', () => {
      expect(getHealthStyle('excellent')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getHealthStyle('good')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
      expect(getHealthStyle('warning')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getHealthStyle('critical')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
    });
    it('returns default for unknown health', () => {
      expect(getHealthStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getModelStatusStyle', () => {
    it('returns style for active/training/error/inactive', () => {
      expect(getModelStatusStyle('active')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getModelStatusStyle('training')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getModelStatusStyle('error')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getModelStatusStyle('inactive')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getCollaboratorStatusColor', () => {
    it('returns color for online/away/offline', () => {
      expect(getCollaboratorStatusColor('online')).toBe('var(--accent-success)');
      expect(getCollaboratorStatusColor('away')).toBe('var(--accent-warning)');
      expect(getCollaboratorStatusColor('offline')).toBe('var(--text-tertiary)');
    });
  });

  describe('getCollaboratorRoleStyle', () => {
    it('returns style for owner/admin/editor/viewer', () => {
      expect(getCollaboratorRoleStyle('owner')).toEqual({ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' });
      expect(getCollaboratorRoleStyle('admin')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getCollaboratorRoleStyle('editor')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
      expect(getCollaboratorRoleStyle('viewer')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getWorkflowStatusStyle', () => {
    it('returns style for active/inactive/draft/error', () => {
      expect(getWorkflowStatusStyle('active')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getWorkflowStatusStyle('inactive')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
      expect(getWorkflowStatusStyle('draft')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getWorkflowStatusStyle('error')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
    });
    it('returns default for unknown status', () => {
      expect(getWorkflowStatusStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getGuidelineCategoryStyle', () => {
    it('returns style for general/tone/style/format/constraint/custom', () => {
      expect(getGuidelineCategoryStyle('general')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
      expect(getGuidelineCategoryStyle('tone')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getGuidelineCategoryStyle('style')).toEqual({ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' });
      expect(getGuidelineCategoryStyle('format')).toEqual({ color: 'var(--accent-orange)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getGuidelineCategoryStyle('constraint')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getGuidelineCategoryStyle('custom')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
    it('returns default for unknown category', () => {
      expect(getGuidelineCategoryStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getProjectStatusStyle', () => {
    it('returns style for active/completed/archived', () => {
      expect(getProjectStatusStyle('active')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getProjectStatusStyle('completed')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
      expect(getProjectStatusStyle('archived')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getPriorityStyle', () => {
    it('returns style for high/medium/low', () => {
      expect(getPriorityStyle('high')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getPriorityStyle('medium')).toEqual({ color: 'var(--accent-warning)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getPriorityStyle('low')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getPriorityStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });

  describe('getFileTypeStyle', () => {
    it('returns style for pdf/doc/docx/xls/xlsx/ppt/pptx/image types', () => {
      expect(getFileTypeStyle('pdf')).toEqual({ color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' });
      expect(getFileTypeStyle('doc')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
      expect(getFileTypeStyle('docx')).toEqual({ color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' });
      expect(getFileTypeStyle('xls')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getFileTypeStyle('xlsx')).toEqual({ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' });
      expect(getFileTypeStyle('ppt')).toEqual({ color: 'var(--accent-orange)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getFileTypeStyle('pptx')).toEqual({ color: 'var(--accent-orange)', backgroundColor: 'var(--accent-warning-subtle)' });
      expect(getFileTypeStyle('jpg')).toEqual({ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' });
      expect(getFileTypeStyle('jpeg')).toEqual({ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' });
      expect(getFileTypeStyle('png')).toEqual({ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' });
      expect(getFileTypeStyle('gif')).toEqual({ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' });
    });
    it('returns default for unknown file type', () => {
      expect(getFileTypeStyle('unknown')).toEqual({ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' });
    });
  });
});
