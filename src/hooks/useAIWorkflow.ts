import { useState, useCallback, useEffect } from 'react';

export interface WorkflowStep {
    id: string;
    name: string;
    type: 'prompt' | 'analysis' | 'file_process' | 'decision' | 'output';
    config: Record<string, unknown>;
    order: number;
    isActive: boolean;
    dependencies: string[];
}

export interface AIWorkflow {
    id: string;
    name: string;
    description: string;
    category: string;
    steps: WorkflowStep[];
    triggers: WorkflowTrigger[];
    isActive: boolean;
    executionCount: number;
    lastExecuted: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkflowTrigger {
    id: string;
    type: 'manual' | 'file_upload' | 'schedule' | 'api_call';
    config: Record<string, unknown>;
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime: Date;
    endTime: Date | null;
    results: Record<string, unknown>;
    error?: string;
}

export interface WorkflowFilter {
    category: string;
    status: 'all' | 'active' | 'inactive';
    searchTerm: string;
    sortBy: 'name' | 'executions' | 'created' | 'updated';
    sortOrder: 'asc' | 'desc';
}

const DEFAULT_WORKFLOWS: AIWorkflow[] = [
    {
        id: 'content-generation',
        name: '콘텐츠 생성 워크플로우',
        description: '블로그 포스트 자동 생성 및 SEO 최적화',
        category: 'content',
        steps: [
            {
                id: 'step1',
                name: '주제 분석',
                type: 'analysis',
                config: {
                    analysisType: 'topic_research',
                    keywords: ['{topic}'],
                    depth: 'comprehensive'
                },
                order: 1,
                isActive: true,
                dependencies: []
            },
            {
                id: 'step2',
                name: '콘텐츠 생성',
                type: 'prompt',
                config: {
                    template: 'blog-writer',
                    variables: {
                        topic: '{topic}',
                        keywords: '{keywords}',
                        audience: '{audience}',
                        wordCount: '1500'
                    }
                },
                order: 2,
                isActive: true,
                dependencies: ['step1']
            },
            {
                id: 'step3',
                name: 'SEO 최적화',
                type: 'analysis',
                config: {
                    analysisType: 'seo_optimization',
                    targetKeywords: '{keywords}',
                    content: '{generated_content}'
                },
                order: 3,
                isActive: true,
                dependencies: ['step2']
            },
            {
                id: 'step4',
                name: '최종 출력',
                type: 'output',
                config: {
                    format: 'markdown',
                    includeMetadata: true,
                    saveToFile: true
                },
                order: 4,
                isActive: true,
                dependencies: ['step3']
            }
        ],
        triggers: [
            {
                id: 'trigger1',
                type: 'manual',
                config: {}
            }
        ],
        isActive: true,
        executionCount: 0,
        lastExecuted: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'data-analysis',
        name: '데이터 분석 워크플로우',
        description: '파일 업로드 시 자동 데이터 분석 및 리포트 생성',
        category: 'analysis',
        steps: [
            {
                id: 'step1',
                name: '파일 처리',
                type: 'file_process',
                config: {
                    fileTypes: ['csv', 'xlsx', 'json'],
                    extractData: true
                },
                order: 1,
                isActive: true,
                dependencies: []
            },
            {
                id: 'step2',
                name: '데이터 분석',
                type: 'analysis',
                config: {
                    analysisType: 'statistical_analysis',
                    metrics: ['mean', 'median', 'std', 'correlation'],
                    visualizations: ['histogram', 'scatter_plot', 'heatmap']
                },
                order: 2,
                isActive: true,
                dependencies: ['step1']
            },
            {
                id: 'step3',
                name: '인사이트 생성',
                type: 'prompt',
                config: {
                    template: 'data-analyzer',
                    variables: {
                        data: '{processed_data}',
                        purpose: 'business_insights'
                    }
                },
                order: 3,
                isActive: true,
                dependencies: ['step2']
            },
            {
                id: 'step4',
                name: '리포트 생성',
                type: 'output',
                config: {
                    format: 'pdf',
                    includeCharts: true,
                    includeInsights: true
                },
                order: 4,
                isActive: true,
                dependencies: ['step3']
            }
        ],
        triggers: [
            {
                id: 'trigger1',
                type: 'file_upload',
                config: {
                    fileTypes: ['csv', 'xlsx', 'json']
                }
            }
        ],
        isActive: true,
        executionCount: 0,
        lastExecuted: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'code-review',
        name: '코드 리뷰 워크플로우',
        description: '코드 파일 업로드 시 자동 리뷰 및 개선 제안',
        category: 'development',
        steps: [
            {
                id: 'step1',
                name: '코드 파싱',
                type: 'file_process',
                config: {
                    fileTypes: ['py', 'js', 'ts', 'java', 'cpp'],
                    extractCode: true
                },
                order: 1,
                isActive: true,
                dependencies: []
            },
            {
                id: 'step2',
                name: '정적 분석',
                type: 'analysis',
                config: {
                    analysisType: 'code_quality',
                    checks: ['complexity', 'duplication', 'security', 'style']
                },
                order: 2,
                isActive: true,
                dependencies: ['step1']
            },
            {
                id: 'step3',
                name: '리뷰 생성',
                type: 'prompt',
                config: {
                    template: 'code-reviewer',
                    variables: {
                        code: '{parsed_code}',
                        language: '{file_extension}'
                    }
                },
                order: 3,
                isActive: true,
                dependencies: ['step2']
            },
            {
                id: 'step4',
                name: '개선 제안',
                type: 'output',
                config: {
                    format: 'markdown',
                    includeSuggestions: true,
                    includeExamples: true
                },
                order: 4,
                isActive: true,
                dependencies: ['step3']
            }
        ],
        triggers: [
            {
                id: 'trigger1',
                type: 'file_upload',
                config: {
                    fileTypes: ['py', 'js', 'ts', 'java', 'cpp']
                }
            }
        ],
        isActive: true,
        executionCount: 0,
        lastExecuted: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const useAIWorkflow = () => {
    const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [filter, setFilter] = useState<WorkflowFilter>({
        category: 'all',
        status: 'all',
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc'
    });

    // 워크플로우 로드
    const loadWorkflows = useCallback(() => {
        try {
            const saved = localStorage.getItem('ai-workflows');
            if (saved) {
                const parsed = JSON.parse(saved);
                setWorkflows(parsed.map((item: any) => ({
                    ...item,
                    createdAt: new Date(item.createdAt),
                    updatedAt: new Date(item.updatedAt),
                    lastExecuted: item.lastExecuted ? new Date(item.lastExecuted) : null
                })));
            } else {
                // 기본 워크플로우 설정
                setWorkflows(DEFAULT_WORKFLOWS);
                saveWorkflows(DEFAULT_WORKFLOWS);
            }
        } catch (error) {
            console.error('[Workflows] 워크플로우 로드 실패:', error);
            setWorkflows(DEFAULT_WORKFLOWS);
        }
    }, []);

    // 워크플로우 저장
    const saveWorkflows = useCallback((newWorkflows: AIWorkflow[]) => {
        try {
            localStorage.setItem('ai-workflows', JSON.stringify(newWorkflows));
        } catch (error) {
            console.error('[Workflows] 워크플로우 저장 실패:', error);
        }
    }, []);

    // 워크플로우 추가
    const addWorkflow = useCallback((workflow: Omit<AIWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecuted'>) => {
        const newWorkflow: AIWorkflow = {
            ...workflow,
            id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            executionCount: 0,
            lastExecuted: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const updatedWorkflows = [newWorkflow, ...workflows];
        setWorkflows(updatedWorkflows);
        saveWorkflows(updatedWorkflows);
    }, [workflows, saveWorkflows]);

    // 워크플로우 업데이트
    const updateWorkflow = useCallback((id: string, updates: Partial<AIWorkflow>) => {
        const updatedWorkflows = workflows.map(workflow =>
            workflow.id === id
                ? { ...workflow, ...updates, updatedAt: new Date() }
                : workflow
        );
        setWorkflows(updatedWorkflows);
        saveWorkflows(updatedWorkflows);
    }, [workflows, saveWorkflows]);

    // 워크플로우 삭제
    const deleteWorkflow = useCallback((id: string) => {
        const updatedWorkflows = workflows.filter(workflow => workflow.id !== id);
        setWorkflows(updatedWorkflows);
        saveWorkflows(updatedWorkflows);
    }, [workflows, saveWorkflows]);

    // 워크플로우 실행
    const executeWorkflow = useCallback(async (workflowId: string, inputData: Record<string, unknown> = {}) => {
        const workflow = workflows.find(w => w.id === workflowId);
        if (!workflow) return null;

        const execution: WorkflowExecution = {
            id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            workflowId,
            status: 'pending',
            startTime: new Date(),
            endTime: null,
            results: {}
        };

        setExecutions(prev => [execution, ...prev]);

        try {
            // 워크플로우 실행 시뮬레이션
            execution.status = 'running';

            // 각 단계 순차 실행
            for (const step of workflow.steps.sort((a, b) => a.order - b.order)) {
                if (!step.isActive) continue;

                // 의존성 확인
                const dependenciesMet = step.dependencies.every(depId =>
                    execution.results[depId] !== undefined
                );

                if (!dependenciesMet) {
                    throw new Error(`Step ${step.name}의 의존성이 충족되지 않았습니다.`);
                }

                // 단계 실행
                const stepResult = await executeStep(step, inputData, execution.results);
                execution.results[step.id] = stepResult;
            }

            execution.status = 'completed';
            execution.endTime = new Date();

            // 워크플로우 통계 업데이트
            updateWorkflow(workflowId, {
                executionCount: workflow.executionCount + 1,
                lastExecuted: new Date()
            });

        } catch (error) {
            execution.status = 'failed';
            execution.endTime = new Date();
            execution.error = error instanceof Error ? error.message : 'Unknown error';
        }

        return execution;
    }, [workflows, updateWorkflow]);

    // 단계 실행
    const executeStep = useCallback(async (
        step: WorkflowStep,
        inputData: Record<string, unknown>,
        previousResults: Record<string, unknown>
    ): Promise<unknown> => {
        switch (step.type) {
            case 'prompt':
                // 프롬프트 실행 시뮬레이션
                return {
                    type: 'prompt_result',
                    content: `Generated content for ${step.name}`,
                    variables: step.config.variables || {}
                };

            case 'analysis':
                // 분석 실행 시뮬레이션
                return {
                    type: 'analysis_result',
                    insights: [`Insight 1 for ${step.name}`, `Insight 2 for ${step.name}`],
                    metrics: { accuracy: 0.95, confidence: 0.88 }
                };

            case 'file_process':
                // 파일 처리 시뮬레이션
                return {
                    type: 'file_process_result',
                    processedFiles: ['file1.csv', 'file2.xlsx'],
                    extractedData: { rows: 1000, columns: 10 }
                };

            case 'decision':
                // 의사결정 시뮬레이션
                return {
                    type: 'decision_result',
                    decision: 'proceed',
                    confidence: 0.92,
                    reasoning: 'All conditions met'
                };

            case 'output':
                // 출력 생성 시뮬레이션
                return {
                    type: 'output_result',
                    format: step.config.format,
                    content: `Output generated for ${step.name}`,
                    metadata: { generatedAt: new Date().toISOString() }
                };

            default:
                throw new Error(`Unknown step type: ${step.type}`);
        }
    }, []);

    // 필터링된 워크플로우
    const getFilteredWorkflows = useCallback(() => {
        let filtered = workflows.filter(workflow => {
            // 카테고리 필터
            if (filter.category !== 'all' && workflow.category !== filter.category) {
                return false;
            }

            // 상태 필터
            if (filter.status !== 'all') {
                const isActive = workflow.isActive;
                if (filter.status === 'active' && !isActive) return false;
                if (filter.status === 'inactive' && isActive) return false;
            }

            // 검색어 필터
            if (filter.searchTerm && !workflow.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) &&
                !workflow.description.toLowerCase().includes(filter.searchTerm.toLowerCase())) {
                return false;
            }

            return true;
        });

        // 정렬
        filtered.sort((a, b) => {
            let aValue: string | number | Date;
            let bValue: string | number | Date;

            switch (filter.sortBy) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'executions':
                    aValue = a.executionCount;
                    bValue = b.executionCount;
                    break;
                case 'created':
                    aValue = a.createdAt;
                    bValue = b.createdAt;
                    break;
                case 'updated':
                    aValue = a.updatedAt;
                    bValue = b.updatedAt;
                    break;
                default:
                    aValue = a.name;
                    bValue = b.name;
            }

            if (filter.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [workflows, filter]);

    // 통계 계산
    const getStats = useCallback(() => {
        const totalWorkflows = workflows.length;
        const activeWorkflows = workflows.filter(w => w.isActive).length;
        const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
        const successfulExecutions = executions.filter(e => e.status === 'completed').length;
        const failedExecutions = executions.filter(e => e.status === 'failed').length;

        const categoryStats = workflows.reduce((stats, workflow) => {
            stats[workflow.category] = (stats[workflow.category] || 0) + 1;
            return stats;
        }, {} as Record<string, number>);

        return {
            totalWorkflows,
            activeWorkflows,
            totalExecutions,
            successfulExecutions,
            failedExecutions,
            successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
            categoryStats
        };
    }, [workflows, executions]);

    // 워크플로우 내보내기
    const exportWorkflows = useCallback(() => {
        const dataStr = JSON.stringify(workflows, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-workflows-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }, [workflows]);

    // 워크플로우 가져오기
    const importWorkflows = useCallback((file: File) => {
        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target?.result as string);
                    const validatedWorkflows = imported.map((item: any) => ({
                        ...item,
                        createdAt: new Date(item.createdAt),
                        updatedAt: new Date(item.updatedAt),
                        lastExecuted: item.lastExecuted ? new Date(item.lastExecuted) : null
                    }));
                    setWorkflows(validatedWorkflows);
                    saveWorkflows(validatedWorkflows);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }, [saveWorkflows]);

    // 초기 로드
    useEffect(() => {
        loadWorkflows();
    }, [loadWorkflows]);

    return {
        workflows: getFilteredWorkflows(),
        executions,
        filter,
        setFilter,
        addWorkflow,
        updateWorkflow,
        deleteWorkflow,
        executeWorkflow,
        getStats,
        exportWorkflows,
        importWorkflows
    };
};
