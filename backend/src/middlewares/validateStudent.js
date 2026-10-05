const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_CODE_REGEX = /^[A-Za-z0-9_-]{4,20}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_REGEX = /^[0-9+() -]{9,20}$/;
const ALLOWED_GENDERS = ['male', 'female', 'other'];

/**
 * Middleware validate dữ liệu tạo mới sinh viên
 */
const validateCreateStudent = (req, res, next) => {
  const { student_code, full_name, dob, gender, email, phone, address, class_id } = req.body;
  const errors = [];

  // 1. student_code
  if (!student_code || typeof student_code !== 'string' || !student_code.trim()) {
    errors.push({ field: 'student_code', message: 'Mã sinh viên là bắt buộc.' });
  } else if (!STUDENT_CODE_REGEX.test(student_code.trim())) {
    errors.push({
      field: 'student_code',
      message: 'Mã sinh viên phải từ 4 đến 20 ký tự (chỉ bao gồm chữ, số, gạch nối hoặc gạch dưới).',
    });
  }

  // 2. full_name
  if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
    errors.push({ field: 'full_name', message: 'Họ và tên là bắt buộc.' });
  } else if (full_name.trim().length < 2 || full_name.trim().length > 100) {
    errors.push({ field: 'full_name', message: 'Họ và tên phải từ 2 đến 100 ký tự.' });
  }

  // 3. dob (ngày sinh)
  if (!dob || typeof dob !== 'string' || !DATE_REGEX.test(dob.trim())) {
    errors.push({ field: 'dob', message: 'Ngày sinh không đúng định dạng YYYY-MM-DD.' });
  } else {
    const parsedDate = new Date(dob);
    if (isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
      errors.push({ field: 'dob', message: 'Ngày sinh không hợp lệ hoặc lớn hơn ngày hiện tại.' });
    }
  }

  // 4. gender
  if (!gender || !ALLOWED_GENDERS.includes(gender)) {
    errors.push({
      field: 'gender',
      message: `Giới tính không hợp lệ. Chỉ chấp nhận: ${ALLOWED_GENDERS.join(', ')}.`,
    });
  }

  // 5. email
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Email là bắt buộc.' });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Định dạng email không hợp lệ.' });
  }

  // 6. phone (optional)
  if (phone && (typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim()))) {
    errors.push({ field: 'phone', message: 'Số điện thoại không đúng định dạng.' });
  }

  // 7. address (optional)
  if (address && typeof address === 'string' && address.length > 255) {
    errors.push({ field: 'address', message: 'Địa chỉ không được dài quá 255 ký tự.' });
  }

  // 8. class_id
  const classIdNum = Number(class_id);
  if (!class_id || isNaN(classIdNum) || classIdNum <= 0) {
    errors.push({ field: 'class_id', message: 'Lớp học (class_id) phải là số nguyên dương hợp lệ.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu sinh viên không hợp lệ.',
      errors,
    });
  }

  // Chuẩn hóa dữ liệu trước khi vào Controller
  req.body.student_code = student_code.trim().toUpperCase();
  req.body.full_name = full_name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.dob = dob.trim();
  req.body.gender = gender;
  req.body.class_id = classIdNum;
  if (phone) req.body.phone = phone.trim();
  if (address) req.body.address = address.trim();

  next();
};

/**
 * Middleware validate dữ liệu cập nhật sinh viên
 */
const validateUpdateStudent = (req, res, next) => {
  const { student_code, full_name, dob, gender, email, phone, address, class_id } = req.body;
  const errors = [];

  if (student_code !== undefined) {
    if (typeof student_code !== 'string' || !STUDENT_CODE_REGEX.test(student_code.trim())) {
      errors.push({
        field: 'student_code',
        message: 'Mã sinh viên phải từ 4 đến 20 ký tự (chữ, số, gạch nối hoặc gạch dưới).',
      });
    }
  }

  if (full_name !== undefined) {
    if (typeof full_name !== 'string' || full_name.trim().length < 2 || full_name.trim().length > 100) {
      errors.push({ field: 'full_name', message: 'Họ và tên phải từ 2 đến 100 ký tự.' });
    }
  }

  if (dob !== undefined) {
    if (typeof dob !== 'string' || !DATE_REGEX.test(dob.trim())) {
      errors.push({ field: 'dob', message: 'Ngày sinh không đúng định dạng YYYY-MM-DD.' });
    }
  }

  if (gender !== undefined && !ALLOWED_GENDERS.includes(gender)) {
    errors.push({
      field: 'gender',
      message: `Giới tính không hợp lệ. Chỉ chấp nhận: ${ALLOWED_GENDERS.join(', ')}.`,
    });
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      errors.push({ field: 'email', message: 'Định dạng email không hợp lệ.' });
    }
  }

  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
      errors.push({ field: 'phone', message: 'Số điện thoại không đúng định dạng.' });
    }
  }

  if (class_id !== undefined) {
    const classIdNum = Number(class_id);
    if (isNaN(classIdNum) || classIdNum <= 0) {
      errors.push({ field: 'class_id', message: 'Lớp học (class_id) phải là số nguyên dương hợp lệ.' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu cập nhật sinh viên không hợp lệ.',
      errors,
    });
  }

  if (student_code) req.body.student_code = student_code.trim().toUpperCase();
  if (full_name) req.body.full_name = full_name.trim();
  if (email) req.body.email = email.trim().toLowerCase();
  if (dob) req.body.dob = dob.trim();
  if (phone !== undefined) req.body.phone = phone ? phone.trim() : null;
  if (address !== undefined) req.body.address = address ? address.trim() : null;
  if (class_id) req.body.class_id = Number(class_id);

  next();
};

module.exports = {
  validateCreateStudent,
  validateUpdateStudent,
};
