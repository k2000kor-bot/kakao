import { ProjectFile } from '../types/project';
import { errorLogger, toError } from '../utils/errorLogger';

export interface AdvancedFileAnalysisResult {
  id: string;
  fileId: string;
  fileName: string;
  file: File;
  fileType: string;
  analysisType: 'pdf' | 'image' | 'document' | 'audio' | 'video' | 'comprehensive';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  confidence: number;
  uploadTime: string;
  completedAt?: string;
  extractedText?: string;
  ocrResults?: {
    text: string;
    language: string;
    confidence: number;
    regions: {
      text: string;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      confidence: number;
    }[];
  };
  pdfResults?: {
    text: string;
    pages: number;
    structure: {
      headings: string[];
    };
  };
  documentResults?: {
    text: string;
    structure: {
      headings: string[];
      paragraphs: number;
    };
  };
  imageResults?: {
    description: string;
    tags: string[];
    confidence: number;
  };
  audioResults?: {
    transcription: string;
    language: string;
    duration: number;
    confidence: number;
  };
  videoResults?: {
    transcription: string;
    scenes: string[];
    duration: number;
    confidence: number;
  };
  comprehensiveResults?: {
    extractedText: string;
    keyTopics: string[];
    entities: Array<{
      name: string;
      type: string;
      confidence: number;
      occurrences: number;
    }>;
    sentiment: {
      overall: string;
      score: number;
      details: {
        positive: number;
        neutral: number;
        negative: number;
      };
    };
    summary: string;
    insights: string[];
    recommendations: string[];
    categories: string[];
    tags: string[];
  };
  error?: string;
}

class AdvancedFileAnalysisService {
  private static instance: AdvancedFileAnalysisService;
  private analysisQueue: Map<string, AdvancedFileAnalysisResult> = new Map();
  private processingAnalyses: Set<string> = new Set();

  private constructor() { }

  static getInstance(): AdvancedFileAnalysisService {
    if (!AdvancedFileAnalysisService.instance) {
      AdvancedFileAnalysisService.instance = new AdvancedFileAnalysisService();
    }
    return AdvancedFileAnalysisService.instance;
  }

  // 파일 타입에 따른 자동 분석 시작
  async startAdvancedAnalysis(file: ProjectFile): Promise<string> {
    const analysisId = `advanced_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 파일 타입에 따른 분석 타입 결정
    const analysisType = this.determineAnalysisType(file);

    const analysis: AdvancedFileAnalysisResult = {
      id: analysisId,
      fileId: file.id,
      fileName: file.name,
      file: (file as { file?: File }).file ?? new File([], file.name), // 파일 객체 추가
      fileType: file.type,
      analysisType,
      status: 'pending',
      progress: 0,
      confidence: 0.85,
      uploadTime: new Date().toISOString() // 업로드 시간 추가
    };

    this.analysisQueue.set(analysisId, analysis);

    // 분석 시작
    this.processAdvancedAnalysis(analysisId);

    return analysisId;
  }

  // 파일 타입에 따른 분석 타입 결정
  private determineAnalysisType(file: ProjectFile): AdvancedFileAnalysisResult['analysisType'] {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    if (fileType.includes('pdf')) {
      return 'pdf';
    } else if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/)) {
      return 'image';
    } else if (fileType.includes('audio') || fileName.match(/\.(mp3|wav|flac|aac|ogg|m4a)$/)) {
      return 'audio';
    } else if (fileType.includes('video') || fileName.match(/\.(mp4|avi|mov|wmv|flv|mkv|webm)$/)) {
      return 'video';
    } else if (fileType.includes('document') || fileName.match(/\.(doc|docx|txt|rtf|odt)$/)) {
      return 'document';
    } else {
      return 'comprehensive';
    }
  }

  // 고급 분석 처리
  private async processAdvancedAnalysis(analysisId: string): Promise<void> {
    const analysis = this.analysisQueue.get(analysisId);
    if (!analysis) return;

    if (this.processingAnalyses.has(analysisId)) return;
    this.processingAnalyses.add(analysisId);

    try {
      analysis.status = 'processing';
      analysis.progress = 10;

      // 파일 타입별 분석 수행
      switch (analysis.analysisType) {
        case 'pdf':
          await this.analyzePDF(analysis);
          break;
        case 'image':
          await this.analyzeImage(analysis);
          break;
        case 'document':
          await this.analyzeDocument(analysis);
          break;
        case 'audio':
          await this.analyzeAudio(analysis);
          break;
        case 'video':
          await this.analyzeVideo(analysis);
          break;
        case 'comprehensive':
        default:
          await this.analyzeComprehensive(analysis);
          break;
      }

      // 종합 분석 수행
      await this.performComprehensiveAnalysis(analysis);

      analysis.status = 'completed';
      analysis.progress = 100;
      analysis.completedAt = new Date().toISOString();

    } catch (error) {
      const err = toError(error);
      errorLogger.error('고급 파일 분석 실패', err, {
        component: 'advancedFileAnalysisService',
        action: 'analyzeFile',
        analysisId,
        fileName: analysis.fileName,
        fileType: analysis.fileType,
        analysisType: analysis.analysisType,
      });
      analysis.status = 'failed';
      analysis.error = error instanceof Error ? error.message : '알 수 없는 오류';
    } finally {
      this.processingAnalyses.delete(analysisId);
    }
  }

  // PDF 분석
  private async analyzePDF(analysis: AdvancedFileAnalysisResult): Promise<void> {
    analysis.progress = 20;

    // PDF 텍스트 추출 시뮬레이션
    await this.simulateProcessing(1000);

    analysis.pdfResults = {
      text: `PDF 파일 "${analysis.fileName}"에서 추출된 텍스트입니다. 이 문서는 중요한 정보를 포함하고 있으며, 
      여러 페이지에 걸쳐 상세한 내용이 기술되어 있습니다. 문서의 구조를 분석하여 제목, 섹션, 
      표 등을 식별했습니다.`,
      pages: 15,
      structure: {
        headings: ['1. 개요', '2. 목적', '3. 방법론', '4. 결과', '5. 결론']
      }
    };

    analysis.progress = 40;
  }

  // 이미지 분석 (OCR 포함)
  private async analyzeImage(analysis: AdvancedFileAnalysisResult): Promise<void> {
    analysis.progress = 25;

    // OCR 처리 시뮬레이션
    await this.simulateProcessing(1500);

    analysis.ocrResults = {
      text: `이미지에서 추출된 텍스트입니다. 이미지에는 중요한 정보가 포함되어 있으며, 
      다양한 객체와 텍스트가 식별되었습니다. OCR 기술을 사용하여 이미지 내의 
      모든 텍스트를 정확하게 추출했습니다.`,
      language: 'ko',
      confidence: 0.92,
      regions: [
        {
          text: '제목',
          boundingBox: { x: 100, y: 50, width: 200, height: 30 },
          confidence: 0.95
        },
        {
          text: '내용 텍스트',
          boundingBox: { x: 100, y: 100, width: 400, height: 200 },
          confidence: 0.88
        }
      ]
    };

    analysis.imageResults = {
      description: '데모: 재건축 프로젝트 시공사 선정 관련 문서',
      tags: ['시공사', '샘플프로젝트', '재건축', '시공사 선정', '프로젝트 관리'],
      confidence: 0.95
    };

    analysis.progress = 45;
  }

  // 문서 분석
  private async analyzeDocument(analysis: AdvancedFileAnalysisResult): Promise<void> {
    analysis.progress = 30;

    // 문서 분석 시뮬레이션
    await this.simulateProcessing(1200);

    analysis.documentResults = {
      text: `문서 파일 "${analysis.fileName}"에서 추출된 텍스트입니다. 이 문서는 
      구조화된 정보를 포함하고 있으며, 제목, 단락, 목록, 표 등이 체계적으로 
      구성되어 있습니다.`,
      structure: {
        headings: ['제목 1', '제목 2', '제목 3'],
        paragraphs: 3
      }
    };

    analysis.progress = 50;
  }

  // 오디오 분석
  private async analyzeAudio(analysis: AdvancedFileAnalysisResult): Promise<void> {
    analysis.progress = 35;

    // 오디오 분석 시뮬레이션
    await this.simulateProcessing(2000);

    analysis.audioResults = {
      transcription: `오디오 파일에서 추출된 텍스트입니다. 음성 인식 기술을 사용하여 
      오디오 내용을 정확하게 텍스트로 변환했습니다. 여러 화자의 음성이 
      식별되었으며, 감정 분석도 수행되었습니다.`,
      language: 'ko',
      duration: 180, // 3분
      confidence: 0.90
    };

    analysis.progress = 55;
  }

  // 비디오 분석
  private async analyzeVideo(analysis: AdvancedFileAnalysisResult): Promise<void> {
    analysis.progress = 40;

    // 비디오 분석 시뮬레이션
    await this.simulateProcessing(3000);

    analysis.videoResults = {
      transcription: `비디오 파일에서 추출된 텍스트입니다. 비디오에는 여러 장면이 
      포함되어 있으며, 각 장면에서 다양한 객체와 사람이 식별되었습니다. 
      시간별로 상세한 분석이 수행되었습니다.`,
      scenes: ['첫 번째 장면', '두 번째 장면'],
      duration: 300, // 5분
      confidence: 0.92
    };

    analysis.progress = 60;
  }

  // 종합 분석
  private async analyzeComprehensive(analysis: AdvancedFileAnalysisResult): Promise<void> {
    analysis.progress = 50;

    // 종합 분석 시뮬레이션
    await this.simulateProcessing(1500);

    // 기본 텍스트 추출
    let extractedText = '';
    if (analysis.pdfResults) {
      extractedText = analysis.pdfResults.text;
    } else if (analysis.ocrResults) {
      extractedText = analysis.ocrResults.text;
    } else if (analysis.documentResults) {
      extractedText = analysis.documentResults.text;
    } else if (analysis.audioResults) {
      extractedText = analysis.audioResults.transcription;
    } else if (analysis.videoResults) {
      extractedText = analysis.videoResults.transcription;
    }

    // 건설업계 관련 키워드 및 카테고리 추가
    const _constructionKeywords = [
      '대우건설', '건설업', '부동산', '개발', '시공', '감리', '설계', '인허가', '착공', '준공',
      '아파트', '빌라', '상가', '오피스텔', '재개발', '재건축', '도시개발', '신도시',
      '토목', '건축', '전기', '소방', '환경', '조경', '도시계획', '교통',
      '기초공사', '구조공사', '마감공사', '설비공사', '외장공사', '내장공사',
      '안전관리', '품질관리', '공정관리', '원가관리', '자재관리', '인력관리',
      'BIM', '3D모델링', '프리캐스트', '조립식건축', '친환경건축', '스마트건설'
    ];

    analysis.comprehensiveResults = {
      extractedText,
      keyTopics: [
        '프로젝트', '분석', '결과', '계획', '실행',
        '대우건설', '건설업', '부동산개발', '시공관리', '프로젝트관리',
        '건축설계', '토목공사', '인허가', '안전관리', '품질관리'
      ],
      entities: [
        { name: '대우건설', type: 'organization', confidence: 0.95, occurrences: 8 },
        { name: '프로젝트팀', type: 'organization', confidence: 0.9, occurrences: 5 },
        { name: '2024년', type: 'date', confidence: 0.95, occurrences: 3 },
        { name: '서울', type: 'location', confidence: 0.8, occurrences: 2 },
        { name: '건설현장', type: 'location', confidence: 0.85, occurrences: 4 },
        { name: '시공사', type: 'organization', confidence: 0.8, occurrences: 3 },
        { name: '감리사', type: 'organization', confidence: 0.75, occurrences: 2 }
      ],
      sentiment: {
        overall: 'positive',
        score: 0.7,
        details: {
          positive: 0.65,
          neutral: 0.25,
          negative: 0.10
        }
      },
      summary: `이 파일은 대우건설 관련 프로젝트 문서로, 성공적인 건설 프로젝트의 결과와 향후 계획을 포함하고 있습니다. 
      대우건설의 전문성과 체계적인 프로젝트 관리로 목표를 달성했으며, 
      안전관리와 품질관리를 통해 고품질 건설물을 완성했습니다. 
      다음 단계에 대한 구체적인 계획도 수립되어 있습니다.`,
      insights: [
        '대우건설의 전문적인 시공 능력이 프로젝트 성공의 핵심',
        '안전관리와 품질관리의 체계적 적용',
        '효율적인 프로젝트 관리 시스템',
        '고객 만족도 향상을 위한 지속적 개선',
        '친환경 건설 기술의 적용',
        '스마트 건설 기술 도입으로 생산성 향상'
      ],
      recommendations: [
        '대우건설의 성공 사례를 다른 프로젝트에 적용',
        '안전관리 시스템의 표준화 및 확대',
        '품질관리 프로세스의 지속적 개선',
        '스마트 건설 기술의 확대 적용',
        '친환경 건설 기술의 연구 개발 강화',
        '고객 서비스 품질 향상 프로그램 도입'
      ],
      categories: [
        '건설업', '부동산개발', '프로젝트관리', '시공관리', '안전관리',
        '품질관리', '대우건설', '건축설계', '토목공사', '인허가'
      ],
      tags: [
        '대우건설', '건설업', '프로젝트관리', '시공', '안전관리',
        '품질관리', '성공', '전문성', '체계적', '개선'
      ]
    };

    analysis.progress = 80;
  }

  // 종합 분석 수행
  private async performComprehensiveAnalysis(analysis: AdvancedFileAnalysisResult): Promise<void> {
    analysis.progress = 85;

    // 모든 분석 결과를 통합하여 최종 종합 분석 수행
    if (!analysis.comprehensiveResults) {
      await this.analyzeComprehensive(analysis);
    }

    // AI 학습을 위한 데이터 준비
    const learningData = {
      fileId: analysis.fileId,
      fileName: analysis.fileName,
      fileType: analysis.fileType,
      extractedContent: analysis.comprehensiveResults?.extractedText || '',
      keyTopics: analysis.comprehensiveResults?.keyTopics || [],
      entities: analysis.comprehensiveResults?.entities || [],
      insights: analysis.comprehensiveResults?.insights || [],
      recommendations: analysis.comprehensiveResults?.recommendations || []
    };

    // AI 학습 시스템에 데이터 전달
    this.sendToAILearning(learningData);

    analysis.progress = 95;
  }

  // AI 학습 시스템에 데이터 전달
  private sendToAILearning(learningData: Record<string, unknown>): void {
    // AI 학습 시스템에 분석 결과 전달
    window.dispatchEvent(new CustomEvent('aiLearningData', {
      detail: {
        type: 'fileAnalysis',
        data: learningData
      }
    }));
  }

  // 처리 시뮬레이션
  private async simulateProcessing(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // 분석 결과 조회
  getAnalysisResult(analysisId: string): AdvancedFileAnalysisResult | null {
    return this.analysisQueue.get(analysisId) || null;
  }

  // 파일 타입 결정
  getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // 문서 타입
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return 'document';
    }

    // 이미지 타입
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(extension)) {
      return 'image';
    }

    // 오디오 타입
    if (['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'].includes(extension)) {
      return 'audio';
    }

    // 비디오 타입
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(extension)) {
      return 'video';
    }

    // 스프레드시트 타입
    if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return 'spreadsheet';
    }

    // 프레젠테이션 타입
    if (['ppt', 'pptx'].includes(extension)) {
      return 'presentation';
    }

    return 'unknown';
  }

  // 파일별 분석 결과 조회
  getFileAnalysis(fileId: string): AdvancedFileAnalysisResult | null {
    for (const analysis of Array.from(this.analysisQueue.values())) {
      if (analysis.fileId === fileId) {
        return analysis;
      }
    }
    return null;
  }

  // 모든 분석 결과 조회
  getAllAnalyses(): AdvancedFileAnalysisResult[] {
    return Array.from(this.analysisQueue.values());
  }

  // 분석 진행률 업데이트
  updateAnalysisProgress(analysisId: string, progress: number): void {
    const analysis = this.analysisQueue.get(analysisId);
    if (analysis) {
      analysis.progress = Math.min(100, Math.max(0, progress));
    }
  }

  // 분석 취소
  cancelAnalysis(analysisId: string): boolean {
    const analysis = this.analysisQueue.get(analysisId);
    if (analysis && analysis.status === 'processing') {
      analysis.status = 'failed';
      analysis.error = '사용자에 의해 취소됨';
      return true;
    }
    return false;
  }

  // 분석 삭제
  deleteAnalysis(analysisId: string): boolean {
    return this.analysisQueue.delete(analysisId);
  }

  // 파일 타입별 분석 시작
  async analyzeFileByType(file: ProjectFile): Promise<string> {
    return this.startAdvancedAnalysis(file);
  }

  private simulateAnalysisSteps(analysis: AdvancedFileAnalysisResult): void {
    const steps = [
      { name: '파일 타입 분석', progress: 10 },
      { name: '텍스트 추출', progress: 25 },
      { name: 'OCR 처리', progress: 40 },
      { name: '키워드 추출', progress: 55 },
      { name: '엔티티 인식', progress: 70 },
      { name: '감정 분석', progress: 85 },
      { name: '인사이트 생성', progress: 100 }
    ];

    let currentStep = 0;
    const processStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        analysis.progress = step.progress;
        analysis.status = 'processing';

        // 단계별 결과 생성
        switch (step.name) {
          case '파일 타입 분석':
            analysis.fileType = this.getFileType(analysis.file);
            break;
          case '텍스트 추출':
            analysis.extractedText = this.generateSampleText(analysis.file);
            break;
          case 'OCR 처리':
            analysis.ocrResults = {
              text: '데모: 재건축 프로젝트 시공사 선정 관련 문서',
              language: 'ko',
              confidence: 0.92,
              regions: [
                {
                  text: '제목',
                  boundingBox: { x: 100, y: 50, width: 200, height: 30 },
                  confidence: 0.95
                },
                {
                  text: '내용 텍스트',
                  boundingBox: { x: 100, y: 100, width: 400, height: 200 },
                  confidence: 0.88
                }
              ]
            };
            break;
          case '키워드 추출':
            analysis.comprehensiveResults = {
              extractedText: analysis.extractedText || '',
              keyTopics: [
                '시공사', '샘플프로젝트', '재건축', '시공사 선정', '프로젝트 관리',
                '건설업', '부동산개발', '시공관리', '안전관리', '품질관리',
                '스마트건설', '친환경건설', 'BIM', '프리캐스트', '모듈러건설'
              ],
              entities: [
                { name: '대우건설', type: 'organization', confidence: 0.95, occurrences: 12 },
                { name: '샘플 프로젝트', type: 'project', confidence: 0.88, occurrences: 8 },
                { name: '재건축', type: 'construction_type', confidence: 0.92, occurrences: 15 },
                { name: '시공사', type: 'role', confidence: 0.85, occurrences: 6 },
                { name: '프로젝트 관리', type: 'management', confidence: 0.90, occurrences: 10 },
                { name: '안전관리', type: 'safety', confidence: 0.87, occurrences: 7 },
                { name: '품질관리', type: 'quality', confidence: 0.89, occurrences: 9 }
              ],
              sentiment: {
                overall: 'positive',
                score: 0.75,
                details: {
                  positive: 0.65,
                  neutral: 0.25,
                  negative: 0.10
                }
              },
              summary: '데모 문서: 시공사 선정 과정에서 프로젝트 관리와 안전·품질 관리가 강조됩니다.',
              insights: [
                '대우건설의 체계적인 프로젝트 관리 시스템이 돋보임',
                '안전관리와 품질관리의 균형 있는 접근',
                '스마트건설 기술 도입으로 효율성 향상',
                '친환경 건설 방식 채택으로 지속가능성 확보',
                'BIM 기술 활용으로 정밀한 시공 계획 수립'
              ],
              recommendations: [
                'BIM 기술을 활용한 3D 모델링 강화',
                '스마트 안전관리 시스템 도입',
                '친환경 건설 자재 사용 확대',
                '프리캐스트 공법 활용으로 공기 단축',
                '모듈러 건설 방식 검토'
              ],
              categories: [
                '건설업', '부동산개발', '프로젝트관리', '시공관리', '안전관리',
                '품질관리', '대우건설', '스마트건설', '친환경건설', '재건축'
              ],
              tags: [
                '대우건설', '건설업', '프로젝트관리', '시공', '안전관리',
                '품질관리', '스마트건설', 'BIM', '친환경', '재건축',
                '샘플프로젝트', '시공사선정', '체계적관리', '기술혁신'
              ]
            };
            break;
          case '엔티티 인식':
            // 엔티티 인식 결과는 이미 위에서 설정됨
            break;
          case '감정 분석':
            // 감정 분석 결과는 이미 위에서 설정됨
            break;
          case '인사이트 생성':
            analysis.status = 'completed';
            analysis.completedAt = new Date().toISOString();
            break;
        }

        currentStep++;
        setTimeout(processStep, 500 + Math.random() * 1000);
      }
    };

    processStep();
  }

  // 샘플 텍스트 생성
  private generateSampleText(_file: File): string {
    return `데모: 재건축 프로젝트 시공사 선정 관련 문서입니다.

이 문서는 시공사 선정 과정과 관련된 내용을 담고 있습니다(샘플).

주요 내용:
1. 프로젝트 개요
- 프로젝트명: 샘플 재건축
- 시공사: 대우건설
- 위치: 서울특별시 강남구 ○○동 (데모)
- 규모: 약 500세대

2. 시공사 선정 과정
- 공개입찰을 통한 시공사 선정
- 기술력, 경험, 안전관리 능력 평가
- 대우건설의 우수한 실적과 전문성 인정

3. 프로젝트 관리 계획
- 체계적인 프로젝트 관리 시스템 구축
- 안전관리와 품질관리의 균형 있는 접근
- 스마트건설 기술 도입으로 효율성 향상

4. 친환경 건설 방식
- 친환경 건설 자재 사용
- 에너지 효율적인 건축 설계
- 그린빌딩 인증 획득 목표

5. 기술혁신
- BIM 기술을 활용한 3D 모델링
- IoT 센서를 활용한 현장 모니터링
- AI를 활용한 공정 최적화

이 프로젝트는 대우건설의 전문성과 혁신적인 건설 기술을 보여주는 대표적인 사례입니다.`;
  }
}

export default AdvancedFileAnalysisService;
