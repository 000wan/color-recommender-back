const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const logHandler = require('../service/log');

const router = express.Router();

// logger
router.get('/history', authMiddleware, logHandler.getLogHandler);
router.post('/action', authMiddleware, logHandler.addLogHandler);

// recommend
const { recommendHandler } = require('../service/recommend');

router.get('/recommend', authMiddleware, recommendHandler);

module.exports = router;
