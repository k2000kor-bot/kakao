import { useState, useCallback, useEffect } from 'react';

export interface AIResponseHistory {
  id: string;
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  model: string;
  tokens: number;
  processingTime: number;
  confidence: number;
  projectId: string;
  tags: string[];
  rating?: number;
  notes?: string;
}

export interface HistoryStats {
  totalResponses: number;
  averageTokens: number;
  averageProcessingTime: number;
  averageConfidence: number;
  mostUsedModel: string;
  totalTokens: number;
  favoriteResponses: number;
  recentActivity: Date[];
}

export interface HistoryFilter {
  dateRange: 'all' | 'today' | 'week' | 'month';
  model: string;
  minTokens: number;
  maxTokens: number;
  minConfidence: number;
  tags: string[];
  searchTerm: string;
}

export const useAIHistory = () => {
  const [history, setHistory] = useState<AIResponseHistory[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>({
    dateRange: 'all',
    model: 'all',
    minTokens: 0,
    maxTokens: 100000,
    minConfidence: 0,
    tags: [],
    searchTerm: ''
  });

  // 히스토리 로드
  const loadHistory = useCallback(() => {
    try {
      const saved = localStorage.getItem('ai-response-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    } catch (error) {
      console.error('[AI History] 히스토리 로드 실패:', error);
    }
  }, []);

  // 히스토리 저장
  const saveHistory = useCallback((newHistory: AIResponseHistory[]) => {
    try {
      localStorage.setItem('ai-response-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('[AI History] 히스토리 저장 실패:', error);
    }
  }, []);

  // 응답 추가
  const addResponse = useCallback((response: Omit<AIResponseHistory, 'id' | 'timestamp'>) => {
    const newResponse: AIResponseHistory = {
      ...response,
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    const updatedHistory = [newResponse, ...history];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  }, [history, saveHistory]);

  // 응답 업데이트
  const updateResponse = useCallback((id: string, updates: Partial<AIResponseHistory>) => {
    const updatedHistory = history.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  }, [history, saveHistory]);

  // 응답 삭제
  const deleteResponse = useCallback((id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  }, [history, saveHistory]);

  // 응답 평가
  const rateResponse = useCallback((id: string, rating: number) => {
    updateResponse(id, { rating });
  }, [updateResponse]);

  // 응답에 노트 추가
  const addNote = useCallback((id: string, notes: string) => {
    updateResponse(id, { notes });
  }, [updateResponse]);

  // 태그 추가/제거
  const toggleTag = useCallback((id: string, tag: string) => {
    const response = history.find(item => item.id === id);
    if (response) {
      const newTags = response.tags.includes(tag)
        ? response.tags.filter(t => t !== tag)
        : [...response.tags, tag];
      updateResponse(id, { tags: newTags });
    }
  }, [history, updateResponse]);

  // 필터링된 히스토리
  const getFilteredHistory = useCallback(() => {
    return history.filter(item => {
      // 날짜 범위 필터
      if (filter.dateRange !== 'all') {
        const now = new Date();
        const itemDate = new Date(item.timestamp);
        const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filter.dateRange) {
          case 'today':
            if (diffDays > 0) return false;
            break;
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
        }
      }

      // 모델 필터
      if (filter.model !== 'all' && item.model !== filter.model) {
        return false;
      }

      // 토큰 범위 필터
      if (item.tokens < filter.minTokens || item.tokens > filter.maxTokens) {
        return false;
      }

      // 신뢰도 필터
      if (item.confidence < filter.minConfidence) {
        return false;
      }

      // 태그 필터
      if (filter.tags.length > 0 && !filter.tags.some(tag => item.tags.includes(tag))) {
        return false;
      }

      // 검색어 필터
      if (filter.searchTerm && !item.userMessage.toLowerCase().includes(filter.searchTerm.toLowerCase()) &&
          !item.aiResponse.toLowerCase().includes(filter.searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [history, filter]);

  // 통계 계산
  const getStats = useCallback((): HistoryStats => {
    const filteredHistory = getFilteredHistory();
    
    if (filteredHistory.length === 0) {
      return {
        totalResponses: 0,
        averageTokens: 0,
        averageProcessingTime: 0,
        averageConfidence: 0,
        mostUsedModel: 'N/A',
        totalTokens: 0,
        favoriteResponses: 0,
        recentActivity: []
      };
    }

    const totalTokens = filteredHistory.reduce((sum, item) => sum + item.tokens, 0);
    const totalProcessingTime = filteredHistory.reduce((sum, item) => sum + item.processingTime, 0);
    const totalConfidence = filteredHistory.reduce((sum, item) => sum + item.confidence, 0);
    const favoriteResponses = filteredHistory.filter(item => item.rating && item.rating >= 4).length;

    // 가장 많이 사용된 모델
    const modelCounts = filteredHistory.reduce((counts, item) => {
      counts[item.model] = (counts[item.model] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostUsedModel = Object.entries(modelCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    // 최근 활동 (최근 7일)
    const recentActivity = filteredHistory
      .filter(item => {
        const diffDays = Math.floor((Date.now() - item.timestamp.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      })
      .map(item => item.timestamp)
      .sort((a, b) => b.getTime() - a.getTime());

    return {
      totalResponses: filteredHistory.length,
      averageTokens: Math.round(totalTokens / filteredHistory.length),
      averageProcessingTime: Math.round(totalProcessingTime / filteredHistory.length),
      averageConfidence: Math.round((totalConfidence / filteredHistory.length) * 100) / 100,
      mostUsedModel,
      totalTokens,
      favoriteResponses,
      recentActivity
    };
  }, [getFilteredHistory]);

  // 히스토리 내보내기
  const exportHistory = useCallback(() => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [history]);

  // 히스토리 가져오기
  const importHistory = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          const validatedHistory = imported.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setHistory(validatedHistory);
          saveHistory(validatedHistory);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }, [saveHistory]);

  // 히스토리 정리
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('ai-response-history');
  }, []);

  // 초기 로드
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history: getFilteredHistory(),
    stats: getStats(),
    filter,
    setFilter,
    addResponse,
    updateResponse,
    deleteResponse,
    rateResponse,
    addNote,
    toggleTag,
    exportHistory,
    importHistory,
    clearHistory
  };
};
