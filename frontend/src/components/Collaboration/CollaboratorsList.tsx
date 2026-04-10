import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { User, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const CollaboratorsList: React.FC = () => {
    const { collaborators } = useSelector((state: RootState) => state.collaboration);

    if (collaborators.length === 0) {
        return (
            <div className="bw-empty p-4">
                <User size={24} className="mx-auto mb-2 bw-empty-icon" />
                <p>현재 협업자가 없습니다</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h3 className="text-sm font-medium bw-text-primary mb-3">협업자 ({collaborators.length})</h3>
            <div className="space-y-2">
                {collaborators.map((collaborator, index) => (
                    <motion.div
                        key={collaborator.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-2 rounded-lg bw-card-secondary transition-colors"
                    >
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bw-card-secondary" style={{ background: 'var(--bg-tertiary)' }}>
                                <User size={16} className="bw-text-secondary" />
                            </div>
                            <div
                                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                                style={{ background: collaborator.isOnline ? 'var(--accent-success)' : 'var(--text-tertiary)' }}
                            >
                                {collaborator.isOnline && (
                                    <Circle size={8} className="bw-text-success" fill="currentColor" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium bw-text-primary truncate">
                                {collaborator.name}
                            </p>
                            <p className="text-xs bw-text-muted">
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
