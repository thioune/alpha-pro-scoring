import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './HomePage.css';



const HomePage = () => {
  const [adminCode, setAdminCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const correctCode = '123456';

  useEffect(() => {
    if (showCodeInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCodeInput]);

  const handleAdminAccess = () => {
    setShowCodeInput(true);
  };

  const handleCodeSubmit = () => {
    if (adminCode === correctCode) {
      navigate('/admin');
    } else {
      alert('❌ Code incorrect');
    }
    setAdminCode('');
    setShowCodeInput(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCodeSubmit();
    }
  };

  return (
    <div className="home-container">
      <img src={logo} alt="Club Logo" className="home-logo" />

      <div className="button-container">
        <button className="home-btn" onClick={() => navigate('/scoreboard')}>
        🎱 Scoreboard
        </button>
        <button className="home-btn" onClick={handleAdminAccess}>
          🔐 Admin
        </button>
      </div>

      {showCodeInput && (
        <div className="code-popup">
          <h3>Code admin :</h3>
          <input
            ref={inputRef}
            type="password"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      )}
<footer className="footer">
  Created by Alpha Dev Team © 2025
</footer>

    </div>
    
  );
  
};

export default HomePage;
