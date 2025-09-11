// 미디어 파일 분석 및 이해 서비스
export interface MediaAnalysisResult {
    id: string;
    fileName: string;
    fileType: 'image' | 'video' | 'audio';
    fileSize: number;
    analysisTime: Date;

    // 이미지 분석
    imageAnalysis?: {
        dimensions: { width: number; height: number };
        colors: { dominant: string[]; palette: string[] };
        objects: Array<{ name: string; confidence: number; boundingBox?: any }>;
        text: string; // OCR 결과
        scenes: string[];
        quality: { brightness: number; contrast: number; sharpness: number };
        metadata: {
            camera?: string;
            location?: { lat: number; lon: number };
            timestamp?: Date;
        };
    };

    // 비디오 분석
    videoAnalysis?: {
        duration: number;
        resolution: { width: number; height: number };
        frameRate: number;
        scenes: Array<{
            timestamp: number;
            description: string;
            keyObjects: string[];
            text: string;
        }>;
        audioTrack: {
            hasAudio: boolean;
            language?: string;
            transcript?: string;
            backgroundMusic: boolean;
        };
        thumbnails: string[];
        summary: string;
    };

    // 오디오 분석
    audioAnalysis?: {
        duration: number;
        format: string;
        sampleRate: number;
        channels: number;
        transcript?: string;
        language?: string;
        speakers: number;
        emotions: Array<{ emotion: string; confidence: number; timestamp: number }>;
        topics: string[];
        summary: string;
        musicDetection: {
            isMusic: boolean;
            genre?: string;
            tempo?: number;
        };
    };

    // 공통 분석 결과
    knowledgeExtraction: {
        keyTopics: string[];
        entities: {
            people: string[];
            organizations: string[];
            locations: string[];
            dates: string[];
            events: string[];
        };
        insights: string[];
        actionItems: string[];
        references: string[];
    };

    contextualSummary: string;
    tags: string[];
    categories: string[];
    confidence: number;
}

export interface ConversationMediaContext {
    mediaFiles: MediaAnalysisResult[];
    combinedInsights: string[];
    crossReferences: Record<string, string[]>;
    timelineEvents: Array<{
        timestamp: Date;
        mediaId: string;
        event: string;
        significance: number;
    }>;
    narrativeFlow: string;
}

class MediaAnalysisService {
    private analysisCache = new Map<string, MediaAnalysisResult>();
    private conversationContext = new Map<string, ConversationMediaContext>();

    async analyzeMedia(file: File, projectId: string): Promise<MediaAnalysisResult> {
        const fileId = this.generateFileId(file);

        // 캐시 확인
        if (this.analysisCache.has(fileId)) {
            return this.analysisCache.get(fileId)!;
        }

        const fileType = this.detectMediaType(file);

        try {
            let analysis: MediaAnalysisResult = {
                id: fileId,
                fileName: file.name,
                fileType,
                fileSize: file.size,
                analysisTime: new Date(),
                knowledgeExtraction: {
                    keyTopics: [],
                    entities: { people: [], organizations: [], locations: [], dates: [], events: [] },
                    insights: [],
                    actionItems: [],
                    references: []
                },
                contextualSummary: '',
                tags: [],
                categories: [],
                confidence: 0.5
            };

            switch (fileType) {
                case 'image':
                    analysis.imageAnalysis = await this.analyzeImage(file);
                    break;
                case 'video':
                    analysis.videoAnalysis = await this.analyzeVideo(file);
                    break;
                case 'audio':
                    analysis.audioAnalysis = await this.analyzeAudio(file);
                    break;
            }

            // 지식 추출 및 맥락 분석
            analysis = await this.extractKnowledge(analysis);

            // 캐시에 저장
            this.analysisCache.set(fileId, analysis);

            // 대화 맥락에 추가
            this.updateConversationContext(projectId, analysis);

            return analysis;

        } catch (error) {
            console.error('미디어 분석 오류:', error);
            throw new Error(`미디어 분석 중 오류 발생: ${error}`);
        }
    }

    private generateFileId(file: File): string {
        return `media_${file.name}_${file.size}_${file.lastModified}`.replace(/[^a-zA-Z0-9]/g, '_');
    }

    private detectMediaType(file: File): 'image' | 'video' | 'audio' {
        const mimeType = file.type;

        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';

        // 확장자 기반 판단
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '')) return 'image';
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')) return 'video';
        if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(extension || '')) return 'audio';

        return 'image'; // 기본값
    }

    private async analyzeImage(file: File) {
        // 이미지 기본 정보 추출
        const image = new Image();
        const imageUrl = URL.createObjectURL(file);

        return new Promise<MediaAnalysisResult['imageAnalysis']>((resolve) => {
            image.onload = () => {
                // 기본 분석 결과 (실제로는 AI 비전 모델 사용)
                const analysis = {
                    dimensions: { width: image.width, height: image.height },
                    colors: {
                        dominant: ['#4A90E2', '#7ED321', '#F5A623'],
                        palette: ['#4A90E2', '#7ED321', '#F5A623', '#D0021B', '#9013FE']
                    },
                    objects: [
                        { name: '사람', confidence: 0.85 },
                        { name: '건물', confidence: 0.72 },
                        { name: '자동차', confidence: 0.68 }
                    ],
                    text: this.extractTextFromImage(file),
                    scenes: ['실외', '도시', '주거지역'],
                    quality: {
                        brightness: Math.random() * 100,
                        contrast: Math.random() * 100,
                        sharpness: Math.random() * 100
                    },
                    metadata: {
                        camera: '알 수 없음',
                        timestamp: new Date()
                    }
                };

                URL.revokeObjectURL(imageUrl);
                resolve(analysis);
            };

            image.onerror = () => {
                URL.revokeObjectURL(imageUrl);
                resolve({
                    dimensions: { width: 0, height: 0 },
                    colors: { dominant: [], palette: [] },
                    objects: [],
                    text: '',
                    scenes: [],
                    quality: { brightness: 0, contrast: 0, sharpness: 0 },
                    metadata: {}
                });
            };

            image.src = imageUrl;
        });
    }

    private async analyzeVideo(file: File) {
        // 비디오 분석 (실제로는 영상 처리 라이브러리 또는 AI 모델 사용)
        const video = document.createElement('video');
        const videoUrl = URL.createObjectURL(file);

        return new Promise<MediaAnalysisResult['videoAnalysis']>((resolve) => {
            video.onloadedmetadata = () => {
                const analysis = {
                    duration: video.duration,
                    resolution: { width: video.videoWidth, height: video.videoHeight },
                    frameRate: 30, // 추정값
                    scenes: [
                        {
                            timestamp: 0,
                            description: '영상 시작 - 인트로 장면',
                            keyObjects: ['사람', '배경'],
                            text: '화면에 나타나는 텍스트'
                        },
                        {
                            timestamp: video.duration / 2,
                            description: '중간 부분 - 주요 내용',
                            keyObjects: ['객체1', '객체2'],
                            text: '중간 텍스트'
                        }
                    ],
                    audioTrack: {
                        hasAudio: true,
                        language: 'ko',
                        transcript: '이 비디오에서 추출된 음성 텍스트입니다.',
                        backgroundMusic: false
                    },
                    thumbnails: [videoUrl], // 실제로는 여러 썸네일 생성
                    summary: `${file.name} 비디오 파일 분석 결과: ${Math.round(video.duration)}초 길이의 영상`
                };

                URL.revokeObjectURL(videoUrl);
                resolve(analysis);
            };

            video.onerror = () => {
                URL.revokeObjectURL(videoUrl);
                resolve({
                    duration: 0,
                    resolution: { width: 0, height: 0 },
                    frameRate: 0,
                    scenes: [],
                    audioTrack: { hasAudio: false, backgroundMusic: false },
                    thumbnails: [],
                    summary: '비디오 분석에 실패했습니다.'
                });
            };

            video.src = videoUrl;
        });
    }

    private async analyzeAudio(file: File) {
        // 오디오 분석 (실제로는 음성 인식 및 오디오 처리 라이브러리 사용)
        const audio = new Audio();
        const audioUrl = URL.createObjectURL(file);

        return new Promise<MediaAnalysisResult['audioAnalysis']>((resolve) => {
            audio.onloadedmetadata = () => {
                const analysis = {
                    duration: audio.duration,
                    format: file.type,
                    sampleRate: 44100, // 추정값
                    channels: 2, // 추정값
                    transcript: '이 오디오에서 추출된 음성 텍스트입니다. 실제로는 음성 인식 API를 사용합니다.',
                    language: 'ko',
                    speakers: 1,
                    emotions: [
                        { emotion: '중립', confidence: 0.7, timestamp: 0 },
                        { emotion: '긍정', confidence: 0.8, timestamp: audio.duration / 2 }
                    ],
                    topics: ['주제1', '주제2', '주제3'],
                    summary: `${file.name} 오디오 파일: ${Math.round(audio.duration)}초 길이의 음성 내용`,
                    musicDetection: {
                        isMusic: file.name.toLowerCase().includes('music') || file.name.toLowerCase().includes('song'),
                        genre: '알 수 없음',
                        tempo: 120
                    }
                };

                URL.revokeObjectURL(audioUrl);
                resolve(analysis);
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                resolve({
                    duration: 0,
                    format: file.type,
                    sampleRate: 0,
                    channels: 0,
                    speakers: 0,
                    emotions: [],
                    topics: [],
                    summary: '오디오 분석에 실패했습니다.',
                    musicDetection: { isMusic: false }
                });
            };

            audio.src = audioUrl;
        });
    }

    private extractTextFromImage(file: File): string {
        // OCR 기능 (실제로는 Tesseract.js 또는 Google Vision API 사용)
        const fileName = file.name.toLowerCase();
        if (fileName.includes('text') || fileName.includes('document')) {
            return '이미지에서 추출된 텍스트입니다. 실제로는 OCR 라이브러리를 사용합니다.';
        }
        return '';
    }

    private async extractKnowledge(analysis: MediaAnalysisResult): Promise<MediaAnalysisResult> {
        // 각 미디어 타입별 지식 추출
        let extractedText = '';
        let scenes: string[] = [];
        let metadata: any = {};

        if (analysis.imageAnalysis) {
            extractedText += analysis.imageAnalysis.text;
            scenes = analysis.imageAnalysis.scenes;
            metadata.imageContext = this.analyzeImageContext(analysis.imageAnalysis);
        }

        if (analysis.videoAnalysis) {
            extractedText += analysis.videoAnalysis.audioTrack.transcript || '';
            extractedText += analysis.videoAnalysis.scenes.map(s => s.description).join(' ');
            scenes = analysis.videoAnalysis.scenes.map(s => s.description);
            metadata.videoContext = this.analyzeVideoContext(analysis.videoAnalysis);
        }

        if (analysis.audioAnalysis) {
            extractedText += analysis.audioAnalysis.transcript || '';
            scenes = analysis.audioAnalysis.topics;
            metadata.audioContext = this.analyzeAudioContext(analysis.audioAnalysis);
        }

        // 고도화된 분석
        const keyTopics = this.extractTopics(extractedText, scenes);
        const entities = this.extractEntities(extractedText);
        const insights = this.generateInsights(analysis);
        const sentimentAnalysis = this.analyzeSentiment(extractedText);
        const complexityAnalysis = this.analyzeComplexity(extractedText, analysis.fileType);
        const purposeAnalysis = this.analyzePurpose(extractedText, analysis.fileName);
        const qualityMetrics = this.calculateMediaQuality(analysis);

        analysis.knowledgeExtraction = {
            keyTopics,
            entities,
            insights,
            actionItems: this.extractActionItems(extractedText),
            references: this.extractReferences(extractedText)
        };

        // 추가 분석 결과 저장
        analysis.contextualSummary = this.generateContextualSummary(analysis);
        analysis.tags = this.generateTags(analysis);
        analysis.categories = this.categorizeMedia(analysis);
        analysis.confidence = this.calculateConfidence(analysis);

        // 확장된 메타데이터
        (analysis as any).sentimentAnalysis = sentimentAnalysis;
        (analysis as any).complexityAnalysis = complexityAnalysis;
        (analysis as any).purposeAnalysis = purposeAnalysis;
        (analysis as any).qualityMetrics = qualityMetrics;
        (analysis as any).metadata = metadata;

        return analysis;
    }

    private extractTopics(text: string, scenes: string[]): string[] {
        const topics = new Set<string>();

        // 텍스트에서 토픽 추출
        const topicPatterns = [
            { pattern: /재개발|재건축|건설/gi, topic: '건설/재개발' },
            { pattern: /회의|미팅|협의/gi, topic: '회의/협의' },
            { pattern: /계획|일정|스케줄/gi, topic: '계획/일정' },
            { pattern: /분석|검토|평가/gi, topic: '분석/평가' },
            { pattern: /사람|인물|관계자/gi, topic: '인물/관계자' },
            { pattern: /장소|위치|지역/gi, topic: '장소/위치' }
        ];

        topicPatterns.forEach(({ pattern, topic }) => {
            if (pattern.test(text)) {
                topics.add(topic);
            }
        });

        // 씬에서 토픽 추출
        scenes.forEach(scene => {
            if (scene.includes('실외') || scene.includes('건물')) topics.add('장소/위치');
            if (scene.includes('사람') || scene.includes('인물')) topics.add('인물/관계자');
            if (scene.includes('회의') || scene.includes('미팅')) topics.add('회의/협의');
        });

        return Array.from(topics);
    }

    private extractEntities(text: string) {
        const entities = {
            people: [] as string[],
            organizations: [] as string[],
            locations: [] as string[],
            dates: [] as string[],
            events: [] as string[]
        };

        // 간단한 엔티티 추출 패턴
        const peoplePattern = /[가-힣]{2,4}(?:씨|님|대표|이사|부장|과장|팀장)/g;
        const orgPattern = /(?:삼성|현대|LG|SK)\w*|[가-힣]+(?:건설|그룹|회사|법인)/g;
        const locationPattern = /[가-힣]+(?:구|동|시|군|도)|서울|부산|대구|인천/g;
        const datePattern = /\d{4}년\s*\d{1,2}월\s*\d{1,2}일|\d{4}-\d{1,2}-\d{1,2}/g;
        const eventPattern = /[가-힣]+(?:회의|미팅|행사|세미나|워크샵|프레젠테이션)/g;

        entities.people = Array.from(new Set(text.match(peoplePattern) || []));
        entities.organizations = Array.from(new Set(text.match(orgPattern) || []));
        entities.locations = Array.from(new Set(text.match(locationPattern) || []));
        entities.dates = Array.from(new Set(text.match(datePattern) || []));
        entities.events = Array.from(new Set(text.match(eventPattern) || []));

        return entities;
    }

    private generateInsights(analysis: MediaAnalysisResult): string[] {
        const insights: string[] = [];

        if (analysis.imageAnalysis) {
            insights.push(`이미지 해상도: ${analysis.imageAnalysis.dimensions.width}x${analysis.imageAnalysis.dimensions.height}`);
            if (analysis.imageAnalysis.objects.length > 0) {
                insights.push(`감지된 객체: ${analysis.imageAnalysis.objects.map(o => o.name).join(', ')}`);
            }
            if (analysis.imageAnalysis.text) {
                insights.push(`이미지 내 텍스트 발견: ${analysis.imageAnalysis.text.length}자`);
            }
        }

        if (analysis.videoAnalysis) {
            insights.push(`비디오 길이: ${Math.round(analysis.videoAnalysis.duration)}초`);
            insights.push(`씬 분석: ${analysis.videoAnalysis.scenes.length}개 장면 감지`);
            if (analysis.videoAnalysis.audioTrack.hasAudio) {
                insights.push('음성 트랙 포함');
            }
        }

        if (analysis.audioAnalysis) {
            insights.push(`오디오 길이: ${Math.round(analysis.audioAnalysis.duration)}초`);
            insights.push(`화자 수: ${analysis.audioAnalysis.speakers}명`);
            if (analysis.audioAnalysis.musicDetection.isMusic) {
                insights.push('음악 파일로 감지');
            }
        }

        return insights;
    }

    private extractActionItems(text: string): string[] {
        const actionPatterns = [
            /(?:해야|해야 할|필요한|진행할|실행할|완료할)\s*[가-힣\s]+/g,
            /(?:검토|확인|점검|조사|분석)(?:해야|할|하기)/g,
            /(?:준비|계획|추진|실시)(?:해야|할|하기)/g
        ];

        const actionItems = new Set<string>();

        actionPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (match.length > 5 && match.length < 50) {
                        actionItems.add(match.trim());
                    }
                });
            }
        });

        return Array.from(actionItems);
    }

    private extractReferences(text: string): string[] {
        const referencePatterns = [
            /(?:참고|참조|인용).*[가-힣\s\d]+/g,
            /(?:출처|자료|문서).*[가-힣\s\d]+/g,
            /https?:\/\/[^\s]+/g
        ];

        const references = new Set<string>();

        referencePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (match.length > 5) {
                        references.add(match.trim());
                    }
                });
            }
        });

        return Array.from(references);
    }

    private generateContextualSummary(analysis: MediaAnalysisResult): string {
        let summary = `${analysis.fileName} 파일 분석 결과: `;

        if (analysis.imageAnalysis) {
            summary += `${analysis.imageAnalysis.dimensions.width}x${analysis.imageAnalysis.dimensions.height} 이미지`;
            if (analysis.imageAnalysis.objects.length > 0) {
                summary += `, ${analysis.imageAnalysis.objects.length}개 객체 감지`;
            }
        }

        if (analysis.videoAnalysis) {
            summary += `${Math.round(analysis.videoAnalysis.duration)}초 비디오`;
            if (analysis.videoAnalysis.scenes.length > 0) {
                summary += `, ${analysis.videoAnalysis.scenes.length}개 장면 분석`;
            }
        }

        if (analysis.audioAnalysis) {
            summary += `${Math.round(analysis.audioAnalysis.duration)}초 오디오`;
            if (analysis.audioAnalysis.transcript) {
                summary += ', 음성 텍스트 변환 완료';
            }
        }

        if (analysis.knowledgeExtraction.keyTopics.length > 0) {
            summary += `. 주요 주제: ${analysis.knowledgeExtraction.keyTopics.slice(0, 3).join(', ')}`;
        }

        return summary;
    }

    private generateTags(analysis: MediaAnalysisResult): string[] {
        const tags = new Set<string>();

        // 파일 타입 태그
        tags.add(analysis.fileType);

        // 주제 태그
        analysis.knowledgeExtraction.keyTopics.forEach(topic => tags.add(topic));

        // 엔티티 태그
        if (analysis.knowledgeExtraction.entities.people.length > 0) tags.add('인물');
        if (analysis.knowledgeExtraction.entities.organizations.length > 0) tags.add('조직');
        if (analysis.knowledgeExtraction.entities.locations.length > 0) tags.add('장소');
        if (analysis.knowledgeExtraction.entities.events.length > 0) tags.add('이벤트');

        // 미디어별 특성 태그
        if (analysis.imageAnalysis?.text) tags.add('텍스트포함');
        if (analysis.videoAnalysis?.audioTrack.hasAudio) tags.add('음성포함');
        if (analysis.audioAnalysis?.musicDetection.isMusic) tags.add('음악');

        return Array.from(tags);
    }

    private categorizeMedia(analysis: MediaAnalysisResult): string[] {
        const categories: string[] = [];

        // 기본 미디어 카테고리
        categories.push(analysis.fileType);

        // 내용 기반 카테고리
        const topics = analysis.knowledgeExtraction.keyTopics;
        if (topics.some(t => t.includes('회의') || t.includes('협의'))) {
            categories.push('회의자료');
        }
        if (topics.some(t => t.includes('건설') || t.includes('재개발'))) {
            categories.push('건설프로젝트');
        }
        if (topics.some(t => t.includes('분석') || t.includes('평가'))) {
            categories.push('분석자료');
        }
        if (topics.some(t => t.includes('계획') || t.includes('일정'))) {
            categories.push('계획서');
        }

        // 품질 기반 카테고리
        if (analysis.confidence > 0.8) {
            categories.push('고품질');
        } else if (analysis.confidence < 0.5) {
            categories.push('검토필요');
        }

        return categories;
    }

    private calculateConfidence(analysis: MediaAnalysisResult): number {
        let confidence = 0.5;

        // 추출된 정보량에 따른 신뢰도 조정
        if (analysis.knowledgeExtraction.keyTopics.length > 0) confidence += 0.1;
        if (analysis.knowledgeExtraction.entities.people.length > 0) confidence += 0.1;
        if (analysis.knowledgeExtraction.insights.length > 2) confidence += 0.1;

        // 미디어별 특성 고려
        if (analysis.imageAnalysis?.text.length && analysis.imageAnalysis.text.length > 10) {
            confidence += 0.2;
        }
        if (analysis.videoAnalysis?.audioTrack.transcript) {
            confidence += 0.2;
        }
        if (analysis.audioAnalysis?.transcript) {
            confidence += 0.3;
        }

        return Math.min(1.0, confidence);
    }

    private updateConversationContext(projectId: string, analysis: MediaAnalysisResult) {
        let context = this.conversationContext.get(projectId);

        if (!context) {
            context = {
                mediaFiles: [],
                combinedInsights: [],
                crossReferences: {},
                timelineEvents: [],
                narrativeFlow: ''
            };
        }

        context.mediaFiles.push(analysis);
        context.combinedInsights.push(...analysis.knowledgeExtraction.insights);

        // 타임라인 이벤트 추가
        context.timelineEvents.push({
            timestamp: analysis.analysisTime,
            mediaId: analysis.id,
            event: `${analysis.fileType} 파일 분석 완료`,
            significance: analysis.confidence
        });

        // 내러티브 플로우 업데이트
        context.narrativeFlow = this.generateNarrativeFlow(context.mediaFiles);

        this.conversationContext.set(projectId, context);
    }

    private generateNarrativeFlow(mediaFiles: MediaAnalysisResult[]): string {
        if (mediaFiles.length === 0) return '';

        const timeline = mediaFiles
            .sort((a, b) => a.analysisTime.getTime() - b.analysisTime.getTime())
            .map(media => `${media.fileName}: ${media.contextualSummary}`)
            .join(' → ');

        return `미디어 타임라인: ${timeline}`;
    }

    // 공개 메서드들
    getConversationContext(projectId: string): ConversationMediaContext | null {
        return this.conversationContext.get(projectId) || null;
    }

    getMediaAnalysis(mediaId: string): MediaAnalysisResult | null {
        return this.analysisCache.get(mediaId) || null;
    }

    getMediaByProject(projectId: string): MediaAnalysisResult[] {
        const context = this.conversationContext.get(projectId);
        return context ? context.mediaFiles : [];
    }

    clearProjectMedia(projectId: string) {
        this.conversationContext.delete(projectId);
    }

    // 대화 맥락에서 미디어 정보 활용
    generateContextualResponse(query: string, projectId: string): {
        relevantMedia: MediaAnalysisResult[];
        mediaInsights: string[];
        suggestedActions: string[];
    } {
        const context = this.conversationContext.get(projectId);
        if (!context) {
            return { relevantMedia: [], mediaInsights: [], suggestedActions: [] };
        }

        // 쿼리와 관련된 미디어 찾기
        const relevantMedia = context.mediaFiles.filter(media => {
            const searchText = (media.contextualSummary + ' ' + media.knowledgeExtraction.keyTopics.join(' ')).toLowerCase();
            return query.toLowerCase().split(' ').some(keyword => searchText.includes(keyword));
        });

        // 관련 인사이트 추출
        const mediaInsights = relevantMedia.flatMap(media => media.knowledgeExtraction.insights);

        // 제안 액션 추출
        const suggestedActions = relevantMedia.flatMap(media => media.knowledgeExtraction.actionItems);

        return {
            relevantMedia,
            mediaInsights: Array.from(new Set(mediaInsights)),
            suggestedActions: Array.from(new Set(suggestedActions))
        };
    }
    // 고도화된 분석 메서드들

    private analyzeImageContext(imageAnalysis: any) {
        return {
            visualComplexity: imageAnalysis.objects?.length > 5 ? 'high' : 'medium',
            colorHarmony: this.calculateColorHarmony(imageAnalysis.colors?.palette || []),
            compositionType: this.analyzeComposition(imageAnalysis),
            technicalQuality: {
                resolution: imageAnalysis.dimensions ?
                    imageAnalysis.dimensions.width * imageAnalysis.dimensions.height : 0,
                aspectRatio: imageAnalysis.dimensions ?
                    (imageAnalysis.dimensions.width / imageAnalysis.dimensions.height).toFixed(2) : '1.0'
            }
        };
    }

    private analyzeVideoContext(videoAnalysis: any) {
        return {
            narrativeStructure: this.analyzeNarrativeStructure(videoAnalysis.scenes || []),
            pacing: this.analyzePacing(videoAnalysis.scenes || []),
            visualStyle: this.analyzeVisualStyle(videoAnalysis),
            audioQuality: {
                hasTranscript: !!videoAnalysis.audioTrack?.transcript,
                speechClarity: Math.random() * 0.4 + 0.6, // 모의 점수
                backgroundNoise: Math.random() * 0.5
            }
        };
    }

    private analyzeAudioContext(audioAnalysis: any) {
        return {
            speechPattern: this.analyzeSpeechPattern(audioAnalysis.transcript || ''),
            audioCharacteristics: {
                hasMusic: audioAnalysis.music?.detected || false,
                hasSpeech: !!audioAnalysis.transcript,
                dominantFrequency: audioAnalysis.frequency || 'mid'
            },
            contentStructure: this.analyzeAudioStructure(audioAnalysis.topics || [])
        };
    }

    private analyzeSentiment(text: string) {
        const positiveWords = ['성공', '좋은', '훌륭한', '긍정', '개선', '효과적', '만족', '우수', '발전'];
        const negativeWords = ['실패', '나쁜', '문제', '부정', '악화', '비효율', '불만', '부족', '위험'];

        const words = text.toLowerCase().split(/\s+/);
        let positiveScore = 0;
        let negativeScore = 0;

        words.forEach(word => {
            if (positiveWords.some(pos => word.includes(pos))) positiveScore++;
            if (negativeWords.some(neg => word.includes(neg))) negativeScore++;
        });

        const total = positiveScore + negativeScore;
        if (total === 0) return { sentiment: 'neutral', confidence: 0.5, scores: { positive: 0, negative: 0 } };

        const ratio = positiveScore / total;
        return {
            sentiment: ratio > 0.6 ? 'positive' : ratio < 0.4 ? 'negative' : 'neutral',
            confidence: Math.abs(ratio - 0.5) * 2,
            scores: { positive: positiveScore, negative: negativeScore }
        };
    }

    private analyzeComplexity(text: string, mediaType: string) {
        const baseComplexity = {
            textComplexity: this.calculateTextComplexity(text),
            mediaSpecificFactors: this.getMediaSpecificComplexity(mediaType)
        };

        const overallScore = (baseComplexity.textComplexity + baseComplexity.mediaSpecificFactors) / 2;

        return {
            level: overallScore > 0.7 ? 'high' : overallScore > 0.4 ? 'medium' : 'low',
            score: overallScore,
            factors: baseComplexity
        };
    }

    private analyzePurpose(text: string, fileName: string) {
        const purposes = {
            educational: /학습|교육|설명|가르치|배우|이해/g,
            entertainment: /재미|오락|게임|놀이|엔터테인먼트/g,
            informational: /정보|안내|알림|공지|데이터/g,
            promotional: /홍보|광고|마케팅|프로모션|판매/g,
            documentation: /문서|기록|보고|정리|문서화/g
        };

        const scores: any = {};
        let maxScore = 0;
        let primaryPurpose = 'general';

        Object.entries(purposes).forEach(([purpose, pattern]) => {
            const matches = (text.match(pattern) || []).length;
            const fileNameMatches = (fileName.match(pattern) || []).length * 2; // 파일명 가중치
            const totalScore = matches + fileNameMatches;

            scores[purpose] = totalScore;
            if (totalScore > maxScore) {
                maxScore = totalScore;
                primaryPurpose = purpose;
            }
        });

        return {
            primary: primaryPurpose,
            confidence: maxScore / (text.split(/\s+/).length / 100),
            scores
        };
    }

    private calculateMediaQuality(analysis: MediaAnalysisResult) {
        let qualityScore = 0.5; // 기본 점수
        const factors: any = {};

        // 파일 크기 기반 품질 추정
        const sizeQuality = Math.min(analysis.fileSize / (5 * 1024 * 1024), 1); // 5MB 기준
        factors.sizeQuality = sizeQuality;
        qualityScore += sizeQuality * 0.2;

        // 컨텐츠 풍부도
        const contentRichness = (analysis.knowledgeExtraction.keyTopics.length +
            Object.values(analysis.knowledgeExtraction.entities).flat().length) / 20;
        factors.contentRichness = Math.min(contentRichness, 1);
        qualityScore += factors.contentRichness * 0.3;

        // 분석 신뢰도
        factors.analysisConfidence = analysis.confidence;
        qualityScore += analysis.confidence * 0.5;

        return {
            overallScore: Math.min(qualityScore, 1),
            factors,
            recommendation: qualityScore > 0.8 ? 'excellent' :
                qualityScore > 0.6 ? 'good' :
                    qualityScore > 0.4 ? 'fair' : 'needs_improvement'
        };
    }

    // 보조 메서드들
    private calculateColorHarmony(palette: string[]): string {
        if (palette.length < 3) return 'minimal';
        return palette.length > 5 ? 'complex' : 'balanced';
    }

    private analyzeComposition(imageAnalysis: any): string {
        const objectCount = imageAnalysis.objects?.length || 0;
        if (objectCount > 10) return 'complex';
        if (objectCount > 5) return 'balanced';
        return 'simple';
    }

    private analyzeNarrativeStructure(scenes: any[]): string {
        if (scenes.length > 10) return 'multi-act';
        if (scenes.length > 5) return 'structured';
        return 'simple';
    }

    private analyzePacing(scenes: any[]): string {
        const avgDuration = scenes.reduce((sum, scene) => sum + (scene.duration || 30), 0) / scenes.length;
        if (avgDuration < 15) return 'fast';
        if (avgDuration > 45) return 'slow';
        return 'moderate';
    }

    private analyzeVisualStyle(videoAnalysis: any): string {
        // 간단한 스타일 분석
        return 'documentary'; // 기본값
    }

    private analyzeSpeechPattern(transcript: string): any {
        const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = transcript.split(/\s+/).length / sentences.length;

        return {
            avgSentenceLength: Math.round(avgSentenceLength),
            speakingStyle: avgSentenceLength > 20 ? 'formal' : avgSentenceLength > 10 ? 'conversational' : 'casual',
            pauseFrequency: sentences.length / (transcript.length / 1000) // 추정
        };
    }

    private analyzeAudioStructure(topics: string[]): any {
        return {
            topicDiversity: topics.length,
            structureType: topics.length > 5 ? 'multi-topic' : 'focused'
        };
    }

    private calculateTextComplexity(text: string): number {
        const words = text.split(/\s+/);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = words.length / sentences.length;
        const longWords = words.filter(word => word.length > 6).length;
        const longWordRatio = longWords / words.length;

        return Math.min((avgWordsPerSentence / 20) * 0.5 + longWordRatio * 0.5, 1);
    }

    private getMediaSpecificComplexity(mediaType: string): number {
        switch (mediaType) {
            case 'video': return 0.8; // 비디오는 일반적으로 복잡
            case 'audio': return 0.6;
            case 'image': return 0.4;
            default: return 0.5;
        }
    }
}

export const mediaAnalysisService = new MediaAnalysisService();
