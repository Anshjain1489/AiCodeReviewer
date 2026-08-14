const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', projectController.list);
router.post('/', projectController.create);
router.get('/:id', projectController.getById);
router.patch('/:id', projectController.update);
router.delete('/:id', projectController.delete);

module.exports = router;
