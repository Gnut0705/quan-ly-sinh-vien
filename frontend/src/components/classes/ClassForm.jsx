import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const SUGGESTED_FACULTIES = [
  'Công nghệ thông tin',
  'Khoa học máy tính',
  'Kinh tế & Quản trị',
  'Điện tử viễn thông',
  'Ngoại ngữ',
  'Cơ khí & Kỹ thuật',
];

const SUGGESTED_YEARS = [
  '2021-2025',
  '2022-2026',
  '2023-2027',
  '2024-2028',
  '2025-2029',
];

const ClassForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
  serverFieldErrors = {},
}) => {
  const isEditMode = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    class_name: '',
    faculty: '',
    school_year: '',
  });

  const [clientErrors, setClientErrors] = useState({});

  // Reset or fill form upon opening
  useEffect(() => {
    if (initialData) {
      setFormData({
        class_name: initialData.class_name || '',
        faculty: initialData.faculty || '',
        school_year: initialData.school_year || '',
      });
    } else {
      setFormData({
        class_name: '',
        faculty: SUGGESTED_FACULTIES[0] || '',
        school_year: '2023-2027',
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
      case 'class_name':
        if (!value || !value.trim()) {
          error = 'Tên lớp học là bắt buộc.';
        } else if (value.trim().length < 2 || value.trim().length > 50) {
          error = 'Tên lớp phải từ 2 đến 50 ký tự.';
        }
        break;

      case 'faculty':
        if (!value || !value.trim()) {
          error = 'Khoa / Viện đào tạo là bắt buộc.';
        } else if (value.trim().length < 2 || value.trim().length > 100) {
          error = 'Tên khoa / viện phải từ 2 đến 100 ký tự.';
        }
        break;

      case 'school_year':
        if (!value || !value.trim()) {
          error = 'Niên khóa là bắt buộc.';
        } else if (value.trim().length < 4 || value.trim().length > 20) {
          error = 'Niên khóa không hợp lệ (VD: 2021-2025).';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa lỗi khi người dùng gõ
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

    // Validate toàn bộ các trường trước khi gửi
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

    // Gửi dữ liệu đã được làm sạch khoảng trắng
    onSubmit({
      class_name: formData.class_name.trim(),
      faculty: formData.faculty.trim(),
      school_year: formData.school_year.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh Sửa Thông Tin Lớp Học' : 'Thêm Lớp Học Mới'}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Tên lớp học */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="class_name">
            Tên lớp học <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            id="class_name"
            name="class_name"
            className={`form-input ${getFieldError('class_name') ? 'is-invalid' : ''}`}
            placeholder="VD: CNTT01-K21, DTVT02-K22..."
            value={formData.class_name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          {getFieldError('class_name') && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              {getFieldError('class_name')}
            </div>
          )}
          <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px', display: 'block' }}>
            Tên lớp là duy nhất và đại diện cho tập hợp sinh viên theo niên khóa.
          </small>
        </div>

        {/* Khoa / Viện */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="faculty">
            Khoa / Viện đào tạo <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            id="faculty"
            name="faculty"
            list="faculty-list"
            className={`form-input ${getFieldError('faculty') ? 'is-invalid' : ''}`}
            placeholder="Nhập hoặc chọn khoa quản lý..."
            value={formData.faculty}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          <datalist id="faculty-list">
            {SUGGESTED_FACULTIES.map((fac) => (
              <option key={fac} value={fac} />
            ))}
          </datalist>
          {getFieldError('faculty') && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              {getFieldError('faculty')}
            </div>
          )}
        </div>

        {/* Niên khóa */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" htmlFor="school_year">
            Niên khóa <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            id="school_year"
            name="school_year"
            list="school-year-list"
            className={`form-input ${getFieldError('school_year') ? 'is-invalid' : ''}`}
            placeholder="VD: 2021-2025"
            value={formData.school_year}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          <datalist id="school-year-list">
            {SUGGESTED_YEARS.map((yr) => (
              <option key={yr} value={yr} />
            ))}
          </datalist>
          {getFieldError('school_year') && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              {getFieldError('school_year')}
            </div>
          )}
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
              'Cập Nhật Lớp'
            ) : (
              'Thêm Lớp Mới'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassForm;
