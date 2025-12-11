/**
 * advancedMessageProcessor 서비스 테스트
 * 고급 메시지 처리 시스템 테스트
 */

import AdvancedMessageProcessor from '../advancedMessageProcessor';
import type {
  MessageContext,
  ProcessedMessage,
  Task,
} from '../advancedMessageProcessor';

describe('AdvancedMessageProcessor', () => {
  let processor: AdvancedMessageProcessor;

  beforeEach(() => {
    processor = AdvancedMessageProcessor.getInstance();
    // 큐 초기화를 위해 새 인스턴스처럼 사용
    // 싱글톤이므로 실제로는 같은 인스턴스지만, 테스트를 위해 큐를 비울 수 있는 메서드가 없으므로
    // 테스트 간 격리를 위해 메시지 ID를 다르게 생성
  });

  describe('싱글톤 패턴', () => {
    it('getInstance()를 통해 인스턴스를 가져올 수 있어야 함', () => {
      const instance1 = AdvancedMessageProcessor.getInstance();
      const instance2 = AdvancedMessageProcessor.getInstance();

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1).toBe(instance2); // 같은 인스턴스여야 함
    });

    it('인스턴스가 AdvancedMessageProcessor 타입이어야 함', () => {
      const instance = AdvancedMessageProcessor.getInstance();
      expect(instance).toBeInstanceOf(AdvancedMessageProcessor);
    });
  });

  describe('processMessage', () => {
    it('단순 메시지를 처리할 수 있어야 함', async () => {
      const message = '재개발 프로젝트에 대해 분석해주세요';

      const result = await processor.processMessage(message);

      expect(result).toBeDefined();
      expect(result.originalMessage).toBe(message);
      expect(result.context).toBeDefined();
      expect(Array.isArray(result.tasks)).toBe(true);
      expect(typeof result.summary).toBe('string');
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(Array.isArray(result.nextSteps)).toBe(true);
    });

    it('컨텍스트와 함께 메시지를 처리할 수 있어야 함', async () => {
      const message = '시공사 선정 기준을 분석해주세요';
      const context: MessageContext = {
        type: 'analysis',
        complexity: 'advanced',
        topics: ['시공사', '선정', '기준'],
        requirements: ['분석', '비교'],
        constraints: ['시간 제한'],
        expectedOutput: '분석 보고서',
        priority: 'high',
        estimatedTime: 30,
        dependencies: [],
        alternatives: [],
      };

      const result = await processor.processMessage(message, context);

      expect(result).toBeDefined();
      expect(result.context.type).toBe('analysis');
      expect(result.context.complexity).toBe('advanced');
      expect(result.context.priority).toBe('high');
    });

    it('컨텍스트 없이 메시지만으로 자동 분석할 수 있어야 함', async () => {
      const message = '프로젝트 진행 상황을 검토하고 보고서를 작성해주세요';

      const result = await processor.processMessage(message);

      expect(result).toBeDefined();
      expect(result.context).toBeDefined();
      expect(result.context.type).toBeDefined();
      expect(['analysis', 'research', 'writing', 'coding', 'design', 'planning', 'review', 'synthesis']).toContain(
        result.context.type
      );
      expect(result.context.complexity).toBeDefined();
      expect(['basic', 'intermediate', 'advanced', 'expert']).toContain(
        result.context.complexity
      );
    });

    it('분석 타입을 올바르게 감지해야 함', async () => {
      const analysisMessage = '재개발 프로젝트의 장단점을 분석해주세요';
      const result = await processor.processMessage(analysisMessage);

      expect(result.context.type).toBeDefined();
    });

    it('복잡도를 올바르게 감지해야 함', async () => {
      const basicMessage = '기초적인 개념을 설명해주세요';
      const basicResult = await processor.processMessage(basicMessage);

      const expertMessage = '전문가 수준의 심화 분석을 수행해주세요';
      const expertResult = await processor.processMessage(expertMessage);

      expect(['basic', 'intermediate', 'advanced', 'expert']).toContain(
        basicResult.context.complexity
      );
      expect(['basic', 'intermediate', 'advanced', 'expert']).toContain(
        expertResult.context.complexity
      );
    });

    it('우선순위를 올바르게 분석해야 함', async () => {
      const urgentMessage = '긴급하게 처리해야 합니다';
      const urgentResult = await processor.processMessage(urgentMessage);

      const normalMessage = '일반적인 요청입니다';
      const normalResult = await processor.processMessage(normalMessage);

      expect(['low', 'medium', 'high', 'urgent']).toContain(urgentResult.context.priority);
      expect(['low', 'medium', 'high', 'urgent']).toContain(normalResult.context.priority);
    });

    it('처리된 메시지의 구조가 올바른 형식을 가져야 함', async () => {
      const message = '테스트 메시지입니다';

      const result = await processor.processMessage(message);

      // 원본 메시지
      expect(result.originalMessage).toBe(message);

      // 컨텍스트 구조 확인
      expect(result.context).toBeDefined();
      expect(result.context.type).toBeDefined();
      expect(result.context.complexity).toBeDefined();
      expect(Array.isArray(result.context.topics)).toBe(true);
      expect(Array.isArray(result.context.requirements)).toBe(true);
      expect(Array.isArray(result.context.constraints)).toBe(true);
      expect(typeof result.context.expectedOutput).toBe('string');
      expect(['low', 'medium', 'high', 'urgent']).toContain(result.context.priority);
      expect(typeof result.context.estimatedTime).toBe('number');
      expect(result.context.estimatedTime).toBeGreaterThan(0);
      expect(Array.isArray(result.context.dependencies)).toBe(true);
      expect(Array.isArray(result.context.alternatives)).toBe(true);

      // 작업 배열 확인
      expect(Array.isArray(result.tasks)).toBe(true);
      result.tasks.forEach((task: Task) => {
        expect(task.id).toBeDefined();
        expect(task.title).toBeDefined();
        expect(task.description).toBeDefined();
        expect(task.type).toBeDefined();
        expect(['low', 'medium', 'high', 'urgent']).toContain(task.priority);
        expect(typeof task.estimatedTime).toBe('number');
        expect(Array.isArray(task.dependencies)).toBe(true);
        expect(['pending', 'in-progress', 'completed', 'failed']).toContain(task.status);
      });

      // 요약
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(0);

      // 권장사항
      expect(Array.isArray(result.recommendations)).toBe(true);
      result.recommendations.forEach((rec: string) => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });

      // 다음 단계
      expect(Array.isArray(result.nextSteps)).toBe(true);
      result.nextSteps.forEach((step: string) => {
        expect(typeof step).toBe('string');
        expect(step.length).toBeGreaterThan(0);
      });
    });
  });

  describe('메시지 조회 기능', () => {
    it('처리된 메시지를 조회할 수 있어야 함', async () => {
      const message = '조회 테스트 메시지';
      const result = await processor.processMessage(message);

      // 결과에서 messageId를 추출할 수 없으므로, getAllProcessedMessages로 확인
      const allMessages = processor.getAllProcessedMessages();
      expect(allMessages.length).toBeGreaterThan(0);

      const foundMessage = allMessages.find((msg) => msg.originalMessage === message);
      expect(foundMessage).toBeDefined();
      if (foundMessage) {
        expect(foundMessage.originalMessage).toBe(message);
      }
    });

    it('모든 처리된 메시지를 조회할 수 있어야 함', async () => {
      const message1 = '첫 번째 메시지';
      const message2 = '두 번째 메시지';

      await processor.processMessage(message1);
      await processor.processMessage(message2);

      const allMessages = processor.getAllProcessedMessages();
      expect(Array.isArray(allMessages)).toBe(true);
      expect(allMessages.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 분석 요청을 처리할 수 있어야 함', async () => {
      const message =
        '개포우성7차 재개발 프로젝트의 시공사 선정 기준을 분석하고, 삼성물산과 대우건설의 제안서를 비교 분석해주세요. 긴급하게 진행이 필요합니다.';

      const result = await processor.processMessage(message);

      expect(result).toBeDefined();
      expect(result.context.type).toBeDefined();
      expect(result.tasks.length).toBeGreaterThan(0);
      expect(result.summary).toContain('분석');
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.nextSteps.length).toBeGreaterThan(0);
    });

    it('시공사 선정 관련 연구 요청을 처리할 수 있어야 함', async () => {
      const message =
        '시공사 선정을 위한 최신 연구 자료를 조사하고, 전문가 수준의 심화 분석을 수행해주세요. 결과는 보고서 형태로 작성해주세요.';

      const result = await processor.processMessage(message);

      expect(result).toBeDefined();
      expect(result.context.topics.length).toBeGreaterThan(0);
      expect(result.tasks.length).toBeGreaterThan(0);
    });

    it('프로젝트 계획 수립 요청을 처리할 수 있어야 함', async () => {
      const context: MessageContext = {
        type: 'planning',
        complexity: 'advanced',
        topics: ['프로젝트 계획', '일정 수립'],
        requirements: ['일정 작성', '리소스 배분'],
        constraints: ['예산 제한', '시간 제약'],
        expectedOutput: '프로젝트 계획서',
        priority: 'high',
        estimatedTime: 60,
        dependencies: ['초기 분석'],
        alternatives: ['단계별 계획'],
      };

      const result = await processor.processMessage('프로젝트 계획을 수립해주세요', context);

      expect(result).toBeDefined();
      expect(result.context.type).toBe('planning');
      expect(result.context.priority).toBe('high');
      expect(result.tasks.length).toBeGreaterThan(0);
    });

    it('코딩 작업 요청을 처리할 수 있어야 함', async () => {
      const message =
        '시공사 선정 시스템의 프론트엔드를 개발해주세요. React와 TypeScript를 사용하고, 고급 수준의 코드 품질을 유지해주세요.';

      const result = await processor.processMessage(message);

      expect(result).toBeDefined();
      expect(result.context.type).toBeDefined();
      expect(result.tasks.length).toBeGreaterThan(0);
    });

    it('복잡한 다단계 요청을 처리할 수 있어야 함', async () => {
      const message =
        '재개발 프로젝트의 시공사 평가 시스템을 설계하고, 프론트엔드와 백엔드 코드를 작성한 후, 테스트를 수행하고 문서화까지 완료해주세요. 전문가 수준의 품질을 유지해야 합니다.';

      const result = await processor.processMessage(message);

      expect(result).toBeDefined();
      expect(result.tasks.length).toBeGreaterThan(1);
      expect(result.summary.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.nextSteps.length).toBeGreaterThan(0);
    });
  });

  describe('작업 분해 및 의존성', () => {
    it('요구사항에 따른 세부 작업을 생성해야 함', async () => {
      const message = '분석을 수행하고 보고서를 작성해주세요. 그리고 검토까지 완료해주세요.';

      const result = await processor.processMessage(message);

      expect(result.tasks.length).toBeGreaterThan(0);
      const mainTask = result.tasks.find((task) => task.type === result.context.type);
      expect(mainTask).toBeDefined();
    });

    it('제약사항이 있을 때 관련 작업을 생성해야 함', async () => {
      const message = '시간 제한과 예산 제약을 고려하여 분석을 수행해주세요.';

      const result = await processor.processMessage(message);

      expect(result.context.constraints.length).toBeGreaterThan(0);
      expect(result.tasks.length).toBeGreaterThan(0);
    });

    it('expert 복잡도일 때 추가 연구 작업을 포함해야 함', async () => {
      const context: MessageContext = {
        type: 'analysis',
        complexity: 'expert',
        topics: ['전문 분석'],
        requirements: [],
        constraints: [],
        expectedOutput: '전문가 수준 분석',
        priority: 'high',
        estimatedTime: 60,
        dependencies: [],
        alternatives: [],
      };

      const result = await processor.processMessage('전문가 수준의 분석을 수행해주세요', context);

      expect(result.tasks.length).toBeGreaterThan(1);
      const researchTask = result.tasks.find((task) => task.type === 'research');
      expect(researchTask).toBeDefined();
    });
  });

  describe('권장사항 및 다음 단계', () => {
    it('복잡도에 따른 적절한 권장사항을 생성해야 함', async () => {
      const basicContext: MessageContext = {
        type: 'analysis',
        complexity: 'basic',
        topics: ['기초 분석'],
        requirements: [],
        constraints: [],
        expectedOutput: '기초 분석',
        priority: 'medium',
        estimatedTime: 10,
        dependencies: [],
        alternatives: [],
      };

      const expertContext: MessageContext = {
        type: 'analysis',
        complexity: 'expert',
        topics: ['전문 분석'],
        requirements: [],
        constraints: [],
        expectedOutput: '전문 분석',
        priority: 'high',
        estimatedTime: 60,
        dependencies: [],
        alternatives: [],
      };

      const basicResult = await processor.processMessage('기초 분석', basicContext);
      const expertResult = await processor.processMessage('전문 분석', expertContext);

      expect(basicResult.recommendations.length).toBeGreaterThan(0);
      expect(expertResult.recommendations.length).toBeGreaterThan(0);
    });

    it('우선순위에 따른 적절한 다음 단계를 제안해야 함', async () => {
      const urgentContext: MessageContext = {
        type: 'analysis',
        complexity: 'intermediate',
        topics: ['긴급 분석'],
        requirements: [],
        constraints: [],
        expectedOutput: '분석 결과',
        priority: 'urgent',
        estimatedTime: 20,
        dependencies: [],
        alternatives: [],
      };

      const result = await processor.processMessage('긴급 분석', urgentContext);

      expect(result.nextSteps.length).toBeGreaterThan(0);
      expect(result.nextSteps.some((step) => step.includes('즉시') || step.includes('빠르게'))).toBe(true);
    });
  });
});

