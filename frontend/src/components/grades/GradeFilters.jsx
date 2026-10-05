import React from 'react';
import SearchableSelect from '../common/SearchableSelect';

const GradeFilters = ({
  studentFilter,
  onStudentFilterChange,
  courseFilter,
  onCourseFilterChange,
  semesterFilter,
  onSemesterFilterChange,
  availableStudents = [],
  availableCourses = [],
  availableSemesters = [],
  onAddNew,
  canEdit = false,
  isStudent = false,
}) => {
  const studentOptions = [
    { value: '', label: '-- Tất cả sinh viên --' },
    ...availableStudents.map((s) => ({
      value: s.id,
      label: `${s.student_code} - ${s.full_name}`,
      subLabel: s.class_name ? `Lớp ${s.class_name}` : '',
    })),
  ];

  const courseOptions = [
    { value: '', label: '-- Tất cả môn học --' },
    ...availableCourses.map((c) => ({
      value: c.id,
      label: `${c.course_code} - ${c.course_name}`,
      subLabel: `${c.credits} tín chỉ`,
    })),
  ];

  const hasActiveFilters = Boolean(studentFilter || courseFilter || semesterFilter);

  return (
    <div className="card filters-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap', minWidth: '300px' }}>
          {/* Lọc theo sinh viên (Ẩn với role student vì student chỉ xem của mình) */}
          {!isStudent && (
            <div style={{ width: '260px' }}>
              <SearchableSelect
                options={studentOptions}
                value={studentFilter}
                onChange={onStudentFilterChange}
                placeholder="-- Tất cả sinh viên --"
                searchPlaceholder="Tìm mã hoặc tên sinh viên..."
              />
            </div>
          )}

          {/* Lọc theo môn học */}
          <div style={{ width: '240px' }}>
            <SearchableSelect
              options={courseOptions}
              value={courseFilter}
              onChange={onCourseFilterChange}
              placeholder="-- Tất cả môn học --"
              searchPlaceholder="Tìm mã hoặc tên môn..."
            />
          </div>

          {/* Lọc theo học kỳ */}
          <div style={{ width: '160px' }}>
            <select
              className="form-select"
              value={semesterFilter}
              onChange={(e) => onSemesterFilterChange(e.target.value)}
            >
              <option value="">-- Tất cả học kỳ --</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  Học kỳ {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Nút đặt lại */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                onStudentFilterChange('');
                onCourseFilterChange('');
                onSemesterFilterChange('');
              }}
              title="Đặt lại bộ lọc"
            >
              🔄 Đặt lại
            </button>
          )}
        </div>

        {/* Right: Nhập điểm mới (Admin và Teacher) */}
        {canEdit && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddNew}
            style={{ whiteSpace: 'nowrap' }}
          >
            ➕ Nhập Điểm Học Phần
          </button>
        )}
      </div>
    </div>
  );
};

export default GradeFilters;
