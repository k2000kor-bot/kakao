/**
 * 소스 추가 모달 — 참조 디자인: 드래그 영역 + 업로드/텍스트 입력/Google 드라이브/Slack
 * 프로젝트 생성·관리 플로우의 소스 추가 단계용.
 */
import React, { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AddSourceModal.css';

export interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 업로드 클릭 시 (파일 추가 → 프로젝트 설정 모달 등으로 이어질 수 있음) */
  onUploadClick?: () => void;
  /** 텍스트 입력 클릭 시 */
  onTextInputClick?: () => void;
  /** Google 드라이브 연동 (준비 중) */
  onGoogleDriveClick?: () => void;
  /** Slack 연동 (준비 중) */
  onSlackClick?: () => void;
  /** 드래그 앤 드롭으로 파일 선택 시 */
  onFilesSelected?: (files: File[]) => void;
}

const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onUploadClick,
  onTextInputClick,
  onGoogleDriveClick,
  onSlackClick,
  onFilesSelected,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length && onFilesSelected) onFilesSelected(files);
    else if (files.length && onUploadClick) onUploadClick();
  };

  const handleUploadClick = () => {
    if (onFilesSelected) {
      fileInputRef.current?.click();
      return;
    }
    onClose();
    onUploadClick?.();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length && onFilesSelected) onFilesSelected(files);
  };

  const handleTextInputClick = () => {
    if (onTextInputClick) {
      onClose();
      onTextInputClick();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="add-source-modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-source-modal-title"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="add-source-modal-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="add-source-modal-header">
            <h2 id="add-source-modal-title" className="add-source-modal-title">
              소스 추가
            </h2>
            <button type="button" onClick={onClose} className="add-source-modal-close" aria-label="닫기">
              <X size={20} aria-hidden />
            </button>
          </div>

          <div
            className={`add-source-modal-dropzone ${isDragOver ? 'is-drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="add-source-modal-dropzone-icon" aria-hidden>
              📄+
            </span>
            <p className="add-source-modal-dropzone-text">여기에 소스를 드래그하세요</p>
          </div>

          <div className="add-source-modal-actions">
            <button
              type="button"
              className="add-source-modal-action-btn"
              onClick={handleUploadClick}
              aria-label="파일 업로드"
            >
              <Upload size={24} aria-hidden />
              <span>업로드</span>
            </button>
            <button
              type="button"
              className="add-source-modal-action-btn"
              onClick={handleTextInputClick}
              aria-label="텍스트 입력"
            >
              <FileText size={24} aria-hidden />
              <span>텍스트 입력</span>
            </button>
            <button
              type="button"
              className="add-source-modal-action-btn"
              onClick={() => (onGoogleDriveClick ? onGoogleDriveClick() : onClose())}
              aria-label="Google 드라이브"
            >
              <span className="add-source-modal-drive-icon" aria-hidden />
              <span>Google 드라이브</span>
            </button>
            <button
              type="button"
              className="add-source-modal-action-btn"
              onClick={() => (onSlackClick ? onSlackClick() : onClose())}
              aria-label="Slack"
            >
              <span className="add-source-modal-slack-icon" aria-hidden />
              <span>Slack</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="add-source-modal-file-input"
            accept=".pdf,.doc,.docx,.txt,.csv,.md,.xlsx,.xls,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.js,.ts,.tsx,.jsx,.json,.html,.css"
            onChange={handleFileChange}
            aria-hidden
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddSourceModal;
