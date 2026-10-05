import React, { useState } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CourseFilters from '../components/courses/CourseFilters';
import CourseTable from '../components/courses/CourseTable';
import CourseForm from '../components/courses/CourseForm';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

const CourseList = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const toast = useToast();

  const {
    courses,
    pagination,
    loading,
    search,
    sortBy,
    order,
    handleSearchChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useCourses();

  // State Modal Thêm / Sửa môn học
  const [formModal, setFormModal] = useState({
    isOpen: false,
    initialData: null,
    serverFieldErrors: {},
    loading: false,
  });

  // State Modal Xác nhận Xóa
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    course: null,
    loading: false,
  });

  // Mở modal thêm mới môn học
  const handleOpenAddModal = () => {
    setFormModal({
      isOpen: true,
      initialData: null,
      serverFieldErrors: {},
      loading: false,
    });
  };

  // Mở modal sửa thông tin môn học
  const handleOpenEditModal = (course) => {
    setFormModal({
      isOpen: true,
      initialData: course,
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
      result = await updateCourse(formModal.initialData.id, formData);
    } else {
      result = await createCourse(formData);
    }

    setFormModal((prev) => ({ ...prev, loading: false }));

    if (result.success) {
      toast.success(
        result.message || (isEdit ? 'Cập nhật môn học thành công!' : 'Thêm môn học thành công!')
      );
      handleCloseFormModal();
    } else {
      // Nếu có lỗi từng trường từ server (vd trùng mã môn học)
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
  const handleOpenDeleteModal = (course) => {
    setDeleteModal({
      isOpen: true,
      course,
      loading: false,
    });
  };

  // Xác nhận xóa môn học (xử lý lỗi 409 nếu môn học đã có điểm)
  const handleConfirmDelete = async () => {
    if (!deleteModal.course) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    const result = await deleteCourse(deleteModal.course.id);
    setDeleteModal((prev) => ({ ...prev, loading: false, isOpen: false }));

    if (result.success) {
      toast.success(result.message || 'Xóa môn học thành công!');
    } else {
      // Hiển thị thông báo lỗi 409 từ server khi môn đã có điểm / sinh viên đăng ký
      toast.error(result.message || 'Không thể xóa môn học.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px' }}>
            Quản Lý Môn Học
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Quản lý chương trình học phần, mã môn học và số lượng tín chỉ đào tạo
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <CourseFilters
        search={search}
        onSearchChange={handleSearchChange}
        onAddNew={handleOpenAddModal}
        isAdmin={isAdmin}
      />

      {/* Course Data Table */}
      <CourseTable
        courses={courses}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
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

      {/* Modal Thêm / Sửa Môn Học */}
      <CourseForm
        isOpen={formModal.isOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={formModal.initialData}
        loading={formModal.loading}
        serverFieldErrors={formModal.serverFieldErrors}
      />

      {/* Modal Xác Nhận Xóa */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, course: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa môn học"
        message={`Bạn có chắc chắn muốn xóa môn '${deleteModal.course?.course_name}' (Mã: ${deleteModal.course?.course_code}) khỏi chương trình đào tạo không? Lưu ý: Nếu môn học đã có sinh viên đăng ký hoặc có dữ liệu điểm, hệ thống sẽ từ chối xóa.`}
        confirmText="Xóa môn học"
        cancelText="Hủy bỏ"
        isDanger={true}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default CourseList;
