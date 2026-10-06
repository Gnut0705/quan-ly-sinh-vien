import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom Hook quản lý dữ liệu điểm số và học phần
 * Đảm bảo các component không gọi axios trực tiếp
 */
export const useGrades = (initialParams = {}) => {
  const [grades, setGrades] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bộ lọc và sắp xếp
  const [studentFilter, setStudentFilter] = useState(initialParams.studentId || '');
  const [courseFilter, setCourseFilter] = useState(initialParams.courseId || '');
  const [semesterFilter, setSemesterFilter] = useState(initialParams.semester || '');
  const [sortBy, setSortBy] = useState(initialParams.sortBy || 'id');
  const [order, setOrder] = useState(initialParams.order || 'DESC');
  const [page, setPage] = useState(initialParams.page || 1);
  const [limit, setLimit] = useState(initialParams.limit || 10);

  // Danh mục sinh viên và môn học hỗ trợ cho bộ lọc & dropdown form
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([
    '2023.1',
    '2023.2',
    '2023.3',
    '2024.1',
    '2024.2',
    '2024.3',
    '2025.1',
    '2025.2',
  ]);

  /**
   * Tải danh mục hỗ trợ (toàn bộ sinh viên và môn học)
   */
  const loadReferenceData = useCallback(async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.allSettled([
        api.get('/students', { params: { limit: 100 } }),
        api.get('/courses', { params: { limit: 100 } }),
      ]);

      if (studentsRes.status === 'fulfilled' && studentsRes.value.data?.success) {
        setAvailableStudents(studentsRes.value.data.data || []);
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value.data?.success) {
        setAvailableCourses(coursesRes.value.data.data || []);
      }
    } catch {
      // Ignored silently for references
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  /**
   * Tải danh sách điểm theo tham số hiện tại
   */
  const fetchGrades = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);

    const queryParams = {
      page: overrides.page !== undefined ? overrides.page : page,
      limit: overrides.limit !== undefined ? overrides.limit : limit,
      student_id: overrides.studentFilter !== undefined ? overrides.studentFilter : studentFilter,
      course_id: overrides.courseFilter !== undefined ? overrides.courseFilter : courseFilter,
      semester: overrides.semesterFilter !== undefined ? overrides.semesterFilter : semesterFilter,
      sortBy: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
      order: overrides.order !== undefined ? overrides.order : order,
    };

    try {
      const res = await api.get('/grades', {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          student_id: queryParams.student_id || undefined,
          course_id: queryParams.course_id || undefined,
          semester: queryParams.semester || undefined,
          sortBy: queryParams.sortBy,
          order: queryParams.order,
        },
      });

      if (res.data?.success) {
        setGrades(res.data.data);
        setPagination(res.data.pagination);

        // Bổ sung học kỳ vào danh mục học kỳ nếu chưa có
        const resSemesters = res.data.data.map((item) => item.semester).filter(Boolean);
        if (resSemesters.length > 0) {
          setAvailableSemesters((prev) => Array.from(new Set([...prev, ...resSemesters])));
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách điểm số.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, studentFilter, courseFilter, semesterFilter, sortBy, order]);

  // Tự động tải khi tham số thay đổi
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleStudentFilterChange = (studentId) => {
    setStudentFilter(studentId);
    setPage(1);
    fetchGrades({ studentFilter: studentId, page: 1 });
  };

  const handleCourseFilterChange = (courseId) => {
    setCourseFilter(courseId);
    setPage(1);
    fetchGrades({ courseFilter: courseId, page: 1 });
  };

  const handleSemesterFilterChange = (semester) => {
    setSemesterFilter(semester);
    setPage(1);
    fetchGrades({ semesterFilter: semester, page: 1 });
  };

  const handleSort = (column) => {
    let newOrder = 'ASC';
    if (sortBy === column) {
      newOrder = order === 'ASC' ? 'DESC' : 'ASC';
    }
    setSortBy(column);
    setOrder(newOrder);
    setPage(1);
    fetchGrades({ sortBy: column, order: newOrder, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchGrades({ page: newPage });
  };

  const handlePageSizeChange = (newSize) => {
    setLimit(newSize);
    setPage(1);
    fetchGrades({ limit: newSize, page: 1 });
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
    if (msg.includes('sinh viên') || msg.includes('student_id')) {
      fieldErrors.student_id = msg;
    }
    if (msg.includes('Môn học') || msg.includes('course_id')) {
      fieldErrors.course_id = msg;
    }
    if (msg.includes('học kỳ') || msg.includes('semester')) {
      fieldErrors.semester = msg;
    }
    if (msg.includes('Điểm') || msg.includes('score')) {
      fieldErrors.score = msg;
    }

    // Trường hợp lỗi trùng lặp cặp (student_id, course_id, semester)
    if (err.response?.status === 409) {
      fieldErrors.duplicate = msg;
    }

    return {
      message: msg || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại.',
      fieldErrors,
      status: err.response?.status,
    };
  };

  /**
   * Thêm điểm mới
   */
  const createGrade = async (gradeData) => {
    try {
      const res = await api.post('/grades', gradeData);
      if (res.data?.success) {
        fetchGrades();
        return { success: true, data: res.data.data, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Nhập điểm thất bại.' };
    } catch (err) {
      const { message, fieldErrors, status } = extractFieldErrors(err);
      return { success: false, message, fieldErrors, status };
    }
  };

  /**
   * Cập nhật điểm số
   */
  const updateGrade = async (id, gradeData) => {
    try {
      const res = await api.put(`/grades/${id}`, gradeData);
      if (res.data?.success) {
        fetchGrades();
        return { success: true, data: res.data.data, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Cập nhật điểm thất bại.' };
    } catch (err) {
      const { message, fieldErrors, status } = extractFieldErrors(err);
      return { success: false, message, fieldErrors, status };
    }
  };

  /**
   * Xóa bản ghi điểm
   */
  const deleteGrade = async (id) => {
    try {
      const res = await api.delete(`/grades/${id}`);
      if (res.data?.success) {
        if (grades.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchGrades();
        }
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Xóa điểm thất bại.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Không thể xóa bản ghi điểm.',
        status: err.response?.status,
      };
    }
  };

  /**
   * Lấy bảng điểm đầy đủ và GPA của sinh viên theo ID
   * GET /api/students/:id/grades
   */
  const getStudentTranscript = async (studentId) => {
    try {
      const res = await api.get(`/students/${studentId}/grades`);
      if (res.data?.success) {
        return {
          success: true,
          data: res.data,
          student: res.data.student,
          summary: res.data.summary,
          transcript: res.data.transcript,
        };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Không thể lấy bảng điểm sinh viên.',
        status: err.response?.status,
      };
    }
  };

  return {
    grades,
    pagination,
    loading,
    error,
    studentFilter,
    courseFilter,
    semesterFilter,
    sortBy,
    order,
    availableStudents,
    availableCourses,
    availableSemesters,
    fetchGrades,
    handleStudentFilterChange,
    handleCourseFilterChange,
    handleSemesterFilterChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    createGrade,
    updateGrade,
    deleteGrade,
    getStudentTranscript,
    refreshReferenceData: loadReferenceData,
  };
};

export default useGrades;
