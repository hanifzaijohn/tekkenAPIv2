const mongoose = require('mongoose');
const {password} = require('secrets');
// use promises & connect to mongodb server
mongoose.Promise = global.Promise;
mongoose.connect((`mongodb://hanifzaij:${password}@ds047478.mlab.com:47478/tekkenmatchapi`, {useNewUrlParser: true}
  || 'mongodb://localhost:27017/TekkenMatches', {useNewUrlParser: true}));

// export mongoose
module.exports = {mongoose};
