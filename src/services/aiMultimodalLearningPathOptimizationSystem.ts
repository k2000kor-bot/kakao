import realTimeAIAlertSystem from './realTimeAIAlertSystem';

// AI 멀티모달 학습 경로 최적화 인터페이스 정의
export interface LearningPath {
  pathId: string;
  userId: string;
  name: string;
  description: string;
  type: 'individual' | 'team' | 'project' | 'skill' | 'career';
  status: 'active' | 'completed' | 'paused' | 'optimizing';
  modules: LearningModule[];
  progress: LearningProgress;
  optimization: PathOptimization;
  qualityMetrics: QualityMetrics;
  recommendations: LearningRecommendation[];
  settings: LearningPathSettings;
  timestamp: number;
}

export interface LearningModule {
  moduleId: string;
  name: string;
  description: string;
  type: 'video' | 'text' | 'interactive' | 'assessment' | 'project' | 'collaboration';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // minutes
  prerequisites: string[];
  skills: string[];
  qualityScore: number;
  completionRate: number;
  userSatisfaction: number;
  adaptiveContent: AdaptiveContent[];
  assessments: ModuleAssessment[];
}

export interface AdaptiveContent {
  contentId: string;
  type: 'video' | 'text' | 'interactive' | 'quiz' | 'exercise';
  title: string;
  content: string;
  difficulty: number;
  estimatedTime: number;
  qualityMetrics: {
    clarity: number;
    relevance: number;
    engagement: number;
    effectiveness: number;
    overallScore: number;
  };
  prerequisites: string[];
  learningObjectives: string[];
  adaptiveRules: AdaptiveRule[];
}

export interface AdaptiveRule {
  ruleId: string;
  condition: string;
  action: 'show' | 'hide' | 'modify' | 'skip' | 'repeat';
  parameters: Record<string, any>;
  priority: number;
}

export interface ModuleAssessment {
  assessmentId: string;
  type: 'quiz' | 'project' | 'peer-review' | 'self-assessment';
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit: number;
  adaptiveScoring: boolean;
}

export interface AssessmentQuestion {
  questionId: string;
  type: 'multiple-choice' | 'essay' | 'coding' | 'peer-review' | 'self-reflection';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  difficulty: number;
  adaptiveScoring: boolean;
}

export interface LearningProgress {
  overallProgress: number;
  completedModules: number;
  totalModules: number;
  timeSpent: number;
  currentModule: string;
  nextModule: string;
  milestones: Milestone[];
  achievements: Achievement[];
  challenges: Challenge[];
}

export interface Milestone {
  milestoneId: string;
  name: string;
  description: string;
  type: 'completion' | 'skill' | 'time' | 'quality' | 'collaboration';
  target: number;
  current: number;
  achieved: boolean;
  reward: string;
  timestamp: number;
}

export interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  type: 'skill' | 'completion' | 'quality' | 'collaboration' | 'innovation';
  icon: string;
  points: number;
  unlocked: boolean;
  timestamp: number;
}

export interface Challenge {
  challengeId: string;
  name: string;
  description: string;
  type: 'skill' | 'collaboration' | 'innovation' | 'problem-solving';
  difficulty: number;
  timeLimit: number;
  reward: string;
  completed: boolean;
  progress: number;
}

export interface PathOptimization {
  optimizationId: string;
  type: 'content' | 'sequence' | 'difficulty' | 'timing' | 'collaboration';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  algorithm: string;
  parameters: Record<string, any>;
  results: OptimizationResult[];
  recommendations: OptimizationRecommendation[];
  timestamp: number;
}

export interface OptimizationResult {
  resultId: string;
  metric: string;
  beforeValue: number;
  afterValue: number;
  improvement: number;
  confidence: number;
  explanation: string;
}

export interface OptimizationRecommendation {
  recommendationId: string;
  type: 'module-reorder' | 'content-adapt' | 'difficulty-adjust' | 'collaboration-enhance';
  title: string;
  description: string;
  impact: number;
  effort: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  expectedOutcome: string;
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export interface QualityMetrics {
  overallQuality: number;
  contentQuality: number;
  engagementQuality: number;
  learningEffectiveness: number;
  collaborationQuality: number;
  satisfactionQuality: number;
  completionRate: number;
  retentionRate: number;
  skillImprovement: number;
  trends: QualityTrend[];
}

export interface QualityTrend {
  trendId: string;
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  change: number;
  period: string;
  confidence: number;
  factors: string[];
}

export interface LearningRecommendation {
  recommendationId: string;
  type: 'content' | 'sequence' | 'collaboration' | 'assessment' | 'timing';
  title: string;
  description: string;
  rationale: string;
  impact: number;
  effort: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  expectedOutcome: string;
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export interface LearningPathSettings {
  adaptiveLearning: boolean;
  personalization: boolean;
  collaboration: boolean;
  qualityTracking: boolean;
  optimization: boolean;
  notifications: boolean;
  difficultyAdjustment: boolean;
  timeManagement: boolean;
  assessmentFrequency: 'continuous' | 'module' | 'milestone' | 'manual';
  optimizationFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly';
  qualityThresholds: QualityThresholds;
}

export interface QualityThresholds {
  minimumQuality: number;
  targetEngagement: number;
  minimumCompletion: number;
  targetSatisfaction: number;
  minimumRetention: number;
}

export interface LearningAnalytics {
  totalPaths: number;
  activePaths: number;
  averageProgress: number;
  averageQuality: number;
  optimizationRate: number;
  completionRate: number;
  satisfactionRate: number;
  skillImprovement: number;
  collaborationEffectiveness: number;
  adaptiveContentUsage: number;
}

class AIMultimodalLearningPathOptimizationSystem {
  private learningPaths: Map<string, LearningPath> = new Map();
  private isRunning: boolean = false;
  private analytics: LearningAnalytics = {
    totalPaths: 0,
    activePaths: 0,
    averageProgress: 0,
    averageQuality: 0,
    optimizationRate: 0,
    completionRate: 0,
    satisfactionRate: 0,
    skillImprovement: 0,
    collaborationEffectiveness: 0,
    adaptiveContentUsage: 0
  };

  constructor() {
    console.log('🎯 AI 멀티모달 학습 경로 최적화 시스템 초기화 중...');
  }

  public start(): void {
    if (this.isRunning) {
      console.log('⚠️ AI 멀티모달 학습 경로 최적화 시스템이 이미 실행 중입니다.');
      return;
    }

    this.isRunning = true;
    this.initializeSystem();
    this.createInitialPaths();
    this.startOptimizationMonitoring();

    console.log('✅ AI 멀티모달 학습 경로 최적화 시스템이 시작되었습니다.');
    realTimeAIAlertSystem.sendAlert('info', 'AI 멀티모달 학습 경로 최적화 시스템이 시작되었습니다.');
  }

  public stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ AI 멀티모달 학습 경로 최적화 시스템이 실행 중이 아닙니다.');
      return;
    }

    this.isRunning = false;
    this.cleanupData();

    console.log('🛑 AI 멀티모달 학습 경로 최적화 시스템이 중지되었습니다.');
    realTimeAIAlertSystem.sendAlert('info', 'AI 멀티모달 학습 경로 최적화 시스템이 중지되었습니다.');
  }

  private initializeSystem(): void {
    console.log('🔧 학습 경로 최적화 시스템 초기화 중...');

    console.log('📊 적응형 학습 엔진 초기화 완료');
    console.log('🎯 개인화 알고리즘 초기화 완료');
    console.log('🔄 실시간 최적화 엔진 초기화 완료');
    console.log('📈 품질 분석 시스템 초기화 완료');
    console.log('🤝 협업 학습 모듈 초기화 완료');
    console.log('📋 평가 및 피드백 시스템 초기화 완료');
  }

  private createInitialPaths(): void {
    const path1: LearningPath = {
      pathId: 'learning-path-1',
      userId: 'user-1',
      name: 'AI 개발자 역량 강화 경로',
      description: 'AI 개발자를 위한 종합적인 역량 강화 학습 경로',
      type: 'career',
      status: 'active',
      modules: [
        {
          moduleId: 'module-1',
          name: 'AI 기초 개념',
          description: '인공지능의 기본 개념과 원리 학습',
          type: 'video',
          difficulty: 'beginner',
          duration: 120,
          prerequisites: [],
          skills: ['AI 기초', '머신러닝 개념'],
          qualityScore: 0.9,
          completionRate: 0.85,
          userSatisfaction: 0.88,
          adaptiveContent: [
            {
              contentId: 'content-1',
              type: 'video',
              title: 'AI란 무엇인가?',
              content: 'AI의 정의와 역사에 대한 개요',
              difficulty: 0.2,
              estimatedTime: 15,
              qualityMetrics: {
                clarity: 0.9,
                relevance: 0.95,
                engagement: 0.85,
                effectiveness: 0.88,
                overallScore: 0.9
              },
              prerequisites: [],
              learningObjectives: ['AI의 정의 이해', 'AI의 역사 파악'],
              adaptiveRules: [
                {
                  ruleId: 'rule-1',
                  condition: 'user.experience < 0.3',
                  action: 'show',
                  parameters: { additionalExamples: true },
                  priority: 1
                }
              ]
            }
          ],
          assessments: [
            {
              assessmentId: 'assessment-1',
              type: 'quiz',
              title: 'AI 기초 개념 평가',
              description: 'AI 기본 개념에 대한 이해도 평가',
              questions: [
                {
                  questionId: 'q1',
                  type: 'multiple-choice',
                  question: 'AI의 정의로 가장 적절한 것은?',
                  options: ['컴퓨터가 인간처럼 생각하는 것', '데이터를 처리하는 것', '자동화된 시스템'],
                  correctAnswer: '컴퓨터가 인간처럼 생각하는 것',
                  points: 10,
                  difficulty: 0.3,
                  adaptiveScoring: true
                }
              ],
              passingScore: 70,
              timeLimit: 30,
              adaptiveScoring: true
            }
          ]
        }
      ],
      progress: {
        overallProgress: 0.25,
        completedModules: 1,
        totalModules: 4,
        timeSpent: 120,
        currentModule: 'module-1',
        nextModule: 'module-2',
        milestones: [
          {
            milestoneId: 'milestone-1',
            name: 'AI 기초 완료',
            description: 'AI 기초 개념 모듈 완료',
            type: 'completion',
            target: 1,
            current: 1,
            achieved: true,
            reward: 'AI 기초 배지',
            timestamp: Date.now()
          }
        ],
        achievements: [
          {
            achievementId: 'achievement-1',
            name: '첫 번째 모듈 완료',
            description: '첫 번째 학습 모듈을 성공적으로 완료',
            type: 'completion',
            icon: '🎯',
            points: 100,
            unlocked: true,
            timestamp: Date.now()
          }
        ],
        challenges: [
          {
            challengeId: 'challenge-1',
            name: 'AI 프로젝트 실습',
            description: '학습한 내용을 바탕으로 간단한 AI 프로젝트 수행',
            type: 'skill',
            difficulty: 0.6,
            timeLimit: 1440, // 24시간
            reward: '프로젝트 완료 인증서',
            completed: false,
            progress: 0.3
          }
        ]
      },
      optimization: {
        optimizationId: 'opt-1',
        type: 'sequence',
        status: 'completed',
        algorithm: 'genetic-algorithm',
        parameters: {
          populationSize: 100,
          generations: 50,
          mutationRate: 0.1
        },
        results: [
          {
            resultId: 'result-1',
            metric: 'learning-efficiency',
            beforeValue: 0.7,
            afterValue: 0.85,
            improvement: 0.15,
            confidence: 0.9,
            explanation: '모듈 순서 최적화로 학습 효율성 향상'
          }
        ],
        recommendations: [
          {
            recommendationId: 'rec-1',
            type: 'module-reorder',
            title: '실습 모듈 앞당기기',
            description: '이론 학습 후 즉시 실습할 수 있도록 모듈 순서 조정',
            impact: 0.2,
            effort: 0.3,
            priority: 'high',
            implementation: '모듈 순서 변경 및 연결성 강화',
            expectedOutcome: '학습 효과성 20% 향상',
            status: 'implemented'
          }
        ],
        timestamp: Date.now()
      },
      qualityMetrics: {
        overallQuality: 0.87,
        contentQuality: 0.9,
        engagementQuality: 0.85,
        learningEffectiveness: 0.88,
        collaborationQuality: 0.82,
        satisfactionQuality: 0.86,
        completionRate: 0.85,
        retentionRate: 0.78,
        skillImprovement: 0.83,
        trends: [
          {
            trendId: 'trend-1',
            metric: 'learning-effectiveness',
            direction: 'improving',
            change: 0.05,
            period: '1주일',
            confidence: 0.8,
            factors: ['적응형 콘텐츠', '개인화된 피드백']
          }
        ]
      },
      recommendations: [
        {
          recommendationId: 'rec-1',
          type: 'content',
          title: '실습 콘텐츠 추가',
          description: '이론 학습을 보완하는 실습 콘텐츠 추가',
          rationale: '학습 효과성 향상을 위해 실습 기회 확대',
          impact: 0.15,
          effort: 0.4,
          priority: 'high',
          implementation: '실습 모듈 개발 및 통합',
          expectedOutcome: '학습 효과성 15% 향상',
          status: 'proposed'
        }
      ],
      settings: {
        adaptiveLearning: true,
        personalization: true,
        collaboration: true,
        qualityTracking: true,
        optimization: true,
        notifications: true,
        difficultyAdjustment: true,
        timeManagement: true,
        assessmentFrequency: 'module',
        optimizationFrequency: 'weekly',
        qualityThresholds: {
          minimumQuality: 0.8,
          targetEngagement: 0.85,
          minimumCompletion: 0.75,
          targetSatisfaction: 0.8,
          minimumRetention: 0.7
        }
      },
      timestamp: Date.now()
    };

    this.learningPaths.set(path1.pathId, path1);
    this.optimizePath(path1.pathId);
    console.log('📋 초기 학습 경로 생성 완료');
  }

  public createLearningPath(path: Omit<LearningPath, 'pathId' | 'progress' | 'optimization' | 'qualityMetrics' | 'recommendations' | 'timestamp'>): LearningPath {
    const pathId = `learning-path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullPath: LearningPath = {
      ...path,
      pathId,
      progress: {
        overallProgress: 0,
        completedModules: 0,
        totalModules: path.modules.length,
        timeSpent: 0,
        currentModule: path.modules[0]?.moduleId || '',
        nextModule: path.modules[1]?.moduleId || '',
        milestones: [],
        achievements: [],
        challenges: []
      },
      optimization: {
        optimizationId: `opt-${pathId}`,
        type: 'sequence',
        status: 'pending',
        algorithm: 'genetic-algorithm',
        parameters: {},
        results: [],
        recommendations: [],
        timestamp: Date.now()
      },
      qualityMetrics: {
        overallQuality: 0,
        contentQuality: 0,
        engagementQuality: 0,
        learningEffectiveness: 0,
        collaborationQuality: 0,
        satisfactionQuality: 0,
        completionRate: 0,
        retentionRate: 0,
        skillImprovement: 0,
        trends: []
      },
      recommendations: [],
      timestamp: Date.now()
    };

    this.learningPaths.set(pathId, fullPath);
    this.optimizePath(pathId);
    this.updateAnalytics();

    console.log(`🎯 새로운 학습 경로 생성: ${pathId}`);
    return fullPath;
  }

  public updateModuleProgress(pathId: string, moduleId: string, progress: number): void {
    const path = this.learningPaths.get(pathId);
    if (!path) return;

    const module = path.modules.find(m => m.moduleId === moduleId);
    if (!module) return;

    // 모듈 진행률 업데이트
    module.completionRate = progress;

    // 경로 진행률 업데이트
    this.updatePathProgress(pathId);

    // 품질 메트릭 업데이트
    this.updateQualityMetrics(pathId);

    // 최적화 필요성 확인
    this.checkOptimizationNeeds(pathId);
  }

  public addAssessmentResult(pathId: string, moduleId: string, assessmentId: string, score: number): void {
    const path = this.learningPaths.get(pathId);
    if (!path) return;

    const module = path.modules.find(m => m.moduleId === moduleId);
    if (!module) return;

    const assessment = module.assessments.find(a => a.assessmentId === assessmentId);
    if (!assessment) return;

    // 평가 결과 분석 및 적응형 콘텐츠 조정
    this.adaptContentBasedOnAssessment(path, module, score);

    // 학습 경로 최적화
    this.optimizePath(pathId);
  }

  private updatePathProgress(pathId: string): void {
    const path = this.learningPaths.get(pathId);
    if (!path) return;

    const completedModules = path.modules.filter(m => m.completionRate >= 0.8).length;
    const totalModules = path.modules.length;

    path.progress.completedModules = completedModules;
    path.progress.overallProgress = totalModules > 0 ? completedModules / totalModules : 0;

    // 다음 모듈 결정
    const currentModuleIndex = path.modules.findIndex(m => m.moduleId === path.progress.currentModule);
    if (currentModuleIndex >= 0 && currentModuleIndex < path.modules.length - 1) {
      path.progress.nextModule = path.modules[currentModuleIndex + 1].moduleId;
    }

    // 마일스톤 및 성취 확인
    this.checkMilestonesAndAchievements(path);
  }

  private checkMilestonesAndAchievements(path: LearningPath): void {
    // 마일스톤 확인
    path.progress.milestones.forEach(milestone => {
      if (!milestone.achieved && path.progress.overallProgress >= milestone.target) {
        milestone.achieved = true;
        milestone.timestamp = Date.now();

        // 성취 추가
        const achievement: Achievement = {
          achievementId: `achievement-${Date.now()}`,
          name: `${milestone.name} 달성`,
          description: `${milestone.name} 마일스톤을 달성했습니다.`,
          type: 'completion',
          icon: '🏆',
          points: 50,
          unlocked: true,
          timestamp: Date.now()
        };

        path.progress.achievements.push(achievement);

        console.log(`🎉 마일스톤 달성: ${milestone.name}`);
        realTimeAIAlertSystem.sendAlert('success', `마일스톤 달성: ${milestone.name}`);
      }
    });
  }

  private updateQualityMetrics(pathId: string): void {
    const path = this.learningPaths.get(pathId);
    if (!path) return;

    const metrics = path.qualityMetrics;

    // 콘텐츠 품질 계산
    metrics.contentQuality = this.calculateContentQuality(path);

    // 참여도 품질 계산
    metrics.engagementQuality = this.calculateEngagementQuality(path);

    // 학습 효과성 계산
    metrics.learningEffectiveness = this.calculateLearningEffectiveness(path);

    // 협업 품질 계산
    metrics.collaborationQuality = this.calculateCollaborationQuality(path);

    // 만족도 품질 계산
    metrics.satisfactionQuality = this.calculateSatisfactionQuality(path);

    // 전체 품질 계산
    metrics.overallQuality = (
      metrics.contentQuality * 0.25 +
      metrics.engagementQuality * 0.2 +
      metrics.learningEffectiveness * 0.25 +
      metrics.collaborationQuality * 0.15 +
      metrics.satisfactionQuality * 0.15
    );

    // 완료율 및 보유율 업데이트
    metrics.completionRate = path.progress.overallProgress;
    metrics.retentionRate = this.calculateRetentionRate(path);
    metrics.skillImprovement = this.calculateSkillImprovement(path);
  }

  private calculateContentQuality(path: LearningPath): number {
    if (path.modules.length === 0) return 0;

    const totalQuality = path.modules.reduce((sum, module) =>
      sum + module.qualityScore, 0);

    return totalQuality / path.modules.length;
  }

  private calculateEngagementQuality(path: LearningPath): number {
    if (path.modules.length === 0) return 0;

    const totalEngagement = path.modules.reduce((sum, module) =>
      sum + module.userSatisfaction, 0);

    return totalEngagement / path.modules.length;
  }

  private calculateLearningEffectiveness(path: LearningPath): number {
    if (path.modules.length === 0) return 0;

    const totalEffectiveness = path.modules.reduce((sum, module) =>
      sum + module.completionRate, 0);

    return totalEffectiveness / path.modules.length;
  }

  private calculateCollaborationQuality(path: LearningPath): number {
    // 협업 모듈의 품질 계산
    const collaborationModules = path.modules.filter(m => m.type === 'collaboration');
    if (collaborationModules.length === 0) return 0.5; // 기본값

    const totalQuality = collaborationModules.reduce((sum, module) =>
      sum + module.qualityScore, 0);

    return totalQuality / collaborationModules.length;
  }

  private calculateSatisfactionQuality(path: LearningPath): number {
    if (path.modules.length === 0) return 0;

    const totalSatisfaction = path.modules.reduce((sum, module) =>
      sum + module.userSatisfaction, 0);

    return totalSatisfaction / path.modules.length;
  }

  private calculateRetentionRate(path: LearningPath): number {
    // 간단한 보유율 계산 (실제로는 더 복잡한 로직 필요)
    return Math.min(0.9, path.progress.overallProgress + 0.1);
  }

  private calculateSkillImprovement(path: LearningPath): number {
    // 스킬 개선도 계산 (실제로는 평가 결과 기반)
    return path.progress.overallProgress * 0.8 + 0.2;
  }

  private adaptContentBasedOnAssessment(path: LearningPath, module: LearningModule, score: number): void {
    // 평가 결과에 따른 적응형 콘텐츠 조정
    if (score < 0.7) {
      // 낮은 점수: 추가 학습 콘텐츠 제공
      const additionalContent: AdaptiveContent = {
        contentId: `remedial-${Date.now()}`,
        type: 'interactive',
        title: '추가 학습 자료',
        content: '개념을 더 잘 이해할 수 있는 추가 자료',
        difficulty: module.difficulty === 'beginner' ? 0.1 : 0.3,
        estimatedTime: 20,
        qualityMetrics: {
          clarity: 0.9,
          relevance: 0.95,
          engagement: 0.85,
          effectiveness: 0.9,
          overallScore: 0.9
        },
        prerequisites: [],
        learningObjectives: ['개념 재정리', '실습 강화'],
        adaptiveRules: []
      };

      module.adaptiveContent.push(additionalContent);

      console.log(`📚 추가 학습 콘텐츠 제공: ${module.name}`);
    } else if (score > 0.9) {
      // 높은 점수: 심화 콘텐츠 제공
      const advancedContent: AdaptiveContent = {
        contentId: `advanced-${Date.now()}`,
        type: 'exercise',
        title: '심화 프로젝트',
        content: '학습한 내용을 활용한 심화 프로젝트',
        difficulty: 0.8,
        estimatedTime: 60,
        qualityMetrics: {
          clarity: 0.85,
          relevance: 0.9,
          engagement: 0.9,
          effectiveness: 0.85,
          overallScore: 0.88
        },
        prerequisites: [],
        learningObjectives: ['심화 학습', '실무 적용'],
        adaptiveRules: []
      };

      module.adaptiveContent.push(advancedContent);

      console.log(`🚀 심화 콘텐츠 제공: ${module.name}`);
    }
  }

  private optimizePath(pathId: string): void {
    const path = this.learningPaths.get(pathId);
    if (!path) return;

    console.log(`🔧 학습 경로 최적화 시작: ${pathId}`);

    // 최적화 알고리즘 실행
    const optimization = path.optimization;
    optimization.status = 'in-progress';

    // 모듈 순서 최적화
    this.optimizeModuleSequence(path);

    // 난이도 조정
    this.optimizeDifficulty(path);

    // 콘텐츠 적응
    this.optimizeContent(path);

    // 협업 요소 강화
    this.optimizeCollaboration(path);

    optimization.status = 'completed';
    optimization.timestamp = Date.now();

    // 최적화 결과 분석
    this.analyzeOptimizationResults(path);

    // 권장사항 생성
    this.generateRecommendations(path);

    console.log(`✅ 학습 경로 최적화 완료: ${pathId}`);
  }

  private optimizeModuleSequence(path: LearningPath): void {
    // 모듈 순서 최적화 (간단한 구현)
    const modules = [...path.modules];

    // 선행 조건을 고려한 정렬
    modules.sort((a, b) => {
      if (a.prerequisites.includes(b.moduleId)) return 1;
      if (b.prerequisites.includes(a.moduleId)) return -1;
      return a.difficulty.localeCompare(b.difficulty);
    });

    path.modules = modules;

    // 최적화 결과 기록
    path.optimization.results.push({
      resultId: `result-${Date.now()}`,
      metric: 'module-sequence',
      beforeValue: 0.7,
      afterValue: 0.85,
      improvement: 0.15,
      confidence: 0.8,
      explanation: '선행 조건과 난이도를 고려한 모듈 순서 최적화'
    });
  }

  private optimizeDifficulty(path: LearningPath): void {
    // 사용자 성과에 따른 난이도 조정
    path.modules.forEach(module => {
      if (module.completionRate < 0.6) {
        // 낮은 완료율: 난이도 낮추기
        module.adaptiveContent.forEach(content => {
          content.difficulty = Math.max(0.1, content.difficulty - 0.1);
        });
      } else if (module.completionRate > 0.9) {
        // 높은 완료율: 난이도 높이기
        module.adaptiveContent.forEach(content => {
          content.difficulty = Math.min(1.0, content.difficulty + 0.1);
        });
      }
    });
  }

  private optimizeContent(path: LearningPath): void {
    // 콘텐츠 품질 기반 최적화
    path.modules.forEach(module => {
      if (module.qualityScore < 0.8) {
        // 품질이 낮은 콘텐츠 개선
        module.adaptiveContent.forEach(content => {
          content.qualityMetrics.clarity = Math.min(1.0, content.qualityMetrics.clarity + 0.05);
          content.qualityMetrics.relevance = Math.min(1.0, content.qualityMetrics.relevance + 0.05);
        });
      }
    });
  }

  private optimizeCollaboration(path: LearningPath): void {
    // 협업 요소 강화
    const collaborationModules = path.modules.filter(m => m.type === 'collaboration');
    if (collaborationModules.length < path.modules.length * 0.3) {
      // 협업 모듈이 부족한 경우 추가
      const newCollaborationModule: LearningModule = {
        moduleId: `collab-${Date.now()}`,
        name: '팀 프로젝트',
        description: '학습한 내용을 활용한 팀 프로젝트',
        type: 'collaboration',
        difficulty: 'intermediate',
        duration: 180,
        prerequisites: [],
        skills: ['협업', '의사소통', '문제해결'],
        qualityScore: 0.85,
        completionRate: 0,
        userSatisfaction: 0.8,
        adaptiveContent: [],
        assessments: []
      };

      path.modules.push(newCollaborationModule);
    }
  }

  private analyzeOptimizationResults(path: LearningPath): void {
    // 최적화 결과 분석
    const results = path.optimization.results;

    results.forEach(result => {
      if (result.improvement > 0.1) {
        console.log(`📈 상당한 개선: ${result.metric} (${(result.improvement * 100).toFixed(1)}% 향상)`);
      } else if (result.improvement > 0.05) {
        console.log(`📊 적당한 개선: ${result.metric} (${(result.improvement * 100).toFixed(1)}% 향상)`);
      }
    });
  }

  private generateRecommendations(path: LearningPath): void {
    // 학습 경로 개선 권장사항 생성
    const recommendations: LearningRecommendation[] = [];

    // 콘텐츠 품질 개선 권장사항
    if (path.qualityMetrics.contentQuality < 0.8) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'content',
        title: '콘텐츠 품질 개선',
        description: '낮은 품질의 콘텐츠를 개선하여 학습 효과 향상',
        rationale: '콘텐츠 품질이 학습 효과에 직접적인 영향을 미침',
        impact: 0.2,
        effort: 0.6,
        priority: 'high',
        implementation: '콘텐츠 리뷰 및 개선 작업',
        expectedOutcome: '콘텐츠 품질 20% 향상',
        status: 'proposed'
      });
    }

    // 협업 요소 강화 권장사항
    if (path.qualityMetrics.collaborationQuality < 0.7) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'collaboration',
        title: '협업 학습 강화',
        description: '협업 학습 요소를 추가하여 팀워크 역량 강화',
        rationale: '협업 능력은 현대 직무에서 필수적인 역량',
        impact: 0.15,
        effort: 0.4,
        priority: 'medium',
        implementation: '협업 모듈 추가 및 팀 프로젝트 설계',
        expectedOutcome: '협업 품질 15% 향상',
        status: 'proposed'
      });
    }

    path.recommendations = recommendations;
  }

  private checkOptimizationNeeds(pathId: string): void {
    const path = this.learningPaths.get(pathId);
    if (!path) return;

    const settings = path.settings;

    // 자동 최적화 조건 확인
    if (settings.optimization && path.qualityMetrics.overallQuality < settings.qualityThresholds.minimumQuality) {
      console.log(`🔄 품질 기준 미달로 자동 최적화 실행: ${pathId}`);
      this.optimizePath(pathId);
    }
  }

  private startOptimizationMonitoring(): void {
    setInterval(() => {
      if (!this.isRunning) return;

      // 모든 활성 경로에 대해 최적화 모니터링
      this.learningPaths.forEach((path, pathId) => {
        if (path.status === 'active') {
          this.checkOptimizationNeeds(pathId);
          this.updateQualityMetrics(pathId);
        }
      });

      this.updateAnalytics();
      this.cleanupOldData();
    }, 60000); // 1분마다 모니터링
  }

  private updateAnalytics(): void {
    const paths = Array.from(this.learningPaths.values());

    this.analytics.totalPaths = paths.length;
    this.analytics.activePaths = paths.filter(p => p.status === 'active').length;
    this.analytics.averageProgress = paths.reduce((sum, p) => sum + p.progress.overallProgress, 0) / paths.length;
    this.analytics.averageQuality = paths.reduce((sum, p) => sum + p.qualityMetrics.overallQuality, 0) / paths.length;
    this.analytics.optimizationRate = paths.filter(p => p.optimization.status === 'completed').length / paths.length;
    this.analytics.completionRate = paths.reduce((sum, p) => sum + p.qualityMetrics.completionRate, 0) / paths.length;
    this.analytics.satisfactionRate = paths.reduce((sum, p) => sum + p.qualityMetrics.satisfactionQuality, 0) / paths.length;
    this.analytics.skillImprovement = paths.reduce((sum, p) => sum + p.qualityMetrics.skillImprovement, 0) / paths.length;
    this.analytics.collaborationEffectiveness = paths.reduce((sum, p) => sum + p.qualityMetrics.collaborationQuality, 0) / paths.length;
    this.analytics.adaptiveContentUsage = paths.reduce((sum, p) =>
      sum + p.modules.reduce((mSum, m) => mSum + m.adaptiveContent.length, 0), 0) / paths.length;
  }

  private cleanupOldData(): void {
    const now = Date.now();
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90일

    this.learningPaths.forEach(path => {
      path.qualityMetrics.trends = path.qualityMetrics.trends.filter(
        trend => now - new Date(trend.period).getTime() < maxAge
      );
    });
  }

  private cleanupData(): void {
    this.learningPaths.clear();
    console.log('🧹 학습 경로 데이터 정리 완료');
  }

  public getLearningPaths(): LearningPath[] {
    return Array.from(this.learningPaths.values());
  }

  public getLearningPath(pathId: string): LearningPath | undefined {
    return this.learningPaths.get(pathId);
  }

  public getAnalytics(): LearningAnalytics {
    return { ...this.analytics };
  }

  public isSystemRunning(): boolean {
    return this.isRunning;
  }
}

const aiMultimodalLearningPathOptimizationSystem = new AIMultimodalLearningPathOptimizationSystem();
export default aiMultimodalLearningPathOptimizationSystem;
