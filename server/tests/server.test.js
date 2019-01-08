const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Match} = require('./../models/match');
const {matches, populateMatches, users, populateUsers} = require('./seed/seed');
const {User} = require('./../models/user');


beforeEach(populateUsers);
beforeEach(populateMatches);

/* should create match with valid data */
describe('POST /matches', () => {
  it('should create a new match', (done) => {
    var u_character = 'Jin';
    var e_character = 'Kazuya';
    var won = false;
    var stage = 'Volcano';
    var side_selection = 'Left';

    request(app)
      .post('/matches')
      .send({u_character, e_character, won, stage, side_selection})
      .expect(200)
      .expect((res) => {
        expect(res.body.u_character).toBe(u_character);
        expect(res.body.e_character).toBe(e_character);
        expect(res.body.won).toBe(won);
        expect(res.body.stage).toBe(stage);
        expect(res.body.side_selection).toBe(side_selection);
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }
        Match.find({u_character, e_character, won, stage, side_selection}).then((matches) => {
          expect(matches.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });

  /* should not create match with empty object */
  it('should not Match todo with invalid data', (done) => {
    request(app)
      .post('/matches')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err){
          return done(err);
        }
        Match.find().then((matches) => {
          expect(matches.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

/* checks get all matches */
describe('GET /matches', () => {
  it('should get all matches', (done) => {
    request(app)
      .get('/matches')
      .expect(200)
      .expect((res) => {
        expect(res.body.matches.length).toBe(2)
      })
      .end(done);
    });
});

/* checks for specific match id matches the one in test array */
describe('GET /matches/:id', () => {
  it('should return match doc', (done) => {
    request(app)
    .get(`/matches/${matches[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.match.u_character).toBe(matches[0].u_character)
    })
    .end(done)
  });

  /* it should return 404 if match is not found */
  it('should return 404 if match is not found', (done) => {
    let hexId = new ObjectID().toHexString();
    request(app)
    .get(`/matches/${hexId}`)
    .expect(404)
    .end(done);
  });

  /* it should return 404 if objectID is invalid */
  it('should return 404 for non objectID', (done) => {
    request(app)
    .get('/matches/ae3r23r324')
    .expect(404)
    .end(done);
  });

});

  describe('DELETE /matches/:id', () => {
    it('should remove a match document by id', (done) => {
      let hexId = matches[1]._id.toHexString();

      request(app)
        .delete(`/matches/${hexId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.match._id).toBe(hexId);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          Match.findById(hexId).then((match) => {
            expect(match).toBeFalsy();
            done();
          }).catch((e) => done(e));
        });
    });

    it('should return 404 if todo not found', (done) => {
      let hexId = new ObjectID().toHexString();

      request(app)
        .delete(`/matches/${hexId}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
      request(app)
        .delete('/matches/123abc')
        .expect(404)
        .end(done);
    });
  });

describe('PATCH /matches:/id', () => {
  it('should update the matches notes', (done) =>{
    let hexId = matches[1]._id.toHexString();
    var notes = 'Sample match notes for testing';

    request(app)
      .patch(`/matches/${hexId}`)
      .send({
        notes
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.match.notes).toBe(notes);
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done)=>{
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', (done)=> {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users/', () => {
  it('should create a user', (done) => {
    var email = 'example@gmail.com';
    var password = 'hihihi3';
    request(app)
      .post('/users')
      .send({email,password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err){
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });
  it('should return validation errors if request invalid', (done) => {
    var badEmail = 'kdjafas';
    var badPass = '12345';
    request(app)
      .post('/users')
      .send({badEmail, badPass})
      .expect(400)
      .end(done);

  });
  it('should not create user if email in use', (done) => {
    var dupEmail = 'bebe@gmail.com';
    var passWoord = 'dfasjaklsjf';
    request(app)
      .post('/users')
      .send({dupEmail, passWoord})
      .expect(400)
      .end(done)
  });
});

describe('POST /users/login ', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res)=>{
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err,res) => {
        if(err){
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
    .post('/users/login')
    .send({
      email: users[1].email,
      password: users[1].password + 'Make this fail'
    })
    .expect(400)
    .expect((res) => {
      expect(res.headers['x-auth']).toBeFalsy
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
