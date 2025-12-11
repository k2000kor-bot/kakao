/**
 * advancedTextProcessor 서비스 테스트
 * 고급 텍스트 처리 서비스 테스트
 */

import advancedTextProcessor, {
  TextProcessingRequest,
  WritingStyle,
  PoliticalTendency,
  MessageFormat
} from '../advancedTextProcessor';

describe('advancedTextProcessor', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedTextProcessor).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedTextProcessor;
      const instance2 = advancedTextProcessor;
      expect(instance1).toBe(instance2);
    });
  });

  describe('processText', () => {
    const createDefaultRequest = (text: string): TextProcessingRequest => ({
      originalText: text,
      targetStyle: {
        tone: 'professional',
        complexity: 'moderate',
        formality: 'formal',
        audience: 'general',
        purpose: 'inform'
      },
      politicalContext: {
        bias: 'neutral',
        perspective: 'balanced',
        approach: 'objective'
      },
      format: {
        structure: 'analytical',
        length: 'moderate',
        organization: 'logical',
        emphasis: 'facts'
      }
    });

    it('텍스트를 처리할 수 있어야 함', async () => {
      const request = createDefaultRequest('재개발 프로젝트의 시공사 선정은 중요합니다.');
      
      const result = await advancedTextProcessor.processText(request);
      
      expect(result).toBeDefined();
      expect(result.finalContent).toBeDefined();
      expect(Array.isArray(result.stages)).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.alternatives).toBeDefined();
    });

    it('처리 단계를 추적해야 함', async () => {
      const request = createDefaultRequest('시공사 선정 기준을 알려주세요.');
      
      const result = await advancedTextProcessor.processText(request);
      
      expect(result.stages.length).toBeGreaterThan(0);
      result.stages.forEach(stage => {
        expect(stage).toHaveProperty('name');
        expect(stage).toHaveProperty('description');
        expect(stage).toHaveProperty('processingTime');
        expect(typeof stage.confidence).toBe('number');
      });
    });

    it('메타데이터를 생성해야 함', async () => {
      const request = createDefaultRequest('재개발 프로젝트는 복잡한 과정입니다.');
      
      const result = await advancedTextProcessor.processText(request);
      
      expect(result.metadata.originalLength).toBeGreaterThan(0);
      expect(result.metadata.finalLength).toBeGreaterThan(0);
      expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.styleApplied).toBeDefined();
      expect(result.metadata.politicalBalance).toBeDefined();
      expect(result.metadata.formatUsed).toBeDefined();
      expect(typeof result.metadata.readabilityScore).toBe('number');
      expect(result.metadata.complexityLevel).toBeDefined();
      expect(Array.isArray(result.metadata.keyThemes)).toBe(true);
      expect(['positive', 'negative', 'neutral', 'mixed']).toContain(result.metadata.sentiment);
    });

    it('대안 버전을 생성해야 함', async () => {
      const request = createDefaultRequest('시공사 선정에 대해 설명해주세요.');
      
      const result = await advancedTextProcessor.processText(request);
      
      expect(result.alternatives.brief).toBeDefined();
      expect(result.alternatives.detailed).toBeDefined();
      expect(result.alternatives.technical).toBeDefined();
      expect(result.alternatives.casual).toBeDefined();
    });

    it('다양한 글쓰기 스타일을 적용할 수 있어야 함', async () => {
      const styles: WritingStyle[] = [
        { tone: 'formal', complexity: 'simple', formality: 'formal', audience: 'general', purpose: 'inform' },
        { tone: 'casual', complexity: 'moderate', formality: 'casual', audience: 'general', purpose: 'entertain' },
        { tone: 'professional', complexity: 'complex', formality: 'very_formal', audience: 'expert', purpose: 'analyze' }
      ];

      for (const style of styles) {
        const request: TextProcessingRequest = {
          originalText: '재개발 프로젝트에 대해 설명합니다.',
          targetStyle: style,
          politicalContext: {
            bias: 'neutral',
            perspective: 'balanced',
            approach: 'objective'
          },
          format: {
            structure: 'analytical',
            length: 'moderate',
            organization: 'logical',
            emphasis: 'facts'
          }
        };

        const result = await advancedTextProcessor.processText(request);
        expect(result).toBeDefined();
        expect(result.finalContent).toBeDefined();
      }
    });

    it('다양한 정치적 성향을 적용할 수 있어야 함', async () => {
      const tendencies: PoliticalTendency[] = [
        { bias: 'neutral', perspective: 'balanced', approach: 'objective' },
        { bias: 'progressive', perspective: 'left_leaning', approach: 'analytical' },
        { bias: 'conservative', perspective: 'right_leaning', approach: 'opinionated' }
      ];

      for (const tendency of tendencies) {
        const request: TextProcessingRequest = {
          originalText: '재개발 프로젝트 정책에 대해 분석합니다.',
          targetStyle: {
            tone: 'professional',
            complexity: 'moderate',
            formality: 'formal',
            audience: 'general',
            purpose: 'inform'
          },
          politicalContext: tendency,
          format: {
            structure: 'analytical',
            length: 'moderate',
            organization: 'logical',
            emphasis: 'facts'
          }
        };

        const result = await advancedTextProcessor.processText(request);
        expect(result).toBeDefined();
      }
    });

    it('다양한 메시지 형식을 적용할 수 있어야 함', async () => {
      const formats: MessageFormat[] = [
        { structure: 'narrative', length: 'brief', organization: 'chronological', emphasis: 'stories' },
        { structure: 'analytical', length: 'detailed', organization: 'logical', emphasis: 'data' },
        { structure: 'persuasive', length: 'moderate', organization: 'problem_solution', emphasis: 'opinions' }
      ];

      for (const format of formats) {
        const request: TextProcessingRequest = {
          originalText: '재개발 프로젝트의 중요성을 설명합니다.',
          targetStyle: {
            tone: 'professional',
            complexity: 'moderate',
            formality: 'formal',
            audience: 'general',
            purpose: 'inform'
          },
          politicalContext: {
            bias: 'neutral',
            perspective: 'balanced',
            approach: 'objective'
          },
          format
        };

        const result = await advancedTextProcessor.processText(request);
        expect(result).toBeDefined();
      }
    });

    it('타겟 길이를 지정할 수 있어야 함', async () => {
      const request: TextProcessingRequest = {
        originalText: '재개발 프로젝트는 복잡한 과정을 거칩니다. 시공사 선정은 기술력, 안전성, 경험을 종합적으로 평가해야 합니다.',
        targetStyle: {
          tone: 'professional',
          complexity: 'moderate',
          formality: 'formal',
          audience: 'general',
          purpose: 'inform'
        },
        politicalContext: {
          bias: 'neutral',
          perspective: 'balanced',
          approach: 'objective'
        },
        format: {
          structure: 'analytical',
          length: 'moderate',
          organization: 'logical',
          emphasis: 'facts'
        },
        targetLength: 100
      };

      const result = await advancedTextProcessor.processText(request);
      expect(result).toBeDefined();
    });

    it('키워드를 포함할 수 있어야 함', async () => {
      const request: TextProcessingRequest = {
        originalText: '시공사 선정에 대해 설명합니다.',
        targetStyle: {
          tone: 'professional',
          complexity: 'moderate',
          formality: 'formal',
          audience: 'general',
          purpose: 'inform'
        },
        politicalContext: {
          bias: 'neutral',
          perspective: 'balanced',
          approach: 'objective'
        },
        format: {
          structure: 'analytical',
          length: 'moderate',
          organization: 'logical',
          emphasis: 'facts'
        },
        keywords: ['시공사', '선정', '기준']
      };

      const result = await advancedTextProcessor.processText(request);
      expect(result).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 텍스트를 처리할 수 있어야 함', async () => {
      const request: TextProcessingRequest = {
        originalText: '개포우성7차 재개발 프로젝트의 시공사 선정은 매우 중요한 결정입니다. 기술력, 안전성, 경험을 종합적으로 평가해야 합니다.',
        targetStyle: {
          tone: 'professional',
          complexity: 'moderate',
          formality: 'formal',
          audience: 'expert',
          purpose: 'analyze'
        },
        politicalContext: {
          bias: 'neutral',
          perspective: 'balanced',
          approach: 'objective'
        },
        format: {
          structure: 'analytical',
          length: 'detailed',
          organization: 'logical',
          emphasis: 'facts'
        }
      };

      const result = await advancedTextProcessor.processText(request);
      
      expect(result).toBeDefined();
      expect(result.finalContent).toBeDefined();
      expect(result.metadata.keyThemes.length).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 기준 관련 텍스트를 처리할 수 있어야 함', async () => {
      const request: TextProcessingRequest = {
        originalText: '시공사 선정 기준은 기술력, 안전성, 경험입니다.',
        targetStyle: {
          tone: 'professional',
          complexity: 'simple',
          formality: 'formal',
          audience: 'general',
          purpose: 'inform'
        },
        politicalContext: {
          bias: 'neutral',
          perspective: 'balanced',
          approach: 'objective'
        },
        format: {
          structure: 'analytical',
          length: 'brief',
          organization: 'logical',
          emphasis: 'facts'
        }
      };

      const result = await advancedTextProcessor.processText(request);
      
      expect(result).toBeDefined();
      expect(result.alternatives.brief).toBeDefined();
    });
  });
});

