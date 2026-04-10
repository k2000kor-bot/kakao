/**
 * UltraAdvancedAIService 테스트
 */
import { DEFAULT_CHAT_RESPONSE_STYLE } from '../../utils/modernChatUrlStyle';
import { ultraAdvancedAIService } from '../ultraAdvancedAIService';
import type { WorkflowStep, WorkflowTrigger } from '../ultraAdvancedAIService';

describe('UltraAdvancedAIService', () => {
  const baseContext = {
    sessionId: 'session-1',
    userId: 'user-1',
    messageHistory: [],
    metadata: {}
  };

  describe('performUltraAnalysis', () => {
    it('분석 결과 반환', async () => {
      const result = await ultraAdvancedAIService.performUltraAnalysis(
        '이 프로젝트의 성능을 분석해주세요',
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.analysis.intent).toBeDefined();
      expect(Array.isArray(result.analysis.entities)).toBe(true);
      expect(result.analysis.sentiment).toBeDefined();
      expect(typeof result.analysis.sentiment.score).toBe('number');
      expect(typeof result.confidence).toBe('number');
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(Array.isArray(result.insights)).toBe(true);
      expect(Array.isArray(result.predictedActions)).toBe(true);
    });
  });

  describe('updateLearningData', () => {
    it('학습 데이터 업데이트', async () => {
      await ultraAdvancedAIService.performUltraAnalysis('테스트 질문', baseContext);

      const data = ultraAdvancedAIService.getLearningData('user-1');
      expect(data).toBeDefined();
      expect(data?.userId).toBe('user-1');
      expect(data?.patterns).toBeDefined();
      expect(data?.preferences).toBeDefined();
      expect(data?.preferences.responseStyle).toBe(DEFAULT_CHAT_RESPONSE_STYLE);
    });
  });

  describe('getLearningData', () => {
    it('존재하지 않는 사용자 undefined', () => {
      const result = ultraAdvancedAIService.getLearningData('nonexistent-user');
      expect(result).toBeUndefined();
    });
  });

  describe('createIntelligentWorkflow', () => {
    it('워크플로우 생성', async () => {
      const steps: WorkflowStep[] = [
        {
          id: 'step-1',
          type: 'analysis',
          config: {}
        }
      ];
      const triggers: WorkflowTrigger[] = [
        {
          type: 'message',
          config: {}
        }
      ];

      const workflow = await ultraAdvancedAIService.createIntelligentWorkflow(
        '테스트 워크플로우',
        '설명',
        steps,
        triggers
      );

      expect(workflow).toBeDefined();
      expect(workflow.id).toMatch(/^workflow-/);
      expect(workflow.name).toBe('테스트 워크플로우');
      expect(workflow.steps).toEqual(steps);
      expect(workflow.status).toBe('active');
    });
  });

  describe('executeWorkflow', () => {
    it('워크플로우 실행', async () => {
      const steps: WorkflowStep[] = [
        {
          id: 'step-1',
          type: 'analysis',
          config: {}
        }
      ];
      const workflow = await ultraAdvancedAIService.createIntelligentWorkflow(
        '실행 테스트',
        'desc',
        steps,
        []
      );

      const result = await ultraAdvancedAIService.executeWorkflow(workflow.id, {});

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.results)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('존재하지 않는 워크플로우 ID 시 에러', async () => {
      await expect(
        ultraAdvancedAIService.executeWorkflow('nonexistent', {})
      ).rejects.toThrow('not found');
    });
  });

  describe('getInsights', () => {
    it('인사이트 목록 반환', async () => {
      await ultraAdvancedAIService.performUltraAnalysis(
        '복잡한 분석이 필요한 긴 질문입니다. 여러 단계로 나누어 상세히 분석해주세요.',
        baseContext
      );

      const insights = ultraAdvancedAIService.getInsights(5);
      expect(Array.isArray(insights)).toBe(true);
      insights.forEach(i => {
        expect(i).toHaveProperty('id');
        expect(i).toHaveProperty('type');
        expect(i).toHaveProperty('title');
        expect(i).toHaveProperty('confidence');
      });
    });

    it('limit 적용', async () => {
      const insights = ultraAdvancedAIService.getInsights(2);
      expect(insights.length).toBeLessThanOrEqual(2);
    });
  });
});
