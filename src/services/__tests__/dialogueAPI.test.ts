/**
 * DialogueAPI 테스트
 */

// axios 모킹을 먼저 설정
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import {
  DialogueAPIService,
  dialogueAPI,
} from '../dialogueAPI';
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DialogueAPIService', () => {
  let service: DialogueAPIService;

  beforeEach(() => {
    service = new DialogueAPIService();
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(DialogueAPIService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(dialogueAPI).toBeDefined();
    });
  });

  describe('대화 유형 조회', () => {
    it('대화 유형 목록 조회 - 로컬 폴백', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getDialogueTypes();

      expect(result).toBeDefined();
      expect(Array.isArray(result.dialogueTypes)).toBe(true);
      expect(result.dialogueTypes.length).toBeGreaterThan(0);
      expect(result.categories).toBeDefined();
    });

    it('대화 유형 목록 조회 - API 성공', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          dialogueTypes: [
            {
              id: 'test',
              name: '테스트',
              description: '테스트 설명',
              category: 'test',
              effectiveness_score: 80,
            },
          ],
          categories: {},
        },
      });

      const result = await service.getDialogueTypes();

      expect(result).toBeDefined();
      expect(Array.isArray(result.dialogueTypes)).toBe(true);
    });

    it('대화 유형 구조 확인', async () => {
      const result = await service.getDialogueTypes();

      if (result.dialogueTypes.length > 0) {
        const dialogueType = result.dialogueTypes[0];
        expect(dialogueType.id).toBeDefined();
        expect(dialogueType.name).toBeDefined();
        expect(dialogueType.description).toBeDefined();
        expect(dialogueType.category).toBeDefined();
        expect(typeof dialogueType.effectiveness_score).toBe('number');
      }
    });

    it('카테고리 정보 포함', async () => {
      const result = await service.getDialogueTypes();

      expect(result.categories).toBeDefined();
      expect(typeof result.categories).toBe('object');
    });
  });

  describe('대화 생성', () => {
    it('기본 대화 생성 - 로컬 폴백', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const request = {
        input_message: '시공사 선정에 대해 논의하겠습니다.',
        target_dialogue_types: ['agreement'],
        intensity_level: 5,
        relationship_dynamic: 'professional',
        conversation_context: [],
      };

      const result = await service.generateDialogue(request);

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        const message = result[0];
        expect(message.id).toBeDefined();
        expect(message.content).toBeDefined();
        expect(message.messageFormat).toBeDefined();
        expect(typeof message.confidence).toBe('number');
        expect(message.reasoning).toBeDefined();
        expect(message.timestamp).toBeDefined();
      }
    });

    it('여러 대화 유형으로 생성', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const request = {
        input_message: '시공사 선정 기준을 검토해야 합니다.',
        target_dialogue_types: ['agreement', 'suggestion', 'questioning'],
        intensity_level: 7,
        relationship_dynamic: 'collegial',
        conversation_context: ['이전 대화 내용'],
      };

      const result = await service.generateDialogue(request);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('자동 선택 모드', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const request = {
        input_message: '시공사 비교 분석이 필요합니다.',
        target_dialogue_types: ['auto'],
        intensity_level: 6,
        relationship_dynamic: 'formal',
        conversation_context: [],
      };

      const result = await service.generateDialogue(request);

      expect(Array.isArray(result)).toBe(true);
    });

    it('리라이팅 모드', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const request = {
        input_message: '원본 메시지',
        target_dialogue_types: ['refutation'],
        intensity_level: 5,
        relationship_dynamic: 'professional',
        conversation_context: [],
        rewrite_mode: true,
        original_text: '원본 텍스트입니다.',
      };

      const result = await service.generateDialogue(request);

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0].content).toBeDefined();
      }
    });

    it('선택된 메시지 포함', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const request = {
        input_message: '입력 메시지',
        target_dialogue_types: ['empathy'],
        intensity_level: 5,
        relationship_dynamic: 'friendly',
        conversation_context: [],
        selected_message: '선택된 메시지입니다.',
      };

      const result = await service.generateDialogue(request);

      expect(Array.isArray(result)).toBe(true);
    });

    it('다양한 강도 레벨', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const intensityLevels = [1, 5, 10];

      for (const intensity of intensityLevels) {
        const request = {
          input_message: '테스트 메시지',
          target_dialogue_types: ['suggestion'],
          intensity_level: intensity,
          relationship_dynamic: 'professional',
          conversation_context: [],
        };

        const result = await service.generateDialogue(request);

        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('컨텍스트 분석', () => {
    it('기본 컨텍스트 분석 - 로컬 폴백', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const conversationHistory = [
        '첫 번째 메시지',
        '두 번째 메시지',
        '세 번째 메시지',
      ];

      const result = await service.analyzeContext(conversationHistory);

      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
      expect(typeof result.urgency).toBe('number');
      expect(result.topic).toBeDefined();
      expect(Array.isArray(result.participants)).toBe(true);
      expect(result.relationship_type).toBeDefined();
    });

    it('빈 대화 이력 처리', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const result = await service.analyzeContext([]);

      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
    });

    it('긴 대화 이력 처리', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const longHistory = Array.from({ length: 50 }, (_, i) => `메시지 ${i + 1}`);

      const result = await service.analyzeContext(longHistory);

      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
    });
  });

  describe('대화 유형 필터링', () => {
    it('카테고리별 대화 유형 필터링', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getDialogueTypes();

      const supportTypes = result.dialogueTypes.filter(
        (type) => type.category === 'support'
      );

      expect(Array.isArray(supportTypes)).toBe(true);
      if (supportTypes.length > 0) {
        expect(supportTypes[0].category).toBe('support');
      }
    });

    it('효과성 점수 확인', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getDialogueTypes();

      result.dialogueTypes.forEach((type) => {
        expect(typeof type.effectiveness_score).toBe('number');
        expect(type.effectiveness_score).toBeGreaterThanOrEqual(0);
        expect(type.effectiveness_score).toBeLessThanOrEqual(100);
      });
    });
  });
});

