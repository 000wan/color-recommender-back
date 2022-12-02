const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// logger
const logHandler = require('../service/log');

router.get('/history', authMiddleware, logHandler.getLogHandler);
router.post('/action', authMiddleware, logHandler.addLogHandler);

// recommend
const { recommendHandler } = require('../service/recommend');

router.get('/recommend', authMiddleware, recommendHandler);

// profile
const profileHandler = require('../service/profile');

router.post('/profile', authMiddleware, profileHandler.getProfileHandler);
router.post('/hide-profile', authMiddleware, profileHandler.hideProfileHandler);

module.exports = router;
