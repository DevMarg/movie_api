const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

const app = express(),
  bodyParser = require("body-parser");

const passport = require("passport");
require("./passport.js");

const { check, validationResult } = require("express-validator");
const moment = require("moment");
const path = require("path");

// mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "http://localhost:64730",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require("./auth.js")(app);

app.get("/", (req, res) => {
  res.send("Welcome to Movie Spot API");
});

app.get("/documentation", (req, res) => {
  res.sendFile(path.join(__dirname, "public/documentation.html"));
});

//CREATE: Create new user
app.post(
  "/users",
  [
    // Validation logic for request
    check("Username", "Username must be at least 5 characters long.").isLength({
      min: 5,
    }),
    check(
      "Username",
      "Username should only contain letters and numbers."
    ).isAlphanumeric(),
    check("Password", "Password is required.").not().isEmpty(),
    check("Password", "Password must be at least 8 characters long.").isLength({
      min: 8,
    }),
    check("Email", "Email is required").not().isEmpty(),
    check("Email", "Please enter a valid email address.").isEmail(),
    check("Birthday", "Birthday date is required").not().isEmpty(),
    check("Birthday", "Birthday must be in DD/MM/YYYY format.").matches(
      /^\d{2}\/\d{2}\/\d{4}$/
    ),
  ],
  async (req, res) => {
    // Check the validation objects for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }

    // Parse and validate the date
    const birthday = moment(req.body.Birthday, "DD/MM/YYYY", true);
    if (!birthday.isValid()) {
      console.log("Invalid date format:", req.body.Birthday);
      return res
        .status(422)
        .json({ error: [{ msg: "Invalid date format for Birthday" }] });
    }
    console.log("Parsed Birthday:", birthday.toDate());

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: birthday.toDate(),
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

//READ: Get a user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ: Get a movie by title
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ: Get info about a genre by name
app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { genreName } = req.params;

    Movies.findOne({ "Genre.Name": genreName })
      .then((movie) => {
        if (!movie) {
          return res.status(404).send(`${genreName} was not found`);
        }
        res.status(200).json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ: Get info about a director by name
app.get(
  "/movies/director/:directorName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { directorName } = req.params;

    Movies.findOne({ "Director.Name": directorName })
      .then((movie) => {
        if (!movie) {
          return res.status(404).send(`${directorName} was not found`);
        }
        res.status(200).json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ: Get a list of all movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        const hash = crypto
          .createHash("md5")
          .update(JSON.stringify(movies))
          .digest("hex");
        res.setHeader("ETag", hash);
        if (req.headers["if-none-match"] === hash) {
          return res.status(304).end();
        }
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//UPDATE: Update user's info by username
app.put(
  "/users/:Username",
  [
    // Validation logic for request
    check("Username", "Username must be at least 5 characters long.").isLength({
      min: 5,
    }),
    check(
      "Username",
      "Username should only contain letters and numbers."
    ).isAlphanumeric(),
    check("Password", "Password is required.").not().isEmpty(),
    check("Password", "Password must be at least 8 characters long.").isLength({
      min: 8,
    }),
    check("Email", "Email is required").not().isEmpty(),
    check("Email", "Please enter a valid email address.").isEmail(),
    check("Birthday", "Birthday date is required").not().isEmpty(),
    check("Birthday", "Birthday must be in DD/MM/YYYY format.").matches(
      /^\d{2}\/\d{2}\/\d{4}$/
    ),
  ],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("Request User:", req.user);
    console.log("Requested Username:", req.params.Username);

    // Check the validation objects for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }
    // Prevent from updating other user's info
    if (req.user.Username !== req.params.Username) {
      return res.status(403).send("Permission denied");
    }

    let updatedFields = {
      Username: req.body.Username,
      Email: req.body.Email,
      Birthday: moment(req.body.Birthday, "DD/MM/YYYY", true).toDate(),
    };

    // If password is provided, hash it before updating
    if (req.body.Password) {
      updatedFields.Password = Users.hashPassword(req.body.Password);
    }

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $set: updatedFields },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// READ: Get a list of user's favorite movies
app.get(
  '/users/:Username/movies/favorite-movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Verify that the request is for the authenticated user
      if (req.user.Username !== req.params.Username) {
        return res.status(403).send('Permission denied');
      }

      // Fetch the user's document from the database
      const user = await Users.findOne({ Username: req.params.Username }).exec();
      if (!user) {
        return res.status(404).send('User not found');
      }

      // Ensure FavoriteMovies is an array
      if (!Array.isArray(user.FavoriteMovies)) {
        return res.status(500).send('Invalid FavoriteMovies format');
      }

      // Convert IDs to ObjectId with 'new'
      const ObjectId = mongoose.Types.ObjectId;
      const favoriteMovieIds = user.FavoriteMovies.map(id =>
        new ObjectId(id) // Convert each ID to an ObjectId using 'new'
      );

      // Fetch the movies with the given IDs
      const favoriteMovies = await Movies.find({
        _id: { $in: favoriteMovieIds }
      }).exec();

      // Extract movie details
      const favoriteMovieDetails = favoriteMovies.map(movie => ({
        id: movie._id,
        Title: movie.Title,        
      }));

      // Send the movie details as JSON
      res.json(favoriteMovieDetails);
    } catch (err) {
      console.error('Error fetching favorite movies:', err);
      res.status(500).send('Error: ' + err.message);
    }
  }
);

     
//UPDATE: Add a movie to user's list of favorites
app.patch(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    try {
      // Find the user by their username
      const user = await Users.findOne({ Username: req.params.Username });

      if (!user) {
        return res.status(404).send("User not found");
      }

      // Check if the movie ID is already in the favorite movies
      if (user.FavoriteMovies.includes(req.params.MovieID)) {
        return res.status(400).send("Movie already in favorites");
      }

      // Add the movie ID to the favorite movies array
      user.FavoriteMovies.push(req.params.MovieID);
      
      // Save the updated user
      const updatedUser = await user.save();
      
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

//DELETE: Delete a movie from user's list of favorites
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }), // Re-enable authentication
  async (req, res) => {
    // Log the request parameters and user info for debugging
    console.log("Request Params:", req.params);
    console.log("Request User:", req.user);

    // Check if the username in the request matches the authenticated user
    if (req.user.Username !== req.params.Username) {
      console.warn("Permission denied. User does not match.");
      return res.status(403).send("Permission denied");
    }

    try {
      // Log before the update operation
      console.log("Attempting to remove movie:", req.params.MovieID);

      // Attempt to find and update the user
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $pull: { FavoriteMovies: req.params.MovieID }
        },
        { new: true } // Return the updated document
      );

      // Check if the user was found and updated
      if (!updatedUser) {
        console.warn("User not found:", req.params.Username);
        return res.status(404).send("User not found");
      }

      // Log the updated user object
      console.log("Updated User:", updatedUser);
      res.json(updatedUser);
    } catch (err) {
      console.error("Error occurred during movie removal:", err);
      res.status(500).send("Internal server error");
    }
  }
);


//DELETE: Delete user by username
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).send("Error");
});

//Listen for requests (start the server)
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
