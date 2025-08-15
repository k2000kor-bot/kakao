import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  Cog6ToothIcon,
  UserIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon,
  WrenchScrewdriverIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface AIStrategy {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  priority: number;
  category: string;
}

interface PersonalizationSetting {
  id: string;
  name: string;
  description: string;
  value: any;
  type: 'toggle' | 'select' | 'slider' | 'input';
  options?: string[];
  min?: number;
  max?: number;
}

interface RightPanelProps {
  aiStrategies: AIStrategy[];
  personalizationSettings: PersonalizationSetting[];
  onStrategyToggle: (strategyId: string) => void;
  onSettingChange: (settingId: string, value: any) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  aiStrategies,
  personalizationSettings,
  onStrategyToggle,
  onSettingChange,
  selectedCategory,
  onCategorySelect
}) => {
  const categories = [
    { id: 'all', label: '전체', icon: ChartPieIcon },
    { id: 'response', label: '응답 전략', icon: Cog6ToothIcon },
    { id: 'analysis', label: '분석 도구', icon: AdjustmentsHorizontalIcon },
    { id: 'security', label: '보안 설정', icon: ShieldCheckIcon },
    { id: 'personalization', label: '개인화', icon: UserIcon }
  ];

  const filteredStrategies = selectedCategory === 'all'
    ? aiStrategies
    : aiStrategies.filter(strategy => strategy.category === selectedCategory);

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
      {/* 카테고리 선택 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">6</span>
          AI 전략 관리
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`flex items-center justify-start space-x-2 p-3 rounded-md border-2 transition-all duration-200 ${selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI 전략 목록 */}
      {/* 6-1 활성 전략(왼쪽) 중복 제거로 해당 섹션 전체 삭제 */}

      {/* 개인화 설정 */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-start space-x-2 mb-4">
          <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">8</span>
          <UserIcon className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">개인화 설정</h3>
        </div>

        <div className="space-y-2">
          {personalizationSettings.map((setting) => (
            <div key={setting.id} className="p-4 rounded-md border-2 border-gray-200 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                    {setting.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {setting.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {setting.type === 'toggle' && (
                  <button
                    onClick={() => onSettingChange(setting.id, !setting.value)}
                    className={`w-12 h-6 rounded-full border-2 flex items-center transition-colors ${setting.value
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300 bg-white'
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${setting.value ? 'transform translate-x-6' : 'transform translate-x-1'
                        }`}
                    />
                  </button>
                )}

                {setting.type === 'select' && setting.options && (
                  <select
                    value={setting.value}
                    onChange={(e) => onSettingChange(setting.id, e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label={setting.name}
                    title={setting.name}
                  >
                    {setting.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {setting.type === 'slider' && (
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={setting.min || 0}
                      max={setting.max || 100}
                      value={setting.value}
                      onChange={(e) => onSettingChange(setting.id, parseInt(e.target.value))}
                      className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label={setting.name}
                      title={setting.name}
                    />
                    <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                      {setting.value}
                    </span>
                  </div>
                )}

                {setting.type === 'input' && (
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => onSettingChange(setting.id, e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="값을 입력하세요"
                    aria-label={setting.name}
                    title={setting.name}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2">12</span>
          빠른 액션
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-start space-x-2 p-3 rounded-md border-2 border-gray-200 bg-gray-50 hover:border-gray-300 transition-all duration-200" aria-label="설정 초기화" title="설정 초기화">
            <WrenchScrewdriverIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">설정 초기화</span>
          </button>
          <button className="flex items-center justify-start space-x-2 p-3 rounded-md border-2 border-gray-200 bg-gray-50 hover:border-gray-300 transition-all duration-200" aria-label="백업/복원" title="백업/복원">
            <KeyIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">백업/복원</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightPanel; 