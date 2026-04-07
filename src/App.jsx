import React from 'react';
import { GameDataProvider, useGameData } from './context/GameDataContext.jsx';
import Dashboard from './components/Dashboard.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';

function AppContent() {
  const { state, dispatch } = useGameData();
  const { activeView } = state;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-dot" />
          <span>SAILOR<span className="logo-accent">PIECE</span></span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 400 }}>
            GAME THEORY ENGINE v1.0
          </span>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'dashboard' })}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab ${activeView === 'config' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'config' })}
          >
            Config
          </button>
        </nav>
      </header>

      {/* Main Content */}
      {activeView === 'dashboard' ? <Dashboard /> : <ConfigPanel />}
    </div>
  );
}

export default function App() {
  return (
    <GameDataProvider>
      <AppContent />
    </GameDataProvider>
  );
}
