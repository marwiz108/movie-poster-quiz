import MovieQuiz from "./components/MovieQuiz";

import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          MOVIE POSTER QUIZ
        </p>
      </header>
      <div className="App-body">
        <MovieQuiz />
      </div>
    </div>
  );
}

export default App;
