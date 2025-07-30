import React, { useState, useEffect } from 'react';
import {
  SignalIcon,
  SignalSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ConnectionMonitorProps {
  isConnected: boolean;
  isActive: boolean;
  dataFlow: boolean;
  blocks: boolean[];
}

const ConnectionMonitor: React.FC<ConnectionMonitorProps> = ({
  isConnected,
  isActive,
  dataFlow,
  blocks
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setLastUpdate(new Date());
  }, [isConnected, isActive, dataFlow]);

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-500' : 'text-red-500';
  };

  const getStatusText = (status: boolean, trueText: string, falseText: string) => {
    return status ? trueText : falseText;
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
      <div className="flex items-center space-x-2 mb-2">
        {isConnected ? (
          <SignalIcon className="w-4 h-4 text-green-500" />
        ) : (
          <SignalSlashIcon className="w-4 h-4 text-red-500" />
        )}
        <span className="text-xs font-medium">연결 상태</span>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span>연결:</span>
          <span className={getStatusColor(isConnected)}>
            {getStatusText(isConnected, '연결됨', '연결 끊김')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>활성:</span>
          <span className={getStatusColor(isActive)}>
            {getStatusText(isActive, '활성', '비활성')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>데이터:</span>
          <span className={getStatusColor(dataFlow)}>
            {getStatusText(dataFlow, '흐름', '중단')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>블록:</span>
          <span className={getStatusColor(blocks.every(b => b))}>
            {blocks.filter(b => b).length}/{blocks.length}
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        마지막 업데이트: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ConnectionMonitor; 