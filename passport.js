const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");
  const bcrypt = require('bcrypt');


let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

// Local Strategy for username/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    async (username, password, callback) => {
      try {
        // Find user by username
        const user = await Users.findOne({ Username: username });

        // If user not found
        if (!user) {
          return callback(null, false, { message: 'Incorrect username' });
        }

        // Validate password
        if (!user.validatePassword(password)) {
          return callback(null, false, { message: 'Incorrect password' });
        }

        // Successful authentication
        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    }
  )
);

// JWT Strategy for token authentication
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "default_jwt_secret", 
    },
    async (jwtPayload, callback) => {
      try {
        // Find user by ID from JWT payload
        const user = await Users.findById(jwtPayload._id);

        // If user not found
        if (!user) {
          return callback(null, false, { message: 'User not found in JWT payload' });
        }

        // Successful authentication
        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    }
  )
);
