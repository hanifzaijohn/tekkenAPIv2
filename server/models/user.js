const mongoose = require('mongoose');

// model for users
var Users = mongoose.model('Users', {
  email:{
    type: String,
    required: true,
    minlength:1,
    trim: true
  }
});

//export user model
module.export = {Users};
