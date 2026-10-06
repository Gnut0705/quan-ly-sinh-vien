/**
 * Middleware bắt các route không tồn tại (404 Not Found)
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware xử lý lỗi tập trung (Centralized Error Handler)
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ (Internal Server Error)';

  // Xử lý lỗi cú pháp JSON trong request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Dữ liệu JSON gửi lên không đúng định dạng!';
  }

  // Xử lý các mã lỗi phổ biến từ MySQL (mysql2)
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        statusCode = 409;
        message = 'Dữ liệu đã tồn tại trong hệ thống (trùng lặp giá trị UNIQUE).';
        break;
      case 'ER_NO_REFERENCED_ROW_2':
        statusCode = 400;
        message = 'Dữ liệu tham chiếu không tồn tại (vi phạm khóa ngoại Foreign Key).';
        break;
      case 'ER_ROW_IS_REFERENCED_2':
        statusCode = 400;
        message = 'Không thể xóa hoặc cập nhật do dữ liệu đang được liên kết ở bảng khác.';
        break;
      case 'ECONNREFUSED':
        statusCode = 503;
        message = 'Không thể kết nối đến cơ sở dữ liệu MySQL.';
        break;
      default:
        break;
    }
  }

  const response = {
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  };

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
