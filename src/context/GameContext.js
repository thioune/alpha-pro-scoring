import React, { createContext, useState, useContext } from 'react';
export const GameContext = createContext();

const storedMatches = JSON.parse(localStorage.getItem('matches')) || [];



export const GameContextProvider = ({ children }) => {
  const [matches, setMatches] = useState(storedMatches);
  const [timer, setTimer] = useState(0); // en secondes
const [timerInterval, setTimerInterval] = useState(null);




  const [state, setState] = useState({
    scoreA: 0,
    scoreB: 0,
    playerA: { name: 'Joueur A', code: null },
    playerB: { name: 'Joueur B', code: null },

    activePlayer: 'A',
    currentBreak: 0,
    isGameStarted: false,
    gameCount: 0,
    matchHistory: [],
    startTime: null,
    currentBreakBalls: [], // 🟢 mémoire visuelle des boules pendant le break
    isFoulMode: false,
    freeBallMode: false,
    framesA: 0,
    framesB: 0,
    ballHistory: [], // nouveau tableau pour stocker uniquement les boules
    

    



    // ✅ ajoute cette ligne :
    actionHistory: [],
  
  });

  const addPointsToPlayer = (points) => {
    setState(prev => {
      if (prev.isFoulMode) {
        // Si on est en mode faute, on ignore l’ajout de points
        return prev;
      }
  
      let newScoreA = prev.scoreA;
      let newScoreB = prev.scoreB;
      let newBreak = prev.currentBreak + points;
  
      if (prev.activePlayer === 'A') {
        newScoreA += points;
      } else {
        newScoreB += points;
      }
  
      const newHistory = [
        ...prev.actionHistory,
        {
          player: prev.activePlayer,
          points,
          ball: points,
          freeBall: false
        }
      ].slice(-5);
      
  
      const newBreakBalls =
        points >= 1 && points <= 7
          ? [...prev.currentBreakBalls, points]
          : [...prev.currentBreakBalls];
  
      return {
        ...prev,
        scoreA: newScoreA,
        scoreB: newScoreB,
        currentBreak: newBreak,
        actionHistory: newHistory,
        currentBreakBalls: newBreakBalls,
        ballHistory: [...prev.ballHistory, points],
      };
    });
  };
  
  

  
  

  const switchPlayer = () => {
    setState(prev => ({
      ...prev,
      activePlayer: prev.activePlayer === 'A' ? 'B' : 'A',
      currentBreak: 0,
      currentBreakBalls: [],
    }));
  };
  
  
  

  const undoLastAction = () => {
    setState(prev => {
      if (prev.actionHistory.length === 0) return prev;
  
      const lastAction = prev.actionHistory[prev.actionHistory.length - 1];
      const updatedHistory = prev.actionHistory.slice(0, -1);
  
      let newScoreA = prev.scoreA;
      let newScoreB = prev.scoreB;
      let newBreak = prev.currentBreak;
  
      if (lastAction.player === 'A') {
        newScoreA -= lastAction.points;
      } else {
        newScoreB -= lastAction.points;
      }
  
      // Si c'était le joueur actif → on retire aussi du break
      if (lastAction.player === prev.activePlayer) {
        newBreak -= lastAction.points;
      }
  
      return {
        ...prev,
        scoreA: newScoreA,
        scoreB: newScoreB,
        currentBreak: Math.max(0, newBreak),
        actionHistory: updatedHistory,
        currentBreakBalls: prev.currentBreakBalls.slice(0, -1),
      };
    });
  };
  

  const resetGame = () => {
    setState({
      ...state,
      scoreA: 0,
      scoreB: 0,
      currentBreak: 0,
      activePlayer: 'A',
    });
  };

  const startGameWithCode = (code) => {
    if (code === '123456') {
      setState(prev => ({
        ...prev,
        isGameStarted: true,
        startTime: new Date().toLocaleTimeString(),
      }));
    } else {
      alert("Code administrateur incorrect.");
    }
    setTimer(0); // reset timer
const interval = setInterval(() => {
  setTimer(prev => prev + 1);
}, 1000);
setTimerInterval(interval);

  };
  

  const endGame = () => {
    const { scoreA, scoreB, playerA, playerB, startTime,  } = state;
  
    // Gérer le cas d’égalité
    if (scoreA === scoreB) {
      alert("Égalité détectée. Modifie un score avant de terminer la partie.");
      return;
    }
  
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
    

    const winner = scoreA > scoreB ? playerA : playerB;
  
    const newMatch = {
      startTime: startTime || new Date().toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      playerA: playerA,
      playerB: playerB,
      scoreA,
      scoreB,
      winner,
    };
    
    saveMatchToDailyStorage(newMatch); // ✅ sauvegarde dans dailyMatches par date


    setMatches(prev => [...prev, newMatch]); 
    const updatedMatches = [...matches, newMatch];
    setMatches(updatedMatches);
    localStorage.setItem('matches', JSON.stringify(updatedMatches));
    
    incrementDailyMatchCount();



    setState(prev => ({
      ...prev,
      scoreA: 0,
      scoreB: 0,
      currentBreak: 0,
      activePlayer: 'A',
      isGameStarted: false,
      gameCount: prev.gameCount + 1,
      matchHistory: [...prev.matchHistory, newMatch],
      startTime: null,
      currentBreakBalls: [],      // Vide les boules affichées
actionHistory: [],          // (optionnel mais conseillé)
ballHistory: []
    }));
  };

  const enterFoulMode = () => {
    setState(prev => ({
      ...prev,
      isFoulMode: true,
    }));
  };
  
  const exitFoulMode = () => {
    setState(prev => ({ ...prev, isFoulMode: false }));
  };
  
  
  const submitFoul = (foulValue) => {
    setState(prev => {

      const opponent = prev.activePlayer === 'A' ? 'B' : 'A';
      let newScoreA = prev.scoreA;
      let newScoreB = prev.scoreB;
  
      if (prev.activePlayer === 'A') {
  newScoreA += foulValue;
} else {
  newScoreB += foulValue;
}

      return {
        ...prev,
        scoreA: newScoreA,
        scoreB: newScoreB,
        isFoulMode: false,
        // Ne touche pas au break
        // Ne touche pas aux currentBreakBalls
      };
    });
  };
  
  const toggleFreeBallMode = () => {
    setState(prev => ({
      ...prev,
      freeBallMode: !prev.freeBallMode,
    }));
  };

  const calculateRemainingPoints = () => {
    const totalReds = 15;
    const finalColors = 27;
  
    const ballHistory = state.ballHistory;
    const actions = state.actionHistory;
  
    // Compter les rouges
    const redsPotted = ballHistory.filter(b => b === 1).length;
    const redsRemaining = totalReds - redsPotted;
  
    if (redsRemaining > 0) {
      return redsRemaining * 8 + finalColors;
    }
  
    // 🔍 Chercher la dernière rouge
    let redCount = 0;
    let lastRedIndex = -1;
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].ball === 1) {
        redCount++;
        if (redCount === totalReds) {
          lastRedIndex = i;
          break;
        }
      }
    }
  
    if (lastRedIndex === -1) {
      console.log("🔴 Erreur : dernière rouge non trouvée");
      return finalColors;
    }
  
    const lastRedPlayer = actions[lastRedIndex]?.player;
    const afterLastRed = actions.slice(lastRedIndex + 1);
  
    const colorsToSubtract = [];
    let firstColorSkipped = false;
  
    for (let i = 0; i < afterLastRed.length; i++) {
      const action = afterLastRed[i];
  
      if (action.ball >= 2 && action.ball <= 7) {
        if (!firstColorSkipped && action.player === lastRedPlayer) {
          console.log("✅ Première couleur ignorée après dernière rouge :", action.ball);
          firstColorSkipped = true;
          continue;
        }
  
        colorsToSubtract.push(action.ball);
        console.log("➖ Couleur soustraite :", action.ball);
      }
    }
  
    const totalSubtracted = colorsToSubtract.reduce((acc, val) => acc + val, 0);
    const remaining = Math.max(0, finalColors - totalSubtracted);
  
    console.log("🎱 Remaining calculé :", remaining);
  
    return remaining;
  };
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  const updateFrames = (player) => {
    setState(prev => {
      let newFramesA = prev.framesA;
      let newFramesB = prev.framesB;
  
      if (player === 'A') newFramesA++;
      if (player === 'B') newFramesB++;
  
      // Réinitialise si un joueur atteint 5
      if (newFramesA >= 6 || newFramesB >= 6) {
        newFramesA = 0;
        newFramesB = 0;
      }
  
      return {
        ...prev,
        framesA: newFramesA,
        framesB: newFramesB
      };
    });
  };
  
  
  
  
  
  
  // 🔁 Initialise le compteur du jour
const getTodayKey = () => {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(5, 0, 0, 0); // 5h du matin

  // Si avant 5h, on compte pour la veille
  if (now < cutoff) now.setDate(now.getDate() - 1);

  return now.toISOString().slice(0, 10); // format YYYY-MM-DD
};

const incrementDailyMatchCount = () => {
  const todayKey = getTodayKey();
  const stored = JSON.parse(localStorage.getItem('dailyMatchCounts')) || {};
  
  // Incrémente le compteur du jour
  stored[todayKey] = (stored[todayKey] || 0) + 1;

  localStorage.setItem('dailyMatchCounts', JSON.stringify(stored));
};

  
const saveMatchToDailyStorage = (match) => {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(5, 0, 0, 0);
  if (now < cutoff) now.setDate(now.getDate() - 1);

  const todayKey = now.toISOString().slice(0, 10);

  const existing = JSON.parse(localStorage.getItem('dailyMatches')) || {};
  const todayMatches = existing[todayKey] || [];

  todayMatches.push(match);
  existing[todayKey] = todayMatches;

  localStorage.setItem('dailyMatches', JSON.stringify(existing));
};


  return (
    <GameContext.Provider value={{ 
      state,
      setState,
      addPointsToPlayer,
      switchPlayer,
      undoLastAction,
      resetGame,
      startGameWithCode,
      endGame,
      enterFoulMode,
      submitFoul,
      toggleFreeBallMode,
      exitFoulMode,
      updateFrames,
      timer,
      remainingPoints: calculateRemainingPoints(),
      getRemainingPoints: () => calculateRemainingPoints(),
      matches,
    }}>
         
      {children}
    </GameContext.Provider>
  );
};

export default GameContextProvider;
