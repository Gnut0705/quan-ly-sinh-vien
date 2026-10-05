import React, { useState } from 'react';
import { useGrades } from '../hooks/useGrades';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GradeFilters from '../components/grades/GradeFilters';
import GradeTable from '../components/grades/GradeTable';
import GradeForm from '../components/grades/GradeForm';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

const GradeList = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  const canEdit = isAdmin || isTeacher;
  const isStudent = role === 'student';
  const toast = useToast();

  const {
    grades,
    pagination,
    loading,
    studentFilter,
    courseFilter,
    semesterFilter,
    sortBy,
    order,
    availableStudents,
    availableCourses,
    availableSemesters,
    handleStudentFilterChange,
    handleCourseFilterChange,
    handleSemesterFilterChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    createGrade,
    updateGrade,
    deleteGrade,
  } = useGrades();

  // State Modal Thêm / Sửa điểm
  const [formModal, setFormModal] = useState({
    isOpen: false,
    initialData: null,
    serverFieldErrors: {},
    loading: false,
  });

  // State Modal Xác nhận Xóa
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    grade: null,
    loading: false,
  });

  // Mở modal thêm mới điểm
  const handleOpenAddModal = () => {
    setFormModal({
      isOpen: true,
      initialData: null,
      serverFieldErrors: {},
      loading: false,
    });
  };

  // Mở modal sửa thông tin điểm
  const handleOpenEditModal = (grade) => {
    setFormModal({
      isOpen: true,
      initialData: grade,
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
      result = await updateGrade(formModal.initialData.id, formData);
    } else {
      result = await createGrade(formData);
    }

    setFormModal((prev) => ({ ...prev, loading: false }));

    if (result.success) {
      toast.success(
        result.message || (isEdit ? 'Cập nhật điểm thành công!' : 'Nhập điểm học phần thành công!')
      );
      handleCloseFormModal();
    } else {
      // Nếu có lỗi từng trường hoặc lỗi trùng lặp từ server
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
  const handleOpenDeleteModal = (grade) => {
    setDeleteModal({
      isOpen: true,
      grade,
      loading: false,
    });
  };

  // Xác nhận xóa điểm
  const handleConfirmDelete = async () => {
    if (!deleteModal.grade) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    const result = await deleteGrade(deleteModal.grade.id);
    setDeleteModal((prev) => ({ ...prev, loading: false, isOpen: false }));

    if (result.success) {
      toast.success(result.message || 'Xóa bản ghi điểm thành công!');
    } else {
      toast.error(result.message || 'Không thể xóa bản ghi điểm.');
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
            {isStudent ? 'Kết Quả Học Tập Của Tôi' : 'Quản Lý Điểm Số & Học Phần'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {isStudent
              ? 'Theo dõi bảng điểm, điểm quy đổi và kết quả học tập qua từng học kỳ'
              : 'Theo dõi, nhập và điều chỉnh điểm số các môn học của sinh viên theo từng học kỳ'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GradeFilters
        studentFilter={studentFilter}
        onStudentFilterChange={handleStudentFilterChange}
        courseFilter={courseFilter}
        onCourseFilterChange={handleCourseFilterChange}
        semesterFilter={semesterFilter}
        onSemesterFilterChange={handleSemesterFilterChange}
        availableStudents={availableStudents}
        availableCourses={availableCourses}
        availableSemesters={availableSemesters}
        onAddNew={handleOpenAddModal}
        canEdit={canEdit}
        isStudent={isStudent}
      />

      {/* Grade Data Table */}
      <GradeTable
        grades={grades}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        canEdit={canEdit}
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

      {/* Modal Nhập / Sửa Điểm */}
      <GradeForm
        isOpen={formModal.isOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={formModal.initialData}
        availableStudents={availableStudents}
        availableCourses={availableCourses}
        availableSemesters={availableSemesters}
        loading={formModal.loading}
        serverFieldErrors={formModal.serverFieldErrors}
      />

      {/* Modal Xác Nhận Xóa */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, grade: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bản ghi điểm"
        message={`Bạn có chắc chắn muốn xóa điểm môn '${deleteModal.grade?.course_name}' của sinh viên '${deleteModal.grade?.student_name}' (Học kỳ: ${deleteModal.grade?.semester}) không? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa bản ghi"
        cancelText="Hủy bỏ"
        isDanger={true}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default GradeList;
