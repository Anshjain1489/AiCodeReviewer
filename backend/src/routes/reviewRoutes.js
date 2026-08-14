const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');
const { reviewLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);

router.post('/', reviewLimiter, reviewController.create);
router.get('/', reviewController.list);
router.get('/:id', reviewController.getById);
router.get('/:id/issues', reviewController.getIssues);
router.post('/:id/reanalyze', reviewLimiter, reviewController.reanalyze);
router.delete('/:id', reviewController.delete);
router.post('/:id/chat', reviewLimiter, reviewController.chat);

module.exports = router;
