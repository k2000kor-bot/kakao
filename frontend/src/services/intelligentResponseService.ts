/**
 * 지능형 응답 서비스
 * 향상된 의도 분석 및 스마트 응답 생성
 */

export interface SmartResponse {
  content: string;
  type: 'analysis' | 'suggestion' | 'insight' | 'warning';
  confidence: number;
  actionButtons?: Array<{
    label: string;
    action: string;
  }>;
  relatedQuestions?: string[];
}

export class IntelligentResponseService {
  /**
   * 스마트 응답 생성
   */
  async generateSmartResponse(message: string, context?: Record<string, unknown>): Promise<SmartResponse> {
    const intent = this.analyzeAdvancedIntent(message);
    
    switch (intent.type) {
      case 'comparison':
        return this.generateComparisonResponse(intent, context ?? {});
      case 'trend':
        return this.generateTrendResponse(intent, context ?? {});
      case 'insight':
        return this.generateInsightResponse(intent, context ?? {});
      case 'recommendation':
        return this.generateRecommendationResponse(intent, context ?? {});
      default:
        return this.generateDefaultResponse(intent);
    }
  }

  /**
   * 고급 의도 분석
   */
  private analyzeAdvancedIntent(message: string): Record<string, unknown> {
    const patterns = {
      comparison: [/비교/, /차이/, /vs/, /대비/],
      trend: [/변화/, /트렌드/, /흐름/, /패턴/],
      insight: [/인사이트/, /통찰/, /발견/, /특이점/],
      recommendation: [/추천/, /제안/, /조언/, /방법/]
    };

    for (const [type, regexList] of Object.entries(patterns)) {
      if (regexList.some(regex => regex.test(message))) {
        return { type, confidence: 0.8 };
      }
    }

    return { type: 'general', confidence: 0.5 };
  }

  /**
   * 비교 분석 응답
   */
  private generateComparisonResponse(intent: Record<string, unknown>, _context: Record<string, unknown>): SmartResponse {
    return {
      content: `📊 **비교 분석 결과**\n\n비교 분석을 위해 구체적으로 무엇을 비교하고 싶으신지 알려주세요.`,
      type: 'analysis',
      confidence: (typeof intent.confidence === 'number' ? intent.confidence : 0.5),
      actionButtons: [
        { label: '시공사 비교', action: '시공사들 비교 분석해줘' },
        { label: '기간별 비교', action: '이번 달과 지난 달 비교해줘' },
        { label: '참여자 비교', action: '참여자들 성향 비교해줘' }
      ],
      relatedQuestions: [
        '어떤 기준으로 비교하고 싶으신가요?',
        '특정 기간을 비교하고 싶으신가요?'
      ]
    };
  }

  /**
   * 트렌드 분석 응답
   */
  private generateTrendResponse(intent: Record<string, unknown>, _context: Record<string, unknown>): SmartResponse {
    return {
      content: `📈 **트렌드 분석**\n\n시간에 따른 변화 패턴을 분석해드릴게요.`,
      type: 'analysis',
      confidence: (typeof intent.confidence === 'number' ? intent.confidence : 0.5),
      actionButtons: [
        { label: '여론 트렌드', action: '여론 변화 트렌드 분석해줘' },
        { label: '성향 변화', action: '참여자 성향 변화 보여줘' },
        { label: '활동 패턴', action: '활동 패턴 분석해줘' }
      ]
    };
  }

  /**
   * 인사이트 응답
   */
  private generateInsightResponse(intent: Record<string, unknown>, _context: Record<string, unknown>): SmartResponse {
    return {
      content: `💡 **핵심 인사이트**\n\n데이터에서 발견한 주요 통찰을 공유해드릴게요.`,
      type: 'insight',
      confidence: (typeof intent.confidence === 'number' ? intent.confidence : 0.5),
      actionButtons: [
        { label: '숨겨진 패턴', action: '숨겨진 패턴 찾아줘' },
        { label: '핵심 발견', action: '핵심 발견사항 정리해줘' }
      ]
    };
  }

  /**
   * 추천 응답
   */
  private generateRecommendationResponse(intent: Record<string, unknown>, _context: Record<string, unknown>): SmartResponse {
    return {
      content: `🎯 **맞춤 추천**\n\n상황에 맞는 최적의 방안을 제안해드릴게요.`,
      type: 'suggestion',
      confidence: (typeof intent.confidence === 'number' ? intent.confidence : 0.5),
      actionButtons: [
        { label: '전략 추천', action: '커뮤니케이션 전략 추천해줘' },
        { label: '개선 방안', action: '개선 방안 제안해줘' }
      ]
    };
  }

  /**
   * 기본 응답
   */
  private generateDefaultResponse(intent: Record<string, unknown>): SmartResponse {
    return {
      content: `🤖 **AI 어시스턴트**\n\n무엇을 도와드릴까요? 자연스럽게 질문해주세요.`,
      type: 'suggestion',
      confidence: (typeof intent.confidence === 'number' ? intent.confidence : 0.5),
      actionButtons: [
        { label: '성향 분석', action: '참여자 성향 분석해줘' },
        { label: '편향 분석', action: '시공사 편향 분석해줘' },
        { label: '여론 분석', action: '여론 동향 분석해줘' }
      ]
    };
  }
}

export const intelligentResponseService = new IntelligentResponseService();
