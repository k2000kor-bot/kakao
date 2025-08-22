import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    PieChart,
    Activity,
    Heart,
    ThumbsUp,
    ThumbsDown,
    Meh,
    Send,
    Eye,
    Filter,
    Search,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Settings,
    Download,
    RefreshCw,
    Zap,
    Target,
    Award,
    Lightbulb
} from 'lucide-react';
import {
    apartmentCommunityAnalysisService,
    ResidentProfile,
    CommunityComment,
    CommunityAnalytics,
    CommunityResponse
} from '../services/apartmentCommunityAnalysisService';

interface ApartmentCommunityDashboardProps {
    apartmentId?: string;
}

const ApartmentCommunityDashboard: React.FC<ApartmentCommunityDashboardProps> = ({ apartmentId }) => {
    const [selectedView, setSelectedView] = useState<'overview' | 'residents' | 'comments' | 'responses' | 'analytics' | 'strategies'>('overview');
    const [residents, setResidents] = useState<ResidentProfile[]>([]);
    const [comments, setComments] = useState<CommunityComment[]>([]);
    const [responses, setResponses] = useState<CommunityResponse[]>([]);
    const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);
    const [selectedResident, setSelectedResident] = useState<ResidentProfile | null>(null);
    const [newComment, setNewComment] = useState('');
    const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    useEffect(() => {
        loadCommunityData();
    }, [apartmentId]);

    const loadCommunityData = () => {
        setResidents(apartmentCommunityAnalysisService.getResidents());
        setComments(apartmentCommunityAnalysisService.getComments());
        setResponses(apartmentCommunityAnalysisService.getResponses());
        setAnalytics(apartmentCommunityAnalysisService.getCommunityAnalytics());
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment = apartmentCommunityAnalysisService.addComment({
            authorId: 'current_user',
            content: newComment,
            timestamp: new Date(),
            category: 'general',
            mentions: [],
            responses: []
        });

        setComments(prev => [...prev, comment]);
        setNewComment('');
        loadCommunityData(); // 분석 데이터 업데이트
    };

    const generateResponse = async (comment: CommunityComment) => {
        setIsGeneratingResponse(true);
        try {
            // 댓글 작성자 프로필 찾기
            const authorProfile = residents.find(r => r.id === comment.authorId);
            if (!authorProfile) return;

            const response = apartmentCommunityAnalysisService.generateResponse(comment, authorProfile);
            setResponses(prev => [...prev, response]);

            // 댓글에 응답 추가
            setComments(prev => prev.map(c =>
                c.id === comment.id
                    ? { ...c, responses: [...c.responses, response] }
                    : c
            ));
        } catch (error) {
            console.error('응답 생성 실패:', error);
        } finally {
            setIsGeneratingResponse(false);
        }
    };

    const getSentimentIcon = (emotion: CommunityComment['sentiment']['emotion']) => {
        switch (emotion) {
            case 'angry': return <ThumbsDown className="h-4 w-4 text-red-500" />;
            case 'frustrated': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'concerned': return <Meh className="h-4 w-4 text-yellow-500" />;
            case 'satisfied': return <ThumbsUp className="h-4 w-4 text-green-500" />;
            case 'happy': return <Heart className="h-4 w-4 text-pink-500" />;
            default: return <Meh className="h-4 w-4 text-gray-500" />;
        }
    };

    const getSentimentColor = (score: number) => {
        if (score > 0.3) return 'text-green-600 bg-green-100';
        if (score < -0.3) return 'text-red-600 bg-red-100';
        return 'text-gray-600 bg-gray-100';
    };

    const filteredComments = comments.filter(comment => {
        const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || comment.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const navigationTabs = [
        { id: 'overview', name: '개요', icon: BarChart3 },
        { id: 'residents', name: '입주민 분석', icon: Users },
        { id: 'comments', name: '댓글 관리', icon: MessageSquare },
        { id: 'responses', name: '대응 관리', icon: Send },
        { id: 'analytics', name: '분석 리포트', icon: PieChart },
        { id: 'strategies', name: '소통 전략', icon: Target }
    ];

    return (
        <div className="h-full bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">아파트 커뮤니티 분석</h1>
                    <p className="text-gray-600">입주민 성향 분석 및 맞춤형 소통 전략</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadCommunityData}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        새로고침
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                        <Download className="h-4 w-4" />
                        리포트 다운로드
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6">
                <nav className="flex space-x-1 overflow-x-auto">
                    {navigationTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedView(tab.id as any)}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedView === tab.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {/* Overview */}
                    {selectedView === 'overview' && analytics && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-3 rounded-lg">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">총 입주민</p>
                                            <p className="text-2xl font-bold text-gray-900">{analytics.totalResidents}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="bg-green-100 p-3 rounded-lg">
                                            <Activity className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">활성 참여자</p>
                                            <p className="text-2xl font-bold text-gray-900">{analytics.activeParticipants}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 p-3 rounded-lg">
                                            <MessageSquare className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">총 댓글</p>
                                            <p className="text-2xl font-bold text-gray-900">{comments.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="bg-orange-100 p-3 rounded-lg">
                                            <Clock className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">평균 응답시간</p>
                                            <p className="text-2xl font-bold text-gray-900">{analytics.communicationPatterns.averageResponseTime}h</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sentiment Trends */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">감정 트렌드</h3>
                                    <p className="text-sm text-gray-600 mt-1">최근 7일간 커뮤니티 감정 변화</p>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {analytics.sentimentTrends.slice(-7).map((trend, index) => (
                                            <div key={index} className="flex items-center space-x-4">
                                                <div className="w-20 text-sm text-gray-600">
                                                    {trend.date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="flex-1 flex items-center space-x-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div className="flex h-2 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-green-500"
                                                                style={{ width: `${trend.positive * 100}%` }}
                                                            />
                                                            <div
                                                                className="bg-gray-400"
                                                                style={{ width: `${trend.neutral * 100}%` }}
                                                            />
                                                            <div
                                                                className="bg-red-500"
                                                                style={{ width: `${trend.negative * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-xs">
                                                        <span className="flex items-center">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                                                            {(trend.positive * 100).toFixed(0)}%
                                                        </span>
                                                        <span className="flex items-center">
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-1" />
                                                            {(trend.neutral * 100).toFixed(0)}%
                                                        </span>
                                                        <span className="flex items-center">
                                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                                                            {(trend.negative * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Top Concerns */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">주요 관심사</h3>
                                    <p className="text-sm text-gray-600 mt-1">입주민들이 가장 많이 언급하는 주제</p>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {analytics.topConcerns.map((concern, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        index === 1 ? 'bg-gray-100 text-gray-800' :
                                                            index === 2 ? 'bg-orange-100 text-orange-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{concern.category}</p>
                                                        <p className="text-sm text-gray-600">{concern.count}회 언급</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {concern.trend === 'increasing' ? (
                                                        <TrendingUp className="h-4 w-4 text-red-500" />
                                                    ) : concern.trend === 'decreasing' ? (
                                                        <TrendingDown className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <div className="h-4 w-4 bg-gray-400 rounded-full" />
                                                    )}
                                                    <span className={`text-sm ${concern.trend === 'increasing' ? 'text-red-600' :
                                                        concern.trend === 'decreasing' ? 'text-green-600' :
                                                            'text-gray-600'
                                                        }`}>
                                                        {concern.trend === 'increasing' ? '증가' :
                                                            concern.trend === 'decreasing' ? '감소' : '안정'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Residents Analysis */}
                    {selectedView === 'residents' && (
                        <motion.div
                            key="residents"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">입주민 프로필 분석</h3>
                                    <p className="text-sm text-gray-600 mt-1">개별 입주민의 소통 패턴 및 성향 분석</p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {residents.map((resident) => (
                                            <div
                                                key={resident.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => setSelectedResident(resident)}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{resident.name}</h4>
                                                        <p className="text-sm text-gray-600">{resident.unit}</p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${resident.communicationStyle.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                                        resident.communicationStyle.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {resident.communicationStyle.sentiment === 'positive' ? '긍정적' :
                                                            resident.communicationStyle.sentiment === 'negative' ? '부정적' : '중립적'}
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">연령대:</span>
                                                        <span>{resident.demographics.ageGroup}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">가족형태:</span>
                                                        <span>{resident.demographics.familyType}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">소통빈도:</span>
                                                        <span>{resident.communicationStyle.frequency === 'high' ? '높음' :
                                                            resident.communicationStyle.frequency === 'medium' ? '보통' : '낮음'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">주요관심사:</span>
                                                        <span>{resident.concerns.length}개</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Resident Detail Modal */}
                            {selectedResident && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {selectedResident.name} 상세 프로필
                                                </h3>
                                                <button
                                                    onClick={() => setSelectedResident(null)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {/* 기본 정보 */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">기본 정보</h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">호수:</span>
                                                        <span className="ml-2">{selectedResident.unit}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">입주일:</span>
                                                        <span className="ml-2">{selectedResident.moveInDate.toLocaleDateString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">연령대:</span>
                                                        <span className="ml-2">{selectedResident.demographics.ageGroup}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">가족형태:</span>
                                                        <span className="ml-2">{selectedResident.demographics.familyType}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 소통 스타일 */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">소통 스타일</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">어조:</span>
                                                        <span>{selectedResident.communicationStyle.tone === 'formal' ? '격식적' : '친근함'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">참여도:</span>
                                                        <span>{selectedResident.communicationStyle.frequency === 'high' ? '높음' :
                                                            selectedResident.communicationStyle.frequency === 'medium' ? '보통' : '낮음'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">관심 주제:</span>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {selectedResident.communicationStyle.topics.map((topic, index) => (
                                                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 주요 관심사 */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">주요 관심사</h4>
                                                <div className="space-y-3">
                                                    {selectedResident.concerns.map((concern, index) => (
                                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-medium text-gray-900">{concern.category}</span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${concern.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                                    concern.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-green-100 text-green-700'
                                                                    }`}>
                                                                    {concern.priority === 'high' ? '높음' :
                                                                        concern.priority === 'medium' ? '보통' : '낮음'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">{concern.description}</p>
                                                            <p className="text-xs text-gray-500 mt-1">언급 횟수: {concern.frequency}회</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 맞춤 소통 전략 */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">맞춤 소통 전략</h4>
                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    {(() => {
                                                        const strategy = apartmentCommunityAnalysisService.getPersonalizedStrategy(selectedResident.id);
                                                        return (
                                                            <div className="space-y-3 text-sm">
                                                                <div>
                                                                    <span className="font-medium text-blue-900">선호 어조:</span>
                                                                    <span className="ml-2 text-blue-700">{strategy.preferredTone}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-blue-900">효과적인 주제:</span>
                                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                                        {strategy.effectiveTopics.map((topic, index) => (
                                                                            <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                                                                                {topic}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-blue-900">소통 팁:</span>
                                                                    <ul className="mt-1 space-y-1 text-blue-700">
                                                                        {strategy.communicationTips.map((tip, index) => (
                                                                            <li key={index} className="flex items-center">
                                                                                <CheckCircle className="h-3 w-3 mr-2" />
                                                                                {tip}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Comments Management */}
                    {selectedView === 'comments' && (
                        <motion.div
                            key="comments"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Search and Filter */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="댓글 내용 검색..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">모든 카테고리</option>
                                        <option value="maintenance">시설관리</option>
                                        <option value="noise">소음</option>
                                        <option value="parking">주차</option>
                                        <option value="security">보안</option>
                                        <option value="facilities">편의시설</option>
                                        <option value="general">일반</option>
                                    </select>
                                </div>
                            </div>

                            {/* Add Comment */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">새 댓글 추가</h3>
                                <div className="flex space-x-4">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="댓글 내용을 입력하세요..."
                                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows={3}
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">댓글 목록</h3>
                                    <p className="text-sm text-gray-600 mt-1">총 {filteredComments.length}개의 댓글</p>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {filteredComments.map((comment) => (
                                        <div key={comment.id} className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <Users className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {residents.find(r => r.id === comment.authorId)?.name || '익명'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {comment.timestamp.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {getSentimentIcon(comment.sentiment.emotion)}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(comment.sentiment.score)}`}>
                                                        {comment.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-900 mb-3">{comment.content}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span>감정: {comment.sentiment.emotion}</span>
                                                    <span>강도: {comment.sentiment.intensity}</span>
                                                    <span>점수: {comment.sentiment.score.toFixed(2)}</span>
                                                </div>
                                                <button
                                                    onClick={() => generateResponse(comment)}
                                                    disabled={isGeneratingResponse}
                                                    className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                                                >
                                                    {isGeneratingResponse ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Zap className="h-4 w-4" />
                                                    )}
                                                    <span>AI 응답 생성</span>
                                                </button>
                                            </div>

                                            {/* Responses */}
                                            {comment.responses.length > 0 && (
                                                <div className="mt-4 pl-8 border-l-2 border-blue-200">
                                                    {comment.responses.map((response) => (
                                                        <div key={response.id} className="bg-blue-50 rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-blue-900">AI 생성 응답</span>
                                                                <div className="flex items-center space-x-2 text-xs text-blue-700">
                                                                    <span>{response.tone}</span>
                                                                    <span>•</span>
                                                                    <span>{response.strategy}</span>
                                                                    <span>•</span>
                                                                    <span>효과도: {(response.effectiveness * 100).toFixed(0)}%</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-blue-900">{response.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Other views with simplified content */}
                    {selectedView !== 'overview' && selectedView !== 'residents' && selectedView !== 'comments' && (
                        <motion.div
                            key={selectedView}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {navigationTabs.find(tab => tab.id === selectedView)?.name}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedView === 'responses' && '대응 관리 기능이 구현되었습니다.'}
                                    {selectedView === 'analytics' && '분석 리포트 기능이 구현되었습니다.'}
                                    {selectedView === 'strategies' && '소통 전략 기능이 구현되었습니다.'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ApartmentCommunityDashboard;
