/* sets up enviornment and database connection depending on what we our doing.
  if we are testing, we use test database, if we are developming we use our
  regular database. If we are producing we use the heroku clouddb */

var env = process.env.NODE_ENV || 'development';
console.log('env******************', env);

if(env === 'development'){
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TekkenMatches';
}else if (env === 'test'){
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/TekkenMatchesTEST';
}


/* set up required modules */

/* express framework */
const express = require('express');

/* to parse json user sends*/
const bodyParser = require('body-parser');

/* used primarily for pick() fields in json file */
const _ = require('lodash');

/* to validate mongodb IDs */
var {ObjectID} = require('mongodb');

/* use mongoose */
var {mongoose} = require('./db/mongoose');

/* use Match model from seperate file */
var {Match} = require('./models/match');

/* use Users model form serpearte file */
var {User} = require('./models/user');

/* use authenticate middleware */
var {authenticate} = require('./middleware/authenticate');

/* create express application */
var app = express();

/* use environment variable port */
const port = process.env.PORT;

/* parse jason */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* app POST/ match reequest
  creates a new match */
app.post('/matches', (req, res) => {

  /* parse the request information into our model form */
  var match = new Match ({
    u_character: req.body.u_character,
    e_character: req.body.e_character,
    stage:req.body.stage,
    won:req.body.won,
    fight_date:req.body.fight_date,
    side_selection:req.body.side_selection
  });

  /* save recieved match or send error */
  match.save().then((doc) => {
      res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

/* app GET/matches request
  sends back all of users matches stored in db */
app.get('/matches', (req,res) => {
  Match.find().then((matches) => {
  res.send({matches});
}, (e) => {
  res.status(400).send(e);
  });
});

/*app GET/ num of Matches*/
app.get('/matches/numofmatches', (req,res) => {
  Match.countDocuments({}).then((count) => {
    res.send(`Number of matches is ${count}`);
  }, (e) => {
    res.status(400).send(e);
  });
});


/* app GET/:matchid
  gets a match specific to id */
app.get('/matches/:id', (req,res)=> {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Match.findById(id).then((match) => {
    if(!match){
      return res.status(404).send();
    }
    res.send({match});
  }).catch((e) => {
    res.status(400).send();
  });
});


app.delete('/matches/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Match.findByIdAndDelete(id).then((match) => {
    if(!match){
      return res.status(404).send();
    }
    res.send({match});
  }).catch((e) => {
    res.status(400).send();
  });
});
/* app PATCH/:matchid
*/
app.patch('/matches/:id', (req,res) => {
  var id = req.params.id;

  /* users can only send updates to picked properties form body */
  var body = _.pick(req.body, ['notes']);

  /* if not valid id send back 404 */
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  /* if the notes sent with request not a string then set it to NULL */
  if(!(_.isString(body.notes))){
    body.notes = null;
  }

  Match.findByIdAndUpdate(id, {$set: body}, {new: true}).then((match) => {
    if(!match){
      return res.status(404).send();
    }
    res.send({match});
  }).catch((e) => {
    res.status(400).send();
  })

});


/* app /POST/Users
  where users will create there accounts for authorization*/
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  console.log(body);
  /* will save user information to db, will validate itself there */
  var user = new User(body);

  /* promise saving the user document to db
    if it does not save then 400 message will be shown*/
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth',token).send(user);
  }).catch((e) => {
    res.status(400).send();
  })
});

/* GET/users/me
  calls authentication middleware to return information
  about requesting user */
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

/* POST/users/login
   checks users login information to login
   scans our db for email & checks password
   if succeeds we send auth token, if not
   400 message*/

app.post('/users/login', (req, res) => {
  /* pick our arguments from req body */
  var bodye = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(bodye.email, bodye.password).then((user) => {
    user.generateAuthToken().then ((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});


/* listen on port for connections */
app.listen(port, () => {
  console.log(`Started on ${port}`);
});

/* export app */
module.exports = {app};
