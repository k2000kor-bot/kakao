import { ChatSession } from '../types/chat';
import { Project, Guideline } from '../types/project';
import { errorLogger, toError } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';

interface PredictionModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'clustering';
  accuracy: number;
  lastUpdated: Date;
  features: string[];
}

interface PredictionResult {
  type: 'trend' | 'behavior' | 'recommendation' | 'risk';
  confidence: number;
  value: unknown;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  slope: number;
  confidence: number;
  prediction: number;
  timeframe: string;
}

interface UserBehaviorPattern {
  userId: string;
  preferredTopics: string[];
  responseTime: number;
  messageLength: number;
  interactionFrequency: number;
  sessionDuration: number;
  commonQuestions: string[];
  sentimentTrend: 'positive' | 'negative' | 'neutral';
}

class PredictiveAnalysisEngine {
  private models: Map<string, PredictionModel> = new Map();
  private userPatterns: Map<string, UserBehaviorPattern> = new Map();
  private readonly STORAGE_KEY = 'predictive_analysis_data';

  constructor() {
    this.initializeModels();
    this.loadData();
  }

  private initializeModels() {
    this.models.set('conversation_trend', {
      id: 'conversation_trend',
      name: '대화 트렌드 예측',
      type: 'regression',
      accuracy: 0.85,
      lastUpdated: new Date(),
      features: ['message_count', 'session_duration', 'topic_diversity', 'sentiment_score']
    });

    this.models.set('user_behavior', {
      id: 'user_behavior',
      name: '사용자 행동 패턴',
      type: 'clustering',
      accuracy: 0.78,
      lastUpdated: new Date(),
      features: ['interaction_frequency', 'response_time', 'message_length', 'topic_preference']
    });

    this.models.set('project_success', {
      id: 'project_success',
      name: '프로젝트 성공률 예측',
      type: 'classification',
      accuracy: 0.82,
      lastUpdated: new Date(),
      features: ['file_count', 'guideline_count', 'conversation_count', 'completion_rate']
    });

    this.models.set('risk_assessment', {
      id: 'risk_assessment',
      name: '리스크 평가',
      type: 'classification',
      accuracy: 0.79,
      lastUpdated: new Date(),
      features: ['error_rate', 'response_time', 'user_satisfaction', 'completion_rate']
    });
  }

  // 대화 트렌드 예측
  async predictConversationTrend(sessions: ChatSession[]): Promise<TrendAnalysis> {
    const recentSessions = sessions.slice(-10);
    const messageCounts = recentSessions.map(s => s.messages.length);

    // 선형 회귀를 통한 트렌드 분석
    const trend = this.calculateLinearTrend(messageCounts);

    return {
      trend: trend.slope > 0.1 ? 'increasing' : trend.slope < -0.1 ? 'decreasing' : 'stable',
      slope: trend.slope,
      confidence: Math.min(0.95, 0.7 + Math.abs(trend.slope) * 2),
      prediction: Math.round(trend.intercept + trend.slope * (messageCounts.length + 1)),
      timeframe: '다음 7일'
    };
  }

  // 사용자 행동 패턴 분석
  async analyzeUserBehavior(userId: string, sessions: ChatSession[]): Promise<UserBehaviorPattern> {
    const userSessions = sessions.filter(s => s.participants?.includes(userId) || true);

    const pattern: UserBehaviorPattern = {
      userId,
      preferredTopics: this.extractPreferredTopics(userSessions),
      responseTime: this.calculateAverageResponseTime(userSessions),
      messageLength: this.calculateAverageMessageLength(userSessions),
      interactionFrequency: this.calculateInteractionFrequency(userSessions),
      sessionDuration: this.calculateAverageSessionDuration(userSessions),
      commonQuestions: this.extractCommonQuestions(userSessions),
      sentimentTrend: this.analyzeSentimentTrend(userSessions)
    };

    this.userPatterns.set(userId, pattern);
    this.saveData();

    return pattern;
  }

  // 프로젝트 성공률 예측
  async predictProjectSuccess(project: Project, sessions: ChatSession[]): Promise<PredictionResult> {
    const projectSessions = sessions.filter(s => s.projectId === project.id);

    const features = {
      fileCount: project.files?.length || 0,
      guidelineCount: project.guidelines?.length || 0,
      conversationCount: projectSessions.length,
      completionRate: this.calculateCompletionRate(projectSessions)
    };

    // 간단한 가중 평균 기반 예측
    const score = (
      features.fileCount * 0.2 +
      features.guidelineCount * 0.2 +
      features.conversationCount * 0.3 +
      features.completionRate * 0.3
    ) / 100;

    const successProbability = Math.min(0.95, Math.max(0.05, score));

    return {
      type: 'recommendation',
      confidence: 0.82,
      value: successProbability,
      description: `프로젝트 성공 확률: ${Math.round(successProbability * 100)}%`,
      actionable: true,
      priority: successProbability > 0.7 ? 'low' : successProbability > 0.4 ? 'medium' : 'high'
    };
  }

  // 리스크 평가
  async assessRisk(sessions: ChatSession[], project: Project | null): Promise<PredictionResult[]> {
    const risks: PredictionResult[] = [];

    // 응답 시간 리스크
    const avgResponseTime = this.calculateAverageResponseTime(sessions);
    if (avgResponseTime > 30000) { // 30초 이상
      risks.push({
        type: 'risk',
        confidence: 0.85,
        value: 'slow_response',
        description: '응답 시간이 평균보다 길어 사용자 경험에 영향을 줄 수 있습니다.',
        actionable: true,
        priority: 'medium'
      });
    }

    // 대화 완료율 리스크
    const completionRate = this.calculateCompletionRate(sessions);
    if (completionRate < 0.6) {
      risks.push({
        type: 'risk',
        confidence: 0.78,
        value: 'low_completion',
        description: '대화 완료율이 낮아 사용자 만족도에 영향을 줄 수 있습니다.',
        actionable: true,
        priority: 'high'
      });
    }

    // 프로젝트 연관성 리스크
    if (project) {
      const relevance = this.calculateProjectRelevance(sessions, project);
      if (relevance < 0.3) {
        risks.push({
          type: 'risk',
          confidence: 0.72,
          value: 'low_relevance',
          description: '프로젝트와의 연관성이 낮아 효율성이 떨어질 수 있습니다.',
          actionable: true,
          priority: 'medium'
        });
      }
    }

    return risks;
  }

  // 지능형 추천 생성
  async generateIntelligentRecommendations(
    userId: string,
    sessions: ChatSession[],
    project: Project | null
  ): Promise<PredictionResult[]> {
    const recommendations: PredictionResult[] = [];
    const userPattern = this.userPatterns.get(userId);

    if (userPattern) {
      // 주제 추천
      if (userPattern.preferredTopics.length > 0) {
        recommendations.push({
          type: 'recommendation',
          confidence: 0.88,
          value: 'topic_suggestion',
          description: `관심 주제 "${userPattern.preferredTopics[0]}"에 대한 추가 정보를 제공해드릴까요?`,
          actionable: true,
          priority: 'medium'
        });
      }

      // 상호작용 빈도 최적화
      if (userPattern.interactionFrequency < 0.5) {
        recommendations.push({
          type: 'recommendation',
          confidence: 0.75,
          value: 'engagement_boost',
          description: '더 자주 상호작용하시면 더 정확한 개인화 서비스를 제공할 수 있습니다.',
          actionable: true,
          priority: 'low'
        });
      }
    }

    // 프로젝트 기반 추천
    if (project) {
      const projectSessions = sessions.filter(s => s.projectId === project.id);
      if (projectSessions.length < 3) {
        recommendations.push({
          type: 'recommendation',
          confidence: 0.82,
          value: 'project_engagement',
          description: '프로젝트에 대한 더 많은 대화를 통해 더 정확한 도움을 드릴 수 있습니다.',
          actionable: true,
          priority: 'medium'
        });
      }
    }

    return recommendations;
  }

  // 선형 트렌드 계산
  private calculateLinearTrend(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: values[0] || 0 };

    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  // 선호 주제 추출
  private extractPreferredTopics(sessions: ChatSession[]): string[] {
    const allMessages = sessions.flatMap(s => s.messages);
    const topics: { [key: string]: number } = {};

    allMessages.forEach(msg => {
      const words = msg.content.toLowerCase().match(/[가-힣]+/g) || [];
      words.forEach(word => {
        if (word.length > 1) {
          topics[word] = (topics[word] || 0) + 1;
        }
      });
    });

    return Object.entries(topics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  // 평균 응답 시간 계산
  private calculateAverageResponseTime(sessions: ChatSession[]): number {
    const responseTimes: number[] = [];

    sessions.forEach(session => {
      const messages = session.messages;
      for (let i = 1; i < messages.length; i++) {
        const currentTime = new Date(messages[i].timestamp).getTime();
        const prevTime = new Date(messages[i - 1].timestamp).getTime();
        responseTimes.push(currentTime - prevTime);
      }
    });

    return responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
  }

  // 평균 메시지 길이 계산
  private calculateAverageMessageLength(sessions: ChatSession[]): number {
    const allMessages = sessions.flatMap(s => s.messages);
    const totalLength = allMessages.reduce((sum, msg) => sum + msg.content.length, 0);
    return allMessages.length > 0 ? totalLength / allMessages.length : 0;
  }

  // 상호작용 빈도 계산
  private calculateInteractionFrequency(sessions: ChatSession[]): number {
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
    const totalDuration = sessions.reduce((sum, s) => {
      const start = new Date(s.createdAt).getTime();
      const end = new Date(s.updatedAt).getTime();
      return sum + (end - start);
    }, 0);

    return totalDuration > 0 ? totalMessages / (totalDuration / (1000 * 60 * 60)) : 0; // 시간당 메시지 수
  }

  // 평균 세션 지속 시간 계산
  private calculateAverageSessionDuration(sessions: ChatSession[]): number {
    const durations = sessions.map(s => {
      const start = new Date(s.createdAt).getTime();
      const end = new Date(s.updatedAt).getTime();
      return end - start;
    });

    return durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
  }

  // 자주 묻는 질문 추출
  private extractCommonQuestions(sessions: ChatSession[]): string[] {
    const questions: { [key: string]: number } = {};

    sessions.forEach(session => {
      session.messages.forEach(msg => {
        if (msg.isUser && msg.content.includes('?')) {
          const question = coerceTrimmedString(msg.content, '');
          questions[question] = (questions[question] || 0) + 1;
        }
      });
    });

    return Object.entries(questions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([question]) => question);
  }

  // 감정 트렌드 분석
  private analyzeSentimentTrend(sessions: ChatSession[]): 'positive' | 'negative' | 'neutral' {
    const allMessages = sessions.flatMap(s => s.messages);
    const positiveWords = ['좋다', '훌륭하다', '성공', '개선', '만족'];
    const negativeWords = ['문제', '실패', '어려움', '불만', '위험'];

    let positiveCount = 0;
    let negativeCount = 0;

    allMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      positiveWords.forEach(word => {
        if (content.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (content.includes(word)) negativeCount++;
      });
    });

    if (positiveCount > negativeCount * 1.5) return 'positive';
    if (negativeCount > positiveCount * 1.5) return 'negative';
    return 'neutral';
  }

  // 완료율 계산
  private calculateCompletionRate(sessions: ChatSession[]): number {
    const completedSessions = sessions.filter(s =>
      s.messages.length > 2 &&
      (s.messages[s.messages.length - 1].content.includes('감사') ||
      s.messages[s.messages.length - 1].content.includes('해결') ||
      s.messages[s.messages.length - 1].content.includes('완료'))
    ).length;

    return sessions.length > 0 ? completedSessions / sessions.length : 0;
  }

  // 프로젝트 연관성 계산
  private calculateProjectRelevance(sessions: ChatSession[], project: Project): number {
    const projectKeywords = [
      project.name,
      project.description,
      ...(project.files?.map(f => f.name) || []),
      ...(Array.isArray(project.guidelines) ? (project.guidelines as Guideline[]).map((g: Guideline) => g.title) : [])
    ].join(' ').toLowerCase();

    const allMessages = sessions.flatMap(s => s.messages);
    let relevantMessages = 0;

    allMessages.forEach(msg => {
      const messageWords = msg.content.toLowerCase().match(/[가-힣]+/g) || [];
      const projectWords = projectKeywords.match(/[가-힣]+/g) || [];

      const commonWords = messageWords.filter(word =>
        projectWords.some(w => w === word) && word.length > 1
      );

      if (commonWords.length > 0) {
        relevantMessages++;
      }
    });

    return allMessages.length > 0 ? relevantMessages / allMessages.length : 0;
  }

  // 데이터 저장
  private saveData(): void {
    try {
      const data = {
        models: Object.fromEntries(this.models),
        userPatterns: Object.fromEntries(this.userPatterns)
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      const err = toError(error);
      errorLogger.error('예측 분석 데이터 저장 오류', err, {
        component: 'predictiveAnalysisEngine',
        action: 'saveData',
      });
    }
  }

  // 데이터 로드
  private loadData(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);

        // 모델 데이터 복원
        if (data.models) {
          this.models = new Map(Object.entries(data.models));
        }

        // 사용자 패턴 데이터 복원
        if (data.userPatterns) {
          this.userPatterns = new Map(Object.entries(data.userPatterns));
        }
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.error('예측 분석 데이터 로드 오류', err, {
        component: 'predictiveAnalysisEngine',
        action: 'loadData',
      });
    }
  }

  // 모델 성능 업데이트
  async updateModelPerformance(modelId: string, newAccuracy: number): Promise<void> {
    const model = this.models.get(modelId);
    if (model) {
      model.accuracy = newAccuracy;
      model.lastUpdated = new Date();
      this.models.set(modelId, model);
      this.saveData();
    }
  }

  // 전체 예측 분석 실행
  async runFullAnalysis(
    userId: string,
    sessions: ChatSession[],
    project: Project | null
  ): Promise<{
    trends: TrendAnalysis;
    behavior: UserBehaviorPattern;
    predictions: PredictionResult[];
    risks: PredictionResult[];
    recommendations: PredictionResult[];
  }> {
    const trends = await this.predictConversationTrend(sessions);
    const behavior = await this.analyzeUserBehavior(userId, sessions);
    const predictions = project ? [await this.predictProjectSuccess(project, sessions)] : [];
    const risks = await this.assessRisk(sessions, project);
    const recommendations = await this.generateIntelligentRecommendations(userId, sessions, project);

    return {
      trends,
      behavior,
      predictions,
      risks,
      recommendations
    };
  }
}

const predictiveAnalysisEngine = new PredictiveAnalysisEngine();
export default predictiveAnalysisEngine;
