import React, { useState } from 'react';

/**
 * Biểu đồ cột biểu diễn Số lượng sinh viên theo từng lớp học
 * Thuần React & CSS, không phụ thuộc thư viện nặng, giao diện hiện đại & tương thích mobile
 */
const ClassBarChart = ({ data = [], title = 'Số sinh viên theo từng lớp học' }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Chưa có dữ liệu lớp học để hiển thị biểu đồ.
      </div>
    );
  }

  // Tìm giá trị lớn nhất để làm mốc tỷ lệ chiều cao (tối thiểu là 10 để biểu đồ thoáng mắt)
  const maxCount = Math.max(...data.map((d) => d.student_count || 0), 10);
  const yAxisTicks = [maxCount, Math.round(maxCount * 0.75), Math.round(maxCount * 0.5), Math.round(maxCount * 0.25), 0];

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
      {/* Chart Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            📊 {title}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Phân bố quy mô sinh viên giữa các lớp sinh hoạt trong hệ thống
          </p>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          Tổng cộng: <strong>{data.reduce((sum, item) => sum + item.student_count, 0)}</strong> sinh viên
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div style={{ position: 'relative', height: '260px', display: 'flex', paddingLeft: '36px', paddingBottom: '30px', marginTop: '10px' }}>
        {/* Y-Axis Labels & Grid lines */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: '30px', width: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: '8px' }}>
          {yAxisTicks.map((tick, idx) => (
            <span key={idx} style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
              {tick}
            </span>
          ))}
        </div>

        {/* Horizontal Grid lines */}
        <div style={{ position: 'absolute', left: '36px', right: 0, top: 0, bottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {yAxisTicks.map((_, idx) => (
            <div key={idx} style={{ borderBottom: '1px dashed #e2e8f0', width: '100%', height: 0 }} />
          ))}
        </div>

        {/* Bars Container */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '16px', zIndex: 1, position: 'relative' }}>
          {data.map((item) => {
            const heightPercent = maxCount > 0 ? (item.student_count / maxCount) * 100 : 0;
            const isHovered = hoveredItem?.class_id === item.class_id;

            return (
              <div
                key={item.class_id}
                style={{
                  flex: 1,
                  maxWidth: '80px',
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
                {/* Tooltip on Hover */}
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
                    }}
                  >
                    <div>{item.class_name}: {item.student_count} SV</div>
                    {item.faculty && (
                      <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 'normal' }}>
                        {item.faculty}
                      </div>
                    )}
                  </div>
                )}

                {/* Count badge on top of bar */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: isHovered ? 'var(--primary)' : 'var(--text-main)',
                    marginBottom: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.student_count}
                </span>

                {/* The Bar */}
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(heightPercent, 4)}%`,
                    borderRadius: '8px 8px 0 0',
                    background: isHovered
                      ? 'linear-gradient(180deg, #4f46e5, #3730a3)'
                      : 'linear-gradient(180deg, #818cf8, #4f46e5)',
                    boxShadow: isHovered
                      ? '0 6px 16px rgba(79, 70, 229, 0.4)'
                      : '0 2px 6px rgba(79, 70, 229, 0.15)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />

                {/* X-Axis Class Name Label */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    paddingTop: '8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: isHovered ? 'var(--primary)' : 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100px',
                  }}
                  title={item.class_name}
                >
                  {item.class_name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClassBarChart;
