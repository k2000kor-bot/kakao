import { ChatSession, Message } from '../types/chat';
import { Project } from '../types/project';

export interface AnalyticsData {
  messageCount: number;
  averageResponseTime: number;
  responseQuality: {
    basic: number;
    intelligent: number;
    advanced: number;
    adaptive: number;
  };
  topicDistribution: { [key: string]: number };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  userEngagement: {
    dailyMessages: { date: string; count: number }[];
    sessionDuration: number;
    responseRate: number;
  };
  aiPerformance: {
    accuracy: number;
    relevance: number;
    helpfulness: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

class AnalyticsService {
  
  // 대화 분석 데이터 생성
  async generateAnalytics(session: ChatSession, project?: Project | null): Promise<AnalyticsData> {
    const messages = session.messages;
    const userMessages = messages.filter(m => m.isUser);
    const aiMessages = messages.filter(m => !m.isUser);

    return {
      messageCount: messages.length,
      averageResponseTime: this.calculateAverageResponseTime(messages),
      responseQuality: this.analyzeResponseQuality(aiMessages),
      topicDistribution: this.analyzeTopicDistribution(userMessages),
      sentimentAnalysis: this.analyzeSentiment(userMessages),
      userEngagement: this.analyzeUserEngagement(session),
      aiPerformance: this.analyzeAIPerformance(aiMessages)
    };
  }

  // 응답 시간 분석
  private calculateAverageResponseTime(messages: Message[]): number {
    let totalTime = 0;
    let responseCount = 0;

    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].isUser && !messages[i + 1].isUser) {
        const userTime = new Date(messages[i].timestamp).getTime();
        const aiTime = new Date(messages[i + 1].timestamp).getTime();
        totalTime += aiTime - userTime;
        responseCount++;
      }
    }

    return responseCount > 0 ? totalTime / responseCount : 0;
  }

  // 응답 품질 분석
  private analyzeResponseQuality(aiMessages: Message[]): AnalyticsData['responseQuality'] {
    const quality = { basic: 0, intelligent: 0, advanced: 0, adaptive: 0 };
    
    aiMessages.forEach(message => {
      if (message.content.includes('# 🤖')) quality.intelligent++;
      else if (message.content.includes('# 🔍')) quality.advanced++;
      else if (message.content.includes('개인화')) quality.adaptive++;
      else quality.basic++;
    });

    const total = aiMessages.length;
    if (total > 0) {
      quality.basic = (quality.basic / total) * 100;
      quality.intelligent = (quality.intelligent / total) * 100;
      quality.advanced = (quality.advanced / total) * 100;
      quality.adaptive = (quality.adaptive / total) * 100;
    }

    return quality;
  }

  // 주제 분포 분석
  private analyzeTopicDistribution(userMessages: Message[]): { [key: string]: number } {
    const topics: { [key: string]: number } = {};
    
    userMessages.forEach(message => {
      const messageTopics = this.extractTopics(message.content);
      messageTopics.forEach(topic => {
        topics[topic] = (topics[topic] || 0) + 1;
      });
    });

    return topics;
  }

  // 주제 추출
  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    
    if (text.includes('프로젝트') || text.includes('계획')) topics.push('프로젝트 관리');
    if (text.includes('문제') || text.includes('해결')) topics.push('문제 해결');
    if (text.includes('분석') || text.includes('데이터')) topics.push('데이터 분석');
    if (text.includes('개선') || text.includes('최적화')) topics.push('프로세스 개선');
    if (text.includes('팀') || text.includes('협업')) topics.push('팀워크');
    if (text.includes('성과') || text.includes('결과')) topics.push('성과 관리');
    if (text.includes('어떻게') || text.includes('방법')) topics.push('방법론');
    if (text.includes('왜') || text.includes('이유')) topics.push('원인 분석');
    if (text.includes('언제') || text.includes('시기')) topics.push('일정 관리');
    if (text.includes('어디서') || text.includes('장소')) topics.push('위치/환경');
    
    return topics.length > 0 ? topics : ['일반'];
  }

  // 감정 분석
  private analyzeSentiment(userMessages: Message[]): AnalyticsData['sentimentAnalysis'] {
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    
    userMessages.forEach(message => {
      const messageSentiment = this.analyzeMessageSentiment(message.content);
      sentiment[messageSentiment]++;
    });

    const total = userMessages.length;
    if (total > 0) {
      sentiment.positive = (sentiment.positive / total) * 100;
      sentiment.neutral = (sentiment.neutral / total) * 100;
      sentiment.negative = (sentiment.negative / total) * 100;
    }

    return sentiment;
  }

  // 메시지 감정 분석
  private analyzeMessageSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['좋다', '훌륭하다', '성공', '개선', '향상', '만족', '긍정적', '감사', '도움'];
    const negativeWords = ['문제', '실패', '어려움', '불만', '부정적', '실패', '위험', '걱정', '화나다'];
    
    const words = text.toLowerCase().match(/[가-힣]+/g) || [];
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // 사용자 참여도 분석
  private analyzeUserEngagement(session: ChatSession): AnalyticsData['userEngagement'] {
    const messages = session.messages;
    const userMessages = messages.filter(m => m.isUser);
    
    // 일별 메시지 수
    const dailyMessages = this.calculateDailyMessages(userMessages);
    
    // 세션 지속 시간
    const sessionDuration = this.calculateSessionDuration(messages);
    
    // 응답률 (AI가 사용자 메시지에 응답한 비율)
    const responseRate = this.calculateResponseRate(messages);

    return {
      dailyMessages,
      sessionDuration,
      responseRate
    };
  }

  // 일별 메시지 수 계산
  private calculateDailyMessages(userMessages: Message[]): { date: string; count: number }[] {
    const dailyCount: { [key: string]: number } = {};
    
    userMessages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      dailyCount[date] = (dailyCount[date] || 0) + 1;
    });

    return Object.entries(dailyCount).map(([date, count]) => ({ date, count }));
  }

  // 세션 지속 시간 계산
  private calculateSessionDuration(messages: Message[]): number {
    if (messages.length < 2) return 0;
    
    const startTime = new Date(messages[0].timestamp).getTime();
    const endTime = new Date(messages[messages.length - 1].timestamp).getTime();
    
    return endTime - startTime;
  }

  // 응답률 계산
  private calculateResponseRate(messages: Message[]): number {
    const userMessages = messages.filter(m => m.isUser);
    const aiMessages = messages.filter(m => !m.isUser);
    
    return userMessages.length > 0 ? (aiMessages.length / userMessages.length) * 100 : 0;
  }

  // AI 성능 분석
  private analyzeAIPerformance(aiMessages: Message[]): AnalyticsData['aiPerformance'] {
    let accuracy = 0;
    let relevance = 0;
    let helpfulness = 0;

    aiMessages.forEach(message => {
      // 정확성: 마크다운 형식 사용 여부
      if (message.content.includes('#') || message.content.includes('**')) {
        accuracy += 1;
      }
      
      // 관련성: 긴 응답일수록 더 관련성 높음
      if (message.content.length > 100) {
        relevance += 1;
      }
      
      // 도움성: 구체적인 제안이나 단계 포함 여부
      if (message.content.includes('•') || message.content.includes('1.') || message.content.includes('단계')) {
        helpfulness += 1;
      }
    });

    const total = aiMessages.length;
    if (total > 0) {
      accuracy = (accuracy / total) * 100;
      relevance = (relevance / total) * 100;
      helpfulness = (helpfulness / total) * 100;
    }

    return { accuracy, relevance, helpfulness };
  }

  // 차트 데이터 생성
  async generateChartData(analytics: AnalyticsData): Promise<{ [key: string]: ChartData }> {
    return {
      responseQuality: {
        labels: ['기본', '능동적', '고급', '개인화'],
        datasets: [{
          label: '응답 품질 분포 (%)',
          data: [
            analytics.responseQuality.basic,
            analytics.responseQuality.intelligent,
            analytics.responseQuality.advanced,
            analytics.responseQuality.adaptive
          ],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      },
      
      topicDistribution: {
        labels: Object.keys(analytics.topicDistribution),
        datasets: [{
          label: '주제별 질문 수',
          data: Object.values(analytics.topicDistribution),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
      },
      
      sentimentAnalysis: {
        labels: ['긍정적', '중립적', '부정적'],
        datasets: [{
          label: '감정 분석 (%)',
          data: [
            analytics.sentimentAnalysis.positive,
            analytics.sentimentAnalysis.neutral,
            analytics.sentimentAnalysis.negative
          ],
          backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384']
        }]
      },
      
      dailyActivity: {
        labels: analytics.userEngagement.dailyMessages.map(d => d.date),
        datasets: [{
          label: '일별 메시지 수',
          data: analytics.userEngagement.dailyMessages.map(d => d.count),
          borderColor: '#36A2EB',
          borderWidth: 2,
          backgroundColor: ['rgba(54, 162, 235, 0.1)']
        }]
      },
      
      aiPerformance: {
        labels: ['정확성', '관련성', '도움성'],
        datasets: [{
          label: 'AI 성능 지표 (%)',
          data: [
            analytics.aiPerformance.accuracy,
            analytics.aiPerformance.relevance,
            analytics.aiPerformance.helpfulness
          ],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
      }
    };
  }

  // 인사이트 리포트 생성
  async generateInsightReport(analytics: AnalyticsData): Promise<string> {
    let report = `# 📊 대화 분석 리포트\n\n`;
    
    report += `## 📈 기본 통계\n\n`;
    report += `- **총 메시지 수**: ${analytics.messageCount}개\n`;
    report += `- **평균 응답 시간**: ${Math.round(analytics.averageResponseTime / 1000)}초\n`;
    report += `- **세션 지속 시간**: ${Math.round(analytics.userEngagement.sessionDuration / 1000 / 60)}분\n`;
    report += `- **AI 응답률**: ${Math.round(analytics.userEngagement.responseRate)}%\n\n`;
    
    report += `## 🎯 응답 품질 분석\n\n`;
    const bestQuality = Object.entries(analytics.responseQuality)
      .sort(([,a], [,b]) => b - a)[0];
    report += `- **가장 많이 사용된 모드**: ${bestQuality[0]} (${Math.round(bestQuality[1])}%)\n`;
    report += `- **고급 분석 사용률**: ${Math.round(analytics.responseQuality.advanced)}%\n`;
    report += `- **개인화 적용률**: ${Math.round(analytics.responseQuality.adaptive)}%\n\n`;
    
    report += `## 🏷️ 주제별 관심도\n\n`;
    const topTopics = Object.entries(analytics.topicDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    topTopics.forEach(([topic, count]) => {
      report += `- **${topic}**: ${count}회 질문\n`;
    });
    report += `\n`;
    
    report += `## 😊 감정 분석\n\n`;
    const dominantSentiment = Object.entries(analytics.sentimentAnalysis)
      .sort(([,a], [,b]) => b - a)[0];
    report += `- **주요 감정**: ${dominantSentiment[0]} (${Math.round(dominantSentiment[1])}%)\n`;
    report += `- **긍정적 반응**: ${Math.round(analytics.sentimentAnalysis.positive)}%\n`;
    report += `- **부정적 반응**: ${Math.round(analytics.sentimentAnalysis.negative)}%\n\n`;
    
    report += `## 🤖 AI 성능 평가\n\n`;
    report += `- **정확성**: ${Math.round(analytics.aiPerformance.accuracy)}%\n`;
    report += `- **관련성**: ${Math.round(analytics.aiPerformance.relevance)}%\n`;
    report += `- **도움성**: ${Math.round(analytics.aiPerformance.helpfulness)}%\n\n`;
    
    report += `## 💡 개선 제안\n\n`;
    if (analytics.responseQuality.basic > 50) {
      report += `- 고급 분석 모드를 더 자주 활용해보세요\n`;
    }
    if (analytics.sentimentAnalysis.negative > 20) {
      report += `- 질문을 더 구체적으로 작성하면 더 정확한 답변을 받을 수 있습니다\n`;
    }
    if (analytics.aiPerformance.helpfulness < 70) {
      report += `- AI가 더 도움이 되는 답변을 제공하도록 개인화 설정을 조정해보세요\n`;
    }
    
    return report;
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
