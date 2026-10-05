import React from 'react';
import Modal from './Modal';

/**
 * Reusable Confirmation Dialog
 * @param {boolean} isOpen - Trạng thái hiển thị
 * @param {function} onClose - Hủy bỏ
 * @param {function} onConfirm - Xác nhận thực hiện
 * @param {string} title - Tiêu đề hộp thoại
 * @param {string} message - Nội dung cảnh báo
 * @param {string} confirmText - Chữ trên nút xác nhận (VD: 'Xóa vĩnh viễn')
 * @param {string} cancelText - Chữ trên nút hủy (VD: 'Hủy bỏ')
 * @param {boolean} isDanger - Phong cách nút nguy hiểm (đỏ)
 * @param {boolean} loading - Trạng thái đang xử lý
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này không?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isDanger = true,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="480px">
      <div style={{ padding: '8px 0 16px 0' }}>
        <p style={{ color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.6' }}>
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>Đang xử lý...</span>
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
