/**
 * 글쓰기 스타일 선택 컴포넌트
 * 44개의 글쓰기 종류 중 선택
 */

import React, { useState, useMemo } from 'react';
import writingStyleService, { WritingStyle } from '../services/writingStyleService';
import './WritingStyleSelector.css';

interface WritingStyleSelectorProps {
  /**
   * 선택된 스타일 ID
   */
  selectedStyleId?: string;
  
  /**
   * 스타일 선택 콜백
   */
  onStyleSelect: (styleId: string) => void;
  
  /**
   * 카테고리 필터
   */
  category?: WritingStyle['category'];
  
  /**
   * 검색어
   */
  searchQuery?: string;
}

const WritingStyleSelector: React.FC<WritingStyleSelectorProps> = ({
  selectedStyleId,
  onStyleSelect,
  category,
  searchQuery = '',
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<WritingStyle['category'] | 'all'>(category || 'all');

  // 카테고리 목록
  const categories: Array<{ id: WritingStyle['category'] | 'all'; name: string; icon: string }> = [
    { id: 'all', name: '전체', icon: '📚' },
    { id: 'literature', name: '문학', icon: '📖' },
    { id: 'criticism', name: '비평', icon: '✍️' },
    { id: 'journalism', name: '저널리즘', icon: '📰' },
    { id: 'academic', name: '학술', icon: '🎓' },
    { id: 'creative', name: '창작', icon: '💡' },
    { id: 'professional', name: '전문직', icon: '💼' },
    { id: 'social', name: '사회', icon: '🌍' },
  ];

  // 필터링된 스타일 목록
  const filteredStyles = useMemo(() => {
    let styles = selectedCategory === 'all'
      ? writingStyleService.getAllStyles()
      : writingStyleService.getStylesByCategory(selectedCategory);

    if (localSearchQuery.trim()) {
      const query = localSearchQuery.toLowerCase();
      styles = styles.filter(style =>
        style.name.toLowerCase().includes(query) ||
        style.description.toLowerCase().includes(query) ||
        style.characteristics.some(c => c.toLowerCase().includes(query))
      );
    }

    return styles;
  }, [selectedCategory, localSearchQuery]);

  return (
    <div className="writing-style-selector">
      {/* 검색 및 필터 */}
      <div className="style-selector-header">
        <input
          type="text"
          className="style-search-input"
          placeholder="글쓰기 스타일 검색..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
        />
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-filter ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 스타일 목록 */}
      <div className="styles-grid">
        {filteredStyles.map((style) => (
          <div
            key={style.id}
            className={`style-card ${selectedStyleId === style.id ? 'selected' : ''}`}
            onClick={() => onStyleSelect(style.id)}
          >
            <div className="style-card-header">
              <span className="style-icon">{style.icon || '✍️'}</span>
              <h4 className="style-name">{style.name}</h4>
            </div>
            <p className="style-description">{style.description}</p>
            <div className="style-characteristics">
              {style.characteristics.slice(0, 3).map((char, idx) => (
                <span key={idx} className="characteristic-tag">
                  {char}
                </span>
              ))}
            </div>
            <div className="style-footer">
              <span className="style-tone">톤: {style.tone}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredStyles.length === 0 && (
        <div className="no-results">
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default WritingStyleSelector;

