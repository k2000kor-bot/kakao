import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Tag, FileText, Sparkles, BookOpen } from 'lucide-react';
import { projectService } from '../services/projectService';
import { smartTemplateEngine, TemplateRecommendation } from '../services/smartTemplateEngine';
import { Project } from '../types/project';

interface ProjectCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: (project: Project) => void;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
    isOpen,
    onClose,
    onProjectCreated
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        guidelines: '',
        tags: [] as string[],
        tagInput: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [templateRecommendations, setTemplateRecommendations] = useState<TemplateRecommendation[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('프로젝트 이름을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            const newProject = projectService.createProject({
                name: formData.name.trim(),
                description: formData.description.trim(),
                guidelines: formData.guidelines.trim() || undefined,
                tags: formData.tags,
                status: 'active'
            });

            onProjectCreated(newProject);
            handleClose();
        } catch (error) {
            console.error('프로젝트 생성 실패:', error);
            alert('프로젝트 생성에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            guidelines: '',
            tags: [],
            tagInput: ''
        });
        setIsSubmitting(false);
        onClose();
    };

    const handleAddTag = () => {
        const tag = formData.tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag],
                tagInput: ''
            }));
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    // 템플릿 추천 기능
    const handleGetTemplateRecommendations = async () => {
        if (!formData.name.trim() && !formData.description.trim()) {
            return;
        }

        try {
            const recommendations = await smartTemplateEngine.recommendTemplates(
                formData.name,
                formData.description,
                formData.tags
            );
            setTemplateRecommendations(recommendations);
            setShowTemplates(true);
        } catch (error) {
            console.error('템플릿 추천 실패:', error);
        }
    };

    const handleUseTemplate = async (templateId: string) => {
        try {
            const template = smartTemplateEngine.getTemplate(templateId);
            if (template) {
                setFormData(prev => ({
                    ...prev,
                    description: template.description,
                    guidelines: template.structure.guidelines,
                    tags: [...new Set([...prev.tags, ...template.tags])]
                }));
                setSelectedTemplate(templateId);
            }
        } catch (error) {
            console.error('템플릿 적용 실패:', error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Folder className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">새 프로젝트 생성</h2>
                                    <p className="text-sm text-gray-600">프로젝트 정보를 입력해주세요</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleGetTemplateRecommendations}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    템플릿 추천
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Template Recommendations */}
                            {showTemplates && templateRecommendations.length > 0 && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <BookOpen className="h-5 w-5 text-purple-600" />
                                        <h3 className="font-semibold text-purple-900">추천 템플릿</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {templateRecommendations.slice(0, 3).map((recommendation, index) => (
                                            <div
                                                key={recommendation.template.id}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTemplate === recommendation.template.id
                                                    ? 'bg-purple-100 border-purple-300'
                                                    : 'bg-white border-gray-200 hover:border-purple-300'
                                                    }`}
                                                onClick={() => handleUseTemplate(recommendation.template.id)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 mb-1">
                                                            {recommendation.template.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {recommendation.template.description}
                                                        </p>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                            <span>매칭도: {Math.round(recommendation.matchScore * 100)}%</span>
                                                            <span>•</span>
                                                            <span>{recommendation.template.difficulty}</span>
                                                            <span>•</span>
                                                            <span>{recommendation.template.estimatedDuration}</span>
                                                        </div>
                                                        {recommendation.reasons.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-purple-600 font-medium">추천 이유:</p>
                                                                <ul className="text-xs text-gray-600 mt-1">
                                                                    {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                                                                        <li key={idx}>• {reason}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {selectedTemplate === recommendation.template.id && (
                                                        <div className="ml-3">
                                                            <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Project Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    프로젝트 이름 *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="프로젝트 이름을 입력하세요"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    프로젝트 설명
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                                />
                            </div>

                            {/* Guidelines */}
                            <div>
                                <label htmlFor="guidelines" className="block text-sm font-medium text-gray-700 mb-2">
                                    프로젝트 지침
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="guidelines"
                                        value={formData.guidelines}
                                        onChange={(e) => setFormData(prev => ({ ...prev, guidelines: e.target.value }))}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="프로젝트 진행 시 참고할 지침이나 규칙을 입력하세요"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    AI가 프로젝트 관련 질문에 답변할 때 참고할 지침입니다.
                                </p>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    태그
                                </label>
                                <div className="space-y-3">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={formData.tagInput}
                                            onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                                            onKeyPress={handleKeyPress}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="태그를 입력하고 Enter를 누르세요"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            추가
                                        </button>
                                    </div>

                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                                >
                                                    <Tag className="h-3 w-3" />
                                                    <span>{tag}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 hover:text-purple-900"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.name.trim()}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? '생성 중...' : '프로젝트 생성'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProjectCreateModal;
