/**
 * Middleware validate dữ liệu tạo mới lớp học
 */
const validateCreateClass = (req, res, next) => {
  const { class_name, faculty, school_year } = req.body;
  const errors = [];

  // 1. class_name
  if (!class_name || typeof class_name !== 'string' || !class_name.trim()) {
    errors.push({ field: 'class_name', message: 'Tên lớp học là bắt buộc.' });
  } else if (class_name.trim().length < 2 || class_name.trim().length > 50) {
    errors.push({ field: 'class_name', message: 'Tên lớp học phải từ 2 đến 50 ký tự.' });
  }

  // 2. faculty
  if (!faculty || typeof faculty !== 'string' || !faculty.trim()) {
    errors.push({ field: 'faculty', message: 'Khoa / Viện quản lý là bắt buộc.' });
  } else if (faculty.trim().length < 2 || faculty.trim().length > 100) {
    errors.push({ field: 'faculty', message: 'Tên khoa / viện phải từ 2 đến 100 ký tự.' });
  }

  // 3. school_year
  if (!school_year || typeof school_year !== 'string' || !school_year.trim()) {
    errors.push({ field: 'school_year', message: 'Niên khóa là bắt buộc (ví dụ: 2022-2026).' });
  } else if (school_year.trim().length < 2 || school_year.trim().length > 20) {
    errors.push({ field: 'school_year', message: 'Niên khóa không được vượt quá 20 ký tự.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu lớp học không hợp lệ.',
      errors,
    });
  }

  // Chuẩn hóa dữ liệu
  req.body.class_name = class_name.trim();
  req.body.faculty = faculty.trim();
  req.body.school_year = school_year.trim();

  next();
};

/**
 * Middleware validate dữ liệu cập nhật lớp học
 */
const validateUpdateClass = (req, res, next) => {
  const { class_name, faculty, school_year } = req.body;
  const errors = [];

  if (class_name !== undefined) {
    if (typeof class_name !== 'string' || class_name.trim().length < 2 || class_name.trim().length > 50) {
      errors.push({ field: 'class_name', message: 'Tên lớp học phải từ 2 đến 50 ký tự.' });
    }
  }

  if (faculty !== undefined) {
    if (typeof faculty !== 'string' || faculty.trim().length < 2 || faculty.trim().length > 100) {
      errors.push({ field: 'faculty', message: 'Tên khoa / viện phải từ 2 đến 100 ký tự.' });
    }
  }

  if (school_year !== undefined) {
    if (typeof school_year !== 'string' || school_year.trim().length < 2 || school_year.trim().length > 20) {
      errors.push({ field: 'school_year', message: 'Niên khóa không được vượt quá 20 ký tự.' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu cập nhật lớp học không hợp lệ.',
      errors,
    });
  }

  if (class_name) req.body.class_name = class_name.trim();
  if (faculty) req.body.faculty = faculty.trim();
  if (school_year) req.body.school_year = school_year.trim();

  next();
};

module.exports = {
  validateCreateClass,
  validateUpdateClass,
};
