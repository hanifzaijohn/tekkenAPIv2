const mongoose = require('mongoose');

// model for users
var User = mongoose.model('User', {
  email:{
    type: String,
    required: true,
    minlength:1,
    trim: true
  }
});

//export user model 
module.export = {User};
