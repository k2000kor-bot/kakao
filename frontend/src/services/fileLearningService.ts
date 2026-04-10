import type { ProjectFile, LearningSession, AIInsight, FileClassification } from '../types/chat';
import { errorLogger, toError } from '../utils/errorLogger';
import {
  API_BASE_URL,
  API_FILES_BASE,
  API_FILES_CONTENT_SEGMENT,
  API_FILES_INSIGHTS_SEGMENT,
  API_FILES_LEARNING_STATUS_SEGMENT,
  API_LEARNING_METRICS_PREFIX,
  API_LEARNING_MODELS_PATH,
  API_LEARNING_PREDICT_PATH,
  API_LEARNING_SESSIONS_PATH,
  API_LEARNING_START_PATH,
  API_LEARNING_STATUS_PREFIX,
  API_LEARNING_STOP_PREFIX,
  API_QUERY_PARAM_PROJECT_ID,
  joinApiHealthCheckUrl,
} from '../config/api';

export class FileLearningService {
  // 파일 학습 시작
  async startLearning(fileIds: string[]): Promise<LearningSession> {
    try {
      const response = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_LEARNING_START_PATH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds,
          modelVersion: 'v2.1.0',
          learningType: 'comprehensive'
        }),
      });

      if (!response.ok) {
        throw new Error('학습 시작에 실패했습니다.');
      }

      const session = await response.json();
      return session;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('파일 학습 시작 오류', err, {
        component: 'fileLearningService',
        action: 'startLearning',
        fileIdsCount: fileIds.length,
      });
      throw error;
    }
  }

  // 학습 세션 상태 확인
  async getLearningStatus(sessionId: string): Promise<LearningSession> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(API_BASE_URL, `${API_LEARNING_STATUS_PREFIX}/${encodeURIComponent(sessionId)}`),
      );
      
      if (!response.ok) {
        throw new Error('학습 상태 확인에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      const err = toError(error);
      errorLogger.error('학습 상태 확인 오류', err, {
        component: 'fileLearningService',
        action: 'getLearningStatus',
        sessionId,
      });
      throw error;
    }
  }

  // 학습 중지
  async stopLearning(sessionId: string): Promise<void> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(API_BASE_URL, `${API_LEARNING_STOP_PREFIX}/${encodeURIComponent(sessionId)}`),
        { method: 'POST' },
      );

      if (!response.ok) {
        throw new Error('학습 중지에 실패했습니다.');
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.error('학습 중지 오류', err, {
        component: 'fileLearningService',
        action: 'stopLearning',
        sessionId,
      });
      throw error;
    }
  }

  // 파일 분류 업데이트
  async updateFileClassification(fileId: string, classification: FileClassification): Promise<void> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(
          API_BASE_URL,
          `${API_FILES_BASE}/${encodeURIComponent(fileId)}/classification`,
        ),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(classification),
        },
      );

      if (!response.ok) {
        throw new Error('파일 분류 업데이트에 실패했습니다.');
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.error('파일 분류 업데이트 오류', err, {
        component: 'fileLearningService',
        action: 'updateFileClassification',
        fileId,
      });
      throw error;
    }
  }

  // AI 인사이트 추출
  async extractInsights(fileId: string): Promise<AIInsight[]> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(
          API_BASE_URL,
          `${API_FILES_BASE}/${encodeURIComponent(fileId)}${API_FILES_INSIGHTS_SEGMENT}`,
        ),
      );
      
      if (!response.ok) {
        throw new Error('인사이트 추출에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      const err = toError(error);
      errorLogger.error('인사이트 추출 오류', err, {
        component: 'fileLearningService',
        action: 'extractInsights',
        fileId,
      });
      throw error;
    }
  }

  // 파일 내용 추출
  async extractContent(fileId: string): Promise<string> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(
          API_BASE_URL,
          `${API_FILES_BASE}/${encodeURIComponent(fileId)}${API_FILES_CONTENT_SEGMENT}`,
        ),
      );
      
      if (!response.ok) {
        throw new Error('파일 내용 추출에 실패했습니다.');
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('파일 내용 추출 오류', err, {
        component: 'fileLearningService',
        action: 'extractContent',
        fileId,
      });
      throw error;
    }
  }

  // 학습 메트릭 가져오기
  async getLearningMetrics(sessionId: string): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(API_BASE_URL, `${API_LEARNING_METRICS_PREFIX}/${encodeURIComponent(sessionId)}`),
      );
      
      if (!response.ok) {
        throw new Error('학습 메트릭 조회에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      const err = toError(error);
      errorLogger.error('학습 메트릭 조회 오류', err, {
        component: 'fileLearningService',
        action: 'getLearningMetrics',
        sessionId,
      });
      throw error;
    }
  }

  // 파일 분류 예측
  async predictClassification(fileContent: string): Promise<FileClassification> {
    try {
      const response = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_LEARNING_PREDICT_PATH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: fileContent,
          modelVersion: 'v2.1.0'
        }),
      });

      if (!response.ok) {
        throw new Error('분류 예측에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      const err = toError(error);
      errorLogger.error('분류 예측 오류', err, {
        component: 'fileLearningService',
        action: 'predictClassification',
        contentLength: fileContent.length,
      });
      throw error;
    }
  }

  // 학습 모델 버전 관리
  async getModelVersions(): Promise<string[]> {
    try {
      const response = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_LEARNING_MODELS_PATH));
      
      if (!response.ok) {
        throw new Error('모델 버전 조회에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      const err = toError(error);
      errorLogger.error('모델 버전 조회 오류', err, {
        component: 'fileLearningService',
        action: 'getModelVersions',
      });
      throw error;
    }
  }

  // 학습 세션 목록 조회
  async getLearningSessions(projectId: string): Promise<LearningSession[]> {
    try {
      const q = new URLSearchParams({ [API_QUERY_PARAM_PROJECT_ID]: projectId }).toString();
      const response = await fetch(joinApiHealthCheckUrl(API_BASE_URL, `${API_LEARNING_SESSIONS_PATH}?${q}`));
      
      if (!response.ok) {
        throw new Error('학습 세션 조회에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      const err = toError(error);
      errorLogger.error('학습 세션 조회 오류', err, {
        component: 'fileLearningService',
        action: 'getLearningSessions',
        projectId,
      });
      throw error;
    }
  }

  // 파일 학습 상태 업데이트
  async updateFileLearningStatus(fileId: string, status: ProjectFile['learningStatus'], progress: number): Promise<void> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(
          API_BASE_URL,
          `${API_FILES_BASE}/${encodeURIComponent(fileId)}${API_FILES_LEARNING_STATUS_SEGMENT}`,
        ),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            progress
          }),
        },
      );

      if (!response.ok) {
        throw new Error('파일 학습 상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.error('파일 학습 상태 업데이트 오류', err, {
        component: 'fileLearningService',
        action: 'updateFileLearningStatus',
        fileId,
        status,
        progress,
      });
      throw error;
    }
  }

  // 실시간 학습 진행률 모니터링
  async monitorLearningProgress(sessionId: string, callback: (progress: number) => void): Promise<void> {
    const pollInterval = setInterval(async () => {
      try {
        const session = await this.getLearningStatus(sessionId);
        callback(session.progress);
        
        if (session.status === 'completed' || session.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        const err = toError(error);
        errorLogger.error('학습 진행률 모니터링 오류', err, {
          component: 'fileLearningService',
          action: 'monitorLearningProgress',
          sessionId,
        });
        clearInterval(pollInterval);
      }
    }, 2000); // 2초마다 확인
  }
}

export const fileLearningService = new FileLearningService();
export default fileLearningService; 