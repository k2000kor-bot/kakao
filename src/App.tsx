import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Bot,
  BarChart3,
  Settings,
  X
} from 'lucide-react';
import ChatGPTMode from './components/ChatGPTMode';
import Dashboard from './components/Dashboard';

function App() {
  const [currentMode, setCurrentMode] = useState('gemini');
  const [showModeSelector, setShowModeSelector] = useState(false);

  const modes = [
    { id: 'gemini', name: 'CORBU AI', icon: Bot, color: 'text-purple-600' },
    { id: 'chatgpt', name: 'ChatGPT 모드', icon: MessageSquare, color: 'text-green-600' },
    { id: 'dashboard', name: '대시보드', icon: BarChart3, color: 'text-blue-600' }
  ];

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
    setShowModeSelector(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">CORBU AI</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowModeSelector(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">모드 변경</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Selector Modal */}
      <AnimatePresence>
        {showModeSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModeSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">모드 선택</h2>
                <button
                  onClick={() => setShowModeSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                {modes.map((mode) => {
                  const IconComponent = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id)}
                      className={`w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${currentMode === mode.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <IconComponent className={`h-6 w-6 ${mode.color}`} />
                      <span className="font-medium text-gray-900">{mode.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentMode === 'gemini' && (
            <motion.div
              key="gemini"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">CORBU AI 도우미</h1>
                      <p className="text-purple-100 mt-1">
                        글쓰기, 웹 검색, 뉴스 분석, 모니터링을 도와드립니다
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-blue-900">글쓰기 도우미</h3>
                      </div>
                      <p className="text-blue-800 text-sm">
                        이메일, 블로그, 보고서 등 다양한 형태의 글을 작성해드립니다.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-green-900">웹 검색 & 분석</h3>
                      </div>
                      <p className="text-green-800 text-sm">
                        웹에서 정보를 검색하고 뉴스를 분석하여 핵심 내용을 요약해드립니다.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-purple-500 p-2 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-purple-900">실시간 모니터링</h3>
                      </div>
                      <p className="text-purple-800 text-sm">
                        특정 주제에 대한 뉴스를 실시간으로 모니터링하고 알림을 제공합니다.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">
                      위의 기능들을 사용하려면 ChatGPT 모드로 전환하세요
                    </p>
                    <button
                      onClick={() => setCurrentMode('chatgpt')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                    >
                      대화 시작하기
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentMode === 'chatgpt' && (
            <motion.div
              key="chatgpt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatGPTMode />
            </motion.div>
          )}

          {currentMode === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

