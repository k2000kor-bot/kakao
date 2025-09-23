import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { User, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const CollaboratorsList: React.FC = () => {
    const { collaborators } = useSelector((state: RootState) => state.collaboration);

    if (collaborators.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                <User size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">현재 협업자가 없습니다</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">협업자 ({collaborators.length})</h3>
            <div className="space-y-2">
                {collaborators.map((collaborator, index) => (
                    <motion.div
                        key={collaborator.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="relative">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User size={16} className="text-gray-600" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                }`}>
                                {collaborator.isOnline && (
                                    <Circle size={8} className="text-green-500" fill="currentColor" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {collaborator.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {collaborator.isOnline ? '온라인' : `마지막 접속: ${new Date(collaborator.lastSeen).toLocaleTimeString()}`}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CollaboratorsList;
