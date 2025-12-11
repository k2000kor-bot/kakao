import { ChatSession, Message } from '../types/chat';
import { Project } from '../types/project';

interface WorkflowStep {
    id: string;
    name: string;
    type: 'trigger' | 'action' | 'condition' | 'response';
    description: string;
    execute: (context: WorkflowContext) => Promise<WorkflowResult>;
    priority: number;
    enabled: boolean;
}

interface WorkflowContext {
    session: ChatSession;
    project: Project | null;
    userMessage: string;
    aiResponse: string;
    userPatterns: any;
    projectData: any;
    timestamp: Date;
}

interface WorkflowResult {
    success: boolean;
    action: string;
    data: any;
    message: string;
    nextSteps: string[];
}

interface AutomationRule {
    id: string;
    name: string;
    description: string;
    triggers: string[];
    conditions: string[];
    actions: string[];
    priority: number;
    enabled: boolean;
    lastExecuted: Date | null;
    executionCount: number;
}

interface SmartSuggestion {
    type: 'question' | 'action' | 'resource' | 'optimization';
    title: string;
    description: string;
    confidence: number;
    action: string;
    data: any;
}

export class AutomationWorkflowEngine {
    private workflows: Map<string, WorkflowStep> = new Map();
    private rules: Map<string, AutomationRule> = new Map();
    private suggestions: SmartSuggestion[] = [];
    private readonly STORAGE_KEY = 'automation_workflow_data';

    constructor() {
        this.initializeWorkflows();
        this.initializeRules();
        this.loadData();
    }

    private initializeWorkflows() {
        // 자동 파일 정리 워크플로우
        this.workflows.set('auto_file_organization', {
            id: 'auto_file_organization',
            name: '자동 파일 정리',
            type: 'action',
            description: '프로젝트 파일을 자동으로 분류하고 정리합니다.',
            priority: 1,
            enabled: true,
            execute: async (context) => {
                if (!context.project) {
                    return {
                        success: false,
                        action: 'auto_file_organization',
                        data: null,
                        message: '프로젝트가 선택되지 않았습니다.',
                        nextSteps: ['프로젝트를 선택하세요']
                    };
                }

                const files = context.project.files || [];
                const organizedFiles = this.organizeFiles(files);

                return {
                    success: true,
                    action: 'auto_file_organization',
                    data: { organizedFiles },
                    message: `${organizedFiles.length}개의 파일을 자동으로 정리했습니다.`,
                    nextSteps: ['파일 구조 확인', '추가 정리 필요 여부 검토']
                };
            }
        });

        // 자동 지침 생성 워크플로우
        this.workflows.set('auto_guideline_generation', {
            id: 'auto_guideline_generation',
            name: '자동 지침 생성',
            type: 'action',
            description: '프로젝트 내용을 기반으로 자동으로 지침을 생성합니다.',
            priority: 2,
            enabled: true,
            execute: async (context) => {
                if (!context.project) {
                    return {
                        success: false,
                        action: 'auto_guideline_generation',
                        data: null,
                        message: '프로젝트가 선택되지 않았습니다.',
                        nextSteps: ['프로젝트를 선택하세요']
                    };
                }

                const guidelines = this.generateGuidelinesFromProject(context.project, context.session);

                return {
                    success: true,
                    action: 'auto_guideline_generation',
                    data: { guidelines },
                    message: `${guidelines.length}개의 지침을 자동으로 생성했습니다.`,
                    nextSteps: ['지침 검토', '필요시 수정']
                };
            }
        });

        // 자동 요약 생성 워크플로우
        this.workflows.set('auto_summary_generation', {
            id: 'auto_summary_generation',
            name: '자동 요약 생성',
            type: 'action',
            description: '대화 내용을 자동으로 요약합니다.',
            priority: 3,
            enabled: true,
            execute: async (context) => {
                const summary = this.generateConversationSummary(context.session);

                return {
                    success: true,
                    action: 'auto_summary_generation',
                    data: { summary },
                    message: '대화 내용을 자동으로 요약했습니다.',
                    nextSteps: ['요약 검토', '필요시 수정']
                };
            }
        });

        // 자동 후속 질문 생성 워크플로우
        this.workflows.set('auto_followup_questions', {
            id: 'auto_followup_questions',
            name: '자동 후속 질문 생성',
            type: 'action',
            description: '사용자 질문에 대한 후속 질문을 자동으로 생성합니다.',
            priority: 4,
            enabled: true,
            execute: async (context) => {
                const followupQuestions = this.generateFollowupQuestions(context.userMessage, context.session);

                return {
                    success: true,
                    action: 'auto_followup_questions',
                    data: { followupQuestions },
                    message: `${followupQuestions.length}개의 후속 질문을 생성했습니다.`,
                    nextSteps: ['질문 선택', '추가 질문 생성']
                };
            }
        });

        // 자동 리소스 추천 워크플로우
        this.workflows.set('auto_resource_recommendation', {
            id: 'auto_resource_recommendation',
            name: '자동 리소스 추천',
            type: 'action',
            description: '사용자 질문에 관련된 리소스를 자동으로 추천합니다.',
            priority: 5,
            enabled: true,
            execute: async (context) => {
                const resources = this.recommendResources(context.userMessage, context.project);

                return {
                    success: true,
                    action: 'auto_resource_recommendation',
                    data: { resources },
                    message: `${resources.length}개의 관련 리소스를 추천합니다.`,
                    nextSteps: ['리소스 확인', '추가 검색']
                };
            }
        });

        // 자동 품질 검사 워크플로우
        this.workflows.set('auto_quality_check', {
            id: 'auto_quality_check',
            name: '자동 품질 검사',
            type: 'action',
            description: 'AI 응답의 품질을 자동으로 검사합니다.',
            priority: 6,
            enabled: true,
            execute: async (context) => {
                const qualityReport = this.checkResponseQuality(context.aiResponse, context.userMessage);

                return {
                    success: true,
                    action: 'auto_quality_check',
                    data: { qualityReport },
                    message: '응답 품질 검사를 완료했습니다.',
                    nextSteps: ['품질 개선', '피드백 제공']
                };
            }
        });
    }

    private initializeRules() {
        // 자동 파일 업로드 규칙
        this.rules.set('auto_file_upload', {
            id: 'auto_file_upload',
            name: '자동 파일 업로드',
            description: '파일 관련 질문 시 자동으로 파일 업로드 제안',
            triggers: ['파일', '업로드', '첨부', '문서'],
            conditions: ['프로젝트 선택됨', '파일 없음'],
            actions: ['파일 업로드 제안', '파일 관리 도구 표시'],
            priority: 1,
            enabled: true,
            lastExecuted: null,
            executionCount: 0
        });

        // 자동 지침 제안 규칙
        this.rules.set('auto_guideline_suggestion', {
            id: 'auto_guideline_suggestion',
            name: '자동 지침 제안',
            description: '복잡한 질문 시 관련 지침 자동 제안',
            triggers: ['복잡', '어려움', '방법', '절차'],
            conditions: ['프로젝트 선택됨', '지침 있음'],
            actions: ['관련 지침 표시', '단계별 가이드 제공'],
            priority: 2,
            enabled: true,
            lastExecuted: null,
            executionCount: 0
        });

        // 자동 요약 제안 규칙
        this.rules.set('auto_summary_suggestion', {
            id: 'auto_summary_suggestion',
            name: '자동 요약 제안',
            description: '긴 대화 후 자동으로 요약 제안',
            triggers: ['대화 길이 > 10', '시간 > 30분'],
            conditions: ['대화 완료', '요약 없음'],
            actions: ['요약 생성', '주요 포인트 표시'],
            priority: 3,
            enabled: true,
            lastExecuted: null,
            executionCount: 0
        });

        // 자동 최적화 제안 규칙
        this.rules.set('auto_optimization_suggestion', {
            id: 'auto_optimization_suggestion',
            name: '자동 최적화 제안',
            description: '성능 개선 기회 발견 시 자동 제안',
            triggers: ['응답 시간 > 5초', '오류 발생', '불만족 표현'],
            conditions: ['패턴 분석 완료', '개선 가능'],
            actions: ['최적화 제안', '성능 개선 방안 제공'],
            priority: 4,
            enabled: true,
            lastExecuted: null,
            executionCount: 0
        });
    }

    // 워크플로우 실행
    async executeWorkflow(workflowId: string, context: WorkflowContext): Promise<WorkflowResult> {
        const workflow = this.workflows.get(workflowId);

        if (!workflow || !workflow.enabled) {
            return {
                success: false,
                action: workflowId,
                data: null,
                message: '워크플로우를 찾을 수 없거나 비활성화되어 있습니다.',
                nextSteps: ['워크플로우 확인', '활성화 필요']
            };
        }

        try {
            const result = await workflow.execute(context);
            this.updateRuleExecution(workflowId);
            return result;
        } catch (error) {
            console.error(`워크플로우 실행 오류 (${workflowId}):`, error);
            return {
                success: false,
                action: workflowId,
                data: null,
                message: '워크플로우 실행 중 오류가 발생했습니다.',
                nextSteps: ['오류 로그 확인', '재시도']
            };
        }
    }

    // 규칙 기반 자동화 실행
    async executeAutomationRules(context: WorkflowContext): Promise<WorkflowResult[]> {
        const results: WorkflowResult[] = [];

        for (const rule of Array.from(this.rules.values())) {
            if (!rule.enabled) continue;

            const shouldExecute = this.evaluateRule(rule, context);
            if (shouldExecute) {
                const result = await this.executeRule(rule, context);
                results.push(result);
                this.updateRuleExecution(rule.id);
            }
        }

        return results.sort((a, b) => {
            const ruleA = this.rules.get(a.action);
            const ruleB = this.rules.get(b.action);
            return (ruleB?.priority || 0) - (ruleA?.priority || 0);
        });
    }

    // 스마트 제안 생성
    async generateSmartSuggestions(context: WorkflowContext): Promise<SmartSuggestion[]> {
        this.suggestions = [];

        // 질문 제안
        const questionSuggestions = this.generateQuestionSuggestions(context);
        this.suggestions.push(...questionSuggestions);

        // 액션 제안
        const actionSuggestions = this.generateActionSuggestions(context);
        this.suggestions.push(...actionSuggestions);

        // 리소스 제안
        const resourceSuggestions = this.generateResourceSuggestions(context);
        this.suggestions.push(...resourceSuggestions);

        // 최적화 제안
        const optimizationSuggestions = this.generateOptimizationSuggestions(context);
        this.suggestions.push(...optimizationSuggestions);

        return this.suggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);
    }

    // 파일 정리
    private organizeFiles(files: any[]): any[] {
        const categories = {
            documents: ['pdf', 'doc', 'docx', 'txt'],
            images: ['jpg', 'jpeg', 'png', 'gif'],
            data: ['csv', 'xlsx', 'json', 'xml'],
            code: ['js', 'ts', 'py', 'java', 'cpp']
        };

        return files.map(file => {
            const extension = file.name.split('.').pop()?.toLowerCase();
            let category = 'other';

            for (const [cat, exts] of Object.entries(categories)) {
                if (exts.includes(extension)) {
                    category = cat;
                    break;
                }
            }

            return {
                ...file,
                category,
                organized: true
            };
        });
    }

    // 지침 생성
    private generateGuidelinesFromProject(project: Project, session: ChatSession): any[] {
        const guidelines = [];

        // 파일 기반 지침
        if (project.files && project.files.length > 0) {
            guidelines.push({
                title: '파일 관리 지침',
                content: `프로젝트에는 ${project.files.length}개의 파일이 있습니다. 파일을 체계적으로 관리하세요.`,
                priority: 'high',
                type: 'file_management'
            });
        }

        // 대화 기반 지침
        const commonTopics = this.extractCommonTopics(session.messages);
        if (commonTopics.length > 0) {
            guidelines.push({
                title: '주요 주제별 지침',
                content: `주요 주제: ${commonTopics.join(', ')}. 이 주제들에 대한 명확한 가이드라인을 따르세요.`,
                priority: 'medium',
                type: 'topic_guidance'
            });
        }

        // 프로젝트 특성 기반 지침
        guidelines.push({
            title: '프로젝트 진행 지침',
            content: '단계별로 진행하고 정기적으로 진행 상황을 점검하세요.',
            priority: 'high',
            type: 'progress_management'
        });

        return guidelines;
    }

    // 대화 요약 생성
    private generateConversationSummary(session: ChatSession): any {
        const messages = session.messages;
        const userMessages = messages.filter(m => m.isUser);
        const aiMessages = messages.filter(m => !m.isUser);

        const keyTopics = this.extractCommonTopics(messages);
        const mainQuestions = userMessages
            .filter(m => m.content.includes('?'))
            .slice(0, 3)
            .map(m => m.content);

        return {
            totalMessages: messages.length,
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            keyTopics,
            mainQuestions,
            duration: new Date(session.updatedAt).getTime() - new Date(session.createdAt).getTime(),
            summary: `총 ${messages.length}개의 메시지로 ${keyTopics.length}개의 주요 주제에 대해 논의했습니다.`
        };
    }

    // 후속 질문 생성
    private generateFollowupQuestions(userMessage: string, session: ChatSession): string[] {
        const questions = [];

        // 질문 유형별 후속 질문
        if (userMessage.includes('무엇')) {
            questions.push('이것이 어떤 목적으로 사용되나요?');
            questions.push('이것의 장단점은 무엇인가요?');
        }

        if (userMessage.includes('어떻게')) {
            questions.push('구체적인 단계를 설명해주세요.');
            questions.push('주의사항이 있나요?');
        }

        if (userMessage.includes('왜')) {
            questions.push('이 방법을 선택한 이유는 무엇인가요?');
            questions.push('다른 대안은 없나요?');
        }

        // 프로젝트 관련 후속 질문
        if (session.projectId) {
            questions.push('이 내용을 프로젝트에 어떻게 적용할 수 있나요?');
            questions.push('프로젝트 진행 상황을 업데이트하시겠습니까?');
        }

        return questions.slice(0, 3);
    }

    // 리소스 추천
    private recommendResources(userMessage: string, project: Project | null): any[] {
        const resources = [];

        // 기본 리소스
        resources.push({
            type: 'documentation',
            title: '사용자 가이드',
            description: 'CORBU AI 사용 방법에 대한 상세한 가이드',
            url: '#',
            relevance: 0.9
        });

        // 프로젝트 관련 리소스
        if (project) {
            if (project.files && project.files.length > 0) {
                resources.push({
                    type: 'file',
                    title: '프로젝트 파일',
                    description: `${project.files.length}개의 프로젝트 파일`,
                    url: '#',
                    relevance: 0.8
                });
            }

            if (project.guidelines && project.guidelines.length > 0) {
                resources.push({
                    type: 'guideline',
                    title: '프로젝트 지침',
                    description: `${project.guidelines.length}개의 프로젝트 지침`,
                    url: '#',
                    relevance: 0.8
                });
            }
        }

        // 주제별 리소스
        if (userMessage.includes('분석')) {
            resources.push({
                type: 'tool',
                title: '분석 도구',
                description: '고급 분석 기능을 위한 도구 모음',
                url: '#',
                relevance: 0.7
            });
        }

        return resources.sort((a, b) => b.relevance - a.relevance);
    }

    // 응답 품질 검사
    private checkResponseQuality(aiResponse: string, userMessage: string): any {
        const qualityMetrics = {
            relevance: this.calculateRelevance(aiResponse, userMessage),
            completeness: this.calculateCompleteness(aiResponse),
            clarity: this.calculateClarity(aiResponse),
            helpfulness: this.calculateHelpfulness(aiResponse)
        };

        const overallScore = Object.values(qualityMetrics).reduce((a, b) => a + b, 0) / 4;

        return {
            metrics: qualityMetrics,
            overallScore,
            grade: overallScore >= 0.8 ? 'A' : overallScore >= 0.6 ? 'B' : overallScore >= 0.4 ? 'C' : 'D',
            suggestions: this.generateQualitySuggestions(qualityMetrics)
        };
    }

    // 규칙 평가
    private evaluateRule(rule: AutomationRule, context: WorkflowContext): boolean {
        // 트리거 확인
        const triggerMatch = rule.triggers.some(trigger =>
            context.userMessage.toLowerCase().includes(trigger.toLowerCase())
        );

        if (!triggerMatch) return false;

        // 조건 확인
        const conditionMatch = rule.conditions.every(condition => {
            switch (condition) {
                case '프로젝트 선택됨':
                    return context.project !== null;
                case '파일 없음':
                    return !context.project?.files || context.project.files.length === 0;
                case '지침 있음':
                    return context.project?.guidelines && context.project.guidelines.length > 0;
                case '대화 완료':
                    return context.session.messages.length > 10;
                case '요약 없음':
                    return true; // 간단한 구현
                case '패턴 분석 완료':
                    return true; // 간단한 구현
                case '개선 가능':
                    return true; // 간단한 구현
                default:
                    return true;
            }
        });

        return conditionMatch;
    }

    // 규칙 실행
    private async executeRule(rule: AutomationRule, context: WorkflowContext): Promise<WorkflowResult> {
        const actions = rule.actions.map(action => {
            switch (action) {
                case '파일 업로드 제안':
                    return '파일 업로드 기능을 제안합니다.';
                case '파일 관리 도구 표시':
                    return '파일 관리 도구를 표시합니다.';
                case '관련 지침 표시':
                    return '관련 지침을 표시합니다.';
                case '단계별 가이드 제공':
                    return '단계별 가이드를 제공합니다.';
                case '요약 생성':
                    return '대화 요약을 생성합니다.';
                case '주요 포인트 표시':
                    return '주요 포인트를 표시합니다.';
                case '최적화 제안':
                    return '성능 최적화를 제안합니다.';
                case '성능 개선 방안 제공':
                    return '성능 개선 방안을 제공합니다.';
                default:
                    return action;
            }
        });

        return {
            success: true,
            action: rule.id,
            data: { rule, actions },
            message: `자동화 규칙 "${rule.name}"이 실행되었습니다.`,
            nextSteps: actions
        };
    }

    // 질문 제안 생성
    private generateQuestionSuggestions(context: WorkflowContext): SmartSuggestion[] {
        const suggestions: SmartSuggestion[] = [];

        if (context.project) {
            suggestions.push({
                type: 'question',
                title: '프로젝트 진행 상황',
                description: '현재 프로젝트의 진행 상황을 확인하시겠습니까?',
                confidence: 0.8,
                action: 'check_project_progress',
                data: { projectId: context.project.id }
            });
        }

        suggestions.push({
            type: 'question',
            title: '성능 최적화',
            description: 'AI 응답 성능을 개선하는 방법을 알고 싶으신가요?',
            confidence: 0.7,
            action: 'optimize_performance',
            data: {}
        });

        return suggestions;
    }

    // 액션 제안 생성
    private generateActionSuggestions(context: WorkflowContext): SmartSuggestion[] {
        const suggestions: SmartSuggestion[] = [];

        if (context.session.messages.length > 5) {
            suggestions.push({
                type: 'action',
                title: '대화 요약 생성',
                description: '현재 대화 내용을 요약하여 정리합니다.',
                confidence: 0.9,
                action: 'generate_summary',
                data: { sessionId: context.session.id }
            });
        }

        if (context.project && (!context.project.files || context.project.files.length === 0)) {
            suggestions.push({
                type: 'action',
                title: '파일 업로드',
                description: '프로젝트에 관련 파일을 업로드하세요.',
                confidence: 0.8,
                action: 'upload_files',
                data: { projectId: context.project.id }
            });
        }

        return suggestions;
    }

    // 리소스 제안 생성
    private generateResourceSuggestions(context: WorkflowContext): SmartSuggestion[] {
        const suggestions: SmartSuggestion[] = [];

        suggestions.push({
            type: 'resource',
            title: '사용자 가이드',
            description: 'CORBU AI의 모든 기능을 확인하세요.',
            confidence: 0.9,
            action: 'show_user_guide',
            data: {}
        });

        if (context.project) {
            suggestions.push({
                type: 'resource',
                title: '프로젝트 템플릿',
                description: '유사한 프로젝트 템플릿을 참고하세요.',
                confidence: 0.7,
                action: 'show_templates',
                data: { projectType: context.project?.name || 'unknown' }
            });
        }

        return suggestions;
    }

    // 최적화 제안 생성
    private generateOptimizationSuggestions(context: WorkflowContext): SmartSuggestion[] {
        const suggestions: SmartSuggestion[] = [];

        // 응답 시간 최적화
        if (context.session.messages.length > 20) {
            suggestions.push({
                type: 'optimization',
                title: '대화 정리',
                description: '오래된 대화를 정리하여 성능을 개선하세요.',
                confidence: 0.8,
                action: 'cleanup_conversations',
                data: {}
            });
        }

        // 프로젝트 최적화
        if (context.project && context.project.files && context.project.files.length > 10) {
            suggestions.push({
                type: 'optimization',
                title: '파일 정리',
                description: '불필요한 파일을 정리하여 프로젝트를 최적화하세요.',
                confidence: 0.7,
                action: 'organize_files',
                data: { projectId: context.project.id }
            });
        }

        return suggestions;
    }

    // 공통 주제 추출
    private extractCommonTopics(messages: Message[]): string[] {
        const topics: { [key: string]: number } = {};

        messages.forEach(msg => {
            const words = msg.content.toLowerCase().match(/[가-힣]+/g) || [];
            words.forEach(word => {
                if (word.length > 1) {
                    topics[word] = (topics[word] || 0) + 1;
                }
            });
        });

        return Object.entries(topics)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([topic]) => topic);
    }

    // 품질 메트릭 계산
    private calculateRelevance(response: string, question: string): number {
        const questionWords = question.toLowerCase().match(/[가-힣]+/g) || [];
        const responseWords = response.toLowerCase().match(/[가-힣]+/g) || [];

        const commonWords = questionWords.filter((word: string) => (responseWords as string[]).includes(word));
        return Math.min(1, commonWords.length / Math.max(questionWords.length, 1));
    }

    private calculateCompleteness(response: string): number {
        const minLength = 50;
        const maxLength = 500;
        const length = response.length;

        if (length < minLength) return length / minLength;
        if (length > maxLength) return 1 - (length - maxLength) / maxLength;
        return 1;
    }

    private calculateClarity(response: string): number {
        const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

        // 적절한 문장 길이 (20-50자)를 선호
        if (avgSentenceLength >= 20 && avgSentenceLength <= 50) return 1;
        if (avgSentenceLength < 20) return avgSentenceLength / 20;
        return Math.max(0, 1 - (avgSentenceLength - 50) / 50);
    }

    private calculateHelpfulness(response: string): number {
        const helpfulIndicators = ['예시', '단계', '방법', '해결', '도움', '제안'];
        const helpfulCount = helpfulIndicators.filter(indicator =>
            response.includes(indicator)
        ).length;

        return Math.min(1, helpfulCount / helpfulIndicators.length);
    }

    // 품질 개선 제안 생성
    private generateQualitySuggestions(metrics: any): string[] {
        const suggestions = [];

        if (metrics.relevance < 0.7) {
            suggestions.push('질문과 더 관련성 높은 답변을 제공하세요.');
        }

        if (metrics.completeness < 0.7) {
            suggestions.push('더 상세하고 완전한 답변을 제공하세요.');
        }

        if (metrics.clarity < 0.7) {
            suggestions.push('더 명확하고 이해하기 쉬운 답변을 제공하세요.');
        }

        if (metrics.helpfulness < 0.7) {
            suggestions.push('더 실용적이고 도움이 되는 답변을 제공하세요.');
        }

        return suggestions;
    }

    // 규칙 실행 업데이트
    private updateRuleExecution(ruleId: string): void {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.lastExecuted = new Date();
            rule.executionCount += 1;
            this.rules.set(ruleId, rule);
            this.saveData();
        }
    }

    // 데이터 저장
    private saveData(): void {
        try {
            const data = {
                workflows: Object.fromEntries(this.workflows),
                rules: Object.fromEntries(this.rules)
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('자동화 워크플로우 데이터 저장 오류:', error);
        }
    }

    // 데이터 로드
    private loadData(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);

                if (data.workflows) {
                    this.workflows = new Map(Object.entries(data.workflows));
                }

                if (data.rules) {
                    this.rules = new Map(Object.entries(data.rules));
                }
            }
        } catch (error) {
            console.error('자동화 워크플로우 데이터 로드 오류:', error);
        }
    }

    // 전체 자동화 실행
    async runFullAutomation(context: WorkflowContext): Promise<{
        workflows: WorkflowResult[];
        rules: WorkflowResult[];
        suggestions: SmartSuggestion[];
    }> {
        const workflows = await this.executeAutomationRules(context);
        const rules = await this.executeAutomationRules(context);
        const suggestions = await this.generateSmartSuggestions(context);

        return {
            workflows,
            rules,
            suggestions
        };
    }
}

const automationWorkflowEngine = new AutomationWorkflowEngine();
export default automationWorkflowEngine;
