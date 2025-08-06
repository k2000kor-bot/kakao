import React from 'react';
import { Message } from '../types/chat';
import ConversationResponse from './responses/ConversationResponse';
import SummaryResponse from './responses/SummaryResponse';
import AnalysisResponse from './responses/AnalysisResponse';
import FormResponse from './responses/FormResponse';
import ChartResponse from './responses/ChartResponse';
import TableResponse from './responses/TableResponse';
import ListResponse from './responses/ListResponse';
import CodeResponse from './responses/CodeResponse';
import ImageResponse from './responses/ImageResponse';

interface AIResponseRendererProps {
  message: Message;
  onAction?: (action: string, data: any) => void;
}

const AIResponseRenderer: React.FC<AIResponseRendererProps> = ({ message, onAction }) => {
  const renderResponse = () => {
    // AI 응답 타입에 따른 렌더링
    if (message.aiResponse?.type) {
      switch (message.aiResponse.type) {
        case 'conversation':
          return <ConversationResponse message={message} />;
        case 'summary':
          return <SummaryResponse message={message} />;
        case 'analysis':
          return <AnalysisResponse message={message} />;
        case 'form':
          return <FormResponse message={message} onAction={onAction} />;
        case 'chart':
          return <ChartResponse message={message} />;
        case 'table':
          return <TableResponse message={message} />;
        case 'list':
          return <ListResponse message={message} />;
        case 'code':
          return <CodeResponse message={message} />;
        case 'image':
          return <ImageResponse message={message} />;
        default:
          return <div className="text-gray-600">{message.content}</div>;
      }
    }

    // 특정 필드가 있는 경우 해당 컴포넌트 렌더링
    if (message.conversation) {
      return <ConversationResponse message={message} />;
    }
    if (message.summary) {
      return <SummaryResponse message={message} />;
    }
    if (message.analysis) {
      return <AnalysisResponse message={message} />;
    }
    if (message.form) {
      return <FormResponse message={message} onAction={onAction} />;
    }
    if (message.chart) {
      return <ChartResponse message={message} />;
    }
    if (message.table) {
      return <TableResponse message={message} />;
    }
    if (message.list) {
      return <ListResponse message={message} />;
    }
    if (message.code) {
      return <CodeResponse message={message} />;
    }
    if (message.generatedImage) {
      return <ImageResponse message={message} />;
    }

    // 기본 텍스트 응답
    return <div className="text-gray-600">{message.content}</div>;
  };

  return (
    <div className="ai-response-renderer">
      {renderResponse()}
    </div>
  );
};

export default AIResponseRenderer; 