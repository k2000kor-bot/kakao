/**
 * professionalWritingEngine 서비스 테스트
 * 전문 평론가 수준 글쓰기 엔진 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { professionalWritingEngine, WritingRequest, WritingStyle } from '../professionalWritingEngine';

describe('professionalWritingEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(professionalWritingEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = professionalWritingEngine;
      const instance2 = professionalWritingEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateProfessionalWriting', () => {
    it('기본 글쓰기 요청으로 전문 글을 생성할 수 있어야 함', async () => {
      const request: WritingRequest = {
        topic: '재개발 프로젝트의 필요성',
        style: 'essay'
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.style_analysis).toBeDefined();
      expect(result.expert_assessment).toBeDefined();
      expect(result.alternative_versions).toBeDefined();
    });

    it('다양한 스타일로 글을 생성할 수 있어야 함', async () => {
      const styles: WritingStyle[] = [
        'essay',
        'critic',
        'election_analyst',
        'film_critic',
        'opinion_analyst',
        'political_commentator',
        'cultural_critic',
        'economic_analyst',
        'social_commentator',
        'sports_analyst',
        'literary_critic',
        'art_critic'
      ];

      for (const style of styles) {
        const request: WritingRequest = {
          topic: `테스트 주제 - ${style}`,
          style
        };

        const result = await professionalWritingEngine.generateProfessionalWriting(request);

        expect(result).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
        expect(result.style_analysis.writing_style).toBe(style);
      }
    });

    it('perspective를 지정하여 글을 생성할 수 있어야 함', async () => {
      const perspectives: Array<'supportive' | 'critical' | 'neutral' | 'analytical'> = [
        'supportive',
        'critical',
        'neutral',
        'analytical'
      ];

      for (const perspective of perspectives) {
        const request: WritingRequest = {
          topic: '재개발 프로젝트 평가',
          style: 'critic',
          perspective
        };

        const result = await professionalWritingEngine.generateProfessionalWriting(request);

        expect(result).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
      }
    });

    it('tone을 지정하여 글을 생성할 수 있어야 함', async () => {
      const tones: Array<'formal' | 'conversational' | 'authoritative' | 'engaging'> = [
        'formal',
        'conversational',
        'authoritative',
        'engaging'
      ];

      for (const tone of tones) {
        const request: WritingRequest = {
          topic: '부동산 시장 분석',
          style: 'economic_analyst',
          tone
        };

        const result = await professionalWritingEngine.generateProfessionalWriting(request);

        expect(result).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
      }
    });

    it('length를 지정하여 글을 생성할 수 있어야 함', async () => {
      const lengths: Array<'brief' | 'standard' | 'detailed' | 'comprehensive'> = [
        'brief',
        'standard',
        'detailed',
        'comprehensive'
      ];

      for (const length of lengths) {
        const request: WritingRequest = {
          topic: '시공사 선정 기준',
          style: 'essay',
          length
        };

        const result = await professionalWritingEngine.generateProfessionalWriting(request);

        expect(result).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
      }
    });

    it('target_audience를 지정하여 글을 생성할 수 있어야 함', async () => {
      const audiences: Array<'general' | 'academic' | 'professional' | 'specialized'> = [
        'general',
        'academic',
        'professional',
        'specialized'
      ];

      for (const audience of audiences) {
        const request: WritingRequest = {
          topic: '재개발 정책 분석',
          style: 'political_commentator',
          target_audience: audience
        };

        const result = await professionalWritingEngine.generateProfessionalWriting(request);

        expect(result).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
      }
    });

    it('context를 포함하여 글을 생성할 수 있어야 함', async () => {
      const request: WritingRequest = {
        topic: '재개발 프로젝트의 시공사 선정',
        style: 'essay',
        context: {
          background_info: '강남구 역삼동 재개발 프로젝트',
          current_events: ['최근 시공사 선정 공고', '입찰 진행 중'],
          key_stakeholders: ['시공사', '주민', '시공사'],
          opposing_views: ['비용 우려', '일정 지연 우려']
        }
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
    });

    it('전문가 평가를 포함해야 함', async () => {
      const request: WritingRequest = {
        topic: '부동산 투자 전략',
        style: 'economic_analyst'
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result.expert_assessment).toBeDefined();
      expect(typeof result.expert_assessment.logical_coherence).toBe('number');
      expect(typeof result.expert_assessment.persuasiveness).toBe('number');
      expect(typeof result.expert_assessment.professional_quality).toBe('number');
      expect(typeof result.expert_assessment.originality).toBe('number');
      expect(result.expert_assessment.logical_coherence).toBeGreaterThanOrEqual(0);
      expect(result.expert_assessment.logical_coherence).toBeLessThanOrEqual(100);
    });

    it('스타일 분석을 포함해야 함', async () => {
      const request: WritingRequest = {
        topic: '영화 비평',
        style: 'film_critic'
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result.style_analysis).toBeDefined();
      expect(result.style_analysis.writing_style).toBe('film_critic');
      expect(Array.isArray(result.style_analysis.rhetorical_devices)).toBe(true);
      expect(typeof result.style_analysis.logical_structure).toBe('string');
      expect(Array.isArray(result.style_analysis.persuasion_techniques)).toBe(true);
    });

    it('대안 버전을 생성해야 함', async () => {
      const request: WritingRequest = {
        topic: '정치 이슈 분석',
        style: 'political_commentator'
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result.alternative_versions).toBeDefined();
      expect(typeof result.alternative_versions.different_perspective).toBe('string');
      expect(typeof result.alternative_versions.stronger_argument).toBe('string');
      expect(typeof result.alternative_versions.counter_narrative).toBe('string');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 논술을 생성할 수 있어야 함', async () => {
      const request: WritingRequest = {
        topic: '재개발 프로젝트의 시공사 선정 기준과 예산 계획의 중요성',
        style: 'essay',
        perspective: 'analytical',
        tone: 'formal',
        length: 'detailed',
        target_audience: 'professional',
        context: {
          background_info: '강남구 역삼동 재개발 프로젝트',
          current_events: ['시공사 선정 공고', '예산 계획 수립 중'],
          key_stakeholders: ['시공사', '주민', '시공사']
        }
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result).toBeDefined();
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.style_analysis.writing_style).toBe('essay');
      expect(result.expert_assessment.logical_coherence).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 관련 비평 글을 생성할 수 있어야 함', async () => {
      const request: WritingRequest = {
        topic: '시공사 선정 과정의 투명성과 공정성',
        style: 'critic',
        perspective: 'critical',
        tone: 'authoritative',
        length: 'standard'
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.style_analysis.writing_style).toBe('critic');
    });

    it('예산 계획 관련 경제 분석 글을 생성할 수 있어야 함', async () => {
      const request: WritingRequest = {
        topic: '재개발 프로젝트 예산 계획의 효율성과 비용 최적화 방안',
        style: 'economic_analyst',
        perspective: 'analytical',
        tone: 'formal',
        length: 'comprehensive',
        target_audience: 'professional'
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.style_analysis.writing_style).toBe('economic_analyst');
    });

    it('정치 평론가 스타일로 글을 생성할 수 있어야 함', async () => {
      const request: WritingRequest = {
        topic: '재개발 정책의 정치적 함의와 사회적 영향',
        style: 'political_commentator',
        perspective: 'analytical',
        tone: 'engaging',
        length: 'detailed'
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.style_analysis.writing_style).toBe('political_commentator');
    });

    it('복합적인 요구사항을 처리할 수 있어야 함', async () => {
      const request: WritingRequest = {
        topic: '재개발 프로젝트의 시공사 선정, 예산 계획, 일정 관리, 리스크 분석을 종합적으로 평가',
        style: 'essay',
        perspective: 'analytical',
        tone: 'formal',
        length: 'comprehensive',
        target_audience: 'academic',
        context: {
          background_info: '대규모 재개발 프로젝트',
          current_events: ['시공사 선정 진행', '예산 계획 수립', '일정 관리 시작'],
          key_stakeholders: ['시공사', '주민', '시공사', '정부'],
          opposing_views: ['비용 우려', '일정 지연 우려', '품질 우려']
        }
      };

      const result = await professionalWritingEngine.generateProfessionalWriting(request);

      expect(result).toBeDefined();
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.expert_assessment.professional_quality).toBeGreaterThanOrEqual(0);
    });
  });
});

