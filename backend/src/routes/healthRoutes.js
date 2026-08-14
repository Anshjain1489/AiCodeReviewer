const express = require('express');
const router = express.Router();
const { successResponse } = require('../utils/responseFormatter');

router.get('/', (req, res) => {
  return successResponse(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ai-code-reviewer-backend',
    version: '1.0.0',
  });
});

module.exports = router;
