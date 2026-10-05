const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Khởi tạo Connection Pool thay vì Single Connection để tối ưu hiệu năng
// và tự động quản lý các kết nối tái sử dụng trong hệ thống
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qlsv_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

/**
 * Kiểm tra kết nối tới MySQL Database
 * @returns {Promise<{connected: boolean, message: string}>}
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return { connected: true, message: 'Kết nối MySQL thành công!' };
  } catch (error) {
    return { connected: false, message: error.message };
  }
};

module.exports = {
  pool,
  testConnection,
};
