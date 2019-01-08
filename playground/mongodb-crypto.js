// const {SHA256} = require('crypto-js');
//
// var message = 'I am user number 3';
//
// var hash = SHA256(message).toString();
//
// console.log(`Message : ${message}\n hash : ${hash}`);
//
// var data = {
//   id : 4
// };
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
//
//
//
// if( resultHash === token.hash){
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed. Do not trust!');
//}

const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id: 10
};

var token = jwt.sign(data, 'secret');
console.log(token);

var decoed = jwt.verify(token, 'secret');
