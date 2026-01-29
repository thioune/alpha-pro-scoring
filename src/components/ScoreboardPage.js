import React, { useContext, useState, useRef, useEffect } from 'react';
import { GameContext } from '../context/GameContext';
import logo from '../assets/logo.png'; // adapte le chemin si besoin
import logoRight from '../assets/logo2.png';



import './ScoreboardPage.css';



const ScoreboardPage = () => {
  const {
    state,
    startGame,
    addPointsToPlayer,
    switchPlayer,
    undoLastAction,
    startGameWithCode,
    endGame,
    enterFoulMode, submitFoul,
    toggleFreeBallMode,
    exitFoulMode,
    updateFrames,
    timer,
    getRemainingPoints
  } = useContext(GameContext);


  const [adminCode, setAdminCode] = useState('');
  const [playerA, setPlayerA] = useState({ name: 'Joueur A', code: null });
  const [playerB, setPlayerB] = useState({ name: 'Joueur B', code: null });
  const [showCodePopup, setShowCodePopup] = useState(false);
const [codeBuffer, setCodeBuffer] = useState('');

  
  const { setState: setGameState } = useContext(GameContext);


  const getBallColor = (value) => {
    switch (value) {
      case 1: return 'red';
      case 2: return 'yellow';
      case 3: return 'green';
      case 4: return 'brown';
      case 5: return 'blue';
      case 6: return 'pink';
      case 7: return 'black';
      default: return 'gray';
    }
  };
  
  const [modeCode, setModeCode] = useState(null); // "A", "B" ou null
  const [codeInput, setCodeInput] = useState('');
  const [message, setMessage] = useState('');
  
  const AdminCodePopup = ({ onCancel, onValidate, codeBuffer }) => {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        color: 'white',
        flexDirection: 'column',
        fontSize: '1.5em',
      }}>
        <div style={{ marginBottom: '20px' }}>Entrez le code admin</div>
        <div style={{
          backgroundColor: '#222',
          padding: '20px',
          borderRadius: '10px',
          fontSize: '2em',
          letterSpacing: '10px',
        }}>
          {'*'.repeat(codeBuffer.length).padEnd(6, '•')}

        </div>
        <div style={{ marginTop: '20px', fontSize: '0.8em' }}>
          Appuyez sur <strong>Entrée</strong> pour valider, <strong>Undo</strong> pour annuler
        </div>
      </div>
    );
  };
  
  
  const popupStyle = {
    position: 'fixed',
    top: '45%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#333',
    color: 'white',
    padding: '70px 100px',
    borderRadius: '12px',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0 0 12px rgba(0,0,0,0.6)',
    zIndex: 9999,
  };
  


  const codeInputRef = useRef(null);
const pageRef = useRef(null);
const [showCodeInput, setShowCodeInput] = useState(false);

useEffect(() => {
  if (showCodeInput && codeInputRef.current) {
    codeInputRef.current.focus();
  }
}, [showCodeInput]);


useEffect(() => {
  if (!state.isGameStarted && codeInputRef.current) {
    codeInputRef.current.focus();
  }
}, [state.isGameStarted]);

useEffect(() => {
  // Au tout premier chargement, focus sur la div principale
  if (pageRef.current) {
    pageRef.current.focus();
  }
}, []);


const handleKeyPress = (e) => {
  const code = e.keyCode || e.which;

  const key = e.key;


  if (showCodePopup) {
    if (code >= 48 && code <= 57) {
      // touches 0 à 9
      if (codeBuffer.length < 6) {
        setCodeBuffer((prev) => prev + String.fromCharCode(code));
      }
} else if (code === 13 || code === 229 || e.code === 'NumpadEnter') {
      // Touche Entrée
      startGameWithCode(codeBuffer); // ✅ La bonne fonction

      setShowCodePopup(false);
    } else if (code === 8) {
      // Touche Undo (Backspace)
      setShowCodePopup(false);
    }
    return; // ⛔ Empêche toute autre action pendant l'authentification
  }

  if (showCodeInput) {
    // Le champ est affiché → rien d'autre ne doit fonctionner ici
    return;
  }

  if (!state.isGameStarted) {
    if (key === '*') {
      setShowCodePopup(true);
      setCodeBuffer('');
      e.preventDefault(); // ⛔ Empêche la saisie du caractère *
    }
    return;
  }
  
  
  if (e.key === '9') {
    if (state.isFoulMode) {
      exitFoulMode(); // ✅ maintenant disponible
    } else {
      enterFoulMode();
    }
  }
  
  if (e.key === '+') {
    updateFrames('B'); // joueur B gagne une frame
    return;
  }
  
  if (e.key === '-') {
    updateFrames('A'); // joueur A gagne une frame
    return;
  }
  
  if (e.key === '.') {
    if (modeCode === null) {
      setModeCode('A');
      setCodeInput('');
      setMessage('🟢 Entrez le code du Joueur A');
    } else if (modeCode === 'A') {
      setModeCode('B');
      setCodeInput('');
      setMessage('🟢 Entrez le code du Joueur B');
    } else {
      setModeCode(null);
      setCodeInput('');
      setMessage('✅ Retour au mode score');
      setTimeout(() => setMessage(''), 2000); // 2 secondes

    }
    return;
  }

  if (modeCode && /^[0-9]$/.test(e.key)) {
    setCodeInput(prev => prev + e.key);
    return;
  }

  if (modeCode && e.key === 'Enter') {
    const stored = JSON.parse(localStorage.getItem('players')) || [];
    const player = stored.find(p => p.code === codeInput);
  
    if (!player) {
      setMessage('❌ Code inconnu. Joueur non affecté.');
    } else {
      if (modeCode === 'A') {
        setPlayerA({ name: player.name, code: player.code }); // adapte selon ton code
        setGameState(prev => ({ ...prev, playerA: { name: player.name, code: player.code } }));

        setMessage(`✅ Joueur A : ${player.name}`);

      } else {
        setPlayerB({ name: player.name, code: player.code }); // adapte selon ton code
        setGameState(prev => ({ ...prev, playerB: { name: player.name, code: player.code } }));

        setMessage(`✅ Joueur B : ${player.name}`);
      }
    }
  
    setCodeInput('');
    return;
  }
  
  
  if (state.isFoulMode && ['4', '5', '6', '7'].includes(e.key)) {
    submitFoul(parseInt(e.key));
  }
  
  if (e.key === '8') {
    toggleFreeBallMode();
    return;
  }
  

  if (!state.isFoulMode && ['1', '2', '3', '4', '5', '6', '7'].includes(key)) {
    const value = parseInt(key);
    addPointsToPlayer(value);
  
    // Si on est en mode Free Ball, on le désactive après un coup
    if (state.freeBallMode) toggleFreeBallMode();
  
    return;
  }
  
  else if (key === '0') {
    switchPlayer();
  } else if (key === 'Backspace') {
    undoLastAction();
  } else if (key === '/') {
    endGame();
  }

  

};


  return (
<>
    <div className="top-bar">
    <img src={logo} alt="Club Logo" className="club-logo" />
    <img src={logoRight} alt="Right Logo" className="logo-right" />
  </div>

  
   
    <div className="scoreboard-container" ref={pageRef} onKeyDown={handleKeyPress} tabIndex="0">
  
    {showCodeInput && (
      <div className="admin-code-input">
        <h3>Admin code required</h3>
        <input
          ref={codeInputRef}
          type="password"
          value={adminCode}
          onChange={(e) => setAdminCode(e.target.value)}
          onKeyDown={(e) => {
  const code = e.keyCode || e.which;
  if (e.key === 'Enter' || e.code === 'NumpadEnter' || code === 13 || code === 229) {
    startGameWithCode(adminCode);
    setAdminCode('');
    setShowCodeInput(false);
    setTimeout(() => {
      pageRef.current?.focus();
    }, 100);
  }
}}

        />
      </div>
    )}

{showCodePopup && (
  <AdminCodePopup
    codeBuffer={codeBuffer}
    onCancel={() => setShowCodePopup(false)}
    onValidate={() => {
      if (codeBuffer === '123456') {
        startGame();
        setShowCodePopup(false);
      }
    }}
  />
)}


    {/* Popup Free Ball */}
{state.freeBallMode && (
  <div className="popup-overlay">
    <div className="popup-box">
      <div>💡 Free Ball Mode</div>
      <div>Select a ball value (1 to 7)</div>
      <div className="cancel-msg">Press FreeBall Button to cancel</div>
    </div>
  </div>
)}

{/* Popup Foul Mode */}
{state.isFoulMode && (
  <div className="popup-overlay">
    <div className="popup-box">
      <div>🚫 Foul Mode</div>
      <div>Select the foul value:</div>
      <div>4 = Brown, 5 = Blue, 6 = Pink, 7 = Black</div>
      <div className="cancel-msg">Press Foul Button to cancel</div>
    </div>
  </div>
)}

{message && (
  <div style={popupStyle}>
    {message}
  </div>
)}
      
<div className={`player-section ${state.activePlayer === 'A' ? 'selected' : ''}`}>

  
    <div className="player-name">{playerA.name}</div>
    <div className="player-score">{state.scoreA}</div>
    <div className="break-label">Break</div>
    <div className="break-score">{state.activePlayer === 'A' ? state.currentBreak : 0}</div>
    <div className="ball-row">
      {state.activePlayer === 'A' &&
        state.currentBreakBalls.map((val, i) => (
          <span key={i} className={`ball ${getBallColor(val)}`}></span>
        ))}
    </div>
    
  </div>

  


  <div className="center-info">

  
  <div className="center-content"></div>
  <div className="game-timer">
  {String(Math.floor(timer / 60)).padStart(2, '0')}:
  {String(timer % 60).padStart(2, '0')}
</div>

  <div className="frames">
  <div className="title">Frames :</div>
  <div className="score">{state.framesA}-{state.framesB}</div>

</div>

    <h2>{state.isGameStarted ? 'Game in progresssssss' : 'No active game'}</h2>

<div className="points">Remaining: {getRemainingPoints()}</div>
    
    <p style={{ opacity: 0.5, fontSize: '14px' }}>⚠️ If you notice an issue, please call the admin or an attendant.</p>

   

  </div>

  <div className={`player-section ${state.activePlayer === 'B' ? 'selected' : ''}`}>
  <div className="player-name">{playerB.name}</div>
    <div className="player-score">{state.scoreB}</div>
    <div className="break-label">Break</div>
    <div className="break-score">{state.activePlayer === 'B' ? state.currentBreak : 0}</div>
    <div className="ball-row">
      {state.activePlayer === 'B' &&
        state.currentBreakBalls.map((val, i) => (
          <span key={i} className={`ball ${getBallColor(val)}`}></span>
        ))}
    </div>
  </div>
</div>

</>
  );
  
};

export default ScoreboardPage;
