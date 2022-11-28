const { UserModel } = require('../models/user');

const getLog = (req, res) => {
  try {
    const length = parseInt(req.query.length);

    return res.status(200).json({
      isAuth: true,
      log: req.user.log.slice(0, length)
    });
  } catch(e) {
    return res.status(500).json({
      isAuth: true,
      log: []
    });
  }
}

const addLog = (req, res) => {
  const { index, color, length } = req.body;
  const maxLogLength = 100; // important
  
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
    try {
      return res.status(200).json({ 
        logSuccess: true,
        log: user.log.slice(0, length)
      });
    } catch(e) {
      return res.status(500).json({ 
        logSuccess: true,
        log: []
      });
    }
  });
}

module.exports = {
  getLog,
  addLog
}