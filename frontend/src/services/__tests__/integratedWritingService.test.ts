/**
 * @jest-environment jsdom
 */

/**
 * integratedWritingService 서비스 테스트
 * 통합 글쓰기 서비스 테스트
 */
/// <reference types="jest" />
/* eslint-disable jest/no-conditional-expect */

import { integratedWritingService, UnifiedWritingRequest } from '../integratedWritingService';

// 의존성 모킹
jest.mock('../professionalWritingEngine', () => ({
  professionalWritingEngine: {
    generateProfessionalWriting: jest.fn()
  }
}));

jest.mock('../adaptiveWritingEngine', () => ({
  adaptiveWritingEngine: {
    generateAdaptiveContent: jest.fn()
  }
}));

jest.mock('../advancedTextAnalysisService', () => ({
  advancedTextAnalysisService: {
    analyzeText: jest.fn()
  }
}));

jest.mock('../contextualResponseEnhancer', () => ({
  contextualResponseEnhancer: {
    enhanceResponse: jest.fn()
  }
}));

describe('integratedWritingService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(integratedWritingService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = integratedWritingService;
      const instance2 = integratedWritingService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('processUnifiedWritingRequest', () => {
    it('기본 요청을 처리할 수 있어야 함', async () => {
      const adaptiveWritingEngine = require('../adaptiveWritingEngine').adaptiveWritingEngine;
      adaptiveWritingEngine.generateAdaptiveContent.mockResolvedValue({
        title: '테스트 제목',
        content: '테스트 콘텐츠입니다.',
        metadata: {
          actual_word_count: 2,
          actual_character_count: 10,
          actual_paragraph_count: 1,
          avg_sentence_length: 10,
          readability_score: 0.8,
          tone_analysis: {},
          keyword_density: {},
          style_conformance: {}
        },
        alternatives: {
          different_tone: '다른 어투',
          different_length: '다른 길이',
          different_structure: '다른 구조'
        },
        improvement_suggestions: [],
        source_attribution: null
      });

      const request: UnifiedWritingRequest = {
        input: {
          topic: '테스트 주제'
        },
        writing_style: {
          type: 'adaptive'
        },
        detailed_requirements: {
          length: {
            type: 'word_count',
            value: 500,
            flexibility: 'moderate'
          },
          tone: {
            formality: 'professional',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태'
          },
          sentence_structure: {
            average_length: 'medium',
            complexity: 'varied',
            rhythm: 'varied'
          },
          paragraph_structure: {
            average_sentences_per_paragraph: 5,
            connection_style: 'smooth'
          },
          content_focus: {
            main_purpose: 'inform',
            evidence_level: 'moderate',
            include_statistics: false,
            include_examples: true,
            include_quotes: false,
            include_personal_opinions: false
          },
          target_audience: {
            expertise_level: 'students',
            background_knowledge_level: 'intermediate'
          }
        },
        output_options: {
          include_alternatives: false,
          include_analysis: false,
          include_improvement_suggestions: false,
          include_source_attribution: false,
          format: 'markdown'
        }
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);

      expect(response).toBeDefined();
      expect(response.primary_content).toBeDefined();
      expect(response.primary_content.content).toBeDefined();
      expect(response.primary_content.word_count).toBeGreaterThanOrEqual(0);
      expect(response.primary_content.character_count).toBeGreaterThanOrEqual(0);
      expect(response.quality_analysis).toBeDefined();
      expect(response.metadata).toBeDefined();
    });

    it('원본 텍스트가 포함된 요청을 처리할 수 있어야 함', async () => {
      const adaptiveWritingEngine = require('../adaptiveWritingEngine').adaptiveWritingEngine;
      adaptiveWritingEngine.generateAdaptiveContent.mockResolvedValue({
        title: '제목',
        content: '콘텐츠',
        metadata: {
          actual_word_count: 1,
          actual_character_count: 5,
          actual_paragraph_count: 1,
          avg_sentence_length: 5,
          readability_score: 0.8,
          tone_analysis: {},
          keyword_density: {},
          style_conformance: {}
        },
        alternatives: {
          different_tone: '',
          different_length: '',
          different_structure: ''
        },
        improvement_suggestions: [],
        source_attribution: null
      });

      const request: UnifiedWritingRequest = {
        input: {
          topic: '재개발 프로젝트',
          original_text: '재개발 프로젝트는 복잡한 과정입니다.'
        },
        writing_style: {
          type: 'adaptive'
        },
        detailed_requirements: {
          length: {
            type: 'word_count',
            value: 800,
            flexibility: 'flexible'
          },
          tone: {
            formality: 'professional',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태'
          },
          sentence_structure: {
            average_length: 'medium',
            complexity: 'varied',
            rhythm: 'varied'
          },
          paragraph_structure: {
            average_sentences_per_paragraph: 4,
            connection_style: 'clear_breaks'
          },
          content_focus: {
            main_purpose: 'analyze',
            evidence_level: 'extensive',
            include_statistics: true,
            include_examples: true,
            include_quotes: true,
            include_personal_opinions: false
          },
          target_audience: {
            expertise_level: 'experts',
            background_knowledge_level: 'advanced'
          }
        },
        output_options: {
          include_alternatives: true,
          include_analysis: true,
          include_improvement_suggestions: true,
          include_source_attribution: true,
          format: 'markdown'
        }
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);

      expect(response).toBeDefined();
      expect(response.primary_content.content).toBeDefined();
      expect(response.alternatives).toBeDefined();
      expect(response.improvement_suggestions).toBeDefined();
      expect(response.source_analysis).toBeDefined();
    });

    it('파일이 포함된 요청을 처리할 수 있어야 함', async () => {
      const adaptiveWritingEngine = require('../adaptiveWritingEngine').adaptiveWritingEngine;
      adaptiveWritingEngine.generateAdaptiveContent.mockResolvedValue({
        title: '제목',
        content: '콘텐츠',
        metadata: {
          actual_word_count: 1,
          actual_character_count: 5,
          actual_paragraph_count: 1,
          avg_sentence_length: 5,
          readability_score: 0.8,
          tone_analysis: {},
          keyword_density: {},
          style_conformance: {}
        },
        alternatives: {
          different_tone: '',
          different_length: '',
          different_structure: ''
        },
        improvement_suggestions: [],
        source_attribution: null
      });

      const mockFile = new File(['테스트 파일 내용'], 'test.txt', { type: 'text/plain' });

      const request: UnifiedWritingRequest = {
        input: {
          topic: '파일 분석',
          user_files: [mockFile]
        },
        writing_style: {
          type: 'adaptive'
        },
        detailed_requirements: {
          length: {
            type: 'word_count',
            value: 600,
            flexibility: 'moderate'
          },
          tone: {
            formality: 'professional',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태'
          },
          sentence_structure: {
            average_length: 'medium',
            complexity: 'varied',
            rhythm: 'varied'
          },
          paragraph_structure: {
            average_sentences_per_paragraph: 5,
            connection_style: 'smooth'
          },
          content_focus: {
            main_purpose: 'inform',
            evidence_level: 'moderate',
            include_statistics: false,
            include_examples: true,
            include_quotes: false,
            include_personal_opinions: false
          },
          target_audience: {
            expertise_level: 'students',
            background_knowledge_level: 'intermediate'
          }
        },
        output_options: {
          include_alternatives: false,
          include_analysis: false,
          include_improvement_suggestions: false,
          include_source_attribution: false,
          format: 'plain_text'
        }
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);

      expect(response).toBeDefined();
      expect(response.primary_content.content).toBeDefined();
    });

    it('다양한 글쓰기 스타일을 처리할 수 있어야 함', async () => {
      const professionalWritingEngine = require('../professionalWritingEngine').professionalWritingEngine;
      professionalWritingEngine.generateProfessionalWriting.mockResolvedValue({
        title: '전문 글',
        content: '전문적인 콘텐츠입니다.',
        word_count: 5,
        quality_metrics: {
          style_compliance: 0.9,
          readability: 0.8,
          engagement: 0.85
        }
      });

      const request: UnifiedWritingRequest = {
        input: {
          topic: '전문 글쓰기'
        },
        writing_style: {
          type: 'professional',
          professional_style: 'essay'
        },
        detailed_requirements: {
          length: {
            type: 'word_count',
            value: 1000,
            flexibility: 'strict'
          },
          tone: {
            formality: 'academic',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태'
          },
          sentence_structure: {
            average_length: 'long',
            complexity: 'complex',
            rhythm: 'consistent'
          },
          paragraph_structure: {
            average_sentences_per_paragraph: 6,
            connection_style: 'smooth'
          },
          content_focus: {
            main_purpose: 'analyze',
            evidence_level: 'extensive',
            include_statistics: true,
            include_examples: true,
            include_quotes: true,
            include_personal_opinions: false
          },
          target_audience: {
            expertise_level: 'experts',
            background_knowledge_level: 'advanced'
          }
        },
        output_options: {
          include_alternatives: false,
          include_analysis: true,
          include_improvement_suggestions: false,
          include_source_attribution: false,
          format: 'markdown'
        }
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);

      expect(response).toBeDefined();
      expect(response.primary_content.content).toBeDefined();
      expect(response.quality_analysis).toBeDefined();
    });

    it('HTML 형식으로 출력할 수 있어야 함', async () => {
      const adaptiveWritingEngine = require('../adaptiveWritingEngine').adaptiveWritingEngine;
      adaptiveWritingEngine.generateAdaptiveContent.mockResolvedValue({
        title: '제목',
        content: '콘텐츠',
        metadata: {
          actual_word_count: 1,
          actual_character_count: 5,
          actual_paragraph_count: 1,
          avg_sentence_length: 5,
          readability_score: 0.8,
          tone_analysis: {},
          keyword_density: {},
          style_conformance: {}
        },
        alternatives: {
          different_tone: '',
          different_length: '',
          different_structure: ''
        },
        improvement_suggestions: [],
        source_attribution: null
      });

      const request: UnifiedWritingRequest = {
        input: {
          topic: 'HTML 출력'
        },
        writing_style: {
          type: 'adaptive'
        },
        detailed_requirements: {
          length: {
            type: 'word_count',
            value: 500,
            flexibility: 'moderate'
          },
          tone: {
            formality: 'professional',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태'
          },
          sentence_structure: {
            average_length: 'medium',
            complexity: 'varied',
            rhythm: 'varied'
          },
          paragraph_structure: {
            average_sentences_per_paragraph: 5,
            connection_style: 'smooth'
          },
          content_focus: {
            main_purpose: 'inform',
            evidence_level: 'moderate',
            include_statistics: false,
            include_examples: true,
            include_quotes: false,
            include_personal_opinions: false
          },
          target_audience: {
            expertise_level: 'students',
            background_knowledge_level: 'intermediate'
          }
        },
        output_options: {
          include_alternatives: false,
          include_analysis: false,
          include_improvement_suggestions: false,
          include_source_attribution: false,
          format: 'html'
        }
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);

      expect(response).toBeDefined();
      expect(response.primary_content.content).toBeDefined();
    });

    it('오류 발생 시 적절한 에러를 던져야 함', async () => {
      const invalidRequest = null as unknown as UnifiedWritingRequest;

      await expect(
        integratedWritingService.processUnifiedWritingRequest(invalidRequest)
      ).rejects.toThrow();
    });

    it('하이브리드(conversational)에서 pipelineExtras를 강화 요청·metadata로 전달한다', async () => {
      const adaptiveWritingEngine = require('../adaptiveWritingEngine').adaptiveWritingEngine;
      const contextualResponseEnhancer = require('../contextualResponseEnhancer').contextualResponseEnhancer;

      adaptiveWritingEngine.generateAdaptiveContent.mockResolvedValue({
        title: '테스트',
        content: '본문',
        metadata: {
          actual_word_count: 1,
          actual_character_count: 2,
          actual_paragraph_count: 1,
          avg_sentence_length: 2,
          readability_score: 0.8,
          tone_analysis: {},
          keyword_density: {},
          style_conformance: {},
        },
        alternatives: {
          different_tone: '',
          different_length: '',
          different_structure: '',
        },
        improvement_suggestions: [],
        source_attribution: null,
        pipelineExtras: { pipelineGenerationPhase: 'draft' },
      });

      const mergedRef = { qaPipelineTraceId: 'trace-hybrid' };

      contextualResponseEnhancer.enhanceResponse.mockImplementationOnce(
        async (req: { pipelineExtras?: { qaPipelineTraceId?: string; pipelineGenerationPhase?: string } }) => {
          expect(req.pipelineExtras).toBeDefined();
          expect(req.pipelineExtras?.qaPipelineTraceId).toBe('trace-hybrid');
          expect(req.pipelineExtras?.pipelineGenerationPhase).toBe('draft');
          return {
            primaryResponse: {
              content: ' 강화',
              perspective: '',
              methodology: '',
              confidence: 0.9,
            },
            contextualInsights: {
              conversationalFlow: '',
              userIntentEvolution: '',
              topicProgression: '',
              emergingPatterns: [],
            },
            researcherAnalysis: {
              academicFramework: '',
              theoreticalBasis: '',
              methodologicalApproach: '',
              evidenceAssessment: '',
              limitationsAndBias: '',
              futureResearchDirections: [],
            },
            opinionAnalysisInsights: {
              publicSentimentAssessment: '',
              stakeholderPerspectives: [],
              socialImplications: '',
              politicalRamifications: '',
              mediaInfluenceFactors: [],
              consensusBuildingPotential: '',
            },
            textManipulationSuite: {
              enhancedModification: '',
              systematicCounterargument: '',
              persuasiveAppeal: '',
              comprehensiveRebuttal: '',
              academicExpansion: '',
              rhetoricalVariations: {
                formal: '',
                persuasive: '',
                analytical: '',
                emotive: '',
              },
            },
            strategicRecommendations: {
              communicationStrategy: [],
              riskMitigation: [],
              opportunityLeveraging: [],
              stakeholderEngagement: [],
            },
            followUpFramework: {
              deepeningQuestions: [],
              alternativePerspectives: [],
              synthesisOpportunities: [],
              practicalApplications: [],
            },
            pipelineExtras: req.pipelineExtras,
          };
        }
      );

      const request: UnifiedWritingRequest = {
        input: { topic: '테스트 주제' },
        writing_style: { type: 'conversational' },
        detailed_requirements: {
          length: { type: 'word_count', value: 500, flexibility: 'moderate' },
          tone: {
            formality: 'professional',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태',
          },
          sentence_structure: {
            average_length: 'medium',
            complexity: 'varied',
            rhythm: 'varied',
          },
          paragraph_structure: {
            average_sentences_per_paragraph: 5,
            connection_style: 'smooth',
          },
          content_focus: {
            main_purpose: 'inform',
            evidence_level: 'moderate',
            include_statistics: false,
            include_examples: true,
            include_quotes: false,
            include_personal_opinions: false,
          },
          target_audience: {
            expertise_level: 'students',
            background_knowledge_level: 'intermediate',
          },
        },
        output_options: {
          include_alternatives: false,
          include_analysis: false,
          include_improvement_suggestions: false,
          include_source_attribution: false,
          format: 'markdown',
        },
        pipelineExtras: mergedRef,
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);

      expect(response.metadata.pipelineExtras).toBeDefined();
      expect(response.metadata.pipelineExtras?.qaPipelineTraceId).toBe('trace-hybrid');
      expect(response.metadata.pipelineExtras?.pipelineGenerationPhase).toBe('draft');
    });

    it('적응형(adaptive) 엔진 최상위 pipelineExtras가 응답 metadata에 반영된다', async () => {
      const adaptiveWritingEngine = require('../adaptiveWritingEngine').adaptiveWritingEngine;
      adaptiveWritingEngine.generateAdaptiveContent.mockResolvedValue({
        title: '테스트 제목',
        content: '테스트 콘텐츠입니다.',
        metadata: {
          actual_word_count: 2,
          actual_character_count: 10,
          actual_paragraph_count: 1,
          avg_sentence_length: 10,
          readability_score: 0.8,
          tone_analysis: {},
          keyword_density: {},
          style_conformance: {},
        },
        alternatives: {
          different_tone: '다른 어투',
          different_length: '다른 길이',
          different_structure: '다른 구조',
        },
        improvement_suggestions: [],
        source_attribution: null,
        pipelineExtras: { qaPipelineTraceId: 'adaptive-top-only' },
      });

      const request: UnifiedWritingRequest = {
        input: { topic: '테스트 주제' },
        writing_style: { type: 'adaptive' },
        detailed_requirements: {
          length: { type: 'word_count', value: 500, flexibility: 'moderate' },
          tone: {
            formality: 'professional',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태',
          },
          sentence_structure: {
            average_length: 'medium',
            complexity: 'varied',
            rhythm: 'varied',
          },
          paragraph_structure: {
            average_sentences_per_paragraph: 5,
            connection_style: 'smooth',
          },
          content_focus: {
            main_purpose: 'inform',
            evidence_level: 'moderate',
            include_statistics: false,
            include_examples: true,
            include_quotes: false,
            include_personal_opinions: false,
          },
          target_audience: {
            expertise_level: 'students',
            background_knowledge_level: 'intermediate',
          },
        },
        output_options: {
          include_alternatives: false,
          include_analysis: false,
          include_improvement_suggestions: false,
          include_source_attribution: false,
          format: 'markdown',
        },
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);
      expect(response.metadata.pipelineExtras?.qaPipelineTraceId).toBe('adaptive-top-only');
    });

    it('하이브리드에서 요청에 pipelineExtras가 없어도 적응형 결과 extras가 강화·metadata로 전달된다', async () => {
      const adaptiveWritingEngine = require('../adaptiveWritingEngine').adaptiveWritingEngine;
      const contextualResponseEnhancer = require('../contextualResponseEnhancer').contextualResponseEnhancer;

      adaptiveWritingEngine.generateAdaptiveContent.mockResolvedValue({
        title: '테스트',
        content: '본문',
        metadata: {
          actual_word_count: 1,
          actual_character_count: 2,
          actual_paragraph_count: 1,
          avg_sentence_length: 2,
          readability_score: 0.8,
          tone_analysis: {},
          keyword_density: {},
          style_conformance: {},
        },
        alternatives: {
          different_tone: '',
          different_length: '',
          different_structure: '',
        },
        improvement_suggestions: [],
        source_attribution: null,
        pipelineExtras: {
          qaPipelineTraceId: 'only-from-adaptive',
          pipelineGenerationPhase: 'draft',
        },
      });

      contextualResponseEnhancer.enhanceResponse.mockImplementationOnce(
        async (req: { pipelineExtras?: { qaPipelineTraceId?: string; pipelineGenerationPhase?: string } }) => {
          expect(req.pipelineExtras?.qaPipelineTraceId).toBe('only-from-adaptive');
          expect(req.pipelineExtras?.pipelineGenerationPhase).toBe('draft');
          return {
            primaryResponse: {
              content: ' 강화',
              perspective: '',
              methodology: '',
              confidence: 0.9,
            },
            contextualInsights: {
              conversationalFlow: '',
              userIntentEvolution: '',
              topicProgression: '',
              emergingPatterns: [],
            },
            researcherAnalysis: {
              academicFramework: '',
              theoreticalBasis: '',
              methodologicalApproach: '',
              evidenceAssessment: '',
              limitationsAndBias: '',
              futureResearchDirections: [],
            },
            opinionAnalysisInsights: {
              publicSentimentAssessment: '',
              stakeholderPerspectives: [],
              socialImplications: '',
              politicalRamifications: '',
              mediaInfluenceFactors: [],
              consensusBuildingPotential: '',
            },
            textManipulationSuite: {
              enhancedModification: '',
              systematicCounterargument: '',
              persuasiveAppeal: '',
              comprehensiveRebuttal: '',
              academicExpansion: '',
              rhetoricalVariations: {
                formal: '',
                persuasive: '',
                analytical: '',
                emotive: '',
              },
            },
            strategicRecommendations: {
              communicationStrategy: [],
              riskMitigation: [],
              opportunityLeveraging: [],
              stakeholderEngagement: [],
            },
            followUpFramework: {
              deepeningQuestions: [],
              alternativePerspectives: [],
              synthesisOpportunities: [],
              practicalApplications: [],
            },
            pipelineExtras: req.pipelineExtras,
          };
        }
      );

      const request: UnifiedWritingRequest = {
        input: { topic: '테스트 주제' },
        writing_style: { type: 'conversational' },
        detailed_requirements: {
          length: { type: 'word_count', value: 500, flexibility: 'moderate' },
          tone: {
            formality: 'professional',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태',
          },
          sentence_structure: {
            average_length: 'medium',
            complexity: 'varied',
            rhythm: 'varied',
          },
          paragraph_structure: {
            average_sentences_per_paragraph: 5,
            connection_style: 'smooth',
          },
          content_focus: {
            main_purpose: 'inform',
            evidence_level: 'moderate',
            include_statistics: false,
            include_examples: true,
            include_quotes: false,
            include_personal_opinions: false,
          },
          target_audience: {
            expertise_level: 'students',
            background_knowledge_level: 'intermediate',
          },
        },
        output_options: {
          include_alternatives: false,
          include_analysis: false,
          include_improvement_suggestions: false,
          include_source_attribution: false,
          format: 'markdown',
        },
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);
      expect(response.metadata.pipelineExtras?.qaPipelineTraceId).toBe('only-from-adaptive');
      expect(response.metadata.pipelineExtras?.pipelineGenerationPhase).toBe('draft');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 종합 글쓰기를 수행할 수 있어야 함', async () => {
      const adaptiveWritingEngine = require('../adaptiveWritingEngine').adaptiveWritingEngine;
      adaptiveWritingEngine.generateAdaptiveContent.mockResolvedValue({
        title: '재개발 프로젝트 종합 분석',
        content: '재개발 프로젝트는 다음과 같은 절차를 따릅니다. 첫째, 사업시행계획 수립이 필요합니다. 둘째, 조합 설립을 진행합니다. 셋째, 시공사를 선정합니다. 마지막으로 착공 및 준공을 완료합니다.',
        metadata: {
          actual_word_count: 50,
          actual_character_count: 100,
          actual_paragraph_count: 1,
          avg_sentence_length: 25,
          readability_score: 0.85,
          tone_analysis: { formality: 0.8 },
          keyword_density: { '재개발': 0.1 },
          style_conformance: { academic: 0.9 }
        },
        alternatives: {
          different_tone: '재개발 프로젝트는 복잡한 과정입니다.',
          different_length: '재개발 프로젝트 절차 설명',
          different_structure: '재개발 프로젝트의 주요 단계'
        },
        improvement_suggestions: ['더 구체적인 예시 추가', '통계 데이터 포함'],
        source_attribution: null
      });

      const request: UnifiedWritingRequest = {
        input: {
          topic: '재개발 프로젝트 종합 분석',
          original_text: '재개발 프로젝트 절차',
          knowledge_context: ['시공사 선정', '예산 계획']
        },
        writing_style: {
          type: 'adaptive'
        },
        detailed_requirements: {
          length: {
            type: 'word_count',
            value: 1000,
            flexibility: 'moderate'
          },
          tone: {
            formality: 'professional',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태'
          },
          sentence_structure: {
            average_length: 'medium',
            complexity: 'varied',
            rhythm: 'varied'
          },
          paragraph_structure: {
            count: 5,
            average_sentences_per_paragraph: 4,
            connection_style: 'smooth'
          },
          content_focus: {
            main_purpose: 'analyze',
            evidence_level: 'extensive',
            include_statistics: true,
            include_examples: true,
            include_quotes: true,
            include_personal_opinions: false
          },
          target_audience: {
            expertise_level: 'experts',
            background_knowledge_level: 'advanced'
          },
          special_instructions: {
            specific_format: 'report',
            mandatory_inclusions: ['절차', '시공사', '예산']
          }
        },
        output_options: {
          include_alternatives: true,
          include_analysis: true,
          include_improvement_suggestions: true,
          include_source_attribution: true,
          format: 'markdown'
        }
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);

      expect(response).toBeDefined();
      expect(response.primary_content.content.length).toBeGreaterThan(0);
      expect(response.primary_content.word_count).toBeGreaterThan(0);
      expect(response.primary_content.estimated_reading_time).toBeGreaterThanOrEqual(0);
      expect(response.quality_analysis.style_compliance).toBeGreaterThanOrEqual(0);
      expect(response.quality_analysis.readability_score).toBeGreaterThanOrEqual(0);
      expect(response.alternatives).toBeDefined();
      expect(response.improvement_suggestions).toBeDefined();
      expect(response.source_analysis).toBeDefined();
    });

    it('시공사 선정 관련 전문 글쓰기를 수행할 수 있어야 함', async () => {
      const professionalWritingEngine = require('../professionalWritingEngine').professionalWritingEngine;
      professionalWritingEngine.generateProfessionalWriting.mockResolvedValue({
        title: '시공사 선정 기준',
        content: '시공사 선정 시 고려해야 할 주요 기준은 다음과 같습니다: 기술력, 경험, 재무 안정성, 일정 준수 능력 등입니다.',
        word_count: 30,
        quality_metrics: {
          style_compliance: 0.9,
          readability: 0.9,
          engagement: 0.85
        }
      });

      // adaptiveWritingEngine도 모킹 (fallback용)
      const adaptiveWritingEngine = require('../adaptiveWritingEngine').adaptiveWritingEngine;
      adaptiveWritingEngine.generateAdaptiveContent.mockResolvedValue({
        title: '시공사 선정 기준',
        content: '시공사 선정 시 고려해야 할 주요 기준은 다음과 같습니다: 기술력, 경험, 재무 안정성, 일정 준수 능력 등입니다.',
        metadata: {
          actual_word_count: 30,
          actual_character_count: 60,
          actual_paragraph_count: 1,
          avg_sentence_length: 30,
          readability_score: 0.9,
          tone_analysis: { professional: 0.95 },
          keyword_density: { '시공사': 0.15 },
          style_conformance: { professional: 0.9 }
        },
        alternatives: {
          different_tone: '',
          different_length: '',
          different_structure: ''
        },
        improvement_suggestions: [],
        source_attribution: null
      });

      const request: UnifiedWritingRequest = {
        input: {
          topic: '시공사 선정 기준'
        },
        writing_style: {
          type: 'professional',
          professional_style: 'essay'
        },
        detailed_requirements: {
          length: {
            type: 'word_count',
            value: 800,
            flexibility: 'strict'
          },
          tone: {
            formality: 'academic',
            emotion: 'neutral',
            perspective: '3인칭',
            voice_style: '능동태'
          },
          sentence_structure: {
            average_length: 'long',
            complexity: 'complex',
            rhythm: 'consistent'
          },
          paragraph_structure: {
            count: 4,
            average_sentences_per_paragraph: 5,
            connection_style: 'smooth'
          },
          content_focus: {
            main_purpose: 'analyze',
            evidence_level: 'extensive',
            include_statistics: true,
            include_examples: true,
            include_quotes: true,
            include_personal_opinions: false
          },
          target_audience: {
            expertise_level: 'experts',
            background_knowledge_level: 'advanced'
          }
        },
        output_options: {
          include_alternatives: false,
          include_analysis: true,
          include_improvement_suggestions: false,
          include_source_attribution: false,
          format: 'markdown'
        }
      };

      const response = await integratedWritingService.processUnifiedWritingRequest(request);

      expect(response).toBeDefined();
      expect(response.primary_content.content.length).toBeGreaterThan(0);
      expect(response.quality_analysis.professional_quality).toBeGreaterThanOrEqual(0);
    });
  });
});

