const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { testConnection } = require('./config/db');

// Tải biến môi trường từ .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (như cURL, Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Trong môi trường dev, tạm thời cho phép
    },
    credentials: true,
  })
);

// Middleware phân tích request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route gốc chào mừng
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chào mừng bạn đến với API Hệ Thống Quản Lý Sinh Viên!',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Gắn toàn bộ API routes với tiền tố /api
app.use('/api', routes);

// Middleware xử lý 404 cho các route không tồn tại
app.use(notFoundHandler);

// Middleware xử lý lỗi tập trung
app.use(errorHandler);

// Khởi chạy server
const server = app.listen(PORT, async () => {
  console.log('==================================================');
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🩺 Health check URL:    http://localhost:${PORT}/api/health`);
  console.log('==================================================');

  // Kiểm tra kết nối Database khi khởi động
  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log(`✅ [Database] ${dbStatus.message}`);
  } else {
    console.warn(`⚠️ [Database] Chưa thể kết nối MySQL: ${dbStatus.message}`);
    console.warn('👉 Vui lòng kiểm tra lại cấu hình trong file .env và đảm bảo MySQL đang chạy.');
  }
});

// Xử lý unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
