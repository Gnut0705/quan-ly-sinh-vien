const express = require('express');
const healthRoutes = require('./health.routes');

const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const classRoutes = require('./class.routes');
const courseRoutes = require('./course.routes');
const gradeRoutes = require('./grade.routes');
const statsRoutes = require('./stats.routes');

const router = express.Router();

// Mount các router con
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/courses', courseRoutes);
router.use('/grades', gradeRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
