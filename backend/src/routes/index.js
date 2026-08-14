const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const reviewRoutes = require('./reviewRoutes');
const issueRoutes = require('./issueRoutes');
const githubRoutes = require('./githubRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const healthRoutes = require('./healthRoutes');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/reviews', reviewRoutes);
router.use('/issues', issueRoutes);
router.use('/github', githubRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
