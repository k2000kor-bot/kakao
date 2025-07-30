import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    DocumentTextIcon,
    ChartBarIcon,
    PresentationChartLineIcon,
    TableCellsIcon,
    CubeIcon,
    CubeTransparentIcon,
    SwatchIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon,
    RectangleStackIcon,
    CircleStackIcon,
    QueueListIcon,
    ListBulletIcon,
    Bars4Icon,
    Bars3BottomLeftIcon,
    Bars3BottomRightIcon,
    Bars3CenterLeftIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    UserGroupIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleOvalLeftIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface Document {
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'txt' | 'xlsx' | 'pptx' | 'image';
    size: string;
    uploadedAt: string;
    status: 'processing' | 'analyzed' | 'failed' | 'pending';
    analysisProgress: number;
    insights: DocumentInsight[];
    metadata: {
        pages: number;
        wordCount: number;
        language: string;
        confidence: number;
    };
}

interface DocumentInsight {
    id: string;
    type: 'keyword' | 'entity' | 'sentiment' | 'topic' | 'summary' | 'recommendation';
    title: string;
    description: string;
    confidence: number;
    importance: 'low' | 'medium' | 'high' | 'critical';
    actionable: boolean;
}

interface AnalysisResult {
    id: string;
    documentId: string;
    analysisType: 'text' | 'image' | 'table' | 'chart' | 'layout';
    result: any;
    confidence: number;
    processingTime: number;
    timestamp: string;
}

interface DocumentCategory {
    id: string;
    name: string;
    count: number;
    icon: any;
    color: string;
}

interface AdvancedAIDocumentAnalysisProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIDocumentAnalysis: React.FC<AdvancedAIDocumentAnalysisProps> = ({
    isActive,
    onToggle
}) => {
    const [documents, setDocuments] = useState<Document[]>([
        {
            id: 'doc-1',
            name: 'AI_시스템_설계서_v2.1.pdf',
            type: 'pdf',
            size: '2.3MB',
            uploadedAt: '10분 전',
            status: 'analyzed',
            analysisProgress: 100,
            insights: [
                {
                    id: 'insight-1',
                    type: 'keyword',
                    title: '주요 키워드',
                    description: 'AI, 시스템, 설계, 최적화, 성능',
                    confidence: 95.2,
                    importance: 'high',
                    actionable: true
                },
                {
                    id: 'insight-2',
                    type: 'sentiment',
                    title: '문서 톤',
                    description: '전문적이고 기술적인 톤으로 작성됨',
                    confidence: 87.5,
                    importance: 'medium',
                    actionable: false
                },
                {
                    id: 'insight-3',
                    type: 'summary',
                    title: '문서 요약',
                    description: 'AI 시스템의 설계 원칙과 구현 방법에 대한 상세한 가이드',
                    confidence: 92.1,
                    importance: 'high',
                    actionable: true
                }
            ],
            metadata: {
                pages: 45,
                wordCount: 12500,
                language: 'ko',
                confidence: 94.5
            }
        },
        {
            id: 'doc-2',
            name: '사용자_피드백_분석.xlsx',
            type: 'xlsx',
            size: '1.7MB',
            uploadedAt: '30분 전',
            status: 'analyzed',
            analysisProgress: 100,
            insights: [
                {
                    id: 'insight-4',
                    type: 'entity',
                    title: '주요 엔티티',
                    description: '사용자, 시스템, 기능, 성능, 만족도',
                    confidence: 89.3,
                    importance: 'medium',
                    actionable: true
                },
                {
                    id: 'insight-5',
                    type: 'topic',
                    title: '주요 토픽',
                    description: '사용자 경험, 시스템 성능, 기능 개선',
                    confidence: 91.7,
                    importance: 'high',
                    actionable: true
                }
            ],
            metadata: {
                pages: 12,
                wordCount: 8500,
                language: 'ko',
                confidence: 88.9
            }
        },
        {
            id: 'doc-3',
            name: '보안_정책_가이드라인.docx',
            type: 'docx',
            size: '3.1MB',
            uploadedAt: '1시간 전',
            status: 'processing',
            analysisProgress: 65,
            insights: [],
            metadata: {
                pages: 28,
                wordCount: 15200,
                language: 'ko',
                confidence: 0
            }
        }
    ]);

    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([
        {
            id: 'result-1',
            documentId: 'doc-1',
            analysisType: 'text',
            result: {
                keywords: ['AI', '시스템', '설계', '최적화', '성능'],
                entities: ['사용자', '개발자', '관리자'],
                sentiment: 'positive',
                topics: ['시스템 설계', 'AI 구현', '성능 최적화']
            },
            confidence: 94.5,
            processingTime: 12.3,
            timestamp: '5분 전'
        },
        {
            id: 'result-2',
            documentId: 'doc-2',
            analysisType: 'table',
            result: {
                tables: 8,
                dataPoints: 1250,
                trends: ['상승', '안정', '개선'],
                insights: ['사용자 만족도 향상', '성능 개선 필요']
            },
            confidence: 88.9,
            processingTime: 8.7,
            timestamp: '25분 전'
        }
    ]);

    const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([
        {
            id: 'cat-1',
            name: '기술 문서',
            count: 12,
            icon: DocumentTextIcon,
            color: 'blue'
        },
        {
            id: 'cat-2',
            name: '분석 보고서',
            count: 8,
            icon: ChartBarIcon,
            color: 'green'
        },
        {
            id: 'cat-3',
            name: '정책 문서',
            count: 5,
            icon: CpuChipIcon,
            color: 'red'
        },
        {
            id: 'cat-4',
            name: '프레젠테이션',
            count: 3,
            icon: PresentationChartLineIcon,
            color: 'purple'
        }
    ]);

    const [activeTab, setActiveTab] = useState<'documents' | 'analysis' | 'insights' | 'categories' | 'settings'>('documents');
    const [selectedDocument, setSelectedDocument] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        // 문서 분석 진행률 시뮬레이션
        const interval = setInterval(() => {
            setDocuments(prev => prev.map(doc => {
                if (doc.status === 'processing') {
                    const newProgress = Math.min(100, doc.analysisProgress + Math.random() * 5);
                    const newStatus = newProgress >= 100 ? 'analyzed' : 'processing';
                    return {
                        ...doc,
                        analysisProgress: newProgress,
                        status: newStatus
                    };
                }
                return doc;
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'analyzed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'failed': return 'text-red-600 bg-red-50 border-red-200';
            case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <DocumentTextIcon className="w-4 h-4" />;
            case 'docx': return <DocumentTextIcon className="w-4 h-4" />;
            case 'xlsx': return <TableCellsIcon className="w-4 h-4" />;
            case 'pptx': return <PresentationChartLineIcon className="w-4 h-4" />;
            case 'txt': return <DocumentTextIcon className="w-4 h-4" />;
            case 'image': return <CpuChipIcon className="w-4 h-4" />;
            default: return <DocumentTextIcon className="w-4 h-4" />;
        }
    };

    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const handleFileUpload = () => {
        setIsUploading(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    return 100;
                }
                return prev + Math.random() * 20;
            });
        }, 500);
    };

    const analyzeDocument = (documentId: string) => {
        setDocuments(prev => prev.map(doc =>
            doc.id === documentId
                ? { ...doc, status: 'processing' as any, analysisProgress: 0 }
                : doc
        ));
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>문서 분석</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-7xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-900 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <DocumentTextIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 문서 분석 시스템</h3>
                                <p className="text-gray-400 text-sm">다양한 문서의 AI 기반 분석 및 인사이트 추출</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{documents.filter(d => d.status === 'analyzed').length}개 분석 완료</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <CpuChipIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'documents', label: '문서', icon: DocumentTextIcon },
                        { id: 'analysis', label: '분석', icon: CpuChipIcon },
                        { id: 'insights', label: '인사이트', icon: PaintBrushIcon },
                        { id: 'categories', label: '카테고리', icon: RectangleStackIcon },
                        { id: 'settings', label: '설정', icon: AdjustmentsHorizontalIcon }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${activeTab === id
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            {/* 파일 업로드 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">문서 업로드</h4>
                                    <button
                                        onClick={handleFileUpload}
                                        disabled={isUploading}
                                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        {isUploading ? '업로드 중...' : '문서 업로드'}
                                    </button>
                                </div>
                                {isUploading && (
                                    <div className="mb-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">업로드 진행률: {uploadProgress.toFixed(1)}%</p>
                                    </div>
                                )}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">문서를 여기에 드래그하거나 클릭하여 업로드</p>
                                    <p className="text-sm text-gray-500 mt-2">PDF, DOCX, XLSX, PPTX, TXT, 이미지 파일 지원</p>
                                </div>
                            </div>

                            {/* 문서 목록 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">문서 목록</h4>
                                <div className="space-y-4">
                                    {documents.map(document => (
                                        <div key={document.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getTypeIcon(document.type)}
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{document.name}</h5>
                                                        <p className="text-sm text-gray-500">{document.size} • {document.uploadedAt}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                                                    {document.status}
                                                </span>
                                            </div>

                                            {document.status === 'processing' && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600">분석 진행률</span>
                                                        <span className="font-semibold text-gray-900">{document.analysisProgress.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${document.analysisProgress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            {document.status === 'analyzed' && (
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                                                    <div>
                                                        <span className="text-gray-600">페이지:</span>
                                                        <span className="font-semibold text-gray-900 ml-1">{document.metadata.pages}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">단어 수:</span>
                                                        <span className="font-semibold text-gray-900 ml-1">{document.metadata.wordCount.toLocaleString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">언어:</span>
                                                        <span className="font-semibold text-gray-900 ml-1">{document.metadata.language}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">신뢰도:</span>
                                                        <span className="font-semibold text-gray-900 ml-1">{document.metadata.confidence}%</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex space-x-2">
                                                {document.status === 'analyzed' ? (
                                                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                                        인사이트 보기
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => analyzeDocument(document.id)}
                                                        className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                                                    >
                                                        분석 시작
                                                    </button>
                                                )}
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    다운로드
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">분석 결과</h4>
                                <div className="space-y-4">
                                    {analysisResults.map(result => (
                                        <div key={result.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="font-semibold text-gray-900">분석 결과 #{result.id}</h5>
                                                <span className="text-sm text-gray-500">{result.timestamp}</span>
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                    <span className="text-gray-600">분석 유형:</span>
                                                    <span className="font-semibold text-gray-900 ml-1">{result.analysisType}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">신뢰도:</span>
                                                    <span className="font-semibold text-gray-900 ml-1">{result.confidence}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">처리 시간:</span>
                                                    <span className="font-semibold text-gray-900 ml-1">{result.processingTime}초</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">문서 ID:</span>
                                                    <span className="font-semibold text-gray-900 ml-1">{result.documentId}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded border">
                                                <pre className="text-xs text-gray-700 overflow-x-auto">
                                                    {JSON.stringify(result.result, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI 인사이트</h4>
                                <div className="space-y-4">
                                    {documents.flatMap(doc => doc.insights).map(insight => (
                                        <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getImportanceColor(insight.importance)}`}>
                                                    {insight.importance}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-gray-500">신뢰도: {insight.confidence}%</span>
                                                    <span className="text-gray-500">유형: {insight.type}</span>
                                                </div>
                                                {insight.actionable && (
                                                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                        조치하기
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'categories' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">문서 카테고리</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {documentCategories.map(category => {
                                        const Icon = category.icon;
                                        return (
                                            <div key={category.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className={`p-2 rounded-lg ${category.color === 'blue' ? 'bg-blue-100' :
                                                        category.color === 'green' ? 'bg-green-100' :
                                                            category.color === 'red' ? 'bg-red-100' :
                                                                'bg-purple-100'
                                                        }`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{category.name}</h5>
                                                        <p className="text-sm text-gray-500">{category.count}개 문서</p>
                                                    </div>
                                                </div>
                                                <button className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                                    보기
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">분석 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">자동 분석</h5>
                                            <p className="text-sm text-gray-600">업로드된 문서 자동 분석</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">고급 분석</h5>
                                            <p className="text-sm text-gray-600">심화 분석 기능 사용</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">다국어 지원</h5>
                                            <p className="text-sm text-gray-600">다양한 언어 문서 분석</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIDocumentAnalysis; 