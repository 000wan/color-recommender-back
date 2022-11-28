const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const logHandler = require('../service/log');

const router = express.Router();

router.get('/history', authMiddleware, logHandler.getLog);

router.post('/logAction', authMiddleware, logHandler.addLog);

module.exports = router;
