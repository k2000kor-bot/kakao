import { ProjectFile } from '../types/project';

export interface FileAnalysisResult {
  fileId: string;
  fileName: string;
  fileType: string;
  analysisType: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  keywords: string[];
  summary: string;
  insights: string[];
  confidence: number;
  processingTime: number;
  createdAt: string;
  // 고도화된 분석 결과
  detailedAnalysis?: {
    entities: Array<{ name: string; type: string; confidence: number }>;
    sentiment: { overall: 'positive' | 'negative' | 'neutral'; score: number };
    topics: Array<{ name: string; weight: number }>;
    language: string;
    readability: { score: number; level: string };
    structure?: {
      headings: string[];
      sections: Array<{ title: string; content: string }>;
      tables: Array<{ headers: string[]; rows: string[][] }>;
    };
  };
  // 이미지/비디오 특화 분석
  visualAnalysis?: {
    objects: Array<{ name: string; confidence: number; boundingBox?: number[] }>;
    text: Array<{ content: string; confidence: number; position?: number[] }>;
    faces: Array<{ confidence: number; attributes?: Record<string, any> }>;
    colors: Array<{ color: string; percentage: number }>;
    scene: string;
  };
  // 오디오 특화 분석
  audioAnalysis?: {
    transcription: string;
    language: string;
    speakers: Array<{ id: string; confidence: number }>;
    emotions: Array<{ emotion: string; confidence: number; timestamp: number }>;
    music: { detected: boolean; genre?: string; tempo?: number };
  };
}

export interface ChatFileAnalysis {
  query: string;
  relevantFiles: FileAnalysisResult[];
  analysisSummary: string;
  recommendations: string[];
}

class FileAnalysisService {
  private static instance: FileAnalysisService;
  private analysisCache: Map<string, FileAnalysisResult> = new Map();

  private constructor() {}

  static getInstance(): FileAnalysisService {
    if (!FileAnalysisService.instance) {
      FileAnalysisService.instance = new FileAnalysisService();
    }
    return FileAnalysisService.instance;
  }

  // 파일 분석 실행
  async analyzeFile(file: ProjectFile): Promise<FileAnalysisResult> {
    const cacheKey = `${file.id}_${file.size}_${Date.now()}`;
    
    // 캐시된 결과가 있으면 반환
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    console.log(`파일 분석 시작: ${file.name} (${file.type})`);

    const startTime = Date.now();
    let analysisResult: FileAnalysisResult;

    try {
      switch (file.type.toLowerCase()) {
        case 'pdf':
        case 'doc':
        case 'docx':
          analysisResult = await this.analyzeDocument(file);
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          analysisResult = await this.analyzeImage(file);
          break;
        case 'mp4':
        case 'avi':
        case 'mov':
          analysisResult = await this.analyzeVideo(file);
          break;
        case 'mp3':
        case 'wav':
          analysisResult = await this.analyzeAudio(file);
          break;
        default:
          analysisResult = await this.analyzeText(file);
      }

      // 캐시에 저장
      this.analysisCache.set(cacheKey, analysisResult);
      
      console.log(`파일 분석 완료: ${file.name} (${Date.now() - startTime}ms)`);
      return analysisResult;
    } catch (error) {
      console.error(`파일 분석 실패: ${file.name}`, error);
      throw error;
    }
  }

  // 문서 분석
  private async analyzeDocument(file: ProjectFile): Promise<FileAnalysisResult> {
    // 실제 구현에서는 OCR 및 텍스트 추출 API 호출
    const mockContent = `${file.name} 문서에서 추출된 텍스트 내용입니다. 이 문서는 중요한 정보를 포함하고 있으며, 프로젝트 진행에 필요한 핵심 자료입니다. 건설 프로젝트의 세부 사항과 일정, 예산 정보가 포함되어 있습니다.`;
    
    // 고도화된 분석 결과 시뮬레이션
    const detailedAnalysis = {
      entities: [
        { name: '대우건설', type: 'ORGANIZATION', confidence: 95 },
        { name: '개포우성7차', type: 'PROJECT', confidence: 90 },
        { name: '재건축', type: 'CONCEPT', confidence: 85 },
        { name: '2024년', type: 'DATE', confidence: 80 },
        { name: '서울시', type: 'LOCATION', confidence: 75 }
      ],
      sentiment: { overall: 'positive' as const, score: 0.7 },
      topics: [
        { name: '건설 프로젝트', weight: 0.9 },
        { name: '재건축 사업', weight: 0.8 },
        { name: '일정 관리', weight: 0.7 },
        { name: '예산 계획', weight: 0.6 },
        { name: '안전 관리', weight: 0.5 }
      ],
      language: 'ko',
      readability: { score: 75, level: '보통' },
      structure: {
        headings: ['프로젝트 개요', '일정 계획', '예산 현황', '안전 관리', '결론'],
        sections: [
          { title: '프로젝트 개요', content: '개포우성7차 재건축 사업의 전반적인 개요와 목표' },
          { title: '일정 계획', content: '프로젝트 진행 일정과 주요 마일스톤' },
          { title: '예산 현황', content: '프로젝트 예산 현황과 재정 계획' }
        ],
        tables: [
          {
            headers: ['항목', '계획', '실적', '차이'],
            rows: [
              ['일정', '2024년 3월', '2024년 3월', '0일'],
              ['예산', '100억원', '95억원', '-5억원'],
              ['품질', 'A등급', 'A등급', '0']
            ]
          }
        ]
      }
    };
    
    return {
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      analysisType: 'document',
      content: mockContent,
      keywords: ['문서', '프로젝트', '정보', '자료', '핵심', '건설', '재건축', '일정', '예산'],
      summary: `${file.name} 문서에서 프로젝트 관련 중요 정보가 추출되었습니다. 건설 프로젝트의 세부 사항과 일정, 예산 정보가 포함되어 있습니다.`,
      insights: [
        '문서에 포함된 정보는 프로젝트 진행에 필수적입니다.',
        '정확한 데이터 분석이 필요합니다.',
        '일정과 예산 관리가 중요한 요소입니다.',
        '안전 관리 체계가 잘 구축되어 있습니다.'
      ],
      confidence: 85,
      processingTime: 2000,
      createdAt: new Date().toISOString(),
      detailedAnalysis
    };
  }

  // 이미지 분석
  private async analyzeImage(file: ProjectFile): Promise<FileAnalysisResult> {
    const mockContent = `${file.name} 이미지에서 감지된 객체와 텍스트 정보입니다. 이미지에는 건설 현장, 도면, 차트 등의 요소가 포함되어 있습니다.`;
    
    // 고도화된 시각적 분석 결과 시뮬레이션
    const visualAnalysis = {
      objects: [
        { name: '건물', confidence: 95, boundingBox: [10, 20, 80, 90] },
        { name: '크레인', confidence: 88, boundingBox: [15, 25, 85, 95] },
        { name: '건설 장비', confidence: 82, boundingBox: [20, 30, 90, 100] },
        { name: '안전모', confidence: 75, boundingBox: [25, 35, 95, 105] }
      ],
      text: [
        { content: '개포우성7차', confidence: 92, position: [30, 40] },
        { content: '재건축 사업', confidence: 88, position: [35, 45] },
        { content: '2024년', confidence: 85, position: [40, 50] },
        { content: '대우건설', confidence: 90, position: [45, 55] }
      ],
      faces: [
        { confidence: 78, attributes: { age: '30-40', gender: 'male', emotion: 'neutral' } },
        { confidence: 72, attributes: { age: '40-50', gender: 'male', emotion: 'focused' } }
      ],
      colors: [
        { color: '#4A90E2', percentage: 35 },
        { color: '#F5A623', percentage: 25 },
        { color: '#7ED321', percentage: 20 },
        { color: '#D0021B', percentage: 15 },
        { color: '#9013FE', percentage: 5 }
      ],
      scene: '건설 현장'
    };
    
    return {
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      analysisType: 'image',
      content: mockContent,
      keywords: ['이미지', '건설', '도면', '차트', '현장', '크레인', '건물', '안전모'],
      summary: `${file.name} 이미지에서 건설 관련 시각적 정보가 감지되었습니다. 건설 현장의 다양한 요소들이 포함되어 있습니다.`,
      insights: [
        '이미지에 건설 현장이나 도면이 포함되어 있습니다.',
        '시각적 데이터 분석이 필요합니다.',
        '안전 장비가 적절히 사용되고 있습니다.',
        '프로젝트 진행 상황을 시각적으로 확인할 수 있습니다.'
      ],
      confidence: 90,
      processingTime: 1500,
      createdAt: new Date().toISOString(),
      visualAnalysis
    };
  }

  // 비디오 분석
  private async analyzeVideo(file: ProjectFile): Promise<FileAnalysisResult> {
    const mockContent = `${file.name} 비디오에서 추출된 프레임과 오디오 정보입니다. 비디오에는 프로젝트 진행 상황이나 회의 내용이 포함되어 있습니다.`;
    
    return {
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      analysisType: 'video',
      content: mockContent,
      keywords: ['비디오', '프로젝트', '진행', '회의', '상황'],
      summary: `${file.name} 비디오에서 프로젝트 진행 상황이 확인되었습니다.`,
      insights: [
        '비디오에 프로젝트 진행 상황이 기록되어 있습니다.',
        '회의나 프레젠테이션 내용이 포함되어 있습니다.'
      ],
      confidence: 80,
      processingTime: 5000,
      createdAt: new Date().toISOString()
    };
  }

  // 오디오 분석
  private async analyzeAudio(file: ProjectFile): Promise<FileAnalysisResult> {
    const mockContent = `${file.name} 오디오에서 추출된 음성 텍스트입니다. 오디오에는 회의 내용이나 인터뷰 내용이 포함되어 있습니다.`;
    
    return {
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      analysisType: 'audio',
      content: mockContent,
      keywords: ['오디오', '음성', '회의', '인터뷰', '내용'],
      summary: `${file.name} 오디오에서 회의나 인터뷰 내용이 추출되었습니다.`,
      insights: [
        '오디오에 회의나 인터뷰 내용이 포함되어 있습니다.',
        '음성 인식을 통해 텍스트로 변환되었습니다.'
      ],
      confidence: 75,
      processingTime: 3000,
      createdAt: new Date().toISOString()
    };
  }

  // 텍스트 분석
  private async analyzeText(file: ProjectFile): Promise<FileAnalysisResult> {
    const mockContent = `${file.name} 텍스트 파일의 내용을 분석한 결과입니다. 파일에는 프로젝트 관련 정보와 데이터가 포함되어 있습니다.`;
    
    return {
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      analysisType: 'text',
      content: mockContent,
      keywords: ['텍스트', '프로젝트', '정보', '데이터', '분석'],
      summary: `${file.name} 텍스트 파일에서 프로젝트 관련 정보가 분석되었습니다.`,
      insights: [
        '텍스트 파일에 프로젝트 관련 정보가 포함되어 있습니다.',
        '데이터 분석이 필요합니다.'
      ],
      confidence: 95,
      processingTime: 1000,
      createdAt: new Date().toISOString()
    };
  }

  // 채팅 질문에 대한 파일 분석 통합
  async analyzeForChat(query: string, projectFiles: ProjectFile[]): Promise<ChatFileAnalysis> {
    console.log(`채팅 분석 시작: "${query}" (${projectFiles.length}개 파일)`);

    // 질문과 관련된 파일들 찾기
    const relevantFiles = await this.findRelevantFiles(query, projectFiles);
    
    // 관련 파일들 분석
    const analysisResults: FileAnalysisResult[] = [];
    for (const file of relevantFiles) {
      try {
        const result = await this.analyzeFile(file);
        analysisResults.push(result);
      } catch (error) {
        console.error(`파일 분석 실패: ${file.name}`, error);
      }
    }

    // 종합 분석 결과 생성
    const analysisSummary = this.generateAnalysisSummary(query, analysisResults);
    const recommendations = this.generateRecommendations(query, analysisResults);

    return {
      query,
      relevantFiles: analysisResults,
      analysisSummary,
      recommendations
    };
  }

  // 질문과 관련된 파일 찾기
  private async findRelevantFiles(query: string, files: ProjectFile[]): Promise<ProjectFile[]> {
    const queryLower = query.toLowerCase();
    const relevantKeywords = this.extractKeywords(query);
    
    const relevantFiles = files.filter(file => {
      const fileNameLower = file.name.toLowerCase();
      const fileTypeLower = file.type.toLowerCase();
      
      // 파일명에 키워드가 포함된 경우
      if (relevantKeywords.some(keyword => fileNameLower.includes(keyword))) {
        return true;
      }
      
      // 특정 질문 패턴에 따른 파일 타입 매칭
      if (queryLower.includes('이미지') || queryLower.includes('사진') || queryLower.includes('그림')) {
        return ['jpg', 'jpeg', 'png', 'gif'].includes(fileTypeLower);
      }
      
      if (queryLower.includes('비디오') || queryLower.includes('영상') || queryLower.includes('동영상')) {
        return ['mp4', 'avi', 'mov'].includes(fileTypeLower);
      }
      
      if (queryLower.includes('문서') || queryLower.includes('pdf') || queryLower.includes('파일')) {
        return ['pdf', 'doc', 'docx', 'txt'].includes(fileTypeLower);
      }
      
      if (queryLower.includes('오디오') || queryLower.includes('음성') || queryLower.includes('음악')) {
        return ['mp3', 'wav'].includes(fileTypeLower);
      }
      
      return false;
    });

    // 최대 5개 파일까지만 반환
    return relevantFiles.slice(0, 5);
  }

  // 질문에서 키워드 추출
  private extractKeywords(query: string): string[] {
    const keywords = [
      '프로젝트', '분석', '파일', '문서', '이미지', '비디오', '오디오',
      '데이터', '정보', '결과', '보고서', '제안서', '계획서',
      '건설', '시공', '안전', '품질', '일정', '예산',
      '대우', '개포', '우성', '재건축', '아파트', '건물'
    ];
    
    return keywords.filter(keyword => query.toLowerCase().includes(keyword));
  }

  // 분석 요약 생성
  private generateAnalysisSummary(query: string, results: FileAnalysisResult[]): string {
    if (results.length === 0) {
      return '질문과 관련된 파일을 찾을 수 없습니다.';
    }

    const fileTypes = results.map(r => r.analysisType);
    const uniqueTypes = Array.from(new Set(fileTypes));
    
    let summary = `질문 "${query}"에 대해 ${results.length}개의 관련 파일을 분석했습니다. `;
    
    if (uniqueTypes.length > 1) {
      summary += `분석된 파일 유형: ${uniqueTypes.join(', ')}. `;
    } else {
      summary += `분석된 파일 유형: ${uniqueTypes[0]}. `;
    }

    const avgConfidence = Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length);
    summary += `평균 분석 신뢰도: ${avgConfidence}%. `;

    const totalKeywords = results.flatMap(r => r.keywords);
    const uniqueKeywords = Array.from(new Set(totalKeywords));
    if (uniqueKeywords.length > 0) {
      summary += `주요 키워드: ${uniqueKeywords.slice(0, 5).join(', ')}.`;
    }

    return summary;
  }

  // 추천사항 생성
  private generateRecommendations(query: string, results: FileAnalysisResult[]): string[] {
    const recommendations: string[] = [];
    
    if (results.length === 0) {
      recommendations.push('더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다.');
      return recommendations;
    }

    // 파일 유형별 추천사항
    const hasImages = results.some(r => r.analysisType === 'image');
    const hasDocuments = results.some(r => r.analysisType === 'document');
    const hasVideos = results.some(r => r.analysisType === 'video');

    if (hasImages) {
      recommendations.push('이미지 파일에서 시각적 정보를 확인할 수 있습니다.');
    }

    if (hasDocuments) {
      recommendations.push('문서 파일에서 상세한 텍스트 정보를 확인할 수 있습니다.');
    }

    if (hasVideos) {
      recommendations.push('비디오 파일에서 동적 정보를 확인할 수 있습니다.');
    }

    // 신뢰도 기반 추천사항
    const lowConfidenceResults = results.filter(r => r.confidence < 70);
    if (lowConfidenceResults.length > 0) {
      recommendations.push('일부 파일의 분석 신뢰도가 낮습니다. 추가 검증이 필요할 수 있습니다.');
    }

    return recommendations;
  }

  // 캐시 클리어
  clearCache(): void {
    this.analysisCache.clear();
  }

  // 특정 파일 캐시 제거
  removeFromCache(fileId: string): void {
    const keysToDelete: string[] = [];
    this.analysisCache.forEach((_, key) => {
      if (key.startsWith(fileId)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.analysisCache.delete(key));
  }
}

export default FileAnalysisService;
