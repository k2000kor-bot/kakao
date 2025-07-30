import React, { useState } from "react";
import {
  StarIcon, 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

const IntegratedMessageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMessage = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/message-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          personality: "friendly", 
          target_emotion: "neutral", 
          length: 100, 
          formality: "casual", 
          add_emoji: true, 
          add_hashtags: false, 
          strategy: "creative", 
          keywords: "", 
          forbidden_words: "" 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedMessage(data.message);
      }
    } catch (error) {
      console.error("메시지 생성 실패:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">카카오톡 메시지 생성기</h1>
        <p className="text-gray-600">AI 기반 스마트 메시지 생성 시스템</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <DocumentTextIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">메시지 생성</h2>
        </div>
        
        <textarea
          className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="생성할 메시지의 내용을 입력하세요..."
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
        />
        
        <button
          onClick={generateMessage}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full mt-4 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            isGenerating || !prompt.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <StarIcon className="w-5 h-5" />
          <span>{isGenerating ? '생성 중...' : '메시지 생성'}</span>
        </button>
      </div>

      {generatedMessage && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PaperAirplaneIcon className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">생성된 메시지</h2>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
            <p className="text-gray-700 whitespace-pre-wrap text-left">{generatedMessage}</p>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>AI 생성 메시지</span>
            <span>{new Date().toLocaleString('ko-KR')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedMessageGenerator;
