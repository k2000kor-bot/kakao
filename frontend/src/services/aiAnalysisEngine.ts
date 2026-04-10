import { Project, Chat, Message } from '../types/project';
import { chatService, messageService, projectService } from './projectService';

export interface ProjectInsight {
  id: string;
  type: 'productivity' | 'engagement' | 'quality' | 'trend' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  suggestions: string[];
  metrics?: {
    current: number;
    target: number;
    unit: string;
  };
}

export interface ProjectAnalysis {
  projectId: string;
  analysisDate: Date;
  overallScore: number;
  insights: ProjectInsight[];
  trends: {
    activity: 'increasing' | 'decreasing' | 'stable';
    engagement: 'high' | 'medium' | 'low';
    productivity: number; // 0-100
    quality: number; // 0-100
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    impact: string;
  }[];
}

export interface ConversationPattern {
  pattern: string;
  frequency: number;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export class AIAnalysisEngine {
  private readonly ANALYSIS_CACHE_KEY = 'ai_analysis_cache';
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30분

  // 프로젝트 종합 분석
  async analyzeProject(projectId: string): Promise<ProjectAnalysis> {
    const project = await projectService.getProject(projectId);
    if (!project) {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }

    const chats = chatService.getProjectChats(projectId);
    const allMessages = this.getAllProjectMessages(chats);

    const insights = await this.generateInsights(project, chats, allMessages);
    const trends = this.analyzeTrends(chats, allMessages);
    const recommendations = this.generateRecommendations(project, insights, trends);
    const overallScore = this.calculateOverallScore(insights, trends);

    const analysis: ProjectAnalysis = {
      projectId,
      analysisDate: new Date(),
      overallScore,
      insights,
      trends,
      recommendations
    };

    this.cacheAnalysis(projectId, analysis);
    return analysis;
  }

  // 인사이트 생성
  private async generateInsights(
    project: Project,
    chats: Chat[],
    messages: Message[]
  ): Promise<ProjectInsight[]> {
    const insights: ProjectInsight[] = [];

    // 활동 패턴 분석
    insights.push(...this.analyzeActivityPatterns(chats, messages));

    // 참여도 분석
    insights.push(...this.analyzeEngagement(chats, messages));

    // 품질 분석
    insights.push(...this.analyzeQuality(messages));

    // 진행률 분석
    insights.push(...this.analyzeProgress(project, chats));

    // 협업 패턴 분석
    insights.push(...this.analyzeCollaboration(chats, messages));

    return insights.filter(insight => insight.confidence > 0.6);
  }

  // 활동 패턴 분석
  private analyzeActivityPatterns(chats: Chat[], messages: Message[]): ProjectInsight[] {
    const insights: ProjectInsight[] = [];

    if (messages.length === 0) return insights;

    // 시간대별 활동 분석
    const hourlyActivity = this.getHourlyActivity(messages);
    const peakHour = this.findPeakActivity(hourlyActivity);

    if (peakHour.activity > 0) {
      insights.push({
        id: `activity_peak_${Date.now()}`,
        type: 'productivity',
        title: '활동 패턴 분석',
        description: `가장 활발한 시간대는 ${peakHour.hour}시입니다. 이 시간대에 ${peakHour.activity}개의 메시지가 작성되었습니다.`,
        severity: 'low',
        confidence: 0.8,
        actionable: true,
        suggestions: [
          `${peakHour.hour}시 전후로 중요한 회의나 작업을 계획해보세요`,
          '팀원들의 활동 패턴을 고려한 일정 조정을 권장합니다'
        ]
      });
    }

    // 일별 활동 분석
    const dailyActivity = this.getDailyActivity(messages);
    const inactiveStreak = this.findInactiveStreak(dailyActivity);

    if (inactiveStreak > 3) {
      insights.push({
        id: `inactive_streak_${Date.now()}`,
        type: 'engagement',
        title: '활동 부족 감지',
        description: `${inactiveStreak}일 동안 활동이 없었습니다.`,
        severity: 'high',
        confidence: 0.9,
        actionable: true,
        suggestions: [
          '프로젝트 상태를 점검하고 팀원들과 소통해보세요',
          '정기적인 체크인 미팅을 설정하는 것을 고려해보세요',
          '프로젝트 목표와 우선순위를 재검토해보세요'
        ]
      });
    }

    return insights;
  }

  // 참여도 분석
  private analyzeEngagement(chats: Chat[], messages: Message[]): ProjectInsight[] {
    const insights: ProjectInsight[] = [];

    const avgMessagesPerChat = messages.length / Math.max(chats.length, 1);
    const responseRate = this.calculateResponseRate(messages);

    if (avgMessagesPerChat < 5) {
      insights.push({
        id: `low_engagement_${Date.now()}`,
        type: 'engagement',
        title: '참여도 개선 필요',
        description: `대화당 평균 메시지 수가 ${avgMessagesPerChat.toFixed(1)}개로 낮습니다.`,
        severity: 'medium',
        confidence: 0.7,
        actionable: true,
        suggestions: [
          '더 구체적인 질문으로 대화를 유도해보세요',
          '프로젝트 관련 토론 주제를 제안해보세요',
          '팀원들의 의견을 적극적으로 구해보세요'
        ],
        metrics: {
          current: avgMessagesPerChat,
          target: 10,
          unit: '메시지/대화'
        }
      });
    }

    if (responseRate > 0.8) {
      insights.push({
        id: `high_engagement_${Date.now()}`,
        type: 'engagement',
        title: '높은 참여도',
        description: `응답률이 ${(responseRate * 100).toFixed(1)}%로 매우 높습니다.`,
        severity: 'low',
        confidence: 0.9,
        actionable: false,
        suggestions: [
          '현재의 좋은 소통 패턴을 유지하세요',
          '성공적인 협업 방식을 다른 프로젝트에도 적용해보세요'
        ]
      });
    }

    return insights;
  }

  // 품질 분석
  private analyzeQuality(messages: Message[]): ProjectInsight[] {
    const insights: ProjectInsight[] = [];

    const avgMessageLength = this.calculateAverageMessageLength(messages);
    const questionRatio = this.calculateQuestionRatio(messages);

    if (avgMessageLength < 20) {
      insights.push({
        id: `message_quality_${Date.now()}`,
        type: 'quality',
        title: '메시지 품질 개선',
        description: `평균 메시지 길이가 ${avgMessageLength.toFixed(1)}자로 짧습니다.`,
        severity: 'medium',
        confidence: 0.6,
        actionable: true,
        suggestions: [
          '더 자세하고 구체적인 설명을 포함해보세요',
          '배경 정보와 맥락을 함께 제공해보세요',
          '예시나 구체적인 사례를 들어 설명해보세요'
        ]
      });
    }

    if (questionRatio > 0.4) {
      insights.push({
        id: `high_questions_${Date.now()}`,
        type: 'trend',
        title: '질문 비율 높음',
        description: `전체 메시지의 ${(questionRatio * 100).toFixed(1)}%가 질문입니다.`,
        severity: 'low',
        confidence: 0.8,
        actionable: true,
        suggestions: [
          'FAQ 섹션을 만들어 자주 묻는 질문을 정리해보세요',
          '프로젝트 문서화를 강화하여 정보 접근성을 높여보세요',
          '정기적인 Q&A 세션을 계획해보세요'
        ]
      });
    }

    return insights;
  }

  // 진행률 분석
  private analyzeProgress(project: Project, chats: Chat[]): ProjectInsight[] {
    const insights: ProjectInsight[] = [];

    const totalChats = chats.length;
    const activeChats = chats.filter(chat => (chat as { status?: string }).status === 'active').length;
    const completionRate = totalChats > 0 ? (totalChats - activeChats) / totalChats : 0;

    if (completionRate < 0.3 && totalChats > 5) {
      insights.push({
        id: `low_completion_${Date.now()}`,
        type: 'productivity',
        title: '완료율 개선 필요',
        description: `대화 완료율이 ${(completionRate * 100).toFixed(1)}%로 낮습니다.`,
        severity: 'high',
        confidence: 0.8,
        actionable: true,
        suggestions: [
          '진행 중인 작업들의 우선순위를 재정리해보세요',
          '완료 기준을 명확히 정의해보세요',
          '정기적인 진행 상황 리뷰를 실시해보세요'
        ]
      });
    }

    // 프로젝트 생성 후 경과 시간 분석
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation > 30 && totalChats < 5) {
      insights.push({
        id: `slow_progress_${Date.now()}`,
        type: 'productivity',
        title: '진행 속도 개선 필요',
        description: `프로젝트 생성 후 ${daysSinceCreation}일이 지났지만 활동이 적습니다.`,
        severity: 'medium',
        confidence: 0.7,
        actionable: true,
        suggestions: [
          '프로젝트 목표와 마일스톤을 재검토해보세요',
          '팀원들과의 킥오프 미팅을 계획해보세요',
          '작은 단위의 작업부터 시작해보세요'
        ]
      });
    }

    return insights;
  }

  // 협업 패턴 분석
  private analyzeCollaboration(chats: Chat[], messages: Message[]): ProjectInsight[] {
    const insights: ProjectInsight[] = [];

    const _conversationPatterns = this.findConversationPatterns(messages);
    const collaborationScore = this.calculateCollaborationScore(messages);

    if (collaborationScore < 0.5) {
      insights.push({
        id: `collaboration_${Date.now()}`,
        type: 'engagement',
        title: '협업 개선 기회',
        description: '팀원 간 상호작용을 늘릴 수 있는 기회가 있습니다.',
        severity: 'medium',
        confidence: 0.6,
        actionable: true,
        suggestions: [
          '브레인스토밍 세션을 계획해보세요',
          '코드 리뷰나 문서 검토를 함께 진행해보세요',
          '정기적인 팀 미팅을 설정해보세요'
        ]
      });
    }

    return insights;
  }

  // 트렌드 분석
  private analyzeTrends(chats: Chat[], messages: Message[]): ProjectAnalysis['trends'] {
    const recentMessages = messages.filter(msg =>
      Date.now() - new Date(msg.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000 // 최근 7일
    );

    const olderMessages = messages.filter(msg =>
      Date.now() - new Date(msg.timestamp).getTime() >= 7 * 24 * 60 * 60 * 1000
    );

    const activity = recentMessages.length > olderMessages.length ? 'increasing' :
      recentMessages.length < olderMessages.length ? 'decreasing' : 'stable';

    const engagement = this.calculateEngagementLevel(messages);
    const productivity = this.calculateProductivityScore(chats, messages);
    const quality = this.calculateQualityScore(messages);

    return {
      activity,
      engagement,
      productivity,
      quality
    };
  }

  // 추천사항 생성
  private generateRecommendations(
    project: Project,
    insights: ProjectInsight[],
    trends: ProjectAnalysis['trends']
  ): ProjectAnalysis['recommendations'] {
    const recommendations: ProjectAnalysis['recommendations'] = [];

    // 높은 심각도 인사이트 기반 추천
    const highSeverityInsights = insights.filter(i => i.severity === 'high');
    highSeverityInsights.forEach(insight => {
      recommendations.push({
        priority: 'high',
        category: insight.type,
        action: insight.suggestions[0] || '즉시 조치가 필요합니다',
        impact: '프로젝트 성공률 향상'
      });
    });

    // 트렌드 기반 추천
    if (trends.activity === 'decreasing') {
      recommendations.push({
        priority: 'medium',
        category: 'engagement',
        action: '팀 활동을 증진시킬 수 있는 이벤트나 미팅을 계획하세요',
        impact: '팀 참여도 및 프로젝트 진행률 개선'
      });
    }

    if (trends.productivity < 50) {
      recommendations.push({
        priority: 'high',
        category: 'productivity',
        action: '작업 프로세스를 재검토하고 병목 지점을 식별하세요',
        impact: '작업 효율성 대폭 개선'
      });
    }

    return recommendations;
  }

  // 종합 점수 계산
  private calculateOverallScore(insights: ProjectInsight[], trends: ProjectAnalysis['trends']): number {
    const severityWeights = { low: 1, medium: 2, high: 3 };
    const totalSeverity = insights.reduce((sum, insight) => sum + severityWeights[insight.severity], 0);
    const maxSeverity = insights.length * 3;

    const insightScore = maxSeverity > 0 ? (1 - totalSeverity / maxSeverity) * 100 : 80;
    const trendScore = (trends.productivity + trends.quality) / 2;

    return Math.round((insightScore * 0.6 + trendScore * 0.4));
  }

  // 유틸리티 메서드들
  private getAllProjectMessages(chats: Chat[]): Message[] {
    return chats.flatMap(chat => messageService.getChatMessages(chat.id));
  }

  private getHourlyActivity(messages: Message[]): { [hour: number]: number } {
    const hourlyActivity: { [hour: number]: number } = {};
    messages.forEach(msg => {
      const hour = new Date(msg.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });
    return hourlyActivity;
  }

  private findPeakActivity(hourlyActivity: { [hour: number]: number }): { hour: number; activity: number } {
    let peakHour = 0;
    let maxActivity = 0;

    Object.entries(hourlyActivity).forEach(([hour, activity]) => {
      if (activity > maxActivity) {
        maxActivity = activity;
        peakHour = parseInt(hour);
      }
    });

    return { hour: peakHour, activity: maxActivity };
  }

  private getDailyActivity(messages: Message[]): { [date: string]: number } {
    const dailyActivity: { [date: string]: number } = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toDateString();
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });
    return dailyActivity;
  }

  private findInactiveStreak(dailyActivity: { [date: string]: number }): number {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toDateString();
      if (dailyActivity[date]) {
        break;
      }
      streak++;
    }

    return streak;
  }

  private calculateResponseRate(messages: Message[]): number {
    if (messages.length < 2) return 0;

    let responses = 0;
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].role !== messages[i - 1].role) {
        responses++;
      }
    }

    return responses / (messages.length - 1);
  }

  private calculateAverageMessageLength(messages: Message[]): number {
    if (messages.length === 0) return 0;
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return totalLength / messages.length;
  }

  private calculateQuestionRatio(messages: Message[]): number {
    if (messages.length === 0) return 0;
    const questions = messages.filter(msg =>
      msg.content.includes('?') ||
      msg.content.includes('어떻게') ||
      msg.content.includes('무엇') ||
      msg.content.includes('왜') ||
      msg.content.includes('언제')
    );
    return questions.length / messages.length;
  }

  private findConversationPatterns(messages: Message[]): ConversationPattern[] {
    // 간단한 패턴 분석 구현
    const patterns: ConversationPattern[] = [];

    // 질문-답변 패턴
    let qaPatterns = 0;
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
        qaPatterns++;
      }
    }

    if (qaPatterns > 0) {
      patterns.push({
        pattern: 'question-answer',
        frequency: qaPatterns,
        context: '사용자 질문에 대한 AI 응답',
        sentiment: 'neutral'
      });
    }

    return patterns;
  }

  private calculateCollaborationScore(messages: Message[]): number {
    // 간단한 협업 점수 계산
    const userMessages = messages.filter(msg => msg.role === 'user').length;
    const assistantMessages = messages.filter(msg => msg.role === 'assistant').length;

    if (userMessages + assistantMessages === 0) return 0;

    const balance = Math.min(userMessages, assistantMessages) / Math.max(userMessages, assistantMessages);
    return balance;
  }

  private calculateEngagementLevel(messages: Message[]): 'high' | 'medium' | 'low' {
    const avgLength = this.calculateAverageMessageLength(messages);
    const responseRate = this.calculateResponseRate(messages);

    const score = (avgLength / 100) * 0.3 + responseRate * 0.7;

    if (score > 0.7) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }

  private calculateProductivityScore(chats: Chat[], messages: Message[]): number {
    const avgMessagesPerChat = messages.length / Math.max(chats.length, 1);
    const completionRate = chats.filter(c => (c as { status?: string }).status !== 'active').length / Math.max(chats.length, 1);

    return Math.min(100, (avgMessagesPerChat * 5) + (completionRate * 50));
  }

  private calculateQualityScore(messages: Message[]): number {
    const avgLength = this.calculateAverageMessageLength(messages);
    const questionRatio = this.calculateQuestionRatio(messages);

    const lengthScore = Math.min(100, avgLength * 2);
    const diversityScore = (1 - questionRatio) * 100;

    return (lengthScore * 0.6 + diversityScore * 0.4);
  }

  // 캐시 관리
  private cacheAnalysis(projectId: string, analysis: ProjectAnalysis): void {
    const cache = this.getAnalysisCache();
    cache[projectId] = {
      analysis,
      timestamp: Date.now()
    };
    localStorage.setItem(this.ANALYSIS_CACHE_KEY, JSON.stringify(cache));
  }

  private getAnalysisCache(): { [projectId: string]: { analysis: ProjectAnalysis; timestamp: number } } {
    try {
      const cache = localStorage.getItem(this.ANALYSIS_CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  }

  // 실시간 인사이트 생성
  async generateRealTimeInsight(projectId: string, newMessage: Message): Promise<ProjectInsight | null> {
    const project = await projectService.getProject(projectId);
    if (!project) return null;

    // 새 메시지 기반 즉시 분석
    if (newMessage.content.length < 10) {
      return {
        id: `realtime_${Date.now()}`,
        type: 'quality',
        title: '메시지 품질 개선',
        description: '더 자세한 설명을 추가하면 더 나은 답변을 받을 수 있습니다.',
        severity: 'low',
        confidence: 0.8,
        actionable: true,
        suggestions: [
          '구체적인 예시나 상황을 포함해보세요',
          '배경 정보를 함께 제공해보세요'
        ]
      };
    }

    return null;
  }
}

export const aiAnalysisEngine = new AIAnalysisEngine();
export default aiAnalysisEngine;
