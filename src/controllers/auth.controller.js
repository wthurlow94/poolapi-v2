import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model';
import 'dotenv/config';

class AuthController {

    static register(req, res) {
        var user = new User();
        user.email = req.body.email;

        var passwordElements = AuthController.hashPassword(req.body.password).split('$');
        user.salt = passwordElements[0];
        user.hash = passwordElements[1];

        user.save((err) => {
            if (err)
                return res.status(500).json({
                    message: "Error received: " + err
                })
            return res.status(200).json({
                message: "New User Created"
            })

        });
    }

    static hashPassword(password, salt) {
        if (salt == undefined)
            var salt = crypto.randomBytes(16).toString('base64');

        let hash = crypto.createHmac('sha512', salt).update(password).digest('base64');
        return salt + '$' + hash;
    }


    static async login(req, res) {
        var user = await User.findOne({ email: req.body.email }, (err, user) => {
            if (err)
                return res.status(500).json({
                    message: "Error received: " + err
                });
            return user
        });
        //validate password

        if (user === null || !AuthController.validateHash(user.salt, user.hash, req.body.password))
            return res.status(401).json({
                message: "Incorrect Credentials"
            })

        //generate token
        let token = AuthController.generateToken({ _id: user._id, email: user.email });


        return res.status(200).json({
            user:{_id: user._id,
              email: user.email,
              elo: user.elo  
            },
            token,
            message: "User logged in"
        })
    }

    static validateHash(salt, hash, passwordAttempt) {
        var newHash = AuthController.hashPassword(passwordAttempt, salt).split('$')[1];
        if (newHash == hash) {
            return true;
        }
        return false;

    }

    static generateToken(details) {
        return jwt.sign(
            {
                _id: details._id,
                email: details.email,
            },
            process.env.JWTSECRET,
            {
                expiresIn: '24h'
            }
        );

    }



    static validateToken(req, res, next) {
        let token = req.headers['authorization'];
        if (token) {
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length);
                jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
                    if (err)
                        return res.status(500).json({
                            message: 'Error received: ' + err
                        })
                });
            } else {
                return res.status(400).json({
                    message: 'Missing \'Bearer \' from Authorization header'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Token not provided'
            })
        }

        next();
    }
}

export default AuthController;