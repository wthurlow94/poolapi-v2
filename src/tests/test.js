import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';
import casual from 'casual';
import User from '../models/user.model'
import match from '../models/match.model'
chai.use(chaiHttp);
chai.should();

let playerOne, playerTwo;

describe('Auth', () => {
    var email = casual.email;
    var password = casual.password;
    describe('/register', () => {
        //successful signup

        it('should create a new user record', (done) => {
            chai.request(app)
                .post('/auth/register')
                .send({
                    "email": email,
                    "password": password
                })
                .end((err, res) => {
                    chai.expect(err).to.be.null;
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('message')
                    done();
                });
        })
        //unsuccessful signup - email exists
        it('should not create a new user record', (done) => {
            chai.request(app)
                .post('/auth/register')
                .send({
                    "email": email,
                    "password": password
                })
                .end((err, res) => {
                    chai.expect(err).to.be.null;
                    chai.expect(res).to.have.status(500);
                    done();
                });
        })
    })

    describe('/login', () => {
        //successful login
        it('should log in a user', (done) => {
            chai.request(app)
                .post('/auth/login')
                .send({
                    "email": email,
                    "password": password
                })
                .end((err, res) => {
                    chai.expect(err).to.be.null;
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('token');
                    chai.expect(res.body).to.have.property('message');
                    done();

                });

        })

        //unsuccessful login - incorrect credentials
        it('should not log in a user with incorrect credentials', (done) => {
            chai.request(app)
                .post('/auth/login')
                .send({
                    "email": casual.email,
                    "password": casual.password
                })
                .end((err, res) => {
                    chai.expect(err).to.be.null;
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('message');
                    done();

                });

        })
    })
})

//TODO: wrap all of these behind a token check
describe('Users', () => {
    describe('GET', () => {
        //Get All Users
        it('should get all user records', (done) => {
            chai.request(app)
                .get('/users')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.returnUsers.should.be.an('array');
                    if (res.body.returnUsers.length > 0) {
                        res.body.returnUsers.forEach(user => {
                            user.should.have.property('elo');
                            user.elo.should.be.a('number');
                            user.should.not.have.property('hash');
                            user.should.not.have.property('salt');

                        });
                    }
                    done();

                })

        })
        //Get specific User record by id - positive
        it('should get a user records', (done) => {
            var user = new User({ email: casual.email, hash: 'hash', salt: 'salt' });
            user.save((err, user) => {
                playerOne = user._id;
                chai.request(app)
                    .get('/users/' + user._id)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    })

            });


        })
        //Get specific User record by id - negative
        it('should get a user record', (done) => {
            chai.request(app)
                .get('/users/4f0b935e875985234360dc63')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                })

        })
    })


})


let matchId;
describe('Matches', () => {

    describe('POST', () => {
        describe('/match)', () => {
            it('should create a new match', (done) => {
                var user = new User({ email: casual.email, hash: 'hash', salt: 'salt' });
                user.save((err, user) => {
                    playerTwo = user._id;
                    chai.request(app)
                        .post('/matches')
                        .send({
                            playerOne: playerOne,
                            playerTwo: playerTwo,
                        })
                        .end((err, res) => {
                            matchId = res.body.match._id;
                            chai.expect(res).to.have.status(200);
                            chai.expect(res.body.match).to.have.property('_id');
                            chai.expect(res.body.match).to.have.property('started')
                            done();

                        })
                })

            })

            it('should not create a new match if either player does not exist', (done) => {
                chai.request(app)
                    .post('/matches')
                    .send({
                        playerOne: '6f0c11e5d33df528594e34c4',
                        playerTwo: '6f0c11e3d33df528594e34c2',
                    })
                    .end((err, res) => {
                        chai.expect(res).to.have.status(404);
                        done();

                    })

            })

            it('should not create a new match if an unresulted match exists between two users', (done) => {
                chai.request(app)
                    .post('/matches')
                    .send({
                        playerOne: playerOne,
                        playerTwo: playerTwo,
                    })
                    .end((err, res) => {
                        chai.expect(res).to.have.status(403);
                        done();

                    })

            })

        })
    })
    describe('PATCH', () => {
        describe('/matches/_id', () => {
            //result a match
            it('should result the match', (done) => {
                chai.request(app)
                    .patch('/matches/' + matchId)
                    .send({ winner: playerOne })
                    .end((err, res) => {
                        chai.expect(res).to.have.status(200);
                        chai.expect(res.body.result.match).to.have.property('resulted');
                        chai.expect(res.body.result.match).to.have.property('winner');
                        //Update Winner and Loser ELO scores after resulting
                        chai.expect(res.body.result.winner).to.have.property('newElo').and.does.not.equal(res.body.result.winner.oldELO);
                        chai.expect(res.body.result.loser).to.have.property('newElo').and.does.not.equal(res.body.result.loser.oldELO);

                        done();
                    });
            });


            //Cannot result a match that does not exist
            it('should not result the match if it does not exist', (done) => {
                chai.request(app)
                    .patch('/matches/1f0c11e5d33df528594e34c4')
                    .send({ winner: playerOne })
                    .end((err, res) => {
                        chai.expect(res).to.have.status(404);
                        done();
                    });
            });
            //Should not result the match if the player does not exist
            it('should not result the match if the winner does not exist', (done) => {
                chai.request(app)
                    .patch('/matches/' + matchId)
                    .send({ winner: '2f0c11e5d33df528594e34c4'})
                    .end((err, res) => {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            //Should not result the match if the provided winner is not part of this match
            it('should not result the match if the winner does not exist', (done) => {
                chai.request(app)
                    .patch('/matches/' + matchId)
                    .send({ winner: '5f0cdc61bafb9a33055da2d1'})
                    .end((err, res) => {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            
        })
    })



})

    //describe Match Getters
