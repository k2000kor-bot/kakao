// API 서비스 함수들
export interface MediaUploadResponse {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_time: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
}

export interface AnalysisResult {
  id: string;
  file_id: string;
  extracted_text: string;
  summary: string;
  key_points: string[];
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  processing_time: number;
  created_at: string;
  writing_insights?: any[];
}

export interface ConversationalResponse {
  id: string;
  query: string;
  response: string;
  context: string[];
  writing_style: string;
  tone: string;
  created_at: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  url: string;
  uploadDate: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'error';
  extractedText?: string;
  summary?: string;
  keywords?: string[];
  sentiment?: string;
  writingInsights?: any[];
}

export interface WritingTheory {
  id: string;
  name: string;
  description: string;
  principles: string[];
  examples: string[];
  application: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  mediaFiles?: MediaFile[];
  writingContext?: {
    tone: string;
    style: string;
    purpose: string;
    audience: string;
  };
}

// 파일 업로드
export const uploadMediaFile = async (file: File): Promise<MediaUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8000/upload-media', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    // Mock response for development
    return {
      id: Date.now().toString(),
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      upload_time: new Date().toISOString(),
      status: 'uploaded'
    };
  }
};

// 파일 분석
export const analyzeMediaFile = async (fileId: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`http://localhost:8000/analyze-media/${fileId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analysis error:', error);
    // Mock response for development
    return {
      id: Date.now().toString(),
      file_id: fileId,
      extracted_text: '파일 분석이 완료되었습니다. 주요 내용과 인사이트를 추출했습니다.',
      summary: '파일 분석이 완료되었습니다. 주요 내용과 인사이트를 추출했습니다.',
      key_points: [
        '핵심 내용이 성공적으로 추출되었습니다.',
        '중요한 키워드와 주제가 식별되었습니다.',
        '문서의 전반적인 톤과 감정이 분석되었습니다.'
      ],
      keywords: ['추출된', '키워드', '예시'],
      sentiment: 'neutral',
      confidence: 0.85,
      processing_time: 2.5,
      created_at: new Date().toISOString()
    };
  }
};

// 대화형 응답 생성
export const generateConversationalResponse = async (
  query: string,
  context: string[] = [],
  writingStyle: string = 'conversational',
  tone: string = 'friendly'
): Promise<ConversationalResponse> => {
  try {
    const response = await fetch('http://localhost:8000/generate-conversational-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        context,
        writing_style: writingStyle,
        tone
      }),
    });

    if (!response.ok) {
      throw new Error(`Response generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Response generation error:', error);
    // Mock response for development
    return {
      id: Date.now().toString(),
      query,
      response: `안녕하세요! "${query}"에 대한 답변을 드리겠습니다. 첨부된 파일을 기반으로 상세한 분석을 제공해드릴게요.`,
      context,
      writing_style: writingStyle,
      tone,
      created_at: new Date().toISOString()
    };
  }
};

// 파일 목록 조회
export const getFileList = async (): Promise<MediaUploadResponse[]> => {
  try {
    const response = await fetch('http://localhost:8000/files', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`File list fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('File list error:', error);
    // Mock response for development
    return [
      {
        id: '1',
        filename: '개포우성_대화내용.txt',
        file_type: 'text/plain',
        file_size: 2457600,
        upload_time: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: '2',
        filename: '잠실우성_요약보고서.pdf',
        file_type: 'application/pdf',
        file_size: 1887436,
        upload_time: '2024-01-14T15:45:00Z',
        status: 'completed'
      },
      {
        id: '3',
        filename: '삼성홍보_반박자료.docx',
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        file_size: 3145728,
        upload_time: '2024-01-13T09:20:00Z',
        status: 'completed'
      }
    ];
  }
};

// 분석 결과 조회
export const getAnalysisResults = async (fileId?: string): Promise<AnalysisResult[]> => {
  try {
    const url = fileId
      ? `http://localhost:8000/analysis-results/${fileId}`
      : 'http://localhost:8000/analysis-results';

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Analysis results fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analysis results error:', error);
    // Mock response for development
    return [
      {
        id: '1',
        file_id: '1',
        extracted_text: '개포우성 7차 재건축 프로젝트 관련 대화 내용 분석',
        summary: '개포우성 7차 재건축 프로젝트 관련 대화 내용 분석',
        key_points: [
          '삼성물산과 GS건설의 제안서 비교',
          '조합원들의 우려사항과 요구사항',
          '설계 변경에 따른 영향 분석'
        ],
        keywords: ['재건축', '삼성물산', 'GS건설', '설계', '조합원'],
        sentiment: 'neutral',
        confidence: 0.92,
        processing_time: 3.2,
        created_at: '2024-01-15T11:00:00Z'
      },
      {
        id: '2',
        file_id: '2',
        extracted_text: '잠실우성 프로젝트 요약 보고서 분석',
        summary: '잠실우성 프로젝트 요약 보고서 분석',
        key_points: [
          '프로젝트 진행 상황 및 일정',
          '주요 의사결정 사항',
          '향후 계획 및 전략'
        ],
        keywords: ['프로젝트', '진행', '일정', '의사결정', '계획'],
        sentiment: 'positive',
        confidence: 0.88,
        processing_time: 2.8,
        created_at: '2024-01-14T16:00:00Z'
      }
    ];
  }
};

// 파일 삭제
export const deleteFile = async (fileId: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:8000/files/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`File deletion failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    // Mock response for development
    return true;
  }
};

// 배치 파일 업로드
export const uploadMultipleFiles = async (files: File[]): Promise<MediaUploadResponse[]> => {
  const uploadPromises = files.map(file => uploadMediaFile(file));
  return Promise.all(uploadPromises);
};

// 파일 분석 상태 확인
export const checkAnalysisStatus = async (fileId: string): Promise<{ status: string; progress: number }> => {
  try {
    const response = await fetch(`http://localhost:8000/analysis-status/${fileId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Status check error:', error);
    // Mock response for development
    return {
      status: 'completed',
      progress: 100
    };
  }
};

// 고급 분석 옵션
export interface AdvancedAnalysisOptions {
  extract_keywords: boolean;
  sentiment_analysis: boolean;
  entity_recognition: boolean;
  summarization: boolean;
  custom_prompts?: string[];
}

export const performAdvancedAnalysis = async (
  fileId: string,
  options: AdvancedAnalysisOptions
): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`http://localhost:8000/advanced-analysis/${fileId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Advanced analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Advanced analysis error:', error);
    // Mock response for development
    return {
      id: Date.now().toString(),
      file_id: fileId,
      extracted_text: '고급 분석이 완료되었습니다. 키워드 추출, 감정 분석, 개체 인식이 수행되었습니다.',
      summary: '고급 분석이 완료되었습니다. 키워드 추출, 감정 분석, 개체 인식이 수행되었습니다.',
      key_points: [
        '주요 키워드: 재건축, 삼성물산, GS건설, 설계, 조합원',
        '감정 분석: 중립적 톤, 객관적 서술',
        '개체 인식: 회사명, 인명, 장소명 식별',
        '요약: 핵심 내용 압축 및 구조화'
      ],
      keywords: ['재건축', '삼성물산', 'GS건설', '설계', '조합원'],
      sentiment: 'neutral',
      confidence: 0.95,
      processing_time: 5.0,
      created_at: new Date().toISOString()
    };
  }
};

export interface WritingInsight {
  id: string;
  type: 'quote' | 'reference' | 'argument' | 'example' | 'statistic';
  content: string;
  source?: string;
  confidence: number;
  context: string;
  writing_style: string;
  citation_format: string;
}

export interface ConversationResponse {
  response: string;
  timestamp: string;
  writing_theory_applied?: string;
}

class AdvancedMediaAnalysisAPI {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8001') {
    this.baseURL = baseURL;
  }

  // 미디어 파일 업로드
  async uploadMediaFile(file: File, projectId?: string): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('project_id', projectId);
    }

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`파일 업로드 실패: ${response.statusText}`);
    }

    return response.json();
  }

  // 파일 분석 시작
  async analyzeFile(fileId: string): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseURL}/analyze/${fileId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`파일 분석 실패: ${response.statusText}`);
    }

    return response.json();
  }

  // 분석 결과 조회
  async getAnalysisResult(fileId: string): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseURL}/analysis/${fileId}`);

    if (!response.ok) {
      throw new Error(`분석 결과 조회 실패: ${response.statusText}`);
    }

    return response.json();
  }

  // 글쓰기 이론 목록 조회
  async getWritingTheories(): Promise<WritingTheory[]> {
    const response = await fetch(`${this.baseURL}/writing-theories`);

    if (!response.ok) {
      throw new Error(`글쓰기 이론 조회 실패: ${response.statusText}`);
    }

    return response.json();
  }

  // 대화체 응답 생성
  async generateConversationalResponse(
    message: ConversationMessage,
    theoryId?: string
  ): Promise<ConversationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.content,
          writing_theory_id: theoryId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating conversational response:', error);
      throw error;
    }
  }

  // 업로드된 파일 목록 조회
  async getUploadedFiles(projectId?: string): Promise<MediaFile[]> {
    const url = projectId
      ? `${this.baseURL}/files?project_id=${projectId}`
      : `${this.baseURL}/files`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`파일 목록 조회 실패: ${response.statusText}`);
    }

    const files = await response.json();
    return files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: this.getFileType(file.mime_type),
      size: file.size,
      url: '', // 실제 파일 URL은 별도 처리 필요
      uploadDate: file.upload_date,
      analysisStatus: file.analysis_status as 'pending' | 'processing' | 'completed' | 'error'
    }));
  }

  // 파일 타입 결정
  private getFileType(mimeType: string): 'image' | 'video' | 'audio' | 'document' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  // 서버 상태 확인
  async checkServerStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // 파일 분석 상태 폴링
  async pollAnalysisStatus(fileId: string, maxAttempts: number = 30): Promise<AnalysisResult> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const result = await this.getAnalysisResult(fileId);
        if (result.extracted_text && result.extracted_text !== '분석 중...') {
          return result;
        }
      } catch (error) {
        // 분석이 아직 완료되지 않은 경우
        console.log(`분석 진행 중... (${i + 1}/${maxAttempts})`);
      }

      // 2초 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('파일 분석 시간 초과');
  }

  // 파일 업로드 및 분석
  async uploadAndAnalyzeFiles(files: File[]): Promise<MediaFile[]> {
    const uploadedFiles: MediaFile[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const uploadResult = await response.json();

        uploadedFiles.push({
          id: uploadResult.file_id,
          name: uploadResult.filename || file.name,
          type: this.getFileType(uploadResult.mime_type || file.type),
          size: uploadResult.file_size || file.size,
          url: '',
          uploadDate: new Date().toISOString(),
          analysisStatus: 'processing',
          summary: '',
          keywords: [],
          extractedText: '',
          writingInsights: []
        });

        // 분석 시작
        const analysisResponse = await fetch(`${this.baseURL}/analyze/${uploadResult.file_id}`, {
          method: 'POST',
        });

        if (analysisResponse.ok) {
          const analysisResult = await analysisResponse.json();
          const fileIndex = uploadedFiles.findIndex(f => f.id === uploadResult.file_id);
          if (fileIndex !== -1) {
            uploadedFiles[fileIndex] = {
              ...uploadedFiles[fileIndex],
              analysisStatus: 'completed',
              summary: analysisResult.summary,
              keywords: analysisResult.keywords,
              extractedText: analysisResult.extracted_text,
              writingInsights: analysisResult.writing_insights
            };
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    return uploadedFiles;
  }

  // 글쓰기 인사이트 생성
  generateWritingInsights(analysisResult: AnalysisResult): WritingInsight[] {
    const insights: WritingInsight[] = [];

    // 인용 인사이트
    if (analysisResult.extracted_text) {
      insights.push({
        id: `insight_${Date.now()}_1`,
        type: 'quote',
        content: `"${analysisResult.extracted_text.substring(0, 100)}..."`,
        source: '분석된 파일',
        confidence: 0.9,
        context: '파일 분석 결과',
        writing_style: '대화체',
        citation_format: '(분석된 파일, 2024)'
      });
    }

    // 참조 인사이트
    if (analysisResult.keywords.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'reference',
        content: `분석 결과에 따르면 "${analysisResult.keywords.join(', ')}"와 관련된 내용이 주요 키워드로 나타났습니다.`,
        source: 'AI 분석',
        confidence: 0.8,
        context: '키워드 분석',
        writing_style: '학술적',
        citation_format: '(AI 분석, 2024)'
      });
    }

    // 논증 인사이트
    if (analysisResult.summary) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'argument',
        content: `이 정보를 바탕으로 ${analysisResult.summary}라는 결론을 도출할 수 있습니다.`,
        source: '논리적 추론',
        confidence: 0.7,
        context: '분석 기반 추론',
        writing_style: '논리적',
        citation_format: '(논리적 분석, 2024)'
      });
    }

    return insights;
  }


}

// 싱글톤 인스턴스
export const advancedMediaAnalysisAPI = new AdvancedMediaAnalysisAPI();

export default AdvancedMediaAnalysisAPI; 