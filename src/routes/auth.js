const express = require('express');
const router = express.Router();

const authHandler = require('../service/auth');

router.post('/register', authHandler.signupHandler);
router.post('/login', authHandler.signinHandler);

router.post('/find-user', authHandler.findByUsername);

module.exports = router;
