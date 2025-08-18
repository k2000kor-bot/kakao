import React from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { key: 'Ctrl/Cmd + N', description: '새 프로젝트 생성' },
        { key: 'Ctrl/Cmd + F', description: '프로젝트 검색' },
        { key: 'Ctrl/Cmd + S', description: '설정 열기' },
        { key: 'Ctrl/Cmd + E', description: '내보내기/가져오기' },
        { key: 'Ctrl/Cmd + H', description: '도움말' },
        { key: 'Ctrl/Cmd + D', description: '다크 모드 토글' },
        { key: 'Ctrl/Cmd + C', description: '협업 관리' },
        { key: 'Escape', description: '모달 닫기' },
        { key: 'Enter', description: '메시지 전송' },
        { key: 'Shift + Enter', description: '줄바꿈' }
    ];

    const features = [
        {
            title: '💬 AI 채팅',
            description: 'CORBU AI와 자연스러운 대화를 나누세요. 파일과 지침을 참조하여 정확한 답변을 받을 수 있습니다.'
        },
        {
            title: '📁 파일 관리',
            description: '문서, 이미지, 스프레드시트 등 다양한 파일을 업로드하고 관리하세요. 드래그 앤 드롭을 지원합니다.'
        },
        {
            title: '📋 지침 설정',
            description: 'AI가 따라야 할 특별한 지침을 설정하여 더 정확하고 맞춤형 응답을 받으세요.'
        },
        {
            title: '📊 통계 분석',
            description: '프로젝트 활동 현황을 한눈에 확인하고 분석할 수 있습니다.'
        },
        {
            title: '🔍 고급 검색',
            description: '프로젝트를 이름, 설명, 상태별로 검색하고 필터링하세요.'
        },
        {
            title: '📤 백업/복원',
            description: '프로젝트를 JSON 형식으로 내보내고 가져와서 백업하거나 공유하세요.'
        },
        {
            title: '⚙️ 설정 관리',
            description: '프로젝트 이름, 설명, 우선순위, 상태를 관리하고 보관/삭제할 수 있습니다.'
        },
        {
            title: '⌨️ 키보드 단축키',
            description: 'Ctrl/Cmd + N, F, S, E, H 등 다양한 키보드 단축키로 빠르게 작업하세요.'
        },
        {
            title: '❓ 도움말 시스템',
            description: '종합적인 사용 가이드와 팁을 제공하여 최적의 사용자 경험을 제공합니다.'
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">CORBU AI 도움말</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* 컨텐츠 */}
                <div className="p-6">
                    {/* 키보드 단축키 */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">⌨️ 키보드 단축키</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {shortcuts.map((shortcut, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded">
                                        {shortcut.key}
                                    </kbd>
                                    <span className="text-sm text-gray-600">{shortcut.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 주요 기능 */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 주요 기능</h3>
                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">{feature.title}</h4>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 사용 팁 */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 사용 팁</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <ul className="text-sm text-blue-800 space-y-2">
                                <li>• 프로젝트를 생성한 후 파일을 업로드하면 AI가 더 정확한 답변을 제공합니다.</li>
                                <li>• 지침을 설정하면 AI가 특정 스타일이나 포맷으로 응답합니다.</li>
                                <li>• 검색 기능을 활용하여 많은 프로젝트 중에서 원하는 것을 빠르게 찾으세요.</li>
                                <li>• 정기적으로 프로젝트를 내보내서 백업하세요.</li>
                                <li>• 키보드 단축키를 활용하면 더 빠르게 작업할 수 있습니다.</li>
                            </ul>
                        </div>
                    </div>

                    {/* 지원 정보 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📞 지원</h3>
                        <div className="text-sm text-gray-600">
                            <p>문제가 발생하거나 추가 도움이 필요하시면 개발팀에 문의해주세요.</p>
                            <p className="mt-2">버전: 1.0.0 | CORBU AI Platform</p>
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
