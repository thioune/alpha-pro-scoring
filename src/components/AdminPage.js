import React, { useEffect, useState } from 'react';

const AdminPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerCode, setNewPlayerCode] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [editedPlayers, setEditedPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('matches'); // "matches" ou "players"




  function getTodayKey() {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(5, 0, 0, 0);
    if (now < cutoff) now.setDate(now.getDate() - 1);
    return now.toISOString().slice(0, 10);
  }

  const handleAddPlayer = () => {
    if (!newPlayerName || !newPlayerCode) {
      setPlayerError("🛑 Nom et code obligatoires");
      return;
    }
  
    // Vérifie si le code est déjà pris
    const exists = players.some(p => p.code === newPlayerCode);
    if (exists) {
      setPlayerError("⚠️ Code joueur déjà utilisé");
      return;
    }
  
    const newPlayer = {
      name: newPlayerName,
      code: newPlayerCode,
    };
  
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
  
    // Reset form
    setNewPlayerName('');
    setNewPlayerCode('');
    setPlayerError('');
  };
  
  const handlePlayerChange = (index, field, value) => {
    const updated = [...editedPlayers];
    updated[index][field] = value;
    setEditedPlayers(updated);
  };

  const savePlayer = (index) => {
    const updated = [...editedPlayers];
    const newPlayers = [...players];
    newPlayers[index] = updated[index];
    setPlayers(newPlayers);
    setEditedPlayers(newPlayers);
    localStorage.setItem('players', JSON.stringify(newPlayers));
  };

  const deletePlayer = (index) => {
    const updated = players.filter((_, i) => i !== index);
    setPlayers(updated);
    setEditedPlayers(updated);
    localStorage.setItem('players', JSON.stringify(updated));
  };
  

  useEffect(() => {
    const storedPlayers = JSON.parse(localStorage.getItem('players')) || [];
    setPlayers(storedPlayers);
    setEditedPlayers(storedPlayers);
  }, []);
  
  useEffect(() => {
    const allMatches = JSON.parse(localStorage.getItem('dailyMatches')) || {};
    setMatches(allMatches[selectedDate] || []);
  }, [selectedDate]);

  const getPlayerStatsTable = () => {
    const allMatches = JSON.parse(localStorage.getItem('dailyMatches')) || {};
    const matchList = Object.values(allMatches).flat();
    const stats = {};
  
    players.forEach(p => {
      stats[p.code] = {
        name: p.name,
        code: p.code,
        won: 0,
        lost: 0,
      };
    });
  
    matchList.forEach(match => {
      const winnerCode = match.winner?.code || match.winner;
      const codeA = match.playerA?.code || match.playerA;
      const codeB = match.playerB?.code || match.playerB;
  
      if (winnerCode && stats[winnerCode]) stats[winnerCode].won += 1;
  
      const loserCode = (winnerCode === codeA) ? codeB : codeA;
      if (loserCode && stats[loserCode]) stats[loserCode].lost += 1;
    });
  
    return Object.values(stats).map(p => ({
      ...p,
      ratio: (p.won + p.lost > 0)
        ? Math.round((p.won / (p.won + p.lost)) * 100)
        : 0,
    }));
  };
  

  return (


    
    <div style={{ padding: '20px', color: 'white' }}>

<div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
  <button
    onClick={() => setActiveTab('matches')}
    style={{
      padding: '8px 14px',
      backgroundColor: activeTab === 'matches' ? '#007bff' : '#444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    }}


  >🗓️ Fiche du jour
  </button>
  <button
    onClick={() => setActiveTab('players')}
    style={{
      padding: '8px 14px',
      backgroundColor: activeTab === 'players' ? '#28a745' : '#444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    }}
  >
    👥 Joueurs
  </button>
</div>




{activeTab === 'players' && (
  <>

<h2 style={{ marginTop: '40px' }}>👤 Ajouter un joueur au club</h2>

<div style={{ marginBottom: '10px' }}>
  <input
    type="text"
    placeholder="Nom du joueur"
    value={newPlayerName}
    onChange={(e) => setNewPlayerName(e.target.value)}
    style={{ padding: '8px', marginRight: '10px', borderRadius: '6px' }}
  />
  <input
    type="text"
    placeholder="Code joueur"
    value={newPlayerCode}
    onChange={(e) => setNewPlayerCode(e.target.value)}
    style={{ padding: '8px', marginRight: '10px', borderRadius: '6px' }}
  />
  <button
    onClick={handleAddPlayer}
    style={{
      padding: '8px 14px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }}
  >
    ➕ Ajouter
  </button>
</div>

{playerError && (
  <div style={{ color: 'orange', marginBottom: '10px' }}>
    {playerError}
  </div>
)}

<h2 style={{ marginTop: '40px' }}>📊 Joueurs & statistiques</h2>

<table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
  <thead>
    <tr>
      <th style={thStyle}>Nom</th>
      <th style={thStyle}>Code</th>
      <th style={thStyle}>Gagnés</th>
      <th style={thStyle}>Perdus</th>
      <th style={thStyle}>Ratio (%)</th>
    </tr>
  </thead>
  <tbody>
  {editedPlayers.map((player, index) => {
    const stats = getPlayerStatsTable().find(p => p.code === player.code) || { won: 0, lost: 0, ratio: 0 };
    return (
      <tr key={index}>
        <td style={tdStyle}>
          <input
            type="text"
            value={player.name}
            onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
            style={{ width: '30%', padding: '5px' }}
          />
        </td>
        <td style={tdStyle}>
          <input
            type="text"
            value={player.code}
            onChange={(e) => handlePlayerChange(index, 'code', e.target.value)}
            style={{ width: '30%', padding: '5px' }}
          />
        </td>
        <td style={tdStyle}>{stats.won}</td>
        <td style={tdStyle}>{stats.lost}</td>
        <td style={tdStyle}>{stats.ratio}</td>
        <td style={tdStyle}>
          <button onClick={() => savePlayer(index)}>💾</button>
          <button onClick={() => deletePlayer(index)} style={{ marginLeft: '8px' }}>🗑️</button>
        </td>
      </tr>
    );
  })}
</tbody>

</table>
</>
)}
{activeTab === 'matches' && (
  <>
      <h2 style={{ textAlign: 'center' }}>📋 Fiche du jour</h2>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="datePicker">Sélectionner une date : </label>
        <input
          type="date"
          id="datePicker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '6px',
            backgroundColor: '#222',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '5px',
          }}
        />
      </div>

      <h3>🟢 Total de matchs : {matches.length}</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Heure début</th>
            <th style={thStyle}>Heure fin</th>
            <th style={thStyle}>Joueur A</th>
            <th style={thStyle}>Score A</th>
            <th style={thStyle}>Joueur B</th>
            <th style={thStyle}>Score B</th>
            <th style={thStyle}>Gagnant</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr key={index}>
              <td style={tdStyle}>{match.startTime}</td>
              <td style={tdStyle}>{match.endTime}</td>
              <td style={tdStyle}>{getName(match.playerA)}</td>
              <td style={tdStyle}>{match.scoreA}</td>
              <td style={tdStyle}>{getName(match.playerB)}</td>
              <td style={tdStyle}>{match.scoreB}</td>
              <td style={tdStyle}>{getName(match.winner)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </>
)}
    </div>
  );
};

function getName(entry) {
  if (!entry) return '—';
  return typeof entry === 'object' ? entry.name : entry;
}

const thStyle = {
  padding: '8px',
  border: '1px solid #ccc',
  backgroundColor: '#222',
  color: 'white',
  fontWeight: 'bold',
  textAlign: 'center',
};

const tdStyle = {
  padding: '8px',
  border: '1px solid #ccc',
  textAlign: 'center',
  backgroundColor: '#111',
  color: 'white',
};

export default AdminPage;
