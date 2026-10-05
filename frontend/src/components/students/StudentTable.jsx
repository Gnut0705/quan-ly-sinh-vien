import React from 'react';

const StudentTable = ({
  students = [],
  loading = false,
  sortBy = 'id',
  order = 'DESC',
  onSort,
  onViewDetail,
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
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => onSort('student_code')}
              >
                Mã SV {renderSortIndicator('student_code')}
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => onSort('full_name')}
              >
                Họ và Tên {renderSortIndicator('full_name')}
              </th>
              <th>Lớp</th>
              <th>Khoa</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => onSort('dob')}
              >
                Ngày sinh {renderSortIndicator('dob')}
              </th>
              <th>Giới tính</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div className="spinner spinner-primary"></div>
                  <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Đang đồng bộ dữ liệu sinh viên...
                  </p>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Chưa có sinh viên
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Không tìm thấy bản ghi sinh viên nào phù hợp với điều kiện tìm kiếm.
                  </p>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {student.student_code}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                          color: '#4338ca',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '12px',
                        }}
                      >
                        {student.full_name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600' }}>{student.full_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-student">{student.class_name}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {student.faculty}
                  </td>
                  <td>{student.dob}</td>
                  <td>
                    {student.gender === 'male' ? (
                      <span style={{ color: '#2563eb' }}>Nam</span>
                    ) : student.gender === 'female' ? (
                      <span style={{ color: '#db2777' }}>Nữ</span>
                    ) : (
                      <span>Khác</span>
                    )}
                  </td>
                  <td>{student.email}</td>
                  <td>{student.phone || <span style={{ color: 'var(--text-light)' }}>-</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => onViewDetail(student.id)}
                        title="Xem chi tiết & bảng điểm"
                      >
                        👁️
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onEdit(student)}
                            title="Sửa thông tin sinh viên"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                            onClick={() => onDelete(student)}
                            title="Xóa sinh viên"
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

export default StudentTable;
