// axios 모킹을 먼저 설정
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
    get: jest.fn(),
  },
}));

import axios from 'axios';
import integratedSystemAPI, { IntegratedSystemAPI, APIResponse, SystemStatus } from '../integratedSystemAPI';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAxiosCreate = axios.create as jest.MockedFunction<typeof axios.create>;

describe('IntegratedSystemAPI', () => {
  let api: IntegratedSystemAPI;
  let mockApiInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // axios.create 모킹
    mockApiInstance = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxiosCreate.mockReturnValue(mockApiInstance as any);
    api = new IntegratedSystemAPI();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(integratedSystemAPI).toBeDefined();
      expect(integratedSystemAPI).toBeInstanceOf(IntegratedSystemAPI);
    });

    it('새 인스턴스 생성', () => {
      expect(api).toBeInstanceOf(IntegratedSystemAPI);
    });

    it('인터셉터가 설정되어야 함', () => {
      expect(mockApiInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockApiInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('checkSystemHealth', () => {
    it('모든 서비스가 정상일 때 healthy 상태를 반환해야 함', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200 });

      const result = await api.checkSystemHealth();

      expect(result.status).toBe('healthy');
      expect(result.services).toBeDefined();
      expect(result.version).toBe('1.0.0');
      expect(result.uptime).toBeGreaterThan(0);
    });

    it('일부 서비스가 실패하면 degraded 상태를 반환해야 함', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ status: 200 })
        .mockRejectedValueOnce(new Error('Service down'))
        .mockResolvedValueOnce({ status: 200 })
        .mockResolvedValueOnce({ status: 200 });

      const result = await api.checkSystemHealth();

      expect(result.status).toBe('degraded');
      expect(Object.values(result.services).some(s => s.status === 'down')).toBe(true);
    });

    it('서비스 상태 정보를 포함해야 함', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200 });

      const result = await api.checkSystemHealth();

      expect(result.services.main).toBeDefined();
      expect(result.services.ai).toBeDefined();
      expect(result.services.unified).toBeDefined();
      expect(result.services.ultimate).toBeDefined();
    });
  });

  describe('sendMessage', () => {
    it('메시지를 성공적으로 전송해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { message: '응답' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const result = await api.sendMessage('테스트 메시지');

      expect(mockApiInstance.post).toHaveBeenCalledWith('/api/chat', {
        message: '테스트 메시지',
        context: undefined,
      });
      expect(result.success).toBe(true);
    });

    it('컨텍스트를 포함하여 메시지를 전송해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { message: '응답' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const context = { project_id: 'test' };
      await api.sendMessage('테스트 메시지', context);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/api/chat', {
        message: '테스트 메시지',
        context,
      });
    });

    it('전송 실패 시 에러를 반환해야 함', async () => {
      mockApiInstance.post.mockRejectedValue(new Error('Network error'));

      const result = await api.sendMessage('테스트 메시지');

      expect(result.success).toBe(false);
      expect(result.error).toBe('메시지 전송에 실패했습니다.');
    });
  });

  describe('analyzeEmotion', () => {
    it('감정 분석을 성공적으로 수행해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { emotion: 'happy' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const result = await api.analyzeEmotion('기쁜 내용');

      expect(mockApiInstance.post).toHaveBeenCalledWith('/api/emotion-recognition/analyze', {
        content: '기쁜 내용',
        type: 'text',
      });
      expect(result.success).toBe(true);
    });

    it('타입을 지정하여 감정 분석을 수행해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { emotion: 'sad' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      await api.analyzeEmotion('슬픈 내용', 'audio');

      expect(mockApiInstance.post).toHaveBeenCalledWith('/api/emotion-recognition/analyze', {
        content: '슬픈 내용',
        type: 'audio',
      });
    });

    it('분석 실패 시 에러를 반환해야 함', async () => {
      mockApiInstance.post.mockRejectedValue(new Error('Analysis error'));

      const result = await api.analyzeEmotion('내용');

      expect(result.success).toBe(false);
      expect(result.error).toBe('감정 분석에 실패했습니다.');
    });
  });

  describe('데이터 소스 관리', () => {
    it('데이터 소스 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'Source 1' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getDataSources();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/data-analytics/sources');
      expect(result.success).toBe(true);
    });

    it('데이터 소스를 생성해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', name: 'New Source' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const sourceData = { name: 'New Source', type: 'database' };
      const result = await api.createDataSource(sourceData);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/api/data-analytics/sources', sourceData);
      expect(result.success).toBe(true);
    });

    it('데이터 소스 조회 실패 시 에러를 반환해야 함', async () => {
      mockApiInstance.get.mockRejectedValue(new Error('Fetch error'));

      const result = await api.getDataSources();

      expect(result.success).toBe(false);
      expect(result.error).toBe('데이터 소스 조회에 실패했습니다.');
    });
  });

  describe('품질 보증', () => {
    it('품질 테스트 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'Test 1' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getQualityTests();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/quality-assurance/tests');
      expect(result.success).toBe(true);
    });

    it('테스트 스위트 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'Suite 1' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getQualityTestSuites();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/quality-assurance/test-suites');
      expect(result.success).toBe(true);
    });

    it('품질 테스트를 시작해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { test_id: '123' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const result = await api.startQualityTest('suite-1');

      expect(mockApiInstance.post).toHaveBeenCalledWith('/api/quality-assurance/automated-execution', {
        test_suite_id: 'suite-1',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('성능 최적화', () => {
    it('성능 메트릭을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { cpu: 50, memory: 60 },
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getPerformanceMetrics();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/performance-optimization/metrics');
      expect(result.success).toBe(true);
    });

    it('시스템 상태를 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { status: 'healthy' },
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getSystemHealth();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/performance-optimization/health');
      expect(result.success).toBe(true);
    });
  });

  describe('종합 분석', () => {
    it('종합 분석을 수행해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { analysis: 'result' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const data = { content: '분석할 데이터' };
      const result = await api.performComprehensiveAnalysis(data);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/api/comprehensive-analysis', data);
      expect(result.success).toBe(true);
    });

    it('분석 실패 시 에러를 반환해야 함', async () => {
      mockApiInstance.post.mockRejectedValue(new Error('Analysis error'));

      const result = await api.performComprehensiveAnalysis({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('종합 분석에 실패했습니다.');
    });
  });

  describe('파일 처리', () => {
    it('파일을 업로드해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { file_id: '123' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = await api.uploadFile(file);

      expect(mockApiInstance.post).toHaveBeenCalledWith(
        '/api/file/upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result.success).toBe(true);
    });

    it('프로젝트 ID를 포함하여 파일을 업로드해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { file_id: '123' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      await api.uploadFile(file, 'project-1');

      expect(mockApiInstance.post).toHaveBeenCalled();
    });

    it('파일 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'file1.txt' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getFileList();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/files');
      expect(result.success).toBe(true);
    });
  });

  describe('프로젝트 관리', () => {
    it('프로젝트 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'Project 1' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getProjects();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/projects');
      expect(result.success).toBe(true);
    });

    it('프로젝트를 생성해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', name: 'New Project' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const projectData = { name: 'New Project', description: 'Description' };
      const result = await api.createProject(projectData);

      expect(mockApiInstance.post).toHaveBeenCalledWith('/api/projects', projectData);
      expect(result.success).toBe(true);
    });
  });

  describe('실시간 모니터링', () => {
    it('실시간 메트릭을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { metrics: {} },
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getRealTimeMetrics();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/real-time/metrics');
      expect(result.success).toBe(true);
    });
  });

  describe('시스템 설정', () => {
    it('시스템 설정을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { config: {} },
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getSystemConfig();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/system/config');
      expect(result.success).toBe(true);
    });

    it('시스템 설정을 업데이트해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { config: {} },
        },
      };

      mockApiInstance.put.mockResolvedValue(mockResponse);

      const config = { setting: 'value' };
      const result = await api.updateSystemConfig(config);

      expect(mockApiInstance.put).toHaveBeenCalledWith('/api/system/config', config);
      expect(result.success).toBe(true);
    });
  });

  describe('유틸리티 메서드', () => {
    it('서비스 상태를 조회해야 함', () => {
      const status = api.getServiceStatus('main');

      expect(status).toBeDefined();
      expect(status.status).toBeDefined();
      expect(status.lastCheck).toBeDefined();
    });

    it('존재하지 않는 서비스 상태 조회 시 unknown을 반환해야 함', () => {
      const status = api.getServiceStatus('nonexistent');

      expect(status.status).toBe('unknown');
      expect(status.lastCheck).toBe(0);
    });

    it('모든 서비스 상태를 조회해야 함', () => {
      const services = api.getAllServices();

      expect(services).toBeDefined();
      expect(services.main).toBeDefined();
      expect(services.ai).toBeDefined();
      expect(services.unified).toBeDefined();
      expect(services.ultimate).toBeDefined();
    });
  });

  describe('testConnection', () => {
    it('연결 테스트가 성공하면 true를 반환해야 함', async () => {
      mockApiInstance.get.mockResolvedValue({ status: 200 });

      const result = await api.testConnection();

      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/health');
      expect(result).toBe(true);
    });

    it('연결 테스트가 실패하면 false를 반환해야 함', async () => {
      mockApiInstance.get.mockRejectedValue(new Error('Connection failed'));

      const result = await api.testConnection();

      expect(result).toBe(false);
    });
  });
});

