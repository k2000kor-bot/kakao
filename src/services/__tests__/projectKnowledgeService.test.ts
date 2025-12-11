/**
 * projectKnowledgeService 서비스 테스트
 * 프로젝트 지식 서비스 테스트
 */

import projectKnowledgeService, { KnowledgeEntry } from '../projectKnowledgeService';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('projectKnowledgeService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(projectKnowledgeService).toBeDefined();
    });
  });

  describe('getProjectKnowledge', () => {
    it('프로젝트별 지식베이스를 조회할 수 있어야 함', () => {
      const knowledge = projectKnowledgeService.getProjectKnowledge('project-123');

      expect(Array.isArray(knowledge)).toBe(true);
      expect(knowledge.length).toBe(0);
    });

    it('저장된 지식이 있으면 반환해야 함', () => {
      const testEntry: KnowledgeEntry = {
        id: 'entry-1',
        title: '테스트 지식',
        content: '테스트 내용',
        source: 'manual',
        tags: ['테스트'],
        category: 'technical',
        confidence: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 0,
        relatedProjectId: 'project-123',
      };

      localStorage.setItem('project_knowledge_project-123', JSON.stringify([testEntry]));

      const knowledge = projectKnowledgeService.getProjectKnowledge('project-123');
      expect(knowledge.length).toBe(1);
      expect(knowledge[0].title).toBe('테스트 지식');
    });
  });

  describe('addKnowledgeEntry', () => {
    it('지식 엔트리를 추가할 수 있어야 함', () => {
      const entry = projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: '새 지식',
        content: '새 내용',
        source: 'manual',
        tags: ['태그1'],
        category: 'technical',
        confidence: 0.9,
        relatedProjectId: 'project-123',
      });

      expect(entry.id).toBeDefined();
      expect(entry.title).toBe('새 지식');
      expect(entry.createdAt).toBeDefined();
      expect(entry.updatedAt).toBeDefined();
      expect(entry.lastAccessed).toBeDefined();
      expect(entry.accessCount).toBe(0);
    });

    it('추가된 지식이 저장되어야 함', () => {
      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: '저장 테스트',
        content: '내용',
        source: 'manual',
        tags: [],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      const knowledge = projectKnowledgeService.getProjectKnowledge('project-123');
      expect(knowledge.length).toBe(1);
      expect(knowledge[0].title).toBe('저장 테스트');
    });
  });

  describe('addWebSearchResults', () => {
    it('웹 검색 결과를 지식베이스에 추가할 수 있어야 함', async () => {
      const searchResults = [
        {
          title: '웹 검색 결과 1',
          snippet: '검색 결과 내용 1',
          link: 'https://example.com/1',
        },
        {
          title: '웹 검색 결과 2',
          snippet: '검색 결과 내용 2',
          link: 'https://example.com/2',
        },
      ];

      const addedEntries = await projectKnowledgeService.addWebSearchResults(
        'project-123',
        '검색어',
        searchResults
      );

      expect(addedEntries.length).toBe(2);
      expect(addedEntries[0].source).toBe('web_search');
      expect(addedEntries[0].sourceUrl).toBe('https://example.com/1');
    });

    it('중복된 검색 결과는 업데이트해야 함', async () => {
      const searchResult = {
        title: '중복 테스트',
        snippet: '내용',
        link: 'https://example.com',
      };

      // 첫 번째 추가
      await projectKnowledgeService.addWebSearchResults('project-123', '검색어', [searchResult]);

      // 두 번째 추가 (중복)
      const addedEntries = await projectKnowledgeService.addWebSearchResults(
        'project-123',
        '검색어',
        [searchResult]
      );

      expect(addedEntries.length).toBe(1);
      expect(addedEntries[0].accessCount).toBeGreaterThan(0);
    });
  });

  describe('extractKnowledgeFromChat', () => {
    it('AI 응답에서 지식을 추출할 수 있어야 함', async () => {
      const messageContent = 'React는 JavaScript 라이브러리입니다. 예를 들어, 컴포넌트를 사용하여 UI를 구성할 수 있습니다.';
      const extracted = await projectKnowledgeService.extractKnowledgeFromChat(
        'project-123',
        'chat-1',
        'message-1',
        messageContent,
        true
      );

      expect(Array.isArray(extracted)).toBe(true);
    });

    it('사용자 메시지에서는 지식을 추출하지 않아야 함', async () => {
      const extracted = await projectKnowledgeService.extractKnowledgeFromChat(
        'project-123',
        'chat-1',
        'message-1',
        '사용자 메시지',
        false
      );

      expect(extracted.length).toBe(0);
    });
  });

  describe('searchKnowledge', () => {
    it('지식을 검색할 수 있어야 함', () => {
      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: 'React 가이드',
        content: 'React는 JavaScript 라이브러리입니다',
        source: 'manual',
        tags: ['react', 'javascript'],
        category: 'technical',
        confidence: 0.9,
        relatedProjectId: 'project-123',
      });

      const results = projectKnowledgeService.searchKnowledge('project-123', 'React');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entry.title).toContain('React');
    });

    it('관련성 점수로 정렬되어야 함', () => {
      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: 'React 가이드',
        content: 'React 내용',
        source: 'manual',
        tags: ['react'],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: 'Vue 가이드',
        content: 'Vue 내용',
        source: 'manual',
        tags: ['vue'],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      const results = projectKnowledgeService.searchKnowledge('project-123', 'React');

      if (results.length > 0) {
        expect(results[0].relevanceScore).toBeGreaterThanOrEqual(0);
      }
    });

    it('검색 결과가 없으면 빈 배열을 반환해야 함', () => {
      const results = projectKnowledgeService.searchKnowledge('project-123', '존재하지않는검색어');

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('updateKnowledgeEntry', () => {
    it('지식 엔트리를 업데이트할 수 있어야 함', () => {
      const entry = projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: '원본 제목',
        content: '원본 내용',
        source: 'manual',
        tags: [],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      entry.title = '수정된 제목';
      projectKnowledgeService.updateKnowledgeEntry('project-123', entry);

      const knowledge = projectKnowledgeService.getProjectKnowledge('project-123');
      expect(knowledge[0].title).toBe('수정된 제목');
      expect(knowledge[0].updatedAt).toBeDefined();
    });
  });

  describe('deleteKnowledgeEntry', () => {
    it('지식 엔트리를 삭제할 수 있어야 함', () => {
      const entry = projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: '삭제 대상',
        content: '내용',
        source: 'manual',
        tags: [],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      projectKnowledgeService.deleteKnowledgeEntry('project-123', entry.id);

      const knowledge = projectKnowledgeService.getProjectKnowledge('project-123');
      expect(knowledge.length).toBe(0);
    });
  });

  describe('getKnowledgeAnalytics', () => {
    it('지식베이스 분석을 반환해야 함', () => {
      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: '기술 문서',
        content: '내용',
        source: 'manual',
        tags: [],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: '비즈니스 문서',
        content: '내용',
        source: 'web_search',
        tags: [],
        category: 'business',
        confidence: 0.7,
        relatedProjectId: 'project-123',
      });

      const analytics = projectKnowledgeService.getKnowledgeAnalytics('project-123');

      expect(analytics.totalEntries).toBe(2);
      expect(analytics.categoryDistribution['technical']).toBe(1);
      expect(analytics.categoryDistribution['business']).toBe(1);
      expect(analytics.sourceDistribution['manual']).toBe(1);
      expect(analytics.sourceDistribution['web_search']).toBe(1);
    });

    it('가장 많이 접근된 엔트리를 반환해야 함', () => {
      const entry1 = projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: '인기 문서',
        content: '내용',
        source: 'manual',
        tags: [],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      entry1.accessCount = 10;
      projectKnowledgeService.updateKnowledgeEntry('project-123', entry1);

      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: '일반 문서',
        content: '내용',
        source: 'manual',
        tags: [],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      const analytics = projectKnowledgeService.getKnowledgeAnalytics('project-123');

      expect(analytics.mostAccessedEntries.length).toBeGreaterThan(0);
      if (analytics.mostAccessedEntries.length > 0) {
        expect(analytics.mostAccessedEntries[0].accessCount).toBeGreaterThanOrEqual(10);
      }
    });
  });

  describe('findSimilarKnowledge', () => {
    it('유사한 지식을 찾을 수 있어야 함', () => {
      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: 'React 가이드',
        content: 'React는 JavaScript 라이브러리입니다',
        source: 'manual',
        tags: [],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      const similar = projectKnowledgeService.findSimilarKnowledge(
        'project-123',
        'React 가이드',
        'React는 JavaScript 라이브러리입니다'
      );

      expect(similar).not.toBeNull();
    });

    it('유사한 지식이 없으면 null을 반환해야 함', () => {
      const similar = projectKnowledgeService.findSimilarKnowledge(
        'project-123',
        '완전히 다른 제목',
        '완전히 다른 내용'
      );

      expect(similar).toBeNull();
    });
  });

  describe('getKnowledgeRecommendations', () => {
    it('지식 추천을 반환할 수 있어야 함', () => {
      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: 'React 가이드',
        content: 'React는 JavaScript 라이브러리입니다',
        source: 'manual',
        tags: ['react'],
        category: 'technical',
        confidence: 0.9,
        relatedProjectId: 'project-123',
      });

      const recommendations = projectKnowledgeService.getKnowledgeRecommendations(
        'project-123',
        'React'
      );

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('exportKnowledge', () => {
    it('지식베이스를 내보낼 수 있어야 함', () => {
      projectKnowledgeService.addKnowledgeEntry('project-123', {
        title: '내보내기 테스트',
        content: '내용',
        source: 'manual',
        tags: [],
        category: 'technical',
        confidence: 0.8,
        relatedProjectId: 'project-123',
      });

      const exported = projectKnowledgeService.exportKnowledge('project-123');
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    });
  });

  describe('importKnowledge', () => {
    it('지식베이스를 가져올 수 있어야 함', () => {
      const testData = JSON.stringify([
        {
          id: 'imported-1',
          title: '가져온 지식',
          content: '내용',
          source: 'manual',
          tags: [],
          category: 'technical',
          confidence: 0.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: 0,
          relatedProjectId: 'project-123',
        },
      ]);

      projectKnowledgeService.importKnowledge('project-123', testData);

      const knowledge = projectKnowledgeService.getProjectKnowledge('project-123');
      expect(knowledge.length).toBe(1);
      expect(knowledge[0].title).toBe('가져온 지식');
    });

    it('잘못된 JSON은 무시해야 함', () => {
      expect(() => {
        projectKnowledgeService.importKnowledge('project-123', 'invalid json');
      }).not.toThrow();
    });
  });
});

