/**
 * 고급 AI 분석 및 예측 서비스
 * 사용자 행동 분석, 패턴 인식, 예측 모델링, 개인화 추천 기능 제공
 */

import { errorLogger, toError } from '../utils/errorLogger';
import {
  ANALYTICS_SESSION_START_STORAGE_KEY,
  ANALYTICS_USER_BEHAVIORS_STORAGE_KEY,
  ANALYTICS_USER_ID_STORAGE_KEY,
  analyticsPersonalizationProfileStorageKey,
} from './analyticsPersistenceStorageKeys';
export interface UserBehavior {
  userId: string;
  timestamp: Date;
  action: string;
  category: 'chat' | 'project' | 'file' | 'analysis' | 'security' | 'performance';
  details: {
    query?: string;
    projectId?: string;
    fileType?: string;
    responseTime?: number;
    success?: boolean;
    errorType?: string;
  };
  context: {
    sessionDuration: number;
    previousActions: string[];
    deviceInfo: unknown;
    networkStatus: string;
  };
}

export interface BehaviorPattern {
  id: string;
  userId: string;
  pattern: {
    type: 'usage' | 'preference' | 'error' | 'performance';
    frequency: number;
    timeOfDay: string[];
    dayOfWeek: string[];
    duration: number;
  };
  insights: {
    description: string;
    confidence: number;
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PredictiveModel {
  id: string;
  type: 'user_engagement' | 'error_prediction' | 'performance_optimization' | 'content_recommendation';
  accuracy: number;
  lastTraining: Date;
  nextTraining: Date;
  features: string[];
  predictions: Array<{
    timestamp: Date;
    value: number;
    confidence: number;
  }>;
}

export interface PersonalizationProfile {
  userId: string;
  preferences: {
    uiTheme: 'light' | 'dark' | 'auto';
    language: string;
    responseStyle: 'concise' | 'detailed' | 'technical' | 'casual';
    notificationSettings: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  interests: {
    topics: string[];
    categories: string[];
    keywords: string[];
  };
  behavior: {
    averageSessionDuration: number;
    preferredTimeSlots: string[];
    commonQueries: string[];
    errorPatterns: string[];
  };
  recommendations: {
    suggestedProjects: string[];
    recommendedFeatures: string[];
    optimizationTips: string[];
  };
}

export interface AnalyticsMetrics {
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    retentionRate: number;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    successRate: number;
    systemUptime: number;
  };
  content: {
    totalConversations: number;
    totalProjects: number;
    totalFiles: number;
    popularTopics: string[];
  };
  predictions: {
    nextWeekUsers: number;
    expectedErrors: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
  };
}

class AdvancedAIAnalyticsService {
  private userBehaviors: UserBehavior[] = [];
  private behaviorPatterns: BehaviorPattern[] = [];
  private predictiveModels: PredictiveModel[] = [];
  private personalizationProfiles: Map<string, PersonalizationProfile> = new Map();
  private analyticsMetrics!: AnalyticsMetrics;

  constructor() {
    this.initializeAnalyticsMetrics();
    this.setupBehaviorTracking();
    this.initializePredictiveModels();
  }

  /**
   * 분석 메트릭 초기화
   */
  private initializeAnalyticsMetrics(): void {
    this.analyticsMetrics = {
      userEngagement: {
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        averageSessionDuration: 0,
        retentionRate: 0
      },
      performance: {
        averageResponseTime: 0,
        errorRate: 0,
        successRate: 0,
        systemUptime: 99.9
      },
      content: {
        totalConversations: 0,
        totalProjects: 0,
        totalFiles: 0,
        popularTopics: []
      },
      predictions: {
        nextWeekUsers: 0,
        expectedErrors: 0,
        performanceTrend: 'stable'
      }
    };
  }

  /**
   * 행동 추적 설정
   */
  private setupBehaviorTracking(): void {
    // 페이지 로드 시 추적
    window.addEventListener('load', () => {
      this.trackUserBehavior('page_load', 'analysis', {
        sessionDuration: 0,
        previousActions: [],
        deviceInfo: this.getDeviceInfo(),
        networkStatus: navigator.onLine ? 'online' : 'offline'
      });
    });

    // 사용자 상호작용 추적
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-analytics]')) {
        const action = target.getAttribute('data-analytics');
        this.trackUserBehavior(action || 'click', 'analysis', {
          sessionDuration: this.getSessionDuration(),
          previousActions: this.getRecentActions(),
          deviceInfo: this.getDeviceInfo(),
          networkStatus: navigator.onLine ? 'online' : 'offline'
        });
      }
    });

    // 키보드 입력 추적
    document.addEventListener('keydown', (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        this.trackUserBehavior('keyboard_input', 'analysis', {
          sessionDuration: this.getSessionDuration(),
          previousActions: this.getRecentActions(),
          deviceInfo: this.getDeviceInfo(),
          networkStatus: navigator.onLine ? 'online' : 'offline'
        });
      }
    });
  }

  /**
   * 예측 모델 초기화
   */
  private initializePredictiveModels(): void {
    const models: PredictiveModel[] = [
      {
        id: 'user_engagement_model',
        type: 'user_engagement',
        accuracy: 0.85,
        lastTraining: new Date(),
        nextTraining: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
        features: ['session_duration', 'action_frequency', 'time_of_day', 'day_of_week'],
        predictions: []
      },
      {
        id: 'error_prediction_model',
        type: 'error_prediction',
        accuracy: 0.78,
        lastTraining: new Date(),
        nextTraining: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1일 후
        features: ['error_history', 'user_behavior', 'system_load'],
        predictions: []
      },
      {
        id: 'performance_optimization_model',
        type: 'performance_optimization',
        accuracy: 0.92,
        lastTraining: new Date(),
        nextTraining: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        features: ['response_time', 'memory_usage', 'cpu_usage', 'network_latency'],
        predictions: []
      },
      {
        id: 'content_recommendation_model',
        type: 'content_recommendation',
        accuracy: 0.88,
        lastTraining: new Date(),
        nextTraining: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
        features: ['user_interests', 'query_history', 'project_preferences'],
        predictions: []
      }
    ];

    this.predictiveModels = models;
  }

  /**
   * 사용자 행동 추적
   */
  trackUserBehavior(
    action: string,
    category: UserBehavior['category'],
    context: UserBehavior['context'],
    details?: UserBehavior['details']
  ): void {
    const behavior: UserBehavior = {
      userId: this.getCurrentUserId(),
      timestamp: new Date(),
      action,
      category,
      details: details || {},
      context
    };

    this.userBehaviors.push(behavior);
    this.updateAnalyticsMetrics();
    this.analyzeBehaviorPatterns();
    this.updatePersonalizationProfile(behavior);

    // 로컬 스토리지에 저장
    this.saveBehaviors();
  }

  /**
   * 행동 패턴 분석
   */
  private analyzeBehaviorPatterns(): void {
    const userId = this.getCurrentUserId();
    const userBehaviors = this.userBehaviors.filter(b => b.userId === userId);

    // 사용 패턴 분석
    const usagePattern = this.analyzeUsagePattern(userBehaviors);
    if (usagePattern) {
      this.updateBehaviorPattern(userId, 'usage', usagePattern);
    }

    // 선호도 패턴 분석
    const preferencePattern = this.analyzePreferencePattern(userBehaviors);
    if (preferencePattern) {
      this.updateBehaviorPattern(userId, 'preference', preferencePattern);
    }

    // 오류 패턴 분석
    const errorPattern = this.analyzeErrorPattern(userBehaviors);
    if (errorPattern) {
      this.updateBehaviorPattern(userId, 'error', errorPattern);
    }

    // 성능 패턴 분석
    const performancePattern = this.analyzePerformancePattern(userBehaviors);
    if (performancePattern) {
      this.updateBehaviorPattern(userId, 'performance', performancePattern);
    }
  }

  /**
   * 사용 패턴 분석
   */
  private analyzeUsagePattern(behaviors: UserBehavior[]): Record<string, unknown> | null {
    if (behaviors.length < 10) return null;

    const timeSlots = behaviors.map(b => new Date(b.timestamp).getHours());
    const daysOfWeek = behaviors.map(b => new Date(b.timestamp).getDay());
    const _actions = behaviors.map(b => b.action);
    void _actions;

    const mostActiveHours = this.getMostFrequent(timeSlots, 3);
    const mostActiveDays = this.getMostFrequent(daysOfWeek, 3);
    // const mostCommonActions = this.getMostFrequent(actions, 5);

    return {
      frequency: behaviors.length,
      timeOfDay: mostActiveHours.map(h => `${h}:00`),
      dayOfWeek: mostActiveDays.map(d => this.getDayName(d)),
      duration: behaviors.reduce((sum, b) => sum + b.context.sessionDuration, 0) / behaviors.length
    };
  }

  /**
   * 선호도 패턴 분석
   */
  private analyzePreferencePattern(behaviors: UserBehavior[]): Record<string, unknown> {
    const categories = behaviors.map(b => b.category);
    const queries = behaviors.filter(b => b.details.query).map(b => b.details.query!);
    const projects = behaviors.filter(b => b.details.projectId).map(b => b.details.projectId!);

    const preferredCategories = this.getMostFrequent(categories, 3);
    const commonQueries = this.getMostFrequent(queries, 5);
    const activeProjects = this.getMostFrequent(projects, 3);

    return {
      frequency: behaviors.length,
      timeOfDay: [],
      dayOfWeek: [],
      duration: 0,
      preferences: {
        categories: preferredCategories,
        queries: commonQueries,
        projects: activeProjects
      }
    };
  }

  /**
   * 오류 패턴 분석
   */
  private analyzeErrorPattern(behaviors: UserBehavior[]): Record<string, unknown> | null {
    const errorBehaviors = behaviors.filter(b => !b.details.success);
    if (errorBehaviors.length === 0) return null;

    const errorTypes = errorBehaviors.map(b => b.details.errorType).filter(Boolean);
    const errorTimes = errorBehaviors.map(b => new Date(b.timestamp).getHours());

    const commonErrors = this.getMostFrequent(errorTypes, 3);
    const errorPeakHours = this.getMostFrequent(errorTimes, 3);

    return {
      frequency: errorBehaviors.length,
      timeOfDay: errorPeakHours.map(h => `${h}:00`),
      dayOfWeek: [],
      duration: 0,
      errorTypes: commonErrors
    };
  }

  /**
   * 성능 패턴 분석
   */
  private analyzePerformancePattern(behaviors: UserBehavior[]): Record<string, unknown> | null {
    const performanceBehaviors = behaviors.filter(b => b.details.responseTime);
    if (performanceBehaviors.length === 0) return null;

    const responseTimes = performanceBehaviors.map(b => b.details.responseTime!);
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    const slowResponses = responseTimes.filter(time => time > avgResponseTime * 1.5);
    const fastResponses = responseTimes.filter(time => time < avgResponseTime * 0.5);

    return {
      frequency: performanceBehaviors.length,
      timeOfDay: [],
      dayOfWeek: [],
      duration: avgResponseTime,
      performance: {
        averageResponseTime: avgResponseTime,
        slowResponseRate: slowResponses.length / responseTimes.length,
        fastResponseRate: fastResponses.length / responseTimes.length
      }
    };
  }

  /**
   * 행동 패턴 업데이트
   */
  private updateBehaviorPattern(userId: string, type: string, pattern: Record<string, unknown>): void {
    const existingPattern = this.behaviorPatterns.find(p => p.userId === userId && p.pattern.type === type);

    if (existingPattern) {
      existingPattern.pattern = { ...existingPattern.pattern, ...pattern } as BehaviorPattern['pattern'];
      existingPattern.updatedAt = new Date();
      existingPattern.insights = this.generateInsights(type, pattern);
    } else {
      const newPattern: BehaviorPattern = {
        id: crypto.randomUUID(),
        userId,
        pattern: {
          type: type as BehaviorPattern['pattern']['type'],
          frequency: (pattern.frequency as number) ?? 0,
          timeOfDay: (pattern.timeOfDay as string[]) ?? [],
          dayOfWeek: (pattern.dayOfWeek as string[]) ?? [],
          duration: (pattern.duration as number) ?? 0
        },
        insights: this.generateInsights(type, pattern),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.behaviorPatterns.push(newPattern);
    }
  }

  /**
   * 인사이트 생성
   */
  private generateInsights(type: string, pattern: Record<string, unknown>): BehaviorPattern['insights'] {
    const freq = Number(pattern.frequency) || 0;
    const insights = {
      description: '',
      confidence: Math.min(freq / 10, 1),
      recommendations: [] as string[]
    };

    switch (type) {
      case 'usage':
        insights.description = `사용자는 주로 ${((pattern.timeOfDay as string[]) ?? []).join(', ')} 시간대에 활발하게 활동합니다.`;
        insights.recommendations = [
          '가장 활발한 시간대에 중요한 알림을 설정하세요.',
          '사용 패턴에 맞춰 자동화 기능을 활용하세요.'
        ];
        break;
      case 'preference':
        insights.description = `사용자는 ${((pattern.preferences as { categories?: string[] })?.categories ?? []).join(', ')} 카테고리를 선호합니다.`;
        insights.recommendations = [
          '선호하는 카테고리의 기능을 더 쉽게 접근할 수 있도록 배치하세요.',
          '관련 프로젝트와 콘텐츠를 추천하세요.'
        ];
        break;
      case 'error':
        insights.description = `주요 오류 유형: ${((pattern.errorTypes as string[]) ?? []).join(', ')}`;
        insights.recommendations = [
          '오류가 자주 발생하는 기능을 개선하세요.',
          '사용자에게 오류 해결 가이드를 제공하세요.'
        ];
        break;
      case 'performance':
        insights.description = `평균 응답 시간: ${Number(pattern.duration).toFixed(2)}ms`;
        insights.recommendations = [
          '응답 시간이 느린 기능을 최적화하세요.',
          '사용자에게 성능 개선 팁을 제공하세요.'
        ];
        break;
    }

    return insights;
  }

  /**
   * 개인화 프로필 업데이트
   */
  private updatePersonalizationProfile(behavior: UserBehavior): void {
    const userId = behavior.userId;
    let profile = this.personalizationProfiles.get(userId);

    if (!profile) {
      profile = this.createDefaultProfile(userId);
      this.personalizationProfiles.set(userId, profile);
    }

    // 관심사 업데이트
    if (behavior.details.query) {
      const keywords = this.extractKeywords(behavior.details.query);
      profile.interests.keywords = Array.from(new Set([...profile.interests.keywords, ...keywords]));
    }

    // 행동 패턴 업데이트
    profile.behavior.averageSessionDuration =
      (profile.behavior.averageSessionDuration + behavior.context.sessionDuration) / 2;

    const timeSlot = new Date(behavior.timestamp).getHours().toString();
    if (!profile.behavior.preferredTimeSlots.includes(timeSlot)) {
      profile.behavior.preferredTimeSlots.push(timeSlot);
    }

    if (behavior.details.query) {
      profile.behavior.commonQueries.push(behavior.details.query);
    }

    // 추천 업데이트
    profile.recommendations = this.generateRecommendations(profile);

    this.savePersonalizationProfile(userId);
  }

  /**
   * 기본 프로필 생성
   */
  private createDefaultProfile(userId: string): PersonalizationProfile {
    return {
      userId,
      preferences: {
        uiTheme: 'auto',
        language: 'ko',
        responseStyle: 'detailed',
        notificationSettings: {
          email: true,
          push: true,
          inApp: true
        }
      },
      interests: {
        topics: [],
        categories: [],
        keywords: []
      },
      behavior: {
        averageSessionDuration: 0,
        preferredTimeSlots: [],
        commonQueries: [],
        errorPatterns: []
      },
      recommendations: {
        suggestedProjects: [],
        recommendedFeatures: [],
        optimizationTips: []
      }
    };
  }

  /**
   * 추천 생성
   */
  private generateRecommendations(profile: PersonalizationProfile): PersonalizationProfile['recommendations'] {
    const recommendations = {
      suggestedProjects: [] as string[],
      recommendedFeatures: [] as string[],
      optimizationTips: [] as string[]
    };

    // 관심사 기반 프로젝트 추천
    if (profile.interests.keywords.length > 0) {
      recommendations.suggestedProjects = [
        `${profile.interests.keywords[0]} 관련 프로젝트`,
        '개인화된 분석 프로젝트',
        '최적화된 워크플로우'
      ];
    }

    // 사용 패턴 기반 기능 추천
    if (profile.behavior.averageSessionDuration > 300000) { // 5분 이상
      recommendations.recommendedFeatures = [
        '고급 분석 도구',
        '자동화 기능',
        '성능 모니터링'
      ];
    }

    // 최적화 팁
    recommendations.optimizationTips = [
      '자주 사용하는 기능을 즐겨찾기에 추가하세요.',
      '프로젝트별 템플릿을 활용하세요.',
      '자동 저장 기능을 활성화하세요.'
    ];

    return recommendations;
  }

  /**
   * 예측 모델 실행
   */
  async runPredictions(): Promise<void> {
    for (const model of this.predictiveModels) {
      const prediction = await this.generatePrediction(model);
      model.predictions.push(prediction);
    }
  }

  /**
   * 예측 생성
   */
  private async generatePrediction(model: PredictiveModel): Promise<{ timestamp: Date; value: number; confidence: number }> {
    const timestamp = new Date();
    let value = 0;
    let confidence = 0;

    switch (model.type) {
      case 'user_engagement':
        value = this.predictUserEngagement();
        confidence = 0.85;
        break;
      case 'error_prediction':
        value = this.predictErrors();
        confidence = 0.78;
        break;
      case 'performance_optimization':
        value = this.predictPerformance();
        confidence = 0.92;
        break;
      case 'content_recommendation':
        value = this.predictContentRecommendation();
        confidence = 0.88;
        break;
    }

    return {
      timestamp,
      value,
      confidence
    };
  }

  /**
   * 사용자 참여도 예측
   */
  private predictUserEngagement(): number {
    const recentBehaviors = this.userBehaviors.slice(-100);
    const engagementScore = recentBehaviors.length / 100;
    return Math.min(engagementScore * 100, 100);
  }

  /**
   * 오류 예측
   */
  private predictErrors(): number {
    const recentBehaviors = this.userBehaviors.slice(-50);
    const errorRate = recentBehaviors.filter(b => !b.details.success).length / recentBehaviors.length;
    return errorRate * 100;
  }

  /**
   * 성능 예측
   */
  private predictPerformance(): number {
    const recentBehaviors = this.userBehaviors.filter(b => b.details.responseTime);
    if (recentBehaviors.length === 0) return 85;

    const avgResponseTime = recentBehaviors.reduce((sum, b) => sum + (b.details.responseTime || 0), 0) / recentBehaviors.length;
    return Math.max(100 - (avgResponseTime / 100), 0);
  }

  /**
   * 콘텐츠 추천 예측
   */
  private predictContentRecommendation(): number {
    const profile = this.personalizationProfiles.get(this.getCurrentUserId());
    if (!profile) return 50;

    const interestScore = profile.interests.keywords.length * 10;
    const behaviorScore = profile.behavior.commonQueries.length * 5;
    return Math.min(interestScore + behaviorScore, 100);
  }

  /**
   * 분석 메트릭 업데이트
   */
  private updateAnalyticsMetrics(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 사용자 참여도
    this.analyticsMetrics.userEngagement.dailyActiveUsers =
      new Set(this.userBehaviors.filter(b => b.timestamp > oneDayAgo).map(b => b.userId)).size;

    this.analyticsMetrics.userEngagement.weeklyActiveUsers =
      new Set(this.userBehaviors.filter(b => b.timestamp > oneWeekAgo).map(b => b.userId)).size;

    this.analyticsMetrics.userEngagement.monthlyActiveUsers =
      new Set(this.userBehaviors.filter(b => b.timestamp > oneMonthAgo).map(b => b.userId)).size;

    // 성능 메트릭
    const recentBehaviors = this.userBehaviors.slice(-100);
    const responseTimes = recentBehaviors.filter(b => b.details.responseTime).map(b => b.details.responseTime!);

    if (responseTimes.length > 0) {
      this.analyticsMetrics.performance.averageResponseTime =
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }

    const successCount = recentBehaviors.filter(b => b.details.success).length;
    this.analyticsMetrics.performance.successRate = successCount / recentBehaviors.length;
    this.analyticsMetrics.performance.errorRate = 1 - this.analyticsMetrics.performance.successRate;

    // 콘텐츠 메트릭
    this.analyticsMetrics.content.totalConversations =
      this.userBehaviors.filter(b => b.category === 'chat').length;

    this.analyticsMetrics.content.totalProjects =
      this.userBehaviors.filter(b => b.category === 'project').length;

    this.analyticsMetrics.content.totalFiles =
      this.userBehaviors.filter(b => b.category === 'file').length;

    // 인기 토픽
    const queries = this.userBehaviors.filter(b => b.details.query).map(b => b.details.query!);
    this.analyticsMetrics.content.popularTopics = this.getMostFrequent(queries, 5);

    // 예측 업데이트
    this.updatePredictions();
  }

  /**
   * 예측 업데이트
   */
  private updatePredictions(): void {
    const userEngagementModel = this.predictiveModels.find(m => m.type === 'user_engagement');
    const errorPredictionModel = this.predictiveModels.find(m => m.type === 'error_prediction');

    if (userEngagementModel && userEngagementModel.predictions.length > 0) {
      const latestPrediction = userEngagementModel.predictions[userEngagementModel.predictions.length - 1];
      this.analyticsMetrics.predictions.nextWeekUsers = Math.round(latestPrediction.value);
    }

    if (errorPredictionModel && errorPredictionModel.predictions.length > 0) {
      const latestPrediction = errorPredictionModel.predictions[errorPredictionModel.predictions.length - 1];
      this.analyticsMetrics.predictions.expectedErrors = Math.round(latestPrediction.value);
    }

    // 성능 트렌드 계산
    const performanceModel = this.predictiveModels.find(m => m.type === 'performance_optimization');
    if (performanceModel && performanceModel.predictions.length >= 2) {
      const recent = performanceModel.predictions.slice(-2);
      const trend = recent[1].value - recent[0].value;

      if (trend > 5) this.analyticsMetrics.predictions.performanceTrend = 'improving';
      else if (trend < -5) this.analyticsMetrics.predictions.performanceTrend = 'declining';
      else this.analyticsMetrics.predictions.performanceTrend = 'stable';
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private getCurrentUserId(): string {
    return localStorage.getItem(ANALYTICS_USER_ID_STORAGE_KEY) || 'anonymous';
  }

  private getDeviceInfo(): { userAgent: string; screenSize: string; timezone: string } {
    return {
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private getSessionDuration(): number {
    const sessionStart = localStorage.getItem(ANALYTICS_SESSION_START_STORAGE_KEY);
    if (sessionStart) {
      return Date.now() - parseInt(sessionStart);
    }
    return 0;
  }

  private getRecentActions(): string[] {
    return this.userBehaviors.slice(-5).map(b => b.action);
  }

  private getMostFrequent<T>(array: T[], count: number): T[] {
    const frequency = new Map<T, number>();
    array.forEach(item => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([item]) => item);
  }

  private getDayName(day: number): string {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[day];
  }

  private extractKeywords(text: string): string[] {
    // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 2);
  }

  /**
   * 데이터 저장
   */
  private saveBehaviors(): void {
    try {
      localStorage.setItem(ANALYTICS_USER_BEHAVIORS_STORAGE_KEY, JSON.stringify(this.userBehaviors.slice(-1000)));
    } catch (error) {
      const err = toError(error);
      errorLogger.error('행동 데이터 저장 실패', err, {
        component: 'advancedAIAnalyticsService',
        action: 'saveBehaviors',
        behaviorsCount: this.userBehaviors.length,
      });
    }
  }

  private savePersonalizationProfile(userId: string): void {
    try {
      const profile = this.personalizationProfiles.get(userId);
      if (profile) {
        localStorage.setItem(analyticsPersonalizationProfileStorageKey(userId), JSON.stringify(profile));
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.error('개인화 프로필 저장 실패', err, {
        component: 'advancedAIAnalyticsService',
        action: 'savePersonalizationProfile',
        userId,
      });
    }
  }

  /**
   * 공개 API
   */
  getAnalyticsMetrics(): AnalyticsMetrics {
    return { ...this.analyticsMetrics };
  }

  getBehaviorPatterns(userId?: string): BehaviorPattern[] {
    if (userId) {
      return this.behaviorPatterns.filter(p => p.userId === userId);
    }
    return [...this.behaviorPatterns];
  }

  getPredictiveModels(): PredictiveModel[] {
    return [...this.predictiveModels];
  }

  getPersonalizationProfile(userId: string): PersonalizationProfile | null {
    return this.personalizationProfiles.get(userId) || null;
  }

  getUserBehaviors(userId?: string, limit: number = 100): UserBehavior[] {
    let behaviors = this.userBehaviors;
    if (userId) {
      behaviors = behaviors.filter(b => b.userId === userId);
    }
    return behaviors.slice(-limit);
  }

  /**
   * 서비스 정리
   */
  cleanup(): void {
    this.saveBehaviors();
    this.personalizationProfiles.forEach((profile, userId) => {
      this.savePersonalizationProfile(userId);
    });
  }
}

export {
  ANALYTICS_PERSONALIZATION_KEY_PREFIX,
  ANALYTICS_SESSION_START_STORAGE_KEY,
  ANALYTICS_USER_BEHAVIORS_STORAGE_KEY,
  ANALYTICS_USER_ID_STORAGE_KEY,
  analyticsPersonalizationProfileStorageKey,
} from './analyticsPersistenceStorageKeys';

// 싱글톤 인스턴스
export const advancedAIAnalyticsService = new AdvancedAIAnalyticsService();

export default advancedAIAnalyticsService;
