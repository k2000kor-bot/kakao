import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Plus,
    MoreVertical,
    Trash2,
    Archive,
    Clock,
    User
} from 'lucide-react';
import { Chat, Message } from '../types/project';
import { chatService, messageService } from '../services/projectService';

interface ChatListProps {
    projectId: string;
    onChatSelect: (chat: Chat) => void;
    onNewChat: () => void;
    selectedChatId?: string;
}

const ChatList: React.FC<ChatListProps> = ({
    projectId,
    onChatSelect,
    onNewChat,
    selectedChatId
}) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [showMenu, setShowMenu] = useState<string | null>(null);

    useEffect(() => {
        loadChats();
    }, [projectId]);

    const loadChats = () => {
        const chatList = chatService.getProjectChats(projectId);
        // 최신순으로 정렬
        const sortedChats = chatList.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setChats(sortedChats);
    };

    const handleDeleteChat = (chatId: string) => {
        if (window.confirm('정말로 이 채팅을 삭제하시겠습니까?')) {
            chatService.deleteChat(chatId);
            loadChats();
            setShowMenu(null);
        }
    };

    const handleArchiveChat = (chatId: string) => {
        chatService.updateChat(chatId, { status: 'archived' });
        loadChats();
        setShowMenu(null);
    };

    const getLastMessage = (chat: Chat): Message | null => {
        const messages = messageService.getChatMessages(chat.id);
        return messages.length > 0 ? messages[messages.length - 1] : null;
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const chatDate = new Date(date);
        const diffTime = now.getTime() - chatDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return chatDate.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffDays === 1) {
            return '어제';
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return chatDate.toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const truncateText = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">채팅</h2>
                    <button
                        onClick={onNewChat}
                        className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">새 채팅</span>
                    </button>
                </div>
            </div>

            {/* Chat List */}
            <div className="max-h-96 overflow-y-auto">
                <AnimatePresence>
                    {chats.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center"
                        >
                            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">채팅이 없습니다.</p>
                            <button
                                onClick={onNewChat}
                                className="text-purple-600 hover:text-purple-700 font-medium"
                            >
                                첫 번째 채팅을 시작해보세요
                            </button>
                        </motion.div>
                    ) : (
                        chats.map((chat) => {
                            const lastMessage = getLastMessage(chat);
                            const messageCount = messageService.getChatMessages(chat.id).length;

                            return (
                                <motion.div
                                    key={chat.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${selectedChatId === chat.id
                                            ? 'bg-purple-50 border-purple-200'
                                            : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => onChatSelect(chat)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <MessageSquare className={`h-5 w-5 ${chat.status === 'archived' ? 'text-gray-400' : 'text-purple-600'
                                                    }`} />
                                                <h3 className={`font-medium truncate ${chat.status === 'archived' ? 'text-gray-500' : 'text-gray-900'
                                                    }`}>
                                                    {chat.title}
                                                </h3>
                                                {chat.status === 'archived' && (
                                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                        보관됨
                                                    </span>
                                                )}
                                            </div>

                                            {lastMessage && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    <span className="inline-flex items-center space-x-1 mr-2">
                                                        <User className="h-3 w-3" />
                                                        <span className="text-xs text-gray-500">
                                                            {lastMessage.role === 'user' ? '나' : 'AI'}
                                                        </span>
                                                    </span>
                                                    {truncateText(lastMessage.content)}
                                                </p>
                                            )}

                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDate(chat.updatedAt)}</span>
                                                </div>

                                                <div className="flex items-center space-x-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    <span>{messageCount} 메시지</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative ml-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowMenu(showMenu === chat.id ? null : chat.id);
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-400" />
                                            </button>

                                            <AnimatePresence>
                                                {showMenu === chat.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                                                    >
                                                        {chat.status === 'archived' ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    chatService.updateChat(chat.id, { status: 'active' });
                                                                    loadChats();
                                                                    setShowMenu(null);
                                                                }}
                                                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                <MessageSquare className="h-4 w-4" />
                                                                <span>복원</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleArchiveChat(chat.id);
                                                                }}
                                                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                <Archive className="h-4 w-4" />
                                                                <span>보관</span>
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteChat(chat.id);
                                                            }}
                                                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>삭제</span>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ChatList;
