/**
 * AIResponseQualityService 테스트
 */

import {
  aiResponseQualityService,
  AIResponseQualityService,
} from '../aiResponseQualityService';

describe('AIResponseQualityService', () => {
  let service: AIResponseQualityService;

  beforeEach(() => {
    service = new AIResponseQualityService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(AIResponseQualityService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiResponseQualityService).toBeInstanceOf(AIResponseQualityService);
    });
  });

  describe('응답 품질 분석', () => {
    const mockContext = {
      userIntent: 'React에서 상태 관리는 어떻게 하나요?',
      conversationHistory: ['이전 대화 내용'],
      attachedFiles: [],
    };

    it('응답 품질 분석 수행', async () => {
      const response = 'React에서는 useState 훅을 사용하여 상태를 관리합니다.';
      const analysis = await service.analyzeResponseQuality(response, mockContext);

      expect(analysis).toBeDefined();
      expect(analysis.originalResponse).toBe(response);
      expect(analysis.improvedResponse).toBeDefined();
      expect(typeof analysis.improvedResponse).toBe('string');
      expect(analysis.qualityMetrics).toBeDefined();
      expect(Array.isArray(analysis.improvements)).toBe(true);
      expect(typeof analysis.overallScore).toBe('number');
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(1);
      expect(typeof analysis.processingTime).toBe('number');
      expect(typeof analysis.language).toBe('string');
      expect(analysis.context).toBeDefined();
    });

    it('품질 메트릭 구조 확인', async () => {
      const response = '테스트 응답입니다.';
      const analysis = await service.analyzeResponseQuality(response, mockContext);

      const metrics = analysis.qualityMetrics;
      expect(typeof metrics.accuracy).toBe('number');
      expect(typeof metrics.relevance).toBe('number');
      expect(typeof metrics.creativity).toBe('number');
      expect(typeof metrics.completeness).toBe('number');
      expect(typeof metrics.clarity).toBe('number');
      expect(typeof metrics.engagement).toBe('number');
      expect(typeof metrics.coherence).toBe('number');
      expect(typeof metrics.helpfulness).toBe('number');

      // 모든 메트릭이 0-1 범위인지 확인
      Object.values(metrics).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('개선 사항 확인', async () => {
      const response = '짧은 응답';
      const analysis = await service.analyzeResponseQuality(response, mockContext);

      expect(Array.isArray(analysis.improvements)).toBe(true);
      analysis.improvements.forEach((improvement) => {
        if (improvement.type) {
          expect([
            'accuracy',
            'relevance',
            'creativity',
            'completeness',
            'clarity',
            'engagement',
            'coherence',
            'helpfulness',
          ]).toContain(improvement.type);
        }
        if (improvement.priority) {
          expect(['high', 'medium', 'low']).toContain(improvement.priority);
        }
        if (improvement.suggestion) {
          expect(typeof improvement.suggestion).toBe('string');
        }
        if (improvement.confidence !== undefined) {
          expect(typeof improvement.confidence).toBe('number');
          expect(improvement.confidence).toBeGreaterThanOrEqual(0);
          expect(improvement.confidence).toBeLessThanOrEqual(1);
        }
      });
    });

    it('대화 히스토리가 있는 컨텍스트', async () => {
      const context = {
        userIntent: '추가 질문',
        conversationHistory: [
          '첫 번째 메시지',
          '두 번째 메시지',
          '세 번째 메시지',
        ],
        attachedFiles: ['file1.txt'],
      };

      const response = '대화 히스토리를 고려한 응답입니다.';
      const analysis = await service.analyzeResponseQuality(response, context);

      expect(analysis.context.conversationHistory).toEqual(context.conversationHistory);
      expect(analysis.context.attachedFiles).toEqual(context.attachedFiles);
    });

    it('프로젝트 컨텍스트가 있는 경우', async () => {
      const context = {
        userIntent: '프로젝트 관련 질문',
        conversationHistory: [],
        attachedFiles: [],
        projectContext: {
          projectId: 'project-1',
          name: '테스트 프로젝트',
        },
      };

      const response = '프로젝트 컨텍스트를 고려한 응답입니다.';
      const analysis = await service.analyzeResponseQuality(response, context);

      expect(analysis.context.projectContext).toBeDefined();
    });

    it('긴 응답 분석', async () => {
      const longResponse =
        'React에서 상태 관리는 매우 중요한 개념입니다. ' +
        'useState 훅을 사용하면 함수형 컴포넌트에서도 상태를 관리할 수 있습니다. ' +
        '또한 useReducer를 사용하면 더 복잡한 상태 로직을 관리할 수 있습니다. ' +
        '상태 관리를 위한 여러 패턴과 베스트 프랙티스가 있습니다.';

      const analysis = await service.analyzeResponseQuality(longResponse, mockContext);

      expect(analysis.originalResponse.length).toBeGreaterThan(100);
      expect(analysis.qualityMetrics.completeness).toBeGreaterThan(0);
    });

    it('빈 응답 분석', async () => {
      const response = '';
      const analysis = await service.analyzeResponseQuality(response, mockContext);

      expect(analysis).toBeDefined();
      expect(analysis.originalResponse).toBe('');
    });
  });

  describe('실시간 품질 모니터링', () => {
    it('품질 모니터링 시작 및 중지', () => {
      jest.useFakeTimers();

      const callback = jest.fn();
      const stopMonitoring = service.startQualityMonitoring(callback);

      // 시간 진행
      jest.advanceTimersByTime(5000);

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0]).toBeDefined();

      const metrics = callback.mock.calls[0][0] as ResponseQualityMetrics;
      expect(typeof metrics.accuracy).toBe('number');
      expect(typeof metrics.relevance).toBe('number');
      expect(typeof metrics.creativity).toBe('number');
      expect(typeof metrics.completeness).toBe('number');
      expect(typeof metrics.clarity).toBe('number');
      expect(typeof metrics.engagement).toBe('number');
      expect(typeof metrics.coherence).toBe('number');
      expect(typeof metrics.helpfulness).toBe('number');

      // 모니터링 중지
      stopMonitoring();

      const callCount = callback.mock.calls.length;
      jest.advanceTimersByTime(10000);

      // 중지 후에는 콜백이 호출되지 않아야 함
      expect(callback.mock.calls.length).toBe(callCount);

      jest.useRealTimers();
    });

    it('여러 번 모니터링 콜백 호출', () => {
      jest.useFakeTimers();

      const callback = jest.fn();
      const stopMonitoring = service.startQualityMonitoring(callback);

      // 여러 번 시간 진행
      jest.advanceTimersByTime(5000);
      jest.advanceTimersByTime(5000);
      jest.advanceTimersByTime(5000);

      expect(callback).toHaveBeenCalledTimes(3);

      stopMonitoring();
      jest.useRealTimers();
    });
  });

  describe('다양한 응답 타입', () => {
    it('기술 질문 응답 분석', async () => {
      const context = {
        userIntent: 'TypeScript의 제네릭은 무엇인가요?',
        conversationHistory: [],
        attachedFiles: [],
      };

      const response =
        'TypeScript의 제네릭은 타입을 매개변수로 받아 재사용 가능한 컴포넌트를 만드는 기능입니다.';
      const analysis = await service.analyzeResponseQuality(response, context);

      expect(analysis.qualityMetrics.relevance).toBeGreaterThan(0);
      expect(analysis.qualityMetrics.accuracy).toBeGreaterThan(0);
    });

    it('창의적 응답 분석', async () => {
      const context = {
        userIntent: '창의적인 아이디어를 제안해주세요',
        conversationHistory: [],
        attachedFiles: [],
      };

      const response = '혁신적이고 독창적인 아이디어입니다.';
      const analysis = await service.analyzeResponseQuality(response, context);

      expect(analysis.qualityMetrics.creativity).toBeGreaterThan(0);
    });

    it('상세한 응답 분석', async () => {
      const context = {
        userIntent: '상세한 설명을 원합니다',
        conversationHistory: [],
        attachedFiles: [],
      };

      const response =
        '이것은 매우 상세하고 포괄적인 설명입니다. ' +
        '첫째, 기본 개념을 설명하고, 둘째, 구체적인 예시를 제공하며, ' +
        '셋째, 실무 적용 방법을 안내합니다.';
      const analysis = await service.analyzeResponseQuality(response, context);

      expect(analysis.qualityMetrics.completeness).toBeGreaterThanOrEqual(0);
      expect(analysis.qualityMetrics.helpfulness).toBeGreaterThanOrEqual(0);
    });
  });

  describe('전체 점수 계산', () => {
    it('전체 점수 범위 확인', async () => {
      const response = '테스트 응답입니다.';
      const context = {
        userIntent: '테스트 질문',
        conversationHistory: [],
        attachedFiles: [],
      };

      const analysis = await service.analyzeResponseQuality(response, context);

      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(1);
    });
  });

  describe('언어 감지', () => {
    it('한국어 응답 분석', async () => {
      const response = '한국어로 작성된 응답입니다.';
      const context = {
        userIntent: '한국어 질문',
        conversationHistory: [],
        attachedFiles: [],
      };

      const analysis = await service.analyzeResponseQuality(response, context);

      expect(analysis.language).toBeDefined();
      expect(typeof analysis.language).toBe('string');
    });

    it('영어 응답 분석', async () => {
      const response = 'This is an English response.';
      const context = {
        userIntent: 'English question',
        conversationHistory: [],
        attachedFiles: [],
      };

      const analysis = await service.analyzeResponseQuality(response, context);

      expect(analysis.language).toBeDefined();
    });
  });

  describe('처리 시간', () => {
    it('처리 시간 측정', async () => {
      const response = '처리 시간을 측정하는 테스트입니다.';
      const context = {
        userIntent: '테스트',
        conversationHistory: [],
        attachedFiles: [],
      };

      const analysis = await service.analyzeResponseQuality(response, context);

      expect(analysis.processingTime).toBeGreaterThanOrEqual(0);
      expect(typeof analysis.processingTime).toBe('number');
    });
  });
});

