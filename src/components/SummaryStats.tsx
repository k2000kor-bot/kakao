import React, { useState, useEffect } from 'react';

interface SummaryStatsProps {
  totalMessages: number;
  activeChatRooms: number;
  aiStrategies: number;
  systemStatus: 'online' | 'offline' | 'warning';
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ totalMessages, activeChatRooms, aiStrategies, systemStatus }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-xs text-gray-500 mb-1">총 메시지</div>
      <div className="text-2xl font-bold text-purple-700">{totalMessages}</div>
    </div>
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-xs text-gray-500 mb-1">활성 채팅방</div>
      <div className="text-2xl font-bold text-purple-700">{activeChatRooms}</div>
    </div>
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-xs text-gray-500 mb-1">AI 전략</div>
      <div className="text-2xl font-bold text-purple-700">{aiStrategies}</div>
    </div>
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-xs text-gray-500 mb-1">시스템 상태</div>
      <div className={`text-2xl font-bold ${
        systemStatus === 'online' ? 'text-green-700' :
        systemStatus === 'warning' ? 'text-yellow-700' :
        'text-red-700'
      }`}>
        {systemStatus === 'online' ? '온라인' : systemStatus === 'warning' ? '경고' : '오프라인'}
      </div>
    </div>
  </div>
);

export default SummaryStats; 