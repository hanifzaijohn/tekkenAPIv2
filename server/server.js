const express = require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Match} = require('./models/match');
var {User} = require('./models/user');

// create express application
var app = express();

// use environment variable port or local host 3000
const port = process.env.PORT || 3000;

// to be able to recieve json
app.use(bodyParser.json());

// create match post request routing
app.post('/matches', (req, res) => {

  var match = new Match ({
    u_character: req.body.u_character,
    e_character: req.body.e_character,
    stage:req.body.stage,
    won:req.body.won,
    fight_date:req.body.fight_date,
    side_selection:req.body.side_selection
  });

  // save recieved match or send error
  match.save().then((doc) => {
      res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// app get we return all matches
app.get('/matches', (req,res) => {
  Match.find().then((matches) => {
  res.send({matches});
}, (e) => {
  res.status(400).send(e);
  });
});
// listen on port for connections
app.listen(port, () => {
  console.log(`Started on ${port}`);
});

// export app
module.exports = {app};
