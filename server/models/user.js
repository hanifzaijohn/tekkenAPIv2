/* to use mongoose ORM */
const mongoose = require('mongoose');

/*  validator is used to check if email for user is a valid email */
const validator = require('validator');

/* model for users :
  email, password & token
  email must be unqiue
  password must be greater than or equal to 6 characters
*/
var User = mongoose.model('User', {
  email:{
    type: String,
    required: true,
    minlength:1,
    trim: true,
    unique: true, /* will not permit 2 same emails */
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
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

//export user model
module.exports = {User};
