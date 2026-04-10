// 자동 파일 분류 및 학습 시스템
import { clientFileProcessor, FileAnalysisResult } from './clientFileProcessor';
import { mediaAnalysisService, MediaAnalysisResult } from './mediaAnalysisService';
import { errorLogger, toError } from '../utils/errorLogger';

export interface FileClassification {
    id: string;
    fileName: string;
    fileType: string;
    category: string;
    subCategory: string;
    priority: 'high' | 'medium' | 'low';
    relevanceScore: number;
    autoTags: string[];
    suggestedLocation: string;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    classificationTime: Date;
    confidence: number;
}

export interface LearningPattern {
    pattern: string;
    category: string;
    confidence: number;
    examples: string[];
    frequency: number;
    lastSeen: Date;
}

export interface ProjectFileStructure {
    projectId: string;
    categories: Record<string, {
        files: FileClassification[];
        subCategories: Record<string, FileClassification[]>;
        learningPatterns: LearningPattern[];
        autoRules: Array<{
            condition: string;
            action: string;
            priority: number;
        }>;
    }>;
    lastUpdate: Date;
    totalFiles: number;
    organizationScore: number;
}

export interface AutoLearningInsight {
    type: 'pattern_detected' | 'category_suggested' | 'optimization_opportunity' | 'anomaly_detected';
    description: string;
    confidence: number;
    suggestedAction: string;
    affectedFiles: string[];
    timestamp: Date;
}

export class AutoFileClassifier {
    private classifications = new Map<string, FileClassification>();
    private projectStructures = new Map<string, ProjectFileStructure>();
    private learningPatterns = new Map<string, LearningPattern[]>();
    private autoLearningInsights = new Map<string, AutoLearningInsight[]>();

    async classifyFile(file: File, projectId: string): Promise<FileClassification> {
        const fileId = this.generateFileId(file);

        try {
            // 1. 기본 파일 분석
            let fileAnalysis: FileAnalysisResult | null = null;
            let mediaAnalysis: MediaAnalysisResult | null = null;

            if (this.isMediaFile(file)) {
                mediaAnalysis = await mediaAnalysisService.analyzeMedia(file, projectId);
            } else {
                fileAnalysis = await clientFileProcessor.processFile(file, projectId);
            }

            // 2. 분류 규칙 적용
            const classification = await this.performClassification(file, fileAnalysis, mediaAnalysis, projectId);

            // 3. 학습 패턴 업데이트
            this.updateLearningPatterns(classification, projectId);

            // 4. 프로젝트 구조 업데이트
            this.updateProjectStructure(classification, projectId);

            // 5. 자동 학습 인사이트 생성
            this.generateAutoLearningInsights(classification, projectId);

            // 캐시에 저장
            this.classifications.set(fileId, classification);

            return classification;

        } catch (error) {
            const err = toError(error);
            errorLogger.error('파일 분류 오류', err, {
                component: 'autoFileClassifier',
                action: 'classifyFile',
                fileId,
            });

            // 실패한 경우에도 기본 분류 정보 제공
            const failedClassification: FileClassification = {
                id: fileId,
                fileName: file.name,
                fileType: this.detectFileType(file),
                category: 'uncategorized',
                subCategory: 'unknown',
                priority: 'low',
                relevanceScore: 0.1,
                autoTags: ['분류실패'],
                suggestedLocation: '/miscellaneous',
                processingStatus: 'failed',
                classificationTime: new Date(),
                confidence: 0.1
            };

            this.classifications.set(fileId, failedClassification);
            return failedClassification;
        }
    }

    private generateFileId(file: File): string {
        return `classify_${file.name}_${file.size}_${file.lastModified}`.replace(/[^a-zA-Z0-9]/g, '_');
    }

    private isMediaFile(file: File): boolean {
        return file.type.startsWith('image/') ||
            file.type.startsWith('video/') ||
            file.type.startsWith('audio/');
    }

    private detectFileType(file: File): string {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mimeType = file.type;

        // 미디어 파일
        if (this.isMediaFile(file)) {
            if (file.type.startsWith('image/')) return 'image';
            if (file.type.startsWith('video/')) return 'video';
            if (file.type.startsWith('audio/')) return 'audio';
        }

        // 문서 파일
        if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
        if (extension === 'docx' || mimeType.includes('wordprocessingml')) return 'document';
        if (extension === 'xlsx' || mimeType.includes('spreadsheetml')) return 'spreadsheet';
        if (extension === 'pptx' || mimeType.includes('presentationml')) return 'presentation';
        if (extension === 'txt' || mimeType === 'text/plain') return 'text';
        if (extension === 'md') return 'markdown';

        return 'unknown';
    }

    private async performClassification(
        file: File,
        fileAnalysis: FileAnalysisResult | null,
        mediaAnalysis: MediaAnalysisResult | null,
        projectId: string
    ): Promise<FileClassification> {

        const fileId = this.generateFileId(file);
        const fileName = file.name.toLowerCase();

        // 1. 파일명 기반 분류
        const nameClassification = this.classifyByName(fileName);

        // 2. 내용 기반 분류
        const contentClassification = this.classifyByContent(fileAnalysis, mediaAnalysis);

        // 3. 학습된 패턴 기반 분류
        const patternClassification = this.classifyByPatterns(fileName, fileAnalysis, mediaAnalysis, projectId);

        // 4. 종합 분류 결과 계산
        const finalClassification = this.combineClassifications([
            nameClassification,
            contentClassification,
            patternClassification
        ]);

        // 5. 우선순위 및 관련성 점수 계산
        const priority = this.calculatePriority(finalClassification, fileAnalysis, mediaAnalysis);
        const relevanceScore = this.calculateRelevanceScore(finalClassification, fileAnalysis, mediaAnalysis);

        // 6. 자동 태그 생성
        const autoTags = this.generateAutoTags(file, fileAnalysis, mediaAnalysis, finalClassification);

        // 7. 제안 위치 계산
        const suggestedLocation = this.suggestFileLocation(finalClassification, projectId);

        return {
            id: fileId,
            fileName: file.name,
            fileType: this.detectFileType(file),
            category: finalClassification.category,
            subCategory: finalClassification.subCategory,
            priority,
            relevanceScore,
            autoTags,
            suggestedLocation,
            processingStatus: 'completed',
            classificationTime: new Date(),
            confidence: finalClassification.confidence
        };
    }

    private classifyByName(fileName: string) {
        const namePatterns = [
            // 회의 관련
            { patterns: ['회의', 'meeting', '미팅', 'conference'], category: 'meeting', subCategory: 'general', confidence: 0.8 },
            { patterns: ['안건', 'agenda', '회의록', 'minutes'], category: 'meeting', subCategory: 'minutes', confidence: 0.9 },

            // 계획 관련
            { patterns: ['계획', 'plan', '일정', 'schedule', '타임라인', 'timeline'], category: 'planning', subCategory: 'schedule', confidence: 0.8 },
            { patterns: ['로드맵', 'roadmap', '마일스톤', 'milestone'], category: 'planning', subCategory: 'roadmap', confidence: 0.9 },

            // 분석 관련
            { patterns: ['분석', 'analysis', '리포트', 'report', '보고서'], category: 'analysis', subCategory: 'report', confidence: 0.8 },
            { patterns: ['검토', 'review', '평가', 'evaluation', '조사', 'survey'], category: 'analysis', subCategory: 'review', confidence: 0.8 },

            // 재개발 관련
            { patterns: ['재개발', 'redevelopment', '재건축', 'reconstruction'], category: 'development', subCategory: 'redevelopment', confidence: 0.9 },
            { patterns: ['시공', 'construction', '건설', 'building'], category: 'development', subCategory: 'construction', confidence: 0.8 },

            // 법적 문서
            { patterns: ['계약', 'contract', '협약', 'agreement', '법적', 'legal'], category: 'legal', subCategory: 'contract', confidence: 0.9 },
            { patterns: ['규정', 'regulation', '조례', 'ordinance', '법률'], category: 'legal', subCategory: 'regulation', confidence: 0.8 },

            // 재정 관련
            { patterns: ['예산', 'budget', '비용', 'cost', '가격', 'price'], category: 'financial', subCategory: 'budget', confidence: 0.8 },
            { patterns: ['투자', 'investment', '수익', 'revenue', '재정'], category: 'financial', subCategory: 'investment', confidence: 0.8 },

            // 홍보 관련
            { patterns: ['홍보', 'promotion', '마케팅', 'marketing', '광고', 'advertisement'], category: 'marketing', subCategory: 'promotion', confidence: 0.8 },
            { patterns: ['브랜딩', 'branding', 'pr', '보도자료', 'press'], category: 'marketing', subCategory: 'pr', confidence: 0.8 }
        ];

        for (const { patterns, category, subCategory, confidence } of namePatterns) {
            if (patterns.some(pattern => fileName.includes(pattern))) {
                return { category, subCategory, confidence };
            }
        }

        return { category: 'general', subCategory: 'miscellaneous', confidence: 0.3 };
    }

    private classifyByContent(fileAnalysis: FileAnalysisResult | null, mediaAnalysis: MediaAnalysisResult | null) {
        if (mediaAnalysis) {
            // 미디어 파일 내용 기반 분류
            const topics = mediaAnalysis.knowledgeExtraction.keyTopics;
            const entities = mediaAnalysis.knowledgeExtraction.entities;

            if (topics.some(t => t.includes('회의') || t.includes('협의'))) {
                return { category: 'meeting', subCategory: 'media', confidence: 0.7 };
            }
            if (topics.some(t => t.includes('건설') || t.includes('재개발'))) {
                return { category: 'development', subCategory: 'media', confidence: 0.7 };
            }
            if (entities.people.length > 2) {
                return { category: 'meeting', subCategory: 'interview', confidence: 0.6 };
            }

            return { category: 'media', subCategory: mediaAnalysis.fileType, confidence: 0.5 };
        }

        if (fileAnalysis) {
            // 문서 파일 내용 기반 분류
            const _topics = fileAnalysis.keyTopics;
            const category = fileAnalysis.categorization.primaryCategory;

            if (category === 'construction') {
                return { category: 'development', subCategory: 'documentation', confidence: 0.8 };
            }
            if (category === 'legal') {
                return { category: 'legal', subCategory: 'documentation', confidence: 0.8 };
            }
            if (category === 'financial') {
                return { category: 'financial', subCategory: 'documentation', confidence: 0.8 };
            }
            if (category === 'analysis') {
                return { category: 'analysis', subCategory: 'documentation', confidence: 0.8 };
            }

            return { category: 'document', subCategory: 'general', confidence: 0.6 };
        }

        return { category: 'unknown', subCategory: 'unknown', confidence: 0.1 };
    }

    private classifyByPatterns(
        fileName: string,
        fileAnalysis: FileAnalysisResult | null,
        mediaAnalysis: MediaAnalysisResult | null,
        projectId: string
    ) {
        const patterns = this.learningPatterns.get(projectId) || [];

        for (const pattern of patterns) {
            if (fileName.includes(pattern.pattern) ||
                (fileAnalysis && fileAnalysis.extractedText.includes(pattern.pattern)) ||
                (mediaAnalysis && mediaAnalysis.contextualSummary.includes(pattern.pattern))) {

                // 패턴 사용 빈도 증가
                pattern.frequency++;
                pattern.lastSeen = new Date();

                return {
                    category: pattern.category,
                    subCategory: 'learned',
                    confidence: Math.min(0.9, pattern.confidence + pattern.frequency * 0.1)
                };
            }
        }

        return { category: 'unknown', subCategory: 'unknown', confidence: 0.2 };
    }

    private combineClassifications(classifications: Array<{ category: string; subCategory: string; confidence: number }>) {
        // 가중 평균을 사용하여 최종 분류 결정
        const categoryScores = new Map<string, number>();
        const subCategoryScores = new Map<string, number>();

        classifications.forEach(({ category, subCategory, confidence }) => {
            categoryScores.set(category, (categoryScores.get(category) || 0) + confidence);
            const subKey = `${category}:${subCategory}`;
            subCategoryScores.set(subKey, (subCategoryScores.get(subKey) || 0) + confidence);
        });

        // 최고 점수 카테고리 선택
        const bestCategory = Array.from(categoryScores.entries())
            .sort(([, a], [, b]) => b - a)[0];

        const bestSubCategory = Array.from(subCategoryScores.entries())
            .filter(([key]) => key.startsWith(bestCategory[0] + ':'))
            .sort(([, a], [, b]) => b - a)[0];

        const finalCategory = bestCategory[0];
        const finalSubCategory = bestSubCategory ? bestSubCategory[0].split(':')[1] : 'general';
        const finalConfidence = Math.min(1.0, bestCategory[1] / classifications.length);

        return {
            category: finalCategory,
            subCategory: finalSubCategory,
            confidence: finalConfidence
        };
    }

    private calculatePriority(
        classification: { category: string; subCategory: string; confidence: number },
        fileAnalysis: FileAnalysisResult | null,
        mediaAnalysis: MediaAnalysisResult | null
    ): 'high' | 'medium' | 'low' {

        let priorityScore = 0;

        // 카테고리 기반 우선순위
        const highPriorityCategories = ['legal', 'financial', 'meeting'];
        const mediumPriorityCategories = ['development', 'planning', 'analysis'];

        if (highPriorityCategories.includes(classification.category)) {
            priorityScore += 3;
        } else if (mediumPriorityCategories.includes(classification.category)) {
            priorityScore += 2;
        } else {
            priorityScore += 1;
        }

        // 신뢰도 기반 조정
        if (classification.confidence > 0.8) priorityScore += 1;
        else if (classification.confidence < 0.5) priorityScore -= 1;

        // 내용 복잡도 기반 조정
        if (fileAnalysis) {
            if (fileAnalysis.keyTopics.length > 5) priorityScore += 1;
            if (fileAnalysis.entities.organizations.length > 0) priorityScore += 1;
        }

        if (mediaAnalysis) {
            if (mediaAnalysis.knowledgeExtraction.actionItems.length > 0) priorityScore += 1;
            if (mediaAnalysis.confidence > 0.8) priorityScore += 1;
        }

        // 최종 우선순위 결정
        if (priorityScore >= 5) return 'high';
        if (priorityScore >= 3) return 'medium';
        return 'low';
    }

    private calculateRelevanceScore(
        classification: { category: string; subCategory: string; confidence: number },
        fileAnalysis: FileAnalysisResult | null,
        mediaAnalysis: MediaAnalysisResult | null
    ): number {

        let relevanceScore = classification.confidence;

        // 추출된 정보량에 따른 관련성 증가
        if (fileAnalysis) {
            relevanceScore += Math.min(0.3, fileAnalysis.keyTopics.length * 0.05);
            relevanceScore += Math.min(0.2, Object.values(fileAnalysis.entities).flat().length * 0.02);
        }

        if (mediaAnalysis) {
            relevanceScore += Math.min(0.3, mediaAnalysis.knowledgeExtraction.insights.length * 0.05);
            relevanceScore += Math.min(0.2, mediaAnalysis.knowledgeExtraction.actionItems.length * 0.03);
        }

        return Math.min(1.0, relevanceScore);
    }

    private generateAutoTags(
        file: File,
        fileAnalysis: FileAnalysisResult | null,
        mediaAnalysis: MediaAnalysisResult | null,
        classification: { category: string; subCategory: string; confidence: number }
    ): string[] {

        const tags = new Set<string>();

        // 기본 태그
        tags.add(this.detectFileType(file));
        tags.add(classification.category);
        if (classification.subCategory !== 'general') {
            tags.add(classification.subCategory);
        }

        // 파일명 기반 태그
        const fileName = file.name.toLowerCase();
        if (fileName.includes('draft') || fileName.includes('초안')) tags.add('초안');
        if (fileName.includes('final') || fileName.includes('최종')) tags.add('최종');
        if (fileName.includes('v1') || fileName.includes('v2') || fileName.includes('버전')) tags.add('버전관리');

        // 내용 기반 태그
        if (fileAnalysis) {
            fileAnalysis.keyTopics.forEach(topic => tags.add(topic));
            if (fileAnalysis.entities.people.length > 0) tags.add('인물포함');
            if (fileAnalysis.entities.organizations.length > 0) tags.add('조직포함');
            if (fileAnalysis.entities.dates.length > 0) tags.add('날짜포함');
        }

        if (mediaAnalysis) {
            mediaAnalysis.tags.forEach(tag => tags.add(tag));
            if (mediaAnalysis.knowledgeExtraction.actionItems.length > 0) tags.add('액션아이템');
        }

        // 신뢰도 기반 태그
        if (classification.confidence > 0.9) tags.add('고신뢰도');
        else if (classification.confidence < 0.5) tags.add('검토필요');

        // 크기 기반 태그
        if (file.size > 10 * 1024 * 1024) tags.add('대용량');
        else if (file.size < 100 * 1024) tags.add('소용량');

        return Array.from(tags).slice(0, 10); // 최대 10개 태그
    }

    private suggestFileLocation(
        classification: { category: string; subCategory: string; confidence: number },
        _projectId: string
    ): string {

        const baseStructure = {
            'meeting': '/meetings',
            'planning': '/planning',
            'analysis': '/analysis',
            'development': '/development',
            'legal': '/legal',
            'financial': '/financial',
            'marketing': '/marketing',
            'media': '/media',
            'document': '/documents',
            'general': '/general'
        };

        const basePath = baseStructure[classification.category as keyof typeof baseStructure] || '/miscellaneous';

        // 서브카테고리 경로 추가
        if (classification.subCategory && classification.subCategory !== 'general') {
            return `${basePath}/${classification.subCategory}`;
        }

        return basePath;
    }

    private updateLearningPatterns(classification: FileClassification, projectId: string) {
        const patterns = this.learningPatterns.get(projectId) || [];

        // 파일명에서 패턴 추출
        const nameWords = classification.fileName.toLowerCase()
            .split(/[^a-zA-Z가-힣0-9]/)
            .filter(word => word.length > 2);

        nameWords.forEach(word => {
            const existingPattern = patterns.find(p => p.pattern === word);

            if (existingPattern) {
                existingPattern.frequency++;
                existingPattern.confidence = Math.min(0.95, existingPattern.confidence + 0.05);
                existingPattern.lastSeen = new Date();
                if (!existingPattern.examples.includes(classification.fileName)) {
                    existingPattern.examples.push(classification.fileName);
                }
            } else if (classification.confidence > 0.7) {
                patterns.push({
                    pattern: word,
                    category: classification.category,
                    confidence: 0.5,
                    examples: [classification.fileName],
                    frequency: 1,
                    lastSeen: new Date()
                });
            }
        });

        // 사용 빈도가 낮은 패턴 정리 (50개 이상 유지)
        if (patterns.length > 50) {
            patterns.sort((a, b) => b.frequency - a.frequency);
            patterns.splice(50);
        }

        this.learningPatterns.set(projectId, patterns);
    }

    private updateProjectStructure(classification: FileClassification, projectId: string) {
        let structure = this.projectStructures.get(projectId);

        if (!structure) {
            structure = {
                projectId,
                categories: {},
                lastUpdate: new Date(),
                totalFiles: 0,
                organizationScore: 0.5
            };
        }

        // 카테고리 구조 업데이트
        if (!structure.categories[classification.category]) {
            structure.categories[classification.category] = {
                files: [],
                subCategories: {},
                learningPatterns: [],
                autoRules: []
            };
        }

        const category = structure.categories[classification.category];
        category.files.push(classification);

        // 서브카테고리 업데이트
        if (!category.subCategories[classification.subCategory]) {
            category.subCategories[classification.subCategory] = [];
        }
        category.subCategories[classification.subCategory].push(classification);

        // 통계 업데이트
        structure.totalFiles++;
        structure.lastUpdate = new Date();
        structure.organizationScore = this.calculateOrganizationScore(structure);

        this.projectStructures.set(projectId, structure);
    }

    private calculateOrganizationScore(structure: ProjectFileStructure): number {
        let score = 0.5;

        // 분류된 파일 비율
        const categorizedFiles = Object.values(structure.categories)
            .flatMap(cat => cat.files)
            .filter(file => file.category !== 'unknown' && file.confidence > 0.5).length;

        const categorizationRatio = categorizedFiles / Math.max(1, structure.totalFiles);
        score += categorizationRatio * 0.3;

        // 카테고리 균형
        const categoryCount = Object.keys(structure.categories).length;
        const balanceScore = Math.min(1.0, categoryCount / 5); // 5개 카테고리가 이상적
        score += balanceScore * 0.2;

        return Math.min(1.0, score);
    }

    private generateAutoLearningInsights(classification: FileClassification, projectId: string) {
        const insights = this.autoLearningInsights.get(projectId) || [];

        // 패턴 감지 인사이트
        if (classification.confidence > 0.9) {
            insights.push({
                type: 'pattern_detected',
                description: `"${classification.fileName}" 파일에서 강한 분류 패턴이 감지되었습니다.`,
                confidence: classification.confidence,
                suggestedAction: `이 패턴을 다른 유사한 파일들에 적용해보세요.`,
                affectedFiles: [classification.id],
                timestamp: new Date()
            });
        }

        // 카테고리 제안 인사이트
        const structure = this.projectStructures.get(projectId);
        if (structure && structure.totalFiles > 0) {
            const uncategorizedRatio = Object.values(structure.categories)
                .flatMap(cat => cat.files)
                .filter(file => file.category === 'unknown').length / structure.totalFiles;

            if (uncategorizedRatio > 0.3) {
                insights.push({
                    type: 'category_suggested',
                    description: `미분류 파일이 ${Math.round(uncategorizedRatio * 100)}% 입니다.`,
                    confidence: 0.8,
                    suggestedAction: '파일명 규칙을 정립하거나 수동 분류를 검토해보세요.',
                    affectedFiles: [],
                    timestamp: new Date()
                });
            }
        }

        // 최근 인사이트만 유지 (50개)
        if (insights.length > 50) {
            insights.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            insights.splice(50);
        }

        this.autoLearningInsights.set(projectId, insights);
    }

    // 공개 메서드들
    getProjectStructure(projectId: string): ProjectFileStructure | null {
        return this.projectStructures.get(projectId) || null;
    }

    getFileClassification(fileId: string): FileClassification | null {
        return this.classifications.get(fileId) || null;
    }

    getLearningPatterns(projectId: string): LearningPattern[] {
        return this.learningPatterns.get(projectId) || [];
    }

    getAutoLearningInsights(projectId: string): AutoLearningInsight[] {
        return this.autoLearningInsights.get(projectId) || [];
    }

    // 프로젝트의 모든 파일을 재분류
    async reclassifyProjectFiles(projectId: string): Promise<void> {
        const structure = this.projectStructures.get(projectId);
        if (!structure) return;

        const allFiles = Object.values(structure.categories).flatMap(cat => cat.files);

        for (const fileClass of allFiles) {
            // 신뢰도가 낮은 파일들만 재분류
            if (fileClass.confidence < 0.7) {
                fileClass.processingStatus = 'pending';
                // 실제로는 파일을 다시 분석해야 하지만, 여기서는 시뮬레이션
                setTimeout(() => {
                    fileClass.processingStatus = 'completed';
                    fileClass.confidence = Math.min(1.0, fileClass.confidence + 0.2);
                }, 1000);
            }
        }
    }

    // 카테고리별 파일 통계
    getCategoryStatistics(projectId: string): Record<string, { count: number; avgConfidence: number; recentFiles: number }> {
        const structure = this.projectStructures.get(projectId);
        if (!structure) return {};

        const stats: Record<string, { count: number; avgConfidence: number; recentFiles: number }> = {};

        Object.entries(structure.categories).forEach(([category, categoryData]) => {
            const files = categoryData.files;
            const recentThreshold = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7일 전

            stats[category] = {
                count: files.length,
                avgConfidence: files.reduce((sum, file) => sum + file.confidence, 0) / files.length || 0,
                recentFiles: files.filter(file => file.classificationTime.getTime() > recentThreshold).length
            };
        });

        return stats;
    }

    clearProjectData(projectId: string) {
        this.projectStructures.delete(projectId);
        this.learningPatterns.delete(projectId);
        this.autoLearningInsights.delete(projectId);
    }
}

export const autoFileClassifier = new AutoFileClassifier();
