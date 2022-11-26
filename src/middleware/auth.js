const { UserModel } = require("../models/user");

const authMiddleware = (req, res, next) => {
  // get token from client cookies
  const token = req.cookies.x_auth;

  UserModel.findByToken(token, (err, user) => {
    if ( err ) { // 500 Internal Server Error
      return res.status(500).json({ 
        isAuth: false
      });
    }
    if ( !user ) { // unvalid token
      return res.status(200).json({
        isAuth: false
      }); 
    }

    req.token = token;
    req.user = user;
    next();
  });
}

module.exports = { authMiddleware };