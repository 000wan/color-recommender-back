const mongoose = require("mongoose");
const jwt=require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const OSchemaDefinition = {
  username: {
    type: String
  },
  password: {
    type: String
  },
  log: {
    type: [{
      index: Number,
      color: String,
      timestamp: Date
    }],
    default: []
  },
  token: {
    type: String
  }
};
const OSchemaOptions = { timestamps: true };

const userSchema = mongoose.Schema(OSchemaDefinition, OSchemaOptions);

userSchema.pre('save', function (next) {
  const user = this;
  if(user.isModified('password')){
    // Password Hashing
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if(err) return next(err);
      bcrypt.hash(user.password, salt, (err, hash) => {
        if(err) return next(err);
        user.password = hash;
        next();
      });
    });
  }
  else next();
});

userSchema.methods.comparePassword = function (plainPassword, callback) {
  bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
    if(err) return callback(err);
    callback(null, isMatch);
  });
}

userSchema.methods.generateToken = function (callback) {
  const user = this;
  const token = jwt.sign(user._id.toHexString(), 'secretToken');

  user.token = token;
  user.save(function (err, user) {
    if(err) return callback(err);
    callback(null, user);
  });
}

userSchema.statics.findByToken = function (token, callback) {
  const user = this;
  jwt.verify(token, 'secretToken', function (err, decoded) {
    user.findOne({ "_id": decoded, "token": token }, function (err, user) {
      if(err) return callback(err);
      callback(null, user);
    });
  });
}

const UserModel = mongoose.model("user", userSchema);

module.exports = { UserModel };