import { useEffect, useRef } from 'react';

interface UseModalCloseProps {
    isOpen: boolean;
    onClose: () => void;
    preventClose?: boolean;
    showConfirm?: boolean;
    confirmMessage?: string;
}

export const useModalClose = ({
    isOpen,
    onClose,
    preventClose = false,
    showConfirm = false,
    confirmMessage = '변경사항이 저장되지 않습니다. 정말로 닫으시겠습니까?'
}: UseModalCloseProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        if (preventClose) {
            return;
        }

        if (showConfirm) {
            if (window.confirm(confirmMessage)) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !preventClose) {
                handleClose();
            }
        };

        const handleBackgroundClick = (e: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target as Node) &&
                isOpen &&
                !preventClose
            ) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleBackgroundClick);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleBackgroundClick);
        };
    }, [isOpen, onClose, preventClose, showConfirm, confirmMessage]);

    return { modalRef, handleClose };
}; 