import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ClassBarChart from '../components/dashboard/ClassBarChart';
import CourseAvgScoreCard from '../components/dashboard/CourseAvgScoreCard';
import StudentScoresBarChart from '../components/dashboard/StudentScoresBarChart';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/stats');
      if (res.data?.success) {
        setStatsData(res.data.data);
      } else {
        setError(res.data?.message || 'Không thể tải dữ liệu thống kê.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối khi tải số liệu thống kê. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const isStudent = role === 'student';

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          color: '#fff',
          border: 'none',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
              Xin chào, {isStudent && statsData?.studentInfo ? statsData.studentInfo.full_name : user?.username}! 👋
            </h2>
            <p style={{ opacity: 0.85, fontSize: '14px', maxWidth: '620px', margin: 0 }}>
              {isStudent
                ? `Hồ sơ sinh viên: ${statsData?.studentInfo?.student_code || ''} • Lớp: ${statsData?.studentInfo?.class_name || 'N/A'} • Khoa: ${statsData?.studentInfo?.faculty || 'N/A'}`
                : 'Cổng thông tin Quản lý Sinh viên: theo dõi thống kê tổng quan, tiến độ đào tạo và kết quả học tập.'}
            </p>
          </div>
          <div>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Vai trò: {role}
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="spinner spinner-primary"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Đang tải dữ liệu và biểu đồ thống kê...
          </p>
        </div>
      )}

      {/* Error State with Retry Button */}
      {!loading && error && (
        <div
          className="card"
          style={{
            padding: '32px 24px',
            textAlign: 'center',
            border: '1px solid #fecaca',
            background: '#fff5f5',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚠️</div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#b91c1c', marginBottom: '6px' }}>
            Không thể tải dữ liệu thống kê
          </h3>
          <p style={{ color: '#991b1b', fontSize: '14px', maxWidth: '500px', margin: '0 auto 16px auto' }}>
            {error}
          </p>
          <button type="button" className="btn btn-primary" onClick={fetchStats}>
            🔄 Thử lại
          </button>
        </div>
      )}

      {/* Main Content when loaded successfully */}
      {!loading && !error && statsData && (
        <>
          {/* ============================================================== */}
          {/* GIAO DIỆN CHO ADMIN & GIẢNG VIÊN (Xem toàn bộ thống kê)         */}
          {/* ============================================================== */}
          {!isStudent && (
            <>
              {/* Overview Metric Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon indigo">👨‍🎓</div>
                  <div className="stat-info">
                    <span className="stat-value">{statsData.overview?.totalStudents || 0}</span>
                    <span className="stat-label">Tổng sinh viên</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon emerald">🏫</div>
                  <div className="stat-info">
                    <span className="stat-value">{statsData.overview?.totalClasses || 0}</span>
                    <span className="stat-label">Lớp sinh hoạt</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon amber">📚</div>
                  <div className="stat-info">
                    <span className="stat-value">{statsData.overview?.totalCourses || 0}</span>
                    <span className="stat-label">Môn học đào tạo</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon rose">📊</div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {statsData.overview?.overallAvgScore !== null ? `${statsData.overview.overallAvgScore}` : 'N/A'}
                    </span>
                    <span className="stat-label">Điểm TB toàn trường</span>
                  </div>
                </div>
              </div>

              {/* Biểu đồ cột: Số sinh viên theo từng lớp học */}
              <ClassBarChart
                data={statsData.studentsPerClass || []}
                title="Số sinh viên theo từng lớp học"
              />

              {/* Điểm trung bình theo từng môn học */}
              <CourseAvgScoreCard data={statsData.avgScorePerCourse || []} />
            </>
          )}

          {/* ============================================================== */}
          {/* GIAO DIỆN CHO SINH VIÊN (Chỉ thấy thông tin của chính mình)     */}
          {/* ============================================================== */}
          {isStudent && (
            <>
              {/* Metric Cards cho Sinh viên */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon indigo">🎯</div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {statsData.summary?.gpa10 !== null ? statsData.summary.gpa10 : 'N/A'}
                    </span>
                    <span className="stat-label">GPA Thang 10</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon emerald">⭐</div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {statsData.summary?.gpa4 !== null ? statsData.summary.gpa4 : 'N/A'}
                    </span>
                    <span className="stat-label">GPA Thang 4</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon amber">📚</div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {statsData.summary?.passedCredits || 0} / {statsData.summary?.totalRegisteredCredits || 0}
                    </span>
                    <span className="stat-label">Tín chỉ tích lũy</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon rose">🏆</div>
                  <div className="stat-info">
                    <span className="stat-value" style={{ fontSize: '18px' }}>
                      {statsData.summary?.classification || 'Chưa xếp loại'}
                    </span>
                    <span className="stat-label">Xếp loại học lực</span>
                  </div>
                </div>
              </div>

              {/* Biểu đồ điểm các môn học của sinh viên */}
              <StudentScoresBarChart scores={statsData.scoresPerCourse || []} />

              {/* Thẻ thông tin lớp sinh hoạt */}
              {statsData.studentInfo && (
                <div className="card">
                  <h3 className="card-title">🏫 Thông Tin Lớp Sinh Hoạt</h3>
                  <p className="card-subtitle">Chi tiết về lớp chuyên ngành bạn đang theo học</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Tên lớp</span>
                      <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>
                        {statsData.studentInfo.class_name}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Khoa / Viện</span>
                      <strong>{statsData.studentInfo.faculty}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Niên khóa</span>
                      <strong>{statsData.studentInfo.school_year}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Sĩ số lớp</span>
                      <strong>{statsData.studentInfo.classmates_count} sinh viên</strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick Actions Links */}
          <div className="card">
            <h3 className="card-title">Truy Cập Nhanh</h3>
            <p className="card-subtitle">Điều hướng nhanh tới các phân hệ nghiệp vụ</p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {!isStudent && (
                <Link to="/students" className="btn btn-primary">
                  👨‍🎓 Quản lý Sinh viên
                </Link>
              )}

              <Link to="/classes" className="btn btn-secondary">
                🏫 Danh sách Lớp học
              </Link>

              <Link to="/courses" className="btn btn-secondary">
                📚 Danh mục Môn học
              </Link>

              <Link to="/grades" className="btn btn-outline">
                {isStudent ? '📝 Bảng điểm cá nhân' : '📊 Quản lý Điểm số'}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
