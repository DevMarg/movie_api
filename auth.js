const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error) {
                return res.status(500).json({ error: error });
            }
            if (!user) {
                return res.status(401).json({ message: 'Authentication failed', info: info });
            }
            req.login(user, { session: false}, (error) => {
                if (error) {
                    return res.status(500).json({ error: error });
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
}
