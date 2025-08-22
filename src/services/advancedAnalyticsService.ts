/**
 * 고급 사용자 행동 분석 시스템
 * 사용자의 상호작용 패턴을 분석하고 개인화된 경험 제공
 */

export interface UserBehavior {
  userId: string;
  sessionId: string;
  timestamp: number;
  action: string;
  component: string;
  metadata: Record<string, any>;
  duration?: number;
  result?: 'success' | 'failure' | 'partial';
}

export interface UserPattern {
  userId: string;
  pattern: string;
  frequency: number;
  confidence: number;
  lastSeen: number;
  metadata: Record<string, any>;
}

export interface AnalyticsInsight {
  type: 'usage' | 'performance' | 'preference' | 'trend';
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
  data: any;
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
      screenResolution: `${screen.width}x${screen.height}`,
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
    metadata: Record<string, any> = {},
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
    return localStorage.getItem('userId') || 'anonymous';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveBehaviors(): void {
    if (this.behaviors.length > 1000) {
      this.behaviors = this.behaviors.slice(-1000);
    }
    localStorage.setItem('userBehaviors', JSON.stringify(this.behaviors));
  }

  private saveUserProfiles(): void {
    const profiles = Object.fromEntries(this.userProfiles);
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
  }

  private loadUserProfiles(): void {
    try {
      const saved = localStorage.getItem('userProfiles');
      if (saved) {
        const profiles = JSON.parse(saved);
        this.userProfiles = new Map(Object.entries(profiles));
      }
    } catch (error) {
      console.warn('사용자 프로필 로드 실패:', error);
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
    localStorage.removeItem('userBehaviors');
    localStorage.removeItem('userProfiles');
  }
}

// 싱글톤 인스턴스
export const advancedAnalyticsService = new AdvancedAnalyticsService();

export default advancedAnalyticsService;
