import React from 'react';

/**
 * Reusable Pagination Component
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  // Tính toán dãy trang hiển thị hợp lý (tối đa 5 trang xung quanh trang hiện tại)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        <span>
          Hiển thị{' '}
          <strong>
            {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(currentPage * pageSize, totalItems)}
          </strong>{' '}
          trên tổng số <strong>{totalItems}</strong> bản ghi
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mỗi trang:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        )}
      </div>

      <div className="pagination-nav">
        <button
          type="button"
          className="page-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          title="Trang đầu"
        >
          «
        </button>
        <button
          type="button"
          className="page-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Trang trước"
        >
          ‹
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`page-btn ${p === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className="page-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Trang sau"
        >
          ›
        </button>
        <button
          type="button"
          className="page-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Trang cuối"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
