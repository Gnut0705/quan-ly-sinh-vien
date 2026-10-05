import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGrades } from '../hooks/useGrades';
import { useToast } from '../context/ToastContext';

const getClassificationBadge = (classification) => {
  let bg = '#f1f5f9';
  let color = '#475569';

  switch (classification) {
    case 'Xuất sắc':
      bg = '#e0e7ff';
      color = '#4338ca';
      break;
    case 'Giỏi':
      bg = '#dcfce7';
      color = '#15803d';
      break;
    case 'Khá':
      bg = '#dbeafe';
      color = '#1d4ed8';
    case 'Trung bình':
      bg = '#fef3c7';
      color = '#b45309';
      break;
    case 'Yếu':
      bg = '#fee2e2';
      color = '#b91c1c';
      break;
    default:
      break;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '16px',
        background: bg,
        color: color,
        fontWeight: '700',
        fontSize: '13px',
      }}
    >
      {classification || 'Chưa xếp loại'}
    </span>
  );
};

const StudentTranscript = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getStudentTranscript } = useGrades();

  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('ALL');

  useEffect(() => {
    let isMounted = true;

    const fetchTranscript = async () => {
      setLoading(true);
      setError(null);
      const res = await getStudentTranscript(id);

      if (!isMounted) return;

      if (res.success) {
        setStudent(res.student);
        setSummary(res.summary);
        setTranscript(res.transcript || []);
      } else {
        setError(res.message);
        toast.error(res.message || 'Không thể tải bảng điểm sinh viên.');
      }
      setLoading(false);
    };

    fetchTranscript();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Gom nhóm môn học theo từng học kỳ
  const semestersGroup = transcript.reduce((acc, item) => {
    const sem = item.semester || 'Khác';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(item);
    return acc;
  }, {});

  const semesterKeys = Object.keys(semestersGroup).sort().reverse();

  // Danh sách môn theo bộ lọc học kỳ
  const displayedSemesters =
    selectedSemester === 'ALL'
      ? semesterKeys
      : semesterKeys.filter((sem) => sem === selectedSemester);

  return (
    <div>
      {/* Top Navigation & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ← Quay lại
        </button>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          <Link to="/grades" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Bảng điểm
          </Link>{' '}
          / <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
            {student?.full_name ? `${student.full_name} (${student.student_code})` : `Sinh viên #${id}`}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="spinner spinner-primary"></div>
          <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Đang tải dữ liệu bảng điểm và tính toán GPA...
          </p>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
            Không thể xem bảng điểm
          </h3>
          <p style={{ color: 'var(--danger)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 16px auto' }}>
            {error}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/grades')}>
            Về trang Quản lý Điểm
          </button>
        </div>
      ) : (
        <>
          {/* Student Overview & GPA Summary Banner Card */}
          <div
            className="card"
            style={{
              padding: '24px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 244, 255, 0.85))',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              {/* Student Profile Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: '800',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  {student?.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                    {student?.full_name}
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--text-muted)' }}>
                    <span>
                      Mã SV: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{student?.student_code}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Xếp loại học lực: {getClassificationBadge(summary?.classification)}
                    </span>
                  </div>
                </div>
              </div>

              {/* GPA Metric Badges */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {/* GPA Thang 10 */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    minWidth: '110px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                    GPA Thang 10
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>
                    {summary?.gpa10 !== null ? summary.gpa10 : 'N/A'}
                  </div>
                </div>

                {/* GPA Thang 4 */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    minWidth: '110px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                    GPA Thang 4
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>
                    {summary?.gpa4 !== null ? summary.gpa4 : 'N/A'}
                  </div>
                </div>

                {/* Tín chỉ tích lũy */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    minWidth: '130px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                    Tín Chỉ Đạt / ĐK
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                    {summary?.passedCredits || 0} / {summary?.totalRegisteredCredits || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar by Semester */}
          <div
            className="card"
            style={{
              padding: '12px 20px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                Lọc theo học kỳ:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedSemester === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedSemester('ALL')}
                >
                  Tất cả ({transcript.length} môn)
                </button>
                {semesterKeys.map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    className={`btn btn-sm ${selectedSemester === sem ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedSemester(sem)}
                  >
                    Học kỳ {sem} ({semestersGroup[sem].length})
                  </button>
                ))}
              </div>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Tổng số môn học: <strong>{transcript.length}</strong>
            </div>
          </div>

          {/* Transcript Tables grouped by Semester */}
          {transcript.length === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                Chưa có dữ liệu điểm học phần
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Sinh viên này hiện chưa được nhập điểm môn học nào trong hệ thống.
              </p>
            </div>
          ) : (
            displayedSemesters.map((sem) => {
              const semCourses = semestersGroup[sem] || [];
              let semWeighted10 = 0;
              let semCredits = 0;

              semCourses.forEach((c) => {
                if (c.score !== null && c.score !== undefined) {
                  semWeighted10 += Number(c.score) * Number(c.credits);
                  semCredits += Number(c.credits);
                }
              });

              const semGpa10 = semCredits > 0 ? (semWeighted10 / semCredits).toFixed(2) : null;

              return (
                <div key={sem} className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
                  <div
                    style={{
                      padding: '14px 20px',
                      background: '#f8fafc',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                      📅 Học Kỳ {sem}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <span>
                        Số môn: <strong>{semCourses.length}</strong>
                      </span>
                      {semGpa10 && (
                        <span>
                          GPA kỳ: <strong style={{ color: 'var(--primary)' }}>{semGpa10}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="table-container" style={{ border: 'none' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: '120px' }}>Mã Môn</th>
                          <th>Tên Môn Học</th>
                          <th style={{ width: '90px', textAlign: 'center' }}>Số TC</th>
                          <th style={{ width: '130px', textAlign: 'center' }}>Điểm Thang 10</th>
                          <th style={{ width: '110px', textAlign: 'center' }}>Điểm Thang 4</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Điểm Chữ</th>
                          <th style={{ width: '110px', textAlign: 'center' }}>Kết Quả</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semCourses.map((c) => {
                          const isPassed = c.score !== null && Number(c.score) >= 4.0;
                          return (
                            <tr key={c.enrollment_id}>
                              <td>
                                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>
                                  {c.course_code}
                                </span>
                              </td>
                              <td style={{ fontWeight: '600' }}>{c.course_name}</td>
                              <td style={{ textAlign: 'center', fontWeight: '600' }}>{c.credits} TC</td>
                              <td style={{ textAlign: 'center', fontWeight: '700' }}>
                                {c.score !== null ? (
                                  <span style={{ fontSize: '14px', color: isPassed ? 'var(--text-main)' : 'var(--danger)' }}>
                                    {Number(c.score).toFixed(2)}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Chưa có</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                {c.grade_point_4 !== null ? c.grade_point_4.toFixed(1) : '-'}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {c.letter_grade ? (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontWeight: '700',
                                      fontSize: '12px',
                                      background: isPassed ? '#dcfce7' : '#fee2e2',
                                      color: isPassed ? '#15803d' : '#b91c1c',
                                    }}
                                  >
                                    {c.letter_grade}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {c.score !== null ? (
                                  isPassed ? (
                                    <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '12px' }}>
                                      ✓ Đạt
                                    </span>
                                  ) : (
                                    <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '12px' }}>
                                      ✗ Không đạt
                                    </span>
                                  )
                                ) : (
                                  <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Đang học</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

export default StudentTranscript;
