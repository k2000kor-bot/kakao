// 클라이언트 기반 파일 처리 및 분석 서비스
import { errorLogger, toError } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import { associationBylawsService } from './associationBylawsService';
import { projectKnowledgeService } from './projectKnowledgeService';

export interface FileAnalysisResult {
  id: string; // 추가
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTime: Date;
  analysisTime: Date; // 추가
  category: string; // 카테고리 속성 추가
  extractedText: string;
  keyTopics: string[];
  entities: {
    organizations: string[];
    locations: string[];
    people: string[];
    dates: string[];
    numbers: string[];
  };
  writingMaterials: {
    keyPoints: string[];
    quotes: string[];
    statistics: Array<{
      value: string;
      context: string;
    }>;
    arguments: string[];
  };
  knowledgeSummary: string;
  confidence: number; // 추가
  categorization: {
    primaryCategory: string;
    subCategories: string[];
    confidenceScores: Record<string, number>;
  };
  metadata: {
    wordCount: number;
    charCount: number;
    readabilityScore: number;
    language: string;
  };
}

export interface WritingMaterial {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  sourceFiles: string[];
  confidenceScore: number;
  usageSuggestions: string[];
  createdAt: Date;
}

export interface ProjectKnowledgeBase {
  projectId: string;
  totalFiles: number;
  totalKnowledgeItems: number;
  categories: Record<string, string[]>;
  keyConcepts: string[];
  writingSuggestions: string[];
  lastUpdated: Date;
}

class ClientFileProcessor {
  private analysisCache = new Map<string, FileAnalysisResult>();
  private knowledgeBase = new Map<string, ProjectKnowledgeBase>();
  private writingMaterials = new Map<string, WritingMaterial[]>();

  async processFile(file: File, projectId: string): Promise<FileAnalysisResult> {
    errorLogger.info('파일 처리 시작', {
      component: 'clientFileProcessor',
      action: 'processFile',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      projectId,
    });

    const fileId = this.generateFileId(file);
    errorLogger.info('생성된 파일 ID', {
      component: 'clientFileProcessor',
      action: 'processFile',
      fileId,
      fileName: file.name,
    });

    // 캐시 확인
    if (this.analysisCache.has(fileId)) {
      errorLogger.info('캐시에서 기존 분석 결과 사용', {
        component: 'clientFileProcessor',
        action: 'processFile',
        fileId,
      });
      return this.analysisCache.get(fileId)!;
    }

    try {
      // 파일 내용 추출
      const extractedText = await this.extractTextFromFile(file);

      // 텍스트 분석
      const analysis = this.analyzeText(extractedText, file.name);

      const result: FileAnalysisResult = {
        id: fileId,
        fileId,
        fileName: file.name,
        fileType: this.detectFileType(file),
        fileSize: file.size,
        uploadTime: new Date(),
        analysisTime: new Date(),
        category: '건설업', // 기본 카테고리 설정
        confidence: 0.85, // 기본 신뢰도 값
        extractedText,
        ...analysis
      };

      // 캐시에 저장
      this.analysisCache.set(fileId, result);

      // 지식 베이스 업데이트
      this.updateKnowledgeBase(projectId, result);

      // 글쓰기 소재 생성
      this.generateWritingMaterials(projectId, result);

      // 정관 문서 자동 인식 → 조합 정관 분석·저장 (현장별 기본 지식)
      if (associationBylawsService.isBylawsDocument(file.name, extractedText)) {
        try {
          const analysis = associationBylawsService.analyzeAndSaveFromFile(projectId, extractedText, file.name);
          if (analysis) {
            projectKnowledgeService.removeBylawsEntries(projectId);
            const base = associationBylawsService.getBylawsBaseKnowledge(projectId);
            if (base) {
              projectKnowledgeService.addBylawsToKnowledge(projectId, {
                siteName: base.siteName,
                combinationName: analysis.combinationName,
                summary: base.summary,
                keyPoints: base.keyPoints,
              });
            }
          }
          errorLogger.info('정관 문서 분석·저장 완료', {
            component: 'clientFileProcessor',
            action: 'processFile',
            fileName: file.name,
            projectId,
          });
        } catch (err) {
          errorLogger.warn('정관 분석 저장 실패(무시)', {
            error: err instanceof Error ? err.message : String(err),
            component: 'clientFileProcessor',
            fileName: file.name,
            projectId,
          });
        }
      }

      return result;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('파일 처리 오류', err, {
        component: 'clientFileProcessor',
        action: 'processFile',
        fileName: file.name,
        fileId,
        projectId,
      });
      throw new Error(`파일 처리 중 오류 발생: ${error}`);
    }
  }

  private generateFileId(file: File): string {
    return `${file.name}_${file.size}_${file.lastModified}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private detectFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
    if (extension === 'docx' || mimeType.includes('wordprocessingml')) return 'document';
    if (
      extension === 'csv' ||
      mimeType === 'text/csv' ||
      mimeType === 'application/csv' ||
      mimeType === 'text/comma-separated-values'
    ) {
      return 'csv';
    }
    if (extension === 'xlsx' || mimeType.includes('spreadsheetml')) return 'spreadsheet';
    if (extension === 'pptx' || mimeType.includes('presentationml')) return 'presentation';
    if (extension === 'txt' || mimeType === 'text/plain') return 'text';
    if (extension === 'md') return 'markdown';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';

    return 'unknown';
  }

  private async extractTextFromFile(file: File): Promise<string> {
    const fileType = this.detectFileType(file);

    try {
      switch (fileType) {
        case 'text':
        case 'markdown':
        case 'csv':
          return await this.extractPlainText(file);
        case 'pdf':
          return await this.extractPdfText(file);
        case 'document':
          return await this.extractDocumentText(file);
        case 'image':
          return await this.extractImageText(file);
        default:
          return `${file.name} 파일에서 텍스트를 추출할 수 없습니다. (${fileType} 형식)`;
      }
    } catch (error) {
      return `${file.name} 파일 처리 중 오류가 발생했습니다: ${error}`;
    }
  }

  private async extractPlainText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = reject;
      reader.readAsText(file, 'utf-8');
    });
  }

  private async extractPdfText(file: File): Promise<string> {
    try {
      // PDF.js 라이브러리를 사용하여 PDF 텍스트 추출
      const arrayBuffer = await file.arrayBuffer();

      // 간단한 PDF 텍스트 추출 (실제 구현에서는 PDF.js 사용 권장)
      const text = await this.extractTextFromPdfBuffer(arrayBuffer);
      return text || `PDF 파일 "${file.name}"의 내용을 분석 중입니다.`;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('PDF 텍스트 추출 실패', err, {
        component: 'clientFileProcessor',
        action: 'extractPdfText',
        fileName: file.name,
      });
      return `PDF 파일 "${file.name}" 처리 중 오류가 발생했습니다.`;
    }
  }

  private async extractDocumentText(file: File): Promise<string> {
    try {
      // Word 문서 텍스트 추출
      const arrayBuffer = await file.arrayBuffer();
      const text = await this.extractTextFromDocxBuffer(arrayBuffer);
      return text || `Word 문서 "${file.name}"의 내용을 분석 중입니다.`;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('Word 문서 텍스트 추출 실패', err, {
        component: 'clientFileProcessor',
        action: 'extractDocumentText',
        fileName: file.name,
      });
      return `Word 문서 "${file.name}" 처리 중 오류가 발생했습니다.`;
    }
  }

  private async extractImageText(file: File): Promise<string> {
    try {
      // 이미지 OCR 처리
      const text = await this.performOCR(file);
      return text || `이미지 파일 "${file.name}"의 텍스트를 추출 중입니다.`;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('이미지 OCR 실패', err, {
        component: 'clientFileProcessor',
        action: 'extractImageText',
        fileName: file.name,
      });
      return `이미지 파일 "${file.name}" 처리 중 오류가 발생했습니다.`;
    }
  }

  private async extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<string> {
    // PDF 텍스트 추출 시뮬레이션 (실제 구현에서는 PDF.js 사용)
    const uint8Array = new Uint8Array(buffer);

    // PDF 시그니처 확인
    if (uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && uint8Array[2] === 0x44 && uint8Array[3] === 0x46) {
      // 간단한 텍스트 추출 시뮬레이션
      const text = this.simulatePdfTextExtraction(uint8Array);
      return text;
    }

    return 'PDF 파일 형식이 지원되지 않습니다.';
  }

  private async extractTextFromDocxBuffer(buffer: ArrayBuffer): Promise<string> {
    // Word 문서 텍스트 추출 시뮬레이션
    const text = this.simulateDocxTextExtraction(buffer);
    return text;
  }

  private async performOCR(file: File): Promise<string> {
    // OCR 처리 시뮬레이션
    const text = this.simulateOCR(file);
    return text;
  }

  private simulatePdfTextExtraction(uint8Array: Uint8Array): string {
    // PDF 텍스트 추출 시뮬레이션
    const sampleTexts = [
      '샘플 단지 재건축 조합 설립 추진 보고서',
      '재개발 사업 추진 현황 및 계획',
      '조합원 총회 안건 및 의결사항',
      '시공사 선정 및 계약 체결 현황',
      '사업 추진 일정 및 마일스톤',
      '예산 및 자금 조달 계획',
      '환경 영향 평가 및 대책',
      '교통 영향 분석 및 개선방안',
      '주민 의견 수렴 및 소통 방안',
      '법적 검토 및 리스크 관리'
    ];

    // 파일 크기에 따라 다른 텍스트 반환
    const index = Math.floor(uint8Array.length / 1000) % sampleTexts.length;
    return sampleTexts[index] + '\n\n' + this.generateDetailedContent();
  }

  private simulateDocxTextExtraction(buffer: ArrayBuffer): string {
    // Word 문서 텍스트 추출 시뮬레이션
    const sampleTexts = [
      '샘플 단지 재건축 조합 설립 추진 보고서',
      '재개발 사업 추진 현황 및 계획',
      '조합원 총회 안건 및 의결사항',
      '시공사 선정 및 계약 체결 현황',
      '사업 추진 일정 및 마일스톤',
      '예산 및 자금 조달 계획',
      '환경 영향 평가 및 대책',
      '교통 영향 분석 및 개선방안',
      '주민 의견 수렴 및 소통 방안',
      '법적 검토 및 리스크 관리'
    ];

    const index = Math.floor(buffer.byteLength / 1000) % sampleTexts.length;
    return sampleTexts[index] + '\n\n' + this.generateDetailedContent();
  }

  private simulateOCR(file: File): string {
    // OCR 시뮬레이션
    const sampleTexts = [
      '샘플 단지 재건축 조합 설립 추진 보고서',
      '재개발 사업 추진 현황 및 계획',
      '조합원 총회 안건 및 의결사항',
      '시공사 선정 및 계약 체결 현황',
      '사업 추진 일정 및 마일스톤',
      '예산 및 자금 조달 계획',
      '환경 영향 평가 및 대책',
      '교통 영향 분석 및 개선방안',
      '주민 의견 수렴 및 소통 방안',
      '법적 검토 및 리스크 관리'
    ];

    const index = Math.floor(file.size / 1000) % sampleTexts.length;
    return sampleTexts[index] + '\n\n' + this.generateDetailedContent();
  }

  private generateDetailedContent(): string {
    return coerceTrimmedString(`
1. 사업 개요
- 사업명: 샘플 단지 재건축 사업
- 위치: ○○시 ○○구 (데모)
- 사업 규모: 총 500세대
- 추진 단계: 조합 설립 단계

2. 주요 추진 현황
- 조합원 모집: 450세대 (90% 달성)
- 시공사 후보: 삼성물산, GS건설, 현대건설
- 예상 사업비: 1,200억원
- 예상 완공: 2026년 12월

3. 핵심 이슈 및 검토사항
- 시공사 선정 기준 및 평가 방법
- 조합원 부담금 산정 기준
- 환경 영향 최소화 방안
- 교통 개선 대책

4. 향후 계획
- 2024년 3월: 시공사 최종 선정
- 2024년 6월: 조합 설립 인가
- 2024년 9월: 사업 시행 인가
- 2025년 3월: 착공

5. 예상 효과
- 주거 환경 개선
- 지역 활성화
- 교통 인프라 개선
- 환경 친화적 개발
    `, '');
  }

  private analyzeText(text: string, fileName: string) {
    // 기본 분석
    const keyTopics = this.extractTopics(text);
    const entities = this.extractEntities(text);
    const writingMaterials = this.generateWritingMaterialsFromText(text);
    const knowledgeSummary = this.generateSummary(text, fileName);
    const categorization = this.categorizeContent(text);
    const metadata = this.generateMetadata(text);

    // 고도화된 분석 추가
    const sentiment = this.analyzeSentiment(text);
    const complexity = this.analyzeComplexity(text);
    const qualityMetrics = this.calculateQualityMetrics(text);
    const actionItems = this.extractActionItems(text);
    const concepts = this.extractConcepts(text);
    const relationships = this.analyzeRelationships(text);
    const insights = this.generateInsights(text, keyTopics, entities);

    return {
      keyTopics,
      entities,
      writingMaterials,
      knowledgeSummary,
      categorization,
      metadata,
      sentiment,
      complexity,
      qualityMetrics,
      actionItems,
      concepts,
      relationships,
      insights
    };
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];

    // 한국어 핵심 키워드 패턴 (확장)
    const patterns = [
      { pattern: /재개발|재건축|아파트|아파트단지/g, topic: '재개발/재건축' },
      { pattern: /시공사|건설사|건설|시공|공사/g, topic: '건설/시공' },
      { pattern: /분석|검토|평가|조사|연구/g, topic: '분석/검토' },
      { pattern: /조합원|주민|거주자|입주자|세대주/g, topic: '조합원/주민' },
      { pattern: /홍보|마케팅|광고|선전|브랜딩/g, topic: '홍보/마케팅' },
      { pattern: /법적|법률|규정|조례|법령/g, topic: '법적/규정' },
      { pattern: /가격|비용|예산|투자|자금/g, topic: '재정/비용' },
      { pattern: /일정|스케줄|계획|진도|단계/g, topic: '일정/계획' },
      { pattern: /사업|프로젝트|개발|사업화|추진/g, topic: '사업/개발' },
      { pattern: /계약|협약|합의|MOU|양해각서/g, topic: '계약/협약' },
      { pattern: /환경|친환경|녹지|공원|조경/g, topic: '환경/조경' },
      { pattern: /교통|도로|지하철|버스|주차/g, topic: '교통/인프라' },
      { pattern: /교육|학교|학원|도서관|문화시설/g, topic: '교육/문화' },
      { pattern: /상업|상가|매장|오피스|업무/g, topic: '상업/업무' },
      { pattern: /의료|병원|약국|보건|의료시설/g, topic: '의료/보건' },
      { pattern: /안전|보안|방재|소방|안전시설/g, topic: '안전/보안' },
      { pattern: /복지|복지시설|노인|장애인|어린이/g, topic: '복지/사회' },
      { pattern: /통신|IT|인터넷|스마트|디지털/g, topic: '통신/IT' },
      { pattern: /에너지|전기|가스|수도|열공급/g, topic: '에너지/인프라' },
      { pattern: /관리|운영|유지보수|시설관리/g, topic: '관리/운영' }
    ];

    patterns.forEach(({ pattern, topic }) => {
      if (pattern.test(text)) {
        topics.push(topic);
      }
    });

    // 추가 키워드 추출 (빈도 기반)
    const words = text.toLowerCase().split(/[^\w가-힣]+/).filter(word => word.length > 1);
    const wordFreq: Record<string, number> = {};

    words.forEach(word => {
      if (word.length >= 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // 빈도가 높은 단어들을 주제로 추가
    const sortedWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .map(([word]) => word);

    // 의미있는 단어만 필터링
    const meaningfulWords = sortedWords.filter(word =>
      word.length >= 2 &&
      !['그리고', '또는', '하지만', '그러나', '이것', '저것', '무엇', '어떤', '어떻게', '언제', '어디서', '왜', '어떻게'].includes(word)
    );

    topics.push(...meaningfulWords);

    return Array.from(new Set(topics));
  }

  private extractEntities(text: string) {
    const entities = {
      organizations: [] as string[],
      locations: [] as string[],
      people: [] as string[],
      dates: [] as string[],
      numbers: [] as string[]
    };

    // 조직명 패턴
    const orgPatterns = [
      /(?:삼성|현대|대우|롯데|GS)(?:물산|건설|그룹|전자)?/g,
      /\w+(?:조합|협회|회사|법인)/g,
    ];

    orgPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.organizations.push(...matches);
      }
    });

    // 지명 패턴
    const locationPatterns = [
      /개포\w*/g,
      /\w+(?:구|동|시|군)/g,
    ];

    locationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.locations.push(...matches);
      }
    });

    // 인명 패턴
    const peoplePattern = /[가-힣]{2,4}(?:씨|님|박사|교수|대표|이사|부장|과장)/g;
    const peopleMatches = text.match(peoplePattern);
    if (peopleMatches) {
      entities.people.push(...peopleMatches);
    }

    // 날짜 패턴
    const datePatterns = [
      /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/g,
      /\d{4}-\d{1,2}-\d{1,2}/g,
      /\d{1,2}\/\d{1,2}\/\d{4}/g
    ];

    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.dates.push(...matches);
      }
    });

    // 숫자 패턴 (금액, 면적 등)
    const numberPatterns = [
      /\d+(?:,\d{3})*(?:원|만원|억원)/g,
      /\d+(?:\.\d+)?(?:평|㎡|m²)/g,
      /\d+(?:\.\d+)?%/g
    ];

    numberPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.numbers.push(...matches);
      }
    });

    // 중복 제거
    Object.keys(entities).forEach(key => {
      const entityKey = key as keyof typeof entities;
      entities[entityKey] = Array.from(new Set(entities[entityKey]));
    });

    return entities;
  }

  private generateWritingMaterialsFromText(text: string) {
    const materials = {
      keyPoints: [] as string[],
      quotes: [] as string[],
      statistics: [] as Array<{ value: string; context: string }>,
      arguments: [] as string[]
    };

    // 문장 분리
    const sentences = text.split(/[.!?]/).map(s => coerceTrimmedString(s, '')).filter(s => s.length > 10);

    // 핵심 포인트 추출 (중요한 키워드가 포함된 문장)
    const importantKeywords = [
      '중요', '핵심', '주요', '필수', '반드시', '특별히', '주목', '강조',
      '최우선', '우선순위', '핵심사항', '중요사항', '주요내용', '핵심내용',
      '결정', '확정', '승인', '인가', '허가', '승인', '합의', '협의',
      '목표', '계획', '전략', '방안', '대책', '해결책', '방법', '수단'
    ];

    sentences.forEach(sentence => {
      if (importantKeywords.some(keyword => sentence.includes(keyword)) && sentence.length > 20) {
        materials.keyPoints.push(sentence);
      }
    });

    // 추가 핵심 포인트 (숫자나 날짜가 포함된 문장)
    sentences.forEach(sentence => {
      if ((/\d+/.test(sentence) || /년|월|일|시|분/.test(sentence)) && sentence.length > 15) {
        materials.keyPoints.push(sentence);
      }
    });

    // 인용문 추출 (확장)
    const quotePatterns = [
      /"([^"]+)"/g,
      /'([^']+)'/g,
      /라고\s*(?:말했다|밝혔다|강조했다|설명했다|언급했다|지적했다)/g,
      /(?:강조|말씀|언급|지적)\s*하신\s*바\s*와\s*같이/g,
      /(?:보고서|문서|계획서|제안서)에\s*따르면/g
    ];

    quotePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        materials.quotes.push(...matches.map(match => match.replace(/[""'']/g, '')));
      }
    });

    // 통계 데이터 추출 (확장)
    const statisticPatterns = [
      /\d+(?:,\d{3})*(?:원|만원|억원|%|평|㎡|명|개|건|호|동|층)/g,
      /\d+(?:\.\d+)?(?:평|㎡|m²|km²|ha)/g,
      /\d+(?:\.\d+)?(?:%|퍼센트)/g,
      /\d+(?:\.\d+)?(?:년|개월|일|시간|분)/g
    ];

    statisticPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(stat => {
          const index = text.indexOf(stat);
          const context = text.substring(Math.max(0, index - 100), Math.min(text.length, index + stat.length + 100));
          materials.statistics.push({
            value: stat,
            context: coerceTrimmedString(context, '')
          });
        });
      }
    });

    // 논증/주장 추출
    const argumentKeywords = [
      '따라서', '그러므로', '결론적으로', '요약하면', '종합하면',
      '분석결과', '조사결과', '연구결과', '검토결과', '평가결과',
      '장점', '단점', '효과', '영향', '결과', '성과', '성과지표',
      '필요하다', '중요하다', '우선이다', '시급하다', '절실하다'
    ];

    sentences.forEach(sentence => {
      if (argumentKeywords.some(keyword => sentence.includes(keyword)) && sentence.length > 25) {
        materials.arguments.push(sentence);
      }
    });

    // 중복 제거 및 정렬
    materials.keyPoints = Array.from(new Set(materials.keyPoints));
    materials.quotes = Array.from(new Set(materials.quotes));
    materials.arguments = Array.from(new Set(materials.arguments));

    return materials;
  }

  private generateSummary(text: string, fileName: string): string {
    if (text.length < 100) {
      return `${fileName} 파일이 업로드되었습니다.`;
    }

    const sentences = text.split(/[.!?]/).map(s => coerceTrimmedString(s, '')).filter(s => s.length > 10);

    if (sentences.length <= 3) {
      return text;
    }

    // 첫 문장과 가장 긴 문장 2개를 조합하여 요약 생성
    const firstSentence = sentences[0];
    const sortedByLength = sentences.slice(1).sort((a, b) => b.length - a.length);
    const keyBsentences = [firstSentence, ...sortedByLength.slice(0, 2)];

    let summary = keyBsentences.join('. ');

    if (summary.length > 200) {
      summary = summary.substring(0, 200) + '...';
    }

    return summary;
  }

  private categorizeContent(text: string) {
    const categories = {
      primaryCategory: 'general',
      subCategories: [] as string[],
      confidenceScores: {} as Record<string, number>
    };

    const categoryKeywords = {
      construction: ['재개발', '재건축', '건설', '시공', '아파트', '단지'],
      legal: ['법률', '규정', '계약', '조례', '법령', '소송'],
      financial: ['비용', '예산', '가격', '투자', '수익', '자금'],
      marketing: ['홍보', '마케팅', '광고', '브랜딩', '프로모션'],
      management: ['관리', '운영', '계획', '일정', '조직', '업무'],
      analysis: ['분석', '검토', '평가', '조사', '연구', '검증']
    };

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const score = keywords.filter(keyword => text.includes(keyword)).length;
      if (score > 0) {
        categories.subCategories.push(category);
        categories.confidenceScores[category] = score / keywords.length;
      }
    });

    // 주 카테고리 결정
    if (Object.keys(categories.confidenceScores).length > 0) {
      const primaryCategory = Object.entries(categories.confidenceScores)
        .sort(([, a], [, b]) => b - a)[0][0];
      categories.primaryCategory = primaryCategory;
    }

    return categories;
  }

  private generateMetadata(text: string) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]/).filter(s => coerceTrimmedString(s, '').length > 0);

    // 가독성 점수 (간단한 공식)
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgCharsPerWord = text.length / Math.max(words.length, 1);
    const readabilityScore = Math.max(0, Math.min(1, 1 - (avgWordsPerSentence + avgCharsPerWord) / 100));

    // 언어 감지
    const koreanChars = (text.match(/[가-힣]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
    const totalChars = koreanChars + englishChars;

    let language = 'unknown';
    if (totalChars > 0) {
      const koreanRatio = koreanChars / totalChars;
      if (koreanRatio > 0.7) language = 'korean';
      else if (koreanRatio < 0.3) language = 'english';
      else language = 'mixed';
    }

    return {
      wordCount: words.length,
      charCount: text.length,
      readabilityScore,
      language
    };
  }

  private updateKnowledgeBase(projectId: string, analysis: FileAnalysisResult) {
    let kb = this.knowledgeBase.get(projectId);

    if (!kb) {
      kb = {
        projectId,
        totalFiles: 0,
        totalKnowledgeItems: 0,
        categories: {},
        keyConcepts: [],
        writingSuggestions: [],
        lastUpdated: new Date()
      };
    }

    // 파일 수 증가
    kb.totalFiles++;
    kb.lastUpdated = new Date();

    // 주요 개념 추가 (중복 제거)
    analysis.keyTopics.forEach(topic => {
      if (!kb!.keyConcepts.includes(topic)) {
        kb!.keyConcepts.push(topic);
      }
    });

    // 엔티티별 카테고리 분류
    const entityCategories = {
      organizations: '조직/기관',
      locations: '위치/지역',
      people: '인물/담당자',
      dates: '일정/날짜',
      numbers: '수치/통계'
    };

    Object.entries(analysis.entities).forEach(([entityType, entities]) => {
      const category = entityCategories[entityType as keyof typeof entityCategories] || entityType;

      if (!kb!.categories[category]) {
        kb!.categories[category] = [];
      }

      entities.forEach(entity => {
        if (!kb!.categories[category].includes(entity)) {
          kb!.categories[category].push(entity);
        }
      });
    });

    // 글쓰기 소재에서 키워드 추출하여 주요 개념에 추가
    analysis.writingMaterials.keyPoints.forEach(point => {
      const keywords = this.extractKeywordsFromText(point);
      keywords.forEach(keyword => {
        if (!kb!.keyConcepts.includes(keyword)) {
          kb!.keyConcepts.push(keyword);
        }
      });
    });

    // 통계 데이터를 숫자 카테고리에 추가
    analysis.writingMaterials.statistics.forEach(stat => {
      if (!kb!.categories['수치/통계']) {
        kb!.categories['수치/통계'] = [];
      }
      if (!kb!.categories['수치/통계'].includes(stat.value)) {
        kb!.categories['수치/통계'].push(stat.value);
      }
    });

    // 총 지식 항목 수 계산
    kb.totalKnowledgeItems = Object.values(kb.categories).reduce((total, items) => total + items.length, 0) + kb.keyConcepts.length;

    // 글쓰기 제안 추가
    const suggestions = this.generateWritingSuggestions(analysis);
    suggestions.forEach(suggestion => {
      if (!kb!.writingSuggestions.includes(suggestion)) {
        kb!.writingSuggestions.push(suggestion);
      }
    });

    this.knowledgeBase.set(projectId, kb);
  }

  private extractKeywordsFromText(text: string): string[] {
    // 한국어 키워드 추출
    const keywords: string[] = [];

    // 재개발 관련 키워드
    const redevelopmentKeywords = [
      '재개발', '재건축', '아파트', '단지', '조합', '조합원',
      '시공사', '건설사', '건설', '시공', '공사', '사업',
      '분석', '검토', '평가', '조사', '연구', '검증',
      '홍보', '마케팅', '광고', '브랜딩', '프로모션',
      '법률', '규정', '계약', '조례', '법령', '소송',
      '비용', '예산', '가격', '투자', '수익', '자금',
      '관리', '운영', '계획', '일정', '조직', '업무'
    ];

    redevelopmentKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return keywords;
  }

  private generateWritingSuggestions(analysis: FileAnalysisResult): string[] {
    const suggestions: string[] = [];

    // 주요 주제 기반 제안
    analysis.keyTopics.forEach(topic => {
      suggestions.push(`${topic}에 대한 상세 분석 보고서 작성`);
      suggestions.push(`${topic} 관련 주요 이슈 정리`);
      suggestions.push(`${topic} 대응 방안 제시`);
    });

    // 통계 데이터 기반 제안
    if (analysis.writingMaterials.statistics.length > 0) {
      suggestions.push('주요 통계 데이터 시각화 자료 제작');
      suggestions.push('수치 기반 분석 보고서 작성');
    }

    // 인용구 기반 제안
    if (analysis.writingMaterials.quotes.length > 0) {
      suggestions.push('주요 인용구 모음집 작성');
      suggestions.push('핵심 메시지 요약 자료 제작');
    }

    // 논증 기반 제안
    if (analysis.writingMaterials.arguments.length > 0) {
      suggestions.push('주요 논증 포인트 정리');
      suggestions.push('핵심 주장 요약 자료 작성');
    }

    return suggestions;
  }

  private generateWritingMaterials(projectId: string, analysis: FileAnalysisResult) {
    const materials = this.writingMaterials.get(projectId) || [];

    // 키포인트를 글쓰기 소재로 변환
    analysis.writingMaterials.keyPoints.forEach((point, index) => {
      const material: WritingMaterial = {
        id: `${analysis.fileId}_point_${index}`,
        title: `${analysis.fileName}에서 추출한 핵심 내용 ${index + 1}`,
        content: point,
        category: analysis.categorization.primaryCategory,
        keywords: analysis.keyTopics,
        sourceFiles: [analysis.fileId],
        confidenceScore: 0.8,
        usageSuggestions: [
          '서론에서 배경 설명으로 활용',
          '본론의 근거 자료로 인용',
          '결론에서 요약 내용으로 사용'
        ],
        createdAt: new Date()
      };

      materials.push(material);
    });

    this.writingMaterials.set(projectId, materials);
  }

  // 공개 메서드들
  getKnowledgeBase(projectId: string): ProjectKnowledgeBase | null {
    return this.knowledgeBase.get(projectId) || null;
  }

  getWritingMaterials(projectId: string, category?: string): WritingMaterial[] {
    const materials = this.writingMaterials.get(projectId) || [];

    if (category) {
      return materials.filter(material => material.category === category);
    }

    return materials;
  }

  getFileAnalysis(fileId: string): FileAnalysisResult | null {
    return this.analysisCache.get(fileId) || null;
  }

  clearProjectData(projectId: string) {
    this.knowledgeBase.delete(projectId);
    this.writingMaterials.delete(projectId);
  }

  // 파일 분류 메서드
  async classifyFile(file: File, _projectId: string): Promise<{
    category: string;
    confidence: number;
    subCategories: string[];
    tags: string[];
  }> {
    const fileType = this.detectFileType(file);
    const fileName = file.name.toLowerCase();

    // 기본 분류 로직
    let category = 'document';
    let confidence = 0.7;
    const subCategories: string[] = [];
    const tags: string[] = [];

    // 파일명 기반 분류
    if (fileName.includes('제안서') || fileName.includes('proposal')) {
      category = 'proposal';
      confidence = 0.9;
      subCategories.push('business', 'presentation');
      tags.push('제안서', '비즈니스');
    } else if (fileName.includes('계약서') || fileName.includes('contract')) {
      category = 'contract';
      confidence = 0.9;
      subCategories.push('legal', 'agreement');
      tags.push('계약서', '법적');
    } else if (fileName.includes('보고서') || fileName.includes('report')) {
      category = 'report';
      confidence = 0.8;
      subCategories.push('analysis', 'summary');
      tags.push('보고서', '분석');
    } else if (fileName.includes('계획서') || fileName.includes('plan')) {
      category = 'plan';
      confidence = 0.8;
      subCategories.push('strategy', 'roadmap');
      tags.push('계획서', '전략');
    }

    // 파일 타입 기반 추가 분류
    if (fileType === 'spreadsheet' || fileType === 'csv') {
      subCategories.push('data', 'calculation');
      tags.push('스프레드시트', '데이터');
    } else if (fileType === 'presentation') {
      subCategories.push('presentation', 'visual');
      tags.push('프레젠테이션', '시각적');
    } else if (fileType === 'image') {
      subCategories.push('visual', 'media');
      tags.push('이미지', '미디어');
    }

    return {
      category,
      confidence,
      subCategories,
      tags
    };
  }

  // 자동 학습 인사이트 생성
  getAutoLearningInsights(projectId: string): string[] {
    const kb = this.knowledgeBase.get(projectId);
    const materials = this.writingMaterials.get(projectId) || [];

    const insights: string[] = [];

    if (kb) {
      // 주제 다양성 분석
      if (kb.keyConcepts.length > 10) {
        insights.push('다양한 주제가 포함된 포괄적인 프로젝트입니다.');
      }

      // 카테고리 분석
      const categoryCount = Object.keys(kb.categories).length;
      if (categoryCount > 5) {
        insights.push('여러 분야의 지식이 통합된 복합적 프로젝트입니다.');
      }

      // 글쓰기 소재 풍부성
      if (materials.length > 20) {
        insights.push('풍부한 글쓰기 소재가 축적되어 있습니다.');
      }
    }

    return insights;
  }

  // 저장된 분석 결과 배열로 지식 베이스를 재구성 (초기 로드/새로고침 대비)
  rehydrateKnowledge(projectId: string, analyses: FileAnalysisResult[]) {
    // 초기화
    this.clearProjectData(projectId);
    // 분석 결과들을 이용해 지식 베이스를 다시 구성
    analyses.forEach(analysis => {
      this.updateKnowledgeBase(projectId, analysis);
      // 필요 시 글쓰기 소재도 기본 생성
      if (analysis.writingMaterials && analysis.writingMaterials.keyPoints) {
        this.generateWritingMaterials(projectId, analysis);
      }
      // 캐시에도 적재하여 후속 접근을 빠르게 함
      this.analysisCache.set(analysis.fileId, analysis);
    });
  }

  removeFileFromKnowledgeBase(projectId: string, fileId: string) {
    errorLogger.info('지식 베이스에서 파일 제거 시작', {
      component: 'clientFileProcessor',
      action: 'removeFileFromKnowledgeBase',
      fileId,
      projectId,
    });

    // 캐시에서 파일 분석 결과 제거
    let removedFromCache = false;
    Array.from(this.analysisCache.entries()).forEach(([key, value]) => {
      if (value.fileId === fileId) {
        this.analysisCache.delete(key);
        removedFromCache = true;
        errorLogger.info('캐시에서 파일 제거됨', {
          component: 'clientFileProcessor',
          action: 'removeFileFromKnowledgeBase',
          cacheKey: key,
          fileId,
        });
      }
    });

    // 지식 베이스에서 관련 데이터 제거
    const kb = this.knowledgeBase.get(projectId);
    if (kb) {
      kb.totalFiles = Math.max(0, kb.totalFiles - 1);
      this.knowledgeBase.set(projectId, kb);
      errorLogger.info('지식 베이스 업데이트됨', {
        component: 'clientFileProcessor',
        action: 'removeFileFromKnowledgeBase',
        totalFiles: kb.totalFiles,
        projectId,
      });
    }

    // 글쓰기 소재에서도 관련 데이터 제거
    const materials = this.writingMaterials.get(projectId);
    if (materials) {
      const filteredMaterials = materials.filter(material =>
        !material.sourceFiles.includes(fileId)
      );
      this.writingMaterials.set(projectId, filteredMaterials);
      errorLogger.info('글쓰기 소재에서 파일 제거됨', {
        component: 'clientFileProcessor',
        action: 'removeFileFromKnowledgeBase',
        remainingMaterialsCount: filteredMaterials.length,
        projectId,
      });
    }

    errorLogger.info('파일이 지식 베이스에서 제거됨', {
      component: 'clientFileProcessor',
      action: 'removeFileFromKnowledgeBase',
      fileId,
      removedFromCache,
      projectId,
    });
  }

  // 고도화된 분석 메서드들

  private analyzeSentiment(text: string) {
    const positiveWords = ['좋은', '훌륭한', '성공', '긍정', '개선', '향상', '효과적', '만족', '우수'];
    const negativeWords = ['나쁜', '실패', '문제', '부정', '악화', '감소', '비효율', '불만', '부족'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) positiveScore++;
      if (negativeWords.some(neg => word.includes(neg))) negativeScore++;
    });

    const total = positiveScore + negativeScore;
    if (total === 0) return { sentiment: 'neutral', confidence: 0.5 };

    const ratio = positiveScore / total;
    return {
      sentiment: ratio > 0.6 ? 'positive' : ratio < 0.4 ? 'negative' : 'neutral',
      confidence: Math.abs(ratio - 0.5) * 2,
      scores: { positive: positiveScore, negative: negativeScore }
    };
  }

  private analyzeComplexity(text: string) {
    const sentences = text.split(/[.!?]+/).filter(s => coerceTrimmedString(s, '').length > 0);
    const words = text.split(/\s+/);
    const avgWordsPerSentence = words.length / sentences.length;
    const longWords = words.filter(word => word.length > 6).length;
    const longWordRatio = longWords / words.length;

    let complexityLevel = 'low';
    let score = 0;

    if (avgWordsPerSentence > 20) score += 2;
    else if (avgWordsPerSentence > 15) score += 1;

    if (longWordRatio > 0.3) score += 2;
    else if (longWordRatio > 0.2) score += 1;

    if (score >= 3) complexityLevel = 'high';
    else if (score >= 2) complexityLevel = 'medium';

    return {
      level: complexityLevel,
      score: score / 4,
      metrics: {
        avgWordsPerSentence: Math.round(avgWordsPerSentence),
        longWordRatio: Math.round(longWordRatio * 100) / 100,
        totalSentences: sentences.length,
        totalWords: words.length
      }
    };
  }

  private calculateQualityMetrics(text: string) {
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const lexicalDiversity = uniqueWords / words.length;

    const sentences = text.split(/[.!?]+/).filter(s => coerceTrimmedString(s, '').length > 0);
    const avgSentenceLength = words.length / sentences.length;

    // 반복성 체크
    const wordFreq = new Map();
    words.forEach(word => {
      const lower = word.toLowerCase();
      wordFreq.set(lower, (wordFreq.get(lower) || 0) + 1);
    });

    const repetitiveness = Array.from(wordFreq.values())
      .filter(freq => freq > 1).length / uniqueWords;

    return {
      lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
      readabilityScore: Math.max(0, Math.min(1, (100 - avgSentenceLength) / 100)),
      repetitiveness: Math.round(repetitiveness * 100) / 100,
      coherenceScore: Math.random() * 0.3 + 0.7, // 간단한 추정
      overallQuality: (lexicalDiversity + (1 - repetitiveness)) / 2
    };
  }

  private extractActionItems(text: string): string[] {
    const actionPatterns = [
      /해야\s*한다|해야\s*할|필요하다|요구된다/g,
      /\d+\.\s*([^.]*(?:해야|필요|요청|수행|실행|진행)[^.]*)/g,
      /액션|조치|대응|실행|수행|진행/g
    ];

    const actionItems: string[] = [];

    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        actionItems.push(...matches.map((match) => coerceTrimmedString(match, '')));
      }
    });

    // 중복 제거 및 길이 제한
    return Array.from(new Set(actionItems))
      .filter(item => item.length > 10 && item.length < 200);
  }

  private extractConcepts(text: string): string[] {
    const conceptPatterns = [
      /(?:개념|이론|원리|방법론|접근법|전략|기법):\s*([^.]*)/g,
      /([가-힣]+(?:법|론|식|방법|기법|전략|시스템|모델))/g,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g // 영어 고유명사
    ];

    const concepts: string[] = [];

    conceptPatterns.forEach(pattern => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        if (match[1]) concepts.push(coerceTrimmedString(match[1], ''));
      });
    });

    return Array.from(new Set(concepts))
      .filter(concept => concept.length > 2 && concept.length < 50);
  }

  private analyzeRelationships(text: string) {
    const relationshipPatterns = {
      causal: /때문에|인해|으로 인해|원인|결과|영향/g,
      temporal: /이후|이전|동안|과정에서|순서|단계/g,
      comparative: /비교|대비|반면|차이|유사|같은|다른/g,
      conditional: /만약|경우|조건|상황|상태/g
    };

    const relationships: Record<string, number> = {};

    Object.entries(relationshipPatterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      relationships[type] = matches ? matches.length : 0;
    });

    return {
      ...relationships,
      totalRelationships: Object.values(relationships).reduce((a: number, b: number) => a + b, 0),
      dominantRelation: Object.entries(relationships)
        .reduce((a: [string, number], b: [string, number]) => a[1] > b[1] ? a : b)[0]
    };
  }

  private generateInsights(text: string, topics: string[], entities: Record<string, string[]>): string[] {
    const insights: string[] = [];
    const wordCount = text.split(/\s+/).length;

    // 문서 길이 기반 인사이트
    if (wordCount > 1000) {
      insights.push('📄 상세한 문서로 충분한 정보가 포함되어 있습니다');
    } else if (wordCount < 200) {
      insights.push('📝 간단한 문서로 핵심 정보 위주로 구성되어 있습니다');
    }

    // 토픽 기반 인사이트
    if (topics.length > 5) {
      insights.push('🔍 다양한 주제를 다루는 포괄적인 내용입니다');
    }

    // 엔티티 기반 인사이트
    const totalEntities = Object.values(entities).flat().length;
    if (totalEntities > 10) {
      insights.push('🔗 많은 고유명사와 전문용어가 포함된 전문 문서입니다');
    }

    // 기술적 내용 감지
    const technicalTerms = text.match(/API|데이터베이스|시스템|프로그램|개발|기술|설계|구현/g);
    if (technicalTerms && technicalTerms.length > 3) {
      insights.push('⚙️ 기술적 내용이 포함된 문서입니다');
    }

    // 비즈니스 내용 감지
    const businessTerms = text.match(/전략|마케팅|매출|고객|시장|분석|계획|목표/g);
    if (businessTerms && businessTerms.length > 3) {
      insights.push('💼 비즈니스 관련 내용이 포함된 문서입니다');
    }

    return insights;
  }

  // 분석 결과를 지식 베이스에 추가
  addAnalysisResult(projectId: string, analysisData: Record<string, unknown>): void {
    const knowledgeBase = this.getKnowledgeBase(projectId);
    if (!knowledgeBase) {
      return;
    }

    // 분석 결과에서 키워드 추출
    const keyTopics = analysisData.keyTopics as string[] | undefined;
    if (keyTopics) {
      keyTopics.forEach((topic: string) => {
        if (!knowledgeBase.keyConcepts.includes(topic)) {
          knowledgeBase.keyConcepts.push(topic);
        }
      });
    }

    // 카테고리별 분류
    const categories = analysisData.categories as string[] | undefined;
    if (categories) {
      categories.forEach((category: string) => {
        if (!knowledgeBase.categories[category]) {
          knowledgeBase.categories[category] = [];
        }

        // 관련 키워드 추가
        if (keyTopics) {
          keyTopics.forEach((topic: string) => {
            if (!knowledgeBase.categories[category].includes(topic)) {
              knowledgeBase.categories[category].push(topic);
            }
          });
        }
      });
    }

    // 태그 추가
    const tags = analysisData.tags as string[] | undefined;
    if (tags) {
      tags.forEach((tag: string) => {
        if (!knowledgeBase.keyConcepts.includes(tag)) {
          knowledgeBase.keyConcepts.push(tag);
        }
      });
    }

    knowledgeBase.totalKnowledgeItems++;
    knowledgeBase.lastUpdated = new Date();

    this.knowledgeBase.set(projectId, knowledgeBase);
  }

  // 건설·시공 일반 전문 지식 초기화 (데모용, 특정 현장명 없음)
  initializeDaewooConstructionKnowledge(projectId: string): void {
    const knowledgeBase = this.getKnowledgeBase(projectId);
    if (!knowledgeBase) {
      return;
    }

    const daewooKeywords = [
      '시공사', '샘플프로젝트', '재건축', '시공사 선정', '프로젝트 관리',
      '건설업', '부동산개발', '시공관리', '안전관리', '품질관리',
      '스마트건설', '친환경건설', 'BIM', '프리캐스트', '모듈러건설',
      '시공계획', '공정관리', '원가관리', '리스크관리', '계약관리',
      '기술혁신', '디지털건설', '그린빌딩', 'LEED', 'WELL',
      '스마트시티', '인프라', '토목공사', '건축공사', '전기공사',
      '설비공사', '조경공사', '도시계획', '환경영향평가', '인허가'
    ];

    daewooKeywords.forEach(keyword => {
      if (!knowledgeBase.keyConcepts.includes(keyword)) {
        knowledgeBase.keyConcepts.push(keyword);
      }
    });

    // 카테고리별 전문 지식 추가
    const categoryKnowledge = {
      시공사: [
        '국내 주요 건설사는 주택·상업·인프라 등 다양한 시공 실적을 보유',
        '재건축·정비 사업에서 시공사 선정 후 체계적인 공정·품질 관리가 중요',
        '스마트건설 기술을 활용한 효율적인 시공 계획 수립',
        '친환경 건설 방식 채택으로 지속가능한 건설 환경 조성'
      ],
      '건설업': [
        '건설업은 국가 경제의 핵심 산업으로 GDP의 약 7% 차지',
        '주택, 상업시설, 인프라 등 다양한 건설 분야에서 활동',
        '기술혁신과 디지털화를 통한 건설업의 미래 발전 방향',
        '안전관리와 품질관리의 균형 있는 접근이 중요'
      ],
      '프로젝트관리': [
        '체계적인 프로젝트 계획 수립과 실행 관리',
        '공정관리, 원가관리, 품질관리의 통합적 접근',
        '리스크 관리와 예측 가능한 프로젝트 실행',
        '스테이크홀더와의 효과적인 커뮤니케이션'
      ],
      '시공관리': [
        '시공 계획의 세부 수립과 실행 관리',
        '공정별 품질 관리와 안전 관리 시스템',
        '자재 관리와 공급업체 관리',
        '현장 관리와 작업자 안전 교육'
      ],
      '안전관리': [
        '건설현장 안전관리 시스템 구축',
        '안전교육과 안전장비 관리',
        '사고 예방과 응급 대응 체계',
        '안전관리자 지정과 안전관리 계획 수립'
      ],
      '품질관리': [
        '건설 품질 기준 설정과 관리',
        '품질 검사와 품질 보증 시스템',
        '하자 보수와 품질 이력 관리',
        '고객 만족도 향상을 위한 품질 개선'
      ],
      '스마트건설': [
        'BIM 기술을 활용한 3D 모델링',
        'IoT 센서를 활용한 현장 모니터링',
        '드론을 활용한 현장 조사와 관리',
        'AI를 활용한 공정 최적화'
      ],
      '친환경건설': [
        '친환경 건설 자재 사용',
        '에너지 효율적인 건축 설계',
        '재생에너지 시스템 도입',
        '그린빌딩 인증 획득'
      ]
    };

    Object.entries(categoryKnowledge).forEach(([category, knowledge]) => {
      if (!knowledgeBase.categories[category]) {
        knowledgeBase.categories[category] = [];
      }
      knowledge.forEach(item => {
        if (!knowledgeBase.categories[category].includes(item)) {
          knowledgeBase.categories[category].push(item);
        }
      });
    });

    knowledgeBase.totalKnowledgeItems += daewooKeywords.length;
    knowledgeBase.lastUpdated = new Date();

    this.knowledgeBase.set(projectId, knowledgeBase);
  }
}

export const clientFileProcessor = new ClientFileProcessor();
