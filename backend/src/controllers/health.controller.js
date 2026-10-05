const { testConnection } = require('../config/db');

/**
 * Controller kiểm tra trạng thái hoạt động của Server và Database
 * Endpoint: GET /api/health
 */
const checkHealth = async (req, res, next) => {
  try {
    const dbStatus = await testConnection();

    const healthData = {
      success: true,
      service: 'Student Management System API',
      status: dbStatus.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: `${process.uptime().toFixed(1)}s`,
      environment: process.env.NODE_ENV || 'development',
      database: {
        type: 'MySQL',
        name: process.env.DB_NAME || 'qlsv_db',
        connected: dbStatus.connected,
        message: dbStatus.message,
      },
    };

    const statusCode = dbStatus.connected ? 200 : 503;
    return res.status(statusCode).json(healthData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkHealth,
};
