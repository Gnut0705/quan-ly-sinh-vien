import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const COURSE_CODE_REGEX = /^[A-Za-z0-9_-]{2,20}$/;

const CourseForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
  serverFieldErrors = {},
}) => {
  const isEditMode = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    credits: 3,
  });

  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        course_code: initialData.course_code || '',
        course_name: initialData.course_name || '',
        credits: initialData.credits !== undefined ? Number(initialData.credits) : 3,
      });
    } else {
      setFormData({
        course_code: '',
        course_name: '',
        credits: 3,
      });
    }
    setClientErrors({});
  }, [initialData, isOpen]);

  // Lấy lỗi cho từng trường (ưu tiên hiển thị lỗi từ server)
  const getFieldError = (field) => {
    return serverFieldErrors[field] || clientErrors[field];
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'course_code':
        if (!value || !value.toString().trim()) {
          error = 'Mã môn học là bắt buộc.';
        } else if (!COURSE_CODE_REGEX.test(value.toString().trim())) {
          error = 'Mã môn từ 2 đến 20 ký tự (chữ cái, chữ số, gạch nối hoặc gạch dưới).';
        }
        break;

      case 'course_name':
        if (!value || !value.toString().trim()) {
          error = 'Tên môn học là bắt buộc.';
        } else if (value.toString().trim().length < 2 || value.toString().trim().length > 100) {
          error = 'Tên môn học phải từ 2 đến 100 ký tự.';
        }
        break;

      case 'credits': {
        const num = Number(value);
        if (value === '' || value === null || value === undefined) {
          error = 'Số tín chỉ là bắt buộc.';
        } else if (!Number.isInteger(num)) {
          error = 'Số tín chỉ phải là một số nguyên.';
        } else if (num < 1 || num > 6) {
          error = 'Số tín chỉ phải từ 1 đến 6 tín chỉ.';
        }
        break;
      }

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalVal = name === 'course_code' ? value.toUpperCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'credits' ? (value === '' ? '' : Number(value)) : finalVal,
    }));

    // Xóa thông báo lỗi khi người dùng thay đổi dữ liệu
    if (clientErrors[name] || serverFieldErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setClientErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate toàn bộ các trường
    const errors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    onSubmit({
      course_code: formData.course_code.toString().trim(),
      course_name: formData.course_name.toString().trim(),
      credits: Number(formData.credits),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh Sửa Thông Tin Môn Học' : 'Thêm Môn Học Mới'}
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Mã môn học */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="course_code">
            Mã môn học <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            id="course_code"
            name="course_code"
            className={`form-input ${getFieldError('course_code') ? 'is-invalid' : ''}`}
            placeholder="VD: INT1001, CS102, BAS1203..."
            value={formData.course_code}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '600' }}
          />
          {getFieldError('course_code') && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              {getFieldError('course_code')}
            </div>
          )}
          <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px', display: 'block' }}>
            Mã môn học là duy nhất trong hệ thống đào tạo.
          </small>
        </div>

        {/* Tên môn học */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="course_name">
            Tên môn học <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            id="course_name"
            name="course_name"
            className={`form-input ${getFieldError('course_name') ? 'is-invalid' : ''}`}
            placeholder="VD: Nhập môn Lập trình, Cơ sở dữ liệu..."
            value={formData.course_name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          {getFieldError('course_name') && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              {getFieldError('course_name')}
            </div>
          )}
        </div>

        {/* Số tín chỉ */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" htmlFor="credits">
            Số tín chỉ (1 - 6) <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="number"
            id="credits"
            name="credits"
            min="1"
            max="6"
            step="1"
            className={`form-input ${getFieldError('credits') ? 'is-invalid' : ''}`}
            placeholder="Nhập số tín chỉ (1 đến 6)"
            value={formData.credits}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          {getFieldError('credits') && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              {getFieldError('credits')}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                className={`btn btn-sm ${Number(formData.credits) === num ? 'btn-primary' : 'btn-outline'}`}
                style={{ minWidth: '40px', padding: '4px 8px', fontSize: '12px' }}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, credits: num }));
                  if (clientErrors.credits) setClientErrors((prev) => ({ ...prev, credits: '' }));
                }}
                disabled={loading}
              >
                {num} TC
              </button>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Đang lưu...</span>
              </>
            ) : isEditMode ? (
              'Cập Nhật Môn Học'
            ) : (
              'Thêm Môn Học Mới'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CourseForm;
