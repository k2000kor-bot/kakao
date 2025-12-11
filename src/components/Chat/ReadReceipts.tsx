/**
 * 읽음 확인 컴포넌트
 * 메시지 읽음 상태 표시
 */

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import './ReadReceipts.css';

export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: Date;
}

interface ReadReceiptsProps {
  messageId: string;
  receipts: ReadReceipt[];
  currentUserId: string;
  showTooltip?: boolean;
}

const ReadReceipts: React.FC<ReadReceiptsProps> = ({
  messageId,
  receipts,
  currentUserId,
  showTooltip = true,
}) => {
  const userReceipts = receipts.filter((r) => r.userId !== currentUserId);
  const hasReadReceipts = userReceipts.length > 0;
  const allRead = userReceipts.length > 0;

  if (!hasReadReceipts) {
    return (
      <span className="read-receipt-icon" aria-label="전송됨">
        <Check size={14} className="read-receipt-single" />
      </span>
    );
  }

  const latestReadTime = userReceipts.reduce((latest, receipt) => {
    return receipt.readAt > latest ? receipt.readAt : latest;
  }, userReceipts[0].readAt);

  return (
    <span
      className="read-receipt-icon read-receipt-read"
      title={showTooltip ? `${latestReadTime.toLocaleString()}에 읽음` : undefined}
      aria-label={`${userReceipts.length}명이 읽음`}
    >
      <CheckCheck size={14} className="read-receipt-double" />
      {userReceipts.length > 1 && (
        <span className="read-receipt-count">{userReceipts.length}</span>
      )}
    </span>
  );
};

export default ReadReceipts;

