import React, { useState, useEffect } from 'react';
import { FiBook, FiMessageSquare } from 'react-icons/fi';

interface KnowledgeItem {
  id: string;
  category: string;
  content: string;
  source: string;
  confidence: number;
}

interface Citation {
  id: string;
  title: string;
  author?: string;
  year?: string;
  url?: string;
  page?: string;
}

interface KnowledgeBasedChatProps {
  isOpen?: boolean;
  onClose: () => void;
  knowledgeBase: KnowledgeItem[];
  citations: Citation[];
  onResponse: (response: string) => void;
}

const KnowledgeBasedChat: React.FC<KnowledgeBasedChatProps> = ({
  knowledgeBase,
  citations,
  onResponse
}) => {
  const [currentQuery, setCurrentQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    citations?: string[];
  }>>([]);

  const generateKnowledgeBasedResponse = async (query: string) => {
    setIsGenerating(true);

    // 쿼리 분석 및 관련 지식 검색
    const relevantKnowledge = findRelevantKnowledge(query);
    const relevantCitations = findRelevantCitations(query);

    // 대화체 응답 생성
    const response = await generateConversationalResponse(query, relevantKnowledge, relevantCitations);

    // 대화 히스토리에 추가
    const newEntry = {
      role: 'assistant' as const,
      content: response,
      citations: relevantCitations.map(c => c.title)
    };

    setConversationHistory(prev => [...prev, newEntry]);
    onResponse(response);

    setIsGenerating(false);
  };

  const findRelevantKnowledge = (query: string): KnowledgeItem[] => {
    const queryLower = query.toLowerCase();

    return knowledgeBase.filter(item => {
      const contentLower = item.content.toLowerCase();
      const categoryLower = item.category.toLowerCase();

      return contentLower.includes(queryLower) ||
        categoryLower.includes(queryLower) ||
        queryLower.includes(categoryLower);
    }).sort((a, b) => b.confidence - a.confidence);
  };

  const findRelevantCitations = (query: string): Citation[] => {
    const queryLower = query.toLowerCase();

    return citations.filter(citation => {
      const titleLower = citation.title.toLowerCase();
      return titleLower.includes(queryLower) || queryLower.includes(titleLower);
    });
  };

  const generateConversationalResponse = async (
    query: string,
    knowledge: KnowledgeItem[],
    citations: Citation[]
  ): Promise<string> => {
    // 실제 구현에서는 AI 모델을 호출하지만, 여기서는 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    const queryLower = query.toLowerCase();

    // 쿼리 유형에 따른 응답 패턴
    if (queryLower.includes('부동산') || queryLower.includes('정책')) {
      return generateRealEstateResponse(knowledge, citations);
    } else if (queryLower.includes('프로젝트') || queryLower.includes('관리')) {
      return generateProjectResponse(knowledge, citations);
    } else if (queryLower.includes('회의') || queryLower.includes('의사결정')) {
      return generateMeetingResponse(knowledge, citations);
    } else if (queryLower.includes('법규') || queryLower.includes('법')) {
      return generateLegalResponse(knowledge, citations);
    } else {
      return generateGeneralResponse(knowledge, citations);
    }
  };

  const generateRealEstateResponse = (knowledge: KnowledgeItem[], citations: Citation[]): string => {
    const relevantKnowledge = knowledge.filter(k => k.category.includes('부동산'));
    const relevantCitations = citations.filter(c => c.title.includes('부동산') || c.title.includes('법'));

    return `아, 부동산 정책에 대해 물어보시는군요! 📋

제가 분석한 자료들을 보면, 현재 부동산 정책은 상당히 복잡한 상황이에요. 

**주요 포인트들:**
• ${relevantKnowledge[0]?.content || '도시개발 관련 법규가 계속 개정되고 있어요'}
• ${relevantKnowledge[1]?.content || '정부의 정책 방향이 명확해지고 있어요'}

**참고할 만한 자료들:**
${relevantCitations.map(c => `• ${c.title}`).join('\n')}

이런 내용들을 바탕으로 보면, 앞으로 부동산 시장은 더욱 체계적으로 관리될 것 같아요. 혹시 특정 부분에 대해 더 자세히 알고 싶으시면 언제든 말씀해 주세요! 😊`;
  };

  const generateProjectResponse = (knowledge: KnowledgeItem[], citations: Citation[]): string => {
    const relevantKnowledge = knowledge.filter(k => k.category.includes('프로젝트'));
    const relevantCitations = citations.filter(c => c.title.includes('프로젝트') || c.title.includes('계획'));

    return `프로젝트 관리에 대해 궁금하시는군요! 🚀

분석한 자료들을 보니, 프로젝트 관리에는 몇 가지 핵심 요소들이 있어요.

**중요한 포인트들:**
• ${relevantKnowledge[0]?.content || '단계별 진행이 매우 중요해요'}
• ${relevantKnowledge[1]?.content || '일정 관리와 리스크 관리가 핵심이에요'}

**참고 자료:**
${relevantCitations.map(c => `• ${c.title}`).join('\n')}

이런 내용들을 종합해보면, 성공적인 프로젝트를 위해서는 체계적인 접근이 필수인 것 같아요. 혹시 특정 프로젝트에 대해 조언이 필요하시면 언제든 말씀해 주세요! 💪`;
  };

  const generateMeetingResponse = (knowledge: KnowledgeItem[], citations: Citation[]): string => {
    const relevantKnowledge = knowledge.filter(k => k.category.includes('회의'));
    const relevantCitations = citations.filter(c => c.title.includes('회의') || c.title.includes('록'));

    return `회의나 의사결정에 대해 물어보시는군요! 🤝

분석한 자료들을 보니, 효과적인 회의 진행에는 몇 가지 팁이 있어요.

**핵심 포인트들:**
• ${relevantKnowledge[0]?.content || '명확한 안건 설정이 중요해요'}
• ${relevantKnowledge[1]?.content || '참석자들의 의견을 체계적으로 정리해야 해요'}

**참고할 만한 자료들:**
${relevantCitations.map(c => `• ${c.title}`).join('\n')}

이런 내용들을 바탕으로 보면, 좋은 회의는 준비가 80%인 것 같아요. 혹시 특정 회의 상황에 대해 조언이 필요하시면 언제든 말씀해 주세요! 📝`;
  };

  const generateLegalResponse = (knowledge: KnowledgeItem[], citations: Citation[]): string => {
    const relevantKnowledge = knowledge.filter(k => k.category.includes('법규'));
    const relevantCitations = citations.filter(c => c.title.includes('법') || c.title.includes('규정'));

    return `법규에 대해 궁금하시는군요! ⚖️

분석한 자료들을 보니, 관련 법규들이 상당히 복잡하게 얽혀있어요.

**주요 법규들:**
• ${relevantKnowledge[0]?.content || '도시 및 주거환경정비법이 기본이에요'}
• ${relevantKnowledge[1]?.content || '국토교통부 고시들이 세부사항을 규정해요'}

**참고 법규:**
${relevantCitations.map(c => `• ${c.title}`).join('\n')}

이런 내용들을 종합해보면, 법규는 계속 개정되고 있어서 최신 정보를 확인하는 것이 중요해요. 혹시 특정 법규에 대해 더 자세히 알고 싶으시면 언제든 말씀해 주세요! 📚`;
  };

  const generateGeneralResponse = (knowledge: KnowledgeItem[], citations: Citation[]): string => {
    return `흥미로운 질문이네요! 🤔

제가 분석한 자료들을 바탕으로 답변드리면, 이 주제와 관련해서는 몇 가지 중요한 포인트들이 있어요.

**주요 내용들:**
${knowledge.slice(0, 3).map(k => `• ${k.content}`).join('\n')}

**참고할 만한 자료들:**
${citations.slice(0, 3).map(c => `• ${c.title}`).join('\n')}

이런 내용들을 종합해보면, 이 주제에 대해 더 깊이 있는 논의가 필요할 것 같아요. 혹시 특정 부분에 대해 더 자세히 알고 싶으시면 언제든 말씀해 주세요! 💡`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      setConversationHistory(prev => [...prev, { role: 'user', content: currentQuery }]);
      generateKnowledgeBasedResponse(currentQuery);
      setCurrentQuery('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <h3 className="text-lg font-semibold">지식 기반 대화</h3>
        </div>
        <p className="text-sm text-gray-600">
          업로드된 미디어 파일의 내용을 바탕으로 지식베이스를 구축하고, 이를 활용한 대화체 응답을 제공합니다.
        </p>
      </div>

      {/* 지식베이스 요약 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-5 h-5 bg-blue-600 rounded"></div>
          <h4 className="font-medium text-blue-900">구축된 지식베이스</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {knowledgeBase.slice(0, 5).map(item => (
            <span key={item.id} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
              {item.category}
            </span>
          ))}
          {knowledgeBase.length > 5 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{knowledgeBase.length - 5}개 더
            </span>
          )}
        </div>
      </div>

      {/* 대화 히스토리 */}
      <div className="mb-6 max-h-64 overflow-y-auto space-y-3">
        {conversationHistory.map((entry, index) => (
          <div key={index} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-3 rounded-lg ${entry.role === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
              }`}>
              <p className="text-sm">{entry.content}</p>
              {entry.citations && entry.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs opacity-75">참고: {entry.citations.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">지식 기반 응답을 생성하고 있습니다...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 질문 입력 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-400 rounded"></div>
          <input
            type="text"
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            placeholder="지식베이스를 바탕으로 질문해보세요..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !currentQuery.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            질문하기
          </button>
        </div>
      </form>

      {/* 인용 정보 */}
      {citations.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="font-medium text-gray-900">참고 자료</h4>
          </div>
          <div className="space-y-2">
            {citations.slice(0, 3).map((citation, index) => (
              <div key={index} className="text-sm text-gray-600">
                • {citation.title}
                {citation.author && ` (${citation.author})`}
                {citation.year && ` (${citation.year})`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasedChat; 