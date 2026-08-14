const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/connect', authenticate, githubController.connect);
router.get('/callback', githubController.callback);

router.use(authenticate);
router.get('/repositories', githubController.listRepositories);
router.get('/repositories/:id/branches', githubController.listBranches);
router.post('/repositories/:id/review', githubController.reviewRepository);
router.get('/repositories/:id/pulls', githubController.listPullRequests);
router.post('/pulls/:id/review', githubController.reviewPullRequest);
router.post('/pulls/:id/comments', githubController.publishComment);

module.exports = router;
