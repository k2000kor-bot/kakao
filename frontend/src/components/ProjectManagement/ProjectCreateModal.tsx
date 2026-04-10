/**
 * 프로젝트 만들기 모달 (단일 단계)
 * 이름, 카테고리(투자/숙제/글쓰기/여행), 메모리(기본값/프로젝트 전용), 안내 문구
 * Figma Brainwave UI Kit 기준 — theme.css, .bw-* (ProjectCreateModal.css)
 */
import React, { useState } from 'react';
import { X, Settings, DollarSign, BookOpen, PenLine, Plane, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProjectCreateModal.css';
import { coerceTrimmedString } from '../../utils/chatInputUtils';

export type ProjectCategoryId = 'investment' | 'homework' | 'writing' | 'travel';
export type MemoryType = 'default' | 'project_exclusive';

const CATEGORIES: { id: ProjectCategoryId; label: string; icon: React.ReactNode }[] = [
  { id: 'investment', label: '투자', icon: <DollarSign size={18} aria-hidden /> },
  { id: 'homework', label: '숙제', icon: <BookOpen size={18} aria-hidden /> },
  { id: 'writing', label: '글쓰기', icon: <PenLine size={18} aria-hidden /> },
  { id: 'travel', label: '여행', icon: <Plane size={18} aria-hidden /> },
];

export interface ProjectCreateFormData {
  name: string;
  category: ProjectCategoryId;
  memoryType: MemoryType;
}

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreateFormData) => Promise<void>;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProjectCategoryId>('travel');
  const [memoryType, setMemoryType] = useState<MemoryType>('default');
  const [showMemory, setShowMemory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = coerceTrimmedString(name, '');
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: trimmed, category, memoryType });
      setName('');
      setCategory('travel');
      setMemoryType('default');
      setShowMemory(false);
      onClose();
    } catch {
      // caller may show toast
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bw-project-create-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-create-title"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bw-project-create-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bw-project-create-header">
            <h2 id="project-create-title" className="bw-project-create-title">
              프로젝트 만들기
            </h2>
            <div className="bw-project-create-header-actions">
              <button
                type="button"
                onClick={() => setShowMemory(!showMemory)}
                className="bw-project-create-header-btn"
                aria-label={showMemory ? '메모리 설정 닫기' : '메모리 설정'}
                title="메모리 설정"
              >
                <Settings size={20} aria-hidden />
              </button>
              <button type="button" onClick={onClose} className="bw-project-create-header-btn" aria-label="닫기">
                <X size={20} aria-hidden />
              </button>
            </div>
          </div>

          <div className="bw-project-create-body">
            <div className="bw-project-create-field">
              <label htmlFor="project-create-name" className="bw-project-create-label">
                프로젝트 이름
              </label>
              <div className="bw-project-create-name-row">
                <span className="bw-project-create-name-icon" aria-hidden>
                  +
                </span>
                <input
                  id="project-create-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 코펜하겐 여행"
                  className="bw-project-create-input"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="bw-project-create-field">
              <span className="bw-project-create-label">카테고리</span>
              <div className="bw-project-create-categories">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className="bw-project-create-category-btn"
                    aria-pressed={category === c.id}
                    aria-label={`${c.label} 선택`}
                  >
                    {c.icon}
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {showMemory && (
              <div className="bw-project-create-memory-block">
                <span className="bw-project-create-memory-label">메모리</span>
                <div className="bw-project-create-memory-options">
                  <label className="bw-project-create-memory-option">
                    <input
                      type="radio"
                      name="memoryType"
                      value="default"
                      checked={memoryType === 'default'}
                      onChange={() => setMemoryType('default')}
                    />
                    <span>
                      <span className="bw-project-create-memory-option-title">기본값</span>
                      <p className="bw-project-create-memory-option-desc">
                        프로젝트가 외부 대화에서 메모리에 액세스할 수 있으며 그 반대도 가능합니다.
                      </p>
                    </span>
                  </label>
                  <label className="bw-project-create-memory-option">
                    <input
                      type="radio"
                      name="memoryType"
                      value="project_exclusive"
                      checked={memoryType === 'project_exclusive'}
                      onChange={() => setMemoryType('project_exclusive')}
                    />
                    <span>
                      <span className="bw-project-create-memory-option-title">프로젝트 전용</span>
                      <p className="bw-project-create-memory-option-desc">
                        프로젝트가 자체 메모리에만 액세스할 수 있습니다. 외부 대화에서는 프로젝트 메모리를 볼 수 없습니다.
                      </p>
                    </span>
                  </label>
                </div>
                <p className="bw-project-create-memory-notice" role="status">
                  <Lightbulb size={16} aria-hidden />
                  이 설정은 이후에 변경할 수 없습니다.
                </p>
              </div>
            )}

            <div className="bw-project-create-info-box">
              <Lightbulb size={18} aria-hidden />
              <p>
                프로젝트에서는 한 곳에 파일, 맞춤형 지침을 보관합니다. 지속적으로 진행되는 작업에, 또는 작업을 깔끔히 정리하기에 좋죠.
              </p>
            </div>
          </div>

          <div className="bw-project-create-footer">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!coerceTrimmedString(name, '') || submitting}
              className="bw-btn-primary bw-project-create-submit"
              aria-label="프로젝트 만들기"
            >
              {submitting ? '만드는 중...' : '프로젝트 만들기'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectCreateModal;
