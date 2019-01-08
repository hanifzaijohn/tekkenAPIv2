const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Match} = require('./../../models/match');
const {User} = require('./../../models/user');

const firstUserID = new ObjectID();
const secondUserID = new ObjectID();

const users = [{
  _id : firstUserID,
  email: 'bebe@gmail.com',
  password: 'mypasss',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: firstUserID, access: 'auth'}, '1a2b3c').toString()
  }]
}, {
  _id: secondUserID,
  email: 'hihihi@gmail.com',
  password: 'noTokens'
}];

const matches = [{
  _id: new ObjectID(),
  u_character : 'Asuka',
  e_character : 'Lili',
  won : 'true',
  stage : 'Kindergym',
  side_selection : 'Right'
}, {
  _id: new ObjectID(),
  u_character : 'Geese',
  e_character : 'Akuma',
  won : 'false'
}];

const populateMatches = (done) => {
  Match.remove({}).then(() => {
    return Match.insertMany(matches);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    /* waits for all promises, then executes then statement */
    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {matches , populateMatches, users, populateUsers};
