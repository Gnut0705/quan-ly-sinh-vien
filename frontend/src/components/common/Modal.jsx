import React, { useEffect } from 'react';

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {function} onClose - Hàm gọi khi đóng modal
 * @param {string} title - Tiêu đề modal
 * @param {string} maxWidth - Chiều rộng tối đa (mặc định: '600px')
 * @param {ReactNode} children - Nội dung bên trong modal
 */
const Modal = ({ isOpen, onClose, title, maxWidth = '650px', children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Đóng modal"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
