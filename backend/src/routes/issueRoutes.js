const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/:id', issueController.getById);
router.patch('/:id', issueController.updateStatus);
router.post('/:id/explain', issueController.explain);
router.post('/:id/fix', issueController.fix);
router.post('/:id/accept-fix', issueController.acceptFix);

module.exports = router;
