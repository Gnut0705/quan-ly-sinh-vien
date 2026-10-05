import React from 'react';

const CourseFilters = ({
  search,
  onSearchChange,
  onAddNew,
  isAdmin = false,
}) => {
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
        {/* Left: Search input */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap', minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
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
              placeholder="Tìm theo mã hoặc tên môn học (VD: INT1001, Cơ sở dữ liệu)..."
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

          {/* Reset Filters button */}
          {search && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onSearchChange('')}
              title="Đặt lại tìm kiếm"
            >
              🔄 Đặt lại
            </button>
          )}
        </div>

        {/* Right: Add New Course Button (Admin Only) */}
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddNew}
            style={{ whiteSpace: 'nowrap' }}
          >
            ➕ Thêm Môn Học Mới
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseFilters;
