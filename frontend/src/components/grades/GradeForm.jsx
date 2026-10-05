import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import SearchableSelect from '../common/SearchableSelect';

const COMMON_SEMESTERS = [
  '2023.1',
  '2023.2',
  '2023.3',
  '2024.1',
  '2024.2',
  '2024.3',
  '2025.1',
  '2025.2',
];

const QUICK_SCORES = [0, 4.0, 5.5, 7.0, 8.5, 9.0, 10.0];

const GradeForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  availableStudents = [],
  availableCourses = [],
  availableSemesters = [],
  loading = false,
  serverFieldErrors = {},
}) => {
  const isEditMode = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    semester: '2023.1',
    score: '',
  });

  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id || '',
        course_id: initialData.course_id || '',
        semester: initialData.semester || '2023.1',
        score: initialData.score !== null && initialData.score !== undefined ? initialData.score : '',
      });
    } else {
      setFormData({
        student_id: '',
        course_id: '',
        semester: availableSemesters[0] || '2023.1',
        score: '',
      });
    }
    setClientErrors({});
  }, [initialData, isOpen, availableSemesters]);

  const studentOptions = availableStudents.map((s) => ({
    value: s.id,
    label: `${s.student_code} - ${s.full_name}`,
    subLabel: s.class_name ? `Lớp ${s.class_name}` : '',
  }));

  const courseOptions = availableCourses.map((c) => ({
    value: c.id,
    label: `${c.course_code} - ${c.course_name}`,
    subLabel: `${c.credits} tín chỉ`,
  }));

  const semesterOptions = Array.from(
    new Set([...COMMON_SEMESTERS, ...availableSemesters.filter(Boolean)])
  );

  const getFieldError = (field) => {
    return serverFieldErrors[field] || clientErrors[field];
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'student_id':
        if (!value) {
          error = 'Vui lòng chọn sinh viên.';
        }
        break;

      case 'course_id':
        if (!value) {
          error = 'Vui lòng chọn môn học.';
        }
        break;

      case 'semester':
        if (!value || !value.toString().trim()) {
          error = 'Vui lòng chọn hoặc nhập học kỳ (VD: 2023.1).';
        }
        break;

      case 'score': {
        if (value === '' || value === null || value === undefined) {
          error = 'Điểm số là bắt buộc.';
        } else {
          const num = Number(value);
          if (isNaN(num)) {
            error = 'Điểm số phải là một số.';
          } else if (num < 0 || num > 10) {
            error = 'Điểm số phải nằm trong khoảng từ 0 đến 10.';
          }
        }
        break;
      }

      default:
        break;
    }

    return error;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (clientErrors[field] || serverFieldErrors[field]) {
      setClientErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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
      student_id: Number(formData.student_id),
      course_id: Number(formData.course_id),
      semester: formData.semester.toString().trim(),
      score: formData.score === '' ? null : Number(formData.score),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh Sửa Điểm Học Phần' : 'Nhập Điểm Học Phần Mới'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Banner hiển thị lỗi trùng lặp từ server (nếu có 409) */}
        {serverFieldErrors.duplicate && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <div>{serverFieldErrors.duplicate}</div>
          </div>
        )}

        {/* Chọn sinh viên (Dropdown có tìm kiếm) */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="student_id">
            Sinh viên <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <SearchableSelect
            id="student_id"
            options={studentOptions}
            value={formData.student_id}
            onChange={(val) => handleChange('student_id', val)}
            placeholder="-- Tìm kiếm và chọn sinh viên --"
            searchPlaceholder="Gõ mã hoặc tên sinh viên..."
            disabled={loading}
            error={getFieldError('student_id')}
          />
        </div>

        {/* Chọn môn học (Dropdown có tìm kiếm) */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="course_id">
            Môn học / Học phần <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <SearchableSelect
            id="course_id"
            options={courseOptions}
            value={formData.course_id}
            onChange={(val) => handleChange('course_id', val)}
            placeholder="-- Tìm kiếm và chọn môn học --"
            searchPlaceholder="Gõ mã hoặc tên môn học..."
            disabled={loading}
            error={getFieldError('course_id')}
          />
        </div>

        {/* Học kỳ */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="semester">
            Học kỳ <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            id="semester"
            name="semester"
            list="semester-form-list"
            className={`form-input ${getFieldError('semester') ? 'is-invalid' : ''}`}
            placeholder="VD: 2023.1, 2023.2, 2024.1..."
            value={formData.semester}
            onChange={(e) => handleChange('semester', e.target.value)}
            disabled={loading}
          />
          <datalist id="semester-form-list">
            {semesterOptions.map((sem) => (
              <option key={sem} value={sem} />
            ))}
          </datalist>
          {getFieldError('semester') && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              {getFieldError('semester')}
            </div>
          )}
          <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px', display: 'block' }}>
            Định dạng thông thường: [Năm học].[Kỳ], ví dụ: 2023.1, 2023.2, 2024.1
          </small>
        </div>

        {/* Điểm số (0 - 10) */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" htmlFor="score">
            Điểm số thang 10 (0 - 10) <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="number"
            id="score"
            name="score"
            min="0"
            max="10"
            step="0.1"
            className={`form-input ${getFieldError('score') ? 'is-invalid' : ''}`}
            placeholder="Nhập điểm từ 0.0 đến 10.0"
            value={formData.score}
            onChange={(e) => handleChange('score', e.target.value)}
            disabled={loading}
          />
          {getFieldError('score') && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              {getFieldError('score')}
            </div>
          )}

          {/* Nút chọn nhanh điểm phổ biến */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>
              Chọn nhanh:
            </span>
            {QUICK_SCORES.map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm ${Number(formData.score) === s ? 'btn-primary' : 'btn-outline'}`}
                style={{ minWidth: '38px', padding: '3px 8px', fontSize: '12px' }}
                onClick={() => handleChange('score', s)}
                disabled={loading}
              >
                {s.toFixed(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
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
              'Cập Nhật Điểm'
            ) : (
              'Lưu Điểm Học Phần'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GradeForm;
