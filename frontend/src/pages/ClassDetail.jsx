import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClasses } from '../hooks/useClasses';
import { useToast } from '../context/ToastContext';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getClassStudents } = useClasses();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      const res = await getClassStudents(id);

      if (!isMounted) return;

      if (res.success) {
        setClassInfo(res.classInfo);
        setStudents(res.data || []);
      } else {
        setError(res.message);
        toast.error(res.message || 'Không thể tải danh sách sinh viên của lớp.');
      }
      setLoading(false);
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div>
      {/* Top Navigation & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/classes')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ← Quay lại danh sách lớp
        </button>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          <Link to="/classes" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Lớp học
          </Link>{' '}
          / <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{classInfo?.class_name || `Lớp #${id}`}</span>
        </div>
      </div>

      {/* Class Overview Banner Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 244, 255, 0.85))',
          border: '1px solid rgba(99, 102, 241, 0.15)',
        }}
      >
        {loading && !classInfo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="spinner spinner-primary"></div>
            <span>Đang tải thông tin lớp học...</span>
          </div>
        ) : error && !classInfo ? (
          <div style={{ color: 'var(--danger)' }}>
            ⚠️ {error}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                }}
              >
                🏫
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {classInfo?.class_name}
                </h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <span>
                    🏛️ Khoa: <strong style={{ color: 'var(--text-main)' }}>{classInfo?.faculty}</strong>
                  </span>
                  <span>
                    📅 Niên khóa: <strong style={{ color: 'var(--text-main)' }}>{classInfo?.school_year}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.06)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Tổng Số Sinh Viên
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>
                {students.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Class Students Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
            Danh Sách Sinh Viên Trực Thuộc ({students.length})
          </h3>
          <Link to="/students" className="btn btn-outline btn-sm">
            Quản lý tất cả sinh viên →
          </Link>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                <th style={{ width: '140px' }}>Mã SV</th>
                <th>Họ và Tên</th>
                <th style={{ width: '120px' }}>Ngày Sinh</th>
                <th style={{ width: '100px' }}>Giới Tính</th>
                <th>Email</th>
                <th style={{ width: '140px' }}>Số Điện Thoại</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <div className="spinner spinner-primary"></div>
                    <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                      Đang tải danh sách sinh viên lớp {classInfo?.class_name || ''}...
                    </p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '44px', marginBottom: '12px' }}>👨‍🎓</div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                      Lớp này chưa có sinh viên nào
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      Bạn có thể chuyển sinh viên sang lớp này hoặc thêm mới từ trang Quản lý Sinh viên.
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student.id}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {index + 1}
                    </td>
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
                          {student.full_name?.charAt(0) || 'S'}
                        </div>
                        <span style={{ fontWeight: '600' }}>{student.full_name}</span>
                      </div>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;
