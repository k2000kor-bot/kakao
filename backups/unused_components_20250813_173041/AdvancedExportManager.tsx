import React, { useState, useEffect } from 'react';
import {
    DocumentArrowDownIcon,
    Cog6ToothIcon,
    ArrowDownTrayIcon,
    PlayIcon,
    PauseIcon,
    EyeIcon,
    TrashIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import dialogueAPI, { utils } from '../services/dialogueAPI';

interface ExportFormat {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    extension: string;
    supports: string[];
}

interface ExportTemplate {
    id: string;
    name: string;
    description: string;
    format: string;
    structure: ExportStructure;
    customFields: CustomField[];
    created_at: string;
}

interface ExportStructure {
    includeContext: boolean;
    includeEffectiveness: boolean;
    includeMetadata: boolean;
    includeUserFeedback: boolean;
    groupBy: 'session' | 'type' | 'date' | 'effectiveness';
    sortBy: 'date' | 'effectiveness' | 'usage' | 'alphabetical';
    filterCriteria: FilterCriteria;
}

interface FilterCriteria {
    dateRange: { start: string; end: string };
    minEffectiveness: number;
    dialogueTypes: string[];
    sessionTags: string[];
    userRating: number;
}

interface CustomField {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select';
    required: boolean;
    defaultValue?: any;
    options?: string[];
}

const AdvancedExportManager: React.FC = () => {
    const [selectedFormat, setSelectedFormat] = useState<string>('json');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
    const [exportStructure, setExportStructure] = useState<ExportStructure>({
        includeContext: true,
        includeEffectiveness: true,
        includeMetadata: true,
        includeUserFeedback: true,
        groupBy: 'session',
        sortBy: 'date',
        filterCriteria: {
            dateRange: { start: '', end: '' },
            minEffectiveness: 0,
            dialogueTypes: [],
            sessionTags: [],
            userRating: 0
        }
    });
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [templates, setTemplates] = useState<ExportTemplate[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [newTemplate, setNewTemplate] = useState<Partial<ExportTemplate>>({});

    const exportFormats: ExportFormat[] = [
        {
            id: 'json',
            name: 'JSON',
            description: '구조화된 데이터 형식, API 통합에 최적',
            icon: DocumentArrowDownIcon,
            extension: 'json',
            supports: ['nested_data', 'metadata', 'custom_fields']
        },
        {
            id: 'csv',
            name: 'CSV',
            description: '표 형식 데이터, Excel/Google Sheets에서 활용',
            icon: DocumentArrowDownIcon,
            extension: 'csv',
            supports: ['tabular_data', 'statistical_analysis']
        },
        {
            id: 'excel',
            name: 'Excel (XLSX)',
            description: '다중 시트 지원, 고급 데이터 분석 가능',
            icon: DocumentArrowDownIcon,
            extension: 'xlsx',
            supports: ['multiple_sheets', 'charts', 'formulas']
        },
        {
            id: 'markdown',
            name: 'Markdown',
            description: '문서 형식, 보고서 및 문서화에 적합',
            icon: DocumentArrowDownIcon,
            extension: 'md',
            supports: ['formatted_text', 'documentation']
        },
        {
            id: 'html',
            name: 'HTML 보고서',
            description: '웹 기반 인터랙티브 보고서',
            icon: DocumentArrowDownIcon,
            extension: 'html',
            supports: ['interactive', 'charts', 'styling']
        }
    ];

    // 초기 템플릿 로드
    useEffect(() => {
        loadExportTemplates();
    }, []);

    const loadExportTemplates = () => {
        const defaultTemplates: ExportTemplate[] = [
            {
                id: 'default',
                name: '기본 내보내기',
                description: '모든 데이터를 포함한 표준 내보내기',
                format: 'json',
                structure: exportStructure,
                customFields: [],
                created_at: new Date().toISOString()
            },
            {
                id: 'analytics_report',
                name: '분석 보고서',
                description: '효과성 분석에 특화된 보고서',
                format: 'excel',
                structure: {
                    ...exportStructure,
                    groupBy: 'effectiveness',
                    sortBy: 'effectiveness',
                    filterCriteria: {
                        ...exportStructure.filterCriteria,
                        minEffectiveness: 0.7
                    }
                },
                customFields: [
                    {
                        id: 'report_title',
                        name: '보고서 제목',
                        type: 'text',
                        required: true,
                        defaultValue: '대화 효과성 분석 보고서'
                    },
                    {
                        id: 'analysis_period',
                        name: '분석 기간',
                        type: 'text',
                        required: true
                    }
                ],
                created_at: new Date().toISOString()
            },
            {
                id: 'training_data',
                name: '학습 데이터셋',
                description: 'AI 모델 학습용 데이터 형식',
                format: 'json',
                structure: {
                    ...exportStructure,
                    includeMetadata: false,
                    includeUserFeedback: false,
                    groupBy: 'type',
                    sortBy: 'effectiveness'
                },
                customFields: [
                    {
                        id: 'dataset_version',
                        name: '데이터셋 버전',
                        type: 'text',
                        required: true,
                        defaultValue: 'v1.0'
                    },
                    {
                        id: 'include_validation',
                        name: '검증 데이터 포함',
                        type: 'boolean',
                        required: false,
                        defaultValue: true
                    }
                ],
                created_at: new Date().toISOString()
            }
        ];

        setTemplates(defaultTemplates);
    };

    const applyTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSelectedFormat(template.format);
            setExportStructure(template.structure);
            setCustomFields(template.customFields);
            setSelectedTemplate(templateId);
        }
    };

    const createTemplate = () => {
        if (!newTemplate.name) return;

        const template: ExportTemplate = {
            id: `template_${Date.now()}`,
            name: newTemplate.name,
            description: newTemplate.description || '',
            format: selectedFormat,
            structure: exportStructure,
            customFields: customFields,
            created_at: new Date().toISOString()
        };

        setTemplates([...templates, template]);
        setNewTemplate({});
        setShowTemplateForm(false);
    };

    const exportData = async () => {
        setIsExporting(true);
        setExportProgress(0);

        try {
            // 시뮬레이션: 데이터 수집 및 처리
            const steps = ['데이터 수집', '필터링', '구조화', '변환', '파일 생성'];

            for (let i = 0; i < steps.length; i++) {
                setExportProgress((i + 1) / steps.length * 100);
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            // 내보내기 데이터 생성
            const exportData = generateExportData();

            // 파일 다운로드
            const format = exportFormats.find(f => f.id === selectedFormat);
            const filename = `conversation_export_${Date.now()}.${format?.extension}`;

            if (selectedFormat === 'json') {
                utils.downloadFile(exportData, filename, 'json');
            } else if (selectedFormat === 'csv') {
                utils.downloadFile(exportData, filename, 'csv');
            } else {
                // 다른 형식들은 JSON으로 임시 처리
                utils.downloadFile(exportData, filename, 'json');
            }

            setExportProgress(100);

        } catch (error) {
            console.error('내보내기 실패:', error);
        } finally {
            setTimeout(() => {
                setIsExporting(false);
                setExportProgress(0);
            }, 1000);
        }
    };

    const generateExportData = () => {
        // 실제로는 백엔드에서 데이터를 가져와서 처리
        const mockData = {
            export_info: {
                generated_at: new Date().toISOString(),
                format: selectedFormat,
                template: selectedTemplate,
                structure: exportStructure,
                custom_fields: customFields
            },
            sessions: [
                {
                    session_id: 'session_1',
                    title: '업무 협상 세션',
                    created_at: '2025-01-15T09:00:00Z',
                    total_messages: 12,
                    avg_effectiveness: 0.85,
                    messages: [
                        {
                            input: '이 조건으로는 합의하기 어렵습니다',
                            responses: [
                                {
                                    message: '말씀하신 우려사항을 충분히 이해합니다. 어떤 부분을 조정하면 좋을까요?',
                                    type: '공감',
                                    effectiveness: 0.88,
                                    selected: true
                                }
                            ],
                            context: exportStructure.includeContext ? {
                                emotion: 'concern',
                                situation: 'negotiation',
                                relationship: 'formal'
                            } : undefined,
                            metadata: exportStructure.includeMetadata ? {
                                timestamp: '2025-01-15T09:15:00Z',
                                response_time: 0.8,
                                user_agent: 'web'
                            } : undefined
                        }
                    ]
                }
            ],
            analytics: {
                total_sessions: 15,
                total_messages: 125,
                avg_effectiveness: 0.78,
                type_distribution: {
                    '공감': 0.35,
                    '제안': 0.28,
                    '반문': 0.22,
                    '기타': 0.15
                }
            }
        };

        // 커스텀 필드 추가
        if (customFields.length > 0) {
            const customData: any = {};
            customFields.forEach(field => {
                customData[field.id] = field.defaultValue || '';
            });
            mockData.export_info = { ...mockData.export_info, ...customData };
        }

        return mockData;
    };

    const addCustomField = () => {
        const newField: CustomField = {
            id: `field_${Date.now()}`,
            name: '',
            type: 'text',
            required: false
        };
        setCustomFields([...customFields, newField]);
    };

    const updateCustomField = (fieldId: string, updates: Partial<CustomField>) => {
        setCustomFields(customFields.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
        ));
    };

    const removeCustomField = (fieldId: string) => {
        setCustomFields(customFields.filter(field => field.id !== fieldId));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                        <ArrowDownTrayIcon className="h-12 w-12 text-purple-600 mr-3" />
                        <h1 className="text-4xl font-bold text-gray-900">고급 내보내기 관리</h1>
                    </div>
                    <p className="text-xl text-gray-600">대화 데이터를 다양한 형식으로 내보내고 템플릿을 관리하세요</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 왼쪽: 설정 */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 내보내기 형식 */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">내보내기 형식</h3>

                            <div className="space-y-3">
                                {exportFormats.map(format => {
                                    const Icon = format.icon;
                                    return (
                                        <label key={format.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="format"
                                                value={format.id}
                                                checked={selectedFormat === format.id}
                                                onChange={(e) => setSelectedFormat(e.target.value)}
                                                className="mr-3"
                                            />
                                            <Icon className="h-6 w-6 text-blue-600 mr-3" />
                                            <div>
                                                <div className="font-medium text-gray-900">{format.name}</div>
                                                <div className="text-sm text-gray-500">{format.description}</div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {format.supports.map(feature => (
                                                        <span key={feature} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 템플릿 선택 */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">내보내기 템플릿</h3>
                                <button
                                    onClick={() => setShowTemplateForm(true)}
                                    className="text-sm text-purple-600 hover:text-purple-800"
                                >
                                    + 새 템플릿
                                </button>
                            </div>

                            <div className="space-y-2">
                                {templates.map(template => (
                                    <label key={template.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="template"
                                            value={template.id}
                                            checked={selectedTemplate === template.id}
                                            onChange={() => applyTemplate(template.id)}
                                            className="mr-3"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">{template.name}</div>
                                            <div className="text-sm text-gray-500">{template.description}</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {template.format.toUpperCase()} • {utils.formatDate(template.created_at)}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 내보내기 실행 */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <button
                                onClick={exportData}
                                disabled={isExporting}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isExporting ? (
                                    <>
                                        <ArrowDownTrayIcon className="h-5 w-5 mr-2 animate-bounce" />
                                        내보내는 중... ({exportProgress.toFixed(0)}%)
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                        내보내기 실행
                                    </>
                                )}
                            </button>

                            {isExporting && (
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${exportProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 오른쪽: 상세 설정 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 구조 설정 */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">내보내기 구조</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 포함할 데이터 */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">포함할 데이터</h4>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'includeContext', label: '문맥 분석 데이터' },
                                            { key: 'includeEffectiveness', label: '효과성 점수' },
                                            { key: 'includeMetadata', label: '메타데이터' },
                                            { key: 'includeUserFeedback', label: '사용자 피드백' }
                                        ].map(option => (
                                            <label key={option.key} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={exportStructure[option.key as keyof ExportStructure] as boolean}
                                                    onChange={(e) => setExportStructure({
                                                        ...exportStructure,
                                                        [option.key]: e.target.checked
                                                    })}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-gray-700">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* 정렬 및 그룹화 */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">정렬 및 그룹화</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">그룹화 기준</label>
                                            <select
                                                value={exportStructure.groupBy}
                                                onChange={(e) => setExportStructure({
                                                    ...exportStructure,
                                                    groupBy: e.target.value as any
                                                })}
                                                className="w-full p-2 border border-gray-300 rounded-lg"
                                            >
                                                <option value="session">세션별</option>
                                                <option value="type">대화 유형별</option>
                                                <option value="date">날짜별</option>
                                                <option value="effectiveness">효과성별</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">정렬 기준</label>
                                            <select
                                                value={exportStructure.sortBy}
                                                onChange={(e) => setExportStructure({
                                                    ...exportStructure,
                                                    sortBy: e.target.value as any
                                                })}
                                                className="w-full p-2 border border-gray-300 rounded-lg"
                                            >
                                                <option value="date">날짜순</option>
                                                <option value="effectiveness">효과성순</option>
                                                <option value="usage">사용량순</option>
                                                <option value="alphabetical">가나다순</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 필터 설정 */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">필터 설정</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">날짜 범위</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="date"
                                            value={exportStructure.filterCriteria.dateRange.start}
                                            onChange={(e) => setExportStructure({
                                                ...exportStructure,
                                                filterCriteria: {
                                                    ...exportStructure.filterCriteria,
                                                    dateRange: {
                                                        ...exportStructure.filterCriteria.dateRange,
                                                        start: e.target.value
                                                    }
                                                }
                                            })}
                                            className="flex-1 p-2 border border-gray-300 rounded-lg"
                                        />
                                        <input
                                            type="date"
                                            value={exportStructure.filterCriteria.dateRange.end}
                                            onChange={(e) => setExportStructure({
                                                ...exportStructure,
                                                filterCriteria: {
                                                    ...exportStructure.filterCriteria,
                                                    dateRange: {
                                                        ...exportStructure.filterCriteria.dateRange,
                                                        end: e.target.value
                                                    }
                                                }
                                            })}
                                            className="flex-1 p-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        최소 효과성: {(exportStructure.filterCriteria.minEffectiveness * 100).toFixed(0)}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={exportStructure.filterCriteria.minEffectiveness}
                                        onChange={(e) => setExportStructure({
                                            ...exportStructure,
                                            filterCriteria: {
                                                ...exportStructure.filterCriteria,
                                                minEffectiveness: Number(e.target.value)
                                            }
                                        })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 커스텀 필드 */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">커스텀 필드</h3>
                                <button
                                    onClick={addCustomField}
                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    + 필드 추가
                                </button>
                            </div>

                            <div className="space-y-4">
                                {customFields.map(field => (
                                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">필드명</label>
                                                <input
                                                    type="text"
                                                    value={field.name}
                                                    onChange={(e) => updateCustomField(field.id, { name: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                                    placeholder="필드명"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">타입</label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateCustomField(field.id, { type: e.target.value as any })}
                                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                                >
                                                    <option value="text">텍스트</option>
                                                    <option value="number">숫자</option>
                                                    <option value="date">날짜</option>
                                                    <option value="boolean">불린</option>
                                                    <option value="select">선택</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">기본값</label>
                                                <input
                                                    type="text"
                                                    value={field.defaultValue || ''}
                                                    onChange={(e) => updateCustomField(field.id, { defaultValue: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                                    placeholder="기본값"
                                                />
                                            </div>

                                            <div className="flex items-end space-x-2">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                                                        className="mr-1"
                                                    />
                                                    <span className="text-sm text-gray-700">필수</span>
                                                </label>
                                                <button
                                                    onClick={() => removeCustomField(field.id)}
                                                    className="p-1 text-red-500 hover:text-red-700"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {customFields.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Cog6ToothIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <p>커스텀 필드가 없습니다</p>
                                        <p className="text-sm">필드를 추가하여 내보내기를 맞춤 설정하세요</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 미리보기 */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">내보내기 미리보기</h3>

                            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                <pre>{JSON.stringify({
                                    format: selectedFormat,
                                    structure: exportStructure,
                                    custom_fields: customFields.length,
                                    estimated_size: '~2.5MB',
                                    estimated_records: 125
                                }, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 템플릿 생성 모달 */}
                {showTemplateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 템플릿 만들기</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 이름</label>
                                    <input
                                        type="text"
                                        value={newTemplate.name || ''}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        placeholder="예: 월간 분석 보고서"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                                    <textarea
                                        value={newTemplate.description || ''}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        rows={3}
                                        placeholder="이 템플릿의 용도를 설명해주세요"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowTemplateForm(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={createTemplate}
                                    disabled={!newTemplate.name}
                                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    생성
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedExportManager; 