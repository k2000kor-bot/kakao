/**
 * 노트북 LLM + 딥러닝 혁신 연동
 *
 * 노트북 LLM 프롬프트/응답에 딥러닝 분석을 복합 적용하여
 * 의도·감정·주제·품질을 분석하고, 노트북 LLM 결과를 보강합니다.
 */

import { Message } from './types';
import deepLearningService, { type DeepLearningAnalysis } from './deepLearningService';
import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';

/** 프롬프트 단일 분석 결과 (노트북 LLM 입력 전) */
export interface PromptDLAnalysis {
  sentiment: DeepLearningAnalysis['sentiment'];
  keyTopics: string[];
  complexity: number;
  urgency: number;
  suggestedFocus?: string;
}

/** 응답 품질 분석 결과 (노트북 LLM 출력 후) */
export interface ResponseDLAnalysis {
  sentiment: DeepLearningAnalysis['sentiment'];
  keyTopics: string[];
  engagement: number;
  conversationPhase: string;
  confidence: number;
}

/** 프로젝트 맥락 (딥러닝 분석·보강 시 프로젝트 지침 반영용) */
export interface ProjectContextForDL {
  instructions?: string;
  name?: string;
}

function toMessage(sender: string, content: string, id: string): Message {
  return {
    id,
    sender,
    content,
    timestamp: new Date().toISOString(),
    type: 'text',
  };
}

/**
 * 프롬프트에 대해 딥러닝 분석 수행 (노트북 LLM 호출 전 의도·주제·복잡도 파악)
 * projectContext가 있으면 프로젝트 지침·이름을 맥락에 포함해 더 진한(맥락 반영) 분석 수행
 */
export async function analyzePromptWithDL(
  prompt: string,
  projectContext?: ProjectContextForDL
): Promise<PromptDLAnalysis> {
  try {
    let userContent = prompt;
    const instr = coerceTrimmedString(projectContext?.instructions, '');
    if (instr || projectContext?.name) {
      const parts: string[] = [];
      if (projectContext?.name) parts.push(`[프로젝트: ${projectContext.name}]`);
      if (instr) {
        parts.push(`[프로젝트 지침 맥락: ${instr}]`);
      }
      parts.push(`사용자 질문: ${prompt}`);
      userContent = parts.join(' ');
    }
    const messages: Message[] = [toMessage('user', userContent, `prompt-${Date.now()}`)];
    const analysis = await deepLearningService.analyzeConversation(messages);
    return {
      sentiment: analysis.sentiment,
      keyTopics: analysis.keyTopics,
      complexity: analysis.complexity,
      urgency: analysis.urgency,
      suggestedFocus:
        analysis.keyTopics.length > 0
          ? `주요 주제: ${analysis.keyTopics.join(', ')}`
          : undefined,
    };
  } catch (error) {
    errorLogger.error(
      '프롬프트 딥러닝 분석 실패',
      error instanceof Error ? error : new Error(String(error)),
      { component: 'notebookLLMDeepLearningIntegration', action: 'analyzePromptWithDL' }
    );
    return {
      sentiment: 'neutral',
      keyTopics: [],
      complexity: 0.5,
      urgency: 0.5,
    };
  }
}

/**
 * 딥러닝 분석 결과를 프롬프트에 반영할 보강 문구 생성
 * 복잡도·주제 분석 → 답변 구조·강조점 지시
 * projectContext.instructions가 있으면 프로젝트 지침 반영 지시 추가 (딥러닝 진하게)
 */
export function buildDLPromptEnhancement(
  analysis: PromptDLAnalysis,
  projectContext?: ProjectContextForDL
): string {
  const parts: string[] = [];
  if (coerceTrimmedString(projectContext?.instructions, '')) {
    parts.push('\n[프로젝트 지침 반영] 이 프로젝트의 지침에 맞춰 톤·형식·내용을 맞춰 답변해주세요.');
  }
  if (analysis.complexity > 0.7 && analysis.complexity <= 1) {
    parts.push('\n[답변 지시] 질문이 복잡하므로 단계별로 구분하여 상세히 설명해주세요.');
  } else if (analysis.complexity > 0.5 && analysis.complexity <= 0.7) {
    parts.push('\n[답변 지시] 핵심과 세부사항을 균형 있게 설명해주세요.');
  }
  if (analysis.suggestedFocus) {
    parts.push(`\n[중점 사항] ${analysis.suggestedFocus}에 대해 특히 자세히 다뤄주세요.`);
  }
  if (analysis.urgency > 0.7) {
    parts.push('\n[답변 지시] 긴급한 사항이 포함되어 있으므로 핵심 결론을 먼저 제시해주세요.');
  }
  if (analysis.sentiment === 'negative') {
    parts.push('\n[답변 지시] 질문자가 우려·불안을 느끼고 있을 수 있으므로 공감적이고 해결 중심으로 답변해주세요.');
  } else if (analysis.sentiment === 'positive') {
    parts.push('\n[답변 지시] 긍정적인 맥락을 유지하며 구체적이고 도움이 되는 내용을 담아주세요.');
  }
  return parts.join('');
}

/**
 * 노트북 LLM 응답에 대해 딥러닝 품질·감정 분석 (응답 후 품질 지표 제공)
 */
export async function analyzeResponseWithDL(
  prompt: string,
  responseContent: string
): Promise<ResponseDLAnalysis> {
  try {
    const messages: Message[] = [
      toMessage('user', prompt, `req-${Date.now()}`),
      toMessage('assistant', responseContent, `res-${Date.now()}`),
    ];
    const analysis = await deepLearningService.analyzeConversation(messages);
    return {
      sentiment: analysis.sentiment,
      keyTopics: analysis.keyTopics,
      engagement: analysis.engagement,
      conversationPhase: analysis.conversationFlow.phase,
      confidence: analysis.conversationFlow.confidence,
    };
  } catch (error) {
    errorLogger.error(
      '응답 딥러닝 분석 실패',
      error instanceof Error ? error : new Error(String(error)),
      { component: 'notebookLLMDeepLearningIntegration', action: 'analyzeResponseWithDL' }
    );
    return {
      sentiment: 'neutral',
      keyTopics: [],
      engagement: 0.5,
      conversationPhase: 'discussion',
      confidence: 0.5,
    };
  }
}

/** buildMessageToSendForChat 반환: 전송용 메시지와 (선택) 프롬프트 분석 결과(UI 표시용) */
export interface BuildMessageToSendResult {
  messageToSend: string;
  promptAnalysis?: PromptDLAnalysis;
}

/**
 * 대화 전송용 메시지 생성: requestMessage에 딥러닝 분석·보강을 적용해 반환.
 * (메인 대화·재생성·편집·노트북(딥시크) 등 동일 답변 생성 로직에서 재사용)
 * includeAnalysis: true면 promptAnalysis를 함께 반환(노트북 LLM UI 표시용).
 */
export async function buildMessageToSendForChat(
  requestMessage: string,
  effectiveInput: string,
  projectContext?: ProjectContextForDL,
  options?: { includeAnalysis?: boolean }
): Promise<string | BuildMessageToSendResult> {
  try {
    const promptAnalysis = await analyzePromptWithDL(effectiveInput, projectContext);
    const dlEnhancement = buildDLPromptEnhancement(promptAnalysis, projectContext);
    const messageToSend = dlEnhancement ? requestMessage + dlEnhancement : requestMessage;
    if (options?.includeAnalysis) {
      return { messageToSend, promptAnalysis };
    }
    return messageToSend;
  } catch {
    if (options?.includeAnalysis) {
      return { messageToSend: requestMessage };
    }
    return requestMessage;
  }
}

const notebookLLMDeepLearningIntegration = {
  analyzePromptWithDL,
  analyzeResponseWithDL,
  buildDLPromptEnhancement,
  buildMessageToSendForChat,
};
export default notebookLLMDeepLearningIntegration;
