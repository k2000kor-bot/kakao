import React, { useState } from 'react';
import { useAIWorkflow, AIWorkflow, WorkflowExecution } from '../hooks/useAIWorkflow';

const AIWorkflowPanel: React.FC = () => {
    const {
        workflows,
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
    } = useAIWorkflow();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showExecuteModal, setShowExecuteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<AIWorkflow | null>(null);
    const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [inputData, setInputData] = useState<Record<string, string>>({});

    const stats = getStats();

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'text-yellow-600 dark:text-yellow-400',
            running: 'text-blue-600 dark:text-blue-400',
            completed: 'text-green-600 dark:text-green-400',
            failed: 'text-red-600 dark:text-red-400'
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            pending: '⏳',
            running: '🔄',
            completed: '✅',
            failed: '❌'
        };
        return icons[status as keyof typeof icons] || icons.pending;
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            content: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            analysis: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            development: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            automation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        };
        return colors[category as keyof typeof colors] || colors.content;
    };

    const handleExecuteWorkflow = async (workflow: AIWorkflow) => {
        setSelectedWorkflow(workflow);
        setInputData({});
        setShowExecuteModal(true);
    };

    const handleConfirmExecute = async () => {
        if (selectedWorkflow) {
            const execution = await executeWorkflow(selectedWorkflow.id, inputData);
            if (execution) {
                setSelectedExecution(execution);
            }
            setShowExecuteModal(false);
        }
    };

    const handleImport = async () => {
        if (importFile) {
            try {
                await importWorkflows(importFile);
                setShowImportModal(false);
                setImportFile(null);
            } catch (error) {
                alert('파일 가져오기에 실패했습니다.');
            }
        }
    };

    const getStepTypeIcon = (type: string) => {
        const icons = {
            prompt: '💬',
            analysis: '📊',
            file_process: '📁',
            decision: '🤔',
            output: '📤'
        };
        return icons[type as keyof typeof icons] || '⚙️';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    AI 워크플로우
                </h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        새 워크플로우
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        가져오기
                    </button>
                    <button
                        onClick={exportWorkflows}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                        내보내기
                    </button>
                </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.totalWorkflows}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">총 워크플로우</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {stats.activeWorkflows}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">활성 워크플로우</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {stats.totalExecutions}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">총 실행</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {stats.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">성공률</div>
                </div>
            </div>

            {/* 필터 */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <select
                            value={filter.category}
                            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">모든 카테고리</option>
                            <option value="content">콘텐츠</option>
                            <option value="analysis">분석</option>
                            <option value="development">개발</option>
                            <option value="automation">자동화</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">모든 상태</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="text"
                            value={filter.searchTerm}
                            onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                            placeholder="워크플로우 검색..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <select
                            value={filter.sortBy}
                            onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="name">이름순</option>
                            <option value="executions">실행순</option>
                            <option value="created">생성순</option>
                            <option value="updated">수정순</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 워크플로우 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {workflows.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                        워크플로우가 없습니다.
                    </div>
                ) : (
                    workflows.map((workflow) => (
                        <div
                            key={workflow.id}
                            className={`border rounded-lg p-4 transition-colors ${workflow.isActive
                                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {workflow.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {workflow.description}
                                    </p>

                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(workflow.category)}`}>
                                        {workflow.category}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>실행: {workflow.executionCount}회</span>
                                    <span>단계: {workflow.steps.length}개</span>
                                </div>

                                {workflow.lastExecuted && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        마지막 실행: {formatDate(workflow.lastExecuted)}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-1">
                                    {workflow.steps.slice(0, 3).map((step) => (
                                        <span
                                            key={step.id}
                                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                            title={step.name}
                                        >
                                            {getStepTypeIcon(step.type)} {step.name}
                                        </span>
                                    ))}
                                    {workflow.steps.length > 3 && (
                                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                            +{workflow.steps.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleExecuteWorkflow(workflow)}
                                    className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    실행
                                </button>
                                <button
                                    onClick={() => updateWorkflow(workflow.id, { isActive: !workflow.isActive })}
                                    className={`px-2 py-1 text-xs rounded ${workflow.isActive
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}
                                >
                                    {workflow.isActive ? '비활성화' : '활성화'}
                                </button>
                                <button
                                    onClick={() => deleteWorkflow(workflow.id)}
                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 실행 기록 */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">실행 기록</h3>
                <div className="space-y-2">
                    {executions.slice(0, 10).map((execution) => {
                        const workflow = workflows.find(w => w.id === execution.workflowId);

                        return (
                            <div
                                key={execution.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className={`text-lg ${getStatusColor(execution.status)}`}>
                                        {getStatusIcon(execution.status)}
                                    </span>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {workflow?.name || 'Unknown Workflow'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(execution.startTime)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-medium ${getStatusColor(execution.status)}`}>
                                        {execution.status}
                                    </span>
                                    {execution.endTime && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setSelectedExecution(execution)}
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        상세보기
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 워크플로우 실행 모달 */}
            {showExecuteModal && selectedWorkflow && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                워크플로우 실행: {selectedWorkflow.name}
                            </h3>
                            <button
                                onClick={() => setShowExecuteModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">워크플로우 단계</h4>
                                <div className="space-y-2">
                                    {selectedWorkflow.steps.sort((a, b) => a.order - b.order).map((step) => (
                                        <div key={step.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                            <span className="text-lg">{getStepTypeIcon(step.type)}</span>
                                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{step.name}</span>
                                            <span className={`px-2 py-1 text-xs rounded ${step.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {step.isActive ? '활성' : '비활성'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">입력 데이터 (선택사항)</h4>
                                <textarea
                                    value={JSON.stringify(inputData, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            setInputData(JSON.parse(e.target.value));
                                        } catch {
                                            // JSON 파싱 실패 시 무시
                                        }
                                    }}
                                    placeholder='{"key": "value"}'
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                    rows={4}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowExecuteModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleConfirmExecute}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    실행
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 실행 결과 모달 */}
            {selectedExecution && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                실행 결과
                            </h3>
                            <button
                                onClick={() => setSelectedExecution(null)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">실행 정보</h4>
                                    <div className="space-y-1 text-sm">
                                        <div>상태: <span className={getStatusColor(selectedExecution.status)}>{selectedExecution.status}</span></div>
                                        <div>시작: {formatDate(selectedExecution.startTime)}</div>
                                        {selectedExecution.endTime && (
                                            <div>종료: {formatDate(selectedExecution.endTime)}</div>
                                        )}
                                        {selectedExecution.error && (
                                            <div className="text-red-600 dark:text-red-400">오류: {selectedExecution.error}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">실행 결과</h4>
                                <pre className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                                    {JSON.stringify(selectedExecution.results, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 가져오기 모달 */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            워크플로우 가져오기
                        </h3>
                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!importFile}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                가져오기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIWorkflowPanel;
