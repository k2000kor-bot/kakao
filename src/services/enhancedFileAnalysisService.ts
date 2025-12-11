import unifiedAPI from './unifiedAPI';
import { errorLogger } from '../utils/errorLogger';

export interface FileAnalysis {
    id: string;
    filename: string;
    fileType: string;
    analysisType: 'text' | 'image' | 'document' | 'audio' | 'video';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    results: {
        summary?: string;
        keywords?: string[];
        sentiment?: 'positive' | 'negative' | 'neutral';
        entities?: string[];
        confidence: number;
        processingTime: number;
    };
    metadata: {
        fileSize: number;
        uploadTime: string;
        model: string;
        tokens: number;
    };
}

export interface AnalysisRequest {
    fileId: string;
    analysisType: string;
    options?: Record<string, any>;
}

export interface AnalysisResponse {
    success: boolean;
    analysis: FileAnalysis;
    error?: string;
}

class EnhancedFileAnalysisService {
    private analyses: Map<string, FileAnalysis> = new Map();

    async analyzeFile(file: File, analysisType: string = 'auto'): Promise<AnalysisResponse> {
        const fileId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        try {

            // 파일 업로드
            const uploadResponse = await unifiedAPI.uploadFile(file);

            if (!uploadResponse.success) {
                throw new Error('파일 업로드에 실패했습니다.');
            }

            // 분석 타입 자동 감지
            const detectedType = this.detectFileType(file);

            // 분석 요청
            const analysisRequest = {
                file: file,
                query: `파일 "${file.name}"을 분석해주세요.`,
                context: {
                    fileType: detectedType,
                    analysisType,
                    fileName: file.name,
                    fileSize: file.size
                }
            };

            const response = await unifiedAPI.processFile(analysisRequest);

            if (response.success) {
                const analysis: FileAnalysis = {
                    id: fileId,
                    filename: file.name,
                    fileType: detectedType,
                    analysisType: detectedType as any,
                    status: 'completed',
                    results: {
                        summary: (response.data as any)?.response || '분석 완료',
                        keywords: this.extractKeywords((response.data as any)?.response || ''),
                        sentiment: this.analyzeSentiment((response.data as any)?.response || ''),
                        entities: this.extractEntities((response.data as any)?.response || ''),
                        confidence: (response.data as any)?.confidence || 0.8,
                        processingTime: (response.data as any)?.processing_time || 0
                    },
                    metadata: {
                        fileSize: file.size,
                        uploadTime: new Date().toISOString(),
                        model: 'enhanced-analysis',
                        tokens: (response.data as any)?.tokens || 0
                    }
                };

                this.analyses.set(fileId, analysis);
                return { success: true, analysis };
            } else {
                throw new Error('파일 분석에 실패했습니다.');
            }
        } catch (error: unknown) {
            errorLogger.error('파일 분석 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'EnhancedFileAnalysisService',
                action: 'analyzeFile',
                fileId,
            });
            return {
                success: false,
                analysis: {
                    id: '',
                    filename: file.name,
                    fileType: 'unknown',
                    analysisType: 'text',
                    status: 'failed',
                    results: {
                        confidence: 0,
                        processingTime: 0
                    },
                    metadata: {
                        fileSize: file.size,
                        uploadTime: new Date().toISOString(),
                        model: 'error',
                        tokens: 0
                    }
                },
                error: error instanceof Error ? error.message : '알 수 없는 오류'
            };
        }
    }

    async analyzeImage(imageFile: File): Promise<AnalysisResponse> {
        const fileId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        try {
            // 이미지를 base64로 변환
            const base64 = await this.fileToBase64(imageFile);

            const imageRequest = {
                image_data: base64,
                analysis_type: 'comprehensive'
            };

            const response = await unifiedAPI.analyzeImage(imageRequest);

            if (response.success) {
                const fileId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

                const analysis: FileAnalysis = {
                    id: fileId,
                    filename: imageFile.name,
                    fileType: 'image',
                    analysisType: 'image',
                    status: 'completed',
                    results: {
                        summary: `이미지 분석 결과: ${(response.data as any)?.analysis?.objects_detected?.join(', ') || '분석 완료'}`,
                        keywords: (response.data as any)?.analysis?.objects_detected || [],
                        sentiment: this.analyzeImageSentiment((response.data as any)?.analysis?.emotions || {}),
                        entities: (response.data as any)?.analysis?.objects_detected || [],
                        confidence: (response.data as any)?.confidence || 0.8,
                        processingTime: (response.data as any)?.processing_time || 0
                    },
                    metadata: {
                        fileSize: imageFile.size,
                        uploadTime: new Date().toISOString(),
                        model: 'image-analysis',
                        tokens: 0
                    }
                };

                this.analyses.set(fileId, analysis);
                return { success: true, analysis };
            } else {
                throw new Error('이미지 분석에 실패했습니다.');
            }
        } catch (error: unknown) {
            errorLogger.error('이미지 분석 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'EnhancedFileAnalysisService',
                action: 'analyzeImage',
                fileId,
            });
            return {
                success: false,
                analysis: {
                    id: '',
                    filename: imageFile.name,
                    fileType: 'image',
                    analysisType: 'image',
                    status: 'failed',
                    results: {
                        confidence: 0,
                        processingTime: 0
                    },
                    metadata: {
                        fileSize: imageFile.size,
                        uploadTime: new Date().toISOString(),
                        model: 'error',
                        tokens: 0
                    }
                },
                error: error instanceof Error ? error.message : '알 수 없는 오류'
            };
        }
    }

    async getAnalysis(fileId: string): Promise<FileAnalysis | null> {
        return this.analyses.get(fileId) || null;
    }

    async getAllAnalyses(): Promise<FileAnalysis[]> {
        return Array.from(this.analyses.values());
    }

    async deleteAnalysis(fileId: string): Promise<boolean> {
        return this.analyses.delete(fileId);
    }

    private detectFileType(file: File): string {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('audio/')) return 'audio';
        if (file.type.includes('pdf')) return 'document';
        if (file.type.includes('document') || file.type.includes('word')) return 'document';
        if (file.type.includes('sheet') || file.type.includes('excel')) return 'document';
        if (file.type.includes('text')) return 'text';
        return 'document';
    }

    private extractKeywords(text: string): string[] {
        // 간단한 키워드 추출 로직
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const keywords = words.filter(word =>
            word.length > 3 && !stopWords.includes(word) && /^[a-zA-Z가-힣]+$/.test(word)
        );
        return Array.from(new Set(keywords)).slice(0, 10);
    }

    private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
        const positiveWords = ['좋', '긍정', '성공', '개선', '향상', '증가', '상승'];
        const negativeWords = ['나쁘', '부정', '실패', '감소', '하락', '문제', '위험'];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    private extractEntities(text: string): string[] {
        // 간단한 엔티티 추출 로직
        const entities: string[] = [];

        // 숫자 패턴
        const numbers = text.match(/\d+/g);
        if (numbers) entities.push(...numbers);

        // 날짜 패턴
        const dates = text.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/g);
        if (dates) entities.push(...dates);

        // 대문자로 시작하는 단어 (고유명사 추정)
        const properNouns = text.match(/\b[A-Z][a-z]+\b/g);
        if (properNouns) entities.push(...properNouns);

        const uniqueEntities: string[] = [];
        entities.forEach(entity => {
            if (!uniqueEntities.includes(entity)) {
                uniqueEntities.push(entity);
            }
        });
        return uniqueEntities;
    }

    private analyzeImageSentiment(emotions: string): 'positive' | 'negative' | 'neutral' {
        const positiveEmotions = ['happy', 'joy', 'excited', 'pleased'];
        const negativeEmotions = ['sad', 'angry', 'fear', 'disgust'];

        const lowerEmotions = emotions.toLowerCase();
        const positiveCount = positiveEmotions.filter(emotion => lowerEmotions.includes(emotion)).length;
        const negativeCount = negativeEmotions.filter(emotion => lowerEmotions.includes(emotion)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // data:image/jpeg;base64, 부분 제거
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    // 고급 분석 기능들
    async compareFiles(files: File[]): Promise<{
        similarities: string[];
        differences: string[];
        recommendations: string[];
    }> {
        const analyses = await Promise.all(
            files.map(file => this.analyzeFile(file))
        );

        const successfulAnalyses = analyses.filter(a => a.success);

        if (successfulAnalyses.length < 2) {
            throw new Error('비교할 수 있는 파일이 충분하지 않습니다.');
        }

        // 간단한 비교 로직
        const summaries = successfulAnalyses.map(a => a.analysis.results.summary || '');
        const keywords = successfulAnalyses.map(a => a.analysis.results.keywords || []);

        const allKeywords = keywords.flat();
        const commonKeywords = allKeywords.filter((keyword, index) =>
            allKeywords.indexOf(keyword) !== index
        );

        return {
            similarities: [`공통 키워드: ${commonKeywords.join(', ')}`],
            differences: [`파일 수: ${files.length}개`],
            recommendations: ['더 자세한 분석을 위해 개별 파일을 확인하세요.']
        };
    }

    async generateReport(fileIds: string[]): Promise<string> {
        const analyses = await Promise.all(
            fileIds.map(id => this.getAnalysis(id))
        );

        const validAnalyses = analyses.filter(a => a !== null) as FileAnalysis[];

        if (validAnalyses.length === 0) {
            return '분석할 파일이 없습니다.';
        }

        let report = `# 파일 분석 보고서\n\n`;
        report += `**분석 일시**: ${new Date().toLocaleString('ko-KR')}\n`;
        report += `**분석 파일 수**: ${validAnalyses.length}개\n\n`;

        validAnalyses.forEach((analysis, index) => {
            report += `## ${index + 1}. ${analysis.filename}\n\n`;
            report += `- **파일 타입**: ${analysis.fileType}\n`;
            report += `- **분석 상태**: ${analysis.status}\n`;
            report += `- **신뢰도**: ${(analysis.results.confidence * 100).toFixed(1)}%\n`;
            report += `- **처리 시간**: ${analysis.results.processingTime}ms\n\n`;

            if (analysis.results.summary) {
                report += `**요약**: ${analysis.results.summary}\n\n`;
            }

            if (analysis.results.keywords && analysis.results.keywords.length > 0) {
                report += `**주요 키워드**: ${analysis.results.keywords.join(', ')}\n\n`;
            }
        });

        return report;
    }
}

const enhancedFileAnalysisService = new EnhancedFileAnalysisService();
export default enhancedFileAnalysisService;
