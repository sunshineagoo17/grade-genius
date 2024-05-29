import React from 'react';
import GradesCalculator from './components/GradesCalculator/GradesCalculator'
import DragAndDrop from './components/DragAndDrop/DragAndDrop';
import './App.scss';
import AngryDev from "./images/angry-dev.webp";

function App() {
  return (
    <DragAndDrop>
      <div className="App">
        <header className="App-header">
          <h1>Grade Genius</h1>
        </header>
        <img alt="angry developer" className="dev-img" src={AngryDev} />
        <main>
          <GradesCalculator />
        </main>
      </div>
    </DragAndDrop>
  );
}

export default App;