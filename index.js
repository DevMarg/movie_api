const express = require ('express');
const morgan = require('morgan');
const app = express();


let topMovies = [
    {
        title: 'Stalker',
        director: 'Andrei Tarkovsky'
    },
    {
        title: 'La Dolce Vita',
        director: 'Federico Fellini'
    },
    {
        title: 'Blade Runner',
        director: 'Ridley Scott'
    },
    {
        title: 'Parasite',
        director: 'Bong Joon Ho'
    },
    {
        title: 'The Godfather',
        director: 'Francis Ford Coppola'
    },
    {
        title: 'Vertigo',
        director: 'Alfred Hitchcock'
    },
    {
        title: 'Taxi Driver',
        director: 'Martin Scorsese'
    },
    {
        title: 'Mulholland Drive',
        director: 'David Lynch'
    },
    {
        title: 'Goodfellas',
        director: 'Martin Scorsesek'
    },
    {
        title: 'Vertigo',
        director: 'Alfred Hitchcock'
    }

];

app.use(morgan('common'));
app.use(express.static('public'));

//Get requests
app.get('/', (req, res) =>{
    res.send('Welcome to my Movie_API!');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

//Error handling
app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send('Error');
});

//Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});

