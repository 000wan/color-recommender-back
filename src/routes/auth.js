const express = require('express');
const router = express.Router();

const authHandler = require('../service/auth');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', authHandler.signupHandler);
router.post('/login', authHandler.signinHandler);

router.post('/find-user', authHandler.findByUsername);

router.get('/', authMiddleware, (req, res) => {
  return res.status(200).json({
    isAuth: true,
    username: req.user.username
  });
});

router.get('/logout', authMiddleware, authHandler.logoutHandler);

module.exports = router;
