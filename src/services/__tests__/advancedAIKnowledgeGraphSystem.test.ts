/**
 * advancedAIKnowledgeGraphSystem 서비스 테스트
 * 고급 AI 지식 그래프 시스템 테스트
 */

import advancedAIKnowledgeGraphSystem from '../advancedAIKnowledgeGraphSystem';
import realTimeAIAlertSystem from '../realTimeAIAlertSystem';

// 의존성 모킹
jest.mock('../realTimeAIAlertSystem', () => ({
  createAlert: jest.fn(),
}));

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('advancedAIKnowledgeGraphSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 시스템 중지
    if (advancedAIKnowledgeGraphSystem) {
      try {
        advancedAIKnowledgeGraphSystem.stop();
      } catch (e) {
        // 이미 중지된 상태일 수 있음
      }
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIKnowledgeGraphSystem).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIKnowledgeGraphSystem;
      const instance2 = advancedAIKnowledgeGraphSystem;
      expect(instance1).toBe(instance2);
    });
  });

  describe('initializeSystem', () => {
    it('시스템을 초기화할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();

      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      expect(Array.isArray(graphs)).toBe(true);
      expect(graphs.length).toBeGreaterThan(0);
    });
  });

  describe('addKnowledgeNode', () => {
    it('지식 노드를 추가할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const node = {
        type: 'concept' as const,
        label: '테스트 개념',
        description: '테스트용 개념 노드',
        properties: { test: true },
        confidence: 0.9,
        source: 'test',
        metadata: {
          domain: 'test',
          language: 'ko',
          version: '1.0',
          tags: ['test'],
        },
      };

      const nodeId = advancedAIKnowledgeGraphSystem.addKnowledgeNode(graphId, node);

      expect(nodeId).toBeDefined();
      expect(typeof nodeId).toBe('string');
      expect(realTimeAIAlertSystem.createAlert).toHaveBeenCalled();
    });

    it('존재하지 않는 그래프에 노드를 추가하면 에러를 발생시켜야 함', () => {
      expect(() => {
        advancedAIKnowledgeGraphSystem.addKnowledgeNode('non-existent-graph', {
          type: 'concept',
          label: 'test',
          description: 'test',
          properties: {},
          confidence: 0.9,
          source: 'test',
          metadata: {
            domain: 'test',
            language: 'ko',
            version: '1.0',
            tags: [],
          },
        });
      }).toThrow();
    });
  });

  describe('addKnowledgeEdge', () => {
    it('지식 엣지를 추가할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      // 먼저 노드 추가
      const node1 = advancedAIKnowledgeGraphSystem.addKnowledgeNode(graphId, {
        type: 'concept',
        label: '노드1',
        description: '첫 번째 노드',
        properties: {},
        confidence: 0.9,
        source: 'test',
        metadata: {
          domain: 'test',
          language: 'ko',
          version: '1.0',
          tags: [],
        },
      });

      const node2 = advancedAIKnowledgeGraphSystem.addKnowledgeNode(graphId, {
        type: 'concept',
        label: '노드2',
        description: '두 번째 노드',
        properties: {},
        confidence: 0.9,
        source: 'test',
        metadata: {
          domain: 'test',
          language: 'ko',
          version: '1.0',
          tags: [],
        },
      });

      const edge = {
        source_node_id: node1,
        target_node_id: node2,
        relationship_type: 'is_a' as const,
        weight: 0.8,
        confidence: 0.85,
        properties: {},
      };

      const edgeId = advancedAIKnowledgeGraphSystem.addKnowledgeEdge(graphId, edge);

      expect(edgeId).toBeDefined();
      expect(typeof edgeId).toBe('string');
    });

    it('존재하지 않는 노드 간 엣지를 추가하면 에러를 발생시켜야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      expect(() => {
        advancedAIKnowledgeGraphSystem.addKnowledgeEdge(graphId, {
          source_node_id: 'non-existent-node-1',
          target_node_id: 'non-existent-node-2',
          relationship_type: 'is_a',
          weight: 0.8,
          confidence: 0.85,
          properties: {},
        });
      }).toThrow();
    });
  });

  describe('executeKnowledgeQuery', () => {
    it('노드 검색 쿼리를 실행할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const query = {
        query_type: 'node_search' as const,
        query_text: '인공지능',
        parameters: {},
      };

      const result = advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, query);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.query_type).toBe('node_search');
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.execution_time).toBe('number');
      expect(typeof result.confidence).toBe('number');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('경로 찾기 쿼리를 실행할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const query = {
        query_type: 'path_finding' as const,
        query_text: '경로 찾기',
        parameters: {
          source_node: 'ai',
          target_node: 'deep-learning',
          max_path_length: 5,
        },
      };

      const result = advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, query);

      expect(result).toBeDefined();
      expect(result.query_type).toBe('path_finding');
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('패턴 매칭 쿼리를 실행할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const query = {
        query_type: 'pattern_matching' as const,
        query_text: '패턴 찾기',
        parameters: {},
      };

      const result = advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, query);

      expect(result).toBeDefined();
      expect(result.query_type).toBe('pattern_matching');
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('추론 쿼리를 실행할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const query = {
        query_type: 'inference' as const,
        query_text: '추론',
        parameters: {},
      };

      const result = advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, query);

      expect(result).toBeDefined();
      expect(result.query_type).toBe('inference');
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('유사성 검색 쿼리를 실행할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const query = {
        query_type: 'similarity' as const,
        query_text: '유사성 검색',
        parameters: {
          target_node_id: 'ai',
          similarity_threshold: 0.7,
        },
      };

      const result = advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, query);

      expect(result).toBeDefined();
      expect(result.query_type).toBe('similarity');
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('클러스터링 쿼리를 실행할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const query = {
        query_type: 'clustering' as const,
        query_text: '클러스터링',
        parameters: {},
      };

      const result = advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, query);

      expect(result).toBeDefined();
      expect(result.query_type).toBe('clustering');
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('존재하지 않는 그래프에 쿼리를 실행하면 에러를 발생시켜야 함', () => {
      expect(() => {
        advancedAIKnowledgeGraphSystem.executeKnowledgeQuery('non-existent-graph', {
          query_type: 'node_search',
          query_text: 'test',
          parameters: {},
        });
      }).toThrow();
    });
  });

  describe('getKnowledgeGraphs', () => {
    it('모든 지식 그래프를 조회할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();

      expect(Array.isArray(graphs)).toBe(true);
      expect(graphs.length).toBeGreaterThan(0);
    });

    it('그래프가 올바른 구조를 가져야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();

      if (graphs.length > 0) {
        const graph = graphs[0];
        expect(graph.id).toBeDefined();
        expect(graph.name).toBeDefined();
        expect(graph.description).toBeDefined();
        expect(graph.domain).toBeDefined();
        expect(graph.nodes).toBeInstanceOf(Map);
        expect(graph.edges).toBeInstanceOf(Map);
        expect(graph.metrics).toBeDefined();
        expect(graph.created_at).toBeInstanceOf(Date);
        expect(graph.updated_at).toBeInstanceOf(Date);
      }
    });
  });

  describe('getKnowledgeGraph', () => {
    it('특정 지식 그래프를 조회할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const graph = advancedAIKnowledgeGraphSystem.getKnowledgeGraph(graphId);

      expect(graph).toBeDefined();
      expect(graph?.id).toBe(graphId);
    });

    it('존재하지 않는 그래프는 undefined를 반환해야 함', () => {
      const graph = advancedAIKnowledgeGraphSystem.getKnowledgeGraph('non-existent-graph');

      expect(graph).toBeUndefined();
    });
  });

  describe('getQueries', () => {
    it('쿼리 히스토리를 조회할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const queries = advancedAIKnowledgeGraphSystem.getQueries(graphId);

      expect(Array.isArray(queries)).toBe(true);
    });

    it('쿼리 실행 후 히스토리에 저장되어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const initialCount = advancedAIKnowledgeGraphSystem.getQueries(graphId).length;

      advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, {
        query_type: 'node_search',
        query_text: '테스트',
        parameters: {},
      });

      const queries = advancedAIKnowledgeGraphSystem.getQueries(graphId);
      expect(queries.length).toBeGreaterThan(initialCount);
    });
  });

  describe('getInferences', () => {
    it('추론 히스토리를 조회할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const inferences = advancedAIKnowledgeGraphSystem.getInferences(graphId);

      expect(Array.isArray(inferences)).toBe(true);
    });
  });

  describe('getPatterns', () => {
    it('패턴을 조회할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      const patterns = advancedAIKnowledgeGraphSystem.getPatterns(graphId);

      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('메트릭을 조회할 수 있어야 함', () => {
      const metrics = advancedAIKnowledgeGraphSystem.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.totalNodes).toBe('number');
      expect(typeof metrics.totalEdges).toBe('number');
      expect(typeof metrics.averageNodeConfidence).toBe('number');
      expect(typeof metrics.averageEdgeConfidence).toBe('number');
      expect(typeof metrics.graphDensity).toBe('number');
      expect(typeof metrics.averagePathLength).toBe('number');
      expect(typeof metrics.clusteringCoefficient).toBe('number');
      expect(typeof metrics.knowledgeCoverage).toBe('number');
      expect(typeof metrics.relationshipComplexity).toBe('number');
      expect(typeof metrics.graphConnectivity).toBe('number');
    });
  });

  describe('getSystemHealth', () => {
    it('시스템 상태를 조회할 수 있어야 함', () => {
      const health = advancedAIKnowledgeGraphSystem.getSystemHealth();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(['healthy', 'stopped']).toContain(health.status);
      expect(health.details).toBeDefined();
      expect(typeof health.details.total_graphs).toBe('number');
      expect(typeof health.details.total_nodes).toBe('number');
      expect(typeof health.details.total_edges).toBe('number');
    });
  });

  describe('start / stop', () => {
    it('시스템을 시작할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.start();
      advancedAIKnowledgeGraphSystem.stop();
    });

    it('시스템을 중지할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.start();
      advancedAIKnowledgeGraphSystem.stop();
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAIKnowledgeGraphSystem.start();
      advancedAIKnowledgeGraphSystem.start(); // 중복 호출
      advancedAIKnowledgeGraphSystem.stop();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 지식 그래프를 생성하고 조회할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      // 재개발 프로젝트 관련 노드 추가
      const redevelopmentNode = advancedAIKnowledgeGraphSystem.addKnowledgeNode(graphId, {
        type: 'concept',
        label: '재개발 프로젝트',
        description: '기존 건물을 철거하고 새로운 건물을 건설하는 프로젝트',
        properties: { category: 'construction', type: 'redevelopment' },
        confidence: 0.95,
        source: 'user',
        metadata: {
          domain: 'construction',
          language: 'ko',
          version: '1.0',
          tags: ['재개발', '건설', '프로젝트'],
        },
      });

      expect(redevelopmentNode).toBeDefined();

      const graph = advancedAIKnowledgeGraphSystem.getKnowledgeGraph(graphId);
      expect(graph).toBeDefined();
      expect(graph?.nodes.has(redevelopmentNode)).toBe(true);
    });

    it('시공사 선정 관련 지식 노드와 관계를 생성할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      // 시공사 노드 추가
      const contractorNode = advancedAIKnowledgeGraphSystem.addKnowledgeNode(graphId, {
        type: 'entity',
        label: '시공사',
        description: '건설 공사를 시공하는 업체',
        properties: { type: 'contractor' },
        confidence: 0.92,
        source: 'user',
        metadata: {
          domain: 'construction',
          language: 'ko',
          version: '1.0',
          tags: ['시공사', '건설', '업체'],
        },
      });

      // 선정 기준 노드 추가
      const criteriaNode = advancedAIKnowledgeGraphSystem.addKnowledgeNode(graphId, {
        type: 'concept',
        label: '선정 기준',
        description: '시공사를 선정하기 위한 평가 기준',
        properties: { type: 'criteria' },
        confidence: 0.9,
        source: 'user',
        metadata: {
          domain: 'construction',
          language: 'ko',
          version: '1.0',
          tags: ['선정', '기준', '평가'],
        },
      });

      // 관계 추가
      const edge = advancedAIKnowledgeGraphSystem.addKnowledgeEdge(graphId, {
        source_node_id: contractorNode,
        target_node_id: criteriaNode,
        relationship_type: 'depends_on',
        weight: 0.9,
        confidence: 0.95,
        properties: { relationship: '선정 기준에 따라 결정됨' },
      });

      expect(edge).toBeDefined();

      // 쿼리 실행
      const query = advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, {
        query_type: 'node_search',
        query_text: '시공사',
        parameters: {},
      });

      expect(query.results.length).toBeGreaterThan(0);
    });

    it('지식 그래프에서 경로를 찾고 추론을 수행할 수 있어야 함', () => {
      advancedAIKnowledgeGraphSystem.initializeSystem();
      const graphs = advancedAIKnowledgeGraphSystem.getKnowledgeGraphs();
      const graphId = graphs[0].id;

      // 경로 찾기 쿼리
      const pathQuery = advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, {
        query_type: 'path_finding',
        query_text: '경로 찾기',
        parameters: {
          source_node: 'ai',
          target_node: 'deep-learning',
          max_path_length: 5,
        },
      });

      expect(pathQuery).toBeDefined();
      expect(Array.isArray(pathQuery.results)).toBe(true);

      // 추론 쿼리
      const inferenceQuery = advancedAIKnowledgeGraphSystem.executeKnowledgeQuery(graphId, {
        query_type: 'inference',
        query_text: '추론',
        parameters: {},
      });

      expect(inferenceQuery).toBeDefined();
      expect(Array.isArray(inferenceQuery.results)).toBe(true);
    });
  });
});

