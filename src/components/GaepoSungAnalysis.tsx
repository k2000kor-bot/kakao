import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface MediaFile {
    file_id: string;
    filename: string;
    file_type: string;
    file_size: number;
    upload_time: string;
    metadata: any;
}

interface AnalysisResult {
    analysis_id: string;
    timestamp: string;
    analysis_type: string;
    content: any;
    confidence_score: number;
    source_files: string[];
    metadata: any;
}

interface SystemInfo {
    total_files: number;
    total_size: number;
    file_types: Record<string, { count: number; size: number }>;
    system_running: boolean;
    queue_size: number;
    timestamp: string;
}

const GaepoSungAnalysis: React.FC = () => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('files');
    const [analysisType, setAnalysisType] = useState('comprehensive');
    const [useAdvancedAI, setUseAdvancedAI] = useState(false);
    const [useIntelligentAnalysis, setUseIntelligentAnalysis] = useState(false);
    const [useWebResearch, setUseWebResearch] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [conversationHistory, setConversationHistory] = useState<any[]>([]);

    const API_BASE_URL = 'http://localhost:5001/api';

    // 파일 목록 조회
    const fetchFiles = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/files`);
            if (response.data.success) {
                setFiles(response.data.files);
            }
        } catch (error) {
            console.error('파일 목록 조회 실패:', error);
        }
    }, []);

    // 시스템 정보 조회
    const fetchSystemInfo = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/system/info`);
            if (response.data.success) {
                setSystemInfo(response.data.system_info);
            }
        } catch (error) {
            console.error('시스템 정보 조회 실패:', error);
        }
    }, []);

    // 파일 업로드
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                const formData = new FormData();
                formData.append('file', file);

                const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            ((progressEvent.loaded * 100) / (progressEvent.total || 100)) * (i + 1) / fileList.length
                        );
                        setUploadProgress(progress);
                    },
                });

                if (response.data.success) {
                    console.log(`파일 업로드 성공: ${file.name}`);
                }
            }

            // 파일 목록 새로고침
            await fetchFiles();
            await fetchSystemInfo();
        } catch (error) {
            console.error('파일 업로드 실패:', error);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // 종합 분석 시작
    const startComprehensiveAnalysis = async () => {
        if (selectedFiles.length === 0) {
            alert('분석할 파일을 선택해주세요.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/analysis/comprehensive`, {
                file_ids: selectedFiles,
            });

            if (response.data.success) {
                alert('종합 분석이 시작되었습니다.');
                setActiveTab('results');
            }
        } catch (error) {
            console.error('분석 시작 실패:', error);
            alert('분석 시작에 실패했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 빠른 분석
    const startQuickAnalysis = async () => {
        if (selectedFiles.length === 0) {
            alert('분석할 파일을 선택해주세요.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/analysis/quick`, {
                file_ids: selectedFiles,
                analysis_type: analysisType,
            });

            if (response.data.success) {
                const newResult: AnalysisResult = {
                    analysis_id: `quick_${Date.now()}`,
                    timestamp: response.data.timestamp,
                    analysis_type: response.data.analysis_type,
                    content: response.data.result,
                    confidence_score: 0.9,
                    source_files: selectedFiles,
                    metadata: {},
                };

                setAnalysisResults(prev => [newResult, ...prev]);
                setActiveTab('results');
            }
        } catch (error) {
            console.error('빠른 분석 실패:', error);
            alert('빠른 분석에 실패했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 고도화된 AI 분석
    const startAdvancedAIAnalysis = async () => {
        if (!userInput.trim()) {
            alert('질문을 입력해주세요.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/analysis/advanced-ai`, {
                user_input: userInput,
                project_id: 'gaeposung_project',
                user_id: 'default_user',
                analysis_depth: 'advanced',
                conversation_history: conversationHistory,
                uploaded_files: files.map(f => ({
                    file_id: f.file_id,
                    filename: f.filename,
                    type: f.file_type
                })),
                user_preferences: {
                    preferred_analysis_type: analysisType,
                    detail_level: 'high'
                },
                current_focus: 'redevelopment_analysis'
            });

            if (response.data.success) {
                const newResult: AnalysisResult = {
                    analysis_id: `advanced_ai_${Date.now()}`,
                    timestamp: response.data.timestamp,
                    analysis_type: 'advanced_ai',
                    content: response.data.response,
                    confidence_score: response.data.response.confidence_level,
                    source_files: selectedFiles,
                    metadata: {
                        user_input: userInput,
                        sources: response.data.response.sources
                    },
                };

                setAnalysisResults(prev => [newResult, ...prev]);
                setConversationHistory(prev => [...prev, {
                    user_input: userInput,
                    response: response.data.response,
                    timestamp: response.data.timestamp
                }]);
                setActiveTab('results');
                setUserInput('');
            }
        } catch (error) {
            console.error('고도화된 AI 분석 실패:', error);
            alert('고도화된 AI 분석에 실패했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 지능형 질문 분석
    const startIntelligentQuestionAnalysis = async () => {
        if (!userInput.trim()) {
            alert('질문을 입력해주세요.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/analysis/intelligent-question`, {
                question: userInput,
                context: {
                    project_id: 'gaeposung_project',
                    user_id: 'default_user',
                    conversation_history: conversationHistory,
                    uploaded_files: files.map(f => ({
                        file_id: f.file_id,
                        filename: f.filename,
                        type: f.file_type
                    }))
                }
            });

            if (response.data.success) {
                const newResult: AnalysisResult = {
                    analysis_id: `intelligent_question_${Date.now()}`,
                    timestamp: response.data.timestamp,
                    analysis_type: 'intelligent_question',
                    content: response.data.result,
                    confidence_score: response.data.result.confidence_score,
                    source_files: selectedFiles,
                    metadata: {
                        user_input: userInput,
                        question_context: response.data.result
                    },
                };

                setAnalysisResults(prev => [newResult, ...prev]);
                setConversationHistory(prev => [...prev, {
                    user_input: userInput,
                    response: response.data.result,
                    timestamp: response.data.timestamp
                }]);
                setActiveTab('results');
                setUserInput('');
            }
        } catch (error) {
            console.error('지능형 질문 분석 실패:', error);
            alert('지능형 질문 분석에 실패했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 웹 연구 기반 고도화된 분석
    const startWebResearchAnalysis = async () => {
        if (!userInput.trim()) {
            alert('질문을 입력해주세요.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/analysis/web-research`, {
                question: userInput,
                context: {
                    project_id: 'gaeposung_project',
                    user_id: 'default_user',
                    conversation_history: conversationHistory,
                    uploaded_files: files.map(f => ({
                        file_id: f.file_id,
                        filename: f.filename,
                        type: f.file_type
                    }))
                }
            });

            if (response.data.success) {
                const newResult: AnalysisResult = {
                    analysis_id: `web_research_${Date.now()}`,
                    timestamp: response.data.timestamp,
                    analysis_type: 'web_research',
                    content: response.data.result,
                    confidence_score: response.data.result.confidence_score,
                    source_files: selectedFiles,
                    metadata: {
                        user_input: userInput,
                        research_context: response.data.result
                    },
                };

                setAnalysisResults(prev => [newResult, ...prev]);
                setConversationHistory(prev => [...prev, {
                    user_input: userInput,
                    response: response.data.result,
                    timestamp: response.data.timestamp
                }]);
                setActiveTab('results');
                setUserInput('');
            }
        } catch (error) {
            console.error('웹 연구 분석 실패:', error);
            alert('웹 연구 분석에 실패했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 파일 선택 토글
    const toggleFileSelection = (fileId: string) => {
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    // 파일 삭제
    const deleteFile = async (fileId: string) => {
        if (!window.confirm('파일을 삭제하시겠습니까?')) return;

        try {
            const response = await axios.delete(`${API_BASE_URL}/files/${fileId}`);
            if (response.data.success) {
                await fetchFiles();
                await fetchSystemInfo();
                setSelectedFiles(prev => prev.filter(id => id !== fileId));
            }
        } catch (error) {
            console.error('파일 삭제 실패:', error);
        }
    };

    // 파일 크기 포맷팅
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 파일 타입별 아이콘
    const getFileIcon = (fileType: string) => {
        const iconMap: Record<string, string> = {
            pdf: '📄',
            word: '📝',
            excel: '📊',
            powerpoint: '📈',
            image: '🖼️',
            text: '📄',
            csv: '📊',
            json: '📋',
            unknown: '📁',
        };
        return iconMap[fileType] || '📁';
    };

    // 분석 타입별 라벨
    const getAnalysisTypeLabel = (type: string) => {
        const labelMap: Record<string, string> = {
            comprehensive: '종합 분석',
            researcher: '연구자 관점',
            policy: '정책분석가 관점',
            public_opinion: '여론분석가 관점',
            real_estate: '부동산 전문가 관점',
            sociological: '사회학적 관점',
            advanced_ai: '🤖 고도화된 AI 분석',
        };
        return labelMap[type] || type;
    };

    useEffect(() => {
        fetchFiles();
        fetchSystemInfo();
    }, [fetchFiles, fetchSystemInfo]);

    return (
        <div className="gaeposung-analysis">
            <div className="analysis-header">
                <h1>개포우성 재개발 프로젝트 고도화된 분석 시스템</h1>
                <p>다층적 분석 프레임워크를 통한 종합적 프로젝트 분석</p>
            </div>

            {/* 시스템 상태 */}
            {systemInfo && (
                <div className="system-status">
                    <div className="status-card">
                        <h3>시스템 상태</h3>
                        <div className="status-grid">
                            <div className="status-item">
                                <span className="label">총 파일 수:</span>
                                <span className="value">{systemInfo.total_files}</span>
                            </div>
                            <div className="status-item">
                                <span className="label">총 용량:</span>
                                <span className="value">{formatFileSize(systemInfo.total_size)}</span>
                            </div>
                            <div className="status-item">
                                <span className="label">분석 큐:</span>
                                <span className="value">{systemInfo.queue_size}</span>
                            </div>
                            <div className="status-item">
                                <span className="label">시스템 상태:</span>
                                <span className={`value ${systemInfo.system_running ? 'running' : 'stopped'}`}>
                                    {systemInfo.system_running ? '실행 중' : '중지됨'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 탭 네비게이션 */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
                    onClick={() => setActiveTab('files')}
                >
                    📁 파일 관리
                </button>
                <button
                    className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    🔍 분석 실행
                </button>
                <button
                    className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
                    onClick={() => setActiveTab('results')}
                >
                    📊 분석 결과
                </button>
            </div>

            {/* 파일 관리 탭 */}
            {activeTab === 'files' && (
                <div className="tab-content">
                    <div className="upload-section">
                        <h3>파일 업로드</h3>
                        <div className="upload-area">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.csv,.json"
                                disabled={isUploading}
                            />
                            {isUploading && (
                                <div className="upload-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <span>{uploadProgress}%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="files-section">
                        <h3>업로드된 파일 ({files.length})</h3>
                        <div className="files-grid">
                            {files.map((file) => (
                                <div
                                    key={file.file_id}
                                    className={`file-card ${selectedFiles.includes(file.file_id) ? 'selected' : ''}`}
                                    onClick={() => toggleFileSelection(file.file_id)}
                                >
                                    <div className="file-icon">{getFileIcon(file.file_type)}</div>
                                    <div className="file-info">
                                        <div className="file-name">{file.filename}</div>
                                        <div className="file-details">
                                            <span>{file.file_type.toUpperCase()}</span>
                                            <span>{formatFileSize(file.file_size)}</span>
                                        </div>
                                        <div className="file-time">
                                            {new Date(file.upload_time).toLocaleString()}
                                        </div>
                                    </div>
                                    <button
                                        className="delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteFile(file.file_id);
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 분석 실행 탭 */}
            {activeTab === 'analysis' && (
                <div className="tab-content">
                    <div className="analysis-controls">
                        <h3>분석 설정</h3>

                        <div className="analysis-mode-selector">
                            <label>분석 모드:</label>
                            <div className="mode-buttons">
                                <button
                                    className={`mode-button ${!useAdvancedAI && !useIntelligentAnalysis && !useWebResearch ? 'active' : ''}`}
                                    onClick={() => {
                                        setUseAdvancedAI(false);
                                        setUseIntelligentAnalysis(false);
                                        setUseWebResearch(false);
                                    }}
                                >
                                    📊 전통적 분석
                                </button>
                                <button
                                    className={`mode-button ${useAdvancedAI && !useIntelligentAnalysis && !useWebResearch ? 'active' : ''}`}
                                    onClick={() => {
                                        setUseAdvancedAI(true);
                                        setUseIntelligentAnalysis(false);
                                        setUseWebResearch(false);
                                    }}
                                >
                                    🤖 고도화된 AI 분석
                                </button>
                                <button
                                    className={`mode-button ${useIntelligentAnalysis && !useWebResearch ? 'active' : ''}`}
                                    onClick={() => {
                                        setUseAdvancedAI(false);
                                        setUseIntelligentAnalysis(true);
                                        setUseWebResearch(false);
                                    }}
                                >
                                    🧠 지능형 질문 분석
                                </button>
                                <button
                                    className={`mode-button ${useWebResearch ? 'active' : ''}`}
                                    onClick={() => {
                                        setUseAdvancedAI(false);
                                        setUseIntelligentAnalysis(false);
                                        setUseWebResearch(true);
                                    }}
                                >
                                    🔍 웹 연구 기반 분석
                                </button>
                            </div>
                        </div>

                        {!useAdvancedAI ? (
                            <>
                                <div className="analysis-type-selector">
                                    <label>분석 타입:</label>
                                    <select
                                        value={analysisType}
                                        onChange={(e) => setAnalysisType(e.target.value)}
                                    >
                                        <option value="comprehensive">종합 분석</option>
                                        <option value="researcher">연구자 관점</option>
                                        <option value="policy">정책분석가 관점</option>
                                        <option value="public_opinion">여론분석가 관점</option>
                                        <option value="real_estate">부동산 전문가 관점</option>
                                        <option value="sociological">사회학적 관점</option>
                                    </select>
                                </div>

                                <div className="selected-files">
                                    <h4>선택된 파일 ({selectedFiles.length})</h4>
                                    {selectedFiles.length > 0 ? (
                                        <div className="selected-files-list">
                                            {files
                                                .filter(file => selectedFiles.includes(file.file_id))
                                                .map(file => (
                                                    <div key={file.file_id} className="selected-file">
                                                        {getFileIcon(file.file_type)} {file.filename}
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p>분석할 파일을 선택해주세요.</p>
                                    )}
                                </div>

                                <div className="analysis-actions">
                                    <button
                                        className="analysis-button comprehensive"
                                        onClick={startComprehensiveAnalysis}
                                        disabled={selectedFiles.length === 0 || isAnalyzing}
                                    >
                                        {isAnalyzing ? '분석 중...' : '종합 분석 시작'}
                                    </button>

                                    <button
                                        className="analysis-button quick"
                                        onClick={startQuickAnalysis}
                                        disabled={selectedFiles.length === 0 || isAnalyzing}
                                    >
                                        {isAnalyzing ? '분석 중...' : '빠른 분석'}
                                    </button>
                                </div>
                            </>
                        ) : useIntelligentAnalysis ? (
                            <>
                                <div className="intelligent-analysis-interface">
                                    <h4>🧠 최상급 지능형 질문 분석</h4>
                                    <p className="intelligent-description">
                                        최상급 성능의 지능형 분석으로 질문의 모든 요구사항을 파악하고 똑똑한 답변을 제공합니다.
                                    </p>

                                    <div className="chat-input-section">
                                        <textarea
                                            className="intelligent-chat-input"
                                            placeholder="예: 개포우성 재개발 프로젝트의 투자 가치를 분석해주세요. 주민들의 반응도 함께 고려해서 종합적으로 평가해주시면 감사하겠습니다. 또한 정책적 관점에서의 리스크 요소와 해결 방안도 제시해주세요."
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            rows={4}
                                        />
                                        <button
                                            className="intelligent-analysis-button"
                                            onClick={startIntelligentQuestionAnalysis}
                                            disabled={!userInput.trim() || isAnalyzing}
                                        >
                                            {isAnalyzing ? '🧠 지능형 분석 중...' : '🧠 지능형 분석 시작'}
                                        </button>
                                    </div>

                                    <div className="intelligent-features">
                                        <h5>🚀 최상급 기능:</h5>
                                        <ul>
                                            <li>🎯 <strong>다중 요구사항 자동 파악:</strong> 질문에서 모든 요구사항을 자동으로 식별</li>
                                            <li>🔍 <strong>전체 글 맥락 이해:</strong> 질문의 숨겨진 의미와 맥락을 완전히 이해</li>
                                            <li>🧠 <strong>지능적 추론:</strong> 논리적 추론을 통한 깊이 있는 분석</li>
                                            <li>💡 <strong>실행 가능한 인사이트:</strong> 구체적이고 실행 가능한 제언 제공</li>
                                            <li>📊 <strong>다중 관점 종합 분석:</strong> 5개 전문 관점에서의 균형잡힌 분석</li>
                                            <li>⚠️ <strong>리스크 평가:</strong> 위험 요소 식별 및 대응 방안 제시</li>
                                            <li>🔄 <strong>추론 과정 설명:</strong> 분석 과정을 투명하게 제시</li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        ) : useWebResearch ? (
                            <>
                                <div className="web-research-interface">
                                    <h4>🔍 웹 연구 기반 고도화된 분석</h4>
                                    <p className="web-research-description">
                                        웹 검색을 통한 실시간 정보 수집과 논리적 반박 능력을 갖춘 최상급 문제 해결 시스템입니다.
                                    </p>

                                    <div className="chat-input-section">
                                        <textarea
                                            className="web-research-chat-input"
                                            placeholder="예: 개포우성 재개발 프로젝트의 현재 진행 상황과 향후 전망을 웹 검색을 통해 확인하고, 논리적으로 분석해주세요. 또한 가능한 반박 논리도 함께 제시해주세요."
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            rows={4}
                                        />
                                        <button
                                            className="web-research-analysis-button"
                                            onClick={startWebResearchAnalysis}
                                            disabled={!userInput.trim() || isAnalyzing}
                                        >
                                            {isAnalyzing ? '🔍 웹 연구 분석 중...' : '🔍 웹 연구 분석 시작'}
                                        </button>
                                    </div>

                                    <div className="web-research-features">
                                        <h5>🚀 고도화된 기능:</h5>
                                        <ul>
                                            <li>🌐 <strong>실시간 웹 검색:</strong> Google, Naver, Daum 등 다중 검색 엔진 활용</li>
                                            <li>📚 <strong>정보 검증 시스템:</strong> 출처 신뢰도 평가 및 정보 일관성 검사</li>
                                            <li>🧠 <strong>논리적 반박 생성:</strong> 논리적 오류 탐지 및 반박 논리 구성</li>
                                            <li>⚖️ <strong>법규 적용성 검토:</strong> 관련 법령 및 규제 환경 분석</li>
                                            <li>📊 <strong>방법론 평가:</strong> 연구 방법의 타당성 및 신뢰도 평가</li>
                                            <li>💡 <strong>실행 권장사항:</strong> 구체적이고 실행 가능한 제언 제공</li>
                                            <li>🔄 <strong>지속적 학습:</strong> 피드백을 통한 시스템 성능 향상</li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="advanced-ai-interface">
                                    <h4>🤖 CORBU.AI 고도화된 AI 분석</h4>
                                    <p className="ai-description">
                                        자연어로 질문하시면 개포우성 재개발 프로젝트에 대한 깊이 있는 분석을 제공합니다.
                                    </p>

                                    <div className="chat-input-section">
                                        <textarea
                                            className="ai-chat-input"
                                            placeholder="예: 개포우성 재개발 프로젝트의 투자 가치는 어떻게 되나요? 주민들의 반응은 어떤가요? 재개발 사업의 리스크 요소는 무엇인가요?"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            rows={4}
                                        />
                                        <button
                                            className="ai-analysis-button"
                                            onClick={startAdvancedAIAnalysis}
                                            disabled={!userInput.trim() || isAnalyzing}
                                        >
                                            {isAnalyzing ? '🤖 AI 분석 중...' : '🤖 AI 분석 시작'}
                                        </button>
                                    </div>

                                    <div className="ai-features">
                                        <h5>✨ AI 분석 특징:</h5>
                                        <ul>
                                            <li>🔍 <strong>깊은 이해:</strong> 질문의 맥락과 의도를 정확히 파악</li>
                                            <li>📚 <strong>지식베이스:</strong> 개포우성 특화 전문 지식 활용</li>
                                            <li>🔄 <strong>대화 연속성:</strong> 이전 대화 내용을 기억하고 연결</li>
                                            <li>💡 <strong>지능형 제안:</strong> 관련 질문과 다음 단계 제안</li>
                                            <li>📊 <strong>다층적 분석:</strong> 5개 전문 관점에서 종합 분석</li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* 분석 결과 탭 */}
            {activeTab === 'results' && (
                <div className="tab-content">
                    <div className="results-section">
                        <h3>분석 결과 ({analysisResults.length})</h3>

                        {analysisResults.length === 0 ? (
                            <p>아직 분석 결과가 없습니다.</p>
                        ) : (
                            <div className="results-list">
                                {analysisResults.map((result) => (
                                    <div key={result.analysis_id} className="result-card">
                                        <div className="result-header">
                                            <h4>{getAnalysisTypeLabel(result.analysis_type)}</h4>
                                            <div className="result-meta">
                                                <span className="timestamp">
                                                    {new Date(result.timestamp).toLocaleString()}
                                                </span>
                                                <span className="confidence">
                                                    신뢰도: {(result.confidence_score * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="result-content">
                                            {result.analysis_type === 'intelligent_question' ? (
                                                <div className="intelligent-question-result">
                                                    <div className="direct-answer">
                                                        <h5>💬 직접 답변</h5>
                                                        <p>{result.content.direct_answer}</p>
                                                    </div>

                                                    <div className="comprehensive-analysis">
                                                        <h5>📊 종합 분석</h5>
                                                        <div className="analysis-content">
                                                            <pre>{result.content.comprehensive_analysis}</pre>
                                                        </div>
                                                    </div>

                                                    <div className="multiple-perspectives">
                                                        <h5>🔍 다중 관점 분석</h5>
                                                        {result.content.multiple_perspectives?.map((perspective: any, index: number) => (
                                                            <div key={index} className="perspective-item">
                                                                <h6><strong>{perspective.perspective}</strong></h6>
                                                                <p>{perspective.analysis}</p>
                                                                <small>중점: {perspective.focus}</small>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="actionable-insights">
                                                        <h5>💡 실행 가능한 인사이트</h5>
                                                        <ul>
                                                            {result.content.actionable_insights?.map((insight: string, index: number) => (
                                                                <li key={index}>{insight}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="related-questions">
                                                        <h5>❓ 관련 질문</h5>
                                                        <ul>
                                                            {result.content.related_questions?.map((question: string, index: number) => (
                                                                <li key={index} className="related-question">
                                                                    {question}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="reasoning-process">
                                                        <h5>🧠 추론 과정</h5>
                                                        <div className="reasoning-content">
                                                            <pre>{result.content.reasoning_process}</pre>
                                                        </div>
                                                    </div>

                                                    <div className="sources-evidence">
                                                        <h5>📚 근거 및 출처</h5>
                                                        <ul>
                                                            {result.content.sources_and_evidence?.map((source: string, index: number) => (
                                                                <li key={index}>{source}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="next-steps">
                                                        <h5>🚀 다음 단계</h5>
                                                        <ul>
                                                            {result.content.next_steps?.map((step: string, index: number) => (
                                                                <li key={index}>{step}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="risk-assessment">
                                                        <h5>⚠️ 리스크 평가</h5>
                                                        <div className="risk-categories">
                                                            <div className="risk-category high">
                                                                <h6>🔴 고위험 요소</h6>
                                                                <ul>
                                                                    {result.content.risk_assessment?.high_risks?.map((risk: string, index: number) => (
                                                                        <li key={index}>{risk}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="risk-category medium">
                                                                <h6>🟡 중위험 요소</h6>
                                                                <ul>
                                                                    {result.content.risk_assessment?.medium_risks?.map((risk: string, index: number) => (
                                                                        <li key={index}>{risk}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="risk-category low">
                                                                <h6>🟢 저위험 요소</h6>
                                                                <ul>
                                                                    {result.content.risk_assessment?.low_risks?.map((risk: string, index: number) => (
                                                                        <li key={index}>{risk}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="risk-category mitigation">
                                                                <h6>🛡️ 대응 전략</h6>
                                                                <ul>
                                                                    {result.content.risk_assessment?.mitigation_strategies?.map((strategy: string, index: number) => (
                                                                        <li key={index}>{strategy}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : result.analysis_type === 'web_research' ? (
                                                <div className="web-research-result">
                                                    <div className="research-overview">
                                                        <h5>🔍 연구 개요</h5>
                                                        <p><strong>원본 질문:</strong> {result.content.original_question}</p>
                                                        <p><strong>신뢰도 점수:</strong> {(result.content.confidence_score * 100).toFixed(1)}%</p>
                                                    </div>

                                                    <div className="research-sources">
                                                        <h5>📚 연구 소스 ({result.content.research_results.sources.length}개)</h5>
                                                        <div className="sources-grid">
                                                            {result.content.research_results.sources.map((source: any, index: number) => (
                                                                <div key={index} className="source-item">
                                                                    <div className="source-header">
                                                                        <span className="source-type">{source.source_type}</span>
                                                                        <span className="credibility-score">신뢰도: {(source.credibility_score * 100).toFixed(0)}%</span>
                                                                    </div>
                                                                    <h6>{source.title}</h6>
                                                                    <p className="source-domain">{source.domain}</p>
                                                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                                                                        원본 링크
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="key-findings">
                                                        <h5>🔍 주요 발견사항</h5>
                                                        <ul>
                                                            {result.content.research_results.key_findings.map((finding: string, index: number) => (
                                                                <li key={index}>{finding}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="consensus-points">
                                                        <h5>✅ 합의점</h5>
                                                        <ul>
                                                            {result.content.research_results.consensus_points.map((point: string, index: number) => (
                                                                <li key={index}>{point}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="logical-refutations">
                                                        <h5>🧠 논리적 반박</h5>
                                                        {result.content.logical_refutations.map((refutation: any, index: number) => (
                                                            <div key={index} className="refutation-item">
                                                                <div className="refutation-header">
                                                                    <h6>반박 유형: {refutation.refutation_type}</h6>
                                                                    <span className="refutation-strength">{refutation.refutation_strength}</span>
                                                                </div>
                                                                <p><strong>주장:</strong> {refutation.claim}</p>
                                                                <div className="evidence">
                                                                    <strong>근거:</strong>
                                                                    <ul>
                                                                        {refutation.evidence.map((evidence: string, idx: number) => (
                                                                            <li key={idx}>{evidence}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                                <div className="counter-arguments">
                                                                    <strong>반박 논리:</strong>
                                                                    <ul>
                                                                        {refutation.counter_arguments.map((arg: string, idx: number) => (
                                                                            <li key={idx}>{arg}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="methodology-assessment">
                                                        <h5>📊 방법론 평가</h5>
                                                        <div className="methodology-grid">
                                                            <div className="methodology-item">
                                                                <strong>샘플 크기:</strong> {result.content.methodology_assessment.sample_size}
                                                            </div>
                                                            <div className="methodology-item">
                                                                <strong>소스 다양성:</strong> {result.content.methodology_assessment.source_diversity}
                                                            </div>
                                                            <div className="methodology-item">
                                                                <strong>방법론 강도:</strong> {result.content.methodology_assessment.methodology_strength}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="conclusion">
                                                        <h5>📝 결론</h5>
                                                        <div className="conclusion-content">
                                                            <pre>{result.content.conclusion}</pre>
                                                        </div>
                                                    </div>

                                                    <div className="recommendations">
                                                        <h5>💡 권장사항</h5>
                                                        <ul>
                                                            {result.content.recommendations.map((rec: string, index: number) => (
                                                                <li key={index}>{rec}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ) : result.analysis_type === 'advanced_ai' ? (
                                                <div className="advanced-ai-result">
                                                    <div className="direct-answer">
                                                        <h5>💬 직접 답변</h5>
                                                        <p>{result.content.direct_answer}</p>
                                                    </div>

                                                    <div className="contextual-explanation">
                                                        <h5>🔍 맥락적 설명</h5>
                                                        <p>{result.content.contextual_explanation}</p>
                                                    </div>

                                                    <div className="related-insights">
                                                        <h5>💡 관련 인사이트</h5>
                                                        <ul>
                                                            {result.content.related_insights?.map((insight: string, index: number) => (
                                                                <li key={index}>{insight}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="follow-up-questions">
                                                        <h5>❓ 후속 질문</h5>
                                                        <ul>
                                                            {result.content.follow_up_questions?.map((question: string, index: number) => (
                                                                <li key={index} className="follow-up-question">
                                                                    {question}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="sources">
                                                        <h5>📚 참고 자료</h5>
                                                        <ul>
                                                            {result.content.sources?.map((source: string, index: number) => (
                                                                <li key={index}>{source}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="next-steps">
                                                        <h5>🚀 다음 단계</h5>
                                                        <ul>
                                                            {result.content.next_steps?.map((step: string, index: number) => (
                                                                <li key={index}>{step}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ) : result.analysis_type === 'comprehensive' ? (
                                                <div className="comprehensive-result">
                                                    <div className="executive-summary">
                                                        <h5>실행 요약</h5>
                                                        <p>{result.content.executive_summary}</p>
                                                    </div>

                                                    <div className="detailed-analysis">
                                                        <h5>상세 분석</h5>
                                                        {Object.entries(result.content.detailed_analysis).map(([key, value]) => (
                                                            <div key={key} className="analysis-section">
                                                                <h6>{getAnalysisTypeLabel(key)}</h6>
                                                                <pre>{JSON.stringify(value, null, 2)}</pre>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="recommendations">
                                                        <h5>권장사항</h5>
                                                        <ul>
                                                            {result.content.recommendations?.map((rec: string, index: number) => (
                                                                <li key={index}>{rec}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ) : (
                                                <pre>{JSON.stringify(result.content, null, 2)}</pre>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GaepoSungAnalysis;
