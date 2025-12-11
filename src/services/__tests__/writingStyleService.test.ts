/**
 * writingStyleService 서비스 테스트
 * 글쓰기 스타일 서비스 테스트
 */

import writingStyleService, { WritingStyle } from '../writingStyleService';
import { ToneConfig } from '../toneService';

describe('writingStyleService', () => {
  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(writingStyleService).toBeDefined();
    });
  });

  describe('getAllStyles', () => {
    it('모든 스타일을 반환해야 함', () => {
      const styles = writingStyleService.getAllStyles();

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
    });

    it('47개의 스타일을 반환해야 함', () => {
      const styles = writingStyleService.getAllStyles();

      expect(styles.length).toBe(47);
    });

    it('각 스타일이 필수 속성을 가져야 함', () => {
      const styles = writingStyleService.getAllStyles();

      styles.forEach(style => {
        expect(style.id).toBeDefined();
        expect(style.name).toBeDefined();
        expect(style.category).toBeDefined();
        expect(style.description).toBeDefined();
        expect(Array.isArray(style.characteristics)).toBe(true);
        expect(style.tone).toBeDefined();
        expect(style.structure).toBeDefined();
        expect(style.examplePrompt).toBeDefined();
      });
    });
  });

  describe('getStylesByCategory', () => {
    it('문학 카테고리 스타일을 반환해야 함', () => {
      const styles = writingStyleService.getStylesByCategory('literature');

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      styles.forEach(style => {
        expect(style.category).toBe('literature');
      });
    });

    it('비평 카테고리 스타일을 반환해야 함', () => {
      const styles = writingStyleService.getStylesByCategory('criticism');

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      styles.forEach(style => {
        expect(style.category).toBe('criticism');
      });
    });

    it('저널리즘 카테고리 스타일을 반환해야 함', () => {
      const styles = writingStyleService.getStylesByCategory('journalism');

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      styles.forEach(style => {
        expect(style.category).toBe('journalism');
      });
    });

    it('학술 카테고리 스타일을 반환해야 함', () => {
      const styles = writingStyleService.getStylesByCategory('academic');

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      styles.forEach(style => {
        expect(style.category).toBe('academic');
      });
    });

    it('창작 카테고리 스타일을 반환해야 함', () => {
      const styles = writingStyleService.getStylesByCategory('creative');

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      styles.forEach(style => {
        expect(style.category).toBe('creative');
      });
    });

    it('전문직 카테고리 스타일을 반환해야 함', () => {
      const styles = writingStyleService.getStylesByCategory('professional');

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      styles.forEach(style => {
        expect(style.category).toBe('professional');
      });
    });

    it('사회 카테고리 스타일을 반환해야 함', () => {
      const styles = writingStyleService.getStylesByCategory('social');

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      styles.forEach(style => {
        expect(style.category).toBe('social');
      });
    });
  });

  describe('getStyle', () => {
    it('소설가 스타일을 조회할 수 있어야 함', () => {
      const style = writingStyleService.getStyle('novelist');

      expect(style).not.toBeNull();
      expect(style?.name).toBe('소설가');
      expect(style?.category).toBe('literature');
    });

    it('시인 스타일을 조회할 수 있어야 함', () => {
      const style = writingStyleService.getStyle('poet');

      expect(style).not.toBeNull();
      expect(style?.name).toBe('시인');
      expect(style?.category).toBe('literature');
    });

    it('뉴스기자 스타일을 조회할 수 있어야 함', () => {
      const style = writingStyleService.getStyle('news-reporter');

      expect(style).not.toBeNull();
      expect(style?.name).toBe('뉴스기자');
      expect(style?.category).toBe('journalism');
    });

    it('존재하지 않는 스타일은 null을 반환해야 함', () => {
      const style = writingStyleService.getStyle('nonexistent');

      expect(style).toBeNull();
    });
  });

  describe('getTemplate', () => {
    it('소설가 템플릿을 조회할 수 있어야 함', () => {
      const template = writingStyleService.getTemplate('novelist');

      expect(template).not.toBeNull();
      expect(template?.styleId).toBe('novelist');
      expect(template?.template).toBeDefined();
      expect(Array.isArray(template?.variables)).toBe(true);
    });

    it('존재하지 않는 스타일의 템플릿은 null을 반환해야 함', () => {
      const template = writingStyleService.getTemplate('nonexistent');

      expect(template).toBeNull();
    });

    it('템플릿이 필수 변수를 포함해야 함', () => {
      const template = writingStyleService.getTemplate('novelist');

      expect(template?.variables).toContain('topic');
      expect(template?.variables).toContain('additionalInfo');
      expect(template?.variables).toContain('length');
    });
  });

  describe('generatePrompt', () => {
    it('기본 프롬프트를 생성해야 함', () => {
      const prompt = writingStyleService.generatePrompt('novelist', '소설 주제');

      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('소설 주제');
      expect(prompt).toContain('소설가');
    });

    it('추가 정보를 포함한 프롬프트를 생성해야 함', () => {
      const prompt = writingStyleService.generatePrompt(
        'poet',
        '시 주제',
        '추가 정보'
      );

      expect(prompt).toContain('시 주제');
      expect(prompt).toContain('추가 정보');
    });

    it('길이 정보를 포함한 프롬프트를 생성해야 함', () => {
      const prompt = writingStyleService.generatePrompt(
        'news-reporter',
        '뉴스 주제',
        '',
        '짧게'
      );

      expect(prompt).toContain('뉴스 주제');
      expect(prompt).toContain('짧게');
    });

    it('어투 설정을 포함한 프롬프트를 생성해야 함', () => {
      const toneConfig: ToneConfig = {
        toneType: 'formal',
        ageGroup: 'thirties',
      };

      const prompt = writingStyleService.generatePrompt(
        'academic-researcher',
        '학술 주제',
        '',
        '길게',
        toneConfig
      );

      expect(prompt).toContain('학술 주제');
      expect(prompt).toContain('어투 및 말투 지시사항');
    });

    it('존재하지 않는 스타일로 프롬프트 생성 시 에러를 던져야 함', () => {
      expect(() => {
        writingStyleService.generatePrompt('nonexistent', '주제');
      }).toThrow('스타일을 찾을 수 없습니다: nonexistent');
    });

    it('변수 치환이 올바르게 작동해야 함', () => {
      const prompt = writingStyleService.generatePrompt(
        'blogger',
        '블로그 주제',
        '추가 정보',
        '중간'
      );

      expect(prompt).not.toContain('{{topic}}');
      expect(prompt).not.toContain('{{additionalInfo}}');
      expect(prompt).not.toContain('{{length}}');
    });
  });

  describe('getExamplePrompt', () => {
    it('소설가 예시 프롬프트를 반환해야 함', () => {
      const example = writingStyleService.getExamplePrompt('novelist');

      expect(typeof example).toBe('string');
      expect(example.length).toBeGreaterThan(0);
      expect(example).toContain('소설');
    });

    it('시인 예시 프롬프트를 반환해야 함', () => {
      const example = writingStyleService.getExamplePrompt('poet');

      expect(typeof example).toBe('string');
      expect(example.length).toBeGreaterThan(0);
      expect(example).toContain('시');
    });

    it('존재하지 않는 스타일은 빈 문자열을 반환해야 함', () => {
      const example = writingStyleService.getExamplePrompt('nonexistent');

      expect(example).toBe('');
    });
  });

  describe('스타일 데이터 검증', () => {
    it('모든 스타일이 고유한 ID를 가져야 함', () => {
      const styles = writingStyleService.getAllStyles();
      const ids = styles.map(s => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('모든 스타일이 유효한 카테고리를 가져야 함', () => {
      const validCategories = [
        'literature',
        'criticism',
        'journalism',
        'academic',
        'creative',
        'professional',
        'social',
      ];

      const styles = writingStyleService.getAllStyles();
      styles.forEach(style => {
        expect(validCategories).toContain(style.category);
      });
    });

    it('모든 스타일이 특성을 가져야 함', () => {
      const styles = writingStyleService.getAllStyles();
      styles.forEach(style => {
        expect(style.characteristics.length).toBeGreaterThan(0);
      });
    });
  });
});

