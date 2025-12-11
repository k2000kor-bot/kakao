/**
 * adaptiveWritingEngine 서비스 테스트
 * 고도화된 적응형 글쓰기 엔진 테스트
 */

import { adaptiveWritingEngine, SourceMaterial, WritingRequirements, GeneratedContent } from '../adaptiveWritingEngine';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('adaptiveWritingEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(adaptiveWritingEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = adaptiveWritingEngine;
      const instance2 = adaptiveWritingEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateAdaptiveContent', () => {
    it('기본 요구사항으로 콘텐츠를 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'original_text',
          content: '재개발 프로젝트는 복잡한 과정을 거칩니다.',
          metadata: {
            title: '재개발 프로젝트',
            word_count: 10
          }
        }
      ];

      const requirements: WritingRequirements = {
        topic: '재개발 프로젝트',
        purpose: 'inform',
        tone: {
          formality: 'formal',
          emotion: 'neutral',
          perspective: 'third_person',
          voice: 'active'
        },
        structure: {
          word_count: {
            target: 500
          }
        },
        sentence_style: {
          avg_length: 'medium',
          complexity: 'mixed',
          rhythm: 'varied',
          punctuation_style: 'standard'
        },
        content_requirements: {
          evidence_level: 'moderate',
          examples_needed: true,
          statistics_needed: false,
          quotes_needed: false
        },
        target_audience: {
          expertise_level: 'intermediate',
          age_group: 'adults'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.actual_word_count).toBeGreaterThanOrEqual(0);
      expect(result.metadata.actual_character_count).toBeGreaterThanOrEqual(0);
      expect(result.alternatives).toBeDefined();
      expect(result.improvement_suggestions).toBeDefined();
      expect(Array.isArray(result.improvement_suggestions)).toBe(true);
    });

    it('여러 소스 자료를 통합하여 콘텐츠를 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'original_text',
          content: '재개발 프로젝트 절차',
          metadata: { title: '절차' }
        },
        {
          type: 'knowledge_base',
          content: '시공사 선정 기준',
          metadata: { title: '시공사' }
        },
        {
          type: 'media_file',
          content: '예산 계획서 내용',
          metadata: { title: '예산', file_type: 'pdf' }
        }
      ];

      const requirements: WritingRequirements = {
        topic: '재개발 프로젝트 종합',
        purpose: 'analyze',
        tone: {
          formality: 'professional',
          emotion: 'neutral',
          perspective: 'third_person',
          voice: 'active'
        },
        structure: {
          word_count: { target: 1000 }
        },
        sentence_style: {
          avg_length: 'medium',
          complexity: 'complex',
          rhythm: 'varied',
          punctuation_style: 'standard'
        },
        content_requirements: {
          evidence_level: 'extensive',
          examples_needed: true,
          statistics_needed: true,
          quotes_needed: true
        },
        target_audience: {
          expertise_level: 'advanced'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
    });

    it('설득 목적의 콘텐츠를 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'original_text',
          content: '재개발의 필요성',
          metadata: {}
        }
      ];

      const requirements: WritingRequirements = {
        topic: '재개발의 필요성',
        purpose: 'persuade',
        tone: {
          formality: 'semi_formal',
          emotion: 'enthusiastic',
          perspective: 'mixed',
          voice: 'active'
        },
        structure: {
          word_count: { target: 800 }
        },
        sentence_style: {
          avg_length: 'varied',
          complexity: 'mixed',
          rhythm: 'dramatic',
          punctuation_style: 'expressive'
        },
        content_requirements: {
          evidence_level: 'extensive',
          examples_needed: true,
          statistics_needed: true,
          quotes_needed: true
        },
        target_audience: {
          expertise_level: 'general_public',
          age_group: 'adults'
        },
        special_requirements: {
          include_call_to_action: true,
          emotional_appeal_level: 'high'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.alternatives).toBeDefined();
    });

    it('분석 목적의 콘텐츠를 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'reference_document',
          content: '시장 분석 데이터',
          metadata: { title: '시장 분석' }
        }
      ];

      const requirements: WritingRequirements = {
        topic: '부동산 시장 분석',
        purpose: 'analyze',
        tone: {
          formality: 'very_formal',
          emotion: 'neutral',
          perspective: 'third_person',
          voice: 'active'
        },
        structure: {
          word_count: { target: 1200 },
          paragraph_count: { target: 6 }
        },
        sentence_style: {
          avg_length: 'long',
          complexity: 'complex',
          rhythm: 'consistent',
          punctuation_style: 'standard'
        },
        content_requirements: {
          evidence_level: 'extensive',
          examples_needed: true,
          statistics_needed: true,
          quotes_needed: false,
          citation_style: 'academic'
        },
        target_audience: {
          expertise_level: 'expert',
          professional_background: '부동산 전문가'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.metadata.readability_score).toBeDefined();
    });

    it('비판 목적의 콘텐츠를 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'original_text',
          content: '정책 제안서',
          metadata: {}
        }
      ];

      const requirements: WritingRequirements = {
        topic: '정책 비판',
        purpose: 'critique',
        tone: {
          formality: 'formal',
          emotion: 'serious',
          perspective: 'third_person',
          voice: 'active'
        },
        structure: {
          word_count: { target: 900 }
        },
        sentence_style: {
          avg_length: 'medium',
          complexity: 'complex',
          rhythm: 'varied',
          punctuation_style: 'standard'
        },
        content_requirements: {
          evidence_level: 'extensive',
          examples_needed: true,
          statistics_needed: true,
          quotes_needed: true
        },
        target_audience: {
          expertise_level: 'advanced'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('다양한 어투로 콘텐츠를 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'original_text',
          content: '기본 내용',
          metadata: {}
        }
      ];

      const requirements: WritingRequirements = {
        topic: '테스트 주제',
        purpose: 'inform',
        tone: {
          formality: 'very_informal',
          emotion: 'friendly',
          perspective: 'first_person',
          voice: 'active'
        },
        structure: {
          word_count: { target: 300 }
        },
        sentence_style: {
          avg_length: 'short',
          complexity: 'simple',
          rhythm: 'uniform',
          punctuation_style: 'minimal'
        },
        content_requirements: {
          evidence_level: 'minimal',
          examples_needed: false,
          statistics_needed: false,
          quotes_needed: false
        },
        target_audience: {
          expertise_level: 'beginner',
          age_group: 'teens'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('문자 수 제한이 있는 콘텐츠를 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'original_text',
          content: '긴 내용',
          metadata: {}
        }
      ];

      const requirements: WritingRequirements = {
        topic: '요약 글',
        purpose: 'inform',
        tone: {
          formality: 'formal',
          emotion: 'neutral',
          perspective: 'third_person',
          voice: 'active'
        },
        structure: {
          character_count: {
            min: 500,
            max: 1000,
            target: 750
          }
        },
        sentence_style: {
          avg_length: 'short',
          complexity: 'simple',
          rhythm: 'uniform',
          punctuation_style: 'standard'
        },
        content_requirements: {
          evidence_level: 'minimal',
          examples_needed: false,
          statistics_needed: false,
          quotes_needed: false
        },
        target_audience: {
          expertise_level: 'intermediate'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.metadata.actual_character_count).toBeGreaterThanOrEqual(0);
    });

    it('빈 소스 배열로도 콘텐츠를 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [];

      const requirements: WritingRequirements = {
        topic: '새로운 주제',
        purpose: 'inform',
        tone: {
          formality: 'formal',
          emotion: 'neutral',
          perspective: 'third_person',
          voice: 'active'
        },
        structure: {
          word_count: { target: 400 }
        },
        sentence_style: {
          avg_length: 'medium',
          complexity: 'mixed',
          rhythm: 'varied',
          punctuation_style: 'standard'
        },
        content_requirements: {
          evidence_level: 'moderate',
          examples_needed: true,
          statistics_needed: false,
          quotes_needed: false
        },
        target_audience: {
          expertise_level: 'intermediate'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('오류 발생 시 적절한 에러를 던져야 함', async () => {
      const invalidSources = null as any;
      const invalidRequirements = null as any;

      await expect(
        adaptiveWritingEngine.generateAdaptiveContent(invalidSources, invalidRequirements)
      ).rejects.toThrow();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 전문적인 글을 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'original_text',
          content: '재개발 프로젝트는 다음과 같은 단계를 거칩니다: 1) 사업시행계획 수립, 2) 조합 설립, 3) 시공사 선정, 4) 착공 및 준공',
          metadata: {
            title: '재개발 프로젝트 절차',
            word_count: 30
          }
        },
        {
          type: 'knowledge_base',
          content: '시공사 선정 시 고려사항: 기술력, 경험, 재무 안정성, 일정 준수 능력',
          metadata: {
            title: '시공사 선정 기준',
            key_topics: ['시공사', '선정', '기준']
          }
        }
      ];

      const requirements: WritingRequirements = {
        topic: '재개발 프로젝트의 시공사 선정',
        purpose: 'inform',
        tone: {
          formality: 'professional',
          emotion: 'neutral',
          perspective: 'third_person',
          voice: 'active'
        },
        structure: {
          word_count: {
            min: 800,
            max: 1200,
            target: 1000
          },
          paragraph_count: {
            target: 5
          }
        },
        sentence_style: {
          avg_length: 'medium',
          complexity: 'mixed',
          rhythm: 'varied',
          punctuation_style: 'standard'
        },
        content_requirements: {
          evidence_level: 'extensive',
          examples_needed: true,
          statistics_needed: true,
          quotes_needed: false,
          citation_style: 'professional'
        },
        target_audience: {
          expertise_level: 'advanced',
          age_group: 'adults',
          professional_background: '부동산 개발 전문가'
        },
        special_requirements: {
          technical_depth: 'deep',
          emotional_appeal_level: 'low'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.metadata.actual_word_count).toBeGreaterThanOrEqual(0);
      expect(result.metadata.readability_score).toBeDefined();
      expect(result.alternatives).toBeDefined();
    });

    it('예산 계획 관련 실용적인 글을 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'reference_document',
          content: '예산 계획: 토지 매입비 100억, 건축비 500억, 기타 비용 50억',
          metadata: {
            title: '예산 계획서',
            file_type: 'excel'
          }
        }
      ];

      const requirements: WritingRequirements = {
        topic: '재개발 프로젝트 예산 계획',
        purpose: 'explain',
        tone: {
          formality: 'semi_formal',
          emotion: 'neutral',
          perspective: 'third_person',
          voice: 'active'
        },
        structure: {
          word_count: { target: 600 }
        },
        sentence_style: {
          avg_length: 'medium',
          complexity: 'compound',
          rhythm: 'varied',
          punctuation_style: 'standard'
        },
        content_requirements: {
          evidence_level: 'extensive',
          examples_needed: true,
          statistics_needed: true,
          quotes_needed: false
        },
        target_audience: {
          expertise_level: 'intermediate',
          age_group: 'adults'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
    });

    it('일정 관리 관련 분석 글을 생성할 수 있어야 함', async () => {
      const sources: SourceMaterial[] = [
        {
          type: 'original_text',
          content: '프로젝트 일정: 설계 6개월, 인허가 3개월, 시공 24개월',
          metadata: {}
        }
      ];

      const requirements: WritingRequirements = {
        topic: '재개발 프로젝트 일정 관리',
        purpose: 'analyze',
        tone: {
          formality: 'formal',
          emotion: 'neutral',
          perspective: 'third_person',
          voice: 'active'
        },
        structure: {
          word_count: { target: 1000 },
          paragraph_count: { target: 6 }
        },
        sentence_style: {
          avg_length: 'long',
          complexity: 'complex',
          rhythm: 'varied',
          punctuation_style: 'standard'
        },
        content_requirements: {
          evidence_level: 'extensive',
          examples_needed: true,
          statistics_needed: true,
          quotes_needed: true,
          citation_style: 'academic'
        },
        target_audience: {
          expertise_level: 'expert',
          professional_background: '프로젝트 관리 전문가'
        }
      };

      const result = await adaptiveWritingEngine.generateAdaptiveContent(sources, requirements);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.metadata.style_conformance).toBeDefined();
    });
  });
});

