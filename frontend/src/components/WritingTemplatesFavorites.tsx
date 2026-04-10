/**
 * 글쓰기 템플릿 즐겨찾기 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { WRITING_TEMPLATE_FAVORITES_STORAGE_KEY } from '../services/writingUiStorageKeys';
import { WritingTemplate } from '../services/writingTemplates';
import './WritingTemplatesFavorites.css';

interface WritingTemplatesFavoritesProps {
  onSelectTemplate: (template: WritingTemplate) => void;
}

const WritingTemplatesFavorites: React.FC<WritingTemplatesFavoritesProps> = ({ onSelectTemplate: _onSelectTemplate }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(WRITING_TEMPLATE_FAVORITES_STORAGE_KEY);
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const toggleFavorite = (templateId: string) => {
    const updated = favorites.includes(templateId)
      ? favorites.filter((id) => id !== templateId)
      : [...favorites, templateId];
    
    setFavorites(updated);
    localStorage.setItem(WRITING_TEMPLATE_FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  };

  const isFavorite = (templateId: string) => favorites.includes(templateId);

  return (
    <div className="writing-templates-favorites">
      <h3>즐겨찾기 템플릿</h3>
      {favorites.length === 0 ? (
        <p>즐겨찾기한 템플릿이 없습니다.</p>
      ) : (
        <ul>
          {favorites.map((templateId) => (
            <li key={templateId}>
              <button type="button" onClick={() => {
                // 템플릿을 찾아서 onSelectTemplate 호출
                // 이 부분은 실제 템플릿 데이터가 필요하므로 임시로 처리
              }} aria-label={`${templateId} 템플릿 사용`}>
                {templateId}
              </button>
              <button type="button" onClick={() => toggleFavorite(templateId)} aria-label={isFavorite(templateId) ? '즐겨찾기 해제' : '즐겨찾기 추가'}>
                {isFavorite(templateId) ? '★' : '☆'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WritingTemplatesFavorites;

