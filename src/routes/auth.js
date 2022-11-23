const express = require('express');
const { UserModel } = require('../models/user');
const router = express.Router();

const signupHandler = async (req, res) => {
  const credential = req.body.credential;

  try {
    const user = await UserModel.findOne({ username: credential.username });
    if (user) { // 409 Conflict
      return res.status(409).json({ message: 'Username already exists!' });
    }
  } catch (e) { // 500 Internal Server Error
    return res.status(500).json({ message: '[DB-Error] Sign-up Failed!' });
  }

  const newUser = new UserModel({ 
    username: credential.username,
    password: credential.password 
  });

  newUser.save((err) => {
    if (err) { // 500 Internal Server Error
      return res.status(500).json({ message: '[DB-Error] Sign-up Failed!' });
    }
    else {
      return res.status(200).json({ message: 'Sign-up Success!' });
    }
  });
}

const signinHandler = (req, res) => {
  const credential = req.body.credential;
  UserModel.findOne({ username: credential.username }, (err, user) => {
    if ( user ) {
      user.comparePassword(credential.password, (err, isMatch)=>{
        if(!isMatch) { // 406 Not Acceptable
          return res.status(406).json({
            loginSuccess: false,
            message: 'Wrong password!'
          });
        } else { // Login Success
          return res.status(200).json({
            loginSuccess: true
          });
        }
      });
    } else { // 406 Not Acceptable
      return res.status(406).json({
        loginSuccess: false,
        message: "Username doesn't exists!"
      });
    }
  });
}

router.post('/register', signupHandler);
router.post('/login', signinHandler);

module.exports = router;
