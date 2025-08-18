import React, { useState, useEffect } from 'react';
import unifiedAPI from '../services/unifiedAPI';

interface WritingTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
}

interface WritingRequest {
    topic: string;
    purpose: string;
    targetAudience: string;
    tone: string;
    style: string;
    length: string;
    format: string;
    requirements: string;
}

const AdvancedWritingInterface: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'history'>('templates');
    const [selectedTemplate, setSelectedTemplate] = useState<WritingTemplate | null>(null);
    const [writingRequest, setWritingRequest] = useState<WritingRequest>({
        topic: '',
        purpose: '',
        targetAudience: '',
        tone: 'professional',
        style: 'formal',
        length: 'medium',
        format: 'article',
        requirements: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [writingHistory, setWritingHistory] = useState<any[]>([]);

    const writingTemplates: WritingTemplate[] = [
        {
            id: 'business-proposal',
            name: '비즈니스 제안서',
            description: '프로젝트 제안 및 비즈니스 계획서 작성',
            category: 'business',
            icon: '📋'
        },
        {
            id: 'market-analysis',
            name: '시장 분석 보고서',
            description: '시장 동향 및 경쟁사 분석 보고서',
            category: 'analysis',
            icon: '📊'
        },
        {
            id: 'project-report',
            name: '프로젝트 진행 보고서',
            description: '프로젝트 진행 상황 및 성과 보고서',
            category: 'project',
            icon: '📈'
        },
        {
            id: 'email-template',
            name: '이메일 템플릿',
            description: '비즈니스 이메일 및 커뮤니케이션',
            category: 'communication',
            icon: '📧'
        },
        {
            id: 'presentation',
            name: '프레젠테이션 스크립트',
            description: '발표용 스크립트 및 대본 작성',
            category: 'presentation',
            icon: '🎤'
        },
        {
            id: 'contract-draft',
            name: '계약서 초안',
            description: '계약서 및 법적 문서 초안',
            category: 'legal',
            icon: '📄'
        },
        {
            id: 'newsletter',
            name: '뉴스레터',
            description: '정기 뉴스레터 및 업데이트',
            category: 'communication',
            icon: '📰'
        },
        {
            id: 'technical-doc',
            name: '기술 문서',
            description: '기술 명세서 및 사용자 매뉴얼',
            category: 'technical',
            icon: '🔧'
        }
    ];

    const toneOptions = [
        { value: 'professional', label: '전문적' },
        { value: 'friendly', label: '친근한' },
        { value: 'formal', label: '공식적' },
        { value: 'casual', label: '일상적' },
        { value: 'persuasive', label: '설득적' },
        { value: 'analytical', label: '분석적' }
    ];

    const styleOptions = [
        { value: 'formal', label: '공식적' },
        { value: 'casual', label: '일상적' },
        { value: 'professional', label: '전문적' },
        { value: 'creative', label: '창의적' },
        { value: 'academic', label: '학술적' }
    ];

    const lengthOptions = [
        { value: 'short', label: '짧음 (200-500자)' },
        { value: 'medium', label: '보통 (500-1000자)' },
        { value: 'long', label: '길음 (1000-2000자)' },
        { value: 'very-long', label: '매우 길음 (2000자 이상)' }
    ];

    const formatOptions = [
        { value: 'article', label: '기사형' },
        { value: 'report', label: '보고서형' },
        { value: 'email', label: '이메일형' },
        { value: 'proposal', label: '제안서형' },
        { value: 'presentation', label: '프레젠테이션형' }
    ];

    const handleTemplateSelect = (template: WritingTemplate) => {
        setSelectedTemplate(template);
        setActiveTab('custom');

        // 템플릿에 따른 기본값 설정
        const defaultValues = {
            'business-proposal': {
                purpose: '비즈니스 제안 및 계획 제시',
                targetAudience: '투자자 및 의사결정자',
                tone: 'professional',
                style: 'formal',
                format: 'proposal'
            },
            'market-analysis': {
                purpose: '시장 동향 분석 및 인사이트 제공',
                targetAudience: '경영진 및 마케팅팀',
                tone: 'analytical',
                style: 'professional',
                format: 'report'
            },
            'project-report': {
                purpose: '프로젝트 진행 상황 및 성과 보고',
                targetAudience: '프로젝트 관리자 및 이해관계자',
                tone: 'professional',
                style: 'formal',
                format: 'report'
            },
            'email-template': {
                purpose: '비즈니스 커뮤니케이션',
                targetAudience: '고객 및 파트너',
                tone: 'friendly',
                style: 'professional',
                format: 'email'
            }
        };

        const defaults = defaultValues[template.id as keyof typeof defaultValues];
        if (defaults) {
            setWritingRequest(prev => ({
                ...prev,
                ...defaults
            }));
        }
    };

    const handleGenerateContent = async () => {
        if (!writingRequest.topic.trim()) {
            alert('주제를 입력해주세요.');
            return;
        }

        setIsGenerating(true);
        try {
            const request = {
                prompt: `주제: ${writingRequest.topic}
목적: ${writingRequest.purpose}
대상 독자: ${writingRequest.targetAudience}
톤: ${writingRequest.tone}
스타일: ${writingRequest.style}
길이: ${writingRequest.length}
형식: ${writingRequest.format}
추가 요구사항: ${writingRequest.requirements}`,
                style: writingRequest.style as any,
                context: {
                    writing_type: selectedTemplate?.id || 'custom',
                    tone: writingRequest.tone,
                    length: writingRequest.length,
                    format: writingRequest.format
                }
            };

            const result = await unifiedAPI.writingGeneration(request);

            if (result.success && result.writing_generation) {
                const writingResult = result.writing_generation;
                setGeneratedContent(writingResult.content || '글쓰기가 완료되었습니다.');

                // 히스토리에 추가
                const historyItem = {
                    id: Date.now().toString(),
                    template: selectedTemplate?.name || '커스텀',
                    topic: writingRequest.topic,
                    content: writingResult.content || '글쓰기가 완료되었습니다.',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        style: writingResult.style,
                        word_count: writingResult.word_count,
                        confidence: writingResult.confidence,
                        suggestions: writingResult.suggestions
                    }
                };

                setWritingHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 최근 10개만 유지
            } else {
                alert('글쓰기 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('글쓰기 생성 오류:', error);
            alert('글쓰기 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        alert('클립보드에 복사되었습니다.');
    };

    const handleDownload = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-200 p-4">
                <h1 className="text-2xl font-bold text-gray-900">✍️ 고급 글쓰기 시스템</h1>
                <p className="text-gray-600 mt-1">AI 기반 전문 글쓰기 도구</p>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex space-x-8 px-4">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'templates'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        📋 템플릿
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'custom'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        ✏️ 커스텀 작성
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        📚 작성 히스토리
                    </button>
                </div>
            </div>

            <div className="p-6">
                {/* 템플릿 선택 탭 */}
                {activeTab === 'templates' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">글쓰기 템플릿 선택</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {writingTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template)}
                                    className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="text-3xl mb-3">{template.icon}</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">{template.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                        {template.category}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 커스텀 작성 탭 */}
                {activeTab === 'custom' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 입력 폼 */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {selectedTemplate ? `${selectedTemplate.name} 작성` : '커스텀 글쓰기'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        주제/제목 *
                                    </label>
                                    <input
                                        type="text"
                                        value={writingRequest.topic}
                                        onChange={(e) => setWritingRequest(prev => ({ ...prev, topic: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="글의 주제나 제목을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        목적/취지
                                    </label>
                                    <input
                                        type="text"
                                        value={writingRequest.purpose}
                                        onChange={(e) => setWritingRequest(prev => ({ ...prev, purpose: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="글을 작성하는 목적을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        대상 독자
                                    </label>
                                    <input
                                        type="text"
                                        value={writingRequest.targetAudience}
                                        onChange={(e) => setWritingRequest(prev => ({ ...prev, targetAudience: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="대상 독자를 입력하세요"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            톤/어조
                                        </label>
                                        <select
                                            value={writingRequest.tone}
                                            onChange={(e) => setWritingRequest(prev => ({ ...prev, tone: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {toneOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            스타일
                                        </label>
                                        <select
                                            value={writingRequest.style}
                                            onChange={(e) => setWritingRequest(prev => ({ ...prev, style: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {styleOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            길이
                                        </label>
                                        <select
                                            value={writingRequest.length}
                                            onChange={(e) => setWritingRequest(prev => ({ ...prev, length: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {lengthOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            형식
                                        </label>
                                        <select
                                            value={writingRequest.format}
                                            onChange={(e) => setWritingRequest(prev => ({ ...prev, format: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {formatOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        추가 요구사항
                                    </label>
                                    <textarea
                                        value={writingRequest.requirements}
                                        onChange={(e) => setWritingRequest(prev => ({ ...prev, requirements: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="특별한 요구사항이나 참고사항을 입력하세요"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerateContent}
                                    disabled={isGenerating || !writingRequest.topic.trim()}
                                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isGenerating ? '생성 중...' : '글쓰기 생성'}
                                </button>
                            </div>
                        </div>

                        {/* 결과 표시 */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">생성된 내용</h2>
                                {generatedContent && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleCopyToClipboard(generatedContent)}
                                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            복사
                                        </button>
                                        <button
                                            onClick={() => handleDownload(generatedContent, writingRequest.topic)}
                                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            다운로드
                                        </button>
                                    </div>
                                )}
                            </div>

                            {generatedContent ? (
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                        {generatedContent}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-8 rounded-md text-center text-gray-500">
                                    <div className="text-4xl mb-2">✍️</div>
                                    <p>왼쪽에서 글쓰기 요구사항을 입력하고 생성 버튼을 클릭하세요.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 히스토리 탭 */}
                {activeTab === 'history' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">작성 히스토리</h2>
                        {writingHistory.length > 0 ? (
                            <div className="space-y-4">
                                {writingHistory.map((item) => (
                                    <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{item.topic}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {item.template} • {new Date(item.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleCopyToClipboard(item.content)}
                                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                                >
                                                    복사
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(item.content, item.topic)}
                                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                                >
                                                    다운로드
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 line-clamp-3">
                                            {item.content.substring(0, 200)}...
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
                                <div className="text-4xl mb-2">📚</div>
                                <p>아직 작성된 글이 없습니다.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedWritingInterface;
