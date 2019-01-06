const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Match} = require('./../models/match');

const matches = [{
  u_character : 'Asuka',
  e_character : 'Lili',
  won : 'true',
  stage : 'Kindergym',
  side_selection : 'Right'
}, {
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

// sample post test match
describe('POST /matches', () => {
  it('should create new match', (done) => {
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
          expect(matches.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid data', (done) => {
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

describe('Get/matches', () => {
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
