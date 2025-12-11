import type { ProjectFile, LearningSession, AIInsight, FileClassification } from '../types/chat';

export class FileLearningService {
  private baseUrl = 'http://localhost:8003/api';

  // 파일 학습 시작
  async startLearning(fileIds: string[]): Promise<LearningSession> {
    try {
      const response = await fetch(`${this.baseUrl}/learning/start`, {
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
      console.error('파일 학습 시작 오류:', error);
      throw error;
    }
  }

  // 학습 세션 상태 확인
  async getLearningStatus(sessionId: string): Promise<LearningSession> {
    try {
      const response = await fetch(`${this.baseUrl}/learning/status/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('학습 상태 확인에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('학습 상태 확인 오류:', error);
      throw error;
    }
  }

  // 학습 중지
  async stopLearning(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/learning/stop/${sessionId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('학습 중지에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 중지 오류:', error);
      throw error;
    }
  }

  // 파일 분류 업데이트
  async updateFileClassification(fileId: string, classification: FileClassification): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/${fileId}/classification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classification),
      });

      if (!response.ok) {
        throw new Error('파일 분류 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 분류 업데이트 오류:', error);
      throw error;
    }
  }

  // AI 인사이트 추출
  async extractInsights(fileId: string): Promise<AIInsight[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/${fileId}/insights`);
      
      if (!response.ok) {
        throw new Error('인사이트 추출에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('인사이트 추출 오류:', error);
      throw error;
    }
  }

  // 파일 내용 추출
  async extractContent(fileId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/files/${fileId}/content`);
      
      if (!response.ok) {
        throw new Error('파일 내용 추출에 실패했습니다.');
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('파일 내용 추출 오류:', error);
      throw error;
    }
  }

  // 학습 메트릭 가져오기
  async getLearningMetrics(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/learning/metrics/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('학습 메트릭 조회에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('학습 메트릭 조회 오류:', error);
      throw error;
    }
  }

  // 파일 분류 예측
  async predictClassification(fileContent: string): Promise<FileClassification> {
    try {
      const response = await fetch(`${this.baseUrl}/learning/predict`, {
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
      console.error('분류 예측 오류:', error);
      throw error;
    }
  }

  // 학습 모델 버전 관리
  async getModelVersions(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/learning/models`);
      
      if (!response.ok) {
        throw new Error('모델 버전 조회에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('모델 버전 조회 오류:', error);
      throw error;
    }
  }

  // 학습 세션 목록 조회
  async getLearningSessions(projectId: string): Promise<LearningSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}/learning/sessions?projectId=${projectId}`);
      
      if (!response.ok) {
        throw new Error('학습 세션 조회에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('학습 세션 조회 오류:', error);
      throw error;
    }
  }

  // 파일 학습 상태 업데이트
  async updateFileLearningStatus(fileId: string, status: ProjectFile['learningStatus'], progress: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/files/${fileId}/learning-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          progress
        }),
      });

      if (!response.ok) {
        throw new Error('파일 학습 상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 학습 상태 업데이트 오류:', error);
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
        console.error('학습 진행률 모니터링 오류:', error);
        clearInterval(pollInterval);
      }
    }, 2000); // 2초마다 확인
  }
}

export const fileLearningService = new FileLearningService();
export default fileLearningService; 