/**
 * 궁극의 통합 응답 시스템 서비스
 * 모든 개발된 AI 기능을 통합하여 고신뢰도 답변을 생성
 */

export interface UltimateRequest {
  user_input: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
  project_context?: {
    project_id: string;
    name: string;
    description?: string;
    [key: string]: any;
  };
  user_preferences?: {
    quality?: 'basic' | 'standard' | 'advanced' | 'expert' | 'ultimate';
    detail_level?: 'low' | 'medium' | 'high';
    response_style?: 'conversational' | 'formal' | 'technical' | 'creative';
    [key: string]: any;
  };
}

export interface UltimateResponse {
  success: boolean;
  result?: {
    content: string;
    confidence: number;
    quality_score: number;
    reasoning: string;
    improvements: string[];
    metadata: {
      request_id: string;
      processing_time: number;
      stages_completed: string[];
      system_capabilities_used: string[];
      quality_target: string;
      confidence_threshold: number;
    };
    processing_time: number;
    stages_completed: string[];
  };
  system_status?: {
    system_name: string;
    version: string;
    status: string;
    capabilities: Record<string, any>;
    performance_metrics: Record<string, any>;
    processing_history_count: number;
  };
  error?: string;
}

export interface ProcessingStage {
  stage: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  start_time?: number;
  end_time?: number;
  duration?: number;
}

export interface ProcessingProgress {
  current_stage: string;
  completed_stages: string[];
  total_stages: string[];
  progress_percentage: number;
  estimated_time_remaining?: number;
}

class UltimateResponseService {
  private baseUrl = 'http://localhost:8003';
  private processingCallbacks: Map<string, (progress: ProcessingProgress) => void> = new Map();

  /**
   * 궁극의 통합 응답 시스템을 통한 메시지 처리
   */
  async processUltimateRequest(request: UltimateRequest): Promise<UltimateResponse> {
    try {
      console.log('🚀 궁극 응답 시스템 요청 시작:', request.user_input);

      const response = await fetch(`${this.baseUrl}/api/ultimate/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UltimateResponse = await response.json();

      if (result.success) {
        console.log('✅ 궁극 응답 시스템 처리 성공:', {
          confidence: result.result?.confidence,
          quality_score: result.result?.quality_score,
          processing_time: result.result?.processing_time
        });
      } else {
        console.error('❌ 궁극 응답 시스템 처리 실패:', result.error);
      }

      return result;
    } catch (error) {
      console.error('궁극 응답 시스템 요청 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 궁극의 통합 응답 시스템 상태 확인
   */
  async getUltimateSystemStatus(): Promise<{
    success: boolean;
    status?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ultimate/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('시스템 상태 확인 중 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '상태 확인 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 실시간 처리 진행 상황 모니터링
   */
  async monitorProcessingProgress(requestId: string, callback: (progress: ProcessingProgress) => void): Promise<void> {
    this.processingCallbacks.set(requestId, callback);

    // 시뮬레이션된 진행 상황 업데이트
    const stages = [
      'initial_analysis',
      'context_enhancement', 
      'multi_model_generation',
      'quality_refinement',
      'confidence_validation',
      'final_integration'
    ];

    let currentStageIndex = 0;

    const updateProgress = () => {
      if (currentStageIndex < stages.length) {
        const progress: ProcessingProgress = {
          current_stage: stages[currentStageIndex],
          completed_stages: stages.slice(0, currentStageIndex),
          total_stages: stages,
          progress_percentage: Math.round(((currentStageIndex + 1) / stages.length) * 100),
          estimated_time_remaining: (stages.length - currentStageIndex - 1) * 0.5
        };

        callback(progress);
        currentStageIndex++;

        if (currentStageIndex < stages.length) {
          setTimeout(updateProgress, 500); // 0.5초마다 업데이트
        }
      }
    };

    updateProgress();
  }

  /**
   * 고급 분석 요청 처리
   */
  async processAdvancedAnalysis(
    text: string,
    analysisType: 'sentiment' | 'intent' | 'complexity' | 'domain' | 'comprehensive'
  ): Promise<UltimateResponse> {
    const request: UltimateRequest = {
      user_input: `다음 텍스트에 대한 ${analysisType} 분석을 수행해주세요: ${text}`,
      user_preferences: {
        quality: 'expert',
        detail_level: 'high',
        response_style: 'technical'
      }
    };

    return this.processUltimateRequest(request);
  }

  /**
   * 창의적 글쓰기 요청 처리
   */
  async processCreativeWriting(
    prompt: string,
    style: 'essay' | 'story' | 'poem' | 'article' | 'script'
  ): Promise<UltimateResponse> {
    const request: UltimateRequest = {
      user_input: `${style} 스타일로 다음 주제에 대한 창의적인 글을 작성해주세요: ${prompt}`,
      user_preferences: {
        quality: 'ultimate',
        detail_level: 'high',
        response_style: 'creative'
      }
    };

    return this.processUltimateRequest(request);
  }

  /**
   * 기술적 분석 요청 처리
   */
  async processTechnicalAnalysis(
    topic: string,
    analysisDepth: 'basic' | 'intermediate' | 'advanced' | 'expert'
  ): Promise<UltimateResponse> {
    const request: UltimateRequest = {
      user_input: `${topic}에 대한 ${analysisDepth} 수준의 기술적 분석을 제공해주세요.`,
      user_preferences: {
        quality: 'expert',
        detail_level: 'high',
        response_style: 'technical'
      }
    };

    return this.processUltimateRequest(request);
  }

  /**
   * 대화형 질의응답 처리
   */
  async processConversationalQA(
    question: string,
    context?: string
  ): Promise<UltimateResponse> {
    const request: UltimateRequest = {
      user_input: context ? `${context}\n\n질문: ${question}` : question,
      user_preferences: {
        quality: 'advanced',
        detail_level: 'medium',
        response_style: 'conversational'
      }
    };

    return this.processUltimateRequest(request);
  }

  /**
   * 프로젝트 컨텍스트 기반 응답 처리
   */
  async processProjectContextRequest(
    userInput: string,
    projectContext: {
      project_id: string;
      name: string;
      description?: string;
      [key: string]: any;
    }
  ): Promise<UltimateResponse> {
    const request: UltimateRequest = {
      user_input: userInput,
      project_context: projectContext,
      user_preferences: {
        quality: 'expert',
        detail_level: 'high',
        response_style: 'technical'
      }
    };

    return this.processUltimateRequest(request);
  }

  /**
   * 응답 품질 평가
   */
  evaluateResponseQuality(response: UltimateResponse): {
    overall_score: number;
    confidence_score: number;
    quality_score: number;
    processing_efficiency: number;
    recommendations: string[];
  } {
    if (!response.success || !response.result) {
      return {
        overall_score: 0,
        confidence_score: 0,
        quality_score: 0,
        processing_efficiency: 0,
        recommendations: ['응답 생성에 실패했습니다.']
      };
    }

    const { result } = response;
    
    // 신뢰도 점수 (0-100)
    const confidence_score = Math.round(result.confidence * 100);
    
    // 품질 점수 (0-100)
    const quality_score = Math.round(result.quality_score * 100);
    
    // 처리 효율성 (빠를수록 높은 점수)
    const processing_efficiency = Math.max(0, 100 - Math.round(result.processing_time * 10));
    
    // 종합 점수
    const overall_score = Math.round(
      (confidence_score * 0.4 + quality_score * 0.4 + processing_efficiency * 0.2)
    );

    // 개선 권장사항
    const recommendations: string[] = [];
    
    if (confidence_score < 80) {
      recommendations.push('신뢰도 향상을 위해 더 구체적인 질문을 해주세요.');
    }
    
    if (quality_score < 80) {
      recommendations.push('응답 품질 개선을 위해 컨텍스트를 더 제공해주세요.');
    }
    
    if (processing_efficiency < 70) {
      recommendations.push('처리 시간이 길어졌습니다. 더 간단한 질문을 시도해보세요.');
    }

    if (result.improvements && result.improvements.length > 0) {
      recommendations.push(...result.improvements);
    }

    return {
      overall_score,
      confidence_score,
      quality_score,
      processing_efficiency,
      recommendations
    };
  }

  /**
   * 시스템 성능 통계
   */
  async getSystemPerformanceStats(): Promise<{
    total_requests: number;
    success_rate: number;
    average_confidence: number;
    average_quality: number;
    average_processing_time: number;
    system_health: 'excellent' | 'good' | 'fair' | 'poor';
  }> {
    try {
      const status = await this.getUltimateSystemStatus();
      
      if (!status.success) {
        throw new Error('시스템 상태 확인 실패');
      }

      // 실제 구현에서는 데이터베이스에서 통계를 가져와야 함
      const stats = {
        total_requests: status.status?.processing_history_count || 0,
        success_rate: 95.5, // 예시 값
        average_confidence: 87.3,
        average_quality: 89.1,
        average_processing_time: 2.3,
        system_health: 'excellent' as const
      };

      return stats;
    } catch (error) {
      console.error('성능 통계 조회 중 오류:', error);
      return {
        total_requests: 0,
        success_rate: 0,
        average_confidence: 0,
        average_quality: 0,
        average_processing_time: 0,
        system_health: 'poor'
      };
    }
  }
}

// 싱글톤 인스턴스
export const ultimateResponseService = new UltimateResponseService();

export default ultimateResponseService;
