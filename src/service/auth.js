const { UserModel } = require('../models/user');

const login = ( req, res, user ) => {
  user.generateToken((err, user) => {
    if ( err ) return res.status(500).json({
      message: '[DB-Error] Log-In Failed!'
    });

    // save token to cookie
    return res.cookie("x_auth", user.token, {
      sameSite: 'none', secure: true // For Cross-Site cookies
    }).status(200).json({
      loginSuccess: true,
      token: user.token,
      message: `Login Success: ${ user.username }`
    });
  });
}

const signupHandler = async (req, res) => {
  const credential = req.body.credential;

  try {
    if (!credential.username) {
      throw new Error('Empty Username');
    }

    const user = await UserModel.findOne({ username: credential.username });
    if (user) {
      return res.status(200).json({
        registerSuccess: false,
        message: 'Username already exists!'
      });
    }
  } catch (e) { // 500 Internal Server Error
    return res.status(500).json({ 
      registerSuccess: false,
      message: '[DB-Error] Sign-up Failed!' 
    });
  }

  const newUser = new UserModel({ 
    username: credential.username,
    password: credential.password 
  });

  newUser.save((err) => {
    if ( err ) { // 500 Internal Server Error
      return res.status(500).json({ 
        registerSuccess: false,
        message: '[DB-Error] Sign-up Failed!'
      });
    }
    else {
      return res.status(200).json({ 
        registerSuccess: true,
        message: `Register Success: ${ credential.username }`
      });
    }
  });
}

const signinHandler = (req, res) => {
  const credential = req.body.credential;
  UserModel.findOne({ username: credential.username }, (err, user) => {
    if ( err ) { // 500 Internal Server Error
      return res.status(500).json({ 
        loginSuccess: false,
        message: '[DB-Error] Sign-In Failed!'
      });
    }

    if ( user ) {
      user.comparePassword(credential.password, (err, isMatch) => {
        if ( err ) {
          return res.status(500).json({ 
            loginSuccess: false,
            message: '[DB-Error] Sign-In Failed!'
          });
        }

        if( !isMatch ) { 
          return res.status(200).json({
            loginSuccess: false,
            message: 'Wrong password!'
          });
        } else { // Login Success
          return login(req, res, user);
        }
      });
    } else {
      return res.status(200).json({
        loginSuccess: false,
        message: "Username doesn't exists!"
      });
    }
  });
}

const logoutHandler = (req, res) => {
  // req have req.user due to authMiddleware
  UserModel.findOneAndUpdate({ _id: req.user._id }, {
    token: "" // delete token
  }, (err, user) => {
    if ( err ) {
      return res.status(500).json({ 
        logoutSuccess: false,
        message: '[DB-Error] Logout Failed!'
      });
    }

    return res.cookie("x_auth", user.token, {
      sameSite: 'none', secure: true, maxAge: -1 // Delete cookie
    }).status(200).json({ 
      logoutSuccess: true,
      message: `Logout Success: ${ user.username }`
    });
  });
}

const findByUsername = (req, res) => {
  UserModel.findOne({ username: req.body.username }, (err, user) => {
    if ( err ) { // 500 Internal Server Error
      return res.status(500).json({ 
        result: false
      });
    }
    if ( user ) {
      return res.status(200).json({ 
        result: true
      });
    } else {
      return res.status(200).json({ 
        result: false
      });
    }
  });
}

module.exports = {
  signupHandler,
  signinHandler,
  logoutHandler,
  findByUsername
}