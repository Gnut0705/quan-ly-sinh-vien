import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Custom Hook quản lý dữ liệu sinh viên và lớp học
 * Đảm bảo các component không gọi axios trực tiếp
 */
export const useStudents = (initialParams = {}) => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bộ lọc và sắp xếp
  const [search, setSearch] = useState(initialParams.search || '');
  const [classFilter, setClassFilter] = useState(initialParams.classId || '');
  const [sortBy, setSortBy] = useState(initialParams.sortBy || 'id');
  const [order, setOrder] = useState(initialParams.order || 'DESC');
  const [page, setPage] = useState(initialParams.page || 1);
  const [limit, setLimit] = useState(initialParams.limit || 10);

  // Debounce search ref
  const debounceTimerRef = useRef(null);

  /**
   * Tải danh mục lớp học phục vụ dropdown lọc và form
   */
  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get('/classes?limit=100&sortBy=class_name&order=ASC');
      if (res.data?.success) {
        setClasses(res.data.data);
      }
    } catch {
      // Bỏ qua lỗi danh mục lớp học, giao diện vẫn hoạt động bình thường
    }
  }, []);

  /**
   * Tải danh sách sinh viên theo các tham số hiện tại
   */
  const fetchStudents = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);

    const queryParams = {
      page: overrides.page !== undefined ? overrides.page : page,
      limit: overrides.limit !== undefined ? overrides.limit : limit,
      search: overrides.search !== undefined ? overrides.search.trim() : search.trim(),
      class_id: overrides.classFilter !== undefined ? overrides.classFilter : classFilter,
      sortBy: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
      order: overrides.order !== undefined ? overrides.order : order,
    };

    try {
      const res = await api.get('/students', {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search || undefined,
          class_id: queryParams.class_id || undefined,
          sortBy: queryParams.sortBy,
          order: queryParams.order,
        },
      });

      if (res.data?.success) {
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách sinh viên.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, classFilter, sortBy, order]);

  // Tự động tải sinh viên khi các tham số thay đổi
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Tải danh mục lớp học 1 lần khi hook khởi tạo
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  /**
   * Thay đổi từ khóa tìm kiếm có xử lý Debounce
   */
  const handleSearchChange = (term) => {
    setSearch(term);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchStudents({ search: term, page: 1 });
    }, 400);
  };

  /**
   * Thay đổi bộ lọc theo lớp
   */
  const handleClassFilterChange = (classId) => {
    setClassFilter(classId);
    setPage(1);
    fetchStudents({ classFilter: classId, page: 1 });
  };

  /**
   * Xử lý click sắp xếp theo cột
   */
  const handleSort = (column) => {
    let newOrder = 'ASC';
    if (sortBy === column) {
      newOrder = order === 'ASC' ? 'DESC' : 'ASC';
    }
    setSortBy(column);
    setOrder(newOrder);
    setPage(1);
    fetchStudents({ sortBy: column, order: newOrder, page: 1 });
  };

  /**
   * Đổi trang
   */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchStudents({ page: newPage });
  };

  /**
   * Đổi số bản ghi mỗi trang
   */
  const handlePageSizeChange = (newSize) => {
    setLimit(newSize);
    setPage(1);
    fetchStudents({ limit: newSize, page: 1 });
  };

  /**
   * Trích xuất và ánh xạ lỗi từ response server vào từng trường tương ứng
   */
  const extractFieldErrors = (err) => {
    const fieldErrors = {};
    const data = err.response?.data;

    // 1. Nếu có mảng errors chi tiết
    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach((e) => {
        if (e.field) fieldErrors[e.field] = e.message;
      });
    }

    // 2. Nếu là lỗi xung đột trùng lặp UNIQUE (mã SV hoặc email)
    const msg = data?.message || '';
    if (msg.includes('Mã sinh viên')) {
      fieldErrors.student_code = msg;
    }
    if (msg.includes('email') || msg.includes('Email')) {
      fieldErrors.email = msg;
    }

    return {
      message: msg || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại.',
      fieldErrors,
    };
  };

  /**
   * Tạo mới sinh viên
   */
  const createStudent = async (studentData) => {
    try {
      const res = await api.post('/students', studentData);
      if (res.data?.success) {
        fetchStudents();
        return { success: true, data: res.data.data, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Thêm sinh viên thất bại.' };
    } catch (err) {
      const { message, fieldErrors } = extractFieldErrors(err);
      return { success: false, message, fieldErrors };
    }
  };

  /**
   * Cập nhật thông tin sinh viên
   */
  const updateStudent = async (id, studentData) => {
    try {
      const res = await api.put(`/students/${id}`, studentData);
      if (res.data?.success) {
        fetchStudents();
        return { success: true, data: res.data.data, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Cập nhật thất bại.' };
    } catch (err) {
      const { message, fieldErrors } = extractFieldErrors(err);
      return { success: false, message, fieldErrors };
    }
  };

  /**
   * Xóa sinh viên
   */
  const deleteStudent = async (id) => {
    try {
      const res = await api.delete(`/students/${id}`);
      if (res.data?.success) {
        // Nếu xóa bản ghi cuối cùng của trang > 1 thì lùi về trang trước
        if (students.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchStudents();
        }
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Xóa thất bại.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể xóa sinh viên.';
      return { success: false, message };
    }
  };

  /**
   * Lấy chi tiết thông tin và bảng điểm của 1 sinh viên
   */
  const getStudentDetail = async (id) => {
    try {
      const res = await api.get(`/students/${id}`);
      if (res.data?.success) {
        return { success: true, data: res.data.data };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Không thể lấy thông tin chi tiết.',
      };
    }
  };

  return {
    students,
    pagination,
    classes,
    loading,
    error,
    search,
    classFilter,
    sortBy,
    order,
    fetchStudents,
    handleSearchChange,
    handleClassFilterChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentDetail,
  };
};
