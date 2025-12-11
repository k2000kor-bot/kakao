/**
 * advancedAIModelLifecycleSystem 서비스 테스트
 * 고급 AI 모델 생명주기 관리 시스템 테스트
 */

import advancedAIModelLifecycleSystem from '../advancedAIModelLifecycleSystem';
import realTimeAIAlertSystem from '../realTimeAIAlertSystem';
import aiHealthMonitor from '../aiHealthMonitor';

// 의존성 모킹
jest.mock('../realTimeAIAlertSystem', () => ({
  createAlert: jest.fn().mockResolvedValue({}),
}));

jest.mock('../aiHealthMonitor', () => ({
  reportHealth: jest.fn(),
}));

// 타이머 모킹
jest.useFakeTimers();

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('advancedAIModelLifecycleSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    // 시스템 중지
    if (advancedAIModelLifecycleSystem) {
      try {
        advancedAIModelLifecycleSystem.stop();
      } catch (e) {
        // 이미 중지된 상태일 수 있음
      }
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    jest.useRealTimers();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIModelLifecycleSystem).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIModelLifecycleSystem;
      const instance2 = advancedAIModelLifecycleSystem;
      expect(instance1).toBe(instance2);
    });
  });

  describe('start / stop', () => {
    it('시스템을 시작할 수 있어야 함', () => {
      advancedAIModelLifecycleSystem.start();
      advancedAIModelLifecycleSystem.stop();
    });

    it('시스템을 중지할 수 있어야 함', () => {
      advancedAIModelLifecycleSystem.start();
      advancedAIModelLifecycleSystem.stop();
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAIModelLifecycleSystem.start();
      advancedAIModelLifecycleSystem.start(); // 중복 호출
      advancedAIModelLifecycleSystem.stop();
    });
  });

  describe('getModels', () => {
    it('모든 모델을 조회할 수 있어야 함', () => {
      const models = advancedAIModelLifecycleSystem.getModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('모델이 올바른 구조를 가져야 함', () => {
      const models = advancedAIModelLifecycleSystem.getModels();

      if (models.length > 0) {
        const model = models[0];
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.version).toBeDefined();
        expect(model.type).toBeDefined();
        expect(model.framework).toBeDefined();
        expect(model.performance_metrics).toBeDefined();
        expect(model.deployment_config).toBeDefined();
        expect(model.lifecycle_stage).toBeDefined();
      }
    });
  });

  describe('getModel', () => {
    it('특정 모델을 조회할 수 있어야 함', () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const model = advancedAIModelLifecycleSystem.getModel(modelId);

      expect(model).toBeDefined();
      expect(model?.id).toBe(modelId);
    });

    it('존재하지 않는 모델은 null을 반환해야 함', () => {
      const model = advancedAIModelLifecycleSystem.getModel('non-existent-model');

      expect(model).toBeNull();
    });
  });

  describe('createModel', () => {
    it('새 모델을 생성할 수 있어야 함', async () => {
      const modelData = {
        name: '테스트 모델',
        version: '1.0.0',
        description: '테스트용 모델',
        type: 'nlp' as const,
        framework: 'huggingface' as const,
        size_mb: 500,
        parameters: 1000000,
        training_data: {
          id: 'dataset-1',
          name: '테스트 데이터셋',
          size: 1000000,
          format: 'json' as const,
          source: 'test',
          preprocessing_steps: [],
          validation_split: 0.1,
          test_split: 0.1,
          quality_score: 0.9,
          last_updated: new Date(),
        },
        performance_metrics: {
          accuracy: 0.9,
          precision: 0.88,
          recall: 0.87,
          f1_score: 0.875,
          auc_roc: 0.92,
          loss: 0.1,
          inference_time_ms: 50,
          throughput_rps: 100,
          memory_usage_mb: 1024,
          cpu_usage_percent: 50,
          custom_metrics: {},
        },
        deployment_config: {
          environment: 'development' as const,
          infrastructure: 'cloud' as const,
          scaling_config: {
            min_instances: 1,
            max_instances: 5,
            target_cpu_utilization: 70,
            target_memory_utilization: 80,
            scale_up_threshold: 75,
            scale_down_threshold: 30,
            cooldown_period_seconds: 300,
          },
          resource_requirements: {
            cpu_cores: 2,
            memory_gb: 4,
            storage_gb: 50,
            network_bandwidth_mbps: 500,
          },
          health_check_config: {
            endpoint: '/health',
            interval_seconds: 30,
            timeout_seconds: 5,
            healthy_threshold: 2,
            unhealthy_threshold: 3,
            grace_period_seconds: 60,
          },
          rollback_config: {
            enabled: true,
            trigger_conditions: [],
            rollback_strategy: 'immediate' as const,
            rollback_timeout_seconds: 300,
            preserve_traffic_percentage: 0,
          },
          monitoring_config: {
            metrics_enabled: true,
            logging_level: 'info' as const,
            custom_metrics: [],
            alert_thresholds: {},
            dashboard_enabled: true,
          },
        },
        lifecycle_stage: 'development' as const,
        created_by: 'test-user',
        tags: ['test'],
        metadata: {},
      };

      const model = await advancedAIModelLifecycleSystem.createModel(modelData);

      expect(model).toBeDefined();
      expect(model.id).toBeDefined();
      expect(model.name).toBe(modelData.name);
      expect(model.created_date).toBeInstanceOf(Date);
      expect(model.last_updated).toBeInstanceOf(Date);

      // 모델이 저장되었는지 확인
      const retrievedModel = advancedAIModelLifecycleSystem.getModel(model.id);
      expect(retrievedModel).toBeDefined();
      expect(retrievedModel?.id).toBe(model.id);
    });
  });

  describe('createModelVersion', () => {
    it('모델 버전을 생성할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const version = await advancedAIModelLifecycleSystem.createModelVersion(modelId, {
        version: '2.0.0',
        changes: ['새로운 기능 추가'],
        created_by: 'test-user',
        approval_status: 'pending',
      });

      expect(version).toBeDefined();
      expect(version.id).toBeDefined();
      expect(version.model_id).toBe(modelId);
      expect(version.version).toBe('2.0.0');
      expect(version.created_date).toBeInstanceOf(Date);

      // 버전이 저장되었는지 확인
      const versions = advancedAIModelLifecycleSystem.getModelVersions(modelId);
      expect(versions.length).toBeGreaterThan(0);
    });

    it('존재하지 않는 모델에 버전을 생성하면 에러를 발생시켜야 함', async () => {
      await expect(
        advancedAIModelLifecycleSystem.createModelVersion('non-existent-model', {
          version: '1.0.0',
          changes: [],
          created_by: 'test-user',
        })
      ).rejects.toThrow();
    });
  });

  describe('getModelVersions', () => {
    it('모델 버전 목록을 조회할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      // 버전 생성
      await advancedAIModelLifecycleSystem.createModelVersion(modelId, {
        version: '1.1.0',
        changes: ['버그 수정'],
        created_by: 'test-user',
      });

      const versions = advancedAIModelLifecycleSystem.getModelVersions(modelId);

      expect(Array.isArray(versions)).toBe(true);
    });
  });

  describe('startTraining', () => {
    it('모델 훈련을 시작할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const trainingConfig = {
        algorithm: 'adam',
        hyperparameters: {
          epochs: 10,
          learning_rate: 0.001,
          batch_size: 32,
        },
        optimization_strategy: 'grid_search' as const,
        early_stopping: true,
        checkpoint_frequency: 5,
        validation_frequency: 2,
        distributed_training: false,
        gpu_enabled: true,
      };

      const trainingJob = await advancedAIModelLifecycleSystem.startTraining(
        modelId,
        trainingConfig,
        'dataset-1'
      );

      expect(trainingJob).toBeDefined();
      expect(trainingJob.id).toBeDefined();
      expect(trainingJob.model_id).toBe(modelId);
      expect(trainingJob.dataset_id).toBe('dataset-1');
      expect(trainingJob.status).toBe('running');
      expect(trainingJob.progress_percentage).toBeGreaterThanOrEqual(0);

      // 훈련 작업이 저장되었는지 확인
      const retrievedJob = advancedAIModelLifecycleSystem.getTrainingJob(trainingJob.id);
      expect(retrievedJob).toBeDefined();
      expect(retrievedJob?.id).toBe(trainingJob.id);
    });

    it('존재하지 않는 모델에 훈련을 시작하면 에러를 발생시켜야 함', async () => {
      const trainingConfig = {
        algorithm: 'adam',
        hyperparameters: { epochs: 10 },
        optimization_strategy: 'grid_search' as const,
        early_stopping: false,
        checkpoint_frequency: 5,
        validation_frequency: 2,
        distributed_training: false,
        gpu_enabled: false,
      };

      await expect(
        advancedAIModelLifecycleSystem.startTraining('non-existent-model', trainingConfig, 'dataset-1')
      ).rejects.toThrow();
    });
  });

  describe('getTrainingJobs', () => {
    it('모든 훈련 작업을 조회할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const trainingConfig = {
        algorithm: 'adam',
        hyperparameters: { epochs: 5 },
        optimization_strategy: 'grid_search' as const,
        early_stopping: false,
        checkpoint_frequency: 5,
        validation_frequency: 2,
        distributed_training: false,
        gpu_enabled: false,
      };

      await advancedAIModelLifecycleSystem.startTraining(modelId, trainingConfig, 'dataset-1');

      const jobs = advancedAIModelLifecycleSystem.getTrainingJobs();

      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
    });
  });

  describe('getTrainingJob', () => {
    it('특정 훈련 작업을 조회할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const trainingConfig = {
        algorithm: 'adam',
        hyperparameters: { epochs: 5 },
        optimization_strategy: 'grid_search' as const,
        early_stopping: false,
        checkpoint_frequency: 5,
        validation_frequency: 2,
        distributed_training: false,
        gpu_enabled: false,
      };

      const trainingJob = await advancedAIModelLifecycleSystem.startTraining(
        modelId,
        trainingConfig,
        'dataset-1'
      );

      const retrievedJob = advancedAIModelLifecycleSystem.getTrainingJob(trainingJob.id);

      expect(retrievedJob).toBeDefined();
      expect(retrievedJob?.id).toBe(trainingJob.id);
    });

    it('존재하지 않는 훈련 작업은 null을 반환해야 함', () => {
      const job = advancedAIModelLifecycleSystem.getTrainingJob('non-existent-job');

      expect(job).toBeNull();
    });
  });

  describe('deployModel', () => {
    it('모델을 배포할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      // 버전 생성 및 승인
      const version = await advancedAIModelLifecycleSystem.createModelVersion(modelId, {
        version: '1.0.0',
        changes: ['초기 배포'],
        created_by: 'test-user',
        approval_status: 'approved',
      });

      const deployment = await advancedAIModelLifecycleSystem.deployModel(
        modelId,
        version.id,
        'production',
        'rolling'
      );

      expect(deployment).toBeDefined();
      expect(deployment.id).toBeDefined();
      expect(deployment.model_id).toBe(modelId);
      expect(deployment.version_id).toBe(version.id);
      expect(deployment.environment).toBe('production');
      expect(deployment.status).toBe('deploying');

      // 배포가 저장되었는지 확인
      const retrievedDeployment = advancedAIModelLifecycleSystem.getDeployment(deployment.id);
      expect(retrievedDeployment).toBeDefined();
      expect(retrievedDeployment?.id).toBe(deployment.id);
    });

    it('승인되지 않은 버전은 배포할 수 없어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      // 승인되지 않은 버전 생성
      const version = await advancedAIModelLifecycleSystem.createModelVersion(modelId, {
        version: '1.0.0',
        changes: ['초기 배포'],
        created_by: 'test-user',
        approval_status: 'pending',
      });

      await expect(
        advancedAIModelLifecycleSystem.deployModel(modelId, version.id, 'production')
      ).rejects.toThrow();
    });

    it('존재하지 않는 모델을 배포하면 에러를 발생시켜야 함', async () => {
      await expect(
        advancedAIModelLifecycleSystem.deployModel('non-existent-model', 'version-1', 'production')
      ).rejects.toThrow();
    });
  });

  describe('getDeployments', () => {
    it('모든 배포를 조회할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const version = await advancedAIModelLifecycleSystem.createModelVersion(modelId, {
        version: '1.0.0',
        changes: ['초기 배포'],
        created_by: 'test-user',
        approval_status: 'approved',
      });

      await advancedAIModelLifecycleSystem.deployModel(modelId, version.id, 'staging');

      const deployments = advancedAIModelLifecycleSystem.getDeployments();

      expect(Array.isArray(deployments)).toBe(true);
      expect(deployments.length).toBeGreaterThan(0);
    });
  });

  describe('getDeployment', () => {
    it('특정 배포를 조회할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const version = await advancedAIModelLifecycleSystem.createModelVersion(modelId, {
        version: '1.0.0',
        changes: ['초기 배포'],
        created_by: 'test-user',
        approval_status: 'approved',
      });

      const deployment = await advancedAIModelLifecycleSystem.deployModel(
        modelId,
        version.id,
        'staging'
      );

      const retrievedDeployment = advancedAIModelLifecycleSystem.getDeployment(deployment.id);

      expect(retrievedDeployment).toBeDefined();
      expect(retrievedDeployment?.id).toBe(deployment.id);
    });

    it('존재하지 않는 배포는 null을 반환해야 함', () => {
      const deployment = advancedAIModelLifecycleSystem.getDeployment('non-existent-deployment');

      expect(deployment).toBeNull();
    });
  });

  describe('monitorModelPerformance', () => {
    it('모델 성능을 모니터링할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const version = await advancedAIModelLifecycleSystem.createModelVersion(modelId, {
        version: '1.0.0',
        changes: ['초기 배포'],
        created_by: 'test-user',
        approval_status: 'approved',
      });

      const deployment = await advancedAIModelLifecycleSystem.deployModel(
        modelId,
        version.id,
        'production'
      );

      // 배포 완료 대기 (시뮬레이션)
      jest.advanceTimersByTime(6000);

      const metrics = await advancedAIModelLifecycleSystem.monitorModelPerformance(deployment.id);

      expect(metrics).toBeDefined();
      expect(typeof metrics.accuracy).toBe('number');
      expect(typeof metrics.precision).toBe('number');
      expect(typeof metrics.recall).toBe('number');
      expect(typeof metrics.f1_score).toBe('number');
      expect(typeof metrics.inference_time_ms).toBe('number');
      expect(typeof metrics.throughput_rps).toBe('number');
    });

    it('존재하지 않는 배포의 성능을 모니터링하면 에러를 발생시켜야 함', async () => {
      await expect(
        advancedAIModelLifecycleSystem.monitorModelPerformance('non-existent-deployment')
      ).rejects.toThrow();
    });
  });

  describe('optimizeModel', () => {
    it('모델을 최적화할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const result = await advancedAIModelLifecycleSystem.optimizeModel(modelId);

      expect(result).toBeDefined();
      expect(result.optimized_model).toBeDefined();
      expect(result.optimized_model.id).toBeDefined();
      expect(result.optimization_report).toBeDefined();
      expect(result.optimization_report.model_id).toBe(modelId);
      expect(result.optimization_report.optimization_date).toBeInstanceOf(Date);
    });

    it('존재하지 않는 모델을 최적화하면 에러를 발생시켜야 함', async () => {
      await expect(
        advancedAIModelLifecycleSystem.optimizeModel('non-existent-model')
      ).rejects.toThrow();
    });
  });

  describe('rollbackDeployment', () => {
    it('배포를 롤백할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      const version = await advancedAIModelLifecycleSystem.createModelVersion(modelId, {
        version: '1.0.0',
        changes: ['초기 배포'],
        created_by: 'test-user',
        approval_status: 'approved',
      });

      const deployment = await advancedAIModelLifecycleSystem.deployModel(
        modelId,
        version.id,
        'production'
      );

      // 배포 완료 대기
      jest.advanceTimersByTime(6000);

      // 롤백 시작 (비동기 작업)
      const rollbackPromise = advancedAIModelLifecycleSystem.rollbackDeployment(
        deployment.id,
        '성능 저하'
      );

      // 롤백 완료 대기 (3초)
      jest.advanceTimersByTime(4000);
      await rollbackPromise;

      const updatedDeployment = advancedAIModelLifecycleSystem.getDeployment(deployment.id);
      expect(updatedDeployment).toBeDefined();
      expect(updatedDeployment?.status).toBe('rolled_back');

      expect(realTimeAIAlertSystem.createAlert).toHaveBeenCalled();
    });

    it('존재하지 않는 배포를 롤백하면 에러를 발생시켜야 함', async () => {
      await expect(
        advancedAIModelLifecycleSystem.rollbackDeployment('non-existent-deployment', '테스트')
      ).rejects.toThrow();
    });
  });

  describe('collectLifecycleMetrics', () => {
    it('생명주기 메트릭을 수집할 수 있어야 함', async () => {
      const metrics = await advancedAIModelLifecycleSystem.collectLifecycleMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_models).toBe('number');
      expect(metrics.models_by_stage).toBeDefined();
      expect(typeof metrics.active_training_jobs).toBe('number');
      expect(typeof metrics.active_deployments).toBe('number');
      expect(typeof metrics.average_training_time_hours).toBe('number');
      expect(typeof metrics.success_rate_training).toBe('number');
      expect(typeof metrics.success_rate_deployment).toBe('number');
      expect(Array.isArray(metrics.model_performance_trends)).toBe(true);
      expect(metrics.resource_utilization).toBeDefined();
      expect(metrics.cost_metrics).toBeDefined();
    });
  });

  describe('getLifecycleMetrics', () => {
    it('저장된 생명주기 메트릭을 조회할 수 있어야 함', async () => {
      await advancedAIModelLifecycleSystem.collectLifecycleMetrics();

      const metrics = advancedAIModelLifecycleSystem.getLifecycleMetrics();

      expect(metrics).toBeDefined();
    });
  });

  describe('shutdown', () => {
    it('시스템을 종료할 수 있어야 함', () => {
      advancedAIModelLifecycleSystem.start();
      advancedAIModelLifecycleSystem.shutdown();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 분석을 위한 NLP 모델을 생성하고 배포할 수 있어야 함', async () => {
      // 모델 생성
      const model = await advancedAIModelLifecycleSystem.createModel({
        name: '재개발 프로젝트 분석 모델',
        version: '1.0.0',
        description: '재개발 프로젝트 문서 분석 및 인사이트 생성',
        type: 'nlp',
        framework: 'huggingface',
        size_mb: 800,
        parameters: 150000000,
        training_data: {
          id: 'dataset-redevelopment',
          name: '재개발 프로젝트 데이터셋',
          size: 10000000,
          format: 'json',
          source: 'internal',
          preprocessing_steps: ['tokenization', 'normalization'],
          validation_split: 0.1,
          test_split: 0.1,
          quality_score: 0.93,
          last_updated: new Date(),
        },
        performance_metrics: {
          accuracy: 0.92,
          precision: 0.90,
          recall: 0.91,
          f1_score: 0.905,
          auc_roc: 0.94,
          loss: 0.09,
          inference_time_ms: 40,
          throughput_rps: 120,
          memory_usage_mb: 1800,
          cpu_usage_percent: 45,
          custom_metrics: {},
        },
        deployment_config: {
          environment: 'production',
          infrastructure: 'cloud',
          scaling_config: {
            min_instances: 2,
            max_instances: 8,
            target_cpu_utilization: 70,
            target_memory_utilization: 80,
            scale_up_threshold: 75,
            scale_down_threshold: 30,
            cooldown_period_seconds: 300,
          },
          resource_requirements: {
            cpu_cores: 4,
            memory_gb: 8,
            storage_gb: 100,
            network_bandwidth_mbps: 1000,
          },
          health_check_config: {
            endpoint: '/health',
            interval_seconds: 30,
            timeout_seconds: 5,
            healthy_threshold: 2,
            unhealthy_threshold: 3,
            grace_period_seconds: 60,
          },
          rollback_config: {
            enabled: true,
            trigger_conditions: ['error_rate > 5%'],
            rollback_strategy: 'immediate',
            rollback_timeout_seconds: 300,
            preserve_traffic_percentage: 0,
          },
          monitoring_config: {
            metrics_enabled: true,
            logging_level: 'info',
            custom_metrics: [],
            alert_thresholds: {},
            dashboard_enabled: true,
          },
        },
        lifecycle_stage: 'production',
        created_by: 'ai-team',
        tags: ['nlp', 'redevelopment', 'analysis'],
        metadata: {},
      });

      expect(model).toBeDefined();
      expect(model.name).toBe('재개발 프로젝트 분석 모델');

      // 버전 생성 및 배포
      const version = await advancedAIModelLifecycleSystem.createModelVersion(model.id, {
        version: '1.1.0',
        changes: ['성능 개선', '새로운 분석 기능 추가'],
        created_by: 'ai-team',
        approval_status: 'approved',
      });

      const deployment = await advancedAIModelLifecycleSystem.deployModel(
        model.id,
        version.id,
        'production',
        'canary'
      );

      expect(deployment).toBeDefined();
      expect(deployment.environment).toBe('production');
    });

    it('모델 훈련부터 배포까지 전체 생명주기를 관리할 수 있어야 함', async () => {
      const models = advancedAIModelLifecycleSystem.getModels();
      const modelId = models[0].id;

      // 1. 버전 생성
      const version = await advancedAIModelLifecycleSystem.createModelVersion(modelId, {
        version: '2.0.0',
        changes: ['대규모 업데이트'],
        created_by: 'dev-team',
        approval_status: 'approved',
      });

      // 2. 훈련 시작
      const trainingJob = await advancedAIModelLifecycleSystem.startTraining(
        modelId,
        {
          algorithm: 'adam',
          hyperparameters: { epochs: 20, learning_rate: 0.001 },
          optimization_strategy: 'bayesian',
          early_stopping: true,
          checkpoint_frequency: 5,
          validation_frequency: 2,
          distributed_training: true,
          gpu_enabled: true,
        },
        'dataset-v2'
      );

      expect(trainingJob.status).toBe('running');

      // 3. 배포
      const deployment = await advancedAIModelLifecycleSystem.deployModel(
        modelId,
        version.id,
        'staging',
        'rolling'
      );

      expect(deployment).toBeDefined();

      // 4. 성능 모니터링
      jest.advanceTimersByTime(6000);
      const metrics = await advancedAIModelLifecycleSystem.monitorModelPerformance(deployment.id);

      expect(metrics).toBeDefined();
      expect(typeof metrics.accuracy).toBe('number');

      // 5. 메트릭 수집
      const lifecycleMetrics = await advancedAIModelLifecycleSystem.collectLifecycleMetrics();

      expect(lifecycleMetrics).toBeDefined();
      expect(lifecycleMetrics.total_models).toBeGreaterThan(0);
    });
  });
});

