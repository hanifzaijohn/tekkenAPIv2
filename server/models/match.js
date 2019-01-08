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
    type: String,
    default: 'Unavailable'
  },
  won:{
    type: Boolean,
    required: true
  },
  fight_date:{
    type: Date,
    default: new Date().getTime()
  },
  side_selection:{
    type: String,
    default: 'Left'
  },
  notes:{
    type:String,
    default: "No Notes for this match"
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// export match model
module.exports = {Match};
