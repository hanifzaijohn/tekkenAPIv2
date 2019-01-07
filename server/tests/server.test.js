const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Match} = require('./../models/match');

// test array of objects
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

beforeEach((done) => {
  // whipe all matches before testing & then insert test array of objects
  Match.remove({}).then(() => {
    return Match.insertMany(matches);
  }).then(() => done());
});

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
