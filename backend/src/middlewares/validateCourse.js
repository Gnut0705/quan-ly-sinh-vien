const COURSE_CODE_REGEX = /^[A-Za-z0-9_-]{3,20}$/;

/**
 * Middleware validate dữ liệu tạo mới môn học
 */
const validateCreateCourse = (req, res, next) => {
  const { course_code, course_name, credits } = req.body;
  const errors = [];

  // 1. course_code
  if (!course_code || typeof course_code !== 'string' || !course_code.trim()) {
    errors.push({ field: 'course_code', message: 'Mã môn học là bắt buộc.' });
  } else if (!COURSE_CODE_REGEX.test(course_code.trim())) {
    errors.push({
      field: 'course_code',
      message: 'Mã môn học phải từ 3 đến 20 ký tự (chỉ bao gồm chữ, số, gạch nối hoặc gạch dưới).',
    });
  }

  // 2. course_name
  if (!course_name || typeof course_name !== 'string' || !course_name.trim()) {
    errors.push({ field: 'course_name', message: 'Tên môn học là bắt buộc.' });
  } else if (course_name.trim().length < 2 || course_name.trim().length > 100) {
    errors.push({ field: 'course_name', message: 'Tên môn học phải từ 2 đến 100 ký tự.' });
  }

  // 3. credits (số tín chỉ: nguyên từ 1 đến 6)
  const creditsNum = Number(credits);
  if (credits === undefined || credits === null || !Number.isInteger(creditsNum) || creditsNum < 1 || creditsNum > 6) {
    errors.push({
      field: 'credits',
      message: 'Số tín chỉ phải là số nguyên từ 1 đến 6.',
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu môn học không hợp lệ.',
      errors,
    });
  }

  // Chuẩn hóa dữ liệu
  req.body.course_code = course_code.trim().toUpperCase();
  req.body.course_name = course_name.trim();
  req.body.credits = creditsNum;

  next();
};

/**
 * Middleware validate dữ liệu cập nhật môn học
 */
const validateUpdateCourse = (req, res, next) => {
  const { course_code, course_name, credits } = req.body;
  const errors = [];

  if (course_code !== undefined) {
    if (typeof course_code !== 'string' || !COURSE_CODE_REGEX.test(course_code.trim())) {
      errors.push({
        field: 'course_code',
        message: 'Mã môn học phải từ 3 đến 20 ký tự (chữ, số, gạch nối hoặc gạch dưới).',
      });
    }
  }

  if (course_name !== undefined) {
    if (typeof course_name !== 'string' || course_name.trim().length < 2 || course_name.trim().length > 100) {
      errors.push({ field: 'course_name', message: 'Tên môn học phải từ 2 đến 100 ký tự.' });
    }
  }

  if (credits !== undefined) {
    const creditsNum = Number(credits);
    if (!Number.isInteger(creditsNum) || creditsNum < 1 || creditsNum > 6) {
      errors.push({
        field: 'credits',
        message: 'Số tín chỉ phải là số nguyên từ 1 đến 6.',
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu cập nhật môn học không hợp lệ.',
      errors,
    });
  }

  if (course_code) req.body.course_code = course_code.trim().toUpperCase();
  if (course_name) req.body.course_name = course_name.trim();
  if (credits !== undefined) req.body.credits = Number(credits);

  next();
};

module.exports = {
  validateCreateCourse,
  validateUpdateCourse,
};
