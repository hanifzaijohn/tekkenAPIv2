// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (err, client) => {
  if (err){
    return console.log('Unable to connect to MongoDB server');
  }

  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp')

  // db.collection('Todos').findOneAndUpdate({
  //   _id : new ObjectID ('5c311bbe2c6c04a94039e234')
  // }, {
  //   $set: {
  //     completed : false
  //   }
  // }, {
  //   returnOriginal: false
  // }).then((result) => {
  //   console.log(result);
  // })

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID ('5c3125d92c6c04a94039e352')
  },{
    $set:{
      name: 'Johnny'
    },
    $inc:{
      age: 1
    }
  }, {
      returnOriginal : false
    }).then((result) => {
    console.log(result);
  });


  client.close();
});
