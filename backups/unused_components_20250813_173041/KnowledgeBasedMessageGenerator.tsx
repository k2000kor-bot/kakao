import React, { useState, useEffect } from 'react';
import { AcademicCapIcon, LightBulbIcon, CogIcon, PlusIcon, ArrowPathIcon, StarIcon } from '@heroicons/react/24/outline';
import knowledgeService from '../services/knowledgeService';
import { KnowledgeBase, Guideline, LogicRule, MessageGenerationRequest, MessageGenerationResponse, AIServiceConfig } from '../types/knowledge';

interface KnowledgeBasedMessageGeneratorProps {
  selectedMessage?: any;
  onMessageGenerated?: (message: string) => void;
}

const KnowledgeBasedMessageGenerator: React.FC<KnowledgeBasedMessageGeneratorProps> = ({
  selectedMessage,
  onMessageGenerated
}) => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState<MessageGenerationResponse | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // 지식 베이스 관리
  const [newKnowledgeBase, setNewKnowledgeBase] = useState({
    name: '',
    description: ''
  });

  // 지침 관리
  const [newGuideline, setNewGuideline] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'medium' as const,
    context: [''],
    examples: ['']
  });

  // 논리 규칙 관리
  const [newLogicRule, setNewLogicRule] = useState({
    name: '',
    description: '',
    conditions: [{ field: 'context', operator: 'contains', value: '' }],
    actions: [{ type: 'generate_response', parameters: {} }],
    priority: 1,
    isActive: true
  });

  // AI 설정
  const [aiConfig, setAiConfig] = useState<AIServiceConfig>({
    openaiApiKey: '',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
    useDeepLearning: true,
    deepLearningModel: 'local-bert'
  });

  // 사용자 선호도
  const [userPreferences, setUserPreferences] = useState({
    tone: 'formal' as const,
    style: 'informative' as const,
    length: 'medium' as const
  });

  useEffect(() => {
    loadKnowledgeBases();
    loadAIConfig();
  }, []);

  const loadKnowledgeBases = async () => {
    try {
      const mockKnowledgeBases: KnowledgeBase[] = [
        {
          id: 'kb_1',
          name: '우성7차 아파트 지식 베이스',
          description: '우성7차 아파트 관련 모든 문서와 지침',
          documents: [],
          guidelines: [],
          logicRules: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setKnowledgeBases(mockKnowledgeBases);
      if (mockKnowledgeBases.length > 0) {
        setSelectedKnowledgeBase(mockKnowledgeBases[0].id);
      }
    } catch (error) {
      console.error('지식 베이스 로드 실패:', error);
    }
  };

  const loadAIConfig = () => {
    const config = knowledgeService.getAIConfig();
    setAiConfig(config);
  };

  const handleCreateKnowledgeBase = async () => {
    if (!newKnowledgeBase.name || !newKnowledgeBase.description) {
      alert('지식 베이스 이름과 설명을 입력해주세요.');
      return;
    }

    try {
      const kb = await knowledgeService.createKnowledgeBase({
        ...newKnowledgeBase,
        documents: [],
        guidelines: [],
        logicRules: []
      });
      setKnowledgeBases(prev => [...prev, kb]);
      setSelectedKnowledgeBase(kb.id);
      setNewKnowledgeBase({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('지식 베이스 생성 실패:', error);
    }
  };

  const handleAddGuideline = async () => {
    if (!selectedKnowledgeBase) {
      alert('지식 베이스를 선택해주세요.');
      return;
    }

    if (!newGuideline.title || !newGuideline.content) {
      alert('지침 제목과 내용을 입력해주세요.');
      return;
    }

    try {
      const guideline = await knowledgeService.addGuideline(selectedKnowledgeBase, {
        ...newGuideline,
        context: newGuideline.context.filter(c => c.trim()),
        examples: newGuideline.examples.filter(e => e.trim())
      });

      setKnowledgeBases(prev => prev.map(kb =>
        kb.id === selectedKnowledgeBase
          ? { ...kb, guidelines: [...kb.guidelines, guideline] }
          : kb
      ));

      setNewGuideline({
        title: '',
        content: '',
        category: '',
        priority: 'medium',
        context: [''],
        examples: ['']
      });

      alert('지침이 추가되었습니다.');
    } catch (error) {
      console.error('지침 추가 실패:', error);
      alert('지침 추가에 실패했습니다.');
    }
  };

  const handleAddLogicRule = async () => {
    if (!selectedKnowledgeBase) {
      alert('지식 베이스를 선택해주세요.');
      return;
    }

    if (!newLogicRule.name || !newLogicRule.description) {
      alert('규칙 이름과 설명을 입력해주세요.');
      return;
    }

    try {
      const rule = await knowledgeService.addLogicRule(selectedKnowledgeBase, {
        ...newLogicRule,
        conditions: newLogicRule.conditions.map(c => ({
          ...c,
          operator: c.operator as any
        })),
        actions: newLogicRule.actions.map(a => ({
          ...a,
          type: a.type as any
        }))
      });

      setKnowledgeBases(prev => prev.map(kb =>
        kb.id === selectedKnowledgeBase
          ? { ...kb, logicRules: [...kb.logicRules, rule] }
          : kb
      ));

      setNewLogicRule({
        name: '',
        description: '',
        conditions: [{ field: 'context', operator: 'contains', value: '' }],
        actions: [{ type: 'generate_response', parameters: {} }],
        priority: 1,
        isActive: true
      });

      alert('로직 규칙이 추가되었습니다.');
    } catch (error) {
      console.error('로직 규칙 추가 실패:', error);
      alert('로직 규칙 추가에 실패했습니다.');
    }
  };

  const handleGenerateMessage = async () => {
    if (!selectedKnowledgeBase || !selectedMessage) {
      alert('지식 베이스와 메시지를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const request: MessageGenerationRequest = {
        knowledgeBaseId: selectedKnowledgeBase,
        context: selectedMessage?.content || '',
        userPreferences
      };

      const response = await knowledgeService.generateMessage(request);
      setGeneratedResponse(response);

      if (onMessageGenerated) {
        onMessageGenerated(response.generatedMessage);
      }
    } catch (error) {
      console.error('메시지 생성 실패:', error);
      alert('메시지 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedKB = knowledgeBases.find(kb => kb.id === selectedKnowledgeBase);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <AcademicCapIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">27</span>
              지식 기반 메시지 생성기
            </h2>
            <p className="text-gray-600">AI와 지식 베이스를 활용한 스마트 메시지 생성</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <CogIcon className="w-5 h-5" />
          <span>고급 설정</span>
        </button>
      </div>

      {/* 지식 베이스 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          지식 베이스 선택
        </label>
        <select
          value={selectedKnowledgeBase}
          onChange={(e) => setSelectedKnowledgeBase(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          aria-label="Select a knowledge base"
        >
          <option value="">지식 베이스를 선택하세요</option>
          {knowledgeBases.map(kb => (
            <option key={kb.id} value={kb.id}>{kb.name}</option>
          ))}
        </select>
      </div>

      {/* 선택된 지식 베이스 정보 */}
      {selectedKB && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">{selectedKB.name}</h3>
          <p className="text-blue-700 mb-3">{selectedKB.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold">문서:</span> {selectedKB.documents.length}개
            </div>
            <div>
              <span className="font-semibold">지침:</span> {selectedKB.guidelines.length}개
            </div>
            <div>
              <span className="font-semibold">규칙:</span> {selectedKB.logicRules.length}개
            </div>
          </div>
        </div>
      )}

      {/* 메시지 생성 버튼 */}
      <div className="mb-6">
        <button
          onClick={handleGenerateMessage}
          disabled={isLoading || !selectedKnowledgeBase}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>생성 중...</span>
            </>
          ) : (
            <>
              <StarIcon className="w-5 h-5" />
              <span>지식 기반 메시지 생성</span>
            </>
          )}
        </button>
      </div>

      {/* 생성된 메시지 표시 */}
      {generatedResponse && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">생성된 메시지</h3>
          <p className="text-green-800 whitespace-pre-wrap">{generatedResponse.generatedMessage}</p>
          {generatedResponse.confidence && (
            <div className="mt-2 text-sm text-green-700">
              신뢰도: {(generatedResponse.confidence * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}

      {/* 고급 설정 패널 */}
      {showAdvancedSettings && (
        <div className="space-y-6">
          {/* 지식 베이스 생성 */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">새 지식 베이스 생성</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="지식 베이스 이름"
                value={newKnowledgeBase.name}
                onChange={(e) => setNewKnowledgeBase(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <textarea
                placeholder="지식 베이스 설명"
                value={newKnowledgeBase.description}
                onChange={(e) => setNewKnowledgeBase(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
              />
              <button
                onClick={handleCreateKnowledgeBase}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <PlusIcon className="w-4 h-4" />
                <span>지식 베이스 생성</span>
              </button>
            </div>
          </div>

          {/* 지침 추가 */}
          {selectedKnowledgeBase && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">지침 추가</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="지침 제목"
                  value={newGuideline.title}
                  onChange={(e) => setNewGuideline(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <textarea
                  placeholder="지침 내용"
                  value={newGuideline.content}
                  onChange={(e) => setNewGuideline(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                />
                <button
                  onClick={handleAddGuideline}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>지침 추가</span>
                </button>
              </div>
            </div>
          )}

          {/* 논리 규칙 추가 */}
          {selectedKnowledgeBase && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">논리 규칙 추가</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="규칙 이름"
                  value={newLogicRule.name}
                  onChange={(e) => setNewLogicRule(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <textarea
                  placeholder="규칙 설명"
                  value={newLogicRule.description}
                  onChange={(e) => setNewLogicRule(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                />
                <button
                  onClick={handleAddLogicRule}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>논리 규칙 추가</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasedMessageGenerator; 