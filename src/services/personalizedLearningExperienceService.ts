import { UserProfile } from './advancedConversationMemoryService';
import { errorLogger, toError } from '../utils/errorLogger';
import { CORBU_LEARNING_EXPERIENCE_STORAGE_KEY } from './personalizedLearningExperienceStorageKeys';

export interface LearningExperience {
    user_id: string;
    session_id: string;
    current_learning_path: LearningPath;
    learning_goals: LearningGoal[];
    progress_tracking: ProgressTracking;
    adaptive_content: AdaptiveContent;
    learning_recommendations: LearningRecommendation[];
    difficulty_adjustment: DifficultyAdjustment;
    last_updated: Date;
}

export interface LearningPath {
    path_id: string;
    path_name: string;
    description: string;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimated_duration: number; // hours
    prerequisites: string[];
    modules: LearningModule[];
    current_module_index: number;
    completion_percentage: number;
    start_date: Date;
    target_completion_date?: Date;
}

export interface LearningModule {
    module_id: string;
    title: string;
    description: string;
    content_type: 'theory' | 'practice' | 'project' | 'assessment';
    difficulty: number; // 1-10
    estimated_time: number; // minutes
    prerequisites: string[];
    learning_objectives: string[];
    resources: LearningResource[];
    completed: boolean;
    completion_date?: Date;
    performance_score?: number; // 0-100
}

export interface LearningResource {
    resource_id: string;
    type: 'video' | 'article' | 'code_example' | 'interactive_exercise' | 'quiz';
    title: string;
    url?: string;
    content?: string;
    duration?: number; // minutes
    difficulty: number; // 1-10
    tags: string[];
}

export interface LearningGoal {
    goal_id: string;
    title: string;
    description: string;
    category: 'skill_development' | 'knowledge_acquisition' | 'project_completion' | 'certification';
    priority: 'low' | 'medium' | 'high' | 'critical';
    target_date?: Date;
    progress: number; // 0-100
    status: 'not_started' | 'in_progress' | 'completed' | 'paused';
    milestones: LearningMilestone[];
}

export interface LearningMilestone {
    milestone_id: string;
    title: string;
    description: string;
    target_date?: Date;
    completed: boolean;
    completion_date?: Date;
    difficulty: number; // 1-10
}

export interface ProgressTracking {
    overall_progress: number; // 0-100
    skill_progress: SkillProgress[];
    time_spent: TimeTracking;
    performance_metrics: PerformanceMetric[];
    learning_velocity: number; // modules per week
    retention_rate: number; // 0-100
}

export interface SkillProgress {
    skill_name: string;
    current_level: number; // 1-10
    target_level: number; // 1-10
    progress_percentage: number; // 0-100
    last_assessment_date: Date;
    improvement_rate: number; // points per week
    confidence_level: number; // 0-100
}

export interface TimeTracking {
    total_time_spent: number; // minutes
    average_session_length: number; // minutes
    most_productive_hours: number[];
    weekly_learning_time: number[]; // minutes per day of week
    consistency_score: number; // 0-100
}

export interface PerformanceMetric {
    metric_name: string;
    value: number;
    unit: string;
    trend: 'improving' | 'stable' | 'declining';
    last_updated: Date;
    target_value?: number;
}

export interface AdaptiveContent {
    content_adaptation_rules: ContentAdaptationRule[];
    personalized_resources: PersonalizedResource[];
    difficulty_scaling: DifficultyScaling;
    learning_style_adaptation: LearningStyleAdaptation;
}

export interface ContentAdaptationRule {
    rule_id: string;
    condition: string;
    action: string;
    priority: number;
    enabled: boolean;
    last_triggered?: Date;
}

export interface PersonalizedResource {
    resource_id: string;
    title: string;
    content: string;
    adaptation_reason: string;
    user_preference_match: number; // 0-100
    difficulty_match: number; // 0-100
    learning_style_match: number; // 0-100
}

export interface DifficultyScaling {
    current_difficulty: number; // 1-10
    target_difficulty: number; // 1-10
    scaling_factor: number; // 0.1-2.0
    adaptation_speed: 'slow' | 'medium' | 'fast';
    last_adjustment: Date;
    adjustment_reason: string;
}

export interface LearningStyleAdaptation {
    primary_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    secondary_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    adaptation_strategies: AdaptationStrategy[];
    effectiveness_score: number; // 0-100
}

export interface AdaptationStrategy {
    strategy_id: string;
    name: string;
    description: string;
    learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    implementation: string;
    effectiveness: number; // 0-100
}

export interface LearningRecommendation {
    recommendation_id: string;
    type: 'next_module' | 'review' | 'practice' | 'challenge' | 'break';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimated_impact: number; // 0-100
    time_estimate: number; // minutes
    prerequisites: string[];
    reasoning: string;
    user_feedback?: UserFeedback;
}

export interface UserFeedback {
    rating: number; // 1-5
    helpful: boolean;
    implemented: boolean;
    comments?: string;
    timestamp: Date;
}

export interface DifficultyAdjustment {
    current_level: number; // 1-10
    target_level: number; // 1-10
    adjustment_history: DifficultyAdjustment[];
    factors: AdjustmentFactor[];
    next_review_date: Date;
}

export interface AdjustmentFactor {
    factor_name: string;
    impact: number; // -1 to 1
    weight: number; // 0-1
    description: string;
}

class PersonalizedLearningExperienceService {
    private learningExperiences: Map<string, LearningExperience> = new Map();
    private learningPaths: Map<string, LearningPath> = new Map();
    private contentLibrary: Map<string, LearningResource> = new Map();

    constructor() {
        this.initializeService();
    }

    // 서비스 초기화
    private initializeService(): void {
        errorLogger.info('Personalized Learning Experience Service initialized', {
            component: 'personalizedLearningExperienceService',
            action: 'initializeService',
        });
        this.initializeLearningPaths();
        this.initializeContentLibrary();
        this.loadPersistedData();
    }

    // 학습 경험 생성 또는 가져오기
    async getLearningExperience(userId: string, sessionId: string): Promise<LearningExperience> {
        const experienceKey = `${userId}-${sessionId}`;

        if (!this.learningExperiences.has(experienceKey)) {
            const newExperience = await this.createNewLearningExperience(userId, sessionId);
            this.learningExperiences.set(experienceKey, newExperience);
        }

        return this.learningExperiences.get(experienceKey)!;
    }

    // 새 학습 경험 생성
    private async createNewLearningExperience(userId: string, sessionId: string): Promise<LearningExperience> {
        const learningPath = await this.recommendLearningPath(userId);

        return {
            user_id: userId,
            session_id: sessionId,
            current_learning_path: learningPath,
            learning_goals: await this.generateLearningGoals(userId),
            progress_tracking: this.initializeProgressTracking(),
            adaptive_content: this.initializeAdaptiveContent(),
            learning_recommendations: [],
            difficulty_adjustment: this.initializeDifficultyAdjustment(),
            last_updated: new Date()
        };
    }

    // 학습 경로 추천
    private async recommendLearningPath(userId: string): Promise<LearningPath> {
        // 실제 구현에서는 사용자 프로필과 선호도를 기반으로 추천
        const availablePaths = Array.from(this.learningPaths.values());

        // 기본적으로 중급 웹 개발 경로 추천
        const recommendedPath = availablePaths.find(path =>
            path.path_name.includes('웹 개발') && path.difficulty_level === 'intermediate'
        ) || availablePaths[0];

        return {
            ...recommendedPath,
            path_id: `${recommendedPath.path_id}-${userId}`,
            current_module_index: 0,
            completion_percentage: 0,
            start_date: new Date()
        };
    }

    // 학습 목표 생성
    private async generateLearningGoals(userId: string): Promise<LearningGoal[]> {
        return [
            {
                goal_id: `goal-${userId}-1`,
                title: '웹 개발 기초 마스터',
                description: 'HTML, CSS, JavaScript의 기본 개념과 실무 활용 능력 습득',
                category: 'skill_development',
                priority: 'high',
                progress: 0,
                status: 'not_started',
                milestones: [
                    {
                        milestone_id: `milestone-${userId}-1`,
                        title: 'HTML 구조 이해',
                        description: '시맨틱 HTML과 웹 접근성 이해',
                        completed: false,
                        difficulty: 3
                    },
                    {
                        milestone_id: `milestone-${userId}-2`,
                        title: 'CSS 스타일링',
                        description: 'Flexbox와 Grid를 활용한 레이아웃 구성',
                        completed: false,
                        difficulty: 5
                    },
                    {
                        milestone_id: `milestone-${userId}-3`,
                        title: 'JavaScript 기초',
                        description: 'DOM 조작과 이벤트 처리',
                        completed: false,
                        difficulty: 6
                    }
                ]
            },
            {
                goal_id: `goal-${userId}-2`,
                title: 'React 프레임워크 학습',
                description: '현대적인 웹 애플리케이션 개발을 위한 React 마스터',
                category: 'skill_development',
                priority: 'medium',
                progress: 0,
                status: 'not_started',
                milestones: [
                    {
                        milestone_id: `milestone-${userId}-4`,
                        title: 'React 컴포넌트',
                        description: '함수형 컴포넌트와 Hooks 이해',
                        completed: false,
                        difficulty: 7
                    },
                    {
                        milestone_id: `milestone-${userId}-5`,
                        title: '상태 관리',
                        description: 'useState, useContext, Redux 활용',
                        completed: false,
                        difficulty: 8
                    }
                ]
            }
        ];
    }

    // 진행 상황 추적 초기화
    private initializeProgressTracking(): ProgressTracking {
        return {
            overall_progress: 0,
            skill_progress: [],
            time_spent: {
                total_time_spent: 0,
                average_session_length: 0,
                most_productive_hours: [],
                weekly_learning_time: new Array(7).fill(0),
                consistency_score: 0
            },
            performance_metrics: [],
            learning_velocity: 0,
            retention_rate: 0
        };
    }

    // 적응형 콘텐츠 초기화
    private initializeAdaptiveContent(): AdaptiveContent {
        return {
            content_adaptation_rules: this.getDefaultAdaptationRules(),
            personalized_resources: [],
            difficulty_scaling: {
                current_difficulty: 5,
                target_difficulty: 5,
                scaling_factor: 1.0,
                adaptation_speed: 'medium',
                last_adjustment: new Date(),
                adjustment_reason: '초기 설정'
            },
            learning_style_adaptation: {
                primary_style: 'visual',
                secondary_style: 'kinesthetic',
                adaptation_strategies: this.getDefaultAdaptationStrategies(),
                effectiveness_score: 0
            }
        };
    }

    // 기본 적응 규칙
    private getDefaultAdaptationRules(): ContentAdaptationRule[] {
        return [
            {
                rule_id: 'rule-1',
                condition: 'user_expertise_level === "beginner"',
                action: 'simplify_content',
                priority: 1,
                enabled: true
            },
            {
                rule_id: 'rule-2',
                condition: 'learning_style === "visual"',
                action: 'add_visual_aids',
                priority: 2,
                enabled: true
            },
            {
                rule_id: 'rule-3',
                condition: 'performance_score < 70',
                action: 'reduce_difficulty',
                priority: 3,
                enabled: true
            },
            {
                rule_id: 'rule-4',
                condition: 'performance_score > 90',
                action: 'increase_difficulty',
                priority: 4,
                enabled: true
            }
        ];
    }

    // 기본 적응 전략
    private getDefaultAdaptationStrategies(): AdaptationStrategy[] {
        return [
            {
                strategy_id: 'strategy-1',
                name: '시각적 다이어그램',
                description: '개념을 시각적 다이어그램으로 표현',
                learning_style: 'visual',
                implementation: '코드 플로우차트와 아키텍처 다이어그램 제공',
                effectiveness: 85
            },
            {
                strategy_id: 'strategy-2',
                name: '실습 중심 학습',
                description: '이론보다 실습을 통한 학습',
                learning_style: 'kinesthetic',
                implementation: '인터랙티브 코딩 연습과 프로젝트 기반 학습',
                effectiveness: 90
            },
            {
                strategy_id: 'strategy-3',
                name: '단계별 설명',
                description: '복잡한 개념을 작은 단계로 분해',
                learning_style: 'reading',
                implementation: '단계별 가이드와 상세한 설명 제공',
                effectiveness: 80
            }
        ];
    }

    // 난이도 조정 초기화
    private initializeDifficultyAdjustment(): DifficultyAdjustment {
        return {
            current_level: 5,
            target_level: 5,
            adjustment_history: [],
            factors: [
                {
                    factor_name: '성과 점수',
                    impact: 0,
                    weight: 0.4,
                    description: '최근 평가 결과 기반'
                },
                {
                    factor_name: '학습 속도',
                    impact: 0,
                    weight: 0.3,
                    description: '모듈 완료 속도 기반'
                },
                {
                    factor_name: '사용자 피드백',
                    impact: 0,
                    weight: 0.3,
                    description: '직접적인 난이도 피드백'
                }
            ],
            next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1주일 후
        };
    }

    // 학습 경로 초기화
    private initializeLearningPaths(): void {
        const webDevelopmentPath: LearningPath = {
            path_id: 'web-dev-intermediate',
            path_name: '웹 개발 중급 과정',
            description: 'HTML, CSS, JavaScript를 기반으로 한 현대적인 웹 개발 학습',
            difficulty_level: 'intermediate',
            estimated_duration: 120, // 120시간
            prerequisites: ['기본 프로그래밍 개념'],
            modules: [
                {
                    module_id: 'html-advanced',
                    title: '고급 HTML',
                    description: '시맨틱 HTML과 웹 접근성',
                    content_type: 'theory',
                    difficulty: 4,
                    estimated_time: 120,
                    prerequisites: [],
                    learning_objectives: ['시맨틱 HTML 이해', '웹 접근성 준수'],
                    resources: [],
                    completed: false
                },
                {
                    module_id: 'css-layout',
                    title: 'CSS 레이아웃',
                    description: 'Flexbox와 Grid 시스템',
                    content_type: 'practice',
                    difficulty: 6,
                    estimated_time: 180,
                    prerequisites: ['html-advanced'],
                    learning_objectives: ['Flexbox 마스터', 'Grid 시스템 활용'],
                    resources: [],
                    completed: false
                },
                {
                    module_id: 'javascript-es6',
                    title: 'JavaScript ES6+',
                    description: '모던 JavaScript 문법과 기능',
                    content_type: 'theory',
                    difficulty: 7,
                    estimated_time: 240,
                    prerequisites: ['css-layout'],
                    learning_objectives: ['ES6+ 문법 이해', '비동기 프로그래밍'],
                    resources: [],
                    completed: false
                },
                {
                    module_id: 'react-basics',
                    title: 'React 기초',
                    description: 'React 컴포넌트와 Hooks',
                    content_type: 'project',
                    difficulty: 8,
                    estimated_time: 300,
                    prerequisites: ['javascript-es6'],
                    learning_objectives: ['React 컴포넌트 개발', 'Hooks 활용'],
                    resources: [],
                    completed: false
                }
            ],
            current_module_index: 0,
            completion_percentage: 0,
            start_date: new Date()
        };

        this.learningPaths.set(webDevelopmentPath.path_id, webDevelopmentPath);
    }

    // 콘텐츠 라이브러리 초기화
    private initializeContentLibrary(): void {
        const resources: LearningResource[] = [
            {
                resource_id: 'html-semantic',
                type: 'article',
                title: '시맨틱 HTML 완벽 가이드',
                content: 'HTML5의 시맨틱 태그들을 활용한 의미있는 마크업 작성법...',
                duration: 30,
                difficulty: 4,
                tags: ['html', 'semantic', 'accessibility']
            },
            {
                resource_id: 'css-flexbox',
                type: 'video',
                title: 'Flexbox 마스터 클래스',
                content: 'Flexbox를 활용한 현대적인 레이아웃 구성 방법...',
                duration: 45,
                difficulty: 6,
                tags: ['css', 'flexbox', 'layout']
            },
            {
                resource_id: 'js-async',
                type: 'code_example',
                title: '비동기 JavaScript 패턴',
                content: 'Promise, async/await를 활용한 비동기 프로그래밍...',
                duration: 60,
                difficulty: 7,
                tags: ['javascript', 'async', 'promise']
            },
            {
                resource_id: 'react-hooks',
                type: 'interactive_exercise',
                title: 'React Hooks 실습',
                content: 'useState, useEffect, useContext를 활용한 실습...',
                duration: 90,
                difficulty: 8,
                tags: ['react', 'hooks', 'state']
            }
        ];

        resources.forEach(resource => {
            this.contentLibrary.set(resource.resource_id, resource);
        });
    }

    // 학습 진행 상황 업데이트
    async updateLearningProgress(
        userId: string,
        sessionId: string,
        moduleId: string,
        progress: number,
        performanceScore?: number
    ): Promise<void> {
        const experience = await this.getLearningExperience(userId, sessionId);
        const module = experience.current_learning_path.modules.find(m => m.module_id === moduleId);

        if (module) {
            module.completed = progress >= 100;
            if (module.completed) {
                module.completion_date = new Date();
                module.performance_score = performanceScore || 0;
            }

            // 전체 진행률 업데이트
            this.updateOverallProgress(experience);

            // 학습 추천 업데이트
            await this.updateLearningRecommendations(experience);

            // 난이도 조정
            await this.adjustDifficulty(experience, performanceScore);

            experience.last_updated = new Date();
        }
    }

    // 전체 진행률 업데이트
    private updateOverallProgress(experience: LearningExperience): void {
        const completedModules = experience.current_learning_path.modules.filter(m => m.completed).length;
        const totalModules = experience.current_learning_path.modules.length;

        experience.current_learning_path.completion_percentage =
            Math.round((completedModules / totalModules) * 100);

        experience.progress_tracking.overall_progress =
            experience.current_learning_path.completion_percentage;
    }

    // 학습 추천 업데이트
    private async updateLearningRecommendations(experience: LearningExperience): Promise<void> {
        const recommendations: LearningRecommendation[] = [];

        // 다음 모듈 추천
        const currentModuleIndex = experience.current_learning_path.current_module_index;
        const nextModule = experience.current_learning_path.modules[currentModuleIndex + 1];

        if (nextModule && !nextModule.completed) {
            recommendations.push({
                recommendation_id: `rec-${Date.now()}-1`,
                type: 'next_module',
                title: `다음 단계: ${nextModule.title}`,
                description: nextModule.description,
                priority: 'high',
                estimated_impact: 90,
                time_estimate: nextModule.estimated_time,
                prerequisites: nextModule.prerequisites,
                reasoning: '학습 경로의 자연스러운 진행'
            });
        }

        // 성과 기반 추천
        const recentModules = experience.current_learning_path.modules
            .filter(m => m.completion_date &&
                Date.now() - m.completion_date.getTime() < 7 * 24 * 60 * 60 * 1000)
            .slice(-3);

        const avgPerformance = recentModules.length > 0 ?
            recentModules.reduce((sum, m) => sum + (m.performance_score || 0), 0) / recentModules.length : 0;

        if (avgPerformance < 70) {
            recommendations.push({
                recommendation_id: `rec-${Date.now()}-2`,
                type: 'review',
                title: '기본 개념 복습',
                description: '최근 학습한 내용을 다시 한번 복습해보세요',
                priority: 'medium',
                estimated_impact: 75,
                time_estimate: 60,
                prerequisites: [],
                reasoning: '성과 점수가 낮아 기본 개념 복습이 필요합니다'
            });
        } else if (avgPerformance > 90) {
            recommendations.push({
                recommendation_id: `rec-${Date.now()}-3`,
                type: 'challenge',
                title: '고급 도전 과제',
                description: '현재 수준을 넘어서는 도전적인 프로젝트를 시도해보세요',
                priority: 'medium',
                estimated_impact: 85,
                time_estimate: 120,
                prerequisites: [],
                reasoning: '우수한 성과로 인해 더 높은 난이도의 도전이 적합합니다'
            });
        }

        experience.learning_recommendations = recommendations;
    }

    // 난이도 조정
    private async adjustDifficulty(experience: LearningExperience, performanceScore?: number): Promise<void> {
        const adjustment = experience.difficulty_adjustment;

        if (performanceScore !== undefined) {
            // 성과 점수 기반 조정
            const performanceFactor = adjustment.factors.find(f => f.factor_name === '성과 점수');
            if (performanceFactor) {
                if (performanceScore > 90) {
                    performanceFactor.impact = 0.2; // 난이도 증가
                } else if (performanceScore < 70) {
                    performanceFactor.impact = -0.2; // 난이도 감소
                } else {
                    performanceFactor.impact = 0; // 유지
                }
            }
        }

        // 전체 조정 계산
        const totalAdjustment = adjustment.factors.reduce((sum, factor) =>
            sum + (factor.impact * factor.weight), 0);

        if (Math.abs(totalAdjustment) > 0.1) {
            const newLevel = Math.max(1, Math.min(10, adjustment.current_level + totalAdjustment));

            adjustment.adjustment_history.push({
                current_level: adjustment.current_level,
                target_level: newLevel,
                adjustment_history: [],
                factors: [...adjustment.factors],
                next_review_date: new Date()
            });

            adjustment.current_level = newLevel;

            // 적응형 콘텐츠 업데이트
            experience.adaptive_content.difficulty_scaling.current_difficulty = newLevel;
        }
    }

    // 개인화된 콘텐츠 생성
    async generatePersonalizedContent(
        userId: string,
        sessionId: string,
        topic: string,
        difficulty: number
    ): Promise<PersonalizedResource[]> {
        const experience = await this.getLearningExperience(userId, sessionId);
        const userProfile = await this.getUserProfile(userId);

        const personalizedResources: PersonalizedResource[] = [];

        // 사용자 선호도에 맞는 리소스 필터링
        const availableResources = Array.from(this.contentLibrary.values())
            .filter(resource =>
                resource.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase())) &&
                Math.abs(resource.difficulty - difficulty) <= 2
            );

        for (const resource of availableResources.slice(0, 3)) {
            const userPreferenceMatch = this.calculateUserPreferenceMatch(resource, userProfile);
            const difficultyMatch = this.calculateDifficultyMatch(resource, difficulty);
            const learningStyleMatch = this.calculateLearningStyleMatch(resource, experience.adaptive_content.learning_style_adaptation);

            personalizedResources.push({
                resource_id: resource.resource_id,
                title: resource.title,
                content: this.adaptContentToUser(resource.content || '', userProfile),
                adaptation_reason: this.generateAdaptationReason(userProfile, resource),
                user_preference_match: userPreferenceMatch,
                difficulty_match: difficultyMatch,
                learning_style_match: learningStyleMatch
            });
        }

        return personalizedResources.sort((a, b) =>
            (b.user_preference_match + b.difficulty_match + b.learning_style_match) / 3 -
            (a.user_preference_match + a.difficulty_match + a.learning_style_match) / 3
        );
    }

    // 사용자 프로필 가져오기 (실제 구현에서는 메모리 서비스에서 가져옴)
    private async getUserProfile(_userId: string): Promise<UserProfile> {
        return {
            expertise_level: 'intermediate',
            primary_domains: ['web_development'],
            learning_style: 'visual',
            communication_preference: 'casual',
            response_length_preference: 'moderate',
            example_preference: 'code',
            update_frequency: new Date()
        };
    }

    // 사용자 선호도 매칭 계산
    private calculateUserPreferenceMatch(resource: LearningResource, userProfile: UserProfile): number {
        let match = 50; // 기본 점수

        // 학습 스타일 매칭
        if (userProfile.learning_style === 'visual' && resource.type === 'video') {
            match += 20;
        } else if (userProfile.learning_style === 'kinesthetic' && resource.type === 'interactive_exercise') {
            match += 20;
        }

        // 난이도 매칭
        const difficultyDiff = Math.abs(resource.difficulty - this.getExpertiseLevelNumber(userProfile.expertise_level));
        if (difficultyDiff <= 1) {
            match += 15;
        } else if (difficultyDiff <= 2) {
            match += 10;
        }

        return Math.min(100, match);
    }

    // 난이도 매칭 계산
    private calculateDifficultyMatch(resource: LearningResource, targetDifficulty: number): number {
        const diff = Math.abs(resource.difficulty - targetDifficulty);
        if (diff === 0) return 100;
        if (diff === 1) return 85;
        if (diff === 2) return 70;
        return Math.max(0, 100 - (diff * 15));
    }

    // 학습 스타일 매칭 계산
    private calculateLearningStyleMatch(resource: LearningResource, adaptation: LearningStyleAdaptation): number {
        let match = 50;

        if (adaptation.primary_style === 'visual' && resource.type === 'video') {
            match += 25;
        } else if (adaptation.primary_style === 'kinesthetic' && resource.type === 'interactive_exercise') {
            match += 25;
        } else if (adaptation.primary_style === 'reading' && resource.type === 'article') {
            match += 25;
        }

        return Math.min(100, match);
    }

    // 콘텐츠 사용자 맞춤화
    private adaptContentToUser(content: string, userProfile: UserProfile): string {
        let adaptedContent = content;

        // 응답 길이 선호도에 따른 조정
        if (userProfile.response_length_preference === 'concise') {
            adaptedContent = this.makeContentConcise(adaptedContent);
        } else if (userProfile.response_length_preference === 'detailed') {
            adaptedContent = this.makeContentDetailed(adaptedContent);
        }

        // 예시 선호도에 따른 조정
        if (userProfile.example_preference === 'code') {
            adaptedContent = this.addCodeExamples(adaptedContent);
        }

        return adaptedContent;
    }

    // 콘텐츠 간소화
    private makeContentConcise(content: string): string {
        // 실제 구현에서는 더 정교한 텍스트 처리 로직 사용
        const sentences = content.split('.');
        return sentences.slice(0, Math.min(3, sentences.length)).join('.') + '.';
    }

    // 콘텐츠 상세화
    private makeContentDetailed(content: string): string {
        // 실제 구현에서는 더 많은 설명과 예시 추가
        return content + '\n\n추가 설명: 이 개념은 실제 프로젝트에서 매우 중요합니다.';
    }

    // 코드 예시 추가
    private addCodeExamples(content: string): string {
        return content + '\n\n```javascript\n// 예시 코드\nconst example = "Hello World";\nconsole.log(example);\n```';
    }

    // 적응 이유 생성
    private generateAdaptationReason(userProfile: UserProfile, resource: LearningResource): string {
        const reasons: string[] = [];

        if (userProfile.learning_style === 'visual' && resource.type === 'video') {
            reasons.push('시각적 학습 스타일에 최적화');
        }

        if (resource.difficulty <= this.getExpertiseLevelNumber(userProfile.expertise_level) + 1) {
            reasons.push('현재 수준에 적합한 난이도');
        }

        return reasons.join(', ');
    }

    // 전문성 수준을 숫자로 변환
    private getExpertiseLevelNumber(level: string): number {
        const levelMap: { [key: string]: number } = {
            'beginner': 3,
            'intermediate': 5,
            'advanced': 7,
            'expert': 9
        };
        return levelMap[level] || 5;
    }

    // 학습 분석 리포트 생성
    async generateLearningReport(userId: string, sessionId: string): Promise<Record<string, unknown>> {
        const experience = await this.getLearningExperience(userId, sessionId);

        return {
            user_id: userId,
            session_id: sessionId,
            report_date: new Date(),
            overall_progress: experience.progress_tracking.overall_progress,
            current_path: {
                name: experience.current_learning_path.path_name,
                completion_percentage: experience.current_learning_path.completion_percentage,
                current_module: experience.current_learning_path.modules[experience.current_learning_path.current_module_index]
            },
            performance_summary: {
                average_performance: this.calculateAveragePerformance(experience),
                learning_velocity: experience.progress_tracking.learning_velocity,
                consistency_score: experience.progress_tracking.time_spent.consistency_score
            },
            recommendations: experience.learning_recommendations.map(rec => ({
                title: rec.title,
                priority: rec.priority,
                estimated_impact: rec.estimated_impact
            })),
            next_steps: this.generateNextSteps(experience)
        };
    }

    // 평균 성과 계산
    private calculateAveragePerformance(experience: LearningExperience): number {
        const completedModules = experience.current_learning_path.modules
            .filter(m => m.performance_score !== undefined);

        if (completedModules.length === 0) return 0;

        return completedModules.reduce((sum, m) => sum + (m.performance_score || 0), 0) / completedModules.length;
    }

    // 다음 단계 생성
    private generateNextSteps(experience: LearningExperience): string[] {
        const steps: string[] = [];

        if (experience.learning_recommendations.length > 0) {
            const highPriorityRec = experience.learning_recommendations
                .find(rec => rec.priority === 'high');
            if (highPriorityRec) {
                steps.push(`우선순위: ${highPriorityRec.title}`);
            }
        }

        const currentModule = experience.current_learning_path.modules[experience.current_learning_path.current_module_index];
        if (currentModule && !currentModule.completed) {
            steps.push(`현재 모듈 완료: ${currentModule.title}`);
        }

        return steps;
    }

    // 지속화된 데이터 로드
    private loadPersistedData(): void {
        try {
            const persisted = localStorage.getItem(CORBU_LEARNING_EXPERIENCE_STORAGE_KEY);
            if (persisted) {
                const parsed = JSON.parse(persisted);
                for (const [key, experience] of Object.entries(parsed)) {
                    this.learningExperiences.set(key, experience as LearningExperience);
                }
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.warn('Failed to load persisted learning experience', {
                component: 'personalizedLearningExperienceService',
                action: 'loadPersistedData',
                error: err.message,
            });
        }
    }

    // 데이터 지속화
    private persistData(): void {
        try {
            const experienceData: { [key: string]: LearningExperience } = {};
            for (const [key, experience] of this.learningExperiences.entries()) {
                experienceData[key] = experience;
            }
            localStorage.setItem(CORBU_LEARNING_EXPERIENCE_STORAGE_KEY, JSON.stringify(experienceData));
        } catch (error) {
            const err = toError(error);
            errorLogger.warn('Failed to persist learning experience', {
                component: 'personalizedLearningExperienceService',
                action: 'persistData',
                error: err.message,
            });
        }
    }

    // 공개 메서드들
    async getCurrentLearningPath(userId: string, sessionId: string): Promise<LearningPath> {
        const experience = await this.getLearningExperience(userId, sessionId);
        return experience.current_learning_path;
    }

    async getLearningGoals(userId: string, sessionId: string): Promise<LearningGoal[]> {
        const experience = await this.getLearningExperience(userId, sessionId);
        return experience.learning_goals;
    }

    async getProgressTracking(userId: string, sessionId: string): Promise<ProgressTracking> {
        const experience = await this.getLearningExperience(userId, sessionId);
        return experience.progress_tracking;
    }

    async getLearningRecommendations(userId: string, sessionId: string): Promise<LearningRecommendation[]> {
        const experience = await this.getLearningExperience(userId, sessionId);
        return experience.learning_recommendations;
    }

    async updateUserFeedback(
        userId: string,
        sessionId: string,
        recommendationId: string,
        feedback: UserFeedback
    ): Promise<void> {
        const experience = await this.getLearningExperience(userId, sessionId);
        const recommendation = experience.learning_recommendations.find(r => r.recommendation_id === recommendationId);

        if (recommendation) {
            recommendation.user_feedback = feedback;
            experience.last_updated = new Date();
        }
    }

    // 서비스 종료 시 데이터 지속화
    shutdown(): void {
        this.persistData();
        errorLogger.info('Personalized Learning Experience Service shutdown', {
            component: 'personalizedLearningExperienceService',
            action: 'shutdown',
        });
    }
}

export { CORBU_LEARNING_EXPERIENCE_STORAGE_KEY } from './personalizedLearningExperienceStorageKeys';

const personalizedLearningExperienceService = new PersonalizedLearningExperienceService();
export default personalizedLearningExperienceService;
