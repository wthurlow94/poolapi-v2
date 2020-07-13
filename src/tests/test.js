import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';
import casual from 'casual';
import User from '../models/user.model'
chai.use(chaiHttp);
chai.should();

describe('Auth', () => {
    var email = casual.email;
    var password = casual.password;
    describe('/register', () => {
        //successful signup
        
        it('should create a new user record', (done) => {
            chai.request(app)
                .post('/auth/register')
                .send({
                    "email":email,
                    "password":password
                })
                .end((err,res) => {
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
                .end((err,res) => {
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
                .end((err,res) => {
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
                    "email":  casual.email,
                    "password": casual.password
                })
                .end((err,res) => {
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
                    if(res.body.returnUsers.length > 0) {
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
            var user = new User({email: casual.email, hash: 'hash', salt: 'salt' });
            user.save((err, user) => {
                chai.request(app)
                .get('/users/' + user._id)
                .end((err,res) => {
                    res.should.have.status(200);
                    done();
                })

            });
            

        })
        //Get specific User record by id - negative
        it('should get a user record', (done) => {    
            chai.request(app)
            .get('/users/4f0b935e875985234360dc63')
            .end((err,res) => {
                res.should.have.status(404);
                done();
            })            

    })
})


})
