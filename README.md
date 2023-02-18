# Movie Poster Quiz

A simple game that displays an actor's name, along with a movie poster, and asks the user to guess whether the actor is part of the movie's cast. The quiz consists of yes/no questions, and has a 60s timer from the start of the quiz. If the user guesses correctly, the quiz continues with another poster and actor name until the 60s is up. If the user guesses incorrectly, the game is over. Once the game is over, the user's score will be displayed, and the user has an option to restart the quiz.

The movies and actors are fetched from The Movie DB API:
[https://developers.themoviedb.org/](https://developers.themoviedb.org/)


## Running the application

In the root directory, run:

`npm start`

In a browser, open [http://localhost:3000](http://localhost:3000)


## Notes

The main focus of this game is to query the API for the most popular movies, in order to keep it relevant and fun for the user. I created a local cache that stores the top 100 most popular movies.

Since the API contains a large number of actors, I decided that it would be better to fetch the actors from each movie in the cache, instead of fetching all actors, which gives a better chance of showing known actor names. So the cache stores the movies along with a list of actor IDs in each movie.

In order to create a balanced number of 'yes' and 'no' questions, I used a random number generator between 0 and 1. If the number is below 0.5, I select a random actor from all of the stored actors, which makes it highly likely to be a 'no' answer. Otherwise, I select a random actor from the cast of the selected movie, which makes it a 'yes' question. This avoids having exactly a 50-50 split between yes/no, which makes it less predictable.

There are some issues with the API:
- When selecting a random actor, some queries for actor by ID do not return any data, so to work around that I added error handling in `getActor()`, which recursively calls the same function until a valid actor is found.
- Not all movies contain a poster path, so I decided to handle that with a simple condition that does not include movies without a poster path in the cache.
