import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ScoreboardPage from './components/ScoreboardPage';
import GameContextProvider from './context/GameContext';

import AdminPage from './components/AdminPage';






function App() {
  return (
    <GameContextProvider>

    <Router>
      <Routes>
        {/* Page d'accueil */}
        <Route path="/" element={<HomePage />} />

        {/* Scoreboard visible sur TV */}
        <Route path="/scoreboard" element={<ScoreboardPage />} />

        <Route path="/admin" element={<AdminPage />} />

        
      </Routes>
    </Router>
    </GameContextProvider>

  );
}

export default App;
