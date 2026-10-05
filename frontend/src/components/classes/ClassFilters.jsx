import React from 'react';

const COMMON_FACULTIES = [
  'Công nghệ thông tin',
  'Khoa học máy tính',
  'Kinh tế & Quản trị',
  'Điện tử viễn thông',
  'Ngoại ngữ',
  'Cơ khí & Kỹ thuật',
];

const COMMON_SCHOOL_YEARS = [
  '2020-2024',
  '2021-2025',
  '2022-2026',
  '2023-2027',
  '2024-2028',
  '2025-2029',
];

const ClassFilters = ({
  search,
  onSearchChange,
  facultyFilter,
  onFacultyFilterChange,
  schoolYearFilter,
  onSchoolYearFilterChange,
  availableFaculties = [],
  availableSchoolYears = [],
  onAddNew,
  isAdmin = false,
}) => {
  // Kết hợp danh sách gợi ý sẵn có và danh sách thực tế từ database
  const facultyOptions = Array.from(
    new Set([...COMMON_FACULTIES, ...availableFaculties.filter(Boolean)])
  );
  const schoolYearOptions = Array.from(
    new Set([...COMMON_SCHOOL_YEARS, ...availableSchoolYears.filter(Boolean)])
  );

  const hasActiveFilters = Boolean(search || facultyFilter || schoolYearFilter);

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
        {/* Left: Search input and dropdown filters */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap', minWidth: '280px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', paddingRight: search ? '36px' : '14px' }}
              placeholder="Tìm theo tên lớp học..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                }}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Faculty Filter */}
          <div style={{ width: '200px' }}>
            <select
              className="form-select"
              value={facultyFilter}
              onChange={(e) => onFacultyFilterChange(e.target.value)}
            >
              <option value="">-- Tất cả Khoa / Viện --</option>
              {facultyOptions.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          {/* School Year Filter */}
          <div style={{ width: '170px' }}>
            <select
              className="form-select"
              value={schoolYearFilter}
              onChange={(e) => onSchoolYearFilterChange(e.target.value)}
            >
              <option value="">-- Tất cả Niên khóa --</option>
              {schoolYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                onSearchChange('');
                onFacultyFilterChange('');
                onSchoolYearFilterChange('');
              }}
              title="Đặt lại bộ lọc"
            >
              🔄 Đặt lại
            </button>
          )}
        </div>

        {/* Right: Add New Class Button (Admin Only) */}
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddNew}
            style={{ whiteSpace: 'nowrap' }}
          >
            ➕ Thêm Lớp Học Mới
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassFilters;
