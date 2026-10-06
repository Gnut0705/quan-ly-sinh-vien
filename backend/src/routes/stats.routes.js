const express = require('express');
const StatsController = require('../controllers/stats.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET /api/stats (Bảo vệ bởi verifyToken, phân quyền theo role trong controller)
router.get('/', verifyToken, StatsController.getStats);

module.exports = router;
