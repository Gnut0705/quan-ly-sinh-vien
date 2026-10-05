import React, { useState } from 'react';
import { useClasses } from '../hooks/useClasses';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ClassFilters from '../components/classes/ClassFilters';
import ClassTable from '../components/classes/ClassTable';
import ClassForm from '../components/classes/ClassForm';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ClassList = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const toast = useToast();

  const {
    classes,
    pagination,
    loading,
    search,
    facultyFilter,
    schoolYearFilter,
    sortBy,
    order,
    handleSearchChange,
    handleFacultyFilterChange,
    handleSchoolYearFilterChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    createClass,
    updateClass,
    deleteClass,
  } = useClasses();

  // Danh sách các khoa và niên khóa hiện có trong bảng để đưa vào dropdown filter
  const availableFaculties = Array.from(new Set(classes.map((c) => c.faculty).filter(Boolean)));
  const availableSchoolYears = Array.from(new Set(classes.map((c) => c.school_year).filter(Boolean)));

  // State Modal Thêm / Sửa lớp học
  const [formModal, setFormModal] = useState({
    isOpen: false,
    initialData: null,
    serverFieldErrors: {},
    loading: false,
  });

  // State Modal Xác nhận Xóa
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    classItem: null,
    loading: false,
  });

  // Mở modal thêm mới lớp học
  const handleOpenAddModal = () => {
    setFormModal({
      isOpen: true,
      initialData: null,
      serverFieldErrors: {},
      loading: false,
    });
  };

  // Mở modal sửa thông tin lớp học
  const handleOpenEditModal = (classItem) => {
    setFormModal({
      isOpen: true,
      initialData: classItem,
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
      result = await updateClass(formModal.initialData.id, formData);
    } else {
      result = await createClass(formData);
    }

    setFormModal((prev) => ({ ...prev, loading: false }));

    if (result.success) {
      toast.success(
        result.message || (isEdit ? 'Cập nhật lớp học thành công!' : 'Thêm lớp học thành công!')
      );
      handleCloseFormModal();
    } else {
      // Nếu có lỗi từng trường từ server (vd trùng tên lớp)
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
  const handleOpenDeleteModal = (classItem) => {
    setDeleteModal({
      isOpen: true,
      classItem,
      loading: false,
    });
  };

  // Xác nhận xóa lớp học (xử lý lỗi 409 nếu lớp còn sinh viên)
  const handleConfirmDelete = async () => {
    if (!deleteModal.classItem) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    const result = await deleteClass(deleteModal.classItem.id);
    setDeleteModal((prev) => ({ ...prev, loading: false, isOpen: false }));

    if (result.success) {
      toast.success(result.message || 'Xóa lớp học thành công!');
    } else {
      // Hiển thị trực tiếp thông báo lỗi từ server (bao gồm lỗi 409 lớp còn sinh viên)
      toast.error(result.message || 'Không thể xóa lớp học.');
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
            Quản Lý Lớp Học
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Quản lý danh sách lớp sinh hoạt, chuyên ngành, niên khóa và phân bố sinh viên
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <ClassFilters
        search={search}
        onSearchChange={handleSearchChange}
        facultyFilter={facultyFilter}
        onFacultyFilterChange={handleFacultyFilterChange}
        schoolYearFilter={schoolYearFilter}
        onSchoolYearFilterChange={handleSchoolYearFilterChange}
        availableFaculties={availableFaculties}
        availableSchoolYears={availableSchoolYears}
        onAddNew={handleOpenAddModal}
        isAdmin={isAdmin}
      />

      {/* Class Data Table */}
      <ClassTable
        classes={classes}
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

      {/* Modal Thêm / Sửa Lớp Học */}
      <ClassForm
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
        onClose={() => setDeleteModal({ isOpen: false, classItem: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa lớp học"
        message={`Bạn có chắc chắn muốn xóa lớp '${deleteModal.classItem?.class_name}' khỏi hệ thống không? Lưu ý: Nếu lớp học vẫn còn sinh viên, hệ thống sẽ ngăn chặn thao tác xóa để bảo toàn dữ liệu.`}
        confirmText="Xóa lớp học"
        cancelText="Hủy bỏ"
        isDanger={true}
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default ClassList;
