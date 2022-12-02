const { UserModel } = require('../models/user');

const getProfileHandler = (req, res) => {
  UserModel.findOne({ username: req.body.username }, (err, user) => {
    if ( err ) { // 500 Internal Server Error
      return res.status(500).json({ 
        result: false
      });
    }
    if ( user ) {
      if ( user.hideProfile && user.username !== req.user.username ) {
        // can't access to hiden profile, unless it owns to you
        return res.status(200).json({ 
          result: true,
          username: user.username,
          joinDate: user.createdAt,
          log: [],
          hideProfile: user.hideProfile
        });
      }

      return res.status(200).json({ 
        result: true,
        username: user.username,
        joinDate: user.createdAt,
        log: user.log,
        hideProfile: user.hideProfile
      });
    } else {
      return res.status(200).json({ 
        result: false
      });
    }
  });
}

const hideProfileHandler = (req, res) => {
  // req have req.user due to authMiddleware
  UserModel.findOneAndUpdate({ _id: req.user._id }, {
    hideProfile: (req.body.value === true)
  }, { returnDocument: 'after' }, (err, user) => {
    if ( err ) {
      return res.status(500).json({ 
        success: false
      });
    }
    return res.status(200).json({ 
      success: true,
      hideProfile: user.hideProfile
    });
  });
}

module.exports = {
  getProfileHandler,
  hideProfileHandler
}