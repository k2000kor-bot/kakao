/**
 * 노트북 LLM + 딥러닝 혁신 연동 테스트
 */

import {
  analyzePromptWithDL,
  analyzeResponseWithDL,
  buildDLPromptEnhancement,
  buildMessageToSendForChat,
  type PromptDLAnalysis,
  type ResponseDLAnalysis,
} from '../notebookLLMDeepLearningIntegration';

const mockAnalyzeConversation = jest.fn();

jest.mock('../deepLearningService', () => ({
  __esModule: true,
  default: {
    analyzeConversation: (...args: unknown[]) => mockAnalyzeConversation(...args),
  },
}));

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
  },
}));

describe('notebookLLMDeepLearningIntegration', () => {
  beforeEach(() => {
    mockAnalyzeConversation.mockClear();
  });

  describe('analyzePromptWithDL', () => {
    it('프롬프트 분석 성공 시 감정·주제·복잡도·긴급도·집중 포인트 반환', async () => {
      mockAnalyzeConversation.mockResolvedValue({
        sentiment: 'positive',
        keyTopics: ['재개발', '조합'],
        complexity: 0.7,
        urgency: 0.3,
        conversationFlow: { phase: 'discussion', confidence: 0.8 },
        participants: [],
        engagement: 0.5,
      });

      const result = await analyzePromptWithDL('재개발 조합 시공사 선정이 궁금합니다.');

      expect(mockAnalyzeConversation).toHaveBeenCalledTimes(1);
      const messages = mockAnalyzeConversation.mock.calls[0][0];
      expect(messages).toHaveLength(1);
      expect(messages[0].sender).toBe('user');
      expect(messages[0].content).toBe('재개발 조합 시공사 선정이 궁금합니다.');
      expect(messages[0].type).toBe('text');

      expect(result).toMatchObject({
        sentiment: 'positive',
        keyTopics: ['재개발', '조합'],
        complexity: 0.7,
        urgency: 0.3,
        suggestedFocus: '주요 주제: 재개발, 조합',
      } as PromptDLAnalysis);
    });

    it('주요 주제가 없으면 suggestedFocus 미포함', async () => {
      mockAnalyzeConversation.mockResolvedValue({
        sentiment: 'neutral',
        keyTopics: [],
        complexity: 0.5,
        urgency: 0.5,
        conversationFlow: { phase: 'discussion', confidence: 0.5 },
        participants: [],
        engagement: 0.5,
      });

      const result = await analyzePromptWithDL('안녕하세요.');

      expect(result.suggestedFocus).toBeUndefined();
      expect(result.sentiment).toBe('neutral');
      expect(result.keyTopics).toEqual([]);
    });

    it('분석 실패 시 기본값 반환 및 errorLogger 호출', async () => {
      const { errorLogger } = require('../../utils/errorLogger');
      mockAnalyzeConversation.mockRejectedValue(new Error('DL 분석 오류'));

      const result = await analyzePromptWithDL('테스트');

      expect(result).toEqual({
        sentiment: 'neutral',
        keyTopics: [],
        complexity: 0.5,
        urgency: 0.5,
      });
      expect(errorLogger.error).toHaveBeenCalledWith(
        '프롬프트 딥러닝 분석 실패',
        expect.any(Error),
        expect.objectContaining({ component: 'notebookLLMDeepLearningIntegration', action: 'analyzePromptWithDL' })
      );
    });

    it('projectContext 전달 시 프로젝트 맥락이 사용자 메시지에 포함되어 분석 호출', async () => {
      mockAnalyzeConversation.mockResolvedValue({
        sentiment: 'neutral',
        keyTopics: ['프로젝트'],
        complexity: 0.5,
        urgency: 0.5,
        conversationFlow: { phase: 'discussion', confidence: 0.7 },
        participants: [],
        engagement: 0.5,
      });

      await analyzePromptWithDL('질문입니다.', {
        name: '내 프로젝트',
        instructions: '항상 존댓말로 답해주세요.',
      });

      expect(mockAnalyzeConversation).toHaveBeenCalledTimes(1);
      const messages = mockAnalyzeConversation.mock.calls[0][0];
      expect(messages[0].content).toContain('[프로젝트: 내 프로젝트]');
      expect(messages[0].content).toContain('[프로젝트 지침 맥락:');
      expect(messages[0].content).toContain('항상 존댓말로 답해주세요.');
      expect(messages[0].content).toContain('사용자 질문: 질문입니다.');
    });
  });

  describe('buildDLPromptEnhancement', () => {
    it('projectContext.instructions 있으면 프로젝트 지침 반영 문구 포함', () => {
      const analysis: PromptDLAnalysis = {
        sentiment: 'neutral',
        keyTopics: [],
        complexity: 0.5,
        urgency: 0.5,
      };
      const out = buildDLPromptEnhancement(analysis, { instructions: '스페인어로 답변' });
      expect(out).toContain('[프로젝트 지침 반영]');
      expect(out).toContain('이 프로젝트의 지침에 맞춰');
    });

    it('projectContext 없으면 기존처럼 복잡도·감정 등만 반영', () => {
      const analysis: PromptDLAnalysis = {
        sentiment: 'negative',
        keyTopics: ['a'],
        complexity: 0.8,
        urgency: 0.5,
        suggestedFocus: '주요 주제: a',
      };
      const out = buildDLPromptEnhancement(analysis);
      expect(out).not.toContain('[프로젝트 지침 반영]');
      expect(out).toContain('단계별로 구분하여 상세히');
      expect(out).toContain('공감적이고 해결 중심');
    });
  });

  describe('analyzeResponseWithDL', () => {
    it('응답 분석 성공 시 감정·주제·참여도·대화단계·신뢰도 반환', async () => {
      mockAnalyzeConversation.mockResolvedValue({
        sentiment: 'neutral',
        keyTopics: ['시공사', '선정'],
        engagement: 0.8,
        conversationFlow: { phase: 'resolution', confidence: 0.9 },
        participants: [],
        complexity: 0.5,
        urgency: 0.5,
      });

      const result = await analyzeResponseWithDL('시공사 선정 기준이 뭔가요?', '시공사는 입찰을 통해 선정합니다.');

      expect(mockAnalyzeConversation).toHaveBeenCalledTimes(1);
      const messages = mockAnalyzeConversation.mock.calls[0][0];
      expect(messages).toHaveLength(2);
      expect(messages[0].sender).toBe('user');
      expect(messages[0].content).toBe('시공사 선정 기준이 뭔가요?');
      expect(messages[1].sender).toBe('assistant');
      expect(messages[1].content).toBe('시공사는 입찰을 통해 선정합니다.');

      expect(result).toMatchObject({
        sentiment: 'neutral',
        keyTopics: ['시공사', '선정'],
        engagement: 0.8,
        conversationPhase: 'resolution',
        confidence: 0.9,
      } as ResponseDLAnalysis);
    });

    it('분석 실패 시 기본값 반환 및 errorLogger 호출', async () => {
      const { errorLogger } = require('../../utils/errorLogger');
      mockAnalyzeConversation.mockRejectedValue(new Error('응답 분석 오류'));

      const result = await analyzeResponseWithDL('질문', '답변');

      expect(result).toEqual({
        sentiment: 'neutral',
        keyTopics: [],
        engagement: 0.5,
        conversationPhase: 'discussion',
        confidence: 0.5,
      });
      expect(errorLogger.error).toHaveBeenCalledWith(
        '응답 딥러닝 분석 실패',
        expect.any(Error),
        expect.objectContaining({ component: 'notebookLLMDeepLearningIntegration', action: 'analyzeResponseWithDL' })
      );
    });
  });

  describe('buildMessageToSendForChat', () => {
    it('options 없으면 전송용 메시지 문자열만 반환', async () => {
      mockAnalyzeConversation.mockResolvedValue({
        sentiment: 'neutral',
        keyTopics: ['테스트'],
        complexity: 0.5,
        urgency: 0.5,
        conversationFlow: { phase: 'discussion', confidence: 0.5 },
        participants: [],
        engagement: 0.5,
      });

      const result = await buildMessageToSendForChat('원본 메시지', '사용자 입력');

      expect(typeof result).toBe('string');
      expect((result as string).startsWith('원본 메시지')).toBe(true);
    });

    it('includeAnalysis: true면 messageToSend와 promptAnalysis 반환', async () => {
      mockAnalyzeConversation.mockResolvedValue({
        sentiment: 'positive',
        keyTopics: ['재개발'],
        complexity: 0.6,
        urgency: 0.3,
        conversationFlow: { phase: 'discussion', confidence: 0.8 },
        participants: [],
        engagement: 0.5,
      });

      const result = await buildMessageToSendForChat('요청', '재개발 알려줘', undefined, { includeAnalysis: true });

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('messageToSend');
      expect(result).toHaveProperty('promptAnalysis');
      expect((result as { messageToSend: string }).messageToSend).toContain('요청');
      expect((result as { promptAnalysis: PromptDLAnalysis }).promptAnalysis).toMatchObject({
        sentiment: 'positive',
        keyTopics: ['재개발'],
        complexity: 0.6,
        urgency: 0.3,
      });
    });

    it('분석 실패 시 원본 requestMessage 반환', async () => {
      mockAnalyzeConversation.mockRejectedValue(new Error('DL 오류'));

      const resultStr = await buildMessageToSendForChat('원본', '입력');
      const resultObj = await buildMessageToSendForChat('원본', '입력', undefined, { includeAnalysis: true });

      expect(resultStr).toBe('원본');
      expect((resultObj as { messageToSend: string }).messageToSend).toBe('원본');
    });
  });
});
