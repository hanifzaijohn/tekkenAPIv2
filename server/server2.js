/* get config files */
require('./config/config');


/* set up required modules */

/* express framework */
const express = require('express');

/* to parse json user sends*/
const bodyParser = require('body-parser');

/* used primarily for pick() fields in json file */
const _ = require('lodash');

const cookieParser = require('cookie-parser');

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

/*  use cookie-parser */
app.use(cookieParser());

/* app POST/ match reequest
  creates a new match */
app.post('/matches', authenticate, (req, res) => {

  /* parse the request information into our model form */
  var match = new Match ({
    u_character: req.body.u_character,
    e_character: req.body.e_character,
    stage:req.body.stage,
    won:req.body.won,
    fight_date:req.body.fight_date,
    side_selection:req.body.side_selection,
    _creator:req.user._id
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
app.get('/matches', authenticate, (req,res) => {
  Match.find({
    _creator:req.user._id
  }).then((matches) => {
  res.send({matches});
}, (e) => {
  res.status(400).send(e);
  });
});

/*app GET/ num of Matches*/
app.get('/matches/numofmatches', authenticate, (req,res) => {
  Match.countDocuments({_creator:req.user.id
  }).then((count) => {
    res.send(`Number of matches is ${count}`);
  }, (e) => {
    res.status(400).send(e);
  });
});


/* app GET/:matchid
  gets a match specific to id */
app.get('/matches/:id', authenticate, (req,res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Match.findOne({
    _id: id,
    _creator: req.user._id
  }).then((match) => {
    if(!match){
      return res.status(404).send();
    }
    res.send({match});
  }).catch((e) => {
    res.status(400).send();
  });
});


app.delete('/matches/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Match.findOneAndRemove({
    _id: id,
    _creator:req.user._id
  }).then((match) => {
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
app.patch('/matches/:id', authenticate, (req,res) => {
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

  Match.findOneAndUpdate({
    _id: id,
    _creator:req.user._id
  }, {$set: body}, {new: true}).then((match) => {
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
  //console.log(body);
  /* will save user information to db, will validate itself there */
  var user = new User(body);

  /* promise saving the user document to db
    if it does not save then 400 message will be shown*/
  user.save().then(() => {

    return user.generateAuthToken();
  }).then((token) => {
    res.cookie('usercookie', token, {secure:false});
    //res.header('x-auth',token).send(user);
  }).catch((e) => {
    res.status(400).send();
  })
});

/* GET/users/me
  calls authentication middleware to return information
  about requesting user */
app.get('/users/me', authenticate, (req, res) => {
  console.log('test');
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
      res.cookies('usercookie', token);
      //res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() =>{
    res.clearCookie("usercookie");
    console.log(req.cookie);
    res.status(200).send();
  }, () => {
    res.status(400).send();
  })
});

/* listen on port for connections */
app.listen(port, () => {
  console.log(`Started on ${port}`);
});

/* export app */
module.exports = {app};
