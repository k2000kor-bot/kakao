import { ProjectFile } from '../types/chat';

export interface ExtractedKnowledge {
  content: string;
  confidence: number;
  knowledge_type: string;
  entities: string[];
  relationships: Record<string, string[]>;
  insights: string[];
  source_location: string;
  timestamp: string;
}

export interface PersuasiveContent {
  title: string;
  content: string;
  arguments: string[];
  evidence: string[];
  emotional_appeal: Record<string, number>;
  logical_structure: Record<string, any>;
  target_audience: string;
  persuasion_techniques: string[];
}

export interface MediaAnalysisResult {
  file_analysis: {
    file_name: string;
    file_size: number;
    media_type: string;
    analysis_timestamp: string;
  };
  extracted_knowledge: ExtractedKnowledge;
  persuasive_content: PersuasiveContent;
  knowledge_summary: string;
  learning_insights: string;
}

export interface KnowledgeBase {
  project_id: string;
  knowledge_items: number;
  knowledge_base: ExtractedKnowledge[];
}

export interface LearningSession {
  session_id: string;
  timestamp: string;
  project_id: string;
  media_type: string;
  learning_outcome: string;
  confidence_score: number;
  entities_count: number;
  insights_count: number;
}

export interface ProjectLearningHistory {
  project_id: string;
  total_events: number;
  learning_sessions: LearningSession[];
}

export interface KnowledgeSearchResult {
  project_id: string;
  query: string;
  matches: ExtractedKnowledge[];
  count: number;
}

class UltimateMediaKnowledgeService {
  private static instance: UltimateMediaKnowledgeService;
  private baseUrl = (process.env.REACT_APP_UMKS_BASE_URL || 'http://localhost:8001') + '/api/v1';

  private constructor() { }

  static getInstance(): UltimateMediaKnowledgeService {
    if (!UltimateMediaKnowledgeService.instance) {
      UltimateMediaKnowledgeService.instance = new UltimateMediaKnowledgeService();
    }
    return UltimateMediaKnowledgeService.instance;
  }

  /**
   * 미디어 파일을 분석하고 지식을 추출합니다.
   */
  async analyzeMediaFile(file: File, projectId: string): Promise<MediaAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);

      const response = await fetch(`${this.baseUrl}/analyze-media`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`미디어 분석 실패: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('미디어 파일 분석 중 오류:', error);
      throw error;
    }
  }

  /**
   * 프로젝트의 지식 베이스를 조회합니다.
   */
  async getKnowledgeBase(projectId: string): Promise<KnowledgeBase> {
    try {
      const response = await fetch(`${this.baseUrl}/knowledge-base/${projectId}`);

      if (!response.ok) {
        throw new Error(`지식 베이스 조회 실패: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('지식 베이스 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 학습 히스토리를 조회합니다.
   */
  async getLearningHistory(projectId: string): Promise<ProjectLearningHistory> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-history/${projectId}`);

      if (!response.ok) {
        throw new Error(`학습 히스토리 조회 실패: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('학습 히스토리 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 시스템 상태를 확인합니다.
   */
  async checkSystemHealth(): Promise<{
    status: string;
    version: string;
    ai_models_loaded: number;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);

      if (!response.ok) {
        throw new Error(`시스템 상태 확인 실패: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('시스템 상태 확인 중 오류:', error);
      throw error;
    }
  }

  /**
   * 설득력 있는 콘텐츠를 생성합니다.
   */
  generatePersuasiveContent(knowledge: ExtractedKnowledge): string {
    const content = [];

    // 도입부
    content.push(`📚 **지식 분석 결과**`);
    content.push(`분석된 ${knowledge.knowledge_type}에서 중요한 정보를 발견했습니다.`);
    content.push(``);

    // 주요 엔터티
    if (knowledge.entities.length > 0) {
      content.push(`**주요 발견사항:**`);
      knowledge.entities.slice(0, 5).forEach(entity => {
        content.push(`• ${entity}`);
      });
      content.push(``);
    }

    // 핵심 인사이트
    if (knowledge.insights.length > 0) {
      content.push(`**핵심 인사이트:**`);
      knowledge.insights.slice(0, 3).forEach(insight => {
        content.push(`• ${insight}`);
      });
      content.push(``);
    }

    // 신뢰도 정보
    content.push(`**분석 신뢰도:** ${(knowledge.confidence * 100).toFixed(1)}%`);
    content.push(``);

    // 활용 방안
    content.push(`**활용 방안:**`);
    content.push(`• 설득력 있는 논증에 활용`);
    content.push(`• 전문적 분석 자료로 활용`);
    content.push(`• 교육 자료로 활용`);
    content.push(`• 의사결정 지원 자료로 활용`);

    return content.join('\n');
  }

  /**
   * 지식 베이스에서 키워드로 검색합니다.
   */
  async searchKnowledge(
    projectId: string,
    query: string,
    opts?: { minConfidence?: number; mediaType?: string; limit?: number; start?: string; end?: string; order?: string; }
  ): Promise<KnowledgeSearchResult> {
    try {
      const url = new URL(`${this.baseUrl}/search-knowledge`);
      url.searchParams.set('project_id', projectId);
      url.searchParams.set('q', query || '');
      if (opts?.minConfidence !== undefined) url.searchParams.set('min_confidence', String(opts.minConfidence));
      if (opts?.mediaType) url.searchParams.set('media_type', opts.mediaType);
      if (opts?.limit !== undefined) url.searchParams.set('limit', String(opts.limit));
      if (opts?.start) url.searchParams.set('start', opts.start);
      if (opts?.end) url.searchParams.set('end', opts.end);
      if (opts?.order) url.searchParams.set('order', opts.order);
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`지식 검색 실패: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('지식 검색 중 오류:', error);
      throw error;
    }
  }

  /**
   * 서버에서 지식을 내보냅니다 (JSON/CSV). 검색 필터를 그대로 적용합니다.
   */
  async exportKnowledge(
    projectId: string,
    format: 'json' | 'csv' = 'json',
    opts?: { minConfidence?: number; mediaType?: string; limit?: number; start?: string; end?: string; order?: string; q?: string; }
  ): Promise<Blob> {
    const url = new URL(`${this.baseUrl}/knowledge-export/${projectId}`);
    url.searchParams.set('format', format);
    if (opts?.q) url.searchParams.set('q', opts.q);
    if (opts?.minConfidence !== undefined) url.searchParams.set('min_confidence', String(opts.minConfidence));
    if (opts?.mediaType) url.searchParams.set('media_type', opts.mediaType);
    if (opts?.limit !== undefined) url.searchParams.set('limit', String(opts.limit));
    if (opts?.start) url.searchParams.set('start', opts.start);
    if (opts?.end) url.searchParams.set('end', opts.end);
    if (opts?.order) url.searchParams.set('order', opts.order);
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`지식 내보내기 실패: ${res.statusText}`);
    }
    return await res.blob();
  }

  /**
   * 임의 텍스트로부터 설득 콘텐츠를 생성합니다.
   */
  async createPersuasionFromText(text: string, sourceType: string = 'text'): Promise<{
    extracted_knowledge: ExtractedKnowledge;
    persuasive_content: PersuasiveContent;
    knowledge_summary: string;
    learning_insights: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/persuasion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source_type: sourceType })
      });
      if (!response.ok) {
        throw new Error(`설득 콘텐츠 생성 실패: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('설득 콘텐츠 생성 중 오류:', error);
      throw error;
    }
  }

  /**
   * 프로젝트 지식/학습 이력을 초기화합니다.
   */
  async clearProjectKnowledge(projectId: string): Promise<{ project_id: string; deleted_items: number; status: string; }> {
    try {
      const response = await fetch(`${this.baseUrl}/knowledge-base/${projectId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`지식 초기화 실패: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('지식 초기화 중 오류:', error);
      throw error;
    }
  }

  /**
   * 지식 요약을 생성합니다.
   */
  generateKnowledgeSummary(knowledge: ExtractedKnowledge): string {
    const summary = [];

    summary.push(`📋 **지식 요약**`);
    summary.push(`**추출된 지식 타입:** ${knowledge.knowledge_type}`);
    summary.push(`**신뢰도:** ${(knowledge.confidence * 100).toFixed(1)}%`);
    summary.push(`**발견된 엔터티:** ${knowledge.entities.length}개`);
    summary.push(`**핵심 인사이트:** ${knowledge.insights.length}개`);
    summary.push(``);

    if (knowledge.entities.length > 0) {
      summary.push(`**주요 엔터티:** ${knowledge.entities.slice(0, 5).join(', ')}`);
    }

    if (knowledge.insights.length > 0) {
      summary.push(`**주요 인사이트:**`);
      knowledge.insights.slice(0, 3).forEach(insight => {
        summary.push(`• ${insight}`);
      });
    }

    return summary.join('\n');
  }

  /**
   * 학습 인사이트를 생성합니다.
   */
  generateLearningInsights(knowledge: ExtractedKnowledge): string {
    const insights = [];

    insights.push(`🧠 **학습 인사이트**`);
    insights.push(``);

    // 지식 수준 평가
    if (knowledge.confidence > 0.8) {
      insights.push(`✅ **고품질 지식:** 신뢰도가 높은 우수한 정보입니다.`);
    } else if (knowledge.confidence > 0.6) {
      insights.push(`⚠️ **중간 품질 지식:** 추가 검증이 필요할 수 있습니다.`);
    } else {
      insights.push(`❌ **낮은 품질 지식:** 신중한 검토가 필요합니다.`);
    }

    insights.push(``);
    insights.push(`**활용 방안:**`);
    insights.push(`• 설득력 있는 논증에 활용`);
    insights.push(`• 전문적 분석 자료로 활용`);
    insights.push(`• 교육 자료로 활용`);
    insights.push(`• 의사결정 지원 자료로 활용`);

    return insights.join('\n');
  }

  /**
   * 미디어 파일 타입을 감지합니다.
   */
  detectMediaType(file: File): string {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/)) {
      return 'image';
    } else if (fileType.includes('video') || fileName.match(/\.(mp4|avi|mov|wmv|flv|mkv|webm)$/)) {
      return 'video';
    } else if (fileType.includes('audio') || fileName.match(/\.(mp3|wav|flac|aac|ogg|m4a)$/)) {
      return 'audio';
    } else if (fileType.includes('pdf') || fileName.match(/\.pdf$/)) {
      return 'document';
    } else if (fileType.includes('document') || fileName.match(/\.(doc|docx|txt|rtf|odt)$/)) {
      return 'document';
    } else if (fileName.match(/\.(ppt|pptx)$/)) {
      return 'presentation';
    } else if (fileName.match(/\.(xls|xlsx|csv)$/)) {
      return 'spreadsheet';
    } else {
      return 'document';
    }
  }

  /**
   * 파일을 ProjectFile 형식으로 변환합니다.
   */
  convertToProjectFile(file: File): ProjectFile {
    return {
      id: this.generateFileId(file),
      name: file.name,
      type: this.detectMediaType(file) as any,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'user',
      path: URL.createObjectURL(file),
      file: file,
      tags: [],
      learningStatus: 'pending',
      classification: {
        category: 'unknown',
        subcategory: 'unknown',
        confidence: 0.5,
        keywords: [],
        topics: [],
        sentiment: 'neutral',
        language: 'ko',
        documentType: 'unknown',
        priority: 'medium'
      },
      learningProgress: 0
    };
  }

  /**
   * 파일 ID를 생성합니다.
   */
  private generateFileId(file: File): string {
    return `${file.name}_${file.size}_${file.lastModified}`;
  }

  /**
   * 에러 처리를 위한 폴백 응답을 생성합니다.
   */
  createFallbackResponse(file: File, error: Error): MediaAnalysisResult {
    return {
      file_analysis: {
        file_name: file.name,
        file_size: file.size,
        media_type: this.detectMediaType(file),
        analysis_timestamp: new Date().toISOString()
      },
      extracted_knowledge: {
        content: `파일 "${file.name}" 분석 중 오류가 발생했습니다: ${error.message}`,
        confidence: 0.0,
        knowledge_type: 'error',
        entities: [],
        relationships: {},
        insights: ['분석 중 오류가 발생했습니다'],
        source_location: 'error',
        timestamp: new Date().toISOString()
      },
      persuasive_content: {
        title: '분석 오류',
        content: '파일 분석 중 오류가 발생했습니다.',
        arguments: [],
        evidence: [],
        emotional_appeal: {},
        logical_structure: {},
        target_audience: '사용자',
        persuasion_techniques: []
      },
      knowledge_summary: '분석 오류로 인해 지식을 추출할 수 없습니다.',
      learning_insights: '오류 상황에서 학습할 수 있는 내용이 제한적입니다.'
    };
  }
}

export default UltimateMediaKnowledgeService;

export { };
