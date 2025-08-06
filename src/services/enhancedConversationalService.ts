// 고도화된 대화형 인터페이스 서비스
// Enhanced Conversational Interface Service

export interface MessageRequest {
  conversation_id: string;
  user_id: string;
  message: string;
  ai_personality?: 'helpful' | 'creative' | 'analytical' | 'empathetic';
  response_style?: 'concise' | 'detailed' | 'conversational' | 'technical';
}

export interface MessageResponse {
  success: boolean;
  data: {
    response: string;
    metadata: {
      emotion: 'positive' | 'negative' | 'neutral';
      confidence: number;
      processing_time: number;
      context?: any;
    };
  };
  timestamp: string;
}

export interface AnalysisRequest {
  conversation_id: string;
}

export interface AnalysisResponse {
  success: boolean;
  data: {
    conversation_length: number;
    average_message_length: number;
    emotion_distribution: Record<string, number>;
    top_keywords: Record<string, number>;
    topics: string[];
    conversation_flow: string;
    user_satisfaction: number;
  };
  timestamp: string;
}

export interface InsightRequest {
  conversation_id: string;
}

export interface InsightResponse {
  success: boolean;
  data: {
    patterns: string[];
    recommendations: string[];
    predictions: string[];
    improvements: string[];
  };
  timestamp: string;
}

export interface ContextualResponseRequest {
  conversation_id: string;
  user_id: string;
  message: string;
  context_history?: Array<{
    user_id: string;
    message: string;
    timestamp: string;
  }>;
  clarification_needed?: boolean;
}

export interface ContextualResponseResponse {
  success: boolean;
  data: {
    type: 'clarification' | 'answer';
    question?: string;
    response?: string;
    suggestions?: string[];
    confidence?: number;
    sources?: string[];
    context?: any;
  };
  metadata: {
    processing_time: number;
    intent: any;
    clarification_needed: boolean;
  };
  timestamp: string;
}

export interface QualityFeedbackRequest {
  conversation_id: string;
  user_id: string;
  message_id: string;
  quality: 'good' | 'bad';
  feedback?: string;
}

export interface QualityFeedbackResponse {
  success: boolean;
  data: {
    message: string;
    improvements: string[];
  };
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  active_conversations: number;
}

class EnhancedConversationalService {
  private baseUrl: string = 'http://localhost:8003';

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
  }

  // 헬스 체크
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/enhanced/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('헬스 체크 실패:', error);
      throw error;
    }
  }

  // 채팅 메시지 전송
  async sendMessage(request: MessageRequest): Promise<MessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/enhanced/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw error;
    }
  }

  // 맥락 기반 정확한 답변 요청
  async getContextualResponse(request: ContextualResponseRequest): Promise<ContextualResponseResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/enhanced/contextual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('맥락 기반 응답 요청 실패:', error);
      throw error;
    }
  }

  // 응답 품질 피드백 전송
  async sendQualityFeedback(request: QualityFeedbackRequest): Promise<QualityFeedbackResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/enhanced/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('품질 피드백 전송 실패:', error);
      throw error;
    }
  }

  // 고급 분석 실행
  async analyzeConversation(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/enhanced/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('대화 분석 실패:', error);
      throw error;
    }
  }

  // 인사이트 생성
  async generateInsights(request: InsightRequest): Promise<InsightResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/enhanced/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('인사이트 생성 실패:', error);
      throw error;
    }
  }

  // WebSocket 연결
  createWebSocketConnection(conversationId: string): WebSocket {
    const wsUrl = `ws://localhost:8003/ws/v2/enhanced/${conversationId}`;
    return new WebSocket(wsUrl);
  }

  // 실시간 메시지 전송 (WebSocket)
  sendWebSocketMessage(ws: WebSocket, type: 'message' | 'analyze' | 'insights', content?: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type,
        content: content || ''
      }));
    } else {
      console.error('WebSocket이 연결되지 않았습니다.');
    }
  }

  // 대화 세션 생성
  createConversationSession(userId: string): string {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return conversationId;
  }

  // 메시지 포맷팅
  formatMessage(message: string, sender: 'user' | 'ai' | 'system'): string {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      id: Date.now().toString(),
      content: message,
      sender,
      timestamp,
      type: 'text'
    });
  }

  // 감정 분석 결과 포맷팅
  formatEmotionAnalysis(emotion: string, confidence: number): string {
    const emotionEmoji = {
      positive: '😊',
      negative: '😔',
      neutral: '😐'
    };

    return `${emotionEmoji[emotion as keyof typeof emotionEmoji] || '😐'} 감정: ${emotion} (${(confidence * 100).toFixed(1)}%)`;
  }

  // 분석 결과 포맷팅
  formatAnalysisResult(analysis: AnalysisResponse['data']): string {
    return `📊 분석 결과:
• 대화 길이: ${analysis.conversation_length}개 메시지
• 평균 메시지 길이: ${analysis.average_message_length.toFixed(1)}자
• 감정 분포: ${JSON.stringify(analysis.emotion_distribution)}
• 주요 키워드: ${Object.keys(analysis.top_keywords).slice(0, 5).join(', ')}
• 대화 흐름: ${analysis.conversation_flow}
• 사용자 만족도: ${(analysis.user_satisfaction * 100).toFixed(1)}%`;
  }

  // 인사이트 결과 포맷팅
  formatInsightResult(insights: InsightResponse['data']): string {
    return `💡 인사이트 결과:
🔍 발견된 패턴 (${insights.patterns.length}개):
${insights.patterns.map(p => `  • ${p}`).join('\n')}

💡 권장사항 (${insights.recommendations.length}개):
${insights.recommendations.map(r => `  • ${r}`).join('\n')}

🔮 예측 (${insights.predictions.length}개):
${insights.predictions.map(p => `  • ${p}`).join('\n')}

⚡ 개선점 (${insights.improvements.length}개):
${insights.improvements.map(i => `  • ${i}`).join('\n')}`;
  }

  // 맥락 기반 응답 포맷팅
  formatContextualResponse(response: ContextualResponseResponse['data']): string {
    if (response.type === 'clarification') {
      return `🤔 확인이 필요합니다:

${response.question}

💡 제안사항:
${response.suggestions?.map(s => `• ${s}`).join('\n')}

더 구체적으로 설명해주시면 정확한 답변을 드릴 수 있습니다.`;
    } else {
      return `✅ 정확한 답변:

${response.response}

${response.sources ? `📚 참고 자료: ${response.sources.join(', ')}` : ''}
${response.confidence ? `🎯 신뢰도: ${(response.confidence * 100).toFixed(1)}%` : ''}`;
    }
  }

  // 에러 처리
  handleError(error: any): string {
    console.error('서비스 에러:', error);

    if (error.message?.includes('fetch')) {
      return '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
    }

    if (error.message?.includes('HTTP error')) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    return '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';
  }

  // 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  // 서버 정보 가져오기
  async getServerInfo(): Promise<{ version: string; activeConversations: number }> {
    try {
      const health = await this.checkHealth();
      return {
        version: health.version,
        activeConversations: health.active_conversations
      };
    } catch (error) {
      throw new Error('서버 정보를 가져올 수 없습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성
const enhancedConversationalService = new EnhancedConversationalService();

export default enhancedConversationalService; 