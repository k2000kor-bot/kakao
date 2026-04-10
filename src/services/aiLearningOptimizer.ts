import { ChatSession } from '../types/chat';
import { Project } from '../types/project';

interface LearningPattern {
    userId: string;
    sessionId: string;
    patterns: {
        [key: string]: {
            frequency: number;
            successRate: number;
            lastUsed: Date;
            preferences: Record<string, unknown>;
        };
    };
    improvements: {
        [key: string]: {
            before: number;
            after: number;
            timestamp: Date;
        };
    };
}

interface OptimizationResult {
    improved: boolean;
    changes: Record<string, unknown>;
    confidence: number;
    reasoning: string;
}

interface LearningInteraction {
    type?: string;
    domain?: string;
    complexity?: string;
    responseTime?: number;
}

interface OptimizationOpportunity {
    type: string;
    priority?: string;
    improvement?: unknown;
}

export class AILearningOptimizer {
    private learningPatterns: Map<string, LearningPattern> = new Map();
    private globalOptimizations: Map<string, unknown> = new Map();

    // 학습 패턴 수집
    collectLearningPattern(userId: string, sessionId: string, interaction: LearningInteraction & Record<string, unknown>) {
        const pattern = this.learningPatterns.get(userId) || {
            userId,
            sessionId,
            patterns: {},
            improvements: {}
        };

        // 패턴 업데이트
        const patternKey = this.generatePatternKey(interaction);
        if (!pattern.patterns[patternKey]) {
            pattern.patterns[patternKey] = {
                frequency: 0,
                successRate: 0,
                lastUsed: new Date(),
                preferences: {}
            };
        }

        pattern.patterns[patternKey].frequency++;
        pattern.patterns[patternKey].lastUsed = new Date();
        pattern.patterns[patternKey].successRate = this.calculateSuccessRate(interaction);

        this.learningPatterns.set(userId, pattern);
    }

    // 패턴 키 생성
    private generatePatternKey(interaction: LearningInteraction): string {
        const { type, domain, complexity } = interaction;
        return `${type ?? ''}_${domain ?? ''}_${complexity ?? ''}`;
    }

    // 성공률 계산
    private calculateSuccessRate(interaction: LearningInteraction & { responseTime?: number }): number {
        // 실제 구현에서는 사용자 피드백이나 만족도 지표를 사용
        const baseRate = 0.8;
        const timeFactor = (interaction.responseTime ?? 0) < 3000 ? 0.1 : -0.1;
        const complexityFactor = interaction.complexity === 'medium' ? 0.05 : 0;

        return Math.min(1.0, Math.max(0.0, baseRate + timeFactor + complexityFactor));
    }

    // 최적화 실행
    async runOptimization(userId: string, session?: ChatSession, project?: Project): Promise<OptimizationResult> {
        const userPattern = this.learningPatterns.get(userId);
        if (!userPattern) {
            return {
                improved: false,
                changes: {},
                confidence: 0.5,
                reasoning: '사용자 패턴 데이터가 부족합니다.'
            };
        }

        const optimizations = this.analyzeOptimizationOpportunities(userPattern, session, project);
        const result = this.applyOptimizations(optimizations);

        // 개선사항 기록
        if (result.improved) {
            this.recordImprovements(userId, result.changes);
        }

        return result;
    }

    // 최적화 기회 분석
    private analyzeOptimizationOpportunities(pattern: LearningPattern, session?: ChatSession, project?: Project): OptimizationOpportunity[] {
        const opportunities: OptimizationOpportunity[] = [];

        // 응답 시간 최적화
        const avgResponseTime = this.calculateAverageResponseTime(pattern);
        if (avgResponseTime > 3000) {
            opportunities.push({
                type: 'response_time',
                priority: 'high',
                improvement: '응답 시간 단축을 위한 캐싱 및 병렬 처리 최적화'
            });
        }

        // 사용자 선호도 기반 최적화
        const preferences = this.extractUserPreferences(pattern);
        if (preferences.responseStyle === 'concise') {
            opportunities.push({
                type: 'response_style',
                priority: 'medium',
                improvement: '간결한 응답 스타일로 조정'
            });
        }

        // 도메인별 최적화
        const domain = this.detectDomain(session, project);
        if (domain) {
            opportunities.push({
                type: 'domain_specific',
                priority: 'medium',
                improvement: `${domain} 도메인에 특화된 분석 모델 적용`
            });
        }

        return opportunities;
    }

    // 평균 응답 시간 계산
    private calculateAverageResponseTime(pattern: LearningPattern): number {
        const responseTimes = Object.values(pattern.patterns)
            .map(p => p.lastUsed.getTime())
            .filter(time => time > 0);

        if (responseTimes.length === 0) return 0;

        return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }

    // 사용자 선호도 추출
    private extractUserPreferences(pattern: LearningPattern) {
        const preferences = {
            responseStyle: 'detailed',
            analysisDepth: 'comprehensive',
            language: 'korean'
        };

        // 패턴 분석을 통한 선호도 추정
        const patterns = Object.values(pattern.patterns);
        const concisePatterns = patterns.filter(p => p.frequency > 5 && p.successRate > 0.8);

        if (concisePatterns.length > patterns.length * 0.6) {
            preferences.responseStyle = 'concise';
        }

        return preferences;
    }

    // 도메인 감지
    private detectDomain(session?: ChatSession, project?: Project): string | null {
        if (project?.name) {
            if (project.name.includes('건설')) return 'construction';
            if (project.name.includes('부동산')) return 'realestate';
            if (project.name.includes('투자')) return 'finance';
        }

        if (session?.messages) {
            const recentMessages = session.messages.slice(-5);
            const content = recentMessages.map(m => m.content).join(' ');

            if (content.includes('건설') || content.includes('시공')) return 'construction';
            if (content.includes('부동산') || content.includes('매물')) return 'realestate';
            if (content.includes('투자') || content.includes('금융')) return 'finance';
        }

        return null;
    }

    // 최적화 적용
    private applyOptimizations(opportunities: OptimizationOpportunity[]): OptimizationResult {
        const changes: Record<string, unknown> = {};
        let improved = false;
        let confidence = 0.5;

        opportunities.forEach(opportunity => {
            switch (opportunity.type) {
                case 'response_time':
                    changes.responseTimeOptimization = {
                        enabled: true,
                        cacheSize: 'increased',
                        parallelProcessing: true
                    };
                    improved = true;
                    confidence += 0.2;
                    break;

                case 'response_style':
                    changes.responseStyle = 'concise';
                    improved = true;
                    confidence += 0.15;
                    break;

                case 'domain_specific':
                    changes.domainModel = opportunity.improvement;
                    improved = true;
                    confidence += 0.1;
                    break;
            }
        });

        return {
            improved,
            changes,
            confidence: Math.min(1.0, confidence),
            reasoning: this.generateOptimizationReasoning(opportunities)
        };
    }

    // 최적화 이유 생성
    private generateOptimizationReasoning(opportunities: OptimizationOpportunity[]): string {
        if (opportunities.length === 0) {
            return '현재 최적화가 필요한 영역이 없습니다.';
        }

        const reasons = opportunities.map(opp => String(opp.improvement ?? opp.type));
        return `다음 최적화를 적용했습니다: ${reasons.join(', ')}`;
    }

    // 개선사항 기록
    private recordImprovements(userId: string, changes: Record<string, unknown>) {
        const pattern = this.learningPatterns.get(userId);
        if (!pattern) return;

        Object.entries(changes).forEach(([key, value]) => {
            pattern.improvements[key] = {
                before: this.getCurrentMetric(key),
                after: this.estimateImprovement(key, value as unknown),
                timestamp: new Date()
            };
        });

        this.learningPatterns.set(userId, pattern);
    }

    // 현재 메트릭 조회
    private getCurrentMetric(key: string): number {
        // 실제 구현에서는 실제 메트릭을 조회
        const metrics: { [key: string]: number } = {
            responseTime: 2500,
            accuracy: 0.85,
            userSatisfaction: 0.78
        };
        return metrics[key] || 0;
    }

    // 개선 효과 추정
    private estimateImprovement(key: string, _change: unknown): number {
        const current = this.getCurrentMetric(key);

        switch (key) {
            case 'responseTime':
                return current * 0.8; // 20% 개선
            case 'accuracy':
                return Math.min(1.0, current + 0.05); // 5% 개선
            case 'userSatisfaction':
                return Math.min(1.0, current + 0.08); // 8% 개선
            default:
                return current;
        }
    }

    // 학습된 패턴 조회
    getLearningPatterns(userId: string): LearningPattern | null {
        return this.learningPatterns.get(userId) || null;
    }

    // 전역 최적화 조회
    getGlobalOptimizations(): Map<string, unknown> {
        return this.globalOptimizations;
    }

    // 성능 메트릭 생성
    generatePerformanceMetrics(userId: string) {
        const pattern = this.learningPatterns.get(userId);
        if (!pattern) return null;

        const totalInteractions = Object.values(pattern.patterns)
            .reduce((sum, p) => sum + p.frequency, 0);

        const avgSuccessRate = Object.values(pattern.patterns)
            .reduce((sum, p) => sum + p.successRate, 0) / Object.keys(pattern.patterns).length;

        const improvements = Object.values(pattern.improvements)
            .filter(imp => imp.after > imp.before).length;

        return {
            totalInteractions,
            averageSuccessRate: avgSuccessRate,
            totalImprovements: improvements,
            learningProgress: this.calculateLearningProgress(pattern)
        };
    }

    // 학습 진행도 계산
    private calculateLearningProgress(pattern: LearningPattern): number {
        const totalPatterns = Object.keys(pattern.patterns).length;
        const successfulPatterns = Object.values(pattern.patterns)
            .filter(p => p.successRate > 0.8).length;

        return totalPatterns > 0 ? (successfulPatterns / totalPatterns) * 100 : 0;
    }
}

const aiLearningOptimizer = new AILearningOptimizer();
export default aiLearningOptimizer;
