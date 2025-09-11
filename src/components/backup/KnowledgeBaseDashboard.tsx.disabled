import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Search,
    Filter,
    Download,
    Upload,
    Trash2,
    Eye,
    Tag,
    Calendar,
    TrendingUp,
    ExternalLink,
    Plus,
    Edit3
} from 'lucide-react';
import { KnowledgeEntry, KnowledgeAnalytics } from '../services/projectKnowledgeService';
import { projectKnowledgeService } from '../services/projectKnowledgeService';

interface KnowledgeBaseDashboardProps {
    projectId: string;
    onKnowledgeAction?: (action: string, entry?: KnowledgeEntry) => void;
}

const KnowledgeBaseDashboard: React.FC<KnowledgeBaseDashboardProps> = ({
    projectId,
    onKnowledgeAction
}) => {
    const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
    const [analytics, setAnalytics] = useState<KnowledgeAnalytics | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSource, setSelectedSource] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadKnowledge();
    }, [projectId]);

    useEffect(() => {
        if (knowledge.length > 0) {
            setAnalytics(projectKnowledgeService.getKnowledgeAnalytics(projectId));
        }
    }, [knowledge, projectId]);

    const loadKnowledge = () => {
        setIsLoading(true);
        const projectKnowledge = projectKnowledgeService.getProjectKnowledge(projectId);
        setKnowledge(projectKnowledge);
        setIsLoading(false);
    };

    const filteredKnowledge = knowledge.filter(entry => {
        const matchesSearch = searchQuery === '' ||
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
        const matchesSource = selectedSource === 'all' || entry.source === selectedSource;

        return matchesSearch && matchesCategory && matchesSource;
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleDeleteEntry = (entryId: string) => {
        if (window.confirm('이 지식 엔트리를 삭제하시겠습니까?')) {
            projectKnowledgeService.deleteKnowledgeEntry(projectId, entryId);
            loadKnowledge();
            onKnowledgeAction?.('deleted');
        }
    };

    const handleExportKnowledge = () => {
        const data = projectKnowledgeService.exportKnowledge(projectId);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-base-${projectId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportKnowledge = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result as string;
                projectKnowledgeService.importKnowledge(projectId, data);
                loadKnowledge();
                onKnowledgeAction?.('imported');
            };
            reader.readAsText(file);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            technical: 'bg-blue-100 text-blue-800',
            business: 'bg-green-100 text-green-800',
            research: 'bg-purple-100 text-purple-800',
            reference: 'bg-gray-100 text-gray-800',
            tutorial: 'bg-yellow-100 text-yellow-800',
            news: 'bg-red-100 text-red-800'
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'web_search':
                return <ExternalLink className="w-4 h-4" />;
            case 'chat_extraction':
                return <BookOpen className="w-4 h-4" />;
            case 'file_upload':
                return <Upload className="w-4 h-4" />;
            default:
                return <Edit3 className="w-4 h-4" />;
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">지식베이스</h2>
                    <p className="text-gray-600">프로젝트 관련 지식과 정보를 관리합니다</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleExportKnowledge}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        내보내기
                    </button>
                    <label className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        가져오기
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportKnowledge}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {/* 통계 카드 */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center">
                            <BookOpen className="w-8 h-8 text-purple-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">총 지식</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.totalEntries}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">최근 추가</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.recentAdditions.length}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center">
                            <Eye className="w-8 h-8 text-blue-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">인기 지식</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics.mostAccessedEntries[0]?.accessCount || 0}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center">
                            <Tag className="w-8 h-8 text-orange-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">카테고리</p>
                                <p className="text-2xl font-bold text-gray-900">{Object.keys(analytics.categoryDistribution).length}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 검색 및 필터 */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="지식 검색..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">모든 카테고리</option>
                            <option value="technical">기술</option>
                            <option value="business">비즈니스</option>
                            <option value="research">연구</option>
                            <option value="reference">참고자료</option>
                            <option value="tutorial">튜토리얼</option>
                            <option value="news">뉴스</option>
                        </select>

                        <select
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">모든 소스</option>
                            <option value="web_search">웹 검색</option>
                            <option value="chat_extraction">채팅 추출</option>
                            <option value="file_upload">파일 업로드</option>
                            <option value="manual">수동 입력</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 지식 목록 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            지식 목록 ({filteredKnowledge.length})
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                            >
                                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                                    <div className="bg-current rounded-sm"></div>
                                    <div className="bg-current rounded-sm"></div>
                                    <div className="bg-current rounded-sm"></div>
                                    <div className="bg-current rounded-sm"></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                            >
                                <div className="w-4 h-4 space-y-1">
                                    <div className="bg-current rounded-sm h-0.5"></div>
                                    <div className="bg-current rounded-sm h-0.5"></div>
                                    <div className="bg-current rounded-sm h-0.5"></div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {filteredKnowledge.length === 0 ? (
                    <div className="p-8 text-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4' : 'space-y-2 p-4'}>
                        <AnimatePresence>
                            {filteredKnowledge.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${viewMode === 'list' ? 'p-4' : 'p-4'
                                        }`}
                                    onClick={() => setSelectedEntry(entry)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            {getSourceIcon(entry.source)}
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(entry.category)}`}>
                                                {entry.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteEntry(entry.id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {entry.title}
                                    </h4>

                                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                                        {entry.content}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(entry.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Eye className="w-3 h-3" />
                                            <span>{entry.accessCount}</span>
                                        </div>
                                    </div>

                                    {entry.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {entry.tags.slice(0, 3).map((tag, tagIndex) => (
                                                <span
                                                    key={tagIndex}
                                                    className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {entry.tags.length > 3 && (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                    +{entry.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* 지식 상세 모달 */}
            <AnimatePresence>
                {selectedEntry && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedEntry(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">{selectedEntry.title}</h3>
                                    <button
                                        onClick={() => setSelectedEntry(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">내용</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEntry.content}</p>
                                    </div>

                                    {selectedEntry.sourceUrl && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">출처</h4>
                                            <a
                                                href={selectedEntry.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-600 hover:text-purple-800 flex items-center"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-1" />
                                                {selectedEntry.sourceUrl}
                                            </a>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">메타데이터</h4>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p>소스: {selectedEntry.source}</p>
                                                <p>카테고리: {selectedEntry.category}</p>
                                                <p>신뢰도: {Math.round(selectedEntry.confidence * 100)}%</p>
                                                <p>생성일: {formatDate(selectedEntry.createdAt)}</p>
                                                <p>접근 횟수: {selectedEntry.accessCount}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">태그</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedEntry.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KnowledgeBaseDashboard;
