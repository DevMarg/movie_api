const express = require('express')
const app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: 'Jessica Drake',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'Ben Cohen',
    favoriteMovies: ['Stalker']
  }  
];

let movies = [
  {
    'Title':'Stalker',
    'Description':'Two men and their guide, a "stalker", travel through a mysterious and forbidden territory in the wilderness called "the zone".',
    'Genre': {
      'Name':'Sci-fi',
      'Description':'Science fiction is a genre of speculative fiction, which typically deals with alternative ways of life made possible by technological change'
    },
    'Director': {
      'Name':'Andrei Tarkovsky',
      'Bio':'Andrei Tarkovsky was a Russian film director and screenwriter. Widely considered one of the greatest and most influential directors in cinema history, Tarkovsky studied film at Moscow`s VGIK under filmmaker Mikhail Romm, and subsequently directed his first five features in the Soviet Union: Ivan`s Childhood (1962), Andrei Rublev (1966), Solaris (1972), Mirror (1975), and Stalker (1979).',
      'Birth': 1932.0
    },
    'ImageURL': 'https://images.app.goo.gl/Z7eMRCpyqnZpnEpN9',
    'Featured':false
  },
  {
    'Title':'La Dolce Vita',
    'Description':'The film stars Marcello Mastroianni as Marcello Rubini, a tabloid journalist who, over seven days and nights, journeys through the "sweet life" of Rome in a fruitless search for love and happiness.',
    'Genre': {
      'Name':'Comedy',
      'Description':'Comedy is a genre of fiction that consists of discourses or works intended to be humorous or amusing.'
    },
    'Director': {
      'Name':'Federico Fellini',
      'Bio':'Federico Fellini was an Italian film director and screenwriter. He is known for his distinctive style, which blends fantasy and baroque images with earthiness.',
      'Birth':1920.0
    },
    'ImageURL': 'https://images.app.goo.gl/Bj5nRDd8tVtf4ovL8',
    'Featured':false
  },
  {
    'Title':'Vertigo',
    'Description':'A former San Francisco police detective juggles wrestling with his personal demons and becoming obsessed with the woman he has been hired to trail, who may be deeply disturbed.',
    'Genre': {
      'Name':'Thriller',
      'Description':'Thrillers are characterized and defined by the moods they elicit, giving their audiences heightened feelings of suspense, excitement, surprise, anticipation and anxiety.'
    },
    'Director': {
      'Name':'Alfred Hitchcock',
      'Bio':'Sir Alfred Joseph Hitchcock was an English film director. He is widely regarded as one of the most influential figures in the history of cinema.',
      'Birth':1899.0
    },
    'ImageURL': 'https://images.app.goo.gl/e8N3aDScKaMd559S6',
    'Featured':false
  },
];

//CREATE: Allow new users to register
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('Please add name');
  }

})

//UPDATE: Allow users to update their name by id
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    return res.status(200).json(user);
  } else {
    return res.status(400).send('User not found');
  }
})

//CREATE: Allow users to add a movie to their list of favorites
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle)
    return res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    return res.status(400).send('User not found');
  }
})

//DELETE: Allow users to remove a movie from their list of favorites
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle)
    return res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    return res.status(400).send('User not found');
  }
})

// READ: Return a list of ALL movies
app.get('/movies', (req, res) => {
    return res.status(200).json(movies);
  });

// READ: Return data about a movie
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title );

  if (movie) {
    return res.status(200).json(movie);
  } else {
    return res.status(400).send('Movie not found');
  }
});

// READ: Return data about a genre
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    return res.status(200).json(genre);
  } else {
    return res.status(400).send('Genre not found');
  }
});

//READ: Return data about a director
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName ).Director;

  if (director) {
    return res.status(200).json(director);
  } else {
    return res.status(400).send('Director not found');
  }
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

