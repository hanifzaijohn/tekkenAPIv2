const mongoose = require('mongoose');

// use promises
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TekkenMatches', {useNewUrlParser: true});

// export mongoose
module.exports = {mongoose};
