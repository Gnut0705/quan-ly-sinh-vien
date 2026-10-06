import React from 'react';

const CourseAvgScoreCard = ({ data = [] }) => {
  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
          🎯 Điểm Trung Bình Theo Môn Học
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Đánh giá phổ điểm trung bình của sinh viên qua các môn học
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {data.map((item) => {
          const avg = item.avg_score !== null ? Number(item.avg_score) : null;
          const percent = avg !== null ? (avg / 10) * 100 : 0;

          let barColor = '#94a3b8';
          if (avg !== null) {
            if (avg >= 8.5) barColor = '#10b981';
            else if (avg >= 7.0) barColor = '#3b82f6';
            else if (avg >= 5.5) barColor = '#f59e0b';
            else barColor = '#ef4444';
          }

          return (
            <div key={item.course_id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>{item.course_name}</strong>{' '}
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                    ({item.course_code})
                  </span>
                </div>
                <div style={{ fontWeight: '700', color: avg !== null ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {avg !== null ? `${avg.toFixed(2)} / 10` : 'Chưa có điểm'}
                  {item.graded_count > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '6px' }}>
                      ({item.graded_count} bài)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percent}%`,
                    backgroundColor: barColor,
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseAvgScoreCard;
