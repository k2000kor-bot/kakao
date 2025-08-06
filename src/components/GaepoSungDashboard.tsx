import React, { useState, useEffect } from 'react';
import GaepoSungAnalysis from './GaepoSungAnalysis';
import GaepoSungProjectManager from './GaepoSungProjectManager';
import GaepoSungAIRecommendations from './GaepoSungAIRecommendations';

interface GaepoSungDashboardProps {
    selectedRoomId?: string;
}

const GaepoSungDashboard: React.FC<GaepoSungDashboardProps> = ({ selectedRoomId }) => {
    const [activeView, setActiveView] = useState<'analysis' | 'chat' | 'documents' | 'project' | 'ai'>('analysis');

    const renderNavigation = () => (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">개포우성7차 프로젝트</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <nav className="flex space-x-8">
                            {[
                                { id: 'analysis', name: '분석', icon: '📊' },
                                { id: 'chat', name: '실시간 채팅', icon: '💬' },
                                { id: 'documents', name: '문서', icon: '📁' },
                                { id: 'project', name: '프로젝트 관리', icon: '📋' },
                                { id: 'ai', name: 'AI 추천', icon: '🤖' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id as any)}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeView === item.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAnalysisView = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {selectedRoomId ? (
                <GaepoSungAnalysis roomId={selectedRoomId} />
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">채팅방을 선택하세요</h3>
                    <p className="text-gray-500">분석을 위해 채팅방을 선택해주세요.</p>
                </div>
            )}
        </div>
    );

    const renderChatView = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">실시간 채팅</h2>
                <p className="text-gray-600">실시간 채팅 기능은 별도 페이지에서 이용하실 수 있습니다.</p>
                <div className="mt-4">
                    <a
                        href="/#/chat"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        채팅 페이지로 이동
                    </a>
                </div>
            </div>
        </div>
    );

    const renderDocumentsView = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 문서</h2>
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">개포우성7차 제안서</h3>
                                    <p className="text-xs text-gray-500">PDF • 2.3MB • 2025-07-15</p>
                                </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                다운로드
                            </button>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">시공사 평가 보고서</h3>
                                    <p className="text-xs text-gray-500">Excel • 1.1MB • 2025-07-20</p>
                                </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                다운로드
                            </button>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">공사비 분석 자료</h3>
                                    <p className="text-xs text-gray-500">Word • 856KB • 2025-07-25</p>
                                </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                다운로드
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {renderNavigation()}

            <div className="py-6">
                {activeView === 'analysis' && renderAnalysisView()}
                {activeView === 'chat' && renderChatView()}
                {activeView === 'documents' && renderDocumentsView()}
                {activeView === 'project' && <GaepoSungProjectManager roomId={selectedRoomId} />}
                {activeView === 'ai' && <GaepoSungAIRecommendations roomId={selectedRoomId} />}
            </div>
        </div>
    );
};

export default GaepoSungDashboard; 