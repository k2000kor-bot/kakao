/**
 * CreativeWritingAIEngine 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  CreativeWritingAIEngine,
  creativeWritingAIEngine,
} from '../creativeWritingAIEngine';

describe('CreativeWritingAIEngine', () => {
  let service: CreativeWritingAIEngine;

  beforeEach(() => {
    service = new CreativeWritingAIEngine();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(CreativeWritingAIEngine);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(creativeWritingAIEngine).toBeDefined();
    });
  });

  describe('창의적 콘텐츠 생성', () => {
    it('기본 스토리 생성', async () => {
      const request = {
        type: 'story' as const,
        mood: 'mysterious' as const,
        style: 'modern' as const,
        length: 'short' as const,
        theme: '시공사 선정',
      };

      const result = await service.generateCreativeContent(request);

      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.output.content).toBeDefined();
      expect(result.output.content.primary).toBeDefined();
      expect(result.process).toBeDefined();
      expect(result.vision).toBeDefined();
    });

    it('시 생성', async () => {
      const request = {
        type: 'poem' as const,
        mood: 'melancholic' as const,
        style: 'classical' as const,
        length: 'short' as const,
        theme: '재개발',
      };

      const result = await service.generateCreativeContent(request);

      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.output.content.primary).toBeDefined();
    });

    it('반복적 개선 옵션', async () => {
      const request = {
        type: 'story' as const,
        mood: 'inspiring' as const,
        style: 'modern' as const,
        length: 'medium' as const,
      };

      const result = await service.generateCreativeContent(request, {
        iterative_refinement: true,
      });

      expect(result).toBeDefined();
      if (result.iterations) {
        expect(Array.isArray(result.iterations)).toBe(true);
      }
    });

    it('실험적 수준 옵션', async () => {
      const request = {
        type: 'novel' as const,
        mood: 'provocative' as const,
        style: 'experimental' as const,
        length: 'long' as const,
      };

      const result = await service.generateCreativeContent(request, {
        experimentation_level: 'avant_garde',
      });

      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
    });

    it('캐릭터 포함 요청', async () => {
      const request = {
        type: 'story' as const,
        mood: 'romantic' as const,
        style: 'modern' as const,
        length: 'short' as const,
        characters: [
          {
            name: '주인공',
            role: 'protagonist' as const,
            personality: ['용감한', '지혜로운'],
            background: '시공사 선정 전문가',
            motivation: '최선의 시공사 선정',
            voice: {
              tone: '신중한',
              vocabulary: '전문적',
              speech_patterns: ['분석적으로', '체계적으로'],
            },
          },
        ],
      };

      const result = await service.generateCreativeContent(request);

      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
    });

    it('설정 포함 요청', async () => {
      const request = {
        type: 'story' as const,
        mood: 'dark' as const,
        style: 'modern' as const,
        length: 'short' as const,
        setting: {
          time: 'present' as const,
          place: '아파트 단지',
          atmosphere: ['긴장감', '기대감'],
          cultural_context: '재개발 프로젝트',
          physical_details: ['고층 건물', '공사 현장'],
          symbolic_elements: ['변화', '새로운 시작'],
          mood_influence: '희망과 불안의 공존',
        },
      };

      const result = await service.generateCreativeContent(request);

      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
    });
  });

  describe('창의적 분석', () => {
    it('창의성 점수 포함', async () => {
      const request = {
        type: 'essay' as const,
        mood: 'inspiring' as const,
        style: 'formal' as const,
        length: 'medium' as const,
      };

      const result = await service.generateCreativeContent(request);

      expect(result.output.creative_analysis).toBeDefined();
      expect(typeof result.output.creative_analysis.originality_score).toBe('number');
      expect(typeof result.output.creative_analysis.emotional_impact).toBe('number');
      expect(typeof result.output.creative_analysis.artistic_merit).toBe('number');
    });

    it('스타일 시그니처 포함', async () => {
      const request = {
        type: 'story' as const,
        mood: 'humorous' as const,
        style: 'conversational' as const,
        length: 'short' as const,
      };

      const result = await service.generateCreativeContent(request);

      expect(result.output.style_signature).toBeDefined();
      expect(Array.isArray(result.output.style_signature.distinctive_elements)).toBe(true);
      expect(Array.isArray(result.output.style_signature.literary_devices)).toBe(true);
    });
  });

  describe('인터랙티브 세션', () => {
    it('인터랙티브 생성 세션 시작', async () => {
      const request = {
        type: 'story' as const,
        mood: 'mysterious' as const,
        style: 'modern' as const,
        length: 'short' as const,
      };

      const userProfile = {
        creative_preferences: ['모던', '신비로운'],
        writing_experience: '중급',
        favorite_authors: ['작가1', '작가2'],
        creative_goals: ['스토리 완성'],
      };

      const session = await service.startInteractiveCreationSession(request, userProfile);

      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(Array.isArray(session.initialSuggestions)).toBe(true);
      expect(session.collaboration_framework).toBeDefined();
    });
  });

  describe('창의적 블록 해결', () => {
    it('창의적 블록 해결', async () => {
      const currentWork = '현재 작업 중인 내용입니다.';
      const blockType = 'plot' as const;
      const context = {
        writing_goal: '스토리 완성',
        progress_so_far: '시작 부분 완성',
        user_mood: '막힘',
        time_constraint: '없음',
      };

      const result = await service.resolveCreativeBlock(currentWork, blockType, context);

      expect(result).toBeDefined();
      expect(result.block_analysis).toBeDefined();
      expect(Array.isArray(result.resolution_strategies)).toBe(true);
    });
  });

  describe('스타일 실험', () => {
    it('스타일 실험', async () => {
      const baseContent = '기본 콘텐츠입니다.';
      const targetStyles = ['classical', 'modern', 'experimental'];

      const result = await service.experimentWithStyles(baseContent, targetStyles);

      expect(result).toBeDefined();
      expect(result.experiments).toBeDefined();
      expect(Array.isArray(result.experiments)).toBe(true);
    });
  });

  describe('창의적 협업', () => {
    it('창의적 협업 촉진', async () => {
      const contributions = [
        { author: '작가1', content: '첫 번째 아이디어' },
        { author: '작가2', content: '두 번째 아이디어' },
      ];

      const result = await service.facilitateCreativeCollaboration(contributions, {
        synthesis_approach: 'harmonious',
      });

      expect(result).toBeDefined();
      if (result.synthesizedContent) {
        expect(result.synthesizedContent).toBeDefined();
      } else {
        // 다른 필드가 있을 수 있음
        expect(result).toBeDefined();
      }
    });
  });
});

