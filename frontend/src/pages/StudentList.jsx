import React, { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StudentFilters from '../components/students/StudentFilters';
import StudentTable from '../components/students/StudentTable';
import StudentForm from '../components/students/StudentForm';
import StudentDetailModal from '../components/students/StudentDetailModal';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

const StudentList = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const toast = useToast();

  const {
    students,
    pagination,
    classes,
    loading,
    search,
    classFilter,
    sortBy,
    order,
    handleSearchChange,
    handleClassFilterChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentDetail,
  } = useStudents();

  // State Modal Thêm / Sửa sinh viên
  const [formModal, setFormModal] = useState({
    isOpen: false,
    initialData: null,
    serverFieldErrors: {},
    loading: false,
  });

  // State Modal Xác nhận Xóa
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    student: null,
    loading: false,
  });

  // State Modal Xem Chi Tiết & Bảng Điểm
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    student: null,
  });

  // Mở modal thêm mới sinh viên
  const handleOpenAddModal = () => {
    setFormModal({
      isOpen: true,
      initialData: null,
      serverFieldErrors: {},
      loading: false,
    });
  };

  // Mở modal sửa thông tin sinh viên
  const handleOpenEditModal = (student) => {
    setFormModal({
      isOpen: true,
      initialData: student,
      serverFieldErrors: {},
      loading: false,
    });
  };

  // Đóng form modal
  const handleCloseFormModal = () => {
    setFormModal((prev) => ({
      ...prev,
      isOpen: false,
      serverFieldErrors: {},
    }));
  };

  // Xử lý submit Form (Thêm hoặc Sửa)
  const handleFormSubmit = async (formData) => {
    setFormModal((prev) => ({ ...prev, loading: true, serverFieldErrors: {} }));

    const isEdit = Boolean(formModal.initialData?.id);
    let result;

    if (isEdit) {
      result = await updateStudent(formModal.initialData.id, formData);
    } else {
      result = await createStudent(formData);
    }

    setFormModal((prev) => ({ ...prev, loading: false }));

    if (result.success) {
      toast.success(result.message || (isEdit ? 'Cập nhật sinh viên thành công!' : 'Thêm sinh viên thành công!'));
      handleCloseFormModal();
    } else {
      // Nếu có lỗi từng trường từ server (vd trùng mã SV, email)
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setFormModal((prev) => ({
          ...prev,
          serverFieldErrors: result.fieldErrors,
        }));
      }
      toast.error(result.message || 'Thao tác không thành công.');
    }
  };

  // Mở dialog xác nhận xóa
  const handleOpenDeleteModal = (student) => {
    setDeleteModal({
      isOpen: true,
      student,
      loading: false,
    });
  };

  // Xác nhận xóa sinh viên
  const handleConfirmDelete = async () => {
    if (!deleteModal.student) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    const result = await deleteStudent(deleteModal.student.id);
    setDeleteModal((prev) => ({ ...prev, loading: false, isOpen: false }));

    if (result.success) {
      toast.success(result.message || 'Xóa sinh viên thành công!');
    } else {
      toast.error(result.message || 'Không thể xóa sinh viên.');
    }
  };

  // Xem chi tiết sinh viên và bảng điểm
  const handleViewDetail = async (studentId) => {
    const result = await getStudentDetail(studentId);
    if (result.success) {
      setDetailModal({
        isOpen: true,
        student: result.data,
      });
    } else {
      toast.error(result.message || 'Không thể lấy thông tin chi tiết sinh viên.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px' }}>
            Quản Lý Sinh Viên
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Hệ thống hồ sơ sinh viên, phân lớp sinh hoạt và theo dõi học tập
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <StudentFilters
        search={search}
        onSearchChange={handleSearchChange}
        classFilter={classFilter}
        onClassFilterChange={handleClassFilterChange}
        classes={classes}
        onAddNew={handleOpenAddModal}
        isAdmin={isAdmin}
      />

      {/* Student Data Table */}
      <StudentTable
        students={students}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        onViewDetail={handleViewDetail}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        isAdmin={isAdmin}
      />

      {/* Reusable Pagination Component */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Modal Thêm / Sửa Sinh Viên */}
      <StudentForm
        isOpen={formModal.isOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={formModal.initialData}
        classes={classes}
        loading={formModal.loading}
        serverFieldErrors={formModal.serverFieldErrors}
      />

      {/* Modal Xác Nhận Xóa */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, student: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa sinh viên"
        message={`Bạn có chắc chắn muốn xóa sinh viên '${deleteModal.student?.full_name}' (Mã: ${deleteModal.student?.student_code}) khỏi hệ thống không? Toàn bộ điểm học phần liên quan sẽ bị xóa kèm và không thể hoàn tác.`}
        confirmText="Xóa sinh viên"
        cancelText="Hủy bỏ"
        isDanger={true}
        loading={deleteModal.loading}
      />

      {/* Modal Xem Chi Tiết & Bảng Điểm */}
      <StudentDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, student: null })}
        student={detailModal.student}
      />
    </div>
  );
};

export default StudentList;
