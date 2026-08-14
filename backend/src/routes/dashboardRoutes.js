const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/trends', dashboardController.getTrends);
router.get('/issues', dashboardController.getIssues);

module.exports = router;
