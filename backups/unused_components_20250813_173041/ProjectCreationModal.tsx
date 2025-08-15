import React, { useState, useRef, useEffect, Fragment } from 'react';
import {
    FolderIcon,
    DocumentTextIcon,
    PhotoIcon,
    VideoCameraIcon,
    MusicalNoteIcon,
    LightBulbIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../context/AppContext';
import MediaFileClassifier from './MediaFileClassifier';
import GuidelinesEditor from './GuidelinesEditor';

interface ProjectCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: (project: any) => void;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
    isOpen,
    onClose,
    onProjectCreated
}) => {
    const [step, setStep] = useState(1);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectType, setProjectType] = useState<'development' | 'design' | 'marketing' | 'research' | 'other'>('development');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [classifiedFiles, setClassifiedFiles] = useState<any[]>([]);
    const [guidelines, setGuidelines] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [showFileClassifier, setShowFileClassifier] = useState(false);
    const [showGuidelinesEditor, setShowGuidelinesEditor] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotifications();

    const projectTypes = [
        { id: 'development', name: '개발 프로젝트', icon: '💻', description: '소프트웨어 개발, 웹사이트, 앱 개발' },
        { id: 'design', name: '디자인 프로젝트', icon: '🎨', description: 'UI/UX 디자인, 그래픽 디자인, 브랜딩' },
        { id: 'marketing', name: '마케팅 프로젝트', icon: '📢', description: '마케팅 캠페인, 광고, 콘텐츠 제작' },
        { id: 'research', name: '연구 프로젝트', icon: '🔬', description: '데이터 분석, 시장 조사, 리서치' },
        { id: 'other', name: '기타 프로젝트', icon: '📁', description: '기타 업무 프로젝트' }
    ];

    const handleFileUpload = (files: FileList) => {
        const newFiles = Array.from(files);
        setMediaFiles(prev => [...prev, ...newFiles]);

        addNotification({
            type: 'success',
            title: '파일 업로드 완료',
            message: `${newFiles.length}개의 파일이 추가되었습니다.`
        });
    };

    const handleRemoveFile = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileClassification = (classifiedFiles: any[]) => {
        setClassifiedFiles(classifiedFiles);
        setShowFileClassifier(false);

        addNotification({
            type: 'success',
            title: '파일 분류 완료',
            message: `${classifiedFiles.length}개의 파일이 AI로 분류되었습니다.`
        });
    };

    const handleNext = () => {
        if (step === 1 && !projectName.trim()) {
            addNotification({
                type: 'error',
                title: '프로젝트 이름 필요',
                message: '프로젝트 이름을 입력해주세요.'
            });
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleCreateProject = async () => {
        setIsCreating(true);

        try {
            // 모의 프로젝트 생성 지연
            await new Promise(resolve => setTimeout(resolve, 2000));

            const newProject = {
                id: Date.now().toString(),
                name: projectName,
                description: projectDescription,
                type: projectType,
                mediaFiles: classifiedFiles.length > 0 ? classifiedFiles : mediaFiles.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: URL.createObjectURL(file)
                })),
                guidelines,
                createdAt: new Date().toISOString(),
                status: 'active',
                settings: {
                    autoSummarize: true,
                    enableVoiceInput: true,
                    enableFileUpload: true,
                    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB (매우 큰 값으로 설정)
                },
                chatRooms: [
                    {
                        id: `${Date.now()}-1`,
                        name: '일반 채팅',
                        type: 'general',
                        unreadCount: 0,
                        lastMessage: '프로젝트가 생성되었습니다.',
                        lastMessageTime: new Date().toISOString()
                    },
                    {
                        id: `${Date.now()}-2`,
                        name: '프로젝트 지침',
                        type: 'guidelines',
                        unreadCount: 0,
                        lastMessage: '프로젝트 지침이 설정되었습니다.',
                        lastMessageTime: new Date().toISOString()
                    }
                ]
            };

            onProjectCreated(newProject);

            addNotification({
                type: 'success',
                title: '프로젝트 생성 완료',
                message: `${projectName} 프로젝트가 성공적으로 생성되었습니다.`
            });

            // 폼 초기화
            setProjectName('');
            setProjectDescription('');
            setProjectType('development');
            setMediaFiles([]);
            setGuidelines('');
            setStep(1);
            onClose();
        } catch (error) {
            addNotification({
                type: 'error',
                title: '프로젝트 생성 실패',
                message: '프로젝트 생성 중 오류가 발생했습니다.'
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        if (hasChanges) {
            setShowCloseConfirm(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowCloseConfirm(false);
        setHasChanges(false);
        onClose();
    };

    const handleCancelClose = () => {
        setShowCloseConfirm(false);
    };

    const handleInputChange = () => {
        setHasChanges(true);
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleBackgroundClick = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleBackgroundClick);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleBackgroundClick);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <Fragment>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div ref={modalRef} className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                    {/* 헤더 */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">새 프로젝트 생성</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                disabled={isCreating}
                                aria-label="프로젝트 생성 모달 닫기"
                                title="ESC 키로도 닫을 수 있습니다"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* 진행 단계 표시 */}
                        <div className="flex items-center mt-4 space-x-2">
                            {[1, 2, 3].map((stepNumber) => (
                                <div key={stepNumber} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {stepNumber}
                                    </div>
                                    {stepNumber < 3 && (
                                        <div className={`w-8 h-1 mx-2 ${step > stepNumber ? 'bg-blue-500' : 'bg-gray-200'
                                            }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 단계별 콘텐츠 */}
                    <div className="p-6">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">프로젝트 기본 정보</h3>
                                    <p className="text-gray-600 mb-4">프로젝트의 기본 정보를 입력해주세요.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        프로젝트 이름 *
                                    </label>
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => {
                                            setProjectName(e.target.value);
                                            handleInputChange();
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="예: 개포우성7차, 스마트시티 프로젝트"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        프로젝트 설명
                                    </label>
                                    <textarea
                                        value={projectDescription}
                                        onChange={(e) => {
                                            setProjectDescription(e.target.value);
                                            handleInputChange();
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        프로젝트 유형
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {projectTypes.map((type) => (
                                            <div
                                                key={type.id}
                                                onClick={() => setProjectType(type.id as any)}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${projectType === type.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{type.icon}</span>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                                                        <p className="text-sm text-gray-500">{type.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">미디어 파일 업로드</h3>
                                    <p className="text-gray-600 mb-4">프로젝트 관련 이미지, 문서, 참고 자료를 업로드하세요.</p>
                                </div>

                                <div className="space-y-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                                            className="hidden"
                                            aria-label="미디어 파일 업로드"
                                        />
                                        <div className="text-4xl mb-4">📁</div>
                                        <p className="text-lg font-medium text-gray-900 mb-2">파일을 드래그하거나 클릭하여 업로드</p>
                                        <p className="text-sm text-gray-500">이미지, PDF, 문서 파일 (최대 10MB)</p>
                                    </div>

                                    {mediaFiles.length > 0 && (
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setShowFileClassifier(true)}
                                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                🤖 AI 파일 분류
                                            </button>
                                            <button
                                                onClick={() => setMediaFiles([])}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                전체 삭제
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {mediaFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900">업로드된 파일</h4>
                                        {mediaFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-lg">📄</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{file.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                    aria-label={`${file.name} 파일 삭제`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">프로젝트 지침 설정</h3>
                                    <p className="text-gray-600 mb-4">프로젝트 진행을 위한 지침과 규칙을 설정하세요.</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            프로젝트 지침
                                        </label>
                                        <textarea
                                            value={guidelines}
                                            onChange={(e) => setGuidelines(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="프로젝트 진행 규칙, 작업 방식, 커뮤니케이션 방법 등을 입력하세요"
                                            rows={6}
                                        />
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowGuidelinesEditor(true)}
                                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            📋 지침 템플릿 사용
                                        </button>
                                        <button
                                            onClick={() => setGuidelines('')}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            지침 초기화
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">💡 지침 예시</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• 매일 오전 10시에 진행상황 공유</li>
                                        <li>• 중요한 결정사항은 팀 전체 승인 후 진행</li>
                                        <li>• 문서는 공유 폴더에 정리하여 보관</li>
                                        <li>• 이슈 발생 시 즉시 팀장에게 보고</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 하단 버튼 */}
                    <div className="p-6 border-t border-gray-200">
                        <div className="flex justify-between">
                            <button
                                onClick={handleBack}
                                disabled={step === 1 || isCreating}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                이전
                            </button>

                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    disabled={isCreating}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    취소
                                </button>

                                {step < 3 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={isCreating}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        다음
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCreateProject}
                                        disabled={isCreating}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isCreating ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>생성 중...</span>
                                            </div>
                                        ) : (
                                            '프로젝트 생성'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI 파일 분류기 */}
            {showFileClassifier && (
                <MediaFileClassifier
                    files={mediaFiles}
                    onClassificationComplete={handleFileClassification}
                    onClose={() => setShowFileClassifier(false)}
                />
            )}

            {/* 지침 편집기 */}
            {showGuidelinesEditor && (
                <GuidelinesEditor
                    value={guidelines}
                    onChange={setGuidelines}
                    onClose={() => setShowGuidelinesEditor(false)}
                />
            )}

            {/* 닫기 확인 다이얼로그 */}
            {showCloseConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                            <h3 className="text-lg font-semibold text-gray-900">변경사항이 있습니다</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            입력한 내용이 저장되지 않습니다. 정말로 닫으시겠습니까?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancelClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmClose}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default ProjectCreationModal; 