import React, { useState } from 'react';

/**
 * Biểu đồ cột biểu diễn Điểm số các môn học của Sinh viên
 */
const StudentScoresBarChart = ({ scores = [] }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const gradedScores = scores.filter((s) => s.score !== null && s.score !== undefined);

  if (gradedScores.length === 0) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Bạn chưa có điểm thi chính thức để hiển thị biểu đồ kết quả học tập.
      </div>
    );
  }

  const maxScore = 10;
  const yAxisTicks = [10, 8, 6, 4, 2, 0];

  const getBarColor = (score) => {
    if (score >= 8.5) return 'linear-gradient(180deg, #34d399, #059669)';
    if (score >= 7.0) return 'linear-gradient(180deg, #60a5fa, #2563eb)';
    if (score >= 5.5) return 'linear-gradient(180deg, #fbbf24, #d97706)';
    if (score >= 4.0) return 'linear-gradient(180deg, #fb923c, #ea580c)';
    return 'linear-gradient(180deg, #f87171, #dc2626)';
  };

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            📈 Biểu Đồ Điểm Số Các Môn Học
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Kết quả các môn học theo thang điểm 10 đã có điểm chính thức
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', height: '240px', display: 'flex', paddingLeft: '32px', paddingBottom: '30px', marginTop: '10px' }}>
        {/* Y-Axis */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: '30px', width: '26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: '6px' }}>
          {yAxisTicks.map((tick, idx) => (
            <span key={idx} style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
              {tick}
            </span>
          ))}
        </div>

        {/* Grid lines */}
        <div style={{ position: 'absolute', left: '32px', right: 0, top: 0, bottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {yAxisTicks.map((_, idx) => (
            <div key={idx} style={{ borderBottom: '1px dashed #e2e8f0', width: '100%', height: 0 }} />
          ))}
        </div>

        {/* Bars */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '16px', zIndex: 1, position: 'relative' }}>
          {gradedScores.map((item) => {
            const heightPercent = (Number(item.score) / maxScore) * 100;
            const isHovered = hoveredItem?.course_id === item.course_id;

            return (
              <div
                key={item.course_id}
                style={{
                  flex: 1,
                  maxWidth: '75px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: `calc(${heightPercent}% + 12px)`,
                      background: '#1e1b4b',
                      color: '#ffffff',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      zIndex: 10,
                      animation: 'fadeIn 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    <div>{item.course_name}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>
                      Điểm: {Number(item.score).toFixed(1)} ({item.letter_grade}) - Kỳ {item.semester}
                    </div>
                  </div>
                )}

                {/* Score text */}
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {Number(item.score).toFixed(1)}
                </span>

                {/* Bar */}
                <div
                  style={{
                    width: '100%',
                    height: `${heightPercent}%`,
                    borderRadius: '6px 6px 0 0',
                    background: getBarColor(Number(item.score)),
                    transition: 'all 0.2s ease',
                    boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.25)' : 'none',
                  }}
                />

                {/* Label */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    paddingTop: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    color: isHovered ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  {item.course_code}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentScoresBarChart;
