import React from 'react';

const CourseTable = ({
  courses = [],
  loading = false,
  sortBy = 'id',
  order = 'DESC',
  onSort,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  const renderSortIndicator = (column) => {
    if (sortBy !== column) {
      return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
    }
    return <span style={{ color: 'var(--primary)', marginLeft: '4px' }}>{order === 'ASC' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
      <div className="table-container" style={{ border: 'none' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', width: '180px' }}
                onClick={() => onSort('course_code')}
              >
                Mã Môn Học {renderSortIndicator('course_code')}
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => onSort('course_name')}
              >
                Tên Môn Học {renderSortIndicator('course_name')}
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', width: '160px', textAlign: 'center' }}
                onClick={() => onSort('credits')}
              >
                Số Tín Chỉ {renderSortIndicator('credits')}
              </th>
              {isAdmin && (
                <th style={{ textAlign: 'center', width: '150px' }}>Thao Tác</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div className="spinner spinner-primary"></div>
                  <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Đang tải danh sách môn học...
                  </p>
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Chưa có môn học
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Không tìm thấy môn học nào phù hợp với từ khóa tìm kiếm.
                  </p>
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id}>
                  {/* Mã môn học */}
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        fontSize: '14px',
                        color: 'var(--primary)',
                        background: 'rgba(99, 102, 241, 0.08)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}
                    >
                      {course.course_code}
                    </span>
                  </td>

                  {/* Tên môn học */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📖</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                        {course.course_name}
                      </span>
                    </div>
                  </td>

                  {/* Số tín chỉ */}
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: '16px',
                        fontWeight: '700',
                        fontSize: '13px',
                        background:
                          course.credits >= 4
                            ? '#fef3c7'
                            : course.credits >= 3
                            ? '#dbeafe'
                            : '#f1f5f9',
                        color:
                          course.credits >= 4
                            ? '#b45309'
                            : course.credits >= 3
                            ? '#1d4ed8'
                            : '#475569',
                      }}
                    >
                      {course.credits} TC
                    </span>
                  </td>

                  {/* Thao tác (Chỉ Admin) */}
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onEdit(course)}
                          title="Chỉnh sửa môn học"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                          onClick={() => onDelete(course)}
                          title="Xóa môn học"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTable;
