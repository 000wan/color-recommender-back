const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { UserModel } = require('../models/user');

const router = express.Router();

router.get('/history', authMiddleware, (req, res) => {
  return res.status(200).json({
    isAuth: true,
    log: req.user.log
  });
});

router.post('/logAction', authMiddleware, (req, res) => {
  const { index, color } = req.body;
  const maxLogLength = 10;
  
  UserModel.findOneAndUpdate({ _id: req.user._id }, {
    $push: {
      log: {
        $each: [{
          index,
          color,
          timestamp: new Date()
        }], // push new log
        $sort: { timestamp: -1 }, // sort by descending time
        $slice: maxLogLength // slice from left
      }
    }
  }, { returnDocument: 'after' }, (err, user) => {
    if ( err ) {
      return res.status(500).json({ 
        logSuccess: false
      });
    }
    return res.status(200).json({ 
      logSuccess: true,
      log: user.log
    });
  });
});

module.exports = router;
