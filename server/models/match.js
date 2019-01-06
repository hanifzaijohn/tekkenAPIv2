const mongoose = require('mongoose');

// model for tekken matches
var Match = mongoose.model('Match', {
  u_character:{
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  e_character:{
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  stage:{
    type: String
  },
  won:{
    type: Boolean,
    required: true
  },
  fight_date:{
    type: Number,
    default: null
  },
  side_selection:{
    type: String,
    default: 'Left'
  }

});

//
module.exports = {Match};
