import React, { useState, useEffect } from 'react';
import {
  ArrowPathIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  systemStatus: 'online' | 'offline' | 'warning';
  lastUpdate: Date;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ systemStatus, lastUpdate, onRefresh, isLoading }) => (
  <div className="bg-white rounded-t-lg shadow p-6 flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-purple-700">실시간 AI 대응시스템</h1>
    </div>
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs rounded-full ${systemStatus === 'online' ? 'bg-green-100 text-green-700' :
          systemStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
          {systemStatus === 'online' ? '온라인' : systemStatus === 'warning' ? '경고' : '오프라인'}
        </span>
        <span className="text-xs text-gray-500">
          마지막 업데이트: {lastUpdate.toLocaleTimeString()}
        </span>
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>새로고침</span>
      </button>
    </div>
  </div>
);

export default Header; 