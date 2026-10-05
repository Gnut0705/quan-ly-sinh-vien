import React, { useState, useRef, useEffect } from 'react';

/**
 * Reusable Searchable Select Component
 * @param {Array} options - [{ value, label, subLabel }]
 * @param {string|number} value - Selected value
 * @param {function} onChange - Value change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disable state
 * @param {string} error - Error message
 */
const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = '-- Chọn mục --',
  searchPlaceholder = 'Gõ để tìm kiếm...',
  disabled = false,
  error = '',
  id,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Tìm option đã chọn
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Lọc options theo từ khóa tìm kiếm
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const labelMatch = (opt.label || '').toLowerCase().includes(term);
    const subMatch = (opt.subLabel || '').toLowerCase().includes(term);
    return labelMatch || subMatch;
  });

  // Tự động focus vào ô tìm kiếm khi mở dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%' }}
      id={id}
    >
      {/* Box hiển thị giá trị đã chọn */}
      <div
        className={`form-input ${error ? 'is-invalid' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#f8fafc' : '#ffffff',
          minHeight: '42px',
          padding: '6px 12px',
          userSelect: 'none',
        }}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
      >
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? (
            <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>
              {selectedOption.label}
              {selectedOption.subLabel && (
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '6px' }}>
                  ({selectedOption.subLabel})
                </span>
              )}
            </span>
          ) : (
            <span style={{ color: '#94a3b8' }}>{placeholder}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '12px',
                padding: '2px 4px',
              }}
              title="Xóa lựa chọn"
            >
              ✕
            </button>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1050,
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            maxHeight: '260px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Ô tìm kiếm bên trong dropdown */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
            <input
              ref={searchInputRef}
              type="text"
              className="form-input"
              style={{ width: '100%', fontSize: '13px', padding: '6px 10px' }}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Danh sách các mục options */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      background: isSelected ? 'var(--primary-light, #e0e7ff)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: isSelected ? '600' : '400',
                      fontSize: '13px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <div>
                      <div>{opt.label}</div>
                      {opt.subLabel && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {opt.subLabel}
                        </div>
                      )}
                    </div>
                    {isSelected && <span>✓</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
