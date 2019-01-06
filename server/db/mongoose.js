const mongoose = require('mongoose');

// use promises & connect to mongodb server
mongoose.Promise = global.Promise;

//use mongodbURI (mongolab / heroku) or use local database 
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TekkenMatches', {useNewUrlParser: true});

// export mongoose
module.exports = {mongoose};
