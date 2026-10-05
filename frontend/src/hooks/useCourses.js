import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Custom Hook quản lý dữ liệu môn học / học phần
 * Đảm bảo các component không gọi axios trực tiếp
 */
export const useCourses = (initialParams = {}) => {
  const [courses, setCourses] = useState([]);
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
  const [sortBy, setSortBy] = useState(initialParams.sortBy || 'id');
  const [order, setOrder] = useState(initialParams.order || 'DESC');
  const [page, setPage] = useState(initialParams.page || 1);
  const [limit, setLimit] = useState(initialParams.limit || 10);

  // Debounce search ref
  const debounceTimerRef = useRef(null);

  /**
   * Tải danh sách môn học theo tham số hiện tại
   */
  const fetchCourses = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);

    const queryParams = {
      page: overrides.page !== undefined ? overrides.page : page,
      limit: overrides.limit !== undefined ? overrides.limit : limit,
      search: overrides.search !== undefined ? overrides.search.trim() : search.trim(),
      sortBy: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
      order: overrides.order !== undefined ? overrides.order : order,
    };

    try {
      const res = await api.get('/courses', {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search || undefined,
          sortBy: queryParams.sortBy,
          order: queryParams.order,
        },
      });

      if (res.data?.success) {
        setCourses(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách môn học.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, order]);

  // Tự động tải khi tham số thay đổi
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /**
   * Tìm kiếm theo mã hoặc tên môn học có Debounce (400ms)
   */
  const handleSearchChange = (term) => {
    setSearch(term);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchCourses({ search: term, page: 1 });
    }, 400);
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
    fetchCourses({ sortBy: column, order: newOrder, page: 1 });
  };

  /**
   * Chuyển trang
   */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchCourses({ page: newPage });
  };

  /**
   * Đổi số lượng bản ghi mỗi trang
   */
  const handlePageSizeChange = (newSize) => {
    setLimit(newSize);
    setPage(1);
    fetchCourses({ limit: newSize, page: 1 });
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
    if (msg.includes('Mã môn') || msg.includes('course_code')) {
      fieldErrors.course_code = msg;
    }
    if (msg.includes('tín chỉ') || msg.includes('credits')) {
      fieldErrors.credits = msg;
    }
    if (msg.includes('Tên môn') || msg.includes('course_name')) {
      fieldErrors.course_name = msg;
    }

    return {
      message: msg || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại.',
      fieldErrors,
      status: err.response?.status,
    };
  };

  /**
   * Thêm mới môn học
   */
  const createCourse = async (courseData) => {
    try {
      const res = await api.post('/courses', courseData);
      if (res.data?.success) {
        fetchCourses();
        return { success: true, data: res.data.data, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Tạo môn học thất bại.' };
    } catch (err) {
      const { message, fieldErrors, status } = extractFieldErrors(err);
      return { success: false, message, fieldErrors, status };
    }
  };

  /**
   * Cập nhật thông tin môn học
   */
  const updateCourse = async (id, courseData) => {
    try {
      const res = await api.put(`/courses/${id}`, courseData);
      if (res.data?.success) {
        fetchCourses();
        return { success: true, data: res.data.data, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Cập nhật thất bại.' };
    } catch (err) {
      const { message, fieldErrors, status } = extractFieldErrors(err);
      return { success: false, message, fieldErrors, status };
    }
  };

  /**
   * Xóa môn học (xử lý mã lỗi 409 nếu môn học đã có điểm / sinh viên đăng ký)
   */
  const deleteCourse = async (id) => {
    try {
      const res = await api.delete(`/courses/${id}`);
      if (res.data?.success) {
        if (courses.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchCourses();
        }
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Xóa thất bại.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể xóa môn học.';
      const status = err.response?.status;
      return { success: false, message, status };
    }
  };

  /**
   * Lấy chi tiết thông tin một môn học
   */
  const getCourseDetail = async (id) => {
    try {
      const res = await api.get(`/courses/${id}`);
      if (res.data?.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Không thể lấy thông tin môn học.',
      };
    }
  };

  return {
    courses,
    pagination,
    loading,
    error,
    search,
    sortBy,
    order,
    fetchCourses,
    handleSearchChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseDetail,
  };
};

export default useCourses;
