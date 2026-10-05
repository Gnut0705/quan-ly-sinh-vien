import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Custom Hook quản lý dữ liệu lớp học
 * Đảm bảo các component không gọi axios trực tiếp
 */
export const useClasses = (initialParams = {}) => {
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bộ lọc và sắp xếp
  const [search, setSearch] = useState(initialParams.search || '');
  const [facultyFilter, setFacultyFilter] = useState(initialParams.faculty || '');
  const [schoolYearFilter, setSchoolYearFilter] = useState(initialParams.schoolYear || '');
  const [sortBy, setSortBy] = useState(initialParams.sortBy || 'id');
  const [order, setOrder] = useState(initialParams.order || 'DESC');
  const [page, setPage] = useState(initialParams.page || 1);
  const [limit, setLimit] = useState(initialParams.limit || 10);

  // Debounce search ref
  const debounceTimerRef = useRef(null);

  /**
   * Tải danh sách lớp học theo tham số hiện tại
   */
  const fetchClasses = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);

    const queryParams = {
      page: overrides.page !== undefined ? overrides.page : page,
      limit: overrides.limit !== undefined ? overrides.limit : limit,
      search: overrides.search !== undefined ? overrides.search.trim() : search.trim(),
      faculty: overrides.facultyFilter !== undefined ? overrides.facultyFilter : facultyFilter,
      school_year: overrides.schoolYearFilter !== undefined ? overrides.schoolYearFilter : schoolYearFilter,
      sortBy: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
      order: overrides.order !== undefined ? overrides.order : order,
    };

    try {
      const res = await api.get('/classes', {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search || undefined,
          faculty: queryParams.faculty || undefined,
          school_year: queryParams.school_year || undefined,
          sortBy: queryParams.sortBy,
          order: queryParams.order,
        },
      });

      if (res.data?.success) {
        setClasses(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách lớp học.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, facultyFilter, schoolYearFilter, sortBy, order]);

  // Tự động fetch khi các điều kiện thay đổi
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  /**
   * Tìm kiếm tên lớp có Debounce (400ms)
   */
  const handleSearchChange = (term) => {
    setSearch(term);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchClasses({ search: term, page: 1 });
    }, 400);
  };

  /**
   * Đổi bộ lọc theo khoa
   */
  const handleFacultyFilterChange = (faculty) => {
    setFacultyFilter(faculty);
    setPage(1);
    fetchClasses({ facultyFilter: faculty, page: 1 });
  };

  /**
   * Đổi bộ lọc theo niên khóa
   */
  const handleSchoolYearFilterChange = (schoolYear) => {
    setSchoolYearFilter(schoolYear);
    setPage(1);
    fetchClasses({ schoolYearFilter: schoolYear, page: 1 });
  };

  /**
   * Sắp xếp theo cột
   */
  const handleSort = (column) => {
    let newOrder = 'ASC';
    if (sortBy === column) {
      newOrder = order === 'ASC' ? 'DESC' : 'ASC';
    }
    setSortBy(column);
    setOrder(newOrder);
    setPage(1);
    fetchClasses({ sortBy: column, order: newOrder, page: 1 });
  };

  /**
   * Đổi trang
   */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchClasses({ page: newPage });
  };

  /**
   * Đổi số lượng bản ghi mỗi trang
   */
  const handlePageSizeChange = (newSize) => {
    setLimit(newSize);
    setPage(1);
    fetchClasses({ limit: newSize, page: 1 });
  };

  /**
   * Bóc tách lỗi từ response server
   */
  const extractFieldErrors = (err) => {
    const fieldErrors = {};
    const data = err.response?.data;

    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((e) => {
        if (e.field) fieldErrors[e.field] = e.message;
      });
    }

    const msg = data?.message || '';
    if (msg.includes('Tên lớp') || msg.includes('class_name')) {
      fieldErrors.class_name = msg;
    }

    return {
      message: msg || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại.',
      fieldErrors,
      status: err.response?.status,
    };
  };

  /**
   * Tạo mới lớp học
   */
  const createClass = async (classData) => {
    try {
      const res = await api.post('/classes', classData);
      if (res.data?.success) {
        fetchClasses();
        return { success: true, data: res.data.data, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Tạo lớp học thất bại.' };
    } catch (err) {
      const { message, fieldErrors, status } = extractFieldErrors(err);
      return { success: false, message, fieldErrors, status };
    }
  };

  /**
   * Cập nhật thông tin lớp học
   */
  const updateClass = async (id, classData) => {
    try {
      const res = await api.put(`/classes/${id}`, classData);
      if (res.data?.success) {
        fetchClasses();
        return { success: true, data: res.data.data, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Cập nhật thất bại.' };
    } catch (err) {
      const { message, fieldErrors, status } = extractFieldErrors(err);
      return { success: false, message, fieldErrors, status };
    }
  };

  /**
   * Xóa lớp học (xử lý mã lỗi 409 nếu lớp còn sinh viên)
   */
  const deleteClass = async (id) => {
    try {
      const res = await api.delete(`/classes/${id}`);
      if (res.data?.success) {
        if (classes.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchClasses();
        }
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Xóa thất bại.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể xóa lớp học.';
      const status = err.response?.status;
      return { success: false, message, status };
    }
  };

  /**
   * Lấy chi tiết thông tin 1 lớp học
   */
  const getClassDetail = async (id) => {
    try {
      const res = await api.get(`/classes/${id}`);
      if (res.data?.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Không thể lấy thông tin lớp học.',
      };
    }
  };

  /**
   * Lấy danh sách toàn bộ sinh viên của một lớp
   */
  const getClassStudents = async (id) => {
    try {
      const res = await api.get(`/classes/${id}/students`);
      if (res.data?.success) {
        return { success: true, classInfo: res.data.class, data: res.data.data };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Không thể lấy danh sách sinh viên của lớp.',
      };
    }
  };

  return {
    classes,
    pagination,
    loading,
    error,
    search,
    facultyFilter,
    schoolYearFilter,
    sortBy,
    order,
    fetchClasses,
    handleSearchChange,
    handleFacultyFilterChange,
    handleSchoolYearFilterChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    createClass,
    updateClass,
    deleteClass,
    getClassDetail,
    getClassStudents,
  };
};
