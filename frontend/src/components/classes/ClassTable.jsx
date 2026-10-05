import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ClassTable = ({
  classes = [],
  loading = false,
  sortBy = 'id',
  order = 'DESC',
  onSort,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  const navigate = useNavigate();

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
                style={{ cursor: 'pointer', userSelect: 'none', width: '220px' }}
                onClick={() => onSort('class_name')}
              >
                Tên Lớp {renderSortIndicator('class_name')}
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => onSort('faculty')}
              >
                Khoa / Viện {renderSortIndicator('faculty')}
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', width: '160px' }}
                onClick={() => onSort('school_year')}
              >
                Niên Khóa {renderSortIndicator('school_year')}
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center', width: '150px' }}
                onClick={() => onSort('student_count')}
              >
                Số Sinh Viên {renderSortIndicator('student_count')}
              </th>
              <th style={{ textAlign: 'center', width: '160px' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div className="spinner spinner-primary"></div>
                  <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Đang tải danh sách lớp học...
                  </p>
                </td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏫</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Chưa có lớp học
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Không tìm thấy lớp học nào phù hợp với điều kiện tìm kiếm và bộ lọc.
                  </p>
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id}>
                  {/* Clickable Class Name */}
                  <td>
                    <Link
                      to={`/classes/${cls.id}`}
                      style={{
                        textDecoration: 'none',
                        color: 'var(--primary)',
                        fontWeight: '700',
                        fontSize: '15px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      title="Xem danh sách sinh viên lớp này"
                    >
                      <span>🏫</span>
                      <span style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                        {cls.class_name}
                      </span>
                    </Link>
                  </td>

                  {/* Faculty */}
                  <td style={{ fontWeight: '500' }}>
                    {cls.faculty}
                  </td>

                  {/* School Year */}
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      {cls.school_year}
                    </span>
                  </td>

                  {/* Student Count */}
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className={`badge ${
                        Number(cls.student_count) > 0 ? 'badge-student' : 'badge-teacher'
                      }`}
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                    >
                      👥 {cls.student_count || 0} SV
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {/* Xem chi tiết sinh viên của lớp */}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/classes/${cls.id}`)}
                        title="Xem danh sách sinh viên"
                      >
                        👁️
                      </button>

                      {/* Nút Sửa và Xóa: Chỉ Admin mới thấy */}
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onEdit(cls)}
                            title="Chỉnh sửa thông tin lớp"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                            onClick={() => onDelete(cls)}
                            title="Xóa lớp học"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassTable;
