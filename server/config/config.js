/* sets up enviornment and database connection depending on what we our doing.
  if we are testing, we use test database, if we are developming we use our
  regular database. If we are producing we use the heroku clouddb */
var env = process.env.NODE_ENV || 'development';
console.log('Running Config File', env);

if (env === 'development' || env === 'test'){
  var config = require('./config.json');
  var envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}
