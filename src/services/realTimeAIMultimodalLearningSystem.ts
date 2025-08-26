import realTimeAIAlertSystem from './realTimeAIAlertSystem';

// 멀티모달 학습 인터페이스
interface MultimodalInput {
    id: string;
    type: 'image' | 'text' | 'audio' | 'video' | 'mixed';
    content: {
        text?: string;
        imageUrl?: string;
        audioUrl?: string;
        videoUrl?: string;
        metadata?: Record<string, any>;
    };
    timestamp: Date;
    userId: string;
    sessionId: string;
    confidence: number;
}

interface LearningPattern {
    id: string;
    userId: string;
    patternType: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
    strength: number; // 0-1
    frequency: number;
    lastObserved: Date;
    modalities: string[];
    effectiveness: number; // 0-1
}

interface AdaptiveLearningPath {
    id: string;
    userId: string;
    currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    targetLevel: string;
    progress: number; // 0-100
    modules: LearningModule[];
    estimatedCompletion: Date;
    lastUpdated: Date;
    performance: {
        accuracy: number;
        speed: number;
        retention: number;
        engagement: number;
    };
}

interface LearningModule {
    id: string;
    title: string;
    type: 'visual' | 'interactive' | 'textual' | 'audio' | 'mixed';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    duration: number; // minutes
    prerequisites: string[];
    content: {
        text?: string;
        images?: string[];
        audio?: string;
        video?: string;
        interactive?: any;
    };
    completionRate: number;
    averageScore: number;
}

interface MultimodalAnalysis {
    id: string;
    inputId: string;
    userId: string;
    analysis: {
        textAnalysis?: {
            sentiment: 'positive' | 'negative' | 'neutral';
            topics: string[];
            complexity: number;
            keywords: string[];
        };
        imageAnalysis?: {
            objects: string[];
            emotions: string[];
            colors: string[];
            composition: string;
        };
        audioAnalysis?: {
            transcription: string;
            emotion: string;
            tone: string;
            clarity: number;
        };
        crossModalInsights: string[];
    };
    timestamp: Date;
    confidence: number;
}

interface LearningRecommendation {
    id: string;
    userId: string;
    type: 'content' | 'activity' | 'path' | 'review';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;
    reasoning: string;
    modalities: string[];
    estimatedImpact: number;
    timestamp: Date;
}

interface MultimodalLearningMetrics {
    totalUsers: number;
    activeSessions: number;
    averageEngagement: number;
    learningEffectiveness: number;
    multimodalUsage: number;
    patternDetectionAccuracy: number;
    recommendationsGenerated: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

class RealTimeAIMultimodalLearningSystem {
    private inputs: MultimodalInput[] = [];
    private patterns: Map<string, LearningPattern> = new Map();
    private learningPaths: Map<string, AdaptiveLearningPath> = new Map();
    private analyses: MultimodalAnalysis[] = [];
    private recommendations: LearningRecommendation[] = [];
    private modules: LearningModule[] = [];
    private isRunning: boolean = false;
    private updateInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.initializeSystem();
    }

    private initializeSystem(): void {
        console.log('🎓 실시간 AI 멀티모달 학습 시스템 초기화 중...');

        // 초기 학습 모듈 생성
        this.createInitialModules();

        // 실시간 패턴 감지 시작
        this.startPatternDetection();

        // 적응형 학습 경로 생성 시작
        this.startAdaptiveLearningPathGeneration();

        // 멀티모달 분석 시작
        this.startMultimodalAnalysis();

        // 학습 추천 생성 시작
        this.startLearningRecommendationGeneration();

        console.log('✅ 실시간 AI 멀티모달 학습 시스템 초기화 완료');
    }

    private createInitialModules(): void {
        this.modules = [
            {
                id: 'module-001',
                title: '시각적 학습 기초',
                type: 'visual',
                difficulty: 'easy',
                duration: 30,
                prerequisites: [],
                content: {
                    text: '시각적 학습의 기본 원리와 효과적인 이미지 분석 방법을 학습합니다.',
                    images: ['visual-learning-1.jpg', 'visual-learning-2.jpg'],
                    video: 'visual-learning-intro.mp4'
                },
                completionRate: 0.85,
                averageScore: 0.78
            },
            {
                id: 'module-002',
                title: '청각적 학습 심화',
                type: 'audio',
                difficulty: 'medium',
                duration: 45,
                prerequisites: ['module-001'],
                content: {
                    text: '청각적 정보 처리와 음성 인식 기술을 심화 학습합니다.',
                    audio: 'audio-learning-advanced.mp3',
                    interactive: {
                        type: 'audio_exercise',
                        exercises: ['pronunciation', 'listening_comprehension']
                    }
                },
                completionRate: 0.72,
                averageScore: 0.81
            },
            {
                id: 'module-003',
                title: '멀티모달 통합 학습',
                type: 'mixed',
                difficulty: 'hard',
                duration: 60,
                prerequisites: ['module-001', 'module-002'],
                content: {
                    text: '여러 감각을 통합하여 효과적인 학습을 수행하는 방법을 학습합니다.',
                    images: ['multimodal-1.jpg', 'multimodal-2.jpg'],
                    audio: 'multimodal-audio.mp3',
                    video: 'multimodal-demo.mp4',
                    interactive: {
                        type: 'multimodal_exercise',
                        exercises: ['cross_modal_integration', 'sensory_synchronization']
                    }
                },
                completionRate: 0.68,
                averageScore: 0.75
            }
        ];
    }

    private startPatternDetection(): void {
        this.updateInterval = setInterval(() => {
            this.detectLearningPatterns();
            this.updatePatternStrengths();
            this.generatePatternInsights();
        }, 10000); // 10초마다 업데이트
    }

    private detectLearningPatterns(): void {
        // 사용자별 학습 패턴 감지
        const userGroups = this.groupInputsByUser();

        userGroups.forEach((userInputs, userId) => {
            const patterns = this.analyzeUserPatterns(userInputs);
            patterns.forEach(pattern => {
                const existingPattern = this.patterns.get(`${userId}-${pattern.patternType}`);
                if (existingPattern) {
                    existingPattern.frequency += 1;
                    existingPattern.lastObserved = new Date();
                    existingPattern.effectiveness = this.calculatePatternEffectiveness(userInputs);
                } else {
                    pattern.id = `${userId}-${pattern.patternType}`;
                    pattern.userId = userId;
                    this.patterns.set(pattern.id, pattern);
                }
            });
        });
    }

    private groupInputsByUser(): Map<string, MultimodalInput[]> {
        const groups = new Map<string, MultimodalInput[]>();
        this.inputs.forEach(input => {
            if (!groups.has(input.userId)) {
                groups.set(input.userId, []);
            }
            groups.get(input.userId)!.push(input);
        });
        return groups;
    }

    private analyzeUserPatterns(inputs: MultimodalInput[]): LearningPattern[] {
        const patterns: LearningPattern[] = [];

        // 시각적 패턴 분석
        const visualInputs = inputs.filter(input =>
            input.type === 'image' || input.content.imageUrl ||
            input.content.text?.includes('이미지') || input.content.text?.includes('그림')
        );
        if (visualInputs.length > 0) {
            patterns.push({
                id: '',
                userId: '',
                patternType: 'visual',
                strength: Math.min(1, visualInputs.length / inputs.length),
                frequency: visualInputs.length,
                lastObserved: new Date(),
                modalities: ['image', 'text'],
                effectiveness: this.calculatePatternEffectiveness(visualInputs)
            });
        }

        // 청각적 패턴 분석
        const auditoryInputs = inputs.filter(input =>
            input.type === 'audio' || input.content.audioUrl ||
            input.content.text?.includes('음성') || input.content.text?.includes('듣기')
        );
        if (auditoryInputs.length > 0) {
            patterns.push({
                id: '',
                userId: '',
                patternType: 'auditory',
                strength: Math.min(1, auditoryInputs.length / inputs.length),
                frequency: auditoryInputs.length,
                lastObserved: new Date(),
                modalities: ['audio', 'text'],
                effectiveness: this.calculatePatternEffectiveness(auditoryInputs)
            });
        }

        // 읽기 패턴 분석
        const readingInputs = inputs.filter(input =>
            input.type === 'text' && input.content.text && input.content.text.length > 100
        );
        if (readingInputs.length > 0) {
            patterns.push({
                id: '',
                userId: '',
                patternType: 'reading',
                strength: Math.min(1, readingInputs.length / inputs.length),
                frequency: readingInputs.length,
                lastObserved: new Date(),
                modalities: ['text'],
                effectiveness: this.calculatePatternEffectiveness(readingInputs)
            });
        }

        return patterns;
    }

    private calculatePatternEffectiveness(inputs: MultimodalInput[]): number {
        const avgConfidence = inputs.reduce((sum, input) => sum + input.confidence, 0) / inputs.length;
        const recentInputs = inputs.filter(input =>
            Date.now() - input.timestamp.getTime() < 24 * 60 * 60 * 1000 // 24시간 내
        );
        const recencyFactor = recentInputs.length / inputs.length;

        return (avgConfidence * 0.6 + recencyFactor * 0.4);
    }

    private updatePatternStrengths(): void {
        this.patterns.forEach(pattern => {
            // 시간 경과에 따른 강도 감소
            const timeSinceLastObserved = Date.now() - pattern.lastObserved.getTime();
            const decayFactor = Math.exp(-timeSinceLastObserved / (7 * 24 * 60 * 60 * 1000)); // 1주일 반감기

            pattern.strength = Math.max(0.1, pattern.strength * decayFactor);
        });
    }

    private generatePatternInsights(): void {
        this.patterns.forEach(pattern => {
            if (pattern.strength > 0.7 && pattern.effectiveness > 0.8) {
                this.createPatternInsight(pattern);
            }
        });
    }

    private createPatternInsight(pattern: LearningPattern): void {
        const insight: LearningRecommendation = {
            id: `pattern-${Date.now()}`,
            userId: pattern.userId,
            type: 'activity',
            priority: 'high',
            title: '강한 학습 패턴 감지',
            description: `${pattern.patternType} 학습 패턴이 매우 효과적으로 작동하고 있습니다.`,
            reasoning: `패턴 강도: ${(pattern.strength * 100).toFixed(1)}%, 효과성: ${(pattern.effectiveness * 100).toFixed(1)}%`,
            modalities: pattern.modalities,
            estimatedImpact: pattern.effectiveness,
            timestamp: new Date()
        };

        this.recommendations.push(insight);
    }

    private startAdaptiveLearningPathGeneration(): void {
        setInterval(() => {
            this.generateAdaptiveLearningPaths();
            this.updateLearningProgress();
            this.optimizeLearningPaths();
        }, 30000); // 30초마다 업데이트
    }

    private generateAdaptiveLearningPaths(): void {
        const userGroups = this.groupInputsByUser();

        userGroups.forEach((userInputs, userId) => {
            const existingPath = this.learningPaths.get(userId);
            if (!existingPath) {
                const newPath = this.createNewLearningPath(userId, userInputs);
                this.learningPaths.set(userId, newPath);
            } else {
                this.updateExistingLearningPath(existingPath, userInputs);
            }
        });
    }

    private createNewLearningPath(userId: string, inputs: MultimodalInput[]): AdaptiveLearningPath {
        const patterns = this.patterns.get(`${userId}-visual`) ||
            this.patterns.get(`${userId}-auditory`) ||
            this.patterns.get(`${userId}-reading`);

        const currentLevel = this.determineUserLevel(inputs);
        const targetLevel = this.determineTargetLevel(currentLevel, patterns);
        const recommendedModules = this.recommendModules(currentLevel, patterns);

        return {
            id: `path-${userId}`,
            userId: userId,
            currentLevel: currentLevel,
            targetLevel: targetLevel,
            progress: 0,
            modules: recommendedModules,
            estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일
            lastUpdated: new Date(),
            performance: {
                accuracy: 0.75,
                speed: 0.8,
                retention: 0.7,
                engagement: 0.85
            }
        };
    }

    private determineUserLevel(inputs: MultimodalInput[]): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
        const totalInputs = inputs.length;
        const avgConfidence = inputs.reduce((sum, input) => sum + input.confidence, 0) / inputs.length;
        const complexity = this.calculateInputComplexity(inputs);

        if (totalInputs < 10 || avgConfidence < 0.5) return 'beginner';
        if (totalInputs < 50 || avgConfidence < 0.7) return 'intermediate';
        if (totalInputs < 100 || avgConfidence < 0.85) return 'advanced';
        return 'expert';
    }

    private calculateInputComplexity(inputs: MultimodalInput[]): number {
        let complexity = 0;
        inputs.forEach(input => {
            if (input.type === 'mixed') complexity += 3;
            else if (input.type === 'video') complexity += 2;
            else if (input.type === 'image' || input.type === 'audio') complexity += 1;
            else complexity += 0.5;

            if (input.content.text && input.content.text.length > 200) complexity += 1;
        });
        return complexity / inputs.length;
    }

    private determineTargetLevel(currentLevel: string, pattern?: LearningPattern): string {
        if (!pattern) return currentLevel;

        const levelProgression = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levelProgression.indexOf(currentLevel);

        if (pattern.effectiveness > 0.9 && pattern.strength > 0.8) {
            return levelProgression[Math.min(currentIndex + 1, levelProgression.length - 1)];
        }

        return currentLevel;
    }

    private recommendModules(level: string, pattern?: LearningPattern): LearningModule[] {
        const levelModules = this.modules.filter(module => {
            switch (level) {
                case 'beginner': return module.difficulty === 'easy';
                case 'intermediate': return module.difficulty === 'easy' || module.difficulty === 'medium';
                case 'advanced': return module.difficulty === 'medium' || module.difficulty === 'hard';
                case 'expert': return module.difficulty === 'hard' || module.difficulty === 'expert';
                default: return true;
            }
        });

        if (pattern) {
            // 패턴에 맞는 모듈 우선 추천
            return levelModules.sort((a, b) => {
                const aMatch = a.type === pattern.patternType ? 1 : 0;
                const bMatch = b.type === pattern.patternType ? 1 : 0;
                return bMatch - aMatch;
            }).slice(0, 5);
        }

        return levelModules.slice(0, 5);
    }

    private updateExistingLearningPath(path: AdaptiveLearningPath, inputs: MultimodalInput[]): void {
        // 진행률 업데이트
        const recentInputs = inputs.filter(input =>
            Date.now() - input.timestamp.getTime() < 24 * 60 * 60 * 1000
        );

        if (recentInputs.length > 0) {
            path.progress = Math.min(100, path.progress + (recentInputs.length * 2));
            path.lastUpdated = new Date();
        }

        // 성능 지표 업데이트
        const avgConfidence = inputs.reduce((sum, input) => sum + input.confidence, 0) / inputs.length;
        path.performance.accuracy = avgConfidence;
        path.performance.engagement = Math.min(1, recentInputs.length / 10);
    }

    private updateLearningProgress(): void {
        this.learningPaths.forEach(path => {
            // 모듈 완료율 업데이트
            path.modules.forEach(module => {
                if (Math.random() > 0.8) { // 20% 확률로 완료율 증가
                    module.completionRate = Math.min(100, module.completionRate + Math.random() * 10);
                }
            });
        });
    }

    private optimizeLearningPaths(): void {
        this.learningPaths.forEach(path => {
            // 성능이 낮은 모듈 교체
            const lowPerformanceModules = path.modules.filter(module =>
                module.completionRate < 50 || module.averageScore < 0.6
            );

            if (lowPerformanceModules.length > 0) {
                const alternativeModules = this.recommendModules(path.currentLevel);
                lowPerformanceModules.forEach(lowModule => {
                    const alternative = alternativeModules.find(alt =>
                        alt.id !== lowModule.id && alt.difficulty === lowModule.difficulty
                    );
                    if (alternative) {
                        const index = path.modules.indexOf(lowModule);
                        path.modules[index] = alternative;
                    }
                });
            }
        });
    }

    private startMultimodalAnalysis(): void {
        setInterval(() => {
            this.analyzeMultimodalInputs();
            this.generateCrossModalInsights(this.inputs);
        }, 15000); // 15초마다 업데이트
    }

    private analyzeMultimodalInputs(): void {
        const recentInputs = this.inputs.filter(input =>
            Date.now() - input.timestamp.getTime() < 5 * 60 * 1000 // 5분 내
        );

        recentInputs.forEach(input => {
            const analysis: MultimodalAnalysis = {
                id: `analysis-${Date.now()}-${Math.random()}`,
                inputId: input.id,
                userId: input.userId,
                analysis: this.performMultimodalAnalysis(input),
                timestamp: new Date(),
                confidence: input.confidence
            };

            this.analyses.push(analysis);
        });
    }

    private performMultimodalAnalysis(input: MultimodalInput): any {
        const analysis: any = {};

        // 텍스트 분석
        if (input.content.text) {
            analysis.textAnalysis = {
                sentiment: this.analyzeSentiment(input.content.text),
                topics: this.extractTopics(input.content.text),
                complexity: this.calculateTextComplexity(input.content.text),
                keywords: this.extractKeywords(input.content.text)
            };
        }

        // 이미지 분석
        if (input.content.imageUrl) {
            analysis.imageAnalysis = {
                objects: this.detectObjects(input.content.imageUrl),
                emotions: this.detectEmotions(input.content.imageUrl),
                colors: this.analyzeColors(input.content.imageUrl),
                composition: this.analyzeComposition(input.content.imageUrl)
            };
        }

        // 오디오 분석
        if (input.content.audioUrl) {
            analysis.audioAnalysis = {
                transcription: this.transcribeAudio(input.content.audioUrl),
                emotion: this.detectAudioEmotion(input.content.audioUrl),
                tone: this.analyzeTone(input.content.audioUrl),
                clarity: this.assessAudioClarity(input.content.audioUrl)
            };
        }

        // 크로스모달 인사이트
        analysis.crossModalInsights = this.generateCrossModalInsights(analysis);

        return analysis;
    }

    private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
        const positiveWords = ['좋다', '훌륭하다', '멋지다', '재미있다', '유용하다'];
        const negativeWords = ['나쁘다', '어렵다', '지루하다', '힘들다', '불편하다'];

        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    private extractTopics(text: string): string[] {
        const topics = ['학습', '기술', '예술', '과학', '역사', '문학', '수학', '언어'];
        return topics.filter(topic => text.includes(topic));
    }

    private calculateTextComplexity(text: string): number {
        const words = text.split(' ');
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        const sentenceCount = text.split(/[.!?]/).length;
        return Math.min(1, (avgWordLength * sentenceCount) / 100);
    }

    private extractKeywords(text: string): string[] {
        const stopWords = ['이', '그', '저', '것', '수', '등', '때', '곳', '말', '일'];
        const words = text.split(' ').filter(word =>
            word.length > 1 && !stopWords.includes(word)
        );
        return words.slice(0, 5);
    }

    private detectObjects(imageUrl: string): string[] {
        // 시뮬레이션된 객체 감지
        const objects = ['사람', '책', '컴퓨터', '의자', '테이블', '창문', '문'];
        return objects.filter(() => Math.random() > 0.5).slice(0, 3);
    }

    private detectEmotions(imageUrl: string): string[] {
        const emotions = ['행복', '집중', '호기심', '지루함', '혼란'];
        return emotions.filter(() => Math.random() > 0.6).slice(0, 2);
    }

    private analyzeColors(imageUrl: string): string[] {
        const colors = ['파랑', '빨강', '초록', '노랑', '보라', '주황'];
        return colors.filter(() => Math.random() > 0.5).slice(0, 3);
    }

    private analyzeComposition(imageUrl: string): string {
        const compositions = ['대칭', '비대칭', '중앙집중', '분산'];
        return compositions[Math.floor(Math.random() * compositions.length)];
    }

    private transcribeAudio(audioUrl: string): string {
        return "오디오 내용의 텍스트 변환 결과입니다.";
    }

    private detectAudioEmotion(audioUrl: string): string {
        const emotions = ['기쁨', '슬픔', '분노', '평온', '흥미'];
        return emotions[Math.floor(Math.random() * emotions.length)];
    }

    private analyzeTone(audioUrl: string): string {
        const tones = ['따뜻함', '차가움', '부드러움', '강함', '약함'];
        return tones[Math.floor(Math.random() * tones.length)];
    }

    private assessAudioClarity(audioUrl: string): number {
        return Math.random() * 0.5 + 0.5; // 0.5-1.0
    }

    private generateCrossModalInsights(analysis: any): string[] {
        const insights: string[] = [];

        if (analysis.textAnalysis && analysis.imageAnalysis) {
            if (analysis.textAnalysis.sentiment === 'positive' &&
                analysis.imageAnalysis.emotions.includes('행복')) {
                insights.push('텍스트와 이미지에서 일관된 긍정적 감정이 감지되었습니다.');
            }
        }

        if (analysis.textAnalysis && analysis.audioAnalysis) {
            if (analysis.textAnalysis.complexity > 0.7 &&
                analysis.audioAnalysis.clarity > 0.8) {
                insights.push('복잡한 텍스트와 명확한 오디오가 조화를 이루고 있습니다.');
            }
        }

        return insights;
    }

    private startLearningRecommendationGeneration(): void {
        setInterval(() => {
            this.generatePersonalizedRecommendations();
            this.updateRecommendationPriorities();
        }, 60000); // 1분마다 업데이트
    }

    private generatePersonalizedRecommendations(): void {
        this.learningPaths.forEach(path => {
            const userPatterns = Array.from(this.patterns.values())
                .filter(pattern => pattern.userId === path.userId);

            const recommendations = this.createPersonalizedRecommendations(path, userPatterns);
            this.recommendations.push(...recommendations);
        });
    }

    private createPersonalizedRecommendations(
        path: AdaptiveLearningPath,
        patterns: LearningPattern[]
    ): LearningRecommendation[] {
        const recommendations: LearningRecommendation[] = [];

        // 진행률 기반 추천
        if (path.progress < 30) {
            recommendations.push({
                id: `rec-${Date.now()}-1`,
                userId: path.userId,
                type: 'content',
                priority: 'high',
                title: '학습 동기 부여 필요',
                description: '현재 학습 진행률이 낮습니다. 더 흥미로운 콘텐츠를 추천합니다.',
                reasoning: `현재 진행률: ${path.progress}%`,
                modalities: ['mixed'],
                estimatedImpact: 0.8,
                timestamp: new Date()
            });
        }

        // 패턴 기반 추천
        const strongestPattern = patterns.reduce((max, pattern) =>
            pattern.strength > max.strength ? pattern : max
        );

        if (strongestPattern && strongestPattern.strength > 0.7) {
            recommendations.push({
                id: `rec-${Date.now()}-2`,
                userId: path.userId,
                type: 'activity',
                priority: 'medium',
                title: '강점 활용 학습',
                description: `${strongestPattern.patternType} 학습 패턴을 활용한 활동을 추천합니다.`,
                reasoning: `패턴 강도: ${(strongestPattern.strength * 100).toFixed(1)}%`,
                modalities: strongestPattern.modalities,
                estimatedImpact: strongestPattern.effectiveness,
                timestamp: new Date()
            });
        }

        // 성능 기반 추천
        if (path.performance.accuracy < 0.7) {
            recommendations.push({
                id: `rec-${Date.now()}-3`,
                userId: path.userId,
                type: 'review',
                priority: 'high',
                title: '복습 필요',
                description: '학습 정확도가 낮습니다. 이전 내용을 복습해보세요.',
                reasoning: `현재 정확도: ${(path.performance.accuracy * 100).toFixed(1)}%`,
                modalities: ['text', 'visual'],
                estimatedImpact: 0.9,
                timestamp: new Date()
            });
        }

        return recommendations;
    }

    private updateRecommendationPriorities(): void {
        this.recommendations.forEach(rec => {
            const timeSinceCreation = Date.now() - rec.timestamp.getTime();
            if (timeSinceCreation > 24 * 60 * 60 * 1000) { // 24시간 경과
                rec.priority = 'urgent';
            }
        });
    }

    // 공개 메서드들
    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('🚀 실시간 AI 멀티모달 학습 시스템 시작');

        // 알림 생성
        realTimeAIAlertSystem.createAlert({
            id: `multimodal-start-${Date.now()}`,
            type: 'info',
            severity: 'medium',
            title: '실시간 AI 멀티모달 학습 시스템 시작',
            message: '멀티모달 학습 시스템이 성공적으로 시작되었습니다.',
            timestamp: new Date(),
            source: 'realTimeAIMultimodalLearningSystem',
            metadata: {
                modulesCount: this.modules.length,
                features: 'multimodal learning, pattern detection, adaptive paths'
            }
        });
    }

    public stop(): void {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        console.log('🛑 실시간 AI 멀티모달 학습 시스템 중지');
    }

    public getMetrics(): MultimodalLearningMetrics {
        const uniqueUsers = new Set(this.inputs.map(input => input.userId)).size;
        const activeSessions = new Set(this.inputs
            .filter(input => Date.now() - input.timestamp.getTime() < 60 * 60 * 1000)
            .map(input => input.sessionId)
        ).size;

        const avgEngagement = this.learningPaths.size > 0 ?
            Array.from(this.learningPaths.values())
                .reduce((sum, path) => sum + path.performance.engagement, 0) / this.learningPaths.size : 0;

        const learningEffectiveness = this.patterns.size > 0 ?
            Array.from(this.patterns.values())
                .reduce((sum, pattern) => sum + pattern.effectiveness, 0) / this.patterns.size : 0;

        return {
            totalUsers: uniqueUsers,
            activeSessions: activeSessions,
            averageEngagement: avgEngagement,
            learningEffectiveness: learningEffectiveness,
            multimodalUsage: this.inputs.filter(input => input.type === 'mixed').length / this.inputs.length,
            patternDetectionAccuracy: 0.85,
            recommendationsGenerated: this.recommendations.length,
            systemHealth: this.getSystemHealth()
        };
    }

    private getSystemHealth(): 'excellent' | 'good' | 'warning' | 'critical' {
        const metrics = this.getMetrics();

        if (metrics.averageEngagement > 0.8 && metrics.learningEffectiveness > 0.8) {
            return 'excellent';
        } else if (metrics.averageEngagement > 0.6 && metrics.learningEffectiveness > 0.6) {
            return 'good';
        } else if (metrics.averageEngagement > 0.4 && metrics.learningEffectiveness > 0.4) {
            return 'warning';
        } else {
            return 'critical';
        }
    }

    public addInput(input: MultimodalInput): void {
        this.inputs.push(input);

        // 입력 수 제한
        if (this.inputs.length > 1000) {
            this.inputs = this.inputs.slice(-500);
        }
    }

    public getLearningPath(userId: string): AdaptiveLearningPath | undefined {
        return this.learningPaths.get(userId);
    }

    public getPatterns(userId: string): LearningPattern[] {
        return Array.from(this.patterns.values()).filter(pattern => pattern.userId === userId);
    }

    public getRecommendations(userId: string): LearningRecommendation[] {
        return this.recommendations.filter(rec => rec.userId === userId);
    }

    public getAnalyses(userId: string): MultimodalAnalysis[] {
        return this.analyses.filter(analysis => analysis.userId === userId);
    }

    public getModules(): LearningModule[] {
        return this.modules;
    }

    public addModule(module: LearningModule): void {
        this.modules.push(module);
        console.log(`✅ 새로운 학습 모듈 추가: ${module.title}`);
    }

    public updateModule(moduleId: string, updates: Partial<LearningModule>): void {
        const module = this.modules.find(m => m.id === moduleId);
        if (module) {
            Object.assign(module, updates);
            console.log(`✅ 모듈 업데이트: ${module.title}`);
        }
    }
}

// 싱글톤 인스턴스 생성
const realTimeAIMultimodalLearningSystem = new RealTimeAIMultimodalLearningSystem();

export default realTimeAIMultimodalLearningSystem;
