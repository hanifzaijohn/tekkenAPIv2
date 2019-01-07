const mongoose = require('mongoose');

// for deprecation warning about current stirng parser
mongoose.set('useNewUrlParser', true);

// use promises & connect to mongodb server
mongoose.Promise = global.Promise;

//use mongodbURI (mongolab / heroku) or use local database
mongoose.connect(process.env.MONGODB_URI);

// export mongoose
module.exports = {mongoose};
