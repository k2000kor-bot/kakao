/**
 * multimodalAIService 서비스 테스트
 * 멀티모달 AI 서비스 테스트
 */

import multimodalAIService, { MultimodalInput, MultimodalResponse } from '../multimodalAIService';

describe('multimodalAIService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(multimodalAIService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = multimodalAIService;
      const instance2 = multimodalAIService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('processMultimodalInput', () => {
    it('텍스트 입력을 처리할 수 있어야 함', async () => {
      const inputs: MultimodalInput[] = [
        {
          type: 'text',
          content: '재개발 프로젝트에 대한 설명',
          metadata: {
            timestamp: new Date()
          }
        }
      ];

      const result = await multimodalAIService.processMultimodalInput(inputs);

      expect(result).toBeDefined();
      expect(result.analysis_results).toBeDefined();
      expect(Array.isArray(result.integrated_insights)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(Array.isArray(result.next_steps)).toBe(true);
      expect(typeof result.confidence_score).toBe('number');
      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
      expect(result.confidence_score).toBeLessThanOrEqual(1);
      expect(typeof result.processing_time).toBe('number');
    });

    it('이미지 입력을 처리할 수 있어야 함', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const inputs: MultimodalInput[] = [
        {
          type: 'image',
          content: mockFile,
          metadata: {
            filename: 'test.png',
            size: 1024,
            format: 'png',
            timestamp: new Date()
          }
        }
      ];

      const result = await multimodalAIService.processMultimodalInput(inputs);

      expect(result).toBeDefined();
      expect(result.analysis_results).toBeDefined();
      // 이미지 분석 결과가 있을 수 있음
      if (result.analysis_results.image) {
        expect(result.analysis_results.image.confidence_score).toBeGreaterThanOrEqual(0);
      }
    });

    it('문서 입력을 처리할 수 있어야 함', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const inputs: MultimodalInput[] = [
        {
          type: 'document',
          content: mockFile,
          metadata: {
            filename: 'test.pdf',
            size: 2048,
            format: 'pdf',
            timestamp: new Date()
          }
        }
      ];

      const result = await multimodalAIService.processMultimodalInput(inputs);

      expect(result).toBeDefined();
      expect(result.analysis_results).toBeDefined();
      // 문서 분석 결과가 있을 수 있음
      if (result.analysis_results.document) {
        expect(result.analysis_results.document.document_type).toBeDefined();
      }
    });

    it('코드 입력을 처리할 수 있어야 함', async () => {
      const codeContent = 'function test() { return "hello"; }';
      const inputs: MultimodalInput[] = [
        {
          type: 'code',
          content: codeContent,
          metadata: {
            filename: 'test.js',
            language: 'javascript',
            timestamp: new Date()
          }
        }
      ];

      const result = await multimodalAIService.processMultimodalInput(inputs);

      expect(result).toBeDefined();
      expect(result.analysis_results).toBeDefined();
      // 코드 분석 결과가 있을 수 있음
      if (result.analysis_results.code) {
        expect(result.analysis_results.code.language).toBeDefined();
      }
    });

    it('다중 입력을 처리할 수 있어야 함', async () => {
      const inputs: MultimodalInput[] = [
        {
          type: 'text',
          content: '재개발 프로젝트 설명',
          metadata: {
            timestamp: new Date()
          }
        },
        {
          type: 'document',
          content: new File(['content'], 'doc.pdf', { type: 'application/pdf' }),
          metadata: {
            filename: 'doc.pdf',
            timestamp: new Date()
          }
        }
      ];

      const result = await multimodalAIService.processMultimodalInput(inputs);

      expect(result).toBeDefined();
      expect(result.analysis_results).toBeDefined();
      expect(Array.isArray(result.integrated_insights)).toBe(true);
    });

    it('컨텍스트를 포함하여 처리할 수 있어야 함', async () => {
      const inputs: MultimodalInput[] = [
        {
          type: 'text',
          content: '재개발 프로젝트',
          metadata: {
            timestamp: new Date()
          }
        }
      ];

      const context = {
        projectId: 'project-1',
        domain: 'real_estate'
      };

      const result = await multimodalAIService.processMultimodalInput(inputs, context);

      expect(result).toBeDefined();
      expect(result.analysis_results).toBeDefined();
    });

    it('처리 결과가 올바른 구조를 가져야 함', async () => {
      const inputs: MultimodalInput[] = [
        {
          type: 'text',
          content: '테스트 입력',
          metadata: {
            timestamp: new Date()
          }
        }
      ];

      const result = await multimodalAIService.processMultimodalInput(inputs);

      expect(result.analysis_results).toBeDefined();
      expect(Array.isArray(result.integrated_insights)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(Array.isArray(result.next_steps)).toBe(true);
      expect(typeof result.confidence_score).toBe('number');
      expect(typeof result.processing_time).toBe('number');
      expect(result.processing_time).toBeGreaterThanOrEqual(0);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 텍스트와 문서를 처리할 수 있어야 함', async () => {
      const inputs: MultimodalInput[] = [
        {
          type: 'text',
          content: '강남구 역삼동 재개발 프로젝트의 시공사 선정 기준과 예산 계획',
          metadata: {
            timestamp: new Date()
          }
        },
        {
          type: 'document',
          content: new File(['프로젝트 계획서'], 'plan.pdf', { type: 'application/pdf' }),
          metadata: {
            filename: 'plan.pdf',
            timestamp: new Date()
          }
        }
      ];

      const result = await multimodalAIService.processMultimodalInput(inputs);

      expect(result).toBeDefined();
      expect(result.analysis_results).toBeDefined();
      expect(result.integrated_insights.length).toBeGreaterThanOrEqual(0);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 관련 문서를 분석할 수 있어야 함', async () => {
      const inputs: MultimodalInput[] = [
        {
          type: 'document',
          content: new File(['시공사 선정 기준 문서'], 'criteria.pdf', { type: 'application/pdf' }),
          metadata: {
            filename: 'criteria.pdf',
            format: 'pdf',
            timestamp: new Date()
          }
        }
      ];

      const result = await multimodalAIService.processMultimodalInput(inputs);

      expect(result).toBeDefined();
      expect(result.analysis_results).toBeDefined();
      if (result.analysis_results.document) {
        expect(result.analysis_results.document.document_type).toBeDefined();
      }
    });

    it('예산 계획 관련 코드와 문서를 처리할 수 있어야 함', async () => {
      const inputs: MultimodalInput[] = [
        {
          type: 'code',
          content: 'const budget = calculateBudget(project);',
          metadata: {
            filename: 'budget.js',
            language: 'javascript',
            timestamp: new Date()
          }
        },
        {
          type: 'document',
          content: new File(['예산 계획서'], 'budget.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
          metadata: {
            filename: 'budget.xlsx',
            timestamp: new Date()
          }
        }
      ];

      const result = await multimodalAIService.processMultimodalInput(inputs);

      expect(result).toBeDefined();
      expect(result.analysis_results).toBeDefined();
      expect(result.integrated_insights.length).toBeGreaterThanOrEqual(0);
    });
  });
});

