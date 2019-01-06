const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Match} = require('./../server/models/match');
const {Users} = require('./../playground/mongoose-queries.js');

var id = '5';

if (!ObjectID.isValid(id)) {
  console.log('ID is not valid!');
}
// Match.find({
//   _id: id
// }).then((matches) => {
//   console.log('Matches', matches);
// });
//
// Match.findOne({
//   _id: id
// }).then((matches) => {
//   console.log('Match ', matches);
// });

Match.findById(id).then((matches) => {
  if(!matches) {
    return console.log('Match was not found!');
  }
  console.log('Match by ID', matches);
}).catch((e) => console.log(e));
