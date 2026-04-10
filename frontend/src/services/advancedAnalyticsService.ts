/**
 * 고급 사용자 행동 분석 시스템
 * 사용자의 상호작용 패턴을 분석하고 개인화된 경험 제공
 */
import { Project, Message } from '../types/project';
import { collaborationService } from './collaborationService';
import { projectKnowledgeService } from './projectKnowledgeService';
import { workflowAutomationService } from './workflowAutomationService';
import { errorLogger, toError } from '../utils/errorLogger';
import {
  ANALYTICS_USER_BEHAVIORS_STORAGE_KEY,
  ANALYTICS_USER_ID_STORAGE_KEY,
  ANALYTICS_USER_PROFILES_STORAGE_KEY,
} from './analyticsPersistenceStorageKeys';

export interface UserBehavior {
  userId: string;
  sessionId: string;
  timestamp: number;
  action: string;
  component: string;
  metadata: Record<string, unknown>;
  duration?: number;
  result?: 'success' | 'failure' | 'partial';
}

export interface UserPattern {
  userId: string;
  pattern: string;
  frequency: number;
  confidence: number;
  lastSeen: number;
  metadata: Record<string, unknown>;
}

export interface AnalyticsInsight {
  type: 'usage' | 'performance' | 'preference' | 'trend';
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
  data: Record<string, unknown>;
}

export interface UserProfile {
  userId: string;
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    aiResponseStyle: 'concise' | 'detailed' | 'conversational';
    notificationLevel: 'low' | 'medium' | 'high';
  };
  behavior: {
    averageSessionDuration: number;
    mostUsedFeatures: string[];
    preferredTimeSlots: string[];
    commonQueries: string[];
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    satisfactionScore: number;
  };
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  target?: number;
  category: 'productivity' | 'quality' | 'collaboration' | 'knowledge' | 'timeline';
  timestamp: Date;
}

export interface TrendData {
  period: string;
  value: number;
  date: Date;
}

export interface TrendAnalysis {
  metric: string;
  data: TrendData[];
  trend: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  correlation: number;
  seasonality?: 'daily' | 'weekly' | 'monthly' | 'none';
  forecast?: number[];
}

export interface PredictiveInsight {
  id: string;
  type: 'completion_time' | 'resource_needs' | 'risk_assessment' | 'quality_prediction' | 'collaboration_impact';
  title: string;
  description: string;
  confidence: number;
  predictedValue: unknown;
  factors: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface ProjectHealthScore {
  overall: number;
  categories: {
    productivity: number;
    collaboration: number;
    knowledge: number;
    timeline: number;
    quality: number;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
  lastUpdated: Date;
}

export interface ComparativeAnalysis {
  projectId: string;
  metrics: {
    [key: string]: {
      current: number;
      average: number;
      percentile: number;
    };
  };
  insights: string[];
  recommendations: string[];
}

class AdvancedAnalyticsService {
  private behaviors: UserBehavior[] = [];
  private patterns: Map<string, UserPattern> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private insights: AnalyticsInsight[] = [];
  private sessionStartTime: number = Date.now();
  private currentSessionId: string = this.generateSessionId();

  constructor() {
    this.initializeAnalytics();
    this.loadUserProfiles();
    this.startPeriodicAnalysis();
  }

  /**
   * 분석 시스템 초기화
   */
  private initializeAnalytics(): void {
    // 세션 시작 기록
    this.recordBehavior('session_start', 'system', {
      sessionId: this.currentSessionId,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // 페이지 언로드 시 세션 종료 기록
    window.addEventListener('beforeunload', () => {
      this.recordBehavior('session_end', 'system', {
        sessionId: this.currentSessionId,
        duration: Date.now() - this.sessionStartTime
      });
    });

    // 사용자 상호작용 이벤트 리스너
    this.setupInteractionListeners();
  }

  /**
   * 상호작용 이벤트 리스너 설정
   */
  private setupInteractionListeners(): void {
    // 클릭 이벤트 추적
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        this.recordBehavior('click', target.tagName.toLowerCase(), {
          elementId: target.id,
          className: target.className,
          textContent: target.textContent?.substring(0, 50),
          position: { x: event.clientX, y: event.clientY }
        });
      }
    });

    // 스크롤 이벤트 추적
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordBehavior('scroll', 'document', {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          documentHeight: document.documentElement.scrollHeight
        });
      }, 100);
    });

    // 키보드 이벤트 추적 (개인정보 제외)
    document.addEventListener('keydown', (event) => {
      if (!this.isSensitiveInput(event.target as HTMLElement)) {
        this.recordBehavior('keydown', 'document', {
          key: event.key,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey
        });
      }
    });
  }

  /**
   * 민감한 입력 필드인지 확인
   */
  private isSensitiveInput(element: HTMLElement): boolean {
    if (!element) return false;

    const sensitiveTypes = ['password', 'email', 'tel', 'number'];
    const sensitiveAttributes = ['data-sensitive', 'autocomplete'];

    if (element.tagName === 'INPUT') {
      const input = element as HTMLInputElement;
      if (sensitiveTypes.includes(input.type)) return true;
    }

    return sensitiveAttributes.some(attr => element.hasAttribute(attr));
  }

  /**
   * 사용자 행동 기록
   */
  recordBehavior(
    action: string,
    component: string,
    metadata: Record<string, unknown> = {},
    duration?: number,
    result?: 'success' | 'failure' | 'partial'
  ): void {
    const behavior: UserBehavior = {
      userId: this.getCurrentUserId(),
      sessionId: this.currentSessionId,
      timestamp: Date.now(),
      action,
      component,
      metadata,
      duration,
      result
    };

    this.behaviors.push(behavior);

    // 로컬 스토리지에 저장 (최대 1000개)
    this.saveBehaviors();

    // 패턴 분석 트리거
    this.analyzePatterns();
  }

  /**
   * 패턴 분석
   */
  private analyzePatterns(): void {
    const recentBehaviors = this.behaviors.slice(-50); // 최근 50개 행동만 분석

    // 액션 시퀀스 패턴 분석
    this.analyzeActionSequences(recentBehaviors);

    // 시간 기반 패턴 분석
    this.analyzeTimePatterns(recentBehaviors);

    // 컴포넌트 사용 패턴 분석
    this.analyzeComponentUsage(recentBehaviors);
  }

  /**
   * 액션 시퀀스 패턴 분석
   */
  private analyzeActionSequences(behaviors: UserBehavior[]): void {
    const sequences = this.extractSequences(behaviors, 3); // 3개 액션 시퀀스

    sequences.forEach(sequence => {
      const patternKey = `sequence_${sequence.join('_')}`;
      const existingPattern = this.patterns.get(patternKey);

      if (existingPattern) {
        existingPattern.frequency += 1;
        existingPattern.lastSeen = Date.now();
        existingPattern.confidence = Math.min(existingPattern.confidence + 0.1, 1.0);
      } else {
        this.patterns.set(patternKey, {
          userId: this.getCurrentUserId(),
          pattern: patternKey,
          frequency: 1,
          confidence: 0.3,
          lastSeen: Date.now(),
          metadata: { sequence }
        });
      }
    });
  }

  /**
   * 시간 기반 패턴 분석
   */
  private analyzeTimePatterns(behaviors: UserBehavior[]): void {
    const hourGroups = new Map<number, number>();

    behaviors.forEach(behavior => {
      const hour = new Date(behavior.timestamp).getHours();
      hourGroups.set(hour, (hourGroups.get(hour) || 0) + 1);
    });

    // 가장 활발한 시간대 찾기
    let maxHour = 0;
    let maxCount = 0;

    hourGroups.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = hour;
      }
    });

    const patternKey = `active_hour_${maxHour}`;
    const existingPattern = this.patterns.get(patternKey);

    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.confidence = Math.min(existingPattern.confidence + 0.05, 1.0);
    } else {
      this.patterns.set(patternKey, {
        userId: this.getCurrentUserId(),
        pattern: patternKey,
        frequency: 1,
        confidence: 0.5,
        lastSeen: Date.now(),
        metadata: { activeHour: maxHour, activityCount: maxCount }
      });
    }
  }

  /**
   * 컴포넌트 사용 패턴 분석
   */
  private analyzeComponentUsage(behaviors: UserBehavior[]): void {
    const componentUsage = new Map<string, number>();

    behaviors.forEach(behavior => {
      componentUsage.set(behavior.component, (componentUsage.get(behavior.component) || 0) + 1);
    });

    componentUsage.forEach((count, component) => {
      const patternKey = `component_usage_${component}`;
      const existingPattern = this.patterns.get(patternKey);

      if (existingPattern) {
        existingPattern.frequency += count;
        existingPattern.confidence = Math.min(existingPattern.confidence + 0.02, 1.0);
      } else {
        this.patterns.set(patternKey, {
          userId: this.getCurrentUserId(),
          pattern: patternKey,
          frequency: count,
          confidence: 0.4,
          lastSeen: Date.now(),
          metadata: { component, usageCount: count }
        });
      }
    });
  }

  /**
   * 시퀀스 추출
   */
  private extractSequences(behaviors: UserBehavior[], length: number): string[][] {
    const sequences: string[][] = [];

    for (let i = 0; i <= behaviors.length - length; i++) {
      const sequence = behaviors.slice(i, i + length).map(b => b.action);
      sequences.push(sequence);
    }

    return sequences;
  }

  /**
   * 인사이트 생성
   */
  generateInsights(): AnalyticsInsight[] {
    this.insights = [];

    // 사용 패턴 인사이트
    this.generateUsageInsights();

    // 성능 인사이트
    this.generatePerformanceInsights();

    // 선호도 인사이트
    this.generatePreferenceInsights();

    // 트렌드 인사이트
    this.generateTrendInsights();

    return this.insights;
  }

  /**
   * 사용 패턴 인사이트 생성
   */
  private generateUsageInsights(): void {
    const userProfile = this.getUserProfile();

    // 가장 많이 사용하는 기능
    const mostUsedFeatures = userProfile.behavior.mostUsedFeatures;
    if (mostUsedFeatures.length > 0) {
      this.insights.push({
        type: 'usage',
        title: '자주 사용하는 기능',
        description: `가장 많이 사용하는 기능은 ${mostUsedFeatures[0]}입니다.`,
        confidence: 0.8,
        recommendations: [
          '자주 사용하는 기능을 빠른 접근 메뉴에 추가하는 것을 고려해보세요.',
          '관련 기능들을 함께 그룹화하여 효율성을 높일 수 있습니다.'
        ],
        data: { features: mostUsedFeatures }
      });
    }

    // 선호 시간대
    const preferredTimeSlots = userProfile.behavior.preferredTimeSlots;
    if (preferredTimeSlots.length > 0) {
      this.insights.push({
        type: 'usage',
        title: '활동 시간대',
        description: `주로 ${preferredTimeSlots[0]}에 활동하시는 것으로 보입니다.`,
        confidence: 0.7,
        recommendations: [
          '선호 시간대에 맞춰 알림 설정을 조정해보세요.',
          '이 시간대에 중요한 작업을 계획하는 것을 고려해보세요.'
        ],
        data: { timeSlots: preferredTimeSlots }
      });
    }
  }

  /**
   * 성능 인사이트 생성
   */
  private generatePerformanceInsights(): void {
    const userProfile = this.getUserProfile();

    // 응답 시간 분석
    if (userProfile.performance.averageResponseTime > 2000) {
      this.insights.push({
        type: 'performance',
        title: '응답 시간 개선 필요',
        description: '평균 응답 시간이 2초를 초과하고 있습니다.',
        confidence: 0.9,
        recommendations: [
          '네트워크 연결 상태를 확인해보세요.',
          '복잡한 질문을 더 간단하게 나누어 보세요.',
          '캐시를 활용하여 반복적인 질문의 응답 속도를 개선할 수 있습니다.'
        ],
        data: { responseTime: userProfile.performance.averageResponseTime }
      });
    }

    // 오류율 분석
    if (userProfile.performance.errorRate > 0.1) {
      this.insights.push({
        type: 'performance',
        title: '오류 발생 빈도 높음',
        description: '10% 이상의 요청에서 오류가 발생하고 있습니다.',
        confidence: 0.8,
        recommendations: [
          '입력 형식을 다시 확인해보세요.',
          '파일 크기가 제한을 초과하지 않는지 확인해보세요.',
          '브라우저를 새로고침하여 세션을 초기화해보세요.'
        ],
        data: { errorRate: userProfile.performance.errorRate }
      });
    }
  }

  /**
   * 선호도 인사이트 생성
   */
  private generatePreferenceInsights(): void {
    const userProfile = this.getUserProfile();

    // AI 응답 스타일 선호도
    this.insights.push({
      type: 'preference',
      title: 'AI 응답 스타일',
      description: `현재 ${userProfile.preferences.aiResponseStyle} 스타일의 응답을 선호하고 있습니다.`,
      confidence: 0.6,
      recommendations: [
        '다른 응답 스타일도 시도해보세요.',
        '상황에 따라 응답 스타일을 조정할 수 있습니다.'
      ],
      data: { responseStyle: userProfile.preferences.aiResponseStyle }
    });

    // 테마 선호도
    this.insights.push({
      type: 'preference',
      title: '테마 설정',
      description: `현재 ${userProfile.preferences.theme} 테마를 사용하고 있습니다.`,
      confidence: 0.5,
      recommendations: [
        '자동 테마를 사용하면 시간대에 따라 자동으로 테마가 변경됩니다.',
        '다른 테마를 시도해보세요.'
      ],
      data: { theme: userProfile.preferences.theme }
    });
  }

  /**
   * 트렌드 인사이트 생성
   */
  private generateTrendInsights(): void {
    const recentBehaviors = this.behaviors.slice(-100);
    const olderBehaviors = this.behaviors.slice(-200, -100);

    if (recentBehaviors.length === 0 || olderBehaviors.length === 0) return;

    // 사용량 트렌드
    const recentUsage = recentBehaviors.length;
    const olderUsage = olderBehaviors.length;
    const usageChange = ((recentUsage - olderUsage) / olderUsage) * 100;

    if (Math.abs(usageChange) > 20) {
      this.insights.push({
        type: 'trend',
        title: usageChange > 0 ? '사용량 증가' : '사용량 감소',
        description: `최근 사용량이 ${Math.abs(usageChange).toFixed(1)}% ${usageChange > 0 ? '증가' : '감소'}했습니다.`,
        confidence: 0.7,
        recommendations: usageChange > 0 ? [
          '사용량이 증가하고 있습니다. 새로운 기능을 탐색해보세요.',
          '효율적인 워크플로우를 구축하는 것을 고려해보세요.'
        ] : [
          '사용량이 감소하고 있습니다. 새로운 기능을 시도해보세요.',
          '도움이 필요한 부분이 있다면 문의해주세요.'
        ],
        data: { usageChange, recentUsage, olderUsage }
      });
    }
  }

  /**
   * 사용자 프로필 업데이트
   */
  updateUserProfile(updates: Partial<UserProfile>): void {
    const currentProfile = this.getUserProfile();
    const updatedProfile = { ...currentProfile, ...updates };

    this.userProfiles.set(this.getCurrentUserId(), updatedProfile);
    this.saveUserProfiles();
  }

  /**
   * 사용자 프로필 조회
   */
  getUserProfile(): UserProfile {
    const userId = this.getCurrentUserId();
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = this.createDefaultProfile(userId);
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * 기본 프로필 생성
   */
  private createDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      preferences: {
        language: navigator.language || 'ko-KR',
        theme: 'auto',
        fontSize: 'medium',
        aiResponseStyle: 'conversational',
        notificationLevel: 'medium'
      },
      behavior: {
        averageSessionDuration: 0,
        mostUsedFeatures: [],
        preferredTimeSlots: [],
        commonQueries: []
      },
      performance: {
        averageResponseTime: 0,
        errorRate: 0,
        satisfactionScore: 0
      }
    };
  }

  /**
   * 주기적 분석 시작
   */
  private startPeriodicAnalysis(): void {
    setInterval(() => {
      this.updateUserProfileFromBehaviors();
      this.generateInsights();
    }, 5 * 60 * 1000); // 5분마다 분석
  }

  /**
   * 행동 데이터로부터 프로필 업데이트
   */
  private updateUserProfileFromBehaviors(): void {
    const profile = this.getUserProfile();
    const recentBehaviors = this.behaviors.slice(-100);

    if (recentBehaviors.length === 0) return;

    // 세션 지속 시간 계산
    const sessionDurations = this.calculateSessionDurations();
    if (sessionDurations.length > 0) {
      profile.behavior.averageSessionDuration =
        sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length;
    }

    // 가장 많이 사용하는 기능
    const featureUsage = new Map<string, number>();
    recentBehaviors.forEach(behavior => {
      featureUsage.set(behavior.component, (featureUsage.get(behavior.component) || 0) + 1);
    });

    profile.behavior.mostUsedFeatures = Array.from(featureUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature]) => feature);

    // 선호 시간대
    const hourUsage = new Map<number, number>();
    recentBehaviors.forEach(behavior => {
      const hour = new Date(behavior.timestamp).getHours();
      hourUsage.set(hour, (hourUsage.get(hour) || 0) + 1);
    });

    profile.behavior.preferredTimeSlots = Array.from(hourUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00-${hour + 1}:00`);

    this.updateUserProfile(profile);
  }

  /**
   * 세션 지속 시간 계산
   */
  private calculateSessionDurations(): number[] {
    const sessions = new Map<string, { start: number; end?: number }>();

    this.behaviors.forEach(behavior => {
      if (behavior.action === 'session_start') {
        sessions.set(behavior.sessionId, { start: behavior.timestamp });
      } else if (behavior.action === 'session_end') {
        const session = sessions.get(behavior.sessionId);
        if (session) {
          session.end = behavior.timestamp;
        }
      }
    });

    return Array.from(sessions.values())
      .filter(session => session.end)
      .map(session => session.end! - session.start);
  }

  /**
   * 유틸리티 메서드들
   */
  private getCurrentUserId(): string {
    return localStorage.getItem(ANALYTICS_USER_ID_STORAGE_KEY) || 'anonymous';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveBehaviors(): void {
    if (this.behaviors.length > 1000) {
      this.behaviors = this.behaviors.slice(-1000);
    }
    localStorage.setItem(ANALYTICS_USER_BEHAVIORS_STORAGE_KEY, JSON.stringify(this.behaviors));
  }

  private saveUserProfiles(): void {
    const profiles = Object.fromEntries(this.userProfiles);
    localStorage.setItem(ANALYTICS_USER_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  }

  private loadUserProfiles(): void {
    try {
      const saved = localStorage.getItem(ANALYTICS_USER_PROFILES_STORAGE_KEY);
      if (saved) {
        const profiles = JSON.parse(saved);
        this.userProfiles = new Map(Object.entries(profiles));
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.warn('사용자 프로필 로드 실패', {
        component: 'advancedAnalyticsService',
        action: 'loadUserProfiles',
        error: err.message,
      });
    }
  }

  /**
   * 분석 데이터 내보내기
   */
  exportAnalyticsData(): {
    behaviors: UserBehavior[];
    patterns: UserPattern[];
    profile: UserProfile;
    insights: AnalyticsInsight[];
  } {
    return {
      behaviors: [...this.behaviors],
      patterns: Array.from(this.patterns.values()),
      profile: this.getUserProfile(),
      insights: [...this.insights]
    };
  }

  /**
   * 분석 데이터 초기화
   */
  clearAnalyticsData(): void {
    this.behaviors = [];
    this.patterns.clear();
    this.insights = [];
    localStorage.removeItem(ANALYTICS_USER_BEHAVIORS_STORAGE_KEY);
    localStorage.removeItem(ANALYTICS_USER_PROFILES_STORAGE_KEY);
  }

  // 성과 지표 계산
  calculatePerformanceMetrics(projectId: string): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];

    // 생산성 지표
    const productivityMetrics = this.calculateProductivityMetrics(projectId);
    metrics.push(...productivityMetrics);

    // 협업 지표
    const collaborationMetrics = this.calculateCollaborationMetrics(projectId);
    metrics.push(...collaborationMetrics);

    // 지식 지표
    const knowledgeMetrics = this.calculateKnowledgeMetrics(projectId);
    metrics.push(...knowledgeMetrics);

    // 품질 지표
    const qualityMetrics = this.calculateQualityMetrics(projectId);
    metrics.push(...qualityMetrics);

    return metrics;
  }

  private calculateProductivityMetrics(projectId: string): PerformanceMetric[] {
    void collaborationService.getProjectComments(projectId);
    const messages = this.getAllProjectMessages(projectId);
    const workflows = workflowAutomationService.getProjectWorkflows(projectId);

    const totalMessages = messages.length;
    const avgMessagesPerDay = this.calculateAverageMessagesPerDay(messages);
    const workflowCompletionRate = this.calculateWorkflowCompletionRate(workflows as unknown as Record<string, unknown>[]);

    return [
      {
        id: this.generateId(),
        name: '총 메시지 수',
        value: totalMessages,
        unit: '개',
        trend: this.calculateTrend(totalMessages, this.getPreviousPeriodValue(projectId, 'total_messages')),
        changePercent: this.calculateChangePercent(totalMessages, this.getPreviousPeriodValue(projectId, 'total_messages')),
        category: 'productivity',
        timestamp: new Date()
      },
      {
        id: this.generateId(),
        name: '일평균 메시지',
        value: avgMessagesPerDay,
        unit: '개/일',
        trend: 'stable',
        changePercent: 0,
        category: 'productivity',
        timestamp: new Date()
      },
      {
        id: this.generateId(),
        name: '워크플로우 완료율',
        value: workflowCompletionRate,
        unit: '%',
        trend: workflowCompletionRate > 80 ? 'up' : workflowCompletionRate < 50 ? 'down' : 'stable',
        changePercent: 0,
        target: 90,
        category: 'productivity',
        timestamp: new Date()
      }
    ];
  }

  private calculateCollaborationMetrics(projectId: string): PerformanceMetric[] {
    const users = collaborationService.getProjectUsers(projectId);
    const comments = collaborationService.getProjectComments(projectId);
    const mentions = collaborationService.getProjectMentions(projectId);

    const activeUsers = users.filter(u => {
      const lastActive = new Date(u.lastActive);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActive > oneWeekAgo;
    }).length;

    const collaborationScore = this.calculateCollaborationScore(comments, mentions, users.length);

    return [
      {
        id: this.generateId(),
        name: '활성 사용자',
        value: activeUsers,
        unit: '명',
        trend: activeUsers > users.length * 0.7 ? 'up' : activeUsers < users.length * 0.3 ? 'down' : 'stable',
        changePercent: 0,
        category: 'collaboration',
        timestamp: new Date()
      },
      {
        id: this.generateId(),
        name: '협업 점수',
        value: collaborationScore,
        unit: '점',
        trend: collaborationScore > 80 ? 'up' : collaborationScore < 50 ? 'down' : 'stable',
        changePercent: 0,
        target: 85,
        category: 'collaboration',
        timestamp: new Date()
      },
      {
        id: this.generateId(),
        name: '멘션 응답률',
        value: this.calculateMentionResponseRate(mentions as unknown as Record<string, unknown>[]),
        unit: '%',
        trend: 'stable',
        changePercent: 0,
        category: 'collaboration',
        timestamp: new Date()
      }
    ];
  }

  private calculateKnowledgeMetrics(projectId: string): PerformanceMetric[] {
    const knowledge = projectKnowledgeService.getProjectKnowledge(projectId);
    void projectKnowledgeService.getKnowledgeAnalytics(projectId);

    const knowledgeGrowthRate = this.calculateKnowledgeGrowthRate(knowledge as unknown as Record<string, unknown>[]);
    const knowledgeQualityScore = this.calculateKnowledgeQualityScore(knowledge as unknown as Record<string, unknown>[]);

    return [
      {
        id: this.generateId(),
        name: '지식베이스 크기',
        value: knowledge.length,
        unit: '개',
        trend: knowledgeGrowthRate > 0 ? 'up' : 'stable',
        changePercent: knowledgeGrowthRate,
        category: 'knowledge',
        timestamp: new Date()
      },
      {
        id: this.generateId(),
        name: '지식 품질 점수',
        value: knowledgeQualityScore,
        unit: '점',
        trend: knowledgeQualityScore > 80 ? 'up' : knowledgeQualityScore < 60 ? 'down' : 'stable',
        changePercent: 0,
        target: 85,
        category: 'knowledge',
        timestamp: new Date()
      },
      {
        id: this.generateId(),
        name: '지식 활용도',
        value: this.calculateKnowledgeUtilization(knowledge as unknown as Record<string, unknown>[]),
        unit: '%',
        trend: 'stable',
        changePercent: 0,
        category: 'knowledge',
        timestamp: new Date()
      }
    ];
  }

  private calculateQualityMetrics(projectId: string): PerformanceMetric[] {
    const messages = this.getAllProjectMessages(projectId);
    const knowledge = projectKnowledgeService.getProjectKnowledge(projectId);

    const messageQualityScore = this.calculateMessageQualityScore(messages);
    const knowledgeAccuracyScore = this.calculateKnowledgeAccuracyScore(knowledge as unknown as Record<string, unknown>[]);

    return [
      {
        id: this.generateId(),
        name: '메시지 품질 점수',
        value: messageQualityScore,
        unit: '점',
        trend: messageQualityScore > 80 ? 'up' : messageQualityScore < 60 ? 'down' : 'stable',
        changePercent: 0,
        target: 85,
        category: 'quality',
        timestamp: new Date()
      },
      {
        id: this.generateId(),
        name: '지식 정확도',
        value: knowledgeAccuracyScore,
        unit: '%',
        trend: knowledgeAccuracyScore > 90 ? 'up' : knowledgeAccuracyScore < 70 ? 'down' : 'stable',
        changePercent: 0,
        target: 95,
        category: 'quality',
        timestamp: new Date()
      }
    ];
  }

  // 트렌드 분석
  analyzeTrends(projectId: string, metric: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): TrendAnalysis {
    const data = this.getHistoricalData(projectId, metric, period);
    const trend = this.calculateTrendDirection(data);
    const slope = this.calculateTrendSlope(data);
    const correlation = this.calculateCorrelation(data);
    const seasonality = this.detectSeasonality(data);
    const forecast = this.generateForecast(data, 7); // 7일 예측

    return {
      metric,
      data,
      trend,
      slope,
      correlation,
      seasonality,
      forecast
    };
  }

  // 예측 인사이트 생성
  generatePredictiveInsights(projectId: string): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // 완료 시간 예측
    const completionTimeInsight = this.predictCompletionTime(projectId);
    if (completionTimeInsight) insights.push(completionTimeInsight);

    // 리소스 필요성 예측
    const resourceInsight = this.predictResourceNeeds(projectId);
    if (resourceInsight) insights.push(resourceInsight);

    // 위험도 평가
    const riskInsight = this.assessProjectRisks(projectId);
    if (riskInsight) insights.push(riskInsight);

    // 품질 예측
    const qualityInsight = this.predictQualityOutcome(projectId);
    if (qualityInsight) insights.push(qualityInsight);

    return insights;
  }

  // 프로젝트 건강도 점수 계산
  calculateProjectHealthScore(projectId: string): ProjectHealthScore {
    const metrics = this.calculatePerformanceMetrics(projectId);

    const productivityScore = this.calculateCategoryScore(metrics, 'productivity');
    const collaborationScore = this.calculateCategoryScore(metrics, 'collaboration');
    const knowledgeScore = this.calculateCategoryScore(metrics, 'knowledge');
    const timelineScore = this.calculateTimelineScore(projectId);
    const qualityScore = this.calculateCategoryScore(metrics, 'quality');

    const overall = (productivityScore + collaborationScore + knowledgeScore + timelineScore + qualityScore) / 5;

    const factors = this.identifyHealthFactors(metrics, projectId);
    const recommendations = this.generateHealthRecommendations(overall, factors);

    return {
      overall: Math.round(overall),
      categories: {
        productivity: Math.round(productivityScore),
        collaboration: Math.round(collaborationScore),
        knowledge: Math.round(knowledgeScore),
        timeline: Math.round(timelineScore),
        quality: Math.round(qualityScore)
      },
      factors,
      recommendations,
      lastUpdated: new Date()
    };
  }

  // 비교 분석
  performComparativeAnalysis(projectId: string): ComparativeAnalysis {
    const currentMetrics = this.calculatePerformanceMetrics(projectId);
    const allProjects = this.getAllProjects();
    const averageMetrics = this.calculateAverageMetrics(allProjects);

    const comparativeMetrics: Record<string, { current: number; average: number; percentile: number }> = {};

    currentMetrics.forEach(metric => {
      const average = averageMetrics[metric.name] || 0;
      const percentile = this.calculatePercentile(metric.value, allProjects, metric.name);

      comparativeMetrics[metric.name] = {
        current: metric.value,
        average,
        percentile
      };
    });

    const insights = this.generateComparativeInsights(comparativeMetrics);
    const recommendations = this.generateComparativeRecommendations(comparativeMetrics);

    return {
      projectId,
      metrics: comparativeMetrics,
      insights,
      recommendations
    };
  }

  // 유틸리티 메서드들
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getAllProjectMessages(_projectId: string): Message[] {
    // 실제 구현에서는 프로젝트의 모든 대화에서 메시지를 가져와야 함
    return [];
  }

  private calculateAverageMessagesPerDay(messages: Message[]): number {
    if (messages.length === 0) return 0;

    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const daysDiff = (lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime()) / (1000 * 60 * 60 * 24);

    return Math.round(messages.length / Math.max(daysDiff, 1));
  }

  private calculateWorkflowCompletionRate(workflows: Record<string, unknown>[]): number {
    if (workflows.length === 0) return 0;

    const completedWorkflows = workflows.filter(w => (w as Record<string, unknown>).status === 'completed').length;
    return Math.round((completedWorkflows / workflows.length) * 100);
  }

  private calculateCollaborationScore(comments: unknown[], mentions: unknown[], totalUsers: number): number {
    const commentScore = Math.min(comments.length * 2, 40); // 최대 40점
    const mentionScore = Math.min(mentions.length * 3, 30); // 최대 30점
    const userEngagementScore = Math.min(totalUsers * 5, 30); // 최대 30점

    return commentScore + mentionScore + userEngagementScore;
  }

  private calculateMentionResponseRate(mentions: Record<string, unknown>[]): number {
    if (mentions.length === 0) return 0;

    const respondedMentions = mentions.filter(m => (m as Record<string, unknown>).isRead).length;
    return Math.round((respondedMentions / mentions.length) * 100);
  }

  private calculateKnowledgeGrowthRate(_knowledge: unknown[]): number {
    // 지식 성장률 계산 로직
    return 0;
  }

  private calculateKnowledgeQualityScore(knowledge: Record<string, unknown>[]): number {
    if (knowledge.length === 0) return 0;

    const totalConfidence = knowledge.reduce((sum, k) => sum + ((k as Record<string, unknown>).confidence as number ?? 0.5), 0);
    return Math.round((totalConfidence / knowledge.length) * 100);
  }

  private calculateKnowledgeUtilization(knowledge: Record<string, unknown>[]): number {
    if (knowledge.length === 0) return 0;

    const accessedKnowledge = knowledge.filter(k => ((k as Record<string, unknown>).accessCount as number) > 0).length;
    return Math.round((accessedKnowledge / knowledge.length) * 100);
  }

  private calculateMessageQualityScore(messages: Message[]): number {
    if (messages.length === 0) return 0;

    // 메시지 품질 점수 계산 로직 (길이, 내용 품질 등)
    return 75; // 임시 값
  }

  private calculateKnowledgeAccuracyScore(knowledge: Record<string, unknown>[]): number {
    if (knowledge.length === 0) return 0;

    const highConfidenceKnowledge = knowledge.filter(k => ((k as Record<string, unknown>).confidence as number ?? 0) > 0.8).length;
    return Math.round((highConfidenceKnowledge / knowledge.length) * 100);
  }

  private calculateTrend(currentValue: number, previousValue: number): 'up' | 'down' | 'stable' {
    if (currentValue > previousValue * 1.1) return 'up';
    if (currentValue < previousValue * 0.9) return 'down';
    return 'stable';
  }

  private calculateChangePercent(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  private getPreviousPeriodValue(_projectId: string, _metric: string): number {
    // 이전 기간 값 조회 로직
    return 0;
  }

  private getHistoricalData(_projectId: string, _metric: string, _period: string): TrendData[] {
    // 히스토리 데이터 조회 로직
    return [];
  }

  private calculateTrendDirection(data: TrendData[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';

    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;

    if (lastValue > firstValue * 1.05) return 'increasing';
    if (lastValue < firstValue * 0.95) return 'decreasing';
    return 'stable';
  }

  private calculateTrendSlope(data: TrendData[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateCorrelation(data: TrendData[]): number {
    if (data.length < 2) return 0;

    const values = data.map(d => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    return Math.sqrt(variance) / mean; // 변동계수
  }

  private detectSeasonality(_data: TrendData[]): 'daily' | 'weekly' | 'monthly' | 'none' {
    // 계절성 감지 로직
    return 'none';
  }

  private generateForecast(data: TrendData[], periods: number): number[] {
    if (data.length < 2) return [];

    const slope = this.calculateTrendSlope(data);
    const lastValue = data[data.length - 1].value;
    const forecast: number[] = [];

    for (let i = 1; i <= periods; i++) {
      forecast.push(Math.max(0, lastValue + slope * i));
    }

    return forecast;
  }

  private predictCompletionTime(_projectId: string): PredictiveInsight | null {
    // 완료 시간 예측 로직
    return {
      id: this.generateId(),
      type: 'completion_time',
      title: '예상 완료 시간',
      description: '현재 진행 속도를 기반으로 한 완료 시간 예측',
      confidence: 0.75,
      predictedValue: '2주 후',
      factors: ['메시지 활동량', '워크플로우 진행률', '팀 협업도'],
      recommendations: ['일일 스탠드업 미팅 추가', '마일스톤 설정'],
      timestamp: new Date()
    };
  }

  private predictResourceNeeds(_projectId: string): PredictiveInsight | null {
    // 리소스 필요성 예측 로직
    return {
      id: this.generateId(),
      type: 'resource_needs',
      title: '추가 리소스 필요성',
      description: '프로젝트 완료를 위한 추가 리소스 분석',
      confidence: 0.8,
      predictedValue: '개발자 1명 추가 필요',
      factors: ['작업량 증가', '기술적 복잡성', '일정 압박'],
      recommendations: ['외부 개발자 고용', '우선순위 재조정'],
      timestamp: new Date()
    };
  }

  private assessProjectRisks(_projectId: string): PredictiveInsight | null {
    // 위험도 평가 로직
    return {
      id: this.generateId(),
      type: 'risk_assessment',
      title: '프로젝트 위험도 평가',
      description: '현재 프로젝트의 주요 위험 요소 분석',
      confidence: 0.85,
      predictedValue: '중간 위험도',
      factors: ['일정 지연 가능성', '기술적 도전', '팀 의존성'],
      recommendations: ['리스크 관리 계획 수립', '백업 계획 준비'],
      timestamp: new Date()
    };
  }

  private predictQualityOutcome(_projectId: string): PredictiveInsight | null {
    // 품질 결과 예측 로직
    return {
      id: this.generateId(),
      type: 'quality_prediction',
      title: '품질 결과 예측',
      description: '프로젝트 완료 시 예상되는 품질 수준',
      confidence: 0.7,
      predictedValue: '높은 품질',
      factors: ['코드 품질', '테스트 커버리지', '문서화 수준'],
      recommendations: ['코드 리뷰 강화', '자동화 테스트 추가'],
      timestamp: new Date()
    };
  }

  private calculateCategoryScore(metrics: PerformanceMetric[], category: string): number {
    const categoryMetrics = metrics.filter(m => m.category === category);
    if (categoryMetrics.length === 0) return 0;

    const totalScore = categoryMetrics.reduce((sum, metric) => {
      const normalizedValue = Math.min(metric.value / (metric.target || 100), 1);
      return sum + normalizedValue * 100;
    }, 0);

    return totalScore / categoryMetrics.length;
  }

  private calculateTimelineScore(_projectId: string): number {
    // 타임라인 점수 계산 로직
    return 80; // 임시 값
  }

  private identifyHealthFactors(metrics: PerformanceMetric[], _projectId: string): { positive: string[]; negative: string[] } {
    const positive: string[] = [];
    const negative: string[] = [];

    metrics.forEach(metric => {
      if (metric.trend === 'up' && metric.value > (metric.target || 80)) {
        positive.push(`${metric.name}이 목표를 초과 달성`);
      } else if (metric.trend === 'down' || metric.value < (metric.target || 60)) {
        negative.push(`${metric.name} 개선 필요`);
      }
    });

    return { positive, negative };
  }

  private generateHealthRecommendations(overallScore: number, factors: { positive: string[]; negative: string[] }): string[] {
    const recommendations: string[] = [];

    if (overallScore < 60) {
      recommendations.push('전체적인 프로젝트 상태 개선이 필요합니다');
    }

    if (factors.negative.length > factors.positive.length) {
      recommendations.push('부정적 요소들을 우선적으로 해결하세요');
    }

    if (factors.negative.includes('협업 점수 개선 필요')) {
      recommendations.push('팀 협업 활동을 늘리고 소통을 강화하세요');
    }

    return recommendations;
  }

  private getAllProjects(): Project[] {
    // 모든 프로젝트 조회 로직
    return [];
  }

  private calculateAverageMetrics(_projects: Project[]): { [key: string]: number } {
    // 평균 지표 계산 로직
    return {};
  }

  private calculatePercentile(_value: number, _projects: Project[], _metric: string): number {
    // 백분위 계산 로직
    return 50; // 임시 값
  }

  private generateComparativeInsights(metrics: Record<string, { current: number; average: number; percentile: number }>): string[] {
    const insights: string[] = [];

    Object.entries(metrics).forEach(([metric, data]) => {
      if (data.percentile > 80) {
        insights.push(`${metric}이 상위 20%에 속합니다`);
      } else if (data.percentile < 20) {
        insights.push(`${metric}이 하위 20%에 속합니다`);
      }
    });

    return insights;
  }

  private generateComparativeRecommendations(metrics: Record<string, { current: number; average: number; percentile: number }>): string[] {
    const recommendations: string[] = [];

    Object.entries(metrics).forEach(([metric, data]) => {
      if (data.current < data.average) {
        recommendations.push(`${metric}을 평균 수준으로 향상시키세요`);
      }
    });

    return recommendations;
  }
}

export {
  ANALYTICS_USER_BEHAVIORS_STORAGE_KEY,
  ANALYTICS_USER_ID_STORAGE_KEY,
  ANALYTICS_USER_PROFILES_STORAGE_KEY,
} from './analyticsPersistenceStorageKeys';

export const advancedAnalyticsService = new AdvancedAnalyticsService();
export default advancedAnalyticsService;
