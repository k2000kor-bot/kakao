import { ProjectFile } from '../types/project';

export interface FileAnalysisResult {
  id: string;
  fileId: string;
  fileName: string;
  analysisType: 'basic' | 'advanced' | 'real-time';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  confidence: number;
  results: {
    keywords: string[];
    summary: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    entities: Array<{
      name: string;
      type: 'person' | 'organization' | 'location' | 'date' | 'money';
      confidence: number;
    }>;
    topics: string[];
    recommendations: string[];
    insights: string[];
    riskFactors: string[];
    opportunities: string[];
  };
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface RealTimeAnalysisData {
  fileId: string;
  timestamp: string;
  metrics: {
    processingTime: number;
    accuracy: number;
    confidence: number;
  };
  liveInsights: string[];
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

class FileAnalysisService {
  private static instance: FileAnalysisService;
  private analysisQueue: Map<string, FileAnalysisResult> = new Map();
  private realTimeAnalyses: Map<string, RealTimeAnalysisData> = new Map();

  private constructor() {}

  static getInstance(): FileAnalysisService {
    if (!FileAnalysisService.instance) {
      FileAnalysisService.instance = new FileAnalysisService();
    }
    return FileAnalysisService.instance;
  }

  // 파일 업로드 후 자동 분석 시작
  async startFileAnalysis(file: ProjectFile, analysisType: 'basic' | 'advanced' | 'real-time' = 'basic'): Promise<string> {
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const analysis: FileAnalysisResult = {
      id: analysisId,
      fileId: file.id,
      fileName: file.name,
      analysisType,
      status: 'pending',
      progress: 0,
      confidence: 0.85,
      results: {
        keywords: [],
        summary: '',
        sentiment: 'neutral',
        entities: [],
        topics: [],
        recommendations: [],
        insights: [],
        riskFactors: [],
        opportunities: []
      },
      createdAt: new Date().toISOString()
    };

    this.analysisQueue.set(analysisId, analysis);
    
    // 분석 시작
    this.processAnalysis(analysisId);
    
    return analysisId;
  }

  // 분석 처리
  private async processAnalysis(analysisId: string): Promise<void> {
    const analysis = this.analysisQueue.get(analysisId);
    if (!analysis) return;

    try {
      analysis.status = 'processing';
      analysis.progress = 10;

      // 시뮬레이션된 분석 단계
      await this.simulateAnalysisSteps(analysis);

      analysis.status = 'completed';
      analysis.progress = 100;
      analysis.completedAt = new Date().toISOString();

      // 실시간 분석이면 실시간 데이터도 생성
      if (analysis.analysisType === 'real-time') {
        this.startRealTimeAnalysis(analysis.fileId);
      }

    } catch (error) {
      analysis.status = 'failed';
      analysis.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // 분석 단계 시뮬레이션
  private async simulateAnalysisSteps(analysis: FileAnalysisResult): Promise<void> {
    const steps = [
      { name: '파일 읽기', progress: 20 },
      { name: '텍스트 추출', progress: 35 },
      { name: '키워드 분석', progress: 50 },
      { name: '감정 분석', progress: 65 },
      { name: '개체 추출', progress: 80 },
      { name: '인사이트 생성', progress: 95 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      analysis.progress = step.progress;
      
      // 각 단계별 결과 생성
      this.generateStepResults(analysis, step.name);
    }
  }

  // 단계별 결과 생성
  private generateStepResults(analysis: FileAnalysisResult, stepName: string): void {
    switch (stepName) {
      case '키워드 분석':
        analysis.results.keywords = [
          '재건축', '아파트', '설계', '계약', '시공사',
          '조합원', '투표', '홍보', '법규', '안전'
        ];
        break;
      
      case '감정 분석':
        analysis.results.sentiment = Math.random() > 0.5 ? 'positive' : 'neutral';
        break;
      
      case '개체 추출':
        analysis.results.entities = [
          { name: '개포우성7차', type: 'location', confidence: 0.95 },
          { name: '삼성물산', type: 'organization', confidence: 0.88 },
          { name: '2025년', type: 'date', confidence: 0.92 }
        ];
        break;
      
      case '인사이트 생성':
        analysis.results.summary = '개포우성7차 재건축 프로젝트와 관련된 주요 논의사항들을 분석한 결과, 시공사 선정과 관련된 다양한 의견들이 제시되었습니다.';
        analysis.results.recommendations = [
          '투명한 선정 과정 필요',
          '조합원 의견 수렴 강화',
          '법적 검토 절차 준수'
        ];
        analysis.results.insights = [
          '시공사 홍보 활동에 대한 우려',
          '조합원 참여도 향상 필요',
          '정보 공유 체계 개선'
        ];
        break;
    }
  }

  // 실시간 분석 시작
  private startRealTimeAnalysis(fileId: string): void {
    const realTimeData: RealTimeAnalysisData = {
      fileId,
      timestamp: new Date().toISOString(),
      metrics: {
        processingTime: 0,
        accuracy: 0.85 + Math.random() * 0.1,
        confidence: 0.9 + Math.random() * 0.08
      },
      liveInsights: [],
      alerts: []
    };

    this.realTimeAnalyses.set(fileId, realTimeData);

    // 실시간 데이터 업데이트 시뮬레이션
    this.simulateRealTimeUpdates(fileId);
  }

  // 실시간 업데이트 시뮬레이션
  private simulateRealTimeUpdates(fileId: string): void {
    const interval = setInterval(() => {
      const data = this.realTimeAnalyses.get(fileId);
      if (!data) {
        clearInterval(interval);
        return;
      }

      // 실시간 인사이트 추가
      const newInsights = [
        '새로운 키워드 패턴 감지됨',
        '감정 분석 결과 업데이트',
        '관련 문서 연관성 발견',
        '트렌드 변화 감지'
      ];

      data.liveInsights.push(
        newInsights[Math.floor(Math.random() * newInsights.length)]
      );

      // 알림 생성
      if (Math.random() > 0.8) {
        data.alerts.push({
          type: 'info',
          message: '새로운 패턴이 감지되었습니다.',
          priority: 'medium'
        });
      }

      // 메트릭 업데이트
      data.metrics.processingTime += 1;
      data.metrics.accuracy = Math.max(0.8, data.metrics.accuracy + (Math.random() - 0.5) * 0.02);
      data.metrics.confidence = Math.max(0.85, data.metrics.confidence + (Math.random() - 0.5) * 0.01);

      // 최대 10개 인사이트 유지
      if (data.liveInsights.length > 10) {
        data.liveInsights.shift();
      }

      // 최대 5개 알림 유지
      if (data.alerts.length > 5) {
        data.alerts.shift();
      }

    }, 3000); // 3초마다 업데이트

    // 5분 후 자동 정리
    setTimeout(() => {
      clearInterval(interval);
      this.realTimeAnalyses.delete(fileId);
    }, 5 * 60 * 1000);
  }

  // 분석 결과 조회
  getAnalysisResult(analysisId: string): FileAnalysisResult | null {
    return this.analysisQueue.get(analysisId) || null;
  }

  // 파일별 분석 결과 조회
  getFileAnalysis(fileId: string): FileAnalysisResult | null {
    const analyses = Array.from(this.analysisQueue.values());
    for (const analysis of analyses) {
      if (analysis.fileId === fileId) {
        return analysis;
      }
    }
    return null;
  }

  // 실시간 분석 데이터 조회
  getRealTimeAnalysis(fileId: string): RealTimeAnalysisData | null {
    return this.realTimeAnalyses.get(fileId) || null;
  }

  // 모든 분석 결과 조회
  getAllAnalyses(): FileAnalysisResult[] {
    return Array.from(this.analysisQueue.values());
  }

  // 분석 상태 업데이트
  updateAnalysisProgress(analysisId: string, progress: number): void {
    const analysis = this.analysisQueue.get(analysisId);
    if (analysis) {
      analysis.progress = progress;
    }
  }

  // 분석 취소
  cancelAnalysis(analysisId: string): boolean {
    const analysis = this.analysisQueue.get(analysisId);
    if (analysis && analysis.status === 'pending') {
      analysis.status = 'failed';
      analysis.error = '사용자에 의해 취소됨';
      return true;
    }
    return false;
  }

  // 분석 결과 삭제
  deleteAnalysis(analysisId: string): boolean {
    return this.analysisQueue.delete(analysisId);
  }

  // 실시간 분석 중지
  stopRealTimeAnalysis(fileId: string): boolean {
    return this.realTimeAnalyses.delete(fileId);
  }
}

export default FileAnalysisService;
