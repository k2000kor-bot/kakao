import { contextualAnalysisService, ContextualRequest } from '../services/contextualAnalysisService';
import { Message } from '../types/chat';

export async function handleChat(message: string, conversationHistory: Message[] = []): Promise<string> {
  try {
    // 문맥 분석 요청 생성
    const contextualRequest: ContextualRequest = {
      message,
      conversationHistory,
      context: undefined,
      userPreferences: undefined
    };

    // 문맥 분석 수행
    const contextualResponse = await contextualAnalysisService.analyzeContext(contextualRequest);
    
    // 분석 결과에 따른 응답 생성
    let response = contextualResponse.response;
    
    // 긴급도가 높은 경우 우선 처리 표시
    if (contextualResponse.analysis.urgency === 'critical' || contextualResponse.analysis.urgency === 'high') {
      response += '\n\n🚨 **긴급 요청으로 우선 처리하겠습니다.**';
    }
    
    // 제안사항 추가
    if (contextualResponse.suggestions.length > 0) {
      response += '\n\n💡 **추가 제안사항:**\n';
      contextualResponse.suggestions.forEach(suggestion => {
        response += `• ${suggestion}\n`;
      });
    }
    
    // 관련 토픽 추가
    if (contextualResponse.relatedTopics.length > 0) {
      response += '\n\n🔗 **관련 토픽:**\n';
      contextualResponse.relatedTopics.forEach(topic => {
        response += `• ${topic}\n`;
      });
    }
    
    // 후속 질문 추가
    if (contextualResponse.analysis.followUpQuestions.length > 0) {
      response += '\n\n❓ **추가 질문이 있으시면:**\n';
      contextualResponse.analysis.followUpQuestions.forEach(question => {
        response += `• ${question}\n`;
      });
    }
    
    // 신뢰도가 낮은 경우 추가 안내
    if (contextualResponse.analysis.confidence < 0.5) {
      response += '\n\n⚠️ **더 정확한 답변을 위해 구체적으로 말씀해주세요.**';
    }
    
    return response;
    
  } catch (error) {
    console.error('문맥 분석 오류:', error);
    
    // 폴백 응답
    return `메시지를 이해했습니다. "${message}"에 대해 답변드리겠습니다. 
    
💡 **더 정확한 답변을 위해 다음을 시도해보세요:**
• 구체적인 요청사항을 명시해주세요
• "분석해줘", "요약해줘", "비교해줘" 등의 키워드를 사용해주세요
• 긴 텍스트의 경우 주요 내용을 강조해주세요

🔧 **사용 가능한 기능:**
• "AI 상태" - 시스템 상태 확인
• "분석" - 상세한 분석 리포트
• "도움말" - 사용법 안내`;
  }
}