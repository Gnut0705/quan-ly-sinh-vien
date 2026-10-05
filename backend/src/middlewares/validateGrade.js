/**
 * Middleware validate dữ liệu nhập điểm mới (POST /api/grades)
 */
const validateCreateGrade = (req, res, next) => {
  const { student_id, course_id, semester, score } = req.body;
  const errors = [];

  // 1. student_id
  const studentIdNum = Number(student_id);
  if (!student_id || isNaN(studentIdNum) || studentIdNum <= 0) {
    errors.push({ field: 'student_id', message: 'ID sinh viên (student_id) phải là số nguyên dương hợp lệ.' });
  }

  // 2. course_id
  const courseIdNum = Number(course_id);
  if (!course_id || isNaN(courseIdNum) || courseIdNum <= 0) {
    errors.push({ field: 'course_id', message: 'ID môn học (course_id) phải là số nguyên dương hợp lệ.' });
  }

  // 3. semester
  if (!semester || typeof semester !== 'string' || !semester.trim()) {
    errors.push({ field: 'semester', message: 'Học kỳ là bắt buộc (ví dụ: 2023.1, 2023.2).' });
  } else if (semester.trim().length < 2 || semester.trim().length > 20) {
    errors.push({ field: 'semester', message: 'Học kỳ không được vượt quá 20 ký tự.' });
  }

  // 4. score (0.00 đến 10.00 hoặc null nếu đang học)
  if (score !== undefined && score !== null && score !== '') {
    const scoreNum = Number(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      errors.push({ field: 'score', message: 'Điểm số phải là số trong khoảng từ 0.00 đến 10.00.' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu điểm số không hợp lệ.',
      errors,
    });
  }

  // Chuẩn hóa dữ liệu
  req.body.student_id = studentIdNum;
  req.body.course_id = courseIdNum;
  req.body.semester = semester.trim();
  if (score !== undefined && score !== null && score !== '') {
    req.body.score = Number(Number(score).toFixed(2));
  } else {
    req.body.score = null;
  }

  next();
};

/**
 * Middleware validate dữ liệu cập nhật điểm (PUT /api/grades/:id)
 */
const validateUpdateGrade = (req, res, next) => {
  const { student_id, course_id, semester, score } = req.body;
  const errors = [];

  if (student_id !== undefined) {
    const studentIdNum = Number(student_id);
    if (isNaN(studentIdNum) || studentIdNum <= 0) {
      errors.push({ field: 'student_id', message: 'ID sinh viên (student_id) phải là số nguyên dương hợp lệ.' });
    }
  }

  if (course_id !== undefined) {
    const courseIdNum = Number(course_id);
    if (isNaN(courseIdNum) || courseIdNum <= 0) {
      errors.push({ field: 'course_id', message: 'ID môn học (course_id) phải là số nguyên dương hợp lệ.' });
    }
  }

  if (semester !== undefined) {
    if (typeof semester !== 'string' || semester.trim().length < 2 || semester.trim().length > 20) {
      errors.push({ field: 'semester', message: 'Học kỳ không được vượt quá 20 ký tự.' });
    }
  }

  if (score !== undefined && score !== null && score !== '') {
    const scoreNum = Number(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      errors.push({ field: 'score', message: 'Điểm số phải là số trong khoảng từ 0.00 đến 10.00.' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu cập nhật điểm số không hợp lệ.',
      errors,
    });
  }

  if (student_id !== undefined) req.body.student_id = Number(student_id);
  if (course_id !== undefined) req.body.course_id = Number(course_id);
  if (semester !== undefined) req.body.semester = semester.trim();
  if (score !== undefined) {
    req.body.score = score !== null && score !== '' ? Number(Number(score).toFixed(2)) : null;
  }

  next();
};

module.exports = {
  validateCreateGrade,
  validateUpdateGrade,
};
