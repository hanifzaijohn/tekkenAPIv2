/* to use mongoose ORM */
const mongoose = require('mongoose');

/* to use JSON web tokens */
const jwt = require('jsonwebtoken');

/*  validator is used to check if email for user is a valid email */
const validator = require('validator');

/* to use .pick() what we return in the model -> JSON file */
const _ = require('lodash');

/* to use bcrypt js */
const bcrypt = require('bcryptjs');

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

/* generateAuthToken function for user models (instance method) */
UserSchema.methods.generateAuthToken = function () {
    let user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
      return token;
    });
};

UserSchema.methods.removeToken = function (token) {
  let user = this;

/* pulls all tokens that match token sent in */
  return user.updateOne({
    $pull:{
      tokens: {token}
    }
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
  decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(e){
    return Promise.reject();
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function(email, password){
  var User = this;

  return User.findOne({email}).then((user) => {
    if(!user){
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res){
          resolve(user);
        } else{
          reject();
        }
      });
    });
  });
};

/* (middleware) before we save document, we want to hash password using bcrypt */
UserSchema.pre('save', function (next){
  var user = this;

  /* we only hash password if it was modified (when they create account)*/
  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) =>{
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });


  }else{
    next();
  }
});

/* export schema as model back to user */
var User = mongoose.model('User', UserSchema);
/* export user model */
module.exports = {User};
