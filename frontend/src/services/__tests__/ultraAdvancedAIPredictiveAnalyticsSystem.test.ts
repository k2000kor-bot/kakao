/**
 * UltraAdvancedAIPredictiveAnalyticsSystem 테스트
 */
import ultraAdvancedAIPredictiveAnalyticsSystem from '../ultraAdvancedAIPredictiveAnalyticsSystem';
import type { PredictiveModel } from '../ultraAdvancedAIPredictiveAnalyticsSystem';

const minimalModel: PredictiveModel = {
  id: 'model-test',
  name: '테스트 모델',
  type: 'regression',
  status: 'ready',
  accuracy: 0.9,
  precision: 0.88,
  recall: 0.87,
  f1_score: 0.875,
  created_at: new Date(),
  updated_at: new Date(),
  version: '1.0',
  parameters: {},
  features: ['f1'],
  target_variable: 'target',
  training_data_size: 1000,
  validation_data_size: 200,
  metadata: {
    description: '테스트',
    author: 'test',
    tags: [],
    performance_history: []
  }
};

describe('UltraAdvancedAIPredictiveAnalyticsSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getInitializationStatus', () => {
    it('초기화 완료 시 true', () => {
      expect(ultraAdvancedAIPredictiveAnalyticsSystem.getInitializationStatus()).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('설정 반환', () => {
      const config = ultraAdvancedAIPredictiveAnalyticsSystem.getConfig();
      expect(config).toBeDefined();
      expect(config.auto_retraining).toBe(true);
    });
  });

  describe('updateConfig', () => {
    it('설정 업데이트', () => {
      ultraAdvancedAIPredictiveAnalyticsSystem.updateConfig({ auto_retraining: false });
      const config = ultraAdvancedAIPredictiveAnalyticsSystem.getConfig();
      expect(config.auto_retraining).toBe(false);
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = ultraAdvancedAIPredictiveAnalyticsSystem.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.total_models).toBe('number');
    });
  });

  describe('createModel / getModels / getModel', () => {
    it('모델 생성 및 조회', async () => {
      await ultraAdvancedAIPredictiveAnalyticsSystem.createModel(minimalModel);

      const model = ultraAdvancedAIPredictiveAnalyticsSystem.getModel('model-test');
      expect(model).toBeDefined();
      expect(model?.name).toBe('테스트 모델');
    });
  });

  describe('updateModel', () => {
    it('모델 업데이트', async () => {
      await ultraAdvancedAIPredictiveAnalyticsSystem.createModel({
        ...minimalModel,
        id: 'model-update'
      });

      await ultraAdvancedAIPredictiveAnalyticsSystem.updateModel('model-update', { name: '업데이트됨' });

      const model = ultraAdvancedAIPredictiveAnalyticsSystem.getModel('model-update');
      expect(model?.name).toBe('업데이트됨');
    });

    it('존재하지 않는 모델 시 에러', async () => {
      await expect(
        ultraAdvancedAIPredictiveAnalyticsSystem.updateModel('nonexistent', {})
      ).rejects.toThrow('찾을 수 없습니다');
    });
  });

  describe('deployModel', () => {
    it('모델 배포', async () => {
      await ultraAdvancedAIPredictiveAnalyticsSystem.createModel({
        ...minimalModel,
        id: 'model-deploy',
        status: 'ready'
      });

      await ultraAdvancedAIPredictiveAnalyticsSystem.deployModel('model-deploy');

      const model = ultraAdvancedAIPredictiveAnalyticsSystem.getModel('model-deploy');
      expect(model?.status).toBe('deployed');
    });
  });

  describe('makePrediction', () => {
    it('예측 수행', async () => {
      await ultraAdvancedAIPredictiveAnalyticsSystem.createModel({
        ...minimalModel,
        id: 'model-predict',
        status: 'deployed'
      });

      const result = await ultraAdvancedAIPredictiveAnalyticsSystem.makePrediction(
        'model-predict',
        { x: 1 }
      );

      expect(result).toBeDefined();
      expect(result.model_id).toBe('model-predict');
      expect(result.status).toBe('completed');
    }, 10000);

    it('존재하지 않는 모델 시 에러', async () => {
      await expect(
        ultraAdvancedAIPredictiveAnalyticsSystem.makePrediction('nonexistent', {})
      ).rejects.toThrow('찾을 수 없습니다');
    });
  });

  describe('getPredictions', () => {
    it('예측 목록 반환', () => {
      const predictions = ultraAdvancedAIPredictiveAnalyticsSystem.getPredictions(10);
      expect(Array.isArray(predictions)).toBe(true);
    });
  });

  describe('deleteModel', () => {
    it('존재하지 않는 모델 삭제 시 에러', async () => {
      await expect(
        ultraAdvancedAIPredictiveAnalyticsSystem.deleteModel('nonexistent')
      ).rejects.toThrow('찾을 수 없습니다');
    });
  });
});
