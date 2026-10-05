import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_CODE_REGEX = /^[A-Za-z0-9_-]{4,20}$/;
const PHONE_REGEX = /^[0-9+() -]{9,20}$/;

const StudentForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  classes = [],
  loading = false,
  serverFieldErrors = {},
}) => {
  const isEditMode = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    student_code: '',
    full_name: '',
    dob: '',
    gender: 'male',
    email: '',
    phone: '',
    address: '',
    class_id: '',
  });

  const [clientErrors, setClientErrors] = useState({});

  // Nạp dữ liệu ban đầu khi mở modal
  useEffect(() => {
    if (initialData) {
      setFormData({
        student_code: initialData.student_code || '',
        full_name: initialData.full_name || '',
        dob: initialData.dob || '',
        gender: initialData.gender || 'male',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        class_id: initialData.class_id || '',
      });
    } else {
      setFormData({
        student_code: '',
        full_name: '',
        dob: '',
        gender: 'male',
        email: '',
        phone: '',
        address: '',
        class_id: classes[0]?.id || '',
      });
    }
    setClientErrors({});
  }, [initialData, classes, isOpen]);

  // Kết hợp lỗi client và lỗi từ server (lỗi server ưu tiên hiển thị)
  const getFieldError = (field) => {
    return serverFieldErrors[field] || clientErrors[field];
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'student_code':
        if (!value || !value.trim()) {
          error = 'Mã sinh viên là bắt buộc.';
        } else if (!STUDENT_CODE_REGEX.test(value.trim())) {
          error = 'Mã SV từ 4 đến 20 ký tự (chữ, số, gạch nối hoặc gạch dưới).';
        }
        break;

      case 'full_name':
        if (!value || !value.trim()) {
          error = 'Họ và tên là bắt buộc.';
        } else if (value.trim().length < 2 || value.trim().length > 100) {
          error = 'Họ và tên phải từ 2 đến 100 ký tự.';
        }
        break;

      case 'dob':
        if (!value) {
          error = 'Ngày sinh là bắt buộc.';
        } else {
          const parsed = new Date(value);
          if (isNaN(parsed.getTime()) || parsed > new Date()) {
            error = 'Ngày sinh không hợp lệ hoặc lớn hơn ngày hiện tại.';
          }
        }
        break;

      case 'email':
        if (!value || !value.trim()) {
          error = 'Email là bắt buộc.';
        } else if (!EMAIL_REGEX.test(value.trim())) {
          error = 'Định dạng email không hợp lệ (VD: sv@school.edu.vn).';
        }
        break;

      case 'phone':
        if (value && value.trim() && !PHONE_REGEX.test(value.trim())) {
          error = 'Số điện thoại không đúng định dạng (9 - 15 số).';
        }
        break;

      case 'class_id':
        if (!value) {
          error = 'Vui lòng chọn lớp học cho sinh viên.';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'student_code' ? value.toUpperCase() : value,
    }));

    // Xóa lỗi khi người dùng gõ
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate toàn bộ các trường
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) errors[key] = err;
    });

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Cập Nhật Sinh Viên: ${initialData.student_code}` : 'Thêm Sinh Viên Mới'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Mã sinh viên */}
          <div className="form-group">
            <label className="form-label" htmlFor="student_code">
              Mã sinh viên <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="student_code"
              name="student_code"
              type="text"
              className={`form-input ${getFieldError('student_code') ? 'input-error' : ''}`}
              placeholder="VD: SV20220099"
              value={formData.student_code}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
            {getFieldError('student_code') && (
              <span className="field-error-text">{getFieldError('student_code')}</span>
            )}
          </div>

          {/* Họ và tên */}
          <div className="form-group">
            <label className="form-label" htmlFor="full_name">
              Họ và tên sinh viên <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              className={`form-input ${getFieldError('full_name') ? 'input-error' : ''}`}
              placeholder="VD: Nguyễn Văn Nam"
              value={formData.full_name}
              onChange={handleChange}
              disabled={loading}
            />
            {getFieldError('full_name') && (
              <span className="field-error-text">{getFieldError('full_name')}</span>
            )}
          </div>

          {/* Ngày sinh */}
          <div className="form-group">
            <label className="form-label" htmlFor="dob">
              Ngày sinh <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              className={`form-input ${getFieldError('dob') ? 'input-error' : ''}`}
              value={formData.dob}
              onChange={handleChange}
              disabled={loading}
            />
            {getFieldError('dob') && (
              <span className="field-error-text">{getFieldError('dob')}</span>
            )}
          </div>

          {/* Giới tính */}
          <div className="form-group">
            <label className="form-label" htmlFor="gender">
              Giới tính <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              id="gender"
              name="gender"
              className="form-select"
              value={formData.gender}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Địa chỉ Email <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${getFieldError('email') ? 'input-error' : ''}`}
              placeholder="VD: nam.nv@student.edu.vn"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {getFieldError('email') && (
              <span className="field-error-text">{getFieldError('email')}</span>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Số điện thoại
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={`form-input ${getFieldError('phone') ? 'input-error' : ''}`}
              placeholder="VD: 0912345678"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
            {getFieldError('phone') && (
              <span className="field-error-text">{getFieldError('phone')}</span>
            )}
          </div>

          {/* Lớp sinh hoạt */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="class_id">
              Lớp sinh hoạt trực thuộc <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              id="class_id"
              name="class_id"
              className={`form-select ${getFieldError('class_id') ? 'input-error' : ''}`}
              value={formData.class_id}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">-- Vui lòng chọn lớp --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} — Khoa {cls.faculty} ({cls.school_year})
                </option>
              ))}
            </select>
            {getFieldError('class_id') && (
              <span className="field-error-text">{getFieldError('class_id')}</span>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="address">
              Địa chỉ thường trú
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="form-input"
              placeholder="VD: Cầu Giấy, Hà Nội"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy bỏ
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
              'Cập Nhật Thông Tin'
            ) : (
              'Thêm Mới Sinh Viên'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentForm;
