import React, { useState } from 'react';
import { X, Plus, FileText, Settings, Tag, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: {
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    tags: string[];
    initialGuidelines: string[];
  }) => void;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [guidelines, setGuidelines] = useState<string[]>(['']);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddGuideline = () => {
    setGuidelines([...guidelines, '']);
  };

  const handleRemoveGuideline = (index: number) => {
    setGuidelines(guidelines.filter((_, i) => i !== index));
  };

  const handleGuidelineChange = (index: number, value: string) => {
    const newGuidelines = [...guidelines];
    newGuidelines[index] = value;
    setGuidelines(newGuidelines);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
        priority,
        tags,
        initialGuidelines: guidelines.filter(g => g.trim())
      });
      
      // Reset form
      setProjectName('');
      setProjectDescription('');
      setPriority('medium');
      setTags([]);
      setGuidelines(['']);
      setStep(1);
      onClose();
    } catch (error) {
      console.error('프로젝트 생성 오류:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return projectName.trim().length > 0;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">새 프로젝트 생성</h2>
                <p className="text-sm text-gray-600 mt-1">
                  단계 {step}/3: {step === 1 ? '기본 정보' : step === 2 ? '설정' : '지침'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex space-x-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      stepNumber <= step ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        프로젝트 이름 *
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="프로젝트 이름을 입력하세요"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        프로젝트 설명
                      </label>
                      <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        우선순위
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="low">낮음</option>
                        <option value="medium">보통</option>
                        <option value="high">높음</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        태그
                      </label>
                      <div className="flex space-x-2 mb-3">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          placeholder="태그를 입력하고 Enter를 누르세요"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                          >
                            <Tag className="h-3 w-3" />
                            <span>{tag}</span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-purple-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        프로젝트 지침 (선택사항)
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        AI가 이 프로젝트에서 따라야 할 지침들을 설정하세요.
                      </p>
                      
                      {guidelines.map((guideline, index) => (
                        <div key={index} className="flex space-x-2 mb-3">
                          <input
                            type="text"
                            value={guideline}
                            onChange={(e) => handleGuidelineChange(index, e.target.value)}
                            placeholder="지침을 입력하세요"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          {guidelines.length > 1 && (
                            <button
                              onClick={() => handleRemoveGuideline(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        onClick={handleAddGuideline}
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
                      >
                        <Plus className="h-4 w-4" />
                        <span>지침 추가</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={step > 1 ? handleBack : onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {step > 1 ? '이전' : '취소'}
              </button>
              
              <div className="flex space-x-3">
                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    다음
                  </button>
                ) : (
                  <button
                    onClick={handleCreateProject}
                    disabled={!canProceed() || isCreating}
                    className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>생성 중...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>프로젝트 생성</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectCreationModal;
