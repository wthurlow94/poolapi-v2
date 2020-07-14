import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';
import casual from 'casual';
import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import match from '../models/match.model'
import AuthController from '../controllers/auth.controller';
chai.use(chaiHttp);
chai.should();

let playerOne, playerTwo, token;

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
                    token = res.body.token;
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

    describe('Token Check', () => {
        // it should return a resource for a get request with a valid token
        it('should return a resource for a request with a valid token', async () => {
            var res = await chai.request(app)
                .get('/users')
                .set('Authorization', 'Bearer ' + token);
            res.should.have.status(200);


        })
        // it should not return a resource for a get request without a token
        it('should not return any resource for a request without a token', async () => {
            var res = await chai.request(app)
                .get('/users');
            res.should.have.status(400)





        })

        // // it should not return a resource for a get request with an invalid token
        //  it('should return a resource for a request with a invalid token', async ()=>{
        //     var res = await chai.request(app)
        //         .get('/users')
        //         .set('Authorization', 'Bearer ' + 'xyz'); 
        //     res.should.have.status(500);

        // })
        // it should not return a resource for a get request with an expired token
        // let expiredToken = jwt.sign(
        //     {
        //         _id: 'id',
        //         email: 'email'
        //     },
        //     process.env.JWTSECRET,
        //     {
        //         expiresIn: '1'
        //     }
        // );

        // it('should return a resource for a request with an expired token', (done)=>{
        //     chai.request(app)
        //         .get('/users')
        //         .set('Authorization', 'Bearer ' + expiredToken)
        //         .end((err,res) => {
        //             res.should.have.status(400);
        //             done();
        //         })
        // })

    })
})

describe('Users', () => {
    describe('GET', () => {
        //Get All Users
        it('should get all user records', (done) => {
            chai.request(app)
                .get('/users')
                .set('Authorization', 'Bearer ' + token)
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
                    .set('Authorization', 'Bearer ' + token)
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
                .set('Authorization', 'Bearer ' + token)
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
        describe('/match', () => {
            it('should create a new match', (done) => {
                var user = new User({ email: casual.email, hash: 'hash', salt: 'salt' });
                user.save((err, user) => {
                    playerTwo = user._id;
                    chai.request(app)
                        .post('/matches')
                        .set('Authorization', 'Bearer ' + token)
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
                    .set('Authorization', 'Bearer ' + token)
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
                    .set('Authorization', 'Bearer ' + token)
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
                    .set('Authorization', 'Bearer ' + token)
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
                    .set('Authorization', 'Bearer ' + token)
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
                    .set('Authorization', 'Bearer ' + token)
                    .send({ winner: '2f0c11e5d33df528594e34c4' })
                    .end((err, res) => {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            //Should not result the match if the provided winner is not part of this match
            it('should not result the match if the winner does not exist', (done) => {
                chai.request(app)
                    .patch('/matches/' + matchId)
                    .set('Authorization', 'Bearer ' + token)
                    .send({ winner: '5f0cdc61bafb9a33055da2d1' })
                    .end((err, res) => {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });


        })
    })

    //describe Match Getters
    describe('GET', () => {
        let matchId;
        describe('/matches', () => {
            // should return all matches
            it('should get all matches', (done) => {
                chai.request(app)
                    .get('/matches')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an('object');
                        res.body.matches.should.be.an('array');
                        if (res.body.matches.length > 0) {
                            res.body.matches.forEach(match => {
                                match.should.have.property('playerOne');
                                match.should.have.property('playerTwo');
                                match.should.have.property('started');
                                matchId = match._id;

                            });
                        }
                        done();

                    })
            })

            // Get individual match

            // Get individual match for invalid ID


        })
        describe('/matches/:id', () => {
            it('should return a match for a valid id', (done) => {
                chai.request(app)
                    .get('/matches/' + matchId)
                    .set('Authorization', 'Bearer ' + token)
                    .end((err,res) => {
                        res.should.have.status(200);
                        done();
                    })

            })
        })
    })


})

