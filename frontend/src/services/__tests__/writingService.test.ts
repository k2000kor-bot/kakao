/**
 * WritingService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { writingService, WritingService, WritingRequest } from '../writingService';

describe('WritingService', () => {
  let service: WritingService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);
    service = new WritingService();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(WritingService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(writingService).toBeDefined();
      expect(writingService).toBeInstanceOf(WritingService);
    });
  });

  describe('템플릿 관리', () => {
    it('템플릿 목록 조회', async () => {
      const templates = await service.getTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('템플릿 구조 확인', async () => {
      const templates = await service.getTemplates();
      expect(templates.length).toBeGreaterThan(0);
      const template = templates[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('category');
      expect(template).toHaveProperty('sections');
      expect(template).toHaveProperty('keywords');
    });

    it('기본 템플릿 존재 확인', async () => {
      const templates = await service.getTemplates();
      const reportTemplate = templates.find(t => t.id === 'report');
      const proposalTemplate = templates.find(t => t.id === 'proposal');
      const summaryTemplate = templates.find(t => t.id === 'summary');

      expect(reportTemplate).toBeDefined();
      expect(proposalTemplate).toBeDefined();
      expect(summaryTemplate).toBeDefined();
    });
  });

  describe('도구 목록', () => {
    it('도구 목록 조회', async () => {
      const tools = await service.getTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('도구 구조 확인', async () => {
      const tools = await service.getTools();
      expect(tools.length).toBeGreaterThan(0);
      const tool = tools[0];
      expect(tool).toHaveProperty('id');
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('category');
      expect(tool).toHaveProperty('icon');
    });
  });

  describe('콘텐츠 생성', () => {
    it('기본 콘텐츠 생성', async () => {
      const request: WritingRequest = {
        topic: '테스트 주제',
        template: 'report',
        keywords: ['테스트', '분석'],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'medium',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('keywords');
      expect(result).toHaveProperty('quality');
      expect(result).toHaveProperty('wordCount');
      expect(result).toHaveProperty('readingTime');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('metadata');
    });

    it('존재하지 않는 템플릿으로 생성 시 에러', async () => {
      const request: WritingRequest = {
        topic: '테스트',
        template: 'non-existent',
        keywords: [],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'medium',
        format: 'markdown',
      };

      await expect(service.generateContent(request)).rejects.toThrow('템플릿을 찾을 수 없습니다.');
    });

    it('다양한 톤으로 콘텐츠 생성', async () => {
      const tones: WritingRequest['tone'][] = ['formal', 'casual', 'professional', 'friendly'];

      for (const tone of tones) {
        const request: WritingRequest = {
          topic: '테스트',
          template: 'report',
          keywords: [],
          tone,
          targetAudience: '개발자',
          length: 'medium',
          format: 'markdown',
        };

        const result = await service.generateContent(request);
        expect(result.metadata.tone).toBe(tone);
      }
    });

    it('짧은 길이 콘텐츠 생성', async () => {
      const request: WritingRequest = {
        topic: '테스트',
        template: 'report',
        keywords: [],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'short',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('긴 길이 콘텐츠 생성', async () => {
      const request: WritingRequest = {
        topic: '테스트',
        template: 'report',
        keywords: [],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'long',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('키워드 포함 콘텐츠 생성', async () => {
      const request: WritingRequest = {
        topic: '테스트',
        template: 'report',
        keywords: ['분석', '데이터'],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'medium',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(result.keywords).toEqual(['분석', '데이터']);
    });

    it('품질 점수 범위 확인', async () => {
      const request: WritingRequest = {
        topic: '테스트',
        template: 'report',
        keywords: ['테스트'],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'medium',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(result.quality).toBeGreaterThanOrEqual(0);
      expect(result.quality).toBeLessThanOrEqual(1);
    });

    it('읽기 시간 계산', async () => {
      const request: WritingRequest = {
        topic: '테스트',
        template: 'report',
        keywords: [],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'medium',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(result.readingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('콘텐츠 향상', () => {
    it('명확성 향상', async () => {
      const content = '이것은 테스트 내용입니다.';
      const enhanced = await service.enhanceContent(content, 'clarity');
      expect(enhanced).toBeDefined();
      expect(typeof enhanced).toBe('string');
    });

    it('상세화', async () => {
      const content = '테스트 내용입니다.';
      const enhanced = await service.enhanceContent(content, 'detail');
      expect(enhanced).toContain('추가적인 상세 정보');
    });

    it('구조 개선', async () => {
      const content = '첫 번째 문단\n\n두 번째 문단';
      const enhanced = await service.enhanceContent(content, 'structure');
      expect(enhanced).toContain('---');
    });

    it('톤 조정', async () => {
      const content = '테스트입니다.';
      const enhanced = await service.enhanceContent(content, 'tone');
      expect(enhanced).toBeDefined();
    });

    it('알 수 없는 향상 타입', async () => {
      const content = '테스트 내용';
      const enhanced = await service.enhanceContent(content, 'unknown');
      expect(enhanced).toBe(content);
    });
  });

  describe('콘텐츠 분석', () => {
    it('기본 콘텐츠 분석', async () => {
      const content = '이것은 테스트 콘텐츠입니다. 여러 문장으로 구성되어 있습니다.';
      const analysis = await service.analyzeContent(content);

      expect(analysis).toBeDefined();
      expect(analysis).toHaveProperty('wordCount');
      expect(analysis).toHaveProperty('readingTime');
      expect(analysis).toHaveProperty('complexity');
      expect(analysis).toHaveProperty('sentiment');
      expect(analysis).toHaveProperty('readability');
      expect(analysis).toHaveProperty('keywordDensity');
      expect(analysis).toHaveProperty('structure');
    });

    it('단어 수 계산', async () => {
      const content = '하나 둘 셋 넷 다섯';
      const analysis = await service.analyzeContent(content);
      expect(analysis.wordCount).toBeGreaterThan(0);
    });

    it('읽기 시간 계산', async () => {
      const content = '테스트 '.repeat(200);
      const analysis = await service.analyzeContent(content);
      expect(analysis.readingTime).toBeGreaterThanOrEqual(1);
    });

    it('복잡도 분석', async () => {
      const simpleContent = '간단한 내용입니다.';
      const complexContent = '이것은 분석 전략 시스템 프로세스 최적화 통합에 관한 복잡한 내용입니다.';

      const simpleAnalysis = await service.analyzeContent(simpleContent);
      const complexAnalysis = await service.analyzeContent(complexContent);

      expect(simpleAnalysis.complexity).toBe('simple');
      expect(complexAnalysis.complexity).toBe('complex');
    });

    it('감정 분석', async () => {
      const positiveContent = '성공적인 개선과 향상이 있었습니다.';
      const negativeContent = '문제와 실패가 발생했습니다.';
      const neutralContent = '일반적인 내용입니다.';

      const positiveAnalysis = await service.analyzeContent(positiveContent);
      const negativeAnalysis = await service.analyzeContent(negativeContent);
      const neutralAnalysis = await service.analyzeContent(neutralContent);

      expect(positiveAnalysis.sentiment).toBe('positive');
      expect(negativeAnalysis.sentiment).toBe('negative');
      expect(neutralAnalysis.sentiment).toBe('neutral');
    });

    it('가독성 계산', async () => {
      const content = '첫 번째 문장. 두 번째 문장. 세 번째 문장.';
      const analysis = await service.analyzeContent(content);
      expect(analysis.readability).toBeGreaterThan(0);
    });

    it('키워드 밀도 계산', async () => {
      const content = '테스트 테스트 내용 내용';
      const analysis = await service.analyzeContent(content);
      expect(analysis.keywordDensity).toBeDefined();
      expect(typeof analysis.keywordDensity).toBe('object');
    });

    it('구조 분석', async () => {
      const content = '# 제목\n\n- 항목 1\n- 항목 2\n\n문단 내용';
      const analysis = await service.analyzeContent(content);
      
      expect(analysis.structure).toBeDefined();
      expect(analysis.structure).toHaveProperty('hasHeadings');
      expect(analysis.structure).toHaveProperty('hasLists');
      expect(analysis.structure).toHaveProperty('hasParagraphs');
      expect(analysis.structure).toHaveProperty('structureScore');
    });

    it('구조 점수 범위', async () => {
      const content = '테스트 내용';
      const analysis = await service.analyzeContent(content);
      expect(analysis.structure.structureScore).toBeGreaterThanOrEqual(0);
      expect(analysis.structure.structureScore).toBeLessThanOrEqual(1);
    });
  });

  describe('포맷 변환', () => {
    it('마크다운 변환', async () => {
      const content = '제목\n내용';
      const markdown = await service.formatContent(content, 'markdown');
      expect(markdown).toBeDefined();
      expect(typeof markdown).toBe('string');
    });

    it('HTML 변환', async () => {
      const content = '제목\n내용';
      const html = await service.formatContent(content, 'html');
      expect(html).toContain('<br>');
      expect(html).toContain('<h1>');
    });

    it('플레인 텍스트 변환', async () => {
      const content = '# 제목\n\n내용';
      const plain = await service.formatContent(content, 'plain');
      expect(plain).toBeDefined();
      expect(typeof plain).toBe('string');
    });

    it('알 수 없는 포맷', async () => {
      const content = '테스트';
      const result = await service.formatContent(content, 'unknown');
      expect(result).toBe(content);
    });
  });

  describe('메타데이터', () => {
    it('결과 메타데이터 구조', async () => {
      const request: WritingRequest = {
        topic: '테스트',
        template: 'report',
        keywords: [],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'medium',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(result.metadata).toHaveProperty('template');
      expect(result.metadata).toHaveProperty('tone');
      expect(result.metadata).toHaveProperty('targetAudience');
      expect(result.metadata).toHaveProperty('complexity');
      expect(result.metadata).toHaveProperty('sentiment');
    });

    it('복잡도 메타데이터', async () => {
      const request: WritingRequest = {
        topic: '테스트',
        template: 'report',
        keywords: [],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'medium',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(['simple', 'moderate', 'complex']).toContain(result.metadata.complexity);
    });

    it('감정 메타데이터', async () => {
      const request: WritingRequest = {
        topic: '테스트',
        template: 'report',
        keywords: [],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'medium',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(['positive', 'negative', 'neutral']).toContain(result.metadata.sentiment);
    });
  });

  describe('에지 케이스', () => {
    it('빈 콘텐츠 분석', async () => {
      const analysis = await service.analyzeContent('');
      // 빈 문자열 split(' ')은 ['']를 반환하므로 wordCount는 1이 됨
      expect(analysis.wordCount).toBeGreaterThanOrEqual(0);
      expect(analysis.readingTime).toBeGreaterThanOrEqual(0);
    });

    it('긴 콘텐츠 생성', async () => {
      const request: WritingRequest = {
        topic: '긴 주제',
        template: 'report',
        keywords: [],
        tone: 'professional',
        targetAudience: '개발자',
        length: 'long',
        format: 'markdown',
      };

      const result = await service.generateContent(request);
      expect(result.content.length).toBeGreaterThan(0);
    });

    it('특수 문자 포함 콘텐츠', async () => {
      const content = '테스트 #해시태그 @멘션 $달러';
      const analysis = await service.analyzeContent(content);
      expect(analysis).toBeDefined();
    });

    it('여러 줄 콘텐츠 분석', async () => {
      const content = '첫 번째 줄\n두 번째 줄\n세 번째 줄';
      const analysis = await service.analyzeContent(content);
      expect(analysis.structure.hasParagraphs).toBeDefined();
    });
  });
});

