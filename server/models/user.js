/* to use mongoose ORM */
const mongoose = require('mongoose');

/* to use JSON web tokens */
const jwt = require('jsonwebtoken');

/*  validator is used to check if email for user is a valid email */
const validator = require('validator');

/* to use .pick() what we return in the model -> JSON file */
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
  email:{
    type: String,
    required: true,
    minlength:1,
    trim: true,
    unique: true, /* will not permit 2 same emails */
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid email`
    }
  },
  password:{
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

/* what gets sent when a mongoose model is converted into JSON */
UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();

/* only return id and email for security purposes */
  return _.pick(userObject, ['_id', 'email']);
};

/* generateAuthToken function for user models */
UserSchema.methods.generateAuthToken = function () {
    let user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, '1a2b3c').toString();
    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
      return token;
    });
};

/* export schema as model back to user */
var User = mongoose.model('User', UserSchema);
/* export user model */
module.exports = {User};
