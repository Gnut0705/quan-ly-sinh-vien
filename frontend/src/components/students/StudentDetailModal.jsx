import React from 'react';
import Modal from '../common/Modal';

const StudentDetailModal = ({ isOpen, onClose, student }) => {
  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hồ Sơ Sinh Viên: ${student.full_name} (${student.student_code})`}
      maxWidth="700px"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px', background: '#f8fafc', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Mã sinh viên</span>
          <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>{student.student_code}</strong>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Họ và tên</span>
          <strong>{student.full_name}</strong>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Lớp sinh hoạt</span>
          <span className="badge badge-student">{student.class_name}</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Khoa / Viện</span>
          <span>{student.faculty}</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Niên khóa</span>
          <span>{student.school_year}</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Ngày sinh</span>
          <span>{student.dob}</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Giới tính</span>
          <span>{student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Email liên hệ</span>
          <span>{student.email}</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Số điện thoại</span>
          <span>{student.phone || 'Chưa cập nhật'}</span>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Địa chỉ</span>
          <span>{student.address || 'Chưa cập nhật'}</span>
        </div>
      </div>

      {/* Transcript Section */}
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>📊 Bảng Điểm Các Môn Học ({student.grades?.length || 0})</span>
        </h4>

        {student.grades && student.grades.length > 0 ? (
          <div className="table-container">
            <table className="data-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Mã HP</th>
                  <th>Tên môn học</th>
                  <th>Số tín chỉ</th>
                  <th>Học kỳ</th>
                  <th style={{ textAlign: 'center' }}>Điểm số</th>
                </tr>
              </thead>
              <tbody>
                {student.grades.map((g) => (
                  <tr key={g.enrollment_id}>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{g.course_code}</strong>
                    </td>
                    <td>{g.course_name}</td>
                    <td>{g.credits} TC</td>
                    <td>{g.semester}</td>
                    <td style={{ textAlign: 'center' }}>
                      {g.score !== null ? (
                        <span
                          style={{
                            fontWeight: '700',
                            color: Number(g.score) >= 7.0 ? 'var(--success)' : Number(g.score) >= 5.0 ? 'var(--warning)' : 'var(--danger)',
                          }}
                        >
                          {g.score}
                        </span>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Đang học</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
            Sinh viên chưa đăng ký hoặc chưa có điểm học phần nào.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Đóng
        </button>
      </div>
    </Modal>
  );
};

export default StudentDetailModal;
