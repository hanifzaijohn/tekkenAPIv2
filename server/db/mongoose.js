/* to use mongoose module */
const mongoose = require('mongoose');

/* for deprecation warning about current string parser */
mongoose.set('useNewUrlParser', true);

/* for depecreation warning about collection.ensureIndex */
mongoose.set('useCreateIndex', true);

/*use promises with mongoose funcitons */
mongoose.Promise = global.Promise;

/* use mongodbURI (mongolab / heroku) or use local database */
mongoose.connect(process.env.MONGODB_URI);

/* export mongoose */
module.exports = {mongoose};
