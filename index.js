const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express')
const app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

let auth = require('./auth.js')(app);

const passport = require('passport');
require('./passport.js');

//CREATE: Create new user
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username})
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users.create ({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) => {res.status(201).json(user)})
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      }) 
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});


//READ: Get a user by username
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username})
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
})

//READ: Get a movie by title
app.get('/movies/:Title', async(req, res) => {
  await Movies.findOne({ Title: req.params.Title})
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
})

//READ: Get info about a genre by name
app.get('/movies/genre/:genreName', async (req, res) => {
  const { genreName } = req.params;

  Movies.findOne({ 'Genre.Name': genreName })
    .then((movie) => {
      if (!movie) {
        return res.status(404).send(`${genreName} was not found`);
      }
      res.status(200).json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//READ: Get info about a director by name
app.get('/movies/director/:directorName', async (req, res) => { 
  const { directorName } = req.params;

  Movies.findOne({ 'Director.Name': directorName})
    .then((movie) => {
      if (!movie) {
        return res.status(404).send(`${directorName} was not found`);
      }
      res.status(200).json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//READ: Get a list of all movies
app.get('/movies', passport.authenticate('jwt', { session: false}), async (req, res) => {
  await Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
})

//UPDATE: Update user's info by username
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req,res) => {
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }  
  await Users.findOneAndUpdate({ Username: req.params.Username},
    { $set: 
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true})
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
})

//UPDATE: Add a movie to user's list of favorites
app.patch('/users/:Username/movies/:MovieID', async (req,res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username},
    {
      $push: { FavoriteMovies: req.params.MovieID}
    },
    {new: true})
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
})

//DELETE: Delete a movie from user's list of favorites
app.delete('/users/:Username/movies/:MovieID', async (req,res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username},
    {
      $pull: { FavoriteMovies: req.params.MovieID}
    },
    {new: true})
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
})

//DELETE: Delete user by username
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



//Error handling
app.use((err, req, res, next)=>{
    console.error(err.stack);
     return res.status(500).send('Error');
});

//Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});

