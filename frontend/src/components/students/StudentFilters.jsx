import React from 'react';

const StudentFilters = ({
  search,
  onSearchChange,
  classFilter,
  onClassFilterChange,
  classes = [],
  onAddNew,
  isAdmin = false,
}) => {
  return (
    <div className="card filters-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {/* Left: Search input and Class Dropdown */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap', minWidth: '280px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none' }}>
              🔍
            </span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', paddingRight: search ? '36px' : '14px' }}
              placeholder="Tìm theo tên hoặc mã sinh viên..."
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

          {/* Class Filter */}
          <div style={{ width: '220px' }}>
            <select
              className="form-select"
              value={classFilter}
              onChange={(e) => onClassFilterChange(e.target.value)}
            >
              <option value="">-- Tất cả lớp học --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} ({cls.faculty})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button if active */}
          {(search || classFilter) && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                onSearchChange('');
                onClassFilterChange('');
              }}
              title="Đặt lại bộ lọc"
            >
              🔄 Đặt lại
            </button>
          )}
        </div>

        {/* Right: Add New Student Button (Admin Only) */}
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddNew}
            style={{ whiteSpace: 'nowrap' }}
          >
            ➕ Thêm Sinh Viên Mới
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentFilters;
