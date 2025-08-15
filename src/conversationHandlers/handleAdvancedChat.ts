import { advancedNLPService, AdvancedNLPRequest } from '../services/advancedNLPService';
import { advancedDocumentService, AdvancedDocumentRequest } from '../services/advancedDocumentService';
import { Message } from '../types/chat';

export async function handleAdvancedChat(message: string, conversationHistory: Message[] = []): Promise<{
  response: string;
  suggestions: string[];
  followUpQuestions: string[];
  actionItems: string[];
  confidence: number;
  analysis: {
    intent: string;
    requirements: string[];
    topics: string[];
    complexity: string;
    urgency: string;
  };
  performance: {
    processingTime: number;
    memoryStrength: number;
    contextContinuity: number;
    styleConsistency: number;
  };
}> {
  try {
    const startTime = performance.now();

    // 메시지 길이와 복잡도에 따른 처리 방식 결정
    const isLongMessage = message.length > 200;
    const hasMultipleConditions = message.includes('그리고') || message.includes('또한') || message.includes('추가로');

    let response: string;
    let suggestions: string[] = [];
    let followUpQuestions: string[] = [];
    let actionItems: string[] = [];
    let confidence: number = 0.5;
    let analysis: any = {};
    let performance_metrics: any = {};

    if (isLongMessage || hasMultipleConditions) {
      // 고급 문서 처리 사용
      const contextId = `ctx_${Date.now()}`;
      const conditions = [message];

      const documentRequest: AdvancedDocumentRequest = {
        documentText: message,
        conversationHistory,
        userConditions: conditions,
        contextId,
        priorityLevel: hasMultipleConditions ? 'high' : 'normal'
      };

      const documentResponse = await advancedDocumentService.processAdvancedDocument(documentRequest);

      response = documentResponse.processedResponse;
      confidence = documentResponse.contextContinuityScore;

      // 분석 결과 변환
      analysis = {
        intent: documentResponse.multiConditionAnalysis.primaryCondition || 'general_inquiry',
        requirements: [
          documentResponse.multiConditionAnalysis.primaryCondition,
          ...documentResponse.multiConditionAnalysis.secondaryConditions
        ].filter(Boolean),
        topics: documentResponse.documentStructure.mainTopics,
        complexity: documentResponse.multiConditionAnalysis.complexityScore > 0.7 ? 'high' :
          documentResponse.multiConditionAnalysis.complexityScore > 0.4 ? 'medium' : 'low',
        urgency: documentResponse.styleAnalysis.emotionIndicators.length > 3 ? 'high' : 'normal'
      };

      performance_metrics = {
        processingTime: documentResponse.processingMetadata.processingTime,
        memoryStrength: documentResponse.contextMemory.memoryStrength,
        contextContinuity: documentResponse.contextContinuityScore,
        styleConsistency: documentResponse.styleAnalysis.consistencyScore
      };

      // 제안사항 생성
      suggestions = [
        '복잡한 요청을 체계적으로 처리했습니다.',
        '단계별 진행 상황을 확인할 수 있습니다.',
        '추가 세부사항이 필요하면 말씀해주세요.'
      ];

      // 우선순위가 있는 경우 액션 아이템 생성
      if (documentResponse.multiConditionAnalysis.priorityOrder.length > 0) {
        actionItems = documentResponse.multiConditionAnalysis.priorityOrder.map((item, index) =>
          `${index + 1}. ${item}`
        );
      }

    } else {
      // 기존 NLP 서비스 사용
      const nlpRequest: AdvancedNLPRequest = {
        message,
        conversationHistory,
        context: undefined,
        userPreferences: undefined
      };

      const nlpResponse = await advancedNLPService.analyzeAdvancedNLP(nlpRequest);

      response = nlpResponse.response;
      suggestions = nlpResponse.suggestions;
      followUpQuestions = nlpResponse.followUpQuestions;
      actionItems = nlpResponse.actionItems;
      confidence = nlpResponse.confidenceScore;

      analysis = {
        intent: nlpResponse.intentAnalysis.primaryIntent,
        requirements: [
          ...nlpResponse.requirementAnalysis.explicitRequirements,
          ...nlpResponse.requirementAnalysis.implicitRequirements
        ],
        topics: nlpResponse.contextAnalysis.topics,
        complexity: nlpResponse.contextAnalysis.complexity,
        urgency: nlpResponse.contextAnalysis.urgency
      };

      performance_metrics = {
        processingTime: performance.now() - startTime,
        memoryStrength: 0.7, // 기본값
        contextContinuity: confidence,
        styleConsistency: 0.8 // 기본값
      };
    }

    // 공통 응답 후처리

    // 긴급도가 높은 경우 우선 처리 표시
    if (analysis.urgency === 'critical' || analysis.urgency === 'high') {
      response += '\n\n🚨 **긴급 요청으로 우선 처리하겠습니다.**';
    }

    // 복잡도가 높은 경우 추가 안내
    if (analysis.complexity === 'high') {
      response += '\n\n📋 **복잡한 요청이므로 단계별로 처리하겠습니다.**';
    }

    // 메모리 강도가 높은 경우 맥락 연속성 표시
    if (performance_metrics.memoryStrength > 0.8) {
      response += '\n\n🧠 **이전 대화의 맥락을 충분히 고려하여 답변합니다.**';
    }

    // 제안사항 추가
    if (suggestions.length > 0) {
      response += '\n\n💡 **추가 제안사항:**\n';
      suggestions.forEach(suggestion => {
        response += `• ${suggestion}\n`;
      });
    }

    // 후속 질문 추가
    if (followUpQuestions.length > 0) {
      response += '\n\n❓ **추가 질문이 있으시면:**\n';
      followUpQuestions.forEach(question => {
        response += `• ${question}\n`;
      });
    }

    // 액션 아이템 추가
    if (actionItems.length > 0) {
      response += '\n\n✅ **수행할 작업:**\n';
      actionItems.forEach(action => {
        response += `• ${action}\n`;
      });
    }

    // 신뢰도가 낮은 경우 추가 안내
    if (confidence < 0.5) {
      response += '\n\n⚠️ **더 정확한 답변을 위해 구체적으로 말씀해주세요.**';
    }

    // 처리 시간이 길었던 경우 안내
    if (performance_metrics.processingTime > 2000) {
      response += '\n\n⏱️ **복잡한 요청으로 처리 시간이 소요되었습니다.**';
    }

    return {
      response,
      suggestions,
      followUpQuestions,
      actionItems,
      confidence,
      analysis,
      performance: performance_metrics
    };

  } catch (error) {
    console.error('고급 채팅 분석 오류:', error);

    // 폴백 응답
    const fallbackResponse = `메시지를 이해했습니다. "${message}"에 대해 답변드리겠습니다. 
    
💡 **더 정확한 답변을 위해 다음을 시도해보세요:**
• 구체적인 요청사항을 명시해주세요
• "분석해줘", "요약해줘", "비교해줘" 등의 키워드를 사용해주세요
• 긴 텍스트의 경우 주요 내용을 강조해주세요
• 복합적인 요구사항은 단계별로 나누어 말씀해주세요

🔧 **사용 가능한 기능:**
• "AI 상태" - 시스템 상태 확인
• "분석" - 상세한 분석 리포트
• "도움말" - 사용법 안내`;

    return {
      response: fallbackResponse,
      suggestions: ['더 구체적인 요청을 해주시면 정확한 답변을 드릴 수 있습니다.'],
      followUpQuestions: [],
      actionItems: [],
      confidence: 0.3,
      analysis: {
        intent: 'general_inquiry',
        requirements: [],
        topics: [],
        complexity: 'low',
        urgency: 'low'
      },
      performance: {
        processingTime: 0,
        memoryStrength: 0.3,
        contextContinuity: 0.3,
        styleConsistency: 0.5
      }
    };
  }
}

// 복합 요구사항 처리 함수
export async function handleComplexRequirements(message: string): Promise<{
  primaryRequirement: string;
  secondaryRequirements: string[];
  constraints: string[];
  preferences: string[];
}> {
  try {
    const requirements = await advancedNLPService.analyzeMultipleRequirements(message);

    return {
      primaryRequirement: requirements.primary,
      secondaryRequirements: requirements.secondary,
      constraints: requirements.constraints,
      preferences: requirements.preferences
    };
  } catch (error) {
    console.error('복합 요구사항 분석 오류:', error);
    return {
      primaryRequirement: '',
      secondaryRequirements: [],
      constraints: [],
      preferences: []
    };
  }
}

// 문맥 복잡도 분석 함수
export async function analyzeMessageComplexity(message: string): Promise<{
  complexity: 'low' | 'medium' | 'high';
  topics: string[];
  entities: string[];
  relationships: Array<{ type: string; entities: string[] }>;
}> {
  try {
    return await advancedNLPService.analyzeContextComplexity(message);
  } catch (error) {
    console.error('문맥 복잡도 분석 오류:', error);
    return {
      complexity: 'low',
      topics: [],
      entities: [],
      relationships: []
    };
  }
}

// 지능형 응답 생성 함수
export async function generateIntelligentResponse(message: string, history: Message[]): Promise<{
  response: string;
  suggestions: string[];
  followUpQuestions: string[];
  actionItems: string[];
  confidence: number;
}> {
  try {
    return await advancedNLPService.generateComprehensiveResponse(message, history);
  } catch (error) {
    console.error('지능형 응답 생성 오류:', error);
    return {
      response: '메시지를 이해했습니다. 도움이 필요하시면 구체적으로 말씀해주세요.',
      suggestions: ['더 구체적인 요청을 해주시면 정확한 답변을 드릴 수 있습니다.'],
      followUpQuestions: [],
      actionItems: [],
      confidence: 0.3
    };
  }
}
