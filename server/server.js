const express = require('express');
const bodyParser = require('body-parser');

var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Match} = require('./models/match');
var {Users} = require('./models/user');

// create express application
var app = express();

// use environment variable port or local host 3000
const port = process.env.PORT || 3000;

// to be able to recieve json
app.use(bodyParser.json());

// app POST/ match
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

// app GET/ all matches saved in db
app.get('/matches', (req,res) => {
  Match.find().then((matches) => {
  res.send({matches});
}, (e) => {
  res.status(400).send(e);
  });
});

//app GET/ num of Matches
app.get('/matches/numofmatches', (req,res) => {
  Match.countDocuments({}).then((count) => {
    res.send(`Number of matches is ${count}`);
  }, (e) => {
    res.status(400).send(e);
  });
});

//app GET/ winrate
app.get('/matches/winrate', (req, res) => {
  Match.countDocuments({win:true}).then((count) =>{
    res.send(`Number of wins is ${count}`);
  }, (e) => {
    res.status(400).send(e);
  });
});

// app GET/ get single MatchID
// ex /matches/42523432
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
    res.send(match);
  }).catch((e) => {
    res.status(400).send();
  });
});

// listen on port for connections
app.listen(port, () => {
  console.log(`Started on ${port}`);
});

// export app
module.exports = {app};
