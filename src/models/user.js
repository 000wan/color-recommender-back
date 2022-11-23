const mongoose = require("mongoose");
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
          color: String
        }],
        default: []
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

const UserModel = mongoose.model("user", userSchema);

module.exports = { UserModel };