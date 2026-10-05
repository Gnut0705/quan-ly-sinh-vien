import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Quy đổi điểm 10 sang điểm chữ
 */
const getLetterGrade = (score) => {
  if (score === null || score === undefined || score === '') return null;
  const s = Number(score);
  if (s >= 8.5) return 'A';
  if (s >= 7.0) return 'B';
  if (s >= 5.5) return 'C';
  if (s >= 4.0) return 'D';
  return 'F';
};

const GradeTable = ({
  grades = [],
  loading = false,
  sortBy = 'id',
  order = 'DESC',
  onSort,
  onEdit,
  onDelete,
  canEdit = false,
}) => {
  const renderSortIndicator = (column) => {
    if (sortBy !== column) {
      return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
    }
    return <span style={{ color: 'var(--primary)', marginLeft: '4px' }}>{order === 'ASC' ? '▲' : '▼'}</span>;
  };

  const renderScoreBadge = (score) => {
    if (score === null || score === undefined || score === '') {
      return (
        <span
          style={{
            color: 'var(--text-light)',
            background: '#f1f5f9',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '12px',
          }}
        >
          Chưa nhập
        </span>
      );
    }

    const s = Number(score);
    let bg = '#fee2e2';
    let color = '#b91c1c';
    let letter = getLetterGrade(s);

    if (s >= 8.5) {
      bg = '#dcfce7';
      color = '#15803d';
    } else if (s >= 7.0) {
      bg = '#dbeafe';
      color = '#1d4ed8';
    } else if (s >= 5.5) {
      bg = '#fef3c7';
      color = '#b45309';
    } else if (s >= 4.0) {
      bg = '#ffedd5';
      color = '#c2410c';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '16px',
          background: bg,
          color: color,
          fontWeight: '700',
          fontSize: '13px',
        }}
      >
        <span>{Number(score).toFixed(1)}</span>
        <span
          style={{
            fontSize: '11px',
            padding: '1px 5px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          {letter}
        </span>
      </span>
    );
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
                Sinh Viên {renderSortIndicator('student_code')}
              </th>
              <th>Lớp</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => onSort('course_name')}
              >
                Môn Học {renderSortIndicator('course_name')}
              </th>
              <th style={{ textAlign: 'center', width: '90px' }}>Tín Chỉ</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center', width: '110px' }}
                onClick={() => onSort('semester')}
              >
                Học Kỳ {renderSortIndicator('semester')}
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center', width: '130px' }}
                onClick={() => onSort('score')}
              >
                Điểm Số {renderSortIndicator('score')}
              </th>
              <th style={{ textAlign: 'center', width: '140px' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div className="spinner spinner-primary"></div>
                  <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Đang tải dữ liệu điểm học phần...
                  </p>
                </td>
              </tr>
            ) : grades.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Chưa có bản ghi điểm
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Không tìm thấy dữ liệu điểm nào phù hợp với bộ lọc hiện tại.
                  </p>
                </td>
              </tr>
            ) : (
              grades.map((grade) => (
                <tr key={grade.id}>
                  {/* Sinh viên */}
                  <td>
                    <div>
                      <Link
                        to={`/students/${grade.student_id}/grades`}
                        style={{
                          fontWeight: '700',
                          color: 'var(--primary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        title="Xem toàn bộ bảng điểm của sinh viên này"
                      >
                        <span>{grade.student_name}</span>
                      </Link>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {grade.student_code}
                      </div>
                    </div>
                  </td>

                  {/* Lớp */}
                  <td>
                    <span className="badge badge-student" style={{ fontSize: '11px' }}>
                      {grade.class_name || 'N/A'}
                    </span>
                  </td>

                  {/* Môn học */}
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                        {grade.course_name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {grade.course_code}
                      </div>
                    </div>
                  </td>

                  {/* Tín chỉ */}
                  <td style={{ textAlign: 'center', fontWeight: '600' }}>
                    {grade.credits} TC
                  </td>

                  {/* Học kỳ */}
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#475569',
                      }}
                    >
                      {grade.semester}
                    </span>
                  </td>

                  {/* Điểm số */}
                  <td style={{ textAlign: 'center' }}>
                    {renderScoreBadge(grade.score)}
                  </td>

                  {/* Thao tác */}
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {/* Xem bảng điểm sinh viên */}
                      <Link
                        to={`/students/${grade.student_id}/grades`}
                        className="btn btn-outline btn-sm"
                        title="Xem toàn bộ bảng điểm sinh viên"
                      >
                        👁️
                      </Link>

                      {/* Nút Sửa và Xóa: Chỉ Admin và Teacher mới thấy */}
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onEdit(grade)}
                            title="Sửa điểm học phần"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                            onClick={() => onDelete(grade)}
                            title="Xóa bản ghi điểm"
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

export default GradeTable;
