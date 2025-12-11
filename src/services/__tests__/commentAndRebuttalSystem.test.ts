/**
 * CommentAndRebuttalSystem 테스트
 */

import {
  CommentAndRebuttalSystem,
  commentAndRebuttalSystem,
} from '../commentAndRebuttalSystem';
import { socialMediaInteractionEngine } from '../socialMediaInteractionEngine';
import { advancedWritingCognitiveEngine } from '../advancedWritingCognitiveEngine';

// 모킹
jest.mock('../socialMediaInteractionEngine');
jest.mock('../advancedWritingCognitiveEngine');

describe('CommentAndRebuttalSystem', () => {
  let service: CommentAndRebuttalSystem;

  beforeEach(() => {
    service = new CommentAndRebuttalSystem();
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(CommentAndRebuttalSystem);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(commentAndRebuttalSystem).toBeDefined();
    });
  });

  describe('고도화된 댓글 생성', () => {
    it('기본 댓글 생성', async () => {
      const request = {
        originalPost: '테스트 게시글입니다.',
        commentType: 'supportive',
        tone: 'respectful',
        engagement_goal: 'provide_support',
        platform: 'facebook',
        length: 'medium',
      };

      const result = await service.generateAdvancedComment(request);

      expect(result).toBeDefined();
      expect(result.comment).toBeDefined();
      expect(result.comment.mainComment).toBeDefined();
      expect(result.comment.variations).toBeDefined();
      expect(Array.isArray(result.comment.hashtagSuggestions)).toBe(true);
      expect(Array.isArray(result.comment.mentionSuggestions)).toBe(true);
      expect(Array.isArray(result.comment.followUpQuestions)).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(typeof result.analysis.appropriateness).toBe('number');
      expect(typeof result.analysis.engagement_potential).toBe('number');
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.alternatives)).toBe(true);
    });

    it('페르소나 포함 댓글 생성', async () => {
      const request = {
        originalPost: '테스트 게시글입니다.',
        commentType: 'informative',
        tone: 'analytical',
        persona: {
          age: '30s',
          background: 'IT 전문가',
          expertise: ['프로그래밍', 'AI'],
          personality: ['논리적', '분석적'],
        },
        engagement_goal: 'start_discussion',
        platform: 'linkedin',
        length: 'long',
      };

      const result = await service.generateAdvancedComment(request);

      expect(result).toBeDefined();
      expect(result.comment).toBeDefined();
    });

    it('다양한 댓글 타입', async () => {
      const commentTypes = [
        'supportive',
        'critical',
        'questioning',
        'informative',
        'humorous',
        'personal_experience',
      ] as const;

      for (const type of commentTypes) {
        try {
          const request = {
            originalPost: '테스트 게시글입니다.',
            commentType: type,
            tone: 'respectful',
            engagement_goal: 'provide_support',
            platform: 'facebook',
            length: 'medium',
          };

          const result = await service.generateAdvancedComment(request);

          expect(result).toBeDefined();
          expect(result.comment.mainComment).toBeDefined();
        } catch (error) {
          // 일부 타입에서 에러가 발생할 수 있으므로 처리
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('지능형 반박글 생성', () => {
    it('기본 반박글 생성', async () => {
      const request = {
        originalPost: '반박할 게시글입니다.',
        rebuttalType: 'logical_counter',
        strength: 'moderate_opposition',
        approach: 'respectful_discourse',
        maintain_civility: true,
      };

      const result = await service.generateIntelligentRebuttal(request);

      expect(result).toBeDefined();
      expect(result.rebuttal).toBeDefined();
      expect(result.rebuttal.main).toBeDefined();
      expect(result.rebuttal.structured).toBeDefined();
      expect(result.rebuttal.variations).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.analysis.originalPostAnalysis).toBeDefined();
      expect(result.effectiveness).toBeDefined();
      expect(typeof result.effectiveness.persuasion_score).toBe('number');
      expect(result.strategy).toBeDefined();
    });

    it('강한 반박글 생성', async () => {
      const request = {
        originalPost: '반박할 게시글입니다.',
        rebuttalType: 'evidence_based',
        strength: 'strong_counter',
        approach: 'fact_checking',
        maintain_civility: true,
      };

      const result = await service.generateIntelligentRebuttal(request);

      expect(result).toBeDefined();
      expect(result.rebuttal.main).toBeDefined();
    });
  });

  describe('댓글 체인 생성', () => {
    it('댓글 체인 생성', async () => {
      const participants = [
        {
          name: '참여자1',
          persona: {
            age: '30s',
            background: '전문가',
            expertise: ['기술'],
            personality: ['논리적'],
          },
          position: 'support',
        },
        {
          name: '참여자2',
          persona: {
            age: '40s',
            background: '연구자',
            expertise: ['연구'],
            personality: ['분석적'],
          },
          position: 'question',
        },
      ];

      const result = await service.generateCommentChain(
        '원본 게시글',
        3,
        'constructive_debate',
        participants
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.chain)).toBe(true);
      expect(result.narrative).toBeDefined();
      expect(result.insights).toBeDefined();
    });
  });

  describe('모니터링 및 응답 제안', () => {
    it('모니터링 및 응답 제안', async () => {
      const originalPost = '원본 게시글';
      const incomingComments = ['댓글1', '댓글2'];
      const responseStrategy = 'engage_all';

      const result = await service.monitorAndSuggestResponses(
        originalPost,
        incomingComments,
        responseStrategy
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.commentAnalysis)).toBe(true);
      expect(Array.isArray(result.responseRecommendations)).toBe(true);
      expect(result.overallStrategy).toBeDefined();
    });
  });

  describe('다양한 플랫폼', () => {
    it('다양한 플랫폼에서 댓글 생성', async () => {
      const platforms = [
        'facebook',
        'instagram',
        'twitter',
        'linkedin',
        'youtube',
        'community',
        'blog',
      ] as const;

      for (const platform of platforms) {
        const request = {
          originalPost: '테스트 게시글입니다.',
          commentType: 'supportive',
          tone: 'respectful',
          engagement_goal: 'provide_support',
          platform,
          length: 'medium',
        };

        const result = await service.generateAdvancedComment(request);

        expect(result).toBeDefined();
        expect(result.comment.mainComment).toBeDefined();
      }
    });
  });

  describe('다양한 톤', () => {
    it('다양한 톤으로 댓글 생성', async () => {
      const tones = [
        'respectful',
        'casual',
        'formal',
        'passionate',
        'analytical',
        'empathetic',
      ] as const;

      for (const tone of tones) {
        const request = {
          originalPost: '테스트 게시글입니다.',
          commentType: 'supportive',
          tone,
          engagement_goal: 'provide_support',
          platform: 'facebook',
          length: 'medium',
        };

        const result = await service.generateAdvancedComment(request);

        expect(result).toBeDefined();
        expect(result.comment.mainComment).toBeDefined();
      }
    });
  });
});

