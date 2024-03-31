import React from 'react';
import GradesCalculator from "./GradesCalculator/GradesCalculator"; 
import './App.scss';
import AngryDev from "./images/angry-dev.webp";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Grade Genius</h1>
      </header>
      <img alt="angry developer" className="dev-img" src={AngryDev} />
      <main>
        <GradesCalculator />
      </main>
    </div>
  );
}

export default App;
