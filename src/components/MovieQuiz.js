import React, { useEffect, useRef, useState } from "react";

import "./MovieQuiz.css";

const MovieQuiz = () => {

    const apikey = "9883a9d4a00017400ff1e1fc33cfe19d";
    const cache = useRef({});

    const timerRef = useRef(null);

    const [quizStarted, setQuizStarted] = useState(false);
    const [timer, setTimer] = useState(60);
    const [score, setScore] = useState(0);
    const [allActors, setAllActors] = useState([]);
    const [moviePosterPath, setMoviePosterPath] = useState(null);
    const [actorName, setActorName] = useState(null);
    const [actorPresent, setActorPresent] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (Object.keys(cache.current).length === 0) {
            populateCache();
        }
    });

    useEffect(() => {
        if (timer === 0 || gameOver) {
            clearInterval(timerRef.current);
            setGameOver(true);
        }
    }, [timer, gameOver]);
    
    // Populate cache with the top 100 most popular movies
    const populateCache = () => {
        // 5 pages - 20 results per page
        for (let i=1; i <= 5; i++) {
            // get most popular movies by ID and store them in cache
            fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apikey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${i}`)
            .then((res) => res.json())
            .then((result) => {
                result.results.forEach((movie) => {
                    if (movie.poster_path !== null) {
                        cache.current[movie.id] = movie;
                    }
                });

                // get actor IDs for each movie and store them in cache
                Promise.all(
                    Object.keys(cache.current).map((movieId) => {
                        return fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apikey}&language=en-US`)
                        .then((res) => res.json())
                        .then((result) => {
                            cache.current[movieId].actorIds = result.cast.filter(
                                (person) => person.known_for_department === "Acting"
                            )
                            .map((actor) => actor.id);
                        })
                    })
                );
            });
        }
        console.log("Cache populated", cache);
    };

    const getActor = (actorIds) => {
        const actorId = actorIds[Math.floor(Math.random() * actorIds.length)];
        console.log("ACTORID: ", actorId);
        fetch(`https://api.themoviedb.org/3/person/${actorId}?api_key=${apikey}&language=en-US`)
        .then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error("Actor ID not found");
            }
        })
        .then((result) => {
            setActorName(result.name);
        })
        .catch((error) => {
            console.log("Error getting actor name", error);
        });
    };

    const generateQuestion = () => {
        const allActors = Object.values(cache.current).flatMap((movie) => movie.actorIds);

        const randomIndex = Math.floor(Math.random() * Object.keys(cache.current).length);
        const movie = cache.current[Object.keys(cache.current)[randomIndex]];

        // random number between 0-1 to balance yes/no answers
        const randomNumber = Math.random();
        if (randomNumber < 0.5) {
            // get random actor from all actors - likely to be a NO answer
            console.log("!!! NO !!!");
            const actorId = allActors[Math.floor(Math.random() * allActors.length)];
            getActor(actorId);
            setActorPresent(movie.actorIds.includes(actorId));
        } else {
            // get random actor from the movie cast - YES answer
            console.log("!!! YES !!!");
            const actorId = movie.actorIds[Math.floor(Math.random() * movie.actorIds.length)];
            getActor(actorId);
            setActorPresent(movie.actorIds.includes(actorId));
        }

        setMoviePosterPath(movie.poster_path);
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        return () => clearInterval(timerRef);
    };

    const handleStartButtonClick = () => {
        // setAllActors(Object.values(cache).flatMap((movie) => movie.actorIds));
        setQuizStarted(true);
        generateQuestion();
        startTimer();
    };

    const handleAnswerChange = (value) => {
        setAnswer(value);
    };

    const handleAnswerSubmit = () => {
        if (actorPresent === answer) {
            setScore((prevScore) => prevScore + 1);
            generateQuestion();
            setAnswer(null);
            console.log(actorPresent);
        } else {
            console.log("GAME OVER");
            setGameOver(true);
        }
    };

    const handleRestart = () => {
        setGameOver(false);
        setQuizStarted(false);
        setTimer(60);
        setScore(0);
        setMoviePosterPath(null);
        setActorName(null);
        setActorPresent(null);
        setAnswer(null);
    };

    return (
        <div className="movie-quiz">
            <p><b>Is the actor part of the movie's cast?</b></p>
            <p>TIME LEFT: {timer}s</p>
            {!quizStarted &&
                <button type="button" onClick={handleStartButtonClick}>START GAME</button>
            }
            {quizStarted && !gameOver &&
                <div className="movie-actor">
                    <h2>{actorName}</h2>
                    <img src={`https://image.tmdb.org/t/p/w500${moviePosterPath}`} alt="ALT" />
                    <div>
                        <label>
                            <input
                                type="radio"
                                value={true}
                                checked={answer === true}
                                onChange={() => handleAnswerChange(true)}
                            />
                            YES
                        </label>
                        <label>
                            <input
                                type="radio"
                                value={false}
                                checked={answer === false}
                                onChange={() => handleAnswerChange(false)}
                            />
                            NO
                        </label>
                    </div>
                    <button onClick={handleAnswerSubmit}>SUBMIT ANSWER</button>
                </div>
            }
            {gameOver &&
                <div>
                    <h2>GAME OVER!</h2>
                    <p>Your total score is {score}</p>
                    <button type="button" onClick={handleRestart}>RESTART</button>
                </div>
            }
        </div>
    );
}

export default MovieQuiz;
