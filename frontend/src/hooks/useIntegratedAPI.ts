/**
 * 통합 API 사용을 위한 React Hook
 */
import { useState, useCallback } from 'react';
import { integratedAPIService } from '../services/integratedAPIService';

interface UseIntegratedAPIResult {
  // 기본 기능
  analyzeMessage: (message: string) => Promise<any>;
  getSystemStatus: () => Promise<any>;
  getMetrics: () => Promise<any>;
  getAnalytics: () => Promise<any>;

  // 창작 콘텐츠
  generateStory: (params: { genre?: string; theme?: string; length?: string }) => Promise<any>;
  generatePoem: (params: { type?: string; theme?: string }) => Promise<any>;
  generateEssay: (params: { type?: string; topic?: string }) => Promise<any>;
  analyzeWriting: (text: string) => Promise<any>;

  // 설득 콘텐츠
  generateConstructionPersuasion: (params: {
    company_name?: string;
    project_type?: string;
    persuasion_level?: string;
  }) => Promise<any>;
  generateContractorPersuasion: (params: {
    company_name?: string;
    service_type?: string;
    persuasion_level?: string;
  }) => Promise<any>;
  analyzePersuasion: (content: string) => Promise<any>;

  // 마케팅 콘텐츠
  generateSocialMediaContent: (params: {
    platform?: string;
    content_type?: string;
    industry?: string;
    company_name?: string;
    tone?: string;
  }) => Promise<any>;
  generateEmailMarketing: (params: {
    email_type?: string;
    industry?: string;
    company_name?: string;
    urgency_level?: string;
  }) => Promise<any>;
  analyzeMarketingContent: (content: string, contentType?: string) => Promise<any>;

  // 고급 분석
  getAdvancedAnalytics: (params: {
    analysis_type?: string;
    time_range?: string;
    filters?: Record<string, any>;
  }) => Promise<any>;
  getPredictions: (params: {
    prediction_type?: string;
    prediction_horizon?: string;
  }) => Promise<any>;
  getInsights: (params: {
    insight_type?: string;
    focus_area?: string;
  }) => Promise<any>;

  // AI 최적화
  optimizeAI: (params: {
    optimization_type?: string;
    target_metric?: string;
  }) => Promise<any>;
  benchmarkAI: (params: {
    benchmark_type?: string;
    test_data_size?: string;
  }) => Promise<any>;
  submitFeedback: (params: {
    feedback_type?: string;
    content?: string;
    rating?: number;
    correction?: string;
    context?: Record<string, any>;
  }) => Promise<any>;

  // 상태
  loading: boolean;
  error: Error | null;
  testConnection: () => Promise<boolean>;
}

export function useIntegratedAPI(): UseIntegratedAPIResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRequest = useCallback(async <T,>(requestFn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestFn();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 기본 기능
  const analyzeMessage = useCallback(
    (message: string) => handleRequest(() => integratedAPIService.analyzeMessage(message)),
    [handleRequest]
  );

  const getSystemStatus = useCallback(
    () => handleRequest(() => integratedAPIService.getSystemStatus()),
    [handleRequest]
  );

  const getMetrics = useCallback(
    () => handleRequest(() => integratedAPIService.getMetrics()),
    [handleRequest]
  );

  const getAnalytics = useCallback(
    () => handleRequest(() => integratedAPIService.getAnalytics()),
    [handleRequest]
  );

  // 창작 콘텐츠
  const generateStory = useCallback(
    (params: { genre?: string; theme?: string; length?: string }) =>
      handleRequest(() => integratedAPIService.generateStory(params)),
    [handleRequest]
  );

  const generatePoem = useCallback(
    (params: { type?: string; theme?: string }) =>
      handleRequest(() => integratedAPIService.generatePoem(params)),
    [handleRequest]
  );

  const generateEssay = useCallback(
    (params: { type?: string; topic?: string }) =>
      handleRequest(() => integratedAPIService.generateEssay(params)),
    [handleRequest]
  );

  const analyzeWriting = useCallback(
    (text: string) => handleRequest(() => integratedAPIService.analyzeWriting(text)),
    [handleRequest]
  );

  // 설득 콘텐츠
  const generateConstructionPersuasion = useCallback(
    (params: { company_name?: string; project_type?: string; persuasion_level?: string }) =>
      handleRequest(() => integratedAPIService.generateConstructionPersuasion(params)),
    [handleRequest]
  );

  const generateContractorPersuasion = useCallback(
    (params: { company_name?: string; service_type?: string; persuasion_level?: string }) =>
      handleRequest(() => integratedAPIService.generateContractorPersuasion(params)),
    [handleRequest]
  );

  const analyzePersuasion = useCallback(
    (content: string) => handleRequest(() => integratedAPIService.analyzePersuasion(content)),
    [handleRequest]
  );

  // 마케팅 콘텐츠
  const generateSocialMediaContent = useCallback(
    (params: {
      platform?: string;
      content_type?: string;
      industry?: string;
      company_name?: string;
      tone?: string;
    }) => handleRequest(() => integratedAPIService.generateSocialMediaContent(params)),
    [handleRequest]
  );

  const generateEmailMarketing = useCallback(
    (params: {
      email_type?: string;
      industry?: string;
      company_name?: string;
      urgency_level?: string;
    }) => handleRequest(() => integratedAPIService.generateEmailMarketing(params)),
    [handleRequest]
  );

  const analyzeMarketingContent = useCallback(
    (content: string, contentType: string = 'social') =>
      handleRequest(() => integratedAPIService.analyzeMarketingContent(content, contentType)),
    [handleRequest]
  );

  // 고급 분석
  const getAdvancedAnalytics = useCallback(
    (params: { analysis_type?: string; time_range?: string; filters?: Record<string, any> }) =>
      handleRequest(() => integratedAPIService.getAdvancedAnalytics(params)),
    [handleRequest]
  );

  const getPredictions = useCallback(
    (params: { prediction_type?: string; prediction_horizon?: string }) =>
      handleRequest(() => integratedAPIService.getPredictions(params)),
    [handleRequest]
  );

  const getInsights = useCallback(
    (params: { insight_type?: string; focus_area?: string }) =>
      handleRequest(() => integratedAPIService.getInsights(params)),
    [handleRequest]
  );

  // AI 최적화
  const optimizeAI = useCallback(
    (params: { optimization_type?: string; target_metric?: string }) =>
      handleRequest(() => integratedAPIService.optimizeAI(params)),
    [handleRequest]
  );

  const benchmarkAI = useCallback(
    (params: { benchmark_type?: string; test_data_size?: string }) =>
      handleRequest(() => integratedAPIService.benchmarkAI(params)),
    [handleRequest]
  );

  const submitFeedback = useCallback(
    (params: {
      feedback_type?: string;
      content?: string;
      rating?: number;
      correction?: string;
      context?: Record<string, any>;
    }) => handleRequest(() => integratedAPIService.submitFeedback(params)),
    [handleRequest]
  );

  const testConnection = useCallback(
    () => integratedAPIService.testConnection(),
    []
  );

  return {
    // 기본 기능
    analyzeMessage,
    getSystemStatus,
    getMetrics,
    getAnalytics,

    // 창작 콘텐츠
    generateStory,
    generatePoem,
    generateEssay,
    analyzeWriting,

    // 설득 콘텐츠
    generateConstructionPersuasion,
    generateContractorPersuasion,
    analyzePersuasion,

    // 마케팅 콘텐츠
    generateSocialMediaContent,
    generateEmailMarketing,
    analyzeMarketingContent,

    // 고급 분석
    getAdvancedAnalytics,
    getPredictions,
    getInsights,

    // AI 최적화
    optimizeAI,
    benchmarkAI,
    submitFeedback,

    // 상태
    loading,
    error,
    testConnection,
  };
}
